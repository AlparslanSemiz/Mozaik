// The dated layer over the base week (schema v18): a teacher or a class away
// on given dates (a class away is a trip or an exam week), and who covers
// which hour of an absent teacher ("ikame"). The base week is never changed by anything here, and the solver
// never reads it: a change for one date stops mattering once the date is past.
//
// A date is a local calendar day, 'YYYY-MM-DD', and compares as a string. Which
// column of the week it falls on is read off the stored day NAME, which stays
// Turkish in the file (`leaf/lang/names.ts`): a day the reader renamed matches
// no weekday, and that date simply has no lessons here.

import { aralikYazisi, dayStamp, gunYazisi } from '../../leaf/app';
import { WEEK, dayLabel } from '../../leaf/lang';
import {
  type Dated,
  type Id,
  type Lesson,
  type State,
  closedKey,
  lessonSubject,
} from '../../leaf/model';
import { activePlacements } from '../grid';

const lessonsBy = new WeakMap<State, Map<Id, Lesson>>();
/** The plan's lessons by id, built once per plan: the week walks every cell seven times. */
function lessonOf(d: State, id: Id | undefined): Lesson | undefined {
  let map = lessonsBy.get(d);
  if (map === undefined) lessonsBy.set(d, (map = new Map(d.lessons.map((l) => [l.id, l]))));
  return map.get(id ?? '');
}

const put = (d: State, patch: Partial<Dated>): State => ({ ...d, dated: { ...d.dated, ...patch } });

const parts = (iso: string) => iso.split('-').map(Number) as [number, number, number];

/** The date `n` days on, in calendar days (a clock change cannot move it). */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = parts(iso);
  return dayStamp(new Date(y, m - 1, d + n));
}

/** 0 = Monday ... 6 = Sunday, the order of `WEEK`. */
function weekday(iso: string): number {
  const [y, m, d] = parts(iso);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** "Salı 12 Kasım", the weekday read off the date itself. */
export function dayName(iso: string): string {
  return gunYazisi(iso, dayLabel(WEEK[weekday(iso)]!));
}

/** Monday and Sunday of the date's week. */
export function weekOf(iso: string): [string, string] {
  const from = addDays(iso, -weekday(iso));
  return [from, addDays(from, 6)];
}

/** The column of the week the date is taught as, or -1: no lessons that day. */
export function dayOf(d: State, iso: string): number {
  return d.settings.days.findIndex((x) => x.name === WEEK[weekday(iso)]);
}

export const isAway = (d: State, id: Id, iso: string): boolean =>
  d.dated.absent.some((a) => a.id === id && a.from <= iso && iso <= a.to);

/** `id` away on `iso` alone, unless it already is. */
export function addAway(d: State, id: Id, iso: string): State {
  if (isAway(d, id, iso)) return d;
  return put(d, { absent: [...d.dated.absent, { id, from: iso, to: iso }] });
}

/**
 * The covers of `id`'s hours from `from` to `to` dropped: the absence they
 * answered is gone from those dates, and a left-over cover would still count
 * as the substitute's (review, 2026-11-16).
 */
function dropCovers(d: State, id: Id, from: string, to: string): State {
  const placed = activePlacements(d);
  const covers = d.dated.covers.filter((c) => {
    if (c.date < from || c.date > to) return true;
    const lessonId = placed[`${c.classId}|${dayOf(d, c.date)}|${c.hour}`];
    const teacherId = lessonOf(d, lessonId)?.teacherId;
    return c.classId !== id && teacherId !== id;
  });
  return put(d, { covers });
}

/** `id`'s one-day absence on `from` moved to `to`: "Gelmiyor…" and then the date. */
export function moveAway(d: State, id: Id, from: string, to: string): State {
  const absent = d.dated.absent.filter((a) => !(a.id === id && a.from === from && a.to === from));
  return addAway(dropCovers(put(d, { absent }), id, from, from), id, to);
}

/** Absence `i` ends on `to`, or (`null`) is taken back; the dates it loses lose their covers. */
export function setAwayEnd(d: State, i: number, to: string | null): State {
  const a = d.dated.absent[i];
  if (a === undefined) return d;
  const end = to === null ? null : to < a.from ? a.from : to;
  const absent = d.dated.absent.flatMap((x, j) =>
    j !== i ? [x] : end === null ? [] : [{ ...x, to: end }],
  );
  const next = put(d, { absent });
  return end === null
    ? dropCovers(next, a.id, a.from, a.to)
    : end < a.to
      ? dropCovers(next, a.id, addDays(end, 1), a.to)
      : next;
}

/**
 * Who takes `classId` at `hour` on `iso`: a teacher, `null` (nobody: "boş
 * geçsin", or with `to` the lesson moved to that hour of the same day), or
 * `undefined` (no change).
 */
export function setCover(
  d: State,
  iso: string,
  classId: Id,
  hour: number,
  teacherId: Id | null | undefined,
  to?: number,
): State {
  const covers = d.dated.covers.filter(
    (c) => !(c.date === iso && c.classId === classId && c.hour === hour),
  );
  if (teacherId !== undefined) covers.push({ date: iso, classId, hour, teacherId, to });
  return put(d, { covers });
}

/** How many changes touch the date's week: absences, and hours changed on their own. */
export function weekChanges(d: State, iso: string): number {
  const [from, to] = weekOf(iso);
  let n = d.dated.absent.filter((a) => a.from <= to && a.to >= from).length;
  for (let i = 0; i < 7; i++) {
    const date = addDays(from, i);
    n += coverRows(d, date).filter(
      (r) => r.cover !== undefined && !isAway(d, r.teacherId, date),
    ).length;
  }
  return n;
}

/** "18–22 Kasım": the date's week, from its first to its last school day. */
export function weekLabel(d: State, iso: string): string {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf(iso)[0], i));
  const taught = days.filter((x) => d.settings.days.some((y) => y.name === WEEK[weekday(x)]));
  return aralikYazisi(taught[0] ?? '', taught[taught.length - 1] ?? '');
}

