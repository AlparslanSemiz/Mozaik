# Kararlar ve denenip bırakılanlar

Duruşun ne zaman, neden ve neyden değiştiği, ve denenip bırakılan yolların tarihli kaydı.

Bu dosya baştan sona okunmak için değil, "bu neden böyle" ya da "bu daha önce
denendi mi" sorusu için var. Bir duruşun değişmesi de, bir şeyi yapmamaya karar
vermek de bir karardır: çürütülmüş bir teori kaydı olmazsa aylar sonra yeniden
üretilir ve bir iş planına dönüşür.

Kayıtlar en yeni üstte. Her kayıt ne değiştiğini, eski hâlini ve gerekçesini
söyler. Denenip bırakılan bir yol **denendi** diye işaretlidir. Kayıtlar geriye
dönük düzeltilmez: o günkü kuralı aktaran bir alıntı o günün diliyle kalır, bir
ad sonradan değiştiyse yanına bugünkü adı parantez içinde eklenir.

## Eski ilke numaraları

İlkeler 2026-09-11'e kadar numaralıydı ve numaralar iki kez kaydı. Eski kayıtlarda,
[WORKLOG.md](WORKLOG.md)'de, [TODO.md](TODO.md)'de ve bazı yorumlarda geçen
"ilke N" şöyle okunur (kaydın tarihine bak):

| Numara | 2026-08-24 ile 2026-08-29 arası | 2026-08-30 ile 2026-09-10 arası | Bugünkü adı |
|---|---|---|---|
| 1 | Kurulum yok | Çift tıkla çalışır | Çift tıkla çalışır |
| 2 | Sunucu yok | Sunucu yok | Sunucusuz |
| 3 | İnternet gerekmez | İnternet gerekmez | Çevrimdışı |
| 4 | Türkçe, tek dil | Türkçe kaynak dildir | Türkçe kaynak dil |
| 5 | Bir dönem kullanılmadan özellik eklenmez | Veri kaybı kabul edilemez | 5 eskiden: kaldırıldı · 5 yeniden: Veri kaybı olmaz |
| 6 | Veri kaybı kabul edilemez | Kolay kullanılabilir ve yenilikçi | Veri kaybı olmaz · Kullanılabilirlik |
| 7 | Hedef makine yavaş | Şık ve modern | Hedef makine · Görsel kalite |
| 8 | yok | Hedef makine yavaş | Hedef makine |

İkinci dönemde CLAUDE.md'nin "güncelleme" bölümü hedef makineye hâlâ 7 diyordu,
yani o dönemde "ilke 7" iki şeyi kastedebilir. `DESIGN.md`'nin "İlke 7 artık bir
varsayım değil" cümlesi hedef makineyi kastediyor.

---

### 2026-09-12 · Klasörler katmanların adını taşıyor: `leaf` · `pure` · `platform` · `ui`

**Değişen.** `src/` düz bir klasördü ve ARCHITECTURE.md'nin tarif ettiği üç
katman dosya sisteminde hiç görünmüyordu. Bir katman ihlali ancak biri fark
ederse görünüyordu. Klasörler artık o katmanların karşılığı.

**Ölçüt tekti:** bir katman ihlali bir klasör sınırını geçen import olarak
görünsün. Adlar yeni bir taksonomi değil, ARCHITECTURE'ın kendi dört
başlığının İngilizcesi: yapraklar, saf mantık, durum ve tesisat, bileşenler.

**`state` değil `platform`.** Üçüncü katman iki şey barındırıyor: durum
(`store`, `toolState`) ve makinenin kendisi (`folder`, `desktop`, `update`,
`version` tarafı, baskı seçenekleri). `state/` o klasörün yarısını anlatırdı.

**Bir klasör adının işi, yanlış bir importu yanlış göstermek.** `pure/`
içindeki bir `import { useState } from 'react'` satırı kendini ele veriyor;
`logic/` ya da `domain/` bunu yapmıyor, çünkü ikisi de yan etki hakkında bir
şey söylemiyor. Ad bu yüzden seçildi.

**Denendi ve bırakıldı: `dom/` ile `hooks/` alt klasörleri.** Bir sınır,
yasakladığı bir şey varsa sınırdır, ve bu ikisinin arasında yasaklanacak bir
şey yok: aynı katmandalar, aynı şeyleri import edebiliyorlar, aralarındaki bir
import ihlal değil. Üstelik ayrım temiz de değil — `drag.ts` doğrudan DOM'a
yazan grupta duruyor ama bir kanca, yani React'i import ediyor. Temiz olmayan
bir ayrımı klasöre çevirmek onu kalıcılaştırmaktan başka bir şey yapmaz.

**Sınırı ölçen araç aynı kararla seçildi (`2a83380`):** dependency-cruiser,
ESLint'in `import/no-restricted-paths` kuralına karşı. Kural dosya dosya bakar
ve döngüyü hiç görmez; dependency-cruiser grafiği kurar, döngü ile katmanı tek
yapılandırmada tarif eder ve grafiği çizdirebilir. Sınırın adı ile sınırı ölçen
şey ayrı verilirse birbirini tutmayabilir, o yüzden birlikte verildi.

### 2026-09-12 · Biome bakıldı, kurulmadı

ESLint ile Prettier'ın ikisinin de yerine geçebilir ve çok daha hızlı. Bu turda
kurulmadı, çünkü ikisi de bu depoya yeni girdi ve göç maliyeti bugünkü
kazançtan büyük: kurallar, yapılandırma ve biçim commit'i yeniden yazılırdı.
Hızın bugün bir sorun olduğu ölçülmedi. Karar yeniden bakılabilir, tetikleyici
şu olur: biçim ya da lint adımı `kontrol`'de fark edilir bir yer tutmaya
başlarsa.

---

### 2026-09-12 · Hedef ölçek %150 değil %100

**Değişen.** Belgelerde ve kod yorumlarında dolaşan "hedef kullanıcı %125 ya da
%150 kullanıyor" varsayımı yanlış: %100 kullanıyor. Altı yerde bu varsayıma
dayanan gerekçeler vardı ve düzeltildi. Hiçbir karar geri alınmadı, çünkü
altısında da karar başka bir gerekçeyle ayakta kalıyor.

**Karışan üç eksen, ve ayrılması düzeltmenin kendisi.** Windows'un kendi DPI
ölçeklemesi gerçekten büyük ve bu kullanıcının kendi cümlesiyle kayıtlı
(`styles.css`, kök yazının 16'dan 13 px'e inmesinin sebebi). Uygulamanın kendi
`--ui-scale`'i ise %100 ve bu da iki yerde kullanıcı kararı olarak kayıtlı
(`SCALE_DEFAULT = 1`). Bir avuç yorum birinciden ikinciye atlayıp "okuyucu %125
ya da %150 kullanıyor" demişti.

**Düzeltilen yerler.** Şerit tercihinin gerekçesi ve ölçek tavanının gerekçesi
(`theme.ts`), şerit kural 4'ün erişilebilirlik yarısı, katlamanın gerekçesi ve
ızgara grubunun ölçümü (`Ribbon.tsx`), şerit standardının 4. maddesi
(`LAYOUT.md`), ve ölçek tavanı testinin gerekçesi (`e2e/gorunum.spec.ts`).
Şeridin taşma testininki 1b'de düzeltilmişti.

**Ölçümler yerinde kaldı.** "%150'de şu kadar piksel taştı" gibi cümleler
doğruydu ve duruyor; düşen şey yalnız araya sıkışmış "okuyucunun kullandığı
ölçek" ifadeleri. %150 artık gerekçelerde "okuyucunun ölçeği" diye değil
"şeridin en çok baskı altında olduğu ölçek" diye geçiyor.

**Bundan sonraki ölçüm kuralı.** Bir düzen kusuru önce %100'de ölçülür, %150
ikinci ölçüm olarak kalır ve hiçbir testten çıkarılmaz, çünkü merdiven hâlâ %80
ile %150 arası ve tavan bilerek ulaşılabilir bırakıldı.

**Erişilebilirlik tabanı bundan zayıflamıyor, tersine bağlayıcılaşıyor.**
%100'de 12 px alt sınırı, programın kendiliğinden geldiği ekranın hedef
kullanıcının gerçekten kullandığı ekran olduğu anlamına geliyor.

---

### 2026-09-12 · Tercih normalize'ları geniş kalıyor, boolean kabulü duruyor

**Değişen.** Bir şey değişmedi, ve yazılan şey bu: `normalizeDock`,
`normalizeRibbon` ve `normalizeAvailClock` `unknown` alıp hem depodan gelen
dizeyi hem boolean'ı kabul etmeye devam ediyor.

**Soru neydi.** Bu üç fonksiyona bugün doğrudan boolean veren bir çağıran yok.
Kabulün tek sebebi fabrikanın yazma yolu: `preference.ts`'in `write` ve `apply`'ı
depoya koymadan önce `normalize(value)` çağırıyor ve `value` orada `T`, yani bu
üç tercihte boolean. Yani ya imza geniş kalacak, ya boolean fabrikanın içindeki
tek bir dönüşüm noktasına alınıp normalize'lar daralacaktı.

