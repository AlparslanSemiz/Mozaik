/**
 * One teacher, class or room — on its own, over whatever you were looking at.
 *
 * The reader asked for this in one sentence: "her derslik, sınıf ya da
 * öğretmenin üzerine tıklandığında bilgileri ve programının gözükmesi". The
 * information was never missing; it was spread over four tabs. The Program
 * grid held one ROW of it, Müsaitlik held one row of it in the other axis,
 * the Kurulum list held one row of it, and Kontrol held one line — so
 * answering "is MÇ's week actually full?" meant three tab switches and
 * remembering what the first two said.
 *
 * A sheet rather than a tab: the question is always asked ABOUT something you
 * are already looking at, and a seventh destination would make you leave it.
 * Radix Dialog, so the focus trap, the Escape key and the `aria-modal`
 * bookkeeping are not written here for the third time.
 *
 * All of the counting is in `entities.ts` (`entityFacts`, `entityWeek`). This
 * file draws.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarX2, GraduationCap, School, Users, X } from 'lucide-react';
import { entityFacts, entityWeek, hourLabels, shortDay } from '../entities';
import type { InspectKind } from '../entities';
import { paletteColor } from '../palette';
import type { State } from '../types';

interface Target {
  kind: InspectKind;
  id: string;
}

type Open = (kind: InspectKind, id: string) => void;

const InspectContext = createContext<Open | null>(null);

/**
 * Opens the sheet. Returns a no-op outside a provider on purpose: a name in a
 * list should be clickable everywhere, and a screen that happens to render
 * outside the shell must not throw for it.
 */
export function useInspect(): Open {
  return useContext(InspectContext) ?? (() => undefined);
}

const KIND_LABEL: Record<InspectKind, string> = {
  teacher: 'Öğretmen',
  class: 'Sınıf',
  room: 'Derslik',
};

const KIND_ICON: Record<InspectKind, ReactNode> = {
  teacher: <GraduationCap size={18} strokeWidth={2} />,
  class: <Users size={18} strokeWidth={2} />,
  room: <School size={18} strokeWidth={2} />,
};

export function InspectorProvider({
  state,
  children,
}: {
  state: State;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const open = useCallback<Open>((kind, id) => setTarget({ kind, id }), []);

  return (
    <InspectContext.Provider value={open}>
      {children}
      <Inspector state={state} target={target} onClose={() => setTarget(null)} />
    </InspectContext.Provider>
  );
}

function Inspector({
  state,
  target,
  onClose,
}: {
  state: State;
  target: Target | null;
  onClose: () => void;
}) {
  // Recomputed only while the sheet is open: `entityWeek` walks every
  // placement, and the grid behind this must not pay for a closed sheet.
  const view = useMemo(() => {
    if (target === null) return null;
    const facts = entityFacts(state, target.kind, target.id);
    if (facts === null) return null;
    return { facts, week: entityWeek(state, target.kind, target.id) };
  }, [state, target]);

  const hours = hourLabels(state.settings.hours.length, state.settings.hours.join(','));

  return (
    <Dialog.Root open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="sheet" aria-describedby={undefined}>
          {target !== null && view !== null ? (
            <>
              <div className="sheet-head">
                <span
                  className="sheet-mark"
                  style={
                    view.facts.color === null
                      ? undefined
                      : { background: paletteColor(view.facts.color) }
                  }
                  aria-hidden="true"
                >
                  {view.facts.color === null ? KIND_ICON[target.kind] : view.facts.short}
                </span>
                <div className="sheet-id">
                  <Dialog.Title className="sheet-title">{view.facts.name}</Dialog.Title>
                  <span className="sheet-kind">{KIND_LABEL[target.kind]}</span>
                </div>
                <Dialog.Close className="btn icon" aria-label="Kapat">
                  <X size={18} strokeWidth={2.2} />
                </Dialog.Close>
              </div>

              <ul className="sheet-links">
                {view.facts.links.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <dl className="sheet-facts">
                {view.facts.rows.map((row) => (
                  <div key={row.label} className={row.tight ? 'tight' : undefined}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="sheet-h">Haftalık programı</h3>
              {/* Row = day, column = lesson: the same way round as Müsaitlik
                  and the printed sheet, because this is a "read one day"
                  screen. The Program grid is the other way round on purpose. */}
              <div className="scroll-x">
                <table className="sheet-week">
                  <thead>
                    <tr>
                      <th />
                      {hours.map((label, h) => (
                        <th key={h}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {view.week.map((row, day) => (
                      <tr key={day}>
                        <th>{shortDay(state.settings.days[day]?.name ?? '')}</th>
                        {row.map((cell, hour) => (
                          <td
                            key={hour}
                            className={[
                              cell.color === null && cell.closed ? 'unavailable' : '',
                              cell.conflict ? 'conflict' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={
                              cell.color === null
                                ? undefined
                                : { background: paletteColor(cell.color) }
                            }
                            title={cell.top === '' ? undefined : `${cell.top} ${cell.bottom}`}
                          >
                            {cell.top !== '' && (
                              <>
                                <span className="sheet-cell-top">{cell.top}</span>
                                <span className="sheet-cell-bottom">{cell.bottom}</span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="hint">
                <CalendarX2 size={14} strokeWidth={2} aria-hidden="true" /> Kapalı saatler
                taralı. Değiştirmek için <b>Müsaitlik</b> sekmesine gidin; kırmızı çerçeve,
                kapatıldıktan sonra yerinde kalmış bir derstir.
              </p>
            </>
          ) : (
            <div className="sheet-head">
              <Dialog.Title className="sheet-title">Kayıt bulunamadı</Dialog.Title>
              <Dialog.Close className="btn icon" aria-label="Kapat">
                <X size={18} strokeWidth={2.2} />
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
