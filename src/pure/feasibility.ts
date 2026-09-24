// Feasibility check (v0.5). PURE functions.
//
// The thing aSc does not do and that hurts most at the school: saying WHY a
// timetable cannot be built. It comes before a solver because it is far
// cheaper and far more useful.

import { t } from '../leaf/i18n';
import {
  blockerDetail,
  buildIndex,
  closedConflicts,
  closedKey,
  pendingBlocks,
} from './constraints';
import type { BlockCode, Index } from './constraints';
import { activePlacements } from './programs';
import { parseKey, placementKey } from '../leaf/keys';
import { findViolations } from './rules';
import type { Violation } from './rules';
import { blockPlan } from '../leaf/blocks';
import { dayLabel } from '../leaf/names';
import type { State, Id } from '../leaf/types';

/** Above this ratio of load the "this will be hard" warning is raised. */
const TIGHT_RATIO = 0.85;

export type Level = 'ok' | 'tight' | 'impossible';
export type LoadStatus = 'empty' | Level;

/** The same capacity ladder used by Kontrol, exposed for list filtering. */
export function capacityLevel(capacity: number, load: number): Level {
  if (load > capacity) return 'impossible';
  if (capacity > 0 && load > capacity * TIGHT_RATIO) return 'tight';
  return 'ok';
}

/** Zero load is useful to filter separately even though it is feasible. */
export function loadStatus(capacity: number, load: number): LoadStatus {
  return load === 0 ? 'empty' : capacityLevel(capacity, load);
}

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
  /** aSc's "Advisor" — data that will not BLOCK a build but is worth a look. */
  advice: Advice[];
  hasProblem: boolean;
}

/** "412 — AV Fizik": how a lesson is named wherever the user is told about it. */
export function lessonName(ix: Index, lessonId: Id): string {
  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  return `${group?.name ?? '?'} · ${teacher?.short ?? '?'} ${teacher?.subject ?? ''}`.trim();
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

  let reason = t('Boş yer kalmamış');
  let top = 0;
  for (const entry of counts.values()) {
    if (entry.count > top) {
      top = entry.count;
      reason = entry.message;
    }
  }
  return { reason, anyValid };
}

/**
 * Why the lesson does not go into the hours its class still has EMPTY.
 *
 * `commonestBlock` asks every cell of the week, and in a class whose open hours
 * exactly match its lessons that vote is won by the class's own closed hours:
 * the father's week said "410A SAY sınıfı Salı 1 saatinde kapalı" for every
 * stuck lesson, which is true, useless, and the one thing he never changes
 * (TODO B5.9). Here only the holes are asked: start cells where the whole
 * block would sit on open, empty class hours. What blocks those is a teacher,
 * a room or a rule, so the class's own walls (`classClosed`, `classBusy`,
 * `dayEnd`) cannot be the answer.
 *
 * When a hole does take the block, nothing blocks the lesson on its own. Either
 * the class has other lessons missing hours and the holes cannot hold them all
 * together (the father's 430E: three lessons short, and Türkçe alone fits the
 * Sunday 11–12 hole), or the search stopped before it got there. The sentence
 * says which, and names the hole. null only when the lesson or its class is
 * gone.
 */
