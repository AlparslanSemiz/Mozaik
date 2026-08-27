// Types for scripts/surum.mjs.
//
// The script itself stays plain .mjs so plain `node` can run it, but
// vite.config.ts IS type-checked (tsconfig `include`), so the import needs a
// declaration. Two lines beat turning `allowJs` on for the whole project.

export interface SurumBilgisi {
  version: string;
  commit: string;
  date: string;
}

export function surumBilgisi(): SurumBilgisi;
export function surumEki(bilgi?: SurumBilgisi): string;
export function cacheAdi(bilgi?: SurumBilgisi): string;
