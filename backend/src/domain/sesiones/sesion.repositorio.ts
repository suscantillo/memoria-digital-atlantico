import { Sesion } from './sesion.entity';

export const SESION_REPOSITORIO = Symbol('SESION_REPOSITORIO');

export interface SesionRepositorio {
  guardar(sesion: Sesion): Promise<Sesion>;
  buscarPorTokenHash(tokenHash: string): Promise<Sesion | null>;
  revocar(id: string, fecha: Date): Promise<void>;
  revocarTodasDelUsuario(usuarioId: string, fecha: Date): Promise<void>;
}
