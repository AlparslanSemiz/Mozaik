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

### 2026-09-12 · npm run mutasyon · ilk tam mutasyon koşusu, saf çekirdek
Bulgu: `a81c79a` artı bu turun test paketi, `../Mozaik-test` worktree'sinde, dört işçi, 30 dakika. 3987 mutant, 2816 öldü, 769 hayatta, 402 kapsamsız, 49 zaman aşımı. Skor (öldürülen / kapsanan) toplamda 78,5. Dosya başına: `store.ts` 63,7 · `constraints.ts` 76,6 · `feasibility.ts` 79,9 · `rules.ts` 80,9 · `entities.ts` 83,1 · `library.ts` 91,3 · `blocks.ts` 93,8. Tam tablo WORKLOG'un 2026-09-12 girdisinde.

Kapsam: `solver.ts` dışarıda (araç sınırı, ayrı kayıt) ve mutantları öldürmek için yalnız birim süiti koşuyor, E2E koşmuyor. Yalnız Playwright'ın ölçtüğü bir satır burada "kapsamsız" okunur ve bu "test edilmemiş" demek değildir. Zaman aşımları öldürülmüş sayılıyor ve koşu sırasında yük ortalaması 12'ye çıktı, yani bir kısmı sahte olabilir: üst sınır 49/2816, yüzde 1,7.

Hayatta kalanlar üçe ayrıldı, çünkü hepsini bir eksik saymak listeyi kullanılamaz yapar. Mekanik desen sayımı: `?.` yerine `.` 48, `??` yerine `&&` 14, `if (x === undefined)` kapısı yerine `false` 63, `StringLiteral` 86, geri kalan 558. İlk üç desen (125 mutant) ölçülmeyen davranış değil: `sanitize()` geçmiş bir durumda o dallar hiç çalışmıyor, yani ya gereksiz kod dalı ya anlamsız mutant. En yoğun yer `constraints.ts`, 37 ölü kapı.

İki dosyaya ayrıca bakıldı. `store.ts`'in 163 kapsamsız mutantı neredeyse bütünüyle `useStore()` kancasında ve tarayıcı tarafında (`park`, `createPlan`, `switchPlan`, `deletePlan`, `replaceLibrary`, `download`, `rotateBackups`, `isTextInput`, `storageWorks`), yani kapsam artefaktı. 200 hayatta kalanın 130'u ayrıştırma ve göç yarısında ve hepsi tek cümleye çıkıyor: bu turda yazılan örnek dosya testi ızgarayı ve adları doğruluyor, **dersin şeklini ve ayarları doğrulamıyor**. Yaşayan mutantlar `readLessons`'ın sürüm sınırlarında (353, 360, 363, 368, 379), `readDays`'te (388, 390), zil saatlerinde (466-473), öğretmenin sınır kutularında (511-513), program zarfında (530-532, 544) ve v1/v2 göçünde (243-310).

`library.ts` en yüksek skoru aldı ve yine de üç net boşluk verdi: `renamePlan`, `setDraft` ve `removePlan`'ın üçünde de `p.id === id ? … : p` koşulu `true` yapılınca hiçbir test kırmızıya dönmüyor, yani yalnız adı geçen planın değiştiği hiçbir yerde doğrulanmıyor; `parseLibrary`'nin çöp kapıları (nesne olmayan üst düzey, boş `plans`, var olmayan plana işaret eden `activeId`); ve `removePlan`'ın olmayan kimlikle çağrılması ile `uniquePlanName`'in boşluk kırpması. Bir mutant gerçekten eşdeğer: 92. satırdaki dizi mutantını bir alt satırdaki tip kapısı zaten eliyor.
Sınıflandırmanın okuyarak yapılamayacağı da aynı koşuda ölçüldü. `constraints.ts:820`'deki `i < block.size` yerine `i <= block.size` mutantı okuyunca bariz bir gerçek boşluk gibi duruyor, çünkü `dropMap`'in doluluk haritasına bloğun bittiği hücrenin bir sonrasını da yazıyor, ve önce TODO'ya "iki gerçek boşluktan biri, ciddi" diye yazıldı. Sonra kurulabilen bir dünyada denendi (tek gün, dört saat, iki saatlik bir blok ve tek saatlik bir ders): `dropMap`'in çıktısı dört hücrenin dördünde de temiz kodla birebir aynı, ve mutasyonla birim süitinin tamamı yeşil. Yani ya eşdeğer bir mutant ya da farkı gösteren durum bulunamadı. İddia geri alındı. Bir mutantın "gerçek boşluk" olduğu okunarak değil ölçülerek söylenir, ve bu turda okuyarak verilen karar bir kez yanlış çıktı.
Tür: bulgu değil, ölçüm. İçinden çıkan üç iş TODO §8f'de.
Ne yapıldı: sonuçlar yazıldı, kod değiştirilmedi. Sıradaki iş paketinin girdisi bu koşu.
Kalıcı kural: yok

