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
// The card list stays MOUNTED when the drawer is closed. Rendering it away
// would be cheaper and would quietly make `.pool-card` count zero — and
// twenty-odd tests ask exactly that question to find out how much is left.

import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { Id } from "../types";
import { paletteColor } from "../palette";
import {
  DOCK_H_MIN,
  readDock,
  readDockHeight,
  writeDock,
  writeDockHeight,
} from "../theme";
import { attachSplitter, maxDockHeight } from "../poolSplit";

export interface PoolCard {
  /** React identity: one lesson can put several cards on the tray. */
  key: string;
  lessonId: Id;
  /** How many hours THIS card covers when it lands: 1 or 2. */
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
}

interface Props {
  cards: PoolCard[];
  completed: number;
  onStart: (e: React.PointerEvent, lessonId: Id, size: number) => void;
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
 * What is NOT happening here: nothing is being merged away. Every block keeps
 * its own `.pool-card`, so the count in the head, `pendingBlocks()` and the
 * forty tests that ask how much is left all keep meaning the same thing. The
 * deck is a LAYOUT of the same elements (see `.pool-stack` in styles.css).
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
    if (last !== undefined && head !== undefined && head.lessonId === c.lessonId && head.size === c.size) {
      last.cards.push(c);
    } else {
      piles.push({ key: c.key, cards: [c] });
    }
  }
  return piles;
}

export default function LessonPool({ cards, completed, onStart }: Props) {
  // The cards ARE the hours left now: one card per block still owed, so adding
  // up their sizes is the answer. Summing `total - placed` per card would count
  // one lesson's whole remainder once per card it still has out.
  const remainingHours = cards.reduce((sum, c) => sum + c.size, 0);
  const stacks = stackCards(cards);
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

  return (
    <aside
      // Nothing left to place: the drawer keeps its head (which is now the
      // sentence saying so) and gives the height back to the grid. A 176px
      // tray of nothing is 176px that was carrying five teachers.
      className={open && cards.length > 0 ? "pool" : "pool pool-closed"}
      aria-label="Yerleşmeyi bekleyen dersler"
    >
      {/* The seam. It is a control before it is a border: 1px of ink, 9px of
          target, and reachable from the keyboard because a drag is not. */}
      <div
        ref={handle}
        className="pool-split"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Havuz yüksekliği"
        aria-valuenow={height}
        aria-valuemin={DOCK_H_MIN}
        aria-valuemax={Math.round(ceiling * 100) / 100}
        tabIndex={open ? 0 : -1}
        title="Sürükleyerek havuzun boyunu ayarlayın"
      />

      <div className="pool-head">
        <button
          className="btn icon pool-toggle"
          disabled={cards.length === 0}
          aria-expanded={open && cards.length > 0}
          aria-label="Havuz"
          title={
            open ? "Havuzu kapat: ızgara bütün yüksekliği alır" : "Havuzu aç"
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
              <strong>Hepsi yerleşti</strong>
              <span className="pool-sub">
                {completed} dersin tamamı programda
              </span>
            </>
          ) : (
            <>
              {/* "blok" and not "ders": a 2+1 lesson leaves two cards here and
                  calling them two lessons would not add up against Kurulum. */}
              <strong>{cards.length} blok bekliyor</strong>
              <span className="pool-sub">
                {remainingHours} saat · sürükleyip bırakın
              </span>
            </>
          )}
        </span>
      </div>

      <div className="pool-list">
        {stacks.map((s) => (
          <div
            key={s.key}
            className="pool-stack"
            data-count={s.cards.length}
            // How many layers peek out below the top card. Capped at two, so a
            // lesson owing eight hours is a deck and not a staircase. The exact
            // number is on `data-count` and in the card's title; it used to be
            // a corner badge too, and that came off on 2026-08-28.
            style={{ "--layers": Math.min(s.cards.length - 1, 2) } as React.CSSProperties}
          >
            {s.cards.map((c, i) => (
              <div
                key={c.key}
                className="pool-card"
                data-size={c.size}
                // Everything under the top card is DRAWING. It is the same
                // block and would do the same thing if dropped, so it takes no
                // pointer and says nothing to a screen reader. It still carries
                // its full text: `.pool-card` counts one WAITING BLOCK, here
                // and in the forty tests that ask how much is left.
                aria-hidden={i > 0 ? true : undefined}
                style={{ background: paletteColor(c.color) }}
                onPointerDown={i === 0 ? (e) => onStart(e, c.lessonId, c.size) : undefined}
                title={
                  i > 0
                    ? undefined
                    : `${c.top} · ${c.bottom} ${c.subject} · ${c.size} saatlik blok` +
                      (s.cards.length > 1 ? ` · ${s.cards.length} tane bekliyor` : "") +
                      ` · dersin ${c.placed}/${c.total} saati yerleşti`
                }
              >
                <span className="card-top">{c.top}</span>
                <span className="card-bottom">{c.bottom}</span>
                <span className="counter">
                  {c.placed}/{c.total}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
