import { isAxiosError } from 'axios';
import { clienteApi } from '../../shared/api/cliente';
import { portalApi } from '../portal/api';
import { NOMBRE_TIPO, type PiezaPortal, type TipoPieza } from '../portal/tipos';
import { filtrosDePregunta } from './palabras';
import type { PreguntaAsistente, RespuestaAsistente } from './tipos';

const MAXIMO_PIEZAS = 4;

/** Errores con los que Miga sigue con el buscador: no hay ruta, no hay IA o se llegó al límite. */
function usarBuscador(error: unknown) {
  if (!isAxiosError(error)) return false;
  const estado = error.response?.status;
  return (
    estado === undefined || estado === 404 || estado === 429 || estado === 501 || estado === 503
  );
}

/**
 * Modo búsqueda (HU-24, criterio 2): sin IA se buscan las palabras clave de la pregunta en el
 * portal. Solo devuelve piezas publicadas, así que nunca hay nada inventado.
 */
async function buscarSinIa(pregunta: string): Promise<RespuestaAsistente> {
  const { palabras, tipo, decada } = filtrosDePregunta(pregunta);
  // cada palabra por separado: el buscador pide que el texto entero aparezca en la pieza
  const textos: (string | undefined)[] = palabras.length > 0 ? palabras : [undefined];
  const resultados = await Promise.all(
    textos.map((busqueda) =>
      portalApi.buscar({ busqueda, tipo, decada, limite: MAXIMO_PIEZAS }).then((r) => r.datos),
    ),
  );

  const vistas = new Set<string>();
  const piezas: PiezaPortal[] = [];
  for (const pieza of resultados.flat()) {
    if (vistas.has(pieza.codigo)) continue;
    vistas.add(pieza.codigo);
    piezas.push(pieza);
    if (piezas.length === MAXIMO_PIEZAS) break;
  }

  const sinFiltros = palabras.length === 0 && !tipo && decada === undefined;
  return {
    modo: 'BUSQUEDA',
    mensaje: sinFiltros
      ? 'No reconocí palabras para buscar. Prueba con un lugar, un tema, un tipo de pieza o un año.'
      : piezas.length > 0
        ? `Busqué ${describir(palabras, tipo, decada)} y encontré ${piezas.length === 1 ? 'esta pieza' : 'estas piezas'}.`
        : `Busqué ${describir(palabras, tipo, decada)} y no encontré piezas publicadas.`,
    piezas: sinFiltros ? [] : piezas,
    sugerencias: [],
  };
}

function describir(palabras: string[], tipo?: TipoPieza, decada?: number) {
  const partes: string[] = [];
  partes.push(tipo ? NOMBRE_TIPO[tipo].plural.toLowerCase() : 'piezas');
  if (palabras.length > 0) partes.push(`con «${palabras.join('», «')}»`);
  if (decada !== undefined) partes.push(`de los años ${decada}`);
  return partes.join(' ');
}

export const asistenteApi = {
  /** POST /asistente/preguntas: es pública. Si la API del asistente no está, usa el buscador. */
  async preguntar(pregunta: string): Promise<RespuestaAsistente> {
    try {
      const cuerpo: PreguntaAsistente = { pregunta: pregunta.trim() };
      const { data } = await clienteApi.post<RespuestaAsistente>('/asistente/preguntas', cuerpo, {
        timeout: 30_000,
      });
      return data;
    } catch (error) {
      if (usarBuscador(error)) return buscarSinIa(pregunta);
      throw error;
    }
  },
};
