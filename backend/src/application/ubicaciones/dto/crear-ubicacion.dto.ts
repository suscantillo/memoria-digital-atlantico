import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearUbicacionDto {
  /** Ej: Depósito A */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  deposito!: string;

  /** Ej: Estantería 3 */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  estanteria!: string;

  /** Ej: Caja 12 */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  caja!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
