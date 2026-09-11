# Yol haritası

Sıradaki sürümler, her birinin çıkma şartı ve hâlâ cevabı beklenen sorular.

## Bu belge nasıl okunur

Buradaki v0'dan v4'e numaralar özellik kilometre taşları, yayınlanan sürüm
numarası değil. Program bugün 2.1.1 ve yayın geçmişi
[CHANGELOG.md](../CHANGELOG.md)'de. İlk beş kilometre taşı bitti, bu dosyada
yalnız tek satırlık kayıtları duruyor, o günkü tarifleri
[plan-v0-arsiv.md](plan-v0-arsiv.md)'de.

Her kilometre taşının bir çıkma şartı var ve şart sağlanmadan sonrakine
geçilmiyor. Sıra bağlayıcı değil: bir sürümün önce yapılmasının sebebi ötekinden
ucuz ya da ötekine önkoşul olması, ve o gerekçe değişirse sıra da değişir.
Buradaki tarif bir sürümün niçinini tutar, işin kendisi [TODO.md](TODO.md)'de
numaralı maddelere bölünür.

## Biten kilometre taşları

- v0, elle dizme. Bitti.
- v0.5, yapılabilirlik kontrolü, bugünkü Kontrol sekmesi. Bitti.
- v0.6, zil saatleri, gün seçimi, müsaitlik ve kural kutuları. Bitti, 2026-08-24.
- v0.7, arayüz elden geçirme, koyu tema ve adımlara bölünmüş kurulum. Bitti.
- v1, kalanları otomatik doldur, bugünkü otomatik dizme. Bitti.

Beşinin de o günkü tarifi, çıkma şartı ve gerekçeleri arşivde. İlk yayınlanan
sürüm 1.1.0 (2026-08-27) ve ondan öncesi CHANGELOG'da tek bir girdide toplanıyor,
çünkü bu beş kilometre taşı dallarda kaldı ve hiç yayınlanmadı.

## v2 · Kalite ve yumuşak kısıtlar

Çıkma şartı: *otomatik dizmenin çıktısı "çalışıyor ama çirkin" değil.*

Bu sürümün büyük kısmı v1'in kendi turlarında girdi ve kalanı tek bir maddeye
indi. Bugün elde olan:

- Bir dersin günlük sınırı üç katmanlı (`Lesson.maxPerDay`, sınıfın kendi sayısı,
  okul geneli `maxSameLessonPerDay`) ve çözümü tek yerde, `rules.ts`'teki
  `lessonLimit()`.
- Öğretmenin boş günü ayrı bir tercih alanı olmadan anlatılıyor: o gün
  Müsaitlik'te kapatılır, ve kapalı saat sert bir kısıt.
- Boşluk (pencere) kuralları şema v14'te girdi (`maxGapsTeacher`,
  `maxGapsClass`). İkisi de yalnız Kapalı ya da Uyar olabiliyor, çünkü gün yarı
  dizilmişken her açık saat bir boşluk sayılır ve sert bir kural hiçbir bırakmaya
  izin vermezdi. Delik tanımı tek yerde, `rules.ts`'teki `gapsBetween()`.
- Boşluğu azaltan şey bir optimizasyon değil, çözücünün sıralama anahtarı oldu:
  sınıfın o gün dolu olan saatine yaslanan hücre önce deneniyor. Dört ağır
  dünyada önce ve sonra ölçüldü, hiçbirinde blok düşmedi (TODO §5, B5.1).

Plandaki uygulama önerisi, yani v1 çözümünü alıp rastgele ikili takaslarla
cezayı düşürmek, yazılmadı. Yerine denenen yol ölçülüp bırakıldı: öğretmeni
günlere sıkıştıran Deney A deliği 274'ten 227'ye indiriyor ama programı eksik
bırakıyor (363 blok yerine 367) ve süreyi 69 ms'den 9 856 ms'ye çıkarıyor.

Geriye kalan tek iş kısıt motorunun genişlemesi (TODO §5, B5.3): kartlar arası
ilişki, sınıf için günlük en az ve en çok, ardışıklık, belirli dersin belirli
konumda olması, öğretmenin günde en fazla N sınıfı.

