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
 * file draws — and, since 2026-08-30, EDITS: "öğretmeni düzenleme ve sınıfı
 * düzenlemede her şeyi düzenleyebilelim". Every box in the block below is the
 * control the Okul list draws, bound to the same mutator (`updateTeacher`,
 * `updateClass`, `updateRoom`, `setTeacherLimit`), so there is no second copy
 * of any rule. What is new is the ROAD: the grid's row head, a card's
 * right-click menu and the command palette all open this, and none of them
 * used to end anywhere you could change a name.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarX2, X } from 'lucide-react';
import {
  entityFacts,
  entityWeek,
  genderCell,
  hourLabels,
  setTeacherLimit,
  shortDay,
  subjectKey,
  subjectOption,
  subjectOptions,
  transferLesson,
  updateClass,
  updateRoom,
  updateTeacher,
} from '../../entities';
import ColorPick from '../common/ColorPick';
import LimitBox from '../common/LimitBox';
import { placedBlocks } from '../../constraints';
import { useDialogs } from './Dialogs';
import { useToast } from './Toasts';
import type { InspectKind } from '../../entities';
import { paletteColor } from '../../palette';
import { KIND_ICON } from '../common/steps';
import type { Gender, State } from '../../types';
import { T, useT } from '../T';

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

/** Blank first: it is the value a teacher starts at, and the honest default. */
const GENDERS: Gender[] = ['', 'k', 'e'];

const KIND_LABEL: Record<InspectKind, string> = {
  teacher: 'Öğretmen',
  class: 'Sınıf',
  room: 'Derslik',
};

/* Read from `steps.tsx` rather than drawn again here. `InspectKind` and the
   availability `Kind` are the same three words, and the sheet used lucide's
   mortarboard while the strip two rows above it used the house one — the same
   teacher with two faces on one screen. */

