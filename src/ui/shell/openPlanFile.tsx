// "Dosyadan aç": a plan file picked in the top bar, read once, refused with
// its own sentence when it cannot be opened, and confirmed with both plans
// counted before it replaces anything.

import type React from 'react';
import type { State } from '../../leaf/model';
import { isEmptyPlan, planSummary } from '../../pure/entities';
import { BUNDLE_VERSION, bundleVersionOf, readPlanFile } from '../../pure/io';
import { WRONG_FILE, type useDialogs, type useT } from '../common';

interface OpenPlanFile {
  state: State;
  loadState: (next: State) => void;
  t: ReturnType<typeof useT>;
  confirm: ReturnType<typeof useDialogs>['confirm'];
  alert: ReturnType<typeof useDialogs>['alert'];
  notify: (text: string) => void;
  /** Opens Ayarlar → Hakkında, where the update button is. */
  goUpdate: () => void;
  /** Opening a file empties the undo history, so a plan emptied by hand still asks. */
  canUndo: boolean;
}

/** The file input's change handler, made for one render of App. */
export function openPlanFile({
  state,
  loadState,
  t,
  confirm,
  alert,
  notify,
  goUpdate,
  canUndo,
}: OpenPlanFile) {
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
          "Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. 'Kaydet' ile kaydettiğiniz dosyayı seçin.",
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
      // A newer file is the one refusal he can act on only elsewhere: the
      // button takes him to the update instead of naming where it is.
      if (newer && !bundle) {
        if (
          await confirm({
            title: t('Bu dosya daha yeni bir sürümle yazılmış'),
            body: t(
              "Bu Mozaik onu açamıyor. Önce Mozaik'i güncelleyin, sonra dosyayı yeniden açın.",
            ),
            confirmLabel: t('Güncellemeleri denetle'),
            cancelLabel: t('Kapat'),
          })
        ) {
          goUpdate();
        }
        return;
      }
      await alert({
        title: bundle ? t('Bu dosya bütün planları içeriyor') : t('Bu dosya okunamadı'),
        tone: 'warn',
        body: bundle
          ? t(
              'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Okul bilgileri → Planlar ve yedek bölümündeki "Bütün planları dosyadan aç" düğmesini kullanın.',
            )
          : WRONG_FILE.map((k) => t(k)).join(' '),
      });
      return;
    }
    // Nothing to lose, nothing to ask: on a first run the question below
    // counted "Şu an: 0 öğretmen, 0 sınıf" in a red dialog, i.e. warned about
    // nothing at the one moment the reader is least sure of himself.
    if (isEmptyPlan(state) && !canUndo) {
      loadState(read.state);
      notify(t('Plan dosyası açıldı.'));
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
        title: t('Açık olan planın yerine geçecek'),
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
                'Ekrandaki plan dosyadakiyle değiştirilecek. Bundan sonra "Geri al" bu açılıştan öncesine dönemez. Vazgeçme ihtimaliniz varsa önce "Kaydet" deyin.',
              )}
            </p>
          </>
        ),
        confirmLabel: t('Planı aç'),
        danger: true,
      }))
    ) {
      return;
    }
    loadState(read.state);
    notify(t('Plan dosyası açıldı.'));
  }
  return fileChosen;
}
