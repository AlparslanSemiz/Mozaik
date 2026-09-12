# Tuzaklar

Bu projede yaşanmış tuzaklar, temaya göre gruplanmış ve her grubun başında kuralıyla.

Numaralar kalıcı kimliktir. [WORKLOG.md](WORKLOG.md), [TODO.md](TODO.md) ve kod
yorumları tuzaklara "tuzak N" ya da "pitfall N" diye atıf yapıyor, bu yüzden
gruplar yeniden numaralandırılmadı ve bir grubun içinde numaralar atlamalı
görünür. Bir numaranın hangi grupta olduğu en alttaki dizinde yazılı. Her madde
dört şey söyler: ne oldu, sebebi, karşı önlem, ve onu koruyan test ya da ölçüm.

Denenip bırakılan yolların kaydı burada değil, [DECISIONS.md](DECISIONS.md)'de.

---

## Şema göçü ve veri kaybı

**Kural.** Kaydedilmiş bir veriyi okuyamayan bir sürüm o veriyi silmiş sayılır.
Şema, anahtar ya da silme davranışı değişince önce eski verinin nasıl okunacağı
yazılır, sonra onun testi, ve test bugünkü değeri değil değişmezin kendisini
ölçer. Silme bağımlılarını da temizler, yoksa yetim bir kimlik ızgarayı
çökertir.

### 4 · Silme cascade olmalı
Öğretmen silinince dersleri, ders silinince yerleşimleri, sınıf silinince ikisi
de gider. Yetim bir `lessonId` kalırsa ızgara çöker. Çaresi `sanitize()`
(tuzak 6).

### 5 · Gün ya da saat sayısı azalınca taşan yerleşimler silinir
Silinmezse görünmez hayalet dersler kalır ve sayaçlar tutmaz.

### 6 · `sanitize()` her yüklemede ve her ayar değişikliğinde çağrılır
Tuzak 4 ve 5'in çaresi bu.

### 7 · localStorage silinebilir
Karşı önlem katmanlı: her değişiklikte otomatik kayıt, son üç durumun ayrı
anahtarda yedeği (`ders-programi-yedek-0` ile `-2` arası) ve görünür bir dosyaya
kaydet düğmesi. Babaya öğretilecek tek alışkanlık: değişiklik yaptın, yedek
indir.

### 11 · Gün listesi değişince anahtarlar kayar
`placements` anahtarı günün indeksini tutuyor. Pazartesi listeden çıkarılırsa
Salı 1'den 0'a kayar ve bütün program sessizce bir gün öne kayar. Çare
`remapDays()`: eşleme isimden kurulur, çıkarılan günün anahtarları silinir,
kalanlar yeniden yazılır. Her `updateSettings` bundan geçer ve `remapDays`'in
testi var.

### 16 · Kapalı saat işareti yalnız boş hücreye çiziliyordu
Müsaitlik program dizildikten sonra düzenlenince dolu bir saati kapatmak dersi
yerinde bırakıyor, tarama ise kartın altında kalıyordu, yani çakışma hiçbir
yerde görünmüyordu. `blocker()` yalnız olası bir bırakmada çalıştığı için bunu
yakalayamaz. Çare `closedConflicts()`: ders silinmez (veri kaybı olmaz ilkesi),
kırmızı işaretlenir ve Kontrol'de sayılır.

### 28 · Plan değiştirmeden önce bekleyen kayıt eşzamanlı boşaltılır
Otomatik kayıt 400 ms gecikmeli ve efektin temizliği bekleyen yazımı iptal
ediyordu, yani plan geçişinden hemen önceki düzenleme hiçbir yere yazılmadan
kayboluyordu. `switchPlan`, `createPlan` ve `deletePlan` önce `park()` çağırır:
zamanlayıcıyı iptal eder ve giden planı hemen yazar.

### 29 · İlk plan tarihsel anahtarını korur
`planKey('1') === 'ders-programi'`. Böylece kitaplığa geçiş tek bayt kopyalamaz
(yarım kalmış bir kopya iki ayrı gerçek demek), eski bir `dist/index.html`
programı hâlâ bulur ve yedek zinciri değişmeden çalışır. `newId()`'nin
alfabesinde `1` yok. Alfabe değişirse yeni bir plan birinci planın üstüne
yazar, `library.test.ts` bunu 500 kimlikle sabitler.

### 30 · İki dosya türü aynı düğmeye düşerse biri ötekini siler
Üst çubuktaki "Dosyadan aç" bir planı, Ayarlar'daki "Tümünü dosyadan aç" bütün
kitaplığı açar. Uzantı ve ön ek aynı, yanlışını seçmek geri alınamaz. Üç karşı
önlem birlikte: paket adında `-tumu-` var, `parseState` bir paketi okuyamaz
(`schemaVersion` yok) ve `parseBundle` bir planı okuyamaz (`bundleVersion`
yok), üst çubuk paketi görünce reddedip yolu gösterir. Yeni bir dosya biçimi
eklenirse üçü de gerekir.

### 91 · Bir değerin iki işi varsa çeviri onları ayırır
`defaultSubjectShort` hem "ekranda ne yazıyor" hem "bu bir değişiklik mi"
sorusunu cevaplıyordu. İkinci soru çevrilemez: dille birlikte kıpırdayan bir
karşılaştırma aynı projenin iki oturumunda `subjectShorts`'a farklı şeyler
yazdırır, yani bir arayüz tercihi yedek dosyasının içeriğini değiştirir. İkiye
ayrıldı, biri Türkçe kaldı, öteki çevrildi, ve `setSubjectShort` ikisini de
kabul eder ki kullanıcı ekranda gördüğünü geri yazınca kayıt silinsin.

### 97 · Bir sayıyı adlandıran göç testi bir sonraki sürümde geride kalan sayıyı göremez
`parseState.ts`'teki kabul listesinin yorumu (o gün dosyanın adı store.ts idi) tam bu kusuru anlatıyordu ve yine de
şema 8'den 9'a çıkarken (`5fc0316`) `version === 8` listeye yazılmadı ve okuma `return null`'a düştü: yayınlanmış v2.0.0'ın
yazdığı her yedek okunamaz oldu. v6 ve v7 için testler vardı, ama her biri sabit
bir sayı adlandırdığı için sonsuza kadar yeşil geçerdi. Yazılan test sayı
adlandırmıyor: `raw.schemaVersion = SCHEMA_VERSION - 1` okunabilmeli. Bir
değişmezin testi bugünkü değeri değil değişmezin kendisini yazar.

---

## Dağıtım kimlikleri, tek kaynak ve sürüm

**Kural.** Bir ad bir adres olabilir: ters DNS kimliği verinin durduğu yoldur,
depo adı dağıtılmış her ikilinin içine derlenmiş bir öneki taşır. Bir dizeyi
yeniden adlandırmadan önce "bunu kim görüyor" değil "bunu kim arıyor" diye
sorulur. "Tek kaynak" diye yazılmış bir kural onu ölçen bir test olmadıkça bir
niyettir. İki teslim yolu varsa biri ötekine sızmasın diye ayrım mekanik olarak
ölçülür.

### 32 · İki derleme hedefi varsa biri ötekine sızar
`dist/index.html`'in iddiası tek dosya ve ağsız olmak, site hedefinin manifesti,
service worker'ı ve simgeleri bunu sessizce bozabilir. Üç önlem birlikte:
siteye özel etiketler `index.html`'de durmaz ve yalnız site config'inin
`transformIndexHtml`'i ekler, ana config'de `publicDir: false` var, ve
`site.spec.ts` `dist/index.html`'de `serviceWorker`, `manifest` ve `sw.js`
geçmediğini okuyarak doğrular.

### 66 · Tek geri döngüye bağlanan bir sunucu bazı makinelerde bulunamaz
Chrome `*.localhost`'u hem `127.0.0.1` hem `::1`'e çözüp yarıştırır, bu makinede
`::1` çıktı. Yalnız IPv4'e bağlanan sunucu burada çalışır, başka yerde çalışmaz,
ve arada bir log yok. `sunucu.mjs` iki `http.Server`, `sunucu.ps1` iki
`TcpListener` açar. IPv6'sı kapalı bir makinede `::1` bağlanamaz, öteki
ayaktaysa devam edilir.

### 69 · Bir yapı ürününün reçetesi yoksa içindeki her karar donar
Gömülü font (`src/fonts/IBMPlexSans-subset.woff2`) aylarca nasıl üretildiği bilinmeyen bir dosyaydı ve ağırlık
ekseninin kırpılı olması "fontTools kurulu değil" gerekçesiyle bir madde olarak
bekledi. `scripts/font.mjs` yazılınca iş dört dakika sürdü ve eksen seçenekleri
ölçülebilir oldu. Kaynak yüz depoda duruyor (`scripts/font-source/`, OFL 1.1).
Commit'lenen bir derleme çıktısının betiği de commit'lenir.

### 72 · Depoda programın kendisi gibi görünen iki yem vardı
Kök `index.html` Vite'ın şablonu: çift tıklanınca modül `file:///C:/src/main.tsx`'e çözülür, CORS'a
takılır ve geriye boş beyaz bir sayfa kalır. `kurulum/Kur.cmd` kurulumun
kaynağıdır ve eski mesajı okuyanı hiç indirilmemiş bir ZIP'i aramaya
yolluyordu. İkisi de artık kendini söylüyor: şablon `file://` altında nereye
bakılacağını yazar, `kur.ps1` depo kaynağını paketten ayırıp `npm run paket`
der. Uyarının derlenmiş dosyada çalışamaması bir ölçüm: singlefile `src`'yi kaldırıp kodu gömüyor, yani orada
`script[type="module"][src]` null döner, ve `temel.spec.ts` 77 ikisini de ölçer.
Teslim edilen bir dosyanın ikizi depoda duruyorsa, o ikiz çalıştırılınca ne
olacağı yazılır.

