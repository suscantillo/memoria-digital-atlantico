// Datos para la demo: cuentas de prueba y material histórico de dominio público (ver semilla/catalogo.ts).
// Se puede ejecutar varias veces: todo es upsert o "crear si falta".
import { EstadoPieza, PrismaClient, RolUsuario } from '@prisma/client';
import { hash } from 'bcryptjs';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { piezas, ubicaciones, type PiezaSemilla } from './semilla/catalogo';

const prisma = new PrismaClient();
const RONDAS_BCRYPT = 12;
const CARPETA_ARCHIVOS = join(__dirname, 'semilla', 'archivos');
const STORAGE_DIR = resolve(process.env.STORAGE_DIR ?? './storage');

interface UsuarioSemilla {
  nombre: string;
  correo: string;
  rol: RolUsuario;
  contrasena: string;
}

const usuarios: UsuarioSemilla[] = [
  {
    nombre: 'Administrador de prueba',
    correo: 'admin@mda.local',
    rol: 'ADMIN',
    contrasena: process.env.SEED_ADMIN_PASSWORD ?? 'Admin.2026',
  },
  {
    nombre: 'Personal de archivo de prueba',
    correo: 'personal@mda.local',
    rol: 'PERSONAL',
    contrasena: process.env.SEED_PERSONAL_PASSWORD ?? 'Personal.2026',
  },
  // HU-23: nadie revisa lo que subió; la revisora recibe los escaneos que carga «personal»
  {
    nombre: 'Revisora de prueba',
    correo: 'revisora@mda.local',
    rol: 'PERSONAL',
    contrasena: process.env.SEED_REVISORA_PASSWORD ?? 'Revisora.2026',
  },
  {
    nombre: 'Visitante registrado de prueba',
    correo: 'publico@mda.local',
    rol: 'PUBLICO',
    contrasena: process.env.SEED_PUBLICO_PASSWORD ?? 'Publico.2026',
  },
];

// La cuenta PUBLICO de la demo queda como si se hubiera registrado aceptando el aviso vigente.
function consentimiento(u: UsuarioSemilla) {
  return u.rol === 'PUBLICO'
    ? { consentimientoEn: new Date('2026-11-01T15:00:00.000Z'), versionPrivacidad: '1' }
    : {};
}

/** Ids de las cuentas sembradas, por correo (hay dos PERSONAL). */
async function sembrarUsuarios(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const u of usuarios) {
    const contrasenaHash = await hash(u.contrasena, RONDAS_BCRYPT);
    const fila = await prisma.usuario.upsert({
      where: { correo: u.correo },
      create: {
        nombre: u.nombre,
        correo: u.correo,
        rol: u.rol,
        contrasenaHash,
        ...consentimiento(u),
      },
      update: { nombre: u.nombre, rol: u.rol, contrasenaHash, activo: true, ...consentimiento(u) },
    });
    ids.set(u.correo, fila.id);
  }
  return ids;
}

async function sembrarUbicaciones(): Promise<string[]> {
  const ids: string[] = [];
  for (const u of ubicaciones) {
    const fila = await prisma.ubicacion.upsert({
      where: {
        deposito_estanteria_caja: { deposito: u.deposito, estanteria: u.estanteria, caja: u.caja },
      },
      create: u,
      update: { descripcion: u.descripcion },
    });
    ids.push(fila.id);
  }
  return ids;
}

// Orden del ciclo de vida: cada estado deja su evento en el historial de la pieza.
const CICLO: EstadoPieza[] = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'];
const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.pdf': 'application/pdf' };

const DETALLE_EVENTO: Record<EstadoPieza, string> = {
  REGISTRADA: 'Registro inicial (semilla de la demo).',
  ESCANEADA: 'Escaneo cargado (semilla de la demo).',
  REVISADA: 'Escaneo aprobado en control de calidad (semilla de la demo).',
  PUBLICADA: 'Publicada en el portal (semilla de la demo).',
};

function conEscaneo(p: PiezaSemilla): boolean {
  return p.estado !== 'REGISTRADA';
}

interface IdsCuentas {
  admin: string;
  personal: string;
  revisora: string;
}

