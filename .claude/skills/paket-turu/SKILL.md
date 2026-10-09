---
name: paket-turu
description: Bir kaynak paketini (src/ altındaki bir klasörü) davranışı değiştirmeden kendi klasörüne, giriş noktasına ve derin import kuralına taşıyan refactor turu. TODO §8k'deki hedef ağaç ile eski yol → yeni yol tablosundan bir paket adı alır.
---

# Paket turu

Bir paketi, davranış değişmeden yerine koyan tur. Kurallar burada tekrar edilmez:
çalışma düzeni, durma listesi ve rapor [CLAUDE.md](../../../CLAUDE.md)'de, test
katmanları [docs/TESTPLAN.md](../../../docs/TESTPLAN.md)'de, katman sınırları
[docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)'de.

**Girdi.** Paketin adı, ve [docs/TODO.md](../../../docs/TODO.md) §8k'deki hedef ağaç ile
eski yol → yeni yol tablosunda o paketin satırları. Tabloda satırı olmayan bir dosya
taşınmaz, sorulur.

## Adımlar

1. **Envanter.** Paketin dosyaları, dışa aktarımları, onları kullananlar, testleri, kapsamı
   (`npm run kapsam`) ve saf bir paketse mutasyon skoru. Sayılar WORKLOG girdisine.
2. **Eksik testler önce.** Taşımadan önce davranışı tutan testler yazılır, her biri
   `scripts/mutasyon-kaniti.sh` ile kırmızıya döndürülerek.
3. **Taşıma.** Yalnız `git mv` ve yollar, ayrı commit. Derlenen dosyanın sha'sı aynı HEAD'de,
   commit'ten önce ve sonra derlenerek karşılaştırılır.
4. **Giriş noktası.** Paketin `index.ts`'i, ve derin importu yasaklayan kural (`npm run sinir`).
5. **İç temizlik.** Ayrı ve küçük commit'ler: tek sorumluluk, adlar, kopya kod, ölü kod, `!` ve
   `as`, uzun fonksiyonlar, bayat yorumlar.
6. **Belgeler.** ARCHITECTURE'da paketin tek cümlesi ve dosya haritası, aynı commit'te.
7. **Doğrulama.** Her commit'ten önce `npm run hizli`. Sonda tam `npm test`,
   `scripts/agir.sh npm run kontrol`, saf pakette mutasyon skorunun düşmediği.
8. **Kapanış.** `git merge main`, "Şu an", push, CI, ve CLAUDE.md'deki biçimde rapor.

## Kurallar

- Davranış değişmez. Yolda bulunan bir hata düzeltilmez, §8k'ye bir RK numarasıyla yazılır.
- İstisna: veri riski taşıyan bir hata bulunursa durulur ve hemen söylenir.

## Bitti

Paket kendi klasöründe, giriş noktası var, derin import kuralı onu kapsıyor, `kontrol` ve CI
yeşil, rapor verildi.
