// The four sentence dictionaries, packed for the built file.
//
// What it saves: every dictionary is keyed by the whole Turkish sentence, so
// the same 1 200 Turkish sentences sat in dist/index.html four times, once per
// language, as object keys — 425 kB of the file's 1,3 MB (sourcemap count,
// 2026-11-16). Packed, the keys are written ONCE, as one string, and each
// language is one string of its translations in that same order. Nothing is
// compressed: brotli on the site still sees plain text, and the file opens
// without any decompression step.
//
// What it also saves: a language nobody picked is never turned into an object.
// The packed strings are only split the first time that language is asked for
// (`leaf/i18n`'s `sozlukOf`), so a Turkish opening — and every suggestion
// worker, which runs the same script — skips building four 1 200-key objects.
//
// Only the BUILD sees this. The dev server and vitest load the .ts files as
// they are written, so editing a dictionary, `i18n.test.ts` and the dead-key
// check work on the source. `paket.test.ts` checks the packed form against
// the same source, key for key.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANG = resolve(HERE, '..', 'src', 'leaf', 'lang');

/** The languages that have a dictionary file, in `leaf/lang/index.ts`'s order. */
export const PAKET_DILLER = ['en', 'de', 'es', 'fr'];

/**
 * Between two sentences in a packed string. A character no sentence uses,
 * one byte, and no escape in a JS string: `packSozlukler` refuses a
 * dictionary that contains it, so a translation cannot quietly split in two.
 * Must equal `PAKET_AYIRAC` in `src/leaf/i18n/i18n.ts` (paket.test.ts).
 */
export const PAKET_AYIRAC = '~';

/**
 * Reads one dictionary file the way the module would build it: the object
 * literal after `: Sozluk = {` up to the last `};`, evaluated as JavaScript.
 * The files hold string keys, string values and comments only, so that is all
 * the evaluation can meet; anything else fails `paket.test.ts`.
 *
 * @param {string} dil
 * @returns {Record<string, string>}
 */
export function readSozluk(dil) {
  const src = readFileSync(resolve(LANG, `${dil}.ts`), 'utf8');
  const start = src.indexOf(': Sozluk = {');
  const end = src.lastIndexOf('};');
  if (start < 0 || end < start)
    throw new Error(`sozluk-paket: ${dil}.ts has no "Sozluk = { ... };"`);
  const literal = src.slice(start + ': Sozluk = '.length, end + 1);
  return new Function(`return (${literal});`)();
}

/**
 * @param {Record<string, Record<string, string>>} sozlukler
 * @returns {{ keys: string, values: Record<string, string> }}
 */
export function packSozlukler(sozlukler) {
  /** @type {string[]} */
  const keys = [];
  const seen = new Set();
  for (const sozluk of Object.values(sozlukler)) {
    for (const key of Object.keys(sozluk)) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }
  for (const [dil, sozluk] of Object.entries(sozlukler)) {
    for (const [key, value] of Object.entries(sozluk)) {
      for (const s of [key, value]) {
        if (s.includes(PAKET_AYIRAC)) {
          throw new Error(`sozluk-paket: ${dil} uses "${PAKET_AYIRAC}" in ${JSON.stringify(s)}`);
        }
      }
      if (key === '__proto__') throw new Error(`sozluk-paket: ${dil} has a "__proto__" key`);
      // Empty is what a MISSING translation packs to, so a real one cannot be.
      if (value === '')
        throw new Error(`sozluk-paket: ${dil} translates ${JSON.stringify(key)} as ""`);
    }
  }
  /** @type {Record<string, string>} */
  const values = {};
  for (const [dil, sozluk] of Object.entries(sozlukler)) {
    // A key one language lacks is an empty slot, and the reader skips it, so
    // that language falls back to the Turkish exactly as before.
    values[dil] = keys.map((k) => sozluk[k] ?? '').join(PAKET_AYIRAC);
  }
  return { keys: keys.join(PAKET_AYIRAC), values };
}

const KEYS_ID = '\0sozluk-anahtarlar';

/**
 * The build-only plugin: each `leaf/lang/<dil>.ts` becomes one
 * `registerPaket` call, and the shared key string is one virtual module.
 *
 * @returns {import('vite').Plugin}
 */
export function sozlukPaketi() {
  /** @type {{ keys: string, values: Record<string, string> } | null} */
  let packed = null;
  const get = () => {
    packed ??= packSozlukler(Object.fromEntries(PAKET_DILLER.map((d) => [d, readSozluk(d)])));
    return packed;
  };
  const LANG_FILE = new RegExp(
    `[\\\\/]src[\\\\/]leaf[\\\\/]lang[\\\\/](${PAKET_DILLER.join('|')})\\.ts$`,
  );
  return {
    name: 'mozaik-sozluk-paketi',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      packed = null;
    },
    resolveId(id) {
      return id === KEYS_ID ? KEYS_ID : null;
    },
    load(id) {
      if (id === KEYS_ID) return `export default ${JSON.stringify(get().keys)};`;
      const m = LANG_FILE.exec(id);
      if (m === null) return null;
      const dil = /** @type {string} */ (m[1]);
      return [
        `import { registerPaket } from "../i18n";`,
        `import keys from ${JSON.stringify(KEYS_ID)};`,
        `registerPaket(${JSON.stringify(dil)}, keys, ${JSON.stringify(get().values[dil])});`,
      ].join('\n');
    },
  };
}