export function holeReason(
  d: State,
  ix: Index,
  lessonId: Id,
  isExcludedDay: (day: number) => boolean = () => false,
): string | null {
  const lesson = ix.lessonById.get(lessonId);
  const group = lesson === undefined ? undefined : ix.classById.get(lesson.classId);
  if (lesson === undefined || group === undefined) return null;

  const placements = activePlacements(d);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const hole = (day: number, hour: number) =>
    placements[placementKey(group.id, day, hour)] === undefined &&
    d.unavailable[closedKey(group.id, day, hour)] === undefined &&
    (group.roomId == null || d.unavailable[closedKey(group.roomId, day, hour)] === undefined);

  const sizes = [...new Set(pendingBlocks(d, lesson))].sort((a, b) => b - a);
  const counts = new Map<BlockCode, { count: number; message: string }>();
  let holes = 0;
  for (let g = 0; g < dayCount; g++) {
    if (isExcludedDay(g)) continue;
    for (let s = 0; s < hourCount; s++) {
      if (hole(g, s)) holes++;
      for (const size of sizes) {
        if (s + size > hourCount) continue;
        let fits = true;
        for (let k = 0; k < size && fits; k++) fits = hole(g, s + k);
        if (!fits) continue;
        const found = blockerDetail(d, ix, lessonId, g, s, size);
        if (found === null) {
          const where = {
            gun: dayLabel(d.settings.days[g]?.name ?? t('{n}. gün', { n: g + 1 })),
            saat: d.settings.hours[s] ?? `${s + 1}`,
          };
          const siblings = d.lessons.some(
            (x) => x.id !== lessonId && x.classId === group.id && pendingBlocks(d, x).length > 0,
          );
          return siblings
            ? t(
                'Tek başına {gun} {saat} saatine sığıyor, sınıfın öbür eksik dersleriyle birlikte sığmıyor',
                where,
              )
            : t('{gun} {saat} saatine sığıyor, arama oraya varmadan durdu', where);
        }
        const seen = counts.get(found.code);
        if (seen === undefined) counts.set(found.code, { count: 1, message: found.message });
        else seen.count++;
      }
    }
  }

  if (counts.size === 0) {
    if (holes === 0) return t('{sinif} sınıfında boş açık saat kalmadı', { sinif: group.name });
    return t('Boş kalan saatler bu dersin {boy} saatlik bloğuna uymuyor', {
      boy: sizes[0] ?? 1,
    });
  }
  let reason = '';
  let top = 0;
  for (const entry of counts.values()) {
    if (entry.count > top) {
      top = entry.count;
      reason = entry.message;
    }
  }
  return reason;
}

