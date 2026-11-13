import { clienteApi } from '../../shared/api/cliente';
import type { InventarioPaginado, ParametrosInventario } from './tipos';

export const inventarioApi = {
  /** GET /piezas (PERSONAL, ADMIN): todas las piezas, en cualquier estado. */
  async listar(params: ParametrosInventario): Promise<InventarioPaginado> {
    const { data } = await clienteApi.get<InventarioPaginado>('/piezas', {
      params: { ...params, busqueda: params.busqueda?.trim() || undefined },
    });
    return data;
  },
};
