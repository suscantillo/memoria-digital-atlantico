import { useMutation } from '@tanstack/react-query';
import { piezasApi } from './api';
import type { CrearPieza } from './tipos';

export function useCrearPieza() {
  return useMutation({
    mutationFn: (datos: CrearPieza) => piezasApi.crear(datos),
  });
}
