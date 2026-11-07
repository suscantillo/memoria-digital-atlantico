import { IsString, MinLength } from 'class-validator';

export class RefrescarSesionDto {
  @IsString()
  @MinLength(1)
  tokenRefresco!: string;
}
