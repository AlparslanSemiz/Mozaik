import { addClass } from './classCrud';
import { emptyState } from './defaults';
import { addLesson } from './lessonCrud';
import { addRoom } from './roomCrud';
import { addSubject, defaultSubjects, deleteSubject, renameSubject, subjectOptions, subjectRank, subjectTeachers, teacherRank, usedSubjects } from './subjectList';
import { setSubjectShort, subjectShort } from './subjectShorts';
import { subjectKey } from './subjects';
import { addTeacher } from './teacherCrud';
import type { State } from './types';

describe('renameSubject', () => {
  function withSubjects(): State {
    let d = emptyState();
    d = addSubject(d, 'Matematik');
    d = addSubject(d, 'Fizik');
    d = addSubject(d, 'Edebiyat');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: 'Fizik', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '' });
    return d;
  }

  it('listede YERİNDE değişiyor — sıra bozulmuyor', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'Fizik ve Astronomi');
    expect(d.settings.subjects).toEqual(['Matematik', 'Fizik ve Astronomi', 'Edebiyat']);
  });

  // The cascade `deleteSubject` deliberately refuses to do. `Teacher.subject`
  // is a NAME, so a rename that stopped at the list would leave every teacher
  // holding a branch that is no longer on it.
  it('öğretmenlerin İKİ alanını da takip ediyor', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'Fizik ve Astronomi');
    expect(d.teachers[0]!.subject).toBe('Matematik');
    expect(d.teachers[0]!.subject2).toBe('Fizik ve Astronomi');
    expect(d.teachers[1]!.subject).toBe('Fizik ve Astronomi');
  });

  it('kısaltma OVERRIDE’ı yeni ada taşınıyor', () => {
    let d = setSubjectShort(withSubjects(), 'Fizik', 'Fz');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBe('Fz');

    d = renameSubject(d, 'Fizik', 'Fizik ve Astronomi');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();
    expect(subjectShort(d.settings, 'Fizik ve Astronomi')).toBe('Fz');
  });

  // The stored value is re-judged against the NEW name's default. "Fzk" is a
  // real override on "Uzay" (whose default is "Uza") and is exactly what the
  // built-in table already says for "Fizik", so the record has to disappear —
  // while the short form ON SCREEN does not move. Left unjudged the backup
  // would carry a row that says nothing, which is the whole reason
  // `subjectShorts` stores only what was changed.
  it('yeni adın varsayılanına eşit KALAN override siliniyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Uzay');
    d = setSubjectShort(d, 'Uzay', 'Fzk');
    expect(d.settings.subjectShorts[subjectKey('Uzay')]).toBe('Fzk');

    d = renameSubject(d, 'Uzay', 'Fizik');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();
    expect(subjectShort(d.settings, 'Fizik')).toBe('Fzk');
  });

  // …and the mirror: a value that was redundant before the rename becomes a
  // real override after it, so the record has to APPEAR.
  it('yeni adın varsayılanından AYRILAN kısaltma override oluyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Fizik');
    d = setSubjectShort(d, 'Fizik', 'Fzk'); // the default: nothing is stored
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();

    d = renameSubject(d, 'Fizik', 'Uzay');
    // Nothing was carried, so the short form now follows the NEW name.
    expect(subjectShort(d.settings, 'Uzay')).toBe('Uza');
  });

  it('boş ada ve BAŞKA bir branşın adına çevirmiyor', () => {
    const before = withSubjects();
    expect(renameSubject(before, 'Fizik', '   ')).toBe(before);
    expect(renameSubject(before, 'Fizik', 'Edebiyat')).toBe(before);
    expect(renameSubject(before, 'Fizik', 'edebiyat')).toBe(before);
  });

  it('yalnız büyük/küçük harfi değiştirmek SERBEST', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'FİZİK');
    expect(d.settings.subjects).toContain('FİZİK');
    expect(d.teachers[1]!.subject).toBe('FİZİK');
  });

  // Renaming one of a teacher's two branches ONTO the other would collapse
  // them: `teacherSubjects()` dedupes, `hasTwoSubjects` goes false, and every
  // `Lesson.second` on that teacher becomes an orphan. It is refused instead —
  // and refused by the ordinary collision check, because `subjectOptions()`
  // covers what teachers hold as well as what the list says.
  it('bir hocanın ÖTEKİ branşının adına çevirmiyor — ders sessizce branş değiştirmez', () => {
    let d = withSubjects();
    d = addRoom(d, 'A');
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4,
      blocks: [],
      second: true,
    });

    const before = d;
    expect(renameSubject(d, 'Fizik', 'Matematik')).toBe(before);
    expect(before.lessons[0]!.second).toBe(true);
  });

  // Even a name nobody put on the list: a teacher carrying a stray branch is
  // still carrying it, and a rename onto it would merge two real things.
  it('yalnız bir öğretmende duran "listede olmayan" ada da çevirmiyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Uzay');
    d = addTeacher(d, { name: 'A B', short: 'AB', subject: 'Kayıp Branş', subject2: '', gender: '' });
    expect(renameSubject(d, 'Uzay', 'Kayıp Branş')).toBe(d);
  });

  it('listede olmayan bir adı yeniden adlandırmak hiçbir şeyi bozmuyor', () => {
    const before = withSubjects();
    const after = renameSubject(before, 'Yokoluş', 'Bir şey');
    expect(after.settings.subjects).toEqual(before.settings.subjects);
    expect(after.teachers).toEqual(before.teachers);
  });
});


