/**
 * One lesson, edited WHERE IT IS — over the timetable, without leaving it.
 *
 * Asked for as the middle item of the grid's right-click menu: "kaldır, dersi
 * düzenle, dersi oraya sabitle". The other two items act on a square; this one
 * acts on the lesson behind it, and until now that meant leaving Program for
 * Dersler, finding the row and coming back to see what it did.
 *
 * A sheet rather than a tab, for the same reason `Inspector.tsx` is one: the
 * question is asked ABOUT something already on screen. Radix Dialog, so the
 * focus trap, Escape and the `aria-modal` bookkeeping are not written a fourth
 * time.
 *
 * NO SECOND COPY OF THE RULES. The three things it edits are the three the
 * Dersler list edits, through the same `updateLesson`, with the same
 * `BlockCounts` control (which moved out of `lessons/index.tsx` for exactly
 * this). Class and teacher are shown and NOT editable — they are not editable
 * in the list either, and a lesson whose ends can move is a different lesson.
 */
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import BlockCounts, { blockCeiling } from './BlockCounts';
import LimitBox from './LimitBox';
import { paletteColor } from '../palette';
import { lessonSubject, subjectLabel, updateLesson } from '../entities';
import type { Id, State } from '../types';
import { T, useT } from './T';

type Open = (lessonId: Id) => void;

const EditContext = createContext<Open | null>(null);

/**
 * Opens the sheet. A no-op outside a provider on purpose, the same contract
 * `useInspect()` keeps: a menu item should be safe to draw anywhere, and a
 * screen rendered outside the shell must not throw for it.
 */
export function useLessonEdit(): Open {
  return useContext(EditContext) ?? (() => undefined);
}

export function LessonEditProvider({
  state,
  change,
  children,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  children: ReactNode;
}) {
  const [lessonId, setLessonId] = useState<Id | null>(null);
  const open = useCallback<Open>((id) => setLessonId(id), []);

  return (
    <EditContext.Provider value={open}>
      {children}
      <LessonSheet
        state={state}
        change={change}
        lessonId={lessonId}
        onClose={() => setLessonId(null)}
      />
    </EditContext.Provider>
  );
}

function LessonSheet({
  state,
  change,
  lessonId,
  onClose,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  lessonId: Id | null;
  onClose: () => void;
}) {
  const t = useT();
  // Read out of the CURRENT state every render rather than captured when the
  // sheet opened: the boxes below write through `change`, and a copy taken at
  // open time would show the reader their own edit failing to happen.
  const lesson = lessonId === null ? undefined : state.lessons.find((x) => x.id === lessonId);
  const group = state.classes.find((c) => c.id === lesson?.classId);
  const teacher = state.teachers.find((x) => x.id === lesson?.teacherId);

  return (
    <Dialog.Root open={lessonId !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="sheet sheet-narrow" aria-describedby={undefined}>
          {lesson !== undefined ? (
            <>
              <div className="sheet-head">
                <span
                  className="sheet-mark"
                  style={{ background: paletteColor(teacher?.color ?? 0) }}
                  aria-hidden="true"
                >
                  {teacher?.short ?? '?'}
                </span>
                <div className="sheet-id">
                  <Dialog.Title className="sheet-title">
                    {group?.name ?? '?'} · {teacher?.name ?? '?'}
                  </Dialog.Title>
                  <span className="sheet-kind">{subjectLabel(lessonSubject(state, lesson))}</span>
                </div>
                <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
                  <X size={18} strokeWidth={2.2} />
                </Dialog.Close>
              </div>

              <dl className="sheet-edit">
                <dt>{t('Haftalık saat')}</dt>
                <dd>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    className="num"
                    aria-label={t('Haftalık saat')}
                    // defaultValue + onBlur, keyed by the lesson: a controlled
                    // box here would re-render on every keystroke and take the
                    // focus with it (pitfall 3). The key makes the box forget
                    // its draft when a different lesson is opened.
                    key={`h-${lesson.id}-${lesson.weeklyHours}`}
                    defaultValue={lesson.weeklyHours}
                    onBlur={(e) =>
                      change((d) =>
                        updateLesson(d, lesson.id, {
                          weeklyHours: Math.max(1, Number(e.target.value) || 1),
                        }),
                      )
                    }
                  />
                </dd>

                <dt>{t('Dağılım')}</dt>
                <dd>
                  <BlockCounts
                    weeklyHours={lesson.weeklyHours}
                    blocks={lesson.blocks}
                    dayLimit={blockCeiling(state, lesson)}
                    title={t(
                      'Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da',
                    )}
                    onPick={(blocks) => change((d) => updateLesson(d, lesson.id, { blocks }))}
                  />
                </dd>

                <dt>{t('Günde en fazla')}</dt>
                <dd>
                  <LimitBox
                    value={lesson.maxPerDay}
                    fallback={state.settings.limits.maxSameLessonPerDay}
                    title={t('Bu ders bir günde en fazla kaç saat')}
                    onSet={(v) => change((d) => updateLesson(d, lesson.id, { maxPerDay: v }))}
                  />
                </dd>
              </dl>

              <p className="hint">
                <T k="Sınıf ve öğretmen burada değişmez. **Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir." />
              </p>
            </>
          ) : (
            <div className="sheet-head">
              <Dialog.Title className="sheet-title">{t('Ders bulunamadı')}</Dialog.Title>
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
