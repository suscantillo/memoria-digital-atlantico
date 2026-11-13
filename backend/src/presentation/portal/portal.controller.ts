import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscarPiezasPortal } from '../../application/portal/buscar-piezas-portal.use-case';
import { BuscarPiezasPortalDto } from '../../application/portal/dto/buscar-piezas-portal.dto';
import { PiezaPortalDto } from '../../application/portal/dto/pieza-portal.dto';
import { PiezasPortalPaginadasDto } from '../../application/portal/dto/piezas-portal-paginadas.dto';
import { ObtenerPiezaPortal } from '../../application/portal/obtener-pieza-portal.use-case';
import { Publica } from '../comun/decoradores/publica.decorator';

@ApiTags('portal')
@Controller('portal/piezas')
export class PortalController {
  constructor(
    private readonly obtenerPiezaPortal: ObtenerPiezaPortal,
    private readonly buscarPiezasPortal: BuscarPiezasPortal,
  ) {}

  @Publica()
  @Get()
  @ApiOperation({ summary: 'Buscar piezas publicadas por texto, tipo y década' })
  @ApiOkResponse({ type: PiezasPortalPaginadasDto })
  buscar(@Query() consulta: BuscarPiezasPortalDto): Promise<PiezasPortalPaginadasDto> {
    return this.buscarPiezasPortal.ejecutar(consulta);
  }

  @Publica()
  @Get(':codigo')
  @ApiOperation({ summary: 'Consultar la ficha pública de una pieza por su código' })
  @ApiOkResponse({ type: PiezaPortalDto })
  @ApiNotFoundResponse({ description: 'La pieza no existe o no está publicada.' })
  obtenerPorCodigo(@Param('codigo') codigo: string): Promise<PiezaPortalDto> {
    return this.obtenerPiezaPortal.ejecutar(codigo);
  }
}
