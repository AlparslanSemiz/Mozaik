// Feasibility check (v0.5). PURE functions.
//
// The thing aSc does not do and that hurts most at the school: saying WHY a
// timetable cannot be built. It comes before a solver because it is far
// cheaper and far more useful.

import { blocker, buildIndex } from './constraints';
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

export interface Report {
  teachers: ReportRow[];
  classes: ReportRow[];
  rooms: ReportRow[];
  unplaceable: Unplaceable[];
  /** Limit rules broken by the timetable as it stands (rules.ts). */
  violations: Violation[];
  hasProblem: boolean;
}

function levelOf(capacity: number, load: number): Level {
  if (load > capacity) return 'impossible';
  if (capacity > 0 && load > capacity * TIGHT_RATIO) return 'tight';
  return 'ok';
}

export function buildReport(d: State): Report {
  const totalSlots = d.settings.days.length * d.settings.hours.length;
  const ix = buildIndex(d);

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

  // Lessons that are still incomplete and have no valid slot left at all.
  const unplaceable: Unplaceable[] = [];
  for (const lesson of d.lessons) {
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const missing = lesson.weeklyHours - placed;
    if (missing <= 0) continue;

    const counts = new Map<string, number>();
    let anyValid = false;
    for (let g = 0; g < d.settings.days.length && !anyValid; g++) {
      for (let s = 0; s < d.settings.hours.length; s++) {
        const reason = blocker(d, ix, lesson.id, g, s);
        if (reason === null) {
          anyValid = true;
          break;
        }
        counts.set(reason, (counts.get(reason) ?? 0) + 1);
      }
    }
    if (anyValid) continue;

    // The most frequent reason is the most explanatory one.
    let topReason = 'Boş yer kalmamış';
    let topCount = 0;
    for (const [reason, count] of counts) {
      if (count > topCount) {
        topCount = count;
        topReason = reason;
      }
    }

    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    unplaceable.push({
      lessonId: lesson.id,
      name: `${group?.name ?? '?'} — ${teacher?.short ?? '?'} ${teacher?.subject ?? ''}`.trim(),
      missing,
      message: `${missing} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: ${topReason}`,
    });
  }

  const violations = findViolations(d, ix);

  const hasProblem =
    unplaceable.length > 0 ||
    violations.length > 0 ||
    [...teachers, ...classes, ...rooms].some((x) => x.level !== 'ok');

  return { teachers, classes, rooms, unplaceable, violations, hasProblem };
}
