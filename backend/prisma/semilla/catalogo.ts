// Material histórico de dominio público para la demo. Nada de esto es del CLENA: cada pieza dice de
// dónde salió el original. Las ubicaciones físicas sí son inventadas (son las del archivo de la demo).
import type { EstadoPieza, TipoPieza } from '@prisma/client';

export interface UbicacionSemilla {
  deposito: string;
  estanteria: string;
  caja: string;
  descripcion: string;
}

export const ubicaciones: UbicacionSemilla[] = [
  ['Depósito A', 'Estantería 1', 'Caja 01', 'Fotografía: estereografías de Barranquilla'],
  ['Depósito A', 'Estantería 1', 'Caja 02', 'Fotografía: vistas urbanas y aviación'],
  ['Depósito A', 'Estantería 2', 'Caja 01', 'Planoteca: planos de la ciudad'],
  ['Depósito A', 'Estantería 2', 'Caja 02', 'Documentos políticos'],
  ['Depósito B', 'Estantería 1', 'Caja 01', 'Prensa del siglo XIX: El Promotor'],
  ['Depósito B', 'Estantería 1', 'Caja 02', 'Prensa del siglo XIX: otros títulos'],
  ['Depósito B', 'Estantería 2', 'Caja 01', 'Prensa del siglo XX'],
  ['Depósito B', 'Estantería 2', 'Caja 02', 'Publicaciones oficiales del Atlántico'],
  ['Depósito C', 'Estantería 1', 'Caja 01', 'Publicaciones oficiales de la Nación'],
  ['Depósito C', 'Estantería 1', 'Caja 02', 'Revistas académicas'],
].map(([deposito, estanteria, caja, descripcion]) => ({
  deposito,
  estanteria,
  caja,
  descripcion: `Ubicación de la demo. ${descripcion}.`,
}));

export interface PiezaSemilla {
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number | null;
  restringida: boolean;
  ubicacion: number; // índice en `ubicaciones`
  descripcion: string;
  /** Referencia del original, en estilo APA. Se agrega al final de la descripción. */
  cita: string;
  autor: string;
  tema: string;
  palabrasClave: string[];
  /** Nombre del archivo en prisma/semilla/archivos. */
  archivo: string;
  /** HU-23: si está EN_REVISION, ya tiene como revisora a revisora@mda.local. */
  asignadoARevisora?: boolean;
}

const COMMONS = 'https://commons.wikimedia.org/wiki/File:';
const LOC = 'https://www.loc.gov/pictures/resource/';
const BABEL = 'https://babel.banrepcultural.org/digital/collection/p17054coll26/id/';
const ARCHIVE = 'https://archive.org/details/';

const UNDERWOOD = 'Underwood & Underwood';
const estereografia = (numero: string, titulo: string, id: string) =>
  `${UNDERWOOD}. (ca. 1910). ${numero}—${titulo} [Estereografía]. Library of Congress, Prints and Photographs Division. ${LOC}stereo.${id}/. Sin restricciones conocidas de publicación.`;

