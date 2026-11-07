import type { SesionIniciada } from '../tipos/usuario';

const CLAVE = 'mda.sesion';
export const EVENTO_SESION_EXPIRADA = 'mda:sesion-expirada';

export const almacenSesion = {
  leer(): SesionIniciada | null {
    try {
      const crudo = localStorage.getItem(CLAVE);
      return crudo ? (JSON.parse(crudo) as SesionIniciada) : null;
    } catch {
      return null;
    }
  },

  guardar(sesion: SesionIniciada): void {
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
  },

  limpiar(): void {
    localStorage.removeItem(CLAVE);
  },

  notificarExpiracion(): void {
    this.limpiar();
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
  },
};
