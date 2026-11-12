# Decisiones técnicas

Registro corto de decisiones que no se deducen del código. Cada entrada dice qué se decidió y por qué.
Se agrega una entrada nueva en el mismo PR que la aplica; no se reescriben las anteriores.

## 1. Versiones fijadas

NestJS 10.4, Prisma 6, React 18.3, MUI 6, Vite 6 y ESLint 9 con flat config. El curso exige NestJS 10 y
React 18; el ecosistema ya va por versiones mayores, así que las dependencias se fijan por major en los
`package.json` y no se actualizan sin PR.

## 2. Casos de uso sin NestJS

Los casos de uso son clases planas: reciben los repositorios y puertos por constructor y el módulo de
NestJS los arma con `useFactory` y tokens. Así se prueban con dobles en memoria sin levantar Nest y la
capa `application/` no depende del framework.

## 3. DTOs con class-validator y Swagger por plugin

Los DTOs viven en `application/` con decoradores de class-validator. Swagger los documenta con el plugin
del CLI de Nest (`classValidatorShim` e `introspectComments`), sin `@ApiProperty`, para que la capa de
aplicación no importe `@nestjs/swagger`.

## 4. Errores de dominio traducidos en el filtro global

El dominio lanza `ErrorRegla`, `ErrorNoEncontrado`, `ErrorConflicto` y `ErrorNoAutorizado` sin saber de
HTTP. El filtro global los traduce a 422, 404, 409 y 401 y produce el cuerpo uniforme
`{ statusCode, message, errors?, path, timestamp }`.

## 5. Unicidad de la terna por partida doble

`CrearUbicacion` consulta el repositorio antes de guardar y la tabla tiene restricción única sobre
depósito, estantería y caja. Si dos peticiones compiten, la base de datos responde `P2002` y el repositorio
lo convierte en el mismo `UbicacionDuplicadaError`.

## 6. Sesiones con refresh JWT y `jti`

El token de acceso es un JWT corto. El de refresco es otro JWT firmado con `JWT_REFRESH_SECRET` cuyo `jti`
se guarda en `sesiones`; en cada refresco se revoca la sesión anterior y se emite una nueva (rotación).
Guardar solo el `jti` permite revocar sin almacenar el token y detectar reutilización de un token viejo.

## 7. bcryptjs en lugar de bcrypt

Mismo algoritmo y mismos hashes, sin compilación nativa: evita fallos de build en la imagen Alpine.

## 8. Pruebas e2e contra PostgreSQL real

`/health` comprueba la conexión de verdad, así que el e2e usa una base real. En CI la provee un servicio
de PostgreSQL; en local, la de docker-compose.

## 9. docker-compose arranca sin `.env`

Los valores por defecto del compose son de desarrollo y permiten `docker compose up` sin pasos previos,
como exige el curso. `.env` solo los sobreescribe; los secretos reales nunca van en el repositorio.

## 10. nginx reenvía `/api` y `/docs`

El frontend y la API comparten origen en Docker, así que no hay CORS y Swagger queda accesible desde la
misma URL. En desarrollo el proxy de Vite hace lo mismo.

## 11. Un solo chunk de terceros en Vite

Separar React de MUI y Emotion en chunks distintos produce una dependencia circular en la carga y la
aplicación no arranca. Se agrupa todo `node_modules` en `vendor`.

## 12. `GET /ubicaciones` público por ahora

La portada usa el listado de ubicaciones como prueba de conexión mientras no exista `/portal/piezas`.
Cuando exista, `GET /ubicaciones` pasa a exigir `PERSONAL` o `ADMIN` como el resto del panel.

## 13. La versión del aviso de privacidad la valida el backend

`POST /auth/registro` recibe `aceptaPrivacidad` y `versionPrivacidad`. La versión vigente es una constante
del dominio y el registro se rechaza si la enviada no coincide: así queda constancia de qué texto aceptó
cada persona y una pantalla desactualizada no puede registrar consentimientos sobre un aviso viejo. Las
cuentas internas (`ADMIN`, `PERSONAL`) no pasan por el aviso y dejan esos campos vacíos.

## 14. Fuentes autoalojadas

Archivo (títulos) y Figtree (texto) se instalan con Fontsource y se sirven desde la propia app en lugar
de enlazar Google Fonts. Así el navegador del visitante no consulta a un tercero (menos datos
personales expuestos) y la interfaz se ve igual sin conexión dentro de Docker.

## 15. Las piezas restringidas no se encuentran por texto ni por década

`GET /portal/piezas` muestra las piezas restringidas solo con tipo y ubicación. Si la búsqueda por texto
o por década las alcanzara, el resultado revelaría el título o el año que el portal oculta. Por eso esos
dos filtros las excluyen y en el listado van siempre al final, sin importar el orden pedido: ordenarlas
por título o año también delataría el dato. El filtro por tipo sí las incluye, porque el tipo es público.

## 16. Aprobar el escaneo publica la pieza

En control de calidad una sola persona marca los tres criterios (legible, completa, datos correctos) y
aprueba. Ese acto es la revisión y la publicación a la vez: `POST /archivos/:id/aprobar` deja el archivo
`APROBADO` y la pieza `PUBLICADA`, sin detenerse en `REVISADA`. Con un solo revisor, un paso intermedio
obligaría a pulsar dos veces para lo mismo. El estado `REVISADA` se conserva en el modelo por si el
archivo pide después que publicar lo decida otra persona.

Las reglas viven en las entidades: `ArchivoDigital` solo se revisa si está `EN_REVISION` y exige motivo
para rechazar; `Pieza` solo cambia desde `ESCANEADA`. El repositorio guarda archivo, pieza y evento en
una transacción y condiciona la escritura a que el archivo siga `EN_REVISION`, así dos revisiones
simultáneas no se pisan.
