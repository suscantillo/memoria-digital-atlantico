import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type CredencialesIngreso } from '../../features/auth/api';
import type { Usuario } from '../tipos/usuario';
import { almacenSesion, EVENTO_SESION_EXPIRADA } from './almacen-sesion';
import { ContextoAuth, type ValorAuth } from './contexto';

export function AuthProvider({ children }: { children: ReactNode }) {
  const clienteConsultas = useQueryClient();
  const [usuario, setUsuario] = useState<Usuario | null>(
    () => almacenSesion.leer()?.usuario ?? null,
  );
  const [cargando, setCargando] = useState<boolean>(() => almacenSesion.leer() !== null);

  // valida la sesión guardada al cargar
  useEffect(() => {
    const sesion = almacenSesion.leer();
    if (!sesion) {
      setCargando(false);
      return;
    }
    let activo = true;
    authApi
      .yo()
      .then((actual) => {
        if (!activo) return;
        almacenSesion.guardar({ ...sesion, usuario: actual });
        setUsuario(actual);
      })
      .catch(() => {
        if (!activo) return;
        almacenSesion.limpiar();
        setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const manejar = () => {
      setUsuario(null);
      clienteConsultas.clear();
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, manejar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, manejar);
  }, [clienteConsultas]);

  const ingresar = useCallback(async (credenciales: CredencialesIngreso) => {
    const sesion = await authApi.ingresar(credenciales);
    almacenSesion.guardar(sesion);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const salir = useCallback(async () => {
    const sesion = almacenSesion.leer();
    almacenSesion.limpiar();
    setUsuario(null);
    clienteConsultas.clear();
    if (sesion?.tokenRefresco) {
      await authApi.salir(sesion.tokenRefresco).catch(() => undefined);
    }
  }, [clienteConsultas]);

  const valor = useMemo<ValorAuth>(
    () => ({ usuario, cargando, ingresar, salir }),
    [usuario, cargando, ingresar, salir],
  );

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}
