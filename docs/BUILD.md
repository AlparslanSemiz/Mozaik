# Derleme ve teslim

Teknoloji yığını, komutlar, dört teslim yolu, sürüm numarası ve güncellemenin işleyişi.

## Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  ->  dist/index.html  (tek dosya, gömülü JS, CSS ve font)
Vitest                  ->  saf mantık testleri ve jsdom duman testi
Playwright              ->  tarayıcıda uçtan uca testler
Radix UI                ->  diyalog, bağlam menüsü, açılır menü ve benzeri katmanlar
lucide-react            ->  simgeler (ağaç budanır, yalnız kullanılan simge gömülür)
Tauri 2                 ->  Windows exe
```

CSS tek bir `src/styles.css` dosyasında, CSS değişkenleriyle yazılıyor.

## Bağımlılık kuralı

Bir paket `dist/index.html`'e gömülebiliyor ve çalışma anında ağa çıkmıyorsa
alınabilir. Sabit bir boyut tavanı yok, şart ölçmek: paket eklendikten sonra
`dist/index.html`'in boyutu ve `file://` üzerinden açılış süresi
[WORKLOG.md](WORKLOG.md)'ye yazılır. `devDependencies` bu kuralın dışında,
serbest: test araçları (`fast-check`, `@axe-core/playwright`,
`@stryker-mutator/*`) derlemeye girmiyor, o yüzden onlar için ölçülecek bir
boyut da yok. Çalışma anında bayt indiren bir paket alınmıyor, çünkü çevrimdışı
ilkesini bozar.

Varsayılan tercih hazır bir çözüm kullanmak ([CONVENTIONS.md](CONVENTIONS.md)).
Ölçülüp alınmayan paketlerin kaydı (`motion`, Tailwind, sürükle bırak
kütüphanesi) [DECISIONS.md](DECISIONS.md)'de, paket başına ölçülen boyut
maliyetleri WORKLOG'da.

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run tipler       # tsc iki kez: src (tsconfig.json) ve src dışı (tsconfig.tools.json)
npm run lint         # ESLint, şimdilik yalnız React'in kanca kuralları
npm run knip         # kullanılmayan dışa aktarım, dosya ve bağımlılık raporu
npm run bicim        # Prettier, yalnız kod dosyaları (src/lang hariç)
npm test             # Vitest birim testleri
npm run build        # dist/index.html, tek dosya (asıl teslim)
npm run build:site   # dist-site/: tek dosya, manifest, sw.js ve simgeler
npm run test:e2e     # derler, sonra ana E2E süitini file:// üstünde koşar
npm run test:site    # site, yerel sunucu ve klasör testleri, http üstünde
npm run kontrol      # tipler, birim, derleme, E2E, site ve çözücü stresi birlikte
npm run ekran        # iki temada ekran görüntüleri, test-results/ekran/ altına
npm run cozucu       # gerçek ölçekli çözücü stresi
npm run patrol       # devriye: her ekranı gezer, tohumlu rastgele gezinme
npm run mutasyon     # Stryker: saf çekirdekte testlerin ne ölçtüğünü ölçer, yavaş
npm run sunucu       # yerel sunucu: http://dersprogrami.localhost:7654
npm run paket        # dist-kurulum/: babaya giden Windows klasörü
npm run font         # src/fonts/*.woff2'yi yeniden üretir (Python ve fontTools ister)
npm run exe          # Tauri ikilisi (Rust ister)
npm run exe:test     # cargo test (Rust ister)
npm run yayinla -- 1.2.0   # sürüm çıkarır
```

Yeni bir bilgisayarda bir kez: `npm install && npx playwright install chromium`.
Hangi katmanın ne zaman koşulduğu [TESTPLAN.md](TESTPLAN.md)'de.

`lint`, `knip` ve `bicim` geliştirme araçları, `dist/index.html`'e girmezler ve
`kontrol`'ün parçası değiller: knip bugün bilinen ölü kodu raporladığı için sıfırdan
farklı çıkar, ve bir kapı kırmızı başlarsa kapı olmaktan çıkar. Biçim değişikliği
yalnız başına commit'lenir ve `.git-blame-ignore-revs`'e yazılır. `git blame`'in onu
atlaması için bir kez `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

