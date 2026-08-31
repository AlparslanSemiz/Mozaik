// One shared picker for every place a lesson's weekly split is edited.
//
// `Lesson.blocks` stores only 3s and 2s; singles are what the weekly total
// leaves over. The button says the current shape, and the popover shows every
// valid partition without turning a dense lesson table into a wall of inputs.
import { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, LockKeyhole } from 'lucide-react';
import { blockPlan, patternLabel, patternOptions } from '../blocks';
import { lessonLimit, ruleLevel } from '../rules';
import type { ClassGroup, Lesson, State } from '../types';
import { useT } from './T';

/**
 * The longest block this lesson could ever have placed, or 0 for no ceiling.
 * A warning-level rule does not disable a choice; only ENGELLE makes it
 * impossible everywhere.
 */
export function blockCeiling(d: State, lesson: Lesson | undefined, group?: ClassGroup): number {
  if (ruleLevel(d, 'maxSameLessonPerDay') !== 'block') return 0;
  return lessonLimit(d, lesson, group);
}

function sameBlocks(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export default function BlockPatternPicker({
  weeklyHours,
  blocks,
  dayLimit,
  title,
  onPick,
}: {
  weeklyHours: number;
  blocks: number[];
  /** Most hours of THIS lesson one day may hold, or 0 for no hard ceiling. */
  dayLimit: number;
  title?: string;
  onPick: (blocks: number[]) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const options = useMemo(() => patternOptions(weeklyHours), [weeklyHours]);
  const current = patternLabel(blockPlan({ weeklyHours, blocks }));

  function pick(next: number[], impossible: boolean) {
    if (impossible) return;
    onPick(next);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="split-pick"
          title={title}
          aria-label={`${t('Dağılım')}: ${current}`}
        >
          <span>{current}</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="split-popover"
          sideOffset={6}
          collisionPadding={8}
          align="start"
        >
          <strong className="split-popover-title">{t('Dağılım')}</strong>
          <div className="split-options" role="listbox" aria-label={t('Dağılım')}>
            {options.map((option) => {
              const longest = option.plan[0] ?? 1;
              const impossible = dayLimit > 0 && longest > dayLimit;
              const selected = sameBlocks(option.blocks, blocks);
              const why = impossible
                ? t('Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz', {
                    n: dayLimit,
                  })
                : undefined;
              return (
                <button
                  key={option.blocks.join(',') || 'singles'}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-disabled={impossible}
                  className={`split-option${selected ? ' selected' : ''}${impossible ? ' disabled' : ''}`}
                  title={why}
                  onClick={() => pick(option.blocks, impossible)}
                >
                  <span className="split-option-mark" aria-hidden="true">
                    {selected ? <Check size={16} /> : impossible ? <LockKeyhole size={14} /> : null}
                  </span>
                  <span className="split-option-label">{option.label}</span>
                  {impossible && (
                    <span className="split-option-why">
                      {t('{boy} saat > günde {n}', { boy: longest, n: dayLimit })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Popover.Arrow className="split-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
