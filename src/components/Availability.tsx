// Closed hours for a teacher, a class or a room. Shown as a grey hatched "x"
// in the main grid.
//
// Clicking 25 teachers x 72 cells one by one is unacceptable, hence: paint by
// dragging, click a day header for the whole day, click an hour header for that
// hour across the week, and toggle everything at once.
//
// The three kinds share ONE grid and one dictionary: ids are unique across
// teachers, classes and rooms, so only the entity list at the top changes.

import { useRef, useState } from 'react';
import { closedKey } from '../constraints';
import type { Id, State } from '../types';
import { setAvailability, setWholeWeek, shortDay } from '../entities';

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
      load: d.lessons.filter((x) => x.teacherId === t.id).reduce((n, x) => n + x.weeklyHours, 0),
    }));
  }
  if (kind === 'class') {
    return d.classes.map((c) => ({
      id: c.id,
      label: c.name,
      short: `${c.name} sınıfı`,
      load: d.lessons.filter((x) => x.classId === c.id).reduce((n, x) => n + x.weeklyHours, 0),
    }));
  }
  return d.rooms.map((r) => {
    const ids = new Set(d.classes.filter((c) => c.roomId === r.id).map((c) => c.id));
    return {
      id: r.id,
      label: r.name,
      short: `${r.name} dersliği`,
      load: d.lessons.filter((x) => ids.has(x.classId)).reduce((n, x) => n + x.weeklyHours, 0),
    };
  });
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
      <div className="main">
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
      </div>
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

  function toggleColumn(day: number) {
    const allClosed = state.settings.hours.every((_, s) => isClosed(day, s));
    const cells = state.settings.hours.map((_, s) => ({ day, hour: s }));
    change((d) => setAvailability(d, entityId, cells, !allClosed));
  }

  function toggleRow(hour: number) {
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

  return (
    <div className="main">
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
          Gün adına tıklayınca o günün tamamı, saat numarasına tıklayınca haftanın o
          saati değişir.
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

        <div style={{ overflowX: 'auto' }}>
          <table className="availability" onPointerUp={endPaint} onPointerLeave={endPaint}>
            <thead>
              <tr>
                <th style={{ width: 60 }} />
                {state.settings.days.map((day, g) => (
                  <th key={g} onClick={() => toggleColumn(g)} title="Bütün günü değiştir">
                    {shortDay(day.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.settings.hours.map((hour, s) => (
                <tr key={s}>
                  <th onClick={() => toggleRow(s)} title="Haftanın bu saatini değiştir">
                    {hour}
                  </th>
                  {state.settings.days.map((_, g) => (
                    <td
                      key={g}
                      className={shownClosed(g, s) ? 'closed' : ''}
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
    </div>
  );
}
