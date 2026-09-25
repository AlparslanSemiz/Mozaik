// A file, handed to the browser to save.
//
// Two kinds go out and both go through the same six lines: the single plan
// (the ONE habit my father is taught, PRINCIPLES) and the bundle that carries
// every plan between two computers. Names come from `pure/library.ts`, which
// is where a file name is decided; this module only puts the bytes in front of
// the browser.
//
// `platform/` and not `pure/` for a reason a reader can check in four lines:
// it makes an element, clicks it and revokes an object URL. The part that can
// be reasoned about without a browser — what goes IN the file — is
// `collectStates`, and it is here rather than one layer down because it reads
// the plans that are not on screen out of storage.

import { buildBundle } from '../pure/bundle';
import { backupFileName, bundleFileName, type Library } from '../pure/library';
import { loadPlan } from './planStore';
import { searchLog } from './relaxLog';
import type { Id, State } from '../leaf/types';

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
  URL.revokeObjectURL(url);
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

export function downloadBundle(library: Library, planId: Id, present: State): number {
  const states = collectStates(library, planId, present);
  download(bundleFileName(new Date()), buildBundle(library, states, searchLog()));
  return Object.keys(states).length;
}
