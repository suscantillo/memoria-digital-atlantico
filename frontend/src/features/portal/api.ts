import { clienteApi } from '../../shared/api/cliente';
import type { ParametrosBuscarPiezas, PiezasPortalPaginadas } from './tipos';

export const portalApi = {
  /** GET /portal/piezas: solo piezas PUBLICADAS; es pública, no pide sesión. */
  async buscar(params: ParametrosBuscarPiezas): Promise<PiezasPortalPaginadas> {
    const { data } = await clienteApi.get<PiezasPortalPaginadas>('/portal/piezas', {
      params: { ...params, busqueda: params.busqueda?.trim() || undefined },
    });
    return data;
  },
};
