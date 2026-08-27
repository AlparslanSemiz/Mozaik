// Step: the teachers. Every teacher has exactly ONE subject (docs/STATUS.md);
// the three limit boxes are per-teacher exceptions to the school-wide rules.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import { openHours } from '../../entities';
import type { Gender, Teacher } from '../../types';
import { PanelRight } from 'lucide-react';
import { useInspect } from '../Inspector';
import { useDialogs } from '../Dialogs';
import { parseTeachers } from '../../import';
import ColorPick from '../ColorPick';
import {
  addSubject,
  addTeacher,
  addTeachersFromRows,
  deleteTeacher,
  deletionQuestion,
  duplicateShorts,
  genderCell,
  genderLabel,
  makeShort,
  setTeacherLimit,
  subjectOptions,
  updateTeacher,
  weeklyLoad,
} from '../../entities';
import LimitBox from '../LimitBox';
import Paste from './Paste';
import type { PanelProps } from '../props';

/** Sentinel option value: picking it opens a box instead of setting a subject. */
const NEW = '\u0000yeni';

/** Blank first: it is the value a row starts at, and the honest default. */
const GENDERS: Gender[] = ['', 'k', 'e'];

export default function Teachers({ state, change }: PanelProps) {
  const { confirm } = useDialogs();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  // Twenty-five rows is where reading a column stops working, and the reader
  // asked for both halves of this: "listeleri ... grupça filtreleyebilelim"
  // and "sıralama ... branşa göre, isme göre vesaire".
  const listCfg = useMemo<ListConfig<Teacher>>(
    () => ({
      haystack: (t) => `${t.name} ${t.short} ${t.subject} ${genderLabel(t.gender)}`,
      facets: [
        { id: 'brans', label: 'Branş', of: (t) => t.subject },
        // Blank is a group too, and it is the one worth finding: it is the
        // list of rows still to be filled in.
        { id: 'cinsiyet', label: 'Cinsiyet', of: (t) => genderLabel(t.gender) },
      ],
      sorts: [
        { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
        { id: 'brans', label: 'Branşa göre', cmp: (a, b) =>
            compareTr(a.subject, b.subject) || compareTr(a.name, b.name) },
        { id: 'yuk', label: 'Ders yüküne göre (çok → az)', cmp:
            byNumberThen((t) => weeklyLoad(state, 'teacher', t.id), (t) => t.name) },
        { id: 'acik', label: 'Açık saate göre (az → çok)', cmp:
            byNumberThen((t) => openHours(state, t.id), (t) => t.name, 'asc') },
        { id: 'cinsiyet', label: 'Cinsiyete göre', cmp: (a, b) =>
            compareTr(genderLabel(a.gender), genderLabel(b.gender)) ||
            compareTr(a.name, b.name) },
      ],
    }),
    [state],
  );
  const shown = applyList(state.teachers, query, listCfg);
  const order = useRowOrder({
    kind: 'teachers',
    count: state.teachers.length,
    query,
    change,
  });
  const [newTeacher, setNewTeacher] =
    useState<{ name: string; short: string; subject: string; gender: Gender }>({
      name: '', short: '', subject: '', gender: '',
    });
  const [freshSubject, setFreshSubject] = useState<string | null>(null);
  const subjects = subjectOptions(state);

  // Left empty, the short form is derived — so show what it will be.
  const suggested = newTeacher.name.trim() === '' ? 'Kısaltma' : makeShort(newTeacher.name);
  const clashes = duplicateShorts(state.teachers);

  /** What the Ekle button will actually store as the branch. */
  function subjectOf(): string {
    return (freshSubject === null ? newTeacher.subject : freshSubject).trim();
  }

  return (
    <div className="panel step-panel">
      <h2>Öğretmenler ({state.teachers.length})</h2>
      <p className="hint">
        Her öğretmenin tek branşı vardır ve <b>listeden seçilir</b>. Listede
        yoksa “+ Yeni branş…” ile eklenir. Kısaltma ızgarada satır başlığı olarak
        görünür, kısa tutun (örn. MÇ). Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu
        öğretmene özel sınırdır; <b>boş bırakılırsa Ayarlar → Kurallar'daki sayı</b>{' '}
        geçerli olur.
      </p>
      <div className="form-row">
        <input
          type="text"
          placeholder="Ad Soyad"
          value={newTeacher.name}
          onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
        />
        <input
          type="text"
          aria-label="Kısaltma"
          placeholder={suggested}
          title="Boş bırakırsanız addan üretilir"
          className="text-sm"
          value={newTeacher.short}
          onChange={(e) => setNewTeacher({ ...newTeacher, short: e.target.value })}
        />
        {/* A dropdown, not free text: typed "Matemtik" used to become a second
            subject that still printed as "Mat" and could not be told from the
            first one on paper. New subjects are added on the spot. */}
        <select
          aria-label="Branş"
          value={freshSubject === null ? newTeacher.subject : NEW}
          onChange={(e) => {
            if (e.target.value === NEW) {
              setFreshSubject('');
              return;
            }
            setFreshSubject(null);
            setNewTeacher({ ...newTeacher, subject: e.target.value });
          }}
        >
          <option value="">Branş seçin</option>
          {subjects.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
          <option value={NEW}>+ Yeni branş…</option>
        </select>
        {freshSubject !== null && (
          <input
            type="text"
            autoFocus
            placeholder="Yeni branşın adı"
            aria-label="Yeni branşın adı"
            value={freshSubject}
            onChange={(e) => setFreshSubject(e.target.value)}
          />
        )}
        {/* Optional on purpose: a name and a subject are what make a teacher,
            and a required fourth box would stop the row being typed at all. */}
        {/* No `.text-sm`: that box is 16ch and "Belirtilmemiş" came out as
            "Belirtilm". A control that hides which value is in it is the same
            mistake the sort menu carries a comment about. */}
        <select
          aria-label="Cinsiyet"
          value={newTeacher.gender}
          onChange={(e) =>
            setNewTeacher({ ...newTeacher, gender: e.target.value as Gender })
          }
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {genderLabel(g)}
            </option>
          ))}
        </select>
        <button
          className="btn"
          disabled={newTeacher.name.trim() === '' || subjectOf() === ''}
          onClick={() => {
            const subject = subjectOf();
            change((d) => addTeacher(addSubject(d, subject), { ...newTeacher, subject }));
            setNewTeacher({ name: '', short: '', subject: '', gender: '' });
            setFreshSubject(null);
          }}
        >
          Ekle
        </button>
        <Paste
          title="Öğretmenleri yapıştır"
          example="Ad Soyad · Kısaltma · Branş · Cinsiyet"
          parse={parseTeachers}
          rowText={(x) =>
            `${x.name} (${x.short}) · ${x.subject}` +
            (x.gender === '' ? '' : ` · ${genderLabel(x.gender)}`)
          }
          onAdd={(rows) => change((d) => addTeachersFromRows(d, rows))}
        />
      </div>

      {clashes.length > 0 && (
        <div className="warn-box">
          <b>Aynı kısaltma birden çok öğretmende:</b> ızgarada iki satır ayırt edilemez.
          {clashes.map((c) => (
            <div key={c.short}>
              <b>{c.short}</b> · {c.names.join(', ')}
            </div>
          ))}
        </div>
      )}

      {state.teachers.length > 0 && (
        <ListTools
          items={state.teachers}
          query={query}
          setQuery={setQuery}
          config={listCfg}
          shown={shown.length}
          noun="öğretmen"
          notice={order.notice}
        />
      )}

      {state.teachers.length > 0 && shown.length === 0 && (
        <p className="hint">Bu aramaya uyan öğretmen yok.</p>
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
              <th>Renk</th>
              <th>Ad</th>
              {/* --w-col-lg was 16ch — 144 px at 125 %, for a heading that
                  asks for 78 and a box that holds "MÇ". This column alone was
                  the last 54 px of the sideways scroll. */}
              <th className="w-col-sm">Kısaltma</th>
              <th>Branş</th>
              {/* No width class: the <select>'s own longest option
                  ("Belirtilmemiş") is wider than any ladder step this column
                  deserves, so the box decides and the column follows it
                  (pitfall 34). --w-col-md was 12 px more than that. */}
              <th>Cinsiyet</th>
              <th className="num" title="Art arda en fazla kaç saat">
                Art arda
              </th>
              <th className="num" title="Bir günde en fazla kaç saat">
                Günde ↑
              </th>
              <th className="num" title="Geldiği gün en az kaç saat">
                Günde ↓
              </th>
              <th className="w-col-sm">Ders saati</th>
              <th className="w-col-md" />
            </tr>
          </thead>
          <tbody ref={order.bodyRef}>
            {shown.map((t, i) => (
              <tr key={t.id} data-row-name={t.name}>
                {order.grip(i, t.name)}
                <td>
                  <ColorPick
                    value={t.color}
                    owner={t.short}
                    onChange={(next) =>
                      change((d) => updateTeacher(d, t.id, { color: next }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={t.name}
                    onBlur={(e) =>
                      change((d) => updateTeacher(d, t.id, { name: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="text-sm"
                    defaultValue={t.short}
                    onBlur={(e) =>
                      change((d) => updateTeacher(d, t.id, { short: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <select
                    aria-label={`${t.short} branşı`}
                    value={t.subject}
                    onChange={(e) =>
                      change((d) => updateTeacher(d, t.id, { subject: e.target.value }))
                    }
                  >
                    {/* subjectOptions already contains this teacher's subject
                        even when the school list does not — otherwise the
                        dropdown would silently change it on first render. */}
                    {subjects.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {/* Named per row like the subject box beside it: twenty-five
                      controls all called "Cinsiyet" name nothing. */}
                  <select
                    aria-label={`${t.short} cinsiyeti`}
                    value={t.gender}
                    onChange={(e) =>
                      change((d) =>
                        updateTeacher(d, t.id, { gender: e.target.value as Gender }),
                      )
                    }
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {genderCell(g)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <LimitBox
                    value={t.limits.maxConsecutive}
                    fallback={state.settings.limits.maxConsecutive}
                    title={`${t.short} art arda en fazla kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxConsecutive', v))}
                  />
                </td>
                <td>
                  <LimitBox
                    value={t.limits.maxPerDay}
                    fallback={state.settings.limits.maxPerDay}
                    title={`${t.short} günde en fazla kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxPerDay', v))}
                  />
                </td>
                <td>
                  <LimitBox
                    value={t.limits.minPerDay}
                    fallback={state.settings.limits.minPerDay}
                    title={`${t.short} geldiği gün en az kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'minPerDay', v))}
                  />
                </td>
                <td>{weeklyLoad(state, 'teacher', t.id)}</td>
                <td>
                  <div className="form-row nowrap">
                  {/* Its whole week, its load and what it is tied to, without
                      leaving the list. The information was always there; it
                      was spread over four tabs. */}
                  <button
                    className="btn icon"
                    aria-label={`${t.short} bilgileri`}
                    title="Bilgileri ve haftalık programı"
                    onClick={() => inspect('teacher', t.id)}
                  >
                    <PanelRight size={16} strokeWidth={2} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={async () => {
                      const q = deletionQuestion(state, 'teacher', t.id);
                      if (!(await confirm({ title: q.title, body: q.cost, confirmLabel: 'Sil', danger: true })))
                        return;
                      change((d) => deleteTeacher(d, t.id));
                    }}
                  >
                    Sil
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
