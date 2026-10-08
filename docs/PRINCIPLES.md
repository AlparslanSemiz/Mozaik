# İlkeler

Projenin bugünkü duruşu, her ilkenin neyi koruduğu ve şu an yapılmayan işlerin sebebi.

## Bu belge nasıl okunur

Buradaki ilkeler bugünkü duruşu anlatır, tartışmaya kapalı bir liste değildir.
Her ilkenin yanında neyi koruduğu yazılı, çünkü değiştirilebilir bir kuralın tek
savunması gerekçesidir. Bir özelliği reddetmenin yolu "yasak" demek değil,
gerekçeyi okuyup hâlâ geçerli olup olmadığını sormaktır. Gerekçe artık geçerli
değilse duruş değişir ve değişiklik tarihiyle [DECISIONS.md](DECISIONS.md)'ye
yazılır.

**Geçerli olan, babanın ve kullanıcının bugün söyledikleri (2026-10-08).**
İlkelerin bir kısmı projenin başında babanın o günkü isteklerine göre yazıldı,
ve baba fikir değiştirdi. Eski bir ilkeyle bugün söylenen bir şey çatışırsa
bugün söylenen kazanır. Bu yüzden ilkeler ikiye ayrıldı: bir gerçeği koruyanlar
(babanın zor görmesi, kaybolan emeğin geri gelmemesi, eski ve zayıf makine)
aşağıda duruyor, babanın o günkü bir tercihine dayananlar en altta, "Artık
geçerli olmayanlar" başlığında. Ayrımın kaydı DECISIONS.md'de.

Gerekçenin kendisi de ölçülür. Bu projede ölçülmeden yazılmış iki iddia bütün bir
turun iş planına dönüştü ([TRAPS.md](TRAPS.md), tuzak 65 ve 101), o yüzden
ölçülmemiş bir iddia bir gerekçe sayılmıyor.

İlkeler numarasız. Eski kayıtlarda ve kod yorumlarında geçen "ilke N"
numaralarının hangi ilkeye karşılık geldiği DECISIONS.md'de yazılı.

## Çift tıkla çalışır

Program indirilip çift tıklanınca açılır. Kurulum bir seçenek olarak var (Windows
kurulum paketi ve exe), ama kurulmadan çalışan bir yol hep bırakılıyor:
`dist/index.html` çift tıklanır. Dayanağı bir gerçek: babanın makinesi eski
(aşağıda, "Hedef makine"). Exe orada açılıyor (baba Ayarlar'daki güncelleme
düğmesine bastı, tuzak 106), ama exe WebView2'ye dayanıyor, ve WebView2 açılmadığı
ya da kurulu olmadığı bir makinede kurulmadan açılan dosya tek yol olarak kalır.
Kurulamayan bir makinede program açılmıyorsa bu ilkeden
geriye bir şey kalmaz. Güncelleme de aynı çizgide durur: program yeni bir sürümün
geldiğini söyler, kullanıcı istemeden hiçbir şey değişmez.

**Açılış ağa bağlı değil.** Babanın makinesinde internet olup olmadığı bilinmiyor,
o yüzden programın açılması ve kendi verisiyle çalışması ağa bağlı olmaz: font ve
simgeler dosyanın içine gömülüdür. Ağ isteyen bir özellik (göndermek, güncellemeyi
denetlemek) ağ yokken kendi işini yapamaz ve bunu söyler, ama programı durdurmaz.
Bugün program çalışırken ağa hiç çıkmıyor, ve bu `vite-plugin-singlefile`,
`e2e/temel.spec.ts`, `e2e/site.spec.ts` ve `e2e/kapan.ts` ile mekanik olarak
ölçülüyor. Ağ isteyen bir özellik girerse bu ölçüm ona göre daraltılır, kaldırılmaz.

## Türkçe kaynak dil

Arayüz beş dil konuşur (tr, en, de, es, fr), ilk açılışta cihazın dili seçilir ve
cihaz bu beşinden birini konuşmuyorsa İngilizceye düşülür. Kaynak dil Türkçe:
Türkçe cümle çeviri sözlüğünün anahtarıdır, ve State'e giren metinler (gün ve
branş adları) depoda Türkçe kalır. Böylece JSX okunur kalır, eksik bir çeviri doğru Türkçeye
düşer, ve bir yedek dosyası her makinede aynı şeyi anlatır. Ayrıntısı
[CONVENTIONS.md](CONVENTIONS.md)'de.

## Veri kaybı olmaz

