// One row of the Dersler list: every box edits the lesson in place.

import type { ReactNode } from 'react';
import { type Lesson, type State, paletteColor } from '../../leaf/model';
import {
  useToast,
  useKeepBefore,
  useUndoIf,
  moveFocusFromDeleted,
  LimitBox,
  BlockPatternPicker as BlockCounts,
  blockCeiling,
  useT,
} from '../common';
import {
  deleteLesson,
  deletionNotice,
  hasTwoSubjects,
  lessonSubject,
  subjectLabel,
  teacherSubjects,
  updateLesson,
} from '../../pure/entities';

interface Props {
  state: State;
  change: (fn: (d: State) => State, label?: string) => void;
  lesson: Lesson;
  /** The name the row is dragged and announced by: "410A · MÇ". */
  rowName: string;
  /** The drag handle cell, from `useRowOrder`. */
  grip: ReactNode;
}

export function LessonRow({ state, change, lesson: x, rowName, grip }: Props) {
  const t = useT();
  const notify = useToast();
  const undoIf = useUndoIf();
  const keepBefore = useKeepBefore();
  const group = state.classes.find((c) => c.id === x.classId);
  const teacher = state.teachers.find((t) => t.id === x.teacherId);
  return (
    <tr data-row-name={rowName}>
      {grip}
      <td>
        <span
          className="color-dot"
          style={{
            background: paletteColor(group?.color ?? 0),
          }}
        />{' '}
        {group?.name ?? '?'}
      </td>
      <td>
        <span
          className="color-dot"
          style={{
            background: paletteColor(teacher?.color ?? 0),
          }}
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
                updateLesson(d, x.id, {
                  second: e.target.value === '1',
                }),
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
          aria-label={`${rowName} · ${t('Haftalık saat')}`}
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
          title={t('Haftaya dağılış değiştirilirse bu dersin programdaki yerleşimleri kalkar')}
          onPick={(blocks) => change((d) => updateLesson(d, x.id, { blocks }))}
        />
      </td>
      <td>
        <LimitBox
          value={x.maxPerDay}
          fallback={group?.maxSameLessonPerDay ?? state.settings.limits.maxSameLessonPerDay}
          title={t('Bu ders bir günde en fazla kaç saat')}
          label={`${rowName} · ${t('Bu ders bir günde en fazla kaç saat')}`}
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
            onClick={(e) => {
              // No question since SD1: the deletion happens, and its notice
              // says what went with it and offers "Geri al".
              const said = deletionNotice(state, 'lesson', x.id);
              const next = deleteLesson(state, x.id);
              moveFocusFromDeleted(e.currentTarget);
              keepBefore(state, said);
              change((d) => (d === state ? next : deleteLesson(d, x.id)), said);
              notify(said, 'info', {
                label: t('Geri al'),
                run: () => undoIf(next),
                expected: next,
              });
            }}
          >
            {t('Sil')}
          </button>
        </div>
      </td>
    </tr>
  );
}
