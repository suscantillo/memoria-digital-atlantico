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

- Backend: NestJS 10 + TypeScript, Clean Architecture, Prisma, PostgreSQL 16.
- Frontend: React 18 + TypeScript, Vite, React Router, TanStack Query, MUI.
- Contenedores: Docker + docker-compose.

## Levantar el proyecto

### Con Docker (recomendado)

```bash
cp .env.example .env
docker compose up --build
```

Al terminar:

- API: http://localhost:3000/api/v1 (salud en `/api/v1/health`)
- Swagger: http://localhost:3000/docs
- Frontend: http://localhost:5173

El backend aplica las migraciones y siembra datos de prueba al arrancar.

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

### Usuarios de prueba

Las semillas crean un `ADMIN`, un `PERSONAL` y un `PUBLICO` con las contraseñas definidas
en `.env.example` (solo para desarrollo). Todos los datos sembrados son ficticios.

## Documentación

- Glosario: [docs/glosario.md](docs/glosario.md)
- Reglas del repositorio y cómo contribuir: [CONTRIBUTING.md](CONTRIBUTING.md)
- Decisiones técnicas: [docs/decisiones.md](docs/decisiones.md)
- Actas y plantillas: `docs/`
