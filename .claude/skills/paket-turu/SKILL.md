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
7. **Bitti kontrolü.** Aşağıdaki bölüm: inceleme, ve davranış görünür biçimde değiştiyse
   tıklama testi.
8. **Kapanış.** `git merge main`, TODO.md (biten ve sıradaki), WORKLOG'un "Şu an"ı ile
   tarihli girdisi, push, CI, ve CLAUDE.md'deki biçimde rapor.

## Kurallar

- Davranış değişmez. Yolda bulunan bir hata düzeltilmez, §8k'ye bir RK numarasıyla yazılır.
- İstisna: veri riski taşıyan bir hata bulunursa durulur ve hemen söylenir.

## Bitti kontrolü

Paket turuna özgü değil: kodu değiştiren her dal, "bitti" demeden önce bunu yapar
(CLAUDE.md, "Bitti kontrolü"). Yalnız belge değişen dalda ne inceleme ne tıklama testi var.

**1. İnceleme.** Kodu yazan ajan kendi işini incelemez.

- Taze bağlamlı bir alt ajan açılır: konuşmayı taşımayan, yazanın gerekçesini görmeyen bir
  ajan (`fork` değil). İstemine yalnız dalın adı, `git diff main...HEAD` komutu, dokunulan
  dosyaların yolları ve aşağıdaki dört soru konur; yazanın "şunu yaptım, doğru" yorumu
  konmaz, yoksa inceleme onu onaylar.
- Dört soru:
  1. **Doğruluk.** Değişiklik söylediğini yapıyor mu, uç durumlar (boş plan, bozuk dosya,
     eski şema, iki sekme) ne oluyor, testi düzeltmeden önce kırmızı mıydı?
  2. **Veri riski.** Depo adları ve şema sürümü (`src/storageNames.test.ts` ve
     [docs/DATA.md](../../../docs/DATA.md)), göç, yedekler ve kurtarma kopyası, klasöre yazım:
     babanın var olan verisi okunamaz, üstüne yazılır ya da sessizce silinir mi?
  3. **Sadelik.** Daha kısa ya da var olan bir yardımcıyı kullanan bir yol var mı, ölü kod,
     kopya kod, gereksiz soyutlama?
  4. **Bayat belge.** Değişiklik `docs/`, CHANGELOG ya da kod yorumlarında bir cümleyi yanlış
     yaptı mı? Cümle ve dosya yoluyla.
- İnceleyen düzeltmez, yalnız bulgu listesi döner: dosya ve satır, ne yanlış, hangi girdiyle
  görülür.
- Yazan her bulguyu tartar. Geçerli olanı ayrı bir commit'te düzeltir (bulgu başına ya da
  aynı konudakiler birlikte), düzeltme gerileme testi isteyen bir hataysa testi de o
  commit'te. Reddettiğini raporda tek cümlelik gerekçeyle listeler. Düzeltmeler büyükse
  inceleme bir kez daha, yalnız yeni commit'ler için koşulur.

**2. Tıklama testi**, değişiklik kullanıcıya görünüyorsa (ekranda, bir diyalogda, bir
bildirimde, bir dosyada ya da açılışta).

- `npm run build`, sonra derlenmiş `dist/index.html` `file://` adresiyle açılır, babanın
  çift tıklayacağı dosya gibi. Sunucu yok.
- Tarayıcı Playwright'ın kendi Chromium'u, 1920×1080 pencerede, her koşuda yeni ve boş bir
  profille. Alp'in Chrome'u ve profili kullanılmaz, Chrome DevTools köprüsü de.
- Yalnız sahte veri: örnek okul, `e2e/` fikstürleri ya da betiğin kurduğu adsız bir plan.
  Gerçek veri, babanın dosyaları ve Roboders asla. Dosya diyaloğu gerekiyorsa sahte dosya
  `scratch/`'te kurulur ve Playwright'ın dosya seçicisiyle verilir.
- Değişen akış baştan sona bir kullanıcı gibi tıklanır, sonra ona komşu bir akış (aynı menüdeki
  başka bir iş ya da değişen verinin göründüğü öbür ekran). Düğmeye adıyla ve rolüyle
  basılır, `evaluate` ile depoya ya da duruma doğrudan yazılmaz.
- Her adımdan sonra tam sayfa ekran görüntüsü alınır ve gerçekten bakılır (Read ile açılır).
  Bakılan: beklenen şey ekranda mı, bir hata ya da boş alan var mı, ve az gören biri için
  okunuyor mu: yazı 14 px'ten küçük mü, metin ile zemin arasında kontrast düşük mü (gözle;
  şüphede `getComputedStyle` ile renkleri okunup oran hesaplanır, 4,5:1 altı bulgu), bir
  bildirim okunamadan kayboluyor mu.
- Konsol hataları ve sayfa hataları toplanır, bulgu sayılır.
- Betik ve görüntüler `scratch/<dal>/tiklama/` altında kalır: commit'lenmez, `e2e/`'ye
  taşınmaz, yeni bir test süiti olmaz. Bulunan bir hata düzeltilirse gerileme testi var olan
  test katmanında yazılır (TESTPLAN, "Test politikası").
- Playwright koşusu ağır komut sayılır: `scripts/agir.sh` ile.

**3. Rapor.** Dalın raporunda "İnceleme ve tıklama testi" bölümü:

- İncelemenin bulguları, her biri "düzeldi (commit konusu)" ya da "düzelmedi: gerekçe".
- Tıklama yolu, adım adım tek satırda (ör. Ayarlar → Veri → Tümünü dosyadan aç → dosya →
  Evet → plan listesi).
- İki üç ekran görüntüsünün tam yolu: değişen akışın sonucu ve komşu akış.
- Tıklama testi yapılmadıysa neden (yalnız belge, ya da görünür değişiklik yok).

## Bitti

Paket kendi klasöründe, giriş noktası var, derin import kuralı onu kapsıyor, bitti kontrolü
yapıldı, `hizli` ve CI yeşil, rapor verildi.
