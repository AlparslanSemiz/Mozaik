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
Tauri 2                 ->  Windows exe ve Mac .app
```

CSS tek bir `src/styles.css` dosyasında, CSS değişkenleriyle yazılıyor.

## Bağımlılık kuralı

Bir paket `dist/index.html`'e gömülebiliyor ve programın açılışı için ağa
ihtiyaç duymuyorsa alınabilir. Gönderme ya da güncellemeyi denetleme gibi bir iş
ağı kullanabilir, ama ağ yokken programı durdurmaz. Sabit bir boyut tavanı yok,
şart ölçmek: paket eklendikten sonra
`dist/index.html`'in boyutu ve `file://` üzerinden açılış süresi
[WORKLOG.md](WORKLOG.md)'ye yazılır. `devDependencies` bu kuralın dışında,
serbest: test araçları (`fast-check`, `@axe-core/playwright`,
`@stryker-mutator/*`) derlemeye girmiyor, o yüzden onlar için ölçülecek bir
boyut da yok. Açılmak için bayt indiren bir paket alınmıyor, çünkü programın
açılışını ağa bağlar ([PRINCIPLES.md](PRINCIPLES.md), "Açılış ağa bağlı değil").

Varsayılan tercih hazır bir çözüm kullanmak, ve sorma sırası önce depoda olan,
sonra platformun ve framework'ün resmi cevabı, sonra olgun bir paket
([CONVENTIONS.md](CONVENTIONS.md), "Hazır çözüm önce"). Platformun çözümü
belirgin biçimde zayıfsa paket alınır ve gerekçesi yazılır.
Ölçülüp alınmayan paketlerin kaydı (`motion`, Tailwind, sürükle bırak
kütüphanesi) [DECISIONS.md](DECISIONS.md)'de, paket başına ölçülen boyut
maliyetleri WORKLOG'da.

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run tipler       # tsc iki kez: src (tsconfig.json) ve src dışı (tsconfig.tools.json)
npm run lint         # ESLint: React'in kanca kuralları, tip farkında dört kural ve x!++ yasağı
npm run knip         # kullanılmayan dışa aktarım, dosya ve bağımlılık raporu
npm run sinir        # dependency-cruiser: çalışma zamanı import döngüsü, katman sınırı ve paket girişi
npm run analiz       # demetin içindekiler, test-results/demet/analiz.html (ölçüsü minify öncesi)
npm run boyut        # size-limit: dist/index.html'in ham ve brotli boyu, eşiği aşarsa kırmızı
npm run grafik       # aynı grafiği mermaid olarak yazar, dosyaya değil ekrana
npm run bicim        # Prettier, kod dosyaları ve index.html (src/lang hariç); styles.css'e dokunmaz
npm test             # Vitest birim testleri
npm run build        # dist/index.html, tek dosya (asıl teslim)
npm run build:site   # dist-site/: tek dosya, manifest, sw.js ve simgeler
npm run test:e2e     # derler, sonra ana E2E süitini file:// üstünde koşar
npm run test:site    # site, yerel sunucu ve klasör testleri, http üstünde
npm run test:webkit  # ana E2E süiti Playwright'ın WebKit'inde (Fedora'da kapta, TESTPLAN)
npm run kontrol      # tipler, sınır, lint, birim, derleme, boyut, E2E, site ve çözücü stresi birlikte
npm run ekran        # iki temada ekran görüntüleri, test-results/ekran/ altına
npm run cozucu       # gerçek ölçekli çözücü stresi
npm run patrol       # devriye: her ekranı gezer, tohumlu rastgele gezinme
npm run mutasyon     # Stryker: saf çekirdekte testlerin ne ölçtüğünü ölçer, yavaş
npm run sunucu       # yerel sunucu: http://dersprogrami.localhost:7654
npm run paket        # dist-kurulum/: babaya giden Windows klasörü
npm run font         # src/fonts/*.woff2'yi yeniden üretir (Python ve fontTools ister)
npm run exe          # Tauri ikilisi (Rust ister)
npm run exe:test     # cargo test (Rust ister)
npm run exe:linux    # Linux ikilisi, dist-exe/Mozaik (yalnız geliştirme ve test)
npm run exe:e2e      # exe:linux, sonra gerçek exe süiti (tauri-driver ister)
npm run yayinla -- 1.2.0   # sürüm çıkarır: commit, push, CI'ı bekler, yeşilse etiket
npm run yayinla -- --kuru  # aynı bekleme, hiçbir şey değiştirmeden
npm run dal-temizle        # biten dal ve worktree'lerin planı, hiçbir şey değiştirmeden
npm run dal-temizle -- --uygula  # planı uygular: önce bundle ve arsiv/ etiketi, sonra siler
scripts/linux-kur.sh       # Linux: ~/GitHub/Mozaikler/Mozaik'in main'inden kurar ya da günceller
```

Yeni bir bilgisayarda bir kez: `npm install && npx playwright install chromium`.
CI Node 22'de koşar ve `.nvmrc` aynı sürümü söyler. Node 25 ve sonrası kendi
`localStorage`'ını tanımlayıp jsdom'unkini gölgeler; `vite.config.ts` bu sürümlerde test
süreçlerine `--no-experimental-webstorage` verir, yerelde Node 26 da çalışır.
Hangi katmanın ne zaman koşulduğu [TESTPLAN.md](TESTPLAN.md)'de.

`knip` ve `bicim` geliştirme araçları, `dist/index.html`'e girmezler ve
`kontrol`'ün parçası değiller. `lint` 2026-09-12'de `kontrol`'e girdi: tip
farkında dört kural açıldı, bulguları kapatıldı ve komut sıfır hatayla
koşuyor (dört uyarı duruyor, onlar kanca bağımlılıkları). Bir kapı kırmızı
başlarsa kapı olmaktan çıkar, o yüzden sıraya girmesi sıfıra inmesini bekledi.
`knip.json`'un `ignoreBinaries`'i testlerin çağırdığı üç sistem aracı: `src/linuxKur.test.ts`'in
`desktop-file-validate`'i ve `shellcheck`'i (test onlar yoksa o adımı atlıyor) ve
`src/agir.test.ts`'in `pgrep`'i. Bir paket değiller.

`boyut` da `kontrol`'ün parçası ve derlemeden hemen sonra koşuyor: eşik
`.size-limit.json`'da, bugünkü değerin biraz üstünde, ve iki tane — çift
tıklanan dosyanın ham boyu ile siteden inen brotli hâli. **Eşik değişirse
gerekçesi WORKLOG'a yazılır**, çünkü sessizce yükseltilen bir eşik hiç olmayan
bir eşiktir. İlk eşiklerde ikisinde de on üç kilobayt kadar pay vardı (`8ef234c`).
Kurulamayan haftaya öneri (TODO B5.9) dosyayı otuz sekiz kilobayt büyüttü ve
iki eşik yine on üç kilobayt kadar pay bırakacak yere çekildi; gerekçesi
WORKLOG'un 2026-09-24 girdisinde. Önerinin yolları ve worker'ı (B5.10) ham
boyu on üç kilobayt daha büyüttü, çoğu dört dile giren otuz beş cümle; ham eşik
yine on üç kilobayt kadar pay bırakacak yere çekildi, brotli eşiği aşılmadığı
için yerinde (WORKLOG, 2026-09-25). Cevap defteri, önizleme ve karma yollar (B5.11)
ham boyu otuz iki kilobayt büyüttü, brotli hâlini eşiğin 0,7 kB altına getirdi;
iki eşik de on iki buçuk kilobayt kadar pay bırakacak yere çekildi, ham 1 124 000,
brotli 284 000 (WORKLOG, aynı gün, ikinci girdi). 2026-09-26 turu ham boyu yirmi yedi
kilobayt büyüttü (1 111 503'ten 1 138 617 bayta): iki ders arasındaki ilişki
(B5.3), çoklu takas (B5.7), öneri aramasının bekleyen hattı, dört dile giren
yaklaşık on beş cümle ve Yenilikler panelinin dört dile çevrilen on altı satırı.
İki eşik de on iki buçuk kilobayt kadar pay bırakacak yere çekildi, ham 1 151 000,
brotli 289 000 (WORKLOG 2026-09-26). Denetimin kusurlarını düzelten 2026-09-27 turu ham boyu on yedi
kilobayt büyüttü (1 141 591'den 1 158 660 bayta): dört sözlük 10,7 kB (dört dile giren
yaklaşık yirmi beş yeni cümle: kaybı sayan sorular, durdurulan arama, eksik ve yeni dosya,
Kontrol'ün kapalı saat hükmü, takasın gerekçesi), yeni kısaltma tablosu 2,8 kB, kalanı kod.
Ham eşik on iki buçuk kilobayt kadar pay bırakacak yere çekildi, 1 171 000. Brotli hâli
280,2 kB ile eşiğin altında kaldığı için brotli eşiği yerinde (WORKLOG 2026-09-27).
`fix/okunamayan-plan` (2026-10-24, TODO B7.37) ham boyu 5 946 bayt büyüttü (1 164 918'den
1 170 864'e; yaklaşık 3,2 kB'ı dört dile giren dört yeni cümle, kalanı kod), yani eşiğin 136
bayt altına. Ondan önce birleşecek `tb7-sekme-kapanis` (`tb8-eksik-plan` içinde) kendisi
3 175 bayt getiriyor, ve üçü birlikte 1 174 043 bayt, eşiğin 3 kB üstü. Ham eşik birleşik boyun
on iki buçuk kilobayt kadar üstüne çekildi, 1 186 500; brotli hâli birlikte 282,4 kB, eşiği
yerinde (WORKLOG 2026-10-24).
2026-10-24'ün yedi dallık zinciri (VK ve TB düzeltmeleri, dosya okumanın üç deliği, Ayarlar'ın
not boyu) ham boyu on iki buçuk kilobayt büyüttü (1 158 660'tan 1 171 212 bayta): dört dile
giren yeni cümleler (paketin eksik ve yeni planları, depo dolu notu), exe'nin kapanışı
beklemesi, okuyucuların kimlik ve paket kuralları. Her dal tek başına eşiğin altındaydı,
zincir `dosya-okuma-b7`'de 145 baytla aştı. Ham eşik yine on iki buçuk kilobayt kadar pay
bırakacak yere çekildi, 1 184 000; brotli hâli 281,8 kB ile eşiğin altında, yerinde (WORKLOG
2026-10-24 akşam, dosya okuma). Aynı gece öğretmene e-posta (şema v17, Çıktı'nın paneli, haftanın
metnini kuran modül, on altı cümlenin dört çevirisi) ham boyu 9,7 kB büyüttü (1 174 099'dan
1 183 782 bayta) ve eşiğe 218 bayt kaldı: aşılmadı, ama bir sonraki dal aşardı. Ham eşik yine on
iki buçuk kilobayt kadar pay bırakacak yere çekildi, 1 196 000; brotli hâli 284,9 kB ile 289 kB'ın
altında, yerinde (WORKLOG 2026-10-24 gece, öğretmene e-posta).
Zincir `main`'e bağlanınca (2026-10-24 gece) bu dalda birleşik ham boy 1 194 380 bayt, eşik
1 196 000'de kaldı.
`rk2-bozuk-iliski`'te (zincirin ucu) birleşik ham boy 1 198 108 bayt; ham eşik CLAUDE.md'nin ölçüm
çizgisine, 1 200 000'e çekildi: onu aşan ilk dal, eşiği yükseltmeden önce `file://` açılışını 4×
yavaşlatılmış işlemcide ölçer.
`boyut/kucult` (2026-11-16) dört sözlüğü derlemede paketledi (`scripts/sozluk-paket.mjs`): her
sözlük bütün Türkçe cümleyle anahtarlandığı için aynı 1 221 cümle dosyada dört kez duruyordu.
Ham boy 1 319 045'ten 1 154 736 bayta (−164 kB), brotli hâli 305,14'ten 295,48 kB'a indi. Ham
eşik 1 320 000'den 1 200 000'e indi (45 kB pay, CLAUDE.md'nin ölçüm çizgisi); brotli eşiği
306 000'de kaldı, payı 10,5 kB. Bugün bağlayıcı olan brotli: yeni bir cümle artık ham boya bir
kez anahtar ve dört çeviri olarak giriyor, ama brotli hâline girdiği kadar girmeye devam ediyor
(WORKLOG 2026-11-16, DECISIONS aynı gün).

`sinir` `kontrol`'ün parçası, çünkü sıfır bulguyla başlıyor ve saniyenin biraz
üstünde koşuyor. Ölçtüğü şey çalışma zamanı grafiği: `import type` derlemede
silindiği için grafikte yok, ve bu bilerek — döngüyü kıran üç desenden biri tam
olarak o. Kural ile grafiğin yapılandırması `.dependency-cruiser.cjs`'te. Biçim değişikliği
yalnız başına commit'lenir ve `.git-blame-ignore-revs`'e yazılır. `git blame`'in onu
atlaması için bir kez `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

`font`, `exe`, `exe:test`, `exe:linux` ve `exe:e2e` `kontrol`'ün parçası değil,
çünkü bu depoda olmayan bir araç zinciri istiyorlar (Python ile fontTools, Rust,
WebKitGTK ve `tauri-driver`) ve `kontrol` her makinede koşabilmeli. Yayınlanan
Windows exe'sini derleyen ve `cargo test`'i her sürümde koşan yer
`.github/workflows/surum.yml`. Linux ikilisi yalnız geliştirme makinesinde,
elle derleniyor; yayınlanan Linux paketi (AppImage) ise `surum.yml`'de (aşağıda, "Linux"). `patrol` de
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
scripts/ikon.mjs             kurulum/icon.ico: 16-24 px sade, 32 px ve üstü ayrıntılı
scripts/ikon-karsilastir.mjs eşiğin reçetesi: iki çizim, altı boy, iki zemin
scripts/exe-ikon.mjs         yayınlanmış bir exe'nin içindeki simge boylarını okur
scripts/favicon.mjs          index.html'in data: URI favicon'u, sade çizimden
scripts/sunucu.mjs           sunucu.ps1'in Node ikizi, geliştirme ve ölçüm için
scripts/font.mjs             gömülü yüzün reçetesi (kaynak scripts/font-source/)
scripts/surum-notu.mjs       bir sürümün Release sayfası: Yenilikler, CHANGELOG bölümü, kurulum
scripts/surum.mjs            sürüm numarasını okur (define ve service worker damgası)
scripts/sozluk-paket.mjs     derlemenin eklentisi: dört sözlüğün Türkçe anahtarları bir kez, diller ilk istenince açılır
scripts/yayinla.mjs          bir sürümün adımları, tek komutta
scripts/git-komut.mjs        yayinla'nın git komutu ve yeri: düşeni bir cümleyle bildirir, worktree'de ve başka dalda durdurur
scripts/dal-temizle.mjs      biten dal ve worktree'leri arşivleyip siler (kuru koşu varsayılan)
scripts/dal-plan.mjs         dal-temizle'nin kararları: neyin silinip neyin korunduğu, saf
scripts/kararsiz.mjs         CI'da düşen E2E testlerini bir kez daha koşar, kararsızı özete yazar
scripts/bolum-renk.mjs       bölüm renklerinin taraması
scripts/linux-kur.sh         Linux: dist/index.html'in kopyası, başlatıcı ve mozaik.desktop
scripts/linux-mozaik.sh      Linux başlatıcısı: Chrome'un app modu, Mozaik'in kendi profili
scripts/ortools-linux.sh     Linux: AppImage'ın OR-Tools 9.15 CP-SAT kapanışı, özeti sabit
scripts/linux-paket.sh       Linux: AppImage'ın içi, CP-SAT paketin içinden küçük modeli çözüyor
scripts/linux-acilis.sh      Linux: AppImage Xvfb altında yirmi saniye ayakta kalıyor mu
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

Depoda yedi iş akışı var (2026-10-10'dan beri). `ci.yml` her dala her push'ta
süiti koşar: tipler, sınır, lint, knip, biçim, birim testleri ve belge kapısı,
derleme ve boyut bir işte; ana E2E süiti üç parçada; öneri aramasını başlatan
ve `@arama` etiketini taşıyan E2E testleri kendi işinde, üç parçada, her parça ayrı bir runner'da; site, yerel sunucu, klasör ve çözücü stresi bir işte. Hepsi
yeşilse ve push `main`'e ise `site.yml`'yi çağırır ve site yayınlanır. `site.yml`
kendi başına hiçbir şeyle tetiklenmez, yani site testten geçmemiş bir commit'i
yayınlayamaz. `windows.yml` her `main` push'unda ana E2E süitini Windows'ta koşar; siteyi
kilitlemez, sürümü kilitler (aşağıda, `yayinla`). `exe-windows.yml` gerçek exe süitini
Windows'ta `Mozaik.exe`'ye karşı koşar: haftada bir, exe'ye dokunan bir `main` push'unda
ve elle; o da yalnız sürümü kilitler. `haftalik.yml` haftada bir mutasyonu
koşar ve `windows.yml`'i çağırır. `surum.yml` bir etiketle üç teslim dosyasını üretir.
`kanarya.yml` haftada bir `ci.yml`'in denetimini ve ana E2E'nin bir parçasını runner'ın bir
sonraki imajında koşar ve hiçbir şeyi kilitlemez: `ci.yml`, `site.yml` ve `windows.yml`
runner'ın sürümünü sabitliyor (`ubuntu-24.04`, `windows-2025`), `-latest` değil, çünkü
`ubuntu-latest` 2026-10-19'dan itibaren Ubuntu 26.04'e geçiyor. `surum.yml`'in ve
`haftalik.yml`'in Linux işleri de `ubuntu-24.04`'te (2026-10-10, Alp'in kararı); Linux'un
sabitlemesi geçici, kanarya yeşil kalınca `ubuntu-latest`'e dönülür (TODO B7.29).
`surum.yml`'in Windows işi `windows-latest`'te.

Dependabot (`.github/dependabot.yml`, 2026-09-12) bağımlılık PR'ları
açar. Dalları da push olduğu için `ci.yml` onları da koşar; ayrı bir PR iş akışı
yok. Dependabot otomatik güncelleme yapmıyor, birleştirme kararı insanda. Üç ekosisteme
bakar: npm (haftalık), `src-tauri`'nin cargo'su ve iş akışlarının eylemleri (aylık).
Bütün eylemler, `actions/*` dahil, tam commit SHA'sıyla sabit, yanında sürüm yorumu var
(güvenlik denetimi 2026-11-15, birinci taraflar 2026-11-16); `stable` bir dal
olduğu için rust-toolchain'in SHA'sını Dependabot tazelemez, elle güncellenir.

`npm run build:site` GitHub Pages'e giden klasörü üretir, ve `ci.yml` onu yalnız
yeşil bir `main` push'unda yayınlar. Sayfa ilk açılıştan sonra service worker sayesinde
bağlantısız da açılır, ve bu `site.spec.ts`'te ölçülüyor. Service worker'ın
önbellek adı sürüm damgasını taşır, yoksa güncelleme bir açılış geriden gelir
(tuzak 73).
Kabuğu kurarken `cache: 'reload'`, arkadaki tazelemede `cache: 'no-cache'` ile ister:
Pages `max-age=600` gönderiyor ve düz bir istek eski `index.html`'i tarayıcının HTTP
önbelleğinden alıp yeni sürümün adıyla saklayabiliyordu (web denetimi, 2026-11-16;
`src/sw.test.ts` dosyayı sahte bir `self` ile koşup bunu ölçer).

#### Alan adına geçiş

Site kendi alt alan adına taşınıyor, `https://mozaik.alparslansemiz.com/` (DECISIONS
2026-11-16): `alparslansemiz.github.io` kökeni o hesabın bütün Pages sayfalarıyla ortak ve
localStorage kökene bağlı. Adresler ve tek anahtar `src/leaf/app/adres.json`'da;
`yeniAdresAcik` yalnız ekranda gösterilen adresi (`SITE_ADRESI`) değiştirir.

**Bu depoya özel alan adı konmaz.** Bir proje sitesine özel alan adı konunca GitHub eski
adresi (`https://alparslansemiz.github.io/Mozaik/`) yeni adrese 301 ile yönlendirir. O
andan sonra eski kökende uygulama yalnız service worker'ı olan tarayıcılarda açılır, ve
eski kökendeki planları okuyabilen tek sayfa o. Bu yüzden yeni adres AYRI bir Pages
sitesidir: `AlparslanSemiz/mozaik-site` deposu, `gh-pages` dalından. `site.yml` aynı
derlemeyi iki yere yayınlar: eski adrese bugünkü gibi `deploy-pages` ile, yeni adrese
`yeni-adres` işiyle (`dist-site` + `CNAME` + `.nojekyll`, SSH ile, deploy anahtarıyla,
`--force` tek commit). İş yalnız `main`'de ve `mozaik-site` ortamında koşar; anahtar o
ortamın sırrıdır. Sır yoksa iş bir notla yeşil biter.

Taşıma: eski kökende açılan sayfa, yalnız site derlemesindeki bir betikle yeni adresin
manifestini okur (`vite.site.config.ts`, `yeniAdresYoklamasi`); cevap gelirse bir şerit
çıkar ve **Planları taşı** yeni adresi açıp bütün planları `postMessage` ile verir
(`platform/storage/move.ts`). Yeni adres Tümünü dosyadan aç'ın sorusuyla sorar, sormadan
hiçbir şey yazmaz; cevap gelmezse planlar bir plan dosyasına iner. Eski adresteki veri
silinmez. Çift tıklanan dosyada `fetch` yok (`site.spec.ts`).

Adımlar, bu sırayla (Alp):

1. Cloudflare DNS (`alparslansemiz.com`): `CNAME`, ad `mozaik`, hedef
   `alparslansemiz.github.io`, proxy **kapalı** ("DNS only"). (2026-11-16'da kuruldu.)
   Adım 3–8 de 2026-11-16'da yapıldı: depo, deploy anahtarı (ortam sırrı), ilk yayın, Pages ve
   HTTPS, `yeniAdresAcik: true`. Adım 2 (alan adı doğrulaması) önerilen, isteğe bağlı.
2. Önerilen: GitHub → hesap Settings → Pages → Add a domain ile `alparslansemiz.com`'u
   doğrula (`_github-pages-challenge-alparslansemiz` TXT kaydı Cloudflare'e).
3. Yeni, herkese açık depo `AlparslanSemiz/mozaik-site` (boş; README gerekmez).
4. Anahtar: `ssh-keygen -t ed25519 -N '' -C mozaik-site-deploy -f mozaik_site`.
   `mozaik-site` → Settings → Deploy keys → Add: `mozaik_site.pub`, **Allow write access**.
   Özel yarı `Mozaik`'in `mozaik-site` **ortamının** sırrı olur, depo sırrı değil; ortam
   yalnız `main`'i kabul eder ("Yayın güvenliği", `gh api` komutları orada). Sonra iki
   dosya silinir.
5. `Mozaik`'in `ci.yml`'i `main`'de bir kez koşar (elle "Run workflow" ya da bir push):
   `yeni-adres` işi `gh-pages` dalını oluşturur.
6. `mozaik-site` → Settings → Pages → Source: Deploy from a branch, `gh-pages`, `/ (root)`.
   Custom domain alanı `CNAME` dosyasından `mozaik.alparslansemiz.com` olarak dolar
   (dolmazsa elle yazılır, Save). DNS denetimi geçince **Enforce HTTPS** (sertifika birkaç
   dakika ile bir saat arası).
7. `https://mozaik.alparslansemiz.com/manifest.webmanifest` 200 dönünce eski adresteki
   kopyalar şeridi kendiliğinden gösterir.
8. Ayrı bir dalda `yeniAdresAcik: true`; aynı commit'te `README.md`, `.github/surum-notu.md`,
   `scripts/yayinla.mjs`'teki adres ve `e2e/surum.spec.ts`'in yazılı adresi
   (`src/surum.test.ts` ilk ikisini yeni adrese karşı okur).
9. `https://alparslansemiz.github.io/Mozaik/` en az bir dönem uygulamayı yayınlamaya devam
   eder. Sonra yerine, `site/eski-adres/`'in `/Mozaik/` için bir eşi konur: planı olana
   taşımayı ve dosyayı sunar. Eski adres hiçbir zaman yönlendirilmez ve `Mozaik` deposuna
   özel alan adı konmaz.

Geri almak: `mozaik-site`'ta Pages'i kapatmak, `yeniAdresAcik: false`. Eski kökendeki veri
hiçbir adımda silinmediği için geri dönüş veri kaybettirmez.

#### Eski adres

`site/eski-adres/` `https://alparslansemiz.github.io/ders-programi/` için: depo yeniden
adlandırılınca o adres 404 oldu (tuzak 106) ve 404, eski service worker'ı sonsuza dek
yaşatıyor, çünkü güncelleme sorusu başarısız oluyor. `sw.js` kurulur, yalnız bütün
girdileri `/ders-programi/` altında olan önbellekleri siler (Mozaik'inki aynı kökende ve
aynı adla başlıyor), açık sayfaları ağdan yeniden yükler ve kaydını siler. `index.html`
eski service worker'ı sayfadan da siler, sonra karar verir: bu kökende plan yoksa ya da yeni
adres henüz cevap vermiyorsa aynı kökendeki `/Mozaik/`'e gider (planlar orada okunur);
plan varsa ve yeni adres cevap veriyorsa durur ve Mozaik'in kendi taşımasını sunar: aynı üç mesaj, aynı kökenler, ve bütün planlar tek
dosyaya. Bu klasör `dist-site`'a girmez (`SERVIS_EDILMEYEN`); ikisi `src/sw.test.ts` ve
`e2e/tasima.spec.ts`'te. Yayını Alp yapar: `ders-programi` adında herkese açık bir depo,
kökünde `index.html` ve `sw.js`, Settings → Pages → Deploy from a branch (`main`, `/`).
Sırası serbest.

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

`npm run exe` `--no-bundle` ile derler, geliştirme için. Yayın (`surum.yml`) bundle
ile derler ve iki şey teslim eder: tek başına `Mozaik.exe` ve kurulum sihirbazı
`Mozaik-Kurulum.exe` (NSIS, kullanıcı başına, `%LOCALAPPDATA%\Programs\Mozaik`).
Kurulumun gerekçesi CP-SAT'ın exe'nin yanında duran kütüphaneleri; tek dosya, eski
kopyaların güncellenebilmesi için yayında kalıyor (DECISIONS 2026-11-15). Kaldırıcı
veriyi silmez: `src-tauri/nsis/kancalar.nsh`, ve `surum.yml` bunu ölçmeden yayınlamaz. İki program da
minisign ile imzalanır (`MOZAIK_IMZA_ANAHTARI`, `release` ortamının sırrı; aşağıda "Yayın güvenliği"), exe imzasız hiçbir şey kurmaz.

Çapraz derleme yok: geliştirme makinesi Linux, hedef Windows, ve exe
`windows-latest` üstünde doğuyor (`surum.yml`).

**Linux ikilisi** (`npm run exe:linux`) aynı kaynağın bu makinede derlenmiş
hâli, `dist-exe/Mozaik`. Yalnız geliştirme ve test için var: yayınlanmıyor ve
kendini güncellemiyor (aşağıda). İşi gerçek pencereyi sürmek: `scripts/exe-surucu.mjs`
onu açar, ekran görüntüsü alır, tıklar, yazar, sürükler ve sayfada betik çalıştırır,
`e2e/gercek-exe.spec.ts` de aynı yoldan programın kendisini sınar (neyi sınadığı [TESTPLAN.md](TESTPLAN.md)'de). Sürücü `tauri-driver`
(`cargo install tauri-driver --locked`) ile sistemin `WebKitWebDriver`'ı üstünden
çalışır (Windows'ta sürücü başka yoldan bağlanıyor, TESTPLAN, "Gerçek exe"). Program her koşuda sahte bir ev dizininde açılır (Belgeler ve İndirilenler
ile), gerçek klasörlere dokunmaz. Sürücünün oturum kaydı ve sahte evi
`scratch/exe-surucu/`'da durur, `test-results/`'da değil: her Playwright koşusu o
klasörü boşaltır (tuzak 131). Linux ikilisi WebKitGTK'nın DMA-BUF çizimini kendisi
kapatır, bu makinenin Intel sürücüsü onunla çöküyordu (tuzak 130); Windows'a
derlenmez. Neden Playwright değil ve girdinin neden sayfanın içinde
üretildiği `scripts/webdriver.mjs`'in başında ve [DECISIONS.md](DECISIONS.md)'de.

Linux'ta yayınlanan paket 2026-11-16'dan beri bir AppImage (aşağıda, "Linux"). Linux
ikilisi ondan ayrı: yukarıdaki test işi için duruyor, kendini güncellemiyor ve CP-SAT
yüklemiyor. Chrome'un app modu ("Linux uygulaması") geliştirme makinesindeki günlük kopya
olarak kalıyor; bir rpm'i üreten `exe:rpm` kaldırılmıştı ([DECISIONS.md](DECISIONS.md)).

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

### Linux uygulaması

Bu makinede (geliştirme makinesi) her gün açılan Mozaik, `dist/index.html`'in bir kopyası ve
Google Chrome'un app modu ([TODO.md](TODO.md) B7.28). Beşinci bir derleme değil:
açılan dosya babanın çift tıkladığı dosyanın kendisi, ve dört yoldan hiçbiri
değişmedi.

`scripts/linux-kur.sh` yalnız `~/GitHub/Mozaikler/Mozaik`'ten derler, ve o klasör `main`'de değilse,
`git status`'u temiz değilse ya da bir worktree ise reddeder: bir worktree'nin `dist/`'i
o oturumun dalıdır. Derlenen dosyayı `~/.local/share/mozaik/app/` altına kopyalar (bağ
değil), yanına hangi commit'ten kurulduğunu (`~/.local/share/mozaik/app/kaynak.txt`) ve başlatıcıyı yazar, ve
`~/.local/share/applications/mozaik.desktop`'u kurar. Güncellemek betiği yeniden
çalıştırmaktır; açık bir pencere eski sürümle çalışmaya devam eder, sonraki açılış
yenisini açar.

`scripts/linux-mozaik.sh` (kurulunca `app/mozaik`) Chrome'u
`--user-data-dir=~/.local/share/mozaik/profil` ve `--app=file://…/index.html` ile açar.
Planlar o profilin `file://` deposunda durur, Chrome'un geçmişini temizlemek onlara
dokunmaz. Başlatıcı yalnız `google-chrome`'u kullanır: Chrome yoksa bunu bildirimle
söyler ve çıkar, başka bir tarayıcıya düşmez, çünkü orada boş bir depo açılır ve boş
bir program "verim gitti" diye okunur. Profil klasörünü ne kurulum ne başlatıcı kurar
ya da siler; onu Chrome ilk açılışta kurar. İkisinin testi `src/linuxKur.test.ts`,
sahte bir ev dizininde.

Neden Chrome ve `file://`: sitenin app modu ağsız ilk açılışta hata sayfası veriyor,
`showDirectoryPicker` Brave'de yok, VK1 (iki pencere) Chrome'un iki `--app` penceresinde
ölçüldü. Ölçümler TODO B7.28'de, karar [DECISIONS.md](DECISIONS.md)'de. Daha önce Chrome'da
siteyi kullanan biri için taşıma, [README.md](../README.md)'de.

### Linux

Aynı `src-tauri/`, Linux'ta derlenince tek bir AppImage, `Mozaik-linux-x86_64.AppImage`
(DECISIONS 2026-11-16, "Linux sürümü"). Bütün dağıtımlar için tek dosya: içinde WebKitGTK ve
GTK, yani dağıtımın kendi WebKitGTK sürümü önemli değil; ekran kartı sürücüleri (libGL, EGL)
sistemden gelir, bilerek: linuxdeploy'un dışlama listesi bir masaüstünün kendi taşıdığı
kütüphaneleri pakete koymaz. AppImage'ın sistemden beklediği: grafik (libEGL, libGL, libgbm,
Mesa ya da kartın sürücüsü), GTK 3'ün metin ve pencere yığını (fribidi, harfbuzz, fontconfig,
freetype, X11/xcb) ve libgpg-error (libgcrypt'in). Hepsi GTK'lı her masaüstünde kurulu. Bir
runner ya da çıplak bir kap onları taşımıyor (ilk `linux.yml` koşuları: `libEGL.so.1`,
`libfribidi.so.0`, Fedora'da `libgpg-error.so.0` yok); açılış denemesi o yüzden GTK 3
ve Mesa'yı kendisi kurar, Xvfb altında yazılımla çizer (`LIBGL_ALWAYS_SOFTWARE`,
`WEBKIT_DISABLE_COMPOSITING_MODE`, yalnız `scripts/linux-acilis.sh`'de). Linux'a özgü ayarlar `src-tauri/tauri.linux.conf.json`'da (hedef yalnız
`appimage`, kategori, medya çatısı yok); Tauri onu yalnız Linux'ta katar. `.deb` ve `.rpm` yok:
ikisi de kendini güncelleyemez (program `/usr/bin`'de, root'un), `.deb` yalnız Debian ailesinde
açılır (karar kaydında). Yalnız x86_64.

**Taban.** Program derlendiği sistemin glibc'sini ister, ve yayın Ubuntu 22.04'te derlenir
(glibc 2.35): Ubuntu 22.04 ve 24.04, Debian 12, Fedora 36 ve sonrası açar, Debian 11 açmaz.
`scripts/linux-paket.sh` programın istediği en yüksek glibc'yi okur ve 2.35'i geçerse durur.
AppImage açılmak için FUSE ister; Ubuntu 22.04'ten beri `libfuse2` kurulu gelmeyebilir
(README, "Linux").

```sh
scripts/ortools-linux.sh              # OR-Tools 9.15, özeti sabit; src-tauri/ortools/ ve tauri.ortools.json
npx vite build                        # cargo test'ten önce
MOZAIK_ORTOOLS=$PWD/src-tauri/ortools/libortools.so.9 cargo test --manifest-path src-tauri/Cargo.toml
npx --yes @tauri-apps/cli@2.12.4 build --config src-tauri/tauri.ortools.json
# -> src-tauri/target/release/bundle/appimage/Mozaik_<sürüm>_amd64.AppImage
scripts/linux-paket.sh <AppImage>     # paketin içi ve CP-SAT'ın küçük modeli
scripts/linux-acilis.sh <AppImage>    # Xvfb'de yirmi saniye (kapta: --ayikla)
```

Gereken sistem paketleri (Ubuntu): `libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev
libayatana-appindicator3-dev libssl-dev patchelf file binutils`.

**CP-SAT.** `scripts/ortools-linux.sh` resmi arşivlerden AlmaLinux 8.10'unkini indirir (Ubuntu
arşivleri derlendikleri sürümün glibc'sini ister; bu kapanış en çok glibc 2.26 ve GLIBCXX
3.4.22 istiyor, ölçüldü 2026-11-16), SHA-256'sını sabitle karşılaştırır ve `libortools.so.9`'un
kapanışını (`readelf -d`, 99 kütüphane, 65 MB) `src-tauri/ortools/`'a kopyalar; sistemden
gelmesi gerekenler yalnız glibc, libstdc++ ve libgcc_s olabilir, başkası çıkarsa durur.
Betiğin ürettiği yapılandırma (depoya girmez) onları `bundle.resources` olarak verir ve Tauri Linux'ta kaynakları
`usr/bin`'in yanındaki `usr/lib/Mozaik`'e koyar (tuzak 178). `cpsat.rs` kütüphaneyi yalnız
`usr/bin`'den çalışan bir program için orada arar (`linux_yolu`): program `APPDIR`'in içindeyse
ve bütün bağlar çözülünce kütüphane o bağlamanın içinde kalıyorsa (bir `.deb` olursa: program
`/usr/bin`'de, kütüphane root'un `/usr/lib/Mozaik`'inde), ve ne kütüphane ne klasörü grup ya da
başkaları tarafından yazılabiliyorsa. AppImage'da o klasör salt okunur bağlamanın içi. Kütüphanelerin `RUNPATH $ORIGIN`'i birbirini yanında bulduruyor.
`MOZAIK_ORTOOLS` yalnız debug derlemede okunur.

**Güncelleme.** Aşağıda, "Güncelleme"; `src-tauri/src/update_linux.rs`.

**Yayın.** `surum.yml`'in `linux` işi (ubuntu-22.04) yukarıdaki dört adımı ve açılışı koşar,
`Mozaik-linux-x86_64.AppImage`'ı verir; `sign` geldiyse imzalar, `publish` `linux_appimage*`
alanlarını yazar. Linux da yayını engellemez, Mac'in kuralıyla: iş düştüyse o sürümde AppImage
ve alanları yok, iş özetinde ve uyarıda "Linux paketi bu sürümde yok" yazar.
`.github/workflows/linux.yml` hafif ikizi: `src-tauri/**`'a dokunan PR'da, `main` push'unda ve
elle aynı paketi derler, sonra Ubuntu 22.04 ve 24.04 runner'larında (FUSE ile, çift tıklamanın
yolu) ve Debian 12, Fedora 42 kaplarında (`--appimage-extract-and-run`) xvfb altında açar.
Kapların kırmızısı işi kırmızı yapmaz, özette görünür: asgari bir kapta bir masaüstünün kurulu
getirdiği bir kütüphane eksik olabilir. Hiçbir şeyi kilitlemez.

### Mac

Aynı `src-tauri/`, macOS'ta derlenince `Mozaik.app` ve bir `.dmg` (DECISIONS 2026-11-15, "Mac
sürümü"). Mac'e özgü ayarların hepsi `src-tauri/tauri.macos.conf.json`'da; Tauri onu yalnız
macOS'ta `tauri.conf.json`'ın üstüne katar, Windows ayarı değişmez. İçinde: paket hedefleri
(`app`, `dmg`), en düşük macOS 11, ad-hoc imza (`signingIdentity: "-"`), sertleştirilmiş çalışma
zamanı her zaman açık (`hardenedRuntime`, DECISIONS 2026-11-16) ve onun tek istisnası
`src-tauri/macos/Mozaik.entitlements` (aşağıda, "CP-SAT"), program adı `Mozaik`
(`mainBinaryName`), `src-tauri/icons/Mozaik.icns` (`scripts/ikon-mac.mjs` üretir: çizim
1024'lük tuvalde 824 piksel, macOS 11'in ızgarası) ve Belgeler izninin cümlesi
(`src-tauri/macos/Info.plist`).

```sh
scripts/ortools-mac.sh arm64          # OR-Tools 9.15, özeti sabit; src-tauri/ortools/ ve tauri.ortools.json
npx vite build                        # cargo test'ten önce
MOZAIK_ORTOOLS=$PWD/src-tauri/ortools/libortools.9.dylib cargo test --manifest-path src-tauri/Cargo.toml
npx --yes @tauri-apps/cli@2.12.4 build --config src-tauri/tauri.ortools.json
# -> src-tauri/target/release/bundle/macos/Mozaik.app, bundle/dmg/Mozaik_<sürüm>_aarch64.dmg
```

Intel için `scripts/ortools-mac.sh x86_64` ve `build --target x86_64-apple-darwin` (çapraz
derleme, `rustup target add x86_64-apple-darwin`). Universal paket yok: iki mimari iki dosya.

**CP-SAT.** `scripts/ortools-mac.sh` resmi arşivi indirir, SHA-256'sını betikteki sabitle
karşılaştırır ve `libortools.9.dylib`'in `@rpath` kapanışını (`otool -L`, 99 dylib, 53 MB)
`src-tauri/ortools/`'a kopyalar; ürettiği `src-tauri/tauri.ortools.json` (depoya girmez) onları `bundle.macOS.frameworks` olarak
verir, Tauri `Contents/Frameworks`'e koyup tek tek imzalar (sır yoksa ad-hoc, varsa Developer ID).
Betik her dylib'in en düşük macOS'unu da okur ve 11.0 değilse durur. `cpsat.rs` kütüphaneyi
`Contents/MacOS/../Frameworks/` altında arar. Sertleştirilmiş çalışma zamanının kütüphane
doğrulaması yalnız aynı ekip kimliğiyle imzalı dylib'i yükler; ad-hoc imzada ekip kimliği yok ve
CP-SAT "different Team IDs" ile reddedildi (ölçüldü 2026-11-16). Ad-hoc pakete bu yüzden
`com.apple.security.cs.disable-library-validation` girer; Developer ID ile imzalanınca
`surum.yml` onu çıkarır (`entitlements: null`) ve doğrulama açık kalır. `DYLD_*` ile kütüphane
sokmak iki durumda da kapalı. Açılan güncelleme paketinde her bağ paketin içinde kalmalı
(`update_mac.rs`, `icerde_mi`). Arşivin adındaki `macOS-26.2` derlendiği makine,
en düşük sürüm değil (tuzak 157).

**Veri ve pencere.** Klasör `~/Documents/Ders Programı`; Tauri'nin `document_dir`'i `$HOME`'u
okuyor, yani `HOME=<sahte ev>` ile açılan program gerçek Belgeler'e dokunmaz (yerel denemelerde
böyle açıldı). Sayfanın deposu WKWebView'de, `~/Library/WebKit/com.dersprogrami.arac`. Menü
çubuğu Türkçe ve `lib.rs`'te (`mac_menusu`): Düzen menüsü olmayan bir Mac programında metin
kutularında Cmd+C/V/X/A çalışmaz. Cmd+Q bizim öğemiz, pencereyi kırmızı düğme gibi kapatır, yani
sayfa kapanmadan önce Belgeler'e yazar (TB7); hazır "Quit" öğesi süreci `CloseRequested`
olmadan bitiriyor. Dock'tan "Çık" ve oturum kapatma hâlâ o yoldan gidiyor.

**Yayın.** `surum.yml`'in `mac` işi iki mimariyi `macos-15`'te derler, paketin içine bakar
(`codesign --verify --deep --strict`, Frameworks, en düşük sürüm, mimari) ve
`Mozaik-mac-<mimari>.app.tar.gz` ile `Mozaik-mac-<mimari>.dmg`'yi verir. `sign` iki dosyası da
gelen arşivleri minisign ile imzalar, `publish` onları `surum.json`'a yazar (ikisi aşağıda,
"Yayın güvenliği"). Mac yayını engellemez (DECISIONS 2026-11-16): `sign` ve `publish` yalnız
`package` ve `exe`'nin yeşilini bekler; bir mimarinin işi düştüyse ya da hiç
koşmadıysa o mimarinin dosyaları ve `mac_*` alanları o sürümde yok, iş özetinde ve bir uyarıda
"Mac paketi bu sürümde yok" yazar, o Mac kopyaları da güncelleme önermez. Apple imzası bir anahtar: `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY` sırları tanımlıysa Developer ID ve
sertleştirilmiş çalışma zamanı, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` de varsa
notarization; yoksa ad-hoc. `.github/workflows/mac.yml` yayından önceki hafif ikizi: yalnız
arm64, Rust testleri CP-SAT'ın küçük modeliyle, `tauri build`, paketin içi ve programın yirmi
saniye ayakta kalması. Mac'e dokunan PR'da, `main` push'unda ve elle koşar, hiçbir şeyi kilitlemez.

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
| `Mozaik-Kurulum.exe` | Windows kurulum sihirbazı (2026-11-15'ten) |
| `Mozaik-mac-arm64.dmg`, `Mozaik-mac-x86_64.dmg` | Mac'in ilk kurulumu, Apple Silicon ve Intel (2026-11-15'ten) |
| `Mozaik-mac-arm64.app.tar.gz`, `Mozaik-mac-x86_64.app.tar.gz` | Mac kopyasının kendini güncellerken indirdiği paket |
| `Mozaik-linux-x86_64.AppImage` | Linux: hem ilk kurulum hem kendini güncellemenin indirdiği dosya (2026-11-16'dan) |
| `SHA256SUMS.txt` | öteki dosyaların özeti |
| `surum.json` | exe'nin "daha yeni bir sürüm var mı" diye okuduğu manifest: sürüm, tarih, exe'nin adresi, boyutu ve SHA-256 özeti |

Varlık adları yalnız ASCII, çünkü URL'de kodlanıyorlar. Release sayfasının
gövdesini `surum.yml` etiket anında `scripts/surum-notu.mjs` ile kuruyor, üç
parçadan: `src/platform/changelog.ts`'teki Türkçe Yenilikler satırları (uygulamanın
içindeki panelin aynısı), [CHANGELOG.md](../CHANGELOG.md)'nin o sürüme ait bölümü,
ve her sürümün paylaştığı kurulum ve indirme metni `.github/surum-notu.md`. İkisinden
biri boşsa iş durur, boş bir "yenilikler" yayınlanmaz. 2.2.0'a kadar sayfa yalnız
kurulum metnini taşıyordu (kullanıcının isteği, 2026-09-26).

## Yayın güvenliği

Babanın makinesindeki exe yalnız bizim anahtarımızla imzalanmış bir programı kurar
(`update.rs`, `imza_dogru`), yani bütün zincirin en değerli tek şeyi imza anahtarının gizli
yarısı. Kurallar (DECISIONS 2026-11-16):

- **Anahtarı tek iş görür.** `surum.yml`'in `sign` işi, `environment: release` ile; Windows'un
  iki programını ve gelen her Mac arşivini o imzalar. Sır depo
  düzeyinde değil o ortamda, ortamı yalnız `v*` etiketleri kullanabilir. `sign` kod derlemez,
  npm koşturmaz, yazma token'ı taşımaz: exe artefaktını indirir, iki programı imzalar, iki
  `.minisig` yükler. Anahtar dosyası `trap ... EXIT` ile adım nasıl biterse bitsin silinir.
  Release'i yazan `publish` işi anahtarı hiç görmez. Elle koşuda (`workflow_dispatch`)
  yayın ancak bir `v*` etiketinin üstünde koşturulursa imzalanır.
- **Yayın derlemesi kurulum betiği koşturmaz ve önbellek kullanmaz** (Windows ve Mac işleri).
  `npm ci --ignore-scripts`: lock'ta betiği olan tek paket `fsevents` (yalnız macOS), esbuild ve
  rolldown'un ikilileri `optionalDependencies`'ten iner; `npm ci --ignore-scripts && npm run
  build && npm run paket` temiz bir kopyada ölçüldü (2026-11-16). `setup-node`'un npm önbelleği
  ve `rust-cache` `surum.yml`'den çıktı: önbelleği başka dallardaki koşular da besler.
- **Her eylem tam commit SHA'sıyla, sürümü yanında yorum.** Birinci taraf (`actions/*`) da.
  Dependabot SHA'yı ve yorumu birlikte günceller. Tauri CLI `@tauri-apps/cli@2.12.4` sabit.
- **Exe'nin sayfası katı bir CSP altında** (`tauri.conf.json`, `security.csp`): `default-src
  'none'`, betik yalnız `'self'` ve Tauri'nin satır içi betiklere eklediği özetler, worker yalnız
  `blob:` (öneri araması), font ve resim `data:`, `connect-src` yalnız Tauri'nin IPC'si. Uzak
  köken yok: güncellemeyi Rust indirir, CSP onu kapsamaz. `style-src` `'unsafe-inline'`
  taşır ve Tauri'ye dokundurulmaz (`dangerousDisableAssetCspModification`, tuzak 165).
  `e2e/csp.spec.ts` derlenmiş sayfayı Tauri'nin hesabıyla aynı başlık altında açıp örneği,
  Otomatik diz'i (worker'larla), Çıktı'yı, PDF'i ve kaydetmeyi yürür. `withGlobalTauri` açık
  kalıyor: köprü `src/platform/exe/desktop.ts`'te tek yerde ama E2E'nin sahte köprüsü ve
  WebDriver sürücüsü `window.__TAURI__`'ya dayanıyor, kapatmak `@tauri-apps/api`'yi `dist`'e
  sokmak olurdu.
- **CP-SAT yalnız kurulu kopyanın klasöründen** (`cpsat.rs`, `kutuphane_yolu`): Windows'ta
  yanında `uninstall.exe` olmayan bir exe `ortools.dll` aramaz (İndirilenler'e bırakılmış bir
  DLL yüklenmesin), kütüphane `LoadLibraryExW` ile yalnız kendi klasörü ve System32'de arama
  yaparak açılır. `MOZAIK_ORTOOLS` yalnız debug derlemede okunur. `uninstall.exe` bir kanıt değil,
  bir eşik: DLL bırakabilen `uninstall.exe` de bırakabilir; durdurduğu, sıradan bir indirme klasörü.
- **İndirme beklenen boyutta kesilir** (`update.rs`, `sinirli_ekle`): parça parça okunur,
  manifestin `boyut`'unu ya da 256 MB'ı aşan ilk parçada durur. Kurulum her seferinde
  `%TEMP%`'in altında yeni, tahmin edilemez adlı bir klasöre yazılır (`yeni_gecici_klasor`,
  `create_dir` var olan adı reddeder) ve oradan çalıştırılır; önceki indirmelerin klasörleri yeni
  indirmeden önce silinir (`eski_gecici_klasorleri_sil`).

### GitHub ayarları

Bunlar kodda değil depo ayarında, ve `gh api` ile bir kez yapılır. Sıra önemli: ortam ve sır
önce, depo sırrı ondan sonra silinir. Sır silindikten sonra bir yayın ortam sırrını bulamazsa
`sign` "sırrı tanımlı değil" diyerek durur, imzasız bir şey yayınlanmaz.

```sh
R=AlparslanSemiz/Mozaik

# 1. `release` ortamı, onaylayıcı yok, yalnız seçilmiş ref'ler.
gh api -X PUT repos/$R/environments/release \
  -F 'deployment_branch_policy[protected_branches]=false' \
  -F 'deployment_branch_policy[custom_branch_policies]=true'

# 2. O ref'ler: yalnız `v*` etiketleri (dal kuralı yok, yani hiçbir dal giremez).
gh api -X POST repos/$R/environments/release/deployment-branch-policies \
  -f name='v*' -f type=tag

# 3. Gizli anahtar ortama (değer, şifreleme gerektirdiği için `gh api` değil `gh secret`).
gh secret set MOZAIK_IMZA_ANAHTARI --env release --repo $R < ~/.config/mozaik-imza/mozaik.key

# 4. Depo düzeyindeki eski sır silinir.
gh api -X DELETE repos/$R/actions/secrets/MOZAIK_IMZA_ANAHTARI

# 5. `v*` etiketleri: yalnız yönetici (RepositoryRole 5 = admin, yani `npm run yayinla`)
#    açar, kimse taşıyamaz ya da silemez. Bir Actions token'ı yeni bir sürüm etiketi açamaz.
gh api -X POST repos/$R/rulesets --input - <<'JSON'
{
  "name": "surum-etiketleri",
  "target": "tag",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [
    { "type": "creation" },
    { "type": "update" },
    { "type": "deletion" },
    { "type": "non_fast_forward" }
  ],
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }]
}
JSON

# 5b. Yeni adresin deploy anahtarı (site.yml, `yeni-adres`; "Alan adına geçiş"): kendi
#     ortamında, yalnız `main` dalı girer. Depo sırrı olarak hiç tanımlanmaz.
gh api -X PUT repos/$R/environments/mozaik-site \
  -F 'deployment_branch_policy[protected_branches]=false' \
  -F 'deployment_branch_policy[custom_branch_policies]=true'
gh api -X POST repos/$R/environments/mozaik-site/deployment-branch-policies \
  -f name=main -f type=branch
gh secret set MOZAIK_SITE_DEPLOY_KEY --env mozaik-site --repo $R < mozaik_site
# Daha önce depo sırrı olarak eklendiyse:
gh api -X DELETE repos/$R/actions/secrets/MOZAIK_SITE_DEPLOY_KEY || true

# 6. SHA'ya sabitlenmemiş bir eylem hiçbir iş akışında koşmasın.
gh api -X PUT repos/$R/actions/permissions \
  -F enabled=true -f allowed_actions=all -F sha_pinning_required=true
```

Denetim, her adımdan sonra ya da sonda:

```sh
gh api repos/$R/environments/release --jq '.deployment_branch_policy'
gh api repos/$R/environments/release/deployment-branch-policies --jq '.branch_policies[] | [.name, .type]'
gh secret list --env release --repo $R     # MOZAIK_IMZA_ANAHTARI
gh secret list --repo $R                   # MOZAIK_IMZA_ANAHTARI yok
gh api repos/$R/rulesets --jq '.[] | [.name, .target, .enforcement]'
gh api repos/$R/actions/permissions        # "sha_pinning_required": true
```

## Sürüm numarası

Numaranın tek kaynağı `package.json`, ve `scripts/surum.mjs` onu okur.
`tauri.conf.json` numarayı kopyalamaz, `"../package.json"` yolunu gösterir.
`Cargo.toml`'daki numarayı `yayinla.mjs` yazar, çünkü cargo başka bir dosyadan
numara okumuyor. `package-lock.json`'ın kökündeki iki numarayı da o yazar
(`scripts/kilit-surumu.mjs`, TODO B7.32), yoksa sonraki `npm install` onları değiştirip
ağacı kirletir. İki Vite config `define: { __SURUM__ }` ile numarayı derlemeye
basar ve `src/leaf/app/version.ts` onu okur (tanımsızsa `0.0.0-dev`'e düşer, yoksa `tsc`
ve Vitest modül yüklenirken çöker). Aynı damga `dist-site/sw.js`'in önbellek
adına girer. Ayarlar → Hakkında hangi sürüm olduğunu gösterir. Bu bir derleme
bayrağı değil, dört teslim yoluna basılan aynı damga.

`src/surum.test.ts` bunları her koşuda ölçer: `package.json`, `Cargo.toml` ve
`package-lock.json`'ın kökünün aynı numarayı söylediğini, `tauri.conf.json`'ın yol gösterdiğini, `identifier`'ın
değişmediğini (tuzak 95), exe penceresinin ayarlarını, `surum.yml`'in manifeste
yazdığı adres ile `update.rs`'in kabul ettiği öneklerin anlaştığını (tuzak 106),
`CHANGELOG.md`'nin en üst sürümünün `package.json` ile aynı olduğunu, ve
`.github/surum-notu.md` ile `yayinla.mjs`'teki site adresinin `SITE_ADRESI` olduğunu.

`npm run yayinla -- X.Y.Z` bir sürümü tek komutta çıkarır. Önce kapılar: komut ana
klasörde (bir worktree değil) ve `main`'de, çalışma ağacı temiz, etiket daha önce atılmamış, `src/platform/changelog.ts`'in en
üstteki girdisi bu sürüm, ve `CHANGELOG.md`'nin `Unreleased` bloğu boş değil.
Kapılara 2026-10-08'de beşincisi eklendi: oturumu açık bir `gh`, çünkü aşağıdaki
bekleme onsuz yapılamaz ve bu, hiçbir şey yazılmadan önce sorulur.
Sonra `package.json`, `Cargo.toml` ve `package-lock.json` yazılır, `CHANGELOG.md`'deki
`Unreleased` bloğu bu sürüm numarasına ve bugünün tarihine kapanır, ve dördü tek commit olur.
Önce yalnız `main` itilir, ve o commit'in `ci.yml` koşusu, sonra `windows.yml` koşusu,
sonra `exe-windows.yml` koşusu (yoksa `main`'de başlatılarak) bulunup sonuna kadar
beklenir, dördüncü olarak güncelleme kapısı `guncelleme-windows.yml` da (aşağıda), her
sürümde, beşinci olarak kurulum kapısı `kurulum-windows.yml` (2026-11-16). Hepsi yeşilse etiket annotated atılır, adıyla itilir
ve uzakta göründüğü doğrulanır, çünkü unutulan bir etiket başarılı bir sürüm gibi
görünür: site güncellenir, üç indirme dosyası eski kalır. Biri kırmızıysa, iptal
edildiyse ya da hiç görünmediyse etiket atılmadan durur. Site yalnız `ci.yml`'in
arkasında, yani bir Windows kırmızısında site güncellenmiş, exe güncellenmemiş olur.
Windows'un beklenmesinin sebebi etiketin babanın exe'sine gitmesi ve babanın
makinesinin Windows olması (2026-10-09; gerçek exe 2026-10-10'da katıldı). Düzeltip itince aynı komut yeniden verilir,
ve `package.json` zaten o sürümde olduğu için yalnız etiket atılır. 2026-10-08'e kadar
commit ile etiket tek push'la gidiyordu, yani etiket testten önce atılıyordu.

Yer kapısı 2026-10-09'da geldi, argümanlardan bile önce ve `--kuru`'da da: iş dallarda ve
geçici worktree'lerde yürüyor, ve başka yerden çıkan bir sürüm sitenin
yayınlamadığı bir commit'i etiketlerdi. Git `main`'i iki yerde açtırmıyor, ama bir
worktree `main`'in commit'inde ayrık durabilir.

`npm run yayinla -- --kuru` depoda hiçbir şeyi değiştirmez: itilmiş `HEAD`'in `ci.yml`,
`windows.yml`, `exe-windows.yml`, `guncelleme-windows.yml` ve `kurulum-windows.yml` koşularını bulur, bekler, sonucu söyler ve etiket adımında durur. Üç exe iş akışı her push'ta
koşmadığı için commit'in koşusu yoksa onu `main`'de başlatır (2026-10-10, güncelleme kapısı
2026-10-24, kurulum kapısı 2026-11-16).

**Güncelleme kapısı (2026-10-24, `guncelleme-windows.yml`).** Babanın bugünkü exe'sinden bu
commit'in exe'sine geçişin kendisi: son Release'in `Mozaik.exe`'si indirilir ve özeti
`SHA256SUMS.txt`'le karşılaştırılır, bir klasöre kurulur ve kendi elleriyle veri üretir
(örnek okul ve otomatik dizilmiş hafta; yayınlanan exe'de hata ayıklama portu olmadığı için
Windows UI Automation ile, `scripts/uia.mjs`), X ile kapanır
(`scripts/guncelleme-eski.mjs`). Yayınlanan exe yalnız GitHub'dan güncellenebildiği için
yerine dosya takasıyla bu commit'in bir test kopyası konur: 0.0.1 numaralı, `update.rs`'in
kökleri derleme anında yerel bir sunucuya verilmiş (`MOZAIK_TEST_GUNCELLEME_KOKU`; yayınlanan
exe'de yok, `kontrat.test.ts` surum.yml'in onu hiç anmadığını ve iki gerçek kökü soruyor).
Test, o sunucuda bu commit'in exe'sini bir Release gibi yayınlar (`surum.json`: sürüm, adres,
boyut, özet), ve eski kopya Ayarlar → Hakkında'nın üç düğmesiyle onu bulur, indirir,
doğrular, kendi dosyasını değiştirir ve yeni sürümü başlatır. Yeni sürümde kurulu dosyanın
yayınlanan dosya olduğu, `.eski`'nin silindiği, ekrandaki numara, ve eski sürümün yazdığı her
değerin depoda ve Belgeler'deki pakette, bu commit'in şemasında durduğu, hiçbir listenin
boyunun değişmediği ve günlük kopyaların silinmediği sorulur (`e2e/guncelleme-exe.spec.ts`). Exe'ye, şemaya ya da depolama koduna dokunan bir `main`
push'unda (sürüm commit'i dahil) ve elle koşar; `yayinla` onu her sürümden önce, koşulsuz
bekler (kullanıcının kararı, 2026-10-24).

İkinci evre babanın kendi yolu (2026-11-16, tuzak 164): yukarıdaki eski kopya bu commit'in
kodu, 2.2.0'ınki değil. Yayınlanmış v2.2.0 (özeti sabit) `Ders-Programi.exe` adıyla açılır;
manifest adresi içine derlenmiş olduğu için github.com runner'da geçici olarak bu makineye
çevrilir (hosts dosyası ve makinenin güvendiği tek günlük bir sertifika, adım bitince ikisi de
geri alınır), ve 2.2.0 kendi üç düğmesiyle bu commit'in exe'sine geçer. Yeni exe kurulum
şeridini göstermeli, kendi denetimi aynı sürümün kurulumunu önermeli ve istemeli
(`scripts/guncelleme-220.mjs`). Kurulumun imzası orada yok; kurulum yolu aşağıda.

**Kurulum kapısı (2026-11-16, `kurulum-windows.yml`).** Kurulum `surum.yml`'deki gibi
OR-Tools'la derlenir; tek başına bir test exe'si (güncelleme kökü yerel sunucuda, aynı numara)
kendi düğmeleriyle aynı sürümün kurulumuna geçer, bekleyici kurulumu `/P /R` ile çalıştırır,
kurulan program açılıp notunu yazar, beklenen dosyalar (CP-SAT'ın 9 DLL'i ve VC++) kurulum
klasöründedir, eski dosya yerindedir ve yeniden açılınca kurulan programı açar
(`scripts/kurulum-gecisi.mjs`). Sonra `cpsat.rs`'in küçük modeli kurulan `ortools.dll`'le
cevap verir, ve kaldırıcı programı siler, Belgeler'deki yedeği ve profili bırakır. Kuruluma ve
güncellemeye dokunan bir `main` push'unda ve elle koşar; `yayinla` bekler.

**Etiketten önce gerçek exe'de pencere kapanışı (2026-10-24, kullanıcının kararı, TODO TB7).**
`e2e/gercek-exe.spec.ts`'in "X ile hemen kapanan pencere…" testi etiketten önce Windows'ta
gerçek `Mozaik.exe`'ye karşı yeşil olur: son değişiklik, başlık çubuğunun kapatma mesajıyla
kapanış (WM_CLOSE, `scripts/pencere-kapat.mjs`), Belgeler'deki dosyada değişiklik, yeniden
açılışta değişiklik yerinde. Test `exe-windows.yml`'in süitinde, ve `yayinla` etiketten önce o
koşunun yeşilini bekliyor (yukarıda), yani elle bir adım yok. Linux'ta `npm run exe:e2e` ile
her sürümden önce koşuyor.

## İşaret ve ikon

İşaret indigo zemin üstünde iki kancaya asılı bir duvar takvimi sayfası
(2026-10-23, kullanıcının seçtiği resimden ölçülerek elle çizildi). İki çizimi var.
`site/icon.svg` ayrıntılı çizim (iki kanca, beş ders sütunu),
`site/icon-small.svg` küçük boylar için sade çizim (kancasız sayfa, üç ders,
yalnız dikdörtgen). Sadenin bütün kenarları 16 px'te tam piksele düşüyor;
ayrıntılının yatay kenarları 32 px'te, sütunları ise sayfada ortalı olduğu için
orada yarım piksel kayık. `scripts/ikon.mjs` `.ico`'ya 16, 20 ve 24 px'i
sade, 32 px ve üstünü ayrıntılı çizimden yazar (`SADE_ALTINDA = 32`). `.ico`
Windows'un isteyebileceği dokuz boyu taşır: 16, 20, 24, 32, 40, 48, 64, 128 ve 256.

| Nerede | Hangi çizim | Niçin |
|---|---|---|
| Sekme (favicon, `index.html`) | sade | bir sekme simgesi 16 ile 32 px arasında çizilir |
| `kurulum/icon.ico` 16, 20 ve 24 px | sade | 16 px'te ayrıntılı çizimin kancaları ve sütun aralıkları bir lekeye dönüyor, 24 px'te hâlâ bulanık |
| `kurulum/icon.ico` 32 px ve üstü | ayrıntılı | 32 px'te kancalar ve beş sütun ayrı okunuyor |
| PWA 192 ve 512 PNG | ayrıntılı | yer var |
| Üst çubuk (`.brand-mark`) | sade | `1.75rem`, kök 13 px iken 22,75 px |

Windows %100 ölçekte görev çubuğunda 24 px'i gösteriyor, yani orada sade çizim
görünüyor. Kuralın gerekçesi [DECISIONS.md](DECISIONS.md)'de (2026-10-23), dersleri
tuzak 78 ve 101'de.

Çizim üç yerde duruyor: svg dosyaları, `index.html`'in `data:` URI'si ve
`App.tsx`'teki satır içi SVG. Ayrışmaları `temel.spec.ts` 72 (URI ile
`icon-small.svg`) ve `kabuk.spec.ts` 76 (üst çubuk ile svg) ile yakalanıyor.
`scripts/favicon.mjs` URI'yi yeniden üretir, URI elle düzenlenmez (tuzak 93).
Yayınlanmış exe'nin içine gerçekten hangi boyların gömüldüğünü
`scripts/exe-ikon.mjs` okur ve `surum.yml`'in `exe` işi onu bir kapı olarak koşar.

## Güncelleme

Program kendini üç ayrı yoldan günceller, ve üçünde de kullanıcı istemeden hiçbir
şey değişmez. Kararın hangi yolda nasıl işlediği `src/platform/update.ts`'te.

**`sw`: site ve yerel kurulum.** Yeni bir service worker devraldığında
(`controllerchange`) açık duran sayfada bir şerit çıkar ve yeni sürümün hazır
olduğunu söyler. `Yenile` denene kadar hiçbir şey değişmez, `Sonra` denince o
oturumda bir daha sorulmaz (`sessionStorage`). Kurulum yolunda `Guncelle.cmd` en
yeni sürümü internetten alır, internet yoksa yanındaki paketi kurar.

**`exe`.** Ayarlar → Hakkında'da üç ayrı düğme var: `Denetle`, `İndir`,
`Şimdi yeniden başlat`, çünkü üçü üç ayrı karar. Ağa yalnız tıklanınca çıkılır:
açılışta, arka planda ya da bir zamanlayıcıyla değil. İnternet yoksa sonuç bir
cümle olur ve program çalışmaya devam eder. `src-tauri/src/update.rs` indirilen
dosyanın `MZ` ile başladığını, boyutunun ve SHA-256 özetinin manifesttekiyle tuttuğunu
doğrular (özet 2026-10-24'ten beri; özeti olmayan bir manifestteki yeni sürüm indirilmez,
elle indirme adresi söylenir), adresin yalnız bu deponun Release öneklerinden gelmesine izin
verir, takası çalışan programın kendi
dosya adı üstünden yapar (`current_exe()` ile `.yeni` ve `.eski`), ve takas
yarıda kalırsa eski programı yerine geri koyar. `.eski` yeni sürümün sayfası
yüklendikten sonra silinir, açılışın ilk satırında değil: pencere açamayan bir yeni sürüm
geri dönülecek kopyayı silmemiş olur. İndirme ve takas yalnız
Windows'ta, Mac'te ve Linux'un AppImage'ında yapılır (`self_update_here`): Linux ikilisinin
(AppImage değil) manifestte kendi dosyası yok, ve `MZ` denetimi platformu değil biçimi soruyor, yani Windows exe'sini kendi üstüne
yazardı (tuzak 126). Babanın makinesindeki
`Ders-Programi.exe` bu yüzden `Mozaik.exe`'yi indirir ve kendi adıyla yerine
koyar: dosya adı eski kalır, içindeki program yenidir. Manifest bir kurulum
taşıyorsa (`kurulum`, 2026-11-15'ten) aynı üç düğme kurulumu indirir. İndirmenin toplam süre
sınırı yok: bağlantıya 20 s, hiç bayt gelmeyen 60 s'de bırakılır, Ayarlar yüzdeyi gösterir
(2026-11-16'ya kadar toplam 300 s'ydi, tuzak 172). Kurulmamış bir kopyaya
kurulum aynı sürümde de önerilir (`gecis`, `windows_karari`; 2026-11-16): sahadaki 2.2.0 tek
dosyayı takas eder ve o exe yoksa kendini güncel bulurdu (tuzak 161). Güncellemeden sonraki
ilk açılışta şerit bunu bir kez söyler (`guncelleme_durumu`, ağsız). "Şimdi kur" kurulumu
kendisi çalıştırmaz: kurulumun kendi taze geçici klasörüne kopyalanan bir bekleyici
(`Mozaik-kurulum-bekleyici.exe`, `bekleyici_yolu`; 2026-11-16'ya kadar sabit bir `%TEMP%` yolu)
programın kapanmasını bekler, kurulumu `/P /R` ile çalıştırır (ilerleme çubuğu, hata kutusu)
ve bitmezse eski kopyayı `--kurulum-olmadi <kod>` ile yeniden açar (tuzak 163). Eski dosya
silinmez: kurulan program yolunu profil klasöründeki `update.rs`'in `KURULU_NOTU`'na yazar,
ve tek başına kopya onu bulunca, kurulan program en az kendisi kadar yeniyse, kurulan programı açıp
çıkar (`kurulu_program`, tuzak 162; geliştirme derlemesi açmaz). Bekleyici kurulumun özetini
çalıştırmadan hemen önce yeniden denetler.
CP-SAT sorusu sürerken exe kendi sürecini `BELOW_NORMAL`'a indirir (`cpsat.rs`).

**`exe`, Mac'te.** Aynı üç düğme ve aynı iki kilit (özet ve minisign imzası, güvenilen yorum
`mozaik <sürüm> Mozaik-mac-<mimari>.app.tar.gz`). Mac kopyası manifestten yalnız kendi mimarisinin
`mac_*` alanlarını okur. İndirme paketin yanındaki gizli `.Mozaik.app.yeni`'ye yazar; "Şimdi
yeniden başlat" arşivi yeniden özetler, açar ve çalışan `.app` ile `renamex_np(RENAME_SWAP)` ile
tek adımda yer değiştirir (`src-tauri/src/update_mac.rs`). Program dmg'den ya da App
Translocation'dan çalışıyorsa indirmeden önce "Mozaik'i Uygulamalar klasörüne taşıyın" der.

**`exe`, Linux'ta (AppImage).** Aynı üç düğme ve aynı iki kilit (güvenilen yorum
`mozaik <sürüm> Mozaik-linux-x86_64.AppImage`); manifestten yalnız `linux_appimage*` okunur.
Program AppImage'ın salt okunur bağlamasından çalışır, değiştirilen dosya kişinin açtığı
AppImage: `APPIMAGE`, yalnız program `APPDIR`'in içindeyse inanılır (tuzak 177). İndirme
dosyanın yanına `.yeni` olarak yazılır ve çalıştırılabilir yapılır (ELF ve `AI\x02` imi, boyut,
özet, imza önce). "Şimdi yeniden başlat" `.yeni`'yi yeniden özetler, eskisini `.eski` sabit
bağıyla korur ve `.yeni`'yi tek `rename` ile onun yerine koyar: o yolda Mozaik'siz bir an yok.
Yeni sürüm başlatılamazsa (`spawn` düşerse) `.eski` geri konur; başlarsa sayfası yüklenince
`.eski`'yi siler, sayfasını çizemeyen bir yeni sürüm `.eski`'yi silmez. Klasör
yazılamıyorsa (`/opt`) indirmeden önce "ev klasörünüzde yazabildiğiniz bir yere taşıyın" der
(`src-tauri/src/update_linux.rs`).

**`yok`: çift tıklanan `.html`.** Bir dosya kendini değiştiremez. Program en son
sürümün nerede olduğunu (`SITE_ADRESI`) gösterir. Geliştirme makinesinin Chrome app modu
("Linux uygulaması") da bu yolda: güncellemesi `scripts/linux-kur.sh`'yi yeniden çalıştırmak.

**Adresler.** `update.rs`'in `RELEASE_KOKLERI`'si iki önek tanır, depo
`ders-programi` ve `Mozaik` adıyla. Liste yalnız uzar, çünkü dağıtılmış bir
kopyaya sonradan önek öğretilemez. `surum.yml` manifeste eski adlı adresi
yazar, GitHub onu yeni ada yönlendirir, yani tek adres eski ve yeni kopyaların
ikisini de doyurur. GitHub Pages bir depoyu adıyla yayınladığı ve yönlendirme
yapmadığı için `SITE_ADRESI` `https://alparslansemiz.github.io/Mozaik/`
(tuzak 106). Alt alan adına geçişte `src/leaf/app/adres.json`'ın anahtarını izler
(yukarıda, "Alan adına geçiş").

## Font

Font ağdan çekilmez (açılış ağa bağlı değil), `src/fonts/` altındaki `woff2` dosyası `dist/index.html`'e
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
