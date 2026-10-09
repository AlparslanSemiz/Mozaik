// Types for scripts/roboders/koruma.mjs, which stays plain .mjs so a tour runs
// with `node` alone (the same reason as ../surum.d.mts).

import type { Browser, BrowserContext, Locator } from '@playwright/test';

/** A place a tour can go (`HEDEFLER`). */
export interface HedefAyari {
  ad: string;
  baslangic: string;
  site: RegExp;
  /** The target's own writing words, on top of the shared list. */
  ekYazan: string[];
  /** Whether a tour must name its --alan. */
  alanZorunlu: boolean;
}

/** A target as `hedefSec()` hands it out: with its folder and session file. */
export interface SecilenHedef extends HedefAyari {
  klasor: string;
  oturum: string;
}

export const HEDEFLER: { roboders: HedefAyari; eyotek: HedefAyari };
export function hedefSec(ad?: string): SecilenHedef;

export interface Karar {
  izin: boolean;
  /** Why not, in Turkish; empty when allowed. */
  sebep: string;
}

export interface Hedef {
  ad: string;
  hucrede: boolean;
  formAlani: boolean;
  suruklenebilir: boolean;
  gonderir: boolean;
}

export interface Kayit {
  yontem: string;
  adres: string;
  tur: string;
  sebep: string;
}

export type Gunluk = (kayit: Kayit) => void;

export function katla(metin: string): string;
export function yazanKelime(metin: string, ayar?: HedefAyari): string | null;
export function alanda(yol: string, alanlar: string[]): boolean;
export function kisalt(adres: string): string;
export function izinVerilir(yontem: string, adres: string, ayar?: HedefAyari): Karar;
export function tiklanabilir(hedef: Hedef, ayar?: HedefAyari): Karar;
export function hedefBilgisi(locator: Locator): Promise<Hedef>;
export function gunlukYazici(klasor: string, dosya?: string): Gunluk;
export function koru(
  context: BrowserContext,
  gunluk: Gunluk,
  secenek?: { ayar?: HedefAyari; alanlar?: string[] },
): Promise<void>;
export function guvenliBaglam(
  browser: Browser,
  secenek: { oturum?: string; gunluk: Gunluk; ayar?: HedefAyari; alanlar?: string[] },
): Promise<BrowserContext>;
