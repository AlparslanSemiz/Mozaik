// Handing the browser a file to save — defence layer 3, and the only one that
// leaves the machine's storage behind. Two kinds go out and they are NOT
// interchangeable (pitfall 30): one plan, or every plan in one envelope.

import { buildBundle } from './bundle';
import { backupFileName, bundleFileName } from './library';
import type { Library } from './library';
import { collectStates } from './state/planStorage';
import type { Id, State } from './types';

/** Both file kinds go through here. */
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

/**
 * One file holding EVERY plan. The single-plan file above is unchanged and
 * still what the top bar writes; this is the one that moves a whole setup
 * between two computers — and between the .exe and the site.
 *
 * Returns how many plans made it into the file.
 */
export function downloadBundle(library: Library, planId: Id, present: State): number {
  const states = collectStates(library, planId, present);
  download(bundleFileName(new Date()), buildBundle(library, states));
  return Object.keys(states).length;
}
