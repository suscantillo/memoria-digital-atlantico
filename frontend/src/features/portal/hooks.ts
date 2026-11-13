import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { portalApi } from './api';
import type { ParametrosBuscarPiezas } from './tipos';

export const clavesPortal = {
  todas: ['portal', 'piezas'] as const,
  busqueda: (params: ParametrosBuscarPiezas) => ['portal', 'piezas', params] as const,
  ficha: (codigo: string) => ['portal', 'pieza', codigo] as const,
};

export function usePiezasPortal(params: ParametrosBuscarPiezas) {
  return useQuery({
    queryKey: clavesPortal.busqueda(params),
    queryFn: () => portalApi.buscar(params),
    placeholderData: keepPreviousData,
  });
}

/** Cuántas piezas publicadas hay para cada filtro; pide una sola fila y lee meta.total. */
export function useTotalesPortal(filtros: ParametrosBuscarPiezas[]) {
  return useQueries({
    queries: filtros.map((filtro) => {
      const params = { ...filtro, limite: 1 };
      return {
        queryKey: clavesPortal.busqueda(params),
        queryFn: () => portalApi.buscar(params),
        select: (r: Awaited<ReturnType<typeof portalApi.buscar>>) => r.meta.total,
        staleTime: 60_000,
      };
    }),
  });
}

export function usePiezaPortal(codigo: string, habilitada: boolean) {
  return useQuery({
    queryKey: clavesPortal.ficha(codigo),
    queryFn: () => portalApi.obtener(codigo),
    enabled: habilitada,
    // un 404 no se arregla reintentando
    retry: false,
  });
}

/** El PDF de la ficha, traído con la sesión y listo para ponerlo en la página. */
export function usePdfConSesion(url: string, conSesion: boolean) {
  const consulta = useQuery({
    queryKey: ['portal', 'contenido', url],
    queryFn: () => portalApi.contenido(url),
    enabled: conSesion,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const [enlace, setEnlace] = useState<string | null>(null);

  useEffect(() => {
    if (!consulta.data) return;
    const creado = URL.createObjectURL(consulta.data);
    setEnlace(creado);
    return () => {
      URL.revokeObjectURL(creado);
      setEnlace(null);
    };
  }, [consulta.data]);

  return { enlace, cargando: conSesion && consulta.isPending, fallo: consulta.isError };
}
