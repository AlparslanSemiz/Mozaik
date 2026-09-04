// Lessons already on the grid whose hour has since been closed.
//
// Nothing is deleted here, on purpose: a wrong click on the availability grid
// must not silently cost a laid-out lesson. The caller paints these cells red
// and Kontrol lists them; my father decides.

import { t } from '../i18n';
import { closedKey } from '../keys';
import { dayLabel } from '../schedule/names';
import type { Index } from './placement';
import { activePlacements } from '../programs';
import type { Id, State } from '../types';

// --------------------------------------------------- closed-hour conflicts

/** One placed lesson sitting on an hour that is now closed for somebody. */
export interface ClosedConflict {
  lessonId: Id;
  classId: Id;
  teacherId: Id;
  day: number;
  hour: number;
  /** Concrete, in blocker()'s own voice: "MÇ Salı 3 saatinde müsait değil". */
  reason: string;
}

/**
 * Lessons already on the grid whose hour has since been closed.
 *
 * Availability is edited AFTER a timetable is laid out, and marking an hour
 * closed used to do nothing to what already sat there: the lesson stayed, and
 * it was invisible — the hatch is only drawn on EMPTY cells, so the card simply
 * covered the closed hour. blocker() never looked at it either, because it only
 * ever runs for a prospective drop.
 *
 * Nothing is deleted here, on purpose (principle 6): a wrong click on the
 * availability grid must not silently cost a laid-out lesson. The caller paints
 * these cells red and Kontrol lists them; my father decides.
 */
export function closedConflicts(d: State, ix: Index): ClosedConflict[] {
  const out: ClosedConflict[] = [];

  const placements = activePlacements(d);
  for (const key in placements) {
    const lessonId = placements[key];
    if (lessonId === undefined) continue;

    const parts = key.split('|');
    const classId = parts[0];
    if (classId === undefined) continue;
    const day = Number(parts[1]);
    const hour = Number(parts[2]);

    const lesson = ix.lessonById.get(lessonId);
    if (lesson === undefined) continue;
    const group = ix.classById.get(classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    if (group === undefined || teacher === undefined) continue;

    const dayName = dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
    const hourName = d.settings.hours[hour] ?? `${hour + 1}`;
    const when = t('{gun} {saat} saatinde', { gun: dayName, saat: hourName });

    let reason: string | null = null;
    if (d.unavailable[closedKey(teacher.id, day, hour)] !== undefined) {
      reason = t('{kim} {ne_zaman} müsait değil', { kim: teacher.short, ne_zaman: when });
    } else if (d.unavailable[closedKey(group.id, day, hour)] !== undefined) {
      reason = t('{sinif} sınıfı {ne_zaman} kapalı', { sinif: group.name, ne_zaman: when });
    } else if (
      group.roomId != null &&
      d.unavailable[closedKey(group.roomId, day, hour)] !== undefined
    ) {
      const roomName = ix.roomById.get(group.roomId)?.name ?? '?';
      reason = t('{derslik} dersliği {ne_zaman} kapalı', { derslik: roomName, ne_zaman: when });
    }
    if (reason === null) continue;

    out.push({ lessonId, classId, teacherId: teacher.id, day, hour, reason });
  }

  // Stable order, so the Kontrol list does not reshuffle on every keystroke.
  out.sort((a, b) => a.day - b.day || a.hour - b.hour || a.reason.localeCompare(b.reason, 'tr'));
  return out;
}
