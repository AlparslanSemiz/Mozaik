// The bar over the grid while a dated week is drawn on it (v18): which week,
// what the two marks mean, and the way back to the base week, which is the one
// the grid edits. The suggestion preview's bar and marks, reused.

import type { State } from '../../leaf/model';
import { weekLabel } from '../../pure/dated';
import { useT } from '../common';
import { showWeek } from './shownWeek';

export function WeekBar({ state, week }: { state: State; week: string }) {
  const t = useT();
  const label = weekLabel(state, week);
  return (
    <div className="preview-bar" role="region" aria-label={label}>
      <b>{label}</b>
      <span className="preview-legend">
        <span className="mark-key mark-opened" aria-hidden="true" />
        {t('Boş geçsin')}
        <span className="mark-key mark-moved" aria-hidden="true" />
        {t('Değişen')}
      </span>
      <button className="btn primary" onClick={() => showWeek(null)}>
        {t('Temel haftaya dön')}
      </button>
    </div>
  );
}
