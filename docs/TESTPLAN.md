# Test planı

Hangi test katmanının neyi ölçtüğü ve ne zaman koşulduğu.

## Ne zaman koşar

| Katman | Komut | Ne zaman |
|---|---|---|
| Tipler | `npm run tipler` | her değişiklikten sonra |
| Birim ve duman | `npm test` | her değişiklikten sonra |
| E2E | `npm run test:e2e` | arayüzü, düzeni, sürüklemeyi, baskıyı ya da ekrandaki metni değiştiren bir iş yapıldıysa, ve sürüm çıkarmadan önce |
| Site, sunucu, klasör | `npm run test:site` | teslim yollarına dokunulduysa: `site/`, `kurulum/`, `vite.site.config.ts`, `folder.ts`, `update.ts`, `desktop.ts` |
| Çözücü stresi | `npm run cozucu` | kısıt motoru (`constraints.ts`, `rules.ts`) ya da çözücü değiştiyse |
| Devriye | `npm run patrol` | isteğe bağlı, kırık bir şey aramak için |
| Erişilebilirlik | `npx playwright test e2e/erisim.spec.ts` | ana E2E süitinin içinde, yani her E2E koşusunda |
| Mutasyon | `npm run mutasyon` | her oturumda değil. Saf çekirdeğin testleri değiştiğinde, ve bir sürümden önce bir kez |
| Görüntü | `npm run ekran` | görsel bir değişiklikten sonra, bakmak için |
| Exe ve Rust | `npm run exe:test`, `surum.yml` | sürüm iş akışında, ve Rust'ı olan bir makinede elle |

`npm run kontrol` tipleri, birimi, derlemeyi, E2E'yi, siteyi ve çözücü stresini tek
komutta koşar ve bir sürümden önce kullanılır.

Görsel bir değişiklikten sonra testin yeşil olması yetmez, ekran görüntüsüne de
bakılır (`test-results/ekran/`): çıktıyı göster, iddia etme. Renk, hizalama, tablo
ekseni ve düğme adı yalnız gerçek tarayıcıda görünür, jsdom bunların hiçbirini
görmez.

## Koşulmayan katman yazılır

Bir katman koşulmadıysa [WORKLOG.md](WORKLOG.md)'nin o günkü girdisi bunu sebebiyle
yazar, sessizce atlanmaz. Koşulmamış bir süit yeşil bir süitle aynı şey değil,
bir şey söylemez. Bir koşudan bir bulgu çıktıysa (ürün kusuru ya da test kusuru)
[TESTFINDINGS.md](TESTFINDINGS.md)'ye yazılır.

## Katmanlar

| Katman | Nerede | Kısaca ne yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | saf mantığın doğruluğu |
| Değişmez | `src/invariants.test.ts` | her girdide doğru kalması gereken cümleler, girdileri kütüphane üretir |
| Şema örnekleri | `src/fixtures.test.ts`, `src/fixtures/` | her şema sürümünden bir dosyanın hâlâ açılması |
| Cümle ve iskelet | `src/sentences.test.tsx` | bir listenin tamamı: depo tablosu, ret cümleleri, kâğıdın kutuları |
| Duman | `src/App.test.tsx` (jsdom) | bileşenler çiziliyor mu, sekmeler çöküyor mu |
| E2E | `e2e/*.spec.ts`, ana config, `file://` | davranış, erişilebilirlik, kâğıt, çevrimdışı |
| Dil | `src/i18n.test.ts` ve `e2e/dil.spec.ts` | sözlüğün kendisi ve dil makinesi |
| Sürüm | `e2e/surum.spec.ts` | sürümün ve kopyanın ekranda söylenmesi |
| Site, sunucu, klasör | `e2e/{site,sunucu,klasor}.spec.ts` | `file://`'da olmayan her şey, http üstünde |
| Exe | `e2e/exe.spec.ts` | Tauri köprüsünün sayfa tarafı |
| Rust | `src-tauri/src/{lib,update}.rs` | exe'nin dosya ve güncelleme işleri |
| Hata kapanı | `e2e/kapan.ts` | bütün E2E süitinde sayfanın kendi şikayeti |
| Devriye | `e2e/patrol.spec.ts` | iddiasız gezinmede çıkan şikayetler |
| Erişilebilirlik | `e2e/erisim.spec.ts` | eksik etiket, yanlış rol, atlanan başlık düzeyi, klavyesiz kaydırma |
| Mutasyon | `stryker.config.json` | testlerin kendisi: hangi kural bozulunca hiçbir şey kırmızıya dönmüyor |
| Görüntü | `e2e/ekran.spec.ts` | test değil, bakılacak kanıt |

