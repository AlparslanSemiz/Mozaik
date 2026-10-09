// The site suite's port. It used to be 4173 for every checkout, with
// `reuseExistingServer: true`: when a second worktree's suite started while
// another worktree's `vite preview` held 4173, Playwright found the port
// answering, never ran its own command, and tested the OTHER folder's build
// while reporting green for this one.
//
// So the port belongs to the folder: MOZAIK_SITE_PORT when it is set, 4173 in
// CI (a fresh runner, one checkout), and otherwise a number between 20000 and
// 39999 taken from this checkout's real path. The config no longer reuses a
// server, and siteIdentity.ts checks that what answers is this folder's
// dist-site.

import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';

export function sitePort(): number {
  const given = process.env['MOZAIK_SITE_PORT'];
  if (given !== undefined && given !== '') {
    const port = Number(given);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      throw new Error(`MOZAIK_SITE_PORT bir port değil: ${given}`);
    }
    return port;
  }
  if (process.env['CI']) return 4173;
  const digest = createHash('sha1').update(realpathSync(process.cwd())).digest();
  return 20000 + (digest.readUInt16BE(0) % 20000);
}