Her şey her an dışarı aktarılabilir, kayıt her değişiklikte kendiliğinden yapılır,
ve program kullanıcının girdiği bir şeyi sessizce silmez: sonradan kapatılan bir
saatteki ders yerinde kalır ve işaretlenir. Bir dönemin programı saatlerce emektir
ve kaybedildiğini söyleyen hiçbir mesaj onu geri getirmez. localStorage
silinebildiği için karşı önlemler katmanlı: otomatik kayıt, oturum yedekleri,
seçilen klasöre günlük yedek ve dosyaya kaydet.

## Kullanılabilirlik

Program kolay kullanılabilir ve yenilikçi olmayı hedefliyor. Hedef kullanıcı zor
görüyor, bu yüzden boyut, kontrast ve odak görünürlüğü süs değil gereksinim
olarak ele alınıyor. Aynı sebeple ekrandaki yazı ve soru az tutulur: çok soru ve
okunacak çok yazı babanın kafasını karıştırıyor (babanın isteği, 2026-10-08,
[TODO.md](TODO.md) §0). Amaç babanın bugün kullandığı Roboders'in yerini almak,
ve bir aracın yerini ancak aynı işi daha rahat yapan bir araç alır.

## Görsel kalite

Program şık ve modern olmayı hedefliyor, ve tasarım kararları serbest: renk,
tipografi, düzen ve hareket bu belgeden izin almaz. Ne yapıldığı
[DESIGN.md](DESIGN.md) ve [LAYOUT.md](LAYOUT.md)'de anlatılır. Serbestliğin
kenarında işlevsel renk kanalı, erişilebilirlik ve kâğıt duruyor, çünkü onlar
zevk değil aracın çalışma biçimi.

## Hedef makine

Babanın makinesi eski ve zayıf: Windows 10, 4 GB RAM (muhtemelen DDR3), çok eski
bir işlemci ve anakart. Ekranı 27 inç, 1920×1080 (kullanıcı, 2026-10-08; Windows
sürümü ve ekran kesin). E2E'nin varsayılan penceresi zaten bu boy
(`playwright.config.ts`). Windows'un ekran ölçeği (%100 mü, %125 mi) bilinmiyor
([TODO.md](TODO.md) §8b); %125'te sayfa 1536 CSS pikselde koşar ve Sığdır'ın bilinen
kırpılması orada. Makinenin ne olduğu artık biliniyor, programın orada ne
kadar yavaş olduğu bilinmiyor: geliştirme makinesinde açılış ve etkileşim süreleri
ölçülüp [WORKLOG.md](WORKLOG.md)'ye yazılıyor, babanın makinesinde henüz ölçülmedi.
Ölçülmemiş bir "yavaş" her kararı haklı çıkarabilir, ölçülmüş bir sayı yalnız
gerçekten pahalı olanı gösterir.

## Özellikler nereden gelir

Babanın bugün kullandığı program Roboders, ve Mozaik onun yerine geçmeyi
hedefliyor (kullanıcı, 2026-10-08). Öncelik üç kaynaktan gelir: babanın ve
kullanıcının bugün söyledikleri, asıl rakibin incelemesi
[ROBODERS.md](ROBODERS.md), ve aSc Timetables'ın okunabilir kaydı
[ASC.md](ASC.md) (528 yardım konusu, 2940 arayüz metni). Hedef, Roboders'teki ve
aSc'deki her iyi özelliğin daha iyisini yapmak, kopyasını değil. Bir özelliğin iyi
sayılma şartı, babaya yeni yazı ya da soru eklemeden iş görmesi (kullanıcı,
2026-10-08), çünkü çok yazı ve soru babanın kafasını karıştırıyor
("Kullanılabilirlik"). Üç kaynak da yoksa yazılan şey bir tahmindir, ve kural
"bekle" değil "nereden geldiğini söyle".

Bir özellik "baba istemedi" diye reddedilmiyor. Reddetmenin iki yolu var: bu
belgedeki bir gerçeği bozuyor olması (kurulmadan açılmak, kaybolmayan veri,
okunurluk, eski makinede çalışmak), ya da ölçülmemiş olması.

## Nasıl çalışılır

