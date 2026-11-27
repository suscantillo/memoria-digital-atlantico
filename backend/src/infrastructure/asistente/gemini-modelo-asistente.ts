import { GoogleGenAI } from '@google/genai';
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

export type ClienteGemini = { models: Pick<GoogleGenAI['models'], 'generateContent'> };

export class GeminiModeloAsistente implements ModeloAsistente {
  constructor(
    private readonly cliente: ClienteGemini,
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
    let texto: string | undefined;
    try {
      const respuesta = await this.cliente.models.generateContent({
        model: this.modelo,
        contents: contenido,
        config: {
          systemInstruction: sistema,
          responseMimeType: 'application/json',
          responseJsonSchema: esquema,
        },
      });
      texto = respuesta.text;
    } catch {
      // Cuota gratis agotada, clave inválida o sin red: el portal sigue con su modo búsqueda.
      throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    }

    if (!texto) throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    try {
      return JSON.parse(texto) as T;
    } catch {
      throw new ErrorServicioNoDisponible(NO_DISPONIBLE);
    }
  }
}
