// The preview of a suggestion (TODO B5.11): which way is shown, whether its
// week still belongs to this plan, its difference from the grid, and the week
// itself when "Önerilen" is pressed. Escape closes it, and the first opened
// hour is scrolled into view.

import { useEffect, useMemo, useState } from 'react';
import type { State } from '../../leaf/model';
import { samePlan, type Advice } from '../../platform/search';
import { applySuggestion, suggestionDiff } from '../../pure/relax';
import type { Preview } from './Suggestions';

export function usePreview(state: State, advice: Advice | null) {
  // THE PREVIEW (TODO B5.11): a way's week drawn on the grid, marked, before
  // anything is applied. Nothing in it can be dragged or removed.
  const [preview, setPreview] = useState<Preview | null>(null);
  const stale = advice !== null && !samePlan(state, advice.forState);
  const previewed =
    preview === null || advice === null
      ? null
      : (advice.suggestions.find((s) => s.family === preview.family) ?? null);
  useEffect(() => {
    if (preview !== null && (previewed === null || stale)) setPreview(null);
  }, [preview, previewed, stale]);
  const diff = useMemo(
    () => (previewed === null ? null : suggestionDiff(state, previewed)),
    [state, previewed],
  );
  const shown = useMemo(
    () =>
      previewed !== null && preview?.show === 'after' ? applySuggestion(state, previewed) : null,
    [state, previewed, preview?.show],
  );
  // The first opened hour into view: on the father's week they sit on
  // Saturday, off the right edge of a 1920 px screen, and the preview is for
  // seeing exactly those.
  useEffect(() => {
    if (shown === null) return;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector('.program-body .card.mark-opened')
        ?.scrollIntoView({ block: 'nearest', inline: 'center' }),
    );
    return () => cancelAnimationFrame(frame);
  }, [shown]);
  useEffect(() => {
    if (preview === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);
  return { preview, setPreview, stale, previewed, diff, shown };
}
