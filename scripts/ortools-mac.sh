#!/usr/bin/env bash
# OR-Tools CP-SAT for the Mac .app (src-tauri/src/cpsat.rs, DECISIONS 2026-11-15).
#
# The Mac twin of surum.yml's "OR-Tools CP-SAT for the installer" step: the
# official release archive, its SHA-256 pinned here, so no other file gets
# past this script. What goes into the .app is not the whole `lib/` folder
# (254 entries, half of them symlinks) but the closure of `libortools.9.dylib`:
# every `@rpath/...` it loads, and every one THOSE load, read with `otool -L`.
# Measured on 9.15 arm64: 99 files, 53 MB. The archive's dylibs carry
# `LC_RPATH @loader_path`, so loaded by full path from `Contents/Frameworks`
# each one finds the others beside it: no install_name_tool, which would also
# break the linker's ad-hoc signature they arrive with.
#
# Writes `src-tauri/ortools/` and `src-tauri/tauri.ortools.json` (both in
# .gitignore), the same two names the Windows step writes, so
# `tauri build --config src-tauri/tauri.ortools.json` is one line on both.
#
# Usage: scripts/ortools-mac.sh <arm64|x86_64> [indirme-klasoru]
set -euo pipefail

mimari="${1:?mimari: arm64 ya da x86_64}"
surum="9.15.6755"
case "$mimari" in
  arm64) beklenen="de0400a45939a66ee13cd8360c230e830fc5e03a6ed5a8a8b60f58a39e4a67bc" ;;
  x86_64) beklenen="d2d36482727520ccaff979eba16f53e6b2cabf40b6fd1126e4d3b34fad2fe851" ;;
  *) echo "bilinmeyen mimari: $mimari (arm64 ya da x86_64)" >&2; exit 1 ;;
esac
ad="or-tools_${mimari}_macOS-26.2_cpp_v${surum}"
url="https://github.com/google/or-tools/releases/download/v9.15/${ad}.tar.gz"

kok="$(cd "$(dirname "$0")/.." && pwd)"
indirme="${2:-$(mktemp -d)}"
mkdir -p "$indirme"
arsiv="$indirme/${ad}.tar.gz"

if [ ! -f "$arsiv" ] || [ "$(shasum -a 256 "$arsiv" | cut -d' ' -f1)" != "$beklenen" ]; then
  curl -fsSL --retry 3 -o "$arsiv" "$url"
fi
ozet="$(shasum -a 256 "$arsiv" | cut -d' ' -f1)"
if [ "$ozet" != "$beklenen" ]; then
  echo "OR-Tools arşivinin özeti tutmuyor: $ozet" >&2
  exit 1
fi

acik="$indirme/acik-$mimari"
rm -rf "$acik" && mkdir -p "$acik"
tar xzf "$arsiv" -C "$acik"
lib="$acik/$ad/lib"

hedef="$kok/src-tauri/ortools"
rm -rf "$hedef" && mkdir -p "$hedef"

# The closure, breadth first. A name is copied under the name it is LOADED by
# (`libortools.9.dylib`, not the `libortools.9.15.dylib` the symlink points
# at), and `cp -L` copies the file rather than the link.
sira=("libortools.9.dylib")
alinan=()
while [ "${#sira[@]}" -gt 0 ]; do
  n="${sira[0]}"
  sira=("${sira[@]:1}")
  case " ${alinan[*]-} " in *" $n "*) continue ;; esac
  [ -e "$lib/$n" ] || { echo "arşivde yok: $n" >&2; exit 1; }
  alinan+=("$n")
  cp -L "$lib/$n" "$hedef/$n"
  while read -r bag; do
    [ "$bag" = "$n" ] || sira+=("$bag")
  done < <(otool -L "$lib/$n" | tail -n +2 | awk '{print $1}' | sed -n 's|^@rpath/||p')
done

# Everything else they load is the operating system's own.
for f in "$hedef"/*.dylib; do
  if otool -L "$f" | tail -n +2 | awk '{print $1}' | grep -vE '^(@rpath/|/usr/lib/|/System/Library/)'; then
    echo "$(basename "$f") sistem dışı bir yerden yüklüyor" >&2
    exit 1
  fi
done

# The licence file the Windows installer carries goes into the .app too.
cp "$kok/src-tauri/lisanslar/UCUNCU-TARAF.txt" "$hedef/"

node -e '
  const fs = require("fs");
  const [ciktilar, yol] = process.argv.slice(1);
  const adlar = ciktilar.split(" ").sort();
  fs.writeFileSync(yol, JSON.stringify({
    bundle: {
      resources: { "ortools/UCUNCU-TARAF.txt": "UCUNCU-TARAF.txt" },
      macOS: { frameworks: adlar.map((a) => "ortools/" + a) },
    },
  }, null, 2) + "\n");
' "${alinan[*]}" "$kok/src-tauri/tauri.ortools.json"

toplam=$(du -sk "$hedef" | cut -f1)
echo "OR-Tools $surum $mimari: ${#alinan[@]} dylib, $((toplam / 1024)) MB -> src-tauri/ortools"
