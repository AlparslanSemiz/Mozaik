// Every schema version ever written must still open.
//
// This is the mechanical half of pitfall 97. store.test.ts already reads one
// file per version, but it does that with one `describe` per version: a new
// version can be released without anyone adding its block, and the suite goes
// green anyway. That is exactly how `version === 8` was left out of the
// reader's list and every backup released v2.0.0 wrote became unreadable.
//
// The loop below derives its versions from SCHEMA_VERSION itself, so bumping
// the constant without writing the new example file fails here, by name,
// before the release. The files live in src/fixtures/ and their recipe is
// scripts/sema-ornek.mjs; they are constructed, not recovered, and the script
// says why.
//
// What store.test.ts measures and this does not: what each migration does to
// the DATA. What this measures and store.test.ts cannot: that the set of
// readable versions is complete.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseState } from './pure/parseState';
import { activeProgram } from './pure/programs';
import { SCHEMA_VERSION } from './leaf/types';

const DIR = join(import.meta.dirname, 'fixtures');

/** 1, 2, ... SCHEMA_VERSION. Named nowhere: a bump widens this on its own. */
const VERSIONS = Array.from({ length: SCHEMA_VERSION }, (_, i) => i + 1);

function read(version: number): string {
  return readFileSync(join(DIR, `v${version}.json`), 'utf8');
}

describe('şema örnekleri', () => {
  it.each(VERSIONS)('v%i dosyası bugünkü okuyucudan geçiyor', (version) => {
    const state = parseState(read(version));

    expect(state).not.toBeNull();
    expect(state!.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it.each(VERSIONS)('v%i dosyasının yerleşimleri kayıpsız geliyor', (version) => {
    const state = parseState(read(version))!;
    const placements = activeProgram(state).placements;

    // The same laid-out week is in every file, only the shape around it
    // changed. Six cells: a double, a triple and a single.
    expect(Object.keys(placements).length).toBe(6);
    expect(placements['c510|0|0']).toBe('l1');
    expect(placements['c510|0|1']).toBe('l1');
    expect(placements['c510|1|2']).toBe('l2');
    expect(placements['c510|1|3']).toBe('l2');
    expect(placements['c510|1|4']).toBe('l2');
    expect(placements['c511|0|2']).toBe('l3');
  });

  it.each(VERSIONS)('v%i dosyasının okulu kayıpsız geliyor', (version) => {
    const state = parseState(read(version))!;

    expect(state.settings.days.map((d) => d.name)).toEqual(['Salı', 'Çarşamba']);
    expect(state.settings.hours).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(state.rooms.map((r) => r.name)).toEqual(['A']);
    expect(state.teachers.map((t) => t.short)).toEqual(['MÇ', 'AV']);
    expect(state.classes.map((c) => c.name)).toEqual(['510', '511']);
    expect(state.lessons.map((l) => l.id)).toEqual(['l1', 'l2', 'l3']);
    // The closed hours are keyed by id, so no version boundary can move them.
    expect(state.unavailable).toEqual({ 'tAV|1|0': 1, 'c511|0|5': 1, 'rA|1|5': 1 });
  });

  it('her sürümün bir örnek dosyası var, sonuncusu dahil', () => {
    // Reading them all here as well is not the duplicate it looks like: the
    // three cases above are per file, and a missing file would report as one
    // red case among fourteen. This one says the SET is complete, which is
    // the sentence pitfall 97 is about.
    expect(VERSIONS.length).toBe(SCHEMA_VERSION);
    for (const version of VERSIONS) {
      expect(() => read(version), `v${version}.json yok`).not.toThrow();
    }
  });

  it('okunamayan bir sürüm numarası hâlâ null veriyor', () => {
    // The guard the loop above must not turn into "everything parses".
    expect(parseState(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1 }))).toBeNull();
    expect(parseState(JSON.stringify({ schemaVersion: 0 }))).toBeNull();
  });
});
