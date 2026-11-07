import { HasherContrasenas } from '../../src/application/auth/ports/hasher-contrasenas';
import {
  PayloadAcceso,
  PayloadRefresco,
  ServicioTokens,
} from '../../src/application/auth/ports/servicio-tokens';

export class HasherContrasenasFalso implements HasherContrasenas {
  hash(contrasena: string): Promise<string> {
    return Promise.resolve(`hash(${contrasena})`);
  }

  comparar(contrasena: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hash(${contrasena})`);
  }
}

export class ServicioTokensFalso implements ServicioTokens {
  readonly duracionRefresco = 60_000;

  firmarAcceso(payload: PayloadAcceso): Promise<string> {
    return Promise.resolve(`acceso:${payload.sub}:${payload.rol}`);
  }

  verificarAcceso(token: string): Promise<PayloadAcceso> {
    const [, sub, rol] = token.split(':');
    if (!sub || !rol) return Promise.reject(new Error('token inválido'));
    return Promise.resolve({
      sub,
      correo: `${sub}@prueba.local`,
      rol: rol as PayloadAcceso['rol'],
    });
  }

  firmarRefresco(payload: PayloadRefresco): Promise<string> {
    return Promise.resolve(`refresco:${payload.sub}:${payload.jti}`);
  }

  verificarRefresco(token: string): Promise<PayloadRefresco> {
    const [tipo, sub, jti] = token.split(':');
    if (tipo !== 'refresco' || !sub || !jti) return Promise.reject(new Error('token inválido'));
    return Promise.resolve({ sub, jti });
  }

  duracionRefrescoMs(): number {
    return this.duracionRefresco;
  }
}
