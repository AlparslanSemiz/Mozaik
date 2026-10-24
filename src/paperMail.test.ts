import { describe, expect, it } from 'vitest';
import { blockSpans, buildIndex } from './pure/constraints';
import { MAILTO_SINIRI, teacherMail } from './pure/paper';
import { t } from './leaf/i18n';
import type { State } from './leaf/model';
import { makeWorld } from './pure/worlds';

function mailOf(state: State, teacher = 0) {
  return teacherMail(state, buildIndex(state), blockSpans(state), state.teachers[teacher]!, t);
}

/** One teacher, `hours` classes, every hour of every day placed: the longest week there is. */
function packed(days: number, hours: number, className = (i: number) => `${410 + i}A SAY`) {
  const classes = Array.from({ length: hours }, (_, i) => ({
    id: `c${i}`,
    name: className(i),
    roomId: null,
  }));
  const placements: Record<string, string> = {};
  for (let d = 0; d < days; d++)
    for (let h = 0; h < hours; h++) placements[`c${h}|${d}|${h}`] = `x${h}`;
  const w = makeWorld({
    days,
    hours,
    teachers: [{ id: 'o1', short: 'AY' }],
    classes,
    lessons: classes.map((c, i) => ({
      id: `x${i}`,
      classId: c.id,
      teacherId: 'o1',
      weeklyHours: days,
    })),
    placements,
  });
  w.teachers[0]!.name = 'Ayşe Yılmaz Karaçelik';
  w.teachers[0]!.email = 'ayse.yilmaz.karacelik@example.com';
  w.settings.schoolName = 'Birey Kurs Eğitim Merkezi';
  return w;
}

describe('öğretmenin haftası e-posta olarak', () => {
  it('kısa bir hafta tam biçimde: gün, ders numarası, zil saati, sınıf ve derslik', () => {
    const w = makeWorld({
      days: 2,
      hours: 3,
      rooms: [{ id: 'dA', name: 'A' }],
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 }],
      placements: { 's510|1|0': 'x1', 's510|1|1': 'x1' },
    });
    w.teachers[0]!.email = 'mc@example.com';
    w.settings.schoolName = 'Birey Kurs';
    const mail = mailOf(w);
    if (typeof mail === 'string') throw new Error(mail);
    expect(mail.form).toBe('full');
    expect(mail.subject).toBe('MÇ · Haftalık ders programı');
    const day = w.settings.days[1]!.name;
    expect(mail.body).toMatch(
      new RegExp(
        `^MÇ · Haftalık ders programı\\nBirey Kurs\\n\\n${day}\\n  1–2\\. ders  \\d\\d:\\d\\d–\\d\\d:\\d\\d  510 · A$`,
      ),
    );
    expect(mail.url.startsWith('mailto:mc@example.com?subject=')).toBe(true);
  });

  it('dersi yerleşmemiş öğretmen boş', () => {
    const w = makeWorld({
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
    });
    expect(mailOf(w)).toBe('empty');
  });

  it('her saati dolu hafta sığana kadar kısalıyor, hiçbir dersi atmadan', () => {
    const w = packed(7, 12);
    const mail = mailOf(w);
    if (typeof mail === 'string') throw new Error(mail);
    expect(mail.form).toBe('bare');
    expect(mail.url.length).toBeLessThanOrEqual(MAILTO_SINIRI);
    // Every one of the 84 lessons is still in it: 7 lines, 12 entries each.
    const lines = mail.body.split('\n');
    expect(lines).toHaveLength(7);
    for (const line of lines) expect(line.split(', ')).toHaveLength(12);
  });

  it('biçimler sırayla deneniyor: önce saatsiz, sonra günde bir satır', () => {
    const forms = [3, 5, 8].map((hours) => {
      const mail = mailOf(packed(7, hours));
      return typeof mail === 'string' ? mail : mail.form;
    });
    expect(forms).toEqual(['full', 'noTimes', 'oneLine']);
  });

  it('en kısa biçime de sığmayan hafta gönderilmiyor, kesilmiyor', () => {
    const w = packed(7, 12, (i) => `${410 + i}A Sayısal Hazırlık Grubu`);
    expect(mailOf(w)).toBe('tooLong');
  });
});
