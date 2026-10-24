// The documents, read for their STRUCTURE: every link, path and trap number
// they cite resolves, and the sections a session is sent to exist.
//
// Until 2026-10-23 this file also pinned what sentences said (the file map's
// names, the schema number, the storage key table, bare numbers, the mutation
// sentence, the trap index). Those were cut (DECISIONS 2026-10-23): a gate on
// wording made every documentation edit a test edit. What stays is what a
// reader trusts without reading: that a reference points somewhere.
//
// WHAT IS IN SCOPE, and it is a kind of document rather than an owner.
//
//   RULE DOCUMENTS say what is true today, and every gate applies.
//   DATED RECORDS say what was true on a day, and CONVENTIONS.md forbids
//   correcting them afterwards ("Tarihli kayıtlar geriye dönük düzeltilmez").
//   A path that has since been deleted is the POINT of such an entry, so the
//   path gate skips them. A trap number that names nothing and a link that
//   does not resolve are checked there too.
//
// Read through Vite rather than `node:fs`, for the reason `surum.test.ts`
// gives at its own head: `src/` compiles without Node's types on purpose.

import { describe, expect, it } from 'vitest';

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
 * The configuration, read the same way. A path lives in two kinds of place in
 * this repository and only one of them had a gate: the documents describe
 * paths, and the configuration USES them. The move round found four of the
 * second kind by hand and two of them would have failed silently — the
 * mutation list would have stopped measuring, and the release script would
 * have said "note not found".
 *
 * Named one by one rather than globbed, because the two lock files are a
 * megabyte of strings that cannot be a path this repository owns.
 */
