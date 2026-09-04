// What EVERY cell of the grid would do if the card were let go over it.
//
// One pass, computed ONCE at the start of a drag (pitfall 2) and never again
// while the pointer moves. Three answers come out of it: place, swap with what
// is there, or evict what is there back to the pool.

import { t } from '../i18n';
import { blockerDetail, check, type Verdict, verdictAfterBlocker } from './blockerRules';
import { placementKey, teacherKey } from '../keys';
import {
  type BlockRef,
  blockSizeFor,
  buildIndex,
  type Index,
  occupy,
  place,
  placedBlocks,
  refAt,
  sameBlock,
  vacate,
} from './placement';
import { blockPinned, liftBlock, removeBlock } from './pinning';
import { activePinned, activePlacements, replaceActiveGrid } from '../state/programs';
import { swapBlocks, swapWarning } from './swap';
import type { Id, Lesson, State } from '../types';

/**
 * THE DROP MAP: what every cell on the grid would do if the lesson were let go
 * over it. One call, one pass, computed ONCE at the start of a drag (pitfall 2)
 * and never again while the pointer moves.
 *
 * It is `check()` for every cell plus the ONE refusal a drop is allowed to
 * overrule: the class's own other lesson already sitting in the target cells.
 * Asked for by name (2026-08-26): "farklı bir kart başka bir kartın üzerine
 * gelirse o üzerine gelinen aşağı düşsün ve koyduğum olsun" — the one that was
 * there goes back to the pool, which is the tray directly below the grid.
 *
 * Only `classBusy` is overruled, and the limit is not squeamishness: every
 * other refusal is about somebody ELSE. A teacher standing in another class, a
 * shared room, a closed hour — evicting the block in front of you does not
 * make any of those true, so a cell refused for one of them stays refused.
 *
 * WHY THE VERDICT IS "warn" AND NOT "ok". A drop that costs you a lesson is not
 * the same move as a drop onto empty air, and the grid already has a colour for
 * "allowed, but look at it": yellow. No fourth colour was added — the three
 * functional colours keep meaning exactly what CLAUDE.md says they mean.
 *
 * The eviction is simulated with `vacate`/`occupy` on ONE working copy rather
 * than with `removeBlock` per cell: the latter copies a ~1800-key dictionary
 * and rebuilds the index for each of 72 cells, and this runs on the pointer
 * going down.
 */
export interface DropVerdict extends Verdict {
  /** Lessons that would be sent back to the pool for this drop to happen. */
  evicts: Id[];
  action: DropAction;
}

export type DropAction =
  | { kind: 'place' }
  | { kind: 'evict'; blocks: BlockRef[] }
  | { kind: 'swap'; target: BlockRef };

function targetBlocks(
  d: State,
  ix: Index,
  moving: Lesson,
  source: BlockRef,
  day: number,
  hour: number,
  size: number,
): BlockRef[] {
  const found = new Map<string, BlockRef>();
  for (let i = 0; i < size; i++) {
    const h = hour + i;
    const ids = [
      activePlacements(d)[placementKey(moving.classId, day, h)],
      ix.teacherBusy.get(teacherKey(moving.teacherId, day, h)),
    ];
    for (const id of ids) {
      if (id === undefined) continue;
      const ref = refAt(d, id, day, h);
      if (ref === null) continue;
      if (
        ref.lessonId === source.lessonId &&
        ref.classId === source.classId &&
        ref.day === source.day &&
        ref.hour === source.hour
      ) continue;
      found.set(`${ref.classId}|${ref.day}|${ref.hour}`, ref);
    }
  }
  return [...found.values()];
}

