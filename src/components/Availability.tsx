// Closed hours for a teacher, a class or a room. Shown as a grey hatched "x"
// in the main grid.
//
// Clicking 25 teachers x 72 cells one by one is unacceptable, hence: paint by
// dragging, click a day header for the whole day, click an hour header for that
// hour across the week, and toggle everything at once.
//
// The three kinds share ONE grid and one dictionary: ids are unique across
// teachers, classes and rooms, so only the entity list at the top changes.

import { useMemo, useRef, useState } from "react";
import type React from "react";
import { sharedPeriods } from "../bell";
import { paletteColor } from "../palette";
import { KIND_ICON } from "./steps";
import { buildIndex, closedConflicts, closedKey } from "../constraints";
import type { Id, State } from "../types";
import {
  openHours,
  dayLabel,
  setAvailability,
  setWholeWeek,
  shortDay,
  subjectLabel,
  weeklyLoad,
} from "../entities";
// The module-level `entitiesOf` cannot hold a hook, so it uses the pure
// translator — the same one `constraints.ts` writes its sentences with.
import { t } from '../i18n';
import type { Kind } from "../toolState";
import { T } from './T';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  /** Whose closed hours. Owned by App; the tool strip above CHANGES it. */
  kind: Kind;
  /** Which one of them is open. */
  chosen: Id;
  setChosen: (next: Id) => void;
}

interface Entity {
  id: Id;
  label: string;
  short: string;
  /**
   * The name a HEADING can carry. `short` is what the sentences use, and for a
   * teacher that is the raw code — the panel above a whole week of somebody's
   * closed hours said "MÇ", which answers "whose" only if you already know.
   */
  full: string;
  /** Weekly lesson hours that must fit into the open cells. */
  load: number;
  /** Cells still open this week. */
  open: number;
  /** Palette index, or -1 for a room (rooms have no colour of their own). */
  color: number;
}

function entitiesOf(d: State, kind: Kind): Entity[] {
  if (kind === "teacher") {
    return d.teachers.map((x) => ({
      id: x.id,
      label: `${x.short} · ${x.name} (${subjectLabel(x.subject)})`,
      short: x.short,
      // Name first, code in brackets: the heading already ends with an em dash
      // ("… — müsait olmayan saatler") and "MÇ — Mehmet Çelik — müsait…" put
      // three clauses on one rule. The code still shows, because the code is
      // what the grid row is labelled with.
      full: `${x.name} (${x.short})`,
      load: weeklyLoad(d, "teacher", x.id),
      open: openHours(d, x.id),
      color: x.color,
    }));
  }
  if (kind === "class") {
    return d.classes.map((c) => ({
      id: c.id,
      label: c.name,
      short: t('{ad} sınıfı', { ad: c.name }),
      full: t('{ad} sınıfı', { ad: c.name }),
      load: weeklyLoad(d, "class", c.id),
      open: openHours(d, c.id),
      color: c.color,
    }));
  }
  return d.rooms.map((r) => ({
    id: r.id,
    label: r.name,
    short: t('{ad} dersliği', { ad: r.name }),
    full: t('{ad} dersliği', { ad: r.name }),
    load: weeklyLoad(d, "room", r.id),
    open: openHours(d, r.id),
    color: -1,
  }));
}

/** "kaç ÖĞRETMEN kapalı" — the word changes with the kind being edited. */
const KIND_WORD: Record<Kind, string> = {
  teacher: "öğretmen",
  class: "sınıf",
  room: "derslik",
};

const EMPTY_TEXT: Record<Kind, string> = {
  teacher: "öğretmen",
  class: "sınıf",
  room: "derslik",
};

const HINT: Record<Kind, string> = {
  teacher: "Öğretmenin gelemeyeceği saatlere tıklayın.",
  class:
    "Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.",
  room: "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.",
};

