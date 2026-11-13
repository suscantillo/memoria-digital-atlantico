import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { piezasApi } from './api';
import type { CrearPieza, EditarPieza } from './tipos';

export const clavesPiezas = {
  ficha: (id: string) => ['piezas', 'ficha', id] as const,
};

export function useCrearPieza() {
  return useMutation({
    mutationFn: (datos: CrearPieza) => piezasApi.crear(datos),
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

export function useEditarPieza(id: string) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (cambios: EditarPieza) => piezasApi.editar(id, cambios),
    onSuccess: (ficha) => {
      clienteConsultas.setQueryData(clavesPiezas.ficha(id), ficha);
    },
  });
}
