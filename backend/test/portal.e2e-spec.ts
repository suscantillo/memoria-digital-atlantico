import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('GET /api/v1/portal/piezas/:codigo (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ubicacionId: string;
  const codigoPublica = 'MDA-9999-0001';
  const codigoRestringida = 'MDA-9999-0002';

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const sufijo = randomUUID().slice(0, 8);
    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito E2E ${sufijo}`,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
    ubicacionId = ubicacion.id;

    await prisma.pieza.createMany({
      data: [
        {
          codigo: codigoPublica,
          titulo: 'Fotografía de prueba e2e',
          descripcion: 'Descripción pública e2e',
          tipo: 'FOTOGRAFIA',
          estado: 'PUBLICADA',
          anio: 1935,
          restringida: false,
          ubicacionId,
        },
        {
          codigo: codigoRestringida,
          titulo: 'Expediente restringido e2e',
          descripcion: 'Contenido sensible',
          tipo: 'DOCUMENTO',
          estado: 'PUBLICADA',
          anio: 1911,
          restringida: true,
          ubicacionId,
        },
      ],
    });
  });

  afterAll(async () => {
    if (prisma && ubicacionId) {
      await prisma.pieza.deleteMany({
        where: { codigo: { in: [codigoPublica, codigoRestringida] } },
      });
      await prisma.ubicacion.delete({ where: { id: ubicacionId } });
    }
    await app?.close();
  });

  it('devuelve la ficha pública con ubicación para un código válido', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/api/v1/portal/piezas/${codigoPublica}`)
      .expect(200);

    const cuerpo = respuesta.body as Record<string, unknown>;
    expect(cuerpo).toMatchObject({
      codigo: codigoPublica,
      tipo: 'FOTOGRAFIA',
      restringida: false,
      titulo: 'Fotografía de prueba e2e',
      descripcion: 'Descripción pública e2e',
      anio: 1935,
      archivo: null,
      ubicacion: {
        id: ubicacionId,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
  });

  it('oculta metadatos sensibles cuando la pieza es restringida', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/api/v1/portal/piezas/${codigoRestringida}`)
      .expect(200);

    const cuerpo = respuesta.body as Record<string, unknown>;
    expect(cuerpo).toMatchObject({
      codigo: codigoRestringida,
      tipo: 'DOCUMENTO',
      restringida: true,
      titulo: null,
      descripcion: null,
      anio: null,
      archivo: null,
      ubicacion: {
        id: ubicacionId,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
  });

  it('responde 404 con el formato uniforme cuando el código no existe', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/v1/portal/piezas/MDA-9999-9999')
      .expect(404);

    expect(respuesta.body).toMatchObject({
      statusCode: 404,
      path: '/api/v1/portal/piezas/MDA-9999-9999',
    });
  });
});
