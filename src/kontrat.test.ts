// The exe's bridge, judged as a CONTRACT between three parties that never meet
// (TP9, B9a).
//
// `src-tauri/src/*.rs` registers the commands, `desktop.ts` calls them, and
// two stand-ins (`e2e/exe.spec.ts`'s `fakeExe`, `desktop.test.ts`'s `fakeDisk`)
// answer for Rust in every test that has no exe. Each side is checked by its
// own suite and none of them reads the others: rename `list_files` in Rust and
// cargo test is green, the page's tests are green against a fake that still
// answers the old name, and the real exe throws on its first save. The only
// suite that would see it, the real-exe one, needs a built binary and runs on
// Linux by hand.
//
// So the three are read as TEXT and compared here, on every `npm test`:
//   - every command the page sends is registered, with the argument names
//     Tauri will look for (a Rust `snake_case` parameter is `camelCase` on the
//     page) and the return type the Rust side declares,
//   - every registered command is sent by the page: a command nobody calls is
//     a contract nobody tests,
//   - `UpdateCevap` and Rust's `Cevap` carry the same fields,
//   - a fake answers no command Rust lacks, reads no argument Rust does not
//     take, returns the type Rust declares, and its update answer has exactly
//     `Cevap`'s fields.
// A fake may still leave a command out: `fakeExe` has no
// `self_update_supported` on purpose (desktop.ts counts an unknown command as
// yes), and `fakeDisk` only knows the folder.
//
// The update's manifest is the second contract, at the bottom of the file
// (TP10).
//
// `desktop.ts` is found by NAME, not by path. It moves to `platform/exe` in a
// later package round (TODO §8k), and a contract test that broke on the move
// would be the one thing that round has to touch for no reason.

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { createHash } from 'node:crypto';

import libRs from '../src-tauri/src/lib.rs?raw';
import updateRs from '../src-tauri/src/update.rs?raw';
import exeSpec from '../e2e/exe.spec.ts?raw';
import surumYml from '../.github/workflows/surum.yml?raw';
import kayitliSurum from './fixtures/release-v2.2.0/surum.json?raw';
import kayitliToplam from './fixtures/release-v2.2.0/SHA256SUMS.txt?raw';
import kayitliRelease from './fixtures/release-v2.2.0/release.json';

/** The one file the glob found. Vite wants the pattern literal, hence two globs. */
function only(name: string, all: Record<string, unknown>): string {
  const hits = Object.values(all);
  if (hits.length !== 1) {
    throw new Error(`${name}: tek dosya bekleniyordu, ${hits.length} bulundu`);
  }
  return hits[0] as string;
}

const desktopTs = only(
  'desktop.ts',
  import.meta.glob('./**/desktop.ts', { query: '?raw', import: 'default', eager: true }),
);
const desktopTest = only(
  'desktop.test.ts',
  import.meta.glob('./**/desktop.test.ts', { query: '?raw', import: 'default', eager: true }),
);

// ------------------------------------------------------------- the Rust side

interface Command {
  /** What the page passes: Tauri renames a `snake_case` parameter to `camelCase`. */
  args: string[];
  /** The page-side type of what the command resolves to. */
  returns: string;
}

/** Parameters Tauri fills in itself; the page never sends them. */
const INJECTED = /AppHandle|State<|Window|Webview/;

/** Rust's declared answer, in the words `desktop.ts` writes its type arguments in. */
const PAGE_TYPE: Record<string, string> = {
  '()': 'void',
  String: 'string',
  'Vec<String>': 'string[]',
  bool: 'boolean',
  u64: 'number',
  Cevap: 'UpdateCevap',
};

const camel = (snake: string) => snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function rustCommands(): Map<string, Command> {
  const found = new Map<string, Command>();
  const FN =
    /#\[tauri::command\]\s*(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^{]+?))?\s*\{/g;
  for (const source of [libRs, updateRs]) {
    for (const [, name, params, ret] of source.matchAll(FN)) {
      const args = (params ?? '')
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '' && !INJECTED.test(p))
        .map((p) => camel(p.split(':')[0]!.trim()));
      const inner = (ret ?? '()').trim().replace(/^Result<(.+),\s*String>$/, '$1');
      found.set(name!, { args, returns: PAGE_TYPE[inner] ?? `?${inner}` });
    }
  }
  return found;
}

