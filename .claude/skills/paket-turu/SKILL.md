---
name: paket-turu
description: Bir kaynak paketini (src/ altındaki bir klasörü) davranışı değiştirmeden kendi klasörüne, giriş noktasına ve derin import kuralına taşıyan refactor turu. TODO §8k'deki hedef ağaç ile eski yol → yeni yol tablosundan bir paket adı alır.
---

# Paket turu

Bir paketi, davranış değişmeden yerine koyan tur. Kurallar burada tekrar edilmez:
çalışma düzeni, durma listesi ve rapor [CLAUDE.md](../../../CLAUDE.md)'de, test
katmanları [docs/TESTPLAN.md](../../../docs/TESTPLAN.md)'de, katman sınırları
[docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)'de.

2026-10-23'ten beri yeni refactor turu açılmıyor (DECISIONS 2026-10-23). Bu beceri yalnız
Alp bir turu açıkça isterse kullanılır.

**Girdi.** Paketin adı, ve [docs/TODO.md](../../../docs/TODO.md) §8k'deki hedef ağaç ile
eski yol → yeni yol tablosunda o paketin satırları. Tabloda satırı olmayan bir dosya
taşınmaz, sorulur.

## Adımlar

1. **Envanter.** Paketin dosyaları, dışa aktarımları, onları kullananlar ve testleri.
2. **Eksik testler önce, yalnız test şart olan yolda.** Paket şemaya, göçe, dizmeye ya da
   güncellemeye dokunuyorsa taşımadan önce davranışı tutan eksik testler yazılır
   (TESTPLAN, "Test politikası"). Mutasyon kanıtı şart değil.
3. **Taşıma ve giriş noktası, tek commit.** Önce çalışma ağacında yalnız `git mv` ve yollar;
   o hâlin derlemesi aynı HEAD'de taşımadan öncekiyle bayt bayt karşılaştırılır (sha),
   `index.ts` eklenmeden önce. Sonra paketin `index.ts`'i ve dışarıdan gelen import'ların ona
   dönmesi. Üçü tek commit, karşılaştırmanın sonucu commit mesajında. Kırmızı bir ara commit
   bırakılmaz: derin import kuralı (`npm run sinir`) yeni klasörü doğduğu anda kapsar.
4. **İç temizlik.** Ayrı ve küçük commit'ler: tek sorumluluk, adlar, kopya kod, ölü kod, `!` ve
   `as`, uzun fonksiyonlar, bayat yorumlar.
5. **Belgeler.** ARCHITECTURE'da paketin tek cümlesi ve dosya haritası, aynı commit'te.
6. **Doğrulama.** Her commit'ten önce `npm run hizli` ve dokunulan test dosyaları. Boyut,
   worker testleri ve E2E dalın CI'ında. Mutasyon haftalık koşuda.
7. **Kapanış.** `git merge main`, TODO.md (biten ve sıradaki), WORKLOG'un "Şu an"ı ile
   tarihli girdisi, push, CI, ve CLAUDE.md'deki biçimde rapor.

## Kurallar

- Davranış değişmez. Yolda bulunan bir hata düzeltilmez, §8k'ye bir RK numarasıyla yazılır.
- İstisna: veri riski taşıyan bir hata bulunursa durulur ve hemen söylenir.

## Bitti

Paket kendi klasöründe, giriş noktası var, derin import kuralı onu kapsıyor, `hizli` ve CI
yeşil, rapor verildi.
