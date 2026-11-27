import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PreguntarAsistente } from '../../application/asistente/preguntar-asistente.use-case';
import { MODELO_ASISTENTE, ModeloAsistente } from '../../application/asistente/puertos';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { crearModeloAsistente } from '../../infrastructure/asistente/crear-modelo-asistente';
import { Configuracion } from '../../infrastructure/config/configuracion';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { AsistenteController } from './asistente.controller';

// Cada pregunta hace dos llamadas al proveedor de IA y la ruta es pública: se limita por IP.
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
      useFactory: (config: ConfigService<Configuracion, true>): ModeloAsistente | null =>
        crearModeloAsistente({
          proveedor: config.get('ASISTENTE_PROVEEDOR', { infer: true }),
          geminiApiKey: config.get('GEMINI_API_KEY', { infer: true }),
          anthropicApiKey: config.get('ANTHROPIC_API_KEY', { infer: true }),
          modelo: config.get('ASISTENTE_MODELO', { infer: true }),
        }),
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
