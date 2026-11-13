import { Equals } from 'class-validator';

/** Los tres criterios del control de calidad; solo se aprueba con los tres marcados. */
export class AprobarEscaneoDto {
  @Equals(true, { message: 'legible debe estar marcado para aprobar.' })
  legible!: boolean;

  @Equals(true, { message: 'completa debe estar marcado para aprobar.' })
  completa!: boolean;

  @Equals(true, { message: 'datosCorrectos debe estar marcado para aprobar.' })
  datosCorrectos!: boolean;
}
