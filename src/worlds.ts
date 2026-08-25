// Hand-built worlds for testing the solver, and the auditor that judges what it
// produced. TEST-ONLY: no application module imports this file, so Vite shakes
// it out of dist/index.html.
//
// It lives in src/ and not in e2e/ for one reason: tsconfig.json only includes
// `src`, so nothing under e2e/ is type-checked. A world that does not match
// `State` must fail `tsc --noEmit`, not fail mysteriously in a browser.
//
// Both consumers share it — src/solver.test.ts runs every world through solve()
// in Node, e2e/otomatik-dunyalar.spec.ts loads the same worlds into the built
// file:// page and audits what the real button left in localStorage.

import {
  blockStart,
  blocker,
  buildIndex,
  placementKey,
  removeBlock,
} from './constraints';
import {
  DEFAULT_BELL,
  DEFAULT_LIMITS,
  DEFAULT_RULES,
  NO_TEACHER_LIMITS,
  hourNames,
} from './entities';
import { sampleState } from './sample';
import type {
  ClassGroup,
  Day,
  Id,
  Lesson,
  Limits,
  Room,
  Rules,
  State,
  Teacher,
} from './types';
import { SCHEMA_VERSION } from './types';

// ---------------------------------------------------------------- the builder

/** Everything is optional; the defaults are a 1 day x 4 hour school. */
export interface WorldSpec {
  /** A number of days (named from the week), or the days themselves. */
  days?: number | Day[];
  hours?: number;
  rooms?: Room[];
  /** `name` defaults to `short`, `color` to the index. */
  teachers?: Array<{ id: Id; short: string; subject?: string; limits?: Teacher['limits'] }>;
  classes?: Array<{ id: Id; name: string; roomId: Id | null }>;
  lessons?: Array<{
    id: Id;
    classId: Id;
    teacherId: Id;
    weeklyHours: number;
    blockSize?: number;
    maxPerDay?: number | null;
  }>;
  unavailable?: Record<string, 1>;
  placements?: Record<string, Id>;
  limits?: Partial<Limits>;
  rules?: Partial<Rules>;
}

const WEEKDAYS = ['Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar', 'Pazartesi'];

function daysOf(spec: WorldSpec['days']): Day[] {
  if (Array.isArray(spec)) return spec;
  const count = spec ?? 1;
  return Array.from({ length: count }, (_, i) => ({
    name: WEEKDAYS[i % WEEKDAYS.length] ?? `Gün ${i + 1}`,
    longBreakAfter: 0,
  }));
}

/**
 * A small world whose numbers can be worked out on paper.
 *
 * The defaults are deliberately identical to the fixture builder that grew up
 * inside e2e/kontrol.spec.ts, so that file can hand its own building over to
 * this one and there is a single place where a test world is described.
 */
export function makeWorld(spec: WorldSpec = {}): State {
  const teachers: Teacher[] = (spec.teachers ?? [{ id: 'oMC', short: 'MÇ' }]).map((t, i) => ({
    id: t.id,
    name: t.short,
    short: t.short,
    subject: t.subject ?? 'Matematik',
    color: i,
    limits: t.limits ?? { ...NO_TEACHER_LIMITS },
  }));

  const classes: ClassGroup[] = (
    spec.classes ?? [{ id: 's510', name: '510', roomId: 'dA' }]
  ).map((c, i) => ({ ...c, color: i }));

  const lessons: Lesson[] = (spec.lessons ?? []).map((x) => ({
    blockSize: 1,
    maxPerDay: null,
    ...x,
  }));

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: daysOf(spec.days),
      hours: hourNames(spec.hours ?? 4),
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS, ...spec.limits },
      rules: { ...DEFAULT_RULES, ...spec.rules },
      subjects: ['Matematik', 'Fizik'],
      subjectShorts: {},
    },
    rooms: spec.rooms ?? [{ id: 'dA', name: 'A' }],
    teachers,
    classes,
    lessons,
    unavailable: spec.unavailable ?? {},
    placements: spec.placements ?? {},
  };
}

