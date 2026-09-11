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
| Görüntü | `npm run ekran` | görsel bir değişiklikten sonra, bakmak için |
| Exe ve Rust | `npm run exe:test`, `surum.yml` | sürüm iş akışında, Rust bu depoda kurulu değil |

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
| Duman | `src/App.test.tsx` (jsdom) | bileşenler çiziliyor mu, sekmeler çöküyor mu |
| E2E | `e2e/*.spec.ts`, ana config, `file://` | davranış, erişilebilirlik, kâğıt, çevrimdışı |
| Dil | `src/i18n.test.ts` ve `e2e/dil.spec.ts` | sözlüğün kendisi ve dil makinesi |
| Sürüm | `e2e/surum.spec.ts` | sürümün ve kopyanın ekranda söylenmesi |
| Site, sunucu, klasör | `e2e/{site,sunucu,klasor}.spec.ts` | `file://`'da olmayan her şey, http üstünde |
| Exe | `e2e/exe.spec.ts` | Tauri köprüsünün sayfa tarafı |
| Rust | `src-tauri/src/{lib,update}.rs` | exe'nin dosya ve güncelleme işleri |
| Hata kapanı | `e2e/kapan.ts` | bütün E2E süitinde sayfanın kendi şikayeti |
| Devriye | `e2e/patrol.spec.ts` | iddiasız gezinmede çıkan şikayetler |
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

## Ölçüm yöntemleri

- **Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini `getComputedStyle` ile okur, WCAG kontrast oranını ve CIE Lab ΔE farkını hesaplar. ΔE gerekiyor, çünkü WCAG parlaklık oranı farklı tonlardaki iki koyu rengi eşit sayar. Modern renk sözdizimi sayıya çevrilmeden önce sRGB'ye getirilir (tuzak 81).
- **Mutasyonla sınama.** Bir testin bir şey ölçtüğü, kural bilerek bozulup testin kırmızıya döndüğü görülerek doğrulanır. Mutasyondan önce dosya bir kopyaya alınır ve geri alma o kopyadan yapılır.
- **Derleme çıkış kodu.** Testten önce derleme susturuluyorsa çıkış kodu okunur, yoksa testler bir önceki `dist/`'i ölçer.
- **Kâğıt.** Yazdırma iddiaları PDF üretilip okunarak doğrulanır (MediaBox, üst ve alt bilgi), ve kâğıdı ölçen test pencereyi de kâğıdın boyuna getirir (tuzak 31 ve 86).
