import {
  ArchivoDigital,
  ArchivoNoEncontradoError,
  ArchivoYaRevisadoError,
  MotivoRechazoObligatorioError,
} from '../../domain/archivos/archivo-digital.entity';
import { EstadoArchivoDigital } from '../../domain/archivos/estado-archivo-digital';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { EstadoPieza } from '../../domain/piezas/estado-pieza';
import { Pieza, PiezaSinEscaneoPorRevisarError } from '../../domain/piezas/pieza.entity';
import { ArchivoDigitalRepositorioMemoria } from '../../../test/dobles/archivo-digital-repositorio.memoria';
import { AprobarEscaneo } from './aprobar-escaneo.use-case';
import { ListarArchivos } from './listar-archivos.use-case';
import { ObtenerContenidoArchivo } from './obtener-contenido-archivo.use-case';
import { AlmacenArchivos } from './puertos';
import { RechazarEscaneo } from './rechazar-escaneo.use-case';

const ARCHIVO_ID = '33333333-3333-3333-3333-333333333333';
const PIEZA_ID = '11111111-1111-1111-1111-111111111111';
const REVISOR_ID = '44444444-4444-4444-4444-444444444444';
const RUTA = 'escaneos/2026/11/prueba.png';
const AHORA = new Date('2026-11-12T18:00:00.000Z');

function fabricarArchivo(estado: EstadoArchivoDigital = 'EN_REVISION'): ArchivoDigital {
  return ArchivoDigital.reconstruir({
    id: ARCHIVO_ID,
    piezaId: PIEZA_ID,
    nombreOriginal: 'comparsa.png',
    rutaAlmacenamiento: RUTA,
    tipoMime: 'image/png',
    tamanoBytes: 2048,
    estado,
    motivoRechazo: null,
    subidoPorId: '55555555-5555-5555-5555-555555555555',
    revisadoPorId: null,
    revisadoEn: null,
    creadoEn: AHORA,
  });
}

function fabricarPieza(estado: EstadoPieza = 'ESCANEADA'): Pieza {
  return Pieza.reconstruir({
    id: PIEZA_ID,
    codigo: CodigoPieza.desde('MDA-2026-0004'),
    titulo: 'Fotografía ficticia de una comparsa',
    descripcion: null,
    tipo: 'FOTOGRAFIA',
    estado,
    anio: 1948,
    restringida: false,
    ubicacion: {
      id: '22222222-2222-2222-2222-222222222222',
      deposito: 'Depósito A',
      estanteria: 'Estantería 1',
      caja: 'Caja 02',
    },
    archivoAprobado: null,
    creadoEn: AHORA,
    actualizadoEn: AHORA,
  });
}