async function sembrarPiezas(idsUbicaciones: string[], ids: IdsCuentas): Promise<void> {
  for (const p of piezas) {
    const escaneada = conEscaneo(p);
    const datos = {
      titulo: p.titulo,
      descripcion: `${p.descripcion} Fuente: ${p.cita}`,
      tipo: p.tipo,
      estado: p.estado,
      anio: p.anio,
      restringida: p.restringida,
      // tema, autor y palabras clave se llenan al cargar el escaneo (HU-09)
      tema: escaneada ? p.tema : null,
      autor: escaneada ? p.autor : null,
      palabrasClave: escaneada ? p.palabrasClave : [],
      ubicacionId: idsUbicaciones[p.ubicacion],
    };
    const fila = await prisma.pieza.upsert({
      where: { codigo: p.codigo },
      create: { codigo: p.codigo, ...datos },
      update: datos,
    });

    for (const estado of CICLO.slice(0, CICLO.indexOf(p.estado) + 1)) {
      const existe = await prisma.eventoPieza.count({
        where: { piezaId: fila.id, accion: estado },
      });
      if (existe === 0) {
        await prisma.eventoPieza.create({
          data: {
            piezaId: fila.id,
            usuarioId: estado === 'ESCANEADA' ? ids.personal : ids.admin,
            accion: estado,
            detalle: DETALLE_EVENTO[estado],
          },
        });
      }
    }

    if (escaneada) await sembrarArchivo(p, fila.id, ids);
  }
}

/** Copia el archivo al almacenamiento y lo registra; aprobado si la pieza ya pasó la revisión. */
async function sembrarArchivo(p: PiezaSemilla, piezaId: string, ids: IdsCuentas): Promise<void> {
  const origen = join(CARPETA_ARCHIVOS, p.archivo);
  const ruta = `semilla/${p.codigo}${extname(p.archivo)}`;
  await mkdir(join(STORAGE_DIR, 'semilla'), { recursive: true });
  // se copia siempre: el volumen pudo borrarse aunque la fila siga en la base
  await copyFile(origen, join(STORAGE_DIR, ruta));
  const { size } = await stat(origen);

  const aprobado = p.estado === 'REVISADA' || p.estado === 'PUBLICADA';
  const datos = {
    nombreOriginal: p.archivo,
    tipoMime: MIME[extname(p.archivo)],
    tamanoBytes: size,
    estado: aprobado ? ('APROBADO' as const) : ('EN_REVISION' as const),
    subidoPorId: ids.personal,
    revisadoPorId: aprobado ? ids.admin : null,
    revisadoEn: aprobado ? new Date('2026-11-10T15:00:00.000Z') : null,
    // HU-23: uno de los escaneos en revisión ya está en la cola de la revisora
    revisorAsignadoId: !aprobado && p.asignadoARevisora ? ids.revisora : null,
  };
  const existente = await prisma.archivoDigital.findFirst({
    where: { piezaId, rutaAlmacenamiento: ruta },
  });
  if (existente) {
    await prisma.archivoDigital.update({ where: { id: existente.id }, data: datos });
  } else {
    await prisma.archivoDigital.create({ data: { piezaId, rutaAlmacenamiento: ruta, ...datos } });
  }

  if (datos.revisorAsignadoId) {
    const asignada = await prisma.eventoPieza.count({
      where: { piezaId, accion: 'REVISOR_ASIGNADO' },
    });
    if (asignada === 0) {
      await prisma.eventoPieza.create({
        data: {
          piezaId,
          usuarioId: ids.admin,
          accion: 'REVISOR_ASIGNADO',
          detalle: `Revisión de «${p.archivo}» asignada a la revisora (semilla de la demo).`,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  console.log('Sembrando datos de la demo...');
  const idsUsuarios = await sembrarUsuarios();
  const idsUbicaciones = await sembrarUbicaciones();
  await sembrarPiezas(idsUbicaciones, {
    admin: idsUsuarios.get('admin@mda.local') as string,
    personal: idsUsuarios.get('personal@mda.local') as string,
    revisora: idsUsuarios.get('revisora@mda.local') as string,
  });
  const conArchivo = piezas.filter(conEscaneo).length;
  console.log(
    `Listo: ${usuarios.length} usuarios, ${ubicaciones.length} ubicaciones, ${piezas.length} piezas, ` +
      `${conArchivo} archivos en ${STORAGE_DIR}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('La semilla falló:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
