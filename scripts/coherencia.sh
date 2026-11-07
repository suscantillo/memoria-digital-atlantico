#!/usr/bin/env bash
# PRs sin "Closes #", ramas mal nombradas e issues cerrados sin PR. Sale con 1 si hay hallazgos.
set -euo pipefail

ROJO=$'\033[31m'
VERDE=$'\033[32m'
RESET=$'\033[0m'
hallazgos=0

if ! command -v gh >/dev/null 2>&1; then
  echo "${ROJO}Falta gh (GitHub CLI).${RESET}" >&2
  exit 2
fi

REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
PROPIETARIO="${REPO%%/*}"
NOMBRE="${REPO##*/}"
PATRON_RAMA='^(feat|fix|docs|chore|refactor|test|ci)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$'
PATRON_CIERRE='(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #[0-9]+'

reportar() {
  hallazgos=$((hallazgos + 1))
  echo "${ROJO}  ✘ $1${RESET}"
}

echo "Repositorio: $REPO"

echo
echo "1) PRs fusionados sin 'Closes #n':"
prs_sin_cierre=$(gh pr list --repo "$REPO" --state merged --limit 200 \
  --json number,title,body,headRefName \
  --jq '.[] | select((.body // "") | ascii_downcase | test("'"$PATRON_CIERRE"'") | not) | "#\(.number) \(.title) [\(.headRefName)]"')
if [[ -z "$prs_sin_cierre" ]]; then
  echo "${VERDE}  ✔ Todos los PRs fusionados cierran un issue.${RESET}"
else
  while IFS= read -r linea; do reportar "$linea"; done <<< "$prs_sin_cierre"
fi

echo
echo "2) Ramas que no siguen <tipo>/<issue>-descripcion:"
ramas=$(gh api --paginate "repos/$PROPIETARIO/$NOMBRE/branches" --jq '.[].name' | grep -vx 'main' || true)
ramas_malas=""
while IFS= read -r rama; do
  [[ -z "$rama" ]] && continue
  if ! [[ "$rama" =~ $PATRON_RAMA ]]; then
    ramas_malas+="$rama"$'\n'
  fi
done <<< "$ramas"
if [[ -z "${ramas_malas//$'\n'/}" ]]; then
  echo "${VERDE}  ✔ Todas las ramas siguen el formato.${RESET}"
else
  while IFS= read -r rama; do [[ -n "$rama" ]] && reportar "$rama"; done <<< "$ramas_malas"
fi

echo
echo "3) Issues cerrados sin PR vinculado:"
consulta='query($owner:String!,$name:String!,$cursor:String){
  repository(owner:$owner,name:$name){
    issues(states:CLOSED, first:100, after:$cursor){
      pageInfo{ hasNextPage endCursor }
      nodes{ number title closedByPullRequestsReferences(first:1){ totalCount } }
    }
  }
}'
issues_sin_pr=$(gh api graphql --paginate -f query="$consulta" -F owner="$PROPIETARIO" -F name="$NOMBRE" \
  --jq '.data.repository.issues.nodes[] | select(.closedByPullRequestsReferences.totalCount == 0) | "#\(.number) \(.title)"')
if [[ -z "$issues_sin_pr" ]]; then
  echo "${VERDE}  ✔ Todos los issues cerrados tienen PR vinculado.${RESET}"
else
  while IFS= read -r linea; do reportar "$linea"; done <<< "$issues_sin_pr"
fi

echo
if (( hallazgos > 0 )); then
  echo "${ROJO}Se encontraron $hallazgos hallazgos.${RESET}"
  exit 1
fi
echo "${VERDE}Sin hallazgos.${RESET}"
