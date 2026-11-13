import {
  detectarFormatoEscaneo,
  EscaneoDemasiadoGrandeError,
  EscaneoVacioError,
  FormatoEscaneoNoPermitidoError,
  TAMANO_MAXIMO_ESCANEO,
  validarEscaneo,
} from './formato-escaneo';

const conCabecera = (cabecera: number[], largo = 32) => {
  const bytes = new Uint8Array(largo);
  bytes.set(cabecera);
  return bytes;
};

describe('formato del escaneo', () => {
  it.each([
    ['image/jpeg', [0xff, 0xd8, 0xff, 0xe0]],
    ['image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ['image/webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]],
    ['image/tiff', [0x49, 0x49, 0x2a, 0x00]],
    ['image/tiff', [0x4d, 0x4d, 0x00, 0x2a]],
    ['application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]],
  ])('reconoce %s por sus primeros bytes', (tipo, cabecera) => {
    expect(detectarFormatoEscaneo(conCabecera(cabecera))).toBe(tipo);
  });

  it('rechaza un archivo que no es imagen ni PDF aunque se llame .pdf', () => {
    const ejecutable = conCabecera([0x4d, 0x5a, 0x90, 0x00]);
    expect(() => validarEscaneo(ejecutable)).toThrow(FormatoEscaneoNoPermitidoError);
  });

  it('rechaza un archivo vacío y uno de más de 20 MB', () => {
    expect(() => validarEscaneo(new Uint8Array(0))).toThrow(EscaneoVacioError);
    const grande = conCabecera([0x25, 0x50, 0x44, 0x46, 0x2d], TAMANO_MAXIMO_ESCANEO + 1);
    expect(() => validarEscaneo(grande)).toThrow(EscaneoDemasiadoGrandeError);
  });

  it('acepta un PDF de exactamente 20 MB', () => {
    const justo = conCabecera([0x25, 0x50, 0x44, 0x46, 0x2d], TAMANO_MAXIMO_ESCANEO);
    expect(validarEscaneo(justo)).toBe('application/pdf');
  });
});
