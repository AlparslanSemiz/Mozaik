// Soft rules: the limit boxes my father fills in (max consecutive, max/min per
// day, max hours of one lesson per day, gap between lessons). PURE functions,
// every export tested.
//
// A limit of 0 means "no limit" — EXCEPT the two gap rules (maxGapsTeacher /
// maxGapsClass, v14), where 0 is a real, commonly-wanted number ("no gaps at
// all") and `gapRuleActive` decides activity from the level alone. Documented
// on `Limits` itself (types.ts) and re-said here because it is the one
// exception a reader of this file would otherwise assume away.
//
// A teacher's own box may be null, which means "use the school-wide default"
// — so nothing has to be typed 25 times.
//
// Only the TYPE Index comes from constraints.ts (erased at compile time), so
// there is no runtime import cycle.

import { t } from '../i18n';
import { dayLabel } from './names';
import type { Index } from '../constraints';
import { closedKey, placementKey } from '../keys';
import { activePlacements } from '../programs';
import type { ClassGroup, Id, Lesson, RuleLevel, RuleName, State, Teacher } from '../types';

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

/**
 * Max hours of ONE lesson on one day. THREE layers, narrowest first: the
 * lesson's own box, then the CLASS's, then the school-wide default.
 *
 * The class layer is the one that could not be said before. The school number
 * is one number for everybody and a lesson's box is one number per
 * teacher-and-class pair, so "510 should never see the same subject twice in a
 * day" had to be typed into every one of that class's lessons — and typed again
 * into every lesson added afterwards.
 *
 * `group` is optional and LAST (pitfall 76): every caller that predates it goes
 * on compiling, and the hot ones — `limitBreaches`, `findViolations` — already
 * hold the class and hand it over rather than paying for a lookup per call.
 */
export function lessonLimit(d: State, lesson: Lesson | undefined, group?: ClassGroup): number {
  const cls = group ?? d.classes.find((c) => c.id === lesson?.classId);
  const own = lesson?.maxPerDay ?? cls?.maxSameLessonPerDay;
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

/**
 * The gap rules' own version of `ruleActive`. They do NOT require `limit > 0`:
 * 0 is a real answer here ("no gaps at all"), not "no limit" — types.ts says so
 * on `Limits` itself. Whether the rule bites is decided by the level alone.
 */
export function gapRuleActive(d: State, key: 'maxGapsTeacher' | 'maxGapsClass'): boolean {
  return ruleLevel(d, key) !== 'off';
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
    if (activePlacements(d)[placementKey(lesson.classId, day, h)] === lesson.id) n++;
  }
  return n;
}

// ---------------------------------------------------------------------- gaps
//
// A GAP (boşluk, pencere) is a free hour with a busy hour on BOTH sides of it,
// on one day. The edges are deliberately not gaps: an empty first period is a
// late start and an empty last period is an early finish, and neither is what
// anybody complains about. Somebody who comes in at 09:00, teaches, waits an
// hour doing nothing and teaches again is.
//
// ONE definition, three readers: the teacher rule, the class rule, and
// `gridQuality()` in worlds.ts, which is how the solver's output is measured.
// Two definitions of "gap" would be two different truths about the same week.

/** The primitive. `isBusy(hour)` answers for one day. */
export function gapsBetween(isBusy: (hour: number) => boolean, hourCount: number): number {
  let first = -1;
  let last = -1;
  for (let h = 0; h < hourCount; h++) {
    if (!isBusy(h)) continue;
    if (first < 0) first = h;
    last = h;
  }
  if (first < 0) return 0;

  let gaps = 0;
  for (let h = first + 1; h < last; h++) if (!isBusy(h)) gaps++;
  return gaps;
}

/** Free hours between this teacher's first and last lesson on one day. */
export function teacherDayGaps(
  ix: Index,
  teacherId: Id,
  day: number,
  hourCount: number,
): number {
  return gapsBetween((h) => busy(ix, teacherId, day, h), hourCount);
}

