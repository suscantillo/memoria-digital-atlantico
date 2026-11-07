import { UbicacionRepositorioMemoria } from '../../../test/dobles/ubicacion-repositorio.memoria';
import { CrearUbicacion } from './crear-ubicacion.use-case';
import { ListarUbicacionesDto } from './dto/listar-ubicaciones.dto';
import { ListarUbicaciones } from './listar-ubicaciones.use-case';

function consulta(parcial: Partial<ListarUbicacionesDto> = {}): ListarUbicacionesDto {
  return Object.assign(new ListarUbicacionesDto(), parcial);
}

describe('ListarUbicaciones', () => {
  let repositorio: UbicacionRepositorioMemoria;
  let listar: ListarUbicaciones;

  beforeEach(async () => {
    repositorio = new UbicacionRepositorioMemoria();
    listar = new ListarUbicaciones(repositorio);
    const crear = new CrearUbicacion(repositorio);
    for (let i = 1; i <= 25; i += 1) {
      await crear.ejecutar({
        deposito: i <= 15 ? 'Depósito A' : 'Depósito B',
        estanteria: `Estantería ${String(i).padStart(2, '0')}`,
        caja: `Caja ${String(i).padStart(2, '0')}`,
        descripcion: i === 7 ? 'Periódicos de prueba' : undefined,
      });
    }
  });

  it('pagina con los valores por defecto (página 1, 20 por página)', async () => {
    const resultado = await listar.ejecutar(consulta());

    expect(resultado.datos).toHaveLength(20);
    expect(resultado.meta).toEqual({ pagina: 1, limite: 20, total: 25, totalPaginas: 2 });
  });

  it('devuelve la segunda página con el resto', async () => {
    const resultado = await listar.ejecutar(consulta({ pagina: 2, limite: 20 }));

    expect(resultado.datos).toHaveLength(5);
    expect(resultado.meta.pagina).toBe(2);
  });

  it('filtra por depósito', async () => {
    const resultado = await listar.ejecutar(consulta({ deposito: 'Depósito B' }));

    expect(resultado.meta.total).toBe(10);
    expect(resultado.datos.every((u) => u.deposito === 'Depósito B')).toBe(true);
  });

  it('busca texto en la descripción sin distinguir mayúsculas', async () => {
    const resultado = await listar.ejecutar(consulta({ busqueda: 'PERIÓDICOS' }));

    expect(resultado.meta.total).toBe(1);
    expect(resultado.datos[0].caja).toBe('Caja 07');
  });

  it('ordena de forma descendente por estantería', async () => {
    const resultado = await listar.ejecutar(
      consulta({ orden: 'estanteria', direccion: 'desc', limite: 3 }),
    );

    expect(resultado.datos.map((u) => u.estanteria)).toEqual([
      'Estantería 25',
      'Estantería 24',
      'Estantería 23',
    ]);
  });
});
