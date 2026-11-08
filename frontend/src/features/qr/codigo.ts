const PATRON_CODIGO = /MDA-\d{4}-\d{4}/;

/**
 * Saca el código de pieza de lo que traiga el QR: el código suelto o el enlace a su ficha.
 * Solo se usa el código y nunca se abre la dirección leída: un QR pegado encima del nuestro
 * podría llevar a un sitio falso.
 */
export function extraerCodigo(texto: string): string | null {
  return texto.trim().toUpperCase().match(PATRON_CODIGO)?.[0] ?? null;
}

export function rutaPieza(codigo: string) {
  return `/p/${codigo}?qr=1`;
}
