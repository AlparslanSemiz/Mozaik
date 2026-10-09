# Mozaik

Babamın dershanesinde haftalık ders programını dizmek için yazılan araç. Babam
bugün Roboders kullanıyor ve Mozaik onun yerine geçmeyi hedefliyor. Hedef,
Roboders'teki ve ikinci kaynak aSc Timetables'taki her iyi özelliğin daha iyisini
yapmak. Bir özellik babama yeni yazı ya da soru eklemeden iş görüyorsa iyi
sayılır. Program çift tıklanan tek
bir HTML dosyası, ve aynı dosya bir sitede, Windows kurulum paketinde ve bir exe'nin
içinde de teslim ediliyor. Vite, React ve TypeScript ile yazıldı. Bugün sunucusu yok
ve çalışırken internete ihtiyaç duymuyor. Bunu şart koşan iki ilke 2026-10-08'den
beri bağlayıcı değil ([docs/PRINCIPLES.md](docs/PRINCIPLES.md)).

## Yeni bir oturuma başlarken

Önce bunlar okunur:

1. [docs/TODO.md](docs/TODO.md)'nin yalnız §0'ı (not defteri) ve İÇİNDEKİLER'i, sonra
   yalnız yapılacak işin bölümü. Dosyanın tamamı okunmaz.
2. [docs/PRINCIPLES.md](docs/PRINCIPLES.md), bir kararı neyin yönlendirdiği için.

Tuzaklar bir işe başlarken okunur, tamamı değil: önce [docs/TRAPS.md](docs/TRAPS.md)'nin
başındaki grup listesi, sonra yalnız o işin grubu.

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
- [docs/DENETIM.md](docs/DENETIM.md): Mozaik'in özellik özellik denetimi: ne iyi, ne kötü, ne kırık ve ne daha iyi olur.
- [docs/TRAPS.md](docs/TRAPS.md): Bu projede yaşanmış tuzaklar, temaya göre gruplanmış ve her grubun başında kuralıyla.
- [docs/DECISIONS.md](docs/DECISIONS.md): Duruşun ne zaman, neden ve neyden değiştiği, ve denenip bırakılan yolların tarihli kaydı.
- [docs/WORKLOG.md](docs/WORKLOG.md): Projenin şu anki durumu ve oturum oturum çalışma kaydı.
- [docs/TODO.md](docs/TODO.md): açık işler, karar bekleyen sorular ve kullanıcının not defteri.
- [docs/TODO-ARCHIVE.md](docs/TODO-ARCHIVE.md): TODO.md'den taşınan biten maddeler, ham notlar ve biten turlar, o günkü hâlleriyle. Oturum başında okunmaz.
- [docs/ROADMAP.md](docs/ROADMAP.md): Sıradaki sürümler, her birinin çıkma şartı ve hâlâ cevabı beklenen sorular.
- [docs/ROBODERS.md](docs/ROBODERS.md): asıl rakip Roboders'in, yani babanın bugün kullandığı programın incelemesi.
- [docs/ASC.md](docs/ASC.md): ikinci kaynak aSc Timetables'ın bölümleri, hangisinin alındığı, hangisinin bilerek alınmadığı ve hangisinin sırada olduğu.
- [CHANGELOG.md](CHANGELOG.md): dışarı bakan, İngilizce sürüm geçmişi.
- [docs/plan-v0-arsiv.md](docs/plan-v0-arsiv.md): tarihsel, güncellenmiyor. Projenin ilk teknik planı, donmuş bir tarihsel kayıt olarak.

## Paralel oturumlar

Kalıcı cevaplar, gerekçeleri [docs/DECISIONS.md](docs/DECISIONS.md)'de (2026-10-09):

- Paralel çalışan her iş alanı (özellik, refactor, belge-test-araç ya da başka bir şey)
  kendi worktree'sinde ve dalında çalışır. Sayı o anki işe göre değişir, iş bitince
  worktree kaldırılabilir. `~/GitHub/Mozaik` yalnız `main`'i tutar, orada oturum çalışmaz.
- Dal kısa ömürlü, iş `main`'den açılan bir dalda yürür. Her commit'ten ve her ölçümden
  önce `main`'e bakılır, ilerlediyse `git merge main` ile alınır, rebase yapılmaz.
- Push SSH ile ve açık refspec'le, yalnız kendi dalı: `git push origin <dal>`. Zorla push,
  etiket ve `main`'e push yok. `ci.yml` her push'ta koşar, sonucu beklenmez, `gh run view`
  ile okunur. Dalın CI'ı kırmızıysa başka işe geçmeden o düzeltilir.
- Dal `main`'e Alp'in onayıyla ve `--ff-only` ile birleşir: önce `git merge main`, sonra
  yerelde `npm run hizli` yeşil, dalın CI'ı yeşil; tam doğrulama CI'da, yerelde `kontrol`
  şart değil. Site yalnız yeşil bir `main` push'unda yayınlanır, `windows.yml` her `main`
  push'unda Windows'ta E2E koşar.
- "Şu an"ı dal, `git merge main`'den sonra ve birleşmeden hemen önce son commit'inde kendi
  işiyle günceller. `--ff-only` araya başka bir şeyin girmesine izin vermediği için çatışma
  çıkmaz. Ara durumlar tarihli WORKLOG girdisine yazılır. Tuzak numarası da o commit'te
  verilir, öncesinde aday girdiye yazılır. Önce birleşen numarayı alır, numara vermiş bir dal
  birleşirken kendi numaralarını kaydırır.
