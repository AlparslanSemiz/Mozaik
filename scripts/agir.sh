#!/usr/bin/env bash
# Runs one heavy command under the lock that every session on this machine
# shares (CLAUDE.md, "Paralel oturumlar"): stryker, mutation, kontrol, kapsam,
# every Playwright run, exe builds, podman and every timing. Two sessions'
# Playwright runs at once load each other's numbers, and a site server left
# open by one would be tested by the other.
#
#   scripts/agir.sh npm run kontrol
#   scripts/agir.sh --sure 600 npx playwright test e2e/otomatik.spec.ts
#
# Waits for the lock at most MOZAIK_AGIR_BEKLE seconds (1800 by default) and
# then gives up with 75 instead of waiting on. While it holds the lock it says
# so in ~/.mozaik-agir.not (session, command, time) and on release overwrites
# that note with "serbest": the note is information, the lock is the flock.
# Exits with the command's own code; 124 when `--sure` ran out.
#
# A time limit goes in `--sure N` (seconds, or MOZAIK_AGIR_SURE), never in a
# `timeout` wrapped around this script. On 2026-10-09 `timeout 600
# scripts/agir.sh ...` killed this script alone: the lock went free, the
# command ran on as an orphan, and the next session's run sat beside it
# (pitfall 150). A process group would not have been enough either:
# Playwright starts every browser `detached`, the leader of a group of its own.
#
# So the command's whole tree is found by a mark in its environment, which a
# child inherits however it detaches, and the tree is ended before the lock
# goes: on `--sure`, on TERM, INT or HUP to this script (an outside `timeout`
# is a TERM), and also when the command exits normally and leaves something
# behind, a server for one. TERM first, KILL after MOZAIK_AGIR_PAY seconds
# (10 by default). Only a process that rewrites its own environment escapes.
#
# Local only: flock and /proc are Linux, and no workflow, npm script or Windows
# path calls this.

set -u

sure="${MOZAIK_AGIR_SURE:-0}"
if [ "${1:-}" = "--sure" ]; then
  sure="${2:-}"
  shift 2 2>/dev/null || shift
fi
case "$sure" in
'' | *[!0-9]*)
  echo "agir.sh: --sure bir saniye sayısı ister, \"$sure\" değil." >&2
  exit 64
  ;;
esac

if [ "$#" -eq 0 ]; then
  echo "kullanım: scripts/agir.sh [--sure <saniye>] <komut> [argümanlar...]" >&2
  exit 64
fi

kilit="${MOZAIK_AGIR_KILIT:-$HOME/.mozaik-agir.lock}"
not="${MOZAIK_AGIR_NOTU:-$HOME/.mozaik-agir.not}"
bekle="${MOZAIK_AGIR_BEKLE:-1800}"
pay="${MOZAIK_AGIR_PAY:-10}"
kok="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
dal="$(git branch --show-current 2>/dev/null || echo '?')"
kimlik="$$-$(date +%s%N)"

exec 9>>"$kilit"
if ! flock -w "$bekle" 9; then
  echo "agir.sh: kilit ${bekle} s içinde alınamadı, beklenmiyor. Not:" >&2
  cat "$not" >&2 2>/dev/null
  exit 75
fi

printf 'DOLU\noturum: %s (%s)\nkomut: %s\nbaşladı: %s\n' \
  "$kok" "$dal" "$*" "$(date -Is)" >"$not"

# Every live process that carries this run's mark. A zombie's environ reads
# empty, so a process that has exited but is not yet reaped does not count.
agac() {
  local f
  for f in $(grep -lzx "MOZAIK_AGIR_KIMLIK=$kimlik" /proc/[0-9]*/environ 2>/dev/null); do
    f="${f#/proc/}"
    printf '%s\n' "${f%/environ}"
  done
}

agaci_bitir() {
  local p i
  p="$(agac)"
  [ -z "$p" ] && return 0
  # shellcheck disable=SC2086 # one pid per word
  kill -TERM $p 2>/dev/null
  for ((i = 0; i < pay * 5; i++)); do
    sleep 0.2
    [ -z "$(agac)" ] && return 0
  done
  echo "agir.sh: ${pay} s sonra hâlâ duranlar KILL ile kapatılıyor." >&2
  while p="$(agac)" && [ -n "$p" ]; do
    # shellcheck disable=SC2086
    kill -KILL $p 2>/dev/null
    sleep 0.1
  done
}

bekci=''
# The end of every path: the tree goes, then the note, and the lock goes with
# this process. Nothing below may release it earlier.
bitir() {
  trap '' TERM INT HUP
  [ -n "$bekci" ] && kill "$bekci" 2>/dev/null
  agaci_bitir
  wait "$pid" 2>/dev/null
  printf 'serbest: %s (son: %s, %s, çıkış %s)\n' "$(date -Is)" "$kok" "$dal" "$1" >"$not"
  exit "$1"
}

# The command does not inherit the lock's descriptor, and keeps this script's
# standard input (a background job would otherwise get /dev/null).
MOZAIK_AGIR_KIMLIK="$kimlik" "$@" 9>&- <&0 &
pid=$!
trap 'echo "agir.sh: sinyal geldi, komutun ağacı kapatılıyor." >&2; bitir 143' TERM
trap 'bitir 130' INT
trap 'bitir 129' HUP

if [ "$sure" -gt 0 ]; then
  sleep "$sure" 9>&- </dev/null &
  bekci=$!
fi

while :; do
  bitti=''
  if [ -n "$bekci" ]; then
    wait -n -p bitti "$pid" "$bekci"
    rc=$?
  else
    wait "$pid"
    rc=$?
    bitti=$pid
  fi
  if [ "$bitti" = "$pid" ]; then
    bitir "$rc"
  elif [ -n "$bekci" ] && [ "$bitti" = "$bekci" ]; then
    bekci=''
    echo "agir.sh: ${sure} s doldu, komutun ağacı kapatılıyor." >&2
    bitir 124
  fi
done
