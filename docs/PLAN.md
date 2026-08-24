# Kurs Ders Programı — Teknik Plan

Hedef: babamın kursunda haftalık ders programını dizmek için kullanacağı araç.
Ölçek: ~20 hoca, ~10-15 grup, 6 gün × 12 slot.

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

## 2. Veri modeli

**Bu bölümü sonradan değiştirmek pahalı. Kod yazmadan önce sorular
cevaplanmalı (bkz. bölüm 8).**

```ts
type Id = string;   // nanoid benzeri, 8 karakter. ASLA isim veya dizi indeksi.

interface Durum {
  semaSurumu: 1;              // ilk günden. göç için gerekli.
  ayar: {
    gunler: string[];         // ["Pazartesi", ... "Cumartesi"]
    slotlar: string[];        // ["09:00-09:45", ...] görünen ad
    blokEngeli: number[];     // bu slot indekslerinden ÖNCE blok geçemez (öğle arası)
  };
  hocalar: Hoca[];
  gruplar: Grup[];
  dersler: Ders[];
  kapali: Record<string, true>;    // `${hocaId}|${gun}|${slot}` -> hoca gelemez
  yerlesim: Record<string, Id>;    // `${grupId}|${gun}|${slot}` -> dersId
}

interface Hoca { id: Id; ad: string; }
interface Grup { id: Id; ad: string; }
interface Ders {
  id: Id;
  grupId: Id;
  brans: string;      // "Matematik" — serbest metin, ayrı tablo değil
  hocaId: Id;
  saat: number;       // haftalık toplam ders saati
  blok: number;       // arka arkaya kaç saat (1 veya 2, nadiren 3)
}
```

### Neden bu şekilde

- **Branş ayrı bir varlık değil, serbest metin.** Kursta 8-10 branş var ve hiç
  değişmiyor. Ayrı tablo yapmak, ekleme ekranı, seçim listesi ve yönetim
  ekranı demek. Renk üretimi için metinden hash alınır, yeter.
- **Derslik yok.** Kursta grup = sınıf, herkesin kendi odası var. Derslik
  eklemek üçüncü bir çakışma boyutu ve tüm UI'yı karmaşıklaştırır.
  *Soru 1'in cevabı "gruplardan az oda var" ise bu karar değişir ve v0'a girer.*
- **`yerlesim` düz bir sözlük, dizi değil.** Gün/slot sayısı değiştiğinde dizi
  yeniden boyutlandırmakla uğraşmak yerine taşan anahtarlar silinir.
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

Sırasıyla bakılacak hard kısıtlar:

1. Blok gün sonuna sığıyor mu (`slot + blok <= slotlar.length`)
2. Blok, `blokEngeli` sınırını geçiyor mu (öğle arasını bölmesin)
3. Grubun o slotu boş mu
4. Hoca o slotta gelebiliyor mu (`kapali` sözlüğü)
5. Hoca o slotta başka bir grupta ders veriyor mu

Hata mesajı **her zaman somut** olacak. "Çakışma var" değil,
`"Ahmet Hoca o saatte TYT-B grubunda"`. Programı dizen kişinin bir sonraki
hamlesini belirleyen şey bu cümle.

### Testler (Vitest, ~12 test, bir saatlik iş)

Bu testleri yazmamak projenin en olası çöküş sebebi. Sürükle-bırakla elle test
etmek yavaş ve eksik.

- boş ızgaraya yerleştirme geçer
- dolu gruba yerleştirme engellenir
- hocanın kapalı saatine yerleştirme engellenir
- hoca başka grupta ders verirken engellenir
- 2'li blok son slota konamaz
- 2'li blok öğle arasını geçemez
- blok kaldırıldığında iki slot da temizlenir
- ortadan tıklanan blok tamamen kalkar (baş bulma mantığı)
- hoca silinince dersleri ve yerleşimleri de silinir
- slot sayısı azalınca taşan yerleşimler temizlenir
- aynı hoca aynı grupta üst üste iki derste çakışma vermez
- fizibilite: yük > müsaitlik olan hoca tespit edilir

