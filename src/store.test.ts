// parseState is the door every backup file and every localStorage read comes
// through. If it breaks, data is lost silently — hence these tests.
//
// My father's older backups are v1 (Turkish field names) and v2 (English names,
// plain string days). BOTH must still open, and the timetable inside them must
// come out exactly as it went in.

import { defaultSubjects } from './entities';
import { parseState } from './store';
import { blockPlan } from './blocks';
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
    // Still `blockSize` — that is what a v2 file says, and reading it is the
    // point of the fixture.
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
        // A v1 file cannot carry either of these; they arrive "not stated" and
        // "no second subject", not guessed.
        subject2: '',
        gender: '',
        color: 3,
        limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
      },
    ]);
    expect(d.classes).toEqual([{ id: 's510', name: '510', roomId: 'dA' }]);
    expect(d.lessons).toEqual([
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blocks: [2, 2], second: false, maxPerDay: null },
    ]);
    // The ids never changed, so the keys carry over untouched.
    expect(d.unavailable).toEqual({ 'oMC|1|0': 1 });
    expect(activeProgram(d).placements).toEqual({ 's510|0|0': 'x1', 's510|0|1': 'x1' });
  });

  it('v1 yedeğinde de temizleme çalışır (taşan yerleşim atılır)', () => {
    const raw = legacyV1();
    raw.yerlesim['s510|0|9'] = 'x1'; // day has only 4 hours
    const d = parseState(JSON.stringify(raw))!;
    expect(activeProgram(d).placements['s510|0|9']).toBeUndefined();
    expect(activeProgram(d).placements['s510|0|0']).toBe('x1');
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
    expect(activeProgram(d).placements).toEqual({ 's510|0|0': 'x1', 's510|0|1': 'x1' });
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

  // A v1/v2 file predates `settings.subjects` entirely. `emptyState()` used to
  // carry the built-in 21 and the migration inherited them by spreading
  // `blank.settings`; now that a new project starts with NO subjects, that
  // spread would hand this file an empty list and turn "Matematik" — which its
  // teacher still carries — into a stray the Branşlar step marks "listede
  // değil". Nothing on screen would say so.
  it('BRANŞ LİSTESİ boş kalmıyor: eski dosya gömülü listeyi alıyor', () => {
    for (const eski of [legacyV1(), legacyV2()]) {
      const d = parseState(JSON.stringify(eski))!;
      expect(d.settings.subjects).toEqual(defaultSubjects());
      // ...which is the same as saying the teacher's subject is not a stray.
      expect(d.settings.subjects).toContain(d.teachers[0]!.subject);
    }
  });
});

