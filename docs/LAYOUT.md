# Yerleşim

Ekranda ne olduğu ve nereye konduğu: sekmeler, kabuk, şerit, ızgara, havuz, menüler ve diyaloglar.

Bu belge "ekranda ne var ve nereye konuyor" sorusunu cevaplar, "neye benziyor"
sorusu [DESIGN.md](DESIGN.md)'de. İkisi çakışırsa yerleşim burada, görünüş orada.
Buradaki kararlar bir izin listesi değil, bugünkü hâlin ve neden öyle olduğunun
kaydı: bir kararı değiştirirken gerekçeyi okumak işe yarar, ve değişiklik
[DECISIONS.md](DECISIONS.md)'ye yazılır.

## Ekran

Tarayıcıda hedef ekran 1920×1080 CSS pikseli: babanın 27 inçlik monitörü, fiziksel
piksel değil. Exe büyütülmüş bir pencerede açılır, ama Windows'un ölçeklemesi
mantıksal pikseli böler (%125'te 1536, %150'de 1280), yani exe'nin kutusu daha dar
olabilir ve düzen ölçümleri iki kutuda alınır (tuzak 107). Izgara yatayda kayar,
satır başı sütunu yapışkan.

## Sekmeler

Yedi sekme, bu sırayla. Alt+1'den Alt+7'ye kadar bu sırayla açılırlar.

| Sekme | Ne için |
|---|---|
| Okul | okulun sayılabilir dört listesi: derslikler, branşlar, öğretmenler, sınıflar |
| Müsaitlik | öğretmen, sınıf ve dersliğin kapalı saatleri |
| Dersler | hangi sınıfın hangi öğretmenden haftada kaç saat ders aldığı |
| Program | haftalık ızgara, havuz, sürükleme ve otomatik dizme |
| Kontrol | programın dizilip dizilemeyeceği ve neden: sorunlar, Danışman, kapasite |
| Çıktı | kâğıda basılacak sayfalar ve düzeni |
| Ayarlar | zil ve günler, kurallar, görünüm, planlar ve yedek, hakkında |

Okul yalnız listeleri, Ayarlar yalnız ayarları tutar: dönem başında doldurulan
şeyle yılda bir dokunulan şey aynı ekranda durmuyor. Dersler kendi sekmesi, çünkü
en çok kullanılan ekran ve bir sihirbazın dördüncü adımından geçilerek varılmıyor.
Her sekmenin bir bölüm rengi var ([DESIGN.md](DESIGN.md)). 1280 pikselin altında
sekme etiketleri gizlenir ve erişilebilir ad kalır.

## Üst çubuk

Soldan sağa: marka işareti, yedi sekme, durum çipi, boşluk, okulun adı ve plan
seçici, geri al ve ileri al, dosyaya kaydet ve dosyadan aç, ara ve git (Ctrl+K),
klavye kısayolları, araç şeridi aç kapa, tema.

- **Marka işareti** bir düğme değil ve `aria-hidden`, çünkü programın adı zaten belge başlığı. `<img src>` değil satır içi SVG, çünkü dosya dışarıdan bir şey istemiyor, ve boyu `--ui-scale`'i izliyor.
- **Durum çipi** her sekmede sorunu adıyla söyler ve Kontrol'e götürür.
- **Plan seçici** tek plan varken de görünür: "hangi planı düzenliyorum" sorusunun cevabı orası, ve ancak iki plan olunca beliren bir kutu planların var olduğunu öğretemezdi. Plan yaratan, adlandıran ve silen her şey Ayarlar → Planlar ve yedek'te, çünkü üst çubuk bir tıklamanın bir öğleden sonrayı götüremeyeceği yer olarak kalıyor. `Sıfırla` da bu yüzden Ayarlar'da.
- **Dosyaya kaydet** ve **dosyadan aç** üst çubukta, çünkü veri kaybına karşı önlem görünür olmalı. İkisi tek bir plan yazar ve okur, bir paketi reddedip yolunu gösterir (tuzak 30).
- Çubuk daralırken önce boşluk, sonra çipin cümlesi (noktası kalır, çünkü ekran meşgulken yok olan bir durum güvenilmez bir durum), sonra belge adı feda edilir. Sekmeler feda edilmez (tuzak 48).

## Araç şeridi

Üst çubuğun altındaki ikinci satır, açık sekmenin araç şeridi (Word, Excel ve aSc
gibi). Sekmeler bir süre soldaki bir rayda durdu, ve ray Program dışındaki
sekmelerde harcanacak yeri olmayan bir genişliği götürüyordu. Şerit kendi satırı
olduğu için bir satıra mal oluyor, ve bu yüzden katlanabiliyor: katlanınca tamamen
gider ve yerini ızgaraya bırakır. Katlama düğmesi üst çubukta, çünkü katlanmış bir
şeridin kendi düğmesine yeri yok. Şerit okurken kendiliğinden de çekilir, bu
Ayarlar → Görünüm'den kapatılır.

Şeride "şu an neye bakıyorum" ve "tek tıkla ne yaparım" konur. Liste, sayaç ve
açıklama panelde durur.

### Şerit standardı

