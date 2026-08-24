// Surukle-birak: Pointer Events. HTML5 drag-and-drop KULLANILMIYOR.
//
// Gerekce (docs/PLAN.md tuzak 1): HTML5 DnD'de surukleme sirasinda bir re-render
// islemi iptal eder. Pointer Events'te bu tuzak yok, hareket daha akici ve
// dokunmatik destegi bedava geliyor.
//
// Yavas makinede akici kalmasinin sirri: gecerli hucreler surukleme BASINDA bir
// kez hesaplanir (84 kontrol), her karede degil. Karede yapilan is sadece
// hayaleti tasimak, gerekiyorsa kaydirmak ve tek bir elementFromPoint.
// React state surukleme boyunca DEGISMEZ, izgara yeniden cizilmez.
//
// Kaydirma neden sart: 25 satir x 84 sutun 1366x768 ekrana sigmiyor. Hedef satir
// ya da hedef gun ekran disindaysa kullanici oraya ulasamaz. Bu yuzden (a)
// surukleme baslarken hedef satir gorunur hale getirilir, (b) imlec kenara
// yaklasinca izgara kendiliginden kayar.

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Id } from './tip';

export interface SurukVeri {
  dersId: Id;
  /** Hedef satirin kimligi (ogretmenId veya sinifId). Baska satira birakilamaz. */
  satirId: string;
  /** Kac hucre kaplayacak. */
  blok: number;
  /** `${gun}|${saat}` -> engel sebebi. null ise birakilabilir. */
  harita: Map<string, string | null>;
}

export interface HayaletIcerik {
  ust: string;
  alt: string;
  renk: number;
}

const VURGU_GECERLI = 'hedef-gecerli';
const VURGU_ENGEL = 'hedef-engel';

/** Imlec kenarin bu kadar yakinindayken izgara kayar. */
const KENAR = 56;
/** Kare basina kaydirma miktari (px). Dusuk tutuldu: kontrol kullanicida kalsin. */
const KAYMA = 14;

