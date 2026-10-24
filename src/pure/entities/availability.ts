// Closed hours: setting them, the whole week at once, and the hours left open.

import type { Id, State } from '../../leaf/model';
import { closedKey } from '../constraints';
import { allCells } from './roster';

// ------------------------------------------------------------- availability

/** Works for a teacher, a class or a room — ids are unique across all three. */
export function setAvailability(
  d: State,
  entityId: Id,
  cells: Array<{ day: number; hour: number }>,
  makeUnavailable: boolean,
): State {
  const unavailable = { ...d.unavailable };
  for (const { day, hour } of cells) {
    const k = closedKey(entityId, day, hour);
    if (makeUnavailable) unavailable[k] = 1;
    else delete unavailable[k];
  }
  return { ...d, unavailable };
}

/**
 * How many of the week's cells are still OPEN for one teacher, class or room.
 *
 * Lived inside Availability.tsx as a nested double loop; it is a count over the
 * data, not a rendering concern, and the availability panel now shows it for
 * every entity at once rather than only for the selected one.
 */
export function openHours(d: State, entityId: Id): number {
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  let closed = 0;
  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      if (d.unavailable[closedKey(entityId, g, s)] !== undefined) closed++;
    }
  }
  return dayCount * hourCount - closed;
}

/** Marks the entity's WHOLE week as available / unavailable. */
export function setWholeWeek(d: State, entityId: Id, makeUnavailable: boolean): State {
  return setAvailability(d, entityId, allCells(d), makeUnavailable);
}
