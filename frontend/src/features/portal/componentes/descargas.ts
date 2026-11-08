/** Guarda un blob en el dispositivo con el nombre dado. */
export function guardarBlob(blob: Blob, nombre: string) {
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  // se libera después: algunos navegadores leen la dirección un instante más tarde
  window.setTimeout(() => URL.revokeObjectURL(enlace.href), 10_000);
}

/** Descarga el archivo tal cual. Pasa por fetch porque `download` se ignora en enlaces de otro origen. */
export async function descargarOriginal(url: string, nombre: string) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`No se pudo descargar (${respuesta.status}).`);
  guardarBlob(await respuesta.blob(), nombre);
}

export function lienzoComoPng(lienzo: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error('Sin imagen'))),
      'image/png',
    ),
  );
}

/** Convierte una imagen (JPG, WebP…) a PNG dibujándola en un canvas a su tamaño real. */
export async function imagenComoPng(url: string): Promise<Blob> {
  const imagen = new Image();
  imagen.crossOrigin = 'anonymous';
  imagen.src = url;
  await imagen.decode();
  const lienzo = document.createElement('canvas');
  lienzo.width = imagen.naturalWidth;
  lienzo.height = imagen.naturalHeight;
  lienzo.getContext('2d')?.drawImage(imagen, 0, 0);
  return lienzoComoPng(lienzo);
}