export function dropMap(
  d: State,
  ix: Index,
  lessonId: Id,
  size?: number,
  source: BlockRef | null = null,
): Map<string, DropVerdict> {
  const map = new Map<string, DropVerdict>();
  const original = d;
  const originalIx = ix;
  if (source !== null) {
    d = liftBlock(d, source.classId, source.day, source.hour);
    ix = buildIndex(d);
  }
  const lesson = ix.lessonById.get(lessonId);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  // One working copy for the whole pass; `vacate`/`occupy` write into it and
  // put it back, so `d` itself is never touched. The INDEX is copied too, and
  // not for tidiness: `ix` is the caller's memoised object, shared with every
  // render, and a vacate that was not followed by its occupy would leave it
  // lying about who is busy. Copying costs one pass over ~1800 entries, once —
  // the thing being avoided is doing that 72 times.
  const work: State = replaceActiveGrid(d, { placements: { ...activePlacements(d) } });
  const workIx: Index = {
    ...ix,
    teacherBusy: new Map(ix.teacherBusy),
    roomBusy: new Map(ix.roomBusy),
    placedHours: new Map(ix.placedHours),
  };

  // Every occupied hour of the target class points at its whole block. The old
  // inner loop called blockAt() for every candidate cell; blockAt() then found
  // a lesson and reconstructed that lesson's whole week each time. Build the
  // same answer once per drag instead.
  const occupied = new Map<string, { lesson: Lesson; hour: number; size: number }>();
  if (lesson !== undefined) {
    for (const occupant of d.lessons) {
      if (occupant.classId !== lesson.classId) continue;
      for (const block of placedBlocks(d, occupant)) {
        for (let i = 0; i < block.size; i++) {
          occupied.set(`${block.day}|${block.hour + i}`, {
            lesson: occupant,
            hour: block.hour,
            size: block.size,
          });
        }
      }
    }
  }

  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      const key = `${g}|${s}`;
      const detail = blockerDetail(d, ix, lessonId, g, s, size);
      const plain = verdictAfterBlocker(d, ix, lessonId, g, s, size, detail);
      if (source !== null && lesson !== undefined) {
        const candidates = targetBlocks(
          original,
          originalIx,
          lesson,
          source,
          g,
          s,
          blockSizeFor(d, lesson, size),
        );
        if (candidates.length === 1) {
          const target = candidates[0]!;
          const targetLesson = ix.lessonById.get(target.lessonId);
          if (
            targetLesson !== undefined &&
            sameBlock(d, target) &&
            !blockPinned(d, target.classId, target.day, target.hour)
          ) {
            // The same reciprocal-move check `swapBlocks()` does, against the
            // SAME `work`/`workIx` scratch pair the eviction path below
            // reuses — not a fresh `liftBlock()` + `buildIndex()` pair per
            // candidate. `buildIndex()` walks every placement in the school
            // (~1800 keys); calling it twice per occupied cell of this
            // 84-cell scan, at pointerdown, on a densely booked teacher row,
            // is what made picking up an ALREADY-PLACED card stutter — a
            // pool card never reaches this branch (`source` is null for it).
            const placements = activePlacements(work);
            const sourceRoom = roomOf(ix, lesson);
            const targetRoom = roomOf(ix, targetLesson);

            vacate(placements, workIx, targetLesson, targetRoom, target.day, target.hour, target.size);
            const first = check(work, workIx, lesson.id, target.day, target.hour, source.size);
            let warning: string | undefined;
            if (first.blocked === null) {
              occupy(placements, workIx, lesson, sourceRoom, target.day, target.hour, source.size);
              const second = check(work, workIx, target.lessonId, source.day, source.hour, target.size);
              vacate(placements, workIx, lesson, sourceRoom, target.day, target.hour, source.size);
              if (second.blocked === null) {
                warning = swapWarning(ix, source, target, first.warning ?? second.warning);
              }
            }
            // Puts the row back exactly as this cell found it, whether the
            // swap held or not — the next cell in the scan depends on it.
            occupy(placements, workIx, targetLesson, targetRoom, target.day, target.hour, target.size);

            if (warning !== undefined) {
              map.set(key, {
                blocked: null,
                warning,
                evicts: [],
                action: { kind: 'swap', target },
              });
              continue;
            }
          }
        }
      }
      if (plain.blocked === null || lesson === undefined) {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
        continue;
      }

      if (detail === null || detail.code !== 'classBusy') {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
        continue;
      }

      // Which of the class's own blocks are in the way. A block is identified
      // by its HEAD, so two cells of the same 2-hour block count once — and it
      // carries its own length, because the occupant's blocks need not be the
      // same length as each other any more.
      const block = blockSizeFor(d, lesson, size);
      const heads: Array<{ lesson: Lesson; hour: number; size: number }> = [];
      const seen = new Set<string>();
      for (let i = 0; i < block && s + i < hourCount; i++) {
        const found = occupied.get(`${g}|${s + i}`);
        if (found === undefined) continue;
        const mark = `${found.lesson.id}|${found.hour}`;
        if (seen.has(mark)) continue;
        seen.add(mark);
        heads.push(found);
      }

      if (heads.length === 0) {
        map.set(key, { ...plain, evicts: [], action: { kind: 'place' } });
        continue;
      }

      // A PINNED block is not evicted. Eviction is the one refusal a drop may
      // overrule, and a pin is the reader saying "not this one" about exactly
      // that: without this the lock would hold against the mouse, the keyboard
      // and the solver, and then quietly lose to a card dropped on top of it.
      const locked = heads.find(
        (h) => activePinned(d)[placementKey(lesson.classId, g, h.hour)] !== undefined,
      );
      if (locked !== undefined) {
        map.set(key, {
          blocked: t('{sinif} sınıfının {gun} {saat} saatindeki ders sabitlenmiş', {
            sinif: ix.classById.get(lesson.classId)?.name ?? '?',
            gun: d.settings.days[g]?.name ?? `${g + 1}`,
            saat: d.settings.hours[locked.hour] ?? `${locked.hour + 1}`,
          }),
          warning: null,
          evicts: [],
          action: { kind: 'place' },
        });
        continue;
      }

      for (const h of heads) {
        vacate(activePlacements(work), workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }
      const after = check(work, workIx, lessonId, g, s, size);
      for (const h of heads) {
        occupy(activePlacements(work), workIx, h.lesson, roomOf(ix, h.lesson), g, h.hour, h.size);
      }

      if (after.blocked !== null) {
        // Evicting did not help: the cell is refused for its own reason, and
        // the sentence the reader gets is that reason, not "class is busy".
        map.set(key, { ...after, evicts: [], action: { kind: 'place' } });
        continue;
      }

      const evicted = heads.map((h) => ({
        lessonId: h.lesson.id,
        classId: h.lesson.classId,
        day: g,
        hour: h.hour,
        size: h.size,
      }));
      map.set(key, {
        blocked: null,
        warning: after.warning ?? evictionNotice(ix, heads.map((h) => h.lesson)),
        evicts: heads.map((h) => h.lesson.id),
        action: { kind: 'evict', blocks: evicted },
      });
    }
  }

  return map;
}

