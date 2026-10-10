// @vitest-environment jsdom

// What the Program screen and the printed sheet DRAW, pinned before their
// working moves out of the components (TODO §8k, refactor step 4, RF8 and RF9).
//
// The rows, the tray, the line under the toolbar and the cut at the long break
// are all computed inside `Program.tsx`, `Grid.tsx` and `Print.tsx`, so they
// are read here the only way they can be read today: by rendering the real
// components and writing down what came out. The world is small enough to be
// checked on paper, and every case in it is one that has gone wrong before:
//
//   - a three-hour block the long break cuts 1 + 2 (Salı, 510, MÇ)
//   - a 2 + 1 lesson sitting on one day, which must stay two cells (Çarşamba, 511)
//   - a placed hour that has since been closed (MÇ, Çarşamba 5)
//   - two pinned hours, a teacher with two subjects teaching the second one,
//     a class with no room and a room closed under an empty class hour
//   - a teacher with no lessons at all (ZK)
//
// The snapshots are inline on purpose (see sentences.test.tsx): the expected
// drawing is in this file, and reviewing a change to it is reading it.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';
import { closedKey, placementKey } from './pure/constraints';
import { EMPTY_PROGRAM_MASK, type ProgramMask } from './pure/program/programMask';
import { activePlacements, replaceActiveGrid } from './pure/program/programs';
import { makeWorld } from './worlds';
import type { Advice, SolverRun } from './platform/search';
import type { Suggestion } from './pure/relax';
import { PRINT_DEFAULTS, type PoolSort, type ProgramColorMode } from './platform/prefs';
import type { State, View } from './leaf/types';
import Program from './ui/program/Program';
import Print, { NOTHING_EXCLUDED } from './ui/print/Print';
import { LangProvider } from './ui/T';
import { DialogProvider } from './ui/Dialogs';
import { ToastProvider } from './ui/Toasts';
import { InspectorProvider } from './ui/program/Inspector';
import { LessonEditProvider } from './ui/LessonEdit';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseState } from './pure/parseState';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// jsdom has no ResizeObserver; stubbed exactly as App.test.tsx stubs it.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  };
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
  localStorage.setItem('ders-programi-dil', 'tr');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

// ------------------------------------------------------------------ dünya

function world(): State {
  const base = makeWorld({
    days: [
      { name: 'Salı', longBreakAfter: 2 },
      { name: 'Çarşamba', longBreakAfter: 3 },
    ],
    hours: 5,
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      { id: 'oMC', short: 'MÇ', subject: 'Matematik' },
      { id: 'oAY', short: 'AY', subject: 'Fizik' },
      { id: 'oZK', short: 'ZK', subject: 'Matematik' },
    ],
    classes: [
      { id: 's510', name: '510 SAY', roomId: 'dA' },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 5, blockSize: 3 },
      { id: 'L2', classId: 's511', teacherId: 'oAY', weeklyHours: 3, blockSize: 2 },
      { id: 'L3', classId: 's510', teacherId: 'oAY', weeklyHours: 2, blockSize: 2 },
      { id: 'L4', classId: 's511', teacherId: 'oMC', weeklyHours: 1 },
    ],
    placements: {
      [placementKey('s510', 0, 1)]: 'L1',
      [placementKey('s510', 0, 2)]: 'L1',
      [placementKey('s510', 0, 3)]: 'L1',
      [placementKey('s510', 1, 4)]: 'L1',
      [placementKey('s511', 1, 0)]: 'L2',
      [placementKey('s511', 1, 1)]: 'L2',
      [placementKey('s511', 1, 2)]: 'L2',
      [placementKey('s511', 0, 0)]: 'L4',
    },
    unavailable: {
      [closedKey('oMC', 1, 4)]: 1,
      [closedKey('s511', 0, 4)]: 1,
      [closedKey('dA', 0, 0)]: 1,
    },
  });
  const teachers = base.teachers.map((t) =>
    t.id === 'oAY' ? { ...t, name: 'Ayşe Yılmaz', subject2: 'Kimya' } : t,
  );
  const lessons = base.lessons.map((l) => (l.id === 'L3' ? { ...l, second: true } : l));
  const settings = {
    ...base.settings,
    schoolName: 'Deneme Dershanesi',
    subjects: ['Matematik', 'Fizik', 'Kimya'],
  };
  return replaceActiveGrid(
    { ...base, settings, teachers, lessons },
    { pinned: { [placementKey('s511', 1, 0)]: 1, [placementKey('s511', 1, 1)]: 1 } },
  );
}