`font`, `exe` ve `exe:test` `kontrol`'ün parçası değil, çünkü bu depoda olmayan
bir araç zinciri istiyorlar (Python ile fontTools, Rust) ve `kontrol` her
makinede koşabilmeli. Rust'ı gerçekten derleyen tek yer
`.github/workflows/surum.yml`, `cargo test` de orada koşuyor. `patrol` de
`kontrol`'ün dışında, çünkü bir şey iddia etmiyor, geziyor, ve kırıldığında
okunacak şey bir iz: kendi config'inde video ve trace açık.

aSc araçları (`scripts/asc-sozluk.mjs`, `asc-yardim.mjs`, `asc-ekran.ps1`,
`asc-tur.ps1`, `asc-adim.ps1` ve UTF-8 düzeltme betikleri) `docs/asc/`'yi
üretir ve `kontrol`'ün parçası değil, çünkü aSc kurulu bir Windows'a bağlılar.

## Dört teslim yolu

```
vite.config.ts       -> dist/index.html   tek dosya, file://, çift tıklanır
vite.site.config.ts  -> dist-site/        aynı tek dosya, manifest, sw.js ve simgeler
scripts/paket.mjs    -> dist-kurulum/     dist-site ve kurulum betikleri (Windows)
src-tauri/           -> Mozaik.exe        dist/index.html'i içine alan tek ikili
```

Arayüzün ikinci bir kopyası yok. Kurulum paketinin içindeki uygulama
`dist-site/index.html`'in kendisi, exe'nin içindeki sayfa ise `tauri.conf.json`'ın
`frontendDist`'i `../dist` olduğu için babanın çift tıklayacağı dosyanın kendisi.

Yardımcı kaynaklar:

```
site/                        manifest.webmanifest · sw.js · icon.svg · icon-small.svg · icon-192/512.png
kurulum/                     Kur.cmd · Guncelle.cmd · kur.ps1 · sunucu.ps1 · OKU.txt · icon.ico
scripts/simge.mjs            icon.svg'den 192 ve 512 PNG (Chromium ile)
scripts/ikon.mjs             kurulum/icon.ico: 16 px sade, 20 px ve üstü ayrıntılı
scripts/ikon-karsilastir.mjs eşiğin reçetesi: iki çizim, altı boy, iki zemin
scripts/exe-ikon.mjs         yayınlanmış bir exe'nin içindeki simge boylarını okur
scripts/favicon.mjs          index.html'in data: URI favicon'u, sade çizimden
scripts/sunucu.mjs           sunucu.ps1'in Node ikizi, geliştirme ve ölçüm için
scripts/font.mjs             gömülü yüzün reçetesi (kaynak scripts/font-source/)
scripts/surum.mjs            sürüm numarasını okur (define ve service worker damgası)
scripts/yayinla.mjs          bir sürümün adımları, tek komutta
scripts/bolum-renk.mjs       bölüm renklerinin taraması
```

### Tek dosya

`dist/index.html`'in iddiası tek dosya ve ağsız olmak. Site derlemesi de
`viteSingleFile`'ı koruyor: service worker'ın önbelleğe alacağı kabuk böylece
bir sabit, her derlemede yeniden üretilen bir hash listesi değil.

Manifest bağlantısı, simge ve service worker kayıt betiği kaynak `index.html`'de
durmaz, yalnız site derlemesinde bir `transformIndexHtml` eklentisiyle eklenir
(`order: 'post'`, yoksa singlefile onları gömülecek varlık sanar). Ana config'de
`publicDir: false`, yani `site/`'nin hiçbir dosyası `dist/`'e düşmez. Böylece
çevrimdışı iddiası okunarak doğrulanabilir kalır ve `site.spec.ts` tam olarak
bunu ölçer (tuzak 32).

Site derlemesinde `<link rel="icon">` yok: `index.html` favicon'u `data:` URI
olarak taşıyor ve bu iki derlemede de geçerli. İkinci bir bağlantı `<head>`
sırasında kazanır ve sekmeye ayrıntılı işareti getirirdi.

Kök `index.html` Vite'ın şablonudur, program değildir. Çift tıklanırsa ne
olacağını kendi içinde yazıyor (tuzak 72).

