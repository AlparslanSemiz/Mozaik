// The Dersler tab: one lesson = one class taking N weekly hours from one
// teacher.
//
// It was step FOUR of Kurulum until this round, and the reader said why that
// was wrong: "Ders ekleme tarafı çok daha pratik hale getirilmeli, neden?
// Çünkü hocaları onu bunu ayarlıyorsun ama DERS EN ÖNEMLİ KISIM." Rooms,
// teachers and classes are filled in once a term; this screen is the one that
// gets used, and as a step it could only be reached through a wizard.
//
// THE FORM DROPS AN AXIS. Entering eight lessons for one class meant choosing
// that class eight times — and the old form reset exactly the field worth
// keeping. Now the ribbon says which way round the entry runs, the right-hand
// column picks the one entity, and the form asks only for what changes from
// lesson to lesson.
//
// A block is not a separate entity: the whole shape of the week is `pairs`
// here, and `src/blocks.ts` turns that one number into "2+2+1". The dropdown
// beside the hours is the aSc "Lessons/week + Single" pair the reader asked
// for by name: pick the total first, then how it falls apart.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import {
  BLOCK_SIZES,
  blockCounts,
  blockPlan,
  clampBlocks,
  maxCount,
  patternLabel,
  withCount,
} from '../../blocks';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import type { ClassGroup, Id, Lesson, State } from '../../types';
import type { LessonMode } from '../../toolState';
import { useDialogs } from '../Dialogs';
import { parseLessons } from '../../import';
import { paletteColor } from '../../palette';
import { lessonLimit, ruleLevel } from '../../rules';
import {
  addLesson,
  addLessonsFromRows,
  deleteLesson,
  deletionQuestion,
  hasTwoSubjects,
  lessonSubject,
  subjectLabel,
  subjectKey,
  subjectOptions,
  subjectRank,
  subjectTeachers,
  teacherSubjects,
  updateLesson,
  weeklyLoad,
} from '../../entities';
import { KIND_ICON } from '../steps';
import LimitBox from '../LimitBox';
import Paste from '../setup/Paste';
import Summary from '../setup/Summary';
import Field from '../Field';
import { T, useT } from '../T';

interface Props {
  state: State;
  change: (fn: (d: State) => State) => void;
  mode: LessonMode;
  focus: Id;
  setFocus: (next: Id) => void;
}

/**
 * The longest block this lesson could ever have placed, or 0 for no ceiling.
 *
 * Only when the rule is set to ENGELLE: at Uyar a long block still goes down,
 * it just paints yellow, and calling that impossible would be a lie.
 */
function blockCeiling(d: State, lesson: Lesson | undefined, group?: ClassGroup): number {
  if (ruleLevel(d, 'maxSameLessonPerDay') !== 'block') return 0;
  return lessonLimit(d, lesson, group);
}

/**
 * The split editor: how many 4s, how many 3s, how many 2s. The rest are singles.
 *
 * It replaced a dropdown listing every way the week could be divided, and the
 * reason is arithmetic: with blocks of 1 and 2 a twelve-hour lesson had 7 ways,
 * and with 3 and 4 it has 34. A list nobody can read is not a choice. Three
 * counters are three controls whatever the hours are, and the sentence beside
 * them ("3+3+2+1") says what the week will look like.
 *
 * Each counter's ceiling is asked for with the OTHER two standing (`maxCount`),
 * so the boxes can never be driven into a split that does not fit — which is
 * also why there is nothing here to clamp afterwards.
 */
