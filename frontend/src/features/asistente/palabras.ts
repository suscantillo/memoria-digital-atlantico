import type { TipoPieza } from '../portal/tipos';

/**
 * Sin IA, el buscador del portal no entiende frases: «¿cómo era Barranquilla en 1910?» no coincide
 * con ningún título. Se sacan las palabras que sí sirven para buscar.
 */
const VACIAS = new Set(
  (
    'a al algo alguna algunas alguno algunos ante antes aqui archivo busco buscar cerca como con ' +
    'cual cuales cuando de del desde donde el ella ellos en entre era eran es esa ese eso esta este ' +
    'esto fue fueron gustaria hacia hasta hay la las le lo los mas me mi mis muestra muestrame muy ' +
    'no nos o para pero por que quiero saber se sea ser si sin sobre son su sus tambien tiene ' +
    'tienes todo todos tu un una uno unos ver y ya anos epoca siglo comienzos principios finales xix xx xxi'
  ).split(' '),
);

const sinTildes = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** Palabras que en realidad piden un tipo de pieza; se vuelven filtro y no se buscan como texto. */
const TIPOS: Record<string, TipoPieza> = {
  foto: 'FOTOGRAFIA',
  fotos: 'FOTOGRAFIA',
  fotografia: 'FOTOGRAFIA',
  fotografias: 'FOTOGRAFIA',
  imagenes: 'FOTOGRAFIA',
  periodico: 'PERIODICO',
  periodicos: 'PERIODICO',
  prensa: 'PERIODICO',
  revista: 'PERIODICO',
  revistas: 'PERIODICO',
  documento: 'DOCUMENTO',
  documentos: 'DOCUMENTO',
  planos: 'DOCUMENTO',
};

export interface FiltrosPregunta {
  palabras: string[];
  tipo?: TipoPieza;
  /** Primer año de la década de un año que aparezca en la pregunta: 1913 → 1910. */
  decada?: number;
}

/** Lo que se le puede pasar al buscador del portal a partir de una pregunta en lenguaje natural. */
export function filtrosDePregunta(pregunta: string, maximo = 4): FiltrosPregunta {
  const filtros: FiltrosPregunta = { palabras: [] };
  const vistas = new Set<string>();
  for (const palabra of pregunta.match(/[\p{L}\p{N}]+/gu) ?? []) {
    const clave = sinTildes(palabra.toLowerCase());
    if (TIPOS[clave]) {
      filtros.tipo ??= TIPOS[clave];
      continue;
    }
    if (/^1[5-9]\d\d$|^20[0-2]\d$/.test(clave)) {
      filtros.decada ??= Math.floor(Number(clave) / 10) * 10;
      continue;
    }
    if (clave.length < 3 || VACIAS.has(clave) || vistas.has(clave)) continue;
    vistas.add(clave);
    if (filtros.palabras.length < maximo) filtros.palabras.push(palabra);
  }
  return filtros;
}
