// Which subject something is taught under. Pure; no State machinery beyond a
// hand-built one.

import { describe, expect, it } from 'vitest';
import { hasTwoSubjects, lessonSubject, subjectKey, teacherSubjects } from '../subjects';
import { emptyState } from '../../entities';
import type { Lesson, State, Teacher } from '../../types';

const teacher = (subject: string, subject2: string): Teacher => ({
  id: 'oMC',
  name: 'Mehmet Çelik',
  short: 'MÇ',
  subject,
  subject2,
  gender: '',
  color: 0,
  limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
});

const lesson = (second: boolean, teacherId = 'oMC'): Lesson => ({
  id: 'x1',
  classId: 's510',
  teacherId,
  weeklyHours: 4,
  blocks: [],
  second,
  maxPerDay: null,
});

const school = (t: Teacher): State => ({ ...emptyState(), teachers: [t] });

describe('subjectKey', () => {
  it('kırpıyor ve TÜRKÇE küçültüyor', () => {
    expect(subjectKey('  Matematik ')).toBe('matematik');
    // The one the default locale gets wrong: 'I'.toLowerCase() is 'i', but in
    // Turkish it is 'ı' — and "Tarih" vs "TARİH" has to compare equal.
    expect(subjectKey('TARİH')).toBe(subjectKey('Tarih'));
    expect(subjectKey('IŞIK')).toBe('ışık');
  });
});

describe('teacherSubjects', () => {
  it('tek branşlı hoca tek isim veriyor', () => {
    expect(teacherSubjects(teacher('Matematik', ''))).toEqual(['Matematik']);
    expect(hasTwoSubjects(teacher('Matematik', ''))).toBe(false);
  });

  it('iki branşlı hoca ikisini de veriyor, sırayla', () => {
    expect(teacherSubjects(teacher('Türkçe', 'Edebiyat'))).toEqual(['Türkçe', 'Edebiyat']);
    expect(hasTwoSubjects(teacher('Türkçe', 'Edebiyat'))).toBe(true);
  });

  it('boşluklar kırpılıyor, boş kutu bir branş SAYILMIYOR', () => {
    expect(teacherSubjects(teacher(' Matematik ', '   '))).toEqual(['Matematik']);
    // A blank FIRST box with a filled second one is a data error somebody can
    // make in the form; the list must not come back with a hole in it.
    expect(teacherSubjects(teacher('', 'Fizik'))).toEqual(['Fizik']);
  });

  it('iki kutuya aynı ad yazılmışsa TEK branş — büyük/küçük harf fark etmez', () => {
    // Otherwise the lesson form would offer a choice between two identical
    // options, and picking either would mean the same thing.
    expect(teacherSubjects(teacher('Matematik', 'matematik'))).toEqual(['Matematik']);
    expect(hasTwoSubjects(teacher('Matematik', ' MATEMATİK '))).toBe(false);
  });
});

describe('lessonSubject', () => {
  it('bayrak yoksa birinci branş', () => {
    expect(lessonSubject(school(teacher('Türkçe', 'Edebiyat')), lesson(false))).toBe('Türkçe');
  });

  it('bayrak varsa ikinci branş', () => {
    expect(lessonSubject(school(teacher('Türkçe', 'Edebiyat')), lesson(true))).toBe('Edebiyat');
  });

  // sanitize() clears such a flag on every load, but a hand-edited file reaches
  // the screen before it does — and a lesson labelled '' would draw an empty
  // cell in the class view with nothing to explain it.
  it('ikinci branşı OLMAYAN hocada bayrak birinciye düşüyor, boşa değil', () => {
    expect(lessonSubject(school(teacher('Matematik', '')), lesson(true))).toBe('Matematik');
  });

  it('hocası silinmiş ders boş dönüyor, çökmüyor', () => {
    expect(lessonSubject(school(teacher('Matematik', '')), lesson(false, 'yok'))).toBe('');
  });
});
