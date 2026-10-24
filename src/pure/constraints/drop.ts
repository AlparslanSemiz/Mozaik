// What letting go of a card does: the drop map computed once per drag, the
// swap and the eviction it may cause, their sentences, and `applyDrop`.

import { t } from '../../leaf/i18n';
import {
  type Id,
  type Lesson,
  type State,
  cellKey,
  closedKey,
  placementKey,
} from '../../leaf/model';
import { activePinned, activePlacements, replaceActiveGrid } from '../grid';
import { type PlacedBlock, blockSizeFor, placedBlocks } from './blocks';
import { type Verdict, blockerDetail, check, verdictAfterBlocker } from './engine';
import { type Index, buildIndex, occupy, vacate } from './occupancy';
import { blockAt, blockPinned, liftBlock, place } from './placing';

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
 * functional colours keep meaning exactly what docs/DESIGN.md says they mean.
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

/** A block identity that remains unambiguous when one lesson has several blocks. */
export interface BlockRef extends PlacedBlock {
  lessonId: Id;
  classId: Id;
}

export type DropAction =
  { kind: 'place' } | { kind: 'evict'; blocks: BlockRef[] } | { kind: 'swap'; targets: BlockRef[] };

function sameBlock(d: State, ref: BlockRef): boolean {
  if (activePlacements(d)[placementKey(ref.classId, ref.day, ref.hour)] !== ref.lessonId) {
    return false;
  }
  const found = blockAt(d, ref.classId, ref.day, ref.hour);
  return found !== null && found.hour === ref.hour && found.size === ref.size;
}

function refAt(d: State, lessonId: Id, day: number, hour: number): BlockRef | null {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return null;
  const found = blockAt(d, lesson.classId, day, hour);
  return found === null
    ? null
    : { lessonId, classId: lesson.classId, day: found.day, hour: found.hour, size: found.size };
}

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
      ix.teacherBusy.get(closedKey(moving.teacherId, day, h)),
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
      )
        continue;
      found.set(placementKey(ref.classId, ref.day, ref.hour), ref);
    }
  }
  return [...found.values()];
}

function blockName(ix: Index, ref: BlockRef): string {
  const lesson = ix.lessonById.get(ref.lessonId);
  const group = ix.classById.get(ref.classId)?.name ?? '?';
  const teacher = lesson === undefined ? '?' : (ix.teacherById.get(lesson.teacherId)?.short ?? '?');
  return `${group} · ${teacher}`;
}

/**
 * The other side of a swap, named: one block, or several of one lesson
 * counted, or several lessons listed.
 */
function targetsName(ix: Index, targets: BlockRef[]): string {
  const names = [...new Set(targets.map((x) => blockName(ix, x)))];
  if (names.length === 1 && targets.length > 1)
    return t('{ad} ({n} blok)', { ad: names[0]!, n: targets.length });
  return names.join(', ');
}

export function swapDoneNotice(ix: Index, source: BlockRef, targets: BlockRef[]): string {
  return t('{bir} ile {iki} yer değiştirdi', {
    bir: blockName(ix, source),
    iki: targetsName(ix, targets),
  });
}

export interface SwapResult {
  state: State;
  warning: string;
}

/**
 * A swap that was tried and is not legal, with the sentence that says why.
 * Only the two checks that move a block say this: the rest (a pin, a shape
 * that does not fill the hours) are not a swap at all.
 */
interface SwapRefusal {
  refused: string;
}

/**
 * Re-validates and applies a reciprocal move against the state handed to it.
 *
 * One target: the two blocks trade starts, each keeping its length. Several
 * (TODO B5.7, the user's decision 2026-09-26): they must fill the hours the
 * dragged block is dropped on exactly, one day, no gap and no overlap, and
 * they go to its old hours in the same order. A 2-hour block dropped on a
 * teacher's two singles in another class used to find two blocks in the way
 * and offer nothing.
 */
