import { ErrorConflicto, ErrorNoEncontrado } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { EstadoPieza } from '../../domain/piezas/estado-pieza';
import {
  FichaPieza,
  Pieza,
  PiezaNoPublicadaError,
  PiezaNoRetiradaError,
  PiezaSinEscaneoAprobadoError,
} from '../../domain/piezas/pieza.entity';
import { CambioPublicacion, PublicacionPiezas } from '../../domain/piezas/publicacion-piezas';
import { RetirarPieza, VolverAPublicarPieza } from './cambiar-publicacion.use-case';

const ADMIN_ID = 'admin-id';
const AHORA = new Date('2026-11-13T05:00:00.000Z');

function ficha(estado: EstadoPieza, conEscaneo = true): FichaPieza {
  return {
    pieza: Pieza.reconstruir({
      id: 'pieza-id',
      codigo: CodigoPieza.desde('MDA-2026-0016'),
      titulo: 'Antiguo Camellón Abello',
      descripcion: null,
      tipo: 'FOTOGRAFIA',
      estado,
      anio: 1903,
      restringida: false,
      ubicacion: { id: 'u', deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 02' },
      archivoAprobado: conEscaneo ? { id: 'archivo-id', tipoMime: 'image/jpeg' } : null,
      creadoEn: AHORA,
      actualizadoEn: AHORA,
    }),
    ubicacion: { id: 'u', deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 02' },
    eventos: [],
  };
}

/** Guarda el estado que llega y lo devuelve en la siguiente lectura, como la base. */
class Memoria implements PublicacionPiezas {
  cambios: CambioPublicacion[] = [];
  otroGano = false;
  constructor(public actual: FichaPieza | null) {}
  repositorio = { buscarFicha: () => Promise.resolve(this.actual) };
  cambiarPublicacion(cambio: CambioPublicacion) {
    if (this.otroGano) return Promise.resolve(false);
    this.cambios.push(cambio);
    this.actual = ficha(cambio.hacia);
    return Promise.resolve(true);
  }
}

describe('Retirar y volver a publicar una pieza', () => {
  it('retira una pieza PUBLICADA: queda REVISADA y el motivo va al historial', async () => {
    const memoria = new Memoria(ficha('PUBLICADA'));

    const resultado = await new RetirarPieza(memoria.repositorio, memoria).ejecutar(
      'pieza-id',
      '  La fecha está mal ',
      ADMIN_ID,
    );

    expect(resultado.estado).toBe('REVISADA');
    expect(memoria.cambios).toEqual([
      {
        piezaId: 'pieza-id',
        usuarioId: ADMIN_ID,
        desde: 'PUBLICADA',
        hacia: 'REVISADA',
        accion: 'RETIRADA',
        detalle: 'Retirada del portal: La fecha está mal',
      },
    ]);
  });

  it('solo retira lo que está PUBLICADO', async () => {
    const memoria = new Memoria(ficha('ESCANEADA'));

    await expect(
      new RetirarPieza(memoria.repositorio, memoria).ejecutar('pieza-id', 'motivo', ADMIN_ID),
    ).rejects.toBeInstanceOf(PiezaNoPublicadaError);
    expect(memoria.cambios).toEqual([]);
  });

  it('vuelve a publicar una pieza REVISADA con escaneo aprobado', async () => {
    const memoria = new Memoria(ficha('REVISADA'));

    const resultado = await new VolverAPublicarPieza(memoria.repositorio, memoria).ejecutar(
      'pieza-id',
      ADMIN_ID,
    );

    expect(resultado.estado).toBe('PUBLICADA');
    expect(memoria.cambios[0]).toMatchObject({ desde: 'REVISADA', accion: 'PUBLICADA' });
  });

  it('no publica sin escaneo aprobado ni desde otro estado', async () => {
    const sinEscaneo = new Memoria(ficha('REVISADA', false));
    await expect(
      new VolverAPublicarPieza(sinEscaneo.repositorio, sinEscaneo).ejecutar('pieza-id', ADMIN_ID),
    ).rejects.toBeInstanceOf(PiezaSinEscaneoAprobadoError);

    const registrada = new Memoria(ficha('REGISTRADA'));
    await expect(
      new VolverAPublicarPieza(registrada.repositorio, registrada).ejecutar('pieza-id', ADMIN_ID),
    ).rejects.toBeInstanceOf(PiezaNoRetiradaError);
  });

  it('responde 409 si otra persona la cambió al mismo tiempo y 404 si no existe', async () => {
    const carrera = new Memoria(ficha('PUBLICADA'));
    carrera.otroGano = true;
    await expect(
      new RetirarPieza(carrera.repositorio, carrera).ejecutar('pieza-id', 'motivo', ADMIN_ID),
    ).rejects.toBeInstanceOf(ErrorConflicto);

    const vacia = new Memoria(null);
    await expect(
      new RetirarPieza(vacia.repositorio, vacia).ejecutar('pieza-id', 'motivo', ADMIN_ID),
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });
});
