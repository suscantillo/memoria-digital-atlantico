import { Transform, type TransformFnParams } from 'class-transformer';
import { Equals, IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { VERSION_AVISO_PRIVACIDAD } from '../../../domain/usuarios/aviso-privacidad';

function recortar({ value }: TransformFnParams): unknown {
  const valor: unknown = value;
  return typeof valor === 'string' ? valor.trim() : valor;
}

export class RegistrarUsuarioDto {
  @Transform(recortar)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre!: string;

  @Transform(recortar)
  @IsEmail()
  @MaxLength(200)
  correo!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  contrasena!: string;

  /** Debe ser true: sin consentimiento no se crea la cuenta. */
  @Equals(true, { message: 'aceptaPrivacidad: debes aceptar el aviso de privacidad.' })
  aceptaPrivacidad!: boolean;

  /** Versión del aviso que la persona leyó; debe ser la vigente. */
  @IsIn([VERSION_AVISO_PRIVACIDAD], {
    message: 'versionPrivacidad: la versión del aviso de privacidad no es la vigente.',
  })
  versionPrivacidad!: string;
}
