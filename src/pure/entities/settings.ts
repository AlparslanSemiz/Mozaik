// The school's settings: days, bell, limits and rules, and `remapDays`, which
// keeps the timetable from sliding when the list of days changes (pitfall 11).

import {
  type Bell,
  type Day,
  type Limits,
  type Refusal,
  type Relaxation,
  type Rules,
  type Settings,
  type State,
  keyOnDay,
  parseKey,
} from '../../leaf/model';
import { sanitize } from '../constraints';
import { activeProgram } from '../grid';

// ----------------------------------------------------------------- settings

/**
 * Rewrites placement/unavailable keys when the day LIST changes.
 *
 * Placement keys hold the day INDEX. Removing Monday from the front would shift
 * Tuesday from 1 to 0, silently moving the whole timetable one day earlier —
 * the old code never hit this because it only ever cut days off the END.
 * The mapping is therefore built from the day NAME (docs/TRAPS.md pitfall 11).
 */
export function remapDays(d: State, nextDays: Day[]): State {
  const oldToNew = new Map<number, number>();
  const used = new Set<number>();

  for (const [newIndex, day] of nextDays.entries()) {
    const oldIndex = d.settings.days.findIndex((old, i) => old.name === day.name && !used.has(i));
    if (oldIndex === -1) continue; // a brand new day starts empty
    used.add(oldIndex);
    oldToNew.set(oldIndex, newIndex);
  }

  const move = <T>(source: Record<string, T>): Record<string, T> => {
    const out: Record<string, T> = {};
    for (const key in source) {
      const value = source[key];
      if (value === undefined) continue;
      const parts = parseKey(key);
      if (parts === null) continue;
      const target = oldToNew.get(parts.day);
      if (target === undefined) continue; // the day was removed
      // The day is the one part that moves. The other two are copied as stored,
      // not printed again from numbers, so the key stays byte for byte its own.
      out[keyOnDay(key, target)!] = value;
    }
    return out;
  };

  // Nothing moved (a rename or a longBreakAfter change) -> keep the same object.
  const identity =
    nextDays.length === d.settings.days.length && nextDays.every((_, i) => oldToNew.get(i) === i);
  if (identity) return d;

  // Pins go through the same `move` for the same reason the other two do:
  // their key holds a day INDEX, and an index that is not remapped points at
  // whichever day slid into its place (pitfall 11).
  // The answers name a day by index too (schema v15), and move the same way;
  // an answer about a removed day goes with it.
  const onDay = <T extends Relaxation | Refusal>(x: T): T | null => {
    if ('day' in x) {
      const target = oldToNew.get(x.day);
      return target === undefined ? null : { ...x, day: target };
    }
    if ('days' in x && x.days !== undefined) {
      return { ...x, days: x.days.flatMap((day) => oldToNew.get(day) ?? []) };
    }
    return x;
  };
  const keep = <T extends Relaxation | Refusal>(list: T[]): T[] =>
    list.flatMap((x) => onDay(x) ?? []);

  return {
    ...d,
    unavailable: move(d.unavailable),
    programs: d.programs.map((program) => ({
      ...program,
      placements: move(program.placements),
      pinned: move(program.pinned),
    })),
    answers: { accepted: keep(d.answers.accepted), refused: keep(d.answers.refused) },
  };
}

/** Every settings write goes through here: remap first, then sanitize. */
export function updateSettings(d: State, next: Partial<Settings>): State {
  const withKeys = next.days === undefined ? d : remapDays(d, next.days);
  return sanitize({ ...withKeys, settings: { ...d.settings, ...next } });
}

/**
 * What a settings write would take off the grid: placed hours and pins on the
 * program on screen, and placed hours on the other alternatives (remapDays and
 * sanitize rewrite every one of them). Unticking a day or lowering the number
 * of lessons a day used to do this without a word (DENETIM DK8); the question
 * that now comes first counts with this.
 *
 * Measured as the difference the write itself makes, not re-derived from the
 * day and hour ranges, so the number in the question cannot disagree with what
 * pressing its button then does.
 */
export interface SettingsLoss {
  placed: number;
  pinned: number;
  elsewhere: number;
}

export function settingsLoss(d: State, next: Partial<Settings>): SettingsLoss {
  const after = updateSettings(d, next);
  const size = (x: Record<string, unknown>) => Object.keys(x).length;
  const before = activeProgram(d);
  const now = activeProgram(after);
  let elsewhere = 0;
  for (const program of d.programs) {
    if (program.id === before.id) continue;
    const kept = after.programs.find((x) => x.id === program.id);
    elsewhere += size(program.placements) - (kept === undefined ? 0 : size(kept.placements));
  }
  return {
    placed: size(before.placements) - size(now.placements),
    pinned: size(before.pinned) - size(now.pinned),
    elsewhere,
  };
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
