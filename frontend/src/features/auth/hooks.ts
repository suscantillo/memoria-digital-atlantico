import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from './api';

export const clavesAuth = {
  cuenta: ['auth', 'cuenta'] as const,
};

export function useMiCuenta() {
  return useQuery({ queryKey: clavesAuth.cuenta, queryFn: () => authApi.cuenta() });
}

export function useEliminarMiCuenta() {
  return useMutation({ mutationFn: (contrasena: string) => authApi.eliminarCuenta(contrasena) });
}
