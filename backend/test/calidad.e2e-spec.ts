import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(256, 7),
]);

interface Archivo {
  id: string;
  estado: string;
  motivoRechazo: string | null;
  url: string;
  subidoPor: { correo: string };
  pieza: { id: string; codigo: string; estado: string; tema: string | null };
}

describe('Control de calidad de escaneos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let almacen: string;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    PERSONAL: `cal-personal-${marca}@prueba.local`,
    PUBLICO: `cal-publico-${marca}@prueba.local`,
  };
  const prefijo = 'MDA-9994-';
  let ubicacionId: string;
  let token: string;
  const piezas = { porAprobar: '', porRechazar: '' };
  const archivos = { porAprobar: '', porRechazar: '' };

  const ingresar = async (correo: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    return (respuesta.body as { tokenAcceso: string }).tokenAcceso;
  };

  const conSesion = (metodo: 'get' | 'post', ruta: string) =>
    request(app.getHttpServer())[metodo](`/api/v1${ruta}`).set('Authorization', `Bearer ${token}`);

  const cargar = async (piezaId: string): Promise<string> => {
    const respuesta = await conSesion('post', '/archivos')
      .field('piezaId', piezaId)
      .field('tema', 'Carnaval')
      .field('autor', 'Desconocido')
      .field('palabrasClave', 'comparsa')
      .attach('archivo', PNG, 'comparsa.png')
      .expect(201);
    return (respuesta.body as { id: string }).id;
  };

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    almacen = resolve(app.get(ConfigService).get<string>('STORAGE_DIR') ?? './storage');

    const hash = await new BcryptHasherContrasenas().hash(contrasena);
    for (const [rol, correo] of Object.entries(correos)) {
      await prisma.usuario.create({
        data: {
          nombre: `Calidad ${rol}`,
          correo,
          contrasenaHash: hash,
          rol: rol as 'PERSONAL' | 'PUBLICO',
        },
      });
    }
    const ubicacion = await prisma.ubicacion.create({
      data: { deposito: `Depósito calidad ${marca}`, estanteria: 'Estantería 1', caja: 'Caja 01' },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    token = await ingresar(correos.PERSONAL);

    for (const [indice, clave] of (['porAprobar', 'porRechazar'] as const).entries()) {
      const pieza = await prisma.pieza.create({
        data: {
          codigo: `${prefijo}000${indice + 1}`,
          titulo: `Pieza de calidad ${clave} ${marca}`,
          tipo: 'FOTOGRAFIA',
          ubicacionId,
        },
      });
      piezas[clave] = pieza.id;
      archivos[clave] = await cargar(pieza.id);
    }
  }, 30_000);

  afterAll(async () => {
    const filas = await prisma.archivoDigital.findMany({
      where: { pieza: { codigo: { startsWith: prefijo } } },
      select: { rutaAlmacenamiento: true },
    });
    for (const { rutaAlmacenamiento } of filas) {
      await rm(join(almacen, rutaAlmacenamiento), { force: true });
    }
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('solo el personal entra: sin sesión 401 y con cuenta PUBLICO 403', async () => {
    const rutas = [
      ['get', '/archivos'],
      ['post', `/archivos/${archivos.porAprobar}/aprobar`],
      ['post', `/archivos/${archivos.porAprobar}/rechazar`],
    ] as const;
    const tokenPublico = await ingresar(correos.PUBLICO);
    for (const [metodo, ruta] of rutas) {
      await request(app.getHttpServer())[metodo](`/api/v1${ruta}`).expect(401);
      await request(app.getHttpServer())
        [metodo](`/api/v1${ruta}`)
        .set('Authorization', `Bearer ${tokenPublico}`)
        .expect(403);
    }
  });

  it('la cola trae los escaneos EN_REVISION con su pieza y quién los subió', async () => {
    const respuesta = await conSesion('get', '/archivos')
      .query({ estado: 'EN_REVISION', limite: 100 })
      .expect(200);
    const cuerpo = respuesta.body as { datos: Archivo[]; meta: { total: number } };
    const propio = cuerpo.datos.find((archivo) => archivo.id === archivos.porAprobar);

    expect(cuerpo.meta.total).toBeGreaterThanOrEqual(2);
    expect(cuerpo.datos.every((archivo) => archivo.estado === 'EN_REVISION')).toBe(true);
    expect(propio).toMatchObject({
      url: `/api/v1/archivos/${archivos.porAprobar}/contenido`,
      subidoPor: { correo: correos.PERSONAL },
      pieza: { codigo: `${prefijo}0001`, estado: 'ESCANEADA', tema: 'Carnaval' },
    });
    await conSesion('get', '/archivos').query({ estado: 'OTRO' }).expect(400);
  });

  it('entrega el escaneo con su tipo para revisarlo', async () => {
    const respuesta = await conSesion('get', `/archivos/${archivos.porAprobar}/contenido`)
      .buffer(true)
      .parse((res, listo) => {
        const partes: Buffer[] = [];
        res.on('data', (parte: Buffer) => partes.push(parte));
        res.on('end', () => listo(null, Buffer.concat(partes)));
      })
      .expect(200);

    expect(respuesta.headers['content-type']).toBe('image/png');
    expect(respuesta.body as Buffer).toEqual(PNG);
    await conSesion('get', `/archivos/${randomUUID()}/contenido`).expect(404);
  });

  it('no aprueba si falta alguno de los tres criterios', async () => {
    const respuesta = await conSesion('post', `/archivos/${archivos.porAprobar}/aprobar`)
      .send({ legible: true, completa: true, datosCorrectos: false })
      .expect(400);

    expect((respuesta.body as { errors: string[] }).errors.join(' ')).toContain('datosCorrectos');
    await conSesion('post', `/archivos/${archivos.porAprobar}/aprobar`).send({}).expect(400);
  });

  it('criterio 1: con los tres criterios el archivo queda APROBADO y la pieza PUBLICADA', async () => {
    const respuesta = await conSesion('post', `/archivos/${archivos.porAprobar}/aprobar`)
      .send({ legible: true, completa: true, datosCorrectos: true })
      .expect(200);

    expect(respuesta.body).toMatchObject({ estado: 'APROBADO', pieza: { estado: 'PUBLICADA' } });
    const pieza = await prisma.pieza.findUniqueOrThrow({ where: { id: piezas.porAprobar } });
    expect(pieza.estado).toBe('PUBLICADA');
    const eventos = await prisma.eventoPieza.findMany({
      where: { piezaId: piezas.porAprobar },
      orderBy: { creadoEn: 'asc' },
    });
    expect(eventos.map((evento) => evento.accion)).toEqual(['ESCANEADA', 'PUBLICADA']);

    // ya publicada, el portal la muestra con su archivo
    const ficha = await request(app.getHttpServer())
      .get(`/api/v1/portal/piezas/${prefijo}0001`)
      .expect(200);
    expect((ficha.body as { archivo: { url: string } }).archivo.url).toBe(
      `/api/v1/archivos/${archivos.porAprobar}/contenido`,
    );
  });

  it('un escaneo ya revisado no se vuelve a revisar', async () => {
    await conSesion('post', `/archivos/${archivos.porAprobar}/aprobar`)
      .send({ legible: true, completa: true, datosCorrectos: true })
      .expect(409);
    await conSesion('post', `/archivos/${archivos.porAprobar}/rechazar`)
      .send({ motivoRechazo: 'Tarde' })
      .expect(409);
  });

  it('criterio 2: sin motivo no rechaza; con motivo queda RECHAZADO, la pieza REGISTRADA y el motivo en el historial', async () => {
    const ruta = `/archivos/${archivos.porRechazar}/rechazar`;
    const sinMotivo = await conSesion('post', ruta).send({ motivoRechazo: '   ' }).expect(400);
    expect((sinMotivo.body as { errors: string[] }).errors.join(' ')).toContain('motivoRechazo');
    await conSesion('post', ruta).send({}).expect(400);

    const respuesta = await conSesion('post', ruta)
      .send({ motivoRechazo: 'La imagen está cortada' })
      .expect(200);

    expect(respuesta.body).toMatchObject({
      estado: 'RECHAZADO',
      motivoRechazo: 'La imagen está cortada',
      pieza: { estado: 'REGISTRADA' },
    });
    const evento = await prisma.eventoPieza.findFirstOrThrow({
      where: { piezaId: piezas.porRechazar, accion: 'RECHAZADA' },
    });
    expect(evento.detalle).toContain('La imagen está cortada');

    // rechazada vuelve a REGISTRADA: se puede cargar otro escaneo
    await cargar(piezas.porRechazar);
  });
});
