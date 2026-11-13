import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Campos de texto del formulario multipart; el archivo llega aparte en el campo «archivo». */
export class CargarEscaneoDto {
  @IsUUID()
  piezaId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  tema!: string;

  /** Persona, fotógrafo o periódico; «Desconocido» si no se sabe */
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  autor!: string;

  /** Se envía repitiendo el campo: palabrasClave=carnaval&palabrasClave=desfile */
  @Transform(({ value }: { value: unknown }): unknown[] =>
    Array.isArray(value) ? (value as unknown[]) : [value],
  )
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  palabrasClave!: string[];
}
