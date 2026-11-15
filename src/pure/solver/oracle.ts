// The test oracle for the solver and its improvement pass: an auditor that
// reads only the raw data — placements, lessons, closed hours, the rule
// boxes — and none of the constraint engine. `blocker()` is what the solver and
// the pass ask; this is what judges their answer, so a mistake there cannot
// also be a mistake here (the audit of 2026-11-16, scratch `zz-kalite`).
//
// A test instrument: nothing on screen uses it, and the application must not
// import it (the same standing as `gridQuality` in worlds.ts).

import type { Id, Lesson, State } from '../../leaf/model';
import { activePinned, activePlacements } from '../grid';

const positive = (own: number | null | undefined, fallback: number): number => {
  const v = own == null ? fallback : own;
  return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
};

function sameLimit(d: State, l: Lesson): number {
  const c = d.classes.find((x) => x.id === l.classId);
  return positive(l.maxPerDay ?? c?.maxSameLessonPerDay, d.settings.limits.maxSameLessonPerDay);
}

/** Every hard rule the week breaks, one line each. */
export function hardBreaches(d: State): string[] {
  const P = activePlacements(d);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const L = new Map(d.lessons.map((l) => [l.id, l]));
  const C = new Map(d.classes.map((c) => [c.id, c]));
  const R = d.settings.rules;
  const out: string[] = [];
  const teacherAt = new Map<string, Id>();
  const roomAt = new Map<string, Id>();
  const cells = new Map<Id, Array<[number, number]>>();
  for (const [key, lessonId] of Object.entries(P)) {
    const [classId, ds, hs] = key.split('|') as [Id, string, string];
    const day = Number(ds);
    const hour = Number(hs);
    const lesson = L.get(lessonId);
    if (lesson === undefined) {
      out.push(`yetim ${key}`);
      continue;
    }
    if (lesson.classId !== classId) out.push(`yanlış sınıf ${key}`);
    if (day < 0 || day >= dayCount || hour < 0 || hour >= hourCount) out.push(`ızgara dışı ${key}`);
    const tk = `${lesson.teacherId}|${day}|${hour}`;
    if (teacherAt.has(tk)) out.push(`öğretmen çakışması ${tk}`);
    teacherAt.set(tk, lessonId);
    const room = C.get(classId)?.roomId;
    if (room != null) {
      const rk = `${room}|${day}|${hour}`;
      if (roomAt.has(rk)) out.push(`derslik çakışması ${rk}`);
      roomAt.set(rk, lessonId);
    }
    for (const id of [classId, lesson.teacherId, room]) {
      if (id != null && d.unavailable[`${id}|${day}|${hour}`] !== undefined) {
        out.push(`kapalı saat ${id}|${day}|${hour}`);
      }
    }
    const list = cells.get(lessonId) ?? [];
    list.push([day, hour]);
    cells.set(lessonId, list);
  }
  for (const lesson of d.lessons) {
    const mine = cells.get(lesson.id) ?? [];
    if (mine.length > lesson.weeklyHours) out.push(`fazla saat ${lesson.id}`);
    const limit = sameLimit(d, lesson);
    if (R.maxSameLessonPerDay === 'block' && limit > 0) {
      for (let day = 0; day < dayCount; day++) {
        if (mine.filter(([g]) => g === day).length > limit)
          out.push(`aynı ders ${lesson.id}|${day}`);
      }
    }
  }
  for (const t of d.teachers) {
    const maxDay = positive(t.limits.maxPerDay, d.settings.limits.maxPerDay);
    const maxRun = positive(t.limits.maxConsecutive, d.settings.limits.maxConsecutive);
    const minDay = positive(t.limits.minPerDay, d.settings.limits.minPerDay);
    for (let day = 0; day < dayCount; day++) {
      const busy = Array.from({ length: hourCount }, (_, h) =>
        teacherAt.has(`${t.id}|${day}|${h}`),
      );
      const n = busy.filter(Boolean).length;
      if (n === 0) continue;
      if (R.maxPerDay === 'block' && maxDay > 0 && n > maxDay) out.push(`günlük ${t.id}|${day}`);
      if (R.minPerDay === 'block' && minDay > 0 && n < minDay) out.push(`en az ${t.id}|${day}`);
      let run = 0;
      let longest = 0;
      for (const b of busy) {
        run = b ? run + 1 : 0;
        longest = Math.max(longest, run);
      }
      if (R.maxConsecutive === 'block' && maxRun > 0 && longest > maxRun) {
        out.push(`art arda ${t.id}|${day}`);
      }
      if (R.maxGapsTeacher === 'block') {
        const first = busy.indexOf(true);
        const last = busy.lastIndexOf(true);
        if (last - first + 1 - n > d.settings.limits.maxGapsTeacher)
          out.push(`öğretmen boşluğu ${t.id}|${day}`);
      }
    }
  }
  if (R.maxGapsClass === 'block') {
    for (const c of d.classes) {
      for (let day = 0; day < dayCount; day++) {
        const busy = Array.from(
          { length: hourCount },
          (_, h) => P[`${c.id}|${day}|${h}`] !== undefined,
        );
        const n = busy.filter(Boolean).length;
        if (n === 0) continue;
        const gaps = busy.lastIndexOf(true) - busy.indexOf(true) + 1 - n;
        if (gaps > d.settings.limits.maxGapsClass) out.push(`sınıf boşluğu ${c.id}|${day}`);
      }
    }
  }
  for (const r of d.relations) {
    if (r.kind !== 'notSameDay') continue;
    const a = new Set((cells.get(r.lessonIds[0]) ?? []).map(([g]) => g));
    for (const [g] of cells.get(r.lessonIds[1]) ?? []) {
      if (a.has(g)) {
        out.push(`ilişki ${r.id}|${g}`);
        break;
      }
    }
  }
  return out;
}

