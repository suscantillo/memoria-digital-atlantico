import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { RolUsuario } from '../tipos/usuario';

interface Props {
  roles?: RolUsuario[];
  children: ReactNode;
}

export function RutaProtegida({ roles, children }: Props) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress aria-label="Comprobando sesión" />
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace state={{ sinPermiso: true }} />;
  }

  return <>{children}</>;
}
