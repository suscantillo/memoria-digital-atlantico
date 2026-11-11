# Acta de inception

| Campo         | Valor                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fecha         | 27 de octubre de 2026, 1:00 p. m.                                                                                                                                              |
| Duración      | 14 minutos con 23 segundos                                                                                                                                                     |
| Lugar / medio | Microsoft Teams. Jesús se conectó desde la universidad junto con el equipo de Introducción, en el mismo computador                                                             |
| Asisten       | Andrea De la Ossa, Jesús Cantillo Guerrero, María Gutiérrez, Alejandro Alonso. Del equipo de Introducción (grupo 7): Santiago Barros, Iván Gómez, Samuel Pimienta y Juan Riaño |
| Facilita      | Jesús Cantillo Guerrero                                                                                                                                                        |

## Visión del producto

Para investigadores, estudiantes y el personal del Archivo Histórico del Atlántico, Memoria Digital del Atlántico es un archivo digital para saber qué documentos existen y consultarlos sin manipular los originales. Cada pieza se inventaría y se escanea una sola vez.

Santiago Barros presentó el problema que el equipo de Introducción identificó en su visita al CLENA, el 26 de septiembre de 2026:

- Los originales son antiguos y frágiles, y cada consulta implica manipularlos.
- No hay un registro en línea de lo que guarda el archivo. Para saberlo, hay que ir en persona y depender del personal.

El equipo de Introducción compartió:

- su informe final del laboratorio de campo, del 14 de octubre de 2026;
- su presentación;
- su repositorio, https://github.com/Jrianopro20/clena-biblioteca-piloto, con el backlog del análisis.

