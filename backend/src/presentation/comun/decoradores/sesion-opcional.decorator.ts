import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CLAVE_SESION_OPCIONAL = 'sesionOpcional';

/**
 * La ruta responde con o sin token, pero si llega uno se valida y el usuario queda en la solicitud.
 * Sirve cuando lo que se entrega depende de quién pregunta; el permiso lo decide el caso de uso.
 */
export const SesionOpcional = () => SetMetadata(CLAVE_SESION_OPCIONAL, true);

export function esSesionOpcional(reflector: Reflector, contexto: ExecutionContext): boolean {
  return (
    reflector.getAllAndOverride<boolean | undefined>(CLAVE_SESION_OPCIONAL, [
      contexto.getHandler(),
      contexto.getClass(),
    ]) === true
  );
}
