export const TIPOS_ACEPTADOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'application/pdf',
] as const;
export const EXTENSIONES_ACEPTADAS = '.jpg,.jpeg,.png,.webp,.tif,.tiff,.pdf';
export const MAXIMO_BYTES = 20 * 1024 * 1024;

export interface DatosEscaneo {
  archivo: File;
  tema: string;
  autor: string;
  palabrasClave: string[];
}

/** Respuesta de POST /archivos. */
export interface EscaneoCargado {
  id: string;
  piezaId: string;
  codigo: string;
  estado: 'EN_REVISION';
  estadoPieza: 'ESCANEADA';
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  tema: string;
  autor: string;
  palabrasClave: string[];
  creadoEn: string;
}

export function tamanoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
