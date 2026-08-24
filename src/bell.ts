// Bell times. PURE functions: minute arithmetic only, no date library
// (runtime dependency is React and nothing else).
//
// Times are GENERATED, not stored per period. The school day is regular:
// a start time, a lesson length, a break length, and exactly ONE long break
// whose position is the only thing that differs between weekdays and weekend.

import type { Bell } from './types';

export interface Period {
  label: string; // "3" — what the user typed in settings.hours
  start: string; // "10:40"
  end: string; // "11:20"
}

/** "09:00" -> 540. Anything unreadable -> 0 (midnight), never NaN. */
export function parseClock(text: string): number {
  const m = /^\s*(\d{1,2})\s*[:.]\s*(\d{1,2})\s*$/.exec(text);
  if (m === null) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min)) return 0;
  return Math.max(0, Math.min(23, h)) * 60 + Math.max(0, Math.min(59, min));
}

/**
 * 540 -> "09:00". Deliberately does NOT wrap at midnight: a day configured to
 * run to "25:10" must LOOK wrong instead of silently reading "01:10".
 */
export function formatClock(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * The clock for one day.
 *
 * `longBreakAfter` is 1-BASED: 5 means the long break falls between the 5th and
 * the 6th lesson. 0 means the day has no long break.
 */
export function dayPeriods(
  bell: Bell,
  labels: string[],
  longBreakAfter: number,
): Period[] {
  const base = parseClock(bell.start);
  const lesson = Math.max(1, Math.round(bell.lessonMinutes));
  const gap = Math.max(0, Math.round(bell.breakMinutes));
  const longGap = Math.max(0, Math.round(bell.longBreakMinutes));
  // Only the DIFFERENCE matters: the long break replaces a normal break.
  const extra = longBreakAfter > 0 ? longGap - gap : 0;

  return labels.map((label, i) => {
    const start = base + i * (lesson + gap) + (i >= longBreakAfter && longBreakAfter > 0 ? extra : 0);
    return { label, start: formatClock(start), end: formatClock(start + lesson) };
  });
}

/** When the last lesson of the day ends. "" if the day has no lessons. */
export function dayEnd(bell: Bell, labels: string[], longBreakAfter: number): string {
  const periods = dayPeriods(bell, labels, longBreakAfter);
  return periods[periods.length - 1]?.end ?? '';
}