#### Temanın ilk boyamadan önce kurulması

`index.html`'in `<head>`'inde, `type="module"` taşımayan klasik bir betik duruyor:
`ders-programi-tema` okunur ve `<html>`'e `data-theme` yazılır. Betiğin klasik
olması tercih değil şart, çünkü bir modül betiği spec gereği ertelenir ve belge
ayrıştırıldıktan sonra koşar. Tek dosyada o modülün içinde bir megabaytlık
uygulama var, yani yavaş bir makinede tarayıcı sayfayı ondan önce bir kez
boyuyor ve karanlık tema kayıtlıyken ilk kare açık zeminle geliyordu. Ölçüm: 4
kat yavaşlatılmış işlemcide dokuz açılışın dokuzunda, düzeltmeden sonra
sıfırında. Klasik bir betik ayrıştırmayı bloklar, yani "ilk boyamadan önce" bir
yarış olmaktan çıkıp bir garanti oluyor.

Kapsam yalnız tema, çünkü ölçülen tek görünür fark o. Ölçek ve yoğunluk geç
uygulandığında düzen kayması 0,0002'nin altında kalıyor ve bir renk değişimi
gibi göze çarpmıyor.

Betiğin üç dizesi (`ders-programi-tema`, `data-theme`, `dark`) `theme.ts` ile
aynı olmak zorunda. "Aynı olsun" demek yetmiyor (tuzak 77):
`src/preferences.test.ts` `index.html`'i okuyup betiğin gövdesini çalıştırıyor ve
`themePreference`'ın cevabıyla karşılaştırıyor, `e2e/renk.spec.ts` de temanın
`document.readyState === 'loading'` iken kurulduğunu ölçüyor. Betik ayrıca
`scripts/favicon.mjs`'in şablonunda da duruyor, yoksa o betiği çalıştırmak bunu
sessizce silerdi (tuzak 93).

Belge başında depoya dokunmanın `file://` altında bayat açılış üretip
üretmediği ayrıca ölçüldü (tuzak 108) ve üretmiyor: sınır "belgeden önce" ile
"belgenin `<head>`'i içinde" arasında. Ayrıntı TESTFINDINGS'te.

### Site

`npm run build:site` GitHub Pages'e giden klasörü üretir, `site.yml` iş akışı her
`main` itmesinde yayınlar. Sayfa ilk açılıştan sonra service worker sayesinde
bağlantısız da açılır, ve bu `site.spec.ts`'te ölçülüyor. Service worker'ın
önbellek adı sürüm damgasını taşır, yoksa güncelleme bir açılış geriden gelir
(tuzak 73).

### Yerel kurulum

`kurulum/Kur.cmd` programı `%LOCALAPPDATA%\Mozaik` altına kurar ve
`kurulum/sunucu.ps1`'i, yani `dersprogrami.localhost:7654`'te koşan küçük bir
dosya sunucusunu başlatır. Sunucunun backend'i, veritabanı, hesabı ve API'si yok,
verdiği şey bir klasördeki dosyalar. `*.localhost`'u Chrome kendisi çözer, hosts
dosyası ve yönetici izni gerekmez. Sunucu IPv4 ve IPv6'ya ayrı ayrı bağlanır
(tuzak 66).

Bu yolun sebebi `file://`'ın bir kökeninin olmaması (tuzak 65): service worker,
bu programa ait bir depo (OPFS) ve tarayıcının tek bir siteye saklayabildiği
klasör izni ancak gerçek bir kökende çalışıyor. Çift tıklanan `dist/index.html`
asıl teslim yolu olarak kalıyor, iki yolun ölçülen açılış farkı WORKLOG'da.

Kurulum eski adla ("Ders Programı") duran kısayolu siler, çünkü iki kısayol iki
program demek ve ikincisi güncellenmeyen bir kopyayı açar. Eski klasör silinmez,
yalnız varlığı söylenir: içinde kullanıcı verisi yok, ama bir klasörü sessizce
silmek veri kaybı olmaz ilkesiyle çelişir.

Kurulum betikleri `dist/`'e ya da `dist-site/`'a konmuyor, yalnız `dist-kurulum/`
paketinde duruyor.

