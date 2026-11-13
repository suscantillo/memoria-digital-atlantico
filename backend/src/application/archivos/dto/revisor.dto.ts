import { RevisorDisponible } from '../puertos';

export class RevisorDto {
  id!: string;
  nombre!: string;
  correo!: string;

  static desde(revisor: RevisorDisponible): RevisorDto {
    const dto = new RevisorDto();
    dto.id = revisor.id;
    dto.nombre = revisor.nombre;
    dto.correo = revisor.correo;
    return dto;
  }
}