### Birim

Kısıt mantığı, cascade silme, Excel ayrıştırma, fizibilite, zil saatleri, kural
sınırları, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı,
branş listesi, kapalı saat çakışması. Exe adaptörü: gerçek `saveInto()` onun
üstünde koşar. Plan kitaplığı, anahtarlar, paket zarfı ve dosya adları. Otomatik
dizmenin yasallığı, belirlenimciliği ve tıkanması, `occupy` ile `vacate`'in
`place()`'e eşdeğerliği, dünya matrisi ve denetçinin kendisi. Bir varlığın kendi
haftası ve sayılan gerçekleri, durum özeti, Türkçe katlama, sıralama ve süzme.
Haftanın bloklara bölünüşü ve ızgaradan geri okunuşu. Sürüm numarası, Tauri kimliği,
exe penceresi ve güncelleme adresleri (`surum.test.ts`).

`constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts` ve `blocks.ts`'in her dışa aktarılan fonksiyonunun testi
var ([ARCHITECTURE.md](ARCHITECTURE.md)).

### Değişmez (özellik bazlı)

`src/invariants.test.ts`, fast-check ile. Örnek bazlı bir test "bu girdi bu
çıktıyı verir" der ve bir gerekçesi olan kural için doğru biçimdir. Bir değişmez
"girdi ne olursa olsun bu doğru kalır" der ve örneklerin arasından geçen kusur
için doğru biçimdir. Bu depodaki en pahalı iki kusur ikinci türdendi (tuzak 11 ve
97) ve ikisi de kimsenin sorduğu bir sorunun yanlış cevabı değildi.

Ölçtükleri: çözücünün bıraktığı her ızgaranın `illegalBlocks` denetiminden
geçmesi ve hiçbir dersin borcundan fazla yerleşmemesi, `occupy` ardından
`vacate`'in hem sözlüğü hem indeksin üç haritasını birebir geri vermesi, bir
durumun yazılıp okunmasının sabit nokta olması, `remapDays`'in hangi gün
silinirse silinsin kalanı kendi gününde bırakması ve başa gün eklerken hiçbir
şeyi kaydırmaması, `clampBlocks`'un toplamının haftayı geçmemesi ve çıktısının
girdinin bir alt kümesi olması, `placedBlocks`'un aynı ızgarayı iki kez aynı
okuması ve okuduğu saatlerin ızgaradaki hücre sayısına eşit olması,
`firstFreeColor`'ın en az kullanılan indeksi vermesi.

Dünyalar bilerek küçük (en çok 3 gün, 4 saat, 2 öğretmen): çözücü her üretilen
durumda gerçekten arama yapıyor, ve 25 öğretmen gerektiren bir karşı örnek karşı
örnek değil bir performans testidir.

Ne gördüğü ölçüldü. Çözücünün yasallığını kendi denetçisiyle sormak, denetçinin
`blocker()`'ı çağırması yüzünden `blocker()`'ın içindeki bir mutasyonu göremez
(tuzak 23). Çözücünün kuraldan sapması görünüyor, ama çözücü yasallığı iki kez
denetlediği için ancak ikisi birden bozulunca: tek başına biri bozulduğunda öteki
hâlâ reddediyor.

### Şema örnekleri

