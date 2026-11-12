import { ErrorRegla } from '../comun/errores';

/** HU-09: formatos que acepta un escaneo y su tamaño máximo. */
export const TIPOS_MIME_ESCANEO = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'application/pdf',
] as const;
export type TipoMimeEscaneo = (typeof TIPOS_MIME_ESCANEO)[number];

export const TAMANO_MAXIMO_ESCANEO = 20 * 1024 * 1024;

export const EXTENSION_ESCANEO: Record<TipoMimeEscaneo, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tif',
  'application/pdf': 'pdf',
};

const empiezaCon = (bytes: Uint8Array, firma: number[], desde = 0) =>
  firma.every((byte, i) => bytes[desde + i] === byte);

/**
 * El formato se reconoce por los primeros bytes del archivo y no por su nombre ni por lo que dice
 * el navegador: así un .exe renombrado a .pdf no entra al archivo.
 */
export function detectarFormatoEscaneo(bytes: Uint8Array): TipoMimeEscaneo | null {
  if (empiezaCon(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (empiezaCon(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (
    empiezaCon(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    empiezaCon(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }
  if (empiezaCon(bytes, [0x49, 0x49, 0x2a, 0x00]) || empiezaCon(bytes, [0x4d, 0x4d, 0x00, 0x2a])) {
    return 'image/tiff';
  }
  if (empiezaCon(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
  return null;
}

export class FormatoEscaneoNoPermitidoError extends ErrorRegla {
  constructor() {
    super('Ese formato no se acepta. Usa JPG, PNG, WEBP, TIFF o PDF.');
  }
}

export class EscaneoDemasiadoGrandeError extends ErrorRegla {
  constructor() {
    super('El escaneo pesa más de 20 MB.');
  }
}

export class EscaneoVacioError extends ErrorRegla {
  constructor() {
    super('El archivo del escaneo está vacío.');
  }
}

/** Valida tamaño y contenido; devuelve el formato real del archivo. */
export function validarEscaneo(bytes: Uint8Array): TipoMimeEscaneo {
  if (bytes.length === 0) throw new EscaneoVacioError();
  if (bytes.length > TAMANO_MAXIMO_ESCANEO) throw new EscaneoDemasiadoGrandeError();
  const formato = detectarFormatoEscaneo(bytes);
  if (!formato) throw new FormatoEscaneoNoPermitidoError();
  return formato;
}