export function InspectorProvider({
  state,
  change,
  children,
}: {
  state: State;
  // The panel used to be read-only, so this is new. It is here rather than in
  // the sheet because the provider is the only thing that knows the store, and
  // the sheet is drawn from it.
  change: (apply: (d: State) => State) => void;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const open = useCallback<Open>((kind, id) => setTarget({ kind, id }), []);

  return (
    <InspectContext.Provider value={open}>
      {children}
      <Inspector
        state={state}
        change={change}
        target={target}
        onClose={() => setTarget(null)}
      />
    </InspectContext.Provider>
  );
}

function Inspector({
  state,
  change,
  target,
  onClose,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  target: Target | null;
  onClose: () => void;
}) {
  const t = useT();
  const { confirm } = useDialogs();
  const toast = useToast();
  const lessonTeacher = (lessonId: string) =>
    state.lessons.find((x) => x.id === lessonId)?.teacherId ?? '';

  // The RECORD behind the sheet, when there is one to edit. `entityFacts` gives
  // a drawing (`name`, `short`, `color`, rows of text); the boxes below write
  // to the entity itself, so they need it.
  const teacherOf =
    target?.kind === 'teacher' ? state.teachers.find((x) => x.id === target.id) : undefined;
  const classOf =
    target?.kind === 'class' ? state.classes.find((x) => x.id === target.id) : undefined;
  const roomOf = target?.kind === 'room' ? state.rooms.find((x) => x.id === target.id) : undefined;
  const subjects = subjectOptions(state);

  /** One name, three tables. Trimmed, and an empty name is refused rather than
      written: a nameless row is unfindable everywhere else. */
  function rename(raw: string) {
    const name = raw.trim();
    if (name === '') return;
    if (teacherOf !== undefined) change((d) => updateTeacher(d, teacherOf.id, { name }));
    else if (classOf !== undefined) change((d) => updateClass(d, classOf.id, { name }));
    else if (roomOf !== undefined) change((d) => updateRoom(d, roomOf.id, name));
  }

  /**
   * Hands one lesson to another teacher.
   *
   * Confirmed before it happens, because the blocks that clash on the new
   * teacher's week go back to the tray and there is no way to know from the
   * dropdown how many that will be. Counted after, because the number is what
   * the reader has to act on next.
   */
  async function hand(lessonId: string, other: string, teacherId: string) {
    if (teacherId === '') return;
    const to = state.teachers.find((x) => x.id === teacherId);
    if (to === undefined) return;

    const placed = placedBlocks(state, state.lessons.find((x) => x.id === lessonId)!).length;
    if (
      !(await confirm({
        title: t('{ne} dersi {kim} öğretmenine geçecek', { ne: other, kim: to.short }),
        body:
          placed === 0
            ? t('Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.')
            : t(
                'Programdaki {n} bloğu yeni öğretmenin haftasına göre yeniden denenecek; sığmayanlar havuza döner.',
                { n: placed },
              ),
        confirmLabel: t('Aktar'),
      }))
    ) {
      return;
    }

    let returned = 0;
    change((d) => {
      const result = transferLesson(d, lessonId, teacherId);
      returned = result.returned;
      return result.state;
    });
    toast(
      returned === 0
        ? t('{ne} dersi {kim} öğretmenine geçti.', { ne: other, kim: to.short })
        : t('{ne} dersi {kim} öğretmenine geçti. {n} blok havuza döndü.', {
            ne: other,
            kim: to.short,
            n: returned,
          }),
    );
  }

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
                  <span className="sheet-kind">{t(KIND_LABEL[target.kind])}</span>
                </div>
                <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
                  <X size={18} strokeWidth={2.2} />
                </Dialog.Close>
              </div>

              {/* WHAT IT IS, editable where it is read.
                  ("öğretmeni düzenleme ve sınıfı düzenlemede her şeyi
                   düzenleyebilelim")

                  Every control here is the one the Okul list draws, bound to
                  the same mutator: nothing is re-implemented, so a rule cannot
                  mean one thing in a list and another in a sheet. What this
                  buys is the road — from the grid, from a card's right-click
                  menu, from the command palette — without going to find the
                  row in a table first.

                  `defaultValue` + `onBlur` + a `key`, not a controlled box: a
                  re-render on every keystroke takes the focus with it
                  (pitfall 3), and the key makes the box forget its draft when
                  a different entity is opened in the same sheet. */}
              <dl className="sheet-edit">
                <dt>{t('Ad')}</dt>
                <dd>
                  <input
                    type="text"
                    className="dlg-input"
                    aria-label={t('Ad')}
                    key={`n-${target.id}-${view.facts.name}`}
                    defaultValue={view.facts.name}
                    onBlur={(e) => rename(e.target.value)}
                  />
                </dd>

                {teacherOf !== undefined && (
                  <>
                    <dt>{t('Kısaltma')}</dt>
                    <dd>
                      <input
                        type="text"
                        className="text-sm"
                        aria-label={t('Kısaltma')}
                        key={`s-${teacherOf.id}-${teacherOf.short}`}
                        defaultValue={teacherOf.short}
                        onBlur={(e) =>
                          change((d) =>
                            updateTeacher(d, teacherOf.id, { short: e.target.value.trim() }),
                          )
                        }
                      />
                    </dd>

                    <dt>{t('Branş')}</dt>
                    <dd>
                      <select
                        aria-label={t('Branş')}
                        value={teacherOf.subject}
                        onChange={(e) =>
                          change((d) =>
                            updateTeacher(d, teacherOf.id, { subject: e.target.value }),
                          )
                        }
                      >
                        {subjects.map((x) => (
                          <option key={x} value={x}>
                            {subjectOption(state.settings, x)}
                          </option>
                        ))}
                      </select>
                    </dd>

                    {/* Blank first, and that is how it is emptied again: a
                        second branch that can be added but not removed is a
                        one-way door. Clearing it also clears the flag on that
                        teacher's lessons — `sanitize()`. */}
                    <dt>{t('2. branş')}</dt>
                    <dd>
                      <select
                        aria-label={t('2. branş')}
                        value={teacherOf.subject2}
                        onChange={(e) =>
                          change((d) =>
                            updateTeacher(d, teacherOf.id, { subject2: e.target.value }),
                          )
                        }
                      >
                        <option value="">{t('Yok')}</option>
                        {subjects
                          .filter((x) => subjectKey(x) !== subjectKey(teacherOf.subject))
                          .map((x) => (
                            <option key={x} value={x}>
                              {subjectOption(state.settings, x)}
                            </option>
                          ))}
                      </select>
                    </dd>

                    <dt>{t('Cinsiyet')}</dt>
                    <dd>
                      <select
                        aria-label={t('Cinsiyet')}
                        value={teacherOf.gender}
                        onChange={(e) =>
                          change((d) =>
                            updateTeacher(d, teacherOf.id, { gender: e.target.value as Gender }),
                          )
                        }
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{genderCell(g)}</option>
                        ))}
                      </select>
                    </dd>

                    <dt>{t('Renk')}</dt>
                    <dd>
                      <ColorPick
                        value={teacherOf.color}
                        owner={teacherOf.short}
                        onChange={(next) =>
                          change((d) => updateTeacher(d, teacherOf.id, { color: next }))
                        }
                      />
                    </dd>

                    {/* The three per-teacher limits, and the placeholder in
                        each is the school-wide number one layer up — a box
                        whose placeholder shows a value that will never be used
                        would be lying. */}
                    <dt>{t('Art arda en fazla')}</dt>
                    <dd>
                      <LimitBox
                        value={teacherOf.limits.maxConsecutive}
                        fallback={state.settings.limits.maxConsecutive}
                        title={t('{kim} art arda en fazla kaç saat', { kim: teacherOf.short })}
                        onSet={(v) =>
                          change((d) => setTeacherLimit(d, teacherOf.id, 'maxConsecutive', v))
                        }
                      />
                    </dd>
                    <dt>{t('Günde en fazla')}</dt>
                    <dd>
                      <LimitBox
                        value={teacherOf.limits.maxPerDay}
                        fallback={state.settings.limits.maxPerDay}
                        title={t('{kim} günde en fazla kaç saat', { kim: teacherOf.short })}
                        onSet={(v) =>
                          change((d) => setTeacherLimit(d, teacherOf.id, 'maxPerDay', v))
                        }
                      />
                    </dd>
                    <dt>{t('Geldiği gün en az')}</dt>
                    <dd>
                      <LimitBox
                        value={teacherOf.limits.minPerDay}
                        fallback={state.settings.limits.minPerDay}
                        title={t('{kim} geldiği gün en az kaç saat', { kim: teacherOf.short })}
                        onSet={(v) =>
                          change((d) => setTeacherLimit(d, teacherOf.id, 'minPerDay', v))
                        }
                      />
                    </dd>
                  </>
                )}

                {classOf !== undefined && (
                  <>
                    <dt>{t('Derslik')}</dt>
                    <dd>
                      <select
                        aria-label={t('Derslik')}
                        value={classOf.roomId ?? ''}
                        onChange={(e) =>
                          change((d) =>
                            updateClass(d, classOf.id, {
                              roomId: e.target.value === '' ? null : e.target.value,
                            }),
                          )
                        }
                      >
                        <option value="">{t('Derslik yok')}</option>
                        {state.rooms.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </dd>

                    <dt>{t('Renk')}</dt>
                    <dd>
                      <ColorPick
                        value={classOf.color}
                        owner={classOf.name}
                        onChange={(next) =>
                          change((d) => updateClass(d, classOf.id, { color: next }))
                        }
                      />
                    </dd>

                    {/* The MIDDLE layer of the daily limit: the lesson's own
                        box overrides this, this overrides the school's. */}
                    <dt>{t('Günde aynı dersten en fazla')}</dt>
                    <dd>
                      <LimitBox
                        value={classOf.maxSameLessonPerDay}
                        fallback={state.settings.limits.maxSameLessonPerDay}
                        title={t('{ad} bir günde aynı dersten en fazla kaç saat', {
                          ad: classOf.name,
                        })}
                        onSet={(v) =>
                          change((d) => updateClass(d, classOf.id, { maxSameLessonPerDay: v }))
                        }
                      />
                    </dd>
                  </>
                )}
              </dl>

              <ul className="sheet-links">
                {view.facts.links.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              {/* "Öğretmenin bilgisine girip bir sınıfı başka bir hocaya
                  aktarma olsun." The lessons are already named a line above,
                  in a sentence; a sentence cannot be acted on, so they are
                  drawn again as rows with the ids kept. Both panels do it and
                  they are mirrors: a teacher's rows move the CLASS to another
                  teacher, a class's rows move the TEACHER of one lesson. */}
              {view.facts.lessons.length > 0 && target.kind !== 'room' && (
                <>
                  {/* Not "Dersleri": that name is a substring of the Dersler
                      tab's, and `getByRole(name:)` matches substrings
                      case-insensitively (pitfalls 49 and 74). Naming the
                      DIRECTION also says which way the transfer goes. */}
                  <h3 className="sheet-h">
                    {target.kind === 'teacher' ? t('Verdiği dersler') : t('Aldığı dersler')}
                  </h3>
                  <table className="sheet-lessons">
                    <tbody>
                      {view.facts.lessons.map((x) => (
                        <tr key={x.id}>
                          <td>{x.other}</td>
                          <td className="hint">{x.subject}</td>
                          <td className="num">{t('{n} saat', { n: x.weeklyHours })}</td>
                          <td>
                            <select
                              className="transfer-pick"
                              value=""
                              aria-label={t('{ne} dersini başka öğretmene aktar', { ne: x.other })}
                              onChange={(e) => void hand(x.id, x.other, e.target.value)}
                            >
                              <option value="">{t('Başka hocaya aktar…')}</option>
                              {state.teachers
                                .filter((teacher) => teacher.id !== lessonTeacher(x.id))
                                .map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.short} · {teacher.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <dl className="sheet-facts">
                {view.facts.rows.map((row) => (
                  <div key={row.label} className={row.tight ? 'tight' : undefined}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="sheet-h">{t('Haftalık programı')}</h3>
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
                <CalendarX2 size={14} strokeWidth={2} aria-hidden="true" />{' '}
                <T k="Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin." />
              </p>
            </>
          ) : (
            <div className="sheet-head">
              <Dialog.Title className="sheet-title">{t('Kayıt bulunamadı')}</Dialog.Title>
              <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
                <X size={18} strokeWidth={2.2} />
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
