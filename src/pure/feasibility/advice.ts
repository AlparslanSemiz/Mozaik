// Danışman: the points a data entry may have missed.

import { t } from '../../leaf/i18n';
import { type Id, type State, blockPlan } from '../../leaf/model';
import { type Index, closedKey } from '../constraints';
import { lessonName } from './naming';

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
