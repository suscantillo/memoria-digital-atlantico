import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { Configuracion } from './infrastructure/config/configuracion';
import { FiltroExcepcionesHttp } from './presentation/comun/filtros/filtro-excepciones-http';

export const PREFIJO_API = 'api/v1';
export const RUTA_DOCS = 'docs';

export function configurarApp<T extends INestApplication>(app: T): T {
  const config = app.get<ConfigService<Configuracion, true>>(ConfigService);

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(PREFIJO_API);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new FiltroExcepcionesHttp());
  app.enableCors({ origin: config.get('PUBLIC_WEB_URL', { infer: true }), credentials: true });
  app.enableShutdownHooks();

  return app;
}

export function configurarSwagger(app: INestApplication): void {
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Memoria Digital del Atlántico')
      .setDescription(
        'API del Archivo Histórico del Atlántico: inventario de piezas, escaneos con control de calidad, QR y portal público.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup(RUTA_DOCS, app, documento, {
    customSiteTitle: 'Memoria Digital del Atlántico · API',
  });
}
