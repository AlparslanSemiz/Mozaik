# TODO — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti ·
`[→]` arşivde duran ama **canlı hâli yukarıda** olan madde (numarası yazılı)

Yeni bir bilgisayarda başlıyorsan önce [WORKLOG.md](WORKLOG.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

**Bu dosya nasıl okunur:** burada **açık işler** durur. Biten maddeler, ham notlar
ve biten turlar [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de. Arşiv silinmez ve geriye dönük düzeltilmez —
o bir günlük, kararların o gün geçerli kuralla alındığını gösteriyor. Yeni iş hep
§0'dan doğar, §1–§7'de numaralanır, bitince arşive taşınır.

---

## §0. NOT DEFTERİ — buraya yaz ✍️

> **Bu bölüm senin.** Aklına geleni buraya, olduğu gibi, düzeltmeden yaz.
> Sıraya, biçime, numaraya gerek yok. Her oturumun başında buradaki satırlar
> okunup **§1–§7'ye numaralı madde** olarak taşınır, ham hâlleri
> [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'nin §9'una (Ham notlar) geçer — hiçbir satır silinmez.

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
| **§8** | **Karar bekleyenler** — sende, babada, babanın gerçek verisi, belge turu, kod turu, erişilebilirlik, test sırası, denetimin bulguları (§8j) refactor analizinin planı ile kusurları (§8k) ve test programı (§8l) | her alt başlık açık madde taşıyor; sayı için bölüme bakılır |
| **§9** | **Ham notlar** — bütün satırların, nereye gittikleriyle, [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de | kayıt |
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

**Özellik oturumunun sırası (2026-10-10, Alp):** Linux uygulaması (B7.28) ∥ zebra →
sade ekran (babanın 1 numaralı isteği, §0: daha az yazı, daha az soru) → yayın kapısı
(önce D) → e-posta → Roboders ve Eyotek turları (§1) → Eyotek'e gönderme (B3.8).
Mutasyon parçaları (B7.24) test oturumunda.

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


### 1b · Roboders — sıfırdan

**Adı `Roboders`**, `Robodersi` onun belirtme hâli. Bulgular:
[ROBODERS.md](ROBODERS.md).


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

---

## §5. Bölüm 5 — Kısıt motoru, çözücü ve Kontrol

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
- [→] **B7.8 `scripts/asc-tur.ps1` yeniden koşturulsun** → **R1**'e taşındı.
      Artık bir dağıtım işi değil, envanterin **önkoşulu**.
- [→] **B7.9 Roboders incelensin** → **§1b** (R5 · R6 · R7). Senin
      *"her şeyden önce"* satırın onu bir maddelik iş olmaktan çıkardı.
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
      `upload-artifact` v4 için Dependabot beklenecek, elle yapılmaz. **2026-10-09 akşam,
      kullanıcının kararı (test programı K6):** Dependabot beklenmedi; `ci.yml` ve `windows.yml`'de
      `upload-artifact@v7`, `download-artifact@v8`, runner'lar `ubuntu-24.04` ve `windows-2025`'e
      sabit, `kanarya.yml` yeni imajı haftada bir koşuyor (`test/kapsam`). `surum.yml` hâlâ
      `upload-artifact@v4` ve `download-artifact@v7`'de (dokunulmaz), `haftalik.yml`'in mutasyon
      işi `upload-artifact@v4`'te (`ci/mutasyon-parca`'nın). #6 (bölme önerisi
      onaylı, sonra), #7 (vite 8, ayrı ve ölçümlü bir iş) ve #8'e dokunulmadı.
- [x] **B7.21 WebKit'in 19 kırmızısı ayrılsın (2026-10-09).** **Kapandı, yapılmayacak
      (2026-10-09 akşam, DECISIONS "Yeni WebKit süiti eklenmiyor"):** Linux yolu Chromium
      uygulama modu olacak, babanınki WebView2; `test:webkit` olduğu gibi kalır. `npm run test:webkit`'in
      ilk koşusu (TESTFINDINGS): Chromium'a özgü dört iddia (A2 gibi "yalnız Chromium"
      diye işaretlenmeye aday), sekiz sürükleme ve imleç, beş ölçü ve yazı, iki hareket.
      Her biri için ürün mü test mi olduğu ölçülür. Babanın ortamı Chromium, yani öncelik
      düşük. **Kullanıcının kararı (2026-10-09):** şimdilik düzeltme yok, `test:webkit`
      ne `kontrol`'e ne `haftalik.yml`'e giriyor.
- [~] **B7.24 Mutasyon 2026-09-24'ten beri koşamıyor (2026-10-09).** `src/pure/solver.ts:975`
      `weight[index]!++` Stryker'ı başlamadan düşürüyor (TESTFINDINGS). Çare 2026-09-12'deki
      gibi `weight[index] = weight[index]! + 1`. **Düzeldi (`290f55d`)** ve arkasındaki iki
      engel de (test ve ilk koşu süre tavanları); kuru koşu yerelde geçti, tekrarı lint
      yakalıyor (tuzak 147). Bitti sayılması `haftalik.yml` 37914431289'un tam mutasyon
      koşusunun sonucunu bekliyor.
      **O koşu bitmedi (TESTFINDINGS 2026-10-09):** 360 dakikalık iş tavanında iptal oldu,
      5 639 mutantın 3 645'i denenmişti, kalan tahmin ~20 sa. Tam koşu bu işe sığmıyor;
      seçenekler (parçalara bölmek, artımlı koşu, listeyi daraltmak, yerel koşu) kullanıcıda.
- [~] **B7.27 Veri kaybı: iki kopya (VK1) ve dolu depo (VK2), `useHttpsScheme` (2026-10-09).**
      Test oturumunun bulguları (`test/kapsam`, PLAN.md). `fix/veri-kaybi` dalında düzeldi:
      tarayıcıda başka pencere açık planı ya da plan listesini farklı bir değere yazınca bu
      pencere yazmayı bırakıp söylüyor (`storage` olayı, `file://`'da üç yol ölçülerek
      seçildi), kapanan sekme yalnız bekleyen yazımı boşaltıyor; dolu depo kırmızı şeritte,
      klasöre oturuma özel kurtarma kopyası; exe'de tek kopya (`tauri-plugin-single-instance`),
      güncellemenin devri boruyla; `useHttpsScheme: false` açıkça yazılı ve testli.
      **Kalan:** Windows exe'de iki kopya ve boyut ölçülmedi (Linux ikilisi +883 888 bayt,
      %20,3, D-Bus); açılış süresi "kirli, ölçülmedi" (prizde değil, yük 3,35); kendini
      güncellemenin devri yalnız birim testli, gerçek bir güncellemeyle denenmedi; sonraki
      oturum kurtarma kopyasının varlığını söylemiyor; TB7 (kapanan sekmenin son
      değişikliği klasöre inmiyor) bu dalın dışında. Yan bulgu: taze bir profilde açık plan
      0 branş gösteriyor, aynı plan kaydedilip yeniden okununca `parseState` boş listeyi 21
      yerleşik branşla dolduruyor (TESTFINDINGS 2026-10-09); var olan bir tutarsızlık,
      dokunulmadı.
