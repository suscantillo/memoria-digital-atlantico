import { clienteApi } from '../../shared/api/cliente';
import type { CrearPieza, Pieza } from './tipos';

export const piezasApi = {
  async crear(datos: CrearPieza): Promise<Pieza> {
    const { data } = await clienteApi.post<Pieza>('/piezas', datos);
    return data;
  },
};
