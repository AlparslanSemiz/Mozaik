// The Başlarken list on Okul: whether it is open, folded or closed, and the one
// step it cannot read from the plan (has anything been printed).

import { CHECKLIST_KEY, preference } from '../../leaf/preference';

/**
 * `auto` is the state nobody has chosen: open on an empty plan, folded once
 * lessons exist. A machine fact like the intro line (intro.ts): a backup must
 * not carry somebody else's "I closed this", and a hint is not worth a schema
 * migration.
 */
export type ChecklistShow = 'auto' | 'acik' | 'dar' | 'kapali';

export interface ChecklistPref {
  show: ChecklistShow;
  /** Yazdır was pressed on Çıktı once. The plan holds no trace of a printout. */
  printed: boolean;
}

const SHOWS: readonly ChecklistShow[] = ['auto', 'acik', 'dar', 'kapali'];
const NONE: ChecklistPref = { show: 'auto', printed: false };

function parse(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export const checklistPreference = preference<ChecklistPref>({
  key: CHECKLIST_KEY,
  normalize: (raw) => {
    const v = parse(raw);
    if (typeof v !== 'object' || v === null) return NONE;
    const o = v as Record<string, unknown>;
    return {
      show: SHOWS.includes(o.show as ChecklistShow) ? (o.show as ChecklistShow) : 'auto',
      printed: o.printed === true,
    };
  },
  fallback: () => NONE,
  encode: (v) => JSON.stringify(v),
});

export const readChecklist = checklistPreference.read;

export function writeChecklist(next: ChecklistPref): void {
  checklistPreference.write(next);
}

/** Called by Çıktı's Yazdır button: the last step ticks itself. */
export function markPrinted(): void {
  const now = readChecklist();
  if (!now.printed) writeChecklist({ ...now, printed: true });
}
