import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PaginaIngresar } from '../features/auth/paginas/PaginaIngresar';
import { PaginaPrivacidad } from '../features/auth/paginas/PaginaPrivacidad';
import { PaginaRegistro } from '../features/auth/paginas/PaginaRegistro';
import { PaginaExplorar } from '../features/portal/paginas/PaginaExplorar';
import { PaginaInicio } from '../features/portal/paginas/PaginaInicio';
import { PaginaNoEncontrada } from '../features/portal/paginas/PaginaNoEncontrada';
import { PaginaPieza } from '../features/portal/paginas/PaginaPieza';
import { PaginaEscanear } from '../features/qr/paginas/PaginaEscanear';
import { PaginaUbicacionesPanel } from '../features/ubicaciones/paginas/PaginaUbicacionesPanel';
import { RutaProtegida } from '../shared/componentes/RutaProtegida';
import { LayoutPanel } from '../shared/layouts/LayoutPanel';
import { LayoutPublico } from '../shared/layouts/LayoutPublico';

export const rutas = {
  inicio: '/',
  explorar: '/explorar',
  pieza: '/p/:codigo',
  escanear: '/escanear',
  ingresar: '/ingresar',
  registro: '/registro',
  privacidad: '/privacidad',
  panel: '/panel',
  panelUbicaciones: '/panel/ubicaciones',
} as const;

export const enrutador = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: rutas.inicio, element: <PaginaInicio /> },
      { path: rutas.explorar, element: <PaginaExplorar /> },
      { path: rutas.pieza, element: <PaginaPieza /> },
      { path: rutas.escanear, element: <PaginaEscanear /> },
      { path: rutas.ingresar, element: <PaginaIngresar /> },
      { path: rutas.registro, element: <PaginaRegistro /> },
      { path: rutas.privacidad, element: <PaginaPrivacidad /> },
      // dentro del layout público, para que quien se pierda conserve el menú
      { path: '*', element: <PaginaNoEncontrada /> },
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
    ],
  },
]);
