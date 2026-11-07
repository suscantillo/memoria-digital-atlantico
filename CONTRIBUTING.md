# Cómo contribuir

## Clonar y correr

```bash
git clone <url-del-repo>
cd memoria-digital-atlantico
npm install                  # instala los hooks de git (husky)
cp .env.example .env
docker compose up --build    # db + backend (migra y siembra) + frontend
```

- Frontend: http://localhost:5173 · API: http://localhost:3000/api/v1 · Swagger: http://localhost:3000/docs
- Usuarios de prueba en `.env.example` (`admin@mda.local`, `personal@mda.local`, `publico@mda.local`).
- Para trabajar sin Docker, ver `backend/.env.example`.

## Flujo de trabajo (GitHub Flow)

1. **Nada existe sin issue.** Crea una historia de usuario o tarea técnica con la plantilla.
2. Crea la rama desde `main` con el número del issue:
   `feat/12-registrar-pieza`, `fix/30-codigo-duplicado`, `docs/8-glosario`.
3. Haz commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/) en español:
   `feat: registrar pieza con código único (#12)`. El hook `commit-msg` rechaza mensajes que no cumplan.
4. Abre el PR con la plantilla: `Closes #12`, qué cambia, cómo probarlo y el checklist de la definición de terminado.
5. CI (`backend` y `frontend`) debe quedar en verde. Debes poder explicar cada archivo del PR.

## Pedir revisión

- Revisión cruzada: Alejandro ↔ Mayi. Andrea revisa docs y prueba los criterios Dado/Cuando/Entonces antes de aprobar PRs funcionales.
- Asigna el revisor en GitHub y avisa en el canal del equipo con el enlace del PR.
- Quien revisa prueba el PR siguiendo "Cómo probarlo"; si algo no se puede probar, no se aprueba.

## Lo que nunca se hace

- Push directo a `main` (está protegida; todo entra por PR con una aprobación y CI verde).
- Subir `.env` ni ningún secreto. Solo se versionan los `.env.example`.
- Cambiar nombres del glosario (entidades, roles, estados, rutas) sin un PR `docs:` que toque glosario, dominio, Prisma, API y UI a la vez.
- Importar NestJS, Prisma o class-validator desde `backend/src/domain/`. ESLint lo bloquea; no desactives la regla.
- Usar `synchronize: true` o cambiar el esquema sin migración versionada.

## Antes de abrir el PR

```bash
cd backend && npm run lint && npm test && npm run build
cd ../frontend && npm run lint && npm run build
```

`scripts/coherencia.sh` revisa que los PRs fusionados cierren issues, que las ramas sigan el formato y que los issues cerrados tengan PR.