export function buildCapacity(d: State): Capacity {
  const totalSlots = d.settings.days.length * d.settings.hours.length;

  // Closed hours per entity — one pass over the map. It holds teachers,
  // classes and rooms alike, and each id only ever means one of them.
  const closedCount = new Map<Id, number>();
  for (const key in d.unavailable) {
    const parts = parseKey(key);
    if (parts === null) continue;
    closedCount.set(parts.id, (closedCount.get(parts.id) ?? 0) + 1);
  }

  const teachers: ReportRow[] = d.teachers.map((x) => {
    const capacity = totalSlots - (closedCount.get(x.id) ?? 0);
    const load = d.lessons
      .filter((l) => l.teacherId === x.id)
      .reduce((sum, l) => sum + l.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const message =
      level === 'impossible'
        ? t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.', {
            kim: x.short,
            acik: capacity,
            yuk: load,
            fazla: load - capacity,
          })
        : level === 'tight'
          ? t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.', {
              kim: x.short,
              acik: capacity,
              yuk: load,
            })
          : t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.', {
              kim: x.short,
              acik: capacity,
              yuk: load,
            });
    // The NAME alone, since 2026-08-27: "Öğretmen yükü tarafında her öğretmen
    // için çok uzun satır. kısaltmayı gösterme orada." The short is not lost —
    // `message` still opens with it, and that is what the cell's tooltip shows
    // and what Kontrol prints. Rows for classes and rooms were never prefixed
    // this way, so the table is now consistent as well as shorter.
    return { id: x.id, name: x.name, capacity, load, level, message };
  });

  const classes: ReportRow[] = d.classes.map((c) => {
    const capacity = totalSlots - (closedCount.get(c.id) ?? 0);
    const load = d.lessons
      .filter((x) => x.classId === c.id)
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const message =
      level === 'impossible'
        ? t(
            '{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.',
            {
              sinif: c.name,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t('{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.', {
            sinif: c.name,
            acik: capacity,
            yuk: load,
          });
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
    const level = capacityLevel(capacity, load);
    const names = sharing.map((c) => c.name).join(', ');
    const message =
      level === 'impossible'
        ? t(
            '{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.',
            {
              derslik: r.name,
              n: sharing.length,
              hangileri: names,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t('{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.', {
            derslik: r.name,
            hangileri: names || t('sınıf yok'),
            acik: capacity,
            yuk: load,
          });
    return { id: r.id, name: r.name, capacity, load, level, message };
  });

  return { teachers, classes, rooms };
}

// ------------------------------------------------------------------ advice
//
// aSc's own "Advisor": data that will not BLOCK a build but is worth a
// second look, straight from `docs/asc/yardim/u60-verification.md`. Kept
// apart from `hasProblem` on purpose — aSc's own strip carries "Doğrulama"
// (this file's `unplaceable`/`violations`) and "Danışman" as two separate
// buttons (docs/ASC.md), and Kontrol's "Sorun görünmüyor" box answers the
// first question, not the second.

export interface Advice {
  key: string;
  /** WHICH aSc Advisor category this is — a code, not the sentence (pitfall 22). */
  code: 'lessonNeedsMoreDays' | 'teacherManyBlockedDays' | 'lessonManyBlocks';
  message: string;
}

/** How many of a school week's days are closed for this entity, start to end. */
function fullyClosedDayCount(d: State, entityId: Id, dayCount: number, hourCount: number): number {
  let closed = 0;
  for (let day = 0; day < dayCount; day++) {
    let allClosed = true;
    for (let h = 0; h < hourCount; h++) {
      if (d.unavailable[closedKey(entityId, day, h)] === undefined) {
        allClosed = false;
        break;
      }
    }
    if (allClosed) closed++;
  }
  return closed;
}

export function buildAdvice(d: State, ix: Index): Advice[] {
  const out: Advice[] = [];
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  // aSc: "More lessons than days" — a lesson asking for more separate blocks
  // than the week has days is guaranteed to land twice on at least one day.
  for (const lesson of d.lessons) {
    const plan = blockPlan(lesson);
    if (plan.length <= dayCount) continue;
    out.push({
      key: `lessonNeedsMoreDays|${lesson.id}`,
      code: 'lessonNeedsMoreDays',
      message: t(
        '{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.',
        { ders: lessonName(ix, lesson.id), n: plan.length, gun: dayCount },
      ),
    });
  }

  // aSc: "Teachers have many blocked days" — a teacher whose OPEN days are
  // fewer than what their heaviest lesson needs will see it land twice on a
  // day no matter how the week is arranged. A raw "closed ratio" would flag
  // every part-time teacher (normal at a dershane); this only flags the ones
  // that are actually squeezed.
  for (const teacher of d.teachers) {
    const teacherLessons = d.lessons.filter((l) => l.teacherId === teacher.id);
    if (teacherLessons.length === 0) continue;
    const openDays = dayCount - fullyClosedDayCount(d, teacher.id, dayCount, hourCount);
    const maxNeeded = Math.max(...teacherLessons.map((l) => blockPlan(l).length));
    if (openDays >= maxNeeded) continue;
    out.push({
      key: `teacherManyBlockedDays|${teacher.id}`,
      code: 'teacherManyBlockedDays',
      message: t(
        '{kim} yalnızca {acik} günde müsait ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.',
        { kim: teacher.short, acik: openDays, n: maxNeeded },
      ),
    });
  }

  // aSc: "Lessons of different length" — a lesson locked entirely into
  // multi-hour blocks, with no single hour left over, gives the solver only
  // one shape to try.
  for (const lesson of d.lessons) {
    const sum = lesson.blocks.reduce((a, b) => a + b, 0);
    if (lesson.blocks.length < 2 || sum !== lesson.weeklyHours) continue;
    out.push({
      key: `lessonManyBlocks|${lesson.id}`,
      code: 'lessonManyBlocks',
      message: t(
        '{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu.',
        { ders: lessonName(ix, lesson.id), n: lesson.blocks.length },
      ),
    });
  }

  return out;
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
      message: t('{n} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: {sebep}', {
        n: missing,
        sebep: summary.reason,
      }),
    });
  }

  const violations = findViolations(d, ix);
  const advice = buildAdvice(d, ix);

  const hasProblem =
    unplaceable.length > 0 ||
    violations.length > 0 ||
    [...teachers, ...classes, ...rooms].some((x) => x.level !== 'ok');

  return { teachers, classes, rooms, unplaceable, violations, advice, hasProblem };
}

