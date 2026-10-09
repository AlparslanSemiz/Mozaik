#!/usr/bin/env bash
# One hand mutation, done the same way every time: this repository proves that
# a test measures something by breaking the rule and watching the test go red
# (TESTPLAN, "Mutasyonla sınama"), and the proof itself has gone wrong three
# ways: the change never reached what the test reads (TRAPS 120), and on
# 2026-10-09 a batch wrapper passed its own arguments as the test command, so
# every "red" was exit 127 and no test had run. So:
#
#   1. the test runs once on the unchanged code and has to be green: a test
#      that is already red, or matches nothing, proves nothing when it is red,
#   2. the file is copied aside and the tree's state is noted,
#   3. the change is applied with `perl -0pi -e` and checked with cmp: a change
#      that did not apply stops here instead of passing as "still green",
#   4. with --derle the page is built, and with --dist-ara the given text has
#      to appear in dist/index.html (a side-effect-free line the minifier drops
#      never reaches a test that reads the build),
#   5. the test command runs. Red is a test that ran and failed: an exit of 126
#      or 127 (the command could not run) or a signal is not red,
#   6. the file is put back from the copy (also on Ctrl-C), rebuilt if it was
#      built, and the tree has to be exactly as it was.
#
# One mutation:
#
#   scripts/mutasyon-kaniti.sh src/pure/relax.ts \
#     's/      if \(run > 0\) \{\n        \/\/ No window/      if (false) {\n        \/\/ No window/' \
#     -- npx vitest run src/relax.test.ts -t "art arda"
#
# Many, against one test command (the control run is done once):
#
#   scripts/agir.sh scripts/mutasyon-kaniti.sh --liste mutasyonlar.tsv -- npx vitest run src/x.test.ts
#
# A list line is tab-separated: name, file, expected (kirmizi, yesil or -) and
# the perl expression. Blank lines and lines starting with # are skipped. Each
# line prints one row of a table; with an expectation the row also says
# whether it held.
#
# Exit codes: 0 red as expected (a list: every row ran, and held where it had
# an expectation) · 1 still green, the test does not see this change (a list:
# some row did not hold) · 2 the change did not apply (or never reached dist)
# · 3 the file was not clean before · 4 the tree did not come back as it was ·
# 5 the build failed with the change in · 6 the test is not green on the
# unchanged code · 7 the test command did not run (126, 127 or a signal) · 64
# usage. In a list a row that could not be judged (2 to 7) wins over 1.
#
# One gap stays, and it errs on the safe side: a filter that matches no test
# (vitest's `-t` with a typo) is green on both runs, so the answer is "does not
# see", never a false red.
#
# While a run is going, nothing else touches the tree, `git stash` included:
# every mutation compares `git status` before and after (CLAUDE.md).
#
# Local only (perl, cmp, a POSIX shell); no workflow, npm script or Windows
# path calls this. A Playwright test command goes under scripts/agir.sh.

set -u

kullanim() {
  echo "kullanım: scripts/mutasyon-kaniti.sh <dosya> <perl-ifadesi> [--derle] [--dist-ara <metin>] -- <test komutu...>" >&2
  echo "          scripts/mutasyon-kaniti.sh --liste <dosya.tsv> [--derle] [--dist-ara <metin>] -- <test komutu...>" >&2
  exit 64
}

[ "$#" -ge 3 ] || kullanim
liste=''
if [ "$1" = --liste ]; then
  liste=$2
  shift 2
else
  dosya=$1
  ifade=$2
  shift 2
fi
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
[ -z "$liste" ] || [ -f "$liste" ] || { echo "liste yok: $liste" >&2; exit 64; }

# 126: found but not executable, 127: not found, above 128: killed by a signal.
kosmadi() { [ "$1" = 126 ] || [ "$1" = 127 ] || [ "$1" -gt 128 ]; }

# ---------------------------------------------------------------- control
if [ "$derle" = 1 ] && ! npx vite build >/dev/null 2>&1; then
  echo "DERLEME DÜŞTÜ: değişmemiş kod derlenmiyor."
  exit 5
fi
echo "== kontrol, değişmemiş kodda: $*"
"$@" >/dev/null 2>&1
kontrol_rc=$?
if kosmadi "$kontrol_rc"; then
  echo "TEST KOŞMADI: kontrol koşusu $kontrol_rc ile döndü, komut çalışmıyor."
  exit 7
fi
if [ "$kontrol_rc" != 0 ]; then
  echo "KONTROL KIRMIZI: test değişmemiş kodda da $kontrol_rc ile düşüyor (ya da hiçbir teste uymuyor). Kırmızısı bir şey kanıtlamaz."
  exit 6
fi
echo "== kontrol yeşil"

# The copy lives in scratch/ (outside git) under a fixed name, overwritten by
# the next run, so nothing has to be deleted afterwards.
mkdir -p scratch/mutasyon-kaniti

