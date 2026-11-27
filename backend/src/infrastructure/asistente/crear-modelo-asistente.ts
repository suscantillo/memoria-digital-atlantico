import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { ModeloAsistente } from '../../application/asistente/puertos';
import { ClaudeModeloAsistente } from './claude-modelo-asistente';
import { GeminiModeloAsistente } from './gemini-modelo-asistente';

export const PROVEEDORES_ASISTENTE = ['gemini', 'anthropic'] as const;

export type ProveedorAsistente = (typeof PROVEEDORES_ASISTENTE)[number];

export interface ConfiguracionAsistente {
  proveedor: ProveedorAsistente;
  geminiApiKey: string;
  anthropicApiKey: string;
  /** Vacío: el modelo por defecto del proveedor. */
  modelo: string;
}

const MODELO_POR_DEFECTO: Record<ProveedorAsistente, string> = {
  gemini: 'gemini-flash-latest',
  anthropic: 'claude-opus-5-5',
};

// Por debajo de los 30 s que espera el portal, para que alcance a pasar a su modo búsqueda.
const TIEMPO_MAXIMO_MS = 25_000;

/** Sin la clave del proveedor elegido no hay modelo: el asistente responde 503. */
export function crearModeloAsistente(config: ConfiguracionAsistente): ModeloAsistente | null {
  const modelo = config.modelo || MODELO_POR_DEFECTO[config.proveedor];

  if (config.proveedor === 'gemini') {
    if (!config.geminiApiKey) return null;
    const cliente = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      // sin reintentos: con la cuota gratis agotada, reintentar solo hace esperar más al visitante
      httpOptions: { timeout: TIEMPO_MAXIMO_MS, retryOptions: { attempts: 1 } },
    });
    return new GeminiModeloAsistente(cliente, modelo);
  }

  if (!config.anthropicApiKey) return null;
  const cliente = new Anthropic({
    apiKey: config.anthropicApiKey,
    timeout: TIEMPO_MAXIMO_MS,
    maxRetries: 1,
  });
  return new ClaudeModeloAsistente(cliente, modelo);
}
