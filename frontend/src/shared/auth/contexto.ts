import { createContext } from 'react';
import type { CredencialesIngreso } from '../../features/auth/api';
import type { Usuario } from '../tipos/usuario';

export interface ValorAuth {
  usuario: Usuario | null;
  cargando: boolean;
  ingresar: (credenciales: CredencialesIngreso) => Promise<Usuario>;
  salir: () => Promise<void>;
}

export const ContextoAuth = createContext<ValorAuth | undefined>(undefined);
