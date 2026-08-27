// Settings section: the school's subject list, and each subject's short form.
//
// Two jobs in one table on purpose — they are the same row.
//
// The LIST is what the Branş dropdown offers on the Öğretmenler step. It used
// to be free text, which meant "Matemtik" quietly became a second subject that
// still printed as "Mat" and could not be told from the first one on paper.
//
// The SHORT FORM exists because "Matematik" overflows a 34px grid cell and a
// ~21mm printed column; "Mat" does not. The boxes come FILLED with the default
// rather than showing it as a faint placeholder — a value you can read is a
// value you can correct — and only what is actually changed is stored.
//
// The ORDER is the fifth list that can be dragged (the four Kurulum lists are
// the others), and here it is the only thing the array's order is FOR: it is
// the order the Branş dropdown offers on the Öğretmenler step.

import { useState } from 'react';
import { useDialogs } from '../Dialogs';
import { useRowOrder } from '../useRowOrder';
import { EMPTY_QUERY } from '../../listview';
import {
  addSubject,
  DEFAULT_SUBJECT_SHORTS,
  defaultSubjectShort,
  deleteSubject,
  subjectKey,
  subjectOptions,
  setSubjectShort,
  subjectShort,
  subjectTeachers,
} from '../../entities';
import type { ReactElement } from 'react';
import type { PanelProps } from '../props';

interface RowProps extends PanelProps {
  subject: string;
  /** Is it on the school's own list, or only carried by some teacher? */
  inList: boolean;
  /** The handle cell, or an empty one to keep the columns lined up. */
  grip: ReactElement;
  onRemove: () => void;
}

function SubjectRow({ subject, state, change, inList, grip, onRemove }: RowProps) {
  const current = subjectShort(state.settings, subject);
  const fallback = defaultSubjectShort(subject);
  const users = subjectTeachers(state, subject);
  return (
    <tr data-row-name={subject}>
      {grip}
      <td>
        {subject}
        {!inList && (
          <span className="hint" title="Bir öğretmende var ama listede yok">
            {' '}
            · listede değil
          </span>
        )}
      </td>
      <td>
        <input
          type="text"
          className="text-sm"
          aria-label={`${subject} kısaltması`}
          // defaultValue + a key that changes with the value: typing
          // must not re-render on every keystroke (PLAN pitfall 3).
          key={current}
          defaultValue={current}
          onBlur={(e) => change((d) => setSubjectShort(d, subject, e.target.value))}
        />
      </td>
      <td className="num" title={users.map((t) => t.name).join(', ')}>
        {users.length}
      </td>
      <td className="hint">
        {current === fallback ? 'varsayılan' : `varsayılanı: ${fallback}`}
      </td>
      <td>
        <button
          className="btn danger"
          disabled={!inList}
          title={inList ? 'Listeden çıkar' : 'Bu branş zaten listede değil'}
          onClick={onRemove}
        >
          Sil
        </button>
      </td>
    </tr>
  );
}

