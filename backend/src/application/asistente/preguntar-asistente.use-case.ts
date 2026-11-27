import { ErrorServicioNoDisponible } from '../../domain/comun/errores';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { TIPOS_PIEZA, TipoPieza } from '../../domain/piezas/tipo-pieza';
import { PiezaPortalDto } from '../portal/dto/pieza-portal.dto';
import { PreguntarAsistenteDto } from './dto/preguntar-asistente.dto';
import { RespuestaAsistenteDto } from './dto/respuesta-asistente.dto';
import { FiltrosInterpretados, ModeloAsistente, PiezaCandidata } from './puertos';

const MAXIMO_PALABRAS = 4;
const CANDIDATAS_POR_BUSQUEDA = 8;
const MAXIMO_CANDIDATAS = 12;
const MAXIMO_PIEZAS = 4;
const MAXIMO_SUGERENCIAS = 3;

export class PreguntarAsistente {
  constructor(
    private readonly piezas: Pick<PiezaRepositorio, 'listarPublicadas'>,
    private readonly modelo: ModeloAsistente | null,
  ) {}

  async ejecutar(dto: PreguntarAsistenteDto): Promise<RespuestaAsistenteDto> {
    if (!this.modelo) {
      throw new ErrorServicioNoDisponible('El asistente de IA no está configurado.');
    }
    const pregunta = dto.pregunta.trim();

    const filtros = this.sanear(await this.modelo.interpretar(pregunta));
    const candidatas = await this.buscarCandidatas(filtros);
    const recomendacion = await this.modelo.recomendar(pregunta, candidatas.map(aCandidata));

    // El modelo solo elige entre las candidatas: un código que no salió del catálogo se descarta.
    const porCodigo = new Map(candidatas.map((pieza) => [pieza.codigo.valor, pieza]));
    const elegidas = [...new Set(recomendacion.codigos)]
      .map((codigo) => porCodigo.get(codigo))
      .filter((pieza): pieza is Pieza => pieza !== undefined)
      .slice(0, MAXIMO_PIEZAS);

    return {
      modo: 'IA',
      mensaje: recomendacion.mensaje.trim(),
      piezas: elegidas.map((pieza) => PiezaPortalDto.desdeEntidad(pieza)),
      sugerencias: recomendacion.sugerencias
        .map((sugerencia) => sugerencia.trim())
        .filter((sugerencia) => sugerencia.length > 0)
        .slice(0, MAXIMO_SUGERENCIAS),
    };
  }

  private sanear(filtros: FiltrosInterpretados): FiltrosInterpretados {
    const palabras = [
      ...new Set(filtros.palabras.map((palabra) => palabra.trim()).filter(Boolean)),
    ].slice(0, MAXIMO_PALABRAS);
    const tipo = TIPOS_PIEZA.includes(filtros.tipo as TipoPieza) ? filtros.tipo : null;
    const { decada } = filtros;
    const decadaValida =
      decada !== null &&
      Number.isInteger(decada) &&
      decada % 10 === 0 &&
      decada >= 1500 &&
      decada <= 2090;
    return { palabras, tipo, decada: decadaValida ? decada : null };
  }

  /**
   * El buscador pide que el texto entero aparezca en la pieza, así que cada palabra se busca por
   * separado. Las restringidas nunca se buscan: su título y descripción no pueden llegar al modelo.
   */
  private async buscarCandidatas(filtros: FiltrosInterpretados): Promise<Pieza[]> {
    const textos: (string | undefined)[] = [...filtros.palabras];
    if (textos.length === 0 && (filtros.tipo || filtros.decada !== null)) textos.push(undefined);

    const resultados = await Promise.all(
      textos.map((texto) =>
        this.piezas.listarPublicadas({
          pagina: 1,
          limite: CANDIDATAS_POR_BUSQUEDA,
          orden: 'titulo',
          direccion: 'asc',
          filtros: {
            texto,
            tipo: filtros.tipo ?? undefined,
            decada: filtros.decada ?? undefined,
            incluirRestringidas: false,
          },
        }),
      ),
    );

    const vistas = new Set<string>();
    const candidatas: Pieza[] = [];
    for (const pieza of resultados.flatMap((resultado) => resultado.datos)) {
      if (pieza.restringida || vistas.has(pieza.codigo.valor)) continue;
      vistas.add(pieza.codigo.valor);
      candidatas.push(pieza);
      if (candidatas.length === MAXIMO_CANDIDATAS) break;
    }
    return candidatas;
  }
}

function aCandidata(pieza: Pieza): PiezaCandidata {
  return {
    codigo: pieza.codigo.valor,
    tipo: pieza.tipo,
    titulo: pieza.titulo,
    descripcion: pieza.descripcion,
    anio: pieza.anio,
  };
}