Bir şey belirsizse sorulur, tahmin edilmez: yanlış varsayımla yazılan kod,
yazılmamış koddan pahalıdır. Bir sürümün çıkma şartı sağlanmadan sonrakine
geçilmiyor (kayıtlı, gerekçesi yazılmamış). Test edilmemiş bir şey bitti sayılmıyor, ve
kod yazılmış ama tarayıcıda doğrulanmamışsa bu açıkça yazılıyor, çünkü bitti işareti
bir sonraki oturumun o işe bir daha bakmamasına yol açıyor (öneri, doğrulanmadı).
Hangi testin koşulup hangisinin koşulmadığı [TESTPLAN.md](TESTPLAN.md)'deki kadansla
birlikte WORKLOG'a yazılır.

## Şu an yapılmıyor ve sebebi

Bu işler şu an yapılmıyor. Her satırın sonunda gerekçenin kaynağı yazılı:
**(kayıtlı)** eski belgede yazılı olan gerekçe, **(öneri, doğrulanmadı)** eski
belgede gerekçesi yazılmamış bir madde için sonradan önerilen gerekçe.

- **Mobil uygulama.** Teslim yolları masaüstü tarayıcı ve Windows, ve hedef ekran babanın 27 inçlik monitörü. (öneri, doğrulanmadı)
- **Yoklama.** Bu bir ders programı aracı, kurs yönetim sistemi değil. (öneri, doğrulanmadı)
- **Not girişi.** Bu bir ders programı aracı, kurs yönetim sistemi değil. (öneri, doğrulanmadı)
- **Öğrenci kaydı.** Veri modelinde öğrenci yok, sınıf kapalı bir küme olarak duruyor, ve bu bir kurs yönetim sisteminin işi. (öneri, doğrulanmadı)
- **Sürükleyerek ders süresi uzatma.** Bir dersin blok şekli dağılım seçiciyle belirleniyor, sürüklemenin işi taşımak. (öneri, doğrulanmadı)
- **Geri alma geçmişi ağacı.** Düz bir geri al yığını yeterli. (kayıtlı)

2026-08-30'da bu listeden üç madde çıktı: istatistik ve pano, SMS ve e-posta,
aynı planın sürüm ağacı. 2026-10-08'de dört madde daha çıktı: kullanıcı
hesapları, veriyi bir servise yükleyen paylaşım (aSc'nin EduPage'e yükleyen
Sharing'i), bulut senkronizasyonu ve takvim entegrasyonu. Dördünün de tek
gerekçesi aşağıdaki iki ilkeydi. Listeden çıkmak yapılacak olmak demek değil,
hepsi artık istenirse ölçülüp karar verilebilecek işler.

## Artık geçerli olmayanlar

Aşağıdaki iki ilke babanın projenin başındaki tercihine dayanıyordu ve
2026-10-08'den beri bağlayıcı değil ([DECISIONS.md](DECISIONS.md)). Metinleri o
günkü hâliyle duruyor, eski kayıtlarda geçtiklerinde ne dedikleri okunabilsin diye.
Kod bugün hâlâ ikisine de uyuyor, ama bir özellik onları bozuyor diye reddedilmez.

### Sunucusuz — artık geçerli değil

> Programın backend'i, veritabanı, hesabı, oturumu ve API'si yok. Yayınlanan şeyler
> statik dosyalar: GitHub Pages'teki site, babanın makinesindeki küçük yerel dosya
> sunucusu ve Release varlıkları. Bir sunucu bakım ister, kapanabilir ve veriyi
> makineden çıkarır. Çıktıyı e-postayla ya da WhatsApp'la paylaşmak bu ilkeyle
> çelişmiyor, çünkü paylaşılan şey bir dosya ve onu taşıyan işletim sisteminin
> kendi paylaşım yolu.

Bugün ne demek: ağa çıkan ya da bir servise bağlanan bir özellik (öğretmenlere
e-posta, Eyotek'e gönderme, [TODO.md](TODO.md) B3.8) bir ilke sorunu değil. Onun
soruları tasarımın ve KVKK'nın soruları: veri nereye gidiyor, kim saklıyor, bakımı
kimde.

### Çevrimdışı — artık geçerli değil

> Program çalışırken ağdan tek bayt çekmez: font ve simgeler dosyanın içine
> gömülüdür. Ağa yalnız kullanıcı bir düğmeye bastığında çıkılır (güncellemeyi
> denetlemek, indirmek, paylaşmak). Hedef makinede internet olup olmadığı
> bilinmiyor ve programın açılması buna bağlı olmamalı.

Gerçeğe dayanan yarısı, yani hedef makinede internet olup olmadığının bilinmemesi,
"Çift tıkla çalışır"ın altına "Açılış ağa bağlı değil" olarak taşındı.
