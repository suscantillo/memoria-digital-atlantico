import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Ubicaciones (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let usuarioId = '';
  let deposito: string;
  let correo: string;
  let tokenAcceso: string;
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

  beforeEach(async () => {
    const marca = randomUUID();
    deposito = `Depósito HU05 ${marca}`;
    correo = `personal-${marca}@prueba.local`;
    const hasher = new BcryptHasherContrasenas();
    const usuario = await prisma.usuario.create({
      data: {
        nombre: 'Personal de prueba',
        correo,
        contrasenaHash: await hasher.hash(contrasena),
        rol: 'PERSONAL',
      },
    });
    usuarioId = usuario.id;

    const ingreso = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    tokenAcceso = (ingreso.body as { tokenAcceso: string }).tokenAcceso;
  });

  afterEach(async () => {
    await prisma.ubicacion.deleteMany({ where: { deposito } });
    if (usuarioId) {
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
  });

  afterAll(async () => {
    await app.close();
  }, 30_000);

  it('registra una ubicación y la devuelve en el listado paginado', async () => {
    const datos = {
      deposito,
      estanteria: 'Estantería de prueba',
      caja: 'Caja de prueba',
      descripcion: 'Ubicación creada por prueba e2e',
    };

    const creada = await request(app.getHttpServer())
      .post('/api/v1/ubicaciones')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send(datos)
      .expect(201);

    expect(creada.body).toMatchObject(datos);

    const listado = await request(app.getHttpServer())
      .get('/api/v1/ubicaciones')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .query({ busqueda: deposito, pagina: 1, limite: 10 })
      .expect(200);
    const cuerpo = listado.body as {
      datos: Array<typeof datos>;
      meta: { pagina: number; limite: number; total: number; totalPaginas: number };
    };

    expect(cuerpo.datos).toHaveLength(1);
    expect(cuerpo.datos[0]).toMatchObject(datos);
    expect(cuerpo.meta).toMatchObject({
      pagina: 1,
      limite: 10,
      total: 1,
      totalPaginas: 1,
    });
  });

  it('responde 409 con un mensaje claro cuando la terna ya existe', async () => {
    const datos = {
      deposito,
      estanteria: 'Estantería de prueba',
      caja: 'Caja de prueba',
    };

    await request(app.getHttpServer())
      .post('/api/v1/ubicaciones')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send(datos)
      .expect(201);

    const duplicada = await request(app.getHttpServer())
      .post('/api/v1/ubicaciones')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send(datos)
      .expect(409);

    expect(duplicada.body).toMatchObject({
      statusCode: 409,
      message: `Ya existe una ubicación con depósito "${deposito}", estantería "${datos.estanteria}" y caja "${datos.caja}".`,
    });
  });
});