---

## 4. Sürümler

Her sürümün bir **çıkma şartı** var. Şart sağlanmadan sonrakine geçilmez.

### v0 — Elle dizme (zorunlu, tek başına kullanılabilir)

Çıkma şartı: *babam gerçek verisiyle bir haftalık programı baştan sona dizip
çıktısını alabiliyor.*

- Kurulum: gün/slot düzeni, hoca listesi, grup listesi, ders listesi
- Müsaitlik ızgarası: hoca seç, gelemeyeceği saatlere tıkla
- Program ızgarası: gün sekmeleri, grup sütunları, saat satırları
- Sürükle-bırak: sürüklerken geçerli hücreler yeşil, engel varsa üst çubukta sebep
- Yerleşmiş derse tıkla → kalksın
- Sayaç: her ders için `yerleşen/toplam`
- **Geri al (Ctrl+Z), en az 20 adım.** Sürükle-bırakta yanlış bırakma sürekli
  olur. Bu bloat değil, temel işlev.
- Kayıt: localStorage otomatik + "Yedek indir" (.json) + "Yedek yükle"
- Yazdırma: A4 yatay, tüm gruplar + tüm hocalar

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
   `dragstart` içinde sürüklenen elemanı silen bir re-render yaparsan tarayıcı
   işlemi iptal eder. Sürükleme sırasında sadece ızgarayı güncelle, kart havuzunu
   dokunma. Veya `setTimeout(..., 0)` ile ertele.

2. **Dokunmatik ekranda HTML5 drag-and-drop çalışmaz.** Babam tablet kullanacaksa
   Pointer Events'e geçmek gerekir. (Soru 9) Windows masaüstüyse HTML5 yeter,
   fazlasını yazma.

