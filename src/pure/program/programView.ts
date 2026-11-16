// What the Program screen draws, worked out from the state: the grid's rows
// and a suggestion's marks on them, the tray and its headings, and the line
// under the toolbar. Nothing here knows React or the DOM.
//
// Moved out of `ui/program/Program.tsx` without a change to what it computes
// (TODO §8k, RF8); `src/ui/program/programScreen.test.tsx` pins the drawing it feeds, and
// `src/pure/program/programView.test.ts` asks it directly. The component still decides WHEN
// each of these runs: the rows and the tray are memoised there, because the
// grid's memo boundary is the identity of `rows` (pitfall 10).
//
// In `pure/program/` since 2026-10-24. It stood at
// the pure layer's root until then: this file reads `constraints.ts` and
// `entities.ts`, both of those read the timetable variants, and the variants
// lived here. They are `pure/grid/` now, so one index no longer closes a cycle.

import {
  blockAt,
  blockPinned,
  buildIndex,
  closedConflicts,
  closedKey,
  evictionNotice,
  pendingBlocks,
  allPinCells,
  placedBlocks,
  placementKey,
  swapDoneNotice,
  type BlockRef,
  type DropVerdict,
  type Index,
} from '../constraints';
import {
  lessonSubject,
  subjectKey,
  subjectLabel,
  subjectShort,
  surname,
  teacherSubjects,
} from '../entities';
import { compareTr } from '../listview';
import { activePinned, activePlacements } from '../grid';
import type { SuggestionDiff } from '../relax';
import type { SolverProgress, SolverResult } from '../solver';
import type { Vars } from '../../leaf/i18n';
import { type Id, type Lesson, type PoolSort, type State, type View } from '../../leaf/model';

/** The `t()` the screen hands down, so a language switch rebuilds what it reads. */
type Translate = (key: string, vars?: Vars) => string;

/**
 * The palette index of a lesson's card. A function rather than the colour
 * mode itself: the mode is a machine preference (`platform/prefs`), and this
 * layer does not reach up for it.
 */
export type ColorOf = (d: State, lesson: Lesson) => number;

// ------------------------------------------------------------------ the grid

export interface GridCell {
  lessonId: Id;
  top: string; // class name ("510") or teacher short form
  /** The teacher's surname, drawn instead of `top` where the cell has room for it. */
  full?: string;
  bottom: string; // room letter ("A") or subject
  color: number;
  /** Does the block continue into the next hour — then no separator is drawn. */
  continues: boolean;
  /** The hour has since been closed for this teacher, class or room. */
  conflict: string | null;
  /**
   * The reader has locked this block in place: it survives "Yeniden yap", it
   * cannot be dragged, removed or dropped on. Drawn with a mark and not only
   * with a colour — colour alone never carries state here.
   */
  pinned: boolean;
  /**
   * Only in a suggestion's preview (TODO B5.11): taught in a teacher hour the
   * way opens (a thick line, a hatch and a "+"), or new in this cell (a thin
   * dashed line). Both are said in the label too, never by colour alone.
   */
  mark?: 'opened' | 'moved' | undefined;
}

export interface GridRow {
  id: string;
  /** Which list the row's id belongs to — the inspector needs to know. */
  kind: 'teacher' | 'class';
  name: string;
  secondary: string;
  /** Palette index of the row's OWN entity: the teacher, or the class. */
  color: number;
  /** Length = days x hours. Index = day * hourCount + hour. */
  cells: Array<GridCell | null>;
  /** Hours the teacher cannot come. Always false in the class view. */
  closed: boolean[];
}

