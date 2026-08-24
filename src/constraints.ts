// Constraint engine. PURE functions: knows nothing about React, DOM or localStorage.
// Every exported function here has a test (constraints.test.ts).
//
// Rule: business logic lives here, never inside components.

import { closedKey, placementKey, teacherKey } from './keys';
import {
  lessonDayCount,
  lessonLimit,
  limitFor,
  ruleActive,
  ruleLevel,
  runLength,
  teacherDayCount,
} from './rules';
import type { ClassGroup, Lesson, Room, RuleName, State, Id, Teacher } from './types';

// Re-exported so call sites keep importing keys from here.
export { closedKey, placementKey, teacherKey };

// ---------------------------------------------------------------- index

/**
 * `placements` is keyed by class; teacher and room occupancy are derived from
 * it in a SINGLE pass. Keeping the same data in two places means sync bugs.
 */
export interface Index {
  teacherBusy: Map<string, Id>; // `${teacherId}|${day}|${hour}` -> lessonId
  roomBusy: Map<string, Id>; // `${roomId}|${day}|${hour}` -> lessonId
  lessonById: Map<Id, Lesson>;
  classById: Map<Id, ClassGroup>;
  teacherById: Map<Id, Teacher>;
  roomById: Map<Id, Room>;
  /** lessonId -> hours already placed on the grid. Used by the counters. */
  placedHours: Map<Id, number>;
}

export function buildIndex(d: State): Index {
  const lessonById = new Map(d.lessons.map((x) => [x.id, x]));
  const classById = new Map(d.classes.map((x) => [x.id, x]));
  const teacherById = new Map(d.teachers.map((x) => [x.id, x]));
  const roomById = new Map(d.rooms.map((x) => [x.id, x]));

  const teacherBusy = new Map<string, Id>();
  const roomBusy = new Map<string, Id>();
  const placedHours = new Map<Id, number>();

  for (const key in d.placements) {
    const lessonId = d.placements[key];
    if (lessonId === undefined) continue;
    const lesson = lessonById.get(lessonId);
    if (lesson === undefined) continue; // orphan record — sanitize() deals with it

    const sep = key.lastIndexOf('|');
    const prevSep = key.lastIndexOf('|', sep - 1);
    const day = Number(key.slice(prevSep + 1, sep));
    const hour = Number(key.slice(sep + 1));

    placedHours.set(lessonId, (placedHours.get(lessonId) ?? 0) + 1);
    teacherBusy.set(teacherKey(lesson.teacherId, day, hour), lessonId);

    const roomId = classById.get(lesson.classId)?.roomId;
    if (roomId != null) roomBusy.set(`${roomId}|${day}|${hour}`, lessonId);
  }

  return {
    teacherBusy,
    roomBusy,
    lessonById,
    classById,
    teacherById,
    roomById,
    placedHours,
  };
}

// -------------------------------------------------------------- blocker

/**
 * null -> can be placed. string -> the reason for the block, in plain language.
 *
 * The message is NEVER "there is a clash". This sentence decides the next move
 * of whoever builds the timetable, so it is always concrete:
 * "MÇ o saatte 433 sınıfında".
 */
export function blocker(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
): string | null {
  const lesson = ix.lessonById.get(lessonId);
  if (lesson === undefined) return 'Ders bulunamadı';

  const group = ix.classById.get(lesson.classId);
  const teacher = ix.teacherById.get(lesson.teacherId);
  if (group === undefined || teacher === undefined) return 'Ders eksik tanımlı';

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  if (day < 0 || day >= dayCount || hour < 0) return 'Geçersiz hücre';

  // 1. Does the block fit before the end of the day
  const block = Math.max(1, lesson.blockSize);
  if (hour + block > hourCount) {
    return block === 1 ? 'Bu saat günün dışında' : `${block} saatlik blok güne sığmıyor`;
  }

  const dayName = d.settings.days[day]?.name ?? `${day + 1}. gün`;

  for (let i = 0; i < block; i++) {
    const h = hour + i;
    const hourName = d.settings.hours[h] ?? `${h + 1}`;

    // 2. Is the class free at that hour
    const busyLessonId = d.placements[placementKey(group.id, day, h)];
    if (busyLessonId !== undefined) {
      const other = ix.lessonById.get(busyLessonId);
      const otherSubject = other && ix.teacherById.get(other.teacherId)?.subject;
      return `${group.name} sınıfının ${dayName} ${hourName} saatinde ${otherSubject ?? 'başka ders'} var`;
    }

    // 3. Is the class itself closed at that hour
    if (d.unavailable[closedKey(group.id, day, h)] !== undefined) {
      return `${group.name} sınıfı ${dayName} ${hourName} saatinde kapalı`;
    }

    // 4. Can the teacher come at that hour
    if (d.unavailable[closedKey(teacher.id, day, h)] !== undefined) {
      return `${teacher.short} ${dayName} ${hourName} saatinde müsait değil`;
    }

    // 5. Is the teacher in another class at that hour
    const busyForTeacher = ix.teacherBusy.get(teacherKey(teacher.id, day, h));
    if (busyForTeacher !== undefined) {
      const other = ix.lessonById.get(busyForTeacher);
      const otherClass = other && ix.classById.get(other.classId);
      return `${teacher.short} ${dayName} ${hourName} saatinde ${otherClass?.name ?? 'başka'} sınıfında`;
    }

    // 6. Is another class sharing the room busy at that hour
    if (group.roomId != null) {
      const roomName = ix.roomById.get(group.roomId)?.name ?? '?';
      const busyForRoom = ix.roomBusy.get(closedKey(group.roomId, day, h));
      if (busyForRoom !== undefined) {
        const other = ix.lessonById.get(busyForRoom);
        const otherClass = other && ix.classById.get(other.classId);
        return `${roomName} dersliğinde ${dayName} ${hourName} saatinde ${otherClass?.name ?? 'başka sınıf'} var`;
      }

      // 7. Is the room closed at that hour
      if (d.unavailable[closedKey(group.roomId, day, h)] !== undefined) {
        return `${roomName} dersliği ${dayName} ${hourName} saatinde kapalı`;
      }
    }
  }

  // 8-10. The configurable limits, but only where the rule is set to "Engelle".
  // At "Uyar" the very same text comes back from check() as a warning instead.
  for (const rule of limitBreaches(d, ix, lesson, group, teacher, day, hour, dayName)) {
    if (ruleLevel(d, rule.name) === 'block') return rule.message;
  }

  return null;
}

