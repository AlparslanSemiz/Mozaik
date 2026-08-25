# CLAUDE.md — Ders Programı Aracı

Babamın dershanesinde haftalık ders programını dizmek için kullanacağı araç.
aSc Timetables'ın yerini alacak. aSc'nin yaptığı işin bu kursla ilgili %10'unu
yapıp o %10'u aSc'den iyi yapmak hedefi.

Ayrıntılı çerçeve: [docs/PLAN.md](docs/PLAN.md) · Durum: [docs/STATUS.md](docs/STATUS.md) · Görevler: [docs/TASKS.md](docs/TASKS.md)

---

## Değişmez ilkeler

Her özellik kararında bu listeye dönülür. Listeyle çelişen özellik yazılmaz.

1. **Kurulum yok.** İndir, çift tıkla, çalışsın. Sihirbaz, hesap, şifre, güncelleme yok.
2. **Sunucu yok.** Backend, veritabanı, deploy, domain yok.
3. **İnternet gerekmez.** CDN'den tek bir dosya bile çekilmez. Web font yok.
4. **Türkçe.** Tek dil. i18n altyapısı yok, string dosyası yok — doğrudan Türkçe yazılır.
5. **Bir dönem kullanılmadan özellik eklenmez.** Tahmine dayalı özellik = yanlış özellik.
6. **Veri kaybı kabul edilemez.** Her şey her an dışa aktarılabilir.
7. **Hedef makine yavaş.** Her tasarım kararı bunu varsayar.

## Yasak liste — bunlar bu projeye asla girmeyecek

Kullanıcı hesapları · bulut senkronizasyonu · mobil uygulama · animasyon ·
istatistik/dashboard · yoklama · not girişi · öğrenci kaydı · SMS/e-posta ·
takvim entegrasyonu · PDF kütüphanesi (tarayıcının yazdırması yeterli) ·
birden çok program sürümünü yan yana tutma · sürükleyerek ders süresi uzatma ·
undo/redo geçmişi ağacı (düz yığın yeterli)

> **Listeden çıkarıldı (2026-08-24): karanlık mod ve tema seçimi.** Gerekçe zevk değil:
> tarayıcı (Brave, Chrome) açık temalı sayfayı zaten **zorla karartıyor** ve bunu kendi
> algoritmasıyla yapıyor. Sonuçta yeşil = bırakılabilir / sarı = uyarı / kırmızı = engel
> renkleri çamurlaşıyor — yani aracın en temel geri bildirim kanalı bozuluyor.
> Kontrolü almak, tarayıcıya bırakmaktan **daha az** karmaşa. **v0.7'de uygulandı**;
> tercih `localStorage['ders-programi-tema']`'da, `State`'e girmez.

---

## Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  ->  dist/index.html  (tek dosya, gömülü JS/CSS)
Vitest                  ->  saf mantık testleri
```

**Runtime bağımlılığı sadece React.** Tarih kütüphanesi yok, UI kütüphanesi yok,
state yönetimi kütüphanesi yok, sürükle-bırak kütüphanesi yok.

> Yeni bir `dependency` eklemek istiyorsan önce sor. Varsayılan cevap hayır.
> `devDependencies` (test/build araçları) serbest ama gereksizini ekleme.

CSS: tek bir `src/styles.css`, CSS değişkenleriyle. Tailwind yok.

### Komutlar

```bash
npm run dev       # geliştirme sunucusu
npm test          # Vitest — 338 birim testi
npm run build     # dist/index.html tek dosya üretir
npm run test:e2e  # Playwright — derler, sonra 200 E2E testi
npm run kontrol   # hepsi: tsc + birim + derleme + E2E
npm run ekran     # iki temada ekran görüntüsü -> test-results/ekran/
npm run gorsel    # görsel regresyon — 20 referansa karşı piksel farkı
npm run cozucu    # gerçek ölçekli çözücü stresi — 7 test, ~2,2 dk
```

Yeni bilgisayarda bir kez: `npm install && npx playwright install chromium`

### Test katmanları — hangisi neyi yakalar

| Katman | Nerede | Neyi yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite, zil saatleri, kural limitleri, gün taşıma, silme özeti, branş kısaltması, şema göçü, palet ayrımı, branş listesi, kapalı saat çakışması, **otomatik dizme (yasallık, belirlenimcilik, tıkanma), `occupy`/`vacate` eşdeğerliği, 19 dünyalık çözücü matrisi ve denetçinin kendisi** |
| Duman | `src/App.test.tsx` (jsdom) | Bileşenler çiziliyor mu, sekmeler çöküyor mu |
| **E2E** | `e2e/*.spec.ts` (Playwright, 11 dosya) | **Düzen, sürükleme, taşıma, sağ tık, kaydırma, yazdırma, `file://`, renk kontrastı ve AYRIMI, tablo ekseni, simge şekli, ayraç genişliği, yazı boyu, kenar çubuğu, sağ sütunların doluluğu, geri-al zinciri, hata yolları, klavye** |
| Görüntü | `e2e/ekran.spec.ts` (`npm run ekran`) | Test değil, **kanıt**: iki temada on ekran görüntüsü |
| **Görsel regresyon** | `e2e/gorsel.spec.ts` (`npm run gorsel`) | Yerel referansa karşı piksel farkı, 20 referans. **`npm run kontrol`'ün parçası DEĞİL** — sistem fontu makineye göre çözüldüğü için referans tek makine için doğru. Referanslar depoda; yeni makinede bir kez `--update-snapshots` |

E2E, `dist/index.html`'i `file://` üzerinden 1366×768'de açar — yani **babanın çift
tıklayacağı dosyanın ta kendisini**. jsdom'un düzeni yok; sürükle-bırak, sabit sütun,
ekran dışı hedef ve yazdırma taşması **yalnızca burada** görünür. Nitekim tuzak 11 ve
12 (bkz. PLAN.md) bu testlerle bulundu, başka türlü bulunamazdı.

`fullyParallel: true, workers: 4`. Doğrulanmış varsayım: `file://` altında her
Playwright context'inin kendi `localStorage`'ı var — 200 test paralel koşarken
birbirinin verisini görmüyor (ölçülen: 66 sn → 51 sn).

**Sahte veri tek yerde: `src/worlds.ts`.** `makeWorld()` küçük bir okul kurar,
`illegalBlocks()` dizilmiş bir programı denetler, `WORLDS` 19 senaryoyu tutar.
`e2e/` altında değil çünkü `tsconfig.json` yalnız `src`'yi kapsıyor — orada duran
bir dünya `tsc --noEmit`'ten hiç geçmezdi. Uygulama onu import etmediği için Vite
budar, `dist/index.html`'e girmez. Hem `solver.test.ts` hem `kontrol.spec.ts` hem
`otomatik-dunyalar.spec.ts` aynı üreteci kullanır.

**Renk ve kontrast iddia edilmez, ölçülür.** E2E tema değişkenlerini gerçek
`getComputedStyle` ile okuyup WCAG kontrast oranını ve **CIE Lab ΔE** farkını hesaplar.
ΔE gerekiyor çünkü WCAG parlaklık oranı iki koyu rengi farklı tonda olsalar bile eşit
sayar — koyu yeşil ile koyu zeytin tam olarak bu durumdadır.

> **Arayüzde görünen bir şeyi değiştirdiysen `npm run test:e2e` çalıştırmadan
> "bitti" deme.** Sürükleme, kaydırma, düzen ve yazdırma zaten yalnızca burada
> yakalanıyor; ama renk, hizalama, tablo ekseni ve düğme adı da öyle — jsdom bunların
> hiçbirini görmez. Görsel bir değişiklikten sonra ekran görüntüsü de al
> (`test-results/ekran/`): **çıktıyı göster, iddia etme.**

---

## Kod dili ve biçim

**Kural: arayüz Türkçe, kod İngilizce.** İkisi karışmaz.

- **Tanımlayıcılar, tipler, dosya adları İngilizce**: `teacher`, `classGroup`,
  `unavailable`, `placements`, `constraints.ts`, `blocker()`, `components/Availability.tsx`.
- **Kullanıcıya görünen her metin Türkçe** ve doğru Türkçe karakterlerle:
  `"MÇ Salı 3. saatte 433 sınıfında"`. Bu metinler `i18n` altyapısından geçmez,
  doğrudan JSX/string içinde durur (tek dil, ilke 4).
- **Yorumlar İngilizce**, kısa, sadece *neden*i açıklar. *Ne* yaptığını kod söyler.
- Depolanan JSON alan adları da İngilizce — ama **değiştirmek yedek dosyalarını
  bozar**, o yüzden şema değişirse `schemaVersion` artırılır ve göç kodu yazılır.

> **İstisna — bunlar Türkçe kalır, kullanıcı verisidir:** `localStorage` anahtarı
> (`ders-programi`, `ders-programi-yedek-N`) ve indirilen yedeğin dosya adı
> (`ders-programi-YYYY-AA-GG-SSDD.json`). Bunları "İngilizceye çevirmek" babanın
> kayıtlı programını görünmez kılar — kimliği değişen anahtar, silinmiş veri demektir.

---

## Mimari — üç katman, sınırları geçilmez

```
types.ts                        tipler, başka hiçbir şey
keys.ts                         sözlük anahtarları (constraints ↔ rules döngüsü olmasın)
palette.ts                      36 renk + firstFreeColor. HİÇBİR ŞEY import etmez.
  |
constraints.ts / feasibility.ts SAF fonksiyonlar. React, DOM, localStorage BİLMEZ.
rules.ts / bell.ts              Testleri zorunlu.
import.ts / entities.ts
solver.ts                       otomatik dizme. Kendi kısıt mantığı YOK — blocker()'ı çağırır.
worlds.ts                       SADECE TEST: dünya üreteci + illegalBlocks denetçisi.
                                Uygulama import etmez, Vite budar. Vitest ve
                                Playwright ikisi de buradan beslenir.
  |
store.ts                        reducer + geri al yığını + localStorage + göç
theme.ts                        makine tercihleri (tema, kenar çubuğu) — State'e girmez
useSolver.ts                    solver.ts'i rAF ile dilim dilim sürer. App'te yaşar.
  |
components/props.ts             PanelProps — Kurulum adımı ve Ayarlar bölümü aynı ikiliyi alır
components/Field.tsx            iki klasörün de kullandığı küçük parçalar
components/LimitBox.tsx
components/*.tsx                sadece görüntüleme ve olay yakalama
components/setup/*.tsx          Kurulum: index (kabuk) + 4 liste adımı + Paste + Summary
components/settings/*.tsx       Ayarlar: index (kabuk) + Okul · Kurallar · Branşlar · Veri
```

`rules.ts`, `constraints.ts`'ten **yalnızca `Index` tipini** alır (`import type`,
derlemede silinir) — çalışma zamanında döngü yok. Anahtar üreten fonksiyonlar
`keys.ts`'te; `constraints.ts` onları yeniden dışa aktarır, çağrı yerleri değişmez.

`entities.ts` `import.ts`'ten **yalnızca satır tiplerini** alır (`import type`) —
aynı desen, çalışma zamanında döngü yok. `import.ts` ise `makeShort`'u `entities.ts`'ten
alır ve yeniden dışa aktarır: kısaltmanın tek evi var.

`solver.ts` kısıt mantığının **hiçbirini** yeniden yazmaz: her yasallık sorusu
`blocker()`'a gider, yani sürüklemeyi yargılayan fonksiyonun ta kendisine. Bir kural
sürüklerken başka, otomatik dizerken başka anlama gelemez. Aramanın karşılayamadığı
tek şey `place()`'in her çağrıda sözlüğü kopyalaması; onun için `constraints.ts`'te
`occupy`/`vacate` var — `place()` + `buildIndex()` ikilisinin yerinde çalışan hâli.
İkisinin sapmaması `constraints.test.ts`'te yedi testle sabitlenir.

**Kural:** iş mantığı bileşenlerin içine yazılmaz. Bir `.tsx` dosyasında çakışma
hesabı görüyorsan yanlış yerdedir — `constraints.ts`'e taşı.

**Kural:** `constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`,
`palette.ts`, `solver.ts` içindeki her dışa aktarılan fonksiyonun testi olacak. Bu dosyalara test yazmadan
özellik eklenmez. `store.ts` içindeki `parseState` ve `entities.ts` içindeki
`remapDays` de test edilir: ilkinden her yedek dosyası geçer, ikincisi gün listesi
değişince programın kaymasını engelleyen tek şeydir.

---

## Veri modeli — özet

Tam hâli [src/types.ts](src/types.ts). Değiştirmek pahalı; değiştirmeden önce düşün.

```ts
State {
  schemaVersion: 5
  settings: {
    schoolName: string
    days:   Day[]      // varsayılan 6 gün: Salı..Pazar (Pazartesi ders yok)
    hours:  string[]   // ders ETİKETLERİ; uzunluk = günlük ders sayısı (12)
    bell:   Bell       // saatler hesaplanır, tek tek saklanmaz
    limits: Limits     // okul geneli varsayılan sınırlar
    rules:  Rules      // her sınır için Kapalı / Uyar / Engelle
    subjects: string[] // okulun branş listesi — TAMAMI saklanır
    subjectShorts: Record<string, string>   // YALNIZCA değiştirilenler
  }
  rooms, teachers, classes, lessons
  unavailable: Record<`${entityId}|${day}|${hour}`, 1>   // öğretmen + sınıf + derslik
  placements:  Record<`${classId}|${day}|${hour}`, lessonId>
}
Day        { name, longBreakAfter }         // 5 = öğle arası 5. dersten sonra, 0 = yok
Bell       { start, lessonMinutes, breakMinutes, longBreakMinutes }  // 09:00 · 40 · 10 · 30
Limits     { maxConsecutive, maxPerDay, minPerDay, maxSameLessonPerDay }  // 0 = sınır yok
Teacher    { name, short, subject, color, limits }  // her öğretmenin TEK branşı var
                                            // limits alanları null = okul varsayılanı
                                            // color = PALETTE indeksi, kimseyle çakışmaz
ClassGroup { name, roomId, color }          // derslik sınıfın sabit alanı, seçilmez
Lesson     { classId, teacherId, weeklyHours, blockSize, maxPerDay }
```

Tema tercihi `State`'e **girmez**: `localStorage['ders-programi-tema']`'da durur.
Makine tercihi, program verisi değil — koyu makinede alınmış bir yedek babanın
makinesinde temayı çevirmemeli, ve kozmetik bir ayar için şema göçü yazılmamalı.

Varsayılan zil düzeni: 09:00 başlar, 40 dk ders + 10 dk teneffüs, hafta içi 5. dersten
sonra / hafta sonu 6. dersten sonra 30 dk öğle arası — **iki desende de 12. ders 19:10'da
biter**. Bu `bell.test.ts`'te açıkça iddia edilir.

### Neden böyle

- **Branş öğretmenin alanı, dersin değil.** Her öğretmenin tek branşı var.
- **Derslik sınıfın sabit alanı.** Yerleştirirken oda seçilmez, ama iki sınıf aynı
  dersliği paylaşıyorsa çakışma kontrol edilir (~20 sınıf, 8 derslik).
- **`placements` düz sözlük, dizi değil.** Gün/saat sayısı değişince taşan anahtarlar silinir.
- **Blok ayrı varlık değil.** Ardışık anahtarlara aynı `lessonId` yazılır. Kaldırırken
  bloğun başı geriye yürüyerek bulunur.
- **Anahtarlarda asla isim kullanılmaz, hep `id`.** "Şükrü" adı değişince yerleşim bozulmasın.
- **Zil saatleri hesaplanır, saklanmaz.** Başlangıç + üç süre; her günün tek farkı öğle
  arasının nereye düştüğü. Period başına satır tutmak aynı bilgiyi 12 kez saklamak olurdu.
- **Kapalı saatler tek sözlükte.** `id`'ler üç liste arasında benzersiz olduğu için
  öğretmen, sınıf ve derslik aynı `unavailable` haritasını paylaşır — ikinci bir sözlük,
  ikinci bir göç ve ikinci bir `sanitize` dalı gerekmiyor.
- **Sınırlar iki katmanlı.** `settings.limits` okul geneli; `Teacher.limits` /
  `Lesson.maxPerDay` içinde `null` "varsayılanı kullan" demektir. 25 hocaya aynı sayıyı
  25 kez girdirmemek için.
- **Branş kısaltmasında yalnızca DEĞİŞTİRİLEN saklanır.** `Matematik → Mat` gömülü
  tablodan gelir; `subjectShorts`'a ancak varsayılandan farklı bir şey yazılınca kayıt
  düşer, varsayılana geri yazılırsa silinir. Böylece yedek 21 varsayılanla şişmez ve
  gömülü tablo ileride iyileşirse eski proje kendiliğinden faydalanır.
- **Renk kimliktir, süs değil.** Her öğretmenin ve her sınıfın kendine ait bir rengi
  var; `addTeacher`/`addClass` **kullanılmayan** en küçük indeksi verir (`firstFreeColor`),
  sıradakini değil. Palet 36 renk ve `src/palette.ts` içinde düz hex — iki temada ve
  kâğıtta aynı olan tek renk kümesi olduğu için CSS değişkeni hiçbir şey kazandırmıyordu.
  Renkler elle seçilmedi, **arandı**: kontrast ve CIE Lab ayrımı kısıtları altında en
  uzak nokta yöntemiyle. `palette.test.ts` bunu her koşuda yeniden ölçer.
- **Branş listesi TAM saklanır, kısaltmalar sapmalı.** `subjects` kullanıcının
  düzenlediği bir liste — gömülü tablodan türetilen bir liste "Fransızca'yı kaldır"ı
  ifade edemez. `subjectShorts` ise yalnız değiştirileni tutar. `Teacher.subject` hâlâ
  bir **string**, id değil: branş silmek cascade gerektirmesin ve yedek okunur kalsın.
- **`schemaVersion` ilk günden var.** v1 = Türkçe alan adları, v2 = İngilizce,
  v3 = `Day` nesneleri + zil saatleri + kurallar, v4 = `subjectShorts`,
  v5 = `ClassGroup.color` + `settings.subjects`.
  `parseState` v1'i v2'ye, v2'yi v3'e taşır; v3, v4 ve v5 tek okuyucudan geçer (aradaki
  tek fark eklenen alanlar); `id`'ler ve gün indeksleri değişmediği için `unavailable` ve `placements`
  anahtarları olduğu gibi geçer. **Şema her değiştiğinde: sürümü artır, göç kodunu yaz,
  hem birim hem E2E testini ekle.** Eski yedek açılmıyorsa veri kayıptır.

---

## Kısıtlar

`blocker()` sırayla bakar, ilk engelde döner. Mesaj **her zaman somut**:
"Çakışma var" değil, `"MÇ o saatte 433 sınıfında"`. Programı dizen kişinin bir
sonraki hamlesini belirleyen şey bu cümle.

**Sert — her zaman engeller:**

1. Blok gün sonuna sığıyor mu
2. Sınıfın o saatleri boş mu
3. Sınıf o saatte kapalı mı
4. Öğretmen o saatte müsait mi
5. Öğretmen o saatte başka sınıfta mı
6. Dersliği paylaşan başka sınıf o saatte ders yapıyor mu
7. Derslik o saatte kapalı mı

**Ayarlanabilir — `settings.rules` "Engelle" ise engeller, "Uyar" ise sadece sarı boyar:**

8. Öğretmen art arda en fazla N saat
9. Öğretmen günde en fazla N saat
10. Bir sınıf aynı dersten günde en fazla N saat

`minPerDay` (geldiği gün en az N saat) yerleştirmede kontrol **edilemez** — günün ilk
dersini koyarken her zaman ihlal olur. Yalnızca `findViolations()` üzerinden Kontrol
sekmesinde çıkar.

`blocker()` sert kısıtları + "Engelle" seviyesindeki kuralları döndürür; `check()` onun
üstüne "Uyar" seviyesindekileri `warning` olarak ekler. İkisi de **aynı**
`limitBreaches()` fonksiyonunu kullanır, mesajlar ayrışamaz.

`blocker()` aslında `blockerDetail()` üstünde ince bir sarmalayıcı: asıl fonksiyon
mesajın yanında bir **kod** da döndürür (`teacherClosed`, `classBusy`, `roomBusy`…).
Sebepleri sayan her yer (Kontrol'ün "yerleşemeyen dersler"i, çözücünün tıkanma
cümlesi) koda göre gruplar — mesaj gün ve saat adı taşıdığı için cümle saymak yanlış
cevabı veriyordu (tuzak 22).

Boşluk (pencere) kuralları hâlâ **yok**. İstenirse sonra gelir.

---

## Bilinen tuzaklar — hepsi bu tür araçlarda kesin çıkar

1. **Sürüklerken re-render sürüklemeyi bozar.** Bu yüzden HTML5 drag-and-drop değil
   **Pointer Events** kullanılıyor. `pointermove` sırasında React state güncellenmez;
   hayalet kart `transform` ile doğrudan DOM'dan taşınır.
2. **Geçerli hücreler sürükleme başında bir kez hesaplanır**, her `pointermove`'da değil.
3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput` değil
   `defaultValue` + `onBlur`.
4. **Silme cascade olmalı.** Öğretmen silinince dersleri, ders silinince yerleşimleri,
   sınıf silinince ikisi de. Yetim `lessonId` kalırsa ızgara çöker.
5. **Gün/saat sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez hayalet
   dersler kalır, sayaçlar tutmaz.
6. **`sanitize()` her yüklemede ve her ayar değişikliğinde çağrılır.** 4 ve 5'in çaresi bu.
7. **localStorage silinebilir.** Karşı önlem: her değişiklikte otomatik kayıt + son 3
   durum ayrı anahtarda + görünür "Yedek indir". Babama tek alışkanlık öğretilecek:
   *değişiklik yaptın, yedek indir.*
8. **Yazdırma her zaman hafife alınır.** Sayfa başına bir sınıf/öğretmen
   (**satır = gün, sütun = ders, A4 YATAY**, `table-layout: fixed`). 72 sütunlu ana
   tablo basılmaz. Sonda değil ortada test edilir — ve "taşmıyor" yetmez: sütunların
   eşit olduğu ve sayfanın gerçekten yatay çıktığı ölçülür (`page.pdf` → MediaBox).
9. **Blok render'ında `rowspan` kullanılmaz.** rowspan + dinamik tablo = bug fabrikası.
   İkinci hücreye sade devam işareti konur.
10. **2100 hücre var.** Satırlar `React.memo` ile sarılı; bir yerleştirme 1-2 satır çizer.
11. **Gün listesi değişince anahtarlar kayar.** `placements` anahtarı gün **indeksi**
    tutuyor. Pazartesi listeden çıkarılırsa Salı 1'den 0'a kayar ve bütün program bir gün
    öne kayar — sessizce. Çare: `remapDays()` eşlemeyi **isimden** kurar, çıkarılan günün
    anahtarlarını siler, kalanları yeniden yazar. Her `updateSettings` bundan geçer.
12. **`Cuma` ve `Cumartesi` ikisi de `slice(0,3)` ile "Cum" olur.** Gün kısaltmaları
    `shortDay()` tablosundan gelir (`Cmt`, `Pzr`), ilk üç harften değil.
13. **Izgaraya eklenen her hücre sürükleme hedefi sanılır.** `drag.ts` hedefi
    `closest('[data-day]')` ile buluyor. Öğle arası ayraç sütunu `data-day`/`data-hour`
    **taşımaz**; taşısaydı ders öğle arasına bırakılırdı. Yeni bir sütun/hücre eklerken
    ilk soru bu.
14. **Tarayıcı açık temalı sayfayı kendi karartır.** Çare `color-scheme`'i iki temada da
    doğru kurmak. Renk *değerlerini* düzeltmek yetmez; `color-scheme` yoksa tarayıcı
    üstüne kendi algoritmasını uygular ve işlevsel renkler çamurlaşır.
15. **Palet üstündeki metin tema ile dönmemeli.** Öğretmen renkleri pastel ve iki temada
    da aynı; `color: inherit` bırakılırsa koyu temada açık metin pastel zemine düşer ve
    hücre okunmaz olur (`--on-color`).
16. **Kapalı saat işareti yalnız BOŞ hücreye çiziliyordu.** Müsaitlik program dizildikten
    *sonra* düzenleniyor; dolu bir saati kapatınca ders yerinde kalıyor ama tarama kartın
    altında kaldığı için **hiçbir yerde görünmüyordu**. `blocker()` de yakalayamaz —
    yalnız olası bir bırakma için çalışır. Çare `closedConflicts()`: ders **silinmez**
    (ilke 6), kırmızı işaretlenir ve Kontrol'de sayılır.
17. **Izgara hücresinin genişliğini `table.grid tbody td` belirler.** `.break-col` gibi
    tek sınıflı bir kural (0,1,0) ondan (0,1,3) zayıf kalır: öğle arası ayracı aylarca
    "dar" tanımlıyken bir ders kadar geniş çizildi. Yeni bir hücre genişliği
    veriyorsan ya seçiciyi güçlendir ya `!important` kullan — ve **ölç**.
18. **Bileşen sekme değişince sökülür.** `useState` içindeki her şey gider. Baskı sayfa
    seçimi bu yüzden `App`'te duruyor: Kurulum'a gidip dönmek listeyi siliyordu. Aynı
    şekilde seçimi "seçilenler" olarak tutmak yanlıştır — **dışarıda bırakılanlar**
    tutulur, yoksa sonradan eklenen sınıf sessizce basılmaz. **Otomatik dizme koşusu da
    aynı sebeple `App`'te** (`useSolver`): Kontrol'e bir göz atmak aramayı öldürürdü.
19. **Web Worker bu projede çalışmaz.** İki bağımsız sebep: Vite worker'ı **ayrı bir
    chunk** olarak üretir ve `vite-plugin-singlefile` onu gömmez — "tek dosya" iddiası
    düşer; kalan yol olan `blob:` worker'ı ise `file://`'in opaque origin'inden çalışır
    ve Chromium'da güvenilmez, üstelik kaynak string olacağı için `tsc` onu hiç görmez.
    Çözücü bu yüzden ana iş parçacığında, `requestAnimationFrame` ile **dilim dilim**
    çalışır. `setTimeout(0)` değil: iç içe beş çağrıdan sonra 4 ms'e kelepçelenir ve
    boyama garantisi vermez, yani ilerleme satırı görünmez.
20. **React reducer geri çağırımını GEÇ çalıştırır.** `change((d) => ...)` içine bir
    `ref` okuması koyup fonksiyondan sonra o `ref`'i temizlersen, geri çağırım
    çalıştığında `null` bulur ve **bütün iş sessizce atılır**. Otomatik dizmenin sonucu
    tam olarak böyle kayboldu. Referansı önce yerel bir değişkene al.
21. **Arama uzayını daraltan kısıtlama, değer sezgisini bozuyorsa kaybettirir.**
    Çözücüde "aynı dersin blokları artan hücre indisinde" simetri kırması vardı;
    "haftaya yay" sezgisi geç bir hücre seçince dersin kalan blokları oradan sonrasına
    hapsoluyordu. Ölçülen fark: **57718 düğümde 26 blok** ile **359 düğümde 359 blok**.
    Kaldırıldı. Teoride doğru olan, ölçülmeden konmaz.
22. **Sebep cümleleri gün ve saat adı taşır, o yüzden CÜMLE sayılmaz.** "En sık sebep"
    hesabı altmış farklı "sınıfın X saatinde Y var" satırını altmış ayrı sebep sayıyor,
    altı kez tekrarlanan daha önemsiz bir cümle kazanıyordu — hafta boyu kapalı bir
    öğretmen için "2 saatlik blok güne sığmıyor" yazdı. `blockerDetail()` bir **kod**
    döndürür (`teacherClosed`, `classBusy`, …); sayım koda göre yapılır.

23. **Testi yargılayan denetçinin kendisi test edilmeli.** `illegalBlocks()` her
    zaman `[]` döndürseydi çözücünün 19 dünyalık matrisi de, 24 E2E testi de
    bedavaya yeşil geçerdi — ve hiçbiri bunu haber vermezdi. `worlds.test.ts`
    ona bilerek bozuk ızgaralar verir (aynı öğretmen iki sınıfta, kapalı saatte
    duran ders, gün sonunu taşan blok) ve yakaladığını doğrular. Aynı sebeple her
    dünya testinde bir koruma var: kaydedilen yerleşim sayısı girişteki sayıdan
    büyük olmalı, yoksa iddialar dizimden ÖNCEKİ ızgarayı yargılıyor olabilir.

24. **`localStorage` kaydı 400 ms gecikmeli; "sonrasını oku" öncesini okur.**
    E2E'de bir eylemin sonucunu depodan doğrulamak için "eylemden önceki değeri al,
    sonra değişmesini bekle" yetmez: sayfanın *yüklenmesi* de kendi kaydını 400 ms
    sonra yazar, ve "önceki değer" o yazımdan önce alınmışsa beklenen değişiklik
    yüklemenin kendisi olur. Çare `settledText()`: tıklamadan önce sayfanın gerçekten
    bir şey yazmış olmasını beklemek. "Değer sabitlenene kadar bekle" de işe yaramaz —
    eski değer de sabittir.

25. **`--update-snapshots` tek başına yalnız KIRMIZI referansları yeniler.** Eşiğin
    (`maxDiffPixelRatio`) yuttuğu gerçek bir düzen değişikliği referansı sessizce
    eski bırakır. Hepsini yazdırmak için `--update-snapshots=all`. Müsaitlik satırı
    34 → 48 px olduğunda tam bunun oldu: tablo 84 px büyüdü, `npm run gorsel` yeşil
    geçti, referanslar yalan söylemeye başladı.

---

## Arayüz

Altı sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar**. Daha fazlası yok.

- **Sekmeler solda, dikey bir kenar çubuğunda** (92px; daraltılınca 52px, tercih
  `localStorage['ders-programi-kenar']`'da). Yatay bir şerit 768px'lik ekranda ızgaradan
  bir öğretmen satırı götürüyordu; yatayda ızgara zaten taşıyor ve kayıyor, yani 92px
  zaten kaydırılan bir yerden gidiyor. Daraltılmışken etiket gizlenir ama `aria-label`
  kalır — erişilebilir ad kaybolmaz.
- **İçerik ekranın tamamını kullanır.** Tek düzen kuralı `.cols` (+ `wide-left`,
  `narrow-right`): solda asıl iş, sağda o ekranın **anlamı** — Kurulum'da kapasite
  özeti, Ayarlar → Okul'da zil önizlemesi, Ayarlar → Kurallar'da canlı ihlal listesi,
  Müsaitlik'te varlık listesi, Yazdır'da sayfa seçimi. Sağa konan hiçbir şey yeni
  değil; hepsi ya bir sekme öteden ya tablonun üstünden geldi. Kontrol'de sabit iki
  sütun değil **akan kart ızgarası** (`.panel-grid`) — sorun yokken sol sütun boş
  kalmasın.

- **Kurulum yalnız listeler, Ayarlar yalnız ayarlar.** Kurulum dört sayılabilir adım:
  `1 Derslikler · 2 Öğretmenler · 3 Sınıflar · 4 Dersler`. Okul adı, günler, zil,
  kurallar ve branş listesi **Ayarlar**'da — dönem başında doldurulan şeyle yılda bir
  dokunulan şey aynı ekranda durmaz.
- **`Sıfırla` üst çubukta değil.** Ayarlar → Veri altında. Üst çubukta "Dosyadan aç"a
  bir yanlış tıklama uzaklıktaydı ve geri alınamıyor. `Dosyaya kaydet` / `Dosyadan aç`
  üst çubukta **kalır**: tuzak 7'nin karşı önlemi görünür olmak zorunda.

- **Sol tık taşır, sağ tık siler.** Yerleşmiş bir derse sol tıklamak bloğu siliyordu,
  dolayısıyla taşımanın tek yolu silip havuzdan yeniden sürüklemekti. Şimdi: sol düğme
  + sürükle = taşı, sağ tık = havuza gönder, Delete = aynısı klavyeden. Klavyeden gelen
  "click" `e.detail === 0` ile ayrılır, böylece odaklı kartta Enter/Space çalışır.
  Sürükleme haritası **kaynağı kaldırılmış** bir durum üstünde hesaplanır, yoksa ders
  kendi kendini engeller.
- **Otomatik dizme Program sekmesinde iki düğme**: `Otomatik diz (N)` ve `Baştan diz`
  (onaylı). Ayar yok — "sabaha yay" gibi tercihlerin doğru cevabı bir dönem
  kullanılmadan bilinemez (ilke 5). İlerleme ve sonuç `.reason-bar`'da: sabit
  yükseklikli, ızgarayı kaydırmıyor, göz zaten oraya alışkın. İlerleme **düz metin**,
  çubuk değil (yasak liste: animasyon). Bütün koşu **tek geri-al adımı**.
- Ana ekran aSc'deki gibi: **satır = öğretmen, sütun = 6 gün x 12 saat**, tek geniş
  tablo, altta yerleşmemiş kart havuzu. Saat başlığında ders numarası ve altında
  başlangıç saati (`3` / `10:40`).
- **Görünüm iki yazısız simge düğmesi**: Öğretmen / Sınıf. Seçili olan vurgulu,
  diğeri soluk. `aria-label` zorunlu — metin yok, erişilebilir ad onların tek adı.
  Yanındaki açıklama cümlesi kalır: simge yalnız başına ilk seferde tahmin ettirir.
- Sayaç 0 ise adım soluk. **Kilitli sihirbaz değil** — her adıma her an atlanır.
- **Branş yazılmaz, seçilir.** Serbest metin "Matemtik"i sessizce ikinci bir branş
  yapıyordu ve kısaltması yine "Mat" çıktığı için kâğıtta ayırt edilemiyordu. Liste
  Ayarlar'da yönetilir; "+ Yeni branş…" ile oracıkta eklenir. **Kullanılan branş
  silinemez**, mesaj kimin kullandığını sayar.
- **Başlangıç saati iki açılır liste** (00–23 ve beşer dakika), `<input type="time">`
  değil: o girdi AM/PM'i tarayıcının yereline göre seçer ve boşaltılınca günü sessizce
  00:00'a alırdı.
- **Yazdırmada hangi sayfaların basılacağı tek tek seçilir.** Sınıf ve öğretmen için
  ayrı onay listeleri, "Tümü / Hiçbiri", ve düğmede sayfa sayısı.
- **Eksen tutarlılığı.** Program ızgarasında sütun = gün × ders (babanın alışkanlığı).
  **Müsaitlik ve Yazdır'da satır = gün, sütun = ders** — ikisi de "bir günü okuma"
  ekranı, aSc'nin Time off penceresi de öyle.
- **Öğle arası, ekrana göre üç ayrı teknik.** Program ızgarasında dar bir ayraç
  SÜTUNU (ara konumu gün başına sabit); müsaitlik ve baskıda ara konumu satırdan satıra
  değiştiği için o satırın hücresine kalın kenarlık.
- **Yazdırma A4 YATAY**, `table-layout: fixed`, sütunlar eşit. Sütun başlığındaki saat
  yalnızca bütün günler uyuşuyorsa yazılır — kâğıtta yanlış saat yazmaktansa hiç yazmamak.
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, sarı = uyarı,
  kırmızı = engel, gri taralı = kapalı, kırmızı çerçeve = kapalı saatte kalmış ders.
  Öğretmen rengi havuzdaki kartla satırı eşleştirmeye yarar.
- **Hücreyi daima ÖĞRETMEN rengi boyar**, iki görünümde de. Sınıf rengi bir *işaret*:
  satır başındaki nokta ve basılan sayfanın başlığı. İki renk aynı kareyi paylaşmaz.
- **Havuz kartı görünümü takip eder.** Üst satır = ders yerleşince hücrenin okuyacağı
  şey, alt satır = kartın gideceği satır; sıralama alt satıra göre, ki bir satırın
  kartları yan yana dursun.
- **Açık ve koyu tema, sağ üstte düğme.** Öğretmen paleti iki temada da AYNI ve
  yazdırma her zaman açık palet kullanır — o renkler kâğıda basılıyor. Palet üstündeki
  mürekkep de tema ile dönmez (`--on-color`).
- **Dört düğme durumu, fazlası yok:** birincil · sade · tehlikeli · basılı. Tehlikeli
  olan beklemeden kırmızı görünür.
- Font: sistem fontu. Web font indirmek offline çalışmayı bozar.
- Ekran 1366x768 varsayılır. Öğretmen sütunu `sticky`, yatay kaydırma olacak.
- **Boş ekranlar yönlendirir.** "Henüz ders yok" değil, "Kurulum sekmesinden öğretmen
  ve sınıf ekleyin, sonra ders girin."
- **Silmeden önce her zaman onay**, ve metin ne kaybedileceğini sayar:
  "A dersliği silinecek. 4 sınıfın dersliği boşalacak (410, 411, 510, 511)…"

---

## Çalışırken

- Bir şey belirsizse **sor**, tahmin etme. Yanlış varsayımla yazılan kod, yazılmamış
  koddan pahalıdır.
- Bir sürümün **çıkma şartı** sağlanmadan sonrakine geçilmez.
- Özellikler babanın geri dönütüne göre önceliklenir. Kullanılmamış bir özelliğin
  "sonraki adımı" tahminle yazılmaz (ilke 5).

### Her oturumun sonunda — zorunlu

Bu bir istek değil, iş akışının parçası. Oturum bitmeden:

1. **`docs/TASKS.md`** — biten maddeler `[x]` işaretlenir, yeni çıkan işler eklenir,
   "ŞİMDİ SIRADA" bölümü bir sonraki oturumun ilk işini gösterecek şekilde yenilenir.
2. **`docs/STATUS.md`** — durum tablosu, ölçülen değerler, plandan sapmalar,
   doğrulanmayı bekleyen varsayımlar ve bilinen hatalar güncellenir. Tarih değişir.
3. **`CLAUDE.md`** — sadece *kalıcı* bir kural, karar veya tuzak ortaya çıktıysa.
   Günlük ilerleme buraya yazılmaz, o STATUS'ün işi.
4. **Dürüstlük şartı:** test edilmemiş bir şey "bitti" işaretlenmez. Kod yazıldı ama
   tarayıcıda doğrulanmadıysa STATUS'te bu açıkça yazar.