/**
 * The same teacher in two classes in one hour, the way an old backup or an
 * import can still hold it: MÇ's two-hour block in 510 covers Salı 1–2, and
 * 511's lesson of MÇ sits on Salı 2 too. The placements are written in that
 * order, so the teacher's index points at 511 for the second hour.
 */
function doubleBooked(): State {
  return makeWorld({
    days: [{ name: 'Salı', longBreakAfter: 0 }],
    hours: 4,
    teachers: [{ id: 'oMC', short: 'MÇ' }],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'L1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 },
      { id: 'L4', classId: 's511', teacherId: 'oMC', weeklyHours: 1 },
    ],
    placements: {
      [placementKey('s510', 0, 0)]: 'L1',
      [placementKey('s510', 0, 1)]: 'L1',
      [placementKey('s511', 0, 1)]: 'L4',
    },
  });
}

/**
 * A way for `world()`, written by hand rather than searched for, and a legal
 * week: open MÇ's closed Çarşamba 5 (where L1 already sits), move 511's hour
 * of MÇ from Salı 1 to Çarşamba 4, and lay L1's last hour on 510's Salı 5, so
 * the tray of the suggested week is not the tray of this one.
 */
function way(state: State): Suggestion {
  return {
    family: 'teacherHours',
    changes: [{ kind: 'teacherHour', teacherId: 'oMC', day: 1, hour: 4 }],
    placements: Object.fromEntries([
      ...Object.entries(activePlacements(state)).filter(
        ([key]) => key !== placementKey('s511', 0, 0),
      ),
      [placementKey('s511', 1, 3), 'L4'],
      [placementKey('s510', 0, 4), 'L1'],
    ]),
    size: 1,
    proven: true,
    relaid: false,
    accepted: [],
  };
}

function advised(state: State): SolverRun {
  const advice: Advice = {
    forState: state,
    searching: false,
    stopped: false,
    progress: null,
    suggestions: [way(state)],
    answers: state.answers,
  };
  return idle({ advice });
}

// ------------------------------------------------------------------ çizim

function idle(over: Partial<SolverRun> = {}): SolverRun {
  return {
    running: false,
    progress: null,
    result: null,
    advice: null,
    applied: null,
    start: () => undefined,
    stop: () => undefined,
    apply: () => undefined,
    reconsider: () => undefined,
    resume: () => undefined,
    clear: () => undefined,
    ...over,
  };
}

function Providers({ state, children }: { state: State; children: ReactNode }) {
  const change = () => undefined;
  return (
    <LangProvider>
      <DialogProvider>
        <ToastProvider>
          <InspectorProvider state={state} change={change}>
            <LessonEditProvider state={state} change={change}>
              {children}
            </LessonEditProvider>
          </InspectorProvider>
        </ToastProvider>
      </DialogProvider>
    </LangProvider>
  );
}

interface ProgramProps {
  view?: View;
  mask?: ProgramMask;
  poolSort?: PoolSort;
  poolFilter?: string;
  colorMode?: ProgramColorMode;
  solver?: SolverRun;
}

function drawProgram(state: State, p: ProgramProps = {}) {
  act(() =>
    root.render(
      <Providers state={state}>
        <Program
          active
          state={state}
          change={() => undefined}
          solver={p.solver ?? idle()}
          view={p.view ?? 'class'}
          mask={p.mask ?? EMPTY_PROGRAM_MASK}
          setMask={() => undefined}
          poolSort={p.poolSort ?? 'row'}
          setPoolSort={() => undefined}
          poolFilter={p.poolFilter ?? ''}
          setPoolFilter={() => undefined}
          colorMode={p.colorMode ?? 'teacher'}
        />
      </Providers>,
    ),
  );
}