**Karar: geniş kalıyor.** Üç gerekçe var ve birincisi ölçüldü.

Birincisi, daraltmanın bedeli sessiz. Üç fonksiyonun boolean dalı kaldırılıp
birim süiti koşuldu: 10 iddia düştü ve hepsi aynı biçimdeydi,
`false: expected 'acik' to be 'kapali'`. Sebebi `false !== 'kapali'` ifadesinin
doğru olması, yani `applyRibbon(false)` şeridi kapatmak yerine depoya `'acik'`
yazardı. Dal ölü değil, her yazımda koşuyor.

İkincisi, fabrikanın yazma yolundaki normalize bir güvence ve testi var: aralık
dışı bir sayı depoya sınırında giriyor (`scaleLike().write(9)`). O güvenceyi
korumak `normalize`'ın `T`'yi de görmesi demek, yani geniş imza bir kaza değil
sözleşmenin sonucu.

Üçüncüsü, tuzak 44'ün dersi tam tersi yönde: orada bir tipi eleyen bir guard her
sürüklemede varsayılanı yazmıştı. Geniş kabul kendi başına bir kusur değil,
kayıtsız kalması kusur.

**Bedeli ve kapısı.** Bedeli üç satırlık bir dal ve "bu tip nereden geliyor"
sorusunun cevabının fabrikada olması. Kapısı `src/preferences.test.ts`'in
sözleşme tablosu: her iki yönlü tercih için `[false, 'kapali']` ve `[true, 'acik']`
satırları var, yani dalı kaldıran biri yeşil geçemiyor.

**Yanında kapatılan bir boşluk.** Temanın makineyi izlememesi (2026-08-27) birim
katmanında yalnız `normalizeTheme(null) === 'light'` ile ölçülüyordu, ve
`fallback` ayrı bir fonksiyon olduğu için ikisi o test yeşilken ayrışabilirdi.
`preferences.test.ts`'e makinesi koyu isteyen bir dünyada tercihin OKUNDUĞU
hâlini ölçen testler eklendi, hareket tercihinin aynı makinede makineyi izlediği
karşıtlığıyla birlikte. Üç mutasyon da kırmızı: `fallback` sistemden türesin,
`normalizeTheme` sistemden türesin, bozuk kayıt sisteme düşsün.

---

### 2026-09-12 · Şerit daralınca neyi sırayla feda edeceğini söylüyor

**Değişen.** Araç şeridinin bir daralma kuralı var ve `docs/LAYOUT.md`'nin şerit
standardında altıncı madde olarak yazılı: önce gruplar arasındaki boşluk
kapanır, sonra iç grupların başlıkları gider, sonra düğmelerin kelimeleri gider,
düğmeler ve menüler hiç gitmez. Açılış başlığı hiçbir adımda gitmiyor. Eşikler
bir ölçek basamağı değil şeridin kendi genişliği (`@container`), yani dar bir
pencere %100'de de aynı adımlara ulaşıyor.

**Eski hâli.** Hiçbir daralma kuralı yoktu. `.ribbon-group` eşit sütunlu bir
grid, `.ribbon`'da `flex-wrap` yok, `overflow` yok, `min-width` yok. Sığmayan
düğme kutunun dışına çıkıyor ve tıklanamaz oluyordu.

**Gerekçe.** Tuzak 48 bu kuralı zaten yazıyor ve üst çubuk onu uyguluyordu,
şerit uygulamıyordu. Ölçüm (a81c79a, 1920 px, Program şeridi): %80'de esneyen
pay 669,9 px, %100'de 391,4 px, %125'te 78,5 px, %150'de 0 ve "İşlemler" düğmesi
kutunun 80,7 px dışında. Yani kusur hedef kullanıcının kullandığı ölçekte
görünmüyor ama %125'te pay bir düğmeden dardı: kusuru doğuran şey `516f963`'ün
eklediği Renk grubuydu ve bir sonraki grup aynı şeyi yeniden doğururdu. Tek bir
grubu menüye indirmek o yüzden seçilmedi, bu bir kez daha kapatır ve kuralı
yazmaz.

**Kelime feda edilirken ad kalıyor.** Düğmeler yazıyı çıplak bir metin düğümü
olarak çiziyor ve hepsinde `aria-label` yok, yani `display: none` erişilebilir
adı da götürürdü ve iki test katmanı bir kontrolün adı üstünde anlaşamaz olurdu
(tuzak 56). Kelime bu yüzden yazı boyu sıfırlanarak gidiyor: metin düğümü
erişilebilirlik ağacında duruyor, yalnız çizilmiyor.

**Yatay kaydırma seçilmedi.** Taşan düğmeyi erişilemez olmaktan çıkarıp görünmez
yapardı, yani kusuru teşhis edilemez hâle getirirdi, ve `.ribbon` bölüm çizgisini
ve konumlanmış bir düzlemi taşıyor (tuzak 54).

**Sonuç ve bedeli.** %150'de Program şeridinin payı 0 ve 80,7 px taşmadan 230,8
px paya ve sıfır taşmaya geçti, %125'te 78,5'ten 159,8 px'e. `dist/index.html`
1 006 340'tan 1 006 755 bayta çıktı (+415). Kuralın üç adımı da, sıranın kendisi
de, açılış başlığının korunması da ve adın feda edilmemesi de `e2e/serit.spec.ts`'te
ölçülüyor: altı mutasyonun altısı kırmızı.

---

### 2026-09-12 · Tema ilk boyamadan önce kuruluyor, `<head>`'de klasik bir betikle

**Değişen.** `index.html`'in `<head>`'ine `type="module"` taşımayan bir betik
kondu: `ders-programi-tema` okunuyor ve `<html>`'e `data-theme` yazılıyor. Aynı
betik `scripts/favicon.mjs`'in şablonunda da duruyor (tuzak 93).

**Eski hâli.** Temayı yalnız `main.tsx` yazıyordu ve yorumu "ilk boyamadan
önce" diyordu. Derlenmiş tek dosyada o kod inline bir modül betiğinin içinde,
yani spec gereği ertelenmiş: belge ayrıştırıldıktan sonra koşuyor.

**Gerekçe.** Yorumun sözü yavaş bir makinede tutmuyordu ve bu ölçülmüştü:
4 kat yavaşlatılmış işlemcide karanlık tema kayıtlıyken ilk kare dokuz açılışın
dokuzunda açık zeminle geliyordu, sonra karanlığa dönüyordu. Hedef kullanıcı zor
görüyor, ve kullanılabilirlik ilkesi kontrastı süs değil gereksinim sayıyor.
Klasik bir betik ayrıştırmayı bloklar, yani "ilk boyamadan önce" bir yarış
olmaktan çıkıp bir garanti oluyor: düzeltmeden sonra aynı ölçüm sıfır.

**Bu bir davranış değişikliği ve bilerek yapıldı.** Refactorun "davranış
değişmez" kuralının dışında duruyor, çünkü kapatılan şey refactorun beşinci
adımının kendi sözüydü ("tercih ilk boyamadan önce yazılır"): sözleşme
fabrikada tutuyordu, ihlal `main.tsx`'in derlenmiş dosyada ne zaman koştuğundaydı.

**Kapsam yalnız tema.** Ölçek, yoğunluk, şerit ve müsaitlik saati `main.tsx`'te
kaldı, çünkü ölçülen tek görünür fark renkti: ötekiler geç uygulandığında düzen
kayması 0,0002'nin altında. Sekiz tercihin hepsini taşımak `index.html`'e sekiz
anahtar ve sekiz normalize kuralının ikinci kopyasını koyardı.

**Bedeli ve kapıları.** `dist/index.html` 693 bayt büyüdü. Üç dizenin iki yerde
olması tuzak 77'nin şekli, o yüzden `src/preferences.test.ts` `index.html`'i
okuyup betiğin gövdesini koşturuyor ve `themePreference`'ın cevabıyla
karşılaştırıyor. Betiğin belge başında depoya dokunmasının tuzak 108'i
tetikleyip tetiklemediği varsayılmadı, ölçüldü: tetiklemiyor, sınır "belgeden
önce" ile "belgenin `<head>`'i içinde" arasında. Ölçümler TESTFINDINGS'te.

---

### 2026-09-12 · PLAN.md ikiye ayrıldı, tuzak listesi silindi

**Değişen.** `docs/PLAN.md` iki dosya oldu. Canlı kalan kısmı
[ROADMAP.md](ROADMAP.md): yalnız gelecekteki sürümler (v2, v3, v4), her birinin
çıkma şartı ve hâlâ cevabı beklenen sorular. Geri kalanı
[plan-v0-arsiv.md](plan-v0-arsiv.md): donmuş bir tarihsel kayıt, bir daha
güncellenmiyor, ve en üstünde 2026-09-12'de kaynaktan doğrulanmış bir "bugün
yanlış olan ne" tablosu taşıyor.

