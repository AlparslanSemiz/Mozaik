// Why a run is stuck when no order of the cards could help: somebody's lessons
// outnumber their open hours, or two lessons that may not share a day need
// more days between them than the week has. A PURE module, tested in
// shortfall.test.ts.
//
// WHY. The stuck sentence used to be `blocker()`'s verdict on one cell — "MÇ
// Perşembe 6 saatinde müsait değil" — when the reason was that MÇ teaches 18
// hours and is open for 15. That sends the reader to one hour of one day, and
// opening it is not enough (audit 2026-11-16). The shortfall is the sentence
// that says what to do and how much of it.

import { t } from '../../leaf/i18n';
import { closedKey, placementKey, type Id, type Lesson, type State } from '../../leaf/model';
import { lessonLimit, ruleLevel, relatedName, type Index } from '../constraints';
import { activePlacements } from '../grid';
import { lessonExcluded, type SolverExclusions } from '../program';

function excludedDays(d: State, exclusions: SolverExclusions): (day: number) => boolean {
  const names = new Set(exclusions.dayNames);
  return (day) => {
    const name = d.settings.days[day]?.name;
    return name !== undefined && names.has(name);
  };
}

/**
 * Every teacher, class and room whose lessons this run has to place outnumber
 * the hours it has open on the days the run may use: id -> the sentence.
 */
export function shortfalls(d: State, exclusions: SolverExclusions): Map<Id, string> {
  const out = new Map<Id, string>();
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const excluded = excludedDays(d, exclusions);
  const placements = activePlacements(d);

  /**
   * One row: the hours of `lessons` the run has to find a place for, against
   * the hours on which none of `closers` is closed. A daily limit is not
   * counted; where one binds, the lesson's own ceiling sentence says so.
   */
  const check = (
    id: Id,
    lessons: Lesson[],
    closers: Array<Id | null>,
    say: (load: number, open: number) => string,
  ) => {
    let load = 0;
    for (const lesson of lessons) {
      if (lessonExcluded(lesson, exclusions)) continue;
      load += lesson.weeklyHours;
      // Hours already on an excluded day stay there and are not owed.
      for (let day = 0; day < dayCount; day++) {
        for (let h = 0; h < hourCount && excluded(day); h++) {
          if (placements[placementKey(lesson.classId, day, h)] === lesson.id) load--;
        }
      }
    }
    let open = 0;
    for (let day = 0; day < dayCount; day++) {
      for (let h = 0; h < hourCount && !excluded(day); h++) {
        if (closers.every((c) => c == null || d.unavailable[closedKey(c, day, h)] === undefined)) {
          open++;
        }
      }
    }
    if (load > open) out.set(id, say(load, open));
  };

  for (const x of d.teachers) {
    check(
      x.id,
      d.lessons.filter((l) => l.teacherId === x.id),
      [x.id],
      (yuk, acik) =>
        t('{kim}: {yuk} saat ders, {acik} müsait saat; {fazla} saat açılmalı', {
          kim: x.short,
          yuk,
          acik,
          fazla: yuk - acik,
        }),
    );
  }
  for (const x of d.classes) {
    check(
      x.id,
      d.lessons.filter((l) => l.classId === x.id),
      [x.id, x.roomId],
      (yuk, acik) =>
        t('{sinif}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı', {
          sinif: x.name,
          yuk,
          acik,
          fazla: yuk - acik,
        }),
    );
  }
  // A room only when it is SHARED: one class's room closing is already in
  // that class's own open hours above.
  for (const x of d.rooms) {
    const sharing = new Set(d.classes.filter((c) => c.roomId === x.id).map((c) => c.id));
    if (sharing.size < 2) continue;
    check(
      x.id,
      d.lessons.filter((l) => sharing.has(l.classId)),
      [x.id],
      (yuk, acik) =>
        t(
          '{derslik} dersliği: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı ya da bir sınıf başka dersliğe geçmeli',
          { derslik: x.name, yuk, acik, fazla: yuk - acik },
        ),
    );
  }
  return out;
}

/**
 * A "aynı gün olmasın" pair that cannot hold on this week: each lesson fits on
 * the days open to it, but the two need more days between them than there
 * are. The fewest days a lesson needs is its hours over its daily limit (the
 * "aynı ders günde en fazla" rule, where it blocks), and one day without one.
 */
export function bindingPair(
  d: State,
  ix: Index,
  lessonId: Id,
  exclusions: SolverExclusions,
): string | null {
  const lesson = ix.lessonById.get(lessonId);
  if (lesson === undefined) return null;
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const excluded = excludedDays(d, exclusions);

  const days = (x: Lesson): Set<number> => {
    const roomId = ix.classById.get(x.classId)?.roomId ?? null;
    const out = new Set<number>();
    for (let day = 0; day < dayCount; day++) {
      if (excluded(day)) continue;
      for (let h = 0; h < hourCount; h++) {
        if (
          d.unavailable[closedKey(x.classId, day, h)] === undefined &&
          d.unavailable[closedKey(x.teacherId, day, h)] === undefined &&
          (roomId == null || d.unavailable[closedKey(roomId, day, h)] === undefined)
        ) {
          out.add(day);
          break;
        }
      }
    }
    return out;
  };
  const placements = activePlacements(d);
  const need = (x: Lesson): number => {
    const limit = lessonLimit(d, x);
    const capped = ruleLevel(d, 'maxSameLessonPerDay') === 'block' && limit > 0;
    // Hours already on an excluded day stay there and need no day of their own.
    let hours = x.weeklyHours;
    for (let day = 0; day < dayCount; day++) {
      for (let h = 0; h < hourCount && excluded(day); h++) {
        if (placements[placementKey(x.classId, day, h)] === x.id) hours--;
      }
    }
    if (hours <= 0) return 0;
    return capped ? Math.ceil(hours / limit) : 1;
  };

  const mine = days(lesson);
  const n1 = need(lesson);
  for (const otherId of ix.notSameDay.get(lesson.id) ?? []) {
    const other = ix.lessonById.get(otherId);
    if (other === undefined) continue;
    const theirs = days(other);
    const n2 = need(other);
    // Alone each fits; only together they do not: the pair is the cause.
    if (n1 > mine.size || n2 > theirs.size) continue;
    const both = new Set([...mine, ...theirs]).size;
    if (n1 + n2 <= both) continue;
    return t('{bir} ile {iki} aynı güne konmamalı: {n1} + {n2} gün gerekiyor, {g} gün var', {
      bir: relatedName(d, ix, lesson),
      iki: relatedName(d, ix, other),
      n1,
      n2,
      g: both,
    });
  }
  return null;
}