function drawPrint(state: State) {
  act(() =>
    root.render(
      <Providers state={state}>
        <Print
          state={state}
          excluded={NOTHING_EXCLUDED}
          setExcluded={() => undefined}
          scope="both"
          colored
          options={PRINT_DEFAULTS}
          setOptions={() => undefined}
        />
      </Providers>,
    ),
  );
}

const text = (el: Element | null | undefined): string => (el?.textContent ?? '').trim();

/**
 * One line per grid row: the head, then every <td> that carries a cell —
 * `gün.saat`, `×n` for a merged block, its classes, and the card it holds.
 */
function gridLines(): string[] {
  return [...container.querySelectorAll('table.grid tbody tr')].map((tr) => {
    const head = tr.querySelector('th.row-head');
    const rowMask = tr.className === '' ? '' : ` {${tr.className}}`;
    const cells = [...tr.querySelectorAll<HTMLTableCellElement>('td')].map((td) => {
      if (td.classList.contains('break-col')) return '|';
      const at = `${td.dataset.day}.${td.dataset.hour}${td.colSpan > 1 ? `×${td.colSpan}` : ''}`;
      const cls = td.className === '' ? '' : `(${td.className})`;
      const card = td.querySelector<HTMLElement>('.card');
      if (card === null) return `${at}${cls}${text(td) === '' ? '' : `:${text(td)}`}`;
      const flags = card.className.replace(/^card\s?/, '');
      return (
        `${at}${cls}:${text(card.querySelector('.card-top'))}/${text(card.querySelector('.card-bottom'))}` +
        `#${card.style.background}${flags === '' ? '' : `[${flags}]`}`
      );
    });
    return `${text(head?.querySelector('.inspect'))} — ${text(head?.querySelector('.secondary'))}${rowMask}: ${cells.join(' ')}`;
  });
}

/** Where each drawn cell of a grid row starts and how wide it is. */
function gridSpans(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const tr of container.querySelectorAll<HTMLElement>('table.grid tbody tr')) {
    const spans = [...tr.querySelectorAll<HTMLTableCellElement>('td[data-day]')].map(
      (td) => `${td.dataset.day}.${td.dataset.hour}×${td.colSpan}`,
    );
    out.set(tr.dataset.rowId ?? '', spans);
  }
  return out;
}

/** The tray: its head, then each group with its cards in order. */
function poolLines(): string[] {
  const out = [text(container.querySelector('.pool-count'))];
  for (const group of container.querySelectorAll('.pool-group')) {
    const cards = [...group.querySelectorAll<HTMLElement>('.pool-card')].map(
      (c) =>
        `${c.dataset.lesson}:${c.dataset.size}:${text(c)}` +
        `${c.classList.contains('masked-scope') ? '[masked]' : ''}#${c.style.background}`,
    );
    out.push(`${group.getAttribute('aria-label') ?? ''}: ${cards.join(' ')}`);
  }
  return out;
}

function bar(): string {
  const el = container.querySelector('.reason-bar');
  return `${el?.className ?? ''} :: ${text(el?.querySelector('span'))}`;
}

/** One line per printed page: its title, then each day's cells as `span:text`. */
function printLines(): string[] {
  return [...container.querySelectorAll('.print-page')].map((page) => {
    const title = [...page.querySelectorAll('h3 span.p-title-main, h3 span.p-title-sub')]
      .map(text)
      .join(' / ');
    const days = [...page.querySelectorAll('tbody tr')].map((tr) =>
      [...tr.querySelectorAll<HTMLTableCellElement>('td')]
        .map(
          (td) =>
            `${td.colSpan}${td.className === '' ? '' : `(${td.className})`}:${text(td)}` +
            `${td.style.background === '' ? '' : `#${td.style.background}`}`,
        )
        .join(' '),
    );
    return [title, ...days].join('\n  ');
  });
}

/**
 * The printed cells of one page as the grid would name them, `gün.saat×n`,
 * worked out from where each <td> falls in its row.
 */
