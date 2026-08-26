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
takvim entegrasyonu · **aynı planın** sürüm ağacı (v3, v4, v5 diye yan yana tutma) ·
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

## Değişmez ilkeler — güncelleme (2026-08-26)

7. "Hedef makine yavaş" → **ÖLÇÜLECEK.** Babanın makinesinde gerçek
   performans görülene kadar bu bir varsayımdır, gerekçe değildir.

### Kaldırılan yasaklar

- **ANİMASYON yasağı kalktı.** Yerine geçen kural yok: süre, kapsam ve
  kütüphane serbest. Tek şart `prefers-reduced-motion: reduce` → hepsi kapalı.
- **WEB FONT yasağı kalktı**, yerine kural: font **tek dosyaya GÖMÜLÜR**
  (base64/`data:`). Ağdan çekilmez. "İnternet gerekmez" ilkesi aynen geçerli.
- **BAĞIMLILIK yasağı kalktı (2026-08-26).** Tailwind / Radix / ikon
  kütüphanesi / animasyon kütüphanesi *bağımlılık* gerekçesiyle reddedilmişti;
  o gerekçe kalktı. Yeni ölçüt tek: paket `dist/index.html`'e gömülebiliyor ve
  çalışma anında ağa çıkmıyorsa serbest. Bkz. **"Tasarım — serbest"** →
  *Bağımlılık politikası*.
- **TASARIM SİSTEMİ yasakları kalktı (2026-08-26).** Yarıçap/kot/tipografi/
  sütun merdivenleri, "altı sekmeden fazlası yok", "dört düğme durumu",
  "yüzüyorsa yanlıştır" — hepsi silindi.

---

## Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  ->  dist/index.html  (tek dosya, gömülü JS/CSS)
Vitest                  ->  saf mantık testleri
Radix UI                ->  diyalog · toast · menü · tooltip · popover
lucide-react            ->  simgeler (ağaç budanır, simge başına ~0.3 KB)
```

**Hareket kütüphanesi YOK — ve bu bir yasak değil, bir ÖLÇÜM.** `motion`
kuruldu, ölçüldü ve **127 KB** çıktı; karşılığında verdiği tek şey CSS'in
yapamadığı `layoutId` paylaşımlı geçişiydi. Aynı işi tarayıcının kendisi
bedavaya yapıyor — `file://` altında Chromium'da **ölçüldü**:

```
document.startViewTransition   var        paylaşımlı öğe geçişi
@starting-style                var        girişte animasyon
transition-behavior: allow-discrete  var  display'e geçiş
oklch() · color-mix()          var        algısal renk rampası
backdrop-filter                var        yapışkan kabuk
position-anchor                var        popover konumlama
```

**Bağımlılık kuralı (2026-08-26):** bir paket `dist/index.html`'e gömülebiliyor
ve çalışma anında ağa çıkmıyorsa serbest. Sabit bir KB tavanı yok; şart
**ölçmek** — eklendikten sonra dosya boyutu ve `file://` ilk boyama süresi
`docs/STATUS.md`'ye yazılır. `devDependencies` zaten serbestti.

Ölçülen maliyetler (2026-08-26, taban 405 242 bayt):

| Paket | Maliyet |
|---|---|
| `lucide-react` (12 simge) | **+3,4 KB** |
| `@radix-ui/react-dialog` | +39,5 KB |
| `+ react-toast` | +19,6 KB |
| `+ react-dropdown-menu` | +51,0 KB |
| `+ react-tooltip` | +8,2 KB |
| `+ react-popover` | +5,0 KB |
| **Radix toplam (5 paket)** | **+123,3 KB** |
| ~~`motion`~~ | +127,2 KB — **alınmadı** |

`dropdown-menu` beşinin en pahalısı ama popper'ı da o getiriyor: tooltip ve
popover onun üstüne 13 KB'a geliyor. **Tailwind alınmadı** — `src/styles.css`
zaten olgun bir token katmanı, taşımanın görsel getirisi sıfır.

Hâlâ yasak olan tek şey **ağ**: çalışma anında bayt indiren hiçbir paket
giremez (ilke 3). Sürükle-bırak kütüphanesi de girmiyor ama gerekçesi başka —
`src/drag.ts` Pointer Events ile yazıldı çünkü tuzak 1 bir kütüphaneyle de
çözülmüyordu.

CSS: tek bir `src/styles.css`, CSS değişkenleriyle.

### Komutlar

