import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from './api';
import type { CrearCuenta, ParametrosListarUsuarios } from './tipos';

export const clavesUsuarios = {
  todas: ['usuarios'] as const,
  lista: (params: ParametrosListarUsuarios) => ['usuarios', 'lista', params] as const,
};

export function useUsuarios(params: ParametrosListarUsuarios) {
  return useQuery({
    queryKey: clavesUsuarios.lista(params),
    queryFn: () => usuariosApi.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useCrearCuenta() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearCuenta) => usuariosApi.crear(datos),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}

export function useCambiarActiva() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) =>
      usuariosApi.cambiarActiva(id, activa),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}