// ------------------------------------------------------------ soft rules

interface Breach {
  name: RuleName;
  message: string;
}

/**
 * The limit rules broken by putting `lesson` at day/hour. Shared by blocker()
 * (which enforces the ones set to "Engelle") and check() (which reports the
 * ones set to "Uyar"), so the two can never drift apart.
 */
function limitBreaches(
  d: State,
  ix: Index,
  lesson: Lesson,
  group: ClassGroup,
  teacher: Teacher,
  day: number,
  hour: number,
  dayName: string,
): Breach[] {
  const out: Breach[] = [];
  const hourCount = d.settings.hours.length;
  const block = Math.max(1, lesson.blockSize);

  const maxRun = limitFor(d, teacher, 'maxConsecutive');
  if (ruleActive(d, 'maxConsecutive', maxRun)) {
    const run = runLength(ix, teacher.id, day, hour, block, hourCount);
    if (run > maxRun) {
      out.push({
        name: 'maxConsecutive',
        message: `${teacher.short} art arda ${maxRun} saatten fazla girmemeli — burada ${run} saat olur`,
      });
    }
  }

  const maxDay = limitFor(d, teacher, 'maxPerDay');
  if (ruleActive(d, 'maxPerDay', maxDay)) {
    const count = teacherDayCount(ix, teacher.id, day, hourCount) + block;
    if (count > maxDay) {
      out.push({
        name: 'maxPerDay',
        message: `${teacher.short} ${dayName} günü en fazla ${maxDay} saat girmeli — burada ${count} saat olur`,
      });
    }
  }

  const maxSame = lessonLimit(d, lesson);
  if (ruleActive(d, 'maxSameLessonPerDay', maxSame)) {
    const count = lessonDayCount(d, lesson, day, hourCount) + block;
    if (count > maxSame) {
      out.push({
        name: 'maxSameLessonPerDay',
        message:
          `${group.name} sınıfı ${dayName} günü ${teacher.short} dersinden en fazla ` +
          `${maxSame} saat görmeli — burada ${count} saat olur`,
      });
    }
  }

  return out;
}

/**
 * blocker() plus the rules set to "Uyar". `blocked` still decides whether the
 * card can be dropped; `warning` only colours the cell and fills the bar.
 */
export interface Verdict {
  blocked: string | null;
  warning: string | null;
}

export function check(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
): Verdict {
  const blocked = blocker(d, ix, lessonId, day, hour);
  if (blocked !== null) return { blocked, warning: null };

  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  if (lesson === undefined || group === undefined || teacher === undefined) {
    return { blocked: null, warning: null };
  }

  const dayName = d.settings.days[day]?.name ?? `${day + 1}. gün`;
  const warnings = limitBreaches(d, ix, lesson, group, teacher, day, hour, dayName)
    .filter((x) => ruleLevel(d, x.name) === 'warn')
    .map((x) => x.message);

  return { blocked: null, warning: warnings[0] ?? null };
}

/** Every hour a lesson can go into on one day. Computed ONCE when a drag starts. */
export function validHours(d: State, ix: Index, lessonId: Id, day: number): Set<number> {
  const set = new Set<number>();
  for (let h = 0; h < d.settings.hours.length; h++) {
    if (blocker(d, ix, lessonId, day, h) === null) set.add(h);
  }
  return set;
}

// ------------------------------------------------------------- placing

