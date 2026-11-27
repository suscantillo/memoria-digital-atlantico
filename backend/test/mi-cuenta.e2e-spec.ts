import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { VERSION_AVISO_PRIVACIDAD } from '../src/domain/usuarios/aviso-privacidad';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

interface Sesion {
  tokenAcceso: string;
  tokenRefresco: string;
}

describe('/api/v1/auth/cuenta (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
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
  }, 30_000);

  beforeEach(() => {
    correo = `mi-cuenta-${randomUUID()}@prueba.local`;
  });

  afterEach(async () => {
    await prisma.usuario.deleteMany({ where: { correo } });
  });

  afterAll(async () => {
    await app.close();
  }, 30_000);

  async function registrarEIngresar(): Promise<Sesion> {
    await request(app.getHttpServer())
      .post('/api/v1/auth/registro')
      .send({
        nombre: 'Visitante de prueba',
        correo,
        contrasena,
        aceptaPrivacidad: true,
        versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
      })
      .expect(201);
    const ingreso = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    return ingreso.body as Sesion;
  }

  it('criterio 1: con sesión muestra nombre, correo y consentimiento, sin la contraseña', async () => {
    const sesion = await registrarEIngresar();

    const respuesta = await request(app.getHttpServer())
      .get('/api/v1/auth/cuenta')
      .set('Authorization', `Bearer ${sesion.tokenAcceso}`)
      .expect(200);

    expect(respuesta.body).toMatchObject({
      nombre: 'Visitante de prueba',
      correo,
      rol: 'PUBLICO',
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
      puedeEliminarla: true,
    });
    expect(typeof (respuesta.body as { consentimientoEn: unknown }).consentimientoEn).toBe(
      'string',
    );
    expect(respuesta.body).not.toHaveProperty('contrasenaHash');
  }, 30_000);

  it('sin sesión no muestra ni elimina nada', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/cuenta').expect(401);
    await request(app.getHttpServer())
      .delete('/api/v1/auth/cuenta')
      .send({ contrasena })
      .expect(401);
  });

  it('con otra contraseña responde 422 y la cuenta sigue ahí', async () => {
    const sesion = await registrarEIngresar();

    await request(app.getHttpServer())
      .delete('/api/v1/auth/cuenta')
      .set('Authorization', `Bearer ${sesion.tokenAcceso}`)
      .send({ contrasena: 'NoEsLaMia.1' })
      .expect(422);

    expect(await prisma.usuario.findUnique({ where: { correo } })).not.toBeNull();
  }, 30_000);

  it('criterio 2: elimina la cuenta, revoca sus sesiones y ya no se puede ingresar', async () => {
    const sesion = await registrarEIngresar();
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { correo } });

    await request(app.getHttpServer())
      .delete('/api/v1/auth/cuenta')
      .set('Authorization', `Bearer ${sesion.tokenAcceso}`)
      .send({ contrasena })
      .expect(204);

    expect(await prisma.usuario.findUnique({ where: { correo } })).toBeNull();
    expect(await prisma.sesion.count({ where: { usuarioId: usuario.id } })).toBe(0);

    await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refrescar')
      .send({ tokenRefresco: sesion.tokenRefresco })
      .expect(401);
    // el token de acceso aún no vence, pero la guardia ya no encuentra la cuenta
    await request(app.getHttpServer())
      .get('/api/v1/auth/cuenta')
      .set('Authorization', `Bearer ${sesion.tokenAcceso}`)
      .expect(401);
  }, 30_000);
});
