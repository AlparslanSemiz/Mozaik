# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti

Yeni bir bilgisayarda başlıyorsan önce [STATUS.md](STATUS.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

---

## ŞİMDİ SIRADA

### 1. Kod dilini İngilizceye çevir

Arayüz Türkçe kalacak, kod İngilizce olacak (bkz. CLAUDE.md "Kod dili ve biçim").
Davranış değişmeyecek — saf yeniden adlandırma. Sonrasında **83 testin hepsi**
(65 birim + 18 E2E) yine geçmeli; bu, yeniden adlandırmanın güvenlik ağı.

- [ ] Tipler: `Durum`→`State`, `Ogretmen`→`Teacher`, `Sinif`→`ClassGroup`,
      `Derslik`→`Room`, `Ders`→`Lesson`, `yerlesim`→`placements`,
      `musaitDegil`→`unavailable`, `ayar`→`settings`, `blok`→`blockSize`
- [ ] Dosyalar: `kisit.ts`→`constraints.ts`, `fizibilite.ts`→`feasibility.ts`,
      `iceaktar.ts`→`import.ts`, `durum.ts`→`store.ts`, `suruk.ts`→`drag.ts`,
      `veri.ts`→`entities.ts`, `ornek.ts`→`sample.ts`, `tip.ts`→`types.ts`,
      `bilesen/`→`components/` (`Izgara`→`Grid`, `Kurulum`→`Setup`,
      `Musaitlik`→`Availability`, `KartHavuzu`→`LessonPool`, `Kontrol`→`Check`,
      `Yazdir`→`Print`)
- [ ] Yorumlar İngilizceye
- [ ] **Kullanıcıya görünen metinler Türkçe kalır, hiçbiri değişmez.**
      E2E testleri Türkçe metinlere göre eleman buluyor; bu testler değişmemeli.
- [ ] CSS sınıf adları da İngilizceye (`.izgara`→`.grid`, `.hedef-gecerli`→`.drop-ok`…);
      E2E ve `suruk.ts` bu adlara bağlı, birlikte güncellenmeli
- [ ] `schemaVersion` 2'ye çıkar + eski (v1) yedekleri okuyan göç kodu.
      **Bu olmadan bu değişiklikten önce indirilen yedekler açılmaz.**

### 2. Babanın gerçek verisiyle deneme

- [ ] Gerçek öğretmen/sınıf/derslik/ders listesi alınsın (Excel'e yazdırıp yapıştırma
      kutusuna yapıştırmak en hızlısı)
- [ ] Bir haftalık program baştan sona dizilsin → **v0'ın çıkma şartı**
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?

### 3. Tauri ile `.exe`

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

- [x] `src/tip.ts`, `src/kisit.ts` (`indeksle`, `engel`, `gecerliSaatler`,
      `blokBasi`, `yerlestir`, `kaldir`, `yerlesenSaat`, `temizle`)
- [x] Beş sert kısıt, hepsi somut Türkçe mesaj veriyor
- [x] Bitişik blok ayrımı ve cascade silme dahil test edildi

### 3. Durum yönetimi ✅

- [x] `useReducer`, geri al/ileri al (30 adım), **Ctrl+Z / Ctrl+Y**
- [x] Metin kutusundayken Ctrl+Z kapılmıyor
- [x] localStorage otomatik kayıt (400 ms gecikmeli) + kapanışta anında yazma
- [x] Açılışta yedek zinciri kaydırma (son 3 oturum)
- [x] Yedek indir / yükle / Sıfırla; bozuk JSON'da çökmüyor
- [x] **Kayıt çalışmıyorsa kalıcı kırmızı uyarı** (sessiz veri kaybı olmasın)
- [x] `src/ornek.ts` — gerçek ölçekte deterministik örnek veri

### 4. Kurulum sekmesi ✅ — 17 test

- [x] Gün/saat düzeni, derslik/öğretmen/sınıf/ders listeleri
- [x] `src/iceaktar.ts` — Excel yapıştırma, **önizlemeli**
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

### 10. Testler ✅ — 83 test

- [x] 65 birim testi (`kisit`, `fizibilite`, `iceaktar`, `ornek`, `App` duman testi)
- [x] **18 E2E testi** (Playwright, gerçek Chromium, `file://`, 1366×768)
- [x] `file://` altında `localStorage` çalıştığı doğrulandı
- [x] Gerçek ölçekte hız ölçüldü (sürükleme başlangıcı 0,18 ms)

---

## Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz. Öncelik **babanın geri dönütü**.

- **v0.6 Kural ayarları** — sınıf boşluğu, öğretmen boşluğu, günlük aynı ders
  sınırı; her biri Kapalı / Uyar / Engelle
- **v1 Otomatik doldurma** — MRV + forward checking backtracking, Web Worker,
  500 ms sonra pes et, tıkandığı dersi söyle
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
- koyu tema olsun.
- otomatik kaydetsin her an. kaydedilmediyse de çıkmaya izin verilmesin ya da işte nasıl olması gerekiyorsa.
