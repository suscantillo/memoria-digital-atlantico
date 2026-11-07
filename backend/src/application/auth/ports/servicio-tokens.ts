import { RolUsuario } from '../../../domain/usuarios/rol-usuario';

export const SERVICIO_TOKENS = Symbol('SERVICIO_TOKENS');

export interface PayloadAcceso {
  sub: string;
  correo: string;
  rol: RolUsuario;
}

export interface ServicioTokens {
  firmarAcceso(payload: PayloadAcceso): Promise<string>;
  verificarAcceso(token: string): Promise<PayloadAcceso>;
  generarRefresco(): string;
  hashRefresco(token: string): string;
  duracionRefrescoMs(): number;
}