3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput`
   değil `onBlur`/`onChange` kullan, ya da input'ları controlled yapmayıp
   `defaultValue` + `onBlur` ile oku.

4. **Silme işlemleri cascade olmalı.** Hoca silinince dersleri, ders silinince
   yerleşimleri, grup silinince ikisi de. Yetim `dersId` kalırsa ızgara
   `undefined` render eder ve çöker.

5. **Slot/gün sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez
   hayalet dersler kalır, sayaçlar tutmaz, babam güvenini kaybeder.

6. **localStorage silinebilir.** Tarayıcı geçmişi temizlenince veri gider.
   Karşı önlem: (a) her değişiklikte otomatik kayıt, (b) son 3 durumu ayrı
   anahtarlarda tut, (c) program tamamlandığında "yedek indir" için görünür bir
   hatırlatma göster. Babama tek bir alışkanlık öğret: *değişiklik yaptın, yedek indir.*

7. **Yazdırma her zaman hafife alınır.** `@page { size: A4 landscape }`,
   `page-break-inside: avoid`, arka plan renkleri varsayılan olarak basılmaz.
   v0'ın **sonunda değil ortasında** test et, yoksa layout'u baştan yazarsın.

8. **Türkçe karakterler.** Anahtarlarda asla isim kullanma, hep id. "Şükrü Hoca"
   adı değişince tüm yerleşim bozulmasın.

9. **Blok render'ı.** İki slotu kaplayan ders, ikinci hücrede tekrar başlık
   yazmamalı. `rowspan` yerine ikinci hücreye sade bir devam işareti koymak
   daha az kırılgan (rowspan + dinamik tablo = bug fabrikası).

10. **Bir dersi taşımak = kaldır + koy.** Ayrı bir "taşıma" kodu yazma.
    Yerleşmiş kartı sürüklenebilir yaparsan `dragstart`'ta kaldır, bırakılmazsa
    geri koy. v0'da buna hiç girme: tıkla-kaldır + yeniden sürükle yeterli.

---

## 6. Arayüz kararları

- **Sekmeler**: Kurulum · Müsaitlik · Program · Kontrol · Yazdır. Beş tane, daha fazlası değil.
- **Gün sekmeleri**: 6 gün × 12 slot tek tabloda 72 satır eder, okunmaz.
  Gün seçilir, o günün tablosu gösterilir (satır = slot, sütun = grup).
- **Renk işlevsel, dekoratif değil.** Yeşil = bırakılabilir, kırmızı = engel,
  gri taralı = hoca yok. Branş renkleri metinden üretilir, elle seçilmez.
- **Font**: sistem fontu. Web font indirmek offline çalışmayı bozar.
- **Ekran**: babamın ekranı muhtemelen 1366×768. 15 grup sütunu sığmaz,
  yatay kaydırma olacak. Saat sütunu `position: sticky` olsun.
- **Boş ekranlar yönlendirsin.** "Henüz ders yok" değil,
  "Kurulum sekmesinden hoca ve grup ekleyin, sonra ders girin."

---

## 7. Teslim ve bakım

- Çıktı: `dist/index.html`, tek dosya. WhatsApp'tan bile gönderilir.
- Babamın masaüstünde bir kısayol. Tarayıcı varsayılan olarak Chrome/Edge.
- Kod GitHub'da private repo. Sürüm çıkarınca `index.html`'i release'e ekle.
- **Ben yokken bozulmayacak.** Otomatik güncelleme yok, sürüm kontrolü yok,
  telemetri yok. Çalışan dosya sonsuza kadar çalışır.

---

## 8. Cevaplanması gereken sorular

Bunlar cevaplanmadan v0'a başlanmamalı. Çoğu veri modelini doğrudan etkiliyor.

**Babama sorulacak:**

1. **Derslik durumu.** Her grubun kendi sabit odası var mı, yoksa odalar
   gruplardan az mı ve paylaşılıyor mu?
   *Paylaşılıyorsa derslik üçüncü bir çakışma boyutu olarak v0'a girer.*

2. **Öğrenci çakışması.** Bir öğrenci birden fazla gruba yazılabiliyor mu?
   (mesela matematiği A grubundan, fiziği B grubundan alıyor)
   *Evet ise gruplar birbiriyle çakışır ve model ciddi şekilde büyür.
   Bu, cevabı en kritik soru.*

3. **Gün yapısı.** Her günün slot sayısı aynı mı? Cumartesi farklı mı işliyor?

4. **Ara.** Sabit bir öğle/dinlenme arası var mı? Blok ders bu arayı geçebilir mi?

5. **Boşluk.** Bir grubun günü içinde boş saat olabilir mi, yoksa dersler
   arka arkaya mı gitmeli?

6. **Hoca sayısı.** Bir dersi her zaman tek hoca mı veriyor, yoksa aynı branş
   iki hoca arasında bölünüyor mu?

7. **Asıl acı nerede?** Programı dönem başında bir kez mi kuruyor, yoksa dönem
   içinde sürekli değiştirmek zorunda mı kalıyor?
   *İkincisi ise v3 aslında v1'den önemli.*

8. **Çıktı kime gidiyor?** Duvara mı asılıyor, öğrenciye/veliye mi dağıtılıyor?
   *Dağıtılıyorsa baskı kalitesi ciddiye alınır.*

9. **Cihaz.** Hangi bilgisayar, hangi tarayıcı, ekran boyutu? Tablet kullanma
   ihtimali var mı?

10. **Müsaitlik ne sıklıkla değişiyor?** Hocaların müsait saatleri dönem boyunca
    sabit mi, yoksa haftalık mı değişiyor?

**Kendime sorulacak:**

11. Elimde babamın gerçek verisi var mı? aSc'den export çalışmadığına göre
    ekran görüntüsü veya elle yazılmış bir liste lazım. **v0'ı örnek veriyle
    değil, gerçek veriyle test et**, yoksa yanlış şeyi optimize edersin.

12. Bu proje ne zaman yapılacak? Sömestr içinde başlanırsa yarım kalır ve
    yarım kalan araç, hiç olmayandan kötüdür (babam ona güvenip aSc'yi bırakır).
    Tatilde iki gün ayır, v0'ı bitir, sonra bırak.
