# Tasarım

Arayüzün neye benzediği: renk, tipografi, hareket, tokenlar ve primitif envanteri.

Bu dosya neyin var olduğunu ve neye benzediğini söyler. Tasarım kararları serbest
([PRINCIPLES.md](PRINCIPLES.md), Görsel kalite), yani burası bir izin listesi değil,
amacı var olan bir `.panel`'i yeniden icat etmemek. Ekranda ne olduğu ve nereye
konduğu [LAYOUT.md](LAYOUT.md)'de. Tek doğru kaynak
[../src/styles.css](../src/styles.css), burası ona bakmadan önce bakılacak yer.

---

## Görünüşün korudukları

Tasarımın serbest olduğu alanın kenarında zevk meselesi olmayan dört şey duruyor.
Her birinin neyi koruduğu ve onu ölçen testler:

| Ne | Neyi koruyor | Nerede ölçülüyor |
|---|---|---|
| İşlevsel renk kanalı: yeşil bırakılabilir · sarı uyarı · kırmızı engel · gri taralı kapalı | aracın çalışma biçimi bu dört renk | `palette.test.ts`, `e2e/renk.spec.ts` |
| Erişilebilirlik: liste satırında ve kartta yazı 7:1, kontrol kenarı 3:1, görünür odak, `aria-live`, varsayılan ölçekte 12 px taban; ayrıca `forced-colors` ve 24 px tıklama hedefi | hedef kullanıcı zor görüyor | `e2e/zebra.spec.ts`, `e2e/renk.spec.ts`, `e2e/renk-secici.spec.ts`, `e2e/bos-ekran.spec.ts`; `forced-colors`, hedefler ve yer tutucu süitte değil, 2026-11-15'te betikle ölçüldü (WORKLOG) |
| Kâğıt: A4 yatay, `@page { margin: 0 }`, sayfa 205 mm | ekran ne olursa olsun yazıcı aynı yazıcı | `e2e/yazdir.spec.ts` |
| Açılış ağa bağlı değil: bugün çalışma anında ağa hiç çıkılmıyor | çift tıkla çalışır ilkesi, babanın makinesinde ağ olup olmadığı bilinmiyor | `e2e/temel.spec.ts`, `e2e/site.spec.ts` |

### İşlevsel renk kanalı

Yeşil bırakılabilir, sarı uyarı, kırmızı engel, gri taralı kapalı demek, ve kırmızı
bir çerçeve kapalı saatte kalmış bir dersi işaretler. Program ızgarasında kapalı saatin
çarpısı bu yüzden gri (`--muted`, 17 px): kırmızı orada "reddedildi" demek ve 25 px'lik
kırmızı çarpılar derslerden yüksek sesle konuşuyordu. Müsaitlik'in büyük kırmızı çarpısı
duruyor, orada ret yok (DECISIONS). Kimlik paletinin renkleri bu
anlamlara yaklaşmaz, `palette.test.ts` ve `e2e/renk.spec.ts` bunu her koşuda yeniden
ölçer.

Bölüm renkleri 2026-11-16'dan beri çizilmiyor (Sadeleşme): seçili sekme tek ve nötr, `--sec`
her yerde `--accent`'e bağlı, renk yalnız veri ve durum için. Yedi token ve aşağıdaki ölçüm bir
gün yeniden açılırsa diye duruyor. Bölüm renkleri de bu kanala tabi ve tekerlek dolu. Yedinci sekme yedinci rengi
isteyince (2026-08-27) çember iki temada birden tarandı, ve serbest kalan her yayın
ya işlevsel bir rengin ya komşu bir sekmenin ailesine düştüğü ölçüldü. Sekizinci
bir renk aranırsa aynı ölçüm tekrarlanır. `var(--sec, …)`'in fallback'ine düşmek
bir karar değil, tuzak 52.

### Erişilebilirlik

Liste satırında yazı her zeminde (iki şerit) ve her durumda (üstüne gelme, seçili satır, odak) en az 7:1, çünkü babanın en çok okuduğu yer satırlar. `e2e/zebra.spec.ts` 94 bunu iki temada, her listede, boyanan renkten ölçer. Bugün bunu tutmayan tek mürekkep adıyla istisna ve [TODO.md](TODO.md) E1'de: açık temada tehlikeli "Sil". İşlevsel rozetler, sağlık çipi ve sebep çubuğu 2026-11-15'ten beri kendi zeminlerinde kendi mürekkepleriyle yazılır (`--ok-ink`, `--warn-ink`, `--bad-ink`: aynı renk Oklab'da siyaha doğru itilmiş, açık temada 7,47 · 7,63 · 7,20; koyu temada `--ok` ve kardeşleri zaten 7'nin üstünde). O iş bitene kadar öteki yüzeylerin ölçülen eşiği 4,5:1 (`e2e/renk.spec.ts`).

