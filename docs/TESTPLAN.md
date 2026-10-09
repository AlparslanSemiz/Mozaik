# Test planı

Hangi test katmanının neyi ölçtüğü ve ne zaman koşulduğu.

## Ne zaman koşar

| Katman | Komut | Ne zaman |
|---|---|---|
| Tipler | `npm run tipler` | her değişiklikten sonra |
| Hızlı | `npm run hizli` | her commit'ten önce, dokunulan test dosyalarıyla birlikte |
| Birim ve duman | `npm test` | birleşmeden önce, ve `hizli`'nin dışarıda bıraktığı dört dosyaya ya da onların ölçtüğü çözücüye ve öneri aramasına dokunulduysa |
| E2E | `npm run test:e2e` | arayüzü, düzeni, sürüklemeyi, baskıyı ya da ekrandaki metni değiştiren bir iş yapıldıysa, ve sürüm çıkarmadan önce |
| Site, sunucu, klasör | `npm run test:site` | teslim yollarına dokunulduysa: `site/`, `kurulum/`, `vite.site.config.ts`, `folder.ts`, `update.ts`, `desktop.ts` |
| Çözücü stresi | `npm run cozucu` | kısıt motoru (`constraints.ts`, `rules.ts`) ya da çözücü değiştiyse |
| Devriye | `npm run patrol` | isteğe bağlı, kırık bir şey aramak için |
| Erişilebilirlik | `npx playwright test e2e/erisim.spec.ts` | ana E2E süitinin içinde, yani her E2E koşusunda |
| WebKit | `npm run test:webkit` | `kontrol`'ün ve CI'ın parçası değil, ve olmayacak: Linux yolu Chromium uygulama modu olacak, babanınki WebView2 (DECISIONS 2026-10-09). Ana E2E süitini Playwright'ın WebKit'inde koşar; Chromium'a özgü testler kendini atlar. Bu Fedora makinesinde Playwright'ın kabında koşar (aşağıda, "WebKit") |
| Mutasyon | `npm run mutasyon` | her oturumda değil. Saf çekirdeğin testleri değiştiğinde, ve bir sürümden önce bir kez. `haftalik.yml` haftada bir koşar |
| Görüntü | `npm run ekran` | görsel bir değişiklikten sonra, bakmak için |
| Kapsam | `npm run kapsam` | elle; bir harita, kapı değil: eşiği yok ve `kontrol`'e girmiyor (gerekçesi `vite.config.ts`'te) |
| Exe ve Rust | `npm run exe:test`, `surum.yml` | sürüm iş akışında, ve Rust'ı olan bir makinede elle |
| CI | `.github/workflows/ci.yml` | her dala her push'ta: tipler, sınır, lint, knip, biçim, birim ve belge kapısı, derleme, boyut, ana E2E (üç parça, ve öneri aramasını başlatan ve `@arama` etiketini taşıyan testler kendi işinde, her biri ayrı bir runner'da), site, sunucu, klasör ve çözücü stresi. Site yalnız hepsi yeşil bir `main` push'unda yayınlanır |
| Windows | `.github/workflows/windows.yml` | her `main` push'unda, haftalık koşuda ve elle: Windows'ta ana E2E (Chromium ya da `msedge` kanalı), öneri aramasının `@arama` etiketli testleri ayrı adımda sırayla. Siteyi kilitlemez; `npm run yayinla` etiketi onun da yeşilini bekler |
| Haftalık | `.github/workflows/haftalik.yml` | Pazartesi 01:00 UTC ve elle: mutasyon, ve `windows.yml`'i çağırır. Siteyi kilitlemez |
| Kanarya | `.github/workflows/kanarya.yml` | Salı 02:00 UTC ve elle: denetim ve ana E2E'nin bir parçası runner'ın bir sonraki imajında (bugün `ubuntu-26.04`). Hiçbir şeyi kilitlemez; iki hafta yeşil kalınca `ci.yml`'in sabit sürümü ona çekilir |
| Gerçek exe | `npm run exe:e2e` | `src-tauri/`, `desktop.ts`, `folder.ts` ya da güncelleme değiştiyse, ve bir sürümden önce, Linux geliştirme makinesinde |

