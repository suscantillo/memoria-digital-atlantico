import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64, 3),
]);
const PDF = Buffer.from('%PDF-1.7\n[DATOS DE PRUEBA]\n');

type Clave = 'imagen' | 'pdf' | 'restringida' | 'enRevision';

describe('GET /api/v1/archivos/:id/contenido según quién lo pide (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let almacen: string;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    PERSONAL: `con-personal-${marca}@prueba.local`,
    PUBLICO: `con-publico-${marca}@prueba.local`,
  };
  const prefijo = 'MDA-9993-';
  const tokens = { PERSONAL: '', PUBLICO: '' };
  const archivos = {} as Record<Clave, string>;
  const rutas: string[] = [];
  let ubicacionId: string;

  const pedir = (clave: Clave, rol?: 'PERSONAL' | 'PUBLICO') => {
    const solicitud = request(app.getHttpServer()).get(
      `/api/v1/archivos/${archivos[clave]}/contenido`,
    );
    return rol ? solicitud.set('Authorization', `Bearer ${tokens[rol]}`) : solicitud;
  };

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
    let personalId = '';
    for (const rol of ['PERSONAL', 'PUBLICO'] as const) {
      const usuario = await prisma.usuario.create({
        data: { nombre: `Contenido ${rol}`, correo: correos[rol], contrasenaHash: hash, rol },
      });
      if (rol === 'PERSONAL') personalId = usuario.id;
      const ingreso = await request(app.getHttpServer())
        .post('/api/v1/auth/ingresar')
        .send({ correo: correos[rol], contrasena })
        .expect(200);
      tokens[rol] = (ingreso.body as { tokenAcceso: string }).tokenAcceso;
    }
    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito contenido ${marca}`,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });

    const casos: [Clave, 'PUBLICADA' | 'ESCANEADA', boolean, 'APROBADO' | 'EN_REVISION', Buffer][] =
      [
        ['imagen', 'PUBLICADA', false, 'APROBADO', PNG],
        ['pdf', 'PUBLICADA', false, 'APROBADO', PDF],
        ['restringida', 'PUBLICADA', true, 'APROBADO', PNG],
        ['enRevision', 'ESCANEADA', false, 'EN_REVISION', PNG],
      ];
    for (const [indice, [clave, estadoPieza, restringida, estado, contenido]] of casos.entries()) {
      const esPdf = contenido === PDF;
      const ruta = `escaneos/pruebas/${marca}-${clave}.${esPdf ? 'pdf' : 'png'}`;
      await mkdir(dirname(join(almacen, ruta)), { recursive: true });
      await writeFile(join(almacen, ruta), contenido);
      rutas.push(ruta);
      const pieza = await prisma.pieza.create({
        data: {
          codigo: `${prefijo}000${indice + 1}`,
          titulo: `Pieza de contenido ${clave} ${marca}`,
          tipo: esPdf ? 'DOCUMENTO' : 'FOTOGRAFIA',
          estado: estadoPieza,
          restringida,
          ubicacionId,
          archivos: {
            create: {
              nombreOriginal: `${clave}.${esPdf ? 'pdf' : 'png'}`,
              rutaAlmacenamiento: ruta,
              tipoMime: esPdf ? 'application/pdf' : 'image/png',
              tamanoBytes: contenido.length,
              estado,
              subidoPorId: personalId,
            },
          },
        },
        include: { archivos: true },
      });
      archivos[clave] = pieza.archivos[0].id;
    }
  }, 30_000);

  afterAll(async () => {
    for (const ruta of rutas) {
      await rm(join(almacen, ruta), { force: true });
    }
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('la imagen aprobada de una pieza publicada se ve sin sesión', async () => {
    const respuesta = await pedir('imagen').expect(200);

    expect(respuesta.headers['content-type']).toBe('image/png');
    expect(respuesta.body as Buffer).toEqual(PNG);
  });

  it('criterio 1: el PDF aprobado responde 401 sin sesión y se abre con una cuenta', async () => {
    const sinSesion = await pedir('pdf').expect(401);
    expect((sinSesion.body as { message: string }).message).toContain('Inicia sesión');

    const conCuenta = await pedir('pdf', 'PUBLICO').expect(200);
    expect(conCuenta.headers['content-type']).toBe('application/pdf');
    await pedir('pdf', 'PERSONAL').expect(200);
  });

  it('el archivo de una pieza restringida no existe para el público y sí para el personal', async () => {
    await pedir('restringida').expect(404);
    await pedir('restringida', 'PUBLICO').expect(404);
    await pedir('restringida', 'PERSONAL').expect(200);
  });

  it('un escaneo en revisión solo lo ve el personal', async () => {
    await pedir('enRevision').expect(404);
    await pedir('enRevision', 'PUBLICO').expect(404);
    await pedir('enRevision', 'PERSONAL').expect(200);
  });

  it('un token inválido responde 401 aunque la imagen sea pública', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/archivos/${archivos.imagen}/contenido`)
      .set('Authorization', 'Bearer no-es-un-token')
      .expect(401);
  });
});
