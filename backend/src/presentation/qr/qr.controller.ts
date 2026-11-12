import { Controller, Get, Header, Param, ParseUUIDPipe, StreamableFile } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GenerarQrPieza } from '../../application/qr/generar-qr-pieza.use-case';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';

@ApiTags('piezas')
@Controller('piezas')
export class QrController {
  constructor(private readonly generarQrPieza: GenerarQrPieza) {}

  @Get(':id/qr')
  @Autenticado('ADMIN', 'PERSONAL')
  @Header('Cache-Control', 'private, max-age=3600')
  @ApiOperation({ summary: 'Descargar el código QR de una pieza en PNG' })
  @ApiProduces('image/png')
  @ApiResponse({
    status: 200,
    description: 'PNG cuyo contenido es PUBLIC_WEB_URL/p/{codigo}?qr=1.',
  })
  @ApiNotFoundResponse({ description: 'La pieza no existe.' })
  async descargar(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const qr = await this.generarQrPieza.ejecutar(id);
    // el archivo se llama como el código para pegarlo sin confundir una pieza con otra
    return new StreamableFile(qr.png, {
      type: 'image/png',
      disposition: `attachment; filename="${qr.codigo}.png"`,
      length: qr.png.length,
    });
  }
}