`e2e/serit.spec.ts` beş maddenin beşini de ölçer, çünkü şekli olmayan bir şeyi bir
test koruyamaz.

1. Yedi sekmenin yedisi de şerit çizer ve şeritler aynı yükseklikte, %100'de de %150'de de. Yüksekliği sekmeyle gelip giden bir şerit altındaki her şeyi zıplatır.
2. Her şerit bir başlıkla (`.ribbon-label`) açılır: düğmelerin hangi soruyu cevapladığı. Bir değer taşıyan grup `.ribbon-value` kullanır, çünkü başlık büyük harfli ve soluk, ve bir adı o sesle okumak onu başlık gibi gösteriyor.
3. Gruplar `<Sep/>` ile, sağa yaslanan grup `<Spacer/>` ile ayrılır.
4. Her düğmede bir simge ve bir kelime olur. Simge tek başına ilk seferde okunmaz ve iki test katmanında ada dönüşmez (tuzak 56), kelime tek başına bir düğmeyi komşusundan bir bakışta ayırmaya yetmez, göz önce şekli buluyor. İkisinin de bulunma sebebi bir ölçeğe bağlı değil: hangi ölçekte olursa olsun düğme ikisini birden taşır. Tek istisnası 6. maddenin son adımı, ve orada da giden şey çizim, ad değil. Üç varlık türünün simgesi `KIND_ICON`'dan, gerisi `lucide-react`'ten gelir.
5. Şeritteki her kontrol aynı yükseklikte (`--ribbon-h`). Yükseklik şeride değil kontrole verilir, çünkü sabit yükseklikli bir şerit kendine verileni ortalar ve uzun bir düğmeyi saklar.
6. Şerit daralınca neyi sırayla feda ettiği yazılı, çünkü sığmayan bir düğme gizlenmiyor, tıklanamaz oluyor (tuzak 48). Sıra: önce gruplar arasındaki boşluk kapanır, sonra iç grupların başlıkları gider, sonra düğmelerin kelimeleri gider, düğmeler ve menüler hiç gitmez. Açılış başlığı hiçbir adımda gitmez, çünkü hizalamanın çapası o. Kelime feda edilirken simge ve erişilebilir ad kalır: verilen şey bir çizim, bir ad değil (tuzak 56), ve bu yüzden kelime `display: none` ile değil yazı boyu sıfırlanarak gider, metin düğümü erişilebilirlik ağacında durur. Eşikler şeridin kendi genişliği, bir ölçek basamağı değil, yani dar bir pencere %100'de de aynı adımlara ulaşır. Yatay kaydırma bilerek seçilmedi: taşan düğmeyi erişilemez olmaktan çıkarıp görünmez yapardı, yani kusuru teşhis edilemez hâle getirirdi.

Seçili bir seçeneği renk söyler, yazı kalınlığı değil: eşit sütunlu bir grupta
kalınlaşan bir etiket bütün sütunları genişletir ve komşularını kaydırır
(tuzak 94).

### Sekmelerin şeritleri

- **Okul.** `Liste`: Derslikler, Branşlar, Öğretmenler, Sınıflar, her birinin sayısıyla.
- **Müsaitlik.** `Kim`: Öğretmen, Sınıf, Derslik. `Açık olan`: seçili varlık. Sağda `Göster`: Haftanın darlığı, Saatler.
- **Dersler.** `Yöntem`: Öğretmenden, Sınıftan, Genel. `Açık olan`, Genel'de yok. Sağda `Toplam`: ders ve saat.
- **Program.** Solda `Görünüm` (Öğretmen, Sınıf), `Diz` (`Otomatik diz (N)` ve `Baştan diz`, koşarken yerlerine `Durdur`), `Program` (alternatifler menüsü: seçim, kopyasını kaydet, boş program oluştur, yeniden adlandır, programı sil). Sağda `Renk` (öğretmene, sınıfa, dersliğe ya da branşa göre), `Yoğunluk` (Ferah, Rahat, Sığdır), `Izgara` (İşlemler menüsü: tüm programı sabitle ya da sabitlemeleri kaldır, geçici görünüm listesi ve tümünü geri yükle, programı boşalt). Görünüm en solda, çünkü orası onun eski yeri. Alternatifler ve ızgara işlemleri menüde, çünkü düz gruplar olarak %150'de şerit kutusuna sığmıyorlardı. Yoğunluğun bir kopyası şeritte, çünkü ızgaranın ne kadarının görüldüğü ızgaraya bakarken verilen bir karar.
- **Kontrol.** `Göster`: Sorunlar (N), Danışman (N), Öğretmenler, Sınıflar, Derslikler. Sağda `Durum`: engel ve uyarı sayıları. Şerit raporun hangi bölümünün görüneceğini seçer.
- **Çıktı.** `İçerik`: Öğretmenler, Sınıflar, İkisi de. `Renk`: Renkli bas.
- **Ayarlar.** `Bölüm`: beş bölüm. Sağdaki grup bölüme göre değişir: Görünüm'de tema, Zil ve günler'de hafta, Kurallar'da seviyeler, Planlar ve yedek'te açık plan, Hakkında'da sürüm.

## İçerik düzeni

