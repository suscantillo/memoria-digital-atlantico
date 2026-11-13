import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clavesInventario } from '../inventario/hooks';
import { piezasApi } from './api';
import type { CrearPieza } from './tipos';

export function useCrearPieza() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearPieza) => piezasApi.crear(datos),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: clavesInventario.todas }),
  });
}
