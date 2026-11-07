import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { almacenSesion } from '../auth/almacen-sesion';
import type { SesionIniciada } from '../tipos/usuario';

export const BASE_API = '/api/v1';
const RUTAS_AUTH_SIN_REINTENTO = ['/auth/ingresar', '/auth/refrescar', '/auth/salir'];

export const clienteApi = axios.create({
  baseURL: BASE_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

interface ConfigConReintento extends InternalAxiosRequestConfig {
  _reintentada?: boolean;
}

clienteApi.interceptors.request.use((config) => {
  const sesion = almacenSesion.leer();
  if (sesion?.tokenAcceso) {
    config.headers.Authorization = `Bearer ${sesion.tokenAcceso}`;
  }
  return config;
});

// una sola renovación a la vez
let renovacionEnCurso: Promise<SesionIniciada> | null = null;

async function renovarSesion(): Promise<SesionIniciada> {
  const sesion = almacenSesion.leer();
  if (!sesion?.tokenRefresco) {
    throw new Error('No hay token de refresco.');
  }
  // sin interceptores para no entrar en bucle
  const respuesta = await axios.post<SesionIniciada>(
    `${BASE_API}/auth/refrescar`,
    { tokenRefresco: sesion.tokenRefresco },
    { headers: { 'Content-Type': 'application/json' } },
  );
  almacenSesion.guardar(respuesta.data);
  return respuesta.data;
}

// 401: refrescar una vez y reintentar
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const config = error.config as ConfigConReintento | undefined;
    const esAuth = RUTAS_AUTH_SIN_REINTENTO.some((ruta) => config?.url?.startsWith(ruta));

    if (error.response?.status !== 401 || !config || config._reintentada || esAuth) {
      return Promise.reject(error);
    }
    if (!almacenSesion.leer()?.tokenRefresco) {
      return Promise.reject(error);
    }

    config._reintentada = true;
    try {
      renovacionEnCurso ??= renovarSesion().finally(() => {
        renovacionEnCurso = null;
      });
      const nueva = await renovacionEnCurso;
      config.headers.Authorization = `Bearer ${nueva.tokenAcceso}`;
      return clienteApi.request(config as AxiosRequestConfig);
    } catch {
      almacenSesion.notificarExpiracion();
      return Promise.reject(error);
    }
  },
);
