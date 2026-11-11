# Acta de inception

| Campo         | Valor                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Fecha         | Sábado 7 de noviembre de 2026, de 5:27 p. m. a 6:12 p. m.                     |
| Lugar / medio | Microsoft Teams                                                               |
| Asisten       | Andrea De la Ossa, Jesús Cantillo Guerrero, María Gutiérrez, Alejandro Alonso |
| Facilita      | Jesús Cantillo Guerrero                                                       |

## Visión del producto

Para investigadores, estudiantes y el personal del Archivo Histórico del Atlántico, Memoria Digital del Atlántico es un archivo digital para saber qué piezas existen, dónde están y consultarlas sin manipular los originales. Más adelante tendrá una búsqueda asistida por IA que recomiende qué documentos sirven para un tema, por ejemplo la historia del Carnaval.

Jesús presentó el repositorio ya montado: la rama `main`, el backend en NestJS con Clean Architecture (aplicación, dominio, infraestructura y presentación), el frontend de prueba, Docker, la carpeta `docs/` con las actas y sus plantillas, y las reglas del repositorio. Las historias de usuario se basaron en el documento y el flujo de pantallas de María.

## Objetivos de la entrega

Entrega del viernes 13 de noviembre a las 9:00 a. m. Se presentan cuatro funcionalidades:

| #   | Objetivo                                                                                 | Cómo sabremos que se cumplió |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | Inventario de piezas con su ubicación física y su estado de digitalización               | #5, #6, #7 y #8 terminados   |
| 2   | Carga de escaneos y cola de control de calidad para aprobarlos o rechazarlos             | #9 y #10 terminados          |
| 3   | Vínculo físico-digital por QR: descargar el QR de una pieza y ver la pieza al escanearlo | #11 y #12 terminados         |
| 4   | Portal público de búsqueda por metadatos                                                 | #13, #14 y #15 terminados    |