Program ızgarasındaki kartın iki satırı da `--on-color` (36 renkte en kötü 7,3:1); alt satır eskiden `--on-color-sub`'dı ve 4,71'e iniyordu. Seçili sekme 2026-11-16'dan beri kâğıt zeminli, `--text` yazılı, `--border-strong` kenarlı ve 3 px accent alt çizgili; dolu bölüm rengi kalktı.

Bir kontrolün kenarı (girdi, seçici, düğme) `--border-strong` ve oturduğu her zeminde 3:1'in üstünde (WCAG 1.4.11); kıl çizgi ve `--line` 1,1 ile 1,4 arasındaydı. Boş bir kutunun ipucu `--muted` (açık 7,79, koyu 10,31 gömük zeminde), tarayıcının #757575'i değil. Tıklama hedefleri en az 24 px (WCAG 2.5.8): onay kutusu, bildirimin kapatma düğmesi, satır tutamacı, satır başındaki ad, havuzun seçicileri.

Windows'un karşıtlık temalarında (`forced-colors: active`) kart `CanvasText` bir kenar alır, basılı düğme ve seçili sekme `Highlight` zemin ve `HighlightText` yazıyla çizilir, odak 3 px `Highlight` bir çizgidir. Bunlar `styles.css`'in sonundaki tek blokta. Çözücü ilerlemesi, sonuç satırı ve hata mesajları
`aria-live="polite"` (`.reason-bar`'ın ilk parçası `role="status"` taşıyor; koşunun
saniyede birkaç kez değişen sayacı onun dışında ve `aria-busy`; satırın kendisi busy
değil, çünkü busy bir ata içindeki canlı bölgeyi susturur),
kapanan her diyalog odağı açana verir (`useReturnFocus`), geri alınamaz
uyarılar `role="alertdialog"`. Renk tek başına bir durum taşımaz. Klavyeyle
gidilen her yerde odak görünür.

Hedef kullanıcı zor görüyor, ve bu süsün değil boyutun tarafındaki bir kısıt:
ekranda 12 px taban. Taban varsayılan ölçekte (%100) geçerli. Ekran dört adlı basamak
sunar (%100–%150, 2026-11-16); daha önce kaydedilmiş bir %80 olduğu gibi çizilir ve
orada `--fs-xs` 9,6 px'tir: okuyucu tabana kendisi cevap vermiş, çoğu zaman Windows'un
kendi ölçeklemesi zaten büyükken. Tipografi merdiveni her kök değişiminde yeniden
sabitlendiği için %100'de 12 px hâlâ 12 px.

Program ızgarasının kartları 12 px ve hiçbir ölçekte 11 px'ten küçük değil
(2026-11-16, Alp): yazı küçültülerek sığdırılmaz, hafta o boyda sığmıyorsa ızgara yana
kayar ([LAYOUT.md](LAYOUT.md)). 2026-09-26'dan o güne sığmayan satır 9 px'e kadar
küçülüyordu. Kartın tabanı 12 px, çünkü 14 px'lik bir ad 1920'de haftayı sığdırmaz. Bu 2026-11-16'ya kadar yalnız Sığdır
yoğunluğundaydı ve Ferah ile Rahat'ta kart 14/13 px'ti; yoğunluk kalkınca (Sadeleşme
K6) ızgaranın tek düzeni bu, kartı büyütmenin yolu Yazı büyüklüğü.

Dar kutuda (Windows %150'de 1920 piksel ekran 1280 CSS pikseli, %200'de 960) sözcükler
gitmez, küçülür ya da yer değiştirir: sekmenin etiketi simgenin altına iner,
şeritteki düğmenin sözcüğü bir basamak küçülür, daha dar barda sekmeler bilerek kendi
satırlarına geçer (2026-11-16). Sayfa yana kaymaz. Eskiden etiketler ve şerit sözcükleri hiç çizilmiyordu.

### Hareket

