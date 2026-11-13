import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('GET /api/v1/piezas/:id/qr (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const marca = randomUUID().slice(0, 8);
  const codigo = 'MDA-9997-0001';
  const contrasena = 'Secreta.123';
  const correos = {
    PERSONAL: `qr-personal-${marca}@prueba.local`,
    PUBLICO: `qr-publico-${marca}@prueba.local`,
  };
  let piezaId: string;
  let ubicacionId: string;

  const ingresar = async (correo: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    return (respuesta.body as { tokenAcceso: string }).tokenAcceso;
  };

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
      await prisma.usuario.create({
        data: {
          nombre: `QR ${rol}`,
          correo,
          contrasenaHash: hash,
          rol: rol as 'PERSONAL' | 'PUBLICO',
        },
      });
    }
    const ubicacion = await prisma.ubicacion.create({
      data: { deposito: `Depósito QR ${marca}`, estanteria: 'Estantería 1', caja: 'Caja 01' },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo } });
    // REGISTRADA: el QR se imprime antes de digitalizar, así que no depende del estado
    const pieza = await prisma.pieza.create({
      data: { codigo, titulo: `Pieza QR ${marca}`, tipo: 'DOCUMENTO', ubicacionId },
    });
    piezaId = pieza.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.pieza.deleteMany({ where: { codigo } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('el personal descarga un PNG con el código como nombre de archivo', async () => {
    const token = await ingresar(correos.PERSONAL);

    const respuesta = await request(app.getHttpServer())
      .get(`/api/v1/piezas/${piezaId}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, listo) => {
        const partes: Buffer[] = [];
        res.on('data', (parte: Buffer) => partes.push(parte));
        res.on('end', () => listo(null, Buffer.concat(partes)));
      })
      .expect(200);

    expect(respuesta.headers['content-type']).toBe('image/png');
    expect(respuesta.headers['content-disposition']).toBe(`attachment; filename="${codigo}.png"`);
    expect((respuesta.body as Buffer).subarray(0, 8)).toEqual(FIRMA_PNG);
  });

  it('sin sesión responde 401', async () => {
    await request(app.getHttpServer()).get(`/api/v1/piezas/${piezaId}/qr`).expect(401);
  });

  it('una cuenta PUBLICO no puede descargarlo', async () => {
    const token = await ingresar(correos.PUBLICO);
    await request(app.getHttpServer())
      .get(`/api/v1/piezas/${piezaId}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('una pieza que no existe responde 404 y un id mal formado 400', async () => {
    const token = await ingresar(correos.PERSONAL);
    await request(app.getHttpServer())
      .get(`/api/v1/piezas/${randomUUID()}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/v1/piezas/no-es-un-id/qr')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
