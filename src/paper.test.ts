// A sheet of paper as data (pure/paper): what a class's and a teacher's page
// say, asked without drawing them. `programScreen.test.tsx` pins the drawing;
// this file asks the parts a drawing of one world cannot: each option on its
// own, the header's day groups, and a single teacher's sheet made alone, which
// is what sending a teacher their timetable needs (B3.8).

import { blockSpans, buildIndex, placementKey } from './pure/constraints';
import { classSheet, sheetHead, teacherSheet, type SheetOptions } from './pure/paper';
import { translate } from './leaf/i18n';
import type { State } from './leaf/types';
import { makeWorld } from './worlds';

const t = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const ALL: SheetOptions = { clock: true, school: true, credits: true, cellBottom: true };

/**
 * Salı with the long break after the 2nd lesson, Çarşamba after the 3rd, and
 * MÇ's three-hour block on 510's Salı 2–4, which the break cuts 1 + 2.
 */
function world(): State {
  const d = makeWorld({
    days: [
      { name: 'Salı', longBreakAfter: 2 },
      { name: 'Çarşamba', longBreakAfter: 3 },
    ],
    hours: 5,
    teachers: [{ id: 'oMC', short: 'MÇ', subject: 'Matematik' }],
    // 511 first, so 510's colour (1) is not the teacher's (0).
    classes: [
      { id: 's511', name: '511', roomId: null },
      { id: 's510', name: '510', roomId: 'dA' },
    ],
    lessons: [{ id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 3 }],
    placements: {
      [placementKey('s510', 0, 1)]: 'L1',
      [placementKey('s510', 0, 2)]: 'L1',
      [placementKey('s510', 0, 3)]: 'L1',
    },
  });
  return { ...d, settings: { ...d.settings, schoolName: 'Deneme' } };
}

function sheets(d: State, options: SheetOptions) {
  const ix = buildIndex(d);
  const spans = blockSpans(d);
  return {
    c510: classSheet(d, ix, spans, d.classes[1]!, options, t),
    c511: classSheet(d, ix, spans, d.classes[0]!, options, t),
    mc: teacherSheet(d, ix, spans, d.teachers[0]!, options),
  };
}

describe('kâğıt modeli', () => {
  it('teneffüs bloğu keser, kalın kenar teneffüsten önceki hücrede', () => {
    const { c510, mc } = sheets(world(), ALL);
    const salı = (s: typeof c510) =>
      s.days[0]!.cells.map((c) => `${c.span}${c.breakAfter ? '|' : ''}:${c.top ?? ''}`);
    expect(salı(c510)).toEqual(['1:', '1|:Mat', '2:Mat', '1:']);
    expect(salı(mc)).toEqual(['1:', '1|:510', '2:510', '1:']);
    expect(c510.days[1]!.cells.map((c) => c.breakAfter)).toEqual([
      false,
      false,
      true,
      false,
      false,
    ]);
  });

  it('başlık ve alt satır seçeneklere göre', () => {
    const on = sheets(world(), ALL);
    expect([on.c510.title, on.c510.sub, on.c511.sub, on.mc.title, on.mc.sub]).toEqual([
      '510 sınıfı · Haftalık ders programı',
      'Deneme · A dersliği',
      'Deneme',
      'MÇ (MÇ) · Haftalık ders programı',
      'Deneme · Matematik',
    ]);
    const off = sheets(world(), { ...ALL, school: false, credits: false });
    expect([off.c510.sub, off.mc.sub]).toEqual(['', '']);
  });

  it('hücrenin ikinci satırı ve rengi', () => {
    const on = sheets(world(), ALL);
    const filled = (s: typeof on.c510) => s.days[0]!.cells.filter((c) => c.top !== null);
    expect(filled(on.c510).map((c) => [c.bottom, c.color])).toEqual([
      ['MÇ', 0],
      ['MÇ', 0],
    ]);
    // The teacher's sheet is painted by the class, and 510's room is A.
    expect(filled(on.mc).map((c) => [c.bottom, c.color])).toEqual([
      ['A', 1],
      ['A', 1],
    ]);
    const off = sheets(world(), { ...ALL, cellBottom: false });
    expect(filled(off.c510).map((c) => c.bottom)).toEqual([null, null]);
    expect(on.c510.days[0]!.cells[0]).toEqual({
      span: 1,
      breakAfter: false,
      color: null,
      top: null,
      bottom: null,
    });
  });

  it('başlık satırı: günlerin ayrıştığı ders numarasında iki saat, gün adıyla', () => {
    const head = sheetHead(world(), ALL);
    const split = head.filter((h) => h.clock.length > 1);
    expect(split.length).toBeGreaterThan(0);
    expect(split[0]!.clock.map((g) => g.days)).toEqual(['Sal', 'Çar']);
    expect(head.filter((h) => h.clock.length === 1).every((h) => h.clock[0]!.days === null)).toBe(
      true,
    );
    expect(sheetHead(world(), { ...ALL, clock: false }).every((h) => h.clock.length === 0)).toBe(
      true,
    );
  });
});
