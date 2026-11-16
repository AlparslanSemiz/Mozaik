/**
 * Every real keyboard shortcut, in one screen — TODO.md §6 B6.5.
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
import { T, useReturnFocus, useT } from '../common';

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
      { keys: 'Alt+1..5', desc: 'Bir sekmeye git' },
      { keys: 'Ctrl+Z', desc: 'Geri al' },
      { keys: 'Ctrl+Y', desc: 'İleri al' },
      { keys: 'Ctrl+Shift+Z', desc: 'İleri al' },
      { keys: '?', desc: 'Bu ekranı aç' },
      { keys: 'Esc', desc: 'İptal et veya kapat' },
    ],
  },
  {
    title: 'Izgara',
    rows: [
      { keys: 'Tab', desc: 'Izgaraya gir, bir daha basınca çık' },
      { keys: '← → ↑ ↓', desc: 'Hücreden hücreye git' },
      { keys: 'Home End', desc: 'Satırın başına veya sonuna git, Ctrl ile ilk veya son satıra' },
      { keys: 'Delete Backspace', desc: 'Odaklı dersi havuza kaldır' },
      { keys: 'Enter Space', desc: 'Odaklı dersin sağ tık menüsünü aç' },
      { keys: 'T', desc: 'Odaklı dersi taşımak için al' },
      { keys: 'P', desc: 'Odaklı dersi sabitle veya sabitlemeyi kaldır' },
    ],
  },
  {
    title: 'Havuz',
    rows: [
      { keys: '← →', desc: 'Dersler arasında git' },
      { keys: 'Enter Space T', desc: 'Odaklı dersi ızgaraya koymak için al' },
      { keys: '↑ ↓ Home End', desc: 'Tutamakta: havuzun boyunu değiştir, Shift ile daha çok' },
    ],
  },
  {
    // The keyboard's pick-up (drag.ts `startKeys`) and the mouse's drag share Esc.
    title: 'Ders eldeyken',
    rows: [
      { keys: '← →', desc: 'Hedefi bir saat kaydır' },
      { keys: 'Ctrl+← →', desc: 'Bırakılabilecek bir sonraki saate git' },
      { keys: '↑ ↓', desc: 'Önceki veya sonraki güne git' },
      { keys: 'Enter Space', desc: 'Buraya bırak' },
      { keys: 'Esc', desc: 'Vazgeç, sürüklerken de' },
    ],
  },
  {
    title: 'Gelemediği saatler',
    rows: [
      { keys: '← → ↑ ↓', desc: 'Hücreden hücreye git' },
      { keys: 'Space Enter', desc: 'Saati aç veya kapat, başlıkta bütün günü veya saati' },
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
  const returnFocus = useReturnFocus(open);
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
                  <Fragment key={`${group.title}-${row.keys}`}>
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
