// Which entity paints cards on the Program screen.
//
// This is a MACHINE preference, never timetable data: opening a backup on a
// different computer must not change how that computer likes to read cards.

import { lessonSubject, subjectKey } from "./entities";
import { PALETTE_SIZE } from "./palette";
import type { Lesson, State } from "./types";

export type ProgramColorMode = "teacher" | "class" | "room" | "subject";

export const PROGRAM_COLOR_KEY = "ders-programi-program-rengi";

export function normalizeProgramColor(raw: unknown): ProgramColorMode {
  return raw === "class" || raw === "room" || raw === "subject"
    ? raw
    : "teacher";
}

export function readProgramColor(): ProgramColorMode {
  try {
    return normalizeProgramColor(localStorage.getItem(PROGRAM_COLOR_KEY));
  } catch {
    return "teacher";
  }
}

export function writeProgramColor(mode: ProgramColorMode): void {
  try {
    localStorage.setItem(PROGRAM_COLOR_KEY, normalizeProgramColor(mode));
  } catch {
    // A visual preference that cannot be remembered must not stop scheduling.
  }
}

/** Stable fallback for an imported free-text subject absent from Settings. */
function textColor(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % PALETTE_SIZE;
}

/** One colour answer shared by grid cards, pool cards and the drag ghost. */
export function programColorIndex(
  state: State,
  lesson: Lesson,
  mode: ProgramColorMode,
): number {
  const teacher = state.teachers.find((x) => x.id === lesson.teacherId);
  const group = state.classes.find((x) => x.id === lesson.classId);

  if (mode === "class") return group?.color ?? 0;
  if (mode === "room") {
    if (group?.roomId == null) return state.rooms.length % PALETTE_SIZE;
    const index = state.rooms.findIndex((x) => x.id === group.roomId);
    return index < 0 ? 0 : index % PALETTE_SIZE;
  }
  if (mode === "subject") {
    const subject = lessonSubject(state, lesson);
    const key = subjectKey(subject);
    const index = state.settings.subjects.findIndex((x) => subjectKey(x) === key);
    return index < 0 ? textColor(key) : index % PALETTE_SIZE;
  }
  return teacher?.color ?? 0;
}
