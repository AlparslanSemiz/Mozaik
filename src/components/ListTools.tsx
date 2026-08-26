/**
 * The strip above a list: search, sort, and the group chips.
 *
 * One component for all four Kurulum lists, because they ask the same three
 * questions and answering them four different ways is how a program stops
 * feeling like one program. All of the actual work is in `src/listview.ts` —
 * this draws controls and reports what was chosen.
 */
import { Search, X } from 'lucide-react';
import { facetCounts } from '../listview';
import type { ListConfig, ListQuery } from '../listview';

interface Props<T> {
  items: T[];
  query: ListQuery;
  setQuery: (next: ListQuery) => void;
  config: ListConfig<T>;
  /** How many rows are showing, for the "3 / 25" line. */
  shown: number;
  /** "öğretmen", "sınıf" — what the count is counting. */
  noun: string;
}

export default function ListTools<T>({
  items,
  query,
  setQuery,
  config,
  shown,
  noun,
}: Props<T>) {
  const facets = facetCounts(items, query, config);
  const filtering = query.text.trim() !== '' || query.facet !== '';

  return (
    <div className="list-tools">
      <div className="list-tools-row">
        <div className="search">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <input
            type="text"
            className="search-box"
            value={query.text}
            aria-label={`${noun} ara`}
            placeholder="Ara…"
            onChange={(e) => setQuery({ ...query, text: e.target.value })}
          />
          {query.text !== '' && (
            <button
              className="search-clear"
              aria-label="Aramayı temizle"
              onClick={() => setQuery({ ...query, text: '' })}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <label className="field">
          <span className="field-label">Sırala</span>
          {/* Not `.text-sm`: "Ders yüküne göre (çok → az)" is the longest label
              in the app and a 16ch box showed "Girildiği s". A select that
              hides which sort is active is a select nobody trusts. */}
          <select
            className="sort-pick"
            value={query.sortId}
            onChange={(e) => setQuery({ ...query, sortId: e.target.value })}
          >
            {/* Entry order is a real answer and the DEFAULT one: it is the
                order they were typed in, which is the order the reader
                remembers them in. */}
            <option value="">Girildiği sıra</option>
            {config.sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <span className="spacer" />

        <span className="list-count" aria-live="polite">
          {filtering ? (
            <>
              <b>{shown}</b> / {items.length} {noun}
            </>
          ) : (
            <>
              {items.length} {noun}
            </>
          )}
        </span>

        {filtering && (
          <button className="btn" onClick={() => setQuery({ ...query, text: '', facet: '' })}>
            Süzmeyi kaldır
          </button>
        )}
      </div>

      {facets.length > 1 && config.facet !== undefined && (
        <div className="chips" role="group" aria-label={config.facet.label}>
          {facets.map((f) => (
            <button
              key={f.value}
              className="chip"
              aria-pressed={query.facet === f.value}
              onClick={() =>
                setQuery({ ...query, facet: query.facet === f.value ? '' : f.value })
              }
            >
              {f.value}
              <span className="chip-count">{f.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
