import { clienteApi } from '../../shared/api/cliente';
import type { ResultadoPaginado } from '../../shared/tipos/api';
import type { ArchivoEnRevision, CriteriosCalidad } from './tipos';

const TODOS_LOS_CRITERIOS: CriteriosCalidad = {
  legible: true,
  completa: true,
  datosCorrectos: true,
};

export const calidadApi = {
  /** La cola: lo más antiguo primero, como se revisa en la sala. */
  async cola(): Promise<ResultadoPaginado<ArchivoEnRevision>> {
    const { data } = await clienteApi.get<ResultadoPaginado<ArchivoEnRevision>>('/archivos', {
      params: { estado: 'EN_REVISION', orden: 'creadoEn', direccion: 'asc', limite: 100 },
    });
    return data;
  },

  /** El escaneo como Blob: la ruta pide el token, que un <img src> no puede mandar. */
  async contenido(url: string): Promise<Blob> {
    const { data } = await clienteApi.get<Blob>(url.replace(/^\/api\/v1/, ''), {
      responseType: 'blob',
      timeout: 60_000,
    });
    return data;
  },

  async aprobar(id: string): Promise<ArchivoEnRevision> {
    const { data } = await clienteApi.post<ArchivoEnRevision>(
      `/archivos/${id}/aprobar`,
      TODOS_LOS_CRITERIOS,
    );
    return data;
  },

  async rechazar(id: string, motivoRechazo: string): Promise<ArchivoEnRevision> {
    const { data } = await clienteApi.post<ArchivoEnRevision>(`/archivos/${id}/rechazar`, {
      motivoRechazo,
    });
    return data;
  },
};
