// Writing to `settings`. Every write goes through `updateSettings`, and the
// reason is `remapDays` below: a settings change is the one edit that can move
// the whole timetable a day sideways without anything on screen saying so.

import { sanitize } from './constraints';
import type { Bell, Day, Limits, Rules, Settings, State } from './types';

/**
 * Rewrites placement/unavailable keys when the day LIST changes.
 *
 * Placement keys hold the day INDEX. Removing Monday from the front would shift
 * Tuesday from 1 to 0, silently moving the whole timetable one day earlier —
 * the old code never hit this because it only ever cut days off the END.
 * The mapping is therefore built from the day NAME (pitfall 11).
 */
export function remapDays(d: State, nextDays: Day[]): State {
  const oldToNew = dayMapping(d.settings.days, nextDays);

  // Nothing moved (a rename or a longBreakAfter change) -> keep the same object.
  const identity =
    nextDays.length === d.settings.days.length &&
    nextDays.every((_, i) => oldToNew.get(i) === i);
  if (identity) return d;

  const move = movedKeys(oldToNew);
  // Pins go through the same `move` for the same reason the other two do:
  // their key holds a day INDEX, and an index that is not remapped points at
  // whichever day slid into its place (pitfall 11).
  return {
    ...d,
    unavailable: move(d.unavailable),
    programs: d.programs.map((program) => ({
      ...program,
      placements: move(program.placements),
      pinned: move(program.pinned),
    })),
  };
}

/** Old day index -> new one, matched BY NAME. A brand new day starts empty. */
function dayMapping(before: Day[], after: Day[]): Map<number, number> {
  const oldToNew = new Map<number, number>();
  const used = new Set<number>();
  for (const [newIndex, day] of after.entries()) {
    const oldIndex = before.findIndex((old, i) => old.name === day.name && !used.has(i));
    if (oldIndex === -1) continue;
    used.add(oldIndex);
    oldToNew.set(oldIndex, newIndex);
  }
  return oldToNew;
}

/** Rewrites the day segment of every `x|day|y` key; drops the removed days. */
function movedKeys(oldToNew: Map<number, number>) {
  return <T,>(source: Record<string, T>): Record<string, T> => {
    const out: Record<string, T> = {};
    for (const key in source) {
      const value = source[key];
      if (value === undefined) continue;
      const parts = key.split('|');
      if (parts.length !== 3) continue;
      const target = oldToNew.get(Number(parts[1]));
      if (target === undefined) continue; // the day was removed
      out[`${parts[0]}|${target}|${parts[2]}`] = value;
    }
    return out;
  };
}

/** Every settings write goes through here: remap first, then sanitize. */
export function updateSettings(d: State, next: Partial<Settings>): State {
  const withKeys = next.days === undefined ? d : remapDays(d, next.days);
  return sanitize({ ...withKeys, settings: { ...d.settings, ...next } });
}

export function updateBell(d: State, next: Partial<Bell>): State {
  return updateSettings(d, { bell: { ...d.settings.bell, ...next } });
}

export function updateLimits(d: State, next: Partial<Limits>): State {
  return updateSettings(d, { limits: { ...d.settings.limits, ...next } });
}

export function updateRules(d: State, next: Partial<Rules>): State {
  return updateSettings(d, { rules: { ...d.settings.rules, ...next } });
}
