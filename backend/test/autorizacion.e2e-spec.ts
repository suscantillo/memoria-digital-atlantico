import { INestApplication, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { SERVICIO_TOKENS, ServicioTokens } from '../src/application/auth/ports/servicio-tokens';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { RolUsuario } from '../src/domain/usuarios/rol-usuario';
import { CLAVE_PUBLICA } from '../src/presentation/comun/decoradores/publica.decorator';

// Las únicas rutas que se pueden usar sin token. Si una historia abre otra (por ejemplo
// GET /portal/piezas), se agrega aquí a propósito.
const RUTAS_PUBLICAS = [
  'GET /health',
  'POST /auth/ingresar',
  'POST /auth/refrescar',
  'POST /auth/registro',
  'POST /auth/salir',
];

// Necesita DATABASE_URL; en CI lo da el servicio de Postgres.
describe('Autorización por roles (e2e)', () => {
  let app: INestApplication<App>;
  const tokens: Partial<Record<RolUsuario, string>> = {};

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DiscoveryModule],
    }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();

    const servicio = app.get<ServicioTokens>(SERVICIO_TOKENS);
    for (const rol of ['ADMIN', 'PERSONAL', 'PUBLICO'] as const) {
      tokens[rol] = await servicio.firmarAcceso({
        sub: `usuario-${rol.toLowerCase()}`,
        correo: `${rol.toLowerCase()}@prueba.local`,
        rol,
      });
    }
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  const servidor = () => app.getHttpServer();
  const con = (rol: RolUsuario) => ({ Authorization: `Bearer ${tokens[rol]}` });

  it('solo las rutas marcadas con @Publica se pueden usar sin token', () => {
    const descubrimiento = app.get(DiscoveryService);
    const escaner = app.get(MetadataScanner);
    const reflector = app.get(Reflector);
    const publicas: string[] = [];

    for (const { instance, metatype } of descubrimiento.getControllers()) {
      if (!instance || !metatype) continue;
      const base = String(Reflect.getMetadata(PATH_METADATA, metatype) ?? '');
      const prototipo = Object.getPrototypeOf(instance) as Record<string, () => unknown>;
      for (const nombre of escaner.getAllMethodNames(prototipo)) {
        const manejador = prototipo[nombre];
        const metodo = Reflect.getMetadata(METHOD_METADATA, manejador) as RequestMethod | undefined;
        if (metodo === undefined) continue;
        const esPublica = reflector.getAllAndOverride<boolean>(CLAVE_PUBLICA, [
          manejador,
          metatype,
        ]);
        if (!esPublica) continue;
        const subruta = String(Reflect.getMetadata(PATH_METADATA, manejador) ?? '');
        const ruta = `/${[base, subruta].filter((p) => p && p !== '/').join('/')}`;
        publicas.push(`${RequestMethod[metodo]} ${ruta}`);
      }
    }

    expect(publicas.sort()).toEqual(RUTAS_PUBLICAS);
  });

  describe('rutas públicas', () => {
    it('GET /health responde sin token', async () => {
      await request(servidor()).get('/api/v1/health').expect(200);
    });

    it('POST /auth/ingresar no pide token: llega a la validación del cuerpo', async () => {
      await request(servidor()).post('/api/v1/auth/ingresar').send({}).expect(400);
    });
  });

  describe('rutas con sesión', () => {
    it('GET /auth/yo sin token responde 401', async () => {
      await request(servidor()).get('/api/v1/auth/yo').expect(401);
    });

    it('un token alterado responde 401', async () => {
      await request(servidor())
        .get('/api/v1/auth/yo')
        .set('Authorization', `Bearer ${tokens.ADMIN}x`)
        .expect(401);
    });
  });

  describe('rutas del personal', () => {
    it('GET /ubicaciones sin token responde 401', async () => {
      await request(servidor()).get('/api/v1/ubicaciones').expect(401);
    });

    it('GET /ubicaciones con una cuenta PUBLICO responde 403', async () => {
      await request(servidor()).get('/api/v1/ubicaciones').set(con('PUBLICO')).expect(403);
    });

    it('POST /ubicaciones con una cuenta PUBLICO responde 403', async () => {
      await request(servidor())
        .post('/api/v1/ubicaciones')
        .set(con('PUBLICO'))
        .send({ deposito: 'D', estanteria: 'E', caja: 'C' })
        .expect(403);
    });

    it.each(['PERSONAL', 'ADMIN'] as const)('GET /ubicaciones con %s responde 200', async (rol) => {
      await request(servidor()).get('/api/v1/ubicaciones').set(con(rol)).expect(200);
    });

    it('el 403 usa el formato uniforme de error', async () => {
      const respuesta = await request(servidor())
        .get('/api/v1/ubicaciones')
        .set(con('PUBLICO'))
        .expect(403);
      expect(respuesta.body).toMatchObject({ statusCode: 403, path: '/api/v1/ubicaciones' });
    });
  });
});
