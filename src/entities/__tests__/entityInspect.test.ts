import { setAvailability, setWholeWeek } from '../availability';
import { addClass } from '../classCrud';
import { place } from '../../constraints';
import { emptyState } from '../defaults';
import { entityFacts, entityWeek } from '../entityInspect';
import { addLesson } from '../lessonCrud';
import { addRoom } from '../roomCrud';
import { addTeacher } from '../teacherCrud';
import type { State } from '../../types';

// ---------------------------------------------------------------------------
// One entity, on its own. The reader asked for it in one sentence: "her
// derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve
// programının gözükmesi". The information already existed and was spread over
// four tabs; these two functions are what put it together.

describe('entityWeek', () => {
  function school(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    const teacher = d.teachers[0]!.id;
    const group = d.classes[0]!.id;
    d = addLesson(d, { classId: group, teacherId: teacher, weeklyHours: 4, blocks: [2, 2] });
    d = place(d, d.lessons[0]!.id, 0, 0); // Salı, 1-2. ders
    return d;
  }

  it('satır = GÜN, sütun = ders — müsaitlik ve kâğıtla aynı eksende', () => {
    const d = school();
    const week = entityWeek(d, 'teacher', d.teachers[0]!.id);
    expect(week).toHaveLength(d.settings.days.length);
    expect(week[0]).toHaveLength(d.settings.hours.length);
  });

  it('öğretmenin haftası HANGİ SINIF olduğunu yazar, altında dersliği', () => {
    const d = school();
    const week = entityWeek(d, 'teacher', d.teachers[0]!.id);
    expect(week[0]![0]).toEqual({
      top: '510',
      bottom: 'A',
      color: 0,
      closed: false,
      conflict: false,
    });
    // The block is two hours long and both of them are drawn.
    expect(week[0]![1]!.top).toBe('510');
    // ...and the third hour is free, not "empty-looking".
    expect(week[0]![2]).toEqual({
      top: '',
      bottom: '',
      color: null,
      closed: false,
      conflict: false,
    });
  });

  it('sınıfın haftası HANGİ ÖĞRETMEN olduğunu yazar, altında branşı', () => {
    const d = school();
    const week = entityWeek(d, 'class', d.classes[0]!.id);
    expect(week[0]![0]!.top).toBe('MÇ');
    expect(week[0]![0]!.bottom).toBe('Mat');
    // Colour is the TEACHER's, in every view — the same rule the grid follows.
    expect(week[0]![0]!.color).toBe(0);
  });

  it('dersliğin haftası onu KULLANAN sınıfı yazar', () => {
    const d = school();
    const week = entityWeek(d, 'room', d.rooms[0]!.id);
    expect(week[0]![0]!.top).toBe('510');
    expect(week[0]![0]!.bottom).toBe('MÇ');
  });

  it('sonradan kapatılan saatteki ders SİLİNMİYOR, çakışma olarak işaretleniyor', () => {
    // Pitfall 16, seen from the panel: the lesson stays (principle 6) and the
    // panel has to be the second place that says so.
    let d = school();
    d = setAvailability(d, d.teachers[0]!.id, [{ day: 0, hour: 0 }], true);
    const cell = entityWeek(d, 'teacher', d.teachers[0]!.id)[0]![0]!;
    expect(cell.top).toBe('510');
    expect(cell.closed).toBe(true);
    expect(cell.conflict).toBe(true);
  });

  it('boş bir okulda çökmez', () => {
    const d = emptyState();
    expect(entityWeek(d, 'teacher', 'yok')).toHaveLength(d.settings.days.length);
  });
});

describe('entityFacts', () => {
  function school(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    d = addClass(d, '511', room);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4, blocks: [2, 2],
    });
    return place(d, d.lessons[0]!.id, 0, 0);
  }

  it('öğretmen: branşı, dersleri ve yerleşmiş saati SAYAR', () => {
    const d = school();
    const facts = entityFacts(d, 'teacher', d.teachers[0]!.id)!;
    expect(facts.short).toBe('MÇ');
    expect(facts.name).toBe('Mehmet Çelik');
    expect(facts.color).toBe(0);
    expect(facts.links[0]).toBe('Branşı: Matematik');
    expect(facts.links[1]).toContain('1 dersi var');
    expect(facts.links[1]).toContain('510');
    const placed = facts.rows.find((r) => r.label === 'Programa yerleşmiş')!;
    expect(placed.value).toBe('2 / 4 saat');
    // Half the lesson is still in the pool, and that is worth flagging where
    // the number is read rather than only in Kontrol.
    expect(placed.tight).toBe(true);
  });

  it('yük açık saatten fazlaysa DAR işaretleniyor', () => {
    let d = school();
    // Close the whole week for the teacher: 0 open hours against 4 of load.
    d = setWholeWeek(d, d.teachers[0]!.id, true);
    const facts = entityFacts(d, 'teacher', d.teachers[0]!.id)!;
    expect(facts.rows.find((r) => r.label === 'Haftalık ders yükü')!.tight).toBe(true);
    expect(facts.rows.find((r) => r.label === 'Açık saat')!.value).toBe(
      `0 / ${d.settings.days.length * d.settings.hours.length}`,
    );
  });

  it('derslik: kaç sınıfın paylaştığını ADLARIYLA söyler ve rengi YOK', () => {
    const d = school();
    const facts = entityFacts(d, 'room', d.rooms[0]!.id)!;
    expect(facts.color).toBeNull();
    expect(facts.links[0]).toBe('2 sınıf paylaşıyor: 510, 511');
  });

  it('dersi olmayan sınıf bunu açıkça söyler', () => {
    const d = school();
    const facts = entityFacts(d, 'class', d.classes[1]!.id)!;
    expect(facts.name).toBe('511 sınıfı');
    expect(facts.links[1]).toBe('Henüz dersi yok');
  });

  it('olmayan kimlikte null döner, çökmez', () => {
    const d = school();
    for (const kind of ['teacher', 'class', 'room'] as const) {
      expect(entityFacts(d, kind, 'yok')).toBeNull();
    }
  });
});

