// Bell times. PURE functions: minute arithmetic only, no date library
// (runtime dependency is React and nothing else).
//
// Times are GENERATED, not stored per period. The school day is regular:
// a start time, a lesson length, a break length, and exactly ONE long break
// whose position is the only thing that differs between weekdays and weekend.

import type { Bell, Day } from './types';

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

export const MINUTE_STEP = 5;

/** "09:00" -> { hour: 9, minute: 0 }. Unreadable input lands on 00:00, never NaN. */
export function clockParts(text: string): { hour: number; minute: number } {
  const total = parseClock(text);
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/**
 * The minutes the start-time dropdown offers: 0, 5, ... 55.
 *
 * No school rings a bell at 09:03, and every extra option is one more thing to
 * scroll past. A stored minute that is NOT a multiple of five is still listed,
 * though — an old file may hold one, and silently snapping it would move the
 * whole school day without saying so.
 */
export function minuteOptions(minute: number): number[] {
  const out: number[] = [];
  for (let m = 0; m < 60; m += MINUTE_STEP) out.push(m);
  if (!out.includes(minute) && minute >= 0 && minute < 60) {
    out.push(minute);
    out.sort((a, b) => a - b);
  }
  return out;
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

/**
 * The clock a lesson has on EVERY printed/shown day, or null where the days
 * disagree.
 *
 * A column header can only carry one time, but the long break sits after the
 * 5th lesson on weekdays and after the 6th at the weekend — so the 6th lesson
 * starts at 13:30 on one and 13:10 on the other. Printing one of them next to
 * both would be a lie on paper, and my father would set his watch by it. Where
 * the days disagree we say nothing; each row still shows its own break.
 *
 * With the default layout exactly one column comes back null: lessons 1-5 are
 * identical and 7-12 line up again, which is why both patterns end at 19:10.
 */
export function sharedPeriods(bell: Bell, labels: string[], days: Day[]): Array<Period | null> {
  if (days.length === 0) return labels.map(() => null);

  const perDay = days.map((day) => dayPeriods(bell, labels, day.longBreakAfter));
  return labels.map((_, i) => {
    const first = perDay[0]?.[i];
    if (first === undefined) return null;
    const same = perDay.every((p) => p[i]?.start === first.start && p[i]?.end === first.end);
    return same ? first : null;
  });
}
