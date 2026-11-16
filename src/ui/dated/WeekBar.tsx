// The bar over the grid while a dated week is drawn on it (v18): what the two
// marks mean, and the way back to the base week, which is the one the grid
// edits. Which week it is, the strip's date chip says right above it. The
// suggestion preview's bar and marks, reused.

import { useT } from '../common';
import { showWeek } from './shownWeek';

export function WeekBar() {
  const t = useT();
  return (
    <div className="preview-bar" role="region" aria-label={t('Önizleme')}>
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