Hareket bir tercih ve makinenin tercihi taban. `--dur-*` süreleri ile `--slide`,
`--sweep`, `--press` ve `--pop` mesafeleri tek yerden kısılır. Bir kuralda
`translateY(.5rem)` gibi elle yazılmış bir mesafe, o hareketin kapatılamadığı
anlamına gelir: 0 ms'lik bir geçişin sonunda taşınmış bir öğe durmaz, ışınlanır
(tuzak 57). Bu yüzden hareket eden her sayı dört mesafe tokeninden birinden okunur.

`[data-motion="az"]` süreleri yarıya indirir ve mesafeleri sıfırlar,
`[data-motion="kapali"]` hepsini sıfırlar. `@media (prefers-reduced-motion: reduce)`
bloğu `[data-motion]` kurallarından sonra ve eşit özgüllükte durur, yani işletim
sistemi "azalt" diyorsa seçim ne olursa olsun hareket kapalı (tuzak 58).

Hareket kütüphanesi yok. Girişte animasyon için `@starting-style`, `display`'e
geçiş için `transition-behavior: allow-discrete` kullanılıyor. `motion`'ın ölçülüp
alınmaması ve `startViewTransition`'ın ölçülüp geri alınması
[DECISIONS.md](DECISIONS.md)'de (tuzak 55).

---

## Renk

- **Renk bir kimlik, süs değil.** Her öğretmenin ve her sınıfın kendi rengi var, ve `firstFreeColor` kullanılmayan en küçük indeksi veriyor. Palet 36 renk ve `src/leaf/model/palette.ts`'te düz hex olarak duruyor: iki temada ve kâğıtta aynı olan tek renk kümesi olduğu için bir CSS değişkeni hiçbir şey kazandırmıyordu. Renkler elle seçilmedi, arandı: kontrast ve CIE Lab ayrımı kısıtları altında en uzak nokta yöntemiyle, ve `palette.test.ts` bunu her koşuda yeniden ölçer.
- **Palet üstündeki mürekkep temayla dönmez** (`--on-color`), çünkü `color: inherit` koyu temada açık metni pastel zemine düşürür (tuzak 15 ve 35).
- **Hücreyi hangi renk boyar.** Program ızgarasında öntanımlı olarak öğretmen rengi, şeritteki Renk menüsünden sınıf, derslik ya da branş rengi. Kâğıtta öğretmen sayfasını sınıf rengi, sınıf sayfasını öğretmen rengi boyar ([LAYOUT.md](LAYOUT.md)).
- **İki tema.** Açık ve koyu, varsayılan açık ve sistemi izlemiyor, çünkü işlevsel renkler açık zeminde seçildi ve orada ölçüldü. `color-scheme` iki temada da doğru kurulur, yoksa tarayıcı kendi karartmasını uygular ve işlevsel renkler çamurlaşır (tuzak 14). Kâğıt her zaman açık paleti kullanır, çünkü o renkler kâğıda basılıyor.
- **Çizgiler.** `--hairline` kabuğun çizgisi, `--line` veri okunan yerlerin çizgisi, `--border-strong` bir kontrolün kenarı. Girdiler bir dönem kıl çizgiye inmişti (karşılığında gömük bir yüzey, `--paper-sunk`, kazanmışlardı) ve düğme `--line`'daydı; ikisi de kendi zemininde 1,1 ile 1,4 arasıydı, yani az gören biri için kenarsızdı. 2026-11-15'ten beri girdi, seçici, arama kutusu ve düğme `--border-strong` kenarlı: oturdukları her zeminde 3:1'in üstünde (WCAG 1.4.11) ve `--muted`'ın çok altında, yazı gibi okunmaz. Listede girdi gömük yüzeyi bırakır, çünkü zebra satırı açık temada gömük yüzeyle neredeyse aynı: listedeki girdi, seçici ve dağılım seçicisi kâğıt zeminli, düğme gibi.
- **Düğme durumları:** birincil, sade, tehlikeli, basılı. Birincil (`.btn.primary`) tek dolu düğme ve bir ekranda bir tane: o ekranın ana işi (2026-11-16). Basılı bir seçim düğmesi dolu değil, bir segment: `--accent-bg` zemin, accent kenar ve 3 px accent alt çizgi, yazı `--text`. Tehlikeli olan beklemeden kırmızı görünür ama kenarlıkla değil mürekkeple: 25 öğretmenlik bir listede 25 kırmızı dikdörtgen, tehlike renginin sayfanın zemini hâline gelmesi demekti. Kırmızı kenarlık hover'da gelir.
- **Listelerde zebra.** Liste, aynı biçimde kayıtların satır satır okunan yığını, ve her listenin çift satırı `--zebra` zeminli: `table.list`, `table.stat`, kişi sayfasının ders satırları (`table.sheet-lessons`), Müsaitlik'in ve Dersler'in seçme listesi (`.entity-list`) ve Excel'den yapıştırma önizlemesi. Zebra açık temada kâğıttan bir adım koyu, koyu temada bir adım açık, ikisinde de aynı yükte. Bir durum gibi okunmayacak kadar hafif, ilk bakışta seçilecek kadar belirgin: ölçüsü tokenin yanında yazılı ve `e2e/renk.spec.ts` 93 her koşuda yeniden ölçüyor. Her listede aynı token, bir listeye özel ton yok (babanın isteği, [TODO.md](TODO.md) §0). Kural `:where()` ile olabilecek en düşük özgüllükte, yani her durum (üstüne gelme, seçili satır, bırakma işareti) onu nerede yazılmış olursa olsun ezer (tuzak 40). `:nth-child` DOM'u sayar, yani arama, sıralama, grup çipi ya da silme satırı DOM'dan çıkarınca şerit görüneni izler. Menü, palet ve seçiciler liste değil: orada tek vurgu klavyenin. Üstüne gelinen satır bir zemin değil bir halka alır (2 px `--muted`, satırın içinde): satırın kontrastı iki şeritte neyse o kalır, halka `forced-colors`'ta da kalır, ve klavyenin odak halkasıyla karışmaz, çünkü o accent, kontrolün dışında ve kâğıt boşluklu. Seçili satır `--accent-bg` zeminli ve accent kenarlı, yazısı `--text`. Açık plan satırın başında accent bir kenarla söylenir. Satırdaki yazı iki zeminde ve her durumda 7:1 tutar (Erişilebilirlik): `e2e/zebra.spec.ts` 94 bunu ve şeridin görünen sırayı izlediğini, `e2e/renk.spec.ts` 93 tokeni iki temada ölçer. Izgara bir liste değil: program ızgarası ve Müsaitlik'in hücrelerinde zemin bir durum taşıyor ve zebra almıyor.
- **Gün bandı** tek indeksli günlere çok hafif bir zemin verir. Bir durum gibi okunmadığı ve iki temada aynı yükte olduğu ölçülür, ve altındaki kapalı saat taramasını ezmemesi gerekir (tuzak 40).
- **Nötr rampa türetilmiş:** tek bir ton (258), seçilen OKLCH açıklığı ve chroma'sı, çevrimdışı sRGB'ye çevrilmiş. Dosyaya hex yazılıyor, çünkü `getComputedStyle` bir `oklch()` rengini `oklch()` olarak döndürür ve süitteki ölçümler `rgb()` ayrıştırır (tuzak 81).

