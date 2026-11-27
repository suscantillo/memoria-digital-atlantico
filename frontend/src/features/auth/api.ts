import { clienteApi } from '../../shared/api/cliente';
import type { RolUsuario, SesionIniciada, Usuario } from '../../shared/tipos/usuario';

export interface CredencialesIngreso {
  correo: string;
  contrasena: string;
}

export interface DatosRegistro extends CredencialesIngreso {
  nombre: string;
  aceptaPrivacidad: true;
  versionPrivacidad: string;
}

export interface UsuarioRegistrado {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  consentimientoEn: string | null;
  versionPrivacidad: string | null;
}

/** GET /auth/cuenta: todo lo que el sistema guarda de la persona (Ley 1581). */
export interface MiCuenta {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  consentimientoEn: string | null;
  versionPrivacidad: string | null;
  creadoEn: string;
  /** false en las cuentas del personal: esas las desactiva el administrador. */
  puedeEliminarla: boolean;
}

export const authApi = {
  /** POST /auth/registro: crea una cuenta PUBLICO; responde 409 si el correo ya existe. */
  async registro(datos: DatosRegistro): Promise<UsuarioRegistrado> {
    const { data } = await clienteApi.post<UsuarioRegistrado>('/auth/registro', datos);
    return data;
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

  async cuenta(): Promise<MiCuenta> {
    const { data } = await clienteApi.get<MiCuenta>('/auth/cuenta');
    return data;
  },

  /** DELETE /auth/cuenta: responde 422 si la contraseña no es la de la cuenta. */
  async eliminarCuenta(contrasena: string): Promise<void> {
    await clienteApi.delete('/auth/cuenta', { data: { contrasena } });
  },
};
