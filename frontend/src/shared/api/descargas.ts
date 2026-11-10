import { BASE_API, clienteApi } from './cliente';

/**
 * Pide un archivo con la sesión: una etiqueta <img> o <a> no envía el token.
 * Acepta la ruta corta (/piezas/…) o la dirección completa que devuelve la API (/api/v1/…).
 */
export async function pedirArchivo(ruta: string): Promise<Blob> {
  const relativa = ruta.startsWith(BASE_API) ? ruta.slice(BASE_API.length) : ruta;
  const { data } = await clienteApi.get<Blob>(relativa, { responseType: 'blob' });
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
