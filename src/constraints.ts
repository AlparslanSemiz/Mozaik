// Constraint engine. PURE functions: knows nothing about React, DOM or localStorage.
// Every exported function here has a test (constraints.test.ts).
//
// Rule: business logic lives here, never inside components.

import { blockPlan, clampPairs } from './blocks';
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
 * Which of the checks stopped a placement. The message names a day and an hour,
 * so two cells blocked for the SAME underlying reason produce two different
 * sentences; anything that wants to count reasons has to count these instead.
 */
export type BlockCode =
  | 'missing'
  | 'dayEnd'
  | 'classBusy'
  | 'classClosed'
  | 'teacherClosed'
  | 'teacherBusy'
  | 'roomBusy'
  | 'roomClosed'
  | 'rule';

export interface Block {
  code: BlockCode;
  message: string;
}

/**
 * null -> can be placed. Otherwise the reason for the block, in plain language.
 *
 * The message is NEVER "there is a clash". This sentence decides the next move
 * of whoever builds the timetable, so it is always concrete:
 * "MÇ o saatte 433 sınıfında".
 */
export function blockerDetail(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
  size?: number,
): Block | null {
  const lesson = ix.lessonById.get(lessonId);
  if (lesson === undefined) return { code: 'missing', message: 'Ders bulunamadı' };

  const group = ix.classById.get(lesson.classId);
  const teacher = ix.teacherById.get(lesson.teacherId);
  if (group === undefined || teacher === undefined) {
    return { code: 'missing', message: 'Ders eksik tanımlı' };
  }

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  if (day < 0 || day >= dayCount || hour < 0) {
    return { code: 'missing', message: 'Geçersiz hücre' };
  }

  // 1. Does the block fit before the end of the day
  //
  // The size is a parameter now and it is the LAST one, deliberately. A lesson
  // no longer has one block length — 2+1 puts a two-hour card and a one-hour
  // card in the pool at the same time — so the caller has to say which one is
  // in the air. Squeezed in beside `day` and `hour` it would be a third number
  // in a row and swappable in silence; left off it means "whichever block this
  // lesson still owes first", which is what every caller that is not a drag
  // wants anyway.
  const block = blockSizeFor(d, lesson, size);
  if (hour + block > hourCount) {
    return {
      code: 'dayEnd',
      message: block === 1 ? 'Bu saat günün dışında' : `${block} saatlik blok güne sığmıyor`,
    };
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
      return {
        code: 'classBusy',
        message: `${group.name} sınıfının ${dayName} ${hourName} saatinde ${otherSubject ?? 'başka ders'} var`,
      };
    }

    // 3. Is the class itself closed at that hour
    if (d.unavailable[closedKey(group.id, day, h)] !== undefined) {
      return { code: 'classClosed', message: `${group.name} sınıfı ${dayName} ${hourName} saatinde kapalı` };
    }

    // 4. Can the teacher come at that hour
    if (d.unavailable[closedKey(teacher.id, day, h)] !== undefined) {
      return {
        code: 'teacherClosed',
        message: `${teacher.short} ${dayName} ${hourName} saatinde müsait değil`,
      };
    }

    // 5. Is the teacher in another class at that hour
    const busyForTeacher = ix.teacherBusy.get(teacherKey(teacher.id, day, h));
    if (busyForTeacher !== undefined) {
      const other = ix.lessonById.get(busyForTeacher);
      const otherClass = other && ix.classById.get(other.classId);
      return {
        code: 'teacherBusy',
        message: `${teacher.short} ${dayName} ${hourName} saatinde ${otherClass?.name ?? 'başka'} sınıfında`,
      };
    }

    // 6. Is another class sharing the room busy at that hour
    if (group.roomId != null) {
      const roomName = ix.roomById.get(group.roomId)?.name ?? '?';
      const busyForRoom = ix.roomBusy.get(closedKey(group.roomId, day, h));
      if (busyForRoom !== undefined) {
        const other = ix.lessonById.get(busyForRoom);
        const otherClass = other && ix.classById.get(other.classId);
        return {
          code: 'roomBusy',
          message: `${roomName} dersliğinde ${dayName} ${hourName} saatinde ${otherClass?.name ?? 'başka sınıf'} var`,
        };
      }

      // 7. Is the room closed at that hour
      if (d.unavailable[closedKey(group.roomId, day, h)] !== undefined) {
        return {
          code: 'roomClosed',
          message: `${roomName} dersliği ${dayName} ${hourName} saatinde kapalı`,
        };
      }
    }
  }

  // 8-10. The configurable limits, but only where the rule is set to "Engelle".
  // At "Uyar" the very same text comes back from check() as a warning instead.
  for (const rule of limitBreaches(d, ix, lesson, group, teacher, day, hour, dayName, block)) {
    if (ruleLevel(d, rule.name) === 'block') return { code: 'rule', message: rule.message };
  }

  return null;
}

