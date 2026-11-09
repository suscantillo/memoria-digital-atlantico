import { DatosNuevaPieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { CrearPiezaDto } from './dto/crear-pieza.dto';
import { PiezaDto } from './dto/pieza.dto';

export class CrearPieza {
  constructor(private readonly piezas: PiezaRepositorio) {}

  async ejecutar(datos: CrearPiezaDto, usuarioId: string): Promise<PiezaDto> {
    const nuevaPieza: DatosNuevaPieza = {
      ...datos,
      titulo: datos.titulo.trim(),
    };
    const pieza = await this.piezas.registrar(nuevaPieza, usuarioId);
    return PiezaDto.desdeEntidad(pieza);
  }
}
