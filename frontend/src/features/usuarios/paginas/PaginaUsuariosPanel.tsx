import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/useAuth';
import { FormularioCuentaPersonal } from '../componentes/FormularioCuentaPersonal';
import { TablaCuentasPublicas } from '../componentes/TablaCuentasPublicas';
import { TablaUsuarios } from '../componentes/TablaUsuarios';
import type { ParametrosListarUsuarios } from '../tipos';

const PARAMETROS_INICIALES: ParametrosListarUsuarios = {
  pagina: 1,
  limite: 10,
  orden: 'nombre',
  direccion: 'asc',
  busqueda: '',
};

type Pestana = 'personal' | 'portal';

/** Buscador con espera: no pide la lista en cada tecla. */
function useBusqueda() {
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

  return { params, setParams, busqueda, setBusqueda };
}

function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (valor: string) => void }) {
  return (
    <TextField
      label="Buscar"
      placeholder="Nombre o correo"
      type="search"
      value={valor}
      onChange={(evento) => onCambiar(evento.target.value)}
      fullWidth
    />
  );
}

/** Usuarios: «Cuentas del personal» (HU-17) y «Cuentas del portal» (las PUBLICO). */
export function PaginaUsuariosPanel() {
  const { usuario } = useAuth();
  const [url, setUrl] = useSearchParams();
  const pestana: Pestana = url.get('pestana') === 'portal' ? 'portal' : 'personal';
  const personal = useBusqueda();
  const portal = useBusqueda();

  return (
    <Stack spacing={3}>
      <Typography variant="h1" component="h2">
        Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Administra las cuentas que operan el sistema y las de quienes se registran en el portal.
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={pestana}
          onChange={(_evento, nueva: Pestana) =>
            setUrl(nueva === 'portal' ? { pestana: 'portal' } : {}, { replace: true })
          }
          aria-label="Tipo de cuenta"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 16 } }}
        >
          <Tab
            value="personal"
            label="Cuentas del personal"
            id="pestana-personal"
            aria-controls="panel-personal"
          />
          <Tab
            value="portal"
            label="Cuentas del portal"
            id="pestana-portal"
            aria-controls="panel-portal"
          />
        </Tabs>
      </Box>

      {pestana === 'personal' ? (
        <Grid
          container
          spacing={3}
          role="tabpanel"
          id="panel-personal"
          aria-labelledby="pestana-personal"
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2} component="section" aria-labelledby="titulo-listado-usuarios">
              <Typography id="titulo-listado-usuarios" variant="h2" component="h3">
                Cuentas del personal
              </Typography>
              <Buscador valor={personal.busqueda} onCambiar={personal.setBusqueda} />
              {usuario && (
                <TablaUsuarios
                  params={personal.params}
                  administradorId={usuario.id}
                  onCambiar={(cambios) =>
                    personal.setParams((actuales) => ({ ...actuales, ...cambios }))
                  }
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
      ) : (
        <Stack
          spacing={2}
          component="section"
          role="tabpanel"
          id="panel-portal"
          aria-labelledby="pestana-portal"
        >
          <Typography variant="body2" color="text.secondary">
            Visitantes que crearon cuenta en el portal para leer los documentos. Una cuenta
            desactivada no puede iniciar sesión; sus datos se conservan.
          </Typography>
          <Buscador valor={portal.busqueda} onCambiar={portal.setBusqueda} />
          <TablaCuentasPublicas
            params={portal.params}
            onCambiar={(cambios) => portal.setParams((actuales) => ({ ...actuales, ...cambios }))}
          />
        </Stack>
      )}
    </Stack>
  );
}