/** Closes `entityId` for the whole week. Works for teachers, classes and rooms. */
export function closeWeek(d: State, entityId: Id): State {
  const unavailable = { ...d.unavailable };
  for (let g = 0; g < d.settings.days.length; g++) {
    for (let s = 0; s < d.settings.hours.length; s++) unavailable[`${entityId}|${g}|${s}`] = 1;
  }
  return { ...d, unavailable };
}

/** Closes the listed `day|hour` pairs for one entity. */
export function closeHours(d: State, entityId: Id, cells: Array<[number, number]>): State {
  const unavailable = { ...d.unavailable };
  for (const [g, s] of cells) unavailable[`${entityId}|${g}|${s}`] = 1;
  return { ...d, unavailable };
}

// ---------------------------------------------------------------- the auditor

export interface Illegal {
  lessonId: Id;
  classId: Id;
  day: number;
  hour: number;
  /** What blocker() said when the block was offered its own square back. */
  reason: string;
}

interface Block {
  lessonId: Id;
  classId: Id;
  day: number;
  hour: number;
}

/** Every block on the grid, found the way the grid itself finds them. */
export function blocksOf(d: State): Block[] {
  const seen = new Set<string>();
  const out: Block[] = [];
  for (const key of Object.keys(d.placements)) {
    const cut = key.lastIndexOf('|');
    const hour = Number(key.slice(cut + 1));
    const rest = key.slice(0, cut);
    const classId = rest.slice(0, rest.lastIndexOf('|'));
    const day = Number(rest.slice(rest.lastIndexOf('|') + 1));

    const start = blockStart(d, classId, day, hour);
    if (start === null) continue;
    const mark = `${classId}|${day}|${start}`;
    if (seen.has(mark)) continue;
    seen.add(mark);

    const lessonId = d.placements[placementKey(classId, day, start)];
    if (lessonId === undefined) continue;
    out.push({ lessonId, classId, day, hour: start });
  }
  return out;
}

/**
 * The strongest single question that can be asked of a laid-out timetable: lift
 * each block back off the grid and ask blocker() whether it could legally be
 * dropped where it sits. Anything the solver's in-place index got wrong shows
 * up here, because this path goes through buildIndex() instead.
 *
 * It returns a list rather than asserting, so Vitest and Playwright can both
 * use it. src/worlds.test.ts feeds it a deliberately illegal grid — an auditor
 * that always answered "all clear" would make every test below meaningless.
 */
export function illegalBlocks(d: State): Illegal[] {
  const out: Illegal[] = [];
  for (const b of blocksOf(d)) {
    const lifted = removeBlock(d, b.classId, b.day, b.hour);
    const reason = blocker(lifted, buildIndex(lifted), b.lessonId, b.day, b.hour);
    if (reason !== null) out.push({ ...b, reason });
  }
  return out;
}

/** How many hours of one lesson are on the grid. */
export function hoursOf(d: State, lessonId: Id): number {
  return Object.values(d.placements).filter((x) => x === lessonId).length;
}

// ----------------------------------------------------------------- the worlds

export interface SolverWorld {
  /** Test title; Turkish, like every other test name in this project. */
  name: string;
  /** What it stresses, one line. */
  note: string;
  /** Real-scale: runs under `npm run cozucu`, not in the main suite. */
  heavy?: true;
  state: State;
  want: {
    /** Must the whole load fit? */
    solved: boolean;
    /** If it cannot, what the worst reason sentence should look like. */
    reasonLike?: RegExp;
    /**
     * The search must really back up. In a run with no backtracking `nodes`
     * equals `totalBlocks` (measured on sample.ts: 359 nodes, 359 blocks), so
     * `nodes > totalBlocks` is the proof that the code path ran at all.
     */
    backtracks?: true;
  };
}

