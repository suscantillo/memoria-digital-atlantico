import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/configurar-app';
import { BcryptHasherContrasenas } from '../src/infrastructure/auth/bcrypt-hasher-contrasenas';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

interface Respuesta {
  datos: { codigo: string; estado: string; titulo: string; ubicacion: { id: string } }[];
  meta: { pagina: number; limite: number; total: number; totalPaginas: number };
}

describe('GET /api/v1/piezas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const marca = randomUUID().slice(0, 8);
  const contrasena = 'Secreta.123';
  const correos = {
    PERSONAL: `inv-personal-${marca}@prueba.local`,
    PUBLICO: `inv-publico-${marca}@prueba.local`,
  };
  const prefijo = 'MDA-9996-';
  let ubicacionId: string;
  let tokenPersonal: string;

  const ingresar = async (correo: string): Promise<string> => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/v1/auth/ingresar')
      .send({ correo, contrasena })
      .expect(200);
    return (respuesta.body as { tokenAcceso: string }).tokenAcceso;
  };

  const listar = (consulta: string, token = tokenPersonal) =>
    request(app.getHttpServer())
      .get(`/api/v1/piezas?ubicacionId=${ubicacionId}&${consulta}`)
      .set('Authorization', `Bearer ${token}`);

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
          nombre: `Inventario ${rol}`,
          correo,
          contrasenaHash: hash,
          rol: rol as 'PERSONAL' | 'PUBLICO',
        },
      });
    }
    // una caja propia para que las piezas de la semilla no cambien los totales
    const ubicacion = await prisma.ubicacion.create({
      data: {
        deposito: `Depósito inventario ${marca}`,
        estanteria: 'Estantería 1',
        caja: 'Caja 01',
      },
    });
    ubicacionId = ubicacion.id;
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    // 30 piezas: 25 REGISTRADA y 5 ESCANEADA
    await prisma.pieza.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        codigo: `${prefijo}${String(i + 1).padStart(4, '0')}`,
        titulo: i === 7 ? 'Carta ficticia sobre el muelle' : `Pieza de inventario ${i + 1}`,
        tipo: i % 2 === 0 ? ('DOCUMENTO' as const) : ('FOTOGRAFIA' as const),
        estado: i < 25 ? ('REGISTRADA' as const) : ('ESCANEADA' as const),
        anio: 1900 + i,
        restringida: i === 3,
        ubicacionId,
      })),
    });
    tokenPersonal = await ingresar(correos.PERSONAL);
  }, 30_000);

  afterAll(async () => {
    await prisma.pieza.deleteMany({ where: { codigo: { startsWith: prefijo } } });
    await prisma.ubicacion.deleteMany({ where: { id: ubicacionId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: Object.values(correos) } } });
    await app.close();
  });

  it('criterio 1: la página 2 de las REGISTRADA trae solo esas, con total y páginas', async () => {
    const respuesta = await listar('pagina=2&limite=10&estado=REGISTRADA').expect(200);
    const cuerpo = respuesta.body as Respuesta;

    expect(cuerpo.meta).toEqual({ pagina: 2, limite: 10, total: 25, totalPaginas: 3 });
    expect(cuerpo.datos).toHaveLength(10);
    expect(cuerpo.datos.every((p) => p.estado === 'REGISTRADA')).toBe(true);
    expect(cuerpo.datos[0]?.codigo).toBe(`${prefijo}0011`);
  });

  it('filtra por tipo y busca en código, título y descripción', async () => {
    const porTipo = (await listar('tipo=FOTOGRAFIA&limite=100').expect(200)).body as Respuesta;
    expect(porTipo.meta.total).toBe(15);

    const porTexto = (await listar('busqueda=muelle').expect(200)).body as Respuesta;
    expect(porTexto.datos.map((p) => p.codigo)).toEqual([`${prefijo}0008`]);

    const porCodigo = (await listar(`busqueda=${prefijo}0030`).expect(200)).body as Respuesta;
    expect(porCodigo.meta.total).toBe(1);
  });

  it('ordena por el campo pedido y muestra las restringidas con su título', async () => {
    const respuesta = await listar('orden=anio&direccion=desc&limite=1').expect(200);
    expect((respuesta.body as Respuesta).datos[0]?.codigo).toBe(`${prefijo}0030`);

    const restringida = (await listar(`busqueda=${prefijo}0004`).expect(200)).body as Respuesta;
    expect(restringida.datos[0]?.titulo).toBe('Pieza de inventario 4');
  });

  it('valida la consulta y solo deja entrar al personal', async () => {
    await listar('estado=PERDIDA').expect(400);
    await listar('orden=color').expect(400);
    await request(app.getHttpServer()).get('/api/v1/piezas').expect(401);
    await listar('', await ingresar(correos.PUBLICO)).expect(403);
  });
});