/** The class's room, which `occupy`/`vacate` need to keep roomBusy honest. */
function roomOf(ix: Index, lesson: Lesson): Id | null {
  return ix.classById.get(lesson.classId)?.roomId ?? null;
}

/** What the reader is about to lose, named. */
export function evictionNotice(ix: Index, lessons: Lesson[]): string {
  const names = lessons.map((x) => {
    const group = ix.classById.get(x.classId)?.name ?? '?';
    const teacher = ix.teacherById.get(x.teacherId)?.short ?? '?';
    return `${group} · ${teacher}`;
  });
  return names.length === 1
    ? t('{ders} dersi havuza dönecek', { ders: names[0]! })
    : t('{dersler} dersleri havuza dönecek', { dersler: names.join(', ') });
}

/**
 * The eviction itself, as a state change: lift every block that is in the way,
 * then lay the new one down. Separate from `dropMap` because the map ANSWERS a
 * question and this one CHANGES something, and because the reducer has to redo
 * the lift against the state React hands it rather than the one the drag
 * started with (pitfall 20).
 */
export function evict(d: State, classId: Id, day: number, hours: number[]): State {
  let next = d;
  for (const h of hours) next = removeBlock(next, classId, day, h);
  return next;
}

export interface DropRequest {
  lessonId: Id;
  size: number;
  source: BlockRef | null;
  day: number;
  hour: number;
  action: DropAction;
}

/**
 * Commits the answer shown during a drag, but trusts none of its old grid
 * contents. React may hand the reducer a newer state, so every referenced
 * block and every constraint is checked again before one placement changes.
 */
export function applyDrop(d: State, request: DropRequest): State {
  if (request.action.kind === 'swap') {
    if (request.source === null) return d;
    return swapBlocks(d, request.source, request.action.target)?.state ?? d;
  }

  let next = d;
  if (request.source !== null) {
    if (!sameBlock(next, request.source)) return d;
    if (blockPinned(next, request.source.classId, request.source.day, request.source.hour)) return d;
    next = liftBlock(next, request.source.classId, request.source.day, request.source.hour);
  }

  if (request.action.kind === 'evict') {
    for (const target of request.action.blocks) {
      if (!sameBlock(next, target)) return d;
      if (blockPinned(next, target.classId, target.day, target.hour)) return d;
    }
    for (const target of request.action.blocks) {
      next = liftBlock(next, target.classId, target.day, target.hour);
    }
  }

  const verdict = check(
    next,
    buildIndex(next),
    request.lessonId,
    request.day,
    request.hour,
    request.size,
  );
  return verdict.blocked === null
    ? place(next, request.lessonId, request.day, request.hour, request.size)
    : d;
}
