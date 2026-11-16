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
import { type Dated, type Id, type State, closedKey, lessonSubject } from '../../leaf/model';
import { activePlacements } from '../grid';

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
    const teacherId = d.lessons.find((l) => l.id === lessonId)?.teacherId;
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

/** Who takes `classId` at `hour` on `iso`: a teacher, `null` (nobody), or `undefined` (not chosen). */
export function setCover(
  d: State,
  iso: string,
  classId: Id,
  hour: number,
  teacherId: Id | null | undefined,
): State {
  const covers = d.dated.covers.filter(
    (c) => !(c.date === iso && c.classId === classId && c.hour === hour),
  );
  if (teacherId !== undefined) covers.push({ date: iso, classId, hour, teacherId });
  return put(d, { covers });
}

/** How many changes touch the date's week: the absences in it. */
export function weekChanges(d: State, iso: string): number {
  const [from, to] = weekOf(iso);
  return d.dated.absent.filter((a) => a.from <= to && a.to >= from).length;
}

/** "18–22 Kasım": the date's week, from its first to its last school day. */
export function weekLabel(d: State, iso: string): string {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf(iso)[0], i));
  const taught = days.filter((x) => d.settings.days.some((y) => y.name === WEEK[weekday(x)]));
  const shown = taught.length > 0 ? taught : days;
  return aralikYazisi(shown[0]!, shown[shown.length - 1]!);
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

/** One hour that needs somebody on the date, because its teacher is away. */
export interface CoverRow {
  hour: number;
  classId: Id;
  lessonId: Id;
  /** The absent teacher. */
  teacherId: Id;
  /** Chosen: a teacher, `null` for "boş geçsin", `undefined` for not yet. */
  cover: Id | null | undefined;
  /** Free at that hour, best first. */
  options: Candidate[];
}

/**
 * The date's hours whose teacher is away, each with the teachers free then:
 * not teaching (a class away frees its teacher), not covering another hour,
 * not closed in their own hours. Best first: the same subject, then the fewest
 * covers this week, then those at school that day anyway.
 */
export function coverRows(d: State, iso: string): CoverRow[] {
  const day = dayOf(d, iso);
  if (day < 0) return [];
  const lessons = new Map(d.lessons.map((l) => [l.id, l]));
  const covers = d.dated.covers.filter((c) => c.date === iso);

  // Who teaches what at each hour that day, the classes away left out.
  const taught: Array<{ hour: number; classId: Id; lessonId: Id; teacherId: Id }> = [];
  for (const [key, lessonId] of Object.entries(activePlacements(d))) {
    const [classId, k, h] = key.split('|');
    const lesson = lessons.get(lessonId);
    if (Number(k) !== day || lesson === undefined || isAway(d, classId!, iso)) continue;
    taught.push({ hour: Number(h), classId: classId!, lessonId, teacherId: lesson.teacherId });
  }
  const atSchool = new Set([
    ...taught.map((x) => x.teacherId),
    ...covers.flatMap((c) => c.teacherId ?? []),
  ]);
  const order = new Map(d.classes.map((c, i) => [c.id, i]));

  return taught
    .filter((x) => isAway(d, x.teacherId, iso))
    .sort((a, b) => a.hour - b.hour || order.get(a.classId)! - order.get(b.classId)!)
    .map((x) => {
      const own = covers.find((c) => c.classId === x.classId && c.hour === x.hour);
      const busy = new Set([
        ...taught.filter((y) => y.hour === x.hour).map((y) => y.teacherId),
        ...covers.flatMap((c) => (c.hour === x.hour && c !== own ? (c.teacherId ?? []) : [])),
      ]);
      const subject = lessonSubject(d, lessons.get(x.lessonId)!);
      const options = d.teachers
        .filter(
          (t) =>
            !busy.has(t.id) &&
            !isAway(d, t.id, iso) &&
            d.unavailable[closedKey(t.id, day, x.hour)] === undefined,
        )
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
      return { ...x, cover: own?.teacherId, options };
    });
}
