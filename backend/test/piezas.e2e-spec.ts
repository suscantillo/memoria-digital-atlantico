import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Piezas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let usuarioId: string;
  let ubicacionId: string;
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
    correo = `personal-piezas-${marca}@prueba.local`;
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

    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito pieza ${marca}`,
        estanteria: 'Estantería de prueba',
        caja: 'Caja de prueba',
      },
    });
    ubicacionId = ubicacion.id;

    const ingreso = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    tokenAcceso = (ingreso.body as { tokenAcceso: string }).tokenAcceso;
  });

  afterEach(async () => {
    await prisma.pieza.deleteMany({ where: { ubicacionId } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
  });

  afterAll(async () => {
    await app.close();
  }, 30_000);

  it('registra la pieza con código consecutivo, estado inicial y evento', async () => {
    const datos = {
      tipo: 'FOTOGRAFIA',
      titulo: 'Retrato ficticio de prueba',
      anio: 1934,
      ubicacionId,
    };

    const respuestas = await Promise.all(
      [datos, { ...datos, titulo: 'Segunda pieza ficticia' }].map((pieza) =>
        request(app.getHttpServer())
          .post('/api/v1/piezas')
          .set('Authorization', `Bearer ${tokenAcceso}`)
          .send(pieza)
          .expect(201),
      ),
    );

    const piezas = respuestas.map(
      (respuesta) =>
        respuesta.body as { id: string; codigo: string; estado: string; titulo: string },
    );
    const [primeraPieza] = piezas;
    const codigos = piezas.map((pieza) => pieza.codigo);
    const consecutivos = codigos.map((codigo) => Number(codigo.slice(-4))).sort();
    expect(new Set(codigos).size).toBe(2);
    expect(consecutivos[1]).toBe(consecutivos[0] + 1);
    expect(codigos.every((codigo) => /^MDA-\d{4}-\d{4}$/.test(codigo))).toBe(true);
    expect(primeraPieza.estado).toBe('REGISTRADA');

    const evento = await prisma.eventoPieza.findFirst({
      where: { piezaId: primeraPieza.id },
    });
    expect(evento).toMatchObject({
      usuarioId,
      accion: 'REGISTRADA',
    });
    expect(evento?.detalle).toContain(primeraPieza.codigo);
  });

  it.each([
    ['año menor al rango', { anio: 1499 }, 'anio'],
    ['año mayor al rango', { anio: 2101 }, 'anio'],
    ['título vacío', { titulo: '   ' }, 'titulo'],
  ])('responde 400 indicando el campo para %s', async (_caso, cambios, campo) => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/piezas')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send({
        tipo: 'DOCUMENTO',
        titulo: 'Pieza ficticia válida',
        anio: 1900,
        ubicacionId,
        ...cambios,
      })
      .expect(400);

    const cuerpo = respuesta.body as { errors: string[] };
    expect(cuerpo.errors.some((error) => error.includes(campo))).toBe(true);
  });
});
