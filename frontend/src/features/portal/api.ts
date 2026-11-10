import { clienteApi } from '../../shared/api/cliente';
import type { ParametrosBuscarPiezas, PiezaPortal, PiezasPortalPaginadas } from './tipos';

export const portalApi = {
  async pieza(codigo: string): Promise<PiezaPortal> {
    const { data } = await clienteApi.get<PiezaPortal>(
      `/portal/piezas/${encodeURIComponent(codigo)}`,
    );
    return data;
  },

  async buscar(params: ParametrosBuscarPiezas): Promise<PiezasPortalPaginadas> {
    const { data } = await clienteApi.get<PiezasPortalPaginadas>('/portal/piezas', {
      params: { ...params, q: params.q || undefined },
    });
    return data;
  },
};
