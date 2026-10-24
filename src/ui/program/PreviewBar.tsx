// The bar over the grid while a suggestion's week is previewed: which way,
// the current or the suggested week, what changes, and apply or close.

import type { Suggestion, SuggestionDiff } from '../../pure/relax';
import { useT } from '../common';
import { wayName, type Preview } from './Suggestions';

interface Props {
  previewed: Suggestion;
  preview: Preview;
  setPreview: (next: Preview | null) => void;
  diff: SuggestionDiff;
  stale: boolean;
  apply: (s: Suggestion) => void;
}

export default function PreviewBar({ previewed, preview, setPreview, diff, stale, apply }: Props) {
  const t = useT();
  return (
    <div className="preview-bar" role="region" aria-label={t('Önizleme')}>
      <b>{t('Önizleme: {yol}', { yol: wayName(t, previewed.family) })}</b>
      <span className="segmented" role="group" aria-label={t('Hangi hafta')}>
        <button
          className="btn"
          aria-pressed={preview.show === 'before'}
          onClick={() => setPreview({ ...preview, show: 'before' })}
        >
          {t('Şu anki')}
        </button>
        <button
          className="btn"
          aria-pressed={preview.show === 'after'}
          onClick={() => setPreview({ ...preview, show: 'after' })}
        >
          {t('Önerilen')}
        </button>
      </span>
      <span className="preview-legend">
        <span className="mark-key mark-opened" aria-hidden="true" />
        {t('{n} öğretmen saati açılıyor', { n: diff.opened.size })}
        <span className="mark-key mark-moved" aria-hidden="true" />
        {t('{n} ders yer değiştiriyor', { n: diff.movedBlocks })}
      </span>
      <button className="btn primary" disabled={stale} onClick={() => apply(previewed)}>
        {previewed.relaid ? t('Uygula, baştan diz') : t('Uygula')}
      </button>
      <button className="btn" onClick={() => setPreview(null)}>
        {t('Önizlemeyi kapat')}
      </button>
    </div>
  );
}
