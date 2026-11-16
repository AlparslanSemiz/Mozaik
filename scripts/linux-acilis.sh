#!/usr/bin/env bash
# Does the Linux AppImage start and stay up (DECISIONS 2026-11-16, Linux): the
# twin of mac.yml's "Does it start and stay up". Twenty seconds on a virtual
# screen (Xvfb, 1920x1080) with a D-Bus session of its own, because the
# single-instance plugin claims a D-Bus name on Linux. The window's content is
# not looked at (no WebDriver here); a screenshot goes to the artefact when
# ImageMagick is there.
#
# The program runs with a throwaway HOME and XDG folders: a test must never
# write where a person's plans are (DECISIONS 2026-09-24, the fake home).
#
# Usage: scripts/linux-acilis.sh <Mozaik.AppImage> [--ayikla]
#   --ayikla  start through `--appimage-extract-and-run`, for a container
#             with no FUSE; without it the AppImage mounts itself, as on a desktop.
set -euo pipefail

app="$(realpath "${1:?AppImage yolu}")"
chmod +x "$app"
cikti="${ACILIS_CIKTI:-$PWD}"
mkdir -p "$cikti"

ev="$(mktemp -d)"
trap 'kill "${xvfb:-}" 2>/dev/null || true; rm -rf "$ev"' EXIT
mkdir -p "$ev/Belgeler" "$ev/.config" "$ev/.local/share" "$ev/.cache"

Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp > "$cikti/xvfb.log" 2>&1 &
xvfb=$!
sleep 2

arg=()
if [ "${2:-}" = "--ayikla" ]; then arg=(--appimage-extract-and-run); fi

env DISPLAY=:99 HOME="$ev" XDG_CONFIG_HOME="$ev/.config" XDG_DATA_HOME="$ev/.local/share" \
  XDG_CACHE_HOME="$ev/.cache" XDG_DOCUMENTS_DIR="$ev/Belgeler" \
  dbus-run-session -- "$app" "${arg[@]}" > "$cikti/acilis.log" 2>&1 &
pid=$!
sleep 20
if command -v import > /dev/null; then
  DISPLAY=:99 import -window root "$cikti/acilis.png" || true
fi
if ! kill -0 "$pid" 2> /dev/null; then
  echo "Mozaik yirmi saniye içinde kapandı" >&2
  cat "$cikti/acilis.log" >&2
  exit 1
fi
kill "$pid" 2> /dev/null || true
cat "$cikti/acilis.log"
echo "Mozaik açıldı ve yirmi saniye ayakta kaldı"
