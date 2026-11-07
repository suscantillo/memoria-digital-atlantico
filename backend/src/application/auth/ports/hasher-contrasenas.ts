export const HASHER_CONTRASENAS = Symbol('HASHER_CONTRASENAS');

export interface HasherContrasenas {
  hash(contrasena: string): Promise<string>;
  comparar(contrasena: string, hash: string): Promise<boolean>;
}
