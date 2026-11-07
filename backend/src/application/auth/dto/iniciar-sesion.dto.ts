import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class IniciarSesionDto {
  @IsEmail()
  @MaxLength(200)
  correo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  contrasena!: string;
}