describe('parseState — v4', () => {
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
    expect(activeProgram(d).placements).toEqual({});
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

/**
 * A v3 backup: everything the current shape has EXCEPT settings.subjectShorts.
 * Every backup my father downloads between v0.6 and v0.7 looks like this.
 */
/**
 * Rewrites a backup's lessons the way every release before v7 wrote them:
 * `blockSize` — "every block is this long" — instead of `pairs`.
 *
 * The round trip is exact for the sample school because `sampleState` asks for
 * doubles as floor(hours / 2), which is precisely what the migration turns a
 * `blockSize` of 2 back into. That is what lets the tests below still say
 * "nothing else changed" about the lessons.
 */
function asPreV7Lessons(raw: { lessons: Array<Record<string, unknown>> }) {
  for (const lesson of raw.lessons) {
    // A pre-v7 file said "every block is this long", so the longest block the
    // sample asked for IS what that file would have written. Since v9 reads it
    // back as floor(hours / size) blocks that long — the same rule sample.ts
    // builds them with — the round trip is exact again, including threes.
    const blocks = lesson.blocks as number[];
    lesson.blockSize = blocks.length > 0 ? blocks[0] : 1;
    delete lesson.blocks;
  }
}

/**
 * A v7/v8 file, which could only ever say "N of the hours are doubles".
 * Anything the sample wanted as a three or a four is not expressible there, so
 * the fixture writes what v7 would have written and the test expects that back.
 */
function asV7Lessons(raw: { lessons: Array<Record<string, unknown>> }) {
  for (const lesson of raw.lessons) {
    const blocks = lesson.blocks as number[];
    const hours = lesson.weeklyHours as number;
    lesson.pairs = blocks.length > 0 ? Math.floor(hours / 2) : 0;
    delete lesson.blocks;
  }
}

function v3Backup() {
  const d = sampleState();
  const raw = JSON.parse(JSON.stringify(d));
  raw.schemaVersion = 3;
  delete raw.settings.subjectShorts;
  asPreV7Lessons(raw);
  return raw;
}

describe('parseState — v3 → v4 göçü', () => {
  it('v3 yedeği açılıyor ve subjectShorts boş sözlükle geliyor', () => {
    const d = parseState(JSON.stringify(v3Backup()))!;
    expect(d).not.toBeNull();
    expect(d.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d.settings.subjectShorts).toEqual({});
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v3Backup()))!;

    expect(migrated.teachers).toEqual(original.teachers);
    expect(migrated.classes).toEqual(original.classes);
    expect(migrated.rooms).toEqual(original.rooms);
    expect(migrated.lessons).toEqual(original.lessons);
    expect(migrated.settings.days).toEqual(original.settings.days);
    expect(migrated.settings.hours).toEqual(original.settings.hours);
    expect(migrated.settings.bell).toEqual(original.settings.bell);
    expect(migrated.settings.rules).toEqual(original.settings.rules);
    // the keys that hold the laid-out timetable
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
  });

  it('v3 dosyasına elle yazılmış subjectShorts varsa da okunur', () => {
    const raw = v3Backup();
    raw.settings.subjectShorts = { matematik: 'Mtk', fizik: 42, kimya: '  ' };
    const d = parseState(JSON.stringify(raw))!;
    // only the usable entry survives; junk is dropped, not guessed at
    expect(d.settings.subjectShorts).toEqual({ matematik: 'Mtk' });
  });

  it('v1 ve v2 yolları da v4 üretiyor', () => {
    for (const raw of [legacyV1(), legacyV2()]) {
      const d = parseState(JSON.stringify(raw))!;
      expect(d.schemaVersion).toBe(SCHEMA_VERSION);
      expect(d.settings.subjectShorts).toEqual({});
    }
  });
});

/**
 * A v4 backup: everything the current shape has EXCEPT ClassGroup.color and
 * settings.subjects. Colours are squeezed back into the twelve the old palette
 * had, because that is what a real file written before this version holds.
 */
function v4Backup() {
  const raw = JSON.parse(JSON.stringify(sampleState()));
  raw.schemaVersion = 4;
  delete raw.settings.subjects;
  for (const c of raw.classes) delete c.color;
  raw.teachers = raw.teachers.map((t: { color: number }, i: number) => ({ ...t, color: i % 12 }));
  asPreV7Lessons(raw);
  return raw;
}

describe('parseState — v4 → v5 göçü', () => {
  it('v4 yedeği açılıyor, sınıflar renk ve okul branş listesi kazanıyor', () => {
    const d = parseState(JSON.stringify(v4Backup()))!;
    expect(d).not.toBeNull();
    expect(d.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d.settings.subjects).toEqual(defaultSubjects());
    expect(d.classes.every((c) => typeof c.color === 'number')).toBe(true);
  });

  it('12 rengin tekrar ettiği eski dosyada renkler tekilleştiriliyor', () => {
    const raw = v4Backup();
    expect(raw.teachers.length).toBeGreaterThan(12); // otherwise there is nothing to fix
    const before = new Set(raw.teachers.map((t: { color: number }) => t.color));
    expect(before.size).toBeLessThan(raw.teachers.length);

    const d = parseState(JSON.stringify(raw))!;
    expect(new Set(d.teachers.map((t) => t.color)).size).toBe(d.teachers.length);
    expect(new Set(d.classes.map((c) => c.color)).size).toBe(d.classes.length);
  });

  it('renkleri zaten tekil olan dosya açılıp açılınca karışmıyor', () => {
    const once = parseState(JSON.stringify(sampleState()))!;
    const twice = parseState(JSON.stringify(once))!;
    expect(twice.teachers.map((t) => t.color)).toEqual(once.teachers.map((t) => t.color));
    expect(twice.classes.map((c) => c.color)).toEqual(once.classes.map((c) => c.color));
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v4Backup()))!;

    expect(migrated.rooms).toEqual(original.rooms);
    expect(migrated.lessons).toEqual(original.lessons);
    expect(migrated.settings.days).toEqual(original.settings.days);
    expect(migrated.settings.bell).toEqual(original.settings.bell);
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
    // names and rooms survive; only the colour is new
    expect(migrated.classes.map((c) => c.name)).toEqual(original.classes.map((c) => c.name));
    expect(migrated.teachers.map((t) => t.name)).toEqual(original.teachers.map((t) => t.name));
  });

  it('bozuk branş listesi varsayılana düşüyor', () => {
    const raw = v4Backup();
    raw.settings.subjects = ['Matematik', '  ', 42, 'matematik', 'Robotik'];
    const d = parseState(JSON.stringify(raw))!;
    // junk dropped, the case-folded duplicate dropped, the rest kept in order
    expect(d.settings.subjects).toEqual(['Matematik', 'Robotik']);

    raw.settings.subjects = 'Matematik';
    expect(parseState(JSON.stringify(raw))!.settings.subjects).toEqual(defaultSubjects());
  });
});

