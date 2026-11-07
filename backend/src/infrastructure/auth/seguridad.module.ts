import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HASHER_CONTRASENAS } from '../../application/auth/ports/hasher-contrasenas';
import { SERVICIO_TOKENS } from '../../application/auth/ports/servicio-tokens';
import { Configuracion } from '../config/configuracion';
import { BcryptHasherContrasenas } from './bcrypt-hasher-contrasenas';
import { JwtServicioTokens } from './jwt-servicio-tokens';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configuracion, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { expiresIn: config.get('JWT_ACCESS_TTL', { infer: true }) },
      }),
    }),
  ],
  providers: [
    { provide: SERVICIO_TOKENS, useClass: JwtServicioTokens },
    { provide: HASHER_CONTRASENAS, useClass: BcryptHasherContrasenas },
  ],
  exports: [SERVICIO_TOKENS, HASHER_CONTRASENAS],
})
export class SeguridadModule {}
