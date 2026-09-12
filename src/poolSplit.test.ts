// @vitest-environment jsdom

// The drawer opens into the room the grid is not using, and this is the sum
// that decides how much. It is worth its own file because the number has three
// separate bounds and each one exists for a measured reason (2026-09-12, on
// the real school): the tray showed 19 of 205 cards while the grid's scroll box
// stood 75.6px taller than its own table with nothing drawn in the strip.

import { describe, expect, it } from 'vitest';
import { dockHeightForRoom, maxDockHeight } from './platform/poolSplit';
import { DOCK_H_MAX, DOCK_H_MIN, DOCK_H_STEP } from './platform/theme';

// jsdom resolves the root font size to 16px, so a rem is 16 CSS pixels here.
const REM = 16;
/** A body tall enough that the ceiling is DOCK_H_MAX and not the grid floor. */
const TALL = (DOCK_H_MAX + 26 + 10) * REM;

/** The stored 11rem drawer, with the room and the overflow varied per case. */
const at = (roomPx: number, overflowPx: number, storedRem = 11, bodyPx = TALL) =>
  dockHeightForRoom({ storedRem, roomPx, currentRem: storedRem, overflowPx, bodyPx });

describe('dockHeightForRoom', () => {
  it('opens into the room the grid is NOT using', () => {
    // 15rem of room and far more than that still to show.
    expect(at(15 * REM, 9999)).toBe(15);
  });

  it('gives the room back the moment the grid needs it', () => {
    // The table now overruns its box: the room is less than the drawer holds,
    // and the stored height stands rather than shrinking to fit it.
    expect(at(5 * REM, 9999)).toBe(11);
    expect(at(0, 9999)).toBe(11);
    expect(at(-400, 9999)).toBe(11);
  });

  it('never opens wider than the tray has to show', () => {
    // One card that already fits must not open a tray for fifty, however much
    // room the grid is leaving.
    expect(at(60 * REM, 0)).toBe(11);
    // A rem of overflow buys a rem of drawer, not forty-nine.
    expect(at(60 * REM, REM)).toBe(12);
  });

  it('stops at the ceiling, and at the one the splitter uses', () => {
    expect(at(99 * REM, 9999)).toBe(DOCK_H_MAX);
    expect(at(99 * REM, 9999)).toBeLessThanOrEqual(maxDockHeight(TALL));
    // In a short window the binding number is the room the grid must keep,
    // not 22rem.
    const short = (26 + 8) * REM;
    expect(at(99 * REM, 9999, 6, short)).toBe(maxDockHeight(short));
  });

  it('never returns less than the floor', () => {
    expect(at(0, 0, 0)).toBe(DOCK_H_MIN);
  });

  it('does not walk when measured again after it has grown', () => {
    // Both bounds are written to be independent of the drawer's own height, so
    // re-measuring after a world is loaded cannot creep. Here the tray is what
    // binds: 4rem still to show grows the drawer from 11 to 15, which eats all
    // 4rem of that overflow, and measuring again must still say 15.
    const first = at(20 * REM, 4 * REM);
    expect(first).toBe(15);
    const again = dockHeightForRoom({
      storedRem: 11,
      roomPx: 20 * REM,
      currentRem: first,
      overflowPx: 4 * REM - (first - 11) * REM,
      bodyPx: TALL,
    });
    expect(again).toBe(first);
  });

  it('lands on the step the preference is stored at', () => {
    const opened = at(11 * REM + 3.1, 9999);
    expect(Math.round(opened / DOCK_H_STEP) * DOCK_H_STEP).toBeCloseTo(opened, 10);
  });
});
