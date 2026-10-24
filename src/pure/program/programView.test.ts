// The Program screen's working, asked directly (pure/programView.ts).
//
// `programScreen.test.tsx` pins what the screen DRAWS; this file asks the
// rules that drawing cannot show on a small world: that a lesson's biggest
// card comes first in every order of the tray, that "opened" wins where a cell
// is both opened and moved,
// and the small answers the menu and the head of the tray lean on.

import {
  buildIndex,
  closedKey,
  dropMap,
  place,
  placementKey,
  setBlockPinned,
} from '../constraints';
import { EMPTY_PROGRAM_MASK, setDayMask, setRowMask } from './index';
import { replaceActiveGrid } from '../grid';
import {
  buildPool,
  buildRows,
  classOfCell,
  blockMaskedDays,
  describeBar,
  describeMenu,
  describeStrip,
  dropNotice,
  poolMenuFacts,
  markPreview,
  roomLetter,
  visibleDays,
  waitingSubjects,
  type BarRun,
  type ColorOf,
} from './programView';
import { translate } from '../../leaf/i18n/i18n';
import type { PoolSort, State } from '../../leaf/model/types';
import { makeWorld } from '../worlds';

const t = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const byTeacher: ColorOf = (d, lesson) => d.teachers.findIndex((x) => x.id === lesson.teacherId);

/**
 * Two lessons that each owe cards of more than one size: L1 is 2+2+1 and L2 is
 * 2+1, nothing placed, both in 510. In the class view every card has the same
 * row, so the tail of the comparator is what orders a lesson's own cards.
 */
function world(): State {
  return makeWorld({
    days: 2,
    hours: 4,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAY', short: 'AY', subject: 'Fizik' },
    ],
    classes: [{ id: 's510', name: '510', roomId: 'dA' }],
    lessons: [
      { id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 5, blockSize: 2 },
      { id: 'L2', classId: 's510', teacherId: 'oAY', weeklyHours: 3, blockSize: 2 },
    ],
  });
}

describe('havuz', () => {
  const sorts: PoolSort[] = ['row', 'name', 'subject', 'size', 'left'];

  it.each(sorts)('%s sırasında bir dersin büyük bloğu önce', (sort) => {
    const d = world();
    const { cards } = buildPool(
      d,
      buildIndex(d),
      'class',
      EMPTY_PROGRAM_MASK,
      sort,
      '',
      byTeacher,
      t,
    );
    // Within one lesson the biggest block comes first. ('size' puts a lesson's
    // two-hour and one-hour cards under different headings, which is the
    // order itself.) The deck, a lesson's identical blocks as one run, gets no
    // assertion of its own: the cards are pushed lesson by lesson and the sort
    // is stable, so identical blocks tie on every key and stay together
    // whatever the tail says. No mutation of the tail could turn it red.
    if (sort !== 'size') {
      for (const id of ['L1', 'L2']) {
        const sizes = cards.filter((c) => c.lessonId === id).map((c) => c.size);
        expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
      }
    }
    expect(cards).toHaveLength(5);
  });

  it('sayaç süzgeçten önce sayar, tamamlanan ders kart vermez', () => {
    const d = world();
    const ix = buildIndex(d);
    const all = buildPool(d, ix, 'class', EMPTY_PROGRAM_MASK, 'row', '', byTeacher, t);
    const fizik = buildPool(d, ix, 'class', EMPTY_PROGRAM_MASK, 'row', 'fizik', byTeacher, t);
    expect([all.total, all.completed, all.cards.length]).toEqual([5, 0, 5]);
    expect([fizik.total, fizik.cards.map((c) => c.lessonId)]).toEqual([5, ['L2', 'L2']]);

    // L2 laid out whole (2+1 on the first day): it counts as done, not waiting.
    const done = replaceActiveGrid(d, {
      placements: {
        [placementKey('s510', 0, 0)]: 'L2',
        [placementKey('s510', 0, 1)]: 'L2',
        [placementKey('s510', 0, 3)]: 'L2',
      },
    });
    const rest = buildPool(
      done,
      buildIndex(done),
      'class',
      EMPTY_PROGRAM_MASK,
      'row',
      '',
      byTeacher,
      t,
    );
    expect([rest.total, rest.completed, new Set(rest.cards.map((c) => c.lessonId))]).toEqual([
      3,
      1,
      new Set(['L1']),
    ]);
  });

  it('bekleyen branşlar, gizli satırın dersi sayılmadan', () => {
    const d = world();
    expect(waitingSubjects(d, EMPTY_PROGRAM_MASK)).toEqual([
      ['fizik', 'Fizik'],
      ['matematik', 'Matematik'],
    ]);
    expect(waitingSubjects(d, { ...EMPTY_PROGRAM_MASK, teachers: { oAY: 'hidden' } })).toEqual([
      ['matematik', 'Matematik'],
    ]);
  });
});

