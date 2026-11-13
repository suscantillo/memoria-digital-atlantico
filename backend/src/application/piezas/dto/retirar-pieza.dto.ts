import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RetirarPiezaDto {
  /** Por qué sale del portal; queda en el historial. Ej: «Error en la fecha, se corrige» */
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'motivo es obligatorio para retirar la pieza del portal.' })
  @MaxLength(500)
  motivo!: string;
}
