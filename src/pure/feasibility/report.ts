// Kontrol's whole report: capacity, what cannot be placed, and advice.

import type { State } from '../../leaf/model';
import { buildIndex, closedConflicts, findViolations } from '../constraints';
import { buildAdvice } from './advice';
import { buildCapacity } from './capacity';
import type { Report, Unplaceable } from './levels';
import { commonestBlock, lessonName } from './naming';
import { stuckReason } from './stuck';

export function buildReport(d: State): Report {
  const ix = buildIndex(d);
  const capacity = buildCapacity(d);
  const { teachers, classes, rooms } = capacity;

  // Lessons that are still incomplete and have no valid slot left at all.
  const unplaceable: Unplaceable[] = [];
  for (const lesson of d.lessons) {
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const missing = lesson.weeklyHours - placed;
    if (missing <= 0) continue;

    const summary = commonestBlock(d, ix, lesson.id, true);
    if (summary.anyValid) continue;

    // The cause that BINDS, not the commonest blocked cell: that vote was won
    // by the class's own closed hours on every row (TODO SD4, stuck.ts).
    const why = stuckReason(d, ix, lesson.id, capacity);
    unplaceable.push({
      lessonId: lesson.id,
      name: lessonName(ix, lesson.id),
      missing,
      message: why.message,
      fix: why.fix,
    });
  }

  const violations = findViolations(d, ix);
  const advice = buildAdvice(d, ix);

  const rows = [...teachers, ...classes, ...rooms];
  // LESSONS, not hours: a two-hour block on a closed hour is one thing to move.
  const stranded = new Set(closedConflicts(d, ix).map((c) => c.lessonId)).size;
  const hasProblem =
    stranded > 0 ||
    unplaceable.length > 0 ||
    violations.length > 0 ||
    rows.some((x) => x.level === 'impossible');
  const tight = !hasProblem && rows.some((x) => x.level === 'tight');

  return { teachers, classes, rooms, unplaceable, violations, advice, stranded, hasProblem, tight };
}
