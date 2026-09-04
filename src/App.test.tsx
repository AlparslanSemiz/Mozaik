// @vitest-environment jsdom

// Smoke test: does the UI actually come up?
//
// Type checking does not prove a component survives running. This test mounts
// the app into a real DOM, walks all five tabs, loads the sample data and puts
// a lesson on the grid. It exists so a broken file never reaches my father.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import AppRoot from './Root';
import { blockPlan } from './schedule/blocks';
import { sampleState } from './state/sample';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// jsdom has no ResizeObserver, and `scrollFade.ts` uses one to notice when the
// content of a scrolled box grows past its edge. Stubbed here rather than
// guarded in the module: the absence is a jsdom limitation, not a browser one,
// and a `typeof ResizeObserver` check in shipped code would be a test artefact
// wearing the costume of defensive programming. Nothing here needs it to fire —
// this suite asks whether the components render, and layout is not its subject.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

let container: HTMLDivElement;
let root: Root;

/**
 * This environment ships without a localStorage, so the tests set up their own
 * in-memory store. Side benefit: every test starts with a clean store.
 */
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
  } as Storage;
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
  // Every assertion below reads a TURKISH sentence, and the interface follows
  // `navigator.language` when nothing is stored — which in jsdom is en-US. The
  // same pin `e2e/kapan.ts` puts on the browser suite, for the same reason:
  // otherwise this file measures the dictionary rather than the components.
  localStorage.setItem('ders-programi-dil', 'tr');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  // The REAL tree, providers and all: a smoke test that renders a stripped-down
  // version of the app is smoke-testing something nobody ships.
  act(() => root.render(<AppRoot />));
}

/**
 * Finds a button by its accessible name: the visible text, or — for the icon
 * buttons, which deliberately carry none — the aria-label.
 */
/**
 * The ACCESSIBLE name, in the order the spec computes it: `aria-label` wins
 * over content, not the other way round.
 *
 * It used to prefer the text and fall back to the label, which agreed with
 * Playwright's `getByRole(name:)` only for as long as no button had both. The
 * view switch grew a visible word beside its icon and the two layers split:
 * `aria-label="Sınıf görünümü"` still found it in the E2E suite while this one
 * could only see "Sınıf". Two test layers disagreeing about what a control is
 * CALLED is worse than either being wrong.
 */
function buttonName(b: HTMLButtonElement): string {
  const label = (b.getAttribute('aria-label') ?? '').trim();
  return label !== '' ? label : (b.textContent ?? '').trim();
}

