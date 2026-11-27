import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EliminarMiCuentaDto {
  /** La contraseña actual: con la sesión abierta en otro equipo no basta un clic para borrarla. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contrasena!: string;
}
