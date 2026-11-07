# Memoria Digital del Atlántico: reglas del repositorio

Proyecto final de Aplicaciones Web Backend (Uninorte) para el Archivo Histórico del Atlántico
(CLENA, edificio de la Aduana): inventario de piezas, carga y control de calidad de escaneos, QR
por pieza y portal público de búsqueda. Entrega 1: viernes 13 de noviembre de 2026, 9:00 am, con
el tag `entrega-1`.

## Stack fijo

Otro stack invalida la entrega.

- Backend: NestJS 10 + TypeScript, Clean Architecture, Prisma, PostgreSQL 16.
- Frontend: React 18 + TypeScript, Vite, React Router, TanStack Query, MUI.
- Contenedores: Docker + docker-compose. `docker compose up` levanta todo sin pasos manuales.
- Prohibido: `synchronize: true`, secretos en el código, diagramas Mermaid/PlantUML en los PDF de docs/.

## Clonar y correr

```bash
git clone git@github.com:suscantillo/memoria-digital-atlantico.git
cd memoria-digital-atlantico
npm install                  # instala los hooks de git (husky)
cp .env.example .env
docker compose up --build    # db + backend (migra y siembra) + frontend
```

- Frontend: http://localhost:5173 · API: http://localhost:3000/api/v1 · Swagger: http://localhost:3000/docs
- Usuarios de prueba en `.env.example` (`admin@mda.local`, `personal@mda.local`, `publico@mda.local`).
- Para trabajar sin Docker, ver `backend/.env.example`.

## Comandos

- `docker compose up --build`: levanta db, backend (migra y siembra) y frontend.
- `cd backend && npm run dev | npm test | npm run test:e2e | npm run lint | npm run db:migrate | npm run db:seed`
- `cd frontend && npm run dev | npm run build | npm run lint`
- `npm run coherencia`: revisa PRs, ramas e issues en GitHub.

## Estructura

```
backend/src/
  domain/          entidades, value objects, reglas, interfaces de repositorio. TS puro.
  application/     casos de uso (uno por acción), DTOs, puertos.
  infrastructure/  Prisma, repositorios, migraciones, almacenamiento de archivos.
  presentation/    controladores REST /api/v1, guards, pipes, filtro global.
frontend/src/      app/ (router, tema), features/<dominio>/, shared/
docs/              actas/, img/, plantillas/, glosario.md, decisiones.md
scripts/           setup-github.sh, coherencia.sh, convenciones.sh
```

Regla de dependencia: todo apunta hacia `domain/`. `domain/` no importa `@nestjs/*`, `@prisma/*`,
`class-validator` ni nada de infraestructura; `application/` tampoco importa `@nestjs/*` ni `@prisma/*`.
ESLint lo bloquea; no desactivar la regla.
Las entidades de Prisma nunca salen de `infrastructure/`: el repositorio las mapea a entidades de dominio.
Los controladores solo invocan casos de uso. Los casos de uso son clases planas sin decoradores de Nest
y reciben la interfaz del repositorio por token (`useFactory` en el módulo).

## Glosario

Los nombres de entidades, roles, estados y rutas están en [docs/glosario.md](docs/glosario.md) y se
usan tal cual en dominio, Prisma, DTOs, rutas y textos de la UI. Cambiarlos exige un PR `docs:` que
toque glosario, dominio, Prisma, API y UI a la vez.

## Roles Scrum

- Product Owner: Andrea.
- Scrum Master: Jesús Cantillo Guerrero.
- Development Team: Mayi (frontend), Alejandro (backend), Jesús (backend/frontend).

## Flujo de trabajo (GitHub Flow)

1. **Nada existe sin issue.** Crea una historia de usuario o tarea técnica con la plantilla.
2. Crea la rama desde `main` con el número del issue:
   `feat/12-registrar-pieza`, `fix/30-codigo-duplicado`, `docs/8-glosario`.
3. Haz commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/) en español:
   `feat: registrar pieza con código único (#12)`. El hook `commit-msg` rechaza mensajes que no cumplan.
4. Abre el PR con la plantilla: `Closes #12`, qué cambia, cómo probarlo y el checklist de la definición
   de terminado. Un PR por historia, pequeño.
5. CI (`backend`, `frontend` y `convenciones`) debe quedar en verde. Debes poder explicar cada archivo del PR.

`main` está protegida: sin push directo, PR con una aprobación y CI en verde.

## Pedir revisión

- Revisión cruzada: Alejandro ↔ Mayi. Andrea revisa docs y prueba los criterios Dado/Cuando/Entonces
  antes de aprobar PRs funcionales.
- Asigna el revisor en GitHub y avisa en el canal del equipo con el enlace del PR.
- Quien revisa prueba el PR siguiendo "Cómo probarlo"; si algo no se puede probar, no se aprueba.

## Definición de terminado

Una historia pasa a Done solo si cumple todo:

1. Caso de uso en `application/` invocado por un controlador en `/api/v1`.
2. Datos en PostgreSQL mediante migración versionada y con semilla para la demo.
3. Endpoint en Swagger (`/docs`) con DTO validado; listados con paginación, filtros y orden.
4. Pantalla React que lo consume, con ruta protegida según rol.
5. Al menos una prueba unitaria del caso de uso pasando en CI.
6. Criterios Dado/Cuando/Entonces de la historia demostrables en vivo.
7. PR aprobado por otra persona y fusionado con CI verde.

## Criterios de código y commits

- Un cambio a la vez; verifica con tests, lint y compose antes de seguir. Implementa solo la historia
  pedida; no toques nada fuera de su alcance.
- Las semillas son ficticias: nunca datos reales del CLENA.
- Las actas se escriben en la reunión, por el equipo. Las plantillas de docs/ no llevan fechas.
- Sin trailers de atribución ("Co-Authored-By", "Generated with", enlaces de sesión) en commits ni PRs.
  El autor del commit es la persona. El hook `commit-msg` y el job `convenciones` lo rechazan.
- Sin comentarios que expliquen lo obvio ni que narren el código línea a línea. Un comentario solo cuando
  explica un porqué no evidente (una regla del CLENA, una decisión técnica, una limitación). Nada de
  `// importar módulo`, `// retornar resultado`, encabezados decorativos ni docstrings vacíos. Mismo
  criterio para README y CONTRIBUTING.
- Al explicar un cambio, explica el porqué de la decisión, no solo qué hace el código. Las decisiones
  técnicas quedan en [docs/decisiones.md](docs/decisiones.md).

## Lo que nunca se hace

- Push directo a `main`.
- Subir `.env` ni ningún secreto. Solo se versionan los `.env.example`.
- Cambiar nombres del glosario sin un PR `docs:` que toque glosario, dominio, Prisma, API y UI a la vez.
- Importar NestJS, Prisma o class-validator desde `backend/src/domain/`, ni NestJS o Prisma desde
  `backend/src/application/`.
- Usar `synchronize: true` o cambiar el esquema sin migración versionada.

## Antes de abrir el PR

```bash
cd backend && npm run lint && npm test && npm run build
cd ../frontend && npm run lint && npm run build
```

`scripts/coherencia.sh` revisa que los PRs fusionados cierren issues, que las ramas sigan el formato y
que los issues cerrados tengan PR.
