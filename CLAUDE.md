# CLAUDE.md — Ders Programı Aracı

Babamın dershanesinde haftalık ders programını dizmek için kullanacağı araç.
aSc Timetables'ın yerini alacak. aSc'nin yaptığı işin bu kursla ilgili %50'sini
yapıp o %50'yi aSc'den iyi yapmak hedefi.

Ayrıntılı çerçeve: [docs/PLAN.md](docs/PLAN.md) · Durum: [docs/STATUS.md](docs/STATUS.md) · Görevler: [docs/TASKS.md](docs/TASKS.md)

**Rakip ne yapıyor:** [docs/ASC.md](docs/ASC.md) — aSc'nin 19 bölümü, hangisi
alındı, hangisi bilerek alınmadı, hangisi sırada. Hedef %50'ye çıktığından beri
bu dosya projenin **özellik pusulası**. Altındaki `docs/asc/` üretilir: `asc-sozluk.mjs` (2940 arayüz
metni, EN ↔ TR), `asc-yardim.mjs` (528 yardım konusu), `asc-ekran.ps1`
(pencere yakalama). Üçü de `npm run kontrol`'ün parçası değil — `font` ve
`exe` gibi, bu depoda olmayan bir şeye bağlılar.

---

## Değişmez ilkeler

Her özellik kararında bu listeye dönülür. Listeyle çelişen özellik yazılmaz.

1. **Çift tıkla çalışır.** İndir, çift tıkla, çalışsın. Hesap yok, şifre yok.
   > **KURULUM YASAĞI KALKTI (2026-08-30, kullanıcı kararı).** Eski hâli
   > *"Kurulum yok. Sihirbaz, hesap, şifre, güncelleme yok"* idi. Kurulum artık
   > serbest — ve zaten yarısı yapılmıştı: `kurulum/Kur.cmd`, `dist-kurulum/`
   > ve `Ders-Programi.exe` üç ayrı teslim yolu.
   >
   > **Kalan iki şey ve ikisi de yasak değil bir SÖZLEŞME:** hesap/şifre
   > sorulmaz, ve **kurulmadan da çalışan bir yol hep kalır** —
   > `dist/index.html` çift tıklanır. Bir kurulum bir *seçenek* olabilir,
   > tek kapı olamaz: kurulamayan bir makinede program açılmıyorsa ilke 1
   > diye bir şey kalmaz.
   >
   > **Netleştirildi (2026-08-27): "güncelleme yok" = ZORLANAN güncelleme yok.**
   > Site yolunda program yeni bir sürümün geldiğini **söyler** ve orada durur:
   > `Yenile` denene kadar hiçbir şey değişmez, `Sonra` denince o oturumda bir
   > daha sorulmaz. Yasaklanan şey buydu — kendiliğinden değişen bir arayüz,
   > kapatılamayan bir bildirim, sürüm sorulan bir açılış ekranı. Söylenmeyen
   > bir güncelleme ise başka bir şeyi bozuyordu: baba bir kusur bildiriyor,
   > düzeltiliyor, ve düzeltmenin ona ulaşıp ulaşmadığını **iki taraf da**
   > göremiyordu. Çift tıklanan dosya hâlâ hiçbir yere bağlanmaz.
   >
   > **Genişletildi (2026-08-27): `.exe` kendini güncelleyebilir.** Sözleşme
   > yine aynı: ağa **yalnız tıklanınca** çıkılır. Açılışta yok, arka planda
   > yok, zamanlayıcı yok, ve üç ayrı düğme var (`Denetle` → `İndir` →
   > `Şimdi yeniden başlat`) çünkü üçü üç ayrı karar. İnternet yoksa tek sonuç
   > bir cümledir ve program çalışmaya devam eder. Yasaklanan şey hâlâ
   > yasak: kendiliğinden değişen bir arayüz, kapatılamayan bir bildirim,
   > sürüm sorulan bir açılış ekranı. Gerekçe `kurulum/kur.ps1`'de zaten
   > yazılıydı: *ilke 3 programın kendisi hakkındadır; çalışan sayfa hiçbir
   > yere bağlanmaz, bir güncelleme bağlanır, çünkü işi budur.*
2. **Sunucu yok.** Backend, veritabanı, deploy, domain yok.
   > **PAYLAŞMA YASAK DEĞİL (2026-08-30, kullanıcı kararı: "babam istedi").**
   > Programın çıktısını **e-postayla ve WhatsApp'la göndermek** yapılacak
   > özellikler arasında. İlke 2'yi bozmuyor ve sebebi şu: paylaşılan şey bir
   > **dosya** — bir PNG, bir PDF, bir bağlantı — ve onu taşıyan şey işletim
   > sisteminin kendi paylaşım yolu. Ortada bizim bir sunucumuz yok, hesap yok,
   > oturum yok, yüklenen bir veri yok.
   >
   > **aSc'nin "Sharing"i BU DEĞİL** ve karıştırılmamalı: orada program veriyi
   > EduPage'e yüklüyor, öğretmene ve veliye hesap açıyor, şifreyle kimin neyi
   > gördüğünü ayarlıyor. O hâlâ hayır — ilke 2 ve yasak listedeki
   > "kullanıcı hesapları".
   >
   > Ağ kuralı güncellemeninkiyle aynı: **yalnız tıklanınca**. Program
   > kendiliğinden hiçbir şey göndermez.
3. **İnternet gerekmez.** CDN'den tek bir dosya bile çekilmez. Font **ağdan
   çekilmez** — gömülü font serbest, bkz. aşağıdaki güncelleme.
4. **Türkçe KAYNAK dildir.** Beş dil konuşulur (tr · en · de · es · fr) ama
   biri ötekilerin arasında değil: **anahtar Türkçe cümlenin kendisidir.**
   `t('Öğretmenler')` yazılır, `t('setup.teachers')` değil.
   > **Yeniden yazıldı (2026-08-28).** Eski hâli *"Tek dil. i18n altyapısı yok,
   > string dosyası yok — doğrudan Türkçe yazılır"* idi ve iki sürüm boyunca
   > yanlıştı: altyapı v2.0.0'da kuruldu, sözlük bu turda tamamlandı (786
   > anahtar × 4 dil). Değişmeyen üç şey var ve kısıt onlar:
   >
   > - **JSX Türkçe okunur.** `Teachers.tsx`'i açan, ekranda çıkacak cümleyi
   >   görür — bu dosyalar iki yıl öyle yazıldı ve öyle gözden geçirildi.
   >   Altı yüz isim uydurulmaz, ve hiçbir isim temsil ettiği cümleden sapamaz.
   > - **Eksik çeviri doğru TÜRKÇEYE düşer.** Bitmemiş bir sözlüğün arıza
   >   biçimi "bu satır hâlâ Türkçe"dir, babanın ekranında
   >   `setup.teachers.title` değil.
   > - **`State`'e giren hiçbir metin çevrilmez.** Gün ve branş adları depoda
   >   Türkçe kalır, ekranda çevrilir (`names.ts`). Yedek dosyası her makinede
   >   aynı şeyi anlatır; `remapDays()` hâlâ isimden eşler (tuzak 11).
   >
   > Bedeli de yazılı: Türkçe metni düzenlemek çevirisini **öksüz** bırakır.
   > `i18n.test.ts` bunu dört sözlükte birden yakalar, ve yorumları ayıklayarak
   > yakalar (tuzak 87).
   >
   > **VİTRİN İNGİLİZCE (2026-08-30, kullanıcı kararı).** Depoya **dışarıdan**
   > bakan ne varsa İngilizce: `README.md`, `LICENSE`, `.github/surum-notu.md`,
   > iş akışlarının adları/işleri/girdileri/adımları (hepsi Actions arayüzünde
   > görünüyor), `package.json` ve `Cargo.toml`'un `description`'ları.
   > **`CLAUDE.md`, `docs/`, `.claude/` ve `.mcp.json` TÜRKÇE KALIR** — onlar
   > projenin hafızası ve kararların alındığı dilde duruyorlar; README bunun
   > sebebini de yazıyor.
   > İki istisna bilerek: `surum-notu.md`'nin sonunda **üç satır Türkçe**
   > kurulum özeti var (o metin her Release sayfasının gövdesi, yani babanın
   > indirirken gördüğü sayfa), ve `kurulum/OKU.txt` baştan sona Türkçe.
   > Programın kendisi de öyle: arayüzün varsayılanı hâlâ Türkçe.
5. **Veri kaybı kabul edilemez.** Her şey her an dışa aktarılabilir.
6. **Kolay kullanılabilir ve yenilikçi.**
7. **Şık ve modern.**
8. **Hedef makine yavaş** — ama bu bir **varsayım**, gerekçe değil; bkz.
   aşağıdaki güncelleme.

> **KALDIRILDI (2026-08-30, kullanıcı kararı): "Bir dönem kullanılmadan özellik
> eklenmez."** İki yıl boyunca 5. ilkeydi ve tam metni şuydu: *"Tahmine dayalı
> özellik = yanlış özellik."* Yerine geçen bir kural **yok**; yerine geçen şey
> iki yeni ilke (6 ve 7) ve bir hedef değişikliği — aSc'nin kursla ilgili
> kısmının %10'u değil **%50'si**, ve ondan iyisi.
>
> **Bu bir gevşetme değil bir YÖN değişikliği, ve ikisini karıştırmamak önemli.**
> Eski ilke "elde veri yokken yazma" diyordu ve karşılığında bir bekleme
> öneriyordu: babanın bir dönem kullanması. Yeni duruş özelliği rakibin
> gerçekten yaptığı işten türetiyor — [docs/ASC.md](docs/ASC.md) tam da bunun
> için var, ve orada aSc'nin 528 yardım konusu ile 2940 arayüz metni okunabilir
> hâlde duruyor. Yani "tahmin" ile "ölçülmüş bir rakip davranışı" artık aynı
> şey değil.
>
> **Değişmeyen üç şey:** ilke 1–3 (kurulum yok · sunucu yok · internet
> gerekmez) hâlâ her özelliğin üstünde, aşağıdaki yasak liste hâlâ yasak, ve
> **ölçmek hâlâ zorunlu** (tuzak 65 ve 101: ölçülmemiş bir iddia bir iş planı
> üretir). Bir özelliği artık "baba istemedi" diye reddetmiyoruz; "ilke 1–3'ü
> bozuyor" ya da "ölçülmedi" diye reddediyoruz.
>
> `docs/STATUS.md` ve `docs/TASKS.md`'deki eski `(ilke 5)` atıfları **olduğu
> gibi bırakıldı**: onlar bir günlük, o gün geçerli olan kuralla alınmış
> kararları anlatıyorlar ve geriye dönük düzeltilirlerse kayıt yalan söyler.

## Yasak liste — bunlar bu projeye asla girmeyecek

Kullanıcı hesapları · bulut senkronizasyonu · mobil uygulama · yoklama ·
not girişi · öğrenci kaydı · takvim entegrasyonu ·
sürükleyerek ders süresi uzatma · undo/redo geçmişi ağacı (düz yığın yeterli)

> **Listeden çıkarıldı (2026-08-30, kullanıcı kararı): istatistik/dashboard ·
> SMS/e-posta · aynı planın sürüm ağacı.** Üçü de PLAN.md'de silindi. Yasak
> olmaktan çıkmak **yapılacak olmak demek değil** — üçü de artık ölçülüp
> karar verilebilir, o kadar. Sürüm ağacının aşağıdaki 2026-08-25 tarihli
> daraltma notu artık tarihseldir.

> **Listeden çıkarıldı (2026-08-24): karanlık mod ve tema seçimi.** Gerekçe zevk değil:
> tarayıcı (Brave, Chrome) açık temalı sayfayı zaten **zorla karartıyor** ve bunu kendi
> algoritmasıyla yapıyor. Sonuçta yeşil = bırakılabilir / sarı = uyarı / kırmızı = engel
> renkleri çamurlaşıyor — yani aracın en temel geri bildirim kanalı bozuluyor.
> Kontrolü almak, tarayıcıya bırakmaktan **daha az** karmaşa. **v0.7'de uygulandı**;
> tercih `localStorage['ders-programi-tema']`'da, `State`'e girmez.
>
> **Varsayılan AÇIK (2026-08-27) ve sistemi izlemiyor.** İşlevsel renkler açık
> zeminde seçildi ve orada **ölçüldü**; koyu, bilerek yapılan bir seçim. Bu,
> hareket ayarının tersi ve fark bilerek: makinesinde "hareketi azalt" diyen
> biri bir **ihtiyaç** bildiriyor (tuzak 58, taban), koyu tema diyen biri bir
> **zevk** bildiriyor. `normalizeTheme` artık `prefersDark` almıyor.
>
> **Netleştirildi (2026-08-25): ilke 2 "sunucu yok" — statik yayın hariç.**
> v1.0'da araç ikinci bir yoldan da geliyor: GitHub Pages'te duran bir sayfa
> (`npm run build:site` → `dist-site/`). Orada **backend, veritabanı, hesap,
> oturum, API yok**; yayınlanan şey bir klasör dolusu statik dosya. İlke 3 de
> bozulmadı: CDN'den tek bayt çekilmiyor, web font yok, ve sayfa ilk açılıştan
> sonra service worker sayesinde **fiş çekiliyken** çalışıyor — ölçüldü.
> Çift tıklanan `dist/index.html` hâlâ asıl teslim yolu, site onun yanında duruyor.
>
> **Daraltıldı (2026-08-26, ikinci kez): ilke 2 — YEREL statik sunucu da hariç.**
> v1.1'de üçüncü bir teslim yolu var: `dersprogrami.localhost:7654`, babanın
> makinesinde koşan ~150 satırlık bir dosya sunucusu (`kurulum/sunucu.ps1`).
> Orada da **backend, veritabanı, hesap, oturum, API yok**; verilen şey bir
> klasördeki dosyalar. `*.localhost`'u Chrome kendisi çözer: hosts dosyası
> yok, yönetici yok. Çift tıklanan `dist/index.html` **hâlâ asıl teslim
> yolu**; ölçülen fark 76 ms ↔ 82 ms.
>
> **Gerekçesi bir kez YANLIŞ yazıldı ve ölçümle düzeltildi.** İlk hâli
> "`file://` güvenli bağlam değildir, orada `showDirectoryPicker` tanımlı bile
> değildir" diyordu. Chromium'da **ikisi de yanlış**. `file://`'ın gerçekten
> eksik olduğu şey bir **köken**:
>
> ```
> isSecureContext                    true          ← yanılmışım
> showDirectoryPicker                function      ← yanılmışım
> navigator.serviceWorker.register   TypeError
> navigator.storage.getDirectory     SecurityError
> location.origin                    "file://"     — makinedeki HER yerel
>                                                    sayfayla ortak
> ```
>
> Yani sunucu klasör özelliğinin **tek** evi değil, **daha iyi** evi: çevrimdışı
> çalışan bir sayfa, bu programa ait bir depo, ve tarayıcının tek bir siteye
> saklayabildiği bir izin. Bu satırlar `e2e/temel.spec.ts` **75. bölümde**
> ölçülüyor — yanlış iddia geri yazılırsa test kırmızıya döner.

> **Daraltıldı (2026-08-25): "birden çok program sürümünü yan yana tutma" → "aynı
> planın sürüm ağacı".** Gerekçe: yasaklanan şey *sürüm ağacı*ydı — "geçen salı
> neye benziyordu" sorusuna cevap veren, dallanan, kimsenin bakmadığı bir geçmiş.
> Babanın istediği o değil: **ayrı planlar**, aralarında geçilen ve teki seçilen.
> **v1.0'da uygulandı** (`library.ts`); plan kimliği `State`'e girmez, şema
> değişmez. Aynı planın sürüm ağacı hâlâ yasak.

---

## Değişmez ilkeler — güncelleme (2026-08-26)

7. "Hedef makine yavaş" → **ÖLÇÜLECEK.** Babanın makinesinde gerçek
   performans görülene kadar bu bir varsayımdır, gerekçe değildir.

### Kaldırılan yasaklar

- **ANİMASYON yasağı kalktı.** Yerine geçen kural yok: süre, kapsam ve
  kütüphane serbest. Tek şart `prefers-reduced-motion: reduce` → hepsi kapalı.
- **WEB FONT yasağı kalktı**, yerine kural: font **tek dosyaya GÖMÜLÜR**
  (base64/`data:`). Ağdan çekilmez. "İnternet gerekmez" ilkesi aynen geçerli.
- **BAĞIMLILIK yasağı kalktı (2026-08-26).** Tailwind / Radix / ikon
  kütüphanesi / animasyon kütüphanesi *bağımlılık* gerekçesiyle reddedilmişti;
  o gerekçe kalktı. Yeni ölçüt tek: paket `dist/index.html`'e gömülebiliyor ve
  çalışma anında ağa çıkmıyorsa serbest. Bkz. **"Tasarım — serbest"** →
  *Bağımlılık politikası*.
- **TASARIM SİSTEMİ yasakları kalktı (2026-08-26).** Yarıçap/kot/tipografi/
  sütun merdivenleri, "altı sekmeden fazlası yok", "dört düğme durumu",
  "yüzüyorsa yanlıştır" — hepsi silindi.

---

## Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  ->  dist/index.html  (tek dosya, gömülü JS/CSS)
Vitest                  ->  saf mantık testleri
Radix UI                ->  diyalog · bağlam menüsü (ızgaranın sağ tıkı)
lucide-react            ->  simgeler (ağaç budanır, simge başına ~0.3 KB)
```

**Hareket kütüphanesi YOK — ve bu bir yasak değil, bir ÖLÇÜM.** `motion`
kuruldu, ölçüldü ve **127 KB** çıktı; karşılığında verdiği tek şey CSS'in
yapamadığı `layoutId` paylaşımlı geçişiydi. Aynı işi tarayıcının kendisi
bedavaya yapıyor — `file://` altında Chromium'da **ölçüldü**:

```
document.startViewTransition   var        paylaşımlı öğe geçişi
@starting-style                var        girişte animasyon
transition-behavior: allow-discrete  var  display'e geçiş
oklch() · color-mix()          var        algısal renk rampası
backdrop-filter                var        yapışkan kabuk
position-anchor                var        popover konumlama
```

**Bağımlılık kuralı (2026-08-26):** bir paket `dist/index.html`'e gömülebiliyor
ve çalışma anında ağa çıkmıyorsa serbest. Sabit bir KB tavanı yok; şart
**ölçmek** — eklendikten sonra dosya boyutu ve `file://` ilk boyama süresi
`docs/STATUS.md`'ye yazılır. `devDependencies` zaten serbestti.

Ölçülen maliyetler (2026-08-26, taban 405 242 bayt):

| Paket | Maliyet |
|---|---|
| `lucide-react` (12 simge) | **+3,4 KB** |
| `@radix-ui/react-dialog` | +39,5 KB |
| `+ react-toast` | +19,6 KB |
| `+ react-dropdown-menu` | +51,0 KB |
| `+ react-tooltip` | +8,2 KB |
| `+ react-popover` | +5,0 KB |
| **Radix toplam (5 paket)** | **+123,3 KB** |
| ~~`motion`~~ | +127,2 KB — **alınmadı** |

`dropdown-menu` beşinin en pahalısı ama popper'ı da o getiriyor: tooltip ve
popover onun üstüne 13 KB'a geliyor. **Tailwind alınmadı** — `src/styles.css`
zaten olgun bir token katmanı, taşımanın görsel getirisi sıfır.

Hâlâ yasak olan tek şey **ağ**: çalışma anında bayt indiren hiçbir paket
giremez (ilke 3). Sürükle-bırak kütüphanesi de girmiyor ama gerekçesi başka —
`src/drag.ts` Pointer Events ile yazıldı çünkü tuzak 1 bir kütüphaneyle de
çözülmüyordu.

CSS: tek bir `src/styles.css`, CSS değişkenleriyle.

**Sürüm numarasının TEK kaynağı `package.json` + `scripts/surum.mjs`, ve bu
artık ÖLÇÜLÜYOR** (`src/surum.test.ts` — bkz. tuzak 77: aynı cümle iki sürüm
boyunca yazılıydı ve yanlıştı). `tauri.conf.json` numarayı kopyalamaz,
`"../package.json"` yolunu gösterir; `Cargo.toml`'u `yayinla.mjs` yazar. İki
vite config de `define: { __SURUM__ }` ile onu derlemeye basar, yani dört
teslim yolu da aynı numarayı taşır — `isDesktop()`'ın doktrini burada da
geçerli: bu bir **derleme bayrağı değil**, hepsine basılan aynı damga.
`src/version.ts` onu okur (`__SURUM__` tanımsızsa `0.0.0-dev`'e düşer, yoksa
`tsc` ve vitest modül yüklenirken çöker) ve Ayarlar → Veri onu gösterir.
Aynı damga `dist-site/sw.js`'in **önbellek adına** da girer — bkz. tuzak 73.
Sürüm çıkarmak tek komut: `npm run yayinla -- 1.2.0`.

### Komutlar

```bash
npm run dev        # geliştirme sunucusu
npm run tipler     # tsc x2: src (tsconfig.json) + src DIŞI (tsconfig.tools.json)
npm test           # Vitest — 704 birim testi
npm run build      # dist/index.html tek dosya üretir  (asıl teslim)
npm run build:site # dist-site/ — PWA: tek dosya + manifest + sw.js + simgeler
npm run test:e2e   # Playwright — derler, sonra 500 E2E testi (file://)
npm run test:site  # site · sunucu · klasör, http üzerinde — 22 test
npm run kontrol    # hepsi: tipler + birim + derleme + E2E + site + cozucu
npm run ekran      # iki temada ekran görüntüsü -> test-results/ekran/
npm run cozucu     # gerçek ölçekli çözücü stresi — 7 test, 34,8 sn (kontrol'ün parçası)
npm run patrol     # devriye: her ekranı gezer + tohumlu rastgele gezinme (kontrol'ün parçası DEĞİL)
npm run sunucu     # yerel sunucu: http://dersprogrami.localhost:7654
npm run paket      # dist-kurulum/ — babaya giden TEK klasör (Windows)
npm run font       # src/fonts/*.woff2 yeniden üretir (fontTools ister)
npm run exe        # src-tauri/target/release/ — Tauri ikilisi (Rust ister)
npm run exe:test   # cargo test — safe_name kapısı ve dosya işleri, 6 test
npm run yayinla -- 1.2.0   # sürüm: package.json + commit + etiket + push
```

`patrol` de `kontrol`'ün parçası **değil**, ve sebebi hız değil huy: bir
devriye hiçbir şey **iddia etmez**, gezer ve sayfanın kendi şikayetlerini
dinler. Kırıldığında okunacak şey bir iddia değil bir **iz** olur, o yüzden
kendi config'inde video ve trace açık. Yakaladığı her şey zaten `kapan.ts`
üstünden bütün süitte de yakalanıyor.

`font`, `exe` ve `exe:test` **`kontrol`'ün parçası değil** ve bilerek öyle:
üçü de bu depoda olmayan bir araç zinciri istiyor (Python+fontTools, Rust),
ve `kontrol`'ün sözleşmesi "her makinede koşar"dı. Rust'ı gerçekten derleyen
tek yer `.github/workflows/surum.yml`; orada `cargo test` de koşuyor.

Yeni bilgisayarda bir kez: `npm install && npx playwright install chromium`

### DÖRT derleme hedefi — tek kaynak

```
vite.config.ts       -> dist/index.html   TEK dosya, file://, çift tıklanır
vite.site.config.ts  -> dist-site/        aynı tek dosya + manifest + sw.js + simge
scripts/paket.mjs    -> dist-kurulum/     dist-site + kurulum betikleri (WINDOWS)
src-tauri/           -> Ders Programı.exe dist/index.html'i İÇİNE alan tek ikili
site/                -> manifest.webmanifest · sw.js · icon.svg · icon-small.svg · icon-192/512.png
kurulum/             -> Kur.cmd · Guncelle.cmd · kur.ps1 · sunucu.ps1 · OKU.txt · icon.ico
scripts/simge.mjs    -> icon.svg'den 192/512 PNG (Chromium ile, yeni bağımlılık yok)
scripts/ikon.mjs     -> .ico: 16/20/24 SADE, 32+ AYRINTILI (konteyner elle yazılır)
scripts/ikon-karsilastir.mjs -> o eşiğin REÇETESİ: iki çizim × altı boy × iki zemin
scripts/favicon.mjs  -> index.html'in data: URI favicon'u — SADE varyanttan
scripts/sunucu.mjs   -> sunucu.ps1'in Node ikizi: geliştirme ve ölçüm
scripts/font.mjs     -> gömülü yüzün REÇETESİ (kaynak scripts/font-source/)
scripts/surum.mjs    -> sürüm numarasının TEK kaynağı (define + sw damgası)
scripts/yayinla.mjs  -> bir sürümün dört adımı, tek komutta
```

**İşaretin İKİ çizimi var, ve eşik ölçülerek bulundu.** `site/icon.svg`
ayrıntılı (altı sütun + hayalet sütunlar); `site/icon-small.svg` sade (üç
sütun, hayalet yok). İkisi **Windows'un gerçekten istediği boylarda**
(16/20/24/32/40/48, iki zeminde) render edilip **bakıldı**
(`scripts/ikon-karsilastir.mjs`): 32 ve üstünde ayrıntılı temiz okunuyor,
20 ile 24'te bulanık, 16'da altı sütun mavi bir lekeye dönüyor. Eşik **üç kez
taşındı**: 2026-08-27'de 48'den 32'ye, aynı gün 32'den 20'ye, ve 2026-08-30'da
20'den **32'ye geri**. `.ico`'ya 20 · 24 · 40 eklendi. Dördü de tek bir
şikayetten çıktı ve şikayet **üç kez** geldi, bkz. tuzak 78 ve 101. Bölüşüm:

| Nerede | Hangi | Niçin |
|---|---|---|
| Sekme (favicon, `index.html`) | **sade** | bir sekme simgesi HER ZAMAN 16–32 px |
| `icon.ico` 16 · 20 · 24 px | **sade** | görev çubuğu %100'de **24 px** ister, ve orada ayrıntılı çizimin çubukları 2,25 cihaz pikseli, araları 0,56 px |
| `icon.ico` 32–256 px | ayrıntılı | orada temiz okunuyor, ve gerçek işaret o |
| PWA 192/512 PNG | ayrıntılı | yer var |
| Üst çubuk (`.brand-mark`) | **sade** (2026-08-28) | 22,75 px @%100 — eşiğin altında |

**Üçüncü taşıma, ilk ikisinin TARTIŞTIĞI şeyi ölçen ilk taşıma
(2026-08-30).** 48→32 ve 32→20 hamleleri "görev çubuğu hangi boyu ister"
sorusunu tahmin ederek yapılmıştı; şikayet üçüncü kez gelince
(*"sanki küçük simge yani 9x9 pixellik kullanılıyor gibi"*) önce **ikilinin
içine bakıldı** (`scripts/exe-ikon.mjs`, yayınlanmış 2.0.0):

```
RT_ICON 9 · gömülü boylar 16·20·24·32·40·48·64·128·256
kurulum/icon.ico ile BİREBİR
```

Yani eksik boy yoktu, komşusundan ölçeklenen bir şey yoktu, ve görev çubuğuna
ulaşan işaret **ayrıntılı çizimdi, doğru çizilmişti**. 24 px'te altı çubuk
2,25 cihaz pikseli ve araları 0,56 px — bir cihaz pikselinin altındaki boşluk
yoktur. Eşik 32'ye çıktı; 24'e artık üç kalın çubuk düşüyor, ve o üç çubuk bir
yer tutucu değil **aynı fikrin 24 px'te ayakta kalan hâli**.

