// Types for scripts/roboders/koruma.mjs, which stays plain .mjs so a tour runs
// with `node` alone (the same reason as ../surum.d.mts).

import type { Browser, BrowserContext, Locator } from '@playwright/test';

export const BASLANGIC: string;
export const IZINLI_SITE: RegExp;
export const KLASOR: string;
export const OTURUM: string;

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
export function yazanKelime(metin: string): string | null;
export function kisalt(adres: string): string;
export function izinVerilir(yontem: string, adres: string): Karar;
export function tiklanabilir(hedef: Hedef): Karar;
export function hedefBilgisi(locator: Locator): Promise<Hedef>;
export function gunlukYazici(dosya?: string): Gunluk;
export function koru(context: BrowserContext, gunluk: Gunluk): Promise<void>;
export function guvenliBaglam(
  browser: Browser,
  secenek: { oturum?: string; gunluk: Gunluk },
): Promise<BrowserContext>;
