// Writes one example backup file per schema version into src/fixtures/.
//
// WHY a generator and not fourteen hand-typed files: the recipe is the part
// worth reading. Each version differs from the next by one named change, and
// the transforms below say which. Without a recipe every decision inside a
// generated file freezes unexplained (pitfall 69).
//
// WHY files on disk and not objects built inside the test: a fixture derived
// from today's sample state is not a file from that era, it is today's shape
// wearing an old version number. It drifts every time the sample changes, and
// what has to stay frozen is exactly the old shape.
//
// THE FILES ARE MADE UP. Nobody's real v3 backup survives: the repository has
// never held a user backup and none could be recovered from git history
// (`git log --all --diff-filter=A` over every .json in the tree, 2026-09-12).
// So each file is written to the shape that version's reader and writer
// agreed on, read from the migration notes in src/types.ts and from the
// reader in src/store.ts. That is weaker than a real file for the byte
// details and exactly as strong for the question being asked: does today's
// parseState still open what that version wrote.
//
// One field could not be dated: `Lesson.maxPerDay` is not named by any entry
// in the migration notes, so the files below carry it from v3 up and drop it
// at v2 with the rest of the rule machinery. The reader tolerates its absence
// either way, so a wrong guess here cannot make a file unopenable.
//
// Run: node scripts/sema-ornek.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', 'src', 'fixtures');

/**
 * A small school in TODAY's shape (v14). Small on purpose: a fixture is read
 * by a person when a migration breaks. It still carries the awkward parts,
 * because those are where a migration goes wrong: a second subject, a lesson
 * taught under it, a two-hour block, a three-hour block, a lesson with no
 * block at all, a pinned cell, a closed hour, and a laid-out timetable.
 */
function v14() {
  return {
    schemaVersion: 14,
    settings: {
      schoolName: 'Birey Kurs',
      days: [
        { name: 'Salı', longBreakAfter: 5 },
        { name: 'Çarşamba', longBreakAfter: 5 },
      ],
      hours: ['1', '2', '3', '4', '5', '6'],
      bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
      limits: {
        maxConsecutive: 3,
        maxPerDay: 5,
        minPerDay: 0,
        maxSameLessonPerDay: 2,
        maxGapsTeacher: 1,
        maxGapsClass: 0,
      },
      rules: {
        maxConsecutive: 'block',
        maxPerDay: 'block',
        minPerDay: 'warn',
        maxSameLessonPerDay: 'block',
        maxGapsTeacher: 'warn',
        maxGapsClass: 'off',
      },
      subjects: ['Matematik', 'Fizik', 'Edebiyat'],
      subjectShorts: { Edebiyat: 'Edb' },
    },
    rooms: [{ id: 'rA', name: 'A' }],
    teachers: [
      {
        id: 'tMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        subject2: 'Fizik',
        gender: 'e',
        color: 3,
        limits: { maxConsecutive: 2, maxPerDay: null, minPerDay: null },
      },
      {
        id: 'tAV',
        name: 'Ayşe Vural',
        short: 'AV',
        subject: 'Edebiyat',
        subject2: '',
        gender: 'k',
        color: 7,
        limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
      },
    ],
    classes: [
      { id: 'c510', name: '510', roomId: 'rA', color: 1, maxSameLessonPerDay: 2 },
      { id: 'c511', name: '511', roomId: null, color: 2, maxSameLessonPerDay: null },
    ],
    lessons: [
      {
        id: 'l1',
        classId: 'c510',
        teacherId: 'tMC',
        weeklyHours: 4,
        blocks: [2],
        second: false,
        maxPerDay: null,
      },
      {
        id: 'l2',
        classId: 'c510',
        teacherId: 'tMC',
        weeklyHours: 3,
        blocks: [3],
        second: true,
        maxPerDay: 1,
      },
      {
        id: 'l3',
        classId: 'c511',
        teacherId: 'tAV',
        weeklyHours: 2,
        blocks: [],
        second: false,
        maxPerDay: null,
      },
    ],
    unavailable: { 'tAV|1|0': 1, 'c511|0|5': 1, 'rA|1|5': 1 },
    programs: [
      {
        id: 'p1',
        name: 'Program 1',
        placements: {
          'c510|0|0': 'l1',
          'c510|0|1': 'l1',
          'c510|1|2': 'l2',
          'c510|1|3': 'l2',
          'c510|1|4': 'l2',
          'c511|0|2': 'l3',
        },
        pinned: { 'c510|0|0': 1 },
      },
    ],
    activeProgramId: 'p1',
  };
}

const clone = (x) => JSON.parse(JSON.stringify(x));

/** The single program's grid, as every version before v12 stored it: at the top. */
function flatten(raw) {
  const program = raw.programs[0];
  raw.placements = program.placements;
  raw.pinned = program.pinned;
  delete raw.programs;
  delete raw.activeProgramId;
}

