import { HasherContrasenas } from '../../src/application/auth/ports/hasher-contrasenas';
import { PayloadAcceso, ServicioTokens } from '../../src/application/auth/ports/servicio-tokens';

export class HasherContrasenasFalso implements HasherContrasenas {
  hash(contrasena: string): Promise<string> {
    return Promise.resolve(`hash(${contrasena})`);
  }

  comparar(contrasena: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hash(${contrasena})`);
  }
}

export class ServicioTokensFalso implements ServicioTokens {
  private contador = 0;
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

  generarRefresco(): string {
    this.contador += 1;
    return `refresco-${this.contador}`;
  }

  hashRefresco(token: string): string {
    return `hash(${token})`;
  }

  duracionRefrescoMs(): number {
    return this.duracionRefresco;
  }
}
