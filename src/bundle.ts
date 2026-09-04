// The bundle: every plan in ONE file.
//
// Why it exists: "Dosyaya kaydet" writes a single plan, and since the library
// arrived (task 4b) that means a three-plan setup cannot be carried anywhere in
// one piece. A backup that holds only part of the work is exactly the kind of
// gap principle 6 is about.
//
// This module follows library.ts's arrangement to the letter: it knows the
// ENVELOPE and nothing about what a State is. It hands back raw `unknown` for
// each plan and `parseState.ts` is the only place that parses one. Dependencies are
// library.ts (a leaf, so no cycle) and a type-only import from types.ts.
//
// Nothing here writes to storage and nothing here reads a key: a bundle is a
// FILE FORMAT, not a second place data lives. No new localStorage key exists
// because of this file, and `schemaVersion` does not move — a bundle simply
// carries several v5 states side by side.

import { normalizeLibrary, type Library } from './library';
import type { Id } from './types';

/** Bumped only if the ENVELOPE changes. The states inside carry their own
    `schemaVersion` and are migrated by parseState exactly as a single file is. */
export const BUNDLE_VERSION = 1;

export interface Bundle {
  /** Already through normalizeLibrary: the rules for a broken directory are
      written once, in library.ts, and are not repeated here. */
  library: Library;
  /** plan id -> the raw state as it sat in the file. Parsed by parseState.ts. */
  states: Record<Id, unknown>;
}

interface RawEntry {
  id?: unknown;
  name?: unknown;
  draft?: unknown;
  state?: unknown;
}

export function buildBundle(lib: Library, states: Record<Id, unknown>): string {
  return JSON.stringify({
    bundleVersion: BUNDLE_VERSION,
    savedAt: new Date().toISOString(),
    activeId: lib.activeId,
    // Only plans whose state we actually have. A directory row pointing at
    // nothing is worse than a missing row: it invites deleting the wrong one.
    plans: lib.plans
      .filter((p) => states[p.id] !== undefined)
      .map((p) => ({ id: p.id, name: p.name, draft: p.draft, state: states[p.id] })),
  });
}

/**
 * The envelope version, for the caller that has to tell three files apart.
 *
 * Returns null when the text is not a bundle at all — which includes every
 * single-plan backup, so the top bar can keep opening those unchanged.
 */
export function bundleVersionOf(text: string): number | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const version = (raw as { bundleVersion?: unknown }).bundleVersion;
  return typeof version === 'number' && Number.isFinite(version) ? version : null;
}

/**
 * Reads a bundle. NEVER throws; returns null for anything it cannot fully
 * read, and the caller then falls back to the single-plan path.
 *
 * An entry without an object `state` is dropped BEFORE normalizeLibrary sees
 * it, so it can never become a directory row with no data behind it.
 */
export function parseBundle(text: string): Bundle | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;

  const g = raw as { bundleVersion?: unknown; activeId?: unknown; plans?: unknown };
  if (g.bundleVersion !== BUNDLE_VERSION) return null; // not a bundle, or a newer one

  const entries = (Array.isArray(g.plans) ? g.plans : []).filter(
    (item): item is RawEntry =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as RawEntry).state === 'object' &&
      (item as RawEntry).state !== null,
  );
  if (entries.length === 0) return null;

  const library = normalizeLibrary({ activeId: g.activeId, plans: entries });

  const states: Record<Id, unknown> = {};
  for (const entry of entries) {
    // normalizeLibrary decided which ids survive; anything it dropped (no id,
    // duplicate id) must not leave a state behind either.
    if (typeof entry.id === 'string' && library.plans.some((p) => p.id === entry.id)) {
      states[entry.id] ??= entry.state;
    }
  }
  if (Object.keys(states).length === 0) return null;

  return { library, states };
}