`src/fixtures.test.ts` ve `src/fixtures/v1.json` ile `v14.json` arası. Tuzak
97'nin mekanik yarısı. `store.test.ts` zaten sürüm başına bir `describe` tutuyor,
ama o liste elle uzatılıyor: yeni bir sürüm bloğu yazılmadan çıkarılabilir ve süit
yeşil kalır, ki `version === 8` tam olarak böyle unutuldu ve yayınlanmış v2.0.0'ın
yazdığı her yedek okunamaz oldu.

Buradaki döngü sürümleri `SCHEMA_VERSION`'dan türetiyor, yani sabiti artırıp
örnek dosyayı yazmamak adıyla kırmızıya döner. Dosyaların reçetesi
`scripts/sema-ornek.mjs` ve dosyalar **uydurma**: depoda hiç gerçek kullanıcı
yedeği durmadı ve git geçmişinden de çıkmadı, o yüzden her dosya o sürümün
okuyucusu ile yazıcısının anlaştığı şekle göre yazıldı. Betiğin başı bunu ve
tarihlendirilemeyen tek alanı yazıyor.

Her dosya açıldığını değil **ne anlama geldiğini** de söylüyor: dersin şekli
(haftalık saat, bloklar, ikinci branş bayrağı, günlük kutu), ayarların tamamı,
öğretmenin ve sınıfın kutuları, renkler ve program zarfı. Dosya başına bir de
eksik alan bölümü var, çünkü bir alandan eski olan her dosya tam olarak o
dosyadır ve orada olmaması gereken tek şey bir istisna. Örnek dosyalardaki
hiçbir değer programın varsayılanı değil, ve bu bir tercih değil bir koşul:
dosyadaki değer varsayılanla aynıysa, o alanı okuyan okuyucu ile yedeğe düşen
okuyucu aynı cevabı verir ve o alanı ölçen iddia bedava yeşildir.

### Cümle ve iskelet (satır içi anlık görüntü)

`src/sentences.test.tsx`, `toMatchInlineSnapshot` ile. Görsel regresyon bilerek
silinmişti ve geri gelmedi: silinen şey bir resimdi, bu metin. Bir resim farkı
kimsenin okuyamadığı 24 PNG ve her şeyi sessizce kabul eden bir yeniden
temellendirme demek, bir metin farkı bakıp evet ya da hayır denilen bir cümle.
Beklenen değer ayrı bir `.snap` klasöründe değil testin içinde duruyor, yani
değişikliği gözden geçirmekle kodu gözden geçirmek aynı iş.

Yalnız **tamlığın** kendisi bir özellik olduğunda kullanılıyor, çünkü tek bir
iddianın söyleyemeyeceği şey odur: "Veriler nerede" tablosunun her satırı (bir
anahtar yazılıp listeye konmamışken iki kez haftalarca saklandı), `blocker()`'ın
söyleyebileceği ret cümlelerinin hepsi bir arada (kural "her zaman somut", ve bu
kümenin özelliği), Kontrol raporunun cümleleri, ve basılan bir A4 sayfasının
kutu iskeleti.

### Erişilebilirlik taraması

