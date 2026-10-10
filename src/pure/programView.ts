// What the Program screen draws, worked out from the state: the grid's rows
// and a suggestion's marks on them, the tray and its headings, and the line
// under the toolbar. Nothing here knows React or the DOM.
//
// Moved out of `ui/program/Program.tsx` without a change to what it computes
// (TODO §8k, RF8); `src/programScreen.test.tsx` pins the drawing it feeds, and
// `src/programView.test.ts` asks it directly. The component still decides WHEN
// each of these runs: the rows and the tray are memoised there, because the
// grid's memo boundary is the identity of `rows` (pitfall 10).
//
// Not in `pure/program/`: this file reads `constraints.ts` and `entities.ts`,
// both of those read `pure/program/`, and one index for both would be an import
// cycle (TODO §8k, 2026-10-10).

import {
  buildIndex,
  closedConflicts,
  closedKey,
  pendingBlocks,
  placedBlocks,
  placementKey,
} from './constraints';
import type { Index } from './constraints';
import { lessonSubject, subjectKey, subjectLabel, subjectShort, teacherSubjects } from './entities';
import { compareTr } from './listview';
import { activePinned, activePlacements, type MaskMode, type ProgramMask } from './program';
import type { SuggestionDiff } from './relax';
import type { SolverProgress, SolverResult } from './solver';
import type { Vars } from '../leaf/i18n';
import type { Id, Lesson, PoolSort, State, View } from '../leaf/types';

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
  bottom: string; // room letter ("A") or subject
  color: number;
  /** Does the block continue into the next hour — then no separator is drawn. */
  continues: boolean;
  /** The hour has since been closed for this teacher, class or room. */
  conflict: string | null;
  /**
   * The reader has locked this block in place: it survives "Baştan diz", it
   * cannot be dragged, removed or dropped on. Drawn with a mark and not only
   * with a colour — colour alone never carries state here.
   */
  pinned: boolean;
  /** The block belongs to a temporarily excluded row in the other view. */
  mask?: MaskMode | undefined;
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
  mask?: MaskMode | undefined;
}

