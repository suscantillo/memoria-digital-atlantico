import { ErrorRegla } from '../comun/errores';
import { CodigoPieza } from './codigo-pieza';

describe('CodigoPieza', () => {
  it('acepta el formato MDA-AAAA-NNNN y expone año y consecutivo', () => {
    const codigo = CodigoPieza.desde('mda-2026-0007');

    expect(codigo.valor).toBe('MDA-2026-0007');
    expect(codigo.anio).toBe(2026);
    expect(codigo.consecutivo).toBe(7);
  });

  it('genera el código con el consecutivo rellenado a cuatro dígitos', () => {
    expect(CodigoPieza.generar(2026, 12).valor).toBe('MDA-2026-0012');
  });

  it.each(['MDA-26-0001', 'MDA-2026-1', 'ABC-2026-0001', '', 'MDA-2026-00011'])(
    'rechaza "%s"',
    (valor) => {
      expect(() => CodigoPieza.desde(valor)).toThrow(ErrorRegla);
    },
  );

  it('rechaza consecutivos fuera de rango', () => {
    expect(() => CodigoPieza.generar(2026, 0)).toThrow(ErrorRegla);
    expect(() => CodigoPieza.generar(2026, 10000)).toThrow(ErrorRegla);
  });
});
