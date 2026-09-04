// The single line under the toolbar: what it says, and how loudly.
//
// A sentence built from data, not a component — Program only draws what comes
// back. The colour is the same functional channel the grid uses: '' plain,
// 'warn' yellow, 'bad' red, 'ok' green.

import type { SolverRun } from '../../useSolver';
import type { Translate } from '../T';
import type { View } from '../../toolState';

/** "3,4" — one decimal, Turkish comma. */
export function seconds(ms: number): string {
  return (ms / 1000).toFixed(1).replace(".", ",");
}

/**
 * The single line under the toolbar. Returns the text and the class that
 * colours it: '' plain, 'warn' yellow, 'bad' red, 'ok' green.
 */
export function describeBar(
  solver: SolverRun,
  view: View,
  t: Translate,
): { text: string; level: string } {
  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text:
        t("Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn", {
          yerlesen: p.placedBlocks,
          toplam: p.totalBlocks,
          sure: seconds(p.elapsedMs),
        }) +
        (p.excludedBlocks > 0
          ? t(" · {n} blok geçici kapsam dışında", { n: p.excludedBlocks })
          : ""),
      level: "busy",
    };
  }

  const done = solver.result;
  // Idle, the bar says what the grid IS rather than sitting blank. It reserves
  // 26px whatever happens, and a sentence that explains the axis you are
  // looking at is worth more there than empty chrome. It used to live beside
  // the view switch, which is now a row further up.
  if (done === null) {
    return {
      text:
        view === "teacher"
          ? t(
              "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
            )
          : t(
              "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
            ),
      level: "",
    };
  }

  if (done.stuck.length === 0) {
    return {
      text:
        t(
          "Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.",
          {
            n: done.placedBlocks,
            sure: seconds(done.elapsedMs),
          },
        ) +
        (done.excludedBlocks > 0
          ? t(" {n} blok geçici kapsam dışında kaldı.", {
              n: done.excludedBlocks,
            })
          : ""),
      level: "ok",
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1
      ? t(" (ve {n} ders daha)", { n: done.stuck.length - 1 })
      : "";
  const head =
    done.phase === "cancelled"
      ? t("Durduruldu. {yerlesen}/{toplam} blok yerleşti.", {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        })
      : t("{yerlesen}/{toplam} blok yerleşti.", {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        });
  return {
    text: t("{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.", {
      bas: head,
      ders: worst.name,
      saat: worst.missing,
      sebep: worst.reason,
      digerleri: others,
    }),
    level: done.phase === "cancelled" ? "warn" : "bad",
  };
}
