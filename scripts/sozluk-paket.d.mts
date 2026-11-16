// Types for scripts/sozluk-paket.mjs: both vite configs and paket.test.ts
// import it, and the script stays plain .mjs (see surum.d.mts).

import type { Plugin } from 'vite';

export const PAKET_DILLER: string[];
export const PAKET_AYIRAC: string;
export function readSozluk(dil: string): Record<string, string>;
export function packSozlukler(sozlukler: Record<string, Record<string, string>>): {
  keys: string;
  values: Record<string, string>;
};
export function sozlukPaketi(): Plugin;
