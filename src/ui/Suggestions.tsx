// The panel under the reason bar when a week cannot be built as it stands
// (TODO B5.9): what to change so it can, one numbered way per family, each with
// the week it was found with. LAYOUT.md "Otomatik dizme".
//
// It sits between the bar and the grid rather than in a dialog: the father
// reads the suggestion with the timetable still in view, and it stays open while
// the search goes on to the next family.

import { useEffect, useRef, useState } from 'react';
import type { Advice } from '../platform/useSolver';
import { suggestionLines } from '../pure/relax';
import type { Suggestion } from '../pure/relax';
import type { State } from '../leaf/types';
import { useT } from './T';
import type { Translate } from './T';

function title(t: Translate, s: Suggestion): string {
  const n = s.changes.length;
  switch (s.family) {
    case 'teacherHours':
      return t('{n} öğretmen saatini açın', { n });
    case 'rules':
      return t('{n} sınırı yükseltin', { n });
    case 'blockShape':
      return t('{n} dersin blok şeklini değiştirin', { n });
    case 'weeklyHours':
      return t('Haftalık saati {n} saat azaltın', { n: s.size });
  }
}

export default function Suggestions({
  advice,
  state,
  onApply,
  onClose,
}: {
  advice: Advice;
  state: State;
  onApply: (s: Suggestion) => void;
  onClose: () => void;
}) {
  const t = useT();
  const first = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const { suggestions, searching } = advice;
  // A suggestion is for the timetable it was made from. Once that has changed
  // (an undo, a drop) it would paste an old week over the new one.
  const stale = state !== advice.forState;
  const as = suggestions.find((s) => s.changes.length === 0);

  // Focus goes to the first way once the search is over: sooner, and it would
  // pull the keyboard away from whatever the reader was doing meanwhile.
  const settled = !searching && suggestions.length > 0;
  useEffect(() => {
    if (settled) first.current?.focus();
  }, [settled]);

  // The bar keeps saying what happened (which lesson, and why); this panel is
  // what to do about it, so while nothing is found yet it says it is looking,
  // and when nothing was found it says that too rather than vanishing.
  if (suggestions.length === 0) {
    return (
      <section className="panel suggestions" aria-labelledby="suggestions-title">
        <div className="suggestion-row">
          <h2 id="suggestions-title">{t('Kurulması için')}</h2>
          <span className="hint inline">
            {searching
              ? t('Nasıl kurulacağı aranıyor… {sure} sn', {
                  sure: Math.round((advice.progress?.elapsedMs ?? 0) / 1000),
                })
              : t('Sınıfların saatlerine dokunmadan bir yol bulunamadı.')}
          </span>
          <button className="btn suggestion-close" onClick={onClose}>
            {t('Kapat')}
          </button>
        </div>
      </section>
    );
  }

  const staleNote = stale && (
    <p className="hint">
      {t('Program o arada değişti. Öneriyi yeniden görmek için Otomatik diz’e basın.')}
    </p>
  );

  if (as !== undefined) {
    return (
      <section className="panel suggestions" aria-labelledby="suggestions-title">
        <div className="suggestion-row">
          <h2 id="suggestions-title">
            {as.relaid
              ? t('Hafta baştan dizilince değişiklik gerekmeden kuruluyor')
              : t('Hafta değişiklik gerekmeden kuruluyor')}
          </h2>
          <span className="hint inline">
            {t('Otomatik dizme bu haftayı bulamadı; ikinci arama buldu ve denetledi.')}
          </span>
          <button ref={first} className="btn primary" disabled={stale} onClick={() => onApply(as)}>
            {as.relaid ? t('Programı baştan yerleştir') : t('Programı yerleştir')}
          </button>
          <button className="btn" onClick={onClose}>
            {t('Kapat')}
          </button>
        </div>
        {staleNote}
      </section>
    );
  }

  // One line per way: what to do, the button that does it, and the details
  // folded away. The grid below is what the reader is looking at; the lines of
  // hours and limits are one click further for whoever wants them.
  return (
    <section className="panel suggestions" aria-labelledby="suggestions-title">
      <div className="suggestion-row">
        <h2 id="suggestions-title">{t('Kurulması için')}</h2>
        <span className="hint inline">
          {t('Her yol tek başına yetiyor; sınıfların saatlerine dokunulmaz.')}
        </span>
        {suggestions.some((x) => x.relaid) && (
          <span className="hint inline">
            {t(
              'Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.',
            )}
          </span>
        )}
        {searching && <span className="hint inline">{t('Başka yollar aranıyor…')}</span>}
        <button className="btn suggestion-close" onClick={onClose}>
          {t('Kapat')}
        </button>
      </div>
      <ol className="suggestion-list">
        {suggestions.map((s, i) => {
          const shown = open.has(s.family);
          const detailId = `suggestion-${s.family}`;
          return (
            <li key={s.family}>
              <div className="suggestion-row">
                <span className="suggestion-title">{title(t, s)}</span>
                <button
                  ref={i === 0 ? first : undefined}
                  className="btn primary"
                  disabled={stale}
                  onClick={() => onApply(s)}
                >
                  {s.family === 'teacherHours'
                    ? s.relaid
                      ? t('Saatleri aç ve programı baştan yerleştir')
                      : t('Saatleri aç ve programı yerleştir')
                    : s.relaid
                      ? t('Değiştir ve programı baştan yerleştir')
                      : t('Değiştir ve programı yerleştir')}
                </button>
                <button
                  className="btn"
                  aria-expanded={shown}
                  aria-controls={detailId}
                  onClick={() =>
                    setOpen((prev) => {
                      const next = new Set(prev);
                      if (shown) next.delete(s.family);
                      else next.add(s.family);
                      return next;
                    })
                  }
                >
                  {shown ? t('Ayrıntıyı gizle') : t('Ayrıntı')}
                </button>
              </div>
              {shown && (
                <div id={detailId} className="suggestion-detail">
                  <ul>
                    {suggestionLines(state, s).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="hint">
                    {t(
                      'Bu değişiklikle haftanın tamamı yerleşiyor; program bulundu ve denetlendi.',
                    )}{' '}
                    {s.proven
                      ? t('Bundan küçük bir değişiklik yetmiyor.')
                      : t('Bulduğumuz en küçük değişiklik bu.')}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {staleNote}
    </section>
  );
}
