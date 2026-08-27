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
import { blockPlan, clampPairs, patternLabel, patternOptions } from '../../blocks';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import type { Id, Lesson, State } from '../../types';
import type { LessonMode } from '../../toolState';
import { useDialogs } from '../Dialogs';
import { parseLessons } from '../../import';
import { paletteColor } from '../../palette';
import {
  addLesson,
  addLessonsFromRows,
  deleteLesson,
  deletionQuestion,
  hasTwoSubjects,
  lessonSubject,
  subjectKey,
  subjectRank,
  teacherSubjects,
  updateLesson,
  weeklyLoad,
} from '../../entities';
import { KIND_ICON } from '../steps';
import LimitBox from '../LimitBox';
import Paste from '../setup/Paste';
import Field from '../Field';

interface Props {
  state: State;
  change: (fn: (d: State) => State) => void;
  mode: LessonMode;
  focus: Id;
  setFocus: (next: Id) => void;
}

/**
 * The split picker: aSc's dropdown next to "Lessons/week".
 *
 * No width of its own — see `.split-pick` in styles.css. The labels grow with
 * the hours, so the browser is left to size the box from its longest option;
 * pinned at one width it clipped ("1+1+1+1+" at 150 %), and pinned at the
 * longest possible one it would be a very wide column for a two-hour lesson.
 */
