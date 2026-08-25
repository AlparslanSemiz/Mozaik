# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti

Yeni bir bilgisayarda başlıyorsan önce [STATUS.md](STATUS.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

---

## ŞİMDİ SIRADA

### 0. v1.0 — teslim turu (`.exe` · site · planlar) — YENİ

Kullanıcının bu dosyanın sonuna yazdığı altı satır, sırayla numaralanmış hâli.
Dal: `v1.0-teslim`, madde başına bir commit, her commit `npm run kontrol` yeşilken.
*(4b ve 4c tek commit'te: taslak ayrı bir varlık değil, aynı veri şeklindeki bir
bayrak — ayırmak bir sonraki commit'te sökülecek geçici bir şekil yazmak olurdu.)*

**SIRADAKİ İŞ: 4d** — "veriler nerede" bölümü + toplu dışa/içe aktarma
(`bundleVersion: 1`). Kitaplık geldiği için artık bir gereklilik: babanın
"Dosyaya kaydet"i hâlâ **tek planı** yazıyor, yani üç planlı bir kurulumun
tamamı tek dosyaya alınamıyor.

Verilen kararlar (2026-08-25): planlar **depo katmanında** tutulur (`State`
şeması değişmez, göç yok) · exe ile site **ortak bir `.json` dosyası** üzerinden
aynı veriyi gösterir, sitede Dosya Sistemi Erişimi API'siyle otomatik yazma ·
site GitHub Pages'te yayınlanır, **depo `ders-programi` olarak yeniden
adlandırılacak** (kullanıcı yapacak).

- [x] **4a Çözücü kurallar sıkılaşınca çökmüyor.** Turun önüne alındı: babanız
      kural kutularına bir sayı girdiği gün otomatik dizme çalışmaz hâle
      geliyordu. 3/359 blok → **241/359, 241 düğüm, 43 ms**. Ayrıntı:
      [STATUS.md](STATUS.md) → *Sekizinci oturum*
- [x] **4b Plan kitaplığı** — yapıldı. `src/library.ts` (yaprak modül: `State`'i
      bilmez, ham string alıp verir). **Devralma tek bayt kopyalamıyor**:
      `planKey('1') === 'ders-programi'`, yani mevcut program yerinde kalıyor ve
      `ders-programi` okuyan yedek zinciri + E2E yardımcıları değişmedi.
      Üst çubukta seçici, Ayarlar → Veri'de yönetim, geçişte geri-al sıfırlanıyor.
      Ayrıntı: [STATUS.md](STATUS.md) → *Dokuzuncu oturum*
- [x] **4c Taslaklar** — yapıldı. Taslak = `PlanInfo.draft` bayrağı, ayrı varlık
      değil. "Taslak olarak kaydet" yerleşimleri atarak kopyalıyor; yeni plan
      üç yoldan açılıyor (Boş · Bu planın kopyası · Taslaktan); Kurulum'un boş
      ekranı taslakları listeliyor
- [ ] **4d Veriler nerede + ortak dosya** — Ayarlar → Veri'de verinin tam olarak
      nerede durduğunu yazan bölüm (tarayıcıda anahtar, exe'de dosya yolu).
      Tümünü dışa/içe aktarma (`bundleVersion: 1`); eski tek plan dosyaları
      (v1–v5) okunmaya devam eder. Sitede `showSaveFilePicker` tutamağı
      IndexedDB'de saklanıp aynı dosyaya yazılır; `file://` altında ve API'siz
      tarayıcıda mevcut "Dosyaya kaydet" davranışına düşer
- [ ] **4e Site derlemesi + PWA** — ikinci hedef `npm run build:site` →
      `dist-site/`. `dist/index.html` (çift tıklanan tek dosya) aynen kalır.
      Manifest ("Ders Programı", `standalone`), elle çizilen simge, `sw.js`
      ile ilk açılıştan sonra çevrimdışı çalışma
- [ ] **4f GitHub Pages yayını** — `.github/workflows/site.yml`. **Kullanıcıdan:**
      depo `ders-programi` olarak yeniden adlandırılacak, Pages kaynağı
      "GitHub Actions" seçilecek
- [ ] **4g Tauri kabuğu** — `src-tauri/`, pencere başlığı "Ders Programı", ikon,
      `frontendDist: ../dist`. **Yeni runtime bağımlılığı yok**: `withGlobalTauri`
      + `window.__TAURI__.core.invoke`, `@tauri-apps/*` npm paketi eklenmiyor
      (tuzak 19'un chunk sorunu doğmasın). **Kullanıcıdan:** Rust toolchain onayı
- [ ] **4h exe dosyaya yazsın** — her değişiklik `Belgelerim/Ders Programı/`
      altına, günlük yedek (son 10 gün). Biçim sitedeki dışa aktarımla birebir
      aynı — "aynı veri" maddesinin karşılığı bu
- [ ] **4i Windows `.exe`** — bu makine Fedora, çapraz derleme güvenilir değil:
      `.github/workflows/exe.yml` → `windows-latest` → artefakt. SmartScreen
      uyarısı için babaya tek cümlelik not
- [~] **4j Belgeler** — yarısı 4b+4c ile birlikte yapıldı: yasak liste
      daraltıldı ("birden çok program sürümü" → **aynı planın** sürüm ağacı,
      gerekçesiyle), `library.ts` mimari şemaya girdi, depolama anahtarı tablosu
      ve tuzak 27–28 yazıldı, test sayıları güncellendi. **Kalan:** ilke 2'nin
      yeni hâli (statik yayın var, backend/veritabanı yok) — 4e/4f yapılmadan
      yazılamaz

### 1. Babanın gerçek verisiyle deneme

**v0'ın çıkma şartı tek bir şeye bağlı: gerçek veri.** Araç artık kendi tarafında
hazır — 338 birim + 200 E2E testi yeşil, üç arayüz turu (v0.7, v0.8, v0.9) bitti ve
program kendi kendini dizebiliyor. Elde veri olmadan yazılacak her yeni özellik
tahmin olur (ilke 5).

> **O hata kapandı (2026-08-25, madde 4a).** Kurallar sıkılaştırılınca çözücü
> 3/359 bloğa düşüyordu; artık 241/359'u 43 ms'de diziyor ve yerleşemeyene
> somut bir cümle yazıyor. Yani aşağıdaki "öğretmen sınırları sorulsun" maddesi
> artık güvenle sorulabilir: babanız o kutulara bir sayı girdiğinde otomatik
> dizme çalışmaya devam eder.

- [ ] Gerçek öğretmen/sınıf/derslik/ders listesi alınsın (Excel'e yazdırıp yapıştırma
      kutusuna yapıştırmak en hızlısı)
- [ ] **Gerçek gün ve zil düzeni teyit ettirilsin**: Pazartesi gerçekten ders yok mu,
      öğle arası hafta içi 5. hafta sonu 6. dersten sonra mı, 12 ders mi
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en fazla/en az
      kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor ve **öyle kalacak** (2026-08-24
      kararı): branş kısaltmasının aksine bunun “doğru cevabı” okuldan okula değişir.
      Yanlış bir varsayılan hücreleri sessizce kırmızıya boyar ve babanız sebebini
      anlamaz. 0 = kural hiç tetiklenmez; sayı girilince açılır
- [ ] Bir haftalık program baştan sona dizilsin → **v0'ın çıkma şartı**
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?
- [ ] **Branş listesi teyit ettirilsin**: gömülü 21 ad geliyor; okulun gerçekten
      verdiği branşlar hangileri, listeden ne çıkarılacak (artık Ayarlar → Branşlar'dan
      düzenlenebiliyor)
- [ ] **36 rengi gözle sor**: dizerken iki satırı karıştırdığın oldu mu? ΔE eşiği
      sayıyı garanti eder, gözü değil
- [ ] **Otomatik dizmenin çıktısı KULLANILIR mı, sorulacak.** Yasal olduğu ölçülüyor
      (19 dünyada, her blok `blocker()`'dan geçiyor); *iyi* olduğu ölçülmüyor. Sorular:
      sınıfın günü içinde boşluk (pencere) kalıyor mu, öğretmen okula gereksiz gün
      geliyor mu, günler dengeli mi. Cevaba göre v2 (kalite) şekillenir
- [x] **Sıkışık veride çözücü ne yapıyor?** 2026-08-25'te ölçüldü. Geri sarma artık
      dört dünyada gerçekten çalışıyor (`erken-saat-tuzagi` 201 düğüm / 9 blok,
      `derin-geri-sarma` 8362 / 12, `derslik-darbogazi` 57 929 / 8). Cevap iyi değil:
      gerçek ölçekte tıkanınca bütçeyi doldurup neredeyse hiçbir şey dizemiyor
- [ ] **Kenar çubuğu dar mı geniş mi kullanılıyor?** 92px varsayılan; babanın
      daraltıp daraltmadığı, ızgarada 92px'in eksikliğinin hissedilip hissedilmediği

### 2. Tauri ile `.exe` — ayrıntılar (madde 4g–4i)

Babanın makinesi **Windows 10** → Tauri v2 destekliyor, yol açık.
WebView2 bu makinede kurulu (151.0.4129.101); Rust **kurulu değil**.

- [ ] Rust toolchain kurulsun
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
      *(v0.7'de eksen döndü ve sayfa A4 yatay oldu — BİTENLER 13, madde 1j)*
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

### 10. Testler ✅ — 159 test *(v0.7 sonunda 228)*

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

### 13. v0.7 — Arayüz turu ✅ — 2026-08-24

localhost'ta gerçek gözle ilk denemede çıkan liste. Mantık ve veri modeli zaten
sağlamdı; kusurların hepsi görünüş ve kullanım tarafındaydı. Dal:
`v0.7-arayuz-turu`, madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **1a Koyu tema + tema düğmesi.** 16 ham renk kaçağı CSS değişkenine çekildi;
      `:root[data-theme='dark']` yalnızca anlamsal değişkenleri yeniden tanımlıyor;
      `color-scheme` iki temada da doğru kuruluyor. Öğretmen paleti ve üstündeki
      mürekkep dönmüyor; `@media print` her şeyi açık palete sabitliyor. Tercih
      `localStorage['ders-programi-tema']`'da, `State`'e girmiyor
      → *Ölçüm sırasında AÇIK temada iki AA kusuru bulundu ve düzeltildi:
      `--ok` kendi zemininde 4,19:1, kapalı hücredeki "×" 4,20:1 idi.*
- [x] **1b Kurulum yedi adıma bölündü.** `Setup.tsx` 1132 satırdı →
      `components/setup/` altında kabuk + adımlar. Sayaçlı, numaralı şerit; kilitli
      sihirbaz değil. Aynı geçişte testsiz iş mantığı `entities.ts`'e taşındı
      (`addClassesFromRows`, `addLessonsFromRows`, `weeklyLoad`, `hourLabels`)
- [x] **1c Öğle arası ızgarada ayraç sütunu oldu**, zil önizlemesine ara satırı
      eklendi (her desen kendi yerinde). Ayraç `data-day` taşımıyor
- [x] **1d Müsaitlik döndürüldü**: satır = gün, sütun = ders. `shortDay` Pazar →
      `Pzr`. `bell.ts` → `sharedPeriods()` (uyuşmayan saat yazılmaz)
- [x] **1e Kısaltma otomatik**: `makeShort()` tek eve taşındı, `addTeacher` boş
      kısaltmayı addan üretiyor, çakışma uyarısı adları sayıyor
- [x] **1f Yedek düğmeleri** "Dosyaya kaydet / Dosyadan aç"; "Sıfırla" ayrıldı;
      açıklama satırı Program sekmesinde gizli (ızgaradan bir satır götürüyordu)
- [x] **1g Görsel cila**: hizalama, `:focus-visible`, dört düğme durumu, satır içi
      stiller sınıflara, `--space-1..5` ölçeği, `Field` bileşeni
- [x] **1h Silme onayı dört varlıkta da her zaman**, metin ne gideceğini sayıyor
      (`deletionSummary`, 7 testli)
- [x] **1i Branş kısaltmaları — şema v3 → v4.** Yalnızca değiştirilen saklanıyor;
      göç birim **ve** gerçek tarayıcıda "Dosyadan aç" yolundan doğrulandı
- [x] **1j Baskı A4 yatay, eşit sütunlu, eksen dönmüş.** PDF'in MediaBox'ı
      ölçülüyor (842×595 pt)
- [x] **1k Görünüm iki simge düğmesi**, seçili basılı (`aria-pressed`/`aria-label`)
- [x] **1l Testler**: 133 → **177 birim**, 26 → **51 E2E**. Renk kontrastı ve renk
      ayrımı hesaplanarak ölçülüyor (WCAG + CIE Lab ΔE). `npm run ekran` iki temada
      beş ekran görüntüsü üretiyor
- [x] **1m Belgeler**: `CLAUDE.md` (şema v4, arayüz, mimari, tuzak 13–15),
      `docs/PLAN.md`, `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kural sayılarına varsayılan konmadı (0 = sınır yok kaldı) —
doğru cevabı okuldan okula değişir, yanlış varsayılan hücreleri sessizce kırmızıya
boyar (2026-08-24 kararı).

---

### 14. v0.8 — ikinci arayüz turu ✅ — 2026-08-25

localhost'ta gerçek gözle **ikinci** denemede çıkan liste. Dal: `v0.8-arayuz-turu-2`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **2a Palet 12 → 36 renk, CSS'ten TS'e.** Her öğretmen kendi renginde;
      `firstFreeColor()` kullanılmayan en küçük indeksi verir, silinen rengi yeniden
      kullanır. Renkler elle seçilmedi, **arandı** (en uzak nokta / CIE Lab, kontrast
      kısıtı altında). Ölçülen: en yakın çift ΔE **17,5** (eski 12'lik palette 13,4),
      art arda indeksler 23,8, kontrast 7,3:1 ve 4,7:1
- [x] **2b Şema v4 → v5**: `ClassGroup.color` + `settings.subjects`. `spreadColors()`
      her yüklemede çalışıyor — v4 dosyaları 12 renkle yazıldığı için çakışma kesin;
      renkleri zaten tekil olan dosya dokunulmadan geçiyor
- [x] **2c Ayarlar sekmesi.** Kurulum 7 → **4** adım (Derslikler · Öğretmenler ·
      Sınıflar · Dersler); Ayarlar 4 bölüm (Okul ve zil · Kurallar · Branşlar · Veri).
      `School`/`Rules`/`Subjects` taşındı, yeniden yazılmadı; `Field`/`LimitBox`/
      `props` bir üst klasöre çıktı, `SetupProps` → `PanelProps`.
      **`Sıfırla` üst çubuktan Ayarlar → Veri'ye taşındı**
- [x] **2d Branş listeden seçiliyor.** "+ Yeni branş…" oracıkta ekliyor; yapıştırılan
      listedeki tanınmayan branş da listeye giriyor (`addTeachersFromRows`).
      Kullanılan branş silinemiyor, mesaj kimin kullandığını sayıyor
- [x] **2e Başlangıç saati iki açılır liste** (00–23, beşer dakika). Yan fayda: kutuyu
      boşaltıp günü sessizce 00:00'a alma tuzağı ortadan kalktı
- [x] **2f Havuz görünümü takip ediyor** *(bildirilen hata)*. `buildPool` `view` almıyordu
- [x] **2g Simgeler**: öğretmen = mezuniyet kepi, sınıf = öğrenci grubu (aSc'nin sözlüğü)
- [x] **2h Öğle arası 10 → 6 px, çarpı 11 → 16 px.** Asıl hata boyut değildi: `.break-col`
      genişliği `table.grid tbody td` tarafından **eziliyordu**, ayraç bir ders kadar
      genişti. Baskıdaki `table.print th td.p-closed` seçicisi de hiç eşleşmiyordu
- [x] **2i Kapalı saatte kalan ders kırmızı işaretleniyor, SİLİNMİYOR** (ilke 6).
      `closedConflicts()`; Kontrol'de tek tek listeleniyor, Müsaitlik'te sayılıyor
- [x] **2j Yazdırmada sayfa seçimi.** Dışarıda bırakılanlar tutuluyor, ki sonradan
      eklenen sınıf kendiliğinden bassın. Seçim `App`'te — sekme değişince silinmesin
- [x] **2k Testler**: 177 → **219 birim**, 51 → **87 E2E**. Her madde için en az bir
      gerçek-tarayıcı iddiası; renk ayrımı, ayraç genişliği ve yazı boyu **ölçülüyor**
- [x] **2l Belgeler**: `CLAUDE.md` (altı sekme, `palette.ts`, şema v5, tuzak 16–18),
      `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kapalı saatteki dersleri toplu kaldıran düğme konmadı —
kullanıcı "kaldırma, kırmızı işaretle" dedi; kararı baba veriyor (2026-08-25 kararı).

---

### 15. v0.9 — otomatik dizme, sol kenar çubuğu, sağ tık, tam E2E ✅ — 2026-08-25

Kullanıcının TASKS sonuna yazdığı dört madde. Dal: `v0.9-otomatik-dizme`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **3a E2E tek dosyadan yedi dosyaya.** `e2e/app.spec.ts` 2151 satırdı; ortak
      yardımcılar `e2e/helpers.ts`'e, testler konularına dağıldı. Tek test silinmedi.
      `fullyParallel` + `workers: 4` — `file://` altında context başına ayrı
      `localStorage` olduğu **ölçüldü**: 66 sn → 16 sn
- [x] **3b Sekmeler üstten sola.** 92px kenar çubuğu (daraltılınca 52px), tercih
      `localStorage['ders-programi-kenar']`'da. Gerekçe ölçüye dayanıyor: yatay şerit
      768px'lik ekranda ızgaradan bir öğretmen satırı götürüyordu. `.main`
      sarmalayıcısı altı bileşenden `App`'e alındı; `.topbar-note` satır içi oldu ve
      "Program'da gizle" özel durumu kalktı
- [x] **3c Her sekmenin sağ tarafı dolduruldu.** `.list.narrow/mid/wide` (520/640/720px)
      silindi, Müsaitlik hücresi 46px **sabit**ken **minimum** oldu. Tek düzen kuralı
      `.cols`. Sağa konan hiçbir bilgi yeni değil: Kurulum'da kapasite özeti (yeni
      `Summary.tsx`, `buildCapacity` ile — `buildReport`'un pahalı yarısı her tuş
      vuruşunda çalışamaz, tuzak 3), Ayarlar → Okul'da zil önizlemesi, Kurallar'da
      canlı ihlal listesi, Müsaitlik'te 25 öğretmeni birden gösteren liste,
      Yazdır'da sayfa seçimi. Kontrol'de akan kart ızgarası (`.panel-grid`)
- [x] **3d Basılı düğmenin iki çelişen tanımı** birleşti (özgüllük hatası:
      `:hover:not(:disabled)` (0,3,0), `[aria-pressed]` (0,2,0)'ı yeniyordu).
      `Field` `wide` prop'u aldı
- [x] **3e Sol tık taşır, sağ tık siler**, Delete klavye eşdeğeri. İki tuzak kapatıldı:
      ders kendini engelliyordu (harita artık kaynağı kaldırılmış durum üstünde) ve
      ızgaradan kart alınınca ızgara zıplıyordu (`scrollIntoView` yalnız havuz için)
- [x] **3f `src/solver.ts`** — MRV + forward checking + iz tabanlı geri sarma, ana iş
      parçacığında dilimli. Kısıt mantığı **yeniden yazılmadı**: her soru `blocker()`'a
      gidiyor. `constraints.ts`'e `occupy`/`vacate` eklendi (7 eşdeğerlik testi).
      **Ölçülen: 359/359 blok, 359 düğüm, 87 ms, hiç geri sarma yok**
- [x] **3g Arayüz**: iki düğme, `.reason-bar`'da ilerleme ve sonuç, tek geri-al adımı.
      Koşu `App`'te yaşıyor (tuzak 18). Sonucun sessizce atıldığı gerçek hata
      bulundu ve düzeltildi (tuzak 20)
- [x] **3h Kapsam boşlukları**: 87 → **176 E2E**. Yeni `duzen.spec.ts`,
      `kontrol.spec.ts`, `bos-ekran.spec.ts`, `otomatik.spec.ts`; Kurulum'un düzenleme
      yolları, Ayarlar'ın her alanı (ortadan gün çıkarma dahil — tuzak 11'in ilk
      tarayıcı kanıtı), geri-al zinciri, hata yolları, kayıt uyarısının GÖRÜNMESİ,
      klavye gezinme
- [x] **3i Görsel regresyon**: 20 referans, `ekran.spec.ts` ile **aynı** `SCENES`
      listesi. Ayrı komut (`npm run gorsel`), `kontrol`'e bağlı değil — gerekçe
      sistem fontu. Testin kendisi test edildi: 92px → 120px, 20'den 18'i kırmızı
- [x] **3j Belgeler**: `CLAUDE.md` (tuzak 19–22, kenar çubuğu, `solver.ts`, test
      tablosuna beşinci satır), `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:**
- **Çözücüye ayar konmadı** — iki düğme, kutucuk yok. "Sabaha yay", "günleri dengele"
  gibi tercihlerin doğru cevabı bir dönem kullanılmadan bilinemez (ilke 5)
- **Web Worker kullanılmadı** — tek dosya + `file://` ile çalışmıyor (tuzak 19)
- **Görsel regresyon `kontrol`'e konmadı** — referans tek makine için doğru
- **Simetri kırma kaldırıldı** — teoride doğru, ölçüldüğünde felaket (tuzak 21)

---

## Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz. Öncelik **babanın geri dönütü**.

- **Boşluk (pencere) kuralları** — sınıf ve öğretmen için ayrı ayrı,
  Kapalı / Uyar / Engelle. v0.6'da bilerek yapılmadı (istenen o değildi)
- ~~**v1 Otomatik doldurma**~~ → **v0.9'da yapıldı** (BİTENLER 15). Plandan iki
  sapma: **Web Worker kullanılmadı** (tuzak 19) ve bütçe 500 ms değil, ilerlemesi
  görünen ve durdurulabilen 15 sn — çünkü UI donmuyor ve kullanıcı her an durdurabiliyor
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas. **Artık somut bir
  başlangıcı var**: v0.9'un çözücüsü yasal bir program üretiyor ama kalitesi
  ölçülmedi (boşluk, öğretmenin geldiği gün sayısı, gün dengesi). Önce babanın
  "bunu kullanır mıydın" cevabı
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
- ~~koyu tema olsun~~ → **v0.7'de yapıldı** (BİTENLER 13)
- Kapanırken kaydedilmemiş değişiklik uyarısı. *Not: şu an her değişiklik 400 ms
  gecikmeyle otomatik kaydediliyor ve sekme kapanışında anında yazılıyor
  (`store.ts`), yani "kaydedilmemiş" durum pratikte oluşmuyor. Yine de babanın
  içi rahat etsin diye görünür bir "kaydedildi" işareti düşünülebilir.*

> **Bu bölümün altına elle yazılan altı satır** (`.exe` · web sitesi · güzel
> simge ve ad · verilerin nerede durduğu · taslaklar · birden fazla ders planı)
> **ŞİMDİ SIRADA → 0. v1.0 turuna** taşındı ve 4b–4j maddelerine dönüştü.
