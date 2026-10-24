# Mozaik

Babamın dershanesinde haftalık ders programını dizmek için yazılan araç. Babam bugün
Roboders kullanıyor ve Mozaik onun yerine geçmeyi hedefliyor: Roboders'teki ve ikinci
kaynak aSc Timetables'taki her iyi özelliğin daha iyisi. Bir özellik babama yeni yazı ya da
soru eklemeden iş görüyorsa iyi sayılır. Program çift tıklanan tek bir HTML dosyası, aynı
dosya bir sitede, Windows kurulum paketinde ve bir exe'nin içinde de teslim ediliyor. Vite,
React ve TypeScript ile yazıldı. Bugün sunucusu yok ve internete ihtiyaç duymuyor, ama ikisi de
bir ilke değil ([docs/PRINCIPLES.md](docs/PRINCIPLES.md), "Ağ ve servisler").

## Oturum başında

1. [docs/TODO.md](docs/TODO.md)'nin yalnız §0'ı ve İÇİNDEKİLER'i, sonra yalnız yapılacak işin bölümü.
2. [docs/PRINCIPLES.md](docs/PRINCIPLES.md), bir kararı neyin yönlendirdiği için.
3. [docs/WORKLOG.md](docs/WORKLOG.md)'nin "Şu an" bloğu, nerede kalındığı için.

Tuzaklar işe başlarken okunur: [docs/TRAPS.md](docs/TRAPS.md)'nin başındaki grup listesi, sonra yalnız o işin grubu.

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

## Çalışma düzeni

- Tek kalıcı checkout, `~/GitHub/Mozaikler/Mozaik`, sürekli worktree yok. Her iş `main`'den açılan kısa ömürlü bir dalda yürür. Checkout aynı anda tek dalda durduğu için orada aynı anda tek oturum yazar; paralel çalışan her oturum ya da ajan geçici bir worktree alır (`git worktree add ~/GitHub/Mozaikler/Mozaik-<iş> -b <dal> main`), dalı birleşince worktree kaldırılır (`git worktree remove`). Yeni refactor turu açılmıyor (DECISIONS 2026-10-23).
- Bir TODO maddesine başlamadan önce `git worktree list`'e ve dal adlarına (`git branch -a`) bakılır; o madde için bir dal varsa madde alınmıştır: başlanmaz, raporda söylenir.
- Commit'ten önce `main`'e bakılır, ilerlediyse `git merge main` ile alınır, rebase yok. Taşıma, içerik ve biçim değişikliği ayrı commit'lerde.
- Push SSH ile ve yalnız kendi dalı: `git push origin <dal>`. Zorla push, etiket ve `main`'e push yok. CI'ın sonucu beklenmez, `gh run view` ile okunur, dalın CI'ı kırmızıysa önce o düzeltilir.
- Hazır diye bildirilen dallar her zaman birleşme sırasıyla tek bir doğrusal zincir kurar: her dal bir öncekinin ucunu içerir (`git merge <önceki>`), kullanıcı bir döngüde sırayla `--ff-only` ile alır. Raporda zincirin sırası ve her dalın ucu yazılır.
- Birleştirmeyi Alp yapar ya da onaylar, `--ff-only` ile: önce `git merge main`, yerelde `npm run hizli` yeşil, dalın CI'ı yeşil. "Şu an" ve tuzak numarası dalın birleşmeden önceki son commit'inde yazılır, önce birleşen numarayı alır. Belgelere yalnız `main`'deki commit hash'i yazılır.

## Ağır komutlar