function BlockCounts({
  weeklyHours,
  blocks,
  dayLimit,
  title,
  onPick,
}: {
  weeklyHours: number;
  blocks: number[];
  /** Most hours of THIS lesson one day may hold, or 0 for no ceiling. */
  dayLimit: number;
  title?: string;
  onPick: (blocks: number[]) => void;
}) {
  const t = useT();
  const counts = blockCounts(blocks);
  // A block longer than the daily ceiling has no legal cell ANYWHERE — not a
  // hard search, an impossible one. Left unsaid the reader picks a four, presses
  // "Otomatik diz", and watches nothing happen; Kontrol reports it, but three
  // screens away from the box that caused it.
  const tooLong = dayLimit > 0 ? blocks.filter((b) => b > dayLimit) : [];
  return (
    <span className="split-counts" title={title}>
      {BLOCK_SIZES.map((size) => (
        // Count first, length second: "2×4" is read "two fours", which is the
        // same notation `patternLabel` folds a long week into. Spelling the
        // unit out ("4 saatlik") wrapped the three boxes onto three lines in
        // the list column and doubled every row's height.
        <label key={size} className="split-count">
          <input
            type="number"
            className="num"
            min={0}
            max={maxCount(weeklyHours, blocks, size)}
            value={counts[size]}
            aria-label={t('{boy} saatlik blok sayısı', { boy: size })}
            title={t('{boy} saatlik blok sayısı', { boy: size })}
            onChange={(e) => onPick(withCount(weeklyHours, blocks, size, Number(e.target.value)))}
          />
          <span aria-hidden="true">×{size}</span>
        </label>
      ))}
      <output className="split-shape">{patternLabel(blockPlan({ weeklyHours, blocks }))}</output>
      {tooLong.length > 0 && (
        <span
          className="split-warn"
          role="status"
          title={t('Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz', {
            n: dayLimit,
          })}
        >
          {t('{boy} saat > günde {n}', { boy: Math.max(...tooLong), n: dayLimit })}
        </span>
      )}
    </span>
  );
}

