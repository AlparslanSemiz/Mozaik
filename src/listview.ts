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
  /** Which chip row this is, and the key the choice is stored under. */
  id: string;
  /**
   * The group(s) this row belongs to, or '' / [] for "belongs to no group".
   *
   * A LIST and not just a string, because one row can honestly be in two
   * groups: a teacher who holds both Türkçe and Edebiyat belongs under either
   * chip, and picking one has to find them. Single-value facets keep returning
   * a plain string and nothing about them changes.
   */
  of: (item: T) => string | string[];
  /** What the chip row is called. */
  label: string;
}

/** One facet's answer for one row, always as a list and never with blanks. */
function groupsOf<T>(facet: Facet<T>, item: T): string[] {
  const answer = facet.of(item);
  return (typeof answer === 'string' ? [answer] : answer).filter((x) => x !== '');
}

export interface ListConfig<T> {
  /** Everything a search should look at, joined. */
  haystack: (item: T) => string;
  sorts: Array<Sorter<T>>;
  /**
   * A list may be grouped along more than one axis — teachers by subject AND
   * by gender — and the two narrow together rather than replacing each other.
   */
  facets?: Array<Facet<T>>;
}

export interface ListQuery {
  text: string;
  /** '' means the list's own order — which for these lists is entry order. */
  sortId: string;
  /**
   * Read the chosen sort backwards.
   *
   * A separate switch and not a second entry in `sorts`, which is what doubling
   * the menu would have cost: "Ada göre" and "Ada göre (Z→A)" is ten options
   * where there were five, and the reader asked for the other shape by name —
   * "sıralamanın yanına aşağı ya da yukarı diye ayrı bir tuş koyalım ki O
   * FİLTREYE GÖRE aşağı ya da yukarı olsun". It also composes: a sorter that
   * already reads high-to-low simply reads low-to-high here.
   *
   * Means nothing while `sortId` is '' — there is no chosen order to reverse —
   * and the control that sets it is disabled there rather than lying.
   */
  desc: boolean;
  /** facet id -> chosen value. A missing or '' entry means every group. */
  facets: Record<string, string>;
}

export const EMPTY_QUERY: ListQuery = { text: '', sortId: '', desc: false, facets: {} };

/** Is anything narrowing the list right now? */
export function isFiltering(query: ListQuery): boolean {
  return (
    query.text.trim() !== '' ||
    Object.values(query.facets).some((value) => value !== '')
  );
}

/**
 * May the reader drag rows into their own order right now?
 *
 * Only when the visible rows ARE the underlying list: a drag writes an index
 * into `state`, and under a sort or a filter the row in position 3 on screen is
 * not the item in position 3 of the array. Rather than guess what "move this
 * one up" means when two thirds of the list is hidden, the handle goes quiet.
 */
export function canReorder(query: ListQuery): boolean {
  return query.sortId === '' && !isFiltering(query);
}

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

  // Every chosen facet narrows: picking "Matematik" and "Kadın" asks for the
  // rows that are both, not the rows that are either.
  for (const facet of cfg.facets ?? []) {
    const want = query.facets[facet.id] ?? '';
    if (want === '') continue;
    rows = rows.filter((x) => groupsOf(facet, x).includes(want));
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
  if (sorter === undefined) return rows;
  // Copied before sorting: `items` is state, and sorting in place would mutate
  // the array React is holding.
  // NEGATED rather than sorted-then-reversed, and the difference shows on ties.
  // Array.prototype.sort is stable, so a negated comparator flips the groups
  // and leaves rows the sorter called EQUAL in their original order; a
  // `.reverse()` would flip those too, and two teachers with the same load
  // would swap places for a reason the reader cannot see.
  const cmp = query.desc ? (a: T, b: T) => -sorter.cmp(a, b) : sorter.cmp;
  return [...rows].sort(cmp);
}

export interface FacetCount {
  value: string;
  count: number;
}

/**
 * The groups ONE chip row should offer, with how many rows each holds.
 *
 * Counted after the search and after every OTHER facet, but never after this
 * one: clearing its own choice is what keeps the row a way back rather than a
 * dead end, and applying the others is what stops a "Kadın 11" chip appearing
 * over a list already narrowed to three maths teachers.
 */
export function facetCounts<T>(
  items: T[],
  query: ListQuery,
  cfg: ListConfig<T>,
  facetId: string,
): FacetCount[] {
  const facet = (cfg.facets ?? []).find((f) => f.id === facetId);
  if (facet === undefined) return [];
  const others = { ...query.facets, [facetId]: '' };
  const searched = applyList(items, { ...query, facets: others }, cfg);
  const counts = new Map<string, number>();
  for (const x of searched) {
    // A row in two groups is counted under BOTH — the chips are a way in, not
    // a partition, and their numbers therefore need not add up to the list.
    for (const key of groupsOf(facet, x)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => compareTr(a.value, b.value));
}
