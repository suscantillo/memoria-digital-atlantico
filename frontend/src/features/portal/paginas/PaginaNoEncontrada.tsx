import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export function PaginaNoEncontrada() {
  return (
    <Container component="main" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography sx={{ mb: 3 }}>La dirección que abriste no existe.</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Volver al inicio
      </Button>
    </Container>
  );
}
