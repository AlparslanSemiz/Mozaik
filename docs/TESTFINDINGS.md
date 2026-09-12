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

### 2026-09-12 · npm run patrol · devriye ilk kez koşuldu ve ilk koşusunda düştü
Bulgu: "sistematik tur — her sekme, her adım, her bölüm, her şerit düğmesi" 2500 ms'lik bir
tıklama zaman aşımıyla düşüyor: `Kontrol` sekmesinin düğmesi tıklanamıyor. Ekran görüntüsüne
bakıldı (tuzak 82) ve sebep göründü: şeridin "Program 1" menüsü açık kalmış, menü modal, ve
örtüsü sekme tıklamasını yutuyor. `diyalogKapat` diyalogları kapatıyordu ama menüleri değil.
Sahiplik ölçüldü, iddia edilmedi: aynı düşüş bu turun değişikliklerinden önceki ağaçta
(`c8c126d`, ayrı dizine açılıp orada derlendi) birebir aynı testte, aynı süreyle var. Yani bu
turun açtığı bir şey değil, **devriye hiç koşulmadığı için hiç görülmemiş** bir kusur.
Ürün kusuru değil: bir kullanıcı menüyü kapanırken görür ve ikinci kez tıklar. Turun bir kontrol
başına bir tıklaması var, ikincisi yok.
Tür: test kusuru (turun kendi eksiği)
Ne yapıldı: düzeltildi. `menuKapat` eklendi, Escape ile. Devriye 4/4, ve süresi 2,4 dakikadan
41,3 saniyeye indi, çünkü artık zaman aşımlarını beklemiyor.
Kalıcı kural: yok

