# DESIGN.md — primitif haritası

CLAUDE.md "Tasarım sistemi" bölümü **kuralları** söyler (merdivenler, yasaklar,
gerekçeler). Bu dosya **envanteri** söyler: hangi primitif var, nerede yaşıyor,
yeni bir ekran kurarken hangisini yeniden kullanacaksın.

> Buradaki tek amaç: var olan `.panel`'i yeniden icat etmemek. Bir ekran
> kurarken önce bu listeye bakılır; listede karşılığı olan şey **yeniden
> yazılmaz**. Yeni bir primitif gerekiyorsa önce burada tartışılır, sonra
> `src/styles.css`'e girer ve buraya bir satır eklenir.

Kaynaklar: [src/styles.css](../src/styles.css) (tek stil dosyası) ·
[CLAUDE.md](../CLAUDE.md) (kurallar) · [docs/Örnek Fotolar](Örnek%20Fotolar/)
(aSc Timetables 2027 ekran görüntüleri — referans budur, "beğenilen siteler" değil)

---

## Ölçek eksenleri — üç tane, karıştırılmaz

| Eksen | Nerede saklanır | Neyi değiştirir | Kâğıda etkisi |
|---|---|---|---|
| `--ui-scale` | `ders-programi-olcek` | EKRANIN tamamı, ızgara dahil (1.0–**1.50**, 11 basamak) | **yok** (`@media print` 1'e sabitler) |
| yoğunluk | `ders-programi-yogunluk` | hücrenin NE gösterdiği (Rahat / Sığdır) | **yok** (saatler kâğıtta hep yazar) |
| havuz açık mı | `ders-programi-havuz` | çekmece açık mı — ızgaranın **yüksekliği** | **yok** |
| havuz boyu | `ders-programi-havuz-boy` | çekmecenin yüksekliği, **rem** (6–22, 0.25 adım) | **yok** |
| araç şeridi | `ders-programi-serit` | şerit çiziliyor mu — ızgaraya 39px | **yok** |
| kâğıt | — | `--fs-p-*`, pt cinsinden, kendi merdiveni | tek etkileyen budur |

`--grid-zoom` diye bir şey **yoktur** ve eklenmeyecek.

**Havuz boyu neden rem:** `--ui-scale` %150'ye çıkınca sabit px'lik bir çekmece
görsel olarak küçülür, içindeki kartlar büyümüşken. Tavan da sabit rem değil:
`clamp(6rem, var(--dock-h), min(22rem, 100% - 26rem))` — %150'de bağlayıcı olan
ikinci terimdir, çünkü satırlar büyümüş ve kaydedilen rem büyümemiştir.
`maxDockHeight()` (`src/poolSplit.ts`) aynı tavanı JS'te hesaplar ki
`aria-valuemax` yalan söylemesin.

## Token merdivenleri — tam liste

Ham `px` font-size, ham `px` padding/margin/gap ve JSX'te `style={{width}}`
**yasak**. İstisna: `paletteColor()` dönen dinamik `background`.

```
yüzey              --bg masa · --chrome kabuk (üst bar, havuz) · --chrome-2 ikinci
                   kabuk (araç şeridi) · --chrome-lit üst barın gradyan üst durağı
                   · --paper kâğıt · --paper-sunk girdi
                   --band ızgara gün bandı (ΔE 2.7 — asla bir DURUM değil)
tipografi (ekran)  --fs-xs .75rem · --fs-sm .8125 · --fs-md .875 · --fs-base 1rem
                   · --fs-lg 1.125 · --fs-xl 1.375        alt sınır 12px, altı YASAK
tracking           --ls-tight -.011em (başlık) · --ls-caps .06em (büyük harf etiket)
tipografi (kâğıt)  --fs-p-xs 7pt · --fs-p-sm 8 · --fs-p-base 8.5 · --fs-p-md 9
                   · --fs-p-lg 10 · --fs-p-xl 14
satır yüksekliği   --lh-tight 1.2 (ızgara, tablo) · --lh-base 1.5 · --lh-head 1.25
boşluk             --space-1..7                            hepsi rem
yarıçap            --r-sm 4px veri · --r-md 7px denetim · --r-lg 12px DÜZLEM
                   dördüncüsü YOK
kot                --elev-1 kâğıt · --elev-2 gerçekten yüzen üç şey
                   (hayalet, diyalog, kaydırılmış yapışkan başlık). Üçüncüsü YOK
hareket            --dur 140ms (çekmece, düzlem) · --dur-fast 90ms (denetimin
                   hover/focus/pressed hâli) · --ease cubic-bezier(.2,0,0,1)
                   prefers-reduced-motion → ikisi de 0ms, HER geçiş kapanır
sütun              --w-col-xs 8ch · sm 10 · md 13 · lg 16 · xl 26 · 2xl 32
geometri           --cell-w/-h · --rail-w · --rowhead-w · --dock-w   hepsi rem
yazı tipi          IBM Plex Sans, değişken (wght 400–600), 225 glif, 23 KB,
                   base64 gömülü. font-display: BLOCK (tuzak 38)
```

**`ch` puntoyla orantılı değildir** (tuzak 39): Plex'te 1ch 12px'te 7.00px,
15px'te 9.00px. Bir kutunun ölçekle doğru büyüdüğünü iddia eden test **ch
sayısını** sayar, piksel oranını değil.

**Sütun merdiveninin birimi bağlama göre değişir ve bu doğrudur** (tuzak 34):
basamaklar `<th>` üstünde durur → birim başlığın ch'si (`--fs-xs`, 1ch ≈ 6.86px).
Kutu genişliği (`.num`, `.text-sm`, `.color-pick`) kontrolün kendisinde durur →
birim gövdenin ch'si (1ch ≈ 9.15px). Aynı ~70px'e `10ch` ve `8ch` düşer.

## Renk

`src/palette.ts` — 36 renk, düz hex, **hiçbir şey import etmez**. Elle seçilmedi,
kontrast ve CIE Lab ayrımı kısıtları altında **arandı**; `palette.test.ts` her
koşuda yeniden ölçer (en yakın çift ΔE 17.5, kontrast 7.3:1).

> **2026-08-25:** tasarım dili yeniden açıldı, yani palet de değiştirilebilir —
> ama `palette.test.ts` **sözleşmedir**. Yeni bir palet (OKLCH türetmesi dahil)
> aynı iki kısıtı geçmek zorunda: her çift arasında yeterli CIE Lab ΔE, ve
> `--on-color` mürekkebine karşı kontrast. Tek bir `--brand-hue`'dan türetilen
> 36 renk bu ölçüyü **geçemez** (aynı tonun 36 tonu birbirinden ayrılamaz) —
> yani türetme yapılacaksa çok-eksenli olmalı. Eşiği düşürmek ya da testi
> silmek bir tasarım kararı değildir. Palet iki temada ve kâğıtta aynıdır;
> CSS değişkeni olmamasının sebebi bu.

Semantik token'lar (`--ok`, `--warn`, `--bad`, `--accent`, `--closed`, `--hatch`)
koyu temada yeniden tanımlanır; palet **tanımlanmaz**. Palet rengi taşıyan her
öğe `--on-color` almak zorundadır (tuzak 15 ve 35): `.card`, `.pool-card`,
`.ghost`, `.color-pick`.

---

## Primitifler — yeniden kullanılacaklar

### Kabuk — ÇİFT BAR (2026-08-25'te rail kalktı)
| Sınıf | İş |
|---|---|
| `.app` | kök **sütun**: üst bar → araç şeridi → workspace |
| `.topbar` | tek satır: belge kimliği · 6 sekme · geri/ileri · dosya · şerit · tema. Dosyadaki **tek gradyan** burada (%2, koyu temada kapalı) |
| `.tabstrip` `.tab` `.tab-label` | yatay sekme şeridi. Seçili sekme `--paper` üstünde bir **yaprak** (`--elev-1`); 1280px altında etiketler gizlenir, `aria-label` kalır |
| `.ribbon` `.ribbon-sep` `.ribbon-label` | sekmeye özel araç şeridi, `--chrome-2` üstünde. Kontrol'de **hiç çizilmez**; `ders-programi-serit` ile katlanır ve o zaman da hiç çizilmez |
| `.topbar-doc` `.plan-picker` | hangi belge açık — `--paper` üstünde tek nesne |
| `.topbar-sep` `.spacer` | çubuk içi ayraç, itici |
| `.workspace` `.main` `.main.no-overflow` | içerik alanı |

> **Rail neden kalktı:** "yatay bir bant ızgaradan bir satır götürür" savı 768px
> ekran için yazılmıştı ve bu ekran için yanlış ölçülmüştü — rail her sekmede
> 92px **genişlik** yiyordu, ve Program dışındaki beş sekmenin harcayacak
> genişliği yok. Bant ancak kendi satırı olursa bir satıra mal olur; bu bant
> kimlik/sekme/geçmiş/dosya ile **aynı** satırı paylaşıyor. Ölçülen: baş toplamı
> 139px → **116px**, yani rail'li düzenden *daha kısa*.

### Düzen
| Sınıf | İş |
|---|---|
| `.cols` + `.wide-left` / `.narrow-right` | **tek düzen kuralı**: solda iş, sağda o ekranın anlamı |
| `.panel` | yüzey. `.panel.inset` iç içe (Excel yapıştırma kutusu) |
| `.panel-grid` | akan kart ızgarası (Kontrol) — sabit iki sütun değil |
| `.scroll-x` `.grid-wrap` | yatay kaydırma; `.grid-wrap` bir **container** (`100cqw`) |

### Kontroller
| Sınıf | İş |
|---|---|
| `.btn` + `.primary` / `.danger` / `.icon` | **dört durum, fazlası yok** (basılı = `aria-pressed`) |
| `.view-switch` `.theme-toggle` | iki konumlu düğme ikilisi; `aria-label` zorunlu |
| `.field` `.field-label` `.field-wide` | etiketli tek kontrol |
| `.form-row` + `.nowrap` / `.spaced` | bir satırda duran kontroller |
| `.num` `.text-sm` `.clock-pick` | boyutlanmış girdiler — genişlik CSS'te |
| `.color-pick` + `dialog.color-dialog` `.swatches` `.swatch` | renk: sayı değil, rengin kendisi. 36 swatch, 6×6 |
| `.topbar-doc` `.btn-group` `.rail-btn` | üst çubuğun belge kimliği · bitişik düğme kümesi · ray dibindeki makine ayarları |
| `table.list` + `th.num` `td.num` | veri tablosu; sütun genişliği `<th>`'de |

### Geri bildirim
| Sınıf | İş |
|---|---|
| `.reason-bar` + `.ok` / `.warn` / `.bad` / `.busy` | **sabit yükseklikli** — ızgarayı kaydırmaz. Çözücü ilerlemesi de burada, düz metin |
| `.hint` + `.bad` / `.inline` · `.warn-box` `.error-box` `.ok-box` | satır içi ve kutulu mesaj |
| `.badge` + `.ok` / `.tight` / `.impossible` | sayılabilir durum rozeti |
| `.empty-screen` | boş durum — **yönlendirir**, "henüz yok" demez |

### Izgara
| Sınıf | İş |
|---|---|
| `.grid` `.row-head` `.corner` `.day-head` `.hour-clock` `.day-first` | tablo iskeleti |
| `.break-col` | öğle arası ayracı — `data-day`/`data-hour` **taşımaz** (tuzak 13) |
| `.card` `.card-top` `.card-bottom` `.card.conflict` | yerleşmiş ders — hücreyi 1px iç boşlukla dolduran NESNE |
| `.band` | tek indeksli günün zemini. Hem `td` hem `th` alır; `data-day` parite seçicisi DEĞİL, çünkü başlık `data-day` taşıyamaz (tuzak 13) |
| `.block-cont` `.block-in` | bir bloğun iki yarısı — birbirine bakan köşeler ve aradaki boşluk kalkar |
| `.col-hot` · `tr:hover` | imleç haçı. `src/gridChrome.ts` yazar, saf DOM |
| `.grid-wrap.scrolled-x/-y` | yapışkan başlık ve öğretmen sütunu gölgesini ancak altına bir şey kayınca alır |
| `.ghost` `.grid.dragging` | sürükleme hayaleti — kaydırma `calc(var(--cell-w) / -2)` (tuzak 36) |
| `.program-body` | ızgara + çekmece, yan yana |
| `.pool` `.pool-closed` `.pool-head` `.pool-count` `.pool-sub` `.pool-toggle` `.pool-list` `.pool-card` | yerleşmemiş kart havuzu — **ALTTA** bir çekmece. Kartlar yatay akar; kapalıyken sayaç KALIR (alt şeritte yer var, sağdaki 40px'lik sütunda yoktu). Havuz **boşalınca kendiliğinden kapanır** |
| `.pool-split` | çekmecenin üst kenarı: `role="separator"`, sürüklenir, ok tuşlarıyla ±0.5rem. 11px hedef, ortada bir **tutamak** (`::after`) — kılcal bir çizgi kenarlık gibi okunur ve kenarlıklar kıpırdamaz. `src/poolSplit.ts` yazar, saf DOM (drag.ts / gridChrome.ts deseninin üçüncüsü) |
| `.color-dot` `.row-dot` | sınıf rengi işareti (hücreyi **öğretmen** rengi boyar) |

### Kurulum / Müsaitlik / Baskı
| Sınıf | İş |
|---|---|
| `.step` `.step-no` `.step-count` `.step-next` | Kurulum'un dört adımı, artık **ribbon'un içinde** ve birer `.btn`. Bu yüzden "buradasın" `aria-pressed`, `aria-current` değil. `.steps` sarmalayıcısı kalktı |
| `.entity-list` `.entity` | 25 öğretmen arasından seçim (`<select>` değil) |
| `.pickers` `.pick-list` `.pick-head` `.pick-item` `.pick-items` | "hangi sayfalar basılacak" onay listeleri |
| `.print-area` `.print-page` `.p-title-main` `.p-title-sub` `.p-top` `.p-bottom` `.p-clock` `.p-daycol` `.p-dot` | kâğıt. `@page { margin: 0 }`, sayfa **205mm sabit**, `safe center` (tuzak 31) |
| `.no-print` `.hidden` | görünürlük |

---

## Yeni ekran kurarken sıra

0. **Sekmenin araçları ribbon'a mı?** Kural: "şu an neye bakıyorum" ve "tek
   tıkla ne yaparım" şeride çıkar; liste, sayaç, onay kutusu ve açıklama cümlesi
   panelde kalır. Her şeyin şeridi, hiçbir şeyin şeridi demektir. Aracın durumu
   şeride çıkıyorsa `src/toolState.ts`'e taşınır — sekme değişince kaybolmasın.
1. `.cols` seç (`wide-left` mi `narrow-right` mi) — sağa konan şey **yeni bilgi
   olmamalı**, bir sekme öteden ya da tablonun üstünden gelmeli. Panel sayısı ve
   boyu değişkense `.cols` değil `.panel-grid` (akan, `auto-fit minmax(22.5rem)`).
2. Yüzey `.panel`. İç içe gerekiyorsa `.panel.inset`.
3. Kontroller yukarıdaki tablodan. Yoksa **önce sor**, sonra yaz.
4. Genişlik `--w-col-*` merdiveninden, `<th>` üstünde. JSX'te `style={{width}}` yok.
5. Geri bildirim `.reason-bar` / `.hint` / `.badge` — yeni bir mesaj kutusu icat etme.
6. Boş durum `.empty-screen` ve cümlesi **yönlendirsin**.
7. Izgaraya hücre eklediysen: `data-day`/`data-hour` taşıyor mu, taşımalı mı? (tuzak 13)
8. `npm run test:e2e` + `npm run ekran` — **çıktıyı göster, iddia etme**.
