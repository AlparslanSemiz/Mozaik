// One timetable on paper, as data: a class's week or a teacher's week, with
// its title, its credit line, its header of lesson numbers and bell times, and
// every printed cell already cut at the long break. Nothing here draws.
//
// Moved out of `ui/Print.tsx`'s `map` without a change to what the sheet says
// (TODO §8k, RF9). It exists so a sheet can be produced for one teacher on its
// own, which sending a teacher their timetable needs (B3.8); `Sheet.tsx`
// draws it, and `src/programScreen.test.tsx` pins the drawing.

import { periodGroups } from '../bell';
import { closedKey, placementKey, type Index } from '../constraints';
import { dayLabel, lessonSubject, shortDay, subjectShort, teacherSubjects } from '../entities';
import { activePlacements } from '../program';
import { cellSpan } from './cut';
import type { Vars } from '../../leaf/i18n';
import type { ClassGroup, State, Teacher } from '../../leaf/types';

/** The `t()` the screen hands down, so a language switch rebuilds the sheet. */
type Translate = (key: string, vars?: Vars) => string;

/**
 * What the reader chose to have on each sheet. `PrintOptions`
 * (platform/prefs) is one of these; this layer names only the parts it reads.
 */
export interface SheetOptions {
  /** The bell times under each lesson number. */
  clock: boolean;
  /** The school's name in the credit line. */
  school: boolean;
  /** The class's room, or the teacher's subjects, in the credit line. */
  credits: boolean;
  /** The second line of a cell: the teacher on a class sheet, the room on a teacher's. */
  cellBottom: boolean;
}

export interface SheetCell {
  /** How many hours this cell stands for; never 0, those are not in the list. */
  span: number;
  /** The long break falls after this cell: a thick right edge. */
  breakAfter: boolean;
  /** Palette index to paint it with when the sheet is coloured; null = empty. */
  color: number | null;
  /** Nothing is written in an empty hour. */
  top: string | null;
  /** null = no second line at all (empty hour, or `cellBottom` off). */
  bottom: string | null;
}

export interface SheetDay {
  /** The FULL day name: a printout on a wall is read from a distance. */
  label: string;
  cells: SheetCell[];
}

export interface Sheet {
  id: string;
  /** The page's own colour: the class's or the teacher's. */
  color: number;
  /** Big line: what the sheet is. */
  title: string;
  /** Small line: whose it is. '' = not printed. */
  sub: string;
  days: SheetDay[];
}

export interface SheetHour {
  label: string;
  /**
   * The bell times of this lesson number, one entry per group of days that
   * agree. `days` is null when the whole week agrees: putting "Sal–Pzr" above
   * all twelve columns would say nothing eleven times to explain one.
   */
  clock: Array<{ days: string | null; start: string; end: string }>;
}

/** Empty parts are dropped, so a school with no name prints no stray separator. */
function credits(...parts: string[]): string {
  return parts.filter((p) => p !== '').join(' · ');
}

/**
 * [0,1,2,3] -> "Sal–Cum", [4,5] -> "Cmt–Pzr", [0,3] -> "Sal, Cum".
 *
 * Runs of consecutive days become a range, because that is what they are in
 * the rows below: the reader matches a label to a block of rows by looking
 * down the sheet rather than by reading six names.
 */
function dayRange(days: State['settings']['days'], indices: number[]): string {
  const short = (i: number) => shortDay(days[i]?.name ?? '');
  const parts: string[] = [];
  let run = 0;
  for (let i = 1; i <= indices.length; i++) {
    if (i < indices.length && indices[i] === indices[i - 1]! + 1) continue;
    const from = indices[run]!;
    const to = indices[i - 1]!;
    parts.push(from === to ? short(from) : `${short(from)}–${short(to)}`);
    run = i;
  }
  return parts.join(', ');
}

/**
 * The lesson-number header row, shared by both kinds of page.
 *
 * A column header used to carry ONE time and nothing where the days
 * disagreed — which with the default week meant the 6th column came out
 * blank, and that blank was read as a fault. There is no fault: the 6th
 * lesson starts at 13:30 on a weekday and 13:10 at the weekend, because the
 * long break sits after the 5th lesson on one and the 6th on the other.
 *
 * So the header prints BOTH, each with the days it belongs to. Where the
 * week agrees — eleven of the twelve columns — there is one group and no day
 * names.
 */
export function sheetHead(state: State, options: SheetOptions): SheetHour[] {
  const { bell, hours, days } = state.settings;
  const clock = periodGroups(bell, hours, days);
  return hours.map((label, s) => {
    const groups = clock[s] ?? [];
    return {
      label,
      clock: options.clock
        ? groups.map((g) => ({
            days: groups.length > 1 ? dayRange(days, g.days) : null,
            start: g.period.start,
            end: g.period.end,
          }))
        : [],
    };
  });
}

