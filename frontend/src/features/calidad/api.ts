import { clienteApi } from '../../shared/api/cliente';
import type { ResultadoPaginado } from '../../shared/tipos/api';
import type { ArchivoDigital } from './tipos';

export const calidadApi = {
  async enRevision(): Promise<ResultadoPaginado<ArchivoDigital>> {
    const { data } = await clienteApi.get<ResultadoPaginado<ArchivoDigital>>('/archivos', {
      params: { estado: 'EN_REVISION', pagina: 1, limite: 50, orden: 'creadoEn', direccion: 'asc' },
    });
    return data;
  },

  async aprobar(id: string): Promise<ArchivoDigital> {
    const { data } = await clienteApi.post<ArchivoDigital>(`/archivos/${id}/aprobar`);
    return data;
  },

  async rechazar(id: string, motivoRechazo: string): Promise<ArchivoDigital> {
    const { data } = await clienteApi.post<ArchivoDigital>(`/archivos/${id}/rechazar`, {
      motivoRechazo,
    });
    return data;
  },
};
