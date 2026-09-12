// The documents, read against the repository they describe.
//
// Seventeen stale claims were found BY HAND when CLAUDE.md was split into
// docs/: the schema said 11 and the code said 14, the icon threshold was
// wrong, the default language was wrong, the i18n sentence had been wrong for
// two releases, the tab count was wrong. Every one of them was found by
// somebody reading, which means the next one will not be.
//
// Writing the rule down again does not work, and this project already knows
// it: "a rule written as a single source is a wish until a test measures it"
// (pitfall 77). So this file is the same shape as `surum.test.ts` — two
// sources read against each other, red when they drift — pointed at prose
// instead of version numbers.
//
// WHAT IS IN SCOPE, and it is a kind of document rather than an owner.
//
//   RULE DOCUMENTS say what is true today. All seven gates apply.
//   DATED RECORDS say what was true on a day, and CONVENTIONS.md forbids
//   correcting them afterwards ("Tarihli kayıtlar geriye dönük düzeltilmez").
//   A path that has since been deleted is the POINT of such an entry, so the
//   path, identifier, number, schema and key gates skip them. The two that
//   still apply there are the ones a dated record cannot be right about
//   retroactively either: a trap number that names nothing, and a link that
//   does not resolve.
//
// There is no exemption list beyond that split, on purpose. A gate with an
// exemption never sees what collects behind it, and the exemption widens.
//
// Read through Vite rather than `node:fs`, for the reason `surum.test.ts`
// gives at its own head: `src/` compiles without Node's types on purpose.

import { describe, expect, it } from 'vitest';

import { SCHEMA_VERSION } from './leaf/types';
import { BACKUP_COUNT, backupKey, BASE_KEY, LIBRARY_KEY, planKey } from './pure/library';
import { PREFERENCE_ROWS } from './leaf/preferenceKeys';

// ------------------------------------------------------------------ reading

