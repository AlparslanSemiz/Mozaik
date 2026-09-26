# Veri

Kaydedilen verinin şekli, şema göçü, depolama anahtarları, dosya biçimleri ve kısıt kuralları.

Tam hâli `src/leaf/types.ts`'te. Değiştirmek pahalı: yerleşim anahtarları, yedek
dosyaları ve localStorage içeriği bu şekle bağlı, o yüzden değiştirmeden önce
düşünülür.

## State

```ts
State {
  schemaVersion: 16
  settings: Settings
  rooms: Room[]
  teachers: Teacher[]
  classes: ClassGroup[]
  lessons: Lesson[]
  unavailable: Record<`${entityId}|${day}|${hour}`, 1>   // öğretmen, sınıf ve derslik
  programs: ProgramVariant[]                           // aynı okulun program alternatifleri
  activeProgramId: Id                                  // ekranda, Kontrol'de ve kâğıtta olan
  answers: { accepted: Relaxation[]; refused: Refusal[] }   // öneriye verilen cevaplar
  relations: Relation[]   // iki ders arasındaki kural: aynı gün olmasın
}
ProgramVariant {
  id, name
  placements: Record<`${classId}|${day}|${hour}`, lessonId>
  pinned:     Record<`${classId}|${day}|${hour}`, 1>   // sabitlenmiş hücreler
}
Settings {
  schoolName: string
  days:   Day[]
  hours:  string[]       // ders etiketleri, uzunluğu günlük ders sayısı
  bell:   Bell           // saatler hesaplanır, tek tek saklanmaz
  limits: Limits         // okul geneli sınırlar
  rules:  Rules          // her sınır için 'off' | 'warn' | 'block'
  subjects: string[]     // okulun branş listesi, tamamı saklanır
  subjectShorts: Record<string, string>   // yalnız değiştirilen kısaltmalar
}
Day        { name, longBreakAfter }             // 5 = öğle arası 5. dersten sonra, 0 = yok
Bell       { start, lessonMinutes, breakMinutes, longBreakMinutes }
Limits     { maxConsecutive, maxPerDay, minPerDay, maxSameLessonPerDay,
             maxGapsTeacher, maxGapsClass }     // 0 = sınır yok, iki boşluk alanı hariç
Room       { id, name }
Teacher    { id, name, short, subject, subject2, gender, color, limits }
             // limits: { maxConsecutive, maxPerDay, minPerDay }, null = okul varsayılanı
ClassGroup { id, name, roomId, color, maxSameLessonPerDay }
Lesson     { id, classId, teacherId, weeklyHours, blocks, second, maxPerDay }
```

Alanların anlamı:

- `Teacher.subject2` öğretmenin ikinci branşı ya da `''`. `''` bir değer, eksik veri değil: listelerin çoğu tek branşlı ve bu da veri.
- `Teacher.gender` `''`, `'k'` ya da `'e'`. Listelerde sıralama ve gruplama için, kâğıda çıkmaz. Bir boolean değil, çünkü boolean ikisinden birini varsayılan seçip herkese sessizce atardı.
- `Teacher.color` ve `ClassGroup.color` paletin indeksi, bir hex değer değil.
- `ClassGroup.roomId` sınıfın sabit dersliği. `null` ise derslik çakışması denetlenmez.
- `ClassGroup.maxSameLessonPerDay` ve `Lesson.maxPerDay` günlük sınırın katmanları, `null` bir üstteki katmanı kullan demek.
- `Lesson.blocks` birden uzun blokların listesi, büyükten küçüğe. Her eleman 2 ya da 3, toplamı `weeklyHours`'u geçmez, kalanı tek saat: 9 saat ve `[3, 2]` 3+2+1+1+1+1 demek. Karar veren tek yer `blocks.ts`'teki `clampBlocks`.
- `answers`, babanın öneri paneline verdiği cevaplar (TODO B5.11):
  - `accepted`: "Olur" dediği değişiklikler. Sonraki arama onları yapılmış sayar ve bedel saymaz.
  - `refused`: "Olmaz" dedikleri. Her arama onlardan uzak durur. Bir öğretmen saatine dört türde denebilir: yalnız bu saatler, bütün gün, günde en fazla N saat, öğretmene hiç dokunma.
  - Planın verisi, çünkü öğretmenlere sormak günler sürüyor ve program kapanınca cevaplar gitmemeli (kullanıcının kararı, 2026-09-25).
  - Yeni bir cevap onunla çelişen eskisini geri alır (`answerYes`, `answerNo`).
  - Bir öneri uygulanınca "Olur"lar verinin kendisi olduğu için silinir, "Olmaz"lar kalır.
  - Silinen bir öğretmenin, dersin ya da günün cevabı `sanitize()` ile düşer. Gün listesi değişince `remapDays()` cevabı da kaydırır.
