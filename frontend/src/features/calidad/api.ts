import { clienteApi } from '../../shared/api/cliente';
import type { ResultadoPaginado } from '../../shared/tipos/api';
import type {
  ArchivoEnRevision,
  CriteriosCalidad,
  ParametrosArchivos,
  PersonaArchivo,
} from './tipos';

const TODOS_LOS_CRITERIOS: CriteriosCalidad = {
  legible: true,
  completa: true,
  datosCorrectos: true,
};

export const calidadApi = {
  /**
   * La cola: lo más antiguo primero, como se revisa en la sala. El PERSONAL pide solo lo que le
   * asignaron (HU-23); el ADMIN la pide entera y la reparte por pestañas.
   */
  async cola(soloAsignados: boolean): Promise<ResultadoPaginado<ArchivoEnRevision>> {
    return calidadApi.listar({
      estado: 'EN_REVISION',
      direccion: 'asc',
      limite: 100,
      ...(soloAsignados ? { revisor: 'yo' } : {}),
    });
  },

  async listar(params: ParametrosArchivos): Promise<ResultadoPaginado<ArchivoEnRevision>> {
    const { data } = await clienteApi.get<ResultadoPaginado<ArchivoEnRevision>>('/archivos', {
      params: { orden: 'creadoEn', ...params },
    });
    return data;
  },

  /** Cuentas PERSONAL activas a las que se puede asignar una revisión (HU-23). */
  async revisores(): Promise<PersonaArchivo[]> {
    const { data } = await clienteApi.get<PersonaArchivo[]>('/archivos/revisores');
    return data;
  },

  async asignar(id: string, revisorId: string): Promise<ArchivoEnRevision> {
    const { data } = await clienteApi.post<ArchivoEnRevision>(`/archivos/${id}/asignar`, {
      revisorId,
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
