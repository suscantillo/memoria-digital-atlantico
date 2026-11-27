#!/usr/bin/env bash
# Lleva el backend de la VM al commit indicado (por defecto, lo último de main). Lo corre el CI.
# Las migraciones y la semilla las aplica el backend al arrancar (backend/docker-entrypoint.sh).
set -euo pipefail

COMMIT="${1:-origin/main}"
cd "$(dirname "$0")/.."

git fetch -q origin main
git reset -q --hard "$COMMIT"
echo ">> Desplegando $(git log -1 --format='%h %s')"

cd deploy
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans --wait --wait-timeout 300
docker image prune -f >/dev/null
docker compose -f docker-compose.prod.yml ps
