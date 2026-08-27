// Soft rules: the limit boxes my father fills in (max consecutive, max/min per
// day, max hours of one lesson per day). PURE functions, every export tested.
//
// A limit of 0 means "no limit". A teacher's own box may be null, which means
// "use the school-wide default" — so nothing has to be typed 25 times.
//
// Only the TYPE Index comes from constraints.ts (erased at compile time), so
// there is no runtime import cycle.

import type { Index } from './constraints';
import { closedKey, placementKey } from './keys';
import type { Id, Lesson, RuleLevel, RuleName, State, Teacher } from './types';

export interface Violation {
  key: string; // stable-ish key for React lists
  level: RuleLevel;
  message: string;
  /**
   * WHICH rule this came from — a code, not the sentence.
   *
   * Pitfall 22, in its second home: the message carries a teacher, a day and
   * two numbers, so counting messages counts days rather than rules. Anything
   * that groups violations groups on this. It is also already in `key`, but a
   * caller that split that string would be parsing a React key.
   */
  rule: RuleName;
}

/** The limit that actually applies: the teacher's own box, else the default. */
export function limitFor(
  d: State,
  teacher: Teacher | undefined,
  key: 'maxConsecutive' | 'maxPerDay' | 'minPerDay',
): number {
  const own = teacher?.limits[key];
  const value = own == null ? d.settings.limits[key] : own;
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

/** Max hours of ONE lesson on one day: the lesson's own box, else the default. */
export function lessonLimit(d: State, lesson: Lesson | undefined): number {
  const own = lesson?.maxPerDay;
  const value = own == null ? d.settings.limits.maxSameLessonPerDay : own;
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export function ruleLevel(d: State, key: RuleName): RuleLevel {
  return d.settings.rules[key] ?? 'off';
}

/** Is this rule switched on AND does it have a usable number behind it? */
export function ruleActive(d: State, key: RuleName, limit: number): boolean {
  return limit > 0 && ruleLevel(d, key) !== 'off';
}

// ------------------------------------------------------------------ counting

const busy = (ix: Index, teacherId: Id, day: number, hour: number): boolean =>
  ix.teacherBusy.has(closedKey(teacherId, day, hour));

/**
 * How long the consecutive run WOULD be if [hour, hour+block) were filled.
 *
 * The neighbours on both sides count: dropping a 2-hour block next to an hour
 * that is already taken makes a run of 3, and the "at most 2 in a row" limit
 * has to notice that.
 */
export function runLength(
  ix: Index,
  teacherId: Id,
  day: number,
  hour: number,
  block: number,
  hourCount: number,
): number {
  let n = block;
  for (let h = hour - 1; h >= 0 && busy(ix, teacherId, day, h); h--) n++;
  for (let h = hour + block; h < hourCount && busy(ix, teacherId, day, h); h++) n++;
  return n;
}

/** The longest run the teacher ALREADY has on that day. */
export function longestRun(
  ix: Index,
  teacherId: Id,
  day: number,
  hourCount: number,
): number {
  let best = 0;
  let current = 0;
  for (let h = 0; h < hourCount; h++) {
    current = busy(ix, teacherId, day, h) ? current + 1 : 0;
    if (current > best) best = current;
  }
  return best;
}

export function teacherDayCount(
  ix: Index,
  teacherId: Id,
  day: number,
  hourCount: number,
): number {
  let n = 0;
  for (let h = 0; h < hourCount; h++) if (busy(ix, teacherId, day, h)) n++;
  return n;
}

export function lessonDayCount(
  d: State,
  lesson: Lesson,
  day: number,
  hourCount: number,
): number {
  let n = 0;
  for (let h = 0; h < hourCount; h++) {
    if (d.placements[placementKey(lesson.classId, day, h)] === lesson.id) n++;
  }
  return n;
}

// ---------------------------------------------------------------- violations

/**
 * Rules broken by the timetable AS IT IS. Used by the Kontrol tab.
 *
 * `minPerDay` can only ever be found here: while placing, the first lesson of a
 * day always breaches "at least 2 hours", so it can never block a drop.
 */
export function findViolations(d: State, ix: Index): Violation[] {
  const out: Violation[] = [];
  const hourCount = d.settings.hours.length;

  for (const teacher of d.teachers) {
    const maxDay = limitFor(d, teacher, 'maxPerDay');
    const minDay = limitFor(d, teacher, 'minPerDay');
    const maxRun = limitFor(d, teacher, 'maxConsecutive');

    for (const [day, dayInfo] of d.settings.days.entries()) {
      const count = teacherDayCount(ix, teacher.id, day, hourCount);
      if (count === 0) continue; // a free day is not a breach
      const when = `${teacher.short} ${dayInfo.name} günü`;

      if (ruleActive(d, 'maxPerDay', maxDay) && count > maxDay) {
        out.push({
          key: `${teacher.id}|${day}|maxPerDay`,
          rule: 'maxPerDay',
          level: ruleLevel(d, 'maxPerDay'),
          message: `${when} ${count} saat ders veriyor, en fazla ${maxDay} saat isteniyor.`,
        });
      }
      if (ruleActive(d, 'minPerDay', minDay) && count < minDay) {
        out.push({
          key: `${teacher.id}|${day}|minPerDay`,
          rule: 'minPerDay',
          level: ruleLevel(d, 'minPerDay'),
          message: `${when} sadece ${count} saat ders veriyor, en az ${minDay} saat isteniyor.`,
        });
      }
      if (ruleActive(d, 'maxConsecutive', maxRun)) {
        const run = longestRun(ix, teacher.id, day, hourCount);
        if (run > maxRun) {
          out.push({
            key: `${teacher.id}|${day}|maxConsecutive`,
            rule: 'maxConsecutive',
            level: ruleLevel(d, 'maxConsecutive'),
            message: `${when} art arda ${run} saat ders veriyor, en fazla ${maxRun} saat isteniyor.`,
          });
        }
      }
    }
  }

  for (const lesson of d.lessons) {
    const limit = lessonLimit(d, lesson);
    if (!ruleActive(d, 'maxSameLessonPerDay', limit)) continue;
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);

    for (const [day, dayInfo] of d.settings.days.entries()) {
      const count = lessonDayCount(d, lesson, day, hourCount);
      if (count <= limit) continue;
      out.push({
        key: `${lesson.id}|${day}|maxSameLessonPerDay`,
        rule: 'maxSameLessonPerDay',
        level: ruleLevel(d, 'maxSameLessonPerDay'),
        message:
          `${group?.name ?? '?'} sınıfı ${dayInfo.name} günü ${teacher?.short ?? '?'} ` +
          `dersinden ${count} saat görüyor, en fazla ${limit} saat isteniyor.`,
      });
    }
  }

  return out;
}