/** A v5 backup: the current shape minus the one field v6 adds. */
function v5Backup() {
  const raw = JSON.parse(JSON.stringify(sampleState()));
  raw.schemaVersion = 5;
  for (const t of raw.teachers) delete t.gender;
  asPreV7Lessons(raw);
  return raw;
}

describe('parseState — v5 → v6 göçü', () => {
  // The one that matters most, and the one a version bump breaks silently:
  // every backup the previous release wrote carries `schemaVersion: 5`. If the
  // reader's condition is not widened when the constant moves, all of them
  // fall through to `null` and the father's saved timetable stops opening.
  it('BUGÜNKÜ sürümün yazdığı v5 dosyası hâlâ açılıyor', () => {
    const d = parseState(JSON.stringify(v5Backup()));
    expect(d).not.toBeNull();
    expect(d!.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d!.teachers).toHaveLength(sampleState().teachers.length);
  });

  it('cinsiyeti olmayan öğretmen BELİRTİLMEMİŞ geliyor — tahmin edilmiyor', () => {
    const d = parseState(JSON.stringify(v5Backup()))!;
    expect(d.teachers.every((t) => t.gender === '')).toBe(true);
  });

  it('tanınmayan cinsiyet değeri de belirtilmemişe düşüyor', () => {
    const raw = v5Backup();
    raw.teachers[0].gender = 'Kadın';   // the label, not the letter
    raw.teachers[1].gender = 42;
    raw.teachers[2].gender = null;
    raw.teachers[3].gender = 'k';       // the one legal value in the batch
    const d = parseState(JSON.stringify(raw))!;
    expect(d.teachers.slice(0, 3).map((t) => t.gender)).toEqual(['', '', '']);
    expect(d.teachers[3]!.gender).toBe('k');
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v5Backup()))!;

    expect(migrated.rooms).toEqual(original.rooms);
    expect(migrated.classes).toEqual(original.classes);
    expect(migrated.lessons).toEqual(original.lessons);
    expect(migrated.settings).toEqual(original.settings);
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
    // Order is the feature now, so it is asserted rather than assumed.
    expect(migrated.teachers.map((t) => t.id)).toEqual(original.teachers.map((t) => t.id));
    expect(migrated.teachers.map((t) => t.color)).toEqual(original.teachers.map((t) => t.color));
  });

  it('v7 dosyası cinsiyeti KORUYOR, ikinci geçişte de aynı', () => {
    const once = parseState(JSON.stringify(sampleState()))!;
    const twice = parseState(JSON.stringify(once))!;
    expect(once.teachers.map((t) => t.gender)).toEqual(
      sampleState().teachers.map((t) => t.gender),
    );
    expect(twice.teachers.map((t) => t.gender)).toEqual(once.teachers.map((t) => t.gender));
  });

  // v3 and v4 are still on the list; widening the condition must not narrow it.
  it('v3 ve v4 yedekleri de hâlâ açılıyor', () => {
    expect(parseState(JSON.stringify(v3Backup()))).not.toBeNull();
    expect(parseState(JSON.stringify(v4Backup()))).not.toBeNull();
  });

  it('elle verilen sıra dosyadan aynen geri geliyor', () => {
    const raw = v5Backup();
    raw.teachers.reverse();
    const d = parseState(JSON.stringify(raw))!;
    expect(d.teachers.map((t) => t.name)).toEqual(
      [...sampleState().teachers].reverse().map((t) => t.name),
    );
  });
});

