#!/usr/bin/env bash
# OR-Tools CP-SAT for the Linux AppImage (src-tauri/src/cpsat.rs, DECISIONS 2026-11-16).
#
# The Linux twin of scripts/ortools-mac.sh: the official release archive, its
# SHA-256 pinned here, so no other file gets past this script. The archive is
# the AlmaLinux 8.10 build, not an Ubuntu one, because it asks the least of the
# machine: measured on 9.15, its whole closure needs glibc 2.26 and
# GLIBCXX 3.4.22 at most (Ubuntu 18.04, Debian 10), so wherever the AppImage
# itself runs (built on Ubuntu 22.04, glibc 2.35) the library runs too.
#
# What goes into the AppImage is the closure of `libortools.so.9`: every
# NEEDED name the archive's `lib64/` has, and every one THOSE need, read with
# `readelf -d`. Measured on 9.15: 99 files, 65 MB. Everything else they need
# is the system's own (libc, libm, libstdc++, libgcc_s and friends), checked
# below. The archive's libraries carry `RUNPATH $ORIGIN`, so loaded by full
# path from `usr/lib/Mozaik` each one finds the others beside it.
#
# Writes `src-tauri/ortools/` and `src-tauri/tauri.ortools.json` (both in
# .gitignore), the same two names the Windows and Mac steps write, so
# `tauri build --config src-tauri/tauri.ortools.json` is one line everywhere.
#
# Usage: scripts/ortools-linux.sh [indirme-klasoru]
set -euo pipefail

surum="9.15.6755"
beklenen="c43b473b0d141cee253659e8e9e9f46255b7a5edd3839abe7bf4c42a7910a1e9"
ad="or-tools_x86_64_AlmaLinux-8.10_cpp_v${surum}"
url="https://github.com/google/or-tools/releases/download/v9.15/${ad}.tar.gz"
# The most the closure may ask of the machine (above: measured 2.26 / 3.4.22).
en_cok_glibc="2.28"
en_cok_glibcxx="3.4.25"

kok="$(cd "$(dirname "$0")/.." && pwd)"
indirme="${1:-$(mktemp -d)}"
mkdir -p "$indirme"
arsiv="$indirme/${ad}.tar.gz"

if [ ! -f "$arsiv" ] || [ "$(sha256sum "$arsiv" | cut -d' ' -f1)" != "$beklenen" ]; then
  curl -fsSL --retry 3 -o "$arsiv" "$url"
fi
ozet="$(sha256sum "$arsiv" | cut -d' ' -f1)"
if [ "$ozet" != "$beklenen" ]; then
  echo "OR-Tools arşivinin özeti tutmuyor: $ozet" >&2
  exit 1
fi

acik="$indirme/acik-linux"
rm -rf "$acik" && mkdir -p "$acik"
tar xzf "$arsiv" -C "$acik"
lib="$acik/$ad/lib64"

hedef="$kok/src-tauri/ortools"
rm -rf "$hedef" && mkdir -p "$hedef"

# The closure, breadth first. A name is copied under the name it is LOADED by
# (`libortools.so.9`, not the `libortools.so.9.15.6755` the link points at),
# and `cp -L` copies the file rather than the link. A NEEDED name the archive
# does not have is the system's: it goes on the list checked below.
sira=("libortools.so.9")
alinan=()
sistem=()
while [ "${#sira[@]}" -gt 0 ]; do
  n="${sira[0]}"
  sira=("${sira[@]:1}")
  case " ${alinan[*]-} ${sistem[*]-} " in *" $n "*) continue ;; esac
  if [ ! -e "$lib/$n" ]; then
    sistem+=("$n")
    continue
  fi
  alinan+=("$n")
  cp -L "$lib/$n" "$hedef/$n"
  while read -r bag; do
    sira+=("$bag")
  done < <(readelf -d "$lib/$n" | sed -n 's/.*(NEEDED).*\[\(.*\)\]/\1/p')
done

# Everything the archive did not bring is a library every glibc system has.
for n in "${sistem[@]}"; do
  case "$n" in
    libc.so.6 | libm.so.6 | libdl.so.2 | libpthread.so.0 | librt.so.1 | \
      libstdc++.so.6 | libgcc_s.so.1 | ld-linux-x86-64.so.2) ;;
    *) echo "$n arşivde yok ve sistemin kendi kütüphanesi değil" >&2; exit 1 ;;
  esac
done

# The most the closure asks of glibc and libstdc++, read off the binaries, not
# the archive's name (the same lesson as the Mac's minos, tuzak 157).
en_yuksek() {
  readelf -V "$hedef"/*.so* | grep -o "${1}_[0-9.]*" | sed "s/^${1}_//" | sort -V | tail -1
}
glibc=$(en_yuksek GLIBC)
glibcxx=$(en_yuksek GLIBCXX)
for cift in "GLIBC $glibc $en_cok_glibc" "GLIBCXX $glibcxx $en_cok_glibcxx"; do
  set -- $cift
  if [ "$(printf '%s\n%s\n' "$2" "$3" | sort -V | tail -1)" != "$3" ]; then
    echo "OR-Tools $1 $2 istiyor, en çok $3 olmalı" >&2
    exit 1
  fi
done

# The licence file the Windows installer and the Mac .app carry.
cp "$kok/src-tauri/lisanslar/UCUNCU-TARAF.txt" "$hedef/"

# Linux resources land in Tauri's resource folder, `usr/lib/Mozaik` beside
# `usr/bin` (cpsat.rs, `linux_yeri`), each under its own name.
node -e '
  const fs = require("fs");
  const [ciktilar, yol] = process.argv.slice(1);
  const resources = {};
  for (const a of ciktilar.split(" ").sort()) resources["ortools/" + a] = a;
  resources["ortools/UCUNCU-TARAF.txt"] = "UCUNCU-TARAF.txt";
  fs.writeFileSync(yol, JSON.stringify({ bundle: { resources } }, null, 2) + "\n");
' "${alinan[*]}" "$kok/src-tauri/tauri.ortools.json"

toplam=$(du -sk "$hedef" | cut -f1)
echo "OR-Tools $surum linux x86_64: ${#alinan[@]} kütüphane, $((toplam / 1024)) MB, glibc $glibc, GLIBCXX $glibcxx -> src-tauri/ortools"
