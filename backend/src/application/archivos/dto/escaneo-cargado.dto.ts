import { EscaneoCargado } from '../cargar-escaneo.use-case';

export class EscaneoCargadoDto {
  id!: string;
  piezaId!: string;
  codigo!: string;
  estado!: 'EN_REVISION';
  estadoPieza!: 'ESCANEADA';
  nombreOriginal!: string;
  tipoMime!: string;
  tamanoBytes!: number;
  tema!: string;
  autor!: string;
  palabrasClave!: string[];
  creadoEn!: string;

  static desde(escaneo: EscaneoCargado): EscaneoCargadoDto {
    return Object.assign(new EscaneoCargadoDto(), {
      ...escaneo,
      creadoEn: escaneo.creadoEn.toISOString(),
    });
  }
}
