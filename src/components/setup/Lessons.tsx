// Step: the lessons. One lesson = one class taking N weekly hours from one
// teacher. A block is not a separate entity: it is `blockSize` here.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import type { Lesson } from '../../types';
import { useDialogs } from '../Dialogs';
import { parseLessons } from '../../import';
import { paletteColor } from '../../palette';
import {
  addLesson,
  addLessonsFromRows,
  deleteLesson,
  deletionQuestion,
  updateLesson,
} from '../../entities';
import LimitBox from '../LimitBox';
import Paste from './Paste';
import Field from '../Field';
import type { PanelProps } from '../props';

export default function Lessons({ state, change }: PanelProps) {
  const { confirm, alert } = useDialogs();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  // Ninety-nine rows, and every one of them is a pair. Searching has to see
  // both halves of the pair and the teacher's SHORT form, because the short
  // form is what the grid says and therefore what gets remembered.
  const listCfg = useMemo<ListConfig<Lesson>>(() => {
    const cls = (x: Lesson) => state.classes.find((c) => c.id === x.classId);
    const tch = (x: Lesson) => state.teachers.find((t) => t.id === x.teacherId);
    return {
      haystack: (x) => {
        const t = tch(x);
        return `${cls(x)?.name ?? ''} ${t?.name ?? ''} ${t?.short ?? ''} ${t?.subject ?? ''}`;
      },
      facets: [{ id: 'brans', label: 'Branş', of: (x) => tch(x)?.subject ?? '' }],
      sorts: [
        { id: 'sinif', label: 'Sınıfa göre', cmp: (a, b) =>
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') ||
            compareTr(tch(a)?.short ?? '', tch(b)?.short ?? '') },
        { id: 'ogretmen', label: 'Öğretmene göre', cmp: (a, b) =>
            compareTr(tch(a)?.name ?? '', tch(b)?.name ?? '') ||
            compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') },
        { id: 'saat', label: 'Haftalık saate göre (çok → az)', cmp:
            byNumberThen((x) => x.weeklyHours, (x) => cls(x)?.name ?? '') },
        { id: 'blok', label: 'Blok boyuna göre (büyük → küçük)', cmp:
            byNumberThen((x) => x.blockSize, (x) => cls(x)?.name ?? '') },
      ],
    };
  }, [state]);
  const shown = applyList(state.lessons, query, listCfg);
  const order = useRowOrder({
    kind: 'lessons',
    count: state.lessons.length,
    query,
    change,
  });
  const [newLesson, setNewLesson] = useState({
    classId: '',
    teacherId: '',
    hours: '4',
    blockSize: '1',
  });

  return (
    <div className="panel step-panel">
      <h2>Dersler ({state.lessons.length})</h2>
      <p className="hint">
        Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. <b>Blok</b>,
        o dersin arka arkaya kaç saat işleneceğidir (1, 2 veya 3). <b>Günde ↑</b> bu
        dersin bir günde en fazla kaç saat olabileceğidir; boşsa Ayarlar → Kurallar'daki
        sayı geçerli olur.
      </p>

      {(state.classes.length === 0 || state.teachers.length === 0) && (
        <div className="warn-box">
          Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.
        </div>
      )}

      <div className="form-row">
        <select
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
        <select
          value={newLesson.teacherId}
          onChange={(e) => setNewLesson({ ...newLesson, teacherId: e.target.value })}
        >
          <option value="">Öğretmen seçin</option>
          {state.teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.short} — {t.subject}
            </option>
          ))}
        </select>
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
        <Field label="Blok">
          <select
            value={newLesson.blockSize}
            onChange={(e) => setNewLesson({ ...newLesson, blockSize: e.target.value })}
          >
            <option value="1">1 saat</option>
            <option value="2">2 saat</option>
            <option value="3">3 saat</option>
          </select>
        </Field>
        <button
          className="btn"
          disabled={newLesson.classId === '' || newLesson.teacherId === ''}
          onClick={() => {
            change((d) =>
              addLesson(d, {
                classId: newLesson.classId,
                teacherId: newLesson.teacherId,
                weeklyHours: Number(newLesson.hours) || 1,
                blockSize: Number(newLesson.blockSize) || 1,
              }),
            );
            setNewLesson({ ...newLesson, classId: '' });
          }}
        >
          Ekle
        </button>
        <Paste
          title="Dersleri yapıştır"
          example="Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok"
          parse={parseLessons}
          rowText={(x) =>
            `${x.className} — ${x.teacher}: ${x.weeklyHours} saat, ${x.blockSize}'li blok`
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
      </div>

      {state.lessons.length > 0 && (
        <ListTools
          items={state.lessons}
          query={query}
          setQuery={setQuery}
          config={listCfg}
          shown={shown.length}
          noun="ders"
          notice={order.notice}
        />
      )}

      {state.lessons.length > 0 && shown.length === 0 && (
        <p className="hint">Bu aramaya uyan ders yok.</p>
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
              {/* The handle gets a column of its own: squeezed in beside
                  something else, half of it belongs to the neighbour. */}
              <th className="grip-col" />
              <th>Sınıf</th>
              <th>Öğretmen</th>
              <th className="w-col-lg">Haftalık saat</th>
              <th className="w-col-lg">Blok</th>
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
              const rowName = `${group?.name ?? '?'} — ${teacher?.short ?? '?'}`;
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
                    {teacher?.short ?? '?'} — {teacher?.subject ?? ''}
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
                    <select
                      value={x.blockSize}
                      onChange={(e) =>
                        change((d) =>
                          updateLesson(d, x.id, { blockSize: Number(e.target.value) }),
                        )
                      }
                      title="Blok değiştirilirse bu dersin programdaki yerleşimleri kalkar"
                    >
                      <option value={1}>1 saat</option>
                      <option value={2}>2 saat</option>
                      <option value={3}>3 saat</option>
                    </select>
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
                    {/* The same `form-row nowrap` the other three steps end
                        their rows with, so the action column lines up across
                        all four. There is no inspect button beside it and that
                        is deliberate: a lesson is not an entity, it has no week
                        of its own, and the two things it could open — its class
                        or its teacher — are both already one click away in the
                        cells to the left. */}
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
}
