// Kontrol's problem rows: one per lesson, one per cause, and where "Göster"
// lands. Worlds are 1-2 days x 4 hours, so every count is checkable by hand.

import { describe, expect, it } from 'vitest';
import { buildIndex, closedConflicts, findViolations } from '../constraints';
import { makeWorld } from '../worlds';
import { buildReport, groupStranded, groupUnplaceable, health, violationCell } from './index';

const TWO_TEACHERS = [
  { id: 'oMC', short: 'MÇ' },
  { id: 'oAV', short: 'AV', subject: 'Fizik' },
];

describe('groupStranded', () => {
  it('iki saatlik dersi tek satır sayar ve iki saati de adlandırır', () => {
    // The audit's case: "AY, Çarşamba 1. saatte kapalı" twice, under
    // a heading that said "2 ders" for one lesson.
    const d = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 }],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1 },
    });
    const ix = buildIndex(d);
    const rows = groupStranded(d, ix, closedConflicts(d, ix));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells.map((c) => c.hour)).toEqual([0, 1]);
    expect(rows[0]!.reason).toBe('MÇ, Salı 1, 2. saatlerde kapalı');
    expect(rows[0]!.closedBy).toEqual([{ kind: 'teacher', id: 'oMC' }]);
    expect(buildReport(d).stranded).toBe(1);
    expect(health(d).message).toContain('1 ders kapalı saatte');
  });

  it('tek saati closed.ts cümlesiyle, iki kapatanı ayrı ayrı söyler', () => {
    const d = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
      placements: { 's510|0|0': 'x1', 's510|0|2': 'x1' },
      unavailable: { 'oMC|0|0': 1, 's510|0|2': 1 },
    });
    const ix = buildIndex(d);
    const [row] = groupStranded(d, ix, closedConflicts(d, ix));
    expect(row!.reason).toBe('MÇ, Salı 1. saatte kapalı; 510 sınıfı Salı 3. saatte kapalı');
    expect(row!.closedBy.map((x) => x.kind)).toEqual(['teacher', 'class']);
  });

  it('iki dersi iki satır sayar', () => {
    const d = makeWorld({
      teachers: TWO_TEACHERS,
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
        { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 1 },
      ],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x2' },
      unavailable: { 's510|0|0': 1, 's510|0|1': 1 },
    });
    const ix = buildIndex(d);
    expect(groupStranded(d, ix, closedConflicts(d, ix))).toHaveLength(2);
  });
});

describe('stuckReason ve groupUnplaceable', () => {
  it('bütün hafta kapalı öğretmenin derslerini tek sebep altında toplar', () => {
    const unavailable: Record<string, 1> = {};
    for (let s = 0; s < 4; s++) unavailable[`oMC|0|${s}`] = 1;
    const d = makeWorld({
      classes: [
        { id: 's510', name: '510', roomId: null },
        { id: 's511', name: '511', roomId: null },
        { id: 's512', name: '512', roomId: null },
      ],
      lessons: ['s510', 's511', 's512'].map((c, i) => ({
        id: `x${i}`,
        classId: c,
        teacherId: 'oMC',
        weeklyHours: 1,
      })),
      unavailable,
    });
    const report = buildReport(d);
    expect(report.unplaceable).toHaveLength(3);
    const groups = groupUnplaceable(report.unplaceable);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.lessons).toHaveLength(3);
    // The capacity row's own sentence: the binding numbers, not a sample cell.
    expect(groups[0]!.message).toBe('MÇ 0 saat açık, 3 saat ders yüklenmiş. 3 saat fazla.');
    expect(groups[0]!.fix).toEqual({ kind: 'teacher', id: 'oMC' });
  });

  it('boş açık saati kalmayan sınıfı söyler, kapalı hücreyi değil', () => {
    // 510 is open 2 hours, both taken by AV; MÇ's lesson has nowhere.
    const d = makeWorld({
      teachers: TWO_TEACHERS,
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oAV', weeklyHours: 2 },
        { id: 'x2', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
      ],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
      unavailable: { 's510|0|2': 1, 's510|0|3': 1 },
    });
    const [u] = buildReport(d).unplaceable;
    // 3 loaded into 2 open hours is a capacity row first.
    expect(u!.message).toContain('510 sınıfına 3 saat ders yüklenmiş');
    expect(u!.fix).toEqual({ kind: 'class', id: 's510' });
  });

  it('boş saatleri neyin tuttuğunu sayar', () => {
    // 510's two empty hours are hours AV teaches 511 in.
    const d = makeWorld({
      teachers: TWO_TEACHERS,
      classes: [
        { id: 's510', name: '510', roomId: null },
        { id: 's511', name: '511', roomId: null },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 },
        { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 2 },
        { id: 'x3', classId: 's510', teacherId: 'oAV', weeklyHours: 1 },
      ],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1', 's511|0|2': 'x2', 's511|0|3': 'x2' },
    });
    const [u] = buildReport(d).unplaceable;
    expect(u!.message).toBe('510 sınıfının 2 boş saati var: 2 saatinde AV başka sınıfta.');
    expect(u!.fix).toBeNull();
  });

  it('ayrı sebepleri ayrı satır yapar, ilk görüldüğü sırayla', () => {
    const unavailable: Record<string, 1> = {};
    for (let s = 0; s < 4; s++) {
      unavailable[`oMC|0|${s}`] = 1;
      unavailable[`oAV|0|${s}`] = 1;
    }
    const d = makeWorld({
      teachers: TWO_TEACHERS,
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
        { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 1 },
      ],
      unavailable,
    });
    const groups = groupUnplaceable(buildReport(d).unplaceable);
    expect(groups.map((g) => g.lessons.map((u) => u.lessonId))).toEqual([['x1'], ['x2']]);
  });
});

describe('violationCell', () => {
  it('öğretmenin o günkü ilk kartını gösterir', () => {
    const d = makeWorld({
      days: 2,
      limits: { maxConsecutive: 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
      placements: { 's510|1|2': 'x1', 's510|1|3': 'x1' },
    });
    const ix = buildIndex(d);
    const [v] = findViolations(d, ix);
    expect(v!.at).toEqual({ id: 'oMC', day: 1 });
    expect(violationCell(d, ix, v!)).toEqual({
      classId: 's510',
      teacherId: 'oMC',
      day: 1,
      hour: 2,
    });
  });
});

describe('health.short', () => {
  it('dar çubukta da iki kelime kalır', () => {
    expect(health(makeWorld({})).short).toBe('Henüz ders girilmedi');
    const pending = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
    });
    expect(health(pending).short).toBe('2 saat yerleşmedi');
    const stuck = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1, 'oMC|0|2': 1, 'oMC|0|3': 1 },
    });
    // One lesson with nowhere to go: the same number as "Sorunlar (N)". MÇ's
    // capacity row is a warning, and not a row of that panel.
    expect(health(stuck).short).toBe('1 sorun');
    expect(health(stuck).problems).toBe(1);
    const over = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 5 }],
    });
    expect(health(over).short).toBe('3 uyarı'); // MÇ, 510 and room A
    const done = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      placements: { 's510|0|0': 'x1' },
    });
    expect(health(done).short).toBe('Sorun yok');
  });
});