```bash
npm run dev        # geliştirme sunucusu
npm test           # Vitest — 453 birim testi
npm run build      # dist/index.html tek dosya üretir  (asıl teslim)
npm run build:site # dist-site/ — PWA: tek dosya + manifest + sw.js + simgeler
npm run test:e2e   # Playwright — derler, sonra 318 E2E testi (file://)
npm run test:site  # site testleri, http üzerinde — 6 test, çevrimdışı açılış dahil
npm run kontrol    # hepsi: tsc + birim + derleme + E2E + site
npm run ekran      # iki temada ekran görüntüsü -> test-results/ekran/
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
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite, zil saatleri, kural limitleri, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı, branş listesi, kapalı saat çakışması, **plan kitaplığı, anahtarlar, paket zarfı ve dosya adları**, **otomatik dizme (yasallık, belirlenimcilik, tıkanma), `occupy`/`vacate` eşdeğerliği, 21 dünyalık çözücü matrisi ve denetçinin kendisi**, **bir varlığın kendi haftası ve sayılan gerçekleri, durum özeti, Türkçe katlama/sıralama/süzme** |
| Duman | `src/App.test.tsx` (jsdom) | Bileşenler çiziliyor mu, sekmeler çöküyor mu |
| **E2E** | `e2e/*.spec.ts` (Playwright, 20 dosya, `file://`) | **Davranış:** sürükleme, taşıma, sağ tık, kaydırma, geri-al zinciri, hata yolları, klavye, sekme gezinmesi, plan geçişi, taslaklar, paket gidiş-dönüşü, "veriler nerede" tablosu, otomatik dizme, **komut paleti, varlık paneli, listelerde ara/sırala/süz, diyalogların ne SORDUĞU**, **altı şeridin tek iskeleti ve Kontrol'ün süzgeci** (`serit.spec.ts`), **hareket ayarının üç basamağı ve makine tercihinin onu ezdiği** (`hareket.spec.ts`). **Erişilebilirlik:** renk kontrastı ve AYRIMI, gün bandının bir DURUM gibi okunmadığı **ve iki temada aynı yükte olduğu**, `--on-color` mürekkebi, görünür odak, dar ekranda erişilebilir adın kalması, **%150'de üst çubuğun ve şeridin taşmaması**. **Kâğıt:** başlık, dikey ortalama, sayfa sayısı, A4 yatay, **ekran önizlemesinin süsünün kâğıda sızmadığı**. **İlke 3:** gömülü fontun gerçekten çizildiği, ağdan bayt çekilmediği |
| **Site** | `e2e/site.spec.ts` (`npm run test:site`) | **http üzerinde**: manifest ve simgeler, service worker kaydı, **fiş çekilince açılma**, çevrimdışı girilen verinin durması, ve site derlemesinin `file://` derlemesine sızmadığı |
| Görüntü | `e2e/ekran.spec.ts` (`npm run ekran`) | Test değil, **kanıt**: iki temada on yedi ekran görüntüsü. Görüntüyü almadan önce sayfanın hareketi biter (tuzak 59) |

> **2026-08-26'da silinen katman:** görsel regresyon (`gorsel.spec.ts` + 24 PNG
> + `npm run gorsel`) ve düzen testleri (`sutun.spec.ts`, `duzen.spec.ts`'in
> geometri yarısı, `renk-secici.spec.ts`'in sığma yarısı, `izgara.spec.ts`'in
> Sığdır↔havuz takası). Gerekçe kullanıcı kararı: **erişilebilirlik ölçümleri
> kalır, düzen ölçümleri gider.** `duzen.spec.ts` → `kabuk.spec.ts` oldu ve
> geriye gezinme, erişilebilir ad, simge ayrımı ve baskı kaldı.

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
theme.ts                        makine tercihleri (tema, kenar, havuz açık mı +
                                BOYU, araç şeridi, ölçek, yoğunluk, müsaitlik
                                saati, HAREKET) — dokuz bağımsız skaler, dokuz
                                anahtar, hiçbiri State'e girmez
toolState.ts                    NEREDESİN: her sekmenin görünüm/tür/adım/bölüm/
                                kapsam/Kontrol süzgeci. App'te yaşar, çünkü sekme
                                değişimi bileşeni söküyor (tuzak 18) ve çünkü
                                onu gösteren şerit <main>'in ÜSTÜNDE
gridChrome.ts                   imleç haçı + yapışkan başlık gölgesi. SAF DOM,
                                React BİLMEZ — drag.ts'in deseni (tuzak 1)
poolSplit.ts                    havuzun boy sürükleyicisi. Aynı desenin ÜÇÜNCÜSÜ:
                                pointermove'da React'e değil, tek bir custom
                                property'ye yazar — 2100 hücre yeniden çizilmez
useSolver.ts                    solver.ts'i rAF ile dilim dilim sürer. App'te yaşar.
  |
listview.ts                     ara / sırala / süz. SAF. fold() Türkçe katlama
                                (İ→i, ğ→g…), compareTr() Türk alfabesi sırası.
                                State'i BİLMEZ, herhangi bir listeyi alır.
                                facet'ler ÇOĞUL: iki çip satırı birlikte daraltır,
                                birinin sayıları öteki uygulanmışken alınır.
                                canReorder() elle sıralamanın açık olduğu tek
                                durumu tanımlar: görünen satırlar dizinin KENDİSİ
rowDrag.ts                      liste satırını sürükleme. Saf DOM, React BİLMEZ —
                                aynı desenin DÖRDÜNCÜSÜ (drag.ts, gridChrome.ts,
                                poolSplit.ts). Hedef, satırın KAPSAMASIYLA bulunur,
                                orta noktayla değil (tuzak 60)
printOptions.ts                 kâğıtta ne olsun: beş anahtar, tek kayıt, tek
                                localStorage anahtarı. State'i de theme'i de BİLMEZ
  |
components/Dialogs.tsx          HER soru. useDialogs() → confirm / alert.
                                window.confirm/alert YOK — hiç kalmadı
components/Toasts.tsx           olan biteni söyleyen satır. Radix Toast DEĞİL:
                                eylem taşımıyorlar, o yüzden 19,6 KB'a gerek yok
components/Inspector.tsx        varlık paneli. entityWeek/entityFacts'i ÇİZER,
                                hesaplamaz. useInspect() her yerden çağrılır
components/Palette.tsx          Ctrl+K kutusu — komut listesini DIŞARIDAN alır
components/Commands.tsx         o listeyi kurar. App'te DEĞİL, çünkü komutların
                                yarısı useInspect() çağırıyor ve o hook ancak
                                InspectorProvider'ın içinde çalışıyor — App ise
                                o provider'ı çizen bileşen
components/ListTools.tsx        dört listenin de üstündeki aynı şerit
components/useRowOrder.tsx      dört listenin ortak sıralama kancası: tutamak
                                hücresi + klavye + rowDrag.ts'i bağlama +
                                "N. sıraya taşındı" duyurusu
Root.tsx                        provider yığını. main.tsx ve App.test.tsx aynı
                                ağacı çizsin diye tek yerde
  |
components/Ribbon.tsx           araç şeridi: sekmeye göre switch, ALTI sekmede
                                de çizilir (2026-08-27; Kontrol'ünki raporu
                                süzer). Tek iskelet: Group(başlık) + Sep +
                                Spacer, her düğmede simge ve kelime. İş mantığı
                                YOK — "Otomatik diz (N)"in N'i entities.ts'teki
                                saf pendingLessons()'tan, Kontrol'ün sayıları
                                feasibility.ts'teki health()'ten gelir; buildPool
                                App'e çıkarılmaz (Grid'in memo sözleşmesi)
components/props.ts             PanelProps — Kurulum adımı ve Ayarlar bölümü aynı ikiliyi alır
components/Field.tsx            iki klasörün de kullandığı küçük parçalar
components/ColorPick.tsx        36 renklik swatch diyaloğu (Kurulum'un iki adımı)
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
  schemaVersion: 6
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
Teacher    { name, short, subject, gender, color, limits }  // her öğretmenin TEK branşı var
                                            // gender: '' | 'k' | 'e'; '' bir DEĞER,
                                            // eksik veri değil. Kâğıda çıkmaz.
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
ders-programi-olcek      -> yazı büyüklüğü tercihi (--ui-scale, 1.0–1.50)
ders-programi-yogunluk   -> ızgara yoğunluğu tercihi (ferah / rahat / sigdir)
ders-programi-havuz      -> havuz çekmecesi açık mı (acik / kapali)
ders-programi-havuz-boy  -> havuz çekmecesinin boyu, REM (6–22, 0.25 adım)
ders-programi-serit      -> araç şeridi açık mı (acik / kapali)
ders-programi-hareket    -> hareket (animasyon) tercihi (tam / az / kapali)
ders-programi-baski      -> kâğıtta ne olsun: beş anahtarlı TEK kayıt (JSON)
```

`ders-programi-baski` bilerek `theme.ts`'in dışında (`src/printOptions.ts`).
Oradaki dokuz skaler **ilk boyamadan önce** `<html>`'e öznitelik yazan düzen
değerleri; bunlar render anında React prop'u olan **tek bir karar** — "kâğıtta
ne var" — ve beş cevabı var. Beş ayrı anahtar, bir soru için beş normalize
demekti. `theme.ts` dokuz bağımsız skaler olarak kalıyor.

Havuz boyu **rem**, px değil: `--ui-scale` %150'ye çıkınca sabit px'lik bir
çekmece, içindeki kartlar büyümüşken görsel olarak küçülür. Ayrı bir anahtar,
`ders-programi-havuz`'un genişletilmiş hâli değil — o anahtarın sözleşmesi
"`kapali` değilse açık" ve içine bir sayı katlamak tek ayrıştırıcıya ikinci bir
normalize dalı sokardı. `theme.ts` bağımsız skalerleri bağımsız anahtarlarda
tutuyor — dokuz tane — ve bu onlardan biri.

**Hareket tercihi bir MAKİNE tercihidir ve makinenin kendi tercihini EZEMEZ.**
`ders-programi-hareket` üç değer alır (`tam` · `az` · `kapali`) ve `data-motion`
olarak `<html>`'e yazılır. `@media (prefers-reduced-motion: reduce)` bloğu
`styles.css`'te `[data-motion]` kurallarından **sonra** ve eşit özgüllükte
durur, yani sıra kazanır: işletim sistemi "azalt" diyorsa seçim ne olursa olsun
hareket kapalıdır. Ayar makinenin isteğinin **ötesine** geçebilir, gerisine
değil — CLAUDE.md'nin tek hareket sözleşmesi (`prefers-reduced-motion: reduce`
→ hepsi kapalı) böylece bozulmadan durur. İlk okumada kayıt yoksa tercih
**sistemden** türetilir (`normalizeMotion(raw, prefersReduced)`), çünkü hiçbir
şeyin kıpırdamadığı bir makinede düğmede "Tam" yazması yalandır.

### Dosya biçimleri — iki tane, karıştırılamaz

```
{ "schemaVersion": 6, ... }    -> TEK plan.  ders-programi-YYYY-AA-GG-SSDD.json
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
  v5 = `ClassGroup.color` + `settings.subjects`, v6 = `Teacher.gender`.
  `parseState` v1'i v2'ye, v2'yi v3'e taşır; v3–v6 tek okuyucudan geçer (aradaki
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
    34 → 48 px olduğunda tam bunun oldu: tablo 84 px büyüdü, o günkü `npm run gorsel` yeşil
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

38. **`font-display: swap` + `ch` cinsinden sütun merdiveni = her açılışta
    sessizce kayan bir düzen.** Gömülü yüz `data:` URI olsa bile eşzamanlı
    çözülmez: ilk düzen `ch`'yi YEDEK fonta çözer, yüz gelince yeniden çözer.
    Ölçülen: `1ch` **6,86px → 9,00px** aynı puntoda. `ch`'den boylanan her
    sütun bir kez zıplar. Çare `font-display: block` — ağdan indirme olmadığı
    için "engelleme" bir çözümlemedir, ve yanlış metrikle **hiçbir şey
    boyanmaz**. E2E de `document.fonts.ready`'yi bekler; bu bir gizleme değil,
    kullanıcının ilk glifi gördüğü anın ta kendisi.

39. **`ch` puntoyla ORANTILI DEĞİLDİR.** Gerçek bir yüz "0"ın ilerlemesini
    küçük puntolarda kuantalar: Plex'te 12px'te **7,00px**, 15px'te **9,00px**
    — oran 1,286, 1,25 değil. "Sütunlar ölçekle tam 1,25 büyür" diye yazılmış
    bir test aslında **fontun** bir özelliğini iddia ediyordu ve sistem fontu
    değişince kırmızıya döndü. Doğru değişmez **ch SAYISI**: kutu N ch ise
    her ölçekte N ch kalır — ve metnin ilerlemesi de aynı kuantayla büyüdüğü
    için sığma birebir korunur. Ham px genişlik bu iddiadan hâlâ geçemez:
    punto büyüdükçe ch sayısı düşer.

40. **Yeni bir zemin kuralı bir DURUMU ezebilir.** Gün bandı
    (`table.grid tbody td.band`, özgüllük 0,2,3) `td.unavailable`'ı (0,1,1)
    yendi ve **tek indeksli günlere düşen kapalı saatler taramasını sessizce
    kaybetti**. Hiçbir sayı, hiçbir metin, hiçbir öznitelik değişmediği için
    süit görmedi; yalnız "kapalı saat haçın altında kaybolmuyor" testi
    yakaladı. Kural: ekrana yeni bir zemin ekliyorsan, o zeminin **hangi
    durumları ezdiğini** tek tek yaz.

41. **Boş bir ızgarada yapılan ölçüm hiçbir şey ölçmez.** Havuz çekmecesinin
    Sığdır'a maliyeti önce boş haftada ölçüldü ve "sığıyor" çıktı; 426 kart
    konunca aynı yapılandırma **174px taştı**, çünkü sütunun tabanını kartın
    yazısı belirliyor. Bu tuzak 33'ün ailesinden ama kendi adı var: **bir
    düzen ölçümü, ölçtüğü şeyi dolduran veriyle yapılır.**

    Aynı oturumda ikinci hâli: "sürükleme hedefi ekran dışındaysa görünür
    oluyor" testi, havuzun alttan 215px yemesine **yaslanıyordu**. Havuz sağa
    taşınıp 25 satırın tamamı görününce test bir şey ölçmeden yeşil geçmeye
    başladı. Çare koşulu **zorlamak** (kısa viewport + satırdan uzağa
    kaydırma) ve önkoşulu iddia etmek — yoksa tuzak 23'ün ta kendisi olur.

42. **Bir ölçüm, ölçtüğü şeyin altındaki mekanizma değişince sessizce yalan
    olur.** "Sığdır havuzu kapatır" kuralı 174px'lik gerçek bir ölçüme
    dayanıyordu. Sonra `.grid-wrap` bir **container** oldu ve hücre
    `100cqw`'den hesaplanmaya başladı; o günden itibaren çekmece açıkken de
    taşma **0px**'ti, ama kural CLAUDE.md'de ölçüm gerekçesiyle duruyordu ve
    kimse yeniden ölçmedi. Ölçüm bir tarihtir, kanun değil. Bir ölçüme
    dayanan kuralın yanına **neyin ölçüldüğü** yazılır, ve o mekanizmaya
    dokunan her değişiklikte yeniden ölçülür.

43. **`Number('')` ve `Number(null)` SIFIRDIR, ve sıfır çoğu aralıkta
    geçerlidir.** `normalizeDockHeight`'ın ilk hâli `Number.isFinite(n)`
    diyordu; tercihi hiç olmayan makinede `localStorage.getItem` `null`
    döndü, `Number(null)` 0 oldu, sonlu sayıldı ve **tabana kırpıldı** — yani
    havuz ilk açılışta ezik geliyordu. "Yok"u "sıfır"dan elle ayırmak
    gerekir. Test önce yazıldığı için yakalandı; `readScale` de yıllardır
    aynı hataya açıktı, orada `SCALE_MIN` tesadüfen makul olduğu için
    görünmemişti.

44. **Bir `normalize()` iki yönden çağrılıyorsa iki TİP alır.** Aynı
    fonksiyona depodan **string**, sürükleyiciden **number** geliyordu; 43'ü
    kapatan `typeof raw !== 'string'` guard'ı sayıyı da eledi ve her sürükleme
    varsayılan olarak yazıldı — çekmece kıpırdıyor ama unutuyordu. Test yalnız
    string yolunu deniyordu, o yüzden yeşil geçti. Kural: bir normalize
    fonksiyonunun testi **her çağıranın verdiği tipi** denemeli.

45. **Bir custom property'nin İKİ sahibi varsa yakın olan kazanır ve uzaktaki
    yazma sessizce hiçbir şey yapmaz.** `--dock-h` hem `.pool`'a React inline
    style'ıyla hem `.program-body`'ye splitter tarafından yazılıyordu. Sürükleme
    DOM'a yazıyordu, `.pool`'daki daha yakın tanım kazanıyordu, ve ekranda
    hiçbir şey olmuyordu — hata mesajı yok, konsol temiz. Türetilen bir
    değişkenin **tek** bir sahibi olur.

46. **`pointerup`'ta `hasPointerCapture` false olabilir.** Sürüklemenin sonunu
    ona bağlarsan hareket biter ama **commit hiç çalışmaz**: çekmece yeni
    boyunda durur, tercih yazılmaz, ve yenilemede eski boya döner. Jestin
    açık/kapalı olduğunu kendi bayrağınla bil; capture'ı yalnız serbest
    bırakırken sor.

47. **`margin` ile araya sıkıştırılan bir tutamağın alt yarısını komşusu
    yer.** Havuzun kulpu 9px'ti ama `margin-bottom: -4px` ile `.pool-head`'in
    altına giriyordu: `elementFromPoint` üst 4px'te kulpu, alt 5px'te başlığı
    buluyordu, yani fare tam ortasına indiğinde **hiçbir olay gelmiyordu**.
    Görünmez bir hata: element oradaydı, `pointer-events` açıktı, testte
    `boundingBox()` doğru kutuyu veriyordu. Bir tutamak **kendi satırını**
    alır. İkinci yarısı: kulp görünür bir **tutamak işareti** taşımalı — iki
    yüzey arasındaki kılcal çizgi kenarlık gibi okunur, ve kenarlıklar
    kıpırdamaz.

48. **Küçülen bir flex kutusunun içindeki öğeler küçülmüyorsa, kutudan
    TAŞARLAR — ve taşan şey tıklanamaz olur.** Üst çubuğa durum çipi
    eklenince `.tabstrip` (`flex: 0 1 auto`) daralmaya başladı, ama `.tab`'ler
    `0 0`. Ölçülen: %150 ölçekte şerit 693px'te bitiyor, Ayarlar sekmesi
    823px'te — yani çipin altında, ve yalnızca oraya denk gelen bir imleçle
    tıklanabilir. Testte "timeout" olarak göründü, "gizli" olarak değil.
    Kural: bir çubuğun **neyin sırayla feda edileceği** yazılır. Burada:
    önce boşluk, sonra çipin cümlesi (noktası asla — ekran meşgulken yok olan
    bir durum güvenilmeyen bir durumdur), sonra belge adı. Sekmeler hiç.

49. **Yeni bir düğmenin adı, var olan bir sekmenin adıyla başlıyorsa süitin
    yarısı kırılır.** "Programı boşalt" 27 yerde `getByRole('button', { name:
    'Program' })`'ı ikiye çıkardı; durum çipinin cümlesi "…havuzda" ve
    başlığı "Kontrol sekmesini açar" olduğu için `name: 'Havuz'` ve
    `name: 'Kontrol'` sorgularını da. İki karşı önlem, ikisi de gerekli:
    kısa ve genel adlar `exact: true` ile aranır, ve metni değişken olan bir
    kontrole kendi `aria-label`'i verilir — `title` bir **ada** dönüşür, ve o
    ad üç piksel ötedeki sekmenin adı olabilir.

50. **Bir tablo için ölçülmüş bir gerekçe, başka bir tabloya TAŞINMAZ.**
    Müsaitlikte saatleri gizleyen ayarın gerekçesini "saat sütunun genişliğini
    belirler" diye yazdım — tuzak 37'nin Program ızgarasındaki hikâyesini
    olduğu gibi taşıyarak. Ölçüldü: yanlış. `table.availability`
    `table-layout: fixed` + `width: 100%`, yani sütunlar içindekinden bağımsız
    eşit; tablo saatliyken de saatsizken de **1341,7 × 354,2 px**. Gerçek
    gerekçe kullanıcının verdiği gerekçeydi (bakmak istemiyor), ve testin
    ölçtüğü şey artık "hiçbir şey değişmedi".

51. **`settledText()`'in ölçütü "bir şey yazıldı"dır ve BOŞ DURUM bir şeydir.**
    `openWithSample` ızgarayı bekliyordu ama depoyu değil; arada 400 ms var ve
    o pencerede depodaki en yeni kayıt sayfanın kendi **boş** yazımı.
    Bir testin "önceki hâl"i böylece boş durum oluyor ve örnekle
    karşılaştırılıyordu. Tuzak 24'ün bir üst katmanı; çare yardımcının
    kendisinde: örnek yüklendikten sonra depoda **okulun adını** beklemek.
    Bir "yazıldı mı" bekleyicisi, **ne** yazıldığını sormalı.

    **2026-08-26: aynı hata ikinci yardımcıda duruyordu.** `loadWorld` düzeltilmemişti;
    `open()` 400 ms'i aştığı her koşuda `before` boş proje oluyor, `savedState`
    ilk değişiklik olarak **dünyanın yüklenmesini** görüyor ve 20 dünya testi
    dizimden ÖNCEKİ ızgarayı yargılıyordu. Bir tuzağı bir yerde kapatmak onu
    kapatmaz — **aynı deseni kullanan her yer aranır.** Yakalayan şey tuzak
    23'ün karşı önlemiydi: "kaydedilen yerleşim sayısı girişten büyük olmalı".

52. **Bir custom property'nin KAPSAMI sözleşmesinin parçasıdır.** `--sec` yalnız
    `.topbar` ve `.ribbon` üstünde tanımlıydı; `.panel > h2::before` ve
    `.chip[aria-pressed]` ise `.main` içinde yaşıyor, yani ikisi de doğdukları
    günden beri `var(--sec, var(--accent))`'in **fallback'ini** çiziyordu. Kural
    çalışıyordu, renk yanlıştı, ve kuralın üstündeki yorum "bölüm rengini kısa
    bir çizgi olarak taşır" diyordu. Hiçbir test görmedi çünkü bir şey çizmemek
    değil, **yanlış şeyi** çizmekti. Tuzak 45'in aynası: orada iki sahip vardı,
    burada hiç. `var(--x, …)` yazan her yerde soru şudur: *x buraya ulaşıyor mu?*

53. **Yeni bir görsel katman, var olan bir sınıfa yeni bir DEĞER değil yeni bir
    AD ister.** Sürüklerken hedef satırın tamamını boyayan zayıf katman
    `drop-ok`'u yeniden kullansaydı, `program.spec.ts`'in "iki saatlik blok tam
    2 hücre yakar" sayımı 40 bulurdu — ve test "renk yanlış" değil "sayı
    yanlış" diye kırılırdı, yani okuyan kişiyi çözücüye yollardı. Ayrı ad
    (`can-ok` / `can-warn` / `can-no`) hem sayımı hem ayraç testinin
    `not.toHaveClass(/drop-/)` iddiasını olduğu gibi bırakır.

54. **Bir kaydırma kutusuna verilen `mask-image` kendi `position: sticky`
    çocuklarını kırpar.** Sündürme `.main`'e uygulanabilir çünkü yapışkan
    çocuğu yok; `.grid-wrap`'e uygulanamaz çünkü saat başlığı ve öğretmen
    sütunu tam da tuttukları kenarda erirdi. Izgara bu yüzden gölgeyle
    (`scrolled-y` / `scrolled-x`) konuşur, maskeyle değil. Aynı iddia iki
    teknikle söylenir; hangisinin nereye ait olduğu **elemanın içinde ne
    olduğuna** bağlıdır.

55. **`startViewTransition` yakaladığı öğeyi bir ANLIK GÖRÜNTÜYLE değiştirir ve
    anlık görüntü tıklanamaz.** Sekme geçişi bununla sarılınca ölçülen:
    `document.elementFromPoint` ızgaranın üstünde **553 ms boyunca** hücre
    değil `<html>` döndürdü. `drag.ts` hedefini tam o çağrıyla buluyor — yani
    geçişten sonraki yarım saniyede kapılan bir kart **hiçbir yere düşmüyordu**,
    hata yok, uyarı yok. Ekranda her şey doğru görünüyordu. API'nin tek eşsiz
    getirisi paylaşımlı öğe geçişidir; ortada olan şey bir çapraz geçişse
    (`<main>`'e `key={tab}` + `@starting-style`) bedeli ödemeye gerek yok.
    Ölçüldükten sonra: 553 ms → **68 ms**. `motion`'ı rafta bırakan aynı akıl
    yürütme — kullanmadığın şeye ödeme.

56. **Erişilebilir adı iki test katmanı iki türlü hesaplarsa ikisi ayrışır.**
    jsdom duman testinin `buttonName()`'i önce `textContent`'e, sonra
    `aria-label`'a bakıyordu; Playwright'ın `getByRole(name:)` ise spesifikasyona
    uyup **`aria-label`'ı üstün** tutuyor. İkisi de doğruydu — hiçbir düğmede
    ikisi birden olmadığı sürece. Görünüm düğmesi simgesinin yanına metin
    alınca ayrıştılar: E2E "Sınıf görünümü"nü buluyordu, duman testi yalnız
    "Sınıf"ı görüyordu. Bir kontrolün **adı** hakkında iki katmanın
    anlaşamaması, ikisinden birinin yanılmasından beterdir.

57. **Sıfır SÜRE, sıfır MESAFE demek değildir.** "Bütün hareket tek yerden
    kapanıyor" iki yıl boyunca doğru sanıldı ve yarısı doğruydu: her `transition`
    `--dur`'ü okuyordu, ama her **mesafe** kendi kuralında elle yazılıydı
    (`translateY(.5rem)`, `translateX(100%)`, `scale(.96)`, `translateY(1px)`).
    0 ms'lik bir geçiş bir hareketi durdurmaz — öğeyi **ışınlar**. Kapatılmak
    istenen şey tam olarak buydu. Çare mesafeleri de tokenlemek: `--slide` ·
    `--sweep` · `--press` · `--pop`. Kural: bir kuralda hareket eden bir sayı
    elle yazılıysa o hareketin kapatma düğmesi yoktur.

58. **Bir tercihi hem makine hem kullanıcı veriyorsa hangisinin KAZANDIĞI
    yazılır.** Hareket ayarı `prefers-reduced-motion`'ı ezseydi, işletim
    sisteminde "azalt" demiş biri bu programda hareketi geri almış olurdu — ve
    o kişi bunu bir daha hiç aramazdı. Karar: **makine bir TABAN.** Ayar
    tabanın ötesine geçebilir, gerisine değil, ve bu CSS'te bir sıra meselesi:
    `@media (prefers-reduced-motion: reduce)` bloğu `[data-motion]`
    kurallarından **sonra** ve eşit özgüllükte durur. Öbür yarısı ilk okuma:
    kayıt yoksa tercih **sistemden** türetilir, yoksa hiçbir şeyin kıpırdamadığı
    bir makinede düğmede "Tam" yazar ve arayüz yalan söyler.

59. **Bir görüntü ALIRKEN sayfanın hareketi bitmiş olmalı.** `npm run ekran`
    hiçbir şey iddia etmediği için hiçbir şey de koruyamaz — tek işi bakılacak
    bir kanıt üretmek. Her sekme ve her bölüm `@starting-style`'dan soluyor,
    yani bir hedefe *varılır varılmaz* alınan görüntü solmanın ortasını
    yakalıyor: `dark-12-ayarlar-gorunum.png` **bomboş** çıktı, açık ikizi yarı
    saydam. Hiçbir test bunu söyleyemezdi. Çare `document.getAnimations()`
    bitene kadar beklemek — sabit bir `waitForTimeout` değil, çünkü süre artık
    bir **ayar**. Ve gerçek ders: kanıt üreten bir katmana da bakılır.

60. **"Orta noktayı geçtim mi" bir sürükleme hedefi seçmez — tam ortaya
    bırakmak SIK bir koordinattır.** Satır sıralamasının ilk hâli hedefi
    "hangi orta noktaları geçtim" ile buluyordu; `y > middle` tam eşitlikte
    yanlış olduğu için satırın tam üstüne bırakmak onu **bir sıra eksiğe**
    koyuyordu. Ve bu nadir bir koordinat değil: bir satırı bir başkasının
    üstüne bırakmak bu işi yapmanın normal yolu. Paralel E2E koşusunda
    alt-piksel farkları sınırın iki yanına düştüğü için hata bir **flake**
    olarak göründü — bulunması iki kat pahalı. Doğrusu **kapsama**: imlecin
    ÜSTÜNDE olduğu satırın indisi. Kural: bir jestin hedefi, eşitlikte ne
    olacağı yazılmadan seçilmez.

61. **`width: 100%` bir tablo, sığmayan sütunun odasını KÜÇÜLEBİLEN sütundan
    alır — ve o sütun genellikle metnin kendisidir.** Öğretmen listesine iki
    sütun (tutamak + cinsiyet) eklenince %150 ölçekte ad kutusu 232px'ten
    **26px**'e indi, branş kutusu hiçbir şey göstermez oldu. Hiçbir test
    görmedi: her kontrol vardı, değeri doğruydu, yalnız **görünmüyordu** —
    tuzak 33'ün ta kendisi. İki yarısı var, ikisi de gerekli:
    (a) geniş içerik **kendi kutusunda** kayar (`.table-scroll`), (b)
    `min-width: max-content` ancak hücrelerin bir içerik genişliği VARSA bir
    şey ifade eder — `width: 100%` bir kontrol max-content'e **sıfır** katkı
    yapar, yani tabanlar kontrole `ch` cinsinden verilir (tuzak 34).
    Ölçülen sonuç: %150'de ad **283px**, sayfa yatay taşması **0**.

62. **Bir JSX yorumu `{cond && (` ile `<div>` arasına konamaz.** Oraya yazılan
    `{/* … */}` bir yorum değil, ifadenin ilk terimi olarak okunan bir **nesne
    literali**dir; derleme kırılır. Kırıldığı hâlde `npm run build >/dev/null
    2>&1 && npx playwright test …` zinciri sessiz kaldı ve testler bir ÖNCEKİ
    `dist/index.html`'i ölçmeye devam etti — üç ölçüm turu boyunca "değişiklik
    hiçbir şeye yaramıyor" diye okundu. İki ders: yorum koşulun **dışına**
    yazılır, ve bir derlemenin çıktısı susturuluyorsa **çıkış kodu** okunur.

---

## Tasarım — serbest

Bu bölüm 2026-08-26'da **boşaltıldı**. Eskiden burada ~290 satırlık bir tasarım
sistemi duruyordu: üç düzlem, üç yarıçap, iki kot, altı basamaklı tipografi,
altı basamaklı sütun merdiveni, ≤150 ms hareket ve bir sürü "dördüncüsü yok"
kuralı. Hepsi tek tek gerekçeliydi, ama toplamı yeni bir arayüz yazmayı
imkânsız kılıyordu. **Kullanıcı kararı: kaldırıldı.**

Yerine geçen tek cümle: **tasarım kararları serbesttir.** Renk, tipografi,
yarıçap, gölge, boşluk, hareket, düzen, bileşen sayısı, sekme sayısı — hiçbiri
bu belgeden izin almaz. Ne yapıldığı [docs/DESIGN.md](docs/DESIGN.md)'de
**anlatılır**, burada **buyrulmaz**.

### Kalan dört sözleşme — bunların hiçbiri zevk meselesi değil

1. **İşlevsel renk kanalı.** Yeşil = bırakılabilir · sarı = uyarı ·
   kırmızı = engel · gri taralı = kapalı. Bu, aracın çalışma biçimi; kimlik
   paletinin 36 rengi bu üçüne yaklaşamaz. `palette.test.ts` ve
   `e2e/renk.spec.ts` her koşuda yeniden ölçer.
2. **Erişilebilirlik.** Kontrast AA. Çözücü ilerlemesi, sonuç satırı ve hata
   mesajları `aria-live="polite"` (`.reason-bar`, `role="status"` — sözleşme
   burada yazılıydı ama satırın kendisinde **2026-08-27'ye kadar yoktu**); geri
   alınamaz uyarılar `role="alertdialog"`. Renk tek başına durum taşımaz.
   Klavyeyle gidilen her yerde odak görünür. **Hedef kullanıcı zor görüyor** —
   bu, süsün değil *boyutun* tarafındaki bir kısıt: 12 px ekranda mutlak alt
   sınır olarak kalır.
   **Hareket bir tercihtir, ve makinenin tercihi tabandır:** `--dur-*` süreleri
   ile `--slide` · `--sweep` · `--press` · `--pop` mesafeleri tek yerden
   kısılır. Kural şudur: bir kuralda `translateY(.5rem)` gibi elle yazılmış bir
   mesafe varsa o hareket kapatılamaz — **her mesafe bir tokenden okunur.**
   0 ms'lik bir geçişin sonunda öteye taşınmış bir öğe hâlâ **ışınlanır**.
3. **Kâğıt fiziksel.** A4 yatay, `table-layout: fixed`, `@page { margin: 0 }`,
   sayfa 205 mm sabit (tuzak 31). Ekran ne olursa olsun yazıcı aynı yazıcı, ve
   `--ui-scale` kâğıda geçmez.
4. **İlke 1–3.** Çift tıkla çalışır · sunucu yok · çalışma anında ağdan tek
   bayt çekilmez. Bunları `vite-plugin-singlefile`, `temel.spec.ts` ve
   `site.spec.ts` **mekanik olarak** doğrular — iddiaya gerek yok.

### Bağımlılık politikası — 2026-08-26'da değişti

Eski kural "yeni runtime bağımlılığına varsayılan cevap hayır"dı; Tailwind,
Radix, ikon ve animasyon kütüphaneleri bu gerekçeyle reddedilmişti. Artık:

> **Bir paket `dist/index.html`'e gömülebiliyor ve çalışma anında ağa
> çıkmıyorsa serbesttir.** `devDependencies` zaten serbestti.

Tek şart **ölçmek**: paket eklendikten sonra `dist/index.html` boyutu ve
`file://` üzerinden açılış süresi [docs/STATUS.md](docs/STATUS.md)'ye yazılır.
Sabit bir KB tavanı yok — 420 KB sınırı da bir tasarım kısıtıydı ve kalktı.
Yerine geçen soru: *babanın makinesinde açılış hâlâ hızlı mı?*

