import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useUbicaciones } from '../../ubicaciones/hooks';

export function PaginaInicio() {
  const { state } = useLocation() as { state?: { sinPermiso?: boolean } };
  const consulta = useUbicaciones({ pagina: 1, limite: 20, orden: 'deposito', direccion: 'asc' });

  return (
    <Stack spacing={3}>
      {state?.sinPermiso && (
        <Alert severity="warning" role="alert">
          Tu cuenta no tiene permiso para entrar al panel.
        </Alert>
      )}

      <Box component="section" aria-labelledby="titulo-portada">
        <Typography id="titulo-portada" variant="h1" gutterBottom>
          Memoria Digital del Atlántico
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 720 }}>
          Inventario y consulta del Archivo Histórico del Atlántico: documentos, fotografías y
          periódicos con su ubicación física, su escaneo revisado y su historial.
        </Typography>
      </Box>

      <Box component="section" aria-labelledby="titulo-ubicaciones">
        <Typography id="titulo-ubicaciones" variant="h2" gutterBottom>
          Ubicaciones del archivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Listado de prueba de conexión con la API. El buscador público de piezas llegará en la
          siguiente iteración.
        </Typography>

        {consulta.isPending && (
          <Box role="status" aria-live="polite">
            <CircularProgress aria-label="Cargando ubicaciones" />
          </Box>
        )}
        {consulta.isError && <MensajeError error={consulta.error} titulo="No se pudo cargar" />}
        {consulta.isSuccess && (
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            }}
          >
            {consulta.data.datos.map((u) => (
              <Card component="li" key={u.id} variant="outlined">
                <CardContent>
                  <Typography variant="h3" component="h3" gutterBottom>
                    {u.deposito}
                  </Typography>
                  <Typography variant="body2">
                    {u.estanteria} · {u.caja}
                  </Typography>
                  {u.descripcion && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {u.descripcion}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
        {consulta.isSuccess && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {consulta.data.meta.total} ubicaciones registradas.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