/** The message alone. Everything that only needs a sentence calls this. */
export function blocker(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
  size?: number,
): string | null {
  return blockerDetail(d, ix, lessonId, day, hour, size)?.message ?? null;
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
  block: number,
): Breach[] {
  const out: Breach[] = [];
  const hourCount = d.settings.hours.length;

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
  size?: number,
): Verdict {
  const blocked = blocker(d, ix, lessonId, day, hour, size);
  if (blocked !== null) return { blocked, warning: null };

  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  if (lesson === undefined || group === undefined || teacher === undefined) {
    return { blocked: null, warning: null };
  }

  const dayName = d.settings.days[day]?.name ?? `${day + 1}. gün`;
  const block = blockSizeFor(d, lesson, size);
  const warnings = limitBreaches(d, ix, lesson, group, teacher, day, hour, dayName, block)
    .filter((x) => ruleLevel(d, x.name) === 'warn')
    .map((x) => x.message);

  return { blocked: null, warning: warnings[0] ?? null };
}

/** Every hour a lesson can go into on one day. Computed ONCE when a drag starts. */
export function validHours(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  size?: number,
): Set<number> {
  const set = new Set<number>();
  for (let h = 0; h < d.settings.hours.length; h++) {
    if (blocker(d, ix, lessonId, day, h, size) === null) set.add(h);
  }
  return set;
}

// -------------------------------------------------- reading blocks off the grid
//
// THE CONTRACT. `placements` holds one lessonId per hour and NO block boundary
// — a block has never been an entity here. With one block length per lesson
// that was enough: a run of the same id split into equal chunks and the answer
// was unique. With 2+1 it is not. Three adjacent cells of one lesson can be
// read as [2,1] or as [1,2], and nothing on the grid can tell them apart.
//
// The way out is not a bigger schema, it is a rule — written once, obeyed
// everywhere:
//
//   A lesson's placed blocks are read in day/hour order. Inside each run the
//   TWO-hour blocks are taken first, while the lesson still has twos left to
//   account for; whatever is left over is a single.
//
// Which reading is chosen cannot make a timetable wrong: every clash rule looks
// at hours and at runs, never at where a boundary was drawn, so all readings of
// the same cells are equally legal. What it decides is what a right-click takes
// away and which cards the pool still owes — and those have to be ONE answer,
// or the tray and the grid start disagreeing about the same lesson.

export interface PlacedBlock {
  day: number;
  hour: number;
  size: number;
}

