import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesInventario } from '../inventario/hooks';
import { piezasApi } from './api';
import type { CrearPieza, EditarPieza } from './tipos';

export const clavesPiezas = {
  ficha: (id: string) => ['piezas', 'ficha', id] as const,
};

export function useCrearPieza() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearPieza) => piezasApi.crear(datos),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas }),
  });
}

export function useFichaPieza(id: string | undefined) {
  return useQuery({
    queryKey: clavesPiezas.ficha(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Falta el identificador de la pieza.');
      return piezasApi.obtener(id);
    },
    enabled: Boolean(id),
  });
}

/** Retirar del portal o volver a publicar: cambia el estado de la pieza y el inventario. */
export function useCambiarPublicacion(id: string) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (accion: { tipo: 'retirar'; motivo: string } | { tipo: 'publicar' }) =>
      accion.tipo === 'retirar' ? piezasApi.retirar(id, accion.motivo) : piezasApi.publicar(id),
    onSuccess: async (ficha) => {
      clienteConsultas.setQueryData(clavesPiezas.ficha(id), ficha);
      await clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas });
    },
  });
}

export function useEditarPieza(id: string) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (cambios: EditarPieza) => piezasApi.editar(id, cambios),
    onSuccess: (ficha) => {
      clienteConsultas.setQueryData(clavesPiezas.ficha(id), ficha);
    },
  });
}
