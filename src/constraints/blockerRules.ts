// WHY a cell refuses a lesson, in one sentence the reader can act on.
//
// The message is NEVER "there is a clash": this sentence decides the next move
// of whoever builds the timetable, so it names the day, the hour and who is
// standing in the way. blocker() and check() share limitBreaches(), so the
// enforced rules and the warned ones can never drift apart.

import { t } from '../i18n';
import { closedKey, placementKey, teacherKey } from '../keys';
// A leaf BELOW this file, on purpose: these sentences name a day and a subject,
// and both have to reach the screen in the interface language.
import { dayLabel, subjectLabel } from '../names';
import { blockSizeFor, type Index } from './placement';
import { activePlacements } from '../programs';
import {
  lessonDayCount,
  lessonLimit,
  limitFor,
  ruleActive,
  ruleLevel,
  runLength,
  teacherDayCount,
} from '../rules';
import type { ClassGroup, Lesson, RuleName, State, Id, Teacher } from '../types';

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
export function verdictAfterBlocker(
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