/**
 * The date's week back to the base week. An absence reaching outside the week
 * keeps the days outside it.
 */
export function clearWeek(d: State, iso: string): State {
  const [from, to] = weekOf(iso);
  const { absent, covers } = d.dated;
  return put(d, {
    absent: absent.flatMap((a) =>
      a.to < from || a.from > to
        ? [a]
        : [
            ...(a.from < from ? [{ ...a, to: addDays(from, -1) }] : []),
            ...(a.to > to ? [{ ...a, from: addDays(to, 1) }] : []),
          ],
    ),
    covers: covers.filter((c) => c.date < from || c.date > to),
  });
}

/** A teacher's covers: all of them, and those in the date's week. */
export function coverCount(d: State, teacherId: Id, iso: string): [number, number] {
  const [from, to] = weekOf(iso);
  const mine = d.dated.covers.filter((c) => c.teacherId === teacherId);
  return [mine.length, mine.filter((c) => c.date >= from && c.date <= to).length];
}

export interface Candidate {
  id: Id;
  /** The lesson's subject when the teacher has it (first or second), else their first. */
  subject: string;
  /** Covers already this week. */
  week: number;
}

/** One hour of the date that changes: its teacher is away, or it was changed on its own. */
export interface CoverRow {
  hour: number;
  classId: Id;
  lessonId: Id;
  /** The lesson's own teacher. */
  teacherId: Id;
  /** Chosen: a teacher, `null` for "boş geçsin", `undefined` for not yet. */
  cover: Id | null | undefined;
  /** Free at that hour, best first. */
  options: Candidate[];
  /** Moved that date to this hour. */
  to: number | undefined;
  /** The hours of the same day it could move to: its class and teacher free. */
  hours: number[];
}

/** What the date teaches: the base week's cells on its day, the classes away left out. */
export function taughtOn(d: State, iso: string) {
  const day = dayOf(d, iso);
  const taught: Array<{ hour: number; classId: Id; lessonId: Id; teacherId: Id }> = [];
  for (const [key, lessonId] of Object.entries(activePlacements(d))) {
    const [classId, k, h] = key.split('|');
    const lesson = lessonOf(d, lessonId);
    if (Number(k) !== day || lesson === undefined || isAway(d, classId!, iso)) continue;
    taught.push({ hour: Number(h), classId: classId!, lessonId, teacherId: lesson.teacherId });
  }
  return taught;
}

/**
 * The date's hours that change: its teacher is away, or a change was made to
 * it on its own. Each comes with the teachers free then (not teaching, not
 * covering another hour, not closed, not away; a class away frees its
 * teacher), best first: the same subject, then the fewest covers this week,
 * then those at school that day anyway; and with the hours of the same day the
 * lesson could move to.
 */
