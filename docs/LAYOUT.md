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

Beş iş, bu sırayla (2026-11-16, Sadeleşme K1). Alt+1'den Alt+5'e kadar bu sırayla açılırlar.

| Sekme | Ne için |
|---|---|
| Program | haftalık ızgara, havuz, sürükleme ve otomatik dizme |
| Öğretmenler | öğretmen listesi, ve şeridin `Dersler`'iyle bir öğretmenin dersleri |
| Sınıflar | sınıf listesi, ve şeridin `Dersler`'iyle bir sınıfın dersleri |
| Yazdır ve gönder | kâğıda basılacak sayfalar, düzeni ve e-postayla gönderme |
| Okul bilgileri | zil ve günler, derslikler, branşlar, kurallar, görünüm; Daha fazla'da planlar ve yedek, hakkında |

Sekmeler bir veri türünü değil bir işi adlandırır: babanın "neyin nerede olduğunu anlayamıyorum"u
yedi sekmenin bir öğretmenin işini dördüne dağıtmasıydı. Yedi sekmenin içeriği şuraya gitti
(DECISIONS 2026-11-16 "Beş görev sekmesi"):

| Eski | Ne vardı | Şimdi |
|---|---|---|
| Okul | Derslikler, Branşlar | Okul bilgileri → Derslikler, Branşlar |
| Okul | Öğretmenler, Sınıflar | Öğretmenler, Sınıflar sekmeleri (şeridin `Liste`'si) |
| Okul | Başlarken, örnek okul, taslaktan başla | Okul bilgileri'nin Zil ve günler, Derslikler ve Branşlar bölümlerinin başı |
| Müsaitlik | bir kişinin ızgarası, `Bütün haftayı aç/kapat` | kişi sayfası |
| Müsaitlik | dersliğin ızgarası | dersliğin sayfası (Derslikler listesinin `Ayrıntı`'sı) |
| Müsaitlik | "Haftanın darlığı" ısı tablosu | kalktı; sebebi sorun listesi söylüyor, yük tabloları orada |
| Dersler | Sınıftan, Öğretmenden | Sınıflar → Dersler, Öğretmenler → Dersler; kişi sayfasında satır içi ekleme |
| Dersler | Genel | iki şeridin Daha fazla'sı → `Bütün dersler tek listede` |
| Kontrol | hüküm, sayılar, sorunlar, İpuçları, yük tabloları | durum çipinin açtığı sorun listesi |
| Çıktı | sayfalar, düzen, e-posta | Yazdır ve gönder |
| Ayarlar | beş bölüm | Okul bilgileri |

Sekme kimliği saklanmaz; eski kimliklerin karşılığı `toolState.ts`'teki `OLD_TAB`'ta.
Seçili sekme tek ve nötr bir biçimde çizilir: kâğıt zemin, kontrol kenarı ve accent bir alt
çizgi (2026-11-16, Sadeleşme). Bölüm renkleri bir şey anlatmıyordu, seçili sekmenin sözü zaten
"neredeyim"i söylüyor; renk yalnız veri (öğretmen ve sınıf kimliği) ve durum için. Üst bar dar kalınca (%100'de
yaklaşık 1320 piksellik bir barın altında, yani 1366'da yan yana, 1280'de alt alta;
programın kendi ölçeğiyle birlikte) sekme etiketi simgenin
altına iner; gizlenmez (2026-11-15). Daha dar barda (75em altı: 1366'da %130 ve %150)
sekmeler bilerek ikinci satıra geçer, bütün satırı alır ve etiketleri yine simgenin yanında
durur; üst satırda gerisi (2026-11-16, kullanılabilirlik turu: önce `?` tek başına alta
düşüyordu). Sekme ve menü yazısı 14 px.

## Üst çubuk

Soldan sağa: marka işareti, `Dosya ▾`, beş sekme, durum çipi, boşluk, okulun adı (ve ikinci
plan olunca plan seçici), `Geri al`, `Kaydet`, `?`. Başka bir şey yok (2026-11-16, Sadeleşme
aşama 1); kaldırılanların yeni yeri aşağıda.

- **Dosya ▾** dosyanın her işini bir menüde tutar: Kaydet, Dosyadan aç, Yeni dönem için kopyala (verinin tamamı yeni bir plana, dizilmiş program boş; eski plan olduğu gibi kalır), Eski hâline dön, Planlar ve yedek (Okul bilgileri'ne götürür) ve İleri al (Ctrl+Y).
- **Eski hâline dön** (2026-11-16, Sadeleşme K8) açık planın son yedi gününü bir pencerede listeler, en yenisi üstte: her satırda günün adı ve tarihi ("Salı 12 Kasım"), öğretmen, ders ve yerleşmiş saat sayısı, ve bir düğme; dünün düğmesi "Dünkü hâline dön", ötekiler "Bu hâline dön". Şimdiki hâlle aynı olan gün listelenmez. Kopya yoksa tek cümle: ilki yarın gelir. Dönmek bildirimiyle `Geri al` taşıyan bir adım; kopyaların nasıl tutulduğu [DATA.md](DATA.md)'de. Ctrl+K "dün" ile de bulur.
- **Kaydet** sade bir düğme, dolu değil: her ekranın dolu tek düğmesi o ekranın ana işi.
- **?** ara ve yap (Ctrl+K), klavye kısayolları, Yazı büyüklüğü ▸ (Görünüm'deki dört basamak), Başlarken'i yeniden açma ve Hakkında. Dosya ▾'da `Eski hâline dön`'ün yanında "son 7 gün", `Planlar ve yedek`'in yanında "bütün planlar" yazar.
- **Tema** yalnız Okul bilgileri → Görünüm'de; Ctrl+K'nin "tema"sı oraya götürür. **Şerit katlama** Okul bilgileri → Görünüm'de ve Ctrl+K'de; Okul bilgileri'nde şerit katlı olsa da çizilir, çünkü bölümler oradan seçiliyor ve açmanın yolu da orada.

- **Marka işareti** bir düğme değil ve `aria-hidden`, çünkü programın adı zaten belge başlığı. `<img src>` değil satır içi SVG, çünkü dosya dışarıdan bir şey istemiyor, ve boyu `--ui-scale`'i izliyor.
- **Durum çipi** her sekmede sorunu adıyla söyler ve tıklanınca sorun listesini açar (2026-11-16, K3; aşağıda "Sorun listesi").
- **Plan seçici** yalnız ikinci bir plan olunca görünür (2026-11-16), ve ikinci bir diziliş bir plandır: Program → Daha fazla → `Bu programın kopyası` açık planın kopyasını açar ve seçici onunla gelir (K2). Birden çok "seçenek" taşıyan eski bir dosyada her biri seçicide planın adının altında bir satır ("Plan 1 · Seçenek 2"). Tek planda "Plan 1" kimsenin sormadığı bir soruyu cevaplıyordu, ve planların yeri bir tık ötede, Dosya ▾ → Planlar ve yedek. Plan yaratan, adlandıran ve silen her şey Okul bilgileri → Planlar ve yedek'te, çünkü üst çubuk bir tıklamanın bir öğleden sonrayı götüremeyeceği yer olarak kalıyor. `Sıfırla` da bu yüzden Okul bilgileri'nde.
- **Kaydet** ve **Dosya ▾ → Dosyadan aç** tek bir plan yazar ve okur, bir paketi reddedip yolunu gösterir (tuzak 30). Kaydet görünür kalır, çünkü veri kaybına karşı önlem görünür olmalı.
- Çubuk daralırken önce boşluk, sonra çipin cümlesi feda edilir, sonra belge adı; sekme etiketleri simgenin altına iner. Çipin cümlesinin yerine iki kelime kalır ("3 sorun", "45 saat havuzda"): yalnız noktası kalan renkli bir hap aç kapa düğmesi gibi okunuyordu (2026-11-15), ve ekran meşgulken yok olan bir durum güvenilmez bir durum. Bu da yetmezse çubuk ikinci bir satıra geçer; sayfa yana kaymaz. Sekmeler feda edilmez (tuzak 48).

## Araç şeridi

Üst çubuğun altındaki ikinci satır, açık sekmenin araç şeridi (Word, Excel ve aSc
gibi). Sekmeler bir süre soldaki bir rayda durdu, ve ray Program dışındaki
sekmelerde harcanacak yeri olmayan bir genişliği götürüyordu. Şerit kendi satırı
olduğu için bir satıra mal oluyor, ve bu yüzden katlanabiliyor: katlanınca tamamen
gider ve yerini ızgaraya bırakır. Katlama Okul bilgileri → Görünüm'de ve Ctrl+K'de (2026-11-16);
Okul bilgileri'nde şerit katlı da olsa çizilir. Şeridin okurken kendiliğinden çekilmesi Okul bilgileri →
Görünüm'den açılır ve 2026-11-16'dan beri seçilmedikçe kapalı: okurken düğmeler
kayboluyordu. Açıkça seçmiş bir makine seçimini korur.

Şeride "şu an neye bakıyorum" ve "tek tıkla ne yaparım" konur. Liste, sayaç ve
açıklama panelde durur. Her ekranda **tek bir ana düğme** dolu çizilir (Program'da `Programı
yap`, Derslikler, Branşlar, Dersler ve yeni kişinin sayfasında `Ekle`, Yazdır ve gönder'de `Yazdır`); basılı seçim düğmeleri dolu
değil, bir segmenttir. Az kullanılan her şey her şeridin sağ ucundaki **Daha fazla ▾**
menüsünde (`common/More.tsx`), her ekranda aynı yerde ve aynı biçimde: gerçek bir düğme ve
menü, oklarla gezilir, Esc kapatır, odak düğmeye döner. Bir panelin açıklaması başlığının
yanındaki **?**'in arkasında (`common/Help.tsx`, `HelpHead`); ekranda her an en çok iki yardım
cümlesi kalır.

### Şerit standardı

`e2e/serit.spec.ts` beş maddenin beşini de ölçer, çünkü şekli olmayan bir şeyi bir
test koruyamaz.

1. Beş sekmenin beşi de şerit çizer ve şeritler aynı yükseklikte, %100'de de %150'de de. Yüksekliği sekmeyle gelip giden bir şerit altındaki her şeyi zıplatır.
2. Her şerit bir başlıkla (`.ribbon-label`) açılır: düğmelerin hangi soruyu cevapladığı. Bir değer taşıyan grup `.ribbon-value` kullanır, çünkü başlık büyük harfli ve soluk, ve bir adı o sesle okumak onu başlık gibi gösteriyor.
3. Gruplar `<Sep/>` ile, sağa yaslanan grup `<Spacer/>` ile ayrılır.
4. Her düğmede bir simge ve bir kelime olur. Simge tek başına ilk seferde okunmaz ve iki test katmanında ada dönüşmez (tuzak 56), kelime tek başına bir düğmeyi komşusundan bir bakışta ayırmaya yetmez, göz önce şekli buluyor. İkisinin de bulunma sebebi bir ölçeğe bağlı değil: hangi ölçekte olursa olsun düğme ikisini birden taşır. 2026-11-15'ten beri istisnası yok: 6. maddenin son adımı da kelimeyi küçültür, silmez. Üç varlık türünün simgesi `KIND_ICON`'dan, gerisi `lucide-react`'ten gelir.
5. Şeritteki her kontrol aynı yükseklikte (`--ribbon-h`). Yükseklik şeride değil kontrole verilir, çünkü sabit yükseklikli bir şerit kendine verileni ortalar ve uzun bir düğmeyi saklar.
6. Şerit daralınca neyi sırayla feda ettiği yazılı, çünkü sığmayan bir düğme gizlenmiyor, tıklanamaz oluyor (tuzak 48). Sıra: önce gruplar arasındaki boşluk kapanır, sonra iç grupların başlıkları gider, sonra düğmelerin kelimeleri bir basamak küçülür ve iç boşlukları daralır, düğmeler ve menüler hiç gitmez. Açılış başlığı hiçbir adımda gitmez, çünkü hizalamanın çapası o. Son adım 2026-11-15'e kadar kelimeyi yazı boyunu sıfırlayarak siliyordu (ad erişilebilirlik ağacında kalıyordu, tuzak 56); %150'de 1024 piksel ya da %200'de şerit yalnız simgeydi ve az gören biri için ezberlenecek bir simge kelimeden zordu. En dar kutuda (%200, 960 piksel) bir iki uzun kelime üç noktayla kısalabilir. Eşikler şeridin kendi genişliği, bir ölçek basamağı değil, yani dar bir pencere %100'de de aynı adımlara ulaşır. Yatay kaydırma bilerek seçilmedi: taşan düğmeyi erişilemez olmaktan çıkarıp görünmez yapardı, yani kusuru teşhis edilemez hâle getirirdi.

Seçili bir seçeneği zemin ve alt çizgi söyler, yazı kalınlığı değil: eşit sütunlu bir grupta
kalınlaşan bir etiket bütün sütunları genişletir ve komşularını kaydırır
(tuzak 94).

### Sekmelerin şeritleri

- **Öğretmenler** ve **Sınıflar** (bir şerit, iki sekme). `Göster`: `Liste` (sayısıyla; bu ekranda sayı yalnız burada) ve `Dersler`. `Dersler`'de `Açık olan`: sağdaki listeden seçilen kişi. Daha fazla: Bütün dersler tek listede (eski Genel), Kurallar. Düğmenin adı `Liste`, sekmenin adı değil (tuzak 49).
- **Program.** Solda `Görünüm` (Öğretmen, Sınıf), `Diz` (`Programı yap`, ekranın tek ana düğmesi; koşarken yerinde `Durdur`; bekleyen ders yokken kapalı saatte ders ya da kesin kural ihlali varsa yerinde `Yeniden yap`, 2026-11-16), tarih çipi (`Bugün kim yok?`; bu haftada değişiklik varsa kalın çizgiyle `Bu hafta: 18–22 Kasım, 3 değişiklik`, bugünün tarih sayfasını açar, 2026-11-16, v18). Daha fazla: Yeniden yap; Başka bir dizilim; Bu programın kopyası (yeni bir plan, K2; eski bir dosyada birden çok program varsa adı `Ayrı plan yap`, açık programı kendi adını taşıyan bir plan yapar, yanında açık olanı silmek de); Renk ▸ (öğretmene, sınıfa, dersliğe ya da branşa göre); tüm programı sabitle ya da sabitlemeleri kaldır; programı boşalt. Yoğunluk ve geçici görünüm 2026-11-16'da kalktı (Sadeleşme K6, K7). Görünüm en solda, çünkü orası onun eski yeri. `Yeniden yap` gündelik düğmenin yanında durmuyor: yerleşmiş bir haftayı tek tıkla boşaltıp yeniden yapmak yanlışlıkla basılacak bir düğme değil.
- **Yazdır ve gönder.** `İçerik`: Öğretmenler, Sınıflar, İkisi de. Daha fazla: Renkli bas.
- **Okul bilgileri.** `Bölüm`: Zil ve günler, Derslikler, Branşlar (ikisi sayısıyla), Kurallar, Görünüm; Planlar ve yedek ile Hakkında Daha fazla'da (ikisine de üst çubuktan da gidilir: Dosya ▾ ve ?), yeni bir sürüm notu varsa Daha fazla düğmesi nokta taşır. Sağda bir okuma: Kurallar'da kesin, tercih ve kapalı sayıları, Planlar ve yedek'te açık plan, Hakkında'da sürüm.

## İçerik düzeni

Ana düzen kuralı `.cols` (`wide-left` ve `narrow-right` ile): solda asıl iş, sağda
o ekranın anlamı. Listelerde özet, Zil ve günler'de zil önizlemesi, Kurallar'da canlı
ihlal listesi, Dersler'de kişi listesi, Yazdır ve gönder'de sayfa seçimi. Sağa konan
şeylerin hiçbiri yeni değil, hepsi bir sekme öteden ya da bir tablonun üstünden
geldi.

Sağ rayda kayan şey liste. `.cols > aside` bir flex sütunu ve `100cqh`'de duruyor, tek
panelli bir rayda (`:only-child`) panel de bir flex sütunu: içindeki her şey kendi
boyunu korur ve yer verebilen tek kutu liste (`> .stat-scroll`, `> .entity-list`, sabit
tavanları 22rem ve 62vh geçersiz, tabanları 6rem). Bir özetin boyu içindekinden
gelir, ekranı geçince kayan şey liste olur, başlık ve açıklama yerinde kalır.
Listenin tabanı rem cinsinden, `--ui-scale` büyüyünce liste de büyüsün. Kayan bir
tablonun başlık satırı (`thead`) yapışkan, çünkü satırlar kayarken sütun adlarının
kaybolması tabloyu okunmaz yapar. Panelin kendi kaydırması (`overflow-y`) yalnız küçülemeyen yarı tek başına
ekrandan uzunsa devreye girer. Yazdır ve gönder'in dört panelli rayı kendi kaydırmasını tutar.

Özet'te önce yanlış olan gösterilir: uyarı kutuları kapasite tablosunun üstünde, `CapacityRows`
orada da `problemsFirst` alıyor,
ve sorun yoksa yerlerinde boşluk bile kalmaz.

## Listeler

- **Dört liste:** Derslikler ve Branşlar Okul bilgileri'nin bölümleri, Öğretmenler ve Sınıflar kendi sekmeleri (2026-11-16, K1). Okul bilgileri'nde sıra bağımlılık zinciri: sınıf bir dersliği gösterir, öğretmen listeden bir branş seçer. Her liste her an açık, kilitli bir sihirbaz değil, ve önlerinde sıra numarası yok. Sayaç kalıyor, çünkü 0 gösteren liste eksiğin nerede olduğunu söylüyor.
- **Derslikler ve Branşlar iki kardeş panel:** bir ekleme paneli (`.panel.add-panel`: işi adlandıran başlık ve yanında açıklamasını tutan `?`, form ve Excel'den yapıştır) ve liste paneli (`.panel.step-panel`: arama şeridi ve tablo). Branşlar'da yapıştır yok. `e2e/kurulum.spec.ts` 44 sırayı ve iki ayrı kutu olduğunu ölçer.
- **Öğretmenler ve Sınıflar düz yazı** (2026-11-16, K5): tek panel, başlığında `Excel'den yapıştır`, altında arama şeridi ve satırları kutusuz bir tablo (`table.person-list`). Öğretmen satırı tam ad, kısa ad, branş, ders saati ve durum; sınıf satırı ad, derslik, ders saati ve durum. Durum küçük bir yazı: bütün gün gelmediği günler (`Sal, Per gelmiyor`), kalan kapalı saat sayısı, ve haftası sığmıyorsa kırmızıyla kaç saat fazla olduğu. Ad bir düğme ve kişi sayfasını açar; satırın kalanı fareye de cevap verir ama Tab durağı değil. Listenin sonunda tek bir satır, `+ Yeni öğretmen` ya da `+ Yeni sınıf`, boş bir kişi sayfası açar; 170 px'lik ekleme formu kalktı. Satırdan bir şey düzenlenmez ve silinmez: renk, e-posta, cinsiyet, 2. branş, sınırlar ve Sil kişi sayfasında.
- **Sağda Özet**, her liste için ayrı bir başlıkla.
- **Yeni bir proje boş branş listesiyle doğar.** Gömülü branşlar bir teklif olarak Branşlar bölümünün sağındaki panelde durur ve tek tıkla listeye girer.
- **Branşlar da elle sıralanır**, ve kişi sayfasındaki branş seçimi bu sırada gelir. `settings.subjects` bir seviye derinde olduğu için `reorderList`'te kendi dalı var. Branş tablosunda iki gövde var: okulun kendi listesi (tutamaklı) ve yalnız bir öğretmende duran, listede olmayan branşlar (tutamaksız), çünkü satır sürükleme hedefi gövde içindeki indisle buluyor.
- **Listelerde ara, sırala ve süz** (`ListTools`, `listview.ts`): Türkçe katlama ve Türk alfabesi sırası.
- **Branş yazılmaz, seçilir**, ve "Yeni branş…" ile oracıkta eklenir. Serbest metin "Matemtik"i sessizce ikinci bir branş yapıyordu ve kısaltması yine "Mat" çıktığı için kâğıtta ayırt edilemiyordu. Kullanılan bir branş silinemez, mesaj kimin kullandığını sayar.
- **Öğretmenin e-postası kişi sayfasının Bilgiler'inde.** Yazıldığı gibi durur; tek bir adrese benzemiyorsa kenarı kırmızı ve üstüne gelince ne yazılacağı söylenir. Excel'den yapıştırmada altıncı sütun; adres biçimindeki bir hücre hangi sütunda olursa olsun e-posta sayılır.
- **Renk bir sayı olarak değil renk olarak seçilir**, kişi sayfasında. Düğme rengin kendisini gösterir, tıklayınca 36 rengin tamamı 6×6 bir `<dialog>`'da açılır ve seçili renk çerçevelidir. Listede renk yalnız adın önündeki nokta.
- **Başlarken** (2026-11-15, beş işe indi 2026-11-16), Okul bilgileri'nin Zil ve günler, Derslikler ve Branşlar bölümlerinin en üstünde beş işlik bir liste (boş bir plan oraya açılır): Okulu tanıt (ad, günler, zil ve dört liste), Dersleri gir, Gelemediği saatleri işaretle (Öğretmenler listesine götürür, saatler kişinin sayfasında), Programı yap, Yazdır. Her iş plandan işaretlenir (okul adı yazılı ve dört liste dolu mu, kapalı saat ya da yerleşmiş ders var mı; Yazdır bu bilgisayarda bir kez basılınca) ve her birinin oraya götüren bir düğmesi var; Okulu tanıt'ınki ilk eksik parçaya gider (ad, öğretmen, sınıf, branş; derslik sorulmaz, sınıfın dersliği olmayabilir, 2026-11-16). Düğmenin sözü yapılacak işi söyler, sekmenin adını değil (tuzak 49). İlk iş varsayılan haftayı yazar ("Salı–Pazar, günde 12 ders"), yanlışsa görülsün diye. Düğmeleri sade: ekranın dolu tek düğmesi listenin `Ekle`'si. Dersi olan planda liste kendiliğinden tek satıra iner (`Sıradaki: …` ve o işin düğmesi), `Listeyi daralt` ve `Listeyi kapat` bu bilgisayarda hatırlanır (`ders-programi-ilk-adimlar`). Bütün işler bitince ya da kapatılınca liste tek bir bağlantıya iner (`Başlarken listesini göster`); `?` → Başlarken da onu açar. Dersi olan bir plan Program'da açılır. Hiç öğretmen ve sınıf yokken altında hazır bir okul yükleme teklifi durur (`Örnek okulu yükle`, `Bir daha gösterme`), taslak varsa `Taslaktan başla`; liste kapatılsa da teklif kalır. Görüldü işareti ilk çizimde değil bir eylemde yazılır, okunmamış bir teklif bir yenilemeyi atlatsın diye. Örnek okulun kalıcı yeri Okul bilgileri → Hakkında: orada düğme hep durur, proje doluyken sorusu ne kaybedileceğini sayar ve kırmızıdır.

## Gelemediği saatler

Müsaitlik bir sekme değil (2026-11-16, K1): ızgara kişinin sayfasında (öğretmende "Gelemediği saatler", sınıfta ve derslikte "Kapalı saatler"), altında `Bütün haftayı aç` ve `Bütün haftayı kapat`. Okul geneli bir düzenleme yolu yok; saatler kişi kişi girilir.

- Izgarada satır gün, sütun ders, çünkü bu bir günü okuma ekranı (aSc'nin "Time off" penceresi de öyle).
- Kapalı saat büyük, kırmızı bir çarpıyla ve taramayla işaretlenir. Kararın gerekçesi kapsamdı: Program ızgarasında kırmızı "bu bırakma reddedildi" demek, bu ızgarada ise ne bırakma ne ret var ve ekranın söylediği tek şey açık ya da kapalı. Tarama da duruyor, çünkü renk tek başına bir durum taşımıyor. 2.0.2'den beri Program ızgarası da kapalı saatlerde aynı çarpıyı kullanıyor (`styles.css`), yani bu kapsam gerekçesi bugün tarihsel.
- Her hücre ve her başlık bir düğme (`aria-pressed` hücrenin durumu, adı "Salı 3. saat, müsait değil"), tablo `role="grid"` ve tek bir Tab durağı: oklar hücreler ve başlıklar arasında gezer, Space ya da Enter saati, başlıkta bütün günü ya da saati değiştirir. Fareyle boyama hücrenin kendi `pointerdown`'ında kaldı; düğmenin `click`'i yalnız klavyeden gelince (`e.detail === 0`) çalışır, yoksa bir tık saati iki kez çevirirdi. Parmakla boyama (iPad, 2026-11-16) aynı yoldan: dokunma ilk hücreye yakalandığı için öteki hücreler `pointerenter` duymaz, tablo `pointermove`'da parmağın altındaki hücreyi `elementFromPoint` ile sorar (`td[data-cell]`), ve boyanan hücrelerde `touch-action: none` sayfayı kaydırmaz; başlıklar kaydırır (tuzak 175).
- Satırlar Program ızgarasınınkinden uzun. Başlıkta ders numarası, altında başlangıç saati, hep açık (`with-clock`).
- Izgara `common/AvailGrid.tsx`.

## Dersler

Öğretmenler ve Sınıflar şeritlerinin `Dersler`'i (2026-11-16, K1; Dersler kendi sekmesiydi). Sınıflar'da sınıftan, Öğretmenler'de öğretmenden girilir; iki şeridin Daha fazla'sı bütün dersleri tek listede açar; kişi sayfasında ders sayfadan çıkmadan eklenir. Formun branş kutusu Öğretmenden dışında bir süzgeç ve öyle adlanır (`Branşa göre süz`); blok seçicinin adı `Haftaya dağılış`, üzerine gelince ve panelin `?`'inde bir örnek söyler ("4 saat: 2+2 = iki gün ikişer saat"). Öğretmen seçicisi "Ad Soyad · Branş" yazar.

- **Üç yol:** Öğretmenler → Dersler (öğretmenden), Sınıflar → Dersler (sınıftan), ve iki şeridin Daha fazla'sında bütün dersler (genel). Odaklanmış yolda form o ekseni sormaz: Sınıflar'da sınıf, Öğretmenler'de öğretmen seçimi yok, odak sağdaki listeden (`Hangi sınıf`, `Hangi öğretmen`) gelir ve şerit hangisinin açık olduğunu söyler. Öğretmenden girerken branş seçimi yalnız öğretmenin iki branşı varsa çıkar. Genel'in sağ sütunu Özet. Mod ve odak hiçbir yerde saklanmaz.
- **Haftalık saat girilir, dağılım seçilir** (aSc'nin `Lessons/week` ve yanındaki liste ikilisi). Seçenekler saatten türer ve 3, 2 ve 1 saatlik blokların her birleşimini sayar: 3 saat için `3`, `2+1`, `1+1+1`, 5 saat için `3+2`, `3+1+1`, `2+2+1`, `2+1+1+1` ve `5×1`. Günlük sert bir sınırı çiğneyen seçenek kilitli ve sebebiyle gösterilir. Saat düşünce seçim kırpılır, ve dağılım değişince o dersin yerleşimleri kalkar, çünkü yerleşmiş blokların boyu artık yanlış.
- **Bir ders ızgaradan ayrılmadan da düzenlenir** (`LessonEdit`): sınıf, öğretmen, branş, haftalık saat, dağılım, günde en fazla, aynı gün olmasın. Başka bir öğretmene ya da sınıfa taşınınca artık sığmayan bloklar havuza döner. "Aynı gün olmasın" satırında her ilişkili ders bir çip (× geri alır) ve bir liste var: öteki dersler sınıf sınıf gruplanmış, seçilen ilişki eklenir. İlişki iki yönlü, öteki dersin sayfasında da görünür (TODO B5.3).

## Program

### Izgara

- **Eksen:** satır öğretmen (ya da sınıf), sütun gün × ders, tek geniş tablo. aSc'deki gibi ve babanın alışkanlığı. Görünüm şeritten seçilir.
- **Satır başı** yapışkan, ve tıklanınca o öğretmenin ya da sınıfın panelini açar.
- **Hücreyi boyayan renk** öntanımlı olarak öğretmen rengi, şeritteki `Renk` menüsünden sınıf, derslik ya da branş rengi seçilebilir. Sınıf rengi ayrıca satır başındaki noktada ve basılan sayfanın başlığında bir işaret.
- **İmleç haçı.** Bir hücrenin üstüne gelince satırı, sütunu, saat başlığı ve satır adı birlikte aydınlanır. Uzun bir haftada yerini kaybetmemenin yolu ve babanın gözüne doğrudan bir cevap. Kapalı saat taramasını örtmez, ve sürükleme başlayınca söner, çünkü orada ızgaranın kendi renkleri konuşur. Birleşmiş iki ve üç saatlik blokların kapsadığı her sütun yanar (tuzak 85). Saf DOM, `gridChrome.ts`.
- **Gün bandı.** Tek indeksli günler çok hafif bir zemin alır, günleri gruplamak için.
- **Saat başlığı** ders numarasını taşır; başlangıç ve bitiş saati başlığın `title`'ında ve her basılan sayfada. Izgara saati 2026-11-16'dan beri çizmiyor (aşağıda).
- **Öğle arası** dar bir ayraç sütunu, çünkü ızgarada ara konumu gün başına sabit. Ayraç `data-day` ve `data-hour` taşımaz (tuzak 13).
- **Izgara kutuya sığar, ders hiç kesilmez** (2026-11-16, Sadeleşme K6 ve Alp'in (b) kararı): tek düzen, seçenek yok; Ferah, Rahat ve Sığdır kalktı. Sütun kutunun payı kadar geniş, ama en geniş dersin okunduğu genişlikten (`--cell-min`, `platform/dom/gridFit.ts` yazıdan ölçer: kartın satırları ve saat numaraları) dar değil. Hafta o genişlikte sığmıyorsa ızgara yana kayar: kalın, hep çizilen bir kaydırma çubuğu, satır başları ve saat satırı yapışkan. Kart yazısı varsayılan ölçekte 12 px ve hiçbir yerde 11 px'ten küçük değil; küçültülerek sığdırılmaz. Örnek okulda 1920 %100'de hafta sığıyor, 1920 %125/%150 ve 1366 %100/%125/%150'de kayıyor, hepsinde 376 dersin 0'ı kesik (`gorunum.spec.ts` 45, 45b). Yazının büyüklüğü Okul bilgileri → Görünüm → Yazı büyüklüğü'nde. Sınıf adı ilk kelimesiyle yazılır ("411A SAY" → "411A", kartta ve satır başında; tam ad etikette). Öğretmen satır başında soyadıyla (on harfe kadar), altında kısa ad ve branş; sınıf görünümünün kartı soyadını saat başına üç harf sığıyorsa yazar, yoksa kısa adı (2026-11-16).

### Havuz

- **Havuz ızgaranın altında bir çekmece.** Boyu kenarından (`role="separator"`) sürüklenir ve bırakılan boy hatırlanır, çekmece açılıp kapatılabilir. Bekleyen kart kalmayınca çekmece yalnız başlığını bırakıp kapanır ve düğmesi kapanır, kart gelince kendiliğinden açılır; elle kapatılmışsa kapalı kalır. Bu kapanma tercihe yazılmaz. Altta, çünkü sağda üç kart genişliğinde bir sütun bekleyen dersleri kaydırılan bir listeye çeviriyordu, altta ise görülen bir tepsi.
- **Ders başına değil blok başına kart.** `2+1` bir ders bir ikili ve bir tekli bırakır, ve kart kaç saat olduğunu hem yazıyla hem genişliğiyle (`[data-size='2']` iki katı) söyler. Aynı dersin aynı boydaki blokları tek bir deste, en çok iki katman görünür. Kaç tane olduğu kartın `title`'ında, `data-count`'ta ve tepsinin başındaki "N blok bekliyor"da.
- **`.pool-card` bir DESTE demek, bir blok değil.** 2026-09-01'den beri havuz deste başına tek kart çiziyor: derinliği `.pool-stack`'in `::before` ve `::after`'ı boyuyor ve blok sayısı `data-count`'ta duruyor. Bekleyen blok sayısı `data-count`'ların toplamı, "N blok bekliyor" oradan geliyor, ve `pendingBlocks()`'un aynası o toplam. Sebebi ölçüldü: örnek okulda 367 blok DOM'da 114 karta iniyor ve gömülü kartların boyanması Program sekmesinin açılışına giriyordu. Havuz testleri `data-count` toplamını sayar; `.pool-card`'ı blok sanan üç test aynı gün düzeltildi. Yan faydası duruyor: haftalık saati elle aşmak mümkün değil, destede blok bitince sürüklenecek bir şey kalmıyor.
- **Başlıklı gruplar**, ve başlık sıralamadan türer: ızgara sırasında ve ada göre satırın adı ve renk noktası, branşa göre branş, uzun bloklar önce "N saatlik bloklar", en çok kalan "N saat kaldı". Her başlık kart sayısını taşır ve kartların yanında durur, üstünde değil (tuzak 100).
- **Beş sıralama** (Izgara sırası, Ada göre, Branşa göre, Uzun bloklar önce, En çok kalan) ve bir branş süzgeci. Süzgeç birden fazla branş bekliyorsa çıkar. Süzülünce tepsinin başlığı neyi sakladığını söyler, yoksa "hepsi yerleşti" bir tık ötede yanlış olurdu. Sıra ve süzgeç `toolState.ts`'te bir pozisyon.
- **Havuz kartı görünümü takip eder:** üst satır ders yerleşince hücrenin okuyacağı şey, alt satır kartın gideceği satır, ve sıralama bir satırın kartlarını yan yana tutar.

### Sürükleme ve bırakma

- Sol düğmeyle sürüklemek taşır, sağ tık menü açar, Delete havuza gönderir ve odağı aynı hücrede bırakır. Klavyeden gelen bir tıklama `e.detail === 0` ile ayrılır: odaklı kartta Enter ve Space kartın sağ tık menüsünü açar, kısayol ekranının dediği gibi. 2026-09-26'ya kadar dersi sessizce havuza gönderiyorlardı. Sürükleme haritası kaynak bloğu kaldırılmış bir durum üstünde hesaplanır, yoksa ders kendi kendini engeller.
- **Klavyeyle taşıma** (2026-11-15): havuz kartında Enter, Space ya da T, ızgaradaki kartta T ya da menünün `Taşı`'sı kartı alır. Aynı sürükleme, aynı harita ve aynı boyama (`drag.ts` `startKeys`), yalnız el farklı: ← → hedefi bir saat, Ctrl+← → bırakılabilecek bir sonraki saate, ↑ ↓ komşu güne götürür, Enter bırakır, Esc ve Tab vazgeçer. Gerekçe çubuğu cümlenin önüne yeri yazar ("Salı 3. saat: …"). Odak alındığı yerde kalır; ızgaradan taşınan kart bırakılınca yeni yerinde odaklanır, havuzdan gelen bir sonraki kart için havuzda kalır.
- **Izgara tek Tab durağı** (`gridKeys.ts`, `roving.ts`): durak `.grid-wrap`'in kendisi, Tab gelince odağı son ya da ilk hücreye verir. Oklar hücreden hücreye (satır başı ilk saatin solunda), Home ve End satırın ucuna, Ctrl ile ilk ya da son satıra, PageUp ve PageDown on satır. Kartlar, raptiyeler ve satır başı düğmeleri `tabIndex=-1`; raptiyenin tuşu P. Boş hücre ancak odak alınca odaklanabilir olur ve ad alır ("Salı 3. saat, MÇ, boş"), yoksa iki bin hücre her satır çiziminde öder.
- Sürüklerken hedef satırın tamamı zayıf bir katmanla, imlecin altındaki blok güçlü bir katmanla boyanır: yeşil bırakılabilir, sarı uyarı ya da bir şey kaybedilecek, kırmızı engel. Hedefin dışındaki görünür alan iki düz gölgeleme düzlemiyle karartılır. Reddin sebebi sabit yükseklikli bir satırda yazılır (`.reason-bar`).
- Başka bir kartın üstüne bırakmak takas edebilir, sınıfın kendi dersinin üstüne bırakmak onu havuza döndürebilir. Kuralları [DATA.md](DATA.md)'de.
- Hedef ekran dışındaysa ızgara kenara gelince kayar.

### Sağ tık menüsü

Menünün şekli bir kural: üst düzeyde elin sık uzandığı şey, kapıların arkasında
nadir olan.

```
Taşı · Havuza kaldır · Dersi düzenle · Öğretmeni düzenle · Sınıfı düzenle
────
Dersi buraya sabitle  (ya da Sabitlemeyi kaldır)
```

- Satır, gün ve saat başlığında ve boş bir hücrede menü açılmaz. `Toplu sabitle` (satırı, sütunu, günü) ve `Geçici görünüm` 2026-11-16'da kalktı (Sadeleşme K7); tek ders kartın raptiyesiyle, bütün hafta Daha fazla'daki `Tüm programı sabitle` ile sabitlenir. Havuzdaki bir kartta aynı menü açılır ve ızgaraya ait kalemler kapalıdır.
- `Öğretmeni düzenle` ve `Sınıfı düzenle` ızgaranın çizilmediği eksene ulaşmanın yolu, satır başı zaten bakılan ekseni açıyor.
- Menü tabloyu saran tek bir `ContextMenu.Root`. İki bin hücreye birer tetikleyici konmaz, tıklamanın yeri `data-row`, `data-day` ve `data-hour`'dan okunur. Karta gelmeyen bir sağ tıkta `preventDefault()` çağrılır ve Radix'in kendi işleyicisi hiç koşmaz.
- Dokunmatik ekranda (iPad, 2026-11-16) menü karta yarım saniye basılı tutunca açılır: iOS uzun basışta `contextmenu` göndermez. Yeni bir düğme yok; `platform/dom/longPress.ts` parmağın indiği yere aynı `contextmenu`'yü gönderir, önce bir `pointercancel` ile başlayan sürüklemeyi ve Radix'in kendi 700 ms'lik basışını bitirerek (tuzak 176). 8 pikselden fazla kayan parmak sürüklemedir, menü açılmaz. Fare ve klavye değişmedi.

### Sabitleme

- Kartın köşesinde bir raptiye düğmesi var. Kartın kardeşi, çocuğu değil, çünkü kart bir `<button>` ve düğme içinde düğme geçersiz HTML, ve konumlanma bağlamı hücre. Bu yüzden sağ tık menüsü (`openMenu`) hedefini karttan değil hücreden bulur.
- Raptiye dururken görünmez, hücrenin üstüne gelince, klavye odağında ve kart sabitliyken görünür. Bir Tab durağı değil: klavyede odaklı kartta P, ya da menünün kalemi. 2026-08-30 tarihli kayıt "hep görünür, sönük" diyordu, 2026-09-25'te kullanıcı "dururken görünmez"i seçti ([DECISIONS.md](DECISIONS.md)).
- Sabitli olduğunu bir renk değil bir simge söyler, çünkü ızgaranın renkleri zaten bırakılabilir, uyarı, engel ve kapalı demek.
- Sabitlenmiş kart sürüklenmez ve Delete'e cevap vermez, "Havuza kaldır" kapalıdır, `Baştan diz` ve `Programı boşalt` onu yerinde bırakır. Kuralları DATA.md'de.

### Otomatik dizme

Şeritte `Programı yap` bekleyen dersleri dizer, Daha fazla'daki `Yeniden yap`
(sormadan, bildirimi `Önceki programa dön` taşır, sabitlenen yerinde kalır) ızgarayı boşaltıp
yeniden dizer. Bekleyen ders yokken kapalı saatte kalan ders ya da kesin kural ihlali varsa ana düğmenin
yerinde `Yeniden yap` durur; havuzun başı o zaman "Hepsi yerleşti" değil çipin "N sorun"unu
söyler. Bir ayarı yok: "sabaha yay" gibi tercihler
henüz ölçülmedi, aSc'nin karşılığı `docs/asc/yardim/u58-timetable-generation.md`'de
duruyor ve okunmadı. İlerleme ve sonuç `.reason-bar`'da düz metin olarak yazılır:
sabit yükseklikli, ızgarayı kaydırmıyor, ve göz oraya zaten alışkın. Bütün koşu tek
geri al adımı. Boştaki satır tek cümle söyler ("Yerleşmiş dersi sürükleyerek taşıyın."), satırların ne olduğu yanındaki `?`'te. Sonucun satırı ("Program yapıldı…", "Öneri uygulandı…") yalnız program
o koşunun bıraktığı hâldeyken durur: Ctrl+Z ya da başka bir değişiklikten sonra satır
ızgaranın ne olduğunu söyleyen boş hâline döner. Okul listelerindeki "… sıraya
taşındı." cümlesi de aynı kuralla susar.

Koşu takılırsa satır ne olduğunu söylemeye devam eder (hangi ders, neden), ve
altında, ızgaranın üstünde bir öneri paneli açılır (`Suggestions.tsx`, TODO B5.9,
B5.10): hafta hangi yollarla kurulur. Arama kendiliğinden başlar, sürerken panel
"Nasıl kurulacağı aranıyor…" der ve şeritteki `Durdur` onu da durdurur. Aynı gün
olmaması istenen iki ders aynı güne sabitlenmişse arama başlamaz: panel bunu tek
cümleyle, gövde yazı boyunda söyler, sorun listesinin kural ihlalleri paneli de bir cümleyle
(TODO RK2). Bir yol
seçilmez, seçen babadır, ama okunacak yazı az olsun diye yalnız ilki açık durur:
öteki yollar "Başka yollar (N)" altında katlıdır ve bir tıklamayla açılır
(2026-11-15, babanın "daha az yazı" isteği). Yolların sırası sabittir ve
kullanıcının kendi listesi: öğretmenin zaten geldiği güne saat, en az saat (yan
yana), en az öğretmen, saat ve sınır birlikte, yalnız sınırlar, dersi başka
öğretmene vermek, blok şekli, haftalık saat; açık duran, bu sırada bulunan ilk
yoldur. Arama sürerken panel her yol için bir "aranıyor" satırı değil, saniyesiyle
tek bir cümle ("Nasıl kurulacağı aranıyor…", bir yol bulununca "Başka yollar da
aranıyor…") ve bir ilerleme çubuğu gösterir; bir şey bulamayan yol hiç görünmez.
Bulunan her yol tek satırdır: babanın bir öğretmene söyleyeceği cümle ("KY
Cumartesi 3–4. saatlere de gelebilirse hafta kuruluyor."), `Izgarada göster`,
`Uygula` ve `Sorular`. Bir yol ilk bulduğunu hemen gösterir ve arama sürerken
daha iyisini bulursa satır yerinde değişir; o sürece satırın yanında "(daha iyisi
aranıyor)" yazar. Arama `Durdur` ile kesilirse panel bitmiş bir arama gibi
konuşmaz: "Arama durduruldu" der, o ana kadar bulunan yollar kalır ve bitmemiş
yolun satırında "(inceltilmedi)" yazar, yanında `Aramayı sürdür` durur. Sürdürmek
aramayı aynı cevaplarla baştan başlatır, bulunan haftalar ilk tahmini olur. Aynı öğretmenlerden aynı günlerde aynı sayıda saat isteyen iki
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

## Sorun listesi

Durum çipi açar (2026-11-16, K3; Kontrol bir sekmeydi): sağdan bir sayfa, `ProblemList.tsx`,
başlığı "Programın durumu". Üstte hüküm kutusu ve haftanın sayıları (yerleşmiş saat,
tamamlanan ders), altında başındaki segmentin seçtiği bölüm: Sorunlar (kapalı saatte kalmış
dersler, kural ihlalleri, yerleşemeyen dersler, ya da hiçbiri yoksa bunu söyleyen bir satır)
ya da İpuçları; Daha fazla'da öğretmen, sınıf ve derslik yükü (Özet'le aynı `CapacityRows`).
Kapalı saatte ders varken hüküm "Sorun görünmüyor" demez; hafta tamamen dizilmişse "Program
tamam" der.

Her sorun satırının gidecek bir yeri var (2026-11-15). Kapalı saatte kalan ders, kaç saati
olursa olsun tek satır: dersin adı, saatleri ve kimin kapattığı, sonda `Göster` (listeyi
kapatır, Program'a geçer, kartı ortaya kaydırıp odaklar ve bir an işaretler) ve `Sayfasını aç`
(kapatanın kişi sayfası). Kural ihlalinde `Göster` o günün ilk kartına gider. Yerleşemeyen
dersler bağlayan sebebe göre tek satır, dersler altında düğme olarak, her biri kartı havuzda
işaretler; sebep bir kişinin ya da yerin açık saati yetmiyorsa `Sayfasını aç` da var. Gizli bir
satırdaki kart bulunamazsa bunu bir bildirim söyler.

Havuzdaki bir dersin sağ tık menüsünün başı `Neden yerleşmedi?`: liste o dersin düğmesinde açılır,
yanında sebebi ve kimin sayfası. Dersin bir satırı yoksa (yalnız henüz dizilmemişse) haftanın
sayıları altındaki cümle `Programı yap`'ı söyler. Izgaranın üstündeki satırda koşu takılınca
`Ayrıntı` listeyi açar. Ctrl+K'de "kontrol", "sorun" ve "neden" listeyi bulur.

## Yazdır ve gönder

- **Sayfa başına bir sınıf ya da öğretmen:** satır gün, sütun ders, A4 yatay, `table-layout: fixed`, sütunlar eşit. Ana ızgaranın bütün haftası tek tablo olarak basılmaz (tuzak 8).
- **Hangi sayfaların basılacağı tek tek seçilir:** sınıf ve öğretmen için ayrı onay listeleri (öğretmen tam adıyla ve kısa adı ayraç içinde), `Tümü` ve `Hiçbiri`, ve düğmede kâğıt sayısı (`Yazdır (N kâğıt)`). Seçim dışarıda bırakılanlar olarak tutulur, sonradan eklenen bir sınıf sessizce dışarıda kalmasın (tuzak 18).
- **Sayfa düzeni:** bir kâğıda 1, 2 ya da 4 program, ve kâğıttaki yazı (Küçük, Normal, Büyük). Düzen bir taban ölçek dayatır (`--p-fit`), okuyan onun üstüne kendi tercihini koyar (`--p-zoom`), ve ikisi `:root`'ta değil `.print-area`'da tanımlı (tuzak 63). `.print-sheet` kâğıdın kendisi (297×205 mm, `break-after` onun üstünde), `.print-page` bir program, ve bu ayrım her ayarda aynı kalır.
- **Sayfada ne olsun:** kurs adı, derslik ve branş, ders saatleri, hücrenin alt satırı, çıktı tarihi (2026-11-16'dan beri öntanımlı açık).
- **Her kâğıdın üst satırı** (2026-11-16): solda planın adı, sağda çıktı tarihi (açıksa) ve `Sayfa 2 / 5`. Kâğıdın üst dolgusunda, akışın dışında (`.p-head`), yani programı hiçbir ayarda ikinci kâğıda itemez; numarayı tarayıcı değil sayfa yazar, çünkü tarayıcının üst bilgisi kenar boşluğunda ve boşluk 0 (tuzak 31). Sınıf sayfasında tablonun altında kodların açıklaması: `AV Ayşe Vural · MÇ Mehmet Çelik`, koda göre sıralı, yalnız hücrenin alt satırı basılıyorsa.
- **Kâğıtta 7 pt'tan küçük yazı yok:** yazı merdiveninin her basamağı `max(7pt, …)`; 4'lü ve Küçük'te de. Üst satır ve açıklama tabanın kendisinde.
- **Yazdır'ın altında tek satır:** "Dosya olarak saklamak için yazdırma penceresinde Hedef'i **PDF olarak kaydet** yapın." Yazdırma penceresi açıkken sayfanın adı kaydedilecek dosyanın adıdır (`Mozaik – 510 – 2026-11-16`; tek sayfa seçiliyse o kişi, yoksa plan; `usePrintTitle`), Chromium'un "PDF olarak kaydet"i onu önerir. "Arka plan grafikleri" öğüdü kalktı: `print-color-adjust: exact` renkleri o kutu kapalıyken de basıyor (ölçüldü, tuzak 211).
- **Önizleme kâğıdın kendisi:** ekranda ve kâğıtta mm cinsinden aynı kutu. Ekrana özel kalan şeyler kâğıdın üstünde olmayanlar: gölge, köşe yarıçapı ve sayfaların durduğu tepsi.
- **Başlık iki satır:** büyük ve ortalı ana satır (`510 sınıfı` ve "Haftalık ders programı"), altında küçük bir künye satırı (okul adı, derslik). Tek, uzun, sola yaslı bir satır kâğıtta başlık değil altyazı gibi okunuyordu. Tarayıcının kendi tarih ve dosya yolu satırı kâğıda çıkmaz (tuzak 31); tarihi kâğıdın kendi üst satırı yazar.
- **Sütun başlığında saat.** Bir ders numarası bütün günlerde aynı saatteyse yalnız saat yazılır. Öğle arası farklı yere düştüğü için günlere göre farklıysa her grup gün aralığıyla yazılır: `Sal–Cum 13:30–14:10` ve `Cmt–Pzr 13:10–13:50`. Gün adı yalnız birden çok cevap varken çıkar, çünkü on iki sütunun üstüne aynı aralığı yazmak on bir kez hiçbir şey söylemek olurdu (`periodGroups()`, `Print.tsx`).
- **Öğle arası** satırdan satıra değiştiği için o satırın hücresine kalın bir kenarlık.
- **Öğretmen sayfasını sınıf rengi, sınıf sayfasını öğretmen rengi boyar**, çünkü sayfada değişen ve okuyanın aradığı şey o.
- **Kapalı saat işareti kâğıda çıkmaz.** Duvara asılan bir kâğıt "saat 10:40'ta neredeyim" sorusuna cevap verir. Bilgi kişi sayfasında düzenleniyor ve sorun listesinde sayılıyor.
- **Tek kişinin sayfası** kişi sayfasının `Yazdır`'ıyla, Yazdır ve gönder'e gitmeden basılır: listeden iki tıklama. Sayfa `<body>`'nin altında kendi kutusunda çizilir ve yazdırma penceresi açıkken kâğıtta tek şey odur (`PrintOne.tsx`, `html.print-one`); Yazdır ve gönder'in onay listelerine dokunmaz. Sınıfın sayfasında yanında `PDF kaydet`: aynı kâğıt, yazdırma penceresi olmadan bir PDF dosyası olarak İndirilenler'e (`send.ts`, `pdf.ts`).
- **Gönder** paneli, Yazdır panelinin hemen altında: her öğretmen için tam adı, adresi ve "E-postada aç", ya da neden olmadığı (adres yok, adres hatalı, programı boş, e-postaya sığmıyor), ve WhatsApp'ın okuyabildiği bir numarası varsa `WhatsApp`. İki düğme de önce öğretmenin kâğıdını PDF olarak İndirilenler'e kaydeder (`Mozaik – Ad – 2026-11-16.pdf`), sonra e-posta düğmesi öğretmenin haftasını düz metin olarak kullanıcının kendi e-posta programında yeni bir ileti hâlinde açar, WhatsApp düğmesi öğretmenle sohbeti `https://wa.me/<numara>?text=` ile (tarayıcıda yeni sekmede, exe'de varsayılan tarayıcıda, `mail.rs`'in `whatsapp_ac`'ı); gönderen kullanıcıdır. Panelin üstündeki satır dosyanın adını ve "İletiye ya da sohbete ataşla ekleyin"i söyler: ne `mailto:` ne `wa.me` bir dosya taşıyabilir. Exe'de seçili bir e-posta programı yoksa panelin altında tek satır bunu söyler; tarayıcıda sayfa bunu bilemez, tıklamadan sonra tek satır açılmadıysa ne demek olduğunu söyler. Onay listeleri bu paneli etkilemez: bir öğretmene haftasını göndermek bir baskı işi değil.
- **Kâğıt fiziksel.** Açık palet kullanır, `--ui-scale` kâğıda geçmez, sayfa 205 mm'lik sabit yükseklikli bir kutu ve plan onun içinde dikey ortalanır, kenar boşluğu sayfanın kendi dolgusu (tuzak 31).

## Okul bilgileri

Yedi bölüm (2026-11-16, K1; Ayarlar ve Okul'un iki listesi): `Zil ve günler · Derslikler · Branşlar · Kurallar · Görünüm` şeritte, `Planlar ve yedek · Hakkında` şeridin Daha fazla'sında. Bir ekran, bölümü şerit seçer; Derslikler ve Branşlar yukarıda "Listeler"de.

- **Zil ve günler:** okul adı, hangi günler ders olduğu, zil saatleri, ve sağda zil önizlemesi. Dersleri dizili bir günü kaldırmak ya da günlük ders sayısını düşürmek önce bir soru sorar: o gün ya da saatlerde kaç saatin yerleşmiş, kaçının sabitli olduğunu ve derslerin havuza döneceğini söyler. Vazgeçilince kutu eski değerine döner. Günlük ders sayısını yalnız `Günlük ders sayısı` kutusu belirler, `Ders adları` yalnız ad verir: adı yazılmayan saat numarasını alır, ders sayısından fazla ad kullanılmaz ve kutunun altında bunu söyleyen bir satır çıkar. Başlangıç saati iki açılır liste (saat ve beşer dakika), `<input type="time">` değil: o girdi AM ya da PM'i tarayıcının yereline göre seçer ve boşaltılınca günü sessizce 00:00'a alır.
- **Kurallar:** okul geneli sınırlar ve seviyeleri, sağda canlı ihlal listesi.
- **Görünüm** okulu değil makineyi tarif eder: tema (Açık, Koyu), yazı büyüklüğü (Normal, Büyük, Daha büyük, Çok büyük: %100, %115, %130, %150; eski kayıtlı bir değer olduğu gibi çizilir, en yakın basamak basılı görünür, 2026-11-16; aynı dört basamak `?` menüsünde ve Ctrl+K'nin `Yazıyı büyüt`'ünde), araç şeridi (görünsün ya da gizlensin, ve kaydırınca gizlenmesi), hareket (Tam, Az, Kapalı) ve dil. Her panelin açıklaması başlığının `?`'inde. Sağda örnek bir tablo. Yazı büyüklüğü bir kaydırıcı değil düğmeler, çünkü yasal değerler sayılı ve bir kaydırıcı olmayan bir süreklilik uydururdu. Bu ayarların hiçbiri kâğıdı etkilemez. Tema yalnız burada (2026-11-16).
- **Planlar ve yedek**, "işim nerede duruyor ve dışarı nasıl çıkar": plan kitaplığı (yarat, adlandır, sil, taslak), "Nereye kaydedilsin" (seçilen klasöre bütün planlar ve günlük yedek), "Bütün planlar tek dosyada" (paket), oturum yedekleri. Klasör paneli paketin üstünde, çünkü bir alışkanlık isteyen çareden önce hiçbir şey istemeyen çare gelir.
- **Hakkında**, "bu hangi kopya": sürüm ve güncelleme, katlı bir Yenilikler paneli, katlı "Teknik bilgiler" (öneri aramasının iş parçacıkları, adres ve "Veriler nerede" tablosu; 2026-11-16'dan beri, çünkü geliştiricinin okuması babanın ekranındaki en uzun paneldi), örnek okul verisi, ve yan sütunun en altında kendi kırmızı kenarlı panelinde `Sıfırla` → `Her şeyi sil` (sorusuyla; 2026-11-16'ya kadar `Örnek okulu yükle`'nin hemen altındaydı). Sürüm satırı tek tarihi taşır, Yenilikler yalnız sürüm numarasını; sitede `Güncellemeleri denetle` yok, panel "Mozaik burada kendini günceller" der, exe'de düğme durur. "Veriler nerede" gerçek anahtar adlarını ve boyutlarını gösterir, ve verinin bu tarayıcıya ve bu bilgisayara ait olduğunu, "tarama verilerini temizle"nin onu sildiğini ve taşınan tek şeyin dosya olduğunu tek bir cümleyle söyler. "Tarayıcıda saklanıyor" demek bunu söylemiyordu.

`Data.tsx` son iki bölümü birlikte çizer, çünkü paketi yazan işleyiciler kitaplığı
okuyanlarla aynı.

## Diyaloglar, bildirimler ve boş ekranlar

- **Her soru** `useDialogs()` üstünden sorulur (`confirm`, `alert`), `window.confirm` ve `window.alert` kullanılmıyor. Geri alınamaz uyarılar `role="alertdialog"`.
- **Geri alınabilen silme sormaz** (TODO SD1): öğretmen, sınıf, derslik, ders, kullanılmayan branş, eski bir dosyanın ikinci programı, `Programı boşalt` ve `Yeniden yap` hemen olur, ve bildirim ne gittiğini sayar ve `Geri al` taşır (`Yeniden yap`'ınki `Önceki programa dön`): "A dersliği silindi, 4 sınıfın dersliği boşaldı (410, 411, 510, 511). Bu sınıflar artık aynı saate konabilir." Bildirim 10 s durur, fare üstündeyken ya da odak içindeyken süresi işlemez; `Geri al` yalnız en yeni bildirimde, arada başka bir değişiklik olduysa bunu söyler. `Sil`'den sonra odak sonraki satırın `Sil`'ine geçer (son satırda öncekine, liste boşaldıysa ekleme kutusuna), ve Ctrl+Z ekran okuyucuya neyi geri aldığını söyler. `Her şeyi sil` ve dolu planın yerine örnek okul bir kez sorar, sonra aynı bildirimi verir. Dosyadan aç'ın sorusu dosyayı açık planla yan yana sayar: "Dosyada: 18 öğretmen, 20 sınıf, 146 ders, yerleşmiş 330 saat. Şu an: …"
- **Olan biteni** kısa bir bildirim satırı söyler (`useToast()`), ve bir hamlede ne kaybedildiyse adıyla yazar.
- **Boş ekranlar yönlendirir:** "Henüz ders yok" değil, nereden başlanacağı, ve oraya götüren bir düğme (2026-11-15; önceden sekme adları kalın yazılıp tıklanmıyordu, [DENETIM.md](DENETIM.md), P19). Program, sorun listesi, Yazdır ve gönder ve Dersler eksik ilk adımın düğmesini (`Öğretmen ekle`, `Sınıf ekle`, `Ders gir`) ve okul adı boşken `Okul adını ve zili gir`i gösterir (`common/NextStep.tsx`, `common/GoTo.tsx`). "Mozaik'i güncelleyin" diyen her yer (Dosyadan aç, Tümünü dosyadan aç, açılıştaki şerit) Okul bilgileri → Hakkında'ya götüren `Güncellemeye bak` düğmesini taşır. Boş bir plana dosya açmak soru sormaz: kaybedilecek bir şey yok (`isEmptyPlan`).
- **Ctrl+K komut paleti** her yere gider, her şeyi bulur, ve işleri de bulur (2026-11-16): "yazdır", "kaydet", "aç", "kopya", "yedek", "okul adı", "tema", "yazı boyu", "programı yap" yazınca o işi yapar ya da yapıldığı tek yeri açar. `?` tuşu klavye kısayolları ekranını açar; üst çubuktaki `?` menüsü de.
- **Yardım "?"** (`common/Help.tsx`): panel başlığının yanındaki yuvarlak düğme, açıklamayı bir açılır kutuda gösterir; Esc ve dışarı tıklama kapatır, odak düğmeye döner. Kapalıyken açıklama ne ekranda ne erişilebilirlik ağacında.
- **Tarih sayfası** (`ui/dated/DayDialog.tsx`, 2026-11-16, şema v18): bir tarihin taban haftadan farkı. Başında tarihin adı ("Salı 17 Kasım") ve tek ana düğme `Yazdır` (İkame listesi: tarih, saat, sınıf, gelmeyen, yerine giren, derslik; yalnız tablo, `print-one` deseniyle). Altında `Tarih`, **Gelmeyen** (her satırda ad, `Son gün` ve `Sil`; `Gelmeyen ekle…` bütün öğretmen ve sınıfları sunar, sınıf gelmezse gezi ya da sınav: saatleri ikame istemez, öğretmenleri boş sayılır), sonra o günün değişen dersleri (gelmeyen öğretmeninkiler ve `Bir dersi değiştir…` ile eklenenler, ikincisi önce `Boş geçsin` olarak): Saat, Sınıf, Öğretmen ve `Yerine` seçicisi (`Seçilmedi`, `Boş geçsin`, sonra o saatte boş, kendi saatlerinde müsait ve o gün gelmeyen olmayan öğretmenler; önce aynı branş, sonra bu hafta en az ikameye girmiş, sonra o gün zaten okulda olan; seçenek adı, branşı ve varsa `bu hafta N`'yi söyler; en sonda sınıfı ve öğretmeni boş olan saatler, `N. saate`, yalnız o tarih). En altta, haftada değişiklik varsa çipten açılmışsa `Programda göster` ve `Bu haftanın değişikliklerini sil` (haftanın dışına taşan yokluk günleri kalır). Her seçim hemen yazılır ve tek geri al adımıdır; havuz, Kontrol ve çözücü bu katmanı görmez, ızgara yalnız aşağıdaki salt okunur görünüşte. Program şeridinin tarih çipinden ve kişi sayfasının `Gelmiyor…`'sundan açılır; kişi sayfasından açılan, kişinin sayfasının üstünde ikinci bir diyalogdur.
- **Haftanın görünüşü** (2026-11-16, v18): `Programda göster` ızgarayı o haftanın hâliyle çizer, önerinin önizlemesiyle aynı yoldan (`weekView`, salt okunur, değişmeyen dersler soluk): kimsenin girmediği saatler önerinin "açılan saat" deseniyle (kalın çizgi, tarama, +), taşınan ve ikameli dersler kesik çizgiyle. Izgaranın üstünde bir şerit: haftanın adı, iki desenin açıklaması (`Boş geçsin`, `Değişen`) ve ana düğme `Temel haftaya dön`. Havuz temel haftanınki kalır. Yalnız bellekte: yenilenince ızgara yine temel hafta, düzenlenen de hep o. Önerinin önizlemesi açılırsa o önce gelir.
- **Kişi sayfası** (`InspectorSheet.tsx`, 2026-11-16, K5): bir öğretmenin ya da sınıfın her şeyi, işin sırasıyla. Başında ad ve tür, yanında `Yazdır`, `Gelmiyor…` (bugünün tarih sayfasını açar ve kişiyi o gün gelmeyen yapar; sayfadaki tarih değişince tek günlük yokluk o güne taşınır), öğretmende `Gönder` ve `WhatsApp` ve bir kez ikameye girdiyse `İkame: bu hafta N, toplam M saat`, sınıfta `PDF kaydet`, ve kapat; baş sayfa kayarken yerinde kalır. Altında dört sayı (ders yükü, müsait ya da açık saat, yerleşmiş, kapalı), sonra **Bilgiler** (ad, kısa ad, branş, 2. branş, e-posta, telefon, cinsiyet, renk; sınıfta derslik ve renk), **Verdiği dersler** ya da **Aldığı dersler** (başında satır içi ekleme: sınıf ya da "Ad Soyad · Branş", haftalık saat, `Ekle`; satırlarda haftalık saat kutusu ve `Başka öğretmene aktar…`), **Gelemediği saatler** (sınıfta Kapalı saatler: Müsaitlik ızgarasının kendisi, saatleriyle), **Sınırları** (her kutunun yanında `Okul ayarı geçerli: N` ya da `Kendi sayısı; okul ayarı: N`; kişinin sayısı okulunkinin yerine geçer, sınıfta dersin Dersler'deki sayısı da sınıfınkinin), katlı **Haftalık programı**, ve en altta `Öğretmeni sil` ya da `Sınıfı sil` (sorusuz, bildirimde `Geri al`, öncesi saklanır). `Gönder` adres yoksa nereye yazılacağını söyler ve E-posta kutusuna götürür, `WhatsApp` numara yoksa Telefon kutusuna. Öğretmenler ve Sınıflar listesinden, ızgaranın satır başından, kartın menüsünden, paletten, sorun listesinin `Sayfasını aç`'ından ve Kurallar'ın kendi sınırı olanlar listesinden açılır. Gelemediği saatler'in altında `Bütün haftayı aç` ve `Bütün haftayı kapat`. Açılınca odak sayfanın kendisine girer (ilk düğme Yazdır, Enter yanlışlıkla basmasın), Esc kapatır, odak açan ada döner (açan artık yoksa, sorun listesinin `Sayfasını aç`'ındaki gibi, dialogların dışında en son odaklanan yere: durum çipine); silinince yerine geçen kişinin adına (son satırda öncekinin, liste boşaldıysa `+ Yeni …`'ye). Sağdan kayar, solmaz, çünkü altından iki bin hücre geçiyor. Derslik de aynı sayfada açılır, Yazdır ve Sil'siz.
