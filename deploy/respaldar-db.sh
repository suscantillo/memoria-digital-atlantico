#!/usr/bin/env bash
# Copia comprimida de la base en ~/respaldos; guarda las de los últimos 14 días.
set -euo pipefail

cd "$(dirname "$0")"
DESTINO="$HOME/respaldos"
mkdir -p "$DESTINO"

docker compose -f docker-compose.prod.yml exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' |
  gzip > "$DESTINO/memoria-$(date +%F).sql.gz"

find "$DESTINO" -name 'memoria-*.sql.gz' -mtime +14 -delete
echo "$(date -Is) respaldo listo"
