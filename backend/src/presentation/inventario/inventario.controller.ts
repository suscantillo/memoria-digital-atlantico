import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventarioPaginadoDto } from '../../application/inventario/dto/pieza-inventario.dto';
import { ListarInventarioDto } from '../../application/inventario/dto/listar-inventario.dto';
import { ListarInventario } from '../../application/inventario/listar-inventario.use-case';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';

@ApiTags('piezas')
@Controller('piezas')
export class InventarioController {
  constructor(private readonly listarInventario: ListarInventario) {}

  @Get()
  @Autenticado('ADMIN', 'PERSONAL')
  @ApiOperation({ summary: 'Listar el inventario con filtros, paginación y orden' })
  @ApiOkResponse({ type: InventarioPaginadoDto })
  listar(@Query() consulta: ListarInventarioDto): Promise<InventarioPaginadoDto> {
    return this.listarInventario.ejecutar(consulta);
  }
}