**Eski hâli.** Tek bir dosya hem v0'ın planını, hem beş biten sürümün tarifini,
hem gelecekteki üç sürümü, hem de on dokuz maddelik bir tuzak listesini
tutuyordu. Kendi güncelleme notları "v0'ın kaydı olarak duruyor" ve "gerekçeler
geçerli, sayılar değil" diyordu, yani okuyan kişi her paragrafta bunun hâlâ
doğru olup olmadığını sormak zorundaydı.

**Gerekçe.** Bir belgenin bir işi olur. Karışık bir arşiv ne plan olarak
güvenilir ne kayıt olarak okunur, ve yanlış olduğu bilinen bir cümle bir
belgede durduğu sürece bir gün doğru sanılır.

**Silinen.** Belgenin on dokuz maddelik tuzak listesi arşive de alınmadı, tek
satırla [TRAPS.md](TRAPS.md)'ye yönlendirildi. Sebebi iki listenin çelişmesi ve
numaralarının tutmaması: PLAN'ın 14'ü TRAPS'te 11, 15'i 12, 16'sı 13. Koddaki
altı yorum PLAN'a atıf yapıyordu ve bir kısmı zaten TRAPS numarasını
kullanıyordu, hepsi TRAPS'e çevrildi.

### 2026-09-11 · Kod refactoru: makine tercihleri tek fabrikada

**Değişen.** On beş makine tercihi artık `src/preference.ts`'teki tek fabrikadan
kuruluyor: tema, dil, yazı büyüklüğü, ızgara ve arayüz yoğunluğu, havuz çekmecesi ve
boyu, araç şeridi ve kendiliğinden gizlenmesi, müsaitlikte saat, hareket, örnek veri
satırı, kâğıt seçenekleri, program kart rengi ve görülen sürüm notu. Anahtarları ve
"Veriler nerede" tablosundaki adları `src/preferenceKeys.ts`'te tek listede duruyor,
`storageReport` satırlarını oradan okuyor. Programın çağırdığı adlar (`readTheme`,
`applyScale`, `writeDock` ve öteki) değişmedi, fabrika nesnelerinin kendi
fonksiyonları.

**Eski hâli.** Her tercih kendi try/catch'li okumasını ve yazmasını taşıyordu. Kopyalar
bir değerin saklanmadan önce normalize edilip edilmediğinde (havuz boyu ediyordu, ölçek
etmiyordu) ve bir boolean'ı tanıyıp tanımadığında (şeridin gizlenmesi tanıyordu,
müsaitlik saati tanımıyordu) ayrışmıştı. Anahtar dizeleri `library.ts`'te bir kez daha
yazılıydı, ve ikisi için `library.ts` `changelog.ts` ile `programColor.ts`'i import
ediyordu.

**Sözleşme.** Kullanıcının koyduğu değişmezler fabrikanın kendi testinde
(`preference.test.ts`), her tercihin bugünkü davranışı da bağlamadan önce
`preferences.test.ts`'te sabitlendi. `apply` değeri `<html>`'e depodan önce ve aynı
çağrıda yazar, depo çalışmasa da. Kayıt yoksa yedek sorulur, `normalize`'dan geçmeden
ve her okumada yeniden. Kayıtlı `"0"` ve `""` yokluk sayılmaz. `normalize` denetimin
tipini de depodaki dizeyi de kabul eder ve `write` değeri ondan geçirerek saklar. Bu
yüzden `normalizeDock`, `normalizeRibbon` ve `normalizeAvailClock` boolean da kabul
ediyor, ve bugün onlara boolean veren bir çağıran yoktu. Hareket için makine bir taban:
yedek makineden türetilir, ve `styles.css`'te `prefers-reduced-motion` bloğu ayarın
kurallarından sonra durur. İkisi de testte (tuzak 58).

**"Kayıt yoksa sistemden türetilir" değişmezinin sınırı.** Fabrika yedeği okuma anında
sorar, yani bir tercih makineye bakabilir, ve hareket ile dil bakıyor. Tema bakmıyor,
kayıt yoksa açık: işlev renkleri (yeşil bırakılabilir, sarı uyarı, kırmızı engel) açık
zeminde seçilip ölçüldü, ve makinenin karanlık ayarı bir ihtiyaç değil bir zevk
(`theme.ts`'teki gerekçe). Bu adım o duruşu değiştirmedi, çünkü turun kuralı davranışın
değişmemesi. Temanın da sistemi izlemesi istenirse ayrı bir karar olur.

**Ölçülen.** `dist/index.html` 1 006 799 bayttan 1 005 630 bayta indi. Playwright
Chromium, `file://`, profil başına dokuz açılış, önce ve sonra aynı betikle
(`scratch/olc-boya.mjs`). x1'de ilk boyama 52 ms, öznitelikler 48 ile 49 ms, içerikli
ilk boyama 92 ile 96 ms, düzen zıplaması tek kayma ve 0,0001 ile 0,0002, ve 18
açılışın 18'inde tercihler ilk boyamadan önce `<html>`'de, iki ölçümde de. x4'te farklar
gürültü içinde ve iki yöne dağılıyor: ilk boyama 144 ile 164 ms, öznitelikler 208 ile
226 ms. Aynı ölçüm fabrikadan önce var olan bir kusuru gösterdi: 4 kat yavaş işlemcide
ilk kare tercihlerden önce boyanıyor ve karanlık temada zemin açık başlıyor (TODO §8d).
Fabrika bu kusuru ne yarattı ne kapattı.

**Kapsamın dışında kalan.** Envanterin önerdiği `useSyncExternalStore` bağlantısı
yapılmadı: App ve bileşenler tercihleri bugünkü gibi `useState` ile tutuyor, bu adımın
sorusu depodaki kopyalardı. `applyRibbonAuto` adında "apply" olduğu hâlde yalnız
saklıyor, çağıranlar değişmesin diye adıyla kaldı.

### 2026-09-11 · Denendi: `buildIndex` anahtarı `parseKey` ile okusun

**Denenen.** Kod refactorunun anahtar adımında elle yazılmış bütün anahtar kesmeleri
`keys.ts`'teki `parseKey`'e bağlandı, `buildIndex` dahil.

**Ölçülen.** Dolu örnek okulda, HEAD ile sırayla koşan A/B mikro ölçümünde `buildIndex`
1,10 kat yavaşladı (medyan 0,093'ten 0,103 ms'ye). `split` ile yazılmış ilk sürümde
oran 1,49'du. Aynı ölçümde `sanitize` 0,67, `remapDays` 0,83 ve `closedConflicts` 0,93
kat sürdü, yani onlar hızlandı.

**Karar.** `buildIndex` kendi kesmesine döndü, öteki yerler `parseKey`'de kaldı. O döngü
yalnız günü ve saati kullanıyor, `parseKey` ise kimliği de kesip her yerleşim için bir
nesne kuruyor, ve `buildIndex` sürükleme başında aday hücre başına yeniden çağrılıyor.
Geri konunca oran 1,03. Yanındaki kod yorumu ölçümü yazıyor. "Tek ayrıştırıcı"
temizliği yeniden düşünülürse önce bu kayıt okunur ve ölçüm tekrarlanır
(`scratch/bench-anahtar.ts`).

### 2026-09-11 · Kod refactoru: geliştirme araçları ve tek biçim

**Değişen.** Depoya ESLint, knip ve Prettier geliştirme bağımlılığı olarak girdi.
ESLint yalnız React'in kanca kurallarıyla başladı (`rules-of-hooks` hata,
`exhaustive-deps` uyarı). Prettier bütün kod dosyalarını tek biçime getirdi:
`printWidth` 100, tek tırnak, sondaki virgüller. Refactordan önce iki davranış
kusuru ayrı commit'lerle düzeltildi, ve yalnız testten çağrılan altı fonksiyonun
testleriyle birlikte silinmesine karar verildi.

**Eski hâli.** Depoda biçimleyici ve linter yoktu. 20 dosya çift, geri kalanı tek
tırnak kullanıyordu, ve ESLint olmayan bir depoda bir `eslint-disable` yorumu
duruyordu.

**Gerekçe.** Hazır çözüm önceliği, ve üçü de bundle'a girmiyor (ölçüldü,
`dist/index.html` araçlar kurulunca değişmedi). ESLint'in dar başlaması bilerek:
tam `recommended` setleri yüzlerce bulgu üretir ve refactorun diff'lerini gürültüye
boğar, kanca kuralı ise bu turda gerçek bir kusuru (Müsaitlik ve Çıktı'daki kanca
sırası) yakaladığı ölçülen kural. Prettier'ın ayarı bir zevk tercihi değil, mevcut
koda en az diff verecek biçimde seçildi: satırların yüzde 1,3'ü 100 karakteri
geçiyordu ve importların üçte ikisi tek tırnaklıydı. Biçim commit'i yalnız başına
duruyor ve `.git-blame-ignore-revs`'e yazıldı, çünkü taşıma ile içerik değişikliğinin
aynı commit'te olmaması kuralı biçime de uyuyor. Kusurların refactordan önce
düzeltilmesi kullanıcı kararı: bölünen bir bileşende kusur sessizce kalkarsa
"refactor davranışı değiştirmez" iddiası ölçülemez olur.

