import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import {
  AlmacenArchivos,
  ContenidoAlmacenado,
  LectorArchivos,
} from '../../application/archivos/puertos';
import { Configuracion } from '../config/configuracion';

/** Guarda los escaneos en STORAGE_DIR (un volumen de Docker) con un nombre que no se adivina. */
@Injectable()
export class AlmacenArchivosDisco implements AlmacenArchivos, LectorArchivos {
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

  async borrar(ruta: string): Promise<void> {
    const absoluta = this.dentroDeLaRaiz(ruta);
    if (!absoluta) return;
    await rm(absoluta, { force: true });
  }

  async abrir(ruta: string): Promise<ContenidoAlmacenado | null> {
    const absoluta = this.dentroDeLaRaiz(ruta);
    if (!absoluta) return null;
    try {
      const info = await stat(absoluta);
      if (!info.isFile()) return null;
      return { flujo: createReadStream(absoluta), tamanoBytes: info.size };
    } catch {
      // la fila existe pero el volumen se borró o se movió
      return null;
    }
  }

  /** Nunca lee ni borra fuera de la carpeta de almacenamiento. */
  private dentroDeLaRaiz(ruta: string): string | null {
    const absoluta = resolve(this.raiz, ruta);
    return absoluta.startsWith(this.raiz + sep) ? absoluta : null;
  }
}
