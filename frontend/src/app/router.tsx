import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PaginaCalidad } from '../features/calidad/paginas/PaginaCalidad';
import { PaginaEscaneos } from '../features/calidad/paginas/PaginaEscaneos';
import { PaginaCargarEscaneo } from '../features/archivos/paginas/PaginaCargarEscaneo';
import { PaginaInventario } from '../features/inventario/paginas/PaginaInventario';
import { PaginaIngresar } from '../features/auth/paginas/PaginaIngresar';
import { PaginaNuevaPieza } from '../features/piezas/paginas/PaginaNuevaPieza';
import { PaginaPrivacidad } from '../features/auth/paginas/PaginaPrivacidad';
import { PaginaRegistro } from '../features/auth/paginas/PaginaRegistro';
import { PaginaExplorar } from '../features/portal/paginas/PaginaExplorar';
import { PaginaInicio } from '../features/portal/paginas/PaginaInicio';
import { PaginaNoEncontrada } from '../features/portal/paginas/PaginaNoEncontrada';
import { PaginaPieza } from '../features/portal/paginas/PaginaPieza';
import { PaginaEscanear } from '../features/qr/paginas/PaginaEscanear';
import { PaginaUbicacionesPanel } from '../features/ubicaciones/paginas/PaginaUbicacionesPanel';
import { PaginaUsuariosPanel } from '../features/usuarios/paginas/PaginaUsuariosPanel';
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
  panelInventario: '/panel/inventario',
  panelUbicaciones: '/panel/ubicaciones',
  panelUsuarios: '/panel/usuarios',
  panelCalidad: '/panel/calidad',
  panelEscaneos: '/panel/escaneos',
  panelNuevaPieza: '/panel/piezas/nueva',
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
      // Dentro del layout público, para que quien se pierda conserve el menú.
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
      { index: true, element: <Navigate to={rutas.panelInventario} replace /> },
      { path: 'inventario', element: <PaginaInventario /> },
      { path: 'escaneo/:codigo', element: <PaginaCargarEscaneo /> },
      { path: 'calidad', element: <PaginaCalidad /> },
      { path: 'escaneos', element: <PaginaEscaneos /> },
      { path: 'ubicaciones', element: <PaginaUbicacionesPanel /> },
      { path: 'piezas/nueva', element: <PaginaNuevaPieza /> },
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
]);