## Tipografi

Yüz dosyaya gömülü ve ağırlık aralığı kullanılan ağırlıklara göre kırpılmış
(`scripts/font.mjs`, tuzak 69 ve 70). `font-display: block`, çünkü `swap` ilk
düzeni yedek fontla kurup `ch` cinsinden sütunları bir kez zıplatıyordu (tuzak 38).
Kök yazı boyu `calc(13px * var(--ui-scale))`, ekran merdiveni `rem` cinsinden dokuz
basamak. Kâğıt merdiveni `pt` cinsinden, ekran ölçeğinden etkilenmez, ve kâğıttaki
yazı ayarının çarpanı merdivenle aynı öğede tanımlıdır (tuzak 63). Sütun
genişlikleri `ch` cinsinden, ve ölçekler arasında korunan şey piksel değil `ch`
sayısı (tuzak 39). `.hint` her yerde `--fs-sm` (13 px), Okul bilgileri'nde ise gövde boyu
`--fs-base` (15 px, `.settings-pane`, 2026-10-24, TODO B7.36): oradaki notlar bir
tıklamanın bütün planlara ne yaptığını söylüyor, göz ucuyla değil okunarak bakılıyor.

Ekranda 12 px'te kalan yerler (2026-11-15, varsayılan ölçek): şerit başlıkları, ızgara
başlığındaki gün adı ve ders numarası, satır başının ikinci satırı, rozetler, havuzun
seçicileri ve sayacı, sekme etiketi dar kutuda, şerit sözcüğü en dar adımda, ve ızgaranın
kart satırları (en az 11 px). `.hint` 13 px ve bu kararı TODO SD5 bekliyor.

