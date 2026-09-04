// The unplaced lesson cards. The counterpart of the aSc pool in the photo.
// Card colour = teacher colour; that is what tells you which grid row it is
// aimed at.
//
// It is a DRAWER along the BOTTOM, and it is resizable.
//
// The dock spent a version down the right, on the argument that the grid
// overflows horizontally anyway. That was true and it is still true — but it
// made the pool a narrow column that could hold three cards abreast, and 99
// waiting lessons became a list you scroll rather than a tray you see. Along
// the bottom the same 99 cards lie in rows of a dozen.
//
// What made the bottom untenable before was that its height was a constant
// somebody else picked: 215px of a 1080px screen, six teachers out of
// twenty-five, whether you had 99 cards left or two. It is not a constant any
// more — the seam is a `role="separator"` you drag, and where you leave it is
// remembered (`ders-programi-havuz-boy`).
//
// The card list stays MOUNTED when the drawer is closed. One DOM card stands
// for one stack; the model count in the head remains the number of blocks.

import { memo, useEffect, useRef, useState } from "react";
import type React from "react";
import type { ReactNode } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { Id } from "../../types";
import { paletteColor } from "../../palette";
import {
  DOCK_H_MIN,
  readDock,
  readDockHeight,
  writeDock,
  writeDockHeight,
} from "../../view/theme";
import { attachSplitter, maxDockHeight } from "../../dom/poolSplit";
import { useT } from "../T";
import type { PoolSort } from "../../view/toolState";

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

interface Props {
  cards: PoolCard[];
  completed: number;
  /** Blocks waiting BEFORE the filter, so the head can say "12 / 99". */
  total: number;
  sort: PoolSort;
  setSort: (next: PoolSort) => void;
  /** Subject key the tray is narrowed to, '' for all. */
  filter: string;
  setFilter: (next: string) => void;
  /** The branches that still have something waiting: `[key, label]`. */
  subjects: Array<[string, string]>;
  onStart: (e: React.PointerEvent, lessonId: Id, size: number) => void;
  onMenu: (lessonId: Id) => void;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  menu: ReactNode;
}

/** The five orders, named for the question each one answers. */
const SORTS: Array<{ id: PoolSort; label: string }> = [
  { id: "row", label: "Izgara sırası" },
  { id: "name", label: "Ada göre" },
  { id: "subject", label: "Branşa göre" },
  { id: "size", label: "Uzun bloklar önce" },
  { id: "left", label: "En çok kalan" },
];

/** One run of cards under one heading. */
interface CardGroup {
  key: string;
  label: string;
  stacks: CardStack[];
  cards: number;
}

/** One pile on the tray: identical blocks of one lesson, drawn as a deck. */
interface CardStack {
  /** React identity — the top card's, which is stable while the deck shrinks. */
  key: string;
  cards: PoolCard[];
}

/**
 * Identical cards become ONE pile.
 *
 * A lesson asking for six single hours put six identical rectangles on the
 * tray, six times the same `0/6`, and ate half the drawer to say one thing.
 * "aynı dersten aynı şeyden birden fazlaysa ... kartlar stacklenmiş gibi altta
 * da olsun ve alttaki stacklenenler de gözüksün."
 *
 * No scheduling data is merged: every block stays in `cards`. The DOM draws
 * only the top card and two CSS edges, because buried duplicate nodes made the
 * Program tab pay to paint hundreds of invisible cards on every opening.
 *
 * Consecutive runs and not a `Map`: the tray is already sorted row -> top ->
 * size (see `buildPool` in Program.tsx), so identical cards are already
 * neighbours, and grouping in place is what keeps the tray running the same
 * way down as the grid rows the cards are aimed at. Same shape as the run
 * reading in `placedBlocks()`.
 */
function stackCards(cards: PoolCard[]): CardStack[] {
  const piles: CardStack[] = [];
  for (const c of cards) {
    const last = piles[piles.length - 1];
    const head = last?.cards[0];
    if (
      last !== undefined &&
      head !== undefined &&
      head.lessonId === c.lessonId &&
      head.size === c.size
    ) {
      last.cards.push(c);
    } else {
      piles.push({ key: c.key, cards: [c] });
    }
  }
  return piles;
}

/**
 * ...and the piles fall into RUNS under a heading.
 *
 * "kartlar havuzdayken ayrım daha bir güzel ve hoş olsun." What separated one
 * teacher's cards from the next was a `gap` of 7 px between pastel rectangles —
 * the tray was already sorted so that a row's cards stood together, and nothing
 * on screen said where one row ended.
 *
 * Consecutive runs again, for the same reason `stackCards` walks them: the
 * order is decided in `buildPool` and every one of the five puts a group's
 * cards next to each other. Grouping with a Map here would let the headings
 * come out in a different order from the cards under them.
 */
