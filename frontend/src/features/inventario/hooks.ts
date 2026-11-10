import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventarioApi } from './api';
import type { CargarArchivo, CrearPieza, EditarPieza, ParametrosListarPiezas } from './tipos';

export const clavesPiezas = {
  todas: ['piezas'] as const,
  lista: (params: ParametrosListarPiezas) => ['piezas', 'lista', params] as const,
  contadores: ['piezas', 'contadores'] as const,
  ficha: (id: string) => ['piezas', 'ficha', id] as const,
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

export function useFichaPieza(id: string) {
  return useQuery({ queryKey: clavesPiezas.ficha(id), queryFn: () => inventarioApi.ficha(id) });
}

// cualquier cambio de una pieza mueve contadores, listas y su ficha: se refresca todo lo de piezas
function useInvalidarPiezas() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: clavesPiezas.todas });
}

export function useCrearPieza() {
  const invalidar = useInvalidarPiezas();
  return useMutation({
    mutationFn: (datos: CrearPieza) => inventarioApi.crear(datos),
    onSuccess: invalidar,
  });
}

export function useEditarPieza(id: string) {
  const invalidar = useInvalidarPiezas();
  return useMutation({
    mutationFn: (datos: EditarPieza) => inventarioApi.editar(id, datos),
    onSuccess: invalidar,
  });
}

export function useCargarArchivo(piezaId: string, onProgreso: (porcentaje: number) => void) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CargarArchivo) => inventarioApi.cargarArchivo(piezaId, datos, onProgreso),
    onSuccess: () =>
      Promise.all([
        clienteConsultas.invalidateQueries({ queryKey: clavesPiezas.todas }),
        clienteConsultas.invalidateQueries({ queryKey: ['archivos'] }),
      ]),
  });
}
