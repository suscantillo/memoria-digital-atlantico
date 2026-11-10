import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PaginaIngresar } from '../features/auth/paginas/PaginaIngresar';
import { PaginaInicio } from '../features/portal/paginas/PaginaInicio';
import { PaginaNoEncontrada } from '../features/portal/paginas/PaginaNoEncontrada';
import { PaginaUbicacionesPanel } from '../features/ubicaciones/paginas/PaginaUbicacionesPanel';
import { PaginaUsuariosPanel } from '../features/usuarios/paginas/PaginaUsuariosPanel';
import { RutaProtegida } from '../shared/componentes/RutaProtegida';
import { LayoutPanel } from '../shared/layouts/LayoutPanel';
import { LayoutPublico } from '../shared/layouts/LayoutPublico';

export const rutas = {
  inicio: '/',
  ingresar: '/ingresar',
  panel: '/panel',
  panelUbicaciones: '/panel/ubicaciones',
  panelUsuarios: '/panel/usuarios',
} as const;

export const enrutador = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: rutas.inicio, element: <PaginaInicio /> },
      { path: rutas.ingresar, element: <PaginaIngresar /> },
    ],
  },
  {
    path: rutas.panel,
    element: (
      <RutaProtegida roles={['PERSONAL', 'ADMIN']}>
        <LayoutPanel />
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <Navigate to={rutas.panelUbicaciones} replace /> },
      { path: 'ubicaciones', element: <PaginaUbicacionesPanel /> },
      {
        path: 'usuarios',
        element: (
          <RutaProtegida roles={['ADMIN']}>
            <PaginaUsuariosPanel />
          </RutaProtegida>
        ),
      },
    ],
  },
  { path: '*', element: <PaginaNoEncontrada /> },
]);
