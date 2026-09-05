// The grid's rows, built from the school rather than drawn.
//
// The reason these live outside Program.tsx is written in CLAUDE.md — "a .tsx
// file that walks `placements` is in the wrong place, and once they are out
// they can be tested without jsdom". This file is that sentence cashed in:
// no React, no DOM, no Grid.tsx (the two types it borrows are `import type`).
//
// `translate('tr', …)` for `t`, so the row heads read as the reader's own
// screen. `makeWorld` for the school, because a row test is about ORDER and
// AXIS and that builder is the one that lets both be written down.

import { placementKey, closedKey } from '../../../keys';
import { buildIndex } from '../../../constraints';
import { translate } from '../../../i18n';
import { closeHours, makeWorld } from '../../../testing/worlds';
import type { State } from '../../../types';
import { EMPTY_PROGRAM_MASK, setRowMask } from '../../../view/programMask';
import { replaceActiveGrid } from '../../../state/programs';
import { buildRows, roomLetter } from '../rows';

const t = (key: string, vars?: Record<string, string | number>) =>
  translate('tr', key, vars);

const rows = (d: State, view: 'teacher' | 'class', mask = EMPTY_PROGRAM_MASK) =>
  buildRows(d, buildIndex(d), view, mask, 'teacher', t);

/** Two teachers, two classes, one room, one day of four hours. */
function school(placements: Record<string, string> = {}): State {
  return makeWorld({
    days: 1,
    hours: 4,
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      { id: 'oMC', short: 'MÇ', subject: 'Matematik' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's433', name: '433', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 },
      { id: 'x2', classId: 's433', teacherId: 'oAV', weeklyHours: 2 },
    ],
    placements,
  });
}

describe('roomLetter — dört dal, dördü de sessiz', () => {
  const ix = buildIndex(school());

  it('bilinen derslik adını verir', () => {
    expect(roomLetter(ix, 'dA')).toBe('A');
  });

  it('null boş dize', () => {
    expect(roomLetter(ix, null)).toBe('');
  });

  it('undefined boş dize', () => {
    expect(roomLetter(ix, undefined)).toBe('');
  });

  it('bilinmeyen kimlik boş dize — fırlatmaz', () => {
    expect(roomLetter(ix, 'yok')).toBe('');
  });
});

describe('iskelet — hücre dizisi gün x saat, indeks gün*saat+saat', () => {
  it('uzunluk gün sayısı çarpı saat sayısı', () => {
    const d = makeWorld({ days: 3, hours: 5, teachers: [{ id: 'oMC', short: 'MÇ' }] });
    expect(rows(d, 'teacher')[0]!.cells).toHaveLength(15);
    expect(rows(d, 'teacher')[0]!.closed).toHaveLength(15);
  });

  it('bir yerleşim DOĞRU gözde durur', () => {
    // 2. gün, 3. saat -> 1 * 4 + 2 = 6. Bir kaymayı yakalayan tek şey bu
    // aritmetiğin yazılı olması (Grid.tsx da onu okuyor).
    const d = makeWorld({
      days: 2,
      hours: 4,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 }],
      placements: { [placementKey('s510', 1, 2)]: 'x1' },
    });
    const row = rows(d, 'teacher')[0]!;
    expect(row.cells[1 * 4 + 2]?.lessonId).toBe('x1');
    expect(row.cells.filter((c) => c !== null)).toHaveLength(1);
  });
});

describe('iki eksen — tek fark satırların NE olduğu', () => {
  const d = school({ [placementKey('s510', 0, 0)]: 'x1' });

  it('öğretmen ekseninde satır başına bir öğretmen', () => {
    const list = rows(d, 'teacher');
    expect(list.map((r) => r.id)).toEqual(['oMC', 'oAV']);
    expect(list[0]!.kind).toBe('teacher');
    expect(list[0]!.name).toBe('MÇ');
  });

  it('sınıf ekseninde satır başına bir sınıf', () => {
    const list = rows(d, 'class');
    expect(list.map((r) => r.id)).toEqual(['s510', 's433']);
    expect(list[0]!.kind).toBe('class');
    expect(list[0]!.name).toBe('510');
  });

  it('öğretmen satırının alt satırı branşın KISALTMASI', () => {
    // Tam ad değil: bu sütun "Matematik"i "Matemat…" diye kesiyordu ve iki
    // branşın ikincisini hiç göstermiyordu.
    expect(rows(d, 'teacher')[0]!.secondary).toBe('Mat');
  });

  it('iki branşlı öğretmende ikisi de ORTA NOKTA ile yazılır', () => {
    const two = school();
    const withSecond: State = {
      ...two,
      teachers: two.teachers.map((x) =>
        x.id === 'oMC' ? { ...x, subject2: 'Fizik' } : x,
      ),
    };
    expect(rows(withSecond, 'teacher')[0]!.secondary).toBe('Mat · Fzk');
  });

  it('sınıf satırının alt satırı dersliği, dersliksizde başka bir cümle', () => {
    const list = rows(d, 'class');
    expect(list[0]!.secondary).toBe('A dersliği');
    expect(list[1]!.secondary).toBe('derslik yok');
  });

  it('hücreler karşı ekseni okur', () => {
    // Öğretmenin haftasında hücre sınıfı ve dersliği söyler; sınıfın
    // haftasında öğretmeni ve branşı.
    const teacherCell = rows(d, 'teacher')[0]!.cells[0]!;
    expect(teacherCell.top).toBe('510');
    expect(teacherCell.bottom).toBe('A');

    const classCell = rows(d, 'class')[0]!.cells[0]!;
    expect(classCell.top).toBe('MÇ');
    expect(classCell.bottom).toBe('Mat');
  });
});

