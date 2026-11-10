import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { TarjetaResultado } from '../componentes/TarjetaResultado';
import { useBusquedaPortal } from '../hooks';
import { NOMBRE_TIPO, type ParametrosBuscarPiezas, type TipoPieza } from '../tipos';

const POR_PAGINA = 12;
const TIPOS = Object.keys(NOMBRE_TIPO) as TipoPieza[];
const DECADA_ACTUAL = Math.floor(new Date().getFullYear() / 10) * 10;
const DECADAS = Array.from(
  { length: (DECADA_ACTUAL - 1850) / 10 + 1 },
  (_, i) => DECADA_ACTUAL - i * 10,
);

const estiloPildora = (activa: boolean) =>
  ({
    px: 2,
    minHeight: 40,
    borderRadius: 999,
    fontWeight: 700,
    color: activa ? '#FFFFFF' : colores.azulMarino,
    bgcolor: activa ? colores.azulMarino : '#FFFFFF',
    boxShadow: activa ? 'none' : '0 4px 0 #F5D79E',
    '&:hover': { bgcolor: activa ? colores.azulMedio : '#FFF8EA' },
  }) as const;

function leerParametros(url: URLSearchParams): ParametrosBuscarPiezas {
  const tipo = url.get('tipo');
  const decada = Number(url.get('decada'));
  const pagina = Number(url.get('pagina'));
  return {
    q: url.get('q') ?? '',
    tipo: TIPOS.includes(tipo as TipoPieza) ? (tipo as TipoPieza) : undefined,
    decada: DECADAS.includes(decada) ? decada : undefined,
    ubicacionId: url.get('ubicacion') ?? undefined,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    limite: POR_PAGINA,
  };
}

/** Caja de cartón abierta y vacía: el estado sin resultados que pide la historia. */
function CajaVacia({ onQuitarFiltros }: { onQuitarFiltros: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: { xs: 5, md: 8 },
      }}
    >
      <Box aria-hidden sx={{ position: 'relative', width: 150, height: 110, mb: 1 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: '30px 0 0',
            bgcolor: '#C9A46A',
            borderRadius: '4px',
            boxShadow: 'inset 0 -10px 0 rgba(0,0,0,.08)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: -6,
            top: 8,
            width: 70,
            height: 30,
            bgcolor: '#D8B57C',
            transformOrigin: 'right bottom',
            rotate: '-24deg',
            borderRadius: '3px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: -6,
            top: 8,
            width: 70,
            height: 30,
            bgcolor: '#D8B57C',
            transformOrigin: 'left bottom',
            rotate: '24deg',
            borderRadius: '3px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 58,
            translate: '-50% 0',
            px: 1,
            py: 0.25,
            bgcolor: colores.papel,
            fontFamily: '"Courier New", ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 12,
            whiteSpace: 'nowrap',
            color: colores.azulMarino,
          }}
        >
          MDA-····-····
        </Box>
      </Box>
      <Typography component="h2" variant="h2" sx={{ fontWeight: 900 }}>
        Esta caja está vacía
      </Typography>
      <Typography sx={{ maxWidth: 420, color: 'text.secondary' }}>
        Ninguna pieza publicada coincide con la búsqueda. Prueba con otra palabra o quita los
        filtros.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={onQuitarFiltros}
        sx={{ mt: 1, borderRadius: 999, px: 3, fontWeight: 800 }}
      >
        Quitar filtros
      </Button>
    </Box>
  );
}

function FormularioBusqueda({
  inicial,
  onBuscar,
}: {
  inicial: string;
  onBuscar: (q: string) => void;
}) {
  const [texto, setTexto] = useState(inicial);
  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    onBuscar(texto.trim());
  };

  return (
    <Box
      component="form"
      role="search"
      onSubmit={buscar}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        maxWidth: 680,
        bgcolor: '#FFFFFF',
        borderRadius: 999,
        p: '6px 6px 6px 18px',
        boxShadow: '0 8px 0 #F5D79E',
        '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
      }}
    >
      <SearchIcon aria-hidden sx={{ color: colores.azulMarino }} />
      <InputBase
        type="search"
        placeholder="Carnaval, puerto, aduana…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        inputProps={{ 'aria-label': 'Buscar en el archivo' }}
        sx={{ flex: 1, minWidth: 0, height: 48, fontSize: { xs: 16, md: 18 } }}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        sx={{ minHeight: 48, px: { xs: 2, sm: 3 }, borderRadius: 999, fontWeight: 800 }}
      >
        Buscar
      </Button>
    </Box>
  );
}

