// Writes the nameless copy of a real "Tümünü kaydet" bundle (task TP6, K2).
//
// WHY A REAL BUNDLE AT ALL. Every other fixture is either made up
// (scripts/sema-ornek.mjs, one per schema version) or a bare plan
// (`tam-dolu-kurs.json`). The ENVELOPE a real backup arrives in -- `savedAt`,
// `activeId`, `draft`, the plan's name, a v14 plan inside a v1 bundle -- was
// in no fixture, and it is what "Tümünü dosyadan aç" reads.
//
// WHERE THE NAMES COME FROM. Not from this file. The bundle is the same school
// as `src/fixtures/tam-dolu-kurs.json` and carries the same ids, so every
// teacher, class and room takes the name that file already gave it. A copy can
// therefore hold no string the repository did not already hold; the last check
// below refuses to write one that does, and an id the plan fixture does not
// know stops the script instead of leaving its real name in place.
//
// The raw bundle never leaves scratch/. Only this script and its output are
// committed, and the commit is preceded by a search for the real names
// (CLAUDE.md, K2; the list itself is built from the real folder and stays in
// scratch/ too).
//
// Run: node scripts/adsiz-paket.mjs <raw-bundle.json> <out.json>

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , rawPath, outPath] = process.argv;
if (!rawPath || !outPath) {
  console.error('kullanım: node scripts/adsiz-paket.mjs <ham-paket.json> <çıktı.json>');
  process.exit(2);
}

const PLAN = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'fixtures', 'tam-dolu-kurs.json'), 'utf8'),
);

/** id -> the nameless entry of the plan fixture. */
function byId(list) {
  return new Map(list.map((item) => [item.id, item]));
}
const KNOWN = {
  teachers: byId(PLAN.teachers),
  classes: byId(PLAN.classes),
  rooms: byId(PLAN.rooms),
};

/** Fields of each list that carry a name. Everything else is kept as it is. */
const NAMED = { teachers: ['name', 'short'], classes: ['name'], rooms: ['name'] };

const bundle = JSON.parse(readFileSync(rawPath, 'utf8'));
if (bundle.bundleVersion !== 1 || !Array.isArray(bundle.plans)) {
  console.error('paket değil (bundleVersion 1 ve plans bekleniyordu)');
  process.exit(1);
}

bundle.plans.forEach((plan, p) => {
  plan.name = `Plan ${p + 1}`;
  const state = plan.state;
  state.settings.schoolName = '';
  for (const [list, fields] of Object.entries(NAMED)) {
    for (const item of state[list]) {
      const known = KNOWN[list].get(item.id);
      if (!known) {
        console.error(`${list}: ${item.id} tam-dolu-kurs.json'da yok, adı silinemez`);
        process.exit(1);
      }
      for (const field of fields) item[field] = known[field];
    }
  }
  state.programs.forEach((program, i) => {
    program.name = `Program ${i + 1}`;
  });
});

// THE GATE. Every string that is not an id, a cell key, a date or a name made
// above must already be in the plan fixture. A field this script does not know
// about (a note, an e-mail, whatever a later version adds) fails here.
const ALLOWED = new Set();
(function collect(value) {
  if (typeof value === 'string') ALLOWED.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
})(PLAN);

const MADE = /^(Plan|Program) \d+$/;
const ID_KEY = /^(id|activeId|savedAt|[a-z]+Id)$/;
const strays = [];
(function check(value, key, path) {
  if (typeof value === 'string') {
    if (!ID_KEY.test(key) && !MADE.test(value) && !ALLOWED.has(value)) strays.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => check(item, key, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      // A placement is `cell -> lesson id`, a pin `cell -> true`: no name.
      if (k === 'placements' || k === 'pinned') continue;
      check(v, k, `${path}.${k}`);
    }
  }
})(bundle, '', '');

if (strays.length > 0) {
  // Paths only. The value is exactly what must not be printed.
  console.error(`tam-dolu-kurs.json'da olmayan ${strays.length} dize:\n${strays.join('\n')}`);
  process.exit(1);
}

writeFileSync(outPath, JSON.stringify(bundle, null, 2) + '\n');
console.log(`yazıldı: ${outPath}`);
