// Okul'un dört listesi: hangisine bakıyorsun, ve her birinde kaç satır var.
//
// Split out of Ribbon.tsx, which was one function with seven branches. The
// strip's SHAPE is shared (./parts); what each tab ASKS is its own file.

import { STEPS } from '../steps';
import { useT } from '../T';
import {
  Group,
} from './parts';
import type { RibbonProps } from './props';

export default function SetupRibbon({ ui, state }: Pick<RibbonProps, 'ui' | 'state'>) {
  const t = useT();

    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Okul listeleri')}>
        <Group label="Liste">
          {STEPS.map((s) => {
            const count = s.count(state);
            return (
              <button
                key={s.id}
                className="btn step"
                aria-pressed={s.id === ui.step}
                data-empty={count === 0}
                onClick={() => ui.setStep(s.id)}
              >
                <span className="step-icon" aria-hidden="true">
                  {s.icon}
                </span>

                {t(s.label)}
                <span className="step-count">{count}</span>
              </button>
            );
          })}
        </Group>
      </div>
    );
}