### 73 · Sabit bir service worker önbellek adı güncellemeyi bir açılış geciktirir
`site/sw.js` iki sürüm boyunca `CACHE = 'ders-programi-v1'` yazıyordu. Dosya
bayt bayt değişmediği için `install` yeniden koşmadı, `addAll(SHELL)` kabuğu yeniden indirmedi, ve yeni sürüm yalnız arka
plan tazelemesiyle geldi: baba programı açıyor eskisini görüyor, kapatıp açınca
yenisi geliyor. Çare önbellek adının derlemeyle kıpırdaması (`scripts/surum.mjs`
ve `vite.site.config.ts`'in `stampServiceWorker`'ı). Bir önbelleğin adı
içindekinin sürümüdür.

### 77 · "Tek kaynak" diye yazılmış bir kural testi yoksa bir dilektir
Belge iki sürüm boyunca sürüm numarasının tek kaynağının `package.json`
olduğunu söyledi, numara ise üç dosyadaydı ve `yayinla.mjs` yalnız birincisini
yazıyordu. Exe kendini güncellemeyi öğrenince bu kozmetik olmaktan çıktı:
geride kalmış bir numara ya güncellemeyi hiç önermez ya kurulduktan sonra da
önermeye devam eder. Çare: `tauri.conf.json` `"../package.json"` yolunu
gösterir, `yayinla.mjs` `Cargo.toml`'u da yazar, `src/surum.test.ts` ikisinin
aynı şeyi söylediğini her koşuda ölçer.

### 78 · Bir `.ico`'da olmayan boy sessizce ölçeklenir
Görev çubuğu işareti "eksik pikselli" göründü ve kodda yanlış yoktu: dosyada 16,
32, 48, 64, 128 ve 256 vardı, Windows ise %125'te 40, küçük düğmelerde 24 istiyor
ve eksik boyu komşusundan büyütüyor. Ardından `< 48 sade` yazan eşiği taşımak pikselleri doğru
okudu ama yanında "görev çubuğu 32 px'lik bir yuvadır" diye ölçülmemiş bir cümle
taşıyordu, oysa Windows 11 %100'de 24 istiyor. `temel.spec.ts` 79 dosyayla
betiğin tutarlılığını ölçer, eşiğin doğruluğunu değil. Bir eşiği ölçmek hangi
tarafında ne olduğunu ölçmektir, platformun o eşikten ne isteyeceği ikinci bir
ölçümdür. Eşiğin geçmişi [DECISIONS.md](DECISIONS.md)'de, bugünkü değeri
[BUILD.md](BUILD.md)'de.

### 93 · Bir dosyanın reçetesi, o dosyaya elle eklenen şeyi siliyordu
`scripts/favicon.mjs` `index.html`'i baştan yazıyor, tuzak 72'nin şablon uyarısı
ise dosyaya elle yazılmıştı. Betiği çalıştırmak uyarıyı sessizce kaldırıyordu
ve `temel.spec.ts` 77 bunu ancak sonradan kırmızıyla söylerdi. Bir betiğin
ürettiği dosyaya elle eklenen her şey betiğe eklenir.

### 95 · Bir ters DNS kimliği bir ad değil, bir adrestir
Program Mozaik olurken `tauri.conf.json`'ın `identifier`'ı
`com.dersprogrami.arac` yerine `me.mozaik.arac` yapıldı. Tauri WebView2'ye profil
olarak `%LOCALAPPDATA%\<identifier>` veriyor, yani o dize babanın planlarının
durduğu yol. Windows'ta ölçüldü: `%LOCALAPPDATA%\com.dersprogrami.arac` altında
`EBWebView\Default\Local Storage\leveldb`
içinde `ders-programi`, `ders-programi-planlar` ve `ders-programi-yedek-0`,
köken `http://tauri.localhost`. O exe boş açılır ve sebebini hiçbir yer
söylemez. Geri alındı, `src/surum.test.ts` dizeyi çiviliyor ve `productName`'in
Mozaik olduğunu ayrıca ölçüyor ki geri alma "ad değişikliği geri alındı" diye
okunmasın. Yayınlanmış v2.0.0 varlığı bu kusuru taşıyordu.

### 106 · Bir depo adı dağıtılmış her ikilinin içine derlenmiş bir adrestir
Belge "depo yeniden adlandırılırsa o kopyalar bir daha güncellenemez" diye
uyarıyordu. `ddae9fe` depoyu `ders-programi` yerine `Mozaik` yaptı, yayınlanmış
v2.0.2 yalnız eski öneki tanıyordu, sonraki manifest yeni adı yazdı ve
"Güncellemeleri denetle" `Beklenmeyen adres` dedi. Cümlenin iki yarısı hiç
buluşmayan iki dosyadaydı: bir iş akışındaki kabuk satırı ve bir Rust sabiti.
Karşı önlem: kabul edilen önekler bir liste (`RELEASE_KOKLERI`, yalnız uzar),
manifest eski adresi yazar (GitHub 301'liyor), `src/surum.test.ts` iki dosyayı
birbirine karşı okur. Pages'in yönlendirmesi yok, aynı yeniden adlandırma
`SITE_ADRESI`'ni 404 yaptı ve adres `…github.io/Mozaik/` oldu. Bir riski doğru
adlandıran bir belge cümlesi teste dönüşene kadar yalnız riskin tarihini yazar.

---

## Çözücü ve kısıt motoru

**Kural.** Kısıt mantığının tek evi `blocker()`, ve sürükleme, çözücü ve denetçi
aynı fonksiyonu çağırır. Aramayı hızlandıran bir fikir teoride doğru olsa bile
ölçülmeden konmaz. Sebep sayan her yer cümleyi değil kodu sayar. Paylaşılan bir
fonksiyona kapı koymadan önce onu çağıranların bir el mi, bir hesap mı olduğu
sorulur.

### 21 · Arama uzayını daraltan kısıt değer sezgisini bozuyorsa kaybettirir
Çözücüde "aynı dersin blokları artan hücre indisinde" simetri kırması vardı.
"Haftaya yay" sezgisi geç bir hücre seçince dersin kalan blokları oradan
sonrasına hapsoluyordu. Ölçülen fark: 57718 düğümde 26 blok, kaldırılınca 359
düğümde 359 blok. Kaldırılma kaydı [DECISIONS.md](DECISIONS.md)'de.

### 22 · Sebep cümleleri gün ve saat adı taşır, cümle sayılmaz
"En sık sebep" hesabı altmış farklı "sınıfın X saatinde Y var" satırını altmış
ayrı sebep saydı ve hafta boyu kapalı bir öğretmen için "2 saatlik blok güne
sığmıyor" yazdı. `blockerDetail()` bir kod döndürür (`teacherClosed`,
`classBusy` …), sayım koda göre yapılır.

### 26 · MRV en küçük domaini seçer, tamamlanamayan ders de en küçük domainli derstir
Kurallar yüzünden 8 saatin ancak 4'ünü tutabilen bir ders izin verilen günleri
doldurup "yer yok" diyor, arama geri sarıp aynı dersi yeniden seçiyordu: 15
saniyede 2 ya da 3 blok. Çare iki katmanlı. Her dersin tavanı arama başlamadan
hesaplanır (`ceilingHours`), ve ızgara `STALL_LIMIT` kadar düğüm boyunca
iyileşmezse bir dersten vazgeçilip o ana kadarki en iyi ızgara tabana
dondurulur. Sıfırdan başlamak her vazgeçişte bütün emeği geri sarardı.

### 27 · Yerleşemeyen dersin sebebi dersin kendi blokları yüzünden yanlış çıkabilir
Kısmen sığan bir ders izin verilen günleri kendi bloklarıyla doldurur, `blocker()`
sonra "sınıf o saatte dolu" der ve okuyan kenara çekecek bir ders aramaya
başlar. Tavanı kırpılmış her derste sebep cümlesi tavanın kendisi. Hiç
sığmayan derste `blocker()`'ın somut cümlesi korunur.

### 75 · Izgara blok sınırı saklamaz, eşit olmayan bloklarda bir koşu birden çok türlü okunur
`placements` saat başına bir `lessonId` tutar ve blok başlangıcı diye bir kayıt
yok. Tek blok boyu varken sorun değildi, `2+1` ile aynı dersin üç bitişik hücresi
hem `[2,1]` hem `[1,2]` okunabilir. Çare şemayı büyütmek değil tek bir okuma
kuralı: `placedBlocks()` gün ve saat sırasıyla gezer, her koşuda önce uzun
blokları alır, kalanı tek saat sayar. Okumanın seçimi bir programı yanlış
yapamaz ama sağ tıkın kaç hücre aldığına ve havuzun hangi kartları borçlu
olduğuna karar verir. Bu fonksiyonu çağırmayan her yer sapar: komşulukla
hesaplanan bir `continues` bitişik `2+1`'i tek blok çizer.

### 76 · Bir parametreyi araya sıkıştırmak sondan eklemekten pahalıdır
`blocker(d, ix, lessonId, day, hour)`'a blok boyu gerekti. `day`'in yanına
konsaydı üç sayı yan yana gelip sessizce takas edilebilirdi. Sondan isteğe
bağlı eklendi (`size?`), verilmezse "dersin bekleyen ilk bloğu" demek.
`occupy` ve `vacate`'te boy zorunlu parametre, çünkü onlar aramanın iç döngüsü
ve yanlış bir boy dizini sessizce bozar.

