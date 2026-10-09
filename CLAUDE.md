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

Önce bu iki dosya okunur:

1. [docs/TODO.md](docs/TODO.md), sıradaki iş ve kullanıcının not defteri için.
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
- [docs/TODO-ARCHIVE.md](docs/TODO-ARCHIVE.md): TODO.md'den taşınan biten turlar, tarih sırasıyla, o günkü hâlleriyle. Oturum başında okunmaz.
- [docs/ROADMAP.md](docs/ROADMAP.md): Sıradaki sürümler, her birinin çıkma şartı ve hâlâ cevabı beklenen sorular.
- [docs/ROBODERS.md](docs/ROBODERS.md): asıl rakip Roboders'in, yani babanın bugün kullandığı programın incelemesi.
- [docs/ASC.md](docs/ASC.md): ikinci kaynak aSc Timetables'ın bölümleri, hangisinin alındığı, hangisinin bilerek alınmadığı ve hangisinin sırada olduğu.
- [CHANGELOG.md](CHANGELOG.md): dışarı bakan, İngilizce sürüm geçmişi.
- [docs/plan-v0-arsiv.md](docs/plan-v0-arsiv.md): tarihsel, güncellenmiyor. Projenin ilk teknik planı, donmuş bir tarihsel kayıt olarak.

## Push ve CI

- İş `main`'e itilir. `ci.yml` her push'ta koşar, site yalnız yeşil bir `main`
  push'unda yayınlanır. Push'tan sonra sıradaki işe geçilir, sonuç `gh run view` ile
  okunur. `main` kırmızıysa başka işe geçmeden önce o düzeltilir.
- `windows.yml` her `main` push'unda Windows'ta E2E koşar; siteyi kilitlemez.
- Etiketi yalnız `npm run yayinla` atar, o da commit'in `ci.yml` ve `windows.yml`
  koşuları yeşil olmadan atmaz. `npm run yayinla -- --kuru` aynı beklemeyi hiçbir şeyi
  değiştirmeden yapar.

## Paralel oturumlar

- `main`'de başka bir oturum çalışabilir. WORKLOG'un "Şu an" bloğu main'deki oturumundur:
  bir dal oturumu durumunu TODO §8k'ye ve tarihli girdilere yazar, oturum sonu listesinin
  "Şu an" maddesini uygulamaz.
- Her commit'ten ve her ölçümden önce `main`'e bakılır. İlerlediyse dala `git merge main`
  ile alınır, rebase yapılmaz. Dal `main`'e Alp'in onayıyla ve `--ff-only` ile birleşir;
  ondan önce `main` dala alınır, `npm run kontrol` kilit altında koşar ve CI yeşildir.
- Dal oturumu yalnız kendi dalını açık refspec'le iter (`git push origin <dal>`); zorla
  push ve etiket yok.
- Ağır komutlar sırayla koşar: `scripts/agir.sh <komut>`, yani
  `flock -w 1800 ~/.mozaik-agir.lock`. Kapsam: stryker, mutasyon, kontrol, kapsam, her
  Playwright koşusu, exe derlemeleri, podman ve süre ölçümleri. Kilit `-w`'nin beklediği
  süre içinde alınamazsa daha fazla beklenmez, söylenir. Kilidi alan, yanındaki
  `~/.mozaik-agir.not` dosyasına oturumu, komutu ve zamanı yazar; bırakırken üzerine
  "serbest" yazar, silmez.
- Süre ölçümü temiz koşul ister: makine prizde, güç profili `performance`, 1 dakikalık yük
  2'nin altında; `scripts/temiz-kosul.sh` bakar. Koşul yoksa ölçülmez, "kirli, ölçülmedi"
  yazılır.
- Elle mutasyon kanıtı `scripts/mutasyon-kaniti.sh` ile yapılır: uygulanmayan ya da dist'e
  girmeyen bir değişiklik testi koşmadan durur, dosya her durumda geri konur.
- Belgelere yalnız `main`'deki commit hash'i yazılır; dalın commit'leri konusuyla anılır.
  Dal oturumu TRAPS'a numara vermez, tuzak adayını TODO §8k'ye yazar.

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
