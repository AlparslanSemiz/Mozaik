// How a lesson is named wherever the user is told about it, and the block
// length most of its blocks have.

import { t } from '../../leaf/i18n';
import type { Id, State } from '../../leaf/model';
import { type BlockCode, type Index, blockerDetail } from '../constraints';

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