`npm run kontrol` tipleri, birimi, derlemeyi, E2E'yi, siteyi ve çözücü stresini tek
komutta koşar ve bir sürümden önce kullanılır.

**WebKit (2026-10-09'dan beri).** Playwright'ın WebKit'i resmî olarak yalnız Ubuntu ve
Debian için derleniyor; bu Fedora makinesinde Ubuntu 24.04'ün `libicu74` ve
`libjpeg-turbo8`'i eksik. Sisteme paket kurulmuyor, komut Playwright'ın aynı sürümlü
kabında koşturuluyor (SELinux etiketini değiştirmemek için `label=disable`, `:Z` değil):

```bash
npx vite build
podman run --rm --userns=keep-id --ipc=host --security-opt label=disable \
  -e HOME=/tmp -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.62.1-noble \
  npx playwright test --config playwright.webkit.config.ts
```

**CI (2026-10-08'den beri).** `main`'e push edilir, CI koşarken sıradaki işe
geçilir, sonuç `gh run view` ile okunur. `main` kırmızıysa başka işe geçmeden önce
o düzeltilir. CI'da `retries` yok: bir kırmızı tekrarla gizlenmez. Düşen bir E2E
işi düşen testleri bir kez daha koşar (`scripts/kararsiz.mjs`) ve tekrarda geçenleri
"kararsız", yine düşenleri "kırmızı" diye yalnız iş özetine yazar; iş her iki
durumda da kırmızı kalır. Kararsız çıkan bir test TESTFINDINGS'e yazılır. CI'ın
runner'ı UTC'de koşar, yani saat dilimine dayanan bir test oradan kendi dilimini
kurar (`src/folder.test.ts`).

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
| Gerçek exe | `e2e/gercek-exe.spec.ts`, `playwright.gercek-exe.config.ts` | Linux ikilisinin kendisi: pencere, Rust komutları, gerçek disk |
| Rust | `src-tauri/src/{lib,update}.rs` | exe'nin dosya ve güncelleme işleri |
| Hata kapanı | `e2e/kapan.ts` | bütün E2E süitinde sayfanın kendi şikayeti |
| Devriye | `e2e/patrol.spec.ts` | iddiasız gezinmede çıkan şikayetler |
| Erişilebilirlik | `e2e/erisim.spec.ts` | eksik etiket, yanlış rol, atlanan başlık düzeyi, klavyesiz kaydırma |
| Mutasyon | `stryker.config.json` | testlerin kendisi: hangi kural bozulunca hiçbir şey kırmızıya dönmüyor |
| Görüntü | `e2e/ekran.spec.ts` | test değil, bakılacak kanıt |
| Kapsam | `vite.config.ts`'in `coverage` listesi, mutasyonla aynı dosyalar | hiç koşmayan satır; koşup ölçülmeyeni mutasyon görür |

### Hızlı

`npm run hizli`, birim süitinin dört yavaş dosyası dışarıda: `relaxFullCourse.test.ts`,
`relaxLaidOut.test.ts`, `invariants.test.ts` ve `solver.test.ts`. Seçim CI'ın dosya
sürelerinden: bu dördü birim işinin süresinin neredeyse tamamı, geri kalan her dosya
birkaç saniyenin altında. Belge kapısı içeride.

Gördüğü: öneri aramasının küçük dünyalardaki bütün iddiaları (`relax.test.ts`, RF2'nin
iki sınır testi dahil), kısıt motoru, şema göçü, depo, belgeler. Öneri aramasının bilinen
sekiz mutasyonunun (refactor analizinin M1–M8'i) sekizi de onda kırmızı (WORKLOG
2026-10-09, hız oturumu).

Görmediği: babanın verisi (önerinin CP-SAT'ın en iyisine ulaşması, dizili haftada
"Olmaz", çözücünün tam dolu kursu), çözücünün gerçek ölçekteki davranışı, ve fast-check
değişmezlerinin hepsi (çözücünün yasallığı, `occupy` ile `vacate`, `parseState`'in sabit
noktası, `remapDays`, `clampBlocks`, `placedBlocks`, palet, kurulamayan haftaya öneri).
Bu yüzden tam `npm test` birleşmeden önce koşar, ve bu dosyaların ölçtüğü koda dokunan
bir iş onları commit'ten önce de koşar.

### Birim

Kısıt mantığı, cascade silme, Excel ayrıştırma, fizibilite, zil saatleri, kural
sınırları, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı,
branş listesi, kapalı saat çakışması. Exe adaptörü: gerçek `saveInto()` onun
üstünde koşar. Plan kitaplığı, anahtarlar, paket zarfı ve dosya adları. Otomatik
dizmenin yasallığı, belirlenimciliği ve tıkanması, `occupy` ile `vacate`'in
`place()`'e eşdeğerliği, dünya matrisi ve denetçinin kendisi. Bir varlığın kendi
haftası ve sayılan gerçekleri, durum özeti, Türkçe katlama, sıralama ve süzme.
Haftanın bloklara bölünüşü ve ızgaradan geri okunuşu. Sürüm numarası, Tauri kimliği,
exe penceresi, exe köprüsünün `withGlobalTauri` bayrağı ve güncelleme adresleri
(`surum.test.ts`).

`constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts`, `relax.ts`, `sat.ts` ve `blocks.ts`'in her dışa aktarılan
fonksiyonunun testi var ([ARCHITECTURE.md](ARCHITECTURE.md)). `sat.test.ts` SAT
çözücüyü bin küçük rastgele formülde bütün atamaları deneyen bir kaba kuvvetle
karşılaştırır: ikili ve uzun cümleler, sonradan eklenen cümleler ve varsayımlar.

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
`firstFreeColor`'ın en az kullanılan indeksi vermesi, ve kurulamayan bir haftaya
verilen her önerinin denetimden geçmesi ve hiçbir sınıf ya da derslik saati
açmaması (kapalı saatli rastgele dünyalar; kaç önerinin denetlendiği sayılır, sıfır
bedava yeşil olurdu).

Dünyalar bilerek küçük (en çok 3 gün, 4 saat, 2 öğretmen): çözücü her üretilen
durumda gerçekten arama yapıyor, ve 25 öğretmen gerektiren bir karşı örnek karşı
örnek değil bir performans testidir. Üreteç ara sıra iki günlük sınırı (günde en
fazla ve art arda en fazla) Engelle'de ve iki ders arasında bir "aynı gün olmasın"
ilişkisi de kurar, çünkü onlarsız çözücünün yasallığı hiçbir sınırın ve ilişkinin
bağlamadığı dünyalarda soruluyordu. Her özellik çözücüyü koşturduğu için dosyanın
kendi zaman sınırı var, Vitest'in varsayılanı değil: yavaş bir profilde tek bir
özellik o sınırı aşıyordu.

Ne gördüğü ölçüldü. Çözücünün yasallığını kendi denetçisiyle sormak, denetçinin
`blocker()`'ı çağırması yüzünden `blocker()`'ın içindeki bir mutasyonu göremez
(tuzak 23). Çözücünün kuraldan sapması görünüyor, ama çözücü yasallığı iki kez
denetlediği için ancak ikisi birden bozulunca: tek başına biri bozulduğunda öteki
hâlâ reddediyor. Çözücünün `blocker()`'a sorduğu dört yerin dördünde ilişkileri
boşaltan ya da iki sınırı sıfırlayan mutasyon eski üreteçte yeşil, genişleyen
üreteçte kırmızı (2026-10-08).

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
`solver.test.ts` 93/93 durdu. Biçim 2026-09-24'te (`8794c95`) `weight[index]!++` ile
geri girdi ve mutasyon 2026-10-09'a kadar koşamadı; o günden beri `npm run lint`
(`no-restricted-syntax`) `x!++`'yı ve `x!--`'yi CI'ın `denetim` işinde reddediyor (tuzak 147).
Aynı commit'in getirdiği iki engel daha `vite.mutasyon.config.ts`'te ve
`stryker.config.json`'da: enstrümante kod yavaş olduğu için bir testin süre tavanı ve
ilk koşunun tavanı yükseltildi, ikisi de varsayılanı aşmıştı (ölçümler TESTFINDINGS'te,
2026-10-09).
Kum havuzu `scratch/mutasyon-tmp`'de, çünkü bir Playwright koşusu `test-results/`'u
boşaltır (tuzak 131).

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
- **Program sekmesi gizlenir, sökülmez** (`program.spec.ts` 92). Başka sekmeye gidip dönünce ızgaranın tablosu aynı DOM düğümü, yani `App.tsx`'teki `<Activity>` ızgarayı yeniden kurdurmuyor (tuzak 18, 104).
- **Havuzun sırası ve süzgeci** (`program.spec.ts` 88). Beş sıra, her sıranın başlıkları, başlıkların saydığı toplamın ekrandakine eşit olması, süzgecin neyi sakladığını söylemesi.
- **Panelden düzenleme** (`panel.spec.ts` 87). Karttan öğretmene ya da sınıfa açılan yol, panelde değişen kısaltmanın ızgarada görünmesi.
- **Erişilebilirlik.** Renk kontrastı ve ayrımı, gün bandının bir durum gibi okunmaması ve iki temada aynı yükte olması, `--on-color` mürekkebi, görünür odak, dar ekranda erişilebilir adın kalması, %150'de üst çubuğun ve şeridin taşmaması.
- **Kâğıt.** Başlık, dikey ortalama, sayfa sayısı, A4 yatay, ekran önizlemesinin süsünün kâğıda sızmaması.
- **Çevrimdışı.** Gömülü fontun gerçekten çizildiği ve ağdan bayt çekilmediği.
- **Öneri aramasının worker'ı** (`temel.spec.ts` 91, `otomatik.spec.ts`). Derlenmiş dosyanın satır içi modül betiği klasik bir betik olarak derleniyor (`node:vm` ile, düzenli ifadeyle değil), ve küçük bir dünyada arama bitince `data-oneri-isci` sıfırdan büyük, yani arama ana iş parçacığına düşmedi (tuzak 136).
- **Metin.** Hiçbir ekranda uzun çizgi olmaması, ayraçların yerinde durması, ipucu satırlarının tavanı (`metin.spec.ts`).
- **İşaret.** `kurulum/icon.ico`'nun dokuz boyu taşıması ve hangi boyların hangi çizimden geldiği (`temel.spec.ts` 79).
- **Roboders koruması** (`roboders-koruma.spec.ts`). `scripts/roboders/koruma.mjs`'in Roboders'e gitmeden önce yerel bir sunucuya karşı kanıtı: GET dışında hiçbir istek, hiçbir WebSocket ve adresinde yazan kelime taşıyan hiçbir GET sunucuya ulaşmıyor, ve sayfadan çıkarken giden istek de ulaşmıyor (tuzak 144). Yargıç sunucunun sayacı, sayfanın kendi gördüğü değil, ve bir kontrol GET'inin ulaştığı da soruluyor. Tıklama kuralı gerçek bir DOM'da sınanıyor. Aynı koruma Eyotek ayarıyla da sınanıyor: Eyotek'in ek yazan kelimeleri, zorunlu `--alan` ve alanın ağda tutulması. Deneme sayfalarındaki her işaretin korumadan geçtiği de soruluyor, yoksa "tıklanmadı" bedava geçerdi. Her Roboders ve Eyotek turundan önce ayrıca koşulur.
- **Kapanırken bekleyen kayıt** (`kapanis.spec.ts` 93). 400 ms'lik erteleme dolmadan kapanan sekmenin son değişikliği depoda kalıyor, yani `beforeunload` flush'ı yazıyor. Sayfanın saati durdurulur ve testin önce erteleme yazımının beklediğini doğrulaması gerekir; saat durmadan bu yarış hızlı bir makinede flush'a hiç uğramadan geçerdi.
- **Kayma.** Şeritte seçenek değiştirmenin ne düğmeleri ne altındaki sayfayı oynatması (`kayma.spec.ts`). Bu dosya kendi tarayıcısını açar, çünkü Playwright'ın varsayılan `--hide-scrollbars`'ı altında ölçülecek bir kaydırma çubuğu yok (tuzak 94).
- **Sığdır'ın exe kutusu** (`gorunum.spec.ts` 45). 1920×1032 ve 1600×968'de haftanın sığması, ve hiçbir kart yazısının, satır başının ve köşedeki eksen adının iki eksende de kırpılmaması, satırın Rahat'takinden uzamaması, kart satırının satır kutusunun Rahat'takiyle aynı kalması (tuzak 107).
- **Sığdır babanın verisinde ve Windows %125'te** (`gorunum.spec.ts` 45b). Adsız dizili fikstür 1920×1080 ve 1536×816 (DPR 1,25) kutularında, iki görünümde; örnek okul 1536'da. Kırpılan kart sayısının tavanı, satır başlarının sıfırı, 9 px taban, küçültmenin tablonun boyunu değiştirmemesi, ve kartın tam adı söylemesi. Kırpılma yazının ve kutunun kesirli genişliğiyle sayılır, `clientWidth` ile değil (tuzak 140). Aynı grupta sürüklemenin yazdığı çubuğun yerleşimi Sığdır'da Rahat'takine oranla ölçülür (tuzak 141).

### Dil

`src/i18n.test.ts` sözlüğün kendisini dört sözlükte birden ölçer: ölü anahtar, yuva
kümesi, dengeli `**`, çoğulun iki biçimi ve uzun çizgi. Beşi de mutasyonla sınandı.
Artı makine: `applyDil()`'in aktif dili kurduğu (yoksa saf modüller Türkçe kalır),
çoğulun kategoriyi `Intl.PluralRules`'tan sorduğu, veri metinlerinin depoda Türkçe
kaldığı. Kısaltma tablosunun (`lang/kisaltmalar.ts`) her yerleşik kısaltmayı dört dilde
taşıdığı ve bir kısaltmanın aynı yazılan bir cümleye düşmediği (Kimya "Who" değil). `e2e/dil.spec.ts` beş dilin beşinin de sekmeleri kendi dilinde çizdiğini,
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
değişmemişken çıkmaması. İkisi de mutasyonla denendi. Klasörün kapanış yarısı bir
BİLİNEN KUSUR'u sabitliyor (TODO TB7): 2 s'lik yazım dolmadan kapanan sekmenin
değişikliği klasöre inmiyor, depoya iniyor.

Sunucunun portu klasörün kendisinin (`e2e/sitePort.ts`): `MOZAIK_SITE_PORT` verilmişse o,
CI'da 4173, yerelde klasörün gerçek yolundan türeyen bir port. Açık bir sunucu yeniden
kullanılmaz, ve `e2e/siteIdentity.ts` testlerden önce sunulan `index.html`'i bu klasörün
`dist-site/index.html`'iyle bayt bayt karşılaştırır. İkisi de olmadan iki worktree'nin
site süiti aynı porttaki tek sunucuyu, yani birinin derlemesini test edebiliyordu.

### Exe

`e2e/exe.spec.ts` (`file://`) Tauri köprüsünü sayfada taklit eder, yani bir postane:
davranışın asıl tarafı `cargo test`. Ölçtükleri: hiçbir tıklama olmadan yazım,
klasör seçicinin çizilmemesi, "Veriler nerede"nin exe'de başka bir şey söylemesi,
köprü yokken aynı dosyanın bir tarayıcı sayfası olarak kalması. Güncellemede:
hiçbir şey sorulmadan ağa çıkılmaması (panel çizilmiş olsa bile `check_update`
çağrılmaz), üç cevabın üç ayrı cümle yazması, indirmenin yeniden başlatmaması,
internet yokken programın çalışmaya devam etmesi.

### Gerçek exe

`npm run exe:e2e` Linux ikilisini derler ve `e2e/gercek-exe.spec.ts`'i ona karşı
koşar. Playwright burada yalnız koşucu, tarayıcı açmaz: her test programı
`tauri-driver` ile açar ve WebDriver üstünden sürer (`scripts/webdriver.mjs`).
Yukarıdaki taklidin arkasında duran şeyi ölçer: pencerenin açıldığı ve Rust
köprüsünün orada olduğu, `data_dir_path`'in gerçek yeri söylediği, otomatik
kaydın gerçek bir klasöre gerçek dosya yazdığı, örnek okulun dizildiği, Linux
kopyasının kendini güncellemeyi reddettiği ve Hakkında'da bunu söylediği, bir dersi
sabitlemenin sayfayı çökertmediği (tuzak 130), "Dosyaya kaydet"in İndirilenler'e
yazdığı (tuzak 132), kurulamayan haftada öneri aramasının worker'larda koşup bir yolu
uyguladığı ve Ctrl+Z'nin onu geri aldığı, "Dosyadan aç"ın bir yedeği okuduğu, ve Sığdır'da gerekçe çubuğuna
sürüklemenin hızında yazmanın kare düşürmediği (tuzak 141). Güncelleme reddi
mutasyonla sınandı: ret kaldırılınca kopya GitHub'dan Windows exe'sini indirdi ve
test kırmızıya döndü. Sabitleme testi düzeltmesiz ikiliye karşı kırmızıydı.

Ölçmedikleri: GTK'nın dosya seçme penceresi (WebDriver oturumunda açılmaz, tuzak
133; otomasyonsuz açılışta açıldığı elle görüldü) ve yazdırmanın kâğıda ya da
PDF'e dökümü (Yazdır'ın GTK penceresini açtığı elle görüldü).