# One mutation; prints what happened and returns the exit code above.
bir_mutasyon() {
  local dosya=$1 ifade=$2 yedek once test_rc
  shift 2
  [ -f "$dosya" ] || { echo "dosya yok: $dosya" >&2; return 64; }
  if ! git diff --quiet HEAD -- "$dosya"; then
    echo "DURDU: $dosya HEAD'den farklı; mutasyon temiz bir dosyaya uygulanır."
    return 3
  fi
  yedek="scratch/mutasyon-kaniti/$(basename "$dosya").yedek"
  once="$(git status --porcelain)"
  geri_kondu=0
  geri_dosya=$dosya
  geri_yedek=$yedek

  cp "$dosya" "$yedek"
  trap 'geri_koy; exit 130' INT TERM
  trap 'geri_koy' EXIT
  perl -0pi -e "$ifade" "$dosya"
  if cmp -s "$dosya" "$yedek"; then
    echo "UYGULANMADI: ifade $dosya içinde hiçbir şeye uymadı. Test koşulmadı."
    geri_kondu=1
    trap - EXIT INT TERM
    return 2
  fi
  echo "== uygulanan değişiklik"
  diff -u "$yedek" "$dosya" | sed -n '3,40p'

  if [ "$derle" = 1 ]; then
    if ! npx vite build >/dev/null 2>&1; then
      echo "DERLEME DÜŞTÜ: değişiklikle sayfa derlenmiyor, bu bir test sonucu değil."
      geri_koy
      trap - EXIT INT TERM
      return 5
    fi
    if [ -n "$dist_ara" ]; then
      if [ "$(grep -cF -- "$dist_ara" dist/index.html)" = 0 ]; then
        echo "DIST'E GİRMEDİ: '$dist_ara' dist/index.html'de yok, test bu değişikliği okuyamaz."
        geri_koy
        trap - EXIT INT TERM
        return 2
      fi
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
    return 4
  fi
  echo "== ağaç mutasyondan önceki gibi (git status aynı)"

  if kosmadi "$test_rc"; then
    echo "TEST KOŞMADI: komut $test_rc ile döndü, bu kırmızı sayılmaz."
    return 7
  fi
  if [ "$test_rc" = 0 ]; then
    echo "YEŞİL: test bu değişikliği görmedi."
    return 1
  fi
  echo "KIRMIZI: test bu değişikliği görüyor (çıkış $test_rc)."
  return 0
}

geri_koy() {
  [ "$geri_kondu" = 1 ] && return
  geri_kondu=1
  cp "$geri_yedek" "$geri_dosya"
  if [ "$derle" = 1 ]; then
    npx vite build >/dev/null 2>&1 || echo "UYARI: geri koyduktan sonraki derleme düştü" >&2
  fi
}

if [ -z "$liste" ]; then
  bir_mutasyon "$dosya" "$ifade" "$@"
  exit $?
fi

# ---------------------------------------------------------------- the list
tablo=()
genel=0
tab=$'\t'
while IFS="$tab" read -r ad m_dosya beklenen m_ifade || [ -n "${ad:-}" ]; do
  case $ad in '' | '#'*) continue ;; esac
  if [ -z "${m_ifade:-}" ]; then
    echo "liste satırı eksik: $ad" >&2
    exit 64
  fi
  bir_mutasyon "$m_dosya" "$m_ifade" "$@" >"scratch/mutasyon-kaniti/$ad.log" 2>&1
  rc=$?
  case $rc in
    0) sonuc=kirmizi ;;
    1) sonuc=yesil ;;
    2) sonuc=uygulanmadi ;;
    3) sonuc=dosya-kirli ;;
    4) sonuc=agac-donmedi ;;
    5) sonuc=derleme-dustu ;;
    7) sonuc=test-kosmadi ;;
    *) sonuc="çıkış-$rc" ;;
  esac
  tutar='-'
  case $sonuc in
    kirmizi | yesil)
      if [ "$beklenen" = kirmizi ] || [ "$beklenen" = yesil ]; then
        if [ "$sonuc" = "$beklenen" ]; then tutar=tutuyor; else tutar=TUTMUYOR; [ "$genel" = 0 ] && genel=1; fi
      fi
      ;;
    *) [ "$genel" -le 1 ] && genel=$rc ;;
  esac
  tablo+=("$(printf '%-10s %-28s %-9s %-14s %s' "$ad" "$m_dosya" "$beklenen" "$sonuc" "$tutar")")
  # A tree that did not come back is not a row to carry on from.
  [ "$rc" = 4 ] && break
done <"$liste"

printf '%-10s %-28s %-9s %-14s %s\n' ad dosya beklenen sonuç
printf '%s\n' "${tablo[@]}"
echo "(her satırın çıktısı scratch/mutasyon-kaniti/<ad>.log)"
exit "$genel"
