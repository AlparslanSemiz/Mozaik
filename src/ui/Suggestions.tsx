// The panel under the reason bar when a week cannot be built as it stands
// (TODO B5.9, B5.10): the ways it can be, the father's to choose from, each one
// a sentence he could say to his teachers and the week it was found with.
// LAYOUT.md "Otomatik dizme".
//
// It sits between the bar and the grid rather than in a dialog: the father
// reads the suggestion with the timetable still in view, and it stays open while
// the search goes on to the next way.
//
// The ways keep their places (FAMILY_ORDER, the user's own list first): one
// still being looked for holds its row with "aranıyor…", so a way found later
// fills its row instead of pushing the others down.

import { useEffect, useRef, useState } from 'react';
import type { Advice } from '../platform/useSolver';
import {
  FAMILY_ORDER,
  refusalText,
  sameChanges,
  suggestionParts,
  suggestionSentence,
} from '../pure/relax';
import type { Refusal, RelaxFamily, Suggestion } from '../pure/relax';
import type { State } from '../leaf/types';
import { useT } from './T';
import type { Translate } from './T';

/** What each way asks for, in a few words: the row's name while it is looked for. */
function wayName(t: Translate, family: RelaxFamily): string {
  switch (family) {
    case 'teacherDays':
      return t('Öğretmenin zaten geldiği güne saat');
    case 'teacherHours':
      return t('En az saat, yan yana');
    case 'fewTeachers':
      return t('En az öğretmen');
    case 'mixed':
      return t('Saat ve sınır birlikte');
    case 'rules':
      return t('Yalnız sınırlar');
    case 'reassign':
      return t('Dersi başka öğretmene vermek');
    case 'blockShape':
      return t('Blok şekli');
    case 'weeklyHours':
      return t('Haftalık saat');
  }
}

export default function Suggestions({
  advice,
  state,
  onApply,
  onRefuse,
  onUnrefuse,
  onClose,
}: {
  advice: Advice;
  state: State;
  onApply: (s: Suggestion) => void;
  onRefuse: (r: Refusal) => void;
  onUnrefuse: (r: Refusal) => void;
  onClose: () => void;
}) {
  const t = useT();
  const first = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<ReadonlySet<RelaxFamily>>(new Set());
  const { suggestions, searching, progress, refused } = advice;
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

  // One row per way, in the fixed order; two ways that ask for the same thing
  // are one row, in the first one's place.
  const rows: Array<{ family: RelaxFamily; found: Suggestion | null }> = [];
  const finished = new Set(progress?.finished ?? []);
  for (const family of FAMILY_ORDER) {
    const found = suggestions.find((s) => s.family === family) ?? null;
    if (found !== null) {
      if (rows.some((r) => r.found !== null && sameChanges(r.found, found))) continue;
      rows.push({ family, found });
    } else if (searching && !finished.has(family)) {
      rows.push({ family, found: null });
    }
  }
  const firstFound = rows.find((r) => r.found !== null)?.family;

  return (
    <section className="panel suggestions" aria-labelledby="suggestions-title">
      <div className="suggestion-row">
        <h2 id="suggestions-title">{t('Kurulması için')}</h2>
        <span className="hint inline">
          {searching && suggestions.length === 0
            ? t('Nasıl kurulacağı aranıyor… {sure} sn', {
                sure: Math.round((progress?.elapsedMs ?? 0) / 1000),
              })
            : rows.length === 0
              ? t('Sınıfların saatlerine dokunmadan bir yol bulunamadı.')
              : t('Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.')}
        </span>
        {suggestions.some((x) => x.relaid) && (
          <span className="hint inline">
            {t(
              'Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.',
            )}
          </span>
        )}
        <button className="btn suggestion-close" onClick={onClose}>
          {t('Kapat')}
        </button>
      </div>
      {rows.length > 0 && (
        <ol className="suggestion-list">
          {rows.map(({ family, found }) => {
            if (found === null) {
              return (
                <li key={family} className="suggestion-pending" data-family={family}>
                  <span className="hint inline">
                    {t('{yol}: aranıyor…', { yol: wayName(t, family) })}
                  </span>
                </li>
              );
            }
            const shown = open.has(family);
            const detailId = `suggestion-${family}`;
            return (
              <li key={family} data-family={family}>
                <div className="suggestion-row">
                  <span className="suggestion-title">
                    {suggestionSentence(state, found)}
                    {searching && !finished.has(family) && (
                      <span className="hint inline"> {t('(daha iyisi aranıyor)')}</span>
                    )}
                  </span>
                  <button
                    ref={family === firstFound ? first : undefined}
                    className="btn primary"
                    disabled={stale}
                    onClick={() => onApply(found)}
                  >
                    {found.relaid ? t('Uygula, baştan diz') : t('Uygula')}
                  </button>
                  <button
                    className="btn"
                    aria-expanded={shown}
                    aria-controls={detailId}
                    onClick={() =>
                      setOpen((prev) => {
                        const next = new Set(prev);
                        if (shown) next.delete(family);
                        else next.add(family);
                        return next;
                      })
                    }
                  >
                    {shown ? t('Ayrıntıyı gizle') : t('Ayrıntı')}
                  </button>
                </div>
                {shown && (
                  <div id={detailId} className="suggestion-detail">
                    <p className="hint">{wayName(t, family)}</p>
                    <ul>
                      {suggestionParts(state, found).map((part) => (
                        <li key={part.text} className="suggestion-part">
                          <span>{part.text}</span>
                          <button
                            className="btn"
                            aria-label={t('Bu olmaz: {ne}', { ne: part.text })}
                            onClick={() => onRefuse(part.refusal)}
                          >
                            {t('Olmaz')}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="hint">
                      {t(
                        'Bu değişiklikle haftanın tamamı yerleşiyor; program bulundu ve denetlendi.',
                      )}{' '}
                      {found.proven
                        ? t('Bundan küçük bir değişiklik yetmiyor.')
                        : t('Bulduğumuz en küçük değişiklik bu.')}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {refused.length > 0 && (
        <p className="suggestion-refused">
          <span className="hint inline">{t('Olmaz dedikleriniz:')}</span>
          {refused.map((r) => {
            const text = refusalText(state, r);
            return (
              <button
                key={JSON.stringify(r)}
                className="chip"
                aria-label={t('Geri al: {ne}', { ne: text })}
                onClick={() => onUnrefuse(r)}
              >
                {text} ×
              </button>
            );
          })}
        </p>
      )}
      {staleNote}
    </section>
  );
}