/** 1 teacher, 1 class, load == capacity: every square must be filled. */
function tamDolu(): State {
  return makeWorld({
    days: 3,
    hours: 4,
    teachers: [{ id: 'oMC', short: 'MÇ' }],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 1 },
    ],
  });
}

/** Three classes in room A; together they want more hours than the room has. */
function dersllikDarbogazi(): State {
  return makeWorld({
    days: 2,
    hours: 4,
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
      { id: 'oKY', short: 'KY' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dA' },
      { id: 's512', name: '512', roomId: 'dA' },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 },
      { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 4 },
      { id: 'x3', classId: 's512', teacherId: 'oKY', weeklyHours: 4 },
    ],
  });
}

/** Nothing but blocks, and a day of 5 so a 3-block only fits at hours 0..2. */
function saltBlok(): State {
  return makeWorld({
    days: 3,
    hours: 5,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 3 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 4, blockSize: 2 },
    ],
  });
}

/** 5 weekly hours in 2-hour blocks: 4 go down, 1 can never be placed. */
function bolunmeyenSaat(): State {
  return makeWorld({
    days: 3,
    hours: 4,
    lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 5, blockSize: 2 }],
  });
}

/** AV cannot come at all; MÇ's lessons must still be laid out. */
function ogretmenHaftaKapali(): State {
  return closeWeek(
    makeWorld({
      days: 2,
      hours: 4,
      teachers: [
        { id: 'oMC', short: 'MÇ' },
        { id: 'oAV', short: 'AV', subject: 'Fizik' },
      ],
      classes: [
        { id: 's510', name: '510', roomId: 'dA' },
        { id: 's511', name: '511', roomId: null },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 },
        { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 2 },
      ],
    }),
    'oAV',
  );
}

/** The class itself is closed on a mosaic of hours. */
function sinifKapaliSaatler(): State {
  return closeHours(
    makeWorld({
      days: 3,
      hours: 4,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6 }],
    }),
    's510',
    [
      [0, 0],
      [0, 3],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 3],
    ],
  );
}

/** The room is closed for a whole day; both classes in it must move. */
function derslikKapali(): State {
  return closeHours(
    makeWorld({
      days: 3,
      hours: 4,
      teachers: [
        { id: 'oMC', short: 'MÇ' },
        { id: 'oAV', short: 'AV', subject: 'Fizik' },
      ],
      classes: [
        { id: 's510', name: '510', roomId: 'dA' },
        { id: 's511', name: '511', roomId: 'dA' },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 },
        { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 4 },
      ],
    }),
    'dA',
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  );
}

const TIGHT_LIMITS: Partial<Limits> = {
  maxConsecutive: 1,
  maxPerDay: 3,
  maxSameLessonPerDay: 1,
};

/** The same numbers, once at "Engelle" and once at "Uyar". */
function kurallar(level: 'block' | 'warn'): State {
  return makeWorld({
    days: 4,
    hours: 4,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 4 },
    ],
    limits: TIGHT_LIMITS,
    rules: { maxConsecutive: level, maxPerDay: level, maxSameLessonPerDay: level },
  });
}

/** One day of 12 — the whole week is a single column. */
function tekGun(): State {
  return makeWorld({
    days: 1,
    hours: 12,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 6, blockSize: 3 },
    ],
  });
}

/** 7 days of 2 hours and nothing but 2-blocks: each block fills a whole day. */
function cokGunAzSaat(): State {
  return makeWorld({
    days: 7,
    hours: 2,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 8, blockSize: 2 },
      { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 6, blockSize: 2 },
    ],
  });
}

/**
 * Three blocks already on the grid, one of them in an hour that was closed
 * afterwards. keepPlaced must leave all three exactly where they are — deleting
 * the one in the closed hour would be data loss (principle 6).
 */
function elleKonmus(): State {
  const base = makeWorld({
    days: 3,
    hours: 4,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 4 },
    ],
    placements: {
      's510|0|0': 'x1',
      's510|1|2': 'x1',
      's510|2|3': 'x2',
    },
  });
  return closeHours(base, 'oMC', [[0, 0]]);
}

