<img src="site/icon.svg" alt="Ders Programı" width="72">

# Ders Programı

Bir dershanenin haftalık ders programını dizmek için yazılmış tek dosyalık bir
araç. aSc Timetables'ın yerini alır — onun yaptığı işin bu kursla ilgili
yarısını yapar, o yarıyı ondan iyi yapmayı hedefler.

**Kurulum sihirbazı yok. Sunucu yok. İnternet gerekmez.** Hesap, şifre,
güncelleme zorlaması, kayıt yok.

---

## Hangi yolu seçmeliyim

Dört teslim yolu var ve **dördü de birebir aynı programı** verir — dördünün
içindeki sayfa aynı `dist/index.html`. Fark programda değil, programın
etrafında.

| | Ne yapılır | Kime | Güncelleme |
|---|---|---|---|
| **1. Dosya** | `Ders-Programi.html`'e çift tıkla | En hızlı yol. Denemek, taşımak, USB'yle götürmek | Yeni dosyayı indirip eskisinin üstüne koyarsınız |
| **2. Windows kurulumu** | `Kur.cmd`'ye çift tıkla | Kısayol, gerçek adres, çevrimdışı | `Guncelle.cmd` — yenisini kendisi indirir |
| **3. Site** | [Adresi tarayıcıda aç](https://alparslansemiz.github.io/ders-programi/) | Kurulum hiç istemeyen yol | **Kendiliğinden.** Yeni sürüm çıkınca program size söyler |
| **4. `.exe`** | Tek dosyaya çift tıkla | Aynı iş, ama klasöre yazma hiç sorulmadan çalışır | Yeni dosyayı indirirsiniz |

Karar veremiyorsanız: **3'ü açın.** Hiçbir şey indirmeden çalışır, çevrimdışı da
açılır, ve düzeltmeler size kendiliğinden gelir — bu dördü içinde güncellemesi
en kolay olan yol. Bilgisayarda **duran** bir program istiyorsanız 2'yi kurun.

### İndirme bağlantıları

Hiçbir şey derlemeye gerek yok — üçü de hazır dosya olarak iner:

- **[Ders-Programi.html](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.html)** — çift tıkla, tarayıcıda açılır
- **[Ders-Programi-Windows-kurulum.zip](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi-Windows-kurulum.zip)** — çıkar, `Kur.cmd`'ye çift tıkla
- **[Ders-Programi.exe](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.exe)** — çift tıkla, kendi penceresinde açılır

Bu adresler her zaman **en son sürüme** gider; sürüm numarası bilmeye gerek
yok. Giriş yapmak da gerekmez.

> ⚠️ **Henüz tek bir sürüm yayınlanmadı**, yani bugün bu üç bağlantı 404
> verir. İlk sürüm çıkana kadar aşağıdaki "kendiniz üretmek isterseniz"
> adımları geçerli. Sürüm yayınlamak: aşağıda *Sürüm çıkarmak*.

Aşağıdaki dört bölüm dördünü de adım adım anlatır.

---

## 1 · Dosya — çift tıkla, çalışsın

En kısa yol, ve **asıl teslim yolu** budur.

1. **[Ders-Programi.html](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.html)** dosyasını indirin.
2. Nereye isterseniz koyun — Masaüstü, Belgelerim, USB, fark etmez. Yanına
   başka hiçbir dosya gerekmez.
3. **Çift tıklayın.** Varsayılan tarayıcınızda açılır.

Kendiniz üretmek isterseniz:

```bash
npm install     # yeni bilgisayarda bir kez
npm run build   # -> dist/index.html
```

Bu dosya **depoda durmaz** (`.gitignore`'da): derleme çıktısıdır, kaynak
değil. İndirilebilir olmasının sebebi de bu — her sürümde yeniden üretilip
sürüme eklenir.

Tek bir dosyadır: JavaScript, CSS ve yazı tipi dahil her şey onun içinde
gömülüdür. İnternet bağlantısı olmadan da açılır, çünkü açarken hiçbir yere
bağlanmaz.

**Bu yolun sınırları.** Program `file://` adresinden açılır ve `file://` bir
*köken* sayılmaz. Pratikte şu üç sonucu var:

- Verileriniz, o tarayıcıdaki **bütün yerel HTML sayfalarıyla** aynı depoyu
  paylaşır. Bugüne kadar bir sorun çıkarmadı, ama 2. yol bunu çözer.
- Ayarlar → Veri → *Nereye kaydedilsin* ile klasör seçmek **çalışır**, ama
  tarayıcı verdiğiniz izni her açılışta yeniden sorabilir.
- Çevrimdışı çalışması bir service worker'a değil, dosyanın kendisine
  dayanır — ki bu aslında daha sağlamdır.

---

## 2 · Windows kurulumu — yerel site (`dersprogrami.localhost`)

Program bu yolda **kendi adresine** sahip olur:
`http://dersprogrami.localhost:7654`

Bu bir internet adresi **değildir**. Kendi bilgisayarınızı gösterir; dışarıya
hiçbir şey gitmez, dışarıdan hiçbir şey gelmez. `*.localhost` adreslerini
Chrome ve Edge kendileri çözer, yani `hosts` dosyası düzenlemek ya da yönetici
olmak **gerekmez**.

### Klasörü almak

**[Ders-Programi-Windows-kurulum.zip](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi-Windows-kurulum.zip)** — indirin ve **çıkarın** (zip'in içinden çalıştırmayın).

Kendiniz üretmek isterseniz `npm run paket` → `dist-kurulum/`. **Babaya giden
tek şey bu klasördür.** İçinde şunlar var:

```
dist-kurulum/
  Kur.cmd          kurulumu başlatır
  Guncelle.cmd     yeni sürüm gelince
  OKU.txt          kullanıcı için, Türkçe, Notepad'de düzgün açılır
  kur.ps1          asıl kurulum betiği
  sunucu.ps1       ~150 satırlık dosya sunucusu
  icon.ico         kısayolun ikonu
  site/            programın kendisi (tek HTML + manifest + sw.js + simgeler)
```

### Kurmak (kullanıcı tarafı)

1. Çıkardığınız klasörü bilgisayara kopyalayın.
2. **`Kur.cmd`'ye çift tıklayın.**
3. Windows *"bilinmeyen bir uygulama"* uyarısı gösterebilir:
   **"Daha fazla bilgi"** → **"Yine de çalıştır"**. Bu uyarı dosyanın imzalı
   olmamasından çıkar, içeriğiyle ilgisi yoktur.
4. Açılan pencerede yazanları okuyun. Bitince yeşil **"Bitti."** yazar.

Kurulum şunları yapar, başka hiçbir şey yapmaz:

- Programı `%LOCALAPPDATA%\Ders Programı` klasörüne kopyalar.
- **Masaüstüne** ve **Başlat menüsüne** *Ders Programı* adında birer kısayol
  koyar.

Yönetici hakkı istemez. Kayıt defterine (registry) hiçbir şey yazmaz.
Node.js **gerekmez** — sunucu Windows'un kendi PowerShell'iyle koşar.

### Açmak

Masaüstündeki **Ders Programı** kısayoluna çift tıklayın. İki şey olur:

- **Siyah bir pencere açılır. Bu pencereyi kapatmayın.** Sunucu orada
  çalışıyor; kapatırsanız program da kapanır. Pencere bilerek gizlenmedi:
  gizli bir pencere, kapatılamayan bir program demektir.
- Tarayıcıda program açılır.

İşiniz bitince önce sekmeyi, sonra siyah pencereyi kapatın. Verileriniz
kaybolmaz.

### Bu yol ne kazandırır

Programın gerçek bir kökeni olur, ve bunun **ölçülmüş** üç sonucu vardır:

- **Çevrimdışı açılır** — bir service worker kaydolabilir (`file://`'ta
  kaydolamaz). Fişi çekip denendi, açıldı.
- **Verileri kimseyle paylaşmaz** — makinedeki öteki yerel sayfalarla ortak
  depoda değildir.
- **Klasör izni hatırlanır** — Ayarlar → Veri → *Nereye kaydedilsin* ile
  seçtiğiniz klasörün iznini tarayıcı bu siteye saklayabilir.

Ölçülen bedel: açılış `file://`'ta 76 ms, burada 82 ms. Yani **6 ms**.

### Güncellemek

**`Guncelle.cmd`**'ye çift tıklayın. Başka hiçbir şey gerekmez: betik en yeni
sürümü **kendisi indirir** (`releases/latest`), kurar ve ne yaptığını yazar.
İnternet yoksa hata vermez — yanındaki klasörde duran sürümü kurar.

Yalnız program dosyalarını tazeler; **kısayollara ve verilerinize dokunmaz**.
Eski `site` klasörü silinip yeniden yazılır: üstüne kopyalamak, bir sonraki
sürümde *kaldırılan* bir dosyayı orada bırakır ve service worker onu
önbelleğinde tutmaya devam eder.

### Kaldırmak

1. Masaüstündeki ve Başlat menüsündeki kısayolları silin.
2. Şu klasörü silin: `%LOCALAPPDATA%\Ders Programı`
   (Dosya Gezgini'nin adres çubuğuna bunu yazıp Enter'a basarsanız açılır.)

Program başka hiçbir yere hiçbir şey yazmaz.

### Bir şey ters giderse

| Ekranda ne yazıyor | Ne yapmalı |
|---|---|
| *"Port 7654 kullanımda"* | Program zaten açık. Görev çubuğunda siyah pencereyi arayın |
| Tarayıcı *"sayfa açılamıyor"* diyor | Siyah pencere kapanmış. Kısayola yeniden çift tıklayın |
| Hiçbiri işe yaramıyor | Siyah pencereyi kapatın, kısayola yeniden tıklayın. Verileriniz etkilenmez |

---

## 3 · Site — bir adresten açmak

**<https://alparslansemiz.github.io/ders-programi/>**

İndirilecek bir şey, çıkarılacak bir ZIP, çalıştırılacak bir betik yok: adresi
açarsınız, program oradadır. Orada da **backend, veritabanı, hesap, oturum ya
da API yoktur** — yayınlanan şey `npm run build:site`'ın ürettiği bir klasör
dolusu statik dosyadır.

İlk açılıştan sonra bir service worker sayesinde **çevrimdışı** da açılır —
fişi çekip denendi.

### Masaüstüne almak (isteğe bağlı)

Chrome ya da Edge'de adres çubuğunun sağındaki **Yükle** simgesine basın.
Program kendi penceresinde, kendi simgesiyle, sekmesiz açılır — bir masaüstü
uygulamasından ayırt edilmez, ama güncellemesi hâlâ kendiliğinden gelir.

> **Not:** her tarayıcının verisi kendine aittir. Siteyi işten açıp evden
> açarsanız iki ayrı boş program görürsünüz. Programı taşımanın yolu üst
> çubuktaki **Dosyaya kaydet** ile alınan dosyadır.

---

## 4 · `.exe` — tek dosya, ve klasör hiç sorulmadan

Bu yolun tek farkı şudur: **"nereye kaydedilsin" sorusunun cevabı zaten
verilmiştir.** Program bütün planları `Belgelerim\Ders Programı` klasörüne
kendiliğinden yazar — tıklama yok, izin penceresi yok, klasör seçici yok — ve
her gün için ayrı bir yedek bırakır (son 10 gün).

> ⚠️ **Bu yol henüz Windows'ta denenmedi.** Kod yazıldı, Linux'ta derlendi ve
> çalıştı; `.exe` üreten iş akışı yazıldı ama **bir kez bile koşturulmadı**.
> Aşağıdaki adımlar tarif edilmiştir, doğrulanmamıştır. Bugünkü sağlam yol
> hâlâ 1 ve 2'dir.

### `.exe`'yi almak

**[Ders-Programi.exe](https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.exe)** — tek dosya, doğrudan iner.

Kendi Windows makinenizde derlemek isterseniz (Rust ve Node kurulu olmalı):

```bash
npm ci
npm run exe          # -> src-tauri/target/release/
```

Bu depo Fedora'da geliştiriliyor ve Windows'a çapraz derleme güvenilir değil;
`.exe` bu yüzden GitHub Actions'ta `windows-latest` üstünde doğuyor.

### Çalıştırmak

1. `Ders-Programi.exe`'yi nereye isterseniz koyun.
2. **Çift tıklayın.** Program kendi penceresinde açılır — tarayıcı sekmesi
   yok, siyah pencere yok, adres çubuğu yok.
3. Windows *"bilinmeyen yayıncı"* uyarısı gösterirse:
   **"Daha fazla bilgi"** → **"Yine de çalıştır"**.

Dosyanın adını beğenmezseniz değiştirebilirsiniz — pencere başlığı ve program
adı dosya adından değil, programın kendisinden gelir. (Sürümdeki ad yalnız
ASCII, çünkü indirme adresindeki bir "ı" harfi tarayıcıdan tarayıcıya farklı
kodlanıyor.)

**Kurulum yoktur.** Dosya nereye konduysa oradan çalışır; taşınabilir.

**WebView2 gerekir.** Windows 10 ve 11 bunu kendisi getirir, yani neredeyse
her makinede zaten vardır. Yoksa program bir pencere açıp indirme bağlantısını
gösterir.

### Verileriniz nerede

İki yerde, ve bu **bilerek** böyle:

- `Belgelerim\Ders Programı\` — bütün planlar, her değişiklikten sonra
  kendiliğinden. Bu bilgisayarı değiştiriyorsanız **taşınacak şey bu
  klasördür.**
- Programın kendi deposu — `%LOCALAPPDATA%\com.dersprogrami.arac`
  *(Linux'ta ölçüldü: `~/.local/share/com.dersprogrami.arac`; Windows yolu
  beklenendir, doğrulanmadı.)*

Bu yüzden `.exe`'de Ayarlar → Veri bölümü **başka bir şey söyler**: öteki üç
yolda "taşınan tek şey dosyaya kaydettiğinizdir" cümlesi doğrudur, burada
değildir.

### Kaldırmak

`Ders-Programi.exe` dosyasını silin. Kayıt defterine hiçbir şey yazılmaz,
kısayol oluşturulmaz.

Programın deposunu da temizlemek isterseniz `%LOCALAPPDATA%\com.dersprogrami.arac`
klasörünü silin. **`Belgelerim\Ders Programı` sizin veriniz** — onu silmek
programı değil, çalışmanızı siler.

---

## Güncelleme — düzeltme size nasıl ulaşır

Hangi sürümde olduğunuz her zaman **Ayarlar → Veri → "Sürüm ve güncelleme"**
bölümünde yazar. Bir şey bildirdiğinizde sorulacak ilk şey odur.

| Yol | Ne olur |
|---|---|
| **Site** | Yeni sürüm yayınlanınca program **kendisi görür** ve üstte bir satırla söyler: *"Yeni sürüm hazır."* **Yenile** deyene kadar hiçbir şey değişmez — yarım kalmış bir sürükleme sizin elinizden alınmaz. Verileriniz güncellemeden etkilenmez |
| **Windows kurulumu** | `Guncelle.cmd`'ye çift tıklarsınız. En yeni sürümü kendisi indirir. İnternet yoksa hata vermez, yanındaki klasörde duranı kurar |
| **Dosya / `.exe`** | Bu iki kopya **hiçbir yere bağlanmaz** — sürümünü gösterir, ama kendini güncellemez. Yenisi çıktığında dosyayı yeniden indirip eskisinin üstüne koyarsınız |

Site kendini güncelleyebiliyor da öteki ikisi güncelleyemiyor değil:
**güncelleyemesin diye öyle yazıldılar.** Çift tıklanan dosyanın tek iddiası
çalışırken ağdan tek bayt indirmemesi, ve bu iddia her koşuda `grep` ile
denetleniyor. Bir sürüm denetimi o iddiayı bozardı.

---

## İlk kurulum — bir kez, ve en önemlisi bu

Programı ilk kez kuran kişi **bir tek şeyi** yapsın; gerisi kendiliğinden yürür.

1. Programı açın (yukarıdaki dört yoldan biri).
2. **Ayarlar → Veri → "Nereye kaydedilsin" → `Klasör seç…`**
3. **Belgelerim**'i seçin. Tarayıcı izin isterse **İzin ver** deyin.

O andan sonra program **her değişikliği** o klasöre de yazar: bütün planlar tek
bir `ders-programi-tumu.json` dosyasında, artı her gün için ayrı bir yedek (son
10 gün). Hiçbir şey hatırlamanız, hiçbir düğmeye basmanız gerekmez.

Bu adım atlanırsa program yine çalışır — ama işiniz **yalnızca tarayıcının
deposunda** durur, ve tarayıcıda "tarama verilerini temizle" demek onu siler.

> **Yeni bir bilgisayara ya da yeni bir sürüme taşımak** de aynı dosyayla
> olur: **Ayarlar → Veri → Tümünü dosyadan aç** → o klasördeki
> `ders-programi-tumu.json`. Gidiş de dönüş de tek dosya.

---

## Verileriniz — dört yolda da geçerli olan

> Programınız **bu bilgisayarda ve bu tarayıcıda** durur. Başka bir tarayıcı
> onu görmez, ve tarayıcıda "tarama verilerini temizle" derseniz **silinir**.
> (`.exe` yolunda bir kopya zaten Belgelerim'dedir, orada bu risk yoktur.)

> ⚠️ **Dört yolun her birinin deposu AYRIDIR.** Çift tıklanan dosyada girdiğiniz
> program sitede görünmez, sitede girdiğiniz `.exe`'de görünmez. İkisi de
> durur, ama iki ayrı program olurlar. **Bir yolu seçin ve onda kalın.**
> Yol değiştirmeniz gerekirse taşıma tek adımdır: eskisinde
> **Ayarlar → Veri → Tümünü dosyaya kaydet**, yenisinde
> **Tümünü dosyadan aç**. Hangi kopyada olduğunuz
> **Ayarlar → Veri → "Sürüm ve güncelleme"** bölümünde adıyla yazar.

Öğrenilecek tek alışkanlık: *değişiklik yaptın, yedek indir.* Üst çubuktaki
**Dosyaya kaydet** bunun içindir.

Hiçbir alışkanlık istemeyen ikinci bir yol daha var: **Ayarlar → Veri →
Nereye kaydedilsin** ile bir klasör seçerseniz bütün planlar oraya
kendiliğinden yazılır ve her gün için ayrı bir yedek kalır (son 10).
`.exe` yolunda bu zaten açıktır.

Ayarlar → Veri bölümü ayrıca verinin **tam olarak hangi anahtarda, ne kadar
yer kapladığını** söyler — tahmin değil, gerçek sayılar.

---

## Sürüm çıkarmak

Yukarıdaki üç indirme bağlantısı bir **GitHub Release**'in varlıklarına gider.
Sürüm çıkarmadan o bağlantılar çalışmaz — Actions artefaktları onların yerini
tutmaz, çünkü giriş ister ve 90 günde silinirler.

`.github/workflows/surum.yml` üçünü birden üretir: HTML'i ve kurulum zip'ini
`ubuntu-latest`'te, `.exe`'yi `windows-latest`'te, sonra üçünü tek bir sürüme
ekler.

**Önce denemek** (hiçbir şey yayınlanmaz):

1. GitHub → **Actions** → **sürüm** → **Run workflow**.
2. `yayinla` kutusunu **işaretlemeyin**.
3. Koşu bitince **Artifacts** bölümünden üçünü de indirip bakabilirsiniz.

**Yayınlamak** — tek komut:

```bash
npm run yayinla -- 1.2.0
```

`package.json`'ı yazar, commit'ler, `v1.2.0` etiketini atar ve ikisini birden
iter. Kirli bir ağaçta, `main` dışında bir dalda ya da var olan bir etikette
**reddeder** — üçünün de doğru cevabı "tahmin et" değil.

Tek push iki iş akışını birden tetikler, ve ikisi de gerekli:

```
push main    -> site.yml   -> GitHub Pages   (babamın site yolu tazelenir)
push v1.2.0  -> surum.yml  -> Release        (üç indirilebilir dosya)
```

Etiketi unutmak sessiz bir hatadır: site güncellenir, `.html`/`.zip`/`.exe`
eski kalır. `npm run yayinla` tam olarak bunun için var.

Elle yapmak isterseniz: `git tag v1.2.0 && git push origin v1.2.0`, ya da
Actions → sürüm → Run workflow → `yayinla` ✓ → `etiket`: `v1.2.0`.

**Sürüm numarası arayüze girer.** `package.json`'daki değer derleme anında
dört teslim yoluna da damgalanır (`scripts/surum.mjs`) ve Ayarlar → Veri →
*Sürüm ve güncelleme*'de görünür. Aynı numara service worker'ın önbellek adına
da girer — sabit bir ad, yeni sürümün babama **bir açılış geriden** ulaşması
demekti.

İş akışı yayınlamadan önce kurulum klasörünü **denetler**: `.ps1` ve `.txt`
dosyaları UTF-8 BOM taşıyor mu (yoksa PowerShell 5.1 her "ı"yı bozar),
hepsi CRLF mi (yoksa Notepad `OKU.txt`'yi tek satır gösterir), ve `.cmd`
dosyaları yalnız ASCII mi (cmd.exe'nin kod sayfası Türkçe harfleri bozuyor).
Üçünden biri tutmazsa sürüm çıkmaz.

Sürüm notu `.github/surum-notu.md` dosyasında ve düzenlenebilir.

---

## Ne yapar

Altı sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar**.

- **Kurulum** — derslikler, öğretmenler, sınıflar, dersler. Excel'den yapıştırma
  kutusu var.
- **Müsaitlik** — kimin hangi saatte müsait olmadığı. Öğretmen, sınıf ve derslik
  için ayrı ayrı.
- **Program** — asıl ekran: satır = öğretmen (ya da sınıf), sütun = 6 gün × 12
  saat. Havuzdan sürükleyip bırakırsınız; **Otomatik diz** haftayı kendi dizer.
  Bir bırakma yasaksa sebebi somut yazar: *"MÇ o saatte 433 sınıfında"*.
- **Kontrol** — program dizilebilir mi, dizilemiyorsa neden. Kapasiteler, kural
  ihlalleri, yerleşemeyen dersler.
- **Yazdır** — her sınıf ve her öğretmen için bir program, **A4 yatay**. Hangi
  sayfaların basılacağı tek tek seçilir; bir kâğıda **1, 2 ya da 4** program
  sığdırılabilir ve kâğıttaki yazı boyutu ayrıca ayarlanır. Önizleme kâğıdın
  kendisidir — aynı ölçüler, aynı satır boyu.
- **Ayarlar** — okul ve zil düzeni, kurallar, branş listesi, görünüm (yazı
  büyüklüğü, ızgara yoğunluğu, hareket) ve veri.

Sekmelerin dışında kalanlar üst çubukta: **birden çok plan** arasında geçiş
(her plan kendi okulu, kendi öğretmenleri, kendi ızgarası — yeni plan, ad
değiştirme ve silme Ayarlar → Veri'de), geri/ileri al, dosyaya kaydet, dosyadan
aç, ve **Ctrl+K** ile *ara ve git*: bir öğretmenin, sınıfın ya da dersliğin
adını yazarsınız, onun kendi haftası açılır.

Açık ve koyu tema var. Yazı büyüklüğü %100–%150 arasında ayarlanır — bu araç
gözü iyi görmeyen biri için yazıldı.

---

## Geliştirme

```bash
npm install && npx playwright install chromium   # yeni bilgisayarda bir kez

npm run dev          # geliştirme sunucusu
npm test             # Vitest — saf mantık testleri (521)
npm run build        # dist/index.html tek dosya (ASIL TESLİM)
npm run build:site   # dist-site/ — PWA: tek dosya + manifest + sw.js + simgeler
npm run test:e2e     # Playwright — derler, sonra file:// üzerinde koşar (394)
npm run test:site    # site · sunucu · klasör testleri, http üzerinde (19)
npm run kontrol      # hepsi: tsc + birim + derleme + E2E + site + çözücü
npm run ekran        # iki temada ekran görüntüsü -> test-results/ekran/
npm run cozucu       # gerçek ölçekli çözücü stresi (34,8 sn — kontrol'ün parçası)
npm run sunucu       # yerel sunucu — http://dersprogrami.localhost:7654
npm run paket        # dist-kurulum/ — Windows'a giden TEK klasör
```

Üstündeki listede **olmayan** iki komut daha var; `kontrol`'ün parçası
değiller çünkü bu depoda bulunmayan araç zincirleri istiyorlar:

```bash
npm run font         # gömülü yazı tipini yeniden üretir  (Python + fontTools)
npm run exe          # .exe / ikili derler                (Rust)
npm run exe:test     # Rust tarafının testleri (6)        (Rust)
```

`npm run font` için bir kez: `python3 -m venv .venv && .venv/bin/pip install
fonttools brotli`. Kaynak yazı tipi depoda durur (`scripts/font-source/`,
OFL 1.1), yani ağ gerekmez.

E2E, dev sunucusunu değil **`dist/index.html`'i `file://` üzerinden** açar —
yani gerçekten çift tıklanacak dosyayı. Sürükle-bırak, yapışkan sütun, yazdırma
taşması ve renk kontrastı yalnız orada görünür.

**Arayüzde görünen bir şeyi değiştirdiyseniz `npm run test:e2e` çalıştırmadan
"bitti" demeyin.**

Mimari, veri modeli, kısıtlar ve bilinen tuzaklar: [CLAUDE.md](CLAUDE.md).
Durum ve ölçümler: [docs/STATUS.md](docs/STATUS.md) · Görevler:
[docs/TASKS.md](docs/TASKS.md) · Tasarım: [docs/DESIGN.md](docs/DESIGN.md).

---

## Teknoloji

Vite + React + TypeScript, `vite-plugin-singlefile` ile tek bir
`dist/index.html`'e gömülür (JS, CSS ve yazı tipi dahil). Çalışma anında ağdan
tek bayt indirilmez; bu iddia `temel.spec.ts` ve `site.spec.ts` tarafından
**mekanik olarak** doğrulanır.

Dört teslim yolunun dördü de aynı `dist/index.html`'i taşır. Windows kurulumu
onu bir dosya sunucusunun arkasına koyar, `.exe` ise Tauri ile kendi
penceresinin içine alır — ikisinde de arayüzün ikinci bir kopyası yoktur.

Ölçülen (2026-08-27, 1920×1080): `dist/index.html` **528 677 bayt**, `file://`
üzerinden ilk boyama **80 ms** medyan. `.exe` (Linux, sürüm derlemesi)
**3,64 MB**, açılıştan diske ilk yazıma **~1 sn** — Windows'ta ölçülmedi.
Bunlar bir tarih, kanun değil: yeni bir paket eklenince yeniden ölçülür.
