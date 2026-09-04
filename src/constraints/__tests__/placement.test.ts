// Reading the grid and writing to it — including the equivalence that keeps
// the solver honest: occupy/vacate must land exactly where place()+buildIndex()
// would (pitfall: they are two implementations of one rule).

import {
  blocker,
  blockSpans,
  countPlacedHours,
  occupy,
  pendingBlocks,
  place,
  placedBlocks,
  placementKey,
  vacate,
  buildIndex,
} from '../index';
import { activeProgram, replaceActiveGrid } from '../../programs';
import type { State } from '../../types';
import { build, lessonById, why, withLesson } from '../../testing/constraintFixture';

describe('placedBlocks ve pendingBlocks — ızgaradaki bloklar', () => {
  it('boş ızgarada yerleşmiş blok yok, bekleyen bloklar plânın kendisi', () => {
    const d = build();
    const x6 = d.lessons[5]!;
    expect(placedBlocks(d, x6)).toEqual([]);
    expect(pendingBlocks(d, x6)).toEqual([2, 1]);
  });

  it('bitişik üç hücre 2+1 okunuyor — 1+2 değil', () => {
    let d = place(build(), 'x6', 0, 0); // the double
    d = place(d, 'x6', 0, 2, 1); // the single, right after it
    expect(placedBlocks(d, d.lessons[5]!)).toEqual([
      { day: 0, hour: 0, size: 2 },
      { day: 0, hour: 2, size: 1 },
    ]);
    expect(pendingBlocks(d, d.lessons[5]!)).toEqual([]);
  });

  it('ikili bütçesi bitince kalan hücreler tek saat sayılıyor', () => {
    // x1 is 4 hours with NO doubles, so four adjacent cells are four blocks.
    let d = build();
    for (let h = 0; h < 4; h++) d = place(d, 'x1', 0, h, 1);
    expect(placedBlocks(d, d.lessons[0]!).map((b) => b.size)).toEqual([1, 1, 1, 1]);
  });

  it('gün ve saat sırasıyla okunuyor', () => {
    let d = place(build(), 'x3', 1, 2); // later day first
    d = place(d, 'x3', 0, 0);
    expect(placedBlocks(d, d.lessons[2]!)).toEqual([
      { day: 0, hour: 0, size: 2 },
      { day: 1, hour: 2, size: 2 },
    ]);
  });

  it('yarısı yerleşmiş ders kalanını doğru söylüyor', () => {
    const d = place(build(), 'x6', 0, 0); // the double is down
    expect(pendingBlocks(d, d.lessons[5]!)).toEqual([1]);
  });

  // A hand-edited backup, or hours lowered under a laid-out lesson, can leave
  // the grid holding a shape the split does not describe. It must not throw and
  // it must not report negative work.
  it('plânda olmayan şekil bekleyeni eksiye düşürmüyor', () => {
    let d = build();
    for (let h = 0; h < 4; h++) d = place(d, 'x4', 0, h, 1); // x4 only asks for 2 hours
    expect(pendingBlocks(d, d.lessons[3]!)).toEqual([]);
  });

  // The contract says BIGGEST FIRST, and with only 1 and 2 in the model there
  // was no way to tell that apart from "twos first". These are the cases that
  // can tell.
  it('koşu içinde EN BÜYÜK blok önce alınıyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 4, blocks: [3] }, [[0, 0], [0, 1], [0, 2], [0, 3]]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 1]);
  });

  it('3+2 tek koşuda 3 sonra 2 okunuyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 2]);
  });

  // A three cannot fit a run of two, so the run takes the biggest that DOES.
  it('koşuya sığmayan boy atlanıyor, sığan alınıyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [
      [0, 0], [0, 1], // a run of 2
      [1, 0], [1, 1], [1, 2], // a run of 3
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1'))).toEqual([
      { day: 0, hour: 0, size: 2 },
      { day: 1, hour: 0, size: 3 },
    ]);
  });

  it('bütçe bitince kalan hücreler tek saat', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 1, 1]);
  });

  it('karışık boylu ders kalanını doğru söylüyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [[1, 0], [1, 1]]);
    expect(pendingBlocks(d, lessonById(d, 'y1'))).toEqual([3]);
  });
});

describe('blockSpans — bir tek kaynak', () => {
  it('yalnız blok BAŞLARINI, boylarıyla veriyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 4, blocks: [3] }, [[0, 0], [0, 1], [0, 2], [0, 3]]);
    const spans = blockSpans(d);
    expect(spans.get(placementKey('s510', 0, 0))).toBe(3);
    expect(spans.get(placementKey('s510', 0, 1))).toBeUndefined();
    expect(spans.get(placementKey('s510', 0, 2))).toBeUndefined();
    expect(spans.get(placementKey('s510', 0, 3))).toBe(1);
  });

  // The whole point of the map: every drawing of the week cuts a run of hours
  // in the same places, so the grid, the two printed tables and the auditor can
  // never disagree about where one block ends (pitfall 75).
  it('placedBlocks ile birebir aynı sınırları veriyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    const spans = blockSpans(d);
    for (const b of placedBlocks(d, lessonById(d, 'y1'))) {
      expect(spans.get(placementKey('s510', b.day, b.hour))).toBe(b.size);
    }
    expect(spans.size).toBe(placedBlocks(d, lessonById(d, 'y1')).length);
  });
});