**Metin kodlaması.** `kurulum/*.cmd`, `*.ps1` ve `*.txt` `.gitattributes`'ta
`eol=crlf`, çünkü `* text=auto` bir Linux checkout'unda onlara LF verir ve
Notepad `OKU.txt`'yi tek satır gösterir. `.ps1` dosyaları UTF-8 BOM taşır, çünkü
Windows PowerShell 5.1 BOM'suz UTF-8 bir betiği ANSI okur ve her Türkçe harf
bozulur. `.cmd` dosyaları yalnız ASCII: cmd.exe'nin kod sayfası Türkçe harfleri
bozuyor, bu yüzden kullanıcıya görünen her cümle PowerShell'den yazılıyor.

**Çalıştırma ilkesi `RemoteSigned`.** Betikler `-ExecutionPolicy Bypass`
kullanmıyor (2026-08-30). Bir ZIP'ten çıkan her dosya "Internet" bölgesi damgası
taşır, ve Bypass o damgayı görmezden gelmenin en geniş yolu, indirilen bir
arşivin içinde virüs tarayıcılarının tanıdığı bir desen. `Unblock-File` damgayı
kaldırır ve damgasız bir betik `RemoteSigned` altında yerel sayılır. `kur.ps1`
kopyaladığı `.ps1`'leri de unblock eder, çünkü `Copy-Item` damgayı beraberinde
getirebiliyor.

### Exe

`npm run exe` `--no-bundle` ile derler: Tauri'nin NSIS hedefi bir kurulum
sihirbazı üretir, teslim edilen şey ise tek bir `Mozaik.exe`. Bunun ilk gerekçesi
2026-08-30'a kadar geçerli olan "kurulum yok" kuralıydı ve o kural gevşedi.
Bugünkü gerekçe kurulmadan çalışan yolun korunması, ve bir kurulum sihirbazı artık
bir seçenek olarak tartışılabilir ([DECISIONS.md](DECISIONS.md)).

Çapraz derleme yok: geliştirme makinesi Linux, hedef Windows, ve exe
`windows-latest` üstünde doğuyor (`surum.yml`).

Pencere `tauri.conf.json`'da `maximized: true` ve `minHeight: 640`. Pencere
1600 mantıksal piksellik bir kutuda kaldığında sayfa 1920 değil 1600 CSS
pikselde koşuyordu (tuzak 107), ve Windows %150'de çalışma alanı 672 mantıksal
piksel olduğu için 700'lük bir alt sınır pencereyi ekrana sığdırılamaz yapıyordu.
`src/surum.test.ts` iki değeri de sabitliyor.

Exe imzasız, çünkü kod imzalama sertifikası ücretli ve cevap hayırdı. İmzanın
yerine yayına `SHA256SUMS.txt` giriyor: imza yoksa "bu, yayınladıkları dosya mı"
sorusunun cevabı bir özet. VERSIONINFO'yu `tauri-build` zaten gömüyor, bu
yayınlanmış ikilide ölçüldü (tuzak 101).

Exe'nin dosya sistemi köprüsü bir adaptör, ayrıntısı [ARCHITECTURE.md](ARCHITECTURE.md)'de.

## Release varlıkları

Üç teslim dosyasının tek kaynağı `.github/workflows/surum.yml`, ve bir `vX.Y.Z`
etiketi itilince koşar. Sebebi bir eksikti: `dist/` `.gitignore`'da, bir Actions
artefaktı giriş ister ve 90 günde silinir, yani babaya verilebilecek bir bağlantı
değil. Bir GitHub Release'in varlıkları kalıcı ve girişsiz, ve
`releases/latest/download/<ad>` sürüm numarası bilmeden en yenisine gider.
README'nin indirme bağlantıları bunlar.

| Varlık | Ne |
|---|---|
| `Mozaik.html` | çift tıklanan tek dosya |
| `Mozaik-Windows-kurulum.zip` | `Kur.cmd` ve yerel sunucu |
| `Mozaik.exe` | kendi penceresi olan program |
| `SHA256SUMS.txt` | üç dosyanın özeti |
| `surum.json` | exe'nin "daha yeni bir sürüm var mı" diye okuduğu tek satırlık manifest |