- Belgelere yalnız `main`'deki commit hash'i yazılır, dalın commit'leri konusuyla anılır.
- Taşıma ile içerik değişikliği ayrı commit'lerdedir, biçim düzeltmesi de ayrı commit'tedir.
- Ağır komutlar sırayla koşar: `scripts/agir.sh <komut>`, yani
  `flock -w 1800 ~/.mozaik-agir.lock`. Kapsam: stryker, mutasyon, kontrol, kapsam, her
  Playwright koşusu, exe derlemeleri, podman ve süre ölçümleri. Kilit beklenen sürede
  alınamazsa söylenir. Not `~/.mozaik-agir.not`'ta, bırakılınca "serbest" yazar.
- Uzun komutlar (`kontrol`, E2E, mutasyon, CI'ı izlemek) arka planda koşulur ve bitiş bildirimi beklenir, `sleep` ve `tail` ile yoklanmaz.
- Süre ölçümü temiz koşul ister: makine prizde, güç profili `performance`, 1 dakikalık yük
  2'nin altında, `scripts/temiz-kosul.sh` bakar. Koşul yoksa "kirli, ölçülmedi" yazılır.
- Elle ya da toplu her mutasyon kanıtı `scripts/mutasyon-kaniti.sh` ile yapılır (toplu: `--liste`), kendi betiğini yazmak yok: kontrol koşusu ve koşmayan testin ayrımı orada.
- Arka planda bir mutasyon sürerken ağaca dokunulmaz, `git stash` dahil.
- Commit'ten önce `npm run hizli` ve dokunulan test dosyaları. Uzun testler (mutasyon, Windows E2E, WebKit) hiçbir şeyi bekletmez, arkada koşar. `hizli`'nin neyi görmediği [docs/TESTPLAN.md](docs/TESTPLAN.md)'de.
- Etiketi yalnız `npm run yayinla` atar, `ci.yml` ve `windows.yml` yeşil olmadan atmaz
  (`-- --kuru` hiçbir şeyi değiştirmeden bakar).

## Ne zaman durulur

Durulur ve sorulur, yalnız şunlarda:
- veri riski (bir refactor turunda bulunan veri kaybettiren bir hata dahil),
- dokunulmaz bir şeye dokunmak gerekiyor,
- kapsam dışına çıkmak gerekiyor: listede olmayan bir değişiklik, ya da "davranış
  değişmez" dalında üretim kodunu değiştiren bir test veya düzeltme,
- bir ölçüm planın varsayımını çürüttü,
- `dist`'e yeni bir paket girecek,
- `main`'e birleştirme, `main`'e ya da etikete push, `npm run yayinla`,
- CI kırmızı ve sebep bu işin kapsamı dışında.

Gerisinde yukarıdaki kurala göre devam edilir: commit, `git merge main`, kendi dalını
itmek, hangi testin koşacağı, hash mi konu mu, kilit, tuzak ve kusur notları, belge
cümlesini aynı commit'te düzeltmek, scratch'e yazmak. İki makul ve risksiz seçenek
arasında öncelik sırasıyla (babaya ve verisine risk yok, sağlamlık, basitlik, ileriye
dönüklük, hız) biri seçilir ve raporda tek cümleyle yazılır. Engellemeyen sorular biriktirilir.

## Rapor

Sonda tek rapor, altı ila sekiz satır: (1) bitti: commit konuları ve doğrulamaları,
(2) durdum çünkü: yalnız yukarıdaki listeden bir sebep, ya da "durmadım", (3) karar
gerekiyor: her soru seçenekleri ve öneriyle, "evet" ya da bir harfle cevaplanabilir,
(4) not edilenler, (5) koşulan ve koşulmayan komutlar, çıkış kodlarıyla, ve `git status`.
Uzun tablolar `scratch/`'te bir rapor dosyasına yazılır, mesaj ona işaret eder.

## Oturum sonu

- TODO.md güncellenir, biten işler işaretlenir, sıradaki iş yazılır.
- WORKLOG.md'ye tarihli girdi eklenir, hangi testlerin koşulduğu ve koşulmadığı yazılır. "Şu an" birleşmeden önceki son commit'te tazelenir ("Paralel oturumlar").
- Test koşuldu ve bir şey çıktıysa TESTFINDINGS.md'ye yazılır.
- Kalıcı bir kural veya tuzak çıktıysa ilgili docs dosyasına yazılır.
- Bir duruş değiştiyse ya da bir yol denenip bırakıldıysa DECISIONS.md'ye tarihiyle yazılır.
- Kullanıcıya görünen bir değişiklik olduysa CHANGELOG'un Unreleased bloğuna satır eklenir.
- Test edilmemiş bir şey bitti işaretlenmez.
- Bir belge kapısı (`src/docs.test.ts`) kırmızıysa bayatlayan belgedir, kapı değil. Kapı susturulmaz, atlanmaz, gevşetilmez; belgedeki cümle düzeltilir. Kapının kendisi yanlış ölçüyorsa bu iddia edilmez, mutasyonla kanıtlanır: kapıyı geçen bozuk bir belge gösterilir, sonra kapı değişir.
- Bir kod değişikliği bir belge cümlesini yanlış hâle getiriyorsa o cümle **aynı commit'te** düzeltilir. Sonraki commit'e bırakılan belge düzeltmesi yapılmaz; bölme turunda bulunan on yedi bayat maddenin hepsi "sonra düzeltirim" ile birikti.
