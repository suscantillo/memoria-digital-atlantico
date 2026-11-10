import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventarioApi } from './api';
import type { ParametrosListarPiezas } from './tipos';

export const clavesPiezas = {
  todas: ['piezas'] as const,
  lista: (params: ParametrosListarPiezas) => ['piezas', 'lista', params] as const,
  contadores: ['piezas', 'contadores'] as const,
};

export function useInventario(params: ParametrosListarPiezas, habilitada = true) {
  return useQuery({
    queryKey: clavesPiezas.lista(params),
    queryFn: () => inventarioApi.listar(params),
    placeholderData: keepPreviousData,
    enabled: habilitada,
  });
}

export function useContadoresPiezas() {
  return useQuery({ queryKey: clavesPiezas.contadores, queryFn: () => inventarioApi.contadores() });
}

export function usePublicarPieza() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventarioApi.publicar(id),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesPiezas.todas }),
  });
}
