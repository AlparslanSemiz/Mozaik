// The person page before there is a person: "+ Yeni öğretmen" and "+ Yeni
// sınıf" at the end of the Okul lists open this (Sadeleşme, K5). It replaced
// the add form above each list, a 170 px card that was the first thing on the
// screen and was used once per teacher per term.
//
// Ekle makes the teacher or the class and the page becomes theirs at once, so
// the next thing a new teacher needs — the hours they cannot come — is right
// there. Twenty-five at a time is what "Excel'den yapıştır" over the list is
// for.

import { useState } from 'react';
import { type Gender, type Id, type State, cleanEmail, looksLikeEmail } from '../../leaf/model';
import {
  addClass,
  addSubject,
  addTeacher,
  genderLabel,
  makeShort,
  newId,
  subjectKey,
  subjectOption,
  subjectOptions,
} from '../../pure/entities';
import { T, useT } from '../common';

/** Sentinel option value: picking it opens a box instead of setting a subject. */
const NEW = '\u0000yeni';

/** Blank first: it is the value a teacher starts at, and the honest default. */
export const GENDERS: Gender[] = ['', 'k', 'e'];

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  /** The page turns into the new one's own page. */
  added: (id: Id) => void;
}

export function NewTeacher({ state, change, added }: Props) {
  const t = useT();
  const [draft, setDraft] = useState({
    name: '',
    short: '',
    subject: '',
    gender: '' as Gender,
    subject2: '',
    email: '',
  });
  const [freshSubject, setFreshSubject] = useState<string | null>(null);
  // Enter or Ekle was tried with a name and no branch: say so, rather than a
  // grey button that refuses without a word.
  const [needSubject, setNeedSubject] = useState(false);
  const subjects = subjectOptions(state);
  const subjectOf = () => (freshSubject === null ? draft.subject : freshSubject).trim();
  const badEmail = draft.email.trim() !== '' && !looksLikeEmail(cleanEmail(draft.email));

  // Enter adds too, and it reads the same guard the button reads, so the
  // keyboard cannot get past a check the mouse cannot.
  function add() {
    const subject = subjectOf();
    if (draft.name.trim() === '') return;
    if (subject === '') {
      setNeedSubject(true);
      return;
    }
    const id = newId();
    change((d) =>
      addTeacher(addSubject(addSubject(d, draft.subject2), subject), { ...draft, subject, id }),
    );
    added(id);
  }
  const enter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') add();
  };

  return (
    <>
      <dl className="sheet-edit">
        <dt>{t('Ad')}</dt>
        <dd>
          <input
            type="text"
            className="dlg-input"
            autoFocus
            placeholder={t('Ad Soyad')}
            aria-label={t('Ad')}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={enter}
          />
        </dd>
        <dt>{t('Kısa ad')}</dt>
        <dd>
          {/* Left empty, the short form is derived — so show what it will be. */}
          <input
            type="text"
            className="text-sm"
            aria-label={t('Kısa ad')}
            placeholder={draft.name.trim() === '' ? t('Kısa ad') : makeShort(draft.name)}
            title={t('Boş bırakırsanız addan üretilir')}
            value={draft.short}
            onChange={(e) => setDraft({ ...draft, short: e.target.value })}
            onKeyDown={enter}
          />
        </dd>
        <dt>{t('Branş')}</dt>
        <dd className="form-row">
          {/* A dropdown, not free text: typed "Matemtik" used to become a
              second subject that printed as "Mat" like the first. New subjects
              are added on the spot. */}
          <select
            aria-label={t('Branş')}
            value={freshSubject === null ? draft.subject : NEW}
            onChange={(e) => {
              if (e.target.value === NEW) {
                setFreshSubject('');
                return;
              }
              setFreshSubject(null);
              setDraft({ ...draft, subject: e.target.value });
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
          {/* A new project's subject list is empty by design: say where it is. */}
          {subjects.length === 0 && freshSubject === null && (
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
              onKeyDown={enter}
            />
          )}
        </dd>
        <dt>{t('2. branş')}</dt>
        <dd>
          <select
            aria-label={t('2. branş')}
            value={draft.subject2}
            onChange={(e) => setDraft({ ...draft, subject2: e.target.value })}
          >
            <option value="">{t('Yok')}</option>
            {subjects
              .filter((x) => subjectKey(x) !== subjectKey(subjectOf()))
              .map((x) => (
                <option key={x} value={x}>
                  {subjectOption(state.settings, x)}
                </option>
              ))}
          </select>
        </dd>
        <dt>{t('E-posta')}</dt>
        <dd>
          <input
            type="text"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            className="dlg-input"
            aria-label={t('E-posta')}
            value={draft.email}
            aria-invalid={badEmail}
            title={badEmail ? t('Tek bir e-posta adresi yazılır: ad@ornek.com') : undefined}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            onKeyDown={enter}
          />
        </dd>
        <dt>{t('Cinsiyet')}</dt>
        <dd>
          <select
            aria-label={t('Cinsiyet')}
            value={draft.gender}
            onChange={(e) => setDraft({ ...draft, gender: e.target.value as Gender })}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {genderLabel(g)}
              </option>
            ))}
          </select>
        </dd>
      </dl>
      {needSubject && subjectOf() === '' && (
        <p className="hint bad" role="status">
          {t('Önce bir branş seçin.')}
        </p>
      )}
      <div className="form-row">
        <button className="btn primary" disabled={draft.name.trim() === ''} onClick={add}>
          {t('Ekle')}
        </button>
      </div>
    </>
  );
}

export function NewClass({ state, change, added }: Props) {
  const t = useT();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  function add() {
    if (name.trim() === '') return;
    const id = newId();
    change((d) => addClass(d, name, roomId || null, id));
    added(id);
  }

  return (
    <>
      <dl className="sheet-edit">
        <dt>{t('Ad')}</dt>
        <dd>
          <input
            type="text"
            className="dlg-input"
            autoFocus
            placeholder={t('Sınıf adı, örn. 510')}
            aria-label={t('Ad')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
            }}
          />
        </dd>
        <dt>{t('Derslik')}</dt>
        <dd>
          <select
            aria-label={t('Derslik')}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            <option value="">{t('Derslik yok')}</option>
            {state.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </dd>
      </dl>
      <div className="form-row">
        <button className="btn primary" disabled={name.trim() === ''} onClick={add}>
          {t('Ekle')}
        </button>
      </div>
    </>
  );
}