## v3 · Dönem içi değişiklik

Çıkma şartı: *dönem içinde bir değişiklik ana programı bozmadan denenebiliyor.*

Yalnız baba "asıl derdim bu" derse yapılır, yani aşağıdaki 7. ve 10. sorulara
bağlı. Tarifi: "bu hafta Ahmet Hoca yok" denince etkilenen dersler işaretlenir ve
boş alternatifler önerilir, haftalık sapmalar ana programdan ayrı durur.

Bunun bir kısmı başka bir gerekçeyle zaten girdi. Kitaplıkta birden çok plan var,
bir planın içinde alternatif programlar var (`ProgramVariant`, şema v12) ve
planların taslak işareti var, yani bir sapmayı ayrı bir ızgarada denemek bugün
mümkün. Eksik olan şey sapmanın ana programa bağlı kalması: bugün alternatif
program ana programın bir kopyası, ondan türeyen ve ona geri dönen bir sapma
değil.

## v4 · Tuval ve baskı tasarımı

Çıkma şartı: *Program ve Çıktı, okuyucunun kendi ölçeğini ve kendi sayfa
tasarımını kurabildiği bir tuval.*

Bu sürüm aSc gezildikten sonra doğdu (2026-08-30) ve gerekçesi bir eksik değil
bir beğeni: *"Programda ve baskı önizleme tarafında Word gibi olması yani sağa
sola aşağı yukarı kaydırabilme, sağ aşağıda ölçeğin olması, ayrıca kendimizin
zoom in zoom out yapabiliyor olmamız, neredeyse her şeyi değiştirebiliyor
olmamız, ayrıca farklı çeşitlerde baskı alabiliyor olmamız."*

Tam dökümü ve aSc'deki karşılıkları [ASC.md](ASC.md)'nin karar tablosunda 1a ve
1b maddelerinde, işin kendisi [TODO.md](TODO.md) §4'te.

**Tuval, yani Program ve Çıktı sekmeleri.** Serbest kaydırma, yatay ve dikey, ve
sürükleyerek de (orta tuş ya da boşluk). Sağ altta ölçek, yüzde ve kaydırıcı,
ızgaraya bakarken değişiyor: bugün `--ui-scale` Ayarlar altında Görünüm'de altı
düğme ve oradan çıkmıyor. `Ctrl` ile tekerlek, `Ctrl +` ve `Ctrl -`, ve yüzde
yüze dönüş. Kartta ne yazacağı ve neye göre boyanacağı seçilebiliyor, yani
aSc'nin Görünüm altındaki Tanımla'sı: öğretmen, sınıf, derslik ya da branş.

**Baskı.** Raporun yapısı seçilebiliyor: satırda ne, sütunda ne, sayfa başına ne.
Üstüne bir tasarım katmanı geliyor: okul logosu, künye, kenarlık, ekstra sütun.
Modeli aSc'den çözüldü ve uydurulmadı, yer tutucular `{Okul:Okulun Adı}` ·
`{Okul:Öğretim Yılı}` · `{Okul:Okul Logosu}` · `{Sınıf:Tam Adı}` ·
`{Sınıf:Sınıfın Dersliği}` · `{Sınıf:Sınıf Öğretmeni}` · `{Öğretmen:Tam Adı}`.
Düzenleme yeri önizlemenin kendisi, yani o parçaya sağ tıklamak, çünkü önizleme
2026-08-26'dan beri kâğıdın modeli değil kendisi.

**İki şey bu sürümde de değişmiyor, ve ikisi de ölçülmüş kısıt.** Birincisi,
`--ui-scale` kâğıda geçmiyor: ekran ölçeği bir okuma tercihi, kâğıdınki ayrı bir
ayar, ve karışırlarsa yazıcıdan çıkan şey ekrana bakanın gözüne göre değişir.
İkincisi, kâğıdın fiziksel kutusu sabit: A4 yatay, `@page { margin: 0 }`, 205 mm
(tuzak 31). Serbest tasarım o kutunun içinde yaşıyor.

