import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SolicitudAutenticada, UsuarioAutenticado } from '../solicitud-autenticada';

export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioAutenticado | undefined =>
    contexto.switchToHttp().getRequest<SolicitudAutenticada>().usuario,
);
