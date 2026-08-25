# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-25 (onuncu oturum: **veriler nerede + bütün planlar tek dosyada**, `v1.0-teslim` dalında)

## Şu anki sürüm hedefi

**v0 → v0.9** — elle dizme + yapılabilirlik kontrolü + okul düzeni ve kurallar +
iki arayüz turu + **otomatik dizme**. TASKS'ta v1 olarak duran otomatik doldurma
bu turda geldi; kullanıcı istedi.

- **v0 çıkma şartı:** babam gerçek verisiyle bir haftalık programı baştan sona dizip
  çıktısını alabiliyor. → *araç çalışıyor ve gerçek tarayıcıda doğrulandı; gerçek
  veriyle denenmedi*
- **v0.5 çıkma şartı:** program dizilemediğinde sebebini araca sorup öğrenebiliyor.
  → **sağlandı**
- **v0.6 çıkma şartı:** babam okulunun gerçek gün/saat düzenini ve öğretmen sınırlarını
  araca tarif edebiliyor. → **sağlandı** (gün seçimi, zil saatleri, sınıf/derslik
  müsaitliği, dört kural kutusu)
- **v0.7 çıkma şartı:** araç babanın tarayıcısında tasarlandığı gibi görünüyor ve
  renkler hâlâ işlevini görüyor. → **sağlandı** — koyu tema + `color-scheme`, ve
  kontrastı **hesaplayarak** ölçen E2E testleri. *Babanın kendi makinesinde
  görülmedi; ölçüm buradaki Chromium'da yapıldı.*
- **v0.8 çıkma şartı:** localhost'ta gözle bakınca çıkan liste kapandı; her öğretmen
  ve her sınıf kendi renginde, ayarlar kendi sekmesinde, branş seçiliyor, kapalı
  saatte kalan ders görünüyor. → **sağlandı** — hepsi gerçek tarayıcıda ölçülüyor
  (36 renk tek tek okunup karşılaştırılıyor, ayraç genişliği ve yazı boyu piksel
  olarak alınıyor). *Yine babanın makinesinde değil, buradaki Chromium'da.*
- **v1.0 çıkma şartı:** babam aracı çift tıklanan bir `.exe` olarak açabiliyor,
  aynı veriye siteden de bakabiliyor, ve birden fazla planı yan yana tutabiliyor.
  → **kısmen** — plan kitaplığı, taslaklar ve **bütün planları taşıyan tek dosya**
  bitti (4a–4d); site, PWA, Pages ve Tauri (4e–4i) duruyor.
- **v0.9 çıkma şartı:** araç haftalık programı kendisi dizebiliyor, dizilmiş bir ders
  sürüklenerek taşınabiliyor, ve ekranın tamamı kullanılıyor. → **sağlandı** —
  örnek veride 359 bloğun 359'u 87 ms'de ve **hiç geri sarmadan** yerleşiyor;
  altı sekmede dikey ve yatay taşma 0 px, ikinci sütunun dolu olduğu ölçülüyor.
  *Gerçek veri hâlâ yok; ölçümler örnek veriyle.*

---

## Durum özeti