/** Every document, keyed by its repository path. */
const DOCS: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob(['../docs/**/*.md', '../*.md'], {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).map(([key, text]) => [key.replace(/^\.\.\//, ''), text as string]),
);

/**
 * Every source file whose comments can cite a trap. Not only `src/`: the
 * citation is a comment, and comments live in the build files, the Rust, the
 * installer, the service worker and the workflows too. Ownership does not
 * narrow this — the test session's Playwright and Stryker configuration
 * carries citations like everything else, and a gate that stopped at the door
 * of somebody else's file would be an exemption with a different name.
 *
 * The lock files are left out because they cannot hold a comment, and reading
 * a megabyte of JSON to look for one is pitfall 111's cost for nothing.
 */
const SOURCE: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      [
        './**/*.{ts,tsx,css}',
        '../e2e/**/*.ts',
        '../scripts/**/*.mjs',
        '../*.{ts,js,mjs}',
        '../index.html',
        '../src-tauri/**/*.rs',
        '../src-tauri/*.toml',
        '../kurulum/**/*.{ps1,cmd,txt}',
        '../site/**/*.{js,svg,webmanifest}',
        '../.github/workflows/*.yml',
      ],
      {
        query: '?raw',
        import: 'default',
        eager: true,
      },
    ),
  ).map(([key, text]) => [key.replace(/^\.\//, 'src/').replace(/^\.\.\//, ''), text as string]),
);

/**
 * Which files are on disk. Lazy on purpose: the keys are the answer and the
 * contents are not, and asking for the contents of a wildcard extension kills
 * the run (pitfall 111, and `raw.d.ts` says it next to the declaration).
 */
const FILES: Set<string> = new Set(
  Object.keys(
    import.meta.glob([
      './**/*',
      '../e2e/**/*',
      '../scripts/**/*',
      '../site/**/*',
      '../kurulum/**/*',
      '../src-tauri/*.*',
      '../src-tauri/src/**/*',
      // `docs/asc/` is 62 MB of screenshots. Lazy, so this is 179 names and
      // not one byte of PNG.
      '../docs/**/*',
      // `*` and not `*.*`: `LICENSE` carries no extension and README links to it.
      '../*',
      // Dotted names do not match a bare `*`, and three of them are cited by
      // the documents: `.github/`, `.claude/` and `.mcp.json`.
      '../.*',
      '../.github/**/*',
      '../.claude/**/*',
    ]),
  ).map((key) => key.replace(/^\.\//, 'src/').replace(/^\.\.\//, '')),
)
  // Vite leaves the IMPORTING file out of its own glob, so this gate is blind
  // to its own name and would call every document that cites it stale, for
  // good (pitfall 112). Measured, not assumed: `src/drag.ts` and
  // `src/surum.test.ts` come back true from the same glob and this one false.
  .add('src/docs.test.ts');

/** Every directory any of those files sits in, with its trailing slash. */
const DIRS: ReadonlySet<string> = new Set(
  [...FILES].flatMap((file) => {
    const out: string[] = [];
    const parts = file.split('/');
    for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join('/') + '/');
    return out;
  }),
);

/** A file's own basename, for the documents that name one without its folder. */
const BY_BASENAME: ReadonlySet<string> = new Set(
  [...FILES].map((file) => file.slice(file.lastIndexOf('/') + 1)),
);

/**
 * Documents that record a day rather than state a rule. See the head of this
 * file: they are not corrected afterwards, so most of the gates would be
 * asking them to lie about their own date.
 */
const DATED_RECORD = new Set([
  'docs/WORKLOG.md',
  'docs/TODO.md',
  'docs/DECISIONS.md',
  'docs/TESTFINDINGS.md',
  'docs/plan-v0-arsiv.md',
  'CHANGELOG.md',
]);

const RULE_DOCS = Object.keys(DOCS)
  .filter((d) => !DATED_RECORD.has(d))
  .sort();

/** `[lineNumber, text]` for every line outside a fenced code block. */
function prose(text: string): Array<[number, string]> {
  const out: Array<[number, string]> = [];
  let fenced = false;
  text.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (!fenced) out.push([i + 1, line]);
  });
  return out;
}

/** Every backticked run in a line, with the line number. */
function ticked(doc: string): Array<{ line: number; token: string }> {
  const out: Array<{ line: number; token: string }> = [];
  for (const [line, text] of prose(DOCS[doc] ?? '')) {
    for (const m of text.matchAll(/`([^`\n]+)`/g)) out.push({ line, token: m[1] ?? '' });
  }
  return out;
}

// ---------------------------------------------------------------- the guard

describe('okuma', () => {
  // Pitfall 109: a test that judges a source it reads asks FIRST whether the
  // read was empty. Vitest hands a stylesheet over as '' unless it is named in
  // `test.css.include`, and a gate over an empty string is green for nothing.
  it('her belge ve kaynak dolu okunuyor', () => {
    expect(RULE_DOCS.length).toBeGreaterThan(10);
    expect(Object.keys(SOURCE).length).toBeGreaterThan(50);
    expect(FILES.size).toBeGreaterThan(100);
    for (const [name, text] of Object.entries(DOCS)) {
      expect(text.length, `${name} boş okundu`).toBeGreaterThan(100);
    }
    for (const [name, text] of Object.entries(SOURCE)) {
      expect(text.length, `${name} boş okundu`).toBeGreaterThan(0);
    }
    expect(SOURCE['src/styles.css']?.length ?? 0).toBeGreaterThan(1000);
  });

  // The scope claim, made mechanical. Every one of these was outside the
  // globs until this test named it, and three of them carry trap citations
  // today: the patrol configuration, `vite.config.ts` and `index.html`. A
  // glob that quietly stops matching is a gate that quietly stops measuring.
  it('kapsam kaynağın her köşesine uzanıyor', () => {
    for (const name of [
      'index.html',
      'vite.config.ts',
      'playwright.patrol.config.ts',
      'src-tauri/src/lib.rs',
      'src-tauri/Cargo.toml',
      'kurulum/kur.ps1',
      'site/sw.js',
      '.github/workflows/surum.yml',
      'scripts/yayinla.mjs',
      'e2e/kapan.ts',
    ]) {
      expect(SOURCE[name], `${name} taranmıyor`).toBeDefined();
    }
    expect(DOCS['docs/asc/ekran-envanteri.md'], 'docs/asc okunmuyor').toBeDefined();
  });
});

// ------------------------------------------------------------ A1 · the path

/**
 * Extensions a document names a FILE with. Deliberately a list rather than
 * `\.\w+$`: this prose is full of dotted things that are not files, and every
 * one of them was measured rather than guessed — `Teacher.subject2`,
 * `React.memo`, `table.grid`, `Intl.PluralRules`, `1.75rem`, `127.0.0.1`,
 * `com.dersprogrami.arac`. None of them end in one of these.
 */
const FILE_EXT =
  /\.(ts|tsx|js|mjs|cjs|json|md|css|rs|toml|yml|yaml|ps1|cmd|txt|html|woff2|ico|svg|png|webmanifest)$/;

/** The narrower half, for a name written WITHOUT its folder. An image or a
    binary named on its own is almost always an output rather than a path. */
const BARE_EXT = /\.(ts|tsx|js|mjs|cjs|json|md|css|rs|toml|yml|yaml|ps1|cmd|txt|html)$/;

/** Produced by a build, so absent from a clean checkout. */
const GENERATED_DIR =
  /^(dist|dist-site|dist-kurulum|test-results|playwright-report|node_modules|scratch)\//;

/**
 * Produced by the release workflow rather than held in the repository. The
 * same category as `dist/`, but these have no folder to recognise them by:
 * they are the five assets BUILD.md's own table lists.
 */
const RELEASE_ASSET = new Set([
  'Mozaik.html',
  'Mozaik.exe',
  'Mozaik-Windows-kurulum.zip',
  'SHA256SUMS.txt',
  'surum.json',
]);

/** A token that cannot be a path, each class measured against the documents. */
function notAPath(token: string): boolean {
  // prose, a glob, a placeholder, a Windows path, an expression
  if (/[\s*{}…\\<>%()?'"]/.test(token)) return true;
  // an address, not a location on this disk
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(token)) return true;
  // an npm package, a home directory, an absolute path
  if (/^[@~/]/.test(token)) return true;
  // `..` is either somewhere outside this repository (`../Mozaik-test`) or a
  // range inside a name (`Demo1..4.roz`)
  if (token.includes('..')) return true;
  // a bare extension being talked about: `.cmd`, `.tsx`
  if (/^\.[a-z0-9]+$/i.test(token)) return true;
  // a name with a date placeholder is a pattern: `ders-programi-YYYY-AA-GG.json`
  if (token.includes('YYYY')) return true;
  return false;
}

/** Whether this token is shaped like a path at all, and which half it is. */
function pathShaped(token: string): boolean {
  if (notAPath(token)) return false;
  const clean = token.replace(/^\.\//, '');
  if (clean.includes('/')) {
    // a directory, or a name with an extension in its last segment. Without
    // this, `try/catch`, `Teacher/ClassGroup/Lesson` and `34/2` all read as
    // paths, and they are prose with a slash in it.
    const last = clean.slice(clean.lastIndexOf('/') + 1);
    return last === '' || FILE_EXT.test(last);
  }
  return BARE_EXT.test(clean) && !RELEASE_ASSET.has(clean);
}

function resolves(token: string): boolean {
  const clean = token.replace(/^\.\//, '');
  if (GENERATED_DIR.test(clean)) return true;
  if (FILES.has(clean) || DIRS.has(clean) || DIRS.has(clean + '/')) return true;
  if (!clean.includes('/')) return BY_BASENAME.has(clean);
  // A document may name a file by the part of its path that identifies it:
  // `setup/Teachers.tsx` for `src/components/setup/Teachers.tsx`.
  const tail = '/' + clean.replace(/\/$/, '');
  return [...FILES].some((f) => f.endsWith(tail)) || [...DIRS].some((d) => d.endsWith(tail + '/'));
}

describe('A1 · belgelerde geçen her yol diskte var', () => {
  // The guarantee the move round leans on: `src/` is about to become four
  // folders, and every document that names a file by its path is about to be
  // wrong unless something reads them.
  it('kural belgelerindeki yollar çözülüyor', () => {
    const stale: string[] = [];
    let checked = 0;
    for (const doc of RULE_DOCS) {
      for (const { line, token } of ticked(doc)) {
        if (!pathShaped(token)) continue;
        checked++;
        if (!resolves(token)) stale.push(`${doc}:${line}  ${token}`);
      }
    }
    expect(checked, 'hiç yol taranmadı, tarayıcı bozuk').toBeGreaterThan(200);
    expect(stale, `${checked} yol tarandı`).toEqual([]);
  });
});

// ------------------------------------------------------ A2 · the identifier

/**
 * Words a document writes in backticks that are not this project's to export.
 * Measured rather than guessed: the list is what the gate reported the first
 * time it ran, read one by one.
 */
const NOT_OURS = new Set([
  'FileSystemDirectoryHandle', // the browser's
  'requestAnimationFrame',
  'useState', // React's
  'React',
  'Pointer',
  'Events',
]);

/** Rows of ARCHITECTURE.md's file map: `| \`path\` | what it does |`. */
function fileMapRows(): Array<{ line: number; file: string; says: string }> {
  const out: Array<{ line: number; file: string; says: string }> = [];
  for (const [line, text] of prose(DOCS['docs/ARCHITECTURE.md'] ?? '')) {
    const m = /^\|\s*`([^`]+\.tsx?)`\s*\|(.*)\|\s*$/.exec(text);
    if (m) out.push({ line, file: 'src/' + (m[1] ?? ''), says: m[2] ?? '' });
  }
  return out;
}

describe('A2 · dosya haritasının adları kaynakta var', () => {
  // A renamed function turns the map into a lie without touching it, and the
  // map is the first thing anybody reads to find where something lives.
  //
  // The claim is that the name is IN THAT FILE, not that it is exported from
  // somewhere. The second form was tried first and reported nine names that
  // are all fine: `poolSort` and `poolFilter` are fields of what a hook
  // returns, `Grid` is a default export, `placedHours` is a field of the
  // index. Asking the row's own file is both narrower and the actual claim
  // the row is making.
  it('her satırın tanımlayıcıları kendi dosyasında geçiyor', () => {
    const stale: string[] = [];
    let checked = 0;
    for (const { line, file, says } of fileMapRows()) {
      const text = SOURCE[file];
      if (text === undefined) {
        stale.push(`docs/ARCHITECTURE.md:${line}  ${file} diskte yok`);
        continue;
      }
      for (const m of says.matchAll(/`([A-Za-z_$][A-Za-z0-9_$]*)(\(\))?`/g)) {
        const name = m[1] ?? '';
        if (NOT_OURS.has(name)) continue;
        // identifier-shaped: camelCase, a call, or a SHOUTED constant. A lone
        // capitalised word in Turkish prose is a word.
        const shaped = m[2] !== undefined || /[a-z][A-Z]/.test(name) || /^[A-Z_]{2,}$/.test(name);
        if (!shaped) continue;
        checked++;
        if (!new RegExp(`\\b${name}\\b`).test(text)) {
          stale.push(`docs/ARCHITECTURE.md:${line}  \`${name}\` ${file} içinde yok`);
        }
      }
    }
    expect(fileMapRows().length, 'dosya haritası okunamadı').toBeGreaterThan(40);
    expect(checked, 'hiç tanımlayıcı taranmadı').toBeGreaterThan(20);
    expect(stale, `${checked} tanımlayıcı tarandı`).toEqual([]);
  });
});