/**
 * Closed hours sprinkled across teachers, classes and rooms by a fixed pattern.
 * Every domain has holes in it, which is what makes the search back up.
 */
function delikDesik(): State {
  let d = makeWorld({
    days: 5,
    hours: 6,
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
      { id: 'oKY', short: 'KY' },
      { id: 'oYG', short: 'YG', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dA' },
      { id: 's512', name: '512', roomId: 'dB' },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 8, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 6, blockSize: 1 },
      { id: 'x3', classId: 's511', teacherId: 'oKY', weeklyHours: 8, blockSize: 2 },
      { id: 'x4', classId: 's511', teacherId: 'oMC', weeklyHours: 6, blockSize: 1 },
      { id: 'x5', classId: 's512', teacherId: 'oYG', weeklyHours: 8, blockSize: 2 },
      { id: 'x6', classId: 's512', teacherId: 'oAV', weeklyHours: 6, blockSize: 1 },
    ],
  });

  // A fixed comb, not a random one: the same world every run (principle: a bug
  // found here has to be reproducible).
  const holes: Array<[Id, number, number]> = [
    ['oMC', 0, 0], ['oMC', 2, 5], ['oMC', 4, 3],
    ['oAV', 1, 1], ['oAV', 3, 4], ['oAV', 4, 0],
    ['oKY', 0, 2], ['oKY', 2, 2], ['oKY', 3, 5],
    ['oYG', 1, 3], ['oYG', 2, 0], ['oYG', 4, 4],
    ['s510', 3, 0], ['s511', 1, 5], ['s512', 0, 4],
    ['dA', 2, 3], ['dB', 3, 1],
  ];
  for (const [id, g, s] of holes) d = closeHours(d, id, [[g, s]]);
  return d;
}

/** No lessons at all: solve() must hand the very same object back. */
function bosDunya(): State {
  return makeWorld({ days: 2, hours: 4, lessons: [] });
}

/** One teacher, six classes, load == that teacher's whole capacity. */
function tekOgretmenCokSinif(): State {
  const classes = Array.from({ length: 6 }, (_, i) => ({
    id: `s${510 + i}`,
    name: String(510 + i),
    roomId: null,
  }));
  return makeWorld({
    days: 4,
    hours: 3,
    teachers: [{ id: 'oMC', short: 'MÇ' }],
    classes,
    lessons: classes.map((c, i) => ({
      id: `x${i + 1}`,
      classId: c.id,
      teacherId: 'oMC',
      weeklyHours: 2,
    })),
  });
}

/**
 * The trap that makes the search back up on a world that DOES have a solution.
 *
 * AV cannot come to the first period, so the single hours crowd into 1 and 2 —
 * the earliest squares the value ordering reaches for — and the 2-hour block
 * then has nowhere contiguous to sit. The answer is to push the singles to the
 * END of the day, which the greedy order never tries first. Measured: 201 nodes
 * for 9 blocks, where a run with no backtracking spends exactly 9.
 *
 * It exists because nothing else in this file made the solver back up: with the
 * sample data it went 359 blocks in 359 nodes, so the whole backtracking half
 * of solver.ts had never actually run.
 */
function erkenSaatTuzagi(days: number, hours: number, single: number, pair: number): State {
  let d = makeWorld({
    days,
    hours,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: null }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: pair, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: single, blockSize: 1 },
    ],
  });
  for (let g = 0; g < days; g++) d = closeHours(d, 'oAV', [[g, 0]]);
  return d;
}

/**
 * "Art arda en fazla 2" at Engelle, on a 6-hour day where obeying it is
 * possible but only by leaving a gap — which the earliest-hour tiebreak does
 * not do on its own.
 */
