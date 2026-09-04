// remapDays is the guard against the worst kind of bug this tool can have:
// silently moving a finished timetable one day earlier.
//
// Placement keys hold the day INDEX. When Monday is unticked, Tuesday moves
// from index 1 to index 0 — without remapping, every lesson would appear to
// have been taught a day earlier and nobody would notice (pitfall 11).

import { placementKey, teacherKey } from '../../constraints';
import { makeDay } from '../defaults';
import { build, without } from '../../testing/entityFixture';
import { activeProgram } from '../../programs';
import { remapDays, updateSettings } from '../settingsEdit';

describe('remapDays', () => {
  it('BAŞTAN gün silinince kalan günlerin dersleri KAYMAZ', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));

    // Salı was index 1, is now index 0 — and its lesson moved with it.
    expect(activeProgram(next).placements[placementKey('s510', 0, 1)]).toBe('x1'); // Salı
    expect(activeProgram(next).placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba
    expect(Object.keys(activeProgram(next).placements)).toHaveLength(2);
  });

  it('silinen günün dersleri gider', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Salı'));
    expect(Object.keys(activeProgram(next).placements)).toHaveLength(2);
    expect(activeProgram(next).placements[placementKey('s510', 0, 0)]).toBe('x1'); // Pazartesi stays put
    expect(activeProgram(next).placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba moved 2 -> 1
  });

  // Pins carry a day INDEX exactly like the two maps around them. A pin left
  // behind would lock the square a different day slid into, and the lesson it
  // was holding would be somewhere else entirely.
  it('SABİTLEMELER de aynı şekilde taşınır', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));
    // The pinned cell was Salı (index 1) and Salı is index 0 now.
    expect(activeProgram(next).pinned[placementKey('s510', 0, 1)]).toBe(1);
    expect(activeProgram(next).pinned[placementKey('s510', 1, 1)]).toBeUndefined();
    // ...and it still sits on top of the lesson it was pinning.
    expect(activeProgram(next).placements[placementKey('s510', 0, 1)]).toBe('x1');
  });

  it('silinen günün SABİTLEMESİ de gider', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Salı'));
    expect(activeProgram(next).pinned).toEqual({});
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
    expect(activeProgram(next).placements).toEqual(activeProgram(d).placements);
  });

  it('gün BAŞA eklenince her şey bir sağa kayar', () => {
    const d = build();
    const next = remapDays(d, [makeDay('Pazar'), ...d.settings.days]);
    expect(activeProgram(next).placements[placementKey('s510', 1, 0)]).toBe('x1');
    expect(activeProgram(next).placements[placementKey('s510', 3, 2)]).toBe('x1');
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
    expect(activeProgram(next).placements[placementKey('s510', 0, 1)]).toBe('x1');
  });

  it('saat sayısı düşünce taşan yerleşimler temizlenir', () => {
    const d = build();
    const next = updateSettings(d, { hours: ['1', '2'] });
    expect(activeProgram(next).placements[placementKey('s510', 2, 2)]).toBeUndefined();
    expect(activeProgram(next).placements[placementKey('s510', 1, 1)]).toBe('x1');
  });

  it('dokunulmayan alanlar korunur', () => {
    const d = build();
    const next = updateSettings(d, { schoolName: 'Semiz Kurs' });
    expect(next.settings.schoolName).toBe('Semiz Kurs');
    expect(next.settings.hours).toEqual(['1', '2', '3', '4']);
    expect(next.settings.days).toEqual(d.settings.days);
  });
});