### 98 · Kullanıcıya ait bir reddi paylaşılan bir fonksiyona koymak mekanik çağıranı bozar
Sabitleme kilidi `removeBlock`'a kondu, çünkü dört yol (sağ tık, menü, Delete,
üstüne bırakma) oradan geçiyor. Beşinci çağıran `illegalBlocks()` her bloğu
kaldırıp `blocker()`'a geri konup konamayacağını soruyordu ve kilitli bloğu
kaldıramayınca onu kendisiyle çakışıyor diye raporladı. Çare adları ayırmak:
`liftBlock()` mekanik ve kapısız, `removeBlock()` kapı artı `liftBlock`.

---

## Sürükleme, saf DOM ve React sınırı

**Kural.** Yüksek frekanslı bir etkileşim (sürükleme, imleç haçı, boy tutamağı,
satır sıralama) React durumuna yazmaz, DOM'a doğrudan dokunur ve React'e yalnız
sonucu bildirir. Uzun yaşayan durum sekme değişince sökülen bileşende değil
`App`'te tutulur. Bir jestin hedefi, eşitlikte ne olacağı yazılarak seçilir.
Ve bu yolun ölçümünde CSS'in söylediği ile tarayıcının yaptığı aynı şey değildir:
bir kapsama kuralı da bir katman ipucu da, adı ne söylerse söylesin, ancak önce
ve sonra ölçülerek alınır (tuzak 105 ile 117).

### 1 · Sürüklerken yeniden çizim sürüklemeyi bozar
HTML5 drag-and-drop ile sürükleme sırasındaki bir re-render sürüklemeyi
koparıyor. Bu yüzden Pointer Events kullanılıyor, `pointermove` sırasında React
durumu güncellenmiyor ve hayalet kart `transform` ile doğrudan DOM'dan taşınıyor.
Kütüphane yerine elle yazılma kararı [DECISIONS.md](DECISIONS.md)'de.

### 2 · Geçerli hücreler sürükleme başında bir kez hesaplanır
Her `pointermove`'da değil.

### 3 · Her tuş vuruşunda yeniden çizim odağı kaybettirir
Metin kutularında `onInput` değil `defaultValue` ve `onBlur`.

### 9 · Blok çiziminde `rowspan` kullanılmıyor
rowspan ile dinamik bir tablo birlikte hata üretiyor. İkinci hücreye sade bir
devam işareti konur.

### 10 · Izgarada iki bine yakın hücre var
Satırlar `React.memo` ile sarılı, bir yerleştirme bir ya da iki satır çizer.

### 13 · Izgaraya eklenen her hücre sürükleme hedefi sanılır
`drag.ts` hedefi `closest('[data-day]')` ile buluyor. Öğle arası ayraç sütunu
`data-day` ve `data-hour` taşımaz, taşısaydı ders öğle arasına bırakılırdı.
Yeni bir hücre eklerken ilk soru bu.

### 18 · Bileşen sekme değişince sökülür
`useState` içindeki her şey gider. Baskı sayfa seçimi bu yüzden `App`'te duruyor,
çünkü başka sekmeye gidip dönmek listeyi siliyordu. Seçim "seçilenler" değil
"dışarıda bırakılanlar" olarak tutulur, yoksa sonradan eklenen sınıf sessizce
basılmaz. Otomatik dizme koşusu da aynı sebeple `App`'te (`useSolver`).

### 19 · Web Worker bu projede çalışmıyor
Vite worker'ı ayrı bir chunk olarak üretir ve `vite-plugin-singlefile` onu
gömmez. Kalan `blob:` worker'ı `file://`'in opak kökeninden çalışır ve
Chromium'da güvenilmez, kaynağı da string olacağı için `tsc` onu görmez. Çözücü
ana iş parçacığında `requestAnimationFrame` ile dilim dilim koşar. `setTimeout(0)`
değil, çünkü iç içe beş çağrıdan sonra 4 ms'e kelepçelenir ve boyama garantisi
vermez.

### 20 · React reducer geri çağırımını geç çalıştırır
`change((d) => ...)` içine bir `ref` okuması koyup fonksiyondan sonra `ref`'i
temizleyince geri çağırım çalıştığında `null` buluyor ve iş sessizce atılıyor.
Otomatik dizmenin sonucu böyle kayboldu. Referans önce yerel bir değişkene
alınır.

### 46 · `pointerup`'ta `hasPointerCapture` false olabilir
Sürüklemenin sonunu ona bağlayınca hareket bitiyor ama commit çalışmıyordu:
çekmece yeni boyda duruyor, tercih yazılmıyor, yenilemede eski boya dönüyordu.
Jestin açık olduğu kendi bayrağıyla bilinir, capture yalnız serbest bırakırken
sorulur.

### 47 · `margin` ile araya sıkıştırılan tutamağın alt yarısını komşusu yer
Havuzun kulpu 9 px'ti ama `margin-bottom: -4px` ile `.pool-head`'in altına giriyordu,
`elementFromPoint` alt yarıda başlığı buluyordu ve fare tam ortaya indiğinde
olay gelmiyordu, oysa testte `boundingBox()` doğru kutuyu veriyordu. Bir tutamak kendi satırını alır ve görünür bir tutamak işareti
taşır, çünkü kılcal bir çizgi kenarlık gibi okunur.

### 55 · `startViewTransition` yakaladığı öğeyi tıklanamayan bir anlık görüntüyle değiştirir
Sekme geçişi bununla sarılınca `elementFromPoint` ızgaranın üstünde 553 ms
boyunca hücre değil `<html>` döndürdü. `drag.ts` hedefi tam o çağrıyla bulduğu
için geçişten sonraki yarım saniyede kapılan kart hiçbir yere düşmüyordu. Ölçüm
ve geri alınma kararı [DECISIONS.md](DECISIONS.md)'de.

### 60 · "Orta noktayı geçtim mi" bir sürükleme hedefi seçmez
Satır sıralamasının ilk hâli hedefi geçilen orta noktalarla buluyordu ve
`y > middle` eşitlikte yanlış olduğu için satırın tam üstüne bırakmak onu bir
sıra eksiğe koyuyordu. Paralel koşuda alt piksel farkları yüzünden bir flake
olarak göründü. Doğrusu kapsama: imlecin üstünde olduğu satırın indisi
(`rowDrag.ts`).

### 85 · `nth-child` ile sayılan bir sütun, bir satıra `colSpan` girdiği gün kayar
İmleç haçı sütunu `cell.cellIndex` ile bulup öteki satırlarda `:nth-child(N)`
arıyordu. İki saatlik blok tek bir `<td colSpan={2}>` olunca solunda birleşmiş
blok olan satırlarda haç imlecin soluna düştü. Süit yeşil kaldı, çünkü haç testi
boş bir ızgarada koşuyordu (tuzak 41). Bir konum DOM'daki sıradan sayılıyorsa `colSpan`, `display: contents`, koşullu bir
hücre ya da bir `<template>` onu bir sabah bozar. Çare bir sayı değil bir kimlik: `Grid.tsx`
gövde hücrelerine ve saat başlıklarına `data-col` yazar, birleşmiş hücre
kapsadığı sütundan yakılır. Başlığa `data-day` konmadı (tuzak 13).

### 105 · Bir ekranın en pahalı profil satırı israf olmayabilir
Program sekmesi açılırken `gridChrome.ts`'in `scrolled()`'ü profilin en pahalı
satırıydı. Ertelenince tıklamadan boyamaya geçen süre kıpırdamadı, çünkü o
düzen boyamanın zaten yapacağı düzendi. Pahalı görünen bir satır kaldırılıp
toplam yeniden ölçülür, kaldırılan iş çoğu zaman başka bir yere taşınır. Tuzak
117 bunun kardeşi ve öteki yönü: orada pahalı görünen satır gerçekten pahaydı,
ama işe yarayacağı sanılan çare yaramadı.
Ölçümler ve geri alınma [DECISIONS.md](DECISIONS.md)'de.

### 117 · Bir metin düğümünü değiştirmek belgenin tamamını yeniden yerleştirebilir
Sürüklerken gerekçe çubuğunun cümlesini yazmak, 6704 nesnelik bir belgede kökü
`#document` olan tam bir yerleşim tetikliyordu: hedef hücre her değiştiğinde bir
kez, 5,37 ms, yanında 5,24 ms tam görüntü alanı boyaması. Sebep `textContent`'in
kendisi değil durduğu yer — metin `nowrap` ve `ellipsis` taşıyan bir flex
öğesinin içinde, içerik değişince kutusu da değişebiliyor, ve Blink kökten
başlıyor.

Asıl tuzak çarede: iki tane "doğru görünen" CSS çaresi ölçülüp çürütüldü.
`contain: layout` çubuğa konunca düşen kare %21,7–24,3 oldu, yani tabandan
KÖTÜ; metin kutusuna `flex: 1 1 0; min-width: 0` tabanla aynı kaldı. İkisi de
yerleşim kökünü belgeden almadı. İşe yarayan şey mekanizmayı değil SIKLIĞI
değiştirmek oldu (`REASON_GAP = 100`, `88fffc2`): düşen kare %9,5–14,1'den
%1,1'e, Layout 543 ms / 107'den 216 ms / 42'ye indi. Bir yerleşim maliyeti
görülünce önce yazmanın ne sıklıkta olduğu sorulur, sonra CSS'e bakılır.

---

## Düzen ölçümü ve hangi kutuya bakıldığı

**Kural.** Bir düzen iddiası gerçek tarayıcıda, onu dolduran gerçek veriyle, ve
doğru kutunun kendi ölçüsüne bakılarak doğrulanır. Yeşil geçen bir süit
"sığıyor" demek değil: testler çoğu zaman bir kontrolün var olduğunu ölçer,
metninin göründüğünü değil. Ölçümün alındığı kutu (pencere boyu, ölçek,
yoğunluk, eksen) ölçümün parçasıdır. Bir tabloyu kutuya yayarken fazlalığın
hangi sütuna gittiği ölçülür. Listelerde çalışan tarif tabloya
`min-width: 100%; width: max-content`, son sütuna `width: auto` vermek, çünkü bir
hücreye yazılan yüzde genişlik otomatik düzenli tabloda döngüseldir.

