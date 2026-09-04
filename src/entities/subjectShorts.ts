// How a subject is ABBREVIATED: what the grid cell, the row head and the
// printed page carry.
//
// Only an override is stored (`settings.subjectShorts`), never a default. That
// keeps the backup small and lets a later, better built-in table reach an old
// project by itself.

import { builtInShort, builtInShortRaw, subjectLabel } from '../schedule/names';
import { subjectKey } from '../schedule/subjects';
import type { Settings, State } from '../types';

/** Override -> built-in table -> first three letters. */
export function subjectShort(settings: Settings, subject: string): string {
  const key = subjectKey(subject);
  if (key === '') return '';

  const override = settings.subjectShorts[key];
  if (override !== undefined && override.trim() !== '') return override.trim();

  // Translated, unlike the two around it: an override is what the reader typed
  // and the three-letter slice is cut from a name they typed.
  const known = builtInShort(subject);
  if (known !== undefined) return known;

  return headOf(subject);
}

/**
 * One line of a subject dropdown: "Mat · Matematik".
 *
 * The short form FIRST, because it is the string the reader has to recognise
 * everywhere else — the grid row heads, the cells and the printed page all
 * carry it. The full name stays beside it: a dropdown of three-letter codes is
 * not a list anyone can pick from, which is why this is not simply
 * `subjectShort`. When the two are the same string it is written once.
 */
export function subjectOption(settings: Settings, name: string): string {
  const short = subjectShort(settings, name);
  const full = subjectLabel(name);
  return short === full ? full : `${short} · ${full}`;
}

/**
 * What subjectShort() would say with no override at all — IN TURKISH.
 *
 * Not a display value: it is the thing an override is compared against, and a
 * comparison that moved with the interface language would decide whether to
 * WRITE to `settings.subjectShorts` differently in two sessions of the same
 * project. See `setSubjectShort`.
 */
export function defaultSubjectShort(subject: string): string {
  const key = subjectKey(subject);
  if (key === '') return '';
  const known = builtInShortRaw(subject);
  if (known !== undefined) return known;
  return headOf(subject);
}

/** The fallback both readers share: the first three letters, capitalised. */
function headOf(subject: string): string {
  const head = subject.trim().slice(0, 3);
  return head.charAt(0).toLocaleUpperCase('tr') + head.slice(1);
}

/**
 * Stores an override ONLY when it differs from the default; writing the default
 * back removes it.
 */
export function setSubjectShort(d: State, subject: string, value: string): State {
  const key = subjectKey(subject);
  if (key === '') return d;

  const next = { ...d.settings.subjectShorts };
  const trimmed = value.trim();
  if (trimmed === '' || isDefaultShort(subject, trimmed)) delete next[key];
  else next[key] = trimmed;

  return { ...d, settings: { ...d.settings, subjectShorts: next } };
}

/**
 * Both forms clear an override: the Turkish default is what the FILE means, and
 * the translated one is what the reader was looking at when they typed it back.
 * Comparing against only one of them would let an interface language decide
 * what ends up in the backup.
 */
function isDefaultShort(subject: string, trimmed: string): boolean {
  return (
    trimmed === defaultSubjectShort(subject) ||
    trimmed === subjectShort({ subjectShorts: {} } as Settings, subject)
  );
}