Ana düzen kuralı `.cols` (`wide-left` ve `narrow-right` ile): solda asıl iş, sağda
o ekranın anlamı. Okul'da özet, Zil ve günler'de zil önizlemesi, Kurallar'da canlı
ihlal listesi, Müsaitlik'te varlık listesi, Çıktı'da sayfa seçimi. Sağa konan
şeylerin hiçbiri yeni değil, hepsi bir sekme öteden ya da bir tablonun üstünden
geldi. Kontrol'de sabit iki sütun yerine akan bir kart ızgarası (`.panel-grid`)
var, sorun yokken sol sütun boş kalmasın diye.

Sağ rayda kayan şey liste. `.cols > aside` bir flex sütunu ve `100cqh`'de duruyor, tek
panelli bir rayda (`:only-child`) panel de bir flex sütunu: içindeki her şey kendi
boyunu korur ve yer verebilen tek kutu liste (`> .stat-scroll`, `> .entity-list`, sabit
tavanları 22rem ve 62vh geçersiz, tabanları 6rem). Bir özetin boyu içindekinden
gelir, ekranı geçince kayan şey liste olur, başlık ve açıklama yerinde kalır.
Listenin tabanı rem cinsinden, `--ui-scale` büyüyünce liste de büyüsün. Kayan bir
tablonun başlık satırı (`thead`) yapışkan, çünkü satırlar kayarken sütun adlarının
kaybolması tabloyu okunmaz yapar. Panelin kendi kaydırması (`overflow-y`) yalnız küçülemeyen yarı tek başına
ekrandan uzunsa devreye girer. Çıktı'nın dört panelli rayı kendi kaydırmasını tutar. Sabit tavanlar Kontrol'de duruyor, orası
bir ray değil.

Özet'te önce yanlış olan gösterilir: uyarı kutuları kapasite tablosunun üstünde, `CapacityRows`
orada da `problemsFirst` alıyor,
ve sorun yoksa yerlerinde boşluk bile kalmaz.

## Okul

