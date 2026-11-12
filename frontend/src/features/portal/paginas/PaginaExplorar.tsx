import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { BuscadorPortal } from '../componentes/BuscadorPortal';
import { IconoTipo } from '../componentes/IconoTipo';
import { TarjetaPieza, TarjetaPiezaCargando } from '../componentes/TarjetaPieza';
import {
  aParametrosApi,
  DECADAS,
  leerFiltros,
  PIEZAS_POR_PAGINA,
  rutaExplorar,
  type FiltrosExplorar,
} from '../explorar';
import { usePiezasPortal } from '../hooks';
import { NOMBRE_TIPO, TIPOS_PIEZA, type OrdenPiezaPortal } from '../tipos';

const caer = keyframes`
  from { opacity: 0; translate: 0 -32px; rotate: -6deg; }
  to { opacity: 1; translate: 0 0; rotate: 0deg; }
`;

const NOMBRE_ORDEN: Record<OrdenPiezaPortal, string> = {
  titulo: 'Título (A-Z)',
  anio: 'Año (más antiguo primero)',
  codigo: 'Código',
};

const estiloFiltro = (activo: boolean) =>
  ({
    minHeight: 44,
    px: 2,
    borderRadius: 999,
    border: `2px solid ${colores.azulMarino}`,
    bgcolor: activo ? colores.azulMarino : 'transparent',
    color: activo ? '#FFFFFF' : colores.azulMarino,
    fontWeight: 700,
    textTransform: 'none',
    '&:hover': { bgcolor: activo ? colores.azulMedio : 'rgba(14, 45, 107, .08)' },
  }) as const;

function tituloResultados(total: number | undefined, filtros: FiltrosExplorar) {
  if (total === undefined) return 'Buscando en el archivo…';
  const piezas = total === 1 ? '1 pieza' : `${total} piezas`;
  return filtros.busqueda ? `${piezas} para «${filtros.busqueda}»` : piezas;
}

