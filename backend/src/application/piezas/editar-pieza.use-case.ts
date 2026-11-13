import { ErrorRegla } from '../../domain/comun/errores';
import { CambiosPieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { EditarPiezaDto } from './dto/editar-pieza.dto';
import { FichaPiezaDto } from './dto/ficha-pieza.dto';

export class EditarPieza {
  constructor(private readonly piezas: PiezaRepositorio) {}

  async ejecutar(id: string, datos: EditarPiezaDto, usuarioId: string): Promise<FichaPiezaDto> {
    const cambios: CambiosPieza = {};
    if (datos.titulo !== undefined) {
      const titulo = datos.titulo.trim();
      if (!titulo) {
        throw new ErrorRegla('El campo "titulo" es obligatorio.');
      }
      cambios.titulo = titulo;
    }
    if (datos.descripcion !== undefined) {
      cambios.descripcion = datos.descripcion.trim() || null;
    }
    if (cambios.titulo === undefined && cambios.descripcion === undefined) {
      throw new ErrorRegla('Debes indicar el título o la descripción para editar la pieza.');
    }

    const ficha = await this.piezas.editar(id, cambios, usuarioId);
    return FichaPiezaDto.desdeFicha(ficha);
  }
}
