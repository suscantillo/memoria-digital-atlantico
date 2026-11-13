import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

interface Cuenta {
  id: string;
  correo: string;
  activo: boolean;
}

describe('Cuentas del portal administradas por el ADMIN (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    ADMIN: `cp-admin-${marca}@prueba.local`,
    PERSONAL: `cp-personal-${marca}@prueba.local`,
    PUBLICO: `cp-lectora-${marca}@prueba.local`,
  } as const;
  const ids: Record<string, string> = {};
  const tokens: Record<string, string> = {};

  const ingresar = (correo: string) =>
    request(app.getHttpServer()).post('/api/v1/auth/ingresar').send({ correo, contrasena });

  const como = (rol: 'ADMIN' | 'PERSONAL', metodo: 'get' | 'patch', ruta: string) =>
    request(app.getHttpServer())
      [metodo](`/api/v1${ruta}`)
      .set('Authorization', `Bearer ${tokens[rol]}`);

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const hash = await new BcryptHasherContrasenas().hash(contrasena);
    for (const [rol, correo] of Object.entries(correos)) {
      const fila = await prisma.usuario.create({
        data: {
          nombre: `Cuenta ${rol} ${marca}`,
          correo,
          contrasenaHash: hash,
          rol: rol as 'ADMIN' | 'PERSONAL' | 'PUBLICO',
          ...(rol === 'PUBLICO' ? { consentimientoEn: new Date(), versionPrivacidad: '1' } : {}),
        },
      });
      ids[rol] = fila.id;
      const respuesta = await ingresar(correo).expect(200);
      tokens[rol] = (respuesta.body as { tokenAcceso: string }).tokenAcceso;
    }
  }, 30_000);

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('solo el ADMIN las consulta y las desactiva', async () => {
    await como('PERSONAL', 'get', '/usuarios/publico').expect(403);
    await como('PERSONAL', 'patch', `/usuarios/publico/${ids.PUBLICO}/desactivar`).expect(403);
  });

  it('la lista trae cuentas PUBLICO y no las del personal', async () => {
    const respuesta = await como('ADMIN', 'get', '/usuarios/publico')
      .query({ busqueda: marca, limite: 100 })
      .expect(200);
    const correosListados = (respuesta.body as { datos: Cuenta[] }).datos.map((c) => c.correo);
    expect(correosListados).toEqual([correos.PUBLICO]);
  });

  it('desactivada no puede entrar; reactivada sí', async () => {
    await como('ADMIN', 'patch', `/usuarios/publico/${ids.PUBLICO}/desactivar`)
      .expect(200)
      .expect((r) => expect((r.body as Cuenta).activo).toBe(false));
    await ingresar(correos.PUBLICO).expect(401);

    await como('ADMIN', 'patch', `/usuarios/publico/${ids.PUBLICO}/reactivar`).expect(200);
    await ingresar(correos.PUBLICO).expect(200);
  });

  it('estas rutas no tocan cuentas del personal', async () => {
    await como('ADMIN', 'patch', `/usuarios/publico/${ids.PERSONAL}/desactivar`).expect(404);
  });
});
