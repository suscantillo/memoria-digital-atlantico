import { Request } from 'express';
import { RolUsuario } from '../../domain/usuarios/rol-usuario';

export interface UsuarioAutenticado {
  id: string;
  correo: string;
  rol: RolUsuario;
}

export interface SolicitudAutenticada extends Request {
  usuario?: UsuarioAutenticado;
}