// ------------------------------------------------------------------ health
//
// One line that says whether the timetable is in trouble, for a chip that is
// on screen in EVERY tab.
//
// Kontrol has always been able to answer this, and that was the problem: it is
// a destination, so answering "am I still all right?" meant leaving the grid,
// reading, and coming back. On a screen you spend a day in, a question that
// costs two navigations gets asked once at the start and then never again.
//
// It counts the three kinds of trouble the program already knows how to find,
// and it counts them by KIND rather than by sentence (pitfall 22): one teacher
// away all week produces sixty messages and is still one problem.

export interface Health {
  /** Rules broken at "Engelle" — the timetable is illegal as it stands. */
  blocked: number;
  /** Rules broken at "Uyar", plus capacity that will not fit. */
  warnings: number;
  /** Lessons still waiting in the pool. */
  pending: number;
  /** Lessons sitting on an hour that was closed afterwards (pitfall 16). */
  stranded: number;
  /**
   * ROWS in Kontrol's three problem panels — closed hours, rule breaches and
   * lessons with nowhere left to go.
   *
   * Deliberately not `blocked + warnings`: those two split the SAME violations
   * by level and then add capacity rows on top, which is the question the chip
   * asks ("how bad is it"). This one answers the strip's question ("how many
   * lines are there to read"), and it is computed here because `health()`
   * already has the report in its hand — a second `buildReport` in the ribbon
   * would be the third of that walk per change.
   */
  problems: number;
  /**
   * Rows in the Danışman (Advisor) view — data that will not block a build.
   * Deliberately NOT folded into `problems`, `warnings` or `level`: aSc keeps
   * "Doğrulama" and "Danışman" as two separate buttons, and this chip answers
   * the first question only.
   */
  advice: number;
  /** The loudest thing to say, for the chip's colour. */
  level: Level;
  /** The chip's own sentence. Never "there is a problem" — always which. */
  message: string;
}

export function health(d: State): Health {
  const ix = buildIndex(d);
  const report = buildReport(d);

  let blocked = 0;
  let warnings = 0;
  for (const v of report.violations) {
    if (v.level === 'block') blocked++;
    else warnings++;
  }
  // Capacity that cannot hold its load is a warning even when nothing has been
  // laid out yet: it is the one problem that is certain BEFORE any placement.
  // `Level` here is the capacity ladder: 'impossible' means the load cannot
  // fit at all, 'tight' means it barely does. Only the first is a problem.
  for (const row of [...report.teachers, ...report.classes, ...report.rooms]) {
    if (row.level === 'impossible') warnings++;
  }

  let pending = 0;
  for (const lesson of d.lessons) {
    pending += Math.max(0, lesson.weeklyHours - (ix.placedHours.get(lesson.id) ?? 0));
  }

  const stranded = closedConflicts(d, ix).length;

  const level: Level =
    blocked > 0 || stranded > 0 || report.unplaceable.length > 0
      ? 'impossible'
      : warnings > 0
        ? 'tight'
        : 'ok';

  // The sentence names the loudest thing and counts it. "Sorun var" would
  // send somebody to Kontrol to find out what; this tells them before they go.
  const parts: string[] = [];
  if (blocked > 0) parts.push(t('{n} kural ihlali', { n: blocked }));
  if (stranded > 0) parts.push(t('{n} ders kapalı saatte', { n: stranded }));
  if (report.unplaceable.length > 0)
    parts.push(t('{n} ders sığmıyor', { n: report.unplaceable.length }));
  if (warnings > 0) parts.push(t('{n} uyarı', { n: warnings }));
  if (pending > 0) parts.push(t('{n} saat havuzda', { n: pending }));

  // An empty project is not "fine", it is NOT STARTED — and saying "Sorun yok"
  // to somebody who has just opened the program for the first time is the chip
  // telling them nothing on the one screen where it could tell them something.
  const empty = d.lessons.length === 0;

  return {
    blocked,
    warnings,
    pending,
    stranded,
    problems: stranded + report.violations.length + report.unplaceable.length,
    advice: report.advice.length,
    level,
    message: empty
      ? t('Henüz ders girilmedi')
      : parts.length === 0
        ? t('Sorun yok')
        : parts.join(' · '),
  };
}
