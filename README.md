# Memoria Digital del Atlántico

Sistema de inventario, digitalización y consulta pública para el Archivo Histórico del
Atlántico (CLENA, edificio de la Aduana, Barranquilla). Proyecto final del curso
**Aplicaciones Web Backend** (Universidad del Norte).

## El problema

El Archivo Histórico del Atlántico custodia documentos, fotografías y periódicos que
registran la memoria del departamento, pero su inventario se lleva en hojas de cálculo y
fichas físicas: no hay un código único por pieza, la ubicación física (depósito, estantería,
caja) se pierde cuando una pieza se mueve, y nadie sabe con certeza qué ya fue escaneado,
qué está pendiente de revisión y qué puede mostrarse al público.

Memoria Digital del Atlántico centraliza ese inventario: cada pieza recibe un código único
`MDA-AAAA-NNNN` y un QR imprimible, los escaneos pasan por un flujo de control de calidad
(en revisión, aprobado, rechazado con motivo) antes de publicarse, cada cambio queda en un
historial con quién, qué y cuándo, y un portal público permite buscar y consultar las piezas
publicadas respetando las restricciones de acceso de cada una.

## Qué hace en la entrega 1

| Funcionalidad                                    | Historias                  | Dónde se ve                                                   |
| ------------------------------------------------ | -------------------------- | ------------------------------------------------------------- |
| Inventario de piezas, con ubicación y estado     | HU-05, HU-06, HU-07, HU-08 | `/panel/inventario`, `/panel/ubicaciones`, `/panel/piezas/…`  |
| Carga de escaneos y control de calidad           | HU-09, HU-10, HU-23        | `/panel/calidad`, `/panel/escaneos`                           |
| Vínculo físico-digital por QR                    | HU-11, HU-12               | Botón de QR en el inventario, `/escanear`, `/p/{código}?qr=1` |
| Portal público para buscar y consultar           | HU-13, HU-14, HU-15        | `/`, `/explorar`, `/p/{código}`                               |
| Cuentas, sesión, roles y administración de ellas | HU-01, HU-02, HU-03, HU-17 | `/registro`, `/ingresar`, `/panel/usuarios`                   |
| Sistema de diseño                                | HU-16                      | Toda la interfaz                                              |

Quedan para la siguiente entrega: ver y eliminar la cuenta propia (HU-04), contadores de avance
(HU-18), lotes para voluntarios (HU-19), etiquetas QR por lotes (HU-20), asistente de
recomendaciones (HU-21) y diseño para celular (HU-22).

## Equipo