export const piezas: PiezaSemilla[] = [
  {
    codigo: 'MDA-2026-0001',
    titulo: 'Plan de Barranquilla (1931), hoja de firmas',
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1931,
    restringida: true,
    ubicacion: 3,
    descripcion:
      'Última hoja del Plan de Barranquilla, el programa que firmaron el 22 de marzo de 1931 exiliados venezolanos, entre ellos Rómulo Betancourt, contra la dictadura de Juan Vicente Gómez. Se ve el cierre del punto VIII y las firmas. Restringida mientras se confirman los derechos de reproducción.',
    cita: `Betancourt, R., et al. (1931, 22 de marzo). Plan de Barranquilla [Manuscrito]. Wikimedia Commons. ${COMMONS}Plan_de_Barranquilla_1931.jpg. Derechos por confirmar.`,
    autor: 'Rómulo Betancourt y otros firmantes',
    tema: 'Política',
    palabrasClave: ['plan de barranquilla', 'venezuela', 'exilio', 'manifiesto'],
    archivo: '1931-plan-de-barranquilla.jpg',
  },
  {
    codigo: 'MDA-2026-0002',
    titulo: 'El Promotor, n.º 535 (11 de junio de 1881)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1881,
    restringida: false,
    ubicacion: 4,
    descripcion:
      'Edición del sábado 11 de junio de 1881 (año XI) de El Promotor, semanario que se presentaba como «órgano de los intereses comerciales de Barranquilla», editado por Domingo G. Rubio. Cuatro páginas con noticias del comercio y del puerto, y avisos.',
    cita: `El Promotor. (1881, 11 de junio). El Promotor, año XI, n.º 535 [Periódico]. Barranquilla. Biblioteca Virtual del Banco de la República. ${BABEL}5836. Dominio público.`,
    autor: 'Domingo G. Rubio (editor)',
    tema: 'Comercio y puerto',
    palabrasClave: ['el promotor', 'prensa', 'comercio', 'siglo xix'],
    archivo: '1881-06-11-el-promotor-535.pdf',
  },
  {
    codigo: 'MDA-2026-0003',
    titulo: 'Diario Oficial, n.º 15909 (2 de octubre de 1916)',
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1916,
    restringida: false,
    ubicacion: 8,
    descripcion:
      'Ejemplar del lunes 2 de octubre de 1916 (año LII) del Diario Oficial de la República de Colombia, con decretos y resoluciones del Poder Ejecutivo, entre ellos el Decreto 1601 de 1916, que fija condiciones para expedir diplomas de bachiller. Se cargan las 8 páginas de este número.',
    cita: `República de Colombia. (1916, 2 de octubre). Diario Oficial, año LII, n.º 15909. Bogotá. University of Illinois Library, vía Internet Archive. ${ARCHIVE}diariooficial1916colo. Dominio público.`,
    autor: 'República de Colombia',
    tema: 'Gobierno y leyes',
    palabrasClave: ['diario oficial', 'decretos', 'educación', 'bachillerato'],
    archivo: '1916-10-02-diario-oficial-15909.pdf',
  },
  {
    codigo: 'MDA-2026-0004',
    titulo: 'Biblioteca de Señoritas, índice general (1858-1859)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1858,
    restringida: false,
    ubicacion: 5,
    descripcion:
      'Índice general de la primera serie (212 páginas) de Biblioteca de Señoritas, periódico literario de Bogotá. Lista, número por número, poesías, cuentos, la sección «Revista» y artículos como «Frai Luis de León».',
    cita: `Biblioteca de Señoritas. (1858). Biblioteca de Señoritas: índice general, primera serie. Bogotá. Biblioteca Virtual del Banco de la República. ${BABEL}3249. Dominio público.`,
    autor: 'Biblioteca de Señoritas',
    tema: 'Literatura',
    palabrasClave: ['literatura', 'mujeres', 'bogotá', 'siglo xix'],
    archivo: '1858-biblioteca-de-senoritas-indice.pdf',
  },
  {
    codigo: 'MDA-2026-0005',
    titulo: 'Plano de Barranquilla, Departamento del Atlántico',
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: null,
    restringida: false,
    ubicacion: 2,
    descripcion:
      'Plano a color de la ciudad junto al río Magdalena, con un cuadro de direcciones: Banco Dugand, Aduana, Estación del Ferrocarril, Agencia Postal, Telégrafo, los teatros Municipal, Cisneros y Colombia, y los hoteles del centro. Editado por Ernest Thevenin y litografiado en París. El plano no trae fecha.',
    cita: `Thevenin, E. (Ed.). (s. f.). Plano de Barranquilla, Departamento del Atlántico, Colombia (Sur América) [Plano]. Bibliothèque nationale de France, vía Wikimedia Commons. ${COMMONS}Mapa_de_Barranquilla_de_Ernest_Thevenin.png. Dominio público.`,
    autor: 'Ernest Thevenin (editor)',
    tema: 'Cartografía',
    palabrasClave: ['plano', 'mapa', 'río magdalena', 'teatros', 'hoteles'],
    archivo: 'plano-barranquilla-thevenin.jpg',
  },
  {
    codigo: 'MDA-2026-0006',
    titulo: 'Heraldo de la Costa, n.º 14 (19 de abril de 1915)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1915,
    restringida: false,
    ubicacion: 6,
    descripcion:
      'Año I, número 14, edición de la tarde del lunes 19 de abril de 1915. Diario de Barranquilla cuyo director-redactor era Alejandro Cervera. Cuatro páginas con noticias y avisos de comerciantes importadores y exportadores.',
    cita: `Heraldo de la Costa. (1915, 19 de abril). Heraldo de la Costa, año I, n.º 14 [Periódico]. Barranquilla. Biblioteca Virtual del Banco de la República. ${BABEL}5521. Dominio público.`,
    autor: 'Alejandro Cervera (director)',
    tema: 'Prensa local',
    palabrasClave: ['heraldo de la costa', 'prensa', 'comercio', 'avisos'],
    archivo: '1915-04-19-heraldo-de-la-costa-14.pdf',
  },
  {
    codigo: 'MDA-2026-0007',
    titulo: 'Anales de la Asamblea Departamental, n.º 3 (27 de abril de 1941)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1941,
    restringida: false,
    ubicacion: 7,
    descripcion:
      'Serie 1, número 3 de los Anales de la Asamblea Departamental del Atlántico, impresos en la Imprenta Departamental y dirigidos por Ramiro Rodríguez P. Lista los dignatarios (presidente Luis Alberto Rebolledo, secretario Julio Hoenigsberg) y el trámite de proyectos de ordenanza.',
    cita: `Asamblea Departamental del Atlántico. (1941, 27 de abril). Anales de la Asamblea Departamental, serie 1, n.º 3. Barranquilla: Imprenta Departamental. Biblioteca Virtual del Banco de la República. ${BABEL}5941. Dominio público.`,
    autor: 'Asamblea Departamental del Atlántico',
    tema: 'Gobierno departamental',
    palabrasClave: ['asamblea', 'ordenanzas', 'atlántico', 'actas'],
    archivo: '1941-04-27-anales-asamblea-atlantico-3.pdf',
  },
  {
    codigo: 'MDA-2026-0008',
    titulo: 'Boletín de Historia y Antigüedades, n.º 85 (1912)',
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1912,
    restringida: false,
    ubicacion: 9,
    descripcion:
      'Año VIII, número 85 del órgano de la Academia Nacional de Historia, dirigido por Pedro M. Ibáñez. Abre con el discurso de Luis Alejandro Caro en homenaje a don Ignacio Gutiérrez Vergara. Se cargan las primeras 12 páginas del volumen.',
    cita: `Academia Nacional de Historia. (1912). Boletín de Historia y Antigüedades, año VIII, n.º 85. Bogotá. University of Toronto Library, vía Internet Archive. ${ARCHIVE}boletndehistor08colouoft. Dominio público.`,
    autor: 'Academia Nacional de Historia',
    tema: 'Historia de Colombia',
    palabrasClave: ['academia de historia', 'boletín', 'discurso', 'biografía'],
    archivo: '1912-boletin-historia-antiguedades-85.pdf',
  },
  {
    codigo: 'MDA-2026-0009',
    titulo: 'Azul, revista mensual, n.º 2 (1925)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1925,
    restringida: false,
    ubicacion: 6,
    descripcion:
      'Número 2 de Azul, «revista mensual de ciencias, literatura y variedades» publicada en Pasto entre julio de 1925 y febrero de 1926. Se cargan las primeras 8 páginas, con avisos como el de la Farmacia y Droguería Internacional del Dr. J. M. Salazar A. & Co.',
    cita: `Azul. (1925). Azul: revista mensual de ciencias, literatura y variedades, n.º 2. Pasto. Biblioteca Virtual del Banco de la República. ${BABEL}7476. Dominio público.`,
    autor: 'Azul (revista)',
    tema: 'Literatura y variedades',
    palabrasClave: ['revista', 'literatura', 'pasto', 'avisos'],
    archivo: '1925-azul-revista-2.pdf',
  },
  {
    codigo: 'MDA-2026-0010',
    titulo: 'El Promotor, n.º 592 (15 de julio de 1882)',
    tipo: 'PERIODICO',
    estado: 'PUBLICADA',
    anio: 1882,
    restringida: false,
    ubicacion: 4,
    descripcion:
      'Edición del sábado 15 de julio de 1882 (año XII, trimestre III) de El Promotor, «órgano de los intereses comerciales de Barranquilla». Cuatro páginas.',
    cita: `El Promotor. (1882, 15 de julio). El Promotor, año XII, n.º 592 [Periódico]. Barranquilla. Biblioteca Virtual del Banco de la República. ${BABEL}5837. Dominio público.`,
    autor: 'El Promotor',
    tema: 'Comercio y puerto',
    palabrasClave: ['el promotor', 'prensa', 'comercio', 'siglo xix'],
    archivo: '1882-07-15-el-promotor-592.pdf',
  },
  {
    codigo: 'MDA-2026-0011',
    titulo: 'Hangar de la CCNA en Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1920,
    restringida: false,
    ubicacion: 1,
    descripcion:
      'Hangar de madera de la Compañía Colombiana de Navegación Aérea (CCNA) en Barranquilla, con un automóvil y personal frente a la entrada, en los primeros años de la aviación en Colombia.',
    cita: `Autor desconocido. (1920). Hangar de CCNA en Barranquilla [Fotografía]. Wikimedia Commons. ${COMMONS}Hangar_de_CCNA_en_Barranquilla_1920.jpg. Dominio público.`,
    autor: 'Autor desconocido',
    tema: 'Aviación',
    palabrasClave: ['aviación', 'hangar', 'ccna', 'transporte'],
    archivo: '1920-hangar-ccna.jpg',
  },
  {
    codigo: 'MDA-2026-0012',
    titulo: 'Un escenario colombiano para «Romeo y Julieta», Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía n.º 11514: un hombre de sombrero conversa junto a la ventana enrejada de una casa, al lado de una cerca de cañas. Fecha aproximada.',
    cita: estereografia(
      '11514',
      'A Colombian setting for "Romeo and Juliet", Barranquilla, Colombia, S. A.',
      '1s19898',
    ),
    autor: UNDERWOOD,
    tema: 'Vida cotidiana',
    palabrasClave: ['estereografía', 'ventana', 'casa', 'costumbres'],
    archivo: '1910-romeo-y-julieta-barranquilla.jpg',
  },
  {
    codigo: 'MDA-2026-0013',
    titulo: 'Día de lavado en el río Magdalena, cerca de Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía de un grupo de personas lavando ropa con el agua a la cintura en la orilla del río Magdalena, con canoas y vegetación al fondo. Fecha aproximada.',
    cita: `Autor desconocido. (ca. 1910). A Colombian washing day, along the Magdalena River near Barranquilla [Estereografía]. Library of Congress, Prints and Photographs Division. ${LOC}cph.3f06441/. Sin restricciones conocidas de publicación.`,
    autor: 'Autor desconocido',
    tema: 'Río Magdalena',
    palabrasClave: ['río magdalena', 'lavanderas', 'estereografía', 'oficios'],
    archivo: '1910-dia-de-lavado-rio-magdalena.jpg',
  },
  {
    codigo: 'MDA-2026-0014',
    titulo: 'Desgranando fríjoles en el patio de una casa humilde',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía n.º 11513: niños y una mujer desgranan fríjoles para la cena en el patio de una casa de Barranquilla, sentados en sillas de madera. Fecha aproximada.',
    cita: estereografia(
      '11513',
      'Shelling beans for dinner in the yard of a humble Colombian home, Barranquilla',
      '1s19899',
    ),
    autor: UNDERWOOD,
    tema: 'Vida cotidiana',
    palabrasClave: ['estereografía', 'infancia', 'cocina', 'patio'],
    archivo: '1910-desgranando-frijoles.jpg',
  },
  {
    codigo: 'MDA-2026-0015',
    titulo: 'Una residencia y una escena típica de calle en Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía n.º 11494 de Underwood & Underwood: una casa de arcos y columnas frente a la calle, con carretas de mulas, burros cargados y vecinos a la sombra. Fecha aproximada.',
    cita: `${UNDERWOOD}. (ca. 1910). 11494—A fine residence and typical street scene of Barranquilla, Colombia [Estereografía]. Wikimedia Commons. ${COMMONS}Barranquilla_casa_1910.jpg. Dominio público.`,
    autor: UNDERWOOD,
    tema: 'Vida cotidiana',
    palabrasClave: ['estereografía', 'arquitectura', 'carretas', 'calle'],
    archivo: '1910-residencia-y-calle-barranquilla.jpg',
  },
  {
    codigo: 'MDA-2026-0016',
    titulo: 'Antiguo Camellón Abello, Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1903,
    restringida: false,
    ubicacion: 1,
    descripcion:
      'El Camellón Abello, el paseo que después fue el Paseo de Bolívar, lleno de transeúntes y coches de caballos, con faroles y casas de balcón del centro de Barranquilla.',
    cita: `Autor desconocido. (1903). Antiguo Camellón Abello (Barranquilla) [Fotografía]. Wikimedia Commons. ${COMMONS}Antiguo_Camellón_Abello_(Barranquilla,_1903).jpg. Dominio público.`,
    autor: 'Autor desconocido',
    tema: 'Espacio urbano',
    palabrasClave: ['camellón abello', 'paseo bolívar', 'centro', 'coches de caballos'],
    archivo: '1903-camellon-abello.jpg',
  },
  {
    codigo: 'MDA-2026-0017',
    titulo: 'Vista hacia el norte sobre Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'REVISADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía n.º 11511: vista desde lo alto hacia el norte, sobre los techos y patios interiores de las casas de estilo español del centro. Fecha aproximada.',
    cita: estereografia(
      '11511',
      'North over Barranquilla, quaint city of Spanish houses with inner courts, Colombia, S. A.',
      '1s19901',
    ),
    autor: UNDERWOOD,
    tema: 'Espacio urbano',
    palabrasClave: ['estereografía', 'panorámica', 'arquitectura', 'centro'],
    archivo: '1910-vista-al-norte-barranquilla.jpg',
  },
  {
    codigo: 'MDA-2026-0018',
    titulo: 'El Promotor, n.º 616 (30 de diciembre de 1882)',
    tipo: 'PERIODICO',
    estado: 'REVISADA',
    anio: 1882,
    restringida: false,
    ubicacion: 4,
    descripcion:
      'Última edición de 1882 (sábado 30 de diciembre, año XII, trimestre IV) de El Promotor, «órgano de los intereses comerciales de Barranquilla». Cuatro páginas.',
    cita: `El Promotor. (1882, 30 de diciembre). El Promotor, año XII, n.º 616 [Periódico]. Barranquilla. Biblioteca Virtual del Banco de la República. ${BABEL}5838. Dominio público.`,
    autor: 'El Promotor',
    tema: 'Comercio y puerto',
    palabrasClave: ['el promotor', 'prensa', 'comercio', 'siglo xix'],
    archivo: '1882-12-30-el-promotor-616.pdf',
  },
  {
    codigo: 'MDA-2026-0019',
    titulo: 'Boletín de Historia y Antigüedades, n.º 97 (1913)',
    tipo: 'DOCUMENTO',
    estado: 'REVISADA',
    anio: 1913,
    restringida: false,
    ubicacion: 9,
    descripcion:
      'Año IX, número 97 del órgano de la Academia Nacional de Historia. Trae la biografía del general Agustín Codazzi, quien dirigió la Comisión Corográfica. Se cargan las primeras 12 páginas del volumen.',
    cita: `Academia Nacional de Historia. (1913). Boletín de Historia y Antigüedades, año IX, n.º 97. Bogotá. University of Toronto Library, vía Internet Archive. ${ARCHIVE}boletndehistor09colouoft. Dominio público.`,
    autor: 'Academia Nacional de Historia',
    tema: 'Historia de Colombia',
    palabrasClave: ['academia de historia', 'codazzi', 'biografía', 'cartografía'],
    archivo: '1913-boletin-historia-antiguedades-97.pdf',
  },
  {
    codigo: 'MDA-2026-0020',
    titulo: 'Mujeres pilando maíz en el patio de una casa',
    tipo: 'FOTOGRAFIA',
    estado: 'ESCANEADA',
    anio: 1910,
    restringida: false,
    ubicacion: 0,
    descripcion:
      'Estereografía n.º 11519: dos mujeres pilan maíz para hacer pan en el patio de una casa de Barranquilla, junto a una pared de bahareque. Fecha aproximada.',
    cita: estereografia(
      '11519',
      'Women pounding corn for bread in the yard of a Barranquilla home, S. A.',
      '1s19905',
    ),
    autor: UNDERWOOD,
    tema: 'Vida cotidiana',
    palabrasClave: ['estereografía', 'maíz', 'pilón', 'oficios'],
    archivo: '1910-pilando-maiz.jpg',
    asignadoARevisora: true,
  },
  {
    codigo: 'MDA-2026-0021',
    titulo: 'Anales de la Asamblea Departamental, n.º 13 (22 de mayo de 1941)',
    tipo: 'PERIODICO',
    estado: 'ESCANEADA',
    anio: 1941,
    restringida: false,
    ubicacion: 7,
    descripcion:
      'Serie 1, número 13. Dignatarios: presidente José María Fernández Llinás, vicepresidente Osvaldo Consuegra, secretario Julio Hoenigsberg. Contiene la conclusión del Acta número 20. Ocho páginas.',
    cita: `Asamblea Departamental del Atlántico. (1941, 22 de mayo). Anales de la Asamblea Departamental del Atlántico, serie 1, n.º 13. Barranquilla: Imprenta Departamental. Biblioteca Virtual del Banco de la República. ${BABEL}5946. Dominio público.`,
    autor: 'Asamblea Departamental del Atlántico',
    tema: 'Gobierno departamental',
    palabrasClave: ['asamblea', 'actas', 'atlántico', 'ordenanzas'],
    archivo: '1941-05-22-anales-asamblea-atlantico-13.pdf',
  },
  {
    codigo: 'MDA-2026-0022',
    titulo: 'Boletín de Historia y Antigüedades, n.º 109 (1916)',
    tipo: 'DOCUMENTO',
    estado: 'ESCANEADA',
    anio: 1916,
    restringida: false,
    ubicacion: 9,
    descripcion:
      'Año X, número 109 del órgano de la Academia Nacional de Historia, dirigido por Pedro M. Ibáñez. Se cargan las primeras 12 páginas del número.',
    cita: `Academia Nacional de Historia. (1916). Boletín de Historia y Antigüedades, año X, n.º 109. Bogotá. University of Toronto Library, vía Internet Archive. ${ARCHIVE}boletndehistor10colouoft. Dominio público.`,
    autor: 'Academia Nacional de Historia',
    tema: 'Historia de Colombia',
    palabrasClave: ['academia de historia', 'boletín', 'centenarios'],
    archivo: '1916-boletin-historia-antiguedades-109.pdf',
  },
  // Las dos últimas quedan REGISTRADAS sin escaneo: su archivo está listo para probar HU-09.
  {
    codigo: 'MDA-2026-0023',
    titulo: 'Escena pintoresca en las calles de Barranquilla',
    tipo: 'FOTOGRAFIA',
    estado: 'REGISTRADA',
    anio: 1915,
    restringida: false,
    ubicacion: 1,
    descripcion:
      'Estereografía n.º 21873 de la Keystone View Company: calle del centro con balcones de madera, faroles y transeúntes. Fecha aproximada.',
    cita: `Keystone View Company. (ca. 1915). 21873—Quaint scene in streets of Barranquilla, Colombia, South America [Estereografía]. Library of Congress, Prints and Photographs Division. ${LOC}stereo.1s19911/. Sin restricciones conocidas de publicación.`,
    autor: 'Keystone View Company',
    tema: 'Espacio urbano',
    palabrasClave: ['estereografía', 'balcones', 'calle', 'centro'],
    archivo: '1915-calle-de-barranquilla-keystone.jpg',
  },
  {
    codigo: 'MDA-2026-0024',
    titulo: 'El Promotor (11 de septiembre de 1897)',
    tipo: 'PERIODICO',
    estado: 'REGISTRADA',
    anio: 1897,
    restringida: false,
    ubicacion: 4,
    descripcion:
      'Edición del sábado 11 de septiembre de 1897 (año XXVI, trimestre III) de El Promotor, «órgano de los intereses comerciales de Barranquilla». El ejemplar tiene roturas en la cabecera.',
    cita: `El Promotor. (1897, 11 de septiembre). El Promotor, año XXVI [Periódico]. Barranquilla. Biblioteca Virtual del Banco de la República. ${BABEL}5839. Dominio público.`,
    autor: 'El Promotor',
    tema: 'Comercio y puerto',
    palabrasClave: ['el promotor', 'prensa', 'comercio', 'siglo xix'],
    archivo: '1897-09-11-el-promotor.pdf',
  },
];