**Kapsamın dışında kalan.** Prettier `src/lang`'a, CSS'e ve JSON'a dokunmuyor.
Sözlüklere, çünkü `i18n.test.ts` onların ham metnini okuyor. CSS'e ve JSON'a, çünkü
bu adımın sorusu kodun biçimiydi.

### 2026-09-11 · Belgeler yeniden kuruldu

**Değişen.** 2933 satırlık CLAUDE.md bölündü: kurallar `docs/` altındaki konu
dosyalarına, tarihli kararlar bu dosyaya, tuzaklar temaya göre `TRAPS.md`'ye,
ölçümler WORKLOG'a gitti, CLAUDE.md yalnız bir yönlendirme kapısı oldu.
"Değişmez ilkeler" ve "Yasak liste" başlıkları, ve "istisnası yok", "bu bir
sözleşmedir" gibi mutlak çerçeve kalktı. Yerine her kuralın yanında gerekçesini
yazan bir duruş geldi. İlkeler numarasız oldu. `docs/TASKS.md` `docs/TODO.md`,
`docs/STATUS.md` `docs/WORKLOG.md` oldu. Kökte İngilizce bir `CHANGELOG.md` açıldı.
Her oturum sonunda E2E koşma beklentisi kalktı, yerine `TESTPLAN.md`'deki kadans
geldi. `CONVENTIONS.md`'ye commit mesajı, hazır çözüm önceliği ve kod kalitesi
kuralları eklendi.

**Eski hâli.** Tek dosyada bir kural kitabı, bir karar günlüğü ve bir laboratuvar
defteri iç içeydi.

**Gerekçe.** Neye uyulması gerektiği ile neyin yalnız tarih olduğu ayırt
edilemiyordu, ve değiştirilebilir bir kuralın tek savunması gerekçesi olduğu
hâlde kurallar "tartışılamaz" diye yazılmıştı. Kullanıcı kararı.

**Hazır çözüm önceliğinin ilk istisnası.** `CHANGELOG.md`'nin `Unreleased`
bloğunu sürüm numarasına kapatan kod `scripts/yayinla.mjs`'e elle yazıldı. npm'de
Keep a Changelog biçimini ayrıştıran paketler var. Alınmadı, çünkü iş tek bir
başlık satırını değiştirmek, `yayinla.mjs` `Cargo.toml`'u da aynı yolla metin
olarak düzenliyor, ve bir ayrıştırıcının dosyayı yeniden yazarken elle yazılmış
notları yeniden biçimlendirme riski var. Bu risk ölçülmedi.

### 2026-09-01 · Exe penceresi büyütülmüş açılıyor

**Değişen.** `tauri.conf.json` penceresine `maximized: true` eklendi, `minHeight`
700'den 640'a indi. **Eski hâli.** Pencere 1600×1000 mantıksal piksel istiyordu
ve büyütülmüyordu, ve belge "ekran 1920×1080 varsayılır" diyordu. **Gerekçe.**
Exe sayfayı 1600 CSS pikselde koşturuyordu ve Sığdır'da 374 kartın 315'i
kırpılıyordu. Windows %150'de çalışma alanı 672 mantıksal piksel, yani 700
pencereyi o ekrana sığdırılamaz yapıyordu (tuzak 107).

**Denendi, istenmedi.** Sığdır'da kartın alt satırını kaldırmak satırı kısaltıp
1920×1080'de 25 satırın 25'ini sığdırıyordu. Dikey düzene dokunulmadı, kullanıcı
kararı.

### 2026-09-01 · İkon eşiği 32'den 20'ye

**Değişen.** `kurulum/icon.ico` artık yalnız 16 px'te sade, 20 px ve üstünde
ayrıntılı çizimi taşıyor (`scripts/ikon.mjs`, `SADE_ALTINDA = 20`, commit
`507fd00`). **Eski hâli.** 2026-08-30'dan beri eşik 32'ydi. **Gerekçe.**
Kullanıcı isteği ("ayrıntılı simge"), dokuz boyun pikselleri karşılaştırılarak
doğrulandı. 2026-08-30 kaydındaki 24 px ölçümüyle nasıl bağdaştığı kayıtlı
değil.

### 2026-09-01 · Sürükleme durumu React'ten çıktı

**Değişen.** Sürüklemenin hedef satırı, bırakma önizlemesi ve hayaleti `drag.ts`
tarafından doğrudan yönetiliyor, `Grid` ve havuz yalnız gerçek veri değişince
yeniden çiziliyor. Hedef dışını karartmak için satırlara `opacity` değil, görünür
alanı örten iki `pointer-events: none` gölgeleme düzlemi kullanılıyor. `dropMap()`
hedef sınıfın blok tablosunu bir kez kuruyor. **Eski hâli.** `dragging` bir React
durumuydu ve her satırın `dim` prop'u yaklaşık 1950 hücreyi yeniden
uzlaştırıyordu, geniş tablonun satırlarındaki `opacity` her satırı ayrı bir raster
katmanına alıyordu. **Gerekçe.** Kartı renkli hücrelerin üstünde gezdirirken
takılma. Ölçülen ikinci kare süresi ~125 ms'den 46,2 ms'e indi (4× CPU kısıtı).
Performans testi ham `blocker()` döngüsünü değil gerçek `dropMap()`'i ölçer.

### 2026-09-01 · Kartın üstüne bırakmak takas edebiliyor

**Değişen.** Bir kartı başka bir kartın üstüne bırakmak, iki hamle de yasalsa iki
kartı yer değiştiriyor (commit `516f963`, 2.1.1'e girdi). **Kayıt eksik.** Bu
değişiklik WORKLOG'da ve uygulama içi sürüm notlarında anlatılmıyor, gerekçesi
yazılı değil. 2026-08-26'daki "dolu hücreye bırakılabilir, oradaki ders havuza
döner" kararıyla nasıl birlikte çalıştığı [DATA.md](DATA.md)'nin kısıtlar
bölümünde koddan okunarak yazıldı.

### 2026-08-31 · Depo adı Mozaik oldu

**Değişen.** `ddae9fe` depoyu `ders-programi` yerine `Mozaik` yaptı. Kırılan
güncelleme üç yerden onarıldı: `update.rs` iki önek tanıyor (`RELEASE_KOKLERI`),
`surum.yml` manifeste eski adlı adresi yazıyor, ve `src/surum.test.ts` iki dosyayı
birbirine karşı okuyor. `SITE_ADRESI` `…github.io/Mozaik/` oldu. **Eski hâli.**
Depo adı "değişmeyen kimlikler" listesindeydi ve yanında "depo yeniden
adlandırılırsa o kopyalar bir daha hiç güncellenemez" uyarısı vardı. **Bedeli.**
Yayınlanmış v2.0.2 "Güncellemeleri denetle"de `Beklenmeyen adres` dedi, ve Pages
eski adreste 404 verdi (tuzak 106). Ad geri alınmadı.

### 2026-08-31 · Boşluk kuralları (şema v14)

**Değişen.** `Limits.maxGapsTeacher` ve `maxGapsClass` eklendi: bir gün içinde ilk
ve son dolu saat arasındaki boş saat sayısı. Seviyesi yalnız `Kapalı` ya da
`Uyar`, varsayılanı `Kapalı`. **Gerekçe.** `minPerDay` gibi bir bırakmayı
engelleyemez, çünkü gün yarı dizilmişken her açık saat bir boşluktur. 0 burada
öteki sınırlardan farklı olarak "hiç boşluk olmasın" demek, etkinliği yalnız
seviye belirliyor. Hiç istemeyen bir okul yeni uyarılarla uyanmasın diye
varsayılan `Kapalı`.

### 2026-08-31 · Denendi: `scrolled()`'ü ertelemek

**Denenen.** Program sekmesi açılırken profilin en pahalı satırı `gridChrome.ts`'in
`scrolled()`'üydü: sekme başına bir çağrı, 4× CPU kısıtında 119,7 ms, CPU
örneklerinin %35,3'ü. Taze bir kapta `scrollTop` her zaman 0 olduğu için boşa bir
düzen hesabı gibi görünüyordu ve `requestAnimationFrame`'e ertelendi. **Sonuç.**
Tıklamadan boyamaya süre kıpırdamadı: ertelenmiş 105,5 ve 104,9 ms, olduğu gibi
104,5 ms. **Neden bırakıldı.** O düzen boyamanın zaten yapacağı düzendi, çağrı
yalnız faturanın nereye kesildiğini seçiyordu. Aynı sayıyı ölçen bir iyileştirme
geri alındı (tuzak 105).

### 2026-08-30 · Çerçeve değişti: "bir dönem kullanılmadan özellik eklenmez" kalktı

**Değişen.** İki yıl 5. ilke olan kural kaldırıldı. Yerine bir kural gelmedi,
iki yeni ilke geldi ("Kolay kullanılabilir ve yenilikçi", "Şık ve modern") ve
hedef aSc'nin kursla ilgili kısmının %10'undan %50'sine çıktı. `docs/ASC.md`
özellik pusulası oldu (commit `a4cef3a`).

**Eski hâli.** *"Bir dönem kullanılmadan özellik eklenmez. Tahmine dayalı özellik
= yanlış özellik."* Elde veri yokken yazmamayı ve babanın bir dönem kullanmasını
bekliyordu.

**Gerekçe.** Bu bir gevşetme değil bir yön değişikliği: özellik artık rakibin
gerçekten yaptığı işten türetiliyor, ve aSc'nin yardım konuları ile arayüz
metinleri okunabilir hâlde duruyor, yani tahmin ile ölçülmüş bir rakip davranışı
aynı şey değil. Değişmeyenler: ilk üç ilke, yasak liste, ve ölçmek. Bir özellik
artık "baba istemedi" diye değil, "ilk üç ilkeyi bozuyor" ya da "ölçülmedi" diye
reddediliyor.

`docs/STATUS.md` (bugün `docs/WORKLOG.md`) ve `docs/TASKS.md`'deki (bugün
`docs/TODO.md`) eski `(ilke 5)` atıfları olduğu gibi bırakıldı: o gün geçerli
olan kuralla alınmış kararları anlatıyorlar ve geriye dönük düzeltilirlerse kayıt
yalan söyler.

