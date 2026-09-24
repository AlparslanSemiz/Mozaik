// `npm run exe:linux`: after `npm run exe` has built the program for this
// machine, put it where it can be found and double-clicked: dist-exe/Mozaik.
//
// For development and testing only. The Linux build is not published, and it
// does not replace itself -- `self_update_here()` in src-tauri/src/update.rs
// refuses, because the only download the manifest names is the Windows exe.

import { chmodSync, copyFileSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

if (process.platform !== 'linux') {
  console.error("exe:linux yalnız Linux'ta anlamlı: burada `npm run exe` Windows exe'sini üretir.");
  process.exit(1);
}

const KOK = resolve(import.meta.dirname, '..');
const kaynak = join(KOK, 'src-tauri', 'target', 'release', 'ders-programi');
const hedef = join(KOK, 'dist-exe', 'Mozaik');

mkdirSync(join(KOK, 'dist-exe'), { recursive: true });
// Removed first: copying over a program that is still running fails with
// ETXTBSY, while unlinking it is allowed and leaves the running copy alone.
rmSync(hedef, { force: true });
copyFileSync(kaynak, hedef);
chmodSync(hedef, 0o755);

const sha = createHash('sha256').update(readFileSync(hedef)).digest('hex');
console.log(`${hedef}\n${statSync(hedef).size} bayt\nsha256 ${sha}`);