/** A v6 backup: the shape the previous release wrote — `blockSize`, no `pairs`. */
function v6Backup() {
  const raw = JSON.parse(JSON.stringify(sampleState()));
  raw.schemaVersion = 6;
  asPreV7Lessons(raw);
  return raw;
}

describe('parseState — v6 → v7 göçü', () => {
  // The one a version bump breaks silently: every backup the PREVIOUS release
  // wrote carries `schemaVersion: 6`. If the reader's condition is not widened
  // when the constant moves, all of them fall through to `null` and the
  // father's saved timetable stops opening.
  it('BİR ÖNCEKİ sürümün yazdığı v6 dosyası hâlâ açılıyor', () => {
    const d = parseState(JSON.stringify(v6Backup()));
    expect(d).not.toBeNull();
    expect(d!.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d!.lessons).toHaveLength(sampleState().lessons.length);
  });

  it('blockSize → blocks: [2, 2]’lik blok istenen ders ikili, 1’lik olan tek saat', () => {
    const raw = v6Backup();
    raw.lessons = [
      { id: 'a', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 5, blockSize: 2, maxPerDay: null },
      { id: 'b', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 5, blockSize: 1, maxPerDay: null },
      // Three-hour blocks came BACK with v9: a pre-v7 file gets to mean what
      // it said, because 3 is expressible again and the placements never moved.
      { id: 'c', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 6, blockSize: 3, maxPerDay: null },
    ];
    activeProgram(raw).placements = {};
    const d = parseState(JSON.stringify(raw))!;
    expect(d.lessons.map((x) => [x.weeklyHours, x.blocks])).toEqual([
      [5, [2, 2]],
      [5, []],
      [6, [3, 3]],
    ]);
    expect(d.lessons.every((x) => !('blockSize' in x))).toBe(true);
  });

  // Five hours asked for as doubles used to mean "place four, lose one": one
  // block length could not say 2+2+1. The migration is what gives the fifth
  // hour back, so it is asserted rather than assumed.
  it('2’lik blokla 5 saat artık 2+2+1 — hiçbir saat kaybolmuyor', () => {
    const raw = v6Backup();
    raw.lessons = [
      { id: 'a', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 5, blockSize: 2, maxPerDay: null },
    ];
    activeProgram(raw).placements = {};
    const lesson = parseState(JSON.stringify(raw))!.lessons[0]!;
    expect(blockPlan(lesson)).toEqual([2, 2, 1]);
    expect(blockPlan(lesson).reduce((a, b) => a + b, 0)).toBe(lesson.weeklyHours);
  });

  it('bozuk pairs kırpılıyor — dosya elle yazılmış olabilir', () => {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    activeProgram(raw).placements = {};
    raw.lessons = [
      { id: 'a', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 4, blocks: [2, 2, 2, 2, 2, 2, 2, 2, 2], second: false, maxPerDay: null },
      { id: 'b', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 4, blocks: [-3, 9, 'x'], second: false, maxPerDay: null },
      { id: 'c', classId: raw.classes[0].id, teacherId: raw.teachers[0].id, weeklyHours: 4, maxPerDay: null },
    ];
    const d = parseState(JSON.stringify(raw))!;
    expect(d.lessons.map((x) => x.blocks)).toEqual([[2, 2], [], []]);
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v6Backup()))!;

    expect(migrated.rooms).toEqual(original.rooms);
    expect(migrated.classes).toEqual(original.classes);
    expect(migrated.teachers).toEqual(original.teachers);
    expect(migrated.lessons).toEqual(original.lessons);
    expect(migrated.settings).toEqual(original.settings);
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
  });
});

/** A v7 backup: the shape the previous release wrote — no second subject. */
function v7Backup() {
  const raw = JSON.parse(JSON.stringify(sampleState()));
  raw.schemaVersion = 7;
  for (const t of raw.teachers) delete t.subject2;
  for (const x of raw.lessons) delete x.second;
  asV7Lessons(raw);
  return raw;
}

