import {
  ArchivoDigital,
  ArchivoYaRevisadoError,
  RevisionNoAsignadaError,
  RevisorEsQuienSubioError,
} from '../../domain/archivos/archivo-digital.entity';
import { EstadoArchivoDigital } from '../../domain/archivos/estado-archivo-digital';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { ArchivoDigitalRepositorioMemoria } from '../../../test/dobles/archivo-digital-repositorio.memoria';
import { AprobarEscaneo } from './aprobar-escaneo.use-case';
import { AsignarRevisor, RevisorNoDisponibleError } from './asignar-revisor.use-case';
import { ListarArchivos } from './listar-archivos.use-case';
import { ListarRevisores } from './listar-revisores.use-case';
import { RevisorDisponible, Revisores } from './puertos';
import { RechazarEscaneo } from './rechazar-escaneo.use-case';

const ARCHIVO_ID = '33333333-3333-3333-3333-333333333333';
const PIEZA_ID = '11111111-1111-1111-1111-111111111111';
const QUIEN_SUBIO = '55555555-5555-5555-5555-555555555555';
const ANA = { id: '44444444-4444-4444-4444-444444444444', nombre: 'Ana', correo: 'ana@mda.local' };
const LUIS = {
  id: '77777777-7777-7777-7777-777777777777',
  nombre: 'Luis',
  correo: 'luis@mda.local',
};
const ADMIN = { id: '66666666-6666-6666-6666-666666666666', rol: 'ADMIN' } as const;
const AHORA = new Date('2026-11-12T18:00:00.000Z');

function fabricarArchivo(
  revisorAsignadoId: string | null = null,
  estado: EstadoArchivoDigital = 'EN_REVISION',
): ArchivoDigital {
  return ArchivoDigital.reconstruir({
    id: ARCHIVO_ID,
    piezaId: PIEZA_ID,
    nombreOriginal: 'comparsa.png',
    rutaAlmacenamiento: 'escaneos/2026/11/comparsa.png',
    tipoMime: 'image/png',
    tamanoBytes: 2048,
    estado,
    motivoRechazo: null,
    subidoPorId: QUIEN_SUBIO,
    revisadoPorId: null,
    revisadoEn: null,
    revisorAsignadoId,
    creadoEn: AHORA,
  });
}

function fabricarPieza(): Pieza {
  return Pieza.reconstruir({
    id: PIEZA_ID,
    codigo: CodigoPieza.desde('MDA-2026-0004'),
    titulo: 'Fotografía de una comparsa',
    descripcion: null,
    tipo: 'FOTOGRAFIA',
    estado: 'ESCANEADA',
    anio: 1948,
    restringida: false,
    ubicacion: {
      id: '22222222-2222-2222-2222-222222222222',
      deposito: 'A',
      estanteria: '1',
      caja: '2',
    },
    archivoAprobado: null,
    creadoEn: AHORA,
    actualizadoEn: AHORA,
  });
}

/** Ana y Luis son PERSONAL activos; quien subió el escaneo también, para probar el criterio 4. */
class RevisoresMemoria implements Revisores {
  constructor(private readonly disponibles: RevisorDisponible[]) {}
  listarDisponibles() {
    return Promise.resolve(this.disponibles);
  }
  buscarDisponible(id: string) {
    return Promise.resolve(this.disponibles.find((r) => r.id === id) ?? null);
  }
}

