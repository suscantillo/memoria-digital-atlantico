import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/useAuth';
import { FormularioCuentaPersonal } from '../componentes/FormularioCuentaPersonal';
import { TablaUsuarios } from '../componentes/TablaUsuarios';
import type { ParametrosListarUsuarios } from '../tipos';

const PARAMETROS_INICIALES: ParametrosListarUsuarios = {
  pagina: 1,
  limite: 10,
  orden: 'nombre',
  direccion: 'asc',
  busqueda: '',
};

export function PaginaUsuariosPanel() {
  const { usuario } = useAuth();
  const [params, setParams] = useState(PARAMETROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setParams((actuales) =>
        actuales.busqueda === busqueda ? actuales : { ...actuales, busqueda, pagina: 1 },
      );
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  return (
    <Stack spacing={3}>
      <Typography variant="h1" component="h2">
        Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Administra las cuentas que pueden operar el sistema.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2} component="section" aria-labelledby="titulo-listado-usuarios">
            <Typography id="titulo-listado-usuarios" variant="h2" component="h3">
              Cuentas del personal
            </Typography>
            <TextField
              label="Buscar"
              placeholder="Nombre o correo"
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              fullWidth
            />
            {usuario && (
              <TablaUsuarios
                params={params}
                administradorId={usuario.id}
                onCambiar={(cambios) => setParams((actuales) => ({ ...actuales, ...cambios }))}
              />
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper component="section" sx={{ p: 3 }}>
            <FormularioCuentaPersonal />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
