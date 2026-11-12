import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { keyframes } from '@mui/material/styles';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { BuscadorPortal } from '../componentes/BuscadorPortal';
import { FUENTE_MAQUINA, TarjetaResultado } from '../componentes/TarjetaResultado';
import {
  aParametrosApi,
  DECADAS,
  leerFiltros,
  rutaExplorar,
  type FiltrosExplorar,
} from '../explorar';
import { usePiezasPortal } from '../hooks';
import { NOMBRE_TIPO, TIPOS_PIEZA, type TipoPieza } from '../tipos';

const curva = 'cubic-bezier(.2, .8, .2, 1)';

const deriva = keyframes`
  from { transform: translateX(-20vw); }
  to { transform: translateX(110vw); }
`;
const gira = keyframes`
  to { transform: rotate(360deg); }
`;
const sube = keyframes`
  from { transform: translateY(105%); }
  to { transform: none; }
`;
const cae = keyframes`
  from { opacity: 0; transform: translateY(-40px) rotate(-8deg); }
  to { opacity: 1; }
`;
const estampa = keyframes`
  0% { opacity: 0; transform: scale(1.8) rotate(-14deg); }
  60% { opacity: 1; transform: scale(.94) rotate(-6deg); }
  100% { transform: scale(1) rotate(-6deg); }
`;

const sinMovimiento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

const GIROS_SELLO = [-3, 2, -2, 3];
const GIROS_TARJETA = [-3, 2, -1.5, 3, -2, -3, 2.5];

function Nube({ arriba, ancho, duracion, retraso, opacidad }: Record<string, number>) {
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 150 60"
      sx={{
        position: 'absolute',
        left: 0,
        top: arriba,
        width: ancho,
        animation: `${deriva} ${duracion}s linear ${retraso}s infinite`,
        ...sinMovimiento,
      }}
    >
      <path
        d="M10 50h130l-14-18-20 4-10-24-30 8-14 14-24-2z"
        fill={colores.papel}
        opacity={opacidad}
      />
    </Box>
  );
}

/** Palabra que sube desde abajo de su renglón, como en el título del diseño. */
function Palabra({
  children,
  retraso,
  color,
}: {
  children: ReactNode;
  retraso: number;
  color?: string;
}) {
  return (
    <Box
      component="span"
      sx={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          color,
          animation: `${sube} .8s ${curva} ${retraso}s both`,
          ...sinMovimiento,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function subtituloBusqueda(filtros: FiltrosExplorar) {
  if (filtros.busqueda) return `«${filtros.busqueda}»`;
  const partes = [
    filtros.tipo && NOMBRE_TIPO[filtros.tipo].plural.toLowerCase(),
    filtros.decada && `de los ${filtros.decada}s`,
  ].filter(Boolean);
  return partes.length ? partes.join(' ') : 'en el archivo';
}

function Sello({
  activo,
  giro,
  onClick,
  children,
}: {
  activo: boolean;
  giro: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      sx={{
        minHeight: 46,
        px: 2.25,
        borderRadius: '10px',
        border: activo ? `3px solid ${colores.naranja}` : `3px dashed ${colores.azulMarino}`,
        bgcolor: activo ? colores.naranja : 'transparent',
        color: activo ? '#FFFFFF' : colores.azulMarino,
        fontFamily: 'h1.fontFamily',
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transform: `rotate(${activo ? -6 : giro}deg)`,
        transition: 'transform .2s',
        '&:hover': { transform: 'rotate(0deg) scale(1.06)' },
        ...(activo && { animation: `${estampa} .45s ${curva} both`, ...sinMovimiento }),
      }}
    >
      {children}
    </Box>
  );
}

function Pildora({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      sx={{
        minWidth: 64,
        minHeight: 44,
        px: 1.5,
        borderRadius: 999,
        border: activo ? 0 : `2px solid ${colores.azulMarino}`,
        bgcolor: activo ? colores.azulMarino : 'transparent',
        color: activo ? colores.amarillo : colores.azulMarino,
        fontFamily: 'h1.fontFamily',
        fontWeight: activo ? 900 : 800,
        fontSize: 17,
        cursor: 'pointer',
        '&:hover': { bgcolor: activo ? colores.azulMarino : 'rgba(14, 45, 107, .08)' },
      }}
    >
      {children}
    </Box>
  );
}

const estiloPagina = (actual: boolean) =>
  ({
    minWidth: 52,
    height: 52,
    px: 2,
    borderRadius: '14px 14px 4px 4px',
    border: actual ? 0 : `2px solid ${colores.azulMarino}`,
    bgcolor: actual ? colores.azulMarino : 'transparent',
    color: actual ? colores.amarillo : colores.azulMarino,
    fontFamily: 'h1.fontFamily',
    fontWeight: actual ? 900 : 800,
    fontSize: 19,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.35, cursor: 'default' },
  }) as const;

/** Páginas visibles: la primera, la última y las vecinas de la actual. */
function paginasVisibles(actual: number, total: number): (number | '…')[] {
  const lista: (number | '…')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - actual) <= 1) lista.push(p);
    else if (lista[lista.length - 1] !== '…') lista.push('…');
  }
  return lista;
}