### 33 · Yazı boyunu büyütmek sabit piksellik bir sütunu sessizce kırpar
Gövde 14'ten 16 px'e çıkınca renk sütunu JSX'teki `width: 44` yüzünden 11.
öğretmenden sonra "1" yazmaya başladı ve süit yeşil geçti. Genişlik `ch`
cinsinden CSS'e taşındı. `e2e/renk-secici.spec.ts` seçiciyi `width: auto` ile
klonlayıp tarayıcının istediği genişliği ölçer, eski 44 px geri konunca test
kırmızıya döndü.

### 34 · `<th>`'ye verilen genişlik sütunun genişliğidir, kontrolün değil
Genişliği `<th>`'ye `ch` ile koymak kutuyu 44'ten 29 px'e daralttı: `<th>`
dolguyu içerir, ve başlıkla gövdenin punto farkı yüzünden aynı `ch` iki ayrı
piksel. Genişlik kontrolün kendisine verilir ve seçici aynı öğede olur
(`table.list td > select.color-pick`). Metin ya da `width: 100%` taşıyan
sütunun genişliği gerçekten sütunun meselesidir ve `<th>`'ye verilir, ama birim
başlığın `ch`'si: `.num` bir `<input>`'ta `8ch`, `<th>`'de `10ch`.

### 36 · Bir hücre boyu elle hesaplanmış yarımlarla yazılmaz
Hayalet kartın kaydırması `margin: -17px`, yani `34/2` idi. `--cell-*` rem'e
geçince %125'te hayalet parmağın altından kaydı. Türetilen bir ölçü türediği
değerden hesaplanır: `calc(var(--cell-w) / -2)`.

### 37 · `clamp()` bir hücreyi sütunun min-content'inden dar çizemez
Sığdır için `--cell-w` 28, 23 ve 18 px yapıldı, üçünde de hücre 33,69 px
çizildi. İlk teşhis (karttaki iki satır) yanlıştı, suçlu başlıktaki `"10:40"`
idi ve onu gizlemek tabloyu 2461'den 1728 px'e indirdi. Alt sınırın nereden
geldiği tek tek kapatılarak ölçülür, 78 sütun kenarlığının alt piksel payı da.

### 38 · `font-display: swap` ile `ch` cinsinden sütunlar her açılışta kayar
Gömülü yüz `data:` URI olsa bile eşzamanlı çözülmez: ilk düzen `ch`'yi yedek
fonta çözer, yüz gelince yeniden. Ölçülen `1ch` 6,86 px'ten 9,00 px'e. Çare
`font-display: block`, E2E de `document.fonts.ready`'yi bekler.

### 39 · `ch` puntoyla orantılı değildir
Plex'te 12 px'te 7,00, 15 px'te 9,00 px, oran 1,286. "Sütunlar ölçekle tam 1,25
büyür" diyen test fontun bir özelliğini iddia ediyordu. Doğru değişmez `ch`
sayısı.

### 41 · Boş bir ızgarada yapılan ölçüm hiçbir şey ölçmez
Havuzun Sığdır'a maliyeti boş haftada "sığıyor" çıktı, 426 kart konunca 174 px
taştı. Aynı oturumda "hedef ekran dışındaysa görünür oluyor" testi havuzun
alttan yer yemesine yaslanıyordu ve havuz taşınınca bir şey ölçmeden yeşil
geçti. Koşul zorlanır (kısa viewport, satırdan uzağa kaydırma) ve önkoşul ayrıca
iddia edilir.

### 48 · Küçülen bir flex kutusunun küçülmeyen çocukları taşar ve tıklanamaz olur
Üst çubuğa durum çipi eklenince `.tabstrip` daraldı ama `.tab`'ler `0 0` kaldı.
%150'de Ayarlar sekmesi çipin altına düştü ve testte "gizli" değil "zaman
aşımı" olarak göründü. Bir çubuğun daralırken neyi sırayla feda ettiği yazılır:
önce boşluk, sonra çipin cümlesi (noktası kalır), sonra belge adı, sekmeler
hiç.

### 50 · Bir tablo için ölçülmüş gerekçe başka bir tabloya taşınmaz
Müsaitlikte saatleri gizleyen ayar için "saat sütunun genişliğini belirler"
yazıldı, tuzak 37 olduğu gibi taşınarak. Ölçüldü ve yanlıştı:
`table.availability` `table-layout: fixed` ve `width: 100%`, tablo saatli de
saatsiz de aynı boyda. Gerçek gerekçe kullanıcınınkiydi, saatlere bakmak
istemiyor.

### 61 · `width: 100%` bir tablo sığmayan sütunun yerini küçülebilen sütundan alır
Öğretmen listesine iki sütun eklenince %150'de ad kutusu 232'den 26 px'e indi.
İki yarısı var: geniş içerik kendi kutusunda kayar (`.table-scroll`), ve
`min-width: max-content` ancak hücrelerin bir içerik genişliği varsa işe
yarar, yani tabanlar kontrole `ch` cinsinden verilir.

### 64 · Bir düzen kusurunu ölçerken hangi kutunun taştığına bakılır
"Sayfada ne olsun" satırlarının panelden taştığı sanıldı, test satırın kenarını
panelinkiyle karşılaştırdı ve bozuk derlemede yeşil geçti. Taşan şey kapsayıcı
değildi: `white-space: nowrap` öğenin kendi metnini kırpıyordu. Bir kırpılma
testi öğenin kendi `scrollWidth`'ine bakar.

### 70 · Değişken bir font aralık dışı ağırlığı hata vermeden kırpar
`styles.css` beş kuralda `font-weight: 700` istiyordu, yüz 400 ile 600 arasında kırpılıydı ve
beşi de 600 çiziyordu, üçü kâğıtta. "600 istendi" ile "700 istendi ve
reddedildi" aynı pikselleri üretir. Yeni bir eksen, `font-feature-settings` ya da `font-variation-settings` yazılınca yüzün o değeri
verebildiği ölçülür (`temel.spec.ts` 46). Bir CSS değeri yazmak karşılığının var olduğu anlamına
gelmez.

### 82 · Bir metni kaldırmak ondan yükseklik alan kutuyu da kaldırır
Renk seçicinin yüksekliği içindeki iki rakamdan geliyordu, rakamlar kalkınca
kutu 10 piksellik bir çubuğa döndü. Test göremezdi, `npm run ekran`'a bakmak
yakaladı. Çare `height: 1lh`. Bir öğeden metin çıkarılırken metnin ne taşıdığı
sorulur: genişlik, yükseklik, taban çizgisi.

### 100 · Sarmalanamayan bir grup kendi kartlarını kırpar
Havuz grupları `flex: 0 0 auto` idi. "Uzun bloklar önce" sıralamasında geniş grup
1920 px'lik tepside 4015 px istedi ve 2109 px'lik kart `overflow-x: hidden`
altında (`.pool-list`) erişilemez oldu. Çare `flex: 0 1 auto; max-width: 100%`, grup böylece kendi `flex-wrap`'ine düşüyor. Aynı turda
başlık kartların üstündeyken 84 px'lik tabana tek kart satırı sığmadı ve ekran
dışı sürükleme testi kırmızıya döndü (`boundingBox()` kırpılmış kutunun koordinatını veriyor,
`mouse.move` oraya gidiyor ve altında kart yok), başlık yana alındı. Bir kutu bölünmeden
önce hem kendi yönünün taşması hem öteki yönün tabanı ölçülür.

### 102 · Kıl payı sığan bir kutu kök kıpırdadığı gün sığmaz
Müsaitlik başlığı ders numarası ve saat taşıyor, saati kapatan ayar tablonun
boyunu değiştirmemeli. İki yıl boyunca tesadüfen değiştirmedi, çünkü pay 29,75
px'e karşı 30 px'ti. Kök 13 px'e inince saat açıldığında tablo 2,16 px büyüdü.
Çare bir sayı değil bir yapı: satır `visibility: hidden` ile gizlenir, yani satır
kutusu iki durumda da yerinde kalır. Aynı kusurun ikinci yarısı tuzak 103.

### 107 · Bir teslim yolu ölçtüğün her şeyden dar bir kutuda koşuyor olabilir
Exe'de Sığdır açıkken dersler görünmüyordu. `tauri.conf.json` penceresi
1600×1000 mantıksal piksel istiyordu ve büyütülmemişti, deponun bütün düzen
ölçümleri ise 1920'de yapılmıştı (`playwright.config.ts`'in viewport'u, `npm run ekran`). 1600×968'de 374 kartın 315'i `4…` yazıyordu.
Bunu koruyacak testin `clipped` sayacı kırpılmayı `.card`'da sayıyordu, ellipsis ise `.card-top`'taydı:
kusur yerindeyken eski metrik 0, yenisi 315. İlk düzeltme yalnız öğretmen
görünümünde ölçülmüştü, sınıf görünümünde (satır başının ikinci satırı `G dersliği` gibi uzun) 20 satır başının 20'si kırpılıyordu,
yani iki eksenli bir ızgara iki eksende ölçülür. Karşı önlem: pencere
`maximized`, `gorunum.spec.ts` 45 iki kutuda ve iki eksende kartı, satır başını
ve köşedeki eksen adını ölçer, `src/surum.test.ts` pencere ayarını çiviliyor.

---

## CSS kapsamı, özgüllük ve custom property

**Kural.** Bir CSS değeri yazmak onun uygulandığı anlamına gelmez: daha güçlü bir
seçici onu ezebilir, custom property o öğeye ulaşmıyor olabilir, ya da değer
çoktan başka bir öğede hesaplanmış olabilir. Yeni bir zemin, durum ya da değişken
eklenirken neyi ezdiği ve nereden okunduğu sorulur. Bir durumun işareti bir
ölçüyü değiştiriyorsa o işaret bir renk olur. Statik konumlu bir kutuda
`z-index` okunmaz, konumlanmış komşusu sayı ne derse desin üstüne boyar.