---

## Ölçülenler (2026-08-26)

Bunlar birer tarih, kural değil (tuzak 42). Dokunulan mekanizma değişince yeniden
ölçülür, ve bugünkü değerler [WORKLOG.md](WORKLOG.md)'nin "Şu an" bloğunda durur.
Buradaki sayılar 2026-08-26'nın sayıları; dosya o gün 489 815 bayttı ve bugün bir
megabaytın üstünde.

```
dist/index.html            489 815 bayt   (tek dosya, gömülü font, JS ve CSS)
file:// açılışı            73 ms medyan, 83 ms en kötü (7 koşu, 1920×1080)
imleç haçı                 0,391 ms / sütun değişimi   (16,7 ms karenin %2,3'ü)
ızgara                     1950 hücre, 426 kart
kâğıt parlaklığı           1.000 açık / 0.017 koyu     (eşik >0,9 / <0,1)
metin / kâğıt              17,47 / 13,26
accent / kâğıt             7,47 / 7,82
sekme rengi en düşük AA    5,63 / 4,89
sekme ile işlevsel renk,
  en düşük ΔE              52,5 / 49,9                 (eşik >32)
```

### E turu (2026-08-26): hareket, satır önizlemesi, bölüm rengi

```
dist/index.html            492 421 bayt   (+2 606: sündürme, önizleme, simgeler)
file:// açılışı            139 ms medyan, temel 138 ms, yani fark yok.
                           73 ms'lik eski sayıyla karşılaştırılamaz: o başka bir
                           yöntemle alınmıştı. Aynı betikle ölçülen tek dürüst
                           karşılaştırma öncesi ve sonrası.
sekme geçişinden sonra     68 ms içinde ızgara tıklanabilir oluyor
  (startViewTransition ile ölçülen: 553 ms, bu yüzden alınmadı, tuzak 55)
sekme çifti en düşük ΔE    16,0'dan 20,5'e   (açık tema, eşik >12)
sekme ile işlevsel renk    52,5 (değişmedi)
--on-accent / bölüm rengi  5,63 açık · 6,02 koyu       (eşik >=4,5)
satır önizlemesi / kâğıt   18,6 / 20,6 / 11,8  ΔE  (açık)
                           21,8 / 23,2 / 15,2      (koyu)
olur ile olmaz ayrımı      23,8 açık · 28,3 koyu   ΔE
```

**Fıstık yeşili ve turuncu ölçüldü ve alınmadı.** 360 derecelik ton taraması: 80
ile 140 arasında kâğıtta 4,5:1 tutan ve `--ok`'a ΔE 32'nin üstünde uzak kalan bir
renk yok (en iyisi 28,6), turuncunun tamamı `--bad` ve `--warn`'a 21 ile 28 arası.
Yeşilin üçte biri ve sıcak yarı işlevsel kanala ait. Altı sekme kalan yasal alanı
zaten dolduruyordu, ve 2026-08-27'de yedinci arandığında bu cümle harfiyen doğru
çıktı: taranan her serbest yay ya işlevsel bir rengin ailesine (turuncu 19 ile
`--warn` ve `--bad`, limon 70 ile `--ok`) ya komşu bir sekmenin ailesine düşüyordu
(çivit 257 ile Kontrol, orkide 316 ile Çıktı). Yedincisi Çıktı'nın pembesi ile
kırmızılar arasındaki gülden alındı ve öteki altının açıklığına çekildi: oradaki ilk
aday (`#ff386a`) `--bad` gibi okunacak kadar sıcaktı. Turkuaz istendi ve zaten
Program'ın rengi.

**Hedef makine ilkesi (o günkü numarasıyla ilke 7) o gün bir varsayım olmaktan
çıktı.** "Hedef makine yavaş" deniyordu ve hiç ölçülmemişti: o günün 490 KB'lik
tek dosyası `file://` üzerinden 73 ms'de açılıyordu. Dosya o günden beri büyüdü
ve açılış da; iki sayı da yeniden ölçüldü ve WORKLOG'da duruyor.

---

## Tokenlar

