# Kurs Ders Programı — Teknik Plan

Hedef: babamın kursunda haftalık ders programını dizmek için kullanacağı araç.
Ölçek: ~25 öğretmen, ~20 sınıf, 8 derslik, 6 gün × 12 saat. Hepsi ayarlanabilir.

> **Güncelleme (2026-08-24).** Bu belgenin çerçevesi ve ilkeleri aynen geçerli.
> Soru turu ve babamın gerçek aSc ekranının fotoğrafı (`docs/Örnek Fotolar/Yaklaşık
> ders planı ölçeği.png`) sonrası bölüm 2, 3, 4 ve 6 düzeltildi — düzeltmeler yerinde
> işlendi, verilen kararların tam listesi `docs/STATUS.md` içindeki karar tablosunda.
>
> **Güncelleme (2026-08-24, v0.6).** Hafta artık **6 gün (Salı–Pazar)**; aşağıdaki
> "7 gün × 12 saat / 84 sütun" sayıları v0 tasarımının yazıldığı günden kalma. Gerekçeler
> geçerli, sayılar değil — güncel şema ve kısıt listesi [../CLAUDE.md](../CLAUDE.md)
> içinde, ne değiştiği [STATUS.md](STATUS.md) oturum kaydında.

Bu bir aSc klonu **değil**. aSc'nin yaptığı işin kursla ilgili olan %10'unu yapıp
o %10'u aSc'den iyi yapmak hedefi.

---

## 0. Değişmez ilkeler

Her özellik kararında bu listeye dönülecek. Listeyle çelişen özellik yazılmaz.

1. **Babam kurulum yapmayacak.** İndir, çift tıkla, çalışsın. Kurulum sihirbazı,
   hesap açma, şifre, güncelleme kontrolü yok.
2. **Sunucu yok.** Backend, veritabanı, deploy, domain, sertifika yok.
   Ben Karlsruhe'deyken çöken bir şey olmayacak.
3. **İnternet gerekmez.** CDN'den tek bir dosya bile çekilmeyecek. Kurs internetsiz
   kaldığında program yapılamıyor olması kabul edilemez.
4. **Türkçe.** Tek dil. i18n altyapısı yok, string dosyası yok, doğrudan Türkçe yazılır.
5. **Bir dönem kullanılmadan özellik eklenmez.** Tahmine dayalı özellik yazmak,
   yanlış özelliği yazmaktır.
6. **Veri kaybı kabul edilemez.** Her şey her an dışa aktarılabilir olacak.

### Yasak liste (bunlar bu projeye asla girmeyecek)

Kullanıcı hesapları · bulut senkronizasyonu · mobil uygulama · karanlık mod ·
tema seçimi · animasyon · istatistik/dashboard · yoklama · not girişi ·
öğrenci kaydı · SMS/e-posta · takvim entegrasyonu · PDF kütüphanesi
(tarayıcının yazdırması yeterli) · birden çok program sürümünü yan yana tutma ·
sürükleyerek ders süresi uzatma · undo/redo geçmişi ağacı (düz stack yeterli)

---

## 1. Teknoloji

```
Vite + React + TypeScript
vite-plugin-singlefile  → dist/index.html  (tek dosya, gömülü JS/CSS)
Vitest                  → kısıt mantığı testleri
```

Neden bu: VS Code'da düzgün geliştirme deneyimi (tip kontrolü, HMR) ama çıktı
tek bir HTML dosyası. Babama giden şey `index.html`, başka hiçbir şey değil.

React dışında **runtime bağımlılığı yok**. Tarih kütüphanesi yok, UI kütüphanesi
yok, state yönetimi kütüphanesi yok, sürükle-bırak kütüphanesi yok. Hepsi
gereksiz ve hepsi bir gün bozulur.

CSS: tek bir `styles.css`, CSS değişkenleriyle. Tailwind gerekmez, bu kadar
küçük bir yüzeyde ekstra araç.

---

> **Not (2026-08-24):** bu belge v0 planlandığı gündeki hâliyle duruyor; aşağıdaki
> kod örneklerinde tanımlayıcılar Türkçe. Kod o zamandan beri İngilizceye çevrildi
> (`Durum`→`State`, `yerlesim`→`placements`, `kisit.ts`→`constraints.ts`,
> `engel()`→`blocker()`, `indeksle()`→`buildIndex()`, `temizle()`→`sanitize()`,
> `semaSurumu` 1→`schemaVersion` 2). **Gerekçeler geçerli, adlar değil** — güncel
> adlar için [../CLAUDE.md](../CLAUDE.md), geçişin ayrıntısı için
> [STATUS.md](STATUS.md).