describe('parseState — v7 → v8 göçü', () => {
  // The one a version bump breaks silently, and it has now been the same test
  // three versions running: every backup the PREVIOUS release wrote carries
  // `schemaVersion: 7`. Take `version === 7` out of the reader's condition and
  // all of them fall through to `null` — the father's saved timetable simply
  // stops opening, with no error anywhere.
  it('BİR ÖNCEKİ sürümün yazdığı v7 dosyası hâlâ açılıyor', () => {
    const d = parseState(JSON.stringify(v7Backup()));
    expect(d).not.toBeNull();
    expect(d!.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d!.teachers).toHaveLength(sampleState().teachers.length);
    expect(d!.lessons).toHaveLength(sampleState().lessons.length);
  });

  it('ikinci branşı olmayan öğretmen BOŞ geliyor — tahmin edilmiyor', () => {
    const d = parseState(JSON.stringify(v7Backup()))!;
    expect(d.teachers.every((t) => t.subject2 === '')).toBe(true);
    expect(d.lessons.every((x) => x.second === false)).toBe(true);
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v7Backup()))!;
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
    expect(migrated.teachers.map((t) => t.subject)).toEqual(
      original.teachers.map((t) => t.subject),
    );
    // Against what the FILE said, not against the sample: v7 had no way to
    // write a three-hour block, so a v7 backup of a sample that wanted one
    // legitimately comes back as doubles. What must not move is the timetable.
    const wrote = v7Backup() as { lessons: Array<{ pairs: number }> };
    expect(migrated.lessons.map((x) => x.blocks)).toEqual(
      wrote.lessons.map((x) => Array<number>(x.pairs).fill(2)),
    );
  });

  it('v8 dosyası ikinci branşı KORUYOR, ikinci geçişte de aynı', () => {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    raw.teachers[0].subject2 = 'Edebiyat';
    raw.lessons[0].second = true;
    const once = parseState(JSON.stringify(raw))!;
    const twice = parseState(JSON.stringify(once))!;
    expect(once.teachers[0]!.subject2).toBe('Edebiyat');
    expect(once.lessons.find((x) => x.id === raw.lessons[0].id)!.second).toBe(true);
    expect(twice.teachers[0]!.subject2).toBe('Edebiyat');
    expect(twice.lessons.find((x) => x.id === raw.lessons[0].id)!.second).toBe(true);
  });

  // A hand-edited file, or one written before the teacher's second subject was
  // removed. `sanitize()` runs on every load, so the flag never reaches a screen
  // pointing at a subject nobody teaches.
  it('ikinci branşı OLMAYAN hocanın second bayrağı yükleme sırasında siliniyor', () => {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    raw.teachers[0].subject2 = '';
    raw.lessons[0].second = true;
    const d = parseState(JSON.stringify(raw))!;
    expect(d.lessons.find((x) => x.id === raw.lessons[0].id)!.second).toBe(false);
  });

  // Widening the condition must not narrow it.
  it('v3, v4 ve v6 yedekleri de hâlâ açılıyor', () => {
    expect(parseState(JSON.stringify(v3Backup()))).not.toBeNull();
    expect(parseState(JSON.stringify(v4Backup()))).not.toBeNull();
    expect(parseState(JSON.stringify(v6Backup()))).not.toBeNull();
  });
});

/**
 * A v8 backup: THE SHAPE THE RELEASED v2.0.0 WROTE.
 *
 * Second subjects exist — that is what v8 added — and the week is still
 * `pairs`. This is the file the reader's own copy produces today, and for one
 * release it did not open at all: v9 moved SCHEMA_VERSION and left `8` out of
 * the reader's condition, so every one of them came back `null`, which on
 * screen reads "unreadable file".
 */
function v8Backup() {
  const raw = JSON.parse(JSON.stringify(sampleState()));
  raw.schemaVersion = 8;
  raw.teachers[0].subject2 = 'Edebiyat';
  // On a lesson that teacher actually gives: `sanitize()` clears an orphan flag,
  // so pinning it to lessons[0] blindly would assert nothing on most samples.
  const mine = raw.lessons.find(
    (x: { teacherId: string }) => x.teacherId === raw.teachers[0].id,
  );
  if (mine !== undefined) mine.second = true;
  asV7Lessons(raw);
  return raw;
}

