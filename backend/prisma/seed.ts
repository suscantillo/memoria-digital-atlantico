// Datos de prueba ficticios. Se puede ejecutar varias veces (upsert).
import { EstadoPieza, PrismaClient, RolUsuario, TipoPieza } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
const RONDAS_BCRYPT = 12;
const MARCA_PRUEBA = '[DATOS DE PRUEBA]';

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
  {
    nombre: 'Visitante registrado de prueba',
    correo: 'publico@mda.local',
    rol: 'PUBLICO',
    contrasena: process.env.SEED_PUBLICO_PASSWORD ?? 'Publico.2026',
  },
];

const ubicaciones = [
  { deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 01' },
  { deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 02' },
  { deposito: 'Depósito A', estanteria: 'Estantería 2', caja: 'Caja 01' },
  { deposito: 'Depósito B', estanteria: 'Estantería 1', caja: 'Caja 01' },
].map((u) => ({ ...u, descripcion: `${MARCA_PRUEBA} Ubicación ficticia para la demo.` }));

interface PiezaSemilla {
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number;
  restringida: boolean;
  ubicacion: number; // índice en `ubicaciones`
}

const piezas: PiezaSemilla[] = [
  {
    codigo: 'MDA-2026-0001',
    titulo: 'Acta ficticia de fundación de un cabildo',
    tipo: 'DOCUMENTO',
    estado: 'REGISTRADA',
    anio: 1888,
    restringida: false,
    ubicacion: 0,
  },
  {
    codigo: 'MDA-2026-0002',
    titulo: 'Carta ficticia de un comerciante del puerto',
    tipo: 'DOCUMENTO',
    estado: 'ESCANEADA',
    anio: 1902,
    restringida: false,
    ubicacion: 0,
  },
  {
    codigo: 'MDA-2026-0003',
    titulo: 'Fotografía ficticia del malecón',
    tipo: 'FOTOGRAFIA',
    estado: 'REVISADA',
    anio: 1935,
    restringida: false,
    ubicacion: 1,
  },
  {
    codigo: 'MDA-2026-0004',
    titulo: 'Fotografía ficticia de una fábrica textil',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1948,
    restringida: false,
    ubicacion: 1,
  },
  {
    codigo: 'MDA-2026-0005',
    titulo: 'Periódico ficticio "El Faro del Río", edición 12',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1921,
    restringida: false,
    ubicacion: 2,
  },
  {
    codigo: 'MDA-2026-0006',
    titulo: 'Periódico ficticio "La Brisa", edición 301',
    tipo: 'PERIODICO',
    estado: 'ESCANEADA',
    anio: 1957,
    restringida: false,
    ubicacion: 2,
  },
  {
    codigo: 'MDA-2026-0007',
    titulo: 'Expediente ficticio de un juicio civil',
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1911,
    restringida: true,
    ubicacion: 3,
  },
  {
    codigo: 'MDA-2026-0008',
    titulo: 'Retrato ficticio de una familia de inmigrantes',
    tipo: 'FOTOGRAFIA',
    estado: 'REGISTRADA',
    anio: 1929,
    restringida: true,
    ubicacion: 3,
  },
  {
    codigo: 'MDA-2026-0009',
    titulo: 'Plano ficticio de un tranvía',
    tipo: 'DOCUMENTO',
    estado: 'REVISADA',
    anio: 1890,
    restringida: false,
    ubicacion: 0,
  },
  {
    codigo: 'MDA-2026-0010',
    titulo: 'Periódico ficticio "El Faro del Río", edición 13',
    tipo: 'PERIODICO',
    estado: 'REGISTRADA',
    anio: 1921,
    restringida: false,
    ubicacion: 2,
  },
  {
    codigo: 'MDA-2026-0011',
    titulo: 'Fotografía ficticia de una comparsa de carnaval',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1946,
    restringida: false,
    ubicacion: 2,
  },
];

async function sembrarUsuarios(): Promise<Map<RolUsuario, string>> {
  const ids = new Map<RolUsuario, string>();
  for (const u of usuarios) {
    const contrasenaHash = await hash(u.contrasena, RONDAS_BCRYPT);
    const fila = await prisma.usuario.upsert({
      where: { correo: u.correo },
      create: { nombre: u.nombre, correo: u.correo, rol: u.rol, contrasenaHash },
      update: { nombre: u.nombre, rol: u.rol, contrasenaHash, activo: true },
    });
    ids.set(u.rol, fila.id);
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

async function sembrarPiezas(idsUbicaciones: string[], idAdmin: string): Promise<void> {
  for (const p of piezas) {
    const datos = {
      titulo: p.titulo,
      descripcion: `${MARCA_PRUEBA} Pieza ficticia creada por la semilla.`,
      tipo: p.tipo,
      estado: p.estado,
      anio: p.anio,
      restringida: p.restringida,
      ubicacionId: idsUbicaciones[p.ubicacion],
    };
    const fila = await prisma.pieza.upsert({
      where: { codigo: p.codigo },
      create: { codigo: p.codigo, ...datos },
      update: datos,
    });

    const yaTieneEventos = await prisma.eventoPieza.count({ where: { piezaId: fila.id } });
    if (yaTieneEventos === 0) {
      await prisma.eventoPieza.create({
        data: {
          piezaId: fila.id,
          usuarioId: idAdmin,
          accion: 'REGISTRADA',
          detalle: `${MARCA_PRUEBA} Registro inicial por la semilla.`,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  console.log(`Sembrando datos de prueba (${MARCA_PRUEBA})...`);
  const idsUsuarios = await sembrarUsuarios();
  const idsUbicaciones = await sembrarUbicaciones();
  await sembrarPiezas(idsUbicaciones, idsUsuarios.get('ADMIN') as string);
  console.log(
    `Listo: ${usuarios.length} usuarios, ${ubicaciones.length} ubicaciones, ${piezas.length} piezas.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('La semilla falló:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
