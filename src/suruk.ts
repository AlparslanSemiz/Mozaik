// Surukle-birak: Pointer Events. HTML5 drag-and-drop KULLANILMIYOR.
//
// Gerekce (docs/PLAN.md tuzak 1): HTML5 DnD'de surukleme sirasinda bir re-render
// islemi iptal eder. Pointer Events'te bu tuzak yok, hareket daha akici ve
// dokunmatik destegi bedava geliyor.
//
// Yavas makinede akici kalmasinin sirri iki karar:
//   1. Gecerli hucreler surukleme BASINDA bir kez hesaplanir (84 kontrol), her
//      pointermove'da degil.
//   2. pointermove sirasinda React state guncellenmez. Hayalet kart transform ile
//      dogrudan DOM'dan tasinir, vurgu tek bir hucrenin classList'iyle degisir.
//      Izgara surukleme boyunca HIC yeniden cizilmez.

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

interface Hedef {
  gun: number;
  saat: number;
}

const VURGU_GECERLI = 'hedef-gecerli';
const VURGU_ENGEL = 'hedef-engel';

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
  const kare = useRef(0);

  const vurguyuTemizle = useCallback(() => {
    for (const el of vurgulu.current) el.classList.remove(VURGU_GECERLI, VURGU_ENGEL);
    vurgulu.current = [];
    sonHedef.current = '';
  }, []);

  const bitir = useCallback(() => {
    cancelAnimationFrame(kare.current);
    kare.current = 0;
    vurguyuTemizle();
    hayalet.current?.remove();
    hayalet.current = null;
    veri.current = null;
    setSuruklenen(null);
    setSebep(null);
  }, [vurguyuTemizle]);

  const basla = useCallback(
    (e: React.PointerEvent, v: SurukVeri, icerik: HayaletIcerik) => {
      if (e.button !== 0) return;
      e.preventDefault();

      veri.current = v;
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
    },
    [],
  );

  useEffect(() => {
    if (suruklenen === null) return;

    /** Imlecin altindaki izgara hucresi. Hayaletin pointer-events: none olmasi sart. */
    const hedefBul = (x: number, y: number): Hedef | null => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-gun]');
      if (el == null) return null;
      if (el.dataset['satir'] !== veri.current?.satirId) return null;
      const gun = Number(el.dataset['gun']);
      const saat = Number(el.dataset['saat']);
      return Number.isInteger(gun) && Number.isInteger(saat) ? { gun, saat } : null;
    };

    const isle = (x: number, y: number) => {
      if (hayalet.current !== null) {
        hayalet.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      const v = veri.current;
      if (v === null) return;

      const hedef = hedefBul(x, y);
      const imza = hedef === null ? '' : `${hedef.gun}|${hedef.saat}`;
      if (imza === sonHedef.current) return; // hucre degismedi, is yok

      vurguyuTemizle();
      sonHedef.current = imza;
      if (hedef === null) {
        setSebep(null);
        return;
      }

      const engelSebebi = v.harita.get(imza) ?? 'Bu hücreye bırakılamaz';
      const gecerli = v.harita.get(imza) === null;
      setSebep(gecerli ? null : engelSebebi);

      // Blok kac hucre kapliyorsa hepsini boya.
      const sinif = gecerli ? VURGU_GECERLI : VURGU_ENGEL;
      for (let i = 0; i < v.blok; i++) {
        const el = document.querySelector<HTMLElement>(
          `[data-satir="${CSS.escape(v.satirId)}"][data-gun="${hedef.gun}"][data-saat="${hedef.saat + i}"]`,
        );
        if (el === null) break;
        el.classList.add(sinif);
        vurgulu.current.push(el);
      }
    };

    const hareket = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(kare.current);
      kare.current = requestAnimationFrame(() => isle(x, y));
    };

    const kaldir = (e: PointerEvent) => {
      const v = veri.current;
      const hedef = hedefBul(e.clientX, e.clientY);
      const gecerli = v !== null && hedef !== null && v.harita.get(`${hedef.gun}|${hedef.saat}`) === null;
      if (gecerli && v !== null && hedef !== null) birak(v.dersId, hedef.gun, hedef.saat);
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
      window.removeEventListener('pointermove', hareket);
      window.removeEventListener('pointerup', kaldir);
      window.removeEventListener('pointercancel', bitir);
      window.removeEventListener('keydown', tus);
    };
  }, [suruklenen, birak, bitir, vurguyuTemizle]);

  return { basla, suruklenen, sebep };
}
