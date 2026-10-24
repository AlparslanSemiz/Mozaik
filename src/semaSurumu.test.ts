// `npm run yayinla` waits for the upgrade gate when the schema moved since the
// last release tag (scripts/sema-surumu.mjs). A misread here is a release that
// migrates my father's data without the gate, so both readers are pinned.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { semaSurumu, sonEtiket } from '../scripts/sema-surumu.mjs';
import { SCHEMA_VERSION } from './leaf/types';

describe('sema-surumu: yayinla şemanın değişip değişmediğini okuyor', () => {
  it('types.ts’in SCHEMA_VERSION’ını okuyor, kodun gördüğüyle aynı', () => {
    const metin = readFileSync(join(import.meta.dirname, 'leaf', 'types.ts'), 'utf8');
    expect(semaSurumu(metin)).toBe(SCHEMA_VERSION);
  });

  it('bulamazsa tahmin etmiyor, atıyor', () => {
    expect(() => semaSurumu('export const SCHEMA_VERSION = SEVENTEEN;')).toThrow();
    expect(() => semaSurumu('')).toThrow();
  });

  it('son etiket sayıyla sıralanıyor, arşiv etiketleri sayılmıyor', () => {
    expect(sonEtiket('v2.1.0\nv2.10.0\nv2.2.0\narsiv/ruflo-oncesi\nv2.9.1')).toBe('v2.10.0');
    expect(sonEtiket('v1.1.0\n')).toBe('v1.1.0');
    expect(sonEtiket('arsiv/x\n')).toBeNull();
    expect(sonEtiket('')).toBeNull();
  });
});