İki kural: her test kendi sahte ev dizininde açılır, çünkü programın yazdığı
Belgeler klasörü bu makinede babanın gerçek verisini tutuyor. Sahte ev gerçek
evin programa değen her klasörünü kurar, yoksa eksik bir klasör ürün kusuru gibi
görünür (tuzak 132). Ve tıklama, tuş
ve sürükleme sayfanın içinde olay olarak üretilir, çünkü bu makinenin
WebKitGTK'sı WebDriver'ın girdi benzetimini desteklemiyor (tuzak 127). Yani bu
süit bir pencerenin gerçek fareye nasıl cevap verdiğini değil, gerçek programın
sayfasının, köprüsünün ve diskinin çalıştığını ölçer.

Windows'taki `Mozaik.exe`'yi (WebView2) ölçmez, o hâlâ babanın makinesinde
görülmeyi bekliyor.

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

## Planlanan katmanlar

Test programının (2026-10-09, [TODO.md](TODO.md) §8l) ekleyeceği katmanlar. Henüz yok: bir
katman yazıldığı commit'te bu tablodan çıkar, yukarıdaki iki tabloya ve kendi bölümüne
girer. "Yavaş" diye işaretli olanlar push'u, birleştirmeyi ve sürümü beklemez, gece ya da
haftalık arka planda koşar (CLAUDE.md).