function button(text: string): HTMLButtonElement {
  const all = [...container.querySelectorAll('button')];
  const found = all.find((b) => buttonName(b).includes(text));
  if (found === undefined) {
    throw new Error(`"${text}" düğmesi yok. Olanlar: ${all.map(buttonName).join(' | ')}`);
  }
  return found;
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('uygulama açılıyor', () => {
  it('veri yokken Okul sekmesiyle açılır ve yol gösterir', () => {
    render();
    expect(container.textContent).toContain('Başlarken');
    expect(container.textContent).toContain('Derslikler');
    expect(button('Örnek veriyle doldur')).toBeTruthy();
  });

  it('altı sekmenin hepsi hata vermeden çizilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();

    for (const label of ['Okul', 'Müsaitlik', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar']) {
      click(button(label));
      expect(container.querySelector('.main')).not.toBeNull();
    }
  });

  it('Program sekmesi ızgarayı ve kart havuzunu çizer', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Program'));

    const grid = container.querySelector('table.grid');
    expect(grid).not.toBeNull();

    // 25 teacher rows
    expect(grid!.querySelectorAll('tbody tr')).toHaveLength(25);
    // 6 days x 12 hours = 72 cells, plus one lunch separator per day
    const firstRow = grid!.querySelectorAll('tbody tr:first-child td');
    expect(firstRow).toHaveLength(78);
    // Cells carry the markers the drag needs
    const cell = grid!.querySelector('tbody td')!;
    expect(cell.getAttribute('data-day')).toBe('0');
    expect(cell.getAttribute('data-row')).not.toBeNull();
    // ...and the separator carries NONE of them: drag.ts finds its target with
    // closest('[data-day]') and would otherwise drop a lesson into the break.
    const breaks = grid!.querySelectorAll('tbody tr:first-child td.break-col');
    expect(breaks).toHaveLength(6);
    for (const b of breaks) {
      expect(b.getAttribute('data-day')).toBeNull();
      expect(b.getAttribute('data-hour')).toBeNull();
    }

    expect(container.querySelectorAll('.pool-card').length).toBeGreaterThan(0);
  });

  it('sınıf görünümüne geçilebilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Program'));
    click(button('Sınıf görünümü'));

    expect(container.querySelector('table.grid tbody')!.children).toHaveLength(20);
    expect(button('Öğretmen görünümü')).toBeTruthy();
  });

  it('yerleşmiş derse tıklayınca kalkar ve geri al onu geri getirir', () => {
    // Start from a state with one lesson placed by hand.
    const d = sampleState();
    const lesson = d.lessons[0]!;
    const group = d.classes.find((c) => c.id === lesson.classId)!;
    // Find a day the teacher is available on
    let day = 0;
    while (d.unavailable[`${lesson.teacherId}|${day}|0`] !== undefined) day++;
    // Exactly ONE block, whichever the split makes the first one, so the
    // click below is a click on a whole block and not on part of one.
    const span = blockPlan(lesson)[0]!;
    for (let i = 0; i < span; i++) {
      activeProgram(d).placements[`${group.id}|${day}|${i}`] = lesson.id;
    }
    localStorage.setItem('ders-programi', JSON.stringify(d));

    render();
    click(button('Program'));

    const cards = () => container.querySelectorAll('table.grid .card');
    expect(cards()).toHaveLength(span);

    click(cards()[0]!);
    expect(cards()).toHaveLength(0); // the whole block went

    click(button('Geri al'));
    expect(cards()).toHaveLength(span);
  });

  it('Kontrol sekmesi sorun yoksa bunu açıkça söyler', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Kontrol'));
    expect(container.textContent).toContain('Sorun görünmüyor');
  });

  it('Çıktı sekmesi her sınıf için bir sayfa üretir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Çıktı'));
    expect(container.querySelectorAll('.print-page')).toHaveLength(20);
  });

  it('bozuk localStorage içeriğinde çökmez, boş projeyle açılır', () => {
    localStorage.setItem('ders-programi', '{bu json değil');
    render();
    expect(container.textContent).toContain('Başlarken');
  });

  it('kayıtlı eski (v1) veri de açılır — göç kodu gerçek yolda çalışıyor', () => {
    localStorage.setItem(
      'ders-programi',
      JSON.stringify({
        semaSurumu: 1,
        ayar: { gunler: ['Pazartesi'], saatler: ['1', '2'] },
        derslikler: [{ id: 'dA', ad: 'A' }],
        ogretmenler: [
          { id: 'oMC', ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik', renk: 0 },
        ],
        siniflar: [{ id: 's510', ad: '510', derslikId: 'dA' }],
        dersler: [
          { id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 2, blok: 1 },
        ],
        musaitDegil: {},
        yerlesim: { 's510|0|0': 'x1' },
      }),
    );
    render();
    click(button('Program'));
    expect(container.querySelectorAll('table.grid .card')).toHaveLength(1);
  });

  it('Ayarlar sekmesinin bölümleri çiziliyor', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Ayarlar'));

    for (const [section, text] of [
      ['Zil ve günler', 'Zil ve günler'],
      ['Kurallar', 'Öğretmen art arda'],
      ['Planlar ve yedek', 'Bütün planlar tek dosyada'],
      ['Hakkında', 'Her şeyi sil'],
    ] as const) {
      click(button(section));
      expect(container.textContent, section).toContain(text);
    }
  });

  it('Sıfırla üst çubukta değil, Ayarlar altında', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    const topbar = container.querySelector('.topbar')!;
    expect(topbar.textContent).not.toContain('Sıfırla');
    expect(topbar.textContent).toContain('Dosyaya kaydet');
  });
});
import { activeProgram } from './state/programs';
