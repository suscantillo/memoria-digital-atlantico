import { RolUsuario } from '../../../domain/usuarios/rol-usuario';

export const SERVICIO_TOKENS = Symbol('SERVICIO_TOKENS');

export interface PayloadAcceso {
  sub: string;
  correo: string;
  rol: RolUsuario;
}

export interface PayloadRefresco {
  sub: string;
  jti: string;
}

export interface ServicioTokens {
  firmarAcceso(payload: PayloadAcceso): Promise<string>;
  verificarAcceso(token: string): Promise<PayloadAcceso>;
  firmarRefresco(payload: PayloadRefresco): Promise<string>;
  verificarRefresco(token: string): Promise<PayloadRefresco>;
  duracionRefrescoMs(): number;
}
