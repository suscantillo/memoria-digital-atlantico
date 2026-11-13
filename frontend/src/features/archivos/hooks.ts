import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clavesInventario } from '../inventario/hooks';
import { archivosApi } from './api';
import type { DatosEscaneo } from './tipos';

export function useCargarEscaneo(piezaId: string, onProgreso: (porcentaje: number) => void) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosEscaneo) => archivosApi.cargarEscaneo(piezaId, datos, onProgreso),
    // la pieza cambió de estado: el inventario se vuelve a pedir
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas }),
  });
}
