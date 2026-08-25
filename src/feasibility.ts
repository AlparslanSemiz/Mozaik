// Feasibility check (v0.5). PURE functions.
//
// The thing aSc does not do and that hurts most at the school: saying WHY a
// timetable cannot be built. It comes before a solver because it is far
// cheaper and far more useful.

import { blockerDetail, buildIndex } from './constraints';
import type { BlockCode, Index } from './constraints';
import { findViolations } from './rules';
import type { Violation } from './rules';
import type { State, Id } from './types';

/** Above this ratio of load the "this will be hard" warning is raised. */
const TIGHT_RATIO = 0.85;

export type Level = 'ok' | 'tight' | 'impossible';

export interface ReportRow {
  id: Id;
  name: string;
  capacity: number; // usable hours
  load: number; // loaded lesson hours
  level: Level;
  message: string;
}

export interface Unplaceable {
  lessonId: Id;
  name: string;
  missing: number;
  message: string;
}

/**
 * The cheap half of the report: capacity against load, O(lessons).
 *
 * Split out from `buildReport` because the setup screens show it beside the
 * list you are typing into, and `buildReport`'s other half costs 99 x 72
 * `blocker()` calls — a price no keystroke can pay (pitfall 3).
 */
export interface Capacity {
  teachers: ReportRow[];
  classes: ReportRow[];
  rooms: ReportRow[];
}

export interface Report extends Capacity {
  unplaceable: Unplaceable[];
  /** Limit rules broken by the timetable as it stands (rules.ts). */
  violations: Violation[];
  hasProblem: boolean;
}

/** "412 — AV Fizik": how a lesson is named wherever the user is told about it. */
export function lessonName(ix: Index, lessonId: Id): string {
  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  return `${group?.name ?? '?'} — ${teacher?.short ?? '?'} ${teacher?.subject ?? ''}`.trim();
}

/**
 * Why a lesson does not fit, in `blocker()`'s own words.
 *
 * The most FREQUENT reason is the explanatory one: a teacher who is away all
 * week says more than whichever cell happens to be checked first. Reasons are
 * grouped by CODE, not by sentence — every message names a day and an hour, so
 * counting sentences would score sixty different "the class is busy at ..."
 * lines as sixty separate reasons and let a rarer one win.
 *
 * Shared by the Kontrol report and by the solver's "I got stuck here" line, so
 * the two can never tell the same story differently.
 */
export interface BlockSummary {
  /** The commonest blocking reason. */
  reason: string;
  /** Is there at least one cell it COULD go in, ignoring everything else. */
  anyValid: boolean;
}

export function commonestBlock(
  d: State,
  ix: Index,
  lessonId: Id,
  /** Stop at the first free cell: the caller only wants to know IF it fits. */
  stopAtFirstValid = false,
): BlockSummary {
  const counts = new Map<BlockCode, { count: number; message: string }>();
  let anyValid = false;

  outer: for (let g = 0; g < d.settings.days.length; g++) {
    for (let s = 0; s < d.settings.hours.length; s++) {
      const found = blockerDetail(d, ix, lessonId, g, s);
      if (found === null) {
        anyValid = true;
        if (stopAtFirstValid) break outer;
      } else {
        const seen = counts.get(found.code);
        if (seen === undefined) counts.set(found.code, { count: 1, message: found.message });
        else seen.count++;
      }
    }
  }

  let reason = 'Boş yer kalmamış';
  let top = 0;
  for (const entry of counts.values()) {
    if (entry.count > top) {
      top = entry.count;
      reason = entry.message;
    }
  }
  return { reason, anyValid };
}

function levelOf(capacity: number, load: number): Level {
  if (load > capacity) return 'impossible';
  if (capacity > 0 && load > capacity * TIGHT_RATIO) return 'tight';
  return 'ok';
}

export function buildCapacity(d: State): Capacity {
  const totalSlots = d.settings.days.length * d.settings.hours.length;

  // Closed hours per entity — one pass over the map. It holds teachers,
  // classes and rooms alike, and each id only ever means one of them.
  const closedCount = new Map<Id, number>();
  for (const key in d.unavailable) {
    const entityId = key.slice(0, key.indexOf('|'));
    closedCount.set(entityId, (closedCount.get(entityId) ?? 0) + 1);
  }

  const teachers: ReportRow[] = d.teachers.map((t) => {
    const capacity = totalSlots - (closedCount.get(t.id) ?? 0);
    const load = d.lessons
      .filter((x) => x.teacherId === t.id)
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = levelOf(capacity, load);
    const message =
      level === 'impossible'
        ? `${t.short} ${capacity} saat müsait, ${load} saat ders yüklenmiş. ${load - capacity} saat fazla.`
        : level === 'tight'
          ? `${t.short} ${capacity} saat müsait, ${load} saat ders yüklenmiş. Zor olacak.`
          : `${t.short} ${capacity} saat müsait, ${load} saat ders yüklenmiş.`;
    return { id: t.id, name: `${t.short} — ${t.name}`, capacity, load, level, message };
  });

  const classes: ReportRow[] = d.classes.map((c) => {
    const capacity = totalSlots - (closedCount.get(c.id) ?? 0);
    const load = d.lessons
      .filter((x) => x.classId === c.id)
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = levelOf(capacity, load);
    const message =
      level === 'impossible'
        ? `${c.name} sınıfına ${load} saat ders yüklenmiş ama haftada ${capacity} saati açık. ${load - capacity} saat fazla.`
        : `${c.name} sınıfı: açık olan ${capacity} saatin ${load} saati dolu.`;
    return { id: c.id, name: c.name, capacity, load, level, message };
  });

  // The TOTAL load of the classes sharing a room cannot exceed that room's
  // capacity. This is the most overlooked bottleneck: 4 classes in one room.
  const rooms: ReportRow[] = d.rooms.map((r) => {
    const capacity = totalSlots - (closedCount.get(r.id) ?? 0);
    const sharing = d.classes.filter((c) => c.roomId === r.id);
    const classIds = new Set(sharing.map((c) => c.id));
    const load = d.lessons
      .filter((x) => classIds.has(x.classId))
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = levelOf(capacity, load);
    const names = sharing.map((c) => c.name).join(', ');
    const message =
      level === 'impossible'
        ? `${r.name} dersliğini ${sharing.length} sınıf paylaşıyor (${names}) ve toplam ${load} saat ders var. Haftada ${capacity} saati açık, ${load - capacity} saat fazla.`
        : `${r.name} dersliği (${names || 'sınıf yok'}): açık olan ${capacity} saatin ${load} saati dolu.`;
    return { id: r.id, name: r.name, capacity, load, level, message };
  });

  return { teachers, classes, rooms };
}

export function buildReport(d: State): Report {
  const ix = buildIndex(d);
  const { teachers, classes, rooms } = buildCapacity(d);

  // Lessons that are still incomplete and have no valid slot left at all.
  const unplaceable: Unplaceable[] = [];
  for (const lesson of d.lessons) {
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const missing = lesson.weeklyHours - placed;
    if (missing <= 0) continue;

    const summary = commonestBlock(d, ix, lesson.id, true);
    if (summary.anyValid) continue;

    unplaceable.push({
      lessonId: lesson.id,
      name: lessonName(ix, lesson.id),
      missing,
      message: `${missing} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: ${summary.reason}`,
    });
  }

  const violations = findViolations(d, ix);

  const hasProblem =
    unplaceable.length > 0 ||
    violations.length > 0 ||
    [...teachers, ...classes, ...rooms].some((x) => x.level !== 'ok');

  return { teachers, classes, rooms, unplaceable, violations, hasProblem };
}
