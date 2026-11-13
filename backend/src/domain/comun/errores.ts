export abstract class ErrorDominio extends Error {
  protected constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class ErrorRegla extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje);
  }
}

export class ErrorNoEncontrado extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje);
  }
}

export class ErrorConflicto extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje);
  }
}

/** Hay sesión, pero esta persona no puede hacer esto (403). */
export class ErrorProhibido extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje);
  }
}

export class ErrorNoAutorizado extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje);
  }
}
