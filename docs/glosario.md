# Glosario

Nombres fijos del proyecto. Se usan tal cual en el dominio, en Prisma, en los DTOs, en las rutas
de la API y en los textos de la interfaz. Cambiar cualquiera exige un PR `docs:` que toque el
glosario, el dominio, Prisma, la API y la UI a la vez.

## Entidades

| Término            | Definición                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Usuario**        | Persona con cuenta. Roles: `ADMIN`, `PERSONAL`, `PUBLICO`. El visitante sin cuenta no tiene rol (petición sin token).                                                                                                                    |
| **Ubicacion**      | Lugar físico de una pieza: depósito, estantería y caja. La terna es única.                                                                                                                                                               |
| **Pieza**          | Elemento del archivo. Tipo `DOCUMENTO`, `FOTOGRAFIA` o `PERIODICO`. Estado `REGISTRADA`, `ESCANEADA`, `REVISADA` o `PUBLICADA`. Código único `MDA-AAAA-NNNN`. Puede ser `restringida`: en el portal solo se muestra su tipo y ubicación. |
| **ArchivoDigital** | Escaneo de una pieza. Estado `EN_REVISION`, `APROBADO` o `RECHAZADO`; si se rechaza lleva `motivo_rechazo`.                                                                                                                              |
| **EventoPieza**    | Entrada del historial de una pieza: quién, qué y cuándo.                                                                                                                                                                                 |
| **Sesion**         | Refresh token persistido y revocable de un usuario.                                                                                                                                                                                      |

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

Plural en español bajo `/api/v1`: `/piezas`, `/ubicaciones`, `/archivos`, `/usuarios`, `/auth`,
`/portal`. Salud en `/api/v1/health`; documentación en `/docs`.

## Convenciones de nombres

- Dominio, DTOs y rutas: en español, sin tildes en identificadores (`descripcion`, `anio`).
- Base de datos: tablas en plural y snake_case (`archivos_digitales`, `eventos_pieza`); columnas en snake_case.
- Enums: en mayúsculas, exactamente como aparecen aquí.
