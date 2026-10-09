#!/usr/bin/env bash
# Says whether this machine is fit to take a timing (CLAUDE.md, "Paralel
# oturumlar"): on mains power, power profile `performance`, one-minute load
# under 2, and no other test run going. A duration measured on battery or
# beside another session's suite carries a load it never mentions (TRAPS 118),
# so a timing either passes this or is written down as "kirli, ölçülmedi".
#
#   scripts/temiz-kosul.sh && scripts/agir.sh <timing command>
#
# Exits 0 when every condition holds, 1 otherwise, and names each failure.
# Local only: it reads Linux's /sys and /proc, and no workflow, npm script or
# Windows path calls this.

set -u

sebep=()

ac=0
for f in /sys/class/power_supply/*; do
  [ "$(cat "$f/type" 2>/dev/null)" = Mains ] || continue
  [ "$(cat "$f/online" 2>/dev/null)" = 1 ] && ac=1
done
[ "$ac" = 1 ] || sebep+=("makine prizde değil")

profil="$(cat /sys/firmware/acpi/platform_profile 2>/dev/null || echo bilinmiyor)"
[ "$profil" = performance ] || sebep+=("güç profili $profil, performance olmalı")

yuk="$(cut -d' ' -f1 /proc/loadavg)"
awk -v y="$yuk" 'BEGIN { exit !(y < 2) }' || sebep+=("1 dakikalık yük $yuk, 2'nin altında olmalı")

# Shells are left out: a shell whose command line mentions vitest is not a run.
baska="$(ps -eo pid=,comm=,args= | awk '
  $2 != "bash" && $2 != "sh" && $2 != "zsh" && $2 != "awk" && $2 != "ps" &&
  /stryker|vitest|playwright test/ { printf "%s %s; ", $1, $2 }')"
[ -z "$baska" ] || sebep+=("başka bir test süreci koşuyor: $baska")

echo "AC=$ac profil=$profil yük=$yuk çekirdek=$(nproc)"
if [ "${#sebep[@]}" -gt 0 ]; then
  printf 'kirli: %s\n' "${sebep[@]}"
  exit 1
fi
echo "temiz"
