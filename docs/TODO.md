# TODO — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti ·
`[→]` arşivde duran ama **canlı hâli yukarıda** olan madde (numarası yazılı)

Yeni bir bilgisayarda başlıyorsan önce [WORKLOG.md](WORKLOG.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

**Bu dosya nasıl okunur:** burada **açık işler** durur, biten turlar
[TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de. Arşiv silinmez ve geriye dönük düzeltilmez —
o bir günlük, kararların o gün geçerli kuralla alındığını gösteriyor. Yeni iş hep
§0'dan doğar, §1–§7'de numaralanır, bitince arşive taşınır.

---

## §0. NOT DEFTERİ — buraya yaz ✍️

> **Bu bölüm senin.** Aklına geleni buraya, olduğu gibi, düzeltmeden yaz.
> Sıraya, biçime, numaraya gerek yok. Her oturumun başında buradaki satırlar
> okunup **§1–§7'ye numaralı madde** olarak taşınır, ham hâlleri §9'a
> (Ham notlar) geçer — hiçbir satır silinmez.

<!-- ▼▼▼ BURADAN İTİBAREN YAZ ▼▼▼ -->

**2026-10-08 · Babanın yeni istekleri** (kullanıcının aktardığı; uygulamaya geçilmedi)

1. **Kullanım kolaylığı: daha az yazı, daha az soru.** Çok soru ve okunacak çok yazı
   olunca kafası karışıyor. Ekranlardaki metni ve soruları azaltmak, DENETIM'deki
   KS ve Ö maddelerinin önüne geçiyor. (PRINCIPLES "Kullanılabilirlik"e de yazıldı.)
2. **Öğretmen programlarını göndermek.** Roboders'te tek tıkla her öğretmenin kendi
   programı Eyotek sistemine gidiyor. Baba ayrıca öğretmenlere e-postayla göndermek
   istiyor. → **B3.8** (özellik, açık soruları orada). Roboders'in bunu nasıl yaptığı
   [ROBODERS.md](ROBODERS.md)'de açık soru.
3. **Listelerde zebra.** Art arda gelen satırlar hafif farklı renkte olsun, her
   listede tutarlı. → [DESIGN.md](DESIGN.md)'de kural adayı. Kontrast gereksinimini
   bozmamalı.

<!-- ▲▲▲ BURAYA KADAR ▲▲▲ -->
 
---

## İÇİNDEKİLER — hangi kısımda ne var

| Kısım | Ne var | Durum |
|---|---|---|
| **§0** | **Not defteri** — senin ham satırların | ✍️ babanın üç isteği (2026-10-08) |
| **§1** | **Rakip envanteri** — Roboders (asıl rakip) ve aSc, §8b ile paralel | 6 açık (R6·R7·R8·R9·R11·R12), R1-R5·R7b bitti, R10 isteğe bağlı |
| **§2** | **Bölüm 2 — Ayarlar'ın kendi tasarımı** | biri bitti, gerisi açık |
| **§3** | **Bölüm 3 — Çıktı ailesi**: görsel · PDF · Excel · e-posta/WhatsApp | hepsi açık |
| **§4** | **Bölüm 4 — Tuval ve baskı tasarımı** (aSc kova 1) | çoğu açık, B4.7 · B4.8 · B4.13 · B4.17 bitti |
| **§5** | **Bölüm 5 — Kısıt motoru, çözücü ve Kontrol** | çoğu bitti, B5.3 açık, B5.8'in veri yarısı babada, B5.7, B5.9, B5.10 ve B5.11 bitti |
| **§6** | **Bölüm 6 — Veri modelini büyüten işler** (aSc kova 2–4) | hepsi açık |
| **§7** | **Bölüm 7 — Dağıtım, Windows ve depo** | bir kısmı bitti (B7.16, B7.17 ve B7.18 dahil), çoğu açık |
| **§8** | **Karar bekleyenler** — sende, babada, babanın gerçek verisi, belge turu, kod turu, erişilebilirlik, test sırası, denetimin bulguları (§8j) ve refactor analizinin planı ile kusurları (§8k) | her alt başlık açık madde taşıyor; sayı için bölüme bakılır |
| **§9** | **Ham notlar** — bütün satırların, nereye gittikleriyle | kayıt |
| **§10** | **ARŞİV** — biten turlar, [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de | kayıt |

**Bağımlılık zinciri — hangi bölüm hangisini bekliyor:**

```
§2  Bölüm 2 (Ayarlar tasarımı)     envanterden BAĞIMSIZ, paralel gidebilir


§1  Roboders + aSc TAM ENVANTER     §8b babanın geri bildirimiyle PARALEL, ön şartı değil
        |
        |  R9: §3 · §4 · §5 · §6 · §7'yi bu tablodan YENİDEN türet
        v
§4  Bölüm 4 ──> B4.1 ÖLÇÜM (zoom: transform mü --cell-w mi)
                   |
                   +──> B4.2 tuval: PROGRAM ızgarası Word gibi
                   |
            B4.3 (okul adı · yıl · logo · sınıf öğretmeni · özel alanlar)
                   |   baskı tasarımının DEĞİŞKENLERİ
                   v
            B4.4 baskı tasarımları ──> §3 Bölüm 3 (çıktı aileleri)
                                              |
                                        B3.4 e-posta/WhatsApp
                                        (öğretmende tel + e-posta = YENİ ŞEMA, bugün v16)

§6  Bölüm 6 ──> B6.1 gruplar/bölünmeler (YENİ ŞEMA) ──> B6.3 A/B haftası
```

**§2 neden §1'i beklemiyor:** Ayarlar'ın kendi düzeni bir **tasarım** kararı ve
kaynağı senin kendi cümlen, rakip değil. Öteki her bölüm §1'den besleniyor.

**§1 ile §8b (2026-10-08):** "her şeyden önce" kuralı kalktı ve yerine bir sıra
konmadı. Babanın geri bildirimi envanterin ön şartı değil, ikisi paralel yürüyor.
Kayıt [DECISIONS.md](DECISIONS.md)'de.

---

## §1. Rakip envanteri — Roboders ve aSc'nin TAM incelenmesi

> Senin satırın: *"her şeyden önce. tasklara ASC ve Robodersin tekrardan her
> inciği cıncığının feature'nın incelenmesi lazım."*
>
> **2026-10-08'den beri bu bölüm "her şeyden önce" değil**, ve yerine bir sıra
> konmadı: babanın geri bildirimi (§8b) bu bölümün ön şartı değil, onunla
> paralel yürüyor. Kayıt [DECISIONS.md](DECISIONS.md)'de. Aynı gün asıl rakip Roboders
> oldu (babanın bugün kullandığı program), aSc ikinci kaynak.
>
> Bölümün işi değişmedi: 5. ilke (*"bir dönem kullanılmadan özellik
> eklenmez"*) 2026-08-30'da kaldırıldı ve yerine geçen şey **rakibin gerçekten
> yaptığı iş** oldu (DECISIONS 2026-08-30). §3–§7'deki her madde bir yerden
> geliyor olmak zorunda; bu bölüm o "yer"lerden biri, öteki babanın kendisi.
> Eksik bir envanterden türetilen bir yol haritası, tuzak 101'in ta kendisidir.

**Neyin eksik olduğu:** aSc tarafında bir **hat kuruldu** ama tam envanter
çıkmadı — 2940 arayüz metni ve 528 yardım konusu **dökümlendi**, 19 bölüm
tablolandı, ama özellikler tek tek *"bizde var / yok / almayacağız"* diye
işaretlenmedi. Roboders tarafında ise **hiç başlanmadı**.

### 1a · aSc — ikinci ve TAM tur

- [x] **R1 `scripts/asc-tur.ps1` yeniden koşturulsun. — BİTTİ (2026-08-31).**
      UTF-8 düzeltmesi uygulandı ve **yeniden başlatmadan sonra** doğrulandı
      (`WinSystemLocale en-US → tr-TR`, diyalog metni `Tanımlı Dersler`
      düzgün okunuyor — `docs/asc/ekran-envanteri.md` başındaki ölçüm).
      *(Eskiden B7.8'di.)*
- [x] **R2 18 ekranın ÖTESİNE geçilsin. — BİTTİ (2026-08-31).**
      `docs/asc/ekran-envanteri.md`: 79 ekran görüntüsü, altı bölüm derin
      analiz (Görünüm/kart tanımlama · liste pencerelerinin içi · kısıt
      ağırlıkları · çözücü ekranları · baskı ailesi · bir hücrenin baskı
      modeli). **Kalan bilerek görülmeyenler** o dosyanın *"7 · Bu turda
      GÖRÜLMEYEN"* bölümünde adlı adına yazılı (Danışman'ın uyarı metinleri,
      sihirbaz adımları, sağ tık alt menüleri, vb — hepsi demo verisini
      değiştirdiği için bilerek atlandı). Bu kalan liste küçük ve isteğe
      bağlı bir R2b turu olarak kalabilir, R3/R4'ün önkoşulu değil.
- [x] **R3 528 yardım konusu tek tek okunsun ve İŞARETLENSİN — BİTTİ
      (2026-08-31).** 5 paralel ajan (data input · kısıt motoru+çözücü ·
      baskı+kurulum+doğrulama+günlük kullanım · vekil+nöbet · kalan
      bölümler+sanity-check), 19 dosyanın **hepsi** baştan sona okundu.
      [ASC.md](ASC.md)'nin kova 1–6 tabloları ~30 yeni satırla genişledi;
      Vekil öğretmen ve Nöbet için ayrıca "evet denirse ne inşa edilir"
      spesifikasyonu yazıldı (§5a) — kova kararı hâlâ babada, ama cevap
      gelince iş beklemeyecek. Sanity-check turu "kova 6/ilgisiz" altı
      bölümde de iki gerçek eksik buldu (`u103`'ün dört toplu-düzenleme
      komutu, `u104`'ün "asistanlı ders" 2026 eklentisi) — "ilgisiz" etiketi
      tek yerde (u103) hatalı çıktı, düzeltildi.
- [x] **R4 2940 arayüz metni bir ÖZELLİK LİSTESİNE çevrilsin — BİTTİ
      (2026-08-31).** R3 ile birlikte yürüdü: her ajan kendi bölümüyle
      ilgili sözlük satırlarını da taradı (dictionary konu bazlı
      gruplanmadığı için ayrı bir tur yerine R3'e gömüldü). Yardım
      metninde geçmeyen ama sözlükte duran birkaç satır bulundu (`Substitutes
      → Yedekler` çakışması gibi), ayrı bir "kaçan özellik" listesi çıkmadı —
      2940 satırın ezici çoğunluğu zaten yardım metninde açıklanan
      özelliklerin arayüz karşılığıydı.

### 1b · Roboders — sıfırdan

**Adı `Roboders`**, `Robodersi` onun belirtme hâli. Bulgular:
[ROBODERS.md](ROBODERS.md).

- [x] **R5 Roboders NE, ve nasıl erişiliyor? — ÖLÇÜLDÜ (2026-08-31).**
      `roboders.com`: **web uygulaması**, bulut tabanlı, indirilen program yok,
      **hesap zorunlu** (demo bile), **5 gün ücretsiz deneme** (kredi kartı
      istemiyor), ücretli — aylık ₺1.499,99 / ₺2.999,99 / ₺4.649,99.
      Tanıtım sayfasının saydığı yetenekler ve bizimkilerle karşılaştırması
      [ROBODERS.md](ROBODERS.md)'de. **Tarayıcı açılmadan, yalnız web'den
      yapıldı.**
      **İlk gerçek bulgu:** onlarda **derslik programı raporu** var, bizde yok
      (→ R8'e aday). Ve **öğretmenlere e-posta ile dağıtım** onlarda da var,
      yani `B3.4` bir tahmin değil.

> ### ⛔ R6 SALT OKUNUR — İSTİSNASIZ
>
> **Hesaptaki veri babanın GERÇEK verisi.** Kullanıcı, 2026-08-31:
> *"sakın bir şeyleri değiştirme roboderste onlar babamın ve değiştirilmemesi
> gerekiyor asla. Yanlışlık bile yapma."*
> Bulut uygulaması: geri alma yok, yedek yok. **Serbest:** gezinme · menü
> açma · ekran görüntüsü · DOM okuma. **Yasak:** kaydet · sil · ekle · yeni ·
> dağıt · gönder · aktar · forma yazma · hücreye tıklama.
> Şüphe varsa **tıklanmaz, sorulur**. Tam sözleşme:
> [ROBODERS.md](ROBODERS.md) → *R6 güvenlik sözleşmesi*.

- [ ] **R6 Playwright ile gezilsin ve ekranları alınsın. HESAP VAR**
      (kullanıcı, 2026-08-31) — yani kayıt engeli ve 5 günlük sayaç **düştü**.
      Kalan iki şey erişim değil **yöntem**: (a) Playwright bu depoda
      `--headless` olmadan kurulu, yani **görünür bir pencere** açıp odağı
      alıyor — kullanıcı meşgulken koşturulamaz, zamanlaması sorulacak;
      (b) oturumu **kullanıcı kendi açar**, şifre sohbete yazılmaz.
      **Turun eksiksiz olması aSc'dekinden önemli:** orada 528 yardım konusu
      dosya olarak elimizdeydi, burada geri dönüp bakılacak bir döküm **yok**.
      **2026-10-09 · Tur 0b bitti: otomatik mod** (`gez.mjs --oto`, yalnız gezinmeye
      tıklar, gerisini listeler; mutasyonla kanıtlı, [ROBODERS.md](ROBODERS.md)).
      **2026-10-08 · Tur 0 bitti: araçlar ve kanıtı hazır** (`scripts/roboders/`,
      `e2e/roboders-koruma.spec.ts`, [ROBODERS.md](ROBODERS.md) "R6'nın araçları").
      Görüntüler ve notlar `docs/` altına değil yalnız `scratch/roboders/`'e gider,
      depo herkese açık. MCP tarayıcısı kullanılmaz. **Canlı yarı kullanıcının
      "başla" demesini bekliyor**. Tur 3 ve 4'e ek (2026-10-09): babanın gerçek
      verisinde hangi kısıtların dolu olduğu, vekil ve nöbet modüllerinin kullanılıp
      kullanılmadığı okunur (yalnız okuma); bu, §8b'deki iki sorunun yerine geçer.
      Baba aynı anda iki oturumda birinin kapanmadığını
      gördü (2026-10-08); ilk girişten sonra babanın oturumunun düşmediği yine
      doğrulanacak. Yeni cihaz uyarısı bilinmiyor. İlk tur: öğretmen programının Eyotek'e ve e-postaya gönderilmesi
      (B3.8), akış düğmeye kadar, düğmeye basılmadan.
- [ ] **R7 Özellik envanteri çıkarılsın** → [ROBODERS.md](ROBODERS.md)
      genişletilsin, [ASC.md](ASC.md)'nin deseninde: bölümler, ekranlar,
      kısıt karşılaştırması. R6'yı bekliyor.
- [x] **R7b Aramada çıkan üç satır DOĞRULANSIN ya da DÜŞSÜN — DÜŞTÜ
      (2026-08-31).** `nöbet`, `kulüp`, *"bir ana + birden çok yardımcı
      öğretmen"*: `site:roboders.com` kısıtlı arama üçü için de **sıfır**
      sonuç verdi, sınırsız aramadaki hiçbir kaynak `roboders.com` değildi
      (hepsi `eyotek.com.tr`'nin modül sayfaları). Ölçüldü ve doğrulandı:
      kaynakları **Eyotek**, Roboders'in kendi tanıtım sayfasında geçmiyor.
      Ayrıntı [ROBODERS.md](ROBODERS.md) → *Doğrulanmamış*.
- [ ] **R11 `docs/Örnek Fotolar/`'ın dizini (2026-10-08).** Belgeler 33 fotoğraf
      diyor (§8c), klasörde 61 dosya var, 29'u WhatsApp görüntüsü. Hangi fotoğrafın
      hangi programa (aSc mi Roboders mi) ve hangi ekrana ait olduğu hiçbir yerde
      yazmıyor. Gerçek veri depoda kalıyor (DECISIONS 2026-10-08), yani dizin bir
      karara bağlı değil. Dizine adlar yazılmaz, yalnız kısaltmalar.

### 1c · Birleştirme ve karar

- [ ] **R8 İki envanter TEK karar tablosunda birleşsin.** Her özellik için üç
      cevaptan biri: **bizde var** · **alınacak** (hangi bölüme, hangi madde
      numarasıyla) · **alınmayacak** (gerekçesiyle: PRINCIPLES'taki bir gerçeği
      mi bozuyor, "Şu an yapılmıyor" listesinde mi, ölçülmemiş mi). 2026-10-08:
      sunucusuz ve çevrimdışı ilkeleri kalktı, yani aSc kova 6'da gerekçesi
      yalnız onlar olan satırlar da yeniden karar bekliyor.
- [ ] **R9 §3–§7 bu tablodan YENİDEN türetilsin.** Bugünkü maddeler yalnız
      aSc'nin ilk turundan geliyor; tam envanter çıkınca sıra da, kapsam da
      değişebilir. Bu bölümün asıl çıktısı bir özellik değil, **öteki
      bölümlerin kendisi**.
- [ ] **R12 [DENETIM.md](DENETIM.md)'ye Roboders karşılaştırması (2026-10-08).**
      R7'den sonra denetimin her bölümüne bir "Roboders'te" satırı: aynı iş orada
      nasıl yapılıyor, babaya kaç yazı ve soru gösteriyor. R7'yi bekliyor.

### 1d · Diğer ilham kaynakları

- [ ] **R10 Word · Paint · Excel · PowerPoint · Adobe programlarından
      kullanılabilirlik ilhamı.** Senin satırın: *"Kullanım kolaylığı ve
      kullanım tarzı bakımından ASC'den, Robodersten, Word, Paint, Excel,
      Powerpoint, Adobe programları gibi yerlerden ilham alıp ona göre
      design'imizi ve kullanım kolaylığımızı en yukarı taşımalıyız."* Bu,
      §1'in aSc/Roboders envanterinden **ayrı bir soru**: oradaki envanter
      "hangi özellik" diye soruyor, bu ise "en tanıdık programlar bir işi
      nasıl kolay yapıyor" diye soruyor — bir özellik listesi değil bir
      **kullanılabilirlik dili** turu. Çıktısı [DESIGN.md](DESIGN.md)'ye
      yazılacak notlar (tasarım serbest, 2026-08-26 — burada da buyrulmaz,
      anlatılır). **§1'in çıkma şartını etkilemiyor** — paralel, isteğe
      bağlı bir tur.

> **Bu bölüm `npm run kontrol`'ün parçası değil ve olmayacak** — `font`, `exe`
> ve `asc-*` betikleri gibi, bu depoda olmayan bir şeye bağlı (aSc kurulumu,
> Roboders erişimi, ağ).

**Çıkma şartı:** `docs/ROBODERS.md` **tamamlanmış** · [ASC.md](ASC.md)'nin karar tablosu
her satırında bir karar taşıyor · §3–§7 o tablodan yeniden yazılmış.

---

## §2. Bölüm 2 — Ayarlar'ın kendi tasarımı

> Senin satırın: *"Ayarlar sectionunun kendine has kendi içinde simetrik olma
> koşuluyla designi olabilir. diğer yerlere uymasına gerek yok dizayn
> bakımından."*

Beş bölüm (`Zil ve günler · Kurallar · Görünüm · Planlar ve yedek · Hakkında`)
kendi düzenini alabilir. **Tek şart kendi içinde simetrik olması** — öteki
sekmelere benzemesi gerekmiyor, ve bu açık bir izin.

- [ ] **B2.1 Beş bölümün ortak iskeleti kararlaştırılsın.** Şu an her bölüm
      `.cols`'un genel kuralına uyuyor. Ayarlar'a özgü bir iskelet seçilecek:
      panel genişliği, başlık hizası, etiket/alan ekseni. Karar
      [DESIGN.md](DESIGN.md)'e **anlatılarak** yazılır, PRINCIPLES'a
      buyrulmaz (tasarım serbest, 2026-08-26).
- [ ] **B2.2 Simetri ÖLÇÜLSÜN, iddia edilmesin.** Beş bölümün panel kutuları
      aynı sol kenardan başlamalı ve aynı genişlikte bitmeli; ölçüm
      `getBoundingClientRect` ile ve **hareket bittikten sonra**
      (tuzak 59 · 99).
- [ ] **B2.3 Üç ölçekte ve iki temada taşma sıfır olmalı.** %80 · %100 · %150,
      açık ve koyu. Yatay taşma 0, kırpılan kutu 0 (AB4'ün deseni).
- [ ] **B2.4 `.color-dot`'un sağında boşluk yok.** Ayarlar → Görünüm'ün
      `Örnek` tablosunda renk noktası ada yapışık duruyor (`●Mehmet Çelik`).
      Sınıf altı yerde kullanılıyor ve ikisi boşluğunu flex `gap`'ten alıyor,
      yani **çare çağrı yerinde**, paylaşılan sınıfta değil.
      *(AB turundan devreden tek madde.)*
- [ ] **B2.5 "Ayarlar → Hakkında'da sağa sola kaydırma olmasın" — ÖNCE ÖLÇÜL.**
      Senin satırın. AA2 ve AB3'ten sonra hâlâ var mı bilinmiyor; ölçülmeden
      kod yazılmaz (tuzak 101: ölçülmemiş bir iddia kendine bir iş planı
      üretir).
- [ ] **B2.6 Ekran görüntüsü kanıtı.** `npm run ekran`, iki temada beş bölüm,
      ve **bakılacak** — iddia edilmeyecek (tuzak 82).
- [ ] **B2.7 'Zil ve günler' ve 'Kurallar' Okul sekmesine mi taşınmalı? — §1
      BİTMEDEN KARAR VERİLMEYECEK.** Senin satırın: *"Ayarlardaki zil ve
      günler okul ile alakalı bir şey olduğuından okul sekmesine koymak daha
      mı mantıklı olur bunu düşünmek lazım. Kurallar sekmesi de aynı şekilde
      hem okul hem de daha çok öğretmenlerle ilgili onları da oraya
      alabiliriz belki. Bu düşünceler ASC ve Roboders'i tamtakır
      inceledikten sonra karar verilsin."* Kendi satırınla kilitli: §1'in
      (R1–R9) çıkma şartı sağlanmadan bu maddeye dokunulmayacak.
- [ ] **B2.8 Üç ek ekranda ölçek yeniden ölçülsün.** Senin satırın: *"Babamın
      ekranı 27 in. 1920x1080 60hz MSI MAG271C... Benimkisi ise 27 inç 2k.
      macbook m1 13 inç. thinkpad 16 inç. o sebeple her şeye uygun ama en
      çok da babama uygun olsun ölçeklemeler."* `--ui-scale` merdiveni
      (%80–%150) ve `SCALE_DEFAULT=1` babanın 1920×1080'ine göre zaten
      ölçüldü (o günkü CLAUDE.md'nin "İlke 7"si, bugün PRINCIPLES "Hedef makine"); eksik olan geri kalan üç ekranda (27"
      2K, MacBook M1 13", ThinkPad 16") aynı ölçümün **tekrarlanması** —
      `npm run ekran` + gerçek pikselde bakmak, tahmin değil.
- [x] **B2.9 Hakkında bölümüne "what's new" — YAPILDI (2026-08-31, kırk
      beşinci oturum).** Senin satırın: *"Ayrıca hakkında kısmında what's new
      gibi olmalı. babam her güncelleme alındığında neyin değiştiğini
      soruyor ben de pek hatırlamıyorum. orada nelerin değiştiği nelerin
      eklendiği yazmalı ve arşiv de olabilir."*
      **`.github/surum-notu.md` kaynak DEĞİL çıktı** — ölçüldü: tek seferlik
      statik metin (indirme/kurulum talimatları), birikimli değil, ve
      `dist/`'e hiç girmiyor, yani `file://` altında zaten okunamaz (ilke 3).
      Gerçek kaynak `src/platform/changelog.ts` — `lang/*.ts` deseninde gömülü, elle
      düzenlenen tek bir veri dosyası. `Data.tsx`'e `Build`'in **yanına**
      ayrı bir panel eklendi (içine değil — `Build`'in başlığı dört E2E
      dosyasının locator'ı, tuzak 49/74). Güncel sürüm açık, eskiler
      `<details>` ile kapalı arşivde. Ayarlar sekmesinde görülmemiş-yenilik
      noktası (`hasUnseenChangelog()`, `ders-programi-yenilik-gorulen`),
      panel açılınca kalıcı olarak siliniyor. `scripts/yayinla.mjs`'e
      dördüncü bir kapı eklendi: `SURUM_NOTLARI[0].version` yayınlanan
      sürümle eşleşmiyorsa yayın durur. `e2e/surum.spec.ts` 79, dört dilde
      çeviri.
- [ ] **B2.10 Her Ayarlar bölümünün kendi alan/seçenek görünürlüğü —
      KALICI, KULLANICIYA AÇIK ÖZELLİK.** Senin satırın: *"Ayarlarda her
      sectionun görüntüsü değişebiliyor olsun. Seçenekler olsun açma kapama
      değiştirme gibi. Önizleme şeklinde görelim onları."* Netleştirmenle
      (2026-08-31) bu B2.1-B2.6'nın tasarım turu bağlamından farklı: geçici
      bir görüntüleme denemesi değil, babanın kendisinin her bölümde hangi
      alan/seçeneği göreceğini açıp kapatabildiği kalıcı bir özellik, ve
      seçim **önizlemeyle** yapılacak — renk seçicinin `<dialog>`'u ya da
      B4.4'ün "düzenleme yeri önizlemenin kendisi" deseni örnek alınabilir.
      **Netleşmesi gereken üç soru, kod yazılmadan önce:** (a) hangi
      bölümler/hangi alanlar kapsamda — beşinin de mi, yoksa hangileri; (b)
      tercih `State`'e mi girecek yoksa `theme.ts`'in dokuz bağımsız
      skaleri gibi bir MAKİNE tercihi mi (kapatılan bir alan başka bir
      bilgisayarda da kapalı mı kalmalı); (c) kapatılan bir alanın
      altındaki kural/veri hâlâ uygulanıyor mu, yoksa görünmeyen bir kural
      sessizce `Kapalı`ya mı düşüyor — bir görünüm tercihi verinin kendisini
      değiştirmemeli (tuzak 96'nın ailesi).
- [ ] **B2.11 Yenilik noktası Ayarlar sekmesinde var, Hakkında bölümünde yok.**
      Senin satırın: *"Yenilik olduğu vakit ayarların üzerinde nokta var ama
      hakkında kısmında yok."* Doğru, ve kaynağı kodda görülüyor: `App.tsx`
      noktayı yalnız sekmeye çiziyor (`dest.id === 'settings'` koşulu,
      `.tab-dot`) ve nokta ancak Hakkında açılınca siliniyor (`Data.tsx`'in
      `markChangelogSeen` çağrısı). Yani sekmeye tıklayan kişi beş bölümle
      karşılaşıyor ve hangisinde yenilik olduğunu söyleyen hiçbir şey yok, işaret
      yolun yarısında kayboluyor. Aynı `changelogUnseen` işareti Ayarlar
      kabuğundaki bölüm düğmesine de taşınır. Ek bir durum gerekmiyor, çünkü
      işaret zaten bölüm açılınca temizleniyor, yani açılmadan önce çizilebilir.

**Çıkma şartı:** `npm run kontrol` yeşil · beş bölümün iki temada görüntüsü
alınmış · ölçümler [WORKLOG.md](WORKLOG.md)'ye yazılmış.

### Yanında gidecek tek küçük madde — Ayarlar dışı

- [ ] **B1.6 Arama kutusu yazınca genişliyor.** Senin satırın: *"Arama kısmına
      bir şey yazınca arama bloğu genişliyor genişlemesin."* Bölüm 1'in
      artakalanı ve **B1.2 ile aynı şeride** dokunuyor (`ListTools.tsx`), o
      yüzden buraya alındı. Kutunun genişliği içeriğinden geliyor olmalı;
      sabitlemenin şeridi kısaltıp kısaltmadığı **ölçülecek** — B1.2'de tam o
      olmuştu (6,5 px, tuzak 94).

---

## §3. Bölüm 3 — Çıktı ailesi

> Senin satırların: *"Çıktıda eposta ve whatsapptan atma opsiyonu.
> Öğretmenlerin teli ve epostanın."* · *"Çıktıda ayrı ayrı birden fazla pdf
> oluşturma."* · *"Excele çıkartma."* · *"Görsel çıkartma"*

2026-08-30'da bu bölüm o günkü ilke 2'ye ("Sunucu yok") göre yazıldı: paylaşılan
şey bir **dosya**, taşıyan şey işletim sisteminin kendi paylaşım yolu. 2026-10-08'de
sunucusuz ve çevrimdışı ilkeleri bağlayıcı olmaktan çıktı (DECISIONS), yani bir
servise ya da ağa çıkan gönderme yolu artık bir ilke sorunu değil, bir tasarım ve
KVKK sorusu (B3.8). Kalan sınır: ağ isteyen bir özellik ağ yokken programın
açılmasını durdurmaz (PRINCIPLES, "Açılış ağa bağlı değil").

- [ ] **B3.1 Görsel (PNG) çıkarma.** Bir programın kâğıt kutusunun resmi.
      **Ölçüm borcu:** `html2canvas` gibi bir bağımlılık mı, `<canvas>`'a elle
      çizim mi, `SVG → blob` mü. Üçü de `dist/index.html`'e gömülebilir olmak
      zorunda ve seçim **ölçülerek** yapılır (bağımlılık politikası,
      2026-08-26: eklendikten sonra dosya boyutu ve açılış süresi WORKLOG'a
      yazılır).
- [ ] **B3.2 Ayrı ayrı birden fazla PDF.** Şu an tek yazdırma işi çıkıyor;
      istenen her sınıf/öğretmen için **ayrı dosya**. Tarayıcı yolunda
      `window.print()` tek iş verir, yani bu madde exe yolunu da düşünmek
      zorunda — hangi teslim yolunun neyi verebildiği ölçülecek.
- [ ] **B3.3 Excel ve HTML'e çıkarma.** aSc karar tablosunda **HTML önce**,
      Excel sonra. HTML zaten elimizdeki DOM. Excel için `.xlsx` bir zip'tir,
      `.csv` düz metin — hangisinin istendiği sorulacak (§8).
- [ ] **B3.4 E-posta ve WhatsApp'tan gönderme — YENİ BİR ŞEMA SÜRÜMÜ İSTİYOR.**
      Öğretmene **telefon** ve **e-posta** alanı gerekiyor: `schemaVersion`
      bugün 16, yani 17 + göç kodu + `sanitize()` dalı + hem birim hem E2E testi
      ([DATA.md](DATA.md)'nin şema kuralı, tuzak 97). Saklamanın KVKK sorusu B3.8'de. Gönderme yolu `mailto:` ve
      `https://wa.me/<numara>?text=` — ikisi de **tıklanınca** açılır, program
      kendiliğinden hiçbir şey göndermez.
      **Not:** bu aSc'nin "Sharing"i DEĞİL (o EduPage'e yüklüyor, hesap açıyor,
      şifre veriyor). O 2026-10-08'de "yapılmıyor" listesinden çıktı, ama
      istenmedi.
- [ ] **B3.5 Özet çarşaf liste** — bütün öğretmenler tek sayfada.
      aSc kova 1, *"kesin"* işaretli.
- [ ] **B3.6 Çıktıda simetri DOĞRULANSIN.** Senin satırın: *"Çıktıda her ama
      her zaman simetri çok önemli. Satırların uzunluğu genişliği vesaire hep
      aynı olmalı."* `table-layout: fixed` bunu iddia ediyor ama **ölçülmedi**.
      Dokuz baskı birleşiminde sütun genişlikleri ve satır yükseklikleri
      okunacak — ve pencere kâğıdın boyuna getirilecek (tuzak 86).
- [ ] **B3.7 Çıktı ekranının sağ panelindeki bazı seçenekler şeride
      taşınsın.** Senin satırın: *"Çıktı alanında sağdaki seçeneklerin
      bazıları alttaki şeride gidebilir, sağ tarafta yerden tasarruf etmiş
      oluruz."* Hangi seçeneklerin taşınacağı (sayfa seçimi mi, yazı boyu
      zoom'u mu) ölçülerek karar verilecek — sağ panelin ne kadarının
      boşaldığı `npm run ekran` ile kanıtlanacak (tuzak 82: bir kutudan
      içerik çıkarmadan önce ne taşıdığı sorulur).

- [ ] **B3.8 Öğretmen programlarını Eyotek'e ve e-postayla göndermek (babanın
      isteği, 2026-10-08).** Roboders'te tek tıkla her öğretmenin kendi programı
      Eyotek sistemine gidiyor; baba Mozaik'ten öğretmenlere e-postayla da göndermek
      istiyor. 2026-10-08'den beri bir ilkeyle çatışmıyor (DECISIONS). B3.2'ye
      (öğretmen başına ayrı PDF) ve B3.4'e (öğretmenin e-postası) dayanıyor.
      Olası yollar, hiçbiri seçilmedi: öğretmen başına PDF ve `mailto:`
      (programın kendisi bir şey göndermez), exe'den doğrudan posta (SMTP,
      Tauri'de), Eyotek'e doğrudan gönderme. **Açık sorular:**
      - Roboders bunu nasıl yapıyor? ([ROBODERS.md](ROBODERS.md), "Açık sorular")
      - Eyotek'in dışarıya açık bir arayüzü var mı, ve Roboders'ten başka bir
        programa açık mı? **Herkese açık sayfalarda bulunamadı (Tur 1, 2026-10-08).**
        Roboders ile Eyotek aynı şirketin (Turtek) ürünü, aktarım kardeş ürün
        entegrasyonu; Eyotek yalnız Excel'e **dışa** aktarıyor. Ayrıntı ve kaynaklar
        [ROBODERS.md](ROBODERS.md) "Tur 1, web yarısı"; Turtek'e soru §8b'de.
      - aSc öğretmene e-postayı EduPage hesabı üzerinden gönderiyor, yerel bir "her
        öğretmene kendi PDF'i" akışı belgelenmemiş; Untis'te masaüstünden HTML ya da
        PDF ile gidiyor ([asc/ekran-envanteri.md](asc/ekran-envanteri.md) §7).
      - Öğretmen e-postaları nerede saklanacak? Kişisel veri (KVKK): plan dosyasına
        girerse her yedekle ve her paylaşılan dosyayla birlikte taşınır. Ayrı bir
        yerde tutulursa bir makineye bağlı kalır. Karar verilmeden şemaya girmez.
      - `mailto:` bir dosyayı eke koyamıyor; ek gerekiyorsa yol exe'den geçiyor
        olabilir. Ölçülmeden yazılmaz.

      **Karar bekleyen iki soru (kullanıcı, 2026-10-08).** İnceleme boyunca Roboders'e
      de Eyotek'e de yazılmaz (R6'nın salt okunur kuralı). Babanın Eyotek hesabı var.
      **Sıra (2026-10-09): Eyotek önce, e-posta sonra**, çünkü öğretmenler programa
      genelde Eyotek'ten bakıyor (§8b).
      - **Eyotek'e gönderme yolu.** Hedef, Mozaik'in Eyotek'e göndermesi. Turtek'e
        sorulmayacak (kullanıcı, 2026-10-09: "kendimiz çözeriz"; DECISIONS). Önce
        Eyotek'in kendi arayüzünde bir içe aktarma ya da yükleme ekranı aranır (Eyotek
        turu, salt okunur). **Turun araçları hazır (2026-10-09):** `giris.mjs` ve
        `gez.mjs` `--hedef eyotek` alıyor, Eyotek'in kendi yazan kelimeleri ve zorunlu
        `--alan` korumada, kanıtı `roboders-koruma.spec.ts`'te ([ROBODERS.md](ROBODERS.md),
        "Eyotek ayarı"). Eyotek açılmadı; canlı tur kullanıcının "başla" demesini
        bekliyor. Açık: okulun Eyotek giriş adresi (başlangıç şimdilik herkese açık
        site), ve tur sonunda atlananlar listesine birlikte bakılacak (geniş kelimeler
        bilerek kaldı). Yoksa babanın hesabıyla otomasyon bir seçenek olarak karar
        bekler, ve şartları şunlar:
        babanın onayı; Eyotek'in kullanım şartlarının kontrolü; şifrenin Windows şifre
        kasasında saklanması; gerçek hesaptan önce bir deneme hesabında sınanması;
        gönderme başarısız olunca babanın bunu ekranda görmesi.
      - **E-postayla ekli gönderme yolu.** Turtek'in cevabını beklemeden ilerleyebilir.
        `mailto:` dosya ekleyemez, yani tek tıkla ekli gönderme için iki seçenek var:
        (a) exe'den SMTP, şifre Windows şifre kasasında; (b) bir sunucu. İkisinde de
        öğretmene bir e-posta alanı gerekiyor, yani şema v17 (B3.4). KVKK: adres plan
        dosyasına girerse her yedekle taşınır; (b)'de üstelik bir sunucuya gider.
      - **(a) için öneri (2026-10-09, karar bekliyor).** Babanın Gmail'i var. Dershane
        için **ayrı** bir Gmail hesabı: uygulama şifresi sızarsa yalnız o hesap etkilenir,
        ve öğretmenler gönderende dershanenin adını görür. Uygulama şifresi Windows şifre
        kasasında saklanır. Google'ın resmî sayfalarından (2026-10-09'da okundu):
        - Uygulama şifresi 16 haneli bir koddur ve *"App passwords can only be used with
          accounts that have 2-Step Verification turned on."* Yani iki adımlı doğrulama
          şart. Yalnız güvenlik anahtarıyla iki adımlı doğrulama, Gelişmiş Koruma ya da
          bir kurum hesabında seçenek görünmüyor
          ([support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)).
        - *"we revoke your app passwords when you change your Google Account password"*:
          hesap şifresi değişince Mozaik'in göndermesi durur, ve program bunu babaya
          söylemeli (aynı sayfa).
        - Google uygulama şifresini önermiyor: *"App passwords aren't recommended and are
          unnecessary in most cases"*; önerdiği yol "Sign in with Google" (OAuth). Exe'de
          OAuth'un maliyeti ölçülmedi, karar sorusunun parçası.
        - SMTP: `smtp.gmail.com`, kimlik doğrulama gerekli, STARTTLS için 587
          ([support.google.com/mail/answer/7104828](https://support.google.com/mail/answer/7104828)).
          465 (SSL) bu sayfada yazmıyor: **doğrulanmadı**.
        - Gönderme sınırı: günde 500'den fazla e-posta ya da tek e-postada 500'den fazla
          alıcı sınırı aşar, 1–24 saat sonra yeniden gönderilebilir
          ([support.google.com/mail/answer/22839](https://support.google.com/mail/answer/22839)).
          Bu sınırın SMTP'den gönderilene de uygulandığı sayfada yazmıyor:
          **doğrulanmadı**. 18 öğretmenli bir dershane için mertebe uzak.
        - Rust tarafında hangi SMTP kitaplığının kullanılacağı, Windows şifre kasasına
          hangi API ile yazılacağı ve uygulama şifresiyle gerçek bir gönderim:
          **doğrulanmadı**, ölçülmedi.

> **Senden istenen:** çıktı ekranları için **örnek fotoğraf** — hangi çıktı
> biçimini istediğini gösteren bir görüntü, `docs/Örnek Fotolar/` altına.
> Senin kendi satırın bunu istememi söylüyordu.

---

## §4. Bölüm 4 — Tuval ve baskı tasarımı (aSc kova 1)

Tam tablo [ASC.md](ASC.md) → *Karar tablosu*, ayrıntı [ROADMAP.md](ROADMAP.md) → **v4**.
**Sıra önemli: B4.1 ve B4.3, ötekilerin önkoşulu.**

- [ ] **B4.1 ÖLÇÜM BORCU — ve turun İLK işi bu.** 2100 hücrede zoom
      `transform: scale()` ile mi `--cell-w` ile mi yapılacak. Ölçülmeden
      yazılırsa yanlış olan seçilir (tuzak 10 · 42 · 101).
- [ ] **B4.2 Tuval davranışı ("Word gibi") — ve bu ÖNCE PROGRAM ızgarası
      demek.** Senin satırın: *"Program tarafı da tuval gibi word gibi olsun
      hareket ettirme vesaire eğer olabiliyorsa."* Yani tuval bir baskı
      önizleme özelliği değil, **Program sekmesinin kendi davranışı**: serbest
      kaydırma (boşluğu tutup sürükleme) · **sağ altta ölçek kaydırıcısı** ·
      `Ctrl`+tekerlek zoom · kartta ne yazacağı ve neye göre boyanacağı
      seçilebilsin.
      **"Eğer olabiliyorsa" bir ölçüm kapısı, bir çekince değil** — B4.1'in
      cevabını bekliyor, ve orada ölçülecek olan tam da bu: 1950 hücre +
      367 kart zoom'lanırken kare bütçesi tutuyor mu (B1.4 Program'ın açılışını
      zaten 32,6 ms / 144,8 ms / 302 ms diye ölçtü, tuzak 105).
      **Çakışacağı üç yer şimdiden belli, üçü de ölçülmeden dokunulmaz:**
      `drag.ts` hedefini `closest('[data-day]')` ile buluyor (tuzak 13) ve
      dönüşmüş bir tuvalde koordinat başka bir şey demek; `gridChrome.ts`
      imleç haçını `data-col` üstünden yakıyor (tuzak 85); ve öğretmen sütunu
      `position: sticky` — `transform` bir sticky bağlamını kırar.
- [ ] **B4.3b Sınıfın TÜRÜ** (`SAY` · `EA` · `SÖZ` …). Babanın kâğıdında
      başlık `310 G SAY` — kod, derslik ve **tür** yan yana. Bizde böyle bir
      alan yok. aSc'nin `Özel Alanlar`'ının karşılığı; `ClassGroup`'a bir alan
      mı, yoksa genel bir "özel alan" mekanizması mı — **B4.3 ile birlikte**
      kararlaştırılacak, ayrı bir şema turu açılmayacak.
- [ ] **B4.3 Okul adı · öğretim yılı · okul logosu · sınıf öğretmeni · özel
      alanlar.** Bunlar baskı tasarımının **değişkenleri**; onlar olmadan B4.4
      yazılamaz. Logo bir **dosya**, yani `State`'e ne şekilde gireceği
      (data URI mi, ayrı depolama mı) ölçülerek seçilecek — ilke 5 gereği yedek
      dosyası onu taşıyabilmeli.
- [ ] **B4.4 Baskı tasarımları** — *"kesinlikle olması lazım"*. Model aSc'den
      **çözüldü**: logo · künye · kenarlık · ekstra sütun, ve yer tutucular
      `{Okul:Okulun Adı}` `{Okul:Öğretim Yılı}` `{Okul:Okul Logosu}`
      `{Sınıf:Tam Adı}` `{Sınıf:Sınıfın Dersliği}` `{Sınıf:Sınıf Öğretmeni}`
      `{Öğretmen:Tam Adı}`. Düzenleme yeri **önizlemenin kendisi**.
- [ ] **B4.5 Farklı baskı çeşitleri** — rapor yapısı seçilebilsin: satırda ne,
      sütunda ne, sayfa başına ne.
- [ ] **B4.6 Program ızgarasında sınıfın altındaki "derslik yok" ibaresi
      kalksın.** Senin satırın: *"program tarafında sınıf tarafında
      dersliği yok ibaresi kalkması lazım."* Kaynak `Program.tsx:321-327`:
      `roomLetter(...) === "" ? t("derslik yok") : t("{ad} dersliği", ...)`
      — sınıf görünümünde satır başlığının ikinci satırı. Derslik
      atanmamış her sınıfta bu metin tekrar ediyor; kaldırılınca o satırın
      **boş mu kalacağı yoksa kutunun tamamen mi küçüleceği** sorusu var
      (tuzak 82: bir metni kaldırmadan önce o metnin ne taşıdığı sorulur —
      burada bir satır yüksekliği).
- [x] **B4.7 Sürüklerken kasma — BİTTİ (2026-09-12).** Çare: gerekçe çubuğu en çok
      100 ms'de bir yazılıyor (`REASON_GAP`). Düşen kare %9,5–14,1'den **%1,1**'e, Layout
      543 ms / 107'den 216 ms / 42'ye indi; kenar kaydırmasında %12–13'ten %0–0,8'e.
      Kuyruktaki son yazmanın düşmemesi `e2e/program.spec.ts`'te bir testle ölçülüyor ve
      test mutasyonla sınandı. Aşağısı sebebin kaydı.
      Senin satırın: *"Programda bir kartı kırmızı sarı veya yeşil blokların üzerinden
      gezdirirken çok kasma oluyor."* **İkinci kez geliyor**: §9b'deki aynı şikayet
      2026-09-01'de sürüklemenin BAŞLANGICI ölçülerek kapatılmıştı (125 ms → 46,2 ms).
      O ölçüm yanlış değildi, ölçtüğü şey şikayetin sebebi değildi (tuzak 101).
      2026-09-12'de hareket başına ölçüldü, tam kayıt [TESTFINDINGS.md](TESTFINDINGS.md)'de:
      x1'de tek kare düşmüyor, **x4'te her sekizinci ila onuncu kare düşüyor** (%9,6–15,
      1600×1000 exe kutusunda biraz daha kötü), hiçbir kare iki kareden uzun sürmüyor.
      **Sebep tek satır:** `src/platform/drag.ts`'in `paintReason`'ı hedef hücre her değiştiğinde
      gerekçe çubuğunun `textContent`'ini yazıyor, ve o yazma 6704 nesnelik belgede
      **tam yerleşim** tetikliyor (5,37 ms) artı tam görüntü alanı boyaması (5,24 ms).
      Yazmayı kaldırınca düşen kare %12'den %0'a iniyor. Sınıf yazması bedava, pahalı
      olan metin. Planın öteki üç şüphelisi ölçülüp düştü: imleç haçı sürüklerken zaten
      kapalı, sınıf değişimi hareket başına medyan 0 düğüm, hayalet karta kendi katmanını
      vermek toplamı hiç kıpırdatmadı (tuzak 105).
      **Kullanıcı kararı (2026-09-12): metni kısmak.** Öteki aday (metin kutusunu akıştan
      çıkarmak, %3,8–7,4) ve elenen iki ucuz yol (`contain: layout`, metin kutusuna
      `flex: 1 1 0` — ikisi de yerleşimi durdurmadı) kayıtta duruyor.
- [x] **B4.8 Dolu hücrenin hükmü kartın altında kalıyor — BİTTİ (2026-09-12).** Çare:
      sürükleme sürerken kartın kendisi hükmün rengiyle bir iç halka taşıyor (üç CSS
      kuralı, JS yok). Bedeli dönüşümlü A/B ile ölçüldü ve ölçülebilir bir bedeli yok
      (halka var %0,0–1,9, halka yok %0,4–1,5). İki hükümde de mutasyonla sınandı.
      Aşağısı ölçümün kaydı.
      Senin satırın: *"kartları kaydırırken başka bir kartın üzerine gelip koyma yani
      değiştirme var ya, o kartların arkasından ya da başka bir şekilde o kartın oraya
      gelip gelemeyeceğini bilmek lazım, yani kırmızı mı turuncu mu falan."*
      Bu bir performans değil **görünürlük** sorunu ve tuzak 84'ün ailesinden: `dropMap`
      hükmü doğru hesaplıyor, `<td>` doğru renge boyanıyor (takas sarı, engel kırmızı),
      ama hücrenin kendi kartı o zeminin **%83,7'sini** örtüyor — 32×39 px'lik hücrede
      geriye her kenarda 1,5 px'lik bir çerçeve kalıyor. Kendi hayalet kartın da %61,1'ini
      örtüyor. Üstelik iki kartın rengi aynı olabildiği için sarı hücre ile kırmızı hücre
      karta bakarak ayırt edilemiyor. Otomatik dizilmiş bir programda hedef satırın 72
      hücresinin 20'si dolu, yani soru tam da bu hücrelerde soruluyor.
      **İmlecin durduğu hücrede hüküm görünüyor** (3 px'lik dış çizgi kartın üstünde
      boyanıyor); görünmeyen şey imlecin daha gitmediği hücreler, yani satırı bir
      bakışta okumak. Üstelik kartın kendi rengi uyarı renginin neredeyse aynısı
      (`rgb(241, 231, 197)` ile `rgb(253, 238, 201)`), yani "dolu ve engelli" hücre ile
      "boş ve takas edilebilir" hücre ekranda aynı krem rengi gösteriyor.
      Ölçüm ve ekran görüntüleri [TESTFINDINGS.md](TESTFINDINGS.md)'de.
      **Kullanıcı kararı (2026-09-12): kartın kendisi işaretlensin.** Renklerin anlamı
      (Y2 kararı) değişmedi, değişen nerede boyandıkları.
- [ ] **B4.9 Program sekmesinin açılışı hızlansın, ve bu şikayetin İKİNCİ gelişi.**
      Senin satırın: *"Program kısmının açılışı daha hızlanmalı."* Aynı cümle bir
      kez B1.4 olarak ölçülüp kapanmıştı ([TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de) ve o kayıt bu turun
      başlangıç noktası. Şikayet gerçek ve iki kez ölçüldü: Program 32,6 ms (x1),
      144,8 (x4) ve 302 (x8) iken öteki sekmeler 6 ile 50 ms arasıydı, bugünkü
      ölçüm ise 34,8 ms (x1) ve 159,0 (x4) diyor ([WORKLOG.md](WORKLOG.md)). O tur
      bir teoriyi de çürüttü: `gridChrome.ts`'in profildeki en pahalı satırı
      ertelendi ve toplam kıpırdamadı (105 ile 104,5 ms), çünkü o düzen boyamanın
      zaten yapacağı düzendi (tuzak 105). Geriye adlandırılmış tek bir maliyet
      kaldı, 1950 hücrenin boyanması. Bu yüzden turun ilk işi aynı yerden yeniden
      profil almak DEĞİL, o maliyete girmek, ve seçenekler ölçülmeden yazılmaz.
      İkinci ölçülmemiş şey hedef makine: bütün sayılar geliştirme makinesinde
      alındı ([PRINCIPLES.md](PRINCIPLES.md), "Hedef makine"). Aynı desen B4.7'de
      de yaşandı, birinci tur yanlış yeri ölçtü ve şikayet ikinci kez geldi, yani
      bu maddenin üçüncü kez gelmemesi ölçümün doğru yere bakmasına bağlı.
- [ ] **B4.10 "Programı boşalt" zaten kırmızı, görünen ağırlığı ölçülmedi.**
      Senin satırın: *"Program kısmında sağ üstteki işlemlerde programı boşalt
      kırmızı olmalı ya da işte önemli bir işlem."* Ölçüldü ve renk yerinde:
      `Ribbon.tsx`'te Izgara grubundaki İşlemler menüsünün son maddesi
      `menu-item danger` sınıfını taşıyor, o sınıf `styles.css`'te dinlenirken
      bile `--bad` mürekkebi veriyor, ve üstünde bir ayraç duruyor. İki şey
      görünmesini engelleyebiliyor: ızgara boşken madde `disabled` ve `--muted`
      griye düşüyor, ve cümlenin ikinci yarısı ("ya da işte önemli bir işlem")
      rengin tek başına yetmediğini söylüyor. Soru "kırmızı olsun mu" değil
      "kırmızı yetiyor mu", ve cevabı ekran görüntüsüyle verilir, iddiayla değil.
      Renk dışındaki seçenekler bir tasarım kararı: maddeyi menünün dışına almak,
      onayı ağırlaştırmak (bugün zaten `danger` diyalog kullanılıyor), ya da kaç
      saatin gideceğini maddenin kendisinde söylemek (bugün yalnız onay
      başlığında var). Menüden çıkarılıp şeride konursa iki kural birden
      bağlayıcı: yıkıcı düğmenin adı bir sekmenin adını içeremez (tuzak 49) ve
      şeridin daralınca neyi sırayla feda edeceği yazılıdır
      ([LAYOUT.md](LAYOUT.md), tuzak 110).
- [ ] **B4.11 Kartların renk ölçütü var ama bulunamıyor.**
      Senin satırın: *"Program kısmında renkleri ayarlama olmalı sınıfa göre
      öğretmene göre ona göre buna göre."* Özellik zaten var ve istenen dördü de
      var: `Ribbon.tsx`'in Renk grubunda bir menü, `Öğretmene göre`,
      `Sınıfa göre`, `Dersliğe göre` ve `Branşa göre`, seçili olan düğmenin
      üstünde yazıyor ve tercih `programColor.ts` ile makineye kaydediliyor. Yani
      bu bir özellik isteği değil bir bulunabilirlik bulgusu, ve iki ölçülmemiş
      sebep var. Birincisi kontrol şeridin SAĞ ucunda duruyor ve şeridin daralınca
      neyi sırayla feda ettiği yazılı (tuzak 110, [LAYOUT.md](LAYOUT.md)).
      İkincisi exe penceresi 1600 mantıksal piksel ve deponun bütün düzen
      ölçümleri 1920'de yapıldı (tuzak 107), yani kullanıcının baktığı kutuda bu
      kontrolün görünüp görünmediği hiç ölçülmedi. İlk iş babanın ekranında ve
      exe'de görüntü almak, çünkü ölçülen her şey "oradayım" derken ekran
      "değilim" diyorsa haklı olan ekrandır (tuzak 84).
- [x] **B4.13 Havuzda alttaki kartlara ulaşılamıyor — BİTTİ (2026-09-12).** Çare iki
      parça, ikisi de kullanıcı kararı: havuz ızgaranın kullanmadığı yere açılıyor, ve taşan
      tepsi altında kart kaldığını söylüyor. Babanın kutusunda (1600x1000, program boşaltılmış)
      görünen kart **19'dan 38'e**, 1920'de 23'ten 69'a çıktı; alınan yer ölçülmüş boş yerdi
      (tablo 678,5 px, kabı 754,1 px) ve ızgara iki kutuda da kaydırmaya başlamadı.
      Aşağısı sebebin kaydı.
      Senin satırın: *"Programda havuzdaki stacktakileri kartlardan alttakilere ulaşamıyor
      babam ve bu sebeple ilk üsttekini saçma bir yere koyuyor. Sonra alttakini alıp ardından
      saçma konulanın yerini düzeltiyor."*
      Açılırken üç ihtimal yazılmıştı ve **üçü de ölçülüp düştü**: deste bir gruplama değil
      (anahtarı `lessonId` artı `size`, kartlar birbirinin aynısı), beş sıralamanın beşinde de
      deste sayısı aynı ve destelerin kutuları hiç binmiyor, ve babanın verisinde karıştıracak
      deste zaten yok (211 blok 205 desteye düşüyor, 199'u tek bloklu, üç bloklu hiç yok).
      **Sebep dördüncü bir şeydi:** tepsi 94,5 px görünüyor ve içinde 922 px var, 182 kart
      katlamanın altında kalıyor, 18 öğretmen grubunun biri sığıyor, ve tepsi kaydığını
      söylemiyor (kaydırma çubuğunun kapladığı genişlik 0 px). Ölçüm, elenen yol ve beş
      mutasyon [TESTFINDINGS.md](TESTFINDINGS.md)'de, karar [DECISIONS.md](DECISIONS.md)'de.
      **Örnek okul bunu gizliyordu** ve o kalıcı bir kurala dönüştü (tuzak 119).
      Rozet geri gelmedi: ölçüm onu isteyen teoriyi düşürdü.
      **Çare bir gerileme açtı ve kapatıldı (aynı gün).** İlk yazımda açılış boyu ızgaranın
      tablosuna bağlı bir `ResizeObserver` ile yeniden ölçülüyordu ve o gözlemci kartları
      imlecin altından kaydırıyordu. Ölçüldü: değişiklikten önceki ağaçta altı koşuda altı
      geçiş, sonrasında üç düşüş. Tetik ızgaranın şeklinden havuzun kendi içeriğine taşındı,
      ölçüm boyamadan önceye (`useLayoutEffect`) alındı, ve kalıcı kural tuzak 121 oldu.
- [ ] **B4.14 Havuzda desteleme açılıp kapanabilsin.** Senin satırın: *"Stacklensin ve
      stacklenmesin diye havuzda seçenek olsun. Sadece aynı türler aynı şeyler tamamen
      aynıları stacklensin."* Cümlenin ikinci yarısı **zaten doğru** ve 2026-09-12'de
      ölçüldü: deste anahtarı yalnız `lessonId` artı `size`, ve kartın öteki bütün alanları
      bu ikisinden türüyor, yani bir destedeki kartlar tanımı gereği birbirinin aynısı.
      Yani istenen tek şey **anahtar**: desteleme kapatılabilsin. Kapatıldığında `.pool-card`
      sayısı destede kaç blok varsa o kadar olur, ve bu bir sözleşme değişikliği: bugün bir
      `.pool-card` bir deste demek ve sekiz e2e dosyası bunu sayıyor, `data-count`'ların
      toplamı da bekleyen blok sayısı. Kapatmanın bedeli ölçülmeden yazılmaz, çünkü deste
      `516f963`'te tam bu yüzden kuruldu: örnek okulda 367 kart yerine 114 kart çiziliyor ve
      gerekçesi Program sekmesinin açılış boyaması. Tercihin nereye yazılacağı da soru
      (`toolState` mi makine tercihi mi), B2.10'un sorduğu soruların aynısı.
- [ ] **B4.15 Uzun sınıf adları Sığdır'da "..." oluyor — ÖLÇÜLDÜ, kusur gerçek.** Senin
      satırın: *"babamda programa koyduğumuzda derslerin ... yazmasının sebebi babamın
      sınıflarının isimleri çok uzun. 410G SAY gibi... ... olmasın sınıfın ilk başı gözüksün.
      410 gibi ya da 410G gibi yani."* 2026-09-12'de babanın kendi verisinde ölçüldü,
      1600x1000'de, üç yoğunlukta: Ferah ve Rahat'ta **hiç kırpılma yok** (hücre 37,4 ve 35
      px), Sığdır'da **200 kartın 195'i kırpılıyor** (hücre 21,1 px, kart metni 55 ile 61 px
      istiyor, `text-overflow: ellipsis`). Yani "..." yoğunluğa bağlı ve Sığdır'da neredeyse
      her kartta. Kusurun kaynağı adın kendisi: babanın `classes[].name` alanı `410A SAY`
      biçiminde ve üç ayrı bilgi taşıyor (kod, derslik, tür), ikisi zaten modelde var
      (`ClassGroup.name`, `roomId`) ve üçüncüsü yok. **B4.3b'nin ta kendisi**, ve o madde
      şema sorusunu soruyor. Bu madde onun ekrandaki yarısı: ad bölününce kartta ne yazacağı,
      ve bölünmese bile kırpmanın sondan değil **baştan** okunur kalması. İkisi ayrı iş:
      şema B4.3b'de, kartın metni burada.
- [ ] **B4.16 Havuzda tek ve çift bloğun genişlik oranı 1'e 2 değil — ÖLÇÜLDÜ.** Senin
      satırın: *"havuzda tek ders ile çift ders bloklarının arasındaki oran bir bölü iki gibi
      değil bu düzelsin anlaşılmıyor hangisi hangisi diye."* Doğru, ve sebebi ölçüldü
      (2026-09-12, 1600x1000). Örnek okulda oran **tam 1'e 2**: tek 42,25 px, çift 84,5 px.
      Babanın verisinde değil: tek saatlik kartlar **59 ile 70 px arasında**, çift saatlik
      kartlar 84,5 px, yani oran 1,22. Sebep tam da B4.15'inki: `310G SAY` gibi bir ad tek
      saatlik kartı nominal 42,25 px'in ötesine geriyor, çift saatlik kartın sabit genişliği
      ise zaten metinden geniş olduğu için kıpırdamıyor. Yani genişlik babanın okulunda
      süreyi artık anlatmıyor. [LAYOUT.md](LAYOUT.md) "kart kaç saat olduğunu hem yazıyla hem
      genişliğiyle söyler" diyor ve bu cümle onun verisinde tutmuyor. Çare yazılmadan önce
      seçenek ölçülür: adı kısaltmak (B4.15), kartı içeriğinden değil süreden boyamak, ya da
      süreyi genişlikten başka bir şeyle söylemek. Üçü de B4.15 ile birlikte kararlaştırılır.
- [ ] **B4.12 Başka bir SATIRDAKİ tahliye kurbanı hiçbir yerde görünmüyor.** B4.8'in
      halkası hedef satırın dolu hücrelerini işaretliyor, yani "üstüne geldiğin kart".
      Ama bir bırakma, hedef hücre kendi satırında BOŞ olduğu hâlde başka bir satırdaki
      kartı havuza gönderebiliyor (sınıf o saatte başka bir öğretmende). O durumda
      gerekçe çubuğu kimin gideceğini adıyla söylüyor (`e2e/program.spec.ts`, "havuza
      dönecek") ama ekranda gidecek kartın kendisi işaretlenmiyor. Kullanıcının cümlesi
      ("başka bir kartın üzerine gelip koyma") üstüne gelinen kartı anlatıyor, yani bu
      ayrı bir soru: gidecek kart da işaretlensin mi, yoksa cümle yeter mi. Karar
      verilmeden yazılmaz; yazılırsa maliyeti ölçülür (hedef satır dışındaki hücrelerde
      `can-*` sınıfı yok, yani bu bedava bir CSS kuralı DEĞİL).
- [x] **B4.17 Elde kart varken ızgara kayınca gölgesiz şerit ekranda kalıyordu —
      DÜZELTİLDİ (2026-09-24).** Senin satırın: *"elimizde bir kart varken yukarı aşağı
      yapıldığında gölgelenmeyen açık kalan şerit de bizim ekran ile birlikte devam
      ediyor. onun gösterdiği yerde sabit kalması gerekir."* Sebep: hedef satırın üstünü
      ve altını karartan iki düzlem ekran pikseliyle konuyordu ve yalnız kenara
      yaklaşınca yapılan otomatik kaydırmadan sonra yeniden konuyordu, tekerleği hiç
      duymuyordu. Şimdi her kaydırmada ve pencere boyu değişince yeniden konuyor
      (`platform/drag.ts`). Test: `e2e/program.spec.ts` → "gölgesiz şerit hedef satırla
      birlikte kayıyor", düzeltme geri alınınca 60 px sapıyor. Tuzak 123.

---

## §5. Bölüm 5 — Kısıt motoru, çözücü ve Kontrol

- [x] **B5.1 Çözücüde Deney B uygulandı (2026-08-31, kırk üçüncü oturum).**
      Önce **ölçüm aleti** yazıldı — `src/worlds.ts`'teki `gridQuality()` —
      çünkü "bedeli yok" cümlesi tek bir dünyada (örnek okul) ölçülmüştü ve
      depoda kaliteyi tekrar ölçen hiçbir şey yoktu (tuzak 42). `order()`'a
      **beşinci** bir anahtar eklendi: sınıfın o gün dolu olan saatine yaslanan
      hücre önce dener. Dört ağır dünyanın **hepsinde** önce/sonra alındı:
      `gercek-olcek-sikisik` 410→**413** blok (sınıf deliği 339→273),
      `gercek-olcek-kurali` 253=253 blok (delik 145→118), `parcalanmis-gunler`
      22=22 (delik zaten 0), `gercek-olcek-imkansiz` 163→**217** blok. Hiçbir
      dünyada blok düşmedi — kabul kapısı geçti. 21 dünyalık matris
      değişmeden yeşil.
- [x] **Deney A uygulanMAYACAK — karar verildi.** Öğretmeni günlere sıkıştırmak
      deliği 274 → 227 indiriyor ama programı **eksik** bırakıyor (363/367) ve
      süreyi 69 ms → **9 856 ms**'ye çıkarıyor. Tuzak 21'in ta kendisi.
- [x] **B5.2 Boşluk (pencere) kuralları girdi (2026-08-31, şema v14).**
      `maxGapsTeacher` · `maxGapsClass`, `minPerDay`'in deseninde: yalnız
      **Kapalı / Uyar** (bir bırakmayı engelleyemez — gün yarı dizilmişken
      her açık saat bir "boşluk"). **0, öteki dört kuraldan farklı olarak
      birebir kullanılır** (`gapRuleActive()`), çünkü okuyucunun isteyeceği
      sayı büyük ihtimalle tam 0. Delik tanımı tek yerde
      (`rules.ts`'teki `gapsBetween()`) ve `gridQuality()` ile aynı cümleyi
      paylaşıyor. Öğretmene özel kutu **yok** bu turda — okul geneli tek
      katman.
- [~] **B5.3 Kısıt motorunun kalan genişlemesi — ÖLÇÜLDÜ, İLK DİLİM YAPILDI
      (2026-09-26).** Beş alt madde ölçüldü (ASC.md, ROBODERS.md, babanın fotoğrafları,
      adsız fikstür, kod). Hiçbirinde babanın kullandığına dair kanıt yok. Sıra ve
      gerekçe:
      - **(a) Kartlar arası ilişki:** aSc'de "Planlama İlişkileri", `u57`'de 97 yardım konusu,
        ASC.md kova 1'de alınmasına karar verilmiş, babanın aSc şeridinde düğmesi görünüyor
        (kullandığı ekran yok). **İlk dilim yapıldı:** "aynı gün olmasın" (`notSameDay`,
        şema v16). Kullanıcı arayüz taslağını onayladı. Kalan türler (art arda olsun/olmasın,
        önce/sonra, aynı gün aynı saat…) ölçülmedi.
      - **(d) Belirli ders belirli konumda:** aSc'de bir ilişki türü ("ilk saatte başlasın ya
        da son saatte bitsin"), babada kanıt yok. (a)'nın türü olarak eklenebilir.
      - **(b) Sınıfa günlük en az/en çok:** öğretmen sınırının sınıf karşılığı, ucuz. Babanın
        verisinde anlamsız: her sınıf tam dolu, pencereler kapalı saatlerle zaten sabit.
      - **(c) Ardışıklık:** öğretmen için zaten var (kural, Kontrol, çözücü, öneri). Sınıf için
        babada anlamsız (pencereler 3–6 saat). Dersler arası "art arda olsun/olmasın" (a)'nın
        parçası.
      - **(e) Öğretmen günde en çok N sınıf:** ASC.md'de yok. Babanın aSc çıktısında MÇ bir
        günde 6 ayrı sınıfa giriyor, kanıt tersine. En sonda.
      Ayrıntı WORKLOG 2026-09-26'da. Babaya soru §8b'de.
- [x] **B5.4 Kontrol'e Danışman uyarıları — YAPILDI (2026-08-31).** aSc kova 1
      (`docs/asc/yardim/u60-verification.md`, beş madde). Üç madde **yeni
      kod** oldu: `feasibility.ts`'teki `buildAdvice()` — haftadan çok gün
      isteyen ders (`lessonNeedsMoreDays`), açık günü yetmeyen öğretmen
      (`teacherManyBlockedDays`), hiç tekli saat bırakmayan çok bloklu ders
      (`lessonManyBlocks`). **Overbooked** maddesi zaten `buildCapacity()`ta
      vardı, yeni kod istemedi. **Bölünmüş gruba özel derslik** maddesi
      kapsam dışı bırakıldı — `ClassGroup`'ta grup/bölünme alanı yok, **B6.1**
      bekliyor. `Report.advice` / `Health.advice`, `hasProblem`'ı **etkilemiyor**
      — aSc'nin kendi şeridi de Doğrulama/Danışman'ı iki ayrı düğme tutuyor.
      Kontrol'e beşinci görünüm (`Danışman`) eklendi, panel `.stat-scroll` ile
      **sınırlı**: örnek okulda 43 satır çıktı ve sınırsız bırakılsaydı %100'de
      1201px taşardı — ölçülüp (`e2e/kontrol.spec.ts` 88, `e2e/serit.spec.ts`
      58) düzeltildi. Dört dile de çevrildi. Testler: `feasibility.test.ts`
      (17 yeni), `e2e/kontrol.spec.ts` 89 (4 yeni), `e2e/serit.spec.ts`
      güncellendi.
- [x] **B5.5 Kontrol ekranının kendisi — ÖLÇÜLDÜ, kusur yok (2026-08-31).**
      Senin satırın: *"Kontrol kısmı çok saçma olmuş... Alt sekmede bir şeyler
      seçiyoruz ama değişmiyor."* İlk yarısı zaten kapanmıştı (şerit artık
      sayfayı seçiyor). Kalan yarı — "rapor hâlâ aşağı doğru uzuyor mu" —
      ölçüldü (`e2e/kontrol.spec.ts` 88): %80 ve %100'de, **iki temada**,
      dört görünümün dördü de `.main`'i **0px** taşırıyor. %150'de 141–174px
      taşıyor ama bu Kontrol'e özgü değil — **aynı ölçekte karşılaştırıldı**:
      Okul → Öğretmenler 1355px, Ayarlar → Kurallar 450px taşıyor. Kontrol
      üçünün **en azı**. Kod yazılmadı; iddia ölçüldü ve doğrulandı.
- [x] **B5.6 Bloklu ders sürüklerken/işaretlenirken "tek ders" gibi
      davranıyordu — DÜZELTİLDİ (2026-08-31).** Senin satırın: *"Eğer hata
      varsa düzelt. 2 derslik bir blok kesinlikle 1 ders değil 2 derstir. Bu
      önemli. Programda bloklu bir şey alındığında ya da üzerine
      gelindiğinde o blok kartının çift sütun seçili olmalı veya mesela
      sürüklerken son ders kapalı gözüküyor kırmızı. bu böyle olmamalı son
      saate koyuluyorsa son saat ve ondan bir önceki saate yani son 2
      saate konulabilmeli."* Kod okunarak KÖK SEBEP ikisi için de bulundu —
      "worlds.ts'te yeniden üret" ihtiyatı gereksiz çıktı: ikisi de
      `constraints.ts`'in kısıt mantığında değil, **etkileşim katmanında**
      yaşıyordu, `dropMap()`/`blockerDetail()` hiç değişmedi.
      **(a) Görsel — `src/gridChrome.ts`.** İmleç haçı bir hücrenin
      `data-col`'unu okuyordu ama hücrenin KENDİ `data-span`'ine hiç
      bakmıyordu, yani 2 (ya da 3) saatlik bir bloğun üzerine gelince yalnız
      bloğun BAŞLADIĞI sütun (+ başlığı + o sütunu solundan kapsayan başka
      satırlar) yanıyordu — ikinci (ve varsa üçüncü) sütun hiç. `move()`
      artık hovered hücrenin span'inden kapladığı bütün sütunları çıkarıp
      her birini (başlık dahil, her satırda o sütunu örten hücre neyse)
      aydınlatıyor; sabit `"2"` yerine `blocks.ts`'teki `MAX_BLOCK`'tan
      türeyen bir döngü var (tuzak 78'in dersi: eşiği elle sabit yazma).
      **(b) Bug — `src/drag.ts` + `src/components/Program.tsx`.**
      `blockerDetail()` `hour`'u her zaman bloğun mutlak başlangıcı sayıyor
      (doğru davranış — o hâlâ değişmedi), ama sürükleme imlecin bulunduğu
      hücreyi olduğu gibi bu "başlangıç" olarak geçiriyordu. Günün son
      saatine gelince blok oradan başlamaya çalışıp sığmıyor, kırmızı
      oluyordu. `dropMap()` zaten HER (gün, saat) çifti için bir kayıt
      üretiyor, yani "son N saatin başlangıcı" için doğru cevap `d.map`'te
      hazırdı — yeni `clampToDay()` yardımcısı imlecin ham hücresini, blok
      tam sığana kadar geriye kaydırıp o anahtarla arıyor. Üç yerde
      kullanıldı: zayıf satır önizlemesi, güçlü vurgu + sebep çubuğu, ve
      `onUp()`'ın kendisi — üçü de aynı "hangi hücreye bakılacak" sorusunu
      soruyordu.
      `constraints.ts` hiç değişmediği için `constraints.test.ts`'in
      `dayEnd` testleri aynen yeşil kaldı. Yeni testler: `e2e/izgara.spec.ts`
      ("imleç haçı 2 saatlik bir bloğun İKİNCİ sütununu da aydınlatıyor") ve
      `e2e/program.spec.ts` ("89. Gün sonunda blok geriye kaydırılır") —
      ikisi de `loadWorld()` ile kurulmuş belirli bir dünyada, tahmine değil
      ölçüme dayanıyor.
- [x] **B5.7 Öğretmenin kendi dersleri arasında takas — ÖLÇÜLDÜ VE YAPILDI (2026-09-26).**
      `dropMap` altı durumda ölçüldü. Öğretmenin iki sınıftaki kendi dersi (sınıflar boşken),
      iki saatlik blok iki saatliğin üstüne, aynı sınıfta iki dersin takası: üçü de zaten
      teklif ediliyordu. Sınıf doluyken reddediliyordu, ki doğrusu bu. Eksik tek durum,
      TODO'nun tahmin ettiği gibi, bir bloğun birden çok bloğun üstüne bırakılmasıydı: iki
      saatlik blok öğretmenin öteki sınıftaki iki tek saatinin üstünde "iki aday" bulup hiçbir
      şey teklif etmiyordu. Kural kullanıcıya taslak olarak gösterildi ve onaylandı: hedefler
      bırakılan saatleri tam dolduruyorsa hepsi aynı sırayla kartın eski saatlerine geçer.
      Birim testleri (üçü, biri eski kodla kırmızı) ve bir E2E (`program.spec.ts`, "B5.7"),
      Chromium'da ekran görüntüsüyle görüldü. Kural [DATA.md](DATA.md)'de.
      Eski satırlar:
      Senin satırın: *"Öğretmenin kendi dersleri arasında değişim muhtemel olmalı
      eğer sınıfsal ya da başka bir şeysel bir sıkıntı yoksa."* Takas motoru zaten
      var ve genel: `constraints.ts`'teki `swapBlocks()` iki bloğu da kaldırıp
      ikisini de `check()`'ten geçiriyor, yani aynı öğretmenin iki dersi iki ayrı
      sınıfta olsa bile mekanik olarak takas edilebiliyor, ve "sınıfsal bir
      sıkıntı" varsa zaten reddediliyor, yani senin koşulun kodda duruyor. Eksik
      olan mekanizma değil, takasın NE ZAMAN teklif edildiği: `dropMap()` takası
      yalnız aday tam bir tane olduğunda öneriyor, yani bırakılan hücre birden çok
      bloğa değiyorsa (iki saatlik bir blok iki tek saatlik dersin üstüne) takas
      hiç teklif edilmiyor ve ekranda "olmuyor" görünüyor. İlk iş senin kastettiğin
      durumu üretip ölçmek, çünkü bir şikayetten yazılmış plan bir sebep
      adlandırırsa o sebep ilk ölçülecek şeydir (tuzak 101). Ölçülmeden "özellik
      yok" diye yazılmayacak.
- [~] **B5.8 Babanın verisinde program oluşmuyor, Roboders'te oluşuyor —
      ÇÖZÜCÜ YARISI BİTTİ (2026-09-24), VERİ YARISI BABADA.** Senin satırın: *"Her
      şeyden önce program kısmının çalışıyor olması gerek. Babam roboderste aynı
      dersleri aynı hocaları aynı müsaitlikleri girmesine rağmen roboderste program
      oluşurken bizde oluşmuyor."* Ölçülen üç şey:
      **(1) Veri aynı değil.** Roboders'in çıktısı (`docs/RoboDers/`) ayrıştırılıp
      bizim veriyle hücre hücre karşılaştırıldı. Roboders 21 hücrede bizde kapalı
      olan öğretmen saatine ders koymuş: KY ve GÇ Cumartesi (bizde ikisi de
      Cumartesi kapalı), AS Pazar 1–2. saat. AS orada Pazar günü 9 saat giriyor,
      bizde sınırı 8. Orada bir sınıf fazla (210Z), 413B ve 414D'de MÇ ile MB'nin
      saatleri yer değiştirmiş, 415D'nin geometrisini başka bir öğretmen veriyor.
      **(2) Bizim veride program yok.** Bu çözücünün zayıflığı değil, kanıtlandı:
      tam bir çözücü (OR-Tools CP-SAT) 0,1 saniyede "imkânsız" diyor. Kurallar
      olduğu gibi kalırsa **dört öğretmen saatini açmak yetiyor**: HE Cumartesi 3.
      saat, KY Cumartesi 11–12, AV Cumartesi 1. saat. Müsaitlik olduğu gibi kalırsa
      en az 9 saatlik kural ihlali gerekiyor.
      **(3) Çözücü de zayıftı, güçlendirildi.** Roboders'in açık saatleriyle aynı
      veride eski çözücü 206/211'de takılıyordu, yenisi yaklaşık bir saniyede
      211/211 diziyor (tuzak 122, [DECISIONS.md](DECISIONS.md)). Veri olduğu gibi
      ise 199 yerine 203 blok koyup 6 saniyede duruyor.
      **Kalan, babada:** hangisi doğru, Mozaik'teki müsaitlik mi Roboders'teki mi?
      Roboders'teki doğruysa üç öğretmenin saatleri Mozaik'te açılınca program
      çıkıyor. Soru §8b'de.
- [x] **B5.9 Kurulamayan haftada "şunu açarsan kurulur" demek — YAPILDI
      (2026-09-24).** B5.8'den doğdu.
      - **Ne yapıyor:** otomatik dizme takılınca program kendiliğinden ikinci bir
        arama yapıyor. Sonuç satırının altındaki panelde neyin değişmesi
        gerektiğini söylüyor, yol yol. Yollar dört aileden gelir: kapalı öğretmen
        saati, günlük sınır, blok şekli, haftalık saat. Sınıfın saati hiçbir
        yolda yok. Her yol bulunduğu haftayla gelir ve tek tıkla (tek geri alma
        adımı) uygulanır.
      - **Kararların:** panel satırın altında, arama kendiliğinden, yollar ayrı,
        dört aile, sıkı biçim (tek satır ve `Ayrıntı`).
      - **Motor:** planın dediği gibi onarımın genişletilmesi değil, kendi SAT
        çözücümüz (`sat.ts`), çünkü yerel arama 12 saat buluyordu ve en küçüğü 4.
        Kayıt [DECISIONS.md](DECISIONS.md)'de.
      - **Babanın verisinde ölçülen:** "HE Cumartesi 12, KY Cumartesi 1–2, AV
        Cumartesi 5 açılırsa kuruluyor" (4 saat), ya da 6 sınır (üç ders için
        aynı gün 2 yerine 3, üç öğretmen için günde 10 yerine 12). İkisi de
        CP-SAT'ın en küçüğüyle aynı boyutta, ama tarayıcıda "azı yok" kanıtlanamıyor,
        o yüzden panel "bulduğumuz en küçük" diyor.
      - **Sebep cümlesi de düzeldi** (`holeReason`): sınıfın kendi kapalı saati
        artık hiç çıkmıyor.
      - **Açık kalan:** babanın makinesinde süre (bu makinede ilk öneri yaklaşık
        34 saniyede); blok şekli ailesi bu veride bütçesinde cevap veremiyor.
        Süre ve yollar B5.10'da.
- [x] **B5.10 Babanın verisi Mozaik'te de otursun: yollar, cümleler, "olmaz" ve
      hız — YAPILDI (2026-09-25).** B5.9'un dört eksiğinden doğdu (en az yerine en
      mantıklı, karışık çare, "azı yok" kanıtı, süre).
      - **Yeniden ölçüm (CP-SAT, depo dışı):**
        - Roboders'le iki fark daha çıktı: 415D Geometri'yi orada YG veriyor, ve
          üç dersin blok şekli farklı.
        - KY'ye dokunmadan hafta kurulmuyor.
        - En küçük çare iki öğretmenle de 4 saat.
        - Ayrıntısı TESTFINDINGS'te.
      - **Kararların:**
        - tek ölçüt yok, bütün yollar sırayla gösterilir ve seçen baba;
        - karışık yol ve ders–öğretmen eşleşmesi ayrı yollar;
        - worker, ana iş parçacığı yedeğiyle;
        - kompakt panel, `Olmaz` Ayrıntı'da.
      - **Yapılan:**
        - Yollar, her biri babanın cümlesiyle ("KY Cumartesi 3–4. saatlere de
          gelebilirse hafta kuruluyor."): zaten geldiği güne saat, en az saat
          (yan yana), en az öğretmen, saat ve sınır birlikte, yalnız sınırlar,
          dersi başka öğretmene vermek, blok şekli, haftalık saat.
        - `Olmaz` bir değişikliği bütün yollardan çıkarıp yeniden arıyor, geri
          alınabiliyor.
        - Komşulukta arama.
        - Yollar ayrı worker'larda (sayfanın kendi betiği, tuzak 136).
      - **Ölçülen, babanın dosyası, Linux exe:**
        - ilk öneri 5,6 s'de (önceki turda 25 s), arama 33 s'de bitiyor;
        - en az saat 4, en az öğretmen 6 (KY), zaten geldiği gün bedel 7; üçü
          de CP-SAT'ın en iyisi;
        - uygulayınca 211/211 ve "Sorun yok", Ctrl+Z geri alıyor.
      - **Açık kalan:**
        - Babanın Windows makinesinde (WebView2) worker ve süre ölçülmedi.
        - Ders–öğretmen eşleşmesi bu veride bulunamıyor.
        - Sınır yolu 6 yerine 7 sınır buluyor.
        - "Azı yok" kanıtı hâlâ yok (LP 0,39 veriyor).
        - `Olmaz` sonrası kalite düşüyor (KY'nin Cumartesisi olmadan 8 saat,
          CP-SAT 5).
      - **2026-09-25 ikinci tur (B5.11):** ret sonrası kalite kapandı (5 saat),
        sınır yolu exe'de 6 sınır buluyor, karma yol eklendi, "azı yok" bilerek
        bırakıldı. WebView2 ölçümü babada (§8b).
- [x] **B5.11 Babanın planını esnetmesi: cevap defteri, önizleme, karma yol —
      YAPILDI (2026-09-25).** B5.10'dan doğdu. Kullanıcının isteği: baba öneriyi
      okuyup öğretmenlerine soracak, bazılarına "olmaz" diyecek, sonra
      uygulayacak.
      - **Ölçülen (plan aşaması, CP-SAT):**
        - Bugünkü öneri babanın dizili 199 bloğunun 140–149'unu oynatıyor.
        - En az saatte 48–62 blok, 8 saatte 25 blok yetiyor.
        - Kullanıcı bunu bedel yapmadı: "en az" müsaitlikte en az demek, dersin
          yeri ve saati serbest.
      - **Kararların (DECISIONS 2026-09-25):**
        - cevap defteri, her soruda `Olur` ve dört türlü `Olmaz`;
        - cevaplar planın verisi (şema v15);
        - ızgarada önizleme;
        - karma yol iki satır;
        - saf el değişimi en çok üç ders;
        - "azı yok" kanıtı bırakıldı;
        - Hakkında'da ve yedek dosyasında aramanın ölçümü.
      - **Yapılan:**
        - Olmaz'ın dört türü (`teacherHours`, `teacherDay`, `teacherCap`,
          `teacher`) ve Olur (`accepted`).
        - Cevaplar `State.answers`'ta, v15 göçüyle.
        - Ret sonrası arama kendi eski haftasından ve geniş komşulukla.
        - Karma yollar (`handFew`, `handHours`).
        - Önizleme ve cevap defteri (`Suggestions.tsx`).
        - Soruları kopyala ve yazdır.
        - Ölçüm kaydı (`relaxLog.ts`).
      - **Ölçülen, babanın dosyası, Linux exe:**
        - ilk öneri 6 s'de, arama 47–50 s'de bitiyor;
        - KY Cumartesi Olmaz: en az saat 5 (önce 8), CP-SAT'ın en iyisi;
        - Olur, önizleme, uygula, 348/348 saat ve "Sorun yok", Ctrl+Z;
        - Hakkında: "6 iş parçacığında".
      - **Açık kalan:**
        - Fikstürde (boş ızgara) ret sonrası 6, CP-SAT 5. **2026-09-26 ölçüldü, açık:**
          5'lik hafta 4 günlük bir komşulukta var ama 1 000 çatışmada bulunmuyor, dört
          çare denendi (DECISIONS 2026-09-26). Aynı gün akşam beşincisi denendi: bütçesi
          yetmeyen komşuluğu artan bütçeyle yeniden sormak. Tek hatta 5'i buldu, yedi hat
          paralelken bulmadı ve aramayı %24 uzattı; bırakıldı (DECISIONS 2026-09-26 akşam).
        - Karma yolun "3 ders ve 2 saat"i bulunamıyor. **2026-09-26 ölçüldü, açık:**
          2 saat 2 dersle ve 1 saat 3 dersle haftalar var, arama kendi başına ulaşmıyor.
        - Arama önceki turdan 15 s uzun, ret sonrası 64 s. **2026-09-26 kısaldı:**
          exe'de 46,8–48,0 s'den 42,7–44,0 s'ye, ret sonrası 57–60 s'den 51 s'ye
          (eşleşme yolu boşa aramıyor, karma yollar kendi hattında).
        - Babanın makinesinde ölçüm (§8b).
        - Yazdırma penceresinin exe'deki PDF'i kullanıcının gözüyle alınacak.
        - Ipucu sorusu hiçbir formülde tutmuyor, tutturulunca arama kötüleşiyor
          (tuzak 139); kod olduğu gibi kaldı.
---

## §6. Bölüm 6 — Veri modelini büyüten işler (aSc kova 2–4)

Bunların hepsi ya `schemaVersion`'ı artırıyor ya kısıt motorunun tamamına
dokunuyor. **Şema her değiştiğinde: sürümü artır, göç kodunu yaz, hem birim
hem E2E testini ekle** — eski yedek açılmıyorsa veri kayıptır (tuzak 97).

> **Not, iş yok (2026-10-08) · Şube.** Dershane bugün tek yerde. İleride başka
> yerler için gerekebilir (kullanıcı). Şimdilik bir madde açılmıyor; gerekirse
> önce plan kitaplığının (her plan ayrı bir okul) bunu karşılayıp karşılamadığı
> sorulur.

- [ ] **B6.1 Gruplar / bölünmeler — YENİ BİR ŞEMA SÜRÜMÜ.** Senin satırın: *"seçmeli ders
      yok ama olsun."* `placements` bir hücreye **tek** ders tutuyor; bu madde
      tam olarak onu değiştiriyor, yani göç kodu, `sanitize()`, cascade ve
      **kısıt motorunun tamamı** etkileniyor. Listenin en pahalı maddesi.
- [ ] **B6.2 aSc'den içe aktarma (XML) — ve artık DOSYANIN ADI BELLİ.**
      Babanın aSc dosyası `15 EYLÜL.roz`
      (`C:\Users\BİREY ÜMRANİYE\Documents\...`, fotoğraftan okundu). §8c'nin
      kalan tek maddesi olan **ders listesi** tek adımda buradan gelir —
      dosyanın kendisi istenirse. **`.roz` bir zip mi, ikili mi: ölçülecek.**
      aSc'nin `Dosya İşlemleri`'nde dışa aktarma da var (menüde görüldü).
- [ ] **B6.3 A/B haftası** — sen *"olabilir"* dedin; **B6.1'den sonra**.
- [ ] **B6.4 Ders başına derslik** — önceliklendirme, paylaşılan derslik,
      kapasite. (aSc kova 3.)
- [ ] **B6.5 Ders kopyalama · toplu ders ekleme · ad biçimi · ~~kısayol
      listesi~~ · iki programı karşılaştırma · ders ızgarası toplu giriş.**
      (aSc kova 4; altısı da küçük ve birbirinden bağımsız — bir "boş vakit"
      turu.) **Kısayol listesi bitti (2026-08-31, kırk beşinci oturum):**
      `src/ui/ShortcutsHelp.tsx`, üst çubukta düğme + `?` tuşu + Ctrl+K
      paleti, dört dilde çeviri, `e2e/palet.spec.ts` 54. Kalan beşi açık.
- [ ] **B6.6 Kapanırken kaydedilmemiş değişiklik uyarısı — muhtemelen
      GEREKMİYOR.** Her değişiklik 400 ms gecikmeyle kaydediliyor ve sekme
      kapanışında anında yazılıyor, yani "kaydedilmemiş" durum pratikte
      oluşmuyor. Yine de babanın içi rahat etsin diye görünür bir
      "kaydedildi" işareti düşünülebilir. **Ölçülmeden yazılmaz.**

---

## §7. Bölüm 7 — Dağıtım, Windows ve depo

> **Bu oturum Windows 11 üstünde koşuyor** — aşağıdaki maddelerin birçoğu
> *"başka bir makinede ölçülecek"* diye bekliyordu ve **artık burada
> ölçülebilir**.

- [x] **v2.0.1 yayınlandı.** `54403b6` + `v2.0.1` etiketi. Taşıdıkları:
      v2.0.0'ın **veri kaybı düzeltmesi** (doğru `identifier`, tuzak 95),
      AA turunun beş maddesi (şema v11), AC turunun altısı, AB turunun yedisi.
- [x] **B7.10 Exe'nin "Güncellemeleri denetle"si onarıldı** (2026-08-31).
      Depo `ders-programi` → `Mozaik` olunca yayınlanmış v2.0.2 manifestteki
      yeni adresi reddetti: `Beklenmeyen adres: https://…`. `update.rs` artık
      **iki** kök tanıyor, manifest **eski** adresi yazıyor (GitHub 301'liyor),
      adres kapısı yalnız **indirilecek bir şey varken** çalışıyor, ve
      `src/surum.test.ts` iki dosyanın anlaştığını her koşuda ölçüyor.
      Bkz. tuzak 106.
- [x] **B7.11 `SITE_ADRESI` 404'tü, düzeltildi** (2026-08-31). Pages bir depoyu
      **adıyla** yayınlıyor: `…github.io/ders-programi/` → 404,
      `…github.io/Mozaik/` → 200. Programın "en son sürüm şurada" dediği tek
      adres bu.
- [ ] **B7.12 Yeni sürüm yayınlanınca babanın v2.0.2'si DENENSİN.** Düzeltmenin
      o kopyaya ulaşan yarısı **manifest**; ikilinin içindeki önek
      değiştirilemez. Yayından sonra "Güncellemeleri denetle" yeni sürümü
      görmeli ve indirebilmeli. Görülene kadar bu bir varsayım (tuzak 65).
- [ ] **B7.14 v2.0.3 YAYINI DÜŞTÜ ve `latest` 2.0.2'de kaldı.** `exe` işinin
      "Name it and MEASURE its size" adımı başarısız (`tauri build` başarılı).
      Adım iki ada da bakacak şekilde sağlamlaştırıldı, ama **asıl sebep
      ölçülmedi**: job log'u admin hakkı istiyor (403). Kullanıcı log'a bakıp
      etiketi yeniden koştursun — düzeltmenin babanın kopyasına ulaşması bu
      yayına bağlı.
- [x] **B7.15 `e2e/exe.spec.ts`'in `Mozaik-tumu.json` beklentisi geri alındı**
      (2026-08-31, kullanıcı kararı: *ad `ders-programi-*` kalsın*). `658c019`
      yalnız testi değiştirmişti; kod haklıydı. Ad artık bir **birim testinde
      çivili** (`folder.test.ts`) — mutasyonla sınandı, çünkü tersi hiçbir
      yerde yakalanmıyordu: adı değiştiren biri `prunable`'ın kalıbını da
      değiştirir ve baba klasöründe iki nesil yedek yan yana kalır.
- [ ] **B7.1 Exe babanın makinesinde bir kez denensin.** Bu makinede
      ölçülemeyen şeyler orada görülür: exe'nin kendini gerçekten
      değiştirmesi, planların yerinde kalması, **görev çubuğundaki yeni simge**
      (eşik 32'ye çıktı), SmartScreen'in ne dediği, ve `Kur.cmd`'nin yeni
      `RemoteSigned` yolu.
- [ ] **B7.2 GitHub Pages hâlâ başkasına gidiyor.** `AlparslanSemiz.github.io`
      deposunda Settings → Pages → Custom domain temizlenecek **ve** kökteki
      `CNAME` silinecek. Kaldırmanın GameMetrix'i kırmayacağı **ölçülmüştü**
      (o alan adı tamamen Cloudflare'da, Pages'ten bağımsız).
- [ ] **B7.3 SmartScreen ekranı GÖRÜLSÜN.** İmzasız exe'de Windows
      "bilinmeyen yayıncı" der; README'ye tek cümlelik yol yazıldı
      (*"Daha fazla bilgi" → "Yine de çalıştır"*) ama **ekranın gerçekte ne
      dediği görülmedi**. Görülünce cümle düzeltilecek.
- [ ] **B7.4 Yazdırma Tauri penceresinde çalışıyor mu** (WebView2 yazdırma
      diyaloğu). Linux'ta denenmedi, çünkü ölçülecek olan WebKitGTK'nın
      diyaloğu olurdu — babanın göreceği şey değil. A4 yatay ve
      `@page { margin: 0 }` orada da tutuyor mu.
- [ ] **B7.5 `.exe` boyutu ve açılışı Windows'ta ölçülsün.**
      Linux/WebKitGTK'da: 3,64 MB, derleme 1 dk 38 sn, açılıştan diske ilk
      yazıma 986 · 1053 · 1149 ms. **Windows/WebView2 başka bir sayı verecek.**
- [ ] **B7.6 `strip = false`'un boyut maliyeti** — Rust olan bir makinede
      ölçülecek. Ölçmeden bir entropi iddiası yazmak tuzak 65 olur.
- [ ] **B7.7 `kayma.spec.ts`'in "aynı genişlikte" testi macOS'ta düşüyor** ve
      kusur kodda değil: bindirmeli kaydırma çubuğu 0 px, yani testin ölçmek
      istediği oluk orada yok — testin **kendi koruması** bunu söylüyor.
      Regresyon değil, platform farkı. Karar: oluk yoksa `skip` mi etsin,
      yoksa yazıldığı makineye özel mi kalsın.
- [x] **B7.13 Exe'nin penceresi ekranı KULLANIYOR, ve Sığdır dersleri
      kırpmıyor** (2026-09-01). Senin satırın: *"Uygulama'da exe'de babamın
      ekranında program kısmında derslerin hepsi gözükmüyor sığdır olmasına
      rağmen."* Sebep tahmin edilmedi, ölçüldü (tuzak 101) ve **iki** taneydi.
      (a) `tauri.conf.json` `1600×1000` mantıksal px istiyor ve `maximized`
      yoktu — deponun bütün düzen ölçümleri 1920'de yapılmışken exe 1600 CSS
      px'te koşuyordu. Dolu ızgarada Sığdır'da: 1920'de 374 kartın 25'i,
      **1600'de 315'i** `411` yerine `4…` yazıyor. (b) Sığdır satır başına
      5,25rem ve altı ayraca .375rem, yani 1920'lik kutunun 97 px'ini ders
      sütunlarına hiç vermiyordu. Yapılanlar: `"maximized": true`,
      `minHeight` 700 → 640 (%150'de çalışma alanı 672), satır başı **5rem**,
      ayraç **.1875rem** (artık `--break-w` tokeni, iki yerde birden), satır
      başına `nowrap` + ellipsis ve daha dar dolgu, köşedeki eksen adı bir
      basamak küçük, ve kart yazı tabanı `--ui-scale`'i **yalnız 1'in altında**
      izliyor. Ölçülen: 1920×1032'de kırpılan kart **25 → 0**, iki eksende de,
      ve satır yüksekliği ile tablo boyu **kıpırdamadan**. Bkz. tuzak 107.
      Kalan ve kapanmayan: Windows %125'te ölçek 1,0 bırakılırsa kırpılma
      sürüyor (72 sütun × ~21,6 px 1536 px'e girmiyor); çaresi Ayarlar →
      Görünüm'den %80, ya da `Geçici görünüm`den gün gizlemek.
- [→] **B7.8 `scripts/asc-tur.ps1` yeniden koşturulsun** → **R1**'e taşındı.
      Artık bir dağıtım işi değil, envanterin **önkoşulu**.
- [→] **B7.9 Roboders incelensin** → **§1b** (R5 · R6 · R7). Senin
      *"her şeyden önce"* satırın onu bir maddelik iş olmaktan çıkardı.
- [x] **B7.16 Linux exe'si — YAPILDI (2026-09-24).** Senin satırın: *"Linux exesi de
      oluşturalım."* `npm run exe:linux` → `dist-exe/Mozaik` (4,3 MB, release derlemesi
      1 dk 40 sn). Kararın: yalnız geliştirme ve test için, dağıtılmıyor. Bu yüzden
      kendini güncellemiyor: `update.rs`'in `self_update_here()`'ı Windows dışında
      indirmeyi ve takası reddediyor. Ölçülen bir tehlikeydi: ret yokken Linux kopyası
      GitHub'dan Windows exe'sini indirip kendi üstüne yazacaktı (tuzak 126).
      `cargo test` 25/25.
- [x] **B7.17 Gerçek exe'yi süren araç — YAPILDI (2026-09-24).** Senin satırın:
      *"Ardından bu exeyi açan playwright gibi iş yapan araç kuralım ki sen exe
      üzerinden görebil her şeyi."*
      - **Sürücü:** `scripts/exe-surucu.mjs`. Programı açar, ekran görüntüsü alır,
        ekrandaki her denetimi `@N` referansıyla döker, tıklar, yazar, tuşlar,
        sürükler, pencereyi boyutlar ve sayfada betik çalıştırır. Rust komutlarına
        da `__TAURI__` üstünden ulaşır.
      - **Nasıl çalışıyor:** Playwright WebKitGTK penceresini süremiyor, yerine
        `tauri-driver` ve WebDriver. İstemci bağımlılıksız (`scripts/webdriver.mjs`).
      - **Güvenlik:** her koşu sahte bir ev dizininde. Gerçek
        `~/Documents/Ders Programı/` önce ve sonra karşılaştırıldı, değişmedi.
      - **Süit:** `npm run exe:e2e` → `e2e/gercek-exe.spec.ts`, 5/5.
      - **Bilinen sınır (tuzak 127):** bu makinenin WebKitGTK'sı WebDriver'ın fare ve
        klavye benzetimini desteklemiyor. Girdi sayfanın içinde olay olarak
        üretiliyor, yani gerçek fareye verilen cevap ölçülmüyor.
- [x] **B7.18 Linux exe'sinin turu, babanın dosyasıyla — YAPILDI (2026-09-24).**
      Yedi sekme ve her özellik exe'de gezildi, asıl kısmı babanın kendi planıyla
      (sahte eve yüklendi, gerçek klasör değişmedi). Çalışanlar:
      - otomatik dizme ve öneri paneli (babanın dosyasında `Otomatik diz` ilk
        öneriyi 25 s'de veriyor, uygulayınca "Sorun yok", Ctrl+Z geri alıyor);
      - havuzdan sürükleme, sabitleme, geri alma ve yineleme;
      - Ctrl+K, `?`, tema, ölçek ve dil;
      - planlar, alternatif program ve yedek klasörü;
      - Hakkında ve güncelleme denetimi;
      - kaydet ve aç, yazdırma (GTK penceresi açılıyor);
      - kapatıp açınca verinin kalması.

      Düzeltilenler:
      - sabitleme çökmesi (tuzak 130);
      - Hakkında'nın Linux cümlesi;
      - dil hapı;
      - `Otomatik diz`'in dizili derslerle yol bulamaması (yeniden dizme,
        B5.9'un eki);
      - dört araç kusuru (tuzak 131, 132 ve gerçek exe süitindeki yarış).

      Bulgular [TESTFINDINGS.md](TESTFINDINGS.md)'de, süit 9/9.
      - **Açık:** takas exe'de denenmedi (tarayıcı süiti ölçüyor); yazdırmanın PDF
        dökümü ve dosya seçici elle görüldü, süit ölçmüyor (tuzak 133); öneri
        araması WebKitGTK'da Chromium'dan yavaş (Baştan diz'de ilk öneri 51 s'ye
        34 s).
      - **Kalan, isteğe bağlı:** pencere şimdilik masaüstünde açılıyor. Başsız
        koşu için `sudo dnf install xorg-x11-server-Xvfb`; sürücü `xvfb-run`'ı
        görünce kendiliğinden kullanıyor.
- [ ] **B7.19 `surum.yml`'e ikinci kat: etiketin SHA'sında CI yeşil mi (2026-10-08).**
      `npm run yayinla` etiketi yalnız CI'ı yeşil bir commit'e atıyor (BUILD.md). Elle
      itilen bir etiket bunu atlar; `surum.yml`'in publish işi de etiketin SHA'sındaki
      `ci.yml` koşusunu `gh` ile sorup kırmızıda durmalı. Şimdi yapılmadı, çünkü bir
      etiket olmadan sınanamıyor; ilk gerçek sürümle birlikte.
- [~] **B7.20 İş akışlarındaki `actions/*@v4` Node 20'yi hedefliyor (2026-10-08).** CI
      günlüğü: "Node.js 20 is deprecated … forced to run on Node.js 24". Dependabot'un
      bunları güncelleyen PR'ları 2026-09-26'dan beri açık (`checkout`, `setup-node`,
      `deploy-pages`, `upload-pages-artifact`, `download-artifact`); o gün silinen PR iş akışının
      saat dilimi kırmızısı yüzünden hepsi kırmızıydı. Artık `ci.yml` onları push'ta
      koşuyor; dalları yeniden koşturulup yeşilse birleştirilebilir.
      **2026-10-09, kullanıcının sırası, beşi de birleşti:** #4 (checkout v7), #2
      (setup-node v6), #5 (download-artifact v7), #1 (upload-pages-artifact v5), #3
      (deploy-pages v5); her birinden sonra `main` yeşil, #3'ten sonra sitenin dağıtım
      SHA'sı `91e2ead`. Kalan Node 20 uyarısı `upload-artifact@v4`. `gh`'nin jetonunda
      `workflow` yetkisi yok, birleştirme yerelde birleştirme commit'iyle ve SSH ile
      itiliyor (PR'ın SHA'sı korunduğu için GitHub onu "merged" sayıyor).
      `upload-artifact` v4 için Dependabot beklenecek, elle yapılmaz. #6 (bölme önerisi
      onaylı, sonra), #7 (vite 8, ayrı ve ölçümlü bir iş) ve #8'e dokunulmadı.
- [ ] **B7.21 WebKit'in 19 kırmızısı ayrılsın (2026-10-09).** `npm run test:webkit`'in
      ilk koşusu (TESTFINDINGS): Chromium'a özgü dört iddia (A2 gibi "yalnız Chromium"
      diye işaretlenmeye aday), sekiz sürükleme ve imleç, beş ölçü ve yazı, iki hareket.
      Her biri için ürün mü test mi olduğu ölçülür. Babanın ortamı Chromium, yani öncelik
      düşük. **Kullanıcının kararı (2026-10-09):** şimdilik düzeltme yok, `test:webkit`
      ne `kontrol`'e ne `haftalik.yml`'e giriyor.
- [x] **B7.22 Windows'ta Sığdır kırpıyor (2026-10-09) — BİTTİ, Windows'ta yeşil.** `haftalik.yml`'nin ilk koşusunda
      `gorunum.spec.ts:815` (babanın verisi, 1920, Öğretmen: 5 kart) ve `:841` (%125, örnek
      okul: 25/374) tekrarda da kırmızı; Linux'ta yeşil. Babanın ekranı tam bu (Windows,
      %100, 1920). Sebep ölçüldü: gün çizgisi günün ilk saatinin hücresine içeriden
      çiziliyordu (kart 21,53 px, ötekiler 24,53), ve Windows'un glif ilerlemeleri kesirli,
      Linux'unkiler tam piksel (tuzak 146). Sığdır'da günün ilk sütunu çizginin genişliğini
      geri alıyor (`290f55d`); tavanlar indi. `haftalik.yml` 37914431289: 623/623.
- [x] **B7.23 `haftalik.yml`'nin Windows işi öneri aramasının iki testini ayırsın
      (2026-10-09).** İlk koşuda ikisi kararsızdı; `ci.yml`'deki `e2e-arama` gibi ayrı bir
      adımda `--workers=1`. **Bitti (`290f55d`), Windows'ta iki test de yeşil.** Windows
      işi sonra `windows.yml`'e taşındı ve her `main` push'unda koşuyor; `yayinla`
      etiketten önce onu da bekliyor (`3cd0ecb`, DECISIONS 2026-10-09).
- [~] **B7.24 Mutasyon 2026-09-24'ten beri koşamıyor (2026-10-09).** `src/pure/solver.ts:975`
      `weight[index]!++` Stryker'ı başlamadan düşürüyor (TESTFINDINGS). Çare 2026-09-12'deki
      gibi `weight[index] = weight[index]! + 1`. **Düzeldi (`290f55d`)** ve arkasındaki iki
      engel de (test ve ilk koşu süre tavanları); kuru koşu yerelde geçti, tekrarı lint
      yakalıyor (tuzak 147). Bitti sayılması `haftalik.yml` 37914431289'un tam mutasyon
      koşusunun sonucunu bekliyor.
- [ ] **B7.26 `invariants.test.ts`'in öneri değişmezi CI'da kararsız (2026-10-09).** 60 s'lik
      tavan 60 dünyanın toplamı; `main`'de 10–22 s, aç kalan bir runner'da 74 s
      (TESTFINDINGS). Seçenekler: tavanı yükseltmek, `numRuns`'ı düşürmek ya da dünyayı
      küçültmek; kullanıcının kararı.
      Karar (2026-10-09): test zayıflamaz, `numRuns` 60 kalır. `hiz/belge-test` dalında
      ("Test: öneri değişmezi olay döngüsünü bırakıyor, tavanı ölçülen CI süresinden")
      arama dilimlerle koşuyor ve dilimler arasında işçiye dönüyor, tavan CI'ın en yavaş
      ölçümünün iki katı (180 s). M1, M2 ve M3 kırmızı. CI'da yeşil görülene kadar açık.
- [x] **B7.25 Linux paketi yerel komut (A7, 2026-10-09).** `npm run exe:rpm`; `surum.yml`'e
      Linux işi yok (DECISIONS 2026-10-09). Denendi: 1 dk 16 s, rpm 1 944 638 bayt.

---

## §8. Karar bekleyenler

### 8a · Sende — kullanıcı kararı

- [x] **Roboders hesabı — VAR** (2026-08-31). Kayıt engeli düştü.
- [ ] **Roboders hesabı ücretli bir plan mı, süren bir deneme mi?** Deneme ise
      kaç gün kaldığı R6'nın kapsamını belirler.
- [ ] **R6 ne zaman koşsun?** Görünür bir Chromium penceresi açılacak ve odağı
      alacak; oturumu sen açacaksın. Müsait olduğun bir zaman gerekiyor.
- [x] **Çözücüde Deney B uygulansın mı? — UYGULANDI** (2026-08-31, B5.1).
      "Uygula — önce ölç" dedin; dört ağır dünyada önce/sonra ölçüldü, hiçbir
      dünyada blok düşmedi.
- [ ] **`kayma.spec.ts` macOS'ta `skip` mi etsin?** (B7.7.)
- [ ] **Yedek dosya adı `ders-programi-*` mı kalsın, `Mozaik-*` mi olsun?**
      (B7.15.) Ad değişirse `folder.ts`'in budama kalıbı eski dosyaları
      tanımaz: birikirler, ve eski ana dosya klasörde öksüz kalır.
- [ ] **Web yığını ile uygulama yığını ayrılsın mı?** Senin satırın:
      *"Gerekirse web stacki ile uygulama stacki ayrılmalı bu çok büyük bir şey
      ama gerekiyorsa yapılacak."* Koşullu bir satır ve koşulu B4.9: açılışın
      gerçek maliyeti ölçülmeden bu karar verilemez. Bugün dört teslim yolu aynı
      `dist/index.html`'i taşıyor ve ayrım o birliği bozar
      ([PRINCIPLES.md](PRINCIPLES.md), "Çift tıkla çalışır"). Sıra: önce B4.9'un
      ölçümü, sonra ayrımın kazancının ölçülmesi, sonra bu karar.
- [ ] **Excel mi, `.csv` mi?** (B3.3 — `.xlsx` bir zip, `.csv` düz metin;
      ikisi çok farklı iş.)
- [ ] **Çıktı ekranları için örnek fotoğraf.** Senin satırın: *"Benden çıktılar
      için ... foto iste eğer örnek fotolarda atmadıysam."* → **isteniyor**.
- [ ] **Bulut senkronizasyonu / backend isteği — 2026-10-08'den beri bir kural
      çelişkisi DEĞİL.** Sunucusuz ilkesi ve "yapılmıyor" listesindeki bulut
      senkronizasyonu ile kullanıcı hesapları satırları o gün kalktı (DECISIONS:
      babanın fikir değiştirmesi). Aşağıdaki sorular hâlâ açık ve bir görev
      numarası onlar cevaplanınca açılır. Aşağısı 2026-08-31'deki kayıt, o günkü
      kuralla: Senin satırın: *"Sanırım cloud tabanlı
      bir şey kuracağız babam öyle istedi. Bende 1gb ramli 8gb depolama
      alanlı VM var bedava... onun yanına dockerda falan küçük yer kaplayan
      bir cloud sistemi kuralım."* Netleştirmen üzerine (2026-08-31): bu
      **programın backend'i / veri senkronizasyonu** için — yani ilke 2'nin
      ("Sunucu yok") tam karşısında ve yasak listedeki **"bulut
      senkronizasyonu"** maddesiyle birebir çakışıyor. Yasak liste "bunlar
      bu projeye ASLA girmeyecek" diyor; bu satır o cümleyle duruyor.
      **İlerlemeden önce gereken, bir TODO.md maddesi değil bir CLAUDE.md
      kararı**: ilke 2'nin 2026-08-30'daki "KURULUM YASAĞI KALKTI" ve
      "PAYLAŞMA YASAK DEĞİL" örneklerindeki gibi açıkça **kullanıcı
      kararıyla** gevşetilmesi, ve yasak listeden "bulut senkronizasyonu"nun
      (gerekirse "kullanıcı hesapları"nın da) çıkarılması. Netleşmesi
      gereken sorular: hangi veri senkronize edilecek (bütün plan kitaplığı
      mı, yalnız son hâl mi) · kaç cihaz arasında · aynı planın iki yerde
      değişmesi nasıl çözülecek (çakışma) · hesap/kimlik gerekip
      gerekmediği · 1 GB RAM / 8 GB disk'lik VM'in bunu kaldırıp
      kaldırmayacağı · eski (bozuk) sitenin ne olacağı. **Statik site zaten
      ücretsiz yayınlanabiliyor** (`dist-site` + GitHub Pages, B7.2) — VM
      fikri onun ötesinde bir şey mi istiyor, bu da netleşecek. Bu sorular
      cevaplanmadan bir görev numarası (B7.x) açılmayacak.

### 8b · Babada

- [x] **Babanın makinesinde Windows sürümü — CEVAPLANDI (2026-10-08): Windows 10.**
      Makine: 4 GB RAM (muhtemelen DDR3), çok eski işlemci ve anakart, 27 inç ekran,
      1920×1080 (kullanıcı). Exe orada açılıyor (tuzak 106). 4 GB'ta öneri aramasının
      worker'ları ölçülmedi (aşağıdaki ölçüm maddesi).
- [x] **Babanın Windows ekran ölçeği — CEVAPLANDI (2026-10-09): %100, kesin.**
      Babanın ayarı programa göre değiştirilmez: program %100'de de %125'te de düzgün
      görünmeli, bugünkü %125 kutuları (`e2e/gorunum.spec.ts`) korunur. Ayrı bir
      "%125" E2E projesi gerekmiyor.
- [ ] **Babanın exe'si hangi sürüm? (2026-10-08)** Ayarlar → Hakkında'da yazıyor;
      son sürüm olmalı (kullanıcı, 2026-10-09; **doğrulanmadı**, numara görülmedi). Bilinen son kayıt v2.0.2 (2026-08-31). v2.0.2 güncellemeyi eski
      `ders-programi` adresinden soruyor, v2.0.3 ve sonrası `Mozaik`'ten; depo adı ya
      da görünürlüğü bir gün değişirse hangi sürümün güncellenebilir kalacağını bu
      belirler (DECISIONS 2026-10-08, depodaki gerçek veri).
- [x] **Baba kurulum yolunu kullanıyor mu? — CEVAPLANDI (2026-10-08): hayır, exe
      kullanıyor** (`Kur.cmd` değil). Kurulumun PowerShell betikleri hiçbir testte
      çalıştırılmıyor ([TESTPLAN.md](TESTPLAN.md), "Test edilemeyenler"), ama babanın
      yolu o değil.
- [x] **Öğretmenler programlarına Eyotek'ten mi bakıyor? — CEVAPLANDI (2026-10-09):
      genelde Eyotek'ten.** Bu yüzden B3.8'de Eyotek'e gönderme e-postadan önce.
- [ ] **Eyotek'e gelen program öğretmene bir bildirim olarak gidiyor mu? (2026-10-08,
      B3.8)** Push ya da SMS.
- [x] **Turtek'e soru — SORULMAYACAK (2026-10-09).** Kullanıcının kararı: "kendimiz
      çözeriz" (DECISIONS). Yol Eyotek'in kendi arayüzünde aranır (Eyotek turu).
- [x] **Baba hangi e-posta hizmetini kullanıyor? — CEVAPLANDI (2026-10-09): Gmail.**
      Gönderme yolunun önerisi B3.8'de.
- [ ] **Vekil öğretmen (Substitution) var mı?** aSc'de 62 yardım konusu, yani
      küçük bir özellik değil. **Babaya sorulmayacak (2026-10-09):** Roboders'teki
      gerçek verisinde vekil modülünün kullanılıp kullanılmadığı R6'nın Tur 3 ve 4'ünde
      okunacak (yalnız okuma).
- [ ] **Nöbet var mı?** Aynı yolla, Tur 3 ve 4'te okunacak.
- [ ] **Otomatik dizmenin çıktısı KULLANILIR mı?** Yasal olduğu ölçülüyor
      (21 dünyada, her blok `blocker()`'dan geçiyor); *iyi* olduğu ölçülmüyor.
      Sorular: sınıfın günü içinde boşluk (pencere) kalıyor mu, öğretmen okula
      gereksiz gün geliyor mu, günler dengeli mi. Cevaba göre §5 şekillenir.
- [x] **"Bu programı kullanır mıydın?" — CEVAPLANDI (2026-10-09):** cevabı babanın
      gerçek bir haftayı Mozaik'te dizdikten sonraki geri bildirimi (§0).
- [ ] **Müsaitlik hangisinde doğru, Mozaik'te mi Roboders'te mi?** (B5.8, 2026-09-24)
      Roboders KY ile GÇ'yi Cumartesi, AS'yi Pazar sabahı derse koyuyor, Mozaik'te o
      saatler kapalı. Mozaik'teki doğruysa hafta o hâliyle kurulamıyor (kanıtlı), en
      küçük çare dört öğretmen saati, hepsi Cumartesi: HE, KY (iki saat) ve AV. Hangi
      saatler olduğu tek değil. CP-SAT bir keresinde HE 3, KY 11–12 ve AV 1'i buldu,
      program (B5.9) HE 12, KY 1–2 ve AV 5'i öneriyor. Yalnız Cumartesi açılınca
      kuruluyor, başka hiçbir gün tek başına yetmiyor.
      Roboders'teki doğruysa üç öğretmenin saatleri Mozaik'te düzeltilince program
      yaklaşık bir saniyede çıkıyor.
      **2026-09-25'te ölçülen, soruyu daraltan:**
      - Asıl soru KY: KY'ye dokunmadan hafta hiç kurulmuyor. KY Cumartesi gelebiliyorsa
        tek başına yetiyor. Gelemiyorsa en az 5 saat gerekiyor, KY Perşembe 10–11 ile.
      - İkinci yol GÇ: GÇ Cumartesi gelebiliyorsa, 415D Geometri'yi YG verirse (Roboders'te
        öyle) ya da üç dersin blok şekli Roboders'teki gibiyse de kuruluyor.
      - AS'nin Pazar sabahı hiçbir durumda gerekmiyor.
      - Programın paneli bu yolların hepsini babanın cümlesiyle gösteriyor; hangisinin
        doğru olduğunu yine baba söyleyecek.
      - 2026-09-25 akşam: baba cevabını artık programın içinde verebilir (B5.11). KY'nin
        sorusuna "Olur" ya da "Olmaz" der, program kalanı arar, cevaplar dosyada kalır.
- [ ] **Roboders'te (ve eskiden aSc'de) hangi kısıtları kullanıyorsun? (B5.3, 2026-09-26; 2026-10-08'de baba bugün Roboders kullanıyor; 2026-10-09: babaya sorulmayacak, Roboders'teki gerçek verisinde hangi kısıtların dolu olduğu R6'nın Tur 3 ve 4'ünde okunacak)** Özellikle "Planlama
      İlişkileri": iki dersin aynı gün olmaması, art arda olması ya da olmaması, bir dersin
      günün ilk ya da son saatinde olması. Mozaik'te "aynı gün olmasın" artık var (dersin
      sayfasında). Babanın aSc şeridinde düğme görünüyor ama kullandığı bir ekran
      görülmedi; cevap B5.3'ün sıradaki dilimini seçer.
- [ ] **Babanın makinesinde öneri araması ölçülsün (B5.10, B5.11).** Bu makinede
      WebView2 yok. Ölçüm kaydı 2.2.0'da, 2.2.0 2026-09-26'da yayınlandı. 2026-09-26
      akşamı babadan yeni dosya gelmemişti (gerçek klasörde en yenisi 2026-09-12, `olcum`
      alanı yok), ölçüm atlandı. Babaya gidecek adımlar şunlar:
      1. Mozaik.exe'yi yeni sürümle (2.2.0) açmak.
      2. Program'da `Otomatik diz`'e basıp panelin "aranıyor" demesinin bitmesini
         beklemek.
      3. Ayarlar → Hakkında'daki "Öneri araması" satırının fotoğrafını göndermek.
      4. Ya da Ayarlar → Planlar ve yedek → "Tümünü dosyaya kaydet" ile inen
         dosyayı göndermek: dosyanın `olcum` alanı son yirmi aramayı taşıyor
         (worker sayısı, ilk öneri, bitiş, çekirdek, tarayıcı).
      "Tek iş parçacığında (yavaş yol)" yazıyorsa worker açılmamış demek (tuzak 136).

### 8c · Babanın gerçek verisi — v0'ın çıkma şartı (sağlandı, 2026-10-09)

> ### 🎯 BÜYÜK KISMI 2026-08-31'DE GELDİ — fotoğraftan
>
> Kullanıcının `docs/Örnek Fotolar/`'a koyduğu 33 telefon fotoğrafı babanın
> **aSc'sinin ve Roboders'inin çalışan hâli**, gerçek verisiyle:
> `aSc k12 … 2027 — [15 EYLÜL.roz]`, `C:\Users\BİREY ÜMRANİYE\...`.
> **İki yıldır beklenen şey buydu**, ve iki yıllık varsayımların hepsi
> tutuyor. Ayrıntı [ROBODERS.md](ROBODERS.md) ve aşağısı.

**ÖLÇÜLEN — varsayımlarımız DOĞRU çıktı:**

| Varsaydığımız | Gerçek | |
|---|---|---|
| 6 gün, Salı–Pazar (Pazartesi yok) | aSc Ayarlar: **Gün Sayısı 6**, hafta sonu Cmt–Pzr; ızgarada Salı→Pazar | ✅ |
| Günde 12 ders | aSc Ayarlar: **Günlük Ders Saati 12** | ✅ |
| 09:00 · 40 dk ders · 10 dk teneffüs | Kâğıtta: `9:00–9:40 · 9:50–10:30 · 10:40–11:20 …` | ✅ |
| 5. dersten sonra 30 dk öğle arası | `12:20–13:00` sonra `13:30–14:10` | ✅ |
| **12. ders 19:10'da biter** | Kâğıtta `18:30–19:10` | ✅ `bell.test.ts` haklı |
| ~25 öğretmen | Izgarada **18 satır** (MÇ AV MB YM KY YG AS İA YK HE ED DE SD RY GÇ NU AÖ AG) | ✅ mertebe doğru |
| ~20 sınıf, 8 derslik | **20 sınıf** · derslik harfleri **A–H = 8** | ✅ |
| Sınıf adı 3 haneli kod | `310 311 320 410 411 412 413 414 415 430 431 432 433 450 451 453 510 511 530 531` | ✅ |
| Öğretmen kısaltması 2 harf | Çoğu 2 (`MÇ`=Çetin Melek, `AV`=Vergili Ayşe), biri **`İSAY`** 4 harf | ✅ `makeShort` yalnız VARSAYILAN üretir, `Teacher.short` düzenlenebilir — kusur değil, okundu ve doğrulandı |

**Yeni öğrenilenler:**

- **Sınıf adı ile derslik BİRLEŞİK yazılıyor:** `310 G`, `451C`, `530D`. Bizim
  `ClassGroup.roomId`'miz bunu zaten modelliyor; **kâğıtta yan yana yazmak**
  babanın alışkanlığı.
- **Sınıfın bir de TÜRÜ var:** başlıkta `310 G SAY` — `SAY` (sayısal). Bizde
  böyle bir alan **yok**; `B4.3`'ün "özel alanlar"ına aday.
- **Branş adları numaralı:** `MAT1` · `Mat2` · `Türkç` · `TürkD`/`TDED`
  (Türk Dili ve Edebiyatı) · `Kimya` · `Fizik` · `Biyo` · `Geome` · `Coğ` ·
  `Tarih` · `FLSF`. **`MAT1`/`Mat2` çift branş kararımızı doğruluyor.**
- **Babanın aSc'si LİSANSSIZ:** çıktılarda `Please register` ve
  *"EVALUATION version … distributing this printout is ILLEGAL"* damgası var.
  Yani duvara asılan kâğıtta kırmızı uyarı yazıyor — **bizim çıktımızda
  yazmayacak**, ve bu tek başına bir taşınma sebebi.
- **Bir projede 5 gün × 8 ders** düzeni de var (Roboders ekranı,
  Pazartesi–Cuma). Yani tek bir zil düzeni yetmiyor — **plan kitaplığımız
  bunu zaten karşılıyor.**

**KALAN — hâlâ babada:**

- [ ] **Ders listesi**: fotoğraflarda program var ama "hangi sınıf hangi
      dersten kaç saat" tablosu yok. `B6.2` (aSc XML) bunu tek adımda getirir —
      `15 EYLÜL.roz` dosyasının kendisi istenebilir.
- [x] **Gerçek gün ve zil düzeni — DOĞRULANDI** (yukarıdaki tablo).
- [x] **Öğretmen/sınıf/derslik listesi — GÖRÜLDÜ** (18 · 20 · 8). Makineye
      girilmesi ayrı iş; `B6.2` ya da yapıştırma kutusu.
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en
      fazla/en az kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor ve **öyle
      kalacak** (2026-08-24 kararı): branş kısaltmasının aksine bunun "doğru
      cevabı" okuldan okula değişir, ve yanlış bir varsayılan hücreleri
      sessizce kırmızıya boyar
- [x] **Baba gerçek bir haftayı Mozaik'te baştan sona kendisi dizsin — OLDU,
      v0 BİTTİ (kullanıcı, 2026-10-09).** Geri bildirimi bu denemeden geldi (§0).
      2026-10-08'deki "bitmedi" kaydı yanlış bilgiye dayanıyordu (DECISIONS 2026-10-09).
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?
- [ ] **Branş listesi teyit ettirilsin**: okulun gerçekten verdiği branşlar
      hangileri, listeden ne çıkarılacak
- [ ] **36 rengi gözle sor**: dizerken iki satırı karıştırdığın oldu mu?
      ΔE eşiği sayıyı garanti eder, gözü değil
- [ ] **Kenar çubuğu dar mı geniş mi kullanılıyor?**
- [ ] **Brave'de açık tema** — tuzak 14 çözülmüş sayılıyor ama **babanın
      Brave'inde GÖRÜLMEDİ**; hâlâ doğrulanmayı bekleyen bir varsayım

---
### 8h · Belge turunun bıraktıkları (2026-09-11)

- [x] **Karttaki raptiye dururken görünmez mi, hep görünür mü? — KARAR (2026-09-25):
      dururken görünmez.** 2026-08-30 kaydı "hep görünür, sönük" diyordu, kod (`fb052f4`)
      dururken görünmez yapıyor. Kullanıcı kodu seçti, kod değişmedi. Ayrıntı
      [DECISIONS.md](DECISIONS.md).
- [ ] **PRINCIPLES.md'deki önerilen gerekçeler onaylansın mı?** "Şu an yapılmıyor" listesinde
      beş satır ve "Nasıl çalışılır"da bir cümle "(öneri, doğrulanmadı)" işaretli
      (2026-10-08'de iki "öneri" satırı, bulut ve takvim, listeden çıktı).
      Onaylanınca işaretler kalkar.
- [x] **`.github/surum-notu.md` eski site adresini gösteriyor — DÜZELTİLDİ (2026-09-25).**
      `…github.io/ders-programi/` 404 veriyor, doğrusu `SITE_ADRESI` (`…github.io/Mozaik/`).
      Tuzak 106. `surum.test.ts`'e dosyadaki ve `yayinla.mjs`'teki her site adresini
      `SITE_ADRESI`'ne karşı okuyan bir kapı girdi, düzeltmeden önce kırmızıydı.
- [x] **`src/platform/changelog.ts`'in 2.1.1 notları eksik — DÜZELTİLDİ (2026-09-26).** `516f963`'teki
      renk menüsü, kart takası ve Hakkında noktası yazılmamıştı, `CHANGELOG.md`'de vardı. Üçü eklendi,
      ve 2.1.1'in hiç çevrilmemiş dört satırı da dört dile girdi.
- [x] **Boş ekranlar dersler için Okul'u gösteriyor — DÜZELTİLDİ (2026-09-25).** Program,
      Kontrol ve Çıktı'nın cümleleri "Okul sekmesinden dersleri girin" diyordu, dersler Dersler
      sekmesinde giriliyor. Cümleler kullanıcıya taslak olarak gösterildi ve onaylandı: Program
      sekme sırasıyla Okul, Müsaitlik ve Dersler diyor, Kontrol Okul ve Dersler, Çıktı Dersler.
      `bos-ekran.spec.ts`'in üç iddiası düzeltmeden önce kırmızıydı.
- [x] **Havuzun boşalınca kendiliğinden kapanması — VAR, ÖLÇÜLDÜ (2026-09-25).** Eski
      CLAUDE.md'de yazılıydı, 2026-09-11'de kodda bulunamamıştı, çünkü tercihe yazılmıyor:
      `LessonPool.tsx` kart yokken çekmeceyi çizimde kapatıyor. Chromium'da ölçüldü, kart
      gelince kendiliğinden açılıyor, elle kapatılmışsa kapalı kalıyor. Kod değişmedi.
      Ayrıntı [DECISIONS.md](DECISIONS.md) ve [LAYOUT.md](LAYOUT.md).
- [x] **Bayat kod yorumları — DÜZELTİLDİ (2026-09-25):** `App.tsx`'in başı "six sections",
      `Program.tsx` havuzu "down the right", `App.tsx`'in marka yorumu "detailed",
      `Appearance.tsx`'in başı ölçeği "1.00 to 1.50" diye anlatıyordu. Aynı turda `App.tsx`'te
      iki "six" daha, `changelog.ts`'in `surum-notu.md` için "overwrites" demesi (iş akışı
      dosyayı okuyor) ve dört sözlükle `CHANGELOG.md`'deki `src/changelog.ts` yolu düzeldi.
- [x] **Ana E2E süiti bu turda koşulmadı.** Bir sonraki arayüz işinde ya da sürümden önce
      `npm run test:e2e`, 2026-09-01'deki altı düşüşle birlikte. 2026-09-11'de kod refactor
      turunun tabanı olarak koşuldu: 545/555, düşen on testin ayrımı WORKLOG'da, iki bulgu
      TESTFINDINGS'te ve §8d'de.
- [x] **`npm run yayinla`'nın CHANGELOG kapısı gerçek bir sürümde denenmedi — DENENDİ
      (2026-09-26, v2.2.0).** Unreleased bloğu `## [2.2.0] - 2026-09-26` altına kapandı,
      boş bir Unreleased başlığı kaldı. Push HTTPS kimlik bilgisi olmadığı için düştü ve
      betik hatayı ham bir bayt dizisi olarak bastı; push SSH adresiyle yapıldı
      (TESTFINDINGS 2026-09-26). Hata mesajı aynı gün düzeldi (`scripts/git-komut.mjs`):
      düşen komut bir cümleyle, git'in cevabı düz metinle bildiriliyor.

---
### 8d · Kod refactor turunun envanterinden çıkanlar (2026-09-11)

Envanter (refactorun Faz 0'ı) kaynağı okurken buldu. Bunlar davranış kusuru ya da
belge ile kod ayrılığı, yani refactor commit'lerine girmez. Envanterin kendisi ve
önerilen sıra WORKLOG'un 2026-09-11 tarihli refactor girdisinde.

- [x] **Kanca sırası.** `Availability.tsx` 142'de erken dönüyor, `useMemo`'yu 213 ve
      222'de çağırıyor. `Print.tsx` 262'de dönüyor, `useMemo`'yu 290'da çağırıyor. Liste
      boşken sekme açıksa ve Ctrl+Z ya da "Dosyadan aç" listeyi doldurursa React çökebilir.
      Kaynaktan okundu, ekranda denenmedi. Önce kırmızıya dönen bir E2E yazılır.
      Düzeltildi (2026-09-11, `511b8b4`): kancalar boş ekran dönüşünün üstünde. İki yeni
      E2E (`musaitlik.spec.ts`, `yazdir.spec.ts`) düzeltmeden önce React #310 ile kırmızıydı.
- [x] **Varlık panelinde ders aktarma bildirimi.** `Inspector.tsx:183-189` `returned`'ı
      `change()`'in geri çağırımında yazıp hemen ardından okuyor. `change` bir `useReducer`
      dispatch'i, yani bildirim büyük ihtimalle hep "0 blok" yolunu seçiyor. Tuzak 20'nin
      deseni. `LessonEdit.tsx` aynı işi önizleme çağrısıyla doğru yapıyor.
      Düzeltildi (2026-09-11, `492c8c2`): sayı `change()`'den önce bir önizlemeden geliyor.
      Yeni E2E (`panel.spec.ts`) düzeltmeden önce "510 dersi AV öğretmenine geçti." okuyordu.
- [x] **Çevrilmemiş sınır cümlesi — DÜZELTİLDİ (2026-09-25).** `constraints.ts`'teki "art
      arda en fazla N saat" mesajı `t()`'den geçmiyordu, beş dilde de Türkçe çıkıyordu. Artık
      komşu kuralın deseniyle çevriliyor. Yeni birim testi (`constraints.test.ts`, "cümle
      arayüzün dilinde çıkıyor") düzeltmeden önce İngilizcede Türkçe cümleyi okuyordu.
- [x] **ARCHITECTURE'ta iki yanlış cümle — DÜZELTİLDİ (2026-09-12).** Çözücü "en çok iki iş
      kalemi" kurmuyor, blok boyu başına bir kalem kuruyor ve en çok üç, çünkü `solver.ts`
      `[3, 2, 1]` üstünde dönüyor. Bu maddenin kendi atfı da bayattı: dosya bugün
      `src/pure/solver.ts` ve söz edilen `4` ölü dalı bugünkü kaynakta yok.
      `sanitize` `pure/constraints.ts`'te, `entities.ts` onu yalnız içe aktarıyor; dosya
      haritasının iki satırı da düzeldi. Haritanın kendisi zaten doğruydu (96 ada 96 dosya,
      `store.ts` bölünmesi işlenmiş, A2 kapısı tutuyor), yanlış olan yalnız bu iki cümleydi.
- [x] **DESIGN.md 489 815 baytı bugünkü değer gibi yazıyor — DÜZELTİLDİ (2026-09-12).**
      Tarihli ölçüm blokları geriye dönük düzeltilmedi, çünkü onlar o günün kaydı; düzelen şey
      onları bugünkü değer gibi okutan iki yer. Blokların başı artık bugünkü sayının nerede
      durduğunu söylüyor, ve "490 KB'lik tek dosya açılıyor" cümlesi geçmiş zamana çekildi.
      Ayrıca aynı turda iki bayat satır daha bulundu ve düzeltildi: [LAYOUT.md](LAYOUT.md) ile
      [DESIGN.md](DESIGN.md) hâlâ "`.pool-card` bekleyen bir blok demek" diyordu, oysa
      2026-09-01'den beri bir deste demek. İkisi de belge kapılarından geçen türden: cümle
      yanlış, adı geçen şey var.
- [ ] **Doğrulanacaklar.** Okuma sırasında bildirildi, kaynaktan tek tek açılmadı.
      İlki 2026-09-26'da üretildi ve düzeldi: Dersler formunda Enter Dağılım düğmesinde
      listeyi açmıyor, dersi ekliyordu; listedeki seçenekte de öyle (liste bir portal'da ve
      React olayları portal üstünden satıra kabarıyor). Satırın Enter'ı artık düğmelere
      karışmıyor, `dersler.spec.ts`'in yeni testi düzeltmeden önce kırmızıydı. İkincisi de
      üretildi: ızgarada odaklı kartta Enter ve Space, kısayol ekranının dediği gibi menüyü
      açmak yerine dersi sessizce havuza gönderiyordu. Kullanıcı menüyü seçti, düzeldi
      (`program.spec.ts`, iki yeni test kırmızıydı). Kalanlar: Dersler satırı ile `LessonEdit`'in günlük sınırın geri düşüşünde ve `blockCeiling`
      çağrısında ayrışması, `updateClass`'ın derslik değişince çakışmayı yargılamaması,
      `teacher.subject`'in üç yerde `lessonSubject()` yerine okunması, JSX'te `t()`'den
      geçmeyen yaklaşık 25 dize (`Print.tsx`, `Ribbon.tsx`, `Dialogs.tsx`, `ColorPick.tsx`,
      `Plans.tsx`, silme onaylarının `"Sil"`'i), `initialBox`'ın StrictMode altında yedek
      zincirini iki kez döndürmesi.
      2026-09-26 denetiminde `t()` maddesinin üç örneği üretildi: Dersler şeridinin
      toplamı ("99 ders · 433 saat", §8j DK13), plan seçicinin "(taslak)" eki ve kâğıdın
      çıktı tarihi (ikisi keşifte kaynaktan okundu, ekranda yalnız ilki görüldü).
      İlki 2026-09-27'de kapandı (DK13, `c9c66e5`); öteki ikisi ve listenin kalanı açık.
      **2026-10-08 refactor analizinde iki madde genişledi** (kaynaktan okundu, ekranda
      denenmedi, rapor `scratch/analiz-2026-10-08/rapor.md`, git dışında). `t()`
      listesinin bugünkü hâli, bir AST taramasıyla: görünür yaklaşık 24 yer, yalnız
      erişilebilir adda 8 yer ve elle yazılmış iki `'tr-TR'` (`Print.tsx:107`, `Data.tsx`).
      Görünür olanlar `App.tsx:835` (taslak eki), `Dialogs.tsx:196` ve `:214` (varsayılan
      düğme adları), `Ribbon.tsx:481`, `Print.tsx:452`, `:463`, `:545` ve `:683`,
      `ColorPick.tsx:60` ve `:78`, `lessons/index.tsx:604` ve `:818`, dört silme onayının
      `'Sil'`'i, `Palette.tsx:166`, `Data.tsx:194` ve `:210`, `Rules.tsx:152`,
      `Paste.tsx:105`, `Summary.tsx:198` ve `Plans.tsx:206`. Refactor dalında düzeltilmez,
      özellik işi (RF15, §8k). `teacher.subject` maddesine üç yer eklendi: `feasibility.ts`'in `lessonName`'i
      dersin ikinci branş bayrağını hiç okumuyor, `constraints.ts`'in sınıf dolu cümlesi ve
      `entities.ts`'in `entityWeek`'i de öğretmenin ilk branşını yazıyor.
- [x] **`e2e/surum.spec.ts` 107 2026-09-01'den beri kalıcı kırmızı.** Test "temiz profilde tek
      sürüm notu var" diye yazılmış, `0df5c9d` 2.1.1 notunu ekleyince arşivde bir `details`
      oluştu. Test kusuru, sayıyı değil değişmezi ölçmeli (tuzak 97). Kayıt TESTFINDINGS'te.
      Düzeltildi (2026-09-11, `de86a25`): en yeni sürümün maddelerini ve tek kapalı arşivi
      ölçüyor, arşivi açık çizmek ve sürüm sırasını çevirmek testi kırmızıya çeviriyor.
- [x] **Dört E2E testi paralel koşuda düşüp tek işçide geçiyor.** `dil.spec.ts` 70,
      `izgara.spec.ts` 360, `kurulum.spec.ts` 851, `renk.spec.ts` 39, dördü de depoya yazıp
      yeniledikten sonra okuyor. Sebep ölçülecek, "yük" diye yazılmadan (tuzak 92).
      Ölçüldü ve düzeltildi (2026-09-11, `eb3fb0f`): sebep yük değil `kapan.ts`'in dil tohumuydu.
      `file://` altında belge başında localStorage'a dokunan bir betik sonraki yenilemeyi
      zaman zaman bayat ya da boş depoyla başlatıyor (tuzak 108). Tohum yerine
      `locale: 'tr-TR'`. Planlar 98 ve 292 ile dil 83 dahil yedi test dört işçide beşer kez: 40/40.
- [ ] **ESLint'in ilk raporundaki `exhaustive-deps` uyarıları (2026-09-11).** Dördü de araç
      commit'ine girmedi, çünkü bir bağımlılık listesini değiştirmek davranışı değiştirebilir.
      2026-09-11'de sınıflandırıldı, satır numaraları o günkü. `Program.tsx:506`, `drop`'un
      `t`'si: kusur, üretildi, aşağıdaki ayrı madde; 2026-09-25'te düzeldi, geri çağırım artık
      `t` kullanmıyor. `useRowOrder.tsx:149`, `grip`'in `t`'si:
      bugün kusura yol açmıyor, çünkü dil yalnız Ayarlar → Görünüm'den değişiyor ve liste
      ekranları (Okul adımları, Dersler) o sırada sökülü, geri dönülünce kanca yeniden kuruluyor.
      Liste açıkken dil değiştiren bir yol eklenirse tutamağın adı ve ipucu eski dilde kalır.
      Kaynaktan okundu, ekranda denenmedi. `App.tsx:582`, palet eylemleri üç `toggle*`'ı
      saymıyor: kusur yok, üçü yalnız `theme`, `ribbon` ve `motion`'ı okuyor ve üçü de
      bağımlılıkta. `Commands.tsx:116`, gereksiz `ui` bağımlılığı: kusur yok, yalnız fazla
      hesap, komut listesi `ui` her değiştiğinde yeniden kuruluyor ama içeriği ona bağlı değil.
      `App.test.tsx:16`'da kullanılmayan bir `eslint-disable` yorumu var, o bir
      `exhaustive-deps` uyarısı değil.
- [x] **Program'da bırakınca çıkan bildirim, dil yenilemesiz değişince eski dilin kelimesini
      arıyor (2026-09-11) — DÜZELTİLDİ (2026-09-25).** `Program.tsx`'in `drop` geri çağırımı bildirimi
      `evictionNotice(...).replace(t('dönecek'), t('döndü'))` ile kuruyor ve `useCallback`
      bağımlılıklarında `t` yok. Program `Activity` içinde sekme değişince sökülmüyor, bu yüzden
      Ayarlar'da dil değişince geri çağırım programdaki ilk değişikliğe kadar eski `t`'yi tutuyor.
      Üretildi: Türkçe kurulup İngilizceye geçilince "the 510 · MÇ lesson will go back to the
      tray", yenilendikten sonra "went back". Kayıt TESTFINDINGS'te.
      2026-09-25'te ölçülünce kusur daha genişti: `.replace` yenilemeden sonra da Fransızcada
      hiç tutmuyordu ("retournera"), Almanca çoğulda cümleyi değiştirmiyordu, İspanyolca
      çoğulda "ha vuelton" yazıyordu. Geçmiş zaman artık kendi anahtarı
      (`evictionNotice(…, true)`), ve geri çağırım `t`'yi hiç kullanmıyor. Yeni E2E
      (`program.spec.ts`, "dil yenilemesiz değişince bırakma bildirimi…") düzeltmeden önce
      "retournera" okuyordu.
- [ ] **Kanonik olmayan bir anahtar `sanitize`'dan geçiyor ve görünmez kalıyor (2026-09-11).**
      `sanitize` bir yerleşim ya da kapalı saat anahtarını yeniden kurmuyor, sayıları tam
      sayıysa olduğu gibi kopyalıyor. Elle düzenlenmiş bir yedekteki `s510|0|07` ya da
      `s510|0| 7` bu yüzden depoda kalıyor, ama `placementKey(…, 7)` ile yapılan hiçbir
      aramada bulunmuyor. Kod refactoru bunu düzeltmedi, `remapDays` bilerek o parçayı
      saklandığı gibi taşıyor (`keyOnDay`). Kategori: veri kaybı.
      Nereden gelebilir: hiçbir sürüm ve hiçbir şema göçü böyle bir anahtar üretmiyor, kaynak
      yalnız elle düzenlenmiş bir metin (tek plan dosyası, paket, ya da localStorage'daki bir
      plan ya da yedek anahtarı). Hangi yoldan içeri girer, 2026-09-11'de kaynaktan sayıldı,
      altısı da `parseState` üstünden `sanitize`'a varıyor ve anahtarı olduğu gibi kopyalıyor:
      açılış (`initialBox`, `loadPlan`), plan geçişi ve plan silinince sıradakine geçiş
      (`usePlans.ts`), taslak başlatma (`DraftStart.tsx:40`), üst çubuktan tek dosya
      açma (`App.tsx:620`), Ayarlar → Veri'deki yedek zinciri (`listBackups`) ve paket
      (`Data.tsx:508`, `replaceLibrary`).
      Ne olur: sınıf ızgarası hücreyi boş, öğretmen ızgarası dolu gösterebilir, kart
      sürüklenemez, havuz aynı bloğu yine sunar ve aynı saate ikinci bir yerleşim konabilir,
      Kontrol ile kâğıt ayrışır, ve bir sonraki `sanitize` hayaleti sessizce silebilir.
      Seçenekler, karar kullanıcıda: (a) `sanitize` anahtarı kanonik biçimde yeniden kurar,
      iki anahtar aynı hücreye düşerse hangisinin kalacağı için bir kural gerekir. (b)
      `sanitize` kanonik olmayan anahtarı atar, yani elle yazılmış yerleşim kaybolur. (c)
      Dosya reddedilir, ama localStorage'dan açılışta reddetmek programı açılmaz yapar. (d)
      Şema 15 ile `parseState`'te bir kerelik göç, (a) ya da (b)'nin kuralıyla. (e) Bırakılır,
      elle düzenlemenin bedeli olarak. (f) Kontrol bu anahtarları raporlar, veriye dokunulmaz.
- [x] **%150'de Program şeridinde "İşlemler" düğmesi taşıyor (2026-09-11) — KAPATILDI (2026-09-12).** `serit.spec.ts`
      220 2026-09-01'den beri kırmızı ve haklı: IZGARA grubundaki "İşlemler" şeridin sağ
      kenarını 80,7 px aşıyor (düğme 120 px) ve şerit kaymıyor. Öteki altı şerit sığıyor.
      Sebep `516f963`'ün eklediği Renk grubu, bir kopyada gizlenince test yeşil. Ürün kusuru,
      tuzak 48'in sözü. Renk grubunun yeri ya da şeridin daralma kuralı için bir tasarım
      kararı bekliyor. Kayıt TESTFINDINGS'te.
      Kapatıldı (2026-09-12): önce %100'de ölçüldü ve orada taşma yoktu, yani kusur hedef
      kullanıcının ölçeğinde görünmüyordu, ama %125'te pay bir düğmeden dardı. Renk grubunu
      menüye indirmek yerine şeridin daralma kuralı yazıldı (LAYOUT.md, şerit standardı 6),
      çünkü tek bir grubu taşımak bir sonraki grupta aynı kusuru doğururdu. Karar DECISIONS'ta.
- [ ] **`e2e/exe.spec.ts` 248 bugün kırmızıya döndü, sebebi TARİH (2026-09-12).** Test
      `/2 Eylül 2026/` arıyor ve derleme damgası bugün `12 Eylül 2026` diyor, yani dize
      aranan deseni İÇERİYOR ve Playwright iki öğe bulup strict mode ihlali veriyor.
      Bir tarihi çapasız bir regex ile aramanın bedeli: test 2 Eylül'den 11 Eylül'e kadar
      yeşildi ve ayın 12'sinde kendiliğinden düştü, her ayın 12'sinden 19'una kadar yine
      düşecek. Refactorun kırmadığı ölçüldü: aynı test bölmeden önceki `34418b5`
      derlemesinde de birebir aynı şekilde düşüyor. Test kusuru, dosya test stratejisi
      dalının sahipliğinde.
      **2026-09-12 akşamı iki şey değişti.** Birincisi, bu test `npm run kontrol`'ü
      sonuna kadar koşmaktan alıkoyuyor: zincir `&&` ile bağlı, E2E orada duruyor ve
      site ile çözücü süitleri hiç koşmuyor (o gün ikisi elle koşuldu, ikisi de geçti).
      Yani kusur bir testi değil bir kapı zincirini kırmızı tutuyor, ve her ayın
      12'sinden 19'una kadar tutacak. İkincisi, dosyanın sahibi olan oturum kapandı,
      yani "onların işi" diye beklemek bir sahip beklemek değil artık. Çare bir satır
      (deseni çapalamak), karar sahiplikte.
      **KAPANDI (2026-09-12), kullanıcı kararıyla.** Çare deseni çapalamak değil, tarihi
      SÜRÜME bağlamak oldu: iki ayrı iddia (`/v1\.9\.0 çıktı/` ve `/2 Eylül 2026/`) tek bir
      cümleye indi, `/v1\.9\.0 çıktı \(2 Eylül 2026\)/`. Hem damgadan bağımsız hem de daha
      çok şey ölçüyor, çünkü artık tarihin duyurulan sürüme ait olduğunu da söylüyor.
      İki mutasyonla sınandı, ikisi de kırmızı: tohumdaki tarih bir gün ileri alındığında ve
      tarih hiç verilmediğinde. `e2e/exe.spec.ts` 10/10.
- [ ] **Belge başında depoya dokunan bir tarayıcı eklentisi `file://`'da bayat açılış üretir
      mi (2026-09-11).** Tuzak 108'in tetikleyicisi süitte `kapan.ts`'in başlangıç betiğiydi.
      Üründe belge başında depoya dokunan kod yok ve uygulama başlangıç betiği olmadan 780
      yenilemede bir kez bile bayat açılmadı. Bir eklentinin `document_start` betiği aynı yolu
      açabilir. Başlangıç betikli 800 turda her bayat açılış 3 sn içinde düzeldi ve kalıcı kayıp
      olmadı, ama boş görünen bir oturumda yapılan değişikliğin gerçek planın üstüne yazılıp
      yazılmadığı ölçülmedi.
- [x] **Yavaş işlemcide ilk kare tercihlerden önce boyanıyor (2026-09-11) — KAPATILDI (2026-09-12).** `main.tsx`
      tercihleri `<html>`'e modül betiğinin başında yazıyor. 4 kat yavaşlatılmış Chromium'da
      ilk boyama (yaklaşık 150 ms) bu yazımdan (yaklaşık 213 ms) önce geliyor, 18 açılışın
      17'sinde. Karanlık tema kayıtlıysa ilk kare 9 açılışın 8'inde açık zeminle boyanıp
      karanlığa dönüyor. x1'de olmuyor. Kapatmak bir davranış değişikliği, örneğin tercihleri
      modülden önce koşan küçük bir betikle yazmak, ve karar bekliyor. Kayıt TESTFINDINGS'te.
      Kullanıcı kararı (2026-09-12): `<head>`'e klasik bir betik, yalnız tema. Ölçüldü,
      karanlık profilde x4'te açık ilk kare 9/9'dan 0/9'a indi, `dist` +693 bayt. Tuzak 108
      kapısı ayrıca ölçüldü ve geçildi. Karar DECISIONS'ta, ölçümler TESTFINDINGS'te.
      Ölçek, yoğunluk, şerit ve müsaitlik saati `main.tsx`'te kaldı, çünkü düzen kaymaları
      0,0002'nin altında ve görünür bir fark üretmiyorlar.
- [x] **Refactor turunda karar bekleyen üç soru.** Kanca sırası ve varlık paneli düzeltmeleri
      Faz 2'den önce ayrı commit'lerle mi yapılsın. Prettier ile toplu bir biçim commit'i
      yapılsın mı. Yalnız testten çağrılan fonksiyonlar (`validHours`, `blockStart`, `evict`,
      `deletionSummary`, `activePlan`, `nextPlanName`) testleriyle silinsin mi. Kullanıcı
      kararı (2026-09-11): üçüne de evet. Kanca sırası ve varlık paneli önce, her biri
      kırmızı bir E2E ile ve ayrı commit'te. Prettier ayrı ve yalnız başına bir commit.
      Altı fonksiyon testleriyle silinir. Commit'ler `docs/claude-md-bolme` dalına gider.

### 8e · Erişilebilirlik taramasının bıraktıkları (2026-09-12)

`e2e/erisim.spec.ts` on bir ekranı axe-core ile taradı ve bulduklarını düzeltmeden
listeledi, çünkü bir kısmı bilerek olabilir. Her madde bir karar bekliyor, ve
karar verilip düzeltilince testteki `BILINEN` tablosundan da çıkar. Renk kontrastı
bu taramanın dışında, onu `renk.spec.ts` zaten daha iyi ölçüyor.

- [ ] **`region` · on bir ekranın on birinde, her seferinde tek düğüm ve hep aynısı: `.ribbon`.**
      Araç şeridi `<main>`, `<nav>` ve `<header>`'ın dışında duruyor, yani ekran
      okuyucunun bölge listesinde bir yeri yok. Tek bir karar on bir satırı birden
      kapatıyor: şeridi bir `<header>` ya da `role="toolbar"` taşıyan bir bölgeye
      almak. Etkisi: şerit klavyeyle zaten geziliyor, eksik olan "burası ne" cevabı.
- [ ] **`label` · Okul'da 8, Dersler'de 6, Ayarlar → Kurallar'da 6 giriş kutusu.**
      Kritik seviye. Kutular tablo satırlarının içinde ve başlıkları sütun
      başlığından okunuyor, yani gören bir kullanıcı için etiketli, ekran okuyucu
      için etiketsiz. Muhtemel çare `aria-label` ya da `aria-labelledby` ile sütun
      başlığına bağlamak. Ölçülmeden yazılmaz: bu kadar çok kutuya etiket eklemek
      `metin.spec.ts`'in taradığı metni de değiştirebilir.
- [ ] **`label-title-only` · Dersler'de 6 kutu.** Etiketi yalnız `title`'da. Ciddi
      seviye ve yukarıdaki maddenin akrabası: `title` bir ad üretir ama yalnız fare
      için görünür.
- [ ] **`empty-table-header` · Program 6, Okul 2, Müsaitlik 2, Dersler 2, Ayarlar'da 2.**
      Küçük seviye. Boş başlık hücreleri: tutamak sütunu (`.grip-col`), ızgaranın
      köşesi ve gün bandının ayraçları. Bunların çoğu **bilerek boş**, çünkü bir
      başlıkları yok. Karar: `scope` kaldırmak mı, `aria-hidden` mı, yoksa gerçekten
      bir ad vermek mi.
- [ ] **`heading-order` · Program'da 1, Çıktı'da 1.** Kart panelinin ve baskı
      sayfasının başlığı `h3`, ondan önce gelen bir `h2` yok. Baskı sayfasında
      `h3`'ün bir gerekçesi olabilir (kâğıtta punto), ama düzey ile punto ayrı şeyler.
- [ ] **`scrollable-region-focusable` · Program'da havuz (`.pool-list`), Ayarlar → Hakkında'da yan panel.**
      Ciddi seviye. Fareyle kaydırılan ama klavyeyle odaklanamayan bir kutu, yani
      içeriğinin bir kısmına klavyeyle hiç ulaşılamıyor. Çare `tabindex="0"`, ve
      havuzda bunun sürükleme ile etkileşimi ölçülmeden dokunulmaz (tuzak 13).

### 8f · Test stratejisinden sıraya konanlar (2026-09-12)

Test turunun beşi yapıldı (mutasyon, şema örnekleri, değişmezler, erişilebilirlik
taraması, satır içi anlık görüntüler). Bu ikisi düşük öncelikli ve bilerek
ertelendi.

- [ ] **Performans bütçesi: ölçüm var, kapı yok.** `dist/index.html` boyutu ve açılış
      süresi her turda ölçülüp WORKLOG'a yazılıyor ama hiçbir eşik aşıldığında kırmızıya
      dönmüyor, yani bir sürüm iki kat yavaşlayarak çıkabilir. Eşiğin kendisi ölçülerek
      seçilir, ve bugünkü değerin biraz üstüne konur: bugünkü değere yapışan bir bütçe her
      commit'te kırmızıya döner ve kapatılır.
- [ ] **Fuzz: `import.ts` bozuk girdiyle.** Bozuk CSV, bozuk JSON, yarım UTF-8, çok
      büyük dosya. Excel'den yapıştırma ilk kurulumun ana yolu ve oraya gelen şey
      kullanıcının panosu, yani beklenen biçimde olmak zorunda değil. `parseState.ts`
      bozuk girdiye zaten bozuk girdiye `null` diyor ve testleri var; ölçülmemiş olan
      `import.ts`.
- [x] **Örnek dosya testi dersin şeklini ve ayarları da doğrulasın.** (2026-09-12'de
      yapıldı. Her sürüm dosyası için dersin şekli, ayarlar, öğretmenin ve sınıfın
      kutuları, renkler ve program zarfı iddiaya döndü, yanına bir alanı çıkarılmış
      dosyaları okuyan bir bölüm eklendi, ve örnek dosyaların varsayılanla çakışan
      değerleri ölçülebilir olsun diye değiştirildi. o gün `store.ts` adını taşıyan dosyanın (bugün `parseState.ts`) mutasyon skoru 63,7'den
      71,6'ya çıktı, ayrıştırma yarısı 77,8'den 88,9'a. Ölçüm TESTFINDINGS'te.
      Çıkardığı iki ürün kusuru §8g'de.) Mutasyon koşusu
      (2026-09-12) aynı dosyanın ayrıştırma yarısında 130 hayatta kalan mutant buldu ve
      hepsi tek cümleye çıkıyor: test ızgarayı ve adları doğruluyor, dersin şeklini ve
      ayarları doğrulamıyor. Eklenecek iddialar ve onları isteyen satırlar:
      `readLessons`'ın sürüm sınırları (`version >= 9`, v13'ün dörtten üçe çevirmesi,
      v7/v8'in `pairs`'i, v6 ve öncesinin `blockSize`'ı, v8'in `second` bayrağı),
      `readDays`, gün listesi boşken varsayılana düşme, zil saatleri, öğretmenin sınır
      kutuları, program zarfının kimliği ve adı, ve v1/v2 göçü. Sürüm dosyaları zaten
      var, eksik olan iddia.
- [ ] **`library.ts`'in üç boşluğu.** Aynı koşudan: (a) `renamePlan`, `setDraft` ve
      `removePlan`'ın üçünde de "yalnız adı geçen plan değişir" hiçbir yerde
      doğrulanmıyor, üçünde de koşulu `true` yapmak süiti yeşil bırakıyor; (b)
      `parseLibrary`'nin çöp kapıları: nesne olmayan bir üst düzey, boş bir `plans`
      dizisi, var olmayan bir plana işaret eden `activeId`; (c) `removePlan`'ın olmayan
      bir kimlikle çağrılması ve `uniquePlanName`'in boşluk kırpması.
- [ ] **Kalan 558 mutantı tek tek sınıflandır.** 769 hayatta kalanın 125'i mekanik
      desenle ayrıldı (erişilemeyen savunma, kullanılmayan yedek, `sanitize` sonrası ölü
      kapı) ve 86'sı `StringLiteral`. Geri kalan 558 okunmadı. Her biri ya ölçülmeyen bir
      davranış, ya silinebilecek bir kod dalı, ya da anlamsız bir mutant, ve ayrılmadan
      liste bir iş listesi değil. En yoğun yer `constraints.ts` (179) ve o gün store.ts adını taşıyan dosya (161, bugün bölündü).
      Sınıflandırmanın okuyarak yapılamayacağı ölçülerek görüldü. `constraints.ts:820`
      (`i < block.size` yerine `i <= block.size`) okuyunca bariz bir gerçek boşluk gibi
      duruyor: `dropMap`'in doluluk haritasına bloğun bittiği hücrenin bir sonrasını da
      yazıyor. Kurulabilen bir dünyada denendi (tek gün, dört saat, iki saatlik bir blok
      ve tek saatlik bir ders) ve `dropMap`'in çıktısı dört hücrenin dördünde de birebir
      aynı çıktı, birim süiti de mutasyonla yeşil kaldı. Yani ya eşdeğer bir mutant ya da
      farkı gösteren durum bulunamadı. Her mutant için bu kadar iş var, ve okuyarak
      verilen bir karar bu turda bir kez zaten yanlış çıktı.
- [x] **`solver.ts` mutasyonla ölçülemiyor, iki satır yüzünden — BİTTİ (2026-09-12).**
      `src/pure/solver.ts:530-531` `classOnDay[g] = classOnDay[g]! + 1` biçiminde yazıldı
      (`!` kaldı, `noUncheckedIndexedAccess` açık), dosya `stryker.config.json`'ın listesine
      girdi, `_comment_solver` kalktı ve [TESTPLAN.md](TESTPLAN.md)'in mutasyon listesi aynı
      commit'te güncellendi, çünkü A9 kapısı iki listeyi küme olarak karşılaştırıyor.
      Davranış birebir aynı: `solver.test.ts` 93/93, ve çözücü stresi 7/7 ile kalite sayıları
      kayıtlı değerlerin aynısı (`gercek-olcek-sikisik` sınıf deliği 273).
      Aşağısı sebebin kaydı. Stryker'in enstrümantasyonu `classOnDay[g]!++` biçimini
      ayrıştıramıyordu (`UpdateExpression` içinde `TSNonNullExpression`) ve bütün koşuyu
      düşürüyordu, o yüzden çözücü hiç ölçülmemişti. Ölçüm TESTFINDINGS'te, 2026-09-12.
- [ ] **Süiti inceltme, Faz 4'te.** "E2E süiti çok mu büyük" sorusu duruyor ama cevabı refactor
      bitmeden aranmayacak, çünkü ağın kendisi refactorun güvencesi. Sıra: önce dosya ve
      test başına süre ölçülür, sonra en pahalı yüzde on mutasyonla sınanır, sonra
      katmanlar arası örtüşme bulunur. Bir test ancak üç şeyden biri doğruysa silinir:
      hiçbir şey ölçmüyorsa, başkasının ölçtüğünü tekrar ölçüyorsa, ya da ölçtüğü davranış
      artık yoksa. **Yavaş olmak tek başına silme gerekçesi değil**; silmeden önce
      hızlandırma denenir (paylaşılan derleme, işçi sayısı, kendi tarayıcısını açan
      dosyaların azaltılması).
- [ ] **On birinci belge kapısı adayı: TODO'nun canlı bölümünde aynı numara iki maddede.**
      2026-09-12'de tarandı ve iki çakışma bulundu, ikisi de canlı bölümde: `B4.9` hem
      tahliye kurbanına hem Program açılışına, `B7.13` hem yedek dosya adına hem exe
      penceresine verilmişti. İkisi de numarayı daha çok atıfı olan tarafa bırakarak
      çözüldü (tahliye kurbanı `B4.12`, yedek dosya adı `B7.15`). Kapı kurulmadı,
      çünkü iki örnek bir kapıyı hak edecek yoğunluk değil ve bir kapının bedeli
      koşu süresi. Kurulursa şekli belli: arşiv sınırının (`## §10`) üstünde kalan
      `**B<n>.<m>` başlıklarını toplar ve aynı numaranın iki kez geçtiği yeri söyler.
      Üçüncü bir çakışma çıkarsa bu madde kapıya dönüşür.

### 8i · Klasör turundan çıkanlar (2026-09-12)

- [x] **`store.ts` bölündü (2026-09-12), parçaları doğrudan yeni yapıya indi.**
      Altı modül: `pure/parseState.ts` (kaydedilmiş dosyanın okuyucusu ve göçler),
      `pure/undo.ts` (geri al yığını), `platform/planStore.ts` (planın deposu ve yedek
      zinciri), `platform/download.ts` (diske inen dosya), `platform/usePlans.ts` (plan
      kitaplığı işlemleri) ve `platform/useStore.ts` (kutu, otomatik kayıt, kısayol).
      İlk ikisi katman düzeltmesi: ikisi de saftı ve `platform/`'da duruyordu.
      Bölmeden önce `src/storeContract.test.ts` yazıldı, beş değişmezin hepsi orada.
- [x] **Araçların kalanı kuruldu (2026-09-12), biri hariç.** C3 demet analizi
      (`rollup-plugin-visualizer`, bayrak arkasında, sayıları minify öncesi ve bu
      sınır yazılı), C4 `size-limit` (iki eşik, `kontrol`'ün içinde, mutasyonla
      sınandı), C5 tip farkında ESLint (dört kural, `strictTypeChecked`'ın 1228
      bulgusu sınıf sınıf okunarak seçildi, lint artık `kontrol`'ün parçası),
      C7 Dependabot artı `pr.yml` (bir PR'ın üstünden süiti geçiren ilk iş akışı).
- [ ] **C6 kapsam ölçümü — test oturumunun cevabını bekliyor.** Soru: ayrı bir
      komut mu olsun yoksa mutasyonun yanında mı dursun, ve `kontrol`'e girsin mi.
      Ölçüm turunun görüşü ayrı komut yönünde (kapsam bir kapı değil bir harita),
      karar kullanıcıda. Kurulmadan önce cevap beklenecek.

### 8g · Şema göçünden çıkan ürün kusurları (2026-09-12)

Örnek dosya testine dersin şekli ve ayarlar iddiası eklenirken çıktılar. İkisi de
üretim kodunda, yani test tarafının işi değil, ve ikisi de `src/fixtures.test.ts`'te
`BİLİNEN KUSUR` adlı vakada çiviliydi. 2026-09-25'te düzeldi, vaka adıyla kırmızıya döndü
ve yerini doğru davranışı soran bir teste bıraktı.

- [x] **v1 ve v2 yolu sınıfları normalize etmeden geçiriyor — DÜZELTİLDİ (2026-09-25).** `pure/parseState.ts`'teki
      `migrateV2toV3` sınıfları çıplak bir `asArray` ile alıyor, yani v3 ve
      sonrasının aynı liste üstünde koşturduğu `asBox` ile `spreadColors`'tan
      geçmiyorlar. Sonucu iki tane. Sınıfın günlük kutusu `null` yerine `undefined`
      geliyor ve Ayarlar → Kurallar'ın `!== null` soran süzgeci (`Rules.tsx:75`) bir
      v1 ya da v2 yedeği açılınca bütün sınıfları "kendi sınırı olan sınıflar"
      tablosunda sayı hücresi boş olarak listeliyor. Ve hiçbir sınıf renk almıyor,
      hepsi paletin ilk rengiyle boyanıyor (iki dosyanın iki sınıfı için de
      `#c3a2cd` ölçüldü), oysa aynı renksizliği taşıyan v3 ve v4 dosyaları 0 ve 1
      alıyor. Renk bu programda bir kimlik ([DATA.md](DATA.md)). Etkisi yedeğin
      açıldığı oturumla sınırlı, çünkü ilk kayıttan sonra dosya bugünkü yoldan
      okunuyor. Çaresi muhtemelen tek satır: o iki listeyi ana yolun geçtiği
      okuyuculardan geçirmek. Ölçüm TESTFINDINGS'te, 2026-09-12.
      Düzeltme tek satır oldu: `migrateV2toV3` sınıfları v3 ve sonrasının `asBox` ve
      `spreadColors`'undan geçiriyor. "BİLİNEN KUSUR" vakası adıyla kırmızıya döndü ve doğru
      davranışı soran bir teste çevrildi, eski kaynakla kırmızı. v1 ve v2 örnek dosyası
      Chromium'da açıldı: iki sınıf iki renk, "Günde aynı ders" boş, Kurallar listesi boş.

### 8j · Denetimin bulguları (2026-09-26)

**2026-09-27: on üçü de kapandı**, her biri kendi commit'inde, kullanıcının DK8, DK9,
DK11, DK5, DK12 ve DK6 için verdiği kararlarla (DECISIONS 2026-09-27). Kullanım
kolaylığı sorunları (KS) ve öneriler (Ö) DENETIM.md'de açık, TODO'ya henüz taşınmadı.

Elle denetimin ürettiği kusurlar. Her birinin tekrar üreten adımları, beklenen ve olan,
ve ekran görüntüsü [DENETIM.md](DENETIM.md)'de, maddenin sonunda yazılı bölümde.
Kullanım kolaylığı sorunları ve öneriler orada, burada yalnız kusurlar. Veri kaybı
sınıfındaki üçü denetim sırasında kullanıcıya ayrıca söylendi.

- [x] **DK8 Bir günü kaldırmak ya da günlük ders sayısını düşürmek dizili ve sabitli dersleri sorusuz siliyor.**
      Şiddet: veri kaybı (koşullu). Örnek okulda Pazar'ın işareti kalkınca 65 saat,
      65'i sabitli, havuza döndü. Günü geri işaretlemek getirmiyor. Ctrl+Z odak onay
      kutusundayken çalışmıyor (`isTextInput()` her INPUT'u yazı kutusu sayıyor), yalnız
      üst çubuktaki Geri al düğmesi kurtarıyor. DATA.md'nin "Bilinen tek istisna"
      cümlesiyle ve PRINCIPLES "Veri kaybı olmaz" ile çelişiyor. DENETIM A1.
      Kapandı 2026-09-27, dced6e4. Test: ayarlar.spec.ts 32'nin üç vakası (kaybı soruyor, Ctrl+Z geri getiriyor, günlük ders sayısı), storeContract.test.ts onay kutusu vakası, entities.test.ts settingsLoss.
- [x] **DK9 "Ders adları"na az ad yazmak günü kısaltıp dersleri siliyor.**
      Şiddet: veri kaybı (koşullu). Dört ad yazınca 433 yerleşimden 245'i ve 36 sabitleme
      sorusuz kalktı, "Günlük ders sayısı" kutusu 12 göstermeye devam etti. DENETIM A1.
      Kapandı 2026-09-27, b4c6079. Test: ayarlar.spec.ts 32 "ders adlarına az ad yazmak günü kısaltmıyor" ve "fazla ad", entities.test.ts hourLabels.
- [x] **DK11 Öğretmeni ve dersi olmayan bir dosya geçerli sayılıp planı boşaltıyor.**
      Şiddet: veri kaybı (onaydan sonra). `teachers` ve `lessons` alanları silinmiş bir
      plan dosyası Dosyadan aç ile "Yedeği yükle"den sonra 0 öğretmen, 0 ders ve 0
      yerleşimle yükleniyor, geri al kapalı. Onay sorusu dosyanın içeriğini söylemiyor.
      DENETIM E6.
      Kapandı 2026-09-27, 536528f. Test: temel.spec.ts 29 "öğretmeni ve dersi olmayan dosya eksik diye reddediliyor" ve "yükleme sorusu dosyayı açık planla yan yana sayıyor", fixtures.test.ts "Dosyadan aç kapısı" vakaları.
- [x] **DK1 Sınıf ve derslik panelinde Ad kutusuna tıklayıp çıkmak adı değiştiriyor.**
      Şiddet: yanlış sonuç. Kutunun `defaultValue`'su başlık için biçimlenmiş ad ("320
      sınıfı", "A dersliği") ve `rename()` blur'da değişikliğe bakmadan yazıyor
      (`src/ui/Inspector.tsx`). Her açıp çıkışta bir "sınıfı" daha ekleniyor. DENETIM P1.
      Kapandı 2026-09-27, 46011b2. Test: panel.spec.ts 87 "sınıfın Ad kutusuna girip çıkmak adı değiştirmiyor" ve "dersliğin Ad kutusuna girip çıkmak adı değiştirmiyor".
- [x] **DK5 Durdurulan öneri araması "yol bulunamadı" diye bitmiş gibi sunuluyor.**
      Şiddet: yanlış sonuç. Fikstürde arama iki saniyedeyken Durdur: "Sınıfların saatlerine
      dokunmadan bir yol bulunamadı." Sürdürülünce altı yol buluyor. Durdurulmuş bir
      aramanın inceltilmemiş yolu da sıradan bir yol gibi kalıyor. DENETIM P12, P13.
      Kapandı 2026-09-27, 61cb429. Test: otomatik.spec.ts 22 "durdurulan öneri araması durdurulduğunu söylüyor ve sürdürülebiliyor", relaxWorker.test.ts.
- [x] **DK7 Kontrol'ün hükmü ve Durum'u kapalı saatteki dersleri görmüyor.**
      Şiddet: yanlış sonuç. Dokuz ders kapalı saatteyken hüküm "Sorun görünmüyor …
      Program dizilebilir.", şerit "0 engel, 0 uyarı", aynı anda "Sorunlar (9)" ve kırmızı
      çip. DENETIM K1.
      Kapandı 2026-09-27, ed0e158. Test: feasibility.test.ts "kapalı saatte kalmış ders sorunu KIRMIZI yapıyor ve sayıyor" (hard, hasProblem), kontrol.spec.ts "kapalı saatte kalan ders sayılıyor ve sebebi yazıyor".
- [x] **DK4 Geri almadan sonra gerekçe satırı olmayan bir başarıyı söylüyor.**
      Şiddet: metin. Öneriyi uygula, Ctrl+Z: satır yeşil "Öneri uygulandı ve program
      yerleştirildi" diyor, çip "7 ders sığmıyor". Exe'de de üretildi. Aynı aile: Okul'da
      geri alınan bir sıralamanın cümlesi. DENETIM P12, O7, T4.
      Kapandı 2026-09-27, 98e8a56. Test: otomatik.spec.ts 22 "geri alınan önerinin başarı cümlesi kalmıyor" ve "geri alınan dizmenin cümlesi kalmıyor", sira.spec.ts 61 "geri alınan taşımanın cümlesi kalmıyor"; Linux exe'sinde sürücüyle görüldü.
- [x] **DK2 Olmayan bir takasın gerekçesi takas ortağını gösteriyor, asıl engeli değil.**
      Şiddet: metin. MÇ'nin 310'u 431'in üstüne: "MÇ Çarşamba 10 saatinde 431 sınıfında",
      oysa engel 431'in dersliğinin o saatte dolu olması. DENETIM P6.
      Kapandı 2026-09-27, 5ec5fc5. Test: constraints.test.ts "reddedilen takasın cümlesi asıl engeli söylüyor, takas ortağını değil"; tarayıcıda denetimin adımıyla görüldü.
- [x] **DK10 Daha yeni sürümün plan dosyası "okunamadı" diye reddediliyor.**
      Şiddet: metin. "Daha yeni bir sürümle yazılmış" dalı yalnız paket dosyasında
      çalışıyor (`src/ui/App.tsx`), `e2e/temel.spec.ts` bugünkü cümleyi bekliyor. DENETIM E6.
      Kapandı 2026-09-27, 36cf42f. Test: temel.spec.ts 29 "bilinmeyen (ileri) şema sürümü tahmin edilmiyor" (yeni cümleye çekildi), fixtures.test.ts "daha yeni sürümün dosyası okunamadı değil yeni sayılıyor".
- [x] **DK12 Kimya'nın kısaltması dört dilde "kim?" diye çevrilmiş.**
      Şiddet: metin. `src/leaf/lang/*.ts`'te `Kim` anahtarı "Who", "Wer", "Quién", "Qui".
      Müsaitlik şeridindeki "Kim" ile Kimya'nın kısaltması tek anahtara düşüyor. DENETIM X2.
      Kapandı 2026-09-27, a77b751. Test: i18n.test.ts "bir kısaltma aynı yazılan bir cümleye düşmüyor: Kimya Who değil" ve "her yerleşik kısaltmanın dört dilde de karşılığı var".
- [x] **DK13 Dersler şeridinin toplamı çevrilmiyor.**
      Şiddet: metin. İngilizcede "TOTAL 99 ders · 433 saat". §8d'deki "`t()`'den geçmeyen
      JSX metinleri" şüphesinin üretilmiş bir örneği. DENETIM X2.
      Kapandı 2026-09-27, c9c66e5. Test: dil.spec.ts 82 "Dersler şeridinin toplamı çevriliyor".
- [x] **DK3 Yatay kaydırınca Program ızgarasının köşe hücresi saat başlıklarının altında kalıyor.**
      Şiddet: görsel. 40 px kaydırmak yetiyor, "ÖĞRE" okunuyor. DENETIM P11.
      Kapandı 2026-09-27, 011af8d. Test: program.spec.ts 3 "yatay kaydırınca köşe hücresi saat başlıklarının üstünde kalıyor".
- [x] **DK6 Müsaitlik'te öğle arasından sonraki saatin başlığı saatsiz ve kaymış.**
      Şiddet: görsel. Öğle arası günden güne değişince 6. sütunun saat kutusu boş kalıyor
      ve numara yaklaşık 7 px aşağı iniyor. DENETIM M3.
      Kapandı 2026-09-27, 4f072ad. Test: musaitlik.spec.ts 10 "saati boş kalan sütunun numarası ötekilerle aynı hizada" (Saatler kapalı ve açık).

### 8k · Refactor analizinin bıraktıkları (2026-10-08)

Kaynak 2026-10-08'in delta analizi: rapor ve betikler `scratch/analiz-2026-10-08/`
altında, git dışında, özeti [WORKLOG.md](WORKLOG.md)'nin aynı günkü girdisinde.
Bulgular RF1 ile RF20 arası adını taşıyor (raporda R16, burada RF16), refactor dışı
kusurlar RK1'den başlıyor. Refactor dalında davranış değişmez, kararlar ve park
gerekçeleri [DECISIONS.md](DECISIONS.md)'de (2026-10-08).

**Bulgular, tek satırda.**

| RF | Ne | Nerede |
|---|---|---|
| RF1 | `relax.ts` dokuz soruyu cevaplıyor, modüllere taşınır | `src/pure/relax.ts` |
| RF2 | iki kısıt yazımının sapmasını ölçen test yok | `src/invariants.test.ts`, `src/relax.test.ts` |
| RF3 | `relax.ts` ve `sat.ts` ne mutasyon ne kapsam listesinde | `stryker.config.json`, `vite.config.ts` |
| RF4 | `createSolver` iki algoritmayı tek closure'da taşıyor | `src/pure/solver.ts` |
| RF5 | `entities.ts` yaklaşık on dört soruyu cevaplıyor | `src/pure/entities.ts` |
| RF6 | `constraints.ts` motorun yanında ızgara, bırakma ve `sanitize` taşıyor | `src/pure/constraints.ts` |
| RF7 | çözücü, öneri, fizibilite ve kısıt motorunda kopya yardımcılar | dört dosya |
| RF8 | iş mantığı bileşende (Program, Ribbon, Check, Summary, Suggestions, Grid ile Print) | `src/ui/` |
| RF9 | öğretmen ve sınıf kâğıdı `Print()`'in içinde, ayrı üretilemiyor | `src/ui/Print.tsx` |
| RF10 | şerit tek fonksiyonda yedi sekme | `src/ui/Ribbon.tsx` |
| RF11 | App'te tercih aynaları ve içinden geçen prop'lar | `src/ui/App.tsx` |
| RF12 | liste ekranlarının ortak iskeleti kopya | `src/ui/setup/`, `src/ui/lessons/` |
| RF13 | çözücü ile öneri aramasının yaşam döngüsü kancada, birim testi yok | `src/platform/useSolver.ts` |
| RF14 | bütün kimlikler aynı `string` tipi | `src/leaf/types.ts` |
| RF15 | `t()`'den geçmeyen dizeler (özellik işi, §8d) | `src/ui/` |
| RF16 | worker'ın satır içi betik yolunu yalnız gerçek exe süiti ölçüyor | `src/platform/relaxPool.ts` |
| RF17 | `withGlobalTauri` ile `<Activity>`'nin sözleşmesini ölçen test yok | `src-tauri/tauri.conf.json`, `src/ui/App.tsx` |
| RF18 | ölü CSS, okunmayan token ve bayat belge cümleleri | `src/styles.css`, belgeler |
| RF19 | `Math.random` ile önbelleksiz `localeCompare` | `src/pure/entities.ts`, `src/pure/listview.ts` |
| RF20 | `theme.ts`'te her tercih iki adla dışa aktarılıyor | `src/platform/theme.ts` |

**Refactor planı.** Adımlar sırayla, her biri bir öncekinin testleri yeşilken.

- [x] **Refactor adım 0 · belge kaydı.** WORKLOG'un girdisi, bu bölüm ve DECISIONS'ın
      kaydı. `tsconfig.tsbuildinfo` git'ten ayrı bir commit'le çıkar.
      Bitti 2026-10-09, `refactor/yapi` dalında: "Belgeler: refactor analizinin kaydı,
      planı ve kararları" ve "tsconfig.tsbuildinfo git'ten çıktı".
- [x] **Refactor adım 1 · yalnız testler (RF16, RF17, RF2'nin ilk yarısı).** RF16:
      derlenmiş betiğin klasik bir worker olarak derlendiği (`e2e/temel.spec.ts`) ve
      öneri aramasının Chromium'da worker'da koştuğu (`e2e/otomatik.spec.ts`). RF17:
      `withGlobalTauri` (`src/surum.test.ts`) ve Program sekmesinin gizlenince
      sökülmediği (`e2e/program.spec.ts`). RF2: `maxConsecutive` ile `maxPerDay`'i tek
      başına bağlayan dünyalar (`src/relax.test.ts`) ve değişmez üretecinin ilişki ve iki
      sınırla genişlemesi (`src/invariants.test.ts`). Üretim koduna dokunulmaz. Adım 6'nın
      önkoşulu.
      Bitti 2026-10-09, `refactor/yapi` dalında, beş "Test:" commit'iyle (RF16, iki RF17,
      iki RF2; konuları WORKLOG'un 2026-10-09 refactor girdisinde). Her test bir mutasyonla kırmızıya döndü, analizin sekiz
      mutasyonunun sekizi de artık kırmızı (WORKLOG 2026-10-09). `npm run kontrol` yeşil.
- [ ] **Refactor adım 2 · RF2'nin ret sayısı, RF3 ve gecelik mutasyon tabanı.** Önce
      ayrı bir içerik commit'i: `RelaxResult`'ta düz bir `rejected` sayısı (aramanın
      kurduğu ama `verifySuggestion`'ın reddettiği hafta), ve `invariants.test.ts`'in
      öneri değişmezi her dünyada 0 bekliyor. Adım 6'dan buraya alındı (DECISIONS
      2026-10-08, refactor kaydının 2026-10-09 notu): sayı yokken bozuk bir kodlamayı
      denetim eliyor ve taban skoru yanıltıcı olurdu. Bu yarısı bitti (2026-10-09, "Test:
      öneri aramasının reddettiği hafta sayılıyor, değişmez 0 bekliyor"): analizin M1, M2 ve
      M3'ü yeni iddiayla kırmızı. Sonra `relax.ts` ve `sat.ts`
      mutasyon ve kapsam listelerine girer, [TESTPLAN.md](TESTPLAN.md)'nin listesi aynı
      commit'te (A9 kapısı). Adım 1'e bağlı.
- [ ] **Refactor adım 3 · RF18.** Ölü sınıflar (`.btn.link`, `.panel-grid`, `.subbar`,
      `.suggestion-part`), okunmayan dört token, bayat yorum, ve belgelerin bayat
      cümleleri: ARCHITECTURE'ın Ribbon'a "iş mantığı yok" demesi, "Otomatik diz (N)"in N'ini
      `entities.ts`'e vermesi ve çözücünün kendi denetimlerini eksik sayması, BUILD'in
      lint için "dört uyarı" demesi, DESIGN ile LAYOUT'un ölü sınıfları anlatması.
      `--ink` burada değil, RK1.
- [ ] **Refactor adım 4 · RF8, sonra RF9.** Önce karakterizasyon birim testleri, sonra
      iş mantığının saf katmana taşınması. Sonra öğretmen ve sınıf kâğıdının saf modeli.
      RF9 babanın gönderme isteğinin (B3.8) önkoşulu ve RF8'e bağlı.
- [ ] **Refactor adım 5 · RF12, RF10, RF11, RF20.** Liste ekranlarının iskeleti, şeridin
      sekme başına bölünmesi, tercih aynalarının React'in `useSyncExternalStore`'u ile
      kalkması, `theme.ts`'in çift adları. RF10 RF8'e, RF20 RF11'e bağlı.
- [ ] **Refactor adım 6 · RF2'nin kalan maddesi, sonra RF1.** Taşımadan önce bir içerik
      commit'i: boş ızgarada her blok için SAT kodlamasının izin verdiği başlangıçlar
      `blocker()`'ınkilerle aynı küme. Bugün `relax.ts`'ten bir dışa aktarım istiyor. RF2'nin
      öteki maddesi, ret sayısı, adım 2'ye alındı (2026-10-09). Sonra `relax.ts`'in
      modüllere taşınması. Adım 1 ve 2'ye bağlı.
- [ ] **Refactor adım 7 · RF5 ve RF6.** `entities.ts` ile `constraints.ts`'in yalnız
      taşımayla bölünmesi. `buildIndex`, `occupy` ve `vacate` yerinde ve olduğu gibi kalır.
      Mutasyon listesinin yolları aynı commit'te.
- [ ] **Park: RF4, RF7, RF13, RF14, RF19.** Gerekçeleri DECISIONS 2026-10-08.

**Refactor dışı kusurlar.** Hiçbiri refactor dalında düzeltilmez.

- [ ] **RK1 `--ink` hiçbir yerde tanımlı değil.** `src/styles.css`'in dört kuralı
      (4196, 4213, 4242, 6407) `color: var(--ink)` okuyor, değişken ne CSS'te ne kodda
      tanımlı, yani renk kalıtılana düşüyor. Okundu, ekranda görülmedi. Özellik dalı.
- [ ] **RK2 Önceden bozuk bir ilişkide öneri sessizce boş dönüyor.** `relax.ts` 1100 iki
      ders de yerinde kalıyorsa ilişkinin o gününü atlıyor, `verifySuggestion` ise
      ilişkisi çiğnenmiş haftayı reddediyor. İki ders sabitliyse sonuç 0 öneri, oysa bir
      öğretmen saati açmak haftayı kuruyor (analizin kopyasında ölçüldü). Karar verildi:
      kendiliğinden çözülmez, panel ve Kontrol tek cümleyle söyler. Özellik dalı.
- [ ] **RK3 Kapalı saatin iki tanımı. Karar bekliyor.** Program'ın satır başı sınıfın
      ya da dersliğinin kapalı saatini sayıyor (`Program.tsx` 307), `openHours` yalnız
      varlığın kendi saatini (`entities.ts` 987). Sınıflar listesinin "Ders saati" sütunu
      yükü gün ile saatin çarpımına bölüyor (`Classes.tsx` 270), Müsaitlik ise açık saati
      gösteriyor. Hangisi doğru tanım, karar kullanıcıda. Okundu, ölçülmedi.
- [ ] **RK4 Öğretmen değiştirme onayı iki yerde iki ayrı sayı söylüyor.** Varlık paneli
      `placedBlocks`'tan sayıyor (`Inspector.tsx` 163), ders sayfası
      `transferLesson().returned`'dan (`LessonEdit.tsx` 156), cümleleri de ayrı. Okundu,
      ölçülmedi.
- [ ] **RK5 Müsaitlik boyamasında her yeni hücre tabloyu yeniden çiziyor olabilir.**
      `Availability.tsx` 181 sürükleme sırasında her `pointerenter`'da `setPending`
      çağırıyor, tuzak 1'in kuralına aykırı görünüyor. Önce babanın verisinde ve iki
      motorda ölçülür (tuzak 105, 141). Okundu, ölçülmedi.
- [ ] **RK6 `.main`'in sekme solması büyük ihtimalle koşmuyor, ve test bunu görmüyor.**
      `src/styles.css` 1664 ile DESIGN'ın cümlesi `<main>`'in `key={tab}` taşıdığını
      söylüyor, `App.tsx` onu `<Activity>` için bilerek kaldırdı. `e2e/hareket.spec.ts` 84
      koşan herhangi bir animasyonu kabul ediyor, panel girişleri de sayılıyor. Okundu,
      ölçülmedi. Belge yarısı adım 3'te (RF18).
- [ ] **RK7 `relax.test.ts`'in süresi yeniden ölçülsün.** [TESTPLAN.md](TESTPLAN.md)
      "yaklaşık 45 saniye" diyor. 2026-10-08'de `npm test`'in içinde 136,8 saniye (yardımcı
      ajanlar koşarken) ve 155,8 saniye (`performance` profili, başka bir oturum açıkken),
      kapsam altında 402 saniye. 2026-10-09'da `low-power` profilinde 391,6 saniye. Sessiz
      bir pencerede ve `performance` profilinde tek başına ölçülür, TESTPLAN'ın cümlesi
      sayıyla düzelir.
- [x] **RK8 Öneri aramasının worker testi CI'da paralel parçada koşuyor.** Kapandı
      (2026-10-09): kullanıcının kararıyla test `ARAMA_TESTLERI` listesine girdi, `e2e-arama`
      işinde öteki ikisiyle sırayla koşuyor. `--list` ile seçim 3, kalan 623, toplam 626.
      CI'da henüz koşmadı (dal itilmedi). Sonra liste kalktı: arama testleri `@arama`
      etiketiyle seçiliyor (RK9).
      `e2e/otomatik.spec.ts`'in "öneri araması Chromium'da worker'larda koşuyor" testi
      (2026-10-09) `ci.yml`'nin `ARAMA_TESTLERI` listesinde değil, yani dört çekirdekli
      bir runner'da öteki Playwright worker'larıyla aynı anda koşuyor. Worker'lar beş
      saniyede hazır olamazsa arama ana iş parçacığına düşer ve test kırmızıya döner.
      Yerelde üç koşuda yaklaşık 2 saniyede yeşil, CI'da henüz koşmadı. Seçenekler:
      listeye eklemek ya da ilk CI koşularını izlemek.
- [x] **RK9 Başlık listesi kayıyordu.** `ci.yml`'nin "a test cannot silently drop out"
      cümlesi yanlıştı: listede başka bir başlık eşleştikçe yeniden adlandırılan bir test
      sessizce paralel parçalara dönüyordu, ve main'den gelen `windows.yml`'in kopyasında
      worker testinin başlığı hiç yoktu. Önce `--list` ile başlık sayan bir adım kondu,
      sonra (kullanıcının kararı) üç teste Playwright'ın `@arama` etiketi verildi ve iki
      liste de sayma adımı da kalktı. Kapandı 2026-10-09.
- [ ] **RK10 Dört belgenin tarif satırı CLAUDE.md'dekiyle aynı cümle değil.** CONVENTIONS
      "Her `docs/` dosyası başlığının hemen altında tek cümlelik bir ... satırı taşır, ve
      CLAUDE.md'deki yönlendirme satırı aynı cümledir" diyor. Tutmayanlar: `ASC.md`,
      `ROBODERS.md`, `TODO.md`, `plan-v0-arsiv.md` (2026-10-09, iki ayrı sayımda aynı
      dört dosya). Düzeltilmedi. Düzelince bir belge kapısı yeşil doğabilir.
- [ ] **RK11 Kural belgelerinde 182 çizgi.** CONVENTIONS "Uzun çizgi ve kısa tire
      kullanılmıyor" diyor. `docs/*.md`'nin kural belgelerinde, kod blokları ve ters tırnak
      dışında, 153 uzun çizgi ve 29 kısa tire (2026-10-09): `ASC.md` 118 ve 5, `ROBODERS.md`
      28 ve 2, `DENETIM.md` 0 ve 13, `TRAPS.md` 2 ve 6, `LAYOUT.md` 0 ve 2, `PRINCIPLES.md`
      2 ve 0, `BUILD.md` 2 ve 0, `ARCHITECTURE.md` 1 ve 1. Ayrıca `docs/asc/` altındaki aSc
      yardım kopyalarında 104 ve 48 (11 dosya), `README.md`'de 10 uzun çizgi; kuralın
      bunları kapsayıp kapsamadığı karar bekliyor (kopyalar kaynak metin, README vitrin ve
      İngilizce). Düzeltilmedi.
- [ ] **RK12 `npm run lint`'e `--max-warnings 0`.** 2026-10-09'da üç `exhaustive-deps`
      uyarısından ikisi kapandı: `Commands.tsx`'te gereksiz `ui` bağımlılığı çıktı (değeri
      hiçbir yerde okunmuyordu), `App.tsx`'te komut listesinin bağımlılığına gerekçeli bir
      susturma kondu (üç `toggle` yalnız listedeki `theme`, `ribbon` ve `motion`'ı okuyor;
      RF11 onları kaldırınca `reportUnusedDisableDirectives` susturmayı kendisi bildirir).
      Kalan `useRowOrder.tsx`'in eksik `t`'si main'in işi. O düzelince `--max-warnings 0`
      açılır. `Commands`'ın `Props`'unda `ui` hâlâ duruyor ve App onu geçiriyor; ölü prop
      RF11'de gider.

**Tuzak adayları** (dal oturumu numara vermez; main'e birleşince TRAPS'a taşınabilir):
- Derleme commit kimliğini gömüyor (`version.ts`'in `commit` alanı). Aynı kaynaktan iki
  commit'te iki ayrı sha çıkar; bir değişikliğin sha'yı değiştirip değiştirmediği aynı
  HEAD'de, commit'ten önce derlenerek ölçülür (tuzak 114'ün yanında).
- `merge=union` çatışmayı kaldırıyor ama iki tarafın aynı olan satırlarını (boş satır,
  "Kalıcı kural: yok") teke indiriyor, yani bir oturumun girdisi satır kaybediyor; aynı
  satırın iki ayrı düzenlemesini de çelişkili hâlde yan yana bırakıyor. Geçici bir
  klonda ölçüldü, kullanılmadı.
- knip, `/tmp` altındaki geçici bir klonda kullanılmayan bir dosyayı bile bildirmedi:
  orada ölçüm aracı kalibre olmuyor, oradan çıkan "knip yeşil" bir şey kanıtlamaz.
- `pkill -f <kelime>` o kelimeyi komut satırında taşıyan kendi kabuğunu da öldürür.

**Sıradaki iş (dal).** T1 (`leaf/lang/` için bir giriş noktası), T2 (`ui/setup`'ın `Paste` ve `Summary`'si)
ve derin import kuralı; adım 2'nin süre ölçümleri temiz koşulda (`scripts/temiz-kosul.sh`):
`npm test` üç kez, Stryker'ın kuru koşusu ve iki kalibrasyon koşusu, dosya başına tahmin.

## §9. Ham notlar — senin kendi satırların

Bütün turların kaynağı. **Hiçbir satır silinmedi**; her satırın yanında nereye
gittiği yazıyor. Kapalı olanların çoğu kod yazılarak değil **ölçülerek**
kapandı — o yüzden nerede kapandığı da yazılı.

### 9a · Hâlâ AÇIK olan satırlar → numaralı maddeye dönüştüler

| Senin satırın | Nereye gitti |
|---|---|
| her şeyden önce. tasklara ASC ve Robodersin tekrardan her inciği cıncığının feature'nın incelenmesi lazım. | **§1'in tamamı** (R1–R9) — her şeyin önüne alındı |
| Program tarafı da tuval gibi word gibi olsun hareket ettirme vesaire eğer olabiliyorsa. | **B4.2** — tuval artık Program ızgarasının kendisi |
| Ayarlar sectionunun kendine has kendi içinde simetrik olma koşuluyla designi olabilir. | **B2.1–B2.3** (§2) |
| Arama kısmına bir şey yazınca arama bloğu genişliyor genişlemesin. | **B1.6** — dosyanın son satırıydı, hiçbir tura girmemişti |
| Uygulama'da exe'de babamın ekranında program kısmında derslerin hepsi gözükmüyor sığdır olmasına rağmen. | **B7.13** — kapandı: pencere maximize + Sığdır'ın genişlik iadesi (tuzak 107) |
| Ayarlar hakkında kısmında sağa sola kaydırma olmasın. | **B2.5** — önce ölçülecek |
| Görsel çıkartma | **B3.1** |
| Çıktıda ayrı ayrı birden fazla pdf oluşturma. | **B3.2** |
| Excele çıkartma. | **B3.3** |
| Çıktıda eposta ve whatsapptan atma opsiyonu. Öğretmenlerin teli ve epostanın. | **B3.4** — şema v12 |
| Çıktıda her ama her zaman simetri çok önemli. | **B3.6** — ölçülmedi |
| Benden çıktılar için foto iste eğer örnek fotolarda atmadıysam. | **§8a** — senden isteniyor |
| Kontrol kısmı çok saçma olmuş. biraz daha düzgün olmalı. | **B5.5** — yarısı kapandı |
| Program otomatik dizmeye bakmak lazım. | **B5.1** — ölçüldü, karar sende |
| ASC ve Robodersi playwright ile inceleyip oradaki güzel featureları bize ekleyelim. | **§1** — ilk turu yetersiz bulundu, tam envanter isteniyor |
| Babama indirdim exeyi zip virüs algılandı. .exeyi açarken de window engelledi. | AB6 azalttı; ekranın kendisi → **B7.3** |
| Sanırım cloud tabanlı bir şey kuracağız babam öyle istedi... dockerda falan küçük yer kaplayan bir cloud sistemi kuralım. | **§8a** — kural çelişkisi (ilke 2 · yasak liste "bulut senkronizasyonu"), CLAUDE.md kararı bekliyor |
| Kullanım kolaylığı ve kullanım tarzı bakımından ASC'den, Robodersten, Word, Paint, Excel, Powerpoint, Adobe programları gibi yerlerden ilham... | **R10** (§1d) |
| Statik bir site olduğundan kolayca aslında ücretsiz bir şekilde internete de yükleyebiliriz, deploylayabiliriz. | zaten var — `dist-site` + GitHub Pages (**B7.2**); §8a'daki bulut maddesine not düşüldü |
| Çıktı alanında sağdaki seçeneklerin bazıları alttaki şeride gidebilir, sağ tarafta yerden tasarruf etmiş oluruz. | **B3.7** |
| Ayarlardaki zil ve günler okul ile alakalı bir şey olduğuından okul sekmesine... Kurallar sekmesi de aynı şekilde... | **B2.7** — §1 bitmeden karara bağlanmayacak |
| Babamın ekranı 27 in. 1920x1080... dersliği yok ibaresi kalkması lazım... Sınıfların türü olmalı... o sebeple her şeye uygun ama en çok da babama uygun olsun ölçeklemeler. | ölçekleme → **B2.8** · "derslik yok" ibaresi → **B4.6** · sınıf türü zaten **B4.3b**'de var |
| Ayrıca hakkında kısmında what's new gibi olmalı. babam her güncelleme alındığında neyin değiştiğini soruyor... | **B2.9** |
| Eğer hata varsa düzelt. 2 derslik bir blok kesinlikle 1 ders değil 2 derstir... son 2 saate konulabilmeli. | **B5.6** |
| Ayarlarda her sectionun görüntüsü değişebiliyor olsun... Önizleme şeklinde görelim onları. | **B2.10** |
| Programda bir kartı kırmızı sarı veya yeşil blokların üzerinden gezdirirken çok kasma oluyor. | **B4.7** — İKİNCİ kez geliyor (§9b'de 2026-09-01'de kapanmış), sebebi 2026-09-12'de ölçüldü |
| Program kısmının açılışı daha hızlanmalı. | **B4.9** — İKİNCİ kez geliyor, B1.4 olarak bir kez ölçülmüştü |
| Gerekirse web stacki ile uygulama stacki ayrılmalı bu çok büyük bir şey ama gerekiyorsa yapılacak. | **§8a** — koşullu, koşulu B4.9 |
| Öğretmenin kendi dersleri arasında değişim muhtemel olmalı eğer sınıfsal ya da başka bir şeysel bir sıkıntı yoksa. | **B5.7** — takas motoru var, teklif edilme koşulu ölçülecek |
| Stacklensin ve stacklenmesin diye havuzda seçenek olsun. Sadece aynı türler... | **B4.14** — ikinci yarısı zaten doğru, istenen anahtar |
| babamda programa koyduğumuzda derslerin ... yazmasının sebebi sınıf isimleri çok uzun. | **B4.15** — ölçüldü: yalnız Sığdır'da, 200 kartın 195'i |
| havuzda tek ders ile çift ders bloklarının arasındaki oran bir bölü iki gibi değil | **B4.16** — ölçüldü: örnek okulda 1'e 2, babanınkinde 1,22 |
| Yenilik olduğu vakit ayarların üzerinde nokta var ama hakkında kısmında yok. | **B2.11** — doğru, kaynağı kodda görüldü |
| Program kısmında sağ üstteki işlemlerde programı boşalt kırmızı olmalı ya da işte önemli bir işlem. | **B4.10** — zaten kırmızı, görünen ağırlığı ölçülecek |
| Program kısmında renkleri ayarlama olmalı sınıfa göre öğretmene göre ona göre buna göre. | **B4.11** — özellik var, bulunabilirlik bulgusu |
| kartları kaydırırken başka bir kartın üzerine gelip koyma yani değiştirme var ya... yani kırmızı mı turuncu mu falan. | **B4.8** — performans değil görünürlük, 2026-09-12'de ölçüldü |
| Her şeyden önce program kısmının çalışıyor olması gerek. Babam roboderste aynı dersleri aynı hocaları aynı müsaitlikleri girmesine rağmen roboderste program oluşurken bizde oluşmuyor. Bunu çözmeliyiz. | **B5.8** — çözücü güçlendi; veri aynı değil ve bizimki kanıtlı imkânsız, soru §8b'de · **B5.9** doğdu |

### 9b · Kapanmış satırlar — ve nerede kapandıkları

```
Linux exesi de oluşturalım.                                       -> [x] B7.16, 2026-09-24, yalnız geliştirme ve test için
Ardından bu exeyi açan playwright gibi iş yapan araç kuralım ki sen exe üzerinden görebil her şeyi. -> [x] B7.17, 2026-09-24, tauri-driver + WebDriver
elimizde bir kart varken yukarı aşağı yapıldığında gölgelenmeyen açık kalan şerit de bizim ekran ile birlikte devam ediyor. onun gösterdiği yerde sabit kalması gerekir. -> [x] B4.17, 2026-09-24, gölgeler tekerleği duymuyordu
Programda havuzdaki stacktakileri kartlardan alttakilere ulaşamıyor babam... -> [x] B4.13, 2026-09-12, sebep tepsinin boyu, deste değil
Websitesinde programda kartları kaydırırken çok kasma oluyor.             -> [x] 2026-09-01, drag başlangıcı 125 -> 46,2 ms
aynı şey daha da az olsa da uygulamada da oluyor. uygulamada daha çok koyulabilir yerlerin üzerine gelince hesaplama olunca oluyor. -> [x] 2026-09-01, dropMap + boya yolu
uygulamanın logosunun aşağıda nasıl gözüktüğünün fotosonu attım onun düzelmesi lazım. ayrıntılı logo kullanılmalı. -> [x] 2026-09-01, yalnız 16 sade; 20+ ayrıntılı
Dersler sınıftan kısmında branş seçmenin önünde branş yazıyor onu düzelt. -> [x] 2026-09-01, görünür etiket kalktı; aria-label kaldı
Derslerin blok saatleri 2 3 ve 4 de olabilsin.                    -> [x] şema v9, Lesson.blocks
Branş isimleri değiştirme de olsun.                               -> [x] renameSubject() (cascade'li)
Sıralamada aşağı yukarı işareti düzgün olsun.                     -> [x] B1.2 (2026-08-31)
Öğretmenin bilgisine girip bir sınıfı başka bir hocaya aktarma.    -> [x] AC5, transferLesson()
Aynı şekilde öğretmenin bilgilendirmesine girip de yapılabilsin.   -> [x] AC5, Inspector düzenler oldu
ASC derslerinde ekleme ya da değiştirme kısmına bak.               -> [x] AB8, docs/asc/ekran/
Uygulamanın windows çubuğundaki simgesi büyük simge olsun.         -> [x] AB5, eşik 20 -> 32
Babamın windowsu çok büyük, ölçeklendirmeyi azaltmamız lazım.      -> [x] AB4, kök 13px + %80 basamağı
Dosyadan aç biraz sıkıntılı gibi ya da yavaş.                      -> [x] ÖLÇÜLDÜ: parseState 0,65 ms.
                                                                        Yavaş değil; sürtünme onay diyaloğu (bilerek)
Çıktıda blok dersler programdaki gibi birleşik görünsün.           -> [x] Print.tsx colSpan (415 · 495)
Readmenin ingilizce olması ve githubtaki her şeyin ingilizce.       -> [x] AB7
Ayarlarda görünüm kısmı düzenlensin, infolar çok uzun.             -> [x] AB2, en uzun .hint 438 -> 126
Hareket ve Dil solda olmalı.                                       -> [x] AB1
Hiçbir yerde sağdaki bloklar sağa sola hareket etmesin.            -> [x] AA2 + AB3
Listelerde ekleme kısmı ayrı blok olsun, sadece çizgi olmasın.      -> [x] AA1
Müsaitlikteki programların satırlarının uzunluğu artsın.            -> [x] AC2, 42 -> 54,3 px
Ayarlardaki bölüme özgü ayarlar o bölümün şeridinde sağ üstte.      -> [x] AB1
Çıktıdaki sağ blokların aşağı yukarı gitmesi babam için zor.        -> [x] AB3, üç kaydırıcı -> bir
Öğretmenler listelerde branşlarda kısaltmalar.                     -> [x] otuz dördüncü oturum
Program kısmında branşlar kısaltmalar olsun sol tarafta.            -> [x] otuz dördüncü oturum
Programda derslere sağ tıklayınca seçenekler gelsin.                -> [x] program.spec.ts 86, yedi kalem
Okul tarafında yeni ekleme bloğu simetrik olmalı.                   -> [x] AC1, beş ekranda eşit
Dersler öğretmenden tarafında branş ayrıca yazıyor, gereksiz.       -> [x] ÖLÇÜLDÜ: zaten kapalıydı
Programda satır/sütun/gün sabitleme sağ tıkla açılsın.              -> [x] AC5, "Toplu sabitle"
Programda satır ghostlama / anlık kapatma, günler için de.          -> [x] AC5, "Geçici görünüm"
Tüm programı sabitleme, programlar arası değiştirme.                -> [x] AC4, Izgara + kitaplık menüleri
Program sectionu açılırken bi' yavaşlama oluyor.                    -> [x] B1.4 ÖLÇÜLDÜ, teori çürütüldü
Listelerdeki açıklamaların hizaları da aynı olsun.                  -> [x] B1.3 ölçüldü, sapma YOK
Müsaitlikteki alttaki programla üstteki benzer olsun.               -> [x] AC2
Arama kısmını düzelt, en sağda saçma sapan bir çizgi var.           -> [x] B1.2, visibility: hidden
Filtrelere başka filtreler de getir, çoktan aza ifadelerini kaldır. -> [x] loadStatusFacet (fb052f4)
Dersi düzenlemede dersi başka bir hocaya verme de olmalı.           -> [x] AC5
O raptiye işareti hover edildiğinde gelsin şeffaf olmasın.          -> [x] AC3 (karar: hep görünür, sönük)
Sağ tıkta da sabitleme özelliği olsun.                              -> [x] AC5
Derslerde öğretmene/sınıfa göre filtre olması saçma.                -> [x] ÖLÇÜLDÜ: zaten kapalıydı
Saat açma kapama çalışmıyor müsaitlikte.                            -> [x] B1.1 (2026-08-31), tuzak 102 · 103
```

### 9c · X turu (2026-08-28) · on iki satır, on ikisi de bitti

> Kurulumda Derslikler Öğretmenler ve SInıfların yanında 1 2 3'ü kaldır. → X1
> Tüm Listeleri de olabildiğince birbiriyle simetrik ve uyumlu yap. → X2
> Sınıflar listesinde ad niye o kadar kaymış ve ayrıca o kadar uzun. Derslikte de çok uzun. Uzun olması daha iyiyse beni ikna et ve öyle kalsın. → X2
> Sol üstteki logonun küçüğü kullanılsın. → X3
> İkinci barın açılıp kapanması ayarlarda bir ayar olsun. → X10
> İkinci barın en başındaki yazıdan sonra gelen çizgi her sectionda aynı yerde olsun ve yazı ortalansın gerekirse ona uygun bir yazı seçilsin. → X4
> Öğretmenin tek bir branşı varsa seçme tuşu açılmasın dersler sectionu öğretmenden seçeneğinde, varsa tabii ki açılsın. Başlıkta branşı da yazsın. → X5
> Programda blok saatlerinin yeni mantığından dolayı önizleme artısı kaymış durumda. Foto örnek fotolarda. → X6
> Programda kartların üzerinde gözüken kaç tane olduğunu gösteren rozet kalksın. → X7
> Yazdırmada yazıları büyük yapınca yazdırma bozuluyor. Önizleme doğru olmasına rağmen. → X8
> Öğretmenler kısmında ve yazdırma kısmında ve başka diğer yerlerde de yan bloklar çok uzun ve sırf onlardan dolayı tüm sayfanın uzunluğu artıyor buna bir çözüm bul. → X9
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. Sectionları artırabilir azaltabilir düzeni değiştirebilir her şeyi yapabilirsin. → X11, sonra Y6

### 9d · Y turu (2026-08-28) · on satır, onu da bitti

> Branşlar kuruluma gelsin. → Y2
> Branşlarda yanda hazır eklenebilirleri ekleyelim. → Y3
> Kurulum müsaitlik falan işte üst taraftaki sectionların da isimleri daha güzel hale getirilebilir. → Y1
> Kurulum öğretmenlerde kurulum durumu dersler sekmesine gidinize gerek yok. Hatta direkt onu da silebilirsin çok fazla kaydırma olmuş gereksiz. → Y4
> Kurulum özeti ya da özet vebenziren çevrilebilir o. ya da artık ileride nasıl adlandıracaksak. → Y4
> Öğretmenler Sınıfflar dersliklerde yazdığı gibi derslerin içinde genelin yanında da toplam dersler yazsın. → Y10
> Kontrol tarafında hepsi sorunlar kapasite biraz fazla gereksizler gibi ya düzgün şekilde onları doldur ya da öyle gereksiz yapma. ayrıca çok aşağı doğru gidiyor daha mantıklı bir çözüm bulunabilir mi? → Y7
> Listelerdeki satırlar en sona kadar gitsin. Böyle cücük kadar oldular güzel de gözükmüyor. → Y9
> Listelerin yanındaki bloklar kesinlikle sağ sol oynatma olmasın adamakıllı ortalansın ve sığdırılsın. → Y8
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. → Y6
> Tüm sectionları cesurca her şeyi değiştirebilsirsin. → Y1–Y10'un tamamının izni

### 9e · AA turu (2026-08-29) · beş satır, beşi de bitti — şema v10 → v11

> Listelerde ekleme kısmı ayrı blok olsun. aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın. → AA1
> Özetler içlerindeki bilgilerin uzunluklarına göre uzunlukları değişebilir ama en fazla tam ekranın uzunluğu kadar olsun ondan fazla uzun olmasın eğer liste çok uzunsa işte kaydırma o özetin içinde olsun. → AA2
> Özetteki hatalar özetin en üstüne gelsin. Hata gidince yok olsun. → AA3
> Sınıfların özel olarak bir günde aynı dersten kaç saat girme opsiyonu olsun. → AA4
> Branşların kısaltma varsayılanı varsayılan ismi en üste liste katgeorisine gitsin. → AA5

---
## §10. ARŞİV

Biten turlar tarih sırasıyla [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de, oturum başında okunmaz.
