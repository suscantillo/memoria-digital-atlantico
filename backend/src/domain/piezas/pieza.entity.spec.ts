import { ErrorRegla } from '../comun/errores';
import { CodigoPieza } from './codigo-pieza';
import { DatosCrearPieza, Pieza } from './pieza.entity';
import { TipoPieza } from './tipo-pieza';

describe('Pieza', () => {
  const datosBase: DatosCrearPieza = {
    codigo: CodigoPieza.generar(2026, 1),
    titulo: 'Documento histórico',
    tipo: 'DOCUMENTO',
    anio: 1950,
    ubicacion: {
      id: 'ubicacion-123',
      deposito: 'Depósito 1',
      estanteria: 'Estantería A',
      caja: 'Caja 10',
    },
  };

  describe('crear', () => {
    it('debe crear una pieza con estado inicial REGISTRADA', () => {
      const pieza = Pieza.crear(datosBase);

      expect(pieza.estado).toBe('REGISTRADA');
      expect(pieza.titulo).toBe('Documento histórico');
      expect(pieza.tipo).toBe('DOCUMENTO');
      expect(pieza.anio).toBe(1950);
    });

    it('debe rechazar un título vacío', () => {
      expect(() =>
        Pieza.crear({
          ...datosBase,
          titulo: '   ',
        }),
      ).toThrow(ErrorRegla);
    });

    it('debe rechazar un tipo de pieza inválido', () => {
      expect(() =>
        Pieza.crear({
          ...datosBase,
          tipo: 'INVALIDO' as TipoPieza,
        }),
      ).toThrow(ErrorRegla);
    });

    it('debe rechazar un año fuera del rango permitido', () => {
      expect(() =>
        Pieza.crear({
          ...datosBase,
          anio: 1499,
        }),
      ).toThrow(ErrorRegla);

      expect(() =>
        Pieza.crear({
          ...datosBase,
          anio: 2101,
        }),
      ).toThrow(ErrorRegla);
    });
  });
});
