# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti

Yeni bir bilgisayarda başlıyorsan önce [STATUS.md](STATUS.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

---

## ŞİMDİ SIRADA

### 1. Babanın gerçek verisiyle deneme

Kod tarafında yapılacak iş kalmadı; **v0'ın çıkma şartı artık tek bir şeye bağlı:
gerçek veri**. Elde veri olmadan yazılacak her yeni özellik tahmin olur (ilke 5).

- [ ] Gerçek öğretmen/sınıf/derslik/ders listesi alınsın (Excel'e yazdırıp yapıştırma
      kutusuna yapıştırmak en hızlısı)
- [ ] **Gerçek gün ve zil düzeni teyit ettirilsin**: Pazartesi gerçekten ders yok mu,
      öğle arası hafta içi 5. hafta sonu 6. dersten sonra mı, 12 ders mi
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en fazla/en az
      kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor — tahminle sayı konmadı
- [ ] Bir haftalık program baştan sona dizilsin → **v0'ın çıkma şartı**
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?

### 2. Tauri ile `.exe`

Babanın makinesi **Windows 10** → Tauri v2 destekliyor, yol açık.
WebView2 bu makinede kurulu (151.0.4129.101); Rust **kurulu değil**.

- [ ] Rust toolchain kurulsun
- [ ] `src-tauri` iskelesi, pencere başlığı "Ders Programı", ikon
- [ ] **Yedekler diske yazılsın** — Tauri'nin asıl kazancı bu: `localStorage` yanında
      her değişiklik `Belgelerim/Ders Programı/` altına `.json` olarak yazılır
- [ ] Otomatik günlük yedek (`program-2026-08-24.json`, son 10 gün)
- [ ] Yazdırma Tauri penceresinde de çalışıyor mu (WebView2 yazdırma diyaloğu)
- [ ] `npm run tauri build` → tek `.exe`, boyut ve açılış süresi ölçülsün
- [ ] **SmartScreen**: imzasız exe'de Windows "bilinmeyen yayıncı" der. Babaya ne
      yapacağı tek cümleyle anlatılmalı, yoksa açamaz
- [ ] Web sürümü (tek HTML) bozulmadan derlenmeye devam etsin — yedek teslim yolu
- [ ] E2E testleri web sürümünde çalışmaya devam etsin

---

## BİTENLER

### 0. Belgeler ✅

- [x] `Claude.md` (yanlışlıkla konmuş boş Access veritabanı) silindi
- [x] `CLAUDE.md` · `docs/STATUS.md` · `docs/TASKS.md`
- [x] `docs/PLAN.md` kararlara göre güncellendi; tuzak 11–13 eklendi

### 1. İskele ✅

- [x] `package.json` — runtime yalnızca react + react-dom
- [x] `vite.config.ts` — singlefile, `base: './'`, modulePreload polyfill kapalı
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] Komutlar: `dev` · `test` · `test:e2e` · `build` · `kontrol`
- [x] **Çıkma şartı:** tek dosya `dist/index.html` (253 KB), **sıfır ağ çağrısı**

### 2. Çekirdek mantık ✅ — 26 test

- [x] `src/types.ts`, `src/constraints.ts` (`buildIndex`, `blocker`, `validHours`,
      `blockStart`, `place`, `removeBlock`, `countPlacedHours`, `sanitize`)
- [x] Beş sert kısıt, hepsi somut Türkçe mesaj veriyor
- [x] Bitişik blok ayrımı ve cascade silme dahil test edildi

### 3. Durum yönetimi ✅

- [x] `useReducer`, geri al/ileri al (30 adım), **Ctrl+Z / Ctrl+Y**
- [x] Metin kutusundayken Ctrl+Z kapılmıyor
- [x] localStorage otomatik kayıt (400 ms gecikmeli) + kapanışta anında yazma
- [x] Açılışta yedek zinciri kaydırma (son 3 oturum)
- [x] Yedek indir / yükle / Sıfırla; bozuk JSON'da çökmüyor
- [x] **Kayıt çalışmıyorsa kalıcı kırmızı uyarı** (sessiz veri kaybı olmasın)
- [x] `src/sample.ts` — gerçek ölçekte deterministik örnek veri

