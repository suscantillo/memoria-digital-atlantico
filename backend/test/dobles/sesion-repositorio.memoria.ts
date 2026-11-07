import { Sesion } from '../../src/domain/sesiones/sesion.entity';
import { SesionRepositorio } from '../../src/domain/sesiones/sesion.repositorio';

export class SesionRepositorioMemoria implements SesionRepositorio {
  readonly sesiones = new Map<string, Sesion>();

  guardar(sesion: Sesion): Promise<Sesion> {
    this.sesiones.set(sesion.id, sesion);
    return Promise.resolve(sesion);
  }

  buscarPorJti(jti: string): Promise<Sesion | null> {
    return Promise.resolve([...this.sesiones.values()].find((s) => s.jti === jti) ?? null);
  }

  revocar(id: string, fecha: Date): Promise<void> {
    const actual = this.sesiones.get(id);
    if (actual && actual.revocadaEn === null) {
      this.sesiones.set(
        id,
        Sesion.reconstruir({
          id: actual.id,
          usuarioId: actual.usuarioId,
          jti: actual.jti,
          expiraEn: actual.expiraEn,
          revocadaEn: fecha,
          creadoEn: actual.creadoEn,
        }),
      );
    }
    return Promise.resolve();
  }

  async revocarTodasDelUsuario(usuarioId: string, fecha: Date): Promise<void> {
    for (const sesion of this.sesiones.values()) {
      if (sesion.usuarioId === usuarioId) {
        await this.revocar(sesion.id, fecha);
      }
    }
  }
}