function registered(): string[] {
  const list = /generate_handler!\[([^\]]*)\]/.exec(libRs)?.[1] ?? '';
  return list
    .split(',')
    .map((s) => s.trim().split('::').pop()!)
    .filter((s) => s !== '');
}

function rustFields(struct: string, source: string): string[] {
  const body = new RegExp(`pub struct ${struct} \\{([^}]*)\\}`).exec(source)?.[1] ?? '';
  return [...body.matchAll(/pub (\w+):/g)].map((m) => m[1]!);
}

// ------------------------------------------------------------- the page side

function parse(name: string, text: string): ts.SourceFile {
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
}

function walk(node: ts.Node, visit: (n: ts.Node) => void) {
  visit(node);
  node.forEachChild((child) => walk(child, visit));
}

interface Call {
  command: string;
  args: string[];
  /** The type argument, as written. */
  returns: string;
}

/** Every `invoke<T>('cmd', {...})` and `bridge()<T>('cmd', {...})` in the file. */
function pageCalls(file: ts.SourceFile): Call[] {
  const calls: Call[] = [];
  walk(file, (node) => {
    if (!ts.isCallExpression(node)) return;
    const callee = node.expression;
    const isInvoke =
      (ts.isIdentifier(callee) && callee.text === 'invoke') ||
      (ts.isCallExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'bridge');
    const [first, second] = node.arguments;
    if (!isInvoke || first === undefined || !ts.isStringLiteral(first)) return;
    const args =
      second !== undefined && ts.isObjectLiteralExpression(second)
        ? second.properties.map((p) => p.name?.getText(file) ?? '?')
        : [];
    calls.push({
      command: first.text,
      args,
      returns: node.typeArguments?.[0]?.getText(file) ?? '?',
    });
  });
  return calls;
}

function interfaceFields(file: ts.SourceFile, name: string): string[] {
  let fields: string[] = [];
  walk(file, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
      fields = node.members.map((m) => m.name?.getText(file) ?? '?');
    }
  });
  return fields;
}

// ------------------------------------------------------------- the fakes

interface Answer {
  command: string;
  /** `args.x` / `args!.x` read inside the branch. */
  reads: string[];
  /** The page-side type of each `return`, or the field list of an object. */
  returns: string[];
}

function returnType(e: ts.Expression | undefined, file: ts.SourceFile): string {
  if (e === undefined) return 'void';
  if (ts.isIdentifier(e) && e.text === 'undefined') return 'void';
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return 'string';
  if (ts.isNumericLiteral(e)) return 'number';
  if (e.kind === ts.SyntaxKind.TrueKeyword || e.kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean';
  }
  if (ts.isArrayLiteralExpression(e)) return 'string[]';
  if (ts.isObjectLiteralExpression(e)) {
    return `{${e.properties
      .map((p) => p.name?.getText(file) ?? '?')
      .sort()
      .join(',')}}`;
  }
  return `?${e.getText(file)}`;
}

/** Every `if (cmd === '...') { ... }` branch of a fake bridge. */
function fakeAnswers(file: ts.SourceFile): Answer[] {
  const answers: Answer[] = [];
  walk(file, (node) => {
    if (!ts.isIfStatement(node)) return;
    const c = node.expression;
    if (
      !ts.isBinaryExpression(c) ||
      c.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken ||
      !ts.isIdentifier(c.left) ||
      c.left.text !== 'cmd' ||
      !ts.isStringLiteral(c.right)
    ) {
      return;
    }
    const reads = new Set<string>();
    const returns: string[] = [];
    walk(node.thenStatement, (n) => {
      if (ts.isPropertyAccessExpression(n)) {
        const target = ts.isNonNullExpression(n.expression)
          ? n.expression.expression
          : n.expression;
        if (ts.isIdentifier(target) && target.text === 'args') reads.add(n.name.text);
      }
      if (ts.isReturnStatement(n)) returns.push(returnType(n.expression, file));
    });
    // `thenStatement` is the block or, for `if (cmd === 'x') return y;`, the
    // return itself; the walk covers both.
    answers.push({ command: c.right.text, reads: [...reads], returns });
  });
  return answers;
}