### 4. Kurulum sekmesi ✅ — 17 test

- [x] Gün/saat düzeni, derslik/öğretmen/sınıf/ders listeleri
- [x] `src/import.ts` — Excel yapıştırma, **önizlemeli**
- [x] Metin kutuları `defaultValue` + `onBlur`
- [x] Silme cascade + ne kadar şeyin gideceğini söyleyen onay

### 5. Müsaitlik sekmesi ✅

- [x] 7 × 12 ızgara, sürükleyerek toplu boyama (tek geri-al adımı)
- [x] Gün/saat başlığından toplu değiştirme, tümünü aç/kapat
- [x] Yük > müsaitlik ise anında uyarı

### 6. Program ızgarası ✅

- [x] Satır = öğretmen, sütun = 7 gün × 12 saat, sabit başlıklar
- [x] Blok gösterimi (`rowspan` yok), tıkla → blok tamamen kalkar
- [x] Kart havuzu, öğretmen renginde, `yerleşen/toplam` sayaçlı
- [x] Satırlar `React.memo`

### 7. Sürükle-bırak ✅ — gerçek tarayıcıda doğrulandı

- [x] Pointer Events; geçerli hücreler sürükleme başında bir kez (0,18 ms)
- [x] `pointermove` sırasında React state güncellenmiyor
- [x] Blok kadar hücre birden vurgulanıyor, Esc iptal, `pointercancel` temizliği
- [x] **Hedef satır sürükleme başlarken görünür alana kaydırılıyor** *(E2E hatası)*
- [x] **Kenar otomatik kaydırma, yalnızca imleç ızgaranın içindeyken** *(E2E hatası)*

### 8. Yazdırma ✅

- [x] Sayfa başına bir sınıf / bir öğretmen, 7 sütun × 12 satır, A4 dikey
- [x] `print-color-adjust: exact`, üst çubuk gizleniyor, yatay taşma yok

### 9. Kontrol sekmesi (v0.5) ✅ — 8 test

- [x] Öğretmen / sınıf / derslik kapasitesi, sıkışıklık uyarısı
- [x] Yerleşemeyenler, en sık sebebiyle
- [x] Sorun yoksa net "Sorun görünmüyor"

### 11. Kod dili İngilizceye çevrildi ✅ — 2026-08-24

Arayüz Türkçe kaldı, tek bir kullanıcı metni değişmedi. Güvenlik ağı: değişiklikten
önce 83 test yeşildi, sonra 90 test yeşil.

- [x] Tipler: `Durum`→`State`, `Ogretmen`→`Teacher`, `Sinif`→`ClassGroup`,
      `Derslik`→`Room`, `Ders`→`Lesson`, `yerlesim`→`placements`,
      `musaitDegil`→`unavailable`, `ayar`→`settings`, `blok`→`blockSize`
- [x] Dosyalar: `constraints.ts` · `feasibility.ts` · `import.ts` · `entities.ts` ·
      `store.ts` · `drag.ts` · `sample.ts` · `types.ts` · `components/` (`Grid`,
      `Setup`, `Availability`, `LessonPool`, `Check`, `Print`, `Program`)
- [x] Yorumlar İngilizceye
- [x] Kullanıcıya görünen metinler Türkçe kaldı; metne göre eleman bulan E2E
      satırları değişmedi
- [x] CSS sınıfları ve değişkenleri İngilizceye (`.grid`, `.drop-ok`, `.target-row`,
      `--color-N`…); `data-gun/saat/satir` → `data-day/hour/row`; `#kok` → `#root`.
      `drag.ts` ve E2E seçicileri birlikte güncellendi
- [x] **`schemaVersion` 2**, `parseState` içinde v1 göç kodu. `id`'ler değişmediği
      için `unavailable`/`placements` anahtarları olduğu gibi taşınıyor
