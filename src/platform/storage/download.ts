// A file, handed to the browser to save.
//
// Two kinds go out and both go through the same six lines: the single plan
// (the ONE habit my father is taught, PRINCIPLES) and the bundle that carries
// every plan between two computers. Names come from `pure/io/library.ts`, which
// is where a file name is decided; this module only puts the bytes in front of
// the browser.
//
// `platform/` and not `pure/` for a reason a reader can check in four lines:
// it makes an element, clicks it and revokes an object URL. The part that can
// be reasoned about without a browser — what goes IN the file — is
// `collectStates`, and it is here rather than one layer down because it reads
// the plans that are not on screen out of storage.

import { buildBundle, backupFileName, bundleFileName, type Library } from '../../pure/io';
import { loadPlan } from './planStore';
import { searchLog } from '../search';
import { markFileSaved } from './fileSaved';
import type { Id, State } from '../../leaf/model';

/**
 * How long the object URL outlives the click. Revoking it in the same tick
 * (as this did until 2026-11-16) lets some WebKit builds drop the download:
 * the click only STARTS it, and the browser reads the blob afterwards. Half a
 * minute is long past any read of a file this size, and the blob is freed
 * when the page goes anyway.
 */
export const REVOKE_AFTER = 30_000;

/** Hands the browser a file to save. Both file kinds go through here. */
function download(name: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER);
  markFileSaved();
}

export function downloadBackup(d: State): void {
  download(backupFileName(new Date()), JSON.stringify(d));
}

// ------------------------------------------------------------- the bundle
//
// One file holding EVERY plan. The single-plan file is unchanged and still
// what the top bar writes; this is the one that moves a whole setup between
// two computers — and, once the .exe and the site exist, between those two.

/**
 * The state of every plan in the library.
 *
 * The OPEN plan comes from memory, not from its key: the autosave is debounced
 * by 400 ms, so the key can be a few hundred milliseconds behind what is on
 * screen, and a backup that quietly drops the last edit is worse than none.
 * A plan whose key is gone is skipped rather than exported empty.
 */
export function collectStates(library: Library, planId: Id, present: State): Record<Id, State> {
  const out: Record<Id, State> = {};
  for (const plan of library.plans) {
    const state = plan.id === planId ? present : loadPlan(plan.id);
    if (state !== null) out[plan.id] = state;
  }
  return out;
}

/** The all-plans file's text: what "Tümünü dosyaya kaydet" writes and the move sends. */
export function bundleText(library: Library, planId: Id, present: State): string {
  return buildBundle(library, collectStates(library, planId, present), searchLog());
}

export function downloadBundle(library: Library, planId: Id, present: State): number {
  const states = collectStates(library, planId, present);
  download(bundleFileName(new Date()), buildBundle(library, states, searchLog()));
  return Object.keys(states).length;
}