| Katman | TP | Ne yakalayacak | Ne zaman koşacak |
|---|---|---|---|
| Fuzz | TP4 | dosya okuyucularının bozuk girdide istisna atması ya da yarım plan kabul etmesi | `npm test`'te kısa, gece uzun |
| Gerçek exe, Windows | TP7 | WebView2'de exe'nin kendisi: pencere, köprü, Belgeler | yavaş: haftalık, ve köprüye dokunan bir `main` push'u |
| Sürüm yükseltme | TP8 | eski exe'den yenisine takasta verinin kalması | yavaş, haftalık |
| Kontrat | TP9, TP10 | Rust komutları ile köprünün ve taklidin, `surum.yml` ile `update.rs`'in ayrışması | `npm test` |
| Rust, Linux | TP11 | `cargo test` her push'ta | CI |
| Brave | TP12 | Brave'de `file://` açılışı ve kalıcılık | yerel, elle |
| Uzun süre açık kalma | TP13 | sürükle ve geri al döngüsünde büyüyen yığın ve DOM | yavaş, gece |
| Zayıf makine vekili | TP14 | öneri aramasının bellek tepesi, az çekirdekte süre; babanın makinesinin cevabı değil | yerel, temiz koşul |
| Performans | TP15 | iş sayaçlı eşikler (ana E2E); süre eşikleri yalnız temiz koşulda | sayaçlar E2E'de, süreler elle |
| Güvenlik | TP16, TP17 | `dist`'e giren bağımlılıkta açık; içe aktarılan adlarda betik ve HTML | CI, E2E |
| Metin bütçesi | TP18 | ekran başına kelime ve diyalog başına soru, tabana karşı | ana E2E |
| Kabul | TP19 | babanın işlerinde tık ve soru sayısı, tabana karşı | ana E2E |
| Bileşen | TP20 | girdi bileşenlerinin sınır durumları, gerçek tarayıcıda | `npm test`'in yanında |
| Kapsam tabanı | TP24 | dosya başına satır yüzdesinin düşmesi | gece |
| Gerileme kapısı | TP26 | testi olmayan ürün kusuru kaydı | belge kapısı |
| Görsel regresyon | TP27 | yedi sekmenin iki temadaki düzeni, kapta, sıfır eşik | yavaş, haftalık |

