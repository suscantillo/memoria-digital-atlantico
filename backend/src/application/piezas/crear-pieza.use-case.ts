import { DatosNuevaPieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { CrearPiezaDto } from './dto/crear-pieza.dto';
import { PiezaDto } from './dto/pieza.dto';

export class CrearPieza {
  constructor(private readonly piezas: Pick<PiezaRepositorio, 'registrar'>) {}

  async ejecutar(datos: CrearPiezaDto, usuarioId: string): Promise<PiezaDto> {
    const nuevaPieza: DatosNuevaPieza = {
      tipo: datos.tipo,
      titulo: datos.titulo.trim(),
      anio: datos.anio,
      ubicacionId: datos.ubicacionId,
    };

    const pieza = await this.piezas.registrar(nuevaPieza, usuarioId);

    return PiezaDto.desdeEntidad(pieza);
  }
}