### 2026-09-12 · npm run kontrol · havuz çaresinin açtığı gerileme, ve iki yanlış daraltma
Bulgu: Havuz çaresinden sonra `e2e/program.spec.ts` "kart ile hayalet aynı şeyi söylüyor"
kararsızlaştı. Sebep tahmin edilmedi, ölçüldü: aynı test değişiklikten önceki ağaçta (`c8c126d`,
`git archive` ile ayrı bir dizine açılıp orada derlendi) **altı koşuda altı kez geçiyor**,
sonrasında **altı koşuda üç kez düşüyor**. Yani bir kararsızlık değil, benim açtığım bir
gerileme.
Mekanizma: havuzun açılış boyunu ızgaranın tablosuna bağlı bir `ResizeObserver` ile yeniden
ölçüyordum. Sınıf görünümüne geçmek tablonun boyunu değiştiriyor, gözlemci ateşliyor, ve tepsi
bir kartın kutusu okunduktan sonra ama düğmeye basılmadan önce yeniden boyutlanıyor. Sürükleme
o boşluğa kayan başka bir kartla başlıyor, ya da hiç başlamıyor (düşüşlerin süresi 30 sn, yani
zaman aşımı).
İlk daraltma yetmedi ve o da ölçüldü: "tepsi yalnız büyüsün, hiç küçülmesin" kuralıyla sekiz
koşuda dört düşüş sürdü, çünkü zararlı olan yeniden boyutlandırma zaten bir büyümeydi.
İkinci daraltma tuttu: tetik ızgaranın şekli değil **havuzun içeriği** (`cards.length`), ve ölçüm
bir `useLayoutEffect`'te, yani boyamadan önce. Sekiz koşuda sekiz geçiş. Ayrım şu: ızgaranın
şekil değiştirdiği an kullanıcının eli zaten tepsinin üstünde olabilir, bir dünyanın yüklendiği
ya da programın boşaltıldığı an olamaz.
Bu sırada ikinci bir kusur daha çıktı: bağlanma etkisi `--dock-h`'yi düzen etkisinden SONRA
yazıyor ve büyümüş değeri eziyordu, yani tepsi hiç büyümüyordu (ölçüm 95 px'e karşı 95 px).
Yazma tek yere toplandı.
Asıl senaryo ayrıca ölçüldü, babanın verisiyle: dosya açılınca havuzda 11 kart ve tepsi 95 px,
program boşaltılınca 201 kart ve tepsi 166 px, 47 kart görünüyor, solma yanıyor.
Tür: ürün kusuru (benim açtığım)
Ne yapıldı: düzeltildi. Beş süit koşuldu, 207/207.
Kalıcı kural: TRAPS.md, tuzak 121

### 2026-09-12 · npx playwright test e2e/exe.spec.ts · 248, tarihe bağlı kırmızının kapanışı
Bulgu: Test `/2 Eylül 2026/` arıyordu ve koşan derlemenin kendi damgası (`v2.1.1 · 12 Eylül
2026`) da deseni içeriyor, yani Playwright iki öğe buluyor ve strict mode ihlali veriyor. Her
ayın 12'sinden 19'una kadar kırmızı, ve `kontrol` zinciri `&&` ile bağlı olduğu için site ve
çözücü süitleri o günlerde hiç koşmuyor.
Çare deseni çapalamak değil tarihi SÜRÜME bağlamak oldu, çünkü çapa damgayı dışarıda tutar ama
tarihin duyurulan sürüme ait olduğunu söylemez. İki iddia tek cümleye indi.
Ve bir ölçüm kusuru, benim: kanıt için tohumdaki tarihi değiştirdim ve test yeşil kaldı, yani
iddia bir an bedava yeşil göründü. Değildi. O dize dosyada iki kez geçiyor ve değiştirdiğim ilki
başka bir testin tohumuydu, sınadığım testin tohumuna hiç dokunmamıştım. Doğru satır hedeflenince
iki mutasyon da kırmızıya döndü: tarih bir gün ileri alındığında, ve tarih hiç verilmediğinde.
Tür: test kusuru
Ne yapıldı: düzeltildi. `e2e/exe.spec.ts` 10/10.
Kalıcı kural: TRAPS.md, tuzak 120

### 2026-09-12 · scratch/havuz-olc.mjs · havuzda alttaki kartlara ulaşılamıyor, sebebi
Bulgu: Kullanıcının satırı ("havuzdaki stacktakileri kartlardan alttakilere ulaşamıyor babam")
üç ihtimalle açılmıştı ve üçü de ölçülüp düştü. Ölçüm üç dünyada, iki kutuda (1920x1080 ve
exe'nin 1600x1000'i), beş sıralamada ve iki temada koşuldu; girdi kullanıcının koyduğu gerçek
veri (`babamın.json`, şema 14, 18 öğretmen, 20 sınıf, 146 ders, 348 haftalık saat).
(a) Deste bir gruplama değil: anahtarı `lessonId` artı `size` ve kartın öteki bütün alanları bu
ikisinden türüyor, yani bir destedeki kartlar birbirinin aynısı. Belge doğru.
(b) Deste ne bölünüyor ne biniyor: beş sıralamanın beşinde de deste sayısı birebir aynı (babanın
verisinde 205, örnek okulda 114), ve destelerin kutu kesişimi altı birleşimin altısında da sıfır.
(c) Babanın verisinde ortada karıştıracak deste yok: 211 blok 205 desteye düşüyor, 199'u tek
bloklu, 6'sı iki bloklu, üç bloklu HİÇ yok, yani `::before`/`::after` katmanları onun ekranında
neredeyse hiç çizilmiyor.
Sebep dördüncü bir şey: tepsi 1600x1000'de 94,5 px görünüyor ve içinde 922 px var. 205 kartın
19'u tam görünüyor, 4'ü kırpılıyor, 182'si katlamanın altında, ve 18 öğretmen grubunun yalnız
biri sığıyor. Tepsi kaydığını hiçbir şekilde söylemiyor: kaydırma çubuğunun kapladığı genişlik
0 px ve ekran görüntüsünde çubuk yok, yani "211 blok bekliyor" yazan bir başlık 19 kart çizen bir
tepsinin üstünde duruyor. Tekerlek kaydırıyor (scrollTop 0 -> 300), kart klavyeyle erişilemiyor
(`tabIndex` -1, `role` yok, `focus()` tutmuyor), ve sürüklerken tepsi kendiliğinden kaymıyor.
Örnek okul bunu gizliyordu: orada 76 kart altta kalıyor, sekiz grup sığıyor ve desteler gerçekten
katmanlı çiziliyor, yani ölçüm yalnız örnek veride yapılsaydı yanlış şeyi ölçerdi.
Tür: ürün kusuru
Ne yapıldı: düzeltildi. Ölçüm kullanıcıya gösterildi ve çareyi kullanıcı seçti. Sonrası aşağıda.
Kalıcı kural: TRAPS.md, tuzak 119

### 2026-09-12 · npx playwright test e2e/program.spec.ts · havuzun çaresi, önce ve sonra
Bulgu: İki çare, ikisi de kullanıcı kararı. Izgaranın kullanmadığı yer havuza geçiyor, ve tepsi
altında kart kaldığını söylüyor. Babanın verisinde, program boşaltılmış, tam görünen kart:

| Kutu | Önce | Sonra | Tepsi | Izgara kaydırıyor mu |
|---|---|---|---|---|
| 1600x1000 (exe) | 19 | 38 | 94,5 px -> 169,3 px | hayır, hayır |
| 1920x1080 | 23 | 69 | 94,5 px -> 237,5 px | hayır, hayır |

Alınan yer ölçülmüş boş yerdi: tablo 678,5 px, kabı 754,1 px, aradaki 75,6 px'te hiçbir şey
çizilmiyordu, ve çareden sonra o fark 0,9 px'e indi. Izgara iki kutuda da kaydırmaya başlamadı.
Koruma iki yönde de tutuyor: babanın dosyası açıldığı gibi yüklendiğinde (11 kart, taşma yok)
tepsi hiç büyümüyor, ve örnek okulda ızgarada boş yer olmadığı için de büyümüyor.
Elenen yol ölçüldü: `.grid-wrap`'i içeriğine sabitleyip artanı `.pool`'a `flex-grow` ile vermek
aynı 38 kartı veriyor ama tutamağı iki yönde de ÖLDÜRÜYOR (60 px yukarı ve 60 px aşağı sürükleme
havuzun boyunu hiç değiştirmiyor), çünkü büyüyen bir öğenin boyu tabanından bağımsız hâle geliyor.
Tutamak bugünkü hâlinde zaten çalışıyordu ve çareden sonra da çalışıyor.
Tür: ürün kusuru
Ne yapıldı: düzeltildi. `dockHeightForRoom` (`platform/poolSplit.ts`) artı `.pool-list`'e
uygulamanın zaten kullandığı `attachScrollFade`. Testler: `src/poolSplit.test.ts` 7 birim testi,
`e2e/program.spec.ts` "havuz ızgaranın kullanmadığı yere açılıyor" üç dünyada.
Beş mutasyonun beşi de kırmızı: oda sınırı kaldırıldı, içerik sınırı kaldırıldı, tepsiden
`scroll-fade` alındı, solma hiç bağlanmadı, solma boyu sıfırlandı. Her mutasyondan sonra dosyalar
kopyadan geri yüklendi ve sha256 ile karşılaştırıldı.
Ve bir test kusuru, benim: ilk yazdığım solma iddiası `faded-bot` SINIFINI okuyordu, o sınıfı
JS yazıyor ve tepsiden `scroll-fade` alınınca da yazmaya devam ediyor, yani iddia bedava yeşildi
ve mutasyon onu yakaladı. İddia çözülmüş `--fade-bot` ile maskenin kendisine taşındı.
Kalıcı kural: yok

### 2026-09-12 · scratch/kasma-zaman.mjs + kasma-iz.mjs · B4.7'nin çaresi, önce ve sonra
Bulgu: Kullanıcının seçtiği çare uygulandı — gerekçe çubuğu en çok 100 ms'de bir yazılıyor
(`REASON_GAP`, `src/platform/drag.ts`), ve renk ile cümle **birlikte** yazılıyor: sınıf yazması
bedava olduğu hâlde erken geçirilirse çubuk yeşile döner ama hâlâ kırmızı cümleyi okur.

Aynı ağaçta (`bf28899` + yama), aynı betikle, üçer koşu:

| | Düşen kare | fps | Layout | Paint |
|---|---|---|---|---|
| önce | %9,5 · %10,4 · %14,1 | 52–55 | 543 ms / 107 | 2010 ms |
| sonra | %1,1 · %1,1 · %1,1 | 59,4 | 216 ms / 42 | 1826 ms |

Kenar kaydırmasında düşen kare %12–13'ten %0–0,8'e indi. Kalan 42 yerleşim, kısma penceresinin
açtığı yazmalar: saniyede on, ve beklenen sayı bu.

Çarenin asıl riski hızlı kareler değil **son** kare: el, penceresi kapalıyken girilen bir
hücrede duruyorsa ve kuyruktaki yazma düşerse çubuk bir önceki hücreyi anlatır — yanlış cevabı
doğru gibi gösterir. `e2e/program.spec.ts`'e o sözleşmeyi ölçen bir test yazıldı (hücreler hızla
geçilir, son hücrenin cümlesi beklenir, iki yönde de). İki cümleyi ekrandan okuyor, yazmıyor.
Mutasyonla sınandı: kuyruk yazması iptal edilince kırmızı ("son hücrenin cümlesi hiç yazılmadı"),
geri konunca yeşil.
Tür: ürün kusuru, düzeltildi
Ne yapıldı: TODO B4.7 kapandı. `npm run kontrol` koşuldu, sonucu WORKLOG'un bugünkü girdisinde.
Kalıcı kural: TRAPS.md, tuzak 117