```
yüzey        --bg masa · --chrome kabuk · --chrome-2 ikinci kabuk
             --chrome-lit üst barın gradyan durağı · --paper kâğıt
             --paper-sunk girdi · --band ızgara gün bandı · --zebra liste çift satırı
çizgi        --hairline kabuk · --line veri çizgisi · --line-dark en yüksek ses
mürekkep     --text · --muted · --on-color (temayla dönmez) · --on-color-sub (yalnız kâğıt)
kontrol      --border-strong   (girdi, seçici, düğme kenarı; her zeminde >= 3:1)
accent       --accent #373bdb · --accent-hover · --accent-bg · --on-accent
işlevsel     --ok/-bg/-ink · --warn/-bg/-ink · --bad/-bg/-ink · --closed · --hatch
             (-ink: kendi -bg zemininde yazı, >= 7:1)
bırakma      --drop-ok-bg · --drop-warn-bg · --drop-bad-bg  (dinlenme renklerinden
             ayrı: biri bir jest boyu yaşar, öteki gün boyu)
satır        --can-ok-bg · --can-warn-bg · --can-no-bg  (aynı üçünün zayıf hâli:
             imlecin altındaki hücre değil, hedef satırın tamamı)
bölüm        --sec-setup · -availability · -lessons · -program · -check · -print · -settings
             ve `[data-section]` bunlardan birini --sec'e bağlar
kot          --elev-0 … --elev-4   (düz · kâğıt · yükseltilmiş kabuk ·
                                    diyalog ve panel · sürükleme hayaleti)
yarıçap      --r-xs 3 · --r-sm 5 · --r-md 8 · --r-lg 14 · --r-xl 20 · --r-full
tipografi    --fs-2xs .846rem … --fs-3xl 2.385rem   (dokuz basamak)
kâğıt        --fs-p-xs 8pt … --fs-p-xl 17pt         (pt, ekran ölçeğinden etkilenmez)
tracking     --ls-tight · --ls-tighter · --ls-caps
satır        --lh-tight 1.2 · --lh-base 1.5 · --lh-head 1.25
boşluk       --space-1 … --space-8   (rem)
hareket      --dur-fast 110ms · --dur 180ms · --dur-slow 280ms   (süre)
             --slide .5rem · --sweep 100% · --press 1px · --pop .97  (mesafe)
             --ease · --ease-out · --ease-spring
             [data-motion="az"]     → süreler yarı, mesafeler 0
             [data-motion="kapali"] → hepsi 0
             prefers-reduced-motion → hepsi 0, ve ayar bu tabanın gerisine geçmez
şerit        --ribbon-h 2.25rem   (şeritteki her kontrolün yüksekliği)
odak         --focus-ring (iki halka: kâğıt boşluğu ve accent)
sütun        --w-col-xs 8ch … --w-col-2xl 32ch
geometri     --cell-w/-h · --rowhead-w · --dock-w · --break-w   (rem)
             --day-rule-w 3px   (gün çizgisi; ızgara o sütuna geri verir)
ölçek        --ui-scale, varsayılan 1, 0,80 ile 1,50 arası, 0,05 adım
```

Süre bir token olduğu hâlde mesafe uzun süre değildi, 2026-08-27'de o da oldu
(yukarıda, Hareket).

---

## Primitifler

