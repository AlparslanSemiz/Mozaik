# CLAUDE.md — Ders Programı Aracı

Babamın dershanesinde haftalık ders programını dizmek için kullanacağı araç.
aSc Timetables'ın yerini alacak. aSc'nin yaptığı işin bu kursla ilgili %50'sini
yapıp o %50'yi'u aSc'den iyi yapmak hedefi.

Ayrıntılı çerçeve: [docs/PLAN.md](docs/PLAN.md) · Durum: [docs/STATUS.md](docs/STATUS.md) · Görevler: [docs/TASKS.md](docs/TASKS.md)

---

## Değişmez ilkeler

Her özellik kararında bu listeye dönülür. Listeyle çelişen özellik yazılmaz.

1. **Kurulum yok.** İndir, çift tıkla, çalışsın. Sihirbaz, hesap, şifre, güncelleme yok.
2. **Sunucu yok.** Backend, veritabanı, deploy, domain yok.
3. **İnternet gerekmez.** CDN'den tek bir dosya bile çekilmez. Font **ağdan
   çekilmez** — gömülü font serbest, bkz. aşağıdaki güncelleme.
4. **Türkçe.** Tek dil. i18n altyapısı yok, string dosyası yok — doğrudan Türkçe yazılır.
5. **Bir dönem kullanılmadan özellik eklenmez.** Tahmine dayalı özellik = yanlış özellik.
6. **Veri kaybı kabul edilemez.** Her şey her an dışa aktarılabilir.
7. **Hedef makine yavaş** — ama bu bir **varsayım**, gerekçe değil; bkz.
   aşağıdaki güncelleme.

## Yasak liste — bunlar bu projeye asla girmeyecek

Kullanıcı hesapları · bulut senkronizasyonu · mobil uygulama ·
istatistik/dashboard · yoklama · not girişi · öğrenci kaydı · SMS/e-posta ·
takvim entegrasyonu · PDF kütüphanesi (tarayıcının yazdırması yeterli) ·
**aynı planın** sürüm ağacı (v3, v4, v5 diye yan yana tutma) ·
sürükleyerek ders süresi uzatma · undo/redo geçmişi ağacı (düz yığın yeterli)

> **Listeden çıkarıldı (2026-08-24): karanlık mod ve tema seçimi.** Gerekçe zevk değil:
> tarayıcı (Brave, Chrome) açık temalı sayfayı zaten **zorla karartıyor** ve bunu kendi
> algoritmasıyla yapıyor. Sonuçta yeşil = bırakılabilir / sarı = uyarı / kırmızı = engel
> renkleri çamurlaşıyor — yani aracın en temel geri bildirim kanalı bozuluyor.
> Kontrolü almak, tarayıcıya bırakmaktan **daha az** karmaşa. **v0.7'de uygulandı**;
> tercih `localStorage['ders-programi-tema']`'da, `State`'e girmez.
>
> **Netleştirildi (2026-08-25): ilke 2 "sunucu yok" — statik yayın hariç.**
> v1.0'da araç ikinci bir yoldan da geliyor: GitHub Pages'te duran bir sayfa
> (`npm run build:site` → `dist-site/`). Orada **backend, veritabanı, hesap,
> oturum, API yok**; yayınlanan şey bir klasör dolusu statik dosya. İlke 3 de
> bozulmadı: CDN'den tek bayt çekilmiyor, web font yok, ve sayfa ilk açılıştan
> sonra service worker sayesinde **fiş çekiliyken** çalışıyor — ölçüldü.
> Çift tıklanan `dist/index.html` hâlâ asıl teslim yolu, site onun yanında duruyor.
>
> **Daraltıldı (2026-08-25): "birden çok program sürümünü yan yana tutma" → "aynı
> planın sürüm ağacı".** Gerekçe: yasaklanan şey *sürüm ağacı*ydı — "geçen salı
> neye benziyordu" sorusuna cevap veren, dallanan, kimsenin bakmadığı bir geçmiş.
> Babanın istediği o değil: **ayrı planlar**, aralarında geçilen ve teki seçilen.
> **v1.0'da uygulandı** (`library.ts`); plan kimliği `State`'e girmez, şema
> değişmez. Aynı planın sürüm ağacı hâlâ yasak.

---

## Değişmez ilkeler — güncelleme (2026-08-25)

7. "Hedef makine yavaş" → **ÖLÇÜLECEK.** Babanın makinesinde gerçek
   performans görülene kadar bu bir varsayımdır, gerekçe değildir.

### Kaldırılan yasaklar

- **ANİMASYON yasağı kalktı**, yerine kural: yalnız CSS `transition`,
  yalnız durum değişiminde (hover, focus, `aria-pressed`, dialog açılış,
  bırakma onayı). Süre **≤150 ms**. Kütüphane **YOK**.
  `prefers-reduced-motion: reduce` → hepsi kapalı.
  Layout animasyonu, skeleton, toast, sayfa geçişi **YOK**.
- **WEB FONT yasağı kalktı**, yerine kural: font **base64 ile tek dosyaya
  GÖMÜLÜR**. Ağdan çekilmez. "İnternet gerekmez" ilkesi aynen geçerli.

### Yürürlükte kalanlar

Tailwind / shadcn / Radix / ikon kütüphanesi / animasyon kütüphanesi:
**kaldırılmadı** — değerlendirildi ve getirisi negatif bulundu.
Yeni runtime bağımlılığı için varsayılan cevap hâlâ **hayır**.

---

## Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  ->  dist/index.html  (tek dosya, gömülü JS/CSS)
Vitest                  ->  saf mantık testleri
```

**Runtime bağımlılığı sadece React.** Tarih kütüphanesi yok, UI kütüphanesi yok,
state yönetimi kütüphanesi yok, sürükle-bırak kütüphanesi yok.

> Yeni bir `dependency` eklemek istiyorsan önce sor. Varsayılan cevap hayır.
> `devDependencies` (test/build araçları) serbest ama gereksizini ekleme.

CSS: tek bir `src/styles.css`, CSS değişkenleriyle. Tailwind yok.

### Komutlar

```bash
npm run dev        # geliştirme sunucusu
npm test           # Vitest — 409 birim testi
npm run build      # dist/index.html tek dosya üretir  (asıl teslim)
npm run build:site # dist-site/ — PWA: tek dosya + manifest + sw.js + simgeler
npm run test:e2e   # Playwright — derler, sonra 251 E2E testi (file://)
npm run test:site  # site testleri, http üzerinde — 6 test, çevrimdışı açılış dahil
npm run kontrol    # hepsi: tsc + birim + derleme + E2E + site
npm run ekran      # iki temada ekran görüntüsü -> test-results/ekran/
npm run gorsel     # görsel regresyon — 24 referansa karşı piksel farkı
npm run cozucu     # gerçek ölçekli çözücü stresi — 7 test, ~40 sn
```

Yeni bilgisayarda bir kez: `npm install && npx playwright install chromium`

### İki derleme hedefi — tek kaynak

```
vite.config.ts       -> dist/index.html   TEK dosya, file://, çift tıklanır
vite.site.config.ts  -> dist-site/        aynı tek dosya + manifest + sw.js + simge
site/                -> manifest.webmanifest · sw.js · icon.svg · icon-192/512.png
scripts/simge.mjs    -> SVG'den PNG üretir (Chromium ile, yeni bağımlılık yok)
```

Site **de** tek dosya (`viteSingleFile` korundu): service worker'ın önbelleğe
alacağı kabuk böylece bir sabit, her derlemeden sonra üretilip senkron tutulması
gereken bir hash listesi değil.

Manifest bağlantısı, simge ve SW kayıt betiği `index.html`'de **yoktur** —
yalnız site derlemesinde bir `transformIndexHtml` eklentisiyle eklenir
(`order: 'post'`, yoksa singlefile onları gömülecek varlık sanır). Ana config'de
`publicDir: false`: `site/` klasörünün hiçbir dosyası `dist/`'e düşemez.
Böylece "internet gerekmez" iddiası **grep ile** doğrulanabilir kalır, ve
`site.spec.ts` tam olarak bunu ölçer.

### Test katmanları — hangisi neyi yakalar

| Katman | Nerede | Neyi yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite, zil saatleri, kural limitleri, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı, branş listesi, kapalı saat çakışması, **plan kitaplığı, anahtarlar, paket zarfı ve dosya adları**, **otomatik dizme (yasallık, belirlenimcilik, tıkanma), `occupy`/`vacate` eşdeğerliği, 21 dünyalık çözücü matrisi ve denetçinin kendisi** |
| Duman | `src/App.test.tsx` (jsdom) | Bileşenler çiziliyor mu, sekmeler çöküyor mu |
| **E2E** | `e2e/*.spec.ts` (Playwright, 17 dosya, `file://`) | **Düzen, sürükleme, taşıma, sağ tık, kaydırma, yazdırma (başlık, dikey ortalama, sayfa sayısı), renk kontrastı ve AYRIMI, tablo ekseni, simge şekli, ayraç genişliği, yazı boyu, **sütun genişliği ve metnin sığması (iki ölçekte)**, **ızgara yoğunluğu (Sığdır'da yatay kaydırma 0)**, kenar çubuğu, sağ sütunların doluluğu, geri-al zinciri, hata yolları, klavye, plan geçişi, taslaklar, paket gidiş-dönüşü ve "veriler nerede" tablosu** |
| **Site** | `e2e/site.spec.ts` (`npm run test:site`) | **http üzerinde**: manifest ve simgeler, service worker kaydı, **fiş çekilince açılma**, çevrimdışı girilen verinin durması, ve site derlemesinin `file://` derlemesine sızmadığı |
| Görüntü | `e2e/ekran.spec.ts` (`npm run ekran`) | Test değil, **kanıt**: iki temada on bir ekran görüntüsü |
| **Görsel regresyon** | `e2e/gorsel.spec.ts` (`npm run gorsel`) | Yerel referansa karşı piksel farkı, 24 referans. **`npm run kontrol`'ün parçası DEĞİL** — sistem fontu makineye göre çözüldüğü için referans tek makine için doğru. Referanslar depoda; yeni makinede bir kez `--update-snapshots` |

E2E, `dist/index.html`'i `file://` üzerinden 1920×1080'de açar — yani **babanın çift
tıklayacağı dosyanın ta kendisini**. jsdom'un düzeni yok; sürükle-bırak, sabit sütun,
ekran dışı hedef ve yazdırma taşması **yalnızca burada** görünür. Nitekim tuzak 11 ve
12 (bkz. PLAN.md) bu testlerle bulundu, başka türlü bulunamazdı.

`fullyParallel: true, workers: 4`. Doğrulanmış varsayım: `file://` altında her
Playwright context'inin kendi `localStorage`'ı var — 200 test paralel koşarken
birbirinin verisini görmüyor (ölçülen: 66 sn → 51 sn).

**Sahte veri tek yerde: `src/worlds.ts`.** `makeWorld()` küçük bir okul kurar,
`illegalBlocks()` dizilmiş bir programı denetler, `WORLDS` 21 senaryoyu tutar.
`e2e/` altında değil çünkü `tsconfig.json` yalnız `src`'yi kapsıyor — orada duran
bir dünya `tsc --noEmit`'ten hiç geçmezdi. Uygulama onu import etmediği için Vite
budar, `dist/index.html`'e girmez. Hem `solver.test.ts` hem `kontrol.spec.ts` hem
`otomatik-dunyalar.spec.ts` aynı üreteci kullanır.

**Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini gerçek
`getComputedStyle` ile okuyup WCAG kontrast oranını ve **CIE Lab ΔE** farkını hesaplar.
ΔE gerekiyor çünkü WCAG parlaklık oranı iki koyu rengi farklı tonda olsalar bile eşit
sayar — koyu yeşil ile koyu zeytin tam olarak bu durumdadır.

> **Arayüzde görünen bir şeyi değiştirdiysen `npm run test:e2e` çalıştırmadan
> "bitti" deme.** Sürükleme, kaydırma, düzen ve yazdırma zaten yalnızca burada
> yakalanıyor; ama renk, hizalama, tablo ekseni ve düğme adı da öyle — jsdom bunların
> hiçbirini görmez. Görsel bir değişiklikten sonra ekran görüntüsü de al
> (`test-results/ekran/`): **çıktıyı göster, iddia etme.**

---

## Kod dili ve biçim

**Kural: arayüz Türkçe, kod İngilizce.** İkisi karışmaz.

- **Tanımlayıcılar, tipler, dosya adları İngilizce**: `teacher`, `classGroup`,
  `unavailable`, `placements`, `constraints.ts`, `blocker()`, `components/Availability.tsx`.
- **Kullanıcıya görünen her metin Türkçe** ve doğru Türkçe karakterlerle:
  `"MÇ Salı 3. saatte 433 sınıfında"`. Bu metinler `i18n` altyapısından geçmez,
  doğrudan JSX/string içinde durur (tek dil, ilke 4).
- **Yorumlar İngilizce**, kısa, sadece *neden*i açıklar. *Ne* yaptığını kod söyler.
- Depolanan JSON alan adları da İngilizce — ama **değiştirmek yedek dosyalarını
  bozar**, o yüzden şema değişirse `schemaVersion` artırılır ve göç kodu yazılır.

> **İstisna — bunlar Türkçe kalır, kullanıcı verisidir:** `localStorage` anahtarı
> (`ders-programi`, `ders-programi-yedek-N`) ve indirilen yedeğin dosya adı
> (`ders-programi-YYYY-AA-GG-SSDD.json`). Bunları "İngilizceye çevirmek" babanın
> kayıtlı programını görünmez kılar — kimliği değişen anahtar, silinmiş veri demektir.

---

## Mimari — üç katman, sınırları geçilmez

```
types.ts                        tipler, başka hiçbir şey
keys.ts                         sözlük anahtarları (constraints ↔ rules döngüsü olmasın)
palette.ts                      36 renk + firstFreeColor. HİÇBİR ŞEY import etmez.
library.ts                      plan kitaplığı: anahtarlar + plan üstverisi +
                                dosya adları + "veriler nerede" raporu.
                                State'i BİLMEZ, ham string alıp verir.
bundle.ts                       "bütün planlar tek dosyada" zarfı. library.ts'i
                                çağırır, State'i yine BİLMEZ.
  |
constraints.ts / feasibility.ts SAF fonksiyonlar. React, DOM, localStorage BİLMEZ.
rules.ts / bell.ts              Testleri zorunlu.
import.ts / entities.ts
solver.ts                       otomatik dizme. Kendi kısıt mantığı YOK — blocker()'ı çağırır.
worlds.ts                       SADECE TEST: dünya üreteci + illegalBlocks denetçisi.
                                Uygulama import etmez, Vite budar. Vitest ve
                                Playwright ikisi de buradan beslenir.
  |
store.ts                        reducer + geri al yığını + localStorage + göç + plan geçişi
theme.ts                        makine tercihleri (tema, kenar çubuğu, ölçek) — State'e girmez
useSolver.ts                    solver.ts'i rAF ile dilim dilim sürer. App'te yaşar.
  |
components/props.ts             PanelProps — Kurulum adımı ve Ayarlar bölümü aynı ikiliyi alır
components/Field.tsx            iki klasörün de kullandığı küçük parçalar
components/LimitBox.tsx
components/*.tsx                sadece görüntüleme ve olay yakalama
components/setup/*.tsx          Kurulum: index (kabuk) + 4 liste adımı + Paste + Summary
components/settings/*.tsx       Ayarlar: index (kabuk) + Okul · Kurallar · Branşlar ·
                                Görünüm · Veri.  Veri, Plans.tsx'i (plan
                                kitaplığı) kendi içine alır; Görünüm okulu
                                değil MAKİNEYİ tarif eder (theme.ts)
```

`rules.ts`, `constraints.ts`'ten **yalnızca `Index` tipini** alır (`import type`,
derlemede silinir) — çalışma zamanında döngü yok. Anahtar üreten fonksiyonlar
`keys.ts`'te; `constraints.ts` onları yeniden dışa aktarır, çağrı yerleri değişmez.

`entities.ts` `import.ts`'ten **yalnızca satır tiplerini** alır (`import type`) —
aynı desen, çalışma zamanında döngü yok. `import.ts` ise `makeShort`'u `entities.ts`'ten
alır ve yeniden dışa aktarır: kısaltmanın tek evi var.

`library.ts` `store.ts`'i **çağırmaz** ve `State`'in ne olduğunu bilmez: ham
**string** alıp verir, ayrıştırmayı `store.ts` yapar. `types.ts`'ten yalnız `Id`
tipini alır (`import type`) — yani `store.ts` ↔ `library.ts` çalışma zamanı
döngüsü yok, `keys.ts`'in constraints ↔ rules için yaptığının aynısı.

`bundle.ts` de aynı sözleşmeyle yaşar: paketin zarfını okur, içindeki her planın
durumunu **ham `unknown`** olarak geri verir, `parseState`'i `store.ts` çağırır.
Bozuk girdi kurallarını (kimliksiz girdi atılır, adsız girdi yeniden adlandırılır)
kendisi yazmaz — `normalizeLibrary()`'ye devreder, yani o kurallar tek evde durur.

`solver.ts` kısıt mantığının **hiçbirini** yeniden yazmaz: her yasallık sorusu
`blocker()`'a gider, yani sürüklemeyi yargılayan fonksiyonun ta kendisine.
Kendine ait iki şeyi var, ikisi de aramanın kendisiyle ilgili: her dersin
**tavanı** (haftanın o derse verebileceği en fazla saat) arama başlamadan
hesaplanır, ve ızgara 20 000 düğüm boyunca iyileşmezse bir dersten vazgeçilip
o ana kadarki en iyi ızgaradan devam edilir (tuzak 26). Bir kural
sürüklerken başka, otomatik dizerken başka anlama gelemez. Aramanın karşılayamadığı
tek şey `place()`'in her çağrıda sözlüğü kopyalaması; onun için `constraints.ts`'te
`occupy`/`vacate` var — `place()` + `buildIndex()` ikilisinin yerinde çalışan hâli.
İkisinin sapmaması `constraints.test.ts`'te yedi testle sabitlenir.

**Kural:** iş mantığı bileşenlerin içine yazılmaz. Bir `.tsx` dosyasında çakışma
hesabı görüyorsan yanlış yerdedir — `constraints.ts`'e taşı.

**Kural:** `constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts` içindeki her dışa aktarılan fonksiyonun testi olacak. Bu dosyalara test yazmadan
özellik eklenmez. `store.ts` içindeki `parseState` ve `entities.ts` içindeki
`remapDays` de test edilir: ilkinden her yedek dosyası geçer, ikincisi gün listesi
değişince programın kaymasını engelleyen tek şeydir.

---

## Veri modeli — özet

Tam hâli [src/types.ts](src/types.ts). Değiştirmek pahalı; değiştirmeden önce düşün.

```ts
State {
  schemaVersion: 5
  settings: {
    schoolName: string
    days:   Day[]      // varsayılan 6 gün: Salı..Pazar (Pazartesi ders yok)
    hours:  string[]   // ders ETİKETLERİ; uzunluk = günlük ders sayısı (12)
    bell:   Bell       // saatler hesaplanır, tek tek saklanmaz
    limits: Limits     // okul geneli varsayılan sınırlar
    rules:  Rules      // her sınır için Kapalı / Uyar / Engelle
    subjects: string[] // okulun branş listesi — TAMAMI saklanır
    subjectShorts: Record<string, string>   // YALNIZCA değiştirilenler
  }
  rooms, teachers, classes, lessons
  unavailable: Record<`${entityId}|${day}|${hour}`, 1>   // öğretmen + sınıf + derslik
  placements:  Record<`${classId}|${day}|${hour}`, lessonId>
}
Day        { name, longBreakAfter }         // 5 = öğle arası 5. dersten sonra, 0 = yok
Bell       { start, lessonMinutes, breakMinutes, longBreakMinutes }  // 09:00 · 40 · 10 · 30
Limits     { maxConsecutive, maxPerDay, minPerDay, maxSameLessonPerDay }  // 0 = sınır yok
Teacher    { name, short, subject, color, limits }  // her öğretmenin TEK branşı var
                                            // limits alanları null = okul varsayılanı
                                            // color = PALETTE indeksi, kimseyle çakışmaz
ClassGroup { name, roomId, color }          // derslik sınıfın sabit alanı, seçilmez
Lesson     { classId, teacherId, weeklyHours, blockSize, maxPerDay }
```

### Depolama anahtarları

```
ders-programi            -> "1" numaralı planın State'i   (TARİHSEL anahtar)
ders-programi-plan-<id>  -> diğer planların State'i
ders-programi-planlar    -> { activeId, plans: [{ id, name, draft }] }
ders-programi-yedek-N    -> oturum yedek zinciri (son 3), açılıştaki plana ait
ders-programi-tema       -> tema tercihi
ders-programi-kenar      -> kenar çubuğu tercihi
ders-programi-olcek      -> yazı büyüklüğü tercihi (--ui-scale, 1.0–1.25)
ders-programi-yogunluk   -> ızgara yoğunluğu tercihi (rahat / sigdir)
```

### Dosya biçimleri — iki tane, karıştırılamaz

```
{ "schemaVersion": 5, ... }    -> TEK plan.  ders-programi-YYYY-AA-GG-SSDD.json
{ "bundleVersion": 1, ... }    -> HER plan.  ders-programi-tumu-YYYY-AA-GG-SSDD.json
```

Üst çubuk tek planı yazar ve okur; **paket** Ayarlar → Veri'de kalır, çünkü bir
paketi açmak bu bilgisayardaki bütün planların yerine geçmek demektir. Paket
`bundleVersion` taşır, `schemaVersion` değil: zarf ayrı sürümlenir, içindeki her
plan hâlâ kendi `schemaVersion`'ıyla gelir ve aynı `parseState` göçünden geçer.
`src/bundle.ts` zarfı bilir, `State`'in ne olduğunu **bilmez** — `library.ts`'in
deseni birebir. Paket **depolama anahtarı değildir**: yeni anahtar açılmadı.

Bir plan = bir program: kendi okulu, kendi öğretmenleri, kendi ızgarası.
**Taslak ayrı bir varlık değil**, `PlanInfo.draft` bayrağı — yerleşimi
boşaltılmış bir plan. Plan kimliği `State`'e **girmez**, `schemaVersion`
değişmez: yedek dosyası hâlâ tek bir plandır.

Tema tercihi `State`'e **girmez**: `localStorage['ders-programi-tema']`'da durur.
Makine tercihi, program verisi değil — koyu makinede alınmış bir yedek babanın
makinesinde temayı çevirmemeli, ve kozmetik bir ayar için şema göçü yazılmamalı.

Varsayılan zil düzeni: 09:00 başlar, 40 dk ders + 10 dk teneffüs, hafta içi 5. dersten
sonra / hafta sonu 6. dersten sonra 30 dk öğle arası — **iki desende de 12. ders 19:10'da
biter**. Bu `bell.test.ts`'te açıkça iddia edilir.

### Neden böyle

- **Branş öğretmenin alanı, dersin değil.** Her öğretmenin tek branşı var.
- **Derslik sınıfın sabit alanı.** Yerleştirirken oda seçilmez, ama iki sınıf aynı
  dersliği paylaşıyorsa çakışma kontrol edilir (~20 sınıf, 8 derslik).
- **`placements` düz sözlük, dizi değil.** Gün/saat sayısı değişince taşan anahtarlar silinir.
- **Blok ayrı varlık değil.** Ardışık anahtarlara aynı `lessonId` yazılır. Kaldırırken
  bloğun başı geriye yürüyerek bulunur.
- **Anahtarlarda asla isim kullanılmaz, hep `id`.** "Şükrü" adı değişince yerleşim bozulmasın.
- **Zil saatleri hesaplanır, saklanmaz.** Başlangıç + üç süre; her günün tek farkı öğle
  arasının nereye düştüğü. Period başına satır tutmak aynı bilgiyi 12 kez saklamak olurdu.
- **Kapalı saatler tek sözlükte.** `id`'ler üç liste arasında benzersiz olduğu için
  öğretmen, sınıf ve derslik aynı `unavailable` haritasını paylaşır — ikinci bir sözlük,
  ikinci bir göç ve ikinci bir `sanitize` dalı gerekmiyor.
- **Sınırlar iki katmanlı.** `settings.limits` okul geneli; `Teacher.limits` /
  `Lesson.maxPerDay` içinde `null` "varsayılanı kullan" demektir. 25 hocaya aynı sayıyı
  25 kez girdirmemek için.
- **Branş kısaltmasında yalnızca DEĞİŞTİRİLEN saklanır.** `Matematik → Mat` gömülü
  tablodan gelir; `subjectShorts`'a ancak varsayılandan farklı bir şey yazılınca kayıt
  düşer, varsayılana geri yazılırsa silinir. Böylece yedek 21 varsayılanla şişmez ve
  gömülü tablo ileride iyileşirse eski proje kendiliğinden faydalanır.
- **Renk kimliktir, süs değil.** Her öğretmenin ve her sınıfın kendine ait bir rengi
  var; `addTeacher`/`addClass` **kullanılmayan** en küçük indeksi verir (`firstFreeColor`),
  sıradakini değil. Palet 36 renk ve `src/palette.ts` içinde düz hex — iki temada ve
  kâğıtta aynı olan tek renk kümesi olduğu için CSS değişkeni hiçbir şey kazandırmıyordu.
  Renkler elle seçilmedi, **arandı**: kontrast ve CIE Lab ayrımı kısıtları altında en
  uzak nokta yöntemiyle. `palette.test.ts` bunu her koşuda yeniden ölçer.
- **Branş listesi TAM saklanır, kısaltmalar sapmalı.** `subjects` kullanıcının
  düzenlediği bir liste — gömülü tablodan türetilen bir liste "Fransızca'yı kaldır"ı
  ifade edemez. `subjectShorts` ise yalnız değiştirileni tutar. `Teacher.subject` hâlâ
  bir **string**, id değil: branş silmek cascade gerektirmesin ve yedek okunur kalsın.
- **`schemaVersion` ilk günden var.** v1 = Türkçe alan adları, v2 = İngilizce,
  v3 = `Day` nesneleri + zil saatleri + kurallar, v4 = `subjectShorts`,
  v5 = `ClassGroup.color` + `settings.subjects`.
  `parseState` v1'i v2'ye, v2'yi v3'e taşır; v3, v4 ve v5 tek okuyucudan geçer (aradaki
  tek fark eklenen alanlar); `id`'ler ve gün indeksleri değişmediği için `unavailable` ve `placements`
  anahtarları olduğu gibi geçer. **Şema her değiştiğinde: sürümü artır, göç kodunu yaz,
  hem birim hem E2E testini ekle.** Eski yedek açılmıyorsa veri kayıptır.

---

## Kısıtlar

`blocker()` sırayla bakar, ilk engelde döner. Mesaj **her zaman somut**:
"Çakışma var" değil, `"MÇ o saatte 433 sınıfında"`. Programı dizen kişinin bir
sonraki hamlesini belirleyen şey bu cümle.

**Sert — her zaman engeller:**

1. Blok gün sonuna sığıyor mu
2. Sınıfın o saatleri boş mu
3. Sınıf o saatte kapalı mı
4. Öğretmen o saatte müsait mi
5. Öğretmen o saatte başka sınıfta mı
6. Dersliği paylaşan başka sınıf o saatte ders yapıyor mu
7. Derslik o saatte kapalı mı

**Ayarlanabilir — `settings.rules` "Engelle" ise engeller, "Uyar" ise sadece sarı boyar:**

8. Öğretmen art arda en fazla N saat
9. Öğretmen günde en fazla N saat
10. Bir sınıf aynı dersten günde en fazla N saat

`minPerDay` (geldiği gün en az N saat) yerleştirmede kontrol **edilemez** — günün ilk
dersini koyarken her zaman ihlal olur. Yalnızca `findViolations()` üzerinden Kontrol
sekmesinde çıkar.

`blocker()` sert kısıtları + "Engelle" seviyesindeki kuralları döndürür; `check()` onun
üstüne "Uyar" seviyesindekileri `warning` olarak ekler. İkisi de **aynı**
`limitBreaches()` fonksiyonunu kullanır, mesajlar ayrışamaz.

`blocker()` aslında `blockerDetail()` üstünde ince bir sarmalayıcı: asıl fonksiyon
mesajın yanında bir **kod** da döndürür (`teacherClosed`, `classBusy`, `roomBusy`…).
Sebepleri sayan her yer (Kontrol'ün "yerleşemeyen dersler"i, çözücünün tıkanma
cümlesi) koda göre gruplar — mesaj gün ve saat adı taşıdığı için cümle saymak yanlış
cevabı veriyordu (tuzak 22).

Boşluk (pencere) kuralları hâlâ **yok**. İstenirse sonra gelir.

---

## Bilinen tuzaklar — hepsi bu tür araçlarda kesin çıkar

1. **Sürüklerken re-render sürüklemeyi bozar.** Bu yüzden HTML5 drag-and-drop değil
   **Pointer Events** kullanılıyor. `pointermove` sırasında React state güncellenmez;
   hayalet kart `transform` ile doğrudan DOM'dan taşınır.
2. **Geçerli hücreler sürükleme başında bir kez hesaplanır**, her `pointermove`'da değil.
3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput` değil
   `defaultValue` + `onBlur`.
4. **Silme cascade olmalı.** Öğretmen silinince dersleri, ders silinince yerleşimleri,
   sınıf silinince ikisi de. Yetim `lessonId` kalırsa ızgara çöker.
5. **Gün/saat sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez hayalet
   dersler kalır, sayaçlar tutmaz.
6. **`sanitize()` her yüklemede ve her ayar değişikliğinde çağrılır.** 4 ve 5'in çaresi bu.
7. **localStorage silinebilir.** Karşı önlem: her değişiklikte otomatik kayıt + son 3
   durum ayrı anahtarda + görünür "Yedek indir". Babama tek alışkanlık öğretilecek:
   *değişiklik yaptın, yedek indir.*
8. **Yazdırma her zaman hafife alınır.** Sayfa başına bir sınıf/öğretmen
   (**satır = gün, sütun = ders, A4 YATAY**, `table-layout: fixed`). 72 sütunlu ana
   tablo basılmaz. Sonda değil ortada test edilir — ve "taşmıyor" yetmez: sütunların
   eşit olduğu ve sayfanın gerçekten yatay çıktığı ölçülür (`page.pdf` → MediaBox).
9. **Blok render'ında `rowspan` kullanılmaz.** rowspan + dinamik tablo = bug fabrikası.
   İkinci hücreye sade devam işareti konur.
10. **2100 hücre var.** Satırlar `React.memo` ile sarılı; bir yerleştirme 1-2 satır çizer.
11. **Gün listesi değişince anahtarlar kayar.** `placements` anahtarı gün **indeksi**
    tutuyor. Pazartesi listeden çıkarılırsa Salı 1'den 0'a kayar ve bütün program bir gün
    öne kayar — sessizce. Çare: `remapDays()` eşlemeyi **isimden** kurar, çıkarılan günün
    anahtarlarını siler, kalanları yeniden yazar. Her `updateSettings` bundan geçer.
12. **`Cuma` ve `Cumartesi` ikisi de `slice(0,3)` ile "Cum" olur.** Gün kısaltmaları
    `shortDay()` tablosundan gelir (`Cmt`, `Pzr`), ilk üç harften değil.
13. **Izgaraya eklenen her hücre sürükleme hedefi sanılır.** `drag.ts` hedefi
    `closest('[data-day]')` ile buluyor. Öğle arası ayraç sütunu `data-day`/`data-hour`
    **taşımaz**; taşısaydı ders öğle arasına bırakılırdı. Yeni bir sütun/hücre eklerken
    ilk soru bu.
14. **Tarayıcı açık temalı sayfayı kendi karartır.** Çare `color-scheme`'i iki temada da
    doğru kurmak. Renk *değerlerini* düzeltmek yetmez; `color-scheme` yoksa tarayıcı
    üstüne kendi algoritmasını uygular ve işlevsel renkler çamurlaşır.
15. **Palet üstündeki metin tema ile dönmemeli.** Öğretmen renkleri pastel ve iki temada
    da aynı; `color: inherit` bırakılırsa koyu temada açık metin pastel zemine düşer ve
    hücre okunmaz olur (`--on-color`).
16. **Kapalı saat işareti yalnız BOŞ hücreye çiziliyordu.** Müsaitlik program dizildikten
    *sonra* düzenleniyor; dolu bir saati kapatınca ders yerinde kalıyor ama tarama kartın
    altında kaldığı için **hiçbir yerde görünmüyordu**. `blocker()` de yakalayamaz —
    yalnız olası bir bırakma için çalışır. Çare `closedConflicts()`: ders **silinmez**
    (ilke 6), kırmızı işaretlenir ve Kontrol'de sayılır.
17. **Izgara hücresinin genişliğini `table.grid tbody td` belirler.** `.break-col` gibi
    tek sınıflı bir kural (0,1,0) ondan (0,1,3) zayıf kalır: öğle arası ayracı aylarca
    "dar" tanımlıyken bir ders kadar geniş çizildi. Yeni bir hücre genişliği
    veriyorsan ya seçiciyi güçlendir ya `!important` kullan — ve **ölç**.
18. **Bileşen sekme değişince sökülür.** `useState` içindeki her şey gider. Baskı sayfa
    seçimi bu yüzden `App`'te duruyor: Kurulum'a gidip dönmek listeyi siliyordu. Aynı
    şekilde seçimi "seçilenler" olarak tutmak yanlıştır — **dışarıda bırakılanlar**
    tutulur, yoksa sonradan eklenen sınıf sessizce basılmaz. **Otomatik dizme koşusu da
    aynı sebeple `App`'te** (`useSolver`): Kontrol'e bir göz atmak aramayı öldürürdü.
19. **Web Worker bu projede çalışmaz.** İki bağımsız sebep: Vite worker'ı **ayrı bir
    chunk** olarak üretir ve `vite-plugin-singlefile` onu gömmez — "tek dosya" iddiası
    düşer; kalan yol olan `blob:` worker'ı ise `file://`'in opaque origin'inden çalışır
    ve Chromium'da güvenilmez, üstelik kaynak string olacağı için `tsc` onu hiç görmez.
    Çözücü bu yüzden ana iş parçacığında, `requestAnimationFrame` ile **dilim dilim**
    çalışır. `setTimeout(0)` değil: iç içe beş çağrıdan sonra 4 ms'e kelepçelenir ve
    boyama garantisi vermez, yani ilerleme satırı görünmez.
20. **React reducer geri çağırımını GEÇ çalıştırır.** `change((d) => ...)` içine bir
    `ref` okuması koyup fonksiyondan sonra o `ref`'i temizlersen, geri çağırım
    çalıştığında `null` bulur ve **bütün iş sessizce atılır**. Otomatik dizmenin sonucu
    tam olarak böyle kayboldu. Referansı önce yerel bir değişkene al.
21. **Arama uzayını daraltan kısıtlama, değer sezgisini bozuyorsa kaybettirir.**
    Çözücüde "aynı dersin blokları artan hücre indisinde" simetri kırması vardı;
    "haftaya yay" sezgisi geç bir hücre seçince dersin kalan blokları oradan sonrasına
    hapsoluyordu. Ölçülen fark: **57718 düğümde 26 blok** ile **359 düğümde 359 blok**.
    Kaldırıldı. Teoride doğru olan, ölçülmeden konmaz.
22. **Sebep cümleleri gün ve saat adı taşır, o yüzden CÜMLE sayılmaz.** "En sık sebep"
    hesabı altmış farklı "sınıfın X saatinde Y var" satırını altmış ayrı sebep sayıyor,
    altı kez tekrarlanan daha önemsiz bir cümle kazanıyordu — hafta boyu kapalı bir
    öğretmen için "2 saatlik blok güne sığmıyor" yazdı. `blockerDetail()` bir **kod**
    döndürür (`teacherClosed`, `classBusy`, …); sayım koda göre yapılır.

23. **Testi yargılayan denetçinin kendisi test edilmeli.** `illegalBlocks()` her
    zaman `[]` döndürseydi çözücünün 19 dünyalık matrisi de, 24 E2E testi de
    bedavaya yeşil geçerdi — ve hiçbiri bunu haber vermezdi. `worlds.test.ts`
    ona bilerek bozuk ızgaralar verir (aynı öğretmen iki sınıfta, kapalı saatte
    duran ders, gün sonunu taşan blok) ve yakaladığını doğrular. Aynı sebeple her
    dünya testinde bir koruma var: kaydedilen yerleşim sayısı girişteki sayıdan
    büyük olmalı, yoksa iddialar dizimden ÖNCEKİ ızgarayı yargılıyor olabilir.

24. **`localStorage` kaydı 400 ms gecikmeli; "sonrasını oku" öncesini okur.**
    E2E'de bir eylemin sonucunu depodan doğrulamak için "eylemden önceki değeri al,
    sonra değişmesini bekle" yetmez: sayfanın *yüklenmesi* de kendi kaydını 400 ms
    sonra yazar, ve "önceki değer" o yazımdan önce alınmışsa beklenen değişiklik
    yüklemenin kendisi olur. Çare `settledText()`: tıklamadan önce sayfanın gerçekten
    bir şey yazmış olmasını beklemek. "Değer sabitlenene kadar bekle" de işe yaramaz —
    eski değer de sabittir.

25. **`--update-snapshots` tek başına yalnız KIRMIZI referansları yeniler.** Eşiğin
    (`maxDiffPixelRatio`) yuttuğu gerçek bir düzen değişikliği referansı sessizce
    eski bırakır. Hepsini yazdırmak için `--update-snapshots=all`. Müsaitlik satırı
    34 → 48 px olduğunda tam bunun oldu: tablo 84 px büyüdü, `npm run gorsel` yeşil
    geçti, referanslar yalan söylemeye başladı.

26. **MRV en küçük domaini seçer — tamamlanamayan ders domaini en küçük olandır.**
    Haftada 8 saat isteyen ama kurallar yüzünden en fazla 4 saat tutabilen bir
    ders, izin verilen her günü doldurduktan sonra "yer yok" der; arama geri
    sarar, aynı dersi yeniden seçer, aynı duvara çarpar. Üstelik bu, üstündeki
    her dersin her hücresi için tekrarlanır. Ölçülen: 15 saniye boyunca 2-3
    blok. Çare iki katmanlı: her dersin **tavanı** arama başlamadan hesaplanır
    (`ceilingBlocks`, `need` ona kırpılır) ve ızgara belli bir düğüm sayısı
    boyunca iyileşmezse bir dersten vazgeçilir. **Vazgeçerken sıfırdan
    başlanmaz** — o ana kadarki en iyi ızgara tabana dondurulur, yoksa her
    vazgeçiş bütün emeği geri sarar.

27. **Yerleşemeyen dersin sebebi, dersin KENDİ blokları yüzünden yanlış çıkabilir.**
    Kısmen sığan bir ders izin verilen günleri kendi bloklarıyla doldurur;
    `blocker()` o noktadan sonra "sınıf o saatte dolu" der ve okuyan kişi
    kenara çekecek bir ders aramaya başlar. Çekilecek bir şey yoktur. Tavanı
    kırpılmış her ders için sebep cümlesi tavanın kendisidir. **Hiç** sığmayan
    derste ise `blocker()`'ın cümlesi zaten somuttur ("AV Salı 1 saatinde
    müsait değil"), o korunur.

28. **Plan değiştirmeden önce bekleyen kayıt EŞZAMANLI boşaltılmalı.** Otomatik
    kayıt 400 ms gecikmeli ve efektin temizliği kutu değişince bekleyen yazımı
    **iptal eder**. Yani plan geçişinde geçişten hemen önceki düzenleme hiçbir
    yere yazılmadan buharlaşır — ekranda hata yok, çubukta uyarı yok, bir
    sonraki açılışta iş eksik. `switchPlan`/`createPlan`/`deletePlan` üçü de
    önce `park()` çağırır: timer'ı iptal eder ve giden planı **hemen** yazar.

29. **İlk plan tarihsel anahtarını korur.** `planKey('1') === 'ders-programi'`.
    Böylece kitaplığa geçiş **tek bayt kopyalamaz** (yarım kalmış kopya = iki
    gerçek), eski bir `dist/index.html` hâlâ programı bulur, ve `ders-programi`
    okuyan yedek zinciri ile E2E yardımcıları değişmeden çalışır. `newId()`'nin
    alfabesinde `1` yok — üretilen kimlik o anahtarla çakışamaz; alfabe
    değişirse yeni bir plan 1. planın üstüne yazar. `library.test.ts` bunu 500
    kimlikle sabitler.

30. **İki dosya türü aynı düğmeye düşerse biri diğerini siler.** Üst çubuktaki
    "Dosyadan aç" bir **planı** açar; Ayarlar → Veri'deki "Tümünü dosyadan aç"
    **bütün kitaplığın** yerine geçer. Aynı uzantı, aynı ön ek, gözle ayırt
    edilemez — ve yanlışını seçmek geri alınamaz. Üç karşı önlem: paket adında
    `-tumu-` var, `parseState` bir paketi okuyamaz (`schemaVersion` yok) ve
    `parseBundle` bir planı okuyamaz (`bundleVersion` yok), üst çubuk paket
    görünce **reddedip yolu gösterir**. Yeni bir dosya biçimi eklenirse bu üç
    şeyin üçü de gerekir.

31. **Tarayıcının üst/alt bilgisi CSS ile gizlenemez — ama çizecek yer bulamazsa
    çizilmez.** Sol üstteki tarih ve sol alttaki dosya yolu sayfanın içeriği
    değil, **kenar boşluğu kutusunun** içeriğidir; `display: none` diye bir
    çaresi yoktur. Tek yol `@page { margin: 0 }` ve boşluğu `.print-page`'e
    padding olarak geri koymak. İki yan sonuç: (a) sayfa kutusu artık **sabit
    yükseklikli** olmalı ki içerik dikey ortalanabilsin, (b) o yükseklik tam
    210 mm olursa kesirli piksel + `break-after: page` her programın ardına
    **boş bir sayfa** koyar — 205 mm yazılır. Ortalarken `justify-content:
    center` değil **`safe center`**: taşma olursa düz `center` içeriği iki
    uçtan taşırır ve sayfanın üstü kesilir. Bunların hiçbiri Playwright'ın
    `page.pdf`'inde varsayılan olarak görünmez; kanıt için
    `displayHeaderFooter: true` ile PDF üretilip **gözle okunur**.

32. **İki derleme hedefi varsa biri diğerine sızar.** `dist/index.html`'in tek
    iddiası tek dosya ve ağsız olması; site hedefinin manifest'i, service
    worker'ı ve simgeleri o iddiayı sessizce bozabilir. Üç önlem birden:
    site'e özel etiketler `index.html`'de **durmaz** (yalnız site config'inin
    `transformIndexHtml`'i ekler), ana config'de `publicDir: false`, ve
    `site.spec.ts` `dist/index.html`'de `serviceWorker`/`manifest`/`sw.js`
    geçmediğini **okuyarak** doğrular. Yeni bir hedef eklenirse üçü de gerekir.

33. **Yazı boyunu büyütmek, sabit piksel genişliğindeki sütunu sessizce kırpar
    ve bunu hiçbir test görmez.** Y0'da gövde 14px'ten 16px'e çıktı; renk
    sütunu JSX'te `style={{ width: 44 }}` sabitti ve 44px iki basamaklı sayıyı
    artık alamadı — 11. öğretmenden sonra kutuda **"1" yazmaya başladı**. Süit
    228/228 yeşil geçti, çünkü testler bir `<select>`'in *var olduğunu* ve
    *değerini* ölçüyor, **metninin sığdığını** değil. Bu tuzak 23'ün tipografi
    hâli: yeşil geçen bir süit "bozulmadı" demek değildir. İki sonucu var,
    ikisi de **uygulandı**: ölçek değiştiren her adımda ekran görüntüsüne
    bakılıyor, ve genişlik `ch` cinsinden CSS'e taşınınca yanına
    `e2e/renk-secici.spec.ts` yazıldı. O test bir sayı uydurmaz: seçiciyi
    `width: auto` ile klonlayıp **tarayıcının kendi istediği genişliği** ölçer
    ve kutunun ondan dar olmadığını iddia eder. Yazıldıktan sonra eski 44px
    geri konarak koşuldu ve dördü de kırmızıya döndü — bedava yeşil değil.

34. **`<th>`'ye verilen genişlik SÜTUNUN genişliğidir, kontrolün değil.** Tuzak
    33'ü kapatırken ilk deneme genişliği `<th>`'ye `ch` cinsinden koydu; sonuç
    kutuyu 44px'ten **29px'e daralttı**, yani hatayı büyüttü. Sebep iki katlı:
    `<th>` genişliği hücre dolgusunu da içerir, ve `table.list th` 12px'ken
    `<td>` içindeki `<select>` 16px — aynı `ch` iki yerde iki farklı piksel.
    Kural: genişlik **kontrolün kendisine** verilir, sütun ondan boylanır.
    Seçici de aynı öğede olmalı (`table.list td > select.color-pick`), yoksa
    `table.list td > select { width: 100% }` (0,1,3) onu yener.
    **A2'de kuralın ikinci yarısı da yazıldı:** metin ya da `width: 100%` bir
    liste taşıyan sütunun genişliği gerçekten sütunun meselesidir ve `<th>`'ye
    verilir — ama o zaman birim başlığın ch'sidir. Ölçülen karşılıklar:
    `1ch` = 6.86px başlıkta, 9.15px gövdede. Bu yüzden `.num` bir `<input>`
    üstünde `8ch`, bir `<th>` üstünde `10ch`, ikisi de ~70px. Aynı sayıyı iki
    yere yazmak hatadır, farklı yazmak değil.

35. **`select` `color: inherit` alır — palet zemininde bu tuzak 15'in ta
    kendisidir.** Renk seçici `background`'ını paletten alıyor ama mürekkebini
    temadan alıyordu: koyu temada açık mürekkep pastel zemine düşüyor ve
    36 rengin açık olanlarında indeks **hiç görünmüyordu**. Kutu darken de
    böyleydi, sadece kırpılma yüzünden fark edilmiyordu. Palet rengi taşıyan
    her öğeye `--on-color` verilecek — `.card`, `.pool-card` ve `.ghost`'ta
    zaten var, unutulan tek yer bir `<select>`'ti.

36. **Bir hücre boyunu `-17px` gibi ELLE hesaplanmış yarımlarla yazma.**
    Hayalet kartın kaydırması `margin: -17px`, yani `34/2`'nin yazılmış hâliydi.
    `--cell-*` rem'e geçince o sayı sessizce yanlış oldu: %125'te hayalet
    parmağın altından kayardı. `calc(var(--cell-w) / -2)` yazılır — türetilen
    her ölçü, türediği değerden hesaplanır.

37. **Bir hücreyi daraltan `clamp()`, sütunun min-content'inden dar çizemez —
    ve o min-content'i sandığın öğe belirlemiyor olabilir.** "Sığdır" modu
    için `--cell-w` 28, 23 ve 18 px yapıldı; üçünde de hücre **33.69 px**
    çizildi, yani CSS'teki sayı çoktan anlamını yitirmişti. İlk teşhis
    karttaki iki satırdı (`411` + derslik harfi) — **yanlıştı**: kartın alt
    satırını gizlemek tabloyu 1 px oynatmadı. Suçlu başlıktaki `"10:40"`
    idi; onu gizlemek 2461 → 1728 px yaptı, yani haftanın tamamı kutuya
    girdi. Genişlikten türeyen bir ölçü yazmadan önce alt sınırın nereden
    geldiği **tek tek kapatılarak** ölçülür; "herhalde şudur" ile A5 hiç
    yazılamazdı. Aritmetik payı da ölçülür: 78 sütun kenarlığının alt-piksel
    yuvarlaması, 2 px payla 1 px kaydırma bırakıyordu.

---

## Tasarım sistemi

### Karakter

Referans: basılı ders programı. Ekran bir kâğıt yüzeyidir, dashboard değil.
Kılcal kenarlık, dolgun renk bloğu, minimum gölge, sıkı hizalama.
Bir öğe "yüzüyor" gibi görünüyorsa yanlıştır.

### Ölçek — tek EKRAN ekseni, kâğıt ayrı

```
--ui-scale   1.0–1.25, 0.05 adım. EKRANIN TAMAMI — ızgara dahil.
             Ayarlar → Görünüm, localStorage['ders-programi-olcek'].
kâğıt        --ui-scale'den ETKİLENMEZ. Kendi merdiveni var (--fs-p-*, pt).
```

Kök: `:root { font-size: calc(16px * var(--ui-scale)); }` — CSS'teki tek ham
px `font-size` budur, merdivenin çapası. Boşluk, hücre, satır başı ve kenar
çubuğu da rem: yazı büyüyüp boşluk yerinde kalırsa ekran ferahlamaz, sıkışır.

> **`--grid-zoom` YOK — A5 geri geldi ama ikinci bir zoom ekseni olarak
> değil.** Ölçek tek eksendir ve ızgara ona bağlıdır; yoksa ölçek
> büyütüldüğünde babanın bütün gün baktığı ekran tek başına küçük kalırdı.
> Yoğunluk (aşağıda) bir *zoom* değil, hücrenin **ne gösterdiğini**
> değiştiren ayrı bir ayardır.

> **Kâğıt neden ayrı:** A4 sabit fiziksel boyut. Ekran rahatlık ayarının
> kâğıda neyin sığdığını belirlemesi, tuzak 31'in 205 mm hesabını ve "3 sınıf =
> 3 sayfa" testini bir düğmeye bağlamak olurdu — babanın *yazıcıda* bulacağı
> bir hata. `@media print` `--ui-scale`'i 1'e sabitler. Aynı merdiven
> **önizlemede de** kullanılır: önizleme kâğıda benzemezse hangi sayfanın
> basılacağını seçmek tahmine döner. Daha büyük BASKI ayrı bir özelliktir ve
> ilke 5 gereği bir dönem kullanılmadan yazılmaz.

### Izgara yoğunluğu — anlamsal zoom (A5)

```
Rahat   (varsayılan)  --cell-w 2.125rem (34px @%100), saatler görünür,
                      ızgara 2616px / kutu 1828px  -> yatay kaydırma
Sığdır                --cell-w kutudan TÜRETİLİR, ders saatleri gizlenir,
                      ızgara 1823px / kutu 1828px  -> yatay kaydırma YOK
```

Tercih `localStorage['ders-programi-yogunluk']`, `State`'e girmez; ayar
**Ayarlar → Görünüm**'de, yazı büyüklüğünün altında.

**Sığdır tam olarak BİR şeyi düşürür, ve hangisi olduğu ölçüldü:** ders
numarasının altındaki başlangıç saati. `--cell-w` 28, 23 ve 18 px yapıldığında
hücre üç seferde de **33.69 px** çizildi — çünkü sütunun min-content'ini
karttaki yazı değil, başlıktaki `"10:40"` belirliyordu. Kartın alt satırını
gizlemek hiçbir şeyi değiştirmedi; saati gizlemek tabloyu 2461 → 1728 px'e
indirdi (tuzak 37). Ders **numarası** kalır: göz onunla geziniyor, ve saatler
hem Ayarlar → Okul'daki zil önizlemesinde hem de basılan her sayfada yazıyor.

Hücre genişliği `clamp(1.125rem, (100cqw − satır başı − ayraçlar − pay) /
sütun sayısı, 2.75rem)`. Sütun sayısı CSS'e **markup'tan** gelir
(`--lesson-cols`, `--break-cols`): hafta her zaman 6×12 değil, 7 günlük hafta
84 sütundur ve stil dosyasına yazılmış bir `72` Pazartesi eklenen gün yalan
olurdu. `100cqw` için `.grid-wrap` bir container'dır — `100vw` kenar çubuğunu,
dolguyu ve dikey kaydırma çubuğunu tahmin etmek zorunda kalırdı.

Renk her yoğunlukta okunan ilk kanal, o yüzden **palet ΔE/kontrast sınırları
dokunulamaz**.

### Tipografi — tek merdiven, 6 basamak

```
--fs-xs  .75rem   (12px @1.0) mutlak alt sınır, bunun altı YASAK
--fs-sm  .8125rem (13px)
--fs-md  .875rem  (14px)
--fs-base 1rem    (16px) gövde
--fs-lg  1.125rem (18px)
--fs-xl  1.375rem (22px)
```

**Kâğıdın kendi merdiveni, pt cinsinden** — rem değil, çünkü kâğıt ölçekle
dönmez. Hem önizleme hem baskı buradan okur:

```
--fs-p-xl   14pt    sayfa başlığı
--fs-p-lg   10pt    .p-top · .p-daycol · kapalı saat
--fs-p-md    9pt    künye satırı
--fs-p-base 8.5pt   tablo gövdesi ve başlığı
--fs-p-sm    8pt    .p-bottom
--fs-p-xs    7pt    .p-clock
```

Ham px font-size YASAK. Yeni boyut gerekiyorsa merdiveni tartış, ekleme.
Rakam içeren her yerde `font-variant-numeric: tabular-nums`.

**12px tabanı bir EKRAN kuralıdır.** Izgarada da geçerlidir (ölçüldü: 34px
hücre iki satır 12px'i `--lh-tight` ile alıyor, ızgara genişliği değişmedi);
kâğıtta geçerli değildir, çünkü 300 dpi'da 7pt okunur.

### Geometri

--r-sm 3px · --r-md 6px. Üçüncü radius yok. İki ham değer bilerek kaldı:
`.step-no` `50%` (bir şekil, basamak değil) ve `.panel.inset` `0`.
--space-1..5 korunur, rem'e çevrilir. Ham px padding/margin/gap YASAK.
Tablo sütun genişliği ch cinsinden, CSS'te. JSX'te style={{width}} YASAK.
  (istisna: paletteColor() dönen dinamik background — bu meşru)

**Sütun merdiveni — altı basamak, tipografininki gibi:**

```
--w-col-xs   8ch   ~55px   onay kutusu, tek kelimelik etiket
--w-col-sm  10ch   ~69px   sayı sütunu (th.num)
--w-col-md  13ch   ~89px   sayı kutusu, tek düğme
--w-col-lg  16ch  ~110px   kısa metin kutusu, dar açılır liste
--w-col-xl  26ch  ~179px   uzun seçenekli liste, iki düğme
--w-col-2xl 32ch  ~220px   uzun metin
```

Basamaklar `<th>` üstünde durur, yani birim **başlığın** ch'sidir (`--fs-xs`).
KUTU genişliği (`.num`, `.text-sm`, `.color-pick`) gövdenin ch'sindedir. Aynı
70px'e iki farklı sayı düşer (`8ch@1rem` ≈ `10ch@.75rem`) ve bu doğrudur —
bkz. tuzak 34. Yeni bir genişlik gerekiyorsa merdiveni tartış, ekleme.

### Diyalog

Native `<dialog>` + `showModal()`. window.confirm/alert/prompt YASAK.
Geri alınamaz işlem (Sıfırla, sil, üzerine yaz) mutlaka dialog'dan geçer.
Tek animasyon istisnası: dialog açılışında <=120ms opacity,
`prefers-reduced-motion: reduce` ise kapalı. Başka animasyon yok.

### Erişilebilirlik

Çözücü ilerlemesi, sonuç satırı ve hata mesajları `aria-live="polite"`.
Geri alınamaz uyarılar `role="alertdialog"`.
Renk asla tek başına durum taşımaz — ızgara renk bloğu bunun istisnasıdır
ve orada kimlik taşır, durum değil.

---

## Arayüz

Altı sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar**. Daha fazlası yok.

- **Sekmeler solda, dikey bir kenar çubuğunda** (92px; daraltılınca 52px, tercih
  `localStorage['ders-programi-kenar']`'da). Karar 768px'lik ekranda alınmıştı: yatay
  bir şerit ızgaradan bir öğretmen satırı götürüyordu. 1080px'te o baskı yok ama karar
  duruyor, çünkü ikinci gerekçe ekrandan bağımsız: yatayda ızgara **hâlâ** taşıyor ve
  kayıyor (1920'de 788px), yani 92px zaten kaydırılan bir yerden gidiyor. Daraltılmışken etiket gizlenir ama `aria-label`
  kalır — erişilebilir ad kaybolmaz.
- **İçerik ekranın tamamını kullanır.** Tek düzen kuralı `.cols` (+ `wide-left`,
  `narrow-right`): solda asıl iş, sağda o ekranın **anlamı** — Kurulum'da kapasite
  özeti, Ayarlar → Okul'da zil önizlemesi, Ayarlar → Kurallar'da canlı ihlal listesi,
  Müsaitlik'te varlık listesi, Yazdır'da sayfa seçimi. Sağa konan hiçbir şey yeni
  değil; hepsi ya bir sekme öteden ya tablonun üstünden geldi. Kontrol'de sabit iki
  sütun değil **akan kart ızgarası** (`.panel-grid`) — sorun yokken sol sütun boş
  kalmasın.

- **Kurulum yalnız listeler, Ayarlar yalnız ayarlar.** Kurulum dört sayılabilir adım:
  `1 Derslikler · 2 Öğretmenler · 3 Sınıflar · 4 Dersler`. Okul adı, günler, zil,
  kurallar ve branş listesi **Ayarlar**'da — dönem başında doldurulan şeyle yılda bir
  dokunulan şey aynı ekranda durmaz.
- **Ayarlar beş bölüm**: `Okul ve zil · Kurallar · Branşlar · Görünüm · Veri`.
  Görünüm iki şey ayarlar, ikisi de makinenin: **yazı büyüklüğü**
  (`--ui-scale`, %100–%125, altı düğme) ve **ızgara yoğunluğu** (Rahat /
  Sığdır). **Kaydırıcı değil düğme**: ölçeğin altı yasal değeri var, kaydırıcı
  olmayan bir süreklilik uydurur ve hangisine oturduğunu gizler. İkisi de
  `State`'e girmez (`ders-programi-olcek`, `ders-programi-yogunluk`) ve ikisi de
  **yazdırmayı etkilemez** — kâğıtta saatler her iki yoğunlukta da yazar.
- **Üst çubukta plan seçici, yönetim Ayarlar → Veri'de.** Seçici tek plan
  varken de görünür: "hangi planı düzenliyorum" sorusunun cevabı orası, ve
  ancak iki plan olunca beliren bir kutu planların var olduğunu hiç
  öğretemezdi. Plan **yaratan, adlandıran ve silen** her şey Ayarlar → Veri'de
  — üst çubuk, hiçbir tıklamanın bir öğleden sonrayı götüremeyeceği yer olarak
  kalır (aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı). Geçiş geri-al yığınını
  sıfırlar: bir planın hamlesi başka bir plana uygulanamaz.
- **Ayarlar → Veri, verinin nerede olduğunu SÖYLER.** Gerçek anahtar adları,
  gerçek boyutlar, ve tek cümlelik doğru: bu veri bu tarayıcıya ve bu bilgisayara
  aittir, "tarama verilerini temizle" onu siler, taşınan tek şey dosyadır.
  "Tarayıcıda saklanıyor" demek bunu söylemez. **Bütün planları tek dosyaya**
  yazan düğme de burada — üst çubuktaki tek planı yazmaya devam eder.
- **`Sıfırla` üst çubukta değil.** Ayarlar → Veri altında. Üst çubukta "Dosyadan aç"a
  bir yanlış tıklama uzaklıktaydı ve geri alınamıyor. `Dosyaya kaydet` / `Dosyadan aç`
  üst çubukta **kalır**: tuzak 7'nin karşı önlemi görünür olmak zorunda.

- **Sol tık taşır, sağ tık siler.** Yerleşmiş bir derse sol tıklamak bloğu siliyordu,
  dolayısıyla taşımanın tek yolu silip havuzdan yeniden sürüklemekti. Şimdi: sol düğme
  + sürükle = taşı, sağ tık = havuza gönder, Delete = aynısı klavyeden. Klavyeden gelen
  "click" `e.detail === 0` ile ayrılır, böylece odaklı kartta Enter/Space çalışır.
  Sürükleme haritası **kaynağı kaldırılmış** bir durum üstünde hesaplanır, yoksa ders
  kendi kendini engeller.
- **Otomatik dizme Program sekmesinde iki düğme**: `Otomatik diz (N)` ve `Baştan diz`
  (onaylı). Ayar yok — "sabaha yay" gibi tercihlerin doğru cevabı bir dönem
  kullanılmadan bilinemez (ilke 5). İlerleme ve sonuç `.reason-bar`'da: sabit
  yükseklikli, ızgarayı kaydırmıyor, göz zaten oraya alışkın. İlerleme **düz metin**,
  çubuk değil (yasak liste: animasyon). Bütün koşu **tek geri-al adımı**.
- Ana ekran aSc'deki gibi: **satır = öğretmen, sütun = 6 gün x 12 saat**, tek geniş
  tablo, altta yerleşmemiş kart havuzu. Saat başlığında ders numarası ve altında
  başlangıç saati (`3` / `10:40`).
- **Görünüm iki yazısız simge düğmesi**: Öğretmen / Sınıf. Seçili olan vurgulu,
  diğeri soluk. `aria-label` zorunlu — metin yok, erişilebilir ad onların tek adı.
  Yanındaki açıklama cümlesi kalır: simge yalnız başına ilk seferde tahmin ettirir.
- Sayaç 0 ise adım soluk. **Kilitli sihirbaz değil** — her adıma her an atlanır.
- **Branş yazılmaz, seçilir.** Serbest metin "Matemtik"i sessizce ikinci bir branş
  yapıyordu ve kısaltması yine "Mat" çıktığı için kâğıtta ayırt edilemiyordu. Liste
  Ayarlar'da yönetilir; "+ Yeni branş…" ile oracıkta eklenir. **Kullanılan branş
  silinemez**, mesaj kimin kullandığını sayar.
- **Başlangıç saati iki açılır liste** (00–23 ve beşer dakika), `<input type="time">`
  değil: o girdi AM/PM'i tarayıcının yereline göre seçer ve boşaltılınca günü sessizce
  00:00'a alırdı.
- **Yazdırmada hangi sayfaların basılacağı tek tek seçilir.** Sınıf ve öğretmen için
  ayrı onay listeleri, "Tümü / Hiçbiri", ve düğmede sayfa sayısı.
- **Basılan sayfanın başlığı iki satır**: büyük ve ortalı ana satır
  (`510 sınıfı — Haftalık ders programı`), altında küçük künye satırı
  (`Örnek Kurs · G dersliği`). Tek uzun sola yaslı satır kâğıtta başlık değil
  altyazı gibi okunuyordu. Tarih ve dosya yolu kâğıda **çıkmaz** (tuzak 31).
- **Eksen tutarlılığı.** Program ızgarasında sütun = gün × ders (babanın alışkanlığı).
  **Müsaitlik ve Yazdır'da satır = gün, sütun = ders** — ikisi de "bir günü okuma"
  ekranı, aSc'nin Time off penceresi de öyle.
- **Öğle arası, ekrana göre üç ayrı teknik.** Program ızgarasında dar bir ayraç
  SÜTUNU (ara konumu gün başına sabit); müsaitlik ve baskıda ara konumu satırdan satıra
  değiştiği için o satırın hücresine kalın kenarlık.
- **Yazdırma A4 YATAY**, `table-layout: fixed`, sütunlar eşit. Sütun başlığındaki saat
  yalnızca bütün günler uyuşuyorsa yazılır — kâğıtta yanlış saat yazmaktansa hiç yazmamak.
  Kenar boşluğu `@page`'te değil **sayfanın kendisinde** (`.print-page` padding'i);
  satır 23 mm ve sayfa sabit yükseklikli bir flex kutusu, yani plan dikey ortalanır.
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, sarı = uyarı,
  kırmızı = engel, gri taralı = kapalı, kırmızı çerçeve = kapalı saatte kalmış ders.
  Öğretmen rengi havuzdaki kartla satırı eşleştirmeye yarar.
- **Hücreyi daima ÖĞRETMEN rengi boyar**, iki görünümde de. Sınıf rengi bir *işaret*:
  satır başındaki nokta ve basılan sayfanın başlığı. İki renk aynı kareyi paylaşmaz.
- **Havuz kartı görünümü takip eder.** Üst satır = ders yerleşince hücrenin okuyacağı
  şey, alt satır = kartın gideceği satır; sıralama alt satıra göre, ki bir satırın
  kartları yan yana dursun.
- **Açık ve koyu tema, sağ üstte düğme.** Öğretmen paleti iki temada da AYNI ve
  yazdırma her zaman açık palet kullanır — o renkler kâğıda basılıyor. Palet üstündeki
  mürekkep de tema ile dönmez (`--on-color`).
- **Dört düğme durumu, fazlası yok:** birincil · sade · tehlikeli · basılı. Tehlikeli
  olan beklemeden kırmızı görünür — ama **mürekkeple**, kenarlıkla değil: 25
  öğretmenlik listede 25 kırmızı dikdörtgen, tehlike renginin sayfanın arka
  planı hâline gelmesi demekti. Kırmızı kenarlık hover'da geliyor.
- **Düğme kenarlığı `--line`, `--hairline` değil.** Girdiler Y0'da kıl çizgiye
  inebildi çünkü karşılığında gömük bir yüzey (`--paper-sunk`) kazandılar.
  Düğmenin öyle bir yüzeyi yok — zemini `--paper`, üstünde durduğu `.topbar` ve
  `.panel` de `--paper` — yani **kenarlık düğmenin tek sınırı**. Bu yüzden
  `--line`'ın tanımı "yalnız ızgara ve tablo başlığı" değil: **veri okunan
  yerler ve denetim kenarı**.
- Font: sistem fontu. Web font indirmek offline çalışmayı bozar.
- **Ekran 1920x1080 varsayılır** (babanın 27" monitörü; CSS pikseli, fiziksel
  piksel değil). Öğretmen sütunu `sticky`, yatay kaydırma olacak: ızgara 2616px,
  yani 25 satırın 19'u ve sütunların bir kısmı ekrana sığar, gerisi kaydırılır.
- **Boş ekranlar yönlendirir.** "Henüz ders yok" değil, "Kurulum sekmesinden öğretmen
  ve sınıf ekleyin, sonra ders girin."
- **Silmeden önce her zaman onay**, ve metin ne kaybedileceğini sayar:
  "A dersliği silinecek. 4 sınıfın dersliği boşalacak (410, 411, 510, 511)…"

---

## Çalışırken

- Bir şey belirsizse **sor**, tahmin etme. Yanlış varsayımla yazılan kod, yazılmamış
  koddan pahalıdır.
- Bir sürümün **çıkma şartı** sağlanmadan sonrakine geçilmez.
- Özellikler babanın geri dönütüne göre önceliklenir. Kullanılmamış bir özelliğin
  "sonraki adımı" tahminle yazılmaz (ilke 5).

### Her oturumun sonunda — zorunlu

Bu bir istek değil, iş akışının parçası. Oturum bitmeden:

1. **`docs/TASKS.md`** — biten maddeler `[x]` işaretlenir, yeni çıkan işler eklenir,
   "ŞİMDİ SIRADA" bölümü bir sonraki oturumun ilk işini gösterecek şekilde yenilenir.
2. **`docs/STATUS.md`** — durum tablosu, ölçülen değerler, plandan sapmalar,
   doğrulanmayı bekleyen varsayımlar ve bilinen hatalar güncellenir. Tarih değişir.
3. **`CLAUDE.md`** — sadece *kalıcı* bir kural, karar veya tuzak ortaya çıktıysa.
   Günlük ilerleme buraya yazılmaz, o STATUS'ün işi.
4. **Dürüstlük şartı:** test edilmemiş bir şey "bitti" işaretlenmez. Kod yazıldı ama
   tarayıcıda doğrulanmadıysa STATUS'te bu açıkça yazar.