## 2. Veri modeli

**Bu bölümü sonradan değiştirmek pahalı. Kod yazmadan önce sorular
cevaplanmalı (bkz. bölüm 8).**

```ts
type Id = string;   // 8 karakter rastgele. ASLA isim veya dizi indeksi.

interface Durum {
  semaSurumu: 1;              // ilk günden. göç için gerekli.
  ayar: {
    gunler: string[];         // ["Pazartesi", ... "Pazar"]
    saatler: string[];        // ["1", ... "12"] veya "09:00-09:45" — görünen ad
  };
  derslikler: Derslik[];
  ogretmenler: Ogretmen[];
  siniflar: Sinif[];
  dersler: Ders[];
  musaitDegil: Record<string, 1>;  // `${ogretmenId}|${gun}|${saat}` -> gelemez
  yerlesim: Record<string, Id>;    // `${sinifId}|${gun}|${saat}` -> dersId
}

interface Derslik { id: Id; ad: string; }              // "A" .. "H"

interface Ogretmen {
  id: Id;
  ad: string;
  kisaltma: string;   // "MÇ" — ızgarada satır başlığı
  brans: string;      // "Matematik" — serbest metin, ayrı tablo değil
  renk: number;       // palet indeksi (0-11), hex değil
}

interface Sinif {
  id: Id;
  ad: string;             // "510"
  derslikId: Id | null;   // sabit. yerleştirirken seçilmez.
}

interface Ders {
  id: Id;
  sinifId: Id;
  ogretmenId: Id;
  haftalikSaat: number;   // haftalık toplam ders saati
  blok: number;           // arka arkaya kaç saat (1, 2 veya 3)
}
```

### Neden bu şekilde

- **Branş öğretmenin alanı, dersin değil.** Her öğretmenin tek branşı var. Branşı
  her ders satırında tekrar yazdırmak hem gereksiz veri girişi hem tutarsızlık
  kaynağı olurdu. Serbest metin — ayrı tablo, ekleme ekranı ve yönetim ekranı yok.
- **Derslik var, ama sınıfın sabit alanı olarak.** Fotoğrafta ~20 sınıf 8 dersliği
  paylaşıyor (A: 410/411/510/511, D: 414/415/530/531). Yerleştirirken oda
  *seçilmiyor* — UI'ya hiçbir karmaşıklık eklemiyor — ama aynı dersliği paylaşan
  iki sınıf aynı saate konamıyor. `derslikId: null` ise kontrol atlanır; derslik
  girmemiş kullanıcı da programı dizebilir.
- **Renk paletten indeks, hex değil.** Öğretmen rengi işlevsel: havuzdaki kartın
  hangi satıra ait olduğunu gösterir. Elle renk seçtirmeye gerek yok.
- **`yerlesim` düz bir sözlük, dizi değil.** Gün/saat sayısı değiştiğinde dizi
  yeniden boyutlandırmakla uğraşmak yerine taşan anahtarlar silinir.
- **`yerlesim` sınıf anahtarlı, öğretmen değil.** Öğretmen ve derslik doluluk
  haritaları `indeksle()` ile tek geçişte türetilir. Aynı veriyi iki yerde tutmak
  senkronizasyon hatası demek.
- **Bloklar ayrı bir varlık değil.** İki saatlik blok, iki ardışık anahtara aynı
  `dersId` yazılarak temsil edilir. Kaldırırken bloğun başı geriye doğru
  yürüyerek bulunur. Bu, veri modelini basit tutuyor.
- **`semaSurumu` ilk günden var.** İkinci dönem modeli değiştirirsen eski
  yedekleri okuyabilmen gerekir. Sonradan eklenemez.

---

## 3. Kısıt mantığı (projenin çekirdeği)

Tamamen saf fonksiyonlar. React'ten, DOM'dan, localStorage'dan bağımsız
tek bir dosyada (`src/kisit.ts`). **Bu dosyanın testleri yazılacak.**

```ts
// null → yerleştirilebilir, string → engelin insan diliyle sebebi
function engel(d: Durum, dersId: Id, gun: number, slot: number): string | null
```

Sırasıyla bakılacak sert kısıtlar (v0):

