// Kontrol's whole report: capacity, what cannot be placed, and advice.

import { t } from '../../leaf/i18n';
import type { State } from '../../leaf/model';
import { buildIndex, closedConflicts, findViolations } from '../constraints';
import { buildAdvice } from './advice';
import { buildCapacity } from './capacity';
import type { Report, Unplaceable } from './levels';
import { commonestBlock, lessonName } from './naming';

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

  const rows = [...teachers, ...classes, ...rooms];
  const stranded = closedConflicts(d, ix).length;
  const hasProblem =
    stranded > 0 ||
    unplaceable.length > 0 ||
    violations.length > 0 ||
    rows.some((x) => x.level === 'impossible');
  const tight = !hasProblem && rows.some((x) => x.level === 'tight');

  return { teachers, classes, rooms, unplaceable, violations, advice, stranded, hasProblem, tight };
}
