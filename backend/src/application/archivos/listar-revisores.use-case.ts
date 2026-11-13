import { RevisorDto } from './dto/revisor.dto';
import { Revisores } from './puertos';

/** HU-23: a quién le puede asignar el ADMIN una revisión. */
export class ListarRevisores {
  constructor(private readonly revisores: Revisores) {}

  async ejecutar(): Promise<RevisorDto[]> {
    const disponibles = await this.revisores.listarDisponibles();
    return disponibles.map((revisor) => RevisorDto.desde(revisor));
  }
}
