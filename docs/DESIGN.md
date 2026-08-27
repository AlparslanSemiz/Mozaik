# DESIGN.md — envanter

Bu dosya neyin **var olduğunu** söyler. Neyin **yasak** olduğunu söylemez —
tasarım kısıtları 2026-08-26'da kaldırıldı ([CLAUDE.md](../CLAUDE.md) →
*"Tasarım — serbest"*). Amacı tek: var olan `.panel`'i yeniden icat etmemek.

Tek doğru kaynak [../src/styles.css](../src/styles.css); burası ona bakmadan
önce bakılacak yer.

---

## Yürürlükteki dört sözleşme

Hiçbiri zevk değil, o yüzden hiçbiri "envanter" değil — gerekçeleri
CLAUDE.md'de, ölçümleri testte.

| # | Ne | Nerede ölçülüyor |
|---|---|---|
| 1 | **İşlevsel renk kanalı** — yeşil bırakılabilir · sarı uyarı · kırmızı engel · gri taralı kapalı | `palette.test.ts`, `e2e/renk.spec.ts` |
| 2 | **Erişilebilirlik** — AA kontrast, görünür odak, `aria-live`, ekranda 12 px taban | `e2e/renk.spec.ts`, `e2e/renk-secici.spec.ts`, `e2e/bos-ekran.spec.ts` |
| 3 | **Kâğıt fiziksel** — A4 yatay, `@page { margin: 0 }`, sayfa 205 mm | `e2e/yazdir.spec.ts` |
| 4 | **İlke 1–3** — çift tıkla çalışır, sunucu yok, çalışma anında ağa çıkmaz | `e2e/temel.spec.ts`, `e2e/site.spec.ts` |

---

## Ölçülenler (2026-08-26)

Bunlar birer **tarih**, kanun değil (tuzak 42). Dokunulan mekanizma değişince
yeniden ölçülür.

```
dist/index.html            489 815 bayt   (tek dosya, gömülü font + JS + CSS)
file:// açılışı             73 ms medyan, 83 ms en kötü (7 koşu, 1920×1080)
imleç haçı                 0,391 ms / sütun değişimi   (16,7 ms karenin %2,3'ü)
ızgara                     1950 hücre, 426 kart
kâğıt parlaklığı           1.000 açık / 0.017 koyu     (sözleşme >0,9 / <0,1)
metin / kâğıt              17,47 / 13,26
accent / kâğıt              7,47 / 7,82
sekme rengi en düşük AA     5,63 / 4,89
sekme ↔ işlevsel en düşük  52,5 / 49,9  ΔE               (sözleşme >32)
```

### E turu (2026-08-26) — hareket, satır önizlemesi, bölüm rengi

```
dist/index.html            492 421 bayt   (+2 606; sündürme, önizleme, simgeler)
file:// açılışı            139 ms medyan  — TEMEL 138 ms, yani fark yok.
                           73 ms'lik eski sayıyla karşılaştırılamaz: o başka
                           bir yöntemle alınmıştı. Aynı betikle ölçülen tek
                           dürüst karşılaştırma öncesi/sonrası.
sekme geçişinden sonra     68 ms   ızgara tıklanabilir oluyor
  (startViewTransition ile ölçülen: 553 ms — bu yüzden alınmadı, tuzak 55)
sekme çifti en düşük ΔE     16,0 → 20,5   (açık tema; eşik >12)
sekme ↔ işlevsel en düşük  52,5 (değişmedi)
--on-accent / bölüm rengi   5,63 açık · 6,02 koyu       (sözleşme >=4,5)
satır önizlemesi ↔ kâğıt   18,6 / 20,6 / 11,8  ΔE  (açık)
                           21,8 / 23,2 / 15,2      (koyu)
olur ↔ olmaz ayrımı        23,8 açık · 28,3 koyu   ΔE
```

**Fıstık yeşili ve turuncu ölçüldü ve ALINMADI.** 360 hue taraması: 80–140
bandında kâğıtta 4,5:1 tutan ve `--ok`'a ΔE > 32 kalan **hiçbir renk yok**
(en iyisi 28,6); turuncunun tamamı `--bad`/`--warn`'a 21–28. Yeşilin üçte biri
ve sıcak yarı işlevsel kanalın; **altı sekme kalan yasal alanı zaten
dolduruyordu** ve 2026-08-27'de yedinci arandığında bu cümle harfiyen doğru
çıktı: taranan her serbest yay ya işlevsel bir rengin ailesine (turuncu 19 →
`--warn`/`--bad`, limon 70 → `--ok`) ya komşu bir sekmenin ailesine düşüyordu
(çivit 257 → Kontrol, orkide 316 → Yazdır). Yedincisi Yazdır'ın pembesiyle
kırmızılar arasındaki gülden alındı ve öteki altının açıklığına **çekildi**:
oradaki ilk aday (`#ff386a`) `--bad` gibi okunacak kadar sıcaktı.
Turkuaz istendi ve **zaten Program'ın rengi**.