export default function Availability({
  state,
  change,
  kind,
  chosen,
  setChosen,
}: Props) {
  // Nothing is applied until the drag ends: painting 40 cells must not create
  // 40 separate undo steps.
  const [pending, setPending] = useState<Set<string> | null>(null);
  const paintMode = useRef(false);

  const list = entitiesOf(state, kind);
  const selected = list.find((x) => x.id === chosen) ?? list[0];

  if (selected === undefined) {
    return (
      <>
        <div className="panel">
          <h2>{t('Müsait olmayan saatler')}</h2>
          <div className="empty-screen">
            <strong>{t('Önce {ne} ekleyin.', { ne: t(EMPTY_TEXT[kind]) })}</strong>
            <T
              k="Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor."
              vars={{ ne: t(EMPTY_TEXT[kind]) }}
            />
          </div>
        </div>
      </>
    );
  }

  // `selected` widens again inside the hoisted functions below; pin the id here.
  const entityId = selected.id;

  const isClosed = (g: number, s: number): boolean =>
    state.unavailable[closedKey(entityId, g, s)] !== undefined;

  const shownClosed = (g: number, s: number): boolean => {
    if (pending !== null && pending.has(`${g}|${s}`)) return paintMode.current;
    return isClosed(g, s);
  };

  function startPaint(g: number, s: number) {
    paintMode.current = !isClosed(g, s); // invert the first cell, apply that to the rest
    setPending(new Set([`${g}|${s}`]));
  }

  function continuePaint(g: number, s: number) {
    setPending((previous) => {
      if (previous === null) return null;
      if (previous.has(`${g}|${s}`)) return previous;
      const next = new Set(previous);
      next.add(`${g}|${s}`);
      return next;
    });
  }

  function endPaint() {
    const set = pending;
    setPending(null);
    if (set === null || set.size === 0) return;

    const cells = [...set].map((k) => {
      const [g, s] = k.split("|");
      return { day: Number(g), hour: Number(s) };
    });
    change((d) => setAvailability(d, entityId, cells, paintMode.current));
  }

  /** Row header: the whole of one day. */
  function toggleDay(day: number) {
    const allClosed = state.settings.hours.every((_, s) => isClosed(day, s));
    const cells = state.settings.hours.map((_, s) => ({ day, hour: s }));
    change((d) => setAvailability(d, entityId, cells, !allClosed));
  }

  /** Column header: that lesson across the whole week. */
  function toggleHour(hour: number) {
    const allClosed = state.settings.days.every((_, g) => isClosed(g, hour));
    const cells = state.settings.days.map((_, g) => ({ day: g, hour }));
    change((d) => setAvailability(d, entityId, cells, !allClosed));
  }

  const open = selected.open;

  const conflicts = useMemo(
    () => closedConflicts(state, buildIndex(state)),
    [state],
  );
  const mine = conflicts.filter(
    (c) => c.teacherId === entityId || c.classId === entityId,
  ).length;

  // A column header carries one time; where the days disagree it stays empty.
  const clocks = useMemo(
    () =>
      sharedPeriods(
        state.settings.bell,
        state.settings.hours,
        state.settings.days,
      ),
    [state.settings],
  );

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>{t('{kim} · müsait olmayan saatler', { kim: selected.full })}</h2>

          <p className="hint">
            {t(HINT[kind])}{' '}
            {t(
              'Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki ders numarasına tıklayınca haftanın o saati değişir.',
            )}
          </p>

          <div className="scroll-x">
            <table
              className="availability"
              onPointerUp={endPaint}
              onPointerLeave={endPaint}
            >
              <thead>
                <tr>
                  <th className="corner-head" />
                  {state.settings.hours.map((hour, s) => (
                    <th
                      key={s}
                      onClick={() => toggleHour(s)}
                      title={t('Haftanın bu saatini değiştir')}
                    >
                      {hour}
                      <span className="hour-clock">
                        {clocks[s]?.start ?? ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.settings.days.map((day, g) => (
                  <tr key={g}>
                    <th
                      onClick={() => toggleDay(g)}
                      title={t('{gun}: bütün günü değiştir', { gun: dayLabel(day.name) })}
                    >
                      {shortDay(day.name)}
                    </th>
                    {state.settings.hours.map((_, s) => (
                      <td
                        key={s}
                        className={[
                          shownClosed(g, s) ? "closed" : "",
                          // The break sits at a different lesson on each row, so it
                          // cannot be a column: it is a thick edge on THIS cell.
                          day.longBreakAfter === s + 1 ? "break-after" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          startPaint(g, s);
                        }}
                        onPointerEnter={() => {
                          if (pending !== null) continuePaint(g, s);
                        }}
                      >
                        {shownClosed(g, s) ? "×" : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Under the grid, the week READ ACROSS everyone: which hours the whole
            school has closed. It is the thing this screen creates and could not
            see — twenty-five teachers all off on Tuesday afternoon is the
            reason the solver gets stuck, and it was only visible by clicking
            through twenty-five people one at a time. */}
        <div className="panel">
          <h2>{t('Haftanın darlığı')}</h2>
          <p className="hint">
            <T
              k="Her hücre, o saatte **kaç {ne} kapalı** olduğunu gösterir. Koyu bir sütun, o saate ders koymanın zor olacağı anlamına gelir. Program dizilirken genellikle burada tıkanılır."
              vars={{ ne: t(KIND_WORD[kind]) }}
            />
          </p>
          <div className="scroll-x">
            <table className="availability heat">
              <thead>
                <tr>
                  <th className="corner-head" />
                  {state.settings.hours.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.settings.days.map((day, g) => (
                  <tr key={g}>
                    <th scope="row">{shortDay(day.name)}</th>
                    {state.settings.hours.map((_, sIdx) => {
                      const n = list.filter(
                        (x) =>
                          state.unavailable[`${x.id}|${g}|${sIdx}`] !==
                          undefined,
                      ).length;
                      return (
                        <td
                          key={sIdx}
                          className={n === 0 ? "" : "closed"}
                          // The GROUND carries the count, not the ink: an
                          // opacity on the cell takes the number down with the
                          // background and makes the darkest hour the hardest
                          // to read — exactly backwards.
                          style={
                            n === 0
                              ? undefined
                              : ({
                                  "--heat": (
                                    0.2 +
                                    (0.8 * n) / Math.max(1, list.length)
                                  ).toFixed(2),
                                } as React.CSSProperties)
                          }
                          title={t('{gun} {ders}. ders: {kapali} / {toplam} kapalı', {
                            gun: dayLabel(day.name),
                            ders: sIdx + 1,
                            kapali: n,
                            toplam: list.length,
                          })}
                        >
                          {n === 0 ? "" : n}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Everything that used to be crammed ABOVE the grid. The list is the
          point: choosing among 25 teachers was a <select> showing one row at a
          time, and the number that decides whether a week is even possible —
          open hours against loaded hours — only appeared once you had picked
          somebody. Here every row carries it. */}
      <aside>
        <div className="panel">
          <h2>{t('Kimin saatleri')}</h2>

          {/* Plain buttons with `aria-current`, the way the tabs and the setup
              steps already mark "you are here". A listbox role would be more
              precise on paper and less predictable in practice. */}
          <div className="entity-list" aria-label={t('Müsaitlik listesi')}>
            {list.map((x) => (
              <button
                key={x.id}
                type="button"
                className="entity"
                data-id={x.id}
                aria-current={x.id === entityId}
                onClick={() => setChosen(x.id)}
              >
                {/* The kind's own symbol, and for a room it is the only mark
                    there is: rooms carry no colour, so their rows used to start
                    with nothing at all while teachers and classes started with
                    a dot. */}
                <span className="entity-icon" aria-hidden="true">
                  {KIND_ICON[kind]}
                </span>
                {x.color >= 0 && (
                  <span
                    className="row-dot"
                    style={{ background: paletteColor(x.color) }}
                  />
                )}
                <span className="entity-name">{x.label}</span>
                <span className="entity-count">
                  {x.open}/{x.load}
                  {x.open < x.load && " ⚠"}
                </span>
              </button>
            ))}
          </div>

          <div className="form-row spaced">
            <button
              className="btn"
              onClick={() => change((d) => setWholeWeek(d, entityId, false))}
            >{t('Tümünü aç')}</button>
            <button
              className="btn"
              onClick={() => change((d) => setWholeWeek(d, entityId, true))}
            >{t('Tümünü kapat')}</button>
          </div>

          <p className={open < selected.load ? "error-box" : "hint"}>
            <b>{selected.short}</b>: {open} saat açık, {selected.load} saat ders
            yüklenmiş.
            {open < selected.load &&
              ` ${selected.load - open} saat fazla, bu program dizilemez.`}
          </p>

          {/* Closing an hour never removes what is already on it (principle 6),
              so the only honest thing to do is say that it happened. */}
          {conflicts.length > 0 && (
            <div className="warn-box">
              <b>
                Kapattığınız saatlerde yerleşmiş {conflicts.length} ders var
                {mine > 0 && `, ${mine} tanesi ${selected.short}'de`}.
              </b>{" "}
              Hiçbiri silinmedi. <b>Program</b> sekmesinde kırmızı çerçeveyle,{" "}
              <b>Kontrol</b> sekmesinde tek tek listeleniyor.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