function SplitPick({
  options,
  value,
  title,
  onPick,
}: {
  options: Array<{ pairs: number; label: string }>;
  value: number;
  title?: string;
  onPick: (pairs: number) => void;
}) {
  return (
    <select
      className="split-pick"
      value={value}
      title={title}
      onChange={(e) => onPick(Number(e.target.value))}
    >
      {options.map((o) => (
        <option key={o.pairs} value={o.pairs}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function Lessons({ state, change, mode, focus, setFocus }: Props) {
  const { confirm, alert } = useDialogs();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);
  const [pasteOpen, setPasteOpen] = useState(false);

  // Whose lessons this screen is filling in. '' means "the first one", the same
  // convention Müsaitlik's `chosen` uses — an id that is remembered across a
  // tab switch must not go stale when the list it points into changes.
  const picking = mode === 'teacher' ? state.teachers : state.classes;
  const focused = picking.find((x) => x.id === focus) ?? picking[0];

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
          label: 'Branş',
          of: (x) => lessonSubject(state, x),
          order: (name) => rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER,
        },
        { id: 'ogretmen', label: 'Öğretmen', of: (x) => tch(x)?.short ?? '' },
        { id: 'sinif', label: 'Sınıf', of: (x) => cls(x)?.name ?? '' },
      ],
      sorts: [
        { id: 'sinif', label: 'Sınıfa göre', cmp: (a, b) =>
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') ||
            compareTr(tch(a)?.short ?? '', tch(b)?.short ?? '') },
        { id: 'ogretmen', label: 'Öğretmene göre', cmp: (a, b) =>
            compareTr(tch(a)?.name ?? '', tch(b)?.name ?? '') ||
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') },
        { id: 'saat', label: 'Haftalık saate göre (çok → az)', cmp:
            byNumberThen((x) => x.weeklyHours, (x) => cls(x)?.name ?? '') },
        { id: 'blok', label: 'İkili blok sayısına göre (çok → az)', cmp:
            byNumberThen((x) => x.pairs, (x) => cls(x)?.name ?? '') },
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
    hours: '4',
    pairs: '0',
    second: false,
  });
  // In a focused mode the axis comes from the ribbon, not from the form: that
  // IS the shortening the reader asked for.
  const classId = mode === 'class' ? (focused?.id ?? '') : newLesson.classId;
  const teacherId = mode === 'teacher' ? (focused?.id ?? '') : newLesson.teacherId;
  const newTeacherObj = state.teachers.find((t) => t.id === teacherId);
  // The choices depend on the hours in the box next to it, so they are rebuilt
  // as it is typed in — and the chosen one is clamped, because going from 6
  // hours to 3 has to take "2+2+2" with it.
  const newHours = Math.max(1, Number(newLesson.hours) || 1);
  const newSplits = patternOptions(newHours);
  const newPairs = clampPairs(newHours, Number(newLesson.pairs) || 0);
  const canAdd = classId !== '' && teacherId !== '';

  function add() {
    if (!canAdd) return;
    change((d) =>
      addLesson(d, {
        classId,
        teacherId,
        weeklyHours: newHours,
        pairs: newPairs,
        // A teacher with one subject cannot be "second", whatever the box last
        // said before the teacher was changed.
        second: newLesson.second && newTeacherObj !== undefined && hasTwoSubjects(newTeacherObj),
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
        // outlive the teacher it belonged to.
        : { ...newLesson, teacherId: '', second: false },
    );
  }

  const modeNoun = mode === 'teacher' ? 'öğretmen' : 'sınıf';
  const heading =
    mode === 'all' || focused === undefined
      ? `Dersler (${state.lessons.length})`
      : `${focused.name} dersleri (${scope.length})`;

  const panel = (
    <div className="panel step-panel">
        {/* The paste button rides the HEADING, not the form row: "Excel'den
            yapıştır o bloğun en sağında hatta en sağ üstünde bile olabilir."
            In the form row it was a sixth control competing with the five that
            are filled in every time, and opening it broke the row in half. */}
        <div className="panel-head">
          <h2>{heading}</h2>
          <button className="btn" onClick={() => setPasteOpen(true)}>
            Excel'den yapıştır
          </button>
        </div>
        <p className="hint">
          Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. Öğretmen
          iki branş veriyorsa dersin hangi branştan olduğu da seçilir.{' '}
          <b>Dağılım</b>, o saatlerin haftaya nasıl bölüneceğidir: <b>2+1</b> demek bir
          gün iki saat üst üste, başka bir gün tek saat demektir. Her blok 1 ya da 2
          saattir. <b>Günde ↑</b> bu dersin bir günde en fazla kaç saat olabileceğidir;
          boşsa Ayarlar → Kurallar'daki sayı geçerli olur.
        </p>

        {(state.classes.length === 0 || state.teachers.length === 0) && (
          <div className="warn-box">
            Ders eklemek için önce <b>Kurulum</b> sekmesinde en az bir öğretmen ve
            bir sınıf girin.
          </div>
        )}

        {mode !== 'all' && focused === undefined && state.classes.length > 0 && (
          <div className="warn-box">Önce sağdaki listeden bir {modeNoun} seçin.</div>
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
              aria-label="Sınıf"
              value={newLesson.classId}
              onChange={(e) => setNewLesson({ ...newLesson, classId: e.target.value })}
            >
              <option value="">Sınıf seçin</option>
              {state.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {mode !== 'teacher' && (
            <select
              aria-label="Öğretmen"
              value={newLesson.teacherId}
              onChange={(e) =>
                setNewLesson({ ...newLesson, teacherId: e.target.value, second: false })
              }
            >
              <option value="">Öğretmen seçin</option>
              {state.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.short} · {t.subject}
                </option>
              ))}
            </select>
          )}
          {/* "hocayı seçtikten sonra eğer çift branşlı bir hoca varsa onun hangi
              branşının dersi olacağını seçme özelliği de olsun." Only then: for
              the twenty-three teachers who hold one subject there is no question
              to ask, and a box offering one option is a box that lies about
              having a choice. */}
          {newTeacherObj !== undefined && hasTwoSubjects(newTeacherObj) && (
            <Field label="Branş">
              <select
                aria-label="Dersin branşı"
                value={newLesson.second ? '1' : '0'}
                onChange={(e) => setNewLesson({ ...newLesson, second: e.target.value === '1' })}
              >
                {teacherSubjects(newTeacherObj).map((name, i) => (
                  <option key={name} value={i === 0 ? '0' : '1'}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Haftalık saat">
            <input
              type="number"
              min={1}
              max={40}
              className="num"
              value={newLesson.hours}
              onChange={(e) => setNewLesson({ ...newLesson, hours: e.target.value })}
            />
          </Field>
          <Field label="Dağılım">
            <SplitPick
              options={newSplits}
              value={newPairs}
              onPick={(pairs) => setNewLesson({ ...newLesson, pairs: String(pairs) })}
            />
          </Field>
          <button className="btn" disabled={!canAdd} onClick={add}>
            Ekle
          </button>
        </div>

        <Paste
          open={pasteOpen}
          close={() => setPasteOpen(false)}
          title="Dersleri yapıştır"
          example="Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok (1 veya 2)"
          parse={parseLessons}
          rowText={(x) =>
            `${x.className} · ${x.teacher}: ${x.weeklyHours} saat (${patternLabel(
              blockPlan(x),
            )})`
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
                title: `${missing.length} satır eklenemedi`,
                tone: 'warn',
                body: (
                  <>
                    <p>Sınıf veya öğretmen bulunamadı:</p>
                    <ul className="choice-list">
                      {missing.map((row) => (
                        <li key={row}>{row}</li>
                      ))}
                    </ul>
                    <p>Önce onları ekleyip tekrar deneyin.</p>
                  </>
                ),
              });
            }
          }}
        />

        {scope.length > 0 && (
          <ListTools
            items={scope}
            query={query}
            setQuery={setQuery}
            config={listCfg}
            shown={shown.length}
            noun="ders"
            notice={order.notice}
          />
        )}

        {scope.length > 0 && shown.length === 0 && (
          <p className="hint">Bu aramaya uyan ders yok.</p>
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
                <th>Sınıf</th>
                <th>Öğretmen</th>
                <th className="w-col-lg">Haftalık saat</th>
                <th className="w-col-lg">Dağılım</th>
                <th className="w-col-md" title="Bu ders bir günde en fazla kaç saat">
                  Günde ↑
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
                          aria-label={`${group?.name ?? '?'} · ${teacher.short} dersinin branşı`}
                          value={x.second ? '1' : '0'}
                          onChange={(e) =>
                            change((d) =>
                              updateLesson(d, x.id, { second: e.target.value === '1' }),
                            )
                          }
                        >
                          {teacherSubjects(teacher).map((name, i) => (
                            <option key={name} value={i === 0 ? '0' : '1'}>
                              {name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>· {lessonSubject(state, x)}</>
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
                      <SplitPick
                        options={patternOptions(x.weeklyHours)}
                        value={x.pairs}
                        title="Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar"
                        onPick={(pairs) => change((d) => updateLesson(d, x.id, { pairs }))}
                      />
                    </td>
                    <td>
                      <LimitBox
                        value={x.maxPerDay}
                        fallback={state.settings.limits.maxSameLessonPerDay}
                        title="Bu ders bir günde en fazla kaç saat"
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
                        >
                          Sil
                        </button>
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

  );

  // The general list has nothing to pick, so it gets the whole width — a
  // two-column grid with an empty right column is 20rem of nothing. It stays
  // INSIDE `.cols` either way: that wrapper is the shape every list screen has
  // (`.cols > div > .panel`), and dropping it in one mode would have made this
  // the only list in the program its own helpers could not find.
  return (
    <div className={mode === 'all' ? 'cols solo' : 'cols wide-left'}>
      <div>{panel}</div>

      {/* The picker, and the same list Müsaitlik puts in this column: choosing
          among twenty classes should not be a <select> showing one row at a
          time, and the number that says whether this one is done — lessons
          entered, hours loaded — belongs on the row itself. */}
      {mode !== 'all' && (
      <aside>
          <div className="panel">
            <h2>{mode === 'teacher' ? 'Hangi öğretmen' : 'Hangi sınıf'}</h2>
            <p className="hint">
              Seçtiğiniz {modeNoun} için ders girin. Soldaki liste de o {modeNoun}a
              daralır.
            </p>
            <div className="entity-list" aria-label="Ders listesi">
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
                Henüz {modeNoun} yok. <b>Kurulum</b> sekmesinden ekleyin.
              </p>
            )}
          </div>
      </aside>
      )}
    </div>
  );
}
