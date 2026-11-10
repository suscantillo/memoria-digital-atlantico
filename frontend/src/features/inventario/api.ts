import { clienteApi } from '../../shared/api/cliente';
import type {
  ContadoresPiezas,
  ParametrosListarPiezas,
  PiezaInventario,
  PiezasPaginadas,
} from './tipos';

export const inventarioApi = {
  async listar(params: ParametrosListarPiezas): Promise<PiezasPaginadas> {
    const { data } = await clienteApi.get<PiezasPaginadas>('/piezas', {
      params: {
        ...params,
        busqueda: params.busqueda || undefined,
        estado: params.estado || undefined,
        tipo: params.tipo || undefined,
        ubicacionId: params.ubicacionId || undefined,
      },
    });
    return data;
  },

  async contadores(): Promise<ContadoresPiezas> {
    const { data } = await clienteApi.get<ContadoresPiezas>('/piezas/contadores');
    return data;
  },

  async publicar(id: string): Promise<PiezaInventario> {
    const { data } = await clienteApi.post<PiezaInventario>(`/piezas/${id}/publicar`);
    return data;
  },
};
