// The "Yeni öğretmen" block of the teachers step: the add row and the paste
// dialog. Its draft lives here, not in the list, because nothing else reads it.

import { useState } from 'react';
import {
  addSubject,
  addTeacher,
  addTeachersFromRows,
  genderLabel,
  makeShort,
  subjectKey,
  subjectLabel,
  subjectOption,
  subjectOptions,
} from '../../pure/entities';
import { type Gender, cleanEmail, looksLikeEmail } from '../../leaf/model';
import { type PanelProps, T, useT } from '../common';
import { parseTeachers } from '../../pure/io';
import { Paste, AddPanel } from '../lists';
import { GENDERS } from './genders';

/** Sentinel option value: picking it opens a box instead of setting a subject. */
const NEW = '\u0000yeni';

/* `subjectOption` moved to entities.ts on 2026-08-30: the entity sheet draws
   the same dropdown now, and two copies of "short · full" are two places for
   the two to disagree. */

export function TeacherForm({ state, change }: PanelProps) {
  const t = useT();
  const [newTeacher, setNewTeacher] = useState<{
    name: string;
    short: string;
    subject: string;
    gender: Gender;
    subject2: string;
    email: string;
  }>({
    name: '',
    short: '',
    subject: '',
    gender: '',
    subject2: '',
    email: '',
  });
  // Whether the second-subject question has been answered "yes" on THIS form.
  // A box that is always there would be a fifth thing to read past on a row
  // that is typed twenty-five times; the question is one small button.
  const [askSecond, setAskSecond] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [freshSubject, setFreshSubject] = useState<string | null>(null);
  // Enter or Ekle was tried with a name and no branch. The button used to go
  // grey and Enter did nothing, i.e. the form refused without a word.
  const [needSubject, setNeedSubject] = useState(false);
  const subjects = subjectOptions(state);

  // Left empty, the short form is derived — so show what it will be.
  const suggested = newTeacher.name.trim() === '' ? t('Kısa ad') : makeShort(newTeacher.name);

  /** What the Ekle button will actually store as the branch. */
  function subjectOf(): string {
    return (freshSubject === null ? newTeacher.subject : freshSubject).trim();
  }

  // Enter adds, the way it does in the other three lists. It reads the same
  // guard the button's `disabled` reads, so the keyboard cannot get past a
  // check the mouse cannot.
  function addNew() {
    const subject = subjectOf();
    if (newTeacher.name.trim() !== '' && subject === '') setNeedSubject(true);
    if (newTeacher.name.trim() === '' || subject === '') return;
    setNeedSubject(false);
    change((d) =>
      addTeacher(addSubject(addSubject(d, newTeacher.subject2), subject), {
        ...newTeacher,
        subject,
      }),
    );
    setNewTeacher({
      name: '',
      short: '',
      subject: '',
      gender: '',
      subject2: '',
      email: '',
    });
    setFreshSubject(null);
    setAskSecond(false);
  }

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
        title={t('Yeni öğretmen')}
        action={
          <button className="btn" onClick={() => setPasteOpen(true)}>
            {t("Excel'den yapıştır")}
          </button>
        }
        description={<T k="Branş **listeden seçilir**; kısa ad ızgarada satır başlığı olur." />}
        more={t(
          'Bir öğretmen iki branş veriyorsa + İkinci branş ile ikincisi de yazılır; o zaman her dersinde hangi branştan olduğu ayrıca seçilir. Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu öğretmene özel sınırdır; boş bırakılırsa Ayarlar → Kurallar’daki sayı geçerli olur.',
        )}
      >
        <div className="form-row">
          <input
            type="text"
            placeholder={t('Ad Soyad')}
            value={newTeacher.name}
            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addNew();
            }}
          />
          <input
            type="text"
            aria-label={t('Kısa ad')}
            placeholder={suggested}
            title={t('Boş bırakırsanız addan üretilir')}
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
            aria-label={t('Branş')}
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
            <option value="">{t('Branş seçin')}</option>
            {subjects.map((x) => (
              <option key={x} value={x}>
                {subjectOption(state.settings, x)}
              </option>
            ))}
            <option value={NEW}>{t('+ Yeni branş…')}</option>
          </select>
          {/* A new project's subject list is empty by design, so on the very
              first teacher this dropdown offers nothing but "+ Yeni branş…" and
              the Ekle button stays locked. Say where the list is rather than
              leaving the reader to find the step. */}
          {subjects.length === 0 && (
            <span className="hint">
              <T k="Branş listesi boş. **Branşlar** adımından ekleyebilirsiniz." />
            </span>
          )}
          {freshSubject !== null && (
            <input
              type="text"
              autoFocus
              placeholder={t('Yeni branşın adı')}
              aria-label={t('Yeni branşın adı')}
              value={freshSubject}
              onChange={(e) => setFreshSubject(e.target.value)}
            />
          )}
          {/* "öğretmenleri eklerken ikinci branşı var mı diye sorulsun" — asked
              here as a button, and only once it is pressed is there a box. The
              answer for most of the staff is no, and a permanent dropdown would
              make the usual row longer to serve the rare one. */}
          {!askSecond && newTeacher.subject2 === '' ? (
            <button type="button" className="btn subtle" onClick={() => setAskSecond(true)}>
              {t('+ İkinci branş')}
            </button>
          ) : (
            <select
              aria-label={t('İkinci branş')}
              value={newTeacher.subject2}
              onChange={(e) => setNewTeacher({ ...newTeacher, subject2: e.target.value })}
            >
              <option value="">{t('İkinci branş yok')}</option>
              {subjects
                .filter((x) => subjectKey(x) !== subjectKey(subjectOf()))
                .map((x) => (
                  <option key={x} value={x}>
                    {subjectOption(state.settings, x)}
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
            aria-label={t('Cinsiyet')}
            value={newTeacher.gender}
            onChange={(e) => setNewTeacher({ ...newTeacher, gender: e.target.value as Gender })}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {genderLabel(g)}
              </option>
            ))}
          </select>
          {/* Optional like the gender, and wide from the first letter: the
              table's own box is six letters until it is clicked, and an
              address typed blind is one wrong letter nobody sees. A box that
              does not hold one address is marked here and kept as typed, the
              way the table keeps it. */}
          <input
            type="text"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            className="email-box"
            placeholder={t('E-posta')}
            aria-label={t('E-posta')}
            value={newTeacher.email}
            aria-invalid={
              newTeacher.email.trim() !== '' && !looksLikeEmail(cleanEmail(newTeacher.email))
            }
            title={
              newTeacher.email.trim() !== '' && !looksLikeEmail(cleanEmail(newTeacher.email))
                ? t('Tek bir e-posta adresi yazılır: ad@ornek.com')
                : undefined
            }
            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addNew();
            }}
          />
          {/* Not `disabled` for a missing branch: a grey button says no and
              not why. Pressed, it says what is missing; the name is the one
              thing that still locks it, because nothing at all is typed. */}
          <button className="btn primary" disabled={newTeacher.name.trim() === ''} onClick={addNew}>
            {t('Ekle')}
          </button>
        </div>
        {needSubject && subjectOf() === '' && (
          <p className="hint bad" role="status">
            {t('Önce bir branş seçin.')}
          </p>
        )}

        <Paste
          open={pasteOpen}
          close={() => setPasteOpen(false)}
          title={t('Öğretmenleri yapıştır')}
          example={t('Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta')}
          parse={parseTeachers}
          rowText={(x) =>
            `${x.name} (${x.short}) · ${subjectLabel(x.subject)}` +
            (x.subject2 === '' ? '' : ` + ${subjectLabel(x.subject2)}`) +
            (x.gender === '' ? '' : ` · ${genderLabel(x.gender)}`) +
            (x.email === '' ? '' : ` · ${x.email}`)
          }
          onAdd={(rows) => change((d) => addTeachersFromRows(d, rows))}
        />
      </AddPanel>
    </>
  );
}
