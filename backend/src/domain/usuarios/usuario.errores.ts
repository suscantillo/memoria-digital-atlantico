import { ErrorConflicto } from '../comun/errores';

export class CorreoUsuarioDuplicadoError extends ErrorConflicto {
  constructor(correo: string) {
    super(`Ya existe una cuenta con el correo "${correo}".`);
  }
}

/** La cuenta subió escaneos cuando era del personal: borrarla dejaría el historial sin autor. */
export class CuentaConHistorialError extends ErrorConflicto {
  constructor() {
    super(
      'Esta cuenta tiene escaneos a su nombre en el archivo y no se puede eliminar. Pide al administrador que la desactive.',
    );
  }
}
