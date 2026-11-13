import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from './api';
import type { CrearCuentaPersonal, ParametrosListarUsuarios, RolAdministrable } from './tipos';

export const clavesUsuarios = {
  todas: ['usuarios'] as const,
  lista: (params: ParametrosListarUsuarios) => ['usuarios', 'lista', params] as const,
  publico: (params: ParametrosListarUsuarios) => ['usuarios', 'publico', params] as const,
};

export function useCuentasPublicas(params: ParametrosListarUsuarios) {
  return useQuery({
    queryKey: clavesUsuarios.publico(params),
    queryFn: () => usuariosApi.listarPublico(params),
    placeholderData: keepPreviousData,
  });
}

/** Desactivar (true) o reactivar (false) una cuenta del portal. */
export function useCambiarEstadoCuentaPublica() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, desactivar }: { id: string; desactivar: boolean }) =>
      desactivar ? usuariosApi.desactivarPublico(id) : usuariosApi.reactivarPublico(id),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}

export function useUsuarios(params: ParametrosListarUsuarios) {
  return useQuery({
    queryKey: clavesUsuarios.lista(params),
    queryFn: () => usuariosApi.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useCrearCuentaPersonal() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearCuentaPersonal) => usuariosApi.crear(datos),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}

export function useCambiarRolUsuario() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rol }: { id: string; rol: RolAdministrable }) =>
      usuariosApi.cambiarRol(id, rol),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}

export function useDesactivarUsuario() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.desactivar(id),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}

export function useReactivarUsuario() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.reactivar(id),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesUsuarios.todas }),
  });
}