describe('continues — bir BLOK SINIRI, komşuluk değil', () => {
  // Ders 3 saat ve blocks [2]: bir günde arka arkaya duran üç saati 2+1
  // demek, üç saatlik tek blok değil. `continues` düz komşuluk olsaydı
  // ikisi de true olur, ekranda tek bir üç saatlik kart çizilir ve sağ
  // tıkın kestiği çizgi gözün gördüğü çizgi olmazdı.
  function threeInARow(blockSize: number): State {
    return makeWorld({
      days: 1,
      hours: 4,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize },
      ],
      placements: {
        [placementKey('s510', 0, 0)]: 'x1',
        [placementKey('s510', 0, 1)]: 'x1',
        [placementKey('s510', 0, 2)]: 'x1',
      },
    });
  }

  it('2+1: ilk hücre devam eder, İKİNCİSİ ETMEZ', () => {
    const cells = rows(threeInARow(2), 'teacher')[0]!.cells;
    expect(cells[0]?.continues).toBe(true);
    expect(cells[1]?.continues).toBe(false);
    expect(cells[2]?.continues).toBe(false);
  });

  it('1+1+1: hiçbiri devam etmez', () => {
    const cells = rows(threeInARow(1), 'teacher')[0]!.cells;
    expect(cells.slice(0, 3).map((c) => c?.continues)).toEqual([false, false, false]);
  });

  it('3: ilk ikisi devam eder', () => {
    const cells = rows(threeInARow(3), 'teacher')[0]!.cells;
    expect(cells.slice(0, 3).map((c) => c?.continues)).toEqual([true, true, false]);
  });

  it('günün son saatinde devam yok — sonraki gün başka bir gündür', () => {
    const d = makeWorld({
      days: 2,
      hours: 2,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
      placements: {
        [placementKey('s510', 0, 1)]: 'x1',
        [placementKey('s510', 1, 0)]: 'x1',
      },
    });
    expect(rows(d, 'teacher')[0]!.cells[1]?.continues).toBe(false);
  });
});

describe('closed — kapalı saat, ve sınıf ekseninde İKİ kaynak', () => {
  it('öğretmen ekseninde öğretmenin kendi kapalı saati', () => {
    const d = closeHours(school(), 'oMC', [[0, 2]]);
    const row = rows(d, 'teacher')[0]!;
    expect(row.closed[2]).toBe(true);
    expect(row.closed[0]).toBe(false);
  });

  it('öğretmenin kapalı saati ÖTEKİ öğretmenin satırına geçmez', () => {
    const d = closeHours(school(), 'oMC', [[0, 2]]);
    expect(rows(d, 'teacher')[1]!.closed[2]).toBe(false);
  });

  it('sınıf ekseninde sınıfın kendi kapalı saati', () => {
    const d = closeHours(school(), 's510', [[0, 1]]);
    expect(rows(d, 'class')[0]!.closed[1]).toBe(true);
  });

  it('sınıf ekseninde DERSLİĞİN kapalı saati de sayılır', () => {
    // İkinci OR dalı: sınıf açık ama dersliği kapalı. 433'ün dersliği yok,
    // yani ondan etkilenmiyor — o da aynı satırda ölçülüyor.
    const d = closeHours(school(), 'dA', [[0, 3]]);
    expect(rows(d, 'class')[0]!.closed[3]).toBe(true);
    expect(rows(d, 'class')[1]!.closed[3]).toBe(false);
  });
});

describe('conflict — sonradan kapatılan saatte kalmış ders', () => {
  it('kart SİLİNMEZ, bir sebep cümlesi taşır', () => {
    // Tuzak 16: tarama yalnız BOŞ hücreye çiziliyor, yani kartın altında
    // kalıyordu ve hiçbir yerde görünmüyordu.
    const laid = school({ [placementKey('s510', 0, 0)]: 'x1' });
    const d = closeHours(laid, 'oMC', [[0, 0]]);

    const cell = rows(d, 'teacher')[0]!.cells[0]!;
    expect(cell.lessonId).toBe('x1');
    expect(cell.conflict).not.toBeNull();
    expect(cell.conflict).toContain('MÇ');
  });

  it('çakışma yokken conflict null', () => {
    const d = school({ [placementKey('s510', 0, 0)]: 'x1' });
    expect(rows(d, 'teacher')[0]!.cells[0]!.conflict).toBeNull();
  });
});