1. Blok gün sonuna sığıyor mu (`saat + blok <= saatler.length`)
2. Sınıfın o saatleri boş mu
3. Öğretmen o saatte gelebiliyor mu (`musaitDegil` sözlüğü)
4. Öğretmen o saatte başka bir sınıfta ders veriyor mu
5. Dersliği paylaşan başka bir sınıf o saatte ders yapıyor mu

**v0.6'da eklenenler** (bkz. CLAUDE.md "Kısıtlar", güncel liste orada):
sınıfın kapalı saati, dersliğin kapalı saati (ikisi de sert); art arda en fazla N,
günde en fazla N, bir dersin günde en fazla N saati (üçü de *Kapalı / Uyar / Engelle*).

**Boşluk (pencere) kuralları hâlâ yok.** Sınıfın veya öğretmenin gün içinde boş
saati olması kontrol edilmiyor. İstenirse aynı üç seviyeli ayarla eklenir — ikisini
birden sert yapmak çoğu programı çözümsüz bırakır.

Hata mesajı **her zaman somut** olacak. "Çakışma var" değil,
`"MÇ o saatte 433 sınıfında"`. Programı dizen kişinin bir sonraki hamlesini
belirleyen şey bu cümle.

### Testler (Vitest, ~12 test, bir saatlik iş)

Bu testleri yazmamak projenin en olası çöküş sebebi. Sürükle-bırakla elle test
etmek yavaş ve eksik.

- boş ızgaraya yerleştirme geçer
- dolu sınıfa yerleştirme engellenir
- öğretmenin müsait olmadığı saate yerleştirme engellenir
- öğretmen başka sınıfta ders verirken engellenir
- dersliği paylaşan sınıf o saatte doluyken engellenir
- `derslikId === null` iken derslik kontrolü atlanır
- 2'li blok son saate konamaz
- 3'lü blok güne sığmıyorsa reddedilir
- blok kaldırıldığında tüm saatleri temizlenir
- ortadan tıklanan blok tamamen kalkar (baş bulma mantığı)
- öğretmen silinince dersleri ve yerleşimleri de silinir
- sınıf silinince dersleri ve yerleşimleri de silinir
- saat sayısı azalınca taşan yerleşimler temizlenir
- aynı öğretmen aynı sınıfta üst üste iki derste çakışma vermez
- sayaç (yerleşen/toplam) doğru sayar
- fizibilite: yük > müsaitlik olan öğretmen tespit edilir

---

## 4. Sürümler

Her sürümün bir **çıkma şartı** var. Şart sağlanmadan sonrakine geçilmez.

### v0 — Elle dizme (zorunlu, tek başına kullanılabilir)

Çıkma şartı: *babam gerçek verisiyle bir haftalık programı baştan sona dizip
çıktısını alabiliyor.*

- Kurulum: gün/saat düzeni, derslik listesi, öğretmen listesi, sınıf listesi,
  ders listesi. Ayrıca **Excel'den yapıştırarak toplu giriş** — ilk kurulumda
  300+ satır veriyi tek tek girdirmek babamın pes edeceği yer.
- Müsaitlik ızgarası: öğretmen seç, gelemeyeceği saatlere tıkla. Sürükleyerek
  toplu boyama ve gün/saat başlığından toplu değiştirme (25 × 84 hücre tek tek tıklanmaz).
- Program ızgarası: satır = öğretmen, sütun = 7 gün × 12 saat, altta yerleşmemiş
  kart havuzu. Tek düğmeyle satır = sınıf görünümüne geçiş.
- Sürükle-bırak: sürüklerken geçerli hücreler yeşil, engel varsa üst çubukta sebep
- Yerleşmiş derse tıkla → kalksın (blok ise tamamı)
- Sayaç: her ders için `yerleşen/toplam`
- **Geri al (Ctrl+Z), en az 20 adım.** Sürükle-bırakta yanlış bırakma sürekli
  olur. Bu bloat değil, temel işlev.
- Kayıt: localStorage otomatik + "Yedek indir" (.json) + "Yedek yükle"
- Yazdırma: **sayfa başına bir sınıf / bir öğretmen** (7 sütun × 12 satır, A4 dikey).
  84 sütunlu ana tabloyu basmak imkânsız — sütun başına 3 mm düşer, denenmeyecek.

### v0.6 — Zil saatleri, gün seçimi, müsaitlik ve kural kutuları ✅

