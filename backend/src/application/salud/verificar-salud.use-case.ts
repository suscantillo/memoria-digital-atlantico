import { VerificadorBaseDatos } from './ports/verificador-base-datos';

export interface EstadoSalud {
  estado: 'ok' | 'degradado';
  baseDatos: 'conectada' | 'desconectada';
  marcaTiempo: string;
}

export class VerificarSalud {
  constructor(private readonly baseDatos: VerificadorBaseDatos) {}

  async ejecutar(): Promise<EstadoSalud> {
    const disponible = await this.baseDatos.estaDisponible();
    return {
      estado: disponible ? 'ok' : 'degradado',
      baseDatos: disponible ? 'conectada' : 'desconectada',
      marcaTiempo: new Date().toISOString(),
    };
  }
}
