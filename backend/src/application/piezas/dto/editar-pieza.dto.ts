import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

function recortarTexto({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class EditarPiezaDto {
  @ValidateIf((_objeto, valor) => valor !== undefined)
  @Transform(recortarTexto)
  @IsString()
  @MinLength(1)
  titulo?: string;

  @ValidateIf((_objeto, valor) => valor !== undefined)
  @Transform(recortarTexto)
  @IsString()
  @MaxLength(5000)
  descripcion?: string;
}
