// Putting the plans of an all-plans file in place of the plans here, behind
// one question.
//
// Two doors use it: "Tümünü dosyadan aç" in Ayarlar → Planlar ve yedek, and
// the new address receiving the plans from the old one (platform/storage/
// move.ts). The second is not trusted further than the first: the same text,
// the same reader, the same count of what will really happen, and the same
// question before anything is written (TB8).

import {
  BUNDLE_VERSION,
  bundleVersionOf,
  parseBundle,
  readBundlePlans,
  readPlanFile,
} from '../../pure/io';
import { useCallback } from 'react';
import { useDialogs } from './Dialogs';
import type { PlanControls } from './props';
import { useT } from './T';
import { WRONG_FILE } from './wrongFile';

export interface BundleNote {
  bad: boolean;
  text: string;
  /** The refusal is "update first": the note carries the way there. */
  update?: boolean;
}

export interface BundleResult {
  /** What happened, for the page that sent the plans. */
  /** `eksik`: some plans did not fit in storage; the sender keeps a file too. */
  outcome: 'acildi' | 'eksik' | 'vazgecildi' | 'okunamadi';
  /** How many plans landed. */
  opened: number;
  /** The line to show; null when the reader said no and nothing changed. */
  note: BundleNote | null;
}

/**
 * @returns `open(text, title?)`. `title` replaces the question's heading,
 *   for the door that is not a file.
 */
export function useOpenBundle(plans: PlanControls) {
  const t = useT();
  const { confirm } = useDialogs();

  return useCallback(
    async (text: string, title?: string): Promise<BundleResult> => {
      const planCount = plans.library.plans.length;
      const bundle = parseBundle(text);
      if (bundle === null) {
        const version = bundleVersionOf(text);
        // Only a single plan is sent to the top bar, even one it will refuse with
        // a reason of its own (incomplete, newer). A bundle cut short is not a
        // single plan, and "use Dosyadan aç" sent the reader the wrong way
        // (TODO B7.35).
        const single = readPlanFile(text);
        const isPlan = 'state' in single || single.problem !== 'okunamadi';
        const newer = version !== null && version !== BUNDLE_VERSION;
        return {
          outcome: 'okunamadi',
          opened: 0,
          note: {
            bad: true,
            update: newer,
            text: newer
              ? t("Bu dosya Mozaik'in daha yeni bir sürümüyle yazılmış. Mozaik'i güncelleyin.")
              : isPlan
                ? t(
                    'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki "Dosyadan aç" ile açabilirsiniz.',
                  )
                : [t('Bu dosya okunamadı') + '.', ...WRONG_FILE.map((k) => t(k))].join(' '),
          },
        };
      }

      // Read before asking (TB8): the question counts what will really happen,
      // and a file with not one readable plan is never offered as a replacement.
      const read = readBundlePlans(bundle);
      // A plan a newer program wrote needs the program updated, not a better
      // file: it is counted apart and never called incomplete (TODO B7.34).
      const yeni = read.newer.length;
      if (read.plans.length === 0) {
        return {
          outcome: 'okunamadi',
          opened: 0,
          note: {
            bad: true,
            update: yeni > 0,
            text:
              yeni > 0
                ? t("Bu dosya Mozaik'in daha yeni bir sürümüyle yazılmış. Mozaik'i güncelleyin.")
                : t('Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.'),
          },
        };
      }
      // Entries with no id, or the id of an entry before them, are counted
      // with the incomplete ones and named: they used to vanish without a word.
      const dropped = bundle.dropped ?? [];
      const eksik = read.unreadable.length - yeni + dropped.length;
      const named =
        dropped.length > 0
          ? t('Kimliği eksik ya da tekrarlanan plan: {adlar}.', { adlar: dropped.join(', ') })
          : '';
      // A plan here whose counterpart in the file is unreadable stays.
      const stays = plans.library.plans.filter((p) => read.unreadable.includes(p.id)).length;
      const replaced = t(
        'Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.',
        { buradaki: planCount - stays, gelen: read.plans.length },
      );
      if (
        !(await confirm({
          title: title ?? t('Bu bilgisayardaki bütün planların yerine geçecek'),
          body: [
            replaced,
            eksik > 0 ? t('Dosyadaki {eksik} plan eksik ya da bozuk, açılmayacak.', { eksik }) : '',
            named,
            yeni > 0
              ? t(
                  "Dosyadaki {yeni} plan Mozaik'in daha yeni bir sürümüyle yazılmış, açılmayacak. Mozaik'i güncelleyin.",
                  { yeni },
                )
              : '',
          ]
            .filter((x) => x !== '')
            .join(' '),
          confirmLabel: t('Hepsini değiştir'),
          danger: true,
        }))
      ) {
        return { outcome: 'vazgecildi', opened: 0, note: null };
      }

      const { ok, failed, unreadable } = plans.replaceLibrary(bundle);
      // With storage full and not one plan written, nothing changed either, but
      // the reason is the storage, and the note below says so.
      if (ok === 0 && failed === 0) {
        return {
          outcome: 'okunamadi',
          opened: 0,
          note: { bad: true, text: t('Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.') },
        };
      }
      const opened =
        failed > 0
          ? t(
              '{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.',
              { acilan: ok, yazilamayan: failed },
            )
          : eksik > 0
            ? t('{acilan} plan açıldı, {eksik} plan eksik ya da bozuk olduğu için açılmadı.', {
                acilan: ok,
                eksik,
              })
            : t('{acilan} plan açıldı.', { acilan: ok });
      const said = named === '' ? opened : `${opened} ${named}`;
      return {
        outcome: failed > 0 ? 'eksik' : 'acildi',
        opened: ok,
        note: {
          bad: failed > 0 || unreadable > 0 || dropped.length > 0,
          update: yeni > 0,
          text:
            yeni > 0
              ? `${said} ${t("{yeni} plan Mozaik'in daha yeni bir sürümüyle yazıldığı için açılmadı. Mozaik'i güncelleyin.", { yeni })}`
              : said,
        },
      };
    },
    [plans, t, confirm],
  );
}