**İlke 7 artık bir varsayım değil.** "Hedef makine yavaş" deniyordu ve hiç
ölçülmemişti: 490 KB'lik tek dosya `file://` üzerinden 73 ms'de açılıyor.

---

## Token'lar

Nötr rampa **türetilmiş**: tek hue (258), seçilen OKLCH açıklığı ve chroma'sı,
çevrimdışı sRGB'ye çevrilmiş. Dosyaya **hex** yazılıyor, çünkü
`getComputedStyle` bir `oklch()` rengini `oklch()` olarak seriye diziyor ve
süitteki her ölçüm `rgb()` ayrıştırıyor.

```
yüzey        --bg masa · --chrome kabuk · --chrome-2 ikinci kabuk
             --chrome-lit üst barın gradyan durağı · --paper kâğıt
             --paper-sunk girdi · --band ızgara gün bandı
çizgi        --hairline kabuk · --line denetim kenarı · --line-dark en yüksek ses
mürekkep     --text · --muted · --on-color (temayla DÖNMEZ) · --on-color-sub
accent       --accent #373bdb · --accent-hover · --accent-bg · --on-accent
işlevsel     --ok/-bg · --warn/-bg · --bad/-bg · --closed · --hatch
bırakma      --drop-ok-bg · --drop-warn-bg · --drop-bad-bg  (dinlenme
             renklerinden AYRI: biri bir jest boyu yaşar, öteki gün boyu)
satır        --can-ok-bg · --can-warn-bg · --can-no-bg  (aynı üçünün ZAYIF
             hâli: imlecin altındaki hücre değil, hedef satırın tamamı)
bölüm        --sec-setup · -availability · -program · -check · -print · -settings
             ve `[data-section]` bunlardan birini --sec'e bağlar
kot          --elev-0 … --elev-4   (düz · kâğıt · yükseltilmiş kabuk ·
                                    diyalog/panel · sürükleme hayaleti)
yarıçap      --r-xs 3 · --r-sm 5 · --r-md 8 · --r-lg 14 · --r-xl 20 · --r-full
tipografi    --fs-2xs .6875rem … --fs-3xl 2.25rem   (9 basamak, ekran tabanı 12px)
kâğıt        --fs-p-xs 8pt … --fs-p-xl 17pt         (pt, ölçekten etkilenmez)
tracking     --ls-tight · --ls-tighter · --ls-caps
satır        --lh-tight 1.2 · --lh-base 1.5 · --lh-head 1.25
boşluk       --space-1 … --space-8   (rem)
hareket      --dur-fast 110ms · --dur 180ms · --dur-slow 280ms   (SÜRE)
             --slide .5rem · --sweep 100% · --press 1px · --pop .97  (MESAFE)
             --ease · --ease-out · --ease-spring
             [data-motion="az"]     → süreler yarı, mesafeler 0
             [data-motion="kapali"] → hepsi 0
             prefers-reduced-motion → hepsi 0, ve bu bir TABAN: ayar onu ezemez
şerit        --ribbon-h 2rem   (şeritteki her kontrolün yüksekliği)
odak         --focus-ring (iki halka: kâğıt boşluğu + accent)
sütun        --w-col-xs 8ch … --w-col-2xl 32ch
geometri     --cell-w/-h · --rowhead-w · --dock-w   (rem)
ölçek        --ui-scale, VARSAYILAN 1.10, aralık 1.00–1.50
```

**Süre bir tokendi, MESAFE değildi — 2026-08-27'de o da oldu.** Her `transition`
`--dur`'ü okuyordu ama her hareket kendi kuralında elle yazılıydı
(`translateY(.5rem)`, `translateX(100%)`, `scale(.96)`). 0 ms'lik bir geçiş bir
öğeyi durdurmaz, **ışınlar** — yani "hepsi tek yerden kapanıyor" yarı doğruydu.
Kural: **hareket eden hiçbir sayı bir kuralın içine yazılmaz**, dört mesafe
tokeninden biri okunur (tuzak 57).

**Hareket kütüphanesi yok, ve bu bir yasak değil bir ölçüm:** `motion` kuruldu,
127 KB çıktı, ve CSS'in yapamadığı tek getirisi (`layoutId`) tarayıcının
`document.startViewTransition()`'ında bedava — **ki o da kullanılmıyor**, çünkü
ölçüldü ve hit-testing'i 553 ms dondurduğu görüldü (tuzak 55). `@starting-style`,
`transition-behavior: allow-discrete`, `oklch()`, `color-mix()`,
`backdrop-filter`, `position-anchor` — hepsi `file://` altında Chromium'da
ölçülerek doğrulandı.

