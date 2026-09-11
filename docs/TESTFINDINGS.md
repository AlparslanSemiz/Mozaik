# Test bulguları

Test koşularından çıkan bulgular, tarihleri ve neye dönüştükleri.

Bu dosya, bir koşudan çıkan ama ne [WORKLOG.md](WORKLOG.md)'nin oturum kaydına ne
[TODO.md](TODO.md)'nin iş listesine sığan bir bulgunun kaybolmaması için var.
Kayıt eklenir, üzerine yazılmaz, en yeni kayıt en üstte durur.

## Biçim

Her kayıt beş şey söyler:

- **Tarih ve koşu:** hangi komut, hangi katman, hangi makine.
- **Bulgu:** ne görüldü, ve tekrarlanabiliyor mu.
- **Tür:** ürün kusuru mu, test kusuru mu (yanlış kutuya bakan, bedava yeşil geçen, kararsız olan).
- **Ne yapıldı:** düzeltildi, bir TODO maddesine dönüştü (numarasıyla), ya da bilerek bırakıldı (gerekçesiyle).
- **Kalıcı kural:** bulgu kalıcı bir kurala dönüştüyse [TRAPS.md](TRAPS.md)'ye taşınır ve burada tek satırlık atfı kalır.

```
### <YYYY-AA-GG> · <komut> · <dosya ve test adı>
Bulgu: <ne görüldü, kaç koşuda tekrarlandı>
Tür: <ürün kusuru | test kusuru>
Ne yapıldı: <düzeltildi | TODO maddesi | bırakıldı ve gerekçesi>
Kalıcı kural: <yok | TRAPS.md, tuzak N>
```

## Kayıtlar

### 2026-09-11 · npm run test:site · site.spec.ts 61 "cache adı SÜRÜMÜ taşıyor" ve 137 "YENİ SÜRÜM GELİNCE ŞERİT ÇIKIYOR"
Bulgu: İki test ilk koşuda düştü, 20/22. Site derlemesi HEAD `8359cae` iken yapıldı, süit koşarken `ea054a1` commit'lendi. Test beklenen önbellek adını koşu anındaki HEAD'den hesaplıyor: `2.1.1-ea054a1` bekledi, sunulan `sw.js` `2.1.1-8359cae` taşıyordu. İkinci test sürümü o beklenen adı değiştirerek taklit ediyor, ad dosyada olmadığı için hiçbir şey değişmedi ve şerit çıkmadı. HEAD sabit tutularak yeniden koşuldu: 22/22.
Tür: ne ürün ne test kusuru, süreç hatası
Ne yapıldı: bırakıldı. Kural zaten WORKLOG'da duruyor ("bir süit koşarken derleme yapılmaz"), commit de HEAD'i değiştirdiği için o kurala girer.
Kalıcı kural: yok

