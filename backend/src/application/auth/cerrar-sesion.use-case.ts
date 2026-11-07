import { SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { RefrescarSesionDto } from './dto/refrescar-sesion.dto';
import { ServicioTokens } from './ports/servicio-tokens';

export class CerrarSesion {
  constructor(
    private readonly sesiones: SesionRepositorio,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(datos: RefrescarSesionDto): Promise<void> {
    const sesion = await this.sesiones.buscarPorTokenHash(
      this.tokens.hashRefresco(datos.tokenRefresco),
    );
    if (sesion && sesion.estaVigente()) {
      await this.sesiones.revocar(sesion.id, new Date());
    }
  }
}
