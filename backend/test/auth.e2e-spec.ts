import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { Configuracion } from '../src/infrastructure/config/configuracion';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';

describe('POST /api/v1/auth/ingresar (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwt: JwtService;
  let secretoRefresco: string;
  let usuarioId = '';
  let correo: string;
  const contrasena = 'Secreta.123';

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    secretoRefresco = app
      .get<ConfigService<Configuracion, true>>(ConfigService)
      .get('JWT_REFRESH_SECRET', { infer: true });
  }, 30_000);

  beforeEach(async () => {
    correo = `ingreso-${randomUUID()}@prueba.local`;
    const hasher = new BcryptHasherContrasenas();
    const usuario = await prisma.usuario.create({
      data: {
        nombre: 'Usuario de prueba',
        correo,
        contrasenaHash: await hasher.hash(contrasena),
        rol: 'PERSONAL',
      },
    });
    usuarioId = usuario.id;
  });

  afterEach(async () => {
    if (prisma && usuarioId) {
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30_000);

  it('devuelve JWT de acceso y refresco para credenciales correctas', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    const cuerpo = respuesta.body as {
      tokenAcceso: string;
      tokenRefresco: string;
      usuario: { id: string; correo: string; rol: string };
    };
    const claimsAcceso = await jwt.verifyAsync<{
      sub: string;
      correo: string;
      rol: string;
    }>(cuerpo.tokenAcceso);
    const claimsRefresco = await jwt.verifyAsync<{ sub: string; jti: string }>(
      cuerpo.tokenRefresco,
      { secret: secretoRefresco },
    );

    expect(cuerpo.usuario).toMatchObject({ id: usuarioId, correo, rol: 'PERSONAL' });
    expect(claimsAcceso).toMatchObject({ sub: usuarioId, correo, rol: 'PERSONAL' });
    expect(claimsRefresco.sub).toBe(usuarioId);

    const sesiones = await prisma.sesion.findMany({ where: { usuarioId } });
    expect(sesiones).toHaveLength(1);
    expect(sesiones[0].jti).toBe(claimsRefresco.jti);
  });

  it('rechaza credenciales incorrectas sin crear una sesión', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena: 'incorrecta' })
      .expect(401);

    const sesiones = await prisma.sesion.findMany({ where: { usuarioId } });
    expect(sesiones).toHaveLength(0);
  });

  it('renueva los JWT y revoca el token de refresco anterior', async () => {
    const ingreso = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    const tokenRefrescoAnterior = (ingreso.body as { tokenRefresco: string }).tokenRefresco;

    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/refrescar')
      .send({ tokenRefresco: tokenRefrescoAnterior })
      .expect(200);
    const cuerpo = respuesta.body as { tokenAcceso: string; tokenRefresco: string };
    const claimsAcceso = await jwt.verifyAsync<{ sub: string }>(cuerpo.tokenAcceso);
    const claimsRefresco = await jwt.verifyAsync<{ sub: string; jti: string }>(
      cuerpo.tokenRefresco,
      { secret: secretoRefresco },
    );

    expect(cuerpo.tokenRefresco).not.toBe(tokenRefrescoAnterior);
    expect(claimsAcceso.sub).toBe(usuarioId);
    expect(claimsRefresco.sub).toBe(usuarioId);

    const sesiones = await prisma.sesion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'asc' },
    });
    expect(sesiones).toHaveLength(2);
    expect(sesiones[0].revocadaEn).toBeInstanceOf(Date);
    expect(sesiones[1].jti).toBe(claimsRefresco.jti);
    expect(sesiones[1].revocadaEn).toBeNull();

    await request(app.getHttpServer())
      .post('/api/v1/auth/refrescar')
      .send({ tokenRefresco: tokenRefrescoAnterior })
      .expect(401);
  });
});