/** Every placed block of one lesson, in day/hour order. See the contract above. */
export function placedBlocks(d: State, lesson: Lesson): PlacedBlock[] {
  const out: PlacedBlock[] = [];
  let twosLeft = clampPairs(lesson.weeklyHours, lesson.pairs);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  for (let g = 0; g < dayCount; g++) {
    let h = 0;
    while (h < hourCount) {
      if (d.placements[placementKey(lesson.classId, g, h)] !== lesson.id) {
        h++;
        continue;
      }
      let end = h;
      while (
        end < hourCount &&
        d.placements[placementKey(lesson.classId, g, end)] === lesson.id
      ) {
        end++;
      }
      for (let cur = h; cur < end; ) {
        const size = end - cur >= 2 && twosLeft > 0 ? 2 : 1;
        if (size === 2) twosLeft--;
        out.push({ day: g, hour: cur, size });
        cur += size;
      }
      h = end;
    }
  }
  return out;
}

/**
 * The blocks a lesson still owes, biggest first.
 *
 * A multiset difference and not an hour count, because hours cannot answer it:
 * a 2+2+1+1 lesson with two hours down could have placed one two or two ones,
 * and the two cases owe different cards. The reading above is what makes the
 * question decidable at all.
 */
export function pendingBlocks(d: State, lesson: Lesson): number[] {
  const owed = blockPlan(lesson);
  for (const done of placedBlocks(d, lesson)) {
    const at = owed.indexOf(done.size);
    // Not found: the grid holds a shape the plan does not (an old backup, or
    // hours edited under a placed lesson). Take the biggest thing left rather
    // than pretend nothing was placed.
    owed.splice(at === -1 ? 0 : at, 1);
  }
  return owed;
}

/** The size a caller means when it does not say. See `blockerDetail`. */
function blockSizeFor(d: State, lesson: Lesson, size?: number): number {
  if (size !== undefined) return Math.max(1, Math.round(size));
  return pendingBlocks(d, lesson)[0] ?? 1;
}

// ------------------------------------------------------------- placing

/** START hour of the block containing the clicked cell. null if nothing is placed. */
export function blockStart(d: State, classId: Id, day: number, hour: number): number | null {
  const found = blockAt(d, classId, day, hour);
  return found?.hour ?? null;
}

/** The whole block containing the clicked cell — where it starts and how long. */
export function blockAt(
  d: State,
  classId: Id,
  day: number,
  hour: number,
): PlacedBlock | null {
  const lessonId = d.placements[placementKey(classId, day, hour)];
  if (lessonId === undefined) return null;
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return { day, hour, size: 1 };

  for (const block of placedBlocks(d, lesson)) {
    if (block.day === day && hour >= block.hour && hour < block.hour + block.size) return block;
  }
  return null;
}

/**
 * Writes the lesson onto the grid. Returns a new State, no mutation.
 * PRECONDITION: the caller called `blocker()` first and got null.
 */
export function place(
  d: State,
  lessonId: Id,
  day: number,
  hour: number,
  size?: number,
): State {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return d;

  const block = blockSizeFor(d, lesson, size);
  const placements = { ...d.placements };
  for (let i = 0; i < block; i++) {
    placements[placementKey(lesson.classId, day, hour + i)] = lessonId;
  }
  return { ...d, placements };
}

/** Removes the WHOLE block containing the clicked cell. */
export function removeBlock(d: State, classId: Id, day: number, hour: number): State {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return d;

  const lessonId = d.placements[placementKey(classId, day, found.hour)];
  if (lessonId === undefined) return d;

  const placements = { ...d.placements };
  for (let i = 0; i < found.size; i++) {
    const k = placementKey(classId, day, found.hour + i);
    if (placements[k] === lessonId) delete placements[k];
  }
  return { ...d, placements };
}

