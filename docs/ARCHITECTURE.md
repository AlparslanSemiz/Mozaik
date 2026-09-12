# Mimari

Kodun katmanları, her dosyanın görevi ve katmanlar arasındaki sınırlar.

## Üç katman

Kod üç katmana ayrılıyor ve bağımlılık yalnız aşağı doğru akıyor.

```
yapraklar          types · keys · palette · i18n · names · subjects · blocks · version
   |
saf mantık         constraints · rules · feasibility · bell · import · entities · solver
                   programs · programMask · listview · library · bundle · sample
   |
durum ve tesisat   store · libraryStore · storageReport · theme · toolState · printOptions
                   programColor · changelog · folder · desktop · update
                   drag · gridChrome · poolSplit · rowDrag · scrollFade · ribbonScroll
                   useSolver · useFolder
   |
bileşenler         App · components/*
```

**Saf mantık** React, DOM ve localStorage bilmez. Her dışa aktarılan fonksiyonu
tarayıcı olmadan test edilebilir, ve sürükleme, çözücü ve Kontrol aynı
fonksiyonları çağırdığı için bir kural sürüklerken başka, otomatik dizerken
başka anlama gelemez.

**Durum ve tesisat** saf mantığı tarayıcıya bağlar: localStorage, IndexedDB, Tauri
köprüsü, doğrudan DOM'a yazan etkileşimler, ve saf modülleri React'ten süren
kancalar.

**Bileşenler** çizer ve olay yakalar. Bir `.tsx` dosyasında çakışma hesabı
görülüyorsa yanlış yerdedir ve `constraints.ts`'e taşınır.

## Dosya haritası

Yollar `src/`'ye göre. Test dosyaları (`*.test.ts`) ve dört çeviri sözlüğü
(`lang/*.ts`) listede yok.

### Yapraklar

Uygulamanın başka bir modülünü çalışma zamanında import etmezler ya da yalnız
`import type` alırlar. İki modülün ortak ihtiyacı, ikisinin de altında bir
yaprakta durur.

| Dosya | Görevi |
|---|---|
| `leaf/types.ts` | veri modeli: tipler ve `SCHEMA_VERSION`, mantık yok |
| `leaf/keys.ts` | sözlük anahtarları, `constraints.ts` ile `rules.ts` birbirini import etmesin diye |
| `leaf/palette.ts` | kimlik paleti ve kullanılmayan en küçük rengi veren `firstFreeColor` |
| `leaf/i18n.ts` | aktif dil, çıplak `t()`, çoğul seçimi. Uygulamadan yalnız tercih fabrikasını ve `preferenceKeys.ts`'i import eder, ikisi de altındaki yapraklar |
| `leaf/preferenceKeys.ts` | her makine tercihinin localStorage anahtarı ve "Veriler nerede" tablosundaki adı, tablonun sırasıyla |
| `leaf/names.ts` | programın kendi koyduğu gün ve branş adlarının ekranda nasıl okunduğu |
| `leaf/subjects.ts` | bir şeyin hangi branştan olduğu |
| `leaf/blocks.ts` | bir dersin haftasının bloklara nasıl bölündüğü, `clampBlocks` |
| `leaf/version.ts` | hangi derleme (`__SURUM__`) ve programın adı (`APP_NAME`) |
| `leaf/raw.d.ts` | Vite'ın `?raw` importunun tip bildirimi |

### Saf mantık

