# Glosario

Nombres fijos del proyecto. Se usan tal cual en el dominio, en Prisma, en los DTOs, en las rutas
de la API y en los textos de la interfaz. Cambiar cualquiera exige un PR `docs:` que toque el
glosario, el dominio, Prisma, la API y la UI a la vez.

## Entidades

| Término            | Definición                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Usuario**        | Persona con cuenta. Roles: `ADMIN`, `PERSONAL`, `PUBLICO`. El visitante sin cuenta no tiene rol (petición sin token). Las cuentas `PUBLICO` guardan `consentimiento_en` y `version_privacidad` del aviso aceptado.                       |
| **Ubicacion**      | Lugar físico de una pieza: depósito, estantería y caja. La terna es única.                                                                                                                                                               |
| **Pieza**          | Elemento del archivo. Tipo `DOCUMENTO`, `FOTOGRAFIA` o `PERIODICO`. Estado `REGISTRADA`, `ESCANEADA`, `REVISADA` o `PUBLICADA`. Código único `MDA-AAAA-NNNN`. Puede ser `restringida`: en el portal solo se muestra su tipo y ubicación. |
| **ArchivoDigital** | Escaneo de una pieza. Estado `EN_REVISION`, `APROBADO` o `RECHAZADO`; si se rechaza lleva `motivo_rechazo`.                                                                                                                              |
| **EventoPieza**    | Entrada del historial de una pieza: quién, qué y cuándo.                                                                                                                                                                                 |
| **Sesion**         | Refresh token (JWT con `jti`) persistido, rotado en cada uso y revocable. La tabla guarda el `jti`, nunca el token.                                                                                                                      |

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

## Código de pieza

`MDA-AAAA-NNNN`: prefijo fijo, año de registro de cuatro dígitos y consecutivo de cuatro dígitos
(`MDA-2026-0001`). Es único en todo el archivo y es lo que codifica el QR.

## Rutas de la API

En español, bajo `/api/v1`. Las historias usan estos nombres tal cual.

### Existentes

| Ruta                     | Método | Acceso                          | Qué hace                                                                 |
| ------------------------ | ------ | ------------------------------- | ------------------------------------------------------------------------ |
| `/auth/registro`         | POST   | pública                         | Crea una cuenta `PUBLICO`; exige aceptar la versión vigente del aviso.   |
| `/auth/ingresar`         | POST   | pública                         | Correo y contraseña; devuelve token de acceso, refresh token y usuario.  |
| `/auth/refrescar`        | POST   | pública, lleva el refresh token | Rota la sesión: revoca la anterior y devuelve tokens nuevos.             |
| `/auth/salir`            | POST   | pública, lleva el refresh token | Revoca la sesión. Responde 204 aunque el token ya no sirva.              |
| `/auth/yo`               | GET    | con token de acceso             | Usuario autenticado.                                                     |
| `/ubicaciones`           | GET    | `PERSONAL`, `ADMIN`             | Listado paginado con filtros y orden.                                    |
| `/ubicaciones`           | POST   | `PERSONAL`, `ADMIN`             | Registra una ubicación.                                                  |
| `/portal/piezas`         | GET    | pública                         | Busca piezas `PUBLICADA` por texto, tipo y década; paginado y con orden. |
| `/portal/piezas/:codigo` | GET    | pública                         | Ficha pública de una pieza `PUBLICADA` por su código.                    |
| `/piezas`                | GET    | `PERSONAL`, `ADMIN`             | Inventario: filtra por tipo, estado, caja y texto, con páginas y orden.  |
| `/piezas/:id/qr`         | GET    | `PERSONAL`, `ADMIN`             | PNG del QR de la pieza; guarda `PUBLIC_WEB_URL/p/{codigo}?qr=1`.         |
| `/health`                | GET    | pública                         | Estado de la API y de la base de datos.                                  |

Documentación en `/docs`.

### Previstas

`/auth/cuenta`, `/usuarios`, `/piezas` y `/archivos`.

Todas las rutas de panel exigen `PERSONAL` o `ADMIN`. Solo son públicas `/portal/*`, `/auth/registro`,
`/auth/ingresar`, `/auth/refrescar` y `/health`.

## Convenciones de nombres

- Dominio, DTOs y rutas: en español, sin tildes en identificadores (`descripcion`, `anio`).
- Base de datos: tablas en plural y snake_case (`archivos_digitales`, `eventos_pieza`); columnas en snake_case.
- Enums: en mayúsculas, exactamente como aparecen aquí.
