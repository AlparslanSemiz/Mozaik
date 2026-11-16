#!/usr/bin/env bash
# Installs Mozaik for this Linux user (TODO B7.28). Updating is running it again.
#
#   scripts/linux-kur.sh
#
# Builds from the repository this script sits in (~/dev/Mozaik on the
# development machine), and takes the launcher and the icon from there too.
# That checkout must be the one lasting checkout (CLAUDE.md, "Çalışma düzeni"),
# not a worktree: a worktree's dist/ is whatever branch that session is on. It
# refuses a checkout that is not on main, has anything uncommitted, or is
# itself a worktree.
#
# What it writes, all under ${XDG_DATA_HOME:-~/.local/share}:
#   mozaik/app/index.html   a COPY of dist/index.html, never a link: a link
#                           would follow the next build of any branch
#   mozaik/app/kaynak.txt   the commit it was built from
#   mozaik/app/mozaik       the launcher (scripts/linux-mozaik.sh)
#   mozaik/app/mozaik.png   the icon
#   applications/mozaik.desktop
#
# It never touches mozaik/profil, the Chrome profile where the plans are. The
# program file is replaced by a rename, so a window that is open keeps working
# and the next start opens the new build.
#
# Exit codes: 3 no usable checkout, 4 not on main, 5 uncommitted changes,
# 6 the build failed, 7 main moved during the build, 8 the installed build is
# newer than this checkout's main (an old clone would downgrade it below the
# schema the plans already use).

set -eu

veri="${XDG_DATA_HOME:-$HOME/.local/share}"
app="$veri/mozaik/app"

dur() {
  echo "linux-kur: $2" >&2
  exit "$1"
}

# The checkout this script belongs to: scripts/.. of the real file, links
# followed.
kaynak="$(cd -P -- "$(dirname -- "$(readlink -f -- "$0")")/.." && pwd)" ||
  dur 3 "betiğin deposu bulunamadı ($0)."

ust="$(git -C "$kaynak" rev-parse --show-toplevel 2>/dev/null)" ||
  dur 3 "$kaynak bir git deposu değil."
[ "$(realpath "$ust")" = "$(realpath "$kaynak")" ] ||
  dur 3 "$kaynak deponun kökü değil ($ust)."
gitdir="$(git -C "$kaynak" rev-parse --path-format=absolute --git-dir)"
ortak="$(git -C "$kaynak" rev-parse --path-format=absolute --git-common-dir)"
[ "$gitdir" = "$ortak" ] || dur 3 "$kaynak bir worktree; kurulum yalnız ana klasörden."

dal="$(git -C "$kaynak" branch --show-current)"
[ "$dal" = "main" ] || dur 4 "$kaynak main'de değil (dal: ${dal:-yok})."
[ -z "$(git -C "$kaynak" status --porcelain)" ] ||
  dur 5 "$kaynak'ta işlenmemiş değişiklik var; git status temiz olmalı."

commit="$(git -C "$kaynak" rev-parse HEAD)"

# Never step back: if the installed commit is a descendant of this one, this
# clone's main is behind. A commit this clone does not know is let through.
kurulu="$(sed -n 's/^commit //p' "$app/kaynak.txt" 2>/dev/null || true)"
if [ -n "$kurulu" ] && [ "$kurulu" != "$commit" ] &&
  git -C "$kaynak" merge-base --is-ancestor "$commit" "$kurulu" 2>/dev/null; then
  dur 8 "kurulu sürüm (${kurulu:0:7}) bu checkout'un main'inden daha yeni; önce git pull."
fi

(
  cd "$kaynak" || exit 1
  # package-lock.json moved since the last install: the old node_modules would
  # build with the wrong packages.
  if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
    npm ci --no-audit --no-fund || exit 1
  fi
  npm run build
) || dur 6 "derleme olmadı."

[ -s "$kaynak/dist/index.html" ] || dur 6 "$kaynak/dist/index.html yok ya da boş."
[ "$(git -C "$kaynak" rev-parse HEAD)" = "$commit" ] ||
  dur 7 "main derleme sırasında ilerledi; yeniden çalıştırın."
[ -z "$(git -C "$kaynak" status --porcelain)" ] ||
  dur 5 "derleme $kaynak'ta izlenen bir dosyayı değiştirdi."

mkdir -p "$app" "$veri/applications"

# Copy beside, then rename over: a half-written index.html never exists.
cp -- "$kaynak/dist/index.html" "$app/index.html.yeni"
mv -f -- "$app/index.html.yeni" "$app/index.html"
cp -- "$kaynak/scripts/linux-mozaik.sh" "$app/mozaik"
chmod 755 "$app/mozaik"
cp -- "$kaynak/site/icon-512.png" "$app/mozaik.png"

{
  echo "commit $commit"
  echo "konu $(git -C "$kaynak" log -1 --format=%s "$commit")"
  echo "tarih $(git -C "$kaynak" log -1 --format=%cI "$commit")"
  echo "kuruldu $(date -Is)"
} >"$app/kaynak.txt"

cat >"$veri/applications/mozaik.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Mozaik
Comment=Haftalık ders programı
Exec="$app/mozaik"
Icon=$app/mozaik.png
Terminal=false
Categories=Education;Office;
EOF

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$veri/applications" >/dev/null 2>&1 || true
fi

echo "Mozaik kuruldu: $app/index.html (${commit:0:7})."