/**
 * START hour of the block containing the clicked cell. null if nothing is placed.
 *
 * Careful: the same lesson may hold several blocks on one day and those blocks
 * may be adjacent (e.g. blockSize=2 at hours 0-1 and 2-3). Walking backwards
 * looking for the same lessonId would treat both as one block. So we first find
 * the start of the consecutive run, then split the run into `blockSize` chunks
 * and pick the chunk that was clicked.
 */
export function blockStart(d: State, classId: Id, day: number, hour: number): number | null {
  const lessonId = d.placements[placementKey(classId, day, hour)];
  if (lessonId === undefined) return null;

  const block = Math.max(1, d.lessons.find((x) => x.id === lessonId)?.blockSize ?? 1);

  let runStart = hour;
  while (runStart > 0 && d.placements[placementKey(classId, day, runStart - 1)] === lessonId) {
    runStart--;
  }

  const chunk = Math.floor((hour - runStart) / block);
  return runStart + chunk * block;
}

/**
 * Writes the lesson onto the grid. Returns a new State, no mutation.
 * PRECONDITION: the caller called `blocker()` first and got null.
 */
export function place(d: State, lessonId: Id, day: number, hour: number): State {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return d;

  const block = Math.max(1, lesson.blockSize);
  const placements = { ...d.placements };
  for (let i = 0; i < block; i++) {
    placements[placementKey(lesson.classId, day, hour + i)] = lessonId;
  }
  return { ...d, placements };
}

/** Removes the WHOLE block containing the clicked cell. */
export function removeBlock(d: State, classId: Id, day: number, hour: number): State {
  const start = blockStart(d, classId, day, hour);
  if (start === null) return d;

  const lessonId = d.placements[placementKey(classId, day, start)];
  if (lessonId === undefined) return d;

  const block = Math.max(1, d.lessons.find((x) => x.id === lessonId)?.blockSize ?? 1);
  const placements = { ...d.placements };
  for (let i = 0; i < block; i++) {
    const k = placementKey(classId, day, start + i);
    if (placements[k] === lessonId) delete placements[k];
  }
  return { ...d, placements };
}

/** Counter: how many hours of this lesson are on the grid. */
export function countPlacedHours(d: State, lessonId: Id): number {
  let n = 0;
  for (const key in d.placements) {
    if (d.placements[key] === lessonId) n++;
  }
  return n;
}

// ------------------------------------------------------------ sanitize

/**
 * Deletes overflowing and orphan records. Called on EVERY load and EVERY
 * settings change — deletion logic is not scattered across components.
 *
 * Returns the SAME object when nothing changed (so no needless re-render).
 */
export function sanitize(d: State): State {
  const roomIds = new Set(d.rooms.map((x) => x.id));
  const teacherIds = new Set(d.teachers.map((x) => x.id));
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  let changed = false;

  // Classes pointing at a deleted room -> roomId null
  let classes = d.classes;
  if (classes.some((c) => c.roomId != null && !roomIds.has(c.roomId))) {
    classes = classes.map((c) =>
      c.roomId != null && !roomIds.has(c.roomId) ? { ...c, roomId: null } : c,
    );
    changed = true;
  }
  const classIds = new Set(classes.map((x) => x.id));

  // Lessons whose class or teacher was deleted
  const lessons = d.lessons.filter(
    (x) => classIds.has(x.classId) && teacherIds.has(x.teacherId),
  );
  if (lessons.length !== d.lessons.length) changed = true;
  const lessonById = new Map(lessons.map((x) => [x.id, x]));

  // Placements: overflowing, orphan or class-mismatched records
  const placements: Record<string, Id> = {};
  for (const key in d.placements) {
    const lessonId = d.placements[key];
    if (lessonId === undefined) continue;

    const parts = key.split('|');
    const classId = parts[0];
    if (parts.length !== 3 || classId === undefined) {
      changed = true;
      continue;
    }
    const day = Number(parts[1]);
    const hour = Number(parts[2]);
    const lesson = lessonById.get(lessonId);

    if (
      lesson === undefined ||
      lesson.classId !== classId ||
      !Number.isInteger(day) ||
      day < 0 ||
      day >= dayCount ||
      !Number.isInteger(hour) ||
      hour < 0 ||
      hour >= hourCount
    ) {
      changed = true;
      continue;
    }
    placements[key] = lessonId;
  }

  // Closed hours: deleted teacher/class/room, or overflowing day/hour
  const unavailable: Record<string, 1> = {};
  for (const key in d.unavailable) {
    const parts = key.split('|');
    const entityId = parts[0];
    if (parts.length !== 3 || entityId === undefined) {
      changed = true;
      continue;
    }
    const day = Number(parts[1]);
    const hour = Number(parts[2]);

    if (
      !(teacherIds.has(entityId) || classIds.has(entityId) || roomIds.has(entityId)) ||
      !Number.isInteger(day) ||
      day < 0 ||
      day >= dayCount ||
      !Number.isInteger(hour) ||
      hour < 0 ||
      hour >= hourCount
    ) {
      changed = true;
      continue;
    }
    unavailable[key] = 1;
  }

  if (!changed) return d;
  return { ...d, classes, lessons, placements, unavailable };
}
