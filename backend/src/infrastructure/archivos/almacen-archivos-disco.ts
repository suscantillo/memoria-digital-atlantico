import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { AlmacenArchivos } from '../../application/archivos/puertos';
import { Configuracion } from '../config/configuracion';

/** Guarda los escaneos en STORAGE_DIR (un volumen de Docker) con un nombre que no se adivina. */
@Injectable()
export class AlmacenArchivosDisco implements AlmacenArchivos {
  private readonly raiz: string;

  constructor(config: ConfigService<Configuracion, true>) {
    this.raiz = resolve(config.get('STORAGE_DIR', { infer: true }));
  }

  async guardar(contenido: Uint8Array, extension: string): Promise<string> {
    const ahora = new Date();
    const carpeta = join(
      'escaneos',
      String(ahora.getFullYear()),
      String(ahora.getMonth() + 1).padStart(2, '0'),
    );
    await mkdir(join(this.raiz, carpeta), { recursive: true });
    const ruta = join(carpeta, `${randomUUID()}.${extension}`);
    // wx: nunca sobrescribe un archivo existente
    await writeFile(join(this.raiz, ruta), contenido, { flag: 'wx' });
    return ruta.split(sep).join('/');
  }

  async leer(ruta: string): Promise<Uint8Array | null> {
    const absoluta = resolve(this.raiz, ruta);
    if (!absoluta.startsWith(this.raiz + sep)) return null;
    try {
      return await readFile(absoluta);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async borrar(ruta: string): Promise<void> {
    const absoluta = resolve(this.raiz, ruta);
    // nunca borra fuera de la carpeta de almacenamiento
    if (!absoluta.startsWith(this.raiz + sep)) return;
    await rm(absoluta, { force: true });
  }
}
