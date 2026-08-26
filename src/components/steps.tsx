// Kurulum's four lists — ONE definition, three readers.
//
// The list used to be written out three times (setup/index.tsx, Ribbon.tsx and
// setup/Progress.tsx), which was survivable while a step was a label and a
// count. Adding a SYMBOL to each would have made it three drawings of the same
// door, and the next person to change one would have changed one.
//
// It lives here rather than in `toolState.ts` — where `StepId` is defined —
// because an icon is a React element and that file is deliberately plain TS.
// `StepId` stays there; this is the presentation of it.
//
// The icons are inline SVG on `currentColor`, the same contract as App's ICON
// and Ribbon's VIEWS: no icon library (principle 3), and the subset font has
// only 225 glyphs, so a text glyph would fall through to a different face
// (learned in v0.8). Two of them are ALSO the ribbon's view switch — a teacher
// is a mortarboard and a class is a crowd, in Program and in Kurulum alike —
// so those two are exported from here and Ribbon imports them. The drawing has
// one home even though the two places label it differently.

import type { State } from '../types';
import type { StepId } from '../toolState';

export interface StepDef {
  id: StepId;
  label: string;
  count: (d: State) => number;
  icon: React.ReactElement;
}

/** A door with its handle: the room itself, not the class inside it. */
const roomIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M4.4 1.8h11.2v16.4H4.4Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="12.6" cy="10" r="1.15" fill="currentColor" />
  </svg>
);

/** An open book: the one thing here that is neither a person nor a place. */
const lessonIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M10 5.4C8.4 4 6.4 3.4 2.6 3.4v11.6c3.8 0 5.8.6 7.4 2 1.6-1.4 3.6-2 7.4-2V3.4c-3.8 0-5.8.6-7.4 2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M10 5.4v11.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

/**
 * A mortarboard — the symbol aSc uses for Teachers, and the one thing on screen
 * that cannot be mistaken for a person. Ribbon's view switch draws the same
 * one: the teacher axis of the grid and step 2 of Kurulum are the same people.
 */
export const teacherIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <path d="M10 2.4 19.2 6.6 10 10.8 0.8 6.6Z" fill="currentColor" />
    <path d="M5 8.5 10 10.8 15 8.5v3.4c0 1.5-2.2 2.5-5 2.5s-5-1-5-2.5Z" fill="currentColor" />
    <path d="M17.6 7.5h1.2v5.2h-1.2Z" fill="currentColor" />
    <circle cx="18.2" cy="13.6" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * A group of students: three figures, the middle one nearer. A class is the
 * only thing in this tool that is a crowd. The two icons differ in SILHOUETTE,
 * not in detail: at 18px a difference of details is invisible (learned in v0.8).
 */
export const classIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <circle cx="4.2" cy="6.4" r="2.2" fill="currentColor" />
    <circle cx="15.8" cy="6.4" r="2.2" fill="currentColor" />
    <path d="M0.4 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
    <path d="M12 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
    <circle cx="10" cy="8.2" r="3" fill="currentColor" />
    <path d="M4.9 18c0-3.1 2.3-5.2 5.1-5.2s5.1 2.1 5.1 5.2Z" fill="currentColor" />
  </svg>
);

export const STEPS: StepDef[] = [
  { id: 'rooms', label: 'Derslikler', count: (d) => d.rooms.length, icon: roomIcon },
  { id: 'teachers', label: 'Öğretmenler', count: (d) => d.teachers.length, icon: teacherIcon },
  { id: 'classes', label: 'Sınıflar', count: (d) => d.classes.length, icon: classIcon },
  { id: 'lessons', label: 'Dersler', count: (d) => d.lessons.length, icon: lessonIcon },
];
