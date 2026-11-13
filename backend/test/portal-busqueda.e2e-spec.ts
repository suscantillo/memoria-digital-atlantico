import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

interface PiezaRespuesta {
  codigo: string;
  titulo: string | null;
  anio: number | null;
  restringida: boolean;
  tipo: string;
  ubicacion: { deposito: string };
}

interface Respuesta {
  datos: PiezaRespuesta[];
  meta: { pagina: number; limite: number; total: number; totalPaginas: number };
}

describe('GET /api/v1/portal/piezas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ubicacionId: string;
  // La base comparte datos con la semilla y otros e2e: la marca aísla las piezas de esta prueba.
  const marca = `hu13${randomUUID().slice(0, 8)}`;
  const codigos = ['MDA-9998-0001', 'MDA-9998-0002', 'MDA-9998-0003', 'MDA-9998-0004'];

  const buscar = async (consulta: Record<string, string | number>): Promise<Respuesta> => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/v1/portal/piezas')
      .query(consulta)
      .expect(200);
    return respuesta.body as Respuesta;
  };

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'silent';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configurarApp(
      moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const ubicacion = await prisma.ubicacion.create({
      data: { deposito: `Depósito ${marca}`, estanteria: 'Estantería 1', caja: 'Caja 01' },
    });
    ubicacionId = ubicacion.id;
    const comun = { descripcion: `Prueba ${marca}`, ubicacionId };
    await prisma.pieza.deleteMany({ where: { codigo: { in: codigos } } });
    await prisma.pieza.createMany({
      data: [
        {
          ...comun,
          codigo: codigos[0],
          titulo: `Comparsa de carnaval ${marca}`,
          tipo: 'FOTOGRAFIA',
          estado: 'PUBLICADA',
          anio: 1946,
        },
        {
          ...comun,
          codigo: codigos[1],
          titulo: `Crónica del Carnaval ${marca}`,
          tipo: 'PERIODICO',
          estado: 'PUBLICADA',
          anio: 1921,
        },
        {
          ...comun,
          codigo: codigos[2],
          titulo: `Reina del carnaval sin publicar ${marca}`,
          tipo: 'FOTOGRAFIA',
          estado: 'REVISADA',
          anio: 1947,
        },
        {
          ...comun,
          codigo: codigos[3],
          titulo: `Expediente reservado ${marca}`,
          tipo: 'DOCUMENTO',
          estado: 'PUBLICADA',
          anio: 1924,
          restringida: true,
        },
      ],
    });
  });

  afterAll(async () => {
    if (prisma && ubicacionId) {
      await prisma.pieza.deleteMany({ where: { codigo: { in: codigos } } });
      await prisma.ubicacion.delete({ where: { id: ubicacionId } });
    }
    await app?.close();
  });

  it('sin token devuelve solo las publicadas que coinciden con texto y tipo, paginadas', async () => {
    const cuerpo = await buscar({ busqueda: `CARNAVAL ${marca}`, tipo: 'FOTOGRAFIA' });

    expect(cuerpo.meta).toEqual({ pagina: 1, limite: 20, total: 1, totalPaginas: 1 });
    expect(cuerpo.datos[0]).toMatchObject({ codigo: codigos[0], anio: 1946, restringida: false });
    expect(cuerpo.datos[0].ubicacion.deposito).toBe(`Depósito ${marca}`);
  });

  it('filtra por década y pagina', async () => {
    const cuerpo = await buscar({ busqueda: marca, decada: 1920, limite: 1 });

    expect(cuerpo.meta).toMatchObject({ limite: 1, total: 1 });
    expect(cuerpo.datos.map((p) => p.codigo)).toEqual([codigos[1]]);
  });

  it('no encuentra la pieza restringida por texto, pero la lista sin sus datos y al final', async () => {
    const porTexto = await buscar({ busqueda: `reservado ${marca}` });
    expect(porTexto.meta.total).toBe(0);

    const todas = await buscar({ limite: 100, orden: 'codigo', direccion: 'desc' });
    const restringida = todas.datos.find((p) => p.codigo === codigos[3]);
    expect(restringida).toMatchObject({ titulo: null, anio: null, tipo: 'DOCUMENTO' });
    const primeraRestringida = todas.datos.findIndex((p) => p.restringida);
    expect(todas.datos.slice(primeraRestringida).every((p) => p.restringida)).toBe(true);
    expect(todas.datos.some((p) => p.codigo === codigos[2])).toBe(false);
  });

  it('sin coincidencias responde 200 con la lista vacía', async () => {
    const cuerpo = await buscar({ busqueda: `no-existe-${randomUUID()}` });

    expect(cuerpo).toEqual({
      datos: [],
      meta: { pagina: 1, limite: 20, total: 0, totalPaginas: 0 },
    });
  });

  it('responde 400 si la década o el tipo no son válidos', async () => {
    await request(app.getHttpServer()).get('/api/v1/portal/piezas?decada=1925').expect(400);
    await request(app.getHttpServer()).get('/api/v1/portal/piezas?tipo=MAPA').expect(400);
  });
});
