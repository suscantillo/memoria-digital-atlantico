import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { colores } from '../../../app/tema';
import type { ArchivoPortal } from '../tipos';
import { descargarOriginal, guardarBlob, imagenComoPng } from './descargas';
import type { ExportarPagina } from './LienzoPdf';

const LienzoPdf = lazy(() => import('./LienzoPdf'));

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const MARGEN = 24;

const estiloBoton = {
  color: '#FFFFFF',
  // en 360 px caben las ocho herramientas solo si los botones se compactan un poco
  p: { xs: 0.75, sm: 1 },
  '&:hover': { bgcolor: colores.azulMedio },
  '&.Mui-disabled': { color: 'rgba(255, 255, 255, .35)' },
} as const;

function Boton({
  titulo,
  onClick,
  deshabilitado = false,
  children,
}: {
  titulo: string;
  onClick: () => void;
  deshabilitado?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip title={titulo}>
      {/* el span deja mostrar la ayuda aunque el botón esté deshabilitado */}
      <span>
        <IconButton aria-label={titulo} onClick={onClick} disabled={deshabilitado} sx={estiloBoton}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

interface Props {
  archivo: ArchivoPortal;
  descripcion: string;
  /** Base del nombre de las descargas, normalmente el código de la pieza. */
  nombreArchivo: string;
}

function extension(url: string, tipoMime: string) {
  const deLaUrl = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url)?.[1];
  return (deLaUrl ?? tipoMime.split('/')[1] ?? 'archivo').toLowerCase();
}

/** Visor del documento digitalizado: PDF página por página o imagen, con zoom y pantalla completa. */
export function VisorDocumento({ archivo, descripcion, nombreArchivo }: Props) {
  const esPdf = archivo.tipoMime === 'application/pdf';
  const refMarco = useRef<HTMLDivElement>(null);
  const refArea = useRef<HTMLDivElement>(null);
  const [anchoArea, setAnchoArea] = useState(0);
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [completa, setCompleta] = useState(false);
  const [anclaMenu, setAnclaMenu] = useState<HTMLElement | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const refExportar = useRef<ExportarPagina | null>(null);
  const puedePantallaCompleta = typeof document !== 'undefined' && document.fullscreenEnabled;

  useEffect(() => {
    const area = refArea.current;
    if (!area) return;
    const observador = new ResizeObserver(([e]) => e && setAnchoArea(e.contentRect.width));
    observador.observe(area);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const alCambiar = () => setCompleta(document.fullscreenElement === refMarco.current);
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  const cambiarZoom = (paso: number) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + paso) * 10) / 10)));

  const alternarPantallaCompleta = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void refMarco.current?.requestFullscreen();
  };

  const descargar = async (formato: 'original' | 'png') => {
    setAnclaMenu(null);
    try {
      if (formato === 'original') {
        await descargarOriginal(
          archivo.url,
          `${nombreArchivo}.${extension(archivo.url, archivo.tipoMime)}`,
        );
      } else if (esPdf && refExportar.current) {
        guardarBlob(await refExportar.current(pagina), `${nombreArchivo}-pagina-${pagina}.png`);
      } else {
        guardarBlob(await imagenComoPng(archivo.url), `${nombreArchivo}.png`);
      }
    } catch {
      setAviso('No se pudo descargar. Prueba abriéndolo en otra pestaña.');
    }
  };

  const anchoHoja = Math.max(0, Math.round((anchoArea - MARGEN * 2) * zoom));

  return (
    <Box
      ref={refMarco}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: '74vh', md: 'calc(100vh - 140px)' },
        minHeight: 460,
        maxHeight: 980,
        bgcolor: colores.azulMarino,
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: `0 10px 0 ${colores.amarillo}`,
        '--color-foco': colores.amarillo,
        '&:fullscreen': { borderRadius: 0, maxHeight: 'none', boxShadow: 'none' },
      }}
    >
      <Box
        role="toolbar"
        aria-label="Herramientas del visor"
        sx={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0, sm: 0.5 },
          px: { xs: 0.5, sm: 1 },
          py: 0.75,
          borderBottom: '1px solid rgba(255, 255, 255, .12)',
          color: '#FFFFFF',
        }}
      >
        {esPdf && totalPaginas > 1 && (
          <>
            <Boton
              titulo="Página anterior"
              onClick={() => setPagina((p) => p - 1)}
              deshabilitado={pagina <= 1}
            >
              <ChevronLeftIcon />
            </Boton>
            <Typography
              aria-live="polite"
              sx={{
                minWidth: { xs: 40, sm: 64 },
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {pagina} / {totalPaginas}
            </Typography>
            <Boton
              titulo="Página siguiente"
              onClick={() => setPagina((p) => p + 1)}
              deshabilitado={pagina >= totalPaginas}
            >
              <ChevronRightIcon />
            </Boton>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        <Boton titulo="Alejar" onClick={() => cambiarZoom(-0.5)} deshabilitado={zoom <= ZOOM_MIN}>
          <RemoveIcon />
        </Boton>
        <Typography
          sx={{
            display: { xs: 'none', sm: 'block' },
            minWidth: 48,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {Math.round(zoom * 100)}%
        </Typography>
        <Boton titulo="Acercar" onClick={() => cambiarZoom(0.5)} deshabilitado={zoom >= ZOOM_MAX}>
          <AddIcon />
        </Boton>
        {puedePantallaCompleta && (
          <Boton
            titulo={completa ? 'Salir de pantalla completa' : 'Pantalla completa'}
            onClick={alternarPantallaCompleta}
          >
            {completa ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </Boton>
        )}
        <Tooltip title="Descargar">
          <IconButton
            aria-label="Descargar"
            aria-haspopup="menu"
            aria-expanded={anclaMenu !== null}
            aria-controls={anclaMenu ? 'menu-descargar' : undefined}
            onClick={(e) => setAnclaMenu(e.currentTarget)}
            sx={estiloBoton}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {/* sin portal: en pantalla completa solo se ve lo que está dentro del visor */}
        <Menu
          id="menu-descargar"
          anchorEl={anclaMenu}
          open={anclaMenu !== null}
          onClose={() => setAnclaMenu(null)}
          disablePortal
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => void descargar('original')}>
            <ListItemText
              primary={esPdf ? 'PDF original' : 'Imagen original'}
              secondary={esPdf ? 'Todas las páginas' : 'En su formato y tamaño'}
            />
          </MenuItem>
          <MenuItem onClick={() => void descargar('png')}>
            <ListItemText
              primary={esPdf ? 'PNG de esta página' : 'PNG'}
              secondary={esPdf ? `Página ${pagina}, en alta resolución` : 'Convertida a PNG'}
            />
          </MenuItem>
        </Menu>
        <Tooltip title="Abrir en otra pestaña">
          <IconButton
            component="a"
            href={archivo.url}
            target="_blank"
            rel="noopener"
            aria-label="Abrir el documento en otra pestaña"
            sx={estiloBoton}
          >
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* la hoja ocupa el ancho del visor; al acercar crece y se recorre desplazándose */}
      <Box ref={refArea} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {/* margin auto centra la hoja sin cortarla cuando el zoom la hace más grande que el visor */}
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            minWidth: '100%',
            minHeight: '100%',
            p: `${MARGEN}px`,
            textAlign: 'center',
            '& > *': { m: esPdf ? '0 auto' : 'auto' },
          }}
        >
          {fallo ? (
            <Box sx={{ color: '#DDE3EE', py: 8, px: 2, whiteSpace: 'normal' }}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: 20, mb: 1 }}>
                No pudimos mostrar el documento aquí
              </Typography>
              <Link
                href={archivo.url}
                target="_blank"
                rel="noopener"
                sx={{ color: colores.amarillo }}
              >
                Ábrelo en otra pestaña
              </Link>
            </Box>
          ) : esPdf ? (
            anchoHoja > 0 && (
              <Suspense fallback={<CircularProgress sx={{ color: colores.amarillo, mt: 8 }} />}>
                <LienzoPdf
                  url={archivo.url}
                  pagina={pagina}
                  ancho={anchoHoja}
                  descripcion={`Página ${pagina} de ${totalPaginas || 1}: ${descripcion}`}
                  onCargado={(total, exportar) => {
                    setTotalPaginas(total);
                    refExportar.current = exportar;
                  }}
                  onError={() => setFallo(true)}
                />
              </Suspense>
            )
          ) : (
            <Box
              component="img"
              src={archivo.url}
              alt={descripcion}
              onError={() => setFallo(true)}
              sx={{
                display: 'block',
                width: anchoHoja || '100%',
                height: 'auto',
                boxShadow: '0 18px 36px rgba(0, 0, 0, .45)',
              }}
            />
          )}
        </Box>
      </Box>
      <Snackbar
        open={aviso !== null}
        autoHideDuration={5000}
        onClose={() => setAviso(null)}
        message={aviso}
      />
    </Box>
  );
}