### 2026-09-11 · geçici tanı spec'i · Program'da bırakınca çıkan bildirim, dil yenilemesiz değişince eski dilin kelimesini arıyor
Bulgu: `Program.tsx`'in `drop` geri çağırımı bildirimi `evictionNotice(...).replace(t('dönecek'), t('döndü'))` ile kuruyor ve `useCallback` bağımlılıklarında `t` yok (ESLint `exhaustive-deps`). Program `Activity` içinde durduğu için sekme değişince sökülmüyor, dil de Ayarlar → Görünüm'den sayfa yenilenmeden değişiyor. `EVICT_WORLD` dünyasında AV'nin kartı MÇ'nin hücresine bırakılarak üretildi. Türkçede bildirim "510 · MÇ dersi havuza döndü". Program Türkçe kurulduktan sonra dil İngilizceye alınıp bırakılınca "the 510 · MÇ lesson will go back to the tray". İngilizceye geçip yeniledikten sonra bırakılınca "the 510 · MÇ lesson went back to the tray". Cümle saf modülden yeni dilde geliyor, `replace` ise eski dilin kelimesini arıyor ve bulamıyor. Geri çağırım `ix`, `change` ya da `notify` değişene kadar, yani programda ilk değişikliğe kadar eski `t`'yi tutuyor. Önce yapılan sözlük taraması bunun üretilemeyeceğini söylemişti, çünkü `en.ts`'te bu iki anahtar tırnaksız yazılı ve arama tırnaklı biçimi arıyordu. Ekran ölçümü taramayı çürüttü.
Tür: ürün kusuru
Ne yapıldı: TODO §8d maddesi, düzeltilmedi. `useRowOrder.tsx`'in `grip`'inde aynı eksik var ama bugün ulaşılamıyor, çünkü liste ekranları yalnız kendi sekmelerinde çiziliyor ve dil yalnız Ayarlar'dan değişiyor. Bu kısım kaynaktan okundu, ekranda denenmedi.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/serit.spec.ts · 220 "%150 ölçekte de yedisi aynı yükseklikte ve hiçbiri taşmıyor"
Bulgu: %150'de (kök yazı 19,5 px, pencere 1920 px) Program şeridinin son grubu IZGARA'daki "İşlemler" düğmesi şeridin sağ kenarını 80,7 px aşıyor. Düğme 120 px, yani üçte ikisi pencerenin dışında. Şeridin `overflow-x`'i `visible`, `scrollWidth` 1997 ve `clientWidth` 1916, yani kaydırarak da ulaşılamıyor. Öteki altı şeritte taşma yok. Sebep ölçüldü: `516f963`'ün Program şeridine eklediği Renk grubu ve ayracı bir kopyada koşulla gizlenince test yeşil, kopya geri yüklenince yine kırmızı. Mutasyonun ilk denemesi derlenmemişti ve betik testi eski `dist` üzerinde koşmuştu (tuzak 84), o koşu sayılmadı.
Tür: ürün kusuru (tuzak 48'in sözü, ve %150 bu aracın okurunun kullandığı ölçek)
Ne yapıldı: TODO §8d maddesi. Düzeltilmedi, çünkü Renk grubunun yeri ve şeridin daralma kuralı bir tasarım kararı. Test kırmızı kalıyor. Kabul kaydı: kırmızının ilk yazılı anıldığı yer `0df5c9d`'nin WORKLOG girdisi ("iki araç şeridi testi bu turdan önce de düşüyordu"), sebebi yazılmamış, kullanıcı kabulü kayıtlı değil.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/serit.spec.ts · 81 "Program şeridi Görünüm ile başlıyor, kitaplık üçüncü grup"
Bulgu: 2026-09-01'den beri kırmızı. Test şeridin bütün başlıklarını tek liste olarak bekliyordu (`GÖRÜNÜM, DİZ, PROGRAM, YOĞUNLUK, IZGARA`). `516f963` sağ uca Renk grubunu ekledi, isteğin konusu olan sol uç değişmedi.
Tür: test kusuru (bugünkü listeyi adlandıran test, tuzak 97'nin deseni)
Ne yapıldı: düzeltildi (`d59985e`). Ayraçtan önceki başlıklar tam, sonrakiler LAYOUT.md'deki sıraya göre ayrı okunuyor. Mutasyon: Görünüm grubu Diz'in arkasına taşınınca kırmızı. Kabul kaydı: `0df5c9d`'nin WORKLOG girdisi, sebebi yazılmamış, kullanıcı kabulü kayıtlı değil.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/program.spec.ts · "18. Havuz görünümü takip ediyor"in üç testi (1004 sıralama, 1078 süzgeç, 1148 deste)
Bulgu: 2026-09-01'den beri kırmızı. `516f963` havuzu deste başına tek DOM kartı çizen hâle getirdi: derinliği `.pool-stack`'in `::before` ve `::after`'ı boyuyor, blok sayısı `data-count`'ta. Testler `.pool-card`'ı blok diye sayıyordu. Korudukları sözler (bir sıra blok kaybetmez, deste bölünmez, baş sayı ve süzgeç dışı sayısı doğru, yerleşen blok kendi destesinden düşer) tutuyordu. Deste testinin son yarısı zaten hiçbir şey ölçmüyordu: `[data-count="5"]` bir desteyi okuyup `dragAndDrop`'a önüne gelen ilk kartı sürükletiyordu.
Tür: test kusuru (bayat seçici, ve yarısı bedava yeşil)
Ne yapıldı: düzeltildi (`8359cae`). Yedi mutasyonun yedisi kırmızı: `left` sırasında bir blok kaybı (367 yerine 366), `size` sırasında bölünen deste (307 deste, 114 imza), süzgeç dışı sayısı bir fazla (327 yerine 328), desteleme kapalı, birinci katman çizilmiyor, ikinci katman iki blokluk destede de çiziliyor, yerleşen dersin destesi boşalıyor. Her mutasyondan sonra dosya kopyadan geri yüklendi ve karşılaştırıldı, temiz derleme 1 006 799 bayt. Kabul kaydı: `0df5c9d`'nin WORKLOG girdisi ("üçü havuz sıralaması, bu turdan önce de düşüyordu"), sebebi yazılmamış, kullanıcı kabulü kayıtlı değil.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/surum.spec.ts · 107, aşağıdaki kaydın kapanışı
Bulgu: Test değişmezi ölçecek şekilde yeniden yazıldı: en yeni sürümün her maddesi görünür, eski sürümler tek bir kapalı `details`'te ve gizli. Doğru kodla yeşil. Arşivi `<details open>` çizmek kırmızı, `SURUM_NOTLARI`'nı ters sırada çizmek kırmızı.
Tür: test kusuru
Ne yapıldı: düzeltildi (`de86a25`).
Kalıcı kural: yok

### 2026-09-11 · tanı spec'leri ve scratch/tani-*.mjs · paralel koşuda "kararsız" yedi testin sebebi
Bulgu: Aşağıdaki üç kayıttaki yedi test (dil 70 ve 83, planlar 98 ve 292, izgara 351, kurulum 855, renk 29) aynı şeyden düşüyordu. Chromium, `file://` kökeninde bir belgenin en başında localStorage'a dokunan bir betik koştuğunda (yalnız okusa bile) bir sonraki belgeyi, yani yenilemeyi ya da yeni sekmeyi, zaman zaman bir önceki turun deposuyla ya da bomboş bir depoyla başlatıyor. Süitte o betik `kapan.ts`'in her testte `addInitScript` ile kurduğu dil tohumuydu. Ölçümler:
- Yapay sayfa, belge ayrıştırılırken tek küçük yazım: gizli profilde 400 turda 30 bayat (17'si boş depo), kalıcı profilde 70 (39'u boş). Aynı yazım 50 ms sonra: 0. http kökeninde, 8 KB'lık değerlerle bile: 0. Yenilemeden önce 2 sn beklemek çözmüyor.
- Uygulamanın kendisi, başlangıç betiği olmadan: kalıcı profilde 580 yenilemede 0 (yenilemeden hemen önce yazımla ve yazımsız, 700 ms ve 0 ms beklemeyle), gizli profilde 200 hızlı yenilemede 0.
- Uygulama ve başlangıç betiği: yalnız okuyan betikle 200'de 5, kapan'ın tohumuyla 200'de 3 (kalıcı profilde de 200'de 3), her yüklemede yazan betikle 200'de 5. Her bayat açılış 3 sn sonraki yenilemede düzeldi, 800 turda kalıcı kayıp olmadı.
- E2E koşucusu, dört işçi, dil tanı spec'i (12 test, test başına 10 kez dil yaz ve yenile): eski tohumla dört tekrarda 48 testin 43'ü düştü, 142 bayat okuma. Tohumsuz 48/48 geçti, iki ayrı koşuda 720 yenilemede 0. Bayat açılışlarda yeni belgenin ilk betiği depoyu ya boş ya da bir önceki dil değeriyle buldu, yani uygulama doğru depoyu yanlış okumuyordu, depo yanlış geliyordu.

Aletin kendisi de sınandı, iki sinyal geçersiz çıktı ve sonuç sayılmadı. `context.storageState()` `file://` kökenini hiç döndürmüyor (`origins=[]`), yani onunla okunan "tarayıcı tarafındaki değer" her zaman boştu. Tohum kaldırıldıktan sonraki ilk tanı koşusu yine bayat okuma verdi, çünkü tanı spec'inin kendi başlangıç betiği de depoyu okuyordu, yani tetikleyiciyi aletin kendisi taşıyordu. O betik kapatılıp koşu tekrarlandı. Yapay sayfanın geç yazım değişkesi ilk hâlinde yazımı hiç koşturmuyordu, sayfa yazımı bitince bir işaret kurup test o işareti bekleyecek şekilde düzeltildi.
Tür: test kusuru (test altyapısı). Tuzak 92'nin uyarısı yerinde çıktı, sebep yük değildi.
Ne yapıldı: düzeltildi (`eb3fb0f`). Tohum kalktı, dil dört Playwright ayarında `locale: 'tr-TR'` ile sabit. Önce düşen yedi test dört işçide beşer kez koşuldu, 40/40. `klasor.spec.ts`'in başlangıç betiği de depoya dokunuyor, ama o spec http üzerinde koşuyor ve http'de tetiklenmedi, dokunulmadı. Üründe belge başında depoya dokunan bir kod yok, ama tarayıcı eklentilerinin `document_start` betikleri aynı yolu açabilir, ölçülmedi (TODO §8d).
Kalıcı kural: TRAPS.md, tuzak 108

### 2026-09-11 · npx playwright test e2e/planlar.spec.ts · 98 "açık plan sayfa yenilenince korunuyor" ve 292 "taslak işareti kaldırılabiliyor"
Bulgu: Kod refactorunun `safely()` adımında dört işçili koşuda iki test düştü. 98'de plan seçilip sayfa yenileniyor ve seçici beklenen kimlik yerine "1" okuyor. 292'de seçicinin ikinci seçeneği hiç bulunmuyor. İkisi de bugünkü E2E tabanında geçmişti. Tek işçide ve üçer tekrarla hem o adımın derlemesinde hem değişiklikten önceki HEAD'in (`586eae6`) derlemesinde 6/6 geçti. O adımda `store.ts` ile `library.ts`'teki birebir aynı iki `safely()` tek bir yaprağa taşınmıştı, gövde değişmedi.
Tür: test kusuru, kararsız, sebebi ölçülmedi (dil.spec.ts ve öteki dört testin aynı deseni: depoya yazıp yeniledikten sonra okumak)
Ne yapıldı: TODO §8d'deki kararsız testler maddesine eklendi sayılır. Refactor bu testleri kırdı diye okunmadı.
Sonra (2026-09-11): sebep ölçüldü ve düzeltildi, yukarıdaki "kararsız yedi testin sebebi" kaydı.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/dil.spec.ts · 70 ve 83, "beş dilin beşi de sekmeleri KENDİ dilinde çiziyor"
Bulgu: Kod refactorunun kapsülleme adımında dört işçili koşuda iki test düştü, ikisi de `chooseLang()`'ın 34. satırında: dil depoya yazılıp sayfa yenileniyor ve `<html lang>` "en" yerine "tr" okunuyor. 83 bugünkü E2E tabanında düşmemişti, 70 düşmüştü. Aynı `dist` üzerinde `--workers=1 --repeat-each=2` ile 20/20 geçti. O adımda sözlüklerin yalnız kullanılmayan `export default` satırı silindi, `dist/index.html` boyutu değişmedi ve sözlükler bundle'da duruyor.
Tür: test kusuru, kararsız, sebebi ölçülmedi (aşağıdaki kaydın aynı deseni, bir test daha)
Ne yapıldı: aşağıdaki kayıtla aynı TODO §8d maddesine eklendi sayılır. Refactor bu testleri kırdı diye okunmadı, çünkü tek işçide yeşil.
Sonra (2026-09-11): sebep ölçüldü ve düzeltildi, yukarıdaki "kararsız yedi testin sebebi" kaydı.
Kalıcı kural: yok

### 2026-09-11 · npm run test:e2e · e2e/surum.spec.ts 107, "Ayarlar → Hakkında güncel sürümün maddelerini gösteriyor, eskiler kapalı arşivde"
Bulgu: `panel.locator('details')` için 0 bekleniyor, 1 geliyor. Dört işçili tam koşuda düştü, `--workers=1 --repeat-each=2` ile iki kez daha düştü, yani kalıcı. Test `b0b83ed`'de (2026-08-31) "temiz bir profilde tek bir sürüm notu var" varsayımıyla yazıldı. `0df5c9d` (2026-09-01) `src/changelog.ts`'e 2.1.1 notunu ekleyince 2.1.0 kapalı arşive düştü. 2026-09-01'deki `npm run kontrol` koşusunun düşenler listesinde yok, o koşunun bu commit'ten önce mi sonra mı alındığı kayıtta yazılı değil. 2026-09-11'in `c58eda4`'ü `changelog.ts`'te yalnız bir yorum satırını değiştirdi.
Tür: test kusuru (bugünkü sayıyı adlandıran bir test, tuzak 97'nin deseni)
Ne yapıldı: TODO §8d maddesi. Kod refactor turunun tabanında bilinen kırmızı olarak duruyor.
Sonra (2026-09-11): sebep ölçüldü ve düzeltildi, yukarıdaki "107, aşağıdaki kaydın kapanışı" kaydı.
Kalıcı kural: yok

### 2026-09-11 · npm run test:e2e · dil.spec.ts 70, izgara.spec.ts 360, kurulum.spec.ts 851, renk.spec.ts 39
Bulgu: Dördü de dört işçili tam koşuda düştü ve `--workers=1 --repeat-each=2` ile ikişer kez geçti. Ortak adımları bir değeri depoya yazıp `reopen()` ile yenilemek ve ardından okumak: `lang` "en" yerine "tr", `data-theme` "dark" yerine "light", Program'daki Havuz düğmesi ve Öğretmenler'in ilk satırı hiç bulunamadı. 2026-08-31'de de her koşuda başka dört test düşüp tek işçide geçmişti. Sebep ölçülmedi. WORKLOG "yük altında kararsız" teşhisinin iki kez sonradan bir yardımcının sessiz dönüşü çıktığını yazıyor (tuzak 92), bu yüzden burada bir teşhis yazılmıyor.
Tür: test kusuru, kararsız, sebebi ölçülmedi
Ne yapıldı: TODO §8d maddesi. Refactor turunda bu testlerden biri kırmızıya dönerse önce tek işçiyle yeniden koşulur, ve refactorun kırıp kırmadığı ancak o zaman söylenir.
Sonra (2026-09-11): sebep ölçüldü ve düzeltildi, yukarıdaki "kararsız yedi testin sebebi" kaydı.
Kalıcı kural: yok
