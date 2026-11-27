import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const LIMITE_PREGUNTA = 500;

export class PreguntarAsistenteDto {
  /** Lo que la persona le pregunta a Miga, en sus palabras. */
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(LIMITE_PREGUNTA)
  pregunta!: string;
}
