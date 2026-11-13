import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Retirar una pieza del portal y volver a publicarla (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    ADMIN: `pub-admin-${marca}@prueba.local`,
    PERSONAL: `pub-personal-${marca}@prueba.local`,
  };
  const tokens: Record<string, string> = {};
  const codigo = 'MDA-9992-0001';
  let ubicacionId: string;
  let piezaId: string;

  const como = (rol: 'ADMIN' | 'PERSONAL', ruta: string) =>
    request(app.getHttpServer())
      .post(`/api/v1${ruta}`)
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
    let subioId = '';
    for (const [rol, correo] of Object.entries(correos)) {
      const fila = await prisma.usuario.create({
        data: { nombre: `Publicación ${rol}`, correo, contrasenaHash: hash, rol: rol as 'ADMIN' },
      });
      subioId = fila.id;
      const respuesta = await request(app.getHttpServer())
        .post('/api/v1/auth/ingresar')
        .send({ correo, contrasena })
        .expect(200);
      tokens[rol] = (respuesta.body as { tokenAcceso: string }).tokenAcceso;
    }
    const ubicacion = await prisma.ubicacion.create({
      data: { deposito: `Depósito publicación ${marca}`, estanteria: 'E1', caja: 'C1' },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo } });
    const pieza = await prisma.pieza.create({
      data: {
        codigo,
        titulo: `Pieza publicada ${marca}`,
        tipo: 'FOTOGRAFIA',
        estado: 'PUBLICADA',
        ubicacionId,
        archivos: {
          create: {
            nombreOriginal: 'foto.jpg',
            rutaAlmacenamiento: `e2e/${marca}.jpg`,
            tipoMime: 'image/jpeg',
            tamanoBytes: 10,
            estado: 'APROBADO',
            subidoPorId: subioId,
          },
        },
      },
    });
    piezaId = pieza.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.pieza.deleteMany({ where: { codigo } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('solo el ADMIN retira o publica', async () => {
    await como('PERSONAL', `/piezas/${piezaId}/retirar`).send({ motivo: 'x' }).expect(403);
    await como('PERSONAL', `/piezas/${piezaId}/publicar`).expect(403);
  });

  it('pide motivo para retirar', async () => {
    await como('ADMIN', `/piezas/${piezaId}/retirar`).send({ motivo: '   ' }).expect(400);
  });

  it('retirada: sale del portal, queda REVISADA y el motivo va al historial', async () => {
    const respuesta = await como('ADMIN', `/piezas/${piezaId}/retirar`)
      .send({ motivo: 'La fecha está mal' })
      .expect(200);

    expect(respuesta.body).toMatchObject({ estado: 'REVISADA' });
    const portal = await request(app.getHttpServer())
      .get(`/api/v1/portal/piezas/${codigo}`)
      .expect(200);
    expect(portal.body).toMatchObject({ digitalizada: false, titulo: null, archivo: null });
    const evento = await prisma.eventoPieza.findFirstOrThrow({
      where: { piezaId, accion: 'RETIRADA' },
    });
    expect(evento.detalle).toBe('Retirada del portal: La fecha está mal');

    await como('ADMIN', `/piezas/${piezaId}/retirar`).send({ motivo: 'otra vez' }).expect(409);
  });

  it('vuelve a publicar: el portal la muestra otra vez con su escaneo', async () => {
    await como('ADMIN', `/piezas/${piezaId}/publicar`).expect(200);

    const portal = await request(app.getHttpServer())
      .get(`/api/v1/portal/piezas/${codigo}`)
      .expect(200);
    expect(portal.body).toMatchObject({ digitalizada: true, titulo: `Pieza publicada ${marca}` });
    await como('ADMIN', `/piezas/${piezaId}/publicar`).expect(409);
  });
});
