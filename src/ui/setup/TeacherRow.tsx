// One row of the teachers list: every box edits the teacher in place.

import type { ReactNode } from 'react';
import {
  deleteTeacher,
  deletionQuestion,
  genderCell,
  setTeacherLimit,
  subjectKey,
  subjectOption,
  updateTeacher,
  weeklyLoad,
} from '../../pure/entities';
import {
  type Gender,
  type Id,
  type State,
  type Teacher,
  cleanEmail,
  looksLikeEmail,
} from '../../leaf/model';
import { PanelRight } from 'lucide-react';
import { useInspect } from '../program';
import { useDialogs, ColorPick, LimitBox, useT } from '../common';
import { GENDERS } from './genders';

interface Props {
  state: State;
  change: (fn: (d: State) => State) => void;
  teacher: Teacher;
  /** The drag handle cell, from `useRowOrder`. */
  grip: ReactNode;
  /** The subject list the dropdowns offer (`subjectOptions`). */
  subjects: string[];
  /** Rows asked the second-subject question and answered "yes" (see `Teachers`). */
  opening: ReadonlySet<Id>;
  setOpening: (next: ReadonlySet<Id>) => void;
}

export function TeacherRow({ state, change, teacher, grip, subjects, opening, setOpening }: Props) {
  const t = useT();
  const { confirm } = useDialogs();
  const inspect = useInspect();
  return (
    <tr data-row-name={teacher.name}>
      {grip}
      <td>
        <ColorPick
          value={teacher.color}
          owner={teacher.short}
          onChange={(next) => change((d) => updateTeacher(d, teacher.id, { color: next }))}
        />
      </td>
      <td>
        <input
          type="text"
          defaultValue={teacher.name}
          onBlur={(e) =>
            change((d) =>
              updateTeacher(d, teacher.id, {
                name: e.target.value.trim(),
              }),
            )
          }
        />
      </td>
      <td>
        <input
          type="text"
          className="text-sm"
          defaultValue={teacher.short}
          onBlur={(e) =>
            change((d) =>
              updateTeacher(d, teacher.id, {
                short: e.target.value.trim(),
              }),
            )
          }
        />
      </td>
      <td>
        <select
          aria-label={t('{kim} branşı', { kim: teacher.short })}
          value={teacher.subject}
          onChange={(e) =>
            change((d) =>
              updateTeacher(d, teacher.id, {
                subject: e.target.value,
              }),
            )
          }
        >
          {/* subjectOptions already contains this teacher's subject
                          even when the school list does not — otherwise the
                          dropdown would silently change it on first render. */}
          {subjects.map((x) => (
            <option key={x} value={x}>
              {subjectOption(state.settings, x)}
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
        {teacher.subject2 === '' && !opening.has(teacher.id) ? (
          <button
            type="button"
            className="btn subtle"
            // Its own name per row: twenty-five buttons all called
            // "+ İkinci branş" name nothing (pitfall 49).
            aria-label={t('{kim} için ikinci branş ekle', {
              kim: teacher.short,
            })}
            title={t('İkinci branş ekle')}
            onClick={() => setOpening(new Set(opening).add(teacher.id))}
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
            aria-label={t('{kim} ikinci branşı', {
              kim: teacher.short,
            })}
            value={teacher.subject2}
            onChange={(e) =>
              change((d) =>
                updateTeacher(d, teacher.id, {
                  subject2: e.target.value,
                }),
              )
            }
          >
            {/* Blank first, and it is how the column is emptied
                            again: a second subject that could be added but not
                            removed is a one-way door. Choosing it clears the
                            flag on that teacher's lessons too — sanitize(). */}
            <option value="">{t('Yok')}</option>
            {subjects
              .filter((x) => subjectKey(x) !== subjectKey(teacher.subject))
              .map((x) => (
                <option key={x} value={x}>
                  {subjectOption(state.settings, x)}
                </option>
              ))}
          </select>
        )}
      </td>
      <td>
        {/* Named per row like the subject box beside it: twenty-five
                        controls all called "Cinsiyet" name nothing. */}
        <select
          aria-label={`${teacher.short} cinsiyeti`}
          value={teacher.gender}
          onChange={(e) =>
            change((d) =>
              updateTeacher(d, teacher.id, {
                gender: e.target.value as Gender,
              }),
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
      {/* `email-cell`: the box widens over its neighbours while
        it is typed in (styles.css), and the column stays put. */}
      <td className="email-cell">
        {/* Kept as typed (trimmed, control characters dropped:
          cleanEmail); a box that does not hold one address says
          so here, where it is fixed, and Çıktı does not offer to
          send. Keyed by its value, so Ctrl+Z or "Dosyadan aç"
          redraws it rather than leaving a draft that the next
          blur would write back. */}
        <input
          key={`e-${teacher.id}-${teacher.email}`}
          type="text"
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          aria-label={t('{kim} e-postası', { kim: teacher.short })}
          defaultValue={teacher.email}
          aria-invalid={teacher.email !== '' && !looksLikeEmail(teacher.email)}
          title={
            teacher.email !== '' && !looksLikeEmail(teacher.email)
              ? t('Tek bir e-posta adresi yazılır: ad@ornek.com')
              : teacher.email || undefined
          }
          onBlur={(e) => {
            const email = cleanEmail(e.target.value);
            // Tabbing through is not an edit, and not an undo step.
            if (email === teacher.email) return;
            change((d) => updateTeacher(d, teacher.id, { email }));
          }}
        />
      </td>
      <td>
        <LimitBox
          value={teacher.limits.maxConsecutive}
          fallback={state.settings.limits.maxConsecutive}
          title={t('{kim} art arda en fazla kaç saat', {
            kim: teacher.short,
          })}
          onSet={(v) => change((d) => setTeacherLimit(d, teacher.id, 'maxConsecutive', v))}
        />
      </td>
      <td>
        <LimitBox
          value={teacher.limits.maxPerDay}
          fallback={state.settings.limits.maxPerDay}
          title={t('{kim} günde en fazla kaç saat', {
            kim: teacher.short,
          })}
          onSet={(v) => change((d) => setTeacherLimit(d, teacher.id, 'maxPerDay', v))}
        />
      </td>
      <td>
        <LimitBox
          value={teacher.limits.minPerDay}
          fallback={state.settings.limits.minPerDay}
          title={t('{kim} geldiği gün en az kaç saat', {
            kim: teacher.short,
          })}
          onSet={(v) => change((d) => setTeacherLimit(d, teacher.id, 'minPerDay', v))}
        />
      </td>
      <td>{weeklyLoad(state, 'teacher', teacher.id)}</td>
      <td>
        <div className="form-row nowrap">
          {/* Its whole week, its load and what it is tied to, without
                        leaving the list. The information was always there; it
                        was spread over four tabs. */}
          <button
            className="btn icon"
            aria-label={`${teacher.short} bilgileri`}
            title={t('Bilgileri ve haftalık programı')}
            onClick={() => inspect('teacher', teacher.id)}
          >
            <PanelRight size={16} strokeWidth={2} />
          </button>
          <button
            className="btn danger"
            onClick={async () => {
              const q = deletionQuestion(state, 'teacher', teacher.id);
              if (
                !(await confirm({
                  title: q.title,
                  body: q.cost,
                  confirmLabel: 'Sil',
                  danger: true,
                }))
              )
                return;
              change((d) => deleteTeacher(d, teacher.id));
            }}
          >
            {t('Sil')}
          </button>
        </div>
      </td>
    </tr>
  );
}
