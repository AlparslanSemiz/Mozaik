// Constraint engine. PURE functions: knows nothing about React, DOM or localStorage.
// Every exported function here has a test (constraints.test.ts).
//
// Rule: business logic lives here, never inside components.

import { blockPlan, clampBlocks } from './blocks';
import { t } from './i18n';
import { closedKey, placementKey, teacherKey } from './keys';
// A leaf BELOW this file, on purpose: these sentences name a day and a subject,
// and both have to reach the screen in the interface language. `entities.ts`
// already imports this file, so the vocabulary lives under both of them.
import { dayLabel, subjectLabel } from './names';
import { activePinned, activePlacements, blankProgram, replaceActiveGrid } from './programs';
import { hasTwoSubjects } from './subjects';
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
import type { View } from './toolState';

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

  const placements = activePlacements(d);
  for (const key in placements) {
    const lessonId = placements[key];
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
  if (lesson === undefined) return { code: 'missing', message: t('Ders bulunamadı') };

  const group = ix.classById.get(lesson.classId);
  const teacher = ix.teacherById.get(lesson.teacherId);
  if (group === undefined || teacher === undefined) {
    return { code: 'missing', message: t('Ders eksik tanımlı') };
  }

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  if (day < 0 || day >= dayCount || hour < 0) {
    return { code: 'missing', message: t('Geçersiz hücre') };
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
      message:
        block === 1
          ? t('Bu saat günün dışında')
          : t('{boy} saatlik blok güne sığmıyor', { boy: block }),
    };
  }

  const dayName = dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));

  for (let i = 0; i < block; i++) {
    const h = hour + i;
    const hourName = d.settings.hours[h] ?? `${h + 1}`;

    // 2. Is the class free at that hour
    const busyLessonId = activePlacements(d)[placementKey(group.id, day, h)];
    if (busyLessonId !== undefined) {
      const other = ix.lessonById.get(busyLessonId);
      const otherSubject = other && ix.teacherById.get(other.teacherId)?.subject;
      return {
        code: 'classBusy',
        message: t('{sinif} sınıfının {gun} {saat} saatinde {ders} var', {
          sinif: group.name,
          gun: dayName,
          saat: hourName,
          ders: otherSubject === undefined ? t('başka ders') : subjectLabel(otherSubject),
        }),
      };
    }

    // 3. Is the class itself closed at that hour
    if (d.unavailable[closedKey(group.id, day, h)] !== undefined) {
      return {
        code: 'classClosed',
        message: t('{sinif} sınıfı {gun} {saat} saatinde kapalı', {
          sinif: group.name,
          gun: dayName,
          saat: hourName,
        }),
      };
    }

    // 4. Can the teacher come at that hour
    if (d.unavailable[closedKey(teacher.id, day, h)] !== undefined) {
      return {
        code: 'teacherClosed',
        message: t('{kim} {gun} {saat} saatinde müsait değil', {
          kim: teacher.short,
          gun: dayName,
          saat: hourName,
        }),
      };
    }

    // 5. Is the teacher in another class at that hour
    const busyForTeacher = ix.teacherBusy.get(teacherKey(teacher.id, day, h));
    if (busyForTeacher !== undefined) {
      const other = ix.lessonById.get(busyForTeacher);
      const otherClass = other && ix.classById.get(other.classId);
      return {
        code: 'teacherBusy',
        message: t('{kim} {gun} {saat} saatinde {sinif} sınıfında', {
          kim: teacher.short,
          gun: dayName,
          saat: hourName,
          sinif: otherClass?.name ?? t('başka'),
        }),
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
          message: t('{derslik} dersliğinde {gun} {saat} saatinde {sinif} var', {
            derslik: roomName,
            gun: dayName,
            saat: hourName,
            sinif: otherClass?.name ?? t('başka sınıf'),
          }),
        };
      }

      // 7. Is the room closed at that hour
      if (d.unavailable[closedKey(group.roomId, day, h)] !== undefined) {
        return {
          code: 'roomClosed',
          message: t('{derslik} dersliği {gun} {saat} saatinde kapalı', {
            derslik: roomName,
            gun: dayName,
            saat: hourName,
          }),
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
        message: `${teacher.short} art arda ${maxRun} saatten fazla girmemeli, burada ${run} saat olur`,
      });
    }
  }

  const maxDay = limitFor(d, teacher, 'maxPerDay');
  if (ruleActive(d, 'maxPerDay', maxDay)) {
    const count = teacherDayCount(ix, teacher.id, day, hourCount) + block;
    if (count > maxDay) {
      out.push({
        name: 'maxPerDay',
        message: t('{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur', {
          kim: teacher.short,
          gun: dayName,
          sinir: maxDay,
          olan: count,
        }),
      });
    }
  }

  const maxSame = lessonLimit(d, lesson, group);
  if (ruleActive(d, 'maxSameLessonPerDay', maxSame)) {
    const count = lessonDayCount(d, lesson, day, hourCount) + block;
    if (count > maxSame) {
      out.push({
        name: 'maxSameLessonPerDay',
        message: t(
          '{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur',
          { sinif: group.name, gun: dayName, kim: teacher.short, sinir: maxSame, olan: count },
        ),
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

/** Finish a verdict from a blocker result that the caller already computed. */
function verdictAfterBlocker(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
  size: number | undefined,
  detail: Block | null,
): Verdict {
  if (detail !== null) return { blocked: detail.message, warning: null };

  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  if (lesson === undefined || group === undefined || teacher === undefined) {
    return { blocked: null, warning: null };
  }

  const dayName = dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
  const block = blockSizeFor(d, lesson, size);
  const warnings = limitBreaches(d, ix, lesson, group, teacher, day, hour, dayName, block)
    .filter((x) => ruleLevel(d, x.name) === 'warn')
    .map((x) => x.message);

  return { blocked: null, warning: warnings[0] ?? null };
}

export function check(
  d: State,
  ix: Index,
  lessonId: Id,
  day: number,
  hour: number,
  size?: number,
): Verdict {
  const detail = blockerDetail(d, ix, lessonId, day, hour, size);
  return verdictAfterBlocker(d, ix, lessonId, day, hour, size, detail);
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
//   BIGGEST block the lesson still owes is taken first, as long as it fits what
//   is left of the run; whatever no named block fits is a single.
//
// That is the same order `blockPlan` writes the split in, so a lesson placed
// straight out of the pool reads back exactly as it went down.
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
  // What the lesson still owes, longest first — the countdown the contract
  // above spends. A plain counter worked while 2 was the only length worth
  // naming; with 2, 3 and 4 the run has to be offered each of them in turn.
  const left = clampBlocks(lesson.weeklyHours, lesson.blocks);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  for (let g = 0; g < dayCount; g++) {
    let h = 0;
    while (h < hourCount) {
      if (activePlacements(d)[placementKey(lesson.classId, g, h)] !== lesson.id) {
        h++;
        continue;
      }
      let end = h;
      while (
        end < hourCount &&
        activePlacements(d)[placementKey(lesson.classId, g, end)] === lesson.id
      ) {
        end++;
      }
      for (let cur = h; cur < end; ) {
        const room = end - cur;
        const at = left.findIndex((b) => b <= room);
        const size = at === -1 ? 1 : left[at]!;
        if (at !== -1) left.splice(at, 1);
        out.push({ day: g, hour: cur, size });
        cur += size;
      }
      h = end;
    }
  }
  return out;
}

/**
 * How many hours the block starting at each placed cell stands for.
 *
 * ONE map, keyed the way `placements` is, so every drawing of the week reads
 * the same boundaries: the grid, the two printed tables and the auditor. A cell
 * that is not the head of a block is absent — its hours belong to the head to
 * its left. Anything that recomputes this on its own drifts (pitfall 75).
 */
export function blockSpans(d: State): Map<string, number> {
  const spans = new Map<string, number>();
  for (const lesson of d.lessons) {
    for (const b of placedBlocks(d, lesson)) {
      spans.set(placementKey(lesson.classId, b.day, b.hour), b.size);
    }
  }
  return spans;
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
  const lessonId = activePlacements(d)[placementKey(classId, day, hour)];
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
  const placements = { ...activePlacements(d) };
  for (let i = 0; i < block; i++) {
    placements[placementKey(lesson.classId, day, hour + i)] = lessonId;
  }
  return replaceActiveGrid(d, { placements });
}

/**
 * Is any hour of the block containing this cell pinned?
 *
 * Asked of the BLOCK and not of the cell, because a block is what moves and
 * what is removed: pinning the first hour of a double has to hold the second
 * one too, or half of it could be dragged out from under the pin.
 */
export function blockPinned(d: State, classId: Id, day: number, hour: number): boolean {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return false;
  for (let i = 0; i < found.size; i++) {
    if (activePinned(d)[placementKey(classId, day, found.hour + i)] !== undefined) return true;
  }
  return false;
}

/** Every cell of the block containing this one, or [] if there is no block. */
export function blockCells(d: State, classId: Id, day: number, hour: number): string[] {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return [];
  const out: string[] = [];
  for (let i = 0; i < found.size; i++) out.push(placementKey(classId, day, found.hour + i));
  return out;
}

/** Pins the whole block containing this cell, or unpins it. One undo step. */
export function setBlockPinned(
  d: State,
  classId: Id,
  day: number,
  hour: number,
  on: boolean,
): State {
  const cells = blockCells(d, classId, day, hour);
  if (cells.length === 0) return d;
  const pinned = { ...activePinned(d) };
  for (const key of cells) {
    if (on) pinned[key] = 1;
    else delete pinned[key];
  }
  return replaceActiveGrid(d, { pinned });
}

/**
 * Takes the WHOLE block containing this cell off the grid. MECHANICAL: it does
 * not ask whether the reader is allowed to.
 *
 * Separate from `removeBlock` because two different things want to lift a
 * block and only one of them is a person. `illegalBlocks()` in worlds.ts lifts
 * every block on a finished timetable and asks `blocker()` whether it could go
 * back — that is a question about the RULES, and a pin is not a rule. Routing
 * the auditor through the refusal made it unable to lift a pinned block, so it
 * reported the block as colliding with itself.
 */
export function liftBlock(d: State, classId: Id, day: number, hour: number): State {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return d;

  const lessonId = activePlacements(d)[placementKey(classId, day, found.hour)];
  if (lessonId === undefined) return d;

  const placements = { ...activePlacements(d) };
  for (let i = 0; i < found.size; i++) {
    const k = placementKey(classId, day, found.hour + i);
    if (placements[k] === lessonId) delete placements[k];
  }
  return replaceActiveGrid(d, { placements });
}

/**
 * Removes the WHOLE block containing the clicked cell, IF the reader may.
 *
 * A pinned block is not removed. The refusal lives here rather than in the
 * button that calls it because there are four ways in — right-click, the
 * menu's own item, Delete on a focused card, and a drop that would evict —
 * and a lock that only three of them respect is not a lock.
 */
export function removeBlock(d: State, classId: Id, day: number, hour: number): State {
  if (blockPinned(d, classId, day, hour)) return d;
  return liftBlock(d, classId, day, hour);
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
  action: DropAction;
}

/** A block identity that remains unambiguous when one lesson has several blocks. */
export interface BlockRef extends PlacedBlock {
  lessonId: Id;
  classId: Id;
}

export type DropAction =
  | { kind: 'place' }
  | { kind: 'evict'; blocks: BlockRef[] }
  | { kind: 'swap'; target: BlockRef };

function sameBlock(d: State, ref: BlockRef): boolean {
  if (activePlacements(d)[placementKey(ref.classId, ref.day, ref.hour)] !== ref.lessonId) {
    return false;
  }
  const found = blockAt(d, ref.classId, ref.day, ref.hour);
  return found !== null && found.hour === ref.hour && found.size === ref.size;
}

function refAt(d: State, lessonId: Id, day: number, hour: number): BlockRef | null {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return null;
  const found = blockAt(d, lesson.classId, day, hour);
  return found === null
    ? null
    : { lessonId, classId: lesson.classId, day: found.day, hour: found.hour, size: found.size };
}

function targetBlocks(
  d: State,
  ix: Index,
  moving: Lesson,
  source: BlockRef,
  day: number,
  hour: number,
  size: number,
): BlockRef[] {
  const found = new Map<string, BlockRef>();
  for (let i = 0; i < size; i++) {
    const h = hour + i;
    const ids = [
      activePlacements(d)[placementKey(moving.classId, day, h)],
      ix.teacherBusy.get(teacherKey(moving.teacherId, day, h)),
    ];
    for (const id of ids) {
      if (id === undefined) continue;
      const ref = refAt(d, id, day, h);
      if (ref === null) continue;
      if (
        ref.lessonId === source.lessonId &&
        ref.classId === source.classId &&
        ref.day === source.day &&
        ref.hour === source.hour
      ) continue;
      found.set(`${ref.classId}|${ref.day}|${ref.hour}`, ref);
    }
  }
  return [...found.values()];
}

function blockName(ix: Index, ref: BlockRef): string {
  const lesson = ix.lessonById.get(ref.lessonId);
  const group = ix.classById.get(ref.classId)?.name ?? '?';
  const teacher = lesson === undefined ? '?' : (ix.teacherById.get(lesson.teacherId)?.short ?? '?');
  return `${group} · ${teacher}`;
}

export function swapDoneNotice(ix: Index, source: BlockRef, target: BlockRef): string {
  return t('{bir} ile {iki} yer değiştirdi', {
    bir: blockName(ix, source),
    iki: blockName(ix, target),
  });
}

export interface SwapResult {
  state: State;
  warning: string;
}

/** Re-validates and applies a reciprocal move against the state handed to it. */
export function swapBlocks(d: State, source: BlockRef, target: BlockRef): SwapResult | null {
  if (!sameBlock(d, source) || !sameBlock(d, target)) return null;
  if (
    blockPinned(d, source.classId, source.day, source.hour) ||
    blockPinned(d, target.classId, target.day, target.hour)
  ) return null;

  const sourceLesson = d.lessons.find((x) => x.id === source.lessonId);
  const targetLesson = d.lessons.find((x) => x.id === target.lessonId);
  if (sourceLesson === undefined || targetLesson === undefined) return null;

  let work = liftBlock(d, source.classId, source.day, source.hour);
  work = liftBlock(work, target.classId, target.day, target.hour);

  const first = check(work, buildIndex(work), source.lessonId, target.day, target.hour, source.size);
  if (first.blocked !== null) return null;
  work = place(work, source.lessonId, target.day, target.hour, source.size);

  const second = check(work, buildIndex(work), target.lessonId, source.day, source.hour, target.size);
  if (second.blocked !== null) return null;
  work = place(work, target.lessonId, source.day, source.hour, target.size);

  const ix = buildIndex(d);
  const notice = t('{bir} ile {iki} yer değiştirecek', {
    bir: blockName(ix, source),
    iki: blockName(ix, target),
  });
  const ruleWarning = first.warning ?? second.warning;
  return { state: work, warning: ruleWarning === null ? notice : `${notice} · ${ruleWarning}` };
}

export function dropMap(
  d: State,
  ix: Index,
  lessonId: Id,
  size?: number,
  source: BlockRef | null = null,
): Map<string, DropVerdict> {
  const map = new Map<string, DropVerdict>();
  const original = d;
  const originalIx = ix;
  if (source !== null) {
    d = liftBlock(d, source.classId, source.day, source.hour);
    ix = buildIndex(d);
  }
  const lesson = ix.lessonById.get(lessonId);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  // One working copy for the whole pass; `vacate`/`occupy` write into it and
  // put it back, so `d` itself is never touched. The INDEX is copied too, and
  // not for tidiness: `ix` is the caller's memoised object, shared with every
  // render, and a vacate that was not followed by its occupy would leave it
  // lying about who is busy. Copying costs one pass over ~1800 entries, once —
  // the thing being avoided is doing that 72 times.
  const work: State = replaceActiveGrid(d, { placements: { ...activePlacements(d) } });
  const workIx: Index = {
    ...ix,
    teacherBusy: new Map(ix.teacherBusy),
    roomBusy: new Map(ix.roomBusy),
    placedHours: new Map(ix.placedHours),
  };

  // Every occupied hour of the target class points at its whole block. The old
  // inner loop called blockAt() for every candidate cell; blockAt() then found
  // a lesson and reconstructed that lesson's whole week each time. Build the
  // same answer once per drag instead.
  const occupied = new Map<string, { lesson: Lesson; hour: number; size: number }>();
  if (lesson !== undefined) {
    for (const occupant of d.lessons) {
      if (occupant.classId !== lesson.classId) continue;
      for (const block of placedBlocks(d, occupant)) {
        for (let i = 0; i < block.size; i++) {
          occupied.set(`${block.day}|${block.hour + i}`, {
            lesson: occupant,
            hour: block.hour,
            size: block.size,
          });
        }
      }
    }
  }

  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      const key = `${g}|${s}`;
      const detail = blockerDetail(d, ix, lessonId, g, s, size);
      const plain = verdictAfterBlocker(d, ix, lessonId, g, s, size, detail);
      if (source !== null && lesson !== undefined) {
        const candidates = targetBlocks(
          original,
          originalIx,
          lesson,
          source,
          g,
          s,
          blockSizeFor(d, lesson, size),
        );
        if (candidates.length === 1) {
          const target = candidates[0]!;
          const swap = swapBlocks(original, source, target);
          if (swap !== null) {
            map.set(key, {
              blocked: null,
              warning: swap.warning,
              evicts: [],
              action: { kind: 'swap', target },
            });
            continue;
          }
        }
      }
      if (plain.blocked === null || lesson === undefined) {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
        continue;
      }

      if (detail === null || detail.code !== 'classBusy') {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
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
        const found = occupied.get(`${g}|${s + i}`);
        if (found === undefined) continue;
        const mark = `${found.lesson.id}|${found.hour}`;
        if (seen.has(mark)) continue;
        seen.add(mark);
        heads.push(found);
      }

      if (heads.length === 0) {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
        continue;
      }

      // A PINNED block is not evicted. Eviction is the one refusal a drop may
      // overrule, and a pin is the reader saying "not this one" about exactly
      // that: without this the lock would hold against the mouse, the keyboard
      // and the solver, and then quietly lose to a card dropped on top of it.
      const locked = heads.find(
        (h) => activePinned(d)[placementKey(lesson.classId, g, h.hour)] !== undefined,
      );
      if (locked !== undefined) {
        map.set(key, {
          blocked: t('{sinif} sınıfının {gun} {saat} saatindeki ders sabitlenmiş', {
            sinif: ix.classById.get(lesson.classId)?.name ?? '?',
            gun: d.settings.days[g]?.name ?? `${g + 1}`,
            saat: d.settings.hours[locked.hour] ?? `${locked.hour + 1}`,
          }),
          warning: null,
          evicts: [],
          action: { kind: 'place' },
        });
        continue;
      }

      for (const h of heads) {
        vacate(activePlacements(work), workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }
      const after = check(work, workIx, lessonId, g, s, size);
      for (const h of heads) {
        occupy(activePlacements(work), workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }

      if (after.blocked !== null) {
        // Evicting did not help: the cell is refused for its own reason, and
        // the sentence the reader gets is that reason, not "class is busy".
        map.set(key, { ...after, evicts: [], action: { kind: 'place' } });
        continue;
      }

      const evicted = heads.map((h) => ({
        lessonId: h.lesson.id,
        classId: h.lesson.classId,
        day: g,
        hour: h.hour,
        size: h.size,
      }));
      map.set(key, {
        blocked: null,
        warning: after.warning ?? evictionNotice(ix, heads.map((h) => h.lesson)),
        evicts: heads.map((h) => h.lesson.id),
        action: { kind: 'evict', blocks: evicted },
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
    return `${group} · ${teacher}`;
  });
  return names.length === 1
    ? t('{ders} dersi havuza dönecek', { ders: names[0]! })
    : t('{dersler} dersleri havuza dönecek', { dersler: names.join(', ') });
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

export interface DropRequest {
  lessonId: Id;
  size: number;
  source: BlockRef | null;
  day: number;
  hour: number;
  action: DropAction;
}

/**
 * Commits the answer shown during a drag, but trusts none of its old grid
 * contents. React may hand the reducer a newer state, so every referenced
 * block and every constraint is checked again before one placement changes.
 */
export function applyDrop(d: State, request: DropRequest): State {
  if (request.action.kind === 'swap') {
    if (request.source === null) return d;
    return swapBlocks(d, request.source, request.action.target)?.state ?? d;
  }

  let next = d;
  if (request.source !== null) {
    if (!sameBlock(next, request.source)) return d;
    if (blockPinned(next, request.source.classId, request.source.day, request.source.hour)) return d;
    next = liftBlock(next, request.source.classId, request.source.day, request.source.hour);
  }

  if (request.action.kind === 'evict') {
    for (const target of request.action.blocks) {
      if (!sameBlock(next, target)) return d;
      if (blockPinned(next, target.classId, target.day, target.hour)) return d;
    }
    for (const target of request.action.blocks) {
      next = liftBlock(next, target.classId, target.day, target.hour);
    }
  }

  const verdict = check(
    next,
    buildIndex(next),
    request.lessonId,
    request.day,
    request.hour,
    request.size,
  );
  return verdict.blocked === null
    ? place(next, request.lessonId, request.day, request.hour, request.size)
    : d;
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
  const placements = activePlacements(d);
  for (const key in placements) {
    if (placements[key] === lessonId) n++;
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

  const placements = activePlacements(d);
  for (const key in placements) {
    const lessonId = placements[key];
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

    const dayName = dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
    const hourName = d.settings.hours[hour] ?? `${hour + 1}`;
    const when = t('{gun} {saat} saatinde', { gun: dayName, saat: hourName });

    let reason: string | null = null;
    if (d.unavailable[closedKey(teacher.id, day, hour)] !== undefined) {
      reason = t('{kim} {ne_zaman} müsait değil', { kim: teacher.short, ne_zaman: when });
    } else if (d.unavailable[closedKey(group.id, day, hour)] !== undefined) {
      reason = t('{sinif} sınıfı {ne_zaman} kapalı', { sinif: group.name, ne_zaman: when });
    } else if (
      group.roomId != null &&
      d.unavailable[closedKey(group.roomId, day, hour)] !== undefined
    ) {
      const roomName = ix.roomById.get(group.roomId)?.name ?? '?';
      reason = t('{derslik} dersliği {ne_zaman} kapalı', { derslik: roomName, ne_zaman: when });
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

  // …and lessons whose SPLIT no longer fits their hours. Nothing else validates
  // block geometry — `blocks` comes out of a backup file raw — and a list that
  // outruns the hours would make `blockPlan` and `placedBlocks` disagree about
  // how many blocks exist.
  //
  // The same pass clears an ORPHAN `second` flag: a lesson marked "taught under
  // the teacher's second subject" whose teacher no longer HAS a second subject.
  // That happens the moment somebody empties the box, and left alone the lesson
  // would keep claiming a subject nobody teaches — the same shape of orphan as
  // a placement pointing at a deleted lesson, and it is cleaned in the same
  // place for the same reason.
  const twoSubjects = new Set(d.teachers.filter(hasTwoSubjects).map((t) => t.id));
  const lessons = kept.map((x) => {
    const blocks = clampBlocks(x.weeklyHours, x.blocks);
    const second = x.second && twoSubjects.has(x.teacherId);
    const sameBlocks =
      Array.isArray(x.blocks) &&
      blocks.length === x.blocks.length &&
      blocks.every((b, i) => b === x.blocks[i]);
    if (sameBlocks && second === x.second) return x;
    changed = true;
    return { ...x, blocks, second };
  });
  const lessonById = new Map(lessons.map((x) => [x.id, x]));

  // Every alternative grid is cleaned against the ONE shared school model.
  // A deleted teacher/class/lesson therefore cannot leave an orphan in a
  // program that happened not to be open when the edit was made.
  const seenIds = new Set<Id>();
  const seenNames = new Set<string>();
  const sourcePrograms = Array.isArray(d.programs) && d.programs.length > 0
    ? d.programs
    : [blankProgram()];
  if (sourcePrograms !== d.programs) changed = true;

  const programs = sourcePrograms.map((program, index) => {
    let programChanged = false;
    let id = typeof program.id === 'string' ? program.id.trim() : '';
    if (id === '' || seenIds.has(id)) {
      const base = `program-${index + 1}`;
      id = base;
      let suffix = 2;
      while (seenIds.has(id)) id = `${base}-${suffix++}`;
      programChanged = true;
    }
    seenIds.add(id);

    let name = typeof program.name === 'string' ? program.name.trim() : '';
    if (name === '') {
      name = `Program ${index + 1}`;
      programChanged = true;
    }
    const baseName = name;
    let nameKey = name.toLocaleLowerCase('tr');
    let suffix = 2;
    while (seenNames.has(nameKey)) {
      name = `${baseName} (${suffix++})`;
      nameKey = name.toLocaleLowerCase('tr');
      programChanged = true;
    }
    seenNames.add(nameKey);

    const placements: Record<string, Id> = {};
    for (const key in program.placements) {
      const lessonId = program.placements[key];
      if (lessonId === undefined) continue;

      const parts = key.split('|');
      const classId = parts[0];
      const day = Number(parts[1]);
      const hour = Number(parts[2]);
      const lesson = lessonById.get(lessonId);
      if (
        parts.length !== 3 ||
        classId === undefined ||
        lesson === undefined ||
        lesson.classId !== classId ||
        !Number.isInteger(day) ||
        day < 0 ||
        day >= dayCount ||
        !Number.isInteger(hour) ||
        hour < 0 ||
        hour >= hourCount
      ) {
        programChanged = true;
        continue;
      }
      placements[key] = lessonId;
    }

    const pinned: Record<string, 1> = {};
    for (const key in program.pinned) {
      if (placements[key] === undefined) {
        programChanged = true;
        continue;
      }
      pinned[key] = 1;
    }

    if (!programChanged) {
      const samePlacements =
        Object.keys(placements).length === Object.keys(program.placements).length;
      const samePins = Object.keys(pinned).length === Object.keys(program.pinned).length;
      if (samePlacements && samePins) return program;
    }
    changed = true;
    return { id, name, placements, pinned };
  });

  const activeProgramId = programs.some((program) => program.id === d.activeProgramId)
    ? d.activeProgramId
    : programs[0]!.id;
  if (activeProgramId !== d.activeProgramId) changed = true;

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
  return { ...d, classes, lessons, unavailable, programs, activeProgramId };
}

export type PinScope =
  | { kind: 'all' }
  | { kind: 'row'; view: View; rowId: Id }
  | { kind: 'day'; day: number }
  | { kind: 'column'; day: number; hour: number };

/** Every CELL of every whole block touched by a bulk pin scope. */
export function pinScopeCells(d: State, scope: PinScope): string[] {
  const cells = new Set<string>();
  for (const lesson of d.lessons) {
    for (const block of placedBlocks(d, lesson)) {
      const matches =
        scope.kind === 'all' ||
        (scope.kind === 'day' && scope.day === block.day) ||
        (scope.kind === 'column' &&
          scope.day === block.day &&
          scope.hour >= block.hour &&
          scope.hour < block.hour + block.size) ||
        (scope.kind === 'row' &&
          (scope.view === 'class'
            ? scope.rowId === lesson.classId
            : scope.rowId === lesson.teacherId));
      if (!matches) continue;
      for (let offset = 0; offset < block.size; offset++) {
        const key = placementKey(lesson.classId, block.day, block.hour + offset);
        cells.add(key);
      }
    }
  }
  return [...cells];
}

/** Toggle policy: all pinned -> clear all; otherwise pin all. One state change. */
export function togglePinScope(d: State, scope: PinScope): State {
  const cells = pinScopeCells(d, scope);
  if (cells.length === 0) return d;
  const current = activePinned(d);
  const on = !cells.every((key) => current[key] !== undefined);
  const pinned = { ...current };
  for (const key of cells) {
    if (on) pinned[key] = 1;
    else delete pinned[key];
  }
  return replaceActiveGrid(d, { pinned });
}
