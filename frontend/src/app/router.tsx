import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PaginaIngresar } from '../features/auth/paginas/PaginaIngresar';
import { PaginaMiCuenta } from '../features/auth/paginas/PaginaMiCuenta';
import { PaginaPrivacidad } from '../features/auth/paginas/PaginaPrivacidad';
import { PaginaRegistro } from '../features/auth/paginas/PaginaRegistro';
import { PaginaCalidad } from '../features/calidad/paginas/PaginaCalidad';
import { PaginaEtiquetas } from '../features/etiquetas/paginas/PaginaEtiquetas';
import { PaginaInventario } from '../features/inventario/paginas/PaginaInventario';
import { PaginaExplorar } from '../features/portal/paginas/PaginaExplorar';
import { PaginaInicio } from '../features/portal/paginas/PaginaInicio';
import { PaginaPieza } from '../features/portal/paginas/PaginaPieza';
import { PaginaNoEncontrada } from '../features/portal/paginas/PaginaNoEncontrada';
import { PaginaEscanear } from '../features/qr/paginas/PaginaEscanear';
import { PaginaUbicacionesPanel } from '../features/ubicaciones/paginas/PaginaUbicacionesPanel';
import { PaginaUsuarios } from '../features/usuarios/paginas/PaginaUsuarios';
import { RutaProtegida } from '../shared/componentes/RutaProtegida';
import { LayoutPanel } from '../shared/layouts/LayoutPanel';
import { LayoutPublico } from '../shared/layouts/LayoutPublico';

export const rutas = {
  inicio: '/',
  ingresar: '/ingresar',
  registro: '/registro',
  privacidad: '/privacidad',
  miCuenta: '/mi-cuenta',
  explorar: '/explorar',
  escanear: '/escanear',
  pieza: '/p/:codigo',
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
      { path: rutas.registro, element: <PaginaRegistro /> },
      { path: rutas.privacidad, element: <PaginaPrivacidad /> },
      {
        path: rutas.miCuenta,
        element: (
          <RutaProtegida>
            <PaginaMiCuenta />
          </RutaProtegida>
        ),
      },
      { path: rutas.explorar, element: <PaginaExplorar /> },
      { path: rutas.escanear, element: <PaginaEscanear /> },
      { path: rutas.pieza, element: <PaginaPieza /> },
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