export function useSuruk(birak: (dersId: Id, gun: number, saat: number) => void) {
  // Sadece surukleme baslarken ve biterken degisir -> iki re-render, o kadar.
  const [suruklenen, setSuruklenen] = useState<SurukVeri | null>(null);
  // Ustteki sebep cubugu icin. Izgara React.memo oldugundan bu degisince
  // izgara yeniden cizilmez, sadece cubuk.
  const [sebep, setSebep] = useState<string | null>(null);

  const veri = useRef<SurukVeri | null>(null);
  const hayalet = useRef<HTMLDivElement | null>(null);
  const vurgulu = useRef<HTMLElement[]>([]);
  const sonHedef = useRef<string>('');
  const konum = useRef({ x: 0, y: 0 });
  const dongu = useRef(0);

  const vurguyuTemizle = useCallback(() => {
    for (const el of vurgulu.current) el.classList.remove(VURGU_GECERLI, VURGU_ENGEL);
    vurgulu.current = [];
    sonHedef.current = '';
  }, []);

  const bitir = useCallback(() => {
    cancelAnimationFrame(dongu.current);
    dongu.current = 0;
    vurguyuTemizle();
    hayalet.current?.remove();
    hayalet.current = null;
    veri.current = null;
    setSuruklenen(null);
    setSebep(null);
  }, [vurguyuTemizle]);

  const basla = useCallback((e: React.PointerEvent, v: SurukVeri, icerik: HayaletIcerik) => {
    if (e.button !== 0) return;
    e.preventDefault();

    veri.current = v;
    konum.current = { x: e.clientX, y: e.clientY };
    setSuruklenen(v);
    setSebep(null);

    const g = document.createElement('div');
    g.className = 'hayalet';
    g.style.background = `var(--renk-${icerik.renk})`;
    const ust = document.createElement('span');
    ust.className = 'kart-ust';
    ust.textContent = icerik.ust;
    const alt = document.createElement('span');
    alt.className = 'kart-alt';
    alt.textContent = icerik.alt;
    g.append(ust, alt);
    g.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    document.body.appendChild(g);
    hayalet.current = g;
  }, []);

  useEffect(() => {
    if (suruklenen === null) return;

    const sarmal = document.querySelector<HTMLElement>('.izgara-sarmal');

    // Hedef satir ekran disindaysa kullanici oraya asla ulasamaz. React bu
    // efekt calisirken .hedef-satir sinifini basmis oluyor.
    //
    // 'nearest' degil 'center': satiri kenara yapistirmak yerine ortaya almak
    // hem ust/alt komsu satirlari gosteriyor hem de imleci otomatik kaydirma
    // bolgesinin disinda tutuyor (yoksa birakmaya calisirken izgara kayiyor).
    document
      .querySelector<HTMLElement>('tr.hedef-satir')
      ?.scrollIntoView({ block: 'center', inline: 'nearest' });

    /** Imlecin altindaki izgara hucresi. Hayaletin pointer-events: none olmasi sart. */
    const hedefBul = (x: number, y: number): { gun: number; saat: number } | null => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-gun]');
      // Satir kimligini metin olarak karsilastirmak yerine sinifa bakiyoruz:
      // id'ler rakamla baslayabiliyor ve CSS secicisinde kacislari zahmetli.
      if (el == null || el.closest('tr')?.classList.contains('hedef-satir') !== true) return null;
      const gun = Number(el.dataset['gun']);
      const saat = Number(el.dataset['saat']);
      return Number.isInteger(gun) && Number.isInteger(saat) ? { gun, saat } : null;
    };

    /** Imlec kenara yakinsa izgarayi kaydirir. Kaydirdiysa true doner. */
    const kenardaKaydir = (x: number, y: number): boolean => {
      if (sarmal === null) return false;
      const r = sarmal.getBoundingClientRect();

      // Imlec izgaranin DISINDAYSA kaydirma yok. Kart havuzu izgaranin hemen
      // altinda duruyor: bu kontrol olmazsa kullanici havuzdaki karta basar
      // basmaz, daha kimildamadan izgara kendiliginden asagi kaymaya basliyor.
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;

      const onceX = sarmal.scrollLeft;
      const onceY = sarmal.scrollTop;

      if (x < r.left + KENAR) sarmal.scrollLeft -= KAYMA;
      else if (x > r.right - KENAR) sarmal.scrollLeft += KAYMA;
      if (y < r.top + KENAR) sarmal.scrollTop -= KAYMA;
      else if (y > r.bottom - KENAR) sarmal.scrollTop += KAYMA;

      return sarmal.scrollLeft !== onceX || sarmal.scrollTop !== onceY;
    };

    const kare = () => {
      const { x, y } = konum.current;
      const v = veri.current;
      if (v === null) return;

      if (hayalet.current !== null) {
        hayalet.current.style.transform = `translate(${x}px, ${y}px)`;
      }

      const kaydi = kenardaKaydir(x, y);

      const hedef = hedefBul(x, y);
      const imza = hedef === null ? '' : `${hedef.gun}|${hedef.saat}`;
      // Kaydiysa imlecin altindaki hucre degismis olabilir, yeniden bakilir.
      if (imza !== sonHedef.current || kaydi) {
        vurguyuTemizle();
        sonHedef.current = imza;

        if (hedef === null) {
          setSebep(null);
        } else {
          const engelSebebi = v.harita.get(imza);
          const gecerli = engelSebebi === null;
          setSebep(gecerli ? null : (engelSebebi ?? 'Bu hücreye bırakılamaz'));

          // Blok kac hucre kapliyorsa hepsini boya.
          const satirEl = document.querySelector<HTMLElement>('tr.hedef-satir');
          const sinif = gecerli ? VURGU_GECERLI : VURGU_ENGEL;
          for (let i = 0; i < v.blok; i++) {
            const el = satirEl?.querySelector<HTMLElement>(
              `td[data-gun="${hedef.gun}"][data-saat="${hedef.saat + i}"]`,
            );
            if (el == null) break;
            el.classList.add(sinif);
            vurgulu.current.push(el);
          }
        }
      }

      dongu.current = requestAnimationFrame(kare);
    };
    dongu.current = requestAnimationFrame(kare);

    const hareket = (e: PointerEvent) => {
      konum.current = { x: e.clientX, y: e.clientY };
    };

    const kaldir = (e: PointerEvent) => {
      const v = veri.current;
      const hedef = hedefBul(e.clientX, e.clientY);
      if (v !== null && hedef !== null && v.harita.get(`${hedef.gun}|${hedef.saat}`) === null) {
        birak(v.dersId, hedef.gun, hedef.saat);
      }
      bitir();
    };

    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') bitir();
    };

    window.addEventListener('pointermove', hareket);
    window.addEventListener('pointerup', kaldir);
    window.addEventListener('pointercancel', bitir);
    window.addEventListener('keydown', tus);
    return () => {
      cancelAnimationFrame(dongu.current);
      window.removeEventListener('pointermove', hareket);
      window.removeEventListener('pointerup', kaldir);
      window.removeEventListener('pointercancel', bitir);
      window.removeEventListener('keydown', tus);
    };
  }, [suruklenen, birak, bitir, vurguyuTemizle]);

  return { basla, suruklenen, sebep };
}
