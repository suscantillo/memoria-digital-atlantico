import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesInventario } from '../inventario/hooks';
import { calidadApi } from './api';
import type { ArchivoEnRevision, Decision } from './tipos';

export const clavesCalidad = {
  todas: ['calidad'] as const,
  cola: ['calidad', 'cola'] as const,
  contenido: (id: string) => ['calidad', 'contenido', id] as const,
};

/** También alimenta el contador del menú: es la misma consulta. */
export function useColaRevision() {
  return useQuery({ queryKey: clavesCalidad.cola, queryFn: () => calidadApi.cola() });
}

export function useContenidoEscaneo(archivo: ArchivoEnRevision) {
  return useQuery({
    queryKey: clavesCalidad.contenido(archivo.id),
    queryFn: () => calidadApi.contenido(archivo.url),
    // el archivo no cambia: se baja una vez por visita
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    retry: false,
  });
}

export function useDecidirEscaneo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: Decision }) =>
      decision.tipo === 'aprobar'
        ? calidadApi.aprobar(id)
        : calidadApi.rechazar(id, decision.motivo),
    // la pieza cambió de estado: se refrescan la cola y el inventario
    onSettled: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: clavesCalidad.cola });
      await clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas });
    },
  });
}