- [ ] **RK14 Bozuk bir arama günlüğü Ayarlar → Veri'nin satırını çökertebilir.**
      `platform/search/relaxLog.ts` 41 depodan okunan diziyi eleman eleman bakmadan
      `SearchRecord[]`'a döküyor; `ui/settings/Data.tsx` 250 son kaydın `doneMs`'ini
      okuyor. Depoda `[null]` gibi bir değer satırı düşürür. Anahtarı yalnız uygulama
      yazıyor, veri kaybı yok. Okundu, ölçülmedi (2026-10-09, `refactor/search`).
      Düzeltilmedi: dal davranış değiştirmez.
      **Sıra (2026-10-10, Alp):** VK1 ve VK2'nin hemen arkasında, §8k'den buraya alındı.
      Veri kaybettirmiyor ama babanın yedek ekranına ulaşmasını engelleyebilir: otomatik
      yedeklerin listesi aynı bileşende (`Data.tsx`) ve `src/ui`'da hata sınırı yok, yani
      okumaya göre çöküş satırda kalmaz, Veri bölümü açılınca bütün pencere boşalır.
      Ölçülmedi.
- [~] **B7.28 Linux uygulaması: Chrome'un app modunda `dist/index.html` (2026-10-10).**
      Tauri'nin WebKitGTK sürümü kasıyor (B7.21'de 19 WebKit kırmızısı). Kararlar (Alp):
      `file://` ve ayrı bir Chrome profili (`~/.local/share/mozaik/profil`), yalnız
      `google-chrome`, Chrome yoksa söyleyip çıkmak, rpm bırakılır, Linux ikilisi test aracı
      olarak kalır. Analizin ölçümleri (Chrome 154, Brave 1.96, geçici profil, `--app`):
      sitenin ağsız ilk açılışı iki tarayıcıda da hata sayfası, ikinci açılışı service
      worker'dan; `file://` ağsız açılıyor. `showDirectoryPicker` Chrome'da iki yolda var ve
      seçici açıldı, Brave'de iki yolda da yok. VK1: aynı profilde iki `--app` penceresi,
      A örneği yükleyince B'de "başka bir pencerede" şeridi, A'da yok (iki tarayıcı).
      Alp'in bugünkü verisi Chrome'un Default profilinde, site origin'inde; Brave'de yok.
- [x] **B7.26 `invariants.test.ts`'in öneri değişmezi CI'da kararsız (2026-10-09).** 60 s'lik
      tavan 60 dünyanın toplamı; `main`'de 10–22 s, aç kalan bir runner'da 74 s
      (TESTFINDINGS). Seçenekler: tavanı yükseltmek, `numRuns`'ı düşürmek ya da dünyayı
      küçültmek; kullanıcının kararı.
      Karar (2026-10-09): test zayıflamaz, `numRuns` 60 kalır. `hiz/belge-test` dalında
      ("Test: öneri değişmezi olay döngüsünü bırakıyor, tavanı ölçülen CI süresinden")
      arama dilimlerle koşuyor ve dilimler arasında işçiye dönüyor, tavan CI'ın en yavaş
      ölçümünün iki katı (180 s). M1, M2 ve M3 kırmızı. Kapandı: dalın iki CI koşusunda yeşil
      (37929711747, 37930611648), RPC zaman aşımı yok.

---

## §8. Karar bekleyenler

### 8a · Sende — kullanıcı kararı

- [ ] **Roboders hesabı ücretli bir plan mı, süren bir deneme mi?** Deneme ise
      kaç gün kaldığı R6'nın kapsamını belirler.
- [ ] **R6 ne zaman koşsun?** Görünür bir Chromium penceresi açılacak ve odağı
      alacak; oturumu sen açacaksın. Müsait olduğun bir zaman gerekiyor.
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

- [ ] **Babanın exe'si hangi sürüm? (2026-10-08)** Ayarlar → Hakkında'da yazıyor;
      son sürüm olmalı (kullanıcı, 2026-10-09; **doğrulanmadı**, numara görülmedi). Bilinen son kayıt v2.0.2 (2026-08-31). v2.0.2 güncellemeyi eski
      `ders-programi` adresinden soruyor, v2.0.3 ve sonrası `Mozaik`'ten; depo adı ya
      da görünürlüğü bir gün değişirse hangi sürümün güncellenebilir kalacağını bu
      belirler (DECISIONS 2026-10-08, depodaki gerçek veri).
- [ ] **Eyotek'e gelen program öğretmene bir bildirim olarak gidiyor mu? (2026-10-08,
      B3.8)** Push ya da SMS.
- [ ] **Vekil öğretmen (Substitution) var mı?** aSc'de 62 yardım konusu, yani
      küçük bir özellik değil. **Babaya sorulmayacak (2026-10-09):** Roboders'teki
      gerçek verisinde vekil modülünün kullanılıp kullanılmadığı R6'nın Tur 3 ve 4'ünde
      okunacak (yalnız okuma).
