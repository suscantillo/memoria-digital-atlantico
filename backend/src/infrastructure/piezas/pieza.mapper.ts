import {
  ArchivoDigital as ArchivoDigitalFila,
  Pieza as PiezaFila,
  Ubicacion as UbicacionFila,
} from '@prisma/client';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';

export type PiezaConRelaciones = PiezaFila & {
  ubicacion: UbicacionFila;
  archivos: Pick<ArchivoDigitalFila, 'id' | 'tipoMime'>[];
};

export const PiezaMapper = {
  aEntidad(fila: PiezaConRelaciones): Pieza {
    const archivo = fila.archivos[0] ?? null;

    return Pieza.reconstruir({
      id: fila.id,
      codigo: CodigoPieza.desde(fila.codigo),
      titulo: fila.titulo,
      descripcion: fila.descripcion,
      tipo: fila.tipo,
      estado: fila.estado,
      anio: fila.anio,
      restringida: fila.restringida,
      ubicacion: {
        id: fila.ubicacion.id,
        deposito: fila.ubicacion.deposito,
        estanteria: fila.ubicacion.estanteria,
        caja: fila.ubicacion.caja,
      },
      archivoAprobado: archivo ? { id: archivo.id, tipoMime: archivo.tipoMime } : null,
      creadoEn: fila.creadoEn,
      actualizadoEn: fila.actualizadoEn,
    });
  },
};
