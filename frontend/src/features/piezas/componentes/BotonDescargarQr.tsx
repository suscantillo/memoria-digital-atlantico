import QrCode2Icon from '@mui/icons-material/QrCode2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { descargarQrPieza } from '../qr';

// la respuesta pedida como archivo no trae el mensaje del backend legible, así que se explica aquí
function mensajeDeError(error: unknown) {
  const estado = error instanceof AxiosError ? error.response?.status : undefined;
  if (estado === 404) return 'Esa pieza ya no existe en el inventario.';
  if (estado === 403) return 'Tu cuenta no puede descargar códigos QR.';
  if (estado === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  return 'No pudimos generar el QR. Revisa tu conexión e intenta otra vez.';
}

interface Props {
  piezaId: string;
}

/** Botón de la ficha interna que baja el QR de la pieza en PNG (HU-11, criterio 2). */
export function BotonDescargarQr({ piezaId }: Props) {
  const [descargando, setDescargando] = useState(false);
  const [descargado, setDescargado] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const descargar = async () => {
    setDescargando(true);
    setError(null);
    setDescargado(null);
    try {
      setDescargado(await descargarQrPieza(piezaId));
    } catch (e) {
      setError(e);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 1, justifyItems: 'start' }}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<QrCode2Icon />}
        onClick={descargar}
        disabled={descargando}
        sx={{ borderRadius: 999, px: 2.5 }}
      >
        {descargando ? 'Preparando el QR…' : 'Descargar QR'}
      </Button>
      <Box role="status" aria-live="polite" sx={{ fontSize: 14, color: 'text.secondary' }}>
        {descargado && `Se descargó ${descargado}. Imprímelo y pégalo en la carpeta o la caja.`}
      </Box>
      {error !== null && (
        <Alert severity="error" role="alert">
          {mensajeDeError(error)}
        </Alert>
      )}
    </Box>
  );
}
