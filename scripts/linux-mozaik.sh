#!/usr/bin/env bash
# Mozaik on Linux: opens the installed copy of dist/index.html in Chrome's app
# mode (TODO B7.28). scripts/linux-kur.sh copies this file next to the program
# as `mozaik`, and mozaik.desktop runs it.
#
# ONLY google-chrome, never a fallback. The plans live in the localStorage of
# Chrome's own Mozaik profile; any other browser opens an empty store, and an
# empty program on the screen reads as "my work is gone".
#
# The profile has its own folder so that clearing Chrome's history never
# touches the plans. This script never creates, empties or deletes it: Chrome
# creates it on the first start, and nothing else writes there.
#
# Exit codes: 69 no Chrome, 66 the program is not installed (run linux-kur.sh).

set -u

ev="${XDG_DATA_HOME:-$HOME/.local/share}/mozaik"
dosya="$ev/app/index.html"

soyle() {
  echo "$1" >&2
  if command -v notify-send >/dev/null 2>&1; then
    notify-send --app-name=Mozaik "Mozaik açılamadı" "$1" || true
  fi
}

if ! command -v google-chrome >/dev/null 2>&1; then
  soyle "Google Chrome bulunamadı. Mozaik bu bilgisayarda yalnız Chrome ile açılır, planlarınız Chrome'da duruyor."
  exit 69
fi

if [ ! -f "$dosya" ]; then
  soyle "Program kurulu değil: $dosya yok. Kurmak için scripts/linux-kur.sh."
  exit 66
fi

exec google-chrome \
  --user-data-dir="$ev/profil" \
  --no-first-run \
  --no-default-browser-check \
  --app="file://$dosya"