| Dosya | Görevi |
|---|---|
| `pure/constraints.ts` | kısıt motoru: `blocker`, `blockerDetail`, `check`, `dropMap`, `placedBlocks`, `occupy` ve `vacate`, `closedConflicts`, `removeBlock` ve `liftBlock` |
| `pure/rules.ts` | ayarlanabilir kurallar: katmanlı sınırın çözümü (`lessonLimit`), boşluk sayımı (`gapsBetween`), `findViolations` |
| `pure/feasibility.ts` | programın neden dizilemediği: kapasite raporu, sağlık özeti, Danışman (`buildAdvice`) |
| `pure/bell.ts` | zil saatleri ve bir ders numarasının günlere göre saat grupları (`periodGroups`) |
| `pure/import.ts` | Excel'den yapıştırılan satırların ayrıştırıcısı |
| `pure/entities.ts` | ekleme, güncelleme, silme, `sanitize`, `remapDays` |
| `pure/solver.ts` | otomatik dizme, kendi kısıt mantığı yok |
| `pure/programs.ts` | bir planın içindeki program alternatifleri ve açık olanı |
| `pure/programMask.ts` | geçici görünüm: soluklaştırılan ya da gizlenen satır ve günler, çözücünün dışarıda bıraktıkları |
| `pure/listview.ts` | ara, sırala, süz: Türkçe katlama (`fold`), Türk alfabesi sırası (`compareTr`), elle sıralamanın açık olduğu durum (`canReorder`) |
| `pure/library.ts` | plan kitaplığının saf modeli: anahtarlar, plan üstverisi, bozuk dizin kuralları (`normalizeLibrary`) ve indirilen dosya adları. Depoya dokunmaz |
| `pure/bundle.ts` | bütün planları tek dosyada taşıyan zarf |
| `pure/sample.ts` | babanın ölçeğine yakın örnek okul |

### Durum, tercih ve depolama

| Dosya | Görevi |
|---|---|
| `platform/store.ts` | reducer, geri al yığını, gecikmeli otomatik kayıt, oturum yedekleri, `parseState` ve göç, plan geçişi |
| `platform/libraryStore.ts` | plan kitaplığının localStorage tarafı, ham string alıp verir |
| `platform/storageReport.ts` | "Veriler nerede": hangi kopya, hangi depo, ve her anahtar boyutuyla. Anahtarları `library.ts` ile `preferenceKeys.ts`'ten TÜRETİR |
| `leaf/preference.ts` | makine tercihleri fabrikası: oku, normalize et, sakla, `<html>`'e yaz. Sözleşmesi: `apply` `<html>`'e depodan önce yazar, kayıt yoksa yedek okuma anında sorulur, `normalize` iki tipi de kabul eder |
| `platform/theme.ts` | makine tercihleri: tema, havuz ve boyu, şerit ve kaydırınca gizlenmesi, ölçek, iki yoğunluk, müsaitlik saati, hareket, tanıtım satırı, hepsi `preference.ts` fabrikasından |
| `platform/toolState.ts` | her sekmede nerede olunduğu: görünüm, bölüm, Dersler'in modu ve odağı, havuzun sırası ve süzgeci (`poolSort`, `poolFilter`) |
| `platform/printOptions.ts` | kâğıtta ne olsun: tek kayıt, tek anahtar |
| `platform/programColor.ts` | Program kartlarını hangi varlığın rengi boyuyor |
| `platform/changelog.ts` | Yenilikler panelinin sürüm notları ve görülen sürüm |
| `platform/folder.ts` | kullanıcının seçtiği klasör: dosya adları, günlük yedek, budama |
| `platform/desktop.ts` | exe köprüsü: Tauri komutlarını bir `FileSystemDirectoryHandle` kılığına sokar, güncelleme komutları |
| `platform/update.ts` | bu kopyanın nasıl güncellendiği (`sw`, `exe`, `yok`) ve sitenin adresi (`SITE_ADRESI`) |

### Doğrudan DOM'a yazan modüller

| Dosya | Görevi |
|---|---|
| `platform/drag.ts` | sürükle bırak, Pointer Events ile. Bir kanca (`useDrag`), yani listedeki tek React'li dosya |
| `platform/gridChrome.ts` | imleç haçı ve yapışkan başlığın gölgesi |
| `platform/poolSplit.ts` | havuz çekmecesinin boy tutamağı |
| `platform/rowDrag.ts` | liste satırını sürükleyerek sıralama |
| `platform/scrollFade.ts` | kayan bir kutunun üstünde ya da altında içerik olduğunu söyleyen sündürme |
| `platform/ribbonScroll.ts` | şeridin okurken çekilip yukarı bakınca geri gelmesi |

### React köprüleri ve kabuk

| Dosya | Görevi |
|---|---|
| `platform/useSolver.ts` | çözücüyü `requestAnimationFrame` dilimleriyle sürer |
| `platform/useFolder.ts` | `folder.ts`'i sürer ve bütün planları yazar |
| `main.tsx` | ilk boyamadan önce tercihleri ve dili `<html>`'e yazar, ağacı bağlar |
| `Root.tsx` | provider yığını, `main.tsx` ile `App.test.tsx` aynı ağacı çizsin diye |
| `App.tsx` | kabuk: sekmeler, üst çubuk, uzun ömürlü durum, klavye kısayolları |