describe('parseState — v8 → v9 göçü', () => {
  it('YAYINLANMIŞ sürümün yazdığı v8 dosyası açılıyor', () => {
    const d = parseState(JSON.stringify(v8Backup()));
    expect(d).not.toBeNull();
    expect(d!.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d!.teachers).toHaveLength(sampleState().teachers.length);
    expect(d!.lessons).toHaveLength(sampleState().lessons.length);
  });

  it('ikinci branş ve second bayrağı v8’den olduğu gibi geliyor', () => {
    const raw = v8Backup();
    const d = parseState(JSON.stringify(raw))!;
    expect(d.teachers[0]!.subject2).toBe('Edebiyat');
    const mine = raw.lessons.find(
      (x: { teacherId: string }) => x.teacherId === raw.teachers[0].id,
    );
    expect(d.lessons.find((x) => x.id === mine.id)!.second).toBe(true);
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const migrated = parseState(JSON.stringify(v8Backup()))!;
    expect(activeProgram(migrated).placements).toEqual(activeProgram(original).placements);
    expect(migrated.unavailable).toEqual(original.unavailable);
    expect(migrated.classes).toEqual(original.classes);
    // Against what the FILE said: v8 could only write doubles, so a sample that
    // wanted a three legitimately comes back as doubles. The timetable is what
    // must not move, and the assertion above is the one that says so.
    const wrote = v8Backup() as { lessons: Array<{ pairs: number }> };
    expect(migrated.lessons.map((x) => x.blocks)).toEqual(
      wrote.lessons.map((x) => Array<number>(x.pairs).fill(2)),
    );
  });

  /**
   * THE ONE THAT SURVIVES THE NEXT BUMP.
   *
   * Every version-shaped test above names a number, so each of them goes on
   * passing while the number that was just left behind falls through to null —
   * which is exactly how v8 broke with a warning comment sitting right above
   * the line. This one names no number: it asks the reader to open a file
   * stamped one below whatever the constant currently is. Move SCHEMA_VERSION
   * without widening the condition and it turns red on its own.
   */
  it('BİR ÖNCEKİ şema sürümü her zaman okunabiliyor', () => {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    raw.schemaVersion = SCHEMA_VERSION - 1;
    expect(parseState(JSON.stringify(raw))).not.toBeNull();
  });
});

describe('parseState — v12 → v13: dört saatlik bloklar', () => {
  it('4 saatlik blokları 3+1 yapar; alternatifleri, yerleşimleri ve sabitlemeleri korur', () => {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    raw.schemaVersion = 12;
    const first = raw.lessons[0];
    const second = raw.lessons[1];
    first.weeklyHours = 10;
    first.blocks = [4, 4, 2];
    second.weeklyHours = 4;
    second.blocks = [4];

    const placements = Object.fromEntries(
      Array.from({ length: 10 }, (_, hour) => [`${first.classId}|0|${hour}`, first.id]),
    );
    const pinned = { [`${first.classId}|0|0`]: 1, [`${first.classId}|0|4`]: 1 };
    raw.programs = [
      { id: 'program-1', name: 'Program 1', placements, pinned },
      { id: 'program-2', name: 'Program 2', placements: { ...placements }, pinned: { ...pinned } },
    ];
    raw.activeProgramId = 'program-2';
    const originalPrograms = JSON.parse(JSON.stringify(raw.programs));

    const migrated = parseState(JSON.stringify(raw))!;
    expect(migrated.schemaVersion).toBe(13);
    expect(migrated.lessons[0]!.blocks).toEqual([3, 3, 2]);
    expect(blockPlan(migrated.lessons[0]!)).toEqual([3, 3, 2, 1, 1]);
    expect(migrated.lessons[1]!.blocks).toEqual([3]);
    expect(blockPlan(migrated.lessons[1]!)).toEqual([3, 1]);
    expect(migrated.programs).toEqual(originalPrograms);
    expect(migrated.activeProgramId).toBe('program-2');
  });
});

/**
 * v10: the pins. A separate describe because they are not a migration — v9 and
 * everything under it simply had none, and the reader's own file is the first
 * one that can carry any.
 */