export function buildRows(
  d: State,
  ix: Index,
  view: View,
  mask: ProgramMask,
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
    return d.teachers
      .map((t) => {
        const cells: Array<GridCell | null> = new Array(n).fill(null);
        const closed: boolean[] = new Array(n).fill(false);

        for (let g = 0; g < dayCount; g++) {
          for (let s = 0; s < hourCount; s++) {
            const i = g * hourCount + s;
            closed[i] = d.unavailable[closedKey(t.id, g, s)] !== undefined;

            const lessonId = ix.teacherBusy.get(closedKey(t.id, g, s));
            if (lessonId === undefined) continue;
            const group = ix.classById.get(ix.lessonById.get(lessonId)?.classId ?? '');
            cells[i] = {
              lessonId,
              top: group?.name ?? '?',
              bottom: roomLetter(ix, group?.roomId),
              color:
                ix.lessonById.get(lessonId) === undefined
                  ? t.color
                  : colorOf(d, ix.lessonById.get(lessonId)!),
              conflict: conflicts.get(placementKey(group?.id ?? '', g, s)) ?? null,
              pinned: pinned[placementKey(group?.id ?? '', g, s)] !== undefined,
              mask: group === undefined ? undefined : mask.classes[group.id],
              continues:
                s + 1 < hourCount && group !== undefined && continuesAt(group.id, g, s, lessonId),
            };
          }
        }
        return {
          id: t.id,
          kind: 'teacher' as const,
          name: t.short,
          // Both, because this line IS the teacher — the cells in the row each
          // name the one subject their own lesson is taught under.
          //
          // SHORT, not the full name. This line sits in a column narrow enough
          // that "Matematik" was being cut to "Matemat…" and a pair of subjects
          // never showed the second one at all; the cells of the grid have read
          // the short form all along, so the row head now says what its own row
          // says. `subjectShort` is the one place that resolves it.
          secondary: teacherSubjects(t)
            .map((name) => subjectShort(d.settings, name))
            .join(' · '),
          color: t.color,
          cells,
          closed,
          mask: mask.teachers[t.id],
        };
      })
      .filter((row) => row.mask !== 'hidden');
  }

  return d.classes
    .map((group) => {
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
            // The LESSON's subject, not the teacher's first one: a teacher who
            // holds two is in this class for exactly one of them.
            bottom: lesson === undefined ? '' : subjectShort(d.settings, lessonSubject(d, lesson)),
            color: lesson === undefined ? (teacher?.color ?? 0) : colorOf(d, lesson),
            conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
            pinned: pinned[placementKey(group.id, g, s)] !== undefined,
            mask: teacher === undefined ? undefined : mask.teachers[teacher.id],
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
        mask: mask.classes[group.id],
      };
    })
    .filter((row) => row.mask !== 'hidden');
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
  masked?: boolean;
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
  mask: ProgramMask,
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
    const teacherMode = mask.teachers[lesson.teacherId];
    const classMode = mask.classes[lesson.classId];
    if (teacherMode === 'hidden' || classMode === 'hidden') continue;
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
    total += owed.length;
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
        masked: teacherMode === 'ghost' || classMode === 'ghost',
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
 * `stackCards()` in `ui/program/LessonPool.tsx` reads consecutive runs: identical blocks of
 * one lesson are drawn as a deck because the tray hands them over already
 * neighbours. Any order that lets a lesson's own cards drift apart silently
 * turns one deck into several, and forty tests count `.pool-card` rather than
 * decks, so nothing would say so. Hence `lessonId` then `size` at the end of
 * each comparator, every time.
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
      return t('{n} saatlik bloklar', { n: card.size });
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
export function waitingSubjects(state: State, mask: ProgramMask): Array<[string, string]> {
  const seen = new Map<string, string>();
  for (const lesson of state.lessons) {
    if (mask.teachers[lesson.teacherId] === 'hidden') continue;
    if (mask.classes[lesson.classId] === 'hidden') continue;
    if (pendingBlocks(state, lesson).length === 0) continue;
    const name = lessonSubject(state, lesson);
    const key = subjectKey(name);
    if (key !== '' && !seen.has(key)) seen.set(key, subjectLabel(name));
  }
  return [...seen.entries()].sort((a, b) => compareTr(a[1], b[1]));
}

/** The days the grid draws: every day the mask has not hidden, by index. */
export function visibleDays(
  days: State['settings']['days'],
  dayModes: ProgramMask['days'],
): number[] {
  return days.flatMap((day, index) => (dayModes[day.name] === 'hidden' ? [] : [index]));
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
 */
export function describeBar(
  solver: BarRun,
  view: View,
  t: Translate,
  current: { applied: boolean; result: boolean },
): { text: string; level: string } {
  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text:
        t('Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn', {
          yerlesen: p.placedBlocks,
          toplam: p.totalBlocks,
          sure: seconds(p.elapsedMs),
        }) +
        (p.excludedBlocks > 0
          ? t(' · {n} blok geçici kapsam dışında', { n: p.excludedBlocks })
          : ''),
      level: 'busy',
    };
  }

  if (solver.applied !== null && current.applied) {
    return {
      text: t('Öneri uygulandı ve program yerleştirildi. Ctrl+Z ile geri alabilirsiniz.'),
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
      text:
        t('Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.', {
          n: done.placedBlocks,
          sure: seconds(done.elapsedMs),
        }) +
        (done.excludedBlocks > 0
          ? t(' {n} blok geçici kapsam dışında kaldı.', {
              n: done.excludedBlocks,
            })
          : ''),
      level: 'ok',
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1 ? t(' (ve {n} ders daha)', { n: done.stuck.length - 1 }) : '';
  const head =
    done.phase === 'cancelled'
      ? t('Durduruldu. {yerlesen}/{toplam} blok yerleşti.', {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        })
      : t('{yerlesen}/{toplam} blok yerleşti.', {
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
