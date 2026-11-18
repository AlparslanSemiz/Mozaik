// A teacher's question-solving hours (schema v20): putting one down, taking it
// back, and whether it may go there. Not a lesson: the solver never places one,
// the father does, in a teacher's row, once the timetable is settled. It takes
// the teacher's hour and nobody else's: no class is busy then, and nothing that
// counts lessons (limits, gaps, load) sees it. The other half of the rule, that
// a LESSON cannot be dropped on one, is `blockerDetail`'s (`teacherStudy`).

import { t } from '../../leaf/i18n';
import { dayLabel } from '../../leaf/lang';
import { type Id, type State, closedKey } from '../../leaf/model';
import { activeStudy, replaceActiveGrid } from '../grid';
import { buildIndex } from './occupancy';

/**
 * null when the hour can be a question-solving hour, otherwise the sentence
 * that says why not (B4: the teacher is in a lesson then). A closed hour is
 * refused too: the teacher cannot come.
 */
export function studyBlocker(d: State, teacherId: Id, day: number, hour: number): string | null {
  const teacher = d.teachers.find((x) => x.id === teacherId);
  if (
    teacher === undefined ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    day < 0 ||
    day >= d.settings.days.length ||
    hour < 0 ||
    hour >= d.settings.hours.length
  ) {
    return t('Geçersiz hücre');
  }
  const at = closedKey(teacherId, day, hour);
  const ix = buildIndex(d);
  const lessonId = ix.teacherBusy.get(at);
  if (lessonId !== undefined) {
    const lesson = ix.lessonById.get(lessonId);
    return t('{kim} {gun} {saat}. saatte {sinif} sınıfında', {
      kim: teacher.name,
      gun: dayLabel(d.settings.days[day]!.name),
      saat: d.settings.hours[hour]!,
      sinif: (lesson && ix.classById.get(lesson.classId)?.name) ?? t('başka'),
    });
  }
  if (d.unavailable[at] !== undefined) {
    return t('{kim}, {gun} {saat}. saatte kapalı', {
      kim: teacher.name,
      gun: dayLabel(d.settings.days[day]!.name),
      saat: d.settings.hours[hour]!,
    });
  }
  return null;
}

/** The same state, or `d` itself when the hour cannot be one (`studyBlocker`) or already is. */
export function addStudy(d: State, teacherId: Id, day: number, hour: number): State {
  const at = closedKey(teacherId, day, hour);
  if (activeStudy(d)[at] !== undefined || studyBlocker(d, teacherId, day, hour) !== null) return d;
  return replaceActiveGrid(d, { study: { ...activeStudy(d), [at]: 1 } });
}

export function removeStudy(d: State, teacherId: Id, day: number, hour: number): State {
  const at = closedKey(teacherId, day, hour);
  const study = activeStudy(d);
  if (study[at] === undefined) return d;
  const { [at]: _gone, ...rest } = study;
  return replaceActiveGrid(d, { study: rest });
}
