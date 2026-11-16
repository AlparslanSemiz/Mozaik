// The "Yeni ders" block of the Dersler tab: the add row and the paste dialog.
// The draft lives here, not in the list, because nothing else reads it; in a
// focused mode the class or the teacher comes from the ribbon (`focused`).

import { useMemo, useState } from 'react';
import {
  blockPlan,
  clampBlocks,
  patternLabel,
  type ClassGroup,
  type Id,
  type State,
  type Teacher,
} from '../../leaf/model';
import type { LessonMode } from '../../platform/prefs';
import {
  useDialogs,
  BlockPatternPicker as BlockCounts,
  blockCeiling,
  Field,
  NextStep,
  T,
  useT,
} from '../common';
import { parseLessons } from '../../pure/io';
import { buildCapacity } from '../../pure/feasibility';
import {
  addLesson,
  addLessonsFromRows,
  hasTwoSubjects,
  subjectLabel,
  teacherSubjects,
} from '../../pure/entities';
import { Paste, AddPanel } from '../lists';
import {
  afterAdd,
  DEFAULT_LESSON_HOURS,
  chooseSubject as chooseSubjectIn,
  chooseTeacher as chooseTeacherIn,
  lessonChoices,
  type LessonDraft,
} from '../../pure/forms';

interface Props {
  state: State;
  change: (fn: (d: State) => State) => void;
  mode: LessonMode;
  /** The teacher or class the ribbon has open; undefined in Genel or when there is none. */
  focused: Teacher | ClassGroup | undefined;
  /** "öğretmen" or "sınıf", the noun of the open mode. */
  modeNoun: string;
}

