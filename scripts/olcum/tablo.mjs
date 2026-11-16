// The two runs of src/platform/search/ikiCekirdek.olcum.test.ts side by side,
// as Markdown: two CPUs (the father's machine) and the same runner unrestricted.
//
//   node scripts/olcum/tablo.mjs iki.json serbest.json > olcum.md
//
// The flags at the end are the two the workflow was written for: a wait of
// more than 10 s with nothing new on screen, and memory near 1 GB.

import { readFileSync } from 'node:fs';

const [ikiYol, serbestYol] = process.argv.slice(2);
if (!ikiYol || !serbestYol) {
  console.error('kullanım: node scripts/olcum/tablo.mjs iki.json serbest.json');
  process.exit(2);
}
const oku = (yol) => {
  try {
    return JSON.parse(readFileSync(yol, 'utf8'));
  } catch {
    return null;
  }
};
const runs = [
  ['2 CPU', oku(ikiYol)],
  ['serbest', oku(serbestYol)],
].filter(([, r]) => r !== null);

const s = (ms) => (ms === null || ms === undefined ? '—' : `${(ms / 1000).toFixed(1)} s`);
const sec = (x) => (x === null || x === undefined ? '—' : `${x.toFixed(2)} s`);
const ways = (list) =>
  list?.length ? list.map((x) => `${x.family} ${x.size}${x.proven ? '✓' : ''}`).join(', ') : '—';

const out = ['## İki çekirdek ölçümü', ''];
if (runs.length === 0) {
  out.push('Hiçbir koşu JSON üretmedi; günlüğe bakın.');
  console.log(out.join('\n'));
  process.exit(0);
}
out.push('| koşu | navigator | availableParallelism | maske | CP-SAT işçisi | Node tepe RSS |');
out.push('|---|---|---|---|---|---|');
for (const [ad, r] of runs) {
  const workers = [...new Set(r.schools.flatMap((x) => x.sorular.map((q) => q.workers)))].join('/');
  const aff = [...new Set(r.schools.flatMap((x) => x.sorular.map((q) => q.affinity?.process)))]
    .filter((x) => x !== undefined)
    .join('/');
  out.push(
    `| ${ad} | ${r.cores.pretended || r.cores.navigator} | ${r.cores.availableParallelism} | ${aff || r.cores.mask || '—'} | ${workers || '—'} | ${r.node.peakRssMb} MB (başta ${r.node.startRssMb}) |`,
  );
}

out.push('', '### Otomatik diz (JS, tek iş parçacığı)', '');
out.push('| okul | koşu | iyileştirmesiz | iyileştirmeyle | yerleşen | sonuç |');
out.push('|---|---|---|---|---|---|');
for (const [ad, r] of runs) {
  for (const x of r.schools) {
    out.push(
      `| ${x.name} | ${ad} | ${s(x.layoutNoImprove.wallMs)} | ${s(x.layout.wallMs)} | ${x.layout.placed}/${x.layout.total} | ${x.layout.phase} |`,
    );
  }
}

out.push('', '### Öneri araması (takılan hafta)', '');
out.push(
  '| okul | koşu | ilk öneri | CP-SAT başlar | toplam | en uzun sessizlik | bizim arama | sonuç | CP-SAT tepe bellek |',
);
out.push('|---|---|---|---|---|---|---|---|---|');
for (const [ad, r] of runs) {
  for (const x of r.schools) {
    if (x.search === null) {
      out.push(`| ${x.name} | ${ad} | takılmadı | | | | | | |`);
      continue;
    }
    const peak = Math.max(0, ...x.sorular.map((q) => q.peakMb));
    out.push(
      `| ${x.name} | ${ad} | ${s(x.search.firstSuggestionMs)} | ${s(x.search.cpStartMs)} | ${s(x.search.wallMs)} | ${s(x.search.longestQuietMs)} | ${ways(x.search.beforeCp)} | ${ways(x.search.suggestions)} | ${peak ? `${Math.round(peak)} MB` : '—'} |`,
    );
  }
}

out.push('', '### CP-SAT soruları', '');
out.push(
  '| okul | koşu | # | yol | sınır | ilk çözüm | süre | durum | amaç (ilk → son) | tepe bellek |',
);
out.push('|---|---|---|---|---|---|---|---|---|---|');
for (const [ad, r] of runs) {
  for (const x of r.schools) {
    x.sorular.forEach((q, i) => {
      out.push(
        `| ${x.name} | ${ad} | ${i + 1} | ${q.family} | ${q.limitS} s | ${sec(q.firstS)} | ${sec(q.wallS)} | ${q.status} | ${q.firstObjective ?? '—'} → ${q.objective} | ${Math.round(q.peakMb)} MB |`,
      );
    });
  }
}

const flags = [];
for (const [ad, r] of runs) {
  for (const x of r.schools) {
    if (x.layout.wallMs > 10_000)
      flags.push(`${ad}, ${x.name}: Otomatik diz ${s(x.layout.wallMs)}`);
    if (x.search?.longestQuietMs > 10_000)
      flags.push(
        `${ad}, ${x.name}: öneri aramasında ${s(x.search.longestQuietMs)} ekranda yeni bir şey yok`,
      );
    const peak = Math.max(0, ...x.sorular.map((q) => q.peakMb));
    if (peak > 800) flags.push(`${ad}, ${x.name}: CP-SAT süreci ${Math.round(peak)} MB`);
  }
  if (r.node.peakRssMb > 800) flags.push(`${ad}: Node süreci ${r.node.peakRssMb} MB`);
  for (const x of r.schools)
    for (const e of x.errors ?? [])
      flags.push(`${ad}, ${x.name}: CP-SAT sorusu düştü: ${e.slice(0, 300)}`);
}
out.push('', '### Bayraklar (> 10 s sessizlik, > 800 MB)', '');
out.push(flags.length ? flags.map((f) => `- ${f}`).join('\n') : 'Yok.');
console.log(out.join('\n'));
