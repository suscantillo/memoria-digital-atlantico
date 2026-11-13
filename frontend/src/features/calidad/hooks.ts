import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../shared/auth/useAuth';
import { clavesInventario } from '../inventario/hooks';
import { calidadApi } from './api';
import type { ArchivoEnRevision, Decision, ParametrosArchivos } from './tipos';

export const clavesCalidad = {
  todas: ['calidad'] as const,
  cola: (soloAsignados: boolean) => ['calidad', 'cola', soloAsignados] as const,
  lista: (params: ParametrosArchivos) => ['calidad', 'lista', params] as const,
  revisores: ['calidad', 'revisores'] as const,
  contenido: (id: string) => ['calidad', 'contenido', id] as const,
};

/** El ADMIN reparte; el PERSONAL solo revisa lo que le asignaron (HU-23). */
export function useEsAdmin() {
  return useAuth().usuario?.rol === 'ADMIN';
}

/** También alimenta el contador del menú: es la misma consulta. */
export function useColaRevision() {
  const soloAsignados = !useEsAdmin();
  return useQuery({
    queryKey: clavesCalidad.cola(soloAsignados),
    queryFn: () => calidadApi.cola(soloAsignados),
  });
}

/**
 * Lo ya revisado, lo más reciente primero: todo para el ADMIN; lo que revisó cada PERSONAL para
 * él. Solo se vuelve a ver, no se decide otra vez.
 */
export function useRevisados() {
  const esAdmin = useEsAdmin();
  return useQuery({
    queryKey: [...clavesCalidad.todas, 'revisados', esAdmin] as const,
    queryFn: async () => {
      const { datos } = await calidadApi.listar({
        direccion: 'desc',
        limite: 100,
        ...(esAdmin ? {} : { revisor: 'yo' }),
      });
      return datos
        .filter((a) => a.estado !== 'EN_REVISION')
        .sort((a, b) => (b.revisadoEn ?? '').localeCompare(a.revisadoEn ?? ''));
    },
  });
}

/** «Escaneos» del ADMIN (todos) o «Mis escaneos» del PERSONAL (los que subió). */
export function useEscaneos(params: ParametrosArchivos) {
  return useQuery({
    queryKey: clavesCalidad.lista(params),
    queryFn: () => calidadApi.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useRevisores(habilitada: boolean) {
  return useQuery({
    queryKey: clavesCalidad.revisores,
    queryFn: () => calidadApi.revisores(),
    enabled: habilitada,
    staleTime: 5 * 60_000,
  });
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

export function useAsignarRevisor() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, revisorId }: { id: string; revisorId: string }) =>
      calidadApi.asignar(id, revisorId),
    onSettled: () => clienteConsultas.invalidateQueries({ queryKey: clavesCalidad.todas }),
  });
}

export function useDecidirEscaneo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: Decision }) =>
      decision.tipo === 'aprobar'
        ? calidadApi.aprobar(id)
        : calidadApi.rechazar(id, decision.motivo),
    // la pieza cambió de estado: se refrescan la cola, los escaneos y el inventario
    onSettled: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: clavesCalidad.todas });
      await clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas });
    },
  });
}