### 14 · Tarayıcı açık temalı sayfayı kendi karartır
`color-scheme` iki temada da doğru kurulmazsa Brave ve Chrome kendi
algoritmalarını uygular ve işlevsel renkler çamurlaşır. Renk değerlerini
düzeltmek yetmez.

### 15 · Palet üstündeki metin temayla dönmemeli
Öğretmen renkleri pastel ve iki temada aynı. `color: inherit` koyu temada açık
metni pastel zemine düşürür. Palet renginin üstündeki mürekkep `--on-color`.

### 17 · Izgara hücresinin genişliğini `table.grid tbody td` belirler
`.break-col` (0,1,0) ondan (0,1,3) zayıf kaldı ve öğle arası ayracı aylarca dar
tanımlıyken bir ders kadar geniş çizildi. Yeni bir hücre genişliği verirken
seçici güçlendirilir ya da `!important` kullanılır, ve genişlik ölçülür.

### 35 · `select` `color: inherit` alır
Renk seçici zeminini paletten, mürekkebini temadan alıyordu ve koyu temada açık
renklerde indeks görünmüyordu. Tuzak 15'in unutulan tek yeriydi. Palet rengi
taşıyan her öğeye `--on-color`.

### 40 · Yeni bir zemin kuralı bir durumu ezebilir
Gün bandı (`table.grid tbody td.band`, 0,2,3) `td.unavailable`'ı (0,1,1) yendi ve
tek indeksli günlerdeki kapalı saatler taramasını kaybetti. Yalnız "kapalı saat
haçın altında kaybolmuyor" testi yakaladı. Yeni bir zemin eklenince hangi
durumları ezdiği tek tek yazılır.

### 45 · Bir custom property'nin iki sahibi varsa yakın olan kazanır
`--dock-h` hem `.pool`'a React inline stiliyle hem `.program-body`'ye
sürükleyiciyle yazılıyordu. Sürükleme DOM'a yazdı, yakın tanım kazandı ve ekranda
bir şey olmadı. Türetilen bir değişkenin tek sahibi olur.

### 52 · Bir custom property'nin kapsamı onun tanımının parçasıdır
`--sec` yalnız `.topbar` ve `.ribbon`'da tanımlıydı, `.panel > h2::before` ve
`.chip[aria-pressed]` doğdukları günden beri fallback'i çiziyordu. Bir şey
çizmemek değil yanlış şeyi çizmekti. `var(--sec, var(--accent))` gibi bir `var(--x, …)` yazan her yerde soru şu: x
buraya ulaşıyor mu? Karşı önlem `data-section`'ın kökte durması.

### 53 · Yeni bir görsel katman var olan bir sınıfa yeni bir değer değil yeni bir ad ister
Hedef satırı boyayan zayıf katman `drop-ok`'u kullansaydı "iki saatlik blok iki
hücre yakar" sayımı 40 bulurdu ve test okuyanı çözücüye yollardı. Ayrı adlar (`can-ok`,
`can-warn`, `can-no`) sayımı da ayraç testinin `not.toHaveClass(/drop-/)` iddiasını da olduğu gibi bırakıyor.

### 54 · Bir kaydırma kutusuna verilen `mask-image` kendi yapışkan çocuklarını kırpar
Sündürme `.main`'e uygulanabilir çünkü `position: sticky` bir çocuğu yok, `.grid-wrap`'e
uygulanamaz çünkü saat başlığı ve öğretmen sütunu tuttukları kenarda erirdi.
Izgara gölgeyle konuşur (`scrolled-y`, `scrolled-x`).

### 57 · Sıfır süre sıfır mesafe demek değildir
Her geçiş `--dur`'ü okuyordu ama her mesafe elle yazılıydı (`translateY(.5rem)`,
`translateX(100%)`, `scale(.96)`, `translateY(1px)`). 0 ms'lik bir geçiş öğeyi durdurmaz, ışınlar.
Mesafeler de token oldu: `--slide`, `--sweep`, `--press`, `--pop`
([DESIGN.md](DESIGN.md)).

### 58 · Bir tercihi hem makine hem kullanıcı veriyorsa hangisinin kazandığı yazılır
Hareket ayarı `prefers-reduced-motion`'ı ezseydi, sistemde "azalt" demiş biri bu
programda hareketi geri almış olurdu. Makine bir taban:
`@media (prefers-reduced-motion: reduce)` bloğu `[data-motion]` kurallarından
sonra ve eşit özgüllükte durur, yani sırayla kazanır. Kayıt yoksa tercih
sistemden türetilir, yoksa kıpırdamayan bir makinede düğmede "Tam" yazar.

### 94 · Bir durumun ağırlığı bir ölçüdür
Şeritte seçenekler arasında geçerken düğmeler kayıyordu ve iki sebep vardı.
`.btn[aria-pressed="true"]` `font-weight: 600` yazıyordu ve eşit sütunlu `.ribbon-group`'ta
en uzun seçeneği basmak dört kutuyu genişletip sonuncuyu 7,3 px kaydırıyordu.
Aynı ızgarayı kullanan sekme çubuğu, seçili sekmeyi yalnız renkle söylediği için
hiç kıpırdamadı (`.tab[aria-current]`). İkincisi `.main`'de `scrollbar-gutter: stable` yoktu,
taşan ve taşmayan bölüm sayfaya 10 px farklı genişlik veriyordu. Süit bunu
göremezdi, çünkü Playwright Chromium'u `--hide-scrollbars` ile açar.
`e2e/kayma.spec.ts` kendi tarayıcısını `ignoreDefaultArgs: ['--hide-scrollbars']` ile açar ve oluğun yer
kapladığını iddia etmeden önce ölçer. Program sekmesi oluktan muaf, çünkü
`overflow: hidden` de Chromium için bir kaydırma kabı.

### 110 · Bir `@container` kuralı kendi kapsayıcısını biçimlendiremez
Şeridin daralma kuralı `.ribbon`'a `container-type: inline-size` verip
`@container` ile adım adım yer kazanacaktı, ama ilk adım `.ribbon`'un kendi
`gap`'iydi ve o hiçbir eşikte değişmedi: bir kapsayıcı sorgusu yalnız
kapsayıcının torunlarına uygulanır, kapsayıcının kendisine değil. Kural yazılı,
seçici doğru, ve hiçbir şey olmuyor. Tuzak 52 ve 63'ün ailesinden ama ikisinden
de farklı: orada değişken o öğeye ulaşmıyordu ya da değer çoktan başka bir yerde
hesaplanmıştı, burada kuralın yazabileceği yer kısıtlı. Çare ölçüyü kapsayıcıdan
çocuklara taşımak: `gap` yerine `.ribbon > * + * { margin-left }`, çünkü çocuklar
torun sayılır. `e2e/serit.spec.ts`'in feda sırası testi aralığı taşıyan öğeden
okuyor, yani kural bir eşikte devreye girmezse kırmızıya dönüyor. Bir kutunun
kendi ölçüsünü kendi genişliğine göre değiştirmesi gerekiyorsa o ölçü çocuklarda
durur.

### 103 · Bir kuralın kapsamı yorumda değil seçicide yazılıdır
`:root[data-density='sigdir'] .hour-clock { display: none }` seçicisinde
`table.grid` yoktu ve Sığdır'da müsaitlik başlığının saatini de kapatıyordu:
düğme basılıyor, `aria-pressed` dönüyor, `data-avail-clock='acik'` yazılıyor, ekranda bir şey olmuyordu. Kuralın
yanındaki yorum kapsamı doğru anlatıyordu. `gorunum.spec.ts` 50 varsayılan
yoğunlukta koştuğu için göremedi. Bir ayar birden çok modda yaşıyorsa onu ölçen
test kusurun yaşayabileceği modda koşar.

---

## Yazdırma ve kâğıt

**Kural.** Yazdırma hafife alınmaya yatkın, o yüzden sonda değil ortada test
edilir. Kâğıt ekranın bir çizimi değil fiziksel bir yüzeydir: mm cinsinden
ölçülür, ve kanıt için PDF üretilip gözle okunur.

### 8 · Yazdırma hafife alınır
Sayfa başına bir sınıf ya da öğretmen: satır gün, sütun ders, A4 yatay,
`table-layout: fixed`. 72 sütunlu ana tablo basılmaz. "Taşmıyor" yetmez:
sütunların eşit olduğu ve sayfanın gerçekten yatay çıktığı ölçülür (`page.pdf`
ve MediaBox).

### 31 · Tarayıcının üst ve alt bilgisi CSS ile gizlenemez, ama çizecek yer bulamazsa çizilmez
Tarih ve dosya yolu kenar boşluğu kutusunun içeriği. Tek yol `@page { margin: 0 }`
ve boşluğu `.print-page`'e dolgu olarak geri koymak. Sayfa kutusu sabit
yükseklikli olmalı ki içerik dikey ortalansın, ve tam 210 mm olursa kesirli piksel ile `break-after: page`
her programın ardına boş bir sayfa koyar, bu yüzden 205 mm yazılır. Ortalamada `safe center`
kullanılır, düz `center` taşmada sayfanın üstünü keser. Kanıt
`displayHeaderFooter: true` ile üretilen PDF'i okumak.

### 63 · `:root`'ta tanımlanan bir custom property'nin içindeki `var()` orada çözülür
`--fs-p-xl: calc(17pt * var(--p-type))` `:root`'ta tanımlıydı ve `.print-area`'da
ezilen çarpanı okumadı: dokuz ayarda başlık 22,7 px çıktı. Türetilmiş bir merdiven
türediği çarpanla aynı öğede tanımlanır.

