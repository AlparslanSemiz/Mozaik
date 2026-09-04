// Every cascade, in one place: a deleted room, a shrunk week, an orphan pin.

import {
  place,
  placementKey,
  sanitize,
  teacherKey,
} from '../index';
import { activeProgram } from '../../state/programs';
import { build } from '../../testing/constraintFixture';

describe('sanitize — cascade ve taşma', () => {
  it('öğretmen silinince dersleri ve yerleşimleri de silinir', () => {
    let d = place(build(), 'x1', 0, 0);
    d = place(d, 'x3', 0, 0);
    d = { ...d, teachers: d.teachers.filter((t) => t.id !== 'oMC') };

    const s = sanitize(d);
    expect(s.lessons.map((x) => x.id)).not.toContain('x1');
    expect(activeProgram(s).placements[placementKey('s510', 0, 0)]).toBeUndefined();
    expect(activeProgram(s).placements[placementKey('s433', 0, 0)]).toBe('x3'); // untouched
  });

  it('sınıf silinince dersleri ve yerleşimleri de silinir', () => {
    let d = place(build(), 'x1', 0, 0);
    d = { ...d, classes: d.classes.filter((c) => c.id !== 's510') };

    const s = sanitize(d);
    expect(s.lessons.map((x) => x.id)).not.toContain('x1');
    expect(s.lessons.map((x) => x.id)).not.toContain('x4');
    expect(Object.keys(activeProgram(s).placements)).toHaveLength(0);
  });

  it('derslik silinince sınıfın roomId alanı null olur', () => {
    const d = { ...build(), rooms: [{ id: 'dB', name: 'B' }] };
    const s = sanitize(d);
    expect(s.classes.find((c) => c.id === 's510')?.roomId).toBeNull();
    expect(s.classes.find((c) => c.id === 's433')?.roomId).toBe('dB');
  });

  it('saat sayısı azalınca taşan yerleşimler temizlenir', () => {
    let d = place(build(), 'x1', 0, 3);
    d = place(d, 'x1', 0, 0);
    d = { ...d, settings: { ...d.settings, hours: ['1', '2'] } };

    const s = sanitize(d);
    expect(activeProgram(s).placements[placementKey('s510', 0, 3)]).toBeUndefined();
    expect(activeProgram(s).placements[placementKey('s510', 0, 0)]).toBe('x1');
  });

  it('gün sayısı azalınca taşan müsaitlik kayıtları temizlenir', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 1, 0)] = 1;
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    const narrow = {
      ...d,
      settings: { ...d.settings, days: [{ name: 'Pazartesi', longBreakAfter: 0 }] },
    };

    const s = sanitize(narrow);
    expect(s.unavailable[teacherKey('oMC', 1, 0)]).toBeUndefined();
    expect(s.unavailable[teacherKey('oMC', 0, 0)]).toBe(1);
  });

  it('yetim ve bozuk anahtarları atar', () => {
    const d = build();
    activeProgram(d).placements['s510|0|0'] = 'olmayanDers';
    activeProgram(d).placements['bozuk'] = 'x1';
    activeProgram(d).placements['s433|0|0'] = 'x1'; // the lesson belongs to 510 -> inconsistent
    expect(Object.keys(activeProgram(sanitize(d)).placements)).toHaveLength(0);
  });

  it('değişiklik yoksa AYNI nesneyi döner', () => {
    const d = place(build(), 'x1', 0, 0);
    expect(sanitize(d)).toBe(d);
  });
});