function kuralBaskisi(): State {
  return makeWorld({
    days: 3,
    hours: 6,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: null },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 6, blockSize: 2 },
      { id: 'x3', classId: 's511', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'x4', classId: 's511', teacherId: 'oAV', weeklyHours: 6, blockSize: 2 },
    ],
    limits: { maxConsecutive: 2 },
    rules: { maxConsecutive: 'block' },
  });
}

/**
 * Two classes loaded to the last square, with three holes punched in every
 * teacher's week so no day is whole. This is the world that answers "what does
 * the solver do when the data is hard": it spends the entire budget — measured
 * 957k nodes in 5 s for 16 of 24 blocks — and still hands back a legal grid and
 * a sentence. Heavy on purpose; it is a measurement, not a pass/fail.
 */
/**
 * A lesson that asks for more than the week can ever hold, sitting next to
 * lessons that CAN be finished.
 *
 * "Aynı ders günde en fazla 1 saat" at Engelle over three days means no lesson
 * here can hold more than 3 hours; x1 asks for 6. The point of the world is not
 * x1 — it is x2 and x3, which must come out complete anyway. Before the ceiling
 * was worked out up front, MRV kept re-choosing x1 (its domain is the smallest),
 * filled the three days it is allowed, found nothing for the rest and killed the
 * branch — for every cell of every lesson above it.
 */
function imkansizDersYaninda(): State {
  return makeWorld({
    days: 3,
    hours: 4,
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: null },
    ],
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV' },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 3 },
      { id: 'x3', classId: 's511', teacherId: 'oMC', weeklyHours: 3 },
    ],
    limits: { maxSameLessonPerDay: 1 },
    rules: { maxSameLessonPerDay: 'block' },
  });
}

/**
 * A 2-hour block against "aynı ders günde en fazla 1 saat": the block breaches
 * the rule wherever it lands, so not one cell of the week is legal and the
 * lesson is hopeless before the search takes its first step. Its neighbour is
 * laid out all the same.
 */
function blokKuralaSigmiyor(): State {
  return makeWorld({
    days: 2,
    hours: 4,
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oMC', weeklyHours: 2 },
    ],
    limits: { maxSameLessonPerDay: 1 },
    rules: { maxSameLessonPerDay: 'block' },
  });
}

function parcalanmisGunler(): State {
  let d = makeWorld({
    days: 4,
    hours: 5,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
      { id: 'oKY', short: 'KY' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: null },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 8, blockSize: 2 },
      { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 6, blockSize: 3 },
      { id: 'x3', classId: 's510', teacherId: 'oKY', weeklyHours: 6, blockSize: 1 },
      { id: 'x4', classId: 's511', teacherId: 'oAV', weeklyHours: 8, blockSize: 2 },
      { id: 'x5', classId: 's511', teacherId: 'oKY', weeklyHours: 6, blockSize: 3 },
      { id: 'x6', classId: 's511', teacherId: 'oMC', weeklyHours: 6, blockSize: 1 },
    ],
  });
  d = closeHours(d, 'oMC', [[0, 2], [1, 0], [3, 4]]);
  d = closeHours(d, 'oAV', [[0, 4], [2, 1], [3, 0]]);
  d = closeHours(d, 'oKY', [[1, 3], [2, 4], [3, 2]]);
  return d;
}

// ------------------------------------------------------------ heavy worlds

/**
 * The sample school, reloaded to `ratio` of what each class's ROOM can spare.
 *
 * The room share is not decoration: 20 classes share 8 rooms, so a class in a
 * four-way room has a quarter of the week, not a whole one. Scaling the load
 * without that division does not produce a tight school, it produces an absurd
 * one — measured: 3 blocks placed out of 1079, which says nothing about the
 * solver and everything about the fixture.
 */