Stryker, `kontrol`, kapsam, her Playwright koşusu, exe derlemesi, podman ve süre ölçümü sırayla koşar: `scripts/agir.sh <komut>` (`flock -w 1800 ~/.mozaik-agir.lock`, not `~/.mozaik-agir.not`'ta). Süre sınırı `scripts/agir.sh --sure <saniye> <komut>` ile verilir, dışarıdan `timeout` sarılmaz (tuzak 150). Uzun komutlar arka planda koşar ve bitiş bildirimi beklenir. Süre ölçümü temiz koşul ister (`scripts/temiz-kosul.sh`), yoksa "kirli, ölçülmedi" yazılır. Arka planda mutasyon sürerken ağaca dokunulmaz, `git stash` dahil.

## Test

Riske göre, ayrıntısı [docs/TESTPLAN.md](docs/TESTPLAN.md)'nin "Test politikası"nda.

- Test şart olan yerler: şema, göç, `sanitize` ve yedeğin açılması, dizme (çözücü), güncelleme ve sürüm yolu, ve düzeltilen her hata için bir gerileme testi. Şema değişince hem birim hem E2E testi ([docs/DATA.md](docs/DATA.md)).
- Arayüzün düzeni ve metni için yeni test yazılmaz, 1920×1080'de tek bir ekran görüntüsüyle bakılır.
- Commit'ten önce yerelde yalnız `npm run hizli` ve dokunulan test dosyaları. Gerisi CI'da.
- Mutasyon haftalık koşar (`haftalik.yml`), hiçbir şeyi beklemez, değişiklik başına koşulmaz. Elle bir mutasyon kanıtı yapılırsa `scripts/mutasyon-kaniti.sh` ile (tuzak 149).
- Bulunan hata aynı dalda, kendi commit'inde, gerileme testiyle düzeltilir. Refactor dalı düzeltmez, TODO §8k'ye yazar. Veri kaybı sınıfında bir hata: durulur ve bildirilir.
- Belge kapısı (`src/docs.test.ts`) yalnız yapıyı ölçer: bağlantı, yol, tuzak numarası, zorunlu bölüm. Kırmızıysa belge düzeltilir, kapı susturulmaz.

## Bitti kontrolü

Her kod değişikliğinden sonra, "bitti" demeden önce. Yalnız belge değişen dalda ikisi de yok. Ayrıntı [.claude/skills/paket-turu/SKILL.md](.claude/skills/paket-turu/SKILL.md)'nin "Bitti kontrolü"nde, her dal için geçerli.

- **İnceleme.** Taze bağlamlı bir alt ajan `git diff main...HEAD`'i doğruluk, veri riski (depo adları, şema, yedekler), sadelik ve bayatlayan belge cümlesi için okur, düzeltmez. Geçerli bulgular ayrı commit'lerde düzeltilir, reddedilenler tek cümlelik gerekçeyle raporda.
- **Tıklama testi**, değişiklik kullanıcıya görünüyorsa: derlenmiş `dist/index.html` `file://` ile Playwright Chromium'da 1920×1080'de, yalnız sahte veriyle (Alp'in Chrome'u, gerçek veri ve Roboders asla). Değişen akış ve komşu bir akış kullanıcı gibi tıklanır, her adımdan sonra ekran görüntüsüne bakılır, az gören biri için yazı boyu ve kontrast. Betik ve görüntüler `scratch/`'te kalır, commit'lenmez, yeni test süiti olmaz.
- Raporda "İnceleme ve tıklama testi" bölümü: bulgular (düzeldi, ya da düzelmedi ve neden), tıklama yolu, iki üç ekran görüntüsünün yolu.

## Ne zaman durulur

Yalnız beş durumda durulur ve sorulur: veri kaybı riski, Roboders'e ya da gerçek veriye yazmak, etiket ya da sürüm, geri alınamaz dış bir eylem, kullanıcının parası ya da hesapları.

Gerisinde öncelik sırasıyla (babaya ve verisine risk yok, sağlamlık, basitlik, ileriye dönüklük, hız) karar verilir ve raporda "Aldığım kararlar" altında tek cümleyle yazılır: kapsam dışı bir değişiklik, planı çürüten bir ölçüm, dışarıdan gelen bir CI kırmızısı, `dist`'e giren yeni bir paket. Yeni paket WORKLOG'a not düşer: neden, alternatifler, boyut ve `file://` açılış süresi.

Ham `dist/index.html` 1,2 MB'ı aşarsa boyut eşiği yükseltilmeden önce `file://` açılış süresi 4× yavaşlatılmış işlemcili bir profilde (Chromium, CPU throttling) ölçülür; sayılar WORKLOG'a.

## Sürüm

Etiketi yalnız `npm run yayinla` atar, ana klasörde ve `main`'de, ve `ci.yml` ile `windows.yml` yeşil olmadan atmaz (`-- --kuru` hiçbir şeyi değiştirmeden bakar). Windows'ta gerçek güncelleme testi (eski sürümden yenisine) yeşil olmadan etiket yok. Ayrıntı [docs/BUILD.md](docs/BUILD.md)'de.

## Rapor

Sonda tek rapor, altı ila sekiz satır: (1) bitti: commit konuları ve doğrulamaları, (2) durdum çünkü: yukarıdaki beşten biri ya da "durmadım", (3) aldığım kararlar, (4) karar gerekiyor: her soru seçenekleri ve öneriyle, "evet" ya da bir harfle cevaplanabilir, (5) not edilenler, (6) koşulan ve koşulmayan komutlar, çıkış kodlarıyla, ve `git status`, (7) kod değiştiyse "İnceleme ve tıklama testi" (yukarıda). Uzun tablolar `scratch/`'te bir dosyaya yazılır, mesaj ona işaret eder.

## Oturum sonu

Şart olan iki şey: TODO.md (biten işaretlenir, sıradaki yazılır) ve WORKLOG'un "Şu an"ı ile tarihli girdisi. Doğrulanmamış hiçbir şey bitti işaretlenmez, onun yerine "yazıldı, doğrulanmadı" yazılır. CHANGELOG'un Unreleased bloğu yalnız kullanıcıya görünen bir değişiklikte. TRAPS, DECISIONS ve TESTFINDINGS yalnız gerçek bir içerik çıktıysa. Bir kod değişikliği bir belge cümlesini yanlış yapıyorsa o cümle aynı commit'te düzeltilir.
