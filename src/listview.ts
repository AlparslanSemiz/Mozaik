/**
 * Searching, sorting and filtering a list — the part that is not React.
 *
 * The reader asked for it twice, in their own words: "listeleri kaydırabilelim
 * ya da grupça filtreleyebilelim" and "öğretmenler listesinde sıralama ...
 * branşa göre, isme göre vesaire". With 25 teachers, 20 classes and 99
 * lessons, finding one row means reading the whole column.
 *
 * Pure and on its own so it can be tested without a DOM, and because Turkish
 * text comparison is exactly the kind of thing that looks right until it is
 * not: `'İstanbul'.toLowerCase()` is `'i̇stanbul'` in the default locale — an
 * `i` followed by a COMBINING DOT — so a search for "istanbul" misses it.
 * Everything here goes through `fold()`.
 */

/**
 * Case- and accent-folded, Turkish-aware.
 *
 * `toLocaleLowerCase('tr')` gets İ→i and I→ı right, which the default locale
 * does not. The second pass then flattens the six letters a Turkish keyboard
 * makes optional in practice: somebody typing quickly writes "ogretmen" and
 * means "öğretmen", and a search box that refuses that is a search box nobody
 * uses twice.
 */
export function fold(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/** Turkish alphabetical order: ç after c, ğ after g, ı before i, ş after s. */
export function compareTr(a: string, b: string): number {
  return a.localeCompare(b, 'tr');
}

/** A number, then a name as the tie-break — the shape most of these take. */
export function byNumberThen<T>(
  value: (x: T) => number,
  name: (x: T) => string,
  direction: 'asc' | 'desc' = 'desc',
): (a: T, b: T) => number {
  return (a, b) => {
    const diff = direction === 'desc' ? value(b) - value(a) : value(a) - value(b);
    return diff !== 0 ? diff : compareTr(name(a), name(b));
  };
}

export interface Sorter<T> {
  id: string;
  label: string;
  cmp: (a: T, b: T) => number;
}

export interface Facet<T> {
  /** The group this row belongs to, or '' for "belongs to no group". */
  of: (item: T) => string;
  /** What the chip row is called. */
  label: string;
}

export interface ListConfig<T> {
  /** Everything a search should look at, joined. */
  haystack: (item: T) => string;
  sorts: Array<Sorter<T>>;
  facet?: Facet<T>;
}

export interface ListQuery {
  text: string;
  /** '' means the list's own order — which for these lists is entry order. */
  sortId: string;
  /** '' means every group. */
  facet: string;
}

export const EMPTY_QUERY: ListQuery = { text: '', sortId: '', facet: '' };

/**
 * The visible rows.
 *
 * Order of operations matters and is deliberate: filter, then search, then
 * sort. Sorting first would be work thrown away, and — more importantly —
 * the facet counts below are taken from the SEARCHED set, so that a chip
 * saying "Matematik 3" while the search shows one row cannot happen.
 */
export function applyList<T>(items: T[], query: ListQuery, cfg: ListConfig<T>): T[] {
  let rows = items;

  if (query.facet !== '' && cfg.facet !== undefined) {
    const want = cfg.facet.of;
    rows = rows.filter((x) => want(x) === query.facet);
  }

  const needle = fold(query.text.trim());
  if (needle !== '') {
    // Every word has to appear somewhere, in any order: "mat mehmet" finds the
    // maths teacher called Mehmet without caring which column each word is in.
    const words = needle.split(/\s+/);
    rows = rows.filter((x) => {
      const hay = fold(cfg.haystack(x));
      return words.every((w) => hay.includes(w));
    });
  }

  const sorter = cfg.sorts.find((s) => s.id === query.sortId);
  // Copied before sorting: `items` is state, and sorting in place would mutate
  // the array React is holding.
  return sorter === undefined ? rows : [...rows].sort(sorter.cmp);
}

export interface FacetCount {
  value: string;
  count: number;
}

/**
 * The groups worth offering, with how many rows each holds — counted AFTER the
 * search and never after the facet itself, or choosing a chip would leave
 * every other chip reading 0.
 */
export function facetCounts<T>(items: T[], query: ListQuery, cfg: ListConfig<T>): FacetCount[] {
  if (cfg.facet === undefined) return [];
  const searched = applyList(items, { ...query, facet: '' }, cfg);
  const counts = new Map<string, number>();
  for (const x of searched) {
    const key = cfg.facet.of(x);
    if (key === '') continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => compareTr(a.value, b.value));
}
