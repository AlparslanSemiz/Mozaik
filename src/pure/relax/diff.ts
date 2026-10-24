// The preview's difference: which cells a suggestion's week opens, moves or
// leaves.

import { type State, placementKey } from '../../leaf/model';
import { placedBlocks } from '../constraints';
import { activePlacements } from '../grid';
import type { Suggestion } from './options';
import { applySuggestion } from './verify';

// ------------------------------------------------------------ the preview

/**
 * What a way changes on the grid, for the preview: the teacher hours it opens
 * (closedKey) and the cells whose lesson is new there (placementKey), with how
 * many laid-out blocks leave their place. Moving lessons costs the search
 * nothing (the user's rule, 2026-09-25: "en az" is about the teachers' hours),
 * but the father sees how much of his week it is.
 */
export interface SuggestionDiff {
  opened: Set<string>;
  moved: Set<string>;
  movedBlocks: number;
}

export function suggestionDiff(before: State, s: Suggestion): SuggestionDiff {
  const after = applySuggestion(before, s);
  const opened = new Set<string>();
  for (const key of Object.keys(before.unavailable)) {
    if (after.unavailable[key] === undefined) opened.add(key);
  }
  const was = activePlacements(before);
  const now = activePlacements(after);
  const moved = new Set<string>();
  for (const [key, lessonId] of Object.entries(now)) if (was[key] !== lessonId) moved.add(key);
  let movedBlocks = 0;
  for (const lesson of before.lessons) {
    for (const b of placedBlocks(before, lesson)) {
      for (let k = 0; k < b.size; k++) {
        if (now[placementKey(lesson.classId, b.day, b.hour + k)] !== lesson.id) {
          movedBlocks++;
          break;
        }
      }
    }
  }
  return { opened, moved, movedBlocks };
}
