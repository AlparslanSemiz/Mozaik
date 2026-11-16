// When a plan file last left this browser, and since when there is work that
// no plan file holds.
//
// Why it exists (web audit, 2026-11-16). On the site the only copy of the
// work is this origin's localStorage, and Safari drops a site's storage after
// seven days without a visit; Firefox and Safari have no folder to write a
// second copy to either (folder.ts). The plan file is the one copy the browser
// cannot take away, so the program says when the last one was written (the
// top bar's tooltip) and, once, when changes have sat unsaved for a week
// (Notices.tsx).
//
// One JSON record in one key, a machine fact like the theme: it is about this
// browser, and a backup that carried it would tell another computer when THIS
// one last saved. Every write is guarded; a record that cannot be stored is a
// reminder that comes too early, never lost work.

import { useSyncExternalStore } from 'react';
import { FILE_SAVED_KEY, preference } from '../../leaf/preference';

export interface FileRecord {
  /** When a plan file (one plan or all of them) was last written, ms. */
  saved: number | null;
  /** When the first change after that file was made, ms; null when none. */
  changedSince: number | null;
}

/** A week: the Safari limit above, and rare enough not to nag. */
export const REMIND_AFTER = 7 * 24 * 60 * 60 * 1000;

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null;
}

/** Takes the stored text or a record and gives a legal record. */
function normalize(raw: unknown): FileRecord {
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  const o = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Record<
    string,
    unknown
  >;
  // Both shapes: the stored one (Turkish, like every key's content) and the
  // record a caller holds.
  return {
    saved: num(o.dosya ?? o.saved),
    changedSince: num(o.degisiklik ?? o.changedSince),
  };
}

const record = preference<FileRecord>({
  key: FILE_SAVED_KEY,
  normalize,
  fallback: () => ({ saved: null, changedSince: null }),
  encode: (r) => {
    const out: Record<string, number> = {};
    if (r.saved !== null) out.dosya = r.saved;
    if (r.changedSince !== null) out.degisiklik = r.changedSince;
    return JSON.stringify(out);
  },
});

export const readFileRecord = record.read;

// Read once, then kept: `markChanged` runs on every change and should not
// parse JSON each time, and the screen subscribes to the same copy.
let cached: FileRecord | null = null;
const listeners = new Set<() => void>();

function snapshot(): FileRecord {
  cached ??= readFileRecord();
  return cached;
}

function write(r: FileRecord): void {
  record.write(r);
  cached = r;
  for (const l of listeners) l();
}

/** The record, kept current on screen. */
export function useFileRecord(): FileRecord {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    snapshot,
    snapshot,
  );
}

/** Tests only: forget the copy kept in memory. */
export function forgetFileRecord(): void {
  cached = null;
}

/** A plan file was just handed to the browser (a cancelled save dialog counts too: the page cannot tell). */
export function markFileSaved(now: number = Date.now()): void {
  write({ saved: now, changedSince: null });
}

/** Something changed. Only the FIRST change after a file is remembered. */
export function markChanged(now: number = Date.now()): void {
  const r = snapshot();
  if (r.changedSince !== null) return;
  write({ ...r, changedSince: now });
}

/** Changes no plan file holds, older than a week. */
export function reminderDue(r: FileRecord, now: number = Date.now()): boolean {
  return r.changedSince !== null && now - r.changedSince >= REMIND_AFTER;
}

/** The local date of a timestamp as `YYYY-MM-DD`, for `tarihYazisi`. */
export function isoDay(ms: number): string {
  const d = new Date(ms);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}
