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
    if (!prisma) return;
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

  it('consulta la ficha con ubicación e historial en orden cronológico', async () => {
    const creada = await request(app.getHttpServer())
      .post('/api/v1/piezas')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send({
        tipo: 'DOCUMENTO',
        titulo: 'Ficha para consulta',
        anio: 1901,
        ubicacionId,
      })
      .expect(201);
    const pieza = creada.body as { id: string };
    await prisma.eventoPieza.createMany({
      data: [
        {
          piezaId: pieza.id,
          usuarioId,
          accion: 'EVENTO_POSTERIOR',
          creadoEn: new Date('2025-01-03T00:00:00.000Z'),
        },
        {
          piezaId: pieza.id,
          usuarioId,
          accion: 'EVENTO_ANTERIOR',
          creadoEn: new Date('2025-01-02T00:00:00.000Z'),
        },
      ],
    });

    const respuesta = await request(app.getHttpServer())
      .get(`/api/v1/piezas/${pieza.id}`)
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .expect(200);
    const ficha = respuesta.body as {
      titulo: string;
      estado: string;
      ubicacion: { id: string; deposito: string; estanteria: string; caja: string };
      eventos: Array<{ accion: string; creadoEn: string }>;
    };

    expect(ficha).toMatchObject({
      titulo: 'Ficha para consulta',
      estado: 'REGISTRADA',
      ubicacion: {
        id: ubicacionId,
        estanteria: 'Estantería de prueba',
        caja: 'Caja de prueba',
      },
    });
    expect(ficha.ubicacion.deposito).toContain('Depósito pieza');
    expect(ficha.eventos.map((evento) => evento.accion)).toEqual([
      'EVENTO_ANTERIOR',
      'EVENTO_POSTERIOR',
      'REGISTRADA',
    ]);
    expect(new Date(ficha.eventos[0].creadoEn).getTime()).toBeLessThan(
      new Date(ficha.eventos[1].creadoEn).getTime(),
    );
  });

  it('edita los datos y registra el evento de edición con su autor', async () => {
    const creada = await request(app.getHttpServer())
      .post('/api/v1/piezas')
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send({
        tipo: 'PERIODICO',
        titulo: 'Título original',
        anio: 1942,
        ubicacionId,
      })
      .expect(201);
    const pieza = creada.body as { id: string };

    const respuestaTitulo = await request(app.getHttpServer())
      .patch(`/api/v1/piezas/${pieza.id}`)
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send({ titulo: 'Título corregido' })
      .expect(200);

    expect(respuestaTitulo.body).toMatchObject({
      id: pieza.id,
      titulo: 'Título corregido',
    });

    const respuestaDescripcion = await request(app.getHttpServer())
      .patch(`/api/v1/piezas/${pieza.id}`)
      .set('Authorization', `Bearer ${tokenAcceso}`)
      .send({ descripcion: 'Descripción nueva' })
      .expect(200);

    expect(respuestaDescripcion.body).toMatchObject({
      id: pieza.id,
      titulo: 'Título corregido',
      descripcion: 'Descripción nueva',
    });
    await expect(prisma.pieza.findUnique({ where: { id: pieza.id } })).resolves.toMatchObject({
      titulo: 'Título corregido',
      descripcion: 'Descripción nueva',
    });
    const eventos = await prisma.eventoPieza.findMany({
      where: { piezaId: pieza.id, accion: 'EDITADA' },
      orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }],
    });
    expect(eventos).toMatchObject([
      {
        usuarioId,
        accion: 'EDITADA',
        detalle: 'Se actualizó título.',
      },
      {
        usuarioId,
        accion: 'EDITADA',
        detalle: 'Se actualizó descripción.',
      },
    ]);
  });
});
