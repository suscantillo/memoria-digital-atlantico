import { ClaudeModeloAsistente } from './claude-modelo-asistente';
import { ConfiguracionAsistente, crearModeloAsistente } from './crear-modelo-asistente';
import { GeminiModeloAsistente } from './gemini-modelo-asistente';

function config(parcial: Partial<ConfiguracionAsistente>): ConfiguracionAsistente {
  return { proveedor: 'gemini', geminiApiKey: '', anthropicApiKey: '', modelo: '', ...parcial };
}

describe('crearModeloAsistente', () => {
  it('con Gemini y su clave usa Gemini', () => {
    const modelo = crearModeloAsistente(config({ geminiApiKey: 'clave-de-prueba' }));

    expect(modelo).toBeInstanceOf(GeminiModeloAsistente);
  });

  it('con Anthropic y su clave usa Claude', () => {
    const modelo = crearModeloAsistente(
      config({ proveedor: 'anthropic', anthropicApiKey: 'clave-de-prueba' }),
    );

    expect(modelo).toBeInstanceOf(ClaudeModeloAsistente);
  });

  it('sin la clave del proveedor elegido no hay modelo, aunque esté la del otro', () => {
    expect(crearModeloAsistente(config({ anthropicApiKey: 'clave-de-prueba' }))).toBeNull();
    expect(
      crearModeloAsistente(config({ proveedor: 'anthropic', geminiApiKey: 'clave-de-prueba' })),
    ).toBeNull();
  });
});
