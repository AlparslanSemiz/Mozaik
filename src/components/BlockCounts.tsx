// The split editor and the ceiling it obeys — used by TWO screens.
//
// It began inside `lessons/index.tsx`, which was the only place a lesson could
// be edited. The grid's own right-click menu can edit one now, in a sheet over
// the timetable, and a second copy of "how many 4s, how many 3s, how many 2s"
// would be a second answer to the same question the day one of them changed.
import { useT } from './T';
import {
  BLOCK_SIZES,
  blockCounts,
  blockPlan,
  maxCount,
  patternLabel,
  withCount,
} from '../blocks';
import { lessonLimit, ruleLevel } from '../rules';
import type { Lesson, State } from '../types';

/**
 * The longest block this lesson could ever have placed, or 0 for no ceiling.
 *
 * Only when the rule is set to ENGELLE: at Uyar a long block still goes down,
 * it just paints yellow, and calling that impossible would be a lie.
 */
export function blockCeiling(d: State, lesson: Lesson | undefined): number {
  if (ruleLevel(d, 'maxSameLessonPerDay') !== 'block') return 0;
  return lessonLimit(d, lesson);
}

/**
 * The split editor: how many 4s, how many 3s, how many 2s. The rest are singles.
 *
 * It replaced a dropdown listing every way the week could be divided, and the
 * reason is arithmetic: with blocks of 1 and 2 a twelve-hour lesson had 7 ways,
 * and with 3 and 4 it has 34. A list nobody can read is not a choice. Three
 * counters are three controls whatever the hours are, and the sentence beside
 * them ("3+3+2+1") says what the week will look like.
 *
 * Each counter's ceiling is asked for with the OTHER two standing (`maxCount`),
 * so the boxes can never be driven into a split that does not fit — which is
 * also why there is nothing here to clamp afterwards.
 */
export default function BlockCounts({
  weeklyHours,
  blocks,
  dayLimit,
  title,
  onPick,
}: {
  weeklyHours: number;
  blocks: number[];
  /** Most hours of THIS lesson one day may hold, or 0 for no ceiling. */
  dayLimit: number;
  title?: string;
  onPick: (blocks: number[]) => void;
}) {
  const t = useT();
  const counts = blockCounts(blocks);
  // A block longer than the daily ceiling has no legal cell ANYWHERE — not a
  // hard search, an impossible one. Left unsaid the reader picks a four, presses
  // "Otomatik diz", and watches nothing happen; Kontrol reports it, but three
  // screens away from the box that caused it.
  const tooLong = dayLimit > 0 ? blocks.filter((b) => b > dayLimit) : [];
  return (
    <span className="split-counts" title={title}>
      {BLOCK_SIZES.map((size) => (
        // Count first, length second: "2×4" is read "two fours", which is the
        // same notation `patternLabel` folds a long week into. Spelling the
        // unit out ("4 saatlik") wrapped the three boxes onto three lines in
        // the list column and doubled every row's height.
        <label key={size} className="split-count">
          <input
            type="number"
            className="num"
            min={0}
            max={maxCount(weeklyHours, blocks, size)}
            value={counts[size]}
            aria-label={t('{boy} saatlik blok sayısı', { boy: size })}
            title={t('{boy} saatlik blok sayısı', { boy: size })}
            onChange={(e) => onPick(withCount(weeklyHours, blocks, size, Number(e.target.value)))}
          />
          <span aria-hidden="true">×{size}</span>
        </label>
      ))}
      <output className="split-shape">{patternLabel(blockPlan({ weeklyHours, blocks }))}</output>
      {tooLong.length > 0 && (
        <span
          className="split-warn"
          role="status"
          title={t('Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz', {
            n: dayLimit,
          })}
        >
          {t('{boy} saat > günde {n}', { boy: Math.max(...tooLong), n: dayLimit })}
        </span>
      )}
    </span>
  );
}
