// parseState is the door every backup file and every localStorage read comes
// through. If it breaks, data is lost silently — hence these tests.
//
// My father's older backups are v1 (Turkish field names) and v2 (English names,
// plain string days). BOTH must still open, and the timetable inside them must
// come out exactly as it went in.

import { parseState } from './store';
import { sampleState } from './sample';
import { SCHEMA_VERSION } from './types';

/** A backup downloaded BEFORE the rename: v1 shape with Turkish field names. */
function legacyV1() {
  return {
    semaSurumu: 1,
    ayar: { gunler: ['Pazartesi', 'Salı'], saatler: ['1', '2', '3', '4'] },
    derslikler: [{ id: 'dA', ad: 'A' }],
    ogretmenler: [
      { id: 'oMC', ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik', renk: 3 },
    ],
    siniflar: [{ id: 's510', ad: '510', derslikId: 'dA' }],
    dersler: [{ id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 4, blok: 2 }],
    musaitDegil: { 'oMC|1|0': 1 } as Record<string, 1>,
    yerlesim: { 's510|0|0': 'x1', 's510|0|1': 'x1' } as Record<string, string>,
  };
}

/** A backup from the English rename: v2, days are plain strings, no rules. */
function legacyV2() {
  return {
    schemaVersion: 2,
    settings: { days: ['Cuma', 'Cumartesi'], hours: ['1', '2', '3', '4'] },
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', color: 3 },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 2 }],
    unavailable: { 'oMC|1|0': 1 } as Record<string, 1>,
    placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' } as Record<string, string>,
  };
}

describe('parseState — v1 göçü', () => {
  it('eski Türkçe alanlı yedeği okur ve hiçbir şey kaybetmez', () => {
    const d = parseState(JSON.stringify(legacyV1()))!;

    expect(d).not.toBeNull();
    expect(d.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d.settings.days).toEqual([
      { name: 'Pazartesi', longBreakAfter: 5 },
      { name: 'Salı', longBreakAfter: 5 },
    ]);
    expect(d.settings.hours).toEqual(['1', '2', '3', '4']);
    expect(d.rooms).toEqual([{ id: 'dA', name: 'A' }]);
    expect(d.teachers).toEqual([
      {
        id: 'oMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        color: 3,
        limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
      },
    ]);
    expect(d.classes).toEqual([{ id: 's510', name: '510', roomId: 'dA' }]);
    expect(d.lessons).toEqual([
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 2, maxPerDay: null },
    ]);
    // The ids never changed, so the keys carry over untouched.
    expect(d.unavailable).toEqual({ 'oMC|1|0': 1 });
    expect(d.placements).toEqual({ 's510|0|0': 'x1', 's510|0|1': 'x1' });
  });

  it('v1 yedeğinde de temizleme çalışır (taşan yerleşim atılır)', () => {
    const raw = legacyV1();
    raw.yerlesim['s510|0|9'] = 'x1'; // day has only 4 hours
    const d = parseState(JSON.stringify(raw))!;
    expect(d.placements['s510|0|9']).toBeUndefined();
    expect(d.placements['s510|0|0']).toBe('x1');
  });
});

describe('parseState — v2 göçü', () => {
  it('gün adlarını nesneye çevirir, öğle arasını hafta içi/sonu olarak varsayar', () => {
    const d = parseState(JSON.stringify(legacyV2()))!;
    expect(d.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d.settings.days).toEqual([
      { name: 'Cuma', longBreakAfter: 5 },
      { name: 'Cumartesi', longBreakAfter: 6 },
    ]);
  });

  it('dizilmiş program birebir korunur — 2 saatlik blok yerinde kalır', () => {
    const d = parseState(JSON.stringify(legacyV2()))!;
    expect(d.placements).toEqual({ 's510|0|0': 'x1', 's510|0|1': 'x1' });
    expect(d.unavailable).toEqual({ 'oMC|1|0': 1 });
  });

  it('yeni alanlar varsayılanla gelir', () => {
    const d = parseState(JSON.stringify(legacyV2()))!;
    expect(d.settings.bell).toEqual({
      start: '09:00',
      lessonMinutes: 40,
      breakMinutes: 10,
      longBreakMinutes: 30,
    });
    expect(d.settings.limits.maxConsecutive).toBe(0); // no limit is invented
    expect(d.teachers[0]!.limits).toEqual({
      maxConsecutive: null,
      maxPerDay: null,
      minPerDay: null,
    });
    expect(d.lessons[0]!.maxPerDay).toBeNull();
  });
});

describe('parseState — v3', () => {
  it('kendi yazdığı dosyayı aynen geri okur', () => {
    const original = sampleState();
    const back = parseState(JSON.stringify(original))!;
    expect(back).not.toBeNull();
    expect(JSON.stringify(back)).toBe(JSON.stringify(original));
  });

  it('bozuk JSON, dizi olmayan gövde ve bilinmeyen sürümde null döner', () => {
    expect(parseState('{bu json değil')).toBeNull();
    expect(parseState('"metin"')).toBeNull();
    expect(parseState(JSON.stringify({ schemaVersion: 99 }))).toBeNull();
  });

  it('eksik alanları varsayılanla tamamlar, çökmez', () => {
    const d = parseState(JSON.stringify({ schemaVersion: SCHEMA_VERSION }))!;
    expect(d).not.toBeNull();
    expect(d.settings.days).toHaveLength(6); // Salı..Pazar
    expect(d.settings.hours).toHaveLength(12);
    expect(d.settings.rules.minPerDay).toBe('warn');
    expect(d.teachers).toEqual([]);
    expect(d.placements).toEqual({});
  });

  it('bozuk kural/limit değerlerini varsayılana çevirir', () => {
    const d = parseState(
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        settings: {
          days: [{ name: 'Salı', longBreakAfter: 5 }, 'Çarşamba', 42],
          limits: { maxConsecutive: 'çok' },
          rules: { maxConsecutive: 'patla' },
          bell: { start: 17 },
        },
      }),
    )!;
    expect(d.settings.days).toEqual([
      { name: 'Salı', longBreakAfter: 5 },
      { name: 'Çarşamba', longBreakAfter: 5 },
    ]);
    expect(d.settings.limits.maxConsecutive).toBe(0);
    expect(d.settings.rules.maxConsecutive).toBe('block');
    expect(d.settings.bell.start).toBe('09:00');
  });

  it('sıfır veya eksi yazılmış limit kutusu "varsayılanı kullan" olur', () => {
    const d = parseState(
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        teachers: [
          {
            id: 'oMC',
            name: 'M',
            short: 'MÇ',
            subject: 'Mat',
            color: 0,
            limits: { maxConsecutive: 0, maxPerDay: -3, minPerDay: 2 },
          },
        ],
      }),
    )!;
    expect(d.teachers[0]!.limits).toEqual({
      maxConsecutive: null,
      maxPerDay: null,
      minPerDay: 2,
    });
  });
});
