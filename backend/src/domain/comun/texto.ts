import { ErrorRegla } from './errores';

export function textoObligatorio(valor: string | undefined | null, campo: string): string {
  const limpio = (valor ?? '').trim();
  if (limpio.length === 0) {
    throw new ErrorRegla(`El campo "${campo}" es obligatorio.`);
  }
  return limpio;
}

export function textoOpcional(valor: string | undefined | null): string | null {
  const limpio = (valor ?? '').trim();
  return limpio.length === 0 ? null : limpio;
}
