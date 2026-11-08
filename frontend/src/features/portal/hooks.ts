import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { portalApi } from './api';

export const clavesPortal = {
  pieza: (codigo: string) => ['portal', 'pieza', codigo] as const,
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
