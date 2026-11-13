import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import { colores } from '../../../app/tema';

/** pdf.js pesa: se carga solo cuando alguien revisa un PDF. */
async function abrirPdf(blob: Blob): Promise<PDFDocumentProxy> {
  const pdfjs = await import('pdfjs-dist');
  const { default: trabajador } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = trabajador;
  return pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
}

/** Dibuja una página del PDF en el lienzo, al ancho y alto que caben. */
function Pagina({
  doc,
  numero,
  ancho,
  alto,
  etiqueta,
}: {
  doc: PDFDocumentProxy;
  numero: number;
  ancho: number;
  alto: number;
  etiqueta?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelado = false;
    let tarea: { cancel: () => void } | null = null;
    void (async () => {
      const pagina = await doc.getPage(numero);
      if (cancelado || !lienzo.current) return;
      const base = pagina.getViewport({ scale: 1 });
      const escala = Math.min(ancho / base.width, alto / base.height);
      // nitidez en pantallas de alta densidad
      const densidad = Math.min(window.devicePixelRatio || 1, 2);
      const vista = pagina.getViewport({ scale: escala * densidad });
      const canvas = lienzo.current;
      canvas.width = Math.floor(vista.width);
      canvas.height = Math.floor(vista.height);
      canvas.style.width = `${Math.floor(vista.width / densidad)}px`;
      canvas.style.height = `${Math.floor(vista.height / densidad)}px`;
      const contexto = canvas.getContext('2d');
      if (!contexto) return;
      const render = pagina.render({ canvasContext: contexto, viewport: vista });
      tarea = render;
      await render.promise.catch(() => undefined);
    })();
    return () => {
      cancelado = true;
      tarea?.cancel();
    };
  }, [doc, numero, ancho, alto]);

  return (
    <Box
      component="canvas"
      ref={lienzo}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      sx={{ display: 'block', bgcolor: '#FFFFFF', boxShadow: '0 18px 36px rgba(0, 0, 0, .45)' }}
    />
  );
}

interface Props {
  blob: Blob;
  titulo: string;
  revisadas: number[];
  onCambiarRevisadas: (paginas: number[]) => void;
  onTotal: (total: number) => void;
}

/**
 * Revisión página por página de un PDF: la página en grande, las miniaturas al lado y un check
 * «Esta página se lee bien» por cada una. Aprobar exige marcarlas todas.
 */
export function RevisionPaginas({ blob, titulo, revisadas, onCambiarRevisadas, onTotal }: Props) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [fallo, setFallo] = useState(false);
  const [actual, setActual] = useState(1);
  const zona = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState({ ancho: 500, alto: 600 });

  useEffect(() => {
    let vigente = true;
    let abierto: PDFDocumentProxy | null = null;
    setDoc(null);
    setFallo(false);
    abrirPdf(blob)
      .then((d) => {
        abierto = d;
        if (!vigente) return void d.destroy();
        setDoc(d);
        setActual(1);
        onTotal(d.numPages);
      })
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
      void abierto?.destroy();
    };
    // onTotal cambia en cada render del padre; el documento solo depende del archivo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  useEffect(() => {
    const el = zona.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(([entrada]) => {
      if (!entrada) return;
      const { width, height } = entrada.contentRect;
      setMedidas({ ancho: Math.max(160, width - 32), alto: Math.max(200, height - 32) });
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, [doc]);

  if (fallo) {
    return (
      <Typography sx={{ p: 3, color: '#FFFFFF' }}>
        No se pudo leer el PDF aquí. Ábrelo aparte para revisarlo.
      </Typography>
    );
  }
  if (!doc) {
    return (
      <Box role="status" sx={{ display: 'grid', placeItems: 'center', color: '#FFFFFF', gap: 1.5 }}>
        <CircularProgress sx={{ color: colores.amarillo }} aria-hidden />
        Preparando las páginas…
      </Box>
    );
  }

  const total = doc.numPages;
  const marcada = revisadas.includes(actual);
  const alternar = () => {
    const siguientes = marcada
      ? revisadas.filter((n) => n !== actual)
      : [...revisadas, actual].sort((a, b) => a - b);
    onCambiarRevisadas(siguientes);
    // al marcar, se pasa sola a la siguiente sin revisar
    if (!marcada) {
      const pendiente = Array.from({ length: total }, (_, i) => i + 1).find(
        (n) => n > actual && !siguientes.includes(n),
      );
      if (pendiente) setActual(pendiente);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: { xs: 'column-reverse', md: 'row' },
      }}
    >
      <Box
        component="ol"
        aria-label={`Páginas de ${titulo}`}
        sx={{
          m: 0,
          p: 1.25,
          listStyle: 'none',
          flex: 'none',
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: 1.25,
          overflow: 'auto',
          width: { md: 118 },
          bgcolor: 'rgba(0, 0, 0, .25)',
        }}
      >
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const ok = revisadas.includes(n);
          return (
            <li key={n}>
              <Box
                component="button"
                type="button"
                onClick={() => setActual(n)}
                aria-current={n === actual ? 'page' : undefined}
                aria-label={`Página ${n}, ${ok ? 'se lee bien' : 'sin revisar'}`}
                sx={{
                  position: 'relative',
                  display: 'block',
                  p: 0.5,
                  border: `3px solid ${n === actual ? colores.amarillo : 'transparent'}`,
                  borderRadius: 2,
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Pagina doc={doc} numero={n} ancho={80} alto={104} />
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    minWidth: 24,
                    height: 24,
                    px: 0.5,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    bgcolor: ok ? colores.turquesaOscuro : colores.azulMarino,
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  {ok ? <CheckIcon sx={{ fontSize: 15 }} /> : n}
                </Box>
              </Box>
            </li>
          );
        })}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          ref={zona}
          sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}
        >
          <Pagina
            doc={doc}
            numero={actual}
            ancho={medidas.ancho}
            alto={medidas.alto}
            etiqueta={`Página ${actual} de ${total} de ${titulo}`}
          />
        </Box>
        <Box
          sx={{
            flex: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 1.25,
            borderTop: '1px solid rgba(255, 255, 255, .12)',
            color: '#FFFFFF',
          }}
        >
          <IconButton
            aria-label="Página anterior"
            disabled={actual <= 1}
            onClick={() => setActual(actual - 1)}
            sx={{ color: '#FFFFFF', '&.Mui-disabled': { color: 'rgba(255,255,255,.3)' } }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            aria-live="polite"
            sx={{ fontWeight: 800, minWidth: 110, textAlign: 'center' }}
          >
            Página {actual} de {total}
          </Typography>
          <IconButton
            aria-label="Página siguiente"
            disabled={actual >= total}
            onClick={() => setActual(actual + 1)}
            sx={{ color: '#FFFFFF', '&.Mui-disabled': { color: 'rgba(255,255,255,.3)' } }}
          >
            <ChevronRightIcon />
          </IconButton>
          <Button
            role="checkbox"
            aria-checked={marcada}
            onClick={alternar}
            startIcon={marcada ? <CheckIcon /> : undefined}
            sx={{
              ml: { sm: 1 },
              borderRadius: 999,
              px: 2,
              fontWeight: 800,
              color: marcada ? '#FFFFFF' : colores.azulMarino,
              bgcolor: marcada ? colores.turquesaOscuro : colores.amarillo,
              '&:hover': { bgcolor: marcada ? '#006E7B' : '#FFD459' },
            }}
          >
            {marcada ? 'Esta página se lee bien' : 'Marcar: esta página se lee bien'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
