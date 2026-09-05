// The reader's own lock: what it holds against, and what it must not hold
// against (the auditor, which asks a question about the RULES).

import { dropMap } from '../dropMapping';
import { blockAt, blockStart, buildIndex, place } from '../placement';
import { blockCells, blockPinned, removeBlock, setBlockPinned } from '../pinning';
import { sanitize } from '../sanitize';
import { placementKey } from '../../keys';
import { activeProgram } from '../../state/programs';
import { build } from '../../testing/constraintFixture';

describe('blockStart ve removeBlock', () => {
  it('blok kaldırılınca tüm saatleri temizlenir', () => {
    const d = removeBlock(place(build(), 'x4', 0, 0), 's510', 0, 0);
    expect(Object.keys(activeProgram(d).placements)).toHaveLength(0);
  });

  it('ortadan tıklanan blok tamamen kalkar', () => {
    // x6 is 2+1, so a fresh grid places the double: hours 0 and 1.
    const d = removeBlock(place(build(), 'x6', 0, 0), 's433', 0, 1); // click its second hour
    expect(Object.keys(activeProgram(d).placements)).toHaveLength(0);
  });

  it('bitişik iki bloğu birbirine karıştırmaz', () => {
    // x3 is 2+2. First 0-1, then 2-3. Same lessonId, adjacent. Clicking hour 2
    // must remove only the SECOND block; naive backwards walking would delete
    // all four.
    let d = place(build(), 'x3', 0, 0);
    d = place(d, 'x3', 0, 2);
    expect(blockStart(d, 's433', 0, 2)).toBe(2);
    expect(blockStart(d, 's433', 0, 1)).toBe(0);

    const after = removeBlock(d, 's433', 0, 3);
    expect(Object.keys(activeProgram(after).placements).sort()).toEqual([
      placementKey('s433', 0, 0),
      placementKey('s433', 0, 1),
    ]);
  });

  // THE case v7 created. Three adjacent cells of one lesson used to be
  // unreadable — [2,1] or [1,2]? — so the split itself decides, doubles first
  // in day/hour order, and the whole program reads them the same way.
  it('2+1 aynı güne bitişik konsa da İKİ blok olarak okunuyor', () => {
    let d = place(build(), 'x6', 0, 0); // the double: hours 0 and 1
    d = place(d, 'x6', 0, 2, 1); // the single, right beside it: hour 2

    expect(blockAt(d, 's433', 0, 0)).toEqual({ day: 0, hour: 0, size: 2 });
    expect(blockAt(d, 's433', 0, 1)).toEqual({ day: 0, hour: 0, size: 2 });
    expect(blockAt(d, 's433', 0, 2)).toEqual({ day: 0, hour: 2, size: 1 });

    // Clicking the single takes one cell, not the run.
    const after = removeBlock(d, 's433', 0, 2);
    expect(Object.keys(activeProgram(after).placements).sort()).toEqual([
      placementKey('s433', 0, 0),
      placementKey('s433', 0, 1),
    ]);
  });

  it('boş hücrede blockStart null döner ve removeBlock durumu değiştirmez', () => {
    const d = build();
    expect(blockStart(d, 's510', 0, 0)).toBeNull();
    expect(removeBlock(d, 's510', 0, 0)).toBe(d);
  });
});

// THE contract v7 needed. `placements` holds one lessonId per hour and no block
// boundary, so a run of three cells of one lesson is readable as [2,1] or as
// [1,2] and nothing on the grid tells them apart. One rule decides — doubles
// first, in day/hour order, while the lesson still has doubles to account for —
// and the grid, the pool, the right-click and the auditor all obey it.

// ---------------------------------------------------------------------------
// PINNING (schema v10).
//
// One rule with no exceptions: nothing takes a pinned block down but unpinning
// it. Four ways in — right click, the menu, Delete, and a drop that would evict
// — so the refusal lives in `removeBlock` and `dropMap` rather than in any of
// the buttons, and these tests ask the two functions rather than the buttons.

