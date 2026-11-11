import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PiezaPortalDto } from '../../application/portal/dto/pieza-portal.dto';
import { ObtenerPiezaPortal } from '../../application/portal/obtener-pieza-portal.use-case';

@ApiTags('portal')
@Controller('portal/piezas')
export class PortalController {
  constructor(private readonly obtenerPiezaPortal: ObtenerPiezaPortal) {}

  @Get(':codigo')
  @ApiOperation({ summary: 'Consultar la ficha pública de una pieza por su código' })
  @ApiOkResponse({ type: PiezaPortalDto })
  @ApiNotFoundResponse({ description: 'La pieza no existe.' })
  obtenerPorCodigo(@Param('codigo') codigo: string): Promise<PiezaPortalDto> {
    return this.obtenerPiezaPortal.ejecutar(codigo);
  }
}
