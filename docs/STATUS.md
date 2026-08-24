# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-24

## Şu anki sürüm hedefi

**v0 + v0.5** — elle dizme + yapılabilirlik kontrolü.
Otomatik doldurma (v1) bu turda **yok**.

- **v0 çıkma şartı:** babam gerçek verisiyle bir haftalık programı baştan sona dizip
  çıktısını alabiliyor. → *kod hazır, gerçek veriyle denenmedi*
- **v0.5 çıkma şartı:** program dizilemediğinde sebebini araca sorup öğrenebiliyor.
  → *Kontrol sekmesi çalışıyor*

---

## Durum özeti

| Aşama | Durum |
|---|---|
| Karar turu (sorular cevaplandı) | ✅ |
| Belgeler (CLAUDE.md, STATUS, TASKS, PLAN güncellemesi) | ✅ |
| İskele (Vite + React + TS + Vitest + singlefile) | ✅ |
| Çekirdek: `tip.ts` + `kisit.ts` + testler | ✅ 26 test |
| `durum.ts` (reducer, geri al, kayıt, yedek) | ✅ |
| Kurulum sekmesi + Excel yapıştırma | ✅ 17 test |
| Müsaitlik ızgarası | ✅ |
| Program ızgarası + kart havuzu | ✅ |
| Yazdırma | ✅ *baskı önizlemesinde göz kontrolü yapılmadı* |
| Sürükle-bırak (Pointer Events) | ✅ *gerçek tarayıcıda denenmedi* |
| Görünüm değiştirme (öğretmen ⇄ sınıf) | ✅ |
| Kontrol sekmesi (v0.5) | ✅ 8 test |
| Gerçek veriyle deneme | ⬜ **bekliyor** |

**Testler: 65/65 geçiyor. `tsc --noEmit` temiz. `npm run build` → tek dosya
`dist/index.html`, 252 KB, sıfır ağ çağrısı.**

Ayrıntı: [TASKS.md](TASKS.md)

---

## Ölçülen değerler

Örnek veriyle (25 öğretmen, 20 sınıf, 8 derslik, 7 gün × 12 saat, 99 ders):

| Ölçüm | Değer |
|---|---|
| Sürükleme başlangıcı (`indeksle` + 84 `engel`) | **0,18 ms** |
| Açgözlü doldurmanın yerleştirdiği ders saati | %96 (589/615) |
| Tüm programı açgözlü dizme | 83 ms |
| `dist/index.html` | 252 KB, tek dosya |

Sürükleme başlangıcı asıl önemli olan sayı: babanın makinesi 20 kat yavaş olsa
bile 4 ms eder, yani sürüklerken bekleme hissi olmamalı. `pointermove` sırasında
zaten hiç hesap yapılmıyor.

---

## Verilmiş kararlar

Bunlar soruldu ve cevaplandı; yeniden tartışılmaz.

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

---

## Plandan bilerek sapılan yerler

1. **Blok etiketi her hücrede tekrarlanıyor.** PLAN.md tuzak 9 "ikinci hücrede
   başlık tekrarlanmasın" diyordu. Ama babanın gerçek aSc ekranında tekrarlanıyor
   (`311 311 311`, `450 450 450`). Alışkanlığı bozmamak için tekrarlandı; bloğun tek
   parça olduğunu aradaki ayracın soluklaşması gösteriyor. `rowspan` yine kullanılmadı.

2. **Yedek zinciri her değişiklikte değil, her açılışta kaydırılıyor.** Her
   değişiklikte 4 × 100 KB JSON yazmak yavaş makinede sürüklemeyi takardı. Son 3
   *oturumun* durumunu saklamak, son 3 *tıklamayı* saklamaktan daha değerli. Ana
   kayıt yine her değişiklikte (400 ms gecikmeyle) yapılıyor.

3. **Planda olmayan iki ek:** `src/ornek.ts` (gerçek ölçekte örnek veri — hem
   babanın denemesi hem hız ölçümü için) ve `src/App.test.tsx` (arayüzün gerçekten
   açıldığını kanıtlayan duman testi; `jsdom` devDependency ekledi, çıktıyı etkilemez).

---

## Doğrulanmayı bekleyen varsayımlar

1. **Derslik gerçekten paylaşılıyor mu?**
   Önce "her sınıfın kendi odası var" dendi, sonra "harf = derslik" dendi — fotoğrafta
   20 sınıf 8 harfi paylaşıyor (A: 410/411/510/511, D: 414/415/530/531).
   *Çözüm:* derslik çakışması yine de kontrol ediliyor. Odalar paylaşılmıyorsa kontrol
   hiç tetiklenmez, maliyeti sıfır. **Her iki durumda da kod doğru.**

2. **Hücredeki 3 haneli sayı = sınıf, harf = derslik.** Fotoğraftan çıkarıldı,
   onaylandı ama "sanırım" kaydıyla. Alternatif okuma (sayı = ders kodu, harf = sınıf)
   aynı çakışma kuralını üretiyor, o yüzden risk düşük. İkisi de serbest metin.

3. **Ölçek: ~25 öğretmen, ~20 sınıf.** "Sanırım" kaydıyla verildi.
   *Etkisi:* sadece varsayılan ayarlar; her şey ayarlanabilir.

4. **Blok en fazla 3 saat.** Fotoğrafta `311 311 311`, `450 450 450` görüldü.
   *Etkisi:* 4+ saatlik blok gerekirse tek bir sayı sınırı gevşetilir.

---

## Bilinen eksikler / sıradaki işler

Önem sırasıyla:

1. **Sürükle-bırak gerçek tarayıcıda denenmedi.** Bu ortamda tarayıcı otomasyonu yok.
   Duman testi ızgaranın çizildiğini, karta tıklayınca bloğun kalktığını ve Ctrl+Z'nin
   geri getirdiğini kanıtlıyor; ama fareyle sürükleme (`elementFromPoint`, hayalet
   kartın hareketi, yeşil/kırmızı vurgu) jsdom'da anlamlı test edilemiyor.
   → `npm run dev` ile açıp bir kartı ızgaraya sürükleyerek doğrulanmalı.

2. **Baskı önizlemesi göz kontrolünden geçmedi.** Sayfa başına bir sınıf, A4 dikey,
   7 sütun × 12 satır düzeni kodda hazır ve 20 sayfa üretildiği test edildi; ama
   gerçek yazdırma önizlemesinde nasıl durduğu görülmedi.

3. **Babanın gerçek verisi elde yok.** Örnek veriyle değil gerçek veriyle test
   edilmeli, yoksa yanlış şey optimize edilir.

4. **Hız babanın bilgisayarında ölçülmeli**, geliştirme makinesinde değil.

5. `.roz` dosyası incelenmedi. İstenirse aSc'den içe aktarma denenebilir
   (biçim belgelenmemiş, kırılgan — düşük öncelik).

---

## Bilinen hatalar

Bilinen açık hata yok.