export function buildRows(
  d: State,
  ix: Index,
  view: View,
  colorOf: ColorOf,
  t: Translate,
): GridRow[] {
  // Availability is edited after the timetable is laid out, and a cell whose
  // hour has since been closed used to look perfectly normal: the hatch is only
  // drawn on EMPTY cells, so the card simply covered it up.
  const conflicts = new Map<string, string>();
  for (const c of closedConflicts(d, ix)) {
    conflicts.set(placementKey(c.classId, c.day, c.hour), c.reason);
  }

  // Where every block BEGINS. `continues` used to be plain adjacency — "is the
  // next cell the same lesson" — which was the same thing while a lesson had
  // one block length. It is not any more: 2+1 sitting on one day is three
  // adjacent cells of one lesson and reads as a single three-hour block unless
  // the boundary is asked for. Same reading as everything else (see the
  // contract in constraints.ts), so the line the eye sees is the line a
  // right-click cuts along.
  const heads = new Set<string>();
  for (const lesson of d.lessons) {
    for (const b of placedBlocks(d, lesson)) {
      heads.add(placementKey(lesson.classId, b.day, b.hour));
    }
  }
  const placements = activePlacements(d);
  const pinned = activePinned(d);
  const continuesAt = (classId: Id, day: number, hour: number, lessonId: Id): boolean =>
    placements[placementKey(classId, day, hour + 1)] === lessonId &&
    !heads.has(placementKey(classId, day, hour + 1));

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const n = dayCount * hourCount;

  if (view === 'teacher') {
    return d.teachers.map((teacher) => {
      const cells: Array<GridCell | null> = new Array(n).fill(null);
      const closed: boolean[] = new Array(n).fill(false);

      for (let g = 0; g < dayCount; g++) {
        for (let s = 0; s < hourCount; s++) {
          const i = g * hourCount + s;
          closed[i] = d.unavailable[closedKey(teacher.id, g, s)] !== undefined;

          const lessonId = ix.teacherBusy.get(closedKey(teacher.id, g, s));
          if (lessonId === undefined) continue;
          const lesson = ix.lessonById.get(lessonId);
          const group = ix.classById.get(lesson?.classId ?? '');
          cells[i] = {
            lessonId,
            top: group?.name ?? '?',
            bottom: roomLetter(ix, group?.roomId),
            color: lesson === undefined ? teacher.color : colorOf(d, lesson),
            conflict: conflicts.get(placementKey(group?.id ?? '', g, s)) ?? null,
            pinned: pinned[placementKey(group?.id ?? '', g, s)] !== undefined,
            continues:
              s + 1 < hourCount && group !== undefined && continuesAt(group.id, g, s, lessonId),
          };
        }
      }
      // The surname where the head has room for it, the short form under it:
      // "MÇ" alone was a code the father had to decode (walkthrough, 2026-11-16).
      const last = surname(teacher.name);
      const named = last !== '' && last !== teacher.short && [...last].length <= 10;
      return {
        id: teacher.id,
        kind: 'teacher' as const,
        name: named ? last : teacher.short,
        // Both, because this line IS the teacher — the cells in the row each
        // name the one subject their own lesson is taught under.
        //
        // SHORT, not the full name. This line sits in a column narrow enough
        // that "Matematik" was being cut to "Matemat…" and a pair of subjects
        // never showed the second one at all; the cells of the grid have read
        // the short form all along, so the row head now says what its own row
        // says. `subjectShort` is the one place that resolves it.
        secondary: [
          ...(named ? [teacher.short] : []),
          ...teacherSubjects(teacher).map((name) => subjectShort(d.settings, name)),
        ].join(' · '),
        color: teacher.color,
        cells,
        closed,
      };
    });
  }

  // A surname two teachers share would name neither: those cells keep the short form.
  const seen = new Set<string>();
  const shared = new Set<string>();
  for (const x of d.teachers) {
    const last = surname(x.name);
    (seen.has(last) ? shared : seen).add(last);
  }
  return d.classes.map((group) => {
    const cells: Array<GridCell | null> = new Array(n).fill(null);
    const closed: boolean[] = new Array(n).fill(false);

    for (let g = 0; g < dayCount; g++) {
      for (let s = 0; s < hourCount; s++) {
        const i = g * hourCount + s;
        closed[i] =
          d.unavailable[closedKey(group.id, g, s)] !== undefined ||
          (group.roomId != null && d.unavailable[closedKey(group.roomId, g, s)] !== undefined);

        const lessonId = placements[placementKey(group.id, g, s)];
        if (lessonId === undefined) continue;
        const lesson = ix.lessonById.get(lessonId);
        const teacher = ix.teacherById.get(lesson?.teacherId ?? '');
        cells[i] = {
          lessonId,
          top: teacher?.short ?? '?',
          full: shared.has(surname(teacher?.name ?? '')) ? '' : surname(teacher?.name ?? ''),
          // The LESSON's subject, not the teacher's first one: a teacher who
          // holds two is in this class for exactly one of them.
          bottom: lesson === undefined ? '' : subjectShort(d.settings, lessonSubject(d, lesson)),
          color: lesson === undefined ? (teacher?.color ?? 0) : colorOf(d, lesson),
          conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
          pinned: pinned[placementKey(group.id, g, s)] !== undefined,
          continues: s + 1 < hourCount && continuesAt(group.id, g, s, lessonId),
        };
      }
    }
    const letter = roomLetter(ix, group.roomId);
    return {
      id: group.id,
      kind: 'class' as const,
      name: group.name,
      secondary: letter === '' ? t('derslik yok') : t('{ad} dersliği', { ad: letter }),
      color: group.color,
      cells,
      closed,
    };
  });
}

