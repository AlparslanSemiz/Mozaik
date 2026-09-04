// Two placed blocks changing places. Re-validated against the state it is
// handed, never against the one the drag started with (pitfall 20).

import { t } from './i18n';
import { check } from './blockerRules';
import { buildIndex, type BlockRef, type Index, place, sameBlock } from './placement';
import { blockPinned, liftBlock } from './pinning';
import type { State } from './types';

export function blockName(ix: Index, ref: BlockRef): string {
  const lesson = ix.lessonById.get(ref.lessonId);
  const group = ix.classById.get(ref.classId)?.name ?? '?';
  const teacher = lesson === undefined ? '?' : (ix.teacherById.get(lesson.teacherId)?.short ?? '?');
  return `${group} · ${teacher}`;
}

/** After the fact: what the toast says once the two have moved. */
export function swapDoneNotice(ix: Index, source: BlockRef, target: BlockRef): string {
  return t('{bir} ile {iki} yer değiştirdi', {
    bir: blockName(ix, source),
    iki: blockName(ix, target),
  });
}

/**
 * Before the fact: what the bar says while the card is still in the hand.
 *
 * ONE home, because two places offer this move — `swapBlocks` when it is taken
 * and `dropMap` when it is only being hovered — and the sentence they show has
 * to be the same sentence.
 */
export function swapWillNotice(ix: Index, source: BlockRef, target: BlockRef): string {
  return t('{bir} ile {iki} yer değiştirecek', {
    bir: blockName(ix, source),
    iki: blockName(ix, target),
  });
}

/** That sentence with the rule warning the move also earns, if there is one. */
export function swapWarning(
  ix: Index,
  source: BlockRef,
  target: BlockRef,
  ruleWarning: string | null,
): string {
  const notice = swapWillNotice(ix, source, target);
  return ruleWarning === null ? notice : `${notice} · ${ruleWarning}`;
}

export interface SwapResult {
  state: State;
  warning: string;
}

/** Re-validates and applies a reciprocal move against the state handed to it. */
export function swapBlocks(d: State, source: BlockRef, target: BlockRef): SwapResult | null {
  if (!sameBlock(d, source) || !sameBlock(d, target)) return null;
  if (
    blockPinned(d, source.classId, source.day, source.hour) ||
    blockPinned(d, target.classId, target.day, target.hour)
  ) return null;

  const sourceLesson = d.lessons.find((x) => x.id === source.lessonId);
  const targetLesson = d.lessons.find((x) => x.id === target.lessonId);
  if (sourceLesson === undefined || targetLesson === undefined) return null;

  let work = liftBlock(d, source.classId, source.day, source.hour);
  work = liftBlock(work, target.classId, target.day, target.hour);

  const first = check(work, buildIndex(work), source.lessonId, target.day, target.hour, source.size);
  if (first.blocked !== null) return null;
  work = place(work, source.lessonId, target.day, target.hour, source.size);

  const second = check(work, buildIndex(work), target.lessonId, source.day, source.hour, target.size);
  if (second.blocked !== null) return null;
  work = place(work, target.lessonId, source.day, source.hour, target.size);

  return {
    state: work,
    warning: swapWarning(buildIndex(d), source, target, first.warning ?? second.warning),
  };
}