Çıkma şartı: *babam okulunun gerçek gün/saat düzenini ve öğretmen sınırlarını araca
tarif edebiliyor.* → sağlandı (2026-08-24, ikinci tur).

Babanın aSc ekran görüntüleri (`docs/Örnek Fotolar/`) üzerine kurgulandı:

- **Zil saatleri.** Başlangıç + ders/teneffüs/öğle arası dakikası; saatler hesaplanır.
  Varsayılan 09:00 · 40 · 10 · 30, hafta içi 5. hafta sonu 6. dersten sonra ara,
  12. ders iki desende de 19:10'da biter. Kurulum'da canlı önizleme tablosu.
- **Gün seçimi.** 7 gün checkbox; varsayılan hafta **Pazartesisiz 6 gün**.
  Gün eklenip çıkarılınca yerleşimler isimden eşlenerek taşınır (tuzak 14).
- **Sınıf ve derslik müsaitliği.** Öğretmeninkiyle aynı ızgara, aynı sözlük.
- **Kural kutuları.** Art arda en fazla · günde en fazla · günde en az · bir dersin
  günlük sınırı. Her biri Kapalı / Uyar / Engelle; okul geneli varsayılan +
  öğretmen/ders bazında istisna.

### v0.5 — Yapılabilirlik kontrolü

Çıkma şartı: *program dizilemediğinde babam sebebini araca sorup öğrenebiliyor.*

Bu, aSc'nin yapmadığı ve kursta en çok acıtan şey. Solver'dan önce gelir çünkü
çok daha ucuz ve çok daha faydalı.

- Her hoca için: müsait slot sayısı vs. yüklenen toplam saat
  → `"Ahmet Hoca 8 saat müsait, 11 saat ders yüklenmiş. 3 saat fazla."`
- Her grup için: toplam ders saati vs. toplam slot
- Sıkışıklık uyarısı: yük > müsaitlik × 0.85 ise "zor olacak"
- Aynı hocayı paylaşan grup çiftleri için ortak müsait slot kontrolü

### v1 — Kalanları otomatik doldur

Çıkma şartı: *elle 5 ders sabitlenmiş bir programda "doldur" düğmesi kalanı
bir saniyenin altında yerleştiriyor.*

Bu ölçekte kütüphane gerekmez. Düz backtracking:

- Sabitlenmiş (elle konmuş) dersler değişmez, domain'leri sabit
- **MRV**: en az yerleştirilebilir slotu kalan dersi önce yerleştir
- Forward checking: yerleştirdikten sonra kalanların domain'i boşaldıysa geri dön
- Rastgele restart, 500ms sonra pes et
- Başarısız olursa **hangi derste tıkandığını söyle**, sessizce başarısız olma
- Web Worker'da çalıştır, UI donmasın

### v2 — Kalite (yumuşak kısıtlar)

Sadece v1 çıktısı "çalışıyor ama çirkin" ise yapılır. Değilse yapılmaz.

- Aynı branş bir grupta günde en fazla N saat
- Hocanın boş günü tercihi
- Hoca boşluklarını azaltma
- Uygulama: v1 çözümünü al, N kez rastgele ikili takas dene, ceza düşüyorsa kabul et.
  Basit hill-climbing, optimizasyon kütüphanesi gerekmez.

### v3 — Dönem içi değişiklik

Sadece babam "asıl derdim bu" derse. (Soru 7)

- "Bu hafta Ahmet Hoca yok" → etkilenen dersleri işaretle, boş alternatif öner
- Haftalık sapmaları ana programdan ayrı tut, ana program bozulmasın

---

## 5. Bilinen tuzaklar

Bunlar tahmin değil, bu tür araçlarda kesin çıkacak sorunlar.

1. **Sürükleme sırasında DOM'u yeniden çizmek sürüklemeyi iptal eder.**
   HTML5 drag-and-drop'ta `dragstart` içinde sürüklenen elemanı silen bir re-render
   yaparsan tarayıcı işlemi iptal eder. **Çözüm: HTML5 DnD hiç kullanılmıyor,
   Pointer Events kullanılıyor** — bu tuzak orada hiç oluşmuyor. `pointermove`
   sırasında React state güncellenmiyor; hayalet kart `transform` ile doğrudan
   DOM'dan taşınıyor, ızgara hiç yeniden çizilmiyor.