describe('Control de calidad', () => {
  let repositorio: ArchivoDigitalRepositorioMemoria;

  beforeEach(() => {
    repositorio = new ArchivoDigitalRepositorioMemoria();
  });

  describe('AprobarEscaneo', () => {
    it('deja el archivo APROBADO, la pieza PUBLICADA y el evento con quien revisó', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      const resultado = await new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID);

      expect(resultado.estado).toBe('APROBADO');
      expect(resultado.revisadoEn).not.toBeNull();
      expect(resultado.pieza.estado).toBe('PUBLICADA');
      expect(repositorio.archivos.get(ARCHIVO_ID)?.revisadoPorId).toBe(REVISOR_ID);
      expect(repositorio.eventos).toEqual([
        expect.objectContaining({ accion: 'PUBLICADA', piezaId: PIEZA_ID, usuarioId: REVISOR_ID }),
      ]);
    });

    it('no revisa dos veces el mismo escaneo', async () => {
      repositorio.agregar(fabricarArchivo('APROBADO'), fabricarPieza('PUBLICADA'));

      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID),
      ).rejects.toBeInstanceOf(ArchivoYaRevisadoError);
      expect(repositorio.eventos).toHaveLength(0);
    });

    it('si otra revisión se guardó primero, responde que ya fue revisado', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());
      repositorio.otraRevisionGano = true;

      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID),
      ).rejects.toBeInstanceOf(ArchivoYaRevisadoError);
    });

    it('exige que la pieza esté ESCANEADA', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza('REGISTRADA'));

      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID),
      ).rejects.toBeInstanceOf(PiezaSinEscaneoPorRevisarError);
    });

    it('responde que el archivo no existe', async () => {
      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID),
      ).rejects.toBeInstanceOf(ArchivoNoEncontradoError);
    });
  });

  describe('RechazarEscaneo', () => {
    it('deja el archivo RECHAZADO, la pieza REGISTRADA y el motivo en el historial', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      const resultado = await new RechazarEscaneo(repositorio).ejecutar(
        ARCHIVO_ID,
        REVISOR_ID,
        '  La imagen está cortada ',
      );

      expect(resultado.estado).toBe('RECHAZADO');
      expect(resultado.motivoRechazo).toBe('La imagen está cortada');
      expect(resultado.pieza.estado).toBe('REGISTRADA');
      expect(repositorio.eventos[0].accion).toBe('RECHAZADA');
      expect(repositorio.eventos[0].detalle).toContain('La imagen está cortada');
    });

    it('no rechaza sin motivo', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      await expect(
        new RechazarEscaneo(repositorio).ejecutar(ARCHIVO_ID, REVISOR_ID, '   '),
      ).rejects.toBeInstanceOf(MotivoRechazoObligatorioError);
      expect(repositorio.archivos.get(ARCHIVO_ID)?.estado).toBe('EN_REVISION');
      expect(repositorio.eventos).toHaveLength(0);
    });
  });

  describe('ListarArchivos', () => {
    it('filtra por estado y devuelve la ruta para ver cada escaneo', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      const consulta = { pagina: 1, limite: 20, orden: 'creadoEn', direccion: 'asc' } as const;
      const cola = await new ListarArchivos(repositorio).ejecutar({
        ...consulta,
        estado: 'EN_REVISION',
      });
      const aprobados = await new ListarArchivos(repositorio).ejecutar({
        ...consulta,
        estado: 'APROBADO',
      });

      expect(cola.meta.total).toBe(1);
      expect(cola.datos[0].url).toBe(`/api/v1/archivos/${ARCHIVO_ID}/contenido`);
      expect(cola.datos[0].pieza.codigo).toBe('MDA-2026-0004');
      expect(aprobados.datos).toEqual([]);
    });
  });

  describe('ObtenerContenidoArchivo', () => {
    const almacenCon = (contenido: Uint8Array | null): AlmacenArchivos => ({
      guardar: () => Promise.resolve(RUTA),
      leer: (ruta) => Promise.resolve(ruta === RUTA ? contenido : null),
      borrar: () => Promise.resolve(),
    });

    it('devuelve el contenido con su tipo y su nombre', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());
      const bytes = Uint8Array.from([1, 2, 3]);

      const resultado = await new ObtenerContenidoArchivo(repositorio, almacenCon(bytes)).ejecutar(
        ARCHIVO_ID,
      );

      expect(resultado).toEqual({
        nombreOriginal: 'comparsa.png',
        tipoMime: 'image/png',
        contenido: bytes,
      });
    });

    it('responde que no existe si falta la fila o falta el archivo en el almacén', async () => {
      const casoDeUso = new ObtenerContenidoArchivo(repositorio, almacenCon(null));
      await expect(casoDeUso.ejecutar(ARCHIVO_ID)).rejects.toBeInstanceOf(ArchivoNoEncontradoError);

      repositorio.agregar(fabricarArchivo(), fabricarPieza());
      await expect(casoDeUso.ejecutar(ARCHIVO_ID)).rejects.toBeInstanceOf(ArchivoNoEncontradoError);
    });
  });
});
