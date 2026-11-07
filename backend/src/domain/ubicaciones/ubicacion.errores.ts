import { ErrorConflicto } from '../comun/errores';
import { TernaUbicacion } from './ubicacion.entity';

export class UbicacionDuplicadaError extends ErrorConflicto {
  constructor(terna: TernaUbicacion) {
    super(
      `Ya existe una ubicación con depósito "${terna.deposito}", estantería "${terna.estanteria}" y caja "${terna.caja}".`,
    );
  }
}