function sameCell(a: GridCell | null, b: GridCell | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return (
    a.lessonId === b.lessonId &&
    a.top === b.top &&
    a.full === b.full &&
    a.bottom === b.bottom &&
    a.color === b.color &&
    a.continues === b.continues &&
    a.conflict === b.conflict &&
    a.pinned === b.pinned &&
    a.mark === b.mark
  );
}

function sameRow(a: GridRow, b: GridRow): boolean {
  if (
    a.id !== b.id ||
    a.kind !== b.kind ||
    a.name !== b.name ||
    a.secondary !== b.secondary ||
    a.color !== b.color ||
    a.cells.length !== b.cells.length ||
    a.closed.length !== b.closed.length
  ) {
    return false;
  }
  for (let i = 0; i < a.cells.length; i++) {
    if (!sameCell(a.cells[i] ?? null, b.cells[i] ?? null)) return false;
  }
  for (let i = 0; i < a.closed.length; i++) {
    if (a.closed[i] !== b.closed[i]) return false;
  }
  return true;
}

/**
 * `next`, with every row that draws exactly as before replaced by the row
 * object it was last time — and `prev` itself if nothing changed at all.
 *
 * `buildRows` makes every row new, and the grid's rows are memoised on their
 * identity (pitfall 10): without this one drop redrew all of them, ~2100
 * cells, and on the weak machine that was most of a quarter-second freeze.
 * Comparing is a few thousand field reads; drawing a row is 84 cells.
 */
export function keepSameRows(prev: GridRow[] | null, next: GridRow[]): GridRow[] {
  if (prev === null) return next;
  const before = new Map(prev.map((row) => [row.id, row]));
  let changed = prev.length !== next.length;
  const out = next.map((row, i) => {
    const old = before.get(row.id);
    if (old !== undefined && sameRow(old, row)) {
      if (prev[i] !== old) changed = true;
      return old;
    }
    changed = true;
    return row;
  });
  return changed ? out : prev;
}

/**
 * The preview's marks (TODO B5.11): on the week a way would make, the teacher
 * hours it opens and the cells whose lesson is new there. Opened wins where a
 * cell is both, because that is the question the father has to ask.
 */
