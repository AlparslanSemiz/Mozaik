// @vitest-environment jsdom

// Smoke test: does the UI actually come up?
//
// Type checking does not prove a component survives running. This test mounts
// the app into a real DOM, walks all five tabs, loads the sample data and puts
// a lesson on the grid. It exists so a broken file never reaches my father.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import { sampleState } from './sample';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

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
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() => root.render(<App />));
}

/** Finds a button by its text — that is what the user sees. */
function button(text: string): HTMLButtonElement {
  const all = [...container.querySelectorAll('button')];
  const found = all.find((b) => (b.textContent ?? '').includes(text));
  if (found === undefined) {
    throw new Error(
      `"${text}" düğmesi yok. Olanlar: ${all.map((b) => b.textContent).join(' | ')}`,
    );
  }
  return found;
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('uygulama açılıyor', () => {
  it('veri yokken Kurulum sekmesiyle açılır ve yol gösterir', () => {
    render();
    expect(container.textContent).toContain('Başlarken');
    expect(container.textContent).toContain('Derslikler');
    expect(button('Örnek veriyle doldur')).toBeTruthy();
  });

  it('beş sekmenin hepsi hata vermeden çizilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();

    for (const label of ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır']) {
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
    // 6 days x 12 hours = 72 cells (+ the row header)
    expect(grid!.querySelectorAll('tbody tr:first-child td')).toHaveLength(72);
    // Cells carry the markers the drag needs
    const cell = grid!.querySelector('tbody td')!;
    expect(cell.getAttribute('data-day')).toBe('0');
    expect(cell.getAttribute('data-row')).not.toBeNull();

    expect(container.querySelectorAll('.pool-card').length).toBeGreaterThan(0);
  });

  it('sınıf görünümüne geçilebilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Program'));
    click(button('Sınıf görünümüne geç'));

    expect(container.querySelector('table.grid tbody')!.children).toHaveLength(20);
    expect(button('Öğretmen görünümüne geç')).toBeTruthy();
  });

  it('yerleşmiş derse tıklayınca kalkar ve geri al onu geri getirir', () => {
    // Start from a state with one lesson placed by hand.
    const d = sampleState();
    const lesson = d.lessons[0]!;
    const group = d.classes.find((c) => c.id === lesson.classId)!;
    // Find a day the teacher is available on
    let day = 0;
    while (d.unavailable[`${lesson.teacherId}|${day}|0`] !== undefined) day++;
    for (let i = 0; i < lesson.blockSize; i++) {
      d.placements[`${group.id}|${day}|${i}`] = lesson.id;
    }
    localStorage.setItem('ders-programi', JSON.stringify(d));

    render();
    click(button('Program'));

    const cards = () => container.querySelectorAll('table.grid .card');
    expect(cards()).toHaveLength(lesson.blockSize);

    click(cards()[0]!);
    expect(cards()).toHaveLength(0); // the whole block went

    click(button('Geri al'));
    expect(cards()).toHaveLength(lesson.blockSize);
  });

  it('Kontrol sekmesi sorun yoksa bunu açıkça söyler', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Kontrol'));
    expect(container.textContent).toContain('Sorun görünmüyor');
  });

  it('Yazdır sekmesi her sınıf için bir sayfa üretir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    render();
    click(button('Yazdır'));
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
});
