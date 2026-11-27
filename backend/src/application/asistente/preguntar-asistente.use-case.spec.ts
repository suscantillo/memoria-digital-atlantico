import { PiezaRepositorioMemoria } from '../../../test/dobles/pieza-repositorio.memoria';
import { ErrorServicioNoDisponible } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza, PropiedadesPieza } from '../../domain/piezas/pieza.entity';
import { PreguntarAsistenteDto } from './dto/preguntar-asistente.dto';
import { PreguntarAsistente } from './preguntar-asistente.use-case';
import { FiltrosInterpretados, ModeloAsistente, PiezaCandidata, Recomendacion } from './puertos';

let consecutivo = 0;

function pieza(parcial: Partial<PropiedadesPieza> = {}): Pieza {
  consecutivo += 1;
  const ahora = new Date('2026-11-10T00:00:00.000Z');
  return Pieza.reconstruir({
    id: `00000000-0000-0000-0000-${String(consecutivo).padStart(12, '0')}`,
    codigo: CodigoPieza.generar(2026, consecutivo),
    titulo: `Pieza ${consecutivo}`,
    descripcion: null,
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1900,
    restringida: false,
    ubicacion: { id: 'u-1', deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 01' },
    archivoAprobado: null,
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...parcial,
  });
}

class ModeloFalso implements ModeloAsistente {
  filtros: FiltrosInterpretados = { palabras: [], tipo: null, decada: null };
  recomendacion: Recomendacion = { mensaje: '', codigos: [], sugerencias: [] };
  candidatasRecibidas: PiezaCandidata[] = [];

  interpretar(): Promise<FiltrosInterpretados> {
    return Promise.resolve(this.filtros);
  }

  recomendar(_pregunta: string, candidatas: PiezaCandidata[]): Promise<Recomendacion> {
    this.candidatasRecibidas = candidatas;
    return Promise.resolve(this.recomendacion);
  }
}

function pregunta(texto: string): PreguntarAsistenteDto {
  return Object.assign(new PreguntarAsistenteDto(), { pregunta: texto });
}

describe('PreguntarAsistente', () => {
  let repositorio: PiezaRepositorioMemoria;
  let modelo: ModeloFalso;
  let asistente: PreguntarAsistente;

  beforeEach(() => {
    consecutivo = 0;
    repositorio = new PiezaRepositorioMemoria();
    modelo = new ModeloFalso();
    asistente = new PreguntarAsistente(repositorio, modelo);
    repositorio.agregar(
      pieza({ titulo: 'Comparsa de carnaval en la plaza', tipo: 'FOTOGRAFIA', anio: 1946 }),
    );
    repositorio.agregar(
      pieza({ titulo: 'Crónica del Carnaval de 1921', tipo: 'PERIODICO', anio: 1921 }),
    );
    repositorio.agregar(pieza({ titulo: 'Muelle de Puerto Colombia', tipo: 'FOTOGRAFIA' }));
    repositorio.agregar(
      pieza({ titulo: 'Reina del carnaval sin publicar', tipo: 'FOTOGRAFIA', estado: 'REVISADA' }),
    );
    repositorio.agregar(pieza({ titulo: 'Expediente del carnaval reservado', restringida: true }));
  });

  it('sin modelo configurado responde que el servicio no está disponible', async () => {
    const sinModelo = new PreguntarAsistente(repositorio, null);

    await expect(sinModelo.ejecutar(pregunta('carnaval'))).rejects.toBeInstanceOf(
      ErrorServicioNoDisponible,
    );
  });

  it('recomienda las piezas que el modelo elige entre las candidatas del catálogo', async () => {
    modelo.filtros = { palabras: ['carnaval'], tipo: null, decada: null };
    modelo.recomendacion = {
      mensaje: ' Estas piezas muestran el carnaval. ',
      codigos: ['MDA-2026-0002', 'MDA-2026-0001'],
      sugerencias: ['¿Y el carnaval de los años 50?'],
    };

    const respuesta = await asistente.ejecutar(pregunta('¿Qué hay del carnaval?'));

    expect(respuesta).toMatchObject({
      modo: 'IA',
      mensaje: 'Estas piezas muestran el carnaval.',
      sugerencias: ['¿Y el carnaval de los años 50?'],
    });
    expect(respuesta.piezas.map((p) => p.codigo)).toEqual(['MDA-2026-0002', 'MDA-2026-0001']);
  });

  it('nunca le pasa al modelo piezas restringidas ni sin publicar', async () => {
    modelo.filtros = { palabras: ['carnaval'], tipo: null, decada: null };

    await asistente.ejecutar(pregunta('carnaval'));

    expect(modelo.candidatasRecibidas.map((c) => c.titulo)).toEqual([
      'Comparsa de carnaval en la plaza',
      'Crónica del Carnaval de 1921',
    ]);
  });

  it('descarta los códigos que no salieron del catálogo y los repetidos', async () => {
    modelo.filtros = { palabras: ['carnaval'], tipo: null, decada: null };
    modelo.recomendacion = {
      mensaje: 'Mira esto.',
      codigos: ['MDA-2026-0001', 'MDA-2099-9999', 'MDA-2026-0005', 'MDA-2026-0001'],
      sugerencias: [],
    };

    const respuesta = await asistente.ejecutar(pregunta('carnaval'));

    expect(respuesta.piezas.map((p) => p.codigo)).toEqual(['MDA-2026-0001']);
  });

  it('busca cada palabra por separado y combina el tipo que pidió la persona', async () => {
    modelo.filtros = { palabras: ['carnaval', 'muelle'], tipo: 'FOTOGRAFIA', decada: null };

    await asistente.ejecutar(pregunta('fotos del carnaval y del muelle'));

    expect(modelo.candidatasRecibidas.map((c) => c.codigo)).toEqual([
      'MDA-2026-0001',
      'MDA-2026-0003',
    ]);
  });

  it('ignora un tipo o una década que el modelo haya inventado', async () => {
    modelo.filtros = { palabras: ['carnaval'], tipo: 'MAPA' as never, decada: 1923 };

    await asistente.ejecutar(pregunta('carnaval'));

    expect(modelo.candidatasRecibidas).toHaveLength(2);
  });

  it('sin palabras ni filtros no busca nada y deja que el modelo responda sin piezas', async () => {
    modelo.recomendacion = {
      mensaje: 'Cuéntame qué tema te interesa.',
      codigos: ['MDA-2026-0001'],
      sugerencias: [],
    };

    const respuesta = await asistente.ejecutar(pregunta('hola'));

    expect(modelo.candidatasRecibidas).toEqual([]);
    expect(respuesta.piezas).toEqual([]);
  });
});