### 2026-08-30 · Kurulum yasağı kalktı

**Değişen.** Kurulum serbest. Kalan iki şey: hesap ve şifre sorulmaz, ve kurulmadan
da çalışan bir yol hep kalır (`dist/index.html` çift tıklanır). Bir kurulum bir
seçenek olabilir, tek kapı olamaz. **Eski hâli.** *"Kurulum yok. Sihirbaz, hesap,
şifre, güncelleme yok."* **Gerekçe.** Kurulumun yarısı zaten yapılmıştı:
`kurulum/Kur.cmd`, `dist-kurulum/` ve exe üç ayrı teslim yoluydu. Kullanıcı kararı.

### 2026-08-30 · Paylaşmak yapılacak işlerden

**Değişen.** Programın çıktısını e-postayla ve WhatsApp'la göndermek yapılacaklar
arasına girdi (kullanıcı: "babam istedi"). **Gerekçe.** Sunucu yok ilkesini
bozmuyor: paylaşılan şey bir dosya (PNG, PDF, bağlantı) ve onu taşıyan işletim
sisteminin kendi paylaşım yolu, ortada sunucu, hesap, oturum ya da yüklenen veri
yok. Ağ kuralı güncellemeninkiyle aynı, yalnız tıklanınca. aSc'nin EduPage'e veri
yükleyip öğretmene ve veliye hesap açan Sharing'i bu değil ve hâlâ yapılmıyor.

### 2026-08-30 · Vitrin İngilizce

**Değişen.** Depoya dışarıdan bakan her şey İngilizce: README, LICENSE,
`surum-notu.md`, iş akışlarının görünen adları, `description` alanları.
CLAUDE.md, `docs/`, `.claude/` ve `.mcp.json` Türkçe kaldı. İki istisna:
`surum-notu.md`'nin sonundaki üç satır Türkçe kurulum özeti ve `kurulum/OKU.txt`.
Kullanıcı kararı. O günkü kayıt "programın kendisi de öyle: arayüzün varsayılanı
hâlâ Türkçe" diyordu, kod ise 2026-08-28'den beri cihazın diline bakıyor (aşağıda).

### 2026-08-30 · Yasak listeden üç madde çıktı

**Değişen.** İstatistik ve pano, SMS ve e-posta, aynı planın sürüm ağacı listeden
çıktı ve `PLAN.md`'de de silindi. Listeden çıkmak yapılacak olmak demek değil,
üçü de artık ölçülüp karar verilebilir. Sürüm ağacının 2026-08-25 tarihli
daraltma kaydı bu tarihten sonra tarihseldir.

### 2026-08-30 · Kurulum betiklerinde `Bypass` yerine `RemoteSigned`

**Değişen.** Dört yerdeki `-ExecutionPolicy Bypass` (iki `.cmd`, `kur.ps1`'de iki
`Start-Process`) `RemoteSigned` ve `Unblock-File` oldu. **Gerekçe.** Bir ZIP'ten
çıkan dosya "Internet" bölgesi damgası taşır ve Bypass o damgayı görmezden
gelmenin en geniş yolu, indirilen arşivde virüs tarayıcılarının tanıdığı bir
desen. Aynı iş, benzemeyen imza ([BUILD.md](BUILD.md)).

### 2026-08-30 · Exe imzasız kalıyor

**Değişen.** Yayına `SHA256SUMS.txt` girdi. **Gerekçe.** Kod imzalama sertifikası
ücretli ve cevap hayırdı, imza yoksa "bu, yayınladıkları dosya mı" sorusunun
cevabı bir özet. VERSIONINFO'nun eksik olduğu varsayılmıştı, yayınlanmış ikilide
ölçülünce `tauri-build`'in onu zaten gömdüğü görüldü (tuzak 101).

### 2026-08-30 · İkon eşiği 20'den 32'ye

