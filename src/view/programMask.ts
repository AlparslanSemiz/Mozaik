import type { Id, State } from '../types';
import type { View } from './toolState';

export type MaskMode = 'ghost' | 'hidden';

export interface ProgramMask {
  teachers: Record<Id, MaskMode>;
  classes: Record<Id, MaskMode>;
  /** Day NAME, not index: a reordered week keeps the intended day masked. */
  days: Record<string, MaskMode>;
}

export interface SolverExclusions {
  teacherIds: readonly Id[];
  classIds: readonly Id[];
  dayNames: readonly string[];
}

export const EMPTY_PROGRAM_MASK: ProgramMask = { teachers: {}, classes: {}, days: {} };

export function rowMask(mask: ProgramMask, view: View, id: Id): MaskMode | undefined {
  return view === 'teacher' ? mask.teachers[id] : mask.classes[id];
}

export function setRowMask(
  mask: ProgramMask,
  view: View,
  id: Id,
  mode?: MaskMode,
): ProgramMask {
  const key = view === 'teacher' ? 'teachers' : 'classes';
  const next = { ...mask[key] };
  if (mode === undefined) delete next[id];
  else next[id] = mode;
  return { ...mask, [key]: next };
}

export function setDayMask(mask: ProgramMask, name: string, mode?: MaskMode): ProgramMask {
  const days = { ...mask.days };
  if (mode === undefined) delete days[name];
  else days[name] = mode;
  return { ...mask, days };
}

export function cleanMask(mask: ProgramMask, state: State): ProgramMask {
  const teachers = Object.fromEntries(
    Object.entries(mask.teachers).filter(([id]) => state.teachers.some((item) => item.id === id)),
  );
  const classes = Object.fromEntries(
    Object.entries(mask.classes).filter(([id]) => state.classes.some((item) => item.id === id)),
  );
  const days = Object.fromEntries(
    Object.entries(mask.days).filter(([name]) => state.settings.days.some((day) => day.name === name)),
  );
  return { teachers, classes, days } as ProgramMask;
}

export function maskCount(mask: ProgramMask): number {
  return Object.keys(mask.teachers).length + Object.keys(mask.classes).length + Object.keys(mask.days).length;
}

export function solverExclusions(mask: ProgramMask): SolverExclusions {
  return {
    teacherIds: Object.keys(mask.teachers),
    classIds: Object.keys(mask.classes),
    dayNames: Object.keys(mask.days),
  };
}

export function lessonExcluded(
  lesson: { teacherId: Id; classId: Id },
  exclusions: SolverExclusions,
): boolean {
  return exclusions.teacherIds.includes(lesson.teacherId) || exclusions.classIds.includes(lesson.classId);
}