Varlık adları yalnız ASCII, çünkü URL'de kodlanıyorlar. Release sayfasının
gövdesi `.github/surum-notu.md`, sürüm sürüm değişiklik geçmişi kökteki
[CHANGELOG.md](../CHANGELOG.md), uygulamanın içindeki Yenilikler paneli ise
`src/changelog.ts`.

## Sürüm numarası

Numaranın tek kaynağı `package.json`, ve `scripts/surum.mjs` onu okur.
`tauri.conf.json` numarayı kopyalamaz, `"../package.json"` yolunu gösterir.
`Cargo.toml`'daki numarayı `yayinla.mjs` yazar, çünkü cargo başka bir dosyadan
numara okumuyor. İki Vite config `define: { __SURUM__ }` ile numarayı derlemeye
basar ve `src/version.ts` onu okur (tanımsızsa `0.0.0-dev`'e düşer, yoksa `tsc`
ve Vitest modül yüklenirken çöker). Aynı damga `dist-site/sw.js`'in önbellek
adına girer. Ayarlar → Hakkında hangi sürüm olduğunu gösterir. Bu bir derleme
bayrağı değil, dört teslim yoluna basılan aynı damga.

`src/surum.test.ts` bunları her koşuda ölçer: `package.json` ile `Cargo.toml`'un
aynı numarayı söylediğini, `tauri.conf.json`'ın yol gösterdiğini, `identifier`'ın
değişmediğini (tuzak 95), exe penceresinin ayarlarını, `surum.yml`'in manifeste
yazdığı adres ile `update.rs`'in kabul ettiği öneklerin anlaştığını (tuzak 106),
ve `CHANGELOG.md`'nin en üst sürümünün `package.json` ile aynı olduğunu.

`npm run yayinla -- X.Y.Z` bir sürümü tek komutta çıkarır. Önce kapılar: çalışma
ağacı temiz, dal `main`, etiket daha önce atılmamış, `src/changelog.ts`'in en
üstteki girdisi bu sürüm, ve `CHANGELOG.md`'nin `Unreleased` bloğu boş değil.
Sonra `package.json` ve `Cargo.toml` yazılır, `CHANGELOG.md`'deki `Unreleased`
bloğu bu sürüm numarasına ve bugünün tarihine kapanır, ve üçü tek commit olur.
Etiket annotated atılır, çünkü `--follow-tags` hafif etiketleri sessizce atlar.
`main` ve etiket tek `push` ile gider, ardından etiketin uzakta göründüğü
doğrulanır, çünkü unutulan bir etiket başarılı bir sürüm gibi görünür: site
güncellenir, üç indirme dosyası eski kalır.

## İşaret ve ikon

İşaretin iki çizimi var. `site/icon.svg` ayrıntılı çizim (sütunlar ve hayalet
sütunlar), `site/icon-small.svg` küçük boylar için sade çizim. `scripts/ikon.mjs`
`.ico`'ya 16 px'i sade, 20 px ve üstünü ayrıntılı çizimden yazar
(`SADE_ALTINDA = 20`). `.ico` Windows'un isteyebileceği dokuz boyu taşır: 16, 20,
24, 32, 40, 48, 64, 128 ve 256.

| Nerede | Hangi çizim | Niçin |
|---|---|---|
| Sekme (favicon, `index.html`) | sade | bir sekme simgesi 16 ile 32 px arasında çizilir |
| `kurulum/icon.ico` 16 px | sade | 16 px'te ayrıntılı çizimin sütunları bir lekeye dönüyor |
| `kurulum/icon.ico` 20 px ve üstü | ayrıntılı | 2026-09-01'de kullanıcı isteğiyle, dokuz boyun pikselleri karşılaştırılarak |
| PWA 192 ve 512 PNG | ayrıntılı | yer var |
| Üst çubuk (`.brand-mark`) | sade | `1.75rem`, kök 13 px iken 22,75 px |

Eşik dört kez taşındı ve her seferinde bir şikayetten çıktı. Geçmişi
[DECISIONS.md](DECISIONS.md)'de, dersleri tuzak 78 ve 101'de.