**Equipo de origen (Introducción a la Ingeniería, grupo 7):** Santiago Barros,
Iván Gómez, Samuel Pimienta, Juan Riaño. Repositorio: [Jrianopro20/clena-biblioteca-piloto](https://github.com/Jrianopro20/clena-biblioteca-piloto).

**Equipo de desarrollo (roles Scrum):**

| Integrante              | Usuario de GitHub                             | Rol                                               |
| ----------------------- | --------------------------------------------- | ------------------------------------------------- |
| Andrea De la Ossa       | [adela088](https://github.com/adela088)       | Product Owner                                     |
| Jesús Cantillo Guerrero | [suscantillo](https://github.com/suscantillo) | Scrum Master, Development Team (backend/frontend) |
| María Gutiérrez (Mayi)  | [Marigugo24](https://github.com/Marigugo24)   | Development Team (frontend)                       |
| Alejandro Alonso        | [Makisuky](https://github.com/Makisuky)       | Development Team (backend)                        |

## Stack

- Backend: NestJS 10 + TypeScript, Clean Architecture en cuatro capas, Prisma 6, PostgreSQL 16.
- Frontend: React 18 + TypeScript, Vite, React Router, TanStack Query, MUI 6.
- Contenedores: Docker + docker-compose, con nginx delante de la aplicación web.
- Calidad: Jest (unitarias y e2e contra PostgreSQL real), ESLint, Prettier y GitHub Actions.

## Levantar el proyecto

### Con Docker (recomendado)

```bash
docker compose up --build
```

No hace falta crear un `.env`: `docker-compose.yml` trae valores de desarrollo. Para cambiar
alguno (por ejemplo un puerto ocupado), copia `.env.example` a `.env` y edítalo.

Al terminar:

- Aplicación: http://localhost:5173
- API: http://localhost:3000/api/v1 (salud en `/api/v1/health`)
- Swagger: http://localhost:3000/docs

El backend espera a la base, aplica las migraciones, siembra los datos de la demo y arranca.

Para empezar de cero, borrando la base y los archivos cargados:

```bash
docker compose down -v
docker compose up --build
```

### Cuentas de prueba

La semilla crea estas cuentas. Las contraseñas son de desarrollo y se cambian con las variables
`SEED_*_PASSWORD`.

| Cuenta               | Contraseña      | Rol        | Para qué sirve en la demo                                        |
| -------------------- | --------------- | ---------- | ---------------------------------------------------------------- |
| `admin@mda.local`    | `Admin.2026`    | `ADMIN`    | Asigna revisores, administra cuentas y revisa cualquier escaneo. |
| `personal@mda.local` | `Personal.2026` | `PERSONAL` | Registra piezas y carga los escaneos.                            |
| `revisora@mda.local` | `Revisora.2026` | `PERSONAL` | Revisa los escaneos que le asignan (ya tiene uno en su cola).    |
| `publico@mda.local`  | `Publico.2026`  | `PUBLICO`  | Visitante registrado: lee los PDF del portal.                    |

### Piezas de la demo

La semilla carga 24 piezas con material histórico de dominio público (Biblioteca Virtual del Banco de
la República, Library of Congress, Internet Archive y Wikimedia Commons), 10 ubicaciones inventadas y
los archivos de `backend/prisma/semilla/archivos`, que copia en `STORAGE_DIR`. Cada pieza cita su
fuente en la descripción. Nada viene del CLENA.

Quedan 16 piezas publicadas, 3 revisadas, 3 escaneadas (en control de calidad) y 2 registradas.

### En local (sin Docker)

Requiere Node 20+ y una instancia de PostgreSQL 16.

```bash
# Backend
cd backend
cp .env.example .env     # ajustar DATABASE_URL
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## Recorrido de la demo

1. **Portal, sin sesión.** En http://localhost:5173 aparecen las piezas recientes. En `/explorar`,
   buscar «barranquilla» o filtrar por tipo y década.
2. **Ficha pública.** Abrir `/p/MDA-2026-0016`: la fotografía con su visor, los datos y dónde está el
   original. `/p/MDA-2026-0001` es una pieza restringida: solo muestra tipo y ubicación.
3. **PDF con cuenta.** Abrir `/p/MDA-2026-0002`: pide iniciar sesión. Con `publico@mda.local` vuelve
   a la misma pieza y el documento se lee.
4. **Inventario.** Con `personal@mda.local`, en `/panel/inventario`: filtros, orden y páginas. El
   botón «Añadir pieza» registra una nueva y le asigna su código.
5. **QR.** Cada fila del inventario descarga el QR de su pieza. En `/escanear`, leerlo con la cámara
   o escribir el código: abre la ficha pública.
6. **Cargar un escaneo.** `MDA-2026-0023` está registrada. Cargarle
   `backend/prisma/semilla/archivos/1915-calle-de-barranquilla-keystone.jpg` con tema, autor y
   palabras clave: queda en revisión.
7. **Asignar el revisor.** Con `admin@mda.local`, en `/panel/calidad` › «Sin asignar»: elegir a la
   revisora. Quien subió el escaneo aparece deshabilitado.
8. **Control de calidad.** Con `revisora@mda.local`, en `/panel/calidad`: revisar, marcar los tres
   criterios y aprobar. La pieza pasa a publicada y aparece en el portal. Rechazar pide un motivo y
   devuelve la pieza a registrada.
9. **Seguimiento.** Con `personal@mda.local`, «Mis escaneos» muestra en qué va cada archivo. La ficha
   interna de una pieza muestra su historial.
10. **Cuentas.** Con `admin@mda.local`, en `/panel/usuarios`: crear una cuenta del personal, cambiar
    su rol, desactivarla y reactivarla.

## Arquitectura

El backend tiene cuatro capas en `backend/src`: `domain` (entidades y reglas), `application` (casos
de uso), `infrastructure` (Prisma, almacenamiento, JWT) y `presentation` (controladores, módulos y
guardias). El dominio no depende de NestJS ni de Prisma, y toda ruta nace protegida: abrirla al
público es una decisión explícita.

El detalle, con los diagramas C4 y una petición seguida por las cuatro capas, está en
[docs/arquitectura.pdf](docs/arquitectura.pdf).

## Pruebas

```bash
cd backend
npm run lint && npm test && npm run build
npm run test:e2e          # necesita PostgreSQL; usa DATABASE_URL

cd ../frontend
npm run lint && npm run build
```

Cada PR corre lo mismo en GitHub Actions (`backend`, `frontend` y `convenciones`) y necesita la
aprobación de otra persona del equipo para fusionarse.

## Documentación

- Modelo de dominio: [docs/modelo-dominio.pdf](docs/modelo-dominio.pdf)
- Modelo de datos: [docs/modelo-datos.pdf](docs/modelo-datos.pdf)
- Arquitectura: [docs/arquitectura.pdf](docs/arquitectura.pdf)
- Glosario: [docs/glosario.md](docs/glosario.md)
- Decisiones técnicas: [docs/decisiones.md](docs/decisiones.md)
- Reglas del repositorio y cómo contribuir: [CONTRIBUTING.md](CONTRIBUTING.md)
- Actas y plantillas: `docs/actas` y `docs/plantillas`

## Limitaciones conocidas

- Pensado para correr en local: sin HTTPS, con secretos de desarrollo y sin límite de intentos de
  ingreso. Antes de publicarlo en un servidor hay que resolver esas tres cosas.
- Las personas todavía no pueden ver ni eliminar su propia cuenta (HU-04).
- Un PDF en control de calidad se revisa página por página; con documentos muy largos es lento.
- La interfaz está hecha para escritorio; el ajuste para celular es HU-22.

## Problemas frecuentes

- **Un puerto ya está en uso.** Copiar `.env.example` a `.env` y cambiar `DB_PORT`, `BACKEND_PORT` o
  `FRONTEND_PORT`.
- **Los datos no son los de la semilla.** Quedó una base de una versión anterior. Hay que borrarla
  con `docker compose down -v` y volver a levantar.
- **Un PDF no abre en control de calidad después de actualizar.** El navegador guardó un archivo de
  la versión anterior: probar en una ventana privada o borrar los datos del sitio.
- **El QR no abre desde el celular.** Los QR guardan la dirección de `PUBLIC_WEB_URL`. Para probar
  desde otro equipo, ponerle la dirección de este computador en la red y volver a levantar.
