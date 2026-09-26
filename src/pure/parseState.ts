// Reading a saved file: every historical shape, into today's State.
//
// Split out of `store.ts`, where it sat next to the reducer, the browser
// storage and a React hook. It belongs to the pure layer and always did: it
// takes a string and returns a State, knows nothing about localStorage, a
// document or React, and is the one place a v1 file from the first week is
// turned into what the program runs on today.
//
// The accept list below names every schema version this build can open, and
// pitfall 97 is what it is for: `version === 8` was once left out of it and
// every backup v2.0.0 wrote became unreadable. `fixtures.test.ts` reads one
// real file per version and `storeContract.test.ts` asks the list as a set —
// both derive the versions from SCHEMA_VERSION rather than naming one.

import { MAX_BLOCK, clampBlocks } from '../leaf/blocks';
import { sanitize } from '../pure/constraints';
import { defaultSubjects, emptyState, makeDay, NO_TEACHER_LIMITS } from '../pure/entities';
import { firstFreeColor, PALETTE_SIZE } from '../leaf/palette';
import { blankProgram, DEFAULT_PROGRAM_ID } from '../pure/programs';
import type {
  ClassGroup,
  Day,
  Gender,
  Id,
  Lesson,
  ProgramVariant,
  Refusal,
  Relation,
  Relaxation,
  Room,
  RuleLevel,
  State,
  Teacher,
} from '../leaf/types';
import { SCHEMA_VERSION } from '../leaf/types';

/** v1 shape: Turkish field names. Kept only so old backups can still be opened. */
interface LegacyV1 {
  ayar?: { gunler?: unknown; saatler?: unknown };
  derslikler?: Array<{ id: string; ad: string }>;
  ogretmenler?: Array<{ id: string; ad: string; kisaltma: string; brans: string; renk: number }>;
  siniflar?: Array<{ id: string; ad: string; derslikId: string | null }>;
  dersler?: Array<{
    id: string;
    sinifId: string;
    ogretmenId: string;
    haftalikSaat: number;
    blok: number;
  }>;
  musaitDegil?: unknown;
  yerlesim?: unknown;
}

/** v2 shape: English names, but days were plain strings and there were no rules. */
interface LegacyV2 {
  settings?: { days?: unknown; hours?: unknown };
  rooms?: unknown;
  teachers?: unknown;
  classes?: unknown;
  lessons?: unknown;
  unavailable?: unknown;
  placements?: unknown;
}

const asArray = <T>(x: unknown, fallback: T[]): T[] => (Array.isArray(x) ? (x as T[]) : fallback);
const asMap = <T>(x: unknown): Record<string, T> =>
  typeof x === 'object' && x !== null ? (x as Record<string, T>) : {};
const asText = (x: unknown, fallback: string): string => (typeof x === 'string' ? x : fallback);
const asCount = (x: unknown, fallback: number): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.round(x) : fallback;
/** A limit box: a positive number, or null meaning "use the default". */
const asBox = (x: unknown): number | null =>
  typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.round(x) : null;

/**
 * v15: the answers to a suggestion. Each entry is checked field by field and
 * one that does not read is dropped alone, not the whole file: an answer is
 * a note for the next search, and losing one costs a question asked again.
 * Whether its teacher, lesson or day still exist is `sanitize`'s question.
 */
function readAnswers(x: unknown): { accepted: Relaxation[]; refused: Refusal[] } {
  const box = asMap<unknown>(x);
  const id = (v: unknown) => typeof v === 'string' && v !== '';
  const n = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 0;
  const list = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(n);
  const change = (v: unknown): v is Relaxation => {
    const c = asMap<unknown>(v);
    switch (c['kind']) {
      case 'teacherHour':
        return id(c['teacherId']) && n(c['day']) && n(c['hour']);
      case 'lessonDayLimit':
        return id(c['lessonId']) && n(c['limit']);
      case 'teacherDayLimit':
      case 'teacherConsecutive':
        return id(c['teacherId']) && n(c['limit']);
      case 'lessonTeacher':
        return id(c['lessonId']) && id(c['teacherId']);
      case 'blockShape':
        return id(c['lessonId']) && Array.isArray(c['blocks']) && c['blocks'].every(n);
      case 'weeklyHours':
        return (
          id(c['lessonId']) && n(c['hours']) && Array.isArray(c['blocks']) && c['blocks'].every(n)
        );
      default:
        return false;
    }
  };
  const refusal = (v: unknown): v is Refusal => {
    const r = asMap<unknown>(v);
    switch (r['kind']) {
      case 'teacherDay':
        return id(r['teacherId']) && n(r['day']);
      case 'teacherHours':
        return id(r['teacherId']) && n(r['day']) && list(r['hours']);
      case 'teacherCap':
        return id(r['teacherId']) && n(r['day']) && n(r['max']);
      case 'teacher':
      case 'teacherDayLimit':
      case 'teacherConsecutive':
        return id(r['teacherId']);
      case 'lessonTeacher':
        return id(r['lessonId']) && id(r['teacherId']);
      case 'lessonDayLimit':
      case 'blockShape':
      case 'weeklyHours':
        return id(r['lessonId']);
      default:
        return false;
    }
  };
  return {
    accepted: asArray<unknown>(box['accepted'], []).filter(change),
    refused: asArray<unknown>(box['refused'], []).filter(refusal),
  };
}