| Aşama | Durum |
|---|---|
| Karar turu (sorular cevaplandı) | ✅ |
| Belgeler (CLAUDE.md, PLAN, STATUS, TASKS) | ✅ |
| İskele (Vite + React + TS + Vitest + singlefile) | ✅ |
| Çekirdek: `types.ts` + `constraints.ts` | ✅ 26 test |
| `store.ts` (reducer, geri al, kayıt, yedek, v1 göçü) | ✅ 5 test |
| Kurulum sekmesi + Excel yapıştırma | ✅ 17 test |
| Müsaitlik ızgarası | ✅ |
| Program ızgarası + kart havuzu | ✅ |
| Sürükle-bırak (Pointer Events) | ✅ **gerçek tarayıcıda doğrulandı** |
| Görünüm değiştirme (öğretmen ⇄ sınıf) | ✅ |
| Yazdırma | ✅ **taşma yok, PDF üretiliyor** |
| Kontrol sekmesi (v0.5) | ✅ 8 test |
| `file://` altında kalıcılık | ✅ **çalışıyor** |
| Kod dilinin İngilizceye çevrilmesi | ✅ bitti |
| **Zil saatleri (`bell.ts`)** | ✅ 9 test |
| **Gün seçimi + `remapDays`** | ✅ 11 test |
| **Sınıf ve derslik müsaitliği** | ✅ E2E dahil |
| **Kural kutuları (`rules.ts`)** | ✅ 20 test |
| **Şema v3 göçü** | ✅ birim + E2E |
| **Koyu tema + ölçülen kontrast** | ✅ 3 birim + 5 E2E |
| **Kurulum yedi adım** (`components/setup/`) | ✅ |
| **Öğle arası ayracı (3 ekran, 3 teknik)** | ✅ |
| **Müsaitlik döndürüldü** (satır = gün) | ✅ |
| **Otomatik kısaltma + çakışma uyarısı** | ✅ |
| **Silme onayı (dört varlık)** | ✅ 7 birim |
| **Branş kısaltmaları + şema v4 göçü** | ✅ birim + E2E |
| **Baskı A4 yatay, eşit sütunlu** | ✅ PDF MediaBox ölçüldü |
| **Görünüm simgeleri** | ✅ *(v0.8'de kep + öğrenci grubu oldu)* |
| **v0.8: palet 12 → 36, çakışmasız renk** | ✅ 11 birim + 6 E2E |
| **v0.8: sınıf renkleri, şema v5** | ✅ birim + E2E |
| **v0.8: Ayarlar sekmesi** (Kurulum 7 → 4 adım) | ✅ 5 E2E |
| **v0.8: branş listeden seçiliyor** | ✅ 5 E2E |
| **v0.8: başlangıç saati 24 saat / 5 dk** | ✅ 4 birim + 3 E2E |
| **v0.8: havuz görünümü takip ediyor** (hata) | ✅ 4 E2E |
| **v0.8: ince ayraç, büyük çarpı** | ✅ 4 E2E |
| **v0.8: kapalı saatte ders işaretleniyor** | ✅ 8 birim + 4 E2E |
| **v0.8: yazdırmada sayfa seçimi** | ✅ 4 E2E |
| **v0.9: sol kenar çubuğu, `.main` App'te** | ✅ 13 E2E |
| **v0.9: her sekmenin sağ sütunu dolu** (`.cols`) | ✅ ölçülüyor |
| **v0.9: sol tık taşır, sağ tık siler** | ✅ 5 birim + 7 E2E |
| **v0.9: otomatik dizme (`solver.ts`)** | ✅ 20 birim + 10 E2E |
| **v0.9: `occupy`/`vacate` eşdeğerliği** | ✅ 7 birim |
| **v0.9: sebep kodları (`blockerDetail`)** | ✅ 7 birim + 3 birim |
| **v0.9: Kontrol sekmesi test edildi** | ✅ 12 E2E |
| **v0.9: geri-al zinciri, hata yolları, boş ekranlar, klavye** | ✅ 28 E2E |
| **v0.9: görsel regresyon** | ✅ 20 referans (`npm run gorsel`) |
| **Çözücü dünya matrisi** | ✅ 21 dünya · 78 birim + 26 E2E · ağırlar `npm run cozucu` |
| **v1.0: çözücü kural baskısı altında çökmüyor** | ✅ 3/359 → **241/359 blok** · 6 yeni birim testi |
| **v1.0: plan kitaplığı (`library.ts`)** | ✅ 25 birim + 11 E2E · devralma **sıfır kopya** |
| **v1.0: taslaklar** | ✅ 4 E2E · taslak = `PlanInfo.draft`, ayrı varlık değil |
| **v1.0: paket dosyası (`bundle.ts`)** | ✅ 11 birim + 4 E2E · `bundleVersion: 1`, yeni anahtar YOK |
| **v1.0: "veriler nerede" paneli** | ✅ 5 birim + 2 E2E · gerçek anahtar adları ve boyutlar |
| Gerçek veriyle deneme | ⬜ **bekliyor** |
| Tauri ile `.exe` paketleme | ⬜ bekliyor |

**Testler: 402 birim + 223 E2E = 625, hepsi geçiyor. `tsc --noEmit` temiz.
`npm run build` → tek dosya `dist/index.html`, 331 KB, sıfır ağ çağrısı.
`npm run kontrol` toplam ~51 sn (E2E kısmı ~44 sn, 4 worker).** Ayrıca `kontrol`'ün
parçası OLMAYAN iki süit: 22 görsel referans (`npm run gorsel`, 5 sn) ve 7 gerçek
ölçekli çözücü testi (`npm run cozucu`, ~39 sn).

Ayrıntı: [TASKS.md](TASKS.md)

---

## E2E testi ne kanıtladı

`npm run test:e2e` gerçek bir Chromium açıp **`dist/index.html`'i `file://` üzerinden**
— yani babanın çift tıklayacağı dosyanın ta kendisini — babanın ekran boyutunda
(1366×768) sürüyor. Doğrulananlar:

- **`localStorage` `file://` altında çalışıyor.** Yerleştirilen ders sayfa kapatılıp
  açılınca duruyor. Kalıcılık tasarımının dayandığı varsayım doğrulandı.
- Fareyle sürükle-bırak: hayalet kart imleci takip ediyor, geçerli hücre yeşil,
  engelli hücre kırmızı, üst çubukta somut sebep (`"… müsait değil"`), Escape iptal
  ediyor, 2 saatlik blok iki hücre birden vurguluyor.
- Yerleşmiş karta tıklayınca blok tamamen kalkıyor, **Ctrl+Z** geri getiriyor.
- Sağa kaydırınca öğretmen sütunu sabit kalıyor; sayfa 1366×768'de dikey taşmıyor.
- Yazdırmada üst çubuk gizleniyor, **yatay taşma yok**, 20 sayfa PDF üretiliyor.
- Excel yapıştırma önizleme gösterip ekliyor; yedek dosyası doğru adla iniyor.
- Günlük saat 12→4 düşünce taşan yerleşimler temizleniyor.
- **Rename öncesi indirilmiş (v1) bir yedek, gerçek "Yedek yükle" düğmesinden
  seçilince açılıyor**; öğretmen, sınıf ve yerleşmiş 2 saatlik blok korunuyor.

Aynı tarayıcıdan ekran görüntüsü de alınabiliyor (`test-results/ekran/`, `.gitignore`'da).
Görsel bir değişiklik yaptıysan **çıktıyı göster, iddia etme**: sürükleme anında iki
hücrenin birden yeşil olduğu, kırmızı çubukta `"AÖ Çarşamba 1 saatinde müsait değil"`
yazdığı ve havuz sayacının `0/6 → 2/6` düştüğü tek karede görülüyor. Betiği **depo
kökünden** çalıştır, yoksa `node_modules` çözülmez.

### E2E'nin yakaladığı iki gerçek hata (ikisi de düzeltildi)

Bunlar birim testleriyle **bulunamazdı**; jsdom'un düzeni (layout) yok.

1. **Sürükleme hedefi ekran dışında kalıyordu.** 25 satır × 84 sütun 1366×768'e
   sığmıyor; ekranda ~13 satır, ~35 sütun var. Kullanıcı havuzdan kart alıyor ama
   bırakacağı satır ya da gün görünmüyorsa oraya **hiç ulaşamıyordu** — fare basılıyken
   kaydırma yapamaz. *Düzeltme:* sürükleme başlarken hedef satır ortaya kaydırılıyor
   (`scrollIntoView({ block: 'center' })`) ve imleç kenara yaklaşınca ızgara
   kendiliğinden kayıyor.

2. **Otomatik kaydırma yanlış anda tetikleniyordu.** Kart havuzu ızgaranın hemen
   altında; "alt kenara yakınsa aşağı kaydır" kuralı imlecin nerede olduğuna bakmıyordu.
   Sonuç: kullanıcı havuzdaki karta basar basmaz, daha kımıldamadan ızgara kendi
   kendine kaymaya başlıyordu. *Düzeltme:* kaydırmadan önce imlecin ızgaranın
   sınırları içinde olduğu kontrol ediliyor.

Üçüncü olarak, `CSS.escape` ile kurulan seçicinin rakamla başlayan `id`'lerde sessizce
eşleşmeyeceği fark edildi; kimlik seçiciye gömülmek yerine hedef satır elemanı
tutuluyor. Üçü de [PLAN.md](PLAN.md) tuzak 11–13 olarak yazıldı.

---

## v0.8 — gözle bakınca çıkanlar

Hepsi localhost'ta gerçek gözle ikinci denemede bulundu. Mantık ve veri modeli yine
sağlamdı; kusurların çoğu görünüş ve kullanım tarafındaydı. **Ama üçü gerçek hataydı**
ve ikisi kendini yıllarca saklayabilirdi:

1. **Havuz görünümü takip etmiyordu.** `buildPool` `view` almıyordu; sınıf görünümünde
   bir sınıfa ait kartlar havuzun her yerine dağılıyordu ve kartı kaldıran hayalet
   kartın kendisinden başka bir şey yazıyordu.
2. **Kapalı saatte kalan ders görünmüyordu.** Tarama yalnız BOŞ hücreye çiziliyor,
   dolayısıyla kart kapalı saati örtüyordu; `blocker()` yalnız olası bırakma için
   çalışır, Kontrol ise yalnız toplam kapasiteye bakar. Yani hiçbir ekran söylemiyordu.
   → **PLAN tuzak 16**
3. **Öğle arası ayracı "dar" tanımlıyken bir ders kadar genişti.** `.break-col` (0,1,0)
   `table.grid tbody td` (0,1,3) tarafından eziliyordu. → **PLAN tuzak 17**

Ayrıca `<input type="time">` boşaltılınca okul gününü sessizce 00:00'a alıyordu ve
baskıda `table.print th td.p-closed` seçicisi (`th` içinde `td`) hiç eşleşmiyordu.

**Renk artık kimlik.** 12 renkle 25 öğretmende renk tekrar ediyordu, yani havuz kartı
tek bir satırı göstermiyordu — kartın rengi zaten tam bunun için var. Palet 36 renge
çıktı ve CSS'ten `src/palette.ts`'e taşındı. Renkler elle seçilmedi: kontrast (≥4,5:1,
iki mürekkep için de) ve CIE Lab ayrımı kısıtları altında **en uzak nokta** yöntemiyle
arandı. Ölçülen sonuç eski paletten daha iyi:

| | eski 12 renk | yeni 36 renk |
|---|---|---|
| en yakın çift ΔE | 13,4 | **17,5** |
| art arda indeksler ΔE | — | **23,8** |
| ilk 25 renk (bir okul dolusu) ΔE | — | **20,0** |
| mürekkep kontrastı | 8,7 / 5,6 | **7,3 / 4,7** |

**Ayarlar ayrıldı.** Kurulum iki farklı türü bir arada tutuyordu: dönem başında
doldurulan dört liste ve yılda bir dokunulan okul ayarları. Kurulum artık 4 sayılabilir
adım, Ayarlar 4 bölüm. `Sıfırla` üst çubuktan Ayarlar → Veri'ye taşındı; `Dosyaya
kaydet` / `Dosyadan aç` üst çubukta kaldı (tuzak 7).

**Şema v4 → v5** (`ClassGroup.color`, `settings.subjects`). Göç `parseState` içinde,
birim **ve** gerçek "Dosyadan aç" yolundan test edildi. `spreadColors()` her yüklemede
çalışıyor: v4 dosyaları 12 renkle yazıldığı için çakışma kesin. Renkleri zaten tekil
olan dosya dokunulmadan geçiyor.

---

## Kod dili geçişi — ne yapıldı, ne riskliydi

Arayüz Türkçe, kod İngilizce (CLAUDE.md "Kod dili ve biçim"). Davranış değişmedi:
**kullanıcıya görünen tek bir metin değişmedi**, E2E'nin Türkçe metne göre eleman
bulan satırlarına dokunulmadı. CSS sınıfları, `data-*` öznitelikleri ve `#kok` →
`#root` değişimi `drag.ts` ve E2E seçicileriyle birlikte yapıldı.

**Asıl risk şema değişimiydi.** Alan adları Türkçeden İngilizceye geçince, bu
değişiklikten önce indirilmiş her yedek okunamaz hâle gelirdi — ve babanın elindeki
yedeklerin tamamı o biçimde. Karşı önlem:

- `schemaVersion` 1 → 2; `parseState` v1'i tanıyıp göç ettiriyor.
- `id`'ler hiç değişmediği için `unavailable` / `placements` anahtarları aynen taşınıyor;
  yerleşmiş program birebir korunuyor.
- Göç **iki ayrı yerde** doğrulandı: `store.test.ts` (birim) ve gerçek Chromium'da
  "Yedek yükle" düğmesinden dosya seçilerek (E2E). İkincisi olmasa göç kodu doğru olup
  gerçek yolun kırık olduğunu göremezdik.
- Bilinmeyen (ileri) bir sürüm gelirse `null` dönüyor — tahmin edilmiyor.

**Bilerek Türkçe bırakılanlar:** `localStorage` anahtarı (`ders-programi`,
`ders-programi-yedek-N`) ve indirilen yedeğin dosya adı. Bunlar kod değil, kayıtlı
verinin kimliği; "temizlik olsun" diye değiştirmek babanın programını görünmez kılardı.

---

## Ölçülen değerler

Örnek veriyle (25 öğretmen, 20 sınıf, 8 derslik, **6 gün × 12 saat**, 99 ders):

| Ölçüm | Değer |
|---|---|
| **Otomatik dizme** (99 ders, 359 blok, 426 saat) | **359/359 blok · 359 düğüm · 87 ms · hiç geri sarma yok** |
| Aynı okul, üç sınır Engelle (art arda 2 · günde 5 · aynı ders 1) | 3/359 blok · 33 842 düğüm · 15 sn → **241/359 · 241 düğüm · 43 ms** |
| Aynı okul, yalnız "art arda en fazla 2" Engelle | neredeyse boş · 15 sn → **424/426 saat · 1,6 sn** |
| Örnek okul %95 doluluğa yüklenmiş (`gercek-olcek-sikisik`) | 3/423 blok · 15 sn → **412/423 · 3,6 sn** |
| Kasten imkânsız dünya (`gercek-olcek-imkansiz`, %160 yük) | 22/708 blok → **159/708** (bütçe yine doluyor) |
| Sürükleme başlangıcı — havuzdan, DOLU ızgarada | **0,305 ms** |
| Sürükleme başlangıcı — ızgaradan (taşıma: `removeBlock` + `buildIndex` + 72 `check`) | **0,266 ms** |
| `dist/index.html` | **331 KB**, tek dosya, 0 ağ çağrısı |
| E2E paketi | **223 test, ~44 sn** (4 worker) |
| Birim paketi | **402 test, ~2,9 sn** |
| Çözücü stres paketi | **7 test, ~2,2 dk** (`npm run cozucu`, ayrı) |
| Müsaitlik hücresi | **~67 × 48 px** (34 px'ti; tablo 238 → 322 px) |
| Görsel referanslar | 22 dosya |
| Ekranda görünen öğretmen satırı | **10** (üst şerit 56 px'e indi) |
| Müsaitlik tablosu genişliği | 46px sabit hücreden **sütununu dolduran** tabloya |
| Baskı sayfası | A4 yatay (842×595 pt), 12 eşit sütun (±1px) |
| Palet | 36 renk, en yakın çift ΔE **17,5**, kontrast ≥ **4,7:1** |
| Öğle arası ayracı | **6 px** (hücre 34 px) |
| Kapalı saat "×" | **16 px**, kontrast AA |

Sürükleme başlangıcı asıl önemli sayı: babanın makinesi 20 kat yavaş olsa bile 6 ms.
Sayı 0,212'den 0,305'e çıktı ama karşılaştırma yanıltıcı — eski ölçüm **boş** ızgarada
alınmıştı, bu 426 saati dolu ızgarada. Taşıma (`removeBlock` + yeni `buildIndex`)
havuzdan sürüklemekten **daha ucuz**: kaynak blok düşülünce sözlük bir hücre eksiliyor.

Otomatik dizme sayısı asıl sürpriz: **359 blok için 359 düğüm**, yani hiç geri sarma
yok — sezgi ilk denemede doğru hücreyi buluyor. 20 kat yavaş makinede 1,7 saniye.
Bu sayı ilk yazımda **çok daha kötüydü** (57718 düğümde 26 blok); sebebi tuzak 21.

---

## Verilmiş kararlar

| Konu | Karar |
|---|---|
| Branş | **Öğretmenin** alanı, dersin değil. Her öğretmenin tek branşı var. |
| Sınıflar arası çakışma | Yok. Sınıf = kapalı öğrenci kümesi. |
| Derslik | Sınıfın **sabit** alanı. Seçim UI'sı yok, çakışma kontrolü var. |
| Ana ekran düzeni | Satır = öğretmen, sütun = 6 gün × 12 saat. Tek düğmeyle sınıf görünümü. |
| Renk | Her öğretmen ve her sınıf **kendi renginde**. Hücreyi daima öğretmen boyar; sınıf rengi satır başı noktası ve baskı başlığı. (2026-08-25) |
| Branş | Serbest metin değil, **listeden seçilir**. Liste Ayarlar'da yönetilir. (2026-08-25) |
| Sekmeler | **Altı**: Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar. (2026-08-25) |
| Kapalı saatte kalan ders | **Silinmez, işaretlenir.** Kararı baba verir (ilke 6). (2026-08-25) |
| Baskı sayfa seçimi | `State`'e girmez; **dışarıda bırakılanlar** tutulur. (2026-08-25) |
| Sürükle-bırak | **Pointer Events** (HTML5 DnD değil). |
| Cihaz | Windows masaüstü, fare. Tablet hedef değil. |
| Veri girişi | Elle + **Excel'den yapıştırma**. |
| Boşluk (pencere) kuralları | Hâlâ **yok**. İstenen o değildi (aşağıya bak). |
| **Hafta** | **Varsayılan 6 gün: Salı–Pazar. Pazartesi ders yok.** Checkbox'la değişir. |
| **Zil saatleri** | **Hesaplanır, saklanmaz**: 09:00 · 40 dk ders · 10 dk teneffüs · 30 dk öğle arası. Hafta içi 5., hafta sonu 6. dersten sonra. İkisi de 19:10'da biter. |
| **Müsaitlik** | Öğretmen + **sınıf** + **derslik**, üçü de tek `unavailable` sözlüğünde. |
| **Kurallar** | Art arda / günde en fazla / günde en az / bir dersin günlük sınırı. Her biri **Kapalı / Uyar / Engelle**. |
| **Sınır girişi** | **Okul geneli varsayılan + öğretmen ve ders bazında istisna** (`null` = varsayılan). |
| **Tema** *(v0.7 ✅)* | **Koyu tema + aç/kapa düğmesi.** Yasak listesinden "karanlık mod" ve "tema seçimi" çıkarıldı — tarayıcı zaten zorla karartıyor, kontrolü almak daha az karmaşa. Tercih `localStorage`'da, `State`'e girmez. |
| **Kurulum düzeni** *(v0.7 ✅)* | **Numaralı, sayaçlı yedi adım** (Branşlar 4. sırada). Kilitli sihirbaz değil. |
| **Müsaitlik ekseni** *(v0.7 ✅)* | **Satır = gün, sütun = ders** (aSc "Time off" düzeni). |
| **Baskı ekseni** *(v0.7 ✅)* | **Satır = gün, sütun = ders → A4 yatay.** Eşit sütun genişliği (`table-layout: fixed`). |
| **Branş kısaltması** *(v0.7 ✅)* | `settings.subjectShorts` — yalnızca değiştirilen saklanır, gerisi gömülü tablodan. **Şema v3 → v4.** Kurulum → Branşlar'da kutular varsayılanla **dolu** gelir; kullanılmayan branşlar "Hazır kısaltmalar" bölümünde. |
| **Kural limitleri varsayılanı** *(v0.7 ✅)* | **`0` = sınır yok, öyle kalır.** Branş kısaltmasının aksine "doğru cevabı" okuldan okula değişir; yanlış varsayılan hücreleri sessizce kırmızıya boyar. |
| **Silme onayı** *(v0.7 ✅)* | Dört varlıkta da **her zaman** sorulur; metin ne kaybedileceğini sayar. |
| Ölçek | ~25 öğretmen, ~20 sınıf, 8 derslik, 6 gün × 12 saat — hepsi ayarlanabilir. |
| **Teslim biçimi** | **Tauri ile gerçek `.exe`.** Tek HTML dosyası ara adım olarak kalır. |
| **Babanın işletim sistemi** | **Windows 10** — Tauri v2 destekliyor, yol açık. |
| **Kod dili** | **Arayüz Türkçe, kod İngilizce.** Geçiş yapıldı (2026-08-24). |
| **Depolama kimliği** | `localStorage` anahtarı ve yedek dosya adı **Türkçe kalır** — kod değil, veri kimliğidir. |
| **Sekme yerleşimi** *(v0.9 ✅)* | **Solda dikey kenar çubuğu**, 92px (daraltılınca 52px). Tercih `localStorage`'da, `State`'e girmez. |
| **Sağ sütun** *(v0.9 ✅)* | Her sekmede `.cols`: solda asıl iş, sağda o ekranın **anlamı**. Sağa konan hiçbir bilgi yeni değil. |
| **Yerleşmiş derse tıklama** *(v0.9 ✅)* | **Sol tık taşır, sağ tık siler**, Delete klavye eşdeğeri. Sol tık artık silmiyor. |
| **Otomatik dizme** *(v0.9 ✅)* | **Ana iş parçacığında, dilimli, iptal edilebilir.** Web Worker yok (tuzak 19). Kısıt mantığı `blocker()`'dan; solver kendi kuralını yazmaz. Kısmi sonuç uygulanır, tek geri-al adımı. |
| **Çözücü ayarları** *(v0.9)* | **Yok ve olmayacak** — iki düğme. Doğru cevap bir dönem kullanılmadan bilinemez (ilke 5). |
| **Görsel regresyon** *(v0.9 ✅)* | 20 referans, depoda, **ayrı komut**. `kontrol`'e bağlanmaz: sistem fontu makineye göre çözülüyor. |
| **Çözücü tavanı** *(v1.0 ✅)* | Her dersin **tavanı** arama başlamadan hesaplanır; `need` ona kırpılır. Ders bırakılmaz, tutabildiği kadarı dizilir. |
| **Tıkanma sayacı** *(v1.0 ✅)* | Izgara **20 000 düğüm** boyunca iyileşmezse bir dersten vazgeçilip en iyi ızgaradan devam edilir. Düğüm sayısı, saat değil: aynı girdi aynı çıktıyı vermeli. |
| **Birden fazla plan** *(v1.0 ✅)* | **Depo katmanında kitaplık.** `State` şeması ve `schemaVersion` değişmedi; plan kimliği tema/kenar çubuğu gibi makine tarafında duruyor. Yasak listedeki madde *plan* için kalktı, **aynı planın** sürüm ağacı için duruyor. |
| **İlk planın anahtarı** *(v1.0 ✅)* | **`ders-programi` olarak KALIR** (`planKey('1')`). Devralma tek bayt kopyalamaz; eski bir `dist/index.html` ve `ders-programi` okuyan her şey (yedek zinciri, E2E yardımcıları) çalışmaya devam eder. |
| **Taslak** *(v1.0 ✅)* | **Ayrı varlık değil**, `PlanInfo.draft` bayrağı — yerleşimi boşaltılmış bir plan. İkinci bir depo, ikinci bir şema, ikinci bir göç gerekmiyor. |
| **Yedek zinciri ve planlar** *(v1.0 ✅)* | Zincir **oturum başına**, plan başına değil: plan başına dört kopya 5 MB kotasını doldurur. Açılışta hangi plan açıksa ona ait; Ayarlar → Veri bunu yazıyor. |
| **Dosya biçimi** *(v1.0 ✅)* | **İki tane:** tek plan (`schemaVersion`) ve bütün planlar (`bundleVersion: 1`, `-tumu-` adında). Paket bir dosya biçimi, ikinci bir depolama anahtarı değil. |
| **Paket üst çubuktan açılmaz** *(v1.0 ✅)* | Üst çubuk paketi **reddedip yolu gösterir**. Bir planı açmak açık planı değiştirir; bir paketi açmak bütün kitaplığın yerine geçer ve geri alınamaz. |
| **Kota hatası sessiz kalmaz** *(v1.0 ✅)* | `writePlanText` / `savePlan` `boolean` döner. `safely()` yutulan bir kota hatasını sessiz kayba çeviriyordu (ilke 6). |
| **"Veriler nerede" ölçülür** *(v1.0 ✅)* | Panel gerçek anahtarları ve gerçek boyutları (UTF-16 kod birimi) yazar; E2E sayfanın gerçek anahtarlarıyla karşılaştırır. Ortam bugün iki değer: `file` / `site`. `exe` dalı 4h'de gelir. |
| **exe ⇄ site aynı veri** *(v1.0, karar)* | **Ortak bir `.json` dosyası.** exe otomatik yazar; site Dosya Sistemi Erişimi API'siyle aynı dosyaya yazar, olmayan yerde "Dosyaya kaydet"e düşer. Sunucu ve bulut senkron **yok**. |
| **Yayın** *(v1.0, karar)* | **GitHub Pages** (statik). Depo `ders-programi` olarak yeniden adlandırılacak. İlke 2'nin "deploy, domain yok" kısmı bilerek değişiyor; backend/veritabanı hâlâ yok. |
| Oturum sonu | Her oturumda TASKS + STATUS güncellenir (CLAUDE.md "Çalışırken"). |

---

## Plandan bilerek sapılan yerler

1. **Blok etiketi her hücrede tekrarlanıyor.** PLAN.md tuzak 9 "ikinci hücrede başlık
   tekrarlanmasın" diyordu; ama babanın gerçek aSc ekranında tekrarlanıyor
   (`311 311 311`). Alışkanlığı bozmamak için tekrarlandı, bloğun tek parça olduğunu
   aradaki ayracın soluklaşması gösteriyor. `rowspan` yine kullanılmadı.

2. **Yedek zinciri her değişiklikte değil, her açılışta kaydırılıyor.** Her değişiklikte
   4 × 100 KB JSON yazmak yavaş makinede sürüklemeyi takardı. Son 3 *oturumun* durumu,
   son 3 *tıklamadan* daha değerli. Ana kayıt yine her değişiklikte (400 ms gecikmeyle).

3. **Planda olmayan eklemeler:** `src/sample.ts` (gerçek ölçekte örnek veri),
   `src/App.test.tsx` (jsdom duman testi), `e2e/` (Playwright). Hepsi devDependency,
   çıktı dosyasını etkilemiyor.

4. **`store.ts` artık saf olmayan katmanda test edilen tek dosya.** Kural üç saf
   dosyayı zorunlu tutuyordu; `parseState` de eklendi, çünkü her yedek dosyası ve her
   `localStorage` okuması oradan geçiyor. Kırılırsa kayıp sessiz olur.

5. **`minPerDay` "Engelle" olamaz.** Kullanıcı "her kural için ayrı seçilebilsin" dedi,
   ama günün ilk dersini koyarken "günde en az 2 saat" her zaman ihlal edilir — sert
   yapılsa hiçbir gün başlatılamazdı. Bu tek kuralın açılır kutusunda *Engelle* seçeneği
   hiç görünmüyor, varsayılanı *Uyar*.

6. **Kapalı saatler için ikinci bir sözlük açılmadı.** `id`'ler üç varlık listesi arasında
   benzersiz olduğu için öğretmen, sınıf ve derslik aynı `unavailable` haritasını
   paylaşıyor. Kazanç: şema alanı yok, göç yok, `sanitize` dalı yok — sadece kimlik
   kontrolü üç kümeye bakıyor.

7. **`keys.ts` ayrı dosya oldu.** `rules.ts` sayım için anahtar üretmek zorunda ama
   `constraints.ts` de `rules.ts`'i çağırıyor. Anahtarlar ortak bir dosyaya alınınca
   çalışma zamanı döngüsü kalmadı; `constraints.ts` onları yeniden dışa aktarıyor,
   hiçbir çağrı yeri değişmedi.

---

## Doğrulanmayı bekleyen varsayımlar

1. **Derslik gerçekten paylaşılıyor mu?** Önce "her sınıfın kendi odası var" dendi,
   sonra "harf = derslik" dendi — fotoğrafta 20 sınıf 8 harfi paylaşıyor.
   *Çözüm:* derslik çakışması yine de kontrol ediliyor; odalar paylaşılmıyorsa kontrol
   hiç tetiklenmez. **Her iki durumda da kod doğru.** Babaya teyit ettirilecek.

2. **Hücredeki sayı = sınıf, harf = derslik.** Fotoğraftan çıkarıldı, "sanırım"
   kaydıyla onaylandı. Alternatif okuma aynı çakışma kuralını üretiyor, risk düşük.

3. **Ölçek: ~25 öğretmen, ~20 sınıf.** "Sanırım" kaydıyla verildi. Sadece varsayılan
   ayarları etkiliyor.

4. **Blok en fazla 3 saat.** Fotoğrafta `311 311 311` görüldü. Gerekirse tek sayı
   sınırı gevşetilir.

5. **Gün ve zil düzeni kullanıcının verdiği taslak.** "40 dk ders, 10 dk teneffüs, 9'da
   başlar, 12 ders, 19:10'da biter; hafta içi 5–6 arası, hafta sonu 6–7 arası 30 dk öğle
   arası; Pazartesi hariç her gün." Babaya **teyit ettirilmedi**. Hepsi arayüzden
   değiştirilebilir, kod değişikliği gerekmez.

6. **Kural sayıları boş bırakıldı.** `limits` alanlarının hepsi 0 (sınır yok) ile geliyor:
   "art arda en fazla kaç saat" sorusunun cevabı bilinmiyor ve tahminle sayı koymak
   ilke 5'e aykırı. Kural motoru sayı girilene kadar hiç tetiklenmiyor.

7. **Branş listesi gömülü 21 adla geliyor.** Okulun gerçekten hangi branşları verdiği
   bilinmiyor. Liste artık Ayarlar'dan düzenlenebiliyor, ama babanın listesi elde
   olmadan hangi adların gereksiz olduğu tahminden ibaret.

8. **36 rengin gözle ayırt edilebildiği ÖLÇÜLDÜ, görülmedi.** ΔE eşiği sayıyı garanti
   eder, gözü değil — hele bir de babanın ekran ayarında. Gerçek veriyle dizerken
   sorulacak: iki satırı karıştırdığın oldu mu?

---

## Bilinen eksikler

1. **Babanın gerçek verisi elde yok.** v0'ın çıkma şartı bu. Örnek veriyle değil
   gerçek veriyle test edilmeli. **Otomatik dizme için ayrıca önemli:** `sample.ts`
   derslikleri kasten %79 doluluğa getiriyor, yani örnek veri babanın gerçek
   verisinden daha kolay ya da daha zor olabilir — bilinmiyor.
2. **Görsel referanslar bu makineye ait.** Başka bir bilgisayarda `npm run gorsel`
   ilk koşuda kırmızı verir; çare tek komut (`--update-snapshots`). Bu yüzden
   `npm run kontrol`'ün parçası değil.
3. **Hız babanın bilgisayarında ölçülmedi.** Buradaki ölçümler geliştirme makinesinde.
4. **Baskı gerçek kâğıda alınmadı.** E2E artık sayfanın A4 **yatay** çıktığını
   (MediaBox 842×595 pt) ve sütunların eşit olduğunu ölçüyor, ama fiziksel çıktıya
   hâlâ bakılmadı. Yatay sayfa yazıcı ayarında da yatay seçilmesini gerektirebilir.
5. **Koyu tema babanın tarayıcısında (Brave) görülmedi.** Kontrast burada ölçüldü;
   asıl iddia "tarayıcı artık kendi karartmasını yapmıyor" ve bu yalnızca onun
   makinesinde kesinleşir.
6. `.roz` dosyası incelenmedi (aSc'den içe aktarma — düşük öncelik).
7. **Otomatik dizmenin ÇIKTI KALİTESİ ölçülmedi.** "Yasal mı" ölçülüyor (her blok
   `blocker()`'dan geçiriliyor), "iyi mi" ölçülmüyor: sınıf boşlukları (pencere),
   öğretmenin okulda geçirdiği gün sayısı, günlerin dengesi. Boşluk kuralları zaten
   yok (v2'nin işi). Babanın "bu programı kullanır mıydın" cevabı gerekiyor.
8. ~~**Çözücü zor bir veride ne yapar bilinmiyor.**~~ **2026-08-25'te ölçüldü.**
   `src/worlds.ts` 19 dünyalık bir matris kuruyor; dördü geri sarmayı gerçekten
   çalıştırıyor (`erken-saat-tuzagi` 9 blok / **201 düğüm**, `derin-geri-sarma` 12
   blok / **8362 düğüm**, `kural-baskisi` 12 / 28, `derslik-darbogazi` 8 / **57 929**).
   Geri sarmanın hiç çalışmadığı iddiası artık geçerli değil — ama çalıştığında ne
   olduğu **Bilinen hatalar 1**'e taşındı: gerçek ölçekte çöküyor.

9. **Çıktı KALİTESİ hâlâ ölçülmüyor** (eski madde 7 ile aynı kapı): matris "yasal mı"
   sorusunu 19 dünyada soruyor, "iyi mi" sorusunu hiçbirinde sormuyor.

10. **Yedek zinciri plan başına değil, oturum başına.** `ders-programi-yedek-N`
    açılışta hangi plan açıksa onun anlık görüntüsünü tutuyor; oturum içinde
    plan değiştirilirse zincir hâlâ eskisine ait. Bilerek: plan başına dört
    kopya 5 MB kotasını doldurur. Ayarlar → Veri paneli bunu yazıyor, ama
    babanın bunu okuyup okumadığı bilinmiyor — gerçek kullanımda sorulacak.

11. **Görsel regresyonun eşiği bir düzen değişikliğini kaçırdı.** Müsaitlik satırı
    34 → 48 px oldu, tablo 238 → 322 px büyüdü ve `npm run gorsel` **yeşil geçti**:
    `maxDiffPixelRatio: 0.01` (~10 000 px) düz renkli hücrelerde 84 px'lik bir
    büyümeyi yutuyor, çünkü değişen piksel çoğunlukla kenarlık çizgileri. Referanslar
    elle (`--update-snapshots=all`) yenilendi. Eşiği sıkmak yazı tipi kaynaklı
    kırmızıları getirir; bilerek dokunulmadı, ama bilinsin.

12. **Paket içe aktarma GERİ ALINAMIYOR.** "Tümünü dosyadan aç" bu bilgisayardaki
    bütün planların yerine geçiyor ve geri-al yığını zaten plan geçişinde
    sıfırlanıyor. Korunma yalnızca onay cümlesi (kaç plan silinip kaç plan
    açılacağını sayıyor). Bilerek: geri alınabilir yapmak silinen planların
    kopyasını tutmak demek, o da 5 MB kotasını ikiye katlar.

13. **Sitenin Dosya Sistemi Erişimi yolu YAZILMADI.** 4d'nin üçüncü parçası
    (`showSaveFilePicker` + IndexedDB tutamağı) 4e'ye taşındı: `file://` altında
    o API yok ve native diyalog Playwright'la sürülemiyor, yani bugün yazılsa
    kanıtsız kalırdı. Bugün exe ile site arasında veri **elle** taşınıyor:
    `-tumu-` dosyasını kaydet, öbür tarafta aç.

---

## Bilinen hatalar

**Üçü de 2026-08-25'te (sekizinci oturum) kapandı.** Ne oldukları ve nasıl
kapandıkları aşağıdaki oturum bölümünde; testleri `solver.test.ts` ve
`e2e/otomatik-stres.spec.ts` içinde duruyor.

1. ~~Kurallar sıkılaştırılınca çözücü gerçek ölçekte çöküyor~~ → **kapandı**,
   3/359 blok → 241/359, 33 842 düğüm → 241 düğüm.
2. ~~`e2e/otomatik.spec.ts` → "Engelle seviyesindeki kuralı çiğnemiyor" boşuna
   geçiyor~~ → **kapandı**: ızgara artık 424/426 saatle diziliyor ve test önce
   dolu hücreleri sayıyor, sonra kural soruyor.
3. ~~`solve()` bölünmeyen haftalık saatte `phase: 'solved'` diyor ama `stuck`
   dolu dönüyor~~ → **kapandı**: eksik bir şey varken hiçbir şey çözülmüş
   sayılmıyor; yerleşemeyeni olan her dünya testi bunu ayrıca iddia ediyor.

**Açık kalan zayıf nokta (hata değil, kalite):** `gercek-olcek-imkansiz` —
odaların ayırabileceğinin %160'ı istenen dünyada 708 bloğun 159'u diziliyor ve
15 sn'lik bütçe yine doluyor. Sonuç yasal ve cümlesi okunur ("haftada 15 saat
isteniyor, açık saatler ve kurallar en fazla 10 saat veriyor"), ama ızgaranın
dörtte biri dolu. Böyle bir veri zaten çözülemez; buradaki soru "ne kadarını
doldurabiliriz" ve cevabı ölçülmedi.

---

## Onuncu oturum (2026-08-25) — veriler nerede + bütün planlar tek dosyada

v1.0 turunun **4d** maddesi. Dal: `v1.0-teslim`.

### Kapatılan iki boşluk

1. **"Dosyaya kaydet" hâlâ tek planı yazıyordu.** Kitaplık 4b'de geldiğinden beri
   üç planlı bir kurulumun tamamı hiçbir dosyaya sığmıyordu — yani "taşımak ve
   gerçekten güvende olmak" cümlesi verinin yalnız bir kısmı için doğruydu.
2. **Verinin nerede durduğunu söyleyen ekran yoktu.** Panel "bu bilgisayara
   aittir" diyordu; hangi anahtar, ne kadar yer, ne zaman gider yazmıyordu.

### `src/bundle.ts` — zarfı bilir, `State`'i bilmez

`library.ts`'in sözleşmesi birebir tekrarlandı: paketin **zarfını** okur, içindeki
her planın durumunu **ham `unknown`** olarak geri verir, `parseState`'i `store.ts`
çağırır. Bozuk girdi kurallarını kendisi yazmaz — `normalizeLibrary()`'ye devreder,
yani "kimliksiz girdi atılır, adsız girdi yeniden adlandırılır" tek evde durur.

```
{ "schemaVersion": 5, ... }   -> TEK plan   ders-programi-YYYY-AA-GG-SSDD.json
{ "bundleVersion": 1, ... }   -> HER plan   ders-programi-tumu-YYYY-AA-GG-SSDD.json
```

**Yeni depolama anahtarı açılmadı ve `schemaVersion` 5'te kaldı.** Paket bir
*dosya biçimi*, verinin ikinci bir evi değil; içindeki her plan hâlâ kendi
sürümüyle gelir ve aynı `parseState` göçünden geçer — yani bir pakete konmuş v1
yedek de açılır.

### Karar: üst çubuk paketi REDDEDİYOR

İki dosya türü aynı uzantıyı, aynı ön eki taşıyor ve gözle ayırt edilemiyor. Bir
planı açmak açık planı değiştirir; bir paketi açmak **bütün kitaplığın** yerine
geçer — ve geri alınamaz. Üst çubuk bu yüzden paket görünce açmıyor, cümleyi
kuruyor: *"Bu dosya bütün planları içeriyor. Ayarlar → Veri bölümündeki 'Tümünü
dosyadan aç' düğmesini kullanın."* Aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı.
Üç karşı önlem birlikte çalışıyor: adda `-tumu-`, `parseState` bir paketi
okuyamıyor, `parseBundle` bir planı okuyamıyor. → **CLAUDE.md tuzak 30**

### İçe aktarmanın SIRASI güvenlik gerekçesi

`replaceLibrary` altı adımı bu sırayla yapıyor ve sıranın her adımı bir kayıp
senaryosunu kapatıyor:

1. Bekleyen otomatik kayıt **iptal edilir** — ama `park()` çağrılmaz. Park giden
   planı *yazar*, oysa o anahtarın üstüne yazmak üzereyiz. Timer'ı canlı bırakmak
   ise tuzak 28'in aynadaki hâli: 400 ms sonra eski durum yeni kitaplığın
   anahtarına düşer.
2. Her plan **depoya dokunmadan önce** ayrıştırılır. Hiçbiri okunamazsa hiçbir şey
   değişmez — yarım bir içe aktarma iki gerçek demektir.
3. Veriler yazılır, **yazılamayan sayılır**. Bunun için `writePlanText` artık
   `boolean` dönüyor: `safely()` kota hatasını yutuyordu ve yutulmuş bir kota
   hatası sessiz kayıptır (ilke 6).
4. Gelen kitaplıkta olmayan eski planların anahtarları silinir.
5. Dizin **en sonda** yazılır, verisi yerine oturduktan sonra.
6. `switch` → geri-al yığını sıfırlanır.

### "Veriler nerede" — iddia değil, ölçüm

Panel gerçek anahtar adlarını ve gerçek boyutları listeliyor (`storageReport`),
altında toplam ve ~5 MB notu. Boyut **UTF-16 kod birimi** üzerinden: tarayıcının
kotaya yazdığı şey o, dosyanın UTF-8 uzunluğu değil. E2E bunu doğruluyor —
sayfanın gerçek `localStorage` anahtarlarını okuyup tabloda hepsinin adının
geçtiğini karşılaştırıyor. Panel yalan söylerse test kırmızı verir.

Ortam iki değer döndürüyor (`file` / `site`); **`exe` dalı bilerek yazılmadı**,
4g/4h gelmeden yazılsa ölü kod olurdu (ilke 5).

### Bilerek yapılmayan — Dosya Sistemi Erişimi API'si

4d'nin üçüncü parçası (`showSaveFilePicker` tutamağı IndexedDB'de, aynı dosyaya
otomatik yazma) **yazılmadı ve 4e'ye taşındı**. Gerekçe kanıt: ortada henüz site
yok, `file://` altında o API hiç bulunmuyor, ve native dosya diyaloğu
Playwright'la sürülemiyor — bugün yazılsaydı E2E'de tek satır kanıt üretemezdik,
yani "çalışıyor" demek iddia olurdu. 4e gerçek bir http kaynağı getiriyor.

Ayrıca **paket başına yedek zinciri konmadı** ve **paket içe aktarma geri
alınamıyor**: ikisi de bilerek. Zincir hâlâ oturum başına (5 MB kotası), ve içe
aktarma onaylı + sayan bir cümleyle korunuyor.

### Ölçülen

| | Önce | Sonra |
|---|---|---|
| Birim testi | 379 | **402** |
| E2E testi | 217 | **223** |
| Görsel referans | 22 | 22 (**yalnız 2'si değişti**) |
| `dist/index.html` | 332 811 B | **339 402 B** (+6,4 KB) |
| `npm run kontrol` | ~46 sn | **~51 sn** |

Görsel regresyonun cevabı tam olarak doğru çıktı: 22 referanstan **yalnız iki
Ayarlar → Veri sahnesi** kırmızı verdi, kalan 20'si dokunulmadan yeşil geçti —
yani değişiklik gerçekten tek ekranda kaldı. Referanslar `--update-snapshots=all`
ile yenilendi (tuzak 25) ve sonrasında da yalnız o iki dosyanın baytları değişti.

---

## Dokuzuncu oturum (2026-08-25) — plan kitaplığı ve taslaklar

v1.0 turunun 4b ve 4c maddeleri. Dal: `v1.0-teslim`, tek commit — taslak ayrı
bir varlık değil, aynı veri şeklindeki bir bayrak; ayırmak bir sonraki
commit'te sökülecek geçici bir şekil yazmak olurdu.

### Karar: ilk plan tarihsel anahtarında kalıyor

İki düzen tartışıldı. Seçilen:

```
ders-programi            -> "1" numaralı planın State'i   (BUGÜNKÜ anahtar)
ders-programi-plan-<id>  -> diğer planların State'i
ders-programi-planlar    -> { activeId, plans: [{ id, name, draft }] }
ders-programi-yedek-N    -> oturum yedek zinciri          (aynen)
```

Alternatif "her plan `ders-programi-plan-<id>`'de, `ders-programi` dondurulur"
idi ve tam bakışımlıydı — ama ilk açılışta bir **kopyalama** gerektiriyordu.
Kopyalama yarıda kalabilir, ve yarıda kalmış bir kopya iki gerçek demektir
(ilke 6). Seçilen düzende devralma **tek bayt yazmıyor**: dizin oluşturuluyor,
program yerinde kalıyor. Üç ek kazanç, hepsi ölçüldü:

1. Eski bir `dist/index.html` hâlâ programı buluyor.
2. `ders-programi` okuyan **202 E2E testi ve yedek zinciri değişmedi** —
   `e2e/helpers.ts`'e dokunulmadı.
3. `newId()` alfabesinde `1` yok, yani üretilen hiçbir kimlik o anahtarla
   çakışamıyor. Bu bir varsayım olarak bırakılmadı: `library.test.ts` 500
   kimlik üretip sabitliyor, alfabe değişirse test kırmızı veriyor.

### `src/library.ts` — yaprak modül

`State`'in ne olduğunu **bilmiyor**: ham string alıp veriyor, ayrıştırmayı
`store.ts` yapıyor. `types.ts`'ten yalnız `Id` tipini alıyor (`import type`).
Böylece `store.ts` ↔ `library.ts` çalışma zamanı döngüsü yok — `keys.ts`'in
`constraints` ↔ `rules` için yaptığının aynısı.

`parseLibrary` hiçbir zaman `null` dönmüyor ve hiçbir zaman atmıyor. Bir kural
özellikle konuldu: **adı bozuk bir girdi atılmıyor, yeniden adlandırılıyor.**
Ad süs, `id` verinin işaretçisi; adı yüzünden bir satırı atmak koca bir programı
öksüz bırakırdı. Yalnız kimliksiz girdi atılıyor, o zaten hiçbir yeri göstermiyor.

### Bulunan tuzak: gecikmeli kayıt plan geçişinde işi yutuyor

Otomatik kayıt 400 ms gecikmeli, ve efektin temizliği kutu her değiştiğinde
**bekleyen yazımı iptal ediyor**. Yani plan değiştirildiğinde: eski durumun
timer'ı iptal ediliyor, yeni efekt yeni durumu yeni anahtara yazıyor, ve
geçişten hemen önceki düzenleme **hiçbir yere yazılmadan** buharlaşıyor. Ekranda
hata yok, çubukta uyarı yok; bir sonraki açılışta iş eksik.

Çare `park()`: plan değiştiren üç işlem de (`switchPlan`, `createPlan`,
`deletePlan`) önce timer'ı iptal edip giden planı **eşzamanlı** yazıyor.
Gerçek tarayıcıda ayrı bir testle sabitlendi: okul adı değiştirilip 400 ms
dolmadan plan değiştiriliyor, sonra geri dönülüp adın yerinde olduğu
doğrulanıyor. → **CLAUDE.md tuzak 27**

Plan kimliği reducer kutusunun **içinde** duruyor (`Box.planId`), yanında ayrı
bir `useState`'te değil: ikisi bir renderlik bile ayrışsa otomatik kayıt bir
planın işini başka bir planın anahtarına yazardı.

### Ölçüm sırasında bulunan iki düzen kusuru

İkisi de yalnız ekran görüntüsüne bakınca göründü, testler yeşilken:

1. **Plan adı kutusu 40 px'e sıkışmıştı** — "1. plan" yerine "1" görünüyordu.
   Sebep: altı sütuna sabit genişlik verilince (toplam 630 px) esnek ad sütununa
   yer kalmıyordu. Üç sayı sütunu tek bir "İçerik" satırına indirildi
   (`25 öğretmen · 20 sınıf · 99 ders`) — hem okunur hem yer açıyor.
2. **`.form-row` hücre içinde sarıyordu**, "Bu plana geç" ve "Sil" alt alta
   düşüyordu. `.form-row.nowrap` eklendi.

### Ölçülen

| | Önce | Sonra |
|---|---|---|
| Birim testi | 347 | **379** |
| E2E testi | 202 | **217** |
| Görsel referans | 20 | **22** (Ayarlar → Veri sahnesi eklendi) |
| `dist/index.html` | 323 KB | **333 KB** |
| `npm run kontrol` | ~41 sn | **~46 sn** |

Görsel referansların 18'i kırmızı verdi — beklenen, üst çubuk değişti. Yalnız
iki **baskı** sahnesi yeşil kaldı, ki bu tam olarak doğru: üst çubuk basılmıyor.
Referanslar `--update-snapshots=all` ile yenilendi (tuzak 25).

### Bilerek yapılmayan

- **Plan başına yedek zinciri konmadı.** Dört kopya × plan sayısı 5 MB kotasını
  doldurur. Zincir oturum başına kalıyor ve açılışta hangi plan açıksa ona ait;
  Ayarlar → Veri paneli bunu açıkça yazıyor.
- **Plan geçişinde onay sorulmadı.** İki plan da kayıtlı, geçiş kayıpsız — onay
  sormak "bu tehlikeli" demek olurdu ve değil. Geri-al yığınının sıfırlandığı
  seçicinin `title`'ında ve panelde yazıyor.
- **Üst çubuğa "yeni plan" konmadı.** Plan yaratan, adlandıran ve silen her şey
  Ayarlar → Veri'de; üst çubuk hiçbir tıklamanın bir öğleden sonrayı
  götüremeyeceği yer olarak kalıyor (aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı).

---

## Sekizinci oturum (2026-08-25) — çözücünün çöküşü kapandı

Yedinci oturumun bıraktığı iş commit edildi (7a·7b·7c), sonra kullanıcının
TASKS sonuna yazdığı altı satır v1.0 turuna dönüştü ve turun ilk maddesi
yapıldı. Dal: `v1.0-teslim`.

### Teşhis: iki ayrı şey vardı, biri belgelerde yanlış yazılıydı

`gercek-olcek-kurali` dünyasında **99 dersin 32'si 2 saatlik blok**, ve 2
saatlik bir blok "aynı ders günde en fazla 1 saat" kuralını **hiçbir hücrede**
sağlayamaz (`constraints.ts` `lessonDayCount + block` sayıyor). Yani o dersler
gerçekten imkânsız — STATUS'te *"veri imkânsız değil, arama tıkanıyor"*
yazıyordu, yarısı yanlıştı.

Asıl kusur yine de çözücüdeydi ve iz sürülerek bulundu. Aramaya bir kanca
takılıp ilk 120 olay basıldığında görülen şey şuydu:

```
pick derinlik=0 d44 size=48 kalan=8      <- 8 blok istiyor
pick derinlik=1 d44 size=36 kalan=7
pick derinlik=2 d44 size=24 kalan=6
pick derinlik=3 d44 size=12 kalan=5
revise-fail d44 size=0 need=4            <- 4 blok borçlu, yer yok
revise-fail d44 size=0 need=4            (aynısı, binlerce kez)
```

`d44` haftada 8 saat istiyor ama erişebildiği **4 gün** var ve kural günde 1
saat diyor: tavanı 4. MRV onu her seferinde seçiyor (domaini en küçük), izin
verilen her günü dolduruyor, ileri kontrol kalan bloklara yer bulamıyor, dal
ölüyor — ve bu, üstündeki her dersin her hücresi için yeniden oluyor. Arama
15 saniye boyunca 2-3 blokta çakılı kalıyordu.

### Dört düzeltme

1. **Tavan önceden hesaplanıyor** (`ceilingBlocks`): dersin kendi hücreleri gün
   gün açgözlü paketlenip "aynı ders günde en fazla N saat" ile sınırlanıyor.
   `need` tavana kırpılıyor. Ders bırakılmıyor — tutabildiği kadarı diziliyor.
2. **Suçlu ders bırakılıyor**, kökteki değil. Yığın boşaldığında eskiden aramayı
   açan ders elenirdi; artık yeri tükenen ders (`culprit`).
3. **`reseed`: en iyi ızgaradan devam.** Yığının boşalması bütün atamaları geri
   sarıyor, yani her vazgeçiş sıfırdan başlamak demekti — 99 ders için 99 tam
   arama. Artık en iyi ızgara tabana donduruluyor, ilerleme geri gitmiyor.
4. **Tıkanma sayacı** (`STALL_LIMIT = 20 000` düğüm). Eşik **ölçülerek** seçildi:

   | | en uzun kazançsız seri |
   |---|---|
   | `kural-baskisi` (tam çözülüyor) | 17 |
   | `erken-saat-tuzagi` (tam çözülüyor) | 171 |
   | `derin-geri-sarma` (tam çözülüyor) | **8 059** |
   | `gercek-olcek-imkansiz` | 91 551 |
   | `gercek-olcek-sikisik` | 317 395 |
   | `parcalanmis-gunler` | 2 890 411 |

   60 000 ve 200 000 da denendi: **her eksende daha kötü** (`imkansiz` 159 → 59
   → 22 blok). 20 000, tam çözülen en zor dünyaya 2,5 kat pay bırakıyor.

Ayrıca `report()` `stuck` doluyken `'solved'` diyebiliyordu; kapandı.

### Yerleşemeyen dersin cümlesi de düzeldi

Kısmen sığan bir derste `blocker()` "510 sınıfının Salı 1 saatinde Matematik
var" diyordu — okuyanı kenara çekecek bir ders aramaya gönderen, ama çekilecek
bir şeyin olmadığı bir cümle. Artık tavanı söylüyor: *"haftada 6 saat isteniyor,
açık saatler ve kurallar en fazla 3 saat veriyor"*. **Hiç** sığmayan derste
`blocker()`'ın kendi cümlesi zaten somut ("AV Salı 1 saatinde müsait değil"),
o korunuyor — bunu mevcut bir test yakaladı ve kural daraltıldı.

### Ölçülen

| Dünya | Önce | Sonra |
|---|---|---|
| `gercek-olcek-kurali` | 3/359 blok · 33 842 düğüm · 15 sn | **241/359 · 241 düğüm · 43 ms** |
| `gercek-olcek-sikisik` | 3/423 blok · 11 672 düğüm · 15 sn | **412/423 · 43 446 düğüm · 3,6 sn** |
| `parcalanmis-gunler` | 16/24 blok · 3 233 441 düğüm · 15 sn | **22/24 · 20 023 düğüm · 110 ms** |
| `gercek-olcek-imkansiz` | 22/708 blok · 15 sn | **159/708** · 15 sn |
| sample + "art arda 2" Engelle | neredeyse boş · 15 sn | **424/426 saat · 1,6 sn** |

Testler 338 → **347 birim**, 200 → **202 E2E**. İki yeni dünya matrise girdi
(`imkansiz-ders-yaninda`, `blok-kurala-sigmiyor`) ve stres süitindeki
`test.fail` işareti kalktı: o test artık gerçekten bir şey iddia ediyor.

---

## Yedinci oturum (2026-08-25) — çözücü dünya matrisi ve Müsaitlik satırı

Kullanıcının iki isteği: Müsaitlik çizelgesinin satırları biraz uzasın, ve otomatik
dizme **çok sayıda sahte veriyle** E2E'de denensin.

### 1. Müsaitlik satırı 34 → 48 px

Ölçülen sorun: hücre 1366 px'te ~67 px genişliğinde ama 34 px yüksekliğindeydi
(~2:1 yassı). Tablo 238 px'te bitiyor, sağdaki varlık listesi ~665 px sürüyor,
altta ~360 px boş kalıyordu. 48 px hücreyi ~1,4:1'e (≈ √2) getiriyor, tablo
322 px'e çıkıyor, panel ~490 px oluyor — hâlâ 768 px'e rahat sığıyor.

Uygulama tek kural: `table.availability tbody th, tbody td { height: 48px }`.
Özgüllük (0,1,3), paylaşılan `table.availability th, td` kuralını (0,1,2) bilerek
geçiyor — tuzak 17 bunun tersini yapmanın hikâyesiydi. Başlık satırı 34 px'te
kaldı (iki satırlık içeriği için yeterli). `td.closed` yazı boyu 16 → 18 px:
`×` işareti hücrenin içeriği, hücreyle büyümesi gerekiyor.

Yan kazanç: sürükleyerek boyama hedefi 46×34'ten 46×48'e çıktı.

### 2. `src/worlds.ts` — 19 dünyalık matris

Çözücü o güne kadar yalnız iki soru görmüştü: `solver.test.ts`'teki 2 gün × 4
saatlik küçük dünya ve `sample.ts`. İkisi de düz bir çizgide çözülüyor, o yüzden
`solver.ts`'in geri sarma yarısı hiç çalışmamıştı.

Dosya `src/`'de, `e2e/`'de değil: `tsconfig.json` yalnız `src`'yi kapsıyor, yani
`e2e/` altındaki hiçbir şey `tsc --noEmit`'ten geçmiyor. Uygulama kodu bu modülü
import etmediği için Vite onu budar, `dist/index.html`'e girmez.

Üç şey dışa aktarıyor: `makeWorld()` (küçük okul üreteci — `kontrol.spec.ts`'in
içinde büyümüş olan üretecin ta kendisi, oraya da geri verildi), `illegalBlocks()`
(çerçeveden bağımsız denetçi) ve `WORLDS` (senaryo listesi).

**Denetçinin kendisi test ediliyor** (`src/worlds.test.ts`, 10 test). Bu atlanamaz:
`illegalBlocks` her zaman `[]` döndürseydi bütün çözücü testleri bedavaya yeşil
geçerdi. Bilerek yasadışı ızgaralar veriliyor — aynı öğretmen iki sınıfta, kapalı
saatte duran ders, gün sonunu taşan blok — ve yakaladığı doğrulanıyor.

### 3. Ölçülen sayılar

| Dünya | Sonuç | Düğüm | Süre |
|---|---|---|---|
| `tam-dolu` | 9/9 | 9 | 1 ms |
| `derslik-darbogazi` | 8/12 (tıkandı) | **57 929** | 275 ms |
| `erken-saat-tuzagi` | 9/9 | **201** | 2 ms |
| `derin-geri-sarma` | 12/12 | **8 362** | 63 ms |
| `kural-baskisi` | 12/12 | **28** | 1 ms |
| `delik-desik` | 30/30 | 30 | 1 ms |
| `parcalanmis-gunler` (ağır) | 16/24 | **3 233 441** | 15 sn (bütçe doldu) |
| `gercek-olcek-kurali` (ağır) | **3/359** | 33 842 | 15 sn (bütçe doldu) |

Kalın olanlar geri sarmanın çalıştığının kanıtı: geri sarmayan bir koşu blok başına
tam bir düğüm harcıyor (örnek veri: 359 blok, 359 düğüm), yani düğüm > blok başka
türlü olamaz.

`erken-saat-tuzagi` bilerek kuruldu: AV ilk derse gelemiyor, tekil saatler değer
sıralamasının ilk uzandığı 1. ve 2. saatlere yığılıyor, 2 saatlik blok bitişik yer
bulamıyor. Doğru cevap tekil saatleri günün SONUNA itmek — açgözlü sıra bunu ilk
denemede hiç denemiyor.

### 4. Testler

- `src/solver.test.ts`: mevcut 20 test + her küçük dünya için 3-4 iddia → **78 test**.
  Ortak iddialar: her blok `blocker()`'a göre yasal (girişte var olan yasadışı bloklar
  hariç — ilke 6), hiçbir ders `weeklyHours`'undan fazla yerleşmemiş, `block`
  seviyesinde hiç ihlal yok, aynı girdi aynı çıktı, elle konmuş her blok yerinde.
- `e2e/otomatik-dunyalar.spec.ts` (**24 test**): aynı dünyalar `dist/index.html`'e
  gerçek "Dosyadan aç" diyaloğundan yükleniyor, gerçek düğmeye basılıyor, sonra
  sayfanın **kendi `localStorage`'ı** okunup `src/`'deki saf fonksiyonlarla
  denetleniyor. Birim testinden farkı: burada sonuç reducer'dan geçip diske yazılmış
  hâliyle okunuyor — tuzak 20 (sonucun sessizce atılması) tam burada yakalanır.
- `e2e/otomatik-stres.spec.ts` + `playwright.cozucu.config.ts` + `npm run cozucu`
  (**7 test**): gerçek ölçekli dünyalar, ana süitin dışında.

### 5. Bu oturumda bulunan üç şey

1. **Kural sıkılaştırılınca çözücü çöküyor** — bkz. Bilinen hatalar 1. En önemlisi.
2. **Mevcut bir E2E testi boşuna geçiyormuş** — bkz. Bilinen hatalar 2.
3. **`savedState` yardımcısında yarış vardı.** İlk hâli "dizimden sonra kaydedilen
   durumu" okurken, dünyanın yüklenmesinin kendi 400 ms'lik gecikmeli kaydını
   "değişiklik" sanabiliyordu — o zaman denetim **dizimden önceki** ızgarayı
   yargılardı ve her şey bedavaya geçerdi. Çare `settledText()`: tıklamadan önce
   sayfanın gerçekten bir şey yazmış olması beklenir. Üstüne testin başına bir
   koruma kondu: kaydedilen yerleşim sayısı girişteki sayıdan **büyük** olmalı.

---

## v0.9 — bu oturumda ne yapıldı ve neden

Kullanıcının [TASKS.md](TASKS.md) sonuna yazdığı dört madde:

1. **"UI düzenlenmesi ve modernleştirilmesi lazım. Her sectionda sağ taraf bomboş."**
   Ölçülen sebep: `styles.css`'te container yoktu, genişliği sınırlayan tek şey
   `table.list.narrow/mid/wide` (520/640/720px, hepsi Ayarlar'da) ile Müsaitlik
   tablosunun 46px **sabit** hücreleriydi — 13 sütun × 46px ≈ 620px, 1366px ekranda
   sağda ~740px boşluk. Kurulum'da tersi kusur vardı: tablo tam genişlik ama içindeki
   `<input>` tarayıcı varsayılanı (~170px).
   *Yapılan:* sekmeler sol kenar çubuğuna alındı, üçü de silindi, tek düzen kuralı
   (`.cols`) geldi ve sağ sütuna **zaten var olan ama bir sekme ötede duran** bilgi
   kondu.
2. **"Otomatik kurulum önemli."** → Kullanıcıya soruldu, cevap: **programı otomatik
   dizme**. TASKS'ta v1 olarak duruyordu.
3. **"Programda üzerine tıklanınca silinmesin, sürüklenerek taşınabilsin. Sağ tık
   silsin."**
4. **"E2E her şeyi test edecek şekilde yapalım."** → Kullanıcıya soruldu, cevap:
   **tam kapsam + görsel regresyon**.

### Yol boyunca bulunan gerçek hatalar

Üçü de yalnız ölçerek ya da test yazarak bulunabilirdi:

1. **Otomatik dizmenin sonucu sessizce atılıyordu.** `change((d) => d === base.current
   ? sonuç : d)` yazılmıştı; React reducer geri çağırımını fonksiyon döndükten SONRA
   çalıştırıyor ve o anda `base.current` çoktan `null`'a çekilmiş oluyordu. Çubukta
   "Program dizildi" yazıyor, ızgara boş kalıyordu. → **tuzak 20**
2. **Çözücü simetri kırması yüzünden neredeyse hiçbir şey dizemiyordu.** "Aynı dersin
   blokları artan hücre indisinde" kısıtlaması, "haftaya yay" sezgisiyle çatışıyordu.
   Ölçülen: **57718 düğümde 26 blok** → kaldırılınca **359 düğümde 359 blok**.
   → **tuzak 21**
3. **"En sık sebep" yanlış sebebi seçiyordu.** Mesajlar gün ve saat adı taşıdığı için
   altmış farklı "sınıfın X saatinde Y var" satırı altmış ayrı sebep sayılıyor, altı
   kez tekrarlanan önemsiz bir cümle kazanıyordu: hafta boyu kapalı bir öğretmen için
   "2 saatlik blok güne sığmıyor". `blockerDetail()` artık bir **kod** döndürüyor.
   → **tuzak 22**

Ayrıca test yazarken çıkanlar: `no-overflow` sınıfı Program'ın boş ekranını
kırpabiliyordu; renk ve derslik açılır listelerinin erişilebilir adı yoktu.

### Web Worker neden kullanılmadı

TASKS.md "Web Worker" diyordu. İki bağımsız sebeple bırakıldı: Vite worker'ı **ayrı
bir chunk** olarak üretir ve `vite-plugin-singlefile` onu gömmez (tek dosya iddiası
düşer); kalan `blob:` yolu `file://`'in opaque origin'inden çalışır ve Chromium'da
güvenilmez, üstelik kaynak string olacağı için `tsc` hiç görmez. Yerine ana iş
parçacığında `requestAnimationFrame` ile dilimli arama. → **tuzak 19**

### Bilerek yapılmayanlar

- **Çözücüye ayar konmadı.** İki düğme var, kutucuk yok. "Sabaha yay", "günleri
  dengele" gibi tercihlerin doğru cevabı bir dönem kullanılmadan bilinemez (ilke 5).
- **Görsel regresyon `npm run kontrol`'e konmadı.** Sistem fontu burada Cantarell'e,
  babanın Windows'unda Segoe UI'ye çözülüyor; referans tek makine için doğru. Her
  commit'in geçtiği kapıya bağlamak, font değişimini arkasında hata olmayan kırmızı
  bir derlemeye çevirirdi. Ayrı komut, referanslar depoda.
- **`ekran.spec.ts` silinmedi.** Görsel regresyon onun yerine geçmez: biri geçti/kaldı
  der, öbürü bakılabilir bir resim verir. İkisi **aynı** `SCENES` listesini yürüyor.

---

## Oturum sonu durumu (2026-08-25, altıncı oturum)

Dal: **`v0.9-otomatik-dizme`** (`v0.8-arayuz-turu-2` üstünden; o da, `v0.7-arayuz-turu`
de `main`'e birleşmedi — üçü de bekliyor). 10 commit, her biri `npm run kontrol`
yeşilken.

`npm run kontrol` yeşil: tsc temiz, **270 birim + 176 E2E** geçiyor, `dist/index.html`
323 KB üretiliyor, toplam 51 sn.

| Eklenen | Nerede |
|---|---|
| Otomatik dizme motoru | **yeni** `solver.ts` + `solver.test.ts` |
| rAF sürücüsü (App'te yaşar) | **yeni** `useSolver.ts` · `App.tsx` |
| Yerinde yerleştirme, sebep kodları | `constraints.ts` (`occupy`/`vacate`, `blockerDetail`) |
| Ortak sebep cümlesi, ucuz kapasite | `feasibility.ts` (`commonestBlock`, `buildCapacity`, `lessonName`) |
| Sol kenar çubuğu, `.main`'in taşınması | `App.tsx` · `styles.css` · altı bileşen |
| Kenar çubuğu tercihi | `theme.ts` (`readSidebar`/`writeSidebar`) |
| İki sütunlu düzen, sağ paneller | `styles.css` (`.cols`, `.panel-grid`, `.entity-list`) · beş sekme |
| Kurulum özet paneli | **yeni** `components/setup/Summary.tsx` |
| Açık saat sayımı | `entities.ts` → `openHours` |
| Sürükleyerek taşıma, sağ tık silme | `drag.ts` · `Grid.tsx` · `Program.tsx` |
| E2E bölünmesi + ortak yardımcılar | **yeni** `e2e/helpers.ts` + 11 spec dosyası |
| Görsel regresyon | **yeni** `e2e/gorsel.spec.ts` · `playwright.gorsel.config.ts` · `e2e/__gorsel__/` |

### Sıradaki iş değişmedi

**Gerçek veri.** v0'ın çıkma şartı hâlâ tek bir şeye bağlı. Üstelik artık iki yeni
sorunun cevabı da ona bağlı: otomatik dizilen program *kullanılabilir* mi, ve çözücü
sıkışık bir veride ne yapıyor (örnek veride backtracking kodu hiç çalışmadı).

---

## Oturum sonu durumu (2026-08-25, beşinci oturum)

Dal: **`v0.8-arayuz-turu-2`** (`main`'e birleştirilmedi; `v0.7-arayuz-turu` de
birleşmemişti — ikisi de bekliyor). 10 commit, her biri `npm run kontrol` yeşilken.

`npm run kontrol` yeşil: tsc temiz, **219 birim + 87 E2E** geçiyor, `dist/index.html`
293 KB üretiliyor.

### Bu oturumda ne yapıldı

v0.8 turunun tamamı (2a–2l). Ayrıntı ve gerekçeler: [TASKS.md](TASKS.md) → BİTENLER 14.

| Eklenen | Nerede |
|---|---|
| 36 renk, çakışmasız atama | **yeni** `palette.ts` + `palette.test.ts` |
| Sınıf renkleri, branş listesi, şema v5 | `types.ts` · `entities.ts` · `store.ts` |
| Ayarlar sekmesi | **yeni** `components/settings/` · `components/props.ts` |
| Branş açılır listesi | `setup/Teachers.tsx` · `entities.ts` |
| 24 saatlik / 5 dk başlangıç | `settings/School.tsx` · `bell.ts` |
| Havuz görünümü takip ediyor | `Program.tsx` · `LessonPool.tsx` |
| Kep + öğrenci simgeleri, ince ayraç, büyük çarpı | `Program.tsx` · `styles.css` |
| Kapalı saatte ders işareti | `constraints.ts` · `Grid.tsx` · `Check.tsx` · `Availability.tsx` |
| Yazdırmada sayfa seçimi | `Print.tsx` · `App.tsx` |

### Sıradaki iş değişmedi

**Gerçek veri.** v0'ın çıkma şartı hâlâ tek bir şeye bağlı ve iki arayüz turu bunu
değiştirmedi. Elde veri olmadan yazılacak her yeni özellik tahmindir (ilke 5).

---

## Oturum sonu durumu (2026-08-24, dördüncü oturum)

Dal: **`v0.7-arayuz-turu`** (`main`'e birleştirilmedi). 13 commit, her biri
`npm run kontrol` yeşilken atıldı. v0.6 çalışması bir önceki oturumda commit edilmişti.

`npm run kontrol` yeşil: tsc temiz, 177 birim + 51 E2E geçiyor, `dist/index.html`
288 KB üretiliyor.

### Bu oturumda ne yapıldı

v0.7 arayüz turunun tamamı (1a–1m). Ayrıntı ve gerekçeler:
[TASKS.md](TASKS.md) → BİTENLER 13.

| Eklenen | Nerede |
|---|---|
| Koyu tema, `color-scheme`, ölçülen kontrast | `styles.css` · **yeni** `theme.ts` · `App.tsx` |
| Kurulum yedi adım | **yeni** `components/setup/` (11 dosya) |
| Öğle arası ayracı (3 teknik) | `Grid.tsx` · `Availability.tsx` · `Print.tsx` · `School.tsx` |
| Müsaitlik ekseni döndü | `Availability.tsx` · `bell.ts` → `sharedPeriods()` |
| Otomatik kısaltma + çakışma | `entities.ts` → `makeShort` / `duplicateShorts` |
| Silme özeti | `entities.ts` → `deletionSummary()` |
| Branş kısaltmaları + **şema v4** | `types.ts` · `entities.ts` · `store.ts` · **yeni** `setup/Subjects.tsx` |
| Baskı A4 yatay, eşit sütunlu | `Print.tsx` · `styles.css` |
| Görünüm simgeleri | `Program.tsx` (gömülü SVG) |
| Ekran görüntüsü betiği | **yeni** `e2e/ekran.spec.ts` + `npm run ekran` |

### Ölçüm sırasında bulunan gerçek kusurlar

Bunlar planda yoktu; renkleri **hesaplayarak** ölçmeye başlayınca çıktılar.

1. **Açık temada `--ok` kendi zemininde 4,19:1 idi** (WCAG AA sınırı 4,5). Yani
   "bırakılabilir" yeşili, koyu tema hiç yokken bile sınırın altındaydı.
2. **Kapalı hücredeki "×" 4,20:1 idi.** O işaret dekorasyon değil, "bu saat kapalı"
   demek. `--muted` bir adım koyulaştırıldı.
3. **WCAG parlaklık oranı "ayırt edilebilirlik" için yanlış ölçü.** Koyu yeşil ile koyu
   zeytin oranı 1,00:1 çıkıyor ama tonları apayrı. Testler **CIE Lab ΔE** kullanıyor;
   ölçülünce koyu temanın durum zeminleri (ΔE 23–39) açık temadan (16–23) daha ayrık.

### Bilerek yapılmayan

- **Kural sayılarına varsayılan konmadı** (hepsi 0 = sınır yok). Branş kısaltmasının
  aksine bunun doğru cevabı okuldan okula değişir; yanlış bir varsayılan hücreleri
  sessizce kırmızıya boyar ve babam sebebini anlamaz.
- **Boş bir "Branşlar" adımı 1b'de konmadı**; adım 1i ile birlikte, içeriğiyle geldi.

## v0.7 — neden gerekti (2026-08-24, localhost denemesi)

> Bu bölüm **yapılmadan önce** yazıldı ve olduğu gibi bırakıldı: v0.7'nin neden
> gerektiğini anlatıyor. Yapılanlar için yukarıdaki oturum sonu bölümüne bakın.

Araç ilk kez gerçek gözle, gerçek tarayıcıda açıldı. Mantık tarafında hata çıkmadı;
159 test yeşil, veri modeli sağlam. Çıkan altı kusurun hepsi görünüş/kullanım tarafında.

**En önemlisi ve en sinsisi:** ekran görüntüsü koyu geldi — ama uygulamada koyu tema
yok. Tarayıcı (Brave) açık temalı sayfayı kendi algoritmasıyla karartıyor. Bu araç için
sonucu ağır: CLAUDE.md "renk işlevsel, dekoratif değil" diyor — yeşil = bırakılabilir,
sarı = uyarı, kırmızı = engel, gri taralı = kapalı. Tarayıcının kararması bu dört
durumu birbirine yaklaştırıyor. Yani **sürükleme geri bildirimi sessizce bozuluyor** ve
bunu hiçbir birim testi görmez.

Karar: kontrolü almak. Gerçek koyu tema + düğme, `color-scheme` doğru kurulumu, ve
E2E'de **hesaplanmış renkleri ve kontrast oranını ölçen** bir test. O test yazılmazsa
koyu tema aracı sessizce işlevsizleştirebilir.

İkinci bakışta dört madde daha çıktı: **silme onayı yok** (derslik ve ders silmek hiç
sormuyor), **branş adı hücreye sığmıyor** (`Matematik` 34px'e girmiyor — kısaltma
tablosu gerekiyor, şema v3 → v4), **baskı sütunları eşit değil** (`table-layout` yok,
dolu hücre sütunu genişletiyor) ve **görünüm düğmesi nerede olduğunu söylemiyor**.

Tümü ve karar gerekçeleri: [TASKS.md](TASKS.md) → BİTENLER 13 (1a–1m). **Hepsi yapıldı.**

---

## Başka bir bilgisayarda devam etmek için

Depo: `https://github.com/AlparslanSemiz/AscLike.git`

```bash
git clone https://github.com/AlparslanSemiz/AscLike.git
cd AscLike
npm install
npx playwright install chromium   # E2E testleri için, bir kez
npm run kontrol                   # tsc + 379 birim + derleme + 217 E2E (~46 sn)
npm run dev                       # geliştirme sunucusu
```

**Görsel regresyon ayrı**: `npm run gorsel` (22 referans). İlk koşuda büyük ihtimalle kırmızı verir,
çünkü referanslar bir başka makinenin fontuyla alındı. Bir kez yenile:

```bash
npx playwright test --config playwright.gorsel.config.ts --update-snapshots=all
```

(`--update-snapshots` tek başına yalnız **kırmızı** referansları yeniler; hepsini
yazdırmak için `=all` gerekiyor. Bu 2026-08-25'te öğrenildi: satır yüksekliği
değiştiği hâlde eşik farkı yuttuğu için referanslar sessizce eski kaldı.)

**Çözücü stres süiti de ayrı**: `npm run cozucu` (~40 sn). Çöküş düzeldikten
sonra dünyaların çoğu bütçesini doldurmuyor, ama biri (kasten imkânsız olan)
hâlâ 15 saniye harcıyor — o yüzden ayrı komutta duruyor.

`npm run kontrol` yeşilse ortam doğru kurulmuş demektir. Sonra
[TASKS.md](TASKS.md) içindeki **"ŞİMDİ SIRADA"** bölümünden devam edilir.