El proyecto parte de ese material, y el equipo de origen valida el backlog (#32).

## Objetivos de la entrega

| #   | Objetivo                                                                              | Cómo sabremos que se cumplió                                                            |
| --- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Inventario digital: cada pieza con código único `MDA-AAAA-NNNN` y su ubicación física | #5, #6, #7 y #8 cerrados con su PR fusionado                                            |
| 2   | Digitalización con control de calidad antes de publicar                               | #9 y #10 cerrados                                                                       |
| 3   | QR por pieza y portal público de consulta                                             | #11, #12, #13, #14 y #15 cerrados                                                       |
| 4   | Cuentas, roles y datos personales según la Ley 1581                                   | #1, #2, #3, #4 y #17 cerrados                                                           |
| 5   | Entrega 1 documentada y etiquetada                                                    | #26 a #31 cerrados y tag `entrega-1` antes del viernes 13 de noviembre a las 9:00 a. m. |

## Roles y responsabilidades

| Integrante              | Rol Scrum                                           | Responsabilidades                                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Andrea De la Ossa       | Product Owner                                       | Prioriza el backlog. Revisa la documentación y prueba los criterios Dado/Cuando/Entonces antes de aprobar PR funcionales. Desarrolla cuentas, sesión, ubicaciones y piezas (#2, #4, #5, #6, #8, #17). |
| Jesús Cantillo Guerrero | Scrum Master, Development Team (backend y frontend) | Facilita las ceremonias. Arma la base técnica (#22, #23, #24) y desarrolla registro, inventario, escaneos, calidad y portal (#1, #7, #9, #10, #13, #15). Cierra la entrega (#31).                     |
| María Gutiérrez         | Development Team (frontend)                         | Sistema de diseño (#16), autorización por roles (#3), QR y ficha pública (#11, #12, #14), semillas (#25), acta de Inception y evidencias (#26) y arquitectura (#29).                                  |
| Alejandro Alonso        | Development Team (backend)                          | QR y ficha pública desde el backend (#11, #12) y funciones de prioridad baja (#20, #21).                                                                                                              |

## Alcance

**Entra:**

- Inventario digital de las piezas y sus ubicaciones en depósito, estantería y caja (#5, #6, #7, #8).
- Carga de escaneos con metadatos y control de calidad (#9, #10).
- QR de cada pieza para pegar en su carpeta o caja (#11), que abre su ficha pública (#12).
- Portal público con búsqueda, visor y ubicación del original (#13, #14, #15).
- Cuentas y roles `ADMIN`, `PERSONAL` y `PUBLICO` (#1, #2, #3, #4, #17).
- Sistema de diseño (#16).

**No entra (por ahora):**

- Asistente de recomendaciones (#21), hasta que lo valide el equipo de origen.
- QR en las vitrinas de la Galería y OCR de los documentos, que la propuesta deja para fases posteriores.
- Lotes de trabajo para voluntarios (#19) e impresión de etiquetas por lote (#20), con prioridad baja.

## Riesgos

| Riesgo                                                            | Probabilidad | Impacto | Mitigación                                                                                                                    |
| ----------------------------------------------------------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Datos personales en algunos registros y en las cuentas de usuario | Media        | Alto    | Aviso de privacidad y consentimiento (#1). Consulta y eliminación de los propios datos (#4). Datos de prueba ficticios (#25). |
| Publicar escaneos ilegibles o de una pieza equivocada             | Media        | Alto    | Control de calidad obligatorio antes de publicar (#10)                                                                        |
| Que se perjudique el original durante el escaneo                  | Media        | Alto    | Escanear cada documento una sola vez y conservar el archivo digital (#9)                                                      |
| Plazo corto para la entrega 1                                     | Alta         | Alto    | Prioridades en el backlog. PR pequeños, uno por historia.                                                                     |

## Acuerdos de trabajo

- Horario de dailies: [por confirmar]. Se hacen por Microsoft Teams.
- Canal de comunicación: Microsoft Teams y los issues y PR de GitHub.
- Definición de terminado: ver CONTRIBUTING.md.
- Criterio para cambiar el glosario: un PR `docs:` que toque a la vez el glosario, el dominio, Prisma, la API y la UI (CONTRIBUTING.md).
- Cada cambio va en una rama `feat/<issue>-descripcion` y entra a `main` por PR, con una aprobación, la CI en verde y `Closes #n`.
- Revisión cruzada de PR entre Alejandro y María.
- Stack fijo: NestJS 10, Prisma y PostgreSQL 16 en el backend; React 18, Vite y MUI en el frontend; Docker.

## Backlog inicial

| Issue     | Historia / tarea                                                      | Puntos | Prioridad |
| --------- | --------------------------------------------------------------------- | ------ | --------- |
| #1        | HU-01 Registro con aviso de privacidad y consentimiento               | 5      | Alta      |
| #2        | HU-02 Iniciar, renovar y cerrar sesión con JWT                        | 5      | Alta      |
| #3        | HU-03 Autorización por roles en API y frontend                        | 5      | Alta      |
| #4        | HU-04 Ver mis datos y eliminar mi cuenta (Ley 1581)                   | 3      | Alta      |
| #5        | HU-05 Gestionar ubicaciones (depósito, estantería, caja)              | 3      | Alta      |
| #6        | HU-06 Registrar una pieza con código único                            | 5      | Alta      |
| #7        | HU-07 Listar el inventario con filtros, paginación y orden            | 5      | Alta      |
| #8        | HU-08 Ver y editar la ficha interna de una pieza                      | 3      | Alta      |
| #9        | HU-09 Cargar el escaneo de una pieza con metadatos                    | 8      | Alta      |
| #10       | HU-10 Control de calidad: aprobar o rechazar escaneos                 | 8      | Alta      |
| #11       | HU-11 Generar y descargar el QR de una pieza                          | 3      | Alta      |
| #12       | HU-12 Abrir la ficha pública desde el QR                              | 3      | Alta      |
| #13       | HU-13 Buscar piezas publicadas por metadatos                          | 5      | Alta      |
| #14       | HU-14 Ver la ficha pública con visor y ubicación del original         | 3      | Alta      |
| #15       | HU-15 Documentos en PDF solo con cuenta y piezas restringidas         | 3      | Alta      |
| #16       | HU-16 Aplicar el sistema de diseño                                    | 3      | Alta      |
| #17       | HU-17 Administrar cuentas del personal                                | 5      | Media     |
| #18       | HU-18 Contadores y avance de digitalización en el inventario          | 3      | Media     |
| #19       | HU-19 Lotes de trabajo para voluntarios                               | 8      | Baja      |
| #20       | HU-20 Imprimir etiquetas QR de varias piezas                          | 3      | Baja      |
| #21       | HU-21 Asistente de recomendaciones                                    | 8      | Baja      |
| #22 a #24 | T-01 a T-03 Esqueleto del backend y del frontend, docker-compose y CI | —      | Alta      |
| #25       | T-04 Datos semilla ficticios                                          | —      | Alta      |
| #26 a #31 | T-05 a T-10 Documentación y cierre de la entrega 1                    | —      | Alta      |

## Compromisos

| Compromiso                                                               | Responsable             | Fecha                               |
| ------------------------------------------------------------------------ | ----------------------- | ----------------------------------- |
| Validar el backlog (#32)                                                 | Equipo de Introducción  | Entrega 1                           |
| Esqueleto del backend, del frontend, docker-compose y CI (#22, #23, #24) | Jesús Cantillo Guerrero | Entrega 1                           |
| Datos semilla ficticios (#25)                                            | María Gutiérrez         | Entrega 1                           |
| Acta de Inception, correo de coordinación y evidencias (#26)             | María Gutiérrez         | Entrega 1                           |
| Arquitectura (#29)                                                       | María Gutiérrez         | Entrega 1                           |
| Actas de las ceremonias (#30)                                            | María Gutiérrez         | Jueves 12 de noviembre              |
| README final y tag `entrega-1` (#31)                                     | Jesús Cantillo Guerrero | Viernes 13 de noviembre, 9:00 a. m. |