/**
 * THE DROP MAP: what every cell on the grid would do if the lesson were let go
 * over it. One call, one pass, computed ONCE at the start of a drag (pitfall 2)
 * and never again while the pointer moves.
 *
 * It is `check()` for every cell plus the ONE refusal a drop is allowed to
 * overrule: the class's own other lesson already sitting in the target cells.
 * Asked for by name (2026-08-26): "farklı bir kart başka bir kartın üzerine
 * gelirse o üzerine gelinen aşağı düşsün ve koyduğum olsun" — the one that was
 * there goes back to the pool, which is the tray directly below the grid.
 *
 * Only `classBusy` is overruled, and the limit is not squeamishness: every
 * other refusal is about somebody ELSE. A teacher standing in another class, a
 * shared room, a closed hour — evicting the block in front of you does not
 * make any of those true, so a cell refused for one of them stays refused.
 *
 * WHY THE VERDICT IS "warn" AND NOT "ok". A drop that costs you a lesson is not
 * the same move as a drop onto empty air, and the grid already has a colour for
 * "allowed, but look at it": yellow. No fourth colour was added — the three
 * functional colours keep meaning exactly what CLAUDE.md says they mean.
 *
 * The eviction is simulated with `vacate`/`occupy` on ONE working copy rather
 * than with `removeBlock` per cell: the latter copies a ~1800-key dictionary
 * and rebuilds the index for each of 72 cells, and this runs on the pointer
 * going down.
 */
export interface DropVerdict extends Verdict {
  /** Lessons that would be sent back to the pool for this drop to happen. */
  evicts: Id[];
}

export function dropMap(
  d: State,
  ix: Index,
  lessonId: Id,
  size?: number,
): Map<string, DropVerdict> {
  const map = new Map<string, DropVerdict>();
  const lesson = ix.lessonById.get(lessonId);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  // One working copy for the whole pass; `vacate`/`occupy` write into it and
  // put it back, so `d` itself is never touched. The INDEX is copied too, and
  // not for tidiness: `ix` is the caller's memoised object, shared with every
  // render, and a vacate that was not followed by its occupy would leave it
  // lying about who is busy. Copying costs one pass over ~1800 entries, once —
  // the thing being avoided is doing that 72 times.
  const work: State = { ...d, placements: { ...d.placements } };
  const workIx: Index = {
    ...ix,
    teacherBusy: new Map(ix.teacherBusy),
    roomBusy: new Map(ix.roomBusy),
    placedHours: new Map(ix.placedHours),
  };

  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      const key = `${g}|${s}`;
      const plain = check(d, ix, lessonId, g, s, size);
      if (plain.blocked === null || lesson === undefined) {
        map.set(key, { ...plain, evicts: [] });
        continue;
      }

      const detail = blockerDetail(d, ix, lessonId, g, s, size);
      if (detail === null || detail.code !== 'classBusy') {
        map.set(key, { ...plain, evicts: [] });
        continue;
      }

      // Which of the class's own blocks are in the way. A block is identified
      // by its HEAD, so two cells of the same 2-hour block count once — and it
      // carries its own length, because the occupant's blocks need not be the
      // same length as each other any more.
      const block = blockSizeFor(d, lesson, size);
      const heads: Array<{ lesson: Lesson; hour: number; size: number }> = [];
      const seen = new Set<string>();
      for (let i = 0; i < block && s + i < hourCount; i++) {
        const found = blockAt(work, lesson.classId, g, s + i);
        if (found === null) continue;
        const occupantId = work.placements[placementKey(lesson.classId, g, found.hour)];
        if (occupantId === undefined) continue;
        const mark = `${occupantId}|${found.hour}`;
        if (seen.has(mark)) continue;
        seen.add(mark);
        const occupant = ix.lessonById.get(occupantId);
        if (occupant !== undefined) {
          heads.push({ lesson: occupant, hour: found.hour, size: found.size });
        }
      }

      if (heads.length === 0) {
        map.set(key, { ...plain, evicts: [] });
        continue;
      }

      for (const h of heads) {
        vacate(work.placements, workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }
      const after = check(work, workIx, lessonId, g, s, size);
      for (const h of heads) {
        occupy(work.placements, workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }

      if (after.blocked !== null) {
        // Evicting did not help: the cell is refused for its own reason, and
        // the sentence the reader gets is that reason, not "class is busy".
        map.set(key, { ...after, evicts: [] });
        continue;
      }

      map.set(key, {
        blocked: null,
        warning: after.warning ?? evictionNotice(ix, heads.map((h) => h.lesson)),
        evicts: heads.map((h) => h.lesson.id),
      });
    }
  }

  return map;
}