### Bileşenler

| Dosya | Görevi |
|---|---|
| `components/Ribbon.tsx` | sekmeye göre araç şeridi, iş mantığı yok |
| `components/Dialogs.tsx` | programın sorduğu her soru: `useDialogs()` ile `confirm` ve `alert` |
| `components/Toasts.tsx` | olan biteni söyleyen kısa satır |
| `components/Inspector.tsx` | varlık paneli: bir öğretmen, sınıf ya da dersliğin haftası ve düzenlenmesi |
| `components/LessonEdit.tsx` | bir dersi ızgaradan ayrılmadan düzenler |
| `components/Palette.tsx` | Ctrl+K kutusu |
| `components/Commands.tsx` | paletin komut listesi |
| `components/ShortcutsHelp.tsx` | klavye kısayolları ekranı |
| `components/T.tsx` | `useT()` ve `<T>` |
| `components/setup/` | Okul: `index.tsx` kabuk, `Rooms`, `Subjects`, `Teachers`, `Classes`, `Paste`, `Summary`, `loadStatusFacet` |
| `components/lessons/index.tsx` | Dersler |
| `components/Availability.tsx` | Müsaitlik |
| `components/Program.tsx` | Program: ızgara, havuz, sürükleme ve sağ tık menüsü bir arada |
| `components/Grid.tsx` | ana ızgara, satır başına memo |
| `components/LessonPool.tsx` | havuz |
| `components/Check.tsx` | Kontrol |
| `components/Print.tsx` | Çıktı ve kâğıt |
| `components/settings/` | Ayarlar: `index.tsx` kabuk, `School` (Zil ve günler), `Rules` (Kurallar), `Appearance` (Görünüm), `Data` (Planlar ve yedek ile Hakkında), `Plans` |
| `components/AddPanel.tsx` | ekleme bloğunun başlığı ve tek cümlelik açıklaması |
| `components/BlockCounts.tsx` | dağılım seçici, iki ekranda kullanılıyor |
| `components/CapacityRows.tsx` | kapasite tablosu, Özet ve Kontrol aynı çizimi kullanıyor |
| `components/ColorPick.tsx` | renk seçme diyaloğu |
| `components/DraftStart.tsx` | "Taslaktan başla", iki ekrandan açılır |
| `components/Field.tsx` | etiketli kontrol |
| `components/LimitBox.tsx` | boşken bir üst katmanın sayısını gösteren sınır kutusu |
| `components/ListTools.tsx` | listelerin üstündeki ara, sırala ve süz şeridi |
| `components/useRowOrder.tsx` | listelerin ortak elle sıralama kancası |
| `components/useSample.ts` | örnek okulu yükleme sorusu |
| `components/steps.tsx` | Okul'un dört listesinin tek tanımı ve varlık simgeleri (`KIND_ICON`) |
| `components/props.ts` | panellerin ortak prop'ları (`PanelProps`) |

### Yalnız testler için

| Dosya | Görevi |
|---|---|
| `worlds.ts` | dünya üreteci (`makeWorld`, `WORLDS`) ve dizilmiş programı denetleyen `illegalBlocks` |

`worlds.ts` `src/` altında, çünkü `tsconfig.json` yalnız `src`'yi kapsıyor ve
başka yerde duran bir dünya `tsc`'den hiç geçmezdi. Uygulama onu import etmediği
için Vite budar, `dist/index.html`'e girmez.

## Sınır kuralları

### İş mantığı bileşende durmaz

Çakışma, sınır, kapasite ya da blok hesabı saf mantık katmanında yazılır.
`Ribbon.tsx`'teki "Otomatik diz (N)"in N'i `entities.ts`'teki saf bir fonksiyondan,
Kontrol'ün sayıları `feasibility.ts`'ten gelir. Havuzun hesabı `App`'e
çıkarılmaz, çünkü `Grid`'in memo sınırını deler.

### Hangi dosyaların testi var

`constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts` ve `blocks.ts` içindeki her dışa aktarılan fonksiyonun
testi var, ve bu dosyalara özellik testiyle birlikte eklenir. `store.ts`'teki
`parseState` ve `entities.ts`'teki `remapDays` de test ediliyor: ilkinden her yedek
dosyası geçer, ikincisi gün listesi değişince programın kaymasını engelleyen tek
şey (tuzak 11).

### State'te ne durur

State okulun kendisini tutar: ayarlar, derslikler, branşlar, öğretmenler,
sınıflar, dersler, kapalı saatler ve program alternatifleri. Şema
[DATA.md](DATA.md)'de.

Bir bilginin State'te durup durmayacağına tek soru karar veriyor: bu bilgi bir
yedek dosyasıyla başka bir makineye taşınmalı mı? Şunlar taşınmamalı ve State'in
dışında duruyor:

- makine tercihleri (`theme.ts`, `printOptions.ts`, `programColor.ts`, dil), çünkü koyu temalı bir makinede alınan yedek babanın temasını çevirmemeli ve kozmetik bir ayar için şema göçü yazılmamalı
- bir oturumdaki pozisyon (`toolState.ts`), çünkü "şu an neye bakıyorum" yarın açılışta hatırlanması gereken bir şey değil
- geçici görünüm (`programMask.ts`), aynı sebeple
- plan kimliği ve kitaplık (`library.ts`), çünkü bir yedek dosyası tek bir plan
- kullanıcının seçtiği klasörün tutamağı (IndexedDB), çünkü başka bir makinede o yol yok

Bir bilgi "pozisyon mu, tercih mi" diye sorulur: pozisyonsa `toolState.ts`'e gider
ve yeni bir depolama anahtarı açmaz, tercihse bir localStorage anahtarı alır,
anahtar "Veriler nerede" tablosundaki adıyla `preferenceKeys.ts`'e girer ve tercih
`preference.ts` fabrikasıyla kurulur ([DATA.md](DATA.md)).

### Import döngüleri nasıl önleniyor

Çalışma zamanında döngü yok, ve bunu dört desen sağlıyor.

- **Ortak ihtiyaç aşağıda durur.** `keys.ts` anahtar üretir ki `constraints.ts` ile `rules.ts` birbirini çağırmasın, `constraints.ts` onları yeniden dışa aktarır ve çağrı yerleri değişmez. `subjects.ts`, `blocks.ts` ve `names.ts` aynı sebeple yaprak: `entities.ts` zaten `constraints.ts`'i çağırıyor, ikisinin ihtiyacı ikisinin de altında durmalı.
- **Yalnız tip alınır.** `rules.ts` `constraints.ts`'ten yalnız `Index` tipini, `entities.ts` `import.ts`'ten yalnız satır tiplerini `import type` ile alır, derlemede silinir. `import.ts` `makeShort`'u `entities.ts`'ten alıp yeniden dışa aktarır, kısaltmanın tek evi var.
- **State bilinmez, ham metin taşınır.** `library.ts` ve `libraryStore.ts` `store.ts`'i çağırmaz ve State'in ne olduğunu bilmez: ham string alıp verir, ayrıştırmayı `store.ts` yapar. `bundle.ts` de öyle, içindeki her planı ham `unknown` olarak verir ve bozuk girdi kurallarını `normalizeLibrary()`'ye devreder. Üçü de `library.test.ts`'in katman sınırları bölümünde ölçülüyor, çünkü bir dosyanın neyi söyleyebileceği çalışma zamanında görünmez.
- **Anahtarlar bir yaprakta.** Tercih anahtarları ve tablodaki adları `preferenceKeys.ts`'te düz yazılı, `BASE_KEY`'den türetilmez. `storageReport.ts` onları sahipleri olan `changelog.ts` ya da `programColor.ts`'i import etmeden listeler, sahipler de anahtarı aynı yapraktan alır.

`Commands.tsx` `App`'te değil ayrı bir dosyada, çünkü komutların yarısı
`useInspect()` çağırıyor ve o kanca yalnız `InspectorProvider`'ın içinde çalışıyor,
`App` ise o provider'ı çizen bileşen.

### Doğrudan DOM'a yazma deseni

