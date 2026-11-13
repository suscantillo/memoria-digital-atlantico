import { evaluarAccesoArchivo } from './acceso-archivo';

const imagen = { estado: 'APROBADO', tipoMime: 'image/png' } as const;
const pdf = { estado: 'APROBADO', tipoMime: 'application/pdf' } as const;
const publicada = { estado: 'PUBLICADA', restringida: false } as const;

describe('evaluarAccesoArchivo', () => {
  it('un visitante sin sesión ve la imagen aprobada de una pieza publicada', () => {
    expect(evaluarAccesoArchivo(imagen, publicada, null)).toBe('PERMITIDO');
  });

  it('el PDF pide sesión al visitante y se abre con cualquier cuenta', () => {
    expect(evaluarAccesoArchivo(pdf, publicada, null)).toBe('REQUIERE_SESION');
    expect(evaluarAccesoArchivo(pdf, publicada, 'PUBLICO')).toBe('PERMITIDO');
  });

  it.each([null, 'PUBLICO'] as const)(
    'para el público (%s) no existe el archivo de una pieza restringida',
    (rol) => {
      const restringida = { estado: 'PUBLICADA', restringida: true } as const;
      expect(evaluarAccesoArchivo(imagen, restringida, rol)).toBe('NO_VISIBLE');
      expect(evaluarAccesoArchivo(pdf, restringida, rol)).toBe('NO_VISIBLE');
    },
  );

  it('el público no ve escaneos sin aprobar ni de piezas sin publicar', () => {
    const enRevision = { estado: 'EN_REVISION', tipoMime: 'image/png' } as const;
    const escaneada = { estado: 'ESCANEADA', restringida: false } as const;
    expect(evaluarAccesoArchivo(enRevision, escaneada, 'PUBLICO')).toBe('NO_VISIBLE');
    expect(evaluarAccesoArchivo(imagen, escaneada, null)).toBe('NO_VISIBLE');
    // sin aprobar va primero: un PDF en revisión no delata que existe pidiendo sesión
    expect(
      evaluarAccesoArchivo({ estado: 'RECHAZADO', tipoMime: 'application/pdf' }, publicada, null),
    ).toBe('NO_VISIBLE');
  });

  it.each(['PERSONAL', 'ADMIN'] as const)('%s ve cualquier escaneo', (rol) => {
    const enRevision = { estado: 'EN_REVISION', tipoMime: 'application/pdf' } as const;
    const restringida = { estado: 'ESCANEADA', restringida: true } as const;
    expect(evaluarAccesoArchivo(enRevision, restringida, rol)).toBe('PERMITIDO');
  });
});