**Değişen.** `.ico`'nun 16, 20 ve 24 px'i sade, 32 px ve üstü ayrıntılı çizim
oldu. **Gerekçe.** Şikayet üçüncü kez geldi (*"sanki küçük simge yani 9x9
pixellik kullanılıyor gibi"*). Önce yayınlanmış 2.0.0'ın içine bakıldı: dokuz
`RT_ICON`, gömülü boylar 16 ile 256 arası ve `kurulum/icon.ico` ile birebir, yani
eksik boy yoktu. 24 px'te ayrıntılı çizimin altı çubuğu 2,25 cihaz pikseli ve
araları 0,56 piksel, bir cihaz pikselinin altındaki boşluk yoktur. Önceki iki
taşıma görev çubuğunun hangi boyu istediğini tahmin ederek yapılmıştı, bu ilk
ölçülen taşımaydı. Eşik 2026-09-01'de yeniden 20'ye indi.

### 2026-08-30 · Kök yazı 13 px, ölçek %80'e iniyor

**Değişen.** Kök yazı boyu 14 px'ten 13 px'e indi, `SCALE_MIN` 1'den 0,80'e.
`SCALE_DEFAULT` 1'de kaldı. **Netleştirilen.** "Ekranda 12 px taban" varsayılan
ölçekte (%100) geçerli: %80'e uzanan okuyucu tabana kendisi cevap veriyor, ve bunu
Windows'un kendi ölçeklemesi zaten büyükken yapıyor. Tipografi merdiveni her kök
değişiminde yeniden sabitlendiği için %100'de 12 px hâlâ 12 px. Aynı değişiklik
müsaitlik başlığındaki kıl payını negatife çevirdi (tuzak 102).

### 2026-08-30 · İpucu satırı tek cümle

**Değişen.** Her `.hint` tek cümle, uzayan gerekçe `title`'a iniyor. **Gerekçe.**
Kullanıcı: *"çok fazla info var ve çok uzunlar her yerde"*. Ölçülen: ekrandaki en
uzun `.hint` 438 karakterden 126 karaktere indi.

### 2026-08-30 · Sağ tık menüsü yeniden dizildi, raptiye bir düğme oldu

**Değişen.** Menünün şekli: üst düzeyde elin sık uzandığı şey (havuza kaldır, dersi,
öğretmeni, sınıfı düzenle, buraya sabitle), kapıların arkasında nadir olan (toplu
sabitle, geçici görünüm). Kartın sol alt köşesindeki sabitleme işareti tıklanabilir
bir düğme oldu, kullanıcı: *"kartların üzerinde sabitleye basınca dersi sabitlesin
babamın en çok kullanacağı bu"*. Raptiye kartın çocuğu değil kardeşi, çünkü kart
bir `<button>` ve düğme içinde düğme geçersiz HTML.

**Kayıtlı karar ve koddaki hâl ayrışıyor.** O günkü kayıt raptiyenin "hep görünür,
sönük (`opacity: .38`)" olduğunu ve bunun kullanıcı kararı olduğunu yazıyordu,
gerekçesi: hover'da beliren bir kontrol bu programın okuyucusunun bir daha
bulamadığı kontroldür. Aynı gün `fb052f4` raptiyeyi dururken görünmez yaptı
(`opacity: 0`, hücrenin üstüne gelince, odakta ya da sabitliyken görünür). Bu
değişikliğin gerekçesi kayıtlı değil, kullanıcıya sorulacak.

### 2026-08-30 · Denendi: tek saatlik sabitlemeyi alt menüye almak

**Denenen.** "Dersi buraya sabitle" bir tur boyunca alt menüde durdu (`a7122ac`).
**Neden bırakıldı.** Programın en sık kilidi iki tık ve bir hover uzaktaydı, ve
`program.spec.ts` 86'nın üç testi onu düz menüde arıyordu. Üst düzeye geri alındı.

### 2026-08-30 · Program şeridinin sırası

**Değişen.** `Görünüm · Diz · Program` solda, boşluktan sonra `Renk · Yoğunluk ·
Izgara`. Program kitaplığı ve ızgara işlemleri birer menü. **Eski hâli.** Kitaplık
bir tur şeridin başına girip Görünüm'ü sağa itmişti. **Gerekçe.** Kullanıcı:
*"öğretmen ve sınıftan seçimleri en solda eski yerinde olmalı"*. Menüler bir
ölçümden: eşit sütunlu bir grupta üç uzun kelime en uzununun üç katı, ve %150'de
şerit 1920 px'lik kutuda 2061 px istiyordu, iki düğme tıklanamaz kalıyordu. Menüye
inince 1717 px.

### 2026-08-30 · Havuz başlıklı gruplar, sıra ve süzgeç

**Değişen.** Havuzun kartları başlıklı gruplarda duruyor ve başlık seçilen
sıralamadan türüyor. Beş sıralama ve bir branş süzgeci var, ikisi de `toolState.ts`'te
bir pozisyon olarak. **Gerekçe.** Kullanıcı: *"kartlar havuzdayken ayrım daha bir
güzel ve hoş olsun"*. Süzülünce tepsinin başlığı neyi sakladığını söylüyor, yoksa
"hepsi yerleşti" bir tık ötede yalan olurdu. Başlık kartların üstünden yanına
alındı, çünkü üstteyken kısa ekranda tek kart satırını kırpıyordu (tuzak 100).

### 2026-08-30 · Müsaitlik satırları uzadı

**Değişen.** Boyanan müsaitlik ızgarasının satırları uzadı, "haftanın darlığı" ısı
tablosu eski boyunda kaldı. **Gerekçe.** Kullanıcı: *"müsaitlik programlarının
satırlarını uzat"*. Isı tablosu bir müsaitlik programı değil, tıklanacak hücresi
yok. Sayfanın dikey taşması iki ölçekte de 0 ölçüldü.

### 2026-08-30 · Varlık paneli düzenliyor

**Değişen.** Öğretmen, sınıf ve derslik paneli (`Inspector.tsx`) yalnız
göstermiyor, düzenliyor da: her kutu Okul listesinin kutusuyla aynı fonksiyona
bağlı. Yeni olan kontrol değil yol: ızgaranın satır başı, kartın sağ tık menüsü ve
komut paleti oraya çıkıyor, ve `Öğretmeni düzenle` ile `Sınıfı düzenle` ızgaranın
çizilmediği eksene ulaşmanın tek yolu.

### 2026-08-29 · Tauri kimliği geri alındı

**Değişen.** `identifier` `me.mozaik.arac`'tan `com.dersprogrami.arac`'a geri alındı
ve "değişmeyen kimlikler" listesine girdi. **Eski hâli.** v2.0.0 kimliği programın
yeni adıyla birlikte değiştirmişti. **Gerekçe.** Kimlik WebView2 profilinin yolu,
yani localStorage'ın durduğu yer: o exe planları diskte bırakıp boş açılıyordu
(tuzak 95). Yayınlanmış v2.0.0 varlığı bu kusuru taşıdı, düzeltme 2.0.1 ile gitti.

### 2026-08-29 · Program Mozaik adını aldı

**Değişen.** Programın adı Mozaik, tek kaynağı `APP_NAME`. **Değişmeyen.**
localStorage anahtarları, yedek dosya adları, `Belgelerim\Ders Programı` klasörü ve
Tauri kimliği eski adla kaldı, çünkü bunlar veri ([DATA.md](DATA.md)). Kurulum
yolunda eski adla duran kısayol siliniyor, eski klasör yalnız söyleniyor. CLAUDE.md
bu bölümü 2026-08-28 tarihiyle, TODO ise işi 2026-08-29'da bitmiş olarak yazıyor.

### 2026-08-29 · Ekleme kendi bloğu, sağ rayda kayan şey liste

**Değişen.** Beş liste ekranının her biri iki kardeş panel oldu: bir ekleme paneli
ve sayılı başlıklı liste paneli. Sıra değişmedi. Aynı gün sağ rayda kayan şey
panelden içindeki listeye indi. **Eski hâli.** Ekleme ile liste arasındaki ayrım
tek bir çizgiydi, ve bir tur boyunca kaydırma çubuğu paneldeydi. **Gerekçe.**
Kullanıcı: *"aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın"*,
*"ama yerleri değişmesin"*, ve *"özet kutusu değil içindeki liste"*.

### 2026-08-29 · Sol tık taşır, sağ tık menü açar

**Değişen.** Sol düğmeyle sürüklemek taşır, sağ tık menü açar, Delete havuza
gönderir. **Eski hâli.** Yerleşmiş bir derse sol tıklamak bloğu siliyordu, taşımanın
tek yolu silip havuzdan yeniden sürüklemekti.

### 2026-08-28 · Türkçe tek dil değil kaynak dil

**Değişen.** İlke 4 yeniden yazıldı: beş dil konuşuluyor, anahtar Türkçe cümlenin
kendisi. O gün sözlük 786 anahtar × 4 dil olarak tamamlandı. **Eski hâli.** *"Tek
dil. i18n altyapısı yok, string dosyası yok, doğrudan Türkçe yazılır."* Bu cümle
altyapı v2.0.0'da kurulduktan sonra iki sürüm boyunca yanlıştı. **Değişmeyen üç
şey.** JSX Türkçe okunur, eksik çeviri doğru Türkçeye düşer, State'e giren metin
çevrilmez.

### 2026-08-28 · Varsayılan dil cihazın dili

**Değişen.** İlk açılışta `navigator.language`'ın ilk parçası beş dilden biriyse o
seçiliyor, değilse İngilizce (commit `a1f3c1a`). **Eski hâli.** Bir tur boyunca
yedek dil Türkçeydi, çünkü tamamlanmış tek dil oydu. **Gerekçe.** Beş sözlük
tamamlanınca yedek, en çok kişinin okuyabildiği dil oldu. E2E süiti `kapan.ts`'te
Türkçeye sabitli.

### 2026-08-28 · İki sekme ve bir bölüm yeniden adlandırıldı

**Değişen.** `Kurulum` sekmesi `Okul`, `Yazdır` sekmesi `Çıktı`, Ayarlar'ın
`Okul ve zil` bölümü `Zil ve günler` oldu. **Gerekçe.** İlk ilkenin ilk cümlesi o gün
"kurulum yok"tu ve ilk sekmenin adı Kurulum'du, üstelik o sekme okulun dört
listesini tutuyordu. `Yazdır` adlar arasındaki tek fiildi. Üçüncüsü zorunluydu: bir
düğme adı üç piksel ötedeki sekmenin adını taşıyamıyor (tuzak 49 ve 74).

### 2026-08-28 · Branşlar Okul'a, Ayarlar beş bölüm

**Değişen.** Branşlar Ayarlar'dan Okul'un dört listesinden biri oldu. Ayarlar beş
bölüme indi: `Zil ve günler · Kurallar · Görünüm · Planlar ve yedek · Hakkında`.
Okul listelerinin önündeki sıra numaraları kalktı. Yeni bir proje boş branş
listesiyle doğuyor, gömülü branşlar bir teklif panelinde duruyor. "Kurulum durumu"
paneli silindi. **Gerekçe.** Branş eklemek, yarısı yazılmış bir öğretmeni bırakıp
bir sekme öteye gitmek demekti. Liste sırası bağımlılık zinciri: sınıf bir dersliği
gösterir, öğretmen listeden branş seçer. Sıra numaraları kimsenin saymadığı bir
sırayı sayıyordu, çünkü her liste her an açık (kullanıcı isteği). Tohumlanmış
branş listesinde teklif paneli her yeni projede boştu, yani işe yaradığı tek ekranda
işe yaramıyordu. `Program hakkında` adı alınmadı, çünkü `Program` sorgusuna da cevap
verirdi.

### 2026-08-28 · Denendi: Kontrol şeridinde süzgeç

**Denenen.** 2026-08-27'de Kontrol'e şerit gelince şerit raporu süzüyordu:
`Hepsi · Sorunlar · Kapasite`. **Neden bırakıldı.** Okuyanın hükmü "üçü de gereksiz
gibi" idi ve büyük ölçüde doğruydu: herkesin baktığı panel üçünde de vardı, yani
iki düğme yalnız bir şeyleri kaldırıyordu. Rapor tek sayfa oldu, şerit süzmüyor,
götürüyor.

### 2026-08-28 · Deste rozeti kalktı, üst çubukta sade işaret

**Değişen.** Havuzda aynı dersin aynı boydaki bloklarını gösteren destenin sayı
rozeti kalktı (kullanıcı isteği). Sayı kaybolmadı: `data-count`'ta, kartın
`title`'ında ve tepsinin başındaki "N blok bekliyor"da. Üst çubuktaki marka işareti
sade çizime geçti, çünkü o boyda ayrıntılı çizimin eşiğinin altında.

### 2026-08-27 · Güncelleme söyleniyor, zorlanmıyor

**Netleştirildi.** "Güncelleme yok" zorlanan güncelleme yok demek. Site yolunda
program yeni sürümün geldiğini söyler: `Yenile` denene kadar hiçbir şey değişmez,
`Sonra` denince o oturumda bir daha sorulmaz. **Gerekçe.** Söylenmeyen bir güncelleme
başka bir şeyi bozuyordu: baba bir kusur bildiriyor, düzeltiliyor, ve düzeltmenin ona
ulaşıp ulaşmadığını iki taraf da göremiyordu. Yasaklanan şey kendiliğinden değişen
bir arayüz, kapatılamayan bir bildirim ve sürüm soran bir açılış ekranıydı.

**Genişletildi.** Exe kendini güncelleyebilir, ağa yalnız tıklanınca çıkarak, ve
üç ayrı düğmeyle (`Denetle`, `İndir`, `Şimdi yeniden başlat`) çünkü üçü üç ayrı
karar. `kur.ps1`'deki gerekçe: ilke çalışan programın kendisi hakkındadır, çalışan
sayfa hiçbir yere bağlanmaz, bir güncelleme bağlanır çünkü işi budur.

### 2026-08-27 · Tema varsayılanı açık, sistemi izlemiyor

**Değişen.** `normalizeTheme` artık `prefersDark` almıyor. **Eski hâli.** İlk açılış
sistemin koyu temasını izliyordu. **Gerekçe.** İşlevsel renkler açık zeminde seçildi
ve orada ölçüldü, koyu bilerek yapılan bir seçim. Hareket ayarının tersi ve fark
bilerek: makinesinde "hareketi azalt" diyen biri bir ihtiyaç bildiriyor, koyu tema
diyen biri bir zevk.

### 2026-08-27 · Ekranda uzun çizgi yok

**Değişen.** Arayüz metninde `—` kullanılmıyor, yerine dört kural geçiyor
([CONVENTIONS.md](CONVENTIONS.md)). Kullanıcı isteği.

### 2026-08-27 · Çift branş, alt branş değil

**Değişen.** Bir öğretmenin iki branşı olabilir (`subject2`), dersin hangisinden
olduğu bir bayrak (`Lesson.second`), şema v8. **Gerekçe.** "Alt branş mı çift branş
mı" diye soruldu ve kullanıcının ikinci örneği kararı verdi: "Matematik 1 /
Matematik 2" bir hiyerarşiyle anlatılabilir, "Türkçe ve Edebiyat" anlatılamaz. Bir
ağaç istenen vakaların yarısını çözer ve branş listesine ikinci bir veri şekli
sokardı. Branşın adı değil bayrak saklanıyor, çünkü ad öğretmenin branşı
düzeltilince sessizce saparak ikinci bir gerçek olurdu.

### 2026-08-27 · Dersler kendi sekmesi

**Değişen.** Dersler Kurulum'un dördüncü adımından çıkıp yedinci sekme oldu.
**Gerekçe.** Kullanıcı: *"hocaları onu bunu ayarlıyorsun ama ders en önemli kısım"*.
En çok kullanılan ekrana bir sihirbazın dördüncü adımından geçilerek varılmıyor.

### 2026-08-27 · Şerit yedi sekmede ve bir standardı var

**Değişen.** Araç şeridi yedi sekmenin yedisinde çiziliyor ve beş maddelik bir
şekli var ([LAYOUT.md](LAYOUT.md)). **Eski hâli.** Beş şerit beş ayrı nesneydi
(biri simgeli ama başlıksız, ikisi salt yazı) ve Kontrol'de şerit hiç çizilmiyordu,
gerekçesi "okunan bir rapor, ona yapılacak bir şey yok"tu. **Gerekçe.** Şekli olmayan
bir şeyi hiçbir test koruyamaz. Kontrol'ün şeritsiz olması içerik açısından
doğruydu, ekran açısından değildi: şeridin yüksekliği sekmeyle gelip gittiği için
Kontrol'e her girişte altındaki her şey 45 px zıplıyordu.

### 2026-08-27 · Havuzda blok başına kart ve deste

**Değişen.** Havuzda ders başına değil blok başına kart var (`2+1` bir ders bir
ikili ve bir tekli bırakır), ve aynı dersin aynı boydaki blokları tek deste oluyor.
**Eski hâli.** Altı saatlik bir ders altı özdeş kart ve altı kez aynı `0/6`
bırakıyordu. **Yan fayda.** Haftalık saati elle aşmak imkânsızlaştı, kart bitince
sürüklenecek bir şey kalmıyor.

### 2026-08-27 · Branşlar elle sıralanıyor, bölüm renk tekerleği dolu

**Değişen.** Branşlar Okul'un öteki listeleriyle aynı tutamakla sıralanıyor ve
Öğretmenler'deki branş listesi bu sırada geliyor. Yedinci sekme yedinci bir bölüm
rengi isteyince çember iki temada tarandı ve serbest kalan her yayın ya işlevsel
bir rengin ya komşu bir sekmenin ailesine düştüğü ölçüldü. Sekizinci bir renk
aranırsa aynı ölçüm tekrarlanır.

### 2026-08-27 · İkon eşiği aynı gün iki kez taşındı

**Değişen.** Sade çizimin eşiği önce 48'den 32'ye, sonra 32'den 20'ye indi ve
`.ico`'ya 20, 24 ve 40 px eklendi. **Gerekçe.** Görev çubuğundaki işaret için
"eksik pikselli küçük logo" şikayeti, ve Windows'un %125'te 40, küçük düğmelerde
24 px istediği. İki taşıma da görev çubuğunun hangi boyu istediğini tahmin ederek
yapıldı (tuzak 78). Eşik 2026-08-30'da 32'ye, 2026-09-01'de yeniden 20'ye taşındı.

### 2026-08-26 · Dört yasak kalktı

**Değişen.** Animasyon, web font, bağımlılık ve tasarım sistemi yasakları kaldırıldı.
Animasyonun yerine kural gelmedi, tek şart `prefers-reduced-motion: reduce` ile
hepsinin kapanması. Web font serbest, şartı tek dosyaya gömülmesi. Bağımlılıkta tek
ölçüt gömülebilir ve ağsız olması, sabit bir KB tavanı yok ve eski 420 KB sınırı da
kalktı. Tasarım sistemi kısıtları (merdivenler, sayı sınırları) silindi. "Hedef
makine yavaş" bir gerekçe olmaktan çıkıp ölçülecek bir varsayım oldu.

**Eski hâli.** Tailwind, Radix, ikon ve animasyon kütüphaneleri "bağımlılık"
gerekçesiyle reddedilmişti. Tasarım bölümü tek tek gerekçeli ama toplamı yeni bir
arayüz yazmayı imkânsız kılan bir kural kümesiydi. **Gerekçe.** Kullanıcı kararı.
O gün Radix'in diyalog ve menü paketleri ile `lucide-react` alındı, maliyetleri
ölçüldü (WORKLOG).

### 2026-08-26 · Denendi: `motion`, ve alınmayan iki paket

**Denenen.** `motion` kuruldu ve ölçüldü: +127,2 KB. Karşılığında verdiği tek şey
CSS'in yapamadığı `layoutId` paylaşımlı geçişiydi, ve aynı işi tarayıcının
`document.startViewTransition()`'ı bedava yapıyor. **Neden bırakıldı.** Kullanılmayan
şey için ödeme. Tarayıcının kendi araçlarının `file://` altında Chromium'da var
olduğu ölçüldü: `startViewTransition`, `@starting-style`,
`transition-behavior: allow-discrete`, `oklch()`, `color-mix()`, `backdrop-filter`,
`position-anchor`.

**Tailwind alınmadı.** `src/styles.css` zaten olgun bir token katmanı, taşımanın
görsel getirisi sıfır.

**Radix Toast alınmadı.** Ölçülen maliyeti +19,6 KB'tı ve olan biteni söyleyen
satırlar bir eylem taşımıyor, `Toasts.tsx` elle yazıldı.

### 2026-08-26 · Denendi: sekme geçişini `startViewTransition` ile sarmak

**Denenen.** Sekme geçişi `document.startViewTransition()` ile sarıldı. **Sonuç.**
Tarayıcı yakaladığı öğeyi bir anlık görüntüyle değiştiriyor ve anlık görüntü
tıklanamıyor: `elementFromPoint` ızgaranın üstünde 553 ms boyunca `<html>` döndürdü,
yani geçişten sonraki yarım saniyede kapılan kart hiçbir yere düşmüyordu.
**Neden bırakıldı.** API'nin tek eşsiz getirisi paylaşımlı öğe geçişi, ortada olan
ise bir çapraz geçiş. `<main>`'e `key={tab}` ve `@starting-style` ile ızgaranın
tıklanabilir olması 68 ms'e indi (tuzak 55).

### 2026-08-26 · Yerel statik sunucu

**Daraltıldı.** Sunucu yok ilkesinin dışında bırakılan şeye babanın makinesinde koşan
küçük bir dosya sunucusu da girdi (`kurulum/sunucu.ps1`,
`dersprogrami.localhost:7654`). Backend, veritabanı, hesap, oturum ve API yok. Çift
tıklanan `dist/index.html` asıl teslim yolu olarak kaldı. **Gerekçe bir kez yanlış
yazıldı.** İlk hâli "`file://` güvenli bağlam değildir, orada `showDirectoryPicker`
tanımlı bile değildir" diyordu, Chromium'da ikisi de yanlış çıktı. `file://`'ın eksiği
bir köken: service worker yok, programa ait bir depo yok, izin tek bir siteye
saklanamıyor. Yani sunucu klasör özelliğinin tek evi değil, daha iyi evi (tuzak 65).

### 2026-08-26 · Görsel regresyon ve düzen testleri kaldırıldı

**Değişen.** Piksel referanslı görsel regresyon katmanı ve düzen geometrisi ölçen
testler silindi, erişilebilirlik ölçümleri kaldı. Kullanıcı kararı. Yerine
bir şey iddia etmeyen, bakılmak için görüntü üreten `npm run ekran` kaldı.

### 2026-08-26 · Program ekranı ve kâğıt kararları

- **Dolu bir hücreye bırakılabilir.** `dropMap()` tek bir reddi geçersiz kılar: sınıfın kendi başka dersi, o ders havuza döner. Öteki retler başkasıyla ilgili ve önündeki bloğu atmak onları doğru yapmıyor. Hücre yeşil değil sarı, çünkü izin var ama bir şey kaybediliyor. Bütün hamle tek geri al adımı.
- **Müsaitlik'te kapalı saat büyük kırmızı bir çarpı.** Program ızgarasında kırmızı "bu bırakma reddedildi" demek, ama Müsaitlik'te ne bırakma ne ret var ve ekranın söylediği tek şey açık ya da kapalı. Tarama da duruyor, renk tek başına bir durum taşımıyor.
- **Önizleme kâğıdın kendisi.** Eskiden 62rem genişliğinde bir modeldi ve satırları ekran merdiveninden alırken yazıcı 23 mm kullanıyordu. Ölçülen fark önizlemede ~30 px, kâğıtta 86,93 px, yani basılacak şey bir çizimden seçiliyordu.
- **Bir A4'e 1, 2 ya da 4 program**, ve kâğıttaki yazı boyutu ayrı bir ayar.
- **Öğretmen sayfasında hücreyi sınıf rengi boyar.** Bir öğretmenin kendi sayfasında her dolu hücre zaten o öğretmen, on iki hücre aynı pasteli boyayıp hiçbir şey söylemez.
- **Kapalı saat kâğıda çıkmıyor.** Duvara asılan kâğıt "saat 10:40'ta neredeyim" sorusuna cevap verir, çarpı kimsenin kâğıdı eline alıp sormadığı bir sorunun cevabı.
- **Uyuşmayan sütunda saat boş bırakılmıyor.** Bir ders numarası günlere göre farklı saatlere düşüyorsa başlık iki grubu gün aralığıyla yazıyor. Eski kural "yanlış saat yazmaktansa hiç yazma"ydı ve boş sütun bir kusur olarak okundu. Tarih git geçmişinden: bugünkü davranışı üreten `periodGroups()` bu tarihte eklendi (`5fe8d64`), ve kod bugün iki grubu yazıyor (`Print.tsx`).
- **"Nereye kaydedilsin".** Seçilen bir klasöre bütün planlar ve günlük bir yedek yazılıyor. Yedekler ad kalıbıyla budanıyor, sayılarak değil, çünkü klasör Belgelerim ve orada babanın kendi dosyaları duruyor.
- **Marka işareti üst çubukta.** Düğme değil, `aria-hidden`, ve satır içi SVG, çünkü dosya dışarıdan bir şey istemiyor.

### 2026-08-25 · Sekmeler üstte, çift bar

**Değişen.** Soldaki ray kalktı, sekmeler üstte, altında o sekmenin araç şeridi.
**Eski hâli.** Rayın savı "yatay bant ızgaradan bir satır götürür"dü. **Gerekçe.**
O sav 768 px'lik ekran için yazılmıştı ve rayın kendi maliyeti hiç sayılmamıştı: her
sekmede 92 px genişlik, ve Program dışındaki sekmelerin harcayacak genişliği yok.
Ölçülen baş toplamı raylı düzende 139 px, çift barda 116 px.

### 2026-08-25 · Statik yayın

**Netleştirildi.** Sunucu yok ilkesi statik bir yayını dışarıda bırakıyor: GitHub
Pages'te duran site. Backend, veritabanı, hesap, oturum ve API yok, CDN'den bayt
çekilmiyor, sayfa ilk açılıştan sonra bağlantısız çalışıyor.

### 2026-08-25 · Ayrı planlar, sürüm ağacı değil

**Daraltıldı.** "Birden çok program sürümünü yan yana tutma" yasağı "aynı planın
sürüm ağacı" yasağına daraltıldı. **Gerekçe.** Yasaklanan şey "geçen salı neye
benziyordu" sorusuna cevap veren, dallanan, kimsenin bakmadığı bir geçmişti. Babanın
istediği ayrı planlardı: aralarında geçilen ve teki seçilen. `library.ts` ile
uygulandı, plan kimliği State'e konmadı, şema değişmedi. Bu kayıt 2026-08-30'dan
beri tarihsel.

### 2026-08-25 · Havuz alta döndü

**Değişen.** Havuz ızgaranın altında ve boyu sürüklenebilir, bırakılan boy
hatırlanıyor. O günkü kayıt havuzun boşalınca kendiliğinden kapandığını da
yazıyordu (gerekçesi: boş bir tepsi yeri hiçbir şey için tutar), 2026-09-11'de
kodda bunu yapan bir yer bulunamadı. **Eski hâli.** Bir sürüm havuz sağda durdu
(tarihi kayıtlı değil). Sağın savı "ızgara yatayda zaten taşıyor"du ve doğruydu, ama
havuzu üç kart genişliğinde bir sütuna çeviriyordu: 99 bekleyen ders görülen bir
tepsi değil kaydırılan bir liste oluyordu. Altı daha önce imkânsız kılan şey
başkasının seçtiği sabit bir yükseklikti (215 px, 25 öğretmenin altısı).

### 2026-08-25 · Denendi: çözücüde simetri kırması

**Denenen.** "Aynı dersin blokları artan hücre indisinde" kısıtlaması, arama uzayını
daraltmak için. **Sonuç.** "Haftaya yay" sezgisi geç bir hücre seçince dersin kalan
blokları oradan sonrasına hapsoldu: 57718 düğümde 26 blok, kaldırılınca 359 düğümde
359 blok. **Neden bırakıldı.** Teoride doğru olan, ölçülmeden konmaz (tuzak 21).

### 2026-08-25 · Denendi: otomatik dizmeyi Web Worker'da koşmak

**Denenen.** TODO'da otomatik dizme bir Web Worker'da planlıydı. **Neden bırakıldı.**
İki bağımsız sebep: Vite worker'ı ayrı bir chunk olarak üretir ve
`vite-plugin-singlefile` onu gömmez, kalan `blob:` yolu `file://`'in opak kökeninde
Chromium'da güvenilmez ve kaynağı `tsc`'den geçmez. Çözücü ana iş parçacığında
dilim dilim koşuyor (tuzak 19).

### 2026-08-24 · Karanlık mod ve tema seçimi yasaktan çıktı

**Değişen.** Tema seçimi serbest oldu ve v0.7'de uygulandı, tercih
`localStorage['ders-programi-tema']`'da duruyor. **Gerekçe.** Zevk değil: Brave ve
Chrome açık temalı sayfayı kendi algoritmalarıyla zorla karartıyor ve yeşil, sarı,
kırmızı geri bildirim renkleri çamurlaşıyordu. Kontrolü almak tarayıcıya bırakmaktan
daha az karmaşaydı.

### 2026-08-24 · Sürükleme elle, Pointer Events ile

**Karar.** Sürükle bırak bir kütüphaneyle değil `src/drag.ts`'te Pointer Events ile
yazıldı. **Gerekçe.** HTML5 drag-and-drop ile sürükleme sırasındaki bir yeniden
çizim sürüklemeyi koparıyor (tuzak 1), ve bu bir kütüphaneyle de çözülmüyordu.
Hazır çözümün sorulan üç sorusuna o günkü cevap buydu ([CONVENTIONS.md](CONVENTIONS.md)).

---

## Tarihi kayıtlı olmayan kararlar

- **`Sıfırla` üst çubuktan Ayarlar'a taşındı.** Üst çubukta "Dosyadan aç"a bir yanlış tıklama uzaklıktaydı ve geri alınamıyordu. `Dosyaya kaydet` ve `Dosyadan aç` üst çubukta kaldı, çünkü veri kaybına karşı önlemin görünür olması gerekiyor.
- **Örnek veri Ayarlar'a taşındı.** Tek evi Kurulum'du ve ancak boş bir projeyle ulaşılabiliyordu, yani kendi verisine başlamış biri örneğe bir daha bakamıyordu. Kurulum'da yalnız ilk kullanımda tek satırlık bir teklif kaldı.
- **Görünüm düğmeleri önce yalnız simgeydi.** Bir tur `aria-label`'lı yazısız iki simge düğmesi olarak durdular, şerit standardıyla (2026-08-27) simge ve kelime taşımaya başladılar.
