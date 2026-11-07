import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { FormularioUbicacion } from '../componentes/FormularioUbicacion';
import { TablaUbicaciones } from '../componentes/TablaUbicaciones';
import type { ParametrosListarUbicaciones } from '../tipos';

const PARAMS_INICIALES: ParametrosListarUbicaciones = {
  pagina: 1,
  limite: 10,
  orden: 'deposito',
  direccion: 'asc',
  busqueda: '',
};

export function PaginaUbicacionesPanel() {
  const [params, setParams] = useState<ParametrosListarUbicaciones>(PARAMS_INICIALES);
  const [busqueda, setBusqueda] = useState('');

  // debounce de la búsqueda
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setParams((p) => (p.busqueda === busqueda ? p : { ...p, busqueda, pagina: 1 }));
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  return (
    <Stack spacing={3}>
      <Typography variant="h1" component="h2">
        Ubicaciones
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Depósito, estantería y caja donde se guarda cada pieza. La terna es única.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2} component="section" aria-labelledby="titulo-listado">
            <Typography id="titulo-listado" variant="h2" component="h3">
              Listado
            </Typography>
            <TextField
              id="buscar-ubicaciones"
              label="Buscar"
              placeholder="Depósito, estantería, caja o descripción"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              type="search"
              fullWidth
            />
            <TablaUbicaciones
              params={params}
              onCambiar={(cambios) => setParams((p) => ({ ...p, ...cambios }))}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper component="section" sx={{ p: 3 }}>
            <FormularioUbicacion />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
