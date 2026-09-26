// Every schema version ever written must still open — and must still MEAN
// what it said.
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
// WHY THE FILE GREW. The first version of this file asserted the grid and the
// names and stopped there, and the mutation run of 2026-09-12 said what that
// left open: 130 of store.ts's surviving mutants sat in the parsing half and
// all of them came back to one sentence — the shape of a lesson and the
// settings around it were read by nobody. A migration that quietly turned a
// two-hour block into two singles, or dropped a school's bell times, passed.
// So each version now also says what its own week MEANS, and the second half
// of the file reads files with a field taken out, because that is the shape
// of every file older than the field.
//
// The expected values below are written out as data, not computed. Anything
// computed from `blocks.ts` or `store.ts` would be the reader grading its own
// homework. The one thing read from real source is a DEFAULT: `emptyState()`
// names what a file that predates a field falls back to, and naming today's
// number instead is the mistake pitfall 97 is about.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultSubjects, emptyState } from './pure/entities';
import { parseState } from './pure/parseState';
import { activeProgram } from './pure/programs';
import { SCHEMA_VERSION, type State } from './leaf/types';

const DIR = join(import.meta.dirname, 'fixtures');

/** 1, 2, ... SCHEMA_VERSION. Named nowhere: a bump widens this on its own. */
const VERSIONS = Array.from({ length: SCHEMA_VERSION }, (_, i) => i + 1);

function read(version: number): string {
  return readFileSync(join(DIR, `v${version}.json`), 'utf8');
}

function parse(version: number): State {
  const state = parseState(read(version));
  if (state === null) throw new Error(`v${version}.json okunamadı`);
  return state;
}

/** The file of that version, with something done to it before it is read. */
function edited<T>(version: number, change: (raw: T) => void): State | null {
  const raw: unknown = JSON.parse(read(version));
  change(raw as T);
  return parseState(JSON.stringify(raw));
}

/** What `emptyState()` ships, i.e. what a file that predates a field gets. */
const BLANK = emptyState().settings;