function realScale(ratio: number, cap: number): State {
  const base = sampleState();
  const slots = base.settings.days.length * base.settings.hours.length;

  const sharing = new Map<Id, number>();
  for (const c of base.classes) {
    if (c.roomId != null) sharing.set(c.roomId, (sharing.get(c.roomId) ?? 0) + 1);
  }

  const byClass = new Map<Id, Lesson[]>();
  for (const lesson of base.lessons) {
    const list = byClass.get(lesson.classId) ?? [];
    list.push(lesson);
    byClass.set(lesson.classId, list);
  }

  const lessons: Lesson[] = [];
  for (const group of base.classes) {
    const list = byClass.get(group.id) ?? [];
    const siblings = group.roomId != null ? (sharing.get(group.roomId) ?? 1) : 1;
    let budget = Math.min(cap, Math.floor((slots * ratio) / siblings));

    for (const [i, lesson] of list.entries()) {
      const remaining = list.length - i;
      const block = Math.max(1, lesson.blockSize);
      const share = Math.max(block, Math.floor(budget / remaining / block) * block);
      const hours = Math.min(budget, share);
      if (hours < block) continue;
      lessons.push({ ...lesson, weeklyHours: hours });
      budget -= hours;
    }
  }
  return { ...base, lessons, placements: {} };
}

function withRules(d: State, limits: Partial<Limits>, rules: Partial<Rules>): State {
  return {
    ...d,
    settings: {
      ...d.settings,
      limits: { ...d.settings.limits, ...limits },
      rules: { ...d.settings.rules, ...rules },
    },
  };
}

