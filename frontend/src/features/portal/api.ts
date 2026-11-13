import { BASE_API, clienteApi } from '../../shared/api/cliente';
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

  /**
   * Trae un escaneo con la sesión de quien lo pide. Un PDF no se puede poner directo en la página
   * porque la API lo entrega solo con el token (HU-15) y el navegador no lo manda por su cuenta.
   */
  async contenido(url: string): Promise<Blob> {
    const ruta = url.startsWith(BASE_API) ? url.slice(BASE_API.length) : url;
    const { data } = await clienteApi.get<Blob>(ruta, { responseType: 'blob', timeout: 60_000 });
    return data;
  },
};