- `relations`, iki ders arasındaki kurallar (aSc'nin Planlama İlişkileri, TODO B5.3). Bugün tek tür var, `notSameDay`: iki ders aynı güne konmaz.
  - İki yönlü: ilişki iki uçtan da okunur (`notSameDayOf`), aynı çift bir kez söylenir (`addNotSameDay`).
  - Sert bir kural: çözücü ve öneri araması onu hiç çiğnemez, onu çiğneyecek bir bırakma reddedilir. Dersler yerleştirildikten sonra eklenen ve çiğnenen bir ilişki Kontrol'de ihlal olarak listelenir, dersler yerinden oynatılmaz.
  - Öneri araması onu esnetilebilir bir yol saymaz.
  - Silinen bir dersin (sınıfıyla ya da öğretmeniyle birlikte silinenin de) ilişkisi `sanitize()` ile düşer, iki ucu aynı ders olan ya da tekrarlanan bir çift de.
- `Lesson.second` dersin öğretmenin ikinci branşından mı verildiği. Öğretmenin ikinci branşı silinince `sanitize()` onu `false` yapar, yoksa ders kimsenin vermediği bir branşı iddia ederdi.

### Varsayılanlar

Yeni bir proje (`entities.ts`) Salı'dan Pazar'a altı günle (Pazartesi yok) ve günde
12 dersle doğar. Zil 09:00'da başlar: 40 dakika ders, 10 dakika teneffüs, 30
dakika öğle arası. Öğle arası hafta içi 5. dersten, Cumartesi ve Pazar 6. dersten
sonra, ve iki desende de 12. ders 19:10'da biter. `bell.test.ts` bunu açıkça iddia
eder.

Bütün sınırlar 0, yani sınır yok: bir sayıyı tahmin edip koymak yerine baba kendi
sayılarını giriyor. Kural seviyeleri: art arda, günde en fazla ve aynı dersten
günde en fazla `block`, günde en az `warn`, iki boşluk kuralı `off`, çünkü hiç
istemeyen bir okul yeni uyarılarla uyanmamalı. Branş listesi boş başlar.

## Şema sürümleri ve göç

| Sürüm | Değişen |
|---|---|
| v1 | Türkçe alan adları |
| v2 | İngilizce alan adları |
| v3 | `Day` nesneleri, zil saatleri, sınırlar ve kurallar |
| v4 | `settings.subjectShorts` |
| v5 | `ClassGroup.color` ve `settings.subjects` |
| v6 | `Teacher.gender` |
| v7 | `Lesson.pairs`, `blockSize`'ın yerine |
| v8 | `Teacher.subject2` ve `Lesson.second`: bir öğretmen iki branş verebilir |
| v9 | `Lesson.blocks`, `pairs`'ın yerine: blok 2, 3 ya da 4 saat |
| v10 | `pinned`: sabitlenmiş hücreler |
| v11 | `ClassGroup.maxSameLessonPerDay`: günlük sınıra bir orta katman |
| v12 | yerleşim ve sabitlemeler adlı program alternatiflerine taşındı |
| v13 | dört saatlik blok kaldırıldı, eski her 4 bir 3 ve örtük bir tek saat oldu |
| v14 | `Limits.maxGapsTeacher` ve `maxGapsClass`: boşluk kuralı, eksik alan 0 ve `off` |
| v15 | `answers`: öneriye verilen Olur ve Olmaz cevapları; eksik alan boş, okunamayan tek bir cevap tek başına düşer |
| v16 | `relations`: iki dersin aynı güne konmaması; eksik alan boş, okunamayan tek bir ilişki tek başına düşer |

`parseState` v1'i v2'ye, v2'yi v3'e taşır. v3'ten v16'ya her sürüm tek bir
okuyucudan geçer, ve `readLessons()` her tarihsel ders biçimini tek yerde çevirir:
v1'den v6'ya `blockSize`, v7 ve v8'de ikili blok sayısı `pairs`, v9'dan v12'ye
doğrudan `blocks`, ve v13'ten beri eski her 4 bir 3 olur. Kimlikler, gün
indeksleri, program alternatifleri, yerleşimler ve sabitlemeler olduğu gibi
geçer. Yalnız bir koşunun içindeki blok sınırı yeniden okunur, ve hiçbir sert
kısıt o sınıra bakmaz (tuzak 75). Bilinmeyen, ileriki bir sürüm `null` döner,
tahmin edilmez.

v5'ten önceki bir yedeğin branş listesi `defaultSubjects()`'e düşer, çünkü
listeden önce yazılmış bir dosya öğretmenlerinin taşıdığı branşları kaybetmemeli.
Bu iki yerde yapılıyor: `parseState` ve `migrateV2toV3`.

**Şema değişince** sürüm artırılır, göç kodu yazılır, ve hem birim hem E2E testi
eklenir, çünkü açılamayan eski bir yedek kaybolmuş veri demek. `parseState.ts`'teki
kabul listesine bir önceki sürümün numarası elle eklenir: `parseState`
`SCHEMA_VERSION`'a değil o listeye bakıyor, ve v16 çıkarılırken `version === 15` bu yolla eklendi. Bu adımı ölçen test bir sayı
adlandırmıyor, `SCHEMA_VERSION - 1`'in okunabildiğini soruyor (tuzak 97).

## Planlar ve program alternatifleri

Bir plan bir program demek: kendi okulu, kendi öğretmenleri, kendi ızgarası.
Planlar `library.ts`'te tutulur ve plan kimliği State'e konmuyor, yani bir yedek
dosyası hâlâ tek bir plandır ve plan eklemek şemayı değiştirmez. Taslak ayrı bir
varlık değil, `PlanInfo.draft` bayrağı taşıyan ve yerleşimi boşaltılmış bir plan.
Plan değiştirmek geri al yığınını sıfırlar, çünkü bir planın hamlesi başka bir
plana uygulanamaz, ve geçişten önce bekleyen kayıt hemen yazılır (tuzak 28).

Bir planın içinde program alternatifleri var (v12): aynı okulu, öğretmenleri ve
dersleri paylaşan ayrı ızgaralar. Yerleşimler ve sabitlemeler alternatife ait,
ve ekranda, Kontrol'de ve kâğıtta olan `activeProgramId`. Bir alternatife geçmek,
alternatif eklemek ya da silmek de geri al geçmişini temizler.

Geçici görünüm (soluklaştırılan ya da gizlenen satır ve günler, `programMask.ts`)
plan başına ve yalnız bellekte tutulur. Yedeğe ve depoya yazılmıyor, aynı planın
alternatifleri arasında ortak.

## Değişmeyen kimlikler

Program Mozaik adını aldığında aşağıdaki adlar bilerek eski kaldı. Hepsi verinin
bulunduğu yeri söylüyor, ve kimliği değişen bir veri silinmiş sayılır.

| Kimlik | Nerede | Değişirse |
|---|---|---|
| `ders-programi*` localStorage anahtarları | `library.ts` (planlar), `preferenceKeys.ts` (tercihler) | kayıtlı planlar ve tercihler programda görünmez olur |
| `ders-programi-YYYY-AA-GG-SSDD.json`, `ders-programi-tumu-…`, `ders-programi-YYYY-AA-GG.json` | `library.ts`, `folder.ts` | budama kalıbı eski günlük yedekleri tanımaz ve birikirler |
| `Belgelerim\Ders Programı` | `lib.rs`'in `FOLDER`'ı, `desktop.ts`'in `EXE_FOLDER`'ı | exe eski yedeklerini bulamaz |
| `com.dersprogrami.arac` | `tauri.conf.json`'ın `identifier`'ı | WebView2 profili, yani exe'nin localStorage'ı başka bir klasöre gider ve program boş açılır (tuzak 95) |
| `ders-programi-klasor` | IndexedDB, `folder.ts` | seçilen klasörün tutamağı kaybolur |

Depo adı da bu listedeydi ve yeniden adlandırıldı, bedeli tuzak 106'da. Yedek
dosya adının `Mozaik-*` olup olmayacağı TODO §8'de açık bir soru.

## Depolama anahtarları

| Anahtar | Ne tutar |
|---|---|
| `ders-programi` | "1" kimlikli planın State'i (tarihsel anahtar, tuzak 29) |
| `ders-programi-plan-<id>` | öteki planların State'i |
| `ders-programi-planlar` | plan listesi: `{ activeId, plans: [{ id, name, draft }] }` |
| `ders-programi-yedek-0`, `-1`, `-2` | oturum yedekleri, açılıştaki plana ait |
| `ders-programi-tema` | tema |
| `ders-programi-dil` | arayüz dili |
| `ders-programi-kenar` | kenar çubuğu tercihi, ray kalktığı için tarihsel |
| `ders-programi-olcek` | yazı büyüklüğü (`--ui-scale`) |
| `ders-programi-yogunluk` | ızgara yoğunluğu (`ferah`, `rahat`, `sigdir`) |
| `ders-programi-program-rengi` | Program kartlarını boyayan varlık |
| `ders-programi-arayuz-yogunluk` | arayüzün geri kalanının yoğunluğu |
| `ders-programi-havuz` | havuz çekmecesi açık mı |
| `ders-programi-havuz-boy` | havuz çekmecesinin boyu, rem |
| `ders-programi-serit` | araç şeridi açık mı |
| `ders-programi-serit-gizle` | şerit kaydırınca gizlensin mi |
| `ders-programi-musaitlik-saat` | müsaitlikte saatlerin gösterilmesi |
| `ders-programi-hareket` | hareket (`tam`, `az`, `kapali`) |
| `ders-programi-tanitim` | örnek veri teklifi görüldü mü |
| `ders-programi-baski` | kâğıt seçenekleri, tek bir JSON kaydı |
| `ders-programi-yenilik-gorulen` | görülen sürüm notu |
| `ders-programi-oneri-olcum` | bu makinedeki son 20 öneri aramasının ölçümü (`relaxLog.ts`) |

Bu listenin tamamı Ayarlar → Hakkında'daki "Veriler nerede" tablosunda görünür, ve
satırları `storageReport.ts` üretir, tercihlerinkini
`preferenceKeys.ts`'teki listeden. `e2e/planlar.spec.ts` sayfanın gerçekten yazdığı
her `ders-programi*` anahtarını o tabloda arar. Yeni bir tercih anahtarı
`preferenceKeys.ts`'e tablodaki adıyla birlikte girer, çünkü tablonun işi
"hepsi burada mı" sorusunda güvenilmek: `ders-programi-baski` haftalarca eksikti,
çünkü ancak biri bir baskı ayarına dokununca yazılıyor.

Yalnız bir oturumu ilgilendiren bir tercih `sessionStorage`'a gider ve bu satır
borcunu doğurmaz. Güncelleme şeridinin `Sonra`'sı böyle: o oturumda bir daha
sorulmaz.

Seçilen klasörün tutamağı localStorage'da değil `IndexedDB['ders-programi-klasor']`'da,
çünkü bir `FileSystemDirectoryHandle` string değil ve onu saklayabilen yol structured
clone. State'e konmuyor: bu bilgisayarda alınmış bir yedek başka bir makineye bir
klasör yolu taşımamalı.

Kâğıt seçenekleri `theme.ts`'te değil `printOptions.ts`'te ve tek bir JSON
kaydında. `theme.ts`'teki tercihler ilk boyamadan önce `<html>`'e öznitelik olarak
yazılan düzen değerleri. Kâğıt seçenekleri ise çizim anında bir React prop'u olan
tek bir karar ("kâğıtta ne var"), ve her seçeneğe ayrı bir anahtar, tek bir soru
için ayrı ayrı okuma ve düzeltme demekti.

Havuz boyu piksel değil rem, çünkü `--ui-scale` %150'ye çıkınca sabit piksellik
bir çekmece, içindeki kartlar büyümüşken görsel olarak küçülür. Ayrı bir anahtarda
duruyor, çünkü `ders-programi-havuz`'un anlamı "`kapali` değilse açık" ve içine bir
sayı katmak ayrıştırıcısına ikinci bir dal sokardı. `theme.ts` bağımsız tercihleri
bağımsız anahtarlarda tutuyor.

Her tercih `preference.ts`'teki fabrikayla kurulur ve üç sözü tutar. `apply` değeri
`<html>`'e depodan önce ve aynı çağrıda yazar, depo çalışmasa da. Kayıt yoksa ya da
depo okunamıyorsa yedek sorulur, okuma anında ve `normalize`'dan geçmeden, ama
kayıtlı `"0"` ya da `""` yokluk sayılmaz. `normalize` denetimin verdiği tipi de
depodaki dizeyi de kabul eder ve `write` değeri ondan geçirerek saklar. Yedeğin
makineye bakıp bakmaması tercihin kendi kararı: hareket ve dil bakar, tema bakmaz
ve kayıt yoksa açıktır (`theme.ts`'teki gerekçe). Sözleşme `src/preference.test.ts`'te,
her tercihin davranışı `src/preferences.test.ts`'te.

Hareket tercihi bir makine tercihi ve makinenin kendi tercihinin gerisine geçmez:
işletim sistemi "hareketi azalt" diyorsa seçim ne olursa olsun hareket kapalı, ve
ilk okumada kayıt yoksa tercih sistemden türetilir
(`normalizeMotion(raw, prefersReduced)`, [DESIGN.md](DESIGN.md), tuzak 58).

Dersler'in modu ve odağı, havuzun sırası ve süzgeci hiçbir yerde saklanmaz,
`toolState.ts`'te bir pozisyon olarak yaşar ([ARCHITECTURE.md](ARCHITECTURE.md)).

## Dosya biçimleri

```
{ "schemaVersion": 16, ... }   tek plan    ders-programi-YYYY-AA-GG-SSDD.json
{ "bundleVersion": 1, ... }    her plan    ders-programi-tumu-YYYY-AA-GG-SSDD.json
```

Üst çubuk tek planı yazar ve okur. Paket Ayarlar → Planlar ve yedek'te duruyor,
çünkü bir paketi açmak bu bilgisayardaki bütün planların yerine geçmek demek.
Paket `bundleVersion` taşır, `schemaVersion` değil: zarf ayrı sürümlenir, içindeki
her plan kendi `schemaVersion`'ıyla gelir ve aynı `parseState` göçünden geçer.
`bundle.ts` zarfı bilir, State'i bilmez. Paket bir depolama anahtarı değil.
Zarfta isteğe bağlı bir `olcum` alanı da olabilir. O, bu makinedeki öneri
aramalarının ölçümü (`ders-programi-oneri-olcum`), ve babanın gönderdiği dosyanın
aramanın onun makinesinde nasıl koştuğunu söylemesi için orada (TODO B5.11).
`parseBundle` onu okumaz, bu yüzden `bundleVersion` artmadı. İki
biçimin birbirine karışmaması için üç önlem birlikte var (tuzak 30).

Seçilen klasöre bütün planlar yazılır ve her gün için ayrı bir yedek bırakılır
(`ders-programi-YYYY-AA-GG.json`, son 10 gün). Yedekler ad kalıbıyla budanır,
sayılarak değil: klasör Belgelerim ve orada babanın kendi dosyaları duruyor, "en
yeni ondan gerisini sil" onların da üstünden geçerdi. Kalıba uymayan hiçbir dosyaya
dokunulmuyor, üst çubuğun saatli yedeği (`…-2026-08-26-1430.json`) dahil. Klasöre yazamamak sessiz kalmaz:
klasör silinmiş ya da izin geri alınmışsa satır kırmızı olur ve ne yapılacağını
yazar.

## Neden böyle

- **Branş öğretmenin alanı, ve iki tane olabilir.** "Türkçe ve Edebiyat" bir hiyerarşiyle anlatılamadığı için alt branş değil çift branş seçildi. Dersin hangi branştan verildiği bir bayrak (`Lesson.second`), branşın adı değil: ad ikinci bir gerçek olur ve öğretmenin branşı düzeltilince sessizce saparak kalırdı. `Teacher.subject` bir kimlik değil bir ad, yeniden adlandırmak ucuz kalsın diye.
- **Derslik sınıfın sabit alanı.** Yerleştirirken oda seçilmez, ama iki sınıf aynı dersliği paylaşıyorsa çakışma denetlenir.
- **`placements` düz bir sözlük, dizi değil.** Gün ya da saat sayısı değişince taşan anahtarlar silinir (tuzak 5).
- **Blok ayrı bir varlık değil, ve ızgara blok sınırı saklamaz.** Ardışık anahtarlara aynı `lessonId` yazılır. Bir dersin blokları eşit boylu olmayabildiği için (`2+1`) bir koşu birden çok türlü okunabilir, ve hangisi olduğuna tek bir fonksiyon karar verir: `constraints.ts`'teki `placedBlocks()` gün ve saat sırasıyla gezer, her koşuda önce uzun blokları alır, kalanı tek saat sayar. Izgara, havuz, sağ tık ve denetçi aynı fonksiyondan okur (tuzak 75).
- **Haftalık saatin şekli bir liste.** `blocks` birden uzun blokların boylarını, `weeklyHours` toplamı söyler, ve liste toplamı geçemediği için ikisi çelişemez. Tek sayı olan `pairs` yalnız "şu kadar ikili" diyebiliyordu, ondan önceki `blockSize` ise "her blok bu boyda" diyebiliyordu ve `2+1`'i söyleyemiyordu.
- **Anahtarlarda isim yok, hep kimlik.** Bir ad değişince yerleşim bozulmasın.
- **Zil saatleri hesaplanır.** Başlangıç ve üç süre yetiyor, günlerin tek farkı öğle arasının nereye düştüğü. Ders başına satır tutmak aynı bilgiyi on iki kez saklamak olurdu.
- **Kapalı saatler tek sözlükte.** Kimlikler üç liste arasında benzersiz, yani öğretmen, sınıf ve derslik aynı `unavailable` haritasını paylaşabiliyor. İkinci bir sözlük ikinci bir göç ve ikinci bir `sanitize` dalı demekti.
- **Sınırlar katmanlı.** `settings.limits` okul geneli, `Teacher.limits`, `ClassGroup.maxSameLessonPerDay` ve `Lesson.maxPerDay` içindeki `null` "bir üsttekini kullan" demek. "Aynı dersten günde en fazla" üç katmanlı ve sıra en dardan en genişe: dersin kutusu, sınıfın kutusu, okul. Her katmanda gerekçe aynı: 25 hocaya aynı sayıyı 25 kez girdirmemek, ve "510 bir günde aynı dersten en fazla 2 saat görsün"ü o sınıfın her dersine tek tek yazdırmamak. Çözen tek yer `rules.ts`'teki `lessonLimit()`, sınıf parametresi sondan ve isteğe bağlı (tuzak 76), sık çağrılan yollar sınıfı elden verir. Bir kutunun yer tutucusu bir üstteki katmanın sayısıdır, çünkü kullanılmayacak bir sayı gösteren yer tutucu yanlış bir şey söyler.
- **Branş kısaltmasında yalnız değiştirilen saklanır.** `Matematik`'in `Mat`'ı gömülü tablodan gelir. `subjectShorts`'a ancak varsayılandan farklı bir şey yazılınca kayıt düşer ve varsayılana geri yazılınca silinir. Böylece yedek gömülü tabloyla şişmez ve tablo iyileşirse eski proje de faydalanır.
- **Branş listesi tam saklanır.** `subjects` kullanıcının düzenlediği bir liste, ve gömülü tablodan türetilen bir liste "Fransızca'yı kaldır"ı ifade edemezdi. Branş silmek cascade gerektirmez, çünkü öğretmen branşın adını taşıyor.
- **Renk bir kimlik.** Her öğretmenin ve sınıfın kendi rengi var, `addTeacher` ve `addClass` kullanılmayan en küçük indeksi verir (`firstFreeColor`), sıradakini değil. Paletin kendisi [DESIGN.md](DESIGN.md)'de.
- **`schemaVersion` ilk günden var**, eski yedekler göç edebilsin diye.

## Kısıtlar

`blocker()` sırayla bakar ve ilk engelde döner. Mesaj somut: "Çakışma var" değil,
`"MÇ o saatte 433 sınıfında"`, çünkü programı dizen kişinin bir sonraki hamlesini
bu cümle belirliyor.

**Sert kısıtlar**, seviyeleri olmadan engeller:

1. Blok gün sonuna sığıyor mu (`dayEnd`)
2. Sınıfın o saatleri boş mu (`classBusy`)
3. Sınıf o saatte kapalı mı (`classClosed`)
4. Öğretmen o saatte müsait mi (`teacherClosed`)
5. Öğretmen o saatte başka sınıfta mı (`teacherBusy`)
6. Dersliği paylaşan başka bir sınıf o saatte ders yapıyor mu (`roomBusy`)
7. Derslik o saatte kapalı mı (`roomClosed`)
8. Aynı gün olmaması istenen bir ders o gün var mı (`relatedDay`, `State.relations`, v16). Kullanıcının iki ders arasına koyduğu kural olduğu için seviyesi yok, hep engeller.

**Ayarlanabilir kısıtlar**, `settings.rules`'ta `block` ise engeller, `warn` ise
yalnız sarı boyar (`rule`):

9. Öğretmen art arda en fazla N saat
10. Öğretmen günde en fazla N saat
11. Bir sınıf aynı dersten günde en fazla N saat

`minPerDay` (geldiği gün en az N saat) yerleştirirken denetlenemez, çünkü günün
ilk dersini koyarken her zaman ihlal edilir. Yalnız `findViolations()` üstünden
Kontrol'de çıkar ve seviyesi `block` olamaz.

Bir ilişki (8) dersler yerleştikten sonra eklenirse ve çiğnenirse `findViolations()`
onu `notSameDay` kuralıyla ve `block` seviyesinde listeler; dersler yerinden
oynatılmaz. Çözücü ve öneri araması onu hiç çiğnemez: çözücü `blocker()`'dan geçer
ve onarım evresi ilişkili dersin o günkü bloklarını da yerinden edilecekler sayar,
öneri aramasının formülünde iki dersin aynı günü birlikte tutması yasak.

**Boşluk kuralları** (`maxGapsTeacher`, `maxGapsClass`, v14) aynı desende. Bir gün
içinde ilk ve son dolu saat arasında kalan boş saat sayılır. Tek tanımı
`rules.ts`'teki `gapsBetween()` ve üç okuyucusu var: iki kural ve `worlds.ts`'teki
çözücü kalitesi ölçümü (`gridQuality()`). Bir bırakmayı engelleyemez, yani yalnız
`Kapalı` ya da `Uyar` seçilebilir. 0 öteki sınırlardan farklı olarak olduğu gibi
kullanılır ("hiç boşluk olmasın", öteki dört kuralda ise `limit > 0` şart), ve etkinliğini yalnız seviye belirler
(`gapRuleActive()`, `ruleActive()`'in ayrı ikizi).

`blocker()` sert kısıtları ve `block` seviyesindeki kuralları döndürür, `check()`
onun üstüne `warn` seviyesindekileri uyarı olarak ekler, ve ikisi aynı
`limitBreaches()` fonksiyonunu kullandığı için mesajları ayrışamaz. `blocker()`
`blockerDetail()`'in ince bir sarmalayıcısı: asıl fonksiyon mesajın yanında bir kod
da döndürür (yukarıdakiler, `missing` ve `rule`; ilişkinin kodu `relatedDay`). Sebepleri sayan her yer
(Kontrol'ün yerleşemeyen dersleri, çözücünün tıkanma cümlesi) koda göre gruplar,
çünkü mesaj gün ve saat adı taşıyor (tuzak 22).

### Bir kartı bırakırken

`dropMap()` sürükleme başında her hücrenin yargısını bir kez hesaplar (tuzak 2).
Bu bir çizim kararı değil, kısıt motorunun cevabı, ve `check()`'in üstüne iki şey
ekler.

- **Takas.** Izgarada duran bir kart, altında tek bir hedef blok bulunan bir hücreye bırakılıyorsa ve iki hamle de yasalsa (`swapBlocks`), iki kart yer değiştirir. Hedef birden çok bloksa takas ancak o bloklar bırakılan saatleri tam dolduruyorsa (aynı gün, boşluksuz, üst üste binmeden, toplam boy aynı) ve hepsi aynı sırayla kartın eski saatlerine yasal olarak geçebiliyorsa teklif edilir: iki saatlik bir blok, öğretmenin başka sınıftaki iki tek saatiyle yer değiştirebilir (TODO B5.7). Sınıfın kendi dersi ile öğretmenin başka sınıftaki dersi aynı saatteyse bu bir takas değil, hücre reddedilir.
- **Havuza döndürme.** Takas yoksa tek bir ret geçersiz kılınabilir: hücrede sınıfın kendi başka dersi varsa o ders havuza döner. Öteki retler başkasıyla ilgili (öğretmen başka sınıfta, derslik dolu, saat kapalı) ve önündeki bloğu havuza atmak onların hiçbirini doğru yapmaz. Oradaki blok sabitlenmişse hücre reddedilir ve sebep cümlesi sabitlemeyi söyler. Havuza döndürdükten sonra da reddedilen bir hücrenin cümlesi o asıl sebep olur, "sınıf dolu" değil. İzin verilen hücre yeşil değil sarı, çünkü izin var ama bir şey kaybediliyor. Bütün hamle tek geri al adımı ve kaybedilen ders bildirimde adıyla yazılır.

Geçici görünümle kapsam dışına alınmış bir güne bırakılamaz.

### Sabitleme

Sabitlenmiş bir blok yalnız sabitleme kaldırılınca iner. Bu kilidi taşıyan
yollar: `removeBlock` (sağ tık, menü, Delete), `dropMap` (üstüne bırakma ve takas),
sürüklemenin başlangıcı, `solver.ts` (`keepPlaced: false` sabitlenmiş hücreleri
tohum olarak alır), ve şeritteki `Baştan diz` ile `Programı boşalt`. Bilinen tek
istisna, bir dersi başka bir öğretmene ya da sınıfa aktarmak: o dersin
sabitlemeleri kalkar. Kilit `pinned`'da, hücreye bağlı ve derse değil, çünkü bir
ders birden çok blok hâlinde iner ve kilitlenen şey bir kare.

Denetçi `illegalBlocks()` kapısız `liftBlock()`'u kullanır, çünkü "bu blok buraya
geri konabilir mi" bir kural sorusu, ve sabitleme bir kural değil (tuzak 98).

### Kapalı saatte kalmış ders

Müsaitlik program dizildikten sonra düzenlenince dolu bir saat kapanabilir. Ders
silinmez (veri kaybı olmaz ilkesi), kırmızı işaretlenir ve Kontrol'de sayılır
(`closedConflicts()`, tuzak 16).