### 2026-09-12 · npx playwright test e2e/erisim.spec.ts · ilk erişilebilirlik taraması, on bir ekran
Bulgu: axe-core ile ilk tarama, renk kontrastı kuralı kapalı (onu `renk.spec.ts` zaten WCAG oranı ve CIE Lab ΔE ile ölçüyor). Altı ayrı kural ihlali, hiçbiri gözle görünmüyor: `region` on bir ekranın on birinde, her seferinde tek düğüm ve hep aynısı, araç şeridi (`.ribbon`) hiçbir bölgenin içinde değil. `label` kritik seviyede, Okul'da 8, Dersler'de 6, Ayarlar → Kurallar'da 6 giriş kutusu; kutular tablo satırının içinde ve başlıkları sütun başlığından okunuyor, yani gören için etiketli, ekran okuyucu için etiketsiz. `label-title-only` Dersler'de 6 kutu. `empty-table-header` Program'da 6, Okul'da 2, Müsaitlik'te 2, Dersler'de 2, Ayarlar'ın iki bölümünde 1'er; çoğu bilerek boş (tutamak sütunu, ızgaranın köşesi). `heading-order` Program'da ve Çıktı'da 1'er, `h3` bir `h2` olmadan. `scrollable-region-focusable` ciddi seviyede, Program'da havuz (`.pool-list`) ve Ayarlar → Hakkında'da yan panel fareyle kaydırılıyor ama klavyeyle odaklanamıyor.

İlk koşu Ayarlar'ın "Veriler" bölümünü 30 sn'de bulamayıp zaman aşımına uğradı, çünkü bölümün adı `Planlar ve yedek`. Test kusuru, düzeltildi. İkinci kusur aynı koşuda: sert `expect` ilk kırmızıda testi durduruyordu, yani on bir ekranın dördü hiç taranmamıştı. `expect.soft`'a çevrildi ve kalan yedi ekran ancak o zaman görüldü.

Testin kendisi iki yönde de mutasyonla sınandı. Kontrol ekranına etiketsiz bir `<input>` konup yeniden derlenince kırmızı ("Kontrol: label 1 düğümde, listede 0"), kaldırılınca yeşil. Tabana olmayan bir kayıt (`Kontrol: label 4`) yazılınca da kırmızı ("listede 4 yazıyor ama ekranda 0"), yani düzeltilen bir ihlal listede unutulamıyor.
Tür: ürün kusuru (altı madde), artı iki test kusuru (yanlış bölüm adı, erken duran iddia)
Ne yapıldı: düzeltilmedi, listelendi. Altı madde TODO §8e'de, her biri bir karar bekliyor çünkü bir kısmı bilerek olabilir (boş başlık hücrelerinin çoğunun gerçekten bir başlığı yok). Test sıfır değil bir taban tutuyor ve yeni bir ihlale kırmızıya dönüyor.
Kalıcı kural: yok

### 2026-09-12 · npx vitest run src/sentences.test.tsx · satır içi anlık görüntülerin ilk yazımı
Bulgu: Üç anlık görüntü yazıldı ve üçü de yazılmadan önce tahmin edilen değerden farklı çıktı, yani üçü de bir şey söyledi. Ret cümlelerinde saat adı `1. saatinde` değil `1 saatinde`, ve `roomClosed` "A dersliği ... kapalı" değil "510 sınıfının dersliği (A) ... kapalı" diyor. "Veriler nerede" tablosu 21 satır: bir plan, plan listesi, üç oturum yedeği ve on altı tercih anahtarı, yani WORKLOG'un "20 satır, planların kendi anahtarları hariç" sayısıyla birebir. Kontrol raporunun yerleşemeyen dersi çevrilmemiş sınır cümlesini olduğu gibi taşıyor ("MÇ art arda 1 saatten fazla girmemeli"), yani TODO §8d'deki o madde artık bir anlık görüntüde de yazılı ve düzeltilince orada da görünecek.

`jsdom` ortamında baskı sayfası ilk koşuda çizilmedi: `scrollFade.ts`'in `ResizeObserver`'ı yok. `App.test.tsx`'in stubu aynen alındı, gerekçesi de aynı (eksiklik jsdom'un, ürünün değil).

