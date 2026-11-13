import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(256, 7),
]);

describe('GET /api/v1/archivos/:id/contenido (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let almacen: string;
  const marca = randomUUID().slice(0, 8);
  const prefijo = 'MDA-9994-';
  const carpeta = `e2e-contenido-${marca}`;
  let ubicacionId: string;
  let usuarioId: string;
  const archivos: Record<string, string> = {};

  // pieza en `estadoPieza`, con un archivo `estadoArchivo` guardado (o no) en el almacenamiento
  const casos = [
    ['publico', 'PUBLICADA', false, 'APROBADO', true],
    ['restringido', 'PUBLICADA', true, 'APROBADO', true],
    ['sinPublicar', 'REVISADA', false, 'APROBADO', true],
    ['enRevision', 'PUBLICADA', false, 'EN_REVISION', true],
    ['perdido', 'PUBLICADA', false, 'APROBADO', false],
  ] as const;

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    almacen = resolve(app.get(ConfigService).get<string>('STORAGE_DIR') ?? './storage');
    await mkdir(join(almacen, carpeta), { recursive: true });

    const usuario = await prisma.usuario.create({
      data: {
        nombre: 'Contenido e2e',
        correo: `contenido-${marca}@prueba.local`,
        contrasenaHash: 'x',
        rol: 'PERSONAL',
      },
    });
    usuarioId = usuario.id;
    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito contenido ${marca}`,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
    ubicacionId = ubicacion.id;

    for (const [i, [clave, estadoPieza, restringida, estadoArchivo, guardado]] of casos.entries()) {
      const ruta = `${carpeta}/${clave}.png`;
      if (guardado) await writeFile(join(almacen, ruta), PNG);
      const pieza = await prisma.pieza.create({
        data: {
          codigo: `${prefijo}000${i + 1}`,
          titulo: `Contenido ${clave}`,
          tipo: 'FOTOGRAFIA',
          estado: estadoPieza,
          restringida,
          ubicacionId,
          archivos: {
            create: {
              nombreOriginal: `Fotografía ${clave}.png`,
              rutaAlmacenamiento: ruta,
              tipoMime: 'image/png',
              tamanoBytes: PNG.length,
              estado: estadoArchivo,
              subidoPorId: usuarioId,
            },
          },
        },
        include: { archivos: true },
      });
      archivos[clave] = pieza.archivos[0].id;
    }
  }, 30_000);

  afterAll(async () => {
    await rm(join(almacen, carpeta), { recursive: true, force: true });
    if (prisma) {
      await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
      await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
    await app?.close();
  });

  const pedir = (id: string) =>
    request(app.getHttpServer())
      .get(`/api/v1/archivos/${id}/contenido`)
      .buffer(true)
      .parse((respuesta, listo) => {
        const partes: Buffer[] = [];
        respuesta.on('data', (parte: Buffer) => partes.push(parte));
        respuesta.on('end', () => listo(null, Buffer.concat(partes)));
      });

  it('entrega sin sesión el escaneo aprobado de una pieza publicada, para verlo en el navegador', async () => {
    const respuesta = await pedir(archivos.publico).expect(200);

    expect(respuesta.headers['content-type']).toBe('image/png');
    expect(respuesta.headers['content-length']).toBe(String(PNG.length));
    expect(respuesta.headers['content-disposition']).toBe(
      `inline; filename*=UTF-8''${encodeURIComponent('Fotografía publico.png')}`,
    );
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(Buffer.compare(respuesta.body as Buffer, PNG)).toBe(0);
  });

  it.each(['restringido', 'sinPublicar', 'enRevision', 'perdido'] as const)(
    'responde 404 cuando el archivo es %s',
    async (clave) => {
      const respuesta = await request(app.getHttpServer())
        .get(`/api/v1/archivos/${archivos[clave]}/contenido`)
        .expect(404);
      expect(respuesta.body).toMatchObject({ statusCode: 404 });
    },
  );

  it('responde 404 cuando el id no existe o no es un UUID', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/archivos/${randomUUID()}/contenido`)
      .expect(404);
    await request(app.getHttpServer()).get('/api/v1/archivos/no-es-un-id/contenido').expect(404);
  });
});
