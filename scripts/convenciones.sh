#!/usr/bin/env bash
# Convenciones de commits y PRs. Lo usan el hook commit-msg y el job `convenciones` de CI.
#   convenciones.sh mensaje <archivo>        rechaza trailers automáticos de herramientas y enlaces de sesión
#   convenciones.sh commits <desde> <hasta>  commitlint + mensaje sobre cada commit del rango
#   convenciones.sh pr                       cuerpo del PR en $CUERPO: exige "Closes #n" y aplica la misma regla
set -euo pipefail

PATRON_ATRIBUCION='co-authored-by|generated (with|by)|noreply@|https?://[^ ]+/session'
PATRON_CIERRE='(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #[0-9]+'

mensaje() {
  local archivo="${1:?archivo con el mensaje}"
  if grep -v '^#' "$archivo" | grep -qiE "$PATRON_ATRIBUCION"; then
    echo "El mensaje no puede llevar trailers automáticos de herramientas ni enlaces de sesión. El autor del commit es quien lo hace." >&2
    grep -v '^#' "$archivo" | grep -inE "$PATRON_ATRIBUCION" >&2
    return 1
  fi
}

commits() {
  local desde="${1:-}" hasta="${2:-HEAD}"
  if [[ -z "$desde" || "$desde" =~ ^0+$ ]] || ! git cat-file -e "$desde" 2>/dev/null || ! git merge-base --is-ancestor "$desde" "$hasta" 2>/dev/null; then
    desde="$hasta~1"
  fi
  echo "Revisando commits $desde..$hasta"
  npx --no -- commitlint --from "$desde" --to "$hasta" --verbose
  local tmp
  tmp=$(mktemp)
  for c in $(git rev-list "$desde..$hasta"); do
    git log -1 --format=%B "$c" > "$tmp"
    if ! mensaje "$tmp"; then
      echo "  en el commit $(git log -1 --format='%h %s' "$c")" >&2
      rm -f "$tmp"
      return 1
    fi
  done
  rm -f "$tmp"
}

pr() {
  local tmp
  tmp=$(mktemp)
  printf '%s\n' "${CUERPO:-}" > "$tmp"
  if ! grep -qiE "$PATRON_CIERRE" "$tmp"; then
    echo "El cuerpo del PR debe incluir 'Closes #n' con el issue que cierra." >&2
    rm -f "$tmp"
    return 1
  fi
  mensaje "$tmp"
  rm -f "$tmp"
}

case "${1:-}" in
  mensaje) mensaje "${2:-}" ;;
  commits) commits "${2:-}" "${3:-HEAD}" ;;
  pr) pr ;;
  *) echo "Uso: $0 mensaje <archivo> | commits <desde> <hasta> | pr" >&2; exit 2 ;;
esac