Antes van las historias transversales, que no son funcionalidades pero se necesitan: registro (#1), sesión con JWT (#2), autorización por roles (#3) y datos personales (#4).

## Roles y responsabilidades

Los roles los pide el profesor. Jesús los asignó así:

| Integrante              | Rol Scrum                             | Responsabilidades                                                                                                  |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Andrea De la Ossa       | Product Owner                         | Responde como dueña del producto.                                                                                  |
| Jesús Cantillo Guerrero | Scrum Master                          | Revisa y prueba a mano cada PR antes de fusionarlo. Toma las historias transversales: registro, sesión y usuarios. |
| María Gutiérrez         | Development Team (frontend y backend) | Avisa si alguna historia se aparta del flujo de pantallas que diseñó. Hace las actas de las reuniones.             |
| Alejandro Alonso        | Development Team (frontend y backend) | Desarrolla las historias que se asigne.                                                                            |

Por el tiempo, todos trabajan frontend y backend.

## Alcance

**Entra:**

- Las cuatro funcionalidades de la entrega 1 y las historias transversales (#1 a #15).

**No entra (por ahora):**

- La búsqueda asistida por IA queda para la entrega final (#21). Para esta entrega, la búsqueda del portal es por metadatos (#13).

## Riesgos

| Riesgo                                                                         | Probabilidad | Impacto | Mitigación                                                                     |
| ------------------------------------------------------------------------------ | ------------ | ------- | ------------------------------------------------------------------------------ |
| Nombres distintos para lo mismo entre integrantes, por ejemplo «fecha» y «día» | Media        | Medio   | Usar los nombres del glosario en todo el código                                |
| Cambios de varios integrantes que se pisen entre sí                            | Media        | Medio   | Un issue y una rama por historia, y un PR revisado y probado antes de fusionar |

## Acuerdos de trabajo

- Canal de comunicación: el grupo del equipo.
- Definición de terminado: ver CONTRIBUTING.md.
- Criterio para cambiar el glosario: los nombres del glosario se usan igual en todo el código; cambiarlos sigue lo que dice CONTRIBUTING.md.
- **GitHub Flow:**
  - `main` está protegida.
  - Nada se trabaja sin un issue; si aparece un error, se crea un issue para él.
  - Cada historia empieza desde `main` actualizado, en una rama `feat/<número>-descripcion`.
  - Los commits son pequeños y frecuentes, en español y con Conventional Commits.
  - Hay un PR por historia de usuario, y Jesús lo lee y lo prueba antes de fusionarlo.
- Cualquiera puede crear issues con el mismo formato: texto de la historia y labels de tipo, prioridad y «transversal» cuando aplica.
- Las fechas de las tareas se llevan en el tablero de GitHub: creada, cerrada y fecha límite.
- Las actas se escriben primero en Google Drive y luego se suben a `docs/actas/`, para que la entrega sea un solo enlace.

## Backlog inicial

Jesús presentó en el tablero de GitHub las historias HU-01 a HU-21 y las tareas T-01 a T-10. Las tareas son trabajo que no es programación, como el esqueleto del backend o las actas.

| Issue     | Historia / tarea                                                        | Puntos | Prioridad |
| --------- | ----------------------------------------------------------------------- | ------ | --------- |
| #1        | HU-01 Registro con aviso de privacidad y consentimiento                 | 5      | Alta      |
| #2        | HU-02 Iniciar, renovar y cerrar sesión con JWT                          | 5      | Alta      |
| #3        | HU-03 Autorización por roles en API y frontend                          | 5      | Alta      |
| #4        | HU-04 Ver mis datos y eliminar mi cuenta (Ley 1581)                     | 3      | Alta      |
| #5        | HU-05 Gestionar ubicaciones (depósito, estantería, caja)                | 3      | Alta      |
| #6        | HU-06 Registrar una pieza con código único                              | 5      | Alta      |
| #7        | HU-07 Listar el inventario con filtros, paginación y orden              | 5      | Alta      |
| #8        | HU-08 Ver y editar la ficha interna de una pieza                        | 3      | Alta      |
| #9        | HU-09 Cargar el escaneo de una pieza con metadatos                      | 8      | Alta      |
| #10       | HU-10 Control de calidad: aprobar o rechazar escaneos                   | 8      | Alta      |
| #11       | HU-11 Generar y descargar el QR de una pieza                            | 3      | Alta      |
| #12       | HU-12 Abrir la ficha pública desde el QR                                | 3      | Alta      |
| #13       | HU-13 Buscar piezas publicadas por metadatos                            | 5      | Alta      |
| #14       | HU-14 Ver la ficha pública con visor y ubicación del original           | 3      | Alta      |
| #15       | HU-15 Documentos en PDF solo con cuenta y piezas restringidas           | 3      | Alta      |
| #16       | HU-16 Aplicar el sistema de diseño                                      | 3      | Alta      |
| #17       | HU-17 Administrar cuentas del personal                                  | 5      | Media     |
| #18       | HU-18 Contadores y avance de digitalización en el inventario            | 3      | Media     |
| #19       | HU-19 Lotes de trabajo para voluntarios                                 | 8      | Baja      |
| #20       | HU-20 Imprimir etiquetas QR de varias piezas                            | 3      | Baja      |
| #21       | HU-21 Asistente de recomendaciones                                      | 8      | Baja      |
| #22 a #31 | T-01 a T-10 Base técnica, datos semilla y documentación de la entrega 1 | —      | Alta      |

## Compromisos

| Compromiso                                                                                            | Responsable             | Fecha                                                                       |
| ----------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Clonar el repositorio y entender la estructura, la Clean Architecture y los roles de la base de datos | Todos                   | 7 de noviembre                                                              |
| Levantar el proyecto en local con Docker                                                              | Todos                   | 7 de noviembre                                                              |
| Asignarse las historias en que cada uno va a trabajar                                                 | Todos                   | Antes del 8 de noviembre en la mañana, cuando Jesús revisa las asignaciones |
| Revisar las historias de usuario y avisar si hay inconsistencias                                      | Todos                   | —                                                                           |
| Dar acceso al proyecto de GitHub a los integrantes                                                    | Jesús Cantillo Guerrero | 7 de noviembre, durante la reunión                                          |
| Escribir al equipo de Introducción para una reunión virtual el lunes                                  | Jesús Cantillo Guerrero | Lunes 9 de noviembre                                                        |
| Hacer el acta de esta reunión                                                                         | María Gutiérrez         | —                                                                           |