`e2e/erisim.spec.ts`, `@axe-core/playwright` ile, on bir ekranda: yedi sekmenin
altısı, Ayarlar'ın beş bölümü ve boş proje. Renk kontrastı kuralı **kapalı**,
çünkü `renk.spec.ts` onu zaten elle ve daha iyi ölçüyor (WCAG oranı artı CIE Lab
ΔE, ve ΔE'yi bir tarayıcı sormaz).

Yakaladığı şey gözle görülmeyen: etiketi olmayan bir kontrol, elemanıyla çelişen
bir rol, atlanan bir başlık düzeyi, klavyeyle ulaşılamayan bir kaydırma kutusu.
Hiçbiri tek bir pikseli değiştirmiyor, yani ne ekran görüntüsü ne insan gözü
görür.

Sıfır değil bir **taban** tutuyor. İlk koşu gerçek ihlaller buldu ve bir kısmı
bilerek olabilir; her biri okunup karar verilene kadar dosya bilineni yazıyor ve
**yeni** olana kırmızıya dönüyor. Yazıldığı gün kırmızı olan bir tarama okuruna
onu görmezden gelmeyi öğretir. Taban bir izin değil tarihli bir borç, ve
maddeleri [TODO.md](TODO.md) §8e'de.

### Mutasyon

`npm run mutasyon` (Stryker, `stryker.config.json`, koşucunun yapılandırması
`vite.mutasyon.config.ts`). Testleri değil kodu değil,
**testlerin ne ölçtüğünü** ölçer: kaynaktaki bir kuralı bozar ve hiçbir testin
kırmızıya dönmediği yerleri sayar.

Hayatta kalan bir mutant üç şeyden biridir ve listelenirken üçe ayrılır:
**ölçülmeyen davranış** (bir test eksik), **gereksiz kod dalı** (kod hiçbir şey
yapmıyor ve silinebilir), ya da **anlamsız mutant** (değişiklik davranışı gerçekten
değiştirmiyor, örneğin bir sayacın artışı ya da bir sıralama anahtarının önceliği).
Üçüncüsü ayrılmazsa liste kullanılamaz olur, çünkü araç eşdeğer mutant üretir ve
hepsini bir eksik gibi raporlar.

Koşu `src/docs.test.ts`'i dışarıda bırakır ve bu bir muafiyet değil. Belge
kapıları gerçek deponun diskini ölçüyor (her yol, her tanımlayıcı, her bağlantı),
Stryker'ın kum havuzu ise budanmış bir kopya: `dist`, `scratch`, `test-results`
ve bütün görüntüler orada yok. Kapı o kopyada kırmızıya döndüğünde bulduğu şey
bayat bir belge değil eksik bir klasör olur, ve kuru koşu düştüğü için mutasyon
hiç başlamaz. Üstelik bir belge kapısı bir mutantı zaten öldüremez: ölçtüğü şey
kodun davranışı değil, belgenin kodla aynı şeyi söyleyip söylemediği. Kapılar
`npm test` ve `npm run kontrol` içinde her koşuda çalışıyor; buradan çıkan tek
şey, hiçbir mutantı öldüremeyecek bir testin bütün koşuyu durdurma yetkisi.
Ayrım ölçüldü ve iki yapılandırma yan yana koşturuldu: aradaki fark tam olarak o
bir dosya, ne bir test eksik ne bir test fazla. Sayılar WORKLOG'un o günkü
girdisinde.

Yalnız saf çekirdek mutasyona uğruyor (`pure/constraints.ts`, `pure/rules.ts`,
`leaf/blocks.ts`, `pure/parseState.ts`, `pure/undo.ts`, `pure/library.ts`,
`pure/feasibility.ts`, `pure/entities.ts`, `pure/solver.ts`): bütün depoyu ölçmek
pahalı ve bileşenlerin ölçüldüğü yer E2E, ki mutasyon koşucusu onu koşmuyor.
`solver.ts` 2026-09-12'de listeye girdi. Ondan önce yoktu ve sebebi bir tercih
değil bir arızaydı: aracın enstrümantasyonu `classOnDay[g]!++` biçimini
ayrıştıramıyor ve bütün koşuyu düşürüyordu. İki satır `classOnDay[g] =
classOnDay[g]! + 1` olarak yazılınca geçti, davranış birebir aynı kaldı ve
`solver.test.ts` 93/93 durdu.

**Skorun kapsamı her seferinde yazılır.** Kapsamı belirsiz bir mutasyon skoru yüksek
bir sayıyla güven verir ve neyi ölçtüğünü söylemez, ki bu tuzak 23'ün başka bir
kılığıdır. Bir skor yazıldığı yerde hangi dosyaları kapsadığı, hangi süitin
koşturulduğu ve hangi commit'te ölçüldüğü ile birlikte yazılır. Sonuçlar
[TESTFINDINGS.md](TESTFINDINGS.md)'de tarihiyle duruyor.

Bu, bu depoda yıllardır elle yapılan sınamanın otomatik hâli: bir testin bir şey
ölçtüğü, kural bilerek bozulup testin kırmızıya döndüğü görülerek doğrulanıyor.
Elle yapılan iddia başına bir mutasyon, bu ise dosya başına binlerce.

### E2E

`dist/index.html`'i `file://` üzerinden açar, yani babanın çift tıklayacağı dosyanın
kendisini. Sürükle bırak, yapışkan sütun, ekran dışı hedef ve yazdırma taşması
yalnız burada görünür, jsdom'un bir düzeni yok.

Ölçtükleri:

- **Davranış.** Sürükleme, taşıma, sağ tık, kaydırma, geri al zinciri, hata yolları, klavye, sekme gezinmesi, plan geçişi, taslaklar, paket gidiş dönüşü, "Veriler nerede" tablosu, otomatik dizme. Ders dağılımı: seçeneklerin saatten türediği, havuzda blok başına kart, bitişik `2+1`'in iki blok çizildiği ve sağ tıkın doğru parçayı aldığı. İlk kullanım satırının bir kez çıktığı. Komut paleti, varlık paneli, listelerde ara, sırala ve süz, diyalogların ne sorduğu. Yedi şeridin tek iskeleti ve Kontrol şeridinin kapıları (`serit.spec.ts`). Dersler'in ekseni hatırlaması ve odaklanmış modda formun o ekseni sormaması (`dersler.spec.ts`). Hareket ayarının üç basamağı ve makine tercihinin onu ezmesi (`hareket.spec.ts`).
- **Sağ tık ve sabitleme** (`program.spec.ts` 86). Menünün üst kalemleri adlarıyla, boş hücrede açılmaması, sabitlenmiş kartın sürüklenmemesi, Delete'e cevap vermemesi, "Havuza kaldır"ın kapalı olması, `Baştan diz` ve `Programı boşalt`'ın onu yerinde bırakması, yenilemeden sonra durması, ve karttaki raptiye.
- **Havuzun sırası ve süzgeci** (`program.spec.ts` 88). Beş sıra, her sıranın başlıkları, başlıkların saydığı toplamın ekrandakine eşit olması, süzgecin neyi sakladığını söylemesi.
- **Panelden düzenleme** (`panel.spec.ts` 87). Karttan öğretmene ya da sınıfa açılan yol, panelde değişen kısaltmanın ızgarada görünmesi.
- **Erişilebilirlik.** Renk kontrastı ve ayrımı, gün bandının bir durum gibi okunmaması ve iki temada aynı yükte olması, `--on-color` mürekkebi, görünür odak, dar ekranda erişilebilir adın kalması, %150'de üst çubuğun ve şeridin taşmaması.
- **Kâğıt.** Başlık, dikey ortalama, sayfa sayısı, A4 yatay, ekran önizlemesinin süsünün kâğıda sızmaması.
- **Çevrimdışı.** Gömülü fontun gerçekten çizildiği ve ağdan bayt çekilmediği.
- **Metin.** Hiçbir ekranda uzun çizgi olmaması, ayraçların yerinde durması, ipucu satırlarının tavanı (`metin.spec.ts`).
- **İşaret.** `kurulum/icon.ico`'nun dokuz boyu taşıması ve hangi boyların hangi çizimden geldiği (`temel.spec.ts` 79).
- **Kayma.** Şeritte seçenek değiştirmenin ne düğmeleri ne altındaki sayfayı oynatması (`kayma.spec.ts`). Bu dosya kendi tarayıcısını açar, çünkü Playwright'ın varsayılan `--hide-scrollbars`'ı altında ölçülecek bir kaydırma çubuğu yok (tuzak 94).
- **Sığdır'ın exe kutusu** (`gorunum.spec.ts` 45). 1920×1032 ve 1600×968'de haftanın sığması, ve hiçbir kart yazısının, satır başının ve köşedeki eksen adının iki eksende de kırpılmaması, satırın Rahat'takinden uzamaması (tuzak 107).

### Dil

`src/i18n.test.ts` sözlüğün kendisini dört sözlükte birden ölçer: ölü anahtar, yuva
kümesi, dengeli `**`, çoğulun iki biçimi ve uzun çizgi. Beşi de mutasyonla sınandı.
Artı makine: `applyDil()`'in aktif dili kurduğu (yoksa saf modüller Türkçe kalır),
çoğulun kategoriyi `Intl.PluralRules`'tan sorduğu, veri metinlerinin depoda Türkçe
kaldığı. `e2e/dil.spec.ts` beş dilin beşinin de sekmeleri kendi dilinde çizdiğini,
saf modüllerin cümlelerinin de (Kontrol raporu) çevrildiğini ve Türkçenin birebir
geri geldiğini ölçer.

Süitin kalanı `kapan.ts`'te Türkçeye sabitli, yani çevrilmemiş bir metni göremez.
Onu gören şey başka bir dilde bir tarama ve ekrana bakmak (tuzak 89).

### Sürüm

`e2e/surum.spec.ts` (`file://`): Ayarlar → Hakkında'nın hangi sürüm ve hangi kopya
olduğunu söylemesi, "kendini güncellemez" cümlesi ve adres, sürümü göstermek için
ağa çıkılmaması, güncelleme şeridinin davetsiz çıkmaması.

### Site, sunucu, klasör

`npm run test:site` üç dosyayı http üstünde koşar, çünkü üçü de `file://` altında
olmayan bir şeyi ölçüyor: service worker, gerçek bir köken ve Dosya Sistemi Erişimi.
Ölçtükleri: manifest ve simgeler, service worker kaydı, bağlantı kesilince açılma,
çevrimdışı girilen verinin durması, site derlemesinin `file://` derlemesine
sızmaması. Güncellemenin kendisi de burada: önbellek adının sürümü taşıması, ve
`sw.js` diskte değişince açık duran sayfada şeridin çıkması, hiçbir şey
değişmemişken çıkmaması. İkisi de mutasyonla denendi.

### Exe

`e2e/exe.spec.ts` (`file://`) Tauri köprüsünü sayfada taklit eder, yani bir postane:
davranışın asıl tarafı `cargo test`. Ölçtükleri: hiçbir tıklama olmadan yazım,
klasör seçicinin çizilmemesi, "Veriler nerede"nin exe'de başka bir şey söylemesi,
köprü yokken aynı dosyanın bir tarayıcı sayfası olarak kalması. Güncellemede:
hiçbir şey sorulmadan ağa çıkılmaması (panel çizilmiş olsa bile `check_update`
çağrılmaz), üç cevabın üç ayrı cümle yazması, indirmenin yeniden başlatmaması,
internet yokken programın çalışmaya devam etmesi.

### Rust

`npm run exe:test` (`cargo test`): `safe_name` kapısı, atomik yazımın geçici dosya
bırakmaması, listenin yabancı dosyaları da göstermesi. Güncellemede: `is_newer`'ın
`1.10 > 1.9` bildiği, inen dosyanın `MZ` ile başladığı ve boyutunun tuttuğu,
adresin yalnız bu deponun Release öneklerinden olabildiği, takas yarıda kalırsa
eski programın yerine geri konduğu. Rust her makinede kurulu olmadığı için
`kontrol`'ün parçası değil, `surum.yml`'de koşuyor.

### Hata kapanı

`e2e/kapan.ts` bütün E2E süitini sarar (`auto: true`, yani unutulamaz). Test ne
ölçerse ölçsün sayfanın kendi şikayetini dinler: `console.error`, `pageerror`,
yakalanmamış promise reddi, ve `file://` altında herhangi bir ağ isteği. Bir
testin beklediği hata `beklenenHata()` ile adıyla serbest bırakılır: susturmak için
değil, beklendiğini söylemek için.

### Devriye

`npm run patrol` iddia etmez, gezer: yedi sekme, listeler, bölümler ve şeritteki her
düğme, artı üç tohumla rastgele gezinme (tohum test adında yazılı, yani kırmızı bir
koşu tekrarlanabilir). Kapan onu da sarar, yani bulduğu şey "sayfa şunu bastı"
olur. Kırılınca ekran görüntüsü, video ve trace bırakır. Yakaladığı her şey zaten
kapan üstünden bütün süitte de yakalanıyor, farkı iddiasız gezinmesi (tuzak 79).

### Görüntü

`npm run ekran` iki temada ekran görüntüleri üretir. Test değil kanıt: görüntüyü
almadan önce sayfanın hareketi biter (tuzak 59), ve tek iddiası çekildiğinde
perdenin inmiş olması.

## E2E ortamı

- **Pencere.** Varsayılan viewport 1920×1080. Exe büyütülmüş pencerede ve Windows ölçeğinde daha dar bir kutuda koşabilir, o yüzden Sığdır'ın düzeni ayrıca 1600×968'de ölçülüyor (tuzak 107).
- **Paralellik.** `fullyParallel: true`, dört işçi. `file://` altında her Playwright context'inin kendi localStorage'ı var, paralel testler birbirinin verisini görmüyor. Bu ölçülerek doğrulandı.
- **Dil.** `kapan.ts` ilk yüklemede dili Türkçeye sabitler.
- **Gizli sekmeler.** Program sekmesi React'in `<Activity>`'si içinde, gizliyken DOM'da kalıyor. Bir ekranın ne dediğini soran test `e2e/helpers.ts`'teki `onScreen()` ile hangi ekran olduğunu söyler (tuzak 104).
- **Beklemeler.** Depoya yazılanı okumadan önce sayfanın ne yazdığı beklenir (`settledText()`, tuzak 24 ve 51). Bir düzeni ya da boyanmış bir değeri okumadan önce hareketin bitmesi beklenir (`settledMotion()`, tuzak 59 ve 99).
- **Kaydırma çubukları.** Playwright Chromium'u `--hide-scrollbars` ile açar, bir çubuğun yer kapladığını ölçen test kendi tarayıcısını açar (tuzak 94).

## Sahte veri

Sahte veri tek yerde: `src/worlds.ts`. `makeWorld()` küçük bir okul kurar,
`illegalBlocks()` dizilmiş bir programı denetler, `WORLDS` hazır senaryoları tutar.
`solver.test.ts`, `kontrol.spec.ts` ve `otomatik-dunyalar.spec.ts` aynı üreteci
kullanır. Denetçinin kendisi `worlds.test.ts`'te bilerek bozuk ızgaralarla sınanır,
ve her dünya testi kaydedilen yerleşim sayısının girişten büyük olduğunu ayrıca
iddia eder (tuzak 23).

Sahte olmayan tek veri `src/fixtures/tam-dolu-kurs.json`: babanın planı,
öğretmen adları "Öğretmen N" yapılmış ve ızgarası boşaltılmış. Şema örneklerinin
yanında duruyor ama onlardan değil, `fixtures.test.ts` yalnız sürüm numaralı
dosyaları (`v1.json` ile `v14.json` arası) okuyor. `solver.test.ts` onu iki soruyla kullanır: olduğu gibi kurulamadığını
dürüstçe söylemesi, ve Roboders'in açık saatleriyle tamamını dizmesi (tuzak 122,
125). Gerçek adların depoya girmemesi kural: dosya yenilenirse adlar yeniden
silinir.

## Ölçüm yöntemleri

- **Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini `getComputedStyle` ile okur, WCAG kontrast oranını ve CIE Lab ΔE farkını hesaplar. ΔE gerekiyor, çünkü WCAG parlaklık oranı farklı tonlardaki iki koyu rengi eşit sayar. Modern renk sözdizimi sayıya çevrilmeden önce sRGB'ye getirilir (tuzak 81).
- **Mutasyonla sınama.** Bir testin bir şey ölçtüğü, kural bilerek bozulup testin kırmızıya döndüğü görülerek doğrulanır. Mutasyondan önce dosya bir kopyaya alınır ve geri alma o kopyadan yapılır.
- **Derleme çıkış kodu.** Testten önce derleme susturuluyorsa çıkış kodu okunur, yoksa testler bir önceki `dist/`'i ölçer.
- **Kâğıt.** Yazdırma iddiaları PDF üretilip okunarak doğrulanır (MediaBox, üst ve alt bilgi), ve kâğıdı ölçen test pencereyi de kâğıdın boyuna getirir (tuzak 31 ve 86).
