import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

function recortarTexto({ value }: TransformFnParams): unknown {
  const valor: unknown = value;
  return typeof valor === 'string' ? valor.trim() : valor;
}

function normalizarCorreo({ value }: TransformFnParams): unknown {
  const valor: unknown = value;
  return typeof valor === 'string' ? valor.trim().toLowerCase() : valor;
}

export class CrearCuentaPersonalDto {
  @Transform(recortarTexto)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre!: string;

  @Transform(normalizarCorreo)
  @IsEmail()
  @MaxLength(200)
  correo!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(200)
  contrasenaTemporal!: string;
}