export const WORLDS: SolverWorld[] = [
  {
    name: 'tam-dolu',
    note: 'Kapasite = yük; her hücre dolmak zorunda.',
    state: tamDolu(),
    want: { solved: true },
  },
  {
    name: 'derslik-darbogazi',
    note: 'Üç sınıf tek odayı paylaşıyor, toplam yük odaya sığmıyor.',
    state: dersllikDarbogazi(),
    want: { solved: false, reasonLike: /sınıf|derslik|A/, backtracks: true },
  },
  {
    name: 'salt-blok',
    note: 'Hepsi blok; 5 saatlik günde 3’lük blok yalnız başa sığar.',
    state: saltBlok(),
    want: { solved: true },
  },
  {
    name: 'bolunmeyen-saat',
    note: '5 saat / 2’lik blok → 4 saat yerleşir, 1 saat havuzda kalır.',
    state: bolunmeyenSaat(),
    want: { solved: false },
  },
  {
    name: 'ogretmen-hafta-kapali',
    note: 'Bir öğretmenin bütün haftası kapalı; ötekinin dersleri yine dizilir.',
    state: ogretmenHaftaKapali(),
    want: { solved: false, reasonLike: /müsait değil/ },
  },
  {
    name: 'sinif-kapali-saatler',
    note: 'Sınıfın kendisi mozaik hâlinde kapalı.',
    state: sinifKapaliSaatler(),
    want: { solved: true },
  },
  {
    name: 'derslik-kapali',
    note: 'Derslik bir gün boyunca kapalı; iki sınıf da taşınmak zorunda.',
    state: derslikKapali(),
    want: { solved: true },
  },
  {
    name: 'kurallar-engelle',
    note: 'Art arda 1 · günde 3 · aynı ders 1, üçü de Engelle.',
    state: kurallar('block'),
    want: { solved: true },
  },
  {
    name: 'kurallar-uyar',
    note: 'Aynı sayılar Uyar seviyesinde: yerleştirmeyi durdurmamalı.',
    state: kurallar('warn'),
    want: { solved: true },
  },
  {
    name: 'tek-gun',
    note: 'Tek gün, 12 saat — bütün hafta tek sütun.',
    state: tekGun(),
    want: { solved: true },
  },
  {
    name: 'cok-gun-az-saat',
    note: '7 gün × 2 saat, hepsi 2’lik blok: her blok bir günü doldurur.',
    state: cokGunAzSaat(),
    want: { solved: true },
  },
  {
    name: 'elle-konmus',
    note: 'Elle konmuş üç blok, biri sonradan kapatılmış saatte (ilke 6).',
    state: elleKonmus(),
    want: { solved: true },
  },
  {
    name: 'delik-desik',
    note: 'Öğretmen, sınıf ve derslikte serpiştirilmiş kapalı saatler.',
    state: delikDesik(),
    want: { solved: true },
  },
  {
    name: 'bos-dunya',
    note: 'Hiç ders yok: solve() aynı nesneyi geri vermeli.',
    state: bosDunya(),
    want: { solved: true },
  },
  {
    name: 'tek-ogretmen-cok-sinif',
    note: 'Bir öğretmen altı sınıfa giriyor, yük = öğretmenin bütün kapasitesi.',
    state: tekOgretmenCokSinif(),
    want: { solved: true },
  },
  {
    name: 'erken-saat-tuzagi',
    note: 'Açgözlü sıra yanlış hücreyi seçiyor; çözüm var, arama geri sarmak zorunda.',
    state: erkenSaatTuzagi(3, 4, 6, 6),
    want: { solved: true, backtracks: true },
  },
  {
    name: 'derin-geri-sarma',
    note: 'Aynı tuzak dört günde: binlerce düğüm, ama yine tam çözüm.',
    state: erkenSaatTuzagi(4, 4, 8, 8),
    want: { solved: true, backtracks: true },
  },
  {
    name: 'kural-baskisi',
    note: 'Art arda en fazla 2, Engelle: kurala uymak boşluk bırakmayı gerektiriyor.',
    state: kuralBaskisi(),
    want: { solved: true, backtracks: true },
  },

  {
    name: 'imkansiz-ders-yaninda',
    note: 'Bir ders haftanın tutabileceğinden fazlasını istiyor; komşuları yine tam dizilmeli.',
    state: imkansizDersYaninda(),
    want: { solved: false, reasonLike: /en fazla 3 saat veriyor/ },
  },
  {
    name: 'blok-kurala-sigmiyor',
    note: '2 saatlik blok "aynı ders günde 1 saat" kuralına hiçbir hücrede sığmıyor.',
    state: blokKuralaSigmiyor(),
    want: { solved: false, reasonLike: /en fazla 1 saat/ },
  },

  {
    name: 'gercek-olcek-sikisik',
    note: 'Örnek okul, her sınıf odasının ayırabildiğinin %95’ine yüklenmiş.',
    heavy: true,
    state: realScale(0.95, 36),
    want: { solved: false },
  },
  {
    name: 'gercek-olcek-kurali',
    note: 'Örnek ölçek, art arda 2 · günde 5 · aynı ders 1, üçü de Engelle.',
    heavy: true,
    state: withRules(
      sampleState(),
      { maxConsecutive: 2, maxPerDay: 5, maxSameLessonPerDay: 1 },
      { maxConsecutive: 'block', maxPerDay: 'block', maxSameLessonPerDay: 'block' },
    ),
    want: { solved: false },
  },
  {
    name: 'parcalanmis-gunler',
    note: 'İki sınıf son kareye kadar dolu, her öğretmenin haftasında üç delik.',
    heavy: true,
    state: parcalanmisGunler(),
    want: { solved: false, backtracks: true },
  },
  {
    name: 'gercek-olcek-imkansiz',
    note: 'Odaların ayırabileceğinin çok üstünde yük: bütçe dolar, cümle okunur kalır.',
    heavy: true,
    state: realScale(1.6, 60),
    // The sentence a lesson gets when the week simply cannot hold it: the
    // ceiling, not "the class is busy" — there is nothing to move out of the way.
    want: { solved: false, reasonLike: /en fazla \d+ saat veriyor/ },
  },
];

/** The worlds the main suite runs: small enough to solve in milliseconds. */
export const SMALL_WORLDS = WORLDS.filter((w) => w.heavy !== true);

/** Real-scale worlds; `npm run cozucu` only. */
export const HEAVY_WORLDS = WORLDS.filter((w) => w.heavy === true);
