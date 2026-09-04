// The door EVERY backup file and every localStorage read comes through.
//
// If it breaks, data is lost silently, so the shape of this module is a safety
// argument: `parseState` only picks a version path and finishes; each section
// of a file has its own small reader below, and everything they lean on
// (coerce.ts, stateFields.ts, migrateLegacy.ts) is testable on its own.

import { sanitize } from './constraints';
import {
  asArray,
  asBox,
  asCount,
  asGender,
  asLevel,
  asMap,
  asNames,
  asShorts,
  asText,
} from './coerce';
import { defaultSubjects, emptyState } from './entities';
import { type LegacyV1, type LegacyV2, migrateV1, migrateV2toV3 } from './migrateLegacy';
import { blankProgram } from './programs';
import { readDays, readLessons, spreadColors } from './stateFields';
import type {
  ClassGroup,
  Id,
  Limits,
  ProgramVariant,
  Room,
  Rules,
  Settings,
  State,
  Teacher,
} from './types';
import { SCHEMA_VERSION } from './types';

/** A v3-or-newer file, before anything in it has been believed. */
type StoredState = Partial<State> & {
  placements?: unknown;
  pinned?: unknown;
  programs?: unknown;
  activeProgramId?: unknown;
};

/**
 * Every version this reader accepts, spelled out ON PURPOSE.
 *
 * Bumping SCHEMA_VERSION without adding the number it used to be makes every
 * backup the previous release wrote fall through to `null` — which is the one
 * failure this whole module exists to prevent.
 *
 * IT HAPPENED. v9 shipped with `8` missing from this list, so every file the
 * RELEASED v2.0.0 wrote — the copy the reader actually has — parsed to null.
 * Nothing on screen could say why: `null` here is "unreadable file". A comment
 * saying this was already in place and was not enough, because a sentence
 * cannot fail a test run. parseState.test.ts now reads one file per version,
 * and one of those tests names no number at all (pitfall 97).
 */
const READABLE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, SCHEMA_VERSION];

/**
 * Turns outside text into a State. Tolerates broken/missing fields; returns
 * null if it cannot be converted. ALWAYS ends with sanitize().
 */
export function parseState(text: string): State | null {
  const raw = parseJson(text);
  if (raw === null) return null;

  const candidate = readVersion(raw);
  if (candidate === null) return null;

  return sanitize(withWeek(candidate));
}

function parseJson(text: string): Record<string, unknown> | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  return raw as Record<string, unknown>;
}

/** Which reader a file gets, by the version it stamped itself with. */
function readVersion(raw: Record<string, unknown>): State | null {
  const version = raw['schemaVersion'] ?? raw['semaSurumu'];

  if (version === 1) return migrateV2toV3(migrateV1(raw as LegacyV1));
  if (version === 2) return migrateV2toV3(raw as LegacyV2);
  if (READABLE.includes(version as number)) return readCurrent(raw as StoredState, Number(version));
  return null; // an unknown (newer) version is not guessed at
}

/**
 * v3..v14 go through ONE reader: most of them only ADD fields — a v3 file
 * arrives with no subject overrides, a v4 with no class colours and no subject
 * list, a v5 with no gender, a v7 with no second subject, a v10 with no daily
 * limit on the class, a v13 with no gap rules — and v7 is the only one that
 * CHANGES one, which `readLessons` handles on its own. Ids, day indexes and
 * therefore `unavailable` / placements carry over untouched in every case.
 */
function readCurrent(g: StoredState, version: number): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: readSettings(g.settings),
    rooms: asArray<Room>(g.rooms, []),
    teachers: readTeachers(g.teachers),
    classes: readClasses(g.classes),
    lessons: readLessons(asArray<unknown>(g.lessons, []), version),
    unavailable: asMap<1>(g.unavailable),
    programs: readPrograms(g, version),
    activeProgramId: version >= 12 ? asText(g.activeProgramId, '') : 'program-1',
  };
}