### 2026-09-12 · scratch/b48-ab.mjs · B4.8'in bedeli, ve ölçümün kendi süitimle bozulması
Bulgu: Kart halkası (`table.grid.dragging tbody td.can-* > .card`) uygulandı ve bedeli ölçüldü.
İlk ölçüm **%60–72 düşen kare** dedi, en kötü kare 233 ms — yani çare, çözdüğü sorundan beter
görünüyordu. Ama aynı koşunun iz toplamları halkasız hâlle neredeyse birebir aynıydı (Paint 2008
ile 1826, Layout 215 ile 216, RunTask 4728 ile 4653). Çelişki ölçüm aletinde değil ortamdaydı:
o üç koşu, arka planda başlattığım **tam E2E süitiyle** aynı pencereye denk geldi.

Dönüşümlü A/B ile yeniden ölçüldü (aynı pencerede sırayla derle-ölç, üç tur):

| | 1 | 2 | 3 |
|---|---|---|---|
| halka VAR | %0,7 | %1,9 | %0,0 |
| halka YOK | %1,5 | %0,4 | %0,4 |

Yani halkanın ölçülebilir bir bedeli yok, ve olmaması bekleniyordu: `can-*` sınıfı `<td>`'de
zaten var, kural JS'siz, ve boyanan şey hedef satırın ~20 dolu hücresi. Kendi süitim yüzünden
bir çareyi neredeyse yanlış yere gömüyordum.

