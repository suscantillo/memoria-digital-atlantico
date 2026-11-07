import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configurarApp, configurarSwagger, PREFIJO_API, RUTA_DOCS } from './configurar-app';
import { Configuracion } from './infrastructure/config/configuracion';

async function arrancar(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configurarApp(app);
  configurarSwagger(app);

  const config = app.get<ConfigService<Configuracion, true>>(ConfigService);
  const puerto = config.get('PORT', { infer: true });
  await app.listen(puerto);

  const logger = app.get(Logger);
  logger.log(`API disponible en http://localhost:${puerto}/${PREFIJO_API}`);
  logger.log(`Swagger disponible en http://localhost:${puerto}/${RUTA_DOCS}`);
}

void arrancar();