## E2E ortamı

- **Pencere.** Varsayılan viewport 1920×1080. Exe büyütülmüş pencerede ve Windows ölçeğinde daha dar bir kutuda koşabilir, o yüzden Sığdır'ın düzeni ayrıca 1600×968'de ölçülüyor (tuzak 107).
- **Paralellik.** `fullyParallel: true`, dört işçi. `file://` altında her Playwright context'inin kendi localStorage'ı var, paralel testler birbirinin verisini görmüyor. Bu ölçülerek doğrulandı.
- **Dil.** `kapan.ts` ilk yüklemede dili Türkçeye sabitler.
- **Gizli sekmeler.** Program sekmesi React'in `<Activity>`'si içinde, gizliyken DOM'da kalıyor. Bir ekranın ne dediğini soran test `e2e/helpers.ts`'teki `onScreen()` ile hangi ekran olduğunu söyler (tuzak 104).
- **Beklemeler.** Depoya yazılanı okumadan önce sayfanın ne yazdığı beklenir (`settledText()`, tuzak 24 ve 51). Bir düzeni ya da boyanmış bir değeri okumadan önce hareketin bitmesi beklenir (`settledMotion()`, tuzak 59 ve 99).
- **Kaydırma çubukları.** Playwright Chromium'u `--hide-scrollbars` ile açar, bir çubuğun yer kapladığını ölçen test kendi tarayıcısını açar (tuzak 94).

