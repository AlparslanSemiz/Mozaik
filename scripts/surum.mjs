// The ONE place a version number is produced.
//
// It is read by both vite configs (`define: __SURUM__`) and by the service
// worker stamp, so the four delivery routes cannot disagree about what they
// are. `isDesktop()`'s rule applies here too: this is not a build flag that
// makes one target different, it is the same number pressed into all of them.
//
// git may be missing (a downloaded tarball, a machine without git). That is
// not a build failure — the commit is extra, the version is the fact.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

/** @returns {{ version: string, commit: string, date: string }} */
export function surumBilgisi() {
  const pkg = JSON.parse(readFileSync(resolve(HERE, '..', 'package.json'), 'utf8'));
  let commit = '';
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: resolve(HERE, '..'),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    commit = ''; // no git, no repository, shallow copy — all fine
  }
  return { version: pkg.version, commit, date: new Date().toISOString().slice(0, 10) };
}

/**
 * The part of the service worker's cache name that MOVES. site/sw.js writes
 * the readable prefix itself (`ders-programi-__SURUM__`) and the build swaps
 * only this in, so a person opening site/sw.js still sees a cache name.
 *
 * A cache name that does not move with the build is the whole bug this exists
 * to close: `install` only runs when sw.js CHANGES, and an unchanged cache
 * name means the shell is never re-fetched — so a new deploy arrives one load
 * late, silently.
 */
export function surumEki(bilgi = surumBilgisi()) {
  return `${bilgi.version}${bilgi.commit === '' ? '' : `-${bilgi.commit}`}`;
}

/** The whole cache name, for anything that has to predict it (tests). */
export function cacheAdi(bilgi = surumBilgisi()) {
  return `ders-programi-${surumEki(bilgi)}`;
}
