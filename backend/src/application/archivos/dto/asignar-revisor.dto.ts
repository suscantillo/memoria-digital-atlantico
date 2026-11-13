import { IsUUID } from 'class-validator';

export class AsignarRevisorDto {
  /** Una cuenta PERSONAL activa que no sea quien subió el escaneo */
  @IsUUID('all', { message: 'revisorId debe ser el id de una cuenta.' })
  revisorId!: string;
}
