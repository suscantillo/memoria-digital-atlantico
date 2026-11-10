import { clienteApi } from '../../shared/api/cliente';
import type { PiezaPortal } from './tipos';

export const portalApi = {
  async pieza(codigo: string): Promise<PiezaPortal> {
    const { data } = await clienteApi.get<PiezaPortal>(
      `/portal/piezas/${encodeURIComponent(codigo)}`,
    );
    return data;
  },
};