---

## Primitifler

### Kabuk
| Sınıf | İş |
|---|---|
| `.app` `.workspace` `.main` | kök sütun · içerik alanı · kaydırma kutusu. `data-section` **kökte** (tuzak 52); `.main`'de `key={tab}` var, geçiş `@starting-style` |
| `.scroll-fade` + `.faded-top` `.faded-bot` | kayan kutunun üstünde/altında içerik olduğunu söyler (`scrollFade.ts`). `.grid-wrap`'e UYGULANMAZ (tuzak 54) |
| `.topbar` | tek satır. Üstünde 4px'lik **bölüm rengi**, içinde o rengin %10 washı |
| `.tabstrip` `.tab` `.tab-label` | seçili sekme bölüm rengiyle **dolu**. `flex: 0 0` — asla kırpılmaz |
| `.health` `.health-dot` `.health-text` | **durum çipi**: her sekmede, sorunu ADLANDIRIR. Yer daralınca noktasına iner |
| `.panel-head` | başlık + tek bir kontrol (üç Kurulum panelinde ve Dersler'de "Excel'den yapıştır"). `baseline` hizalı, sarabilir |
| `.ribbon` `.ribbon-sep` `.ribbon-label` `.ribbon-value` | sekmenin araçları, **yedi sekmede de**. Basılı kontrol `--sec` giyer. `-label` bir grubun BAŞLIĞI (büyük harf, soluk), `-value` bir grubun DEĞERİ (normal, tam mürekkep) |
| `.topbar-doc` `.app-title` `.plan-picker` | hangi belge açık |
| `.btn-group` `.topbar-sep` `.spacer` | bitişik düğme kümesi · ayraç · itici |

### Kontroller
| Sınıf | İş |
|---|---|
| `.btn` + `.primary` `.danger` `.danger-solid` `.icon` `.link` | `.danger` mürekkeple, `.danger-solid` yalnız diyalogda |
| `.field` `.field-label` `.form-row` (+`.nowrap`) | etiketli kontrol · bir satırda duranlar |
| `.num` `.text-sm` `.clock-pick` `.sort-pick` | boyutlanmış girdiler |
| `.color-pick` + `dialog.color-dialog` `.swatches` `.swatch` | 36 renk, 6×6 |
| `table.list` + `th.num` `td.num` | veri tablosu |
| `.chip` `.chip-count` `.chips` | grup süzgeci — sayısı üstünde yazan |
| `.search` `.search-box` `.search-clear` | arama kutusu (kabuk sarmalayıcıda) |
| `.list-tools` `.list-count` | listenin üstündeki şerit |

### Katmanlar
| Sınıf | İş |
|---|---|
| `.dlg` `.dlg-overlay` `.dlg-head` `.dlg-icon` `.dlg-title` `.dlg-body` `.dlg-actions` | **her soru**: `useDialogs()` → `confirm` / `alert` |
| `.sheet` `.sheet-mark` `.sheet-title` `.sheet-facts` `.sheet-week` | **varlık paneli**: bir öğretmenin/sınıfın/dersliğin kendi haftası. Sağdan KAYAR (solmaz — altından 1950 hücre geçiyor) |
| `.palette` `.palette-row` `.palette-group` `.palette-hint` `kbd` | **Ctrl+K** |
| `.toasts` `.toast` `.toast-close` | olan biteni söyleyen kısa satır |

### Izgara
| Sınıf | İş |
|---|---|
| `.grid` `.row-head` `.corner` `.day-head` `.hour-clock` `.day-first` | iskelet |
| `.break-col` | öğle arası — `data-day`/`data-hour` **taşımaz** (tuzak 13) |
| `.card` `.card-top` `.card-bottom` `.card.conflict` | yerleşmiş ders |
| `.band` | tek indeksli günün zemini — asla bir DURUM değil (tuzak 40) |
| `.block-cont` `.block-in` | bloğun iki yarısı |
| `.col-hot` · `tr:hover` | imleç haçı (`gridChrome.ts`, saf DOM) |
| `.ghost` `.grid.dragging` | sürükleme hayaleti |
| `.can-ok` `.can-warn` `.can-no` | hedef satırın TAMAMI, sürükleme başında bir kez (`drag.ts`) |
| `.drop-ok` `.drop-warn` `.drop-blocked` | imlecin altındaki blok — zayıf katmanı ezer |
| `.pool` `.pool-split` `.pool-card` … | havuz çekmecesi, boyu sürüklenir |
| `.pool-stack` · `.stack-badge` | aynı dersin aynı boydaki blokları TEK deste; en çok iki katman görünür, gerisini rozet söyler (`1 saat ×6`). `.pool-card` sayısı DEĞİŞMEZ — deste bir düzen, bir gruplama değil |
| `.pool-card .card-size` · `.pool-card[data-size='2']` | kartın kaç saat olduğu: yazıyla ve **iki kat genişlikle**. Bir ders birden çok kart bırakır (`2+1` → bir ikili, bir tekli), ve hangisinin sürüklendiği kaç hücrenin yanacağını belirler |
| `.inspect` | bir adı varlık paneline bağlayan bağlantı |

### Kurulum · Müsaitlik · Baskı
| Sınıf | İş |
|---|---|
| `.step` `.step-no` `.step-count` `.step-icon` | üç adım, ribbon'un içinde. Dersler 2026-08-27'de kendi sekmesine çıktı |
| `.split-pick` | Dersler'deki dağılım seçicisi. **Kendi genişliği YOK** (`width: auto`): etiketleri saatle büyüyor (`2+1` üç karakter, on bir tek saat yirmi bir), sabit bir genişlik %150'de `1+1+1+1+` çizmişti. Sınıf `<select>`'in **kendi üstünde**, yoksa `table.list td > select { width: 100% }` onu yener (tuzak 34) |
| `.intro-line` · `.btn.quiet` | Kurulum'da ilk kullanımda çıkan tek satırlık örnek veri ipucu, ve onu kapatan sessiz düğme — teklifin yanındaki eşit ağırlıkta ikinci bir düğme, bir kapatmayı bir karara çevirirdi |
| `.entity-list` `.entity` `.entity-icon` | müsaitlikte varlık seçimi; simge `steps.tsx`'in `KIND_ICON`'undan |
| `table.availability` (+`.heat`) | boyanan çizelge + haftanın darlığı ısı haritası |
| `.pickers` `.pick-list` `.pick-item` | hangi sayfalar basılacak |
| `.print-area` `.print-page` `.p-title-main` `.p-daycol` … | kâğıt. Ekranda `.print-page` masaya konmuş bir **sayfadır** (A4 yatay oranında taban, gölge, 62rem tavan); `@media print` bu süslerin hepsini geri alır |
| `.panel` `.panel.inset` `.panel-grid` `.cols` (+`wide-left`) | yüzeyler ve düzen |
| `.empty-screen` `.badge` `.hint` `.reason-bar` `.warn-box` … | geri bildirim |

---

## Makine tercihleri

Hiçbiri `State`'e girmez, hiçbiri yedeğe yazılmaz, hepsi
**Ayarlar → Veri → "Veriler nerede"** tablosunda sayılır.

| Anahtar | Ne |
|---|---|
| `ders-programi-tema` | açık / koyu |
| `ders-programi-olcek` | `--ui-scale` (varsayılan 1.10) |
| `ders-programi-yogunluk` | Ferah / Rahat / Sığdır |
| `ders-programi-havuz` · `-havuz-boy` | çekmece açık mı, boyu (rem) |
| `ders-programi-serit` | araç şeridi açık mı |
| `ders-programi-musaitlik-saat` | müsaitlikte saat yazsın mı (varsayılan **kapalı**) |
| `ders-programi-kenar` | *(tarihsel — rail kalktı)* |

---

## Yeni ekran kurarken

1. **Sekmenin araçları ribbon'a mı?** "Şu an neye bakıyorum" ve "tek tıkla ne
   yaparım" şeride; liste, sayaç ve açıklama panelde. Aracın durumu şeride
   çıkıyorsa `src/toolState.ts`'e taşınır (tuzak 18).
   **Şeridin şekli sabittir** ve `e2e/serit.spec.ts` beş maddesini de ölçer:
   başlıkla açılır · gruplar `Sep`/`Spacer` ile bölünür · her düğmede simge VE
   kelime · her kontrol `--ribbon-h` yüksekliğinde · yedi sekmede de var.
   Üç varlık türünün simgesi `KIND_ICON`'dan gelir, istisnasız.
2. Yüzey `.panel`, düzen `.cols` ya da akan `.panel-grid`.
3. Soru soracaksan `useDialogs()`. `window.confirm` **yok**.
4. Bir şey olduğunu söyleyeceksen `useToast()`.
5. Bir varlık adı yazıyorsan `.inspect` + `useInspect()` — panel bedava gelir.
6. Uzun bir liste çiziyorsan `ListTools` + `src/listview.ts`.
7. Izgaraya hücre eklediysen: `data-day`/`data-hour` taşıyor mu, taşımalı mı?
8. Hareket eden bir sayı yazdıysan: dört mesafe tokeninden biri mi
   (`--slide`/`--sweep`/`--press`/`--pop`)? Değilse kapatılamaz (tuzak 57).
9. `npm run kontrol` + `npm run ekran` — **çıktıyı göster, iddia etme.** Ve
   `npm run cozucu`: `kontrol`'ün dışında ve gerileme yakalıyor.
