import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ErrorConflicto,
  ErrorDominio,
  ErrorNoAutorizado,
  ErrorNoEncontrado,
  ErrorRegla,
} from '../../../domain/comun/errores';

export interface RespuestaError {
  statusCode: number;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}

interface ErrorTraducido {
  statusCode: number;
  message: string;
  errors?: string[];
}

export const MENSAJE_VALIDACION = 'Datos de entrada inválidos.';
export const MENSAJE_ERROR_INTERNO = 'Error interno del servidor.';

@Catch()
export class FiltroExcepcionesHttp implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionesHttp.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();
    const solicitud = contexto.getRequest<Request>();

    const traducido = this.traducir(excepcion);

    if (traducido.statusCode >= 500) {
      this.logger.error(
        `${solicitud.method} ${solicitud.url} -> ${traducido.statusCode}`,
        excepcion instanceof Error ? excepcion.stack : String(excepcion),
      );
    }

    const cuerpo: RespuestaError = {
      statusCode: traducido.statusCode,
      message: traducido.message,
      ...(traducido.errors ? { errors: traducido.errors } : {}),
      path: solicitud.url,
      timestamp: new Date().toISOString(),
    };

    respuesta.status(traducido.statusCode).json(cuerpo);
  }

  private traducir(excepcion: unknown): ErrorTraducido {
    if (excepcion instanceof HttpException) {
      return this.traducirHttp(excepcion);
    }
    if (excepcion instanceof ErrorDominio) {
      return { statusCode: this.estadoDeDominio(excepcion), message: excepcion.message };
    }
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: MENSAJE_ERROR_INTERNO };
  }

  private traducirHttp(excepcion: HttpException): ErrorTraducido {
    const statusCode = excepcion.getStatus();
    const cuerpo = excepcion.getResponse();

    if (typeof cuerpo === 'string') {
      return { statusCode, message: cuerpo };
    }

    const mensaje = (cuerpo as { message?: unknown }).message;
    if (Array.isArray(mensaje)) {
      // lista de errores de class-validator
      return { statusCode, message: MENSAJE_VALIDACION, errors: mensaje.map(String) };
    }
    return { statusCode, message: typeof mensaje === 'string' ? mensaje : excepcion.message };
  }

  private estadoDeDominio(error: ErrorDominio): number {
    if (error instanceof ErrorNoEncontrado) return HttpStatus.NOT_FOUND;
    if (error instanceof ErrorConflicto) return HttpStatus.CONFLICT;
    if (error instanceof ErrorNoAutorizado) return HttpStatus.UNAUTHORIZED;
    if (error instanceof ErrorRegla) return HttpStatus.UNPROCESSABLE_ENTITY;
    return HttpStatus.BAD_REQUEST;
  }
}
