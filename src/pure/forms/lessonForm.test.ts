// The add-lesson form's rules (pure/forms/lessonForm.ts), asked directly. They
// lived inside the Dersler screen until 2026-10-24 and were pinned only by the
// E2E lesson specs; this pins the branch and teacher interplay itself.

import { describe, expect, it } from 'vitest';
import type { State } from '../../leaf/model';
import { makeWorld } from '../worlds';
import { afterAdd, chooseSubject, chooseTeacher, lessonChoices, type LessonDraft } from './index';

/** MÇ teaches Matematik and Geometri, AY teaches Fizik. */
function world(): State {
  const d = makeWorld({
    days: 2,
    hours: 4,
    teachers: [
      { id: 'oMC', short: 'MÇ', subject: 'Matematik' },
      { id: 'oAY', short: 'AY', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: null }],
    lessons: [],
  });
  return {
    ...d,
    teachers: d.teachers.map((x) => (x.id === 'oMC' ? { ...x, subject2: 'Geometri' } : x)),
  };
}

const blank: LessonDraft = { classId: '', teacherId: '', subject: '', hours: '4' };

describe('ders ekleme formu', () => {
  it('branş seçilince öğretmenler daralıyor, ikinci branşla da bulunuyor', () => {
    const d = world();
    expect(lessonChoices(d, 'all', blank, undefined).teacherPool.map((x) => x.id)).toEqual([
      'oMC',
      'oAY',
    ]);
    const geo = { ...blank, subject: 'Geometri' };
    expect(lessonChoices(d, 'all', geo, undefined).teacherPool.map((x) => x.id)).toEqual(['oMC']);
  });

  it('öğretmen seçilince branş geliyor, kutudaki branşı tutuyorsa o kalıyor', () => {
    const d = world();
    expect(chooseTeacher(d, blank, 'oMC').subject).toBe('Matematik');
    expect(chooseTeacher(d, { ...blank, subject: 'geometri' }, 'oMC').subject).toBe('Geometri');
  });

  it('öğretmenin tutmadığı branş öğretmeni düşürüyor, öğretmenden kipinde düşürmüyor', () => {
    const d = world();
    const mc = d.teachers.find((x) => x.id === 'oMC');
    const draft = { ...blank, teacherId: 'oMC', subject: 'Matematik' };
    expect(chooseSubject(draft, 'Fizik', mc, 'all').teacherId).toBe('');
    expect(chooseSubject(draft, 'Fizik', mc, 'teacher').teacherId).toBe('oMC');
    expect(chooseSubject(draft, 'Geometri', mc, 'all').teacherId).toBe('oMC');
  });

  it('öğretmenden kipinde branş kutusu yalnız iki branşlı öğretmende soruyor, ikincisi bayrak', () => {
    const d = world();
    const mc = d.teachers.find((x) => x.id === 'oMC');
    const ay = d.teachers.find((x) => x.id === 'oAY');
    const geo = lessonChoices(d, 'teacher', { ...blank, subject: 'Geometri' }, mc);
    expect([geo.askSubject, geo.subjectValue, geo.secondFlag]).toEqual([true, 'Geometri', true]);
    const stale = lessonChoices(d, 'teacher', { ...blank, subject: 'Fizik' }, mc);
    expect([stale.subjectValue, stale.secondFlag]).toEqual(['Matematik', false]);
    expect(lessonChoices(d, 'teacher', blank, ay).askSubject).toBe(false);
  });

  it('eklemeden sonra yürünen eksen kalıyor, öteki temizleniyor', () => {
    const draft = { classId: 's510', teacherId: 'oMC', subject: 'Matematik', hours: '3' };
    expect(afterAdd(draft, 'teacher')).toEqual({ ...draft, classId: '' });
    expect(afterAdd(draft, 'class')).toEqual({ ...draft, teacherId: '', subject: '' });
  });
});