export function markPreview(
  rows: GridRow[],
  d: State,
  diff: SuggestionDiff,
  view: View,
): GridRow[] {
  const ix = buildIndex(d);
  const hourCount = d.settings.hours.length;
  return rows.map((row) => ({
    ...row,
    cells: row.cells.map((cell, i) => {
      if (cell === null) return cell;
      const day = Math.floor(i / hourCount);
      const hour = i % hourCount;
      const lesson = ix.lessonById.get(cell.lessonId);
      const teacherId = view === 'teacher' ? row.id : lesson?.teacherId;
      const classId = view === 'class' ? row.id : lesson?.classId;
      if (teacherId !== undefined && diff.opened.has(closedKey(teacherId, day, hour)))
        return { ...cell, mark: 'opened' as const };
      if (classId !== undefined && diff.moved.has(placementKey(classId, day, hour)))
        return { ...cell, mark: 'moved' as const };
      return cell;
    }),
  }));
}

export function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return '';
  return ix.roomById.get(roomId)?.name ?? '';
}

// ------------------------------------------------------------------ the tray

export interface PoolCard {
  /** React identity: one lesson can put several cards on the tray. */
  key: string;
  lessonId: Id;
  /** How many hours THIS card covers when it lands: 1, 2 or 3. */
  size: number;
  /** What the cell will read: the class, or the teacher — whichever the view is not. */
  top: string;
  /** The row this card is aimed at, as printed on the card. */
  bottom: string;
  /** That row's POSITION in the grid. What the cards are sorted by, so the
      tray runs the same way down as the rows the cards belong to. */
  row: number;
  subject: string;
  color: number;
  placed: number;
  total: number;
  /** The heading this card stands under. Derived from the chosen order in
      `buildPool`, so the tray SHOWS what the setting did. */
  group: string;
}

/**
 * The pool follows the VIEW, and used to not: in the class view the cards still
 * read class-on-top, teacher-below and were still sorted by teacher, so the
 * cards belonging to one visible row were scattered across the whole pool —
 * while the drag ghost lifting off them already said something else.
 *
 * One rule, no special cases:
 *   top    = whatever the CELL will read once it lands
 *   bottom = the ROW the card is aimed at
 *   sorted by the row's POSITION, so one row's cards stand together and the
 *     tray runs the same way down as the grid does
 *
 * That last part used to be alphabetical, which was the same thing back when
 * the only order was the one they were typed in. Now the rows can be dragged,
 * and an alphabetical tray under a hand-ordered grid means hunting upward for
 * the cards of the row you are looking at.
 */
export function buildPool(
  d: State,
  ix: Index,
  view: View,
  sort: PoolSort,
  filter: string,
  colorOf: ColorOf,
  t: Translate,
): { cards: PoolCard[]; completed: number; total: number } {
  const cards: PoolCard[] = [];
  let completed = 0;
  let total = 0;
  const teacherView = view === 'teacher';
  const rowAt = new Map<string, number>(
    (teacherView ? d.teachers : d.classes).map((x, i) => [x.id, i]),
  );

  for (const lesson of d.lessons) {
    // ONE CARD PER BLOCK, not per lesson. A 2+1 lesson is a two-hour card and a
    // one-hour card, and which of them is picked up decides how many cells the
    // drop covers — so the choice has to be a thing on the tray, not a hidden
    // "whichever is next". Asked for by name; it is also what aSc's tray does.
    const owed = pendingBlocks(d, lesson);
    if (owed.length === 0) {
      completed++;
      continue;
    }
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    const className = group?.name ?? '?';
    const teacherShort = teacher?.short ?? '?';
    const subject = lessonSubject(d, lesson);
    total += owed.reduce((a, b) => a + b, 0);
    // The filter narrows by BRANCH, and it is applied after `total` so the
    // head can say "12 / 99" rather than pretending the rest went away.
    if (filter !== '' && subjectKey(subject) !== filter) continue;
    for (const [i, size] of owed.entries()) {
      cards.push({
        // Identity has to include WHICH of the lesson's cards this is, or React
        // reuses one node for two of them and the tray stops matching the data.
        key: `${lesson.id}#${size}#${i}`,
        lessonId: lesson.id,
        size,
        row: rowAt.get(teacherView ? lesson.teacherId : lesson.classId) ?? Number.MAX_SAFE_INTEGER,
        top: teacherView ? className : teacherShort,
        bottom: teacherView ? teacherShort : className,
        subject: subjectLabel(subject),
        color: colorOf(d, lesson),
        placed,
        total: lesson.weeklyHours,
        group: '',
      });
    }
  }

  cards.sort(poolOrder(sort));
  for (const card of cards) card.group = poolGroup(card, sort, t);
  return { cards, completed, total };
}