Ders, ve öteki oturuma söylediğimin aynısını kendime: **ölçüm penceresi açıkken hiçbir çok
çekirdekli iş koşmamalı, kendi başlattığın arka plan süiti dahil.** Aynı derleme, aynı betik,
yüklü pencerede %60–72, sessiz pencerede %0–1,9 veriyor. Tek yönlü koşu makinenin o anki yüküyle
karışır; A/B dönüşümlü koşulur.
Tür: ölçüm kusuru (benim), artı bir ürün değişikliğinin doğrulanması
Ne yapıldı: TODO B4.8 kapandı. Halka iki hükümde de (`can-warn` ve `can-no`) mutasyonla sınandı:
kurallar kaldırılınca kırmızı, `can-no` uyarı rengiyle boyanınca kırmızı.
Kalıcı kural: TRAPS.md, tuzak 118

### 2026-09-12 · scratch/kasma-zaman.mjs + kasma-iz.mjs · `store.ts` bölünmesinden SONRA taban
Bulgu: B4.7'nin tabanı bölme öncesi bir derlemede alınmıştı; sonraki "önce/sonra"nın iki yakası
aynı ağaçtan olsun diye `bf28899` üstünde yeniden ölçüldü. **Sürükleme yolu değişmemiş.** İzin
toplamları bölme öncesiyle yüzde üçün içinde: Layout 543 ms / 107 (önce 558 / 108), Paint
2010 ms (2025), Layerize 943 ms (959), HitTest 720 ms (713), rAF geri çağrısı 484 ms (474).
Sebep de aynı yerde duruyor, yani bölme `platform/drag.ts`'in kare bütçesine dokunmadı.

Asıl bulgu ölçümün kendisinde: **düşen kare yüzdesi paylaşılan makinede güvenilir bir ölçüt
değil.** Beş koşu %9,5 · %10,4 · %14,1 · %28,2 · %33,0 verdi, oysa aynı beş koşunun iz
toplamları birbirinin yüzde üçü içinde. Fark makinenin yükü: öteki oturum aynı anda tip farkında
ESLint koşturuyordu. Bölme öncesi sessiz pencerede aynı ölçüt %9,6–15 bandındaydı.

Sonuç, ve bir sonraki turun protokolü bu: **önce/sonra karşılaştırmasının birincil ölçütü iz
toplamı (Layout ms ve adedi), doğrulayıcısı düşen kare.** B4.7'nin iki adayından "metni kısmak"
(%1,5–3,4) gürültü bandının hâlâ altında ve ayırt edilebilir, ama "metin kutusunu akıştan
çıkarmak" (%3,8–7,4) yalnız yüzdeye bakılırsa gürültüye karışabilir; onun kararı iz toplamıyla
verilmeli (o deneyde Layout 557 → 121 ms idi, yani iz ayrımı net).
Tür: bulgu değil, ölçüm — artı bir ölçüt seçimi
Ne yapıldı: kod değişmedi. B4.7'nin tabanı tazelendi, ölçüt protokolü yazıldı.
Kalıcı kural: yok

