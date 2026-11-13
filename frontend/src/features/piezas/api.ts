import { clienteApi } from '../../shared/api/cliente';
import type { CrearPieza, EditarPieza, FichaPieza, Pieza } from './tipos';

export const piezasApi = {
  async crear(datos: CrearPieza): Promise<Pieza> {
    const { data } = await clienteApi.post<Pieza>('/piezas', datos);
    return data;
  },

  async obtener(id: string): Promise<FichaPieza> {
    const { data } = await clienteApi.get<FichaPieza>(`/piezas/${id}`);
    return data;
  },

  async editar(id: string, cambios: EditarPieza): Promise<FichaPieza> {
    const { data } = await clienteApi.patch<FichaPieza>(`/piezas/${id}`, cambios);
    return data;
  },
};