/**
 * The five orders, and the LAST TWO KEYS OF EVERY ONE OF THEM ARE THE SAME.
 *
 * `stackCards()` in `ui/program/LessonPool.tsx` reads consecutive runs:
 * identical blocks of one lesson are drawn as a deck because the tray hands
 * them over already neighbours. Any order that lets a lesson's own cards drift
 * apart silently turns one deck into several, and forty tests count
 * `.pool-card` rather than decks, so nothing would say so. Hence `lessonId`
 * then `size` at the end of each comparator, every time.
 *
 * What the tail does and does not do, measured (2026-10-10, RF8): a deck's
 * cards are identical, so they tie on every key, the tail included. What keeps
 * them together is that `buildPool` pushes the cards lesson by lesson and the
 * sort is stable. The tail fixes the order between lessons that tie on
 * everything else, and puts a lesson's bigger block before its smaller one.
 *
 * `compareTr` and not a bare `localeCompare('tr')`: the list screens already
 * have one home for Turkish collation and this is the same question.
 */
function poolOrder(sort: PoolSort): (a: PoolCard, b: PoolCard) => number {
  const tail = (a: PoolCard, b: PoolCard) => compareTr(a.lessonId, b.lessonId) || b.size - a.size;
  switch (sort) {
    case 'name':
      return (a, b) => compareTr(a.bottom, b.bottom) || compareTr(a.top, b.top) || tail(a, b);
    case 'subject':
      return (a, b) => compareTr(a.subject, b.subject) || a.row - b.row || tail(a, b);
    case 'size':
      return (a, b) => b.size - a.size || a.row - b.row || tail(a, b);
    case 'left':
      return (a, b) => b.total - b.placed - (a.total - a.placed) || a.row - b.row || tail(a, b);
    // The tray's own order since the rows became draggable: it runs the same
    // way down as the grid, so a row's cards stand under the row.
    case 'row':
    default:
      return (a, b) => a.row - b.row || compareTr(a.top, b.top) || tail(a, b);
  }
}

/**
 * What the heading over a run of cards says.
 *
 * Derived from the SORT rather than fixed, which is what makes the setting
 * visible: choosing "branşa göre" and getting the same nameless wall of
 * rectangles would be a setting that changed nothing you could see.
 */
function poolGroup(card: PoolCard, sort: PoolSort, t: Translate): string {
  switch (sort) {
    case 'subject':
      return card.subject;
    case 'size':
      return t('{n} saatlik dersler', { n: card.size });
    case 'left':
      return t('{n} saat kaldı', { n: card.total - card.placed });
    case 'name':
    case 'row':
    default:
      return card.bottom;
  }
}

/**
 * The branches with something still waiting — the only ones worth offering.
 *
 * Computed off the UNFILTERED lessons, so choosing "Matematik" does not
 * empty the list that chose it. Keyed by `subjectKey` because that is what
 * the filter compares, and labelled with what the rest of the screen calls
 * it.
 */
export function waitingSubjects(state: State): Array<[string, string]> {
  const seen = new Map<string, string>();
  for (const lesson of state.lessons) {
    if (pendingBlocks(state, lesson).length === 0) continue;
    const name = lessonSubject(state, lesson);
    const key = subjectKey(name);
    if (key !== '' && !seen.has(key)) seen.set(key, subjectLabel(name));
  }
  return [...seen.entries()].sort((a, b) => compareTr(a[1], b[1]));
}