Üçü de mutasyonla sınandı. `preferenceKeys.ts`'ten hareket tercihi satırı çıkarılınca depo tablosu kırmızı. `teacherBusy` cümlesi "Çakışma var"a çevrilince ret cümleleri kırmızı, yani "her zaman somut" kuralı artık bir testin konusu. `Print.tsx`'te `p-title-main` sınıfı yeniden adlandırılınca kâğıt iskeleti kırmızı. Üçünde de dosya kopyadan geri yüklendi ve yeşil koşu tekrarlandı.
Tür: bulgu değil, ölçüm. Tek ürün kusuru zaten bilinen çevrilmemiş cümle.
Ne yapıldı: üç anlık görüntü kaydedildi. Kapsamı bilerek dar: yalnız tamlığın kendisi bir özellik olduğunda kullanılıyor.
Kalıcı kural: yok

### 2026-09-12 · npx vitest run src/invariants.test.ts · özellik bazlı testlerin ilk koşusu ve ne gördükleri
Bulgu: On dört değişmez yazıldı, fast-check ile. İlk koşuda ikisi kırmızıydı ve ikisi de **testin** kusuruydu: yardımcı, `remapDays`'in döndürdüğü durumun anahtarlarını **eski** gün listesiyle okuyordu. `remapDays` anahtarları yeniden yazıyor ve `settings.days`'i çağıranına (`updateSettings`) bırakıyor, yani iki liste ayrı. Yardımcı gün listesini parametre olarak alacak şekilde düzeltildi, ve düzeltmenin kendisi dosyada yazılı.

Testlerin ne gördüğü ölçüldü, yedi mutasyonla. Kırmızıya dönenler: `remapDays` hiç taşımazsa iki test, `vacate`'in sayacı bir fazla bırakırsa bir test, `clampBlocks` sığmayan bir bloğu tutarsa bir test, `firstFreeColor` en az yerine en çok kullanılanı verirse iki test. Hayatta kalanlar ve sebepleri: `blocker()`'daki öğretmen çakışması denetimi tamamen kaldırılınca on dördü de yeşil kaldı, çünkü `illegalBlocks` aynı fonksiyonu çağırıyor ve denetçi mutasyonla birlikte körleşiyor (tuzak 23, ve `worlds.test.ts` denetçiyi bu yüzden ayrıca sınıyor). Çözücünün iki yasallık kapısından yalnız biri bozulunca da yeşil kaldı, çünkü öteki hâlâ reddediyor; **ikisi birden** bozulunca üç değişmez kırmızıya döndü. Tek başına bir kapıyı bozan mutasyonun gerçekten etkisiz olduğu ayrıca ölçüldü: iki dersi tek öğretmene veren küçük bir dünyada temiz kodla da mutasyonla da çıktı birebir aynı.
Tür: iki test kusuru (ilk yazımda), artı testlerin görme sınırının ölçülmesi
Ne yapıldı: düzeltildi ve dosyaya yazıldı. Görme sınırı `invariants.test.ts`'in kendi yorumunda ve TESTPLAN'da duruyor, çünkü "çözücü kurallara uyuyor" cümlesinin neyi kanıtlamadığı o cümleyi okuyan kişinin bilmesi gereken şey.
Kalıcı kural: yok

### 2026-09-12 · npx stryker run · aracın kendisi iki kez durdu, ikisi de ölçüldü
Bulgu: İlk koşu daha başlarken düştü: Stryker bütün projeyi bir kum havuzuna kopyalıyor (12 044 dosya) ve `.venv/lib64` bir sembolik bağ olduğu için `EISDIR` verdi. `ignorePatterns` ile `.venv`, `dist*`, `docs`, `e2e`, `src-tauri`, `scratch` ve ikili dosyalar dışarıda bırakıldı.

İkinci koşu enstrümantasyonda düştü: `Property argument of UpdateExpression expected node to be of a type ["Identifier","MemberExpression"] but instead got "TSNonNullExpression"`. Kaynağı `solver.ts:530-531`'deki `classOnDay[g]!++`, yani `!` ile yazılmış bir artırma. `!` gerekli, çünkü `noUncheckedIndexedAccess` açık. Çözümü ölçüldü: iki satır `classOnDay[g] = classOnDay[g]! + 1` olarak yazılınca enstrümantasyon geçiyor, davranış birebir aynı kalıyor (`solver.test.ts`'in tamamı ve tipler temiz, `a81c79a` üstünde ölçüldü). Ama bu üretim kodunda bir değişiklik ve bir test paketinin işi değil, o yüzden **geri alındı**: `solver.ts` mutasyon listesinden çıkarıldı ve iki satırlık düzeltme TODO §8f'de bir madde oldu. Yani bugün çözücü mutasyonla ölçülmüyor, ve sebebi bir araç sınırı, kodun bir kusuru değil.

