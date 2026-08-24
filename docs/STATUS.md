# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-24 (dördüncü oturum: **v0.7 arayüz turu bitti**, `v0.7-arayuz-turu` dalında 12 commit)

## Şu anki sürüm hedefi

**v0 + v0.5 + v0.6 + v0.7** — elle dizme + yapılabilirlik kontrolü + okul düzeni ve
kurallar + arayüz turu. Otomatik doldurma (v1) bu turda da **yok**.

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
| **Görünüm simgeleri** | ✅ |
| Gerçek veriyle deneme | ⬜ **bekliyor** |
| Tauri ile `.exe` paketleme | ⬜ bekliyor |

**Testler: 177 birim + 51 E2E = 228, hepsi geçiyor. `tsc --noEmit` temiz.
`npm run build` → tek dosya `dist/index.html`, 288 KB, sıfır ağ çağrısı.**

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
| Sürükleme başlangıcı (`buildIndex` + 72 `check`) | **0,212 ms** |
| `dist/index.html` | 288 KB, tek dosya, 0 ağ çağrısı |
| E2E paketi | 51 test, ~25 sn |
| Birim paketi | 177 test, ~1,5 sn |
| Baskı sayfası | A4 yatay (842×595 pt), 12 eşit sütun (±1px) |

Sürükleme başlangıcı asıl önemli sayı: babanın makinesi 20 kat yavaş olsa bile 4 ms.
`check()` artık `blocker()`'ın üstüne kural hesabı da yapıyor ama sayı yerinde durdu —
kurallar gün başına en fazla 16 hücre tarıyor. `pointermove` sırasında zaten hiç kısıt
hesabı yapılmıyor.

---

## Verilmiş kararlar

| Konu | Karar |
|---|---|
| Branş | **Öğretmenin** alanı, dersin değil. Her öğretmenin tek branşı var. |
| Sınıflar arası çakışma | Yok. Sınıf = kapalı öğrenci kümesi. |
| Derslik | Sınıfın **sabit** alanı. Seçim UI'sı yok, çakışma kontrolü var. |
| Ana ekran düzeni | Satır = öğretmen, sütun = 6 gün × 12 saat. Tek düğmeyle sınıf görünümü. |
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

---

## Bilinen eksikler

1. **Babanın gerçek verisi elde yok.** v0'ın çıkma şartı bu. Örnek veriyle değil
   gerçek veriyle test edilmeli.
2. **Hız babanın bilgisayarında ölçülmedi.** Buradaki ölçümler geliştirme makinesinde.
3. **Baskı gerçek kâğıda alınmadı.** E2E artık sayfanın A4 **yatay** çıktığını
   (MediaBox 842×595 pt) ve sütunların eşit olduğunu ölçüyor, ama fiziksel çıktıya
   hâlâ bakılmadı. Yatay sayfa yazıcı ayarında da yatay seçilmesini gerektirebilir.
4. **Koyu tema babanın tarayıcısında (Brave) görülmedi.** Kontrast burada ölçüldü;
   asıl iddia "tarayıcı artık kendi karartmasını yapmıyor" ve bu yalnızca onun
   makinesinde kesinleşir.
5. `.roz` dosyası incelenmedi (aSc'den içe aktarma — düşük öncelik).

---

## Bilinen hatalar

Bilinen açık hata yok.

---

## Oturum sonu durumu (2026-08-24, dördüncü oturum)

Dal: **`v0.7-arayuz-turu`** (`main`'e birleştirilmedi). 12 commit, her biri
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
npm run kontrol                   # tsc + 177 birim + derleme + 51 E2E
npm run dev                       # geliştirme sunucusu
```

`npm run kontrol` yeşilse ortam doğru kurulmuş demektir. Sonra
[TASKS.md](TASKS.md) içindeki **"ŞİMDİ SIRADA"** bölümünden devam edilir.