describe('countPlacedHours — sayaç', () => {
  it('bloklu dersi saat sayısıyla sayar', () => {
    let d = place(build(), 'x4', 0, 0); // blockSize=2 -> 2 hours
    d = place(d, 'x1', 0, 2); // blockSize=1 -> 1 hour
    expect(countPlacedHours(d, 'x4')).toBe(2);
    expect(countPlacedHours(d, 'x1')).toBe(1);
    expect(countPlacedHours(d, 'x3')).toBe(0);
    expect(buildIndex(d).placedHours.get('x4')).toBe(2);
  });
});


describe('occupy / vacate — yerinde yerleştirme', () => {
  /** Everything blocker() and the rules can read, as one comparable value. */
  function snapshot(d: State) {
    const ix = buildIndex(d);
    return {
      placements: { ...activeProgram(d).placements },
      teacherBusy: [...ix.teacherBusy.entries()].sort(),
      roomBusy: [...ix.roomBusy.entries()].sort(),
      placedHours: [...ix.placedHours.entries()].sort(),
    };
  }

  function mutable(d: State) {
    const placements = { ...activeProgram(d).placements };
    const work: State = replaceActiveGrid(d, { placements });
    return { work, placements, ix: buildIndex(work) };
  }

  function live(placements: Record<string, string>, ix: ReturnType<typeof buildIndex>) {
    return {
      placements: { ...placements },
      teacherBusy: [...ix.teacherBusy.entries()].sort(),
      roomBusy: [...ix.roomBusy.entries()].sort(),
      placedHours: [...ix.placedHours.entries()].sort(),
    };
  }

  it('tek blok: place + buildIndex ile birebir aynı', () => {
    const d = build();
    const { work, placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x1', 0, 1)));
    expect(activeProgram(work).placements).toBe(placements); // the state really shares the object
  });

  it('çok saatlik blok da aynı', () => {
    const d = build();
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2); // x6 is 2+1; the first block is the double
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x6', 1, 0)));
  });

  it('üst üste yerleştirmeler de aynı', () => {
    const d = build();
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 0, 1);
    occupy(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2); // x3 is 2+2
    occupy(placements, ix, d.lessons[1]!, 'dA', 1, 3, 1);

    let expected = place(d, 'x1', 0, 0);
    expected = place(expected, 'x3', 0, 1);
    expected = place(expected, 'x2', 1, 3);
    expect(live(placements, ix)).toEqual(snapshot(expected));
  });

  it('vacate her şeyi tam olarak geri alıyor', () => {
    const d = build();
    const before = snapshot(d);
    const { placements, ix } = mutable(d);

    occupy(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2);
    occupy(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2);
    vacate(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2);
    vacate(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2);

    expect(live(placements, ix)).toEqual(before);
  });

  it('yerleşmiş bir programın üstüne eklenip geri alınabiliyor', () => {
    const d = place(build(), 'x1', 0, 0);
    const before = snapshot(d);
    const { placements, ix } = mutable(d);

    occupy(placements, ix, d.lessons[1]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x2', 0, 1)));

    vacate(placements, ix, d.lessons[1]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(before);
  });

  it('dersliksiz sınıfta roomBusy hiç dokunulmuyor', () => {
    const d: State = {
      ...build(),
      classes: build().classes.map((c) => (c.id === 's510' ? { ...c, roomId: null } : c)),
    };
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, null, 0, 0, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x1', 0, 0)));
    expect(ix.roomBusy.size).toBe(0);
  });

  it('occupy sonrası blocker aynı cevabı veriyor', () => {
    const d = build();
    const { work, placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 1, 1); // x1 -> 510, Monday, hour 2

    // The class is busy, and so is MÇ.
    expect(blocker(work, ix, 'x1', 0, 1)).toBe('510 sınıfının Pazartesi 2 saatinde Matematik var');
    expect(blocker(work, ix, 'x2', 0, 1)).toBe('MÇ Pazartesi 2 saatinde 510 sınıfında');
    // The room is shared, so 511 cannot use it either.
    expect(why(place(d, 'x1', 0, 1), 'x5', 0, 1)).toBe(blocker(work, ix, 'x5', 0, 1));
  });
});

// Every message names a day and an hour, so two cells blocked for the SAME
// underlying reason produce two different sentences. The code is what anything
// counting reasons has to count.