### 86 · Bir taşmayı `scrollHeight` ile ölçmek flex sütununda sıfır döndürebilir
Dokuz baskı birleşimini gezen test `.print-page`'in `scrollHeight - clientHeight`'ine
bakıp dokuzunda da 0 buldu, oysa "Büyük"te içerik 714 px'lik sayfadan 739 px
istiyordu. `justify-content: safe center` bir flex sütunu taşmasını o yoldan
bildirmiyor. Çocukların sınırları içerik kutusuyla karşılaştırılır. İkinci
yarısı: `emulateMedia({ media: 'print' })` pencereyi değiştirmez, kâğıdı ölçen
test pencereyi de kâğıdın boyuna getirir.

---

## Ad çakışması ve erişilebilir ad

**Kural.** Playwright'ın `getByRole(name:)` ve `getByLabel`'ı alt dize eşler ve
büyük küçük harf ayırmaz. Bir kontrolün adı bir sekmenin adını içerirse süitin
yarısı kırılır. Kısa ve genel adlar `exact: true` ile aranır, metni değişen bir
kontrole kendi `aria-label`'ı verilir, bir panel metniyle değil başlığıyla
kapsanır, ve bir ekranı soran test hangi ekran olduğunu söyler.

### 49 · Yeni bir düğmenin adı bir sekmenin adıyla başlıyorsa süitin yarısı kırılır
"Programı boşalt" 27 yerde `name: 'Program'` sorgusunu ikiye çıkardı. Durum
çipinin cümlesi "…havuzda" ve başlığı "Kontrol sekmesini açar" olduğu için
`Havuz` ve `Kontrol` sorguları da kırıldı. `title` bir ada dönüşür ve o ad üç
piksel ötedeki sekmenin adı olabilir.

### 56 · Erişilebilir adı iki test katmanı iki türlü hesaplarsa ayrışır
jsdom duman testinin `buttonName()`'i önce `textContent`'e bakıyordu,
Playwright spesifikasyona uyup `aria-label`'ı üstün tutuyor. Görünüm düğmesi
simgesinin yanına metin alınca E2E "Sınıf görünümü"nü, duman testi "Sınıf"ı
gördü. İki katmanın bir ad üstünde anlaşamaması, birinin yanılmasından
beterdir. Bir adın GÖRÜNÜRLÜĞÜ iddia ediliyorsa ölçüm hesaplanmış
stili gören yoldan yapılır: `textContent` CSS'i hiç görmez, yani `display: none`
bir adı erişilebilirlik ağacından silse de "adı var" diyen bir iddia yeşil kalır.
2026-09-12'de şeridin feda sırası yazılırken tam bu oldu ve ölçüm `innerText`'e
çevrildi.

### 74 · Bir düğmenin adı bir sekmenin adını içeriyorsa da süit kırılır
Klasör uyarısına `Ayarlar → Veri` adında bir düğme kondu ve `name: 'Ayarlar'`
sorgusuna da cevap verdi. Aynı gün bir `.panel` `{ hasText: 'Bu program' }` ile
arandı ve komşu panelin cümlesi "bu program için" dediği için o bulundu, yani bir panel metniyle değil
başlığıyla kapsanır (`has: getByRole('heading')`). Bu
yüzden "Ayarlar"ın çekimleri (`ayarlarına`, `Ayarlar →`) düğme adlarında
kullanılmıyor.

### 104 · `<Activity mode="hidden">` sekmeyi DOM'da bırakır
Program React'in `<Activity>`'sine sarıldı, böylece ızgara geri gelirken
yeniden kurulmuyor, ve bu yedi testi kırmızıya döndürdü: `.empty-screen` iki öğe
buluyordu (Çıktı'nınki ve gizli Program'ınki), `getByLabel('Sırala')` havuzun
`aria-label="Havuz sıralaması"`'nı da buluyordu. Karşı önlem
`e2e/helpers.ts`'teki `onScreen()`. Gerçek kullanıcı etkilenmiyor, çünkü
`<Activity>` gizli dalı erişilebilirlik ağacından da çıkarıyor.

---

## Çeviri ve metin

**Kural.** Kullanıcıya görünen metin bir karakter değil bir rol, toplu
değiştirme ve tarama o rolü hedefler. Anahtar Türkçe cümlenin kendisi olduğu için
bir doğruluk Türkçe ekranda tanım gereği sağlanır, onu ölçen yer öteki
dillerdir.

### 12 · `Cuma` ve `Cumartesi` ikisi de `slice(0,3)` ile "Cum" olur
Gün kısaltmaları ilk üç harften değil `shortDay()` tablosundan gelir (`Cmt`,
`Pzr`).

### 80 · Karakter üstünden yapılan toplu değiştirme yorumları da bulur
`constraints.test.ts`'te ` — ` yerine ` · ` koyan bir değiştirme İngilizce
yorumları da değiştirdi, hiçbir şeyi kırmadan ve ancak `git diff` okununca görülerek. Karar bir teste taşındı:
`metin.spec.ts` kaynağa değil `document.body.innerText`'e bakar.

### 87 · Ölü anahtar tarayıcısı yorumlara da bakar
`i18n.test.ts` anahtarları bütün `src/`'nin ham metninde arıyor. `Kurulum → Okul`
ve `Yazdır → Çıktı` sonrasında eski kelimeler yorumlarda durduğu için
`'Kurulum': 'Setup'` ölü olduğu hâlde canlı sayıldı, mutasyonla ölçüldü. Bir
arayüz metnini yeniden adlandıran `lang/*.ts`'i elle düzeltir.

### 89 · Bir süit çevrilmemiş metni göremez
`t('Öğretmenler')` Türkçede `'Öğretmenler'` döndürür ve süit Playwright
ayarlarının `locale`'iyle Türkçeye sabitli. Sözlük bittiğinde süitin tamamı
yeşildi ve İngilizce ekranda on dört yerde Türkçe duruyordu. Bulan iki şey oldu: İngilizce sayfanın gövdesinde
Türkçe harf arayan bir tarama, ve en uzun dilde (Almanca) ekran görüntülerine
bakmak.

### 90 · Bir sayı yuvaya girerse çoğullanamaz
Listelerin sayacı `'{toplam} {ne}'` idi ve Almancada `8 Raum` yazıyordu. Sayı
çevrilen anahtarın içine alındı (`countKey='{n} derslik'`).

---

## Test hijyeni ve bedava yeşil

**Kural.** Yeşil bir süit, testin ölçmesi gereken şeyi ölçtüğünü göstermez. Bir
testin gerçekten bir şey ölçtüğü mutasyonla sınanır: kural bilerek bozulur ve
test kırmızıya dönmelidir. Mutasyondan önce dosya bir kopyaya alınır ve geri
alma o kopyadan yapılır, çünkü `git checkout -- dosya` o dosyadaki commit'lenmemiş
bütün işi siler. Bir derlemenin çıktısı susturuluyorsa çıkış kodu okunur, yoksa
testler bir önceki `dist/`'i ölçer. Bir test yardımcısı önkoşulunu bulamıyorsa
fırlatır. Genel hatırlatmalar: `Number('')` ve `Number(null)` sıfırdır ve bir
normalize fonksiyonunun testi her çağıranın verdiği tipi dener. `toHaveProperty`
noktayı yol ayracı okur, nokta taşıyan bir anahtarın varlığı `Object.keys` ile
sorulur. Bir JSX yorumu `{cond && (` ile öğenin arasına konamaz.

### 23 · Testi yargılayan denetçinin kendisi test edilir
`illegalBlocks()` her zaman `[]` döndürseydi çözücü matrisi ve E2E dünya testleri
bedavaya yeşil geçerdi. `worlds.test.ts` ona bilerek bozuk ızgaralar verir. Her
dünya testinde bir koruma var: kaydedilen yerleşim sayısı girişten büyük olmalı,
yoksa iddialar dizimden önceki ızgarayı yargılıyor olabilir.

### 24 · localStorage kaydı 400 ms gecikmeli ve "sonrasını oku" öncesini okur
Sayfanın yüklenmesi de kendi kaydını 400 ms sonra yazar, "önceki değer" o
yazımdan önce alındıysa beklenen değişiklik yüklemenin kendisi olur. Çare
`settledText()`: tıklamadan önce sayfanın gerçekten bir şey yazmış olmasını
beklemek.

### 25 · `--update-snapshots` tek başına yalnız kırmızı referansları yeniler
Eşiğin yuttuğu gerçek bir düzen değişikliği referansı sessizce eski bırakır,
hepsi için `--update-snapshots=all`. Eşik `maxDiffPixelRatio` idi. Görsel regresyon katmanı 2026-08-26'da
kaldırıldı, bu not bir referans katmanı yeniden kurulursa geçerli.

### 51 · `settledText()`'in ölçütü "bir şey yazıldı"dır ve boş durum da bir şeydir
`openWithSample` ızgarayı bekliyordu ama depoyu değil, arada depodaki en yeni
kayıt sayfanın boş yazımıydı. Çare yardımcıda: örnekten sonra depoda okulun
adını beklemek. Aynı hata `loadWorld`'de de duruyordu: `savedState` ilk değişiklik olarak dünyanın
yüklenmesini görüyordu ve 20 dünya testi dizimden önceki ızgarayı yargılıyordu, tuzak 23'ün koruması yakaladı. Bir tuzak
bir yerde kapatılınca aynı deseni kullanan her yer aranır.

### 59 · Görüntü alırken ya da boyanmış bir değeri okurken hareket bitmiş olmalı
`npm run ekran` solmanın ortasını yakaladı ve `dark-12-ayarlar-gorunum.png` boş çıktı. Sekme
geçişi paneli `translateY(var(--slide))` ile 7 px aşağıdan soluyor, erken okunan `getBoundingClientRect` rayın
kaydığını söylüyordu. Çare `document.getAnimations()` bitene kadar beklemek,
sabit bir `waitForTimeout` değil, çünkü süre bir ayar. Genişletilmiş hâli tuzak 99.

