import Anthropic from '@anthropic-ai/sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PreguntarAsistente } from '../../application/asistente/preguntar-asistente.use-case';
import { MODELO_ASISTENTE, ModeloAsistente } from '../../application/asistente/puertos';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { ClaudeModeloAsistente } from '../../infrastructure/asistente/claude-modelo-asistente';
import { Configuracion } from '../../infrastructure/config/configuracion';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { AsistenteController } from './asistente.controller';

// Cada pregunta cuesta dos llamadas a la API de Anthropic y la ruta es pública: se limita por IP.
const LIMITES_POR_IP = [
  { name: 'minuto', ttl: 60_000, limit: 5 },
  { name: 'hora', ttl: 3_600_000, limit: 40 },
];

@Module({
  imports: [ThrottlerModule.forRoot(LIMITES_POR_IP)],
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
