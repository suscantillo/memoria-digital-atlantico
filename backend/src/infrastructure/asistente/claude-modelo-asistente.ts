import Anthropic from '@anthropic-ai/sdk';
import {
  FiltrosInterpretados,
  ModeloAsistente,
  PiezaCandidata,
  Recomendacion,
} from '../../application/asistente/puertos';
import { ErrorServicioNoDisponible } from '../../domain/comun/errores';
import {
  ESQUEMA_FILTROS,
  ESQUEMA_RECOMENDACION,
  NO_DISPONIBLE,
  SISTEMA_INTERPRETAR,
  SISTEMA_RECOMENDAR,
} from './instrucciones-asistente';

// Modelos que aceptan `fallbacks: 'default'`: con otro modelo configurado se envía la petición sin él.
const MODELOS_CON_RESPALDO = new Set(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2']);

export class ClaudeModeloAsistente implements ModeloAsistente {
  constructor(
    private readonly cliente: Anthropic,
    private readonly modelo: string,
  ) {}

  interpretar(pregunta: string): Promise<FiltrosInterpretados> {
    return this.pedirJson<FiltrosInterpretados>(SISTEMA_INTERPRETAR, ESQUEMA_FILTROS, pregunta);
  }

  recomendar(pregunta: string, candidatas: PiezaCandidata[]): Promise<Recomendacion> {
    const contenido = JSON.stringify({ pregunta, piezas: candidatas });
    return this.pedirJson<Recomendacion>(SISTEMA_RECOMENDAR, ESQUEMA_RECOMENDACION, contenido);
  }

  private async pedirJson<T>(
    sistema: string,
    esquema: Record<string, unknown>,
    contenido: string,
  ): Promise<T> {
    let respuesta: Anthropic.Beta.BetaMessage;
    try {
      respuesta = await this.cliente.beta.messages.create({
        model: this.modelo,
        max_tokens: 4000,
        system: sistema,
        messages: [{ role: 'user', content: contenido }],
        // Respuestas cortas a un visitante que espera: poco razonamiento basta.
        output_config: { effort: 'low', format: { type: 'json_schema', schema: esquema } },
        ...(MODELOS_CON_RESPALDO.has(this.modelo)
          ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
          : {}),
      });
    } catch (error) {
      // Sin red, sin cupo o con la clave mal puesta, el portal sigue con su modo búsqueda.
      if (error instanceof Anthropic.APIError) throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
      throw error;
    }

    if (respuesta.stop_reason !== 'end_turn') throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    const texto = respuesta.content.find((bloque) => bloque.type === 'text');
    if (!texto) throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    try {
      return JSON.parse(texto.text) as T;
    } catch {
      throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    }
  }
}