const CONFIG: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      [
        '../.prettierignore',
        '../.gitignore',
        '../knip.json',
        '../stryker.config.json',
        '../package.json',
        '../tsconfig.json',
        '../tsconfig.tools.json',
        '../src-tauri/tauri.conf.json',
        '../*.config.{ts,js,cjs,mjs}',
        '../.dependency-cruiser.cjs',
        '../scripts/**/*.mjs',
        '../index.html',
      ],
      { query: '?raw', import: 'default', eager: true },
    ),
  ).map(([key, text]) => [key.replace(/^\.\.\//, ''), text as string]),
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
  'docs/TODO-ARCHIVE.md',
  'docs/DECISIONS.md',
  'docs/TESTFINDINGS.md',
  'docs/plan-v0-arsiv.md',
  'CHANGELOG.md',
]);

const RULE_DOCS = Object.keys(DOCS)
  .filter((d) => !DATED_RECORD.has(d))
  .sort();

/**
 * TODO.md is both kinds of document at once, which the split by file could
 * not see: `§10` down was the archive of finished rounds (since 2026-10-09 it
 * is one line pointing at TODO-ARCHIVE.md, a dated record), and a `- [x]` item
 * anywhere is a record of what was done, but an OPEN item is a claim about
 * today — somebody is going to act on it, and a path in it will be looked up.
 *
 * So the open items are read as a rule document. Measured before it was
 * written: the move round left five stale paths in there and the file gate saw
 * none of them.
 */
function openTodoLines(): ReadonlySet<number> {
  const live = new Set<number>();
  let open = false;
  const body = DOCS['docs/TODO.md'] ?? '';
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^## §10/.test(line)) break;
    const item = /^\s*- \[( |x)\] /.exec(line);
    if (item !== null) open = item[1] === ' ';
    else if (/^#{1,6}\s/.test(line)) open = false;
    if (open) live.add(i + 1);
  }
  expect(live.size, 'TODO.md’de açık madde bulunamadı').toBeGreaterThan(100);
  return live;
}

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
    // The same claim for A8: a configuration file that stops being read is a
    // configuration file that stops being checked.
    for (const name of [
      '.prettierignore',
      '.gitignore',
      'knip.json',
      'stryker.config.json',
      'package.json',
      'tsconfig.json',
      'tsconfig.tools.json',
      'src-tauri/tauri.conf.json',
      'vite.config.ts',
      'vite.site.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
      '.dependency-cruiser.cjs',
      'index.html',
      'scripts/yayinla.mjs',
    ]) {
      expect(CONFIG[name], `${name} taranmıyor`).toBeDefined();
    }
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

/** Produced by a build, so absent from a clean checkout. `dist-exe` and
    `src-tauri/target` joined the list with `npm run exe:linux` (2026-09-24):
    the Linux binary cargo writes and the copy the script puts beside it. */
const GENERATED_DIR =
  /^(dist|dist-site|dist-kurulum|dist-exe|src-tauri\/target|test-results|playwright-report|node_modules|scratch)\//;

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
  // `setup/Teachers.tsx` for `src/ui/setup/Teachers.tsx`.
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
    const openTodo = openTodoLines();
    for (const doc of [...RULE_DOCS, 'docs/TODO.md']) {
      const onlyOpen = doc === 'docs/TODO.md';
      for (const { line, token } of ticked(doc)) {
        if (onlyOpen && !openTodo.has(line)) continue;
        if (!pathShaped(token)) continue;
        checked++;
        if (!resolves(token)) stale.push(`${doc}:${line}  ${token}`);
      }
    }
    expect(checked, 'hiç yol taranmadı, tarayıcı bozuk').toBeGreaterThan(200);
    expect(stale, `${checked} yol tarandı`).toEqual([]);
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
          if (/^[a-z][a-z0-9+.-]*:/.test(href)) continue;
          checked++;
          const [file, anchor] = href.split('#');
          // `#anchor` alone points into the same document.
          const target = file === '' ? doc : resolveFrom(doc, decodeURIComponent(file ?? ''));
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

// ------------------------------------------------- A8 · the runtime path

/**
 * A path a configuration file names, wherever the shape of that file puts it:
 * a line in an ignore file, a string in JSON, a string literal in a config or
 * a script, an attribute in the HTML. One extractor per shape rather than one
 * clever regex, because an ignore file's line IS the path while a script's
 * path is quoted inside a sentence of code.
 */
function configPaths(name: string, text: string): Array<{ line: number; token: string }> {
  const out: Array<{ line: number; token: string }> = [];
  const push = (line: number, token: string) => out.push({ line, token });
  const lines = text.split('\n');
  if (name.endsWith('ignore')) {
    // `.gitignore`'s plain lines are the one place in the repository whose JOB
    // is naming things that are not here (`src-tauri/target/`, `.venv/`), so
    // only its negations claim that something exists. `.prettierignore` is the
    // other way round: it names folders it must skip while formatting, and
    // `src/lang/` sitting there after the move is the bug this gate is for.
    const onlyNegated = name === '.gitignore';
    lines.forEach((raw, i) => {
      const line = raw.trim();
      if (line === '' || line.startsWith('#')) return;
      if (onlyNegated && !line.startsWith('!')) return;
      push(i + 1, line.replace(/^!/, ''));
    });
    return out;
  }
  if (name.endsWith('.html')) {
    // `/src/ui/main.tsx` is root relative to Vite, not to the disk.
    lines.forEach((raw, i) => {
      for (const m of raw.matchAll(/(?:src|href)="([^"]+)"/g))
        push(i + 1, (m[1] ?? '').replace(/^\//, ''));
    });
    return out;
  }
  // JSON and source alike: every quoted string. A `.json` has nothing else in
  // it, and a config or a script keeps its paths in quotes too. `package.json`
  // is the exception in shape: its values are whole command lines, so a path
  // in there is a word inside a sentence (`node scripts/yayinla.mjs`).
  const words = name === 'package.json';
  lines.forEach((raw, i) => {
    for (const m of raw.matchAll(/'([^'\n]*)'|"([^"\n]*)"/g)) {
      const value = m[1] ?? m[2] ?? '';
      if (words) for (const word of value.split(/\s+/)) push(i + 1, word.replace(/^\\"|\\"$/g, ''));
      else push(i + 1, value);
    }
  });
  return out;
}

/**
 * Keys whose value is a path by definition, wherever they appear. Needed
 * because a bare folder name (`"include": ["e2e"]`, `publicDir: 'site'`) is
 * indistinguishable from a word until you know which key it sits under, and
 * those two are exactly the shape that breaks silently: a `publicDir` that
 * points nowhere copies nothing.
 *
 * An inclusion list, not an exemption list. `ignorePatterns` is deliberately
 * absent: naming what is not there is what it is for.
 */
const PATH_KEYS = new Set([
  'include',
  'exclude',
  'files',
  'extends',
  'mutate',
  'entry',
  'project',
  'publicDir',
  'outDir',
  'rootDir',
  'testDir',
  'snapshotDir',
  'outputDir',
  'configFile',
  'fileName',
  'tsConfig',
  'frontendDist',
  'icon',
  'globalSetup',
  'setupFiles',
]);

/** Every string sitting under a path key, however deep, with its line. */
function keyedPaths(name: string, text: string): Array<{ line: number; token: string }> {
  const out: Array<{ line: number; token: string }> = [];
  const lineOf = (value: string) => {
    const at = text
      .split('\n')
      .findIndex((l) => l.includes(`"${value}"`) || l.includes(`'${value}'`));
    return at === -1 ? 1 : at + 1;
  };
  if (name.endsWith('.json')) {
    let data: unknown;
    try {
      // tsconfig carries `//` comments, which JSON.parse will not take.
      data = JSON.parse(text.replace(/^\s*\/\/.*$/gm, '')) as unknown;
    } catch {
      expect.fail(`${name} ayrıştırılamadı`);
    }
    const walk = (node: unknown, keyed: boolean): void => {
      if (typeof node === 'string') {
        if (keyed) out.push({ line: lineOf(node), token: node });
        return;
      }
      if (Array.isArray(node)) {
        for (const item of node) walk(item, keyed);
        return;
      }
      if (node !== null && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) walk(value, PATH_KEYS.has(key));
      }
    };
    walk(data, false);
    return out;
  }
  text.split('\n').forEach((raw, i) => {
    for (const m of raw.matchAll(/(\w+)\s*:\s*['"]([^'"\n]+)['"]/g)) {
      if (PATH_KEYS.has(m[1] ?? '')) out.push({ line: i + 1, token: m[2] ?? '' });
    }
  });
  return out;
}

/** The part of a glob before its first wildcard, cut back to a folder. */
function globPrefix(token: string): string | null {
  const cut = token.search(/[*?[\]{}]/);
  if (cut === -1) return null;
  const head = token.slice(0, cut);
  const slash = head.lastIndexOf('/');
  return slash === -1 ? '' : head.slice(0, slash + 1);
}

/**
 * The top level names this repository actually has, DERIVED rather than
 * typed: it is what tells a path of ours (`src/leaf/lang/`) apart from a
 * package specifier (`eslint/config`), a media type (`image/png`) and an
 * ESLint rule name (`react-hooks/rules-of-hooks`), all of which are shaped
 * exactly like a path and none of which is one.
 */
const REPO_TOP: ReadonlySet<string> = new Set(
  [...FILES, ...DIRS].map((entry) => entry.split('/')[0] ?? '').filter((seg) => seg !== ''),
);

/**
 * A dependency-cruiser rule writes its paths as regular expressions, and a
 * stale folder there is exactly the failure this gate is for. Anchors and an
 * escaped dot are stripped; anything with a group or a class is left alone,
 * because it is a pattern rather than a path.
 */
function unregex(token: string): string | null {
  if (/[()|+\\]/.test(token.replace(/\\\./g, '.'))) return null;
  return token.replace(/\\\./g, '.').replace(/^\^/, '').replace(/\$$/, '');
}

/** `resolve(KOK, 'src', 'platform', 'changelog.ts')` -> `src/platform/changelog.ts`. */
function joinedPaths(text: string): Array<{ line: number; token: string }> {
  const out: Array<{ line: number; token: string }> = [];
  text.split('\n').forEach((raw, i) => {
    // Not `.join(',')`: an array's join is not the path module's.
    for (const m of raw.matchAll(/(?<![.\w])(?:resolve|join)\(([^)]*)\)/g)) {
      const args = (m[1] ?? '').trim();
      const parts = [...args.matchAll(/'([^']*)'/g)].map((q) => q[1] ?? '');
      if (parts.length === 0) continue;
      // `resolve('kurulum')` starts at the repository root. `join(work, 'x')`
      // starts wherever `work` is, so one quoted tail after an identifier says
      // nothing: `font.mjs` joins `unicodes.txt` onto a temp directory.
      if (!args.startsWith("'") && parts.length < 2) continue;
      out.push({ line: i + 1, token: parts.join('/') });
    }
  });
  return out;
}

