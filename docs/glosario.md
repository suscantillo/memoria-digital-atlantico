# Glosario

Nombres fijos del proyecto. Se usan tal cual en el dominio, en Prisma, en los DTOs, en las rutas
de la API y en los textos de la interfaz. Cambiar cualquiera exige un PR `docs:` que toque el
glosario, el dominio, Prisma, la API y la UI a la vez.

## Entidades

| Término            | Definición                                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Usuario**        | Persona con cuenta. Roles: `ADMIN`, `PERSONAL`, `PUBLICO`. El visitante sin cuenta no tiene rol (petición sin token). Las cuentas `PUBLICO` guardan `consentimiento_en` y `version_privacidad` del aviso aceptado.                                                                                       |
| **Ubicacion**      | Lugar físico de una pieza: depósito, estantería y caja. La terna es única.                                                                                                                                                                                                                               |
| **Pieza**          | Elemento del archivo. Tipo `DOCUMENTO`, `FOTOGRAFIA` o `PERIODICO`. Estado `REGISTRADA`, `ESCANEADA`, `REVISADA` o `PUBLICADA`. Código único `MDA-AAAA-NNNN`. Puede ser `restringida`: en el portal solo se muestra su tipo y ubicación. Al cargar el escaneo recibe `tema`, `autor` y `palabras_clave`. |
| **ArchivoDigital** | Escaneo de una pieza. Estado `EN_REVISION`, `APROBADO` o `RECHAZADO`; si se rechaza lleva `motivo_rechazo`. Puede tener un `revisor_asignado` (HU-23).                                                                                                                                                   |
| **EventoPieza**    | Entrada del historial de una pieza: quién, qué y cuándo. Acciones: `REGISTRADA`, `ESCANEADA`, `REVISOR_ASIGNADO`, `PUBLICADA`, `RECHAZADA`, `EDITADA`, `RETIRADA`.                                                                                                                                       |
| **Sesion**         | Refresh token (JWT con `jti`) persistido, rotado en cada uso y revocable. La tabla guarda el `jti`, nunca el token.                                                                                                                                                                                      |

## Roles

| Rol        | Quién es              | Qué puede hacer                                             |
| ---------- | --------------------- | ----------------------------------------------------------- |
| `ADMIN`    | Administra el sistema | Todo lo de `PERSONAL` y gestión de usuarios.                |
| `PERSONAL` | Personal del archivo  | Inventario, ubicaciones, carga y revisión de escaneos.      |
| `PUBLICO`  | Visitante con cuenta  | Consulta del portal con las funciones que requieran cuenta. |
| visitante  | Sin cuenta            | Consulta pública de piezas publicadas y no restringidas.    |

## Estados

- **Pieza:** `REGISTRADA` → `ESCANEADA` → `REVISADA` → `PUBLICADA`.
- **ArchivoDigital:** `EN_REVISION` → `APROBADO` | `RECHAZADO` (con `motivo_rechazo`).
- **Control de calidad:** aprobar el escaneo deja la pieza `PUBLICADA`; rechazarlo la devuelve a
  `REGISTRADA` para cargar otro. Cada cambio deja un `EventoPieza`.
- **Revisor asignado:** el `ADMIN` elige qué cuenta `PERSONAL` activa revisa cada escaneo, nunca quien lo
  subió. Un `PERSONAL` solo ve y revisa lo que le asignaron; el `ADMIN` revisa cualquiera.
- **Retirar del portal:** el `ADMIN` saca una pieza `PUBLICADA` con un motivo; vuelve a `REVISADA`,
  conserva su escaneo aprobado y se puede publicar otra vez. Ninguna pieza se borra.

## Código de pieza

`MDA-AAAA-NNNN`: prefijo fijo, año de registro de cuatro dígitos y consecutivo de cuatro dígitos
(`MDA-2026-0001`). Es único en todo el archivo y es lo que codifica el QR.

## Rutas de la API

En español, bajo `/api/v1`. Las historias usan estos nombres tal cual.

### Existentes

