// The two PURE halves of folder.ts. Everything else in that file is browser
// plumbing and is judged by e2e/klasor.spec.ts instead.
//
// These two are here because they are the two that can lose someone's work:
// a name that files a backup under the wrong day, and a prune that deletes a
// file this program did not write.

import { describe, expect, it } from 'vitest';
import { dailyName, KEEP_DAILY, MAIN_NAME, prunable } from './folder';

describe('dailyName', () => {
  it('ay ve gün iki basamak', () => {
    expect(dailyName(new Date(2026, 0, 5, 14, 30))).toBe('ders-programi-2026-01-05.json');
    expect(dailyName(new Date(2026, 11, 31, 23, 59))).toBe('ders-programi-2026-12-31.json');
  });

  it('YEREL günü kullanıyor, UTC gününü değil', () => {
    // Türkiye UTC+3. Gecenin 01:00'ında ISO tarihi HÂLÂ dün, ve yanlış güne
    // dosyalanmış bir yedek kimsenin bulamadığı yedektir.
    const gece = new Date(2026, 7, 26, 1, 0); // 26 Ağustos 01:00, yerel
    expect(dailyName(gece)).toBe('ders-programi-2026-08-26.json');
    expect(gece.toISOString().slice(0, 10)).not.toBe('2026-08-26'); // hatanın kendisi
  });

  it('ana dosyanın adıyla çakışmıyor', () => {
    expect(dailyName(new Date())).not.toBe(MAIN_NAME);
  });
});

describe('prunable', () => {
  const gunler = (n: number) =>
    Array.from({ length: n }, (_, i) => dailyName(new Date(2026, 7, i + 1)));

  it('tam sınırda hiçbir şey silinmiyor', () => {
    expect(prunable(gunler(KEEP_DAILY))).toEqual([]);
  });

  it('bir fazlada EN ESKİSİ gidiyor', () => {
    const hepsi = gunler(KEEP_DAILY + 1);
    expect(prunable(hepsi)).toEqual(['ders-programi-2026-08-01.json']);
  });

  it('sırası karışık gelse de tarihe göre siliyor', () => {
    const karisik = [...gunler(13)].reverse();
    expect(prunable(karisik)).toEqual([
      'ders-programi-2026-08-01.json',
      'ders-programi-2026-08-02.json',
      'ders-programi-2026-08-03.json',
    ]);
  });

  it('BAŞKASININ dosyalarına dokunmuyor — bu fonksiyonun asıl işi', () => {
    // Seçilecek klasör Belgelerim olacak, yani babamın kendi dosyalarının
    // yanı. "En yenisi hariç hepsini sil" onun işini silerdi, sessizce.
    const yabanci = [
      'vergi-2019.pdf',
      'Yeni Microsoft Word Belgesi.docx',
      'ders-programi.json', // eski elle indirilmiş yedek — tarih YOK
      'ders-programi-tumu.json', // ana dosyanın kendisi
      'ders-programi-2026-08-26-1430.json', // üst çubuğun saatli yedeği
      'ders-programi-2026-8-1.json', // iki basamaksız — bizim yazdığımız değil
    ];
    expect(prunable([...yabanci, ...gunler(20)])).toHaveLength(10);
    expect(prunable([...yabanci, ...gunler(20)]).every((n) => n.startsWith('ders-programi-2026-08-'))).toBe(true);
    expect(prunable(yabanci)).toEqual([]);
  });

  it('ana dosya asla silinmiyor', () => {
    expect(prunable([MAIN_NAME, ...gunler(30)])).not.toContain(MAIN_NAME);
  });

  it('keep=0 hepsini siler ama yalnız bizimkileri', () => {
    expect(prunable(['a.txt', ...gunler(3)], 0)).toEqual(gunler(3));
  });
});
