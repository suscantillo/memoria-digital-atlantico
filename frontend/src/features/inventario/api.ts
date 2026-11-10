import type { AxiosProgressEvent } from 'axios';
import { clienteApi } from '../../shared/api/cliente';
import type { ArchivoDigital } from '../calidad/tipos';
import type {
  CargarArchivo,
  ContadoresPiezas,
  CrearPieza,
  EditarPieza,
  FichaPieza,
  ParametrosListarPiezas,
  PiezaInventario,
  PiezasPaginadas,
} from './tipos';

export const inventarioApi = {
  async listar(params: ParametrosListarPiezas): Promise<PiezasPaginadas> {
    const { data } = await clienteApi.get<PiezasPaginadas>('/piezas', {
      params: {
        ...params,
        busqueda: params.busqueda || undefined,
        estado: params.estado || undefined,
        tipo: params.tipo || undefined,
        ubicacionId: params.ubicacionId || undefined,
      },
    });
    return data;
  },

  async contadores(): Promise<ContadoresPiezas> {
    const { data } = await clienteApi.get<ContadoresPiezas>('/piezas/contadores');
    return data;
  },

  async ficha(id: string): Promise<FichaPieza> {
    const { data } = await clienteApi.get<FichaPieza>(`/piezas/${id}`);
    return data;
  },

  async crear(datos: CrearPieza): Promise<PiezaInventario> {
    const { data } = await clienteApi.post<PiezaInventario>('/piezas', datos);
    return data;
  },

  async editar(id: string, datos: EditarPieza): Promise<FichaPieza> {
    const { data } = await clienteApi.patch<FichaPieza>(`/piezas/${id}`, datos);
    return data;
  },

  async publicar(id: string): Promise<PiezaInventario> {
    const { data } = await clienteApi.post<PiezaInventario>(`/piezas/${id}/publicar`);
    return data;
  },

  async cargarArchivo(
    piezaId: string,
    datos: CargarArchivo,
    onProgreso?: (porcentaje: number) => void,
  ): Promise<ArchivoDigital> {
    const formulario = new FormData();
    formulario.append('piezaId', piezaId);
    formulario.append('archivo', datos.archivo);
    formulario.append('tema', datos.tema);
    formulario.append('autor', datos.autor);
    for (const palabra of datos.palabrasClave) formulario.append('palabrasClave', palabra);
    const { data } = await clienteApi.post<ArchivoDigital>('/archivos', formulario, {
      // el cliente manda JSON por defecto, y axios convertiría el FormData en JSON
      headers: { 'Content-Type': 'multipart/form-data' },
      // 20 MB por una conexión lenta tardan más que el límite normal de 15 s
      timeout: 120_000,
      onUploadProgress: (e: AxiosProgressEvent) =>
        e.total && onProgreso?.(Math.round((e.loaded / e.total) * 100)),
    });
    return data;
  },
};
