// Step: the teachers. Every teacher has exactly ONE subject (docs/STATUS.md);
// the three limit boxes are per-teacher exceptions to the school-wide rules.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import { openHours } from '../../entities';
import type { Gender, Id, Teacher } from '../../types';
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
  subjectKey,
  subjectOptions,
  subjectRank,
  teacherRank,
  teacherSubjects,
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
    () => {
      const rank = subjectRank(state);
      return {
      haystack: (t) =>
        `${t.name} ${t.short} ${teacherSubjects(t).join(' ')} ${genderLabel(t.gender)}`,
      facets: [
        // BOTH subjects: a teacher who holds two belongs under either chip, and
        // "Edebiyat" that could not find the person teaching it would be a
        // filter that lies. The chips run in the school's own order, the one
        // Ayarlar > Branşlar is dragged into — not the alphabet.
        {
          id: 'brans',
          label: 'Branş',
          of: teacherSubjects,
          order: (name) => rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER,
        },
        // Blank is a group too, and it is the one worth finding: it is the
        // list of rows still to be filled in.
        { id: 'cinsiyet', label: 'Cinsiyet', of: (t) => genderLabel(t.gender) },
      ],
      sorts: [
        { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
        // The school's order, not the alphabet — and read from BOTH of a
        // teacher's subjects, the way the chip above already does.
        { id: 'brans', label: 'Branşa göre', cmp: (a, b) =>
            teacherRank(rank, a) - teacherRank(rank, b) || compareTr(a.name, b.name) },
        { id: 'yuk', label: 'Ders yüküne göre (çok → az)', cmp:
            byNumberThen((t) => weeklyLoad(state, 'teacher', t.id), (t) => t.name) },
        { id: 'acik', label: 'Açık saate göre (az → çok)', cmp:
            byNumberThen((t) => openHours(state, t.id), (t) => t.name, 'asc') },
        { id: 'cinsiyet', label: 'Cinsiyete göre', cmp: (a, b) =>
            compareTr(genderLabel(a.gender), genderLabel(b.gender)) ||
            compareTr(a.name, b.name) },
      ],
      };
    },
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
    useState<{
      name: string;
      short: string;
      subject: string;
      gender: Gender;
      subject2: string;
    }>({
      name: '', short: '', subject: '', gender: '', subject2: '',
    });
  // Whether the second-subject question has been answered "yes" on THIS form.
  // A box that is always there would be a fifth thing to read past on a row
  // that is typed twenty-five times; the question is one small button.
  const [askSecond, setAskSecond] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [freshSubject, setFreshSubject] = useState<string | null>(null);
  // Which rows have been ASKED the second-subject question and answered "yes"
  // but not yet picked one. Nothing is written to `State` until a subject is
  // chosen, so a mis-click costs a click back and not a data change.
  const [opening, setOpening] = useState<ReadonlySet<Id>>(new Set());
  const subjects = subjectOptions(state);

  // Left empty, the short form is derived — so show what it will be.
  const suggested = newTeacher.name.trim() === '' ? 'Kısaltma' : makeShort(newTeacher.name);
  const clashes = duplicateShorts(state.teachers);

  /** What the Ekle button will actually store as the branch. */
  function subjectOf(): string {
    return (freshSubject === null ? newTeacher.subject : freshSubject).trim();
  }

  // Enter adds, the way it does in the other three lists. It reads the same
  // guard the button's `disabled` reads, so the keyboard cannot get past a
  // check the mouse cannot.
  function addNew() {
    const subject = subjectOf();
    if (newTeacher.name.trim() === '' || subject === '') return;
    change((d) =>
      addTeacher(addSubject(addSubject(d, newTeacher.subject2), subject), {
        ...newTeacher,
        subject,
      }),
    );
    setNewTeacher({ name: '', short: '', subject: '', gender: '', subject2: '' });
    setFreshSubject(null);
    setAskSecond(false);
  }

  return (
    <div className="panel step-panel">
      {/* The paste button rides the HEADING, not the form row: "Excel'den
          yapıştır o bloğun en sağında hatta en sağ üstünde bile olabilir."
          All four panels put it in the same corner, so the shape of a panel
          stays one shape. */}
      <div className="panel-head">
        <h2>Öğretmenler ({state.teachers.length})</h2>
        <button className="btn" onClick={() => setPasteOpen(true)}>
          Excel'den yapıştır
        </button>
      </div>
      <p className="hint">
        Branş <b>listeden seçilir</b>; listede yoksa “+ Yeni branş…” ile eklenir.
        Bir öğretmen iki branş veriyorsa (Türkçe ve Edebiyat gibi){' '}
        <b>+ İkinci branş</b> ile ikincisi de yazılır; o zaman her dersinde
        hangi branştan olduğu ayrıca seçilir.
        Kısaltma ızgarada satır başlığı olarak
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNew();
          }}
        />
        <input
          type="text"
          aria-label="Kısaltma"
          placeholder={suggested}
          title="Boş bırakırsanız addan üretilir"
          className="text-sm"
          value={newTeacher.short}
          onChange={(e) => setNewTeacher({ ...newTeacher, short: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNew();
          }}
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
        {/* "öğretmenleri eklerken ikinci branşı var mı diye sorulsun" — asked
            here as a button, and only once it is pressed is there a box. The
            answer for most of the staff is no, and a permanent dropdown would
            make the usual row longer to serve the rare one. */}
        {!askSecond && newTeacher.subject2 === '' ? (
          <button
            type="button"
            className="btn subtle"
            onClick={() => setAskSecond(true)}
          >
            + İkinci branş
          </button>
        ) : (
          <select
            aria-label="İkinci branş"
            value={newTeacher.subject2}
            onChange={(e) => setNewTeacher({ ...newTeacher, subject2: e.target.value })}
          >
            <option value="">İkinci branş yok</option>
            {subjects
              .filter((x) => subjectKey(x) !== subjectKey(subjectOf()))
              .map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
          </select>
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
          onClick={addNew}
        >
          Ekle
        </button>
      </div>

      <Paste
        open={pasteOpen}
        close={() => setPasteOpen(false)}
        title="Öğretmenleri yapıştır"
        example="Ad Soyad · Kısaltma · Branş · Cinsiyet · İkinci branş"
        parse={parseTeachers}
        rowText={(x) =>
          `${x.name} (${x.short}) · ${x.subject}` +
          (x.subject2 === '' ? '' : ` + ${x.subject2}`) +
          (x.gender === '' ? '' : ` · ${genderLabel(x.gender)}`)
        }
        onAdd={(rows) => change((d) => addTeachersFromRows(d, rows))}
      />

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
              {order.head}
              <th className="w-col-xs">Renk</th>
              <th className="w-col-xl">Ad</th>
              {/* --w-col-lg was 16ch — 144 px at 125 %, for a heading that
                  asks for 78 and a box that holds "MÇ". This column alone was
                  the last 54 px of the sideways scroll. */}
              <th className="w-col-sm">Kısaltma</th>
              <th>Branş</th>
              {/* Most of the staff hold one subject, so this column is usually
                  a row of small buttons rather than a row of dropdowns — see
                  the cell. It still gets a heading: a column of controls with
                  no name is a column nobody reads. */}
              <th title="İkinci branş">2. branş</th>
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
                  {/* Asked for in these words: "ikinci branşı var mı diye
                      sorulsun, evetse ikinci branş seçme opsiyonu gelsin."
                      So the usual row shows a question, not a control — with a
                      dropdown here always, twenty-three of twenty-five teachers
                      would carry a box saying "yok" and the column would read
                      as something to fill in. */}
                  {t.subject2 === '' && !opening.has(t.id) ? (
                    <button
                      type="button"
                      className="btn subtle"
                      // Its own name per row: twenty-five buttons all called
                      // "+ İkinci branş" name nothing (pitfall 49).
                      aria-label={`${t.short} için ikinci branş ekle`}
                      title="İkinci branş ekle"
                      onClick={() => setOpening(new Set(opening).add(t.id))}
                    >
                      {/* A bare + under a column headed "2. branş", because the
                          words cost 39 px of column width across a table that
                          was already 106 px over its box at 125 % — measured.
                          The words are still there for anyone who needs them:
                          they are the button's accessible name and its
                          tooltip. */}
                      +
                    </button>
                  ) : (
                    <select
                      aria-label={`${t.short} ikinci branşı`}
                      value={t.subject2}
                      onChange={(e) =>
                        change((d) => updateTeacher(d, t.id, { subject2: e.target.value }))
                      }
                    >
                      {/* Blank first, and it is how the column is emptied
                          again: a second subject that could be added but not
                          removed is a one-way door. Choosing it clears the
                          flag on that teacher's lessons too — sanitize(). */}
                      <option value="">Yok</option>
                      {subjects
                        .filter((x) => subjectKey(x) !== subjectKey(t.subject))
                        .map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                    </select>
                  )}
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
