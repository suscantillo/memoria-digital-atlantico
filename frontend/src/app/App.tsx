import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthProvider';
import { clienteConsultas } from './consulta';
import { enrutador } from './router';
import { tema } from './tema';

export function App() {
  return (
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <QueryClientProvider client={clienteConsultas}>
        <AuthProvider>
          <RouterProvider router={enrutador} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