// ---------------------------------------------------------- A3 · the number

/**
 * Numbers the repository can COUNT AGAIN today, which is the whole of the
 * rule: two sessions work on this tree at once and a test count, a byte figure
 * or a suite duration written into a rule document is wrong within a day.
 *
 * Measurements of the platform are not in this set and the reason is a
 * definition rather than an exemption: `553 ms` for a view transition, `1ch`
 * resolving to 6,86 px, a 4 ms clamp on nested timeouts are OBSERVATIONS, and
 * they are the content of the trap that carries them. Nothing in this
 * repository recounts them.
 */
const RECOUNTABLE: ReadonlyArray<{ what: string; re: RegExp }> = [
  { what: 'test sayısı', re: /\b\d[\d .]*\s*(?:test|testi|testlik|spec dosyası)\b/g },
  { what: 'bayt', re: /\b\d[\d .,]*\s*(?:bayt|byte|KB|MB)\b/g },
  { what: 'süit süresi', re: /\b\d[\d .,]*\s*(?:dk|dakikada|sn)\b/g },
];

/** A seven-character commit id on the same line: the number is dated. */
const HAS_COMMIT = /\b[0-9a-f]{7}\b/;

/**
 * A heading that carries a date opens a block of RECORD inside a rule
 * document, and DESIGN.md's "Ölçülenler (2026-08-26)" says so in its own
 * words: "Bunlar birer tarih, kural değil". A measurement under such a
 * heading is already doing what CONVENTIONS asks of it.
 */