export function PaginaExplorar() {
  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const consulta = usePiezasPortal(aParametrosApi(filtros));
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const hayFiltros = Boolean(filtros.busqueda || filtros.tipo || filtros.decada);

  // cada cambio de filtro vuelve a la página 1; la página solo cambia con la paginación
  const cambiar = (cambios: Partial<FiltrosExplorar>) => {
    const siguiente = { ...filtros, pagina: 1, ...cambios };
    setParams(new URLSearchParams(rutaExplorar(siguiente).split('?')[1] ?? ''));
  };
  const quitarFiltros = () => setParams(new URLSearchParams());

  // al pasar de página se lleva el foco al título para que el lector de pantalla lo anuncie
  const paginaAnterior = useRef(filtros.pagina);
  useEffect(() => {
    if (paginaAnterior.current !== filtros.pagina) {
      refTitulo.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      paginaAnterior.current = filtros.pagina;
    }
  }, [filtros.pagina]);

  const datos = consulta.data;
  const total = consulta.isSuccess ? datos?.meta.total : undefined;
  const vacio = consulta.isSuccess && datos?.datos.length === 0;
  const totalPaginas = datos?.meta.totalPaginas ?? 0;
  const conteo = total === undefined ? 'Buscando…' : total === 1 ? '1 pieza' : `${total} piezas`;

  return (
    <Box>
      <Box
        component="section"
        aria-labelledby="titulo-explorar"
        sx={{
          position: 'relative',
          width: '100vw',
          left: 'calc(50% - 50vw)',
          mt: { xs: -1, sm: -2 },
          bgcolor: colores.turquesa,
          color: '#FFFFFF',
          px: 3,
          pt: { xs: 6, sm: 7 },
          pb: 12,
          clipPath: 'polygon(0 0, 100% 6%, 100% 92%, 0 100%)',
          overflow: 'hidden',
        }}
      >
        <Nube arriba={34} ancho={170} duracion={40} retraso={0} opacidad={0.9} />
        <Nube arriba={120} ancho={110} duracion={55} retraso={-25} opacidad={0.7} />

        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: '4%',
            top: 26,
            width: { xs: 76, sm: 108 },
            height: { xs: 76, sm: 108 },
            borderRadius: 999,
            bgcolor: colores.amarillo,
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 128 128"
            sx={{
              position: 'absolute',
              inset: 0,
              animation: `${gira} 16s linear infinite`,
              ...sinMovimiento,
            }}
          >
            <defs>
              <path id="circulo-explorar" d="M64 64m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
            </defs>
            <text
              fontFamily="Archivo Variable, sans-serif"
              fontWeight="800"
              fontSize="13"
              letterSpacing="2.6"
              fill={colores.azulMarino}
            >
              <textPath href="#circulo-explorar">EXPLORA · DESCUBRE · CONSULTA ·</textPath>
            </text>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="36%"
              height="36%"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colores.naranja}
              strokeWidth="2.6"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            maxWidth: 1180,
            mx: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 3.5,
          }}
        >
          <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                fontFamily: FUENTE_MAQUINA,
                fontSize: { xs: 16, sm: 20 },
                // en el celular deja libre el lugar del sello
                pr: { xs: 11, sm: 0 },
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: colores.papel,
              }}
            >
              Búsqueda en el archivo
            </Box>
            <Box
              component="h1"
              id="titulo-explorar"
              ref={refTitulo}
              tabIndex={-1}
              aria-live="polite"
              sx={{
                m: 0,
                fontFamily: 'h1.fontFamily',
                fontWeight: 900,
                fontSize: 'clamp(46px, 7vw, 96px)',
                lineHeight: 0.9,
                letterSpacing: '-0.035em',
                overflowWrap: 'anywhere',
                '&:focus': { outline: 'none' },
              }}
            >
              <Palabra key={conteo} retraso={0.1}>
                {conteo}
              </Palabra>
              <br />
              <Palabra key={subtituloBusqueda(filtros)} retraso={0.25} color={colores.azulMarino}>
                {subtituloBusqueda(filtros)}
              </Palabra>
            </Box>
          </Box>
          <Box sx={{ flex: '0 1 460px', minWidth: 0 }}>
            <BuscadorPortal
              valorInicial={filtros.busqueda}
              onBuscar={(busqueda) => cambiar({ busqueda })}
              sombra={colores.azulMarino}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1180,
          mx: 'auto',
          mt: '-36px',
          position: 'relative',
          display: 'grid',
          gap: 3.75,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.75,
            p: '18px 20px',
            bgcolor: colores.papel,
            borderRadius: 5,
            boxShadow: '0 8px 0 #F5D79E',
          }}
        >
          <Box
            role="group"
            aria-label="Tipo de pieza"
            sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.75 }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{ fontFamily: FUENTE_MAQUINA, fontWeight: 700, fontSize: 17 }}
            >
              TIPO:
            </Box>
            {([undefined, ...TIPOS_PIEZA] as (TipoPieza | undefined)[]).map((tipo, i) => (
              <Sello
                key={tipo ?? 'todo'}
                activo={filtros.tipo === tipo}
                giro={GIROS_SELLO[i % GIROS_SELLO.length]}
                onClick={() => cambiar({ tipo })}
              >
                {tipo ? NOMBRE_TIPO[tipo].plural : 'Todo'}
              </Sello>
            ))}
          </Box>
          <Box
            aria-hidden
            sx={{
              width: 2,
              alignSelf: 'stretch',
              bgcolor: '#F5D79E',
              mx: 0.75,
              display: { xs: 'none', md: 'block' },
            }}
          />
          <Box
            role="group"
            aria-label="Década"
            sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{ fontFamily: FUENTE_MAQUINA, fontWeight: 700, fontSize: 17, mr: 0.5 }}
            >
              DÉCADA:
            </Box>
            <Pildora activo={!filtros.decada} onClick={() => cambiar({ decada: undefined })}>
              Todas
            </Pildora>
            {DECADAS.map((decada) => (
              <Pildora
                key={decada}
                activo={filtros.decada === decada}
                onClick={() => cambiar({ decada })}
              >
                {decada}s
              </Pildora>
            ))}
          </Box>
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
            No pudimos buscar en el archivo. Revisa tu conexión e intenta otra vez.
          </Alert>
        )}

        {vacio && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 3,
              p: 4.5,
              bgcolor: colores.papel,
              border: `3px dashed ${colores.naranja}`,
              borderRadius: 5,
              animation: `${cae} .7s ${curva} both`,
              ...sinMovimiento,
            }}
          >
            <svg width="90" height="80" viewBox="0 0 90 80" aria-hidden>
              <path d="M10 30h70v44H10z" fill="#D8C9A8" />
              <path d="M4 18h82v14H4z" fill={colores.naranja} />
              <path
                d="M38 46h14"
                stroke={colores.azulMarino}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <Box sx={{ flex: '1 1 260px' }}>
              <Box
                component="p"
                sx={{ m: 0, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 28 }}
              >
                Esta caja está vacía
              </Box>
              <Box component="p" sx={{ m: '6px 0 0', fontSize: 18 }}>
                No hay piezas publicadas con esos filtros. Prueba otra década, otro tipo u otras
                palabras.
              </Box>
            </Box>
            {hayFiltros && (
              <Button
                variant="contained"
                onClick={quitarFiltros}
                sx={{ minHeight: 50, px: 2.75, borderRadius: 999, fontSize: 17 }}
              >
                Quitar filtros
              </Button>
            )}
          </Box>
        )}

        {!consulta.isError && !vacio && datos && (
          <Box
            component="ul"
            aria-busy={consulta.isFetching}
            sx={{
              listStyle: 'none',
              m: 0,
              p: '18px 0 0',
              columns: '250px',
              columnGap: '30px',
              opacity: consulta.isPlaceholderData ? 0.55 : 1,
              transition: 'opacity .2s',
            }}
          >
            {datos.datos.map((pieza, i) => (
              <Box
                component="li"
                key={pieza.codigo}
                sx={{
                  breakInside: 'avoid',
                  display: 'inline-block',
                  width: '100%',
                  p: '14px 6px 22px',
                  animation: `${cae} .7s ${curva} ${(i * 0.08).toFixed(2)}s both`,
                  ...sinMovimiento,
                }}
              >
                <TarjetaResultado
                  pieza={pieza}
                  indice={i}
                  giro={GIROS_TARJETA[i % GIROS_TARJETA.length]}
                />
              </Box>
            ))}
          </Box>
        )}

        {totalPaginas > 1 && (
          <Box
            component="nav"
            aria-label="Paginación"
            sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.25 }}
          >
            {filtros.pagina > 1 && (
              <Box
                component="button"
                type="button"
                onClick={() => cambiar({ pagina: filtros.pagina - 1 })}
                sx={estiloPagina(false)}
              >
                ← Anterior
              </Box>
            )}
            {paginasVisibles(filtros.pagina, totalPaginas).map((p, i) =>
              p === '…' ? (
                <Box
                  key={`hueco-${i}`}
                  component="span"
                  aria-hidden
                  sx={{ alignSelf: 'center', px: 0.5, fontWeight: 800 }}
                >
                  …
                </Box>
              ) : (
                <Box
                  key={p}
                  component="button"
                  type="button"
                  aria-label={`Página ${p}`}
                  aria-current={p === filtros.pagina ? 'page' : undefined}
                  onClick={() => cambiar({ pagina: p })}
                  sx={estiloPagina(p === filtros.pagina)}
                >
                  {p}
                </Box>
              ),
            )}
            {filtros.pagina < totalPaginas && (
              <Box
                component="button"
                type="button"
                onClick={() => cambiar({ pagina: filtros.pagina + 1 })}
                sx={estiloPagina(false)}
              >
                Siguiente →
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