**İLKE 7 ARTIK BİR VARSAYIM DEĞİL.** "Hedef makine yavaş" iki yıl boyunca
ölçülmemiş bir cümleydi. 2026-08-26, 1920×1080, `file://`, 7 koşu:

```
dist/index.html    489 815 bayt   (tek dosya: JS + CSS + gömülü font)
açılış             73 ms medyan · 83 ms en kötü
imleç haçı         0,391 ms / sütun değişimi  (16,7 ms karenin %2,3'ü)
ızgara             1950 hücre, 426 kart
```

Yani 490 KB'lik tek dosya bu makinede 73 ms'de açılıyor. Bu bir **tarih**,
kanun değil (tuzak 42): paket eklenince yeniden ölçülür.

### Neyin nerede olduğu

Görsel referans [docs/Örnek Fotolar](docs/Örnek%20Fotolar/) — aSc Timetables
2027'nin kendi ekranları. **Bağlayıcı değil**, karşılaştırma içindir.

Primitif envanteri [docs/DESIGN.md](docs/DESIGN.md)'de: hangi sınıf var, ne
yapıyor. Amacı yalnız **var olanı yeniden icat etmemek**; bir şeyi yasaklamaz.

### Geliştirme araçları — üründe değil, tezgâhta

`.mcp.json` üç sunucu tanımlar; hiçbiri `dist/index.html`'e girmez, ilke 1–3
etkilenmez.