/**
 * WHICH CLASS a grid cell belongs to.
 *
 * In the class view the row id already is one; in the teacher view the row is
 * a person and the cell's class has to be looked up through what they are
 * teaching at that hour. Every action the menu offers needs this — remove,
 * edit, pin — and it used to be written inside the remove handler, where the
 * next two would each have copied it.
 */
export function classOfCell(
  d: State,
  view: View,
  rowId: string,
  day: number,
  hour: number,
): Id | null {
  if (view === 'class') return rowId;
  const fresh = buildIndex(d);
  const lessonId = fresh.teacherBusy.get(closedKey(rowId, day, hour));
  return lessonId === undefined ? null : (fresh.lessonById.get(lessonId)?.classId ?? null);
}

// ------------------------------------------------------------------ dragging

/**
 * The sentence a drop leaves behind: the swap it made, or the lessons it sent
 * back to the pool, or nothing. Asked with the verdict read out of the drop map
 * BEFORE the change, because React runs a reducer callback late (pitfall 20).
 */
export function dropNotice(
  ix: Index,
  lessonId: Id,
  source: BlockRef | null,
  verdict: DropVerdict | undefined,
): string {
  const pushedOut = verdict?.evicts ?? [];
  const lesson = ix.lessonById.get(lessonId);
  return verdict?.action.kind === 'swap' && source !== null
    ? swapDoneNotice(ix, source, verdict.action.targets)
    : pushedOut.length === 0 || lesson === undefined
      ? ''
      : evictionNotice(
          ix,
          pushedOut.map((id) => ix.lessonById.get(id)).filter((x) => x !== undefined),
          true,
        );
}

// ------------------------------------------------------------------ the right-click menus

/**
 * What a right-click on the grid was about: a card. A heading opens nothing
 * since 2026-11-16 (Sadeleşme K7): its menu held only the bulk pins and the
 * temporary view, and both are gone.
 */
export interface MenuTarget {
  rowId: Id;
  day: number;
  hour: number;
}

/**
 * What the grid's right-click menu reads about its target, from the state it
 * acts on (the state can move under an open menu: an autosave, an undo, a run).
 */
export interface MenuFacts {
  at: MenuTarget | null;
  classId: Id | null;
  pinned: boolean;
  lessonId: Id | undefined;
  lesson: Lesson | undefined;
}

export function describeMenu(
  state: State,
  ix: Index,
  view: View,
  menuTarget: MenuTarget | null,
): MenuFacts {
  const menuAt = menuTarget;

  const menuClass =
    menuAt === null ? null : classOfCell(state, view, menuAt.rowId, menuAt.day, menuAt.hour);
  const menuPinned =
    menuAt !== null && menuClass !== null && blockPinned(state, menuClass, menuAt.day, menuAt.hour);
  const menuLessonId =
    menuAt === null || menuClass === null
      ? undefined
      : activePlacements(state)[
          placementKey(
            menuClass,
            menuAt.day,
            blockAt(state, menuClass, menuAt.day, menuAt.hour)?.hour ?? menuAt.hour,
          )
        ];
  const menuLesson = menuLessonId === undefined ? undefined : ix.lessonById.get(menuLessonId);
  return {
    at: menuAt,
    classId: menuClass,
    pinned: menuPinned,
    lessonId: menuLessonId,
    lesson: menuLesson,
  };
}

// ------------------------------------------------------------------ the tool strip

/** What the Program strip's buttons count and whether they are enabled. */
export interface StripCounts {
  /** "Programı yap"'s count: blocks still in the tray. */
  pending: number;
  /** Placed hours that are NOT pinned: what "Yeniden yap" and "Programı boşalt" take away. */
  placed: number;
  pinnedHours: number;
  /** The active grid holds no placement at all. */
  gridEmpty: boolean;
  /** Every placed cell is pinned, so the pin item offers to unpin them all. */
  allPinned: boolean;
}

