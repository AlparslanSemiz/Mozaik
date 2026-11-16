#!/usr/bin/env bash
# What the Linux AppImage carries (DECISIONS 2026-11-16, Linux): the Linux
# twin of the Mac's "Is the .app whole" step, shared by surum.yml and
# linux.yml so the release and the PR check look at the same things.
#
# The AppImage is unpacked (`--appimage-extract` needs no FUSE) and looked
# over: the AppImage magic, the program, CP-SAT and its licence in Tauri's
# resource folder (cpsat.rs, `linux_yolu`), CP-SAT's `RUNPATH $ORIGIN` still in
# place after Tauri's bundler (linuxdeploy) went over the folder, and the most
# glibc the program asks for. Last, CP-SAT's tiny model is solved by the
# library AS SHIPPED, out of the unpacked AppImage: a library that is there but
# cannot load its neighbours would otherwise turn up as a slow search nobody
# notices.
#
# Usage: scripts/linux-paket.sh <Mozaik.AppImage>
set -euo pipefail

app="$(realpath "${1:?AppImage yolu}")"
kok="$(cd "$(dirname "$0")/.." && pwd)"
# The program is built on Ubuntu 22.04; this is the promise README.md makes.
en_cok_glibc="2.35"

test -s "$app" || { echo "AppImage yok: $app" >&2; exit 1; }
[ "$(head -c4 "$app" | od -An -tx1 | tr -d ' \n')" = "7f454c46" ] \
  || { echo "AppImage bir ELF dosyası değil" >&2; exit 1; }
# update_linux.rs, `verify`: a type 2 AppImage carries `AI\x02` at byte 8.
[ "$(od -An -tx1 -j8 -N3 "$app" | tr -d ' \n')" = "414902" ] \
  || { echo "AppImage'ın imi (AI 02) yok" >&2; exit 1; }

gecici="$(mktemp -d)"
trap 'rm -rf "$gecici"' EXIT
chmod +x "$app"
(cd "$gecici" && "$app" --appimage-extract > /dev/null)
ic="$gecici/squashfs-root"

program="$ic/usr/bin/Mozaik"
test -x "$program" || { echo "usr/bin/Mozaik yok" >&2; ls -R "$ic/usr" | head -40; exit 1; }
ls "$ic"/*.desktop > /dev/null

kaynak="$ic/usr/lib/Mozaik"
test -f "$kaynak/libortools.so.9" || { echo "CP-SAT AppImage'da yok" >&2; exit 1; }
test -f "$kaynak/UCUNCU-TARAF.txt" || { echo "UCUNCU-TARAF.txt AppImage'da yok" >&2; exit 1; }
paket=$(find "$kaynak" -maxdepth 1 -name '*.so*' | wc -l)
yerel=$(find "$kok/src-tauri/ortools" -maxdepth 1 -name '*.so*' | wc -l)
[ "$paket" = "$yerel" ] || { echo "AppImage $paket kütüphane taşıyor, $yerel olmalı" >&2; exit 1; }
# cpsat.rs refuses a library or folder that group or others can write: one
# shipped so would load nothing, quietly.
yazilir=$(find "$kaynak" -maxdepth 1 -perm /022)
[ -z "$yazilir" ] || { echo "AppImage'da başkalarının yazabildiği dosyalar var:" >&2; echo "$yazilir" >&2; exit 1; }
# Every library that arrived with `RUNPATH $ORIGIN` still has it: linuxdeploy
# rewrites the rpath of what it deploys, and one that lost it cannot find its
# neighbours at run time.
for f in "$kok"/src-tauri/ortools/*.so*; do
  ad=$(basename "$f")
  once=$(readelf -d "$f" | grep -E '(RUNPATH|RPATH)' || true)
  grep -q '\$ORIGIN' <<< "$once" || continue
  simdi=$(readelf -d "$kaynak/$ad" | grep -E '(RUNPATH|RPATH)' || true)
  grep -q '\$ORIGIN' <<< "$simdi" \
    || { echo "$ad'in RUNPATH'i paketlenince \$ORIGIN değil: $simdi" >&2; exit 1; }
done
# A second copy of CP-SAT's libraries in `usr/lib` (linuxdeploy deployed what it
# resolved) loads nothing wrong but doubles the download: said, not refused.
cift=$(find "$ic/usr/lib" -maxdepth 1 \( -name 'libabsl_*' -o -name 'libortools*' \) | wc -l)
if [ "$cift" != 0 ]; then
  echo "::warning title=AppImage CP-SAT'ı iki kez taşıyor::usr/lib'de $cift OR-Tools kütüphanesi daha var"
fi

glibc=$(readelf -V "$program" | grep -o 'GLIBC_[0-9.]*' | sed 's/^GLIBC_//' | sort -V | tail -1)
if [ "$(printf '%s\n%s\n' "$glibc" "$en_cok_glibc" | sort -V | tail -1)" != "$en_cok_glibc" ]; then
  echo "Mozaik glibc $glibc istiyor, en çok $en_cok_glibc olmalı" >&2
  exit 1
fi

# cpsat.rs `the_library_answers_a_tiny_model`, against the shipped library.
# A filter that matched nothing would pass too: the one test must have run.
MOZAIK_ORTOOLS="$kaynak/libortools.so.9" \
  cargo test --manifest-path "$kok/src-tauri/Cargo.toml" --lib \
  -- --exact cpsat::tests::the_library_answers_a_tiny_model | tee "$gecici/model.log"
grep -q 'test result: ok. 1 passed' "$gecici/model.log" \
  || { echo "CP-SAT'ın küçük modeli koşmadı" >&2; exit 1; }

mb=$(( $(stat -c%s "$app") / 1024 / 1024 ))
echo "AppImage bütün: $mb MB, glibc $glibc, CP-SAT $paket kütüphane"
