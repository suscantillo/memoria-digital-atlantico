import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { inventarioApi } from './api';
import type { ParametrosInventario } from './tipos';

export const clavesInventario = {
  todas: ['inventario'] as const,
  lista: (params: ParametrosInventario) => ['inventario', params] as const,
};

export function useInventario(params: ParametrosInventario, habilitada = true) {
  return useQuery({
    queryKey: clavesInventario.lista(params),
    queryFn: () => inventarioApi.listar(params),
    // la tabla se queda con la página anterior mientras llega la nueva, sin parpadeo
    placeholderData: keepPreviousData,
    enabled: habilitada,
  });
}