### 67 · Structured clone fonksiyon klonlayamaz
`klasor.spec.ts`'in `getFileHandle`, `keys()` ve `removeEntry`'yi düz bir nesneye koyan
sahte tutamağı IndexedDB'ye hiç giremezdi,
yani "klasör yeniden açılınca hatırlanıyor" testi imkânsız bir şeyi ölçüyordu.
Çare sahteyi küçültmek: gerçek bir `FileSystemDirectoryHandle` (OPFS, `navigator.storage.getDirectory()`) alınır ve
yalnız sürülemeyen `showDirectoryPicker` sahtelenir. İzin kapısı prototipe
yamanır, çünkü örneğe konan bir alan onu klonlanamaz yapardı.

### 68 · `addInitScript` her yüklemede koşar
İzin testi `localStorage['__izin']`'i `prompt` yapıp sayfayı yeniliyordu, init
betiği her yüklemede onu `granted`'a geri yazıyordu. Bir init betiği durumu
tohumlar, dayatmaz. `file://` altında depoya dokunan bir init betiğinin bedeli tuzak 108.

### 79 · Bir devriyenin maliyeti zaman aşımlarının toplamıdır
İlk `npm run patrol` üç dakikada hiçbir sekmeye uğramadan düştü, çünkü gezinme
başarısız tıklamayı `.catch()` ile yutuyordu ve her biri varsayılan 5 saniyeye mal oluyordu. Karşı önlemler kısa
tıklama ve `expect` süresi ve bir duvar saati bütçesi. `window.print()` kendisini
çağıran tıklamayı bloklar, devriyede boşa alınır.

### 83 · Hiçbir komutun okumadığı bir katılık katılık değildir
`tsconfig.json`'ın `include`'u `["src", "vite.config.ts"]` idi, `e2e/` ve config'ler hiçbir `tsc`
koşusunda yoktu. `npm run kontrol` yeşilken editörde 48 sorun duruyordu,
`@types/node` kurulu değildi ve her `node:fs`, `node:path` ve `Buffer` çözümsüzdü, ve `patrol.spec.ts` dışa aktarılmamış bir `Page`
tipi yüzünden tip güvencesiz koşuyordu. Çare `tsconfig.tools.json` (src dışındaki her şey, `types: ["node"]`, aynı `strict`),
`e2e/tsconfig.json` ve `npm run tipler`. `types`'ı ayrı tutmak bir bileşenin
`process`'e uzanmasını engeller.

### 84 · Ölçülen her şey "oradayım", ekran "değilim" diyorsa haklı olan ekrandır
Havuz destesinin rozeti DOM'da vardı, kutusu, görünürlüğü ve
`elementsFromPoint` sonucu doğruydu, ama statik üst kart konumlanmış kopyaların
altında boyanıyordu. İki ders kalıcı. `locator.screenshot()` öğeyi görünür alana
kaydırır ve önceki `getBoundingClientRect` ile uyuşmaz, sabit gerçek kırpmasız
tam ekran görüntüsünden gelir. Susturulmuş bir `npm run build` kırıldığı hâlde
test eski `dist/`'i ölçüp yeşil geçti.

### 92 · Bir yardımcının sessiz dönüşü zaman aşımı olarak görünür
`revealRibbon` `.main`'i bulamayınca `return` ediyordu, şerit katlı kalıyor ve
iddia beş saniye sonra düşüyordu. Bu bir tur boyunca "yük altında kararsız"
diye kayda geçti, yani bir kod kusuru ortam özelliği sanıldı. Yardımcı artık
fırlatıyor, ve çıplak `page.reload()`'dan sonra ekranı okuyan testler `open()`'ın
bekleyişlerini yapıyor.

### 99 · Geçiş sürerken okunan boyanmış değer inandırıcı bir yalandır
Raptiyenin "hover olmadan görünür" testi `getComputedStyle(...).opacity > 0.25` diyordu ve `opacity: 0` mutasyonuyla yeşil geçti.
İki sebep vardı: `dragAndDrop` imleci hücrede bıraktığı için `td:hover > .card-pin` kuralı
raptiyeyi açıyordu, ve imleç çekilince bile geçiş sürerken okunan opaklık
0,64'tü. Boyanmış bir değeri (opaklık, renk, dönüşüm) okuyan her ölçüm önce
hareketin bitmesini bekler: `settledMotion()` `e2e/helpers.ts`'te.

### 108 · `file://` altında belge başında depoya dokunan bir betik sonraki yenilemeyi bayat başlatır
Süitin paralel koşuda "kararsız" yedi testi aynı şeyden düşüyordu. `kapan.ts` dili her
testte `addInitScript` ile tohumluyordu, ve Chromium `file://` kökeninde belgenin en
başında localStorage'a dokunulunca (yalnız okumak da yetiyor) bir sonraki belgeyi zaman
zaman bir önceki turun deposuyla ya da boş bir depoyla başlatıyor. Beklemek çözmüyor,
http'de olmuyor, aynı yazım 50 ms sonra yapılınca olmuyor. Dört işçide tohumlu 142 bayat
okuma, tohumsuz 720 yenilemede 0. Çare depoya dokunmamak: dil Playwright ayarlarında
`locale` ile sabit. `file://` üzerinde koşan bir testin başlangıç betiği localStorage'a
dokunmaz. `context.storageState()` `file://` kökenini döndürmez, bu kökende depo sayfanın
içinden okunur. Ölçümler TESTFINDINGS'in 2026-09-11 kaydında.
Sınırın nerede olduğu 2026-09-12'de ölçüldü ve tetikleyici belgenin **öncesi**: `<head>` içinde
ayrıştırılırken koşan klasik bir betik depoyu okuduğu hâlde 400 yenilemede bir kez bile bayat
açılış üretmedi, aynı koşuda `addInitScript` ile kurulan tohum 200 yenilemede 9 bayat okuma ve 4
kalıcı kayıp verdi. Yani ürünün `<head>`'inde depo okumak bu tuzağa girmiyor, belge başına betik
enjekte etmek giriyor.

### 109 · Vitest bir stil sayfasını `?raw` ile de boş dize olarak verir
Hareket tercihinin tabanı (tuzak 58) `styles.css`'teki sıraya dayanıyor ve bir birim
testi o sırayı kaynaktan okuyacaktı. `import styles from './styles.css?raw'` de
`import.meta.glob(..., { query: '?raw' })` de uzunluğu 0 olan bir dize verdi, çünkü
Vitest `test.css.include`'da adı geçmeyen her CSS dosyasını boşaltıyor, ham okuma
dahil. Test ilk koşuda kırmızıydı, ama iddiası yalnız bir `not.toMatch` olsaydı
bedavaya yeşil geçerdi. Çare `vite.config.ts`'te `css: { include: [/src\/styles\.css/] }`
ve testin başında okunan metnin boyunu soran bir koruma. Okunan bir kaynağı
yargılayan her test önce okumanın boş olmadığını sorar.

### 111 · Joker uzantılı bir `?raw` glob'u ağaçtaki her ikiliyi belleğe gömer
Belge kapısı deponun dosya listesini `import.meta.glob` ile çıkaracaktı ve ilk
hâli `eager: true` ile `../src/**/*` diyordu. Vitest tek bir test koşmadan V8'in
yığın sınırında düştü, çünkü eager biçim eşleşen her dosyayı kaynağın içine
satır içi gömüyor ve bu ağaçta gömülü bir woff2, bir `.ico` ve bir klasör dolusu
ekran görüntüsü var. Çare biçimi değiştirmek: bir dosyanın var olup olmadığını
soran kapının içeriğe ihtiyacı yok, ve tembel glob'un anahtarları o sorunun tam
cevabı. `raw.d.ts` iki biçimi ayrı ayrı bildiriyor ve tembel olanın yanında
sebebi yazılı. Bir glob'un maliyeti eşleşen dosya sayısı değil, eşleşenlerin
toplam boyudur.

### 112 · `import.meta.glob` kendi dosyasını hiç görmez
`docs.test.ts`'in yol kapısı diskteki dosyaları bu glob'la çıkarıyor ve
CLAUDE.md'nin `src/docs.test.ts` diyen satırını bayat saydı: Vite glob'a çağıran
dosyanın kendisini koymuyor, yani kapı kendi adına kördü ve o satırı sonsuza
kadar kırmızı tutardı. Ölçüldü, varsayılmadı: aynı glob'dan `src/platform/drag.ts` ve
`src/surum.test.ts` geliyor, `src/docs.test.ts` gelmiyor. Çare listeye kendi
adını eklemek, ve sebebini yanına yazmak. Bir dosyanın kendi ürettiği listede
kendisini araması boş dönebilir.

---

## Ölçüm disiplini

**Kural.** Bir platform ya da performans iddiası ölçülerek yazılır, hele bir turun
gerekçesiyse. Bir ölçüm bir tarihtir, dayandığı mekanizma değişince yeniden
alınır. Ölçüm aletinin kendisi de sorgulanır. Bir şikayetten yazılan plan bir
sebep adlandırıyorsa turun ilk işi o sebebi ölçmektir.

### 42 · Bir ölçüm altındaki mekanizma değişince sessizce yalan olur
"Sığdır havuzu kapatır" kuralı 174 px'lik gerçek bir ölçüme dayanıyordu.
`.grid-wrap` bir container olup hücre `100cqw`'den hesaplanınca taşma 0 px oldu,
ama kural ölçüm gerekçesiyle belgede durdu ve kimse yeniden ölçmedi. Bir ölçüme
dayanan kuralın yanına neyin ölçüldüğü yazılır.

