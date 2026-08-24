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
npm test          # Vitest — 65 birim testi
npm run build     # dist/index.html tek dosya üretir
npm run test:e2e  # Playwright — derler, sonra 18 E2E testi
npm run kontrol   # hepsi: tsc + birim + derleme + E2E
```

Yeni bilgisayarda bir kez: `npm install && npx playwright install chromium`

### Test katmanları — hangisi neyi yakalar

| Katman | Nerede | Neyi yakalar |
|---|---|---|
| Birim | `src/*.test.ts` | Kısıt mantığı, cascade silme, ayrıştırma, fizibilite |
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

> **Durum:** kod şu an Türkçe tanımlayıcılarla yazılmış. İngilizceye geçiş bekliyor;
> [docs/TASKS.md](docs/TASKS.md) içindeki "Kod dilini İngilizceye çevir" maddesi.
> Yeni yazılan her dosya İngilizce olmalı.

---

## Mimari — üç katman, sınırları geçilmez

```
tip.ts                       tipler, başka hiçbir şey
  |
kisit.ts / fizibilite.ts     SAF fonksiyonlar. React, DOM, localStorage BİLMEZ.
iceaktar.ts                  Testleri zorunlu.
  |
durum.ts                     reducer + geri al yığını + localStorage
  |
bilesen/*.tsx                sadece görüntüleme ve olay yakalama
```

**Kural:** iş mantığı bileşenlerin içine yazılmaz. Bir `.tsx` dosyasında çakışma
hesabı görüyorsan yanlış yerdedir — `kisit.ts`'e taşı.

**Kural:** `kisit.ts`, `fizibilite.ts`, `iceaktar.ts` içindeki her dışa aktarılan
fonksiyonun testi olacak. Bu üç dosyaya test yazmadan özellik eklenmez.

---

## Veri modeli — özet

Tam hâli [src/tip.ts](src/tip.ts). Değiştirmek pahalı; değiştirmeden önce düşün.

```ts
Durum {
  semaSurumu: 1
  ayar: { gunler: string[], saatler: string[] }     // 7 gün x 12 saat (ayarlanabilir)
  derslikler, ogretmenler, siniflar, dersler
  musaitDegil: Record<`${ogretmenId}|${gun}|${saat}`, 1>
  yerlesim:    Record<`${sinifId}|${gun}|${saat}`, dersId>
}
Ogretmen { ad, kisaltma, brans, renk }    // her öğretmenin TEK branşı var
Sinif    { ad, derslikId }                // derslik sınıfın sabit alanı, seçilmez
Ders     { sinifId, ogretmenId, haftalikSaat, blok }
```

### Neden böyle

- **Branş öğretmenin alanı, dersin değil.** Her öğretmenin tek branşı var.
- **Derslik sınıfın sabit alanı.** Yerleştirirken oda seçilmez, ama iki sınıf aynı
  dersliği paylaşıyorsa çakışma kontrol edilir (~20 sınıf, 8 derslik).
- **`yerlesim` düz sözlük, dizi değil.** Gün/saat sayısı değişince taşan anahtarlar silinir.
- **Blok ayrı varlık değil.** Ardışık anahtarlara aynı `dersId` yazılır. Kaldırırken
  bloğun başı geriye yürüyerek bulunur.
- **Anahtarlarda asla isim kullanılmaz, hep `id`.** "Şükrü" adı değişince yerleşim bozulmasın.
- **`semaSurumu` ilk günden var.** Model değişirse eski yedekler okunabilsin.

---

## Sert kısıtlar (v0)

`engel()` sırayla bakar, ilk engelde döner. Mesaj **her zaman somut**:
"Çakışma var" değil, `"MÇ o saatte 433 sınıfında"`. Programı dizen kişinin bir
sonraki hamlesini belirleyen şey bu cümle.

1. Blok gün sonuna sığıyor mu
2. Sınıfın o saatleri boş mu
3. Öğretmen o saatte müsait mi
4. Öğretmen o saatte başka sınıfta mı
5. Dersliği paylaşan başka sınıf o saatte ders yapıyor mu

Boşluk (pencere) kuralları **v0'da yok**. Sonraki sürümde açılıp kapanabilir ayar olarak gelecek.

---

## Bilinen tuzaklar — hepsi bu tür araçlarda kesin çıkar

1. **Sürüklerken re-render sürüklemeyi bozar.** Bu yüzden HTML5 drag-and-drop değil
   **Pointer Events** kullanılıyor. `pointermove` sırasında React state güncellenmez;
   hayalet kart `transform` ile doğrudan DOM'dan taşınır.
2. **Geçerli hücreler sürükleme başında bir kez hesaplanır**, her `pointermove`'da değil.
3. **Her tuş vuruşunda re-render odağı kaybettirir.** Metin kutularında `onInput` değil
   `defaultValue` + `onBlur`.
4. **Silme cascade olmalı.** Öğretmen silinince dersleri, ders silinince yerleşimleri,
   sınıf silinince ikisi de. Yetim `dersId` kalırsa ızgara çöker.
5. **Gün/saat sayısı azalınca taşan yerleşimler silinmeli.** Yoksa görünmez hayalet
   dersler kalır, sayaçlar tutmaz.
6. **`temizle()` her yüklemede ve her ayar değişikliğinde çağrılır.** 4 ve 5'in çaresi bu.
7. **localStorage silinebilir.** Karşı önlem: her değişiklikte otomatik kayıt + son 3
   durum ayrı anahtarda + görünür "Yedek indir". Babama tek alışkanlık öğretilecek:
   *değişiklik yaptın, yedek indir.*
8. **Yazdırma her zaman hafife alınır.** Sayfa başına bir sınıf/öğretmen (7 sütun x 12
   satır, A4 dikey). 84 sütunlu ana tablo basılmaz. Sonda değil ortada test edilir.
9. **Blok render'ında `rowspan` kullanılmaz.** rowspan + dinamik tablo = bug fabrikası.
   İkinci hücreye sade devam işareti konur.
10. **2100 hücre var.** Satırlar `React.memo` ile sarılı; bir yerleştirme 1-2 satır çizer.

---

## Arayüz

Beş sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır**. Daha fazlası yok.

- Ana ekran aSc'deki gibi: **satır = öğretmen, sütun = 7 gün x 12 saat**, tek geniş
  tablo, altta yerleşmemiş kart havuzu. Tek düğmeyle satır = sınıf görünümüne geçilir.
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
