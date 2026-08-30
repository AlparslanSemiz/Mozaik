// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Eye, EyeOff, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import {
  blockAt,
  blockPinned,
  buildIndex,
  closedConflicts,
  closedKey,
  dropMap,
  evict,
  evictionNotice,
  pendingBlocks,
  placedBlocks,
  removeBlock,
  placementKey,
  place,
  setBlockPinned,
  pinScopeCells,
  togglePinScope,
} from "../constraints";
import type { PinScope } from "../constraints";
import type { Index } from "../constraints";
import { useToast } from "./Toasts";
import { useInspect } from "./Inspector";
import { useLessonEdit } from "./LessonEdit";
import {
  dayLabel,
  lessonSubject,
  subjectKey,
  subjectLabel,
  subjectShort,
  teacherSubjects,
} from "../entities";
import { compareTr } from "../listview";
import { useDrag } from "../drag";
import type { DragData, Reason } from "../drag";
import type { SolverRun } from "../useSolver";
import type { State, Id } from "../types";
import { activePinned, activePlacements } from "../programs";
import { rowMask, setDayMask, setRowMask } from "../programMask";
import type { ProgramMask } from "../programMask";
import type { PoolSort, View } from "../toolState";
import { KIND_ICON } from "./steps";
import Grid from "./Grid";
import type { GridCell, GridMenuTarget, GridRow } from "./Grid";
import LessonPool from "./LessonPool";
import type { PoolCard } from "./LessonPool";
import { T, useT } from "./T";
import type { Translate } from "./T";

interface Props {
  /** False while the Activity keeps this tree mounted behind another tab. */
  active: boolean;
  state: State;
  change: (apply: (d: State) => State) => void;
  /** The automatic run. Owned by App so it survives a tab change. */
  solver: SolverRun;
  /** Which axis the rows are. Owned by App: the tool strip above shows it. */
  view: View;
  mask: ProgramMask;
  setMask: (apply: (mask: ProgramMask) => ProgramMask) => void;
  /** How the tray is arranged. A POSITION, owned by App (see toolState.ts). */
  poolSort: PoolSort;
  setPoolSort: (next: PoolSort) => void;
  poolFilter: string;
  setPoolFilter: (next: string) => void;
}

/** "3,4" — one decimal, Turkish comma. */
function seconds(ms: number): string {
  return (ms / 1000).toFixed(1).replace(".", ",");
}

/**
 * The single line under the toolbar. Returns the text and the class that
 * colours it: '' plain, 'warn' yellow, 'bad' red, 'ok' green.
 */
function describeBar(
  reason: Reason | null,
  dragging: boolean,
  solver: SolverRun,
  view: View,
  t: Translate,
): { text: string; level: string } {
  if (reason !== null)
    return {
      text: reason.text,
      level: reason.level === "warn" ? "warn" : "bad",
    };
  if (dragging) return { text: t("Buraya bırakılabilir."), level: "ok" };

  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text:
        t("Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn", {
          yerlesen: p.placedBlocks,
          toplam: p.totalBlocks,
          sure: seconds(p.elapsedMs),
        }) +
        (p.excludedBlocks > 0
          ? t(" · {n} blok geçici kapsam dışında", { n: p.excludedBlocks })
          : ""),
      level: "busy",
    };
  }

  const done = solver.result;
  // Idle, the bar says what the grid IS rather than sitting blank. It reserves
  // 26px whatever happens, and a sentence that explains the axis you are
  // looking at is worth more there than empty chrome. It used to live beside
  // the view switch, which is now a row further up.
  if (done === null) {
    return {
      text:
        view === "teacher"
          ? t(
              "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
            )
          : t(
              "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
            ),
      level: "",
    };
  }

  if (done.stuck.length === 0) {
    return {
      text:
        t(
          "Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.",
          {
            n: done.placedBlocks,
            sure: seconds(done.elapsedMs),
          },
        ) +
        (done.excludedBlocks > 0
          ? t(" {n} blok geçici kapsam dışında kaldı.", {
              n: done.excludedBlocks,
            })
          : ""),
      level: "ok",
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1
      ? t(" (ve {n} ders daha)", { n: done.stuck.length - 1 })
      : "";
  const head =
    done.phase === "cancelled"
      ? t("Durduruldu. {yerlesen}/{toplam} blok yerleşti.", {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        })
      : t("{yerlesen}/{toplam} blok yerleşti.", {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        });
  return {
    text: t("{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.", {
      bas: head,
      ders: worst.name,
      saat: worst.missing,
      sebep: worst.reason,
      digerleri: others,
    }),
    level: done.phase === "cancelled" ? "warn" : "bad",
  };
}

function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return "";
  return ix.roomById.get(roomId)?.name ?? "";
}

