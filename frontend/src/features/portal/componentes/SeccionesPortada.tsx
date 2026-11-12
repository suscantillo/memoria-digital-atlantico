import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { DECADAS, rutaExplorar } from '../explorar';
import { usePiezasPortal, useTotalesPortal } from '../hooks';
import { NOMBRE_TIPO, TIPOS_PIEZA, type TipoPieza } from '../tipos';
import { IconoTipo } from './IconoTipo';
import { TarjetaPieza, TarjetaPiezaCargando } from './TarjetaPieza';
import { useAlAparecer } from './useAlAparecer';

const curva = 'cubic-bezier(.2, .8, .2, 1)';
const rebote = 'cubic-bezier(.34, 1.56, .64, 1)';

const subirSuave = keyframes`
  from { opacity: 0; translate: 0 28px; }
  to { opacity: 1; translate: 0 0; }
`;
const trazarLinea = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;
const brotar = keyframes`
  0% { opacity: 0; scale: 0; }
  100% { opacity: 1; scale: 1; }
`;
const recorrer = keyframes`
  0% { left: 0%; opacity: 0; }
  8% { opacity: 1; }
  92% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

function useMovimiento() {
  return !useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
}

/** Título de sección que sube al entrar en pantalla. */
function TituloSeccion({ id, children }: { id: string; children: ReactNode }) {
  const animar = useMovimiento();
  const { ref, visible } = useAlAparecer<HTMLHeadingElement>();
  return (
    <Typography
      ref={ref}
      id={id}
      variant="h2"
      sx={{
        m: 0,
        fontWeight: 900,
        fontSize: 'clamp(34px, 4.4vw, 56px)',
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
        ...(animar && {
          opacity: 0,
          ...(visible && { animation: `${subirSuave} .8s ${curva} both` }),
        }),
      }}
    >
      {children}
    </Typography>
  );
}

const CAJAS: Record<TipoPieza, { desc: string; fondo: string; giro: number }> = {
  DOCUMENTO: { desc: 'Cartas, actas, censos y planos.', fondo: colores.papel, giro: -1.5 },
  FOTOGRAFIA: { desc: 'Calles, oficios y celebraciones.', fondo: colores.amarillo, giro: 1 },
  PERIODICO: { desc: 'Ediciones antiguas, página por página.', fondo: '#5FD4E0', giro: -0.5 },
};

function contarPiezas(total: number | undefined) {
  if (total === undefined) return '';
  if (total === 0) return 'Aún sin piezas publicadas';
  return total === 1 ? '1 pieza publicada' : `${total} piezas publicadas`;
}

export function AbreUnaCaja() {
  const totales = useTotalesPortal(TIPOS_PIEZA.map((tipo) => ({ tipo })));
  return (
    <Box component="section" aria-labelledby="titulo-cajas" sx={{ display: 'grid', gap: 5 }}>
      <TituloSeccion id="titulo-cajas">Abre una caja</TituloSeccion>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          pt: 2,
          display: 'grid',
          gap: 3.5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {TIPOS_PIEZA.map((tipo, i) => {
          const caja = CAJAS[tipo];
          return (
            <li key={tipo}>
              <Box
                component={RouterLink}
                to={rutaExplorar({ tipo })}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  minHeight: 230,
                  p: '46px 28px 28px',
                  color: colores.azulMarino,
                  textDecoration: 'none',
                  bgcolor: caja.fondo,
                  borderRadius: '4px 18px 18px 18px',
                  boxShadow: '0 10px 0 rgba(14, 45, 107, .12)',
                  rotate: `${caja.giro}deg`,
                  transition: `rotate .35s ${curva}, translate .35s ${curva}`,
                  '&:hover': { rotate: '0deg', translate: '0 -6px' },
                  '&:hover .flecha-caja': { translate: '4px 0' },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: -22,
                    left: 0,
                    width: '46%',
                    height: 26,
                    bgcolor: caja.fondo,
                    borderRadius: '12px 12px 0 0',
                  }}
                />
                <IconoTipo tipo={tipo} />
                <Box
                  component="span"
                  sx={{ fontFamily: 'h1.fontFamily', fontWeight: 800, fontSize: 30 }}
                >
                  {NOMBRE_TIPO[tipo].plural}
                </Box>
                <Box component="span" sx={{ fontSize: 18, lineHeight: 1.4, pr: 6 }}>
                  {caja.desc}
                </Box>
                <Box component="span" sx={{ fontSize: 15, fontWeight: 700, minHeight: 22, pr: 6 }}>
                  {contarPiezas(totales[i]?.data)}
                </Box>
                <Box
                  aria-hidden
                  className="flecha-caja"
                  sx={{
                    position: 'absolute',
                    right: 22,
                    bottom: 22,
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    bgcolor: colores.azulMarino,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'translate .25s',
                  }}
                >
                  <ArrowForwardIcon />
                </Box>
              </Box>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}

const GIROS = [-4, 3, -2, 5];

export function RecienSalidas() {
  // el código crece con cada registro, así que el más alto es la pieza más nueva
  const consulta = usePiezasPortal({ orden: 'codigo', direccion: 'desc', limite: 4 });

  return (
    <Box component="section" aria-labelledby="titulo-recientes" sx={{ display: 'grid', gap: 5 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <TituloSeccion id="titulo-recientes">Recién salidas de la caja</TituloSeccion>
        <Link component={RouterLink} to={rutaExplorar()} sx={{ fontSize: 18, fontWeight: 700 }}>
          Ver todo →
        </Link>
      </Box>

      {consulta.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => consulta.refetch()}>
              Reintentar
            </Button>
          }
        >
          No pudimos traer las piezas más nuevas. Revisa tu conexión e intenta otra vez.
        </Alert>
      )}

      {consulta.isSuccess && consulta.data.datos.length === 0 && (
        <Typography sx={{ fontSize: 18 }}>
          Todavía no hay piezas publicadas. Vuelve pronto: el equipo está digitalizando el archivo.
        </Typography>
      )}

      {!consulta.isError && !(consulta.isSuccess && consulta.data.datos.length === 0) && (
        <Box
          component="ul"
          aria-busy={consulta.isPending}
          sx={{
            listStyle: 'none',
            m: 0,
            p: '10px 0',
            display: 'grid',
            gap: '36px 28px',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(auto-fit, minmax(200px, 260px))',
            },
            justifyContent: 'center',
            justifyItems: 'center',
          }}
        >
          {consulta.isPending
            ? GIROS.map((giro) => (
                <li key={giro} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <TarjetaPiezaCargando giro={giro} />
                </li>
              ))
            : consulta.data?.datos.map((pieza, i) => (
                <li
                  key={pieza.codigo}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  <TarjetaPieza pieza={pieza} giro={GIROS[i % GIROS.length]} />
                </li>
              ))}
        </Box>
      )}
    </Box>
  );
}

/** Línea de tiempo: se traza al aparecer, las décadas brotan una a una y una chispa la recorre. */
export function ViajaEnElTiempo() {
  const animar = useMovimiento();
  const { ref, visible } = useAlAparecer<HTMLDivElement>(0.4);
  const totales = useTotalesPortal(DECADAS.map((decada) => ({ decada })));
  const activo = animar && visible;
  const oculto = animar && !visible;

  return (
    <Box
      component="section"
      aria-labelledby="titulo-tiempo"
      sx={{
        position: 'relative',
        width: '100vw',
        // Stack anula los márgenes de sus hijos; con left la banda cruza toda la pantalla
        left: 'calc(50% - 50vw)',
        bgcolor: colores.amarillo,
        px: 3,
        py: { xs: 7, md: 10 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gap: 5.5 }}>
        <TituloSeccion id="titulo-tiempo">Viaja en el tiempo</TituloSeccion>
        <Box
          component="nav"
          aria-label="Décadas"
          ref={ref}
          sx={{ position: 'relative', overflowX: 'auto', px: 0.5, pt: 1, pb: 1 }}
        >
          <Box sx={{ position: 'relative', minWidth: 640 }}>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: 20,
                right: 20,
                top: 23,
                height: 6,
                bgcolor: colores.azulMarino,
                borderRadius: 3,
                transformOrigin: 'left',
                ...(oculto && { transform: 'scaleX(0)' }),
                ...(activo && { animation: `${trazarLinea} 1.1s ${curva} both` }),
              }}
            >
              {activo && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    width: 14,
                    height: 14,
                    mt: '-7px',
                    ml: '-7px',
                    borderRadius: 999,
                    bgcolor: colores.naranja,
                    boxShadow: `0 0 0 5px rgba(204, 63, 20, .25), 0 0 16px ${colores.naranja}`,
                    animation: `${recorrer} 6s ease-in-out 1.6s infinite`,
                  }}
                />
              )}
            </Box>
            <Box
              component="ol"
              sx={{
                position: 'relative',
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              {DECADAS.map((decada, i) => {
                const total = totales[i]?.data;
                const retraso = 0.35 + i * 0.12;
                return (
                  <li key={decada}>
                    <Box
                      component={RouterLink}
                      to={rutaExplorar({ decada })}
                      aria-label={`Década de ${decada}: ${contarPiezas(total) || 'ver piezas'}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.25,
                        p: 0.75,
                        color: colores.azulMarino,
                        textDecoration: 'none',
                        borderRadius: 3,
                        '&:hover .punto, &:focus-visible .punto': {
                          bgcolor: colores.naranja,
                          borderColor: colores.naranja,
                          scale: '1.25',
                        },
                        '&:hover .anio': { color: colores.naranja },
                      }}
                    >
                      <Box
                        className="punto"
                        aria-hidden
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          bgcolor: colores.papel,
                          border: `6px solid ${colores.azulMarino}`,
                          transition: `scale .25s ${rebote}, background-color .2s, border-color .2s`,
                          ...(oculto && { opacity: 0 }),
                          ...(activo && { animation: `${brotar} .5s ${rebote} ${retraso}s both` }),
                        }}
                      />
                      <Box
                        className="anio"
                        component="span"
                        sx={{
                          fontFamily: 'h1.fontFamily',
                          fontWeight: 900,
                          fontSize: { xs: 22, sm: 28 },
                          transition: 'color .2s',
                          ...(oculto && { opacity: 0 }),
                          ...(activo && {
                            animation: `${subirSuave} .6s ${curva} ${retraso + 0.1}s both`,
                          }),
                        }}
                      >
                        {decada}
                      </Box>
                      <Box
                        component="span"
                        aria-hidden
                        sx={{
                          minHeight: 20,
                          fontSize: 14,
                          fontWeight: 700,
                          opacity: total ? 1 : 0.65,
                          whiteSpace: 'nowrap',
                          ...(oculto && { opacity: 0 }),
                          ...(activo && {
                            animation: `${subirSuave} .6s ${curva} ${retraso + 0.2}s both`,
                          }),
                        }}
                      >
                        {total === undefined ? '' : total === 1 ? '1 pieza' : `${total} piezas`}
                      </Box>
                    </Box>
                  </li>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function EstasEnLaAduana() {
  return (
    <Box component="section" aria-labelledby="titulo-qr">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 4.5,
          p: { xs: 3.5, sm: 5.5 },
          bgcolor: colores.naranja,
          color: '#FFFFFF',
          borderRadius: 7,
          clipPath: 'polygon(0 3%, 100% 0, 99% 100%, 1% 97%)',
          '--color-foco': colores.amarillo,
        }}
      >
        <Box
          aria-hidden
          sx={{
            flex: 'none',
            width: { xs: 110, sm: 150 },
            height: { xs: 110, sm: 150 },
            p: 2,
            bgcolor: '#FFFFFF',
            borderRadius: 4,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 21 21">
            <path
              fill={colores.azulMarino}
              d="M0 0h7v7H0zm2 2v3h3V2zM14 0h7v7h-7zm2 2v3h3V2zM0 14h7v7H0zm2 2v3h3v-3zM9 0h2v2H9zm0 4h3v2H9zm3-2h1v2h-1zM9 9h4v2H9zm6 0h2v3h-2zm4 0h2v2h-2zM9 13h2v4H9zm4 0h4v2h-4zm6 3h2v5h-2zm-6 2h4v3h-4zm-4 1h2v2H9zM0 9h2v3H0zm4 0h3v2H4z"
            />
          </svg>
        </Box>
        <Box sx={{ flex: '1 1 320px', display: 'grid', gap: 1.5 }}>
          <Typography
            id="titulo-qr"
            variant="h2"
            sx={{ m: 0, fontWeight: 900, fontSize: 'clamp(30px, 3.6vw, 46px)', color: '#FFFFFF' }}
          >
            ¿Estás en la Aduana?
          </Typography>
          <Typography sx={{ fontSize: { xs: 17, sm: 20 }, lineHeight: 1.45, maxWidth: 560 }}>
            Escanea con la cámara de tu celular el código QR de cualquier pieza y mira su copia
            digital sin sacar el original de su caja.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