export default function Lessons({ state, change, mode, focus, setFocus }: Props) {
  const t = useT();
  const { confirm, alert } = useDialogs();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);
  const [pasteOpen, setPasteOpen] = useState(false);

  // Whose lessons this screen is filling in. '' means "the first one", the same
  // convention Müsaitlik's `chosen` uses — an id that is remembered across a
  // tab switch must not go stale when the list it points into changes.
  const picking = mode === 'teacher' ? state.teachers : state.classes;
  const focused = picking.find((x) => x.id === focus) ?? picking[0];

  // WHAT the open teacher teaches, for the heading. `teacherSubjects` is the
  // one place that answers this (src/subjects.ts): it trims, drops the empty
  // second slot and folds a name written twice into one, so "Türkçe / Türkçe"
  // is not a thing the heading can say.
  const focusedSubjects =
    mode === 'teacher' && focused !== undefined && 'subject' in focused
      ? teacherSubjects(focused).join(' · ')
      : '';

  // Ninety-nine rows, and every one of them is a pair. Searching has to see
  // both halves of the pair and the teacher's SHORT form, because the short
  // form is what the grid says and therefore what gets remembered.
  const listCfg = useMemo<ListConfig<Lesson>>(() => {
    const cls = (x: Lesson) => state.classes.find((c) => c.id === x.classId);
    const tch = (x: Lesson) => state.teachers.find((t) => t.id === x.teacherId);
    const rank = subjectRank(state);
    return {
      haystack: (x) => {
        const t = tch(x);
        return `${cls(x)?.name ?? ''} ${t?.name ?? ''} ${t?.short ?? ''} ${lessonSubject(state, x)}`;
      },
      // Three axes, and they narrow TOGETHER: "kolay seçme filtresinde sadece
      // branş değil, öğretmene göre veya sınıfa göre de filtreleme olsun".
      // Ninety-nine rows is where reading a column stops working, and a lesson
      // is the one row in this program that belongs to two other lists.
      facets: [
        // The LESSON's subject, not the teacher's first one: filtering by
        // Edebiyat has to return the Edebiyat lessons of a teacher who also
        // teaches Türkçe, and none of their Türkçe ones. The chips run in the
        // school's own order (Ayarlar > Branşlar), not the alphabet.
        {
          id: 'brans',
          label: t('Branş'),
          of: (x) => subjectLabel(lessonSubject(state, x)),
          order: (name) => rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER,
        },
        { id: 'ogretmen', label: t('Öğretmen'), of: (x) => tch(x)?.short ?? '' },
        { id: 'sinif', label: t('Sınıf'), of: (x) => cls(x)?.name ?? '' },
      ],
      sorts: [
        { id: 'sinif', label: t('Sınıfa göre'), cmp: (a, b) =>
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') ||
            compareTr(tch(a)?.short ?? '', tch(b)?.short ?? '') },
        { id: 'ogretmen', label: t('Öğretmene göre'), cmp: (a, b) =>
            compareTr(tch(a)?.name ?? '', tch(b)?.name ?? '') ||
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') },
        { id: 'saat', label: t('Haftalık saate göre (çok → az)'), cmp:
            byNumberThen((x) => x.weeklyHours, (x) => cls(x)?.name ?? '') },
        { id: 'blok', label: t('Blok sayısına göre (çok → az)'), cmp:
            byNumberThen((x) => x.blocks.length, (x) => cls(x)?.name ?? '') },
      ],
    };
  }, [state]);

  // The rows this screen is ABOUT, narrowed before the search box ever sees
  // them. Not through `query.facets`: the ribbon and the chip row would then be
  // two writers of one value, and clearing the chip would leave the strip
  // saying something the list no longer does.
  const scope =
    mode === 'all' || focused === undefined
      ? state.lessons
      : state.lessons.filter((x) =>
          mode === 'teacher' ? x.teacherId === focused.id : x.classId === focused.id,
        );
  const shown = applyList(scope, query, listCfg);
  const order = useRowOrder({
    kind: 'lessons',
    // Hand-sorting means dragging row 3 to row 1 OF THE ARRAY, and in a focused
    // mode the rows on screen are a subset — index 3 there is not index 3 in
    // `state.lessons`. `ListTools` already explains the lock it puts up.
    count: mode === 'all' ? state.lessons.length : 0,
    query,
    change,
  });

  const [newLesson, setNewLesson] = useState({
    classId: '',
    teacherId: '',
    // The subject is kept as a NAME here and nowhere else: `Lesson.second` is
    // still a flag, and it still has to be, because a stored name would become
    // a second truth that drifts the moment a teacher's subject is corrected
    // (the note on `Lesson.second` in types.ts). This field lives exactly as
    // long as the form does — it is what the two boxes agree on while they are
    // being filled in, and `add()` turns it back into the flag.
    subject: '',
    hours: '4',
  });
  // The blocks longer than an hour, as the form has them so far. A list, so it
  // does not live in `newLesson` with the strings.
  const [newSplit, setNewSplit] = useState<number[]>([]);
  // In a focused mode the axis comes from the ribbon, not from the form: that
  // IS the shortening the reader asked for.
  const classId = mode === 'class' ? (focused?.id ?? '') : newLesson.classId;
  const teacherId = mode === 'teacher' ? (focused?.id ?? '') : newLesson.teacherId;
  const newTeacherObj = state.teachers.find((t) => t.id === teacherId);

  // BRANŞ AND ÖĞRETMEN, EACH FILLING THE OTHER IN.
  //
  //   "branş seçilince öğretmen seçiminin azalması, derslerde branş seçimi de
  //    olmalı. öğretmen seçince branş kendiliğinden gelsin ama branş seçip
  //    öğretmen de seçebilelim."
  //
  // Before this the form asked for the subject only when the chosen teacher
  // held two of them, so twenty-five teachers came down one list in entry
  // order and the subject was never a way IN — which is how a person actually
  // thinks about a timetable ("who does Matematik for 510").
  //
  // Which of a teacher's subjects a name is: 0, 1, or -1 for neither. The
  // comparison goes through `subjectKey` because a subject is free text and
  // "matematik" and "Matematik" are one subject (subjects.ts).
  const slotOf = (subs: string[], name: string) =>
    subs.findIndex((x) => subjectKey(x) === subjectKey(name));

  // In the teacher-focused mode the teacher is not a choice, so the only
  // subjects worth offering are that teacher's own one or two. Everywhere else
  // the whole school list is offered and it works as a filter.
  const teacherSubs = newTeacherObj === undefined ? [] : teacherSubjects(newTeacherObj);
  const subjectPool =
    mode === 'teacher' && newTeacherObj !== undefined ? teacherSubs : subjectOptions(state);

  // The subject the boxes are actually showing. Derived and not stored, because
  // in the teacher-focused mode the teacher arrives from the RIBBON: switching
  // to another teacher there changes nothing in this form's state, and a stored
  // subject would then name a subject the new teacher does not hold — a
  // controlled `<select>` whose value matches no option draws blank.
  const subjectValue =
    mode === 'teacher' && slotOf(subjectPool, newLesson.subject) < 0
      ? (subjectPool[0] ?? '')
      : newLesson.subject;

  // `Lesson.second` derived from that, in ONE place. It used to be a third
  // field in the form's state, which meant the subject box and the flag could
  // disagree — and they did, every time the ribbon changed the focused teacher
  // underneath them.
  const secondFlag = slotOf(teacherSubs, subjectValue) === 1;

  // The half the reader asked for by name: choosing a subject shortens this
  // list. `subjectTeachers` already existed for the delete guard and the setup
  // summary — it counts BOTH of a teacher's fields, so a second-subject
  // teacher is found by either of them.
  const teacherPool =
    newLesson.subject === '' ? state.teachers : subjectTeachers(state, newLesson.subject);

  /** Picking a teacher fills the subject in — and picks WHICH of two it is. */
  function chooseTeacher(id: Id) {
    const t = state.teachers.find((x) => x.id === id);
    const subs = t === undefined ? [] : teacherSubjects(t);
    // Keep the subject already in the box if this teacher holds it: coming in
    // through the filter should not throw the filter away.
    const kept = slotOf(subs, newLesson.subject);
    const slot = kept >= 0 ? kept : 0;
    setNewLesson({ ...newLesson, teacherId: id, subject: subs[slot] ?? '' });
  }

  /** Picking a subject narrows the teachers — and drops one that cannot hold it. */
  function chooseSubject(name: string) {
    // The focused mode cannot drop its teacher — the ribbon owns that axis —
    // and it is never offered a subject that teacher does not hold anyway.
    const drops =
      name !== '' && newTeacherObj !== undefined && slotOf(teacherSubs, name) < 0 && mode !== 'teacher';
    setNewLesson({ ...newLesson, subject: name, ...(drops ? { teacherId: '' } : {}) });
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
    // Keep the axis this screen is walking, clear the one that changes from
    // lesson to lesson. The old form did the exact opposite — it cleared the
    // class — so eight lessons for one class meant choosing it eight times.
    // Hours and split stay: the next lesson is more often the same length than
    // it is four hours.
    setNewLesson(
      mode === 'teacher'
        ? { ...newLesson, classId: '' }
        // `second` names one of the teacher's two subjects, so it cannot
        // outlive the teacher it belonged to — and neither can the subject,
        // which was filled in FROM that teacher: left standing it would narrow
        // the teacher list to one branch for the next lesson.
        : { ...newLesson, teacherId: '', subject: '' },
    );
  }

  const modeNoun = mode === 'teacher' ? 'öğretmen' : 'sınıf';

  // In Öğretmenden the branch box only asks something when the teacher HOLDS
  // two. `subjectPool` is already that person's own branches there, so its
  // length is the question.
  const askSubject = mode !== 'teacher' || subjectPool.length > 1;

  // The heading carries the branch when the box does not ("Başlıkta branşı da
  // yazsın") — and it carries BOTH when the box is there, because then the
  // heading is naming the teacher rather than the lesson being typed.
  // Rows AND hours, like the picker beside it: "kaç ders girdim" and "haftası
  // doldu mu" are different questions and the second is the one that bites.
  // The hours come from `weeklyLoad`, the same function the picker rows and
  // the strip's Toplam read — one number, one source.
  const scopeHours = scope.reduce((n, l) => n + l.weeklyHours, 0);
  const counted = t('{ders} ders · {saat} saat', { ders: scope.length, saat: scopeHours });
  const heading =
    mode === 'all' || focused === undefined
      ? t('Dersler · {sayilar}', { sayilar: counted })
      : mode === 'teacher' && focusedSubjects !== ''
        ? t('{kim} · {brans} dersleri · {sayilar}', {
            kim: focused.name,
            brans: focusedSubjects,
            sayilar: counted,
          })
        : t('{kim} dersleri · {sayilar}', { kim: focused.name, sayilar: counted });

  const panel = (
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
      <div className="panel add-panel">
        <div className="panel-head">
          <h2>{t('Yeni ders')}</h2>
          <button className="btn" onClick={() => setPasteOpen(true)}>{t("Excel'den yapıştır")}</button>
        </div>
        <p className="hint">
          <T k="Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. Öğretmen iki branş veriyorsa dersin hangi branştan olduğu da seçilir. **Dağılım**, o saatlerin haftaya nasıl bölüneceğidir: **2+1** demek bir gün iki saat üst üste, başka bir gün tek saat demektir. Bir blok 2, 3 ya da 4 saat olabilir; geri kalan saatler tektir. **Günde ↑** bu dersin bir günde en fazla kaç saat olabileceğidir; boşsa Ayarlar → Kurallar'daki sayı geçerli olur." />
        </p>

        {(state.classes.length === 0 || state.teachers.length === 0) && (
          <div className="warn-box">
            <T k="Ders eklemek için önce **Okul** sekmesinde en az bir öğretmen ve bir sınıf girin." />
          </div>
        )}

        {mode !== 'all' && focused === undefined && state.classes.length > 0 && (
          <div className="warn-box">
            {t('Önce sağdaki listeden bir {ne} seçin.', { ne: t(modeNoun) })}
          </div>
        )}

        {/* Enter adds, the way it already does on the Derslikler step: a form
            whose five controls are all filled from the keyboard should not need
            the mouse for the sixth. */}
        <div
          className="form-row"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
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
          {askSubject && (
            <Field label={t('Branş')}>
              <select
                aria-label={t('Branş')}
                value={subjectValue}
                onChange={(e) => chooseSubject(e.target.value)}
              >
                {mode !== 'teacher' && <option value="">{t('Tüm branşlar')}</option>}
                {subjectPool.map((name) => (
                  <option key={name} value={name}>
                    {subjectLabel(name)}
                  </option>
                ))}
              </select>
            </Field>
          )}
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
                  {x.short} · {teacherSubjects(x).map(subjectLabel).join(' / ')}
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
          <Field label={t('Dağılım')}>
            <BlockCounts
              weeklyHours={newHours}
              blocks={newBlocks}
              dayLimit={newDayLimit}
              onPick={setNewSplit}
            />
          </Field>
          <button className="btn" disabled={!canAdd} onClick={add}>{t('Ekle')}</button>
        </div>

        <Paste
          open={pasteOpen}
          close={() => setPasteOpen(false)}
          title={t('Dersleri yapıştır')}
          example={t('Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok (1 · 2 · 3 · 4)')}
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
      </div>

      <div className="panel step-panel">
        <h2>{heading}</h2>

        {scope.length > 0 && (
          <ListTools
            items={scope}
            query={query}
            setQuery={setQuery}
            config={listCfg}
            shown={shown.length}
            noun="ders"
          countKey="{n} ders"
            notice={order.notice}
          />
        )}

        {scope.length > 0 && shown.length === 0 && (
          <p className="hint">{t('Bu aramaya uyan ders yok.')}</p>
        )}

        {scope.length === 0 && state.lessons.length > 0 && mode !== 'all' && (
          <p className="hint">
            Bu {modeNoun} için henüz ders girilmemiş. Yukarıdaki satırdan ekleyin.
          </p>
        )}

        {/* Eleven columns do not fit a 100 %-wide table at --ui-scale
            1.5: the browser answers by crushing whichever column can
            still shrink, and at 150 % that was the NAME — 232 px down
            to 26 px, measured. Wide content scrolls in its own box
            rather than squeezing the reader's own words out. */}
        {shown.length > 0 && (
          <div className="table-scroll">
          <table className="list">
            <thead>
              <tr>
                {order.head}
                <th>{t('Sınıf')}</th>
                <th>{t('Öğretmen')}</th>
                <th className="w-col-lg">{t('Haftalık saat')}</th>
                <th className="w-col-lg">{t('Dağılım')}</th>
                <th className="w-col-md" title={t('Bu ders bir günde en fazla kaç saat')}>
                  {t(
                    'Günde ↑',
                  )}
                </th>
                <th className="w-col-md" />
              </tr>
            </thead>
            <tbody ref={order.bodyRef}>
              {shown.map((x, i) => {
                const group = state.classes.find((c) => c.id === x.classId);
                const teacher = state.teachers.find((t) => t.id === x.teacherId);
                const rowName = `${group?.name ?? '?'} · ${teacher?.short ?? '?'}`;
                return (
                  <tr key={x.id} data-row-name={rowName}>
                    {order.grip(i, rowName)}
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: paletteColor(group?.color ?? 0) }}
                      />{' '}
                      {group?.name ?? '?'}
                    </td>
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: paletteColor(teacher?.color ?? 0) }}
                      />{' '}
                      {teacher?.short ?? '?'}{' '}
                      {/* The subject is a LABEL for a single-subject teacher and a
                          CHOICE for one who holds two — so it is drawn as the one
                          it is, in the cell where the teacher already is. A column
                          of its own would be twenty-three empty cells wide. */}
                      {teacher !== undefined && hasTwoSubjects(teacher) ? (
                        <select
                          className="text-sm"
                          aria-label={t('{sinif} · {kim} dersinin branşı', {
                            sinif: group?.name ?? '?',
                            kim: teacher.short,
                          })}
                          value={x.second ? '1' : '0'}
                          onChange={(e) =>
                            change((d) =>
                              updateLesson(d, x.id, { second: e.target.value === '1' }),
                            )
                          }
                        >
                          {teacherSubjects(teacher).map((name, i) => (
                            <option key={name} value={i === 0 ? '0' : '1'}>
                              {subjectLabel(name)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>· {subjectLabel(lessonSubject(state, x))}</>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        className="num"
                        defaultValue={x.weeklyHours}
                        onBlur={(e) =>
                          change((d) =>
                            updateLesson(d, x.id, {
                              weeklyHours: Math.max(1, Number(e.target.value) || 1),
                            }),
                          )
                        }
                      />
                    </td>
                    <td>
                      <BlockCounts
                        weeklyHours={x.weeklyHours}
                        blocks={x.blocks}
                        dayLimit={blockCeiling(state, x, group)}
                        title={t('Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar')}
                        onPick={(blocks) => change((d) => updateLesson(d, x.id, { blocks }))}
                      />
                    </td>
                    <td>
                      <LimitBox
                        value={x.maxPerDay}
                        fallback={
                          group?.maxSameLessonPerDay ?? state.settings.limits.maxSameLessonPerDay
                        }
                        title={t('Bu ders bir günde en fazla kaç saat')}
                        onSet={(v) => change((d) => updateLesson(d, x.id, { maxPerDay: v }))}
                      />
                    </td>
                    <td>
                      {/* The same `form-row nowrap` the other three panels end
                          their rows with, so the action column lines up across
                          all of them. There is no inspect button beside it and
                          that is deliberate: a lesson is not an entity, it has
                          no week of its own, and the two things it could open —
                          its class or its teacher — are both already one click
                          away in the cells to the left. */}
                      <div className="form-row nowrap">
                        <button
                          className="btn danger"
                          onClick={async () => {
                            const q = deletionQuestion(state, 'lesson', x.id);
                            if (!(await confirm({ title: q.title, body: q.cost, confirmLabel: 'Sil', danger: true })))
                              return;
                            change((d) => deleteLesson(d, x.id));
                          }}
                        >{t('Sil')}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );

  // The general list has nothing to pick, so it gets the whole width — a
  // two-column grid with an empty right column is 20rem of nothing. It stays
  // INSIDE `.cols` either way: that wrapper is the shape every list screen has
  // (`.cols > div > .panel`), and dropping it in one mode would have made this
  // the only list in the program its own helpers could not find.
  //
  // And the RAIL is there either way too. It used to appear with the focused
  // modes and vanish in Genel, so the list's right edge jumped several hundred
  // pixels on a button whose whole job was to change which lessons were
  // listed. Genel gets the summary the setup steps get — the one panel that
  // says whether each class's week is actually full.
  return (
    <div className="cols">
      <div>{panel}</div>

      {/* The picker, and the same list Müsaitlik puts in this column: choosing
          among twenty classes should not be a <select> showing one row at a
          time, and the number that says whether this one is done — lessons
          entered, hours loaded — belongs on the row itself. */}
      <aside>
        {mode === 'all' ? (
          <Summary state={state} change={change} step="lessons" />
        ) : (
          <div className="panel">
            <h2>{mode === 'teacher' ? t('Hangi öğretmen') : t('Hangi sınıf')}</h2>
            {/* Two whole sentences rather than one with a noun slot: Turkish
                suffixes the noun ("o sınıfa"), so a shared sentence would have
                to glue a case ending onto a translated word — which is the one
                thing this dictionary cannot do. */}
            <p className="hint">
              {mode === 'teacher'
                ? t('Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.')
                : t('Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.')}
            </p>
            <div className="entity-list" aria-label={t('Ders listesi')}>
              {picking.map((x) => {
                const count = state.lessons.filter((l) =>
                  mode === 'teacher' ? l.teacherId === x.id : l.classId === x.id,
                ).length;
                return (
                  <button
                    key={x.id}
                    type="button"
                    className="entity"
                    data-id={x.id}
                    aria-current={x.id === focused?.id}
                    onClick={() => setFocus(x.id)}
                  >
                    <span className="entity-icon" aria-hidden="true">
                      {KIND_ICON[mode === 'teacher' ? 'teacher' : 'class']}
                    </span>
                    <span className="row-dot" style={{ background: paletteColor(x.color) }} />
                    <span className="entity-name">{x.name}</span>
                    {/* Lessons and hours, because both are asked: "kaç ders
                        girdim" and "haftası doldu mu" are different questions
                        and the second one is the one that bites. */}
                    <span className="entity-count">
                      {count} ders · {weeklyLoad(state, mode === 'teacher' ? 'teacher' : 'class', x.id)} saat
                    </span>
                  </button>
                );
              })}
            </div>
            {picking.length === 0 && (
              <p className="hint">
                <T
                  k="Henüz {ne} yok. **Okul** sekmesinden ekleyin."
                  vars={{ ne: t(modeNoun) }}
                />
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