function readSettings(raw: Partial<Settings> | undefined): Settings {
  const blank = emptyState().settings;
  return {
    schoolName: asText(raw?.schoolName, ''),
    days: readDays(raw?.days, blank.days),
    hours: asArray<string>(raw?.hours, blank.hours),
    bell: {
      start: asText(raw?.bell?.start, blank.bell.start),
      lessonMinutes: asCount(raw?.bell?.lessonMinutes, blank.bell.lessonMinutes),
      breakMinutes: asCount(raw?.bell?.breakMinutes, blank.bell.breakMinutes),
      longBreakMinutes: asCount(raw?.bell?.longBreakMinutes, blank.bell.longBreakMinutes),
    },
    limits: readLimits(raw?.limits),
    rules: readRules(raw?.rules, blank.rules),
    subjects: asNames(raw?.subjects, defaultSubjects()),
    subjectShorts: asShorts(raw?.subjectShorts),
  };
}

function readLimits(raw: Partial<Limits> | undefined): Limits {
  return {
    maxConsecutive: asCount(raw?.maxConsecutive, 0),
    maxPerDay: asCount(raw?.maxPerDay, 0),
    minPerDay: asCount(raw?.minPerDay, 0),
    maxSameLessonPerDay: asCount(raw?.maxSameLessonPerDay, 0),
    // v14. A pre-v14 file has neither field; 0 is the right fallback for BOTH —
    // it is what DEFAULT_LIMITS ships and, unlike the four rules above, it is
    // also a real number here rather than "no limit".
    maxGapsTeacher: asCount(raw?.maxGapsTeacher, 0),
    maxGapsClass: asCount(raw?.maxGapsClass, 0),
  };
}

function readRules(raw: Partial<Rules> | undefined, blank: Rules): Rules {
  return {
    maxConsecutive: asLevel(raw?.maxConsecutive, blank.maxConsecutive),
    maxPerDay: asLevel(raw?.maxPerDay, blank.maxPerDay),
    minPerDay: asLevel(raw?.minPerDay, blank.minPerDay),
    maxSameLessonPerDay: asLevel(raw?.maxSameLessonPerDay, blank.maxSameLessonPerDay),
    // v14. A pre-v14 file predates the rule entirely, so it falls back to
    // 'off' — DEFAULT_RULES's own choice, not a guess made here.
    maxGapsTeacher: asLevel(raw?.maxGapsTeacher, blank.maxGapsTeacher),
    maxGapsClass: asLevel(raw?.maxGapsClass, blank.maxGapsClass),
  };
}

function readTeachers(raw: unknown): Teacher[] {
  return spreadColors(
    asArray<Teacher>(raw, []).map((t) => ({
      ...t,
      gender: asGender(t.gender),
      subject2: asText(t.subject2, ''),
      limits: {
        maxConsecutive: asBox(t.limits?.maxConsecutive),
        maxPerDay: asBox(t.limits?.maxPerDay),
        minPerDay: asBox(t.limits?.minPerDay),
      },
    })),
  );
}

/**
 * A v10 file and below arrives with no daily limit on the class, and `null` is
 * exactly what that means: use the school's number. `asBox` is the same reader
 * the three teacher boxes go through.
 */
function readClasses(raw: unknown): ClassGroup[] {
  return spreadColors(
    asArray<ClassGroup>(raw, []).map((c) => ({
      ...c,
      maxSameLessonPerDay: asBox(c.maxSameLessonPerDay),
    })),
  );
}

/** v11 and below held ONE grid beside the school; v12 moved it into named
    alternatives. An older file becomes the first alternative, unchanged. */
function readPrograms(g: StoredState, version: number): ProgramVariant[] {
  if (version >= 12) {
    return asArray<Partial<ProgramVariant>>(g.programs, []).map((program) => ({
      id: asText(program.id, ''),
      name: asText(program.name, ''),
      placements: asMap<Id>(program.placements),
      pinned: asMap<1>(program.pinned),
    }));
  }
  return [{
    ...blankProgram(),
    placements: asMap<Id>(g.placements),
    // v9 and below arrive with none, which is the right answer.
    pinned: asMap<1>(g.pinned),
  }];
}

/** A week with no days or no hours is not a timetable anyone can open. */
function withWeek(candidate: State): State {
  const blank = emptyState();
  const hours = candidate.settings.hours.filter((x) => typeof x === 'string');
  return {
    ...candidate,
    settings: {
      ...candidate.settings,
      days: candidate.settings.days.length > 0 ? candidate.settings.days : blank.settings.days,
      hours: hours.length > 0 ? hours : blank.settings.hours,
    },
  };
}