2. **Geçerli hücreler sürükleme başında bir kez hesaplanır**, her `pointermove`'da
   değil. Sürüklenen ders belli olduğu için sadece o öğretmenin satırı hedef
   olabilir → 84 `engel()` çağrısı, bir kez, sonuç bir `Set`. Yavaş makinede
   sürüklemeyi akıcı tutan şey bu. (Dokunmatik desteği de Pointer Events'le
   bedava geliyor; hedef değil ama ileride gerekirse bozulmadan çalışır.)

3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput`
   değil `onBlur`/`onChange` kullan, ya da input'ları controlled yapmayıp
   `defaultValue` + `onBlur` ile oku.

4. **Silme işlemleri cascade olmalı.** Öğretmen silinince dersleri, ders silinince
   yerleşimleri, sınıf silinince ikisi de. Yetim `dersId` kalırsa ızgara
   `undefined` render eder ve çöker.

5. **Saat/gün sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez
   hayalet dersler kalır, sayaçlar tutmaz, babam güvenini kaybeder.

   *4 ve 5'in tek çaresi:* `temizle()` saf fonksiyonu **her yüklemede ve her ayar
   değişikliğinde** çağrılır. Silme mantığı bileşenlere dağıtılmaz.

6. **localStorage silinebilir.** Tarayıcı geçmişi temizlenince veri gider.
   Karşı önlem: (a) her değişiklikte otomatik kayıt, (b) son 3 durumu ayrı
   anahtarlarda tut, (c) program tamamlandığında "yedek indir" için görünür bir
   hatırlatma göster. Babama tek bir alışkanlık öğret: *değişiklik yaptın, yedek indir.*

7. **Yazdırma her zaman hafife alınır.** `@page { size: A4 portrait }`,
   `page-break-after: always`, `print-color-adjust: exact` (arka plan renkleri
   varsayılan olarak basılmaz). v0'ın **sonunda değil ortasında** test et, yoksa
   layout'u baştan yazarsın.

8. **Türkçe karakterler.** Anahtarlarda asla isim kullanma, hep id. "Şükrü Hoca"
   adı değişince tüm yerleşim bozulmasın. Türkçe karakter sadece kullanıcıya
   görünen metinlerde.
   *(2026-08-24 güncellemesi: tanımlayıcılar artık ASCII-Türkçe değil, doğrudan
   İngilizce — `teacher`, `unavailable`, `classGroup`. Kural: arayüz Türkçe, kod
   İngilizce; bkz. CLAUDE.md.)*

9. **Blok render'ı.** İki slotu kaplayan ders, ikinci hücrede tekrar başlık
   yazmamalı. `rowspan` yerine ikinci hücreye sade bir devam işareti koymak
   daha az kırılgan (rowspan + dinamik tablo = bug fabrikası).

10. **Bir dersi taşımak = kaldır + koy.** Ayrı bir "taşıma" kodu yazma.
    Yerleşmiş kartı sürüklenebilir yaparsan `dragstart`'ta kaldır, bırakılmazsa
    geri koy. v0'da buna hiç girme: tıkla-kaldır + yeniden sürükle yeterli.

11. **Sürükleme hedefi ekran dışında olabilir.** *(E2E testinin yakaladığı gerçek hata.)*
    25 satır × 84 sütun 1366×768 ekrana sığmıyor; ekranda ~13 satır ve ~35 sütun var.
    Kullanıcı havuzdan bir kart alır ama bırakacağı satır ya da gün görünmüyorsa oraya
    hiç ulaşamaz — fare basılıyken kaydırma yapamaz. Çözüm: (a) sürükleme başlarken
    hedef satır `scrollIntoView({ block: 'center' })` ile ortaya alınır, (b) imleç
    kenara yaklaşınca ızgara kendiliğinden kayar.

12. **Otomatik kaydırma yalnızca imleç ızgaranın İÇİNDEYKEN çalışmalı.**
    *(Yukarıdaki düzeltmenin kendi yan etkisi.)* Kart havuzu ızgaranın hemen altında.
    "Alt kenara yakınsa aşağı kaydır" kuralını imlecin nerede olduğuna bakmadan
    uygularsan, kullanıcı havuzdaki karta basar basmaz — daha kımıldamadan — ızgara
    kendi kendine kaymaya başlar ve hedef satır kaçar. Kaydırmadan önce imlecin
    kapsayıcının sınırları içinde olduğu kontrol edilir.

13. **`CSS.escape` tırnak içindeki öznitelik değeri için değildir.** `id` rakamla
    başlayabiliyor; `[data-x="${CSS.escape(id)}"]` sessizce eşleşmez. Kimliği seçiciye
    gömmek yerine hedef satır DOM elemanı tutulur, içindeki hücrelere sayısal
    `data-gun`/`data-saat` ile ulaşılır.

14. **Gün listesi değişince yerleşim anahtarları kayar.** *(v0.6'da açılan yol.)*
    `yerlesim`/`placements` anahtarı gün **indeksi** tutuyor. v0'da gün sayısı yalnızca
    listenin sonundan kesilerek değiştiği için bu hiç görünmedi. Gün seçimi checkbox'a
    dönünce **Pazartesi kaldırıldığında Salı 1'den 0'a kayar ve bütün program bir gün
    öne kayar — hiçbir uyarı vermeden.** Bu, aracın yapabileceği en kötü hata: yanlış
    ama inandırıcı bir program. Çözüm: `remapDays()` eski→yeni eşlemeyi **gün adından**
    kurar, listeden çıkan günün anahtarlarını siler, kalanları yeniden yazar. Her
    `updateSettings()` çağrısı buradan geçer. Birim testi ortadan gün silmeyi, E2E testi
    başa gün eklemeyi doğrular.

15. **`Cuma` ve `Cumartesi` ilk üç harfte aynı.** Gün başlıklarını `slice(0, 3)` ile
    kısaltmak müsaitlik ızgarasında iki sütunu birden "Cum" yapar. Kısaltmalar
    `shortDay()` tablosundan gelir: `Pzt Sal Çar Per Cum Cmt Paz`.

---

## 6. Arayüz kararları

- **Sekmeler**: Kurulum · Müsaitlik · Program · Kontrol · Yazdır. Beş tane, daha fazlası değil.
- **Ana ızgara aSc'deki düzende**: satır = öğretmen, sütun = 7 gün × 12 saat, hepsi
  tek geniş tabloda yan yana. Gün sekmesi **yok**.

  ```
              │ Pazartesi        │ Salı             │ ... 7 gün
              │ 1  2  3 ... 12   │ 1  2  3 ... 12   │
   ───────────┼──────────────────┼──────────────────┼──────
   MÇ  Mat    │ ×  ×  ×  ...     │    510 510  ...  │
   AV  Fizik  │       431  ...   │ ×  ×  ×  ...     │
   ...  (~25 satır)
   ────────────────────────────────────────────────────────
   [ Yerleşmemiş kart havuzu — öğretmen renginde ]
  ```

  Gerekçe: babamın gerçek aSc ekranı bu (`docs/Yaklaşık ders planı ölçeği.png`).
  Farklı bir düzen ona yeniden öğrenme maliyeti çıkarır. Hücrede iki satır: üstte
  sınıf adı (`510`), altta derslik harfi (`A`).
- **Görünüm düğmesi**: tek tıkla satır = sınıf görünümüne geçilir. Aynı veri,
  devrik tablo — neredeyse bedava, ama "bu sınıfın günü nasıl" sorusunu cevaplatıyor.
  aSc'den iyi olmayı hedeflediğimiz yer tam burası.
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, kırmızı = engel,
  gri taralı = öğretmen müsait değil. Öğretmen rengi paletten atanır ve havuzdaki
  kartın hangi satıra ait olduğunu gösterir.
- **Font**: sistem fontu. Web font indirmek offline çalışmayı bozar.
- **Ekran**: babamın ekranı muhtemelen 1366×768. 84 sütun sığmaz, yatay kaydırma
  kaçınılmaz. Öğretmen sütunu `position: sticky; left: 0`, gün/saat başlıkları
  `sticky; top: 0`.
- **Performans**: ~2100 hücre var. Satırlar `React.memo` ile sarılır; bir
  yerleştirme tüm tabloyu değil 1-2 satırı yeniden çizer.
- **Boş ekranlar yönlendirsin.** "Henüz ders yok" değil,
  "Kurulum sekmesinden öğretmen ve sınıf ekleyin, sonra ders girin."

---

## 7. Teslim ve bakım

- Çıktı: `dist/index.html`, tek dosya. WhatsApp'tan bile gönderilir.
- Babamın masaüstünde bir kısayol. Tarayıcı varsayılan olarak Chrome/Edge.
- Kod GitHub'da private repo. Sürüm çıkarınca `index.html`'i release'e ekle.
- **Ben yokken bozulmayacak.** Otomatik güncelleme yok, sürüm kontrolü yok,
  telemetri yok. Çalışan dosya sonsuza kadar çalışır.

---

## 8. Cevaplanması gereken sorular

Veri modelini etkileyen soruların hepsi cevaplandı (2026-08-24). Kalanlar v0'ı
bloke etmiyor çünkü ilgili ayarlar yapılandırılabilir bırakıldı.

**Cevaplananlar:**

1. ✅ **Derslik durumu.** Sınıfların kendi odası var, çok nadir değişiyor. Ama
   fotoğrafta ~20 sınıf 8 derslik harfini paylaşıyor — iki cevap çelişiyor.
   *Karar:* derslik sınıfın **sabit alanı** oldu, seçim UI'sı yok, çakışma kontrolü
   var. Odalar gerçekten paylaşılmıyorsa kontrol hiç tetiklenmez → **her iki
   durumda da kod doğru**, bedeli sıfır. Babaya yine de teyit ettirilecek.

2. ✅ **Öğrenci çakışması.** Yok. Sınıf kapalı bir öğrenci kümesi; iki sınıfın aynı
   saatte ders yapması sorun değil. En pahalı senaryodan kurtulduk, model
   PLAN.md'deki sadeliğinde kaldı.
   *Ek:* **her öğretmenin tek branşı var** → branş `Ogretmen`'in alanı oldu.

5. ✅ **Boşluk.** "Genelde olmaz" ama kesin kural değil.
   *Karar:* v0'da hiç kontrol edilmiyor. Sonraki sürümde hem sınıf hem öğretmen
   boşluğu için ayrı ayrı *Kapalı / Uyar / Engelle* ayarı gelecek.

6. ✅ **Hoca sayısı.** Her öğretmenin tek branşı var. Bir branş iki öğretmen
   arasında bölünürse iki ayrı `Ders` satırı yazılır — model değişmiyor.

9. ✅ **Cihaz.** Windows masaüstü, fare. Tablet hedef değil.
   *Karar:* yine de **Pointer Events** kullanılıyor — HTML5 DnD'nin tuzak 1'inden
   kurtarıyor ve dokunmatik desteği bedava geliyor.

**Hâlâ açık — ama v0'ı bloke etmiyor:**

3. ⬜ **Gün yapısı.** Her günün saat sayısı aynı mı?
   *Neden bloke etmiyor:* `ayar.gunler` ve `ayar.saatler` tamamen ayarlanabilir.
   Günler farklı uzunluktaysa, kısa günün fazla saatleri tüm öğretmenler için
   "müsait değil" işaretlenerek çözülür — kod değişikliği gerekmez.

4. ⬜ **Ara.** Sabit öğle arası var mı, blok bu arayı geçebilir mi?
   *Karar:* `blokEngeli` alanı v0'dan çıkarıldı. Ara varsa o saat herkese kapalı
   işaretlenir. Gerçekten gerekirse tek alan ve tek kontrolle geri eklenir.

7. ⬜ **Asıl acı nerede?** Dönem başında bir kez mi kuruyor, dönem içinde sürekli
   mi değiştiriyor? *İkincisi ise v3, v1'den önce yapılmalı.* v0 kullanıldıktan
   sonra cevabı kendiliğinden görülecek.

8. ⬜ **Çıktı kime gidiyor?** Duvara mı asılıyor, dağıtılıyor mu?
   *Etkisi:* sadece baskı kalitesine verilecek özen. Sayfa başına bir sınıf düzeni
   her iki durumda da doğru.

10. ⬜ **Müsaitlik ne sıklıkla değişiyor?** Dönem boyunca sabit mi?
    *Etkisi:* sabit değilse v3 (dönem içi değişiklik) öne çıkar. v0'ı etkilemiyor.

**Kendime sorulacak:**

11. Elimde babamın gerçek verisi var mı? aSc'den export çalışmadığına göre
    ekran görüntüsü veya elle yazılmış bir liste lazım. **v0'ı örnek veriyle
    değil, gerçek veriyle test et**, yoksa yanlış şeyi optimize edersin.

12. Bu proje ne zaman yapılacak? Sömestr içinde başlanırsa yarım kalır ve
    yarım kalan araç, hiç olmayandan kötüdür (babam ona güvenip aSc'yi bırakır).
    Tatilde iki gün ayır, v0'ı bitir, sonra bırak.
