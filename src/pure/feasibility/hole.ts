// Why a lesson the run could not finish is stuck, in a sentence that names
// the hole.

import { t } from '../../leaf/i18n';
import { dayLabel } from '../../leaf/lang';
import { type Id, type State, placementKey } from '../../leaf/model';
import {
  type BlockCode,
  type Index,
  blockerDetail,
  closedKey,
  pendingBlocks,
} from '../constraints';
import { activePlacements } from '../grid';

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