- **Dört liste, bu sırayla:** Derslikler, Branşlar, Öğretmenler, Sınıflar. Sıra bağımlılık zinciri: sınıf bir dersliği gösterir, öğretmen listeden bir branş seçer. Her liste her an açık, kilitli bir sihirbaz değil, ve önlerinde sıra numarası yok. Sayaç kalıyor, çünkü 0 gösteren liste eksiğin nerede olduğunu söylüyor.
- **Her liste ekranı iki kardeş panel:** bir ekleme paneli (`.panel.add-panel`: işi adlandıran başlık, tek cümlelik açıklama, form ve Excel'den yapıştır) ve sayılı başlıklı liste paneli (`.panel.step-panel`: arama şeridi ve tablo). Sayılı başlık saydığı listeyle birlikte duruyor, yani ekranda hâlâ tek bir `--fs-xl` başlık var. Yapıştır düğmesi panelin başlığında, kutusu formun altında. Branşlar'da yapıştır yok. `e2e/kurulum.spec.ts` 44 sırayı ve iki ayrı kutu olduğunu ölçer.
- **Sağda Özet**, her liste için ayrı bir başlıkla.
- **Yeni bir proje boş branş listesiyle doğar.** Gömülü branşlar bir teklif olarak Branşlar adımının sağındaki panelde durur ve tek tıkla listeye girer.
- **Branşlar da elle sıralanır**, ve Öğretmenler'deki branş seçimi bu sırada gelir. `settings.subjects` bir seviye derinde olduğu için `reorderList`'te kendi dalı var. Branş tablosunda iki gövde var: okulun kendi listesi (tutamaklı) ve yalnız bir öğretmende duran, listede olmayan branşlar (tutamaksız), çünkü satır sürükleme hedefi gövde içindeki indisle buluyor.
- **Listelerde ara, sırala ve süz** (`ListTools`, `listview.ts`): Türkçe katlama ve Türk alfabesi sırası.
- **Branş yazılmaz, seçilir**, ve "Yeni branş…" ile oracıkta eklenir. Serbest metin "Matemtik"i sessizce ikinci bir branş yapıyordu ve kısaltması yine "Mat" çıktığı için kâğıtta ayırt edilemiyordu. Kullanılan bir branş silinemez, mesaj kimin kullandığını sayar.
- **Renk bir sayı olarak değil renk olarak seçilir.** Satır başındaki düğme rengin kendisini gösterir, tıklayınca 36 rengin tamamı 6×6 bir `<dialog>`'da açılır ve seçili renk çerçevelidir.
- **Başlarken.** Hiç öğretmen ve sınıf yokken bir panel hazır bir okul yüklemeyi teklif eder (`Örnek veriyle doldur`, `Bir daha gösterme`), taslak varsa `Taslaktan başla`. Görüldü işareti ilk çizimde değil bir eylemde yazılır, okunmamış bir teklif bir yenilemeyi atlatsın diye. Örnek verinin kalıcı yeri Ayarlar → Hakkında: orada düğme hep durur, proje doluyken sorusu ne kaybedileceğini sayar ve kırmızıdır.

## Müsaitlik

- Izgarada satır gün, sütun ders, çünkü bu bir günü okuma ekranı (aSc'nin "Time off" penceresi de öyle). Sağda varlık listesi.
- Kapalı saat büyük, kırmızı bir çarpıyla ve taramayla işaretlenir. Kararın gerekçesi kapsamdı: Program ızgarasında kırmızı "bu bırakma reddedildi" demek, Müsaitlik'te ise ne bırakma ne ret var ve ekranın söylediği tek şey açık ya da kapalı. Tarama da duruyor, çünkü renk tek başına bir durum taşımıyor. 2.0.2'den beri Program ızgarası da kapalı saatlerde aynı çarpıyı kullanıyor (`styles.css`), yani bu kapsam gerekçesi bugün tarihsel.
- Satırlar Program ızgarasınınkinden uzun. "Haftanın darlığı" ısı tablosu (`table.availability.heat`) aynı iskeleti kullanır ama bir müsaitlik programı değil, tıklanacak hücresi yok ve kısa satırlarla kalır.
- Başlıkta ders numarası, altında başlangıç saati. Saat şeritteki `Saatler` ile kapatılır, ve kapalıyken yerini korur, yani tablonun boyu değişmez (tuzak 102 ve 103).

## Dersler

- **Üç mod:** Öğretmenden, Sınıftan (varsayılan), Genel. Odaklanmış bir modda form o ekseni sormaz: Sınıftan'da sınıf, Öğretmenden'de öğretmen seçimi yok, odak sağdaki listeden (`Hangi sınıf`, `Hangi öğretmen`) gelir ve şerit hangisinin açık olduğunu söyler. Öğretmenden modunda branş seçimi yalnız öğretmenin iki branşı varsa çıkar. Genel'in sağ sütunu Özet. Mod ve odak hiçbir yerde saklanmaz.
- **Haftalık saat girilir, dağılım seçilir** (aSc'nin `Lessons/week` ve yanındaki liste ikilisi). Seçenekler saatten türer ve 3, 2 ve 1 saatlik blokların her birleşimini sayar: 3 saat için `3`, `2+1`, `1+1+1`, 5 saat için `3+2`, `3+1+1`, `2+2+1`, `2+1+1+1` ve `5×1`. Günlük sert bir sınırı çiğneyen seçenek kilitli ve sebebiyle gösterilir. Saat düşünce seçim kırpılır, ve dağılım değişince o dersin yerleşimleri kalkar, çünkü yerleşmiş blokların boyu artık yanlış.
- **Bir ders ızgaradan ayrılmadan da düzenlenir** (`LessonEdit`): sınıf, öğretmen, branş, haftalık saat, dağılım, günde en fazla, aynı gün olmasın. Başka bir öğretmene ya da sınıfa taşınınca artık sığmayan bloklar havuza döner. "Aynı gün olmasın" satırında her ilişkili ders bir çip (× geri alır) ve bir liste var: öteki dersler sınıf sınıf gruplanmış, seçilen ilişki eklenir. İlişki iki yönlü, öteki dersin sayfasında da görünür (TODO B5.3).

## Program

### Izgara

- **Eksen:** satır öğretmen (ya da sınıf), sütun gün × ders, tek geniş tablo. aSc'deki gibi ve babanın alışkanlığı. Görünüm şeritten seçilir.
- **Satır başı** yapışkan, ve tıklanınca o öğretmenin ya da sınıfın panelini açar.
- **Hücreyi boyayan renk** öntanımlı olarak öğretmen rengi, şeritteki `Renk` menüsünden sınıf, derslik ya da branş rengi seçilebilir. Sınıf rengi ayrıca satır başındaki noktada ve basılan sayfanın başlığında bir işaret.
- **İmleç haçı.** Bir hücrenin üstüne gelince satırı, sütunu, saat başlığı ve satır adı birlikte aydınlanır. Uzun bir haftada yerini kaybetmemenin yolu ve babanın gözüne doğrudan bir cevap. Kapalı saat taramasını örtmez, ve sürükleme başlayınca söner, çünkü orada ızgaranın kendi renkleri konuşur. Birleşmiş iki ve üç saatlik blokların kapsadığı her sütun yanar (tuzak 85). Saf DOM, `gridChrome.ts`.
- **Gün bandı.** Tek indeksli günler çok hafif bir zemin alır, günleri gruplamak için.
- **Saat başlığı** ders numarasını ve altında başlangıç saatini taşır.
- **Öğle arası** dar bir ayraç sütunu, çünkü ızgarada ara konumu gün başına sabit. Ayraç `data-day` ve `data-hour` taşımaz (tuzak 13).
- **Yoğunluk:** Ferah, Rahat, Sığdır. Sığdır haftanın tamamını kutuya sığdırır, ve bunu kart yazısını kırpmadan yapması ölçülür (tuzak 37 ve 107).

### Havuz

- **Havuz ızgaranın altında bir çekmece.** Boyu kenarından (`role="separator"`) sürüklenir ve bırakılan boy hatırlanır, çekmece açılıp kapatılabilir. Bekleyen kart kalmayınca çekmece yalnız başlığını bırakıp kapanır ve düğmesi kapanır, kart gelince kendiliğinden açılır; elle kapatılmışsa kapalı kalır. Bu kapanma tercihe yazılmaz. Altta, çünkü sağda üç kart genişliğinde bir sütun bekleyen dersleri kaydırılan bir listeye çeviriyordu, altta ise görülen bir tepsi.
- **Ders başına değil blok başına kart.** `2+1` bir ders bir ikili ve bir tekli bırakır, ve kart kaç saat olduğunu hem yazıyla hem genişliğiyle (`[data-size='2']` iki katı) söyler. Aynı dersin aynı boydaki blokları tek bir deste, en çok iki katman görünür. Kaç tane olduğu kartın `title`'ında, `data-count`'ta ve tepsinin başındaki "N blok bekliyor"da.
- **`.pool-card` bir DESTE demek, bir blok değil.** 2026-09-01'den beri havuz deste başına tek kart çiziyor: derinliği `.pool-stack`'in `::before` ve `::after`'ı boyuyor ve blok sayısı `data-count`'ta duruyor. Bekleyen blok sayısı `data-count`'ların toplamı, "N blok bekliyor" oradan geliyor, ve `pendingBlocks()`'un aynası o toplam. Sebebi ölçüldü: örnek okulda 367 blok DOM'da 114 karta iniyor ve gömülü kartların boyanması Program sekmesinin açılışına giriyordu. Havuz testleri `data-count` toplamını sayar; `.pool-card`'ı blok sanan üç test aynı gün düzeltildi. Yan faydası duruyor: haftalık saati elle aşmak mümkün değil, destede blok bitince sürüklenecek bir şey kalmıyor.
- **Başlıklı gruplar**, ve başlık sıralamadan türer: ızgara sırasında ve ada göre satırın adı ve renk noktası, branşa göre branş, uzun bloklar önce "N saatlik bloklar", en çok kalan "N saat kaldı". Her başlık kart sayısını taşır ve kartların yanında durur, üstünde değil (tuzak 100).
- **Beş sıralama** (Izgara sırası, Ada göre, Branşa göre, Uzun bloklar önce, En çok kalan) ve bir branş süzgeci. Süzgeç birden fazla branş bekliyorsa çıkar. Süzülünce tepsinin başlığı neyi sakladığını söyler, yoksa "hepsi yerleşti" bir tık ötede yanlış olurdu. Sıra ve süzgeç `toolState.ts`'te bir pozisyon.
- **Havuz kartı görünümü takip eder:** üst satır ders yerleşince hücrenin okuyacağı şey, alt satır kartın gideceği satır, ve sıralama bir satırın kartlarını yan yana tutar.

### Sürükleme ve bırakma

- Sol düğmeyle sürüklemek taşır, sağ tık menü açar, Delete havuza gönderir. Klavyeden gelen bir tıklama `e.detail === 0` ile ayrılır, odaklı kartta Enter ve Space çalışsın diye. Sürükleme haritası kaynak bloğu kaldırılmış bir durum üstünde hesaplanır, yoksa ders kendi kendini engeller.
- Sürüklerken hedef satırın tamamı zayıf bir katmanla, imlecin altındaki blok güçlü bir katmanla boyanır: yeşil bırakılabilir, sarı uyarı ya da bir şey kaybedilecek, kırmızı engel. Hedefin dışındaki görünür alan iki düz gölgeleme düzlemiyle karartılır. Reddin sebebi sabit yükseklikli bir satırda yazılır (`.reason-bar`).
- Başka bir kartın üstüne bırakmak takas edebilir, sınıfın kendi dersinin üstüne bırakmak onu havuza döndürebilir. Kuralları [DATA.md](DATA.md)'de.
- Hedef ekran dışındaysa ızgara kenara gelince kayar.

### Sağ tık menüsü

Menünün şekli bir kural: üst düzeyde elin sık uzandığı şey, kapıların arkasında
nadir olan.

```
Havuza kaldır · Dersi düzenle · Öğretmeni düzenle · Sınıfı düzenle
────
Dersi buraya sabitle  (ya da Sabitlemeyi kaldır)
Toplu sabitle   ▸  Satırı · Sütunu · Günü
────
Geçici görünüm  ▸  Satırı soluklaştır · Satırı gizle · Günü soluklaştır · Günü gizle
```

- Satır başında satırı sabitleme ve satırın iki geçici görünüm kalemi, gün başlığında günün karşılıkları, saat başlığında yalnız sütunu sabitleme çıkar. Boş bir hücrede menü açılmaz. Havuzdaki bir kartta aynı menü açılır ve ızgaraya ait kalemler kapalıdır.
- `Öğretmeni düzenle` ve `Sınıfı düzenle` ızgaranın çizilmediği eksene ulaşmanın yolu, satır başı zaten bakılan ekseni açıyor.
- Menü tabloyu saran tek bir `ContextMenu.Root`. İki bin hücreye birer tetikleyici konmaz, tıklamanın yeri `data-row`, `data-day` ve `data-hour`'dan okunur. Karta gelmeyen bir sağ tıkta `preventDefault()` çağrılır ve Radix'in kendi işleyicisi hiç koşmaz.

### Sabitleme

- Kartın köşesinde bir raptiye düğmesi var. Kartın kardeşi, çocuğu değil, çünkü kart bir `<button>` ve düğme içinde düğme geçersiz HTML, ve konumlanma bağlamı hücre. Bu yüzden sağ tık menüsü (`openMenu`) hedefini karttan değil hücreden bulur.
- Raptiye dururken görünmez, hücrenin üstüne gelince, klavye odağında ve kart sabitliyken görünür. 2026-08-30 tarihli kayıt "hep görünür, sönük" diyordu, 2026-09-25'te kullanıcı "dururken görünmez"i seçti ([DECISIONS.md](DECISIONS.md)).
- Sabitli olduğunu bir renk değil bir simge söyler, çünkü ızgaranın renkleri zaten bırakılabilir, uyarı, engel ve kapalı demek.
- Sabitlenmiş kart sürüklenmez ve Delete'e cevap vermez, "Havuza kaldır" kapalıdır, `Baştan diz` ve `Programı boşalt` onu yerinde bırakır. Kuralları DATA.md'de.

### Otomatik dizme

Şeritte iki düğme var: `Otomatik diz (N)` bekleyen dersleri dizer, `Baştan diz`
(onaylı) ızgarayı boşaltıp yeniden dizer. Bir ayarı yok: "sabaha yay" gibi tercihler
henüz ölçülmedi, aSc'nin karşılığı `docs/asc/yardim/u58-timetable-generation.md`'de
duruyor ve okunmadı. İlerleme ve sonuç `.reason-bar`'da düz metin olarak yazılır:
sabit yükseklikli, ızgarayı kaydırmıyor, ve göz oraya zaten alışkın. Bütün koşu tek
geri al adımı. Geçici görünümle gizlenmiş ya da soluklaştırılmış satırlar dizilmez.

Koşu takılırsa satır ne olduğunu söylemeye devam eder (hangi ders, neden), ve
altında, ızgaranın üstünde bir öneri paneli açılır (`Suggestions.tsx`, TODO B5.9,
B5.10): hafta hangi yollarla kurulur. Arama kendiliğinden başlar, sürerken panel
"Nasıl kurulacağı aranıyor…" der ve şeritteki `Durdur` onu da durdurur. Bir yol
seçilmez, hepsi gösterilir ve seçen babadır. Yolların yeri sabittir, sırası
kullanıcının kendi listesi: öğretmenin zaten geldiği güne saat, en az saat (yan
yana), en az öğretmen, saat ve sınır birlikte, yalnız sınırlar, dersi başka
öğretmene vermek, blok şekli, haftalık saat. Aranan yol satırını "…: aranıyor…"
diye tutar, bulunan onun yerine oturur; bir şey bulamayan yolun satırı kalkar.
Bulunan her yol tek satırdır: babanın bir öğretmene söyleyeceği cümle ("KY
Cumartesi 3–4. saatlere de gelebilirse hafta kuruluyor."), `Izgarada göster`,
`Uygula` ve `Sorular`. Bir yol ilk bulduğunu hemen gösterir ve arama sürerken
daha iyisini bulursa satır yerinde değişir; o sürece satırın yanında "(daha iyisi
aranıyor)" yazar. Aynı öğretmenlerden aynı günlerde aynı sayıda saat isteyen iki
yol tek satırdır, çünkü babanın soracağı soru aynıdır. İki karma yoldan (dersi
başka öğretmene verip daha az saat) ötekinden iki sayıda da kötü olanı
gösterilmez.

`Sorular` yolun cevap defterini açar (TODO B5.11). Öğretmen öğretmen birer soru
vardır: "KY · Cumartesi 11–12. saatlere gelebilir misiniz?", sınır ve el
değişimi de soru olarak, blok şekli ve haftalık saat "Siz" başlığıyla. Her
sorunun sonunda `Olur` ve `Olmaz ▾` durur. Bir öğretmen saatinin `Olmaz`'ı dört
türdür: yalnız bu saatler, o gün hiç, o gün en fazla N saat, öğretmene hiç
dokunma. `Olur` değişikliği bedelsiz kabul eder, ve yollar "Olur dediklerinize ek
olarak …" diye yalnız eksiği söyler. Olur dedikleri tek başına yetiyorsa panel
"Olur dedikleriniz yetiyor" der. Her cevap aramayı yeniden başlatır. Cevaplar
panelin başında "Cevaplarınız:" satırında ✓ ya da ✗ ile durur ve tıklanınca geri
alınır. Planın verisi oldukları için (şema v15) program kapanıp açılınca da
yerindedirler, ve Ctrl+Z bir cevabı geri alır. `Soruları kopyala` listeyi panoya
koyar. `Soruları yazdır` onu kendi kâğıdında basar: sayfanın geri kalanı o baskıda
yoktur.

`Izgarada göster` önizlemedir. Izgara, yolun uygulanmış haftasını çizer, ve ızgaranın
üstünde bir çubuk açılır: `Şu anki | Önerilen`, lejant ("4 öğretmen saati
açılıyor · 162 ders yer değiştiriyor"), `Uygula` ve `Önizlemeyi kapat`.
- Açılan saatteki ders kalın bir çizgi, tarama ve "+" ile işaretlidir.
- Yeri değişen ders ince kesik bir çizgiyle işaretlidir.
- Değişmeyenler soluklaşır.
- İşaretler etiketin içinde de söylenir.
- Görünüm ilk açılan saate kayar.
- Havuz da önerilen haftanın havuzunu gösterir.
- Önizlemede sürükleme, kaldırma, sabitleme ve menü kapalıdır, ve Esc önizlemeyi kapatır.
Derslerin yer değiştirmesi aramanın bedeli değildir: "en az" müsaitlikte en az
değişiklik demek (kullanıcının kararı, 2026-09-25). Oynayan dersin sayısı yalnız
burada görünür.

Sınıfların saati
hiçbir yolda yoktur. Hafta aslında kurulabiliyorsa (çözücü bulamadı, ikinci arama
buldu) panel tek satırla bunu söyler. Bir yolu uygulamak veriyi ve haftayı
birlikte yerleştirir ve tek geri al adımıdır. Uygulanınca "Olur"lar verinin kendisi
olduğu için cevaplardan silinir, "Olmaz"lar bir sonraki takılmaya kalır. Program o
arada değiştiyse düğme kapanır. Bir cevap bu sayılmaz. Panel diyalog değil, çünkü okuyan öneriyi ızgaraya bakarak okur.
`Otomatik diz` dizili dersleri yerinde tutar. Öyle bir yol yoksa arama
kendiliğinden sabitlenenler dışındaki dersleri de yeniden dizerek sürer. Panel bunu
bir cümleyle söyler, ve düğme "Uygula, baştan diz" olur. Babanın dosyası
tam bu durumda: 330 saat dizili, ve boş kalanlar 2 saatlik bloklara uymayacak kadar
parçalı.

### Geçici görünüm

Bir öğretmen ya da sınıf satırını veya bir günü, bu oturum ve bu plan için
soluklaştırır ya da gizler. Gizli satırlar ızgaradan ve havuzdan çıkar, maskelenmiş
bloklar sürüklenmez ve kaldırılmaz, kapsam dışındaki bir güne bırakılamaz, ve
otomatik dizme onları dışarıda bırakır. Sağ tık menüsünden ve şeridin İşlemler
menüsünden yönetilir.

## Kontrol

Tek sayfalık bir rapor. Üstte bir hüküm kutusu ve "Programın durumu", altında
şeridin seçtiği bölüm: Sorunlar (kapalı saatte kalmış dersler, kural ihlalleri,
yerleşemeyen dersler, ya da hiçbiri yoksa bunu söyleyen bir satır), Danışman
uyarıları, ya da öğretmenler, sınıflar ve derslikler için kapasite. Sorunlar sorun
yokken de bir cevap verir. Kapasite tablosu Okul'un Özet'iyle aynı çizim
(`CapacityRows`).

## Çıktı

- **Sayfa başına bir sınıf ya da öğretmen:** satır gün, sütun ders, A4 yatay, `table-layout: fixed`, sütunlar eşit. Ana ızgaranın bütün haftası tek tablo olarak basılmaz (tuzak 8).
- **Hangi sayfaların basılacağı tek tek seçilir:** sınıf ve öğretmen için ayrı onay listeleri, `Tümü` ve `Hiçbiri`, ve düğmede kâğıt sayısı (`Yazdır (N kâğıt)`). Seçim dışarıda bırakılanlar olarak tutulur, sonradan eklenen bir sınıf sessizce dışarıda kalmasın (tuzak 18).
- **Sayfa düzeni:** bir kâğıda 1, 2 ya da 4 program, ve kâğıttaki yazı (Küçük, Normal, Büyük). Düzen bir taban ölçek dayatır (`--p-fit`), okuyan onun üstüne kendi tercihini koyar (`--p-zoom`), ve ikisi `:root`'ta değil `.print-area`'da tanımlı (tuzak 63). `.print-sheet` kâğıdın kendisi (297×205 mm, `break-after` onun üstünde), `.print-page` bir program, ve bu ayrım her ayarda aynı kalır.
- **Sayfada ne olsun:** kurs adı, derslik ve branş, ders saatleri, hücrenin alt satırı, çıktı tarihi (öntanımlı kapalı).
- **Önizleme kâğıdın kendisi:** ekranda ve kâğıtta mm cinsinden aynı kutu. Ekrana özel kalan şeyler kâğıdın üstünde olmayanlar: gölge, köşe yarıçapı ve sayfaların durduğu tepsi.
- **Başlık iki satır:** büyük ve ortalı ana satır (`510 sınıfı` ve "Haftalık ders programı"), altında küçük bir künye satırı (okul adı, derslik). Tek, uzun, sola yaslı bir satır kâğıtta başlık değil altyazı gibi okunuyordu. Tarih ve dosya yolu kâğıda çıkmaz (tuzak 31).
- **Sütun başlığında saat.** Bir ders numarası bütün günlerde aynı saatteyse yalnız saat yazılır. Öğle arası farklı yere düştüğü için günlere göre farklıysa her grup gün aralığıyla yazılır: `Sal–Cum 13:30–14:10` ve `Cmt–Pzr 13:10–13:50`. Gün adı yalnız birden çok cevap varken çıkar, çünkü on iki sütunun üstüne aynı aralığı yazmak on bir kez hiçbir şey söylemek olurdu (`periodGroups()`, `Print.tsx`).
- **Öğle arası** satırdan satıra değiştiği için o satırın hücresine kalın bir kenarlık.
- **Öğretmen sayfasını sınıf rengi, sınıf sayfasını öğretmen rengi boyar**, çünkü sayfada değişen ve okuyanın aradığı şey o.
- **Kapalı saat işareti kâğıda çıkmaz.** Duvara asılan bir kâğıt "saat 10:40'ta neredeyim" sorusuna cevap verir. Bilgi Müsaitlik'te düzenleniyor ve Kontrol'de sayılıyor.
- **Kâğıt fiziksel.** Açık palet kullanır, `--ui-scale` kâğıda geçmez, sayfa 205 mm'lik sabit yükseklikli bir kutu ve plan onun içinde dikey ortalanır, kenar boşluğu sayfanın kendi dolgusu (tuzak 31).

## Ayarlar

Beş bölüm: `Zil ve günler · Kurallar · Görünüm · Planlar ve yedek · Hakkında`.

- **Zil ve günler:** okul adı, hangi günler ders olduğu, zil saatleri, ve sağda zil önizlemesi. Başlangıç saati iki açılır liste (saat ve beşer dakika), `<input type="time">` değil: o girdi AM ya da PM'i tarayıcının yereline göre seçer ve boşaltılınca günü sessizce 00:00'a alır.
- **Kurallar:** okul geneli sınırlar ve seviyeleri, sağda canlı ihlal listesi.
- **Görünüm** okulu değil makineyi tarif eder: tema (Açık, Koyu), yazı büyüklüğü (%80 ile %150 arası, beşer adımlık düğmeler), yoğunluk (ızgara ve arayüzün geri kalanı için, tek panelde iki `role="group"` olarak ayrı ayrı Ferah, Rahat, Sığdır), araç şeridinin kaydırınca gizlenmesi, hareket (Tam, Az, Kapalı) ve dil. Sağda örnek bir tablo. Yazı büyüklüğü bir kaydırıcı değil düğmeler, çünkü yasal değerler sayılı ve bir kaydırıcı olmayan bir süreklilik uydururdu. Bu ayarların hiçbiri kâğıdı etkilemez. Temanın düğmesi üst çubukta da var: orası kısayol, burası envanter.
- **Planlar ve yedek**, "işim nerede duruyor ve dışarı nasıl çıkar": plan kitaplığı (yarat, adlandır, sil, taslak), "Nereye kaydedilsin" (seçilen klasöre bütün planlar ve günlük yedek), "Bütün planlar tek dosyada" (paket), oturum yedekleri. Klasör paneli paketin üstünde, çünkü bir alışkanlık isteyen çareden önce hiçbir şey istemeyen çare gelir.
- **Hakkında**, "bu hangi kopya": sürüm ve güncelleme, Yenilikler paneli, "Veriler nerede" tablosu, ve açık planın yerine geçen ya da onu boşaltan iki işlem (örnek veri ve sıfırla). "Veriler nerede" gerçek anahtar adlarını ve boyutlarını gösterir, ve verinin bu tarayıcıya ve bu bilgisayara ait olduğunu, "tarama verilerini temizle"nin onu sildiğini ve taşınan tek şeyin dosya olduğunu tek bir cümleyle söyler. "Tarayıcıda saklanıyor" demek bunu söylemiyordu.

`Data.tsx` son iki bölümü birlikte çizer, çünkü paketi yazan işleyiciler kitaplığı
okuyanlarla aynı.

## Diyaloglar, bildirimler ve boş ekranlar

- **Her soru** `useDialogs()` üstünden sorulur (`confirm`, `alert`), `window.confirm` ve `window.alert` kullanılmıyor. Geri alınamaz uyarılar `role="alertdialog"`.
- **Silmeden önce onay sorulur**, ve cümle ne kaybedileceğini sayar: "A dersliği silinecek. 4 sınıfın dersliği boşalacak (410, 411, 510, 511)…"
- **Olan biteni** kısa bir bildirim satırı söyler (`useToast()`), ve bir hamlede ne kaybedildiyse adıyla yazar.
- **Boş ekranlar yönlendirir:** "Henüz ders yok" değil, nereden başlanacağı. Program, Kontrol ve Çıktı'nın boş ekranları bugün dersler için Okul sekmesini gösteriyor, dersler ise Dersler sekmesinde giriliyor ([WORKLOG.md](WORKLOG.md), bilinen kusurlar).
- **Ctrl+K komut paleti** her yere gider, her şeyi bulur, sık yapılan işleri yapar. `?` tuşu klavye kısayolları ekranını açar.
- **Varlık paneli** bir öğretmenin, sınıfın ya da dersliğin kendi haftasını gösterir ve onu düzenler. Satır başından, kartın menüsünden ve paletten açılır, ve sağdan kayar, solmaz, çünkü altından iki bin hücre geçiyor.