**Üst çubuğun sayısı da kökle birlikte kıpırdadı:** `.brand-mark` `1.75rem`,
kök 14px iken 24,5 px, kök 13px olunca **22,75 px** (%150'de 34,125). İkisi de
eşiğin altında, yani sade çizim kararı değişmedi — ama sayı `kabuk.spec.ts`
76'da yazılı ve orada güncellendi.

Çizim böylece **üç yerde** duruyor (svg dosyası · `index.html`'in data URI'si ·
`App.tsx`'in inline SVG'si). Üçünün de ayrışması iki testle yakalanıyor:
`temel.spec.ts` 72 (URI ↔ `icon-small.svg`) ve `kabuk.spec.ts` 76 (üst çubuk ↔
`icon.svg`). `scripts/favicon.mjs` URI'yi yeniden üretir — elle düzenlenmez.

**Site derlemesinde `<link rel="icon">` YOKTUR.** `index.html` favicon'u zaten
`data:` URI olarak taşıyor ve o iki derlemede de geçerli; site'e ikinci bir
bağlantı koymak `<head>` sırasında kazanır ve sekmeye **ayrıntılı** işareti
geri getirirdi.

Üçüncü hedef ikincinin **paketlenmiş** hâli, ayrı bir derleme değil: içindeki
uygulama `dist-site/index.html`'in ta kendisi. Kurulum betiklerinin hiçbiri
`dist/`'e ya da `dist-site/`'a düşemez.

**Dördüncü hedef de ayrı bir derleme değil**: `src-tauri/tauri.conf.json`'ın
`frontendDist`'i `../dist`, yani exe'nin içindeki sayfa babanın çift
tıklayacağı dosyanın ta kendisi. Bu yüzden dört yolun dördü de aynı
`dist/index.html`'i taşıyor ve **arayüzün hiçbir kopyası yok**.

**`--no-bundle`, ve bu bir ilke kararı.** Tauri'nin NSIS hedefi bir kurulum
sihirbazı üretir; ilke 1 tam olarak onu reddediyor. Teslim edilen şey tek bir
`Ders Programı.exe`. Çapraz derleme yok: bu makine Fedora, hedef Windows, ve
exe `windows-latest` üstünde doğuyor (`.github/workflows/surum.yml`).

**Üç teslim dosyasının tek kaynağı o iş akışı, ve sebebi bir eksikti:**
`npm run …` çalıştırmadan indirilebilecek hiçbir şey yoktu — `dist/`
`.gitignore`'da, ve bir Actions artefaktı **giriş ister ve 90 günde silinir**,
yani babaya verilebilecek bir bağlantı değil. Bir GitHub Release'in varlıkları
kalıcı ve girişsizdir; `releases/latest/download/<ad>` sürüm numarası bilmeden
en yenisine gider ve README'nin bağlantıları bunlardır. Varlık adları
**yalnız ASCII** — `.cmd` dosyalarının ASCII olmasıyla aynı aile, farkı
kod sayfası değil URL kodlaması.

**Exe hiçbir şeyi yeniden yazmaz — bir ADAPTÖR takar.** `folder.ts` dosya
adlarının, günlük yedeğin ve "son 10" budamasının tek evi; `src/desktop.ts` üç
Tauri komutunu bir `FileSystemDirectoryHandle` kılığına sokuyor ve `saveInto()`
exe'de **olduğu gibi** koşuyor. Rust'ta yalnızca tarayıcıda karşılığı olmayan
şey var: hangi klasör, ve bir adın ad olduğunu doğrulayan kapı (`safe_name`).
`src/desktop.test.ts` gerçek `saveInto()`'yu adaptörün üstünde koşturur — dikiş
kayarsa orası kırmızıya döner.

**`kurulum/*.{cmd,ps1,txt}` `.gitattributes`'ta `eol=crlf`** ve `.ps1`'ler
**UTF-8 BOM** taşır. İkisi de gerekli: `* text=auto` bir Linux checkout'unda
onlara LF verir ve Notepad `OKU.txt`'yi tek satır gösterir; BOM'suz UTF-8'i
Windows PowerShell 5.1 ANSI okur ve her "ı" bozulur. `.cmd` dosyaları
**yalnız ASCII**: cmd.exe'nin kod sayfası Türkçe harfleri bozuyor, o yüzden
kullanıcıya görünen her cümle PowerShell'den yazılıyor.

**`-ExecutionPolicy Bypass` YASAK (2026-08-30).** Dört yerde vardı (iki `.cmd`,
`kur.ps1`'de iki `Start-Process`) ve dördü de `RemoteSigned` + `Unblock-File`
oldu. Gerekçe kolaylık değil bir **imza**: bir ZIP'ten çıkan her dosya
"Internet" bölgesi damgası taşır, ve Bypass o damgayı görmezden gelmenin en
geniş yolu — indirilen bir arşivin içinde tarayıcıların ve virüs
tarayıcılarının en tanıdık desenlerinden biri. `Unblock-File` damgayı
**kaldırıyor**, ve damgasız bir betik RemoteSigned altında yerel sayılıyor:
aynı iş, benzemeyen imza. `kur.ps1` kopyaladığı `.ps1`'leri de unblock ediyor,
çünkü `Copy-Item` damgayı beraberinde getirebiliyor.

**Exe İMZASIZ ve öyle kalıyor** (sertifika para istiyor, cevap hayırdı). Onun
yerine yayına `SHA256SUMS.txt` giriyor: imza yoksa "bu, yayınladıkları dosya
mı" sorusuna verilebilecek tek cevap bir özettir. VERSIONINFO'yu aramaya gerek
yok — `tauri-build` onu zaten gömüyor, ve bu **ölçüldü** (tuzak 101).

Site **de** tek dosya (`viteSingleFile` korundu): service worker'ın önbelleğe
alacağı kabuk böylece bir sabit, her derlemeden sonra üretilip senkron tutulması
gereken bir hash listesi değil.

Manifest bağlantısı, simge ve SW kayıt betiği `index.html`'de **yoktur** —
yalnız site derlemesinde bir `transformIndexHtml` eklentisiyle eklenir
(`order: 'post'`, yoksa singlefile onları gömülecek varlık sanır). Ana config'de
`publicDir: false`: `site/` klasörünün hiçbir dosyası `dist/`'e düşemez.
Böylece "internet gerekmez" iddiası **grep ile** doğrulanabilir kalır, ve
`site.spec.ts` tam olarak bunu ölçer.

### Test katmanları — hangisi neyi yakalar

| Katman | Nerede | Neyi yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite, zil saatleri, kural limitleri, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı, branş listesi, kapalı saat çakışması, **exe adaptörü — gerçek `saveInto()` onun üstünde koşar**, **plan kitaplığı, anahtarlar, paket zarfı ve dosya adları**, **otomatik dizme (yasallık, belirlenimcilik, tıkanma), `occupy`/`vacate` eşdeğerliği, 21 dünyalık çözücü matrisi ve denetçinin kendisi**, **bir varlığın kendi haftası ve sayılan gerçekleri, durum özeti, Türkçe katlama/sıralama/süzme**, **haftanın 1+2'lere bölünüşü ve ızgaradan geri OKUNUŞU, v6→v7 göçü** |
| Duman | `src/App.test.tsx` (jsdom) | Bileşenler çiziliyor mu, sekmeler çöküyor mu |
| **E2E** | `e2e/*.spec.ts` (Playwright, 29 dosya, `file://`) | **Davranış:** sürükleme, taşıma, sağ tık, kaydırma, geri-al zinciri, hata yolları, klavye, sekme gezinmesi, plan geçişi, taslaklar, paket gidiş-dönüşü, "veriler nerede" tablosu, otomatik dizme, **ders dağılımı: seçeneklerin saatten türediği, havuzda blok başına kart, bitişik 2+1'in İKİ blok gibi çizildiği ve sağ tıkın doğru parçayı aldığı**, **ilk kullanım satırının bir kez çıkıp bir daha çıkmadığı**, **komut paleti, varlık paneli, listelerde ara/sırala/süz, diyalogların ne SORDUĞU**, **yedi şeridin tek iskeleti, Kontrol'ün süzgeci ve Dersler'in modu**
(`serit.spec.ts`), **ders girişinin ekseni hatırlaması ve odaklanmış modda
formun o ekseni hiç sormaması** (`dersler.spec.ts`), **hareket ayarının üç basamağı ve makine tercihinin onu ezdiği** (`hareket.spec.ts`). **Erişilebilirlik:** renk kontrastı ve AYRIMI, gün bandının bir DURUM gibi okunmadığı **ve iki temada aynı yükte olduğu**, `--on-color` mürekkebi, görünür odak, dar ekranda erişilebilir adın kalması, **%150'de üst çubuğun ve şeridin taşmaması**. **Sağ tık menüsü ve SABİTLEME** (`program.spec.ts` 86: menünün YEDİ üst kalemi adlarıyla, boş hücrede açılmıyor, sabitlenmiş kart sürüklenmiyor · Delete'e cevap vermiyor · "Havuza kaldır" kapalı · `Baştan diz` ve `Programı boşalt` onu yerinde bırakıyor · yenilemeden sonra duruyor; artı **karttaki raptiye**: hover olmadan da görünüyor, basıp sürüklemek kartı KALDIRMIYOR, tek tık kilitliyor). **Havuzun sırası ve süzgeci** (`program.spec.ts` 88: beş sıra, her sıranın kendi başlıkları, başlıkların saydığı toplam ekrandakine eşit, süzgeç neyi sakladığını söylüyor). **Panelden düzenleme** (`panel.spec.ts` 87: karttan öğretmene/sınıfa açılan yol, ve sheet'te değişen kısaltmanın IZGARADA görünmesi). **Kâğıt:** başlık, dikey ortalama, sayfa sayısı, A4 yatay, **ekran önizlemesinin süsünün kâğıda sızmadığı**. **İlke 3:** gömülü fontun gerçekten çizildiği, ağdan bayt çekilmediği. **Metin:** hiçbir ekranda uzun çizgi (`—`) olmadığı, ve ayraçların (`·`) yerinde durduğu (`metin.spec.ts`). **İşaret:** `kurulum/icon.ico`'nun Windows'un istediği dokuz boyu da taşıdığı ve **32'den itibaren ayrıntılı çizim** olduğu (`temel.spec.ts` 79). **Kayma:** şeritte seçenek değiştirmenin ne düğmeleri ne altındaki sayfayı oynattığı (`kayma.spec.ts`) — o dosya kendi tarayıcısını açar, çünkü Playwright'ın varsayılan `--hide-scrollbars`'ı altında ölçülecek çubuk yoktur (tuzak 94) |
| **Dil** | `src/i18n.test.ts` + `e2e/dil.spec.ts` | **Sözlüğün kendisi:** ölü anahtar · yuva kümesi · dengeli `**` · çoğulun İKİ biçimi · uzun çizgi — dördü de DÖRT sözlükte birden, ve beşi de mutasyonla sınandı. Artı makine: `applyDil`'in aktif dili KURDUĞU (yoksa saf modüller Türkçe kalır), çoğulun kategoriyi `Intl.PluralRules`'tan sorduğu, ve veri metinlerinin depoda Türkçe kaldığı. E2E'de: beş dilin beşinin de sekmeleri kendi dilinde çizdiği, **saf modüllerin cümlelerinin de çevrildiği** (Kontrol raporu), ve Türkçenin birebir geri geldiği. **Süitin kalanı `kapan.ts`'te Türkçeye sabitli**, yani çevrilmemiş bir metni GÖREMEZ — onu gören şey bir tarama ve ekrana bakmak |
| **Sürüm** | `e2e/surum.spec.ts` (`file://`) | Ayarlar → Veri hangi **sürüm** ve hangi **kopya** olduğunu söylüyor mu · "kendini güncellemez" cümlesi ve adres · **İLKE 3: sürümü göstermek için ağa çıkılmadığı** · güncelleme şeridinin davetsiz çıkmadığı |
| **Site · sunucu · klasör** | `e2e/{site,sunucu,klasor}.spec.ts` (`npm run test:site`) | **http üzerinde**: manifest ve simgeler, service worker kaydı, **fiş çekilince açılma**, çevrimdışı girilen verinin durması, ve site derlemesinin `file://` derlemesine sızmadığı. **Üçü de burada, aynı sebeple: hepsi `file://` altında OLMAYAN bir şeyi ölçüyor** — service worker, güvenli bağlam (`isSecureContext`), ve Dosya Sistemi Erişimi API'si. **Ayrıca güncellemenin kendisi**: önbellek adının sürümü taşıdığı, ve `sw.js` diskte değişince AÇIK DURAN sayfada şeridin çıktığı — hiçbir şey değişmemişken çıkmadığı. İkisi de mutasyonla denendi, ikisi de kırmızıya döndü |
| **Exe** | `e2e/exe.spec.ts` (`file://`) | Tauri köprüsü sayfada taklit edilir — **postane**, davranış değil; asıl taraf `cargo test`. Ölçülen: hiçbir tıklama olmadan yazım, seçicinin ÇİZİLMEDİĞİ, "Veriler nerede"nin başka bir şey söylediği, ve **köprü yokken aynı dosyanın hâlâ bir tarayıcı sayfası olduğu**. Artı güncelleme: **hiçbir şey sorulmadan ağa çıkılmadığı** (panel çizilmiş olsa bile `check_update` çağrılmaz), üç cevabın üç ayrı cümle yazdığı, **indirmenin yeniden başlatmadığı**, ve internet yokken programın çalışmaya devam ettiği |
| **Rust** | `src-tauri/src/{lib,update}.rs` (`npm run exe:test`) | `safe_name` kapısı, atomik yazımın tmp bırakmadığı, listenin **yabancı dosyaları da** gösterdiği. Artı güncelleme: `is_newer`'ın `1.10 > 1.9` bildiği, inen dosyanın **MZ ile başladığı ve boyutunun tuttuğu**, adresin yalnız kendi Release'imizden olabildiği, ve takas yarıda kalırsa **eski programın yerine geri konduğu**. `kontrol`'ün parçası DEĞİL: Rust her makinede yok |
| **Hata kapanı** | `e2e/kapan.ts` — **bütün** E2E süiti | Test ne ölçerse ölçsün, sayfanın kendi şikayeti: `console.error`, `pageerror`, yakalanmamış promise reddi, ve `file://` altında **herhangi bir ağ isteği**. `auto: true`, yani unutulamaz. Bir testin beklediği hata `beklenenHata()` ile adıyla serbest bırakılır — susturmak için değil, **beklendiğini söylemek** için |
| **Devriye** | `e2e/patrol.spec.ts` (`npm run patrol`) | İddia etmez, **gezer**: yedi sekme, üç liste, altı bölüm ve şeritteki her düğme; artı üç tohumla rastgele gezinme (1 · 42 · 1337). Kapan onu da sarar, yani bulduğu şey "sayfa şunu bastı" olur. Kırılınca ekran görüntüsü, video ve trace bırakır |
| Görüntü | `e2e/ekran.spec.ts` (`npm run ekran`) | Test değil, **kanıt**: iki temada on yedi ekran görüntüsü. Görüntüyü almadan önce sayfanın hareketi biter (tuzak 59), ve **çekildiğinde perde inmiş olur** — tek iddiası bu |

> **2026-08-26'da silinen katman:** görsel regresyon (`gorsel.spec.ts` + 24 PNG
> + `npm run gorsel`) ve düzen testleri (`sutun.spec.ts`, `duzen.spec.ts`'in
> geometri yarısı, `renk-secici.spec.ts`'in sığma yarısı, `izgara.spec.ts`'in
> Sığdır↔havuz takası). Gerekçe kullanıcı kararı: **erişilebilirlik ölçümleri
> kalır, düzen ölçümleri gider.** `duzen.spec.ts` → `kabuk.spec.ts` oldu ve
> geriye gezinme, erişilebilir ad, simge ayrımı ve baskı kaldı.

E2E, `dist/index.html`'i `file://` üzerinden 1920×1080'de açar — yani **babanın çift
tıklayacağı dosyanın ta kendisini**. jsdom'un düzeni yok; sürükle-bırak, sabit sütun,
ekran dışı hedef ve yazdırma taşması **yalnızca burada** görünür. Nitekim tuzak 11 ve
12 (bkz. PLAN.md) bu testlerle bulundu, başka türlü bulunamazdı.

`fullyParallel: true, workers: 4`. Doğrulanmış varsayım: `file://` altında her
Playwright context'inin kendi `localStorage`'ı var — 200 test paralel koşarken
birbirinin verisini görmüyor (ölçülen: 66 sn → 51 sn).

**Sahte veri tek yerde: `src/worlds.ts`.** `makeWorld()` küçük bir okul kurar,
`illegalBlocks()` dizilmiş bir programı denetler, `WORLDS` 21 senaryoyu tutar.
`e2e/` altında değil çünkü `tsconfig.json` yalnız `src`'yi kapsıyor — orada duran
bir dünya `tsc --noEmit`'ten hiç geçmezdi. Uygulama onu import etmediği için Vite
budar, `dist/index.html`'e girmez. Hem `solver.test.ts` hem `kontrol.spec.ts` hem
`otomatik-dunyalar.spec.ts` aynı üreteci kullanır.

**Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini gerçek
`getComputedStyle` ile okuyup WCAG kontrast oranını ve **CIE Lab ΔE** farkını hesaplar.
ΔE gerekiyor çünkü WCAG parlaklık oranı iki koyu rengi farklı tonda olsalar bile eşit
sayar — koyu yeşil ile koyu zeytin tam olarak bu durumdadır.

> **Arayüzde görünen bir şeyi değiştirdiysen `npm run test:e2e` çalıştırmadan
> "bitti" deme.** Sürükleme, kaydırma, düzen ve yazdırma zaten yalnızca burada
> yakalanıyor; ama renk, hizalama, tablo ekseni ve düğme adı da öyle — jsdom bunların
> hiçbirini görmez. Görsel bir değişiklikten sonra ekran görüntüsü de al
> (`test-results/ekran/`): **çıktıyı göster, iddia etme.**

---

## Kod dili ve biçim

**Kural: arayüz Türkçe, kod İngilizce.** İkisi karışmaz.

- **Tanımlayıcılar, tipler, dosya adları İngilizce**: `teacher`, `classGroup`,
  `unavailable`, `placements`, `constraints.ts`, `blocker()`, `components/Availability.tsx`.
- **Kullanıcıya görünen her metin Türkçe** ve doğru Türkçe karakterlerle:
  `"MÇ Salı 3. saatte 433 sınıfında"`. Bu metinler `i18n` altyapısından geçmez,
  doğrudan JSX/string içinde durur (tek dil, ilke 4).
- **Ekranda uzun çizgi (`—`) YOK** (2026-08-27, kullanıcı isteği). Yerine geçen
  dört kural: düzyazıda **ayrı cümle**, etiket/değer çiftinde **iki nokta**,
  eşit ağırlıkta iki şey arasında **orta nokta (`·`)**, boş tablo hücresinde
  **kısa çizgi (`–`)**. Aralık çizgisi `–` da kalır (`Sal–Cum 13:30`), o başka
  bir karakter. `e2e/metin.spec.ts` her sekmede ve her Ayarlar bölümünde
  `document.body.innerText`'i okuyup sayıyor — yani **kaynağa değil ekrana**
  bakıyor, ve bu yüzden İngilizce kod yorumları serbest kalıyor.
- **Bir `.hint` TEK CÜMLE** (2026-08-30, kullanıcı isteği: *"çok fazla info var
  ve çok uzunlar her yerde"*). ~90 karakter; uzayan gerekçe öğenin `title`'ına
  iner, yani okunup geçilen bir yere değil **arandığı** yere. `AddPanel`'in
  `more` prop'u bunun için. Ölçülen: ekrandaki en uzun `.hint` **438 → 126**
  karakter. `e2e/metin.spec.ts` tavanı 140'ta tutuyor; uzunluğu **veriden**
  gelen satırlar (`.data-hint`) hariç, çünkü onları uzatan şey okulun kendisi.
- **Yorumlar İngilizce**, kısa, sadece *neden*i açıklar. *Ne* yaptığını kod söyler.
- Depolanan JSON alan adları da İngilizce — ama **değiştirmek yedek dosyalarını
  bozar**, o yüzden şema değişirse `schemaVersion` artırılır ve göç kodu yazılır.

> **İstisna — bunlar Türkçe kalır, kullanıcı verisidir:** `localStorage` anahtarı
> (`ders-programi`, `ders-programi-yedek-N`) ve indirilen yedeğin dosya adı
> (`ders-programi-YYYY-AA-GG-SSDD.json`). Bunları "İngilizceye çevirmek" babanın
> kayıtlı programını görünmez kılar — kimliği değişen anahtar, silinmiş veri demektir.

---

## Mimari — üç katman, sınırları geçilmez

```
types.ts                        tipler, başka hiçbir şey
keys.ts                         sözlük anahtarları (constraints ↔ rules döngüsü olmasın)
palette.ts                      36 renk + firstFreeColor. HİÇBİR ŞEY import etmez.
i18n.ts                         arayüz hangi dili konuşuyor. Yaprak. ANAHTAR
                                Türkçe cümlenin KENDİSİ — eksik çeviri doğru
                                Türkçeye düşer, JSX okunur kalır, altı yüz ad
                                uydurulmaz. Bedelini i18n.test.ts öder: ölü
                                anahtarı o yakalar. State'e GİRMEZ.
                                AKTİF DİLİ de burası tutar ve çıplak bir t()
                                verir: constraints.ts "MÇ Salı 3 saatinde
                                müsait değil" yazıyor ve useT() çağıramaz. Tek
                                yazan applyDil(); o zaten ilk boyamadan ÖNCE ve
                                her dil değişiminde koşuyor.
                                ÇOĞUL sözlük DEĞERİNDE: {n:tekil|çoğul},
                                kategoriyi Intl.PluralRules seçiyor — Fransızca
                                0'ı "one" sayar, İspanyolca saymaz
names.ts                        programın KENDİ koyduğu sözcükler: yedi gün ve
                                yirmi bir branş, ve her birinin ekranda ne
                                okunduğu. constraints.ts'in ALTINDA, çünkü
                                entities.ts zaten constraints.ts'i çağırıyor ve
                                blocker() bir gün adını arayüz dilinde çizmek
                                zorunda (keys.ts'in deseni). Depoya YAZILANI
                                değiştirmez: settings.days[].name Türkçe kalır,
                                babanın kendi yazdığı ad olduğu gibi geçer.
                                entities.ts yeniden dışa aktarır
components/T.tsx                useT() ve <T>. <T> var çünkü bir cümleyi üç
                                anahtara bölmek onu çevrilemez yapar: diller
                                arasında değişen şey kelime SIRASI
lang/{en,de,es,fr}.ts           dört sözlük, 786 anahtar. Türkçenin sözlüğü
                                YOK ve olmayacak — hepsi 'X': 'X' olurdu, yani
                                altı yüz kez kaynak dili sessizce bozma şansı.
                                Ölçülen maliyet: üç sözlük daha +242 242 bayt
                                ve açılışa 0 ms (gömülü metin taşınıyor,
                                ayrıştırılmıyor)
subjects.ts                     bir şeyin HANGİ branştan olduğu. Yaprak, çünkü
                                entities.ts zaten constraints.ts'i çağırıyor:
                                ikisinin de ihtiyacı olan kural ikisinin de
                                ALTINDA durmalı (keys.ts'in deseni). sanitize()
                                yetim bayrağı buradan yargılar, ekranlar branşı
                                buradan okur. entities.ts yeniden dışa aktarır.
blocks.ts                       bir haftanın NASIL bölündüğü: blockPlan ·
                                patternLabel · patternOptions · clampPairs.
                                Yalnız `Lesson` tipini import eder — entities.ts
                                zaten constraints.ts'i çağırdığı için ikisinin de
                                ihtiyacı olan şey ikisinin de ALTINDA durmalı
library.ts                      plan kitaplığı: anahtarlar + plan üstverisi +
                                dosya adları + "veriler nerede" raporu.
                                State'i BİLMEZ, ham string alıp verir.
bundle.ts                       "bütün planlar tek dosyada" zarfı. library.ts'i
                                çağırır, State'i yine BİLMEZ.
  |
constraints.ts / feasibility.ts SAF fonksiyonlar. React, DOM, localStorage BİLMEZ.
                                dropMap() de burada: 72 hücrenin yargısı bir
                                ÇİZİM kararı değil, kısıt motorunun cevabı
rules.ts / bell.ts              Testleri zorunlu.
import.ts / entities.ts
solver.ts                       otomatik dizme. Kendi kısıt mantığı YOK — blocker()'ı çağırır.
                                Ders başına EN ÇOK İKİ iş kalemi: biri 2'lik
                                blokları, biri 1'likleri ister. Aramanın her
                                sayacı (domain, MRV, ileri kontrol) elindeki
                                blokların eşit boylu olduğunu varsayar
worlds.ts                       SADECE TEST: dünya üreteci + illegalBlocks denetçisi.
                                Uygulama import etmez, Vite budar. Vitest ve
                                Playwright ikisi de buradan beslenir.
  |
store.ts                        reducer + geri al yığını + localStorage + göç + plan geçişi
theme.ts                        makine tercihleri (tema, kenar, havuz açık mı +
                                BOYU, araç şeridi, ölçek, yoğunluk, müsaitlik
                                saati, HAREKET, örnek veri satırı görüldü mü) —
                                on bağımsız skaler, on anahtar, hiçbiri State'e
                                girmez
toolState.ts                    NEREDESİN: her sekmenin görünüm/tür/adım/bölüm/
                                kapsamı, artı Dersler'in MODU ve odağı, artı
                                HAVUZUN sırası ve süzgeci (2026-08-30). App'te
                                yaşar, çünkü sekme değişimi bileşeni söküyor
                                (tuzak 18) ve çünkü onu gösteren şerit
                                <main>'in ÜSTÜNDE. Kontrol'ün süzgeci
                                2026-08-28'de SİLİNDİ: rapor tek sayfa,
                                şeridin düğmeleri bir pozisyon tutmuyor.
                                Buraya girenin ölçütü tek: bir POZİSYON mu, bir
                                TERCİH mi. `poolSort`/`poolFilter` "şu anda
                                neye bakıyorum"dur, "bu makine nasıl sever"
                                değil — yani yeni bir localStorage anahtarı
                                yok, "Veriler nerede" tablosuna satır borcu yok
gridChrome.ts                   imleç haçı + yapışkan başlık gölgesi. SAF DOM,
                                React BİLMEZ — drag.ts'in deseni (tuzak 1)
poolSplit.ts                    havuzun boy sürükleyicisi. Aynı desenin ÜÇÜNCÜSÜ:
                                pointermove'da React'e değil, tek bir custom
                                property'ye yazar — 2100 hücre yeniden çizilmez
useSolver.ts                    solver.ts'i rAF ile dilim dilim sürer. App'te yaşar.
  |
listview.ts                     ara / sırala / süz. SAF. fold() Türkçe katlama
                                (İ→i, ğ→g…), compareTr() Türk alfabesi sırası.
                                State'i BİLMEZ, herhangi bir listeyi alır.
                                facet'ler ÇOĞUL: iki çip satırı birlikte daraltır,
                                birinin sayıları öteki uygulanmışken alınır.
                                canReorder() elle sıralamanın açık olduğu tek
                                durumu tanımlar: görünen satırlar dizinin KENDİSİ
rowDrag.ts                      liste satırını sürükleme. Saf DOM, React BİLMEZ —
                                aynı desenin DÖRDÜNCÜSÜ (drag.ts, gridChrome.ts,
                                poolSplit.ts). Hedef, satırın KAPSAMASIYLA bulunur,
                                orta noktayla değil (tuzak 60)
printOptions.ts                 kâğıtta ne olsun: beş anahtar, tek kayıt, tek
                                localStorage anahtarı. State'i de theme'i de BİLMEZ
version.ts                      HANGİ DERLEME BU. `__SURUM__`'ü okur, yoksa
                                `0.0.0-dev`'e düşer. APP_NAME de burada:
                                programın adı dört yerden ekrana çıkıyor
                                (pencere başlığı · belge başlığı · okulsuz
                                <h1> · manifest) ve tek bir yerde durmalı
update.ts                       bu kopya nasıl güncellenir. ÜÇ yol, üç
                                mekanizma: `sw` (site ve yerel kurulum —
                                controllerchange), `exe` (üç Tauri komutu, üç
                                ayrı düğme), `yok` (çift tıklanan .html — bir
                                dosya kendini değiştiremez). Exe dalı hiçbir
                                zaman kendiliğinden çalışmaz; ağa çıkan her
                                çağrı bir tıklamadır. SITE_ADRESI de burada
desktop.ts                      exe'nin klasörü VE güncelleme köprüsü.
                                folder.ts'in KURALLARINI kopyalamaz — dört
                                Tauri komutunu bir FileSystemDirectoryHandle
                                kılığına sokar, yani saveInto() exe'de olduğu
                                gibi koşar. Yanında üç komut daha
                                (check/download/apply): programın ağa çıkan tek
                                yeri, ve üçü de bir tıklamadan doğar.
                                isDesktop() bir DERLEME BAYRAĞI değil, özellik
                                tespiti: aynı dist/index.html dört yolda da
                                aynı dosya
folder.ts                       "nereye kaydedilsin": babanın seçtiği klasör.
                                library.ts'in deseni — State'i BİLMEZ, ham metin
                                alıp verir. İki fonksiyonu SAF ve testli
                                (dailyName, prunable); gerisi tarayıcı tesisatı.
                                Tutamak IndexedDB'de, çünkü localStorage bir
                                tutamağı saklayamaz — ama hâlâ State'e GİRMEZ
useFolder.ts                    folder.ts'i React'ten sürer. App'te yaşar
                                (tuzak 18) ve BUNDLE yazar, açık planı değil
  |
components/Dialogs.tsx          HER soru. useDialogs() → confirm / alert.
                                window.confirm/alert YOK — hiç kalmadı
components/Toasts.tsx           olan biteni söyleyen satır. Radix Toast DEĞİL:
                                eylem taşımıyorlar, o yüzden 19,6 KB'a gerek yok
components/LessonEdit.tsx        bir dersi YERİNDE düzenler: sınıf · öğretmen ·
                                branş · haftalık saat · dağılım · günde en
                                fazla. Inspector'ın deseni (context + Radix
                                Dialog). Kendi kuralı YOK — üçü updateLesson'
                                dan, ikisi transferLesson/moveLessonToClass'
                                tan geçer, ve o ikisi ne kaybedileceğini ÖNCE
                                sayar
components/BlockCounts.tsx      dağılım sayaçları + blockCeiling. İKİ ekran
                                kullanıyor (Dersler listesi ve LessonEdit), o
                                yüzden lessons/index.tsx'ten çıktı
components/Inspector.tsx        varlık paneli. entityWeek/entityFacts'i ÇİZER,
                                hesaplamaz — ama 2026-08-30'dan beri DÜZENLER
                                de: her kutu Okul listesinin kendi kutusu, aynı
                                mutator'a bağlı (updateTeacher · updateClass ·
                                updateRoom · setTeacherLimit). Yeni olan şey
                                kontrol değil YOL: ızgaranın satır başı, kartın
                                sağ tık menüsü ve komut paleti buraya çıkıyor.
                                useInspect() her yerden çağrılır
components/Palette.tsx          Ctrl+K kutusu — komut listesini DIŞARIDAN alır
components/Commands.tsx         o listeyi kurar. App'te DEĞİL, çünkü komutların
                                yarısı useInspect() çağırıyor ve o hook ancak
                                InspectorProvider'ın içinde çalışıyor — App ise
                                o provider'ı çizen bileşen
components/ListTools.tsx        dört listenin de üstündeki aynı şerit
components/useRowOrder.tsx      dört listenin ortak sıralama kancası: tutamak
                                hücresi + klavye + rowDrag.ts'i bağlama +
                                "N. sıraya taşındı" duyurusu
Root.tsx                        provider yığını. main.tsx ve App.test.tsx aynı
                                ağacı çizsin diye tek yerde
  |
components/Ribbon.tsx           araç şeridi: sekmeye göre switch, YEDİ sekmede
                                de çizilir (2026-08-27; Kontrol'ünki raporu
                                süzer, Dersler'inki modu seçer). Tek iskelet: Group(başlık) + Sep +
                                Spacer, her düğmede simge ve kelime. İş mantığı
                                YOK — "Otomatik diz (N)"in N'i entities.ts'teki
                                saf pendingLessons()'tan, Kontrol'ün sayıları
                                feasibility.ts'teki health()'ten gelir; buildPool
                                App'e çıkarılmaz (Grid'in memo sözleşmesi)
components/props.ts             PanelProps — Kurulum adımı ve Ayarlar bölümü aynı ikiliyi alır
components/Field.tsx            iki klasörün de kullandığı küçük parçalar
components/ColorPick.tsx        36 renklik swatch diyaloğu (Kurulum'un iki adımı)
components/LimitBox.tsx
components/*.tsx                sadece görüntüleme ve olay yakalama
components/setup/*.tsx          Okul: index (kabuk) + 4 liste adımı (Rooms ·
                                Subjects · Teachers · Classes) + Paste + Summary.
                                Progress ("Kurulum durumu") 2026-08-28'de
                                SİLİNDİ. Summary'nin adı ekranda ÖZET ve dalı
                                başına bir <h3> taşıyor; Dersler → Genel de onu
                                çiziyor (SummaryView = StepId | 'lessons').
                                Paste KONTROLLÜ: düğme panelin başlığında
                                (.panel-head), kutu formun altında
components/lessons/index.tsx    Dersler sekmesi. Kurulum'un 4. adımıydı; ders
                                en çok kullanılan ekran ve bir sihirbazın
                                dördüncü adımından geçilerek varılmıyor. Üç
                                mod: Sınıftan · Öğretmenden · Genel. Odaklanmış
                                modda form o ekseni HİÇ SORMAZ — şerit söyler,
                                sağ sütun seçer (Müsaitlik'in deseni)
components/settings/*.tsx       Ayarlar: index (kabuk) + Zil ve günler ·
                                Kurallar · Görünüm · Planlar ve yedek ·
                                Hakkında. Son ikisini Data.tsx çiziyor
                                (part prop'u) ve Plans.tsx'i kendi içine alır;
                                Görünüm okulu değil MAKİNEYİ tarif eder
                                (theme.ts)
components/CapacityRows.tsx     kapasite tablosu, TEK çizim. Özet ve Kontrol
                                aynı ReportRow[]'yu iki ayrı şekilde
                                çiziyordu; buildReport zaten buildCapacity'nin
                                satırlarını döndürüyor, yani ikisi tek gerçek
```

### Programın adı — ne DEĞİŞTİ, ne DEĞİŞMEDİ (2026-08-28)

Ad **Mozaik**. Beş dilde de aynı kelime (Mozaik · Mosaic · Mosaik · Mosaico ·
Mosaïque) ve ekrandaki şeyi tarif ediyor. Tek kaynağı `version.ts`'teki
`APP_NAME`.

**Değişmeyenler, ve bu bir VERİ kararı:** `localStorage` anahtarları
(`ders-programi*`) · yedek dosya adları (`ders-programi-YYYY-AA-GG.json`) ·
`Belgelerim\Ders Programı` klasörü (`lib.rs`'in `FOLDER`'ı ve `desktop.ts`'in
`EXE_FOLDER`'ı) · **GitHub deposunun adı** · **`tauri.conf.json`'ın
`identifier`'ı**. Sondan ikincisi kozmetik değil: `update.rs`'in `RELEASE_KOK`'u
v1.4.0 kopyalarına **derlenmiş**, yani depo yeniden adlandırılırsa o kopyalar
bir daha hiç güncellenemez.

> **Sonuncusu 2026-08-29'a kadar listede DEĞİLDİ ve orada olmalıydı.** v2.0.0
> `identifier`'ı `com.dersprogrami.arac` → `me.mozaik.arac` yaptı, çünkü bir
> ters-DNS kimliği bir **ad** gibi görünüyor. Değil: Tauri WebView2'ye profil
> olarak `%LOCALAPPDATA%\<identifier>` veriyor, yani o dize localStorage'ın
> **durduğu yol**. Bu makinede ölçüldü — `%LOCALAPPDATA%\com.dersprogrami.arac`
> altında `EBWebView\Default\Local Storage\leveldb` içinde `ders-programi`,
> `ders-programi-planlar`, `ders-programi-yedek-0`, köken
> `http://tauri.localhost`. O commit'ten derlenen exe **bomboş** açılır: veri
> diskte durur, programda görünmez, ve hiçbir yerde hiçbir cümle sebebini
> söylemez. Geri alındı, ve `src/surum.test.ts` artık dizeyi çiviliyor
> (bkz. tuzak 95). **Yayınlanmış v2.0.0 varlığı bu kusuru taşıyor** — düzeltme
> bir sonraki sürümle gider.

**Güncelleme yolu kırılmıyor ve sebebi yazılı:** `update.rs` takası **çalışan
programın kendi dosya adı** üstünden yapıyor (`current_exe()` + `.yeni`/
`.eski`) ve indirme adresini `surum.json`'dan okuyor. Babanın makinesindeki
`Ders-Programi.exe`, `Mozaik.exe`'yi indirir ve **kendi adıyla** yerine koyar:
dosya adı eski kalır, içindeki program yenidir.

**Kurulum yolunda tek gerçek risk kapatıldı:** `%LOCALAPPDATA%\Mozaik`'e
kurulurken eski adla duran **kısayol siliniyor** (iki kısayol iki program
demektir ve ikincisi artık güncellenmeyen bir kopyayı açar); eski **klasör**
silinmiyor, yalnızca söyleniyor.

---

`rules.ts`, `constraints.ts`'ten **yalnızca `Index` tipini** alır (`import type`,
derlemede silinir) — çalışma zamanında döngü yok. Anahtar üreten fonksiyonlar
`keys.ts`'te; `constraints.ts` onları yeniden dışa aktarır, çağrı yerleri değişmez.

`entities.ts` `import.ts`'ten **yalnızca satır tiplerini** alır (`import type`) —
aynı desen, çalışma zamanında döngü yok. `import.ts` ise `makeShort`'u `entities.ts`'ten
alır ve yeniden dışa aktarır: kısaltmanın tek evi var.

`library.ts` `store.ts`'i **çağırmaz** ve `State`'in ne olduğunu bilmez: ham
**string** alıp verir, ayrıştırmayı `store.ts` yapar. `types.ts`'ten yalnız `Id`
tipini alır (`import type`) — yani `store.ts` ↔ `library.ts` çalışma zamanı
döngüsü yok, `keys.ts`'in constraints ↔ rules için yaptığının aynısı.

`bundle.ts` de aynı sözleşmeyle yaşar: paketin zarfını okur, içindeki her planın
durumunu **ham `unknown`** olarak geri verir, `parseState`'i `store.ts` çağırır.
Bozuk girdi kurallarını (kimliksiz girdi atılır, adsız girdi yeniden adlandırılır)
kendisi yazmaz — `normalizeLibrary()`'ye devreder, yani o kurallar tek evde durur.

`solver.ts` kısıt mantığının **hiçbirini** yeniden yazmaz: her yasallık sorusu
`blocker()`'a gider, yani sürüklemeyi yargılayan fonksiyonun ta kendisine.
Bir ders **iki iş kalemine** ayrılır (2'likler ve 1'likler) çünkü aramanın
elindeki her sayaç — aday hücre kümesi, MRV, ileri kontrolün "her bloğa bir
başlangıç hücresi lazım" sınırı — blokların eşit boylu olduğunu varsayıyor;
kalem içinde bu doğru kalır. İki kalem aynı sınıfı paylaştığı için `neighbours`
onları zaten birbirinin komşusu yapar. `done` artık `placedHours`'tan
türetilmez (iki kalem tek sayıyı paylaşamaz): yeniden başlatmada dondurulmuş
ızgaradan `placedBlocks()` ile **boyuna göre** sayılır.
Kendine ait iki şeyi var, ikisi de aramanın kendisiyle ilgili: her dersin
**tavanı** (haftanın o derse verebileceği en fazla saat) arama başlamadan
hesaplanır, ve ızgara 20 000 düğüm boyunca iyileşmezse bir dersten vazgeçilip
o ana kadarki en iyi ızgaradan devam edilir (tuzak 26). Bir kural
sürüklerken başka, otomatik dizerken başka anlama gelemez. Aramanın karşılayamadığı
tek şey `place()`'in her çağrıda sözlüğü kopyalaması; onun için `constraints.ts`'te
`occupy`/`vacate` var — `place()` + `buildIndex()` ikilisinin yerinde çalışan hâli.
İkisinin sapmaması `constraints.test.ts`'te yedi testle sabitlenir.

**Kural:** iş mantığı bileşenlerin içine yazılmaz. Bir `.tsx` dosyasında çakışma
hesabı görüyorsan yanlış yerdedir — `constraints.ts`'e taşı.

**Kural:** `constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts`, `blocks.ts` içindeki her dışa aktarılan fonksiyonun testi olacak. Bu dosyalara test yazmadan
özellik eklenmez. `store.ts` içindeki `parseState` ve `entities.ts` içindeki
`remapDays` de test edilir: ilkinden her yedek dosyası geçer, ikincisi gün listesi
değişince programın kaymasını engelleyen tek şeydir.

---

## Veri modeli — özet

Tam hâli [src/types.ts](src/types.ts). Değiştirmek pahalı; değiştirmeden önce düşün.

```ts
State {
  schemaVersion: 11
  settings: {
    schoolName: string
    days:   Day[]      // varsayılan 6 gün: Salı..Pazar (Pazartesi ders yok)
    hours:  string[]   // ders ETİKETLERİ; uzunluk = günlük ders sayısı (12)
    bell:   Bell       // saatler hesaplanır, tek tek saklanmaz
    limits: Limits     // okul geneli varsayılan sınırlar
    rules:  Rules      // her sınır için Kapalı / Uyar / Engelle
    subjects: string[] // okulun branş listesi — TAMAMI saklanır
    subjectShorts: Record<string, string>   // YALNIZCA değiştirilenler
  }
  rooms, teachers, classes, lessons
  unavailable: Record<`${entityId}|${day}|${hour}`, 1>   // öğretmen + sınıf + derslik
  placements:  Record<`${classId}|${day}|${hour}`, lessonId>
  pinned:      Record<`${classId}|${day}|${hour}`, 1>   // sabitlenmiş hücreler
}
Day        { name, longBreakAfter }         // 5 = öğle arası 5. dersten sonra, 0 = yok
Bell       { start, lessonMinutes, breakMinutes, longBreakMinutes }  // 09:00 · 40 · 10 · 30
Limits     { maxConsecutive, maxPerDay, minPerDay, maxSameLessonPerDay }  // 0 = sınır yok
Teacher    { name, short, subject, subject2, gender, color, limits }
                                            // subject2 = İKİNCİ branş, ya da ''
                                            // ('' bir DEĞER, eksik veri değil)
                                            // gender: '' | 'k' | 'e'; '' bir DEĞER,
                                            // eksik veri değil. Kâğıda çıkmaz.
                                            // limits alanları null = okul varsayılanı
                                            // color = PALETTE indeksi, kimseyle çakışmaz
ClassGroup { name, roomId, color, maxSameLessonPerDay }
                                            // derslik sınıfın sabit alanı, seçilmez
                                            // maxSameLessonPerDay: null = okul
                                            // varsayılanı. Günlük sınırın ORTA
                                            // katmanı; dersin kutusu onu da ezer.
Lesson     { classId, teacherId, weeklyHours, blocks, second, maxPerDay }
                                            // second = hocanın İKİNCİ branşından
                                            // mı. Branşın ADI değil BAYRAK: ad
                                            // ikinci bir gerçek olur ve hoca
                                            // düzeltilince sessizce sapar.
                                            // blocks = birden uzun blokların
                                            // LİSTESİ, büyükten küçüğe. Her
                                            // eleman 2, 3 ya da 4; toplamı
                                            // weeklyHours'ı geçmez, kalanı tek
                                            // saat. 9 saat + [3,2] = 3+2+1+1+1+1.
                                            // pairs'ın yerine geçti (v9), o da
                                            // blockSize'ın yerine geçmişti (v7).
```

### Depolama anahtarları

```
ders-programi            -> "1" numaralı planın State'i   (TARİHSEL anahtar)
ders-programi-plan-<id>  -> diğer planların State'i
ders-programi-planlar    -> { activeId, plans: [{ id, name, draft }] }
ders-programi-yedek-N    -> oturum yedek zinciri (son 3), açılıştaki plana ait
ders-programi-tema       -> tema tercihi
ders-programi-dil        -> arayüz dili (tr / en / de / es / fr)
ders-programi-kenar      -> kenar çubuğu tercihi
ders-programi-olcek      -> yazı büyüklüğü tercihi (--ui-scale, 1.0–1.50)
ders-programi-yogunluk   -> ızgara yoğunluğu tercihi (ferah / rahat / sigdir)
ders-programi-havuz      -> havuz çekmecesi açık mı (acik / kapali)
ders-programi-havuz-boy  -> havuz çekmecesinin boyu, REM (6–22, 0.25 adım)
ders-programi-serit      -> araç şeridi açık mı (acik / kapali)
ders-programi-serit-gizle-> şerit kaydırınca kendiliğinden gizlensin mi
ders-programi-hareket    -> hareket (animasyon) tercihi (tam / az / kapali)
ders-programi-baski      -> kâğıtta ne olsun: beş anahtarlı TEK kayıt (JSON)
ders-programi-tanitim    -> Kurulum'daki örnek veri satırı görüldü mü
```

**Bu listenin tamamı Ayarlar → Veri'deki tabloda görünür ve bu bir SÖZLEŞME:**
`planlar.spec.ts` gerçekten yazılmış her `ders-programi*` anahtarını tabloda
arar. Yeni bir anahtar açıyorsan `library.ts`'teki `storageReport`'a satırını
da yazacaksın — `ders-programi-baski` haftalarca eksikti ve görünmedi, çünkü o
anahtar ancak biri bir baskı ayarına dokununca doğuyor. **Yeni bir tercih
`sessionStorage`'a giderse bu borç doğmaz**, ve "bu oturumda bir daha sorma"
zaten oraya aittir (güncelleme şeridinin `Sonra`'sı böyle).

**Dersler'in modu ve odağı HİÇBİR yerde saklanmaz** — ne `State`'te ne
`localStorage`'da. `toolState.ts`'in sözleşmesi bu: orası bir POZİSYON tutar,
bir tercih değil. "Hangi sınıfın derslerini giriyorum" bir oturumun içindeki
yerdir; yarın açılışta hatırlanması, bir yedeğin onu taşıması ya da bir şema
sürümü artması gereken bir şey değil.

**Onuncu makine tercihi localStorage'da DEĞİL:** babanın seçtiği klasörün
tutamağı `IndexedDB['ders-programi-klasor']`'da durur. Sebep tercih değil,
imkân: bir `FileSystemDirectoryHandle` string değildir ve JSON'dan geçmez;
tarayıcıda onu tutabilen tek yer structured clone'dur. Kural bozulmadı —
**`State`'e girmez, `schemaVersion` artmaz**: bu bilgisayarda alınmış bir
yedek babanın makinesine bir klasör yolu taşımamalı.

`ders-programi-baski` bilerek `theme.ts`'in dışında (`src/printOptions.ts`).
Oradaki dokuz skaler **ilk boyamadan önce** `<html>`'e öznitelik yazan düzen
değerleri; bunlar render anında React prop'u olan **tek bir karar** — "kâğıtta
ne var" — ve beş cevabı var. Beş ayrı anahtar, bir soru için beş normalize
demekti. `theme.ts` dokuz bağımsız skaler olarak kalıyor.

Havuz boyu **rem**, px değil: `--ui-scale` %150'ye çıkınca sabit px'lik bir
çekmece, içindeki kartlar büyümüşken görsel olarak küçülür. Ayrı bir anahtar,
`ders-programi-havuz`'un genişletilmiş hâli değil — o anahtarın sözleşmesi
"`kapali` değilse açık" ve içine bir sayı katlamak tek ayrıştırıcıya ikinci bir
normalize dalı sokardı. `theme.ts` bağımsız skalerleri bağımsız anahtarlarda
tutuyor — dokuz tane — ve bu onlardan biri.

**Hareket tercihi bir MAKİNE tercihidir ve makinenin kendi tercihini EZEMEZ.**
`ders-programi-hareket` üç değer alır (`tam` · `az` · `kapali`) ve `data-motion`
olarak `<html>`'e yazılır. `@media (prefers-reduced-motion: reduce)` bloğu
`styles.css`'te `[data-motion]` kurallarından **sonra** ve eşit özgüllükte
durur, yani sıra kazanır: işletim sistemi "azalt" diyorsa seçim ne olursa olsun
hareket kapalıdır. Ayar makinenin isteğinin **ötesine** geçebilir, gerisine
değil — CLAUDE.md'nin tek hareket sözleşmesi (`prefers-reduced-motion: reduce`
→ hepsi kapalı) böylece bozulmadan durur. İlk okumada kayıt yoksa tercih
**sistemden** türetilir (`normalizeMotion(raw, prefersReduced)`), çünkü hiçbir
şeyin kıpırdamadığı bir makinede düğmede "Tam" yazması yalandır.

### Dosya biçimleri — iki tane, karıştırılamaz

```
{ "schemaVersion": 7, ... }    -> TEK plan.  ders-programi-YYYY-AA-GG-SSDD.json
{ "bundleVersion": 1, ... }    -> HER plan.  ders-programi-tumu-YYYY-AA-GG-SSDD.json
```

Üst çubuk tek planı yazar ve okur; **paket** Ayarlar → Veri'de kalır, çünkü bir
paketi açmak bu bilgisayardaki bütün planların yerine geçmek demektir. Paket
`bundleVersion` taşır, `schemaVersion` değil: zarf ayrı sürümlenir, içindeki her
plan hâlâ kendi `schemaVersion`'ıyla gelir ve aynı `parseState` göçünden geçer.
`src/bundle.ts` zarfı bilir, `State`'in ne olduğunu **bilmez** — `library.ts`'in
deseni birebir. Paket **depolama anahtarı değildir**: yeni anahtar açılmadı.

Bir plan = bir program: kendi okulu, kendi öğretmenleri, kendi ızgarası.
**Taslak ayrı bir varlık değil**, `PlanInfo.draft` bayrağı — yerleşimi
boşaltılmış bir plan. Plan kimliği `State`'e **girmez**, `schemaVersion`
değişmez: yedek dosyası hâlâ tek bir plandır.

Tema tercihi `State`'e **girmez**: `localStorage['ders-programi-tema']`'da durur.
Makine tercihi, program verisi değil — koyu makinede alınmış bir yedek babanın
makinesinde temayı çevirmemeli, ve kozmetik bir ayar için şema göçü yazılmamalı.

Varsayılan zil düzeni: 09:00 başlar, 40 dk ders + 10 dk teneffüs, hafta içi 5. dersten
sonra / hafta sonu 6. dersten sonra 30 dk öğle arası — **iki desende de 12. ders 19:10'da
biter**. Bu `bell.test.ts`'te açıkça iddia edilir.

### Neden böyle

- **Branş öğretmenin alanı, dersin değil — ama İKİ tane olabilir.** Karar
  2026-08-27'de "alt branş mı çift branş mı" diye soruldu ve **çift branş**
  seçildi; gerekçe kullanıcının kendi ikinci örneğidir. "Matematik 1 /
  Matematik 2" bir hiyerarşiyle anlatılabilir, **"Türkçe ve Edebiyat"
  anlatılamaz** — o ikisi birbirinin alt branşı değil. Bir ağaç istenen
  vakaların yalnız yarısını çözer ve `settings.subjects`'e ikinci bir veri
  şekli sokardı.
  **Dersin hangi branştan olduğu bir BAYRAK** (`Lesson.second`), branşın adı
  değil: ad ikinci bir gerçek olur ve öğretmenin branşı düzeltilince sessizce
  sapardı — `Teacher.subject` zaten bilerek id değil string, tam da yeniden
  adlandırma ucuz kalsın diye. Bayrak sapamaz: öğretmenin iki alanından birini
  gösterir, ve öğretmenin ikinci branşı silinince `sanitize()` onu temizler.
- **Derslik sınıfın sabit alanı.** Yerleştirirken oda seçilmez, ama iki sınıf aynı
  dersliği paylaşıyorsa çakışma kontrol edilir (~20 sınıf, 8 derslik).
- **`placements` düz sözlük, dizi değil.** Gün/saat sayısı değişince taşan anahtarlar silinir.
- **Blok ayrı varlık değil, ve ızgara blok SINIRI saklamaz.** Ardışık anahtarlara
  aynı `lessonId` yazılır. Bir dersin blokları eşit boylu olmadığından (2+1) bir
  koşu birden çok türlü okunabilir; hangisi olduğuna **tek bir sözleşme** karar
  verir — `constraints.ts`'teki `placedBlocks()`: gün/saat sırasıyla gezilir, her
  koşuda önce **uzun bloklar** alınır (dersin `blocks` listesi büyükten küçüğe
  tükenene kadar), kalan hücreler tek saattir. Izgara, havuz, sağ tık ve denetçi aynı fonksiyondan okur.
- **Haftalık saatin şekli bir LİSTE.** `blocks`: birden uzun blokların boyları,
  büyükten küçüğe. `weeklyHours` zaten toplam ve bu onu **tekrar etmez**, yalnız
  şeklini söyler; toplamı asla toplamı geçemez (`clampBlocks`, `blocks.ts`).
  Tek sayı olan `pairs` yalnız "şu kadar İKİLİ" diyebiliyordu, yani 3 ve 4'ü
  hiç söyleyemiyordu; ondan önceki `blockSize` ise "her blok bu boyda"
  diyebiliyordu, yani `2+1`'i söyleyemiyordu. Bir liste üçünü de söyler.
- **Anahtarlarda asla isim kullanılmaz, hep `id`.** "Şükrü" adı değişince yerleşim bozulmasın.
- **Zil saatleri hesaplanır, saklanmaz.** Başlangıç + üç süre; her günün tek farkı öğle
  arasının nereye düştüğü. Period başına satır tutmak aynı bilgiyi 12 kez saklamak olurdu.
- **Kapalı saatler tek sözlükte.** `id`'ler üç liste arasında benzersiz olduğu için
  öğretmen, sınıf ve derslik aynı `unavailable` haritasını paylaşır — ikinci bir sözlük,
  ikinci bir göç ve ikinci bir `sanitize` dalı gerekmiyor.
- **Sınırlar KATMANLI, ve "aynı dersten günde en fazla" ÜÇ katmanlı.**
  `settings.limits` okul geneli; `Teacher.limits`, `ClassGroup.maxSameLessonPerDay`
  ve `Lesson.maxPerDay` içinde `null` "bir üsttekini kullan" demektir. Günlük ders
  sınırında sıra en dardan en genişe: **dersin kutusu → sınıfın kutusu → okul**.
  Gerekçe her katmanda aynı: 25 hocaya aynı sayıyı 25 kez girdirmemek, ve
  "510 bir günde aynı dersten en fazla 2 saat görsün"ü o sınıfın **her dersine**
  tek tek yazdırmamak. Çözen tek yer `rules.ts`'teki `lessonLimit()`; `group`
  parametresi sondan ve isteğe bağlı (tuzak 76), sıcak yollar sınıfı elden verir.
  Bir kutunun placeholder'ı **bir üstteki katmanın** sayısıdır — kullanılmayacak
  bir sayı gösteren placeholder yalan söyler.
- **Branş kısaltmasında yalnızca DEĞİŞTİRİLEN saklanır.** `Matematik → Mat` gömülü
  tablodan gelir; `subjectShorts`'a ancak varsayılandan farklı bir şey yazılınca kayıt
  düşer, varsayılana geri yazılırsa silinir. Böylece yedek 21 varsayılanla şişmez ve
  gömülü tablo ileride iyileşirse eski proje kendiliğinden faydalanır.
- **Renk kimliktir, süs değil.** Her öğretmenin ve her sınıfın kendine ait bir rengi
  var; `addTeacher`/`addClass` **kullanılmayan** en küçük indeksi verir (`firstFreeColor`),
  sıradakini değil. Palet 36 renk ve `src/palette.ts` içinde düz hex — iki temada ve
  kâğıtta aynı olan tek renk kümesi olduğu için CSS değişkeni hiçbir şey kazandırmıyordu.
  Renkler elle seçilmedi, **arandı**: kontrast ve CIE Lab ayrımı kısıtları altında en
  uzak nokta yöntemiyle. `palette.test.ts` bunu her koşuda yeniden ölçer.
- **Branş listesi TAM saklanır, kısaltmalar sapmalı.** `subjects` kullanıcının
  düzenlediği bir liste — gömülü tablodan türetilen bir liste "Fransızca'yı kaldır"ı
  ifade edemez. `subjectShorts` ise yalnız değiştirileni tutar. `Teacher.subject` hâlâ
  bir **string**, id değil: branş silmek cascade gerektirmesin ve yedek okunur kalsın.
- **`schemaVersion` ilk günden var.** v1 = Türkçe alan adları, v2 = İngilizce,
  v3 = `Day` nesneleri + zil saatleri + kurallar, v4 = `subjectShorts`,
  v5 = `ClassGroup.color` + `settings.subjects`, v6 = `Teacher.gender`.
  v7 = `Lesson.pairs`, `blockSize`'ın yerine.
  v8 = `Teacher.subject2` + `Lesson.second` — bir öğretmen iki branş verebilir.
  v9 = `Lesson.blocks`, `pairs`ın yerine — blok 2, 3 ya da 4 saat olabilir.
  v10 = `State.pinned` — okuyanın yerine sabitlediği hücreler.
  v11 = `ClassGroup.maxSameLessonPerDay` — günlük sınır bir orta katman kazandı.
  `parseState` v1'i v2'ye, v2'yi v3'e taşır; v3–v11 tek okuyucudan geçer —
  v3–v6'nın tek farkı **eklenen** alanlar, v7 ise ilkin **değişen** alanı ve onu
  `readLessons()` kendi başına çevirir (`blockSize` 2 ya da 3 → `floor(saat/2)`
  ikili, 1 → sıfır). `id`'ler ve gün indeksleri değişmediği için `unavailable` ve
  `placements` anahtarları olduğu gibi geçer — **üç saatlik blok taşıyan bir
  yedeğin de programı yerinde kalır**, yalnız o koşunun içindeki sınır yeniden
  okunur ve hiçbir kısıt bir sınıra bakmaz (bkz. tuzak 63). **Şema her değiştiğinde: sürümü artır, göç kodunu yaz,
  hem birim hem E2E testini ekle.** Eski yedek açılmıyorsa veri kayıptır.

---

## Kısıtlar

`blocker()` sırayla bakar, ilk engelde döner. Mesaj **her zaman somut**:
"Çakışma var" değil, `"MÇ o saatte 433 sınıfında"`. Programı dizen kişinin bir
sonraki hamlesini belirleyen şey bu cümle.

**Sert — her zaman engeller:**

1. Blok gün sonuna sığıyor mu
2. Sınıfın o saatleri boş mu
3. Sınıf o saatte kapalı mı
4. Öğretmen o saatte müsait mi
5. Öğretmen o saatte başka sınıfta mı
6. Dersliği paylaşan başka sınıf o saatte ders yapıyor mu
7. Derslik o saatte kapalı mı

**Ayarlanabilir — `settings.rules` "Engelle" ise engeller, "Uyar" ise sadece sarı boyar:**

8. Öğretmen art arda en fazla N saat
9. Öğretmen günde en fazla N saat
10. Bir sınıf aynı dersten günde en fazla N saat

`minPerDay` (geldiği gün en az N saat) yerleştirmede kontrol **edilemez** — günün ilk
dersini koyarken her zaman ihlal olur. Yalnızca `findViolations()` üzerinden Kontrol
sekmesinde çıkar.

`blocker()` sert kısıtları + "Engelle" seviyesindeki kuralları döndürür; `check()` onun
üstüne "Uyar" seviyesindekileri `warning` olarak ekler. İkisi de **aynı**
`limitBreaches()` fonksiyonunu kullanır, mesajlar ayrışamaz.

`blocker()` aslında `blockerDetail()` üstünde ince bir sarmalayıcı: asıl fonksiyon
mesajın yanında bir **kod** da döndürür (`teacherClosed`, `classBusy`, `roomBusy`…).
Sebepleri sayan her yer (Kontrol'ün "yerleşemeyen dersler"i, çözücünün tıkanma
cümlesi) koda göre gruplar — mesaj gün ve saat adı taşıdığı için cümle saymak yanlış
cevabı veriyordu (tuzak 22).

Boşluk (pencere) kuralları hâlâ **yok**. İstenirse sonra gelir.

---

## Bilinen tuzaklar — hepsi bu tür araçlarda kesin çıkar

1. **Sürüklerken re-render sürüklemeyi bozar.** Bu yüzden HTML5 drag-and-drop değil
   **Pointer Events** kullanılıyor. `pointermove` sırasında React state güncellenmez;
   hayalet kart `transform` ile doğrudan DOM'dan taşınır.
2. **Geçerli hücreler sürükleme başında bir kez hesaplanır**, her `pointermove`'da değil.
3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput` değil
   `defaultValue` + `onBlur`.
4. **Silme cascade olmalı.** Öğretmen silinince dersleri, ders silinince yerleşimleri,
   sınıf silinince ikisi de. Yetim `lessonId` kalırsa ızgara çöker.
5. **Gün/saat sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez hayalet
   dersler kalır, sayaçlar tutmaz.
6. **`sanitize()` her yüklemede ve her ayar değişikliğinde çağrılır.** 4 ve 5'in çaresi bu.
7. **localStorage silinebilir.** Karşı önlem: her değişiklikte otomatik kayıt + son 3
   durum ayrı anahtarda + görünür "Yedek indir". Babama tek alışkanlık öğretilecek:
   *değişiklik yaptın, yedek indir.*
8. **Yazdırma her zaman hafife alınır.** Sayfa başına bir sınıf/öğretmen
   (**satır = gün, sütun = ders, A4 YATAY**, `table-layout: fixed`). 72 sütunlu ana
   tablo basılmaz. Sonda değil ortada test edilir — ve "taşmıyor" yetmez: sütunların
   eşit olduğu ve sayfanın gerçekten yatay çıktığı ölçülür (`page.pdf` → MediaBox).
9. **Blok render'ında `rowspan` kullanılmaz.** rowspan + dinamik tablo = bug fabrikası.
   İkinci hücreye sade devam işareti konur.
10. **2100 hücre var.** Satırlar `React.memo` ile sarılı; bir yerleştirme 1-2 satır çizer.
11. **Gün listesi değişince anahtarlar kayar.** `placements` anahtarı gün **indeksi**
    tutuyor. Pazartesi listeden çıkarılırsa Salı 1'den 0'a kayar ve bütün program bir gün
    öne kayar — sessizce. Çare: `remapDays()` eşlemeyi **isimden** kurar, çıkarılan günün
    anahtarlarını siler, kalanları yeniden yazar. Her `updateSettings` bundan geçer.
12. **`Cuma` ve `Cumartesi` ikisi de `slice(0,3)` ile "Cum" olur.** Gün kısaltmaları
    `shortDay()` tablosundan gelir (`Cmt`, `Pzr`), ilk üç harften değil.
13. **Izgaraya eklenen her hücre sürükleme hedefi sanılır.** `drag.ts` hedefi
    `closest('[data-day]')` ile buluyor. Öğle arası ayraç sütunu `data-day`/`data-hour`
    **taşımaz**; taşısaydı ders öğle arasına bırakılırdı. Yeni bir sütun/hücre eklerken
    ilk soru bu.
14. **Tarayıcı açık temalı sayfayı kendi karartır.** Çare `color-scheme`'i iki temada da
    doğru kurmak. Renk *değerlerini* düzeltmek yetmez; `color-scheme` yoksa tarayıcı
    üstüne kendi algoritmasını uygular ve işlevsel renkler çamurlaşır.
15. **Palet üstündeki metin tema ile dönmemeli.** Öğretmen renkleri pastel ve iki temada
    da aynı; `color: inherit` bırakılırsa koyu temada açık metin pastel zemine düşer ve
    hücre okunmaz olur (`--on-color`).
16. **Kapalı saat işareti yalnız BOŞ hücreye çiziliyordu.** Müsaitlik program dizildikten
    *sonra* düzenleniyor; dolu bir saati kapatınca ders yerinde kalıyor ama tarama kartın
    altında kaldığı için **hiçbir yerde görünmüyordu**. `blocker()` de yakalayamaz —
    yalnız olası bir bırakma için çalışır. Çare `closedConflicts()`: ders **silinmez**
    (ilke 6), kırmızı işaretlenir ve Kontrol'de sayılır.
17. **Izgara hücresinin genişliğini `table.grid tbody td` belirler.** `.break-col` gibi
    tek sınıflı bir kural (0,1,0) ondan (0,1,3) zayıf kalır: öğle arası ayracı aylarca
    "dar" tanımlıyken bir ders kadar geniş çizildi. Yeni bir hücre genişliği
    veriyorsan ya seçiciyi güçlendir ya `!important` kullan — ve **ölç**.
18. **Bileşen sekme değişince sökülür.** `useState` içindeki her şey gider. Baskı sayfa
    seçimi bu yüzden `App`'te duruyor: Kurulum'a gidip dönmek listeyi siliyordu. Aynı
    şekilde seçimi "seçilenler" olarak tutmak yanlıştır — **dışarıda bırakılanlar**
    tutulur, yoksa sonradan eklenen sınıf sessizce basılmaz. **Otomatik dizme koşusu da
    aynı sebeple `App`'te** (`useSolver`): Kontrol'e bir göz atmak aramayı öldürürdü.
19. **Web Worker bu projede çalışmaz.** İki bağımsız sebep: Vite worker'ı **ayrı bir
    chunk** olarak üretir ve `vite-plugin-singlefile` onu gömmez — "tek dosya" iddiası
    düşer; kalan yol olan `blob:` worker'ı ise `file://`'in opaque origin'inden çalışır
    ve Chromium'da güvenilmez, üstelik kaynak string olacağı için `tsc` onu hiç görmez.
    Çözücü bu yüzden ana iş parçacığında, `requestAnimationFrame` ile **dilim dilim**
    çalışır. `setTimeout(0)` değil: iç içe beş çağrıdan sonra 4 ms'e kelepçelenir ve
    boyama garantisi vermez, yani ilerleme satırı görünmez.
20. **React reducer geri çağırımını GEÇ çalıştırır.** `change((d) => ...)` içine bir
    `ref` okuması koyup fonksiyondan sonra o `ref`'i temizlersen, geri çağırım
    çalıştığında `null` bulur ve **bütün iş sessizce atılır**. Otomatik dizmenin sonucu
    tam olarak böyle kayboldu. Referansı önce yerel bir değişkene al.
21. **Arama uzayını daraltan kısıtlama, değer sezgisini bozuyorsa kaybettirir.**
    Çözücüde "aynı dersin blokları artan hücre indisinde" simetri kırması vardı;
    "haftaya yay" sezgisi geç bir hücre seçince dersin kalan blokları oradan sonrasına
    hapsoluyordu. Ölçülen fark: **57718 düğümde 26 blok** ile **359 düğümde 359 blok**.
    Kaldırıldı. Teoride doğru olan, ölçülmeden konmaz.
22. **Sebep cümleleri gün ve saat adı taşır, o yüzden CÜMLE sayılmaz.** "En sık sebep"
    hesabı altmış farklı "sınıfın X saatinde Y var" satırını altmış ayrı sebep sayıyor,
    altı kez tekrarlanan daha önemsiz bir cümle kazanıyordu — hafta boyu kapalı bir
    öğretmen için "2 saatlik blok güne sığmıyor" yazdı. `blockerDetail()` bir **kod**
    döndürür (`teacherClosed`, `classBusy`, …); sayım koda göre yapılır.

23. **Testi yargılayan denetçinin kendisi test edilmeli.** `illegalBlocks()` her
    zaman `[]` döndürseydi çözücünün 19 dünyalık matrisi de, 24 E2E testi de
    bedavaya yeşil geçerdi — ve hiçbiri bunu haber vermezdi. `worlds.test.ts`
    ona bilerek bozuk ızgaralar verir (aynı öğretmen iki sınıfta, kapalı saatte
    duran ders, gün sonunu taşan blok) ve yakaladığını doğrular. Aynı sebeple her
    dünya testinde bir koruma var: kaydedilen yerleşim sayısı girişteki sayıdan
    büyük olmalı, yoksa iddialar dizimden ÖNCEKİ ızgarayı yargılıyor olabilir.

24. **`localStorage` kaydı 400 ms gecikmeli; "sonrasını oku" öncesini okur.**
    E2E'de bir eylemin sonucunu depodan doğrulamak için "eylemden önceki değeri al,
    sonra değişmesini bekle" yetmez: sayfanın *yüklenmesi* de kendi kaydını 400 ms
    sonra yazar, ve "önceki değer" o yazımdan önce alınmışsa beklenen değişiklik
    yüklemenin kendisi olur. Çare `settledText()`: tıklamadan önce sayfanın gerçekten
    bir şey yazmış olmasını beklemek. "Değer sabitlenene kadar bekle" de işe yaramaz —
    eski değer de sabittir.

25. **`--update-snapshots` tek başına yalnız KIRMIZI referansları yeniler.** Eşiğin
    (`maxDiffPixelRatio`) yuttuğu gerçek bir düzen değişikliği referansı sessizce
    eski bırakır. Hepsini yazdırmak için `--update-snapshots=all`. Müsaitlik satırı
    34 → 48 px olduğunda tam bunun oldu: tablo 84 px büyüdü, o günkü `npm run gorsel` yeşil
    geçti, referanslar yalan söylemeye başladı.

26. **MRV en küçük domaini seçer — tamamlanamayan ders domaini en küçük olandır.**
    Haftada 8 saat isteyen ama kurallar yüzünden en fazla 4 saat tutabilen bir
    ders, izin verilen her günü doldurduktan sonra "yer yok" der; arama geri
    sarar, aynı dersi yeniden seçer, aynı duvara çarpar. Üstelik bu, üstündeki
    her dersin her hücresi için tekrarlanır. Ölçülen: 15 saniye boyunca 2-3
    blok. Çare iki katmanlı: her dersin **tavanı** arama başlamadan hesaplanır
    (`ceilingBlocks`, `need` ona kırpılır) ve ızgara belli bir düğüm sayısı
    boyunca iyileşmezse bir dersten vazgeçilir. **Vazgeçerken sıfırdan
    başlanmaz** — o ana kadarki en iyi ızgara tabana dondurulur, yoksa her
    vazgeçiş bütün emeği geri sarar.

27. **Yerleşemeyen dersin sebebi, dersin KENDİ blokları yüzünden yanlış çıkabilir.**
    Kısmen sığan bir ders izin verilen günleri kendi bloklarıyla doldurur;
    `blocker()` o noktadan sonra "sınıf o saatte dolu" der ve okuyan kişi
    kenara çekecek bir ders aramaya başlar. Çekilecek bir şey yoktur. Tavanı
    kırpılmış her ders için sebep cümlesi tavanın kendisidir. **Hiç** sığmayan
    derste ise `blocker()`'ın cümlesi zaten somuttur ("AV Salı 1 saatinde
    müsait değil"), o korunur.

28. **Plan değiştirmeden önce bekleyen kayıt EŞZAMANLI boşaltılmalı.** Otomatik
    kayıt 400 ms gecikmeli ve efektin temizliği kutu değişince bekleyen yazımı
    **iptal eder**. Yani plan geçişinde geçişten hemen önceki düzenleme hiçbir
    yere yazılmadan buharlaşır — ekranda hata yok, çubukta uyarı yok, bir
    sonraki açılışta iş eksik. `switchPlan`/`createPlan`/`deletePlan` üçü de
    önce `park()` çağırır: timer'ı iptal eder ve giden planı **hemen** yazar.

29. **İlk plan tarihsel anahtarını korur.** `planKey('1') === 'ders-programi'`.
    Böylece kitaplığa geçiş **tek bayt kopyalamaz** (yarım kalmış kopya = iki
    gerçek), eski bir `dist/index.html` hâlâ programı bulur, ve `ders-programi`
    okuyan yedek zinciri ile E2E yardımcıları değişmeden çalışır. `newId()`'nin
    alfabesinde `1` yok — üretilen kimlik o anahtarla çakışamaz; alfabe
    değişirse yeni bir plan 1. planın üstüne yazar. `library.test.ts` bunu 500
    kimlikle sabitler.

30. **İki dosya türü aynı düğmeye düşerse biri diğerini siler.** Üst çubuktaki
    "Dosyadan aç" bir **planı** açar; Ayarlar → Veri'deki "Tümünü dosyadan aç"
    **bütün kitaplığın** yerine geçer. Aynı uzantı, aynı ön ek, gözle ayırt
    edilemez — ve yanlışını seçmek geri alınamaz. Üç karşı önlem: paket adında
    `-tumu-` var, `parseState` bir paketi okuyamaz (`schemaVersion` yok) ve
    `parseBundle` bir planı okuyamaz (`bundleVersion` yok), üst çubuk paket
    görünce **reddedip yolu gösterir**. Yeni bir dosya biçimi eklenirse bu üç
    şeyin üçü de gerekir.

31. **Tarayıcının üst/alt bilgisi CSS ile gizlenemez — ama çizecek yer bulamazsa
    çizilmez.** Sol üstteki tarih ve sol alttaki dosya yolu sayfanın içeriği
    değil, **kenar boşluğu kutusunun** içeriğidir; `display: none` diye bir
    çaresi yoktur. Tek yol `@page { margin: 0 }` ve boşluğu `.print-page`'e
    padding olarak geri koymak. İki yan sonuç: (a) sayfa kutusu artık **sabit
    yükseklikli** olmalı ki içerik dikey ortalanabilsin, (b) o yükseklik tam
    210 mm olursa kesirli piksel + `break-after: page` her programın ardına
    **boş bir sayfa** koyar — 205 mm yazılır. Ortalarken `justify-content:
    center` değil **`safe center`**: taşma olursa düz `center` içeriği iki
    uçtan taşırır ve sayfanın üstü kesilir. Bunların hiçbiri Playwright'ın
    `page.pdf`'inde varsayılan olarak görünmez; kanıt için
    `displayHeaderFooter: true` ile PDF üretilip **gözle okunur**.

32. **İki derleme hedefi varsa biri diğerine sızar.** `dist/index.html`'in tek
    iddiası tek dosya ve ağsız olması; site hedefinin manifest'i, service
    worker'ı ve simgeleri o iddiayı sessizce bozabilir. Üç önlem birden:
    site'e özel etiketler `index.html`'de **durmaz** (yalnız site config'inin
    `transformIndexHtml`'i ekler), ana config'de `publicDir: false`, ve
    `site.spec.ts` `dist/index.html`'de `serviceWorker`/`manifest`/`sw.js`
    geçmediğini **okuyarak** doğrular. Yeni bir hedef eklenirse üçü de gerekir.

33. **Yazı boyunu büyütmek, sabit piksel genişliğindeki sütunu sessizce kırpar
    ve bunu hiçbir test görmez.** Y0'da gövde 14px'ten 16px'e çıktı; renk
    sütunu JSX'te `style={{ width: 44 }}` sabitti ve 44px iki basamaklı sayıyı
    artık alamadı — 11. öğretmenden sonra kutuda **"1" yazmaya başladı**. Süit
    228/228 yeşil geçti, çünkü testler bir `<select>`'in *var olduğunu* ve
    *değerini* ölçüyor, **metninin sığdığını** değil. Bu tuzak 23'ün tipografi
    hâli: yeşil geçen bir süit "bozulmadı" demek değildir. İki sonucu var,
    ikisi de **uygulandı**: ölçek değiştiren her adımda ekran görüntüsüne
    bakılıyor, ve genişlik `ch` cinsinden CSS'e taşınınca yanına
    `e2e/renk-secici.spec.ts` yazıldı. O test bir sayı uydurmaz: seçiciyi
    `width: auto` ile klonlayıp **tarayıcının kendi istediği genişliği** ölçer
    ve kutunun ondan dar olmadığını iddia eder. Yazıldıktan sonra eski 44px
    geri konarak koşuldu ve dördü de kırmızıya döndü — bedava yeşil değil.

34. **`<th>`'ye verilen genişlik SÜTUNUN genişliğidir, kontrolün değil.** Tuzak
    33'ü kapatırken ilk deneme genişliği `<th>`'ye `ch` cinsinden koydu; sonuç
    kutuyu 44px'ten **29px'e daralttı**, yani hatayı büyüttü. Sebep iki katlı:
    `<th>` genişliği hücre dolgusunu da içerir, ve `table.list th` 12px'ken
    `<td>` içindeki `<select>` 16px — aynı `ch` iki yerde iki farklı piksel.
    Kural: genişlik **kontrolün kendisine** verilir, sütun ondan boylanır.
    Seçici de aynı öğede olmalı (`table.list td > select.color-pick`), yoksa
    `table.list td > select { width: 100% }` (0,1,3) onu yener.
    **A2'de kuralın ikinci yarısı da yazıldı:** metin ya da `width: 100%` bir
    liste taşıyan sütunun genişliği gerçekten sütunun meselesidir ve `<th>`'ye
    verilir — ama o zaman birim başlığın ch'sidir. Ölçülen karşılıklar:
    `1ch` = 6.86px başlıkta, 9.15px gövdede. Bu yüzden `.num` bir `<input>`
    üstünde `8ch`, bir `<th>` üstünde `10ch`, ikisi de ~70px. Aynı sayıyı iki
    yere yazmak hatadır, farklı yazmak değil.

35. **`select` `color: inherit` alır — palet zemininde bu tuzak 15'in ta
    kendisidir.** Renk seçici `background`'ını paletten alıyor ama mürekkebini
    temadan alıyordu: koyu temada açık mürekkep pastel zemine düşüyor ve
    36 rengin açık olanlarında indeks **hiç görünmüyordu**. Kutu darken de
    böyleydi, sadece kırpılma yüzünden fark edilmiyordu. Palet rengi taşıyan
    her öğeye `--on-color` verilecek — `.card`, `.pool-card` ve `.ghost`'ta
    zaten var, unutulan tek yer bir `<select>`'ti.

36. **Bir hücre boyunu `-17px` gibi ELLE hesaplanmış yarımlarla yazma.**
    Hayalet kartın kaydırması `margin: -17px`, yani `34/2`'nin yazılmış hâliydi.
    `--cell-*` rem'e geçince o sayı sessizce yanlış oldu: %125'te hayalet
    parmağın altından kayardı. `calc(var(--cell-w) / -2)` yazılır — türetilen
    her ölçü, türediği değerden hesaplanır.

37. **Bir hücreyi daraltan `clamp()`, sütunun min-content'inden dar çizemez —
    ve o min-content'i sandığın öğe belirlemiyor olabilir.** "Sığdır" modu
    için `--cell-w` 28, 23 ve 18 px yapıldı; üçünde de hücre **33.69 px**
    çizildi, yani CSS'teki sayı çoktan anlamını yitirmişti. İlk teşhis
    karttaki iki satırdı (`411` + derslik harfi) — **yanlıştı**: kartın alt
    satırını gizlemek tabloyu 1 px oynatmadı. Suçlu başlıktaki `"10:40"`
    idi; onu gizlemek 2461 → 1728 px yaptı, yani haftanın tamamı kutuya
    girdi. Genişlikten türeyen bir ölçü yazmadan önce alt sınırın nereden
    geldiği **tek tek kapatılarak** ölçülür; "herhalde şudur" ile A5 hiç
    yazılamazdı. Aritmetik payı da ölçülür: 78 sütun kenarlığının alt-piksel
    yuvarlaması, 2 px payla 1 px kaydırma bırakıyordu.

38. **`font-display: swap` + `ch` cinsinden sütun merdiveni = her açılışta
    sessizce kayan bir düzen.** Gömülü yüz `data:` URI olsa bile eşzamanlı
    çözülmez: ilk düzen `ch`'yi YEDEK fonta çözer, yüz gelince yeniden çözer.
    Ölçülen: `1ch` **6,86px → 9,00px** aynı puntoda. `ch`'den boylanan her
    sütun bir kez zıplar. Çare `font-display: block` — ağdan indirme olmadığı
    için "engelleme" bir çözümlemedir, ve yanlış metrikle **hiçbir şey
    boyanmaz**. E2E de `document.fonts.ready`'yi bekler; bu bir gizleme değil,
    kullanıcının ilk glifi gördüğü anın ta kendisi.

39. **`ch` puntoyla ORANTILI DEĞİLDİR.** Gerçek bir yüz "0"ın ilerlemesini
    küçük puntolarda kuantalar: Plex'te 12px'te **7,00px**, 15px'te **9,00px**
    — oran 1,286, 1,25 değil. "Sütunlar ölçekle tam 1,25 büyür" diye yazılmış
    bir test aslında **fontun** bir özelliğini iddia ediyordu ve sistem fontu
    değişince kırmızıya döndü. Doğru değişmez **ch SAYISI**: kutu N ch ise
    her ölçekte N ch kalır — ve metnin ilerlemesi de aynı kuantayla büyüdüğü
    için sığma birebir korunur. Ham px genişlik bu iddiadan hâlâ geçemez:
    punto büyüdükçe ch sayısı düşer.

40. **Yeni bir zemin kuralı bir DURUMU ezebilir.** Gün bandı
    (`table.grid tbody td.band`, özgüllük 0,2,3) `td.unavailable`'ı (0,1,1)
    yendi ve **tek indeksli günlere düşen kapalı saatler taramasını sessizce
    kaybetti**. Hiçbir sayı, hiçbir metin, hiçbir öznitelik değişmediği için
    süit görmedi; yalnız "kapalı saat haçın altında kaybolmuyor" testi
    yakaladı. Kural: ekrana yeni bir zemin ekliyorsan, o zeminin **hangi
    durumları ezdiğini** tek tek yaz.

41. **Boş bir ızgarada yapılan ölçüm hiçbir şey ölçmez.** Havuz çekmecesinin
    Sığdır'a maliyeti önce boş haftada ölçüldü ve "sığıyor" çıktı; 426 kart
    konunca aynı yapılandırma **174px taştı**, çünkü sütunun tabanını kartın
    yazısı belirliyor. Bu tuzak 33'ün ailesinden ama kendi adı var: **bir
    düzen ölçümü, ölçtüğü şeyi dolduran veriyle yapılır.**

    Aynı oturumda ikinci hâli: "sürükleme hedefi ekran dışındaysa görünür
    oluyor" testi, havuzun alttan 215px yemesine **yaslanıyordu**. Havuz sağa
    taşınıp 25 satırın tamamı görününce test bir şey ölçmeden yeşil geçmeye
    başladı. Çare koşulu **zorlamak** (kısa viewport + satırdan uzağa
    kaydırma) ve önkoşulu iddia etmek — yoksa tuzak 23'ün ta kendisi olur.

42. **Bir ölçüm, ölçtüğü şeyin altındaki mekanizma değişince sessizce yalan
    olur.** "Sığdır havuzu kapatır" kuralı 174px'lik gerçek bir ölçüme
    dayanıyordu. Sonra `.grid-wrap` bir **container** oldu ve hücre
    `100cqw`'den hesaplanmaya başladı; o günden itibaren çekmece açıkken de
    taşma **0px**'ti, ama kural CLAUDE.md'de ölçüm gerekçesiyle duruyordu ve
    kimse yeniden ölçmedi. Ölçüm bir tarihtir, kanun değil. Bir ölçüme
    dayanan kuralın yanına **neyin ölçüldüğü** yazılır, ve o mekanizmaya
    dokunan her değişiklikte yeniden ölçülür.

43. **`Number('')` ve `Number(null)` SIFIRDIR, ve sıfır çoğu aralıkta
    geçerlidir.** `normalizeDockHeight`'ın ilk hâli `Number.isFinite(n)`
    diyordu; tercihi hiç olmayan makinede `localStorage.getItem` `null`
    döndü, `Number(null)` 0 oldu, sonlu sayıldı ve **tabana kırpıldı** — yani
    havuz ilk açılışta ezik geliyordu. "Yok"u "sıfır"dan elle ayırmak
    gerekir. Test önce yazıldığı için yakalandı; `readScale` de yıllardır
    aynı hataya açıktı, orada `SCALE_MIN` tesadüfen makul olduğu için
    görünmemişti.

44. **Bir `normalize()` iki yönden çağrılıyorsa iki TİP alır.** Aynı
    fonksiyona depodan **string**, sürükleyiciden **number** geliyordu; 43'ü
    kapatan `typeof raw !== 'string'` guard'ı sayıyı da eledi ve her sürükleme
    varsayılan olarak yazıldı — çekmece kıpırdıyor ama unutuyordu. Test yalnız
    string yolunu deniyordu, o yüzden yeşil geçti. Kural: bir normalize
    fonksiyonunun testi **her çağıranın verdiği tipi** denemeli.

45. **Bir custom property'nin İKİ sahibi varsa yakın olan kazanır ve uzaktaki
    yazma sessizce hiçbir şey yapmaz.** `--dock-h` hem `.pool`'a React inline
    style'ıyla hem `.program-body`'ye splitter tarafından yazılıyordu. Sürükleme
    DOM'a yazıyordu, `.pool`'daki daha yakın tanım kazanıyordu, ve ekranda
    hiçbir şey olmuyordu — hata mesajı yok, konsol temiz. Türetilen bir
    değişkenin **tek** bir sahibi olur.

46. **`pointerup`'ta `hasPointerCapture` false olabilir.** Sürüklemenin sonunu
    ona bağlarsan hareket biter ama **commit hiç çalışmaz**: çekmece yeni
    boyunda durur, tercih yazılmaz, ve yenilemede eski boya döner. Jestin
    açık/kapalı olduğunu kendi bayrağınla bil; capture'ı yalnız serbest
    bırakırken sor.

47. **`margin` ile araya sıkıştırılan bir tutamağın alt yarısını komşusu
    yer.** Havuzun kulpu 9px'ti ama `margin-bottom: -4px` ile `.pool-head`'in
    altına giriyordu: `elementFromPoint` üst 4px'te kulpu, alt 5px'te başlığı
    buluyordu, yani fare tam ortasına indiğinde **hiçbir olay gelmiyordu**.
    Görünmez bir hata: element oradaydı, `pointer-events` açıktı, testte
    `boundingBox()` doğru kutuyu veriyordu. Bir tutamak **kendi satırını**
    alır. İkinci yarısı: kulp görünür bir **tutamak işareti** taşımalı — iki
    yüzey arasındaki kılcal çizgi kenarlık gibi okunur, ve kenarlıklar
    kıpırdamaz.

48. **Küçülen bir flex kutusunun içindeki öğeler küçülmüyorsa, kutudan
    TAŞARLAR — ve taşan şey tıklanamaz olur.** Üst çubuğa durum çipi
    eklenince `.tabstrip` (`flex: 0 1 auto`) daralmaya başladı, ama `.tab`'ler
    `0 0`. Ölçülen: %150 ölçekte şerit 693px'te bitiyor, Ayarlar sekmesi
    823px'te — yani çipin altında, ve yalnızca oraya denk gelen bir imleçle
    tıklanabilir. Testte "timeout" olarak göründü, "gizli" olarak değil.
    Kural: bir çubuğun **neyin sırayla feda edileceği** yazılır. Burada:
    önce boşluk, sonra çipin cümlesi (noktası asla — ekran meşgulken yok olan
    bir durum güvenilmeyen bir durumdur), sonra belge adı. Sekmeler hiç.

49. **Yeni bir düğmenin adı, var olan bir sekmenin adıyla başlıyorsa süitin
    yarısı kırılır.** "Programı boşalt" 27 yerde `getByRole('button', { name:
    'Program' })`'ı ikiye çıkardı; durum çipinin cümlesi "…havuzda" ve
    başlığı "Kontrol sekmesini açar" olduğu için `name: 'Havuz'` ve
    `name: 'Kontrol'` sorgularını da. İki karşı önlem, ikisi de gerekli:
    kısa ve genel adlar `exact: true` ile aranır, ve metni değişken olan bir
    kontrole kendi `aria-label`'i verilir — `title` bir **ada** dönüşür, ve o
    ad üç piksel ötedeki sekmenin adı olabilir.

50. **Bir tablo için ölçülmüş bir gerekçe, başka bir tabloya TAŞINMAZ.**
    Müsaitlikte saatleri gizleyen ayarın gerekçesini "saat sütunun genişliğini
    belirler" diye yazdım — tuzak 37'nin Program ızgarasındaki hikâyesini
    olduğu gibi taşıyarak. Ölçüldü: yanlış. `table.availability`
    `table-layout: fixed` + `width: 100%`, yani sütunlar içindekinden bağımsız
    eşit; tablo saatliyken de saatsizken de **1341,7 × 354,2 px**. Gerçek
    gerekçe kullanıcının verdiği gerekçeydi (bakmak istemiyor), ve testin
    ölçtüğü şey artık "hiçbir şey değişmedi".

51. **`settledText()`'in ölçütü "bir şey yazıldı"dır ve BOŞ DURUM bir şeydir.**
    `openWithSample` ızgarayı bekliyordu ama depoyu değil; arada 400 ms var ve
    o pencerede depodaki en yeni kayıt sayfanın kendi **boş** yazımı.
    Bir testin "önceki hâl"i böylece boş durum oluyor ve örnekle
    karşılaştırılıyordu. Tuzak 24'ün bir üst katmanı; çare yardımcının
    kendisinde: örnek yüklendikten sonra depoda **okulun adını** beklemek.
    Bir "yazıldı mı" bekleyicisi, **ne** yazıldığını sormalı.

    **2026-08-26: aynı hata ikinci yardımcıda duruyordu.** `loadWorld` düzeltilmemişti;
    `open()` 400 ms'i aştığı her koşuda `before` boş proje oluyor, `savedState`
    ilk değişiklik olarak **dünyanın yüklenmesini** görüyor ve 20 dünya testi
    dizimden ÖNCEKİ ızgarayı yargılıyordu. Bir tuzağı bir yerde kapatmak onu
    kapatmaz — **aynı deseni kullanan her yer aranır.** Yakalayan şey tuzak
    23'ün karşı önlemiydi: "kaydedilen yerleşim sayısı girişten büyük olmalı".

52. **Bir custom property'nin KAPSAMI sözleşmesinin parçasıdır.** `--sec` yalnız
    `.topbar` ve `.ribbon` üstünde tanımlıydı; `.panel > h2::before` ve
    `.chip[aria-pressed]` ise `.main` içinde yaşıyor, yani ikisi de doğdukları
    günden beri `var(--sec, var(--accent))`'in **fallback'ini** çiziyordu. Kural
    çalışıyordu, renk yanlıştı, ve kuralın üstündeki yorum "bölüm rengini kısa
    bir çizgi olarak taşır" diyordu. Hiçbir test görmedi çünkü bir şey çizmemek
    değil, **yanlış şeyi** çizmekti. Tuzak 45'in aynası: orada iki sahip vardı,
    burada hiç. `var(--x, …)` yazan her yerde soru şudur: *x buraya ulaşıyor mu?*

53. **Yeni bir görsel katman, var olan bir sınıfa yeni bir DEĞER değil yeni bir
    AD ister.** Sürüklerken hedef satırın tamamını boyayan zayıf katman
    `drop-ok`'u yeniden kullansaydı, `program.spec.ts`'in "iki saatlik blok tam
    2 hücre yakar" sayımı 40 bulurdu — ve test "renk yanlış" değil "sayı
    yanlış" diye kırılırdı, yani okuyan kişiyi çözücüye yollardı. Ayrı ad
    (`can-ok` / `can-warn` / `can-no`) hem sayımı hem ayraç testinin
    `not.toHaveClass(/drop-/)` iddiasını olduğu gibi bırakır.

54. **Bir kaydırma kutusuna verilen `mask-image` kendi `position: sticky`
    çocuklarını kırpar.** Sündürme `.main`'e uygulanabilir çünkü yapışkan
    çocuğu yok; `.grid-wrap`'e uygulanamaz çünkü saat başlığı ve öğretmen
    sütunu tam da tuttukları kenarda erirdi. Izgara bu yüzden gölgeyle
    (`scrolled-y` / `scrolled-x`) konuşur, maskeyle değil. Aynı iddia iki
    teknikle söylenir; hangisinin nereye ait olduğu **elemanın içinde ne
    olduğuna** bağlıdır.

55. **`startViewTransition` yakaladığı öğeyi bir ANLIK GÖRÜNTÜYLE değiştirir ve
    anlık görüntü tıklanamaz.** Sekme geçişi bununla sarılınca ölçülen:
    `document.elementFromPoint` ızgaranın üstünde **553 ms boyunca** hücre
    değil `<html>` döndürdü. `drag.ts` hedefini tam o çağrıyla buluyor — yani
    geçişten sonraki yarım saniyede kapılan bir kart **hiçbir yere düşmüyordu**,
    hata yok, uyarı yok. Ekranda her şey doğru görünüyordu. API'nin tek eşsiz
    getirisi paylaşımlı öğe geçişidir; ortada olan şey bir çapraz geçişse
    (`<main>`'e `key={tab}` + `@starting-style`) bedeli ödemeye gerek yok.
    Ölçüldükten sonra: 553 ms → **68 ms**. `motion`'ı rafta bırakan aynı akıl
    yürütme — kullanmadığın şeye ödeme.

56. **Erişilebilir adı iki test katmanı iki türlü hesaplarsa ikisi ayrışır.**
    jsdom duman testinin `buttonName()`'i önce `textContent`'e, sonra
    `aria-label`'a bakıyordu; Playwright'ın `getByRole(name:)` ise spesifikasyona
    uyup **`aria-label`'ı üstün** tutuyor. İkisi de doğruydu — hiçbir düğmede
    ikisi birden olmadığı sürece. Görünüm düğmesi simgesinin yanına metin
    alınca ayrıştılar: E2E "Sınıf görünümü"nü buluyordu, duman testi yalnız
    "Sınıf"ı görüyordu. Bir kontrolün **adı** hakkında iki katmanın
    anlaşamaması, ikisinden birinin yanılmasından beterdir.

57. **Sıfır SÜRE, sıfır MESAFE demek değildir.** "Bütün hareket tek yerden
    kapanıyor" iki yıl boyunca doğru sanıldı ve yarısı doğruydu: her `transition`
    `--dur`'ü okuyordu, ama her **mesafe** kendi kuralında elle yazılıydı
    (`translateY(.5rem)`, `translateX(100%)`, `scale(.96)`, `translateY(1px)`).
    0 ms'lik bir geçiş bir hareketi durdurmaz — öğeyi **ışınlar**. Kapatılmak
    istenen şey tam olarak buydu. Çare mesafeleri de tokenlemek: `--slide` ·
    `--sweep` · `--press` · `--pop`. Kural: bir kuralda hareket eden bir sayı
    elle yazılıysa o hareketin kapatma düğmesi yoktur.

58. **Bir tercihi hem makine hem kullanıcı veriyorsa hangisinin KAZANDIĞI
    yazılır.** Hareket ayarı `prefers-reduced-motion`'ı ezseydi, işletim
    sisteminde "azalt" demiş biri bu programda hareketi geri almış olurdu — ve
    o kişi bunu bir daha hiç aramazdı. Karar: **makine bir TABAN.** Ayar
    tabanın ötesine geçebilir, gerisine değil, ve bu CSS'te bir sıra meselesi:
    `@media (prefers-reduced-motion: reduce)` bloğu `[data-motion]`
    kurallarından **sonra** ve eşit özgüllükte durur. Öbür yarısı ilk okuma:
    kayıt yoksa tercih **sistemden** türetilir, yoksa hiçbir şeyin kıpırdamadığı
    bir makinede düğmede "Tam" yazar ve arayüz yalan söyler.

59. **Bir görüntü ALIRKEN sayfanın hareketi bitmiş olmalı.** `npm run ekran`
    hiçbir şey iddia etmediği için hiçbir şey de koruyamaz — tek işi bakılacak
    bir kanıt üretmek. Her sekme ve her bölüm `@starting-style`'dan soluyor,
    yani bir hedefe *varılır varılmaz* alınan görüntü solmanın ortasını
    yakalıyor: `dark-12-ayarlar-gorunum.png` **bomboş** çıktı, açık ikizi yarı
    saydam. Hiçbir test bunu söyleyemezdi. Çare `document.getAnimations()`
    bitene kadar beklemek — sabit bir `waitForTimeout` değil, çünkü süre artık
    bir **ayar**. Ve gerçek ders: kanıt üreten bir katmana da bakılır.

    **Aynısı ÖLÇÜM için de geçerli ve bir saate mal oldu (2026-08-29).** Sekme
    geçişi paneli `translateY(var(--slide))` = 7 px aşağıdan soluyor, yani
    boyama bitmeden okunan bir `getBoundingClientRect` paneli rayın 5 px
    altında gösteriyor — ve o 5 px, kaydırmaması gereken bir rayın kaydırdığı
    gibi okunuyor. Bir düzen ölçen her testin ilk satırı `getAnimations()`
    beklemek.

60. **"Orta noktayı geçtim mi" bir sürükleme hedefi seçmez — tam ortaya
    bırakmak SIK bir koordinattır.** Satır sıralamasının ilk hâli hedefi
    "hangi orta noktaları geçtim" ile buluyordu; `y > middle` tam eşitlikte
    yanlış olduğu için satırın tam üstüne bırakmak onu **bir sıra eksiğe**
    koyuyordu. Ve bu nadir bir koordinat değil: bir satırı bir başkasının
    üstüne bırakmak bu işi yapmanın normal yolu. Paralel E2E koşusunda
    alt-piksel farkları sınırın iki yanına düştüğü için hata bir **flake**
    olarak göründü — bulunması iki kat pahalı. Doğrusu **kapsama**: imlecin
    ÜSTÜNDE olduğu satırın indisi. Kural: bir jestin hedefi, eşitlikte ne
    olacağı yazılmadan seçilmez.

61. **`width: 100%` bir tablo, sığmayan sütunun odasını KÜÇÜLEBİLEN sütundan
    alır — ve o sütun genellikle metnin kendisidir.** Öğretmen listesine iki
    sütun (tutamak + cinsiyet) eklenince %150 ölçekte ad kutusu 232px'ten
    **26px**'e indi, branş kutusu hiçbir şey göstermez oldu. Hiçbir test
    görmedi: her kontrol vardı, değeri doğruydu, yalnız **görünmüyordu** —
    tuzak 33'ün ta kendisi. İki yarısı var, ikisi de gerekli:
    (a) geniş içerik **kendi kutusunda** kayar (`.table-scroll`), (b)
    `min-width: max-content` ancak hücrelerin bir içerik genişliği VARSA bir
    şey ifade eder — `width: 100%` bir kontrol max-content'e **sıfır** katkı
    yapar, yani tabanlar kontrole `ch` cinsinden verilir (tuzak 34).
    Ölçülen sonuç: %150'de ad **283px**, sayfa yatay taşması **0**.

62. **Bir JSX yorumu `{cond && (` ile `<div>` arasına konamaz.** Oraya yazılan
    `{/* … */}` bir yorum değil, ifadenin ilk terimi olarak okunan bir **nesne
    literali**dir; derleme kırılır. Kırıldığı hâlde `npm run build >/dev/null
    2>&1 && npx playwright test …` zinciri sessiz kaldı ve testler bir ÖNCEKİ
    `dist/index.html`'i ölçmeye devam etti — üç ölçüm turu boyunca "değişiklik
    hiçbir şeye yaramıyor" diye okundu. İki ders: yorum koşulun **dışına**
    yazılır, ve bir derlemenin çıktısı susturuluyorsa **çıkış kodu** okunur.

63. **`:root`'ta tanımlanan bir custom property'nin içindeki `var()` ORADA
    çözülür.** Kâğıttaki yazı boyutu için `--fs-p-xl: calc(17pt *
    var(--p-type))` yazıldı, `--p-type` de `:root`'ta 1'di, ve `.print-area`
    üstünde `--p-fit`/`--p-zoom` ezildi. Hiçbir şey olmadı: `--fs-p-xl`
    `:root` üstünde hesaplanırken `:root`'un çarpanını okur, ve alt öğeler
    **bitmiş sayıyı** miras alır. Aşağıdaki yazma okunmayan bir yazmadır —
    tuzak 52'nin aynası (orada değişken oraya *ulaşmıyordu*, burada değer
    çoktan *pişmişti*). Görülme biçimi de öğretici: hiçbir hata yok, hiçbir
    test kırmızı değil, yalnız dokuz farklı ayarda başlık **22,7 px**.
    Kural: türetilmiş bir merdiven, **türediği çarpanla aynı öğede** tanımlanır.

64. **Bir düzen kusurunu ölçerken hangi KUTUNUN taştığına bakılır.**
    "Sayfada ne olsun"un satırları panelden taşıyor sanıldı; test satırın sağ
    kenarını panelinkiyle karşılaştırdı ve **bozuk derlemede yeşil geçti**.
    Taşan şey kapsayıcı değildi: `white-space: nowrap` bir flex öğesini
    büyütmüyor, öğenin **kendi metnini kırpıyor**du (`scrollWidth >
    clientWidth`). Ölçülen: `"Derslik ve branş — Ayn…"`. Bir kırpılma testi
    öğenin kendi `scrollWidth`'ine bakar; komşusuna bakan test, bakması
    gereken şeyi hiç görmez. Tuzak 41'in ("boş ızgarada yapılan ölçüm hiçbir
    şey ölçmez") kardeşi: **yanlış kutuya bakan ölçüm de hiçbir şey ölçmez.**

65. **"Güvenli bağlam" ile "gerçek köken" aynı şey DEĞİLDİR, ve bu tuzağın
    kaydı benim ona düşmemdir.** Bir turun bütün gerekçesini "`file://`
    güvenli bağlam değildir, orada Dosya Sistemi Erişimi API'si yoktur" diye
    yazdım — dört dosyaya, üç commit mesajına ve iki belgeye. Chromium'da
    **ikisi de yanlış**: `isSecureContext` true, `showDirectoryPicker` bir
    fonksiyon. `file://`'ın eksiği bir **köken**: OPFS `SecurityError`,
    service worker `TypeError`, ve `location.origin` makinedeki her yerel
    sayfayla ortak olan `"file://"`.
    Yakalayan şey bir test değil, bir **ekran görüntüsü** oldu: "API burada
    yok" durumunun resmini almaya çalıştım ve resimde "Klasör seç…" düğmesi
    çıktı. Üç ders. (a) Bir platform iddiası **ölçülmeden** yazılmaz — hele
    bir turun gerekçesiyse. (b) Özellik varlığı `in window` ile **tespit
    edilir**, teslim yoluna göre **varsayılmaz**. (c) Düzeltme bir cümle değil
    bir **test** olur (`temel.spec.ts` 75) — yoksa aynı yanlış altı ay sonra
    geri yazılır.

66. **Tek geri döngüye bağlanan bir sunucu, bazı makinelerde SESSİZCE
    bulunamaz.** Chrome `*.localhost`'u kendi çözer ve `127.0.0.1` ile `::1`'in
    **ikisine birden** çözüp yarıştırır. Bu makinede `dersprogrami.localhost`
    → `::1` çıktı; yalnız IPv4'e bağlanmış bir sunucu burada çalışır, orada
    çalışmaz, ve arada hiçbir log yoktur — tarayıcının hata sayfası vardır.
    `sunucu.mjs` iki `http.Server` açıyor, `sunucu.ps1` iki `TcpListener`.
    IPv6'sı kapalı bir makinede `::1` bağlanamaz ve bu bir hata değildir:
    öteki ayaktaysa devam edilir.

67. **Structured clone FONKSİYON klonlayamaz — yani elle yazılmış bir sahte
    tutamak IndexedDB'ye hiç girmez.** `klasor.spec.ts`'in ilk hâli
    `getFileHandle`/`keys`/`removeEntry`'yi düz bir nesneye koyuyordu; iki test
    kırmızı çıktı ve sebebi asıl dersti: "klasör yeniden açılınca hatırlanıyor"
    testi, **hatırlanması imkânsız** bir şeyi ölçüyordu. Çare sahteyi
    büyütmek değil, **küçültmek**: gerçek bir `FileSystemDirectoryHandle`
    alınır (OPFS, `navigator.storage.getDirectory()`) ve yalnız
    **sürülemeyen** parça sahtelenir — `showDirectoryPicker`. Geri kalan her
    şey tarayıcının kendisi olur: gerçek yazma, gerçek `keys()`, gerçek
    structured clone, gerçek IndexedDB. İzin kapısı **prototipe** yamanır,
    çünkü örneğe konan bir alan onu yeniden klonlanamaz yapardı.

68. **`addInitScript` HER yüklemede koşar; oraya konan bir "varsayılanı yaz"
    satırı, testin reload'dan önce kurduğu durumu geri alır.** İzin testi
    `localStorage['__izin']`'i `prompt` yapıp sayfayı yeniliyordu; init betiği
    de her yüklemede onu `granted`'a geri yazıyordu. Test, ölçmek istediği
    durumu **kendi eliyle siliyordu** ve bunu bir zaman aşımı olarak gösterdi.
    Kural: bir init betiği durumu **tohumlar** (yoksa yazar), **dayatmaz**.

69. **Bir yapı ürününün REÇETESİ yoksa, içindeki her karar donar.**
    `src/fonts/IBMPlexSans-subset.woff2` aylarca 23 KB'lik bir **eser**di:
    kimse nasıl üretildiğini bilmiyordu, o yüzden ağırlık ekseninin 400–600'de
    kırpılı olması TASKS'te *"fontTools kurulu değil"* gerekçesiyle bir madde
    olarak duruyordu. Gerekçe doğruydu ve yeterliydi — yeniden üretilemeyen
    bir dosyada değiştirilemeyen bir karar vardır. `scripts/font.mjs`
    yazıldıktan sonra aynı iş **dört dakika** sürdü, ve yanında beklenmedik
    bir kazanç geldi: reçete olunca eksen seçenekleri **ölçülebilir** oldu
    (`400:700` +1 060 bayt · `350:700` +7 880 · `300:700` +8 600), ve
    kullanılmayan yarısı ölçüyle reddedildi. Kaynak yüz depoya kondu
    (`scripts/font-source/`, OFL 1.1): 122 KB, karşılığında reçete çevrimdışı
    ve sonsuza kadar tekrarlanabilir. Kural: bir derleme çıktısı
    commit'leniyorsa **onu üreten betik de commit'lenir**.

70. **Değişken bir font, aralık dışı ağırlığı KIRPAR — hata vermez.**
    `styles.css` beş kuralda `font-weight: 700` istiyordu; yüz 400–600'de
    kırpılıydı ve beşi de sessizce **600 çiziyordu**. Üçü kâğıttaydı, yani
    hedef kullanıcının en çok ihtiyaç duyduğu yerde. Hiçbir test göremezdi ve
    görmesi mümkün de değildi: "600 istendi" ile "700 istendi ve reddedildi"
    **birebir aynı pikselleri** üretir. Ölçüm şuydu — `'0'` glifinin 600 ile
    700 arasındaki nokta farkı eski yüzde **0.0**, yenisinde **406.5**;
    tarayıcıda `'Haftalık ders programı'` eski yüzde `600=1042 700=1042`.
    Genel hâli tuzak 33'ün ailesinden: **bir CSS değeri yazmak, o değerin
    karşılığının var olduğu anlamına gelmez.** Yeni bir eksen, yeni bir
    `font-feature-settings` ya da `font-variation-settings` yazıldığında
    sorulacak soru "yüz bunu verebiliyor mu"dur, ve cevabı **ölçülür**
    (`temel.spec.ts` 46).

71. **`toHaveProperty` noktayı YOL AYRACI okur, ve dosya adları nokta taşır.**
    `expect(disk).toHaveProperty('ders-programi-tumu.json')` çalışan bir
    özelliğin üstünde kırmızı verdi, çünkü `['ders-programi-tumu']['json']`
    aradı. Hata mesajı diskin tamamını basıyordu — yani aranan dosya **ekranda
    duruyordu** ve iddia yine de düşüyordu; bu, bir düzen hatasından daha kafa
    karıştırıcı, çünkü kanıt "kod bozuk" değil "test yalan söylüyor" diyordu.
    Bir anahtarın **varlığını** sormanın yolu `Object.keys(...)` +
    `toContain`. Nokta içeren hiçbir anahtar `toHaveProperty` ile sorulamaz.

72. **Depoda "programın kendisi" gibi görünen İKİ yem var, ve ikisi de
    SESSİZCE başarısız oluyordu.** Kök `index.html` Vite'ın şablonu: çift
    tıklanınca modülü `file:///C:/src/main.tsx`'e çözülür, CORS'a takılır ve
    geriye **bomboş beyaz bir sayfa** kalır — hata yok, uyarı yok, konsolu
    açmayan biri için hiçbir ipucu yok. "Açılmıyor" diye okunan şey tam
    olarak budur. `kurulum/Kur.cmd` de kurulumun **kaynağı**dır ve paketin
    `site/`'siz hâline birebir benzer; eski mesajı "ZIP'i açmadan
    çalıştırmış olabilirsiniz" diyerek okuyanı hiç indirilmemiş bir ZIP'i
    aramaya yolluyordu — yani yanlış teşhis, teşhissizlikten beter.
    İkisi de artık kendini söylüyor: şablon `file://` altında nereye
    bakılacağını yazar, `kur.ps1` depo kaynağını paketten ayırıp
    `npm run paket` der. Uyarının derlenmiş dosyada **çalışamaz** olması bir
    umut değil bir ölçüm: singlefile `src`'yi kaldırıp kodu gömüyor, yani
    `script[type="module"][src]` orada null dönüyor — `temel.spec.ts` 77
    ikisini de ölçer. Genel kural: bir depoda **teslim edilen dosyanın
    ikizi** duruyorsa, o ikiz çalıştırıldığında ne olacağı yazılır. Sessiz
    bir boş ekran, bir hata mesajından pahalıdır.

73. **Sabit bir service worker önbellek adı, güncellemeyi bir açılış
    geciktirir — ve bunu hiçbir yerde söylemez.** `site/sw.js` iki sürüm
    boyunca `CACHE = 'ders-programi-v1'` yazıyordu. Tarayıcı `sw.js`'i **bayt
    bayt** karşılaştırır; dosya değişmediği için `install` bir daha hiç
    koşmadı, `addAll(SHELL)` kabuğu bir daha hiç indirmedi, ve yeni sürüm
    yalnızca `fetch` işleyicisinin arka plan tazelemesiyle geldi — yani baba
    programı açıyor, **eskisini** görüyor; kapatıp yeniden açıyor, yenisi
    geliyor. Ekranda hata yok, konsol temiz, ve "düzelttim, dener misin"in
    cevabı **her seferinde yanlış**. Çare adın derlemeyle birlikte
    kıpırdaması (`scripts/surum.mjs` → `vite.site.config.ts`'in
    `stampServiceWorker`'ı). Genel kural: **bir önbelleğin adı, önbelleğin
    içindekinin sürümüdür.** Sabit yazılmış her önbellek adı, eski bir kopyayı
    süresiz servis etme iznidir.

74. **Bir düğmenin adı bir sekmenin adını İÇERİYORSA da süit kırılır — tuzak
    49 yalnız "başlıyorsa" değil.** Klasör uyarı şeridine `Ayarlar → Veri`
    adında bir düğme kondu; `getByRole(name:)` **alt dize** eşler ve
    **büyük/küçük harf ayırmaz**, yani o düğme `name: 'Ayarlar'` sorgusuna da
    cevap verdi ve klasör süitinin yardımcısı strict-mode ihlaliyle düştü.
    Aynı gün aynı hata bir **panel başlığında** tekrar etti: `.panel`,
    `{ hasText: 'Bu program' }` ile arandı ve bir sütun ötedeki panel
    *"Tarayıcının **bu program** için ayırdığı yer"* dediği için o bulundu —
    test yanlış panelin içeriğini basarak kırmızıya döndü. İki sonucu var:
    kısa adlar `exact: true` ile aranır, ve **bir panel kendi başlığıyla
    (`has: getByRole('heading')`) kapsanır**, metniyle değil. "Ayarlar"ın
    hiçbir çekimi (`ayarlarına`, `Ayarlar →`) bir düğme adına giremez.

75. **Izgara blok SINIRI saklamaz; eşit olmayan bloklarda bir koşu birden çok
    türlü okunur.** `placements` saat başına bir `lessonId` tutuyor, blok
    başlangıcı diye bir kayıt hiç olmadı — tek blok boyu varken gerek de yoktu:
    koşuyu eşit parçalara bölmek tek cevabı veriyordu. `2+1` ile vermiyor. Aynı
    dersin üç bitişik hücresi hem `[2,1]` hem `[1,2]`dir ve ızgarada ikisini
    ayıran hiçbir işaret yok. Çare şemayı büyütmek **değil**, bir **sözleşme**
    yazıp her yeri ona uydurmak: `placedBlocks()` gün/saat sırasıyla gezer, her
    koşuda önce uzun blokları alır (dersin `blocks` listesi büyükten küçüğe
    tükenene kadar), kalanı tek sayar. Hangi okumanın seçildiği bir programı **yanlış yapamaz** — her kısıt
    saate ve koşuya bakar, sınıra değil — ama sağ tıkın kaç hücre aldığına ve
    havuzun hangi kartları borçlu olduğuna karar verir, ve o **tek** cevap
    olmalı. Bu fonksiyonu çağırmayan her yer sessizce sapar: `continues`
    komşulukla hesaplandığı sürece bitişik `2+1` ekranda **tek** blok gibi
    çizilir, ve `illegalBlocks()` bloğun boyunu geçirmezse ikinci saati kapalı
    olan bir ikiliyi hiç görmez.

76. **Bir parametreyi araya sıkıştırmak, sondan eklemekten pahalıdır — hele
    ikisi de sayıysa.** `blocker(d, ix, lessonId, day, hour)`'a blok boyu
    gerekti; `day`'in yanına konsaydı üç sayı yan yana gelecek ve sessizce takas
    edilebilecekti. Sondan **isteğe bağlı** eklendi (`size?`), ve verilmediğinde
    "dersin bekleyen ilk bloğu" demek — sürükleme dışındaki her çağıranın zaten
    istediği şey. Yüzlerce çağrı yeri (testler dâhil) olduğu gibi derlendi.
    İstisna `occupy`/`vacate`: orada boy **zorunlu**, çünkü onlar aramanın iç
    döngüsü ve yanlış bir boy bir bırakmayı reddetmek yerine dizini sessizce
    bozar.

77. **"Tek kaynak" diye YAZILMIŞ bir kural, onu doğrulayan bir test yoksa bir
    dilektir.** Bu belge iki sürüm boyunca *"Sürüm numarasının TEK kaynağı
    `package.json`"* diyordu ve cümle yanlıştı: numara üç dosyada duruyordu
    (`package.json` · `src-tauri/Cargo.toml` · `src-tauri/tauri.conf.json`) ve
    `scripts/yayinla.mjs` yalnız birincisini yazıyordu. Yani her sürümden sonra
    öteki ikisi bir sürüm geride kalıyordu ve hiçbir yerde hiçbir şey
    kızarmıyordu. Kozmetikti — **exe kendini güncellemeyi öğrenene kadar.**
    Exe'nin Release'e gönderdiği numara derlendiği numaradır; geride kalmış bir
    numara ya var olan bir güncellemeyi hiç önermez ya da kurulduktan sonra da
    önermeye devam eder. İkisi de "güncelleme bozuk" gibi görünür ve ikisi de
    bir derleme dosyasındaki sürüm satırını göstermez. Çare üç katlı:
    `tauri.conf.json` artık `"version": "../package.json"` (Tauri yolu kendisi
    çözer, üçüncü kopya yok), `yayinla.mjs` `Cargo.toml`'u da yazar, ve
    `src/surum.test.ts` ikisinin aynı şeyi söylediğini **her koşuda** ölçer.
    Genel kural: bir belge cümlesi "tek", "her zaman" ya da "asla" diyorsa,
    yanında onu ölçen bir test yoksa o cümle bir niyet beyanıdır.

78. **Bir `.ico`'da OLMAYAN boy sessizce ölçeklenir, ve sonuç "bozuk" değil
    "biraz bulanık" görünür.** Görev çubuğundaki işaret için tek şikayet
    *"eksik pxli küçük logo"* idi, ve kodda hiçbir şey yanlış değildi: dosyada
    16·32·48·64·128·256 vardı, Windows ise %125 ölçekte **40**, küçük görev
    çubuğu düğmelerinde **24** istiyor. İstenen boy yoksa Windows en yakınını
    büyütür. Yani hata bir kod yolunda değil, bir **dosyanın içindekinde**ydi,
    ve hiçbir test bir dosyanın içindekine bakmıyordu. İkinci yarısı aynı
    ailedendi: eşik `< 48 sade` yazılıydı, yani görev çubuğunun yuvasına
    **sade** çizim düşüyordu ve o çizim gerçek logonun yanında bir yer tutucu
    gibi okunuyor. Eşik uydurulmadı, **bakılarak** bulundu
    (`scripts/ikon-karsilastir.mjs`) ve 32'ye indirildi.

    **VE ŞİKAYET GERİ GELDİ — asıl tuzak burada.** Eşiği 32'ye indirmek
    pikselleri doğru okumuştu ama yanında ölçülmemiş bir cümle taşıyordu:
    *"görev çubuğu 32 px'lik bir yuvadır"*. Windows 11 %100 ölçekte **24**
    istiyor, 32 değil — yani düzeltmenin kendisi, düzeltmeye çalıştığı boyu
    eşiğin **bir basamak altında** bırakmıştı. Görülme biçimi de aynı: hiçbir
    test kırmızı değil, `temel.spec.ts` 79 dosyayla betiği karşılaştırıyor ve
    ikisi de anlaşıyor, çünkü ölçtükleri şey eşiğin **tutarlılığı**, eşiğin
    **doğruluğu** değil. Eşik 20'ye indi; yalnız 16 sade kaldı, çünkü orada
    ayrıntılı çizim daha kötü bir logo değil, **logo değil**. Artık bir
    görev çubuğunun isteyebileceği hiçbir boy sade tarafta değil, yani cevap
    "Windows hangi boyu seçiyor" tahminine **dayanmıyor**.

    Genel hâli: bir eşiği ölçmek, eşiğin **hangi tarafında ne olduğunu**
    ölçmektir; bir platformun o eşikten ne isteyeceği **ikinci** bir ölçümdür
    ve tuzak 65 tam olarak bunun için yazılmıştı. Bir ölçümün yanına yazılan
    ölçülmemiş cümle, ölçümü de götürür.

79. **Bir devriyenin maliyeti tıklama sayısı değil, ZAMAN AŞIMLARININ
    TOPLAMIDIR.** İlk `npm run patrol` üç dakikada **hiçbir sekmeye
    uğramadan** düştü. Sebep bir hata değildi: Playwright'ın varsayılan
    tıklama zaman aşımı 5 sn, `expect` 5 sn, ve gezinme başarısız tıklamayı
    zaten `.catch()` ile yutuyordu — yani her "olmadı" tam beş saniyeye mal
    oluyordu ve altmış adım üç yüz saniye ediyordu. Bir devriye **hiçbir şeyi
    beklemez**: bir kontrol 1,5 saniyede hazır değilse ya kapalıdır ya
    örtülüdür, ve ikisi de bir cevaptır. Üç karşı önlem birden gerekti: kısa
    tıklama süresi, `expect` süresini de kısmak (her tıklamadan sonra
    koşuyor), ve bir **duvar saati bütçesi** — yoksa takılan tek bir kontrol
    hiçbir şey basmadan bütün koşuyu yiyor. Yanına ikinci bir tuzak:
    `window.print()` kendisini çağıran tıklamayı diyalog kapanana kadar
    bloklar, ve orada kapatacak kimse yok. Devriyede o çağrı boşa alınır;
    yazdırmanın kendisini ölçen yer `yazdir.spec.ts`.

80. **Karakter üstünden yapılan bir toplu değiştirme YORUMLARI da bulur.**
    Metin turunda `constraints.test.ts`'te ` — ` → ` · ` çalıştırıldı ve
    dosyadaki İngilizce yorumlar da değişti — `"One rule decides · doubles
    first"` gibi, hiçbir şey kırmadan, hiçbir testi kızartmadan, ve ancak
    `git diff` okunduğunda görülerek. Kullanıcıya görünen metin bir
    **karakter** değil bir **rol**: bir toplu değiştirme o rolü hedeflemeli
    (JSX metni, string sabiti, iddia edilen cümle), gördüğü karakteri değil.
    Bu turda çare, iddia edilen cümlelerin tam metnini tek tek yazmak oldu; ve
    kararın kendisi bir teste taşındı (`metin.spec.ts`), çünkü ölçtüğü şey
    kaynak değil `document.body.innerText` — yani yorumlara hiç bakmıyor.

81. **Bir rengi ÖLÇMEDEN önce hangi UZAYDA yazıldığına bak.** Kullanıcı "açık
    temada üstteki renk şeridi daha az görünüyor gibi" dedi; ölçtüm ve onu
    doğruladığını sandım — açık 2,15–2,78, koyu 6,50–8,35. Tablo makuldü,
    tutarlıydı, altı bölümde de aynı yöne bakıyordu, ve **tamamen yanlıştı**.
    `contrast()` `rgb()` ayrıştırıyor; şeridin altındaki boya
    `color-mix(in oklab, …)` ile yazılmış ve Chromium onu `oklab(0.899 …)`
    olarak döndürüyor. Ayrıştırıcı ilk üç sayıyı kanal sanıp **her iki temada
    da zemini siyah** okudu, yani ölçülen şey "koyu lacivert siyaha yakın mı"
    idi. Rengi boyayıp pikseli okuyunca (1×1 canvas + `getImageData`) tablo
    **tersine döndü**: açık 5,53–7,31, koyu 4,28–5,84 — yani şerit açık temada
    daha güçlü ve ortada düzeltilecek bir şey yok.
    Tuzak 65'in ailesinden ve ondan sinsi: orada bir platform iddiası
    ölçülmeden yazılmıştı, burada **ölçüm yapıldı ve yalan söyledi**. Kural:
    modern renk sözdizimi (`oklab`, `oklch`, `color-mix`, `color()`)
    `getComputedStyle`'dan **o hâliyle** çıkar; sayıya çevirecek her yol önce
    sRGB'ye getirmek zorundadır.

82. **Bir metni kaldırmak, ondan yükseklik alan KUTUYU da kaldırır.** Renk
    seçicinin genişliği CSS'te yazılıydı ama **yüksekliği** içindeki iki
    rakamın yaptığı satır kutusundan geliyordu. Kullanıcı "renklerin üzerinde
    sayılar olmasın" dedi, sayı kalktı, ve kutu 10 piksellik bir çubuğa
    döndü — bir kimlik rengi değil, bir adın altına çekilmiş çizgi.
    Hiçbir test göremezdi ve görmesi de gerekmezdi: düğme oradaydı, rengi
    doğruydu, `aria-pressed` doğruydu, tıklanıyordu. Yalnız bir renk gibi
    durmuyordu. Yakalayan şey `npm run ekran`'a **bakmak** oldu.
    Kural: bir öğeden metin çıkarırken o metnin **ne taşıdığı** sorulur —
    genişlik, yükseklik, hizalama taban çizgisi. Burada çare `height: 1lh`,
    yani kutunun eskiden bir karakterle çağırdığı satır kutusunu doğrudan
    istemesi.

83. **Hiçbir komutun okumadığı bir katılık, katılık değildir — ve onu okuyan
    tek yer editörün Sorunlar panelidir.** `tsconfig.json`'ın `include`'u iki
    yıl boyunca `["src", "vite.config.ts"]`'ti, yani `e2e/`'nin 35 dosyası,
    `vite.site.config.ts` ve beş Playwright config'i **hiçbir `tsc`
    koşusunda** yer almıyordu. Playwright tipleri kontrol etmez, derler; Vitest
    de öyle. Sonuç: `npm run kontrol` yeşil geçerken editörde **48 sorun**
    duruyordu, ve ikisi de doğruydu.
    Bir yarısı eksik bir bağımlılıktı: `@types/node` **kurulu değildi**, o
    yüzden her `node:fs`, `node:path` ve `Buffer` çözümsüzdü. Öteki yarısı
    gerçek hatalardı ve biri gerçek bir kusurdu: `patrol.spec.ts`
    `kapan.ts`'ten `Page` tipini alıyordu, `kapan.ts` onu **dışa aktarmıyordu**,
    ve o dosyada `page` bir hata tipine düştüğü için üç geri çağırım sessizce
    `any` olmuştu — yani devriyenin tip güvencesi hiç yoktu.
    Çare üç parça, ve üçüncüsü olmadan ilk ikisi bir yıl içinde geri gelirdi:
    `tsconfig.tools.json` (src dışındaki her şey, `types: ["node"]`, **aynı**
    katılık), `e2e/tsconfig.json` (tek satır — editör yalnız `tsconfig.json`
    adını arar, üstüne doğru yürüyerek), ve `npm run tipler`, `kontrol`'ün ilk
    adımı. `types`'ı ayırmanın sebebi kozmetik değil: kök config'e `node`
    eklemek e2e'yi denetlerdi ama bir bileşenin `process`'e uzanmasını da
    **inandırırdı**.
    Genel kural tuzak 77'nin kardeşi: orada belgedeki bir cümlenin testi yoktu,
    burada **kodun kendisinin** okuyucusu yoktu. Bir dosya hiçbir komut
    satırının açmadığı bir yerdeyse, oradaki `strict` bir dilektir.

84. **`z-index` STATİK konumlu bir kutuda hiçbir şey yapmaz — ve konumlanmış
    bir komşu, sayı ne derse desin onun üstüne boyar.** Havuz destesinin
    gömülü kartları `position: absolute; z-index: 1..2`, üstteki kart
    `z-index: 3` idi ve **statikti**, yani o 3 hiç okunmadı: aynı yığma
    bağlamında konumlanmış her kutu, konumlanmamış her kutunun üstüne çizilir.
    Sonuç, hata mesajı olmayan bir sınıf hatanın en sinsi hâliydi — kopyalar
    üstteki kartın birebir aynısı olduğu için **ekranda her şey doğru
    görünüyordu**, yalnız rozet yoktu. Ve rozet DOM'da vardı: kutusu vardı
    (20,2 × 15,8 px), `display: block`, `visibility: visible`, `opacity: 1`,
    hesaplanmış zemini `rgba(0,0,0,.17)`, ve `document.elementsFromPoint`
    merkezinde **onu birinci** döndürüyordu. Ölçülen her şey "oradayım"
    diyordu; ekran "değilim" diyordu, ve haklı olan ekrandı.
    İki yan ders, ikisi de bir saate mal oldu:
    (a) `locator.screenshot()` öğeyi görünür alana **kaydırır**, yani ondan
    önce alınmış bir `getBoundingClientRect` ile uyuşmaz; sabit gerçek,
    kırpmasız tam ekran görüntüsünden gelir — kırpma matematiği hata
    ayıklanacak ikinci bir şeydir.
    (b) `npm run build` çıkış kodu okunmadan bir mutasyon denendi, `tsc`
    kırıldı, ve test **eski `dist`'i** ölçüp yeşil geçti. Tuzak 62 tam olarak
    bu, ikinci kez.
    Genel kural: bir öğe "orada ama görünmüyor"sa, sorulacak ilk şey rengi
    değil **boyama sırası**dır, ve `z-index` yazan her yerde ikinci soru
    *"bu kutu konumlanmış mı?"*dır.

85. **`nth-child` ile sayılan bir sütun, satırlardan birine `colSpan` giren gün
    SESSİZCE yalan olur.** İmleç haçı sütununu `cell.cellIndex` ile buluyor ve
    öteki satırlarda `:nth-child(N)` ile arıyordu, ve bu her satırda saat başına
    bir `<td>` olduğu sürece **kesin** doğruydu. İki saatlik blok tek bir
    `<td colSpan={2}>` olunca doğru olmaktan çıktı: solunda birleşmiş blok olan
    bir satırda DOM hücresi sayısı haftanın saat sayısından az, `cellIndex` kısa
    çıkıyor, ve beam imlecin **soluna** düşüyor — solundaki her ikili için bir
    sütun. Ölçüldü: 7 hücre imlecin altında değil. Hiçbir şey fırlatmadı, hiçbir
    sayaç oynamadı, süit yeşil kaldı, ve kullanıcı *"önizleme artısı kaymış"*
    diye bildirdi.
    Bunu gören testin olmamasının sebebi de ayrı bir ders: haç testi **boş bir
    ızgarada** koşuyordu, yani ölçtüğü dünyada birleşmiş blok yoktu (tuzak 41).
    Çare bir sayı değil bir **kimlik**: `Grid.tsx` hem gövde hücrelerine hem
    saat başlıklarına `data-col` yazıyor, `gridChrome.ts` onu okuyor, ve
    birleşmiş hücre **kapsadığı** sütundan yakılıyor (tuzak 60'ın deseni).
    Başlığa `data-day` **konmadı**: `drag.ts` hedefini `closest('[data-day]')`
    ile buluyor ve cevap veren bir başlık tuzak 13'tür.
    Genel kural: bir **konum** DOM'daki sıradan sayılıyorsa, o sıranın
    değişmeyeceğine dair yazılı bir sözleşme olmalı — yoksa `colSpan`,
    `display: contents`, koşullu bir hücre ya da bir `<template>` onu bir
    sabahta bozar, ve kırılma bir hata değil bir **kayma** olarak görünür.

86. **Bir taşmayı `scrollHeight` ile ölçmek, taşan kutu bir flex sütunuysa SIFIR
    döndürebilir.** Dokuz baskı birleşimini gezen test iki sürüm boyunca
    `.print-page`'in `scrollHeight - clientHeight`'ine bakıyordu ve dokuzunda da
    0 buluyordu — oysa "Büyük"te başlık ve tablo birlikte, sayfanın 714 px'inden
    **739 px** istiyordu. `justify-content: safe center` ile hizalanan bir flex
    sütunu taşmasını o yoldan bildirmiyor. Yani test doğru ortamda, doğru
    kutuda, doğru soruyu soruyordu ve **aleti bozuktu** — tuzak 64'ün en sinsi
    hâli: orada yanlış kutuya bakılıyordu, burada doğru kutuya yanlış soru
    soruldu. Doğrusu çocukların sınırlarını içerik kutusuyla karşılaştırmak.
    İkinci yarısı: `emulateMedia({ media: 'print' })` **yalnız medya sorgusunu**
    değiştirir, pencereyi değil. Kâğıtta `.print-sheet` `width: auto` ile sayfa
    kutusunu alır; 1920 px'lik bir pencerede bu 1920 px olur, saat başlıkları
    sarmayı bırakır, ve satır yükseklikleri gerçek A4'tekiyle **tutmaz**. Kâğıdı
    ölçen bir test pencereyi de kâğıdın boyuna getirmeli.

87. **`i18n.test.ts`'in ölü anahtar tarayıcısı YORUMLARA da bakar, o yüzden bir
    arayüz metnini yeniden adlandırmak sözlük girdisini öksüz bırakır ve
    hiçbir şey söylemez.** Sözlüğün anahtarları Türkçe cümlelerin kendisi, ve
    o testin tek işi "kaynakta artık geçmeyen anahtar var mı" diye sormak.
    Ama `source` **bütün `src/`'nin ham metni**, İngilizce yorumlar dâhil.
    `Kurulum → Okul` ve `Yazdır → Çıktı` yapıldıktan sonra o iki kelime on
    beş kadar yorumda hâlâ duruyordu, yani `'Kurulum': 'Setup'` satırı ölü
    olmasına rağmen "kaynakta var" sayılıyordu. **Mutasyonla ölçüldü:** iki
    ölü anahtar bilerek geri kondu ve süit yeşil geçti. Tuzak 80'in ailesi —
    orada bir toplu değiştirme karakterin **rolüne** değil kendisine bakıyordu,
    burada bir tarayıcı aynı şeyi yapıyor. Bir arayüz metnini yeniden
    adlandıran, `lang/*.ts`'i **elle** düzeltir; onu hatırlatacak bir şey yok.

88. **Bir `<th>`'ye yüzde genişlik yazmak, otomatik düzenli bir tabloda
    DÖNGÜSELDİR.** "Tablo panelin sonuna kadar gitsin" için ilk yazılan kural
    `th:last-child { width: 100% }` idi; bir hücrenin yüzdesi **tablonun**
    genişliğine göre çözülür, tablonun genişliği de hücrelerden gelir.
    Chromium bunu hata olarak bildirmedi — tabloyu **1 000 000 piksele**
    çıkardı, yani ekranda kalan tek iz yatay kaydırma çubuğuydu. Aynı turda
    ölçülen ikinci yarısı daha sinsi: `width: 100%` ya da `min-width: 100%`
    tablonun kendisine yazıldığında panel gerçekten doluyor **ama fazlalık
    doğrudan adı taşıyan sütuna gidiyor** (Derslikler'de Ad 187 → 640,8 px),
    yani bir önceki turun şikayeti geri geliyor. Çalışan tek şey kutuyu
    doldurmak **ve fazlalığı alacak sütunu serbest bırakmak** —
    `min-width: 100%; width: max-content` artı `th:last-child { width: auto }`.
    Genel kural: bir tabloyu genişletirken sorulacak soru "dolar mı" değil,
    **"fazlalık hangi sütuna gidiyor"**dur, ve cevabı ölçülür.

89. **Bir SÜİT çevrilmemiş metni göremez, çünkü anahtar cümlenin kendisidir.**
    `t('Öğretmenler')` Türkçede `'Öğretmenler'` döndürür — yani `t()`'ye
    taşınmış bir cümle ile taşınmamış bir cümle Türkçe ekranda **birebir
    aynıdır**, ve bütün E2E süiti `kapan.ts`'te Türkçeye sabitli. Sözlük
    bittiğinde 469 test yeşildi ve İngilizce ekranda **on dört yerde Türkçe
    duruyordu**: bir sekmenin adı, altı panel başlığı, ızgaranın ve kâğıdın
    gün başlıkları, üst çubuğun durum çipi, şeridin düğmeleri. Hepsi
    "çevrilmiş gibi görünen" yerlerdi, çünkü Türkçede öyle görünüyorlardı.
    Onları bulan iki şey oldu ve ikisi de bir iddia değil: **İngilizce açılmış
    sayfanın `body`'sini okuyup Türkçe harf arayan bir tarama**, ve **en uzun
    dilde (Almanca) ekran görüntülerine bakmak**. Genel kural: bir doğruluk
    kaynak dilde **tanım gereği** sağlanıyorsa, onu ölçen tek yer öteki dildir.

90. **Bir sayı YUVAYA girerse çoğullanamaz.** Listelerin altındaki sayaç
    `'{toplam} {ne}'` idi ve `{ne}` zaten çevrilmiş bir kelimeydi; Almancada
    `8 Raum` yazıyordu ve sözlüğün söyleyecek hiçbir şeyi yoktu, çünkü çoğulu
    seçen şey **anahtarın kendisi** olmak zorunda. Çare bir çeviri değil bir
    imza: sayı, çevrilen anahtarın **içine** alındı (`countKey='{n} derslik'`).
    Türkçe hiçbir şey kaybetmedi — sayıdan sonra ek almıyor, ve bu yüzden
    kusur iki yıl boyunca görünmedi.

91. **Bir değerin İKİ işi varsa çeviri onları ayırır.** `defaultSubjectShort`
    hem "ekranda ne yazıyor" hem "override sayılır mı" sorusuna cevap
    veriyordu, ve tek dilde ikisi aynı cevaptı. İkinci soru **çevrilemez**:
    dille birlikte kıpırdayan bir karşılaştırma, aynı projenin iki oturumunda
    `settings.subjectShorts`'a başka şeyler yazdırır — yani bir arayüz
    tercihi, **yedek dosyasının içeriğini** değiştirir. Ayrıldılar: biri
    Türkçe kaldı, öteki çevrildi, ve `setSubjectShort` **ikisini birden**
    kabul ediyor ki kullanıcı ekranda gördüğü şeyi geri yazdığında silinsin.

92. **Bir yardımcının SESSİZ dönüşü, bir zaman aşımı olarak görünür.**
    `revealRibbon` `.main` bulamazsa `return` ediyordu; boyanmamış bir sayfada
    hiçbir şey dürtülmüyor, şerit katlı kalıyor ve iddia beş saniye sonra
    düşüyordu. Bu tam bir tur boyunca **"yük altında kararsız"** diye
    STATUS'e yazıldı — yani bir kod kusuru bir ortam özelliği sanıldı, ve
    teşhis yanlış olduğu için kimse koda bakmadı. Bir test yardımcısı bir
    önkoşulu bulamıyorsa **fırlatır**; sessizce dönmek, ölçmediği şeyi
    ölçüyormuş gibi göstermenin en ucuz yoludur (tuzak 23'ün ailesi).
    Yanında ikinci yarısı: yirmi test çıplak `page.reload()`'dan sonra ekranı
    okuyordu, `open()`'ın yaptığı iki bekleyişin hiçbirini yapmadan.

93. **Bir çıktı dosyasının REÇETESİ, o dosyaya elle eklenen şeyi silmişti.**
    `scripts/favicon.mjs` `index.html`'i baştan yazıyor; tuzak 72'nin "kaynak
    şablonu" uyarısı ise dosyaya **elle** yazılmıştı. Yani betiği çalıştırmak
    o uyarıyı sessizce kaldırıyordu — `temel.spec.ts` 77 onu ölçtüğü için
    kırmızı dönerdi, ama bir betiğin, bir testin birazdan soracağı şeyi
    haberi olmadan silmesi kendi başına bir tuzak. Tuzak 69'un aynası: orada
    reçete **yoktu**, burada reçete ile çıktısı **ayrışmıştı**. Bir dosya bir
    betik tarafından üretiliyorsa, o dosyaya elle eklenen her şey **betiğe**
    eklenir.

94. **BİR DURUMUN AĞIRLIĞI BİR ÖLÇÜDÜR, ve eşit sütunlu bir ızgarada onu
    bütün komşularına dağıtır.** Şikayet *"alt bardaki seçeneklerin arasında
    geçerken bazen böyle kayıyor gibi oluyor"* idi ve "bazen"i açıklayan iki
    ayrı sebep vardı, ikisi de bir eşiğin hangi tarafına düştüğünüze bağlı.
    Birincisi şeridin kendisi: `.ribbon-group` eşit sütunlu bir grid, yani
    sütun genişliği **en geniş** düğmenin max-content'i, ve
    `.btn[aria-pressed="true"]` `font-weight: 600` yazıyordu. Ölçüldü:
    "Öğretmenler 25" 400'de **128,19 px**, 600'de **130,59 px** — yani en uzun
    seçeneği basmak dört kutuyu birden genişletiyor ve sonuncuyu **7,3 px**
    yana kaydırıyor, başka birini basmak geri alıyordu. Üstteki sekme çubuğu
    **aynı** ızgarayı kullanıyor ve iki yıldır kıpırdamadı, çünkü
    `.tab[aria-current]` nerede olduğunuzu yalnız **renkle** söylüyor. Kural:
    bir durumun işareti bir ölçüyü değiştiriyorsa, o işaret bir renk olur.
    İkincisi altındaki sayfa: `.main`'de ayrılmış bir kaydırma çubuğu oluğu
    yoktu, yani taşan bir bölümle taşmayan bölüm sayfaya iki farklı genişlik
    veriyordu — panel **1538,5 → 1528,5 px**, ve arada her tablo, her başlık.
    `styles.css`'in kaydırma çubuğu tokenlerinin yanındaki satır
    `scrollbar-gutter: stable`'ın "kaydıran panellerde" zaten kurulu olduğunu
    **yazıyordu**; kurulu olduğu tek yer komut paletiydi (tuzak 77'nin şekli).
    **Ve süitin bunu görmesi imkânsızdı:** Playwright Chromium'u
    `--hide-scrollbars` ile açıyor, yani buradaki her testte her kaydırma
    çubuğu sıfır piksel. Yer kaplamayan bir çubuk hiçbir yeri kaplayamaz, o
    yüzden 10 px'lik adım hiçbir koşuda var olmadı. `e2e/kayma.spec.ts` kendi
    tarayıcısını `ignoreDefaultArgs: ['--hide-scrollbars']` ile açıyor, ve
    oluğun gerçekten yer kapladığını **iddia etmeden önce ölçüyor**. Program
    sekmesi oluktan muaf: `overflow: hidden` de Chromium'a göre bir kaydırma
    kabı, `stable` orada da 10 px ayırıyordu — `.grid-wrap` 1920 yerine 1910.

95. **BİR TERS-DNS KİMLİĞİ BİR AD DEĞİL, BİR ADRESTİR.** Program Mozaik olurken
    `tauri.conf.json`'ın `identifier`'ı da `com.dersprogrami.arac` →
    `me.mozaik.arac` yapıldı; aynı commit'in mesajı *"programın adı değişti,
    verinin adı değişmedi"* diyordu ve anahtarlar, dosya adları, `Belgelerim`
    klasörü ve depo adı gerçekten değişmemişti. Ama Tauri WebView2'ye profil
    olarak `%LOCALAPPDATA%\<identifier>` veriyor: o dize babanın bütün
    planlarının **durduğu yol**. Windows'ta ölçüldü —
    `%LOCALAPPDATA%\com.dersprogrami.arac` altında
    `EBWebView\Default\Local Storage\leveldb` içinde `ders-programi`,
    `ders-programi-planlar` ve `ders-programi-yedek-0`, köken
    `http://tauri.localhost`. Yani o exe
    **bomboş** açılır ve bunu kimse haber vermez: dosyalar diskte, program
    onlara bakmıyor, konsol temiz, hata yok. Tuzak 65'in ailesi (ölçülmeden
    yazılmış bir platform cümlesi) ama zararı başka bir kategoride: orada bir
    gerekçe yanlıştı, burada bir **dönem kaybolur**. İki karşı önlem:
    `src/surum.test.ts` dizeyi çiviliyor, ve `productName`'in hâlâ `Mozaik`
    olduğunu ayrıca ölçüyor ki bu satır "ad değişikliği geri alındı" diye
    okunmasın. Genel kural: bir dizeyi yeniden adlandırmadan önce sorulacak
    soru "bu kime görünüyor" değil, **"bunu kim ARIYOR"**dur.

96. **`git checkout -- <dosya>` BİR MUTASYONU GERİ ALMAZ, O DOSYADAKİ BÜTÜN
    OTURUMU GERİ ALIR.** Bu depoda bir testin gerçekten bir şey ölçtüğü
    mutasyonla sınanıyor: kural bilerek bozulur, süit koşulur, sonra geri
    alınır. `Summary.tsx` üstünde tam bunu yaparken geri alma `git checkout --`
    ile yapıldı ve o dosyaya ait o turun **tamamını** sildi — commit edilmemiş
    her şey `HEAD`'e göre "değişiklik"tir, ve komut hiçbir şey sormaz, hiçbir
    şey yazmaz. Görülme biçimi de öğretici: mutasyon testi **yeşil** geçti, yani
    okunan sonuç "test bir şey ölçmüyor" oldu — teşhis, teşhissizlikten beter
    (tuzak 72'nin ailesi). Gerçek sebep testin zayıflığı DEĞİLDİ; o turun kodu
    artık orada değildi. Kural: mutasyon denenecek dosya önce bir yere
    **kopyalanır** (`cp x /tmp/x.bak`), geri alma o kopyadan yapılır. Bir sürüm
    denetimi komutu, yazılmamış işi olan bir dosyada bir geri-alma aracı
    değildir.

97. **Bir SAYI adlandıran göç testi, bir sonraki bump'ta geride kalan sayıyı
    göremez — ve tam olarak o sayı unutulur.** `store.ts`'in kabul listesinin
    üstünde iki yıldır şu yorum duruyordu: *"Bumping SCHEMA_VERSION without
    adding the number it used to be makes every backup the previous release
    wrote fall through to `return null` — which is the one failure this whole
    function exists to prevent."* Yorum doğruydu, uyarı yerindeydi, ve hiçbir
    şeyi engellemedi: `5fc0316` şemayı 8'den 9'a çıkarırken `version === 8`'i
    listeye **yazmadı**, yani **yayınlanmış v2.0.0'ın yazdığı her yedek ve her
    plan okunamaz oldu**. Ekranda tek bir şey görünür: "dosya okunamadı".
    Süit bunu göremezdi ve görmemesi tesadüf değildi: v6 için bir test vardı,
    v7 için bir test vardı, ve **her biri bir sayı adlandırıyordu**. Geride
    kalan sayı her bump'ta başkası olduğu için o testler sonsuza kadar yeşil
    geçer. Yazılan test hiçbir sayı adlandırmıyor:

    ```ts
    raw.schemaVersion = SCHEMA_VERSION - 1;
    expect(parseState(JSON.stringify(raw))).not.toBeNull();
    ```

    Bu tuzak 77'nin ("bir belge cümlesi 'tek/her zaman/asla' diyorsa, yanında
    onu ölçen bir test yoksa o cümle bir niyet beyanıdır") tam kardeşi, bir
    basamak daha sinsi hâli: burada ölçen bir test **vardı**, ama ölçtüğü şey
    sabit bir sayıydı. Genel kural: bir değişmezin testi, değişmezin
    **KENDİSİNİ** yazsın — bugünkü değerini değil.

98. **Kullanıcıya ait bir REDDİ paylaşılan bir fonksiyona koymak, o
    fonksiyonun mekanik çağıranını bozar.** Sabitleme kilidi `removeBlock`'a
    kondu, ve doğru yer orasıydı: dört yol (sağ tık · menü · Delete · üstüne
    bırakma) oradan geçiyor ve yalnız üçünün saydığı bir kilit kilit değil.
    Ama beşinci bir çağıran vardı ve o bir **insan değildi**: `illegalBlocks()`
    her bloğu kaldırıp `blocker()`'a "buraya geri konabilir mi" diye soruyor.
    O bir **kural** sorusudur ve bir pin kural değildir. Denetçi kilitli bloğu
    kaldıramayınca onu *kendisiyle* çakışıyor diye raporladı — yani sabitleme
    testinin çıktısı "yasa dışı blok var" oldu, ve okuyan kişi çözücüye
    yollanırdı. Çare şemayı değil **adları** ayırmak: `liftBlock()` mekanik
    (kapı yok), `removeBlock()` = kapı + `liftBlock`. Genel kural: bir kapı
    yazmadan önce çağıranların listesi çıkarılır, ve her biri için sorulur —
    *bu çağrıyı bir el mi yapıyor, yoksa bir hesap mı?*

99. **BOYANMIŞ BİR DEĞERİ GEÇİŞ SÜRERKEN OKUMAK, HİÇBİR ŞEY OKUMAMAKTIR — ve
    okuduğu sayı inandırıcıdır.** Karttaki raptiyenin iddiası "hover olmadan da
    görünüyor"du; testi `getComputedStyle(...).opacity`'i okuyup `> 0.25`
    diyordu, ve `opacity: 0` mutasyonuyla **yeşil geçti**. İki ayrı sebep, ve
    ikincisi asıl ders. (a) `dragAndDrop` imleci bıraktığı hücrede bırakıyor,
    yani `td:hover > .card-pin` kuralı raptiyeyi tam açıyordu — bir "hover
    olmadan" iddiası imleci **kenara çekmeden** yazılamaz. (b) İmleç çekildikten
    sonra bile geçti: `.card-pin`'in `transition`'ı sürerken okunan opaklık
    **0,643877** dönüyordu. Yani ölçüm 0 ile 1 arasında bir sayı gördü,
    eşiğin üstündeydi, ve iddia doğrulanmış sayıldı.
    Tuzak 59 bunun **ekran görüntüsü** hâliydi ve o turda yazılan kural
    ("bir düzen ölçen her testin ilk satırı `getAnimations()` beklemek")
    yalnız düzeni sayıyordu. Genişledi: **boyanmış bir değeri — opaklık, renk,
    dönüşüm — okuyan her ölçüm de önce hareketin bitmesini bekler.**
    `settledMotion()` artık `e2e/helpers.ts`'te ve `ekran.spec.ts`'in kendi
    kopyası da ona bağlı; iki kopya, ikinci kez unutulacak yerdi.

100. **SARMALANAMAYAN BİR GRUP KENDİ KARTLARINI KIRPAR, ve `overflow: hidden`
    bunu sessizce yapar.** Havuzun grupları `flex: 0 0 auto` bir sütundu, yani
    her grup kartlarının istediği kadar genişti. "Blok boyuna göre" sıralamada
    grup sayısı **ikiye** düşüyor ve geniş olanı 1920 px'lik tepside **4015 px**
    istiyor: `2109 px` kart, `.pool-list`'in `overflow-x: hidden`'ı altında,
    **erişilemez** ve ekranda var olduklarını söyleyen hiçbir şey yok. %150'de
    4123 px. Çare kutuyu tavanlamak (`flex: 0 1 auto; max-width: 100%`) —
    o zaman grup kendi `flex-wrap`'ine düşüyor.
    İkinci yarısı aynı turda ve ters yönden geldi: başlık kartların **üstünde**
    dururken dikeyde bir satır götürüyordu, ve tepsinin tabanı 6rem = 84 px
    (560 px'lik bir pencerede clamp oraya iner). Baş 32 + başlık 24 + kart 40,
    84'e sığmaz; tek kart satırı kırpıldı ve ekran dışı sürükleme testi
    kırmızıya döndü — `boundingBox()` kırpılmış bir kutunun koordinatını
    veriyor, `mouse.move` oraya gidiyor, ve altında kart yok. Başlık
    **yanlarına** alındı.
    Genel kural: bir kutuyu bölmeden önce **hem yönünün taşması** hem
    **öteki yönün tabanı** ölçülür, ve ölçüm gerçek veriyle yapılır (tuzak 41).


101. **BİR ŞİKAYETTEN YAZILMIŞ PLAN BİR SEBEP ADLANDIRIR, VE O SEBEP ÖLÇÜLECEK
     İLK ŞEYDİR — SONUNCUSU DEĞİL.** Görev çubuğundaki simge için üç tur
     harcandı. Şikayet her seferinde aynıydı (*"küçük/bulanık görünüyor"*), ve
     her seferinde plan bir sebep adlandırdı: önce "`.ico`'da boy eksik", sonra
     "eşik yanlış yerde", sonunda "`bundle.icon` `--no-bundle` ile ikonu
     gömmüyor olabilir". Sonuncusu STATUS'e *"varsayıldı, ölçülmedi"* diye
     yazılmıştı ve bir turun **iş listesine** dönüşmüştü: iş akışına ölçüm
     eklemek, tutmuyorsa Win32 kaynağını elle yazmak.
     Yayınlanmış ikiliye bakmak **on dakika** sürdü ve iddiayı çürüttü: dokuz
     boyun dokuzu da gömülüydü, `.ico` ile birebir. Aynı ölçüm ikinci bir
     maddeyi de çürüttü — AB6 *"VERSIONINFO yok"* diyordu, beş alan vardı.
     Yani bir turun iki maddesi, yapılmadan önce **ölçülerek** kapandı, ve
     kalan gerçek sebep (24 px'te altı çubuğun araları 0,56 cihaz pikseli)
     ancak o iki teori kalkınca görünür oldu.
     Tuzak 65 "bir platform iddiası ölçülmeden yazılmaz" diyor; bu onun bir
     basamak yukarısı: **ölçülmeden yazılmış bir iddia, kendisini doğrulayacak
     bir iş planı üretiyor.** Karşı önlem sırayı çevirmek — bir plan bir sebep
     adlandırıyorsa, o turun ilk işi o sebebi ölçmektir, ve ölçüm o sebebi
     kaldırırsa plan da kalkar. Ölçüm bir kapıya dönüştürüldü
     (`scripts/exe-ikon.mjs`, `surum.yml`'in `exe` işi) ki varsayım bir daha
     doğmasın.

102. **KIL PAYI SIĞAN BİR KUTU, KÖK KIPIRDADIĞI GÜN SIĞMAZ — ve `display:
     none` ile gizlenen bir satır o payı kendi eliyle harcar.** Müsaitlik
     başlığı bir ders numarası ve altında başlangıç saati taşıyor, ve saati
     kapatan ayarın bütün iddiası *"bu gürültü meselesi, yer meselesi değil"*
     — yani tablonun boyu değişmemeli. İki yıl değişmedi, ama **tesadüfen**:
     paylaşılan hücre kuralı 2.125rem veriyordu, 14px kökte 29,75 px, ve iki
     satır metin 30 px istiyordu. Kök 13px'e inince metin **inmedi** (merdiven
     yeniden sabitleniyor, 12 px taban), pay negatife döndü, ve saat açılınca
     tablo 2,16 px büyüdü.
     İlk çare `height: 2lh` idi ve yetmedi (2,16 → 1,03 px): blok bir çocuk
     kendi satır kutusunu getiriyor ve toplam iki `lh`'den büyük. Doğru çare
     bir sayı değil bir **yapı**: satırı gizlerken `visibility: hidden`
     kullanmak, yani ikinci satır kutusunu **her iki durumda da** orada
     bırakmak. İki yükseklik artık inşaat gereği eşit (332,03 ↔ 332,03), ve
     kök bir daha kıpırdarsa da eşit kalacak.
     Genel hâli tuzak 36'nın kardeşi: orada elle hesaplanmış bir yarım vardı,
     burada elle doğrulanmış bir **pay**. Bir kutunun içindekine kıl payı
     yettiğini ölçtüğünüzde, yazacağınız şey o payın sayısı değil, payı
     gereksiz kılan düzendir. Ve ızgaranın kendi `.hour-clock`'u hâlâ
     `display: none` — orada geri verilen yer **ölçülmüş bir kazanç**
     (2461 → 1728 px, tuzak 37), yani aynı iki satır iki ekranda iki ayrı şey.

     **VE O İKİ EKRAN 2026-08-31'DE AYRILMAMIŞ ÇIKTI.** `:root[data-density=
     'sigdir'] .hour-clock { display: none }` seçicisinde `table.grid` yoktu,
     yani Sığdır yoğunluğunda müsaitlik başlığının saatini de kapatıyordu — ve
     orada okuyanın bir **düğmesi** var. Ölçülen, üç yoğunlukta, saat AÇIKKEN:
     `rahat` block/visible · `sigdir` **NONE**/visible · `ferah` block/visible.
     Yani düğme basılıyor, `aria-pressed` dönüyor, `data-avail-clock='acik'`
     yazılıyor, ekranda hiçbir şey olmuyor: *"Saat açma kapama çalışmıyor
     müsaitlikte."* Bedeli bu maddenin kendi değişmezi de oldu — tablo
     `sigdir`'de 332 yerine **329,9 px**, yani inşaat gereği eşit olan iki boy
     eşit değildi. Bkz. tuzak 103.

103. **BİR KURALIN KAPSAMI YORUMDA DEĞİL SEÇİCİDE YAZILIDIR.** Yukarıdaki
     kusurun genel hâli, ve iki dosya birbiriyle **açıkça** çelişiyordu:
     müsaitlik kuralının üstündeki yorum *"The grid's own `.hour-clock` keeps
     `display: none` under Sığdır"* diyordu ve doğruydu; otuz satır yukarıdaki
     seçici `table.grid` demiyordu. Bir yorum kapsam iddia ediyorsa o kapsam
     seçicide de olmalı — yoksa iddia bir dilektir (tuzak 77'nin CSS hâli).
     Testin görememesinin sebebi ayrı bir ders: `gorunum.spec.ts` 50 varsayılan
     yoğunlukta koşuyordu, yani kusurun yaşadığı yoğunluğa hiç uğramıyordu
     (tuzak 23'ün bedava yeşili). Bir ayar birden çok modda yaşıyorsa, onu
     ölçen test **kusurun yaşayabileceği modda** koşmalı.

104. **`<Activity mode="hidden">` SEKMEYİ DOM'DA BIRAKIR, VE O ANDAN İTİBAREN
     HER SEKMENİN ADLARI HER SEKMEDEN BULUNUR.** `fb052f4` Program'ı React'in
     `<Activity>`'sine sardı — doğru karar, çünkü 1950 hücrelik ızgara geri
     gelirken yeniden kurulmuyor — ve **tek başına yedi testi kırmızıya
     döndürdü**. Kırılma biçimi hep aynıydı ve hiçbiri "Program" hakkında
     değildi: `.empty-screen` iki öğe buluyor (Çıktı'nınki ve gizli Program'ın
     *"Henüz dizilecek ders yok"*'u), `getByLabel('Sırala')` iki öğe buluyor
     (liste şeridininki ve havuzun `aria-label="Havuz sıralaması"`'ı, çünkü
     `getByLabel` alt dize eşler). Tuzak 49/74'ün ailesi ama **sebebi yeni**:
     orada iki kontrol benzer adlandırılmıştı, burada iki SEKME aynı anda
     belgede. Karşı önlem `e2e/helpers.ts`'teki `onScreen()`: *"bu ekran ne
     diyor"* diye soran bir test hangi ekran olduğunu söylemek zorunda. Gerçek
     kullanıcı etkilenmiyor — `<Activity>` gizli dalı erişilebilirlik
     ağacından da çıkarıyor — yani bu bir **test** sözleşmesi, bir kusur değil.

105. **BİR EKRANIN EN PAHALI SATIRI, İSRAF OLMAYABİLİR.** *"Program sectionu
     açılırken bi' yavaşlama oluyor"* ölçüldü ve profil tek bir satırı
     gösterdi: `gridChrome.ts`'in `scrolled()`'ü, sekme başına **bir** çağrı,
     4× CPU kısıkta **119,7 ms**, bütün CPU örneklerinin **%35,3'ü** (Program'ın
     toplam 144,8 ms'sinin içinde; öteki sekmeler 30–50 ms). Teşhis kendini
     yazıyordu: `scrollTop` bir düzen okumasıdır, efekt React 1950 taze hücreyi
     belgeye koyar koymaz koşar, ve taze bir kapta cevap **her zaman 0**'dır —
     yani hiçbir şey öğrenmemek için bütün tabloyu hesaplatıyor gibi görünür.
     `requestAnimationFrame`'e ertelendi ve **gerçek sayı kıpırdamadı**:
     tıklamadan boyamaya 105,5 / 104,9 ms (ertelenmiş) ↔ 104,5 ms (olduğu
     gibi). Yani o düzen israf değil, **boyamanın zaten yapacağı düzen**; o
     çağrı yalnızca faturanın nereye kesildiğini seçiyor. Geri alındı: aynı
     sayıyı ölçen bir iyileştirme, düzeltme kılığında bir yorumdur (tuzak 21).
     Genel kural: bir profil satırı pahalı diye **boşa** çalışmıyordur — önce
     kaldırılıp **toplam** yeniden ölçülür, çünkü kaldırılan iş çoğu zaman
     başka bir yere taşınır. Program'ın gerçek maliyeti hâlâ 1950 hücreyi ve
     367 kartı çizmek, ve onu ucuzlatmak bir mimari karardır, buradaki bir
     satır değil.

---

## Tasarım — serbest

Bu bölüm 2026-08-26'da **boşaltıldı**. Eskiden burada ~290 satırlık bir tasarım
sistemi duruyordu: üç düzlem, üç yarıçap, iki kot, altı basamaklı tipografi,
altı basamaklı sütun merdiveni, ≤150 ms hareket ve bir sürü "dördüncüsü yok"
kuralı. Hepsi tek tek gerekçeliydi, ama toplamı yeni bir arayüz yazmayı
imkânsız kılıyordu. **Kullanıcı kararı: kaldırıldı.**

Yerine geçen tek cümle: **tasarım kararları serbesttir.** Renk, tipografi,
yarıçap, gölge, boşluk, hareket, düzen, bileşen sayısı, sekme sayısı — hiçbiri
bu belgeden izin almaz. Ne yapıldığı [docs/DESIGN.md](docs/DESIGN.md)'de
**anlatılır**, burada **buyrulmaz**.

### Kalan dört sözleşme — bunların hiçbiri zevk meselesi değil

1. **İşlevsel renk kanalı.** Yeşil = bırakılabilir · sarı = uyarı ·
   kırmızı = engel · gri taralı = kapalı. Bu, aracın çalışma biçimi; kimlik
   paletinin 36 rengi bu üçüne yaklaşamaz. `palette.test.ts` ve
   `e2e/renk.spec.ts` her koşuda yeniden ölçer.
   **Bölüm renkleri de aynı kanala tabidir ve tekerlek DOLU:** yedinci sekme
   yedinci rengi isteyince (2026-08-27) bütün çember iki temada birden tarandı
   ve serbest kalan her yayın ya işlevsel bir rengin ya komşu bir sekmenin
   ailesine düştüğü **ölçüldü**. Sekizincisi aranırsa aynı ölçüm tekrarlanır;
   `var(--sec, …)`'in fallback'ine düşmek bir karar değil, tuzak 52'dir.
2. **Erişilebilirlik.** Kontrast AA. Çözücü ilerlemesi, sonuç satırı ve hata
   mesajları `aria-live="polite"` (`.reason-bar`, `role="status"` — sözleşme
   burada yazılıydı ama satırın kendisinde **2026-08-27'ye kadar yoktu**); geri
   alınamaz uyarılar `role="alertdialog"`. Renk tek başına durum taşımaz.
   Klavyeyle gidilen her yerde odak görünür. **Hedef kullanıcı zor görüyor** —
   bu, süsün değil *boyutun* tarafındaki bir kısıt: 12 px ekranda alt sınır
   olarak kalır.
   > **Netleştirildi (2026-08-30): taban VARSAYILAN ÖLÇEKTE (%100) geçerli.**
   > O gün `SCALE_MIN` 1'den **0,80**'e indi, yani ölçek merdiveninin altında
   > `--fs-xs` 12 px değil 9,6 px çiziyor. Bu bir gevşetme değil bir **kapsam**:
   > taban, programın kendiliğinden geldiği ekran hakkında bir söz —
   > `SCALE_DEFAULT` **1'de kaldı**, yani kimsenin ekranı küçülerek açılmıyor.
   > %80'e uzanan okuyucu tabana kendisi cevap veriyor, ve o okuyucu bunu
   > Windows'un kendi ölçeklemesi zaten büyükken yapıyor (bkz. `theme.ts`).
   > Tipografi merdiveni her kök değişiminde **yeniden sabitleniyor** (16 → 14
   > → 13 px), yani %100'de 12 px hâlâ 12 px.
   **Hareket bir tercihtir, ve makinenin tercihi tabandır:** `--dur-*` süreleri
   ile `--slide` · `--sweep` · `--press` · `--pop` mesafeleri tek yerden
   kısılır. Kural şudur: bir kuralda `translateY(.5rem)` gibi elle yazılmış bir
   mesafe varsa o hareket kapatılamaz — **her mesafe bir tokenden okunur.**
   0 ms'lik bir geçişin sonunda öteye taşınmış bir öğe hâlâ **ışınlanır**.
3. **Kâğıt fiziksel.** A4 yatay, `table-layout: fixed`, `@page { margin: 0 }`,
   sayfa 205 mm sabit (tuzak 31). Ekran ne olursa olsun yazıcı aynı yazıcı, ve
   `--ui-scale` kâğıda geçmez.
4. **İlke 1–3.** Çift tıkla çalışır · sunucu yok · çalışma anında ağdan tek
   bayt çekilmez. Bunları `vite-plugin-singlefile`, `temel.spec.ts` ve
   `site.spec.ts` **mekanik olarak** doğrular — iddiaya gerek yok.

### Bağımlılık politikası — 2026-08-26'da değişti

Eski kural "yeni runtime bağımlılığına varsayılan cevap hayır"dı; Tailwind,
Radix, ikon ve animasyon kütüphaneleri bu gerekçeyle reddedilmişti. Artık:

> **Bir paket `dist/index.html`'e gömülebiliyor ve çalışma anında ağa
> çıkmıyorsa serbesttir.** `devDependencies` zaten serbestti.

Tek şart **ölçmek**: paket eklendikten sonra `dist/index.html` boyutu ve
`file://` üzerinden açılış süresi [docs/STATUS.md](docs/STATUS.md)'ye yazılır.
Sabit bir KB tavanı yok — 420 KB sınırı da bir tasarım kısıtıydı ve kalktı.
Yerine geçen soru: *babanın makinesinde açılış hâlâ hızlı mı?*

**İLKE 7 ARTIK BİR VARSAYIM DEĞİL.** "Hedef makine yavaş" iki yıl boyunca
ölçülmemiş bir cümleydi. 2026-08-26, 1920×1080, `file://`, 7 koşu:

```
dist/index.html    489 815 bayt   (tek dosya: JS + CSS + gömülü font)
açılış             73 ms medyan · 83 ms en kötü
imleç haçı         0,391 ms / sütun değişimi  (16,7 ms karenin %2,3'ü)
ızgara             1950 hücre, 426 kart
```

Yani 490 KB'lik tek dosya bu makinede 73 ms'de açılıyor. Bu bir **tarih**,
kanun değil (tuzak 42): paket eklenince yeniden ölçülür.

### Neyin nerede olduğu

Görsel referans [docs/Örnek Fotolar](docs/Örnek%20Fotolar/) — aSc Timetables
2027'nin kendi ekranları. **Bağlayıcı değil**, karşılaştırma içindir.

Primitif envanteri [docs/DESIGN.md](docs/DESIGN.md)'de: hangi sınıf var, ne
yapıyor. Amacı yalnız **var olanı yeniden icat etmemek**; bir şeyi yasaklamaz.

### Geliştirme araçları — üründe değil, tezgâhta

`.mcp.json` üç sunucu tanımlar; hiçbiri `dist/index.html`'e girmez, ilke 1–3
etkilenmez.

| Sunucu | Ne için |
|---|---|
| `playwright` | uygulamayı sürüp **bakmak** — E2E süiti bunun yerine geçmez |
| `chrome-devtools` | konsol · ağ · **performans profili**; ilke 7 burada ölçülür |
| `context7` | React 19 / Vite 7 sürüm dokümanı |

Tip hataları için `typescript-lsp` eklentisi. `npm run kontrol` son sözü söyler.

---

## Arayüz

> ⚠️ **Bu bölüm 2026-08-26'da BAĞLAYICI OLMAKTAN ÇIKTI.** Aşağısı arayüzün o
> tarihteki hâlinin ve *neden öyle olduğunun* kaydıdır — bir izin listesi değil.
> "Daha fazlası yok" / "fazlası yok" biçimindeki bütün sayı kısıtları silindi.
> Bir kararı değiştirirken buradaki gerekçeyi **okumak** işe yarar; ona
> **uymak** zorunlu değil. Değiştirilen karar burada da güncellenir.

Yedi sekme: **Okul · Müsaitlik · Dersler · Program · Kontrol · Çıktı ·
Ayarlar**. Dersler 2026-08-27'de dördüncü adımdan çıkıp kendi sekmesi oldu;
gerekçe kullanıcının kendi cümlesi: *"hocaları onu bunu ayarlıyorsun ama
**ders en önemli kısım**"*.

**İki ad 2026-08-28'de değişti.** `Kurulum → Okul`: ilke 1'in ilk cümlesi
"kurulum yok" ve ilk sekmenin adı Kurulum'du, üstelik o sekme artık okulun
dört listesini birden tutuyor. `Yazdır → Çıktı`: isimler arasındaki tek
fiildi. Ad çakışması yüzünden zorunlu üçüncü bir yeniden adlandırma geldi
(tuzak 49/74): Ayarlar'ın `Okul ve zil` bölümü **`Zil ve günler`** oldu, çünkü
`getByRole(name:)` alt dize eşler ve bir düğme üç piksel ötedeki sekmenin
adını taşıyamaz.

- **Üst çubuğun sol ucunda marka işareti** (2026-08-26). Sade çizim
  (2026-08-28), `1.75rem` — yani `--ui-scale`'i izliyor. Kök 16px iken 28 px,
  14px iken 24,5 px, **13px'ten beri 22,75 px** (%150'de 34,125). Düğme
  **değil** ve `aria-hidden`: programın adı zaten belge başlığı, ve bu satırın
  neyin feda edileceği yazılı bir satır (tuzak 48) — işaret hiç feda edilmiyor,
  onun yerine sığması ölçülüyor. `<img src>` değil **inline SVG**: bu dosya
  kendi dışından hiçbir şey istemez (ilke 3).
- **Sekmeler ÜSTTE, çift bar** (2026-08-25'te rail kalktı). Satır bir: marka ·
  belge kimliği · 6 sekme · geri/ileri al · dosya · şerit katlama · tema. Satır iki:
  **o sekmeye ait araç şeridi** (`.ribbon`) — Word/Excel/aSc mantığı.
  - Rail'in savı ("yatay bant ızgaradan bir satır götürür") 768px ekran için
    yazılmıştı ve rail'in **kendi maliyeti hiç sayılmamıştı**: her sekmenin
    hepsinde 92px **genişlik**, ve Program dışındaki beşinin harcayacak
    genişliği yok — her ekranın sağının boş kalmasının sebebi buydu.
  - Bant ancak **kendi satırı** olursa bir satıra mal olur. Ölçülen baş toplamı:
    rail'li düzende 59+50+30 = **139px**, çift barda 51+39+26 = **116px**.
  - ~~**Kontrol'de şerit hiç çizilmez**~~ — **karar 2026-08-27'de değişti.**
    Gerekçe "okunan bir rapor, ona yapılacak bir şey yok"tu ve içerik açısından
    doğruydu; ekran açısından değildi. Şeridin yüksekliği sekmeyle birlikte
    gelip gidiyordu, yani Kontrol'e her girişte altındaki her şey **45px
    zıplıyordu** ve her çıkışta geri. Üstelik rapora sorulacak bir soru da
    varmış: tam hâli yedi panel, üçü ancak bir şey yanlışsa var oluyor.
    Şerit bir tur boyunca raporu **süzdü** (`Hepsi · Sorunlar · Kapasite`) ve
    **o karar 2026-08-28'de geri alındı.** Okuyanın hükmü "üçü de gereksiz gibi"
    idi ve büyük ölçüde doğruydu: herkesin geldiği panel üçünde de vardı, yani
    iki düğme yalnızca bir şeyleri **kaldırıyordu**. Rapor artık tek sayfa ve
    şerit süzmüyor, **götürüyor**: `Sorunlar (N) · Öğretmenler · Sınıflar ·
    Derslikler`, sağ ucunda yine sayılar. Atlama saf DOM
    (`scrollIntoView`) — `gridChrome.ts`'in deseni, çünkü şerit `<main>`'in
    ÜSTÜNDE ve içine ref uzatamaz; yumuşaklık koda değil **CSS'e** yazılı
    (`scroll-behavior`, `[data-motion]`'a bağlı), yoksa kapatma düğmesi
    olmayan bir hareket olurdu (tuzak 57).
  - Şerit katlanır (`ders-programi-serit`); katlanınca **tamamen** gider, 45px'i
    ızgaraya bırakır. %100'de Program'da bir şey kazandırmaz ve bu doğru:
    müşterisi %125/%150 kullanan baba, orada 39px bir tam satırdır. Katlama
    düğmesi üst barda, çünkü katlanmış bir şeridin kendi düğmesine verecek
    satırı yoktur.
  - 1280px altında sekme etiketleri gizlenir, `aria-label` kalır.
  - **ŞERİT STANDARDI (2026-08-27) — beş madde, beşi de ölçülüyor**
    (`e2e/serit.spec.ts`). Öncesinde beş şerit beş ayrı nesneydi: Kurulum
    simgeliydi ama başlıksız, Yazdır ve Ayarlar salt yazıydı, Kontrol'de şerit
    yoktu. Yanlış bir şey yoktu; **bir şekil** yoktu, ve şekli olmayan bir şeyi
    hiçbir test koruyamaz.
    1. Yedi sekmenin yedisi de `.ribbon` çizer ve **aynı yükseklikte** (±1px,
       %100'de de %150'de de).
    2. Her şerit bir `.ribbon-label` **başlığıyla** açılır — düğmelerin hangi
       soruyu cevapladığı.
    3. Gruplar `<Sep/>` ile, sağa yaslanan grup `<Spacer/>` ile ayrılır.
    4. **Her düğmede bir simge VE bir kelime** olur, ikisinden biri değil.
       Simge tek başına ilk seferde okunmaz ve iki test katmanında da ada
       dönüşmez (tuzak 56); kelime tek başına %150'de göze tutunacak bir şey
       vermez.
    5. Şeritteki her kontrol aynı yükseklikte: `--ribbon-h` (2rem). Yükseklik
       **şeride değil kontrole** verilir — sabit yükseklikli bir şerit kendine
       verileni ortalar ve 2px uzun bir düğmeyi gizler (tuzak 34'ün şekli).
    Üç varlık türünün simgesi **istisnasız** `KIND_ICON`'dan gelir (Yazdır'ın
    "Sınıflar"/"Öğretmenler"i dahil); gerisi `lucide-react`.
    Bir **değer** taşıyan grup `.ribbon-value` kullanır, `.ribbon-label`
    değil: başlık büyük harfli ve soluktur, bir adı ya da sayıyı o sesle
    okumak onu başlık gibi gösteriyordu.
- **İçerik ekranın tamamını kullanır.** Tek düzen kuralı `.cols` (+ `wide-left`,
  `narrow-right`): solda asıl iş, sağda o ekranın **anlamı** — Kurulum'da kapasite
  özeti, Ayarlar → Okul'da zil önizlemesi, Ayarlar → Kurallar'da canlı ihlal listesi,
  Müsaitlik'te varlık listesi, Yazdır'da sayfa seçimi. Sağa konan hiçbir şey yeni
  değil; hepsi ya bir sekme öteden ya tablonun üstünden geldi. Kontrol'de sabit iki
  sütun değil **akan kart ızgarası** (`.panel-grid`) — sorun yokken sol sütun boş
  kalmasın.

- **Örnek verinin evi Ayarlar → Veri.** Kurulum'da yalnız **ilk kullanımda**, tek
  satırlık bir ipucu olarak görünür (`.intro-line`) ve işlem yapılınca bir daha
  çıkmaz — örnek yüklendi, "Bir daha gösterme" tıklandı, ya da projeye ilk
  derslik/öğretmen/sınıf girildi. İşareti `ders-programi-tanitim`'de, `State`'e
  girmez. **İlk çizimde değil, EYLEMDE yazılır**: okunmamış bir ipucu bir
  yenilemeyi atlatmalı, ve ilk çizimde işaretlemek tercih yazıp sayfayı
  yenileyen E2E yardımcılarını sessizce kırardı. Ayarlar'daki düğme her zaman
  orada — proje doluyken sorusu **ne kaybedileceğini sayar** ve kırmızıdır.
  Eskiden tek ev Kurulum'du, yani ancak **boş** bir projeyle ulaşılabiliyordu:
  kendi verisine başlamış biri örneğe bir daha hiç bakamıyordu.
- **EKLEME KENDİ BLOĞU (2026-08-29).** Beş liste ekranının (Derslikler ·
  Branşlar · Öğretmenler · Sınıflar · Dersler) her biri **iki kardeş panel**:
  `.panel.add-panel` (işi adlandıran başlık + açıklama + form + Excel'den
  yapıştır) ve `.panel.step-panel` (sayılı başlık + arama şeridi + tablo).
  Bir tur boyunca aradaki ayrım tek bir **çizgi**ydi ve yetmedi:
  *"aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın."* Sıra
  değişmedi (*"ama yerleri değişmesin"*) ve sayılı başlık **saydığı listeyle**
  gitti, yani ekranda hâlâ tek bir `--fs-xl` başlık var. `e2e/kurulum.spec.ts`
  44 hem sırayı hem **iki kutu olduğunu** ölçüyor.
- **SAĞ RAYDA KAYDIRAN ŞEY LİSTENİN KENDİSİ (2026-08-29, aynı gün iki tur).**
  `.cols > aside` bir flex sütunu ve `100cqh`'de duruyor; tek panelli her rayda
  o panel de bir **flex sütunu**, yani içindeki her şey kendi boyunu koruyor ve
  yer verebilen tek kutu liste oluyor (`> .stat-scroll`, `> .entity-list`:
  sabit tavanları — 22rem ve 62vh — geçersiz, tabanları `6rem`). Bir özetin
  boyu **içindekinden** geliyor, styles.css'teki bir sayıdan değil; ekranı
  geçince kayan şey **liste** oluyor, kutu değil.
  İlk tur (AA2) scrollbar'ı panele koymuştu ve şikayet oydu: *"özet kutusu
  değil içindeki liste"* — başlığın altındaki cümle ve tablonun altındaki
  liste satırlarla birlikte gidiyordu.
  Panelin `overflow-y`'si **son çare** olarak duruyor (küçülemeyen yarı tek
  başına ekrandan uzunsa), başlığı da o yüzden hâlâ yapışkan. Taban `rem`
  cinsinden: `--ui-scale` büyüyünce liste de büyümeli. Kayan bir tablonun
  `thead`'i yapışkan — kayan tek şey satırlarsa sütun adları ilk gidecek şey
  olamaz.
  `:only-child` bilerek — Çıktı'nın dört panelli rayı kendi kaydırmasını tutar.
  Sabit tavanlar Kontrol'de duruyor (orası ray değil).
- **ÖZET'TE ÖNCE NE YANLIŞ.** Uyarı kutuları kapasite tablosunun **üstünde**, ve
  `CapacityRows` Özet'te de `problemsFirst` alıyor. Sorun yoksa hiçbir şey
  çizilmez: bırakılan bir başlık ya da boşluk yok.
- **Okul yalnız listeler, Ayarlar yalnız ayarlar.** Okul **dört** sayılabilir
  liste: `Derslikler · Branşlar · Öğretmenler · Sınıflar`; dersler kendi
  sekmesinde. **Branşlar 2026-08-28'de Ayarlar'dan buraya geldi** ve sıra
  bağımlılık zinciri: sınıf bir dersliği gösterir, öğretmen listeden bir branş
  **seçer**, yani ikisi de onları adlandıran adımdan önce gelmeli. Bir tur
  boyunca Ayarlar'daydı ve bedeli şuydu: branş eklemek, yarısı yazılmış bir
  öğretmeni bırakıp bir sekme öteye gitmek demekti.
  **Sıra numaraları 2026-08-28'de kalktı** (kullanıcı isteği) ve gerekçe
  şeridin kendi savıyla aynı: bu bir sihirbaz değil, her liste her an açık, yani
  önlerindeki 1·2·3 kimsenin saymadığı bir sırayı sayıyordu. Sayaç kalıyor —
  **0 gösteren liste**, eksik olanın nerede olduğunu söyleyen tek şey. Okul adı, günler, zil,
  kurallar **Ayarlar**'da — dönem başında doldurulan şeyle yılda bir dokunulan
  şey aynı ekranda durmaz.
- **Yeni bir proje BOŞ branş listesiyle doğar** (2026-08-28). Gömülü 21 branş
  hâlâ duruyor ama bir **teklif** olarak: Branşlar adımının sağındaki panel
  onları tek tıkla listeye koyar. Tohumlanmış hâlde o panel her yeni projede
  `(0)` yazıyordu, yani işe yaradığı tek ekranda boştu. **`defaultSubjects()`
  bir varsayılan değil bir tablo:** v5 öncesi bir yedeğin geri düştüğü yer hâlâ
  o (`store.ts`, İKİ yerde — `parseState` ve `migrateV2toV3`), çünkü listeden
  önce yazılmış bir dosya, öğretmenlerinin taşıdığı branşları kaybedemez.
- **Ayarlar BEŞ bölüm** (2026-08-28, aynı gün ikinci kez): `Zil ve günler ·
  Kurallar · Görünüm · Planlar ve yedek · Hakkında`. Branşlar Okul'a gitti;
  kalan dördü iki soruya göre bölündü. **Planlar ve yedek** = "işim nerede
  duruyor ve dışarı nasıl çıkar": kitaplık, klasör, paket, oturum yedekleri.
  **Hakkında** = "bu hangi kopya": sürüm, güncelleme, veriler nerede, artı açık
  planın yerine geçen ya da onu boşaltan iki işlem. `Data.tsx` ikisini de
  çiziyor (`part` prop'u) — paketi yazan işleyiciler kitaplığı okuyanlarla aynı,
  dosyayı bölmek onları da bölerdi. **`Program hakkında` DEĞİL:** o ad
  `name: 'Program'` sorgusuna da cevap verirdi (tuzak 49).
  Görünüm'de iki yoğunluk **tek panelde iki soru** oldu (ayıran şey iki
  `role="group"`, ki testin bulduğu da o), **tema** oraya geldi (düğmesi üst
  çubukta kalıyor; orası kısayol, burası envanter), ve "Yazdırma bundan
  etkilenmez" paneli yazı büyüklüğünün ipucu satırına indi.
  **Branşlar da elle sıralanır** (2026-08-27) — Kurulum'un dört listesiyle aynı
  tutamak, aynı `useRowOrder`. Sıranın karşılığı görünür: Öğretmenler adımındaki
  Branş açılır listesi bu sırada gelir. `settings.subjects` bir seviye derinde
  olduğu için `reorderList`'te kendi dalı var; ekranda **iki `<tbody>`** —
  ilkinde okulun kendi listesi (tutamaklı), ikincisinde yalnız bir öğretmende
  duran "listede değil" satırları (tutamaksız), çünkü `rowDrag` hedefini gövde
  içindeki **indisle** buluyor ve karışık tek gövdede yanlış satırı taşırdı.
  Görünüm iki şey ayarlar, ikisi de makinenin: **yazı büyüklüğü**
  (`--ui-scale`, %100–%125, altı düğme) ve **ızgara yoğunluğu** (Rahat /
  Sığdır). **Kaydırıcı değil düğme**: ölçeğin altı yasal değeri var, kaydırıcı
  olmayan bir süreklilik uydurur ve hangisine oturduğunu gizler. İkisi de
  `State`'e girmez (`ders-programi-olcek`, `ders-programi-yogunluk`) ve ikisi de
  **yazdırmayı etkilemez** — kâğıtta saatler her iki yoğunlukta da yazar.
  **Yoğunluğun bir kopyası Program'ın araç şeridinde**: ızgaranın ne kadarını
  gördüğün, ızgaraya bakarken verilen bir karardır, üç tık ötede değil.
- **Üst çubukta plan seçici, yönetim Ayarlar → Veri'de.** Seçici tek plan
  varken de görünür: "hangi planı düzenliyorum" sorusunun cevabı orası, ve
  ancak iki plan olunca beliren bir kutu planların var olduğunu hiç
  öğretemezdi. Plan **yaratan, adlandıran ve silen** her şey Ayarlar → Veri'de
  — üst çubuk, hiçbir tıklamanın bir öğleden sonrayı götüremeyeceği yer olarak
  kalır (aynı gerekçe `Sıfırla`'yı oradan çıkarmıştı). Geçiş geri-al yığınını
  sıfırlar: bir planın hamlesi başka bir plana uygulanamaz.
- **Ayarlar → Veri'de "Nereye kaydedilsin" (2026-08-26).** Babanın seçtiği bir
  klasöre **bütün planlar** yazılır — üst çubuktaki tek plan değil — ve her gün
  için ayrı bir yedek bırakılır (son 10). Panel "Veriler nerede"nin **üstünde**
  değil, "Bütün planlar tek dosyada"nın üstünde: bir öğrenilecek alışkanlık
  isteyen çareden önce, hiçbir şey istemeyen çare gelir.
  **Yedekler ad kalıbıyla budanır, sayılarak değil.** Seçilecek klasör
  Belgelerim olacak, yani babanın kendi dosyalarının yanı; "en yeni ondan
  gerisini sil" onun işini silerdi ve sessizce silerdi. Kalıba uymayan hiçbir
  dosyaya dokunulmaz — üst çubuğun saatli yedeği (`…-2026-08-26-1430.json`)
  dahil.
  **Yazma hatası sessiz kalamaz** (tuzak 7): klasör silinmiş ya da izin geri
  alınmışsa satır kırmızı olur ve ne yapılacağını yazar.
- **Ayarlar → Veri, verinin nerede olduğunu SÖYLER.** Gerçek anahtar adları,
  gerçek boyutlar, ve tek cümlelik doğru: bu veri bu tarayıcıya ve bu bilgisayara
  aittir, "tarama verilerini temizle" onu siler, taşınan tek şey dosyadır.
  "Tarayıcıda saklanıyor" demek bunu söylemez. **Bütün planları tek dosyaya**
  yazan düğme de burada — üst çubuktaki tek planı yazmaya devam eder.
- **`Sıfırla` üst çubukta değil.** Ayarlar → Veri altında. Üst çubukta "Dosyadan aç"a
  bir yanlış tıklama uzaklıktaydı ve geri alınamıyor. `Dosyaya kaydet` / `Dosyadan aç`
  üst çubukta **kalır**: tuzak 7'nin karşı önlemi görünür olmak zorunda.

- **Dolu bir hücreye bırakılabilir; oradaki ders HAVUZA döner (2026-08-26).**
  `dropMap()` `check()`'in üstüne **tek** bir reddin geçersiz kılınmasını ekler:
  sınıfın kendi başka dersi. Öteki bütün retler *başkasıyla* ilgilidir —
  öğretmen başka sınıfta, derslik dolu, saat kapalı — ve önündeki bloğu havuza
  atmak onların hiçbirini doğru yapmaz, o yüzden o hücreler kapalı kalır.
  Hücre **yeşil değil sarı**: izin var ama bir şey kaybediyorsunuz, ve ızgaranın
  üç renginde bunun karşılığı zaten vardı — dördüncü bir renk uydurulmadı.
  Bütün hamle **tek geri-al adımı**, ve ne kaybedildiği toast'ta adıyla yazar.
- **Sol tık taşır, sağ tık MENÜ açar (2026-08-29).** Yerleşmiş bir derse sol
  tıklamak bloğu siliyordu, dolayısıyla taşımanın tek yolu silip havuzdan
  yeniden sürüklemekti. Şimdi: sol düğme + sürükle = taşı, **sağ tık = menü**,
  Delete = havuza gönder, klavyeden. Klavyeden gelen "click" `e.detail === 0`
  ile ayrılır, böylece odaklı kartta Enter/Space çalışır. Sürükleme haritası
  **kaynağı kaldırılmış** bir durum üstünde hesaplanır, yoksa ders kendi
  kendini engeller.
  **Menü 2026-08-30'da yeniden dizildi** ve şekli bir kuraldır: üst düzeyde
  elin sık uzandığı şey, kapıların arkasında nadir ve tehlikeli olan.

  ```
  Havuza kaldır · Dersi düzenle · Öğretmeni düzenle · Sınıfı düzenle
  ────
  Dersi buraya sabitle / Sabitlemeyi kaldır
  Toplu sabitle ▸        Satırı · Sütunu · Günü
  ────
  Geçici görünüm ▸       Satırı/Günü soluklaştır · gizle
  ```

  Tek saatlik sabitleme bir tur alt menüde durdu ve **geri alındı**: programın
  en sık kilidi iki tık ve bir hover uzaktaydı. `Öğretmeni düzenle` ile
  `Sınıfı düzenle` ızgaranın **çizilmediği** eksene ulaşmanın tek yolu — satır
  başı zaten bakılan ekseni açıyor.
  **Menü TEK bir `ContextMenu.Root`**, tabloyu sarar — 2100 hücreye tetikleyici
  konmaz, tıklamanın nerede olduğu `data-row/day/hour`'dan okunur (drag.ts ile
  aynı yerden). Karta gelmeyen sağ tıkta `preventDefault()` çağrılır ve Radix'in
  kendi işleyicisi hiç koşmaz.
- **SABİTLEME: bir bloğu sabitlemeyi kaldırmaktan başka hiçbir şey indirmez.**
  Tek cümle, istisnası yok, ve beş yolun beşi de aynı kapıdan geçer:
  `removeBlock` (sağ tık · menü · Delete), `dropMap` (üstüne bırakma),
  `solver.ts` (`keepPlaced: false` pinlileri **tohumlar**), ve şeritteki iki
  yıkıcı düğme — `Baştan diz` ile `Programı boşalt` pinli saatleri **saymaz** ve
  yerinde bırakır. Kilit `State.pinned`'da; hücreye bağlı, derse değil, çünkü
  bir ders birden çok blok hâlinde iner ve kilitlenen bir **karedir**.
  İşaret bir **simge** (sol alt köşe), renk değil: ızgaranın dört rengi zaten
  bırakılabilir / uyarı / engel / kapalı demek.
  **VE O SİMGE 2026-08-30'DAN BERİ BİR DÜĞME** — *"kartların üzerinde
  sabitleye basınca dersi sabitlesin babamın en çok kullancağı bu."* İki şey
  bağlayıcı. (a) Raptiye kartın **kardeşi**, çocuğu değil: `.card` bir
  `<button>` ve düğme içinde düğme geçersiz HTML'dir; konumlanma bağlamı
  `<td>`. Bunun yan etkisi sağ tıka da dokunuyor — `openMenu` hedefini artık
  `.card` üstünden değil HÜCRE üstünden buluyor, yoksa raptiyeye sağ tıklamak
  hiçbir menü açmazdı. (b) **Hep görünür, sönük** (`opacity: .38`), hover /
  odak / basılıyken tam. Kullanıcı kararı, ve gerekçesi kullanıcı: hover'da
  beliren bir kontrol, bu programın okuyucusunun bir daha hiç bulamadığı
  kontroldür.
- **PROGRAM ŞERİDİNİN SIRASI (2026-08-30):** `Görünüm · Diz · Program` … boşluk
  … `Yoğunluk · Izgara`. Görünüm en solda ve orası **eski yeri** — kitaplık bir
  tur şeridin başına girip onu sağa itmişti (*"öğretmen ve sınıftan seçimleri
  en solda eski yerinde olmalı"*). İki grup birer **menü**: kitaplık (seçim +
  kopyala + adlandır + sil) ve `Izgara` (tümünü sabitle · geçici görünüm ·
  programı boşalt). İkisi de tercih değil **ölçüm**: eşit sütunlu bir grupta üç
  uzun kelime en uzunun üç katıdır, ve %150'de şerit 1920 px'lik kutuda
  **2061 px** istiyordu — iki düğme dışarıda, yani tıklanamaz (tuzak 48). Menüye
  inince 1717 px.
- **Otomatik dizme Program sekmesinde iki düğme**: `Otomatik diz (N)` ve `Baştan diz`
  (onaylı). Ayar yok — "sabaha yay" gibi tercihler **henüz ölçülmedi**; aSc'nin
  karşılığı `docs/asc/yardim/u58-timetable-generation.md`'de duruyor ve
  bakılmadı. İlerleme ve sonuç `.reason-bar`'da: sabit
  yükseklikli, ızgarayı kaydırmıyor, göz zaten oraya alışkın. İlerleme **düz metin**,
  çubuk değil (yasak liste: animasyon). Bütün koşu **tek geri-al adımı**.
- Ana ekran aSc'deki gibi: **satır = öğretmen, sütun = 6 gün x 12 saat**, tek geniş
  tablo. **Havuz ALTTA, ve boyu SÜRÜKLENEBİLİR** (`.pool` + `.pool-split`).
  **Havuzda ders başına değil BLOK başına kart** (2026-08-27): `2+1` bir ders
  bir ikili ve bir tekli bırakır, kart hangisi olduğunu hem yazar (`2 saat`) hem
  genişliğiyle söyler (`[data-size='2']` iki katı).
  **Aynı dersin aynı boydaki blokları TEK DESTE** (2026-08-27): altı saatlik
  bir ders altı özdeş kart ve altı kez aynı `0/6` bırakıyordu. En çok iki katman
  görünür. **Kaç tane olduğunu söyleyen rozet 2026-08-28'de kalktı**
  (kullanıcı isteği); sayı kaybolmadı, kartta yazmıyor: `data-count`'ta,
  kartın `title`'ında ve tepsinin başındaki "N blok bekliyor"da.
  **Kartlar BAŞLIKLI gruplar hâlinde duruyor (2026-08-30)** — *"kartlar
  havuzdayken ayrım daha bir güzel ve hoş olsun."* Bir grubun başlığı satır
  rengi noktası + ad + sayı, gruplar arası kıl çizgi, ve **başlık sıralamadan
  türüyor**: branşa göre sıralayınca başlıklar branş olur, yani ayarın
  karşılığı gözle görülür. Başlık kartların **yanında** durur, üstünde değil —
  dikeyde bir satır götürmesi kısa ekranda tek kart satırını kırpıyordu
  (tuzak 100).
  **Sıra ve süzgeç `toolState`'te, çünkü ikisi de bir POZİSYON**: beş sıra
  (ızgara sırası · ada · branşa · uzun bloklar önce · en çok kalan) ve bir
  branş süzgeci. Yeni depolama anahtarı yok. Süzülünce tepsinin başlığı neyi
  sakladığını **söyler** — sessizce onikide birini göstermek "hepsi yerleşti"yi
  bir tık ötede yalan yapardı. Sıralayıcıların hepsi `listview.ts`'in
  `compareTr`'siyle çalışır; ikinci bir Türkçe karşılaştırma yazılmaz.
  **`.pool-card` hâlâ "bekleyen BİR blok" demek, ve bu bir SÖZLEŞME:** sekiz
  dosyada ~40 test onu sayıyor, "N blok bekliyor" ondan geliyor,
  `pendingBlocks()`'un aynası o. Deste bir **düzen**, bir gruplama değil — aynı
  N eleman DOM'da kalır, gömülü olanlar yalnız mürekkebini bırakır. Grup da
  öyle: bir kabuk, bir eleme değil. Mürekkep,
  `visibility` değil: gizli bir öğenin `innerText`'i boştur ve `allInnerTexts()`
  okuyan iki test tepsiyi dağılmış sanır (ölçüldü). Hangi bloğu nereye koyacağı
  tepsideki bir seçim, gizli bir "sıradaki" değil. Yan fayda: `weeklyHours`'ı
  elle aşmak imkânsızlaştı — kart bitince sürüklenecek bir şey kalmıyor.
  Bir sürüm sağda durdu; sav ("ızgara yatayda zaten taşıyor") doğruydu ama
  havuzu üç kart genişliğinde bir sütuna çeviriyordu: 99 bekleyen ders
  kaydırılan bir liste oluyordu, görülen bir tepsi değil. Altta aynı 99 kart
  onikişer sıralar hâlinde duruyor. Altını daha önce imkânsız kılan şey
  **başkasının seçtiği sabit bir yükseklikti** (215px, yani 25 öğretmenin
  altısı) — artık sabit değil: kenar bir `role="separator"`, bıraktığınız yer
  `ders-programi-havuz-boy`'da hatırlanıyor, ve **havuz boşalınca kendiliğinden
  kapanıyor** (boş bir tepsi 176px'i hiçbir şey için tutar).
- **Müsaitlik satırı 3.875rem, ve ısı tablosu ONA DAHİL DEĞİL (2026-08-30).**
  Boyanan ızgara `54,3 px`'e çıktı (%150'de 81,4) ve sayfanın dikey taşması iki
  ölçekte de **0** — istendiği gibi (*"müsaitlik programlarının satırlarını
  uzat"*). "Haftanın darlığı" aynı iskeleti ödünç alıyor ama bir müsaitlik
  programı değil: tıklanacak hücresi ve okunacak çarpısı yok, bütün okula tek
  bakış. Kendi kuralıyla (`table.availability.heat`, özgüllük 0,2,3) eski
  boyunda kaldı.
- **Müsaitlik'te kapalı saatin çarpısı BÜYÜK ve KIRMIZI (2026-08-26).** İşlevsel
  renk kanalını bozmuyor ve bunu koruyan şey **kapsam**: Program ızgarasında
  kırmızı "bu bırakma reddedildi" demektir ve gri tarama "bu saat kapalı" —
  ikisi aynı anda ekranda olabildiği için ayrı durmak zorundalar. Müsaitlik'te
  ne bırakma var ne ret; ekranın söylediği tek şey açık/kapalı, ve çarpı onun
  kapalı yarısı. Tarama duruyor: renk tek başına durum taşımaz.
- **İmleç haçı.** Bir hücrenin üstüne gelince o hücrenin **satırı ve sütunu**,
  ayrıca saat başlığı ile öğretmen adı birlikte aydınlanır. 78 sütunluk bir
  haftada yerini kaybetmemenin tek yolu ve babanın göz sorununa doğrudan cevap.
  Kapalı saat taramasını **örtmez** (nerede olduğunu söyler, neden
  kullanılamadığını değil) ve sürükleme başlayınca **söner** — orada ızgaranın
  kendi üç rengi konuşur. `src/gridChrome.ts`, saf DOM, React state'e dokunmaz
  (tuzak 1'in deseni). Ölçülen maliyet: **0,148 ms / sütun değişimi**, 16,7 ms'lik
  kare bütçesinin %1'inden azı.
- **Gün bandı.** Tek indeksli günler çok hafif bir zemin alır (ΔE 2,7). Amaç
  gruplamak; bir *durum* gibi okunmaması ölçülerek sabitlenir. Saat başlığında ders numarası ve altında
  başlangıç saati (`3` / `10:40`).
- **Görünüm iki yazısız simge düğmesi**: Öğretmen / Sınıf. Seçili olan vurgulu,
  diğeri soluk. `aria-label` zorunlu — metin yok, erişilebilir ad onların tek adı.
  Yanındaki açıklama cümlesi kalır: simge yalnız başına ilk seferde tahmin ettirir.
- Sayaç 0 ise adım soluk. **Kilitli sihirbaz değil** — her adıma her an atlanır.
- **Renk sayı değil, RENK seçilir.** Satır başındaki düğme rengin kendisini
  gösterir; tıklayınca 36 rengin tamamı 6×6 bir `<dialog>`'da açılır, seçili
  olan çerçeveli. İndeks kaybolmadı — `State`'in sakladığı, yedeğin taşıdığı ve
  "iki öğretmen aynı renkte mi" sorusunun sorulduğu şey o — swatch'ın üstünde
  `--on-color` mürekkeple durur.
- **Haftalık saat girilir, dağılım SEÇİLİR.** aSc'nin `Lessons/week` + yanındaki
  liste ikilisi (`docs/Örnek Fotolar/Örnek saatlerin kombinasyonu göstergesi
  seçeneği.png`). Seçenekler saatten türer: 3 saat → `1+1+1` · `2+1`; 5 saat →
  `1+1+1+1+1` · `2+1+1+1` · `2+2+1`. Saat düşünce seçim kırpılır, ve dağılım
  değişince o dersin yerleşimleri kalkar (yerleşmiş blokların boyu artık yanlış).
- **Branş yazılmaz, seçilir.** Serbest metin "Matemtik"i sessizce ikinci bir branş
  yapıyordu ve kısaltması yine "Mat" çıktığı için kâğıtta ayırt edilemiyordu. Liste
  Ayarlar'da yönetilir; "+ Yeni branş…" ile oracıkta eklenir. **Kullanılan branş
  silinemez**, mesaj kimin kullandığını sayar.
- **Başlangıç saati iki açılır liste** (00–23 ve beşer dakika), `<input type="time">`
  değil: o girdi AM/PM'i tarayıcının yereline göre seçer ve boşaltılınca günü sessizce
  00:00'a alırdı.
- **Yazdırmada hangi sayfaların basılacağı tek tek seçilir.** Sınıf ve öğretmen için
  ayrı onay listeleri, "Tümü / Hiçbiri", ve düğmede **kâğıt** sayısı.
- **Bir A4'e 1, 2 ya da 4 program (2026-08-26).** `.print-sheet` **kâğıttır**
  (297×205 mm, `break-after` onun üstünde); `.print-page` **bir programdır** ve
  her ayarda öyle kalır — onu sayan yarım düzine test var ve adını değiştirmek
  hepsinin ne dediğini sessizce değiştirirdi. Kâğıttaki yazı boyutu **ayrı** bir
  ayar: düzen bir taban ölçek dayatır (`--p-fit`), okuyan onun üstüne kendi
  tercihini koyar (`--p-zoom`). İkisi de `.print-area`'da, `:root`'ta **değil**
  (tuzak 63).
- **ÖNİZLEME KÂĞIDIN KENDİSİDİR (2026-08-26).** Eskiden bir *modeliydi*: 62rem
  genişlik, A4'e yakın bir oran, ve satırları ekran merdiveninden alırken
  yazıcının 23 mm kullanması. Ölçülen fark önizlemede **~30 px**, kâğıtta
  **86,93 px** — yani basılacak şeyi seçen kişi bir çizimden seçiyordu. Kutu
  artık ikisinde de mm cinsinden **aynı kutu**; ekrana özel kalan tek şey
  kâğıdın *üstünde olmayan* şeyler: gölge, köşe yarıçapı ve sayfaların üstünde
  durduğu tepsi.
- **Sütun başlığında saat: uyuşmayan sütun BOŞ BIRAKILMAZ, ikisi de yazılır.**
  6. ders hafta içi 13:30, hafta sonu 13:10 başlar (öğle arası farklı yere
  düşer). Eski kural "yanlış saat yazmaktansa hiç yazma"ydı ve boş sütun bir
  **kusur** olarak okundu. `periodGroups()` her ders numarası için haftanın
  bütün farklı saatlerini ve hangi günlere ait olduklarını verir; başlık
  ikisini de gün aralığıyla yazar (`Sal–Cum 13:30–14:10` / `Cmt–Pzr
  13:10–13:50`). Uyuşan sütunlarda gün adı yazılmaz — on bir kez hiçbir şey
  söyleyip bir kez bir şey açıklamak açıklama değildir.
- **Basılan sayfanın başlığı iki satır**: büyük ve ortalı ana satır
  (`510 sınıfı — Haftalık ders programı`), altında küçük künye satırı
  (`Örnek Kurs · G dersliği`). Tek uzun sola yaslı satır kâğıtta başlık değil
  altyazı gibi okunuyordu. Tarih ve dosya yolu kâğıda **çıkmaz** (tuzak 31).
- **Eksen tutarlılığı.** Program ızgarasında sütun = gün × ders (babanın alışkanlığı).
  **Müsaitlik ve Yazdır'da satır = gün, sütun = ders** — ikisi de "bir günü okuma"
  ekranı, aSc'nin Time off penceresi de öyle.
- **Öğle arası, ekrana göre üç ayrı teknik.** Program ızgarasında dar bir ayraç
  SÜTUNU (ara konumu gün başına sabit); müsaitlik ve baskıda ara konumu satırdan satıra
  değiştiği için o satırın hücresine kalın kenarlık.
- **Yazdırma A4 YATAY**, `table-layout: fixed`, sütunlar eşit. Sütun başlığındaki saat
  yalnızca bütün günler uyuşuyorsa yazılır — kâğıtta yanlış saat yazmaktansa hiç yazmamak.
  Kenar boşluğu `@page`'te değil **sayfanın kendisinde** (`.print-page` padding'i);
  satır 23 mm ve sayfa sabit yükseklikli bir flex kutusu, yani plan dikey ortalanır.
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, sarı = uyarı,
  kırmızı = engel, gri taralı = kapalı, kırmızı çerçeve = kapalı saatte kalmış ders.
  Öğretmen rengi havuzdaki kartla satırı eşleştirmeye yarar.
- **Ekranda hücreyi daima ÖĞRETMEN rengi boyar**, iki görünümde de. Sınıf rengi
  bir *işaret*: satır başındaki nokta ve basılan sayfanın başlığı. İki renk aynı
  kareyi paylaşmaz.
  **KÂĞITTA öğretmen sayfası bunun İSTİSNASI (2026-08-26).** Bir öğretmenin
  kendi sayfasında her dolu hücre zaten o öğretmen: on iki hücre aynı pasteli
  boyar ve hiçbir şey söylemez. Orada değişen şey **sınıf**tır, ve okuyan da
  onu arar — o yüzden öğretmen sayfasının hücrelerini sınıf rengi boyar. Sınıf
  sayfası değişmedi: orada değişen şey öğretmendir.
- **Kapalı saat işareti KÂĞIDA ÇIKMAZ (2026-08-26).** Öğretmen sayfası her
  müsait olmayan saati bir çarpı ve gri taramayla işaretliyordu; duvara asılan
  bir kâğıt "saat 10:40'ta neredeyim" sorusuna cevap verir, ve çarpı kimsenin
  kâğıdı eline alıp sormadığı bir sorunun cevabıdır. Bilgi kaybolmadı:
  Müsaitlik'te düzenleniyor, Kontrol'de sayılıyor.
- **Havuz kartı görünümü takip eder.** Üst satır = ders yerleşince hücrenin okuyacağı
  şey, alt satır = kartın gideceği satır; sıralama alt satıra göre, ki bir satırın
  kartları yan yana dursun.
- **Açık ve koyu tema, sağ üstte düğme.** Öğretmen paleti iki temada da AYNI ve
  yazdırma her zaman açık palet kullanır — o renkler kâğıda basılıyor. Palet üstündeki
  mürekkep de tema ile dönmez (`--on-color`).
- **Düğme durumları:** birincil · sade · tehlikeli · basılı. Tehlikeli
  olan beklemeden kırmızı görünür — ama **mürekkeple**, kenarlıkla değil: 25
  öğretmenlik listede 25 kırmızı dikdörtgen, tehlike renginin sayfanın arka
  planı hâline gelmesi demekti. Kırmızı kenarlık hover'da geliyor.
- **Düğme kenarlığı `--line`, `--hairline` değil.** Girdiler Y0'da kıl çizgiye
  inebildi çünkü karşılığında gömük bir yüzey (`--paper-sunk`) kazandılar.
  Düğmenin öyle bir yüzeyi yok — zemini `--paper`, üstünde durduğu `.topbar` ve
  `.panel` de `--paper` — yani **kenarlık düğmenin tek sınırı**. Bu yüzden
  `--line`'ın tanımı "yalnız ızgara ve tablo başlığı" değil: **veri okunan
  yerler ve denetim kenarı**.
- **Ekran 1920x1080 varsayılır** (babanın 27" monitörü; CSS pikseli, fiziksel
  piksel değil). Öğretmen sütunu `sticky`, yatay kaydırma olacak: ızgara 2616px,
  yani 25 satırın 19'u ve sütunların bir kısmı ekrana sığar, gerisi kaydırılır.
- **Boş ekranlar yönlendirir.** "Henüz ders yok" değil, "Kurulum sekmesinden öğretmen
  ve sınıf ekleyin, sonra ders girin."
- **Silmeden önce her zaman onay**, ve metin ne kaybedileceğini sayar:
  "A dersliği silinecek. 4 sınıfın dersliği boşalacak (410, 411, 510, 511)…"

---

## Çalışırken

- Bir şey belirsizse **sor**, tahmin etme. Yanlış varsayımla yazılan kod, yazılmamış
  koddan pahalıdır.
- Bir sürümün **çıkma şartı** sağlanmadan sonrakine geçilmez.
- Özellikler iki kaynaktan önceliklenir: **babanın geri dönütü** ve
  [docs/ASC.md](docs/ASC.md). İkisi de yoksa yazılan şey hâlâ bir tahmindir —
  değişen kural "bekle" değil, **"nereden geldiğini söyle"**.

### Her oturumun sonunda — zorunlu

Bu bir istek değil, iş akışının parçası. Oturum bitmeden:

1. **`docs/TASKS.md`** — biten maddeler `[x]` işaretlenir, yeni çıkan işler eklenir,
   "ŞİMDİ SIRADA" bölümü bir sonraki oturumun ilk işini gösterecek şekilde yenilenir.
2. **`docs/STATUS.md`** — durum tablosu, ölçülen değerler, plandan sapmalar,
   doğrulanmayı bekleyen varsayımlar ve bilinen hatalar güncellenir. Tarih değişir.
3. **`CLAUDE.md`** — sadece *kalıcı* bir kural, karar veya tuzak ortaya çıktıysa.
   Günlük ilerleme buraya yazılmaz, o STATUS'ün işi.
4. **Dürüstlük şartı:** test edilmemiş bir şey "bitti" işaretlenmez. Kod yazıldı ama
   tarayıcıda doğrulanmadıysa STATUS'te bu açıkça yazar.