function printSpans(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const pages = [...container.querySelectorAll('.print-page')];
  for (const [p, page] of pages.entries()) {
    const spans: string[] = [];
    for (const [g, tr] of [...page.querySelectorAll('tbody tr')].entries()) {
      let hour = 0;
      for (const td of tr.querySelectorAll<HTMLTableCellElement>('td')) {
        spans.push(`${g}.${hour}×${td.colSpan}`);
        hour += td.colSpan;
      }
    }
    out.set(String(p), spans);
  }
  return out;
}

// ------------------------------------------------------------------ testler

describe('Program ızgarası', () => {
  it('sınıf görünümü: teneffüs bloğu keser, 2+1 iki hücre kalır, kapalı saat görünür', () => {
    drawProgram(world(), { view: 'class' });
    expect(gridLines()).toMatchInlineSnapshot(`
      [
        "510 SAY — A dersliği: 0.0(day-first unavailable):× 0.1(block-cont):MÇ/Mat#rgb(195, 162, 205) | 0.2×2(block-wide block-in):MÇ/Mat#rgb(195, 162, 205) 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band):MÇ/Mat#rgb(195, 162, 205)[conflict]",
        "511 — derslik yok: 0.0(day-first):MÇ/Mat#rgb(195, 162, 205) 0.1 | 0.2 0.3 0.4(unavailable):× 1.0×2(day-first block-wide band):AY/Fzk#rgb(159, 242, 146)[pinned] 1.2(band):AY/Fzk#rgb(159, 242, 146) | 1.3(band) 1.4(band)",
      ]
    `);
  });

  it('öğretmen görünümü: aynı bloklar, satırı öğretmen, hücrede sınıf ve derslik', () => {
    drawProgram(world(), { view: 'teacher' });
    expect(gridLines()).toMatchInlineSnapshot(`
      [
        "MÇ — Mat: 0.0(day-first):511/#rgb(195, 162, 205) 0.1(block-cont):510 SAY/A#rgb(195, 162, 205) | 0.2×2(block-wide block-in):510 SAY/A#rgb(195, 162, 205) 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band):510 SAY/A#rgb(195, 162, 205)[conflict]",
        "AY — Fzk · Kim: 0.0(day-first) 0.1 | 0.2 0.3 0.4 1.0×2(day-first block-wide band):511/#rgb(159, 242, 146)[pinned] 1.2(band):511/#rgb(159, 242, 146) | 1.3(band) 1.4(band)",
        "ZK — Mat: 0.0(day-first) 0.1 | 0.2 0.3 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band)",
      ]
    `);
  });

  it('gizlenen satır çizilmez, soluklaşan satır ve öbür eksenin hücresi işaretlenir', () => {
    const mask: ProgramMask = {
      teachers: { oZK: 'hidden', oAY: 'ghost' },
      classes: { s511: 'ghost' },
      days: {},
    };
    drawProgram(world(), { view: 'teacher', mask });
    expect(gridLines()).toMatchInlineSnapshot(`
      [
        "MÇ — Mat: 0.0(day-first masked-scope):511/#rgb(195, 162, 205) 0.1(block-cont):510 SAY/A#rgb(195, 162, 205) | 0.2×2(block-wide block-in):510 SAY/A#rgb(195, 162, 205) 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band):510 SAY/A#rgb(195, 162, 205)[conflict]",
        "AY — Fzk · Kim {masked-scope}: 0.0(day-first) 0.1 | 0.2 0.3 0.4 1.0×2(day-first block-wide band masked-scope):511/#rgb(159, 242, 146)[pinned] 1.2(band masked-scope):511/#rgb(159, 242, 146) | 1.3(band) 1.4(band)",
      ]
    `);
    drawProgram(world(), { view: 'class', mask });
    expect(gridLines()).toMatchInlineSnapshot(`
      [
        "510 SAY — A dersliği: 0.0(day-first unavailable):× 0.1(block-cont):MÇ/Mat#rgb(195, 162, 205) | 0.2×2(block-wide block-in):MÇ/Mat#rgb(195, 162, 205) 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band):MÇ/Mat#rgb(195, 162, 205)[conflict]",
        "511 — derslik yok {masked-scope}: 0.0(day-first):MÇ/Mat#rgb(195, 162, 205) 0.1 | 0.2 0.3 0.4(unavailable):× 1.0×2(day-first block-wide band masked-scope):AY/Fzk#rgb(159, 242, 146)[pinned] 1.2(band masked-scope):AY/Fzk#rgb(159, 242, 146) | 1.3(band) 1.4(band)",
      ]
    `);
  });

  it('kart rengi seçilen eksenden: sınıf, derslik ve branş', () => {
    const colours = (['class', 'room', 'subject'] as const).map((colorMode) => {
      drawProgram(world(), { view: 'class', colorMode });
      return `${colorMode}: ${[...container.querySelectorAll<HTMLElement>('table.grid .card')]
        .map((c) => c.style.background)
        .join(' ')}`;
    });
    expect(colours).toMatchInlineSnapshot(`
      [
        "class: rgb(195, 162, 205) rgb(195, 162, 205) rgb(195, 162, 205) rgb(159, 242, 146) rgb(159, 242, 146) rgb(159, 242, 146)",
        "room: rgb(195, 162, 205) rgb(195, 162, 205) rgb(195, 162, 205) rgb(159, 242, 146) rgb(159, 242, 146) rgb(159, 242, 146)",
        "subject: rgb(195, 162, 205) rgb(195, 162, 205) rgb(195, 162, 205) rgb(195, 162, 205) rgb(159, 242, 146) rgb(159, 242, 146)",
      ]
    `);
  });

  it('önizleme önerilen haftayı çizer: açılan saat ve yeri değişen ders işaretli', () => {
    const state = world();
    const out: Record<string, unknown> = {};
    for (const view of ['class', 'teacher'] as const) {
      // A fresh mount per view: the preview is the screen's own state, and a
      // second press on a mounted screen would close it.
      act(() => root.render(null));
      drawProgram(state, { view, solver: advised(state) });
      const show = [...container.querySelectorAll('button')].find(
        (b) => text(b) === 'Izgarada göster',
      );
      if (show === undefined) throw new Error('"Izgarada göster" yok');
      act(() => {
        show.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      out[view] = {
        legend: text(container.querySelector('.preview-bar .preview-legend')),
        grid: gridLines(),
        pool: poolLines(),
      };
    }
    expect(out).toMatchInlineSnapshot(`
      {
        "class": {
          "grid": [
            "510 SAY — A dersliği: 0.0(day-first unavailable):× 0.1(block-cont):MÇ/Mat#rgb(195, 162, 205) | 0.2×2(block-wide block-in):MÇ/Mat#rgb(195, 162, 205) 0.4:MÇ/Mat#rgb(195, 162, 205)[mark-moved] 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band):MÇ/Mat#rgb(195, 162, 205)[mark-opened]",
            "511 — derslik yok: 0.0(day-first) 0.1 | 0.2 0.3 0.4(unavailable):× 1.0×2(day-first block-wide band):AY/Fzk#rgb(159, 242, 146)[pinned] 1.2(band):AY/Fzk#rgb(159, 242, 146) | 1.3(band):MÇ/Mat#rgb(195, 162, 205)[mark-moved] 1.4(band)",
          ],
          "legend": "1 öğretmen saati açılıyor1 ders yer değiştiriyor",
          "pool": [
            "1 blok bekliyor2 saat · sürükleyip bırakın",
            "510 SAY: L3:2:AY510 SAY0/2#rgb(159, 242, 146)",
          ],
        },
        "teacher": {
          "grid": [
            "MÇ — Mat: 0.0(day-first) 0.1(block-cont):510 SAY/A#rgb(195, 162, 205) | 0.2×2(block-wide block-in):510 SAY/A#rgb(195, 162, 205) 0.4:510 SAY/A#rgb(195, 162, 205)[mark-moved] 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band):511/#rgb(195, 162, 205)[mark-moved] 1.4(band):510 SAY/A#rgb(195, 162, 205)[mark-opened]",
            "AY — Fzk · Kim: 0.0(day-first) 0.1 | 0.2 0.3 0.4 1.0×2(day-first block-wide band):511/#rgb(159, 242, 146)[pinned] 1.2(band):511/#rgb(159, 242, 146) | 1.3(band) 1.4(band)",
            "ZK — Mat: 0.0(day-first) 0.1 | 0.2 0.3 0.4 1.0(day-first band) 1.1(band) 1.2(band) | 1.3(band) 1.4(band)",
          ],
          "legend": "1 öğretmen saati açılıyor1 ders yer değiştiriyor",
          "pool": [
            "1 blok bekliyor2 saat · sürükleyip bırakın",
            "AY: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
          ],
        },
      }
    `);
  });

  it('gizli gün sütun olarak çizilmez', () => {
    drawProgram(world(), {
      view: 'class',
      mask: { ...EMPTY_PROGRAM_MASK, days: { Salı: 'hidden' } },
    });
    expect(gridLines()).toMatchInlineSnapshot(`
      [
        "510 SAY — A dersliği: 1.0(day-first) 1.1 1.2 | 1.3 1.4:MÇ/Mat#rgb(195, 162, 205)[conflict]",
        "511 — derslik yok: 1.0×2(day-first block-wide):AY/Fzk#rgb(159, 242, 146)[pinned] 1.2:AY/Fzk#rgb(159, 242, 146) | 1.3 1.4",
      ]
    `);
  });
});

describe('ders havuzu', () => {
  it('beş sıralamanın her biri, başlıklarıyla', () => {
    const sorts: PoolSort[] = ['row', 'name', 'subject', 'size', 'left'];
    const out: Record<string, string[]> = {};
    for (const view of ['class', 'teacher'] as const) {
      for (const poolSort of sorts) {
        drawProgram(world(), { view, poolSort });
        out[`${view}/${poolSort}`] = poolLines();
      }
    }
    expect(out).toMatchInlineSnapshot(`
      {
        "class/left": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "2 saat kaldı: L3:2:AY510 SAY0/2#rgb(159, 242, 146)",
          "1 saat kaldı: L1:1:MÇ510 SAY4/5#rgb(195, 162, 205)",
        ],
        "class/name": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "510 SAY: L3:2:AY510 SAY0/2#rgb(159, 242, 146) L1:1:MÇ510 SAY4/5#rgb(195, 162, 205)",
        ],
        "class/row": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "510 SAY: L3:2:AY510 SAY0/2#rgb(159, 242, 146) L1:1:MÇ510 SAY4/5#rgb(195, 162, 205)",
        ],
        "class/size": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "2 saatlik bloklar: L3:2:AY510 SAY0/2#rgb(159, 242, 146)",
          "1 saatlik bloklar: L1:1:MÇ510 SAY4/5#rgb(195, 162, 205)",
        ],
        "class/subject": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "Kimya: L3:2:AY510 SAY0/2#rgb(159, 242, 146)",
          "Matematik: L1:1:MÇ510 SAY4/5#rgb(195, 162, 205)",
        ],
        "teacher/left": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "2 saat kaldı: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
          "1 saat kaldı: L1:1:510 SAYMÇ4/5#rgb(195, 162, 205)",
        ],
        "teacher/name": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "AY: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
          "MÇ: L1:1:510 SAYMÇ4/5#rgb(195, 162, 205)",
        ],
        "teacher/row": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "MÇ: L1:1:510 SAYMÇ4/5#rgb(195, 162, 205)",
          "AY: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
        ],
        "teacher/size": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "2 saatlik bloklar: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
          "1 saatlik bloklar: L1:1:510 SAYMÇ4/5#rgb(195, 162, 205)",
        ],
        "teacher/subject": [
          "2 blok bekliyor3 saat · sürükleyip bırakın",
          "Kimya: L3:2:510 SAYAY0/2#rgb(159, 242, 146)",
          "Matematik: L1:1:510 SAYMÇ4/5#rgb(195, 162, 205)",
        ],
      }
    `);
  });

  it('branş süzgeci kartları daraltır, sayaç süzülmemiş toplamı söyler', () => {
    drawProgram(world(), { view: 'class', poolFilter: 'kimya' });
    const options = [...container.querySelectorAll('.pool-tools select option')].map(
      (o) => `${(o as HTMLOptionElement).value}=${text(o)}`,
    );
    expect({ pool: poolLines(), options }).toMatchInlineSnapshot(`
      {
        "options": [
          "row=Izgara sırası",
          "name=Ada göre",
          "subject=Branşa göre",
          "size=Uzun bloklar önce",
          "left=En çok kalan",
          "=Tüm branşlar",
          "kimya=Kimya",
          "matematik=Matematik",
        ],
        "pool": [
          "1 blok bekliyor1 blok süzgeç dışında · sürükleyip bırakın",
          "510 SAY: L3:2:AY510 SAY0/2#rgb(159, 242, 146)",
        ],
      }
    `);
  });

  it('gizlenen satırın dersi havuzda yok, soluklaşanınki işaretli', () => {
    drawProgram(world(), {
      view: 'class',
      mask: { teachers: { oMC: 'hidden' }, classes: { s510: 'ghost' }, days: {} },
    });
    expect(poolLines()).toMatchInlineSnapshot(`
      [
        "1 blok bekliyor2 saat · sürükleyip bırakın",
        "510 SAY: L3:2:AY510 SAY0/2[masked]#rgb(159, 242, 146)",
      ]
    `);
  });
});

describe('araç çubuğunun altındaki satır', () => {
  const result = {
    phase: 'solved' as const,
    state: world(),
    placedBlocks: 7,
    totalBlocks: 9,
    nodes: 10,
    elapsedMs: 3456,
    excludedBlocks: 0,
    stuck: [] as Array<{ lessonId: string; name: string; missing: number; reason: string }>,
  };

  it('boşta, koşarken, bitince, takılınca ve durdurulunca', () => {
    const state = world();
    const lines: string[] = [];
    const say = (solver: SolverRun, view: View = 'class') => {
      drawProgram(state, { solver, view });
      lines.push(bar());
    };
    say(idle(), 'teacher');
    say(idle(), 'class');
    say(
      idle({
        running: true,
        progress: { placedBlocks: 3, totalBlocks: 9, nodes: 1, elapsedMs: 1234, excludedBlocks: 2 },
      }),
    );
    say(idle({ applied: way(state) }));
    say(idle({ result: { ...result, state, placedBlocks: 9, stuck: [] } }));
    say(idle({ result: { ...result, state, placedBlocks: 9, excludedBlocks: 2, stuck: [] } }));
    say(
      idle({
        result: {
          ...result,
          state,
          phase: 'stuck',
          stuck: [
            { lessonId: 'L1', name: '510 SAY — MÇ Matematik', missing: 1, reason: 'Öğretmen dolu' },
            { lessonId: 'L3', name: '510 SAY — AY Kimya', missing: 2, reason: 'Sınıf dolu' },
          ],
        },
      }),
    );
    say(
      idle({
        result: {
          ...result,
          state,
          phase: 'cancelled',
          stuck: [{ lessonId: 'L1', name: '510 SAY — MÇ Matematik', missing: 1, reason: 'x' }],
        },
      }),
    );
    expect(lines).toMatchInlineSnapshot(`
      [
        "reason-bar :: Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
        "reason-bar :: Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.",
        "reason-bar busy :: Otomatik diziliyor… 3/9 blok · 1,2 sn · 2 blok geçici kapsam dışında",
        "reason-bar ok :: Öneri uygulandı ve program yerleştirildi. Ctrl+Z ile geri alabilirsiniz.",
        "reason-bar ok :: Program dizildi. 9 blok yerleşti (3,5 sn). Ctrl+Z ile geri alabilirsiniz.",
        "reason-bar ok :: Program dizildi. 9 blok yerleşti (3,5 sn). Ctrl+Z ile geri alabilirsiniz. 2 blok geçici kapsam dışında kaldı.",
        "reason-bar bad :: 7/9 blok yerleşti. 510 SAY — MÇ Matematik: 1 saat yerleşemedi. Öğretmen dolu (ve 1 ders daha).",
        "reason-bar warn :: Durduruldu. 7/9 blok yerleşti. 510 SAY — MÇ Matematik: 1 saat yerleşemedi. x.",
      ]
    `);
  });
});

describe('basılan kâğıt', () => {
  it('sınıf ve öğretmen sayfası: teneffüste kesilen blok, kalın kenar, renk', () => {
    drawPrint(world());
    expect(printLines()).toMatchInlineSnapshot(`
      [
        "510 SAY sınıfı · Haftalık ders programı / Deneme Dershanesi · A dersliği
        1: 1(p-break):MatMÇ#rgb(195, 162, 205) 2:MatMÇ#rgb(195, 162, 205) 1:
        1: 1: 1(p-break): 1: 1:MatMÇ#rgb(195, 162, 205)",
        "511 sınıfı · Haftalık ders programı / Deneme Dershanesi
        1:MatMÇ#rgb(195, 162, 205) 1(p-break): 1: 1: 1:
        2:FzkAY#rgb(159, 242, 146) 1(p-break):FzkAY#rgb(159, 242, 146) 1: 1:",
        "MÇ (MÇ) · Haftalık ders programı / Deneme Dershanesi · Matematik
        1:511#rgb(159, 242, 146) 1(p-break):510 SAYA#rgb(195, 162, 205) 2:510 SAYA#rgb(195, 162, 205) 1:
        1: 1: 1(p-break): 1: 1:510 SAYA#rgb(195, 162, 205)",
        "Ayşe Yılmaz (AY) · Haftalık ders programı / Deneme Dershanesi · Fizik · Kimya
        1: 1(p-break): 1: 1: 1:
        2:511#rgb(159, 242, 146) 1(p-break):511#rgb(159, 242, 146) 1: 1:",
        "ZK (ZK) · Haftalık ders programı / Deneme Dershanesi · Matematik
        1: 1(p-break): 1: 1: 1:
        1: 1: 1(p-break): 1: 1:",
      ]
    `);
  });
});

describe('teneffüste blok kesme: ekran ile kâğıt', () => {
  /**
   * The grid cuts with `continues` and a walk (Grid.tsx), the sheet with
   * `blockSpans()` and a clamp (Print.tsx). Two algorithms for one rule; this
   * says whether they draw the same cells.
   */
  function compare(state: State) {
    const ids = (view: View) =>
      view === 'class' ? state.classes.map((x) => x.id) : state.teachers.map((x) => x.id);
    const screen = (view: View) => {
      drawProgram(state, { view });
      const spans = gridSpans();
      return ids(view).map((id) => spans.get(id) ?? []);
    };
    const classes = screen('class');
    const teachers = screen('teacher');
    drawPrint(state);
    const pages = [...printSpans().values()];
    return {
      screen: [...classes, ...teachers],
      paper: pages,
    };
  }

  it('el yapımı dünyada aynı hücreler', () => {
    const { screen, paper } = compare(world());
    expect(paper).toEqual(screen);
  });

  it('tam dolu kursun dizili haftasında aynı hücreler', () => {
    const state = parseState(
      readFileSync(join(import.meta.dirname, 'fixtures', 'tam-dolu-kurs-dizili.json'), 'utf8'),
    );
    if (state === null) throw new Error('tam-dolu-kurs-dizili.json okunamadı');
    expect(Object.keys(activePlacements(state)).length).toBeGreaterThan(100);
    const { screen, paper } = compare(state);
    expect(paper).toEqual(screen);
  });

  /**
   * The one place they part (TODO §8k, RK15). The screen walks the teacher's
   * ROW: MÇ's 510 block covers Salı 1–2 and the 511 hour under it is not drawn.
   * The sheet asks each hour's own class: the 511 hour is a block head there,
   * so it is drawn as well, and a four-hour day prints five columns. Written
   * down, not fixed: the refactor changes neither drawing.
   */
  it('aynı saatte iki sınıfa yazılmış öğretmende kâğıt bir hücre fazla çiziyor (RK15)', () => {
    const { screen, paper } = compare(doubleBooked());
    expect({ screen: screen[screen.length - 1], paper: paper[paper.length - 1] })
      .toMatchInlineSnapshot(`
      {
        "paper": [
          "0.0×2",
          "0.2×1",
          "0.3×1",
          "0.4×1",
        ],
        "screen": [
          "0.0×2",
          "0.2×1",
          "0.3×1",
        ],
      }
    `);
  });
});