/** The class's room, which `occupy`/`vacate` need to keep roomBusy honest. */
function roomOf(ix: Index, lesson: Lesson): Id | null {
  return ix.classById.get(lesson.classId)?.roomId ?? null;
}

/** What the reader is about to lose, named. */
export function evictionNotice(ix: Index, lessons: Lesson[]): string {
  const names = lessons.map((x) => {
    const group = ix.classById.get(x.classId)?.name ?? '?';
    const teacher = ix.teacherById.get(x.teacherId)?.short ?? '?';
    return `${group} — ${teacher}`;
  });
  return names.length === 1
    ? `${names[0]} dersi havuza dönecek`
    : `${names.join(', ')} dersleri havuza dönecek`;
}

/**
 * The eviction itself, as a state change: lift every block that is in the way,
 * then lay the new one down. Separate from `dropMap` because the map ANSWERS a
 * question and this one CHANGES something, and because the reducer has to redo
 * the lift against the state React hands it rather than the one the drag
 * started with (pitfall 20).
 */
export function evict(d: State, classId: Id, day: number, hours: number[]): State {
  let next = d;
  for (const h of hours) next = removeBlock(next, classId, day, h);
  return next;
}

// ------------------------------------------------- in-place placing (solver)

/**
 * `place()` and `buildIndex()` in one, writing into the SAME objects instead of
 * producing new ones. Only the solver uses this pair.
 *
 * Why it exists: backtracking touches the grid tens of thousands of times, and
 * `place()` copies a ~430-key dictionary every call while `buildIndex()` walks
 * the whole thing. Both are the right shape for a single user action and the
 * wrong shape for a search.
 *
 * Why it is safe: `blocker()` and the rule functions only ever READ
 * `placements` and the index, so mutating them in place reuses the constraint
 * engine verbatim rather than re-implementing it. The one thing that could
 * drift is this function against `place()` itself, which is exactly what
 * `constraints.test.ts` pins down.
 */
export function occupy(
  placements: Record<string, Id>,
  ix: Index,
  lesson: Lesson,
  roomId: Id | null,
  day: number,
  hour: number,
  /** REQUIRED, unlike everywhere else: these two are the search's inner loop
      and a wrong length here corrupts the index silently rather than refusing
      a drop. The caller always knows which block it is moving. */
  size: number,
): void {
  const block = Math.max(1, Math.round(size));
  for (let i = 0; i < block; i++) {
    const h = hour + i;
    placements[placementKey(lesson.classId, day, h)] = lesson.id;
    ix.teacherBusy.set(teacherKey(lesson.teacherId, day, h), lesson.id);
    if (roomId != null) ix.roomBusy.set(closedKey(roomId, day, h), lesson.id);
  }
  ix.placedHours.set(lesson.id, (ix.placedHours.get(lesson.id) ?? 0) + block);
}

/** Undoes exactly one `occupy()`. */
export function vacate(
  placements: Record<string, Id>,
  ix: Index,
  lesson: Lesson,
  roomId: Id | null,
  day: number,
  hour: number,
  /** REQUIRED, unlike everywhere else: these two are the search's inner loop
      and a wrong length here corrupts the index silently rather than refusing
      a drop. The caller always knows which block it is moving. */
  size: number,
): void {
  const block = Math.max(1, Math.round(size));
  for (let i = 0; i < block; i++) {
    const h = hour + i;
    delete placements[placementKey(lesson.classId, day, h)];
    ix.teacherBusy.delete(teacherKey(lesson.teacherId, day, h));
    if (roomId != null) ix.roomBusy.delete(closedKey(roomId, day, h));
  }
  const left = (ix.placedHours.get(lesson.id) ?? 0) - block;
  if (left > 0) ix.placedHours.set(lesson.id, left);
  else ix.placedHours.delete(lesson.id);
}

