// Reading blocks off the grid: which placed hours form one block, how long it
// is, and what a lesson still owes the tray.

import { type Lesson, type State, blockPlan, clampBlocks, placementKey } from '../../leaf/model';
import { activePlacements } from '../grid';

// -------------------------------------------------- reading blocks off the grid
//
// THE CONTRACT. `placements` holds one lessonId per hour and NO block boundary
// — a block has never been an entity here. With one block length per lesson
// that was enough: a run of the same id split into equal chunks and the answer
// was unique. With 2+1 it is not. Three adjacent cells of one lesson can be
// read as [2,1] or as [1,2], and nothing on the grid can tell them apart.
//
// The way out is not a bigger schema, it is a rule — written once, obeyed
// everywhere:
//
//   A lesson's placed blocks are read in day/hour order. Inside each run the
//   BIGGEST block the lesson still owes is taken first, as long as it fits what
//   is left of the run; whatever no named block fits is a single.
//
// That is the same order `blockPlan` writes the split in, so a lesson placed
// straight out of the pool reads back exactly as it went down.
// Which reading is chosen cannot make a timetable wrong: every clash rule looks
// at hours and at runs, never at where a boundary was drawn, so all readings of
// the same cells are equally legal. What it decides is what a right-click takes
// away and which cards the pool still owes — and those have to be ONE answer,
// or the tray and the grid start disagreeing about the same lesson.

export interface PlacedBlock {
  day: number;
  hour: number;
  size: number;
}

/** Every placed block of one lesson, in day/hour order. See the contract above. */
export function placedBlocks(d: State, lesson: Lesson): PlacedBlock[] {
  const out: PlacedBlock[] = [];
  // What the lesson still owes, longest first — the countdown the contract
  // above spends. A plain counter worked while 2 was the only length worth
  // naming; with 2, 3 and 4 the run has to be offered each of them in turn.
  const left = clampBlocks(lesson.weeklyHours, lesson.blocks);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  for (let g = 0; g < dayCount; g++) {
    let h = 0;
    while (h < hourCount) {
      if (activePlacements(d)[placementKey(lesson.classId, g, h)] !== lesson.id) {
        h++;
        continue;
      }
      let end = h;
      while (
        end < hourCount &&
        activePlacements(d)[placementKey(lesson.classId, g, end)] === lesson.id
      ) {
        end++;
      }
      for (let cur = h; cur < end;) {
        const room = end - cur;
        const at = left.findIndex((b) => b <= room);
        const size = at === -1 ? 1 : left[at]!;
        if (at !== -1) left.splice(at, 1);
        out.push({ day: g, hour: cur, size });
        cur += size;
      }
      h = end;
    }
  }
  return out;
}

/**
 * How many hours the block starting at each placed cell stands for.
 *
 * ONE map, keyed the way `placements` is, so every drawing of the week reads
 * the same boundaries: the grid, the two printed tables and the auditor. A cell
 * that is not the head of a block is absent — its hours belong to the head to
 * its left. Anything that recomputes this on its own drifts (pitfall 75).
 */
export function blockSpans(d: State): Map<string, number> {
  const spans = new Map<string, number>();
  for (const lesson of d.lessons) {
    for (const b of placedBlocks(d, lesson)) {
      spans.set(placementKey(lesson.classId, b.day, b.hour), b.size);
    }
  }
  return spans;
}

/**
 * The blocks a lesson still owes, biggest first.
 *
 * A multiset difference and not an hour count, because hours cannot answer it:
 * a 2+2+1+1 lesson with two hours down could have placed one two or two ones,
 * and the two cases owe different cards. The reading above is what makes the
 * question decidable at all.
 */
export function pendingBlocks(d: State, lesson: Lesson): number[] {
  const owed = blockPlan(lesson);
  for (const done of placedBlocks(d, lesson)) {
    const at = owed.indexOf(done.size);
    // Not found: the grid holds a shape the plan does not (an old backup, or
    // hours edited under a placed lesson). Take the biggest thing left rather
    // than pretend nothing was placed.
    owed.splice(at === -1 ? 0 : at, 1);
  }
  return owed;
}

/** The size a caller means when it does not say. See `blockerDetail`. */
export function blockSizeFor(d: State, lesson: Lesson, size?: number): number {
  if (size !== undefined) return Math.max(1, Math.round(size));
  return pendingBlocks(d, lesson)[0] ?? 1;
}