describe('usedSubjects', () => {
  it('öğretmenlerde geçen benzersiz branşları sırasıyla verir', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'B B', short: '', subject: 'Fizik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'C C', short: '', subject: 'matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'D D', short: '', subject: '  ', subject2: '', gender: '' });
    expect(usedSubjects(d)).toEqual(['Matematik', 'Fizik']);
  });
});


describe('branş listesi', () => {
  // Was "varsayılan listeyle geliyor" and asserted the opposite. A new project
  // starts EMPTY on purpose now; the built-in table is what the Branşlar step
  // offers beside the list, and a project that already held all 21 made that
  // offer read "Hazır branşlar (0)" on the one screen it is for.
  it('yeni proje BOŞ geliyor — gömülü tablo bir TEKLİF, varsayılan değil', () => {
    expect(emptyState().settings.subjects).toEqual([]);
    expect(defaultSubjects()).toContain('Matematik');
  });

  it('yeni branş ekleniyor, aynısı iki kez eklenmiyor', () => {
    let d = emptyState();
    const before = d.settings.subjects.length;
    d = addSubject(d, ' Robotik ');
    expect(d.settings.subjects).toContain('Robotik');
    expect(d.settings.subjects.length).toBe(before + 1);

    // case-folded duplicate and blank are both refused
    d = addSubject(d, 'robotik');
    d = addSubject(d, '   ');
    expect(d.settings.subjects.length).toBe(before + 1);
  });

  it('silinen branş listeden çıkıyor ama öğretmenin branşına dokunulmuyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = deleteSubject(d, 'Matematik');
    expect(d.settings.subjects).not.toContain('Matematik');
    expect(d.teachers[0]!.subject).toBe('Matematik'); // NEVER a side effect
  });

  it('subjectTeachers kimin kullandığını söylüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Yıldız', short: 'AY', subject: 'matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Sema Kaya', short: 'SK', subject: 'Fizik', subject2: '', gender: '' });
    expect(subjectTeachers(d, 'Matematik').map((t) => t.short)).toEqual(['MÇ', 'AY']);
    expect(subjectTeachers(d, 'Kimya')).toEqual([]);
  });

  it('listede olmayan bir branşı taşıyan öğretmen açılır listede yine görünüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Robotik', subject2: '', gender: '' });
    expect(d.settings.subjects).not.toContain('Robotik');
    // otherwise the dropdown could not show his current subject and would
    // silently change it on the first render
    expect(subjectOptions(d)).toContain('Robotik');
  });
});

describe('subjectRank ve teacherRank', () => {
  const teacher = (subject: string, subject2 = '') => ({
    id: 't', name: 'Ad Soyad', short: 'AS', subject, subject2,
    gender: '' as const, color: 0,
    limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
  });

  it('sıra AYARLARDAKİ listeden geliyor, alfabeden değil', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Zooloji', 'Almanca', 'Matematik'] } };
    const rank = subjectRank(d);
    expect(rank.get('zooloji')).toBe(0);
    expect(rank.get('almanca')).toBe(1);
    expect(rank.get('matematik')).toBe(2);
  });

  it('büyük/küçük harf aynı branştır', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    expect(subjectRank(d).get(subjectKey('MATEMATİK'))).toBe(0);
  });

  it('listede olmayan branş listenin ARDINDAN geliyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Robotik', subject2: '', gender: '' });
    const rank = subjectRank(d);
    expect(rank.get('matematik')).toBe(0);
    expect(rank.get('robotik')).toBe(1);
  });

  it('çift branşlı hoca İKİ branşının ÖNDE olanına göre sıralanıyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Edebiyat', 'Matematik', 'Türkçe'] } };
    const rank = subjectRank(d);
    // Türkçe is last in the list, Edebiyat first: the pair ranks with Edebiyat.
    expect(teacherRank(rank, teacher('Türkçe', 'Edebiyat'))).toBe(0);
    expect(teacherRank(rank, teacher('Türkçe'))).toBe(2);
  });

  it('branşsız öğretmen SONA düşüyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    const rank = subjectRank(d);
    expect(teacherRank(rank, teacher(''))).toBeGreaterThan(teacherRank(rank, teacher('Matematik')));
  });
});

