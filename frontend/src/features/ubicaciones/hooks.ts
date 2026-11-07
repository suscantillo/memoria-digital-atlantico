import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ubicacionesApi } from './api';
import type { CrearUbicacion, ParametrosListarUbicaciones } from './tipos';

export const clavesUbicaciones = {
  todas: ['ubicaciones'] as const,
  lista: (params: ParametrosListarUbicaciones) => ['ubicaciones', 'lista', params] as const,
};

export function useUbicaciones(params: ParametrosListarUbicaciones) {
  return useQuery({
    queryKey: clavesUbicaciones.lista(params),
    queryFn: () => ubicacionesApi.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useCrearUbicacion() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearUbicacion) => ubicacionesApi.crear(datos),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUbicaciones.todas }),
  });
}
