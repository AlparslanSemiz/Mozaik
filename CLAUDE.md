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

Kullanıcı hesapları · bulut senkronizasyonu · mobil uygulama · karanlık mod ·
tema seçimi · animasyon · istatistik/dashboard · yoklama · not girişi · öğrenci kaydı ·
SMS/e-posta · takvim entegrasyonu · PDF kütüphanesi (tarayıcının yazdırması yeterli) ·
birden çok program sürümünü yan yana tutma · sürükleyerek ders süresi uzatma ·
undo/redo geçmişi ağacı (düz yığın yeterli)

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
npm test          # Vitest — 133 birim testi
npm run build     # dist/index.html tek dosya üretir
npm run test:e2e  # Playwright — derler, sonra 26 E2E testi
npm run kontrol   # hepsi: tsc + birim + derleme + E2E
```

Yeni bilgisayarda bir kez: `npm install && npx playwright install chromium`

### Test katmanları — hangisi neyi yakalar

| Katman | Nerede | Neyi yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite, zil saatleri, kural limitleri, gün taşıma |
| Duman | `src/App.test.tsx` (jsdom) | Bileşenler çiziliyor mu, sekmeler çöküyor mu |
| **E2E** | `e2e/*.spec.ts` (Playwright) | **Düzen, sürükleme, kaydırma, yazdırma, `file://`** |

E2E, `dist/index.html`'i `file://` üzerinden 1366×768'de açar — yani **babanın çift
tıklayacağı dosyanın ta kendisini**. jsdom'un düzeni yok; sürükle-bırak, sabit sütun,
ekran dışı hedef ve yazdırma taşması **yalnızca burada** görünür. Nitekim tuzak 11 ve
12 (bkz. PLAN.md) bu testlerle bulundu, başka türlü bulunamazdı.

> Sürükleme, kaydırma, düzen veya yazdırma davranışını değiştiriyorsan
> **`npm run test:e2e` çalıştırmadan bitti deme.**

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
  |
constraints.ts / feasibility.ts SAF fonksiyonlar. React, DOM, localStorage BİLMEZ.
rules.ts / bell.ts              Testleri zorunlu.
import.ts / entities.ts
  |
store.ts                        reducer + geri al yığını + localStorage + göç
  |
components/*.tsx                sadece görüntüleme ve olay yakalama
```

`rules.ts`, `constraints.ts`'ten **yalnızca `Index` tipini** alır (`import type`,
derlemede silinir) — çalışma zamanında döngü yok. Anahtar üreten fonksiyonlar
`keys.ts`'te; `constraints.ts` onları yeniden dışa aktarır, çağrı yerleri değişmez.

**Kural:** iş mantığı bileşenlerin içine yazılmaz. Bir `.tsx` dosyasında çakışma
hesabı görüyorsan yanlış yerdedir — `constraints.ts`'e taşı.

**Kural:** `constraints.ts`, `feasibility.ts`, `import.ts`, `rules.ts`, `bell.ts`
içindeki her dışa aktarılan fonksiyonun testi olacak. Bu dosyalara test yazmadan
özellik eklenmez. `store.ts` içindeki `parseState` ve `entities.ts` içindeki
`remapDays` de test edilir: ilkinden her yedek dosyası geçer, ikincisi gün listesi
değişince programın kaymasını engelleyen tek şeydir.

---

## Veri modeli — özet

Tam hâli [src/types.ts](src/types.ts). Değiştirmek pahalı; değiştirmeden önce düşün.

```ts
State {
  schemaVersion: 3
  settings: {
    schoolName: string
    days:   Day[]      // varsayılan 6 gün: Salı..Pazar (Pazartesi ders yok)
    hours:  string[]   // ders ETİKETLERİ; uzunluk = günlük ders sayısı (12)
    bell:   Bell       // saatler hesaplanır, tek tek saklanmaz
    limits: Limits     // okul geneli varsayılan sınırlar
    rules:  Rules      // her sınır için Kapalı / Uyar / Engelle
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
ClassGroup { name, roomId }                 // derslik sınıfın sabit alanı, seçilmez
Lesson     { classId, teacherId, weeklyHours, blockSize, maxPerDay }
```

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
- **`schemaVersion` ilk günden var.** v1 = Türkçe alan adları, v2 = İngilizce,
  v3 = `Day` nesneleri + zil saatleri + kurallar. `parseState` v1'i v2'ye, v2'yi v3'e
  taşır; `id`'ler ve gün indeksleri değişmediği için `unavailable` ve `placements`
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
8. **Yazdırma her zaman hafife alınır.** Sayfa başına bir sınıf/öğretmen (6 sütun x 12
   satır, A4 dikey). 72 sütunlu ana tablo basılmaz. Sonda değil ortada test edilir.
9. **Blok render'ında `rowspan` kullanılmaz.** rowspan + dinamik tablo = bug fabrikası.
   İkinci hücreye sade devam işareti konur.
10. **2100 hücre var.** Satırlar `React.memo` ile sarılı; bir yerleştirme 1-2 satır çizer.
11. **Gün listesi değişince anahtarlar kayar.** `placements` anahtarı gün **indeksi**
    tutuyor. Pazartesi listeden çıkarılırsa Salı 1'den 0'a kayar ve bütün program bir gün
    öne kayar — sessizce. Çare: `remapDays()` eşlemeyi **isimden** kurar, çıkarılan günün
    anahtarlarını siler, kalanları yeniden yazar. Her `updateSettings` bundan geçer.
12. **`Cuma` ve `Cumartesi` ikisi de `slice(0,3)` ile "Cum" olur.** Gün kısaltmaları
    `shortDay()` tablosundan gelir (`Cmt`), ilk üç harften değil.

---

## Arayüz

Beş sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır**. Daha fazlası yok.

- Ana ekran aSc'deki gibi: **satır = öğretmen, sütun = 6 gün x 12 saat**, tek geniş
  tablo, altta yerleşmemiş kart havuzu. Tek düğmeyle satır = sınıf görünümüne geçilir.
  Saat başlığında ders numarası ve altında başlangıç saati (`3` / `10:40`); öğle arasının
  düştüğü yerde kesikli dikey ayraç.
- **Müsaitlik sekmesi üç türü de aynı ızgarayla girer**: Öğretmen · Sınıf · Derslik.
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, kırmızı = engel, gri
  taralı = öğretmen yok. Öğretmen rengi havuzdaki kartla satırı eşleştirmeye yarar.
- Font: sistem fontu. Web font indirmek offline çalışmayı bozar.
- Ekran 1366x768 varsayılır. Öğretmen sütunu `sticky`, yatay kaydırma olacak.
- **Boş ekranlar yönlendirir.** "Henüz ders yok" değil, "Kurulum sekmesinden öğretmen
  ve sınıf ekleyin, sonra ders girin."

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