/** Counter: how many hours of this lesson are on the grid. */
export function countPlacedHours(d: State, lessonId: Id): number {
  let n = 0;
  for (const key in d.placements) {
    if (d.placements[key] === lessonId) n++;
  }
  return n;
}

// --------------------------------------------------- closed-hour conflicts

/** One placed lesson sitting on an hour that is now closed for somebody. */
export interface ClosedConflict {
  lessonId: Id;
  classId: Id;
  teacherId: Id;
  day: number;
  hour: number;
  /** Concrete, in blocker()'s own voice: "MÇ Salı 3 saatinde müsait değil". */
  reason: string;
}

/**
 * Lessons already on the grid whose hour has since been closed.
 *
 * Availability is edited AFTER a timetable is laid out, and marking an hour
 * closed used to do nothing to what already sat there: the lesson stayed, and
 * it was invisible — the hatch is only drawn on EMPTY cells, so the card simply
 * covered the closed hour. blocker() never looked at it either, because it only
 * ever runs for a prospective drop.
 *
 * Nothing is deleted here, on purpose (principle 6): a wrong click on the
 * availability grid must not silently cost a laid-out lesson. The caller paints
 * these cells red and Kontrol lists them; my father decides.
 */
export function closedConflicts(d: State, ix: Index): ClosedConflict[] {
  const out: ClosedConflict[] = [];

  for (const key in d.placements) {
    const lessonId = d.placements[key];
    if (lessonId === undefined) continue;

    const parts = key.split('|');
    const classId = parts[0];
    if (classId === undefined) continue;
    const day = Number(parts[1]);
    const hour = Number(parts[2]);

    const lesson = ix.lessonById.get(lessonId);
    if (lesson === undefined) continue;
    const group = ix.classById.get(classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    if (group === undefined || teacher === undefined) continue;

    const dayName = d.settings.days[day]?.name ?? `${day + 1}. gün`;
    const hourName = d.settings.hours[hour] ?? `${hour + 1}`;
    const when = `${dayName} ${hourName} saatinde`;

    let reason: string | null = null;
    if (d.unavailable[closedKey(teacher.id, day, hour)] !== undefined) {
      reason = `${teacher.short} ${when} müsait değil`;
    } else if (d.unavailable[closedKey(group.id, day, hour)] !== undefined) {
      reason = `${group.name} sınıfı ${when} kapalı`;
    } else if (
      group.roomId != null &&
      d.unavailable[closedKey(group.roomId, day, hour)] !== undefined
    ) {
      const roomName = ix.roomById.get(group.roomId)?.name ?? '?';
      reason = `${roomName} dersliği ${when} kapalı`;
    }
    if (reason === null) continue;

    out.push({ lessonId, classId, teacherId: teacher.id, day, hour, reason });
  }

  // Stable order, so the Kontrol list does not reshuffle on every keystroke.
  out.sort((a, b) => a.day - b.day || a.hour - b.hour || a.reason.localeCompare(b.reason, 'tr'));
  return out;
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
  const kept = d.lessons.filter((x) => classIds.has(x.classId) && teacherIds.has(x.teacherId));
  if (kept.length !== d.lessons.length) changed = true;

  // …and lessons whose SPLIT no longer fits their hours. Nothing else validated
  // block geometry before v7 — `blockSize` came out of a backup file raw — and
  // a `pairs` above the ceiling would make `blockPlan` and `placedBlocks`
  // disagree about how many twos exist.
  const lessons = kept.map((x) => {
    const pairs = clampPairs(x.weeklyHours, x.pairs);
    if (pairs === x.pairs) return x;
    changed = true;
    return { ...x, pairs };
  });
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
