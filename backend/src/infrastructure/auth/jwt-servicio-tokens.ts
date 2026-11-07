import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomBytes } from 'node:crypto';
import { PayloadAcceso, ServicioTokens } from '../../application/auth/ports/servicio-tokens';
import { ROLES_USUARIO, RolUsuario } from '../../domain/usuarios/rol-usuario';
import { Configuracion, duracionAMilisegundos } from '../config/configuracion';

interface ClaimsAcceso {
  sub?: unknown;
  correo?: unknown;
  rol?: unknown;
}

@Injectable()
export class JwtServicioTokens implements ServicioTokens {
  private readonly secretoRefresco: string;
  private readonly duracionRefresco: number;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<Configuracion, true>,
  ) {
    this.secretoRefresco = config.get('JWT_REFRESH_SECRET', { infer: true });
    this.duracionRefresco = duracionAMilisegundos(config.get('JWT_REFRESH_TTL', { infer: true }));
  }

  firmarAcceso(payload: PayloadAcceso): Promise<string> {
    return this.jwt.signAsync({ sub: payload.sub, correo: payload.correo, rol: payload.rol });
  }

  async verificarAcceso(token: string): Promise<PayloadAcceso> {
    const claims = await this.jwt.verifyAsync<ClaimsAcceso>(token);
    if (typeof claims.sub !== 'string' || typeof claims.correo !== 'string' || !esRol(claims.rol)) {
      throw new Error('El token de acceso no tiene los claims esperados.');
    }
    return { sub: claims.sub, correo: claims.correo, rol: claims.rol };
  }

  generarRefresco(): string {
    return randomBytes(48).toString('base64url');
  }

  hashRefresco(token: string): string {
    return createHmac('sha256', this.secretoRefresco).update(token).digest('hex');
  }

  duracionRefrescoMs(): number {
    return this.duracionRefresco;
  }
}

function esRol(valor: unknown): valor is RolUsuario {
  return typeof valor === 'string' && (ROLES_USUARIO as readonly string[]).includes(valor);
}