/**
 * The week's quality, in the order the pass compares it: soft-rule breaches,
 * stacking, teacher gaps, teacher days, class gaps, how late. Lower is better,
 * compared left to right.
 */
export function quality(d: State): number[] {
  const P = activePlacements(d);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const L = new Map(d.lessons.map((l) => [l.id, l]));
  const R = d.settings.rules;
  const teacherAt = new Set<string>();
  for (const [key, lessonId] of Object.entries(P)) {
    const [, ds, hs] = key.split('|');
    const lesson = L.get(lessonId);
    if (lesson !== undefined) teacherAt.add(`${lesson.teacherId}|${ds}|${hs}`);
  }
  let warn = 0;
  let stacked = 0;
  let teacherGaps = 0;
  let teacherDays = 0;
  let classGaps = 0;
  let late = 0;
  const gapsOf = (busy: boolean[]) => {
    const n = busy.filter(Boolean).length;
    return n === 0 ? 0 : busy.lastIndexOf(true) - busy.indexOf(true) + 1 - n;
  };
  for (const t of d.teachers) {
    const maxDay = positive(t.limits.maxPerDay, d.settings.limits.maxPerDay);
    const maxRun = positive(t.limits.maxConsecutive, d.settings.limits.maxConsecutive);
    const minDay = positive(t.limits.minPerDay, d.settings.limits.minPerDay);
    for (let day = 0; day < dayCount; day++) {
      const busy = Array.from({ length: hourCount }, (_, h) =>
        teacherAt.has(`${t.id}|${day}|${h}`),
      );
      const n = busy.filter(Boolean).length;
      if (n === 0) continue;
      teacherDays++;
      const gaps = gapsOf(busy);
      teacherGaps += gaps;
      let run = 0;
      let longest = 0;
      for (const b of busy) {
        run = b ? run + 1 : 0;
        longest = Math.max(longest, run);
      }
      if (R.maxPerDay === 'warn' && maxDay > 0 && n > maxDay) warn++;
      if (R.minPerDay === 'warn' && minDay > 0 && n < minDay) warn++;
      if (R.maxConsecutive === 'warn' && maxRun > 0 && longest > maxRun) warn++;
      if (R.maxGapsTeacher === 'warn' && gaps > d.settings.limits.maxGapsTeacher) warn++;
    }
  }
  for (const c of d.classes) {
    for (let day = 0; day < dayCount; day++) {
      const busy = Array.from(
        { length: hourCount },
        (_, h) => P[`${c.id}|${day}|${h}`] !== undefined,
      );
      const gaps = gapsOf(busy);
      classGaps += gaps;
      busy.forEach((b, h) => {
        if (b) late += h;
      });
      if (
        R.maxGapsClass === 'warn' &&
        busy.some(Boolean) &&
        gaps > d.settings.limits.maxGapsClass
      ) {
        warn++;
      }
    }
  }
  for (const lesson of d.lessons) {
    const longest = Math.max(1, ...lesson.blocks);
    const limit = sameLimit(d, lesson);
    for (let day = 0; day < dayCount; day++) {
      let n = 0;
      for (let h = 0; h < hourCount; h++) if (P[`${lesson.classId}|${day}|${h}`] === lesson.id) n++;
      if (n > longest) stacked += n - longest;
      if (R.maxSameLessonPerDay === 'warn' && limit > 0 && n > limit) warn++;
    }
  }
  return [warn, stacked, teacherGaps, teacherDays, classGaps, late];
}

/** Negative when `a` is the better week. */
export function compareQuality(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
}

/** Cells that differ between two weeks. */
export function cellsChanged(a: State, b: State): number {
  const A = activePlacements(a);
  const B = activePlacements(b);
  let n = 0;
  for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) if (A[key] !== B[key]) n++;
  return n;
}

/** The pinned cells of `before` that `after` no longer holds as they were. */
export function pinsMoved(before: State, after: State): string[] {
  const P = activePlacements(before);
  const Q = activePlacements(after);
  return Object.keys(activePinned(before)).filter((key) => P[key] !== Q[key]);
}
