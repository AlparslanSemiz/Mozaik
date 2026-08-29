# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti

Yeni bir bilgisayarda başlıyorsan önce [STATUS.md](STATUS.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

---

## ŞİMDİ SIRADA

> **v2.0.0 dil turu BİTTİ (2026-08-29): D5 · D6 · D7 ve YENİ AD.**
> Sözlük **9 anahtardan 814'e** çıktı ve arayüzün tamamını kapsıyor; dört
> sözlük var (en · de · es · fr); ilke 4 yeniden yazıldı; program artık
> **Mozaik**. **Şema değişmedi, yeni depolama anahtarı açılmadı** — ve bu
> turun en önemli cümlesi bu: `ders-programi*` anahtarları, yedek dosya
> adları ve `Belgelerim\Ders Programı` klasörü **kıpırdamadı**.
> Ayrıntı ve **ölçülen her sayı** [STATUS.md](STATUS.md) → *Otuz ikinci
> oturum*.
>
> **Bir sonraki oturumun ilk işi — SÜRÜM ÇIKARMAK.**
> `npm run yayinla -- 2.0.0`. Bu sürüm babanın makinesine iki şey taşıyor ve
> ikisi de kodda bekliyor: yeni ad ve beş dil. Etiketten önce
> `npm run kontrol` yeşil olmalı ve **hiçbir şey `dist/`'e dokunmamalı**.
> Yayınlandığında Release'in varlık adları da değişecek:
> `Mozaik.html` · `Mozaik-Windows-kurulum.zip` · `Mozaik.exe` · `surum.json`.
> Babanın makinesindeki `Ders-Programi.exe` bunu **yine de** alır: takas
> çalışan programın kendi dosya adı üstünden yapılıyor, adres
> `surum.json`'dan okunuyor.
>
> **Bu turun bıraktığı tek açık madde:**
> - [ ] **Bir testlik artık: "reload'dan sonra düşme".** Sebebin BİRİ bulundu
>       ve kod çıktı (`revealRibbon` `.main` yoksa sessizce dönüyordu), ama
>       beş tam koşunun ikisinde hâlâ **bir** test düşüyor — her seferinde
>       başkası, hep bir `reload`'dan sonra, tek başına koşunca geçiyor. İki
>       worker'la da düştü, yani salt aşırı yüklenme değil. Bir sürümü
>       durduracak bir kusur değil; bakılacak.
>
> **Sende kalanlar — kodda değil, ve üçü de geçen turdan devrediyor:**
> 1. **Windows'ta denensin.** `releases/latest/download/Mozaik.exe`. Bu
>    makinede ölçülemeyen dört şey aynı koşuda görülür: exe'nin kendini
>    gerçekten değiştirmesi, görev çubuğundaki ikon, SmartScreen'in ne
>    dediği, ve WebView2'nin yazdırma diyaloğu. **Yeni:** ilk kurulumda
>    `kur.ps1` eski adla duran kısayolu siliyor — o da orada görülecek.
> 2. **GitHub Pages hâlâ başkasına gidiyor.** `AlparslanSemiz.github.io`
>    deposunda Settings → Pages → Custom domain temizlenecek **ve** kökteki
>    `CNAME` silinecek. Kaldırmanın GameMetrix'i kırmayacağı ölçülmüştü.
> 3. **Babanın gerçek listesi** — hâlâ v0'ın çıkma şartı, ve hâlâ tek
>    bekleyen büyük şey.
>
> **DEPONUN ADI DEĞİŞMEYECEK.** `ders-programi` kalıyor ve bu kozmetik değil:
> `update.rs`'in `RELEASE_KOK`'u v1.4.0 kopyalarına **derlenmiş**. Depo
> yeniden adlandırılırsa babanın makinesindeki kopya bir daha hiç
> güncellenemez.

### V turu — dokuz madde — **BİTTİ ✅** (2026-08-27)

Kullanıcının TASKS'in en altına yazdığı dokuz satır. **Şema v7 → v8'e çıktı.**

- [x] **V0 `v1.3.0` yayınlandı.** TASKS "tek kalan adım push" diyordu ve
      yanlıştı: `main` çoktan itilmişti, gitmeyen şey **etiketti**. Sebep
      `yayinla.mjs` içinde bir kusurdu — bir `replace` çağrısının hiçbir şeyi
      değiştirmemesini "satır bulunamadı" diye okuyordu, ki bu tam da o
      dalın hizmet ettiği normal durumdur. Düzeltildi, dört durum ölçüldü.
      Release'in **dört** varlığı da 200: HTML · ZIP · **exe 3 664 896 bayt
      (Windows/WebView2)** · **`surum.json`, ilk kez**.
- [x] **V1 Çift branş — `schemaVersion` 8.** `Teacher.subject2` +
      `Lesson.second`. **Alt branş değil çift branş**, ve gerekçe kullanıcının
      kendi ikinci örneği: "Matematik 1/2" bir ağaçla anlatılabilir, "Türkçe
      ve Edebiyat" anlatılamaz. Yeni yaprak modül `src/subjects.ts`
      (`keys.ts` deseni). Ders branşın **adını değil bayrağını** tutuyor;
      `sanitize()` yetim bayrağı temizliyor. Göç koşulu kaldırılarak
      **kırmızıya döndürüldü**.
- [x] **V2 İki saatlik blok TEK kart.** `colSpan={2}`, etiket bir kez ve bir
      basamak büyük. **Öğle arasını aşan blok birleşmiyor** — ayraç sütunu
      `data-day` taşımaz (tuzak 13). `drag.ts` `data-span` okuyor, yoksa
      vurgunun geri kalanı sessizce boyanmıyordu.
- [x] **V3 Renklerin üstündeki sayılar kalktı.** İndeks **erişilebilir ada**
      taşındı; `--on-color` güvencesi metnin hâlâ olduğu yere (`.card`,
      `.pool-card`) taşındı ve sabotajla sınandı. Yan kusur ekran
      görüntüsüne **bakarak** bulundu: kutu yüksekliğini yazıdan alıyormuş.
- [x] **V4 Listelerde sıra numarası.** `#` sütunu, dört listede de tek
      kancadan (`useRowOrder`). **Görünen** sıra, dizinin indeksi değil.
- [x] **V5 Havuz kartının kırpılması.** Ölçüldü: **5,2px** dışarıda
      (2,2 kalkma + 2 outline + 1 offset), üst dolgu 0. Dolgu `--slide`
      üstünden türetildi.
- [x] **V6 Yoğunluk her yerde.** Liste satırı **57 → 34px**, katlanın
      üstünde **10 → 19**, Sınıflar 20/20. **Hiçbir yazı küçülmedi** — 12px
      sınırı duruyor ve test onu ölçüyor.
- [x] **V7 Açık ↔ koyu tema renk şeridi — ÖLÇÜLDÜ, kusur YOK.** Açık tema
      altı bölümün beşinde **daha güçlü** (5,53–7,31 ↔ 4,28–5,84). Koda
      dokunulmadı; zemin `renk.spec.ts` 80'de sabitlendi.
      *(İlk ölçüm yanlıştı: `contrast()` `oklab()` ayrıştıramıyor ve zemini
      siyah okuyordu — boyayıp piksel okununca tablo tersine döndü.)*
- [x] **V8 Sıralama yönü tuşu.** `ListQuery.desc`; karşılaştırıcı
      **negatifleniyor**, `reverse()` değil — kararlı sıralamada `reverse()`
      eşitleri de çevirirdi.
- [x] **V9 Dersler'de öğretmen ve sınıf süzgeci + dağılım katlanıyor.**
      `Facet.of` artık çok değerli. `patternLabel` 4 terimden sonra `10×1` /
      `3×2 + 4×1` yazıyor.
      *(Aynı turda ölçülerek reddedilen fikir: "çok değerli süzgeç açılır
      liste olsun" — 25 çip %110'da tek satır, uçurum yok, dal silindi.)*

> **Z turu bitti (2026-08-27): ders dağılımı, açık tema, örnek verinin yeri,
> branşlarda sıralama.** Kullanıcının dört maddesinin dördü de yapıldı ve
> **şema v6 → v7'ye çıktı** — `Lesson.blockSize` yerine `Lesson.pairs`.
> Ayrıntı ve **ölçülen her sayı** [STATUS.md](STATUS.md) → *Yirmi altıncı
> oturum*.
>
> - [x] **Ders dağılımı.** Haftalık saat girilir, sonra `1+1+1` / `2+1` gibi
>       bir dağılım **seçilir** (aSc'nin `Lessons/week` + yanındaki liste
>       ikilisi). Üç saatlik blok kalktı. Havuzda artık **blok başına kart**.
>       Yeni `src/blocks.ts`, yeni sözleşme `placedBlocks()`, çözücüde ders
>       başına **iki iş kalemi**, v6 → v7 göçü ve testleri.
>       **Ölçülen kazanç:** örnek okul artık **eksiksiz** diziliyor
>       (367/367 blok, havuzda 0) — eskiden blok boyuna bölünemeyen saatler
>       kalıcı olarak havuzda kalıyordu.
> - [x] **Varsayılan tema açık**, ve sistemi izlemiyor. Gerekçe ve hareket
>       ayarından neden farklı olduğu CLAUDE.md'de.
> - [x] **Örnek verinin evi Ayarlar → Veri.** Kurulum'da yalnız ilk kullanımda
>       tek satır; işlem yapılınca bir daha çıkmıyor
>       (`ders-programi-tanitim`, onuncu makine tercihi).
> - [x] **Ayarlar → Branşlar'da elle sıralama.** Beşinci liste; sıra
>       Öğretmenler adımındaki Branş listesine yansıyor.
>
> *(O turun bıraktığı açık madde — `e2e/gorunum.spec.ts:309`'un payı —
> **U6'da kapandı**: uydurma `+2` yerine ölçülen zemin kondu.)*

> **Y turu bitti (2026-08-26).** Kullanıcının on bir maddesi + üç liste kusuru
> karşılandı: `Sil` hizası, Öğretmenler listesinin yatay kayması, şerit-liste
> boşluğu, Müsaitlik'in çarpıları, kartın üstüne kart bırakma, bir A4'e 1/2/4
> program, kâğıttaki yazı boyutu, 6. saatin saatleri, sol sütun, gün sınırı,
> "Sayfada ne olsun"un kırpılan satırı, önizleme = çıktı, kâğıtta çarpı yok,
> ve öğretmen sayfasında sınıf renkleri. **Şema değişmedi.**
> Sayılar: 508 birim + 381 E2E + 6 site testi yeşil. Ayrıntı ve **ölçülen her
> sayı** aşağıda, **Y turu** bölümünde.

> **B turu bitti (2026-08-26).** Beş maddenin beşi de yapıldı, artı kalan
> tasklardan **4f**. Dal: `v1.1-kurulum`. Ayrıntı ve **ölçülen her sayı**
> [STATUS.md](STATUS.md) → *Yirmi ikinci oturum*.

> **G turu bitti (2026-08-27): kalan üçlü + `.exe`.** Ayrıntı
> [STATUS.md](STATUS.md) → *Yirmi üçüncü oturum*.
>
> Kalan üç kod maddesinin üçü de kapandı: **fontun ağırlık ekseni**
> (asıl engel eksen değil reçetenin yokluğuydu — `npm run font` yazıldı,
> `400:700` ölçülerek alındı, `300` ölçülerek reddedildi, ve beş kuralın
> sessizce 600 çizdiği gerçek hata kapandı), **görsel regresyon sorusu**
> (cevap: geri gelmiyor, ama `ekran`ın kendi deliği bir iddiayla kapandı) ve
> **4j belgeler**. Yanında A4 ile MCP satırları da `[x]` oldu.
>
> `.exe` **ayağa kalktı ve gerçekten çalıştı**: 4g ve 4h bitti, 4i'nin iş
> akışı yazıldı ama henüz koşmadı. Exe hiçbir kuralı kopyalamıyor —
> `src/desktop.ts` üç Tauri komutunu bir klasör tutamağı kılığına sokuyor,
> `saveInto()` olduğu gibi koşuyor. Kanıt: exe açıldı, **hiçbir şeye
> tıklanmadan** `~/Documents/Ders Programı/` altına iki dosya düştü.
> Sayılar: **521 birim + 394 E2E + 19 site + 7 çözücü + 6 Rust**, hepsi yeşil.
>
> **SIRADAKİ İŞ — üçü de KULLANICIDA, ve ikisi artık aynı gün yapılabilir:**
> 1. **`surum.yml` bir kez koşturulsun** (Actions → sürüm → Run workflow,
>    `yayinla` **işaretsiz**). Tek koşuda üç teslim dosyası da çıkar:
>    `Ders-Programi.html`, `Ders-Programi-Windows-kurulum.zip`,
>    `Ders-Programi.exe`. Üçü de babanın makinesinde denensin — bu makinede
>    ölçülemeyen her şey orada görülecek: WebView2, gerçek açılış süresi,
>    SmartScreen'in ne dediği, `Kur.cmd`, `.lnk` üretimi, PowerShell 5.1, ve
>    Belgelerim'e gerçekten yazıp yazmadığı.
> 2. **Tutuyorsa bir sürüm yayınlansın** (`git tag v1.1.0 && git push origin
>    v1.1.0`). O andan itibaren README'deki üç indirme bağlantısı çalışır ve
>    babaya `npm` anlatmak gerekmez. Bugün o bağlantılar 404 veriyor.
>    Kurulum klasörü yolu **kalıyor** (kullanıcı kararı, 2026-08-27):
>    hangisinin tuttuğuna baba kullandıktan sonra bakılır, ilke 5.
> 3. **GitHub Pages — açıldı, ama adres BAŞKASINA gidiyor.** Depo
>    `ders-programi` olarak yeniden adlandırıldı ve Pages kaynağı
>    "GitHub Actions" seçildi; `site #5` uçtan uca **geçti**. Kalan sorun
>    kodda değil: `AlparslanSemiz.github.io` deposunda commit'li bir `CNAME`
>    (`gamemetrix.me`) var ve GitHub Pages'te **kullanıcı sitesinin alan adı
>    bütün proje sayfalarını kapsıyor**, o yüzden
>    `alparslansemiz.github.io/ders-programi/` Cloudflare'daki GameMetrix'e
>    yönleniyor ve 404 veriyor.
>    **Kaldırmanın GameMetrix'i kırmayacağı ölçüldü** (o site `server:
>    cloudflare`, `x-github-request-id` yok — Pages'ten bağımsız).
>    **Kullanıcıda kalan:** `AlparslanSemiz.github.io` deposunda Settings →
>    Pages → Custom domain'i temizle **ve** kökteki `CNAME` dosyasını sil
>    (dosya commit'li olduğu için yalnız ayarı temizlemek geri gelmesine
>    açık). Sonra adres `https://alparslansemiz.github.io/ders-programi/`.
>
> Ondan sonra hâlâ bekleyen tek büyük şey: **gerçek veriyle deneme**
> (babanın listesi) — v0'ın çıkma şartı.

### F turu — elle sıralama · baskı seçenekleri · cinsiyet — **BİTTİ ✅** (2026-08-26)

Kullanıcının listesi: *"Listelerde kendimiz sürükleyerek sıralama özelliği.
Yazdır kısmında açıp kapatma opsiyonları her yazılan şey için kurs yazılsın mı
saat yazılsın mı çıktı saati yazılsın mı vb. Öğretmende cinsiyet + elle
sıralamayı da yapalım."*

Dört karar soruldu ve cevaplandı: sıralama/süzgeç açıkken tutamak **pasif** ·
baskı seçenekleri **sağdaki panelde ve kalıcı** · cinsiyet **listede + sıralama
ve süzme + Kurulum özetinde**, kâğıda çıkmaz.

- [x] **F1 Elle sürükleyerek sıralama — dört listede de.** `src/rowDrag.ts`
      (saf DOM pointer jesti, `poolSplit.ts` deseninin **dördüncüsü**) +
      `reorderList()` (`entities.ts`, saf) + `useRowOrder()` (dört listenin
      ortak kancası). Tutamak **kendi sütununu** alır (tuzak 47) ve klavyeyle
      de çalışır (ok · Home · End), taşıma `role="status"` ile söylenir.
      **Şema değişmedi:** dizinin kendisi sıra; `parseState` onu koruyor,
      `sanitize` ona dokunmuyor. Payoff liste değil ızgara: Program'ın satır
      sırası, Yazdır'ın sayfa sırası ve Müsaitlik'in seçicisi hepsi aynı diziyi
      `map`'liyor.
- [x] **F2 Havuz sırası ızgarayı takip ediyor.** `buildPool` kartları satır
      etiketine göre **alfabetik** diziyordu; elle sıralanmış bir ızgarada bu
      "kartını bulmak için yukarı doğru avlanmak" demekti. Artık satır
      **indisine** göre. Yorumun kendi niyeti ("bir satırın kartları yan yana
      dursun") korundu.
- [x] **F3 Yazdır — "Sayfada ne olsun".** `src/printOptions.ts`, beş anahtar
      (`school · credits · clock · stamp · cellBottom`), **tek** localStorage
      anahtarı `ders-programi-baski`. `theme.ts`'e girmedi ve gerekçesi yazıldı:
      oradaki dokuz skaler ilk boyamadan önce `<html>`'e öznitelik yazan düzen
      değerleri; bunlar render anında React prop'u olan **tek bir karar**.
      **Çıktı tarihi yeni bir öge** (`.p-stamp`) ve **kapalı başlıyor** — açık
      gelseydi paneli hiç açmamış birinin çıktısı değişirdi.
- [x] **F4 Öğretmende cinsiyet — `schemaVersion` 6.** `Gender = '' | 'k' | 'e'`,
      alan adı **İngilizce** (`gender`). Göç: `version === 5` okuyucunun
      koşuluna **açıkça** eklendi — eklenmeseydi bugünkü sürümün yazdığı her
      yedek `null`'a düşerdi. Beş test bunu koruyor ve koşul kaldırılarak
      **kırmızıya döndürüldü**, bedava yeşil değil. Yapıştırma kutusu dördüncü
      sütunu okuyor, üç sütunlu eski yapıştırma bozulmuyor.
- [x] **F5 `listview.ts` facet'i ÇOĞULLAŞTI.** Liste başına tek çip satırı
      vardı; cinsiyet ikincisini gerektirdi. `facets: Facet[]` +
      `query.facets: Record<id, value>`; iki çip satırı **birlikte daraltıyor**,
      ve bir satırın sayıları **öteki uygulanmışken** alınıyor.
- [x] **F6 Liste tablosu artık KENDİ kutusunda kayıyor.** F4'ün açığa
      çıkardığı, ondan eski bir hata: `width: 100%` bir tabloda on bir sütun
      %150 ölçekte sığmıyor ve tarayıcı odayı **küçülebilen** sütundan alıyor.
      Ölçülen: ad kutusu 232px → **26px**, branş kutusu okunmaz. `.table-scroll`
      + `min-width: max-content` + kontrollere `ch` cinsinden taban.
      Ölçülen sonuç: %150'de ad **283px**, sayfa yatay taşması **0**.
      Üç yeni E2E ölçüyor ve kaydırma kutusu kapatılarak kırmızıya döndürüldü.

### E turu — hareket ayarı · şerit standardı · koyu tema · baskı — **BİTTİ ✅** (2026-08-27)

Kullanıcının listesi: *"Animasyonları kapatma ya da azaltma seçeneği olsun
ayarlarda. Yazdır kısmında da alt şeritte simgeler olsun. Ayarlardaki alt şeritte
de semboller olsun. Kalan taskları yap. E2E testlerini ayarla. playwright
testlerini ayarla. Küçük düzeltmeler varsa yap. Koyu temada sıkıntı var mı bak
varsa düzelt ve koyu temayı daha da koyulaştır siyahları. Sectionların Alt
şeritlerini de bir standarta uygun hale getir simetrik olsun. Yazdır kısmında
önizlemedeki tablo biraz daha büyük ve görünür olabilir. Satırlar biraz daha
uzun olabilir."*

Dört karar soruldu ve cevaplandı: hareket **üç basamak** · koyulaştırma
**belirgin** · **Kontrol'e de şerit** · baskıda **yalnız ekran** değişsin.

- [x] **E1 Hareket ayarı (`tam · az · kapalı`).** Ayarlar → Görünüm'de dördüncü
      panel + komut paletinde bir komut. Dokuzuncu makine tercihi
      (`ders-programi-hareket`, `data-motion`), `State`'e girmez.
      **Asıl iş CSS'teydi:** süreler tek yerden kısılıyordu ama **mesafeler**
      her kuralda elle yazılıydı, ve 0 ms'lik bir geçiş hareketi durdurmaz —
      **ışınlar**. Dört yeni token: `--slide` · `--sweep` · `--press` · `--pop`
      (tuzak 57). **Makine tercihi bir TABAN, ayar onu ezemez** (tuzak 58);
      kayıt yoksa tercih sistemden türetilir. 3 birim + 7 E2E.
- [x] **E2 Şerit standardı — beş kural, altı sekme.** Beş şerit beş ayrı
      nesneydi. Şimdi: hepsi başlıkla açılır · `Sep`/`Spacer` ile bölünür · her
      düğmede **simge VE kelime** · hepsi `--ribbon-h` yüksekliğinde. **Yazdır
      ve Ayarlar ilk kez simge aldı**; üç varlık türü istisnasız `KIND_ICON`'dan
      (Yazdır dahil), gerisi lucide (14 yeni simge, +11,6 KB). Yeni dosya
      `e2e/serit.spec.ts` — 10 test, beş kuralı da ölçüyor, %100 ve %150'de.
- [x] **E3 Kontrol'ün şeridi ve süzgeci.** Karar değişti: Kontrol'de şerit
      **yoktu** ve o yüzden o sekmeye her girişte altındaki her şey **45px
      zıplıyordu**. Şerit raporu süzüyor (`Hepsi · Sorunlar · Kapasite`) ve
      sağ ucunda `N engel · N uyarı` diyor. Süzgeç `toolState`'te (tuzak 18);
      `buildReport` tam koşuyor, yani şeritteki sayı panellerle ayrışamaz.
- [x] **E4 Koyu tema koyulaştırıldı — ölçülerek.** Bütün düzlemler bir tam
      basamak indi. Yanında iki gerçek onarım: `--band` ΔE 4.67 → **2.45**
      (açık temayla aynı yük; gün bandı bir DURUM gibi okunuyordu — tuzak 40'ın
      diğer yüzü) ve `--muted`/`--closed` kontrastı 4.69 → **5.71**. `--shadow`
      ikiye ayrıldı (`--shadow-shell`): yapışkan başlığın gölgesi kabuk
      düzlemindedir ve koyu zeminde %35 siyah hiçbir şeydir. Eşikler
      `renk.spec.ts` ve `izgara.spec.ts`'te **sıkılaştırıldı**, ikisi de dün
      kırmızı olurdu.
- [x] **E5 Baskı önizlemesi — yalnız ekran.** Kâğıda tek bayt dokunulmadı.
      Ekranda `.print-page` bir **sayfa**: A4 yatay oranında taban, gölge,
      yuvarlak köşe, 62rem tavan; satır 30px → **3.25rem** (%110'da 57px).
      `@media print` süslerin hepsini geri alır ve `yazdir.spec.ts` ikisini
      birden ölçer.
- [x] **E6 Küçük düzeltmeler.** `.reason-bar`'a `role="status"` +
      `aria-live="polite"` — erişilebilirlik sözleşmesi bu satırı adıyla anıyordu
      ve satırda **yoktu**. `README.md` yazıldı (iki satırdı). `npm run gorsel`
      referansları belgelerde tarih olarak işaretlendi. Bayat yorumlar
      düzeltildi (`theme.ts` "beş skaler" → dokuz, `Appearance.tsx` "altı düğme"
      → on bir, `styles.css`'in `startViewTransition` öneren yorumu).
- [x] **E7 Doğrulama.** 453 birim + 318 E2E + 6 site = **777, hepsi yeşil**;
      `npm run cozucu` 7/7 (bir gerileme **yakaladı**: `'■ Durdur'` adı).
      `npm run ekran` iki temada 17 görüntü — ve **bakıldı**, bir görüntü bomboş
      çıkıyordu (tuzak 59). Ölçüm: `dist` **501 685 bayt**, açılış **65 ms**
      medyan / 84 ms en kötü.

### D turu — tasarım kısıtları kaldırıldı, arayüz baştan kuruldu — **BİTTİ ✅**

Kullanıcı kararı (2026-08-26, üç kez tekrarlandı): *"Claude.md ya da Design.md ya
da Plan.md ya da bambaşka design noktasındaki kısıtlamaları kaldır ve sil onları.
ardından uygulamamızı/sitemizi en güzel UX'li en güzel UI'lı hale getir."*

Sorulan üç sınır ve cevapları: **estetik + bağımlılık yasağı** kalksın ·
**kontrast/erişilebilirlik testleri kalsın, düzen testleri gitsin** · kapsam
**her şey (akış ve gezinme dahil)**. Sonra Faz 3'ten sonra durulup gösterildi ve
kullanıcı **"daha cesur olsun"** dedi.

- [x] **D0 Belgelerden kısıtlar silindi.** CLAUDE.md'nin ~290 satırlık "Tasarım
      sistemi" bölümü → 68 satırlık **"Tasarım — serbest"**. Geriye dört
      sözleşme kaldı (işlevsel renk kanalı · erişilebilirlik · kâğıt fiziksel ·
      ilke 1–3). `docs/DESIGN.md` boşaltıldı, `docs/PLAN.md`'nin tasarım
      ifadeleri bağlayıcı olmaktan çıkarıldı. Bağımlılık yasağı da kalktı.
- [x] **D1 Test sözleşmesi yeniden çizildi.** Silinen: `gorsel.spec.ts` + 24 PNG
      + `npm run gorsel`, `sutun.spec.ts`, `duzen.spec.ts`'in geometri yarısı
      (→ `kabuk.spec.ts`), `renk-secici.spec.ts`'in sığma yarısı,
      `izgara.spec.ts`'in Sığdır↔havuz takası. C10'un bıraktığı **24 kırmızı**
      da kapandı; ikisi gerçek hataydı (`library.ts` iki anahtarı saymıyordu;
      `renk.spec.ts` koyu temada DOM hakkında yanılıyordu).
- [x] **D2 Bağımlılıklar — ölçülerek.** Alınan: `lucide-react` (+3,4 KB),
      `@radix-ui/react-{dialog,dropdown-menu,tooltip,popover}` (+123,3 KB).
      **Alınmayan: `motion` (+127,2 KB)** — CSS'in yapamadığı tek getirisi
      tarayıcının `startViewTransition()`'ında bedava. **Tailwind da alınmadı.**
- [x] **D3 Görsel dil.** OKLCH'ten türetilmiş nötr rampa (tek hue 258), kot 2→5,
      yarıçap 3→5, tipografi 6→9 basamak, hareket 110/180/280 ms + üç eğri,
      **üçüncü yoğunluk "Ferah"**, ölçek varsayılanı **%100 → %110**.
      Yol boyunca bir regresyon ölçümle bulundu: %110'da Sığdır haftayı
      sığdıramaz oldu, tabanı **kartın üst satırı** koyuyordu (tuzak 37'nin
      yöntemiyle tek tek kapatılarak bulundu).
- [x] **D4 Cesur tur** (kullanıcı kararı). Seçili sekme bölüm rengiyle **dolu**,
      accent elektrik indigo (#373bdb), masa derinleşti, başlıklar büyüdü.
      Renk sözleşmesinin tek eşiği gevşetilmedi.
- [x] **D5 Diyaloglar.** 12 `window.confirm` + 5 `window.alert` → tek
      `useDialogs()`. `deletionSummary` ikiye bölündü (`deletionQuestion`),
      tek-string hâli ve testleri **aynen** duruyor. `Toasts` elde yazıldı
      (Radix Toast 19,6 KB ve eylem taşımayan toast'a gerekmiyor).
      `src/Root.tsx`: duman testi artık **gerçek** ağacı çiziyor.
- [x] **D6 Varlık paneli** — kullanıcının doğrudan istediği şey. `entityWeek` +
      `entityFacts` (saf, testli), `Inspector.tsx` çizer. Izgarada satır
      başından ve üç listeden açılıyor. Asıl test: panelin çizdiği hafta
      **ızgaranın çizdiği haftanın aynısı**.
- [x] **D7 Listelerde ara · sırala · süz** — iki kez istenmişti. `listview.ts`
      saf: `fold()` Türkçe katlama (`'İ'.toLowerCase()` bir birleşik nokta
      üretiyor — testte önce **bug'ın kendisi** gösteriliyor), `compareTr()`,
      `applyList()`, `facetCounts()`. Dört listenin de üstünde aynı şerit.
- [x] **D8 Müsaitlikte saat ayarı** (varsayılan **kapalı**, istendiği gibi) +
      **Program'da "Programı boşalt"** (adıyla istenmişti).
- [x] **D9 Komut paleti (Ctrl+K), durum çipi ve klavye.** Palet 6 destinasyon +
      eylemler + her varlık; bir varlığı seçmek panelini açıyor.
      Çip her sekmede ve sorunu **adlandırıyor**. `Alt+1..6`.
      Ölçümle bulunan hata: çip eklenince %150'de son sekmeler kendi kutusundan
      taşıyordu (tuzak 48).
- [x] **D10 Doğrulama ve ölçüm.** `npm run kontrol` yeşil: **450 birim +
      277 E2E + 6 site**. Ve **ilke 7 artık varsayım değil**:
      `dist/index.html` 489 815 bayt, `file://` açılışı **73 ms medyan**
      (7 koşu), imleç haçı 0,391 ms/sütun.
- [x] **D11 Belgeler.** `docs/DESIGN.md` yeni CSS'ten yeniden yazıldı (envanter,
      kural değil). CLAUDE.md'ye dört yeni tuzak (**48–51**).

### Kalanlar — bu turdan çıkan, henüz yapılmamış

- [x] **Öğretmende cinsiyet alanı ve elle sürükleyerek sıralama.** **F turunda
      yapıldı** (2026-08-26). Cinsiyet `schemaVersion` 6 istedi ve aldı; elle
      sıralama **istemedi** — dizinin kendisi zaten sıra, ayrı bir indeks
      ikinci bir gerçek olurdu.
- [x] **Fontun ağırlık ekseni — 400–700, ve 300 ÖLÇÜLEREK reddedildi (2026-08-27).**
      Asıl engel eksen değil **reçetenin yokluğu**ydu: 23 KB'lik woff2 kimsenin
      yeniden üretemediği bir eserdi, o yüzden içindeki karar donmuştu (tuzak
      69). `scripts/font.mjs` + `scripts/font-source/` (kaynak yüz depoda, OFL
      1.1) → `npm run font`.
      **Kaynak değişti ama METRİK değişmedi:** 225 karakterin 225'inde de
      ilerleme birebir aynı (`'0'` = 600/600), yani `ch` merdiveni kıpırdamadı
      (tuzak 39 güvende).
      **Ölçülen eksen maliyeti:** `400:700` **+1 060 bayt** · `350:700` +7 880 ·
      `300:700` +8 600. Aşağı yarısı sekiz katı ve `styles.css` 300'ü **hiç**
      istemiyor → ilke 5, alınmadı.
      **Kapatılan gerçek hata:** beş kural `font-weight: 700` istiyordu ve yüz
      600'de kırpılı olduğu için beşi de sessizce 600 çiziyordu — **üçü kâğıtta**
      (tuzak 70). Ölçüm: `'0'` glifinde 600↔700 nokta farkı **0.0 → 406.5**;
      tarayıcıda eski yüzde `600=1042 700=1042`. `temel.spec.ts` 46'ya yeni test,
      eski yüz geri konularak **kırmızıya döndürüldü**.
- [x] **Görsel regresyon yerine ne konacak? — CEVAPLANDI (2026-08-27).**
      Cevap iki parçalı ve ikincisi yazıldı.
      (a) **Geri gelmiyor.** 24 referans kullanıcı kararıyla silindi ve yerine
      geçen şey zaten var: erişilebilirlik ölçümleri **anlam** ölçüyor (WCAG
      kontrastı, CIE Lab ΔE, erişilebilir ad), piksel değil. Bir ΔE eşiği
      yeniden düzenlenen bir panelden etkilenmez; bir PNG referansı etkilenir.
      (b) **Ama `ekran`ın kendi deliği kapatıldı.** "Bakan kimse yoksa ne
      yakalar" sorusunun dürüst cevabı *hiçbir şey*di, ve katmanın kendi
      arızası tam olarak buydu: bomboş bir PNG üretip sessiz kalmak.
      `ekran.spec.ts` artık **tek bir iddia** taşıyor — deklanşör anında
      `.main` ve her `.panel` tam opak. Tasarım hakkında hiçbir şey söylemiyor,
      "bir şeyin resmi çekildi" diyor. `settled()` çıkarılarak kırmızıya
      döndürüldü: `panel opacity=0.00`, yani yaşanan hatanın ta kendisi.
- [x] **`npm run cozucu` `kontrol`'e ALINDI (2026-08-26).** Ölçüldü: **34,8 sn**,
      7/7 yeşil. `kontrol` zaten ~3 dakika, yani maliyet **%19**; karşılığında
      "hepsi" diyen komut gerçekten hepsini koşuyor. Gerekçe bu turda tazelendi:
      Yazdır'ın düğmesi `"Yazdır (N sayfa)"` → `"N kâğıt"` oldu, ve tam olarak
      bu tür bir ad değişikliği `cozucu`'nun daha önce yakaladığı gerilemeydi.
      Ayrı komut olarak da duruyor (elle koşmak için).

---

### Tasarım sistemi turu (A0–A6 + B) — BİTTİ ✅

Kullanıcının aşağıdaki numaralanmamış listesi bu tura dönüştü. Çerçeve
`CLAUDE.md` → **"Tasarım sistemi"**; iki yasak kalktı, gerekçeleri
`CLAUDE.md` → **"Değişmez ilkeler — güncelleme"**. Her aşamadan sonra durulup
onay alınıyor. **Görsel referansların hepsi bu turda kırılacak; en sonda tek
seferde yenilenecek — ara aşamalarda `npm run gorsel` çalıştırılmıyor.**
Sayı 22 değil **24**: A1'de `12-ayarlar-gorunum` sahnesi eklendi.

- [x] **A0 Hedef ekran 1366×768 → 1920×1080.** Baba 27" monitör kullanıyor.
      Üç Playwright config; `ekran`/`gorsel` `...base` yaydığı için kendiliğinden
      miras aldı. Viewport değişince 228/228 geçti — asıl risk kırmızı değil,
      **bedava yeşil**di; ölçüldü ve üç iddiadaki yalan sayı düzeltildi
      (`visibleRows 9→18`, `scrollLeft 1200` → sona kaydırma + `room > 200`).
      Hiçbir test silinmedi: 1920×1080'de 6 satır hâlâ katlanın altında.
      `STATUS.md`/`TASKS.md`'deki tarihsel rakamlara dokunulmadı.
      Ayrıntı: [STATUS.md](STATUS.md) → *On ikinci oturum*
- [x] **Y0 Yüzey ve çizgi ayrımı.** Yeni token seti + `--hairline` / `--line`
      ayrımı: kabuk çizgisi 10 kuralda kıl çizgiye indi, veri çizgisi 5 yerde
      kaldı, `table.list/stat`'ın `th`+`td` ortak kuralı ikiye bölündü. Girdiler
      kenarlık yerine **gömük yüzey** (`--paper-sunk`). `.panel.inset`
      kenarlıksız. Gövde `--fs-base`, ızgara `--lh-tight`.
      **Verilen setten üç sapma** (korunan `--shadow`, koyu/baskı bloklarına iki
      token, `--muted` AA düzeltmesi) — gerekçeleri STATUS'te
- [x] **A1 Tipografi merdiveni.** 44 ham px `font-size` → **0** (kalan tek px
      merdivenin çapası, `:root`). `--space-*`/`--cell-*`/`--rail-w` rem'e,
      radius 19 bildirimden 2 değere (`3/6px` — CLAUDE.md'nin yazdığı değerler;
      Y0 sehven 4/8 yazmıştı), ve **Ayarlar → Görünüm** açıldı: %100–%125, altı
      düğme, `localStorage['ders-programi-olcek']`, `State`'e girmiyor.
      Izgara `--ui-scale`'e bağlandı (A5 silindiği için ikinci eksen yok);
      **baskı bağlanmadı** — kâğıt kendi merdivenini aldı (`--fs-p-*`, pt).
      Ölçülen: ızgara %100'de 2616 px, yani rem'e geçiş **piksel kaymasi
      üretmedi**. Ayrıntı: [STATUS.md](STATUS.md) → *On üçüncü oturum*
- [x] **A2 `ch` birimi + inline genişliklerin kaldırılması.** 29 tane
      `style={{ width: N }}` → **0**, ve CSS'teki son iki ham px genişlik
      (`.num` 70, `.text-sm` 90) de `ch`'ye geçti. Altı basamaklı **sütun
      merdiveni** (`--w-col-xs … --w-col-2xl`, `8/10/13/16/26/32ch`).
      `paletteColor()` dönen dinamik `background`'a dokunulmadı.
      **Kural netleşti:** kutu genişliği kutunun kendisine verilir (gövde ch'si),
      sütun genişliği `<th>`'ye (başlığın ch'si) — aynı 70px için 8ch ve 10ch.
      `e2e/sutun.spec.ts`: kaynakta inline genişlik kalmadığı, altı basamağın da
      ölçekle **tam 1.25** büyüdüğü ve dokuz ekranda hiçbir metnin kırpılmadığı.
      Eski px değerleri geri konup **kırmızıya döndürüldü** (6 test).
      Ayrıntı: [STATUS.md](STATUS.md) → *On dördüncü oturum*
- [x] **A5 GERİ GELDİ + A2b birlikte yapıldı** (kullanıcı kararı: "önce A5'i
      geri getir"). Ayarlar → Görünüm'e ikinci bir ayar: **Rahat / Sığdır**.
      Sığdır tam olarak **bir** şeyi düşürüyor ve hangisi olduğu **ölçülerek**
      bulundu: ders numarasının altındaki başlangıç saati. İlk teşhis (kartın
      alt satırı) **yanlıştı** — onu gizlemek tabloyu 1 px oynatmadı; saati
      gizlemek 2461 → **1728 px** yaptı. Sonuç: 1920×1080'de yatay kaydırma
      788 px → **0**, hiçbir kart kırpılmadan. `--cell-w` artık kutudan
      türetiliyor (`clamp` + `100cqw`), sütun sayısı markup'tan geliyor
      (`--lesson-cols`/`--break-cols`) çünkü hafta her zaman 6×12 değil.
      Tercih `localStorage['ders-programi-yogunluk']`, `State`'e girmiyor,
      "Veriler nerede" tablosuna eklendi. Tuzak 37 düzeltildi.
- [x] **A3 Font ve görsel karakter — B turunda yapıldı.** IBM Plex Sans,
      **değişken** yüz (wght 400–600'e kırpılmış), 225 glife alt kümelenmiş,
      **23 KB ham → base64 gömülü**. Ölçülen boyut: `dist/index.html`
      **347 → 379 KB**, sınır 420 KB. `<link>` yok, derlemede ağ yok, yeni npm
      bağımlılığı yok. `font-display: block` (tuzak 38)
- [x] **A4 Dialog ve renk seçici — TAMAMI yapıldı (B turu + 2026-08-27).** Renk seçici
      **6×6 swatch `<dialog>`'u oldu**: 36 rengin hepsi görünüyor, seçili olan
      çerçeveli, indeks swatch'ın üstünde `--on-color` ile duruyor.
      `e2e/renk-secici.spec.ts` **yeniden yazıldı, silinmedi** — gereksinim
      aynı ("seçili renk okunuyor"), kontrol değişti; üstüne "36 renk GÖRÜNÜYOR
      ve seçilebiliyor" testi eklendi (iki tema × iki ekran).
      **Kalan:** 12 `confirm` + 5 `alert`'ün `<dialog>`'a geçmesi ve
      `.reason-bar`'a `aria-live` — B turu dışında bırakılmıştı.
      **`aria-live` 2026-08-27'de yapıldı** (E6): `role="status"` +
      `aria-live="polite"`.
      **KAPANDI (2026-08-27):** `src/` grep'lendi — `window.confirm` /
      `window.alert` çağrısı **sıfır**; her biri `useDialogs()`'un
      `await confirm/alert`'i. Madde artık `[x]` ve yalnız tarih.
- [x] **A6 Doğrulama — B turunda yapıldı.** `npm run kontrol` yeşil
      (409 birim + 265 E2E + 6 site). `renk.spec.ts`'in WCAG/ΔE eşikleri
      **gevşetilmedi**; yeni token seti onları geçmek zorunda kaldı ve geçti.
      24 baseline `--update-snapshots=all` ile tek seferde yenilendi (tuzak 25).
      ~~**Kalan:** README~~ → **yazıldı 2026-08-27** (E6).
- [x] **Kullanıcıya sorulan iki soru — ikisi de cevaplandı (on üçüncü oturum).**
      (a) `.btn` → `--line`, **`--hairline` değil**: düğmenin kendi yüzeyi yok
      (`--paper` üstünde `--paper`), kenarlık tek sınırı. Asıl gürültü
      `.btn.danger`'ın kırmızı kenarlığıydı; o kalktı, kırmızı **mürekkep**
      kaldı. (b) baskı `--ui-scale`'den **etkilenmiyor** — kâğıt sabit fiziksel
      boyut; ölçüldü (%100 ve %125'te punto birebir eşit, PDF 3 ↔ 3 sayfa)
- [x] **A5 ızgara anlamsal zoom** — bir kez silinip **geri getirildi**
      (2026-08-25). Yukarıdaki maddede yapıldı. Numara aynı kaldı çünkü aynı
      özellik: STATUS ve commit mesajlarındaki "A5 silindi" atıfları o günün
      kaydı olarak duruyor, yanıltıcı değil.

### Tasarım araçları kuruldu + tasarım dili yeniden açıldı — 2026-08-25

Kullanıcının "olması gereken her şey" listesi. Listenin bir kısmı projenin
kendi kurallarıyla çatışıyordu; **çatışma bildirildi, kullanıcı tasarım dilini
yeniden açmayı seçti.** Karar `CLAUDE.md` → *"Tasarım dili yeniden AÇILDI"*.

- [x] **`typescript-language-server` 6.0.0** global kuruldu, `$PATH`'te
- [x] **`.mcp.json`** — `playwright` · `chrome-devtools` · `context7`.
      Üçü de npm'de doğrulandı (0.0.79 / 1.8.0 / 4.0.3). Hiçbiri
      `dist/index.html`'e girmez; bütçe daralırsa ilk kapatılacak `context7`
- [x] **`.claude/settings.json`** — `enabledPlugins`:
      `frontend-design` + `typescript-lsp` (`@claude-plugins-official`)
- [x] **`docs/DESIGN.md`** — primitif envanteri: 70+ sınıf, hangi ekranda,
      hangi token merdiveninden. Amaç var olan `.panel`'i yeniden icat etmemek
- [x] **`CLAUDE.md`** — üç blok: primitif envanteri + dış araç, görsel iş akışı
      (iki aşamalı prompt + ekran görüntüsü döngüsü), ve tasarım dili kararı.
      "Karakter" paragrafı **silinmedi**, bağlayıcı olmadığı işaretlendi
- [x] **Eklentiler kuruldu — 7 tane, `project` kapsamı, hepsi `enabled`.**
      `anthropics/skills` marketplace'inin **tamamı** (kullanıcı isteği):
      `document-skills` · `example-skills` · `claude-api` · `academy-guide` ·
      `discernment-nudge`, artı resmi `frontend-design` + `typescript-lsp`.
      Toplam 19 skill, `~/.claude/plugins/` altında 81 MB. VSCode eklentisinin
      **gömülü `claude` ikilisi** kullanıldı (`$PATH`'te yok ama
      `resources/native-binary/claude` var)
- [x] **MCP sunucuları onaylandı** — `playwright` · `chrome-devtools` ·
      `context7` üçü de oturumda kullanılabilir durumda (2026-08-27'de
      doğrulandı)
- [x] **Budama bitti — 7 → 3, kalan ~2.249 tok/oturum.** Kalanlar:
      `example-skills` (12 skill) · `document-skills` (4 skill) ·
      `typescript-lsp` (~0 tok). Kaldırılanlar ve gerekçeleri
      [STATUS.md](STATUS.md) → *On beşinci oturum*; hepsi `claude plugin
      details`in verdiği **ölçülen** maliyetle karara bağlandı,
      `discernment-nudge` ise skill dosyası okunarak (kendi "when not to"
      listesi bu projeyi dışlıyor + kapanış satırı İngilizce sabit)

- [x] **B turu — yeniden tasarım. YAPILDI (2026-08-25).** Ayrıntı:
      [STATUS.md](STATUS.md) → *On altıncı oturum*. Kullanıcının dört kararı:
      kapsam **C** (düzen de değişti), yazı tipi **IBM Plex Sans**, ölçek
      varsayılanı %100 kaldı / tavan **%150**, UX maddelerinden yalnız **renk
      seçici**. Yapılanlar: üç düzlem token seti · gömülü değişken font ·
      üç bölgeli üst çubuk + tema raya indi · **ızgara enstrümanı** (kafes
      kalktı, gün bandı, imleç haçı, nesne olan kartlar) · **havuz sağa
      çekmece** (25/25 satır görünüyor) · 6×6 renk seçici · ölçek tavanı %150.
      Bilerek geri alınanlar: "üçüncü radius yok" (→ üç), "yüzüyorsa yanlıştır"
      (→ iki kot). Yeni tuzaklar **38–41**.
      *(Aşağıdaki asıl madde tarih olarak duruyor.)*

- [x] **B turu — yeniden tasarım. (asıl madde)** Tasarım dilinin
      açılması yeniden tasarımın *yapıldığı* anlamına gelmez. Bu tur
      başlamadan önce `CLAUDE.md` → *"Görsel iş akışı"*ndaki iki aşama
      **zorunlu**: plan → öz eleştiri → onay → kod. Kapsamı kullanıcı
      belirleyecek. Bilinen etkiler:
      - A0–A5'te yazılan sistemin bir kısmı geri alınacak
      - 24 görsel referans yenilenecek (`--update-snapshots=all`, tuzak 25)
      - `renk.spec.ts` WCAG/ΔE ölçümleri yeni değerlere göre geçecek —
        **sınır gevşetilmeyecek, tasarım düzeltilecek** (A6'daki kural aynen)
      - Açılmayanlar: ilke 1–3, yeni runtime bağımlılığı ("önce sor",
        Tailwind/shadcn dahil), ölçülen testler, işlevsel renk kanalı, kâğıt

**A3 (gömülü font) bu kararla genişledi:** artık yalnız IBM Plex Sans değil,
tipografi karakteri de tartışmaya açık. 420 KB durma sınırı **duruyor** —
o bir ilke 1 kısıtı, zevk kısıtı değil.

### 0. v1.0 — teslim turu (`.exe` · site · planlar) — YENİ

Kullanıcının bu dosyanın sonuna yazdığı altı satır, sırayla numaralanmış hâli.
Dal: `v1.0-teslim`, madde başına bir commit, her commit `npm run kontrol` yeşilken.
*(4b ve 4c tek commit'te: taslak ayrı bir varlık değil, aynı veri şeklindeki bir
bayrak — ayırmak bir sonraki commit'te sökülecek geçici bir şekil yazmak olurdu.)*

**SIRADAKİ İŞ: 4f — GitHub Pages yayını.** Tasarım turu (A0–A6 + B) bitti;
`npm run kontrol` yeşil ve 24 görsel referans yenilendi. Teslim turunda
4f–4i (Pages · Tauri · exe) ve 4l (Dosya Sistemi Erişimi) duruyor.
**Kullanıcıdan bekleniyor:** depo `ders-programi` olarak yeniden adlandırılacak,
Pages kaynağı "GitHub Actions" seçilecek, Rust toolchain onayı.

Tasarım turundan devreden **iki** iş, ikisi de bilerek ertelendi:
`<dialog>`'a geçmemiş 12 `confirm` + 5 `alert` (A4'ün yarısı). README
2026-08-27'de yazıldı.

*(Aşağıdaki v1.0 turu notu olduğu gibi duruyor.)* Kullanıcının bu dosyanın
sonuna yazdığı liste o tura dönüştü; listenin *sıralama ve süzme* maddeleri
henüz numaralanmadı ve **en az biri şema değişikliği istiyor** (öğretmende
cinsiyet alanı yok), en az biri yasak listeye bakmayı gerektiriyor (elle
sürükleyerek sıralama). Tasarım turundan sonra
**4f**: GitHub Pages yayını (`.github/workflows/site.yml`). Site derlemesi
hazır ve çevrimdışı çalıştığı ölçüldü; eksik olan yalnız yayınlama adımı.
**Kullanıcıdan iki şey bekleniyor:** depo `ders-programi` olarak yeniden
adlandırılacak ve Pages kaynağı "GitHub Actions" seçilecek.

4e ile birlikte gerçek bir http kaynağı doğdu, yani **4l** (Dosya Sistemi
Erişimi API'si) artık yazılabilir — 4d'de bilerek ertelenmişti, çünkü `file://`
altında o API hiç yok ve sitesiz hâlde E2E'de tek satır kanıt üretilemezdi.

Verilen kararlar (2026-08-25): planlar **depo katmanında** tutulur (`State`
şeması değişmez, göç yok) · exe ile site **ortak bir `.json` dosyası** üzerinden
aynı veriyi gösterir, sitede Dosya Sistemi Erişimi API'siyle otomatik yazma ·
site GitHub Pages'te yayınlanır, **depo `ders-programi` olarak yeniden
adlandırılacak** (kullanıcı yapacak).

- [x] **4a Çözücü kurallar sıkılaşınca çökmüyor.** Turun önüne alındı: babanız
      kural kutularına bir sayı girdiği gün otomatik dizme çalışmaz hâle
      geliyordu. 3/359 blok → **241/359, 241 düğüm, 43 ms**. Ayrıntı:
      [STATUS.md](STATUS.md) → *Sekizinci oturum*
- [x] **4b Plan kitaplığı** — yapıldı. `src/library.ts` (yaprak modül: `State`'i
      bilmez, ham string alıp verir). **Devralma tek bayt kopyalamıyor**:
      `planKey('1') === 'ders-programi'`, yani mevcut program yerinde kalıyor ve
      `ders-programi` okuyan yedek zinciri + E2E yardımcıları değişmedi.
      Üst çubukta seçici, Ayarlar → Veri'de yönetim, geçişte geri-al sıfırlanıyor.
      Ayrıntı: [STATUS.md](STATUS.md) → *Dokuzuncu oturum*
- [x] **4c Taslaklar** — yapıldı. Taslak = `PlanInfo.draft` bayrağı, ayrı varlık
      değil. "Taslak olarak kaydet" yerleşimleri atarak kopyalıyor; yeni plan
      üç yoldan açılıyor (Boş · Bu planın kopyası · Taslaktan); Kurulum'un boş
      ekranı taslakları listeliyor
- [x] **4d Veriler nerede + toplu dosya** — yapıldı. Ayarlar → Veri artık
      **gerçek anahtar adlarını ve gerçek boyutları** yazıyor (`storageReport`),
      ve `src/bundle.ts` ile **bütün planlar tek dosyaya** giriyor
      (`bundleVersion: 1`, `ders-programi-tumu-…json`). Eski tek plan dosyaları
      (v1–v5) aynen okunuyor; üst çubuğa paket verilirse **reddedilip yol
      gösteriliyor** — bir paketi açmak bütün kitaplığın yerine geçmek demek.
      Yeni depolama anahtarı yok, şema değişmedi. Ayrıntı:
      [STATUS.md](STATUS.md) → *Onuncu oturum*
- [x] **4e Site derlemesi + PWA** — yapıldı. `npm run build:site` →
      `dist-site/` (364 KB: tek dosya + manifest + `sw.js` + simgeler).
      `dist/index.html`'e tek bayt dokunulmadı ve **dokunulamaz**:
      `vite.config.ts`'e `publicDir: false` kondu. Site de tek dosya —
      service worker'ın kabuğu böylece bir **sabit**, üretilen bir liste değil.
      Manifest/simge/kayıt betiği yalnız site derlemesinde, bir
      `transformIndexHtml` eklentisiyle ekleniyor. Ölçülen: fiş çekilince site
      yine açılıyor, çevrimdışı girilen veri yeniden yüklemeden sonra duruyor;
      SW kaydı silinince aynı yükleme `ERR_INTERNET_DISCONNECTED` ile düşüyor
      (yani test boş değil). Ayrıntı: [STATUS.md](STATUS.md) → *On birinci oturum*
- [x] **4f GitHub Pages yayını — YAPILDI (2026-08-26).**
      `.github/workflows/site.yml`: `npm ci` → `build:site` →
      `upload-pages-artifact` → `deploy-pages`. Ayrı bir tip adımı yok
      (`build:site` zaten `tsc --noEmit` ile başlıyor). İş akışının kendi
      kontrolü — `dist-site/index.html` ikinci bir betik istemiyor — yerelde
      de koşturuldu. **İş akışının kendisi burada koşturulamaz.**
      Yan ürün, listeleyerek bulundu: `publicDir` `site/`'ın tamamını
      kopyaladığı için üç logo adayı yayınlanan siteye giriyordu;
      `dropStudio()` çıkarıyor.
      **Kullanıcıda kalan iki adım:** depo `ders-programi` olarak yeniden
      adlandırılacak, Pages kaynağı "GitHub Actions" seçilecek
- [x] **4g Tauri kabuğu — YAPILDI (2026-08-27).** `src-tauri/` (Cargo.toml ·
      build.rs · tauri.conf.json · capabilities/default.json · main.rs ·
      lib.rs). Pencere "Ders Programı", 1600×1000, ikon `kurulum/icon.ico`'dan
      (iki çizimli .ico yeniden kullanıldı, ikinci bir kopya yok).
      `frontendDist: ../dist` — yani exe'nin içindeki sayfa **babanın çift
      tıklayacağı dosyanın ta kendisi**, dört teslim yolunda tek arayüz.
      **Yeni runtime bağımlılığı yok**: `withGlobalTauri` + `window.__TAURI__`,
      `@tauri-apps/*` npm paketi **yok** (tuzak 19). Rust tarafında da plugin
      yok — `tauri` ve `std::fs`, o kadar.
      **`--no-bundle`, ve bu bir ilke kararı:** NSIS hedefi kurulum sihirbazı
      üretir, ilke 1 tam olarak onu reddediyor. Teslim tek bir `.exe`.
      Rust yerelde kuruldu (1.98.0) ve **gerçekten derlendi**.
- [x] **4h exe kendiliğinden yazıyor — YAPILDI (2026-08-27).**
      `Belgelerim/Ders Programı/`, `ders-programi-tumu.json` + günün yedeği,
      son 10 gün. Hiçbir tıklama, hiçbir izin, hiçbir seçici yok.
      **Kural kopyalanmadı, ADAPTÖR takıldı:** `folder.ts` hâlâ dosya
      adlarının, günlük yedeğin ve budamanın tek evi; `src/desktop.ts` üç
      Tauri komutunu bir `FileSystemDirectoryHandle` kılığına sokuyor ve
      `saveInto()` exe'de **olduğu gibi** koşuyor. Rust'ta yalnız tarayıcıda
      karşılığı olmayan şey var: hangi klasör + `safe_name` kapısı.
      Yazım **atomik** (tmp + rename): ilke 6, yarım JSON olamaz.
      `storageKind()` üçüncü branch'ini aldı (`'exe'`) — `library.ts`'in
      kendi yorumu bu anı öngörmüştü — ve "Veriler nerede" artık exe'de
      **başka bir şey** söylüyor, çünkü orada "taşınan tek şey dosyaya
      kaydettiğinizdir" yalan olurdu.
      **UÇTAN UCA KANITLANDI:** exe çalıştırıldı, hiçbir şeye tıklanmadan
      `~/Documents/Ders Programı/` altında iki dosya belirdi (`bundleVersion 1`,
      `schemaVersion 6`). Açılıştan ilk yazıma **986 · 1053 · 1149 ms**.
      Testler: 3 birim (`desktop.test.ts` — gerçek `saveInto()` adaptör
      üstünde) + 5 E2E (`exe.spec.ts`) + 6 Rust (`cargo test`).
- [~] **4i Windows `.exe` — iş akışı yazıldı, HENÜZ KOŞMADI.**
      `.github/workflows/surum.yml` (eski adı `exe.yml`; **üç** teslim
      dosyasını birden üretecek şekilde genişletildi, çünkü `npm run …`
      çalıştırmadan indirilebilecek hiçbir şey yoktu). Üç iş:
      `paket` (ubuntu — HTML + kurulum zip'i, artı BOM/CRLF/ASCII denetimi),
      `exe` (windows — `cargo test` + `tauri build --no-bundle`),
      `yayinla` (üçünü bir GitHub Release'e ekler).
      Elle tetiklenince varsayılan olarak **yalnız derler**; `v*` etiketiyle
      yayınlar. **Kabuk denetimleri yerelde koşturuldu** ve ilk hâli yanlıştı:
      `grep` UTF-8 bir yerelde BOM'u eşleştiremiyor, `od`'a çevrildi ve bozuk
      dosyalarla kırmızıya döndürüldü.
      **Bu makinede ölçülen (Linux/WebKitGTK, Windows/WebView2 DEĞİL):** sürüm
      ikilisi **3,64 MB**, derleme 1 dk 38 sn.
      **Kalan:** iş akışı bir kez koşturulmalı ve çıkan exe babanın
      makinesinde denenmeli. SmartScreen notu da o zaman yazılacak — imzasız
      exe'de Windows "bilinmeyen yayıncı" der
- [x] **4k Baskı turu** — babanın gerçek yazdırma önizlemesinde gördükleri.
      Tarayıcının üst/alt bilgisi (sol üstte tarih, sol altta dosya yolu)
      `@page { margin: 0 }` ile kalktı — kenar boşluğu 10 mm padding olarak
      `.print-page`'e taşındı, sütun genişlikleri değişmedi. Başlık iki satır
      oldu: büyük ortalı ana satır + küçük künye satırı. Satırlar 20 → 23 mm ve
      sayfa sabit yükseklikli bir flex kutusu (`safe center`), yani plan dikey
      ortalanıyor. E2E 223 → 228; kanıt olarak `displayHeaderFooter: true` ile
      PDF üretilip **gözle okundu**. *Kullanıcı "baskıdaki program daha da
      büyüsün" dedi — yeni listeye girdi, aşağıya bakınız*
- [x] **4l Dosya Sistemi Erişimi API'si — B4 olarak YAPILDI (2026-08-26).**
      Dosya değil **klasör** seçiliyor (`showDirectoryPicker`): bütün planlar
      + her gün için bir yedek, tek bir soruyla. Ayrıntı aşağıda, B4
- [x] **4j Belgeler — KAPANDI (2026-08-27).** 4b+4c ve 4d ile birlikte ilerledi: yasak liste daraltıldı
      ("birden çok program sürümü" → **aynı planın** sürüm ağacı, gerekçesiyle),
      `library.ts` ve `bundle.ts` mimari şemaya girdi, depolama anahtarı tablosu
      ile **dosya biçimleri** bölümü yazıldı, tuzak 28–30 eklendi (ve iki kez 27
      numaralanmış tuzaklar düzeltildi), test sayıları güncellendi. 4e ile
      **ilke 2'nin yeni hâli** de yazıldı (statik yayın var; backend, veritabanı,
      hesap yok) ve tuzak 31–32 eklendi.
      **Son parça 2026-08-27'de yazıldı:** "Üç derleme hedefi" → **DÖRT**;
      exe'nin `frontendDist`'inin `../dist` olduğu, `--no-bundle`'ın bir ilke
      kararı olduğu ve exe'nin kural kopyalamayıp adaptör taktığı anlatıldı.
      `desktop.ts` ve `scripts/font.mjs` mimari haritaya girdi, komut listesine
      `font`/`exe`/`exe:test` eklendi (ve **neden `kontrol`'ün parçası
      olmadıkları** yazıldı), tuzak 69–71 eklendi

### 1. Babanın gerçek verisiyle deneme

**v0'ın çıkma şartı tek bir şeye bağlı: gerçek veri.** Araç artık kendi tarafında
hazır — 407 birim + 237 E2E + 6 site testi yeşil, üç arayüz turu (v0.7, v0.8, v0.9) bitti ve
program kendi kendini dizebiliyor. Elde veri olmadan yazılacak her yeni özellik
tahmin olur (ilke 5).

> **O hata kapandı (2026-08-25, madde 4a).** Kurallar sıkılaştırılınca çözücü
> 3/359 bloğa düşüyordu; artık 241/359'u 43 ms'de diziyor ve yerleşemeyene
> somut bir cümle yazıyor. Yani aşağıdaki "öğretmen sınırları sorulsun" maddesi
> artık güvenle sorulabilir: babanız o kutulara bir sayı girdiğinde otomatik
> dizme çalışmaya devam eder.

- [ ] Gerçek öğretmen/sınıf/derslik/ders listesi alınsın (Excel'e yazdırıp yapıştırma
      kutusuna yapıştırmak en hızlısı)
- [ ] **Gerçek gün ve zil düzeni teyit ettirilsin**: Pazartesi gerçekten ders yok mu,
      öğle arası hafta içi 5. hafta sonu 6. dersten sonra mı, 12 ders mi
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en fazla/en az
      kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor ve **öyle kalacak** (2026-08-24
      kararı): branş kısaltmasının aksine bunun “doğru cevabı” okuldan okula değişir.
      Yanlış bir varsayılan hücreleri sessizce kırmızıya boyar ve babanız sebebini
      anlamaz. 0 = kural hiç tetiklenmez; sayı girilince açılır
- [ ] Bir haftalık program baştan sona dizilsin → **v0'ın çıkma şartı**
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?
- [ ] **Branş listesi teyit ettirilsin**: gömülü 21 ad geliyor; okulun gerçekten
      verdiği branşlar hangileri, listeden ne çıkarılacak (artık Ayarlar → Branşlar'dan
      düzenlenebiliyor)
- [ ] **36 rengi gözle sor**: dizerken iki satırı karıştırdığın oldu mu? ΔE eşiği
      sayıyı garanti eder, gözü değil
- [ ] **Otomatik dizmenin çıktısı KULLANILIR mı, sorulacak.** Yasal olduğu ölçülüyor
      (19 dünyada, her blok `blocker()`'dan geçiyor); *iyi* olduğu ölçülmüyor. Sorular:
      sınıfın günü içinde boşluk (pencere) kalıyor mu, öğretmen okula gereksiz gün
      geliyor mu, günler dengeli mi. Cevaba göre v2 (kalite) şekillenir
- [x] **Sıkışık veride çözücü ne yapıyor?** 2026-08-25'te ölçüldü. Geri sarma artık
      dört dünyada gerçekten çalışıyor (`erken-saat-tuzagi` 201 düğüm / 9 blok,
      `derin-geri-sarma` 8362 / 12, `derslik-darbogazi` 57 929 / 8). Cevap iyi değil:
      gerçek ölçekte tıkanınca bütçeyi doldurup neredeyse hiçbir şey dizemiyor
- [ ] **Kenar çubuğu dar mı geniş mi kullanılıyor?** 92px varsayılan; babanın
      daraltıp daraltmadığı, ızgarada 92px'in eksikliğinin hissedilip hissedilmediği

### 2. Tauri ile `.exe` — ayrıntılar (madde 4g–4i)

Babanın makinesi **Windows 10** → Tauri v2 destekliyor, yol açık.
WebView2 bu makinede kurulu (151.0.4129.101). **4g ve 4h 2026-08-27'de bitti;
aşağıdaki liste artık yalnız Windows'ta görülecek olanları sayıyor.**

- [x] **Rust toolchain kuruldu (2026-08-27)** — rustup, `rustc 1.98.0`.
      Yanında Fedora paketleri: `webkit2gtk4.1-devel` (2.52.5) ·
      `libsoup3-devel` (3.6.6) · `gtk3-devel` (3.24.52). Bunlar **Linux**
      derlemesi için; Windows'ta hiçbirine gerek yok (WebView2 işletim
      sistemiyle geliyor)
- [x] **Otomatik günlük yedek — YAPILDI (4h).** Ad `ders-programi-YYYY-AA-GG.json`
      (tahmin edilen `program-…` değil: `folder.ts`'in zaten kullandığı kalıp,
      çünkü budama o kalıba göre yapılıyor ve ikinci bir kalıp ikinci bir kural
      olurdu). Son 10 gün. Tarayıcı yolunda da aynı kod koşuyor
- [x] **Web sürümü bozulmadan derleniyor** — `npm run kontrol` çıkış kodu 0
      (2026-08-27). Exe hiçbir şey eklemedi: `dist/index.html`'e giren tek
      yeni şey `desktop.ts` ve `isDesktop()` köprü yokken `false` dönüyor
- [x] **E2E web sürümünde koşmaya devam ediyor** — 394 test yeşil. Üstüne
      `exe.spec.ts`'in son testi bunu **açıkça** koruyor: köprü yokken aynı
      dosya hâlâ bir tarayıcı sayfası (Klasör seç düğmesi yerinde, "Veriler
      nerede" tarayıcı cümlesini söylüyor)
- [~] **`.exe` boyutu ve açılışı — LINUX'ta ölçüldü, Windows'ta değil.**
      Sürüm ikilisi 3 742 584 bayt (3,64 MB), derleme 1 dk 38 sn, açılıştan
      diske ilk yazıma 986 · 1053 · 1149 ms. **Windows/WebView2 başka bir sayı
      verecek** — orada yeniden ölçülecek
- [ ] **Yazdırma Tauri penceresinde çalışıyor mu** (WebView2 yazdırma
      diyaloğu). Linux'ta denenmedi çünkü ölçülecek olan WebKitGTK'nın
      diyaloğu olurdu, babanın göreceği şey değil. A4 yatay ve `@page
      { margin: 0 }` orada da tutuyor mu — Windows koşusunda bakılacak
- [ ] **SmartScreen**: imzasız exe'de Windows "bilinmeyen yayıncı" der. README'ye
      tek cümlelik yol yazıldı (*"Daha fazla bilgi" → "Yine de çalıştır"*), ama
      **ekranın gerçekte ne dediği görülmedi** — görülünce cümle düzeltilecek
- [ ] **`bundle.icon` `--no-bundle` ile ikonu gömüyor mu**, ölçülmedi. Windows
      koşusunda exe'nin ikonuna bakılacak: sade değil **ayrıntılı** çizim
      görünmeli (48 px ve üstü)

---

## BİTENLER

### 0. Belgeler ✅

- [x] `Claude.md` (yanlışlıkla konmuş boş Access veritabanı) silindi
- [x] `CLAUDE.md` · `docs/STATUS.md` · `docs/TASKS.md`
- [x] `docs/PLAN.md` kararlara göre güncellendi; tuzak 11–13 eklendi

### 1. İskele ✅

- [x] `package.json` — runtime yalnızca react + react-dom
- [x] `vite.config.ts` — singlefile, `base: './'`, modulePreload polyfill kapalı
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] Komutlar: `dev` · `test` · `test:e2e` · `build` · `kontrol`
- [x] **Çıkma şartı:** tek dosya `dist/index.html` (253 KB), **sıfır ağ çağrısı**

### 2. Çekirdek mantık ✅ — 26 test

- [x] `src/types.ts`, `src/constraints.ts` (`buildIndex`, `blocker`, `validHours`,
      `blockStart`, `place`, `removeBlock`, `countPlacedHours`, `sanitize`)
- [x] Beş sert kısıt, hepsi somut Türkçe mesaj veriyor
- [x] Bitişik blok ayrımı ve cascade silme dahil test edildi

### 3. Durum yönetimi ✅

- [x] `useReducer`, geri al/ileri al (30 adım), **Ctrl+Z / Ctrl+Y**
- [x] Metin kutusundayken Ctrl+Z kapılmıyor
- [x] localStorage otomatik kayıt (400 ms gecikmeli) + kapanışta anında yazma
- [x] Açılışta yedek zinciri kaydırma (son 3 oturum)
- [x] Yedek indir / yükle / Sıfırla; bozuk JSON'da çökmüyor
- [x] **Kayıt çalışmıyorsa kalıcı kırmızı uyarı** (sessiz veri kaybı olmasın)
- [x] `src/sample.ts` — gerçek ölçekte deterministik örnek veri

### 4. Kurulum sekmesi ✅ — 17 test

- [x] Gün/saat düzeni, derslik/öğretmen/sınıf/ders listeleri
- [x] `src/import.ts` — Excel yapıştırma, **önizlemeli**
- [x] Metin kutuları `defaultValue` + `onBlur`
- [x] Silme cascade + ne kadar şeyin gideceğini söyleyen onay

### 5. Müsaitlik sekmesi ✅

- [x] 7 × 12 ızgara, sürükleyerek toplu boyama (tek geri-al adımı)
- [x] Gün/saat başlığından toplu değiştirme, tümünü aç/kapat
- [x] Yük > müsaitlik ise anında uyarı

### 6. Program ızgarası ✅

- [x] Satır = öğretmen, sütun = 7 gün × 12 saat, sabit başlıklar
- [x] Blok gösterimi (`rowspan` yok), tıkla → blok tamamen kalkar
- [x] Kart havuzu, öğretmen renginde, `yerleşen/toplam` sayaçlı
- [x] Satırlar `React.memo`

### 7. Sürükle-bırak ✅ — gerçek tarayıcıda doğrulandı

- [x] Pointer Events; geçerli hücreler sürükleme başında bir kez (0,18 ms)
- [x] `pointermove` sırasında React state güncellenmiyor
- [x] Blok kadar hücre birden vurgulanıyor, Esc iptal, `pointercancel` temizliği
- [x] **Hedef satır sürükleme başlarken görünür alana kaydırılıyor** *(E2E hatası)*
- [x] **Kenar otomatik kaydırma, yalnızca imleç ızgaranın içindeyken** *(E2E hatası)*

### 8. Yazdırma ✅

- [x] Sayfa başına bir sınıf / bir öğretmen, 7 sütun × 12 satır, A4 dikey
      *(v0.7'de eksen döndü ve sayfa A4 yatay oldu — BİTENLER 13, madde 1j)*
- [x] `print-color-adjust: exact`, üst çubuk gizleniyor, yatay taşma yok

### 9. Kontrol sekmesi (v0.5) ✅ — 8 test

- [x] Öğretmen / sınıf / derslik kapasitesi, sıkışıklık uyarısı
- [x] Yerleşemeyenler, en sık sebebiyle
- [x] Sorun yoksa net "Sorun görünmüyor"

### 11. Kod dili İngilizceye çevrildi ✅ — 2026-08-24

Arayüz Türkçe kaldı, tek bir kullanıcı metni değişmedi. Güvenlik ağı: değişiklikten
önce 83 test yeşildi, sonra 90 test yeşil.

- [x] Tipler: `Durum`→`State`, `Ogretmen`→`Teacher`, `Sinif`→`ClassGroup`,
      `Derslik`→`Room`, `Ders`→`Lesson`, `yerlesim`→`placements`,
      `musaitDegil`→`unavailable`, `ayar`→`settings`, `blok`→`blockSize`
- [x] Dosyalar: `constraints.ts` · `feasibility.ts` · `import.ts` · `entities.ts` ·
      `store.ts` · `drag.ts` · `sample.ts` · `types.ts` · `components/` (`Grid`,
      `Setup`, `Availability`, `LessonPool`, `Check`, `Print`, `Program`)
- [x] Yorumlar İngilizceye
- [x] Kullanıcıya görünen metinler Türkçe kaldı; metne göre eleman bulan E2E
      satırları değişmedi
- [x] CSS sınıfları ve değişkenleri İngilizceye (`.grid`, `.drop-ok`, `.target-row`,
      `--color-N`…); `data-gun/saat/satir` → `data-day/hour/row`; `#kok` → `#root`.
      `drag.ts` ve E2E seçicileri birlikte güncellendi
- [x] **`schemaVersion` 2**, `parseState` içinde v1 göç kodu. `id`'ler değişmediği
      için `unavailable`/`placements` anahtarları olduğu gibi taşınıyor
- [x] Göç iki yerde test edildi: birim (`store.test.ts`) **ve** gerçek tarayıcıda
      "Yedek yükle" yolundan (E2E) — babanın elindeki her yedek v1
- [x] **İstisna:** `localStorage` anahtarı ve indirilen yedeğin dosya adı Türkçe
      bırakıldı; onlar kod değil, kullanıcı verisinin kimliği

### 10. Testler ✅ — 159 test *(v0.7 sonunda 228)*

- [x] 133 birim testi (`constraints`, `feasibility`, `import`, `sample`, `store`,
      `bell`, `rules`, `entities`, `App` duman testi)
- [x] **26 E2E testi** (Playwright, gerçek Chromium, `file://`, 1366×768)
- [x] `file://` altında `localStorage` çalıştığı doğrulandı
- [x] Gerçek ölçekte hız ölçüldü (sürükleme başlangıcı 0,212 ms)

### 12. v0.6 — zil saatleri, gün seçimi, müsaitlik, kurallar ✅ — 2026-08-24

Babanın aSc ekran görüntülerinden (`docs/Örnek Fotolar/`) çıkarıldı. Şema **v2 → v3**.

- [x] `src/bell.ts` — zil saatleri hesaplanır (başlangıç + ders/teneffüs/öğle arası dk).
      Varsayılan 09:00 · 40 · 10 · 30; hafta içi 5., hafta sonu 6. dersten sonra ara;
      **iki desende de 12. ders 19:10'da biter** (testte açıkça iddia ediliyor)
- [x] Gün seçimi checkbox'a döndü; varsayılan hafta **Pazartesisiz 6 gün** (Salı–Pazar).
      Her günün öğle arası ayrı seçilebilir
- [x] `remapDays()` — gün listesi değişince anahtarlar **isimden** eşlenip taşınır.
      Pazartesi kaldırılınca programın bir gün öne kayması engellendi (PLAN tuzak 14)
- [x] Sınıf ve derslik müsaitliği; üçü de tek `unavailable` sözlüğünü paylaşıyor
- [x] `src/rules.ts` — art arda en fazla · günde en fazla · günde en az ·
      bir dersin günlük sınırı. Her biri Kapalı / Uyar / Engelle
- [x] Okul geneli varsayılan + öğretmen/ders bazında istisna (`null` = varsayılan)
- [x] `check()` → `{ blocked, warning }`; sürüklemede üçüncü renk (sarı) ve
      `.reason-bar.warn`. Bırakmayı yalnızca `blocked` durdurur
- [x] Kontrol sekmesine **Kural ihlalleri** bölümü (`findViolations`), `minPerDay`
      yalnızca burada yakalanır
- [x] Sınıf/derslik kapasitesi artık kapalı saatler düşülerek hesaplanıyor
- [x] Izgara başlığında ders saati, öğle arasında kesikli ayraç; yazdırmada
      `09:00–09:40` sütunu ve okul adı
- [x] `keys.ts` ayrıldı — `constraints.ts` ↔ `rules.ts` çalışma zamanı döngüsü yok
- [x] **v3 göçü** `parseState` içinde (v1 → v2 → v3 zinciri), birim **ve** gerçek
      tarayıcıda "Yedek yükle" yolundan test edildi
- [x] `shortDay()` — `Cuma`/`Cumartesi` ikisi de "Cum" olmuyor (PLAN tuzak 15)

---

### 13. v0.7 — Arayüz turu ✅ — 2026-08-24

localhost'ta gerçek gözle ilk denemede çıkan liste. Mantık ve veri modeli zaten
sağlamdı; kusurların hepsi görünüş ve kullanım tarafındaydı. Dal:
`v0.7-arayuz-turu`, madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **1a Koyu tema + tema düğmesi.** 16 ham renk kaçağı CSS değişkenine çekildi;
      `:root[data-theme='dark']` yalnızca anlamsal değişkenleri yeniden tanımlıyor;
      `color-scheme` iki temada da doğru kuruluyor. Öğretmen paleti ve üstündeki
      mürekkep dönmüyor; `@media print` her şeyi açık palete sabitliyor. Tercih
      `localStorage['ders-programi-tema']`'da, `State`'e girmiyor
      → *Ölçüm sırasında AÇIK temada iki AA kusuru bulundu ve düzeltildi:
      `--ok` kendi zemininde 4,19:1, kapalı hücredeki "×" 4,20:1 idi.*
- [x] **1b Kurulum yedi adıma bölündü.** `Setup.tsx` 1132 satırdı →
      `components/setup/` altında kabuk + adımlar. Sayaçlı, numaralı şerit; kilitli
      sihirbaz değil. Aynı geçişte testsiz iş mantığı `entities.ts`'e taşındı
      (`addClassesFromRows`, `addLessonsFromRows`, `weeklyLoad`, `hourLabels`)
- [x] **1c Öğle arası ızgarada ayraç sütunu oldu**, zil önizlemesine ara satırı
      eklendi (her desen kendi yerinde). Ayraç `data-day` taşımıyor
- [x] **1d Müsaitlik döndürüldü**: satır = gün, sütun = ders. `shortDay` Pazar →
      `Pzr`. `bell.ts` → `sharedPeriods()` (uyuşmayan saat yazılmaz)
- [x] **1e Kısaltma otomatik**: `makeShort()` tek eve taşındı, `addTeacher` boş
      kısaltmayı addan üretiyor, çakışma uyarısı adları sayıyor
- [x] **1f Yedek düğmeleri** "Dosyaya kaydet / Dosyadan aç"; "Sıfırla" ayrıldı;
      açıklama satırı Program sekmesinde gizli (ızgaradan bir satır götürüyordu)
- [x] **1g Görsel cila**: hizalama, `:focus-visible`, dört düğme durumu, satır içi
      stiller sınıflara, `--space-1..5` ölçeği, `Field` bileşeni
- [x] **1h Silme onayı dört varlıkta da her zaman**, metin ne gideceğini sayıyor
      (`deletionSummary`, 7 testli)
- [x] **1i Branş kısaltmaları — şema v3 → v4.** Yalnızca değiştirilen saklanıyor;
      göç birim **ve** gerçek tarayıcıda "Dosyadan aç" yolundan doğrulandı
- [x] **1j Baskı A4 yatay, eşit sütunlu, eksen dönmüş.** PDF'in MediaBox'ı
      ölçülüyor (842×595 pt)
- [x] **1k Görünüm iki simge düğmesi**, seçili basılı (`aria-pressed`/`aria-label`)
- [x] **1l Testler**: 133 → **177 birim**, 26 → **51 E2E**. Renk kontrastı ve renk
      ayrımı hesaplanarak ölçülüyor (WCAG + CIE Lab ΔE). `npm run ekran` iki temada
      beş ekran görüntüsü üretiyor
- [x] **1m Belgeler**: `CLAUDE.md` (şema v4, arayüz, mimari, tuzak 13–15),
      `docs/PLAN.md`, `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kural sayılarına varsayılan konmadı (0 = sınır yok kaldı) —
doğru cevabı okuldan okula değişir, yanlış varsayılan hücreleri sessizce kırmızıya
boyar (2026-08-24 kararı).

---

### 14. v0.8 — ikinci arayüz turu ✅ — 2026-08-25

localhost'ta gerçek gözle **ikinci** denemede çıkan liste. Dal: `v0.8-arayuz-turu-2`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **2a Palet 12 → 36 renk, CSS'ten TS'e.** Her öğretmen kendi renginde;
      `firstFreeColor()` kullanılmayan en küçük indeksi verir, silinen rengi yeniden
      kullanır. Renkler elle seçilmedi, **arandı** (en uzak nokta / CIE Lab, kontrast
      kısıtı altında). Ölçülen: en yakın çift ΔE **17,5** (eski 12'lik palette 13,4),
      art arda indeksler 23,8, kontrast 7,3:1 ve 4,7:1
- [x] **2b Şema v4 → v5**: `ClassGroup.color` + `settings.subjects`. `spreadColors()`
      her yüklemede çalışıyor — v4 dosyaları 12 renkle yazıldığı için çakışma kesin;
      renkleri zaten tekil olan dosya dokunulmadan geçiyor
- [x] **2c Ayarlar sekmesi.** Kurulum 7 → **4** adım (Derslikler · Öğretmenler ·
      Sınıflar · Dersler); Ayarlar 4 bölüm (Okul ve zil · Kurallar · Branşlar · Veri).
      `School`/`Rules`/`Subjects` taşındı, yeniden yazılmadı; `Field`/`LimitBox`/
      `props` bir üst klasöre çıktı, `SetupProps` → `PanelProps`.
      **`Sıfırla` üst çubuktan Ayarlar → Veri'ye taşındı**
- [x] **2d Branş listeden seçiliyor.** "+ Yeni branş…" oracıkta ekliyor; yapıştırılan
      listedeki tanınmayan branş da listeye giriyor (`addTeachersFromRows`).
      Kullanılan branş silinemiyor, mesaj kimin kullandığını sayıyor
- [x] **2e Başlangıç saati iki açılır liste** (00–23, beşer dakika). Yan fayda: kutuyu
      boşaltıp günü sessizce 00:00'a alma tuzağı ortadan kalktı
- [x] **2f Havuz görünümü takip ediyor** *(bildirilen hata)*. `buildPool` `view` almıyordu
- [x] **2g Simgeler**: öğretmen = mezuniyet kepi, sınıf = öğrenci grubu (aSc'nin sözlüğü)
- [x] **2h Öğle arası 10 → 6 px, çarpı 11 → 16 px.** Asıl hata boyut değildi: `.break-col`
      genişliği `table.grid tbody td` tarafından **eziliyordu**, ayraç bir ders kadar
      genişti. Baskıdaki `table.print th td.p-closed` seçicisi de hiç eşleşmiyordu
- [x] **2i Kapalı saatte kalan ders kırmızı işaretleniyor, SİLİNMİYOR** (ilke 6).
      `closedConflicts()`; Kontrol'de tek tek listeleniyor, Müsaitlik'te sayılıyor
- [x] **2j Yazdırmada sayfa seçimi.** Dışarıda bırakılanlar tutuluyor, ki sonradan
      eklenen sınıf kendiliğinden bassın. Seçim `App`'te — sekme değişince silinmesin
- [x] **2k Testler**: 177 → **219 birim**, 51 → **87 E2E**. Her madde için en az bir
      gerçek-tarayıcı iddiası; renk ayrımı, ayraç genişliği ve yazı boyu **ölçülüyor**
- [x] **2l Belgeler**: `CLAUDE.md` (altı sekme, `palette.ts`, şema v5, tuzak 16–18),
      `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kapalı saatteki dersleri toplu kaldıran düğme konmadı —
kullanıcı "kaldırma, kırmızı işaretle" dedi; kararı baba veriyor (2026-08-25 kararı).

---

### 15. v0.9 — otomatik dizme, sol kenar çubuğu, sağ tık, tam E2E ✅ — 2026-08-25

Kullanıcının TASKS sonuna yazdığı dört madde. Dal: `v0.9-otomatik-dizme`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **3a E2E tek dosyadan yedi dosyaya.** `e2e/app.spec.ts` 2151 satırdı; ortak
      yardımcılar `e2e/helpers.ts`'e, testler konularına dağıldı. Tek test silinmedi.
      `fullyParallel` + `workers: 4` — `file://` altında context başına ayrı
      `localStorage` olduğu **ölçüldü**: 66 sn → 16 sn
- [x] **3b Sekmeler üstten sola.** 92px kenar çubuğu (daraltılınca 52px), tercih
      `localStorage['ders-programi-kenar']`'da. Gerekçe ölçüye dayanıyor: yatay şerit
      768px'lik ekranda ızgaradan bir öğretmen satırı götürüyordu. `.main`
      sarmalayıcısı altı bileşenden `App`'e alındı; `.topbar-note` satır içi oldu ve
      "Program'da gizle" özel durumu kalktı
- [x] **3c Her sekmenin sağ tarafı dolduruldu.** `.list.narrow/mid/wide` (520/640/720px)
      silindi, Müsaitlik hücresi 46px **sabit**ken **minimum** oldu. Tek düzen kuralı
      `.cols`. Sağa konan hiçbir bilgi yeni değil: Kurulum'da kapasite özeti (yeni
      `Summary.tsx`, `buildCapacity` ile — `buildReport`'un pahalı yarısı her tuş
      vuruşunda çalışamaz, tuzak 3), Ayarlar → Okul'da zil önizlemesi, Kurallar'da
      canlı ihlal listesi, Müsaitlik'te 25 öğretmeni birden gösteren liste,
      Yazdır'da sayfa seçimi. Kontrol'de akan kart ızgarası (`.panel-grid`)
- [x] **3d Basılı düğmenin iki çelişen tanımı** birleşti (özgüllük hatası:
      `:hover:not(:disabled)` (0,3,0), `[aria-pressed]` (0,2,0)'ı yeniyordu).
      `Field` `wide` prop'u aldı
- [x] **3e Sol tık taşır, sağ tık siler**, Delete klavye eşdeğeri. İki tuzak kapatıldı:
      ders kendini engelliyordu (harita artık kaynağı kaldırılmış durum üstünde) ve
      ızgaradan kart alınınca ızgara zıplıyordu (`scrollIntoView` yalnız havuz için)
- [x] **3f `src/solver.ts`** — MRV + forward checking + iz tabanlı geri sarma, ana iş
      parçacığında dilimli. Kısıt mantığı **yeniden yazılmadı**: her soru `blocker()`'a
      gidiyor. `constraints.ts`'e `occupy`/`vacate` eklendi (7 eşdeğerlik testi).
      **Ölçülen: 359/359 blok, 359 düğüm, 87 ms, hiç geri sarma yok**
- [x] **3g Arayüz**: iki düğme, `.reason-bar`'da ilerleme ve sonuç, tek geri-al adımı.
      Koşu `App`'te yaşıyor (tuzak 18). Sonucun sessizce atıldığı gerçek hata
      bulundu ve düzeltildi (tuzak 20)
- [x] **3h Kapsam boşlukları**: 87 → **176 E2E**. Yeni `duzen.spec.ts`,
      `kontrol.spec.ts`, `bos-ekran.spec.ts`, `otomatik.spec.ts`; Kurulum'un düzenleme
      yolları, Ayarlar'ın her alanı (ortadan gün çıkarma dahil — tuzak 11'in ilk
      tarayıcı kanıtı), geri-al zinciri, hata yolları, kayıt uyarısının GÖRÜNMESİ,
      klavye gezinme
- [x] **3i Görsel regresyon**: 20 referans, `ekran.spec.ts` ile **aynı** `SCENES`
      listesi. Ayrı komut (`npm run gorsel`), `kontrol`'e bağlı değil — gerekçe
      sistem fontu. Testin kendisi test edildi: 92px → 120px, 20'den 18'i kırmızı
- [x] **3j Belgeler**: `CLAUDE.md` (tuzak 19–22, kenar çubuğu, `solver.ts`, test
      tablosuna beşinci satır), `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:**
- **Çözücüye ayar konmadı** — iki düğme, kutucuk yok. "Sabaha yay", "günleri dengele"
  gibi tercihlerin doğru cevabı bir dönem kullanılmadan bilinemez (ilke 5)
- **Web Worker kullanılmadı** — tek dosya + `file://` ile çalışmıyor (tuzak 19)
- **Görsel regresyon `kontrol`'e konmadı** — referans tek makine için doğru
- **Simetri kırma kaldırıldı** — teoride doğru, ölçüldüğünde felaket (tuzak 21)

---

## Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz. Öncelik **babanın geri dönütü**.

- **Boşluk (pencere) kuralları** — sınıf ve öğretmen için ayrı ayrı,
  Kapalı / Uyar / Engelle. v0.6'da bilerek yapılmadı (istenen o değildi)
- ~~**v1 Otomatik doldurma**~~ → **v0.9'da yapıldı** (BİTENLER 15). Plandan iki
  sapma: **Web Worker kullanılmadı** (tuzak 19) ve bütçe 500 ms değil, ilerlemesi
  görünen ve durdurulabilen 15 sn — çünkü UI donmuyor ve kullanıcı her an durdurabiliyor
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas. **Artık somut bir
  başlangıcı var**: v0.9'un çözücüsü yasal bir program üretiyor ama kalitesi
  ölçülmedi (boşluk, öğretmenin geldiği gün sayısı, gün dengesi). Önce babanın
  "bunu kullanır mıydın" cevabı
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
- ~~koyu tema olsun~~ → **v0.7'de yapıldı** (BİTENLER 13)
- Kapanırken kaydedilmemiş değişiklik uyarısı. *Not: şu an her değişiklik 400 ms
  gecikmeyle otomatik kaydediliyor ve sekme kapanışında anında yazılıyor
  (`store.ts`), yani "kaydedilmemiş" durum pratikte oluşmuyor. Yine de babanın
  içi rahat etsin diye görünür bir "kaydedildi" işareti düşünülebilir.*

> **Bu bölümün altına elle yazılan altı satır** (`.exe` · web sitesi · güzel
> simge ve ad · verilerin nerede durduğu · taslaklar · birden fazla ders planı)
> **ŞİMDİ SIRADA → 0. v1.0 turuna** taşındı ve 4b–4j maddelerine dönüştü.

---

## Kullanıcının yeni yazdığı liste (2026-08-25) — HENÜZ NUMARALANMADI

Aşağısı kullanıcının elle yazdığı hâliyle duruyor. Numaralı maddelere
dönüştürülmeden önce kararları sorulacak — en az biri **şema değişikliği**
istiyor (öğretmende cinsiyet alanı yok) ve en az biri yasak listeye bakmayı
gerektiriyor (elle sürükleyerek sıralama).

Listeleri kaydırabililelim ya da grupça filteleyebilelim. Öğretmenler, Branşlar onlar bunlar
    → **KARŞILANDI** (D7): dört listenin de üstünde ara + sırala + branş/derslik
    çipleri. `src/listview.ts`, Türkçe katlama ve sıralama ile.
Ölçeklendirme büyütme küçültme            → **KARŞILANDI** (A1 + B turu):
Babam biraz zor görüyor o sebeple biraz daha büyütülmeli her şey.
    Ayarlar → Görünüm'de %100–**%150**, 11 basamak. Varsayılan %100 kaldı
    (kullanıcı kararı, 2026-08-25): yanlış bir varsayılan tahmindir.
Öğretmenler listesinde sıralama erkek kadın, branşa göre, isme göre vesaire sıralamalar olsun. ayrıca biz kendimiz sıralayabilelim. drag ve koy gibi. Aynı şekilde tüm listeler öyle özelliklere sahip olsun.
    → **TAMAMEN KARŞILANDI** (D7 + F turu): ada, branşa, yüke, açık saate ve
    **cinsiyete** göre sıralama — dört listede de — artı **elle sürükleyerek
    sıralama** (tutamak + klavye), yine dört listede de. Cinsiyet
    `schemaVersion` 6 istedi; elle sıralama istemedi, çünkü dizinin kendisi
    zaten sıradır.
Ayrıca renk seçmede renkleri seçerken renkleri görebilelim sadece sayı olmasın.
    → **KARŞILANDI** (B turu): 6×6 swatch `<dialog>`'u, 36 rengin hepsi görünür,
    seçili olan çerçeveli. `src/components/ColorPick.tsx`.
Ayrıca programramda sıfırla olmalı ki programı en baştan yapabilelim ama uyarı gelsin ona basınca.
    → **ZATEN VAR**: Ayarlar → Veri'de "Sıfırla", onaylı. Program sekmesinde
    ayrıca "Baştan diz" (o da onaylı) dizilmiş programı silip yeniden dizer.
ayrıca ayarlarda ölçeklendirme de olsun. nasıl olması gerekiyorsa ya da.
    → **KARŞILANDI**: Ayarlar → Görünüm.
Ayarlarda müsatilikteki programda derslerin altında saatleri olsun olmasın diye ayar olsun ve default olarak kapalı olsun.
    → **KARŞILANDI** (D8): Ayarlar → Görünüm, varsayılan kapalı.
Yazdır kısmındaki program da büyümesi lazım.
    → **KARŞILANDI** (D3): `--fs-p-*` merdiveni yükseltildi (başlık 14→17pt,
    gövde 8,5→10pt). 205 mm sayfa ve "3 sınıf = 3 sayfa" testi korundu.
Program kısmında programı sıfırla opsiyonu gelmeli.
    → **KARŞILANDI** (D8): şeritte "Programı boşalt", onaylı, tek geri-al adımı.



UI düzenlemeleri, simetri            → **KARŞILANDI** (D3 + D4)
frontend skills
UI ve desing kısıtlamaları kaldırma  → **KARŞILANDI** (D0)
programda öğretmen ya da sınıf toggle edip programına bakma.
    → **ZATEN VARDI**: Program şeridindeki iki görünüm düğmesi.
her derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve programının gözükmesi
    → **KARŞILANDI** (D6): varlık paneli. Izgarada satır başından, Kurulum'un üç
    listesinden ve Ctrl+K'dan açılıyor.
normal testler                       → **KARŞILANDI**: 453 birim testi yeşil
E2E testleri en sonda.               → **KARŞILANDI**: 318 E2E + 6 site yeşil
koyu modu düzeltme
    → **KARŞILANDI** (E4): koyulaştırıldı ve iki ölçülmüş kusur onarıldı — gün
    bandı bir DURUM gibi okunuyordu (ΔE 4.67 → 2.45) ve kapalı saatteki soluk
    yazı 4.69 kontrastındaydı (→ 5.71). Yapışkan başlığın gölgesi koyu düzlemde
    hiç görünmüyordu (`--shadow-shell`).
brave'de açık modu açma
    → **ZATEN ÇÖZÜLMÜŞTÜ, gerekçesiyle:** tuzak 14 — `color-scheme` iki temada
    da doğru kurulu, o yüzden Brave açık temalı sayfayı kendi algoritmasıyla
    karartmıyor. **Ama babanın Brave'inde GÖRÜLMEDİ**; hâlâ doğrulanmayı
    bekleyen bir varsayım.
E2E'nin yeni fotolar çekmesini sağlama.
    → **KARŞILANDI** (E7): `npm run ekran` iki temada 17 görüntü çekiyor (üç
    yeni sahne: baskı önizlemesi, Kontrol'ün şeridi, Görünüm'ün hareket
    paneli) ve artık görüntüyü almadan **hareketin bitmesini bekliyor** —
    tuzak 59, bakılarak bulundu.
.exe
    → **BEKLİYOR** (4g–4i): Rust toolchain onayı kullanıcıdan.


## Y turu — listeler + kâğıt — **BİTTİ ✅** (2026-08-26)

Kullanıcının bu dosyanın sonuna elle yazdığı on bir satır, artı aynı mesajda
gelen üç liste kusuru. **Her maddenin yanındaki sayı ölçülmüş bir sayıdır**;
hiçbiri "düzeltildi" diye işaretlenmedi, hepsi önce ölçüldü, sonra düzeltildi,
sonra testi yazıldı ve **test kaynak bozularak kırmızıya döndürüldü** (12 yeni
E2E'nin 10'u kırmızıya döndü; kalan ikisi bilerek koruma testi).

### Listeler — Kurulum'un dört adımı

- [x] **A1 `Sil` dört listede de en sağda.** Teşhis ölçüldü: Dersler'in eylem
      sütununda **tek** düğme var, öteki üçünde iki (bilgi + Sil), o yüzden
      13ch'lik sütun tek düğmeyle içeriğinden geniş kalıyordu. Ölçülen boşluk
      Dersler'de **42 px (%100) / 73 px (%150)**, ötekilerde 6–19 px. Çare
      hizalama kuralı (`table.list td > .form-row { justify-content: flex-end }`),
      ve yanında ikinci bir kaza kapandı: `.form-row`'un `margin-bottom`'u her
      eylem hücresinde de geçerliydi — **satır boyu 70 → 57 px**.
      Sonuç: dördünde de **6 px**.
- [x] **A2 Öğretmenler listesi yatay kaymıyor.** Ölçülen taşma varsayılan
      ölçekte **106 px**, %125'te 267, %150'de 548 — ve sağda 620 px'lik bir
      kenar sütunu boş duruyordu. İki adım, ikisi de ölçülerek:
      (a) `.cols.wide-left` `2fr 1fr` → `1fr minmax(19rem,24rem)`, sol sütun
      **1185 → 1381 px**; (b) dört sütun tarayıcının istediği genişliğe
      kırpıldı (`Kısaltma` 16ch → 10ch, `.color-pick` 7ch → 5ch, satırdaki
      `.num` 8ch → 7ch, `th.num` `--w-col-sm` → `--w-col-xs`).
      Sonuç: **%100, %110 ve %125'te taşma 0**. %150'de `.table-scroll`
      duruyor — on bir sütun oraya hiçbir düzenle sığmaz ve mevcut test
      "sayfa değil TABLO kayar" iddiasını orada tutuyor.
- [x] **A3 Arama şeridiyle liste arasındaki boşluk.** Ölçülen **44 px**, ve
      çoğu **her zaman çizilen boş bir duyuru satırı**ydı (`min-height: 1.2em`).
      Duyuru şeridin kendi satırına taşındı (`.list-said`, `.list-note` DEĞİL —
      tuzak 49) ve `.list-tools` alt boşluğu `--space-5` → `--space-3`.
      Sonuç: **9 px**.

### Kâğıt ve ızgara — kullanıcının on bir maddesi

- [x] **Y1 Müsaitlikte çarpılar büyük ve kırmızı.** `--muted`/`--fs-lg` →
      `--bad`/`--fs-2xl`. Renk kanalını bozmuyor çünkü **kapsam** dar: o
      ekranda bırakma da reddetme de yok, tek söylenen açık/kapalı. Tarama
      duruyor (renk tek başına durum taşımaz) ve kontrast ölçülüyor.
- [x] **Y2 Kartın üstüne kart bırakılabiliyor, eski ders havuza dönüyor.**
      `dropMap()` (`constraints.ts`) — `check()` artı **tek** bir reddin
      geçersiz kılınması: sınıfın kendi başka dersi. Öteki bütün retler
      *başkasıyla* ilgili (öğretmen başka sınıfta, derslik dolu, saat kapalı)
      ve önündeki bloğu havuza atmak onları doğru yapmaz. Hücre **yeşil değil
      sarı**: izin var ama bir şey kaybediyorsunuz — dördüncü bir renk
      uydurulmadı. Bütün hamle **tek geri-al adımı**, ve ne kaybedildiği
      toast'ta adıyla yazıyor.
- [x] **Y3 Bir A4'e 1, 2 ya da 4 program.** `.print-sheet` = kâğıt (297×205 mm,
      `break-after` onda), `.print-page` = **bir program** — ad değişmedi çünkü
      onu sayan yarım düzine test var. PDF ile doğrulandı: 4 program per=4'te
      **1 PDF sayfası**, per=2'de 2, per=1'de 4.
- [x] **Y4 6. sütunda saat var artık.** Boş değildi çünkü bozuktu: 6. ders
      hafta içi 13:30, hafta sonu 13:10 başlıyor ve başlık ikisini de
      söyleyemiyordu. `periodGroups()` (`bell.ts`) ikisini de veriyor, başlık
      ikisini de gün aralığıyla yazıyor (`Sal–Cum 13:30–14:10` /
      `Cmt–Pzr 13:10–13:50`). Uyuşan on bir sütunda gün adı **yazılmıyor**.
      Ölçüldü: sütunlar üç düzende de eşit kalıyor (≤1 px).
- [x] **Y5 Sol sütun daraldı.** `--rowhead-w` 8.25rem → **6rem**. Sayı
      ölçüldü: en uzun gömülü branş ("Sosyal Bilgiler") **5.51rem** istiyor.
- [x] **Y6 Kâğıttaki yazı boyutu.** Küçük / Normal / Büyük, ve **düzenden
      bağımsız**. İlk deneme hiç çalışmadı ve bunu ancak ölçüm gösterdi:
      `--fs-p-*` `:root`'ta tanımlıyken çarpanı aşağıda ezmek hiçbir şey
      yapmıyor (tuzak 52'nin ailesi) — dokuz birleşimde de başlık **22,7 px**
      çıkıyordu. Merdiven `.print-area`'ya taşındı.
- [x] **Y7 Günler arası fark belli.** Kendi tokeni: `--day-edge`, 3 px, ve
      ızgaradaki **en kalın** çizgi. Gün bandı güçlendirilmedi — o band ΔE 2,7'de
      bilerek duruyor (tuzak 40).
- [x] **Y8 "Sayfada ne olsun" satırları kırpılmıyor.** `.pick-item`'ın
      `white-space: nowrap`'i çipler için doğru, cümle taşıyan yığılmış satır
      için yanlıştı. **İlk testim yanlış şeyi ölçtü** (satırın sağ kenarını
      panelinkiyle karşılaştırdı) ve bozuk derlemede yeşil geçti; gerçek kusur
      satırın **kendi metnini kırpması**ydı — ölçülen: `"Derslik ve branş —
      Ayn…"`, %150'de iki satır.
- [x] **Y9 Önizleme ile çıktı aynı sayfa.** Değillerdi: önizleme satırı **~30 px**,
      kâğıt satırı **86,93 px**, çünkü `height: 23mm` yalnız `@media print`
      içindeydi. Kutu artık ikisinde de mm cinsinden aynı kutu; ekrana özel
      kalan tek şey kâğıdın **üstünde olmayan** şeyler (gölge, köşe, tepsi).
- [x] **Y10 Kâğıtta çarpı yok.** Öğretmen sayfasındaki kapalı saat işareti
      (× + gri tarama) kalktı; bilgi kaybolmadı, Müsaitlik'te düzenleniyor ve
      Kontrol'de sayılıyor.
- [x] **Y11 Öğretmen sayfasının renkleri SINIFIN rengi.** Ekrandaki kural
      ("hücreyi daima öğretmen rengi boyar") öğretmenin kendi kâğıdında
      dejenere: on iki hücre aynı pastel. **Sınıf sayfası değişmedi.**

### Bu turda çıkan yeni tuzaklar

- **Tuzak 63** — `:root`'ta tanımlanan bir custom property'nin içindeki
  `var()` **orada** çözülür; aşağıda çarpanı ezmek hiçbir şey yapmaz.
- **Tuzak 64** — bir düzen kusurunu ölçerken **hangi kutunun** taştığına
  bakılır: taşan şey kapsayıcı değil, öğenin kendi metni olabilir.
- **Tuzak 62 yeniden yaşandı**: `npm run build | tail` zincirinde çıkış kodu
  `tail`'inki olur. Derleme kırıldı, testler **bir önceki** `dist`'i ölçtü ve
  hepsi yeşil geçti. `set -o pipefail` şart.

---

## B turu — yerel kurulum — **BİTTİ ✅** (2026-08-26)

Onaylanan planın park edilmiş yarısı. Dal `v1.1-kurulum`, madde başına bir
commit. Logo parçası Y turunda yapılmıştı (üç aday, kullanıcı **A — Şerit**'i
seçti; adaylar `site/logo-adaylari/` altında duruyor ama artık yayınlanan
siteye **girmiyor**).

Turun gerekçesini **bir kez yanlış yazdım ve ölçümle düzelttim**: "`file://`
güvenli bağlam değildir" dedim, Chromium'da değil — orada da güvenli bağlam ve
`showDirectoryPicker` da var. Eksik olan bir **köken** (OPFS `SecurityError`,
service worker `TypeError`, `origin` makinedeki her yerel sayfayla ortak).
Yerel sunucu klasör özelliğinin tek evi değil, **daha iyi** evi. Ayrıntı:
[STATUS.md](STATUS.md) → *Turun gerekçesini düzeltmek zorunda kaldım*.

- [x] **B1 Yerel sunucu.** `scripts/sunucu.mjs` (Node) + `kurulum/sunucu.ps1`
      (Windows ikizi, babanın makinesinde **asıl koşacak** olan — Node
      gerekmiyor). `HttpListener` değil ham `TcpListener`: `localhost` dışı
      bir önek `netsh http add urlacl`, yani yönetici ister.
      **İki geri döngüye birden** bağlanıyor (tuzak 66).
      ÖLÇÜLDÜ: OPFS ve service worker burada çalışıyor, `file://`'ta
      `SecurityError`/`TypeError`; iki sunucu da `127.0.0.1`, `[::1]`
      ve `dersprogrami.localhost` üzerinden **baytı baytına aynı** yanıtı
      veriyor; açılış `file://` 76 ms ↔ sunucu 82 ms (9 koşu).
      `pwsh` 7.6.5 kuruldu ve betik burada koşturuldu.
      `e2e/sunucu.spec.ts` — 5 test.
- [x] **B2 Kurulum betikleri ve paket.** `Kur.cmd` · `Guncelle.cmd` ·
      `kur.ps1` · `OKU.txt` · `icon.ico` + `scripts/{ikon,paket}.mjs`.
      `dist-kurulum/` = **569 034 bayt**, elden ele giden tek klasör.
      `.cmd`'ler **yalnız ASCII** (cmd.exe kod sayfası), `.ps1`'ler **UTF-8
      BOM + CRLF** (5.1 BOM'suzu ANSI okur), `.gitattributes`'ta `eol=crlf`.
      Pencere **gizlenmiyor** (plandan sapma, gerekçesi: gizli pencere =
      kapatılamayan program). Güncelleme `site\`'ı **silip** yazıyor, yoksa
      kaldırılan bir dosya orada kalır.
      ÖLÇÜLDÜ: kopyalama yolu gerçekten koşturuldu — 9 dosya yerine gitti,
      bilerek bırakılan eski dosya silindi, kopyalama kısayol adımından
      **önce** bitti, kısayol argümanında boşluklu yol tırnak içinde.
      **DENENMEDİ:** `Kur.cmd`, `.lnk` üretimi, Windows PowerShell 5.1.
- [x] **B3b Gömülü favicon.** `index.html`'e `data:` URI. İşaret artık iki
      yerde ve **ayrışmasını bir test yakalıyor**: URI çözülüp
      `site/icon.svg` ile aynı 13 dikdörtgeni çizdiği karşılaştırılıyor.
      Ölçüm: +1 451 bayt (işaretin kendisi 1 205).
      Kendi hatam düzeltildi: ilk testim "dosyada `icon.svg` metni geçmesin"
      diyordu ve **yorumu** yakalıyordu; doğru iddia "hiçbir href/src `data:`
      dışına bakmıyor".
- [x] **B4 "Nereye kaydedilsin" (eski 4l).** `src/folder.ts` (yaprak modül;
      `dailyName` ve `prunable` **saf ve testli**, 9 birim testi) +
      `src/useFolder.ts` (App'te, tuzak 18) + Ayarlar → Veri'de panel.
      Yazılan şey **bütün planlar** (paket), açık plan değil. Günlük yedek
      son 10 gün, ve **ad kalıbıyla** budanıyor — Belgelerim'de babanın kendi
      dosyaları var, "en yeni ondan gerisini sil" onun işini silerdi.
      Yazma hatası **sessiz kalmıyor** (tuzak 7).
      **Şema değişmedi, yeni localStorage anahtarı yok:** tutamak
      `IndexedDB['ders-programi-klasor']`'da, çünkü localStorage bir tutamağı
      saklayamaz — ama hâlâ `State`'e girmiyor.
      `e2e/klasor.spec.ts` — 8 test, **gerçek** bir `FileSystemDirectoryHandle`
      ile (OPFS); yalnız sürülemeyen parça sahtelendi (tuzak 67).
      Dört ayrı sabotajla kırmızıya döndürüldü.
      **DENENMEDİ:** gerçek klasör diyaloğu — Playwright'la sürülemez.
- [x] **B5 Belgeler.** İlke 2'nin **ikinci daraltması** (yerel statik sunucu
      var; backend, veritabanı, hesap, oturum, API yok), üç derleme hedefi,
      `folder.ts`/`useFolder.ts` mimari şemaya, IndexedDB'nin gerekçesi,
      README'de üç teslim yolu, ve **tuzak 65–68**.

### Bu turda çıkan yeni tuzaklar

- **Tuzak 65** — "güvenli bağlam" ile "gerçek köken" aynı şey değildir, ve
  bu tuzağın kaydı **benim ona düşmem**: bir turun bütün gerekçesini
  ölçmeden yazdım, yanlıştı, ve yakalayan şey bir test değil bir **ekran
  görüntüsü** oldu.
- **Tuzak 66** — tek geri döngüye bağlanan sunucu bazı makinelerde sessizce
  bulunamaz.
- **Tuzak 67** — structured clone fonksiyon klonlayamaz; elle yazılmış sahte
  tutamak IndexedDB'ye hiç girmez ve "hatırlanıyor mu" testi hiçbir şey
  ölçmez. Çare sahteyi **küçültmek**.
- **Tuzak 68** — `addInitScript` her yüklemede koşar; oraya konan bir
  "varsayılanı yaz" satırı testin reload'dan önce kurduğu durumu geri alır.
- **Tuzak 62 üçüncü kez**: sabotaj koşusunda yama `tsc`'yi kırdı, derleme
  düştü, test **bir önceki** `dist-site`'ı ölçüp yeşil geçti.
- **Tuzak 49 yeniden yaşandı** ve bu kez bir gerilemeydi: yeni panelin
  `role="status"` satırı `planlar.spec.ts`'in `.panel .hint[role="status"]`
  sorgusunu ikiye çıkardı. Sorgu paneline daraltıldı.

### B6 İşaretin iki çizimi + üst çubuktaki marka — **BİTTİ ✅**

Kullanıcının iki isteği: *"evet logoyu öyle yap. ayrıntılı olanı da güzel bir
şekilde websitenin üst barında en sol üste koy."*

- [x] **B6a Küçük boy için sade varyant.** `site/icon-small.svg` — aynı fikir,
      üç sütun, hayalet sütun yok, çubuklar iki kat geniş. **İkinci bir logo
      değil**; gerçek ikon setleri bunu yapar. Eşik (`< 48 px`) uydurulmadı:
      iki çizim 16/32/48/256'da yan yana render edilip **bakıldı**
      (`scratch/ikon-karsilastirma.png`, `scratch/ikon-sekme.png`).
      Sade: sekme favicon'u + `.ico` 16/32. Ayrıntılı: `.ico` 48–256, PWA
      192/512, üst çubuk. Favicon `data:` URI'si **1 205 → 467 bayt**.
      `scripts/favicon.mjs` URI'yi yeniden üretiyor — elle düzenlenmiyor.
      **Site derlemesinin `<link rel="icon">`i kaldırıldı**: `<head>` sırasında
      kazanıp sekmeye ayrıntılı işareti geri koyuyordu.
- [x] **B6b Marka işareti üst çubukta, en sol üstte.** `.brand-mark`,
      `1.75rem` → **ölçülen 28 px @%100, 42 px @%150** (`--ui-scale`'i
      izliyor), sol kenardan 14/21 px. İnline SVG (ilke 3), düğme değil,
      `aria-hidden`. Tuzak 48'in sorusu ölçülerek cevaplandı: işaret feda
      edilmiyor, **sığıyor** — örnek okul yüklüyken (tuzak 41) iki ölçekte de
      sekme taşması 0, çubuk taşması 0.
      Çizim artık üç yerde; ayrışmayı iki test yakalıyor (`temel.spec.ts` 72,
      `kabuk.spec.ts` 76). Dördü de sabotajla kırmızıya döndürüldü.

**Sabotaj iki şey daha buldu:** `.brand`'in `@media print` kuralı **ölüydü**
(`.topbar` baskıda zaten gizli) — silindi, test koruma testi olarak
işaretlendi; ve `scripts/favicon.mjs`'i belgelerken gövdesini iki kez
yazmışım, betik hiç koşmuyordu ve bunu ancak sabotaj gösterdi.

---

## PARK EDİLEN: yerel kurulum turu (B)

**Kapandı 2026-08-26.** Beş maddenin beşi de yapıldı — bkz. yukarıdaki
*"B turu — yerel kurulum — BİTTİ"*. Park notunun öngördüğü dürüst sınır
(`pwsh` bu makinede yok, betik "gözden geçirildi, ölçülmedi" diye
işaretlenecek) **gerçekleşmedi**: kullanıcı kurulmasını istedi, `pwsh` 7.6.5
kuruldu ve `sunucu.ps1` burada gerçekten koşturuldu. Ölçülemeyen üç şey
kaldı ve adlarıyla yazıldı: `Kur.cmd`, `.lnk` üretimi, Windows PowerShell 5.1.




---

## U turu — güncelleme · ikon · devriye · metinler — **BİTTİ ✅** (2026-08-27)

Kullanıcının bu dosyanın sonuna yazdığı **beş satır**, artı aynı mesajdaki iki
istek: *"yeni sürüm oluşsun"* ve *".exe'de de ayarlarda güncellemeye basınca
güncellemeye baksın ve güncelleme varsa güncellensin, tabii ki exe internetsiz
de sorunsuz çalışabiliyor olsun."*

**İş ikiye bölündü (kullanıcı kararı, 2026-08-27).** Bu tur **v1.3.0**; dil
desteği ve yeni ad kendi turunda, **v2.0.0**'da. Gerekçe: o ikisi kimlik
değişikliği (ilke 4 yeniden yazılıyor, 529 E2E locator'ı Türkçe adlara asılı)
ve babanın bekleyen düzeltmeleri onların arkasında beklememeli.

- [x] **U1 `.exe` kendini güncelliyor.** `src-tauri/src/update.rs` + üç köprü
      fonksiyonu (`desktop.ts`) + `update.ts`'in üç yollu hâli (`sw` · `exe` ·
      `yok`) + Ayarlar → Veri'de üç düğme.
      **Sözleşme:** ağa **yalnız tıklanınca** çıkılır. Açılışta yok, arka
      planda yok, zamanlayıcı yok. İnternet yoksa tek sonuç bir cümledir ve
      program çalışmaya devam eder — E2E bunu örnek okulu yükleyip ızgaraya
      ulaşarak **ölçüyor**, "sekme değişti" diyerek değil.
      **İlke 1 korundu:** üç ayrı düğme, üç ayrı karar (`Denetle` → `İndir` →
      `Şimdi yeniden başlat`). İkisi de sabotajla kırmızıya döndürüldü.
      Yeniden başlatmadan önce `park()` çağrılıyor (tuzak 28).
      `.github/workflows/surum.yml` dördüncü bir varlık üretiyor: `surum.json`,
      ve numarası **etiketle package.json'ın aynı olduğu doğrulanmadan**
      yazılmıyor.
      **Tauri'nin kendi updater'ı alınmadı** ve gerekçe ilke 1: Windows'ta bir
      `.msi`/`.nsis` kurulumu çalıştırıyor, yani tam da `--no-bundle`'ın
      reddettiği şey.
      **Bu makinede ölçülemeyen:** Windows'ta gerçek takas. `cargo test`
      mantığı Linux'ta yargılıyor (rename semantiği aynı); exe'nin kendini
      Windows'ta gerçekten değiştirdiği babanın makinesinde görülecek.
- [x] **U2 Görev çubuğundaki işaret büyük çizim.** İki kusur birden vardı ve
      ikisi de dosyanın içindeydi: `.ico` 20 · 24 · **40** px taşımıyordu
      (Windows %125'te 40 istiyor ve yoksa 32'yi büyütüyor — "eksik pxl"in
      kaynağı), ve eşik `< 48 sade` olduğu için görev çubuğunun yuvasına
      **sade** çizim düşüyordu. Eşik uydurulmadı, **bakılarak** bulundu.
      Karar bir testte (`temel.spec.ts` 79, piksel piksel), ve sabotajla
      kırmızıya döndü.
      **EŞİK AYNI GÜN İKİNCİ KEZ İNDİ: 32 → 20**, çünkü şikayet geri geldi.
      İlk düzeltme pikselleri doğru okumuştu ama yanında ölçülmemiş bir cümle
      taşıyordu — *"görev çubuğu 32 px'lik bir yuvadır"*. Windows 11 %100'de
      **24** istiyor, yani düzeltmenin kendisi düzeltmeye çalıştığı boyu
      eşiğin bir basamak altında bırakmıştı. Artık yalnız **16** sade;
      20/24/32/40/48+ ayrıntılı, yani bir görev çubuğunun isteyebileceği
      hiçbir boy sade tarafta değil ve cevap "Windows hangi boyu seçiyor"
      tahminine dayanmıyor. `.ico` 11 858 → 14 483 → **14 859 bayt**.
      Bkz. tuzak 78'in ikinci yarısı.
- [x] **U3 Devriye + hata kapanı.** İki parça, ve asıl kazanç birincisi:
      `e2e/kapan.ts` **bütün** E2E süitini sarıyor (`auto: true`) ve konsol
      hatasını, `pageerror`'ı, yakalanmamış promise reddini ve `file://`
      altında **herhangi bir ağ isteğini** kırmızıya döndürüyor. Bugüne kadar
      415 testin **hiçbiri** bunlara bakmıyordu. İkisi de kasıtlı hatayla
      sınandı. `npm run patrol` ise iddia etmiyor, **geziyor**: altı sekme,
      dört adım, beş bölüm, şeritteki her düğme, artı üç tohumla rastgele
      gezinme. `kontrol`'ün parçası değil (tuzak 79'a bakınız: ilk hâli üç
      dakikada hiçbir sekmeye uğramadan düştü).
      **Süit kapanla YEŞİL geçti** — yani bugün sayfa gerçekten hiçbir yerde
      hata basmıyor.
- [x] **U4 Metinler yenilendi, uzun çizgi kalktı.** Ekranda **265 satır** uzun
      çizgi taşıyordu; şimdi **sıfır**. Çoğu düzyazı değil ayraçtı
      (`MÇ — Mehmet Çelik`, `A: 4 sınıf — 410, 411`,
      `310 sınıfı — Haftalık ders programı`). Yerine geçen kural:
      düzyazıda **ayrı cümle**, etiket/değer çiftinde **iki nokta**,
      eşit ağırlıkta iki şey arasında **orta nokta (`·`)**, boş tablo
      hücresinde **kısa çizgi (`–`)**. Karar `metin.spec.ts`'te ölçülüyor ve
      ölçtüğü şey kaynak değil `document.body.innerText`.
      **Kod yorumlarına dokunulmadı**: onlar İngilizce ve kimseye görünmüyor.
- [x] **U5 Sürüm numarasının tek kaynağı GERÇEKTEN tek.** CLAUDE.md iki sürüm
      boyunca öyle diyordu ve yanlıştı: numara üç dosyadaydı ve `yayinla.mjs`
      yalnız birini yazıyordu. Exe'nin karşılaştırdığı sayı tam da o.
      `tauri.conf.json` → `"../package.json"`, `Cargo.toml`'u `yayinla.mjs`
      yazıyor, ve `src/surum.test.ts` her koşuda ölçüyor (tuzak 77).
- [x] **U6 `gorunum.spec.ts`'in payı ölçüldü.** Uydurma `+2` kalktı.
      **Ölçülen:** sütun **39,0 px**, CSS'in istediği **37,4 px**, saat
      başlığının kendi istediği **41,0 px**. Tavan artık ölçülen zemin:
      sütun bu ikisinin arasında kalmalı, yani gömülü yüz değişince tavan da
      onunla birlikte oynuyor (tuzak 42).

### v2.0.0 turu — DİL — **makine bitti, sözlük başladı** (2026-08-27)

Kullanıcının kalan iki maddesinden birincisi. Karar: **altyapı + TR + EN
önce**, DE · ES · FR sonraki turda, **yeni ad ayrı bir tur**.

- [x] **D1 Makine.** `src/i18n.ts` (yaprak, `keys.ts` deseni) ·
      `components/T.tsx` (`useT()` + `<T>`) · `src/lang/en.ts` ·
      `i18n.test.ts` (13 test) · `e2e/dil.spec.ts` (7 test).
      **Anahtar Türkçe cümlenin KENDİSİ**, uydurulmuş bir ad değil: eksik
      çeviri doğru Türkçeye düşer, JSX okunur kalır, ve altı yüz isim
      uydurulmaz. Bedeli `i18n.test.ts` ödüyor — ölü anahtarı o yakalıyor.
- [x] **D2 Tercih on birinci makine tercihi.** `ders-programi-dil`,
      `State`'e girmez, `schemaVersion` artmaz, "Veriler nerede" tablosunda
      satırı var. `<html lang>` onunla kıpırdıyor.
- [x] **D3 E2E'nin dili `kapan.ts`'te sabitlendi.** `auto: true` unutulamaz,
      ve üç spec dosyası hiçbir yardımcıdan geçmeden `page.goto('/')` yapıyor.
      Tohumluyor, dayatmıyor (tuzak 68).
- [x] **D4 Ayarlar → Görünüm'de dil seçici.** Her dil **kendi adını kendi
      dilinde** söylüyor — bir dil menüsünü, uygulamanın o an konuştuğu dili
      henüz bilmeyen biri okur.
- [x] **D5 SÖZLÜK — BİTTİ (2026-08-29). 9 → 814 anahtar.** Arayüzün tamamı
      `t()`'den geçiyor. Makinenin eksik üç parçası da bu turda kondu: saf
      modüller için **aktif dil + çıplak `t()`** (bkz. tuzak 76 — alternatifi
      `t`'yi parametre geçirmekti), **çoğul** (`{n:tekil|çoğul}`, kategoriyi
      `Intl.PluralRules` seçiyor), ve **veri metinlerinin sınırı**
      (`src/names.ts`: depoda Türkçe, ekranda çevrili).
      **Asıl ölçüm bir test değil:** hiçbir test çevrilmemiş metni göremez,
      çünkü süit Türkçeye sabitli ve Türkçede `t()` anahtarın kendisini
      döndürüyor. İngilizce ekranın gövdesi tarandı ve Almanca ekran
      görüntülerine **bakıldı**; on dört yerde Türkçe duruyordu, ikisi gerçek
      kusurdu (listelerde çoğul yoktu; kısaltma ipucu yanlış varsayılanı
      okuyordu). Ayrıntı [STATUS.md](STATUS.md) → *Otuz ikinci oturum*.
- [x] **D6 DE · ES · FR — BİTTİ (2026-08-29).** Aynı 814 anahtar, dört sözlük.
      `systemDil()`'in geri düşme dili Türkçeden **İngilizceye** çevrildi.
      Sözlüğün beş denetçisi de **mutasyonla** sınandı (ölü anahtar · yuva
      kümesi · dengeli `**` · çoğulun iki biçimi · uzun çizgi), beşi de
      kırmızıya döndü.
      **Ölçülen maliyet:** üç sözlük daha **+242 KB** ve açılışa **0 ms**
      (82 → 83 ms medyan). Gömülü metin ayrıştırılmıyor, taşınıyor.
- [x] **D7 İLKE 4 yeniden yazıldı (2026-08-29).** Yerine geçen şey hâlâ bir
      **kısıt**: Türkçe kaynak dildir, anahtar Türkçe cümlenin kendisidir,
      eksik çeviri doğru Türkçeye düşer, ve `State`'e giren hiçbir metin
      çevrilmez.

### v2.0.0 turu — YENİ AD — **BİTTİ ✅** (2026-08-29)

- [x] **Dil seçeneği: TR · EN · DE · ES · FR.** Varsayılan `navigator.language`
      üstünden; cihaz dili bu beşten biri değilse **İngilizce**. Türkçe kaynak
      dil kalır. Tercih `ders-programi-dil`'de, `State`'e **girmez**
      (`schemaVersion` artmaz). `theme.ts`'in on birinci makine tercihi, ve
      `library.ts`'teki `storageReport`'a satırı yazılacak.
      **İLKE 4 YENİDEN YAZILACAK** — bugünkü hâli "Tek dil. i18n altyapısı
      yok, string dosyası yok".
      E2E'nin dili `open()` değil **`kapan.ts`**'te `tr`'ye sabitlendi
      (`auto: true` unutulamaz, ve üç spec hiçbir yardımcıdan geçmiyor).
- [x] **Yeni ad: Mozaik — YAPILDI (2026-08-29).** Beş dilde de aynı kelime (Mozaik · Mosaic · Mosaik ·
      Mosaico · Mosaïque) ve ekrandaki şeyi tarif ediyor.
      **DEĞİŞMEYECEK olanlar, ve bu bir veri kararı:** `localStorage`
      anahtarları (`ders-programi*`), yedek dosya adları
      (`ders-programi-YYYY-AA-GG.json`) ve `Belgelerim\Ders Programı`
      klasörü. Kimliği değişen bir anahtar, silinmiş veri demektir.
      Değişecekler: pencere başlığı, belge başlığı, marka, exe adı, site,
      README, `identifier`. Exe adı değişince `surum.json`'daki adres de
      değişir — güncelleyici bunu zaten **manifestten okuyor**, yani v1.3.0
      taşıyan bir kopya v2.0.0'a geçebilir.





> **Bu dokuz satırın ham hâli buradaydı; V turu olarak numaralanıp yukarı
> taşındı (2026-08-27). Dokuzu da bitti.**

### W turu — yedi madde — **BİTTİ ✅** (2026-08-27)

Kullanıcının TASKS'in en altına yazdığı yedi satır. **Şema DEĞİŞMEDİ** (v8
kaldı) ve **hiçbir depolama anahtarı açılmadı** — yedi maddenin hiçbiri
program verisine dokunmadı.

**İkisinin karşılığı sıfır satır kod oldu, ve bu bir sonuçtur:** ikisi de
ölçüldü ve zaten çözülmüş çıktı. Ölçmeden "yapıldı" demek ile ölçmeden
yeniden yapmak aynı hatanın iki yüzü.

- [x] **W1 Görev çubuğundaki işaret — ZATEN ÇÖZÜLMÜŞ.** `scripts/ikon.mjs`'in
      eşiği `SADE_ALTINDA = 20`, yani yalnız 16 px sade. Commit'lenmiş
      `kurulum/icon.ico` çözülüp doğrulandı: dokuz giriş, ve 24 px girişinde
      ayrıntılı çizimin hayalet sütunları ile mor bloğu **var**.
      `tauri.conf.json`'ın `bundle.icon`'u aynı dosyayı gösteriyor, yani exe
      de onu taşıyor. Şikayet aynı gün `dc47a62`'de düzeltilmiş, notu
      silinmemişti.
      **Kalan gerçek boşluk kodda değil, teslimdeydi ve kapatıldı:**
      `kurulum/kur.ps1` kısayolu yalnız ilk kurulumda yazıyordu, yani
      `Guncelle.cmd` yeni `icon.ico`'yu kopyalasa da `.lnk`'nin
      `IconLocation`'ına dokunmuyor ve Windows eski işareti göstermeye devam
      ediyordu — **düzeltilmiş bir ikonun düzeltilmiş olduğu hâlde
      görünmemesi**. Artık güncellemede DURAN kısayol tazeleniyor; olmayan
      **yaratılmıyor** (babanın onu silmiş ya da taşımış olma ihtimali).
      Babanın makinesindeki v1.3.0 exe'si hâlâ eski `.ico`'yu taşıyor: bu
      madde ancak bir **sürümle** ulaşır.
- [x] **W2 Izgarada blok çizimi — ZATEN ÇÖZÜLMÜŞ, foto eski derlemeden.**
      `docs/Örnek Fotolar/Programda da eğer bloksa blok olarak gözükmeli.png`
      piksel piksel ölçüldü: iki kart arasında **3 px zemin** var, yani ne
      `block-wide` ne `block-cont` — düpedüz iki bağımsız kart. İki bağımsız
      sebep: (a) `dist/index.html` diskte 14:55'ten, "tek kart blok"u getiren
      `5c84f49` ise 18:37'den, ve `grep -c block-wide dist/index.html` → **0**;
      (b) fotodaki kartlar zaten **iki ayrı 1 saatlik blok** (`sample.ts:144`
      derslerin %65'ini `pairs = 0` üretiyor), yani bugünkü kodda da iki kart
      çizilirdi ve doğru olan bu. Kullanıcı onayladı: *"her şey yolundaymış
      orada bunun için bir şey yapmana gerek yok"*.
- [x] **W3 Havuzda DESTE + adet rozeti.** W2'nin yerine gelen istek:
      *"aynı dersten aynı şeyden birden fazlaysa 0/4 1/7 gibi gözüküyor ya o
      kalsın ama onun yanında kartlar stacklenmiş gibi altta da olsun."*
      Altı saatlik bir ders tepsiye altı özdeş kart ve altı kez aynı `0/6`
      bırakıyordu. Ölçülen: örnek okulda **367 kart → 114 deste**, en
      kalabalığı 8. Rozet `1 saat ×6` biçiminde, blok boyunun yanında —
      köşeye iliştirilen bir işaret kartın ortalanmış üç satırını yana
      itiyordu.
      **`.pool-card` hâlâ "bekleyen BİR blok" demek**, ve bu bir sözleşme:
      sekiz dosyada ~40 test onu sayıyor, "N blok bekliyor" ondan geliyor.
      Deste bir **düzen**, bir gruplama değil.
      **Bir saat bir z-index'e gitti ve dersi CLAUDE.md'ye yazıldı (tuzak
      84):** üstteki kartın `z-index: 3`'ü *statik konumlu bir kutuda hiçbir
      şey yapmıyordu*, gömülü kopyalar onun üstüne boyanıyordu, ve rozetin
      kutusu · hesaplanmış rengi · `elementFromPoint` cevabı **vardı** ama
      kendisi görünmüyordu.
- [x] **W4 Ders girişi KENDİ SEKMESİNE çıktı.** *"Ders ekleme tarafı çok daha
      pratik hale getirilmeli, neden? Çünkü hocaları onu bunu ayarlıyorsun ama
      DERS EN ÖNEMLİ KISIM."* Yedinci sekme, **Müsaitlik ile Program
      arasında** (kullanıcı seçimi). Kurulum dört adımdan **üçe** indi;
      "Kurulum durumu" panelinin ayağında ders sayısı, eksik uyarısı ve
      sekmeye giden kapı duruyor — o cümleyi kaybetmek taşımanın tek gerçek
      riskiydi. `Alt+1..7`. Şerit standardının beş maddesi yedi sekmede de
      ölçülüyor.
- [x] **W5 Şeritte üç mod: `Sınıftan · Öğretmenden · Genel`.** Kullanıcının
      kendi cümlesi. İskelet **Müsaitlik şeridinin birebir aynısı** — soruyu
      soran bir grup, hangisinin açık olduğunu *söyleyen* bir grup — ve seçici
      sağ sütunda, çünkü iki sekme aynı iki soruyu iki ayrı şekille sormamalı.
      Odaklanmış modda form o ekseni **hiç sormuyor**: asıl kısalma bu.
      Elle sıralama orada kilitli ve sebebi yazılı (alt küme ≠ dizi).
- [x] **W6 Sınıf artık HATIRLANIYOR.** Eski form tam olarak korunması gereken
      alanı sıfırlıyordu (`setNewLesson({ ...newLesson, classId: '' })`), yani
      bir sınıfa sekiz ders girmek sınıfı sekiz kez seçmek demekti. Artık
      yürünen eksen kalıyor, değişen eksen sıfırlanıyor; `second` bayrağı
      öğretmeniyle birlikte gidiyor, çünkü onun iki branşından birini
      gösteriyor. **Enter da ekliyor** (`Rooms.tsx`'in deseni).
- [x] **W7 "Excel'den yapıştır" panelin SAĞ ÜSTÜNDE.** Dört panelde birden,
      aynı köşede (`.panel-head`). Form satırında altı kontrolün altıncısıydı
      ve açılınca o satırı ikiye bölüyordu; artık kutu formun **altında**
      açılıyor. `Paste` kontrollü hâle geldi (`open`/`close`), yani düğme
      panelin, kutu bileşenin.
- [x] **W8 Branş sırası AYARLARDAKİ sıra, alfabe değil.** Dört yerde birden
      istendi, dördü de yapıldı: Öğretmenler'in "Branşa göre" sıralaması,
      **branş çipleri**, çift branşlı hocanın **ikinci** branşı, ve Kurulum
      özetindeki "Branşlar" listesi. Tek ev `entities.ts`'teki
      `subjectRank()`; `listview.ts` `State`'i bilmemeye devam ediyor —
      `Facet`'e isteğe bağlı bir `order` alanı geldi, sırayı **çağıran**
      veriyor. Alfabe eşitlikte hâlâ karar veriyor, yani `order` yazmayan her
      çip satırı bugünkü davranışında kaldı. 
      
## X turu — on iki ham not (2026-08-28)

Kullanıcının bıraktığı on iki satır. Üçü ölçülebilir kusur çıktı ve üçü de
**yeşil bir süitin altında** duruyordu; her birinin yanına onu gören bir test
yazıldı ve üçü de mutasyonla denendi.

- [x] **X1 Kurulum adım numaraları kalktı.** `.step-no` iki yerde `i + 1`'den
      türüyordu (`Ribbon.tsx`, `setup/Progress.tsx`) ve gerekçesi şeridin kendi
      savıyla çelişiyordu: bu bir sihirbaz değil, her liste her an açık. Sayaç
      kaldı — 0 gösteren liste, eksik olanın nerede olduğunu söyleyen tek şey.
- [x] **X2 Dört liste simetrik.** Kök neden ölçüldü, tahmin edilmedi:
      `table.list { width: 100% }` artan alanı **genişliği yazılmamış** sütuna
      veriyordu. Derslikler'de o sütun Ad'dı (bir harf tutan kutu panel kadar);
      Sınıflar'da Renk **ve** Ad'dı, ve swatch sabit 5ch olduğu için Renk
      büyüyüp içi büyümüyor, adı sağa itiyordu — bildirilen "kayma" buydu.
      Artık `width: max-content`: her sütun ya merdivende ya kendi kontrolü
      kadar. **Ad dördünde de 187 px**, ve listeler arasında geçerken sütunlar
      yerinde duruyor. Branşlar da aileye katıldı (`step-panel`, `panel-head`,
      `table-scroll`, `.form-row` eylem hücresi), Enter dört listede de ekliyor.
- [x] **X3 Sol üstteki işaret SADE varyant.** Karar ölçümle çelişmiyor, ölçümün
      belirsiz bandında: `.brand-mark` %100'de 24,5 px, ve `ikon-karsilastir`
      20–32 px'i "bulanık ama ayırt edilebilir" diye kaydetmişti. Yan kazanç:
      sekme ile üst çubuk artık aynı dosyadan besleniyor, üç kopya ikiye indi.
- [x] **X4 Şerit başlığı ortalandı, çizgi çivilendi.** Kutu zaten
      `min-width` ile pediliydi ama çizgi `::after`'ın **statik konumundan**
      çiziliyordu, yani metnin bittiği yerden: yedi başlık yedi farklı x. Artık
      sabit `width` + `text-align: center` + tokenlardan hesaplanan bir `left`.
      Yedi başlık tek kelimeye indi (Liste · Yöntem · Kim · Görünüm · Süzgeç ·
      İçerik · Bölüm), kutu 9.8em'den **6.2em**'e düştü.
- [x] **X5 Tek branşlı hocada branş kutusu açılmıyor.** Öğretmenden modunda
      havuz zaten o kişinin branşları, yani tek seçenekli bir açılır liste
      hiçbir şey sormuyordu. Mantık değişmedi (`subjectValue` zaten havuzun
      ilkine düşüyor); branş **başlığa** taşındı: `MÇ · Matematik dersleri (12)`.
- [x] **X6 KAYAN ARTI — kusur (tuzak 85).** `cell.cellIndex` + `:nth-child(N)`
      her satırda saat başına bir `<td>` olduğu sürece kesindi; iki saatlik blok
      tek `colSpan=2` hücre olunca sayım kısa kaldı ve beam imlecin **soluna**
      düştü — solundaki her ikili için bir sütun. Çare bir sayı değil bir
      kimlik: `data-col`, hem gövdede hem saat başlığında, ve birleşmiş hücre
      **kapsadığı** sütundan yakılıyor. Başlığa `data-day` konmadı (tuzak 13).
      Yanında hayalet kart da düzeldi: `--ghost-span` ile blok kaç hücre
      kaplayacaksa o kadar geniş.
- [x] **X7 Havuz kartındaki sayı rozeti kalktı.** Sayı kaybolmadı:
      `data-count`, kartın `title`'ı ve "N blok bekliyor".
- [x] **X8 YAZDIRMA — kusur (tuzak 86).** Aleti önce düzeltmek gerekti: dokuz
      birleşimi gezen test `scrollHeight` okuyordu ve `safe center` ile
      hizalanan bir flex sütunu taşmasını o yoldan bildirmiyor — dokuzunda da 0
      diyordu, oysa "Büyük"te 714 px yerde **739 px** içerik vardı. Kök neden
      `--p-row: 23mm`: `--p-zoom` yalnız yazıyı çarpıyor, satır yüksekliği bir
      **taban** olduğu için hiçbir şey esnemiyordu. Sayı kaldırıldı — başlık
      ihtiyacını alır, tablo **kalanı** (`flex: 1`), satırlar bölüşür. Yanında
      iki sessiz ekran↔kâğıt ayrışması kapandı (`3.25rem`'lik satır, `6px`↔`4mm`
      pay). Ölçüm: 9 birleşim × 2 ortam, taşma **0**, sayfa **tam dolu**.
- [x] **X9 Yan sütun sayfanın boyunu belirlemiyor.** `.cols` bir grid, satırı
      `max(sol, sağ)`, ve `aside` için stylesheet'te **hiçbir kural yoktu**.
      Artık yapışkan, `100cqh` ile tavanlı ve kendi içinde kayıyor; `.main`
      bunun için bir `container-type: size` konteyneri oldu (ve ikisi de
      `@media print`'te geri alınıyor — tuzak 32). Kapasite özeti de tavanlandı.
      Ölçüm: Derslikler 1092 → 994, Yazdır 1491 → 966, Öğretmenler 2310 → 1189.
- [x] **X10 Şeridin kendiliğinden gizlenmesi artık bir ayar.**
      `ders-programi-serit-gizle`, Ayarlar → Görünüm. Katlama tercihinden ayrı
      bir anahtar ve sebebi yazılı: biri "şeridi istemiyorum", öteki "okurken
      kıpırdamasın". Varsayılan açık (bugünkü davranış), `storageReport`'a
      satırı yazıldı, `normalize` hem string hem boolean alıyor (tuzak 44).
- [x] **X11 Ayarlar ALTI bölüm.** `Planlar` Veri'den ayrıldı — orası yedi panel
      ve dört ayrı soruydu. Görünüm'de iki yoğunluk tek panelde iki soru oldu,
      **tema** oraya geldi, "Yazdırma bundan etkilenmez" paneli bir ipucu satırı
      oldu. Ayrıca **"Taslaktan başla" iki yerde kopyalanmıştı** (birebir aynı
      hata cümlesiyle); `components/DraftStart.tsx` oldu.
- [x] **X12 Bir kaç yol boyu temizlik.** `npm run tipler` iki tip hatasıyla
      kırmızıydı (`program.spec.ts`), düzeltildi. `hareket.spec.ts`'in sabit
      200px'lik kaydırması **hesaplanan** orta noktaya çevrildi: o sabit yalnız
      Kurulum'un sayfası yan sütun yüzünden uzunken bir ortaydı.

## Y turu — arayüzün şekli — **BİTTİ ✅** (2026-08-28)

Kullanıcının on maddesi. Hepsi tek bir aileden: **ekranın şekli tutarsızdı.**
Branş listesi onu okuyan açılır listeden bir sekme uzaktaydı, Kurulum'un sağ
sütununda gereksiz bir ikinci panel vardı, Kontrol'ün üç süzgeci birbirinin
aynıydı ve sayfa üç ekran sürüyordu, liste tabloları panellerinin yarısını
kaplıyordu, ve sağdaki blok her ekranda başka bir x'te başlıyordu.

**Adım 1 hiç ürün kodu yazmadı: ölçtü.** İki sayı bu turun bütün düzen
kararlarını belirledi ve ikisi de [STATUS.md](STATUS.md)'de duruyor.

- [x] **Y1 Sekme adları.** `Kurulum → Okul` (ilke 1 "kurulum yok" diyor ve ilk
      sekmenin adı Kurulum'du; üstelik artık branşları da tutuyor),
      `Yazdır → Çıktı` (isimler arasındaki tek fiildi). Ad çakışması yüzünden
      zorunlu ikinci yeniden adlandırma: Ayarlar'ın `Okul ve zil` bölümü
      **`Zil ve günler`** oldu — tuzak 49/74, bir düğme üç piksel ötedeki
      sekmenin adını taşıyamaz.
- [x] **Y2 Branşlar Okul'un 2. adımı.** Sıra artık bağımlılık zinciri:
      `Derslikler · Branşlar · Öğretmenler · Sınıflar`. Sınıf bir dersliği
      gösterir, öğretmen listeden bir branş seçer. `Subjects.tsx` kendi
      `.cols`'unu ve `<aside>`'ını bıraktı (iç içe `.cols` `mainList()`'i
      kırardı); yan paneli `setup/Summary.tsx`'in bir dalı oldu.
- [x] **Y3 Yeni proje BOŞ branş listesiyle doğuyor.** "Hazır branşlar" paneli
      21 gömülü branşın hepsi zaten listede olduğu için her yeni projede
      `(0)` yazıyordu — yani işe yaradığı tek ekranda boştu.
      **Ve bu, kayda değer bir kusuru ortaya çıkardı:** `migrateV2toV3`
      `emptyState().settings`'i yayıyordu, yani v1/v2 yedeklerinin branş
      listesi sessizce boşalacak ve her öğretmenin branşı "listede değil"e
      düşecekti. Düzeltildi, testi yazıldı, **mutasyonla denendi.**
- [x] **Y4 "Kurulum durumu" silindi.** Şeritte zaten duran dört sayacı üç
      piksel altında tekrarlıyor, sekme çubuğunda zaten duran bir kapıyı
      gösteriyordu ("çok fazla kaydırma olmuş, gereksiz"). Söylediği tek iki
      şey — "N sınıfın hiç dersi yok" ve haftalık saat cümlesi — Özet'e taşındı.
      Sağdaki panelin adı artık her adımda **Özet**.
- [x] **Y5 Renkler paneli Ayarlar'dan Özet'e.** Renk burada bir kimlik ve
      swatch'lar zaten o ekranda. Yalnız yeniden dağıtmanın gerçekten bir şey
      **değiştireceği** zaman çiziliyor: sağlıklı bir projede panel hiç yok.
- [x] **Y6 Ayarlar beş bölüm.** `Zil ve günler · Kurallar · Görünüm ·
      Planlar ve yedek · Hakkında`. 762 satırlık `Data.tsx` bölündü: dosya,
      klasör, paket ve yedekler plan kitaplığının yanına; sürüm, güncelleme,
      "veriler nerede", örnek veri ve sıfırla `Hakkında`'ya. **`Hakkında`,
      `Program hakkında` değil** — ikincisi `name: 'Program'` sorgusuna cevap
      verirdi (tuzak 49).
- [x] **Y7 Kontrol tek sayfa.** Üç süzgeç (Hepsi · Sorunlar · Kapasite) kalktı;
      okuyanın hükmü "üçü de aynı" idi ve büyük ölçüde doğruydu, çünkü herkesin
      geldiği panel üçünde de vardı. `.panel-grid` satır sıralı yerleştiriyordu,
      yani her satır en uzun paneli kadar uzundu — 25 öğretmenlik okulda sayfa
      üç ekrandı, çoğu boşluk. Artık iki sabit sütun, her tablo kendi içinde
      kayıyor, **ölçülen: 1,09 ekran.** Şerit süzmüyor, **götürüyor**:
      `Sorunlar (N) · Öğretmenler · Sınıflar · Derslikler`.
- [x] **Y8 Tek `.cols`, tek kenar genişliği.** `.wide-left`, `.narrow-right` ve
      `.solo` silindi. Sağ ray **her ekranda** var, içi boş olsa bile — bir
      bazen yok olan ray, oynayan bir raydır. Dersler'de mod değiştirmek
      listenin sağ kenarını yüzlerce piksel oynatıyordu; Genel artık `Ders
      yükü` özetini alıyor. Ölçülen: **on dört ekranın on dördünde ray tam
      olarak aynı x'te (1568 px).**
- [x] **Y9 Liste satırları panelin sonuna kadar.** Dört aday ölçüldü;
      `width: 100%` ve `min-width: 100%` paneli dolduruyor **ama fazlalığı
      doğrudan Ad'a veriyor** (Derslikler'de 187 → 640,8 px), yani bir önceki
      turun şikayetini geri getiriyor. Çalışan şey kutuyu doldurmak **ve son
      sütunu serbest bırakmak** — o sütun zaten boş ve `Sil`'i sağa yaslı
      tutuyor. Ad üç listede de **değişmedi**.
- [x] **Y10 Dersler başlığı saati de söylüyor.** `Dersler (99)` →
      `Dersler · 99 ders · 433 saat`; odaklanmış modda da aynı ikili. Şeridin
      `Toplam`'ıyla aynı olduğu teste bağlandı.

### Bu turda ölçülen, iddia edilmeyen

| Ne | Değer |
|---|---|
| Tablonun panel kenarına uzaklığı (önce) | Derslikler **-1094 px** · Sınıflar -965 · Öğretmenler -496 |
| Tablonun panel kenarına uzaklığı (sonra) | **-1 px**, üç listede de, %100/110/125'te |
| `Ad` sütunu | 187 / 205,8 / 233,8 / 280,6 — üç listede de aynı, **değişmedi** |
| `--aside-w` | **23,5rem** — bağlayıcı olan Müsaitlik'in `.entity-list`'i |
| Rayın x'i | on dört ekranın on dördünde **1568 px** |
| Kontrol sayfası | 3 ekran → **1,09 ekran** |

### Bu turda çıkan yeni tuzak

- **87. `i18n.test.ts`'in ölü anahtar tarayıcısı YORUMLARA da bakıyor.** Bir
  arayüz metnini yeniden adlandırmak sözlük girdisini öksüz bırakır ve
  **hiçbir şey söylemez**. Mutasyonla doğrulandı: `'Kurulum': 'Setup'` ve
  `'Yazdır': 'Print'` gerçekten ölü anahtarlar olarak geri kondu ve süit
  **yeşil geçti**, çünkü o kelimeler hâlâ on beş kadar İngilizce yorumda
  duruyor. Tuzak 80'in ailesi: bir karakter üstünden yapılan tarama, o
  karakterin **rolünü** değil kendisini görüyor.

### ŞİMDİ SIRADA

Bu turun kendi bıraktığı borç yok; on maddenin onu da bitti, her biri ölçüldü,
ve **`npm run kontrol` çıkış kodu 0** (612 birim · 466 E2E · 22 site · 7
çözücü). İki not:

1. **Tur boyunca görülen tek tük düşmelerin sebebi bulundu ve kod değildi.**
   Ölçüm betiklerim `npm run build` çağırıyordu, yani süit `dist/index.html`'i
   okurken dosya altından yeniden yazılıyordu. İlk teşhis "paralel yükte
   kararsızlık" idi ve yanlıştı. **Bir süit koşarken derleme yapılmaz.**
2. **Görsel kanıt alındı.** `npm run ekran` iki temada on dokuz görüntü
   üretti ve **bakıldı** — Y8/Y9/Y10'u yargılayabilecek hiçbir iddia yok
   (tuzak 82). Sahne adları da güncellendi (`1-okul`, `8-cikti`,
   `11-ayarlar-hakkinda`).


---

## Ham notlar — kullanıcının kendi satırları

Bu turların kaynağı. Hiçbiri silinmedi; her satırın nereye gittiği yanında.

**X turu (2026-08-28) · on iki satır, on ikisi de bitti:**

> Kurulumda Derslikler Öğretmenler ve SInıfların yanında 1 2 3'ü kaldır. → X1
> Tüm Listeleri de olabildiğince birbiriyle simetrik ve uyumlu yap. → X2
> Sınıflar listesinde ad niye o kadar kaymış ve ayrıca o kadar uzun. Derslikte de çok uzun. Uzun olması daha iyiyse beni ikna et ve öyle kalsın. → X2
> Sol üstteki logonun küçüğü kullanılsın. → X3
> İkinci barın açılıp kapanması ayarlarda bir ayar olsun. → X10
> İkinci barın en başındaki yazıdan sonra gelen çizgi her sectionda aynı yerde olsun ve yazı ortalansın gerekirse ona uygun bir yazı seçilsin. → X4
> Öğretmenin tek bir branşı varsa seçme tuşu açılmasın dersler sectionu öğretmenden seçeneğinde, varsa tabii ki açılsın. Başlıkta branşı da yazsın. → X5
> Programda blok saatlerinin yeni mantığından dolayı önizleme artısı kaymış durumda. Foto örnek fotolarda. → X6
> Programda kartların üzerinde gözüken kaç tane olduğunu gösteren rozet kalksın. → X7
> Yazdırmada yazıları büyük yapınca yazdırma bozuluyor. Önizleme doğru olmasına rağmen. → X8
> Öğretmenler kısmında ve yazdırma kısmında ve başka diğer yerlerde de yan bloklar çok uzun ve sırf onlardan dolayı tüm sayfanın uzunluğu artıyor buna bir çözüm bul. → X9
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. Sectionları artırabilir azaltabilir düzeni değiştirebilir her şeyi yapabilirsin. → X11, sonra Y6

**Y turu (2026-08-28) · on satır, onu da bitti:**

> Branşlar kuruluma gelsin. → Y2
> Branşlarda yanda hazır eklenebilirleri ekleyelim. → Y3
> Kurulum müsaitlik falan işte üst taraftaki sectionların da isimleri daha güzel hale getirilebilir. → Y1
> Kurulum öğretmenlerde kurulum durumu dersler sekmesine gidinize gerek yok. Hatta direkt onu da silebilirsin çok fazla kaydırma olmuş gereksiz. → Y4
> Kurulum özeti ya da özet vebenziren çevrilebilir o. ya da artık ileride nasıl adlandıracaksak. → Y4
> Öğretmenler Sınıfflar dersliklerde yazdığı gibi derslerin içinde genelin yanında da toplam dersler yazsın. → Y10
> Kontrol tarafında hepsi sorunlar kapasite biraz fazla gereksizler gibi ya düzgün şekilde onları doldur ya da öyle gereksiz yapma. ayrıca çok aşağı doğru gidiyor daha mantıklı bir çözüm bulunabilir mi? → Y7
> Listelerdeki satırlar en sona kadar gitsin. Böyle cücük kadar oldular güzel de gözükmüyor. → Y9
> Listelerin yanındaki bloklar kesinlikle sağ sol oynatma olmasın adamakıllı ortalansın ve sığdırılsın. → Y8
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. Sectionları artırabilir azaltabilir düzeni değiştirebilir her şeyi yapabilirsin. → Y6
> Tüm sectionları cesurca her şeyi değiştirebilsirsin. → Y1–Y10'un tamamının izni


Derslerin blok saatleri 2 3 ve 4 de olabilsin.
Branş isimleri değiştirme de olsun.
Sıralamada aşağı yukarı işareti düzgün olsun.
Öğretmenin bilgisine girip bir sınıfı başka bir hocaya aktarma olsun.
Aynı şekilde öğretmenin bilgilendirmesine girip de yapılabilir olsun bu.
ASC derslerinde ekleme ya da değiştirme kısmına bak.
Uygulamanın windows çubuğundaki simgesi büyük simge olsun.
Babamın zaten windowsu bilgisayarın ölçeklenmesi çok büyük o sebeple biz de büyük yaptık ama devasa oldu. ölçeklendirmeyı azatltmamız lazım.
Dosyadan aç biraz sıkıntılı gibi ya da yavaş.
Çıktıda da blokd dersler birlikte gözükmeli programdaki gibi birleşik görünsünler.

Benden çıktılar için ve asc dersler tarafı için foto iste eğer örnek fotolarda atmadıysam.
Readmenin ingilizce olması ve githubtaki her şeyin ingilizce olması ve github sayfasının tamtakır olması lazım.
Babama indirdim exeyi zip virüs algılandı. .exeyi açarken de window engelledi yine de açmak istiyor musun dedi nedendir bunu düzeltelim.
Kontrol kısmı çok saçma olmuş. biraz daha düzgün olmalı. Alt sekmede bir şeyler seçiyoruz ama değişmiyor onu ayarlamak lazım.
Ayarlarda görünüm kısmı biraz daha düzenlenmeli. Bir de çok fazla info var ve çok uzunlar her yerde infoları olabildiğince anlaşılır kısa ve öz yap.
Hareket ve Dil solda olmalı. Hatta dil istersen başka yere bile geçebilir.
Ayarlar hakkında kısmında sağa sola kaydırma olmasın.
Hiçbir yerde sağ taraaftaki bloklar sağa sola hareket ettirme olmasın. yukarı aşağı eh işte ama o da ne kadar az o kadar iyi.
Listelerde ekleme kısmı bloğu ile alttaki liste arasında çizgi olsun yani iki farklı blok olsun. ama yerleri değişmesin. Ekleme kısmı sadece biraz daha belirli olur arama kısmı da listede belli olur.
Çıktıda her ama her zaman simetri çok önemli. Satırların uzunluğu genişliği vesaire hep aynı olmalı.
Müsaitlikteki programların satıların uzunluğu artsın. aşağıdaki boşluk azalsın ama olabildiğince her zaman arayüze göre değişiklikler olsa dahai iki program da müsaitlikte tam ekranda gözüksün. Ayrıca sağ üstte haftanın darlığı açılsın mı kapalı mı kalsın özelliği olsun. Saatleri de oraya koyalım. ikinci şeritte olsun.
Ayarlardaki özel sectionlara özgü ayarlar o sectionun alt şeridinde sağm üstte gözüksün.
Çıktıdaki sağ blokların da aşağı yukarı gitme özelliği babam için biraz zor o sebeple ya yatay şekilde ya sağa sola ya da biraz daha geniş şekilde yapabiliriz aslında çünkü çıktı kısmında bayağı boşluk var ama artık çözebiliyorsak çözelim.


Benden çıktılar için ve asc dersler tarafı için foto iste eğer örnek fotolarda atmadıysam.


Öğretmenler listelerde branşlarda kısaltmalar.
Program kısmında branşlar kısaltmalar olsun sol tarafta.
Program otomatik dizmeye bakmak lazım.
Programda derslere sağ tıklayınca seçenekler gelsin: kaldır, dersi düzenle, dersi oraya sabitle.
