import { addClass } from './classCrud';
import { place } from './constraints';
import { emptyState } from './defaults';
import { deletionQuestion, deletionSummary } from './deletion';
import { addLesson } from './lessonCrud';
import { addRoom } from './roomCrud';
import { addTeacher } from './teacherCrud';
import type { State } from './types';

describe('deletionSummary', () => {
  function loaded(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    d = addClass(d, '511', room);
    const teacher = d.teachers[0]!.id;
    const [a, b] = d.classes;
    d = addLesson(d, { classId: a!.id, teacherId: teacher, weeklyHours: 4, blocks: [2, 2] });
    d = addLesson(d, { classId: b!.id, teacherId: teacher, weeklyHours: 2, blocks: [] });
    // put the 2-hour block of the first lesson on the grid
    d = place(d, d.lessons[0]!.id, 0, 0);
    return d;
  }

  it('öğretmen: ders sayısını ve yerleşmiş saati sayar', () => {
    const d = loaded();
    expect(deletionSummary(d, 'teacher', d.teachers[0]!.id)).toBe(
      'MÇ (Mehmet Çelik) silinecek. 2 dersi ve programa yerleşmiş 2 saati de gidecek. ' +
        'Devam edilsin mi?',
    );
  });

  it('bağlısı yoksa kısa sorar — ama YİNE sorar', () => {
    let d = emptyState();
    d = addClass(d, '430', null);
    expect(deletionSummary(d, 'class', d.classes[0]!.id)).toBe(
      '430 sınıfı silinecek. Devam edilsin mi?',
    );
  });

  it('dersi var ama hiçbiri yerleşmemişse yerleşmiş saatten söz etmez', () => {
    const d = loaded();
    expect(deletionSummary(d, 'class', d.classes[1]!.id)).toBe(
      '511 sınıfı silinecek. 1 dersi de gidecek. Devam edilsin mi?',
    );
  });

  it('derslik: hangi sınıfların dersliğinin boşalacağını ADLARIYLA söyler', () => {
    const d = loaded();
    expect(deletionSummary(d, 'room', d.rooms[0]!.id)).toBe(
      'A dersliği silinecek. 2 sınıfın dersliği boşalacak (510, 511) ve derslik ' +
        'çakışması artık kontrol edilmeyecek. Devam edilsin mi?',
    );
  });

  it('derslik boşsa çakışma cümlesini kurmaz', () => {
    let d = emptyState();
    d = addRoom(d, 'B');
    expect(deletionSummary(d, 'room', d.rooms[0]!.id)).toBe(
      'B dersliği silinecek. Devam edilsin mi?',
    );
  });

  it('ders: yerleşmiş saat varsa onu, yoksa haftalık saati söyler', () => {
    const d = loaded();
    expect(deletionSummary(d, 'lesson', d.lessons[0]!.id)).toBe(
      '510 sınıfının MÇ dersi silinecek. Programa yerleşmiş 2 saati de kalkacak. ' +
        'Devam edilsin mi?',
    );
    expect(deletionSummary(d, 'lesson', d.lessons[1]!.id)).toBe(
      '511 sınıfının MÇ dersi silinecek (2 saat). Devam edilsin mi?',
    );
  });

  it('olmayan kimlikte çökmez', () => {
    const d = loaded();
    for (const kind of ['room', 'teacher', 'class', 'lesson'] as const) {
      expect(deletionSummary(d, kind, 'yok')).toContain('Devam edilsin mi?');
    }
  });

  // The dialog wants the two halves separately: a heading and a cost line.
  // Splitting the sentence back apart by looking for a full stop would be
  // pitfall 22 again, so the split is made where the halves are written — and
  // the one-string form has to stay EXACTLY what it was, or every existing
  // assertion above is lying about what the user reads.
  it('iki parça, birleştirilince eski cümlenin TA KENDİSİ', () => {
    const d = loaded();
    for (const [kind, id] of [
      ['teacher', d.teachers[0]!.id],
      ['class', d.classes[0]!.id],
      ['class', d.classes[1]!.id],
      ['room', d.rooms[0]!.id],
      ['lesson', d.lessons[0]!.id],
      ['lesson', d.lessons[1]!.id],
      ['room', 'yok'],
    ] as const) {
      const q = deletionQuestion(d, kind, id);
      const joined = `${q.title}. ${q.cost === '' ? '' : `${q.cost} `}Devam edilsin mi?`;
      expect(joined).toBe(deletionSummary(d, kind, id));
      // A heading is a heading: no trailing stop, no question.
      expect(q.title.endsWith('.')).toBe(false);
      expect(q.title).not.toContain('Devam edilsin mi');
      // ...and a cost line, when there is one, is a whole sentence.
      if (q.cost !== '') expect(q.cost.endsWith('.')).toBe(true);
    }
  });

  it('bedeli olmayan silmede cost BOŞ, uydurulmuş bir cümle değil', () => {
    let d = emptyState();
    d = addRoom(d, 'B');
    expect(deletionQuestion(d, 'room', d.rooms[0]!.id)).toEqual({
      title: 'B dersliği silinecek',
      cost: '',
    });
  });
});

