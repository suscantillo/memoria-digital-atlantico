import { Ubicacion } from '../../domain/ubicaciones/ubicacion.entity';
import { UbicacionDuplicadaError } from '../../domain/ubicaciones/ubicacion.errores';
import { UbicacionRepositorio } from '../../domain/ubicaciones/ubicacion.repositorio';
import { CrearUbicacionDto } from './dto/crear-ubicacion.dto';
import { UbicacionDto } from './dto/ubicacion.dto';

export class CrearUbicacion {
  constructor(private readonly ubicaciones: UbicacionRepositorio) {}

  async ejecutar(datos: CrearUbicacionDto): Promise<UbicacionDto> {
    const ubicacion = Ubicacion.crear(datos);

    const existente = await this.ubicaciones.buscarPorTerna(ubicacion.terna);
    if (existente) {
      throw new UbicacionDuplicadaError(ubicacion.terna);
    }

    const guardada = await this.ubicaciones.guardar(ubicacion);
    return UbicacionDto.desdeEntidad(guardada);
  }
}