function buildRows(
  d: State,
  ix: Index,
  view: View,
  mask: ProgramMask,
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
  const continuesAt = (
    classId: Id,
    day: number,
    hour: number,
    lessonId: Id,
  ): boolean =>
    placements[placementKey(classId, day, hour + 1)] === lessonId &&
    !heads.has(placementKey(classId, day, hour + 1));

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const n = dayCount * hourCount;

  if (view === "teacher") {
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
            const group = ix.classById.get(
              ix.lessonById.get(lessonId)?.classId ?? "",
            );
            cells[i] = {
              lessonId,
              top: group?.name ?? "?",
              bottom: roomLetter(ix, group?.roomId),
              color: t.color,
              conflict:
                conflicts.get(placementKey(group?.id ?? "", g, s)) ?? null,
              pinned: pinned[placementKey(group?.id ?? "", g, s)] !== undefined,
              mask: group === undefined ? undefined : mask.classes[group.id],
              continues:
                s + 1 < hourCount &&
                group !== undefined &&
                continuesAt(group.id, g, s, lessonId),
            };
          }
        }
        return {
          id: t.id,
          kind: "teacher" as const,
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
            .join(" · "),
          color: t.color,
          cells,
          closed,
          mask: mask.teachers[t.id],
        };
      })
      .filter((row) => row.mask !== "hidden");
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
            (group.roomId != null &&
              d.unavailable[closedKey(group.roomId, g, s)] !== undefined);

          const lessonId = placements[placementKey(group.id, g, s)];
          if (lessonId === undefined) continue;
          const lesson = ix.lessonById.get(lessonId);
          const teacher = ix.teacherById.get(lesson?.teacherId ?? "");
          cells[i] = {
            lessonId,
            top: teacher?.short ?? "?",
            // The LESSON's subject, not the teacher's first one: a teacher who
            // holds two is in this class for exactly one of them.
            bottom:
              lesson === undefined
                ? ""
                : subjectShort(d.settings, lessonSubject(d, lesson)),
            color: teacher?.color ?? 0,
            conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
            pinned: pinned[placementKey(group.id, g, s)] !== undefined,
            mask: teacher === undefined ? undefined : mask.teachers[teacher.id],
            continues:
              s + 1 < hourCount && continuesAt(group.id, g, s, lessonId),
          };
        }
      }
      const letter = roomLetter(ix, group.roomId);
      return {
        id: group.id,
        kind: "class" as const,
        name: group.name,
        secondary:
          letter === "" ? t("derslik yok") : t("{ad} dersliği", { ad: letter }),
        color: group.color,
        cells,
        closed,
        mask: mask.classes[group.id],
      };
    })
    .filter((row) => row.mask !== "hidden");
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
function buildPool(
  d: State,
  ix: Index,
  view: View,
  mask: ProgramMask,
  sort: PoolSort,
  filter: string,
  t: Translate,
): { cards: PoolCard[]; completed: number; total: number } {
  const cards: PoolCard[] = [];
  let completed = 0;
  let total = 0;
  const teacherView = view === "teacher";
  const rowAt = new Map<string, number>(
    (teacherView ? d.teachers : d.classes).map((x, i) => [x.id, i]),
  );

  for (const lesson of d.lessons) {
    const teacherMode = mask.teachers[lesson.teacherId];
    const classMode = mask.classes[lesson.classId];
    if (teacherMode === "hidden" || classMode === "hidden") continue;
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
    const className = group?.name ?? "?";
    const teacherShort = teacher?.short ?? "?";
    const subject = lessonSubject(d, lesson);
    total += owed.length;
    // The filter narrows by BRANCH, and it is applied after `total` so the
    // head can say "12 / 99" rather than pretending the rest went away.
    if (filter !== "" && subjectKey(subject) !== filter) continue;
    for (const [i, size] of owed.entries()) {
      cards.push({
        // Identity has to include WHICH of the lesson's cards this is, or React
        // reuses one node for two of them and the tray stops matching the data.
        key: `${lesson.id}#${size}#${i}`,
        lessonId: lesson.id,
        size,
        row:
          rowAt.get(teacherView ? lesson.teacherId : lesson.classId) ??
          Number.MAX_SAFE_INTEGER,
        top: teacherView ? className : teacherShort,
        bottom: teacherView ? teacherShort : className,
        subject: subjectLabel(subject),
        // The card keeps the TEACHER's colour in both views: a cell is always
        // painted by its teacher, so this is what the card will look like.
        color: teacher?.color ?? 0,
        placed,
        total: lesson.weeklyHours,
        masked: teacherMode === "ghost" || classMode === "ghost",
        group: "",
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
 * `stackCards()` in LessonPool.tsx reads consecutive runs: identical blocks of
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
  const tail = (a: PoolCard, b: PoolCard) =>
    compareTr(a.lessonId, b.lessonId) || b.size - a.size;
  switch (sort) {
    case "name":
      return (a, b) =>
        compareTr(a.bottom, b.bottom) || compareTr(a.top, b.top) || tail(a, b);
    case "subject":
      return (a, b) =>
        compareTr(a.subject, b.subject) || a.row - b.row || tail(a, b);
    case "size":
      return (a, b) => b.size - a.size || a.row - b.row || tail(a, b);
    case "left":
      return (a, b) =>
        b.total - b.placed - (a.total - a.placed) ||
        a.row - b.row ||
        tail(a, b);
    // The tray's own order since the rows became draggable: it runs the same
    // way down as the grid, so a row's cards stand under the row.
    case "row":
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
    case "subject":
      return card.subject;
    case "size":
      return t("{n} saatlik bloklar", { n: card.size });
    case "left":
      return t("{n} saat kaldı", { n: card.total - card.placed });
    case "name":
    case "row":
    default:
      return card.bottom;
  }
}

function Program({
  active,
  state,
  change,
  solver,
  view,
  mask,
  setMask,
  poolSort,
  setPoolSort,
  poolFilter,
  setPoolFilter,
}: Props) {
  const t = useT();
  const ix = useMemo(() => buildIndex(state), [state]);
  const notify = useToast();
  const editLesson = useLessonEdit();
  // "öğretmeni düzenleme ve sınıfı düzenlemede her şeyi düzenleyebilelim":
  // the entity sheet is the one that edits an entity, and from a card it is
  // the only way to reach the axis the grid is NOT drawn along.
  const inspect = useInspect();

  const drop = useCallback(
    (data: DragData, day: number, hour: number) => {
      // Read out of the map BEFORE change(): React runs a reducer callback
      // late, and reading a ref or a closure variable inside one is how the
      // solver's whole result once went missing (pitfall 20).
      const verdict = data.map.get(`${day}|${hour}`);
      const pushedOut = verdict?.evicts ?? [];
      const lesson = ix.lessonById.get(data.lessonId);
      const told =
        pushedOut.length === 0 || lesson === undefined
          ? ""
          : evictionNotice(
              ix,
              pushedOut
                .map((id) => ix.lessonById.get(id))
                .filter((x) => x !== undefined),
            ).replace(t("dönecek"), t("döndü"));

      change((d) => {
        // Lifting the old block and laying the new one down are ONE reducer
        // call, so a move costs one undo step and Ctrl+Z puts the lesson back
        // where it was — not into the pool. The eviction rides along in the
        // same call for the same reason: dropping onto an occupied cell is one
        // move, so it is one Ctrl+Z.
        let next = d;
        if (data.source !== null) {
          next = removeBlock(
            d,
            data.source.classId,
            data.source.day,
            data.source.hour,
          );
          if (next === d) return d; // the block went away mid-drag; touch nothing
        }

        // The cells the new block will cover, cleared of whatever is in them.
        // Re-derived from the state React just handed us rather than trusted
        // from the drag's snapshot: between pointerdown and here, an autosave,
        // an undo or a solver run may have moved the grid underneath.
        if (pushedOut.length > 0 && lesson !== undefined) {
          const span = Math.max(1, data.blockSize);
          const hours: number[] = [];
          for (let i = 0; i < span; i++) hours.push(hour + i);
          next = evict(next, lesson.classId, day, hours);
        }

        return place(next, data.lessonId, day, hour, data.blockSize);
      });

      if (told !== "") notify(told);
    },
    [change, ix, notify],
  );

  const { start, dragging, reason } = useDrag(drop);

  // `t` is IN the deps and not an import, so a language switch rebuilds the
  // rows. A module-level translator would read the new language only the next
  // time `state` happened to change.
  const rows = useMemo(
    () => buildRows(state, ix, view, mask, t),
    [state, ix, view, mask, t],
  );
  const {
    cards,
    completed,
    total: poolTotal,
  } = useMemo(
    () => buildPool(state, ix, view, mask, poolSort, poolFilter, t),
    [state, ix, view, mask, poolSort, poolFilter, t],
  );
  /**
   * The branches with something still waiting — the only ones worth offering.
   *
   * Computed off the UNFILTERED lessons, so choosing "Matematik" does not
   * empty the list that chose it. Keyed by `subjectKey` because that is what
   * the filter compares, and labelled with what the rest of the screen calls
   * it.
   */
  const poolSubjects = useMemo<Array<[string, string]>>(() => {
    const seen = new Map<string, string>();
    for (const lesson of state.lessons) {
      if (mask.teachers[lesson.teacherId] === "hidden") continue;
      if (mask.classes[lesson.classId] === "hidden") continue;
      if (pendingBlocks(state, lesson).length === 0) continue;
      const name = lessonSubject(state, lesson);
      const key = subjectKey(name);
      if (key !== "" && !seen.has(key)) seen.set(key, subjectLabel(name));
    }
    return [...seen.entries()].sort((a, b) => compareTr(a[1], b[1]));
  }, [state, mask]);
  const dayIndices = useMemo(
    () =>
      state.settings.days.flatMap((day, index) =>
        mask.days[day.name] === "hidden" ? [] : [index],
      ),
    [state.settings.days, mask.days],
  );

  // What the bar under the toolbar says. Drag first: that answers a question
  // the hand is asking right now.
  const { text: barText, level: barLevel } = describeBar(
    reason,
    dragging !== null,
    solver,
    view,
    t,
  );

  /**
   * WHICH CLASS a grid cell belongs to.
   *
   * In the class view the row id already is one; in the teacher view the row is
   * a person and the cell's class has to be looked up through what they are
   * teaching at that hour. Every action the menu offers needs this — remove,
   * edit, pin — and it used to be written inside the remove handler, where the
   * next two would each have copied it.
   */
  const classAt = useCallback(
    (d: State, rowId: string, day: number, hour: number): Id | null => {
      if (view === "class") return rowId;
      const fresh = buildIndex(d);
      const lessonId = fresh.teacherBusy.get(closedKey(rowId, day, hour));
      return lessonId === undefined
        ? null
        : (fresh.lessonById.get(lessonId)?.classId ?? null);
    },
    [view],
  );

  const cellRemove = useCallback(
    (rowId: string, day: number, hour: number) => {
      // Asked BEFORE the change so the refusal can be spoken. `removeBlock`
      // returns the same state for a pinned block, which the store correctly
      // treats as "nothing happened" — and nothing happening in silence is
      // what a reader reads as a broken key.
      const classId = classAt(state, rowId, day, hour);
      if (classId !== null && blockPinned(state, classId, day, hour)) {
        notify(t("Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın."));
        return;
      }
      change((d) => {
        const fresh = classAt(d, rowId, day, hour);
        return fresh === null ? d : removeBlock(d, fresh, day, hour);
      });
    },
    [change, classAt, notify, state, t],
  );

  /**
   * The right-click menu: which block it is about.
   *
   * Kept as the CELL that was clicked rather than as a resolved lesson, because
   * the state can move under an open menu (an autosave, an undo, a solver run)
   * and every item re-reads from the state it acts on.
   */
  const [menuTarget, setMenuTarget] = useState<GridMenuTarget | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Keep Radix's portal inside the Activity boundary. A body-level portal
  // would remain visible when React hides the retained Program tree.
  const menuPortalRef = useRef<HTMLDivElement>(null);

  // Activity runs this cleanup whenever the Program tab is hidden. Radix
  // portals live under <body>, outside the hidden grid, so close them by state
  // rather than relying on the grid's CSS visibility.
  useEffect(
    () => () => {
      setMenuOpen(false);
      setMenuTarget(null);
    },
    [],
  );
  const menuAt = menuTarget?.kind === "card" ? menuTarget : null;
  const menuRowId =
    menuTarget?.kind === "row" || menuTarget?.kind === "card"
      ? menuTarget.rowId
      : null;
  const menuDay =
    menuTarget?.kind === "day" ||
    menuTarget?.kind === "column" ||
    menuTarget?.kind === "card"
      ? menuTarget.day
      : null;

  const menuClass =
    menuAt === null
      ? null
      : classAt(state, menuAt.rowId, menuAt.day, menuAt.hour);
  const menuPinned =
    menuAt !== null &&
    menuClass !== null &&
    blockPinned(state, menuClass, menuAt.day, menuAt.hour);
  const menuLessonId =
    menuAt === null || menuClass === null
      ? undefined
      : activePlacements(state)[
          placementKey(
            menuClass,
            menuAt.day,
            blockAt(state, menuClass, menuAt.day, menuAt.hour)?.hour ??
              menuAt.hour,
          )
        ];
  const menuLesson =
    menuLessonId === undefined ? undefined : ix.lessonById.get(menuLessonId);
  const menuCellMasked =
    menuLesson !== undefined &&
    (mask.teachers[menuLesson.teacherId] !== undefined ||
      mask.classes[menuLesson.classId] !== undefined);

  /**
   * Lock or unlock ONE block, wherever the ask came from.
   *
   * Two callers, and they are different kinds of thing: the pin drawn ON the
   * card (a hand, on a square it is already looking at) and the menu item (the
   * same question asked the long way). Both land here, so the toast and the
   * refusal cannot drift apart — the shape `cellRemove` already has.
   */
  const pinCell = useCallback(
    (rowId: string, day: number, hour: number) => {
      const classId = classAt(state, rowId, day, hour);
      if (classId === null) return;
      const on = !blockPinned(state, classId, day, hour);
      change((d) => {
        const fresh = classAt(d, rowId, day, hour);
        return fresh === null ? d : setBlockPinned(d, fresh, day, hour, on);
      });
      notify(on ? t("Ders sabitlendi.") : t("Sabitleme kaldırıldı."));
    },
    [change, classAt, notify, state, t],
  );

  const togglePin = useCallback(() => {
    if (menuAt === null) return;
    pinCell(menuAt.rowId, menuAt.day, menuAt.hour);
  }, [menuAt, pinCell]);

  const toggleScope = useCallback(
    (scope: PinScope) => {
      const cells = pinScopeCells(state, scope);
      if (cells.length === 0) return;
      const pinned = activePinned(state);
      const willPin = !cells.every((key) => pinned[key] !== undefined);
      change((d) => togglePinScope(d, scope));
      notify(
        willPin
          ? t("{n} saat sabitlendi.", { n: cells.length })
          : t("{n} saatin sabitlemesi kaldırıldı.", { n: cells.length }),
      );
    },
    [state, change, notify, t],
  );

  const setMenuRowMode = useCallback(
    (mode?: "ghost" | "hidden") => {
      if (menuRowId === null || solver.running) return;
      setMask((current) => setRowMask(current, view, menuRowId, mode));
    },
    [menuRowId, solver.running, setMask, view],
  );

  const setMenuDayMode = useCallback(
    (mode?: "ghost" | "hidden") => {
      if (menuDay === null || solver.running) return;
      const name = state.settings.days[menuDay]?.name;
      if (name !== undefined)
        setMask((current) => setDayMask(current, name, mode));
    },
    [menuDay, solver.running, setMask, state.settings.days],
  );
  const menuRowMode =
    menuRowId === null ? undefined : rowMask(mask, view, menuRowId);
  const menuDayName =
    menuDay === null ? undefined : state.settings.days[menuDay]?.name;
  const menuDayMode =
    menuDayName === undefined ? undefined : mask.days[menuDayName];

  /**
   * "Put this row (or this day) aside for a moment."
   *
   * Written once and drawn in two places: flat on a row or day heading, where
   * the whole menu is two lines long, and one step in on a CARD, whose menu
   * already asks seven other questions. Same items either way — a Radix
   * `Item` is the same component in a `Content` and in a `SubContent`.
   *
   * "ghostla" is gone: it was an English verb wearing a Turkish suffix, in a
   * program whose one language rule is that the interface is Turkish and the
   * code is English. The MODE is still `ghost` in programMask.ts, because that
   * is code.
   */
  const maskItems = (
    <>
      {menuRowId !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() =>
              setMenuRowMode(menuRowMode === "ghost" ? undefined : "ghost")
            }
          >
            <Eye size={15} aria-hidden="true" />
            {menuRowMode === "ghost"
              ? t("Satırı geri yükle")
              : t("Satırı soluklaştır")}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuRowMode("hidden")}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t("Satırı gizle")}
          </ContextMenu.Item>
        </>
      )}
      {menuDay !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() =>
              setMenuDayMode(menuDayMode === "ghost" ? undefined : "ghost")
            }
          >
            <Eye size={15} aria-hidden="true" />
            {menuDayMode === "ghost"
              ? t("Günü geri yükle")
              : t("Günü soluklaştır")}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuDayMode("hidden")}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t("Günü gizle")}
          </ContextMenu.Item>
        </>
      )}
    </>
  );

  /**
   * One drag, two sources: a card from the pool (`source === null`) or a block
   * already on the grid, which is being MOVED.
   *
   * The map is computed against a state with the source block ALREADY LIFTED.
   * Without that a placed lesson blocks itself — hard constraints 2 (the class
   * is busy) and 5 (the teacher is in another class) both see its own cells —
   * and it could not even be dropped back where it came from. Nothing is
   * removed for real here: the lift happens inside the drop's single change().
   */
  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      lessonId: Id,
      source: { classId: Id; day: number; hour: number } | null,
      size: number,
    ) => {
      // The grid is being rewritten under the cursor; a drop now would race it.
      if (solver.running) return;

      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) return;

      const base =
        source === null
          ? state
          : removeBlock(state, source.classId, source.day, source.hour);
      const baseIx = source === null ? ix : buildIndex(base);

      // Valid cells are computed HERE, once — never again during the drag.
      // The loop moved into `dropMap`: it is not a rendering decision, it is
      // the constraint engine answering 72 questions, and one of the answers
      // ("occupied by this class's own lesson") now costs an eviction to say.
      const map = dropMap(base, baseIx, lessonId, size);
      for (const [key, verdict] of map) {
        const day = Number(key.split("|")[0]);
        const dayName = state.settings.days[day]?.name;
        if (dayName !== undefined && mask.days[dayName] !== undefined) {
          map.set(key, {
            ...verdict,
            blocked: t("{gun} geçici olarak kapsam dışında", {
              gun: dayLabel(dayName),
            }),
            warning: null,
            evicts: [],
          });
        }
      }

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      const teacherView = view === "teacher";

      start(
        e,
        {
          lessonId,
          rowId: teacherView ? lesson.teacherId : lesson.classId,
          blockSize: Math.max(1, size),
          map,
          source,
        },
        {
          top: teacherView ? (group?.name ?? "?") : (teacher?.short ?? "?"),
          bottom: teacherView
            ? roomLetter(ix, group?.roomId)
            : subjectShort(state.settings, lessonSubject(state, lesson)),
          color: teacher?.color ?? 0,
        },
      );
    },
    [state, ix, view, start, solver.running, mask.days, t],
  );

  const cardStart = useCallback(
    (e: React.PointerEvent, lessonId: Id, size: number) =>
      beginDrag(e, lessonId, null, size),
    [beginDrag],
  );

  /** Left button on a placed block: pick it up and move it. */
  const cellMoveStart = useCallback(
    (e: React.PointerEvent, rowId: string, day: number, hour: number) => {
      const teacherView = view === "teacher";
      const lessonId = teacherView
        ? ix.teacherBusy.get(closedKey(rowId, day, hour))
        : activePlacements(state)[placementKey(rowId, day, hour)];
      if (lessonId === undefined) return;

      const classId = teacherView
        ? (ix.lessonById.get(lessonId)?.classId ?? null)
        : rowId;
      if (classId === null) return;

      // The grabbed cell may be the middle of a block; the whole block moves —
      // and it carries its own length, which its lesson can no longer be asked
      // for now that one lesson can hold blocks of two different lengths.
      const found = blockAt(state, classId, day, hour);
      if (found === null) return;

      beginDrag(e, lessonId, { classId, day, hour: found.hour }, found.size);
    },
    [state, ix, view, beginDrag],
  );

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          <strong>{t("Henüz dizilecek ders yok.")}</strong>
          <T k="Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin." />
          <br />
          <br />
          {t(
            "Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.",
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={menuPortalRef} className="program-menu-portal" />
      {/* One bar, three jobs: the drag reason, the solver's progress and the
          solver's verdict. It has a FIXED height so the grid never jumps down
          when something appears in it, and it is the line the eye is already
          trained on. The drag always wins — that one is answering a question
          the hand is asking right now.

          `aria-live="polite"` because two of the three jobs are announcements
          nobody is looking at this line for: the solver runs for seconds and
          then says what it managed, and a blocked drop says why. The
          accessibility contract has named this line since the round that
          removed the design constraints; until 2026-08-27 it was the one place
          that never got it. `polite` and not `assertive`: it must not cut into
          a dialog, and the DRAG reason updates several times a second while the
          pointer moves — the region is on the wrapper so those coalesce into
          one announcement per settled state rather than one per frame. */}
      <div
        className={`reason-bar${barLevel === "" ? "" : ` ${barLevel}`}`}
        role="status"
        aria-live="polite"
      >
        <span>{barText}</span>
        {solver.result !== null && !solver.running && (
          <span className="bar-actions">
            {solver.result.stuck.length > 0 && (
              <span className="hint inline">
                {t("Ayrıntı: Kontrol sekmesi.")}
              </span>
            )}
            <button className="btn" onClick={solver.clear}>
              {t("Tamam")}
            </button>
          </span>
        )}
      </div>

      {/* The instrument and the pool, side by side. The pool used to sit under
          the grid and cost it 215px of height; down the right it takes width
          from a table that was already scrolling. */}
      <div className="program-body">
        <Grid
          settings={state.settings}
          rows={rows}
          dayIndices={dayIndices}
          dayModes={mask.days}
          firstColumnTitle={view === "teacher" ? t("Öğretmen") : t("Sınıf")}
          draggedRowId={dragging?.rowId ?? null}
          onCellRemove={cellRemove}
          onCellMoveStart={cellMoveStart}
          onCellPin={pinCell}
          onMenu={setMenuTarget}
          menuOpen={active && menuOpen}
          onMenuOpenChange={setMenuOpen}
          menu={
            <ContextMenu.Portal container={menuPortalRef.current}>
              <ContextMenu.Content className="menu" collisionPadding={8}>
                {menuAt !== null && (
                  <>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={
                        menuPinned ||
                        menuRowMode !== undefined ||
                        menuDayMode !== undefined ||
                        menuCellMasked
                      }
                      onSelect={() =>
                        cellRemove(menuAt.rowId, menuAt.day, menuAt.hour)
                      }
                    >
                      <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                      {t("Havuza kaldır")}
                      {menuPinned && (
                        <span className="menu-why">{t("sabitlenmiş")}</span>
                      )}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLessonId === undefined}
                      onSelect={() =>
                        menuLessonId !== undefined && editLesson(menuLessonId)
                      }
                    >
                      <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                      {t("Dersi düzenle")}
                    </ContextMenu.Item>
                    {/* THE TWO ENDS OF THE LESSON, and this is the only way to
                        reach the one the grid is NOT drawn along: the row head
                        opens the axis you are looking at, and finding the other
                        meant switching view and hunting for a name.
                        ("dersi düzenle ve öğretmeni düzenleme ve sınıfı
                         düzenlemede her şeyi düzenleyebilelim") */}
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLesson === undefined}
                      onSelect={() =>
                        menuLesson !== undefined &&
                        inspect("teacher", menuLesson.teacherId)
                      }
                    >
                      {KIND_ICON.teacher}
                      {t("Öğretmeni düzenle")}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLesson === undefined}
                      onSelect={() =>
                        menuLesson !== undefined &&
                        inspect("class", menuLesson.classId)
                      }
                    >
                      {KIND_ICON.class}
                      {t("Sınıfı düzenle")}
                    </ContextMenu.Item>
                    <ContextMenu.Separator className="menu-sep" />
                    {/* ONE HOUR, back at the top level. It spent a round inside
                        the scope submenu, where the commonest lock in the
                        program was two clicks and a hover away from the hand
                        that wanted it. The card now carries a pin of its own,
                        so this is the same question asked the long way — and
                        the long way should still put it first. */}
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={
                        menuRowMode !== undefined ||
                        menuDayMode !== undefined ||
                        menuCellMasked
                      }
                      onSelect={togglePin}
                    >
                      {menuPinned ? (
                        <PinOff size={15} aria-hidden="true" />
                      ) : (
                        <Pin size={15} aria-hidden="true" />
                      )}
                      {menuPinned
                        ? t("Sabitlemeyi kaldır")
                        : t("Dersi buraya sabitle")}
                    </ContextMenu.Item>
                  </>
                )}

                {menuAt !== null ? (
                  /* ...and the three that lock MANY hours at once stay one step
                     in. They are the rarer question and the dangerous one: a
                     click here can freeze a whole day. */
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger
                      className="menu-item"
                      disabled={
                        menuRowMode !== undefined ||
                        menuDayMode !== undefined ||
                        menuCellMasked
                      }
                    >
                      <Pin size={15} strokeWidth={2} aria-hidden="true" />
                      {t("Toplu sabitle")}
                    </ContextMenu.SubTrigger>
                    <ContextMenu.Portal container={menuPortalRef.current}>
                      <ContextMenu.SubContent className="menu" sideOffset={4}>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() =>
                            toggleScope({
                              kind: "row",
                              view,
                              rowId: menuAt.rowId,
                            })
                          }
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t("Satırı sabitle / kaldır")}
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() =>
                            toggleScope({
                              kind: "column",
                              day: menuAt.day,
                              hour: menuAt.hour,
                            })
                          }
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t("Sütunu sabitle / kaldır")}
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() =>
                            toggleScope({ kind: "day", day: menuAt.day })
                          }
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t("Günü sabitle / kaldır")}
                        </ContextMenu.Item>
                      </ContextMenu.SubContent>
                    </ContextMenu.Portal>
                  </ContextMenu.Sub>
                ) : menuTarget?.kind === "row" ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuRowMode !== undefined}
                    onSelect={() =>
                      toggleScope({
                        kind: "row",
                        view,
                        rowId: menuTarget.rowId,
                      })
                    }
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t("Satırı sabitle / kaldır")}
                  </ContextMenu.Item>
                ) : menuTarget?.kind === "day" ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuDayMode !== undefined}
                    onSelect={() =>
                      toggleScope({ kind: "day", day: menuTarget.day })
                    }
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t("Günü sabitle / kaldır")}
                  </ContextMenu.Item>
                ) : menuTarget?.kind === "column" ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuDayMode !== undefined}
                    onSelect={() =>
                      toggleScope({
                        kind: "column",
                        day: menuTarget.day,
                        hour: menuTarget.hour,
                      })
                    }
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t("Sütunu sabitle / kaldır")}
                  </ContextMenu.Item>
                ) : null}

                {(menuRowId !== null || menuDay !== null) &&
                  menuTarget?.kind !== "column" && (
                    <>
                      <ContextMenu.Separator className="menu-sep" />
                      {menuAt !== null ? (
                        <ContextMenu.Sub>
                          <ContextMenu.SubTrigger
                            className="menu-item"
                            disabled={solver.running}
                          >
                            <Eye size={15} strokeWidth={2} aria-hidden="true" />
                            {t("Geçici görünüm")}
                          </ContextMenu.SubTrigger>
                          <ContextMenu.Portal container={menuPortalRef.current}>
                            <ContextMenu.SubContent
                              className="menu"
                              sideOffset={4}
                            >
                              {maskItems}
                            </ContextMenu.SubContent>
                          </ContextMenu.Portal>
                        </ContextMenu.Sub>
                      ) : (
                        maskItems
                      )}
                    </>
                  )}
              </ContextMenu.Content>
            </ContextMenu.Portal>
          }
        />

        <LessonPool
          cards={cards}
          completed={completed}
          total={poolTotal}
          sort={poolSort}
          setSort={setPoolSort}
          filter={poolFilter}
          setFilter={setPoolFilter}
          subjects={poolSubjects}
          onStart={cardStart}
        />
      </div>
    </>
  );
}

export default memo(Program);