- [ ] **Nöbet var mı?** Aynı yolla, Tur 3 ve 4'te okunacak.
- [ ] **Otomatik dizmenin çıktısı KULLANILIR mı?** Yasal olduğu ölçülüyor
      (21 dünyada, her blok `blocker()`'dan geçiyor); *iyi* olduğu ölçülmüyor.
      Sorular: sınıfın günü içinde boşluk (pencere) kalıyor mu, öğretmen okula
      gereksiz gün geliyor mu, günler dengeli mi. Cevaba göre §5 şekillenir.
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
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en
      fazla/en az kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor ve **öyle
      kalacak** (2026-08-24 kararı): branş kısaltmasının aksine bunun "doğru
      cevabı" okuldan okula değişir, ve yanlış bir varsayılan hücreleri
      sessizce kırmızıya boyar
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

- [ ] **PRINCIPLES.md'deki önerilen gerekçeler onaylansın mı?** "Şu an yapılmıyor" listesinde
      beş satır ve "Nasıl çalışılır"da bir cümle "(öneri, doğrulanmadı)" işaretli
      (2026-10-08'de iki "öneri" satırı, bulut ve takvim, listeden çıktı).
      Onaylanınca işaretler kalkar.

---
### 8d · Kod refactor turunun envanterinden çıkanlar (2026-09-11)

Envanter (refactorun Faz 0'ı) kaynağı okurken buldu. Bunlar davranış kusuru ya da
belge ile kod ayrılığı, yani refactor commit'lerine girmez. Envanterin kendisi ve
önerilen sıra WORKLOG'un 2026-09-11 tarihli refactor girdisinde.

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
- [x] **ESLint'in ilk raporundaki `exhaustive-deps` uyarıları (2026-09-11).** Dördü de araç
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
      **Dördü de kapandı (2026-10-09).** `Commands.tsx` ve `App.test.tsx` refactor dalında.
      `bakim/refactor-istekleri` dalında `useRowOrder` ölçüldü: kancayı açık tutan bir
      listede dil İngilizceye geçince tutamağın ipucu Türkçe kaldı
      (`src/rowOrder.test.tsx`, düzeltmeden önce kırmızı), `t` bağımlılığa girdi. Ekranda
      hâlâ görünmüyordu, sebep yukarıda. `App.tsx`'in üç `toggle`'ı `useCallback` oldu,
      susturma kalktı.
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

- [x] **C6 kapsam ölçümü — test oturumunun cevabını bekliyor.** Soru: ayrı bir
      komut mu olsun yoksa mutasyonun yanında mı dursun, ve `kontrol`'e girsin mi.
      Ölçüm turunun görüşü ayrı komut yönünde (kapsam bir kapı değil bir harita),
      karar kullanıcıda. Kurulmadan önce cevap beklenecek. **Kuruldu (2026-09-12):**
      `npm run kapsam` ayrı komut, eşiksiz, `kontrol`'de değil; gerekçesi `vite.config.ts`'te.
      Tabanı test programında (§8l, TP24).

### 8g · Şema göçünden çıkan ürün kusurları (2026-09-12)

Örnek dosya testine dersin şekli ve ayarlar iddiası eklenirken çıktılar. İkisi de
üretim kodunda, yani test tarafının işi değil, ve ikisi de `src/fixtures.test.ts`'te
`BİLİNEN KUSUR` adlı vakada çiviliydi. 2026-09-25'te düzeldi, vaka adıyla kırmızıya döndü
ve yerini doğru davranışı soran bir teste bıraktı.


### 8j · Denetimin bulguları (2026-09-26)

**2026-09-27: on üçü de kapandı**, her biri kendi commit'inde, kullanıcının DK8, DK9,
DK11, DK5, DK12 ve DK6 için verdiği kararlarla (DECISIONS 2026-09-27). Kullanım
kolaylığı sorunları (KS) ve öneriler (Ö) DENETIM.md'de açık, TODO'ya henüz taşınmadı.

Elle denetimin ürettiği kusurlar. Her birinin tekrar üreten adımları, beklenen ve olan,
ve ekran görüntüsü [DENETIM.md](DENETIM.md)'de, maddenin sonunda yazılı bölümde.
Kullanım kolaylığı sorunları ve öneriler orada, burada yalnız kusurlar. Veri kaybı
sınıfındaki üçü denetim sırasında kullanıcıya ayrıca söylendi.


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
| RF13 | çözücü ile öneri aramasının yaşam döngüsü kancada (birim testi 2026-10-09'dan beri var, `useSolver.test.tsx`) | `src/platform/search/useSolver.ts` |
| RF14 | bütün kimlikler aynı `string` tipi | `src/leaf/types.ts` |
| RF15 | `t()`'den geçmeyen dizeler (özellik işi, §8d) | `src/ui/` |
| RF16 | worker'ın satır içi betik yolunu yalnız gerçek exe süiti ölçüyor | `src/platform/search/relaxPool.ts` |
| RF17 | `withGlobalTauri` ile `<Activity>`'nin sözleşmesini ölçen test yok | `src-tauri/tauri.conf.json`, `src/ui/App.tsx` |
| RF18 | ölü CSS, okunmayan token ve bayat belge cümleleri | `src/styles.css`, belgeler |
| RF19 | `Math.random` ile önbelleksiz `localeCompare` | `src/pure/entities.ts`, `src/pure/listview.ts` |
| RF20 | `theme.ts`'te her tercih iki adla dışa aktarılıyor | `src/platform/prefs/theme.ts` |

**Hedef ağaç.** 2026-10-09 sabahki plan oturumunun önerisi, Alp onayladı; oturumun
transkriptinden buraya alındı (2026-10-09 gece). İlke: önce katman, sonra alan. İki ya da daha
fazla dosyası olan bir alan bir klasör (paket) olur, tek giriş noktası `index.ts`'idir. Tek
dosyalık bir modül katman kökünde kalır. Testler `src/` kökünde kalır ve derin import
kuralından muaftır.

```
src/
  leaf/                 düz kalır (küçük, ortak sözcük); her dosya kendi paketi
    lang/               index.ts: dört sözlük ve kisaltmalar (bitti)
  pure/
    relax/              RF1 (adım 6). index: createRelaxer, suggest, verifySuggestion,
                        applySuggestion, applyRelaxations, suggestion* cümleleri, tipler;
                        iç: model, search, verify, sentences, diff, ve sat.ts
                        (Sat'ı yalnız relax kullanıyor, dışarı kapanır)
    constraints/        RF6 (adım 7). index: blocker, buildIndex, occupy, vacate,
                        placedBlocks, dropMap, sanitize…; iç: engine (dokunulmaz,
                        yalnız git mv), grid, drop, sanitize
    entities/           RF5 (adım 7). index: bugünkü dışa aktarımlar; iç: ids (newId),
                        teachers, classes, lessons, availability
    program/            adım 4: programs, programMask, YENİ programView (RF8)
    paper/              adım 4: YENİ öğretmen ve sınıf kâğıdı modeli (RF9)
    io/                 parseState, bundle, library, import, sample
    kökte kalır:        solver (RF4 park), rules, feasibility, listview, undo, bell
  platform/
    prefs/              theme, printOptions, programColor, toolState
    storage/            libraryStore, planStore, storageReport, useStore, usePlans,
                        download, folder, useFolder
    exe/                desktop, update
    search/             relaxPool, relaxWorker, relaxLog, useSolver
    kökte kalır:        changelog (yayinla.mjs ve surum.yml onu yoluyla okuyor); drag,
                        rowDrag, gridChrome, gridFit, scrollFade, ribbonScroll, poolSplit
  ui/
    ribbon/             RF10 (adım 5): sekme başına bir dosya
    lists/              Paste, Summary (bitti); RF12 (adım 5): YENİ ListScreen,
                        ListTools, useRowOrder, CapacityRows, AddPanel
    program/            adım 4: Program, Grid, LessonPool, Inspector, Suggestions, Check, steps
    print/              adım 4: Print (RF9)
    setup/ settings/ lessons/   bugünkü gibi
    kökte kalır:        main.tsx (index.html ve favicon.mjs onu yoluyla anıyor), App,
                        Root, T.tsx, props, küçük ortak parçalar
```

**Eski yol → yeni yol.** Paket turları bu sırayla, her biri `main`'den açılan kendi dalında
ve `.claude/skills/paket-turu` ile. Tabloda satırı olmayan bir dosya taşınmaz, sorulur.
Sıra değişti (2026-10-09 gece, Alp'in kararı): 4 (`platform/storage`), 5 (`platform/exe`) ve
6 (`pure/io`), özellik oturumunun `fix/veri-kaybi` dalı (VK1, VK2) `main`'e girene kadar
bekledi, çünkü o düzeltmeler aynı dosyalara dokunuyor. O dal girdi (2026-10-10); 7
(`platform/search`) bitti, sıradaki 4.

| Sıra | Paket | Eski | Yeni | Not |
|---|---|---|---|---|
| 1 | lang | `leaf/lang/*` | yerinde, `leaf/lang/index.ts` eklendi | bitti (3c769a0) |
| 2 | lists | `ui/setup/{Paste,Summary}` | `ui/lists/` | bitti (0d97c82, 3f1944e) |
| 3 | platform/prefs | `platform/{theme,printOptions,programColor,toolState}` | `platform/prefs/` | bitti (`refactor/prefs`); RF20 yapılmadı, RF11'e bağlı |
| 4 | platform/storage | `platform/{libraryStore,planStore,storageReport,useStore,usePlans,download,folder,useFolder}` | `platform/storage/` | `fix/veri-kaybi` (VK1, VK2) girdi, sırada |
| 5 | platform/exe | `platform/{desktop,update}` | `platform/exe/` | `fix/veri-kaybi` (VK1, VK2) girdi, sırada |
| 6 | pure/io | `pure/{parseState,bundle,library,import,sample}` | `pure/io/` | `fix/veri-kaybi` (VK1, VK2) girdi, sırada |
| 7 | platform/search | `platform/{relaxPool,relaxWorker,relaxLog,useSolver}` | `platform/search/` | bitti (`refactor/search`); `relaxPool` paketin içinde |
| 8 | adım 4 | `pure/{programs,programMask}`, `ui/{Program,Grid,LessonPool,Inspector,Suggestions,Check,steps,Print}` | `pure/program/`, `pure/paper/`, `ui/program/`, `ui/print/` | RF8, RF9 |
| 9 | adım 5 | `ui/Ribbon.tsx`, `ui/{ListTools,useRowOrder,CapacityRows,AddPanel}` | `ui/ribbon/`, `ui/lists/` | RF10, RF12, RF11 |
| 10 | pure/relax | `pure/{relax,sat}.ts` | `pure/relax/` | RF1, mutasyon tabanından sonra; stryker, kapsam ve TESTPLAN aynı commit'te |
| 11 | constraints ve entities | `pure/{constraints,entities}.ts` | `pure/constraints/`, `pure/entities/` | RF6, RF5; aynı liste kuralı |
| 12 | kökte kalanlar | ağaçta "kökte kalır" yazanlar | yerinde | son tur: her birinin kökte kalmasının sebebi yazılı mı |

**Derin import kuralı.** `.dependency-cruiser.cjs`'te `paket-ici-alan` (bir paketten başka
bir paketin içine) ve `paket-ici-kok` (bir katmanın ya da `src/`'nin kökünden bir paketin
içine): dışarıdan bir pakete yalnız `index`'i üstünden girilir, testler muaf (ac45672).
Yeni bir paket klasörü kurala kendiliğinden girer, kuralın değişmesi gerekmez.

**Taşıma yöntemi.** Taşıma, `index.ts` ve import'ların ona dönmesi tek commit (2026-10-09
gece, Alp'in kararı). Bayt aynılığı `index` eklenmeden önce çalışma ağacında ölçülür: yalnız
`git mv` ve yolların derlemesi, aynı HEAD'de taşımadan öncekiyle (commit kimliği gömülü
olduğu için aynı HEAD, tuzak 114); sonucu commit mesajına yazılır. Sonra `index` ve
import'lar; derlenen dosya değişir (`platform/prefs`'te +6 bayt, modül sırası), boyut ve
worker testleri (`temel.spec.ts`, `otomatik.spec.ts`) bakılır. Kırmızı bir ara commit
bırakılmaz: derin import kuralı yeni klasörü doğduğu anda kapsar, yalnız `git mv`'li hâl
`sinir`'de kırmızıdır. Biçim düzeltmesi ayrı commit. Eski yöntem iki commit'ti;
`platform/prefs` turu onunla yapıldı ve taşıma commit'i `sinir`'de 13 ihlalle kırmızı kaldı.

**Refactor planı.** Adımlar sırayla, her biri bir öncekinin testleri yeşilken.

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
      kalkması, `theme.ts`'in çift adları. RF10 RF8'e, RF20 RF11'e bağlı. RF20'nin
      bağı ölçüldü (2026-10-09, `platform/prefs` turu): yön "çağıranlar tercih nesnesini
      alır", ve kısa adların (`readTheme`, `applyRibbon`, `readScale`…) en büyük çağıranı
      App; App'e dokunmayan yarısı (`readDock`, `writeDock`, `readDockHeight`,
      `writeDockHeight`, `applyRibbonAuto`, `readIntroSeen`) tek başına dosyayı yarı yarıya
      iki biçimde bırakırdı, yapılmadı.
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
- [x] **RK7 `relax.test.ts`'in süresi yeniden ölçülsün.** [TESTPLAN.md](TESTPLAN.md)
      "yaklaşık 45 saniye" diyor. 2026-10-08'de `npm test`'in içinde 136,8 saniye (yardımcı
      ajanlar koşarken) ve 155,8 saniye (`performance` profili, başka bir oturum açıkken),
      kapsam altında 402 saniye. 2026-10-09'da `low-power` profilinde 391,6 saniye. Sessiz
      bir pencerede ve `performance` profilinde tek başına ölçülür, TESTPLAN'ın cümlesi
      sayıyla düzelir.
      Kapandı (2026-10-09, hız oturumu): dört gerçek veri testi iki dosyaya ayrıldı. CI'da
      `relax.test.ts` 234–317 s'den 7,3 s'ye, iki yeni dosya 131 ve 109 s yan yana, birim
      adımı 237–320 s'den 146 s'ye (WORKLOG). TESTPLAN'ın cümlesi sayısız düzeldi.
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
- [~] **RK12 `npm run lint`'e `--max-warnings 0`.** 2026-10-09'da üç `exhaustive-deps`
      uyarısından ikisi kapandı: `Commands.tsx`'te gereksiz `ui` bağımlılığı çıktı (değeri
      hiçbir yerde okunmuyordu), `App.tsx`'te komut listesinin bağımlılığına gerekçeli bir
      susturma kondu (üç `toggle` yalnız listedeki `theme`, `ribbon` ve `motion`'ı okuyor;
      RF11 onları kaldırınca `reportUnusedDisableDirectives` susturmayı kendisi bildirir).
      Kalan `useRowOrder.tsx`'in eksik `t`'si main'in işi. O düzelince `--max-warnings 0`
      açılır. **Akşam, `bakim/refactor-istekleri` dalında:** `useRowOrder`'ın `t`'si
      bağımlılıkta (testli), `App.tsx`'in susturması da kalktı (üç `toggle` `useCallback`).
      `eslint src` 0 uyarı; bayrağı refactor oturumu açar. `Commands`'ın `Props`'unda `ui` hâlâ duruyor ve App onu geçiriyor; ölü prop
      RF11'de gider.

