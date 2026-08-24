# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-24

## Şu anki sürüm hedefi

**v0 + v0.5** — elle dizme + yapılabilirlik kontrolü.
Otomatik doldurma (v1) bu turda **yok**.

- **v0 çıkma şartı:** babam gerçek verisiyle bir haftalık programı baştan sona dizip
  çıktısını alabiliyor. → *araç çalışıyor ve gerçek tarayıcıda doğrulandı; gerçek
  veriyle denenmedi*
- **v0.5 çıkma şartı:** program dizilemediğinde sebebini araca sorup öğrenebiliyor.
  → **sağlandı**

---

## Durum özeti

| Aşama | Durum |
|---|---|
| Karar turu (sorular cevaplandı) | ✅ |
| Belgeler (CLAUDE.md, PLAN, STATUS, TASKS) | ✅ |
| İskele (Vite + React + TS + Vitest + singlefile) | ✅ |
| Çekirdek: `tip.ts` + `kisit.ts` | ✅ 26 test |
| `durum.ts` (reducer, geri al, kayıt, yedek) | ✅ |
| Kurulum sekmesi + Excel yapıştırma | ✅ 17 test |
| Müsaitlik ızgarası | ✅ |
| Program ızgarası + kart havuzu | ✅ |
| Sürükle-bırak (Pointer Events) | ✅ **gerçek tarayıcıda doğrulandı** |
| Görünüm değiştirme (öğretmen ⇄ sınıf) | ✅ |
| Yazdırma | ✅ **taşma yok, PDF üretiliyor** |
| Kontrol sekmesi (v0.5) | ✅ 8 test |
| `file://` altında kalıcılık | ✅ **çalışıyor** |
| Gerçek veriyle deneme | ⬜ **bekliyor** |
| Kod dilinin İngilizceye çevrilmesi | ⬜ bekliyor |
| Tauri ile `.exe` paketleme | ⬜ bekliyor |

**Testler: 65 birim + 18 E2E = 83, hepsi geçiyor. `tsc --noEmit` temiz.
`npm run build` → tek dosya `dist/index.html`, 253 KB, sıfır ağ çağrısı.**

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

## Ölçülen değerler

Örnek veriyle (25 öğretmen, 20 sınıf, 8 derslik, 7 gün × 12 saat, 99 ders):

| Ölçüm | Değer |
|---|---|
| Sürükleme başlangıcı (`indeksle` + 84 `engel`) | **0,18 ms** |
| Açgözlü doldurmanın yerleştirdiği ders saati | %96 (589/615) |
| Tüm programı açgözlü dizme | 83 ms |
| `dist/index.html` | 253 KB, tek dosya, 0 ağ çağrısı |
| E2E paketi | 18 test, ~11 sn |

Sürükleme başlangıcı asıl önemli sayı: babanın makinesi 20 kat yavaş olsa bile 4 ms.
`pointermove` sırasında zaten kısıt hesabı yapılmıyor.

---

## Verilmiş kararlar

| Konu | Karar |
|---|---|
| Branş | **Öğretmenin** alanı, dersin değil. Her öğretmenin tek branşı var. |
| Sınıflar arası çakışma | Yok. Sınıf = kapalı öğrenci kümesi. |
| Derslik | Sınıfın **sabit** alanı. Seçim UI'sı yok, çakışma kontrolü var. |
| Ana ekran düzeni | Satır = öğretmen, sütun = 7 gün × 12 saat. Tek düğmeyle sınıf görünümü. |
| Sürükle-bırak | **Pointer Events** (HTML5 DnD değil). |
| Cihaz | Windows masaüstü, fare. Tablet hedef değil. |
| Veri girişi | Elle + **Excel'den yapıştırma**. |
| Boşluk kuralları | v0'da **yok**. Sonra açılıp kapanabilir ayar olarak gelecek. |
| Ölçek | ~25 öğretmen, ~20 sınıf, 8 derslik, 7 gün × 12 saat — hepsi ayarlanabilir. |
| **Teslim biçimi** | **Tauri ile gerçek `.exe`.** Tek HTML dosyası ara adım olarak kalır. |
| **Babanın işletim sistemi** | **Windows 10** — Tauri v2 destekliyor, yol açık. |
| **Kod dili** | **Arayüz Türkçe, kod İngilizce.** Geçiş bekliyor. |
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

3. **Planda olmayan eklemeler:** `src/ornek.ts` (gerçek ölçekte örnek veri),
   `src/App.test.tsx` (jsdom duman testi), `e2e/` (Playwright). Hepsi devDependency,
   çıktı dosyasını etkilemiyor.

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

---

## Bilinen eksikler

1. **Babanın gerçek verisi elde yok.** v0'ın çıkma şartı bu. Örnek veriyle değil
   gerçek veriyle test edilmeli.
2. **Hız babanın bilgisayarında ölçülmedi.** Buradaki ölçümler geliştirme makinesinde.
3. **Baskı gerçek kâğıda alınmadı.** E2E taşma olmadığını ve PDF üretildiğini
   gösteriyor, ama fiziksel çıktıya bakılmadı.
4. `.roz` dosyası incelenmedi (aSc'den içe aktarma — düşük öncelik).

---

## Bilinen hatalar

Bilinen açık hata yok.

---

## Başka bir bilgisayarda devam etmek için

Depo: `https://github.com/AlparslanSemiz/AscLike.git`

```bash
git clone https://github.com/AlparslanSemiz/AscLike.git
cd AscLike
npm install
npx playwright install chromium   # E2E testleri için, bir kez
npm run kontrol                   # tsc + 65 birim + derleme + 18 E2E
npm run dev                       # geliştirme sunucusu
```

`npm run kontrol` yeşilse ortam doğru kurulmuş demektir. Sonra
[TASKS.md](TASKS.md) içindeki **"ŞİMDİ SIRADA"** bölümünden devam edilir.
