import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { colores } from '../../../app/tema';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { DialogoNuevaUbicacion } from '../componentes/DialogoNuevaUbicacion';
import { TablaUbicaciones } from '../componentes/TablaUbicaciones';
import { useUbicaciones } from '../hooks';
import type { ParametrosListarUbicaciones } from '../tipos';

const PARAMS_INICIALES: ParametrosListarUbicaciones = {
  pagina: 1,
  limite: 10,
  orden: 'deposito',
  direccion: 'asc',
  busqueda: '',
};

// en sx, width: 1 sería el 100 %; el texto oculto necesita medir un píxel de verdad
const soloLectores = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

export function PaginaUbicacionesPanel() {
  const [params, setParams] = useState<ParametrosListarUbicaciones>(PARAMS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // misma clave que la tabla: TanStack Query reutiliza la respuesta y no hace otra petición
  const consulta = useUbicaciones(params);

  // debounce de la búsqueda
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setParams((p) => (p.busqueda === busqueda ? p : { ...p, busqueda, pagina: 1 }));
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  return (
    <Stack spacing={3.5}>
      <EncabezadoPanel
        titulo="Ubicaciones"
        descripcion="Depósito, estantería y caja donde se guarda cada pieza. La terna es única."
        accion={
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreando(true)}
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.5,
              fontSize: 17,
              fontWeight: 800,
              boxShadow: `0 6px 0 ${colores.azulMarino}`,
            }}
          >
            Nueva ubicación
          </Button>
        }
      />

      <Box
        sx={{
          alignSelf: 'flex-start',
          px: 2.5,
          py: 1.75,
          borderRadius: 4,
          bgcolor: colores.papel,
          boxShadow: '0 6px 0 #F5D79E',
        }}
      >
        <Typography
          sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 44, lineHeight: 1 }}
        >
          {consulta.data?.meta.total ?? '–'}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          {params.busqueda ? 'ubicaciones encontradas' : 'ubicaciones registradas'}
        </Typography>
      </Box>

      <Stack spacing={2.5} component="section" aria-labelledby="titulo-listado">
        <Typography
          id="titulo-listado"
          variant="h2"
          sx={{
            fontFamily: FUENTE_FICHA,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Listado
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2.25,
            bgcolor: '#FFFFFF',
            borderRadius: 999,
            boxShadow: '0 6px 0 #F5D79E',
            '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
          }}
        >
          <SearchIcon aria-hidden sx={{ color: colores.azulMarino }} />
          <Box component="label" htmlFor="buscar-ubicaciones" sx={soloLectores}>
            Buscar ubicaciones
          </Box>
          <InputBase
            id="buscar-ubicaciones"
            type="search"
            placeholder="Buscar por depósito, estantería, caja o descripción…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ flex: 1, minWidth: 0, height: 52, fontSize: 17 }}
          />
        </Box>
        <TablaUbicaciones
          params={params}
          onCambiar={(cambios) => setParams((p) => ({ ...p, ...cambios }))}
        />
      </Stack>

      <DialogoNuevaUbicacion
        abierto={creando}
        onCerrar={() => setCreando(false)}
        onCreada={(ubicacion) => {
          setCreando(false);
          setAviso(`Ubicación «${ubicacion.etiqueta}» registrada.`);
        }}
      />
      <Snackbar
        open={aviso !== null}
        autoHideDuration={5000}
        onClose={() => setAviso(null)}
        message={aviso}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