export function LessonForm({ state, change, mode, focused, modeNoun }: Props) {
  const t = useT();
  const { alert } = useDialogs();
  const [pasteOpen, setPasteOpen] = useState(false);

  const [newLesson, setNewLesson] = useState<LessonDraft>({
    classId: '',
    teacherId: '',
    // A NAME, for as long as the form lives (why: `LessonDraft.subject`).
    subject: '',
    hours: DEFAULT_LESSON_HOURS,
  });
  // The blocks longer than an hour, as the form has them so far. A list, so it
  // does not live in `newLesson` with the strings.
  const [newSplit, setNewSplit] = useState<number[]>([]);
  // The class and teacher of the lesson added last: the form clears one of
  // them, and the over-capacity line below must still be about that lesson.
  const [lastAdded, setLastAdded] = useState<{
    classId: Id;
    teacherId: Id;
    focus: Id;
  } | null>(null);
  // In a focused mode the axis comes from the ribbon, not from the form: that
  // IS the shortening the reader asked for.
  const classId = mode === 'class' ? (focused?.id ?? '') : newLesson.classId;
  const teacherId = mode === 'teacher' ? (focused?.id ?? '') : newLesson.teacherId;
  const newTeacherObj = state.teachers.find((t) => t.id === teacherId);

  // Branş and öğretmen, each filling the other in: the rules are the form's
  // own and pure (pure/forms/lessonForm.ts), the draft stays here.
  const { subjectPool, subjectValue, secondFlag, teacherPool, askSubject } = lessonChoices(
    state,
    mode,
    newLesson,
    newTeacherObj,
  );

  function chooseTeacher(id: Id) {
    setNewLesson(chooseTeacherIn(state, newLesson, id));
  }

  function chooseSubject(name: string) {
    setNewLesson(chooseSubjectIn(newLesson, name, newTeacherObj, mode));
  }
  // The split lives beside the hours rather than inside `newLesson`, because it
  // is a list and the rest of that form is strings. Clamped against the hours
  // as they are typed: going from 6 hours to 3 has to take "2+2+2" with it.
  const newHours = Math.max(1, Number(newLesson.hours) || 1);
  const newBlocks = clampBlocks(newHours, newSplit);
  const newClass = state.classes.find((c) => c.id === classId);
  const newDayLimit = blockCeiling(state, undefined, newClass);
  const canAdd = classId !== '' && teacherId !== '';

  function add() {
    if (!canAdd) return;
    change((d) =>
      addLesson(d, {
        classId,
        teacherId,
        weeklyHours: newHours,
        blocks: newBlocks,
        // A teacher with one subject cannot be "second", whatever the box last
        // said before the teacher was changed.
        second: secondFlag && newTeacherObj !== undefined && hasTwoSubjects(newTeacherObj),
      }),
    );
    setNewLesson(afterAdd(newLesson, mode));
    setNewSplit([]);
    setLastAdded({ classId, teacherId, focus: focused?.id ?? '' });
  }

  // OVER CAPACITY IS SAID WHERE IT IS TYPED. A class with 54 lesson hours and
  // 48 open ones used to be accepted without a word, and the reader found out
  // on Kontrol or when Otomatik diz left cards in the pool. The class and the
  // teacher of the row being typed, and of the row just added (the form
  // clears one of the two after Ekle), are measured against the same numbers
  // Okul → Özet and Kontrol show (`buildCapacity`, O(lessons)).
  const capacity = useMemo(() => buildCapacity(state), [state]);
  const overloaded = (() => {
    const lines: string[] = [];
    // The lesson just added only while the screen is still on its axis: a
    // warning about 9A must not follow the reader to 10B.
    const last =
      lastAdded !== null && (mode === 'all' || lastAdded.focus === (focused?.id ?? ''))
        ? lastAdded
        : null;
    const classIds = new Set([classId, last?.classId ?? ''].filter((x) => x !== ''));
    const teacherIds = new Set([teacherId, last?.teacherId ?? ''].filter((x) => x !== ''));
    for (const r of capacity.classes) {
      if (classIds.has(r.id) && r.load > r.capacity) {
        lines.push(
          t('{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.', {
            ad: r.name,
            yuk: r.load,
            acik: r.capacity,
            fazla: r.load - r.capacity,
          }),
        );
      }
    }
    for (const r of capacity.teachers) {
      if (teacherIds.has(r.id) && r.load > r.capacity) {
        lines.push(
          t('{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.', {
            ad: r.name,
            yuk: r.load,
            acik: r.capacity,
            fazla: r.load - r.capacity,
          }),
        );
      }
    }
    return lines;
  })();

  return (
    <>
      {/* ADDING IS ITS OWN BLOCK — not a rule drawn across one panel.
          ("Listelerde ekleme kısmı ayrı blok olsun. aynı özetin ayrı blok
           olduğu gibi, yani sadece çizgi olmasın.")

          A line says where something ends; a panel says the two are
          different things. Nothing moved: the form is still above the list.
          The COUNTED heading went with the list it counts, and this one
          names the work — so the screen still has exactly one --fs-xl
          heading, and it is the one over the rows being read.

          The paste button rides the HEADING, not the form row: "Excel'den
          yapıştır o bloğun en sağında hatta en sağ üstünde bile olabilir."
          All five panels put it in the same corner. */}
      <AddPanel
        title={t('Yeni ders')}
        action={
          <button className="btn" onClick={() => setPasteOpen(true)}>
            {t("Excel'den yapıştır")}
          </button>
        }
        description={<T k="Bir ders = bir sınıfın bir öğretmenden aldığı haftalık saat." />}
        more={t('4 saat: 2+2 = iki gün ikişer saat')}
        notice={
          state.classes.length === 0 || state.teachers.length === 0 ? (
            <div className="warn-box">
              <T k="Ders eklemek için önce en az bir öğretmen ve bir sınıf girin." />
              <NextStep state={state} />
            </div>
          ) : mode !== 'all' && focused === undefined ? (
            <div className="warn-box">
              {t('Önce sağdaki listeden bir {ne} seçin.', { ne: t(modeNoun) })}
            </div>
          ) : undefined
        }
      >
        {/* Enter adds, the way it already does on the Derslikler step: a form
            whose five controls are all filled from the keyboard should not need
            the mouse for the sixth.

            Not on a button, which has an Enter of its own: the Dağılım button
            opens its list, a split in that list is picked, and Ekle adds by
            its own click. The list is in a portal, and React events bubble
            through portals, so without this Enter on "2+1" added the lesson
            with the split it had before (TODO §8d, 2026-09-26). */}
        <div
          className="form-row"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as Element).closest('button') === null) {
              e.preventDefault();
              add();
            }
          }}
        >
          {mode !== 'class' && (
            <select
              aria-label={t('Sınıf')}
              value={newLesson.classId}
              onChange={(e) => setNewLesson({ ...newLesson, classId: e.target.value })}
            >
              <option value="">{t('Sınıf seçin')}</option>
              {state.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {/* BEFORE the teacher, because it is also the way in: pick Matematik
              and the twenty-five names become the four who teach it. It used to
              appear only for a two-subject teacher, i.e. only ever as an
              afterthought to a choice already made.

              ...EXCEPT in Öğretmenden, where the teacher is already chosen and
              the pool is that one person's own branches. A teacher who holds
              one branch got a dropdown with one option in it — a control that
              cannot be answered wrongly and cannot be answered differently, so
              it was asking nothing ("Öğretmenin tek bir branşı varsa seçme tuşu
              açılmasın"). Nothing about the lesson changes when it goes:
              `subjectValue` already falls to the pool's first entry and
              `secondFlag` is derived from it. Which branch it is, is said in
              the heading instead.

              Still a NAME in the form and a FLAG in the lesson — `chooseSubject`
              and `chooseTeacher` keep the two boxes agreeing, `add()` writes
              `second`. */}
          {askSubject &&
            (mode !== 'all' ? (
              <select
                aria-label={mode === 'teacher' ? t('Branş') : t('Branşa göre süz')}
                value={subjectValue}
                onChange={(e) => chooseSubject(e.target.value)}
              >
                {mode !== 'teacher' && <option value="">{t('Bütün branşlar')}</option>}
                {subjectPool.map((name) => (
                  <option key={name} value={name}>
                    {subjectLabel(name)}
                  </option>
                ))}
              </select>
            ) : (
              <Field label={t('Branşa göre süz')}>
                <select
                  aria-label={t('Branşa göre süz')}
                  value={subjectValue}
                  onChange={(e) => chooseSubject(e.target.value)}
                >
                  <option value="">{t('Bütün branşlar')}</option>
                  {subjectPool.map((name) => (
                    <option key={name} value={name}>
                      {subjectLabel(name)}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          {mode !== 'teacher' && (
            <select
              aria-label={t('Öğretmen')}
              value={newLesson.teacherId}
              onChange={(e) => chooseTeacher(e.target.value)}
            >
              <option value="">
                {newLesson.subject === ''
                  ? t('Öğretmen seçin')
                  : t('{brans}: {n} öğretmen', {
                      brans: subjectLabel(newLesson.subject),
                      n: teacherPool.length,
                    })}
              </option>
              {/* BOTH subjects, not just the first. The list printed `t.subject`
                  alone, so a teacher's second branch was invisible in the one
                  place a lesson is given one. */}
              {teacherPool.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · {teacherSubjects(x).map(subjectLabel).join(' / ')}
                </option>
              ))}
            </select>
          )}
          <Field label={t('Haftalık saat')}>
            <input
              type="number"
              min={1}
              max={40}
              className="num"
              value={newLesson.hours}
              onChange={(e) => setNewLesson({ ...newLesson, hours: e.target.value })}
            />
          </Field>
          <Field label={t('Haftaya dağılış')}>
            <BlockCounts
              weeklyHours={newHours}
              blocks={newBlocks}
              dayLimit={newDayLimit}
              onPick={setNewSplit}
              title={t('4 saat: 2+2 = iki gün ikişer saat')}
            />
          </Field>
          <button className="btn primary" disabled={!canAdd} onClick={add}>
            {t('Ekle')}
          </button>
        </div>

        {overloaded.length > 0 && (
          <div className="error-box over-capacity" role="status">
            {overloaded.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="hint">
              {t('Bir dersin saatini azaltın ya da kişinin sayfasında kapalı saat açın.')}
            </p>
          </div>
        )}

        <Paste
          open={pasteOpen}
          close={() => setPasteOpen(false)}
          title={t('Dersleri yapıştır')}
          example={t('Sınıf · Öğretmen (ad veya kısa ad) · Haftalık saat · Blok (1 · 2 · 3)')}
          parse={parseLessons}
          rowText={(x) =>
            t('{sinif} · {kim}: {saat} saat ({dagilim})', {
              sinif: x.className,
              kim: x.teacher,
              saat: x.weeklyHours,
              dagilim: patternLabel(blockPlan(x)),
            })
          }
          onAdd={(rows) => {
            // The report is computed OUTSIDE the reducer. It used to be raised
            // from inside `change`, i.e. a side effect in a function React is
            // free to call late, twice, or not at all (pitfall 20's family —
            // under StrictMode it already showed the alert twice).
            // `addLessonsFromRows` is pure, so asking it here and asking it
            // again in the reducer costs one extra pass over the rows and buys
            // a callback with nothing in it but the state.
            const { missing } = addLessonsFromRows(state, rows);
            change((d) => addLessonsFromRows(d, rows).state);
            if (missing.length > 0) {
              void alert({
                title: t('{n} satır eklenemedi', { n: missing.length }),
                tone: 'warn',
                body: (
                  <>
                    <p>{t('Sınıf veya öğretmen bulunamadı:')}</p>
                    <ul className="choice-list">
                      {missing.map((row) => (
                        <li key={row}>{row}</li>
                      ))}
                    </ul>
                    <p>{t('Önce onları ekleyip tekrar deneyin.')}</p>
                  </>
                ),
              });
            }
          }}
        />
      </AddPanel>
    </>
  );
}
