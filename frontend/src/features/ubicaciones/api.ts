import { clienteApi } from '../../shared/api/cliente';
import type {
  CrearUbicacion,
  ParametrosListarUbicaciones,
  Ubicacion,
  UbicacionesPaginadas,
} from './tipos';

export const ubicacionesApi = {
  async listar(params: ParametrosListarUbicaciones): Promise<UbicacionesPaginadas> {
    const { data } = await clienteApi.get<UbicacionesPaginadas>('/ubicaciones', {
      params: {
        ...params,
        busqueda: params.busqueda || undefined,
        deposito: params.deposito || undefined,
      },
    });
    return data;
  },

  async crear(datos: CrearUbicacion): Promise<Ubicacion> {
    const { data } = await clienteApi.post<Ubicacion>('/ubicaciones', {
      ...datos,
      descripcion: datos.descripcion?.trim() || undefined,
    });
    return data;
  },
};
