/**
 * Ctrl+K: go anywhere, find anything, do the frequent things.
 *
 * With 25 teachers, 20 classes, 8 rooms and 99 lessons, every one of them is
 * reachable — and reaching one means picking the right tab, then the right
 * step, then scanning a column. This is one box: type three letters of a name
 * and press Enter.
 *
 * It matters more than usual here rather than less. The reader has trouble
 * seeing, and typing what you are looking for is easier than scanning for it.
 *
 * Matching is `fold()` from listview.ts — the same Turkish-aware folding the
 * lists use, so "ogretmen" finds "Öğretmen" and "ilknur" finds "İlknur" in
 * both places or in neither.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CornerDownLeft, Search } from 'lucide-react';
import { fold } from '../../lists/listview';
import { useT } from '../T';

export interface Command {
  id: string;
  label: string;
  /** The group heading it is listed under. */
  group: string;
  /** Anything else a search should match: a subject, a class name. */
  extra?: string;
  /** Small text down the right: a shortcut, a count, a subtitle. */
  hint?: string;
  icon?: ReactNode;
  run: () => void;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
}

/** How many rows are drawn. 99 lessons plus 53 entities is not a list. */
const LIMIT = 40;

export default function Palette({ open, onOpenChange, commands }: Props) {
  const t = useT();
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // A palette that opens showing yesterday's search is a palette you have to
  // clear before you can use it.
  useEffect(() => {
    if (open) {
      setText('');
      setActive(0);
    }
  }, [open]);

  const shown = useMemo(() => {
    const needle = fold(text.trim());
    const words = needle === '' ? [] : needle.split(/\s+/);
    const rows = commands.filter((c) => {
      if (words.length === 0) return true;
      const hay = fold(`${c.label} ${c.group} ${c.extra ?? ''}`);
      return words.every((w) => hay.includes(w));
    });
    return rows.slice(0, LIMIT);
  }, [commands, text]);

  // The highlight has to stay INSIDE the list, and the list shrinks as you
  // type: a cursor left pointing at row 30 of a 2-row result selects nothing.
  const index = Math.min(active, Math.max(0, shown.length - 1));

  function choose(command: Command | undefined) {
    if (command === undefined) return;
    onOpenChange(false);
    command.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, shown.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(shown.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(shown[index]);
    }
  }

  // Keeps the highlighted row on screen while the arrows walk past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [index, shown]);

  let lastGroup = '';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="palette" aria-describedby={undefined} onKeyDown={onKeyDown}>
          <Dialog.Title className="hidden">{t('Komut paleti')}</Dialog.Title>
          <div className="palette-search">
            <Search size={18} strokeWidth={2} aria-hidden="true" />
            <input
              type="text"
              autoFocus
              value={text}
              aria-label={t('Ara veya komut yaz')}
              placeholder={t('Öğretmen, sınıf, derslik ara ya da bir komut yaz…')}
              onChange={(e) => {
                setText(e.target.value);
                setActive(0);
              }}
            />
            <kbd>{t('Esc')}</kbd>
          </div>

          <div className="palette-list" ref={listRef} role="listbox" aria-label={t('Sonuçlar')}>
            {shown.length === 0 && <p className="palette-empty">{t('Eşleşen bir şey yok.')}</p>}
            {shown.map((c, i) => {
              const heading = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              return (
                <div key={c.id}>
                  {heading !== null && <div className="palette-group">{heading}</div>}
                  <button
                    className="palette-row"
                    role="option"
                    aria-selected={i === index}
                    data-active={i === index}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(c)}
                  >
                    {c.icon !== undefined && (
                      <span className="palette-icon" aria-hidden="true">
                        {c.icon}
                      </span>
                    )}
                    <span className="palette-label">{c.label}</span>
                    {c.hint !== undefined && <span className="palette-hint">{c.hint}</span>}
                    {i === index && (
                      <CornerDownLeft
                        className="palette-enter"
                        size={14}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              );
            })}
            {commands.length > shown.length && text.trim() === '' && (
              <p className="palette-empty">
                …ve {commands.length - shown.length} tane daha. Aramak için yazın.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