/** The long break falls at a different lesson on each row: a thick edge. */
const breakAfter = (longBreakAfter: number, s: number): boolean => longBreakAfter === s + 1;

/**
 * A class's week. `spans` is `blockSpans(state)`, computed once for the whole
 * print job rather than per sheet.
 */
export function classSheet(
  state: State,
  ix: Index,
  spans: Map<string, number>,
  group: ClassGroup,
  options: SheetOptions,
  t: Translate,
): Sheet {
  const room = group.roomId == null ? '' : (ix.roomById.get(group.roomId)?.name ?? '');
  return {
    id: group.id,
    color: group.color,
    title: t('{ad} sınıfı · Haftalık ders programı', { ad: group.name }),
    sub: credits(
      options.school ? state.settings.schoolName : '',
      !options.credits || room === '' ? '' : t('{ad} dersliği', { ad: room }),
    ),
    days: state.settings.days.map((day, g) => {
      const cells: SheetCell[] = [];
      state.settings.hours.forEach((_, s) => {
        const lessonId = activePlacements(state)[placementKey(group.id, g, s)];
        // A block is ONE cell on paper too — "çıktıda da blok dersler birlikte
        // gözükmeli programdaki gibi birleşik görünsünler". `cellSpan` returns
        // 0 for the hours a block to the left already covers, and they are
        // simply not drawn.
        const span = cellSpan(spans, state, group.id, g, s, day.longBreakAfter);
        if (span === 0) return;
        const lesson = lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
        const teacher = lesson === undefined ? undefined : ix.teacherById.get(lesson.teacherId);
        // The LESSON's subject, not the teacher's first one: a teacher who holds
        // two is standing in this room for exactly one of them, and the sheet on
        // the wall has to say which.
        const subject =
          lesson === undefined ? '' : subjectShort(state.settings, lessonSubject(state, lesson));
        cells.push({
          span,
          breakAfter: breakAfter(day.longBreakAfter, s + span - 1),
          color: teacher === undefined ? null : teacher.color,
          top: teacher === undefined ? null : subject,
          bottom: teacher === undefined || !options.cellBottom ? null : teacher.short,
        });
      });
      return { label: dayLabel(day.name), cells };
    }),
  };
}

/** A teacher's week, the same shape. */
export function teacherSheet(
  state: State,
  ix: Index,
  spans: Map<string, number>,
  teacher: Teacher,
  options: SheetOptions,
): Sheet {
  return {
    id: teacher.id,
    color: teacher.color,
    title: `${teacher.name} (${teacher.short}) · Haftalık ders programı`,
    // Both subjects on the teacher's own sheet: the credit line says who this
    // person is, and half of that is not who they are. The CELLS on the same
    // page still each name the one subject that lesson is taught under.
    sub: credits(
      options.school ? state.settings.schoolName : '',
      options.credits ? teacherSubjects(teacher).join(' · ') : '',
    ),
    days: state.settings.days.map((day, g) => {
      const cells: SheetCell[] = [];
      state.settings.hours.forEach((_, s) => {
        const lessonId = ix.teacherBusy.get(closedKey(teacher.id, g, s));
        const lesson = lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
        const group = lesson === undefined ? undefined : ix.classById.get(lesson.classId);
        // The boundary belongs to the CLASS's grid, exactly as it does in the
        // screen grid's teacher view: the block was placed into a class's week,
        // and this sheet is only another way of reading it.
        const span = cellSpan(spans, state, group?.id ?? '', g, s, day.longBreakAfter);
        if (span === 0) return;
        cells.push({
          span,
          breakAfter: breakAfter(day.longBreakAfter, s + span - 1),
          // The CLASS's colour, not the teacher's.
          //
          // On the screen grid a cell is painted by the teacher because that is
          // what matches the pool card you dragged (docs/LAYOUT.md). On a
          // teacher's own SHEET every filled cell is that same teacher, so one
          // colour over the whole week says nothing — twelve cells of identical
          // pastel. The class is the thing that varies, and it is the thing the
          // reader is looking for. The class sheet is unchanged: there the
          // teacher is what varies.
          color: group === undefined ? null : group.color,
          top: group === undefined ? null : group.name,
          bottom:
            group === undefined || !options.cellBottom
              ? null
              : group.roomId != null
                ? (ix.roomById.get(group.roomId)?.name ?? '')
                : '',
        });
      });
      return { label: dayLabel(day.name), cells };
    }),
  };
}
