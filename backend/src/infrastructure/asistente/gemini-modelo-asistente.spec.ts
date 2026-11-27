import { ErrorServicioNoDisponible } from '../../domain/comun/errores';
import { ClienteGemini, GeminiModeloAsistente } from './gemini-modelo-asistente';
import { SISTEMA_RECOMENDAR } from './instrucciones-asistente';

function cliente(responder: () => Promise<{ text: string | undefined }>) {
  const generateContent = jest.fn(responder);
  return { generateContent, cliente: { models: { generateContent } } as unknown as ClienteGemini };
}

describe('GeminiModeloAsistente', () => {
  it('pide JSON con el esquema y devuelve los filtros interpretados', async () => {
    const { generateContent, cliente: gemini } = cliente(() =>
      Promise.resolve({ text: '{"palabras":["Magdalena"],"tipo":"FOTOGRAFIA","decada":1910}' }),
    );
    const modelo = new GeminiModeloAsistente(gemini, 'gemini-flash-latest');

    const filtros = await modelo.interpretar('fotos del río Magdalena en 1913');

    expect(filtros).toEqual({ palabras: ['Magdalena'], tipo: 'FOTOGRAFIA', decada: 1910 });
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-flash-latest',
        contents: 'fotos del río Magdalena en 1913',
        config: expect.objectContaining({ responseMimeType: 'application/json' }) as unknown,
      }),
    );
  });

  it('manda la pregunta y las candidatas con las reglas de recomendación', async () => {
    const { generateContent, cliente: gemini } = cliente(() =>
      Promise.resolve({
        text: '{"mensaje":"Mira esta.","codigos":["MDA-2026-0001"],"sugerencias":[]}',
      }),
    );
    const modelo = new GeminiModeloAsistente(gemini, 'gemini-flash-latest');
    const candidata = {
      codigo: 'MDA-2026-0001',
      tipo: 'FOTOGRAFIA' as const,
      titulo: 'Día de lavado en el río Magdalena',
      descripcion: null,
      anio: 1910,
    };

    const recomendacion = await modelo.recomendar('río', [candidata]);

    expect(recomendacion.codigos).toEqual(['MDA-2026-0001']);
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: JSON.stringify({ pregunta: 'río', piezas: [candidata] }),
        config: expect.objectContaining({ systemInstruction: SISTEMA_RECOMENDAR }) as unknown,
      }),
    );
  });

  it('si Gemini falla, por ejemplo con la cuota gratis agotada, el servicio no está disponible', async () => {
    const { cliente: gemini } = cliente(() => Promise.reject(new Error('429 RESOURCE_EXHAUSTED')));
    const modelo = new GeminiModeloAsistente(gemini, 'gemini-flash-latest');

    await expect(modelo.interpretar('hola')).rejects.toBeInstanceOf(ErrorServicioNoDisponible);
  });

  it('una respuesta vacía o que no es JSON tampoco llega al visitante', async () => {
    const vacia = new GeminiModeloAsistente(
      cliente(() => Promise.resolve({ text: undefined })).cliente,
      'gemini-flash-latest',
    );
    const rota = new GeminiModeloAsistente(
      cliente(() => Promise.resolve({ text: 'no es json' })).cliente,
      'gemini-flash-latest',
    );

    await expect(vacia.interpretar('hola')).rejects.toBeInstanceOf(ErrorServicioNoDisponible);
    await expect(rota.interpretar('hola')).rejects.toBeInstanceOf(ErrorServicioNoDisponible);
  });
});
