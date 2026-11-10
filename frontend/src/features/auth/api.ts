import { clienteApi } from '../../shared/api/cliente';
import type { SesionIniciada, Usuario } from '../../shared/tipos/usuario';

export interface CredencialesIngreso {
  correo: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  /** Debe llegar en true: sin consentimiento la API no crea la cuenta (HU-01). */
  aceptaPrivacidad: boolean;
  versionPrivacidad: string;
}

/** Lo que el sistema guarda de quien tiene cuenta, para mostrárselo (Ley 1581). */
export interface CuentaPropia {
  nombre: string;
  correo: string;
  rol: Usuario['rol'];
  creadoEn: string;
  /** Fecha en que aceptó el aviso; null en cuentas internas creadas por un administrador. */
  consentimientoEn: string | null;
  versionPrivacidad: string | null;
}

export const authApi = {
  async registro(datos: DatosRegistro): Promise<void> {
    await clienteApi.post('/auth/registro', datos);
  },

  async cuenta(): Promise<CuentaPropia> {
    const { data } = await clienteApi.get<CuentaPropia>('/auth/cuenta');
    return data;
  },

  async eliminarCuenta(): Promise<void> {
    await clienteApi.delete('/auth/cuenta');
  },

  async ingresar(credenciales: CredencialesIngreso): Promise<SesionIniciada> {
    const { data } = await clienteApi.post<SesionIniciada>('/auth/ingresar', credenciales);
    return data;
  },

  async salir(tokenRefresco: string): Promise<void> {
    await clienteApi.post('/auth/salir', { tokenRefresco });
  },

  async yo(): Promise<Usuario> {
    const { data } = await clienteApi.get<Usuario>('/auth/yo');
    return data;
  },
};