describe('parseState — v9 → v10: sabitleme', () => {
  function legacy(d: ReturnType<typeof sampleState>, version: number) {
    const program = activeProgram(d);
    const { programs: _programs, activeProgramId: _activeProgramId, ...shared } = d;
    return {
      ...shared,
      schemaVersion: version,
      placements: { ...program.placements },
      pinned: { ...program.pinned },
    };
  }

  /** The sample ships an empty grid, so a pin needs a cell put down first. */
  function withOnePlacement() {
    const d = legacy(sampleState(), 10);
    const lesson = d.lessons[0]!;
    const key = `${lesson.classId}|0|0`;
    d.placements = { [key]: lesson.id };
    return { d, key };
  }

  it('v9 dosyasında sabitleme YOK, ve tahmin de edilmiyor', () => {
    const raw = legacy(sampleState(), 9);
    delete (raw as { pinned?: Record<string, 1> }).pinned;
    const parsed = parseState(JSON.stringify(raw))!;
    expect(parsed).not.toBeNull();
    expect(activeProgram(parsed).pinned).toEqual({});
    // The timetable itself is untouched: pins were added BESIDE it, not into it.
    expect(activeProgram(parsed).placements).toEqual(activeProgram(sampleState()).placements);
  });

  it('sabitleme dosyaya YAZILIYOR ve geri OKUNUYOR', () => {
    const { d, key } = withOnePlacement();
    const back = parseState(JSON.stringify({ ...d, pinned: { [key]: 1 } }))!;
    expect(activeProgram(back).pinned).toEqual({ [key]: 1 });
    expect(activeProgram(back).placements[key]).toBe(d.lessons[0]!.id);
  });

  it('YETİM sabitleme yüklemede siliniyor — elle yazılmış dosya', () => {
    const { d } = withOnePlacement();
    // A cell nothing is placed in. sanitize() runs on every load.
    const back = parseState(JSON.stringify({ ...d, pinned: { 'yok|0|0': 1 } }))!;
    expect(activeProgram(back).pinned).toEqual({});
  });

  it('sabitleme İKİNCİ geçişte de duruyor', () => {
    const { d, key } = withOnePlacement();
    const once = parseState(JSON.stringify({ ...d, pinned: { [key]: 1 } }))!;
    const twice = parseState(JSON.stringify(once))!;
    expect(activeProgram(twice).pinned).toEqual({ [key]: 1 });
  });
});

/**
 * v10 -> v11: the daily rule gained a middle layer, so `ClassGroup` gained a
 * box. A v10 file has no such field, and `null` is exactly what its absence
 * means — "use the school's number", which is what every class did before.
 */
describe('parseState — v10 → v11 göçü', () => {
  function v10Backup() {
    const raw = JSON.parse(JSON.stringify(sampleState()));
    raw.schemaVersion = 10;
    for (const c of raw.classes) delete c.maxSameLessonPerDay;
    return raw;
  }

  it('v10 dosyası açılıyor ve sınıflar okul sayısına düşüyor', () => {
    const d = parseState(JSON.stringify(v10Backup()));
    expect(d).not.toBeNull();
    expect(d!.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d!.classes).toHaveLength(sampleState().classes.length);
    expect(d!.classes.every((c) => c.maxSameLessonPerDay === null)).toBe(true);
  });

  it('BAŞKA HİÇBİR ŞEY değişmiyor — dizilmiş program birebir duruyor', () => {
    const original = sampleState();
    const d = parseState(JSON.stringify(v10Backup()))!;
    expect(activeProgram(d).placements).toEqual(activeProgram(original).placements);
    expect(d.unavailable).toEqual(original.unavailable);
    expect(d.lessons).toEqual(original.lessons);
  });

  it('sınıfın kutusu asBox’tan geçiyor — sıfır ve çöp null oluyor', () => {
    const raw = v10Backup();
    raw.classes[0].maxSameLessonPerDay = 2;
    raw.classes[1].maxSameLessonPerDay = 0;
    raw.classes[2].maxSameLessonPerDay = 'iki';
    const d = parseState(JSON.stringify(raw))!;
    expect(d.classes[0]!.maxSameLessonPerDay).toBe(2);
    // 0 is not "no limit" in a box; it is "nothing typed here" (pitfall 43).
    expect(d.classes[1]!.maxSameLessonPerDay).toBeNull();
    expect(d.classes[2]!.maxSameLessonPerDay).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The undo stack and the plan library.
//
// `reduce` is pure, so the rule that matters most — undo must never carry one
// plan's move into another plan's file — can be pinned without mounting React.

import { BASE_KEY, FIRST_PLAN_ID, planKey } from './library';
import { collectStates, loadPlan, reduce, savePlan } from './store';
import { emptyState } from './entities';
import type { State } from './types';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  } as Storage;
}

/** Vitest runs this file under `node`, which has no localStorage of its own. */
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
});

const box = (present: State, planId = FIRST_PLAN_ID) => ({
  present,
  past: [emptyState()],
  future: [emptyState()],
  planId,
});

