import type { AxiosProgressEvent } from 'axios';
import { clienteApi } from '../../shared/api/cliente';
import type { DatosEscaneo, EscaneoCargado } from './tipos';

export const archivosApi = {
  /** POST /archivos (PERSONAL, ADMIN): multipart con el archivo y sus metadatos (HU-09). */
  async cargarEscaneo(
    piezaId: string,
    datos: DatosEscaneo,
    onProgreso?: (porcentaje: number) => void,
  ): Promise<EscaneoCargado> {
    const formulario = new FormData();
    formulario.append('piezaId', piezaId);
    formulario.append('tema', datos.tema);
    formulario.append('autor', datos.autor);
    for (const palabra of datos.palabrasClave) formulario.append('palabrasClave', palabra);
    // el archivo va al final: el servidor lee los campos de texto antes
    formulario.append('archivo', datos.archivo);
    const { data } = await clienteApi.post<EscaneoCargado>('/archivos', formulario, {
      // el cliente manda JSON por defecto, y axios convertiría el FormData en JSON
      headers: { 'Content-Type': 'multipart/form-data' },
      // 20 MB por una conexión lenta tardan más que el límite normal
      timeout: 120_000,
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total) onProgreso?.(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data;
  },
};
