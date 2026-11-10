import { clienteApi } from '../../shared/api/cliente';
import type {
  CrearCuenta,
  CuentaUsuario,
  ParametrosListarUsuarios,
  UsuariosPaginados,
} from './tipos';

export const usuariosApi = {
  async listar(params: ParametrosListarUsuarios): Promise<UsuariosPaginados> {
    const { data } = await clienteApi.get<UsuariosPaginados>('/usuarios', {
      params: { ...params, rol: params.rol || undefined, busqueda: params.busqueda || undefined },
    });
    return data;
  },

  async crear(datos: CrearCuenta): Promise<CuentaUsuario> {
    const { data } = await clienteApi.post<CuentaUsuario>('/usuarios', datos);
    return data;
  },

  async cambiarActiva(id: string, activa: boolean): Promise<CuentaUsuario> {
    const { data } = await clienteApi.patch<CuentaUsuario>(`/usuarios/${id}`, { activa });
    return data;
  },
};
