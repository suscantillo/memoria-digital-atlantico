import * as Joi from 'joi';

export type EntornoEjecucion = 'development' | 'test' | 'production';

export interface Configuracion {
  NODE_ENV: EntornoEjecucion;
  PORT: number;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
  PUBLIC_WEB_URL: string;
  STORAGE_DIR: string;
}

/** Ej: 15m, 7d */
export const PATRON_DURACION = /^\d+(ms|s|m|h|d)$/;

export const esquemaConfiguracion = Joi.object<Configuracion, true>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().pattern(PATRON_DURACION).default('15m'),
  JWT_REFRESH_TTL: Joi.string().pattern(PATRON_DURACION).default('7d'),
  PUBLIC_WEB_URL: Joi.string().uri().required(),
  STORAGE_DIR: Joi.string().default('./storage'),
}).unknown(true);

const MULTIPLICADORES: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function duracionAMilisegundos(duracion: string): number {
  const coincidencia = /^(\d+)(ms|s|m|h|d)$/.exec(duracion);
  if (!coincidencia) {
    throw new Error(`Duración inválida: "${duracion}". Usa formatos como 15m, 12h o 7d.`);
  }
  return Number(coincidencia[1]) * MULTIPLICADORES[coincidencia[2]];
}