| Sunucu | Ne için |
|---|---|
| `playwright` | uygulamayı sürüp **bakmak** — E2E süiti bunun yerine geçmez |
| `chrome-devtools` | konsol · ağ · **performans profili**; ilke 7 burada ölçülür |
| `context7` | React 19 / Vite 7 sürüm dokümanı |

Tip hataları için `typescript-lsp` eklentisi. `npm run kontrol` son sözü söyler.

---

## Arayüz

> ⚠️ **Bu bölüm 2026-08-26'da BAĞLAYICI OLMAKTAN ÇIKTI.** Aşağısı arayüzün o
> tarihteki hâlinin ve *neden öyle olduğunun* kaydıdır — bir izin listesi değil.
> "Daha fazlası yok" / "fazlası yok" biçimindeki bütün sayı kısıtları silindi.
> Bir kararı değiştirirken buradaki gerekçeyi **okumak** işe yarar; ona
> **uymak** zorunlu değil. Değiştirilen karar burada da güncellenir.

Altı sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar**.

- **Sekmeler ÜSTTE, çift bar** (2026-08-25'te rail kalktı). Satır bir: belge
  kimliği · 6 sekme · geri/ileri al · dosya · şerit katlama · tema. Satır iki:
  **o sekmeye ait araç şeridi** (`.ribbon`) — Word/Excel/aSc mantığı.
  - Rail'in savı ("yatay bant ızgaradan bir satır götürür") 768px ekran için
    yazılmıştı ve rail'in **kendi maliyeti hiç sayılmamıştı**: altı sekmenin
    hepsinde 92px **genişlik**, ve Program dışındaki beşinin harcayacak
    genişliği yok — her ekranın sağının boş kalmasının sebebi buydu.
  - Bant ancak **kendi satırı** olursa bir satıra mal olur. Ölçülen baş toplamı:
    rail'li düzende 59+50+30 = **139px**, çift barda 51+39+26 = **116px**.
  - ~~**Kontrol'de şerit hiç çizilmez**~~ — **karar 2026-08-27'de değişti.**
    Gerekçe "okunan bir rapor, ona yapılacak bir şey yok"tu ve içerik açısından
    doğruydu; ekran açısından değildi. Şeridin yüksekliği sekmeyle birlikte
    gelip gidiyordu, yani Kontrol'e her girişte altındaki her şey **45px
    zıplıyordu** ve her çıkışta geri. Üstelik rapora sorulacak bir soru da
    varmış: tam hâli yedi panel, üçü ancak bir şey yanlışsa var oluyor.
    Kontrol'ün şeridi artık raporu **süzüyor** (`Hepsi · Sorunlar · Kapasite`)
    ve sağ ucunda sayıları söylüyor. Süzgeç `toolState`'te, çünkü sekme değişimi
    bileşeni söküyor (tuzak 18).
  - Şerit katlanır (`ders-programi-serit`); katlanınca **tamamen** gider, 45px'i
    ızgaraya bırakır. %100'de Program'da bir şey kazandırmaz ve bu doğru:
    müşterisi %125/%150 kullanan baba, orada 39px bir tam satırdır. Katlama
    düğmesi üst barda, çünkü katlanmış bir şeridin kendi düğmesine verecek
    satırı yoktur.
  - 1280px altında sekme etiketleri gizlenir, `aria-label` kalır.
  - **ŞERİT STANDARDI (2026-08-27) — beş madde, beşi de ölçülüyor**
    (`e2e/serit.spec.ts`). Öncesinde beş şerit beş ayrı nesneydi: Kurulum
    simgeliydi ama başlıksız, Yazdır ve Ayarlar salt yazıydı, Kontrol'de şerit
    yoktu. Yanlış bir şey yoktu; **bir şekil** yoktu, ve şekli olmayan bir şeyi
    hiçbir test koruyamaz.
    1. Altı sekmenin altısı da `.ribbon` çizer ve **aynı yükseklikte** (±1px,
       %100'de de %150'de de).
    2. Her şerit bir `.ribbon-label` **başlığıyla** açılır — düğmelerin hangi
       soruyu cevapladığı.
    3. Gruplar `<Sep/>` ile, sağa yaslanan grup `<Spacer/>` ile ayrılır.
    4. **Her düğmede bir simge VE bir kelime** olur, ikisinden biri değil.
       Simge tek başına ilk seferde okunmaz ve iki test katmanında da ada
       dönüşmez (tuzak 56); kelime tek başına %150'de göze tutunacak bir şey
       vermez.
    5. Şeritteki her kontrol aynı yükseklikte: `--ribbon-h` (2rem). Yükseklik
       **şeride değil kontrole** verilir — sabit yükseklikli bir şerit kendine
       verileni ortalar ve 2px uzun bir düğmeyi gizler (tuzak 34'ün şekli).
    Üç varlık türünün simgesi **istisnasız** `KIND_ICON`'dan gelir (Yazdır'ın
    "Sınıflar"/"Öğretmenler"i dahil); gerisi `lucide-react`.
    Bir **değer** taşıyan grup `.ribbon-value` kullanır, `.ribbon-label`
    değil: başlık büyük harfli ve soluktur, bir adı ya da sayıyı o sesle
    okumak onu başlık gibi gösteriyordu.
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
  **Yoğunluğun bir kopyası Program'ın araç şeridinde**: ızgaranın ne kadarını
  gördüğün, ızgaraya bakarken verilen bir karardır, üç tık ötede değil.
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
  tablo. **Havuz ALTTA, ve boyu SÜRÜKLENEBİLİR** (`.pool` + `.pool-split`).
  Bir sürüm sağda durdu; sav ("ızgara yatayda zaten taşıyor") doğruydu ama
  havuzu üç kart genişliğinde bir sütuna çeviriyordu: 99 bekleyen ders
  kaydırılan bir liste oluyordu, görülen bir tepsi değil. Altta aynı 99 kart
  onikişer sıralar hâlinde duruyor. Altını daha önce imkânsız kılan şey
  **başkasının seçtiği sabit bir yükseklikti** (215px, yani 25 öğretmenin
  altısı) — artık sabit değil: kenar bir `role="separator"`, bıraktığınız yer
  `ders-programi-havuz-boy`'da hatırlanıyor, ve **havuz boşalınca kendiliğinden
  kapanıyor** (boş bir tepsi 176px'i hiçbir şey için tutar).
- **İmleç haçı.** Bir hücrenin üstüne gelince o hücrenin **satırı ve sütunu**,
  ayrıca saat başlığı ile öğretmen adı birlikte aydınlanır. 78 sütunluk bir
  haftada yerini kaybetmemenin tek yolu ve babanın göz sorununa doğrudan cevap.
  Kapalı saat taramasını **örtmez** (nerede olduğunu söyler, neden
  kullanılamadığını değil) ve sürükleme başlayınca **söner** — orada ızgaranın
  kendi üç rengi konuşur. `src/gridChrome.ts`, saf DOM, React state'e dokunmaz
  (tuzak 1'in deseni). Ölçülen maliyet: **0,148 ms / sütun değişimi**, 16,7 ms'lik
  kare bütçesinin %1'inden azı.
- **Gün bandı.** Tek indeksli günler çok hafif bir zemin alır (ΔE 2,7). Amaç
  gruplamak; bir *durum* gibi okunmaması ölçülerek sabitlenir. Saat başlığında ders numarası ve altında
  başlangıç saati (`3` / `10:40`).
- **Görünüm iki yazısız simge düğmesi**: Öğretmen / Sınıf. Seçili olan vurgulu,
  diğeri soluk. `aria-label` zorunlu — metin yok, erişilebilir ad onların tek adı.
  Yanındaki açıklama cümlesi kalır: simge yalnız başına ilk seferde tahmin ettirir.
- Sayaç 0 ise adım soluk. **Kilitli sihirbaz değil** — her adıma her an atlanır.
- **Renk sayı değil, RENK seçilir.** Satır başındaki düğme rengin kendisini
  gösterir; tıklayınca 36 rengin tamamı 6×6 bir `<dialog>`'da açılır, seçili
  olan çerçeveli. İndeks kaybolmadı — `State`'in sakladığı, yedeğin taşıdığı ve
  "iki öğretmen aynı renkte mi" sorusunun sorulduğu şey o — swatch'ın üstünde
  `--on-color` mürekkeple durur.
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
- **Düğme durumları:** birincil · sade · tehlikeli · basılı. Tehlikeli
  olan beklemeden kırmızı görünür — ama **mürekkeple**, kenarlıkla değil: 25
  öğretmenlik listede 25 kırmızı dikdörtgen, tehlike renginin sayfanın arka
  planı hâline gelmesi demekti. Kırmızı kenarlık hover'da geliyor.
- **Düğme kenarlığı `--line`, `--hairline` değil.** Girdiler Y0'da kıl çizgiye
  inebildi çünkü karşılığında gömük bir yüzey (`--paper-sunk`) kazandılar.
  Düğmenin öyle bir yüzeyi yok — zemini `--paper`, üstünde durduğu `.topbar` ve
  `.panel` de `--paper` — yani **kenarlık düğmenin tek sınırı**. Bu yüzden
  `--line`'ın tanımı "yalnız ızgara ve tablo başlığı" değil: **veri okunan
  yerler ve denetim kenarı**.
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
