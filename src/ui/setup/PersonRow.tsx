// One row of the Öğretmenler or Sınıflar list: text, and the name opens the
// person's page (Sadeleşme, K5). The last cell is a small status — the days
// the person does not come, the hours closed, or that the week cannot fit.

import type { ReactNode } from 'react';
import { type Id, type State, paletteColor } from '../../leaf/model';
import { closedKey } from '../../pure/constraints';
import { openHours, shortDay, weeklyLoad } from '../../pure/entities';
import { useInspect } from '../program';
import { useT } from '../common';

interface Props {
  state: State;
  kind: 'teacher' | 'class';
  id: Id;
  name: string;
  color: number;
  /** The drag handle cell, from `useRowOrder`. */
  grip: ReactNode;
  /** The cells between the name and the status. */
  cells: ReactNode[];
}

export function PersonRow({ state, kind, id, name, color, grip, cells }: Props) {
  const t = useT();
  const inspect = useInspect();
  const { days, hours } = state.settings;

  // "Ayşe Hoca salı gelemiyor" is how it is said, so a whole day is named and
  // the rest is counted.
  const wholeDays: string[] = [];
  let partial = 0;
  days.forEach((day, g) => {
    const closed = hours.filter((_, s) => state.unavailable[closedKey(id, g, s)] !== undefined);
    if (closed.length === hours.length && hours.length > 0) wholeDays.push(shortDay(day.name));
    else partial += closed.length;
  });
  const over = weeklyLoad(state, kind, id) - openHours(state, id);
  const status = [
    wholeDays.length === 0 ? '' : wholeDays.join(', '),
    partial === 0 ? '' : t('{n} saat kapalı', { n: partial }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <tr
      data-row-name={name}
      data-person-id={id}
      // The whole row answers a mouse; the name is the keyboard's way in, so
      // the row is not a second Tab stop.
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input, select, .grip-col') === null) {
          // Focus first, so closing the page hands the keyboard back here.
          e.currentTarget.querySelector<HTMLElement>('.person-open')?.focus();
          inspect(kind, id);
        }
      }}
    >
      {grip}
      <td>
        <button type="button" className="person-open" onClick={() => inspect(kind, id)}>
          <span className="row-dot" style={{ background: paletteColor(color) }} />
          {name}
        </button>
      </td>
      {cells.map((cell, i) => (
        <td key={i} className={typeof cell === 'number' ? 'num' : undefined}>
          {cell}
        </td>
      ))}
      <td className="person-status">
        {over > 0 && (
          <span className="bad">{t('{n} saat fazla', { n: over }) + (status ? ' · ' : '')}</span>
        )}
        {status}
      </td>
    </tr>
  );
}
