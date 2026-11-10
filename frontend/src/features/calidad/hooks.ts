import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedirArchivo } from '../../shared/api/descargas';
import { clavesPiezas } from '../inventario/hooks';
import { calidadApi } from './api';

export const clavesArchivos = {
  todos: ['archivos'] as const,
  enRevision: ['archivos', 'en-revision'] as const,
  contenido: (id: string) => ['archivos', id, 'contenido'] as const,
};

export function useArchivosEnRevision() {
  return useQuery({ queryKey: clavesArchivos.enRevision, queryFn: () => calidadApi.enRevision() });
}

export function useContenidoArchivo(id: string) {
  return useQuery({
    queryKey: clavesArchivos.contenido(id),
    queryFn: () => pedirArchivo(`/archivos/${id}/contenido`),
    staleTime: Infinity,
  });
}

/** Aprobar o rechazar cambia el estado de la pieza: se refrescan escaneos e inventario. */
export function useResolverArchivo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivoRechazo }: { id: string; motivoRechazo?: string }) =>
      motivoRechazo === undefined ? calidadApi.aprobar(id) : calidadApi.rechazar(id, motivoRechazo),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: clavesArchivos.todos });
      await clienteConsultas.invalidateQueries({ queryKey: clavesPiezas.todas });
    },
  });
}
