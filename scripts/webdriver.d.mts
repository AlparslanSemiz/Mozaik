// Types for scripts/webdriver.mjs, for the same reason as surum.d.mts: the
// script stays plain .mjs so `node` runs it, and e2e/gercek-exe.spec.ts is
// type-checked.

export function varsayilanIkili(): string;
export function evHazirla(ev: string, secenek?: { koru?: boolean }): Record<string, string>;
export function basizMumkun(): boolean;
export function suruculuBaslat(secenek: {
  port?: number;
  ev: string;
  gorunur?: boolean;
  gunluk?: string;
  dil?: string;
}): { pid: number; basiz: boolean };

export class Oturum {
  port: number;
  id: string;
  static ac(secenek: { port?: number; ikili: string; bekleMs?: number }): Promise<Oturum>;
  bul(secici: string): Promise<string>;
  tikla(secici: string): Promise<void>;
  yaz(secici: string, metin: string): Promise<void>;
  metin(secici: string): Promise<string>;
  tus(ad: string): Promise<void>;
  surukle(kaynak: string, hedef: string, adim?: number): Promise<void>;
  js<T = unknown>(govde: string, ...argumanlar: unknown[]): Promise<T>;
  bekle(secici: string, ms?: number): Promise<string>;
  onayla(evet?: boolean): Promise<string>;
  goruntu(): Promise<Buffer>;
  pencere(genislik?: number, yukseklik?: number): Promise<{ width: number; height: number }>;
  agac(): Promise<string>;
  kapat(): Promise<void>;
}
