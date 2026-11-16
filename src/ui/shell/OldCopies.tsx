// Dosya ▾ → Eski hâline dön (Sadeleşme K8, 2026-11-16): the open plan as it
// was at the end of each of its last days, newest first, and one button a day.
// The copies are kept by themselves (`platform/storage/dailyCopies.ts`);
// what a restore does to the plan in front of it is App's `restoreCopy`.
//
// Words for a reader who has trouble seeing and is not technical: a day's
// name and date ("Salı 12 Kasım"), the yesterday button says "Dünkü hâline
// dön", and the counts are the ones the backups table already uses.

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { gunYazisi } from '../../leaf/app';
import { WEEK, dayLabel } from '../../leaf/lang';
import type { State } from '../../leaf/model';
import { dailyCopies, isoDay } from '../../platform/storage';
import { activePlacements } from '../../pure/grid';
import { T, useReturnFocus, useT } from '../common';

interface Props {
  open: boolean;
  onClose: () => void;
  planId: string;
  state: State;
  /** `day` as the reader sees it: "Salı 12 Kasım". */
  restore: (copy: State, day: string) => void;
}

/** "Salı 12 Kasım", the weekday read off the date itself. */
function dayName(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = new Date(Date.UTC(y!, m! - 1, d)).getUTCDay();
  return gunYazisi(iso, dayLabel(WEEK[(weekday + 6) % 7]!));
}

export default function OldCopies({ open, onClose, planId, state, restore }: Props) {
  const t = useT();
  const returnFocus = useReturnFocus(open);
  // Read only while open: the dialog is mounted all the time.
  const now = open ? JSON.stringify(state) : '';
  const copies = open ? dailyCopies(planId).filter((c) => JSON.stringify(c.state) !== now) : [];
  const day = new Date();
  day.setDate(day.getDate() - 1);
  const yesterday = isoDay(day.getTime());
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content
          className="sheet sheet-narrow"
          aria-describedby={undefined}
          onCloseAutoFocus={returnFocus}
        >
          <div className="sheet-head">
            <div className="sheet-id">
              <Dialog.Title className="sheet-title">{t('Eski hâline dön')}</Dialog.Title>
            </div>
            <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
              <X size={18} strokeWidth={2.2} />
            </Dialog.Close>
          </div>
          <p>
            <T k="Mozaik her gün bu planın bir kopyasını kendiliğinden saklar, **son 7 gün** burada. Döndüğünüzde şimdiki hâli de saklanır ve **Geri al** ile geri gelir." />
          </p>
          {copies.length === 0 ? (
            <p className="hint">
              {t('Henüz eski bir kopya yok. İlki, yarın bir şey değiştirdiğinizde burada olur.')}
            </p>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>{t('Gün')}</th>
                  <th className="num">{t('Öğretmen')}</th>
                  <th className="num">{t('Ders')}</th>
                  <th className="num">{t('Yerleşmiş saat')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {copies.map((c) => (
                  <tr key={c.day}>
                    <th scope="row">{dayName(c.day)}</th>
                    <td className="num">{c.state.teachers.length}</td>
                    <td className="num">{c.state.lessons.length}</td>
                    <td className="num">{Object.keys(activePlacements(c.state)).length}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => {
                          onClose();
                          restore(c.state, dayName(c.day));
                        }}
                      >
                        {c.day === yesterday ? t('Dünkü hâline dön') : t('Bu hâline dön')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
