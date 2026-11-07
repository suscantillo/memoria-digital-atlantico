import { ErrorRegla } from '../comun/errores';

const FORMATO_CODIGO = /^MDA-(\d{4})-(\d{4})$/;

/** Formato MDA-AAAA-NNNN */
export class CodigoPieza {
  private constructor(readonly valor: string) {}

  static desde(valor: string): CodigoPieza {
    const limpio = (valor ?? '').trim().toUpperCase();
    if (!FORMATO_CODIGO.test(limpio)) {
      throw new ErrorRegla(`El código "${valor}" no cumple el formato MDA-AAAA-NNNN.`);
    }
    return new CodigoPieza(limpio);
  }

  static generar(anio: number, consecutivo: number): CodigoPieza {
    if (!Number.isInteger(anio) || anio < 1000 || anio > 9999) {
      throw new ErrorRegla('El año del código debe tener cuatro dígitos.');
    }
    if (!Number.isInteger(consecutivo) || consecutivo < 1 || consecutivo > 9999) {
      throw new ErrorRegla('El consecutivo del código debe estar entre 1 y 9999.');
    }
    return new CodigoPieza(`MDA-${anio}-${String(consecutivo).padStart(4, '0')}`);
  }

  get anio(): number {
    return Number(FORMATO_CODIGO.exec(this.valor)?.[1]);
  }

  get consecutivo(): number {
    return Number(FORMATO_CODIGO.exec(this.valor)?.[2]);
  }

  equals(otro: CodigoPieza): boolean {
    return this.valor === otro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
