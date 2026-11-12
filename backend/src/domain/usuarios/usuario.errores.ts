import { ErrorConflicto } from '../comun/errores';

export class CorreoUsuarioDuplicadoError extends ErrorConflicto {
  constructor(correo: string) {
    super(`Ya existe una cuenta con el correo "${correo}".`);
  }
}
