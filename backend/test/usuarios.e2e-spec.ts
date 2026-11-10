import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  HASHER_CONTRASENAS,
  HasherContrasenas,
} from '../src/application/auth/ports/hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';

interface SesionRespuesta {
  tokenAcceso: string;
  tokenRefresco: string;
}

interface UsuarioRespuesta {
  id: string;
  rol: string;
  activo: boolean;
}

interface ListadoUsuariosRespuesta {
  datos: UsuarioRespuesta[];
}

describe('Administración de usuarios (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let correoAdministrador: string;
  let correoPersonal: string;
  const contrasenaAdministrador = 'admin-seguro-HU17';
  const contrasenaPersonal = 'personal-seguro-HU17';

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const sufijo = randomUUID();
    correoAdministrador = `admin-${sufijo}@test.local`;
    correoPersonal = `personal-${sufijo}@test.local`;
    const hasher = app.get<HasherContrasenas>(HASHER_CONTRASENAS);
    await prisma.usuario.create({
      data: {
        nombre: 'Administración HU-17',
        correo: correoAdministrador,
        contrasenaHash: await hasher.hash(contrasenaAdministrador),
        rol: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.usuario.deleteMany({
        where: { correo: { in: [correoAdministrador, correoPersonal].filter(Boolean) } },
      });
    }
    await app?.close();
  });

  it('crea PERSONAL, permite el ingreso, cambia el rol y revoca las sesiones al desactivar', async () => {
    const accesoAdministrador = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo: correoAdministrador, contrasena: contrasenaAdministrador })
      .expect(200);
    const tokenAdministrador = (accesoAdministrador.body as SesionRespuesta).tokenAcceso;

    const creado = await request(app.getHttpServer())
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .send({
        nombre: 'Personal HU-17',
        correo: correoPersonal,
        contrasenaTemporal: contrasenaPersonal,
      })
      .expect(201);
    expect(creado.body).toMatchObject({
      nombre: 'Personal HU-17',
      correo: correoPersonal,
      rol: 'PERSONAL',
      activo: true,
    });
    const usuarioCreado = creado.body as UsuarioRespuesta;
    expect((creado.body as Record<string, unknown>).contrasenaHash).toBeUndefined();
    await request(app.getHttpServer())
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .send({
        nombre: 'Personal duplicado',
        correo: correoPersonal,
        contrasenaTemporal: contrasenaPersonal,
      })
      .expect(409);

    const listado = await request(app.getHttpServer())
      .get('/api/v1/usuarios?pagina=1&limite=10&orden=correo&direccion=asc')
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .expect(200);
    expect((listado.body as ListadoUsuariosRespuesta).datos).toEqual(
      expect.arrayContaining([expect.objectContaining({ correo: correoPersonal })]),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/usuarios/${usuarioCreado.id}/rol`)
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .send({ rol: 'ADMIN' })
      .expect(200)
      .then(({ body }) => expect((body as UsuarioRespuesta).rol).toBe('ADMIN'));
    await request(app.getHttpServer())
      .patch(`/api/v1/usuarios/${usuarioCreado.id}/rol`)
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .send({ rol: 'PERSONAL' })
      .expect(200)
      .then(({ body }) => expect((body as UsuarioRespuesta).rol).toBe('PERSONAL'));

    const accesoPersonal = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo: correoPersonal, contrasena: contrasenaPersonal })
      .expect(200);
    const sesionPersonal = accesoPersonal.body as SesionRespuesta;
    await request(app.getHttpServer())
      .get('/api/v1/auth/yo')
      .set('Authorization', `Bearer ${sesionPersonal.tokenAcceso}`)
      .expect(200)
      .then(({ body }) => expect((body as UsuarioRespuesta).rol).toBe('PERSONAL'));
    await request(app.getHttpServer())
      .get('/api/v1/usuarios')
      .set('Authorization', `Bearer ${sesionPersonal.tokenAcceso}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/usuarios/${usuarioCreado.id}/desactivar`)
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .expect(200)
      .then(({ body }) => expect((body as UsuarioRespuesta).activo).toBe(false));

    const usuarioPersistido = await prisma.usuario.findUniqueOrThrow({
      where: { correo: correoPersonal },
      include: { sesiones: true },
    });
    expect(usuarioPersistido.sesiones.length).toBeGreaterThan(0);
    expect(usuarioPersistido.sesiones.every((sesion) => sesion.revocadaEn !== null)).toBe(true);

    await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo: correoPersonal, contrasena: contrasenaPersonal })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refrescar')
      .send({ tokenRefresco: sesionPersonal.tokenRefresco })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/yo')
      .set('Authorization', `Bearer ${sesionPersonal.tokenAcceso}`)
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/api/v1/usuarios/${usuarioCreado.id}/activar`)
      .set('Authorization', `Bearer ${tokenAdministrador}`)
      .expect(200)
      .then(({ body }) => expect((body as UsuarioRespuesta).activo).toBe(true));

    await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo: correoPersonal, contrasena: contrasenaPersonal })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refrescar')
      .send({ tokenRefresco: sesionPersonal.tokenRefresco })
      .expect(401);
  });
});
