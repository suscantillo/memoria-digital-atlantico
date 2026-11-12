import { useQuery } from '@tanstack/react-query';
import { pedirArchivo } from '../../shared/api/descargas';

/** El PNG del QR de una pieza (HU-11), pedido con la sesión del panel. */
export function useQrPieza(piezaId: string) {
  return useQuery({
    queryKey: ['piezas', piezaId, 'qr'],
    queryFn: () => pedirArchivo(`/piezas/${piezaId}/qr`),
    // el QR de una pieza no cambia: su contenido es la dirección fija de su ficha
    staleTime: Infinity,
  });
}