/**
 * One step down per entry, newest first. Each function receives the file as
 * the version ABOVE it wrote it and edits it into the version named by the
 * key. The chain is applied in order, so v3 is v14 with eleven steps undone.
 */
const DOWN = {
  13: (raw) => {
    // v14 added the two window (gap) rules. Below it neither field exists.
    raw.schemaVersion = 13;
    delete raw.settings.limits.maxGapsTeacher;
    delete raw.settings.limits.maxGapsClass;
    delete raw.settings.rules.maxGapsTeacher;
    delete raw.settings.rules.maxGapsClass;
  },
  12: (raw) => {
    // v13 narrowed a block to 2 or 3 hours. A v12 file may hold a 4, and
    // reading one back as a 3 plus an implied single is the migration.
    raw.schemaVersion = 12;
    raw.lessons[0].weeklyHours = 5;
    raw.lessons[0].blocks = [4];
  },
  11: (raw) => {
    // v12 moved the grid into named alternative programs.
    raw.schemaVersion = 11;
    flatten(raw);
  },
  10: (raw) => {
    // v11 gave the class its own daily limit for one lesson.
    raw.schemaVersion = 10;
    for (const c of raw.classes) delete c.maxSameLessonPerDay;
  },
  9: (raw) => {
    // v10 brought pinning. Below it no file can carry a pin.
    raw.schemaVersion = 9;
    delete raw.pinned;
  },
  8: (raw) => {
    // v9 replaced `pairs` with the `blocks` list. A v8 file could only say
    // "this many of the hours are doubles".
    raw.schemaVersion = 8;
    for (const lesson of raw.lessons) {
      lesson.pairs = lesson.blocks.length > 0 ? Math.floor(lesson.weeklyHours / 2) : 0;
      delete lesson.blocks;
    }
  },
  7: (raw) => {
    // v8 gave a teacher a second subject and a lesson the flag that says it
    // is taught under it.
    raw.schemaVersion = 7;
    for (const t of raw.teachers) delete t.subject2;
    for (const lesson of raw.lessons) delete lesson.second;
  },
  6: (raw) => {
    // v7 replaced `blockSize` with `pairs`. A v6 file said "every block of
    // this lesson is this long".
    raw.schemaVersion = 6;
    for (const lesson of raw.lessons) {
      lesson.blockSize = lesson.pairs > 0 ? 2 : 1;
      delete lesson.pairs;
    }
  },
  5: (raw) => {
    // v6 added the teacher's gender.
    raw.schemaVersion = 5;
    for (const t of raw.teachers) delete t.gender;
  },
  4: (raw) => {
    // v5 added the class colour and the school's own subject list.
    raw.schemaVersion = 4;
    for (const c of raw.classes) delete c.color;
    delete raw.settings.subjects;
  },
  3: (raw) => {
    // v4 added the subject short forms.
    raw.schemaVersion = 3;
    delete raw.settings.subjectShorts;
  },
  2: (raw) => {
    // v3 brought day objects, bell times, limits and rules. A v2 file has
    // plain string days and none of the rest, not even on the teacher.
    raw.schemaVersion = 2;
    raw.settings = {
      days: raw.settings.days.map((d) => d.name),
      hours: raw.settings.hours,
    };
    for (const t of raw.teachers) delete t.limits;
    for (const lesson of raw.lessons) delete lesson.maxPerDay;
  },
  1: (raw) => {
    // v2 was the English rename. Below it every field name is Turkish, and
    // the ids are the only thing the two shapes share.
    const out = {
      semaSurumu: 1,
      ayar: { gunler: raw.settings.days, saatler: raw.settings.hours },
      derslikler: raw.rooms.map((r) => ({ id: r.id, ad: r.name })),
      ogretmenler: raw.teachers.map((t) => ({
        id: t.id,
        ad: t.name,
        kisaltma: t.short,
        brans: t.subject,
        renk: t.color,
      })),
      siniflar: raw.classes.map((c) => ({ id: c.id, ad: c.name, derslikId: c.roomId })),
      dersler: raw.lessons.map((l) => ({
        id: l.id,
        sinifId: l.classId,
        ogretmenId: l.teacherId,
        haftalikSaat: l.weeklyHours,
        blok: l.blockSize,
      })),
      musaitDegil: raw.unavailable,
      yerlesim: raw.placements,
    };
    for (const key of Object.keys(raw)) delete raw[key];
    Object.assign(raw, out);
  },
};

mkdirSync(OUT, { recursive: true });

let raw = v14();
writeFileSync(join(OUT, 'v14.json'), JSON.stringify(raw, null, 2) + '\n');

for (const version of [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]) {
  raw = clone(raw);
  DOWN[version](raw);
  writeFileSync(join(OUT, `v${version}.json`), JSON.stringify(raw, null, 2) + '\n');
}

console.log(`14 örnek dosya yazıldı: ${OUT}`);
