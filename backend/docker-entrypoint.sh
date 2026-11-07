#!/bin/sh
set -e

echo ">> Aplicando migraciones (prisma migrate deploy)"
npx prisma migrate deploy

echo ">> Sembrando datos de prueba (idempotente)"
npm run db:seed

echo ">> Arrancando la API"
exec node dist/main.js
