import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const PDF = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(2048, 0x20)]);
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(512),
]);

describe('POST /api/v1/archivos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let almacen: string;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    PERSONAL: `esc-personal-${marca}@prueba.local`,
    PUBLICO: `esc-publico-${marca}@prueba.local`,
  };
  const prefijo = 'MDA-9995-';
  let ubicacionId: string;
  let tokenPersonal: string;
  const ids: Record<string, string> = {};

  const ingresar = async (correo: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    return (respuesta.body as { tokenAcceso: string }).tokenAcceso;
  };

  const cargar = (piezaId: string, archivo: Buffer, nombre: string, token = tokenPersonal) =>
    request(app.getHttpServer())
      .post('/api/v1/archivos')
      .set('Authorization', `Bearer ${token}`)
      .field('piezaId', piezaId)
      .field('tema', 'Carnaval')
      .field('autor', 'Desconocido')
      .field('palabrasClave', 'Comparsa')
      .field('palabrasClave', 'desfile')
      .attach('archivo', archivo, nombre);

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    // la carpeta de STORAGE_DIR que ve la app; en CI y en local está fuera de git
    almacen = resolve(app.get(ConfigService).get<string>('STORAGE_DIR') ?? './storage');

    const hash = await new BcryptHasherContrasenas().hash(contrasena);
    for (const [rol, correo] of Object.entries(correos)) {
      await prisma.usuario.create({
        data: {
          nombre: `Escaneo ${rol}`,
          correo,
          contrasenaHash: hash,
          rol: rol as 'PERSONAL' | 'PUBLICO',
        },
      });
    }
    const ubicacion = await prisma.ubicacion.create({
      data: { deposito: `Depósito escaneos ${marca}`, estanteria: 'Estantería 1', caja: 'Caja 01' },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    for (const [clave, estado] of [
      ['registrada', 'REGISTRADA'],
      ['otra', 'REGISTRADA'],
      ['publicada', 'PUBLICADA'],
    ] as const) {
      const pieza = await prisma.pieza.create({
        data: {
          codigo: `${prefijo}000${Object.keys(ids).length + 1}`,
          titulo: `Pieza para escanear ${clave}`,
          tipo: 'DOCUMENTO',
          estado,
          ubicacionId,
        },
      });
      ids[clave] = pieza.id;
    }
    tokenPersonal = await ingresar(correos.PERSONAL);
  }, 30_000);

  afterAll(async () => {
    const archivos = await prisma.archivoDigital.findMany({
      where: { pieza: { codigo: { startsWith: prefijo } } },
      select: { rutaAlmacenamiento: true },
    });
    for (const { rutaAlmacenamiento } of archivos) {
      await rm(join(almacen, rutaAlmacenamiento), { force: true });
    }
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('criterio 1: crea el ArchivoDigital EN_REVISION y la pieza pasa a ESCANEADA', async () => {
    const respuesta = await cargar(ids.registrada, PDF, 'Acta de fundación.pdf').expect(201);
    const cuerpo = respuesta.body as {
      id: string;
      estado: string;
      estadoPieza: string;
      nombreOriginal: string;
    };
    expect(cuerpo).toMatchObject({
      estado: 'EN_REVISION',
      estadoPieza: 'ESCANEADA',
      nombreOriginal: 'Acta de fundación.pdf',
    });

    const archivo = await prisma.archivoDigital.findUniqueOrThrow({ where: { id: cuerpo.id } });
    expect(archivo).toMatchObject({
      estado: 'EN_REVISION',
      tipoMime: 'application/pdf',
      tamanoBytes: PDF.length,
    });
    expect(existsSync(join(almacen, archivo.rutaAlmacenamiento))).toBe(true);

    const pieza = await prisma.pieza.findUniqueOrThrow({ where: { id: ids.registrada } });
    expect(pieza).toMatchObject({
      estado: 'ESCANEADA',
      tema: 'Carnaval',
      autor: 'Desconocido',
      palabrasClave: ['comparsa', 'desfile'],
    });
    const eventos = await prisma.eventoPieza.findMany({ where: { piezaId: ids.registrada } });
    expect(eventos.map((e) => e.accion)).toContain('ESCANEADA');
  });

  it('criterio 2: con un archivo EN_REVISION responde 409 y no guarda otro', async () => {
    const respuesta = await cargar(ids.registrada, PNG, 'otra-toma.png').expect(409);
    expect((respuesta.body as { message: string }).message).toMatch(/esperando revisión/);
    expect(await prisma.archivoDigital.count({ where: { piezaId: ids.registrada } })).toBe(1);
  });

  it('solo carga piezas REGISTRADA', async () => {
    await cargar(ids.publicada, PDF, 'tarde.pdf').expect(409);
  });

  it('rechaza un formato no permitido (422), más de 20 MB (413) y sin palabras clave (400)', async () => {
    const ejecutable = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]);
    // una regla del dominio que no se cumple responde 422, como en el resto de la API
    const malo = await cargar(ids.otra, ejecutable, 'virus.pdf').expect(422);
    expect((malo.body as { message: string }).message).toMatch(/formato/);

    const enorme = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(20 * 1024 * 1024)]);
    const grande = await cargar(ids.otra, enorme, 'enorme.pdf').expect(413);
    expect((grande.body as { message: string }).message).toBe('El escaneo pesa más de 20 MB.');

    await request(app.getHttpServer())
      .post('/api/v1/archivos')
      .set('Authorization', `Bearer ${tokenPersonal}`)
      .field('piezaId', ids.otra)
      .field('tema', 'Carnaval')
      .field('autor', 'Desconocido')
      .attach('archivo', PDF, 'sin-palabras.pdf')
      .expect(400);

    const pieza = await prisma.pieza.findUniqueOrThrow({ where: { id: ids.otra } });
    expect(pieza.estado).toBe('REGISTRADA');
  });

  it('solo deja cargar al personal', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/archivos')
      .attach('archivo', PDF, 'a.pdf')
      .expect(401);
    await cargar(ids.otra, PDF, 'a.pdf', await ingresar(correos.PUBLICO)).expect(403);
  });
});
