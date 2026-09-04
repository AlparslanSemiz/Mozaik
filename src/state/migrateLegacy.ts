// The two shapes no release writes any more: v1 (Turkish field names) and v2
// (English names, days as plain strings, no rules).
//
// Kept for one reason only — my father's older backups are these, and a backup
// that cannot be opened is data that is gone. Both paths end at the v3 shape,
// which is where parseState.ts's single reader takes over.

import { asArray, asMap } from './coerce';
import { defaultSubjects, emptyState, makeDay, NO_TEACHER_LIMITS } from '../entities';
import { blankProgram } from './programs';
import { readLessons } from './stateFields';
import type { ClassGroup, Gender, Room, State, Teacher } from '../types';
import { SCHEMA_VERSION } from '../types';

/** v1 shape: Turkish field names. Kept only so old backups can still be opened. */
export interface LegacyV1 {
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
export interface LegacyV2 {
  settings?: { days?: unknown; hours?: unknown };
  rooms?: unknown;
  teachers?: unknown;
  classes?: unknown;
  lessons?: unknown;
  unavailable?: unknown;
  placements?: unknown;
}

/**
 * Migrates a v1 backup (Turkish field names) to the v2 shape.
 *
 * The ids never changed, so `musaitDegil` / `yerlesim` keys carry over as they
 * are. Without this every backup downloaded before the rename would be
 * unopenable — and my father has no other copy.
 */
export function migrateV1(raw: LegacyV1): LegacyV2 {
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
    })) as LegacyV2['lessons'],
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
export function migrateV2toV3(raw: LegacyV2): State {
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
      // the most reasonable guess and it is visible on the Okul screen.
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
        gender: '' as Gender,
        subject2: '',
        limits: { ...NO_TEACHER_LIMITS },
      }),
    ),
    classes: asArray<ClassGroup>(raw.classes, []),
    lessons: readLessons(asArray<unknown>(raw.lessons, []), 2),
    unavailable: asMap<1>(raw.unavailable),
    programs: [{
      ...blankProgram(),
      placements: asMap<string>(raw.placements),
    }],
    activeProgramId: 'program-1',
  };
}