// ------------------------------------------------------------- the checks

const RUST = rustCommands();
const CEVAP = rustFields('Cevap', updateRs);
const CEVAP_SHAPE = `{${[...CEVAP].sort().join(',')}}`;

describe('exe köprüsü — Rust ile desktop.ts aynı sözleşmeyi konuşuyor', () => {
  const desktop = parse('desktop.ts', desktopTs);
  const calls = pageCalls(desktop);

  it('okuyucular bir şey buluyor', () => {
    // Without this, a regex that stopped matching would turn every check
    // below into a loop over nothing.
    expect(RUST.size).toBeGreaterThanOrEqual(8);
    expect(calls.length).toBeGreaterThanOrEqual(8);
    expect(CEVAP.length).toBeGreaterThanOrEqual(5);
  });

  it('kayıtlı komutlar ile #[tauri::command] fonksiyonları aynı küme', () => {
    expect([...registered()].sort()).toEqual([...RUST.keys()].sort());
  });

  it('sayfanın gönderdiği her komut kayıtlı, kayıtlı her komutu sayfa gönderiyor', () => {
    expect([...new Set(calls.map((c) => c.command))].sort()).toEqual([...registered()].sort());
  });

  it.each(calls.map((c) => [c.command, c] as const))(
    '%s: argüman adları ve dönüş tipi Rust’ınkiyle aynı',
    (command, call) => {
      const rust = RUST.get(command);
      expect(rust, `${command} Rust'ta yok`).toBeDefined();
      expect([...call.args].sort(), `${command} argümanları`).toEqual([...rust!.args].sort());
      expect(call.returns, `${command} dönüş tipi`).toBe(rust!.returns);
    },
  );

  it('UpdateCevap ile Cevap aynı alanları taşıyor', () => {
    expect(interfaceFields(desktop, 'UpdateCevap').sort()).toEqual([...CEVAP].sort());
  });
});

describe.each([
  ['e2e/exe.spec.ts', exeSpec],
  ['desktop.test.ts', desktopTest],
])('köprünün taklidi (%s) sözleşmeden sapmıyor', (name, text) => {
  const answers = fakeAnswers(parse(name, text));

  it('taklit bir şey cevaplıyor', () => {
    expect(answers.length).toBeGreaterThanOrEqual(4);
    // And the reader sees its arguments: `write_file` reads both.
    expect(answers.find((a) => a.command === 'write_file')?.reads.sort()).toEqual(['name', 'text']);
  });

  it.each(answers.map((a) => [a.command, a] as const))(
    '%s: Rust’ta var, Rust’ın almadığı argümanı okumuyor, Rust’ın tipini döndürüyor',
    (command, answer) => {
      const rust = RUST.get(command);
      expect(rust, `taklit ${command} cevaplıyor, Rust'ta yok`).toBeDefined();
      for (const read of answer.reads) {
        expect(rust!.args, `taklit ${command}'ın ${read} argümanını okuyor`).toContain(read);
      }
      expect(answer.returns.length, `${command} hiçbir şey döndürmüyor`).toBeGreaterThan(0);
      const expected = rust!.returns === 'UpdateCevap' ? CEVAP_SHAPE : rust!.returns;
      for (const returned of answer.returns) {
        expect(returned, `taklit ${command} için`).toBe(expected);
      }
    },
  );
});

// ------------------------------------------------------------- the update

