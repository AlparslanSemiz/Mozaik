// Types for scripts/roboders/otomatik.mjs (plain .mjs for the same reason as koruma.mjs).

import type { Locator, Page } from '@playwright/test';
import type { Hedef, HedefAyari } from './koruma.mjs';

export interface Aday extends Hedef {
  rol: string;
  href: string;
  yeniPencere: boolean;
  indirir: boolean;
  acar: boolean;
  acik: boolean;
}

export interface OtoKarar {
  izin: boolean;
  sebep: string;
  /** 'bağlantı', 'sekme' or 'açılır menü' when allowed; empty otherwise. */
  tur: string;
}

export interface Tiklanan {
  no: string;
  ad: string;
  rol: string;
  tur: string;
  adres: string;
  sonra: string;
}

export interface Atlanan {
  ad: string;
  rol: string;
  sebep: string;
  adres: string;
}

export interface OtoSonuc {
  tiklanan: Tiklanan[];
  atlanan: Atlanan[];
  durdu: string;
  tiklama: number;
}

export function otomatikKarar(
  aday: Aday,
  sinir: { site: RegExp; alanlar?: string[]; sayfa: string; ayar?: HedefAyari },
): OtoKarar;
export function adayBilgisi(locator: Locator): Promise<Aday>;
export function otomatikGez(
  page: Page,
  baslangic: string,
  secenek: {
    site: RegExp;
    alanlar?: string[];
    ayar?: HedefAyari;
    tiklamaSiniri?: number;
    sureSiniriMs?: number;
    ekran?: string;
    bekleMs?: number;
  },
): Promise<OtoSonuc>;
export function rapor(sonuc: OtoSonuc, sayac: { engellenen: number }): string;
