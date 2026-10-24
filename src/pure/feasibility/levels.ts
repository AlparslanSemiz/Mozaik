// The capacity ladder (ok, tight, impossible) and the shapes of a report.

import type { Id } from '../../leaf/model';
import type { Violation } from '../constraints';
import type { Advice } from './advice';

/** Above this ratio of load the "this will be hard" warning is raised. */
const TIGHT_RATIO = 0.85;

export type Level = 'ok' | 'tight' | 'impossible';
export type LoadStatus = 'empty' | Level;

/** The same capacity ladder used by Kontrol, exposed for list filtering. */
export function capacityLevel(capacity: number, load: number): Level {
  if (load > capacity) return 'impossible';
  if (capacity > 0 && load > capacity * TIGHT_RATIO) return 'tight';
  return 'ok';
}

/** Zero load is useful to filter separately even though it is feasible. */
export function loadStatus(capacity: number, load: number): LoadStatus {
  return load === 0 ? 'empty' : capacityLevel(capacity, load);
}

export interface ReportRow {
  id: Id;
  name: string;
  capacity: number; // usable hours
  load: number; // loaded lesson hours
  level: Level;
  message: string;
}

export interface Unplaceable {
  lessonId: Id;
  name: string;
  missing: number;
  message: string;
}

/**
 * The cheap half of the report: capacity against load, O(lessons).
 *
 * Split out from `buildReport` because the setup screens show it beside the
 * list you are typing into, and `buildReport`'s other half costs 99 x 72
 * `blocker()` calls — a price no keystroke can pay (pitfall 3).
 */
export interface Capacity {
  teachers: ReportRow[];
  classes: ReportRow[];
  rooms: ReportRow[];
}

export interface Report extends Capacity {
  unplaceable: Unplaceable[];
  /** Limit rules broken by the timetable as it stands (rules.ts). */
  violations: Violation[];
  /** aSc's "Advisor" — data that will not BLOCK a build but is worth a look. */
  advice: Advice[];
  /** Lessons sitting on an hour that was closed after they were placed (pitfall 16). */
  stranded: number;
  /**
   * Something blocks the build: a lesson with no place, a broken rule at
   * Engelle, an İmkânsız row, or a lesson on a closed hour. The last one was
   * left out, and the verdict said "Sorun görünmüyor … Program dizilebilir."
   * beside a red chip (DENETIM DK7).
   */
  hasProblem: boolean;
  /**
   * A row is Sıkışık, and nothing blocks. Not a problem: the father's classes
   * are all exactly full, and "dikkat edilmesi gereken noktalar" over a whole
   * week pointed at İmkânsız rows that were not there (2026-09-26).
   */
  tight: boolean;
}
