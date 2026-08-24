# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-24 (üçüncü oturum: v0.6 — zil saatleri, gün seçimi, müsaitlik, kurallar)

## Şu anki sürüm hedefi

**v0 + v0.5 + v0.6** — elle dizme + yapılabilirlik kontrolü + okul düzeni ve kurallar.
Otomatik doldurma (v1) bu turda da **yok**.

- **v0 çıkma şartı:** babam gerçek verisiyle bir haftalık programı baştan sona dizip
  çıktısını alabiliyor. → *araç çalışıyor ve gerçek tarayıcıda doğrulandı; gerçek
  veriyle denenmedi*
- **v0.5 çıkma şartı:** program dizilemediğinde sebebini araca sorup öğrenebiliyor.
  → **sağlandı**
- **v0.6 çıkma şartı:** babam okulunun gerçek gün/saat düzenini ve öğretmen sınırlarını
  araca tarif edebiliyor. → **sağlandı** (gün seçimi, zil saatleri, sınıf/derslik
  müsaitliği, dört kural kutusu)

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
| Gerçek veriyle deneme | ⬜ **bekliyor** |
| Tauri ile `.exe` paketleme | ⬜ bekliyor |

**Testler: 133 birim + 26 E2E = 159, hepsi geçiyor. `tsc --noEmit` temiz.
`npm run build` → tek dosya `dist/index.html`, 273 KB, sıfır ağ çağrısı
(`grep` ile doğrulandı: `fetch(` yok, dış URL yok — yalnızca XML namespace sabitleri).**

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
| `dist/index.html` | 273 KB, tek dosya, 0 ağ çağrısı |
| E2E paketi | 26 test, ~16 sn |
| Birim paketi | 133 test, ~1,5 sn |

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
3. **Baskı gerçek kâğıda alınmadı.** E2E taşma olmadığını ve PDF üretildiğini
   gösteriyor, ama fiziksel çıktıya bakılmadı.
4. `.roz` dosyası incelenmedi (aSc'den içe aktarma — düşük öncelik).

---

## Bilinen hatalar

Bilinen açık hata yok.

---

## Oturum sonu durumu (2026-08-24, üçüncü oturum)

**Hiçbir şey commit EDİLMEDİ.** Git ağacı iki katman kirli: (a) ikinci oturumun
İngilizceye çevirisi, (b) bu oturumun v0.6 çalışması. Yeni dosyalar: `src/bell.ts`,
`src/rules.ts`, `src/keys.ts` ve testleri, `src/entities.test.ts`.

**Bu yarım kalmış iş değil.** `npm run kontrol` yeşil: tsc temiz, 133 birim + 26 E2E
geçiyor, `dist/index.html` üretiliyor. Devam etmeden önce bir kez çalıştır; yeşilse
ağaç sağlamdır. Commit atmadan önce sor.

### Bu oturumda ne yapıldı

Kaynak: babanın aSc ekran görüntüleri (`docs/Örnek Fotolar/`, 25 kare) ve kullanıcının
verdiği okul düzeni taslağı.

| Eklenen | Nerede |
|---|---|
| Zil saatleri (hesaplanır) | `src/bell.ts` · Kurulum'da canlı önizleme · ızgara başlığı · yazdırma |
| Gün seçimi (checkbox, 7 gün) | `Setup.tsx` · varsayılan hafta Pazartesisiz 6 gün |
| Gün taşıma (`remapDays`) | `entities.ts` — **veri bozulmasını engelleyen kritik parça** |
| Sınıf ve derslik müsaitliği | `Availability.tsx` · `constraints.ts` kısıt 3 ve 7 |
| Dört kural kutusu | `src/rules.ts` · `Setup.tsx` Kurallar paneli · öğretmen/ders sütunları |
| Üçüncü sürükleme rengi (sarı) | `drag.ts` · `check()` → `{ blocked, warning }` |
| Kural ihlalleri listesi | `Check.tsx` · `findViolations()` |
| Şema v3 + göç | `types.ts` · `store.ts` |
| Okul adı | yazdırılan sayfa başlığında |

### Neden şema v3 gerekti

`settings.days` `string[]` → `Day[]` oldu (her günün öğle arası ayrı). Bu tek başına
babanın elindeki her yedeği okunamaz kılardı. `parseState` artık **v1 → v2 → v3**
zincirinden geçiriyor; `id`'ler ve gün indeksleri değişmediği için `unavailable` ve
`placements` anahtarları olduğu gibi taşınıyor — dizilmiş program birebir korunuyor.
İki yerde doğrulandı: `store.test.ts` (birim) **ve** gerçek Chromium'da "Yedek yükle"
düğmesinden v1 ve v2 dosyası seçilerek (E2E).

### En önemli hata: gün listesi değişince program kayması

Gün seçimi checkbox'a dönünce sessiz bir veri bozulma yolu açıldı: `placements` anahtarı
gün **indeksi** tuttuğu için Pazartesi kaldırılınca Salı 1'den 0'a kayacak, **bütün
program bir gün öne kayacaktı** — hiçbir uyarı vermeden. Aracın yapabileceği en kötü
hata bu: yanlış ama inandırıcı bir program.

`remapDays()` eşlemeyi **gün adından** kuruyor. Birim testi ortadan gün silmeyi, E2E
testi gerçek tarayıcıda başa gün eklemeyi doğruluyor (ders bir sağa taşınıyor,
Pazartesi'ye düşmüyor). PLAN.md tuzak 14.

### Ekran görüntüleri

`test-results/ekran/` (`.gitignore`'da) — zil önizleme tablosu (iki desen de 19:10'da
bitiyor), ızgara başlığındaki saatler ve kesikli öğle arası ayracı, sınıf müsaitliği
ızgarası, sürüklerken sarı uyarı hücresi + üst çubuktaki
`"MÇ art arda 1 saatten fazla girmemeli — burada 2 saat olur"`, Kontrol'deki kural
ihlali satırı. Betiği **depo kökünden** çalıştır, yoksa `node_modules` çözülmez.

---

## Başka bir bilgisayarda devam etmek için

Depo: `https://github.com/AlparslanSemiz/AscLike.git`

```bash
git clone https://github.com/AlparslanSemiz/AscLike.git
cd AscLike
npm install
npx playwright install chromium   # E2E testleri için, bir kez
npm run kontrol                   # tsc + 133 birim + derleme + 26 E2E
npm run dev                       # geliştirme sunucusu
```

`npm run kontrol` yeşilse ortam doğru kurulmuş demektir. Sonra
[TASKS.md](TASKS.md) içindeki **"ŞİMDİ SIRADA"** bölümünden devam edilir.