describe('sabitleme', () => {
  it('setBlockPinned bloğun BÜTÜN saatlerini işaretler, tek saatini değil', () => {
    const d = setBlockPinned(place(build(), 'x4', 0, 1), 's510', 0, 1, true);
    // x4 is a single 2-hour block, so both hours carry the pin.
    expect(Object.keys(activeProgram(d).pinned).sort()).toEqual(
      [placementKey('s510', 0, 1), placementKey('s510', 0, 2)].sort(),
    );
    // Asked at either hour, the answer is the same: a pin is about the BLOCK.
    expect(blockPinned(d, 's510', 0, 1)).toBe(true);
    expect(blockPinned(d, 's510', 0, 2)).toBe(true);
  });

  it('sabitleme kaldırılınca hiçbir iz kalmıyor', () => {
    let d = setBlockPinned(place(build(), 'x4', 0, 1), 's510', 0, 1, true);
    d = setBlockPinned(d, 's510', 0, 2, false);
    expect(activeProgram(d).pinned).toEqual({});
    expect(blockPinned(d, 's510', 0, 1)).toBe(false);
  });

  it('boş hücrede sabitlenecek bir şey yok', () => {
    const d = build();
    expect(setBlockPinned(d, 's510', 0, 0, true)).toBe(d);
    expect(blockCells(d, 's510', 0, 0)).toEqual([]);
    expect(blockPinned(d, 's510', 0, 0)).toBe(false);
  });

  it('removeBlock sabitlenmiş bloğu KALDIRMIYOR', () => {
    const placed = place(build(), 'x4', 0, 1);
    const pinnedState = setBlockPinned(placed, 's510', 0, 1, true);
    // Same object back, so the store pushes no undo step either.
    expect(removeBlock(pinnedState, 's510', 0, 1)).toBe(pinnedState);
    expect(removeBlock(pinnedState, 's510', 0, 2)).toBe(pinnedState);
    // ...and the very same call works once the pin is gone, which is what
    // makes this a test of the pin and not of some other refusal.
    const free = setBlockPinned(pinnedState, 's510', 0, 1, false);
    expect(Object.keys(activeProgram(removeBlock(free, 's510', 0, 1)).placements)).toHaveLength(0);
  });

  it('dropMap sabitlenmiş dersi TAHLİYE ETMİYOR, ve sebebini söylüyor', () => {
    // x4 sits on 510 at Monday 1-2. x1 belongs to the same class, so without a
    // pin that cell is the one refusal a drop is allowed to overrule.
    const placed = place(build(), 'x4', 0, 1);
    const free = dropMap(placed, buildIndex(placed), 'x1');
    expect(free.get('0|1')!.blocked).toBeNull();
    expect(free.get('0|1')!.evicts).toEqual(['x4']);

    const locked = setBlockPinned(placed, 's510', 0, 1, true);
    const map = dropMap(locked, buildIndex(locked), 'x1');
    const verdict = map.get('0|1')!;
    expect(verdict.blocked).not.toBeNull();
    expect(verdict.blocked).toContain('sabitlenmiş');
    // Concrete, like every other refusal: it names the class and the hour.
    expect(verdict.blocked).toContain('510');
    expect(verdict.evicts).toEqual([]);
  });

  it('sanitize YETİM pini düşürüyor — altındaki ders gidince pin de gider', () => {
    let d = setBlockPinned(place(build(), 'x4', 0, 1), 's510', 0, 1, true);
    // Take the lesson out from under it the one way that is allowed to: the
    // lesson itself stops existing.
    d = { ...d, lessons: d.lessons.filter((x) => x.id !== 'x4') };
    const clean = sanitize(d);
    expect(activeProgram(clean).placements).toEqual({});
    expect(activeProgram(clean).pinned).toEqual({});
  });

  it('sanitize dokunulmamış pini KORUYOR — her yüklemede silinmiyor', () => {
    const d = setBlockPinned(place(build(), 'x4', 0, 1), 's510', 0, 1, true);
    expect(activeProgram(sanitize(d)).pinned).toEqual(activeProgram(d).pinned);
  });

  it('gün sayısı azalınca taşan pin de siliniyor', () => {
    const d = setBlockPinned(place(build(), 'x4', 1, 1), 's510', 1, 1, true);
    expect(Object.keys(activeProgram(d).pinned)).toHaveLength(2);
    const shrunk = sanitize({
      ...d,
      settings: { ...d.settings, days: d.settings.days.slice(0, 1) },
    });
    expect(activeProgram(shrunk).placements).toEqual({});
    expect(activeProgram(shrunk).pinned).toEqual({});
  });
});
