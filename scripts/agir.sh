#!/usr/bin/env bash
# Runs one heavy command under the lock that every session on this machine
# shares (CLAUDE.md, "Paralel oturumlar"): stryker, mutation, kontrol, kapsam,
# every Playwright run, exe builds, podman and every timing. Two sessions'
# Playwright runs at once load each other's numbers, and a site server left
# open by one would be tested by the other.
#
#   scripts/agir.sh npm run kontrol
#   scripts/agir.sh npx playwright test e2e/otomatik.spec.ts
#
# Waits for the lock at most MOZAIK_AGIR_BEKLE seconds (1800 by default) and
# then gives up with 75 instead of waiting on. While it holds the lock it says
# so in ~/.mozaik-agir.not (session, command, time) and on release overwrites
# that note with "serbest": the note is information, the lock is the flock.
# Exits with the command's own code.
#
# Local only: flock is Linux, and no workflow, npm script or Windows path
# calls this.

set -u

if [ "$#" -eq 0 ]; then
  echo "kullanım: scripts/agir.sh <komut> [argümanlar...]" >&2
  exit 64
fi

kilit="$HOME/.mozaik-agir.lock"
not="$HOME/.mozaik-agir.not"
bekle="${MOZAIK_AGIR_BEKLE:-1800}"
kok="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
dal="$(git branch --show-current 2>/dev/null || echo '?')"

exec 9>>"$kilit"
if ! flock -w "$bekle" 9; then
  echo "agir.sh: kilit ${bekle} s içinde alınamadı, beklenmiyor. Not:" >&2
  cat "$not" >&2 2>/dev/null
  exit 75
fi

printf 'DOLU\noturum: %s (%s)\nkomut: %s\nbaşladı: %s\n' \
  "$kok" "$dal" "$*" "$(date -Is)" >"$not"

# The command does not inherit the lock's descriptor: a server it leaves
# running must not keep the lock after the command is over.
"$@" 9>&-
rc=$?

printf 'serbest: %s (son: %s, %s, çıkış %s)\n' "$(date -Is)" "$kok" "$dal" "$rc" >"$not"
exit "$rc"