/** Free hours between this class's first and last lesson on one day. */
export function classDayGaps(
  d: State,
  classId: Id,
  day: number,
  hourCount: number,
): number {
  const placements = activePlacements(d);
  return gapsBetween(
    (h) => placements[placementKey(classId, day, h)] !== undefined,
    hourCount,
  );
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
      const when = t('{kim} {gun} günü', {
        kim: teacher.short,
        gun: dayLabel(dayInfo.name),
      });

      if (ruleActive(d, 'maxPerDay', maxDay) && count > maxDay) {
        out.push({
          key: `${teacher.id}|${day}|maxPerDay`,
          rule: 'maxPerDay',
          level: ruleLevel(d, 'maxPerDay'),
          message: t('{kim_gun} {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.', {
            kim_gun: when,
            olan: count,
            sinir: maxDay,
          }),
        });
      }
      if (ruleActive(d, 'minPerDay', minDay) && count < minDay) {
        out.push({
          key: `${teacher.id}|${day}|minPerDay`,
          rule: 'minPerDay',
          level: ruleLevel(d, 'minPerDay'),
          message: t('{kim_gun} sadece {olan} saat ders veriyor, en az {sinir} saat isteniyor.', {
            kim_gun: when,
            olan: count,
            sinir: minDay,
          }),
        });
      }
      if (ruleActive(d, 'maxConsecutive', maxRun)) {
        const run = longestRun(ix, teacher.id, day, hourCount);
        if (run > maxRun) {
          out.push({
            key: `${teacher.id}|${day}|maxConsecutive`,
            rule: 'maxConsecutive',
            level: ruleLevel(d, 'maxConsecutive'),
            message: t(
              '{kim_gun} art arda {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.',
              { kim_gun: when, olan: run, sinir: maxRun },
            ),
          });
        }
      }
    }
  }

  for (const lesson of d.lessons) {
    const group = ix.classById.get(lesson.classId);
    const limit = lessonLimit(d, lesson, group);
    if (!ruleActive(d, 'maxSameLessonPerDay', limit)) continue;
    const teacher = ix.teacherById.get(lesson.teacherId);

    for (const [day, dayInfo] of d.settings.days.entries()) {
      const count = lessonDayCount(d, lesson, day, hourCount);
      if (count <= limit) continue;
      out.push({
        key: `${lesson.id}|${day}|maxSameLessonPerDay`,
        rule: 'maxSameLessonPerDay',
        level: ruleLevel(d, 'maxSameLessonPerDay'),
        message: t(
          '{sinif} sınıfı {gun} günü {kim} dersinden {olan} saat görüyor, en fazla {sinir} saat isteniyor.',
          {
            sinif: group?.name ?? '?',
            gun: dayLabel(dayInfo.name),
            kim: teacher?.short ?? '?',
            olan: count,
            sinir: limit,
          },
        ),
      });
    }
  }

  // Gap (boşluk) rules. Like minPerDay above, these can only ever be found
  // HERE: while a day is half-placed every hour still open reads as a gap, so
  // neither one could ever block a drop (types.ts, v14). `gapRuleActive` — not
  // `ruleActive` — because 0 is a real limit for these two, not "off".
  if (gapRuleActive(d, 'maxGapsTeacher')) {
    const limit = d.settings.limits.maxGapsTeacher;
    for (const teacher of d.teachers) {
      for (const [day, dayInfo] of d.settings.days.entries()) {
        const gaps = teacherDayGaps(ix, teacher.id, day, hourCount);
        if (gaps <= limit) continue;
        out.push({
          key: `${teacher.id}|${day}|maxGapsTeacher`,
          rule: 'maxGapsTeacher',
          level: ruleLevel(d, 'maxGapsTeacher'),
          message: t(
            '{kim} {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.',
            {
              kim: teacher.short,
              gun: dayLabel(dayInfo.name),
              olan: gaps,
              sinir: limit,
            },
          ),
        });
      }
    }
  }

  if (gapRuleActive(d, 'maxGapsClass')) {
    const limit = d.settings.limits.maxGapsClass;
    for (const group of d.classes) {
      for (const [day, dayInfo] of d.settings.days.entries()) {
        const gaps = classDayGaps(d, group.id, day, hourCount);
        if (gaps <= limit) continue;
        out.push({
          key: `${group.id}|${day}|maxGapsClass`,
          rule: 'maxGapsClass',
          level: ruleLevel(d, 'maxGapsClass'),
          message: t(
            '{sinif} sınıfı {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.',
            {
              sinif: group.name,
              gun: dayLabel(dayInfo.name),
              olan: gaps,
              sinir: limit,
            },
          ),
        });
      }
    }
  }

  return out;
}
