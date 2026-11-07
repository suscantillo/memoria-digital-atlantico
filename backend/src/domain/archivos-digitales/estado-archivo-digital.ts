export const ESTADOS_ARCHIVO_DIGITAL = ['EN_REVISION', 'APROBADO', 'RECHAZADO'] as const;
export type EstadoArchivoDigital = (typeof ESTADOS_ARCHIVO_DIGITAL)[number];