export function PaginaExplorar() {
  const [url, setUrl] = useSearchParams();
  const params = leerParametros(url);
  const consulta = useBusquedaPortal(params);
  const hayFiltros = Boolean(params.q || params.tipo || params.decada || params.ubicacionId);

  // cada cambio de filtro vuelve a la página 1; la búsqueda queda en la dirección para compartirla
  const cambiar = (cambios: Record<string, string | undefined>, pagina = 1) => {
    const siguiente = new URLSearchParams(url);
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) siguiente.set(clave, valor);
      else siguiente.delete(clave);
    }
    if (pagina > 1) siguiente.set('pagina', String(pagina));
    else siguiente.delete('pagina');
    setUrl(siguiente);
  };

  const quitarFiltros = () => setUrl(new URLSearchParams());

  const meta = consulta.data?.meta;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography
          variant="h1"
          sx={{ m: 0, fontSize: { xs: 36, md: 52 }, letterSpacing: '-0.025em' }}
        >
          Explorar el{' '}
          <Box component="span" sx={{ color: colores.naranja }}>
            archivo
          </Box>
        </Typography>
        <Typography sx={{ mt: 1, fontSize: { xs: 16, md: 18 }, maxWidth: 560 }}>
          Busca entre las piezas ya publicadas por palabra, tipo o década.
        </Typography>
      </Box>

      <FormularioBusqueda
        // al volver atrás en el navegador el campo toma el texto de la dirección
        key={params.q}
        inicial={params.q ?? ''}
        onBuscar={(q) => cambiar({ q: q || undefined })}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Box
          role="group"
          aria-label="Tipo de pieza"
          // en el celular los tipos van en una sola fila que se desliza, sin partir en dos
          sx={{
            display: 'flex',
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            gap: 1,
            maxWidth: '100%',
            overflowX: { xs: 'auto', sm: 'visible' },
            pb: { xs: 0.75, sm: 0 },
            '& > *': { flex: 'none' },
          }}
        >
          <Button
            aria-pressed={!params.tipo}
            onClick={() => cambiar({ tipo: undefined })}
            sx={estiloPildora(!params.tipo)}
          >
            Todo
          </Button>
          {TIPOS.map((tipo) => (
            <Button
              key={tipo}
              aria-pressed={params.tipo === tipo}
              onClick={() => cambiar({ tipo })}
              sx={estiloPildora(params.tipo === tipo)}
            >
              {NOMBRE_TIPO[tipo]}
            </Button>
          ))}
        </Box>
        <TextField
          select
          size="small"
          label="Década"
          value={params.decada ?? ''}
          onChange={(e) => cambiar({ decada: e.target.value || undefined })}
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 999 },
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {DECADAS.map((d) => (
            <MenuItem key={d} value={d}>
              {d}s
            </MenuItem>
          ))}
        </TextField>
        {params.ubicacionId && (
          <Button
            onClick={() => cambiar({ ubicacion: undefined })}
            endIcon={<CloseIcon />}
            aria-label="Quitar el filtro de caja"
            sx={{ ...estiloPildora(true), bgcolor: colores.amarillo, color: colores.azulMarino }}
          >
            De la misma caja
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 28 }}>
        <Typography role="status" aria-live="polite" sx={{ fontWeight: 700 }}>
          {meta && (meta.total === 1 ? '1 pieza encontrada' : `${meta.total} piezas encontradas`)}
        </Typography>
        {consulta.isFetching && <CircularProgress size={18} aria-label="Buscando" />}
        {hayFiltros && meta && meta.total > 0 && (
          <Button size="small" onClick={quitarFiltros} sx={{ ml: 'auto', fontWeight: 700 }}>
            Quitar filtros
          </Button>
        )}
      </Box>

      {consulta.isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Cargando las piezas" />
        </Box>
      )}
      {consulta.isError && (
        <MensajeError error={consulta.error} titulo="No se pudo buscar en el archivo" />
      )}

      {consulta.data && consulta.data.datos.length === 0 && (
        <CajaVacia onQuitarFiltros={quitarFiltros} />
      )}

      {consulta.data && consulta.data.datos.length > 0 && (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.5, md: 2.5 },
            opacity: consulta.isPlaceholderData ? 0.6 : 1,
            transition: 'opacity .2s',
          }}
        >
          {consulta.data.datos.map((pieza) => (
            <li key={pieza.codigo}>
              <TarjetaResultado pieza={pieza} />
            </li>
          ))}
        </Box>
      )}

      {meta && meta.totalPaginas > 1 && (
        <Pagination
          page={meta.pagina}
          count={meta.totalPaginas}
          onChange={(_, pagina) => {
            cambiar({}, pagina);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          color="primary"
          shape="rounded"
          sx={{ alignSelf: 'center', '& .MuiPaginationItem-root': { fontWeight: 700 } }}
          getItemAriaLabel={(tipo, pagina, seleccionada) =>
            tipo === 'page'
              ? `${seleccionada ? 'Página actual, ' : 'Ir a la página '}${pagina}`
              : tipo === 'next'
                ? 'Página siguiente'
                : tipo === 'previous'
                  ? 'Página anterior'
                  : tipo === 'first'
                    ? 'Primera página'
                    : 'Última página'
          }
        />
      )}
    </Box>
  );
}
