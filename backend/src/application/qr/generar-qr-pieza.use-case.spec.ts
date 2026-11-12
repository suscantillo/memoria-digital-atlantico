import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { GenerarQrPieza, QrPiezaNoEncontradaError } from './generar-qr-pieza.use-case';
import { CodigosDePieza, GeneradorQr } from './puertos';

const ID = '11111111-1111-1111-1111-111111111111';

class CodigosMemoria implements CodigosDePieza {
  constructor(private readonly piezas: Record<string, string>) {}
  codigoPorId(id: string): Promise<CodigoPieza | null> {
    const codigo = this.piezas[id];
    return Promise.resolve(codigo ? CodigoPieza.desde(codigo) : null);
  }
}

class GeneradorEspia implements GeneradorQr {
  textos: string[] = [];
  png(texto: string): Promise<Buffer> {
    this.textos.push(texto);
    return Promise.resolve(Buffer.from('png'));
  }
}

describe('GenerarQrPieza', () => {
  let generador: GeneradorEspia;

  beforeEach(() => {
    generador = new GeneradorEspia();
  });

  it('el QR guarda la ficha pública de la pieza abierta desde el QR', async () => {
    const casoDeUso = new GenerarQrPieza(
      new CodigosMemoria({ [ID]: 'MDA-2026-0004' }),
      generador,
      'https://memoria.example',
    );

    const qr = await casoDeUso.ejecutar(ID);

    expect(qr.codigo).toBe('MDA-2026-0004');
    expect(qr.enlace).toBe('https://memoria.example/p/MDA-2026-0004?qr=1');
    expect(generador.textos).toEqual(['https://memoria.example/p/MDA-2026-0004?qr=1']);
    expect(qr.png).toEqual(Buffer.from('png'));
  });

  it('no duplica la barra si PUBLIC_WEB_URL termina en /', async () => {
    const casoDeUso = new GenerarQrPieza(
      new CodigosMemoria({ [ID]: 'MDA-2026-0004' }),
      generador,
      'http://localhost:5173/',
    );

    const qr = await casoDeUso.ejecutar(ID);

    expect(qr.enlace).toBe('http://localhost:5173/p/MDA-2026-0004?qr=1');
  });

  it('responde que no encuentra una pieza que no existe', async () => {
    const casoDeUso = new GenerarQrPieza(new CodigosMemoria({}), generador, 'http://x.co');

    await expect(casoDeUso.ejecutar(ID)).rejects.toBeInstanceOf(QrPiezaNoEncontradaError);
    expect(generador.textos).toEqual([]);
  });
});
