import { clienteApi } from './cliente';

/** Pide un archivo con la sesión: una etiqueta <img> o <a> no envía el token del panel. */
export async function pedirArchivo(ruta: string): Promise<Blob> {
  const { data } = await clienteApi.get<Blob>(ruta, { responseType: 'blob' });
  return data;
}

export function guardarBlob(blob: Blob, nombre: string) {
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  // se libera después: algunos navegadores leen la dirección un instante más tarde
  window.setTimeout(() => URL.revokeObjectURL(enlace.href), 10_000);
}