describe('pinned — okuyanın kilidi hücrede görünür', () => {
  it('sabitlenmiş hücre iki eksende de pinned', () => {
    const laid = school({ [placementKey('s510', 0, 0)]: 'x1' });
    const d = replaceActiveGrid(laid, {
      pinned: { [placementKey('s510', 0, 0)]: 1 },
    });
    expect(rows(d, 'teacher')[0]!.cells[0]!.pinned).toBe(true);
    expect(rows(d, 'class')[0]!.cells[0]!.pinned).toBe(true);
  });

  it('sabitlenmemiş hücre false', () => {
    const d = school({ [placementKey('s510', 0, 0)]: 'x1' });
    expect(rows(d, 'teacher')[0]!.cells[0]!.pinned).toBe(false);
  });
});

describe('mask — gizli satır DÜŞER, hayalet satır kalır', () => {
  const laid = school({ [placementKey('s510', 0, 0)]: 'x1' });

  it('hidden satır listeden çıkar', () => {
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oAV', 'hidden');
    expect(rows(laid, 'teacher', mask).map((r) => r.id)).toEqual(['oMC']);
  });

  it('ghost satır listede kalır ve işaretini taşır', () => {
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oAV', 'ghost');
    const list = rows(laid, 'teacher', mask);
    expect(list.map((r) => r.id)).toEqual(['oMC', 'oAV']);
    expect(list[1]!.mask).toBe('ghost');
  });

  it('hücrenin maskesi KARŞI eksenden gelir', () => {
    // Öğretmenin satırındaki hücre bir sınıfa ait; o sınıf soluklaştırılmışsa
    // hücre de öyle çizilmeli, satırın kendisi apaçık dursa bile.
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'class', 's510', 'ghost');
    const list = rows(laid, 'teacher', mask);
    expect(list.map((r) => r.id)).toEqual(['oMC', 'oAV']);
    expect(list[0]!.mask).toBeUndefined();
    expect(list[0]!.cells[0]!.mask).toBe('ghost');
  });

  it('karşı eksende gizlenen satırın hücresi ÇİZİLMEYE devam eder', () => {
    // "hidden" bir SATIRI düşürür, bir hücreyi değil: 510 gizliyken MÇ'nin
    // haftası hâlâ o dersi gösteriyor, yoksa öğretmenin saati boş sanılırdı.
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'class', 's510', 'hidden');
    const list = rows(laid, 'teacher', mask);
    expect(list[0]!.cells[0]?.lessonId).toBe('x1');
    expect(list[0]!.cells[0]!.mask).toBe('hidden');
  });
});

describe('kimliğin rengi satırın kendisinden gelir', () => {
  it('satır rengi varlığın rengi, hücre rengi renk ÖLÇÜTÜNDEN', () => {
    const laid = school({ [placementKey('s510', 0, 0)]: 'x1' });
    const ix = buildIndex(laid);

    const byTeacher = buildRows(laid, ix, 'class', EMPTY_PROGRAM_MASK, 'teacher', t);
    const byClass = buildRows(laid, ix, 'class', EMPTY_PROGRAM_MASK, 'class', t);

    // Satır başı iki ölçütte de sınıfın kendi rengi.
    expect(byTeacher[0]!.color).toBe(byClass[0]!.color);
    // Hücre ölçütle birlikte kıpırdar: MÇ palette 0, 510 da 0 — ayrılmak
    // için ikinci sınıfın hücresine bakılır.
    const laid433 = school({ [placementKey('s433', 0, 0)]: 'x2' });
    const ix433 = buildIndex(laid433);
    const cellByTeacher = buildRows(laid433, ix433, 'class', EMPTY_PROGRAM_MASK, 'teacher', t)[1]!
      .cells[0]!;
    const cellByClass = buildRows(laid433, ix433, 'class', EMPTY_PROGRAM_MASK, 'class', t)[1]!
      .cells[0]!;
    expect(cellByTeacher.color).toBe(1); // oAV
    expect(cellByClass.color).toBe(1); // 433
  });
});

describe('yetim yerleşim ızgarayı çökertmez', () => {
  it('dersi silinmiş bir yerleşim sınıf ekseninde soru işaretiyle çizilir', () => {
    const laid = school({ [placementKey('s510', 0, 0)]: 'x1' });
    const d: State = { ...laid, lessons: [] };
    const cell = rows(d, 'class')[0]!.cells[0]!;
    expect(cell.top).toBe('?');
    expect(cell.bottom).toBe('');
  });

  it('kapalı saat anahtarı closedKey ile aynı biçimde okunuyor', () => {
    // Bu satırın tek işi biçimi çivilemek: unavailable bir YEDEK DOSYASINDA
    // duruyor, yani anahtar biçimi saklanan veri (keys.ts'in kendi uyarısı).
    const d: State = { ...school(), unavailable: { [closedKey('oMC', 0, 1)]: 1 } };
    expect(rows(d, 'teacher')[0]!.closed[1]).toBe(true);
  });
});
