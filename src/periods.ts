// The periods of a school day: what they are CALLED, and every cell they make.
//
// The label is data the reader owns (`settings.hours`), not a number derived on
// screen — a school that calls its periods "0. saat" upward has to be able to
// say so.

import type { State } from './types';

export function hourNames(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

/**
 * Lesson labels: a comma separated list if one was typed, otherwise 1..n.
 * `count` is clamped to 1..16 — a school day with 0 or 40 lessons is a typo.
 */
export function hourLabels(count: number, names?: string): string[] {
  if (names !== undefined && names.trim() !== '') {
    const list = names
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x !== '');
    if (list.length > 0) return list;
  }
  return hourNames(Math.min(16, Math.max(1, count)));
}

/** Every day/hour pair of the week, in reading order. */
export function allCells(d: State): Array<{ day: number; hour: number }> {
  const list: Array<{ day: number; hour: number }> = [];
  for (let g = 0; g < d.settings.days.length; g++) {
    for (let s = 0; s < d.settings.hours.length; s++) list.push({ day: g, hour: s });
  }
  return list;
}