| Ruta                               | Método | Acceso                          | Qué hace                                                                                                                                                                                |
| ---------------------------------- | ------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/registro`                   | POST   | pública                         | Crea una cuenta `PUBLICO`; exige aceptar la versión vigente del aviso.                                                                                                                  |
| `/auth/ingresar`                   | POST   | pública                         | Correo y contraseña; devuelve token de acceso, refresh token y usuario.                                                                                                                 |
| `/auth/refrescar`                  | POST   | pública, lleva el refresh token | Rota la sesión: revoca la anterior y devuelve tokens nuevos.                                                                                                                            |
| `/auth/salir`                      | POST   | pública, lleva el refresh token | Revoca la sesión. Responde 204 aunque el token ya no sirva.                                                                                                                             |
| `/auth/yo`                         | GET    | con token de acceso             | Usuario autenticado.                                                                                                                                                                    |
| `/ubicaciones`                     | GET    | `PERSONAL`, `ADMIN`             | Listado paginado con filtros y orden.                                                                                                                                                   |
| `/ubicaciones`                     | POST   | `PERSONAL`, `ADMIN`             | Registra una ubicación.                                                                                                                                                                 |
| `/portal/piezas`                   | GET    | pública                         | Busca piezas `PUBLICADA` por texto, tipo y década; paginado y con orden.                                                                                                                |
| `/portal/piezas/:codigo`           | GET    | pública                         | Ficha pública de una pieza `PUBLICADA` por su código.                                                                                                                                   |
| `/piezas`                          | GET    | `PERSONAL`, `ADMIN`             | Inventario: filtra por tipo, estado, caja y texto, con páginas y orden.                                                                                                                 |
| `/archivos`                        | POST   | `PERSONAL`, `ADMIN`             | Carga el escaneo de una pieza `REGISTRADA`: queda `EN_REVISION` y la pieza `ESCANEADA`.                                                                                                 |
| `/archivos`                        | GET    | `PERSONAL`, `ADMIN`             | Escaneos con páginas y orden; con `estado=EN_REVISION` es la cola. Filtros `revisor` (`yo`, `ninguno` o un id) y `subidoPor=yo`. Un `PERSONAL` solo ve lo asignado a él o lo que subió. |
| `/archivos/revisores`              | GET    | `ADMIN`                         | Cuentas `PERSONAL` activas a las que se puede asignar una revisión.                                                                                                                     |
| `/archivos/:id/asignar`            | POST   | `ADMIN`                         | Con `revisorId`: asigna o cambia el revisor de un escaneo `EN_REVISION` (422 si es quien lo subió) y lo deja en el historial.                                                           |
| `/archivos/:id/contenido`          | GET    | sesión opcional                 | El archivo del escaneo. El personal ve todos; el público, solo los aprobados de piezas `PUBLICADA` no restringidas: imágenes sin cuenta y PDF con sesión (401 sin ella).                |
| `/archivos/:id/aprobar`            | POST   | revisor asignado, `ADMIN`       | Con `legible`, `completa` y `datosCorrectos` en `true`: archivo `APROBADO` y pieza `PUBLICADA`. Otro `PERSONAL` recibe 403.                                                             |
| `/archivos/:id/rechazar`           | POST   | revisor asignado, `ADMIN`       | Con `motivoRechazo`: archivo `RECHAZADO` y la pieza vuelve a `REGISTRADA`. Otro `PERSONAL` recibe 403.                                                                                  |
| `/piezas/:id/qr`                   | GET    | `PERSONAL`, `ADMIN`             | PNG del QR de la pieza; guarda `PUBLIC_WEB_URL/p/{codigo}?qr=1`.                                                                                                                        |
| `/piezas/:id/retirar`              | POST   | `ADMIN`                         | Con `motivo`: una pieza `PUBLICADA` sale del portal y vuelve a `REVISADA`; queda `RETIRADA` en el historial.                                                                            |
| `/piezas/:id/publicar`             | POST   | `ADMIN`                         | Publica otra vez una pieza `REVISADA` que tiene escaneo aprobado.                                                                                                                       |
| `/usuarios/publico`                | GET    | `ADMIN`                         | Cuentas `PUBLICO` del portal con su consentimiento; paginado y con búsqueda.                                                                                                            |
| `/usuarios/publico/:id/desactivar` | PATCH  | `ADMIN`                         | Desactiva una cuenta del portal y revoca sus sesiones; `/reactivar` la habilita otra vez.                                                                                               |
| `/health`                          | GET    | pública                         | Estado de la API y de la base de datos.                                                                                                                                                 |

Documentación en `/docs`.

### Previstas

`/auth/cuenta`, `/usuarios` y `/piezas`.

Todas las rutas de panel exigen `PERSONAL` o `ADMIN`. Solo son públicas `/portal/*`, `/auth/registro`,
`/auth/ingresar`, `/auth/refrescar` y `/health`.
`/archivos/:id/contenido` es de sesión opcional: responde sin token, valida el que llegue y decide
qué entrega según quién pregunta.

## Convenciones de nombres

- Dominio, DTOs y rutas: en español, sin tildes en identificadores (`descripcion`, `anio`).
- Base de datos: tablas en plural y snake_case (`archivos_digitales`, `eventos_pieza`); columnas en snake_case.
- Enums: en mayúsculas, exactamente como aparecen aquí.
