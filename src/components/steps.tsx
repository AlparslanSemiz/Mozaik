// Kurulum's three lists — ONE definition, three readers.
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
// The icons are inline SVG on `currentColor`. Not because an icon library is
// banned — that stopped being true when lucide-react was measured at 3.4 KB and
// taken — but because these four are drawn to be told apart at 18px by
// SILHOUETTE, which is what the eyesight this tool is built for needs, and
// because a text glyph would fall through to another face (the subset font has
// 225 glyphs, learned in v0.8).
//
// All four are exported: the ribbon's view switch, the availability picker and
// the entity sheet all name the same three kinds, and `KIND_ICON` below is the
// single map they read. The drawing has one home even where the labels differ.

import type { State } from '../types';
import type { Kind, StepId } from '../toolState';

export interface StepDef {
  id: StepId;
  label: string;
  count: (d: State) => number;
  icon: React.ReactElement;
}

/** A door with its handle: the room itself, not the class inside it. */
export const roomIcon = (
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

/**
 * An open book: the one thing here that is neither a person nor a place.
 *
 * Drawn at 22px on a 0..24 box rather than the 18px of the three beside it,
 * because its reader changed: Dersler stopped being step four of Kurulum and
 * became a destination in the top bar, where the tab icons are 22. It is still
 * ONE drawing — a second open book kept at another size is the thing
 * `steps.tsx` exists to prevent.
 */
export const lessonIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <path
      d="M12 6.5C10.1 4.8 7.7 4.1 3.1 4.1v13.9c4.6 0 7 .7 8.9 2.4 1.9-1.7 4.3-2.4 8.9-2.4V4.1c-4.6 0-7 .7-8.9 2.4Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 6.5v13.9" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

/**
 * A mortarboard — the symbol aSc uses for Teachers, and the one thing on screen
 * that cannot be mistaken for a person. Ribbon's view switch draws the same
 * one: the teacher axis of the grid and Kurulum's teacher list are the same
 * people.
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

/**
 * The three THINGS this tool schedules, drawn once.
 *
 * There were four separate answers to "what does a teacher look like" before
 * this: these hand-drawn shapes, lucide's GraduationCap/Users/School in the
 * entity sheet, lucide's DoorOpen in the command palette, and nothing at all
 * in the availability list. A symbol that means something different in each
 * room is not a symbol, it is decoration — so every screen that names one of
 * the three kinds reads it from here.
 */
export const KIND_ICON: Record<Kind, React.ReactElement> = {
  teacher: teacherIcon,
  class: classIcon,
  room: roomIcon,
};

/**
 * THREE, since Dersler moved out. "Ders ekleme tarafı çok daha pratik hale
 * getirilmeli, neden? Çünkü hocaları onu bunu ayarlıyorsun ama DERS EN ÖNEMLİ
 * KISIM." Step four of a wizard is not where the most-used screen belongs, and
 * as a step it could only ever be reached by way of Kurulum.
 */
export const STEPS: StepDef[] = [
  { id: 'rooms', label: 'Derslikler', count: (d) => d.rooms.length, icon: roomIcon },
  { id: 'teachers', label: 'Öğretmenler', count: (d) => d.teachers.length, icon: teacherIcon },
  { id: 'classes', label: 'Sınıflar', count: (d) => d.classes.length, icon: classIcon },
];
