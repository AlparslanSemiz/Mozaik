// @vitest-environment jsdom

// Duman testi: arayuz gercekten aciliyor mu?
//
// Tip kontrolu bir bilesenin calisirken patlamadigini kanitlamaz. Bu test
// uygulamayi gercek bir DOM'a basar, bes sekmeyi de gezer, ornek veriyi yukler
// ve programa ders yerlestirir. Babaya bozuk bir dosya gitmesin diye var.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import { ornekDurum } from './ornek';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let kap: HTMLDivElement;
let kok: Root;

/**
 * Bu ortamin kendi localStorage'i eksik geliyor, o yuzden testler kendi
 * bellek deposunu kuruyor. Yan fayda: her test tertemiz bir depoyla basliyor.
 */
function bellekDepo(): Storage {
  const harita = new Map<string, string>();
  return {
    get length() {
      return harita.size;
    },
    clear: () => harita.clear(),
    getItem: (k: string) => harita.get(k) ?? null,
    key: (i: number) => [...harita.keys()][i] ?? null,
    removeItem: (k: string) => void harita.delete(k),
    setItem: (k: string, v: string) => void harita.set(k, String(v)),
  } as Storage;
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'localStorage', {
    value: bellekDepo(),
    configurable: true,
    writable: true,
  });
  kap = document.createElement('div');
  document.body.appendChild(kap);
  kok = createRoot(kap);
});

afterEach(() => {
  act(() => kok.unmount());
  kap.remove();
});

function bas() {
  act(() => kok.render(<App />));
}

/** Metnine gore dugme bulur — kullanicinin gordugu sey bu. */
function dugme(metin: string): HTMLButtonElement {
  const hepsi = [...kap.querySelectorAll('button')];
  const bulunan = hepsi.find((b) => (b.textContent ?? '').includes(metin));
  if (bulunan === undefined) {
    throw new Error(
      `"${metin}" düğmesi yok. Olanlar: ${hepsi.map((b) => b.textContent).join(' | ')}`,
    );
  }
  return bulunan;
}

function tikla(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('uygulama açılıyor', () => {
  it('veri yokken Kurulum sekmesiyle açılır ve yol gösterir', () => {
    bas();
    expect(kap.textContent).toContain('Başlarken');
    expect(kap.textContent).toContain('Derslikler');
    expect(dugme('Örnek veriyle doldur')).toBeTruthy();
  });

  it('beş sekmenin hepsi hata vermeden çizilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(ornekDurum()));
    bas();

    for (const ad of ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır']) {
      tikla(dugme(ad));
      expect(kap.querySelector('.govde')).not.toBeNull();
    }
  });

  it('Program sekmesi ızgarayı ve kart havuzunu çizer', () => {
    localStorage.setItem('ders-programi', JSON.stringify(ornekDurum()));
    bas();
    tikla(dugme('Program'));

    const izgara = kap.querySelector('table.izgara');
    expect(izgara).not.toBeNull();

    // 25 ogretmen satiri
    expect(izgara!.querySelectorAll('tbody tr')).toHaveLength(25);
    // 7 gun x 12 saat = 84 hucre (+ satir basligi)
    expect(izgara!.querySelectorAll('tbody tr:first-child td')).toHaveLength(84);
    // Hucreler suruklemenin ihtiyac duydugu isaretleri tasiyor
    const hucre = izgara!.querySelector('tbody td')!;
    expect(hucre.getAttribute('data-gun')).toBe('0');
    expect(hucre.getAttribute('data-satir')).not.toBeNull();

    expect(kap.querySelectorAll('.havuz-kart').length).toBeGreaterThan(0);
  });

  it('sınıf görünümüne geçilebilir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(ornekDurum()));
    bas();
    tikla(dugme('Program'));
    tikla(dugme('Sınıf görünümüne geç'));

    expect(kap.querySelector('table.izgara tbody')!.children).toHaveLength(20);
    expect(dugme('Öğretmen görünümüne geç')).toBeTruthy();
  });

  it('yerleşmiş derse tıklayınca kalkar ve geri al onu geri getirir', () => {
    // Bir dersi elle yerlestirilmis bir durumla basla.
    const d = ornekDurum();
    const ders = d.dersler[0]!;
    const sinif = d.siniflar.find((s) => s.id === ders.sinifId)!;
    // Ogretmenin musait oldugu bir gun bul
    let gun = 0;
    while (d.musaitDegil[`${ders.ogretmenId}|${gun}|0`] !== undefined) gun++;
    for (let i = 0; i < ders.blok; i++) d.yerlesim[`${sinif.id}|${gun}|${i}`] = ders.id;
    localStorage.setItem('ders-programi', JSON.stringify(d));

    bas();
    tikla(dugme('Program'));

    const kartlar = () => kap.querySelectorAll('table.izgara .kart');
    expect(kartlar()).toHaveLength(ders.blok);

    tikla(kartlar()[0]!);
    expect(kartlar()).toHaveLength(0); // blogun tamami kalkti

    tikla(dugme('Geri al'));
    expect(kartlar()).toHaveLength(ders.blok);
  });

  it('Kontrol sekmesi sorun yoksa bunu açıkça söyler', () => {
    localStorage.setItem('ders-programi', JSON.stringify(ornekDurum()));
    bas();
    tikla(dugme('Kontrol'));
    expect(kap.textContent).toContain('Sorun görünmüyor');
  });

  it('Yazdır sekmesi her sınıf için bir sayfa üretir', () => {
    localStorage.setItem('ders-programi', JSON.stringify(ornekDurum()));
    bas();
    tikla(dugme('Yazdır'));
    expect(kap.querySelectorAll('.yazdir-sayfa')).toHaveLength(20);
  });

  it('bozuk localStorage içeriğinde çökmez, boş projeyle açılır', () => {
    localStorage.setItem('ders-programi', '{bu json değil');
    bas();
    expect(kap.textContent).toContain('Başlarken');
  });
});
