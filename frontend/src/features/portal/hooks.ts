import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { portalApi } from './api';
import type { ParametrosBuscarPiezas } from './tipos';

export const clavesPortal = {
  pieza: (codigo: string) => ['portal', 'pieza', codigo] as const,
  busqueda: (params: ParametrosBuscarPiezas) => ['portal', 'busqueda', params] as const,
};

export function usePiezaPortal(codigo: string, habilitada: boolean) {
  return useQuery({
    queryKey: clavesPortal.pieza(codigo),
    queryFn: () => portalApi.pieza(codigo),
    enabled: habilitada,
    // una pieza que no existe no va a aparecer reintentando
    retry: (intentos, error) =>
      !(error instanceof AxiosError && error.response?.status === 404) && intentos < 2,
  });
}

export function useBusquedaPortal(params: ParametrosBuscarPiezas) {
  return useQuery({
    queryKey: clavesPortal.busqueda(params),
    queryFn: () => portalApi.buscar(params),
    // al cambiar de página o filtro se quedan los resultados anteriores hasta que lleguen los nuevos
    placeholderData: keepPreviousData,
  });
}