Üçüncü koşu 4376 mutantın 3193'ünde takıldı ve yirmi dakika ilerlemedi: altı işçiden biri kalmıştı ve ana süreç %0,4 CPU'daydı. O sırada aynı makinede E2E ve birim süitleri koşuyordu, yük ortalaması 9,6 idi. Koşu öldürülüp `concurrency` 4'e indirildi ve makinede başka bir şey koşmadan yeniden başlatıldı. Sebep ölçülmedi, yani "yük" burada bir teşhis değil bir gözlem (tuzak 92).
Tür: araç kusuru, artı bir süreç hatası
Ne yapıldı: üçü de aşıldı. Yapılandırma `stryker.config.json`'da ve her satırın gerekçesi yanında. Kural: mutasyon koşarken makinede başka bir süit koşturulmuyor.
Kalıcı kural: yok

### 2026-09-12 · scratch/olc-boya.mjs ve scratch/tani-uygulama.mjs · tema ilk boyamadan önce yazılıyor
Bulgu: Aşağıdaki 2026-09-11 kaydının kusuru kapatıldı ve önce/sonra aynı makinede, arka planda başka bir iş koşmadan, profil başına dokuz açılışla ölçüldü. `index.html`'in `<head>`'ine `type="module"` taşımayan klasik bir betik kondu: `ders-programi-tema` okunuyor ve `data-theme` yazılıyor.

| ölçüm | önce | sonra |
|---|---|---|
| karanlık profil, x4: ilk kare zemini son kareden farklı | 9/9 | **0/9** |
| karanlık profil, x1: aynı | 1/9 | 0/9 |
| karanlık profil, x4: tema boyamadan önce | 0/9 | **9/9** |
| boş profil, x4: tema boyamadan önce | 0/9 | 9/9 |
| karanlık profil, x4: tema yazılıyor (medyan) | 642,5 ms | 232,1 ms |
| karanlık profilde ilk kare, zemin | `rgb(207, 216, 228)` → `rgb(1, 2, 4)` | `rgb(1, 2, 4)` → `rgb(1, 2, 4)` |
| `dist/index.html` | 1 005 647 bayt | 1 006 340 bayt (+693) |