- [x] **RK13 `mutasyon-kaniti.sh --liste`'de `/` taşıyan bir ad satırı koşmadan "yesil"
      sayıyor.** Satırın çıktısı `scratch/mutasyon-kaniti/<ad>.log`'a yönleniyor; ad `/`
      taşıyınca dosya açılamıyor, bash fonksiyonu hiç çağırmıyor ve 1 dönüyor, 1 de
      "yesil" demek. Kırmızı beklenen satırda "TUTMUYOR" çıkıyor (güvenli yan), yeşil
      beklenen satırda sahte bir "tutuyor" çıkar. 2026-10-09'da `refactor/lists`'te üç satır
      böyle koştu, adlar değişince üçü kırmızı.
      Kapandı (2026-10-09, `refactor/prefs`, "Betikler: mutasyon listesi koşmayan satıra
      sonuç yazmıyor (RK13)"): günlük `<sıra>-<ad>.log`, açılamazsa betik 64 ile duruyor,
      kirmizi ve yesil yalnız test komutu koştuysa yazılıyor. Kanıt WORKLOG'da.

- RK14 §7'de, B7.27'nin arkasında (2026-10-10, sıra Alp'in).

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

**Biten (dal).** T1 (`leaf/lang/index.ts`, 3c769a0), T2a (`Paste` ile `Summary`
`ui/lists/`'e, 0d97c82), T2b (`ui/lists/index.ts`, 3f1944e) ve derin import kuralı
(`paket-ici-alan`, `paket-ici-kok`, ac45672), 0 ihlalle girdi ve mutasyonla kanıtlandı
(WORKLOG 2026-10-09, `refactor/lists`). Hedef ağaç ve tablo bu bölüme yazıldı, RK13 kapandı
(6b282ce), `platform/prefs` paketi (185e9cc, 7334d19; WORKLOG 2026-10-09, `refactor/prefs`).
`useSolver`'ın birim testi ve `platform/search` paketi (947a4cc, c423037; WORKLOG
2026-10-09, `refactor/search`).

**Sıradaki iş (dal).** Paket turları yukarıdaki "Eski yol → yeni yol" sırasıyla, `main`'den
yeni dallarda, `.claude/skills/paket-turu` ile. 7 (`platform/search`) bitti; `fix/veri-kaybi` girdi, sıradaki 4
(`platform/storage`), sonra 5 ve 6. Adım 2'nin süre ölçümleri temiz koşulda
(`scripts/temiz-kosul.sh`): `npm test` üç kez, Stryker'ın kuru koşusu ve iki kalibrasyon
koşusu, dosya başına tahmin.

### 8l · Test programı (2026-10-09)

Kaynak 2026-10-09'un analizi (`test/kapsam`): rapor `scratch/test-plan/PLAN.md`'de, git
dışında, ölçümleri ve betikleri yanında; özeti [WORKLOG.md](WORKLOG.md)'nin aynı günkü
girdisinde. Kurallar CLAUDE.md'nin "Test programı" bölümünde, kararlar
[DECISIONS.md](DECISIONS.md)'de (2026-10-09). Maddeler TP numarasını taşıyor, yolda çıkan
ürün ve araç bulguları TB numarasını.

**Kararlar (kullanıcının, 2026-10-09 akşam).**

| K | Karar |
|---|---|
| K1 | Görsel regresyon geri gelir, yalnız kapta ve sıfır eşikle; yerel koşu referans üretmez (DECISIONS) |
| K2 | Gerçek paketin adsız fikstürü depoya girer, `tam-dolu-kurs.json`'un yöntemiyle (öğretmen baş harfleri; e-posta ve serbest metin yok); commit'ten önce dosyada gerçek ad aranır, komut ve sonuç rapora |
| K3 | Bileşen katmanı (Vitest browser mode) yalnız girdi bileşenleri için açılır |
| K4 | Paket turlarının hedef ağacını refactor oturumu yazar; aşağıda "bekler" diyen maddeler ona göre işaretli |
| K5 | Yavaş süitler (mutasyon, uzun süre, görsel, Windows'ta gerçek exe, sürüm yükseltme) push'u, birleştirmeyi ve sürümü beklemez; gece ya da haftalık, kırmızısı görünür bir yere düşer (CLAUDE.md). Tek istisna (2026-10-10): `yayinla` Windows E2E'yi bekler (DECISIONS) |
| K6 | Runner'lar ve artefakt aksiyonları sabit, 2026-10-19'dan önce (yapıldı) |
| K7 | Dependabot alerts ve güvenlik güncellemeleri: ayarı Alp açar |
| K8 | Mutasyonun iş akışı `ci/mutasyon-parca` dalında; C1 o dal birleşince ölçülür |
| K9 | VK1 (iki kopya), VK2 (kota) ve `useHttpsScheme`'in sabitlenmesi, düzeltmeleri ve testleriyle `fix/veri-kaybi` dalında; B1 ve B3 o dala geçti |
| K10 | Yeni WebKit süiti eklenmez (DECISIONS); gerçek exe testleri olduğu gibi |

**Bekleme işareti** (K4, §8k'nin hedef ağacına ve sıra tablosuna göre, 2026-10-09 gece).
"Bekler: sıra N" o paket turu `main`'e birleşmeden başlamaz; sıra 4, 5 ve 6 ayrıca
`fix/veri-kaybi`'yi bekliyor. "—": yollardan bağımsız, hemen. Bir madde turdan önce
yazıldıysa (TP4 gibi) yollarını o tur taşır.

**Faz 0 · hazırlık**
- [x] **TP1 Runner'lar ve artefakt aksiyonları sabit, Ubuntu 26.04 kanaryası** (K6). `ci.yml`,
      `site.yml`, `windows.yml`; `kanarya.yml` yeni. `surum.yml` dokunulmadı (`ubuntu-latest`,
      `windows-latest`, `upload-artifact@v4`, `download-artifact@v7` orada kaldı).
- [x] **TP2 Program kuralları ve kararlar** CLAUDE.md'de ve DECISIONS'ta.

**Faz 1 · veri kaybı**
- [→] B1 iki kopya, B3 kota: `fix/veri-kaybi` dalında (K9).
- [x] **TP3 Kapatırken bekleyen kayıt (B2).** 400 ms'lik `SAVE_DELAY` içinde kapanan sekme.
      Ölçüldü: `beforeunload` koşarsa değişiklik kalıyor, koşmazsa (süreç öldü) kalmıyor; ikincisi
      sözleşme. `e2e/kapanis.spec.ts` (depo, yeşil) ve `klasor.spec.ts`'te klasör yarısı
      (BİLİNEN KUSUR, TB7); ikisi de sayfanın saatini durdurup bekleyen yazımı önce doğruluyor,
      ikisi de mutasyonla kanıtlı. Exe'de pencereyi kapatmanın WebDriver yolu yok
      (`plugin:window|close not allowed by ACL`): exe'nin yarısı elle.
- [~] **TP4 Fuzz (B4).** `readPlanFile`, `parseBundle`, `import.ts`'in `parse*`'ları; değişmez:
      ya ret ya tutarlı plan, asla istisna. `npm test`'te kısa, gece uzun. Kullanıcı bu fazda
      istedi, yani pure turundan önce bugünkü yollarla yazılır; tur yolları taşır.
      **Yapıldı (`src/fuzz.test.ts`):** "Dosyadan aç" üç kaynakta (bozulan dosya ya ret ya
      bütün plan; dört listeden biri yoksa ret; kesik dosya ret) ve Excel yapıştırmasının dört
      okuyucusu; TB1, TB6 ve TB9 "BİLİNEN KUSUR"; dört mutasyonla kanıtlı. `FUZZ_RUNS` gece
      kipi için var, onu koşan iş akışı yok (TP13 ile birlikte). **Kalan:** paket yolu
      (`parseBundle` ve arkasındaki `parseState`). **Bekler: TB8'in düzeltmesi ve sıra 6**
      (kullanıcının kararı, 2026-10-10); TB8'in kendi testini düzelten dal yazar. Dosya sıra
      6'da (`pure/io`) taşınır, yolları o tur değiştirir.
- [ ] **TP5 Veri yolunun mutasyonu (B5).** Kancaların kararları saf fonksiyonlara, onlar
      Stryker listesine. **Bekler: sıra 4** (`platform/storage`: `useStore`, `usePlans`,
      `planStore`, `libraryStore`, `folder`, `useFolder`, `download`).

**Faz 2 · gerçek ortam**
- [x] **TP6 Gerçek paket fikstürü, adsız (B6, K2).** En yeni gerçek dosya bir paket (v1,
      içinde v14 plan, 330 yerleşim); `fixtures.test.ts`'e bir `describe`. —
      **Yapıldı (2026-10-10):** `src/fixtures/gercek-paket-v1.json`, `scripts/adsiz-paket.mjs`
      (adlar `tam-dolu-kurs.json`'dan kimlikten kimliğe; o dosyada olmayan dize yazılmıyor).
      "gerçek paket, adsız" bloğunda beş test, dört mutasyonla kanıtlı. Commit'ten önce gerçek
      ad araması: commit'in diff'inde 0 eşleşme (komut ve liste `scratch/test-plan/b6/`).
- [~] **TP7 Windows'ta gerçek exe (B7).** `webdriver.mjs`'e Windows (ikili yolu,
      `--native-driver`, `taskkill`, dil, runner koruması), spec'te platform dalları,
      yeni bir "exe-windows" iş akışı (haftalık ve `paths` süzgeçli `main` push'u, yavaş süit). —
      **Yazıldı (2026-10-10):** `exe-windows.yml`, `yayinla` onu da bekliyor (DECISIONS
      2026-10-10). Linux'ta süit değişmeden yeşil (13 geçti, Windows'a ait 1 atlandı).
      Windows'ta yeşil görülmeden bitti sayılmaz.
- [ ] **TP8 Sürüm yükseltme (B8).** Runner'da gerçek exe ile yerel takas, veri kalıyor mu;
      `surum.json` fikstürü. Yavaş süit. TP7'ye bağlı.
- [x] **TP9 Köprü kontratı (B9a).** Rust komutları = `desktop.ts`'in çağrıları = taklit.
      ~~Bekler: sıra 5~~ (kullanıcı 2026-10-10'da Faz 2'ye aldı): `src/kontrat.test.ts` hiçbir
      modülü import etmiyor, `desktop.ts`'i adıyla buluyor, taşıma ona dokunmaz. 25 test, on
      bir mutasyonla kanıtlı.
- [x] **TP10 Güncelleme kontratı (B9b).** `surum.yml`'in yazdığı, `update.rs`'in okuduğu,
      kayıtlı Release fikstürü. — **Yapıldı (2026-10-10):** `src/kontrat.test.ts`'in ikinci
      yarısı, `src/fixtures/release-v2.2.0/` (v2.2.0'ın dosyaları bayt bayt ve varlık listesi);
      sekiz test, beş mutasyonla kanıtlı. Rust tarafında yeni test yok: `serde_json` doğrudan
      bağımlılık değil, alanlar `update.rs`'in metninden okunuyor.
- [ ] **TP11 Linux'ta `cargo test`, `ci.yml`'de.** —
- [x] **TP12 Brave alt kümesi, yerel config (B10).** Ölçüldü: `file://` açılıyor, depo
      kalıcı, font gömülü, hata ve ağ isteği yok. — **Yapıldı (2026-10-10):**
      `playwright.brave.config.ts`, `npm run test:brave`; `temel`, `planlar`, `erisim`, 59/59.
      Brave'de `showDirectoryPicker` yok (TESTFINDINGS); ölçüm Brave'de onu bekliyor.

**Faz 3 · zayıf makine**
- [ ] **TP13 Uzun süre açık kalma (B11).** 2 000 sürükle + geri al döngüsü, yığın ve DOM
      eğimi. Yavaş süit, gece. İlk 300 döngüde DOM düz, yığın ~3 kB/döngü (ayrılamadı). —
- [ ] **TP14 Zayıf makine vekili (B12).** Ölçüm betiği; vekil, babanın cevabı değil.
      Kirli ilk sayılar: arama sırasında süreç ağacı +0,8–1,1 GB. Temiz koşulda tekrarlanır. —
- [ ] **TP15 Performans (B13).** İş sayaçlı eşikler ana E2E'de; süre eşikleri ayrı config,
      yalnız temiz koşulda, eşikler o ölçümden. Bu oturumun süreleri eşik olamaz. —

**Faz 4 · güvenlik, metin, kabul**
- [ ] **TP16 `npm audit --omit=dev` CI'da (B14a).** Bugün 0 (14 açığın hepsi geliştirme
      aracında). K7'nin depo tarafı: `.github/dependabot.yml`'in bayat yorumu. —
- [ ] **TP17 İçe aktarılan adlarda betik ve HTML (B14b).** Bugün `innerHTML` yok, gerileme
      koruması. —
- [ ] **TP18 Metin bütçesi (B15).** Ekran başına kelime ve diyalog başına soru, taban;
      ilk sayılar PLAN'da (ör. boş proje 82, Program 402, babanın Program'ı 562). —
- [ ] **TP19 Kabul (B16).** Tık ve soru sayacı, taban, K1–K15 senaryoları. —
- [ ] **TP20 Bileşen katmanı (B17, K3).** `@vitest/browser`, girdi bileşenleri. `LimitBox`,
      `ColorPick` ve `Field` ağaçta `ui/`'nin kökünde kalıyor (sıra 12 yalnız gerekçesini
      yazar), `AddPanel` sıra 9'da `ui/lists/`'e gidiyor. **Bekler: sıra 9** (`AddPanel`'in
      yarısı); köktekiler —.

**Faz 5 · var olanlar**
- [ ] **TP21 Mutasyon listesi ve sınıflama (C1).** `relax.ts`, `sat.ts`, veri yolu; her
      hayatta kalan üç sınıfta. **Bekler:** `ci/mutasyon-parca` (K8), sıra 10 (`relax.ts` ve
      `sat.ts`, "pure/relax" paketi; tur stryker listesini aynı commit'te değiştiriyor), sıra 4 ve 6
      (veri yolu ve okuyucular).
- [ ] **TB10 Gerçek exe süitinde kırmızı bir test sürücüyü yetim bırakabiliyor (2026-10-10).**
      Kapanışı takılan bir test `tauri-driver`'ı 4444'te bırakıyor, sonraki her test
      "Maximum number of active sessions" ile düşüyor (TESTFINDINGS). Süiti başlatmadan önce
      port'u tutan sürücüyü görmek ya da fikstürün kapanışına süre koymak adaylar; ürün kusuru
      değil.
- [ ] **TP22 Kararsızlık (C2).** `erisim.spec.ts:116`'nın kök sebebi bulundu: Windows'ta üç
      axe taraması 30 s bütçenin ~25 s'i, en ağırı Çıktı; test üçe bölünür. CI'da JSON
      raporu ve 30 günlük kararsız sayacı. —
      **Kök neden adayı (2026-10-10, kullanıcının isteği):** `kapanis.spec.ts` ve
      `klasor.spec.ts`'in saati `now + 1_000`'de durdurması ("Test: saatin durduğu an bir
      saniye ileride"). Pay ölçülmedi, bir CI düşüşünden seçildi: zamanı okumakla durdurmak
      arasında bir saniyeden fazla geçen bir runner aynı hatayı (`Cannot fast-forward to the
      past`) yeniden verir, ve o saniyeye bir gün bir zamanlayıcı düşerse (`SAVE_DELAY`
      400 ms, klasör 2 s) test sessizce başka bir şeyi ölçer. **İkinci aday (2026-10-10):**
      gerçek exe süitinde kare ölçümünün yüke bağlılığı ve ardından yetim kalan sürücü (TB10).
- [ ] **TP23 Erişilebilirlik tabanı (C3).** Düzeltmeler `main`'de; burada yalnız `BILINEN`'in
      küçülmesi. —
- [ ] **TP24 Kapsam tabanı (C4).** Önce TB3 çözülür. Liste için **bekler: sıra 10 ve 11**
      ("pure/relax", "pure/constraints" ve "pure/entities" paketleri; liste o turlarda değişiyor).
- [ ] **TP25 Bugünkü yazıcının paketi dondurulmuş (C5).** —
- [ ] **TP26 Gerileme kapısı (C7).** TESTFINDINGS'te her ürün kusuru bir teste bağlı. —

**Faz 6 · görsel regresyon (K1)**
- [ ] **TP27 Görsel regresyon, kapta.** Yedi sekme × iki tema, sıfır eşik, fark görüntüsüne
      bakmadan yenilenemez, haftalık arka planda. —

**Faz 7 · son kontrol**
- [ ] **TP28 Son kontrol.** Her katman hedefinde ya da DECISIONS'ta tarihli "yapılmıyor";
      CI tam doğrulama, yerelde yalnız exe ve temiz koşul ölçümleri; rapor.

**Yolda çıkan bulgular.** TB numaralı maddeler aşağıda (ayrı commit).

- [ ] **TB1 `readPlanFile` bozuk bir dosyada istisna atıyor, ve kimse yakalamıyor (2026-10-09).**
      Analizin fuzz yoklaması (fast-check, üç dosya × 3 000 bozulma): girdilerin %2–5'inde
      `TypeError` (`reading 'trim'`, `'weeklyHours'`, `'id'`). "Dosyadan aç"ta `App.tsx`'in
      `fileChosen`'ı onu yakalamıyor: plan değişmiyor ama kullanıcıya hiçbir şey söylenmiyor
      (sessiz ret). Aynı `parseState` açılışta depodan okurken de korumasız (`useStore.ts`'in
      `initialBox`'ı), orada bozuk bir plan boş ekran olur (koddan, ölçülmedi). Test TP4'te
      "BİLİNEN KUSUR" olarak çivili; düzeltme `main`'de.
- [ ] **TB2 `LimitBox`'ın üst sınırı klavyeyle aşılıyor (2026-10-09).** Kutu `max=16` taşıyor
      ama `onBlur` yalnız alt sınırı kırpıyor: 40 yazılınca `onSet(40)` (analizin bileşen
      denemesi, gerçek Chromium). Günde en fazla 40 saat kabul ediliyor. Veri kaybı değil.
- [ ] **TB3 `npm run kapsam` `library.ts`'i yüzde 50 ölçüyor (2026-10-09).** Raporun
      "kapsanmadı" dediği on iki fonksiyonun hepsinin geçen testi var (`library.test.ts`).
      Ölçüm kusuru; aday sebep aynı test dosyasının `import.meta.glob('./**/*.ts', { query:
      '?raw' })`'si. TP24'ün tabanı bundan önce çözülmeli, yoksa yanlış sayıyı dondurur.
- [x] **TB4 `useRowOrder.tsx`'in eksik bağımlılık uyarısı (2026-10-09).** `t` `useCallback`'in
      bağımlılıklarında yoktu (`npm run lint`'in tek uyarısı). Analiz sırasında `main`'de
      düzeldi (b84ab3e, "Kanca: liste tutamağı dil değişince yeni dilde").
- [→] **TB5 `useHttpsScheme` sabitlenmemiş (2026-10-09).** Exe'nin verisi
      `http://tauri.localhost` kökeninde; ayar bir gün `true` olursa köken değişir ve veri
      görünmez olur. `fix/veri-kaybi` dalında sabitleniyor (K9).
- [ ] **TB6 Bir dersin haftalık saati anlamsız bir sayıyla kabul ediliyor (2026-10-09).** Aynı
      fuzz yoklaması, sonra elle: `weeklyHours` −5 ya da 10⁹ taşıyan bir ders olduğu gibi
      açılıyor (2,5 ise 3'e yuvarlanıyor), dosya reddedilmiyor.
      Test TP4'te "BİLİNEN KUSUR".
- [ ] **TB9 Yapıştırılan haftalık saatin üst sınırı yok (2026-10-09).** `parseLessons` saati
      yalnız pozitif ve tam sayıya çeviriyor; blok listesini ondan kuruyor
      (`Array(saat / blok)`). 100 000 saat kabul ediliyor, 10 milyonda beş milyonluk bir dizi
      (22,7 ms, kirli). Fuzz bunu kendiliğinden buldu: üreteç onaltılık ve üslü yazımlarla
      (`Number`'ın kabul ettiği) dev bir sayı üretti ve koşu dakikalarca sürdü. Bir hafta en
      çok gün × saat kadar saattir. Test `src/fuzz.test.ts`'te "BİLİNEN KUSUR". TB6'nın
      yapıştırma tarafındaki eşi.
- [ ] **TB7 Kapanan sekmenin son değişikliği klasöre inmiyor (2026-10-09).** Klasör (sitede
      Dosya Sistemi Erişimi, exe'de Belgeler) son değişiklikten 2 s sonra yazılıyor; araya giren
      kapanışı `useFolder.ts`'in `beforeunload` flush'ı karşılamalı, ama flush eşzamansız bir
      yazımı yalnız başlatıyor ve sayfa yazım inmeden gidiyor. Sitede beş denemenin beşinde
      ölçüldü (programı açmayan aynı kökenli bir sayfadan okunarak). Veri kaybolmuyor: depo
      tutuyor ve bir sonraki açılış klasörü yazıyor; kaybolan, klasörün kapanış anında güncel
      olması. Exe'de aynı yol Tauri'nin eşzamansız köprüsünden geçiyor, ölçülmedi. Test
      `klasor.spec.ts`'te "BİLİNEN KUSUR". **Nerede düzeltilecek (kullanıcının kararı,
      2026-10-09, 2026-10-10'da TB8 eklendi):** `fix/veri-kaybi`'de değil; TB8 ile birlikte
      ikinci bir düzeltme dalında. O dal `fix/veri-kaybi` `main`'e birleşir birleşmez
      `main`'den açılır, çünkü ikisi de `useFolder.ts`'e dokunuyor ve aynı anda dokunmamalı.
      `fix/veri-kaybi` kapanış flush'ına dokunmuyor, yani test o daldan sonra da aynı kalmalı.
- [ ] **TB8 "Tümünü dosyadan aç" DK11'in deliğini taşıyor: eksik plan boş plan olarak açılıyor
      (2026-10-09, veri kaybı sınıfı, onaydan sonra).** Tek dosya yolu (`readPlanFile`) öğretmen ya
      da ders alanı hiç olmayan bir dosyayı "eksik" diye reddediyor (DENETIM DK11'in düzeltmesi);
      paket yolu (`usePlans.ts`'in `replaceLibrary`'si) her planı çıplak `parseState` ile
      okuyor ve aynı planı 0 öğretmen, 0 ders, 0 yerleşimle kabul ediyor. Ölçüldü (Vitest,
      adsız dizili fikstürden kurulan tek planlı paket; `teachers`, `lessons` ya da ikisi
      silinince dördünde de paket kabul, tek dosya ret). Onay sorusu yalnız plan sayısını
      söylüyor, sonra "1 plan açıldı" deniyor ve bu bilgisayardaki bütün planlar gidiyor;
      geri alınamaz. Kalan: oturum başının yedek zinciri (yalnız o an açık olan plan) ve
      exe'de Belgeler'in önceki günleri. Arayüzde uçtan uca koşulmadı; zincir koddan.
      **Nerede düzeltilecek (kullanıcının kararı, 2026-10-10):** `fix/veri-kaybi`'de değil;
      TB7 ile birlikte ikinci düzeltme dalında, `fix/veri-kaybi` `main`'e birleşir birleşmez
      `main`'den açılan. **Testini o dal yazar**, test dalı yazmaz. TP4'ün paket yolu fuzz'u
      bu düzeltmeyi ve sıra 6'yı bekler.

## §9. Ham notlar

[TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de, §9 başlığı altında. Yeni bir ham not oraya, sonuna eklenir.

---

## §10. ARŞİV

Biten turlar tarih sırasıyla [TODO-ARCHIVE.md](TODO-ARCHIVE.md)'de, oturum başında okunmaz.
