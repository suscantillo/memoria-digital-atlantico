import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(256, 9),
]);
const CRITERIOS = { legible: true, completa: true, datosCorrectos: true };

interface Archivo {
  id: string;
  revisor: { id: string; nombre: string } | null;
  subidoPor: { id: string };
}

describe('HU-23: asignar el revisor de cada escaneo (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let almacen: string;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const cuentas = {
    admin: { correo: `rev-admin-${marca}@prueba.local`, rol: 'ADMIN', activo: true },
    subio: { correo: `rev-subio-${marca}@prueba.local`, rol: 'PERSONAL', activo: true },
    ana: { correo: `rev-ana-${marca}@prueba.local`, rol: 'PERSONAL', activo: true },
    luis: { correo: `rev-luis-${marca}@prueba.local`, rol: 'PERSONAL', activo: true },
    inactiva: { correo: `rev-inactiva-${marca}@prueba.local`, rol: 'PERSONAL', activo: false },
  } as const;
  type Cuenta = keyof typeof cuentas;
  const ids = {} as Record<Cuenta, string>;
  const tokens = {} as Record<Cuenta, string>;
  const prefijo = 'MDA-9993-';
  let ubicacionId: string;
  const archivos: string[] = [];
  const piezas: string[] = [];

  const como = (quien: Cuenta, metodo: 'get' | 'post', ruta: string) =>
    request(app.getHttpServer())
      [metodo](`/api/v1${ruta}`)
      .set('Authorization', `Bearer ${tokens[quien]}`);

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    almacen = resolve(app.get(ConfigService).get<string>('STORAGE_DIR') ?? './storage');

    const hash = await new BcryptHasherContrasenas().hash(contrasena);
    for (const [clave, cuenta] of Object.entries(cuentas) as [Cuenta, (typeof cuentas)[Cuenta]][]) {
      const fila = await prisma.usuario.create({
        data: {
          nombre: `Revisión ${clave}`,
          correo: cuenta.correo,
          contrasenaHash: hash,
          rol: cuenta.rol,
          activo: cuenta.activo,
        },
      });
      ids[clave] = fila.id;
      if (cuenta.activo) {
        const respuesta = await request(app.getHttpServer())
          .post('/api/v1/auth/ingresar')
          .send({ correo: cuenta.correo, contrasena })
          .expect(200);
        tokens[clave] = (respuesta.body as { tokenAcceso: string }).tokenAcceso;
      }
    }
    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito revisores ${marca}`,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });

    for (const indice of [1, 2, 3]) {
      const pieza = await prisma.pieza.create({
        data: {
          codigo: `${prefijo}000${indice}`,
          titulo: `Pieza para revisar ${indice} ${marca}`,
          tipo: 'FOTOGRAFIA',
          ubicacionId,
        },
      });
      piezas.push(pieza.id);
      const carga = await como('subio', 'post', '/archivos')
        .field('piezaId', pieza.id)
        .field('tema', 'Puerto')
        .field('autor', 'Desconocido')
        .field('palabrasClave', 'muelle')
        .attach('archivo', PNG, `muelle-${indice}.png`)
        .expect(201);
      archivos.push((carga.body as { id: string }).id);
    }
  }, 40_000);

  afterAll(async () => {
    const filas = await prisma.archivoDigital.findMany({
      where: { pieza: { codigo: { startsWith: prefijo } } },
      select: { rutaAlmacenamiento: true },
    });
    for (const { rutaAlmacenamiento } of filas) {
      await rm(join(almacen, rutaAlmacenamiento), { force: true });
    }
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({
      where: { correo: { in: Object.values(cuentas).map((c) => c.correo) } },
    });
    await app.close();
  });

  it('solo el ADMIN asigna y ve la lista de revisores', async () => {
    await como('ana', 'get', '/archivos/revisores').expect(403);
    await como('ana', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: ids.luis })
      .expect(403);

    const respuesta = await como('admin', 'get', '/archivos/revisores').expect(200);
    const correos = (respuesta.body as { correo: string }[]).map((r) => r.correo);
    expect(correos).toEqual(expect.arrayContaining([cuentas.ana.correo, cuentas.luis.correo]));
    expect(correos).not.toContain(cuentas.inactiva.correo);
    expect(correos).not.toContain(cuentas.admin.correo);
  });

  it('criterio 3: sin revisor, un PERSONAL no lo ve en su cola y no puede revisarlo', async () => {
    const cola = await como('ana', 'get', '/archivos')
      .query({ estado: 'EN_REVISION', limite: 100 })
      .expect(200);
    expect((cola.body as { datos: Archivo[] }).datos.map((a) => a.id)).not.toContain(archivos[0]);

    // aunque pida «ninguno», un PERSONAL solo recibe lo suyo
    const forzada = await como('ana', 'get', '/archivos')
      .query({ estado: 'EN_REVISION', revisor: 'ninguno', limite: 100 })
      .expect(200);
    expect((forzada.body as { datos: Archivo[] }).datos).toEqual([]);

    await como('ana', 'post', `/archivos/${archivos[0]}/aprobar`).send(CRITERIOS).expect(403);

    const delAdmin = await como('admin', 'get', '/archivos')
      .query({ estado: 'EN_REVISION', revisor: 'ninguno', limite: 100 })
      .expect(200);
    expect((delAdmin.body as { datos: Archivo[] }).datos.map((a) => a.id)).toEqual(
      expect.arrayContaining(archivos),
    );
  });

  it('criterio 4: no se asigna a quien subió el escaneo', async () => {
    const respuesta = await como('admin', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: ids.subio })
      .expect(422);
    expect((respuesta.body as { message: string }).message).toContain(
      'Nadie revisa su propio escaneo',
    );
    await como('admin', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: ids.inactiva })
      .expect(422);
    await como('admin', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: 'no-es-un-id' })
      .expect(400);
  });

  it('criterio 1: asignado a Ana, aparece en su cola y queda en el historial', async () => {
    const respuesta = await como('admin', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: ids.ana })
      .expect(200);
    expect((respuesta.body as Archivo).revisor).toMatchObject({ id: ids.ana });

    const cola = await como('ana', 'get', '/archivos').query({ estado: 'EN_REVISION' }).expect(200);
    expect((cola.body as { datos: Archivo[] }).datos.map((a) => a.id)).toEqual([archivos[0]]);

    const evento = await prisma.eventoPieza.findFirstOrThrow({
      where: { piezaId: piezas[0], accion: 'REVISOR_ASIGNADO' },
    });
    expect(evento.usuarioId).toBe(ids.admin);
    expect(evento.detalle).toContain('Revisión ana');
  });

  it('criterio 2: otro PERSONAL recibe 403; el revisor asignado y el ADMIN sí pueden', async () => {
    await como('luis', 'post', `/archivos/${archivos[0]}/aprobar`).send(CRITERIOS).expect(403);
    await como('luis', 'post', `/archivos/${archivos[0]}/rechazar`)
      .send({ motivoRechazo: 'Borrosa' })
      .expect(403);
    // quien lo subió tampoco: no es el revisor
    await como('subio', 'post', `/archivos/${archivos[0]}/aprobar`).send(CRITERIOS).expect(403);

    await como('ana', 'post', `/archivos/${archivos[0]}/aprobar`).send(CRITERIOS).expect(200);

    await como('admin', 'post', `/archivos/${archivos[1]}/asignar`)
      .send({ revisorId: ids.luis })
      .expect(200);
    await como('admin', 'post', `/archivos/${archivos[1]}/rechazar`)
      .send({ motivoRechazo: 'Recortada' })
      .expect(200);
  });

  it('no se asigna un escaneo ya revisado', async () => {
    await como('admin', 'post', `/archivos/${archivos[0]}/asignar`)
      .send({ revisorId: ids.luis })
      .expect(409);
  });

  it('«Mis escaneos»: con subidoPor=yo cada quien ve lo que subió', async () => {
    const mios = await como('subio', 'get', '/archivos')
      .query({ subidoPor: 'yo', limite: 100 })
      .expect(200);
    const datos = (mios.body as { datos: Archivo[] }).datos;
    expect(datos.map((a) => a.id)).toEqual(expect.arrayContaining(archivos));
    expect(datos.every((a) => a.subidoPor.id === ids.subio)).toBe(true);

    const deAna = await como('ana', 'get', '/archivos').query({ subidoPor: 'yo' }).expect(200);
    expect((deAna.body as { datos: Archivo[] }).datos).toEqual([]);
  });
});