const DATED_HEADING = /^#{2,6}\s.*\d{4}-\d{2}-\d{2}/;

/** Every line, with whether the heading above it carries a date. */
function underDatedHeading(text: string): boolean[] {
  let dated = false;
  return text.split('\n').map((line) => {
    if (/^#{1,6}\s/.test(line)) dated = DATED_HEADING.test(line);
    return dated;
  });
}

describe('A3 · kural belgelerinde tarihsiz mutlak sayı yok', () => {
  // CONVENTIONS.md already says it: dated measurements live in WORKLOG's
  // entries, not in the rule documents. This is that sentence with a test
  // under it. A number either becomes qualitative or carries the commit it
  // was measured at.
  it('sayılabilir her sayı ya niteliksel ya commit özetli', () => {
    const bare: string[] = [];
    let checked = 0;
    for (const doc of RULE_DOCS) {
      const body = DOCS[doc] ?? '';
      const dated = underDatedHeading(body);
      // Fenced blocks are read here, unlike the path gate: DESIGN.md keeps its
      // measurement tables in one, and a stale byte figure does not stop being
      // stale for sitting between backticks.
      body.split('\n').forEach((text, i) => {
        if (dated[i] === true || HAS_COMMIT.test(text)) return;
        for (const { what, re } of RECOUNTABLE) {
          for (const m of text.matchAll(re)) {
            checked++;
            bare.push(`${doc}:${i + 1}  ${what}: "${m[0].trim()}"`);
          }
        }
      });
    }
    expect(bare).toEqual([]);
    expect(checked).toBe(0);
  });
});

// ---------------------------------------------------------- A4 · the schema

describe('A4 · DATA.md ile SCHEMA_VERSION aynı sayıyı söylüyor', () => {
  // The most expensive stale line of the last round: the document said 11 and
  // the code said 14. One line each side, and nothing compared them.
  const data = () => DOCS['docs/DATA.md'] ?? '';

  it('belgedeki her schemaVersion kaynaktaki sabit', () => {
    const written = [...data().matchAll(/"?schemaVersion"?:\s*(\d+)/g)].map((m) => Number(m[1]));
    expect(written.length, 'DATA.md içinde schemaVersion yazmıyor').toBeGreaterThan(0);
    for (const n of written) expect(n).toBe(SCHEMA_VERSION);
  });

  it('sürüm tablosu v1’den bugüne kesintisiz', () => {
    // A migration that got a number but no row is a migration nobody can look
    // up, and the row is where the next reader learns what changed.
    const rows = [...data().matchAll(/^\|\s*v(\d+)\s*\|/gm)].map((m) => Number(m[1]));
    expect(rows).toEqual(Array.from({ length: SCHEMA_VERSION }, (_, i) => i + 1));
  });
});

// --------------------------------------------------- A5 · the storage keys

/** Every key the program actually owns, DERIVED the way the report derives it. */
const OWNED_KEYS: ReadonlySet<string> = new Set([
  BASE_KEY,
  LIBRARY_KEY,
  ...Array.from({ length: BACKUP_COUNT }, (_, i) => backupKey(i)),
  ...PREFERENCE_ROWS.map((row) => row.key),
]);

/** The keys DATA.md's table names, with its two shorthands expanded. */
function documentedKeys(): Set<string> {
  const table = /## Depolama anahtarları([\s\S]*?)\n## /.exec(DOCS['docs/DATA.md'] ?? '');
  expect(table, 'DATA.md içinde anahtar tablosu yok').not.toBeNull();
  const out = new Set<string>();
  for (const [, row] of prose(table?.[1] ?? '').filter(([, t]) => t.startsWith('|'))) {
    const cell = row.slice(1, row.indexOf('|', 1));
    let prefix = '';
    for (const m of cell.matchAll(/`([^`]+)`/g)) {
      const key = m[1] ?? '';
      // `ders-programi-yedek-0`, `-1`, `-2`: the short ones continue the one
      // before them, which is how a person reads the row.
      if (key.startsWith('-') && prefix !== '') {
        out.add(prefix.replace(/-\d+$/, '') + key);
        continue;
      }
      prefix = key;
      out.add(key);
    }
  }
  return out;
}

describe('A5 · DATA.md’nin anahtar tablosu kodun yazdığı küme', () => {
  // The table's ONE job is being trusted when somebody asks "is all of it in
  // here?". `ders-programi-baski` was missing from it for weeks. The code side
  // is already derived and already measured (`library.test.ts`); this is the
  // document side, which is typed by hand.
  it('kodun sahip olduğu her anahtar tabloda var', () => {
    const documented = documentedKeys();
    const missing = [...OWNED_KEYS].filter((key) => !documented.has(key));
    expect(missing, 'DATA.md’nin tablosunda eksik').toEqual([]);
  });

  it('tabloda kodun sahip olmadığı anahtar yok', () => {
    // A key a table names and nothing writes is the same defect facing the
    // other way: it sends somebody looking for data that is not there.
    // One row stands for every plan but the first, and its shape is asked of
    // the function that builds it rather than typed here.
    const planRow = planKey('<id>');
    const documented = documentedKeys();
    expect(documented, 'plan satırı tabloda yok').toContain(planRow);
    const extra = [...documented].filter(
      (key) => !OWNED_KEYS.has(key) && key !== planRow && key.startsWith(BASE_KEY),
    );
    expect(extra, 'kod bu anahtarı yazmıyor').toEqual([]);
  });
});

// ----------------------------------------------------- A6 · the trap number

const TRAPS = () => DOCS['docs/TRAPS.md'] ?? '';

/** The traps TRAPS.md actually defines. */
function definedTraps(): Set<number> {
  const out = new Set([...TRAPS().matchAll(/^### (\d+) ·/gm)].map((m) => Number(m[1])));
  expect(out.size, 'TRAPS.md okunamadı').toBeGreaterThan(80);
  return out;
}

/**
 * The numbers TRAPS.md says it TOOK OUT, read from the sentence that says so
 * rather than typed here. They are not reused, because a citation in an old
 * record would then point at the wrong trap, so a dated record may still
 * carry one and a live file may not.
 */
function removedTraps(): Set<number> {
  const line = /\*\*Çıkarılan numaralar: ([^.]+)\.\*\*/.exec(TRAPS());
  expect(line, 'TRAPS.md çıkarılan numaraları söylemiyor').not.toBeNull();
  return new Set((line?.[1] ?? '').match(/\d+/g)?.map(Number) ?? []);
}

/** `tuzak 11`, `pitfall 58`, `tuzak 4 ve 5`, `tuzak 21 ve 105`, `Pitfall 108/109`. */
const CITATION = /(?:tuzak|pitfall)\s+(\d+(?:\s*(?:ve|,|and|ile|·|\/)\s*\d+)*)/gi;

/**
 * The sentence at the foot of TRAPS.md that declares the next free number.
 * It is not a citation, and the thing worth asserting about it is the
 * opposite: the number it names must NOT exist yet.
 */
const NEXT_FREE = /(?:tuzak|pitfall)\s+(\d+)['’]?[tdn][ae]n devam/i;

describe('A6 · her tuzak atfı TRAPS.md’de karşılığını buluyor', () => {
  // Close to eight hundred citations across the documents, the source and the
  // tests, and until this gate not one of them was checked. A number that
  // names nothing sends the reader to look up a rule that is not there, which
  // is worse than no citation: they conclude the rule was removed.
  it('canlı dosyalar ve kural belgeleri yalnız tanımlı tuzağı gösteriyor', () => {
    const defined = definedTraps();
    const removed = removedTraps();
    const bad: string[] = [];
    let total = 0;
    const everywhere: Array<[string, string]> = [
      ...Object.entries(DOCS),
      ...Object.entries(SOURCE),
    ];
    for (const [name, text] of everywhere) {
      const isRecord = DATED_RECORD.has(name);
      text.split('\n').forEach((line, i) => {
        if (NEXT_FREE.test(line)) return;
        for (const m of line.matchAll(CITATION)) {
          for (const digits of (m[1] ?? '').match(/\d+/g) ?? []) {
            const n = Number(digits);
            total++;
            if (defined.has(n)) continue;
            if (removed.has(n) && isRecord) continue;
            const why = removed.has(n) ? 'ÇIKARILMIŞ numara' : 'TRAPS.md’de yok';
            bad.push(`${name}:${i + 1}  tuzak ${n}  (${why})`);
          }
        }
      });
    }
    expect(SOURCE['src/leaf/raw.d.ts'], 'raw.d.ts taranmıyor').toBeDefined();
    expect(total, 'hiç atıf bulunamadı, tarayıcı bozuk').toBeGreaterThan(500);
    expect(bad, `${total} atıf tarandı`).toEqual([]);
  });

  it('TRAPS.md’nin duyurduğu sıradaki numara henüz kullanılmamış', () => {
    // The foot of the file tells the next session where to carry on, and that
    // sentence is the one number in the file nothing else would ever correct.
    // Numbers are permanent identity here, so a reused one would point an old
    // record at the wrong trap.
    const defined = definedTraps();
    const m = NEXT_FREE.exec(TRAPS());
    expect(m, 'TRAPS.md sıradaki numarayı söylemiyor').not.toBeNull();
    const next = Number(m?.[1]);
    expect(defined.has(next), `tuzak ${next} zaten yazılmış`).toBe(false);
    expect(next, 'sıradaki numara en büyüğün bir fazlası olmalı').toBe(Math.max(...defined) + 1);
  });
});

// ------------------------------------------------------------ A7 · the link

/** GitHub's heading slug, near enough for this repository's headings. */
function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** `docs/ARCHITECTURE.md` + `../CHANGELOG.md` -> `CHANGELOG.md`. */
function resolveFrom(doc: string, href: string): string {
  const dir = doc.includes('/') ? doc.slice(0, doc.lastIndexOf('/')) : '';
  const parts = (dir === '' ? [] : dir.split('/')).concat(href.split('/'));
  const out: string[] = [];
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

describe('A7 · her belge bağlantısı çözülüyor', () => {
  // Verified by hand during the split round, which is the same as saying it
  // will not be verified again. Thirteen documents point at each other and at
  // the source, and a link is the one part of a document a reader trusts
  // without reading.
  it('göreli bağlantılar ve çapaları yerini buluyor', () => {
    const broken: string[] = [];
    let checked = 0;
    for (const [doc, text] of Object.entries(DOCS)) {
      text.split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/\[([^\]\n]*)\]\(([^)\s]+)\)/g)) {
          const href = m[2] ?? '';
          if (/^[a-z][a-z0-9+.-]*:/.test(href) || href.startsWith('#')) continue;
          checked++;
          const [file, anchor] = href.split('#');
          const target = resolveFrom(doc, decodeURIComponent(file ?? ''));
          const isDir = DIRS.has(target) || DIRS.has(target + '/');
          if (!FILES.has(target) && !isDir) {
            broken.push(`${doc}:${i + 1}  [${m[1]}](${href})  hedef yok`);
            continue;
          }
          if (anchor === undefined) continue;
          const body = DOCS[target];
          if (body === undefined) continue; // not a document, so no headings
          const headings = new Set(
            [...body.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((h) => slug(h[1] ?? '')),
          );
          if (!headings.has(slug(decodeURIComponent(anchor)))) {
            broken.push(`${doc}:${i + 1}  [${m[1]}](${href})  başlık yok`);
          }
        }
      });
    }
    expect(checked, 'hiç bağlantı taranmadı').toBeGreaterThan(100);
    expect(broken, `${checked} bağlantı tarandı`).toEqual([]);
  });
});
