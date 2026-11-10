import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PaginaIngresar } from '../features/auth/paginas/PaginaIngresar';
import { PaginaCalidad } from '../features/calidad/paginas/PaginaCalidad';
import { PaginaEtiquetas } from '../features/etiquetas/paginas/PaginaEtiquetas';
import { PaginaInventario } from '../features/inventario/paginas/PaginaInventario';
import { PaginaInicio } from '../features/portal/paginas/PaginaInicio';
import { PaginaNoEncontrada } from '../features/portal/paginas/PaginaNoEncontrada';
import { PaginaUbicacionesPanel } from '../features/ubicaciones/paginas/PaginaUbicacionesPanel';
import { PaginaUsuarios } from '../features/usuarios/paginas/PaginaUsuarios';
import { RutaProtegida } from '../shared/componentes/RutaProtegida';
import { LayoutPanel } from '../shared/layouts/LayoutPanel';
import { LayoutPublico } from '../shared/layouts/LayoutPublico';

export const rutas = {
  inicio: '/',
  ingresar: '/ingresar',
  panel: '/panel',
  panelInventario: '/panel/inventario',
  panelCalidad: '/panel/calidad',
  panelUbicaciones: '/panel/ubicaciones',
  panelEtiquetas: '/panel/etiquetas',
  panelUsuarios: '/panel/usuarios',
} as const;

export const enrutador = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: rutas.inicio, element: <PaginaInicio /> },
      { path: rutas.ingresar, element: <PaginaIngresar /> },
      // dentro del layout público, para que quien se pierda conserve el menú y el pie
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
      { path: 'calidad', element: <PaginaCalidad /> },
      { path: 'ubicaciones', element: <PaginaUbicacionesPanel /> },
      { path: 'etiquetas', element: <PaginaEtiquetas /> },
      {
        path: 'usuarios',
        element: (
          <RutaProtegida roles={['ADMIN']}>
            <PaginaUsuarios />
          </RutaProtegida>
        ),
      },
    ],
  },
]);
