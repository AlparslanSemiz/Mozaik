// The one line that says whether the timetable is in trouble, in every tab.

import { t } from '../../leaf/i18n';
import type { State } from '../../leaf/model';
import { buildIndex } from '../constraints';
import type { Level } from './levels';
import { buildReport } from './report';

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
   * Everything that makes the week impossible as it stands: rules broken at
   * Engelle, lessons on a closed hour, lessons with nowhere left to go. The
   * strip's "engel" count; it used to be `blocked` alone and said "0 engel"
   * beside a red chip (DENETIM DK7).
   */
  hard: number;
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

  const stranded = report.stranded;

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
    hard: blocked + stranded + report.unplaceable.length,
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
