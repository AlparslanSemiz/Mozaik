// C:\TimeTables\lang.asc  ->  docs/asc/sozluk.tsv
//
// aSc ships its entire user interface as an editable plain-text string table:
// one numbered entry per string, one line per language, ~50 languages. Its own
// header says "You can edit this file with any text editor". That makes the
// competitor's whole feature surface readable without clicking through a single
// dialog -- every menu item, every checkbox, every constraint name.
//
// We keep two columns: EN and TR. EN is the name a feature goes by in the help
// pages; TR is the word this project's actual user already reads on his screen,
// which is worth more than a translation we would invent.
//
// The file mixes codepages -- each language is stored in its own legacy
// encoding, so the Cyrillic rows are mojibake under any single decoder. That is
// fine and it is why this reads the whole file as windows-1254: EN is ASCII
// (identical in every codepage) and TR is cp1254. Every other row is discarded.
//
// Committed under scripts/ for pitfall 69's reason: docs/asc/ is generated, so
// what generates it has to be readable too, or the filtering decisions freeze.
//
//   node scripts/asc/asc-sozluk.mjs [lang.asc yolu]   -> docs/asc/sozluk.tsv
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE = process.argv[2] ?? 'C:/TimeTables/lang.asc';
const OUT = resolve('docs/asc/sozluk.tsv');

const text = new TextDecoder('windows-1254').decode(readFileSync(SOURCE));
const lines = text.split('\n');

// The file has exactly two structural sections -- "Dialogs" and "Menu" -- and
// each is announced by a rule line of slashes. Every other `//` line is a note
// to the translator ("2704 means the length of the lesson"), so a bare comment
// is NOT a heading: taking those was worth four bogus sections on the first run.
const entries = [];
let section = '';
let cur = null;
let ruleSeen = false;

const flush = () => {
  if (cur && cur.en) entries.push(cur);
  cur = null;
};

for (const raw of lines) {
  const line = raw.trim();
  if (/^\/{6,}$/.test(line)) {
    ruleSeen = true;
    continue;
  }
  if (line.startsWith('#')) {
    flush();
    cur = { id: line.slice(1), section, en: '', tr: '' };
    continue;
  }
  if (line.startsWith('//')) {
    const label = line.replace(/^\/+/, '').trim();
    if (ruleSeen && label && label !== 'String table') {
      section = label;
      ruleSeen = false;
    }
    continue;
  }
  if (line) ruleSeen = false;
  const m = /^([A-Z]{2}) \[(.*)\]$/.exec(line);
  if (m && cur) {
    if (m[1] === 'EN') cur.en = m[2];
    else if (m[1] === 'TR') cur.tr = m[2];
  }
}
flush();

// Escapes are stored literally in the table (a two-character backslash-n), so
// they are text to fold away, not newlines to honour.
const clean = (s) =>
  s
    .replace(/\\r\\n|\\r|\\n|\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

mkdirSync(resolve('docs/asc'), { recursive: true });
const rows = entries.map((e) => [e.id, e.section, clean(e.en), clean(e.tr)].join('\t'));
writeFileSync(OUT, ['id\tbolum\ten\ttr', ...rows].join('\n') + '\n', 'utf8');

// Census, because the point of this file is to know what aSc HAS.
const withTr = entries.filter((e) => e.tr).length;
const sections = new Map();
for (const e of entries) sections.set(e.section, (sections.get(e.section) ?? 0) + 1);
console.log(`kayit         ${entries.length}`);
console.log(`turkcesi olan ${withTr}  (%${Math.round((withTr / entries.length) * 100)})`);
console.log(`yazildi       ${OUT}`);
console.log('\nbolumler:');
for (const [name, n] of [...sections].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${name || '(bolumsuz)'}`);
}