### Kabuk
| Sınıf | İş |
|---|---|
| `.app` `.workspace` `.main` | kök sütun · içerik alanı · kaydırma kutusu. `data-section` kökte (tuzak 52), `.main`'de `key={tab}` var, geçiş `@starting-style` |
| `.scroll-fade` + `.faded-top` `.faded-bot` | kayan kutunun üstünde ya da altında içerik olduğunu söyler (`scrollFade.ts`). `.grid-wrap`'e uygulanmaz (tuzak 54) |
| `.topbar` | tek satır. Üstünde ince bir bölüm rengi şeridi, içinde o rengin hafif bir washı |
| `.tabstrip` `.tab` `.tab-label` | seçili sekme kâğıt zeminli ve accent alt çizgili, tek ve nötr. `flex: 0 0`, daralan çubukta feda edilmez (tuzak 48) |
| `.health` `.health-dot` `.health-text` | durum çipi: her sekmede, sorunu adlandırır. Yer daralınca noktasına iner |
| `.panel-head` | başlık ve tek bir kontrol (Okul listelerinde ve Dersler'de "Excel'den yapıştır"). `baseline` hizalı, sarabilir |
| `.ribbon` `.ribbon-sep` `.ribbon-label` `.ribbon-value` | sekmenin araçları, her sekmede. Basılı kontrol bir segment (zemin ve alt çizgi). Sağ ucunda `.more-menu` (Daha fazla ▾, `common/More.tsx`). `-label` bir grubun başlığı (büyük harf, soluk), `-value` bir grubun değeri (normal, tam mürekkep) |
| `.topbar-doc` `.app-title` `.plan-picker` | hangi belge açık |
| `.btn-group` `.topbar-sep` `.spacer` | bitişik düğme kümesi · ayraç · itici |

### Kontroller
| Sınıf | İş |
|---|---|
| `.btn` + `.primary` `.danger` `.danger-solid` `.icon` `.link` | `.danger` mürekkeple, `.danger-solid` yalnız diyalogda |
| `.field` `.field-label` `.form-row` (+`.nowrap`) | etiketli kontrol · bir satırda duranlar |
| `.num` `.text-sm` `.clock-pick` `.sort-pick` | boyutlanmış girdiler |
| `.color-pick` + `dialog.color-dialog` `.swatches` `.swatch` | renk seçici ve 36 renklik diyaloğu |
| `table.list` + `th.num` `td.num` | veri tablosu, çift satırı `--zebra` (`table.stat`, `table.sheet-lessons`, `.entity-list`, `.paste-preview` da) |
| `.chip` `.chip-count` `.chips` | grup süzgeci, sayısı üstünde yazan |
| `.search` `.search-box` `.search-clear` | arama kutusu |
| `.list-tools` `.list-count` | listenin üstündeki şerit |

### Katmanlar
| Sınıf | İş |
|---|---|
| `.help-btn` `.help-pop` `.help-body` `.panel-head.with-help` | "?": bir panelin açıklaması, Radix Popover (`common/Help.tsx`, `HelpHead`) |
| `.more-menu` + `.menu` `.menu-item` | Daha fazla ▾ ve üst çubuğun Dosya ▾ ile ? menüleri (`common/More.tsx`) |
| `.dlg` `.dlg-overlay` `.dlg-head` `.dlg-icon` `.dlg-title` `.dlg-body` `.dlg-actions` | her soru: `useDialogs()` ile `confirm` ya da `alert` |
| `.sheet` `.sheet-mark` `.sheet-title` `.sheet-facts` `.sheet-week` `.sheet-actions` `.sheet-more` `.sheet-foot` | kişi sayfası: bir öğretmenin, sınıfın ya da dersliğin her şeyi; aynı çekmece sorun listesini de taşır (`.problem-list`, başlığın altında bölüm segmenti `.sheet-views`, K3). Sağdan kayar, solmaz, çünkü altından iki bin hücre geçiyor. Başı yapışkan ve kâğıt zeminli, bölüm başlıkları `.sheet-h` (küçük, büyük harf, `--muted`), ızgarası kısa satırlı, Sil en altta bir çizginin altında |
| `.palette` `.palette-row` `.palette-group` `.palette-hint` `kbd` | Ctrl+K |
| `.toasts` `.toast` `.toast-close` | olan biteni söyleyen kısa satır |

### Izgara
| Sınıf | İş |
|---|---|
| `.grid` `.row-head` `.corner` `.day-head` `.hour-clock` `.day-first` | iskelet |
| `.break-col` | öğle arası. `data-day` ve `data-hour` taşımaz (tuzak 13) |
| `.card` `.card-top` `.card-bottom` `.card.conflict` | yerleşmiş ders |
| `.card-pin` | karttaki raptiye düğmesi. Kartın kardeşi, dururken görünmez, hover, odak ve sabitli durumda görünür |
| `.band` | tek indeksli günün zemini, bir durum gibi okunmaz (tuzak 40) |
| `.block-cont` `.block-in` | bloğun devam hücreleri |
| `.col-hot` · `tr:hover` | imleç haçı (`gridChrome.ts`, saf DOM) |
| `.ghost` `.grid.dragging` | sürükleme hayaleti |
| `.can-ok` `.can-warn` `.can-no` | hedef satırın tamamı, sürükleme başında bir kez (`drag.ts`) |
| `.drop-ok` `.drop-warn` `.drop-blocked` | imlecin altındaki blok, zayıf katmanı ezer |
| `.pool` `.pool-split` `.pool-card` … | havuz çekmecesi, boyu sürüklenir |
| `.pool-stack` | aynı dersin aynı boydaki blokları tek bir deste, ve DOM'da deste başına tek kart. Derinliği `::before` ile `::after` boyuyor, en çok iki katman görünür, blok sayısı `data-count`'ta ve kartın `title`'ında. Yani `.pool-card` sayısı deste sayısıdır |
| `.pool-card[data-size]` | kartın kaç saat olduğu yazıyla ve genişlikle. Bir ders birden çok kart bırakır (`2+1` bir ikili ve bir tekli), ve hangisinin sürüklendiği kaç hücrenin yanacağını belirler |
| `.inspect` | bir adı kişi sayfasına bağlayan bağlantı (ızgaranın satır başı) |
| `.person-open` `table.person-list` `.person-status` `.btn.add-row` | Öğretmenler ve Sınıflar listesi: kutusuz satırlar, kalın tam ad bir bağlantı gibi okunur, durum küçük ve `--muted` (sığmayan hafta `--bad`), listenin sonundaki ekleme satırı kesik kenarlı, tablonun eni kadar bir düğme |

### Listeler · Dersler · Gelemediği saatler · Yazdır ve gönder
| Sınıf | İş |
|---|---|
| `.step` `.step-count` `.step-icon` | şeritlerdeki liste düğmeleri, sayısıyla (Liste, Derslikler, Branşlar) |
| `.split-pick` | Dersler'deki dağılım seçicisi, açılır listesi olan bir düğme. Etiketleri saatle büyüdüğü için sabit bir genişliği yok, yalnız alt sınırı. Listede yanındaki girdiler gibi kâğıt zeminli ve `--line` kenarlı; form satırında ve kişi sayfasında tarayıcının düğmesi |
| `.intro-line` · `.btn.quiet` | Okul bilgileri'ndeki ilk kullanım teklifi ve onu kapatan sessiz düğme. Teklifin yanındaki eşit ağırlıkta ikinci bir düğme, bir kapatmayı bir karara çevirirdi |
| `.entity-list` `.entity` `.entity-icon` | müsaitlikte varlık seçimi. Simge `steps.tsx`'in `KIND_ICON`'undan |
| `table.availability` (+`.heat`) | boyanan çizelge ve haftanın darlığı ısı tablosu |
| `.pickers` `.pick-list` `.pick-item` | hangi sayfaların basılacağı |
| `.print-area` `.print-sheet` `.print-page` `.p-title-main` `.p-daycol` … | kâğıt. Ekranda `.print-page` kâğıdın kendisi, mm cinsinden aynı kutu ve üstünde gölge. `@media print` ekrana özel süsleri geri alır |
| `.panel` `.panel.inset` `.panel-grid` `.cols` (+`wide-left`) | yüzeyler ve düzen |
| `.empty-screen` `.badge` `.hint` `.reason-bar` `.warn-box` … | geri bildirim |

---

## Makine tercihleri

Tema, ölçek, havuz, şerit, müsaitlik saati, hareket, dil ve program
kart rengi bu makinenin tercihleri. State'e ve yedeğe yazılmıyorlar, ve hepsi
Okul bilgileri → Hakkında'daki "Veriler nerede" tablosunda sayılır. Anahtarların tam
listesi [DATA.md](DATA.md)'de.

---

## Yeni ekran kurarken

1. **Sekmenin araçları şeride mi?** "Şu an neye bakıyorum" ve "tek tıkla ne yaparım" şeride, liste, sayaç ve açıklama panele. Aracın durumu şeride çıkıyorsa `src/platform/prefs/toolState.ts`'e taşınır (tuzak 18). Şeridin beş maddelik standardı [LAYOUT.md](LAYOUT.md)'de ve `e2e/serit.spec.ts` beşini de ölçer. Üç varlık türünün simgesi `KIND_ICON`'dan gelir.
2. Yüzey `.panel`, düzen `.cols` ya da akan `.panel-grid`.
3. Soru sorulacaksa `useDialogs()`, `window.confirm` kullanılmıyor.
4. Bir şey olduğunu söylemek için `useToast()`.
5. Bir varlık adı yazılıyorsa `.inspect` ve `useInspect()`, panel onunla gelir.
6. Uzun bir liste çiziliyorsa `ListTools` ve `src/pure/listview/listview.ts`.
7. Izgaraya hücre eklendiyse: `data-day` ve `data-hour` taşıyor mu, taşımalı mı?
8. Hareket eden bir sayı yazıldıysa: dört mesafe tokeninden biri mi (`--slide`, `--sweep`, `--press`, `--pop`)? Değilse kapatılamaz (tuzak 57).
9. [TESTPLAN.md](TESTPLAN.md)'deki kadansa göre E2E ve `npm run ekran`: çıktıyı göster, iddia etme.