- [x] Göç iki yerde test edildi: birim (`store.test.ts`) **ve** gerçek tarayıcıda
      "Yedek yükle" yolundan (E2E) — babanın elindeki her yedek v1
- [x] **İstisna:** `localStorage` anahtarı ve indirilen yedeğin dosya adı Türkçe
      bırakıldı; onlar kod değil, kullanıcı verisinin kimliği

### 10. Testler ✅ — 159 test

- [x] 133 birim testi (`constraints`, `feasibility`, `import`, `sample`, `store`,
      `bell`, `rules`, `entities`, `App` duman testi)
- [x] **26 E2E testi** (Playwright, gerçek Chromium, `file://`, 1366×768)
- [x] `file://` altında `localStorage` çalıştığı doğrulandı
- [x] Gerçek ölçekte hız ölçüldü (sürükleme başlangıcı 0,212 ms)

### 12. v0.6 — zil saatleri, gün seçimi, müsaitlik, kurallar ✅ — 2026-08-24

Babanın aSc ekran görüntülerinden (`docs/Örnek Fotolar/`) çıkarıldı. Şema **v2 → v3**.

- [x] `src/bell.ts` — zil saatleri hesaplanır (başlangıç + ders/teneffüs/öğle arası dk).
      Varsayılan 09:00 · 40 · 10 · 30; hafta içi 5., hafta sonu 6. dersten sonra ara;
      **iki desende de 12. ders 19:10'da biter** (testte açıkça iddia ediliyor)
- [x] Gün seçimi checkbox'a döndü; varsayılan hafta **Pazartesisiz 6 gün** (Salı–Pazar).
      Her günün öğle arası ayrı seçilebilir
- [x] `remapDays()` — gün listesi değişince anahtarlar **isimden** eşlenip taşınır.
      Pazartesi kaldırılınca programın bir gün öne kayması engellendi (PLAN tuzak 14)
- [x] Sınıf ve derslik müsaitliği; üçü de tek `unavailable` sözlüğünü paylaşıyor
- [x] `src/rules.ts` — art arda en fazla · günde en fazla · günde en az ·
      bir dersin günlük sınırı. Her biri Kapalı / Uyar / Engelle
- [x] Okul geneli varsayılan + öğretmen/ders bazında istisna (`null` = varsayılan)
- [x] `check()` → `{ blocked, warning }`; sürüklemede üçüncü renk (sarı) ve
      `.reason-bar.warn`. Bırakmayı yalnızca `blocked` durdurur
- [x] Kontrol sekmesine **Kural ihlalleri** bölümü (`findViolations`), `minPerDay`
      yalnızca burada yakalanır
- [x] Sınıf/derslik kapasitesi artık kapalı saatler düşülerek hesaplanıyor
- [x] Izgara başlığında ders saati, öğle arasında kesikli ayraç; yazdırmada
      `09:00–09:40` sütunu ve okul adı
- [x] `keys.ts` ayrıldı — `constraints.ts` ↔ `rules.ts` çalışma zamanı döngüsü yok
- [x] **v3 göçü** `parseState` içinde (v1 → v2 → v3 zinciri), birim **ve** gerçek
      tarayıcıda "Yedek yükle" yolundan test edildi
- [x] `shortDay()` — `Cuma`/`Cumartesi` ikisi de "Cum" olmuyor (PLAN tuzak 15)

---

## Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz. Öncelik **babanın geri dönütü**.

- **Boşluk (pencere) kuralları** — sınıf ve öğretmen için ayrı ayrı,
  Kapalı / Uyar / Engelle. v0.6'da bilerek yapılmadı (istenen o değildi)
- **v1 Otomatik doldurma** — MRV + forward checking backtracking, Web Worker,
  500 ms sonra pes et, tıkandığı dersi söyle
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
- koyu tema olsun.
- otomatik kaydetsin her an. kaydedilmediyse de çıkmaya izin verilmesin ya da işte nasıl olması gerekiyorsa.
