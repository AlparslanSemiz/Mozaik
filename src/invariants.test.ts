// Property-based tests: the sentences that must hold for EVERY input, not for
// the seven inputs somebody thought of.
//
// Why this file exists next to the example-based suites rather than instead of
// them: an example says "this input gives that output" and is the right shape
// for a rule with a reason ("MÇ cannot be in two classes at once"). A property
// says "whatever the input, this stays true" and is the right shape for the
// defects that walk between the examples. The most expensive defects in this
// repository have all been of the second kind: pitfall 11 moved a whole
// timetable one day earlier, pitfall 97 made every released backup unreadable.
// Neither was a wrong answer to a question anyone had asked.
//
// fast-check generates the inputs and shrinks a failure down to the smallest
// one that still fails, which is the part that makes a red run readable. It is
// a devDependency: nothing here reaches dist/index.html.
//
// The worlds are deliberately small (at most 3 days, 4 hours, 2 teachers). The
// solver runs a real search on every generated case and a large world would
// buy nothing but seconds: a counterexample that needs 25 teachers to show up
// is not a counterexample, it is a performance test.

import fc from 'fast-check';
import { MAX_BLOCK, clampBlocks } from './blocks';
import { buildIndex, occupy, placedBlocks, vacate } from './constraints';
import { remapDays } from './entities';
import { PALETTE_SIZE, firstFreeColor } from './palette';
import { activeProgram } from './programs';
import { solve } from './solver';
import { parseState } from './store';
import { illegalBlocks, makeWorld, type WorldSpec } from './worlds';
import type { Day, Id, State } from './types';

// ------------------------------------------------------------------ üreteçler

const DAY_NAMES = ['Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar', 'Pazartesi'];

/**
 * A world small enough for the solver to finish and awkward enough to be worth
 * asking about: several lessons over few hours, so the grid runs out of room.
 */
const worldSpec = fc
  .record({
    days: fc.integer({ min: 1, max: 3 }),
    hours: fc.integer({ min: 2, max: 4 }),
    teacherCount: fc.integer({ min: 1, max: 2 }),
    classCount: fc.integer({ min: 1, max: 2 }),
    lessons: fc.array(
      fc.record({
        weeklyHours: fc.integer({ min: 1, max: 4 }),
        blockSize: fc.integer({ min: 1, max: MAX_BLOCK }),
        teacher: fc.nat(),
        group: fc.nat(),
      }),
      { minLength: 1, maxLength: 4 },
    ),
    sharedRoom: fc.boolean(),
  })
  .map(({ days, hours, teacherCount, classCount, lessons, sharedRoom }): WorldSpec => {
    const teachers = Array.from({ length: teacherCount }, (_, i) => ({
      id: `t${i}`,
      short: `T${i}`,
    }));
    // Sharing one room between both classes is what makes the room constraint
    // fire at all; without it that whole branch is never generated.
    const classes = Array.from({ length: classCount }, (_, i) => ({
      id: `c${i}`,
      name: `C${i}`,
      roomId: sharedRoom ? 'rA' : i === 0 ? 'rA' : null,
    }));
    return {
      days,
      hours,
      rooms: [{ id: 'rA', name: 'A' }],
      teachers,
      classes,
      lessons: lessons.map((l, i) => ({
        id: `l${i}`,
        classId: classes[l.group % classes.length]!.id,
        teacherId: teachers[l.teacher % teachers.length]!.id,
        weeklyHours: l.weeklyHours,
        blockSize: l.blockSize,
      })),
    };
  });

const world = worldSpec.map((spec) => makeWorld(spec));

/** A world the solver has already filled in as far as it could. */
const solvedWorld = world.map((d) => solve(d).state);

// ------------------------------------------------------------------ çözücü

describe('değişmez · çözücünün bıraktığı ızgara kurallara uyar', () => {
  // What this can and cannot see, measured rather than assumed (2026-09-12, on
  // the build of `a81c79a`).
  // `illegalBlocks` asks `blocker()`, which is the same function the solver
  // asks, so a mutation INSIDE blocker blinds the auditor with it: taking the
  // teacher clash check out of constraints.ts leaves all fourteen cases green.
  // That is pitfall 23 and it is why worlds.test.ts audits the auditor with
  // deliberately broken grids. What this does see is the solver drifting away
  // from the rules: the solver checks legality twice, once building the domain
  // and once in tryPlace, and breaking BOTH turns three of the properties red.
  // Breaking either one alone does not, because the other still refuses.
  it('hangi dünya olursa olsun illegalBlocks boş', () => {
    fc.assert(
      fc.property(world, (d) => {
        const out = solve(d).state;
        expect(illegalBlocks(out)).toEqual([]);
      }),
      { numRuns: 120 },
    );
  });

  it('çözücü hiçbir dersi borcundan fazla yerleştirmiyor', () => {
    // The auditor above checks the rules of a cell. This checks the totals,
    // which no single cell can be wrong about on its own.
    fc.assert(
      fc.property(world, (d) => {
        const out = solve(d).state;
        const placements = activeProgram(out).placements;
        const hours = new Map<Id, number>();
        for (const id of Object.values(placements)) hours.set(id, (hours.get(id) ?? 0) + 1);
        for (const lesson of out.lessons) {
          expect(hours.get(lesson.id) ?? 0).toBeLessThanOrEqual(lesson.weeklyHours);
        }
      }),
      { numRuns: 120 },
    );
  });
});