**Ölçüm borcu ve turun ilk işi.** Izgarada iki bine yakın hücre var ve satırlar
`React.memo` ile sarılı (tuzak 10), yani sürekli zoom her adımda yeniden düzen
demek. `transform: scale()` mi `--cell-w` mi sorusu ölçülerek seçilecek, çünkü
ikincisi metni yeniden sarar ve birincisi bulanıklaştırır. Ölçülmeden dokunulmayacak
üç yer de belli: `drag.ts` hedefini `closest('[data-day]')` ile buluyor (tuzak 13)
ve dönüşmüş bir tuvalde koordinat başka bir şey demek, `gridChrome.ts` imleç
haçını `data-col` üstünden yakıyor (tuzak 85), ve öğretmen sütunu
`position: sticky`, yani bir `transform` onun bağlamını kırar.

## Cevabı beklenen sorular

Numaralar v0'ın soru turundan geliyor ve kalıcı, cevaplanmış olanlar arşivde
duruyor. Bir sorunun kodda bir cevabı olması onu kapatmıyor: kodun bugünkü
duruşunu yazıyor, ve soru babanın okulunun gerçekten öyle olup olmadığı.

**3 · Gün yapısı. Her günün saat sayısı aynı mı?** Kodun cevabı belli:
`settings.hours` tek bir liste, yani her günün ders sayısı aynı, ve günler
arasında değişen tek şey uzun aranın yeri (`Day.longBreakAfter`). Kısa bir gün o
günün fazla saatleri kapatılarak anlatılıyor, kod değişikliği istemiyor. Açık
kalan yarısı: babanın okulunda gerçekten böyle mi.

**4 · Ara. Sabit öğle arası var mı, blok bu arayı geçebilir mi?** İlk yarısı
cevaplandı ve v0.6'da girdi: günde bir uzun ara var, zil ayarından üretiliyor,
yeri güne göre değişiyor (hafta içi 5., hafta sonu 6. dersten sonra) ve üç
ekranda birden çiziliyor. İkinci yarısı bugün mekanik olarak cevaplı ama
sorulmadı: kısıt motoru ve çözücü uzun aranın yerini hiç okumuyor
(`constraints.ts` ve `solver.ts`'te `longBreakAfter` geçmiyor), yani bir blok
bugün arayı serbestçe geçiyor. Bunun istenen davranış olup olmadığı sorulacak.

**7 · Asıl acı nerede? Dönem başında bir kez mi kuruluyor, dönem içinde sürekli
mi değişiyor?** Açık. İkincisi ise v3 öne çıkar. Cevap araç gerçek bir dönemde
kullanılınca kendiliğinden görülecek.

**8 · Çıktı kime gidiyor? Duvara mı asılıyor, dağıtılıyor mu?** Açık. Etkisi
yalnız baskı kalitesine verilecek özen, ve sayfa başına bir sınıf düzeni her iki
durumda da doğru. Bugün Çıktı sayfa başına bir, iki ya da dört çizelge basabiliyor,
yani iki cevabın ikisi de deneniyor.

**10 · Müsaitlik ne sıklıkla değişiyor? Dönem boyunca sabit mi?** Açık. Sabit
değilse v3 öne çıkar.

**11 · Elimde babanın gerçek verisi var mı?** Açık, ve v0'ın çıkma şartı buydu.
Kalan tek parça ders listesi, [TODO.md](TODO.md) §8c. aSc dosyasının adı biliniyor
(`15 EYLÜL.roz`), yani bu soru B6.2'deki içe aktarmayla tek adımda kapanabilir.

**12 · Bu proje ne zaman yapılacak?** Cevabı tarihin kendisi: tatilde başlandı,
v0'dan 2.1.1'e kadar geldi ve yarım kalmadı. Sorunun korktuğu şey, yani babanın
yarım bir araca güvenip aSc'yi bırakması, olmadı. Kapalı.

Soru listesinde olmayan ama aynı turdan kalan bir soru daha vardı, ekran:
2026-08-25'te ölçülerek cevaplandı, hedef makine 27 inçlik bir monitör ve
1920×1080 CSS pikseli. Bugünkü karşılığı Görünüm'deki Sığdır seçeneği ve
[PRINCIPLES.md](PRINCIPLES.md)'in hedef makine bölümü.
