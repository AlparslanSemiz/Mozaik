// The panel under the reason bar when a week cannot be built as it stands
// (TODO B5.9, B5.10, B5.11): the ways it can be, the father's to choose from,
// each one a sentence he could say to his teachers and the week it was found
// with. LAYOUT.md "Otomatik dizme".
//
// It sits between the bar and the grid rather than in a dialog: the father
// reads the suggestion with the timetable still in view, and it stays open while
// the search goes on to the next way.
//
// The ways keep their places (FAMILY_ORDER, the user's own list first): one
// still being looked for holds its row with "aranıyor…", so a way found later
// fills its row instead of pushing the others down.
//
// A way's details are its questions ("cevap defteri", 2026-09-25): what the
// father asks each teacher, answered "Olur" or "Olmaz" in one of four
// strengths. The answers are the plan's data (State.answers), so they outlive
// the panel and the program; every answer runs the search again.

import type { State } from '../../leaf/model';
import type { Advice } from '../../platform/search';
import { dropAnswer } from '../../pure/entities';
import {
  FAMILY_ORDER,
  type RelaxFamily,
  type Suggestion,
  answerParts,
  outdone,
  sameChanges,
  suggestionSentence,
} from '../../pure/relax';
import { type Translate, useT } from '../common';
import { useEffect, useRef, useState } from 'react';
import { AnswerBook, QuestionSheet } from './AnswerBook';

/** What each way asks for, in a few words: the row's name while it is looked for. */
export function wayName(t: Translate, family: RelaxFamily): string {
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
    case 'handFew':
      return t('Bir dersi başka öğretmene verip daha az saat');
    case 'handHours':
      return t('Birkaç dersi başka öğretmene verip en az saat');
    case 'blockShape':
      return t('Blok şekli');
    case 'weeklyHours':
      return t('Haftalık saat');
  }
}

/** Which way the grid is showing, and whether as it would be or as it is. */
export interface Preview {
  family: RelaxFamily;
  show: 'after' | 'before';
}