## Test edilemeyenler

Hangi platformun neyle sınandığı ve neden yetmediği. Yeşil bir süit bu satırların
hiçbirini kapatmaz. Bir satır kapandığında buradan çıkar ve neyle kapandığı yazılır.

| Ne | Bugün neyle sınanıyor | Neden yetmiyor |
|---|---|---|
| Babanın exe'si: Windows 10, WebView2 | köprünün taklidi (`e2e/exe.spec.ts`), Rust'ın saf kısmı (`npm run exe:test`) | WebView2 Linux'ta yok. `windows.yml` ana E2E'yi Windows'ta Chromium'la ya da Edge'le koşuyor (her `main` push'unda ve haftalık, ilk koşusu 2026-10-09, TESTFINDINGS), ama exe'nin kendisini değil. Exe'nin babanın makinesinde açıldığı biliniyor (tuzak 106), davranışı görülmedi |
| Babanın makinesi: 4 GB RAM, eski işlemci | işlemcinin 4 kat yavaşlatılması ([WORKLOG.md](WORKLOG.md)) | bellek sınırı taklit edilmiyor, ve o makinede ölçüm yok ([TODO.md](TODO.md) §8b) |
| Windows ekran ölçeği | `e2e/gorunum.spec.ts`'te 1920 ve "Windows %125" kutuları | babanın ölçeği %100 (2026-10-09, kesin). Babanın ayarı programa göre değiştirilmez: program %100'de de %125'te de düzgün görünmeli, %125 kutuları korunur. Süitin geri kalanı yalnız 1920×1080'de koşuyor |
| Edge, WebView2, Brave | Playwright'ın Chromium'u | aynı Blink motoru, ama sürüm, politika ve font farkı var |
| Safari ve WebKitGTK | `npm run test:webkit` (Playwright'ın WebKit'i, 2026-10-09'dan beri; 618'in 19'u kırmızı, TESTFINDINGS) | Playwright'ın WebKit'i, WebKitGTK ve Safari aynı ailenin üç ayrı portu, birinin geçmesi ötekini kanıtlamaz |
| Linux ikilisi (WebKitGTK) | `npm run exe:e2e`, gerçek pencere | WebDriver'ın girdi benzetimi yok, olaylar sayfanın içinde üretiliyor (tuzak 127) |
| GTK'nın dosya seçicisi, kâğıda yazdırma | elle görüldü | WebDriver oturumunda açılmıyor (tuzak 133), kâğıt hiç ölçülmüyor |
| macOS | hiçbir şey | `kayma.spec.ts`'in oluk farkı açık bir soru (TODO B7.7) |
| Windows kurulum yolu (`Kur.cmd`, `kurulum/kur.ps1`, `kurulum/sunucu.ps1`) | `surum.yml`'de biçim denetimi (BOM, CRLF, ASCII); `e2e/sunucu.spec.ts` sunucunun Node ikizini (`scripts/sunucu.mjs`) sınıyor | PowerShell betiklerinin kendisi hiçbir yerde çalıştırılmıyor |

## Sahte veri

Sahte veri tek yerde: `src/worlds.ts`. `makeWorld()` küçük bir okul kurar,
`illegalBlocks()` dizilmiş bir programı denetler, `WORLDS` hazır senaryoları tutar.
`solver.test.ts`, `kontrol.spec.ts` ve `otomatik-dunyalar.spec.ts` aynı üreteci
kullanır. Denetçinin kendisi `worlds.test.ts`'te bilerek bozuk ızgaralarla sınanır,
ve her dünya testi kaydedilen yerleşim sayısının girişten büyük olduğunu ayrıca
iddia eder (tuzak 23).

Sahte olmayan veri iki dosya. `src/fixtures/tam-dolu-kurs.json` babanın planı,
öğretmen adları "Öğretmen N" yapılmış ve ızgarası boşaltılmış.
`src/fixtures/tam-dolu-kurs-dizili.json` aynı dosya, babanın kendi dizdiği 330
saatle: yalnız yerleşimler eklendi, ve onlar kimlikten kimliğe, ad taşımıyor
(2026-09-25). Dizili dersler yerinde kalırken yol olmayan, yani her yolun yeniden
dizdiği hafta bu; `relaxLaidOut.test.ts` onda "Olmaz"dan sonraki kaliteyi soruyor (KY'nin
Cumartesisi reddedilince en az saat 5, CP-SAT'ın en iyisi). Şema örneklerinin
yanında duruyor ama onlardan değil, `fixtures.test.ts` yalnız sürüm numaralı
dosyaları (`v1.json` ile `v14.json` arası) okuyor. `solver.test.ts` onu iki soruyla kullanır: olduğu gibi kurulamadığını
dürüstçe söylemesi, ve Roboders'in açık saatleriyle tamamını dizmesi (tuzak 122,
125). `relaxFullCourse.test.ts` üçüncü soruyu sorar: kurulamayan haftaya önerilen
değişikliklerin boyutu CP-SAT'ın ölçtüğü en küçükle aynı mı (4 öğretmen saati, 6
sınır), ve dört saat açıkken çözücünün bulamadığı hafta bulunuyor mu. Bu iki dosya
süitin en yavaş birim testlerini taşıyor ve bu yüzden `relax.test.ts`'ten ayrı: Vitest
dosyaları paralel, bir dosyanın içindeki testleri ise sırayla koşar. İki "dizili" testi
aynı ilk aramadan başlar, arama bir kez yapılır ve her test kendi kopyasını okur. `e2e/otomatik.spec.ts` aynı
haftayı tarayıcıda panelden uygular ve tek Ctrl+Z ile geri alır. Gerçek adların depoya girmemesi kural: dosya yenilenirse adlar yeniden
silinir.

## Ölçüm yöntemleri

- **Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini `getComputedStyle` ile okur, WCAG kontrast oranını ve CIE Lab ΔE farkını hesaplar. ΔE gerekiyor, çünkü WCAG parlaklık oranı farklı tonlardaki iki koyu rengi eşit sayar. Modern renk sözdizimi sayıya çevrilmeden önce sRGB'ye getirilir (tuzak 81).
- **Mutasyonla sınama.** Bir testin bir şey ölçtüğü, kural bilerek bozulup testin kırmızıya döndüğü görülerek doğrulanır. Mutasyondan önce dosya bir kopyaya alınır ve geri alma o kopyadan yapılır. Kanıt `scripts/mutasyon-kaniti.sh` ile: test önce değişmemiş kodda yeşil olmalı, ve komutu hiç koşmayan bir test kırmızı sayılmaz.
- **Derleme çıkış kodu.** Testten önce derleme susturuluyorsa çıkış kodu okunur, yoksa testler bir önceki `dist/`'i ölçer.
- **Kâğıt.** Yazdırma iddiaları PDF üretilip okunarak doğrulanır (MediaBox, üst ve alt bilgi), ve kâğıdı ölçen test pencereyi de kâğıdın boyuna getirir (tuzak 31 ve 86).
