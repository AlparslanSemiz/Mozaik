// remapDays is the guard against the worst kind of bug this tool can have:
// silently moving a finished timetable one day earlier.
//
// Placement keys hold the day INDEX. When Monday is unticked, Tuesday moves
// from index 1 to index 0 — without remapping, every lesson would appear to
// have been taught a day earlier and nobody would notice (docs/PLAN.md 14).

import { placementKey, teacherKey } from './constraints';
import {
  DEFAULT_BELL,
  DEFAULT_LIMITS,
  DEFAULT_RULES,
  NO_TEACHER_LIMITS,
  defaultDays,
  emptyState,
  makeDay,
  remapDays,
  updateSettings,
} from './entities';
import type { Day, State } from './types';

function build(): State {
  return {
    schemaVersion: 3,
    settings: {
      schoolName: '',
      days: [makeDay('Pazartesi'), makeDay('Salı'), makeDay('Çarşamba')],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
    },
    rooms: [],
    teachers: [
      {
        id: 'oMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [{ id: 's510', name: '510', roomId: null }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 1, maxPerDay: null },
    ],
    unavailable: { [teacherKey('oMC', 2, 3)]: 1 },
    placements: {
      [placementKey('s510', 0, 0)]: 'x1', // Pazartesi
      [placementKey('s510', 1, 1)]: 'x1', // Salı
      [placementKey('s510', 2, 2)]: 'x1', // Çarşamba
    },
  };
}

const without = (days: Day[], name: string) => days.filter((x) => x.name !== name);

describe('remapDays', () => {
  it('BAŞTAN gün silinince kalan günlerin dersleri KAYMAZ', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));

    // Salı was index 1, is now index 0 — and its lesson moved with it.
    expect(next.placements[placementKey('s510', 0, 1)]).toBe('x1'); // Salı
    expect(next.placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba
    expect(Object.keys(next.placements)).toHaveLength(2);
  });

  it('silinen günün dersleri gider', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Salı'));
    expect(Object.keys(next.placements)).toHaveLength(2);
    expect(next.placements[placementKey('s510', 0, 0)]).toBe('x1'); // Pazartesi stays put
    expect(next.placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba moved 2 -> 1
  });

  it('müsaitlik kayıtları da aynı şekilde taşınır', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));
    expect(next.unavailable[teacherKey('oMC', 1, 3)]).toBe(1); // was day 2
    expect(next.unavailable[teacherKey('oMC', 2, 3)]).toBeUndefined();
  });

  it('gün eklenince mevcut günler yerinde kalır, yeni gün boş gelir', () => {
    const d = build();
    const next = remapDays(d, [...d.settings.days, makeDay('Perşembe')]);
    expect(next.placements).toEqual(d.placements);
  });

  it('gün BAŞA eklenince her şey bir sağa kayar', () => {
    const d = build();
    const next = remapDays(d, [makeDay('Pazar'), ...d.settings.days]);
    expect(next.placements[placementKey('s510', 1, 0)]).toBe('x1');
    expect(next.placements[placementKey('s510', 3, 2)]).toBe('x1');
  });

  it('sıra değişmediyse AYNI nesneyi döner (gereksiz çizim yok)', () => {
    const d = build();
    expect(remapDays(d, [...d.settings.days])).toBe(d);
    // Renaming the long break is not a move either.
    const sameOrder = d.settings.days.map((x) => ({ ...x, longBreakAfter: 6 }));
    expect(remapDays(d, sameOrder)).toBe(d);
  });
});

describe('updateSettings', () => {
  it('gün listesini değiştirirken anahtarları da taşır', () => {
    const d = build();
    const next = updateSettings(d, { days: without(d.settings.days, 'Pazartesi') });
    expect(next.settings.days.map((x) => x.name)).toEqual(['Salı', 'Çarşamba']);
    expect(next.placements[placementKey('s510', 0, 1)]).toBe('x1');
  });

  it('saat sayısı düşünce taşan yerleşimler temizlenir', () => {
    const d = build();
    const next = updateSettings(d, { hours: ['1', '2'] });
    expect(next.placements[placementKey('s510', 2, 2)]).toBeUndefined();
    expect(next.placements[placementKey('s510', 1, 1)]).toBe('x1');
  });

  it('dokunulmayan alanlar korunur', () => {
    const d = build();
    const next = updateSettings(d, { schoolName: 'Semiz Kurs' });
    expect(next.settings.schoolName).toBe('Semiz Kurs');
    expect(next.settings.hours).toEqual(['1', '2', '3', '4']);
    expect(next.settings.days).toEqual(d.settings.days);
  });
});

describe('varsayılan hafta', () => {
  it('Pazartesi hariç 6 gün, hafta sonu öğle arası 6. dersten sonra', () => {
    const days = defaultDays();
    expect(days.map((x) => x.name)).toEqual([
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
      'Pazar',
    ]);
    expect(days.find((x) => x.name === 'Cuma')!.longBreakAfter).toBe(5);
    expect(days.find((x) => x.name === 'Pazar')!.longBreakAfter).toBe(6);
  });

  it('boş durum 6 gün x 12 saat ile başlar', () => {
    const d = emptyState();
    expect(d.settings.days).toHaveLength(6);
    expect(d.settings.hours).toHaveLength(12);
    expect(d.settings.bell.start).toBe('09:00');
  });
});