export function describeStrip(state: State): StripCounts {
  const pending = state.lessons.reduce(
    (sum, lesson) => sum + pendingBlocks(state, lesson).length,
    0,
  );
  // What the two destructive buttons are ABOUT: the hours that would go.
  // Pinned hours are not among them — nothing takes a pinned block down but
  // unpinning it — so counting them would make both questions overstate what
  // they ask for, and the count is the whole reason they are asked.
  const placements = activePlacements(state);
  const pinned = activePinned(state);
  const pinnedHours = Object.keys(pinned).length;
  const placed = Object.keys(placements).length - pinnedHours;
  const pinCells = allPinCells(state);
  const allPinned = pinCells.length > 0 && pinCells.every((key) => pinned[key] !== undefined);
  return {
    pending,
    placed,
    pinnedHours,
    gridEmpty: Object.keys(placements).length === 0,
    allPinned,
  };
}

// ------------------------------------------------------------------ the line under the toolbar

/** "3,4" — one decimal, Turkish comma. */
function seconds(ms: number): string {
  return (ms / 1000).toFixed(1).replace('.', ',');
}

/**
 * What the line under the toolbar reads of the automatic run. `SolverRun`
 * (platform/search) is one of these; this layer names only the parts it reads.
 */
export interface BarRun {
  running: boolean;
  progress: SolverProgress | null;
  result: SolverResult | null;
  applied: unknown;
}

/**
 * The single line under the toolbar. Returns the text and the class that
 * colours it: '' plain, 'warn' yellow, 'bad' red, 'ok' green.
 *
 * `text` is what the line ANNOUNCES (it sits in a live region) and `counter`
 * is what it only shows. They are apart because the run's counter changes
 * many times a second: in the live region it was a screen reader reading
 * "12/40 kart" over itself until the run ended. Now the start is said once,
 * the result once, and the counter ticks beside them in silence.
 */
export function describeBar(
  solver: BarRun,
  view: View,
  t: Translate,
  current: { applied: boolean; result: boolean },
): { text: string; level: string; counter?: string } {
  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text: t('Program yapılıyor…'),
      counter: t('{yerlesen}/{toplam} ders · {sure} sn', {
        yerlesen: p.placedBlocks,
        toplam: p.totalBlocks,
        sure: seconds(p.elapsedMs),
      }),
      level: 'busy',
    };
  }

  if (solver.applied !== null && current.applied) {
    return {
      text: t('Öneri uygulandı ve program dizildi.'),
      level: 'ok',
    };
  }

  const done = current.result ? solver.result : null;
  // Idle, the bar says what the grid IS rather than sitting blank. It reserves
  // 26px whatever happens, and a sentence that explains the axis you are
  // looking at is worth more there than empty chrome. It used to live beside
  // the view switch, which is now a row further up.
  if (done === null) {
    return {
      text:
        view === 'teacher'
          ? t(
              'Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.',
            )
          : t(
              'Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.',
            ),
      level: '',
    };
  }

  if (done.stuck.length === 0) {
    return {
      text: t('Program yapıldı: {n} saat yerleşti.', {
        n: Object.keys(activePlacements(done.state)).length,
      }),
      level: 'ok',
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1 ? t(' (ve {n} ders daha)', { n: done.stuck.length - 1 }) : '';
  const head =
    done.phase === 'cancelled'
      ? t('Durduruldu. {yerlesen}/{toplam} ders yerleşti.', {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        })
      : t('{yerlesen}/{toplam} ders yerleşti.', {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        });
  return {
    text: t('{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.', {
      bas: head,
      ders: worst.name,
      saat: worst.missing,
      sebep: worst.reason,
      digerleri: others,
    }),
    level: done.phase === 'cancelled' ? 'warn' : 'bad',
  };
}
