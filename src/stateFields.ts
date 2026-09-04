// The fields whose SHAPE changed between schema versions, one reader each.
//
// This sits below both parseState.ts and migrateLegacy.ts because both read the
// same fields: a v1 file's lessons go through `readLessons` exactly like a
// current one's. Putting them here instead of in either caller is the keys.ts
// pattern — the rule two modules share lives underneath both of them, so
// neither has to import the other.

import { clampBlocks, MAX_BLOCK } from './schedule/blocks';
import { asArray, asBox, asCount } from './coerce';
import { makeDay } from './entities';
import { firstFreeColor, PALETTE_SIZE } from './palette';
import type { Day, Lesson } from './types';

/**
 * Gives everyone in a list a colour nobody else has.
 *
 * Needed on EVERY load, not only on migration: a v4 file was written when the
 * palette had 12 entries, so with more than twelve teachers colours repeat, and
 * a repeated colour is exactly what makes a pool card stop pointing at one row.
 * A file whose colours are already distinct comes back untouched, so opening a
 * backup twice cannot shuffle it.
 */
export function spreadColors<T extends { color?: unknown }>(list: T[]): T[] {
  const taken = new Set<number>();
  let changed = false;

  const out = list.map((item) => {
    const current = paletteIndex(item.color);
    if (current >= 0 && !taken.has(current)) {
      taken.add(current);
      return current === item.color ? item : { ...item, color: current };
    }
    const fresh = firstFreeColor(taken);
    taken.add(fresh);
    changed = true;
    return { ...item, color: fresh };
  });

  return changed || out.some((x, i) => x !== list[i]) ? out : list;
}

/** A stored colour as an index into the palette, or -1 if it is not one. */
function paletteIndex(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return -1;
  return Math.abs(Math.round(raw)) % PALETTE_SIZE;
}

/** v9+ wrote the list itself. v9..v12 allowed fours; 4 is read as 3 + an
    implicit single, which moves the boundary and never a placed cell or pin. */
function blocksFromList(raw: unknown, weeklyHours: number, version: number): number[] {
  const stored = asArray<unknown>(raw, []).map((b) => asCount(b, 0));
  return clampBlocks(
    weeklyHours,
    version < 13 ? stored.map((b) => (b === 4 ? 3 : b)) : stored,
  );
}

/** v7 and v8 could only say "N of the hours are doubles". */
function blocksFromPairs(raw: unknown, weeklyHours: number): number[] {
  const pairs = Math.min(Math.floor(weeklyHours / 2), asCount(raw, 0));
  return Array<number>(Math.max(0, pairs)).fill(2);
}

/** v1..v6 said "every block is this long". */
function blocksFromSize(raw: unknown, weeklyHours: number): number[] {
  const stored = Math.min(asCount(raw, 1), 4);
  const size = Math.min(stored, MAX_BLOCK);
  return size >= 2 ? Array<number>(Math.floor(weeklyHours / stored)).fill(size) : [];
}

/**
 * The lessons out of a file of ANY version.
 *
 * The shape of a week has been written three ways. v1..v6 stored `blockSize`
 * ("every block is this long"), v7 replaced it with `pairs` ("this many of the
 * hours are doubles"), and v9 replaces that with `blocks` (the list itself).
 * Each older form is read as the list it was always describing.
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
export function readLessons(raw: unknown[], version: number): Lesson[] {
  return raw.map((item) => {
    const x = item as Partial<Lesson> & { blockSize?: unknown; pairs?: unknown };
    const weeklyHours = asCount(x.weeklyHours, 1);

    const blocks =
      version >= 9
        ? blocksFromList(x.blocks, weeklyHours, version)
        : version >= 7
          ? blocksFromPairs(x.pairs, weeklyHours)
          : blocksFromSize(x.blockSize, weeklyHours);

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

/** v2 and below wrote day NAMES; v3 and up write objects. Both are read here. */
export function readDays(x: unknown, fallback: Day[]): Day[] {
  const list = asArray<unknown>(x, []).flatMap((item): Day[] => {
    if (typeof item === 'string') return [makeDay(item)];
    if (typeof item !== 'object' || item === null) return [];
    const day = item as Partial<Day>;
    if (typeof day.name !== 'string') return [];
    return [{ name: day.name, longBreakAfter: asCount(day.longBreakAfter, 0) }];
  });
  return list.length > 0 ? list : fallback;
}
