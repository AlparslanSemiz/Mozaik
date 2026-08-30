# STATUS — Nerede olduğumuz

Son güncelleme: 2026-08-30 (otuz yedinci oturum: **AB turu** — kök 13px ve
%80 basamağı, Ayarlar şeridinin sağ ucu, kısalan infolar, Çıktının tek
kaydırıcısı, exe ikonunun ÖLÇÜLMESİ, SmartScreen hafifletmeleri, İngilizce
vitrin ve LICENSE)

---

## Otuz yedinci oturum — AB turu: devreden yedi madde (2026-08-30)

> *"AB oturumundan kalan taskları yap."*

TASKS'in *ŞİMDİ SIRADA*'sı bu turu adıyla yazmıştı ve *"başka bir makinede
yapılacak"* diyordu. O makine bu makine. Sekiz maddenin yedisi yapıldı; AB8
(aSc'nin ders ekleme penceresi) hâlâ **fotoğraf bekliyor** — `docs/Örnek
Fotolar/` altına bakıldı, o pencerenin resmi yok.

**Turun en pahalı bulgusu bir kod değil bir ÖLÇÜM: iki maddenin planı
yanlıştı.** AB5 "ikon exe'ye gömülmüyor olabilir", AB6 "VERSIONINFO yok"
diyordu. İkisi de yayınlanmış ikiliye bakılarak sınandı ve ikisi de **yanlış**
çıktı. Bkz. aşağıda 5 ve 6, ve yeni tuzak 101.

### 0 · Devralınan ölçüm borcu — sıçrama ATFEDİLDİ

AC turu `dist/index.html`'i 1 031 525 bayt ölçmüş ve *"kaynağı ölçülmedi, bir
sonraki turun ilk işi"* diye bırakmıştı. Yöntem D2'nin Radix paketlerini
ölçtüğü yöntem: `enforce: 'pre'` bir vite eklentisi modülü boş bir gövdeyle
değiştiriyor, dosya yeniden derleniyor.

| Derleme | Bayt |
|---|---|
| olduğu gibi | 1 031 525 |
| `@radix-ui/react-context-menu` boş | 1 024 418 |
| de·es·fr sözlükleri boş | 759 874 |
| ikisi birden | 752 767 |
| en·de·es·fr + menü boş | 667 885 |

```
dört sözlük (en·de·es·fr)               356 533 bayt   %34,6
@radix-ui/react-context-menu              7 107 bayt   % 0,7
geri kalan (uygulama + öteki paketler)  667 885 bayt
CLAUDE.md tabanı (2026-08-26)           489 815
  sözlüksüz/menüsüz büyüme            +178 070 bayt
```

**Sıçramanın kaynağı bir bağımlılık DEĞİL, veri.** Sağ tık menüsü 7,1 KB —
popper'ı `dropdown-menu` zaten getiriyordu, yani AC turunun endişelendiği paket
büyümenin %0,7'si. Büyümenin **üçte ikisi gömülü metin** (dört sözlük, 906
anahtar × 4). Toplamlar birebir toplanıyor (7 107 + 271 651 = 278 758), yani
ölçüm kendi içinde tutarlı.

### 1 · AB4 — kök 13px ve %100'ün altı

Sırada öne alındı çünkü kök font-size **her rem'i** oynatıyor: AB3'ün Çıktı
rayını AB4'ten önce ölçmek aynı rayı iki kez ölçmek olurdu.

```
:root font-size    calc(14px * --ui-scale)  ->  calc(13px * --ui-scale)
--fs-2xs … --fs-3xl   13px'e YENİDEN sabitlendi (px karşılıkları korundu)
SCALE_MIN             1  ->  0.80        SCALE_DEFAULT 1 KALDI
basamak sayısı        11 ->  15
```

Yani yazı boyu değişmedi; küçülen şey **rem cinsinden yazı olmayan her şey** —
boşluk, hücre, `ch` sütunları, şerit, havuz: **%7,1**. Bu, 2026-08-27'de 16→14
yapılırken kullanılan yöntemin aynısı.

**Kullanıcı kararı, 12 px tabanı:** taban **%100'de** geçerli. %80'de yazı da
%20 küçülüyor ve bu bilerek: taban varsayılan ekran hakkında bir söz, ve %80'e
uzanan okuyucu ona kendisi cevap veriyor. `SCALE_DEFAULT` 1'de kaldığı için
kimsenin ekranı kendiliğinden küçülmüyor.

Ölçülen (örnek okul, %80 · %100 · %150, iki temada bakıldı):

```
%80'de yatay taşma        0        kırpılan başlık/düğme  0
%150'de yatay taşma       0        kırpılan başlık        0
marka işareti (1.75rem)   24,5 px  ->  22,75 px   (%150'de 34,125)
liste tabanı 6rem         84 px    ->  78 px
```

Yeni test `gorunum.spec.ts` 44: **taban %80** — kökün gerçekten 10,4 px olduğu,
ve üç ekranda hiçbir şeyin kırpılmadığı. Mutasyonla sınandı (`.btn` dar
yapıldı → kırmızı).

**İki test kökün eski sayısını ezberlemişti ve ikisi de düzeltilirken
TÜRETİLDİ**: `kabuk.spec.ts` marka işaretinin px'ini yazıyordu (22,75/34,125
oldu ve yorumu üç taşınmayı da anlatıyor), `kabuk.spec.ts` 83 ise `6rem`'in px
karşılığını **80** diye sabitlemişti — artık kökten hesaplıyor.

### 2 · AB1 — Hareket ve Dil sola, bölüme özgü ayar şeride

`Appearance.tsx`'te iki panel sağ raydan sol sütunun sonuna taşındı. Rayda tek
panel kaldı (`Örnek`), yani `.cols > aside > .panel:only-child` artık Görünüm'e
de uygulanıyor — otuz beşinci oturumun sözleşmesi. Örnek tablosu `.stat-scroll`
ile sarıldı ki kayan şey **liste** olsun, panel değil.

Ayarlar şeridinin sağ ucu bugüne kadar **boştu**; beş bölümün beşi de artık bir
şey söylüyor:

```
Görünüm            Tema · Açık / Koyu      <- tek KONTROL
Zil ve günler      {n} gün · {n} ders      .ribbon-value
Kurallar           N engelle · N uyar · N kapalı
Planlar ve yedek   açık planın adı
Hakkında           v2.0.0
```

**Dördü STATE ediyor, biri SORUYOR, ve ayrım keyfi değil:** Ayarlar'ın bütün
kontrolleri iki parmak aşağıdaki panellerde duruyor, ve dört inç altındaki bir
düğmeyi tekrar eden şerit bu dosyanın kendi başlığının uyardığı "her şeyin
şeridi"dir. Görünüm istisna ve sebebi ölçülebilir: **kayacak kadar uzun olan
tek bölüm o**, ve tema onun ilk paneli — Hareket'e indiğinizde iki düğme
ekranın üstünde kalıyor, şerit ise kıpırdamıyor.

**Yoğunluk sağ gruba KONMADI, ve önce ölçüldü** (plan öyle diyordu):

```
%150, Ayarlar şeridi   kutu 1916 px
  Görünüm bölümü       dolu 1342 px · PAY 574 px
  bir Yoğunluk grubu   maliyet 400 px      -> SIĞIYOR
```

Yani yer vardı; konmama sebebi yer değil **belirsizlik**: o ekranda iki yoğunluk
ekseni var (Izgara ve Arayüz) ve "Yoğunluk" başlıklı tek bir grup hangisini
sürdüğünü söyleyemez. Izgara ekseni zaten Program şeridinde duruyor.

Yeni bölüm `serit.spec.ts` 60, iki test: beş bölümün beşinde de spacer'ın
SAĞINDA bir grup var, beşi **ayrı şeyler** söylüyor (aynı cümleyi tekrarlayan
bir şerit nerede olduğunuzu söylemiyor demektir), ve Görünüm'ünki temayı
gerçekten çeviriyor. Mutasyonla sınandı: dal kapatılınca ikisi de kırmızı.

### 3 · AB2 — infolar kısaldı, bütün ekranlarda

Kural: bir `.hint` **tek cümle**, ~90 karakter; uzayan gerekçe `title`'a iner.
`AddPanel`'e bunun için `more` prop'u eklendi.

```
ekrandaki en uzun .hint     438 -> 126 karakter
  438  Okul -> Öğretmenler  (ekleme paneli)
  426  Dersler
  350  Okul -> Branşlar
  269  Okul -> Sınıflar
kalan en uzun ikisi: 126 (içinde site adresi geçiyor) ve 122
```

Dokunulan: `settings/{Data,Appearance,Rules,Plans,School}.tsx`,
`setup/{Summary,Rooms,Subjects,Teachers,Classes,index}.tsx`,
`{Check,Print,Inspector,ColorPick}.tsx`, `lessons/index.tsx`.

**Sözlük işi elle, ve iki yönlü:** `i18n.test.ts` ölü anahtarı söyler, eksik
anahtarı **söyleyemez** (tuzak 87). Bu turda ikisi de tarandı — **66 ölü
anahtar** dört sözlükten silindi, **75 yeni anahtar** dördüne de yazıldı
(300 çeviri). Doğrulama tuzak 89'un yoluyla: sayfa Almanca açıldı ve
`body.innerText` Türkçe harf için tarandı — **15 satır çıktı ve on beşi de
örnek okulun öğretmen adları** (Ayşe Varol, Kemal Yıldız…), yani kullanıcı
verisi. Arayüzden sıfır satır.

Yeni test `metin.spec.ts`: yedi sekme ve beş bölüm gezilip her `p.hint`'in
uzunluğu okunuyor, **tavan 140** — ölçülen en uzun 126, ve turun sildiği
paragrafların beşi 260'ın üstündeydi. `.data-hint` sınıfı hariç tutuluyor ve
kaynakta işaretli: onları uzatan şey **okul**, kullanılmayan her branşın adını
sayıyorlar, ve onları sayan bir tavan bir okulun kaç branşı boşta
bırakabileceğine tavan koyardı.

### 4 · AB3 — Çıktının sağ bloğu: üç kaydırıcı BİRE indi

Ölçülen (örnek okul, "İkisi de" seçili):

```
                  ÖNCE                          SONRA
%100   kaydırıcı  3 (ray 728 + 22 + 74)         1 (yalnız ray, 419)
       iki liste  alt alta (top 243 / 477)      YAN YANA (ikisi de 243)
       ray        310 px                        485 px
       kâğıdın yanındaki pay  433 px            257 px
%150   kaydırıcı  3 (ray 1373 + 117 + 117)      1 (ray 1204)
       ray        462 px                        596 px
       pay        256 px                        121 px
```

Üç değişiklik: `.pick-items`'ın `max-height: 168px` **kalktı** (ham piksel —
ölçek büyüdükçe oransal olarak DAHA AZ ad tutuyordu), `.pick-list`'in
`min-width: 240px`'i **16rem** oldu (ölçülen min-content 206 px @%100 ve 305 px
@%150, ikisi de 15,85rem), ve `.pickers` `auto-fit` bir grid oldu. Çıktı'nın
rayı `min(37rem, 32cqw)`: 37rem iki listenin %100'de yan yana durması için
gereken genişlik, 32cqw ise %150'de kâğıdın payını 28 px yerine 167 px'te
tutan tavan.

Yeni bölüm `yazdir.spec.ts` 84, iki ölçek. Mutasyonla sınandı: 168px geri
konunca ikisi de kırmızı.

### 5 · AB5 — ikon: PLAN YANLIŞTI, ölçüm doğruyu söyledi

STATUS'ün kendi kaydı *"`bundle.icon`'un `--no-bundle` ile ikonu gömdüğü
**varsayıldı**, ölçülmedi"* diyordu, ve AB5 bu varsayımı şikayetin sebebi
sayıyordu. Yeni betik `scripts/exe-ikon.mjs` PE kaynak tablosunu ayrıştırıyor
(bağımlılık yok); yayınlanmış 2.0.0 ikilisi indirilip ölçüldü:

```
Mozaik.exe  3 732 480 bayt
  RT_GROUP_ICON 1 · RT_ICON 9 · RT_VERSION 1
  gömülü boylar  16 · 20 · 24 · 32 · 40 · 48 · 64 · 128 · 256
  kurulum/icon.ico  aynı dokuz boy       -> BOYLAR TUTUYOR
```

**Yani hiçbir boy eksik değildi ve hiçbir şey komşusundan ölçeklenmiyordu.**
Görev çubuğuna ulaşan işaret AYRINTILI çizimdi, doğru çizilmişti, ve 24 px'te
altı çubuğu 2,25 cihaz pikseli genişliğinde, aralarındaki boşluk 0,56 px — bir
cihaz pikselinin altındaki boşluk yoktur. Babanın *"sanki 9x9 pixellik"*
cümlesi tam olarak bunu tarif ediyor.

**Kullanıcı kararı: eşik 32'ye çıktı** (`SADE_ALTINDA` 20 → 32), yani 16 · 20 ·
24 artık sade çizim. Karar `scripts/ikon-karsilastir.mjs`'in ürettiği sayfaya
**bakılarak** verildi. Eşik böylece üç kez taşınmış oldu (48 → 32 → 20 → 32) ve
üçüncüsü, ilk ikisinin tartıştığı şeyi ölçen ilk taşıma.

`kurulum/icon.ico` yeniden üretildi (14 483 bayt), `temel.spec.ts` 79 eşiği
yeni yerinde ölçüyor. Ve `surum.yml`'in `exe` işine bir **kapı** eklendi: her
derlemede aynı betik koşuyor, boylar tutmazsa iş kırmızıya dönüyor — varsayım
bir daha geri gelemesin.

### 6 · AB6 — SmartScreen: bir madde ölçümle kapandı, biri ölçülemedi

**VERSIONINFO VAR.** AB6 *"yayıncısı, ürün adı, sürümü olmayan bir PE sezgisel
tarayıcıya çıplak görünür"* diyordu; aynı ölçüm beş alan buldu:

```
CompanyName mozaik · FileDescription Mozaik · FileVersion 2.0.0
ProductName Mozaik · ProductVersion 2.0.0
```

Yapılan: **`-ExecutionPolicy Bypass` dört yerden de kalktı.** Yerine geçen desen
`RemoteSigned` + `Unblock-File`: bir ZIP'ten çıkan her dosya "Internet" bölgesi
damgası taşır, Bypass o damgayı görmezden gelmenin en geniş yolu, ve indirilen
bir arşivin içinde tarayıcıların en tanıdık imzalarından biri. Damga
kaldırıldıktan sonra RemoteSigned yerel bir betiğe imza sormuyor — aynı iş,
benzemeyen imza. `kur.ps1` kopyaladığı `.ps1`'leri de unblock ediyor.

Doğrulandı: `kur.ps1` PowerShell ayrıştırıcısıyla **hatasız**, `.cmd`'lerin
yeni komut satırı da öyle; `npm run paket` sonrası BOM · CRLF · ASCII kapısı
üçünde de yeşil.

Ayrıca `SHA256SUMS.txt` yayına eklendi — imza alınamıyorsa "bu, yayınladıkları
dosya mı" sorusuna verilebilecek tek cevap bir özet.

**ÖLÇÜLEMEYEN tek şey:** `strip = false`'un boyut maliyeti. Bu makinede Rust
yok, `Cargo.toml`'a dokunulmadı, ve ölçmeden bir entropi iddiası yazmak tuzak
65'in ta kendisi olurdu.

### 7 · AB7 — vitrin İngilizce, ve bir LICENSE

`README.md` 439 satır Türkçeydi; kısa ve İngilizce yeniden yazıldı (ne olduğu,
indirme, dört teslim yolu, verinin nerede durduğu, SmartScreen'in ne dediği,
geliştirme komutları). `CLAUDE.md`, `docs/`, `.claude/` **Türkçe kaldı** ve
README bunun sebebini yazıyor.

`.github/surum-notu.md` İngilizce, **ama sonunda üç satırlık Türkçe kurulum
özeti var**: o metin her Release sayfasının gövdesi, yani babanın indirirken
göreceği sayfa. Ayrıntılı Türkçe yol zaten zip'in içindeki `OKU.txt`'de.

İş akışları: `name: sürüm` → `release`, işler `paket`/`yayinla` →
`package`/`publish`, girdiler `yayinla`/`etiket` → `publish`/`tag`, adım adları
İngilizce — hepsi Actions arayüzünde görünüyor. `scripts/yayinla.mjs` bu girdi
adlarını kullanmıyor, yani yeniden adlandırma güvenli (kontrol edildi).

**`LICENSE` eklendi** — repoda hiç yoktu. MIT, yanında gömülü IBM Plex için OFL
1.1 bildirimi. `package.json`'a `"license": "MIT"`, iki `description` İngilizce.

### Ölçülen

```
npm run kontrol      YEŞİL
  birim              719 test
  E2E                514 test    3,6 dk
  site · sunucu      22 test
  çözücü             7 test      52 sn
dist/index.html      961 584 bayt   (AC turu: 1 031 525 — 69 941 bayt DÜŞTÜ)
file:// açılış       DCL medyan 41 ms · en kötü 45 ms (7/7 koşu)
                     FCP 84–92 ms, ama 7 koşunun yalnız 5'inde ÖLÇÜLEBİLDİ
```

**Boyut düştü ve sebebi AB2:** 66 ölü sözlük anahtarı silindi, 75 kısa anahtar
eklendi, ve kısalan Türkçe cümleler dört sözlükte birden kısaldı.

> **FCP satırı bir uyarıyla yazılıyor.** `first-contentful-paint` girdisi
> `file://` altında bu Chromium'da her koşuda üretilmiyor (7'de 5). AC turunun
> "17 ms" ve daha eski "73 ms" sayıları **aynı kronometreyle alınmadı**; üçü
> yan yana konup karşılaştırılamaz. `domContentLoadedEventEnd` her koşuda var,
> o yüzden bu turdan itibaren yazılan sayı odur.

### Turun düzelttiği devralınan kırmızılar

Hiçbiri bu turun eseri değildi; hepsi metin ya da sayı ezberlemiş testlerdi ve
AB2 ile AB4 onları açığa çıkardı.

| Test | Ne oluyordu |
|---|---|
| `kayma.spec.ts` 76, iki test | Şeridin sağ ucu artık bölüme göre değiştiği için `geometry()` iki farklı şeridi sıra sıra karşılaştırıyordu. Artık **ada göre** eşliyor: iki şeritte de olan bir kontrol oynamamış olmalı. İkinci test `helpers.ts`'in strict-mode kusurunu kendi kopyasında taşıyordu |
| `temel.spec.ts` 5 | `kendiliğinden saklanıyor` cümlesini **Planlar ve yedek**'te arıyordu; o cümle Hakkında'da, ve orada bulunması bir rastlantıydı (oturum yedeği hint'i aynı kelimeleri taşıyordu) |
| `gorunum.spec.ts` 50 | Müsaitlik başlığı `2.125rem`'e **kıl payı** sığıyordu (14px kökte 29,75 px ile 30 px metin). Kök 13'e inince tablo, saat açılınca 2,16 px büyüdü |
| `kabuk.spec.ts` 76 · 83 | Kökün eski px karşılıklarını ezberlemişlerdi |
| `kontrol` · `kurulum` · `exe` · `klasor` | Kısalan hint cümlelerini arıyorlardı |

Müsaitlik başlığının çaresi bir sayı değil bir **yapı**: kapalıyken
`display: none` olan saat artık `visibility: hidden`, yani ikinci satır kutusu
her iki durumda da orada. İki yükseklik artık **inşaat gereği** eşit
(332,03 px ile 332,03 px), yeniden türetilmesi gereken bir sayı yüzünden değil.

---

## Otuz altıncı oturum — AC turu: kullanıcının altı satırı (2026-08-30)

> *"Yeni eklemeleri simetrik hale getirdik ama çok uzun olmuş kısalt. Müsaitlik
> programlarının satırlarını uzat. Program kısmında kartların üzerinde
> sabitleye basınca dersi sabitlesin babamın en çok kullancağı bu. Ayrıca biraz
> daha düzenle babamın kafası çok karışmasın. Programın ikinci şeridinin
> düzenini ayarla tekrardan. öğretmen ve sınıftan seçimleri en solda eski
> yerinde olmalı. Programda dersi düzenle ve öğretmeni düzenleme ve sınıfı
> düzenlemede her şeyi düzenleyebilelim. Ayrıca kartlar havuzdayken ayrım daha
> bir güzel ve hoş olsun, hatta neye göre filtrelensin sıralansın ayarı bile
> olabilir."*

Tur bir **düzeltme turu**: altı maddenin hepsi çalışma ağacındaki bitmemiş
turun üstüne geldi (35 değişmiş dosya + `programs.ts` · `programMask.ts` ·
`AddPanel.tsx`, hiçbiri commit'li değil). Devralınan **dört kırmızı** da bu
turda kapandı, ve dördü de aynı aileden — bitmemiş tur kodu taşımıştı, testi
taşımamıştı:

| Devralınan kırmızı | Ne oluyordu |
|---|---|
| `npm run tipler` 8 hata | `e2e/otomatik-*.spec.ts` hâlâ `state.placements` okuyor; alan `programs[]` içine girmişti |
| `program.spec.ts` 86, üç test | `Dersi buraya sabitle` alt menüye taşınmıştı, test onu düz menüde arıyordu |
| `kurulum.spec.ts` 44 + 65, beş test | `AddPanel.tsx` üç parçayı birer `<div>`'e sardı; `shapeOf` yalnız DOĞRUDAN çocuklara bakıyor, bloğun tamamını "yalnız başlık" diye okuyordu |
| `panel.spec.ts` 83, sessizce | *Çift rezerve* testi `s.placements`'i okuyordu, `undefined` geliyordu, döngü hiç koşmuyordu — **bedava yeşil** (tuzak 23), üstelik tek işi çift rezervasyonu yakalamak olan testte |

### 1 · Ekleme bloğu kısaldı — geometri, metin değil

Kullanıcı kararı: *yalnız kutu küçülsün, açıklamalar kalsın.* Simetri de kaldı
ve sebebi o: ortak taban, beş ekran arasında geçerken formun aynı y'de
durmasını sağlayan şey.

```
.add-panel yüksekliği          önce      sonra
%100  (beş ekranın beşi de)    259 px    182 px      (18.5rem -> 13rem)
%150  Derslikler/Branşlar/
      Öğretmenler/Sınıflar     389 px    273 px
%150  Dersler                  389 px    316 px      ← metin taban dışına çıktı
```

Açıklama rayı `minmax(5.5rem, auto)` → `3.25rem`, `.add-panel-head` 2.25 →
2rem, `.panel` dolgusu `--space-6` → `--space-5`. **Dersler'in %150'de tabandan
taşması kusur değil, ölçümün kendisi**: o ekranın paragrafı raydan uzun, yani
oradaki tek kol metindir ve kullanıcı bu turda onu istemedi.

### 2 · Müsaitlik satırları uzadı

```
                     önce    sonra    sayfa dikey taşması
%100 hücre           42 px   54,3 px  0
%100 tablo          282 px  355 px    0
%150 hücre           63 px   81,4 px  0
%150 tablo          423 px  533 px    0
"Haftanın darlığı"   42/63   42/63    (kendi kuralını aldı)
```

Isı tablosu bilerek dışarıda: o bir müsaitlik programı değil, bütün okula tek
bakış, ve aynı iskeleti yalnız çizim için ödünç alıyor. Yorumdaki eski cümle de
düzeltildi — *"48px"* yazıyordu, kural `3rem` yani **42 px** diyordu.

### 3 · Raptiye kartın ÜSTÜNDE

Kullanıcı kararı: **hep görünsün, sabitlenmemişken şeffaf, sağ tıkta da dursun.**

Raptiye kartın **kardeşi**, çocuğu değil: `.card` bir `<button>` ve düğme içinde
düğme geçersiz HTML'dir. Konumlanma bağlamı `<td>`. Boyu hücreden türüyor
(`clamp(.75rem, --cell-h * .48, 1.125rem)`), mürekkebi `--on-color` (tuzak 15),
sönük hâli `opacity: .38`.

**Testi iki kez yazıldı, çünkü ilki iki mutasyonu birden yuttu:**

- `opacity: 0` mutasyonu geçti — `dragAndDrop` imleci bıraktığı hücrede
  bırakıyor ve `td:hover > .card-pin` raptiyeyi tam açıyordu. İmleç kenara
  çekildi; **hâlâ geçti**, ve sebebi tuzak 59'un ölçüm hâliydi: geçiş sürerken
  okunan opaklık **0,64** dönüyordu. `settledMotion()` `helpers.ts`'e taşındı
  (`ekran.spec.ts`'in kendi kopyası ona bağlandı), sonra mutasyon **kırmızıya
  döndü**.
- `stopPropagation` mutasyonu da geçti, **ve bu sefer haklı olarak**: raptiye
  kartın kardeşi olduğu için basış zaten karta uğramıyor. Guard silindi, yorumu
  ölçümü söylüyor, ve basıp sürükleyen iddia yapısal koruma olarak kaldı.

### 4 · Program şeridi — Görünüm en solda, kitaplık tek menüde

```
önce:  Program(select+2 düğme) · Görünüm · Diz  ␣  Yoğunluk · Izgara(3 düğme)
sonra: Görünüm · Diz · Program(1 menü)          ␣  Yoğunluk · Izgara(1 menü)
```

İkinci menü bir **ölçümden** doğdu, tercihten değil: `serit.spec.ts` %150'de
kırmızıydı ve **iki düğme şeridin dışına taşıyordu**. Eşit sütunlu bir grupta
üç uzun kelime, en uzunun üç katıdır:

```
%150, Program şeridi        önce      sonra
şeridin istediği toplam    2061 px   1717 px   (kutu 1920 px)
"Izgara" grubu              639 px    ~137 px
taşan düğme                     2         0
%100 toplam                1783 px   (taşma 0)
```

`Görünüm`'ün en sola dönmesi `HEAD`'deki hâline dönmek: kitaplık geçen turda
şeridin başına girip görünüm anahtarını bir grup sağa itmişti.

### 5 · "Her şeyi düzenleyebilelim" — sınıf değişimi dahil

Kullanıcı kararı: **hepsi**, dersin **sınıfını** değiştirmek de.

Yeni saf fonksiyon `moveLessonToClass()` (`entities.ts`), `transferLesson`'ın
aynası ve ters yönden yanlış olanı: `placements` **sınıfa göre** anahtarlı, yani
düz bir alan yazımı dersin bütün saatlerini eski sınıfın satırında bırakır.
Doğrusu her bloğu kaldırıp aynı kareyi yeni satırda **teklif etmek**; sığmayan
havuza döner. **Pinler düşer ve sayılır** — bir pin `classId|day|hour`, geride
kalırsa bir başkasının saatini kilitler.

Mutasyonla sınandı: naif `updateLesson(d, id, { classId })` konunca
`entities.test.ts` **3 testte** kırmızıya döndü.

Ekranlar: `LessonEdit` üç alandan **altıya** çıktı (sınıf · öğretmen · branş ·
saat · dağılım · günde en fazla), `Inspector` okunan panelden **düzenlenen**
panele geçti (öğretmen: ad · kısaltma · branş · 2. branş · cinsiyet · renk · üç
sınır; sınıf: ad · derslik · renk · günlük sınır; derslik: ad). Hiçbir kontrol
yeniden yazılmadı — hepsi Okul listesinin kendi kontrolü, aynı mutator'a bağlı.

Sağ tık menüsü de yeniden dizildi: yedi üst kalem, ikisi kapı.

```
Havuza kaldır · Dersi düzenle · Öğretmeni düzenle · Sınıfı düzenle
────
Dersi buraya sabitle          ← ÜST DÜZEYE geri döndü
Toplu sabitle ▸               (satır · sütun · gün)
────
Geçici görünüm ▸              (satırı/günü soluklaştır · gizle)
```

`ghostla` gitti: Türkçe ekranda İngilizce fiil. Mod hâlâ `ghost` — o kod.

### 6 · Havuz — sıra, süzgeç ve görünür ayrım

`poolSort` (beş sıra) ve `poolFilter` (branş) **`toolState.ts`'te**, çünkü ikisi
de bir POZİSYON: yeni `localStorage` anahtarı yok, "Veriler nerede" tablosuna
satır borcu yok.

Kartlar artık **başlıklı gruplar** hâlinde: satır rengi noktası + ad + sayı,
gruplar arası kıl çizgi, ve başlık **sıralamadan türüyor** (branşa göre
sıralayınca başlıklar branş olur). Kartın kendi kenarı da var
(`inset 0 0 0 1px color-mix(--on-color 22%)`).

**İki ölçüm turu gerekti ve ikisi de gerçek kusur buldu:**

```
grup kutusu `flex: 0 0 auto` iken (1920 px'lik tepside)
  sıra          grup   en geniş grup   yatay taşma   kırpılan grup
  boy'a göre       2        4015 px        2109 px         2
  kalan'a göre     7        1653 px              0         0
  %150 boy'a       2        6022 px        4123 px         2
```

`overflow-x: hidden` olduğu için o kartlar **erişilemezdi** ve ekranda hiçbir
şey olduklarını söylemiyordu. `flex: 0 1 auto; max-width: 100%` ile grup kendi
`flex-wrap`'ine düşüyor: **beş sıranın beşinde de taşma 0, kırpılan 0.**

İkincisi kısa ekranda: başlık kartların **üstünde**yken bir satır götürüyordu ve
tepsinin tabanı 6rem = 84 px (560 px'lik pencerede clamp oraya iniyor). Baş 32 +
başlık 24 + kart 40, 84'e sığmaz → tek kart satırı kırpılıyordu ve
`program.spec.ts`'in ekran dışı sürükleme testi kırmızıya döndü. Başlık
**yanlarına** alındı: dikeyde maliyeti sıfır.

### Dil — dört sözlük ELLE, 71 anahtar

`i18n.test.ts` ölü anahtarı söyler, **eksik anahtarı söyleyemez**: çevirisi
olmayan bir cümle doğru Türkçeye düşer ve susar (tuzak 87). Kaynağın istediği
her cümle sözlüklerle karşılaştırıldı: **71 eksik** çıktı, ve yaklaşık yarısı
bu turdan değil geçen turdan devrediyordu (`Göster` · `Saatler` · `Satır` ·
"Haftanın darlığı" cümleleri · program kitaplığının tamamı). Dördüne de elle
yazıldı; iki ölü anahtar silindi.

Doğrulama pitfall 89'un yoluyla: sayfa **Almanca** açıldı, `body.innerText`'te
Türkçe harf araması **sıfır satır** buldu, ve iki yeni menü de Almanca:
`["Ganzen Plan anheften", "Ausgeblendet (0)", "Alle zurückholen", "Stundenplan
leeren"]`, `["Ins Ablagefach", "Stunde bearbeiten", "Lehrkraft bearbeiten",
"Klasse bearbeiten", "Stunde hier anheften", "Mehrere anheften", "Vorübergehend
ausblenden"]`.

### Doğrulama

`npm run kontrol` **yeşil**: **718 birim · 507 E2E · 22 site · 7 çözücü.**
`npm run ekran` iki temada 19 görüntü, ve **bakıldı** — müsaitlik satırı,
kısalan ekleme bloğu, karttaki sönük raptiye, havuzun grup başlıkları.

```
dist/index.html   1 031 525 bayt
file:// açılış    FCP medyan 17 ms · en kötü 40 ms (7 koşu)
```

> **Boyut uyarısı, ve bu turun eseri DEĞİL.** CLAUDE.md'nin tabanı 489 815 bayt
> (2026-08-26). Bu oturumun İLK derlemesi — yani devralınan ağaç, tek satır
> yazılmadan — **1 002 837 bayt**tı; turun eklediği 28 688 baytın büyük kısmı
> 71×4 sözlük girdisi. Sıçramanın kendisi bitmemiş turda (`programs.ts`,
> `programMask.ts`, `@radix-ui/react-context-menu`) ve **ölçülmemiş**; bir
> sonraki turun işi.
> Açılış süresi de eski sayıyla (73 ms) **aynı yöntemle ölçülmedi**: bu satır
> `first-contentful-paint` girdisi, o satır başka bir kronometre.

---

> **İKİ MAKİNENİN DALI BURADA BİRLEŞTİ, ve sayılar yeniden ÖLÇÜLDÜ.** Otuz
> dördüncü oturum paralel koştu — **A**: AA turu, sınıfın kendi günlük sınırı
> ve **şema v11**; **B**: v8 dosyaları okunamıyordu, branş kısaltmaları,
> çözücünün ÖLÇÜMÜ, ızgarada **sağ tık menüsü ve sabitleme** — ve otuz beşinci
> oturum yalnız **A**'nın üstünde yazıldı. Yani aşağıdaki her oturumun kendi
> `npm run kontrol` satırı **kendi ağacının** sayısıdır ve birleşik ağacınki
> değildir; üçü de olduğu gibi bırakıldı, çünkü bir oturum kaydı o gün ölçüleni
> yazar. Birleşik ağaçta ölçülen: **704 birim · 500 E2E**.
>
> Birleşmenin kendi bedeli bir satırdı ve yazılı olması gerekiyor: **B**'nin
> sağ tık menüsü `@radix-ui/react-context-menu` getiriyor, `package.json`
> birleşmeyle geldi ama bu makinede paket **kurulu değildi** — `npm install`
> koşulana kadar duman testi dosyası hiç yüklenemedi ve vitest bunu
> *"1 failed | 23 passed"* diye gösterirken **çıkış kodu 0** döndürdü. İki
> makinede yürüyen bir depoda bir birleşmenin ilk adımı `npm install`.

---

## Otuz beşinci oturum — kaydıran kutu PANEL değil, LİSTE (2026-08-29)

> *"özet kutusu değil içindeki liste yukarı aşağı scrollanabilsin"*

Aynı günün AA2'sinin ikinci yarısı, ve düzeltilen şey tavan değil **kaydıran
kutu**. AA2 doğru bir şey söylüyordu — bir özet içindekinden boylanır ve ekranı
geçmez — ama scrollbar'ı panelin kendisine koymuştu: başlığın altındaki cümle,
uyarı kutusu ve tablonun altındaki branş listesi satırlarla birlikte gidiyordu,
ve kutunun kendi kenarı imlecin altından kayıyordu. Bu panellerde uzun olan şey
hep **tek** bir şey: öğretmen başına bir satır, varlık başına bir satır.

**Mekanizma tek satır ve hiç aritmetik yok.** Panel bir flex sütunu
(`.cols > aside > .panel:only-child`), yani içindeki her şey kendi boyunu
koruyor ve yer verebilen tek kutu liste oluyor. Veren şey `min-height`: bir
flex öğesinin tabanı `auto`, yani kendi içeriği — listenin hiç küçülmemesinin
sebebi tam olarak buydu. Geri verilen taban `6rem`, **rem** cinsinden, yani
`--ui-scale`'i izliyor: her basamakta "iki satır ve başlığı".

```
1920×1080, örnek okul, %100          panel      liste      panel taşması
Okul → Öğretmenler                   962 px     468/889    0
Okul → Sınıflar                      930 px     699/699    0
Müsaitlik                            898 px     742/740    0
Dersler (sınıf seçici)               714 px     595/593    0
Ayarlar → Zil saatleri               962 px     803/829    0

aynı ekran, %150                     panel      liste      panel taşması
Okul → Öğretmenler                   907 px     199/1156   0
Müsaitlik                            907 px     681/1075   0
Ayarlar → Zil saatleri               907 px     676/1154   0
```

**Panel `overflow-y: auto`'sunu KORUYOR, ama plan olarak değil son çare
olarak.** Küçülemeyen yarı tek başına ekrandan uzunsa oraya düşülüyor, ve
oradaki seçenek daha derli toplu bir kutu değil, **hiç ulaşılamayan içerik**.
Ölçüldü (1600×540, %100, Okul → Öğretmenler): liste `6rem` tabanında duruyor
(84 px), panel 156 px kaydırıyor, başlık yapışkan olduğu için yerinde kalıyor.

**İki tablo bir kutu kazandı**, çünkü sözleşme "tek panelli her rayda liste
kayar" ve o iki panelde kayacak bir kutu yoktu: Ayarlar → Kurallar'ın ihlal
listesi (satır sayısının tavanı yok) ve Ayarlar → Zil saatleri'nin önizlemesi.
İkincisi ölçülmüştü: 1080'de panel **25 px** taşıyordu, %150'de aynı fark
**478 px**.

**Kaydıran bir tablonun BAŞLIĞI da yapışkan oldu** (`.stat-scroll thead th`).
Panel başlığının savı bir kat aşağıda: artık kayan tek şey satırlarsa, "Açık"
ile "Yük"ün ilk gidecek şey olması her sayının anlamını götürürdü. Başlığın
altındaki çizgi `box-shadow: inset` — `border-collapse: collapse` altında
kenarlık hücrenin değil tablonun ızgarasının, ve yapışkan hücre zeminini
altından çekip kenarlığı geride bırakıyor.

**Test:** `kabuk.spec.ts` 83'ün iki testi. Birincisi iki kutu türünü de gezer
(`.stat-scroll` ve `.entity-list`), önkoşulunu iddia eder (tuzak 41) ve asıl
soruyu şöyle sorar: **listenin ALTINDAKİ şey yerinde mi kaldı.** Panel
düzeyinde bir scrollbar öteki bütün iddialardan geçer, bundan geçemez.
İkincisi son çareyi ölçer. İkisi de mutasyonla sınandı: flex sütunu
kaldırıldığında birincisi, taban kaldırıldığında ikincisi kırmızıya döndü
(*"liste 0px'e ezilmiş"*).

**Bir saat, tuzak 59'un ölçüm hâline gitti.** Müsaitlik'te ray 5 px kaydırıyor
göründü ve sebebi düzen değildi: sekme geçişi paneli `translateY(var(--slide))`
= 7 px aşağıdan soluyor, ve boyama bitmeden okunan bir `getBoundingClientRect`
paneli rayın 5 px altında gösteriyor. Testler artık ölçmeden önce
`document.getAnimations()`'ı bekliyor.

`npm run kontrol` yeşil: **698 birim · 490 E2E · 22 site · 7 çözücü.**
(Bu ağaçta **B**'nin turu yoktu; birleşik sayılar yukarıdaki nota yazıldı.)

---

## Otuz dördüncü oturum (A) — AA turu: beş satır (2026-08-29)

Kullanıcının yazdığı beş satır. Üçü düzen, biri veri modeli, biri bir sütun
başlığı. **Şema v10 → v11.**

### AA1 — ekleme kısmı kendi bloğu

Geçen turda aynı şikayet gelmişti ve cevabı bir **çizgi** olmuştu:
`.form-row.panel-add` üstünde bir `border-bottom`, ve o turun yorumu
*"nothing moves in the DOM"* diyordu. Yetmedi, ve neden yetmediği isteğin
kendisinde yazılıydı: *"aynı özetin ayrı blok olduğu gibi"*. Bir çizgi bir
şeyin nerede bittiğini söyler; bir panel ikisinin **ayrı şeyler** olduğunu
söyler.

Beş liste ekranının (Derslikler · Branşlar · Öğretmenler · Sınıflar · Dersler)
tek `.panel.step-panel`'i iki kardeş panele bölündü:

```
.panel.add-panel     Yeni derslik   + açıklama + form + (Excel'den yapıştır)
.panel.step-panel    Derslikler (8) + arama şeridi + tablo
```

Sayılı başlık **saydığı listeyle** gitti; ekleme paneli işi adlandırıyor. Yani
ekranda hâlâ tek bir `--fs-xl` başlık var (`.panel.step-panel h2`) ve o,
okunan satırların üstündeki. `Excel'den yapıştır` ekleme bloğunun köşesinde
kaldı — kullanıcının kendi cümlesi zaten *"o bloğun en sağında"* diyordu.
Uyarılar da bölündü: eklemeyi engelleyen uyarı ekleme panelinde (Dersler'in
iki kutusu), listedekiler hakkındaki uyarı liste panelinde (Öğretmenler'in
aynı kısaltma kutusu).

**Test 44 ("Panel simetrisi") iki panele yayıldı.** Ölçtüğü şey hâlâ bir
**sıra** — okuyanın önce neye rastladığı — ama artık ikisinin iki KUTU
olduğunu da iddia ediyor, çünkü istenen şey buydu:

```
.cols > div > .panel  ->  2 tane, ilki .add-panel, ikincisi .step-panel
add   ->  [baslik, aciklama, ekleme]      (uyari ayıklanarak)
list  ->  [baslik, …, liste]
```

Yol üstünde beş E2E seçicisi düzeltildi: `.cols > div .panel` artık iki panel
buluyor, o yüzden `.panel.step-panel` diye adlandırılmaları gerekti
(`kurulum.spec.ts` iki ölçüm, `dersler.spec.ts` iki başlık okuması).

### AA2 — kaydıran kutu SÜTUN değil, PANEL

Sağ ray zaten ekran boyunda sınırlıydı (`.cols > aside`, otuzuncu oturum).
Sınırlı olmayan şey panelin **kendisi**ydi, ve içindeki kutular kendi sabit
tavanlarını taşıyordu:

```
.stat-scroll   22rem     Özet'in kapasite tablosu
.entity-list   62vh      Müsaitlik'in varlık listesi
```

Yani bir panelin boyu **bu dosyadaki bir sayıdan** geliyordu, içindekinden
değil — otuz satırlık yer olan bir ekranda on satırlık bir pencere. İstenen
tam tersiydi: *"içlerindeki bilgilerin uzunluklarına göre uzunlukları
değişebilir ama en fazla tam ekranın uzunluğu kadar olsun."*

Artık `.cols > aside` bir flex sütunu, `.cols > aside > .panel:only-child`
`min-height: 0` + `overflow-y: auto`, ve o iki tavan orada geçersiz. Sonuç:
panel içeriği kadar uzun, en fazla `100cqh`, fazlası **panelin içinde**
kayıyor. Başlık yapışkan, yoksa hangi özeti okuduğunuzu söyleyen kelime ilk
gidecek şey olurdu.

`:only-child` bilerek: Çıktı'nın rayında dört panel var ve orada "panel ekranı
doldursun" yanlış olurdu; o ray kendi kaydırmasını koruyor.

**`18rem` tabanı da kalktı.** `max(18rem, 100cqh)` yazıyordu, yani kısa bir
pencerede taban tavanı aşıyordu — tavanı aşabilen bir taban tavan değildir
(tuzak 43'ün şekli).

Görülen kazanç (`npm run ekran` + elle bakma): Müsaitlik'te 25 öğretmenin
**hepsi** artık tek ekranda, altındaki `Tümünü aç / Tümünü kapat` düğmeleriyle
birlikte. Eskiden liste 62vh'de kesiliyor, düğmeler de onun altında kalıyordu.

Yeni test `kabuk.spec.ts` 83'te ve önkoşulunu **iddia ediyor** (tuzak 41):
kısa bir pencerede örnek proje yüklüyken önce "bu özet zaten sığıyorsa
ölçülecek bir şey yok" der, sonra kaydıran kutunun panel olduğunu, rayın
kaydırmadığını ve başlığın yerinde durduğunu ölçer. Kural silinerek kırmızıya
döndürüldü.

> **Aynı gün düzeltildi, bkz. otuz beşinci oturum.** Tavan doğruydu, kaydıran
> kutu değildi: scrollbar panelden **listeye** indi. Bu bölümdeki "fazlası
> panelin içinde kayıyor" ve "başlık yapışkan" cümleleri artık yalnız son çare
> için geçerli.

### AA3 — hata Özet'in en üstünde

İki şey birden yanlıştı ve ikisi de "sonra" ile ilgiliydi:

1. Uyarı kutuları (`dersliği yok`, `hiç dersi yok`) kapasite tablosundan ve
   altındaki listeden **sonra** yazılıydı — yani bir şeyin eksik olduğunu
   söylemek işi olan panelde, katlanın altında.
2. `CapacityRows`'un `problemsFirst` bayrağı Kontrol için yazılmış ve Özet'ten
   **hiç geçilmemişti**, yani "İmkânsız" bir satır listenin ortasında
   duruyordu.

İkisi de düzeltildi. Sorun yoksa hiçbir şey çizilmiyor — bırakılan bir başlık
ya da boşluk yok. `Colors` yerinde bırakıldı ve bu bilinçli: onun uyarısı
yanında **onu düzelten düğmeyle** geliyor.

İki yeni test, ikisi de mutasyonla sınandı. İkincisi ilk yazılışında
**bedavaya yeşildi** — kapattığı öğretmen listenin zaten ilk sırasındaydı,
yani sıralama kaldırılınca da geçiyordu (tuzak 23). Şimdi **son** öğretmeni
kapatıyor.

### AA4 — sınıfın kendi günlük sınırı, şema v11

Kural üç katmanlı oldu, ve eklenen katman ortadaki:

```
Lesson.maxPerDay              en dar    bir sınıfın bir öğretmenden aldığı ders
ClassGroup.maxSameLessonPerDay YENİ     o sınıfın bütün dersleri
settings.limits.maxSameLessonPerDay     bütün okul
```

Söylenemeyen cümle şuydu: *"510 bir günde aynı dersten en fazla 2 saat
görsün."* Okul geneli herkes için tek sayı, dersin kutusu ise
öğretmen-sınıf çifti başına tek sayı — yani o cümle o sınıfın **her dersine**
tek tek yazılmak ve sonradan eklenen her derse yeniden yazılmak zorundaydı.

Çözen tek yer hâlâ `lessonLimit()`. `group` parametresi **sondan ve isteğe
bağlı** (tuzak 76): yüzlerce çağrı yeri olduğu gibi derlendi, ve sınıfı zaten
elinde tutan sıcak yol (`limitBreaches`, `findViolations`) aramayı hiç
yapmıyor. Çözücü kendi mantığını yazmadı, imza değişikliği yetti.

Arayüz: kutu Okul → Sınıflar tablosunda (`LimitBox`, öğretmen sınırlarıyla
aynı), Ayarlar → Kurallar'da **"Kendi sınırı olan sınıflar (N)"** paneli —
öğretmen ikizinin aynısı — ve Dersler'deki kutunun placeholder'ı artık
**sınıfın** sayısını gösteriyor. Bu sonuncusu kozmetik değil: boş bir kutunun
kullanmayacağı bir sayıyı gösteren placeholder yalan söyler. Aynı sebeple
`blockCeiling` de sınıfı alıyor, ve yeni ders formundaki `undefined` çağrısı
formun **seçili sınıfını** veriyor.

**`parseState`'e `version === 10` eklendi.** O satırın üstünde duran
"IT HAPPENED" yorumu tam bunun için yazılmıştı: v9, `8`'i listeye koymayı
unutmuş ve yayınlanmış v2.0.0'ın yazdığı her dosya `null` dönmüştü. Yeni
`describe('parseState — v10 → v11 göçü')` üç şeyi ölçüyor: v10 dosyası
açılıyor ve her sınıf `null`'a düşüyor, program birebir duruyor, ve kutu
`asBox`'tan geçiyor (0 ve çöp → `null`, tuzak 43).

Ayrıca yol üstünde: `LimitBox`'ın `'yok'` placeholder'ı `t()`'den geçmiyordu.

### AA5 — kısaltma varsayılanı sütun başlığı oldu

Branşlar tablosunda adsız bir sütun her satırda `varsayılan` ya da
`varsayılanı: Mat` yazıyordu — kelime yirmi bir kez, sütunun başlığı ise boş.
Artık başlık **Varsayılan**, hücre yalnız değeri taşıyor, kutu zaten
varsayılanı tutuyorsa boş hücrenin kısa çizgisi (`–`). İki ölü anahtar dört
sözlükten elle silindi (tuzak 87: ölü anahtar tarayıcısı yorumlara da bakıyor,
yani unutulan biri yakalanmayabilirdi).

**Yol üstünde duran gerçek kusur:** sağdaki "Hazır branşlar" tablosu
`defaultSubjectShort()` çağırıyordu. O fonksiyon **bilerek Türkçe** — bir
override'ın karşılaştırıldığı biçim, ve dille birlikte kıpırdarsa
`subjectShorts`'a iki oturumda iki şey yazdırır (tuzak 91). Sonuç: İngilizce
ekran "Mathematics / **Mat**" yazıyor, listeye eklenince soldaki kutuya "Mth"
geliyordu. Soldaki ipucu bu hatayı zaten düzeltmişti ve yorumu anlatıyordu;
sağ panel `builtInShort()`'a geçirildi.

### Ölçülen

```
npm run kontrol      yeşil
  birim              698 test   (rules 23 · constraints 104 · store 56)
  E2E                489 test   3,3 dk
  site · sunucu      22 test
  çözücü             7 test     50 sn
dist/index.html      913 262 bayt   (öncesi 906 452 — +6,8 KB)
```

Yeni testler ve mutasyonla sınananlar:

| Test | Mutasyon | Sonuç |
|---|---|---|
| `kabuk.spec.ts` 83 · "uzun özet PANELİN içinde kayıyor" | `:only-child` kuralının gövdesi silindi | kırmızı ✅ |
| `kurulum.spec.ts` · "uyarı kapasite tablosunun ÜSTÜNDE" | uyarı kutusu tablonun altına geri taşındı | kırmızı ✅ |
| `kurulum.spec.ts` · "sorunlu satır EN ÜSTTE" | `problemsFirst` kaldırıldı | kırmızı ✅ |
| `rules.test.ts` · üç katman | `cls?.maxSameLessonPerDay` kaldırıldı | 3 test kırmızı ✅ |

### Bu turda öğrenilen (tuzak listesine girmedi ama girecek kadar pahalıydı)

**`git checkout -- <dosya>` bir mutasyonu geri almaz, o dosyadaki BÜTÜN
oturumu geri alır.** `Summary.tsx` üstünde bir mutasyon denenip geri alınırken
kullanıldı ve o dosyaya ait AA3'ün tamamını sildi — hiçbir hata vermeden,
çünkü commit edilmemiş her şey `HEAD`'e göre "değişiklik". Kalanı sadece
testler yakaladı. Doğrusu, denenen dosyayı önce bir yere kopyalamak.

---

## Otuz dördüncü oturum (B) — dört madde, ve yolun üstünde bir veri kaybı (2026-08-29)

> **Bu tur ile yukarıdaki AA turu AYNI GÜN, İKİ MAKİNEDE paralel koşuldu**
> ve `40bcaa5` üstünde birleştirildi. Aynı dosyaya dokunan tek yer
> `lessons/index.tsx` oldu: bu tur `BlockCounts`'u paylaşıma çıkarmıştı, AA
> turu ona sınıfın kendi limitini eklemişti. İkisi de duruyor —
> `components/BlockCounts.tsx` artık üçüncü bir parametre alıyor.

Kullanıcının dört satırı: *"Öğretmenler listelerde branşlarda kısaltmalar ·
Program kısmında branşlar kısaltmalar olsun sol tarafta · Program otomatik
dizmeye bakmak lazım · Programda derslere sağ tıklayınca seçenekler gelsin:
kaldır, dersi düzenle, dersi oraya sabitle"*.

### 0. YAYINLANMIŞ v2.0.0'IN YEDEKLERİ AÇILMIYORDU — ilk iş buydu

`5fc0316` şemayı 8'den 9'a çıkardı ve `store.ts`'in kabul listesine
**`version === 8`'i yazmadı**. O listenin üstünde tam bu hatayı anlatan bir
yorum duruyordu:

> *"Bumping SCHEMA_VERSION without adding the number it used to be makes every
> backup the previous release wrote fall through to `return null` below — which
> is the one failure this whole function exists to prevent."*

Yorum doğruydu ve **hiçbir şeyi engellemedi**: bir cümle bir koşuda kırmızıya
dönemez. Babanın elindeki kopya v2.0.0 (`git show 31fc6c8:src/types.ts` →
`SCHEMA_VERSION = 8`), yani o kopyanın yazdığı her yedek ve her plan
`parseState`'ten `null` dönüyordu — ekranda "dosya okunamadı".

v6 ve v7 için birer test vardı (`store.test.ts:456`, `:538`) ve **ikisi de bunu
göremezdi**: her biri bir SAYI adlandırıyor, ve bir sonraki bump'ta geride
kalan sayı hep başkası oluyor. Yazılan dördüncü test numara adlandırmıyor:

```ts
raw.schemaVersion = SCHEMA_VERSION - 1;
expect(parseState(JSON.stringify(raw))).not.toBeNull();
```

Mutasyonla sınandı: `version === 8` geri çıkarıldığında **dört test birden**
kırmızıya döndü. Yeni tuzak 97.

**Aynı turda `main`'de bulunan iki kırmızı daha** — ikisi de `8341b98`
("yarıda kestik") commit'inden, yani yarım bırakılmış bir taşımadan:
`npm run tipler` **5 hata** veriyordu (`availClock` Ayarlar → Görünüm'den
çıkmış, App hâlâ ona veriyordu) ve `@types/node` **kurulu değildi**;
`i18n.test.ts` **4 kırmızı** veriyordu (kaldırılan ekranın 5 sözlük anahtarı
dört dilde duruyordu). Üçü de kapatıldı: `availClock` Müsaitlik'in kendi
şeridine bağlandı, `gorunum.spec.ts` 50 o kontrolü yeni evinde arıyor.

### 1. Branş kısaltmaları — ve sol sütun kendi ölçümüyle daraldı

Tek kaynak zaten vardı (`subjectShort`), yeni fonksiyon yazılmadı. Üç yer:

| Nerede | Önce | Sonra |
|---|---|---|
| Izgaranın sol sütunu | `Türkçe · Edebiyat` (kırpılıyordu) | `Trk · Edb` |
| Müsaitlik listesi | `MÇ · Mehmet Çelik (Matematik)` | `MÇ · Mehmet Çelik (Mat)` · ve **ikinci branş da** |
| Kurulum → Öğretmenler'in iki açılır listesi | `Matematik` | `Mat · Matematik` |

Kullanıcının seçmediği yerler değişmedi (Dersler, komut paleti, Görünüm).
**Çip süzgeci de değişmedi ve bu bir ölçüm değil bir çakışma:** `Matematik 1`
ile `Matematik 2` aynı kısaltmaya (`Mat`) düşüyor, yani çipleri kısaltmak iki
ayrı branşı sessizce tek süzgeçte birleştirirdi.

**`--rowhead-w` 6.75rem → 5.25rem, ve karar ölçümün kendisinden çıktı.**
`izgara.spec.ts` 68 tarayıcıya "bu hücre neye ihtiyaç duyuyor" diye soruyor ve
%20'den fazlasını reddediyor. Kısaltmaya geçince:

```
satır başı VAR    94,5 px
satır başı GEREKEN 66,0 px      -> 94,5 > 66 x 1,2 = test KIRMIZI
```

Yani daralma bir zevk değil, duran testin talebiydi. 5.25rem = 73,5 px: 66'yı
7,5 px payla geçiyor ve kalan **21 px 72 ders sütununa** gidiyor. Testin
sondası da güncellendi — `"Sosyal Bilgiler"` artık o hücrenin çizebileceği bir
dize değil, iki aday ölçülüp büyüğü alınıyor.

### 2. Otomatik dizme — ÖLÇÜLDÜ (karar: "önce ölç, sonra karar")

STATUS'ün 7. açık maddesi *"çıktı kalitesi ölçülmedi"* iki yıldır duruyordu.
Ölçüldü. Örnek okul, boş ızgaradan, `solve()` doğrudan:

```
faz              solved
blok             367/367        saat 433/433, havuzda 0
düğüm            367            -> hiç geri sarma yok
süre             69 ms          (v7 döneminde 292 ms'ti)
YASA DIŞI blok   0
KALİTE sınıf     268 boş saat · 117 sınıf-günü · 433/701 doluluk · delikli gün 85
KALİTE öğretmen  274 boş saat · 110 öğretmen-günü · delikli gün 96
KALİTE yayılma   öğretmen başına 4,40 gün / 6
```

**Yasallık ve tamlık kusursuz; kusur kalitede.** Bir öğretmen okula geldiği
günlerin **%87'sinde** arada boş saat bekliyor. Sebep kodda yazılı ve kasıtlı:
`order()` yayıyor (1. kural sınıfın o dersten en az olduğu gün, 2. kural
öğretmenin en az yüklü olduğu gün) ve hafta %30 dolu olduğu için yaymak deliği
garanti ediyor.

İki düzeltme **denendi ve ölçüldü**, ikisi de uygulanmadı — karar kullanıcının:

| Deney | Sonuç |
|---|---|
| **A**: öğretmeni günlere yayma yerine SIKIŞTIR (`order` 2. kuralı ters) | ❌ öğretmen deliği 274 → **227** ama blok **363/367**, düğüm 367 → **47 373**, süre 69 ms → **9 856 ms**, faz `stuck`, sınıf deliği 268 → **284** |
| **B**: sınıfın o gün dolu saatine YASLANAN hücreyi tercih et (yayma kuralları aynı) | ✅ sınıf deliği 268 → **251**, delikli gün 85 → **72** · blok yine **367/367**, düğüm yine **367**, süre **71 ms** |

Deney A tuzak 21'in ta kendisi: teoride doğru olan ölçülmeden konmuyor.
Deney B bedava görünüyor ve **bu turda uygulanmadı** — çözücüye özellik
eklemek ayrı bir karardı.

### 3. Sağ tık menüsü, ve SABİTLEME (şema **v9 → v10**)

Sağ tık bloğu doğrudan havuza gönderiyordu; artık üç kalemlik bir menü açıyor:
**Havuza kaldır · Dersi düzenle · Dersi buraya sabitle**.

`@radix-ui/react-context-menu` alındı — konumlama, klavye gezinmesi, Escape,
dışarı tıklama ve odağın geri dönmesi elle yazılmıyor. **Tek bir
`ContextMenu.Root` bütün tabloyu sarıyor**, 2100 hücreye tetikleyici konmuyor:
tıklamanın nereye düştüğü `data-row/day/hour`'dan okunuyor, yani `drag.ts` ile
aynı yerden. Karta gelmeyen sağ tıkta `preventDefault()` çağrılıyor ve Radix'in
kendi işleyicisi hiç koşmuyor (`composeEventHandlers` önce bizimkini çağırıp
`defaultPrevented`'a bakıyor).

**`State.pinned: Record<'${classId}|${day}|${hour}', 1>`** — `unavailable`'ın
birebir deseni. Hücreye bağlı, derse değil: bir ders birden çok blok hâlinde
iniyor ve kilitlenen bir **kare**.

Sözleşme tek cümle ve istisnası yok: **sabitlenmiş bir bloğu sabitlemeyi
kaldırmaktan başka hiçbir şey indirmez.** Beş yol da aynı yere çıkıyor —
`removeBlock` (sağ tık · menü · Delete), `dropMap` (üstüne bırakma),
`solver.ts` (`keepPlaced: false` artık pinlileri tohumluyor), ve şeritteki iki
yıkıcı düğme (ikisi de pinli saatleri **saymıyor** ve yerinde bırakıyor).

**Kilidi `removeBlock`'a koymak bir şeyi kırdı ve denetçi yakaladı:**
`illegalBlocks()` her bloğu kaldırıp `blocker()`'a "buraya geri konabilir mi"
diye soruyor, ve o bir **kural** sorusu — bir pin kural değil. Kilitli bloğu
kaldıramayınca denetçi onu "kendisiyle çakışıyor" diye raporladı. Çare iki ad:
`liftBlock()` mekanik, `removeBlock()` = kapı + `liftBlock`. Yeni tuzak 98.

### 4. Yerinde ders düzenleme

`src/components/LessonEdit.tsx` — `Inspector.tsx`'in deseni (context + Radix
Dialog). Üç alan: **haftalık saat · dağılım · günde en fazla**, üçü de aynı
`updateLesson`'dan geçiyor. Mantık kopyalanmadı: `BlockCounts` ve
`blockCeiling` `lessons/index.tsx`'ten `components/BlockCounts.tsx`'e taşındı
ve iki ekran da oradan okuyor.

**Ekran görüntüsü bir kusur yakaladı** (tuzak 82'nin deseni): sabitleme işareti
ilk hâlinde sağ ÜST köşedeydi ve sınıf numarasının son basamağının üstüne
biniyordu — 34 px'lik hücrede kalın ilk satır iki üst köşeyi de dolduruyor.
Sol ALTA taşındı; sağ alt zaten çakışma kamasının (`.card.conflict`). Hiçbir
test göremezdi: düğme oradaydı, görünürdü, `aria-label`'ı doğruydu.

### Ölçülen — bağımlılık politikasının şartı

```
dist/index.html   903 307 bayt  ->  967 411 bayt   (+64 104 · +62,6 KB)
```

İçindekiler: `@radix-ui/react-context-menu`, `LessonEdit.tsx`, menü ve
sabitleme CSS'i, ve dört dile giren 18 yeni anahtar.

### Testler

```
birim     696   (679 -> +17: sabitleme, v8/v9 göçü, remapDays'in pinleri)
E2E       485   (469 -> +16: menü, sabitleme, düzenleme penceresi)
```

`npm run kontrol` yeşil. Paralel koşuda düşen 8 test **tek worker'la
163/163 geçti** — TASKS'te kayıtlı "reload'dan sonra düşme" flake'i, bu turun
işi değil.

---

## Otuz üçüncü oturum — kayma, ve exe'nin adresi (2026-08-29)

İki şikayet, ikisi de ölçüldü, ikisinin de karşılığı bir test.

### 1. "Alt bardaki seçenekler arasında geçerken bazen kayıyor"

**İki bağımsız sebep**, ve ikisi de bir eşiğin hangi tarafına düştüğünüze
bağlı olduğu için "bazen" görünüyordu.

**a) Şerit kendini kaydırıyordu.** `.ribbon-group` eşit sütunlu bir grid, yani
sütun genişliği **en geniş** düğmenin max-content'i — ve basılı düğme
`font-weight: 600` çiziliyordu, yani bir **ölçü**. Kurulum'un dört listesinde
ölçüldü:

```
"Öğretmenler 25"   400 -> 128,19 px      600 -> 130,59 px
en sondaki düğmenin x'i        490,9  <->  498,2      (7,3 px)
```

Yani en uzun seçeneği basmak dört kutuyu birden genişletiyor, başka birini
basmak geri alıyordu. Üstteki sekme çubuğu **aynı** ızgarayı kullanıyor ve hiç
kıpırdamadı: `.tab[aria-current]` nerede olduğunu yalnız renkle söylüyor.
Şerit de artık öyle.

**b) Altındaki sayfa 10 px yana adım atıyordu.** `.main`'de ayrılmış bir
kaydırma çubuğu oluğu yoktu:

```
Ayarlar -> Zil ve günler   taşmıyor   panel 1538,5 px
Ayarlar -> Görünüm         taşıyor    panel 1528,5 px
Okul    -> Derslikler      taşmıyor   ·  Branşlar/Öğretmenler/Sınıflar taşıyor
Dersler -> Genel           taşıyor    ·  öteki iki mod taşmıyor
```

`styles.css` `scrollbar-gutter: stable`'ın "kaydıran panellerde" kurulu
olduğunu **yazıyordu**; kurulu olduğu tek yer komut paletiydi. Şimdi `.main`'de
kurulu, ve Program sekmesi muaf (`overflow: hidden` de Chromium'a göre bir
kaydırma kabı: `stable` orada `.grid-wrap`'i 1920'den **1910**'a düşürüyordu).

**Süitin bunu görmesi imkânsızdı:** Playwright Chromium'u `--hide-scrollbars`
ile açıyor, yani 469 testin hiçbirinde ölçülecek bir çubuk yoktu.
`e2e/kayma.spec.ts` kendi tarayıcısını açıyor ve oluğun **yer kapladığını**
iddia etmeden önce ölçüyor. Üç testin üçü de mutasyonla sınandı: düzeltmeler
tek tek geri konunca üçü de kırmızıya döndü.

### 2. "Babamın verileri gitmez değil mi?" — gidiyordu

Yayınlanmış **v2.0.0 bir veri kaybı taşıyor**, ve sebebi ad turunun tek
gözden kaçan satırı: `tauri.conf.json`'ın `identifier`'ı `productName`'le
birlikte `com.dersprogrami.arac` → `me.mozaik.arac` yapılmıştı. Tauri
WebView2'ye profil olarak `%LOCALAPPDATA%\<identifier>` veriyor, yani o dize bir
ad değil bir **adres**. Bu makinede ölçüldü:

```
%LOCALAPPDATA%\com.dersprogrami.arac\EBWebView\Default\Local Storage\leveldb
  -> ders-programi · ders-programi-planlar · ders-programi-yedek-0 · ...
     köken: http://tauri.localhost
```

O commit'ten derlenen exe **bomboş** açılır: veri diskte durur, program ona
bakmaz, konsol temiz, ekranda hiçbir cümle sebebini söylemez. Geri alındı;
`src/surum.test.ts` dizeyi çiviliyor (mutasyonla sınandı) ve `productName`'in
hâlâ `Mozaik` olduğunu ayrıca ölçüyor. Ekrandaki ad değişmedi.

**Ölçülen, iddia edilmeyen — güncelleme yolu:**

```
releases/latest/download/surum.json  ->  2.0.0 · 2026-08-29 · Mozaik.exe · 3 732 480 bayt
exe'nin kendini güncellemesi         ->  v1.3.0 ve sonrası (update.rs, 22a8e2d)
exe'nin Belgelerim'e yazması         ->  v1.1.0'dan beri, TIKLAMASIZ
```

Yani ≥ v1.3.0 bir kopya **şu anda** v2.0.0'ı görüyor ve alabilir. Düzeltme
yayınlanana kadar o üç düğmeye basılmamalı. Ve en kötü durumda bile veri
kurtarılabilir: eski profil klasörü silinmiyor, artı exe her açılışta
`Belgelerim\Ders Programı\ders-programi-tumu.json`'ı zaten yazıyor.

### Sayılar

```
birim   639 -> 641      (kimlik: iki test)
E2E     469 -> 472      (kayma.spec.ts: üç test)
tipler  temiz           npm run tipler
```

---

## Otuz ikinci oturum — D5 · D6 · D7 · Mozaik (2026-08-29)

TASKS'in *ŞİMDİ SIRADA*'sı bir sonraki oturumun ilk işini adıyla yazmıştı:
**D5'in sözlüğü**. Bu oturum onu ve yanındaki üç maddeyi bitirdi.

### Ne yapıldı

| Madde | Sonuç |
|---|---|
| **D5** sözlük | 9 anahtar → **814**, arayüzün tamamı |
| **D6** DE · ES · FR | üç sözlük daha, aynı 814 anahtar |
| **D7** ilke 4 | yeniden yazıldı: Türkçe **kaynak dil** |
| **Mozaik** | ad değişti, **verinin adı değişmedi** |

### Makinenin eksik üç parçası

Altyapı v2.0.0'da kurulmuştu ama sözlük yazılamıyordu, çünkü üç şey yoktu:

1. **Saf modüllerin çevirmeni.** `constraints.ts` "MÇ Salı 3 saatinde müsait
   değil" yazıyor ve `useT()` çağıramaz. `i18n.ts` zaten modül düzeyinde
   sözlük tutuyordu; yanına **aktif dil** ve çıplak bir `t()` kondu. Tek
   yazan `applyDil()`, ve o zaten ilk boyamadan **önce** (main.tsx) ve her dil
   değişiminde (`setDil`, `setState`'ten önce) koşuyor.
   Alternatifi `t`'yi parametre olarak geçirmekti: gün ve saatin yanına
   üçüncü bir sayı-şeklinde argüman, yani **tuzak 76**.
2. **Çoğul.** Türkçe sayıdan sonra ek almaz, öteki dördü alır. Sözlük
   **değeri** `{n:tekil|çoğul}` yazabiliyor; kategoriyi `Intl.PluralRules`
   seçiyor, `n === 1` değil — **Fransızca 0'ı "one" sayar, İspanyolca
   saymaz**, ve "0 sınıf" boş bir projenin söylediği şey. Tarayıcıda gömülü:
   sıfır bayt, çevrimdışı (ilke 3).
3. **Veri metinlerinin sınırı.** Gün ve branş adları `State`'e yazılıyor.
   Karar: **depoda Türkçe, ekranda çevrili.** Yeni yaprak modül
   `src/names.ts`, ve yeri bir zorunluluk: `entities.ts` zaten
   `constraints.ts`'i çağırıyor, yani ikisinin de ihtiyacı olan sözcükler
   ikisinin de **altında** durmalı (`keys.ts`'in deseni).

### Ölçülen — iddia edilmeyen

```
TR + EN yalnız      642 729 bayt   ·  82 ms medyan   (7 koşu, file://, 1920×1080)
beş dil             893 424 bayt   ·  83 ms medyan
```

Yani üç sözlük daha **242 KB** ekliyor ve açılışa **1 ms bile eklemiyor**:
gömülü metin ayrıştırılmıyor, yalnızca taşınıyor.

### Sözlüğün kendi denetçileri — beşi de MUTASYONLA sınandı

| Denetçi | Sabotaj | Sonuç |
|---|---|---|
| ölü anahtar | kaynakta olmayan bir cümle | kırmızı |
| yuva kümesi | çeviriden `{n}` düşürüldü | kırmızı |
| dengeli `**` | (mevcut) | — |
| çoğulun iki biçimi | `{n:Stunden}` tek biçim | kırmızı |
| uzun çizgi | Almanca bir cümleye `—` | kırmızı |
| `applyDil` → aktif dil | `setAktifDil` çağrısı silindi | kırmızı |

### EKRANA BAKILDI, ve on dört yerde Türkçe duruyordu

Bu turun en önemli ölçümü bir test değil. **Hiçbir test göremezdi ve görmesi
de gerekmezdi:** bütün süit `kapan.ts`'te Türkçeye sabitli, ve Türkçede `t()`
anahtarın kendisini döndürüyor — yani **çevrilmemiş bir metin, Türkçe ekranda
çevrilmiş olandan ayırt edilemez.**

Onları bulan iki şey oldu: İngilizce açılmış sayfanın `body`'sini okuyup
Türkçe harf arayan bir tarama, ve **Almanca ekran görüntülerine bakmak**
(en uzun dil, en dar satır).

Bulunanlar: `Dersler` sekmesinin adı · altı panel başlığı (`Derslikler (8)`,
`Planlar (N)`, `Kural ihlalleri (N)`, `Yerleşemeyen dersler (N)`, `Kendi
sınırı olan öğretmenler (N)`, `Şu anki ihlaller (N)`) · **ızgaranın ve
kâğıdın gün başlıkları** · havuzun "N blok bekliyor"u · `Yazdır (N kâğıt)` ·
üst çubuktaki durum çipi · şeridin görünüm düğmeleri ve Kontrol'ün atlama
düğmeleri · örnek veri toast'ı · zil önizlemesinin gün listesi · branş açılır
listeleri · `Ders (dk)`.

Yanlarında **iki gerçek kusur**:

- **Çoğul listelerde yoktu.** Almanca ekranda `8 Raum` yazıyordu. Sebep:
  sayı `ListTools`'un cümlesinde değil bir **yuvadaydı**, ve bir yuvanın
  içeriği çoğullanamaz. `countKey` prop'u eklendi — sayı artık çevrilen
  anahtarın **içinde**.
- **`varsayılanı: İng`** İngilizce ekranda da öyle yazıyordu. Branş
  kısaltmasının **iki** varsayılanı var ve bu bilerek: biri karşılaştırma
  değeri (Türkçe kalmak zorunda, yoksa aynı projenin iki oturumu
  `subjectShorts`'a başka şey yazar), öteki çizilen. İpucu yanlış olanı
  okuyordu.

### "Reload'dan sonra flake"in sebebi bulundu, ve KOD çıktı

Geçen tur STATUS'e *"`dil.spec.ts` ve `hareket.spec.ts` yük altında
kararsız"* diye yazılmıştı ve teşhis **yük değildi**: `revealRibbon`
yardımcısı `.main` yoksa **sessizce dönüyordu**. Boyanmamış bir sayfada
hiçbir şey dürtülmüyor, şerit katlı kalıyor ve iddia beş saniye sonra
düşüyordu. Artık bekliyor, bulamazsa **fırlatıyor**.

Yanında ikinci bir şey: yirmi kadar test çıplak `page.reload()`'dan sonra
ekranı okuyordu — `open()`'ın yaptığı iki bekleyişin **hiçbirini** yapmadan.
Yeni `reopen()` yardımcısı ikisini de yapıyor.

**Kalan artık:** beş tam koşunun ikisinde **bir** test düşüyor, her seferinde
başkası, hep bir `reload`'dan sonra, ve tek başına koşunca geçiyor. İki
worker'la da düştü, yani salt aşırı yüklenme değil. **Bir sürümü durduracak
bir kusur değil ama yazılı duruyor** ve bir sonraki turda bakılacak.

### Sayılar

```
tipler (tsc x2)                                ✓
639 birim + 469 E2E + 22 site + 7 çözücü       temiz koşuda hepsi yeşil
npm run patrol                                 4/4, konsol temiz
npm run paket                                  dist-kurulum/ 952 690 bayt
beş dilde ekran görüntüsü                      30 görüntü, BAKILDI
```

`cargo test` bu makinede **koşmadı** — Rust kurulu değil, ve `exe:test`
zaten `kontrol`'ün parçası değil. Rust'ı derleyen tek yer
`.github/workflows/surum.yml`.

---

## Sürüm — v1.4.0 (2026-08-28)

Y turu etiketlendi ve itildi. Bu sürümün taşıdığı iki şey **koddan önce
bekliyordu**: görev çubuğu işaretinin `.ico`'su (tuzak 78, eşik 20'ye indi) ve
`kur.ps1`'in kısayol tazelemesi. İkisi de v1.3.0'ın exe'sinde yoktu, yani
babanın makinesine ancak bu sürümle ulaşırlar.

Etiketten önce koşan kapı, **hiçbir şey `dist/`'e dokunmadan**:

| Katman | Sonuç |
|---|---|
| `tipler` (tsc x2) | ✓ |
| Birim (Vitest) | **612** ✓ |
| E2E (`file://`) | **466** ✓ |
| Site · sunucu · klasör (http) | **22** ✓ |
| Çözücü stresi | **7** ✓ (50,3 sn) |

**Bir kayıt, çünkü tekrarlanacak:** ilk tam koşuda iki test düştü
(`dil.spec.ts` ve `hareket.spec.ts`), ikisi de tek başına koşturulunca geçti,
ve ikinci tam koşuda **466/466** yeşil geçti. Yani bu ikisi yük altında
kararsız — geçen turun "flake'lerin sebebi kendi derlemelerimdi" teşhisinin
kapsamadığı bir kalıntı. Bu koşuda hiçbir derleme süitle üst üste binmedi,
o yüzden sebep o değil. Düşen iki testin ortak yanı bir **reload'dan sonra
okuma**: `chooseLang` ve `revealRibbon`. Bir sonraki turda bakılacak; şimdilik
bir sürümü durduracak bir kusur değil, ama **yazılı** duruyor.

Bir tuzak da bu oturumda ikinci kez göründü: `npm run kontrol 2>&1 | tail -60`
zincirinde okunan çıkış kodu **`tail`'inki**, yani iki kırmızı testin üstünde
0 gördüm (tuzak 62). Boru varsa `PIPESTATUS` okunur.

---

## Otuz birinci oturum — Y turu: arayüzün şekli (2026-08-28)

Ayrıntı [TASKS.md](TASKS.md) → *Y turu*; burada **ölçülenler**.

Bu turun ilk adımı hiç ürün kodu yazmadı. İki sayı bütün düzen kararlarını
belirledi, ve ikisi de tahmin edilebilirdi — biri tahmin edilseydi turun
yarısı yanlış olurdu.

### Ölçüm 1 — tablo fazlası nereye gidiyor

Şikayet: *"Listelerdeki satırlar en sona kadar gitsin. Böyle cücük kadar
oldular güzel de gözükmüyor."* Önce kusurun büyüklüğü ölçüldü — tablonun sağ
kenarı ile panelin iç sağ kenarı arasındaki fark, 1920×1080, örnek okul:

| Liste | %100 | %125 | %150 |
|---|---|---|---|
| Derslikler | **-1094 px** | -888 | -681 |
| Sınıflar | -965 | -726 | -487 |
| Öğretmenler | -496 | -170 | +157 |

Sonra dört aday **denendi**, çünkü doğru görünen ikisi yanlıştı:

| Aday | Panel doluyor mu | `Ad` sütunu |
|---|---|---|
| `width: 100%` + `min-width: max-content` | evet | 187 → **640,8** ✗ |
| `min-width: 100%` + `width: max-content` | evet | 187 → **640,8** ✗ |
| ↑ + `th:last-child { width: auto }` | evet | **187, değişmedi** ✓ |
| `th:last-child { width: 100% }` | — | tablo **1 000 000 px** ✗ |

Sonuncusu tuzak 88 oldu: bir hücrenin yüzdesi tablonun genişliğine göre
çözülür, tablonun genişliği de hücrelerden gelir. Hata verilmedi.

**Seçilen** (`min-width: 100%; width: max-content` + son sütun `auto`) ile
ölçülen son durum:

| | %100 | %110 | %125 | %150 |
|---|---|---|---|---|
| Tablo sağ kenarı − panel iç kenarı | −1 px | −1 px | −1 px | −1 (Öğretmenler taşıyor) |
| `.table-scroll` taşması | 0 | 0 | 0 | 211 (yalnız Öğretmenler) |
| `Ad`, ÜÇ listede de | 187 | 205,8 | 233,8 | 280,6 |
| Sayfa yatay taşması | 0 | 0 | 0 | 0 |

### Ölçüm 2 — `--aside-w`

Şikayet: *"Listelerin yanındaki bloklar kesinlikle sağ sol oynatma olmasın."*
Dört `.cols` varyantı vardı (`wide-left` · `narrow-right` · `solo` · 50/50), o
yüzden sağdaki blok neredeyse her ekranda başka bir x'te başlıyordu. Her yan
sütun `width: min-content`'e zorlandı ve ne istediği okundu (rem, panel dolgusu
dâhil — ölçekten bağımsız):

| Nerede | İstediği |
|---|---|
| **Müsaitlik `.entity-list`** | **23,50 rem** ← bağlayıcı |
| Çıktı sayfa seçimi | 20,57 |
| Okul Özet | 20,29 (daha önce ölçülen 19,94 ile uyumlu) |
| Ayarlar zil önizlemesi | 16,47 |
| Dersler seçicisi | 11,03 |

Seçilen **23,5rem**, ve iki kanarya bu genişlikte yeniden ölçüldü: Çıktı'nın
`.pick-item`'ı %100'de de %150'de de hiçbir metnini kırpmıyor (tuzak 64), ve
Okul → Öğretmenler'in `.table-scroll` taşması %100/110/125'te hâlâ tam 0.

**Sonuç:** on dört ekranın on dördünde sağ ray tam olarak **x = 1568 px**.

### Kontrol sayfası

`.panel-grid` satır sıralı yerleştiriyordu, yani her ızgara satırı en uzun
paneli kadar uzundu: "Yerleşemeyen dersler" 25 satırlık öğretmen tablosunun
boyladığı bir satırın tepesinde, altında ~600 px boşlukla duruyordu.

| | önce | sonra |
|---|---|---|
| Sayfa boyu (örnek okul, 1080 px görünen) | ~3 ekran | **1,09 ekran** |
| Sınırlı yükseklikli tablo | 0 | 3 |

### Bu turda mutasyonla denenen üç şey

Üçü de yeşil geçebilirdi ve üçü de bilerek kırıldı:

1. **v1/v2 göçü.** `migrateV2toV3` `emptyState().settings`'i yayıyor; branş
   listesi boşalınca eski yedeklerin her öğretmeninin branşı "listede değil"e
   düşecekti. Düzeltme geri alındı → test kırmızı. ✓
2. **Tablo kuralı.** Eski `width: max-content` geri kondu → yeni test
   *"%100 Derslikler: tablo panelin 1048px gerisinde bitiyor"* dedi. ✓
3. **`i18n.test.ts`.** İki ölü sözlük anahtarı bilerek geri kondu → süit
   **yeşil geçti** (tuzak 87). Bu üçüncüsü bir düzeltme değil, aletin kendi
   körlüğünün kaydı.

### Tur boyunca görülen "flake"lerin sebebi bulundu: kendi derlemelerim

Turun ortasında yapılan tam koşuların çoğunda **tek** bir test düşüyordu, her
seferinde **başka biri**, ve düşen her test tek başına koşturulunca geçiyordu.
İlk teşhis "paralel yükte kararsızlık" oldu ve **yanlıştı**.

Gerçek sebep daha sıkıcı: ölçüm betiklerim `npm run build` çağırıyor, yani
süit `dist/index.html`'i okurken o dosya **altından yeniden yazılıyordu**.
Süit `file://` üzerinden tek bir dosyayı okuyor (bkz. `helpers.ts`), o yüzden
derleme ile koşuyu üst üste bindirmek testin ölçtüğü şeyi değiştiriyor.

Hiçbir şeyin `dist/`'e dokunmadığı son koşu: **`npm run kontrol` çıkış kodu 0**
— 612 birim · 466 E2E · 22 site/sunucu/klasör · 7 çözücü. Kayda geçen ders:
*bir süit koşarken derleme yapılmaz*, ve "flake" teşhisi konmadan önce koşunun
girdisinin sabit olduğu doğrulanır.

---

## Otuzuncu oturum — X turu: on iki madde (2026-08-28)

Ayrıntı [TASKS.md](TASKS.md) → *X turu*; burada **ölçülenler**.

### Üç kusur, üçü de aletin körlüğünden görünmüyordu

Bu turun asıl bulgusu bir özellik değil: **üç ayrı yerde test doğru soruyu
soruyor ama yanlış aletle ölçüyordu**, ve üçü de kullanıcı tarafından
bildirildi.

| Kusur | Alet ne diyordu | Gerçek |
|---|---|---|
| İmleç haçı kayıyor | haç testi **boş ızgarada** koşuyor, birleşmiş blok yok | 7 hücre imlecin altında değil |
| Baskı "Büyük"te bozuluyor | `.print-page`'in `scrollHeight - clientHeight` = **0** | 714 px yerde **739 px** içerik |
| Yan sütun sayfayı uzatıyor | ölçen hiçbir şey yoktu | Derslikler'de sol 636 px, sayfa **1092 px** |

Üçünün de yanına ölçen bir test yazıldı ve **üçü de mutasyonla denendi**: eski
kod geri konunca üçü de kırmızıya döndü (7 hücre · 25 px · 1092 px).

### Ölçülen değerler

```
imleç haçı        data-col ile, colSpan'den bağımsız    imlecin altında 0 sapma
hayalet kart      width = --cell-w × blockSize          ikili tam iki hücre
ad sütunu         Derslikler · Öğretmenler · Sınıflar · Branşlar
                  hepsinde 187 px  (öncesi: panelin tamamı, ~900 px'e kadar)
şerit başlığı     --ribbon-lead-w  9.8em -> 6.2em       çizgi 7 sekmede ±0.5 px
baskı             9 birleşim × 2 ortam = 18 ölçüm       taşma 0, sayfa TAM dolu
                  (kullanılan == yer: 714/714 ve 357/357)
yan sütun         .cols > aside  max-height 100cqh      Derslikler 1092 -> 994 px
                  Yazdır yan sütun 1491 -> 966 px       Öğretmenler 2310 -> 1189
dist/index.html   565 214 bayt                          (öncesi 552 759)
```

### Yazdırmanın kökü bir SAYIydı

`--p-row: 23mm` iki yıl boyunca doğru bir sayıydı ve doğru olmaktan çıkışı
sessizdi: `--p-zoom` yalnız yazıyı çarpıyor, hiçbir kutuyu çarpmıyordu. Başlık
ve saat satırı büyüyünce 205 mm'lik sayfada yer kalmıyor, ama satır yüksekliği
bir **taban** olduğu için hiçbir şey esnemiyordu. Çare sayıyı değiştirmek değil
**kaldırmak** oldu: başlık ihtiyacını alır, tablo **kalanı** alır (`flex: 1`),
satırlar onu bölüşür. Toplam artık yapısal olarak sayfanın kendisi — her
yakınlaştırmada, her düzende, altı günlük haftada da yedi günlükte de.

Yanında iki sessiz ekran↔kâğıt ayrışması kapandı: `table.print` hücrelerindeki
`height: 3.25rem` (kâğıda ulaşan **tek rem**, ve `@media print` `--ui-scale`'i
1'e sabitliyor) ve başlığın `6px` ↔ `4mm` payı.

### Ayarlar altı bölüm, ve bir kopya silindi

"Taslaktan başla" iki yerde duruyordu — Kurulum'un boş ekranında ve plan
kitaplığında — aynı `loadPlan` + `createPlan` ve **birebir aynı hata cümlesi**.
Tek bileşene indi (`components/DraftStart.tsx`); değişen tek şey düğmenin
etiketiydi, o da bir prop oldu.

---

## Yirmi dokuzuncu oturum — W turu: yedi madde (2026-08-27)

Kullanıcının TASKS'in altına bıraktığı yedi ham not. Ayrıntı
[TASKS.md](TASKS.md) → *W turu*; burada **ölçülenler** ve plandan sapmalar.

### İkisinin karşılığı sıfır satır kod oldu

Ve bu bir sonuç, bir atlama değil. **Görev çubuğu ikonu** zaten
çözülmüştü — `SADE_ALTINDA = 20`, ve commit'lenmiş `.ico` çözülüp 24 px
girişinde ayrıntılı çizimin hayalet sütunları görüldü. **Blok çizimi** de
öyle: şikayet fotosu piksel piksel ölçüldü (iki kart arasında **3 px zemin**),
ve iki bağımsız sebebi vardı — foto `block-wide`'ı hiç taşımayan bir
derlemeden (`dist` 14:55, düzeltme 18:37), ve o kartlar zaten iki ayrı
1 saatlik blok. Kullanıcı ikincisini onayladı.

**Kalan gerçek boşluk teslimdeydi:** `kur.ps1` kısayolu yalnız ilk kurulumda
yazıyordu, yani yeni `icon.ico` kopyalansa bile `.lnk` eskisini gösteriyordu.
Düzeltilmiş bir ikonun düzeltilmiş olduğu hâlde görünmemesi — ilke 1'in
"söylenmeyen güncelleme" gerekçesinin ta kendisi. Artık duran kısayol
tazeleniyor, olmayan yaratılmıyor.

### Yedinci sekme yedinci RENK istedi, ve tekerlek doluydu

Plana yazılmamıştı ve bir kusur olarak çıktı: `[data-section]` altı bölüm
tanıyordu, yani yeni sekme `var(--sec, var(--accent))`'in **fallback'ini**
çiziyordu — tuzak 52'nin tam olarak tarif ettiği sessiz durum. Renk uydurulmadı,
2026-08-26'daki aramanın **aynı kısıtlarıyla** arandı (kontrast 5,0–13,5 · ΔE
≥36 işlevsel üçlüden · ΔE ≥20 öteki bölümlerden, iki temada birden), ve
tekerleğin dolu olduğu ölçülerek görüldü:

| Yay | Ne oluyor |
|---|---|
| 19 turuncu | `--warn`/`--bad`'in kendi yarısı |
| 70 limon | `--ok`'un üçte biri |
| 257 çivit | Kontrol'ün moru, aynı ton ailesi |
| 316 orkide | Yazdır'ın pembesi, aynı ton ailesi |

Kalan tek yer Yazdır'ın pembesiyle kırmızılar arasındaki gül. Oradaki ilk aday
(`#ff386a`) `--bad` gibi okunacak kadar sıcaktı, o yüzden açıklık öteki altının
bandına çekildi. Sonuç `#7e304e` / `#f04c8b`: kontrast **8,7 / 5,1**, `--bad`'e
**ΔE 36,3**, en yakın bölüme **ΔE 23,1** — yani önceki en dar çift olan 20,5'ten
**daha iyi** ayrılmış. `renk.spec.ts` artık yedi bölümü ölçüyor.

### Ölçülenler

```
dist/index.html    559 849 bayt   (öncesi 542 276 — yeni sekme, deste, panel başlığı)
açılış             86 ms medyan · 147 ms en kötü   (7 koşu, file://, 1920×1080)
havuz              367 kart → 114 deste, en kalabalığı 8
```

Açılış ölçümü **86 ms**; 2026-08-26'daki 73 ms'lik ölçüm 489 815 baytlıktı.
70 KB büyüdü, 13 ms yavaşladı — ve bu bir tarih, kanun değil (tuzak 42):
paket eklenince yeniden ölçülür.

### Sapmalar ve bir saat

- **Sekmenin yeri kullanıcı kararı:** Müsaitlik ile Program arasında. Plan
  "Kurulum'dan hemen sonra"yı öneriyordu.
- **Bir saat bir z-index'e gitti**, ve dersi CLAUDE.md'de **tuzak 84**:
  `z-index` statik konumlu bir kutuda hiçbir şey yapmaz. Rozetin kutusu,
  hesaplanmış rengi ve `elementFromPoint` cevabı vardı; kendisi
  görünmüyordu, çünkü destenin gömülü kopyaları onun ÜSTÜNE boyanıyordu.
  Ölçüm plumbing'i de yanılttı: `elementScreenshot` kaydırma yapıyor ve
  ondan önce alınmış `getBoundingClientRect` ile uyuşmuyor — kesin cevap
  kırpmasız tam ekran görüntüsünden geldi.
- **Kendi yazdığım bir ad, yazdığım tuzağa düştü:** şeridin `aria-label`'ı
  `"Ders araçları"` idi ve `getByLabel('ders ara')` — aynı ekrandaki arama
  kutusu — ona da cevap verdi. Tuzak 74, düğmeler tarafından değil bir
  **bölge adı** tarafından. `"Ders girişi araçları"` oldu.
- **`@types/node` package.json'da vardı, `node_modules`'da yoktu**, yani
  `npm run tipler` bu makinede hiç koşmamıştı. `npm install` yeterliydi.

---

## Yirmi sekizinci oturum — sürüm, çift branş, tek kart (2026-08-27)

> **v1.3.0 çıktı ve doğrulandı.** Release'in dört varlığı da 200 veriyor,
> ve **dördüncüsü ilk kez var**: `surum.json`. Ondan önceki hiçbir exe kendini
> güncelleyemezdi, çünkü bakacağı dosya yoktu.
>
> | Varlık | Boyut |
> |---|---|
> | `Ders-Programi.html` | 544 753 bayt |
> | `Ders-Programi-Windows-kurulum.zip` | 221 325 bayt |
> | `Ders-Programi.exe` | 3 664 896 bayt — **Windows/WebView2**, Linux'ta ölçülen 3 742 584 değil |
> | `surum.json` | 172 bayt |
>
> Baba artık v1.2.0'ı (ders dağılımı, şema v7) ve v1.3.0'ı birlikte alıyor;
> ikisi de aylardır `main`'de duruyordu ama hiç yayınlanmamıştı.

**Makine değişti: artık Windows 11**, Fedora değil. `cargo` yok (exe yalnız
CI'da doğuyor), Playwright chromium kurulu, `npm run kontrol` bu makinede ilk
kez koştu ve yeşil geçti.

### 0. `v1.3.0` neden hiç çıkmamıştı

TASKS "tek kalan adım push" diyordu ve yanlıştı: `main` çoktan itilmişti
(`916c5c8` = `origin/main`), gitmeyen şey **etiketin kendisiydi** — uzakta
yalnız `v1.1.0` vardı.

Sebep `scripts/yayinla.mjs` içinde bir kusurdu: `cargoSurumuYaz` bir
`replace` çağrısının **hiçbir şeyi değiştirmemesini** "version satırı
bulunamadı" diye okuyordu. İkisi aynı şey değil, ve ayrımın düştüğü yer tam da
o fonksiyonun var olma sebebi: `package.json` elle bumplanmış, `Cargo.toml`
zaten aynı numarada, replace hiçbir şey değiştirmiyor — **doğru durum**.
Artık satır önce ARANIYOR, sonra yazılıyor, ve yalnız gerçekten değiştiyse
diske iniyor.

Dört durum ölçüldü: satır yok → yakalanıyor · zaten doğru → susuyor · eski →
yazıyor · `[dependencies]` içindeki `version` → dokunulmuyor.

### 1. Çift branş — `schemaVersion` 7 → 8

> *"Öğretmenlerin iki branşı olabilsin… hangisi daha güzel ve mantıklıysa
> onu yapalım."*

**Alt branş değil, iki branş** — ve gerekçe kullanıcının kendi ikinci örneği:
"Matematik 1 / Matematik 2" bir hiyerarşiyle anlatılabilir, **"Türkçe ve
Edebiyat" anlatılamaz**. Alt branş `settings.subjects` içine ikinci bir veri
şekli (ağaç) sokup istenen vakaların yalnız yarısını çözerdi.

| Ne | Nerede |
|---|---|
| `Teacher.subject2` · `Lesson.second` | `src/types.ts`, `SCHEMA_VERSION = 8` |
| branşın türetilmesi | **yeni** `src/subjects.ts` — yaprak modül |
| yetim bayrağın temizliği | `constraints.ts` → `sanitize()` |
| göç | `store.ts`, `version === 7` açıkça eklendi |
| arayüz | Öğretmenler'de "2. branş" sütunu, Dersler'de **yalnız çift branşlıda** beliren seçici |

**Ders branşın ADINI saklamıyor, bir bayrak tutuyor.** Ad ikinci bir gerçek
olurdu ve öğretmenin branşı düzeltilince sessizce saparaydı; `Teacher.subject`
zaten bilerek id değil string, çünkü yeniden adlandırma ucuz kalsın diye.

**`src/subjects.ts` neden yaprak:** `entities.ts` zaten `constraints.ts`
modülünü çağırıyor, yani ikisinin de ihtiyacı olan bir kural ikisinin de
**altında** durmalı — `keys.ts` dosyasının constraints ↔ rules için yaptığının
aynısı. İlk hâlde kuralı `sanitize()` içine elle yazmıştım ve `subjectKey`
kullanmadığı için "Matematik" ile "matematik" iki branş sayılıyordu: iki ev,
iki gerçek.

Göç koşulu **kaldırılarak kırmızıya döndürüldü** (3 test).

### 2. İki saatlik blok TEK kart

> *"blok 2 saatlik olarak duruyorsa o iki farklı kart değil tek kart olarak
> gözükmeli, büyükçe kart olarak."*

Blok başındaki `<td>` `colSpan={2}` alıyor, ikincisi hiç çizilmiyor, etiket
bir kez ve bir basamak büyük yazılıyor.

**Öğle arasını aşan blok BİRLEŞMİYOR**, ve bu bir incelik değil: ayraç sütunu
bilerek `data-day` taşımıyor (tuzak 13) ve onu bir `colSpan` içine almak o
değişmeze bir `data-day` verirdi. Orada eski iki kartlı çizim duruyor — ki
dürüst de: ekranda gerçekten aralarında bir şey var.

**`drag.ts` artık `data-span` okuyor.** Hücreyi SAATE göre buluyordu;
birleşmiş bloğun ikinci saati hiçbir şeye çözülüyor, `if (el == null) break`
de vurgunun **geri kalanını** boyamadan bırakıyordu.

### 3. Ölçülerek REDDEDİLEN iki fikir

**(a) "Çok değerli süzgeç açılır liste olsun."** `CHIP_LIMIT = 8` yazdım,
gerekçesini de yazdım — ve ölçmemiştim. Ölçüm:

```
%110   12 branş · 25 öğretmen · 20 sınıf     hepsi TEK satır, 28px
%150   aynı üçü                              hepsi ~2 satır, 81px
```

Çipler kısaltma taşıyor ("MÇ 4", "510 6"), yani sayı satırı neredeyse hiç
büyütmüyor. Düşülecek bir uçurum yoktu; dalın tek gerçek etkisi kullanıcının
zaten kullandığı süzgeci, sayılarını gizleyen bir kutuya çevirmekti.
**Silindi.**

**(b) "Açık temada renk şeridi daha az görünüyor gibi."** Ölçüldü, **tersi**
çıktı:

| Bölüm | açık | koyu |
|---|---|---|
| Kurulum · Müsaitlik | 6,92 · 7,26 | 4,66 · 4,65 |
| Program | **7,31** | 4,28 |
| Kontrol | 5,53 | 5,84 |
| Yazdır · Ayarlar | 7,05 · 7,26 | 5,28 · 4,49 |

Altı bölümün beşinde açık tema daha güçlü. Kullanıcı "bana öyle geldiyse boş
verebilirsin" demişti; koda dokunulmadı, sayılar yazıldı, ve **zemin** bir
testle sabitlendi (`renk.spec.ts` 80, her iki temada da en az 3,5).

> **İlk ölçüm YANLIŞTI ve bunu yazmak önemli.** `contrast()` yalnız `rgb()`
> ayrıştırıyor; `color-mix(in oklab, …)` Chromium'da `oklab()` olarak kalıyor
> ve ayrıştırıcı parlaklığı kırmızı kanal sanıp zemini **siyah** okuyordu.
> Tablo o hâliyle tam ters çıkmıştı (açık 2,15–2,78 · koyu 6,50–8,35) ve
> makul görünüyordu. Doğrusu rengi **boyayıp pikseli okumak**.

### 4. Genişlik — eşik gevşetilmedi

İki yeni sütun (2. branş + sıra no) Öğretmenler tablosunu %125 ölçekte
**106px** taşırdı. Ne taşıdığı tek tek kapatılarak ölçüldü (tuzak 37 yöntemi):
sıra no 31px, 2. branş sütunu 106px'in tamamı — 67'si başlığın, 39'u düğmenin.

Asıl yer başka çıktı: **kenar sütununun gerçek tabanı** `min-content` ile
zorlanarak ölçüldü — **19,94rem**, ve tavan `24rem` idi. CSS'in kendi yorumu
zaten "every pixel past that is blank" diyordu. Tavan `20rem` oldu, düğme "+"
oldu, başlık "2. branş". **Taşma 0**, %100/%110/%125 üçünde de.

### 5. Havuz kartı — 5,2px dışarıda

> *"hover edince biraz daha yukarı çıkmaları güzel fakat çekmecenin altına
> kaçıyorlar"*

Ölçüldü: kalkma 2,2px + outline 2px + offset 1px = **5,2px**, ve `.pool-list`
üst dolgusu **0** idi, yani ilk sıra kırpan kenara yaslıydı. Dolgu `--slide`
üstünden **türetildi**: ölçekle büyüyor, hareket kapanınca sıfırlanıyor.
Dördüncü piksel alt-piksel payı — 3 ile kartın boyalı kenarı 0,0125px yukarıda
kalıyordu.

### 6. Yoğunluk artık ızgaranın değil ARAYÜZÜN

> *"babam tek seferde tüm listeleri görmek istiyor."*

Ölçülen (örnek okul, varsayılan ölçek, Kurulum → Öğretmenler):

| | satır boyu | katlanın üstünde |
|---|---|---|
| Ferah | 65px | 9 |
| Rahat | 57px | 10 |
| **Sığdır** | **34px** | **19** — Sınıflar'da 20/20, listenin tamamı |

**25 öğretmenin hepsi hâlâ sığmıyor, ve bu ayarlanarak kapatılmadı:** kalan
tabanı satırdaki **metin kutusu** koyuyor, onu indirecek tek şey daha küçük
bir harf, ve 12px ekran sınırı bu program için geçilmiyor. Çıkan şey yalnız
boşluk; hiçbir yazı boyutu küçülmedi ve test bunu ölçüyor.

### 7. Kalan altı madde

- **Renklerin üstündeki sayılar kalktı.** İndeks kaybolmadı — **erişilebilir
  ada** taşındı (`MÇ rengi: 12`). `--on-color` güvencesi de kaybolmadı,
  **taşındı**: metnin hâlâ palet zemininde durduğu yere, `.card` ve
  `.pool-card` üstüne. Sabotajla kırmızıya döndürüldü.
  Yan kusur **ekran görüntüsüne bakarak** bulundu: yazı gidince kutu
  yüksekliğini de kaybediyor ve 10px'lik bir çubuğa dönüyordu. `height: 1lh`.
- **Listelerde sıra numarası** (`#` sütunu) — görünen sıra, dizinin indeksi
  değil: süzgeç altında ekrandaki üçüncü satır "3" der.
- **Sıralama yönü tuşu.** `ListQuery.desc`; karşılaştırıcı **negatifleniyor**,
  `reverse()` değil — kararlı sıralamada `reverse()` eşitleri de çevirir.
- **Dersler'de öğretmen ve sınıf süzgeci.** `Facet.of` artık `string` ya da
  `string[]`: çift branşlı hoca iki gruba birden ait, ve "Edebiyat" onu
  bulamayan bir süzgeç yalan söylerdi.
- **Dağılım katlanıyor:** 4 terimden sonra `10×1`, `3×2 + 4×1`.
- **`e2e/sira.spec.ts` konum yerine `data-row-name` okuyor.** `td:nth-child(2)`
  ad sütununu gösteriyordu; iki kez sütun eklendi ve her seferinde **boş bir
  hücreyi** okuyup boşu boşla karşılaştırarak yanlış şeyi doğruladı.

### 8. Dil turunun makinesi (v2.0.0'ın birinci yarısı)

**Anahtar Türkçe cümlenin KENDİSİ**: `t('Öğretmenler')`, `t('setup.teachers')`
değil. Bu bir derli-toplu-luk kaybı değil, üç şeyin birden kazancı:

- Eksik çeviri **doğru Türkçeye** düşer. Bitmemiş bir sözlüğün arıza biçimi
  "bu satır hâlâ Türkçe", babanın ekranında `setup.teachers.title` değil.
- JSX okunur kalır: `Teachers.tsx`'i okuyan, ekranda çıkacak cümleyi görür —
  bu dosyalar iki yıldır öyle yazıldı ve öyle gözden geçirildi.
- Altı yüz isim uydurulmaz, ve hiçbir isim temsil ettiği cümleden sapamaz.

Bedeli gerçek ve yazıldı: Türkçe metni düzenlemek çevirisini **öksüz** bırakır.
`i18n.test.ts`'in son testi kaynağın tamamını okuyup sözlükte karşılığı
kalmamış anahtarı kırmızıya döndürüyor.

**Bunun asıl sonucu, ve turun geri kalanını mümkün kılan şey:** bir dosyayı
`t()`'ye taşımak Türkçe ekranda **hiçbir şeyi değiştirmez**. 440 E2E testinin
tek bir locator'ı kaymadı, ve kaymayacak — yani kalan 710 dizge parça parça,
her adımda yeşil bir süitle, istenildiği yerde durdurulabilir biçimde
çevrilebilir.

| Ne | Nerede |
|---|---|
| dil, depo, `<html lang>` | **yeni** `src/i18n.ts` — yaprak, `keys.ts` deseni |
| `useT()` + `<T>` | **yeni** `src/components/T.tsx` |
| sözlük | **yeni** `src/lang/en.ts` |
| seçici | Ayarlar → Görünüm, her dil **kendi adını kendi dilinde** söylüyor |
| testler | `i18n.test.ts` 13 · `e2e/dil.spec.ts` 7 |

`<T>` niçin var: ekrandaki cümlelerin yarısında bir `<b>` duruyor. Bir cümleyi
üç anahtara bölmek onu **çevrilemez** yapar — diller arasında değişen şey tam
olarak kelime sırasıdır. Sözlük değeri `**` ile vurgu, `{ad}` ile değer
taşıyor; ayrıştırıcı on satır ve hiçbir şey `dangerouslySetInnerHTML`'e
verilmiyor.

**Dil on birinci makine tercihi**: kendi anahtarı, `State`'e girmez,
`schemaVersion` artmaz, "Veriler nerede" tablosunda satırı var (sözleşme).

**E2E'nin dili `kapan.ts`'te sabitlendi, `helpers.ts`'te değil.** Gerekçe hata
kapanınınkiyle aynı: `auto: true` unutulamaz, ve üç spec dosyası hiçbir
yardımcıdan geçmeden `page.goto('/')` yapıyor. **Tohumluyor, dayatmıyor**
(tuzak 68) — dili bilerek değiştirip yenileyen bir test seçimini koruyor.

**Bir test doğru davranışı yakaladı ve düzeltilen şey testti.** "Kayıt
çalışmıyorsa kırmızı uyarı" testi `localStorage`'ı tamamen çökertiyor; o
durumda dil tercihi de okunamıyor ve program **cihazın** diline düşüyor —
özel sekmedeki bir okuyucu yine kendi dilini görsün diye, ki doğrusu budur.
Test artık uyarıyı sekme adıyla değil sınıfıyla arıyor.

**Sözlük 9 / ~720.** Kabuk çevrildi, gerisi Türkçe. Yüzey ölçüldü: 47 dosya,
en ağırları `settings/Data.tsx` (113), `settings/Appearance.tsx` (57),
`App.tsx` (43), `Ribbon.tsx` (40), `setup/Teachers.tsx` (39).

**İLKE 4 henüz YENİDEN YAZILMADI** ve bilerek: bugünkü hâli "Tek dil, i18n
altyapısı yok" diyor ve artık doğru değil, ama yarısı çevrilmiş bir program
için "çok dilli" demek de doğru olmazdı. Sözlük bitince yazılacak.

### Sayılar

```
600 birim + 440 E2E + 22 site + 7 çözücü      hepsi yeşil
npm run patrol                                 4/4, konsol temiz
npm run ekran                                  34 görüntü, BAKILDI
```

---

## Yirmi yedinci oturum — güncelleme, ikon, devriye, metinler (2026-08-27)

Kullanıcının iki isteği ve TASKS'in sonunda duran beş satırı. İş **ikiye
bölündü** (kullanıcı kararı): bu tur v1.3.0, dil ve yeni ad v2.0.0'da.

> *"Yeni sürüm oluşsun. ayrıca .exe'de de ayarlarda güncellemeye basınca
> güncellemeye baksın ve güncelleme varsa güncellensin. tabii ki exe
> internetsiz de sorunsuz çalışabiliyor olsun."*

### 1. `.exe` kendini güncelliyor

**Sözleşme tek cümle: ağa yalnız TIKLANINCA çıkılır.** Açılışta yok, arka
planda yok, zamanlayıcı yok. Üç ayrı düğme, üç ayrı karar: `Denetle` →
`İndir` → `Şimdi yeniden başlat`. İnternet yoksa tek sonuç bir cümledir ve
program çalışmaya devam eder.

| Ne | Nerede |
|---|---|
| manifest `surum.json` | `.github/workflows/surum.yml` → `yayinla` işi; `releases/latest/download/surum.json` |
| semver · doğrulama · takas | **yeni** `src-tauri/src/update.rs` (saf fonksiyonlar altta, komutlar üstte — `lib.rs`'in deseni) |
| üç köprü fonksiyonu | `src/desktop.ts` (`desktopCheck` · `desktopDownload` · `desktopApply`) |
| üç yollu `useUpdate` | `src/update.ts` — `kind: 'sw' \| 'exe' \| 'yok'` |
| üç düğme + durum satırı | `src/components/settings/Data.tsx` → `ExeUpdate` |

**Tauri'nin kendi updater'ı alınmadı, ve gerekçe ilke 1:** Windows'ta bir
`.msi`/`.nsis` bundle'ı indirip **kurulum çalıştırıyor**, yani tam da
`--no-bundle`'ın reddettiği şey. Elle yazılan yol bir kurulum sihirbazı
istemiyor: çalışan bir `.exe` Windows'ta **silinemez ama yeniden
adlandırılabilir**, ve self-update'in tamamı bu.

**Ölçülen bağımlılık maliyeti.** `reqwest` zaten `tauri`'nin bağımlılığıydı
(Cargo.lock'ta 0.13.4) ama **TLS özelliği kapalıydı** — kilitte ne `rustls` ne
`native-tls` geçiyordu. Alınan: `native-tls`, çünkü teslim hedefi Windows ve
orada native-tls **schannel**'dır, yani işletim sisteminin kendisi: exe'ye
neredeyse hiç yük binmez ve Windows runner'ı NASM/cmake istemez. Bu Fedora'da
sistem OpenSSL'i, yani `cargo test` ve `npm run exe` yerelde de koşuyor.
`rust-version` 1.77.2 → 1.85.0 (reqwest 0.13 istiyor; eski taban ağaca
**ikinci bir reqwest** koyardı).

**Rust testleri 6 → 20.** Yeni olanlar: `is_newer`'ın `1.10 > 1.9` bildiği,
bir dev sürümün de karşılaştırılabildiği, saçmaya **hayır** dediği, inen
dosyanın `MZ` ile başlaması ve boyutunun tutması, adresin yalnız kendi
Release'imizden olabilmesi, `.yeni` bir **klasör**se takasın hiç başlamaması,
ve ikinci rename düşerse **eski programın yerine geri konması**.

> **Bir test önce yanlış yazıldı ve ölçüm düzeltti.** Rollback testinin ilk
> hâli `.yeni`'yi bir klasör yapıp `swap()`'ın düşmesini bekliyordu; Linux'ta
> **boş bir yola klasör taşımak başarılı oluyor**. Mekanik (`swap_files`)
> kapıdan (`swap`) ayrıldı ve rollback artık gerçekten kırılabilen bir yoldan
> ölçülüyor: `.yeni` **hiç yok** — Windows'ta antivirüsün taze inen bir exe'yi
> karantinaya alması tam olarak bu.

**E2E: 5 yeni test, ikisi sabotajla kırmızıya döndürüldü.**

| İddia | Sabotaj |
|---|---|
| hiçbir şey sorulmadan `check_update` çağrılmıyor | açılışta `exeCheck()` → **kırmızı** |
| indirmek yeniden başlatmıyor | `indir` sonunda `desktopApply()` → **kırmızı** |

**Ölçülen maliyet** (Linux, `--release`, bu makine):

| | Önce | Sonra |
|---|---|---|
| sürüm ikilisi | 3 742 584 bayt (3,57 MB) | **4 215 832 bayt (4,02 MB)** — **+462 KB** |
| derleme | 1 dk 38 sn | **1 dk 10 sn** |

462 KB'nin tamamı TLS + güncelleme kodu; istemcinin kendisi zaten oradaydı.
Windows'ta bu sayının **daha küçük** olması bekleniyor, çünkü orada native-tls
schannel'a düşüyor ve OpenSSL bağlanmıyor — ama bu bir **beklenti**, ölçüm
değil.

**Bu makinede ölçülemeyen, ve öyle işaretlendi:** Windows'ta gerçek takas,
SmartScreen'in ne dediği, WebView2 altında açılış süresi.

### 2. Görev çubuğundaki işaret

Şikayet tek cümleydi: *"alttaki png görüntüsü eksik pxli küçük logo."* Kodda
hiçbir şey yanlış değildi; kusur **dosyanın içindeydi** ve iki katlıydı.

| | Önce | Sonra |
|---|---|---|
| `.ico` boyları | 16 · 32 · 48 · 64 · 128 · 256 | **16 · 20 · 24 · 32 · 40 · 48 · 64 · 128 · 256** |
| sade/ayrıntılı eşiği | `< 48` sade | **`< 32` sade** |
| `kurulum/icon.ico` | 11 858 bayt | **14 483 bayt** (+2 625) |

Windows %125 ölçekte **40 px** istiyor ve dosyada yoktu, yani 32'yi
büyütüyordu: "eksik pxl" tam olarak bu. Eşik uydurulmadı, **bakılarak**
bulundu (`scripts/ikon-karsilastir.mjs` → iki çizim, altı boy, iki zemin):

```
16 · 20   ayrıntılı: altı sütun mavi bir lekeye dönüyor
24        ayrıntılı: hâlâ bulanık, hayalet sütunlar doluya karışıyor
32        ayrıntılı: OKUNUYOR — altı sütun ayrı, hayaletler arkada
40 · 48   ayrıntılı: temiz
```

Karar artık bir testte yaşıyor (`temel.spec.ts` 79): `.ico`'nun dizini
ayrıştırılıyor ve her boy iki çizimin **taze render'ıyla piksel piksel**
karşılaştırılıyor. Eski ayarlarla yeniden üretilince ikisi de kırmızıya döndü.

### 3. Devriye + hata kapanı

**Asıl kazanç devriye değil, kapan.** `e2e/kapan.ts` bütün E2E süitini sarıyor
(`auto: true`, yani unutulamaz) ve şunları kırmızıya döndürüyor:
`console.error` · `pageerror` · yakalanmamış promise reddi · `file://` altında
**herhangi bir ağ isteği**.

Bugüne kadar **415 testin hiçbiri** bunlara bakmıyordu. İkisi de kasıtlı
hatayla sınandı ve ikisi de yakalandı. `file://` süiti kapanla **yeşil** geçti;
ilke 3'ün mekanik kanıtı da bir testten (`temel.spec.ts`) **bütün süite**
yayıldı.

**Ve kapan ilk koşusunda gerçek bir kusur buldu.** `npm run test:site`'ta
*"bilinmeyen yol uygulamaya düşüyor"* testi bir sürümdür yeşil geçiyordu;
kapan altındaki sayfanın ne bastığını gösterdi:

```
console.error: The script has an unsupported MIME type ('text/html').
```

Yerel sunucunun geri dönüş kuralı **her şeye** `index.html` veriyordu, yani
`/bilinmeyen/sw.js` isteği `text/html` olarak dönüyor ve Chromium service
worker kaydını reddediyordu — derin bir yolda açılan sayfa **çevrimdışı
çalışmıyordu** ve ekranda hiçbir şey bunu söylemiyordu. Kural daraltıldı: geri
dönüş yalnız **gezinme** için, bir dosya adı isteyen çağrı 404 alır.
`scripts/sunucu.mjs` ve `kurulum/sunucu.ps1`'in **ikisinde de**, ve yanına iki
iddia yazıldı (`sunucu.spec.ts`).

`npm run patrol` iddia etmiyor, geziyor: altı sekme, dört adım, beş bölüm,
şeritteki her düğme, artı üç tohumla (1 · 42 · 1337) altmışar adımlık rastgele
gezinme. Kendi config'inde, `kontrol`'ün parçası değil.

**Ölçülen:** tur **5,7 sn / 33 durak**, gezinmeler 17,5 · 21,9 · 24,1 sn,
toplam **41,9 sn**. İlk hâli aynı işi **üç dakikada hiçbir sekmeye uğramadan**
yapamıyordu ve sebebi iki ayarda gizliydi (tuzak 79): Playwright'ın
`actionTimeout`'u varsayılan olarak **sınırsız**, ve modal bir diyalog
arkasındaki her şey `inert` — yani bir sekme tıklaması testin kendi zaman
aşımına kadar bekliyordu. Ayrıca devriye iki diyalog türünden yalnız birini
tanıyordu (Radix `.dlg-overlay` ve native `<dialog>`).

### 4. Metin turu

| | Önce | Sonra |
|---|---|---|
| ekranda uzun çizgi (`—`) taşıyan satır | **265** | **0** |
| kaynakta (yorum dışı) | 155 | 0 |

Çoğu düzyazı değil **ayraç**tı: `MÇ — Mehmet Çelik`, `A: 4 sınıf — 410, 411`,
`310 sınıfı — Haftalık ders programı`, `Öğle arası — 30 dk`. Yerine geçen
kural dört maddeli: düzyazıda **ayrı cümle**, etiket/değer çiftinde **iki
nokta**, eşit ağırlıkta iki şey arasında **orta nokta (`·`)**, boş tablo
hücresinde **kısa çizgi (`–`)**. `e2e/metin.spec.ts` ölçüyor, ve ölçtüğü şey
kaynak değil `document.body.innerText` — yani İngilizce kod yorumlarına hiç
bakmıyor, onlar da olduğu gibi duruyor.

Kırılan testler tam da bu cümleleri sabitleyenlerdi: 10 birim + 7 E2E.

### 5. Sürüm numarası ve `gorunum.spec.ts`'in payı

CLAUDE.md iki sürüm boyunca *"sürüm numarasının TEK kaynağı `package.json`"*
diyordu ve **yanlıştı**: numara üç dosyadaydı ve `yayinla.mjs` yalnız birini
yazıyordu. Kozmetikti, ta ki exe kendini güncellemeyi öğrenene kadar — çünkü
karşılaştırdığı sayı tam o. Şimdi: `tauri.conf.json` → `"../package.json"`,
`Cargo.toml`'u `yayinla.mjs` yazıyor, `src/surum.test.ts` her koşuda ölçüyor.

`gorunum.spec.ts:309`'un uydurma `+2` payı kalktı. **Ölçülen:**

```
sütun (çizilen)            39,0 px
CSS'in istediği            37,4 px   (2.125rem × 16 × 1.1)
saat başlığının istediği   41,0 px   (klonlanıp width:max-content ile ölçüldü)
```

Tavan artık ölçülen zemin: sütun bu ikisinin arasında kalmalı. Gömülü yüz
değişirse başlık oynar ve tavan onunla oynar (tuzak 42).

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

| | Önce | Sonra |
|---|---|---|
| birim testi | 566 | **569** |
| E2E (file://) | 415 | **427** |
| site · sunucu · klasör | 19 | **22** |
| Rust testi | 6 | **20** |
| spec dosyası | 31 | **33** (+`patrol`, +`metin`; artı `kapan.ts` fixture) |
| `dist/index.html` | 542 276 bayt | **544 753 bayt** (+2 477) |
| `kurulum/icon.ico` | 11 858 bayt | **14 483 bayt** (+2 625) |
| exe (Linux, release) | 3 742 584 bayt | **4 215 832 bayt** (+462 KB) |

### Yeni tuzaklar

77 (tek kaynak ölçülmeden yazılmış bir dilekti) · 78 (`.ico`'da olmayan boy
sessizce ölçekleniyor) · 79 (bir devriyenin maliyeti zaman aşımlarının
toplamıdır) · 80 (karakter üstünden toplu değiştirme yorumları da bulur).

---

## Yirmi altıncı oturum — haftanın nasıl bölündüğü (2026-08-27)

Kullanıcının dört maddesi, biri büyük üçü küçük:

> *"En son eklenen örnek fotodaki gibi hallet. Ders saatini girdikten sonra 1
> veya 2'nin kombinasyonları olsun. mesela 3 saat 1+1+1 veya 2+1 olarak
> gösterilsin."* · *"default tema açık olsun"* · *"başlarken kısmındaki örnek
> veri olayı ayarlara gitsin, sadece ilk sefer … biraz gözüksün"* ·
> *"ayarlar branşlarda da listeyi hareket ettirme olsun"*

Fotoğraf: `docs/Örnek Fotolar/Örnek saatlerin kombinasyonu göstergesi
seçeneği.png` — aSc'nin `Lessons/week` kutusu ve **yanındaki** açılır liste.

### 1. Blok dağılımı — `blockSize` → `pairs` (şema **v6 → v7**)

Eski model ders başına tek bir **blok boyu** tutuyordu (1, 2 ya da 3) ve anlamı
"bütün bloklar bu boyda"ydı. `2+1` bu modelde **yazılamıyordu**, ve daha kötüsü:
5 saatlik bir ders 2'li bloklarla istendiğinde çözücü `floor(5/2)=2` blok koyup
**beşinci saati kalıcı olarak yerleşemez** bırakıyordu. `src/worlds.ts` bu
davranışı bir dünya olarak sabitlemişti (`bolunmeyen-saat`).

Yeni model tek sayı: **`pairs`** — haftanın kaç saatinin **ikili** blok olarak
ineceği. Gerisi tek saat, yani şekil belli: `5 saat + pairs 2 = 2+2+1`.
Kombinasyonlar yalnız 1 ve 2'den kurulur; **üç saatlik blok kalktı** (kullanıcı
kararı, ve listeyi okunur tutuyor: 12 saat 7 seçenek, üçlüyle 19 olurdu).

**Asıl zorluk şemada değil, ızgaradaydı.** `placements` saat başına bir
`lessonId` tutuyor ve blok **sınırı** diye bir kayıt hiç olmadı — tek blok boyu
varken gerek de yoktu, koşuyu eşit parçalara bölmek tek cevabı veriyordu. `2+1`
ile vermiyor: aynı dersin üç bitişik hücresi hem `[2,1]` hem `[1,2]`dir. Çare
şemayı büyütmek değil, bir **sözleşme** yazıp her yeri ona uydurmak oldu
(`constraints.ts` → `placedBlocks()`, ve **yeni tuzak 75**).

| Ne | Nerede |
|---|---|
| `blockPlan · patternLabel · patternOptions · clampPairs` | **yeni** `src/blocks.ts` — yalnız `Lesson` tipini import eder |
| `placedBlocks · pendingBlocks · blockAt` | `constraints.ts`; ızgara, havuz, sağ tık ve denetçi aynı fonksiyondan okur |
| blok boyu artık **çağrıya girer** | `blocker · blockerDetail · check · validHours · dropMap · place` → sondan isteğe bağlı `size?` (**tuzak 76**) |
| ders başına **iki iş kalemi** | `solver.ts`: biri 2'likleri, biri 1'likleri ister |
| v6 → v7 göçü | `store.ts` → `readLessons()`: `blockSize` 2 ya da 3 → `floor(saat/2)` ikili, 1 → sıfır |
| Kurulum → Dersler | `Blok (1/2/3 saat)` yerine **`Dağılım`** (`1+1+1` · `2+1`) |
| havuz | ders başına değil **blok başına kart**, boyunu yazıyor ve ikili iki kat geniş |

### Ölçülen — ve düzelen şey burada görünüyor

| | Önce (v6, HEAD) | Sonra (v7) |
|---|---|---|
| `dist/index.html` | 537 090 bayt | **542 276 bayt** (+5 186) |
| açılış, `file://`, 1920×1080, 7 koşu | — | **65 ms medyan · 86 ms en kötü** |
| örnek okulda havuz | 99 kart (ders başına) | **367 kart** (blok başına) |
| ızgara | 1950 hücre | 1950 hücre |
| `Otomatik diz` | — | **292 ms**, **367/367 blok**, havuzda **0** kaldı |
| dizim sonrası ızgara kartı | — | 433 |

Yani örnek okul artık **eksiksiz** diziliyor. Eskiden bazı saatler blok boyuna
bölünemediği için havuzda kalıyordu; şimdi bölünecek bir şey yok.

### 2. Varsayılan tema **açık** ve sistemi izlemiyor

`normalizeTheme` artık `prefersDark` almıyor; `systemPrefersDark()` silindi.
Gerekçe: işlevsel renkler (yeşil/sarı/kırmızı) açık zeminde seçildi ve orada
**ölçüldü**. Bu, hareket ayarının **tersi** ve fark bilerek — makinesinde
"hareketi azalt" diyen biri bir **ihtiyaç** bildiriyor (tuzak 58, taban), koyu
tema diyen biri bir **zevk** bildiriyor. Yeni E2E: `colorScheme: 'dark'`
altında sayfa yine açık açılıyor, ama elle seçilen koyu duruyor.

### 3. Örnek verinin evi **Ayarlar → Veri**

Eskiden tek ev Kurulum'daki "Başlarken" paneliydi ve orası **yalnız boş bir
projeyle** görünüyordu: kendi verisine başlamış biri örneğe bir daha hiç
bakamıyordu. Şimdi asıl ev Ayarlar → Veri (`Örnek okulu yükle`, proje doluysa
soru **ne kaybedileceğini sayıyor** ve kırmızı). Kurulum'da yalnız **ilk
kullanımda** tek satırlık bir ipucu (`.intro-line`) — örnek yüklenince, "Bir
daha gösterme" tıklanınca ya da ilk derslik/öğretmen/sınıf girilince kalıcı
olarak gidiyor. İşaret **onuncu makine tercihi**: `ders-programi-tanitim`,
`State`'e girmiyor, ve `storageReport()`'a satırı eklendi.

**İlk çizimde değil, EYLEMDE yazılıyor.** Okunmamış bir ipucu bir yenilemeyi
atlatmalı — ve ilk çizimde işaretlemek, tercih yazıp sayfayı yenileyen E2E
yardımcılarını (`openWithSampleTheme`) sessizce kırardı.

### 4. Branşlarda elle sıralama

Beşinci liste. `ListKind`'a `'subjects'` eklendi; `settings.subjects` bir
seviye derinde olduğu için `reorderList`'te kendi dalı var. Ekranda **iki
`<tbody>`**: ilkinde okulun kendi listesi (tutamaklı), ikincisinde yalnız bir
öğretmende duran "listede değil" satırları (tutamaksız) — `rowDrag` hedefini
gövde içindeki **indisle** buluyor, karışık tek gövdede yanlış satırı taşırdı.
Sıranın karşılığı ölçülüyor: Öğretmenler adımındaki Branş açılır listesi bu
sırada geliyor.

### Bu turda yakalanan gerçek kusur

**Dağılım kutusu %150'de kırpıldı** — ekran görüntüsüne bakılmasaydı
görülmezdi. `1+1+1+1+1` etiketi `1+1+1+1+` olarak çizildi: değer doğru, süit
yeşil, ve **okunamıyor** (tuzak 33'ün ta kendisi). Etiketler saatle büyüdüğü
için sabit hiçbir genişlik doğru değil; çare `width: auto` — tarayıcının bir
`<select>`'i en uzun seçeneğinden boylaması — ve sınıfın `table.list td >
select { width: 100% }`'i yenmesi için **aynı öğede** durması (tuzak 34).
Testi bedava yeşil değil: `--split-ch`'li ilk deneme 114,7 px çizdi, istenen
261,6 idi, ve test kırmızıya döndü.

### Sürüm

**v1.1.0 → v1.2.0.** Minor: yeni özellikler var, ama **hiçbir yedek dosyası
okunamaz hâle gelmedi** — v1..v6 yazılmış her dosya `readLessons()`'tan geçip
açılıyor ve dizilmiş programı yerinde kalıyor. Dört yerde birden yükseltildi
(`package.json` · `src-tauri/tauri.conf.json` · `src-tauri/Cargo.toml` ·
`Cargo.lock`), çünkü aralarında bunu denetleyen bir şey yok.

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

**566 birim** (+45) · **417 E2E** (+23, biri hariç yeşil) · 7 çözücü stresi ·
`npm run kontrol` yeşil değil: aşağıdaki **bilinen hata** dışında hepsi geçiyor.

> **Bu turda ÇÖZÜLMEYEN, ve bu tura ait olmayan bir kırmızı:**
> `e2e/gorunum.spec.ts:309` — "Sığdır haftanın tamamını kutuya sokuyor".
> Ölçülen hücre **39,547 px**, testin tavanı `2.125rem × 16 × 1.1 + 2` =
> **39,4 px**. Fark 0,15 px. **HEAD'de de aynı sayı ölçüldü** (ayrı bir
> `git worktree`'de derlenip koşuldu): taban başlıktaki `09:50` saatinin
> min-content'i, ve bu turda ona dokunan hiçbir şey yok. Yani testin payı
> sıkışmış, kod bozulmamış. Kararı — payı gerekçesiyle genişletmek mi, sütunun
> tabanını değiştirmek mi — bu turda **verilmedi**.

---

## Yirmi beşinci oturum — geri bildirim döngüsünün kapanması (2026-08-27)

Kullanıcının cümlesi üç parçaydı: *"babam bana feedbackler verecek ben onları
yapıp tekrar deploy edeceğim, güncellemelerin kolayca yüklenebilmesi için bir
sistem kuralım"* · *"babamın verilerinin nereye kaydedildiğini açıkça belirt"*
· *"npm run vesaire ile kurulmaması, direkt githubtan kolayca kurulabilmesi
lazım — bunu yaptık değil mi?"*

Son sorunun cevabı **yarı yarıya evet**ti, ve bunu ölçmek turun ilk işi oldu.

### Önce ölçüldü — ve belgelerin yarısı bayat çıktı

| Ne | Ölçülen |
|---|---|
| `https://alparslansemiz.github.io/ders-programi/` | **200**, 528 999 bayt gerçek uygulama |
| `sw.js` · `manifest.webmanifest` · `icon-192.png` · `icon.svg` | 200 · 200 · 200 · 200 |
| `has_pages` | **true** — yani Pages AÇILMIŞ |
| son `site` koşusu (09:33) | **success** (öncesindeki 4'ü başarısızdı) |
| `docs/STATUS.md`'nin Pages tablosu | **BAYAT**: hâlâ "`has_pages: false`, 4 koşu 4 hata" diyordu |
| `/releases` · `git tag -l` | **ikisi de boş** — hiç sürüm çıkmamış |
| README'deki üç indirme bağlantısı | **404** |
| README'de site adresi | **hiç yazılı değil** |
| arayüzde sürüm numarası | **yok**; `package.json` `0.1.0`'da donmuş |
| `site/sw.js` önbellek adı | `ders-programi-v1` — **sabit** |

Yani site çalışıyordu ve kimse bilmiyordu (adresi hiçbir yerde yazmıyordu),
indirilebilir dosyalar ise hiç doğmamıştı.

### Asıl kusur: güncelleme bir açılış geriden geliyordu

Sabit önbellek adı + cache-first strateji. Tarayıcı `sw.js`'i bayt bayt
karşılaştırıyor; dosya hiç değişmediği için `install` bir daha koşmuyor,
`addAll(SHELL)` kabuğu bir daha indirmiyor. Baba programı açıyor → **eskisini**
görüyor; kapatıp açıyor → yenisi geliyor. Hata yok, uyarı yok. Tuzak 73.

### Ne yapıldı

1. **Sürüm kimliği — tek kaynak, dört yolda da.** `scripts/surum.mjs` +
   `define: { __SURUM__ }` (iki config birden) + `src/version.ts`.
   `package.json` `0.1.0` → **`1.1.0`**.
2. **`sw.js`'in önbellek adı derlemeyle kıpırdıyor** (`stampServiceWorker`).
   Ölçülen çıktı: `const CACHE = 'ders-programi-1.1.0-83950c5';`
3. **`src/update.ts`** — yeni bir worker devralınca üst çubuğun altında bir
   şerit: *"Yeni sürüm hazır."* + `Yenile` / `Sonra`. `Sonra` **sessionStorage**
   ile yaşar, localStorage'a yazmaz: yeni bir `ders-programi-*` anahtarı
   "Veriler nerede" tablosuna satır borcu doğururdu. `controller` yoksa
   **tamamen no-op**, yani `file://` ve `.exe` hiçbir yere bağlanmaz.
4. **Ayarlar → Veri'ye "Sürüm ve güncelleme" paneli**: sürüm, tarih, **hangi
   kopya** (`Dosya · Windows kurulumu · Site · Uygulama`), **adres**. Site'te
   *Güncellemeleri denetle*; dosya/exe'de "kendini güncellemez" + en yeni
   sürümün adresi.
5. **"Veriler nerede" artık hangi depo olduğunu söylüyor** — ve dört yolun
   depolarının **ayrı** olduğunu, aralarında taşımanın iki düğme olduğunu.
   Eksik anahtar `ders-programi-baski` rapora girdi; IndexedDB'deki
   `ders-programi-klasor` bir **cümleyle** anıldı (tabloya satır olarak değil:
   tablo bayt sayıyor, bir tutamak metin değil).
6. **"Nereye kaydedilsin" gidiş-dönüşü adıyla yazıyor**:
   `ders-programi-tumu.json` → *Tümünü dosyadan aç*. İki yarısı da zaten
   kuruluydu; söylenmemişti.
7. **Klasör bozulunca şerit** (`izin-gerek` / `hata`) — tuzak 7'nin kuralı.
   `secilmedi` bilerek şerit DEĞİL: başlangıç durumu bir kusur değil, ve
   `file://` altında izin zaten her açılışta yeniden soruluyor.
8. **`Guncelle.cmd` artık kendisi indiriyor** (`kur.ps1 -Internetten`,
   `releases/latest/download/…`). İnternet yoksa hata vermez, yanındaki
   klasörü kurar. TLS 1.2 elle açılıyor: PowerShell 5.1'in varsayılanını
   GitHub kabul etmiyor.
9. **`npm run yayinla -- 1.2.0`** — bump + commit + etiket + tek push. Kirli
   ağaçta, `main` dışında bir dalda, ve var olan bir etikette **reddediyor**.
10. **README · OKU.txt · surum-notu.md**: canlı adres, güncelleme bölümü, ve
    **ilk kurulum listesi** — "Ayarlar → Veri → Klasör seç… → Belgelerim".

### Ölçülen

| Ne | Değer |
|---|---|
| `dist/index.html` | 528 677 → **537 134** bayt (+8 457: sürüm damgası, `update.ts`, yeni panel) |
| `dist-site/index.html` | 537 456 bayt |
| `dist-kurulum/` | **590 984** bayt |
| `sw.js` önbellek adı | `ders-programi-1.1.0-83950c5` |
| Birim testi | **521 → 537** (yeni: `version.test.ts` 7, `library.test.ts` +9) |
| E2E (`file://`) | **396 → 401** (yeni: `surum.spec.ts` 5) |
| Site · sunucu · klasör | **19 → 21** (yeni: önbellek adı, güncelleme şeridi) |
| Çözücü | 7, yeşil |
| BOM · CRLF · ASCII kapısı | yerelde koşturuldu, **üçü de doğru** |
| `kur.ps1` sözdizimi | PowerShell ayrıştırıcısıyla **hatasız** |
| Yeni panel, %150 ölçek | panel 915 px, **kırpılma 0**, sayfa taşması **0** |
| `file://` ilk boyama, 7 koşu | **18 ms** medyan · 81 ms en kötü (ilk koşu, soğuk) |
| `dist/index.html`'de `fetch(` · `XMLHttpRequest` · `serviceWorker.register` | **0 · 0 · 0** |

### Test bedava yeşil değil — mutasyonla denendi (tuzak 23)

Turun tek asıl iddiası "yeni sürüm gelince şerit çıkıyor". İki yönde de
bozuldu ve ikisinde de kırmızıya döndü:

| Bozma | Sonuç |
|---|---|
| `if (vardi && false) setReady(true)` — hiç duyurma | **kırmızı** (`toBeVisible` düştü) |
| `check()` içinde `setReady(true)` — her denetimde duyur | **kırmızı** (`toHaveCount(0)` düştü) |

İlk hâlindeki "ilk açılışta çıkmıyor" iddiası ise **bedava yeşildi**: `vardi`
korumasını kaldırmak testi kırmadı, çünkü ilk boyamada `supported` zaten false
ve efekt hiç kurulmuyor. Onun yerine gerçek bir iddia yazıldı — *hiçbir şey
değişmemişken `update()` çağırmak şerit çıkarmıyor* — ve ikinci mutasyonu
yakalayan da o oldu.

### v1.1.0 YAYINLANDI — ve zincirin tamamı ölçüldü

Deponun **ilk sürümü**. İki iş akışı da yeşil geçti.

| Ne | Ölçülen |
|---|---|
| `site` iş akışı | success · canlı `sw.js` → `const CACHE = 'ders-programi-1.1.0-357d878';` |
| canlı sayfa | 537 414 bayt, içinde `1.1.0` ve `357d878` |
| `sürüm` iş akışı (`windows-latest`) | **success** — `cargo test` dahil |
| `Ders-Programi.html` | **200**, 537 092 bayt |
| `Ders-Programi-Windows-kurulum.zip` | **200**, 216 719 bayt |
| `Ders-Programi.exe` | **200**, 3 226 112 bayt |

Üçü de indirildi ve **açıldı**, tarif edilmedi:

- **`.html` gerçekten çift tıklandı** (Playwright, `file://`): uygulama çizildi,
  panel *"v1.1.0 · 27 Ağustos 2026 · Dosya (çift tıklanan .html) · file://"*
  dedi, **dışarı giden istek 0**, **sayfa hatası 0**.
- **`.zip` açıldı ve içi denetlendi**: 13 giriş; `kur.ps1`/`sunucu.ps1`/`OKU.txt`
  BOM+CRLF, `.cmd`'ler salt ASCII+CRLF — hepsi zip gidiş-dönüşünden **sağ
  çıktı**. `Guncelle.cmd` içinde `-Internetten`, `kur.ps1` içinde
  `releases/latest/download`. İçindeki `site/sw.js` de damgalı.
- **`.exe` yalnızca DERLENDİ.** 3 226 112 bayt indirilebilir durumda, ama
  **kimse ona çift tıklamadı** — WebView2, SmartScreen ve Belgelerim'e yazma
  babanın makinesinde görülecek. README bunu artık böyle yazıyor.

**İlk `yayinla` koşusu, engellemek için yazıldığı hatayı yaptı.** `git tag`
hafif bir etiket üretir; `git push --follow-tags` yalnız *annotated* olanları
iter ve ötekini **tek kelime etmeden** atlar — çıkış kodu 0, ekranda
"Everything up-to-date". Sonuç: main gitti, etiket evde kaldı, `surum.yml` hiç
tetiklenmedi, ve site güncellenirken üç bağlantı 404 kalmaya devam etti.
Düzeltme iki parçalı ve ikisi de gerekli: etiket **annotated** üretiliyor, ve
push'tan sonra `git ls-remote` ile uzakta **gerçekten var mı** diye bakılıyor.
Bir push'a inanmak, hatayı sessizliğine geri verirdi.

### Yeşil olmayan tek şey — ve bu turun işi DEĞİL

`e2e/gorunum.spec.ts:341` → *"Sığdır haftanın tamamını kutuya sokuyor"*
**kırmızı**: hücre **39,546875 px**, istenen 37,4 px, pay 2 px. Bir önceki
oturumda da aynı sayılarla kırmızıydı, yani bu turun gerilemesi değil.
`surum.yml` E2E koşturmuyor, dolayısıyla sürüm çıkarmayı engellemiyor.

---

## Yirmi dördüncü oturum — iki sessiz boş ekran (2026-08-27)

Kullanıcının cümlesi tek satırdı: *"hem index.html'ye basıyorum açılmıyor hem
de kurulum kısmında Kur.cmd'ye basınca da kurulmuyor."* İkisi de doğruydu ve
ikisi de **kodun hatası değildi**: tıklanan iki dosya da teslim edilen
dosyanın **kaynağıydı**. Ama bunu ekranda söyleyen hiçbir şey yoktu — biri
bomboş beyaz bir sayfa veriyordu, öteki hiç indirilmemiş bir ZIP'i
aratıyordu. Tuzak 72 bu.

### Ölçülen

| Ne | Değer |
|---|---|
| Kök `index.html`, `file://` — önce | `#root` **boş**, konsolda CORS, ekranda hiçbir şey |
| ...sonra | uyarı **1 059 bayt**, "dist/index.html" ekranda |
| `dist/index.html` — depoda duran dosya | 253 441 bayt, **24 Ağustos**'tan kalma |
| ...yeniden derlendi | 528 700 bayt |
| ...uyarı eklendikten sonra | **530 690** (+1 990) |
| `dist-site/index.html` | 531 015 bayt |
| `dist-kurulum/` (yoktu, üretildi) | **581 433 bayt** |
| `kurulum/Kur.cmd` — önceki teşhis | "ZIP'i açmadan çalıştırmış olabilirsiniz" — **yanlış** |
| ...yeni teşhis | "Bu klasör kurulumun KAYNAĞI" + `npm run paket` |
| Kurulum GERÇEKTEN koşturuldu | `%LOCALAPPDATA%\Ders Programı` **562 KB** + 2 kısayol |
| Kurulmuş hâlinden yerel sunucu | `/` **200**, 531 015 bayt, başlık "Ders Programı" |
| ...`sw.js` · `manifest.webmanifest` · `icon-192.png` | 200 · 200 · 200 |
| `dersprogrami.localhost` ad çözümü (bu makine) | **127.0.0.1** |
| Süit | **521 birim + 395 E2E yeşil, 1 KIRMIZI** (aşağıda) |

### Ne yapıldı

1. **Kök `index.html`'e bir kaynak uyarısı.** `file://` altında ve yalnız
   `script[type="module"][src]` varsa `#root`'a Türkçe bir sayfa yazar:
   "bu dosya programın kendisi değil", `dist/index.html`, `npm run build`,
   ve kurulum için `npm run paket` → `dist-kurulum/Kur.cmd`.
   **Derlenmiş dosyada çalışamaz** ve bu ölçüldü: singlefile `src`'yi
   kaldırıyor, seçici orada null dönüyor. Derleme yapılandırmalarına
   dokunulmadı — sıyrılacak bir şey yok, çünkü sıyrılması gereken bir şey de
   yok.
2. **`kur.ps1` iki durumu ayırıyor.** Klasör adı `kurulum` ve bir üstünde
   `package.json` varsa: depo kaynağı. Değilse: eski ZIP cümlesi.
3. **`e2e/temel.spec.ts` 77** — iki test: kaynak şablon boş DEĞİL ve nereye
   bakılacağını yazıyor; derlenmiş dosyada uyarı canlanamıyor.
4. **Üç ürün de üretildi ve denendi**: `dist/index.html` açıldı (uygulama
   çizildi, konsol temiz), `dist-kurulum/` üretildi, `Kur.cmd` yolu gerçekten
   koşturuldu ve kurulan kopyadan sunucu ayağa kalkıp dosyaları verdi.

### Yeşil olmayan tek şey — ve bu oturumun işi DEĞİL

`e2e/gorunum.spec.ts` → *"Sığdır haftanın tamamını kutuya sokuyor"*
**kırmızı**, ve **HEAD'de de kırmızı**: değişiklikler `git stash`'lenip
yeniden derlenerek ölçüldü. Hücre **39,55 px**, istenen 37,4 px, izin verilen
pay 2 px — yani **0,15 px** taşıyor. Tuzak 37/39 ailesi: sütunun tabanını
başlığın min-content'i koyuyor ve o taban `ch`'nin kuantasıyla birlikte
kaymış. Payı büyütmek bir ölçümü kanun sanmak olurdu (tuzak 42); tabanın
nereden geldiği tek tek kapatılarak ölçülmeden dokunulmadı.

---
## Yirmi üçüncü oturum — G turu: kalan üçlü ve `.exe` (2026-08-27)

Kullanıcının isteği iki parçaydı: *"o üçlüye de son noktayı koyalım ayrıca
.exe'ye de başlayalım."* Üçlü kapandı; `.exe` "başlamak"tan öteye gitti ve
**gerçekten çalıştı**.

### Ölçülen

| Ne | Değer |
|---|---|
| `dist/index.html` — oturum başı (HEAD) | 525 818 bayt |
| `dist/index.html` — oturum sonu | **528 677** (+2 859) |
| İlk boyama, `file://` — HEAD | 84 ms medyan · 104 en kötü |
| İlk boyama, `file://` — şimdi | **80 ms** medyan · 92 en kötü |
| Gömülü yüz — önce (wght 400–600) | 23 332 bayt |
| Gömülü yüz — sonra (wght **400–700**) | **24 392** (+1 060) |
| Aynı reçeteyle `350:700` / `300:700` | 31 212 / 31 932 (+7 880 / +8 600) |
| Kaynak yüz (depoda, OFL 1.1) | 122 084 bayt |
| Metrik sapması, kaynak ↔ mevcut, wght 400 | **225 karakterin 225'i AYNI** |
| `'0'` glifi, wght 600 ↔ 700 nokta farkı — eski yüz | **0.0** (kırpıyordu) |
| ...yeni yüz | **406.5** |
| Tarayıcıda `'Haftalık ders programı'` — eski yüz | 400=1001 · 600=1042 · **700=1042** |
| Tauri sürüm ikilisi (Linux, `opt-level=s` + LTO) | **3 742 584 bayt (3,64 MB)** |
| Sürüm derlemesi | 1 dk 38 sn |
| Exe: açılıştan diske İLK YAZIMA | **986 · 1053 · 1149 ms** (3 koşu) |
| `rustc` / `webkit2gtk-4.1` | 1.98.0 / 2.52.5 |

Boyut farkının **hepsi bugünün değil**: kayıtlı 489 815 baytlık taban D
turundan, arada E ve F turları geçti. Bugünün payını ayırmak için HEAD ayrı
bir worktree'de derlendi — **+2 859 bayt**, ve ilk boyamada ölçülebilir bir
fark yok (84 → 80 ms, gürültünün içinde).

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

| Katman | Önce | Sonra |
|---|---|---|
| Birim (Vitest) | 517 | **521** |
| E2E (`file://`) | 388 | **394** |
| Site · sunucu · klasör | 19 | 19 |
| Çözücü stresi | 7 | 7 |
| **Rust (`cargo test`)** | — | **6** |

`npm run kontrol` çıkış kodu **0**.

### Üçlünün kapanışı

**1 — Font ekseni.** Asıl engel eksen değildi, **reçetenin yokluğu**ydu
(tuzak 69): 23 KB'lik woff2 kimsenin yeniden üretemediği bir eserdi.
`scripts/font.mjs` + `scripts/font-source/` (kaynak yüz depoya kondu, 122 KB,
OFL 1.1) → `npm run font`, çevrimdışı ve tekrarlanabilir.
Reçete `lean 400:600`'ü **23 660 bayt** üretti; mevcut dosya 23 332'ydi, yani
%1,4 içinde — tarif doğrulandı. Sonra eksen **ölçülerek** seçildi: yukarı bir
basamak 1 060 bayt, aşağı bir basamak 7 880. `styles.css` 300'ü hiç istemiyor,
alınmadı (ilke 5).
Kapatılan gerçek hata: beş kural `font-weight: 700` istiyordu, yüz 600'de
kırpılıydı, ve beşi de **sessizce 600 çiziyordu** — üçü kâğıtta (tuzak 70).
Yeni E2E eski yüz geri konularak kırmızıya döndürüldü.

**2 — Görsel regresyon sorusu.** Cevap: **geri gelmiyor**, ve yerine geçen şey
zaten var — erişilebilirlik ölçümleri **anlam** ölçüyor (WCAG, ΔE, erişilebilir
ad), piksel değil. Ama `npm run ekran`ın kendi deliği kapatıldı: katman artık
**tek bir iddia** taşıyor, deklanşör anında `.main` ve her `.panel` tam opak.
Tasarım hakkında hiçbir şey söylemiyor; "bir şeyin resmi çekildi" diyor.
`settled()` çıkarılarak kırmızıya döndürüldü: `panel opacity=0.00`, yani
2026-08-27'de yaşanan hatanın ta kendisi.

**3 — 4j belgeler.** "Üç derleme hedefi" → **DÖRT**. Exe'nin `frontendDist`'i
`../dist`, yani dört yolun dördü de aynı `dist/index.html`'i taşıyor ve
arayüzün hiçbir kopyası yok.

Yanında: **A4** (12 `confirm` + 5 `alert`) grep'lendi, geçirilmemiş çağrı
kalmamış — `[x]`. **MCP** üç sunucu da oturumda kullanılabilir — `[x]`.

### `.exe` — ve neden hiçbir kural kopyalanmadı

`folder.ts` dosya adlarının, günlük yedeğin ve "son 10" budamasının tek evi.
Bunları Rust'a taşımak, "hangi yedekler silinir" sorusuna **iki cevap** vermek
olurdu ve ikisi ilk düzenlemede ayrışırdı. Onun yerine `src/desktop.ts` üç
Tauri komutunu bir `FileSystemDirectoryHandle` **kılığına** sokuyor, ve
`saveInto()` exe'de olduğu gibi koşuyor. Rust'ta yalnız tarayıcıda karşılığı
olmayan iki şey var: hangi klasör, ve bir adın gerçekten ad olduğunu
doğrulayan kapı (`safe_name`).

`src/desktop.test.ts` bunu şöyle koruyor: gerçek `saveInto()`'yu adaptörün
üstünde koşturuyor ve **hangi komutların çağrıldığını** sayıyor. Beşinci bir
komut belirirse orası kırmızıya döner.

`isDesktop()` bir **derleme bayrağı değil**, özellik tespiti (tuzak 65'in
dersi) — aynı `dist/index.html` dört yolda da aynı dosya. `exe.spec.ts`'in
son testi tam bunu koruyor: köprü yokken sayfa hâlâ bir tarayıcı sayfası.

`storageKind()` üçüncü branch'ini aldı. `library.ts`'in kendi yorumu bu anı
öngörmüştü ve *"o branch O ZAMAN yazılacak"* diyordu; o zaman geldi. Gerekçe
kozmetik değil: exe normal bir köken üstünden servis edildiği için protokol
sorusu ona "site" der — doğru ve işe yaramaz. Panelin doğru söylemesi gereken
şey "tarama verilerini temizle işinizi alabilir mi", ve exe'de **alamaz**.

**Uçtan uca kanıt.** Ekran görüntüsü alınamadı (bu kabuktan X yakalama
çalışmıyor), ama ondan güçlü bir kanıt var: exe çalıştırıldı ve **hiçbir şeye
tıklanmadan** `~/Documents/Ders Programı/` altında iki dosya belirdi —
`ders-programi-tumu.json` ve `ders-programi-2026-08-27.json`, `bundleVersion 1`,
`schemaVersion 6`, ikisi birebir aynı. Bu tek gözlem şu zincirin tamamını
doğruluyor: pencere açıldı → sayfa yüklendi → React bağlandı → `isDesktop()`
Tauri'yi gördü → `data_dir_path` döndü → `write_file` gidip geldi → disk yazdı.

### Doğrulanmamış — ve bu bilerek yazılıyor

- **Windows'ta tek satır koşmadı.** `surum.yml` yazıldı, YAML'i geçerli,
  hiç tetiklenmedi. Ubuntu tarafının kabuk adımları **yerelde koşturuldu**
  (BOM/CRLF/ASCII denetimi + zip); ilk hâli doğru dosyalarda kırmızı veriyordu
  çünkü `grep` UTF-8 bir yerelde üç baytlık BOM'u desen olarak eşleştiremiyor —
  `od` ile bayt karşılaştırmasına çevrildi ve bozulmuş dosyalarla test edildi.
- **Hiç sürüm yayınlanmadı**, yani README'deki üç indirme bağlantısı bugün
  404 veriyor (ölçüldü: `curl -IL` → 404). README bunu açıkça yazıyor.
- ~~**`surum.yml` GitHub'a hiç gitmedi.**~~ **Artık gitti** (commit 83950c5,
  `origin/main`). 2026-08-27'de ölçüldü: `.github/workflows/` altında yalnız
  `site.yml` ve `surum.yml` var; `exe.yml` yok, ikincisinin içine girdi.

### Pages açıldı, deploy geçti, ADRES başkasına gidiyor (2026-08-27)

`site #5` **başarılı** — dört başarısızlıktan sonra Pages anahtarı açıldı ve
`build` + `deploy` uçtan uca geçti. Ama yayınlanan adres bizim değil:

```
alparslansemiz.github.io/ders-programi/   301   gamemetrix.me/ders-programi/
gamemetrix.me                             Cloudflare   "GameMetrix" uygulaması
gamemetrix.me/ders-programi/              404   (o uygulamanın 404'ü)
```

Sebep GitHub Pages'in bir kuralı: **hesabın kullanıcı sitesi deposunda
(`AlparslanSemiz.github.io`) tanımlı özel alan adı, o hesabın BÜTÜN proje
sayfalarını kapsar.** O depoda `main` üstünde commit'li bir `CNAME` dosyası
var ve içinde `gamemetrix.me` yazıyor — ama o alan adının DNS'i GitHub'a
değil Cloudflare'a bakıyor.

**Kaldırmanın GameMetrix'i kırıp kırmayacağı ÖLÇÜLDÜ**, çünkü Cloudflare
GitHub Pages'i proxy'liyor olsaydı kaldırmak onu düşürürdü:

| | `gamemetrix.me` | gerçek bir Pages sitesi |
|---|---|---|
| `server` | `cloudflare` | `GitHub.com` |
| `x-github-request-id` | **yok** | var |
| CSP `connect-src` | `https://api.gamemetrix.me` | — |

Yani GameMetrix tamamen Cloudflare'da ve GitHub Pages'ten bağımsız; alan adı
ayarını kaldırmak ona dokunmaz. İkinci kanıt zaten elimizdeydi: Pages o
alan adını sunuyor olsaydı `/ders-programi/` yolu proje sayfasına giderdi,
gitmedi.

**Kullanıcı kararı: hesap düzeyindeki alan adı kaldırılacak.** O zaman adres
`https://alparslansemiz.github.io/ders-programi/` olur ve sertifika GitHub'ın
kendisinden gelir — ki bu yol için şart, çünkü site yolunun tek gerekçesi
service worker ve klasör seçici, ikisi de güvenli bağlam istiyor. Dağıtımın
kaydettiği adres bugün `http://` (GitHub o alan adı için sertifika
çıkaramıyor).

### Depo tarafında ölçülenler (2026-08-27, açık depo API'si)

Depo **yeniden adlandırılmış**: `AlparslanSemiz/AscLike` →
`AlparslanSemiz/ders-programi`. Yerel remote ve README bağlantıları buna göre
düzeltildi (GitHub eskisini yönlendiriyor, ama yönlendirmeye yaslanmak bir
plan değil).

| Ne | Durum |
|---|---|
| `exe` iş akışı | tanımlı, **0 koşu** — hiç tetiklenmemiş |
| `site` iş akışı | **4 koşu, 4 başarısızlık** |
| `site` → `build` işi | uçtan uca **success** |
| `site` → `deploy` işi | **failure**: `Failed to create deployment (status: 404) … Ensure GitHub Pages has been enabled` |
| `has_pages` | **false** |

> **Bu tablo aynı gün BAYATLADI ve yerinde bırakıldı**, çünkü o saatin ölçümü
> buydu. Öğleden sonra Pages açıldı: `has_pages: true`, 09:33 koşusu
> **success**, site 200 veriyor. Güncel hâli **Yirmi beşinci oturum**
> bölümünde. `exe` iş akışı ise artık YOK — `surum.yml`'in içine girdi.

Yani `site.yml`'in kendi başlığında yazan iki şarttan biri (yeniden adlandırma)
yapılmış, öteki (Pages kaynağı = "GitHub Actions") yapılmamış. Ölçülen 3,64 MB ve ~1 sn açılış **Linux/WebKitGTK**;
  Windows/WebView2 başka bir sayı verecek.
- **SmartScreen görülmedi.** İmzasız exe'de Windows "bilinmeyen yayıncı" der;
  babaya ne yapacağı henüz yazılmadı, çünkü ekranın ne dediği görülmedi.
- **`bundle.icon`'un `--no-bundle` ile ikonu gömdüğü varsayıldı**, ölçülmedi.
  Windows koşusunda exe'nin ikonuna bakılacak.
- `~/Documents/Ders Programı/` bu makinede **testten kaldı** — silinebilir.

---

## Yirmi ikinci oturum — B turu: yerel kurulum (2026-08-26)

Park edilmiş kurulum turunun beş maddesi ve kalan tasklardan **4f**.
Dal: `v1.1-kurulum` (kullanıcı kararı), madde başına bir commit.

Turun gerekçesi **bir kez yanlış yazıldı ve ölçümle düzeltildi** — ayrıntısı
aşağıda, *Turun gerekçesini düzeltmek zorunda kaldım*. Kısası: yerel sunucu,
klasör özelliğinin **tek** evi değil, **daha iyi** evi.

### Ölçülen

| Ne | Değer |
|---|---|
| `dist/index.html` — Y turu sonu | 517 360 bayt |
| ...favicon eklendikten sonra | **518 811** (+1 451; işaretin kendisi 1 205) |
| ...B4 (klasör) eklendikten sonra | **525 101** (+6 290) |
| ...B6 (sade favicon + üst çubuk işareti) | **525 818** (+717: işaret +1 455, favicon −738) |
| `dist-site/` toplam | 547 213 bayt |
| `dist-kurulum/` — babaya giden TEK klasör | **575 761 bayt** |
| `icon.ico` — 16·sade, 32·sade, 48, 64, 128, 256 px | 11 858 bayt |
| Açılış, `file://` (9 koşu) | **76 ms** medyan · 73 en iyi · 109 en kötü |
| Açılış, yerel sunucu (9 koşu) | **82 ms** medyan · 77 en iyi · 92 en kötü |
| İkinci yolun maliyeti | **6 ms (%8)** |
| `isSecureContext` @ dersprogrami.localhost | true (ama `file://`'ta da true — aşağı bkz.) |
| OPFS @ yerel sunucu ↔ `file://` | **açılıyor ↔ `SecurityError`** |
| service worker @ yerel sunucu ↔ `file://` | **kaydoluyor ↔ `TypeError`** |
| `sunucu.ps1` ↔ `sunucu.mjs` yanıtları | **baytı baytına aynı** (index.html ve PNG) |

Son satır turun ikinci ölçümü: `pwsh` 7.6.5 kuruldu (sudo'suz, GitHub
tarball → `~/.local/share/powershell`) ve PowerShell sunucusu **burada
koşturuldu** — 127.0.0.1, `[::1]` ve `dersprogrami.localhost` üçünden de.

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

```
tsc --noEmit          temiz
birim                 517 (18 dosya)   — önce 508 (+9: folder.test.ts)
E2E (file://)         388              — önce 381 (+7: favicon 2, file:// ölçümü 2,
                                       marka işareti 3)
site (http)           19               — önce 6 (+5 sunucu, +8 klasör)
çözücü                7
npm run kontrol       YEŞİL (çıkış kodu 0)
```

### Yapılanlar

- **4f** `.github/workflows/site.yml`. İş akışının kendi kontrolü yerelde de
  koşturuldu (`dist-site/index.html` ikinci bir betik istemiyor).
  **Yan ürün, listeleyerek bulundu:** `publicDir` `site/` klasörünün tamamını
  kopyaladığı için üç logo adayı yayınlanan siteye giriyordu; `dropStudio()`
  eklentisi çıkarıyor.
- **B3b** Gömülü favicon. İşaret artık iki yerde (`site/icon.svg` ve
  `index.html`), ve **ayrışmasını bir test yakalıyor**: URI çözülüp aynı 13
  dikdörtgeni çizdiği karşılaştırılıyor.
- **B1** `scripts/sunucu.mjs` + `kurulum/sunucu.ps1`. `HttpListener` değil ham
  `TcpListener` (localhost dışı önek yönetici ister), ve **iki geri döngüye
  birden** bağlanıyor — tuzak 66.
- **B2** `Kur.cmd` · `Guncelle.cmd` · `kur.ps1` · `OKU.txt` · `icon.ico` ·
  `scripts/{ikon,paket}.mjs`.
- **B4** `src/folder.ts` (saf ikisi testli) + `src/useFolder.ts` + Ayarlar →
  Veri'de panel. **Şema değişmedi**, yeni localStorage anahtarı **yok**:
  tutamak `IndexedDB['ders-programi-klasor']`'da.
- **B5** Belgeler: ilke 2'nin ikinci daraltması, üç derleme hedefi, mimari,
  tuzak **65–68**.

### Üç hata, üçü de ölçerek bulundu

1. **Sahte klasör tutamağı IndexedDB'ye hiç girmiyordu.** Structured clone
   fonksiyon klonlayamaz, yani "yeniden açılınca hatırlanıyor" testi
   **hatırlanması imkânsız** bir şeyi ölçüyordu. Çare sahteyi büyütmek değil
   küçültmek: gerçek bir OPFS tutamağı alındı, yalnız sürülemeyen parça
   (`showDirectoryPicker`) sahtelendi. **Tuzak 67.**
2. **İzin testi ölçmek istediği durumu kendi eliyle siliyordu.**
   `addInitScript` her yüklemede koşuyor ve varsayılanı geri yazıyordu.
   **Tuzak 68.**
3. **Tuzak 62 üçüncü kez yaşandı.** Bir sabotaj koşusunda yama `tsc`'yi
   kırdı, `npm run build:site` düştü, ve test **bir önceki** `dist-site`'ı
   ölçüp yeşil geçti. Derleme çıktısında `error TS` aranarak yakalandı.

### Ölçülemeyen — dürüst liste

- **`Kur.cmd`, `.lnk` üretimi (WScript.Shell COM) ve Windows PowerShell 5.1**
  yalnız Windows'ta koşar; bu makine Fedora. Gözden geçirildi, **DENENMEDİ**.
  Koşturulabilen yarısı koşturuldu: `kur.ps1`'in kopyalama yolu gerçekten
  çalıştırıldı (9 dosya yerine gitti, bilerek bırakılan eski dosya silindi,
  Türkçe metin düzgün çıktı) ve kopyalamanın kısayol adımından **önce**
  bittiği doğrulandı.
- **GitHub Actions koşusu** burada koşturulamaz. YAML ayrıştırıldı, iş
  akışının kendi kontrolü yerelde koşturuldu.
- **Gerçek klasör diyaloğu** Playwright'la sürülemez. Elle **denenmedi** —
  kullanıcıya bırakıldı.
- 16 px'te işaret çamurlaşıyordu — bulundu, soruldu, **kapatıldı** (aşağıda).

### Turun gerekçesini düzeltmek zorunda kaldım

Bu turu şu cümleyle açtım: *"`file://` güvenli bağlam değildir, orada
`showDirectoryPicker` tanımlı bile değildir."* Cümleyi dört kaynak dosyaya,
üç commit mesajına ve iki belgeye yazdım. **Chromium'da ikisi de yanlış.**

Yakalayan şey bir test değildi — bir **ekran görüntüsü**ydi. Panelin "API
burada yok" durumunun resmini almaya çalıştım; resimde "Klasör seç…" düğmesi
çıktı, çünkü API oradaydı.

Ölçülen (Chromium, `dist/index.html`, `file://`):

```
isSecureContext                    true          ← yanılmışım
showDirectoryPicker                function      ← yanılmışım
indexedDB                          açılıyor
navigator.serviceWorker.register   TypeError
navigator.storage.getDirectory     SecurityError
location.origin                    "file://"     — host YOK
navigator.storage.persisted()      false
```

`file://`'ın eksiği güvenli bağlam değil, bir **köken**. Sonuçları:

- **Klasör özelliği iki yolda da sunuluyor**, ve bunu belirleyen tek şey
  `'showDirectoryPicker' in window` — teslim yolu değil. Kod zaten böyleydi
  (özellik tespiti), yanlış olan yorumlar ve arayüz metniydi.
- **Yerel sunucunun gerekçesi daraldı ve doğrulandı:** çevrimdışı çalışan bir
  sayfa (service worker), bu programa ait bir depo (OPFS ve kendi IndexedDB
  ad alanı), ve tarayıcının **tek bir siteye** saklayabildiği bir izin —
  `file://` altında depo makinedeki her yerel sayfayla ortak.
- Arayüzdeki "yok" metni artık **tarayıcıyı** anlatıyor (Firefox, Safari),
  teslim yolunu değil.
- Düzeltme bir cümle değil, bir **test**: `e2e/temel.spec.ts` **75. bölüm**
  yukarıdaki beş satırı ölçüyor. Yanlış iddia geri yazılırsa kırmızıya döner.
- **Tuzak 65** bu olayın kaydı olarak yeniden yazıldı.

Düzeltilen dosyalar: `src/folder.ts` · `src/components/settings/Data.tsx` ·
`scripts/sunucu.mjs` · `kurulum/sunucu.ps1` · `e2e/sunucu.spec.ts` ·
`e2e/klasor.spec.ts` · `CLAUDE.md` · `README.md` · bu dosya.

---

### 16 px kusuru bulundu, bildirildi ve KAPATILDI

`.ico` üretildikten sonra 16/32/48/256'da yan yana **bakıldı**: 48 px ve üstü
temiz; 32 meşgul; **16'da altı sütun birleşip mavi bir lekeye dönüyor** ve
sekme sırasından ayırt edilemiyor. Marka kullanıcı tarafından 16 px'te
görülerek seçilmişti, o yüzden değiştirmeden **soruldu**; kullanıcı
sadeleştirilmiş varyantı istedi.

`site/icon-small.svg`: aynı fikir — haftaya konmuş renkli dersler — 16 px'te
ayakta kalanla çizilmiş. Üç sütun, hayalet sütun yok, çubuklar iki kat geniş.
İkinci bir logo değil; gerçek ikon setleri tam olarak bunu yapar.

| Nerede | Hangi |
|---|---|
| Sekme (favicon) · `.ico` 16/32 | **sade** |
| `.ico` 48–256 · PWA 192/512 · üst çubuk | ayrıntılı |

Eşik (`< 48 px`) uydurulmadı, o karşılaştırmadan çıktı. Kanıt:
`scratch/ikon-karsilastirma.png` ve `scratch/ikon-sekme.png` (16 px, bir sekme
sırasında, iki temada).

**Yan ölçüm:** favicon'un `data:` URI'si **1 205 → 467 bayt**.

### Marka işareti üst çubuğa girdi

Kullanıcı isteği: *"ayrıntılı olanı da güzel bir şekilde websitenin üst barında
en sol üste koy."* `.brand-mark`, `1.75rem` — **ölçülen: 28 px @%100, 42 px
@%150**, yani `--ui-scale`'i izliyor. Sol kenardan 14 px (%150'de 21).
`<img src>` değil inline SVG (ilke 3). Düğme değil, `aria-hidden`.

Tuzak 48'in sorusu — bu satırda ne feda edilir — **ölçülerek** cevaplandı:
işaret hiç feda edilmiyor, sığıyor. Örnek okul yüklüyken (tuzak 41), iki
ölçekte de: sekme taşması **0**, çubuk taşması **0**.

Çizim artık **üç yerde** ve üçünün ayrışmasını iki test yakalıyor
(`temel.spec.ts` 72, `kabuk.spec.ts` 76). `scripts/favicon.mjs` URI'yi yeniden
üretiyor — elle düzenlenmiyor.

### Bu turda iki ölü/bozuk şey daha bulundu, ikisi de SABOTAJLA

1. **`.brand` için yazdığım `@media print` kuralı ÖLÜYDÜ.** Sabotaj testi
   kırmızıya döndürmedi: `.topbar` baskıda zaten `display: none`. Kural
   silindi, test **koruma testi** olarak işaretlendi — koruduğu şey işaretin
   bir gün üst çubuktan çıkması.
2. **`scripts/favicon.mjs`'i belgelerken kendi gövdesini iki kez yazmışım**
   ve bunu ancak sabotaj koşusu gösterdi (`SyntaxError: Identifier
   'readFileSync' has already been declared`). Betik hiç koşmamıştı, yani
   sabotaj D ölçmek istediği şeyi hiç ölçmemişti. Onarıldı ve sabotaj
   tekrarlandı: kırmızı.

---

## Yirmi birinci oturum — Y turu (2026-08-26)

Kullanıcının aynı mesajda verdiği **üç liste kusuru**, `docs/TASKS.md`'ye elle
eklediği **on bir madde**, ve onaylanan kurulum planının **logo** parçası.
Kurulum turunun geri kalanı kullanıcı kararıyla **park edildi** ("şimdi bu
listeye geç").

Bu oturumun karakteri: **her madde önce ölçüldü.** Üç kusurun üçü de ekrandan
bildirilmişti ve üçü de piksele kadar ölçülebilir çıktı — ve hiçbiri bir kelime,
bir sayı ya da bir öznitelik değiştirmediği için süit baştan sona yeşildi
(tuzak 33'ün ailesi).

### Ölçülen — önce ve sonra

| Ne | Önce | Sonra |
|---|---|---|
| Dersler'de `Sil`in sağ kenardan uzaklığı (%100 / %150) | **42 / 73 px** | **6 / 6 px** |
| ...öteki üç listede | 6 / 19 px | 6 / 6 px |
| Liste satırının boyu (%110) | **70 px** | **57 px** |
| Öğretmenler tablosunun yatay taşması (%100 / %110 / %125 / %150) | 0 / **106** / **267** / **548 px** | 0 / **0** / **0** / 322 px |
| Kurulum'un sol sütunu (1920, %110) | 1185 px | **1381 px** |
| ...sağdaki kenar sütunu | 620 px | 422 px |
| Arama şeridiyle tablo arası (%100 / %150) | **44 / 59 px** | **9 / 12 px** |
| Izgarada satır başı (%110) | 145 px | **106 px** |
| ...içindekinin gerçekten istediği | 78 px (en uzun branş 97 px = 5,51rem) | — |
| Gün sınırı çizgisi | 2 px `--line-dark` | **3 px `--day-edge`** |
| Önizleme satırı ↔ kâğıt satırı | **~30 px ↔ 86,93 px** | **86,93 ↔ 86,93 px** |
| Baskı başlığı, dokuz düzen×boyut birleşiminde | **hepsinde 22,7 px** | 9,6 – 26,7 px |
| Kâğıttan dikey taşma, dokuz birleşimde | per=4'te 74 px | **hepsinde 0** |
| `dist/index.html` | 512 431 bayt | **517 360 bayt** |

Son satır bağımlılık kuralının istediği ölçüm: **+4,9 KB**, ve yeni npm paketi
yok — büyüme yeni CSS ve `Print.tsx`'in sayfa düzeni.

### Üç hata, üçü de yalnız ÖLÇÜLEREK bulundu

1. **Kâğıttaki yazı boyutu hiç çalışmıyordu.** `--fs-p-*` `:root`'ta
   tanımlıyken çarpanı `.print-area`'da ezmek hiçbir şey yapmaz: bir custom
   property tanımlandığı yerde çözülür, alt öğeler **bitmiş sayıyı** miras
   alır. Hata mesajı yok, test kırmızı değil — yalnız dokuz farklı ayarda
   başlık aynı 22,7 px. **Tuzak 63.**
2. **Y8'in ilk testi yanlış kutuya bakıyordu** ve bozuk derlemede yeşil geçti.
   `white-space: nowrap` bir flex öğesini büyütmüyor, öğenin **kendi metnini
   kırpıyor**. Gerçek kanıt: `"Derslik ve branş — Ayn…"`, %150'de iki satır.
   **Tuzak 64.**
3. **Tuzak 62 yeniden yaşandı.** `npm run build 2>&1 | tail -2 && npx playwright
   test …` zincirinde çıkış kodu `tail`'inki olur. Derleme `tsc` hatasıyla
   kırıldı, testler **bir önceki** `dist/index.html`'i ölçtü ve "sabotaj
   testi" on iki testin on ikisini de yeşil gösterdi. `set -o pipefail`
   konduktan sonra gerçek sonuç çıktı: **10 kırmızı, 2 yeşil** (ikisi bilerek
   koruma testi).

### Bedava yeşil değil

Yeni yazılan 12 E2E'nin hepsi, kaynak tek tek bozularak koşuldu:

```
Sil hizası .................. KIRMIZI
%110 / %125 taşma ........... KIRMIZI (ikisi de)
%100 taşma .................. yeşil  — o ölçekte zaten taşmıyordu, dürüst
şerit-liste boşluğu ......... KIRMIZI (iki ölçek)
duyuru satırı ............... KIRMIZI
kırpılan kutular ............ yeşil  — geleceğe karşı KORUMA testi
kısaltma kutusu ............. KIRMIZI
çarpı kırmızı/büyük ......... KIRMIZI
ısı haritası değişmedi ...... yeşil  — koruma testi
satır başı .................. KIRMIZI
gün sınırı en kalın ......... KIRMIZI
kâğıtta çarpı yok ........... KIRMIZI
kâğıtta sınıf rengi ......... KIRMIZI
"Sayfada ne olsun" kırpılma . KIRMIZI
üstüne bırakma (4 test) ..... KIRMIZI (3'ü; biri renk testi ve o da kırmızı)
```

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

```
tsc --noEmit          temiz
birim                 508 (17 dosya)   — önce 490
E2E                   381              — önce 356
site                  6
npm run kontrol       YEŞİL
npm run ekran         34 görüntü, iki tema
```

Yeni testler: `constraints.test.ts` +10 (`dropMap`/`evict`/`evictionNotice`),
`bell.test.ts` +5 (`periodGroups`), `printOptions.test.ts` +3,
`kurulum.spec.ts` +8, `program.spec.ts` +4, `musaitlik.spec.ts` +2,
`izgara.spec.ts` +3, `yazdir.spec.ts` +9.

### Şema değişmedi

`perSheet` ve `size` `PrintOptions`'a girdi — `State`'e değil, çünkü bir çıktı
kararı bir öğleden sonraya aittir, yedeğe değil. Yeni depolama anahtarı **yok**:
ikisi de mevcut `ders-programi-baski` kaydında duruyor, ve o kayıt zaten "tek
soru, birden çok cevap" diye tasarlanmıştı.

### Park edilen

Yerel kurulum turunun beş maddesi (`dersprogrami.localhost` sunucusu, Windows
kurulum betikleri, favicon, "nereye kaydedilsin", ilke 2'nin belgeye yazılması)
`docs/TASKS.md` → **PARK EDİLEN** bölümünde, kararlarıyla birlikte duruyor.
Logo yapıldı: üç aday çizildi, 16/32/64/192 px'te iki zeminde render edildi,
kullanıcı **A — Şerit**'i seçti. Adaylar `site/logo-adaylari/` altında duruyor.

> **Doğrulanmayı bekleyen varsayım:** `sunucu.ps1` yazılınca bu makinede
> koşturulamayacak — `pwsh` kurulu değil (kontrol edildi). Yazıldığında
> "gözden geçirildi, **ölçülmedi**" diye işaretlenecek.

---

## Yirminci oturum — F turu (2026-08-26)

Kullanıcının üç maddesi. Dördü karar sorusu olarak soruldu ve cevaplandı:
sıralama/süzgeç açıkken tutamak **pasif** · baskı seçenekleri **sağdaki panelde
ve kalıcı** · cinsiyet **listede + sıralama/süzme + Kurulum özetinde**, kâğıda
çıkmaz.

### 1. Listelerde elle sürükleyerek sıralama

`src/rowDrag.ts` — saf DOM pointer jesti, `poolSplit.ts` deseninin
**dördüncüsü**. `drag.ts` yeniden kullanılmadı: orası "84 hücreden hangisi ve
bırakmak yasal mı" sorusunu cevaplıyor, buradaysa gereken tek şey bir **indis**.

**Şema DEĞİŞMEDİ, ve bu bir karardı.** Dizinin kendisi zaten sıra: `parseState`
onu koruyor, `sanitize` `teachers`/`rooms` dizilerine hiç dokunmuyor, ve
Program'ın satırları, Yazdır'ın sayfaları, Müsaitlik'in seçicisi hepsi aynı
diziyi `map`'liyor. Ayrı bir `order: number` ikinci bir gerçek olurdu.

Tutamak **kendi sütununu** alır (tuzak 47) ve klavyeyle de çalışır
(ok · Home · End); taşıma `role="status"` ile söylenir. Sıralama ya da süzgeç
açıkken **pasif**, çünkü o zaman ekrandaki 3. satır dizinin 3. öğesi değil.

**Ölçülen hata:** ilk hâl hedefi "hangi orta noktaları geçtim" ile buluyordu ve
tam ortaya bırakmak satırı **bir sıra eksiğe** koyuyordu. Paralel koşuda bir
**flake** olarak göründü. Kapsamaya çevrildi. Tuzak 60.

### 2. Havuz sırası artık ızgarayı takip ediyor

`buildPool` kartları satır etiketine göre alfabetik diziyordu — elle sıralanmış
bir ızgarada "kartını yukarı doğru avlamak" demek. Artık satır **indisine**
göre. Yorumun kendi niyeti ("bir satırın kartları yan yana dursun") korundu.

### 3. Yazdır — "Sayfada ne olsun"

`src/printOptions.ts`, beş anahtar, **tek** localStorage kaydı
(`ders-programi-baski`). `theme.ts`'e girmedi: oradaki dokuz skaler ilk
boyamadan önce `<html>`'e öznitelik yazan düzen değerleri, bunlar render anında
React prop'u olan **tek bir karar**.

Panelde, şeritte değil: Yazdır şeridinde dört düğme var ve `serit.spec.ts`
%150'de yatay taşmayı ölçüyor — beş açma/kapama daha oraya sığmıyordu.

**Çıktı tarihi yeni bir öge** (`.p-stamp`) ve **kapalı başlıyor**: açık
gelseydi paneli hiç açmamış birinin çıktısı değişirdi. 205 mm sabit sayfada
taşma **0 px**, PDF sayfa sayısı **değişmiyor** — ölçüldü.

### 4. Öğretmende cinsiyet — `schemaVersion` 6

`Gender = '' | 'k' | 'e'`; `''` bir **değer**, eksik veri değil. Alan adı
İngilizce (`gender`), görünen metin Türkçe.

**Göçün kritik satırı:** `version === 5` okuyucunun koşuluna **açıkça**
eklendi. Eklenmeseydi bugünkü sürümün yazdığı her yedek `null`'a düşerdi. Beş
test bunu koruyor, ve koşul geçici olarak kaldırılıp **beşi de kırmızıya
döndürüldü** — bedava yeşil değil.

Yapıştırma kutusu dördüncü sütunu okuyor (`K`/`Kadın`/`kadin`/`Bayan`…), üç
sütunlu eski yapıştırma bozulmuyor.

`listview.ts`'in facet'i **çoğullaştı**: iki çip satırı birlikte daraltıyor, ve
bir satırın sayıları **öteki uygulanmışken** alınıyor.

### 5. Ölçülen ve düzeltilen: liste tablosu %150'de kırılıyordu

Cinsiyetin açığa çıkardığı, ondan **eski** bir hata. `width: 100%` bir tabloda
on bir sütun %150 ölçekte sığmıyor ve tarayıcı odayı **küçülebilen** sütundan
alıyor:

```
                   %100        %125        %150
ad kutusu (önce)   232px       171px       55px    <- cinsiyet sütunu YOKKEN
ad kutusu (sonra)  190px        98px       26px    <- sütun eklenince
ad kutusu (şimdi)  209px       235px      283px    <- .table-scroll ile
sayfa yatay taşması  0px         0px         0px
```

Hiçbir test görmedi: her kontrol vardı, değeri doğruydu, yalnız
**görünmüyordu** — tuzak 33'ün ta kendisi. Çare iki yarılı: geniş içerik kendi
kutusunda kayar, ve `min-width: max-content` ancak hücrelerin bir içerik
genişliği varsa bir şey ifade eder — `width: 100%` bir kontrol ona **sıfır**
katkı yapar. Tuzak 61.

Ekran görüntüsüne bakılmasaydı ikisi de kaçardı: add formundaki kutu
"Belirtilm" yazıyordu, satırdaki "Erke". Tablo hücresi için ayrı bir kısa hâl
yazıldı (`GENDER_CELL`, `''` → `—`) — `Teacher.name`/`Teacher.short` ayrımının
aynısı.

### Sayılar

`npm run kontrol` **çıkış kodu 0** (2026-08-27): tsc + 569 birim + derleme +
427 E2E + 22 site + 7 çözücü. `npm run exe:test` 20 Rust testi, `npm run
patrol` 4 devriye testi, ikisi de ayrı ve ikisi de yeşil.

```
birim testleri     490  (öncesi 453) — 17 dosya
E2E                350  (öncesi 318) — sira.spec 10 · baski-secenek.spec 10 ·
                        kurulum'un 63. bölümü 12
site testleri        6
dist/index.html    512 431 bayt  (öncesi 489 815; +22,6 kB)
```

**İlke 7 yeniden ölçüldü** (tuzak 42: ölçüm bir tarihtir). 1920×1080, `file://`,
7 koşu, `about:blank`'ten `.topbar` görünene ve `document.fonts.ready`
çözülene kadar:

```
açılış   30 ms medyan · 103 ms en kötü (ilk koşu, soğuk)
```

Bir uyarı: **2026-08-26'daki 73 ms ile birebir karşılaştırılamaz** — o ölçümün
neyi beklediği yazılı değil, bu ölçüm fontun çözülmesini de bekliyor. Söylenen
tek şey şu: 512 kB'lik tek dosya bu makinede hâlâ 30 ms'de açılıyor.

---

## On dokuzuncu oturum — E turu (2026-08-27)

Kullanıcının listesi yedi maddeydi; dördü karar sorusu olarak soruldu ve
cevaplandı (üç basamaklı hareket ayarı · **belirgin** koyulaştırma · Kontrol'e
de şerit · baskı önizlemesinde **yalnız ekran** değişsin).

### 1. Hareket ayarı — `tam · az · kapalı`

Ayarlar → Görünüm'de dördüncü panel. Dokuzuncu makine tercihi
(`ders-programi-hareket`, `data-motion`), `State`'e girmez.

Asıl iş CSS'teydi ve **var sanılan bir şeyin yarısının olmadığı** ortaya çıktı:
süreler tek yerden kısılabiliyordu (`--dur*`), ama **mesafeler** her kuralda
elle yazılıydı (`translateY(.5rem)`, `translateX(100%)`, `scale(.96)`,
`translateY(1px)`). 0 ms'lik bir geçiş hareketi durdurmaz — öğeyi **ışınlar**.
Dört yeni token: `--slide` · `--sweep` · `--press` · `--pop`. Tuzak 57.

**Makine tercihi bir TABAN, ayar onu ezemez.**
`@media (prefers-reduced-motion: reduce)` bloğu `[data-motion]` kurallarından
**sonra** durur. Kayıt yoksa tercih sistemden türetilir — yoksa hiçbir şeyin
kıpırdamadığı bir makinede düğmede "Tam" yazardı. Tuzak 58.

### 2. Şerit standardı — beş kural, altı sekme

Beş şerit beş ayrı nesneydi; Kontrol'de şerit **yoktu**, o yüzden o sekmeye her
girişte altındaki her şey **45px zıplıyordu**. Şimdi altısı da aynı iskelette:
başlıkla açılır · `Sep`/`Spacer` ile bölünür · her düğmede simge VE kelime ·
hepsi `--ribbon-h` (2rem) yüksekliğinde. `e2e/serit.spec.ts` beşini de ölçer.

**Yazdır ve Ayarlar** ilk kez simge aldı; üç varlık türü **istisnasız**
`KIND_ICON`'dan gelir (Yazdır'ın "Sınıflar"/"Öğretmenler"i dahil), gerisi
lucide (14 yeni simge).

**Kontrol'ün şeridi raporu SÜZER**: `Hepsi · Sorunlar · Kapasite`, sağ ucunda
`N engel · N uyarı`. Süzgeç `toolState`'te (tuzak 18); `Check.tsx` yalnız hangi
panelleri çizeceğini süzer, `buildReport` tam koşar — şeritteki sayı ile
panellerdeki satırlar ayrışamaz.

### 3. Koyu tema — ölçülerek koyulaştırıldı

Kullanıcı: *"koyu temayı daha da koyulaştır siyahları"*. Bütün düzlemler bir tam
basamak indi. Yanında **iki gerçek onarım**, ikisi de ölçüldü:

```
                       önce      sonra    sözleşme
kâğıt parlaklığı       .0174  →  .0096    < 0.02  (eşik 0.1'den indirildi)
metin / kâğıt          13.26  →  14.99    >= 7
soluk / kâğıt           7.28  →   8.23    >= 4.5
soluk / KAPALI          4.69  →   5.71    >= 5.0   <-- açık temada 5.09'du
bölüm renkleri, en düşük 4.89  →   5.52    >= 4.5
ΔE(band, kâğıt)         4.67  →   2.45    2.0-3.5  <-- açık temada 2.45
ΔE(bg, chrome)          6.63  →   4.73
ΔE(chrome, chrome-2)    2.86  →   2.34
ΔE(chrome, kâğıt)       5.44  →   4.16
ΔE(kapalı, kâğıt)      14.14  →  13.80    (açık 14.04)
ΔE(hatch, kapalı)       6.23  →   6.46    (açık 6.44)
baskı çizgisi / kâğıt    2.02  →   3.01    >= 3 (metin olmayan)
```

`--band` tuzak 40'ın diğer yüzüydü: gün bandı *gruplamak* için var, koyuda açık
temanın iki katı güçte çiziliyor ve bir **durum** gibi okunuyordu. Artık iki
temada da 2.45; `izgara.spec.ts` hem tavanı hem iki temanın eşitliğini ölçüyor.

`--shadow` ikiye ayrıldı: hayaletin gölgesi palet renginin üstünde durduğu için
tema ile dönmez (tuzak 15/35), ama **yapışkan başlığın** gölgesi kabuk
düzlemindedir ve koyu zeminde %35 siyah hiçbir şeydir — yeni `--shadow-shell`
(koyu: %85).

### 4. Baskı önizlemesi — yalnız EKRAN

Kâğıda tek bayt dokunulmadı (205 mm sayfa, 8/10 mm dolgu, 23 mm satır aynen).
Ekranda `.print-page` artık masaya konmuş bir **sayfa**: A4 yatay oranında bir
taban, gölge, yuvarlatılmış köşe, 62rem tavan; satır **30px → 3.25rem** (%110'da
57px). `@media print` bu süslerin **hepsini** geri alır ve `yazdir.spec.ts`
ikisini birden ölçer: önizleme büyüdü VE kâğıda hiçbir şey sızmadı.

### Ölçüldü

```
dist/index.html   501 685 bayt   (489 815'ten; +11,6 KB — 14 lucide simgesi + hareket + Kontrol şeridi)
file:// açılışı   65 ms medyan · 84 ms en kötü · 62 ms en iyi   (7 koşu, 1920×1080)
şerit yüksekliği  altı sekmede de 44,97 px · düğmeler 35,19 px (%110)
baskı satırı      ekran 57,2 px · kâğıt 86,9 px (= 23 mm)
önizleme sayfası  1091,2 × 771,5 px  (en/boy 1,415 — A4 yatay 1,414)
```

### Ayrıca

- `.reason-bar`'a **`role="status"` + `aria-live="polite"`**. Erişilebilirlik
  sözleşmesi bu satırı adıyla anıyordu ve satırda **yoktu** — sözleşme bugüne
  kadar karşılanmıyordu.
- **README.md** yazıldı (iki satırdı).
- `npm run ekran` artık görüntüyü almadan önce sayfanın hareketinin bitmesini
  bekliyor. **Bakılarak bulundu**: `dark-12-ayarlar-gorunum.png` bomboş
  çıkıyordu, açık ikizi yarı saydamdı, ve hiçbir test bunu söyleyemezdi çünkü o
  katman hiçbir şey iddia etmiyor. Tuzak 59.
- `e2e/otomatik-stres.spec.ts` `'■ Durdur'` adını arıyordu; düğme simge+kelimeye
  dönünce kırıldı ve **`npm run kontrol`'ün dışında olduğu için** ancak
  `npm run cozucu` koşulunca görüldü. Tuzak 49'un bir daha yaşanmış hâli.

---

## On sekizinci oturum — D turu (2026-08-26)

Kullanıcı üç kez tekrarlayarak istedi: *"design noktasındaki kısıtlamaları
kaldır ve sil onları. ardından uygulamamızı/sitemizi en güzel UX'li en güzel
UI'lı hale getir."* Üç sınır soruldu: **estetik + bağımlılık yasağı** kalksın ·
**kontrast/erişilebilirlik ölçümleri kalsın, düzen ölçümleri gitsin** · kapsam
**her şey**. Faz 3'ten sonra durulup gösterildi; kullanıcı **"daha cesur
olsun"** dedi ve varsayılan ölçeğin %110 kalmasını seçti.

### Ölçülen — ilke 7 artık bir VARSAYIM DEĞİL

İki yıl boyunca "hedef makine yavaş" ölçülmemiş bir cümleydi. 1920×1080,
`file://`, 7 koşu:

```
dist/index.html      489 815 bayt   (405 242'den; +84,6 KB)
file:// açılışı      73 ms medyan · 83 ms en kötü · 51,9 ms en iyi
imleç haçı           0,391 ms / sütun değişimi   (16,7 ms karenin %2,3'ü)
ızgara               1950 hücre, 426 kart
```

Paket maliyetleri tek tek ölçüldü (taban 405 242 bayt):

| Paket | Maliyet | Karar |
|---|---|---|
| `lucide-react` (12 simge) | +3,4 KB | alındı |
| `@radix-ui/react-dialog` | +39,5 KB | alındı |
| `+ react-toast` | +19,6 KB | **alınmadı** — eylem taşımayan toast'a gerekmiyor |
| `+ react-dropdown-menu` | +51,0 KB | alındı (popper'ı o getiriyor) |
| `+ react-tooltip` | +8,2 KB | alındı |
| `+ react-popover` | +5,0 KB | alındı |
| `motion` | +127,2 KB | **alınmadı** — `startViewTransition()` bedava |
| Tailwind | — | **alınmadı** — token katmanı zaten olgun |

Renk sözleşmesi (her koşuda `renk.spec.ts`):

```
kâğıt parlaklığı     1.000 / 0.017     (sözleşme >0,9 açık, <0,1 koyu)
metin / kâğıt       17,47 / 13,26
soluk / kapalı       5,09 /  4,69
accent / accent-bg   6,59 /  6,47
sekme en düşük AA    5,63 /  4,89
sekme ↔ işlevsel    52,5  / 49,9  ΔE  (sözleşme >32)
```

### Yol boyunca ölçümle bulunan dört şey

1. **%110'da "Sığdır" haftayı sığdıramaz oldu** (76px taşma). Taban tahmin
   edilmedi, tuzak 37'nin yöntemiyle tek tek kapatıldı: kartın **üst** satırı
   (sınıf numarası) koyuyordu — alt satır ve saat numarası değil. Sığdır'da
   kart yazısı bir basamak iniyor, `max(12px, --fs-2xs)`.
2. **Durum çipi eklenince %150'de son sekmeler tıklanamaz oldu.** `.tabstrip`
   küçülüyor ama `.tab`'ler küçülmüyordu: şerit 693px'te bitiyor, Ayarlar
   823px'te. Tuzak 48.
3. **Müsaitlikteki saat ayarının gerekçesini yanlış yazdım.** "Sütunu
   daraltıyor" dedim; ölçüldü, tablo iki durumda da **1341,7 × 354,2 px**.
   `table-layout: fixed` + `width: 100%`. Gerekçe düzeltildi, test de. Tuzak 50.
4. **`renk.spec.ts` koyu temada DOM hakkında yanılıyordu**: `--on-color`'ı
   `--drop-ok-bg` üstünde ölçüyordu (2,08:1) ama `.card` kendi palet zeminini
   taşıyan bir `button`, yani o mürekkep oraya hiç düşmüyor. O zeminde çizilen
   şey 3px'lik dış çizgi; ölçülen 4,1 açık / 5,0 koyu.

### Yapılanlar

- **Belgeler:** CLAUDE.md'nin ~290 satırlık tasarım sistemi → 68 satırlık
  "Tasarım — serbest" + dört sözleşme. `docs/DESIGN.md` yeni CSS'ten yeniden
  yazıldı (envanter, kural değil). `docs/PLAN.md` bağlayıcı olmaktan çıkarıldı.
- **Testler:** görsel regresyon (24 PNG) ve düzen testleri kaldırıldı;
  erişilebilirlik ölçümleri kaldı. C10'un 24 kırmızısı kapandı.
  **450 birim + 277 E2E + 6 site**, hepsi yeşil.
- **Görsel dil:** OKLCH'ten türetilmiş rampa, dolu bölüm sekmeleri, elektrik
  indigo accent, beş kot, beş yarıçap, dokuz tipografi basamağı, üç yoğunluk
  (**Ferah** yeni), ölçek varsayılanı %110.
- **17 native diyalog** → `useDialogs()`. Toast'lar elde yazıldı.
- **Varlık paneli** — kullanıcının doğrudan istediği şey; `entityWeek` /
  `entityFacts` saf ve testli.
- **Listelerde ara/sırala/süz** — `listview.ts`, Türkçe katlama ve sıralama.
- **Komut paleti (Ctrl+K)**, **durum çipi**, `Alt+1..6`.
- **Müsaitlikte saat ayarı** (varsayılan kapalı) ve **"Programı boşalt"**.

### Doğrulanmayı bekleyenler

- Hiçbiri **babanın kendi makinesinde** görülmedi. Bütün ölçümler buradaki
  Chromium'da, 1920×1080'de.
- **Görsel regresyon yok artık.** `npm run ekran` kanıt üretiyor ama bir insan
  bakmazsa hiçbir şey yakalamıyor. Bir dönem kullanıldıktan sonra karar.
- **Fontun ağırlık ekseni 400–600'de kaldı** (plan 300–700 diyordu):
  `fontTools` kurulu değil, alt kümeyi yeniden üretmek kaynak fontu indirmeyi
  gerektiriyor.
- ~~Cinsiyet alanı ve elle sürükleyerek sıralama yapılmadı~~ — **F turunda
  yapıldı** (2026-08-26). Cinsiyet `schemaVersion` 6 istedi ve aldı; elle
  sıralama istemedi.
- **`file://` açılış süresi F turundan sonra YENİDEN ÖLÇÜLMEDİ.** Dosya
  490 kB → 512 kB büyüdü. Tuzak 42: ölçüm bir tarihtir, kanun değil — bir
  sonraki oturumun ilk işi bunu ölçüp buraya yazmak.

---

*(Aşağısı önceki oturumların kaydı.)*

## Şu anki sürüm hedefi

**v0 → v0.9** — elle dizme + yapılabilirlik kontrolü + okul düzeni ve kurallar +
iki arayüz turu + **otomatik dizme**. TASKS'ta v1 olarak duran otomatik doldurma
bu turda geldi; kullanıcı istedi.

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
- **v0.8 çıkma şartı:** localhost'ta gözle bakınca çıkan liste kapandı; her öğretmen
  ve her sınıf kendi renginde, ayarlar kendi sekmesinde, branş seçiliyor, kapalı
  saatte kalan ders görünüyor. → **sağlandı** — hepsi gerçek tarayıcıda ölçülüyor
  (36 renk tek tek okunup karşılaştırılıyor, ayraç genişliği ve yazı boyu piksel
  olarak alınıyor). *Yine babanın makinesinde değil, buradaki Chromium'da.*
- **v1.0 çıkma şartı:** babam aracı çift tıklanan bir `.exe` olarak açabiliyor,
  aynı veriye siteden de bakabiliyor, ve birden fazla planı yan yana tutabiliyor.
  → **kısmen** — plan kitaplığı, taslaklar, **bütün planları taşıyan tek dosya**
  ve **site/PWA** bitti (4a–4e); Pages yayını ve Tauri (4f–4i) duruyor.
  *Site fiş çekiliyken açılıyor (ölçüldü), ama daha yayınlanmadı; `.exe` yok.*
- **v0.9 çıkma şartı:** araç haftalık programı kendisi dizebiliyor, dizilmiş bir ders
  sürüklenerek taşınabiliyor, ve ekranın tamamı kullanılıyor. → **sağlandı** —
  örnek veride 359 bloğun 359'u 87 ms'de ve **hiç geri sarmadan** yerleşiyor;
  altı sekmede dikey ve yatay taşma 0 px, ikinci sütunun dolu olduğu ölçülüyor.
  *Gerçek veri hâlâ yok; ölçümler örnek veriyle.*

---

## Durum özeti

| Aşama | Durum |
|---|---|
| **C turu: çift üst bar (rail kalktı)** | ✅ ölçüldü, E2E bekliyor |
| **C turu: havuz ALTA + sürüklenebilir boy** | ✅ ölçüldü, E2E bekliyor |
| **C turu: araç şeridi (ribbon), altı sekme** | ✅ ölçüldü, E2E bekliyor |
| **C turu: boş alanlar gerçek veriyle doldu** | ✅ ölçüldü, E2E bekliyor |
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
| **Görünüm simgeleri** | ✅ *(v0.8'de kep + öğrenci grubu oldu)* |
| **v0.8: palet 12 → 36, çakışmasız renk** | ✅ 11 birim + 6 E2E |
| **v0.8: sınıf renkleri, şema v5** | ✅ birim + E2E |
| **v0.8: Ayarlar sekmesi** (Kurulum 7 → 4 adım) | ✅ 5 E2E |
| **v0.8: branş listeden seçiliyor** | ✅ 5 E2E |
| **v0.8: başlangıç saati 24 saat / 5 dk** | ✅ 4 birim + 3 E2E |
| **v0.8: havuz görünümü takip ediyor** (hata) | ✅ 4 E2E |
| **v0.8: ince ayraç, büyük çarpı** | ✅ 4 E2E |
| **v0.8: kapalı saatte ders işaretleniyor** | ✅ 8 birim + 4 E2E |
| **v0.8: yazdırmada sayfa seçimi** | ✅ 4 E2E |
| **v0.9: sol kenar çubuğu, `.main` App'te** | ✅ 13 E2E |
| **v0.9: her sekmenin sağ sütunu dolu** (`.cols`) | ✅ ölçülüyor |
| **v0.9: sol tık taşır, sağ tık siler** | ✅ 5 birim + 7 E2E |
| **v0.9: otomatik dizme (`solver.ts`)** | ✅ 20 birim + 10 E2E |
| **v0.9: `occupy`/`vacate` eşdeğerliği** | ✅ 7 birim |
| **v0.9: sebep kodları (`blockerDetail`)** | ✅ 7 birim + 3 birim |
| **v0.9: Kontrol sekmesi test edildi** | ✅ 12 E2E |
| **v0.9: geri-al zinciri, hata yolları, boş ekranlar, klavye** | ✅ 28 E2E |
| ~~v0.9: görsel regresyon~~ | ⬛ **2026-08-26'da SİLİNDİ** (kullanıcı kararı). `npm run gorsel` artık `package.json`'da yok; yerine `npm run ekran` **kanıt** üretiyor |
| **Çözücü dünya matrisi** | ✅ 21 dünya · 78 birim + 26 E2E · ağırlar `npm run cozucu` |
| **v1.0: çözücü kural baskısı altında çökmüyor** | ✅ 3/359 → **241/359 blok** · 6 yeni birim testi |
| **v1.0: plan kitaplığı (`library.ts`)** | ✅ 25 birim + 11 E2E · devralma **sıfır kopya** |
| **v1.0: taslaklar** | ✅ 4 E2E · taslak = `PlanInfo.draft`, ayrı varlık değil |
| **v1.0: paket dosyası (`bundle.ts`)** | ✅ 11 birim + 4 E2E · `bundleVersion: 1`, yeni anahtar YOK |
| **v1.0: "veriler nerede" paneli** | ✅ 5 birim + 2 E2E · gerçek anahtar adları ve boyutlar |
| **v1.0: baskı turu** (başlık, ortalama, üst/alt bilgi) | ✅ 5 E2E · PDF ile **gözle** doğrulandı |
| **v1.0: site derlemesi + PWA** | ✅ 6 site testi · **fiş çekiliyken açılıyor** |
| **A0: hedef ekran 1366×768 → 1920×1080** | ✅ 3 config · 3 iddia düzeltildi · 20 belge/yorum |
| **Y0: yüzey ve çizgi ayrımı (`--hairline`)** | ✅ 11 kural + 1 kural ikiye bölündü · iki temada ekran görüntüsü |
| Tasarım sistemi A1–A2 (tipografi merdiveni, `ch` sütun merdiveni) | ✅ JSX'te 0 inline genişlik · `e2e/sutun.spec.ts` 11 test |
| Tasarım sistemi A5 (ızgara yoğunluğu) | ✅ Sığdır'da yatay kaydırma **788 px → 0** |
| Tasarım sistemi A3 (gömülü font) | ✅ IBM Plex Sans, 23 KB, `dist` 347 → **379 KB** |
| Tasarım sistemi A4 (renk seçici) | ✅ 6×6 swatch dialog · 8 E2E. `confirm`/`alert` **kalan iş** |
| **B turu — yeniden tasarım (üç düzlem · ızgara enstrümanı · havuz çekmecesi)** | ✅ 14 yeni E2E · ölçüldü, iddia edilmedi |
| GitHub Pages yayını | ⬜ bekliyor (kullanıcıdan: depo adı + Pages kaynağı) |
| Gerçek veriyle deneme | ⬜ **bekliyor** |
| Tauri ile `.exe` paketleme | ⬜ bekliyor |
| **E: hareket ayarı (`tam · az · kapalı`)** | ✅ 3 birim + 7 E2E · dört mesafe tokeni · makine tercihi TABAN |
| **E: şerit standardı (altı sekme, beş kural)** | ✅ 10 E2E · Yazdır ve Ayarlar ilk kez simgeli · yükseklik ±1px |
| **E: Kontrol'ün şeridi ve süzgeci** | ✅ 4 E2E · 45px'lik zıplama gitti |
| **E: koyu tema koyulaştırıldı** | ✅ ölçüldü: band ΔE 4.67→**2.45**, soluk/kapalı 4.69→**5.71**, kâğıt .0174→**.0096** |
| **E: baskı önizlemesi kâğıda benziyor** | ✅ 4 E2E · satır 30px→57px · kâğıda **hiçbir şey sızmadı** |
| **E: `.reason-bar` `aria-live`** | ✅ sözleşme bugüne kadar karşılanmıyordu |
| **E: README** | ✅ iki satırdı |

**E2E artık 1920×1080'de koşuyor** (babanın 27" ekranı; A0).

**Testler (2026-08-27): 453 birim + 318 E2E + 6 site = 777, hepsi geçiyor.
`tsc --noEmit` temiz. `npm run build` → tek dosya `dist/index.html`,
**501 685 bayt** (gömülü font dahil), sıfır ağ çağrısı; `npm run build:site` →
`dist-site/` (aynı tek dosya + manifest + `sw.js` + simgeler). `npm run kontrol`
toplam ~3 dk.**
Ayrıca `kontrol`'ün parçası OLMAYAN iki süit: `npm run ekran` (iki temada 17
görüntü — test değil, **kanıt**) ve 7 gerçek ölçekli çözücü testi
(`npm run cozucu`, ~36 sn). İkincisi bu oturumda bir gerileme **yakaladı**:
`kontrol`'ün dışında kalan bir süit, ancak elle koşulduğunda konuşur.

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

## v0.8 — gözle bakınca çıkanlar

Hepsi localhost'ta gerçek gözle ikinci denemede bulundu. Mantık ve veri modeli yine
sağlamdı; kusurların çoğu görünüş ve kullanım tarafındaydı. **Ama üçü gerçek hataydı**
ve ikisi kendini yıllarca saklayabilirdi:

1. **Havuz görünümü takip etmiyordu.** `buildPool` `view` almıyordu; sınıf görünümünde
   bir sınıfa ait kartlar havuzun her yerine dağılıyordu ve kartı kaldıran hayalet
   kartın kendisinden başka bir şey yazıyordu.
2. **Kapalı saatte kalan ders görünmüyordu.** Tarama yalnız BOŞ hücreye çiziliyor,
   dolayısıyla kart kapalı saati örtüyordu; `blocker()` yalnız olası bırakma için
   çalışır, Kontrol ise yalnız toplam kapasiteye bakar. Yani hiçbir ekran söylemiyordu.
   → **PLAN tuzak 16**
3. **Öğle arası ayracı "dar" tanımlıyken bir ders kadar genişti.** `.break-col` (0,1,0)
   `table.grid tbody td` (0,1,3) tarafından eziliyordu. → **PLAN tuzak 17**

Ayrıca `<input type="time">` boşaltılınca okul gününü sessizce 00:00'a alıyordu ve
baskıda `table.print th td.p-closed` seçicisi (`th` içinde `td`) hiç eşleşmiyordu.

**Renk artık kimlik.** 12 renkle 25 öğretmende renk tekrar ediyordu, yani havuz kartı
tek bir satırı göstermiyordu — kartın rengi zaten tam bunun için var. Palet 36 renge
çıktı ve CSS'ten `src/palette.ts`'e taşındı. Renkler elle seçilmedi: kontrast (≥4,5:1,
iki mürekkep için de) ve CIE Lab ayrımı kısıtları altında **en uzak nokta** yöntemiyle
arandı. Ölçülen sonuç eski paletten daha iyi:

| | eski 12 renk | yeni 36 renk |
|---|---|---|
| en yakın çift ΔE | 13,4 | **17,5** |
| art arda indeksler ΔE | — | **23,8** |
| ilk 25 renk (bir okul dolusu) ΔE | — | **20,0** |
| mürekkep kontrastı | 8,7 / 5,6 | **7,3 / 4,7** |

**Ayarlar ayrıldı.** Kurulum iki farklı türü bir arada tutuyordu: dönem başında
doldurulan dört liste ve yılda bir dokunulan okul ayarları. Kurulum artık 4 sayılabilir
adım, Ayarlar 4 bölüm. `Sıfırla` üst çubuktan Ayarlar → Veri'ye taşındı; `Dosyaya
kaydet` / `Dosyadan aç` üst çubukta kaldı (tuzak 7).

**Şema v4 → v5** (`ClassGroup.color`, `settings.subjects`). Göç `parseState` içinde,
birim **ve** gerçek "Dosyadan aç" yolundan test edildi. `spreadColors()` her yüklemede
çalışıyor: v4 dosyaları 12 renkle yazıldığı için çakışma kesin. Renkleri zaten tekil
olan dosya dokunulmadan geçiyor.

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
| **Otomatik dizme** (99 ders, 359 blok, 426 saat) | **359/359 blok · 359 düğüm · 87 ms · hiç geri sarma yok** |
| Aynı okul, üç sınır Engelle (art arda 2 · günde 5 · aynı ders 1) | 3/359 blok · 33 842 düğüm · 15 sn → **241/359 · 241 düğüm · 43 ms** |
| Aynı okul, yalnız "art arda en fazla 2" Engelle | neredeyse boş · 15 sn → **424/426 saat · 1,6 sn** |
| Örnek okul %95 doluluğa yüklenmiş (`gercek-olcek-sikisik`) | 3/423 blok · 15 sn → **412/423 · 3,6 sn** |
| Kasten imkânsız dünya (`gercek-olcek-imkansiz`, %160 yük) | 22/708 blok → **159/708** (bütçe yine doluyor) |
| **Baş toplamı — rail'li düzen** (topbar 59 + subbar 50 + sebep 30) | **139 px** |
| **Baş toplamı — çift bar** (topbar 51 + şerit 39 + sebep 26) | **116 px** |
| Şerit katlanınca ızgara | 789 → **827 px** (39 px geri) |
| Havuz boşalınca (kendiliğinden kapanır) | 176 → **53 px**, ızgara 789 → **912 px** |
| Havuz sürükleme — 100px yukarı | 176 → **280 px**, depoya `17.5` (rem), yenilemede durdu |
| Havuz tavanı (End tuşu) | **352 px**, ızgaraya 613 px kalıyor |
| Sığdır + havuz AÇIK — yatay taşma | **0 px** (hücre 19.5, tablo 1575/1588) — eski "174px" ölçümü geçersiz |
| ΔE(chrome, paper) | **5.16** açık · **3.98** koyu |
| ΔE(chrome, chrome-2) | **3.21** açık · **2.56** koyu |
| ΔE(band, paper) | ~~2.67 açık · 3.00 koyu~~ → **2.45 / 2.45** (2026-08-27; koyu 4.67'ye çıkmıştı, geri getirildi — bkz. on dokuzuncu oturum) |
| kontrast(text, paper) · kontrast(muted, paper) | 17.98 / 6.79 açık · ~~13.76 / 7.61~~ → **14.99 / 8.23** koyu |
| ~~`dist/index.html` **402 KB** (sınır 420 KB)~~ | **TARİHÎ.** 420 KB sınırı 2026-08-26'da kalktı; güncel değer **501 685 bayt**, bkz. on dokuzuncu oturum |
| Sürükleme başlangıcı — havuzdan, DOLU ızgarada | **0,305 ms** |
| Sürükleme başlangıcı — ızgaradan (taşıma: `removeBlock` + `buildIndex` + 72 `check`) | **0,266 ms** |
| ~~`dist/index.html` **331 KB**~~ | **TARİHÎ** (gömülü fonttan önce). Güncel: **501 685 bayt**, tek dosya, 0 ağ çağrısı |
| E2E paketi | ~~223 test, ~44 sn~~ → **318 test, ~2,4 dk** (4 worker) |
| Birim paketi | ~~402 test, ~2,9 sn~~ → **453 test, ~3,2 sn** |
| Çözücü stres paketi | **7 test, ~36 sn** (`npm run cozucu`, ayrı) |
| **Araç şeridi** (2026-08-27) | altı sekmede de **44,97 px**, düğmeler **35,19 px** (%110) |
| **Baskı önizlemesi** (2026-08-27) | sayfa **1091,2 × 771,5 px** (en/boy 1,415), satır **57,2 px**; kâğıtta satır **86,9 px** = 23 mm |
| Müsaitlik hücresi | **~67 × 48 px** (34 px'ti; tablo 238 → 322 px) |
| ~~Görsel referanslar 22 dosya~~ | **TARİHÎ** — katman 2026-08-26'da silindi. `npm run ekran`: iki temada **17** görüntü |
| Ekranda görünen öğretmen satırı | **10** (üst şerit 56 px'e indi) |
| Müsaitlik tablosu genişliği | 46px sabit hücreden **sütununu dolduran** tabloya |
| Baskı sayfası | A4 yatay (842×595 pt), 12 eşit sütun (±1px) |
| Palet | 36 renk, en yakın çift ΔE **17,5**, kontrast ≥ **4,7:1** |
| Öğle arası ayracı | **6 px** (hücre 34 px) |
| Kapalı saat "×" | **16 px**, kontrast AA |

Sürükleme başlangıcı asıl önemli sayı: babanın makinesi 20 kat yavaş olsa bile 6 ms.
Sayı 0,212'den 0,305'e çıktı ama karşılaştırma yanıltıcı — eski ölçüm **boş** ızgarada
alınmıştı, bu 426 saati dolu ızgarada. Taşıma (`removeBlock` + yeni `buildIndex`)
havuzdan sürüklemekten **daha ucuz**: kaynak blok düşülünce sözlük bir hücre eksiliyor.

Otomatik dizme sayısı asıl sürpriz: **359 blok için 359 düğüm**, yani hiç geri sarma
yok — sezgi ilk denemede doğru hücreyi buluyor. 20 kat yavaş makinede 1,7 saniye.
Bu sayı ilk yazımda **çok daha kötüydü** (57718 düğümde 26 blok); sebebi tuzak 21.

---

## Verilmiş kararlar

| Konu | Karar |
|---|---|
| Branş | **Öğretmenin** alanı, dersin değil. Her öğretmenin tek branşı var. |
| Sınıflar arası çakışma | Yok. Sınıf = kapalı öğrenci kümesi. |
| Derslik | Sınıfın **sabit** alanı. Seçim UI'sı yok, çakışma kontrolü var. |
| Ana ekran düzeni | Satır = öğretmen, sütun = 6 gün × 12 saat. Tek düğmeyle sınıf görünümü. |
| Renk | Her öğretmen ve her sınıf **kendi renginde**. Hücreyi daima öğretmen boyar; sınıf rengi satır başı noktası ve baskı başlığı. (2026-08-25) |
| Branş | Serbest metin değil, **listeden seçilir**. Liste Ayarlar'da yönetilir. (2026-08-25) |
| Sekmeler | **Altı**: Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar. (2026-08-25) |
| Kapalı saatte kalan ders | **Silinmez, işaretlenir.** Kararı baba verir (ilke 6). (2026-08-25) |
| Baskı sayfa seçimi | `State`'e girmez; **dışarıda bırakılanlar** tutulur. (2026-08-25) |
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
| **Sekme yerleşimi** *(v0.9 ✅)* | **Solda dikey kenar çubuğu**, 92px (daraltılınca 52px). Tercih `localStorage`'da, `State`'e girmez. |
| **Sağ sütun** *(v0.9 ✅)* | Her sekmede `.cols`: solda asıl iş, sağda o ekranın **anlamı**. Sağa konan hiçbir bilgi yeni değil. |
| **Yerleşmiş derse tıklama** *(v0.9 ✅)* | **Sol tık taşır, sağ tık siler**, Delete klavye eşdeğeri. Sol tık artık silmiyor. |
| **Otomatik dizme** *(v0.9 ✅)* | **Ana iş parçacığında, dilimli, iptal edilebilir.** Web Worker yok (tuzak 19). Kısıt mantığı `blocker()`'dan; solver kendi kuralını yazmaz. Kısmi sonuç uygulanır, tek geri-al adımı. |
| **Çözücü ayarları** *(v0.9)* | **Yok ve olmayacak** — iki düğme. Doğru cevap bir dönem kullanılmadan bilinemez (ilke 5). |
| **Görsel regresyon** *(v0.9 ✅)* | 20 referans, depoda, **ayrı komut**. `kontrol`'e bağlanmaz: sistem fontu makineye göre çözülüyor. |
| **Çözücü tavanı** *(v1.0 ✅)* | Her dersin **tavanı** arama başlamadan hesaplanır; `need` ona kırpılır. Ders bırakılmaz, tutabildiği kadarı dizilir. |
| **Tıkanma sayacı** *(v1.0 ✅)* | Izgara **20 000 düğüm** boyunca iyileşmezse bir dersten vazgeçilip en iyi ızgaradan devam edilir. Düğüm sayısı, saat değil: aynı girdi aynı çıktıyı vermeli. |
| **Birden fazla plan** *(v1.0 ✅)* | **Depo katmanında kitaplık.** `State` şeması ve `schemaVersion` değişmedi; plan kimliği tema/kenar çubuğu gibi makine tarafında duruyor. Yasak listedeki madde *plan* için kalktı, **aynı planın** sürüm ağacı için duruyor. |
| **İlk planın anahtarı** *(v1.0 ✅)* | **`ders-programi` olarak KALIR** (`planKey('1')`). Devralma tek bayt kopyalamaz; eski bir `dist/index.html` ve `ders-programi` okuyan her şey (yedek zinciri, E2E yardımcıları) çalışmaya devam eder. |
| **Taslak** *(v1.0 ✅)* | **Ayrı varlık değil**, `PlanInfo.draft` bayrağı — yerleşimi boşaltılmış bir plan. İkinci bir depo, ikinci bir şema, ikinci bir göç gerekmiyor. |
| **Yedek zinciri ve planlar** *(v1.0 ✅)* | Zincir **oturum başına**, plan başına değil: plan başına dört kopya 5 MB kotasını doldurur. Açılışta hangi plan açıksa ona ait; Ayarlar → Veri bunu yazıyor. |
| **Dosya biçimi** *(v1.0 ✅)* | **İki tane:** tek plan (`schemaVersion`) ve bütün planlar (`bundleVersion: 1`, `-tumu-` adında). Paket bir dosya biçimi, ikinci bir depolama anahtarı değil. |
| **Paket üst çubuktan açılmaz** *(v1.0 ✅)* | Üst çubuk paketi **reddedip yolu gösterir**. Bir planı açmak açık planı değiştirir; bir paketi açmak bütün kitaplığın yerine geçer ve geri alınamaz. |
| **Kota hatası sessiz kalmaz** *(v1.0 ✅)* | `writePlanText` / `savePlan` `boolean` döner. `safely()` yutulan bir kota hatasını sessiz kayba çeviriyordu (ilke 6). |
| **"Veriler nerede" ölçülür** *(v1.0 ✅)* | Panel gerçek anahtarları ve gerçek boyutları (UTF-16 kod birimi) yazar; E2E sayfanın gerçek anahtarlarıyla karşılaştırır. Ortam bugün iki değer: `file` / `site`. `exe` dalı 4h'de gelir. |
| **exe ⇄ site aynı veri** *(v1.0, karar)* | **Ortak bir `.json` dosyası.** exe otomatik yazar; site Dosya Sistemi Erişimi API'siyle aynı dosyaya yazar, olmayan yerde "Dosyaya kaydet"e düşer. Sunucu ve bulut senkron **yok**. |
| **Yayın** *(v1.0, karar)* | **GitHub Pages** (statik). Depo `ders-programi` olarak yeniden adlandırılacak. İlke 2'nin "deploy, domain yok" kısmı bilerek değişiyor; backend/veritabanı hâlâ yok. |
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

5. **Y0'da verilen token setinden üç sapma** *(2026-08-25)*. Set olduğu gibi
   yapıştırılmadı; üçünün de gerekçesi `styles.css` içinde yorumda duruyor:

   - **`--shadow` korundu.** Sette yoktu ama iki yerde kullanılıyor, biri
     sürüklenen hayalet kart. "Bir öğe yüzüyor gibi görünüyorsa yanlıştır"ın tek
     meşru istisnası o kart: gerçekten parmağın altında taşınıyor. Düşürülseydi
     gölge sessizce kaybolurdu.
   - **Koyu tema ve baskı bloklarına `--paper-sunk` + `--hairline` eklendi.** Set
     yalnız `:root`'u veriyordu. İki token koyu blokta tanımsız kalsaydı koyu
     temada bütün girdiler ve panel kenarlıkları çökerdi.
   - **`--muted` `#5c6672` → `#525c69`.** Verilen değer `--closed` üstünde WCAG
     AA'yı **4.08**'e düşürüyordu ve o gri, kapalı saatin `×` işaretinin rengi;
     `renk.spec.ts` iki testle yakaladı. **Sınır gevşetilmedi, renk düzeltildi**
     (kullanıcının A6 talimatı). En açık geçen değer `#555f6b` idi ama 4.54 ile
     sıyırıyordu; `#525c69` `--paper` 6.79 / `--closed` 4.75 veriyor.

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

**C turundan (2026-08-25):**

- **E2E süiti bu turda hiç koşulmadı** — kullanıcı kararı. 415 birim testi ve
  `npx tsc --noEmit` her adımda yeşil, derleme yapılıyor, ve her ekran gerçek
  tarayıcıda ölçülüp gözle bakıldı; ama 265 E2E testinin kaçının kırmızı olduğu
  **bilinmiyor**. En az dördünün iddiası bilerek değişti (bkz. TASKS → C10).
  Bu, tuzak 23'ün tam olarak uyardığı durumun tersidir: burada yeşil bir süit
  yok, **koşulmamış** bir süit var, ve ikisi aynı şey değil.
- **Görsel referanslar (24 PNG) artık yalan.** Kabuğun tamamı değişti;
  `--update-snapshots=all` gerekiyor (tuzak 25).
- **Yeni tuzaklar 42–47 buradan çıktı** ve hepsi gerçek hatalardı; beşi
  splitter'ı yazarken, biri (42) eski bir ölçümün geçersizleştiğini fark
  ederken. Beşi de sessizdi — konsol temiz, tip güvenli, test yeşil.
- **Baba hâlâ görmedi.** Çift bar, alt havuz ve sürüklenebilir boy onun
  alışkanlığına uyuyor mu bilinmiyor; ilke 5 gereği bir dönem kullanılmadan
  bunun üstüne özellik yazılmayacak.


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

4b. **Düğme kenarlığı bilerek mi güçlü?** *(Y0'da açıldı, 2026-08-25.)* `.btn`
   hâlâ `--line-dark` kullanıyor ([styles.css:272](../src/styles.css)); Y0'ın
   talimatı `--line` çağrılarını kapsıyordu, ona dokunulmadı. Ama girdiler gömük
   yüzeye geçince ekrandaki **en gürültülü kenarlık düğmeler oldu** — özellikle
   "Sil". `--hairline`'a mı insin, yoksa düğme kabuktan ayrışsın diye mi kalsın:
   **kullanıcıya soruldu, cevap bekliyor.**

4c. **Görünen satır tabanı dar payla duruyor.** `duzen.spec.ts` `visibleRows >= 18`
   diyor, 1920×1080'de ölçülen **19**. Satır yüksekliği sistem fontuna bağlı, yani
   başka bir makinede 2px uzasa taban hâlâ geçer, 4px uzasa kırılır. A3'te font
   gömülünce bu belirsizlik kapanır; A6'da yeniden ölçülecek.

5. **Gün ve zil düzeni kullanıcının verdiği taslak.** "40 dk ders, 10 dk teneffüs, 9'da
   başlar, 12 ders, 19:10'da biter; hafta içi 5–6 arası, hafta sonu 6–7 arası 30 dk öğle
   arası; Pazartesi hariç her gün." Babaya **teyit ettirilmedi**. Hepsi arayüzden
   değiştirilebilir, kod değişikliği gerekmez.

6. **Kural sayıları boş bırakıldı.** `limits` alanlarının hepsi 0 (sınır yok) ile geliyor:
   "art arda en fazla kaç saat" sorusunun cevabı bilinmiyor ve tahminle sayı koymak
   ilke 5'e aykırı. Kural motoru sayı girilene kadar hiç tetiklenmiyor.

7. **Branş listesi gömülü 21 adla geliyor.** Okulun gerçekten hangi branşları verdiği
   bilinmiyor. Liste artık Ayarlar'dan düzenlenebiliyor, ama babanın listesi elde
   olmadan hangi adların gereksiz olduğu tahminden ibaret.

8. **36 rengin gözle ayırt edilebildiği ÖLÇÜLDÜ, görülmedi.** ΔE eşiği sayıyı garanti
   eder, gözü değil — hele bir de babanın ekran ayarında. Gerçek veriyle dizerken
   sorulacak: iki satırı karıştırdığın oldu mu?

9. **Üst/alt bilgi bastırması babanın tarayıcısında da geçerli mi?** Burada Chromium'da
   ölçüldü: `@page { margin: 0 }` ile tarih ve dosya yolu çizilmiyor. Ama yazdırma
   diyaloğunda **kenar boşluğu elle değiştirilirse** tarayıcı CSS'in yerine kendi
   değerini kullanır ve üst/alt bilgi geri gelebilir. Karşı önlem yazıldı: Yazdır
   panelindeki ipucu artık "görürseniz **üstbilgi ve altbilgi** kutusunun işaretini
   kaldırın" diyor. **Fiziksel çıktıya hâlâ bakılmadı** (bkz. TASKS → gerçek veri).

10. **PWA babanın Windows'unda kurulabiliyor mu?** Manifest, simgeler ve service
    worker Chromium'da doğrulandı (çevrimdışı açılış dahil), ama "Uygulama olarak
    yükle" akışı **denenmedi** — ve site henüz yayınlanmadı (4f). Asıl teslim yolu
    yine de `.exe`; site onun yanında duruyor.

---

## Bilinen eksikler

1. **Babanın gerçek verisi elde yok.** v0'ın çıkma şartı bu. Örnek veriyle değil
   gerçek veriyle test edilmeli. **Otomatik dizme için ayrıca önemli:** `sample.ts`
   derslikleri kasten %79 doluluğa getiriyor, yani örnek veri babanın gerçek
   verisinden daha kolay ya da daha zor olabilir — bilinmiyor.
2. ~~**Görsel referanslar bu makineye ait.**~~ **Kapandı 2026-08-26:** görsel
   regresyon katmanı silindi (kullanıcı kararı), `npm run gorsel` diye bir komut
   yok. Yerine geçen `npm run ekran` bir şey iddia etmiyor — **kanıt** üretiyor,
   ve bir insan bakmazsa hiçbir şey yakalamıyor. Bu oturumda tam da öyle bir şey
   yakalandı, ve yakalayan şey bakmaktı (tuzak 59).
3. **Hız babanın bilgisayarında ölçülmedi.** Buradaki ölçümler geliştirme makinesinde.
4. **Baskı gerçek kâğıda alınmadı.** E2E artık sayfanın A4 **yatay** çıktığını
   (MediaBox 842×595 pt) ve sütunların eşit olduğunu ölçüyor, ama fiziksel çıktıya
   hâlâ bakılmadı. Yatay sayfa yazıcı ayarında da yatay seçilmesini gerektirebilir.
5. **Koyu tema babanın tarayıcısında (Brave) görülmedi.** Kontrast burada ölçüldü;
   asıl iddia "tarayıcı artık kendi karartmasını yapmıyor" ve bu yalnızca onun
   makinesinde kesinleşir.
6. `.roz` dosyası incelenmedi (aSc'den içe aktarma — düşük öncelik).
7. **Otomatik dizmenin ÇIKTI KALİTESİ ölçülmedi.** "Yasal mı" ölçülüyor (her blok
   `blocker()`'dan geçiriliyor), "iyi mi" ölçülmüyor: sınıf boşlukları (pencere),
   öğretmenin okulda geçirdiği gün sayısı, günlerin dengesi. Boşluk kuralları zaten
   yok (v2'nin işi). Babanın "bu programı kullanır mıydın" cevabı gerekiyor.
8. ~~**Çözücü zor bir veride ne yapar bilinmiyor.**~~ **2026-08-25'te ölçüldü.**
   `src/worlds.ts` 19 dünyalık bir matris kuruyor; dördü geri sarmayı gerçekten
   çalıştırıyor (`erken-saat-tuzagi` 9 blok / **201 düğüm**, `derin-geri-sarma` 12
   blok / **8362 düğüm**, `kural-baskisi` 12 / 28, `derslik-darbogazi` 8 / **57 929**).
   Geri sarmanın hiç çalışmadığı iddiası artık geçerli değil — ama çalıştığında ne
   olduğu **Bilinen hatalar 1**'e taşındı: gerçek ölçekte çöküyor.

9. **Çıktı KALİTESİ hâlâ ölçülmüyor** (eski madde 7 ile aynı kapı): matris "yasal mı"
   sorusunu 19 dünyada soruyor, "iyi mi" sorusunu hiçbirinde sormuyor.

10. **Yedek zinciri plan başına değil, oturum başına.** `ders-programi-yedek-N`
    açılışta hangi plan açıksa onun anlık görüntüsünü tutuyor; oturum içinde
    plan değiştirilirse zincir hâlâ eskisine ait. Bilerek: plan başına dört
    kopya 5 MB kotasını doldurur. Ayarlar → Veri paneli bunu yazıyor, ama
    babanın bunu okuyup okumadığı bilinmiyor — gerçek kullanımda sorulacak.

11. **Görsel regresyonun eşiği bir düzen değişikliğini kaçırdı.** Müsaitlik satırı
    34 → 48 px oldu, tablo 238 → 322 px büyüdü ve `npm run gorsel` **yeşil geçti**:
    `maxDiffPixelRatio: 0.01` (~10 000 px) düz renkli hücrelerde 84 px'lik bir
    büyümeyi yutuyor, çünkü değişen piksel çoğunlukla kenarlık çizgileri. Referanslar
    elle (`--update-snapshots=all`) yenilendi. Eşiği sıkmak yazı tipi kaynaklı
    kırmızıları getirir; bilerek dokunulmadı, ama bilinsin.

12. **Paket içe aktarma GERİ ALINAMIYOR.** "Tümünü dosyadan aç" bu bilgisayardaki
    bütün planların yerine geçiyor ve geri-al yığını zaten plan geçişinde
    sıfırlanıyor. Korunma yalnızca onay cümlesi (kaç plan silinip kaç plan
    açılacağını sayıyor). Bilerek: geri alınabilir yapmak silinen planların
    kopyasını tutmak demek, o da 5 MB kotasını ikiye katlar.

13. **Sitenin Dosya Sistemi Erişimi yolu YAZILMADI.** 4d'nin üçüncü parçası
    (`showSaveFilePicker` + IndexedDB tutamağı) 4e'ye taşındı: `file://` altında
    o API yok ve native diyalog Playwright'la sürülemiyor, yani bugün yazılsa
    kanıtsız kalırdı. Bugün exe ile site arasında veri **elle** taşınıyor:
    `-tumu-` dosyasını kaydet, öbür tarafta aç.

---

## Bilinen hatalar

### AÇIK — `Sığdır` hücresi payı 0,15 px aşıyor (2026-08-27)

`e2e/gorunum.spec.ts:341`. Hücre 39,55 px, istenen 37,4 px, pay 2 px.
HEAD'de de kırmızı, yani bir gerilemenin sonucu değil: sütunun tabanını
koyan başlık min-content'i kaymış. Doğru düzeltme payı büyütmek değil,
tabanı yeniden ölçmek (tuzak 37: alt sınırın nereden geldiği tek tek
kapatılarak bulunur).

**Üçü de 2026-08-25'te (sekizinci oturum) kapandı.** Ne oldukları ve nasıl
kapandıkları aşağıdaki oturum bölümünde; testleri `solver.test.ts` ve
`e2e/otomatik-stres.spec.ts` içinde duruyor.

1. ~~Kurallar sıkılaştırılınca çözücü gerçek ölçekte çöküyor~~ → **kapandı**,
   3/359 blok → 241/359, 33 842 düğüm → 241 düğüm.
2. ~~`e2e/otomatik.spec.ts` → "Engelle seviyesindeki kuralı çiğnemiyor" boşuna
   geçiyor~~ → **kapandı**: ızgara artık 424/426 saatle diziliyor ve test önce
   dolu hücreleri sayıyor, sonra kural soruyor.
3. ~~`solve()` bölünmeyen haftalık saatte `phase: 'solved'` diyor ama `stuck`
   dolu dönüyor~~ → **kapandı**: eksik bir şey varken hiçbir şey çözülmüş
   sayılmıyor; yerleşemeyeni olan her dünya testi bunu ayrıca iddia ediyor.

### KAPANDI — Y0'ın açtığı gerileme (2026-08-25, on üçüncü oturum)

~~**Renk seçici iki basamaklı sayıyı kırpıyor.**~~ → **kapandı.** Genişlik
JSX'ten CSS'e, `ch` cinsinden taşındı (`table.list td > select.color-pick`,
7ch) ve `e2e/renk-secici.spec.ts` yazıldı. Test bedavaya yeşil geçmiyor:
eski 44px geri konarak koşuldu, dört senaryonun dördü de
*«"1" kutusu 44px, gereken 57px»* diyerek kırmızıya döndü.

Kapatırken **ikinci bir hata** çıktı, ilkinden daha kötüsü: seçici `color:
inherit` kullanıyordu, yani rakam **temayla dönüyordu**. Koyu temada açık
mürekkep pastel zemine düşüyor ve 5, 7, 12, 16, 17. satırlarda indeks
**görünmüyordu** — tuzak 15'in hiç uygulanmadığı tek kontrol. Kutu geniştiği
için gözle bakılınca ortaya çıktı; dar hâlde de vardı, sadece görülmüyordu.
`--on-color` verildi.

Ölçülen (Chromium, 1920×1080, gövde 16px):

| | eski | yeni |
|---|---|---|
| kutu genişliği | 44 px | 64 px |
| tarayıcının istediği (`width:auto`) | 57 px | 57 px |
| rakam mürekkebi | `--text` (temayla döner) | `--on-color` (dönmez) |

A4 (6×6 renk ızgarası) hâlâ sırada; testi ona da geçerli, çünkü "seçili renk
okunuyor" bir kontrol türü değil bir gereksinim.

**Açık kalan zayıf nokta (hata değil, kalite):** `gercek-olcek-imkansiz` —
odaların ayırabileceğinin %160'ı istenen dünyada 708 bloğun 159'u diziliyor ve
15 sn'lik bütçe yine doluyor. Sonuç yasal ve cümlesi okunur ("haftada 15 saat
isteniyor, açık saatler ve kurallar en fazla 10 saat veriyor"), ama ızgaranın
dörtte biri dolu. Böyle bir veri zaten çözülemez; buradaki soru "ne kadarını
doldurabiliriz" ve cevabı ölçülmedi.

---

## On ikinci oturum (2026-08-25) — tasarım sistemi turu: A0 + Y0

CLAUDE.md'ye **"Tasarım sistemi"** ve **"Değişmez ilkeler — güncelleme"**
bölümleri girdi. İki yasak kalktı (gerekçeleriyle): **animasyon** — yalnız CSS
`transition`, yalnız durum değişiminde, ≤150 ms, `prefers-reduced-motion` ile
kapanır, kütüphane yok; ve **web font** — ağdan çekilmez, base64 ile tek dosyaya
gömülür. İlke 7 ("hedef makine yavaş") bir **varsayım** olarak yeniden
işaretlendi: babanın makinesinde ölçülene kadar gerekçe sayılmıyor.

### A0 — hedef ekran düzeltildi

Baba 27" monitör kullanıyor; araç v0'dan beri **1366×768** varsayıyordu. Yeni
hedef **1920×1080 CSS pikseli** (fiziksel değil: %150 ölçeklemeli bir 4K panel de
CSS'te 1920–2560 arası görünür).

Viewport'u değiştirir değiştirmez **228/228 test geçti** — yani hiçbir şey
kırılmadı, ve asıl tehlike buydu: geniş ekranda "sığıyor mu" soruları bedavaya
evet olur. Bu yüzden tahmin yerine ölçüldü:

| | 1366×768 | 1920×1080 |
|---|---|---|
| Görünen satır (25 üzerinden) | 9 | **19** |
| Yatay kaydırma payı | 1342 px | **788 px** |
| Dikey kaydırma payı | 514 px | **173 px** |
| Izgara genişliği / kutu | 2616 / 1274 | 2616 / **1828** |

Sonuç beklenenden iyi: **6 satır hâlâ katlanın altında ve ızgara hâlâ 788px
kayıyor**, yani "sürükleme hedefi ekran dışında" ve "kenara gelince kayıyor"
testleri boşalmadı. (1440px yükseklikte boşalırlardı.) Hiçbir test silinmedi;
üç iddiadaki yalan sayılar düzeltildi:

- `duzen.spec.ts` `visibleRows >= 9` → **`>= 18`**
- `program.spec.ts` `scrollLeft = 1200` maksimum 788'i aşıyordu, yani sessizce
  "sona kaydır" demeye başlamıştı → artık **gerçekten sona kaydırıyor** ve
  `room > 200` ile *kaydırmanın var olduğunu* ayrıca iddia ediyor
- İki test adındaki çözünürlük + `helpers.ts` yorumu

`playwright.ekran/gorsel.config.ts` `...base` yaydığı için **kendiliğinden**
miras aldı. `gorsel.config.ts`'teki `maxDiffPixelRatio` gerekçesi 1366×768 piksel
sayısına dayanıyordu; oran doğru kalıyor (bir ızgara satırı ~62 000 px, eşik
~20 700 px) ama yorum yenilendi.

**`STATUS.md` ve `TASKS.md`'deki 1366×768 rakamlarına dokunulmadı**: onlar oturum
kaydı, o gün doğruydular. Düzeltilen yalnız güncel iddialar (`CLAUDE.md`,
`docs/PLAN.md`, ve `styles.css`/`App.tsx`/`drag.ts` yorumları). Sol kenar
çubuğunun gerekçesi de **silinmedi, dürüstleştirildi**: dikey yarısı ("768px'te
şerit bir öğretmen satırı götürüyordu") artık geçersiz, yatay yarısı ekrandan
bağımsız olduğu için karar duruyor.

### Y0 — yüzey ve çizgi ayrımı

Yeni token seti uygulandı. **Turun en önemli tek değişikliği `--hairline` ile
`--line` ayrımı:** kabuk çizgisi ile veri çizgisi aynı griyse her şey kutu gibi
okunuyor.

- `--hairline`'a inen 10 kural: `.sidebar` · `.topbar` · `.topbar-sep` ·
  `.reason-bar` · `.step` · `.step-no` · `.panel` · `.entity-list` ·
  `.pick-list` · `.pick-head`
- `--line`'da kalan 5 yer, hepsi veri: `table.grid td` ×2 ·
  `table.availability td` ×2 · `table.list/stat th`
- **Bir kural ikiye bölündü.** `table.list th, td, table.stat th, td` tek
  kuraldı; başlık `--line`'da kaldı, satır ayraçları `--hairline`'a indi.
  25 satırlık bir listede her satırın kendi kutusu gibi okunmasının sebebi buydu.
- **Girdiler kenarlıkla değil gömük yüzeyle belli:** `--line-dark` kenarlık →
  `--hairline` + `background: var(--paper-sunk)`. 25 öğretmen × 9 alan kadar
  koyu kenarlık, kurulum ekranını kafes ızgarasına çeviren şeydi.
- `.panel.inset` (Excel yapıştırma kutusu) kenarlığını kaybetti, `--space-6` ile
  ayrılıyor. Kenarlık içinde kenarlık, "kutu kutu" hissinin kendisi.
- Gövde `--fs-base` + `--lh-base`; ızgara ailesi (`.card`, `.ghost`,
  `.pool-card`, `.row-head`, iki ızgara başlığı) `--lh-tight`.

**Ara durum bilinçli:** `--fs-*` merdiveni tanımlı ama CSS'te hâlâ **44 ham px
`font-size`** var. 45 bildirimin merdivene eşlenmesi A1'in işi; Y0'ın kapsamı
yüzey ve çizgiydi. Yani şu an gövde 16px, geri kalanı eski px değerlerinde.

### Ölçülen

```
tsc --noEmit   temiz
vitest         402/402
playwright     228/228  (47.5 sn, 1920x1080)
npm run ekran  iki temada 11'er sahne -> test-results/ekran/
npm run gorsel ÇALIŞTIRILMADI (tur sonunda, tek seferde)
```

Y0 ilk koşuda **iki test kırdı**, ikisi de aynı kök: yeni `--muted` `--closed`
üstünde AA'yı 4.08'e düşürüyordu. Sınır gevşetilmedi, renk düzeltildi — ayrıntı
"Plandan bilerek sapılan yerler" madde 5'te.

### Sıradaki turu bloke eden iki karar

1. ~~**Baskı `--ui-scale`'den etkilenecek mi?**~~ → **HAYIR, karar verildi
   (on üçüncü oturum).** Kâğıt sabit fiziksel boyut; ekran rahatlık ayarının
   A4'e neyin sığdığını belirlemesi, tuzak 31'in 205 mm hesabını ve "3 sınıf =
   3 sayfa" testini bir kaydırıcıya bağlamak olurdu — babanın yazıcıda bulacağı
   bir hata. Kâğıt kendi merdivenini aldı (`--fs-p-*`, **pt** cinsinden) ve
   `@media print` `--ui-scale`'i 1'e sabitliyor.
   **Ölçüldü, iddia edilmedi:** `e2e/gorunum.spec.ts` %100 ve %125'te basılan
   beş punto değerini `getComputedStyle` ile okuyup **birebir eşit** olduğunu ve
   PDF'in iki durumda da 3 sayfa çıktığını doğruluyor.

   Yan sonuç, bedava gelen: önizleme ile kâğıt artık **aynı** merdivenden
   okuyor. `@media print` içindeki beş `font-size` ezmesi (`.p-title-main` 19px,
   `.p-title-sub` 12px, `.p-top` 13px, `.p-bottom` 11px, `.p-daycol` 13px)
   silindi — `.print-page` yorumunun yıllardır iddia ettiği "önizleme kâğıda
   benzer" ilk kez doğru.

   Kullanıcının *"Yazdır kısmındaki program da büyümesi lazım"* isteği bu kararla
   **karşılanmadı**; o ayrı bir özellik (kâğıt satır yüksekliği) ve ilke 5
   gereği bir dönem kullanılmadan yazılmıyor.

2. ~~**A2'nin clamp formülü eksik.**~~ → **ÖLÇÜLDÜ, ve formül yazılamaz
   (on dördüncü oturum).** Verilen hâli
   `clamp(18px, (100vw - var(--rail-w) - 2rem) / 72, 44px)`; ızgara ise
   `72 × hücre` değil, **`132px satır başı + 72 × hücre + 6 × 6px ayraç`**
   (ayraç 8 değil 6 px, ölçüldü: 132 + 72×34 + 6×6 = 2616). Düzeltilmiş formül
   1920'de `(1828 − 132 − 36) / 72 = 23.06px` verir.

   Asıl bulgu bu değil: **`--cell-w` 34px'in altına indirilemiyor.** 28, 23.06 ve
   18 px denendi, üçünde de hücre **33.69 px** çizildi ve tablo 2461 px'de
   durdu — hücrenin içeriği (`411A`, iki satır) kendi min-content genişliğini
   dayatıyor. Yani "Sığdır" modu bir sayı meselesi değil: **hücrenin ne
   göstereceğini değiştirmeden mümkün değil**, o da kullanıcının turdan
   çıkardığı A5'in (ızgara anlamsal zoom) ta kendisi.

   Clamp'in üst ucu da bu makinede hiç ateşlenmez: 72 sütunun 34 px'ten geniş
   sığması için ekranın ~2740 px olması gerekir, babanınki 1920.
   **Karar kullanıcıya soruldu**; A2'nin ikinci yarısı bu yüzden yazılmadı.

---

## On altıncı oturum (2026-08-25) — B turu: yeniden tasarım

Kullanıcı "hem modern hem ferah hem de kaliteli bir UI, UX'i düşünerek" dedi.
Plan → öz eleştiri → onay → kod akışı işletildi; kullanıcı dört kararı verdi:
**kapsam C** (düzen de değişsin), **IBM Plex Sans**, ölçek varsayılanı **%100
kalsın / tavan %150**, UX maddelerinden yalnız **renk seçici**.

### Yapılanlar

| Aşama | Ne |
|---|---|
| B1 | **Üç düzlem** token seti (`--bg` masa / `--chrome` kabuk / `--paper` kâğıt) + `--band`, `--r-lg`, `--elev-1/2`, `--dur`/`--ease`, `--ls-*`. Gömülü değişken font |
| B2 | Üst çubuk **üç bölge** (belge kimliği · not · geçmiş ve dosya kümeleri); `↶ ↷ ☀ ☾` **SVG'ye**; tema düğmesi **raya indi**; ray dolgulu hap |
| B3 | **Izgara enstrümanı**: 2100 hücrelik kafes kalktı, gün bandı, imleç haçı, hücreyi 1px boşlukla dolduran nesne kartlar, büyük harf + tracking gün başlıkları |
| B4 | **Havuz alttan sağa** (240px çekmece, kapanabilir). `ders-programi-havuz` |
| B5 | **Renk seçici**: sayı listesi → 36 swatch `<dialog>`'u. Ölçek tavanı %150 |
| B6 | `npm run kontrol` yeşil · 24 görsel referans yenilendi · belgeler |

### Ölçülen sayılar — iddia edilmedi

| Ne | Önce | Sonra |
|---|---|---|
| `dist/index.html` | 347 KB | **379 KB** (sınır 420) |
| Gömülü font (ham) | — | **23 332 B**, 225 glif, wght 400–600 |
| Program'da görünen öğretmen satırı | ~11 | **25 / 25** (her yoğunlukta, çekmece açık ya da kapalı) |
| ΔE(chrome, paper) | — | 5.5 açık · 3.5 koyu |
| ΔE(band, paper) | — | **2.7** (durum renkleri birbirinden 14 uzak) |
| İmleç haçının maliyeti | — | **0,148 ms / sütun değişimi** (kare bütçesi 16,7 ms) |
| Sığdır + çekmece AÇIK, dolu ızgara | — | 174 px kaydırma → çekmece **kapatılıyor** |
| Sığdır + çekmece kapalı | 0 px | **0 px** (pay 8 → 12 px, Plex 0,4 px/sütun yedi) |

### Bu oturumda bulunan gerçek hatalar — dördü de ölçümle çıktı

1. **`font-display: swap` düzeni her açılışta kaydırıyordu.** `1ch` yedek fontta
   6,86px, Plex'te 9,00px; `ch`'den boylanan her sütun bir kez zıplıyordu.
   → `block` + E2E'de `document.fonts.ready`. **Tuzak 38.**
2. **`ch` puntoyla orantılı değil** (7,00px @12px, 9,00px @15px). "Sütunlar
   ölçekle tam 1,25 büyür" testi aslında **fontun** bir özelliğini iddia
   ediyormuş; **ch sayısı** sayan daha güçlü bir değişmezle değiştirildi.
   **Tuzak 39.**
3. **Gün bandı, kapalı saatlerin taramasını sildi.** `td.band` (0,2,3),
   `td.unavailable`'ı (0,1,1) yendi; tek indeksli günlerdeki kapalı saatler
   sessizce boşaldı. Yalnız "kapalı saat haçın altında kaybolmuyor" testi
   yakaladı. **Tuzak 40.**
4. **Çekmecenin Sığdır'a maliyeti önce BOŞ ızgarada ölçüldü ve "sığıyor" çıktı.**
   426 kart konunca aynı yapılandırma 174px taştı. **Tuzak 41.**

### Bilerek geri alınan iki kural

- "Üçüncü radius YOK" → **üç** (`--r-sm` veri · `--r-md` denetim · `--r-lg` düzlem)
- "Bir öğe yüzüyorsa yanlıştır" → **iki kot** (`--elev-1` kâğıt · `--elev-2`
  gerçekten yüzen üç şey). Düğme ve girdi gölge almaz.

### Bilerek yapılmayanlar

- **`confirm`/`alert` → `<dialog>` geçmedi** (A4'ün ikinci yarısı): kullanıcı
  bu turda yalnız renk seçiciyi istedi. 12 `confirm` + 5 `alert` duruyor.
- **Havuzda gruplama/süzme ve listelerde sıralama yapılmadı** — aynı karar.
- **Ölçek varsayılanı %100 kaldı.** Yani "babam zor görüyor" sorunu bu turda
  yarım kaldı: tavan %150'ye çıktı ama ayarı **bulup** büyütmesi gerekiyor.
  Gerçek veriyle denerken sorulacak.

### Doğrulanmayı bekleyen

- Bütün ölçümler **bu makinedeki Chromium'da**. Babanın makinesinde görülmedi.
- İmleç haçının 0,148 ms'i bu CPU'da; yavaş makinede birkaç katı olsa bile
  kare bütçesinin altında kalır ama **ölçülmedi**.
- Gün bandının ve kalkan kafesin gerçekten okunaklı olup olmadığı **göze**
  sorulmadı — ΔE sayıyı garanti eder, gözü değil.

---

## On beşinci oturum (2026-08-25) — tasarım araçları ve bir yön kararı

Bu oturumda **kod yazılmadı.** Kullanıcı bir araç listesi verdi ("olması gereken
her şey": tasarım skill'leri, `tokens.css`, `DESIGN.md`, MCP sunucuları, görsel
regresyon, iki aşamalı prompt) ve "bunları kur" dedi. Listenin bir kısmı
kuruldu, bir kısmı projenin kendi kurallarıyla çatıştığı için önce **çatışma
bildirildi**.

### Kurulan

| Ne | Nerede | Doğrulama |
|---|---|---|
| `typescript-language-server` | global (npm -g) | `6.0.0`, `$PATH`'te |
| `.mcp.json` | proje kökü | `@playwright/mcp` 0.0.79 · `chrome-devtools-mcp` 1.8.0 · `@upstash/context7-mcp` 4.0.3 — üçü de `npm view` ile doğrulandı |
| `.claude/settings.json` | proje | `enabledPlugins`: `frontend-design`, `typescript-lsp`. **Kapsam bilerek `project`** (kullanıcı kararı): depo private, ve başka bir makinede klonlanınca kurulum kendiliğinden geliyor |
| `docs/DESIGN.md` | yeni dosya | 135 satır primitif envanteri, `styles.css`'ten çıkarıldı |
| `CLAUDE.md` | üç yeni blok | envanter+araçlar · görsel iş akışı · tasarım dili kararı |

### `chrome-devtools` sertleştirildi — iki varsayılan kapatıldı

`--help` okununca çıktı: `--usageStatistics` **varsayılan `true`** (Google
kullanım verisi topluyor) ve `--performanceCrux` **varsayılan `true`**
(performans izlerindeki URL'leri CrUX API'ye gönderiyor). Bu projenin
"internet gerekmez" duruşuyla bağdaşmıyor; ikisi de `false`, ayrıca
`CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS=1`.

Ayrıca bu makinede Chrome **yok** (yalnız Brave). Sunucu Playwright'ın
kendi Chromium'una bağlandı
(`~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`) — E2E süiti
zaten o binary'de ölçüyor, yani profil sayıları test sayılarıyla
karşılaştırılabilir kalıyor.

**Ağa çıkan tek sunucu `context7`**: sorguyu Upstash'e gönderiyor. Diğer ikisi
yerel. Hiçbiri `dist/index.html`'e girmiyor.

### Eklentiler gerçekten kuruldu — 7 tane, `project` kapsamında

`claude` CLI `$PATH`'te yok, **ama VSCode eklentisinin içinde gömülü bir ikili
var**: `~/.vscode/extensions/anthropic.claude-code-2.1.245-linux-x64/resources/native-binary/claude`
(2.1.245). `claude plugin …` alt komutları etkileşimsiz çalışıyor, yani
kurulum bildirimsel kalmadı.

Kullanıcı `anthropics/skills` marketplace'inin **tamamını** istedi:

| Marketplace | Plugin | Skill sayısı |
|---|---|---|
| `anthropic-agent-skills` | `document-skills` | 4 (`xlsx` `docx` `pptx` `pdf`) |
| | `example-skills` | 12 |
| | `claude-api` · `academy-guide` · `discernment-nudge` | 1 + 1 + 1 |
| `claude-plugins-official` | `frontend-design` · `typescript-lsp` | — |

Yedisi de `Status: ✔ enabled`, `Scope: project`. Eklenti dosyaları
`~/.claude/plugins/` altında, **81 MB**. Marketplace kayıtları
`claude plugin marketplace add` tarafından **`~/.claude/settings.json`'a**
yazıldı (cihaz geneli), plugin kayıtları projedeki `.claude/settings.json`'a.

İlk denemede `frontend-design` ve `typescript-lsp` **başarısız oldu**:
`claude-plugins-official`'ın yerel kopyası yoktu. Marketplace elle eklenince
ikisi de geçti.

### Budama — 7 → 3, hepsi ölçülerek

`claude plugin details` her eklentinin **oturum başına sabit maliyetini**
veriyor; karar tahminle değil o sayılarla alındı.

| Eklenti | Always-on | Karar |
|---|---|---|
| `example-skills` (12 skill) | ~1.221 tok | **kaldı** |
| `document-skills` (4 skill) | ~1.028 tok | **kaldı** |
| `typescript-lsp` | ~0 tok | **kaldı** (süreç dışı, model bağlamı yok) |
| ~~`claude-api`~~ | ~471 tok | kaldırıldı |
| ~~`academy-guide`~~ | ~321 tok | kaldırıldı |
| ~~`discernment-nudge`~~ | ~317 tok | kaldırıldı |
| ~~`frontend-design@claude-plugins-official`~~ | ~78 tok | kaldırıldı |

- **`frontend-design`** iki marketplace'te de vardı, `SKILL.md`'ler **birebir
  aynı** (8260 bayt, `cmp` sessiz). `example-skills` bundle'ından tek skill
  çıkarılamadığı için resmi olan gitti — skill'in kendisi duruyor.
- **`claude-api`** zaten oturumda mevcuttu, bu depoda LLM/API kodu yok.
- **`discernment-nudge`** skill dosyası okunarak elendi, tahminle değil. Kendi
  "when not to" listesi bu projeyi üç yerden dışlıyor: *"code the user will
  execute — running it is the verification"* (burada doğrulama `npm run
  kontrol`), *"the user asked you to verify"* (CLAUDE.md'nin daimî kuralı
  "çıktıyı göster, iddia etme"), ve **konuşma başına en fazla bir kez**
  çalışıyor. Üstelik zorunlu kıldığı kapanış satırı İngilizce ve sabit
  (*"A few things worth a second look:"*) — ilke 4 tek dil Türkçe.

Kalan toplam: **~2.249 tok** oturum başına. Kullanıcının alıntıladığı
"5 MCP sunucusu ~55k" uyarısına göre küçük; asıl yük MCP'lerde.

**Hesapta hiçbir şey yok — ölçüldü:** `~/.claude.json` (hesabın bağlı olduğu
dosya) içinde `plugin`/`marketplace`/`skill` geçen **tek bir anahtar yok**;
yalnız `oauthAccount` (giriş bilgisi) var. Eklentiler cihazda
(`~/.claude/plugins/`), kayıtları iki settings dosyasında.

**MCP sunucuları hâlâ etkin değil:** yeniden başlatmada `.mcp.json` onaylanacak.

### Kurulmayanlar ve gerekçeleri

- **`tokens.css` (tek `--brand-hue`'dan OKLCH türetmesi)** — proje zaten altı
  basamaklı token merdivenlerine sahip ve CSS **tek dosya**. Asıl sorun palet:
  36 rengin ΔE ayrımı aranarak bulundu, tek bir hue'dan türetilen 36 renk o
  ölçüyü geçemez. Karar `docs/DESIGN.md`'de yazılı — palet değişebilir, **test
  sözleşmedir**.
- **Storybook MCP** — Storybook yok; kurmak yeni bir devDependency ağacı demek.
- **Chromatic / Percy** — hesap + yükleme + ağ. `npm run gorsel` zaten aynı işi
  **yerelde** 24 referansla yapıyor.
- **Lighthouse / CWV denetimi** — `file://` üzerinden açılan, ağ isteği olmayan
  tek dosya için ölçtüğü şeylerin çoğu tanımsız.
- **`references/` klasörü** — zaten var: `docs/Örnek Fotolar`, aSc Timetables
  2027'nin 18 ekran görüntüsü. Yenisi açılmadı, `CLAUDE.md` oraya bağlandı.

### Düzeltilen bir yanlış varsayım

Kullanıcının listesinde **"Playwright MCP ✅ (sende var)"** yazıyordu. Yoktu:
`~/.claude.json`'da tanımlı **hiçbir** MCP sunucusu yoktu, ve projedeki
Playwright bir **devDependency** (E2E süiti) — MCP sunucusu değil. İkisi aynı
adı taşıyor ama biri testleri koşuyor, diğeri tarayıcıyı bana sürdürüyor.

### Yön kararı — tasarım dili yeniden açıldı

Kullanıcıya sorulan tek soru: `frontend-design` skill'i kurulsun mu? Skill'in
kendi tanıtımı ile `CLAUDE.md` dört maddede birbirinin tersini söylüyordu
(sistem fontu · animasyon · gölge-derinlik · palet). Üç seçenek sunuldu;
kullanıcı **"Kur ve tasarım dilini yeniden aç"** dedi.

Yani "Karakter" paragrafı (kâğıt yüzeyi, kılcal kenarlık, sıfır gölge) artık
bağlayıcı değil. Paragraf **silinmedi**, bağlayıcı olmadığı işaretlendi —
A0–A5'in tamamı o karakteri hedefleyerek yazıldı, geri alınacak şeyin ne
olduğu okunabilir kalmalı.

**Açılmayanlar, ve neden hiçbiri zevk meselesi değil:** ilke 1–3 (tek dosya,
CDN'den sıfır bayt, font gömülür — `singlefile` ve `site.spec.ts` mekanik
doğruluyor) · yeni runtime bağımlılığı (Tailwind/shadcn *bağımlılık*
gerekçesiyle reddedilmişti; animasyonda süre açık, **kütüphane kapalı**) ·
ölçülen testler (`palette.test.ts`, `sutun.spec.ts`, tuzak 31'in 205 mm'si —
sayılar değişebilir, **testi silmek tasarım kararı değildir**) · işlevsel renk
kanalı (yeşil/sarı/kırmızı — karanlık mod yasağı tam da bu kanal çamurlaştığı
için kalkmıştı) · kâğıt (A4 fiziksel).

### Bu oturumun kendi dürüstlük şartı

**Hiçbir şey tarayıcıda doğrulanmadı, çünkü kod değişmedi.** `src/` altında tek
satır dokunulmadı; değişenler `CLAUDE.md`, `docs/DESIGN.md`, `docs/TASKS.md`,
`docs/STATUS.md` ve iki config dosyası. Test süiti çalıştırılmadı — çalıştırmak
bu değişiklikler hakkında hiçbir şey söylemezdi.

**B turu (yeniden tasarım) HENÜZ PLANLANMADI.** Tasarım dilinin açılması,
yeniden tasarımın yapıldığı anlamına gelmiyor. Kapsam kullanıcıda; tur
başlamadan önce iki aşamalı akış (plan → öz eleştiri → onay → kod) zorunlu.

---

## On dördüncü oturum (2026-08-25) — A2: `ch` birimi, sütun merdiveni, ve "Sığdır"ın ölçülmesi

İki iş: A2'nin yazılabilen yarısını yazmak, ve yazılamayan yarısını **tahminle
değil ölçümle** kapatmak.

### JSX'te kalan 29 `style={{ width }}` → 0

Hepsi bir `<th>` üstündeydi ve altı ayrı büyüklüğe düşüyordu, o yüzden altı
basamaklı bir **sütun merdiveni** çıkarıldı — tipografi merdiveninin aynısı,
`ch` cinsinden:

```
--w-col-xs   8ch   ~55px   onay kutusu, tek kelimelik etiket   (44, 58, 60)
--w-col-sm  10ch   ~69px   sayı sütunu (th.num)                (70, 78)
--w-col-md  13ch   ~89px   sayı kutusu, tek düğme              (80, 90)
--w-col-lg  16ch  ~110px   kısa metin kutusu, dar liste        (100, 110, 120, 130)
--w-col-xl  26ch  ~179px   uzun seçenekli liste, iki düğme     (160, 172, 190)
--w-col-2xl 32ch  ~220px   uzun metin                          (220)
```

**Aynı piksele iki farklı `ch` sayısı düşüyor ve bu bir yazım hatası değil.**
`table.list th` `--fs-xs` (12px), `td` ve içindeki kutular gövde (16px): 1ch
sırasıyla 6.86 ve 9.15 px. Bu yüzden `.num` bir `<input>` üstünde **8ch**
(73px), bir `<th>` üstünde **10ch** (69px) — ikisi de eski 70px'in yerinde.
Tuzak 34'ün kural hâli: kutu kendi üstünden boylanır, sütun ondan boylanır.

`ch`'ye geçmenin asıl kazancı ölçekle ilgili: `--ui-scale` başlığı ve hücreyi
aynı katsayıyla büyütür, yani %100'de sığan %125'te de sığar. Ham piksel bunu
yapmaz — tuzak 33 tam olarak buydu.

### `e2e/sutun.spec.ts` — 11 test, ve bedava yeşil değil

Üç ayrı iddia, çünkü tek başına her biri kandırılabilir:

1. **Kaynakta `style={{ width }}` kalmadı** — `src/components` altındaki her
   `.tsx` okunuyor. Sahnesi olmayan bir tablo için doğru kalan tek kontrol bu.
2. **Altı basamak da `ch`** — `--fs-xs` bağlamında bir prob çizilip %100 ve
   %125'te ölçülüyor, oran **tam 1.25** olmalı, ve altı basamak altı **farklı**
   genişlik vermeli. Ham piksel burada düşer.
3. **Hiçbir şey kırpılmıyor** — dokuz ekranda: her kutu içindeki metni alıyor
   (`<select>` için klonlanıp `width:auto` ile ölçülen doğal genişlik, `<input>`
   için **içindeki yazının** genişliği; `width:auto` bir input'ta UA'nın
   `size=20` varsayılanını verir, ihtiyacı değil), ve her başlık %125'te
   **%100'dekiyle aynı satır sayısında** kalıyor.

**Çizilen sütunun kendisi ölçülmüyor, merdivenin basamağı ölçülüyor**, çünkü
`table.list` `width: 100%` + auto layout: bir sütunun kullanılan genişliği
panelden aldığı paydır, tanımlanan değer değil. Öğretmenler tablosunda oran
1.25 değil **1.215** çıktı ve ortada bir hata yoktu.

Testin dişi olduğu **gösterildi**: altı basamak ve iki kutu genişliği eski px
değerlerine geri konup koşuldu, 6 test kırmızıya döndü. İçlerinden biri tam
tuzak 33'ün cümlesi: *"Kurulum → Öğretmenler · %125 · input.text-sm#0 içine
68.0px sığıyor, gereken 80.6px"*.

### "Sığdır / Rahat" — yazılmadı, çünkü ölçüm yazılamayacağını söylüyor

Ayrıntı yukarıda, *Sıradaki turu bloke eden iki karar* madde 2'de. Özet:
`--cell-w`'yi 28, 23.06 ve 18 px yapmak hücreyi **33.69 px'in altına
indirmiyor** — içerik kendi min-content'ini dayatıyor. Sığdırmak için hücrenin
ne gösterdiğinin değişmesi gerekir, o da silinen A5. Karar kullanıcıda.

### Ölçülen

```
tsc --noEmit   temiz
vitest         409/409                       [407 + 2 yeni]
playwright     251/251  (42 sn, 1920x1080)   [237 + 11 sütun + 3 yoğunluk]
site           6/6
npm run ekran  iki temada 12'şer sahne -> test-results/ekran/
npm run gorsel ÇALIŞTIRILMADI (A6'da, tek seferde)
```

| | Önce | Sonra |
|---|---|---|
| JSX'te inline genişlik | 29 | **0** |
| CSS'te ham px sütun/kutu genişliği | 2 (`.num`, `.text-sm`) | **0** |
| ızgara genişliği @%100 (Rahat) | 2616 px | **2616 px** (dokunulmadı) |
| ızgarada yatay kaydırma (Sığdır) | — | **0 px** (Rahat'ta 788) |
| birim testi | 407 | **409** |
| E2E | 237 | **251** |
| `dist/index.html` | 344.5 KB | 347.0 KB |

### A5 geri geldi — ve teşhis ölçülünce değişti

Kullanıcı "Sığdır"ı düşürmek yerine **önce A5'i geri getirmeyi** seçti. İyi ki:
yukarıdaki "hücrenin içeriği dayatıyor" teşhisi **eksikti**, ve hangi içeriğin
dayattığı tek tek kapatılarak ölçülünce ortaya beklenmedik bir cevap çıktı.

```
gizlenen                       hücre      tablo     kutu
—                              33.69 px   2461 px   1828 px
kartın alt satırı              33.69 px   2461 px   1828 px   ← hiçbir şey
başlıktaki "10:40"             23.59 px   1728 px   1828 px   ← SIĞDI
ikisi birden                   23.59 px   1728 px   1828 px
```

Yani sütunu geniş tutan şey karttaki ders bilgisi değil, **başlıktaki zil
saati**ydi. İlk teşhis yanlıştı ve öyle kalsaydı A5 "kartı kırp" diye
yazılacaktı — bilgi kaybı, üstelik gereksiz.

**Sığdır bu yüzden tam olarak bir şey düşürüyor:** ders numarasının altındaki
başlangıç saati. Numara kalıyor (göz onunla geziniyor), sınıf adı, derslik
harfi ve renkler kalıyor. Saatler zaten Ayarlar → Okul'daki zil önizlemesinde
ve basılan her sayfada yazıyor.

`--cell-w` artık kutudan türetiliyor:

```css
clamp(1.125rem,
      (100cqw - var(--rowhead-w) - var(--break-cols) * .375rem - var(--space-3))
        / var(--lesson-cols),
      2.75rem)
```

İki incelik: **`100cqw`**, çünkü `100vw` kenar çubuğunu, dolguyu ve dikey
kaydırma çubuğunu tahmin etmek zorunda kalırdı — `.grid-wrap` bir container
yapıldı. Ve **sütun sayısı markup'tan geliyor** (`--lesson-cols`,
`--break-cols`): hafta her zaman 6×12 değil, 7 günlük hafta 84 sütun, ve stil
dosyasına yazılmış bir `72` Pazartesi eklendiği gün yalan olurdu. Bunlar bir
**sayı**, bir ölçü değil — `sutun.spec.ts`'in yasağı JSX'e yazılmış bir
ÖLÇÜ hakkında.

`--space-3` payı da ölçüldü, gerekçelendirilmedi: 78 sütun kenarlığının
alt-piksel yuvarlaması, 2 px payla **1 px** kaydırma bırakıyordu; 6 px'te 0.

Ölçülen sonuç, 1920×1080, dolu ızgara (359 blok):

| | Rahat | Sığdır |
|---|---|---|
| hücre | 34.00 px | 23.59 px |
| tablo | 2616 px | 1823 px |
| yatay kaydırma | **788 px** | **0 px** |
| kırpılan kart | 0 | 0 |

`e2e/gorunum.spec.ts` üç test daha aldı ve **dişli olduğu gösterildi**: saati
gizleyen kural `display: block` yapılıp koşuldu, ikisi kırmızıya döndü. Test
ızgarayı önce **otomatik dizerek dolduruyor** — boş bir ızgarada hem "sığdı"
hem "hiçbir kart kırpılmadı" bedava geçerdi (tuzak 33'ün aynısı).

`ders-programi-yogunluk` anahtarı "Veriler nerede" tablosuna eklendi; eklenmese
`planlar.spec.ts`'in "tablodaki anahtarlar sayfanın GERÇEK anahtarlarıyla aynı"
testi zaten kırmızıya dönecekti — panelin kendi iddiasını koruyan test ikinci
kez işe yaradı.

### Bilerek yapılmayan

- **Görsel referanslar yenilenmedi** — A6'nın işi, tur boyunca kasten erteleniyor.
  A5 `12-ayarlar-gorunum` sahnesini büyüttü, A6'da ona tek tek bakılacak.
- **Sığdır %125'te tam sığmıyor** (2144 px / 1805 px kutu) ve sığmamalı: yazı
  %25 büyüdüğünde içeriğin kendi tabanı da büyüyor. Yine de Rahat'ın 3270
  px'ine göre çok daha fazlası ekranda. Ayrı bir özellik değil, ölçümün
  söylediği şey.
- **Yoğunluk düğmesi Program sekmesinde değil.** Görünüm'de, ölçeğin yanında:
  ikisi de makineyi tarif ediyor ve üst çubuk "hiçbir tıklamanın bir öğleden
  sonrayı götüremeyeceği yer" olarak kalıyor. Bir dönem kullanılıp "sürekli
  gidip geliyorum" denirse Program'a taşınır (ilke 5).

---

## On üçüncü oturum (2026-08-25) — A1: tipografi merdiveni, ölçek ayarı, iki gerileme kapandı

Üç iş: kullanıcının açık bıraktığı iki soruyu **kararla** kapatmak, Y0'ın açtığı
renk seçici gerilemesini kapatmak, ve A1'i yapmak.

### Düğme kenarlığı — soru (a) cevaplandı, ama teşhis düzeltilerek

Soru *"`.btn` `--hairline`'a insin mi"* idi. **İnemez**, ve sebebi ölçülebilir:
`.btn`'in zemini `--paper`, üstünde durduğu `.topbar` ve `.panel` de `--paper`.
Yani **kenarlık düğmenin tek sınırı**. Girdiler Y0'da kıl çizgiye inebildi
çünkü karşılığında `--paper-sunk` yüzeyini kazandılar; düğmenin öyle bir yüzeyi
yok, `--hairline` onu görünmez yapardı.

Asıl gürültü zaten `--line-dark` değildi: `.btn.danger` `border-color`'ı
`--bad` ile **eziyordu**, yani "Sil"leri kırmızı yapan şey `.btn` değildi ve
`.btn`'e dokunmak o sütunu hiç değiştirmezdi. İki ayrı düzeltme yapıldı:

- `.btn` → `--line` (bir basamak aşağı, görünür kalıyor)
- `.btn.danger` → `border-color` kalktı, `color: var(--bad)` kaldı. Kural
  ("tehlikeli beklemeden kırmızı görünür") **mürekkeple** karşılanıyor; 25
  öğretmenlik bir listede 25 kırmızı dikdörtgen, tehlike renginin sayfanın
  arka planı hâline gelmesi demekti. Hover hâlâ kırmızı kenarlık + `--bad-bg`.

`--line`'ın sözlük tanımı da güncellendi: artık "ızgara + tablo başlığı" değil,
"veri okunan yerler **ve denetim kenarı**".

### A1 — 44 ham px `font-size` → 0

Kalan tek `px`, merdivenin çapası: `:root { font-size: calc(16px * var(--ui-scale)) }`.

Eşleme 46 bildirimin tamamını kapsadı. **10'u 12px tabanının altındaydı** ve
dağınık değillerdi — 4'ü ızgarada, 6'sı baskıda. Karar ikiye ayrıldı:

**Izgara tabanı korundu, hiçbir şey büyümedi.** `.hour-clock` 9→12, `.card-bottom`
10→12, `.pool-card .counter` 10→12, `.row-head .secondary` 11→12. Ölçülen sonuç:
ızgara genişliği %100'de **2616 px** — Y0 öncesiyle **birebir aynı** sayı, yani
rem'e geçiş piksel kaymasi üretmedi. 34px hücre iki satır 12px'i `--lh-tight`
ile zaten alıyor (12×1.2 × 2 = 28.8).

**Baskı kendi merdivenini aldı** (`--fs-p-*`, pt) — gerekçesi yukarıdaki karar 1.

Merdivenin **hiç kullanıcısı olmayan** basamağı vardı: `--fs-xl` (22px). İlke 5
gereği kullanılmayan basamak tahmindir; `.empty-screen strong`'a verildi
(17→22px), yani aracın tek "yüksek sesle konuştuğu" yere. `.panel h2` da
16→18px: gövdeyle aynı boyda bir başlık başlık değildi.

Radius 7 değerden 2'ye indi ve **CLAUDE.md'nin yazdığı değerlere** (3/6px)
oturtuldu — Y0 sehven 4/8 yazmıştı, hiç kullanılmadığı için fark edilmemişti.
Kalan iki ham değer bilerek: `.step-no` `50%` (bir şekil, basamak değil) ve
`.panel.inset` `0` (bilerek kaldırılmış).

`--space-*`, `--cell-*`, `--rail-w` ve satır başı genişliği rem'e geçti. Bir
tuzak buradan çıktı: hayalet kartın `margin: -17px` değeri **34/2'nin elle
yazılmış hâliydi**; rem'e geçince ölçek kayınca hayalet parmağın altından
kayacaktı. `calc(var(--cell-w) / -2)` oldu.

### Ayarlar → Görünüm (yeni, altıncı bölüm)

`--ui-scale` artık bir ayara bağlı: %100–%125, altı basamak,
`localStorage['ders-programi-olcek']`. **Kaydırıcı değil altı düğme**: ölçeğin
altı yasal değeri var, kaydırıcı olmayan bir süreklilik uydurur ve hangisine
oturduğunu gizler. `.btn[aria-pressed]` zaten var, yeni CSS yazılmadı.

`State`'e **girmiyor** (tema ve kenar çubuğu ile aynı gerekçe): koyu makinede
alınmış bir yedek babanın ekranını büyütmemeli, kozmetik ayar şema göçü
istememeli.

Izgara `--ui-scale`'e **bağlandı**. Gerekçe: A5 (ayrı `--grid-zoom` ekseni)
kullanıcı tarafından silindi, yani ikinci eksen yok — tek eksen kaldıysa babanın
bütün gün baktığı ekran onun dışında kalamaz. Ölçülen: 2616 px → **3270 px**
(tam ×1.25).

### Mevcut bir test yeni anahtarı yakaladı

`ders-programi-olcek` eklenince `e2e/planlar.spec.ts` → *"tablodaki anahtarlar
sayfanın GERÇEK anahtarlarıyla aynı"* kırmızıya döndü: "Veriler nerede" tablosu
onu saymıyordu. Panel yalan söylemiş olurdu. `storageReport` güncellendi.
Bu, panelin kendi iddiasını koruyan testin işe yaradığının kanıtı.

### Ölçülen

| | önce | sonra |
|---|---|---|
| ham px `font-size` | 44 | **0** |
| ham `border-radius` | 19 | 2 (`50%` ve `0`, ikisi de bilerek) |
| ızgara genişliği @%100 | 2616 px | **2616 px** (kayma yok) |
| ızgara genişliği @%125 | — | 3270 px (tam ×1.25) |
| basılan punto @%100 ve @%125 | — | **birebir eşit**, PDF 3 sayfa ↔ 3 sayfa |
| birim testi | 402 | **407** |
| E2E | 228 | **237** |
| `dist/index.html` | 340.9 KB | 344.5 KB |
| JSX'te kalan `style={{ width }}` | 31 | **29** (A2'nin işi) |

### Bilerek yapılmayan

- **Görsel referanslar yenilenmedi.** A6'nın işi ve tur boyunca kasten
  ertelendi; 22 referans artık 24 olacak (`12-ayarlar-gorunum` sahnesi eklendi).
- **Kâğıt satır yüksekliği ölçeklenmedi** — ayrı bir özellik, ilke 5.
- **A2'nin clamp formülü** hâlâ eksik, aşağıdaki karar 2 duruyor.

---

## On birinci oturum (2026-08-25) — baskı turu + site derlemesi/PWA

İki iş: kullanıcının gerçek yazdırma önizlemesinde gördükleri (madde **4k**),
ve v1.0 turunun sıradaki maddesi olan site derlemesi + PWA (**4e**). Dal:
`v1.0-teslim`, madde başına bir commit, her commit `npm run kontrol` yeşilken.

### Baskı: dördü de kâğıtla ilgiliydi, hiçbiri veriyle değil

Şikâyetler: sol üstte tarih/saat, sol altta dosya yolu, başlık küçük ve sola
yapışık, tablo sayfanın üstüne yapışık (altta ~5 cm beyaz).

İlk ikisi **bizim çizdiğimiz şey değil.** Tarayıcı onları kenar boşluğu
kutusuna çizer; `display: none` diye bir çaresi yok. Tek yol kutuyu ortadan
kaldırmak: `@page { margin: 0 }`, ve kaybolan 10 mm `.print-page`'e padding
olarak geri konur. Sütun genişlikleri değişmedi (2 × 10 mm hâlâ 20 mm), yani
"sütunlar eşit" testi olduğu gibi geçti.

Diğer ikisi CSS: başlık iki satır oldu (büyük ortalı ana satır + küçük künye
satırı), satırlar 20 → 23 mm büyüdü ve sayfa **sabit yükseklikli bir flex
kutusu** hâline geldi. İki incelik burada:

- Yükseklik **205 mm**, 210 değil. Kesirli piksel + `break-after: page` her
  programın ardına boş bir sayfa koyardı; 5 mm pay kâğıtta görünmüyor. Bunu
  yakalayan tek şey yeni "3 sınıf = 3 sayfa" testi.
- `justify-content: **safe** center`. Düz `center` taşma durumunda içeriği iki
  uçtan taşırır ve sayfanın üstü kesilir. 7 günlük hafta ölçüldü: taşma 0 px.

**Kanıt gözle okundu, iddia edilmedi.** `displayHeaderFooter: true` ile — yani
tarayıcı üst/alt bilgiyi çizmeye *çalışırken* — PDF üretildi: değişiklikten
önce tarih ve `file:///home/.../dist/index.html` sayfada duruyordu, sonra
ikisi de yok. Playwright'ın `page.pdf`'i varsayılan olarak zaten üst/alt bilgi
basmaz, o yüzden bayrağı açmadan alınan bir PDF hiçbir şey kanıtlamazdı.

### Site: ikinci teslim yolu, ama aynı iddialarla

`npm run build:site` → `dist-site/`. Üç karar:

1. **Site de tek dosya** (`viteSingleFile` korundu). Service worker'ın önbelleğe
   alacağı kabuk böylece bir sabit; hash'li chunk'larla o liste her derlemeden
   sonra üretilmesi ve senkron tutulması gereken bir şey olurdu.
2. **Manifest/simge/kayıt betiği `index.html`'de durmaz.** Yalnız site
   config'inin `transformIndexHtml` eklentisi ekler (`order: 'post'`, yoksa
   singlefile onları gömülecek varlık sanır). Ana config'e `publicDir: false`
   kondu: `site/` klasörünün hiçbir dosyası `dist/`'in yanına düşemez.
3. **Simge elle çizildi** (`site/icon.svg`): haftalık ızgara motifi, uygulamanın
   kendi vurgu rengi + paletten üç renk. PNG'ler `scripts/simge.mjs` ile
   Chromium'da üretiliyor — yeni bağımlılık yok — ve depoya giriyor, böylece
   `build:site` tarayıcı gerektirmiyor.

### Testin kendisi test edildi (tuzak 23'ün alışkanlığı)

"Fiş çekilince site açılıyor" testi, service worker olmasa da geçebilirdi:
tarayıcının kendi disk önbelleği aynı işi yapıyor olabilirdi. Ölçüldü: SW kaydı
silinip `caches` boşaltıldıktan sonra aynı çevrimdışı yeniden yükleme
`net::ERR_INTERNET_DISCONNECTED` ile düşüyor. Yani test boş değil.

### Ölçülen

| | Önce | Sonra |
|---|---|---|
| Birim testi | 402 | 402 (değişmedi — mantık değişmedi) |
| E2E testi (`file://`) | 223 | **228** |
| Site testi (http) | — | **6** |
| Görsel referans | 22 | 22 (**yalnız 2'si değişti**) |
| `dist/index.html` | 339 402 B | **340 155 B** |
| `dist-site/` | — | **364 KB** (index 340 538 B + manifest + sw + simgeler) |
| `npm run kontrol` | ~51 sn | **~61 sn** (site süiti dahil) |

Görsel regresyonda yine yalnız beklenen iki sahne (`light/dark-8-yazdir`)
kırmızı verdi, kalan 20'si dokunulmadan geçti; referanslar
`--update-snapshots=all` ile yenilendi (tuzak 25) ve sonrasında `git diff` de
yalnız o iki dosyayı gösterdi.

### Bilerek yapılmayan — Dosya Sistemi Erişimi API'si (yine)

4d'den 4e'ye taşınmıştı, şimdi kendi maddesine (**4l**) taşındı. Gerekçe
değişti: artık *yazılabilir* (http kaynağı var), ama kullanıcı bu oturumun
kapsamını "baskı + site/PWA" olarak seçti. Kendi başına bir oturumluk iş:
IndexedDB'de tutamak, izin yeniden isteme yolu, ve gerçek diyaloğun
Playwright'la sürülemediği için API'nin sahtelenmesi.

---

## Onuncu oturum (2026-08-25) — veriler nerede + bütün planlar tek dosyada

v1.0 turunun **4d** maddesi. Dal: `v1.0-teslim`.

### Kapatılan iki boşluk

1. **"Dosyaya kaydet" hâlâ tek planı yazıyordu.** Kitaplık 4b'de geldiğinden beri
   üç planlı bir kurulumun tamamı hiçbir dosyaya sığmıyordu — yani "taşımak ve
   gerçekten güvende olmak" cümlesi verinin yalnız bir kısmı için doğruydu.
2. **Verinin nerede durduğunu söyleyen ekran yoktu.** Panel "bu bilgisayara
   aittir" diyordu; hangi anahtar, ne kadar yer, ne zaman gider yazmıyordu.

### `src/bundle.ts` — zarfı bilir, `State`'i bilmez

`library.ts`'in sözleşmesi birebir tekrarlandı: paketin **zarfını** okur, içindeki
her planın durumunu **ham `unknown`** olarak geri verir, `parseState`'i `store.ts`
çağırır. Bozuk girdi kurallarını kendisi yazmaz — `normalizeLibrary()`'ye devreder,
yani "kimliksiz girdi atılır, adsız girdi yeniden adlandırılır" tek evde durur.

```
{ "schemaVersion": 5, ... }   -> TEK plan   ders-programi-YYYY-AA-GG-SSDD.json
{ "bundleVersion": 1, ... }   -> HER plan   ders-programi-tumu-YYYY-AA-GG-SSDD.json
```

**Yeni depolama anahtarı açılmadı ve `schemaVersion` 5'te kaldı.** Paket bir
*dosya biçimi*, verinin ikinci bir evi değil; içindeki her plan hâlâ kendi
sürümüyle gelir ve aynı `parseState` göçünden geçer — yani bir pakete konmuş v1
yedek de açılır.

### Karar: üst çubuk paketi REDDEDİYOR

İki dosya türü aynı uzantıyı, aynı ön eki taşıyor ve gözle ayırt edilemiyor. Bir
planı açmak açık planı değiştirir; bir paketi açmak **bütün kitaplığın** yerine
geçer — ve geri alınamaz. Üst çubuk bu yüzden paket görünce açmıyor, cümleyi
kuruyor: *"Bu dosya bütün planları içeriyor. Ayarlar → Veri bölümündeki 'Tümünü
dosyadan aç' düğmesini kullanın."* Aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı.
Üç karşı önlem birlikte çalışıyor: adda `-tumu-`, `parseState` bir paketi
okuyamıyor, `parseBundle` bir planı okuyamıyor. → **CLAUDE.md tuzak 30**

### İçe aktarmanın SIRASI güvenlik gerekçesi

`replaceLibrary` altı adımı bu sırayla yapıyor ve sıranın her adımı bir kayıp
senaryosunu kapatıyor:

1. Bekleyen otomatik kayıt **iptal edilir** — ama `park()` çağrılmaz. Park giden
   planı *yazar*, oysa o anahtarın üstüne yazmak üzereyiz. Timer'ı canlı bırakmak
   ise tuzak 28'in aynadaki hâli: 400 ms sonra eski durum yeni kitaplığın
   anahtarına düşer.
2. Her plan **depoya dokunmadan önce** ayrıştırılır. Hiçbiri okunamazsa hiçbir şey
   değişmez — yarım bir içe aktarma iki gerçek demektir.
3. Veriler yazılır, **yazılamayan sayılır**. Bunun için `writePlanText` artık
   `boolean` dönüyor: `safely()` kota hatasını yutuyordu ve yutulmuş bir kota
   hatası sessiz kayıptır (ilke 6).
4. Gelen kitaplıkta olmayan eski planların anahtarları silinir.
5. Dizin **en sonda** yazılır, verisi yerine oturduktan sonra.
6. `switch` → geri-al yığını sıfırlanır.

### "Veriler nerede" — iddia değil, ölçüm

Panel gerçek anahtar adlarını ve gerçek boyutları listeliyor (`storageReport`),
altında toplam ve ~5 MB notu. Boyut **UTF-16 kod birimi** üzerinden: tarayıcının
kotaya yazdığı şey o, dosyanın UTF-8 uzunluğu değil. E2E bunu doğruluyor —
sayfanın gerçek `localStorage` anahtarlarını okuyup tabloda hepsinin adının
geçtiğini karşılaştırıyor. Panel yalan söylerse test kırmızı verir.

Ortam iki değer döndürüyor (`file` / `site`); **`exe` dalı bilerek yazılmadı**,
4g/4h gelmeden yazılsa ölü kod olurdu (ilke 5).

### Bilerek yapılmayan — Dosya Sistemi Erişimi API'si

4d'nin üçüncü parçası (`showSaveFilePicker` tutamağı IndexedDB'de, aynı dosyaya
otomatik yazma) **yazılmadı ve 4e'ye taşındı**. Gerekçe kanıt: ortada henüz site
yok, `file://` altında o API hiç bulunmuyor, ve native dosya diyaloğu
Playwright'la sürülemiyor — bugün yazılsaydı E2E'de tek satır kanıt üretemezdik,
yani "çalışıyor" demek iddia olurdu. 4e gerçek bir http kaynağı getiriyor.

Ayrıca **paket başına yedek zinciri konmadı** ve **paket içe aktarma geri
alınamıyor**: ikisi de bilerek. Zincir hâlâ oturum başına (5 MB kotası), ve içe
aktarma onaylı + sayan bir cümleyle korunuyor.

### Ölçülen

| | Önce | Sonra |
|---|---|---|
| Birim testi | 379 | **402** |
| E2E testi | 217 | **223** |
| Görsel referans | 22 | 22 (**yalnız 2'si değişti**) |
| `dist/index.html` | 332 811 B | **339 402 B** (+6,4 KB) |
| `npm run kontrol` | ~46 sn | **~51 sn** |

Görsel regresyonun cevabı tam olarak doğru çıktı: 22 referanstan **yalnız iki
Ayarlar → Veri sahnesi** kırmızı verdi, kalan 20'si dokunulmadan yeşil geçti —
yani değişiklik gerçekten tek ekranda kaldı. Referanslar `--update-snapshots=all`
ile yenilendi (tuzak 25) ve sonrasında da yalnız o iki dosyanın baytları değişti.

---

## Dokuzuncu oturum (2026-08-25) — plan kitaplığı ve taslaklar

v1.0 turunun 4b ve 4c maddeleri. Dal: `v1.0-teslim`, tek commit — taslak ayrı
bir varlık değil, aynı veri şeklindeki bir bayrak; ayırmak bir sonraki
commit'te sökülecek geçici bir şekil yazmak olurdu.

### Karar: ilk plan tarihsel anahtarında kalıyor

İki düzen tartışıldı. Seçilen:

```
ders-programi            -> "1" numaralı planın State'i   (BUGÜNKÜ anahtar)
ders-programi-plan-<id>  -> diğer planların State'i
ders-programi-planlar    -> { activeId, plans: [{ id, name, draft }] }
ders-programi-yedek-N    -> oturum yedek zinciri          (aynen)
```

Alternatif "her plan `ders-programi-plan-<id>`'de, `ders-programi` dondurulur"
idi ve tam bakışımlıydı — ama ilk açılışta bir **kopyalama** gerektiriyordu.
Kopyalama yarıda kalabilir, ve yarıda kalmış bir kopya iki gerçek demektir
(ilke 6). Seçilen düzende devralma **tek bayt yazmıyor**: dizin oluşturuluyor,
program yerinde kalıyor. Üç ek kazanç, hepsi ölçüldü:

1. Eski bir `dist/index.html` hâlâ programı buluyor.
2. `ders-programi` okuyan **202 E2E testi ve yedek zinciri değişmedi** —
   `e2e/helpers.ts`'e dokunulmadı.
3. `newId()` alfabesinde `1` yok, yani üretilen hiçbir kimlik o anahtarla
   çakışamıyor. Bu bir varsayım olarak bırakılmadı: `library.test.ts` 500
   kimlik üretip sabitliyor, alfabe değişirse test kırmızı veriyor.

### `src/library.ts` — yaprak modül

`State`'in ne olduğunu **bilmiyor**: ham string alıp veriyor, ayrıştırmayı
`store.ts` yapıyor. `types.ts`'ten yalnız `Id` tipini alıyor (`import type`).
Böylece `store.ts` ↔ `library.ts` çalışma zamanı döngüsü yok — `keys.ts`'in
`constraints` ↔ `rules` için yaptığının aynısı.

`parseLibrary` hiçbir zaman `null` dönmüyor ve hiçbir zaman atmıyor. Bir kural
özellikle konuldu: **adı bozuk bir girdi atılmıyor, yeniden adlandırılıyor.**
Ad süs, `id` verinin işaretçisi; adı yüzünden bir satırı atmak koca bir programı
öksüz bırakırdı. Yalnız kimliksiz girdi atılıyor, o zaten hiçbir yeri göstermiyor.

### Bulunan tuzak: gecikmeli kayıt plan geçişinde işi yutuyor

Otomatik kayıt 400 ms gecikmeli, ve efektin temizliği kutu her değiştiğinde
**bekleyen yazımı iptal ediyor**. Yani plan değiştirildiğinde: eski durumun
timer'ı iptal ediliyor, yeni efekt yeni durumu yeni anahtara yazıyor, ve
geçişten hemen önceki düzenleme **hiçbir yere yazılmadan** buharlaşıyor. Ekranda
hata yok, çubukta uyarı yok; bir sonraki açılışta iş eksik.

Çare `park()`: plan değiştiren üç işlem de (`switchPlan`, `createPlan`,
`deletePlan`) önce timer'ı iptal edip giden planı **eşzamanlı** yazıyor.
Gerçek tarayıcıda ayrı bir testle sabitlendi: okul adı değiştirilip 400 ms
dolmadan plan değiştiriliyor, sonra geri dönülüp adın yerinde olduğu
doğrulanıyor. → **CLAUDE.md tuzak 27**

Plan kimliği reducer kutusunun **içinde** duruyor (`Box.planId`), yanında ayrı
bir `useState`'te değil: ikisi bir renderlik bile ayrışsa otomatik kayıt bir
planın işini başka bir planın anahtarına yazardı.

### Ölçüm sırasında bulunan iki düzen kusuru

İkisi de yalnız ekran görüntüsüne bakınca göründü, testler yeşilken:

1. **Plan adı kutusu 40 px'e sıkışmıştı** — "1. plan" yerine "1" görünüyordu.
   Sebep: altı sütuna sabit genişlik verilince (toplam 630 px) esnek ad sütununa
   yer kalmıyordu. Üç sayı sütunu tek bir "İçerik" satırına indirildi
   (`25 öğretmen · 20 sınıf · 99 ders`) — hem okunur hem yer açıyor.
2. **`.form-row` hücre içinde sarıyordu**, "Bu plana geç" ve "Sil" alt alta
   düşüyordu. `.form-row.nowrap` eklendi.

### Ölçülen

| | Önce | Sonra |
|---|---|---|
| Birim testi | 347 | **379** |
| E2E testi | 202 | **217** |
| Görsel referans | 20 | **22** (Ayarlar → Veri sahnesi eklendi) |
| `dist/index.html` | 323 KB | **333 KB** |
| `npm run kontrol` | ~41 sn | **~46 sn** |

Görsel referansların 18'i kırmızı verdi — beklenen, üst çubuk değişti. Yalnız
iki **baskı** sahnesi yeşil kaldı, ki bu tam olarak doğru: üst çubuk basılmıyor.
Referanslar `--update-snapshots=all` ile yenilendi (tuzak 25).

### Bilerek yapılmayan

- **Plan başına yedek zinciri konmadı.** Dört kopya × plan sayısı 5 MB kotasını
  doldurur. Zincir oturum başına kalıyor ve açılışta hangi plan açıksa ona ait;
  Ayarlar → Veri paneli bunu açıkça yazıyor.
- **Plan geçişinde onay sorulmadı.** İki plan da kayıtlı, geçiş kayıpsız — onay
  sormak "bu tehlikeli" demek olurdu ve değil. Geri-al yığınının sıfırlandığı
  seçicinin `title`'ında ve panelde yazıyor.
- **Üst çubuğa "yeni plan" konmadı.** Plan yaratan, adlandıran ve silen her şey
  Ayarlar → Veri'de; üst çubuk hiçbir tıklamanın bir öğleden sonrayı
  götüremeyeceği yer olarak kalıyor (aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı).

---

## Sekizinci oturum (2026-08-25) — çözücünün çöküşü kapandı

Yedinci oturumun bıraktığı iş commit edildi (7a·7b·7c), sonra kullanıcının
TASKS sonuna yazdığı altı satır v1.0 turuna dönüştü ve turun ilk maddesi
yapıldı. Dal: `v1.0-teslim`.

### Teşhis: iki ayrı şey vardı, biri belgelerde yanlış yazılıydı

`gercek-olcek-kurali` dünyasında **99 dersin 32'si 2 saatlik blok**, ve 2
saatlik bir blok "aynı ders günde en fazla 1 saat" kuralını **hiçbir hücrede**
sağlayamaz (`constraints.ts` `lessonDayCount + block` sayıyor). Yani o dersler
gerçekten imkânsız — STATUS'te *"veri imkânsız değil, arama tıkanıyor"*
yazıyordu, yarısı yanlıştı.

Asıl kusur yine de çözücüdeydi ve iz sürülerek bulundu. Aramaya bir kanca
takılıp ilk 120 olay basıldığında görülen şey şuydu:

```
pick derinlik=0 d44 size=48 kalan=8      <- 8 blok istiyor
pick derinlik=1 d44 size=36 kalan=7
pick derinlik=2 d44 size=24 kalan=6
pick derinlik=3 d44 size=12 kalan=5
revise-fail d44 size=0 need=4            <- 4 blok borçlu, yer yok
revise-fail d44 size=0 need=4            (aynısı, binlerce kez)
```

`d44` haftada 8 saat istiyor ama erişebildiği **4 gün** var ve kural günde 1
saat diyor: tavanı 4. MRV onu her seferinde seçiyor (domaini en küçük), izin
verilen her günü dolduruyor, ileri kontrol kalan bloklara yer bulamıyor, dal
ölüyor — ve bu, üstündeki her dersin her hücresi için yeniden oluyor. Arama
15 saniye boyunca 2-3 blokta çakılı kalıyordu.

### Dört düzeltme

1. **Tavan önceden hesaplanıyor** (`ceilingBlocks`): dersin kendi hücreleri gün
   gün açgözlü paketlenip "aynı ders günde en fazla N saat" ile sınırlanıyor.
   `need` tavana kırpılıyor. Ders bırakılmıyor — tutabildiği kadarı diziliyor.
2. **Suçlu ders bırakılıyor**, kökteki değil. Yığın boşaldığında eskiden aramayı
   açan ders elenirdi; artık yeri tükenen ders (`culprit`).
3. **`reseed`: en iyi ızgaradan devam.** Yığının boşalması bütün atamaları geri
   sarıyor, yani her vazgeçiş sıfırdan başlamak demekti — 99 ders için 99 tam
   arama. Artık en iyi ızgara tabana donduruluyor, ilerleme geri gitmiyor.
4. **Tıkanma sayacı** (`STALL_LIMIT = 20 000` düğüm). Eşik **ölçülerek** seçildi:

   | | en uzun kazançsız seri |
   |---|---|
   | `kural-baskisi` (tam çözülüyor) | 17 |
   | `erken-saat-tuzagi` (tam çözülüyor) | 171 |
   | `derin-geri-sarma` (tam çözülüyor) | **8 059** |
   | `gercek-olcek-imkansiz` | 91 551 |
   | `gercek-olcek-sikisik` | 317 395 |
   | `parcalanmis-gunler` | 2 890 411 |

   60 000 ve 200 000 da denendi: **her eksende daha kötü** (`imkansiz` 159 → 59
   → 22 blok). 20 000, tam çözülen en zor dünyaya 2,5 kat pay bırakıyor.

Ayrıca `report()` `stuck` doluyken `'solved'` diyebiliyordu; kapandı.

### Yerleşemeyen dersin cümlesi de düzeldi

Kısmen sığan bir derste `blocker()` "510 sınıfının Salı 1 saatinde Matematik
var" diyordu — okuyanı kenara çekecek bir ders aramaya gönderen, ama çekilecek
bir şeyin olmadığı bir cümle. Artık tavanı söylüyor: *"haftada 6 saat isteniyor,
açık saatler ve kurallar en fazla 3 saat veriyor"*. **Hiç** sığmayan derste
`blocker()`'ın kendi cümlesi zaten somut ("AV Salı 1 saatinde müsait değil"),
o korunuyor — bunu mevcut bir test yakaladı ve kural daraltıldı.

### Ölçülen

| Dünya | Önce | Sonra |
|---|---|---|
| `gercek-olcek-kurali` | 3/359 blok · 33 842 düğüm · 15 sn | **241/359 · 241 düğüm · 43 ms** |
| `gercek-olcek-sikisik` | 3/423 blok · 11 672 düğüm · 15 sn | **412/423 · 43 446 düğüm · 3,6 sn** |
| `parcalanmis-gunler` | 16/24 blok · 3 233 441 düğüm · 15 sn | **22/24 · 20 023 düğüm · 110 ms** |
| `gercek-olcek-imkansiz` | 22/708 blok · 15 sn | **159/708** · 15 sn |
| sample + "art arda 2" Engelle | neredeyse boş · 15 sn | **424/426 saat · 1,6 sn** |

Testler 338 → **347 birim**, 200 → **202 E2E**. İki yeni dünya matrise girdi
(`imkansiz-ders-yaninda`, `blok-kurala-sigmiyor`) ve stres süitindeki
`test.fail` işareti kalktı: o test artık gerçekten bir şey iddia ediyor.

---

## Yedinci oturum (2026-08-25) — çözücü dünya matrisi ve Müsaitlik satırı

Kullanıcının iki isteği: Müsaitlik çizelgesinin satırları biraz uzasın, ve otomatik
dizme **çok sayıda sahte veriyle** E2E'de denensin.

### 1. Müsaitlik satırı 34 → 48 px

Ölçülen sorun: hücre 1366 px'te ~67 px genişliğinde ama 34 px yüksekliğindeydi
(~2:1 yassı). Tablo 238 px'te bitiyor, sağdaki varlık listesi ~665 px sürüyor,
altta ~360 px boş kalıyordu. 48 px hücreyi ~1,4:1'e (≈ √2) getiriyor, tablo
322 px'e çıkıyor, panel ~490 px oluyor — hâlâ 768 px'e rahat sığıyor.

Uygulama tek kural: `table.availability tbody th, tbody td { height: 48px }`.
Özgüllük (0,1,3), paylaşılan `table.availability th, td` kuralını (0,1,2) bilerek
geçiyor — tuzak 17 bunun tersini yapmanın hikâyesiydi. Başlık satırı 34 px'te
kaldı (iki satırlık içeriği için yeterli). `td.closed` yazı boyu 16 → 18 px:
`×` işareti hücrenin içeriği, hücreyle büyümesi gerekiyor.

Yan kazanç: sürükleyerek boyama hedefi 46×34'ten 46×48'e çıktı.

### 2. `src/worlds.ts` — 19 dünyalık matris

Çözücü o güne kadar yalnız iki soru görmüştü: `solver.test.ts`'teki 2 gün × 4
saatlik küçük dünya ve `sample.ts`. İkisi de düz bir çizgide çözülüyor, o yüzden
`solver.ts`'in geri sarma yarısı hiç çalışmamıştı.

Dosya `src/`'de, `e2e/`'de değil: `tsconfig.json` yalnız `src`'yi kapsıyor, yani
`e2e/` altındaki hiçbir şey `tsc --noEmit`'ten geçmiyor. Uygulama kodu bu modülü
import etmediği için Vite onu budar, `dist/index.html`'e girmez.

Üç şey dışa aktarıyor: `makeWorld()` (küçük okul üreteci — `kontrol.spec.ts`'in
içinde büyümüş olan üretecin ta kendisi, oraya da geri verildi), `illegalBlocks()`
(çerçeveden bağımsız denetçi) ve `WORLDS` (senaryo listesi).

**Denetçinin kendisi test ediliyor** (`src/worlds.test.ts`, 10 test). Bu atlanamaz:
`illegalBlocks` her zaman `[]` döndürseydi bütün çözücü testleri bedavaya yeşil
geçerdi. Bilerek yasadışı ızgaralar veriliyor — aynı öğretmen iki sınıfta, kapalı
saatte duran ders, gün sonunu taşan blok — ve yakaladığı doğrulanıyor.

### 3. Ölçülen sayılar

| Dünya | Sonuç | Düğüm | Süre |
|---|---|---|---|
| `tam-dolu` | 9/9 | 9 | 1 ms |
| `derslik-darbogazi` | 8/12 (tıkandı) | **57 929** | 275 ms |
| `erken-saat-tuzagi` | 9/9 | **201** | 2 ms |
| `derin-geri-sarma` | 12/12 | **8 362** | 63 ms |
| `kural-baskisi` | 12/12 | **28** | 1 ms |
| `delik-desik` | 30/30 | 30 | 1 ms |
| `parcalanmis-gunler` (ağır) | 16/24 | **3 233 441** | 15 sn (bütçe doldu) |
| `gercek-olcek-kurali` (ağır) | **3/359** | 33 842 | 15 sn (bütçe doldu) |

Kalın olanlar geri sarmanın çalıştığının kanıtı: geri sarmayan bir koşu blok başına
tam bir düğüm harcıyor (örnek veri: 359 blok, 359 düğüm), yani düğüm > blok başka
türlü olamaz.

`erken-saat-tuzagi` bilerek kuruldu: AV ilk derse gelemiyor, tekil saatler değer
sıralamasının ilk uzandığı 1. ve 2. saatlere yığılıyor, 2 saatlik blok bitişik yer
bulamıyor. Doğru cevap tekil saatleri günün SONUNA itmek — açgözlü sıra bunu ilk
denemede hiç denemiyor.

### 4. Testler

- `src/solver.test.ts`: mevcut 20 test + her küçük dünya için 3-4 iddia → **78 test**.
  Ortak iddialar: her blok `blocker()`'a göre yasal (girişte var olan yasadışı bloklar
  hariç — ilke 6), hiçbir ders `weeklyHours`'undan fazla yerleşmemiş, `block`
  seviyesinde hiç ihlal yok, aynı girdi aynı çıktı, elle konmuş her blok yerinde.
- `e2e/otomatik-dunyalar.spec.ts` (**24 test**): aynı dünyalar `dist/index.html`'e
  gerçek "Dosyadan aç" diyaloğundan yükleniyor, gerçek düğmeye basılıyor, sonra
  sayfanın **kendi `localStorage`'ı** okunup `src/`'deki saf fonksiyonlarla
  denetleniyor. Birim testinden farkı: burada sonuç reducer'dan geçip diske yazılmış
  hâliyle okunuyor — tuzak 20 (sonucun sessizce atılması) tam burada yakalanır.
- `e2e/otomatik-stres.spec.ts` + `playwright.cozucu.config.ts` + `npm run cozucu`
  (**7 test**): gerçek ölçekli dünyalar, ana süitin dışında.

### 5. Bu oturumda bulunan üç şey

1. **Kural sıkılaştırılınca çözücü çöküyor** — bkz. Bilinen hatalar 1. En önemlisi.
2. **Mevcut bir E2E testi boşuna geçiyormuş** — bkz. Bilinen hatalar 2.
3. **`savedState` yardımcısında yarış vardı.** İlk hâli "dizimden sonra kaydedilen
   durumu" okurken, dünyanın yüklenmesinin kendi 400 ms'lik gecikmeli kaydını
   "değişiklik" sanabiliyordu — o zaman denetim **dizimden önceki** ızgarayı
   yargılardı ve her şey bedavaya geçerdi. Çare `settledText()`: tıklamadan önce
   sayfanın gerçekten bir şey yazmış olması beklenir. Üstüne testin başına bir
   koruma kondu: kaydedilen yerleşim sayısı girişteki sayıdan **büyük** olmalı.

---

## v0.9 — bu oturumda ne yapıldı ve neden

Kullanıcının [TASKS.md](TASKS.md) sonuna yazdığı dört madde:

1. **"UI düzenlenmesi ve modernleştirilmesi lazım. Her sectionda sağ taraf bomboş."**
   Ölçülen sebep: `styles.css`'te container yoktu, genişliği sınırlayan tek şey
   `table.list.narrow/mid/wide` (520/640/720px, hepsi Ayarlar'da) ile Müsaitlik
   tablosunun 46px **sabit** hücreleriydi — 13 sütun × 46px ≈ 620px, 1366px ekranda
   sağda ~740px boşluk. Kurulum'da tersi kusur vardı: tablo tam genişlik ama içindeki
   `<input>` tarayıcı varsayılanı (~170px).
   *Yapılan:* sekmeler sol kenar çubuğuna alındı, üçü de silindi, tek düzen kuralı
   (`.cols`) geldi ve sağ sütuna **zaten var olan ama bir sekme ötede duran** bilgi
   kondu.
2. **"Otomatik kurulum önemli."** → Kullanıcıya soruldu, cevap: **programı otomatik
   dizme**. TASKS'ta v1 olarak duruyordu.
3. **"Programda üzerine tıklanınca silinmesin, sürüklenerek taşınabilsin. Sağ tık
   silsin."**
4. **"E2E her şeyi test edecek şekilde yapalım."** → Kullanıcıya soruldu, cevap:
   **tam kapsam + görsel regresyon**.

### Yol boyunca bulunan gerçek hatalar

Üçü de yalnız ölçerek ya da test yazarak bulunabilirdi:

1. **Otomatik dizmenin sonucu sessizce atılıyordu.** `change((d) => d === base.current
   ? sonuç : d)` yazılmıştı; React reducer geri çağırımını fonksiyon döndükten SONRA
   çalıştırıyor ve o anda `base.current` çoktan `null`'a çekilmiş oluyordu. Çubukta
   "Program dizildi" yazıyor, ızgara boş kalıyordu. → **tuzak 20**
2. **Çözücü simetri kırması yüzünden neredeyse hiçbir şey dizemiyordu.** "Aynı dersin
   blokları artan hücre indisinde" kısıtlaması, "haftaya yay" sezgisiyle çatışıyordu.
   Ölçülen: **57718 düğümde 26 blok** → kaldırılınca **359 düğümde 359 blok**.
   → **tuzak 21**
3. **"En sık sebep" yanlış sebebi seçiyordu.** Mesajlar gün ve saat adı taşıdığı için
   altmış farklı "sınıfın X saatinde Y var" satırı altmış ayrı sebep sayılıyor, altı
   kez tekrarlanan önemsiz bir cümle kazanıyordu: hafta boyu kapalı bir öğretmen için
   "2 saatlik blok güne sığmıyor". `blockerDetail()` artık bir **kod** döndürüyor.
   → **tuzak 22**

Ayrıca test yazarken çıkanlar: `no-overflow` sınıfı Program'ın boş ekranını
kırpabiliyordu; renk ve derslik açılır listelerinin erişilebilir adı yoktu.

### Web Worker neden kullanılmadı

TASKS.md "Web Worker" diyordu. İki bağımsız sebeple bırakıldı: Vite worker'ı **ayrı
bir chunk** olarak üretir ve `vite-plugin-singlefile` onu gömmez (tek dosya iddiası
düşer); kalan `blob:` yolu `file://`'in opaque origin'inden çalışır ve Chromium'da
güvenilmez, üstelik kaynak string olacağı için `tsc` hiç görmez. Yerine ana iş
parçacığında `requestAnimationFrame` ile dilimli arama. → **tuzak 19**

### Bilerek yapılmayanlar

- **Çözücüye ayar konmadı.** İki düğme var, kutucuk yok. "Sabaha yay", "günleri
  dengele" gibi tercihlerin doğru cevabı bir dönem kullanılmadan bilinemez (ilke 5).
- **Görsel regresyon `npm run kontrol`'e konmadı.** Sistem fontu burada Cantarell'e,
  babanın Windows'unda Segoe UI'ye çözülüyor; referans tek makine için doğru. Her
  commit'in geçtiği kapıya bağlamak, font değişimini arkasında hata olmayan kırmızı
  bir derlemeye çevirirdi. Ayrı komut, referanslar depoda.
- **`ekran.spec.ts` silinmedi.** Görsel regresyon onun yerine geçmez: biri geçti/kaldı
  der, öbürü bakılabilir bir resim verir. İkisi **aynı** `SCENES` listesini yürüyor.

---

## Oturum sonu durumu (2026-08-25, altıncı oturum)

Dal: **`v0.9-otomatik-dizme`** (`v0.8-arayuz-turu-2` üstünden; o da, `v0.7-arayuz-turu`
de `main`'e birleşmedi — üçü de bekliyor). 10 commit, her biri `npm run kontrol`
yeşilken.

`npm run kontrol` yeşil: tsc temiz, **270 birim + 176 E2E** geçiyor, `dist/index.html`
323 KB üretiliyor, toplam 51 sn.

| Eklenen | Nerede |
|---|---|
| Otomatik dizme motoru | **yeni** `solver.ts` + `solver.test.ts` |
| rAF sürücüsü (App'te yaşar) | **yeni** `useSolver.ts` · `App.tsx` |
| Yerinde yerleştirme, sebep kodları | `constraints.ts` (`occupy`/`vacate`, `blockerDetail`) |
| Ortak sebep cümlesi, ucuz kapasite | `feasibility.ts` (`commonestBlock`, `buildCapacity`, `lessonName`) |
| Sol kenar çubuğu, `.main`'in taşınması | `App.tsx` · `styles.css` · altı bileşen |
| Kenar çubuğu tercihi | `theme.ts` (`readSidebar`/`writeSidebar`) |
| İki sütunlu düzen, sağ paneller | `styles.css` (`.cols`, `.panel-grid`, `.entity-list`) · beş sekme |
| Kurulum özet paneli | **yeni** `components/setup/Summary.tsx` |
| Açık saat sayımı | `entities.ts` → `openHours` |
| Sürükleyerek taşıma, sağ tık silme | `drag.ts` · `Grid.tsx` · `Program.tsx` |
| E2E bölünmesi + ortak yardımcılar | **yeni** `e2e/helpers.ts` + 11 spec dosyası |
| Görsel regresyon | **yeni** `e2e/gorsel.spec.ts` · `playwright.gorsel.config.ts` · `e2e/__gorsel__/` |

### Sıradaki iş değişmedi

**Gerçek veri.** v0'ın çıkma şartı hâlâ tek bir şeye bağlı. Üstelik artık iki yeni
sorunun cevabı da ona bağlı: otomatik dizilen program *kullanılabilir* mi, ve çözücü
sıkışık bir veride ne yapıyor (örnek veride backtracking kodu hiç çalışmadı).

---

## Oturum sonu durumu (2026-08-25, beşinci oturum)

Dal: **`v0.8-arayuz-turu-2`** (`main`'e birleştirilmedi; `v0.7-arayuz-turu` de
birleşmemişti — ikisi de bekliyor). 10 commit, her biri `npm run kontrol` yeşilken.

`npm run kontrol` yeşil: tsc temiz, **219 birim + 87 E2E** geçiyor, `dist/index.html`
293 KB üretiliyor.

### Bu oturumda ne yapıldı

v0.8 turunun tamamı (2a–2l). Ayrıntı ve gerekçeler: [TASKS.md](TASKS.md) → BİTENLER 14.

| Eklenen | Nerede |
|---|---|
| 36 renk, çakışmasız atama | **yeni** `palette.ts` + `palette.test.ts` |
| Sınıf renkleri, branş listesi, şema v5 | `types.ts` · `entities.ts` · `store.ts` |
| Ayarlar sekmesi | **yeni** `components/settings/` · `components/props.ts` |
| Branş açılır listesi | `setup/Teachers.tsx` · `entities.ts` |
| 24 saatlik / 5 dk başlangıç | `settings/School.tsx` · `bell.ts` |
| Havuz görünümü takip ediyor | `Program.tsx` · `LessonPool.tsx` |
| Kep + öğrenci simgeleri, ince ayraç, büyük çarpı | `Program.tsx` · `styles.css` |
| Kapalı saatte ders işareti | `constraints.ts` · `Grid.tsx` · `Check.tsx` · `Availability.tsx` |
| Yazdırmada sayfa seçimi | `Print.tsx` · `App.tsx` |

### Sıradaki iş değişmedi

**Gerçek veri.** v0'ın çıkma şartı hâlâ tek bir şeye bağlı ve iki arayüz turu bunu
değiştirmedi. Elde veri olmadan yazılacak her yeni özellik tahmindir (ilke 5).

---

## Oturum sonu durumu (2026-08-24, dördüncü oturum)

Dal: **`v0.7-arayuz-turu`** (`main`'e birleştirilmedi). 13 commit, her biri
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

Depo: `https://github.com/AlparslanSemiz/ders-programi.git`

```bash
git clone https://github.com/AlparslanSemiz/ders-programi.git
cd ders-programi
npm install
npx playwright install chromium   # E2E testleri için, bir kez
npm run kontrol                   # tsc + 453 birim + derleme + 318 E2E + 6 site (~3 dk)
npm run dev                       # geliştirme sunucusu
```

> Bu blok **2026-08-26'da eskidi**: görsel regresyon katmanı ve `npm run gorsel`
> silindi. `kontrol`'ün dışında kalan iki süit şunlar:
>
> ```bash
> npm run ekran    # iki temada 17 görüntü -> test-results/ekran/ (test değil, KANIT)
> npm run cozucu   # 7 gerçek ölçekli çözücü testi, ~36 sn
> ```
>
> İkincisi `kontrol`'ün parçası değil ama **gerileme yakalıyor** — 2026-08-27'de
> yakaladı. Arayüzde bir düğmenin adı değiştiyse elle koşulur.

(`--update-snapshots` tek başına yalnız **kırmızı** referansları yeniler; hepsini
yazdırmak için `=all` gerekiyor. Bu 2026-08-25'te öğrenildi: satır yüksekliği
değiştiği hâlde eşik farkı yuttuğu için referanslar sessizce eski kaldı.)

**Çözücü stres süiti de ayrı**: `npm run cozucu` (~40 sn). Çöküş düzeldikten
sonra dünyaların çoğu bütçesini doldurmuyor, ama biri (kasten imkânsız olan)
hâlâ 15 saniye harcıyor — o yüzden ayrı komutta duruyor.

`npm run kontrol` yeşilse ortam doğru kurulmuş demektir. Sonra
[TASKS.md](TASKS.md) içindeki **"ŞİMDİ SIRADA"** bölümünden devam edilir.
