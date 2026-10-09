#!/usr/bin/env bash
# One hand mutation, done the same way every time: this repository proves that
# a test measures something by breaking the rule and watching the test go red
# (TESTPLAN, "Mutasyonla sınama"), and twice the proof itself went wrong
# because the change never reached what the test reads (TRAPS 120). So:
#
#   1. the file is copied aside and the tree's state is noted,
#   2. the change is applied with `perl -0pi -e` and checked with cmp: a change
#      that did not apply stops here instead of passing as "still green",
#   3. with --derle the page is built, and with --dist-ara the given text has
#      to appear in dist/index.html (a side-effect-free line the minifier drops
#      never reaches a test that reads the build),
#   4. the test command runs, and it is expected to go red,
#   5. the file is put back from the copy (also on Ctrl-C), rebuilt if it was
#      built, and the tree has to be exactly as it was.
#
#   scripts/mutasyon-kaniti.sh src/pure/relax.ts \
#     's/      if \(run > 0\) \{\n        \/\/ No window/      if (false) {\n        \/\/ No window/' \
#     -- npx vitest run src/relax.test.ts -t "art arda"
#
#   scripts/agir.sh scripts/mutasyon-kaniti.sh src/ui/main.tsx '<ifade>' \
#     --derle --dist-ara '__u' -- npx playwright test e2e/temel.spec.ts
#
# Exit codes: 0 red as expected · 1 still green, the test does not see this
# change · 2 the change did not apply (or never reached dist) · 3 the file was
# not clean before · 4 the tree did not come back as it was · 5 the build
# failed with the change in · 64 usage.
#
# Local only (perl, cmp, a POSIX shell); no workflow, npm script or Windows
# path calls this. A Playwright test command goes under scripts/agir.sh.

set -u

kullanim() {
  echo "kullanım: scripts/mutasyon-kaniti.sh <dosya> <perl-ifadesi> [--derle] [--dist-ara <metin>] -- <test komutu...>" >&2
  exit 64
}

[ "$#" -ge 3 ] || kullanim
dosya=$1
ifade=$2
shift 2
derle=0
dist_ara=''
while [ "$#" -gt 0 ] && [ "$1" != -- ]; do
  case $1 in
    --derle) derle=1 ;;
    --dist-ara)
      [ "$#" -ge 2 ] || kullanim
      dist_ara=$2
      derle=1
      shift
      ;;
    *) kullanim ;;
  esac
  shift
done
[ "${1:-}" = -- ] || kullanim
shift
[ "$#" -gt 0 ] || kullanim

kok="$(git rev-parse --show-toplevel)" || exit 64
cd "$kok" || exit 64
[ -f "$dosya" ] || { echo "dosya yok: $dosya" >&2; exit 64; }

if ! git diff --quiet HEAD -- "$dosya"; then
  echo "DURDU: $dosya HEAD'den farklı; mutasyon temiz bir dosyaya uygulanır." >&2
  exit 3
fi

# The copy lives in scratch/ (outside git) under a fixed name, overwritten by
# the next run, so nothing has to be deleted afterwards.
mkdir -p scratch/mutasyon-kaniti
yedek="scratch/mutasyon-kaniti/$(basename "$dosya").yedek"
once="$(git status --porcelain)"
geri_kondu=0

geri_koy() {
  [ "$geri_kondu" = 1 ] && return
  geri_kondu=1
  cp "$yedek" "$dosya"
  if [ "$derle" = 1 ]; then
    npx vite build >/dev/null 2>&1 || echo "UYARI: geri koyduktan sonraki derleme düştü" >&2
  fi
}
trap 'geri_koy; exit 130' INT TERM
trap 'geri_koy' EXIT

cp "$dosya" "$yedek"
perl -0pi -e "$ifade" "$dosya"
if cmp -s "$dosya" "$yedek"; then
  echo "UYGULANMADI: ifade $dosya içinde hiçbir şeye uymadı. Test koşulmadı."
  exit 2
fi
echo "== uygulanan değişiklik"
diff -u "$yedek" "$dosya" | sed -n '3,40p'

if [ "$derle" = 1 ]; then
  if ! npx vite build >/dev/null 2>&1; then
    echo "DERLEME DÜŞTÜ: değişiklikle sayfa derlenmiyor, bu bir test sonucu değil."
    exit 5
  fi
  if [ -n "$dist_ara" ]; then
    kac="$(grep -cF -- "$dist_ara" dist/index.html)"
    if [ "$kac" = 0 ]; then
      echo "DIST'E GİRMEDİ: '$dist_ara' dist/index.html'de yok, test bu değişikliği okuyamaz."
      exit 2
    fi
    echo "== dist/index.html'de '$dist_ara': $kac satır"
  fi
fi

echo "== test: $*"
"$@"
test_rc=$?

geri_koy
trap - EXIT INT TERM

if ! git diff --quiet HEAD -- "$dosya" || [ "$(git status --porcelain)" != "$once" ]; then
  echo "AĞAÇ DÖNMEDİ: git status mutasyondan öncekiyle aynı değil." >&2
  git status --short >&2
  exit 4
fi
echo "== ağaç mutasyondan önceki gibi (git status aynı)"

if [ "$test_rc" = 0 ]; then
  echo "YEŞİL: test bu değişikliği görmedi."
  exit 1
fi
echo "KIRMIZI: test bu değişikliği görüyor (çıkış $test_rc)."
exit 0
