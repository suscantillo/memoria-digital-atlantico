import { clienteApi } from '../../shared/api/cliente';
import type {
  CrearCuentaPersonal,
  ParametrosListarUsuarios,
  RolAdministrable,
  UsuarioAdministrado,
  UsuariosPaginados,
} from './tipos';

export const usuariosApi = {
  async listar(params: ParametrosListarUsuarios): Promise<UsuariosPaginados> {
    const { data } = await clienteApi.get<UsuariosPaginados>('/usuarios', {
      params: { ...params, busqueda: params.busqueda || undefined },
    });
    return data;
  },

  async crear(datos: CrearCuentaPersonal): Promise<UsuarioAdministrado> {
    const { data } = await clienteApi.post<UsuarioAdministrado>('/usuarios', {
      ...datos,
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
    });
    return data;
  },

  async cambiarRol(id: string, rol: RolAdministrable): Promise<UsuarioAdministrado> {
    const { data } = await clienteApi.patch<UsuarioAdministrado>(`/usuarios/${id}/rol`, { rol });
    return data;
  },

  async desactivar(id: string): Promise<UsuarioAdministrado> {
    const { data } = await clienteApi.patch<UsuarioAdministrado>(`/usuarios/${id}/desactivar`);
    return data;
  },

  async reactivar(id: string): Promise<UsuarioAdministrado> {
    const { data } = await clienteApi.patch<UsuarioAdministrado>(`/usuarios/${id}/reactivar`);
    return data;
  },
};