`drag.ts`, `gridChrome.ts`, `poolSplit.ts` ve `rowDrag.ts` aynı deseni izler:
dinleyiciler bir kez bağlanır, `pointermove` sırasında React durumuna yazılmaz,
DOM'a ya da tek bir custom property'ye yazılır, ve React'e yalnız sonuç bildirilir.
Sebep performans değil doğruluk: sürükleme sırasındaki bir yeniden çizim
sürüklemeyi koparıyor (tuzak 1), ve iki bin hücrelik bir ızgarayı her karede
yeniden çizmek imleci takılır hâle getiriyor. Sürüklemenin hedef satırı, bırakma
önizlemesi ve hayaleti de React prop'u değil, `drag.ts`'in doğrudan yönettiği
DOM.

Kural React'i tanımamak değil, hareket sırasında React'e yazmamak, ve dördü tam
bu noktada ikiye ayrılıyor: `gridChrome.ts`, `poolSplit.ts` ve `rowDrag.ts` bir
HTML elemanı alıp sökme fonksiyonu döndürür ve React'i hiç import etmez,
`drag.ts` ise bir kanca olduğu için `useCallback`, `useEffect` ve `useRef` alır.
Bu bir ihlal değil, `useDrag`'in bir bileşenin içinden çağrılmasının bedeli:
sürükleme boyunca yazdığı tek şey yine DOM. Sınır o yüzden "React import
edilmesin" diye ölçülemez, "`pointermove` sırasında durum güncellenmesin" diye
ölçülür.

### Uzun ömürlü durum `App`'te

Sekme değişince bileşen sökülür ve `useState` içindeki her şey gider (tuzak 18).
Bu yüzden baskı sayfa seçimi, çözücü koşusu (`useSolver`), klasör (`useFolder`) ve
her sekmenin pozisyonu (`toolState.ts`) `App`'te yaşar. Şerit `<main>`'in üstünde
durduğu için onu gösteren durum da orada olmalı.

### Çözücü kısıt mantığını yeniden yazmaz

`solver.ts` her yasallık sorusunu `blocker()`'a sorar, yani sürüklemeyi yargılayan
fonksiyonun kendisine. Kendine ait iki şeyi var, ikisi de aramayla ilgili: her
dersin arama başlamadan hesaplanan tavanı, ve ızgara uzun süre iyileşmezse bir
dersten vazgeçip o ana kadarki en iyi ızgaradan devam etmek (tuzak 26).

Bir ders en çok iki iş kalemine ayrılır, biri uzun blokları biri tek saatleri
ister, çünkü aramanın sayaçları (aday hücre kümesi, MRV, ileri kontrol) elindeki
blokların eşit boylu olduğunu varsayıyor. İki kalem aynı sınıfı paylaştığı için
`neighbours` onları birbirinin komşusu yapar. Yeniden başlatmada ne kadarının dizildiği donmuş
ızgaradan `placedBlocks()` ile boyuna göre sayılır, `placedHours`'tan türetilmez, çünkü iki kalem tek bir sayıyı paylaşamaz.

`place()` her çağrıda sözlüğü kopyaladığı için aramanın iç döngüsüne pahalı. Onun
yerine `constraints.ts`'teki `occupy` ve `vacate` kullanılır, `place()` ile
`buildIndex()` ikilisinin yerinde çalışan hâli. İkisinin sapmadığı
`constraints.test.ts`'te sabitleniyor.

Çözücü ana iş parçacığında dilim dilim koşar, Web Worker bu projede çalışmıyor
(tuzak 19).

### Exe bir adaptör takar

Exe hiçbir şeyi yeniden yazmaz. `folder.ts` dosya adlarının, günlük yedeğin ve
budamanın tek evi, `desktop.ts` üç Tauri komutunu bir `FileSystemDirectoryHandle`
kılığına sokar ve `saveInto()` exe'de olduğu gibi koşar. Rust'ta yalnız tarayıcıda
karşılığı olmayan şey var: hangi klasör, ve bir adın gerçekten bir ad olduğunu
doğrulayan kapı (`safe_name`). `src/desktop.test.ts` gerçek `saveInto()`'yu
adaptörün üstünde koşturur.

`isDesktop()` bir derleme bayrağı değil özellik tespiti, çünkü dört teslim yolu
aynı `dist/index.html`'i taşıyor ([BUILD.md](BUILD.md)).
