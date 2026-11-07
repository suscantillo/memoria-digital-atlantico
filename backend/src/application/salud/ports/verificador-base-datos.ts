export const VERIFICADOR_BASE_DATOS = Symbol('VERIFICADOR_BASE_DATOS');

export interface VerificadorBaseDatos {
  estaDisponible(): Promise<boolean>;
}