// ------------------------------------------------------------------ occupy ve vacate

describe('değişmez · occupy sonra vacate başlangıç durumunu verir', () => {
  it('her dünyada, her hücrede, her blok boyunda', () => {
    fc.assert(
      fc.property(
        world,
        fc.nat(),
        fc.nat(),
        fc.integer({ min: 1, max: MAX_BLOCK }),
        (d, g, s, n) => {
          const lesson = d.lessons[0];
          if (lesson === undefined) return;

          const day = g % d.settings.days.length;
          const hour = s % d.settings.hours.length;
          const room = d.classes.find((c) => c.id === lesson.classId)?.roomId ?? null;

          const placements = { ...activeProgram(d).placements };
          const ix = buildIndex(d);
          const before = {
            placements: { ...placements },
            teacherBusy: [...ix.teacherBusy.entries()],
            roomBusy: [...ix.roomBusy.entries()],
            placedHours: [...ix.placedHours.entries()],
          };

          occupy(placements, ix, lesson, room, day, hour, n);
          vacate(placements, ix, lesson, room, day, hour, n);

          expect(placements).toEqual(before.placements);
          expect([...ix.teacherBusy.entries()]).toEqual(before.teacherBusy);
          expect([...ix.roomBusy.entries()]).toEqual(before.roomBusy);
          expect([...ix.placedHours.entries()]).toEqual(before.placedHours);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ------------------------------------------------------------------ gidiş dönüş

describe('değişmez · yazılan durum aynen geri okunuyor', () => {
  it('parseState(JSON.stringify(d)) durumu değiştirmiyor', () => {
    // Stated over a state that has ALREADY been through parseState: the reader
    // also sanitizes, so the fixed point is what a saved file is, and that is
    // the sentence a backup depends on. Said over a raw generated state it
    // would be measuring sanitize(), not the round trip.
    fc.assert(
      fc.property(solvedWorld, (d) => {
        const once = parseState(JSON.stringify(d));
        expect(once).not.toBeNull();
        const twice = parseState(JSON.stringify(once));
        expect(twice).toEqual(once);
      }),
      { numRuns: 120 },
    );
  });

  it('yerleşimler ve kapalı saatler bir gidiş dönüşte bir hücre bile kaybetmiyor', () => {
    fc.assert(
      fc.property(solvedWorld, (d) => {
        const back = parseState(JSON.stringify(parseState(JSON.stringify(d))))!;
        const source = parseState(JSON.stringify(d))!;
        expect(activeProgram(back).placements).toEqual(activeProgram(source).placements);
        expect(back.unavailable).toEqual(source.unavailable);
      }),
      { numRuns: 120 },
    );
  });
});

// ------------------------------------------------------------------ remapDays

describe('değişmez · remapDays hangi gün silinirse silinsin kalanı doğru taşır', () => {
  /**
   * The placements of one state, read back as (day NAME, hour) -> lessonId.
   *
   * The day list is passed in rather than read off the state, because
   * `remapDays` rewrites the KEYS and leaves `settings.days` to its caller
   * (`updateSettings` writes both). Reading the new keys against the old list
   * is how the first version of this test failed, and it was the test that was
   * wrong, not the function.
   */
  function byName(d: State, days: Day[]): Map<string, Id> {
    const out = new Map<string, Id>();
    for (const [key, id] of Object.entries(activeProgram(d).placements)) {
      const [classId, day, hour] = key.split('|');
      const name = days[Number(day)]?.name;
      if (name !== undefined) out.set(`${classId}|${name}|${hour}`, id);
    }
    return out;
  }

  it('silinen günün dersleri gider, kalan her ders kendi gününde kalır', () => {
    fc.assert(
      fc.property(solvedWorld, fc.nat(), (d, pick) => {
        const dayCount = d.settings.days.length;
        if (dayCount < 2) return;

        const dropped = pick % dayCount;
        const next: Day[] = d.settings.days.filter((_, i) => i !== dropped);
        const droppedName = d.settings.days[dropped]!.name;

        const before = byName(d, d.settings.days);
        const after = byName(remapDays(d, next), next);

        for (const [key, id] of before) {
          const name = key.split('|')[1];
          if (name === droppedName) {
            expect(after.has(key)).toBe(false);
          } else {
            expect(after.get(key)).toBe(id);
          }
        }
        // Nothing appears out of nowhere either: the day that went is the only
        // difference in both directions.
        for (const key of after.keys()) expect(before.has(key)).toBe(true);
      }),
      { numRuns: 150 },
    );
  });

  it('başa gün eklemek hiçbir dersi kaydırmıyor', () => {
    // The direction that produced pitfall 11: unticking Monday moved Tuesday
    // from index 1 to 0 and the whole week with it.
    fc.assert(
      fc.property(solvedWorld, (d) => {
        const fresh = DAY_NAMES.find((n) => !d.settings.days.some((x) => x.name === n));
        if (fresh === undefined) return;

        const next: Day[] = [{ name: fresh, longBreakAfter: 0 }, ...d.settings.days];
        expect(byName(remapDays(d, next), next)).toEqual(byName(d, d.settings.days));
      }),
      { numRuns: 150 },
    );
  });
});

// ------------------------------------------------------------------ bloklar

describe('değişmez · clampBlocks haftadan fazlasını söyleyemez', () => {
  it('çıktının toplamı weeklyHours’u hiç geçmiyor', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5, max: 40 }),
        fc.array(fc.integer({ min: -5, max: 12 }), { maxLength: 8 }),
        (hours, blocks) => {
          const kept = clampBlocks(hours, blocks);
          const sum = kept.reduce((a, b) => a + b, 0);
          expect(sum).toBeLessThanOrEqual(Math.max(0, Math.round(hours)));
          // And what it keeps is always a block the model can express.
          for (const b of kept) {
            expect(b).toBeGreaterThanOrEqual(2);
            expect(b).toBeLessThanOrEqual(MAX_BLOCK);
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  it('çıktı hep büyükten küçüğe ve girdinin bir alt kümesi', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 40 }),
        fc.array(fc.integer({ min: 2, max: MAX_BLOCK }), { maxLength: 8 }),
        (hours, blocks) => {
          const kept = clampBlocks(hours, blocks);
          expect([...kept].sort((a, b) => b - a)).toEqual(kept);
          const pool = [...blocks];
          for (const b of kept) {
            const at = pool.indexOf(b);
            expect(at, `${b} girdide yok`).toBeGreaterThanOrEqual(0);
            pool.splice(at, 1);
          }
        },
      ),
      { numRuns: 500 },
    );
  });
});

describe('değişmez · placedBlocks aynı ızgarayı iki kez aynı okur', () => {
  it('aynı durumda iki okuma birebir aynı', () => {
    fc.assert(
      fc.property(solvedWorld, (d) => {
        for (const lesson of d.lessons) {
          expect(placedBlocks(d, lesson)).toEqual(placedBlocks(d, lesson));
        }
      }),
      { numRuns: 120 },
    );
  });

  it('okunan blokların toplamı ızgaradaki hücre sayısına eşit', () => {
    // The reading is a CONTRACT over a grid that stores no block boundaries
    // (pitfall 75), so the one thing it can never do is invent or lose an hour.
    fc.assert(
      fc.property(solvedWorld, (d) => {
        const placements = activeProgram(d).placements;
        for (const lesson of d.lessons) {
          const read = placedBlocks(d, lesson).reduce((sum, b) => sum + b.size, 0);
          const onGrid = Object.values(placements).filter((id) => id === lesson.id).length;
          expect(read).toBe(onGrid);
        }
      }),
      { numRuns: 120 },
    );
  });
});

// ------------------------------------------------------------------ palet

describe('değişmez · firstFreeColor en az kullanılanı veriyor', () => {
  it('boş bir yer varken hiçbir zaman kullanılmış bir indeks vermiyor', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: PALETTE_SIZE - 1 }), {
          maxLength: PALETTE_SIZE - 1,
        }),
        (used) => {
          expect(used).not.toContain(firstFreeColor(used));
        },
      ),
      { numRuns: 300 },
    );
  });

  it('palet dolduğunda EN AZ kullanılanı veriyor, ve bu bir kusur değil', () => {
    // The invariant as first written was "never returns a used index", and it
    // is false: with 36 colours taken there is no unused one, and refusing to
    // answer would leave a new teacher with no colour at all. What the
    // function actually promises is weaker and always true.
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: PALETTE_SIZE - 1 }), { minLength: 1, maxLength: 90 }),
        (used) => {
          const count = new Array<number>(PALETTE_SIZE).fill(0);
          for (const i of used) count[i] = count[i]! + 1;
          const chosen = firstFreeColor(used);
          expect(count[chosen]).toBe(Math.min(...count));
        },
      ),
      { numRuns: 300 },
    );
  });

  it('paletin dışına hiç çıkmıyor, girdi ne kadar bozuk olursa olsun', () => {
    fc.assert(
      fc.property(fc.array(fc.double(), { maxLength: 20 }), (used) => {
        const chosen = firstFreeColor(used);
        expect(Number.isInteger(chosen)).toBe(true);
        expect(chosen).toBeGreaterThanOrEqual(0);
        expect(chosen).toBeLessThan(PALETTE_SIZE);
      }),
      { numRuns: 300 },
    );
  });
});
