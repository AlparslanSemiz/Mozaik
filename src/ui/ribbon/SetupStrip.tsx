// Okul: which of the four lists is open, and how many rows each holds.

import type React from 'react';
import { STEPS } from '../program';
import { Group, type StripContext } from './parts';

export function setupStrip({ ui, state, t }: StripContext): React.ReactElement {
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
