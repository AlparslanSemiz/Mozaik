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
 * NO SECOND COPY OF THE RULES. Everything it edits, it edits through the same
 * functions the Dersler list uses — `updateLesson`, `transferLesson`,
 * `moveLessonToClass` — with the same `BlockCounts` control (which moved out of
 * `lessons/index.tsx` for exactly this).
 *
 * BOTH ENDS MOVE NOW (2026-08-30). They did not before, and the note here said
 * so: "a lesson whose ends can move is a different lesson". That was a claim
 * about identity, and the reader's answer was about work — the same lesson
 * given to another class, or another teacher, is a thing that happens in a term
 * and retyping it is not an edit, it is a re-entry. Neither is a field write:
 * `placements` is keyed by class and teacher occupancy is derived, so each one
 * lifts its blocks and offers them back, and what will not fit is COUNTED
 * before the question is asked.
 */
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import BlockCounts, { blockCeiling } from '../BlockCounts';
import LimitBox from '../LimitBox';
import { paletteColor } from '../../palette';
import {
  hasTwoSubjects,
  lessonSubject,
  moveLessonToClass,
  subjectLabel,
  teacherSubjects,
  transferLesson,
  updateLesson,
} from '../../entities';
import { useDialogs } from './Dialogs';
import { useToast } from './Toasts';
import type { Id, State } from '../../types';
import { T, useT } from '../T';

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
  const { confirm } = useDialogs();
  const toast = useToast();
  // Read out of the CURRENT state every render rather than captured when the
  // sheet opened: the boxes below write through `change`, and a copy taken at
  // open time would show the reader their own edit failing to happen.
  const lesson = lessonId === null ? undefined : state.lessons.find((x) => x.id === lessonId);
  const group = state.classes.find((c) => c.id === lesson?.classId);
  const teacher = state.teachers.find((x) => x.id === lesson?.teacherId);

  /**
   * Move the lesson to another class.
   *
   * Asked first, because the cost is not visible from the dropdown: an hour the
   * new class is already using cannot take this block, so it goes back to the
   * tray, and a pin on the old class's square has to go with it (it is keyed by
   * class, so left behind it would lock a stranger's hour). Counted after,
   * because the number is what the reader has to act on next — the same shape
   * `Inspector.hand()` has.
   */
  async function handClass(classId: Id) {
    if (lesson === undefined || classId === '' || classId === lesson.classId) return;
    const to = state.classes.find((x) => x.id === classId);
    if (to === undefined) return;
    const preview = moveLessonToClass(state, lesson.id, classId);
    if (
      !(await confirm({
        title: t('Ders {ad} sınıfına taşınsın mı?', { ad: to.name }),
        body:
          preview.returned === 0 && preview.unpinned === 0
            ? t('Yerleşmiş saatler olduğu gibi taşınır. Ctrl+Z ile geri alınabilir.')
            : t(
                '{n} blok havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.',
                { n: preview.returned, s: preview.unpinned },
              ),
        confirmLabel: t('Taşı'),
        danger: preview.returned > 0 || preview.unpinned > 0,
      }))
    ) {
      return;
    }
    change((d) => moveLessonToClass(d, lesson.id, classId).state);
    toast(
      preview.returned === 0
        ? t('Ders {ad} sınıfına taşındı.', { ad: to.name })
        : t('Ders {ad} sınıfına taşındı. {n} blok havuza döndü.', {
            ad: to.name,
            n: preview.returned,
          }),
    );
  }

  /** The same question for the other end. `Inspector` asks it from the entity
      side; this asks it from the lesson's. One function underneath. */
  async function handTeacher(teacherId: Id) {
    if (lesson === undefined || teacherId === '' || teacherId === lesson.teacherId) return;
    const to = state.teachers.find((x) => x.id === teacherId);
    if (to === undefined) return;
    const preview = transferLesson(state, lesson.id, teacherId);
    if (
      !(await confirm({
        title: t('Ders {kim} öğretmenine geçsin mi?', { kim: to.short }),
        body:
          preview.returned === 0
            ? t('Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.')
            : t('{n} blok havuza döner. Ctrl+Z ile geri alınabilir.', { n: preview.returned }),
        confirmLabel: t('Aktar'),
        danger: preview.returned > 0,
      }))
    ) {
      return;
    }
    change((d) => transferLesson(d, lesson.id, teacherId).state);
    toast(
      preview.returned === 0
        ? t('Ders {kim} öğretmenine geçti.', { kim: to.short })
        : t('Ders {kim} öğretmenine geçti. {n} blok havuza döndü.', {
            kim: to.short,
            n: preview.returned,
          }),
    );
  }

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
                {/* BOTH ENDS OF THE LESSON, and until 2026-08-30 neither could
                    be changed anywhere in the program: the hint under this
                    sheet said so in as many words. "dersi düzenle ve öğretmeni
                    düzenleme ve sınıfı düzenlemede her şeyi düzenleyebilelim."

                    Neither is a plain field write, and the two are wrong in
                    opposite ways — see `transferLesson` and
                    `moveLessonToClass` in entities.ts. Both are asked for
                    first, because both can send hours back to the tray and the
                    number is not guessable from the dropdown. */}
                <dt>{t('Sınıf')}</dt>
                <dd>
                  <select
                    aria-label={t('Sınıf')}
                    value={lesson.classId}
                    onChange={(e) => void handClass(e.target.value)}
                  >
                    {state.classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </dd>

                <dt>{t('Öğretmen')}</dt>
                <dd>
                  <select
                    aria-label={t('Öğretmen')}
                    value={lesson.teacherId}
                    onChange={(e) => void handTeacher(e.target.value)}
                  >
                    {state.teachers.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.short} · {teacherSubjects(x).map(subjectLabel).join(' / ')}
                      </option>
                    ))}
                  </select>
                </dd>

                {/* Only for a teacher who holds two: a dropdown with one entry
                    asks nothing. Same rule as the Dersler list. */}
                {teacher !== undefined && hasTwoSubjects(teacher) && (
                  <>
                    <dt>{t('Branş')}</dt>
                    <dd>
                      <select
                        aria-label={t('Branş')}
                        value={lesson.second ? '1' : '0'}
                        onChange={(e) =>
                          change((d) =>
                            updateLesson(d, lesson.id, { second: e.target.value === '1' }),
                          )
                        }
                      >
                        {teacherSubjects(teacher).map((name, i) => (
                          <option key={name} value={i === 0 ? '0' : '1'}>
                            {subjectLabel(name)}
                          </option>
                        ))}
                      </select>
                    </dd>
                  </>
                )}

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
                <T k="**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir." />
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
