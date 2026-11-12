import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RechazarEscaneoDto {
  /** Ej: La imagen está cortada en el borde derecho */
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'motivoRechazo es obligatorio para rechazar.' })
  @MaxLength(500)
  motivoRechazo!: string;
}
