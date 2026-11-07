import { Ubicacion } from '../../../domain/ubicaciones/ubicacion.entity';

export class UbicacionDto {
  id!: string;
  deposito!: string;
  estanteria!: string;
  caja!: string;
  descripcion!: string | null;
  /** depósito / estantería / caja */
  etiqueta!: string;
  creadoEn!: string;
  actualizadoEn!: string;

  static desdeEntidad(ubicacion: Ubicacion): UbicacionDto {
    const dto = new UbicacionDto();
    dto.id = ubicacion.id;
    dto.deposito = ubicacion.deposito;
    dto.estanteria = ubicacion.estanteria;
    dto.caja = ubicacion.caja;
    dto.descripcion = ubicacion.descripcion;
    dto.etiqueta = ubicacion.etiqueta;
    dto.creadoEn = ubicacion.creadoEn.toISOString();
    dto.actualizadoEn = ubicacion.actualizadoEn.toISOString();
    return dto;
  }
}