describe('şema örnekleri', () => {
  it.each(VERSIONS)('v%i dosyası bugünkü okuyucudan geçiyor', (version) => {
    const state = parseState(read(version));

    expect(state).not.toBeNull();
    expect(state!.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it.each(VERSIONS)('v%i dosyasının yerleşimleri kayıpsız geliyor', (version) => {
    const placements = activeProgram(parse(version)).placements;

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
    const state = parse(version);

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

// --------------------------------------------------------- the week's shape

/**
 * How each file SPELLS the same three lessons, and therefore what today's
 * reader owes them. Three spellings, each with the version it starts at.
 *
 * Hours never change: a migration may re-read the SHAPE of a week, never its
 * size. That is asserted separately below, so that a shape table gone stale
 * cannot quietly take the hours with it.
 */
interface Week {
  weeklyHours: number;
  blocks: number[];
}

/** v13 and up: the file names its blocks, and 4 is no longer expressible. */
const SPELLED: Week[] = [
  { weeklyHours: 4, blocks: [2] },
  { weeklyHours: 3, blocks: [3] },
  { weeklyHours: 2, blocks: [] },
];

/**
 * v9..v12: the same list, except the first lesson was written as a FOUR over
 * five hours. v13 removed the four, and the hour it gives up comes back as a
 * single: 4 -> 3+1. No placed cell moves, only the boundary is re-read.
 */
const WITH_FOUR: Week[] = [
  { weeklyHours: 5, blocks: [3] },
  { weeklyHours: 3, blocks: [3] },
  { weeklyHours: 2, blocks: [] },
];

/**
 * v7 and v8: `pairs` could only say "this many of the hours are doubles", so
 * the three-hour block above is one pair there. Five hours with two pairs is
 * 2+2+1, three hours with one pair is 2+1.
 *
 * v1..v6 spelled the same week a third way (`blockSize`: "every block of this
 * lesson is this long", so 2, 2 and 1 here) and it lands on the same list.
 * Two spellings, one meaning: that is the point, not a copy.
 */
const AS_PAIRS: Week[] = [
  { weeklyHours: 5, blocks: [2, 2] },
  { weeklyHours: 3, blocks: [2] },
  { weeklyHours: 2, blocks: [] },
];

function expectedWeek(version: number): Week[] {
  if (version >= 13) return SPELLED;
  if (version >= 9) return WITH_FOUR;
  return AS_PAIRS;
}

describe('şema örnekleri — dersin şekli', () => {
  it.each(VERSIONS)('v%i dosyasının haftası doğru bloklara bölünüyor', (version) => {
    const lessons = parse(version).lessons;

    expect(lessons.map((l) => ({ weeklyHours: l.weeklyHours, blocks: l.blocks }))).toEqual(
      expectedWeek(version),
    );
  });

  it.each(VERSIONS)('v%i dosyasında hiçbir saat blok okumasında kaybolmuyor', (version) => {
    // The invariant under the table above: a block list can never outrun the
    // week it splits, in any version, however that file spelled it.
    for (const lesson of parse(version).lessons) {
      const used = lesson.blocks.reduce((sum, b) => sum + b, 0);
      expect(
        used,
        `${lesson.id}: ${lesson.blocks.join('+')} > ${lesson.weeklyHours}`,
      ).toBeLessThanOrEqual(lesson.weeklyHours);
      expect(lesson.blocks.every((b) => b >= 2 && b <= 3)).toBe(true);
    }
  });

  it.each(VERSIONS)('v%i dosyasında ikinci branş bayrağı tahmin edilmiyor', (version) => {
    const [l1, l2, l3] = parse(version).lessons;

    // v8 is where a teacher got a second subject and a lesson the flag saying
    // it is taught under it. Below that no file can carry one, and none is
    // invented: every lesson in such a file was taught under the only subject
    // its teacher had.
    expect(l2!.second).toBe(version >= 8);
    // The other two are false in EVERY version, including the ones that could
    // have said otherwise. Without this the flag could be read as "always on"
    // and the line above would still pass.
    expect(l1!.second).toBe(false);
    expect(l3!.second).toBe(false);
  });

  it.each(VERSIONS)('v%i dosyasında dersin günlük kutusu korunuyor', (version) => {
    const [l1, l2, l3] = parse(version).lessons;

    // The per-lesson daily limit arrives with the rule machinery in v3. In a
    // v1/v2 file there is no box at all, and `null` is the right answer: use
    // the layer above.
    expect(l2!.maxPerDay).toBe(version >= 3 ? 1 : null);
    expect(l1!.maxPerDay).toBeNull();
    expect(l3!.maxPerDay).toBeNull();
  });
});

// ------------------------------------------------------------- the settings

describe('şema örnekleri — ayarlar', () => {
  it.each(VERSIONS)('v%i dosyasının okul adı ve günleri kayıpsız geliyor', (version) => {
    const settings = parse(version).settings;

    // v1/v2 had no school name: `settings` there is days and hours, nothing else.
    expect(settings.schoolName).toBe(version >= 3 ? 'Birey Kurs' : '');
    // v3 turned a day from a name into an object, and the long break is what
    // that object carries. A v1/v2 file stores only the name, so the break
    // falls back to the program's own weekday guess, which is 5 for both of
    // these days and is NOT what the file says for Çarşamba.
    expect(settings.days.map((d) => d.longBreakAfter)).toEqual(version >= 3 ? [5, 4] : [5, 5]);
  });

  it.each(VERSIONS)('v%i dosyasının zil saatleri kayıpsız geliyor', (version) => {
    const bell = parse(version).settings.bell;

    expect(bell).toEqual(
      version >= 3
        ? { start: '08:30', lessonMinutes: 45, breakMinutes: 5, longBreakMinutes: 40 }
        : BLANK.bell,
    );
  });

  it.each(VERSIONS)('v%i dosyasının sınırları ve kural seviyeleri kayıpsız geliyor', (version) => {
    const settings = parse(version).settings;

    if (version >= 14) {
      // The two window rules are v14's own. Below it neither the number nor
      // the level exists in a file.
      expect(settings.limits.maxGapsTeacher).toBe(1);
      expect(settings.limits.maxGapsClass).toBe(2);
      expect(settings.rules.maxGapsTeacher).toBe('warn');
      expect(settings.rules.maxGapsClass).toBe('warn');
    } else {
      expect(settings.limits.maxGapsTeacher).toBe(0);
      expect(settings.limits.maxGapsClass).toBe(0);
      expect(settings.rules.maxGapsTeacher).toBe(BLANK.rules.maxGapsTeacher);
      expect(settings.rules.maxGapsClass).toBe(BLANK.rules.maxGapsClass);
    }

    if (version >= 3) {
      expect(settings.limits.maxConsecutive).toBe(3);
      expect(settings.limits.maxPerDay).toBe(5);
      expect(settings.limits.minPerDay).toBe(1);
      expect(settings.limits.maxSameLessonPerDay).toBe(2);
      expect(settings.rules.maxConsecutive).toBe('warn');
      expect(settings.rules.maxPerDay).toBe('off');
      expect(settings.rules.minPerDay).toBe('off');
      expect(settings.rules.maxSameLessonPerDay).toBe('warn');
    } else {
      // v1/v2 predate the rules entirely, so every number here is the
      // program's own rather than a guess made on the way in.
      expect(settings.limits).toEqual(BLANK.limits);
      expect(settings.rules).toEqual(BLANK.rules);
    }
  });

  it.each(VERSIONS)('v%i dosyasının branş listesi kaybolmuyor', (version) => {
    const settings = parse(version).settings;

    // v5 gave the school its own subject list. A file below it predates the
    // list and must NOT inherit today's empty one: its teachers carry subject
    // names, and an empty list turns every one of them into a stray.
    expect(settings.subjects).toEqual(
      version >= 5 ? ['Matematik', 'Fizik', 'Edebiyat'] : defaultSubjects(),
    );
    // v4 brought the short-form overrides. Only the changed ones are stored.
    expect(settings.subjectShorts).toEqual(version >= 4 ? { Edebiyat: 'Edb' } : {});
  });

  it.each(VERSIONS)('v%i dosyasının öğretmenleri kayıpsız geliyor', (version) => {
    const [mc, av] = parse(version).teachers;

    expect(mc!.name).toBe('Mehmet Çelik');
    expect(mc!.subject).toBe('Matematik');
    // v6 added the gender, v8 the second subject. Neither is guessed below
    // its version: a gender is not read off a name, and a second subject
    // nobody wrote down is a subject nobody teaches.
    expect(mc!.gender).toBe(version >= 6 ? 'e' : '');
    expect(av!.gender).toBe(version >= 6 ? 'k' : '');
    expect(mc!.subject2).toBe(version >= 8 ? 'Fizik' : '');
    expect(av!.subject2).toBe('');
    // The teacher's own limit boxes arrive with the rule machinery in v3.
    expect(mc!.limits).toEqual(
      version >= 3
        ? { maxConsecutive: 2, maxPerDay: null, minPerDay: null }
        : { maxConsecutive: null, maxPerDay: null, minPerDay: null },
    );
    expect(av!.limits).toEqual({ maxConsecutive: null, maxPerDay: null, minPerDay: null });
  });

  it.each(VERSIONS)('v%i dosyasının sınıfları kayıpsız geliyor', (version) => {
    const state = parse(version);
    const [c510, c511] = state.classes;

    expect(c510!.roomId).toBe('rA');
    expect(c511!.roomId).toBeNull();
    // v11 gave the class its own "same lesson per day" box. Below it there is
    // no box, and "no box" means "use the school's number": null, on every
    // path (the v1/v2 path answered `undefined` until 2026-09-25, TODO 8g).
    if (version >= 11) expect(c510!.maxSameLessonPerDay).toBe(2);
    else expect(c510!.maxSameLessonPerDay).toBeNull();
    expect(c511!.maxSameLessonPerDay).toBeNull();

    // A colour is an identity, not decoration: two rows sharing one is what
    // makes a pool card stop pointing at a single teacher. Written as the
    // invariant rather than as today's indexes, because a file below v5 has
    // no class colour at all and the one it is handed is an implementation
    // detail, while the fact that it is its own is not.
    const teacherColors = state.teachers.map((t) => t.color);
    const classColors = state.classes.map((c) => c.color);
    expect(new Set(teacherColors).size).toBe(teacherColors.length);
    // Every version: the v1/v2 path handed out no colour at all until
    // 2026-09-25 (TODO 8g).
    expect(new Set(classColors).size).toBe(classColors.length);
    // Where the file DOES carry them they come back untouched, so "spread the
    // colours" can never quietly renumber a file that was already fine.
    expect(teacherColors).toEqual([3, 7]);
    if (version >= 5) expect(classColors).toEqual([1, 2]);
  });

  it.each(VERSIONS)('v%i dosyasının program zarfı doğru geliyor', (version) => {
    const state = parse(version);
    const program = activeProgram(state);

    // v12 moved the grid into named alternatives. A file below it has one
    // unnamed grid at the top level, and it becomes the default envelope.
    expect(program.id).toBe(version >= 12 ? 'p1' : 'program-1');
    expect(program.name).toBe(version >= 12 ? 'A programı' : 'Program 1');
    expect(state.activeProgramId).toBe(program.id);
    expect(state.programs.length).toBe(1);
    // v10 brought pinning, and a file below it cannot carry a pin. None is
    // invented either, which would lock a cell nobody locked.
    expect(program.pinned).toEqual(version >= 10 ? { 'c510|0|0': 1 } : {});
  });
});

describe('şema örnekleri — cevaplar (v15)', () => {
  it.each(VERSIONS)('v%i dosyasının cevapları doğru geliyor', (version) => {
    const answers = parse(version).answers;
    // v15 brought them. A file below it has none, and none is invented.
    if (version >= 15) {
      expect(answers.accepted).toEqual([
        { kind: 'teacherHour', teacherId: 'tAV', day: 1, hour: 0 },
        { kind: 'teacherDayLimit', teacherId: 'tMC', limit: 6 },
      ]);
      expect(answers.refused).toEqual([
        { kind: 'teacherDay', teacherId: 'tAV', day: 0 },
        { kind: 'teacherCap', teacherId: 'tMC', day: 1, max: 1 },
      ]);
    } else {
      expect(answers).toEqual({ accepted: [], refused: [] });
    }
  });

  it('okunamayan bir cevap tek başına düşüyor, dosyanın geri kalanı geliyor', () => {
    const state = edited<{ answers: { accepted: unknown[]; refused: unknown[] } }>(
      SCHEMA_VERSION,
      (raw) => {
        raw.answers.accepted.push({ kind: 'teacherHour', teacherId: 'tAV', day: 'Salı' });
        raw.answers.refused.push({ kind: 'uydurma' }, null);
      },
    );
    expect(state).not.toBeNull();
    expect(state!.answers.accepted).toHaveLength(2);
    expect(state!.answers.refused).toHaveLength(2);
    expect(Object.keys(activeProgram(state!).placements)).toHaveLength(6);
  });
});

describe('şema örnekleri — ilişkiler (v16)', () => {
  it.each(VERSIONS)('v%i dosyasının ilişkileri doğru geliyor', (version) => {
    const relations = parse(version).relations;
    // v16 brought them. A file below it has none, and none is invented.
    if (version >= 16) {
      expect(relations).toEqual([{ id: 'r1', kind: 'notSameDay', lessonIds: ['l2', 'l3'] }]);
    } else {
      expect(relations).toEqual([]);
    }
  });

  it('okunamayan, yarım ya da tekrarlanan ilişki tek başına düşüyor', () => {
    const state = edited<{ relations: unknown[] }>(SCHEMA_VERSION, (raw) => {
      raw.relations.push(
        { id: 'r2', kind: 'uydurma', lessonIds: ['l1', 'l2'] },
        { id: 'r3', kind: 'notSameDay', lessonIds: ['l1'] },
        { id: 'r4', kind: 'notSameDay', lessonIds: ['l1', 'l1'] },
        { id: 'r5', kind: 'notSameDay', lessonIds: ['l3', 'l2'] },
        { id: 'r6', kind: 'notSameDay', lessonIds: ['l1', 'yok'] },
        null,
      );
    });
    expect(state).not.toBeNull();
    expect(state!.relations.map((r) => r.id)).toEqual(['r1']);
    expect(Object.keys(activeProgram(state!).placements)).toHaveLength(6);
  });
});

// ---------------------------------------------------- files missing a field

/**
 * The same files with a field taken out.
 *
 * Not a synthetic exercise: every file older than a field IS this file, and
 * saying what such a file means is the reader's whole job. A hand-edited
 * backup has the same shape (`store.ts` says so in as many words), and the one
 * thing that must never happen is a throw — an exception here reads to my
 * father as "this backup is gone".
 */
describe('şema örnekleri — eksik ve bozuk alanlar', () => {
  it('zil saatleri olmayan bir dosya varsayılan zile düşüyor, çökmüyor', () => {
    const state = edited<{ settings: { bell?: unknown } }>(SCHEMA_VERSION, (raw) => {
      delete raw.settings.bell;
    });

    expect(state).not.toBeNull();
    expect(state!.settings.bell).toEqual(BLANK.bell);
  });

  it('sınır kutusu olmayan öğretmen üç boş kutuyla geliyor', () => {
    const state = edited<{ teachers: Array<{ limits?: unknown }> }>(SCHEMA_VERSION, (raw) => {
      delete raw.teachers[0]!.limits;
    });

    expect(state).not.toBeNull();
    expect(state!.teachers[0]!.limits).toEqual({
      maxConsecutive: null,
      maxPerDay: null,
      minPerDay: null,
    });
  });

  it('okul adı olmayan bir dosya boş adla geliyor', () => {
    const state = edited<{ settings: { schoolName?: unknown } }>(SCHEMA_VERSION, (raw) => {
      delete raw.settings.schoolName;
    });

    expect(state!.settings.schoolName).toBe('');
  });

  it('saat listesi boşalınca varsayılan güne düşüyor', () => {
    const state = edited<{ settings: { hours: unknown } }>(SCHEMA_VERSION, (raw) => {
      raw.settings.hours = [];
    });

    // Not "12 saat": the count is the program's default day, whatever it is.
    expect(state!.settings.hours).toEqual(BLANK.hours);
  });

  it('saat listesindeki dize olmayan eleman düşüyor, kalanlar duruyor', () => {
    const state = edited<{ settings: { hours: unknown } }>(SCHEMA_VERSION, (raw) => {
      raw.settings.hours = ['1', 7, '3', null];
    });

    expect(state!.settings.hours).toEqual(['1', '3']);
  });

  it('gün listesindeki çöp düşüyor, dize bir güne dönüyor', () => {
    const state = edited<{ settings: { days: unknown } }>(SCHEMA_VERSION, (raw) => {
      raw.settings.days = [null, { longBreakAfter: 3 }, 'Perşembe', { name: 'Cuma' }];
    });

    // A null and a nameless object are not days. A bare string is: that is
    // how v1 and v2 stored one, so the reader still understands it.
    expect(state!.settings.days).toEqual([
      { name: 'Perşembe', longBreakAfter: 5 },
      { name: 'Cuma', longBreakAfter: 0 },
    ]);
  });

  it('gün listesi tamamen çöpse varsayılan haftaya düşüyor', () => {
    const state = edited<{ settings: { days: unknown } }>(SCHEMA_VERSION, (raw) => {
      raw.settings.days = [null, 42];
    });

    expect(state!.settings.days).toEqual(BLANK.days);
  });

  it('adı ve kimliği olmayan program zarfı adlandırılıyor', () => {
    const state = edited<{
      programs: Array<Record<string, unknown>>;
      activeProgramId?: unknown;
    }>(SCHEMA_VERSION, (raw) => {
      delete raw.programs[0]!.id;
      delete raw.programs[0]!.name;
      delete raw.activeProgramId;
    });

    const program = activeProgram(state!);
    expect(program.id).toBe('program-1');
    expect(program.name).toBe('Program 1');
    expect(state!.activeProgramId).toBe('program-1');
    // The grid inside it is not collateral damage of a missing name.
    expect(Object.keys(program.placements).length).toBe(6);
  });

  it('elle yazılmış 4 saatlik blok bugünkü dosyada blok sayılmıyor', () => {
    // v13 removed the four. In a v12 file a 4 MEANS 3+1 and is read that way
    // (the table above), but a file claiming to be v13 or newer cannot have
    // been written by a version that could say 4, so nothing is inferred: the
    // block is dropped and the hours stay, i.e. that week becomes singles.
    for (const version of [SCHEMA_VERSION, SCHEMA_VERSION - 1]) {
      const state = edited<{ lessons: Array<Record<string, unknown>> }>(version, (raw) => {
        raw.lessons[0]!.weeklyHours = 5;
        raw.lessons[0]!.blocks = [4];
      });

      expect(state!.lessons[0]!.weeklyHours, `v${version}`).toBe(5);
      expect(state!.lessons[0]!.blocks, `v${version}`).toEqual([]);
    }
  });

  it('v1 dosyasında ayar bloğu hiç yoksa çökmüyor', () => {
    const state = edited<{ ayar?: unknown }>(1, (raw) => {
      delete raw.ayar;
    });

    expect(state).not.toBeNull();
    expect(state!.settings.days).toEqual(BLANK.days);
    expect(state!.settings.hours).toEqual(BLANK.hours);
    // The rest of the school is still there: a missing settings block is not
    // a reason to lose the teachers.
    expect(state!.teachers.map((t) => t.short)).toEqual(['MÇ', 'AV']);
  });

  it('v2 dosyasında settings bloğu hiç yoksa çökmüyor', () => {
    const state = edited<{ settings?: unknown }>(2, (raw) => {
      delete raw.settings;
    });

    expect(state).not.toBeNull();
    expect(state!.settings.days).toEqual(BLANK.days);
    expect(state!.settings.hours).toEqual(BLANK.hours);
  });

  /**
   * `migrateV2toV3` used to build its classes with a bare `asArray`, so the two
   * normalizers the v3+ path runs over the same list never touched a v1 or v2
   * file (measured 2026-09-12, TODO 8g, fixed 2026-09-25). This case stood
   * here as "BİLİNEN KUSUR" pinning the defect, and went red by name when the
   * fix landed.
   *
   * Without `asBox` the class's daily box arrived as `undefined`, and
   * `Rules.tsx` asks `!== null`, so every class of such a backup was listed
   * under "kendi sınırı olan sınıflar" with an empty number. Without
   * `spreadColors` no class had a colour and `paletteColor` painted all of
   * them with the first entry (`#c3a2cd`). A v3 or v4 file carrying no class
   * colour comes out 0 and 1, and so must these.
   */
  it('v1/v2 yolu sınıfları v3 ve sonrası gibi normalize ediyor', () => {
    for (const version of [1, 2]) {
      const classes = parse(version).classes;
      for (const group of classes) {
        expect(group.maxSameLessonPerDay, `v${version} ${group.name} kutusu`).toBeNull();
      }
      expect(
        classes.map((g) => g.color),
        `v${version} renkleri`,
      ).toEqual([0, 1]);
    }
    expect(parse(1).teachers[0]!.limits.maxConsecutive).toBeNull();
    expect(parse(1).teachers.map((t) => t.color)).toEqual([3, 7]);
  });

  it('v2 dosyasında dize olmayan gün adı düşüyor', () => {
    const state = edited<{ settings: { days: unknown } }>(2, (raw) => {
      raw.settings.days = ['Salı', 42, 'Çarşamba'];
    });

    expect(state!.settings.days.map((d) => d.name)).toEqual(['Salı', 'Çarşamba']);
  });
});
