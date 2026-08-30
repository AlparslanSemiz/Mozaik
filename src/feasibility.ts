// Feasibility check (v0.5). PURE functions.
//
// The thing aSc does not do and that hurts most at the school: saying WHY a
// timetable cannot be built. It comes before a solver because it is far
// cheaper and far more useful.

import { t } from "./i18n";
import { blockerDetail, buildIndex, closedConflicts } from "./constraints";
import type { BlockCode, Index } from "./constraints";
import { findViolations } from "./rules";
import type { Violation } from "./rules";
import type { State, Id } from "./types";

/** Above this ratio of load the "this will be hard" warning is raised. */
const TIGHT_RATIO = 0.85;

export type Level = "ok" | "tight" | "impossible";
export type LoadStatus = "empty" | Level;

/** The same capacity ladder used by Kontrol, exposed for list filtering. */
export function capacityLevel(capacity: number, load: number): Level {
  if (load > capacity) return "impossible";
  if (capacity > 0 && load > capacity * TIGHT_RATIO) return "tight";
  return "ok";
}

/** Zero load is useful to filter separately even though it is feasible. */
export function loadStatus(capacity: number, load: number): LoadStatus {
  return load === 0 ? "empty" : capacityLevel(capacity, load);
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
  hasProblem: boolean;
}

/** "412 — AV Fizik": how a lesson is named wherever the user is told about it. */
export function lessonName(ix: Index, lessonId: Id): string {
  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  return `${group?.name ?? "?"} · ${teacher?.short ?? "?"} ${teacher?.subject ?? ""}`.trim();
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
        if (seen === undefined)
          counts.set(found.code, { count: 1, message: found.message });
        else seen.count++;
      }
    }
  }

  let reason = t("Boş yer kalmamış");
  let top = 0;
  for (const entry of counts.values()) {
    if (entry.count > top) {
      top = entry.count;
      reason = entry.message;
    }
  }
  return { reason, anyValid };
}

export function buildCapacity(d: State): Capacity {
  const totalSlots = d.settings.days.length * d.settings.hours.length;

  // Closed hours per entity — one pass over the map. It holds teachers,
  // classes and rooms alike, and each id only ever means one of them.
  const closedCount = new Map<Id, number>();
  for (const key in d.unavailable) {
    const entityId = key.slice(0, key.indexOf("|"));
    closedCount.set(entityId, (closedCount.get(entityId) ?? 0) + 1);
  }

  const teachers: ReportRow[] = d.teachers.map((x) => {
    const capacity = totalSlots - (closedCount.get(x.id) ?? 0);
    const load = d.lessons
      .filter((l) => l.teacherId === x.id)
      .reduce((sum, l) => sum + l.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const message =
      level === "impossible"
        ? t(
            "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.",
            {
              kim: x.short,
              acik: capacity,
              yuk: load,
              fazla: load - capacity,
            },
          )
        : level === "tight"
          ? t(
              "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.",
              {
                kim: x.short,
                acik: capacity,
                yuk: load,
              },
            )
          : t("{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.", {
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
      level === "impossible"
        ? t(
            "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.",
            {
              sinif: c.name,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t("{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.", {
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
    const names = sharing.map((c) => c.name).join(", ");
    const message =
      level === "impossible"
        ? t(
            "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.",
            {
              derslik: r.name,
              n: sharing.length,
              hangileri: names,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t(
            "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.",
            {
              derslik: r.name,
              hangileri: names || t("sınıf yok"),
              acik: capacity,
              yuk: load,
            },
          );
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
      message: t(
        "{n} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: {sebep}",
        {
          n: missing,
          sebep: summary.reason,
        },
      ),
    });
  }

  const violations = findViolations(d, ix);

  const hasProblem =
    unplaceable.length > 0 ||
    violations.length > 0 ||
    [...teachers, ...classes, ...rooms].some((x) => x.level !== "ok");

  return { teachers, classes, rooms, unplaceable, violations, hasProblem };
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
    if (v.level === "block") blocked++;
    else warnings++;
  }
  // Capacity that cannot hold its load is a warning even when nothing has been
  // laid out yet: it is the one problem that is certain BEFORE any placement.
  // `Level` here is the capacity ladder: 'impossible' means the load cannot
  // fit at all, 'tight' means it barely does. Only the first is a problem.
  for (const row of [...report.teachers, ...report.classes, ...report.rooms]) {
    if (row.level === "impossible") warnings++;
  }

  let pending = 0;
  for (const lesson of d.lessons) {
    pending += Math.max(
      0,
      lesson.weeklyHours - (ix.placedHours.get(lesson.id) ?? 0),
    );
  }

  const stranded = closedConflicts(d, ix).length;

  const level: Level =
    blocked > 0 || stranded > 0 || report.unplaceable.length > 0
      ? "impossible"
      : warnings > 0
        ? "tight"
        : "ok";

  // The sentence names the loudest thing and counts it. "Sorun var" would
  // send somebody to Kontrol to find out what; this tells them before they go.
  const parts: string[] = [];
  if (blocked > 0) parts.push(t("{n} kural ihlali", { n: blocked }));
  if (stranded > 0) parts.push(t("{n} ders kapalı saatte", { n: stranded }));
  if (report.unplaceable.length > 0)
    parts.push(t("{n} ders sığmıyor", { n: report.unplaceable.length }));
  if (warnings > 0) parts.push(t("{n} uyarı", { n: warnings }));
  if (pending > 0) parts.push(t("{n} saat havuzda", { n: pending }));

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
    level,
    message: empty
      ? t("Henüz ders girilmedi")
      : parts.length === 0
        ? t("Sorun yok")
        : parts.join(" · "),
  };
}