/**
 * Whether a configuration string is claiming to be a path of OURS. The test
 * is its first segment: a name this repository has at its top level. That
 * rule was measured rather than guessed — the first run reported twenty two
 * lines, all false, and every class of them (`eslint/config`, `image/png`,
 * `vitest/globals`, `.venv/bin/python3`, a bare `unicodes.txt` joined onto a
 * temp directory) fails exactly this test.
 */
function configPathShaped(input: string, keyed = false): boolean {
  let token = input;
  if (token === '' || /[\s<>$|`]/.test(token)) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(token)) return false;
  if (/^[@~]/.test(token)) return false;
  // A leading slash means the server's or the bundler's root, never the disk:
  // `favicon.mjs` writes `<script src="/src/ui/main.tsx">` into its template.
  token = token.replace(/^\//, '');
  if (token === '' || !/[A-Za-z0-9]/.test(token)) return false;
  // `../dist` in `src-tauri/tauri.conf.json` is a real claim and it is
  // resolved from that file. Only a `..` INSIDE a name is prose (`Demo1..4`).
  if (token.replace(/^(\.\.\/)+/, '').includes('..')) return false;
  const explicit = token.startsWith('./');
  const clean = token.replace(/^\.\//, '');
  // `./e2e` says repository relative in so many words: no package specifier is
  // written that way, so it is checked whatever its first segment is.
  if (explicit && clean !== '') return true;
  // A glob is always a path: no package specifier, media type or rule name is
  // written with a `*`. So its folder is checked even when the folder itself
  // is the thing that is wrong, which is how a renamed top level directory in
  // `knip.json` gets caught.
  const prefix = globPrefix(clean);
  if (prefix !== null) return prefix !== '';
  if (keyed) return true;
  const first = clean.split('/')[0] ?? '';
  return REPO_TOP.has(first);
}

/** Does this configuration string point at something that is there? */
function configResolves(from: string, token: string): boolean {
  // `../dist` in `src-tauri/tauri.conf.json` is the repository's `dist`, and
  // `./e2e` in a root config is the repository's `e2e`. Resolved from the file
  // that wrote it, the way the tool reading it does.
  // Only an explicitly relative token is read from the file's own folder. A
  // bare `docs/asc` inside a script is joined onto the repository root by the
  // script itself, and reading it from `scripts/` would invent `scripts/docs`.
  // `./x` and `../x` are read from the file's own folder. A DOTFILE is not
  // relative — `.github/workflows/surum.yml` in a script's comment means the
  // repository's, and the first version of this line sent it looking for
  // `scripts/.github/...`. Found by the comment extractor the day it landed.
  const relative = (t: string) => t.startsWith('./') || t.startsWith('../');
  const here = (t: string) =>
    relative(t) ? resolveFrom(from, t) : t.replace(/^\.\//, '').replace(/^\//, '');
  const prefix = globPrefix(token);
  if (prefix !== null) {
    const dir = here(prefix).replace(/\/$/, '');
    return dir === '' || DIRS.has(dir + '/') || GENERATED_DIR.test(dir + '/');
  }
  const clean = here(token).replace(/\/$/, '');
  if (resolves(clean)) return true;
  // A module specifier leaves the extension off: `./playwright.config` is
  // `playwright.config.ts` on disk, and the bundler is the one who knows.
  return ['.ts', '.tsx', '.js', '.mjs', '.cjs', '/index.ts', '/index.tsx'].some((ext) =>
    resolves(clean + ext),
  );
}

/**
 * Paths written in a `//` comment inside a script. A script's head comment is
 * where it says which files it reads and writes, and those sentences go stale
 * exactly like a document's: `sema-ornek.mjs` still named `src/types.ts` and
 * `src/store.ts` after both had moved.
 *
 * `scripts/` only, and that limit is measured rather than shy: the comments
 * under `src/` are English prose with `a/b` shapes all through them (`try/catch`,
 * `Teacher/ClassGroup`), and opening this to them brings back the twenty two
 * false positives the first A8 run produced.
 */
function commentPaths(name: string, text: string): Array<{ line: number; token: string }> {
  const out: Array<{ line: number; token: string }> = [];
  if (!name.startsWith('scripts/')) return out;
  text.split('\n').forEach((raw, i) => {
    const at = raw.indexOf('//');
    if (at === -1) return;
    for (const word of raw.slice(at + 2).split(/[\s,;]+/)) {
      // A path at the end of a sentence carries its full stop; one inside
      // brackets or backticks carries those.
      // Turkish glues its suffixes on with an apostrophe, and a file name in a
      // Turkish sentence arrives as `site/icon-small.svg'den`.
      const token = word
        .replace(/^[(['"`]+/, '')
        .replace(/['’][a-zçğıöşü]+$/i, '')
        .replace(/[)\]'"`.:]+$/, '');
      if (token.includes('/')) out.push({ line: i + 1, token });
    }
  });
  return out;
}

describe('A8 · yapılandırmanın gösterdiği her yol diskte var', () => {
  // A1's sibling, and the reason it exists is four holes the move round found
  // BY HAND: `.prettierignore`'s `src/lang/`, the mutation list in
  // `stryker.config.json`, the `src/changelog.ts` that `yayinla.mjs` reads off
  // the disk, and `/src/main.tsx` in the HTML. Two of those stay green while
  // doing nothing, which is the worst kind of configuration (pitfall 23).
  it('yapılandırma ve betiklerdeki yollar çözülüyor', () => {
    const stale: string[] = [];
    let checked = 0;
    for (const [name, text] of Object.entries(CONFIG)) {
      const loose = [...configPaths(name, text), ...commentPaths(name, text)].map((x) => ({
        ...x,
        keyed: false,
      }));
      // A `resolve()` argument and a value under a path key are both paths by
      // construction, so a bare folder name counts there.
      const keyed = [...keyedPaths(name, text), ...joinedPaths(text)].map((x) => ({
        ...x,
        keyed: true,
      }));
      for (const { line, token: raw, keyed: isKeyed } of [...loose, ...keyed]) {
        const token = unregex(raw);
        if (token === null || !configPathShaped(token, isKeyed)) continue;
        checked++;
        if (!configResolves(name, token)) stale.push(`${name}:${line}  ${raw}`);
      }
    }
    expect(Object.keys(CONFIG).length, 'yapılandırma okunamadı').toBeGreaterThan(10);
    expect(checked, 'hiç yol taranmadı, tarayıcı bozuk').toBeGreaterThan(50);
    expect(stale, `${checked} yapılandırma yolu tarandı`).toEqual([]);
  });
});

// ------------------------------------------- A9 · the mutation list, as a set

/**
 * The files Stryker actually mutates, read from its own configuration rather
 * than from a list typed here.
 */
function mutatedFiles(): Set<string> {
  const text = CONFIG['stryker.config.json'] ?? '';
  expect(text.length, 'stryker.config.json okunamadı').toBeGreaterThan(100);
  const config = JSON.parse(text.replace(/^\s*\/\/.*$/gm, '')) as { mutate?: string[] };
  const list = new Set((config.mutate ?? []).map((f) => f.replace(/^src\//, '')));
  expect(list.size, 'mutate listesi boş okundu').toBeGreaterThan(3);
  return list;
}

describe('A9 · stryker’ın mutasyon listesi diskte', () => {
  it('listedeki her dosya diskte var', () => {
    // A path in the list that no longer resolves means the file is silently
    // not measured. A8 covers the same ground through the configuration; this
    // states it in the mutation list's own words, with its own message.
    const gone = [...mutatedFiles()].filter((f) => !FILES.has('src/' + f));
    expect(gone, 'stryker.config.json mutasyon listesinde olmayan dosya').toEqual([]);
  });
});

// ------------------------------------------- A11 · the second entry point

describe('A11 · AGENTS.md yalnız CLAUDE.md’yi gösteriyor', () => {
  // Codex reads AGENTS.md, Claude Code reads CLAUDE.md. Two files that
  // describe the same project drift apart; a file that only points at the
  // other cannot.
  it('ikinci giriş dosyası CLAUDE.md’ye bağlanıyor', () => {
    const agents = DOCS['AGENTS.md'];
    expect(agents, 'AGENTS.md okunmuyor').toBeDefined();
    expect(agents ?? '', 'AGENTS.md CLAUDE.md’ye bağlanmıyor').toMatch(/\]\(\.?\/?CLAUDE\.md\)/);
    expect(DOCS['CLAUDE.md']?.length ?? 0, 'CLAUDE.md boş okundu').toBeGreaterThan(1000);
  });
});

// ------------------------------------------- A12 · the sections a session reads

/**
 * Headings that CLAUDE.md sends a session to, and the one the release script
 * reads. A missing one is a session that starts without its map.
 */
const REQUIRED_SECTIONS: ReadonlyArray<[string, RegExp]> = [
  ['docs/WORKLOG.md', /^## Şu an$/m],
  ['docs/TODO.md', /^## §0\. /m],
  ['docs/TODO.md', /^## İÇİNDEKİLER/m],
  ['docs/TRAPS.md', /^## Hangi grup ne zaman okunur$/m],
  ['CHANGELOG.md', /^## \[?Unreleased\]?/m],
];

describe('A12 · oturumun okuduğu bölümler yerinde', () => {
  it('zorunlu başlıkların her biri kendi dosyasında', () => {
    const missing = REQUIRED_SECTIONS.filter(([doc, re]) => !re.test(DOCS[doc] ?? '')).map(
      ([doc, re]) => `${doc}  ${re.source}`,
    );
    expect(missing).toEqual([]);
  });
});