describe('reduce — plan kimliği', () => {
  it('plan değişince geri-al yığını SIFIRLANIYOR', () => {
    const next = reduce(box(sampleState()), {
      type: 'switch',
      id: 'abcd',
      state: emptyState(),
    });
    expect(next.planId).toBe('abcd');
    expect(next.past).toEqual([]);
    expect(next.future).toEqual([]);
  });

  it('düzenleme, geri al ve ileri al plan kimliğini taşıyor', () => {
    const start = box(sampleState(), 'abcd');
    const changed = reduce(start, { type: 'change', apply: (d) => ({ ...d, rooms: [] }) });
    expect(changed.planId).toBe('abcd');
    expect(reduce(changed, { type: 'undo' }).planId).toBe('abcd');
    expect(reduce(reduce(changed, { type: 'undo' }), { type: 'redo' }).planId).toBe('abcd');
    // A file opened with "Dosyadan aç" replaces the OPEN plan, it does not move.
    expect(reduce(start, { type: 'load', state: emptyState() }).planId).toBe('abcd');
  });

  it('gerçek bir değişiklik yoksa geçmiş kirletilmiyor', () => {
    const start = box(sampleState());
    expect(reduce(start, { type: 'change', apply: (d) => d })).toBe(start);
  });
});

describe('planların ayrı anahtarları', () => {
  it('ilk plan tarihsel anahtara yazılıyor, ikincisi kendi anahtarına', () => {
    savePlan(FIRST_PLAN_ID, sampleState());
    savePlan('abcd', emptyState());
    expect(localStorage.getItem(BASE_KEY)).not.toBeNull();
    expect(localStorage.getItem(planKey('abcd'))).not.toBeNull();
    expect(localStorage.getItem(BASE_KEY)).not.toBe(localStorage.getItem(planKey('abcd')));
  });

  it('yazılan plan parseState üzerinden birebir geri okunuyor', () => {
    const original = sampleState();
    savePlan('abcd', original);
    expect(JSON.stringify(loadPlan('abcd'))).toBe(JSON.stringify(original));
  });

  it('hiç yazılmamış plan null dönüyor — boş duruma DÜŞMÜYOR', () => {
    // null and "an empty school" must stay tellable apart: the caller decides.
    expect(loadPlan('yokboyle')).toBeNull();
  });

  it('devralma: eski tek anahtar 1. plan olarak okunuyor', () => {
    localStorage.setItem(BASE_KEY, JSON.stringify(sampleState()));
    const adopted = loadPlan(FIRST_PLAN_ID)!;
    expect(adopted.teachers).toHaveLength(sampleState().teachers.length);
    expect(activeProgram(adopted).placements).toEqual(activeProgram(sampleState()).placements);
  });
});

describe('collectStates — paket için toplanan durumlar', () => {
  const lib = {
    activeId: FIRST_PLAN_ID,
    plans: [
      { id: FIRST_PLAN_ID, name: '1. plan', draft: false },
      { id: 'abcd', name: 'İkinci', draft: false },
    ],
  };

  it('AÇIK plan bellekten geliyor, anahtarındaki eski hâlinden değil', () => {
    // The autosave is debounced by 400 ms, so the key can be behind the screen.
    // A backup that quietly drops the last edit is worse than no backup.
    savePlan(FIRST_PLAN_ID, emptyState());
    const onScreen = { ...emptyState(), settings: { ...emptyState().settings, schoolName: 'Yeni' } };
    expect(collectStates(lib, FIRST_PLAN_ID, onScreen)[FIRST_PLAN_ID]!.settings.schoolName).toBe(
      'Yeni',
    );
  });

  it('diğer planlar anahtarlarından okunuyor', () => {
    savePlan('abcd', sampleState());
    const states = collectStates(lib, FIRST_PLAN_ID, emptyState());
    expect(states['abcd']!.teachers).toHaveLength(sampleState().teachers.length);
  });

  it('verisi bulunamayan plan ATLANIYOR — boş bir plan olarak yazılmıyor', () => {
    const states = collectStates(lib, FIRST_PLAN_ID, emptyState());
    expect(Object.keys(states)).toEqual([FIRST_PLAN_ID]);
  });
});

describe('savePlan kota hatasını bildiriyor', () => {
  it('yazılamayınca false dönüyor', () => {
    expect(savePlan('abcd', emptyState())).toBe(true);
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        setItem: () => {
          throw new Error('kota dolu');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(savePlan('abcd', emptyState())).toBe(false);
  });
});
import { activeProgram } from './programs';
