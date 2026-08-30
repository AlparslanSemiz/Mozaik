// help.edupage.org  ->  docs/asc/yardim/<bolum>.md
//
// aSc's whole manual hangs off one index page: 548 topics in 20 sections, and
// the index lists every one of them as a link. That is the other half of the
// feature surface -- `asc-sozluk.mjs` says what the program CALLS things, this
// says what they DO.
//
// Topics are grouped into one file per top-level section rather than 548 files:
// a section is the unit somebody actually reads ("Constraints", "Printing"),
// and 548 files would be a directory nobody opens.
//
// Raw HTML is cached under the scratchpad, so a re-run costs no requests and an
// interrupted run resumes. Delete the cache to refetch.
//
//   node scripts/asc-yardim.mjs [--limit N]   -> docs/asc/yardim/*.md
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = 'https://help.edupage.org';
const INDEX = `${ROOT}/?p=u1/u3&lang_id=1`;
const CACHE = join(tmpdir(), 'asc-yardim-cache');
const OUTDIR = resolve('docs/asc/yardim');

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

async function grab(url, key) {
  const file = join(CACHE, `${key}.html`);
  if (existsSync(file)) return readFileSync(file, 'utf8');
  const res = await fetch(url, { headers: { 'user-agent': 'ders-programi-arastirma' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const body = await res.text();
  writeFileSync(file, body, 'utf8');
  await new Promise((r) => setTimeout(r, 150));
  return body;
}

// The content lives in <main>; everything above it is a header with a 33-flag
// language menu, and taking the page whole buries the topic in it.
function toText(html, title) {
  let b = html.slice(html.indexOf('<main'), html.lastIndexOf('</main>'));
  if (b.length < 40) b = html;
  // CRLF first: without it the blank-line collapse below never matches, and the
  // stripped language nav leaves twenty empty lines under every heading.
  b = b.replace(/\r\n?/g, '\n');
  // The <span title='English - ...'> run right under the <h1> is the
  // translations nav, not prose. Cross-references to other topics are kept.
  b = b.replace(/<span title='[^']*'>[\s\S]*?<\/span>/g, ' ');
  b = b.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ');
  b = b.replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, (_, a) => (a ? ` [gorsel: ${a}] ` : ' '));
  b = b.replace(/<br\s*\/?>/gi, '\n');
  b = b.replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n');
  b = b.replace(/<li[^>]*>/gi, '- ');
  b = b.replace(/<[^>]+>/g, '');
  b = b
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
  b = b.replace(/[ \t]+/g, ' ');
  b = b.replace(/\n[ \t]+/g, '\n');
  b = b.replace(/\n{3,}/g, '\n\n');
  b = b.trim();
  // The <h1> repeats the title we already print as the markdown heading.
  if (title && b.startsWith(title)) b = b.slice(title.length).trim();
  // Every page ends with the same breadcrumb, announced by the home button.
  const foot = b.indexOf('[gorsel: Home button]');
  if (foot > 0) b = b.slice(0, foot).trim();
  return b;
}

const index = await grab(INDEX, 'index');

// Links look like /?p=lang_id=1&p=u1/u3/u55/u70/t934&lang_id=1 -- malformed but
// served. Only the u1/u3/... path matters; the first path element after u3 is
// the section.
const seen = new Map();
for (const m of index.matchAll(/href="([^"]*p=u1\/u3\/[^"&]*)[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
  const path = /p=(u1\/u3\/[^&"]*)/.exec(m[1])?.[1];
  const title = m[2]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (!path || !title || seen.has(path)) continue;
  seen.set(path, title);
}

const sectionNames = new Map();
for (const [path, title] of seen) {
  const parts = path.split('/');
  if (parts.length === 3) sectionNames.set(parts[2], title);
}

const topics = [...seen].filter(([p]) => p.split('/').length > 3).slice(0, LIMIT);
console.log(`bolum ${sectionNames.size} · konu ${topics.length}`);

const bySection = new Map();
let done = 0;
let failed = 0;

const queue = [...topics];
const worker = async () => {
  for (;;) {
    const item = queue.shift();
    if (!item) return;
    const [path, title] = item;
    const section = path.split('/')[2];
    try {
      const html = await grab(`${ROOT}/?p=${path}&lang_id=1`, slug(path));
      const text = toText(html, title);
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section).push({ path, title, text });
    } catch (err) {
      failed += 1;
      console.warn(`  atlandi ${path}: ${err.message}`);
    }
    done += 1;
    if (done % 50 === 0) console.log(`  ${done}/${topics.length}`);
  }
};
await Promise.all([worker(), worker(), worker(), worker()]);

let written = 0;
for (const [section, items] of bySection) {
  const name = sectionNames.get(section) ?? section;
  const body = items
    .map((t) => `## ${t.title}\n\n_${t.path}_\n\n${t.text}\n`)
    .join('\n---\n\n');
  const file = join(OUTDIR, `${section}-${slug(name)}.md`);
  writeFileSync(
    file,
    `# ${name}\n\naSc Timetables yardım belgelerinden alındı (${items.length} konu).\n` +
      `Üreten: \`node scripts/asc-yardim.mjs\`\n\n---\n\n${body}`,
    'utf8',
  );
  written += 1;
}
console.log(`yazildi ${written} dosya · basarisiz ${failed} · ${OUTDIR}`);
