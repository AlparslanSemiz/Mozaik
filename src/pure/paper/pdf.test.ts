// The hand-written PDF (`pdf.ts`): what a reader needs to open the file at all
// (the cross-reference table points at every object, the stream is as long
// as it says), and what the teacher must find on it (Turkish letters, the
// header line, the codes' legend, colour only when asked for).

import { describe, expect, it } from 'vitest';
import { blockSpans, buildIndex, placementKey } from '../constraints';
import { classSheet, sheetHead, sheetPdf, teacherSheet, type SheetOptions } from './index';
import { translate } from '../../leaf/i18n/i18n';
import { paletteColor, type State } from '../../leaf/model';
import { makeWorld } from '../worlds';

const t = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const ALL: SheetOptions = { clock: true, school: true, credits: true, cellBottom: true };

function world(): State {
  const d = makeWorld({
    days: [{ name: 'Salı', longBreakAfter: 2 }],
    hours: 4,
    teachers: [{ id: 'oMC', short: 'MÇ', subject: 'Matematik' }],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [{ id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 }],
    placements: { [placementKey('s510', 0, 0)]: 'L1', [placementKey('s510', 0, 1)]: 'L1' },
  });
  return {
    ...d,
    teachers: d.teachers.map((x) => ({ ...x, name: 'Ayşe Işık Güneş' })),
    settings: { ...d.settings, schoolName: 'Şişli Kurs' },
  };
}

function pdfOf(state: State, kind: 'class' | 'teacher', paint: boolean): string {
  const ix = buildIndex(state);
  const spans = blockSpans(state);
  const sheet =
    kind === 'class'
      ? classSheet(state, ix, spans, state.classes[0]!, ALL, t)
      : teacherSheet(state, ix, spans, state.teachers[0]!, ALL);
  return sheetPdf({
    sheet,
    head: sheetHead(state, ALL),
    paint: paint ? paletteColor : null,
    left: 'Güz planı',
    right: '16.11.2026 14:05 · Sayfa 1 / 1',
  });
}

describe('sheetPdf', () => {
  it('yalnız ASCII, ve her nesne xref’in gösterdiği yerde başlıyor', () => {
    const pdf = pdfOf(world(), 'class', true);
    expect(/^[\x09\x0a\x20-\x7e]*$/.test(pdf)).toBe(true);
    expect(pdf.startsWith('%PDF-1.4\n')).toBe(true);
    expect(pdf.endsWith('%%EOF\n')).toBe(true);

    const xref = Number(/startxref\n(\d+)\n/.exec(pdf)![1]);
    expect(pdf.slice(xref, xref + 4)).toBe('xref');
    const offsets = [...pdf.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    expect(offsets).toHaveLength(7);
    offsets.forEach((at, i) => expect(pdf.slice(at).startsWith(`${i + 1} 0 obj\n`)).toBe(true));

    const length = Number(/<<\/Length (\d+)>>stream\n/.exec(pdf)![1]);
    const start = pdf.indexOf('stream\n') + 'stream\n'.length;
    expect(pdf.slice(start + length)).toMatch(/^\nendstream/);
  });

  it('Türkçe harfler Latin-5 yerlerinde, sekizlik kaçışla ve üç haneli', () => {
    const pdf = pdfOf(world(), 'teacher', false);
    // "Ayşe Işık Güneş": ş 254, I-dotless capital is plain I, ı 253, ü 252.
    expect(pdf).toContain(
      '(Ay\\376e I\\376\\375k G\\374ne\\376 \\(M\\307\\) \\267 Haftal\\375k ders program\\375)',
    );
    expect(pdf).toContain(
      '/Differences[208/Gbreve 221/Idotaccent/Scedilla 240/gbreve 253/dotlessi/scedilla]',
    );
    // An escape is always three digits: "\26" before a "6" would read as one byte.
    expect(/\\[0-7]{1,2}(?![0-7])/.test(pdf)).toBe(false);
  });

  it('üst satır, ve sınıf sayfasında kodların açıklaması', () => {
    const pdf = pdfOf(world(), 'class', false);
    expect(pdf).toContain('(G\\374z plan\\375)');
    expect(pdf).toContain('(16.11.2026 14:05 \\267 Sayfa 1 / 1)');
    expect(pdf).toContain('(M\\307 Ay\\376e I\\376\\375k G\\374ne\\376)');
  });

  it('renk yalnız istenince basılıyor', () => {
    // Every fill but the header row's grey.
    const fills = (pdf: string) =>
      [...pdf.matchAll(/([\d.]+ [\d.]+ [\d.]+) rg/g)].filter((m) => m[1] !== '0.933 0.933 0.933');
    expect(fills(pdfOf(world(), 'class', true)).length).toBeGreaterThan(0);
    expect(fills(pdfOf(world(), 'class', false))).toHaveLength(0);
  });
});