describe('ızgara', () => {
  it('önizlemede hem açılan hem yeri değişen hücre "açılan" işaretini alır', () => {
    const d = makeWorld({
      days: 2,
      hours: 4,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [{ id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      placements: { [placementKey('s510', 0, 1)]: 'L1' },
    });
    const rows = buildRows(d, buildIndex(d), 'class', EMPTY_PROGRAM_MASK, byTeacher, t);
    const diff = {
      opened: new Set([closedKey('oMC', 0, 1)]),
      moved: new Set([placementKey('s510', 0, 1)]),
      movedBlocks: 1,
    };
    const marked = markPreview(rows, d, diff, 'class');
    expect(marked[0]?.cells[1]?.mark).toBe('opened');
    const onlyMoved = markPreview(rows, d, { ...diff, opened: new Set() }, 'class');
    expect(onlyMoved[0]?.cells[1]?.mark).toBe('moved');
  });

  it('öğretmen görünümünde hücrenin sınıfı o saatteki dersten', () => {
    const d = makeWorld({
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      lessons: [{ id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      placements: { [placementKey('s510', 0, 2)]: 'L1' },
    });
    expect(classOfCell(d, 'teacher', 'oMC', 0, 2)).toBe('s510');
    expect(classOfCell(d, 'teacher', 'oMC', 0, 1)).toBeNull();
    expect(classOfCell(d, 'class', 's510', 0, 1)).toBe('s510');
  });

  it('dersliğin adı, dersliği olmayan ya da silinmiş sınıfta boş', () => {
    const ix = buildIndex(world());
    expect([roomLetter(ix, 'dA'), roomLetter(ix, null), roomLetter(ix, 'yok')]).toEqual([
      'A',
      '',
      '',
    ]);
  });

  it('gizli gün sayılmaz, soluklaşan gün sayılır', () => {
    const days = world().settings.days;
    expect(visibleDays(days, {})).toEqual([0, 1]);
    expect(visibleDays(days, { [days[0]!.name]: 'hidden' })).toEqual([1]);
    expect(visibleDays(days, { [days[0]!.name]: 'ghost' })).toEqual([0, 1]);
  });
});

describe('araç çubuğunun altındaki satır', () => {
  const idle: BarRun = { running: false, progress: null, result: null, applied: null };

  it('koşu sürerken ilerlemeyi, sürmüyorsa görünümü söyler', () => {
    const running: BarRun = {
      ...idle,
      running: true,
      progress: { placedBlocks: 1, totalBlocks: 4, nodes: 0, elapsedMs: 50, excludedBlocks: 0 },
    };
    expect(describeBar(running, 'class', t, { applied: false, result: false })).toEqual({
      text: 'Otomatik diziliyor… 1/4 blok · 0,1 sn',
      level: 'busy',
    });
    expect(describeBar(idle, 'teacher', t, { applied: false, result: false }).level).toBe('');
  });

  it('artık geçerli olmayan sonuç ve uygulanan öneri söylenmez', () => {
    const d = world();
    const said: BarRun = {
      ...idle,
      applied: {},
      result: {
        phase: 'solved',
        state: d,
        stuck: [],
        placedBlocks: 2,
        totalBlocks: 2,
        nodes: 0,
        elapsedMs: 0,
        excludedBlocks: 0,
      },
    };
    expect(describeBar(said, 'class', t, { applied: false, result: false }).level).toBe('');
    expect(describeBar(said, 'class', t, { applied: false, result: true }).text).toMatch(
      /^Program dizildi\. 2 blok/,
    );
    expect(describeBar(said, 'class', t, { applied: true, result: true }).text).toMatch(
      /^Öneri uygulandı/,
    );
  });
});

// The Program strip's counts. They were worked out inside the strip until RF10
// (TODO §8k) moved them here unchanged; these pin what the two destructive
// questions and "Otomatik diz (N)" read.
describe('şeridin sayıları', () => {
  it('boş ızgarada bütün bloklar bekliyor, silinecek saat yok', () => {
    expect(describeStrip(world(), EMPTY_PROGRAM_MASK)).toEqual({
      exclusions: { teacherIds: [], classIds: [], dayNames: [] },
      pending: 5,
      placed: 0,
      pinnedHours: 0,
      gridEmpty: true,
      masked: 0,
      allPinned: false,
    });
  });

  it('sabitlenen saat silinecekler arasında sayılmaz, hepsi sabitse kaldırma önerilir', () => {
    const placed = place(world(), 'L1', 0, 0, 2);
    const loose = describeStrip(placed, EMPTY_PROGRAM_MASK);
    expect([
      loose.pending,
      loose.placed,
      loose.pinnedHours,
      loose.gridEmpty,
      loose.allPinned,
    ]).toEqual([4, 2, 0, false, false]);

    const pinned = describeStrip(setBlockPinned(placed, 's510', 0, 0, true), EMPTY_PROGRAM_MASK);
    expect([pinned.pending, pinned.placed, pinned.pinnedHours, pinned.allPinned]).toEqual([
      4,
      0,
      2,
      true,
    ]);
  });

  it('bir kenara ayrılan öğretmenin dersleri beklemede sayılmaz, gün yalnız sayaçta', () => {
    const mask = setDayMask(setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oMC', 'ghost'), 'Pazartesi');
    const counts = describeStrip(world(), mask);
    expect(counts.pending).toBe(2);
    expect(counts.masked).toBe(1);
    expect(counts.exclusions.teacherIds).toEqual(['oMC']);
  });
});

// The Program screen's menus and drag, moved out of `ui/program/Program.tsx`
// without a change to what they compute (2026-10-24).
describe('sağ tık menüsü ve sürükleme', () => {
  it('bir kartın menüsü bloğu, dersini, sabitliğini ve satırın maskesini okuyor', () => {
    const d = setBlockPinned(place(world(), 'L1', 0, 1, 2), 's510', 0, 1, true);
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'class', 's510', 'ghost');
    const facts = describeMenu(d, buildIndex(d), 'class', mask, {
      kind: 'card',
      rowId: 's510',
      day: 0,
      hour: 2,
    });
    expect([facts.classId, facts.lessonId, facts.pinned, facts.cellMasked]).toEqual([
      's510',
      'L1',
      true,
      true,
    ]);
    expect([facts.rowId, facts.day, facts.rowMode, facts.dayMode]).toEqual([
      's510',
      0,
      'ghost',
      undefined,
    ]);
  });

  it('bir gün başlığının menüsünde kart yok, gün ve maskesi var', () => {
    const d = world();
    const dayName = d.settings.days[1]!.name;
    const mask = setDayMask(EMPTY_PROGRAM_MASK, dayName, 'hidden');
    const facts = describeMenu(d, buildIndex(d), 'teacher', mask, { kind: 'day', day: 1 });
    expect([facts.at, facts.rowId, facts.day, facts.dayName, facts.dayMode]).toEqual([
      null,
      null,
      1,
      dayName,
      'hidden',
    ]);
    expect(describeMenu(d, buildIndex(d), 'teacher', mask, null).day).toBeNull();
  });

  it('havuz kartının menüsü açık görünümün satırını okuyor', () => {
    const d = world();
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oAY', 'hidden');
    expect(poolMenuFacts(buildIndex(d), 'teacher', mask, 'L2')).toMatchObject({
      rowId: 'oAY',
      rowMode: 'hidden',
    });
    expect(poolMenuFacts(buildIndex(d), 'class', mask, 'L2').rowId).toBe('s510');
    expect(poolMenuFacts(buildIndex(d), 'class', mask, null).rowId).toBeNull();
  });

  it('kenara ayrılan günün hücreleri bırakmayı sebebiyle reddediyor', () => {
    const d = world();
    const ix = buildIndex(d);
    const dayName = d.settings.days[1]!.name;
    const map = dropMap(d, ix, 'L1', 2, null);
    const before = map.get('0|0');
    blockMaskedDays(map, d, { [dayName]: 'ghost' }, t);
    expect(map.get('0|0')).toEqual(before);
    expect(map.get('1|0')?.blocked).toContain('geçici olarak kapsam dışında');
    expect(map.get('1|0')?.evicts).toEqual([]);
  });

  it('boş hücreye bırakmanın cümlesi yok, birini havuza düşürenin var', () => {
    const d = place(world(), 'L2', 0, 0, 2);
    const ix = buildIndex(d);
    const map = dropMap(d, ix, 'L1', 2, null);
    expect(dropNotice(ix, 'L1', null, map.get('1|0'))).toBe('');
    const onTop = map.get('0|0');
    expect(onTop?.evicts.length ?? 0).toBeGreaterThan(0);
    expect(dropNotice(ix, 'L1', null, onTop)).not.toBe('');
  });
});