// THE SECOND CONTRACT (TP10, B9b): what `surum.yml` publishes and what every
// copy already on a machine reads. `update.rs` deserialises `surum.json` into
// `Manifest` and then downloads `exe` and checks it is `boyut` bytes; a key
// renamed on one side, or a size that is not the exe's, breaks an update in a
// copy nobody can rebuild any more. Judged against a RECORDED release (v2.2.0,
// the files as published, plus its asset list from `gh release view`), so the
// test needs no network. `surum.test.ts` already pins the address prefixes.
describe('güncelleme kontratı — surum.yml, Release ve update.rs aynı dosyayı anlatıyor', () => {
  const MANIFEST = rustFields('Manifest', updateRs);
  const manifest = JSON.parse(kayitliSurum) as Record<string, unknown>;
  const assets = new Map(kayitliRelease.assets.map((a) => [a.name, a.size]));

  /** The object literal `surum.yml` hands to JSON.stringify. */
  function writerKeys(): string[] {
    const body = /JSON\.stringify\(\{([^}]*)\}/.exec(surumYml)?.[1] ?? '';
    return [...body.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]!);
  }

  /** The files after `gh release create`, i.e. what a Release carries. */
  function publishedFiles(): string[] {
    const block = surumYml.slice(surumYml.indexOf('gh release create'));
    return [...block.matchAll(/teslim\/(\S+)/g)].map((m) => m[1]!);
  }

  it('Manifest dört alan okuyor, surum.yml dördünü yazıyor', () => {
    expect(MANIFEST.length).toBe(4);
    expect([...writerKeys()].sort()).toEqual([...MANIFEST].sort());
  });

  it('kayıtlı surum.json tam Manifest’in alanlarını, Rust’ın tipleriyle taşıyor', () => {
    expect(Object.keys(manifest).sort()).toEqual([...MANIFEST].sort());
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof manifest.exe).toBe('string');
    expect(Number.isSafeInteger(manifest.boyut) && (manifest.boyut as number) > 0).toBe(true);
  });

  it('kayıtlı dosya surum.yml’in biçiminde: iki boşluk girinti, sonda satır sonu', () => {
    expect(kayitliSurum).toBe(JSON.stringify(manifest, null, 2) + '\n');
    expect(surumYml).toContain("}, null, 2) + '\\n');");
  });

  it('surum.yml boyutu adresin gösterdiği dosyadan ölçüyor', () => {
    const measured = /boyut=\$\(stat -c%s teslim\/(\S+)\)/.exec(surumYml)?.[1];
    const address = /^\s*adres="[^"]*\/([^/"]+)"/m.exec(surumYml)?.[1];
    expect(measured).toBeDefined();
    expect(measured).toBe(address);
  });

  it('sürüm etiketin numarası, boyut Release’teki exe’nin boyutu', () => {
    expect(`v${String(manifest.version)}`).toBe(kayitliRelease.tagName);
    expect(manifest.boyut).toBe(assets.get('Mozaik.exe'));
    expect(kayitliRelease.isDraft || kayitliRelease.isPrerelease).toBe(false);
  });

  it('exe adresi Release’teki bir dosyayı gösteriyor', () => {
    const exe = String(manifest.exe);
    const name = exe.slice(exe.lastIndexOf('/') + 1);
    expect(exe).toMatch(/\/releases\/latest\/download\/[^/]+$/);
    expect([...assets.keys()]).toContain(name);
  });

  it('Release’in dosyaları surum.yml’in yayınladıkları', () => {
    expect([...assets.keys()].sort()).toEqual([...publishedFiles()].sort());
  });

  it('SHA256SUMS kendisi dışında her dosyayı sayıyor, surum.json’ın özeti tutuyor', () => {
    const lines = kayitliToplam
      .trim()
      .split('\n')
      .map((line) => line.split(/\s+/));
    const listed = new Map(lines.map(([hash, name]) => [name!, hash!]));
    expect([...listed.keys()].sort()).toEqual(
      [...assets.keys()].filter((n) => n !== 'SHA256SUMS.txt').sort(),
    );
    // The recorded manifest is the published one, byte for byte.
    expect(createHash('sha256').update(kayitliSurum).digest('hex')).toBe(listed.get('surum.json'));
  });
});
