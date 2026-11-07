import { AxiosError } from 'axios';
import type { RespuestaError } from '../tipos/api';

export interface ErrorApi {
  statusCode: number | null;
  message: string;
  errors: string[];
}

export function interpretarError(error: unknown): ErrorApi {
  if (error instanceof AxiosError) {
    const cuerpo = error.response?.data as Partial<RespuestaError> | undefined;
    if (cuerpo && typeof cuerpo.message === 'string') {
      return {
        statusCode: cuerpo.statusCode ?? error.response?.status ?? null,
        message: cuerpo.message,
        errors: cuerpo.errors ?? [],
      };
    }
    if (!error.response) {
      return {
        statusCode: null,
        message: 'No se pudo conectar con el servidor. Revisa tu conexión.',
        errors: [],
      };
    }
    return { statusCode: error.response.status, message: error.message, errors: [] };
  }
  if (error instanceof Error) {
    return { statusCode: null, message: error.message, errors: [] };
  }
  return { statusCode: null, message: 'Ocurrió un error inesperado.', errors: [] };
}