export function PaginaExplorar() {
  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const consulta = usePiezasPortal(aParametrosApi(filtros));
  const refResultados = useRef<HTMLHeadingElement>(null);
  const hayFiltros = Boolean(filtros.busqueda || filtros.tipo || filtros.decada);

  // cada cambio de filtro vuelve a la página 1; la página solo cambia con la paginación
  const cambiar = (cambios: Partial<FiltrosExplorar>) => {
    const siguiente = { ...filtros, pagina: 1, ...cambios };
    setParams(new URLSearchParams(rutaExplorar(siguiente).split('?')[1] ?? ''));
  };

  // al pasar de página se lleva el foco al conteo para que el lector de pantalla lo anuncie
  const paginaAnterior = useRef(filtros.pagina);
  useEffect(() => {
    if (paginaAnterior.current !== filtros.pagina) {
      refResultados.current?.focus();
      paginaAnterior.current = filtros.pagina;
    }
  }, [filtros.pagina]);

  const datos = consulta.data;
  const total = consulta.isSuccess ? datos?.meta.total : undefined;
  const vacio = consulta.isSuccess && datos?.datos.length === 0;

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        <Box
          component="span"
          sx={{
            justifySelf: 'start',
            px: 2,
            py: 0.75,
            borderRadius: 999,
            bgcolor: colores.naranja,
            color: '#FFFFFF',
            fontFamily: 'h1.fontFamily',
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            rotate: '-2deg',
          }}
        >
          Explorar el archivo
        </Box>
        <Typography
          variant="h1"
          ref={refResultados}
          tabIndex={-1}
          aria-live="polite"
          sx={{
            m: 0,
            fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            overflowWrap: 'anywhere',
          }}
        >
          {tituloResultados(total, filtros)}
        </Typography>
        <BuscadorPortal
          valorInicial={filtros.busqueda}
          onBuscar={(busqueda) => cambiar({ busqueda })}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          p: { xs: 2.5, sm: 3 },
          bgcolor: 'background.paper',
          borderRadius: 5,
          boxShadow: '0 6px 0 #F5D79E',
        }}
      >
        <Box
          role="group"
          aria-label="Tipo de pieza"
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
        >
          <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, mr: 1 }}>
            TIPO:
          </Box>
          <Button
            aria-pressed={!filtros.tipo}
            onClick={() => cambiar({ tipo: undefined })}
            sx={estiloFiltro(!filtros.tipo)}
          >
            Todos
          </Button>
          {TIPOS_PIEZA.map((tipo) => {
            const activo = filtros.tipo === tipo;
            return (
              <Button
                key={tipo}
                aria-pressed={activo}
                onClick={() => cambiar({ tipo: activo ? undefined : tipo })}
                startIcon={<IconoTipo tipo={tipo} tamano={20} />}
                sx={estiloFiltro(activo)}
              >
                {NOMBRE_TIPO[tipo].plural}
              </Button>
            );
          })}
        </Box>
        <Box
          role="group"
          aria-label="Década"
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
        >
          <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, mr: 1 }}>
            DÉCADA:
          </Box>
          {DECADAS.map((decada) => {
            const activo = filtros.decada === decada;
            return (
              <Button
                key={decada}
                aria-pressed={activo}
                onClick={() => cambiar({ decada: activo ? undefined : decada })}
                sx={{ ...estiloFiltro(activo), minWidth: 0 }}
              >
                {decada}s
              </Button>
            );
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="orden-explorar">Ordenar por</InputLabel>
            <Select
              labelId="orden-explorar"
              label="Ordenar por"
              value={filtros.orden}
              onChange={(e) => cambiar({ orden: e.target.value as OrdenPiezaPortal })}
            >
              {Object.entries(NOMBRE_ORDEN).map(([valor, nombre]) => (
                <MenuItem key={valor} value={valor}>
                  {nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hayFiltros && (
            <Button onClick={() => setParams(new URLSearchParams())} sx={{ fontWeight: 700 }}>
              Quitar filtros
            </Button>
          )}
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
            display: 'grid',
            justifyItems: 'start',
            gap: 2,
            p: { xs: 3, sm: 5 },
            bgcolor: colores.papel,
            borderTop: `8px solid ${colores.naranja}`,
            boxShadow: '8px 10px 0 #F5D79E',
          }}
        >
          <Typography variant="h2" sx={{ m: 0, fontSize: { xs: 28, sm: 36 }, fontWeight: 900 }}>
            Esta caja está vacía
          </Typography>
          <Typography sx={{ fontSize: 18, maxWidth: '60ch' }}>
            No hay piezas publicadas que coincidan con tu búsqueda. Prueba con otras palabras o
            quita algún filtro.
          </Typography>
          {hayFiltros && (
            <Button variant="contained" onClick={() => setParams(new URLSearchParams())}>
              Quitar filtros
            </Button>
          )}
        </Box>
      )}

      {!consulta.isError && !vacio && (
        <Box
          component="ul"
          aria-busy={consulta.isFetching}
          sx={{
            listStyle: 'none',
            m: 0,
            p: '12px 0 0',
            display: 'grid',
            gap: '36px 28px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            justifyItems: 'center',
            opacity: consulta.isPlaceholderData ? 0.55 : 1,
            transition: 'opacity .2s',
          }}
        >
          {consulta.isPending
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <TarjetaPiezaCargando />
                </li>
              ))
            : datos?.datos.map((pieza, i) => (
                <Box
                  component="li"
                  key={pieza.codigo}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    animation: `${caer} .6s cubic-bezier(.2, .8, .2, 1) ${Math.min(i, 8) * 0.06}s both`,
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                  }}
                >
                  <TarjetaPieza pieza={pieza} />
                </Box>
              ))}
        </Box>
      )}

      {datos && datos.meta.totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={datos.meta.totalPaginas}
            page={filtros.pagina}
            onChange={(_, pagina) => cambiar({ pagina })}
            color="primary"
            size="large"
            getItemAriaLabel={(tipo, pagina) =>
              tipo === 'page'
                ? `Página ${pagina}`
                : tipo === 'next'
                  ? 'Página siguiente'
                  : tipo === 'previous'
                    ? 'Página anterior'
                    : tipo === 'first'
                      ? 'Primera página'
                      : 'Última página'
            }
          />
        </Box>
      )}
      {datos && datos.meta.total > PIEZAS_POR_PAGINA && (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Página {datos.meta.pagina} de {datos.meta.totalPaginas}
        </Typography>
      )}
    </Stack>
  );
}
