import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { HasherContrasenas } from '../../application/auth/ports/hasher-contrasenas';

export const RONDAS_BCRYPT = 12;

@Injectable()
export class BcryptHasherContrasenas implements HasherContrasenas {
  hash(contrasena: string): Promise<string> {
    return hash(contrasena, RONDAS_BCRYPT);
  }

  comparar(contrasena: string, hashGuardado: string): Promise<boolean> {
    return compare(contrasena, hashGuardado);
  }
}
