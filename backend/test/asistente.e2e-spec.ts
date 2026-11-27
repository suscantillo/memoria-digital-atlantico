import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';

describe('POST /api/v1/asistente/preguntas (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    // Sin clave: así se comporta un `docker compose up` sin configurar el asistente.
    process.env.ANTHROPIC_API_KEY = '';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('es pública y sin clave de IA responde 503 para que el portal use su buscador', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/asistente/preguntas')
      .send({ pregunta: '¿Qué fotos hay del carnaval?' })
      .expect(503);

    expect(respuesta.body).toMatchObject({ statusCode: 503 });
  });

  it('rechaza una pregunta vacía', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/asistente/preguntas')
      .send({ pregunta: '   ' })
      .expect(400);
  });

  it('rechaza una pregunta de más de 500 caracteres', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/asistente/preguntas')
      .send({ pregunta: 'a'.repeat(501) })
      .expect(400);
  });
});
