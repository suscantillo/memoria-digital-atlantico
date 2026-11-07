import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  PayloadAcceso,
  PayloadRefresco,
  ServicioTokens,
} from '../../application/auth/ports/servicio-tokens';
import { ROLES_USUARIO, RolUsuario } from '../../domain/usuarios/rol-usuario';
import { Configuracion, duracionAMilisegundos } from '../config/configuracion';

interface Claims {
  sub?: unknown;
  correo?: unknown;
  rol?: unknown;
  jti?: unknown;
}

@Injectable()
export class JwtServicioTokens implements ServicioTokens {
  private readonly secretoRefresco: string;
  private readonly ttlRefresco: string;
  private readonly duracionRefresco: number;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<Configuracion, true>,
  ) {
    this.secretoRefresco = config.get('JWT_REFRESH_SECRET', { infer: true });
    this.ttlRefresco = config.get('JWT_REFRESH_TTL', { infer: true });
    this.duracionRefresco = duracionAMilisegundos(this.ttlRefresco);
  }

  firmarAcceso(payload: PayloadAcceso): Promise<string> {
    return this.jwt.signAsync({ sub: payload.sub, correo: payload.correo, rol: payload.rol });
  }

  async verificarAcceso(token: string): Promise<PayloadAcceso> {
    const claims = await this.jwt.verifyAsync<Claims>(token);
    if (typeof claims.sub !== 'string' || typeof claims.correo !== 'string' || !esRol(claims.rol)) {
      throw new Error('El token de acceso no tiene los claims esperados.');
    }
    return { sub: claims.sub, correo: claims.correo, rol: claims.rol };
  }

  firmarRefresco(payload: PayloadRefresco): Promise<string> {
    return this.jwt.signAsync(
      { sub: payload.sub },
      { secret: this.secretoRefresco, expiresIn: this.ttlRefresco, jwtid: payload.jti },
    );
  }

  async verificarRefresco(token: string): Promise<PayloadRefresco> {
    const claims = await this.jwt.verifyAsync<Claims>(token, { secret: this.secretoRefresco });
    if (typeof claims.sub !== 'string' || typeof claims.jti !== 'string') {
      throw new Error('El token de refresco no tiene los claims esperados.');
    }
    return { sub: claims.sub, jti: claims.jti };
  }

  duracionRefrescoMs(): number {
    return this.duracionRefresco;
  }
}

function esRol(valor: unknown): valor is RolUsuario {
  return typeof valor === 'string' && (ROLES_USUARIO as readonly string[]).includes(valor);
}