export function coverRows(d: State, iso: string): CoverRow[] {
  const day = dayOf(d, iso);
  if (day < 0) return [];
  const covers = d.dated.covers.filter((c) => c.date === iso);
  const taught = taughtOn(d, iso);
  const ownOf = (x: { classId: Id; hour: number }) =>
    covers.find((c) => c.classId === x.classId && c.hour === x.hour);
  const atSchool = new Set([
    ...taught.map((x) => x.teacherId),
    ...covers.flatMap((c) => c.teacherId ?? []),
  ]);
  const order = new Map(d.classes.map((c, i) => [c.id, i]));
  /** Who and which class are taken at `hour` that date, the asking cell `me` left out. */
  const busy = (hour: number, me: (typeof taught)[number]) => {
    const out = new Set<Id>();
    for (const y of taught) {
      const own = ownOf(y);
      if (y === me || (own?.teacherId === null && own.to === undefined)) continue;
      if ((own?.to ?? y.hour) !== hour) continue;
      out.add(y.classId);
      out.add(own?.teacherId ?? y.teacherId);
    }
    return out;
  };

  return taught
    .filter((x) => isAway(d, x.teacherId, iso) || ownOf(x) !== undefined)
    .sort((a, b) => a.hour - b.hour || order.get(a.classId)! - order.get(b.classId)!)
    .map((x) => {
      const own = ownOf(x);
      const taken = busy(x.hour, x);
      const free = (id: Id, hour: number) =>
        !isAway(d, id, iso) && d.unavailable[closedKey(id, day, hour)] === undefined;
      const subject = lessonSubject(d, lessonOf(d, x.lessonId)!);
      const options = d.teachers
        .filter((t) => t.id !== x.teacherId && !taken.has(t.id) && free(t.id, x.hour))
        .map((t) => {
          const same = subject !== '' && (t.subject === subject || t.subject2 === subject);
          return {
            id: t.id,
            subject: same ? subject : t.subject,
            // This hour's own choice is not "already this week".
            week: coverCount(d, t.id, iso)[1] - (own?.teacherId === t.id ? 1 : 0),
            // Sort keys, smallest first: other subject, then away from school.
            rank: (same ? 0 : 2) + (atSchool.has(t.id) ? 0 : 1),
          };
        })
        .sort((a, b) => (a.rank >> 1) - (b.rank >> 1) || a.week - b.week || a.rank - b.rank)
        .map(({ id, subject, week }) => ({ id, subject, week }));
      // A choice made before the week changed under it stays visible.
      const kept = d.teachers.find((t) => t.id === own?.teacherId);
      if (kept !== undefined && !options.some((o) => o.id === kept.id))
        options.push({ id: kept.id, subject: kept.subject, week: 0 });
      const hours = d.settings.hours.flatMap((_, h) => {
        const b = busy(h, x);
        return h !== x.hour && !b.has(x.classId) && !b.has(x.teacherId) && free(x.teacherId, h)
          ? [h]
          : [];
      });
      // A move chosen before the day filled up under it stays visible too.
      if (own?.to !== undefined && !hours.includes(own.to)) hours.push(own.to);
      return { ...x, cover: own?.teacherId, options, to: own?.to, hours };
    });
}

/**
 * The date's week as it is taught: a copy of the plan with that week's changes
 * laid over the base grid, to be drawn and never edited. A covered hour is the
 * lesson under its substitute; `moved` holds the cells that changed and
 * `opened` the hours nobody teaches, keyed the way the suggestion preview
 * keys them, so the grid marks them with its own two patterns.
 */
export function weekView(d: State, iso: string) {
  const base = activePlacements(d);
  const placements = { ...base };
  const lessons = [...d.lessons];
  const opened = new Set<string>();
  const moved = new Set<string>();
  /** A teacher's hour a moved lesson fills: not "nobody", even if another class's hour there is. */
  const filled: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekOf(iso)[0], i);
    const day = dayOf(d, date);
    if (day < 0) continue;
    for (const [key, lessonId] of Object.entries(base)) {
      const [classId, k, h] = key.split('|');
      if (Number(k) === day && isAway(d, classId!, date))
        opened.add(closedKey(lessonOf(d, lessonId)?.teacherId ?? '', day, Number(h)));
    }
    for (const r of coverRows(d, date)) {
      const key = `${r.classId}|${day}|${r.hour}`;
      if (r.to !== undefined) {
        const to = `${r.classId}|${day}|${r.to}`;
        if (placements[key] === r.lessonId) delete placements[key];
        placements[to] = r.lessonId;
        moved.add(to);
        filled.push(closedKey(r.teacherId, day, r.to));
      } else if (r.cover != null) {
        lessons.push({ ...lessonOf(d, r.lessonId)!, id: key, teacherId: r.cover, second: false });
        placements[key] = key;
        moved.add(key);
      } else opened.add(closedKey(r.teacherId, day, r.hour));
    }
  }
  for (const key of filled) opened.delete(key);
  return {
    state: {
      ...d,
      lessons,
      programs: d.programs.map((p) => (p.id === d.activeProgramId ? { ...p, placements } : p)),
    },
    diff: { opened, moved, movedBlocks: 0 },
  };
}
