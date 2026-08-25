// Closed hours for a teacher, a class or a room. Shown as a grey hatched "x"
// in the main grid.
//
// Clicking 25 teachers x 72 cells one by one is unacceptable, hence: paint by
// dragging, click a day header for the whole day, click an hour header for that
// hour across the week, and toggle everything at once.
//
// The three kinds share ONE grid and one dictionary: ids are unique across
// teachers, classes and rooms, so only the entity list at the top changes.

import { useMemo, useRef, useState } from 'react';
import { sharedPeriods } from '../bell';
import { buildIndex, closedConflicts, closedKey } from '../constraints';
import type { Id, State } from '../types';
import { setAvailability, setWholeWeek, shortDay, weeklyLoad } from '../entities';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
}

type Kind = 'teacher' | 'class' | 'room';

const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'class', label: 'Sınıf' },
  { id: 'room', label: 'Derslik' },
];

interface Entity {
  id: Id;
  label: string;
  short: string;
  /** Weekly lesson hours that must fit into the open cells. */
  load: number;
}

function entitiesOf(d: State, kind: Kind): Entity[] {
  if (kind === 'teacher') {
    return d.teachers.map((t) => ({
      id: t.id,
      label: `${t.short} — ${t.name} (${t.subject})`,
      short: t.short,
      load: weeklyLoad(d, 'teacher', t.id),
    }));
  }
  if (kind === 'class') {
    return d.classes.map((c) => ({
      id: c.id,
      label: c.name,
      short: `${c.name} sınıfı`,
      load: weeklyLoad(d, 'class', c.id),
    }));
  }
  return d.rooms.map((r) => ({
    id: r.id,
    label: r.name,
    short: `${r.name} dersliği`,
    load: weeklyLoad(d, 'room', r.id),
  }));
}

const EMPTY_TEXT: Record<Kind, string> = {
  teacher: 'öğretmen',
  class: 'sınıf',
  room: 'derslik',
};

const HINT: Record<Kind, string> = {
  teacher: 'Öğretmenin gelemeyeceği saatlere tıklayın.',
  class: 'Sınıfın ders yapamayacağı saatlere tıklayın — o saatlere hiçbir ders konamaz.',
  room: 'Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.',
};

export default function Availability({ state, change }: Props) {
  const [kind, setKind] = useState<Kind>('teacher');
  const [chosen, setChosen] = useState<Id>('');
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
          <h2>Müsait olmayan saatler</h2>
          <div className="form-row">
            {KINDS.map((k) => (
              <button
                key={k.id}
                className="btn"
                aria-pressed={kind === k.id}
                onClick={() => {
                  setKind(k.id);
                  setChosen('');
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="empty-screen">
            <strong>Önce {EMPTY_TEXT[kind]} ekleyin.</strong>
            Müsaitlik girebilmek için <b>Kurulum</b> sekmesinden en az bir{' '}
            {EMPTY_TEXT[kind]} eklemeniz gerekiyor.
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
      const [g, s] = k.split('|');
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

  const closedCount = state.settings.days.reduce(
    (sum, _, g) => sum + state.settings.hours.filter((__, s) => isClosed(g, s)).length,
    0,
  );
  const total = state.settings.days.length * state.settings.hours.length;
  const open = total - closedCount;

  const conflicts = useMemo(() => closedConflicts(state, buildIndex(state)), [state]);
  const mine = conflicts.filter(
    (c) => c.teacherId === entityId || c.classId === entityId,
  ).length;

  // A column header carries one time; where the days disagree it stays empty.
  const clocks = useMemo(
    () => sharedPeriods(state.settings.bell, state.settings.hours, state.settings.days),
    [state.settings],
  );

  return (
    <>
      <div className="panel">
        <h2>Müsait olmayan saatler</h2>

        <div className="form-row">
          {KINDS.map((k) => (
            <button
              key={k.id}
              className="btn"
              aria-pressed={kind === k.id}
              onClick={() => {
                setKind(k.id);
                setChosen('');
              }}
            >
              {k.label}
            </button>
          ))}
        </div>

        <p className="hint">
          {HINT[kind]} Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz.
          Soldaki gün adına tıklayınca o günün tamamı, üstteki ders numarasına
          tıklayınca haftanın o saati değişir.
        </p>

        <div className="form-row">
          <label>
            {KINDS.find((k) => k.id === kind)?.label}{' '}
            <select
              value={selected.id}
              aria-label="Müsaitlik listesi"
              onChange={(e) => setChosen(e.target.value)}
            >
              {list.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" onClick={() => change((d) => setWholeWeek(d, entityId, false))}>
            Tümünü aç
          </button>
          <button className="btn" onClick={() => change((d) => setWholeWeek(d, entityId, true))}>
            Tümünü kapat
          </button>
        </div>

        <p className={open < selected.load ? 'error-box' : 'hint'}>
          <b>{selected.short}</b>: {open} saat açık, {selected.load} saat ders yüklenmiş.
          {open < selected.load && ` ${selected.load - open} saat fazla — bu program dizilemez.`}
        </p>

        {/* Closing an hour never removes what is already on it (principle 6),
            so the only honest thing to do is say that it happened. */}
        {conflicts.length > 0 && (
          <div className="warn-box">
            <b>
              Kapattığınız saatlerde yerleşmiş {conflicts.length} ders var
              {mine > 0 && `, ${mine} tanesi ${selected.short}'de`}.
            </b>{' '}
            Hiçbiri silinmedi. <b>Program</b> sekmesinde kırmızı çerçeveyle,{' '}
            <b>Kontrol</b> sekmesinde tek tek listeleniyor.
          </div>
        )}

        <div className="scroll-x">
          <table className="availability" onPointerUp={endPaint} onPointerLeave={endPaint}>
            <thead>
              <tr>
                <th className="corner-head" />
                {state.settings.hours.map((hour, s) => (
                  <th key={s} onClick={() => toggleHour(s)} title="Haftanın bu saatini değiştir">
                    {hour}
                    <span className="hour-clock">{clocks[s]?.start ?? ''}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.settings.days.map((day, g) => (
                <tr key={g}>
                  <th onClick={() => toggleDay(g)} title={`${day.name} — bütün günü değiştir`}>
                    {shortDay(day.name)}
                  </th>
                  {state.settings.hours.map((_, s) => (
                    <td
                      key={s}
                      className={[
                        shownClosed(g, s) ? 'closed' : '',
                        // The break sits at a different lesson on each row, so it
                        // cannot be a column: it is a thick edge on THIS cell.
                        day.longBreakAfter === s + 1 ? 'break-after' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        startPaint(g, s);
                      }}
                      onPointerEnter={() => {
                        if (pending !== null) continuePaint(g, s);
                      }}
                    >
                      {shownClosed(g, s) ? '×' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
