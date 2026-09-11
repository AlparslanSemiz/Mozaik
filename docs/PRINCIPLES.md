# İlkeler

Projenin bugünkü duruşu, her ilkenin neyi koruduğu ve şu an yapılmayan işlerin sebebi.

## Bu belge nasıl okunur

Buradaki ilkeler bugünkü duruşu anlatır, tartışmaya kapalı bir liste değildir.
Her ilkenin yanında neyi koruduğu yazılı, çünkü değiştirilebilir bir kuralın tek
savunması gerekçesidir. Bir özelliği reddetmenin yolu "yasak" demek değil,
gerekçeyi okuyup hâlâ geçerli olup olmadığını sormaktır. Gerekçe artık geçerli
değilse duruş değişir ve değişiklik tarihiyle [DECISIONS.md](DECISIONS.md)'ye
yazılır.

Gerekçenin kendisi de ölçülür. Bu projede ölçülmeden yazılmış iki iddia bütün bir
turun iş planına dönüştü ([TRAPS.md](TRAPS.md), tuzak 65 ve 101), o yüzden
ölçülmemiş bir iddia bir gerekçe sayılmıyor.

İlkeler numarasız. Eski kayıtlarda ve kod yorumlarında geçen "ilke N"
numaralarının hangi ilkeye karşılık geldiği DECISIONS.md'de yazılı.

## Çift tıkla çalışır

Program indirilip çift tıklanınca açılır ve hesap ya da şifre sormaz. Kurulum bir
seçenek olarak var (Windows kurulum paketi ve exe), ama kurulmadan çalışan bir yol
hep bırakılıyor: `dist/index.html` çift tıklanır. Kurulamayan bir makinede program
açılmıyorsa bu ilkeden geriye bir şey kalmaz. Güncelleme de aynı çizgide durur:
program yeni bir sürümün geldiğini söyler, kullanıcı istemeden hiçbir şey
değişmez.

## Sunucusuz

Programın backend'i, veritabanı, hesabı, oturumu ve API'si yok. Yayınlanan şeyler
statik dosyalar: GitHub Pages'teki site, babanın makinesindeki küçük yerel dosya
sunucusu ve Release varlıkları. Bir sunucu bakım ister, kapanabilir ve veriyi
makineden çıkarır. Çıktıyı e-postayla ya da WhatsApp'la paylaşmak bu ilkeyle
çelişmiyor, çünkü paylaşılan şey bir dosya ve onu taşıyan işletim sisteminin
kendi paylaşım yolu.

## Çevrimdışı

Program çalışırken ağdan tek bayt çekmez: font ve simgeler dosyanın içine
gömülüdür. Ağa yalnız kullanıcı bir düğmeye bastığında çıkılır (güncellemeyi
denetlemek, indirmek, paylaşmak). Hedef makinede internet olup olmadığı
bilinmiyor ve programın açılması buna bağlı olmamalı. Bu, `vite-plugin-singlefile`,
`e2e/temel.spec.ts`, `e2e/site.spec.ts` ve `e2e/kapan.ts` ile mekanik olarak
ölçülüyor.

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
olarak ele alınıyor. Amaç aSc Timetables'ın yerini almak, ve bir aracın yerini
ancak aynı işi daha rahat yapan bir araç alır.

## Görsel kalite

Program şık ve modern olmayı hedefliyor, ve tasarım kararları serbest: renk,
tipografi, düzen ve hareket bu belgeden izin almaz. Ne yapıldığı
[DESIGN.md](DESIGN.md) ve [LAYOUT.md](LAYOUT.md)'de anlatılır. Serbestliğin
kenarında işlevsel renk kanalı, erişilebilirlik ve kâğıt duruyor, çünkü onlar
zevk değil aracın çalışma biçimi.

## Hedef makine

Hedef makinenin yavaş olduğu bir varsayım olarak duruyor, gerekçe olarak değil.
Geliştirme makinesinde açılış ve etkileşim süreleri ölçülüp
[WORKLOG.md](WORKLOG.md)'ye yazılıyor, babanın makinesinde henüz ölçülmedi.
Ölçülmemiş bir "yavaş" her kararı haklı çıkarabilir, ölçülmüş bir sayı yalnız
gerçekten pahalı olanı gösterir.

## Özellikler nereden gelir

Hedef, aSc Timetables'ın bu kursla ilgili kısmının yarısını yapmak ve o yarıyı
aSc'den iyi yapmak. Öncelik iki kaynaktan gelir: babanın geri dönüşü ve
[ASC.md](ASC.md), yani rakibin gerçekten yaptığı işin okunabilir kaydı (528
yardım konusu, 2940 arayüz metni). İkisi de yoksa yazılan şey bir tahmindir, ve
kural "bekle" değil "nereden geldiğini söyle".

Bir özellik "baba istemedi" diye reddedilmiyor. Reddetmenin iki yolu var: çift
tıkla çalışır, sunucusuz ve çevrimdışı ilkelerinden birini bozuyor olması, ya da
ölçülmemiş olması.

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

- **Kullanıcı hesapları.** Program hesap ve şifre sormuyor, ve bir hesap bir sunucu ile oturum ister. (kayıtlı)
- **Veriyi bir servise yükleyen paylaşım** (aSc'nin EduPage'e yükleyip öğretmene ve veliye hesap açan Sharing'i). Veri makineden çıkıp başkasının sunucusunda durur. (kayıtlı)
- **Bulut senkronizasyonu.** Veriyi bir sunucuya taşır, sunucusuz ilkesiyle çelişir. (öneri, doğrulanmadı)
- **Mobil uygulama.** Teslim yolları masaüstü tarayıcı ve Windows, ve hedef ekran babanın 27 inçlik monitörü. (öneri, doğrulanmadı)
- **Yoklama.** Bu bir ders programı aracı, kurs yönetim sistemi değil. (öneri, doğrulanmadı)
- **Not girişi.** Bu bir ders programı aracı, kurs yönetim sistemi değil. (öneri, doğrulanmadı)
- **Öğrenci kaydı.** Veri modelinde öğrenci yok, sınıf kapalı bir küme olarak duruyor, ve bu bir kurs yönetim sisteminin işi. (öneri, doğrulanmadı)
- **Takvim entegrasyonu.** Bir takvim servisine bağlanmak hesap ve ağ ister, sunucusuz ve çevrimdışı ilkeleriyle çelişir. (öneri, doğrulanmadı)
- **Sürükleyerek ders süresi uzatma.** Bir dersin blok şekli dağılım seçiciyle belirleniyor, sürüklemenin işi taşımak. (öneri, doğrulanmadı)
- **Geri alma geçmişi ağacı.** Düz bir geri al yığını yeterli. (kayıtlı)

2026-08-30'da bu listeden üç madde çıktı: istatistik ve pano, SMS ve e-posta,
aynı planın sürüm ağacı. Listeden çıkmak yapılacak olmak demek değil, üçü de
artık ölçülüp karar verilebilecek işler.
