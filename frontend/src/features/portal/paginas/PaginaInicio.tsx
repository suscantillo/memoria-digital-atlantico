import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';

export function PaginaInicio() {
  const { state } = useLocation() as { state?: { sinPermiso?: boolean } };

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
    </Stack>
  );
}