export default function Suggestions({
  advice,
  state,
  stale,
  preview,
  onPreview,
  onApply,
  onAnswer,
  onResume,
  onClose,
}: {
  advice: Advice;
  state: State;
  /** The timetable changed since the suggestions were made (answers aside). */
  stale: boolean;
  preview: Preview | null;
  onPreview: (p: Preview | null) => void;
  onApply: (s: Suggestion) => void;
  /** Writes an answer into the plan; the search runs again from there. */
  onAnswer: (next: (d: State) => State) => void;
  /** Starts a stopped search again. */
  onResume: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const first = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<ReadonlySet<RelaxFamily>>(new Set());
  const [printing, setPrinting] = useState<Suggestion | null>(null);
  const { suggestions, searching, stopped, progress } = advice;
  const as = suggestions.find((s) => s.changes.length === 0);

  // Focus goes to the first way once the search is over: sooner, and it would
  // pull the keyboard away from whatever the reader was doing meanwhile.
  const settled = !searching && suggestions.length > 0;
  useEffect(() => {
    if (settled) first.current?.focus();
  }, [settled]);

  // Printing the questions: the sheet is drawn, printed, and taken down again.
  useEffect(() => {
    if (printing === null) return;
    const root = document.documentElement;
    root.classList.add('print-questions');
    const done = () => {
      root.classList.remove('print-questions');
      setPrinting(null);
    };
    window.addEventListener('afterprint', done, { once: true });
    const frame = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', done);
      root.classList.remove('print-questions');
    };
  }, [printing]);

  const staleNote = stale && (
    <p className="hint">
      {t('Program o arada değişti. Öneriyi yeniden görmek için Otomatik diz’e basın.')}
    </p>
  );

  const parts = answerParts(state, state.answers);
  const answerLine = parts.length > 0 && (
    <p className="suggestion-refused">
      <span className="hint inline">{t('Cevaplarınız:')}</span>
      {parts.map((part) => (
        <button
          key={`${part.yes ? 'yes' : 'no'}-${part.text}`}
          className={part.yes ? 'chip chip-yes' : 'chip chip-no'}
          aria-label={t('Geri al: {ne}', { ne: part.text })}
          onClick={() => onAnswer((d) => part.items.reduce(dropAnswer, d))}
        >
          {part.yes ? '✓' : '✗'} {part.text} ×
        </button>
      ))}
    </p>
  );

  if (as !== undefined) {
    const enough = as.accepted.length > 0;
    return (
      <section className="panel suggestions" aria-labelledby="suggestions-title">
        <div className="suggestion-row">
          <h2 id="suggestions-title">
            {enough
              ? t('Olur dedikleriniz yetiyor: hafta kuruluyor')
              : as.relaid
                ? t('Hafta baştan dizilince değişiklik gerekmeden kuruluyor')
                : t('Hafta değişiklik gerekmeden kuruluyor')}
          </h2>
          <span className="hint inline">
            {enough
              ? t('Uygulayınca cevaplarınız veriye yazılır ve hafta yerleşir.')
              : t('Otomatik dizme bu haftayı bulamadı; ikinci arama buldu ve denetledi.')}
          </span>
          <button
            className="btn"
            aria-pressed={preview?.family === as.family}
            onClick={() =>
              onPreview(preview?.family === as.family ? null : { family: as.family, show: 'after' })
            }
          >
            {t('Izgarada göster')}
          </button>
          <button ref={first} className="btn primary" disabled={stale} onClick={() => onApply(as)}>
            {as.relaid ? t('Programı baştan yerleştir') : t('Programı yerleştir')}
          </button>
          <button className="btn" onClick={onClose}>
            {t('Kapat')}
          </button>
        </div>
        {answerLine}
        {staleNote}
      </section>
    );
  }

  // One row per way, in the fixed order; two ways that ask for the same thing
  // are one row, in the first one's place, and a hand-over way outdone by the
  // other on both counts is not shown.
  const rows: Array<{ family: RelaxFamily; found: Suggestion | null }> = [];
  const finished = new Set(progress?.finished ?? []);
  for (const family of FAMILY_ORDER) {
    const found = suggestions.find((s) => s.family === family) ?? null;
    if (found !== null) {
      if (rows.some((r) => r.found !== null && sameChanges(r.found, found))) continue;
      if (suggestions.some((s) => s !== found && outdone(found, s))) continue;
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
            : stopped
              ? rows.length === 0
                ? t('Arama durduruldu; o ana kadar bir yol bulunmamıştı.')
                : t('Arama durduruldu. Bulunan yollar geçerli, ama daha küçükleri olabilir.')
              : rows.length === 0
                ? t('Sınıfların saatlerine dokunmadan bir yol bulunamadı.')
                : t(
                    'Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.',
                  )}
        </span>
        {suggestions.some((x) => x.relaid) && (
          <span className="hint inline">
            {t(
              'Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.',
            )}
          </span>
        )}
        {stopped && (
          <button className="btn" onClick={onResume}>
            {t('Aramayı sürdür')}
          </button>
        )}
        <button className="btn suggestion-close" onClick={onClose}>
          {t('Kapat')}
        </button>
      </div>
      {answerLine}
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
            const previewed = preview?.family === family;
            return (
              <li key={family} data-family={family} className={previewed ? 'previewed' : undefined}>
                <div className="suggestion-row">
                  <span className="suggestion-title">
                    {suggestionSentence(state, found)}
                    {searching && !finished.has(family) && (
                      <span className="hint inline"> {t('(daha iyisi aranıyor)')}</span>
                    )}
                    {stopped && !finished.has(family) && (
                      <span className="hint inline"> {t('(inceltilmedi)')}</span>
                    )}
                  </span>
                  <button
                    className="btn"
                    aria-pressed={previewed}
                    onClick={() => onPreview(previewed ? null : { family, show: 'after' })}
                  >
                    {t('Izgarada göster')}
                  </button>
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
                    {shown ? t('Soruları gizle') : t('Sorular')}
                  </button>
                </div>
                {shown && (
                  <div id={detailId} className="suggestion-detail">
                    <p className="hint">{wayName(t, family)}</p>
                    <AnswerBook
                      found={found}
                      state={state}
                      unfinished={stopped && !finished.has(family)}
                      onAnswer={onAnswer}
                      onPrint={setPrinting}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {staleNote}
      {printing !== null && <QuestionSheet state={state} found={printing} />}
    </section>
  );
}
