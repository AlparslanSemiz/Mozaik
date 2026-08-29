import {
  parseLessons,
  parseRooms,
  splitGrid,
  makeShort,
  parseTeachers,
  parseClasses,
} from './import';

describe('splitGrid', () => {
  it('Excel sekmeli yapıştırmayı ayırır ve boş satırları atar', () => {
    expect(splitGrid('a\tb\tc\n\nd\te\tf\n')).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]);
  });

  it('sekme yoksa noktalı virgül, o da yoksa virgül kullanır', () => {
    expect(splitGrid('a;b;c')).toEqual([['a', 'b', 'c']]);
    expect(splitGrid('a,b,c')).toEqual([['a', 'b', 'c']]);
  });

  it('hücrelerin başındaki ve sonundaki boşluğu temizler', () => {
    expect(splitGrid('  a  \t  b  ')).toEqual([['a', 'b']]);
  });
});

describe('parseTeachers', () => {
  it('ad, kısaltma ve branşı okur, başlık satırını atlar', () => {
    const { accepted } = parseTeachers('Ad\tKısaltma\tBranş\nMehmet Çelik\tMÇ\tMatematik');
    expect(accepted).toEqual([
      { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', gender: '', subject2: '' },
    ]);
  });

  it('kısaltma boşsa addan üretir', () => {
    const { accepted } = parseTeachers('Mehmet Çelik\t\tMatematik');
    expect(accepted[0]!.short).toBe('MÇ');
  });

  it('branş boşsa satırı alır ama uyarır', () => {
    const { accepted, errors } = parseTeachers('Mehmet Çelik\tMÇ');
    expect(accepted).toHaveLength(1);
    expect(errors[0]).toContain('branş boş');
  });

  it('dördüncü sütun cinsiyeti okuyor', () => {
    const { accepted } = parseTeachers(
      'Ayşe Varol\tAV\tFizik\tK\nMurat Bilge\tMB\tKimya\tErkek',
    );
    expect(accepted.map((x) => x.gender)).toEqual(['k', 'e']);
  });

  // The column arrived after the first three. A list pasted in the old shape
  // must not need retyping, and a half-filled column must not be an error.
  it('ÜÇ sütunlu eski yapıştırma hâlâ çalışıyor', () => {
    const { accepted, errors } = parseTeachers('Mehmet Çelik\tMÇ\tMatematik');
    expect(errors).toEqual([]);
    expect(accepted[0]!.gender).toBe('');
  });

  it('tanınmayan cinsiyet satırı düşürmüyor', () => {
    const { accepted, errors } = parseTeachers('Mehmet Çelik\tMÇ\tMatematik\tX');
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.gender).toBe('');
    expect(errors).toEqual([]);
  });
});

describe('makeShort', () => {
  it('Türkçe harfleri doğru büyütür', () => {
    expect(makeShort('İsmail Şahin')).toBe('İŞ');
    expect(makeShort('ismail çelik')).toBe('İÇ');
    expect(makeShort('Ali')).toBe('A');
    expect(makeShort('')).toBe('??');
  });
});

describe('parseClasses', () => {
  it('sınıf ve dersliği okur', () => {
    const { accepted } = parseClasses('510\tA\n511\tA\n433\tB');
    expect(accepted).toEqual([
      { name: '510', roomName: 'A' },
      { name: '511', roomName: 'A' },
      { name: '433', roomName: 'B' },
    ]);
  });

  it('tekrar eden sınıfı bir kez alır ve uyarır', () => {
    const { accepted, errors } = parseClasses('510\tA\n510\tB');
    expect(accepted).toHaveLength(1);
    expect(errors[0]).toContain('iki kez');
  });

  it('derslik sütunu yoksa boş bırakır', () => {
    expect(parseClasses('510')).toEqual({
      accepted: [{ name: '510', roomName: '' }],
      errors: [],
    });
  });
});

describe('parseLessons', () => {
  it('sınıf, öğretmen, saat ve bloğu okur', () => {
    const { accepted } = parseLessons('510\tMÇ\t6\t2');
    expect(accepted).toEqual([
      { className: '510', teacher: 'MÇ', weeklyHours: 6, blocks: [2, 2, 2] },
    ]);
  });

  it('blok boşsa hepsi tek saat', () => {
    expect(parseLessons('510\tMÇ\t6').accepted[0]!.blocks).toEqual([]);
  });

  // The column says how LONG a block is, and the remainder stays single: 7
  // hours at 3 is 3+3+1, not "as many threes as divide evenly".
  it('bloğu o boyda tekrarlar, kalanı tek bırakır', () => {
    expect(parseLessons('510\tMÇ\t7\t3').accepted[0]!.blocks).toEqual([3, 3]);
    expect(parseLessons('510\tMÇ\t9\t4').accepted[0]!.blocks).toEqual([4, 4]);
  });

  // 4 is the ceiling the model has; a column that says 9 cannot mean 9.
  it('bloğu en fazla 4 ile sınırlar', () => {
    expect(parseLessons('510\tMÇ\t8\t9').accepted[0]!.blocks).toEqual([4, 4]);
  });

  it('saat okunamayan satırı atlar ve sebebini yazar', () => {
    const { accepted, errors } = parseLessons('510\tMÇ\tabc');
    expect(accepted).toHaveLength(0);
    expect(errors[0]).toContain('saat okunamadı');
  });

  it('eksik satırı atlar ve sebebini yazar', () => {
    const { accepted, errors } = parseLessons('510\t\t4');
    expect(accepted).toHaveLength(0);
    expect(errors[0]).toContain('öğretmen boş');
  });

  it('virgüllü ondalık saati yuvarlar', () => {
    expect(parseLessons('510;MÇ;2,4').accepted[0]!.weeklyHours).toBe(2);
  });
});

describe('parseRooms', () => {
  it('satır başına bir derslik alır ve tekrarı eler', () => {
    const { accepted, errors } = parseRooms('A\nB\nA\nC');
    expect(accepted.map((x) => x.name)).toEqual(['A', 'B', 'C']);
    expect(errors).toHaveLength(1);
  });
});
