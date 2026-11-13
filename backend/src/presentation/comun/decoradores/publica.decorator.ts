import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CLAVE_PUBLICA = 'publica';

/**
 * Las guardias de autenticación y roles son globales: toda ruta exige token salvo que lleve esta
 * marca. Así una ruta nueva nace protegida y abrirla es una decisión explícita.
 */
export const Publica = () => SetMetadata(CLAVE_PUBLICA, true);

export function esRutaPublica(reflector: Reflector, contexto: ExecutionContext): boolean {
  return (
    reflector.getAllAndOverride<boolean | undefined>(CLAVE_PUBLICA, [
      contexto.getHandler(),
      contexto.getClass(),
    ]) === true
  );
}
