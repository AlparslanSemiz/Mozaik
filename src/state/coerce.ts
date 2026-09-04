// Reading UNTRUSTED values. Every field of a backup file arrives through one of
// these: a hand-edited file, a file from a future version, or a file half
// written when a tab was closed can say anything at all.
//
// The contract is the same for all of them: answer with a usable value or with
// the caller's fallback, never with a throw. A parser that throws on one broken
// field loses the whole timetable behind it.

import type { Gender, RuleLevel } from '../types';

export const asArray = <T,>(x: unknown, fallback: T[]): T[] =>
  Array.isArray(x) ? (x as T[]) : fallback;

export const asMap = <T,>(x: unknown): Record<string, T> =>
  typeof x === 'object' && x !== null ? (x as Record<string, T>) : {};

export const asText = (x: unknown, fallback: string): string =>
  typeof x === 'string' ? x : fallback;

export const asCount = (x: unknown, fallback: number): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.round(x) : fallback;

/** A limit box: a positive number, or null meaning "use the default". */
export const asBox = (x: unknown): number | null =>
  typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.round(x) : null;

export function asLevel(x: unknown, fallback: RuleLevel): RuleLevel {
  return x === 'off' || x === 'warn' || x === 'block' ? x : fallback;
}

/** Anything that is not one of the two letters means "not stated". */
export function asGender(x: unknown): Gender {
  return x === 'k' || x === 'e' ? x : '';
}

/** subjectShorts: string -> non-empty string, anything else dropped. */
export function asShorts(x: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(asMap<unknown>(x))) {
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

/** A stored list of names: strings only, trimmed, no blanks, no duplicates. */
export function asNames(x: unknown, fallback: string[]): string[] {
  if (!Array.isArray(x)) return fallback;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of x) {
    if (typeof value !== 'string') continue;
    const name = value.trim();
    const key = name.toLocaleLowerCase('tr');
    if (name === '' || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.length > 0 ? out : fallback;
}
