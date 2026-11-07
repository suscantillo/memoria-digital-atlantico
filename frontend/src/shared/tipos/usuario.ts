export type RolUsuario = 'ADMIN' | 'PERSONAL' | 'PUBLICO';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

export interface SesionIniciada {
  tokenAcceso: string;
  tokenRefresco: string;
  usuario: Usuario;
}