### 65 · Güvenli bağlam ile gerçek köken aynı şey değildir
Bir turun gerekçesi "`file://` güvenli bağlam değildir, orada Dosya Sistemi
Erişimi API'si yoktur" diye dört dosyaya yazıldı. Chromium'da ikisi de yanlış,
`file://`'ın eksiği bir köken:

```
isSecureContext                    true
showDirectoryPicker                function
navigator.serviceWorker.register   TypeError
navigator.storage.getDirectory     SecurityError
location.origin                    "file://"   (makinedeki her yerel sayfayla ortak)
```

Yakalayan bir ekran görüntüsüydü: "API yok" durumunun resminde "Klasör seç…"
düğmesi çıktı. Özellik `in window` ile tespit edilir, teslim yoluna göre
varsayılmaz, ve düzeltme bir test olur (`temel.spec.ts` 75).

### 81 · Bir rengi ölçmeden önce hangi uzayda yazıldığına bakılır
"Açık temada şerit az görünüyor" şikayeti ölçüldü ve doğrulandı sanıldı, tablo
tamamen yanlıştı: `contrast()` `rgb()` ayrıştırıyordu, boya
`color-mix(in oklab, …)` idi, Chromium `oklab(0.899 …)` döndürüyordu ve zemin iki
temada da siyah okundu. Renk 1×1 bir canvas'a boyanıp `getImageData` ile okununca tablo tersine döndü. Modern renk
sözdizimi (`oklab`, `oklch`, `color-mix`, `color()`) `getComputedStyle`'dan o hâliyle çıkar, sayıya çeviren her yol önce
sRGB'ye getirir.

### 101 · Bir şikayetten yazılmış plan bir sebep adlandırır ve o sebep ilk ölçülecek şeydir
Görev çubuğu simgesi için üç tur harcandı, her plan başka bir sebep adlandırdı
ve sonuncusu ("`bundle.icon` `--no-bundle` ile ikonu gömmüyor olabilir") bir iş listesine
dönüşmüştü. Yayınlanmış ikiliye bakmak on dakika sürdü: dokuz boyun dokuzu da
gömülüydü, ve aynı ölçüm "VERSIONINFO yok" maddesini de çürüttü. Kalan gerçek
sebep (24 px'te altı çubuğun araları 0,56 cihaz pikseli) ancak iki teori kalkınca
göründü. Ölçüm bir kapıya dönüştü: `scripts/exe-ikon.mjs`, `surum.yml`'in `exe`
işi.

### 113 · `dist/index.html`'in sha256'sı commit değişince kendiliğinden değişir
Taşıma turunun kuralı "taşımak çıktıyı değiştirmemeli" ve ölçüsü çıktının
sha256'sı. İkinci taşımadan sonra sha başka çıktı ve bir an "taşımadan fazlası
oldu" diye okundu. Sebep taşıma değildi: `scripts/surum.mjs` `git rev-parse
--short HEAD`'i `__SURUM__`'ün içine basıyor ve o dize demete giriyor, yani her
yeni commit çıktının baytlarını değiştiriyor. Ölçüm HEAD sabitken tekrarlandı
(değişiklikler zulaya alındı, aynı ağaç yeniden derlendi): iki sha aynı çıktı.
Bir çıktı karşılaştırması yalnız aynı HEAD üstünde anlamlıdır.

### 114 · Bir dosyayı bölmek çıktının baytlarını değiştirir, taşımak değiştirmez
Taşıma turunun ölçütü "sha256 değişmesin"di ve dört taşımada tuttu. Bölmede
tutmadı ve tutmaması doğru: demetleyici modülleri yeni sıraya göre yazıyor ve
kısa adları yeniden dağıtıyor, yani aynı davranış başka baytlar üretiyor. İlk
bölmede iki derleme aynı HEAD üstünde alınıp karşılaştırıldı, uzunluk birebir
aynı ve fark tek bir dokuz kilobaytlık bölgedeydi. Bir bölmenin ölçütü sha256
değil, çıktının BOYU ile süitin kendisi. Boy da değişebilir: altı modüllük
bölme dikişin tutkalı kadar büyüdü (`583eae6`, yüz on dokuz bayt).

### 115 · Bir kural kümesi adına bakılarak alınırsa gelen şey bir gürültü duvarıdır
Tip farkında ESLint kurulurken `strictTypeChecked`'ın kaç bulgu vereceği yüz ile
dört yüz arasında tahmin edildi, ölçüm 1228 çıktı. Şaşmanın kendisi bir bulgu: bir
kural kümesinin adı neyi ölçtüğünü söylemez, ve sayılmadan açılan bir küme bir kapı
değil bir gürültü duvarı kurar. Bulgular sayılmadı, sınıf sınıf okundu, dört kural
ayakta kaldı ve düşenlerin sebebi `eslint.config.js`'in başında tek tek yazılı. En
çok umulan kuralın hiçbir işe yaramadığı da ancak okununca görüldü:
`no-unnecessary-condition` mutasyon koşusunun "bu dal hiç çalışmıyor" dediği
mutantları bulacaktı, yirmi yedi bulgusunun hiçbiri o değildi, ikisi kuralın yanlış
pozitifi ve gerisi DOM'un etrafına bilerek konmuş korumaydı, yani kuralı açmak o
korumaları silmek olurdu. Bir aracın neyi bulacağı ölçülür, adından okunmaz. Ölçüm
WORKLOG'un 2026-09-12 tarihli araç turu girdisinde.

### 116 · Bir aracın otomatik düzeltmesi bir öneridir, derleyici hakemdir
`no-unnecessary-type-assertion`'ın `--fix`'i dört yerde derlemeyi kırdı ve kırdığı
her yerde haklı olan derleyiciydi: `element.closest?.(...) as HTMLElement | null`
biçiminde kural ile `tsc` çelişiyor, kural iddiayı gereksiz sayıyor ve derleyici
onsuz tipi daraltamıyor. İki kolay çıkışın ikisi de yanlıştı, kuralı susturmak
iddiayı denetimsiz bırakırdı ve düzeltmeyi olduğu gibi kabul etmek derlemeyi
kırardı. Çare aynı şeyi denetlenebilir yazmak oldu: `closest<HTMLElement>(...)`.
Tip argümanı iddianın söylediğini söyler ve onu derleyici denetler, oysa bir `as`
denetlenmez. Bir `--fix` koşusundan sonra `npm run tipler` koşulur, çünkü lint'i
yeşil bir ağaç derlenebilir bir ağaç demek değil.

### 118 · Kendi başlattığın arka plan işi de ölçüm penceresini bozar
Ölçüm turu kart halkasının bedelini ölçerken kendi E2E süitini arka planda
koşturuyordu ve düşen kareyi %60–72 gördü; aynı yama, aynı derleme, sessiz
pencerede %0–1,9 verdi. Aynı gün ikinci kez yaşandı: bir oturumun tip farkında
lint koşusu öteki oturumun kasma sayılarını iki katına çıkardı. Kural "başkası ölçerken bekle" değil, **koşan her
şey sayılır** — kendi başlattığın arka plan işi dahil, ve asıl tehlike orada:
başkasının yükünü fark edersin, kendininkini fark etmezsin. Ölçtüğün sayı senin
olmayan bir yük taşır ve bunu hiçbir şey söylemez. Sessizce düşen bir ölçüm
kırmızıya dönen bir testten beterdir, çünkü kendini bildirmez. İkinci yarısı ölçütte: tek yönlü bir koşu makinenin o anki yüküyle
karışır, A/B dönüşümlü koşulur, ve iz toplamı düşen kareden kararlıdır.

---

## Dizin

| Grup | Tuzaklar |
|---|---|
| Şema göçü ve veri kaybı | 4, 5, 6, 7, 11, 16, 28, 29, 30, 91, 97 |
| Dağıtım kimlikleri, tek kaynak ve sürüm | 32, 66, 69, 72, 73, 77, 78, 93, 95, 106 |
| Çözücü ve kısıt motoru | 21, 22, 26, 27, 75, 76, 98 |
| Sürükleme, saf DOM ve React sınırı | 1, 2, 3, 9, 10, 13, 18, 19, 20, 46, 47, 55, 60, 85, 105, 117 |
| Düzen ölçümü ve hangi kutuya bakıldığı | 33, 34, 36, 37, 38, 39, 41, 48, 50, 61, 64, 70, 82, 100, 102, 107 |
| CSS kapsamı, özgüllük ve custom property | 14, 15, 17, 35, 40, 45, 52, 53, 54, 57, 58, 94, 103, 110 |
| Yazdırma ve kâğıt | 8, 31, 63, 86 |
| Ad çakışması ve erişilebilir ad | 49, 56, 74, 104 |
| Çeviri ve metin | 12, 80, 87, 89, 90 |
| Test hijyeni ve bedava yeşil | 23, 24, 25, 51, 59, 67, 68, 79, 83, 84, 92, 99, 108, 109, 111, 112 |
| Ölçüm disiplini | 42, 65, 81, 101, 113, 114, 115, 116, 118 |

**Çıkarılan numaralar: 43, 44, 62, 71, 88, 96.** Projeye özgü olmayan genel
JavaScript, CSS ve git bilgisiydiler. Tek satırlık hatırlatmaları grup
kurallarında duruyor: 43, 44, 62, 71 ve 96 "Test hijyeni ve bedava yeşil"
grubunda, 88 "Düzen ölçümü" grubunda. Bu numaralar yeniden kullanılmıyor, çünkü eski kayıtlardaki bir atıf yanlış tuzağı gösterirdi. En
büyük kullanılan numara 118, yeni bir tuzak 119'dan devam eder. Test stratejisi
dalı çakışmasın diye kendi numaralarını 150'den başlatıyor.
