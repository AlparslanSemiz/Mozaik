/**
 * The strip above a list: search, sort, and the group chips.
 *
 * One component for all four Kurulum lists, because they ask the same three
 * questions and answering them four different ways is how a program stops
 * feeling like one program. All of the actual work is in `src/listview.ts` —
 * this draws controls and reports what was chosen.
 */
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search, X } from 'lucide-react';
import { canReorder, facetCounts, isFiltering } from '../listview';
import type { ListConfig, ListQuery } from '../listview';
import { T, useT } from './T';

interface Props<T> {
  items: T[];
  query: ListQuery;
  setQuery: (next: ListQuery) => void;
  config: ListConfig<T>;
  /** How many rows are showing, for the "3 / 25" line. */
  shown: number;
  /** "öğretmen", "sınıf" — what the count is counting. */
  noun: string;
  /**
   * What just happened to the order, said out loud. Keyboard reordering moves a
   * row somewhere the eye is not necessarily following, and the handle's own
   * label changing is not something a screen reader reliably announces.
   */
  notice?: string;
}


export default function ListTools<T>({
  items,
  query,
  setQuery,
  config,
  shown,
  noun,
  notice = '',
}: Props<T>) {
  const t = useT();
  const filtering = isFiltering(query);
  const facets = config.facets ?? [];

  return (
    <div className="list-tools">
      <div className="list-tools-row">
        <div className="search">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <input
            type="text"
            className="search-box"
            value={query.text}
            aria-label={t('{ne} ara', { ne: t(noun) })}
            placeholder={t('Ara…')}
            onChange={(e) => setQuery({ ...query, text: e.target.value })}
          />
          {query.text !== '' && (
            <button
              className="search-clear"
              aria-label={t('Aramayı temizle')}
              onClick={() => setQuery({ ...query, text: '' })}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <label className="field">
          <span className="field-label">{t('Sırala')}</span>
          {/* Not `.text-sm`: "Ders yüküne göre (çok → az)" is the longest label
              in the app and a 16ch box showed "Girildiği s". A select that
              hides which sort is active is a select nobody trusts. */}
          <select
            className="sort-pick"
            value={query.sortId}
            // Choosing a NEW sort starts it the way its own label reads:
            // "Ders yüküne göre (çok → az)" that opened reversed would be a
            // menu whose entries do not describe what they do.
            onChange={(e) => setQuery({ ...query, sortId: e.target.value, desc: false })}
          >
            {/* Entry order is a real answer and the DEFAULT one: it is the
                order they were typed in, which is the order the reader
                remembers them in — and, since the rows can be dragged, the
                order they were last PUT in. */}
            <option value="">{t('Girildiği sıra')}</option>
            {config.sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* "sıralamanın yanına aşağı ya da yukarı diye ayrı bir tuş koyalım ki
            o filtreye göre aşağı ya da yukarı olsun." Beside the menu and not
            in it, so five options stay five.

            Disabled with no sort chosen rather than hidden: a control that
            appears and disappears beside a menu moves the menu, and there is
            nothing to reverse in "Girildiği sıra" — that order is the list
            itself, and turning it upside down is what the drag handles are
            for. Its NAME says what pressing it will do, not what is currently
            true, because that is the question a reader asks of a button. */}
        <button
          className="btn"
          disabled={query.sortId === ''}
          aria-label={query.desc ? t('Artan sıraya al') : t('Azalan sıraya al')}
          title={
            query.sortId === ''
              ? t('Önce bir sıralama seçin')
              : query.desc
                ? t('Şu an tersten sıralı. Düz sıraya almak için tıklayın')
                : t('Şu an düz sıralı. Tersten sıralamak için tıklayın')
          }
          onClick={() => setQuery({ ...query, desc: !query.desc })}
        >
          {query.desc ? (
            <ArrowUpNarrowWide size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <ArrowDownWideNarrow size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>

        <span className="spacer" />

        {/* What the last keypress did to the order. It lives ON this row, not
            under it: as its own line it was an EMPTY line almost always and
            still held `min-height: 1.2em` open — most of the 44 px measured
            between the strip and the table. Here it costs nothing when empty,
            and it goes BEFORE the count so the count keeps its place at the
            right edge either way.

            Its class is `.list-said`, NOT `.list-note` — the note below is
            found by `.list-tools .list-note` and this element now comes FIRST
            in the DOM, so sharing the class would silently hand that selector
            a different element (pitfall 49). */}
        <span className="list-said" role="status" aria-live="polite">
          {notice}
        </span>

        <span className="list-count" aria-live="polite">
          {filtering ? (
            <T k="**{gorunen}** / {toplam} {ne}" vars={{ gorunen: shown, toplam: items.length, ne: t(noun) }} />
          ) : (
            t('{toplam} {ne}', { toplam: items.length, ne: t(noun) })
          )}
        </span>

        {filtering && (
          <button
            className="btn"
            onClick={() => setQuery({ ...query, text: '', facets: {} })}
          >{t('Süzmeyi kaldır')}</button>
        )}
      </div>

      {/* One chip row per axis. Each is its own `role="group"` with its own
          name, so "Branş" and "Öğretmen" cannot be read as one long row.

          CHIPS AT EVERY COUNT, and that is a measurement rather than a
          preference. A dropdown fallback was written here for "too many
          groups" and then the groups were measured, on the sample school, in
          the box they actually live in:

            110 %   12 branş · 25 öğretmen · 20 sınıf   all ONE line, 28 px
            150 %   the same three                      all ~2 lines, 81 px

          The chips are short forms — "MÇ 4", "510 6" — so the count barely
          moves the row. There was no cliff to fall off, and the fallback's only
          real effect was to turn the one filter the reader already uses into a
          box that hides its own numbers. */}
      {facets.map((facet) => {
        const counts = facetCounts(items, query, config, facet.id);
        if (counts.length < 2) return null;
        const chosen = query.facets[facet.id] ?? '';
        const pick = (value: string) =>
          setQuery({ ...query, facets: { ...query.facets, [facet.id]: value } });

        return (
          <div className="chips" key={facet.id} role="group" aria-label={facet.label}>
            {counts.map((f) => (
              <button
                key={f.value}
                className="chip"
                aria-pressed={chosen === f.value}
                onClick={() => pick(chosen === f.value ? '' : f.value)}
              >
                {f.value}
                <span className="chip-count">{f.count}</span>
              </button>
            ))}
          </div>
        );
      })}

      {/* Why the drag handles have gone quiet. It lives here rather than in the
          panel because it is a fact about the strip's own controls — and
          because `.list-tools` is not one of the panel's counted children. */}
      {!canReorder(query) && (
        <p className="list-note">
          <T k="Satırları elle sıralamak için **Sırala**’yı «Girildiği sıra»ya alın ve süzmeyi kaldırın." />
        </p>
      )}
    </div>
  );
}
