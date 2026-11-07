import { SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { RefrescarSesionDto } from './dto/refrescar-sesion.dto';
import { ServicioTokens } from './ports/servicio-tokens';

export class CerrarSesion {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(datos: RefrescarSesionDto): Promise<void> {
    let jti: string;
    try {
      ({ jti } = await this.tokens.verificarRefresco(datos.tokenRefresco));
    } catch {
      return;
    }
    const sesion = await this.sesiones.buscarPorJti(jti);
    if (sesion && sesion.estaVigente()) {
      await this.sesiones.revocar(sesion.id, new Date());
    }
  }
}
