/**
 * Every real keyboard shortcut, in one screen — TASKS.md §6 B6.5.
 *
 * A hand-written table, not one derived from the actual listeners: those live
 * in five separate files (App.tsx, store.ts, drag.ts, rowDrag.ts, poolSplit.ts,
 * Palette.tsx, the Grid). Deriving it would mean teaching each of them to
 * describe itself in Turkish; writing it by hand means this list can go stale,
 * and it is the price of not inventing a description-registry for six rows.
 *
 * Same contract as `useInspect()`/`useLessonEdit()`: a no-op outside the
 * provider, because a trigger button has to be safe to render anywhere.
 * Radix Dialog, `LessonEdit.tsx`'s shell — the focus trap and Escape are not
 * written a third time.
 */
import { createContext, Fragment, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { T, useT } from './T';

type Open = () => void;

const ShortcutsContext = createContext<Open | null>(null);

export function useShortcutsHelp(): Open {
  return useContext(ShortcutsContext) ?? (() => undefined);
}

export function ShortcutsHelpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback<Open>(() => setOpen(true), []);
  return (
    <ShortcutsContext.Provider value={show}>
      {children}
      <ShortcutsHelp open={open} onClose={() => setOpen(false)} />
    </ShortcutsContext.Provider>
  );
}

interface Row {
  keys: string;
  desc: string;
}

interface Group {
  title: string;
  rows: Row[];
}

/* Key names are not translated — a key is the same key in every language.
   Only `desc` goes through `t()`. */
const GROUPS: Group[] = [
  {
    // Not the bare 'Genel': that key is already 'All' elsewhere in the
    // dictionaries (the facet filters), and reusing it here would put "All"
    // on this heading in every translated language.
    title: 'Genel kısayollar',
    rows: [
      { keys: 'Ctrl+K', desc: 'Komut paletini aç/kapat' },
      { keys: 'Alt+1..7', desc: 'Bir sekmeye git' },
      { keys: 'Ctrl+Z', desc: 'Geri al' },
      { keys: 'Ctrl+Y', desc: 'İleri al' },
      { keys: '?', desc: 'Bu ekranı aç' },
      { keys: 'Esc', desc: 'İptal et veya kapat' },
    ],
  },
  {
    title: 'Izgara',
    rows: [
      { keys: 'Delete', desc: 'Odaklı dersi havuza kaldır' },
      { keys: 'Enter', desc: 'Odaklı kartın sağ tık menüsünü aç' },
    ],
  },
  {
    title: 'Listeler',
    rows: [
      { keys: 'Enter', desc: 'Yeni satır ekle veya düzenlemeyi onayla' },
      { keys: '↑ ↓', desc: 'Tutamaktan bir satırı sırada taşı' },
      { keys: 'Home End', desc: 'Satırı listenin başına veya sonuna taşı' },
    ],
  },
  {
    title: 'Diyaloglar',
    rows: [
      { keys: 'Enter', desc: 'Onayla' },
      { keys: 'Esc', desc: 'Kapat' },
    ],
  },
];

function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="sheet sheet-narrow" aria-describedby={undefined}>
          <div className="sheet-head">
            <div className="sheet-id">
              <Dialog.Title className="sheet-title">
                <T k="Klavye kısayolları" />
              </Dialog.Title>
            </div>
            <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
              <X size={18} strokeWidth={2.2} />
            </Dialog.Close>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="sheet-h">{t(group.title)}</h3>
              <dl className="sheet-edit">
                {group.rows.map((row) => (
                  <Fragment key={`${group.title}-${row.desc}`}>
                    <dt>
                      <kbd>{row.keys}</kbd>
                    </dt>
                    <dd>{t(row.desc)}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
