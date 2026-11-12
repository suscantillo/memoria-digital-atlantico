import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { TIPOS_PIEZA, TipoPieza } from '../../../domain/piezas/tipo-pieza';

function recortarTitulo({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CrearPiezaDto {
  @IsIn(TIPOS_PIEZA)
  tipo!: TipoPieza;

  @Transform(recortarTitulo)
  @IsString()
  @MinLength(1)
  titulo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1500)
  @Max(2100)
  anio!: number;

  @IsUUID()
  ubicacionId!: string;
}