Çizim üç yerde duruyor: svg dosyaları, `index.html`'in `data:` URI'si ve
`App.tsx`'teki satır içi SVG. Ayrışmaları `temel.spec.ts` 72 (URI ile
`icon-small.svg`) ve `kabuk.spec.ts` 76 (üst çubuk ile svg) ile yakalanıyor.
`scripts/favicon.mjs` URI'yi yeniden üretir, URI elle düzenlenmez (tuzak 93).
Yayınlanmış exe'nin içine gerçekten hangi boyların gömüldüğünü
`scripts/exe-ikon.mjs` okur ve `surum.yml`'in `exe` işi onu bir kapı olarak koşar.

## Güncelleme

Program kendini üç ayrı yoldan günceller, ve üçünde de kullanıcı istemeden hiçbir
şey değişmez. Kararın hangi yolda nasıl işlediği `src/update.ts`'te.

**`sw`: site ve yerel kurulum.** Yeni bir service worker devraldığında
(`controllerchange`) açık duran sayfada bir şerit çıkar ve yeni sürümün hazır
olduğunu söyler. `Yenile` denene kadar hiçbir şey değişmez, `Sonra` denince o
oturumda bir daha sorulmaz (`sessionStorage`). Kurulum yolunda `Guncelle.cmd` en
yeni sürümü internetten alır, internet yoksa yanındaki paketi kurar.

**`exe`.** Ayarlar → Hakkında'da üç ayrı düğme var: `Denetle`, `İndir`,
`Şimdi yeniden başlat`, çünkü üçü üç ayrı karar. Ağa yalnız tıklanınca çıkılır:
açılışta, arka planda ya da bir zamanlayıcıyla değil. İnternet yoksa sonuç bir
cümle olur ve program çalışmaya devam eder. `src-tauri/src/update.rs` indirilen
dosyanın `MZ` ile başladığını ve boyutunun tuttuğunu doğrular, adresin yalnız bu
deponun Release öneklerinden gelmesine izin verir, takası çalışan programın kendi
dosya adı üstünden yapar (`current_exe()` ile `.yeni` ve `.eski`), ve takas
yarıda kalırsa eski programı yerine geri koyar. Babanın makinesindeki
`Ders-Programi.exe` bu yüzden `Mozaik.exe`'yi indirir ve kendi adıyla yerine
koyar: dosya adı eski kalır, içindeki program yenidir.

**`yok`: çift tıklanan `.html`.** Bir dosya kendini değiştiremez. Program en son
sürümün nerede olduğunu (`SITE_ADRESI`) gösterir.

**Adresler.** `update.rs`'in `RELEASE_KOKLERI`'si iki önek tanır, depo
`ders-programi` ve `Mozaik` adıyla. Liste yalnız uzar, çünkü dağıtılmış bir
kopyaya sonradan önek öğretilemez. `surum.yml` manifeste eski adlı adresi
yazar, GitHub onu yeni ada yönlendirir, yani tek adres eski ve yeni kopyaların
ikisini de doyurur. GitHub Pages bir depoyu adıyla yayınladığı ve yönlendirme
yapmadığı için `SITE_ADRESI` `https://alparslansemiz.github.io/Mozaik/`
(tuzak 106).

## Font

Font ağdan çekilmez (çevrimdışı ilkesi), `src/fonts/` altındaki `woff2` dosyası `dist/index.html`'e
gömülür ve `font-display: block` ile yüklenir (tuzak 38). Yüzün reçetesi
`scripts/font.mjs`, kaynağı `scripts/font-source/` (OFL 1.1), ve ağırlık aralığı
kullanılan ağırlıklara göre ölçülerek seçildi (tuzak 69 ve 70). Reçete
çalıştırılınca boyut değiştiyse WORKLOG'a yazılır.

## Geliştirme araçları

`.mcp.json` üç sunucu tanımlar, hiçbiri `dist/index.html`'e girmez.

| Sunucu | Ne için |
|---|---|
| `playwright` | uygulamayı sürüp bakmak, E2E süitinin yerine geçmez |
| `chrome-devtools` | konsol, ağ ve performans profili, hedef makine ilkesinin ölçüldüğü yer |
| `context7` | React ve Vite sürüm dokümanı |

Tip hataları için `typescript-lsp` eklentisi kullanılıyor. Son sözü `npm run tipler`
ve [TESTPLAN.md](TESTPLAN.md)'deki katmanlar söyler.
