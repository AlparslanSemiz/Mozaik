// "Dosyadan aç": a plan file picked in the top bar, read once, refused with
// its own sentence when it cannot be opened, and confirmed with both plans
// counted before it replaces anything.

import type React from 'react';
import type { State } from '../../leaf/model';
import { planSummary } from '../../pure/entities';
import { BUNDLE_VERSION, bundleVersionOf, readPlanFile } from '../../pure/io';
import type { useDialogs, useT } from '../common';

interface OpenPlanFile {
  state: State;
  loadState: (next: State) => void;
  t: ReturnType<typeof useT>;
  confirm: ReturnType<typeof useDialogs>['confirm'];
  alert: ReturnType<typeof useDialogs>['alert'];
  notify: (text: string) => void;
}

/** The file input's change handler, made for one render of App. */
export function openPlanFile({ state, loadState, t, confirm, alert, notify }: OpenPlanFile) {
  async function fileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so the same file can be picked again
    if (file === undefined) return;

    // Read ONCE. The failure path used to call `file.text()` a second time and
    // parse the whole thing again, which made a wrong file the slowest case
    // rather than the fastest. (Both parses are cheap — MEASURED at 0.65 ms for
    // a full 426-placement week — so this is about the shape of the code, not
    // about speed. The thing that actually costs a reader time on this path is
    // the confirmation dialog, and that one is deliberate.)
    // A file deleted, locked or too big between picking and reading rejects
    // here; it is an unreadable file like any other, not a silent nothing (TB1).
    let text: string;
    try {
      text = await file.text();
    } catch {
      text = '';
    }
    const read = readPlanFile(text);
    if ('problem' in read && read.problem === 'eksik') {
      await alert({
        title: t('Bu dosya eksik'),
        tone: 'warn',
        body: t(
          'Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. Program tarafından indirilmiş bir .json yedek dosyası seçin.',
        ),
      });
      return;
    }
    if ('problem' in read) {
      // Three different files can land here and each deserves its own sentence.
      // A BUNDLE is refused rather than opened: it holds every plan, so opening
      // one means replacing the whole library — and the top bar stays the place
      // where no click can lose an afternoon.
      // "Newer" only when it is: a plan past this program's schema, or a
      // bundle past its envelope. An older or odd bundle version is not a
      // reason to update (DENETIM DK10, where a newer PLAN said "okunamadı").
      const version = bundleVersionOf(text);
      const bundle = version === BUNDLE_VERSION;
      const newer = read.problem === 'yeni' || (version !== null && version > BUNDLE_VERSION);
      await alert({
        title: bundle
          ? t('Bu dosya bütün planları içeriyor')
          : newer
            ? t('Bu dosya daha yeni bir sürümle yazılmış')
            : t('Bu dosya okunamadı'),
        tone: 'warn',
        body: bundle
          ? t(
              'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.',
            )
          : newer
            ? t('Programı güncelleyin, sonra tekrar deneyin.')
            : t('Program tarafından indirilmiş bir .json yedek dosyası seçin.'),
      });
      return;
    }
    // Both plans counted side by side (DENETIM Ö43): a file that is empty, or
    // not the one meant, is seen before it replaces anything.
    const inFile = planSummary(read.state);
    const now = planSummary(state);
    const counts = (c: typeof now) => ({
      ogretmen: c.teachers,
      sinif: c.classes,
      ders: c.lessons,
      saat: c.placed,
    });
    if (
      !(await confirm({
        title: t('Şu anki programın yerine geçecek'),
        body: (
          <>
            <p>
              {t(
                'Dosyada: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.',
                counts(inFile),
              )}
              <br />
              {t(
                'Şu an: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.',
                counts(now),
              )}
            </p>
            <p>
              {t(
                'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.',
              )}
            </p>
          </>
        ),
        confirmLabel: t('Yedeği yükle'),
        danger: true,
      }))
    ) {
      return;
    }
    loadState(read.state);
    notify(t('Yedek yüklendi.'));
  }
  return fileChosen;
}