function swapBlocks(
  d: State,
  source: BlockRef,
  targets: BlockRef[],
): SwapResult | SwapRefusal | null {
  if (targets.length === 0) return null;
  if (!sameBlock(d, source) || targets.some((x) => !sameBlock(d, x))) return null;
  if (
    blockPinned(d, source.classId, source.day, source.hour) ||
    targets.some((x) => blockPinned(d, x.classId, x.day, x.hour))
  )
    return null;
  if (!d.lessons.some((x) => x.id === source.lessonId)) return null;
  if (targets.some((x) => !d.lessons.some((y) => y.id === x.lessonId))) return null;

  const ordered = [...targets].sort((a, b) => a.hour - b.hour);
  const first = ordered[0]!;
  // Where each target goes: its own start and the source's when alone, and
  // for several, the same offset inside the source's old hours.
  const moves = ordered.map((x) => ({
    ref: x,
    hour: ordered.length === 1 ? source.hour : source.hour + (x.hour - first.hour),
  }));
  if (ordered.length > 1) {
    let next = first.hour;
    for (const x of ordered) {
      if (x.day !== first.day || x.hour !== next) return null;
      next += x.size;
    }
    if (next - first.hour !== source.size) return null;
  }

  let work = liftBlock(d, source.classId, source.day, source.hour);
  for (const x of ordered) work = liftBlock(work, x.classId, x.day, x.hour);

  const verdicts: Verdict[] = [];
  const firstCheck = check(
    work,
    buildIndex(work),
    source.lessonId,
    first.day,
    first.hour,
    source.size,
  );
  const ix = buildIndex(d);
  if (firstCheck.blocked !== null) {
    return { refused: t('Takas olmaz: {sebep}', { sebep: firstCheck.blocked }) };
  }
  verdicts.push(firstCheck);
  work = place(work, source.lessonId, first.day, first.hour, source.size);

  for (const { ref, hour } of moves) {
    const verdict = check(work, buildIndex(work), ref.lessonId, source.day, hour, ref.size);
    if (verdict.blocked !== null) {
      return {
        refused: t('Takas olmaz, {ne} eski yerine geçemiyor: {sebep}', {
          ne: blockName(ix, ref),
          sebep: verdict.blocked,
        }),
      };
    }
    verdicts.push(verdict);
    work = place(work, ref.lessonId, source.day, hour, ref.size);
  }

  const notice = t('{bir} ile {iki} yer değiştirecek', {
    bir: blockName(ix, source),
    iki: targetsName(ix, ordered),
  });
  const ruleWarning = verdicts.find((v) => v.warning !== null)?.warning ?? null;
  return { state: work, warning: ruleWarning === null ? notice : `${notice} · ${ruleWarning}` };
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
          occupied.set(cellKey(block.day, block.hour + i), {
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
      const key = cellKey(g, s);
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
        const swap = swapBlocks(original, source, candidates);
        // The swap was tried and refused, and the plain verdict names the
        // very block the swap would have moved (the teacher is in that class
        // then). That sentence points at the partner; the swap's own says what
        // actually stops it (DENETIM DK2). A class's own lesson in the way
        // keeps its sentence: the cell may still send that lesson to the pool.
        if (swap !== null && 'refused' in swap) {
          if (detail?.code === 'teacherBusy') {
            map.set(key, {
              blocked: swap.refused,
              warning: null,
              evicts: [],
              action: { kind: 'place' },
            });
            continue;
          }
        } else if (swap !== null) {
          map.set(key, {
            blocked: null,
            warning: swap.warning,
            evicts: [],
            action: { kind: 'swap', targets: candidates },
          });
          continue;
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
        const found = occupied.get(cellKey(g, s + i));
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
        warning:
          after.warning ??
          evictionNotice(
            ix,
            heads.map((h) => h.lesson),
          ),
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

/**
 * What the reader is about to lose, named — or, with `done`, what they lost.
 *
 * The past tense is its own sentence. It used to be the future one with
 * "dönecek" swapped for "döndü", which only works in Turkish and English: the
 * French sentence has no "reviendra" to swap, the German plural no "geht
 * zurück", and the Spanish plural became "ha vuelton".
 */
export function evictionNotice(ix: Index, lessons: Lesson[], done = false): string {
  const names = lessons.map((x) => {
    const group = ix.classById.get(x.classId)?.name ?? '?';
    const teacher = ix.teacherById.get(x.teacherId)?.short ?? '?';
    return `${group} · ${teacher}`;
  });
  if (names.length === 1) {
    return done
      ? t('{ders} dersi havuza döndü', { ders: names[0]! })
      : t('{ders} dersi havuza dönecek', { ders: names[0]! });
  }
  return done
    ? t('{dersler} dersleri havuza döndü', { dersler: names.join(', ') })
    : t('{dersler} dersleri havuza dönecek', { dersler: names.join(', ') });
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
    const swap = swapBlocks(d, request.source, request.action.targets);
    return swap === null || 'refused' in swap ? d : swap.state;
  }

  let next = d;
  if (request.source !== null) {
    if (!sameBlock(next, request.source)) return d;
    if (blockPinned(next, request.source.classId, request.source.day, request.source.hour))
      return d;
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