export default function Subjects({ state, change }: PanelProps) {
  const { confirm, alert } = useDialogs();
  const [fresh, setFresh] = useState('');

  const options = subjectOptions(state);
  const listed = new Set(state.settings.subjects.map(subjectKey));
  const clash = options.some((x) => subjectKey(x) === subjectKey(fresh)) && fresh.trim() !== '';

  // Two groups, and the split is not cosmetic: only the school's OWN list has
  // an order to change. `subjectOptions` appends whatever a teacher carries but
  // the list does not hold, so a row's position on screen is not its position
  // in `settings.subjects` — dragging by the visible index would move the wrong
  // name. The strays get their own <tbody> for the same reason: `rowDrag` finds
  // its target by index among the tbody's children.
  const strays = options.filter((x) => !listed.has(subjectKey(x)));
  const order = useRowOrder({
    kind: 'subjects',
    count: state.settings.subjects.length,
    // No ListTools here: twelve to twenty rows is not a list you search, and a
    // sort would only ever lock the handles. With nothing narrowing, the visible
    // rows ARE the array — which is the whole condition `canReorder` checks.
    query: EMPTY_QUERY,
    change,
  });

  function add() {
    const name = fresh.trim();
    if (name === '' || clash) return;
    change((d) => addSubject(d, name));
    setFresh('');
  }

  async function remove(subject: string) {
    const users = subjectTeachers(state, subject);
    if (users.length > 0) {
      await alert({
        title: `"${subject}" branşı kullanılıyor`,
        tone: 'warn',
        body: `${users.length} öğretmen bu branşta (${users.map((t) => t.short).join(', ')}). Önce onların branşını değiştirin, sonra bu branşı silin.`,
      });
      return;
    }
    if (
      !(await confirm({
        title: `"${subject}" branşı listeden çıkarılacak`,
        body: 'Hiçbir öğretmen bu branşta değil, yani başka bir şey etkilenmiyor.',
        confirmLabel: 'Çıkar',
        danger: true,
      }))
    ) {
      return;
    }
    change((d) => deleteSubject(d, subject));
  }

  // The built-in table the short forms come from. Anything already on the
  // school's list is not on offer; what is left is one click away instead of
  // being retyped — and typed-in names are exactly how "Matemtik" was born.
  const ready = Object.keys(DEFAULT_SUBJECT_SHORTS).filter(
    (name) => !options.some((x) => subjectKey(x) === subjectKey(name)),
  );
  const unused = options.filter((x) => subjectTeachers(state, x).length === 0);

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>Branşlar ({options.length})</h2>
          <p className="hint">
            Öğretmen eklerken branş <b>bu listeden</b> seçilir, elle yazılmaz. Böylece
            aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve
            yazdırılan sayfada görünür; yalnızca <b>değiştirdikleriniz</b> saklanır.
            Satırları tutamağından sürükleyerek (ya da tutamak seçiliyken ok
            tuşlarıyla) sıralayabilirsiniz. Öğretmen eklerken açılan liste bu
            sırada gelir.
          </p>

          <div className="form-row">
            <input
              type="text"
              placeholder="Yeni branş (örn. Robotik)"
              aria-label="Yeni branş"
              value={fresh}
              onChange={(e) => setFresh(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
              }}
            />
            <button className="btn" disabled={fresh.trim() === '' || clash} onClick={add}>
              Ekle
            </button>
            {clash && <span className="hint">Bu branş listede zaten var.</span>}
          </div>

          {/* Said out loud, because a keyboard move happens somewhere the eye
              is not necessarily following. Same markup ListTools uses. */}
          <span className="list-said" role="status" aria-live="polite">
            {order.notice}
          </span>

          <table className="list">
            <thead>
              <tr>
                <th className="grip-col" />
                <th>Branş</th>
                <th className="w-col-lg">Kısaltma</th>
                <th className="num">
                  Öğretmen
                </th>
                <th className="w-col-xl" />
                <th className="w-col-md" />
              </tr>
            </thead>
            <tbody ref={order.bodyRef}>
              {state.settings.subjects.map((subject, i) => (
                <SubjectRow
                  key={subjectKey(subject)}
                  subject={subject}
                  state={state}
                  change={change}
                  inList
                  grip={order.grip(i, subject)}
                  onRemove={() => remove(subject)}
                />
              ))}
            </tbody>
            {strays.length > 0 && (
              <tbody>
                {strays.map((subject) => (
                  <SubjectRow
                    key={subjectKey(subject)}
                    subject={subject}
                    state={state}
                    change={change}
                    inList={false}
                    grip={<td className="grip-col" />}
                    onRemove={() => remove(subject)}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <aside>
        <div className="panel">
          <h2>Hazır kısaltmalar ({ready.length})</h2>
          <p className="hint">
            Programda gömülü olan ve okulun listesinde <b>bulunmayan</b> branşlar.
            Kısaltmaları hazır; eklemek için tıklayın.
          </p>
          {ready.length === 0 ? (
            <div className="ok-box">Gömülü tablodaki branşların hepsi listenizde.</div>
          ) : (
            <table className="stat">
              <tbody>
                {ready.map((name) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className="num">{DEFAULT_SUBJECT_SHORTS[name]}</td>
                    <td>
                      <button
                        className="btn"
                        title={`${name} branşını listeye ekler`}
                        onClick={() => change((d) => addSubject(d, name))}
                      >
                        Ekle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {unused.length > 0 && (
            <p className="hint">
              Hiçbir öğretmende kullanılmayan {unused.length} branş var:{' '}
              {unused.join(', ')}. Silinebilirler.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