Bu makinenin mutlak süreleri 2026-09-11 kaydındakinden yüksek (x4'te ilk boyama 388 ms, o gün 152 ms) ve onunla karşılaştırılamaz, çünkü depoda paralel bir oturum çalışıyordu. Önce ve sonra arka arkaya, aynı koşullarda alındı.

Ölçüm aletinin kendisi iki kez sorgulandı. Birincisi: `olc-boya.mjs`'ye eklenen `data-theme` zamanlaması ilk hâlinde başlangıç betiğinde `document.documentElement.hasAttribute(...)` çağırıyordu, o an `documentElement` henüz yok, satır fırlatıyor ve bütün başlangıç betiğini götürüyordu. Alet o hâlde x1'de bile "tema boyamadan önce 0/9" ve "zemin `undefined`" diyordu, yani kusuru olduğundan büyük gösteriyordu. O koşu sayılmadı. Düzeltilmiş alet belgedeki tabanı birebir üretti (x1'de tema 61 ms / boyama 64 ms, x4'te tema 218,9 ms / boyama 156 ms), ve ancak ondan sonra ölçüm alındı. Aynı tuzak bu dosyanın 2026-09-11 kaydında da yaşanmış.

İkincisi, tuzak 108 kapısı: ürün artık belge başında depoya dokunuyor, ve bunun `file://` altında bayat açılış üretip üretmediği varsayılmadı, ölçüldü. Yeni derlemeyle, başlangıç betiği olmadan, kalıcı profilde 200 yenileme ve gizli bağlamda 200 yenileme: bayat işaret 0, kalıcı kayıp 0, görüntü aksaklığı 0. Aletin kör olmadığı aynı koşuda bilinen tetikleyiciyle gösterildi: `addInitScript` ile kurulan tohum 200 yenilemede 9 bayat işaret ve 4 kalıcı kayıp verdi. Sonuç tuzak 108'e yazıldı: sınır "belgeden önce" ile "belgenin `<head>`'i içinde" arasında.
Tür: ürün kusuru, kapatıldı (bilerek yapılan davranış değişikliği)
Ne yapıldı: düzeltildi. Koruma iki katmanda ve ikisi de mutasyonla sınandı. `src/preferences.test.ts` `index.html`'i okuyup betiğin gövdesini çalıştırıyor ve `themePreference` ile karşılaştırıyor: yedi mutasyonun yedisi kırmızı (betiğin tamamı silinsin, varsayılan `dark` olsun, kayıt yoksa sisteme sorsun, yanlış anahtar, betik `module` olsun, öznitelik adı değişsin, `try/catch` kalksın). İlk yazılan hâli betiğin kuralını elle kopyalıyordu ve "varsayılan `dark` olsun" mutasyonunu kaçırdı, yani kendi transkripsiyonunu ölçüyordu; gerçeği koşturan hâliyle değiştirildi. `e2e/renk.spec.ts` temanın `document.readyState === 'loading'` iken ve `#root` daha yokken kurulduğunu ölçüyor, bir milisaniyeyi değil sırayı: betik çıkarılıp yeniden derlenince kırmızı, geri konunca yeşil.
Kalıcı kural: TRAPS.md, tuzak 108 (sınırı keskinleştirildi)

### 2026-09-11 · npx vitest run src/preferences.test.ts · "styles.css'te makinenin bloğu ayarın kurallarından SONRA ve aynı seçicilerle duruyor"
Bulgu: Hareket adımında yazılan test ilk koşuda, bağlamadan önce de sonra da kırmızıydı. Oysa `styles.css` değişmemişti ve aynı sözü tarayıcıda ölçen `hareket.spec.ts` "MAKİNE tercihi bir TABAN" geçiyordu. Sebep geçici bir tanı testiyle ölçüldü: Vitest'te `./styles.css?raw` de aynı dosyanın `import.meta.glob` ile ham okuması da uzunluğu 0 olan bir dize veriyor. `vite.config.ts`'e yalnız bu dosyayı kapsayan `css.include` eklenince test yeşile döndü. Makinenin bloğunu ayarın kurallarının önüne taşıyan mutasyon ve bloktan sonra bir `:root[data-motion]` kuralı ekleyen mutasyon kırmızı. Bu ayarla birim süitinin tamamı 909/909. İlk koşudaki CSS mutasyonu zaten kırmızı olan testi kırmızı bulduğu için sayılmadı.
Tür: test kusuru (okuma aleti boş metin veriyordu)
Ne yapıldı: düzeltildi, hareket commit'inde. Test okunan metnin boyunu da soruyor.
Kalıcı kural: TRAPS.md, tuzak 109

### 2026-09-11 · scratch/olc-boya.mjs · yavaş işlemcide ilk kare tercihlerden önce boyanıyor, karanlık temada açık zemin
Bulgu: Adım 5'ten önceki ölçüm, Playwright Chromium, 1920×1080, `file://`, profil başına dokuz açılış. Tercihler depoya belge başında değil ayrı bir sayfadan yazıldı (tuzak 108). x1 CPU'da `main.tsx` tercihleri ilk boyamadan önce `<html>`'e yazıyor: öznitelik 48 ms, ilk boyama 52 ms, 18 açılışın 18'inde. CDP ile 4 kat yavaşlatılınca ilk boyama 152 ile 156 ms, öznitelikler 213 ms, yani 18 açılışın 17'sinde sayfa tercihler yazılmadan bir kez boyanıyor. Karanlık tema kayıtlı profilde ilk karenin `body` zemini 9 açılışın 8'inde açık (`rgb(207, 216, 228)`) ve sonra karanlık (`rgb(1, 2, 4)`). Boş profilde zemin değişmiyor. İçerikli ilk boyama x4'te 344 ms, yani görünen şey içeriksiz bir zemin karesi. Düzen zıplaması her profilde tek bir kayma, 0,0001 ile 0,0002. Ölçü aletinin bir ara hâli başlangıç betiğinde fırlatıyordu (`document.documentElement` o anda yoktu) ve o koşu sayılmadı. rAF'la alınan ilk ölçü de boyamayı değil kareyi ölçüyordu, bu yüzden `first-paint` girdisi ve özniteliğin kurulduğu an eklendi.
Tür: ürün kusuru. `main.tsx`'in "Before the first paint, otherwise the page flashes light and then flips" sözü yavaş işlemcide tutmuyor.
Ne yapıldı: TODO §8d maddesi, düzeltilmedi. Tercih fabrikası değeri çağrıldığı anda yazıyor, ihlal `main.tsx`'in derlenmiş dosyada ne zaman koştuğunda, ve düzeltmesi bir davranış değişikliği.
Kalıcı kural: yok

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