function groupStacks(stacks: CardStack[]): CardGroup[] {
  const groups: CardGroup[] = [];
  for (const s of stacks) {
    const label = s.cards[0]?.group ?? "";
    const last = groups[groups.length - 1];
    if (last !== undefined && last.label === label) {
      last.stacks.push(s);
      last.cards += s.cards.length;
    } else {
      groups.push({ key: s.key, label, stacks: [s], cards: s.cards.length });
    }
  }
  return groups;
}

function LessonPool({
  cards,
  completed,
  total,
  sort,
  setSort,
  filter,
  setFilter,
  subjects,
  onStart,
  onMenu,
  menuOpen,
  onMenuOpenChange,
  menu,
}: Props) {
  const t = useT();
  // The cards ARE the hours left now: one card per block still owed, so adding
  // up their sizes is the answer. Summing `total - placed` per card would count
  // one lesson's whole remainder once per card it still has out.
  const remainingHours = cards.reduce((sum, c) => sum + c.size, 0);
  const groups = groupStacks(stackCards(cards));
  const narrowed = filter !== "" && total !== cards.length;
  // Read from storage on every mount, so the tab switch that unmounts this
  // component cannot lose either setting (pitfall 18 does not apply to a
  // preference that lives outside React).
  const [open, setOpen] = useState<boolean>(readDock);
  const [height, setHeight] = useState<number>(readDockHeight);
  const handle = useRef<HTMLDivElement>(null);
  const [ceiling, setCeiling] = useState<number>(DOCK_H_MIN);

  // `height` is read once per gesture, not per frame, so the splitter needs a
  // ref rather than the closed-over value — otherwise the second drag would
  // start from wherever the first one began.
  const latest = useRef(height);
  latest.current = height;

  useEffect(() => {
    const el = handle.current;
    const body = el?.closest(".program-body");
    if (el === null || !(body instanceof HTMLElement)) return undefined;
    // `--dock-h` has exactly ONE owner, `.program-body`, written from here on
    // mount and from the splitter during a drag. Putting a copy on `.pool` as
    // an inline style made the drag invisible: the closer declaration won and
    // the DOM write went nowhere.
    body.style.setProperty("--dock-h", `${readDockHeight()}rem`);
    setCeiling(maxDockHeight(body.getBoundingClientRect().height));
    return attachSplitter(el, {
      body,
      current: () => latest.current,
      commit: (rem) => {
        writeDockHeight(rem);
        setHeight(rem);
      },
    });
  }, []);

  function toggle() {
    const next = !open;
    writeDock(next);
    setOpen(next);
  }

  function openMenu(e: React.MouseEvent) {
    const element = e.target as Element;
    const card = element.closest?.('.pool-card[data-lesson]') as HTMLElement | null;
    const lessonId = card?.dataset.lesson;
    if (lessonId === undefined) {
      e.preventDefault();
      return;
    }
    onMenu(lessonId);
  }

  return (
    <aside
      // Nothing left to place: the drawer keeps its head (which is now the
      // sentence saying so) and gives the height back to the grid. A 176px
      // tray of nothing is 176px that was carrying five teachers.
      className={open && cards.length > 0 ? "pool" : "pool pool-closed"}
      aria-label={t("Yerleşmeyi bekleyen dersler")}
    >
      {/* The seam. It is a control before it is a border: 1px of ink, 9px of
          target, and reachable from the keyboard because a drag is not. */}
      <div
        ref={handle}
        className="pool-split"
        role="separator"
        aria-orientation="horizontal"
        aria-label={t("Havuz yüksekliği")}
        aria-valuenow={height}
        aria-valuemin={DOCK_H_MIN}
        aria-valuemax={Math.round(ceiling * 100) / 100}
        tabIndex={open ? 0 : -1}
        title={t("Sürükleyerek havuzun boyunu ayarlayın")}
      />

      <div className="pool-head">
        <button
          className="btn icon pool-toggle"
          disabled={cards.length === 0}
          aria-expanded={open && cards.length > 0}
          aria-label={t("Havuz")}
          title={
            open
              ? t("Havuzu kapat: ızgara bütün yüksekliği alır")
              : t("Havuzu aç")
          }
          onClick={toggle}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
            focusable="false"
          >
            {/* The drawer is at the BOTTOM, so the arrow points the way the
                click sends it: down to close it, up to open it. It was the
                other way round for a version and read as a state rather than
                an action — "Programda havuzu aç tuşu ters gibi". */}
            <path
              d={open ? "M5 9l7 7 7-7" : "M5 15l7-7 7 7"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span className="pool-count">
          {cards.length === 0 ? (
            <>
              <strong>{t("Hepsi yerleşti")}</strong>
              <span className="pool-sub">
                {t("{n} dersin tamamı programda", { n: completed })}
              </span>
            </>
          ) : (
            <>
              {/* "blok" and not "ders": a 2+1 lesson leaves two cards here and
                  calling them two lessons would not add up against Kurulum. */}
              <strong>{t("{n} blok bekliyor", { n: cards.length })}</strong>
              <span className="pool-sub">
                {/* Narrowed, the head says so with the number it is hiding.
                    A tray that quietly shows a twelfth of what is left would
                    make "hepsi yerleşti" a lie one click away. */}
                {narrowed
                  ? t("{n} blok süzgeç dışında · sürükleyip bırakın", {
                      n: total - cards.length,
                    })
                  : t("{n} saat · sürükleyip bırakın", { n: remainingHours })}
              </span>
            </>
          )}
        </span>

        {/* HOW THE TRAY IS ARRANGED, on the tray. Two positions, not two
            preferences: they say what is being looked at right now, so they
            live in `toolState` and cost no storage (see PoolSort there). */}
        {(cards.length > 0 || filter !== "") && (
          <div className="pool-tools">
            <label className="pool-pick">
              <span>{t("Sırala")}</span>
              <select
                value={sort}
                aria-label={t("Havuz sıralaması")}
                onChange={(e) => setSort(e.target.value as PoolSort)}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.label)}
                  </option>
                ))}
              </select>
            </label>
            {/* Only when there is something to choose between: one branch in
                the tray makes this a control that cannot be answered
                differently — the same rule the lesson form's branch box
                follows. */}
            {(subjects.length > 1 || filter !== "") && (
              <label className="pool-pick">
                <span>{t("Branş")}</span>
                <select
                  value={filter}
                  aria-label={t("Havuz süzgeci")}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">{t("Tüm branşlar")}</option>
                  {subjects.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <ContextMenu.Root open={menuOpen} onOpenChange={onMenuOpenChange}>
        <ContextMenu.Trigger asChild onContextMenu={openMenu}>
          <div className="pool-list">
            {groups.map((g) => (
          <section className="pool-group" key={g.key} aria-label={g.label}>
            {/* The heading is what the reader asked for: a break between one
                row's cards and the next, rather than one more 7px gap. It also
                makes the order VISIBLE — pick "branşa göre" and the headings
                become branches. */}
            <h3 className="pool-group-label">
              {/* The dot is the ROW's colour, so it is drawn only when the
                  heading IS a row. Over "7 saat kaldı" it would be the colour
                  of whichever card happened to sort first — a mark that means
                  nothing is worse than no mark. */}
              {(sort === "row" || sort === "name") && (
                <span
                  className="color-dot"
                  style={{
                    background: paletteColor(g.stacks[0]?.cards[0]?.color ?? 0),
                  }}
                />
              )}
              {g.label}
              <span className="pool-group-count">{g.cards}</span>
            </h3>
            <div className="pool-group-cards">
              {g.stacks.map((s) => {
                const c = s.cards[0]!;
                return (
                  <div
                    key={s.key}
                    className="pool-stack"
                    data-count={s.cards.length}
                    style={
                      {
                        "--layers": Math.min(s.cards.length - 1, 2),
                        "--stack-color": paletteColor(c.color),
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className={`pool-card${c.masked ? " masked-scope" : ""}`}
                      data-size={c.size}
                      data-lesson={c.lessonId}
                      style={{ background: paletteColor(c.color) }}
                      onPointerDown={
                        c.masked ? undefined : (e) => onStart(e, c.lessonId, c.size)
                      }
                      title={
                        t("{ust} · {alt} {brans} · {boy} saatlik blok", {
                          ust: c.top,
                          alt: c.bottom,
                          brans: c.subject,
                          boy: c.size,
                        }) +
                        (s.cards.length > 1
                          ? t(" · {n} tane bekliyor", { n: s.cards.length })
                          : "") +
                        t(" · dersin {yerlesen}/{toplam} saati yerleşti", {
                          yerlesen: c.placed,
                          toplam: c.total,
                        })
                      }
                    >
                      <span className="card-top">{c.top}</span>
                      <span className="card-bottom">{c.bottom}</span>
                      <span className="counter">
                        {c.placed}/{c.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
            ))}
          </div>
        </ContextMenu.Trigger>
        {menu}
      </ContextMenu.Root>
    </aside>
  );
}

/** Same drag isolation as Grid: a closed menu's fresh portal is not pool data. */
function samePoolProps(a: Props, b: Props): boolean {
  return (
    a.cards === b.cards &&
    a.completed === b.completed &&
    a.total === b.total &&
    a.sort === b.sort &&
    a.setSort === b.setSort &&
    a.filter === b.filter &&
    a.setFilter === b.setFilter &&
    a.subjects === b.subjects &&
    a.onStart === b.onStart &&
    a.onMenu === b.onMenu &&
    a.menuOpen === b.menuOpen &&
    a.onMenuOpenChange === b.onMenuOpenChange &&
    (!a.menuOpen || a.menu === b.menu)
  );
}

export default memo(LessonPool, samePoolProps);
