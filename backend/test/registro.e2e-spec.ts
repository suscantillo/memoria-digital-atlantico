import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { VERSION_AVISO_PRIVACIDAD } from '../src/domain/usuarios/aviso-privacidad';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('POST /api/v1/auth/registro (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let correo: string;
  const contrasena = 'Secreta.123';

  const datos = () => ({
    nombre: 'Visitante de prueba',
    correo,
    contrasena,
    aceptaPrivacidad: true,
    versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
  });

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  }, 30_000);

  beforeEach(() => {
    correo = `registro-${randomUUID()}@prueba.local`;
  });

  afterEach(async () => {
    await prisma.usuario.deleteMany({ where: { correo } });
  });

  afterAll(async () => {
    await app.close();
  }, 30_000);

  it('crea la cuenta PUBLICO con hash y consentimiento, y permite ingresar', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/registro')
      .send(datos())
      .expect(201);

    expect(respuesta.body).toMatchObject({
      correo,
      rol: 'PUBLICO',
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
    });
    expect(respuesta.body).not.toHaveProperty('contrasenaHash');

    const fila = await prisma.usuario.findUniqueOrThrow({ where: { correo } });
    expect(fila.rol).toBe('PUBLICO');
    expect(fila.contrasenaHash).not.toBe(contrasena);
    expect(fila.contrasenaHash).toMatch(/^\$2[aby]\$/);
    expect(fila.consentimientoEn).toBeInstanceOf(Date);
    expect(fila.versionPrivacidad).toBe(VERSION_AVISO_PRIVACIDAD);

    await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
  });

  it.each([
    ['sin marcar el consentimiento', { aceptaPrivacidad: false }, 'aceptaPrivacidad'],
    ['sin enviar el consentimiento', { aceptaPrivacidad: undefined }, 'aceptaPrivacidad'],
    [
      'con una versión del aviso que no es la vigente',
      { versionPrivacidad: '0' },
      'versionPrivacidad',
    ],
    ['con una contraseña de menos de 8 caracteres', { contrasena: 'corta' }, 'contrasena'],
  ])('responde 400 %s y no crea la cuenta', async (_caso, cambios, campo) => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/registro')
      .send({ ...datos(), ...cambios })
      .expect(400);

    const cuerpo = respuesta.body as { errors: string[] };
    expect(cuerpo.errors.some((error) => error.includes(campo))).toBe(true);
    expect(await prisma.usuario.count({ where: { correo } })).toBe(0);
  });

  it('responde 409 con mensaje claro si el correo ya está registrado', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/registro').send(datos()).expect(201);

    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/registro')
      .send({ ...datos(), correo: correo.toUpperCase() })
      .expect(409);

    expect(respuesta.body).toMatchObject({
      statusCode: 409,
      message: `Ya existe una cuenta con el correo "${correo}".`,
    });
    expect(await prisma.usuario.count({ where: { correo } })).toBe(1);
  });
});
