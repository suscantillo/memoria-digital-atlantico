import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// la versión legacy trae los polyfills que necesitan los iPhone con iOS anterior al 17.4
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import urlTrabajador from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';
import { lienzoComoPng } from './descargas';

pdfjs.GlobalWorkerOptions.workerSrc = urlTrabajador;

type DocumentoPdf = Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>;

export type ExportarPagina = (numero: number) => Promise<Blob>;

/** Dibuja la página fuera de pantalla a 2000 px de ancho: nítida para imprimir y no muy pesada. */
async function paginaComoPng(documento: DocumentoPdf, numero: number): Promise<Blob> {
  const hoja = await documento.getPage(numero);
  const vista = hoja.getViewport({ scale: 2000 / hoja.getViewport({ scale: 1 }).width });
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.floor(vista.width);
  lienzo.height = Math.floor(vista.height);
  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('El navegador no permite dibujar la página.');
  await hoja.render({ canvasContext: contexto, viewport: vista }).promise;
  return lienzoComoPng(lienzo);
}

interface Props {
  url: string;
  pagina: number;
  /** Ancho en píxeles CSS al que se dibuja la página (ya incluye el zoom). */
  ancho: number;
  descripcion: string;
  onCargado: (totalPaginas: number, exportar: ExportarPagina) => void;
  onError: () => void;
}

/** Dibuja una página del PDF en un canvas. Se carga aparte porque pdf.js pesa cerca de 1 MB. */
export default function LienzoPdf({ url, pagina, ancho, descripcion, onCargado, onError }: Props) {
  const refLienzo = useRef<HTMLCanvasElement>(null);
  const [documento, setDocumento] = useState<DocumentoPdf | null>(null);
  const [dibujando, setDibujando] = useState(true);
  // los avisos al padre cambian en cada render; aquí siempre se usa la última versión
  const refAvisos = useRef({ onCargado, onError });
  refAvisos.current = { onCargado, onError };

  useEffect(() => {
    // al desmontar se destruye la carga y su promesa falla: eso no es un error del archivo
    let cancelado = false;
    const carga = pdfjs.getDocument(url);
    carga.promise.then(
      (doc) => {
        if (cancelado) return;
        setDocumento(doc);
        refAvisos.current.onCargado(doc.numPages, (numero) => paginaComoPng(doc, numero));
      },
      () => {
        if (!cancelado) refAvisos.current.onError();
      },
    );
    return () => {
      cancelado = true;
      setDocumento(null);
      void carga.destroy();
    };
  }, [url]);

  useEffect(() => {
    const lienzo = refLienzo.current;
    const contexto = lienzo?.getContext('2d');
    if (!documento || !lienzo || !contexto || ancho <= 0) return;
    let tarea: ReturnType<Awaited<ReturnType<DocumentoPdf['getPage']>>['render']> | null = null;
    let cancelado = false;
    setDibujando(true);

    void (async () => {
      const hoja = await documento.getPage(pagina);
      if (cancelado) return;
      const escala = ancho / hoja.getViewport({ scale: 1 }).width;
      // se dibuja a la densidad real de la pantalla para que el texto no se vea borroso
      const densidad = window.devicePixelRatio || 1;
      const vista = hoja.getViewport({ scale: escala * densidad });
      lienzo.width = Math.floor(vista.width);
      lienzo.height = Math.floor(vista.height);
      lienzo.style.width = `${Math.floor(vista.width / densidad)}px`;
      lienzo.style.height = `${Math.floor(vista.height / densidad)}px`;
      tarea = hoja.render({ canvasContext: contexto, viewport: vista });
      await tarea.promise;
      if (!cancelado) setDibujando(false);
    })().catch((error: unknown) => {
      const cancelada = error instanceof Error && error.name === 'RenderingCancelledException';
      if (!cancelado && !cancelada) refAvisos.current.onError();
    });

    return () => {
      cancelado = true;
      tarea?.cancel();
    };
  }, [documento, pagina, ancho]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        lineHeight: 0,
        // mientras llega el archivo se reserva el espacio de una hoja carta
        minWidth: documento ? 0 : ancho,
        minHeight: documento ? 0 : Math.round(ancho * 1.29),
      }}
    >
      <Box
        component="canvas"
        ref={refLienzo}
        role="img"
        aria-label={descripcion}
        sx={{ bgcolor: '#FFFFFF', boxShadow: '0 18px 36px rgba(0, 0, 0, .45)' }}
      />
      {dibujando && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <CircularProgress aria-label="Cargando el documento" sx={{ color: '#FFC21A' }} />
        </Box>
      )}
    </Box>
  );
}