/**
 * v16: the relations between lessons. As with the answers, an entry that does
 * not read is dropped alone. Whether both lessons still exist, and whether a
 * pair is repeated, is `sanitize`'s question.
 */
function readRelations(x: unknown): Relation[] {
  const id = (v: unknown): v is string => typeof v === 'string' && v !== '';
  return asArray<unknown>(x, []).flatMap((v) => {
    const r = asMap<unknown>(v);
    const pair = r['lessonIds'];
    if (r['kind'] !== 'notSameDay' || !id(r['id']) || !Array.isArray(pair)) return [];
    const [a, b] = pair as unknown[];
    if (pair.length !== 2 || !id(a) || !id(b)) return [];
    return [{ id: r['id'], kind: 'notSameDay' as const, lessonIds: [a, b] as [Id, Id] }];
  });
}

function asLevel(x: unknown, fallback: RuleLevel): RuleLevel {
  return x === 'off' || x === 'warn' || x === 'block' ? x : fallback;
}

/** Anything that is not one of the two letters means "not stated". */
function asGender(x: unknown): Gender {
  return x === 'k' || x === 'e' ? x : '';
}

/** subjectShorts: string -> non-empty string, anything else dropped. */
function asShorts(x: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(asMap<unknown>(x))) {
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

/** A stored list of names: strings only, trimmed, no blanks, no duplicates. */
function asNames(x: unknown, fallback: string[]): string[] {
  if (!Array.isArray(x)) return fallback;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of x) {
    if (typeof value !== 'string') continue;
    const name = value.trim();
    const key = name.toLocaleLowerCase('tr');
    if (name === '' || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.length > 0 ? out : fallback;
}

/**
 * Gives everyone in a list a colour nobody else has.
 *
 * Needed on EVERY load, not only on migration: a v4 file was written when the
 * palette had 12 entries, so with more than twelve teachers colours repeat, and
 * a repeated colour is exactly what makes a pool card stop pointing at one row.
 * A file whose colours are already distinct comes back untouched, so opening a
 * backup twice cannot shuffle it.
 */
function spreadColors<T extends { color?: unknown }>(list: T[]): T[] {
  const taken = new Set<number>();
  let changed = false;

  const out = list.map((item) => {
    const raw = item.color;
    const current =
      typeof raw === 'number' && Number.isFinite(raw)
        ? Math.abs(Math.round(raw)) % PALETTE_SIZE
        : -1;
    if (current >= 0 && !taken.has(current)) {
      taken.add(current);
      return current === raw ? item : { ...item, color: current };
    }
    const fresh = firstFreeColor(taken);
    taken.add(fresh);
    changed = true;
    return { ...item, color: fresh };
  });

  return changed || out.some((x, i) => x !== list[i]) ? out : list;
}

/**
 * Migrates a v1 backup (Turkish field names) to the v2 shape.
 *
 * The ids never changed, so `musaitDegil` / `yerlesim` keys carry over as they
 * are. Without this every backup downloaded before the rename would be
 * unopenable — and my father has no other copy.
 */
function migrateV1(raw: LegacyV1): LegacyV2 {
  return {
    settings: { days: raw.ayar?.gunler, hours: raw.ayar?.saatler },
    rooms: asArray<NonNullable<LegacyV1['derslikler']>[number]>(raw.derslikler, []).map((x) => ({
      id: x.id,
      name: x.ad,
    })),
    teachers: asArray<NonNullable<LegacyV1['ogretmenler']>[number]>(raw.ogretmenler, []).map(
      (x) => ({ id: x.id, name: x.ad, short: x.kisaltma, subject: x.brans, color: x.renk }),
    ),
    classes: asArray<NonNullable<LegacyV1['siniflar']>[number]>(raw.siniflar, []).map((x) => ({
      id: x.id,
      name: x.ad,
      roomId: x.derslikId ?? null,
    })),
    lessons: asArray<NonNullable<LegacyV1['dersler']>[number]>(raw.dersler, []).map((x) => ({
      id: x.id,
      classId: x.sinifId,
      teacherId: x.ogretmenId,
      weeklyHours: x.haftalikSaat,
      blockSize: x.blok,
    })),
    unavailable: raw.musaitDegil,
    placements: raw.yerlesim,
  };
}

/**
 * v2 -> v3: days become objects, bell times / limits / rules appear.
 *
 * `unavailable` and `placements` are carried over UNTOUCHED: ids did not
 * change and neither did the day indexes, so a timetable that was already laid
 * out survives exactly as it was.
 */
function migrateV2toV3(raw: LegacyV2): State {
  const blank = emptyState();
  const names = asArray<unknown>(raw.settings?.days, []).filter(
    (x): x is string => typeof x === 'string',
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      ...blank.settings,
      // Written out because `blank` is `emptyState()`, whose subject list is
      // now EMPTY by design. A v1/v2 file predates `settings.subjects`
      // entirely, so inheriting that emptiness would turn every subject its
      // teachers carry into a "listede değil" stray — silently, on open.
      subjects: defaultSubjects(),
      // A v2 file has no bell times at all; the school day drafted for v3 is
      // the most reasonable guess and it is visible on the Kurulum screen.
      days: names.length > 0 ? names.map(makeDay) : blank.settings.days,
      hours: asArray<unknown>(raw.settings?.hours, blank.settings.hours).filter(
        (x): x is string => typeof x === 'string',
      ),
    },
    rooms: asArray<Room>(raw.rooms, []),
    teachers: asArray<Omit<Teacher, 'limits' | 'gender' | 'subject2'>>(raw.teachers, []).map(
      (x) => ({
        ...x,
        // Neither of these can be in a v1/v2 file, and neither is guessed: a
        // gender is not read off a name, and a second subject nobody wrote down
        // is a subject nobody teaches.
        gender: '',
        subject2: '',
        limits: { ...NO_TEACHER_LIMITS },
      }),
    ),
    // The same two readers the v3+ path runs over this list. A bare `asArray`
    // here once left the class box `undefined` and every class uncoloured
    // (TODO §8g).
    classes: spreadColors(
      asArray<ClassGroup>(raw.classes, []).map((c) => ({
        ...c,
        maxSameLessonPerDay: asBox(c.maxSameLessonPerDay),
      })),
    ),
    lessons: readLessons(asArray<unknown>(raw.lessons, []), 2),
    unavailable: asMap<1>(raw.unavailable),
    programs: [
      {
        ...blankProgram(),
        placements: asMap<string>(raw.placements),
      },
    ],
    activeProgramId: DEFAULT_PROGRAM_ID,
    answers: { accepted: [], refused: [] },
    relations: [],
  };
}

/**
 * The lessons out of a file of ANY version.
 *
 * The shape of a week has been written three ways. v1..v6 stored `blockSize`
 * ("every block is this long"), v7 replaced it with `pairs` ("this many of the
 * hours are doubles"), and v9 replaces that with `blocks` (the list itself).
 * Each older form is read as the list it was always describing:
 *
 *   v13     blocks, clamped to 3
 *   v9..v12 blocks, every 4 read as 3 with the remaining hour implicit
 *   v7 v8   `pairs` doubles, then singles
 *   v1..v6  floor(hours / blockSize) blocks that long, then singles
 *
 * THE THREE-HOUR BLOCK COMES BACK. v7's migration had to fold `blockSize: 3`
 * into doubles because 3 had stopped being expressible; it is expressible
 * again, so an old file gets to mean what it said. This is safe for exactly the
 * reason the fold was safe: the timetable itself never moved. A 3-hour run on
 * the grid is three hours of the same lesson in the same class either way,
 * every placement key is untouched, and no clash rule looks at a boundary (see
 * the contract in constraints.ts). Only the READING of that run changes — and
 * it now matches the drawing the file's author had in front of them.
 *
 * Nothing validated the old fields on the way in, so the list is clamped here
 * as well as in `sanitize()`: a hand-edited file can say anything.
 */
function readLessons(raw: unknown[], version: number): Lesson[] {
  return raw.map((item) => {
    const x = item as Partial<Lesson> & { blockSize?: unknown; pairs?: unknown };
    const weeklyHours = asCount(x.weeklyHours, 1);

    let blocks: number[];
    if (version >= 9) {
      const stored = asArray<unknown>(x.blocks, []).map((b) => asCount(b, 0));
      // v9..v12 allowed fours. Keeping the three and letting the weekly total
      // imply the remaining single changes only the boundary, never a placed
      // cell or pin: 4 -> 3+1.
      blocks = clampBlocks(
        weeklyHours,
        version < 13 ? stored.map((b) => (b === 4 ? 3 : b)) : stored,
      );
    } else if (version >= 7) {
      const pairs = Math.min(Math.floor(weeklyHours / 2), asCount(x.pairs, 0));
      blocks = Array<number>(Math.max(0, pairs)).fill(2);
    } else {
      const oldSize = Math.min(asCount(x.blockSize, 1), 4);
      const size = Math.min(oldSize, MAX_BLOCK);
      blocks = size >= 2 ? Array<number>(Math.floor(weeklyHours / oldSize)).fill(size) : [];
    }

    return {
      id: x.id ?? '',
      classId: x.classId ?? '',
      teacherId: x.teacherId ?? '',
      weeklyHours,
      blocks: clampBlocks(weeklyHours, blocks),
      // A file below v8 cannot carry this and it is not guessed: every lesson
      // in it was taught under the teacher's only subject.
      second: x.second === true,
      maxPerDay: asBox(x.maxPerDay),
    };
  });
}

function readDays(x: unknown, fallback: Day[]): Day[] {
  const list = asArray<unknown>(x, []).flatMap((item): Day[] => {
    if (typeof item === 'string') return [makeDay(item)];
    if (typeof item !== 'object' || item === null) return [];
    const day = item as Partial<Day>;
    if (typeof day.name !== 'string') return [];
    return [{ name: day.name, longBreakAfter: asCount(day.longBreakAfter, 0) }];
  });
  return list.length > 0 ? list : fallback;
}

/**
 * Turns outside text into a State. Tolerates broken/missing fields; returns
 * null if it cannot be converted. ALWAYS ends with sanitize().
 */
export function parseState(text: string): State | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;

  const version =
    (raw as { schemaVersion?: unknown; semaSurumu?: unknown }).schemaVersion ??
    (raw as { semaSurumu?: unknown }).semaSurumu;

  const blank = emptyState();
  let candidate: State;

  if (version === 1) {
    candidate = migrateV2toV3(migrateV1(raw));
  } else if (version === 2) {
    candidate = migrateV2toV3(raw);
  } else if (
    version === 3 ||
    version === 4 ||
    version === 5 ||
    version === 6 ||
    version === 7 ||
    version === 8 ||
    version === 9 ||
    version === 10 ||
    version === 11 ||
    version === 12 ||
    version === 13 ||
    version === 14 ||
    version === 15 ||
    version === SCHEMA_VERSION
  ) {
    // v3..v11 go through ONE reader: most of them only ADD fields — a v3 file
    // arrives with no subject overrides, a v4 with no class colours and no
    // subject list, a v5 with no gender, a v7 with no second subject, a v10
    // with no daily limit on the class — and v7 is the only one that CHANGES
    // one, which `readLessons` below handles on its own. Ids, day indexes and therefore `unavailable` / `placements`
    // carry over untouched in every case.
    //
    // Every version below the current one is spelled out ON PURPOSE. Bumping
    // SCHEMA_VERSION without adding the number it used to be makes every backup
    // the previous release wrote fall through to `return null` below — which is
    // the one failure this whole function exists to prevent.
    //
    // IT HAPPENED. v9 shipped with `8` missing from this list, so every file the
    // RELEASED v2.0.0 wrote — the copy the reader actually has — parsed to null.
    // Nothing on screen could say why: `null` here is "unreadable file". The
    // comment above was already here and was not enough, because a sentence
    // cannot fail a test run. `store.test.ts` now reads one file per version.
    const g = raw as Partial<State> & {
      placements?: unknown;
      pinned?: unknown;
      programs?: unknown;
      activeProgramId?: unknown;
    };
    const limits = g.settings?.limits;
    const rules = g.settings?.rules;
    candidate = {
      schemaVersion: SCHEMA_VERSION,
      settings: {
        schoolName: asText(g.settings?.schoolName, ''),
        days: readDays(g.settings?.days, blank.settings.days),
        hours: asArray<string>(g.settings?.hours, blank.settings.hours),
        bell: {
          start: asText(g.settings?.bell?.start, blank.settings.bell.start),
          lessonMinutes: asCount(
            g.settings?.bell?.lessonMinutes,
            blank.settings.bell.lessonMinutes,
          ),
          breakMinutes: asCount(g.settings?.bell?.breakMinutes, blank.settings.bell.breakMinutes),
          longBreakMinutes: asCount(
            g.settings?.bell?.longBreakMinutes,
            blank.settings.bell.longBreakMinutes,
          ),
        },
        limits: {
          maxConsecutive: asCount(limits?.maxConsecutive, 0),
          maxPerDay: asCount(limits?.maxPerDay, 0),
          minPerDay: asCount(limits?.minPerDay, 0),
          maxSameLessonPerDay: asCount(limits?.maxSameLessonPerDay, 0),
          // v14. A pre-v14 file has neither field; 0 is the right fallback
          // for BOTH — it is what DEFAULT_LIMITS ships and, unlike the four
          // rules above, it is also a real number here rather than "no limit".
          maxGapsTeacher: asCount(limits?.maxGapsTeacher, 0),
          maxGapsClass: asCount(limits?.maxGapsClass, 0),
        },
        rules: {
          maxConsecutive: asLevel(rules?.maxConsecutive, blank.settings.rules.maxConsecutive),
          maxPerDay: asLevel(rules?.maxPerDay, blank.settings.rules.maxPerDay),
          minPerDay: asLevel(rules?.minPerDay, blank.settings.rules.minPerDay),
          maxSameLessonPerDay: asLevel(
            rules?.maxSameLessonPerDay,
            blank.settings.rules.maxSameLessonPerDay,
          ),
          // v14. A pre-v14 file predates the rule entirely, so it falls back
          // to 'off' — DEFAULT_RULES's own choice, not a guess made here.
          maxGapsTeacher: asLevel(rules?.maxGapsTeacher, blank.settings.rules.maxGapsTeacher),
          maxGapsClass: asLevel(rules?.maxGapsClass, blank.settings.rules.maxGapsClass),
        },
        subjects: asNames(g.settings?.subjects, defaultSubjects()),
        subjectShorts: asShorts(g.settings?.subjectShorts),
      },
      rooms: asArray(g.rooms, blank.rooms),
      teachers: spreadColors(
        asArray<Teacher>(g.teachers, blank.teachers).map((t) => ({
          ...t,
          gender: asGender(t.gender),
          subject2: asText(t.subject2, ''),
          limits: {
            maxConsecutive: asBox(t.limits?.maxConsecutive),
            maxPerDay: asBox(t.limits?.maxPerDay),
            minPerDay: asBox(t.limits?.minPerDay),
          },
        })),
      ),
      // A v10 file and below arrives with no daily limit on the class, and
      // `null` is exactly what that means: use the school's number. `asBox` is
      // the same reader the three teacher boxes go through.
      classes: spreadColors(
        asArray<ClassGroup>(g.classes, blank.classes).map((c) => ({
          ...c,
          maxSameLessonPerDay: asBox(c.maxSameLessonPerDay),
        })),
      ),
      lessons: readLessons(asArray<unknown>(g.lessons, blank.lessons), Number(version)),
      unavailable: asMap<1>(g.unavailable),
      programs:
        Number(version) >= 12
          ? asArray<Partial<ProgramVariant>>(g.programs, []).map((program) => ({
              id: asText(program.id, ''),
              name: asText(program.name, ''),
              placements: asMap<Id>(program.placements),
              pinned: asMap<1>(program.pinned),
            }))
          : [
              {
                ...blankProgram(),
                placements: asMap<Id>(g.placements),
                // v9 and below arrive with none, which is the right answer.
                pinned: asMap<1>(g.pinned),
              },
            ],
      activeProgramId: Number(version) >= 12 ? asText(g.activeProgramId, '') : DEFAULT_PROGRAM_ID,
      // v15. Every file below it predates the answers, and none is right.
      answers: readAnswers((raw as { answers?: unknown }).answers),
      relations: readRelations((raw as { relations?: unknown }).relations),
    };
  } else {
    return null; // an unknown (newer) version is not guessed at
  }

  const hours = candidate.settings.hours.filter((x) => typeof x === 'string');

  return sanitize({
    ...candidate,
    settings: {
      ...candidate.settings,
      days: candidate.settings.days.length > 0 ? candidate.settings.days : blank.settings.days,
      hours: hours.length > 0 ? hours : blank.settings.hours,
    },
  });
}
