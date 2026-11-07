import { Prisma, Ubicacion as UbicacionFila } from '@prisma/client';
import { Ubicacion } from '../../domain/ubicaciones/ubicacion.entity';

export const UbicacionMapper = {
  aEntidad(fila: UbicacionFila): Ubicacion {
    return Ubicacion.reconstruir({
      id: fila.id,
      deposito: fila.deposito,
      estanteria: fila.estanteria,
      caja: fila.caja,
      descripcion: fila.descripcion,
      creadoEn: fila.creadoEn,
      actualizadoEn: fila.actualizadoEn,
    });
  },

  aFilaCreacion(entidad: Ubicacion): Prisma.UbicacionUncheckedCreateInput {
    return {
      id: entidad.id,
      deposito: entidad.deposito,
      estanteria: entidad.estanteria,
      caja: entidad.caja,
      descripcion: entidad.descripcion,
      creadoEn: entidad.creadoEn,
      actualizadoEn: entidad.actualizadoEn,
    };
  },

  aFilaActualizacion(entidad: Ubicacion): Prisma.UbicacionUncheckedUpdateInput {
    return {
      deposito: entidad.deposito,
      estanteria: entidad.estanteria,
      caja: entidad.caja,
      descripcion: entidad.descripcion,
    };
  },
};
