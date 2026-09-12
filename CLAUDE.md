# Mozaik

Babamın dershanesinde haftalık ders programını dizmek için yazılan araç, aSc
Timetables'ın yerine geçiyor. Hedef, aSc'nin bu kursla ilgili kısmının yarısını
yapmak ve o yarıyı aSc'den iyi yapmak. Program çift tıklanan tek bir HTML dosyası,
ve aynı dosya bir sitede, Windows kurulum paketinde ve bir exe'nin içinde de
teslim ediliyor. Vite, React ve TypeScript ile yazıldı, sunucusu yok ve çalışırken
internete ihtiyaç duymuyor.

## Yeni bir oturuma başlarken

Önce bu iki dosya okunur:

1. [docs/TODO.md](docs/TODO.md), sıradaki iş ve kullanıcının not defteri için.
2. [docs/PRINCIPLES.md](docs/PRINCIPLES.md), bir kararı neyin yönlendirdiği için.

Nerede kalındığı [docs/WORKLOG.md](docs/WORKLOG.md)'nin en üstündeki "Şu an"
bloğunda yazılı.

## Nereye bakılır

- [docs/PRINCIPLES.md](docs/PRINCIPLES.md): Projenin bugünkü duruşu, her ilkenin neyi koruduğu ve şu an yapılmayan işlerin sebebi.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Kodun katmanları, her dosyanın görevi ve katmanlar arasındaki sınırlar.
- [docs/DATA.md](docs/DATA.md): Kaydedilen verinin şekli, şema göçü, depolama anahtarları, dosya biçimleri ve kısıt kuralları.
- [docs/BUILD.md](docs/BUILD.md): Teknoloji yığını, komutlar, dört teslim yolu, sürüm numarası ve güncellemenin işleyişi.
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): Kodun, commit'lerin, yorumların, arayüz metninin ve belgelerin nasıl yazıldığı, ve çeviri sözlüğünün nasıl işlediği.
- [docs/LAYOUT.md](docs/LAYOUT.md): Ekranda ne olduğu ve nereye konduğu: sekmeler, kabuk, şerit, ızgara, havuz, menüler ve diyaloglar.
- [docs/DESIGN.md](docs/DESIGN.md): Arayüzün neye benzediği: renk, tipografi, hareket, tokenlar ve primitif envanteri.
- [docs/TESTPLAN.md](docs/TESTPLAN.md): Hangi test katmanının neyi ölçtüğü ve ne zaman koşulduğu.
- [docs/TESTFINDINGS.md](docs/TESTFINDINGS.md): Test koşularından çıkan bulgular, tarihleri ve neye dönüştükleri.
- [docs/TRAPS.md](docs/TRAPS.md): Bu projede yaşanmış tuzaklar, temaya göre gruplanmış ve her grubun başında kuralıyla.
- [docs/DECISIONS.md](docs/DECISIONS.md): Duruşun ne zaman, neden ve neyden değiştiği, ve denenip bırakılan yolların tarihli kaydı.
- [docs/WORKLOG.md](docs/WORKLOG.md): Projenin şu anki durumu ve oturum oturum çalışma kaydı.
- [docs/TODO.md](docs/TODO.md): açık işler, karar bekleyen sorular, kullanıcının not defteri ve biten turların arşivi.
- [docs/ROADMAP.md](docs/ROADMAP.md): Sıradaki sürümler, her birinin çıkma şartı ve hâlâ cevabı beklenen sorular.
- [docs/ASC.md](docs/ASC.md): rakip aSc Timetables'ın bölümleri, hangisinin alındığı, hangisinin bilerek alınmadığı ve hangisinin sırada olduğu.
- [docs/ROBODERS.md](docs/ROBODERS.md): ikinci rakip Roboders'in incelemesi.
- [CHANGELOG.md](CHANGELOG.md): dışarı bakan, İngilizce sürüm geçmişi.
- [docs/plan-v0-arsiv.md](docs/plan-v0-arsiv.md): tarihsel, güncellenmiyor. Projenin ilk teknik planı, donmuş bir tarihsel kayıt olarak.

## Oturum sonu

- TODO.md güncellenir, biten işler işaretlenir, sıradaki iş yazılır.
- WORKLOG.md'nin "Şu an" bloğu tazelenir, altına tarihli girdi eklenir, hangi testlerin koşulduğu ve koşulmadığı yazılır.
- Test koşuldu ve bir şey çıktıysa TESTFINDINGS.md'ye yazılır.
- Kalıcı bir kural veya tuzak çıktıysa ilgili docs dosyasına yazılır.
- Bir duruş değiştiyse ya da bir yol denenip bırakıldıysa DECISIONS.md'ye tarihiyle yazılır.
- Kullanıcıya görünen bir değişiklik olduysa CHANGELOG'un Unreleased bloğuna satır eklenir.
- Test edilmemiş bir şey bitti işaretlenmez.
- Bir belge kapısı (`src/docs.test.ts`) kırmızıysa bayatlayan belgedir, kapı değil. Kapı susturulmaz, atlanmaz, gevşetilmez; belgedeki cümle düzeltilir. Kapının kendisi yanlış ölçüyorsa bu iddia edilmez, mutasyonla kanıtlanır: kapıyı geçen bozuk bir belge gösterilir, sonra kapı değişir.
- Bir kod değişikliği bir belge cümlesini yanlış hâle getiriyorsa o cümle **aynı commit'te** düzeltilir. Sonraki commit'e bırakılan belge düzeltmesi yapılmaz; bölme turunda bulunan on yedi bayat maddenin hepsi "sonra düzeltirim" ile birikti.
