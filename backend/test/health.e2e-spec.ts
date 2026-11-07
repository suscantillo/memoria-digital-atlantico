import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';

// Necesita DATABASE_URL; en CI lo da el servicio de Postgres.
describe('GET /api/v1/health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 200 con la base de datos conectada', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    const cuerpo = respuesta.body as Record<string, unknown>;

    expect(cuerpo).toMatchObject({ estado: 'ok', baseDatos: 'conectada' });
    expect(typeof cuerpo.marcaTiempo).toBe('string');
  });

  it('devuelve el error uniforme para rutas inexistentes', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/v1/no-existe').expect(404);
    const cuerpo = respuesta.body as Record<string, unknown>;

    expect(cuerpo).toMatchObject({ statusCode: 404, path: '/api/v1/no-existe' });
    expect(typeof cuerpo.message).toBe('string');
    expect(typeof cuerpo.timestamp).toBe('string');
  });
});
