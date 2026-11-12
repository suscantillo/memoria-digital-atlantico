import { clienteApi } from '../../shared/api/cliente';

/** Saca el nombre del archivo de Content-Disposition: attachment; filename="MDA-2026-0001.png". */
function nombreDelArchivo(disposicion: unknown, respaldo: string) {
  if (typeof disposicion !== 'string') return respaldo;
  return /filename="([^"]+)"/.exec(disposicion)?.[1] ?? respaldo;
}

/**
 * GET /piezas/:id/qr (PERSONAL, ADMIN): baja el PNG del QR de la pieza con el código como
 * nombre de archivo, listo para imprimir y pegar en su carpeta o caja (HU-11).
 */
export async function descargarQrPieza(piezaId: string): Promise<string> {
  const respuesta = await clienteApi.get<Blob>(`/piezas/${encodeURIComponent(piezaId)}/qr`, {
    responseType: 'blob',
  });
  const nombre = nombreDelArchivo(respuesta.headers['content-disposition'], 'qr-pieza.png');
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(respuesta.data);
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // se libera después del clic: algunos navegadores leen la URL un instante más tarde
  window.setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  return nombre;
}
