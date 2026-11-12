import { clienteApi } from '../../shared/api/cliente';
import type { ParametrosBuscarPiezas, PiezaPortal, PiezasPortalPaginadas } from './tipos';

export const portalApi = {
  /** GET /portal/piezas: solo piezas PUBLICADAS; es pública, no pide sesión. */
  async buscar(params: ParametrosBuscarPiezas): Promise<PiezasPortalPaginadas> {
    const { data } = await clienteApi.get<PiezasPortalPaginadas>('/portal/piezas', {
      params: { ...params, busqueda: params.busqueda?.trim() || undefined },
    });
    return data;
  },

  /** GET /portal/piezas/:codigo: ficha pública; 404 si no existe o no está PUBLICADA. */
  async obtener(codigo: string): Promise<PiezaPortal> {
    const { data } = await clienteApi.get<PiezaPortal>(
      `/portal/piezas/${encodeURIComponent(codigo)}`,
    );
    return data;
  },
};
