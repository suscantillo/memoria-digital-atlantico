import { EstadoPieza } from '../piezas/estado-pieza';
import { RolUsuario } from '../usuarios/rol-usuario';
import { EstadoArchivoDigital } from './estado-archivo-digital';

export type AccesoArchivo = 'PERMITIDO' | 'NO_VISIBLE' | 'REQUIERE_SESION';

const TIPO_PDF = 'application/pdf';

/**
 * Quién puede abrir un escaneo. `rol` es null cuando pregunta un visitante sin sesión.
 * El personal ve todo. El público solo ve archivos aprobados de piezas publicadas y no
 * restringidas; las imágenes sin cuenta y los PDF con sesión (HU-15).
 */
export function evaluarAccesoArchivo(
  archivo: { estado: EstadoArchivoDigital; tipoMime: string },
  pieza: { estado: EstadoPieza; restringida: boolean },
  rol: RolUsuario | null,
): AccesoArchivo {
  if (rol === 'ADMIN' || rol === 'PERSONAL') {
    return 'PERMITIDO';
  }
  if (archivo.estado !== 'APROBADO' || pieza.estado !== 'PUBLICADA' || pieza.restringida) {
    return 'NO_VISIBLE';
  }
  if (archivo.tipoMime === TIPO_PDF && rol === null) {
    return 'REQUIERE_SESION';
  }
  return 'PERMITIDO';
}