describe('HU-23: revisor asignado de cada escaneo', () => {
  let repositorio: ArchivoDigitalRepositorioMemoria;
  const revisores = new RevisoresMemoria([
    ANA,
    LUIS,
    { id: QUIEN_SUBIO, nombre: 'Quien subió', correo: 'subio@mda.local' },
  ]);

  beforeEach(() => {
    repositorio = new ArchivoDigitalRepositorioMemoria();
  });

  describe('AsignarRevisor', () => {
    it('criterio 1: asigna una cuenta PERSONAL activa y deja la asignación en el historial', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      const resultado = await new AsignarRevisor(repositorio, revisores).ejecutar(
        ARCHIVO_ID,
        ANA.id,
        ADMIN.id,
      );

      expect(resultado.revisor).toMatchObject({ id: ANA.id });
      expect(repositorio.eventos).toEqual([
        expect.objectContaining({
          accion: 'REVISOR_ASIGNADO',
          piezaId: PIEZA_ID,
          usuarioId: ADMIN.id,
          detalle: expect.stringContaining('Ana') as unknown,
        }),
      ]);
    });

    it('cambia el revisor mientras siga EN_REVISION', async () => {
      repositorio.agregar(fabricarArchivo(ANA.id), fabricarPieza());

      const resultado = await new AsignarRevisor(repositorio, revisores).ejecutar(
        ARCHIVO_ID,
        LUIS.id,
        ADMIN.id,
      );

      expect(resultado.revisor).toMatchObject({ id: LUIS.id });
    });

    it('criterio 4: nadie revisa su propio escaneo', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      await expect(
        new AsignarRevisor(repositorio, revisores).ejecutar(ARCHIVO_ID, QUIEN_SUBIO, ADMIN.id),
      ).rejects.toBeInstanceOf(RevisorEsQuienSubioError);
      expect(repositorio.eventos).toHaveLength(0);
    });

    it('rechaza una cuenta que no es PERSONAL activa', async () => {
      repositorio.agregar(fabricarArchivo(), fabricarPieza());

      await expect(
        new AsignarRevisor(repositorio, revisores).ejecutar(
          ARCHIVO_ID,
          '88888888-8888-8888-8888-888888888888',
          ADMIN.id,
        ),
      ).rejects.toBeInstanceOf(RevisorNoDisponibleError);
    });

    it('no asigna un escaneo ya revisado', async () => {
      repositorio.agregar(fabricarArchivo(null, 'APROBADO'), fabricarPieza());

      await expect(
        new AsignarRevisor(repositorio, revisores).ejecutar(ARCHIVO_ID, ANA.id, ADMIN.id),
      ).rejects.toBeInstanceOf(ArchivoYaRevisadoError);
    });
  });

  describe('quién puede aprobar o rechazar', () => {
    it('criterio 2: un PERSONAL que no es el revisor asignado no puede (403)', async () => {
      repositorio.agregar(fabricarArchivo(ANA.id), fabricarPieza());

      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, { id: LUIS.id, rol: 'PERSONAL' }),
      ).rejects.toBeInstanceOf(RevisionNoAsignadaError);
      await expect(
        new RechazarEscaneo(repositorio).ejecutar(
          ARCHIVO_ID,
          { id: LUIS.id, rol: 'PERSONAL' },
          'borroso',
        ),
      ).rejects.toBeInstanceOf(RevisionNoAsignadaError);
      expect(repositorio.eventos).toHaveLength(0);
    });

    it('criterio 2: el revisor asignado sí puede', async () => {
      repositorio.agregar(fabricarArchivo(ANA.id), fabricarPieza());

      const resultado = await new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, {
        id: ANA.id,
        rol: 'PERSONAL',
      });

      expect(resultado.estado).toBe('APROBADO');
    });

    it('criterio 3: sin revisor asignado solo un ADMIN puede', async () => {
      repositorio.agregar(fabricarArchivo(null), fabricarPieza());

      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, { id: ANA.id, rol: 'PERSONAL' }),
      ).rejects.toBeInstanceOf(RevisionNoAsignadaError);
      await expect(
        new AprobarEscaneo(repositorio).ejecutar(ARCHIVO_ID, ADMIN),
      ).resolves.toMatchObject({ estado: 'APROBADO' });
    });
  });

  describe('ListarArchivos', () => {
    const consulta = { pagina: 1, limite: 20, orden: 'creadoEn', direccion: 'asc' } as const;

    it('criterio 3: un PERSONAL solo ve en su cola lo que le asignaron', async () => {
      repositorio.agregar(fabricarArchivo(null), fabricarPieza());

      const cola = await new ListarArchivos(repositorio).ejecutar(
        { ...consulta, estado: 'EN_REVISION', revisor: 'ninguno' },
        { id: ANA.id, rol: 'PERSONAL' },
      );
      const delAdmin = await new ListarArchivos(repositorio).ejecutar(
        { ...consulta, estado: 'EN_REVISION', revisor: 'ninguno' },
        ADMIN,
      );

      expect(cola.datos).toEqual([]);
      expect(delAdmin.datos).toHaveLength(1);
    });

    it('«Mis escaneos»: con subidoPor=yo ve lo que subió, tenga o no revisor', async () => {
      repositorio.agregar(fabricarArchivo(null), fabricarPieza());

      const mios = await new ListarArchivos(repositorio).ejecutar(
        { ...consulta, subidoPor: 'yo' },
        { id: QUIEN_SUBIO, rol: 'PERSONAL' },
      );

      expect(mios.datos).toHaveLength(1);
      expect(mios.datos[0].subidoPor.id).toBe(QUIEN_SUBIO);
    });
  });

  it('ListarRevisores devuelve las cuentas disponibles', async () => {
    await expect(new ListarRevisores(new RevisoresMemoria([ANA])).ejecutar()).resolves.toEqual([
      ANA,
    ]);
  });
});
