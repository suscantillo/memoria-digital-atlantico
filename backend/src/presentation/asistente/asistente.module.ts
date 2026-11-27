import Anthropic from '@anthropic-ai/sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreguntarAsistente } from '../../application/asistente/preguntar-asistente.use-case';
import { MODELO_ASISTENTE, ModeloAsistente } from '../../application/asistente/puertos';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { ClaudeModeloAsistente } from '../../infrastructure/asistente/claude-modelo-asistente';
import { Configuracion } from '../../infrastructure/config/configuracion';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { AsistenteController } from './asistente.controller';

@Module({
  controllers: [AsistenteController],
  providers: [
    { provide: PIEZA_REPOSITORIO, useClass: PrismaPiezaRepositorio },
    {
      provide: MODELO_ASISTENTE,
      useFactory: (config: ConfigService<Configuracion, true>): ModeloAsistente | null => {
        const clave = config.get('ANTHROPIC_API_KEY', { infer: true });
        if (!clave) return null;
        // Por debajo de los 30 s que espera el portal, para que alcance a pasar a su modo búsqueda.
        const cliente = new Anthropic({ apiKey: clave, timeout: 25_000, maxRetries: 1 });
        return new ClaudeModeloAsistente(cliente, config.get('ASISTENTE_MODELO', { infer: true }));
      },
      inject: [ConfigService],
    },
    {
      provide: PreguntarAsistente,
      useFactory: (piezas: PiezaRepositorio, modelo: ModeloAsistente | null) =>
        new PreguntarAsistente(piezas, modelo),
      inject: [PIEZA_REPOSITORIO, MODELO_ASISTENTE],
    },
  ],
})
export class AsistenteModule {}
