import { Pieza as PiezaFila } from '@prisma/client';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';

export const PiezaMapper = {
  aEntidad(fila: PiezaFila): Pieza {
    if (fila.anio === null) {
      throw new Error('La pieza registrada debe tener un año.');
    }

    return Pieza.reconstruir({
      id: fila.id,
      codigo: CodigoPieza.desde(fila.codigo),
      titulo: fila.titulo,
      tipo: fila.tipo,
      estado: fila.estado,
      anio: fila.anio,
      ubicacionId: fila.ubicacionId,
      creadoEn: fila.creadoEn,
      actualizadoEn: fila.actualizadoEn,
    });
  },
};