### 2026-09-12 · scratch/kasma-*.mjs · sürükleme sırasında kare süresi, dolu ızgarada
Bulgu: Kullanıcının ikinci kez yazdığı satır ("bir kartı kırmızı sarı veya yeşil blokların
üzerinden gezdirirken çok kasma oluyor") ilk kez **hareket başına** ölçüldü. 2026-09-01'de
ölçülen şey sürüklemenin BAŞLANGICIYDI (pointerdown → ikinci rAF, 125 ms → 46,2 ms); o sayı
doğru ama şikayetin sebebi değilmiş (tuzak 101).

Kurulum: örnek okul, otomatik dizilmiş ızgara (371 yerleşik kart, 3'ü havuzda; hedef satırda
72 hücrenin 20'si dolu), `dist/index.html` `file://` üzerinden, Chromium (başsız), belge
6704 yerleşim nesnesi. Havuzdan bir kart alınıp hedef satır boyunca yatay taranıyor: 558
`Input.dispatchMouseEvent` ~125 Hz'de, cevabı beklenmeden (bekleyince fare sayfanın hızına
düşüyor ve ölçüm kendi konusunu gizliyor). Sayfaya birleştirmeden sonra 226 hareket ulaştı.
Geçilen renkler sayıldı, üçü de var: kırmızı-boş 91, kırmızı-dolu 67, sarı-boş 27, sarı-dolu 4,
yeşil-boş 34.

Kare süreleri (rAF damgaları arası; "düşen" = 25 ms'den uzun kare):

| Koşul | Düşen kare | fps | Medyan | p90 | En kötü |
|---|---|---|---|---|---|
| x1, 1920×1080 | %0 | 60,0 | 16,7 ms | 16,7 | 16,8 |
| x1, 1600×1000 (exe kutusu) | %0 | 60,0 | 16,7 ms | 16,7 | 16,8 |
| x4, 1920×1080 | %9,6 · %12,2 · %15,0 | 52–55 | 16,7 ms | 33,3 | 33,4 |
| x4, 1600×1000 | %14,3 · %24,4 · %31,6 | 45–53 | 16,7 ms | 33,3 | 50,1 |
| x4, kenar kaydırması sürerken | %9,6–%17,5 | 52 | 16,7 ms | 33,3 | 33,4 |
| x4, **sürükleme yok** (imleç haçı) | %0 | 60,0 | 16,7 ms | 16,7 | 16,8 |

Yani x1'de kasma yok, x4'te her sekizinci ila onuncu kare düşüyor ve hiçbir kare iki kareden
uzun sürmüyor: donma değil, titreme. Küçük kutu (exe boyu) daha iyi değil, eşleşmiş koşularda
biraz daha kötü. Gürültü ±3 puan, bu yüzden her rakam üç koşunun üçü de yazıldı.

Profil tahminle değil tarayıcının kendi olay kaydıyla alındı (CDP Tracing), çünkü şüphelilerin
çoğu JS değil. x4, 4,6 saniyelik tarama, ana iş parçacığı neredeyse dolu (RunTask 4970 ms):

| İş | Toplam | Adet | Medyan |
|---|---|---|---|
| Paint | 2025 ms | 387 | 5,24 ms |
| Layerize | 959 ms | 232 | 4,06 ms |
| HitTest | 713 ms | 581 | 1,27 ms |
| Layout | 575 ms | 108 | 5,37 ms |
| rAF geri çağrısı | 474 ms | 233 | 2,03 ms |
| UpdateLayoutTree (stil) | 154 ms | 588 | 0,09 ms |

`Layout` olaylarının hepsi `partialLayout: false`, kökü `#document` ve 6704 nesne: **tam belge
yerleşimi**, kare başına değil hedef hücre her değiştiğinde (108 kez, 226 harekette). Sebebi
`drag.ts`'in `paintReason`'ı: gerekçe çubuğunun `textContent`'i. Tek tek sınandı —

| Deney | Düşen kare (3 koşu) | Layout | Paint |
|---|---|---|---|
| taban | %9,6 · %12,2 · %15,0 | 558 ms / 108 | 2025 ms |
| `paintReason` hiç çalışmıyor | %0 · %1,8 · %0 | 1,3 ms / 1 | 940 ms |
| yalnız `className` yazılıyor (metin yok) | %2,2 · %0,7 · %4,5 | 0,2 ms / 1 | 2155 ms |
| yalnız metin yazılıyor (`className` yok) | %4,9 · %7,4 · %6,2 | 602 ms / 107 | 1416 ms |

Sınıf yazması bedava, metin yazması pahalı. Metin bir `<span>`'in içinde, `white-space: nowrap`
ve `text-overflow: ellipsis` ile, ve o span bir flex öğesi: içeriği değişince kutusu da
değişiyor, ve Blink yerleşimi belgenin kökünden başlatıyor. Bunun 5,37 ms'sine 5,24 ms'lik tam
görüntü alanı boyaması eşlik ediyor (Paint'in yarısı bu satırdan geliyor).

Planın öteki üç şüphelisi ölçüldü ve **üçü de düştü** (tuzak 105):
- `gridChrome.ts`'in imleç haçı sürükleme sırasında zaten kapalı (`table.dragging` kapısı), ve
  sürüklemesiz gezinmede x4'te tek kare düşmüyor. Kayıtlı 0,148 ms/sütun bugün x4'te ~1,26 ms,
  yani x1 karşılığı ~0,3 ms: aynı mertebede ve kare bütçesinin çok altında.
- Sınıf değişimleri: 226 harekette **104** düğüm, hareket başına medyan **0**, en kötü **2**.
  Stil yeniden hesabının medyanı 0,09 ms. Boyanan düğüm sayısı sorun değil.
- `elementFromPoint` + `closest('[data-day]')`: 233 çağrı, 277 ms, çağrı başına 1,19 ms (x4),
  yani x1'de ~0,3 ms. Tarayıcının kendi olay isabet testi bunun üstüne 425 ms daha koyuyor
  (340 kez, 1,25 ms) — ikisi toplam sürenin %15'i, ama tek başına kare düşürmüyor.
- Hayalet karta `will-change: transform` (kendi katmanına alma) denendi: %14,2 · %13,5 · %14,6,
  yani tabandan **farksız**, Paint da kıpırdamadı. Pahalı görünen satır boşa çalışmıyormuş.

İki aday çare ölçüldü, ikisi de kodun kendisinde değil yazmanın şeklinde:

| Aday | Düşen kare (3 koşu) | Layout |
|---|---|---|
| gerekçe metni en çok 100 ms'de bir yazılıyor | %1,5 · %2,2 · %3,4 | 194 ms / 38 |
| metin kutusu mutlak konumlanıyor (dört kenarı bağlı) | %3,8 · %7,4 · %4,9 | 121 ms / 108 |
| `contain: layout` (çubuğa) | %21,7 · %22,8 · %24,3 | 551 ms / 105 |
| `flex: 1 1 0; min-width: 0` (metin kutusuna) | %13,1 · %12,7 · %12,2 | 557 ms / 109 |

Son ikisi işe yaramadı ve yazılmadan önce ölçüldükleri için yazılmadılar da.
Tür: ürün kusuru (bir tane, ve 2026-09-01'de ölçülmemiş yerde)
Ne yapıldı: kod değiştirilmedi, ölçüm yazıldı. İş maddesi TODO §4 B4.7, çare kullanıcı kararı bekliyor.
Kalıcı kural: henüz yok — çare seçilince TRAPS'e "bir metin düğümünü değiştirmek 6704 nesnelik
belgede tam yerleşim tetikler" olarak yazılacak.

### 2026-09-12 · scratch/kasma-gorunurluk.mjs · dolu hücrenin hükmü ekranda görünüyor mu
Bulgu: Kullanıcının aynı gün yazdığı ikinci satır ("o kartın oraya gelip gelemeyeceğini bilmek
lazım, yani kırmızı mı turuncu mu falan") bir performans değil bir **görünürlük** sorunu, ve
ölçülünce tuzak 84'ün ailesinden çıktı: hesaplanan değer doğru, ekranda görünen başka.

Dolu bir hücrenin üstüne kart getirildiğinde `<td>`'nin hesaplanmış zemini hükmün ta kendisi —
takas için sarı `rgb(251, 224, 154)`, engel için kırmızı `rgb(247, 188, 183)`. Ama o zeminin
üstünde hücrenin kendi kartı duruyor: kart `width/height: 100%` ve kendi palet rengiyle opak,
32×39 px'lik hücrenin **29×36'sını, yani %83,7'sini** örtüyor. Geriye hükümden görünen şey her
kenarda **1,5 px'lik bir çerçeve**. İmlecin altındaki hücrede ayrıca 3 px'lik dış çizgi var
(`outline`, karttan sonra boyandığı için görünüyor) — ama yalnız imlecin durduğu hücrede.
`elementsFromPoint` yığını da bunu söylüyor: `SPAN.card-bottom` → `BUTTON.card` → `TD.can-warn`.

Üstelik iki dolu hücrenin kartı aynı renkte olabiliyor (ölçümde ikisi de `rgb(241, 231, 197)`),
yani sarı hücre ile kırmızı hücre karta bakarak ayırt edilemiyor. Kendi hayalet kartı da
hücrenin %61,1'ini örtüyor, yani boş hücrede bile hükmün bir kısmı imlecin altında kalıyor.

Sayı olarak: otomatik dizilmiş bir programda hedef satırın 72 hücresinin 20'si dolu, ve
kullanıcının sorduğu soru ("bu kart buraya gelebilir mi") tam da o dolu hücrelerde soruluyor.

Dört kat büyütülmüş görüntüler iki şeyi daha gösterdi (`scratch/cizgi-*.png`, `gor-*.png`).
Birincisi, **imlecin durduğu hücrede hüküm görünüyor**: 3 px'lik dış çizgi kartın üstünde
boyanıyor (CSS boyama sırası), ve hayalet kart ondan dar olduğu için çerçeve hayaletin de
altından kalmıyor. Yani sorun imlecin olduğu yer değil, **imlecin daha gitmediği yerler** —
satırı bir bakışta okumak. İkincisi, oradaki zayıf önizleme dolu hücrede yalnız 1,5 px'lik bir
çizgi olarak kalıyor ve **kartın kendi rengi uyarı renginin neredeyse aynısı**: kart
`rgb(241, 231, 197)`, `--can-warn-bg` `rgb(253, 238, 201)`. Yan yana duran "dolu ve engelli"
hücre ile "boş ve takas edilebilir" hücre ekranda aynı krem rengi gösteriyor.
Tür: ürün kusuru (boyama sırası / görünürlük), performans değil
Ne yapıldı: düzeltilmedi, ölçüldü. İş maddesi TODO §4 B4.8, çare kullanıcı kararı bekliyor.
Kalıcı kural: yok — tuzak 84 zaten bu aileyi anlatıyor.

### 2026-09-12 · npx stryker run --mutate src/store.ts · şema örneklerine iddia eklendikten sonra
Bulgu: Örnek dosya testi ızgarayı ve adları doğruluyordu, dersin şeklini ve ayarları doğrulamıyordu, ve mutasyon koşusu bunu ayrıştırma yarısındaki hayatta kalanlarla söylüyordu. Bu turda her sürüm dosyası için dersin şekli (haftalık saat, bloklar, `second`, `maxPerDay`), ayarlar (okul adı, günlerin uzun arası, zil, sınırlar, kural seviyeleri, branş listesi ve kısaltmalar), öğretmenin kutuları, sınıfın kutusu, renkler ve program zarfı iddiaya döndü, ve yanına bir alanı çıkarılmış dosyaları okuyan bir bölüm eklendi.

Skor, aynı makinede aynı yapılandırmayla, yalnız `src/store.ts` mutasyona sokularak ölçüldü. Kapsam: dört işçi, yalnız birim süiti (E2E koşmuyor), `solver.ts` hâlâ dışarıda. Önce 63,7 · sonra 71,6. Hayatta kalan 200'den 157'ye, kapsamsız 163'ten 162'ye indi, koşu 4 dakika 52 saniye sürdü. Dosyanın bölgelerine göre okununca artışın nereden geldiği görünüyor: ayrıştırma yarısı (233-566) 77,8'den 88,9'a ve hayatta kalanı 58'den 29'a, ayrıştırma yardımcıları (150-232) 66,7'den 77,3'e ve 44'ten 30'a. Dokunulmayan iki bölge kıpırdamadı (reducer 67,4, tarayıcı yarısı 27,0), yani artış yazılan teste atfedilebiliyor.

Örnek dosyaların kendisi de değişti, ve sebebi ölçülebilirlik. `sema-ornek.mjs`'in yazdığı zil saatleri programın varsayılan zilinin birebir aynısıydı, kural seviyelerinin dördü varsayılanla aynıydı, Çarşamba'nın uzun arası `makeDay`'in kendi tahminiyle aynıydı ve program zarfının adı `blankProgram()`'ın verdiği adla aynıydı. Bir alanın dosyadaki değeri varsayılanla aynıysa o alanı okuyan bir okuyucu ile yedeğe düşen bir okuyucu aynı sonucu verir, yani o alanı ölçen her iddia bedava yeşildir. Dört değer de varsayılandan uzaklaştırıldı ve gerekçesi betiğin içinde duruyor.

Yeni iddiaların ölçtüğü on beş kusurla sınandı, üretim kodu kopyadan geri alınarak: zil saatlerini dosyadan okumamak, kural seviyesini okumamak, okul sınırlarını okumamak, günün uzun arasını okumamak, ikinci branş bayrağını hep kapalı vermek, v9 sınırını bir kaydırmak, v13 sınırını kaldırmak, cinsiyeti hep belirtilmemiş vermek, öğretmenin sınır kutularını hep boş vermek, program zarfının adını okumamak, branş kısaltmalarını okumamak, okul adını okumamak, v5 öncesinin gömülü branş listesine düşmemesi, sınıfın günlük kutusunu okumamak ve v1 gün adlarını okumamak. On beşi de kırmızıya döndü, biri bile bedava yeşil geçmedi.
Tür: bulgu değil, ölçüm. İçinden çıkan iki ürün kusuru aşağıdaki kayıtta.
Ne yapıldı: `src/fixtures.test.ts` ve `src/fixtures/*` yazıldı, üretim kodu değişmedi. TODO §8f'nin örnek dosya maddesi kapandı.
Kalıcı kural: yok, ama örnek dosyaların değerlerinin varsayılandan uzak durması betiğin içinde bir yorum olarak yazılı.

### 2026-09-12 · npx vitest run src/fixtures.test.ts · v1 ve v2 yolu sınıfları normalize etmeden geçiriyor
Bulgu: Yeni iddialar yazılırken iki sürüm dosyası kırmızıya döndü ve ikisi de testin değil ürünün kusuruydu. `migrateV2toV3` sınıfları çıplak bir `asArray` ile alıyor, yani v3 ve sonrasının aynı liste üstünde koşturduğu iki normalleştiriciden geçmiyorlar.

Biri `asBox`: sınıfın günlük kutusu `null` yerine `undefined` geliyor. Kuralı okuyan her yer `??` ile geçtiği için ikisini ayırt etmiyor, ama `Rules.tsx:75` `!== null` diye soruyor, yani bir v1 ya da v2 yedeği açılınca Ayarlar → Kurallar'daki "kendi sınırı olan sınıflar" tablosu bütün sınıfları listeliyor, her birinin sayı hücresi boş.

Öteki `spreadColors`: hiçbir sınıf renk almıyor ve `paletteColor` hepsini paletin ilk rengiyle boyuyor, v1 ve v2 dosyalarının iki sınıfı için de `#c3a2cd` ölçüldü. Aynı renksizliği taşıyan v3 ve v4 dosyaları 0 ve 1 alıyor, yani kusur dosyanın şeklinde değil o yolda. Renk bu programda bir kimlik ([DATA.md](DATA.md)) ve tekrarlanan bir renk havuz kartının tek bir satırı göstermesini bozan şey.

İkisi de bir sonraki kayıtta kendiliğinden iyileşiyor, çünkü JSON gidiş dönüşü `undefined`'ı düşürüyor ve yeniden okuma bugünkü yoldan geçiyor. Yani etkisi yedeğin açıldığı oturumla sınırlı.
Tür: ürün kusuru, iki yarısı tek sebep
Ne yapıldı: düzeltilmedi, çünkü üretim kodu. TODO §8g'de madde açıldı. Test süiti yeşil kalsın diye bugünkü davranış `BİLİNEN KUSUR` adlı tek bir vakada çivilendi, ve o vaka düzeltme yapıldığı gün adıyla kırmızıya döner, erişilebilirlik tabanının çalıştığı gibi.
Kalıcı kural: yok

### 2026-09-12 · npx stryker run --mutate src/store.ts · kalan hayatta kalanların altısı denendi
Bulgu: Ayrıştırma yarısında kalan 29 mutantın altısı, yazarken "bunu neden öldüremiyorum" diye bakılanlardı, ve okunarak değil denenerek sınıflandırıldılar (2026-09-12'nin `constraints.ts:820` dersi). Her biri için onu ayırt edebilecek girdi kuruldu (on dört örnek dosya, artı gün listesi boşaltılmış, artı program zarfı çıkarılmış hâlleri) ve temiz kodun çıktısıyla mutantın çıktısı karşılaştırıldı.

Altısında da çıktı birebir aynı çıktı: `programs` dizisinin `[]` yedeği ve `activeProgramId`'nin sürüm kapısı (ikisini de `sanitize()` zaten onarıyor, boş bir kimlik `program-1` ve boş bir ad `Program 1` oluyor), `migrateV2toV3`'ün boş gün listesi kapısı ile `readDays`'in yedeği ile `parseState`'in son gün kapısı (üçü birbirini maskeliyor, biri bozulunca öteki ikisi hâlâ düzeltiyor), ve `pairs` tavanının `weeklyHours / 2`'si (çıktıyı `clampBlocks` yeniden kırptığı için fark görünmüyor).

Üç kapının birbirini maskelemesi `invariants.test.ts`'in çözücüde ölçtüğü desenin aynısı: aynı şeyi söyleyen iki kapıdan yalnız biri bozulunca öteki hâlâ reddediyor. Bu bir test boşluğu değil, kodun kendi fazlalığı.
Tür: bulgu değil, sınıflandırma. Altısı da anlamsız mutant, ölçülmeyen davranış değil.
Ne yapıldı: kayda geçti. Genel sınıflandırma işi TODO §8f'de duruyor, bu altı onun içinden düşer.
Kalıcı kural: yok

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

Ölçüm aletinin kendisi iki kez sorgulandı. Birincisi: `scratch/olc-boya.mjs`'ye eklenen `data-theme` zamanlaması ilk hâlinde başlangıç betiğinde `document.documentElement.hasAttribute(...)` çağırıyordu, o an `documentElement` henüz yok, satır fırlatıyor ve bütün başlangıç betiğini götürüyordu. Alet o hâlde x1'de bile "tema boyamadan önce 0/9" ve "zemin `undefined`" diyordu, yani kusuru olduğundan büyük gösteriyordu. O koşu sayılmadı. Düzeltilmiş alet belgedeki tabanı birebir üretti (x1'de tema 61 ms / boyama 64 ms, x4'te tema 218,9 ms / boyama 156 ms), ve ancak ondan sonra ölçüm alındı. Aynı tuzak bu dosyanın 2026-09-11 kaydında da yaşanmış.

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
