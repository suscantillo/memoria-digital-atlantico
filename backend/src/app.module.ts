import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { SeguridadModule } from './infrastructure/auth/seguridad.module';
import { Configuracion } from './infrastructure/config/configuracion';
import { ConfiguracionModule } from './infrastructure/config/configuracion.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './presentation/auth/auth.module';
import { PiezasModule } from './presentation/piezas/piezas.module';
import { GuardiaJwt } from './presentation/comun/guards/guardia-jwt.guard';
import { GuardiaRoles } from './presentation/comun/guards/guardia-roles.guard';
import { PortalModule } from './presentation/portal/portal.module';
import { QrModule } from './presentation/qr/qr.module';
import { SaludModule } from './presentation/salud/salud.module';
import { UbicacionesModule } from './presentation/ubicaciones/ubicaciones.module';

const RUTAS_SIN_LOG = new Set(['/api/v1/health']);

@Module({
  imports: [
    ConfiguracionModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configuracion, true>) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', { infer: true }),
          transport:
            config.get('NODE_ENV', { infer: true }) === 'production'
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' },
                },
          redact: ['req.headers.authorization', 'req.headers.cookie'],
          autoLogging: { ignore: (req) => RUTAS_SIN_LOG.has(req.url ?? '') },
          serializers: {
            req: (req: { id: unknown; method: string; url: string }) => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
          },
        },
      }),
    }),
    PrismaModule,
    SeguridadModule,
    SaludModule,
    AuthModule,
    PiezasModule,
    UbicacionesModule,
    PortalModule,
    QrModule,
  ],
  // el orden importa: primero se identifica al usuario y después se revisa su rol
  providers: [
    { provide: APP_GUARD, useClass: GuardiaJwt },
    { provide: APP_GUARD, useClass: GuardiaRoles },
  ],
})
export class AppModule {}
