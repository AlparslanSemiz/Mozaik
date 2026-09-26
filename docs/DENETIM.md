# Denetim

Mozaik'in özellik özellik denetimi: ne iyi, ne kötü, ne kırık ve ne daha iyi olur.

Bu belge 2026-09-26'da başlayan elle denetimin raporu. Her özellik Playwright'ta
(Chromium, `dist/index.html`, `file://`) elle kullanılır gibi sürüldü ve ekran
görüntüsüne bakılarak değerlendirildi. Exe'ye ait olan gerçek Linux ikilisinde
(`scripts/exe-surucu.mjs`) denendi. Bu turda ürün kodu değişmedi. Üretilen her kusur
[TODO.md](TODO.md)'de §8j'ye numaralı madde olarak girdi. Ekran görüntüleri git dışında,
`scratch/denetim/` altında duruyor.

Denetlenen yapı f25e356'dan derlendi. Babanın gerçek dosyası kullanılmadı, yalnız adsız
fikstürler.

## Nasıl okunur

Özet tablo en üstte: önce kusurlar şiddete göre, sonra kullanım kolaylığı sorunları
etkilerine göre, sonra öneriler. Altında envanter, her satırın durumuyla. Sonra envanter
sırasıyla her özelliğin bölümü, beş başlıkla: ne ve nerede, nasıl denendi, iyi olan, kötü
olan, kusur, şöyle olsa daha iyi. Bir önerinin kaynağı yanında yazılı: aSc'de böyle
([ASC.md](ASC.md)), ölçüm böyle gösterdi, ya da denetçinin önerisi.

Numaralar: kusur `DK`, kullanım kolaylığı sorunu `KS`, öneri `Ö`. Envanterin harfleriyle
çakışmasınlar diye iki harfli.

Şiddet dört basamak: **veri kaybı**, **yanlış sonuç**, **çökme**, **görsel ya da metin**.
Durum işaretleri: `denenmedi`, `denendi, bulgu yok`, `denendi, bulgu var`, `kısmen` ve
`denenemez`.

## Veri setleri ve kutular

| Ad | Ne | Nereden |
|---|---|---|
| boş | ilk açılış, boş depo | temiz bir tarayıcı bağlamı |
| örnek | örnek okul: 25 öğretmen, 20 sınıf, 8 derslik, 99 ders | Okul → `Örnek veriyle doldur` |
| fikstür | babanın adsız planı, 0 yerleşim, bu hâliyle kurulamıyor | `src/fixtures/tam-dolu-kurs.json` |
| dizili | aynı plan, babanın elle dizdiği saatlerle | `src/fixtures/tam-dolu-kurs-dizili.json` |
| tam | dizili plana bir öneri uygulanmış tam hafta, her sınıf dolu | `scratch/tam-hafta-uret.mjs` |
| uzun ad | örnek okul, adlar kırk karakterin üstünde, Türkçe harfli | `scratch/denetim/veri-uret.mjs` |
| tek öğretmen | örnek okulun ilk öğretmeni ve onun dersleri | aynı betik |
| kurulamaz küçük | bir öğretmen, iki sınıf, haftadan fazla saat | aynı betik |
| bozuk | JSON olmayan, boş, gelecek şemalı, alanı eksik, yetim kimlikli | aynı betik |
| eski şema | v1, v7, v12, v15 örnekleri | `src/fixtures/` |

Kutular: 1920×1080 DPR 1 (babanın monitörü) ve 1536×816 DPR 1,25 (Windows %125'in
kutusu, tuzak 107). Uygulamanın ölçeği %80, %100 ve %150. Açık ve koyu tema. Türkçe,
İngilizce ve Almanca.

## Özet (2026-09-26)

Envanterin 73 satırının hepsi bir durum taşıyor: 60'ı denendi (53'ünde bulgu var), 12'si
kısmen, biri denenemedi (Windows kurulum paketi). On üç kusur üretildi, hiçbiri çökme
değil. Yirmi sekiz kullanım kolaylığı sorunu ve kırk sekiz öneri var. Kusurların hepsi TODO §8j'de numaralı
madde.

### Kusurlar, şiddete göre

| No | Şiddet | Kusur | Bölüm |
|---|---|---|---|
| DK8 | veri kaybı (koşullu) | Bir günü kaldırmak ya da günlük ders sayısını düşürmek dizili ve sabitli dersleri sorusuz siliyor, Ctrl+Z o anda çalışmıyor | A1 |
| DK9 | veri kaybı (koşullu) | "Ders adları"na az ad yazmak günü kısaltıp dersleri siliyor | A1 |
| DK11 | veri kaybı (onaydan sonra) | Öğretmeni ve dersi olmayan bir dosya geçerli sayılıp planı boşaltıyor | E6 |
| DK1 | yanlış sonuç | Sınıf ve derslik panelinde Ad kutusuna tıklayıp çıkmak adı "320 sınıfı" yapıyor | P1 |
| DK5 | yanlış sonuç | Durdurulan arama "yol bulunamadı" diye bitmiş gibi sunuluyor | P12 |
| DK7 | yanlış sonuç | Kontrol'ün hükmü ve Durum'u kapalı saatteki dersleri görmüyor ("Sorun görünmüyor") | K1 |
| DK4 | metin | Geri almadan sonra gerekçe satırı olmayan bir başarıyı söylüyor (exe'de de) | P12 |
| DK2 | metin | Olmayan bir takasın gerekçesi takas ortağını gösteriyor, asıl engeli değil | P6 |
| DK10 | metin | Daha yeni sürümün plan dosyası "okunamadı" diye reddediliyor | E6 |
| DK12 | metin | Kimya'nın kısaltması dört dilde "kim?" diye çevrilmiş ("Who", "Wer") | X2 |
| DK13 | metin | Dersler şeridinin toplamı çevrilmiyor ("99 ders · 433 saat") | X2 |
| DK3 | görsel | Yatay kaydırınca köşe hücresi saat başlıklarının altında kalıyor | P11 |
| DK6 | görsel | Müsaitlik'te öğle arasından sonraki saatin başlığı saatsiz ve kaymış | M3 |

### Kullanım kolaylığı sorunları, etkiye göre

| No | Sorun | Bölüm |
|---|---|---|
| KS19 | Müsaitlik klavyeyle hiç girilemiyor | M2 |
| KS5 | Havuzdan sürüklerken ızgara kendiliğinden kayıyor, el hızında 82 px | P5 |
| KS26 | Geri al geçmişi 30 adımda sessizce bitiyor | E4 |
| KS23 | "Taslak olarak kaydet" kullanıcıyı boş ızgaralı bir plana geçiriyor | A4 |
| KS21 | Kontrol'de kapalı saatteki dersin satırı hangi ders olduğunu söylemiyor | K2 |
| KS10 | Bazı öneri yolları tek cümlede yedi koşul | P13 |
| KS11 | "Cumartesi 11 saat" ile "Cumartesi 11. saat" aynı panelde | P13 |
| KS12 | Öneri paneli ızgaranın yarısını alıyor | P13 |
| KS15 | Dersleri yapıştırın önizlemesi bilinmeyen sınıfı ve öğretmeni yakalamıyor | D3 |
| KS8 | Izgarada klavyeyle dolaşmak kart başına iki Tab, oklar yok | P10 |
| KS9 | Kart kaldırılınca odak kayboluyor | P10 |
| KS27 | Sekmeden içeriğe varmak 23 ile 28 Tab | X5 |
| KS6 | Sabitlik işareti yaklaşık 10 px, raptiye düğmesi 13 px | P8 |
| KS7 | Sabitli karta yapılan hamle sessizce yutuluyor | P8 |
| KS1 | Rahat'ta saat başlığının saatleri birbirine yapışık | P1 |
| KS2 | Satır başında paneli yalnız 19×16 px'lik ad açıyor | P1 |
| KS25 | Küçük yazıda kelime araları kapanıyor ("Sorunyok", "Hepsiyerleşti") | X3 |
| KS24 | Durum çipi %150'de "S…" | X3 |
| KS14 | Dağılım iki yazımı karıştırıyor ("3+2+1+1", "2×2 + 3×1") | D2 |
| KS16 | Aynı adlı ikinci derslik ve öğretmen sessizce ekleniyor | O2 |
| KS17 | Program kısaltmayı kendisi çakıştırıyor ("AY", "AY") | O4 |
| KS18 | Okul yapıştırma önizlemesi alanların adını söylemiyor | O10 |
| KS22 | Danışman örnek okulda aynı cümleyi 43 kez söylüyor | K2 |
| KS13 | Önizleme kapanınca ızgara önizlemenin kaydırdığı yerde kalıyor | P15 |
| KS20 | Müsaitlik'in ısı tablosunda renk farkı zor görülüyor | M5 |
| KS28 | Sitede "Güncellemeleri denetle" güncelken bir şey söylemiyor | T2 |
| KS3 | Renk modlarının lejantı yok | P2 |
| KS4 | Havuzun en küçük boyu kartları ortadan kesiyor | P4 |

### Öneriler, değere göre

| No | Öneri | Kaynak |
|---|---|---|
| Ö40 | Dersi dizili gün ya da saat kaldırılmadan önce kayıp sorulsun, ya da dersler yerinde kalıp işaretlensin | PRINCIPLES "Veri kaybı olmaz" |
| Ö33 | Müsaitlik bir ARIA ızgarası olsun: oklar, Space, düğme başlıklar | denetçinin önerisi |
| Ö6 | Kenar kaydırması imleç kenarda bir süre durunca başlasın | ölçüm KS5 |
| Ö12 | Program ızgarası tek Tab durağı, içinde oklar | denetçinin önerisi |
| Ö46 | Geri al geçmişi bir oturum boyu tutulsun ya da tavanı büyüsün | denetçinin önerisi |
| Ö36 | Kontrol'ün hükmü kapasiteyi ve yerleşimi ayrı söylesin | denetçinin önerisi |
| Ö37 | Kapalı saatteki ders satırı dersi söylesin ve karta götürsün | denetçinin önerisi |
| Ö15 | Çok koşullu bir yol öğretmen başına bir satır olsun | denetçinin önerisi |
| Ö20 | Durdurulan arama bulduklarını göstersin ve "Aramayı sürdür" desin | DK5 |
| Ö43 | Dosya yüklemenin sorusu dosyayı açık planla yan yana saysın | DK11 |
| Ö41 | Ctrl+Z yalnız metin kutularında susturulsun | DK8 |
| Ö9 | Sabitli kart bir kenar işaretiyle ayrılsın, raptiye en az 24 px olsun | PRINCIPLES "Kullanılabilirlik" |
| Ö44 | Çeviri sözlüğünde iki anlamlı Türkçe metne bağlam eki | DK12 |
| Ö47 | "İçeriğe geç" bağlantısı ve şeritle içerik arasında bir kısayol | ölçüm KS27 |
| Ö1 | Rahat'ta saat başlığı arayla yazılsın ya da yalnız numara kalsın | ölçüm KS1 |
| Ö42 | "Taslak olarak kaydet" ne yaptığını söylesin ve kullanıcıyı yerinde bıraksın | KS23 |

Kalan öneriler bölümlerinde (Ö2 ile Ö48 arası).

## Envanter

| No | Ekran | Özellik | Durum |
|---|---|---|---|
| E1 | Üst çubuk | Marka, yedi sekme, Alt+1..7 | denendi, bulgu var |
| E2 | Üst çubuk | Durum çipi | denendi, bulgu var |
| E3 | Üst çubuk | Plan seçici | denendi, bulgu var |
| E4 | Üst çubuk | Geri al ve ileri al (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, 30 adım) | denendi, bulgu var |
| E5 | Üst çubuk | Dosyaya kaydet | denendi, bulgu yok |
| E6 | Üst çubuk | Dosyadan aç: plan, paket, gelecek sürüm, bozuk, eski şema | denendi, bulgu var |
| E7 | Üst çubuk | Ara ve git, Ctrl+K komut paleti | denendi, bulgu yok |
| E8 | Üst çubuk | Klavye kısayolları ekranı (`?`) | denendi, bulgu var |
| E9 | Üst çubuk | Araç şeridini aç kapa, kaydırınca gizlenme | denendi, bulgu yok |
| E10 | Üst çubuk | Tema düğmesi | denendi, bulgu yok |
| E11 | Üst çubuk | Uyarı çubukları: otomatik kayıt çalışmıyor, güncelleme, `Klasörü düzelt` (belgede yok) | kısmen |
| O1 | Okul | Başlarken paneli ve örnek veri | denendi, bulgu var |
| O2 | Okul | Derslikler: form, tablo, sil | denendi, bulgu var |
| O3 | Okul | Branşlar: form, hazır branşlar, yeniden adlandırma, kullanılanı silme, elle sıra | kısmen |
| O4 | Okul | Öğretmenler: form, kısaltma, iki branş, cinsiyet, sınırlar, kısaltma çakışma uyarısı (belgede yok) | kısmen |
| O5 | Okul | Sınıflar: form, derslik, günde aynı ders | denendi, bulgu var |
| O6 | Okul | Listelerde ara, sırala, süz, yük durumu | denendi, bulgu var |
| O7 | Okul | Elle sıralama: fare ve klavye | kısmen |
| O8 | Okul | Renk seçici (6×6) | denendi, bulgu var |
| O9 | Okul | Özet ve renkleri yeniden dağıt (belgede yok) | kısmen |
| O10 | Okul | Excel'den yapıştır kutuları | kısmen |
| M1 | Müsaitlik | Kim, Açık olan, varlık listesi | denendi, bulgu var |
| M2 | Müsaitlik | Hücre tıklama ve boyayarak sürükleme (belgede yok) | denendi, bulgu var |
| M3 | Müsaitlik | Sütun ve gün başlığı, Tümünü aç ve kapat (belgede yok) | denendi, bulgu var |
| M4 | Müsaitlik | Kapasite uyarısı, kapanan saatte kalan ders | denendi, bulgu var |
| M5 | Müsaitlik | Haftanın darlığı, Saatler | denendi, bulgu var |
| D1 | Dersler | Üç yöntem ve Açık olan | denendi, bulgu var |
| D2 | Dersler | Yeni ders formu ve Dağılım seçici | denendi, bulgu var |
| D3 | Dersler | Dersleri yapıştır | denendi, bulgu var |
| D4 | Dersler | Ders düzenleyici: taşıma, aktarma, günde en fazla | denendi, bulgu var |
| D5 | Dersler | Aynı gün olmasın ilişkisi | denendi, bulgu var |
| P1 | Program | Izgara: iki görünüm, satır başı, imleç haçı, öğle arası | denendi, bulgu var |
| P2 | Program | Renk modları (dört) | denendi, bulgu var |
| P3 | Program | Yoğunluk: Ferah, Rahat, Sığdır | denendi, bulgu var |
| P4 | Program | Havuz: çekmece, kenar, sıralama, süzgeç, deste | denendi, bulgu var |
| P5 | Program | Sürükle bırak: renkler, gerekçe satırı, kenarda kayma, Esc | denendi, bulgu var |
| P6 | Program | Takas: tekli ve çoklu | denendi, bulgu var |
| P7 | Program | Tahliye (sınıfın kendi dersini havuza döndürme) | denendi, bulgu var |
| P8 | Program | Sabitleme: raptiye, toplu sabitle, tüm programı sabitle | denendi, bulgu var |
| P9 | Program | Sağ tık menüsü: kart, satır, gün, saat başlığı, havuz kartı | denendi, bulgu var |
| P10 | Program | Klavye: Enter ve Space menü, Delete ve Backspace | denendi, bulgu var |
| P11 | Program | Geçici görünüm | denendi, bulgu var |
| P12 | Program | Otomatik diz, Baştan diz, Durdur | denendi, bulgu var |
| P13 | Program | Öneri paneli ve yolları | denendi, bulgu var |
| P14 | Program | Cevap defteri: Olur, Olmaz, kopyala, yazdır | denendi, bulgu var |
| P15 | Program | Önizleme çubuğu | denendi, bulgu var |
| P16 | Program | Alternatif programlar menüsü | denendi, bulgu var |
| P17 | Program | Programı boşalt | denendi, bulgu var |
| P18 | Program | Varlık paneli (satır başından ve menüden) | denendi, bulgu var |
| P19 | Program | Boş ekran | denendi, bulgu var |
| K1 | Kontrol | Hüküm kutusu ve Programın durumu | denendi, bulgu var |
| K2 | Kontrol | Sorunlar, Danışman, kapasite tabloları | denendi, bulgu var |
| K3 | Kontrol | Durum çipiyle tutarlılık, boş ekran | denendi, bulgu var |
| K4 | Kontrol | Baskı seçeneği (yok) | denendi, bulgu yok |
| C1 | Çıktı | İçerik, Renkli bas, sayfa seçimi | denendi, bulgu var |
| C2 | Çıktı | Sayfa düzeni, kâğıttaki yazı, sayfada ne olsun | denendi, bulgu var |
| C3 | Çıktı | Kâğıdın kendisi (PDF) | denendi, bulgu var |
| A1 | Ayarlar | Zil ve günler, Ders adları (belgede yok) | kısmen |
| A2 | Ayarlar | Kurallar | denendi, bulgu var |
| A3 | Ayarlar | Görünüm: tema, ölçek, iki yoğunluk, şerit, hareket, dil | kısmen |
| A4 | Ayarlar | Planlar ve yedek: planlar, taslak, paket, oturum yedekleri | kısmen |
| A5 | Ayarlar | Hakkında: sürüm, Nasıl açıldı (belgede yok), Yenilikler, Veriler nerede, örnek, Sıfırla | denendi, bulgu var |
| X1 | Kesişen | Klasöre yedek | kısmen |
| X2 | Kesişen | Beş dil: İngilizce ve Almanca turu | denendi, bulgu var |
| X3 | Kesişen | Ölçek %80 ve %150, 1536 kutusu | denendi, bulgu var |
| X4 | Kesişen | Koyu tema | denendi, bulgu yok |
| X5 | Kesişen | Fare olmadan tam bir tur | denendi, bulgu var |
| X6 | Kesişen | Diyaloglar ve bildirimler | denendi, bulgu var |
| X7 | Kesişen | Uzun adlar | denendi, bulgu var |
| T1 | Teslim | `dist/index.html` `file://` | denendi, bulgu yok |
| T2 | Teslim | Site ve service worker | kısmen |
| T3 | Teslim | Windows kurulum paketi | denenemez (Windows yok) |
| T4 | Teslim | Exe: pencere, diske yazma, güncelleme denetimi, yazdırma | kısmen (yazdırma denenmedi) |

## Bölümler

### P1 · Izgara: görünümler, satır başı, imleç haçı (2026-09-26)

**Ne ve nerede.** Program sekmesi, şeritte `Görünüm` (Öğretmen, Sınıf). Satır başındaki ad
varlık panelini açar. Bir hücrenin üstüne gelince satır ve sütun aydınlanır.

**Nasıl denendi.** Örnek okul ve tam hafta. 1920×1080 ve 1536×816 DPR 1,25, açık tema,
%100. İki görünüm arasında geçildi, bir hücrenin üstüne gelindi, satır başına tıklandı,
panelin Ad kutusuna tıklanıp çıkıldı. Görüntüler: `scratch/denetim/program/sinif-gorunum-bos-1920.png`,
`scratch/denetim/program/imlec-haci-1920.png`, `scratch/denetim/program/satir-basi-panel-1920.png`,
`scratch/denetim/program/saat-basligi-rahat-1920-yakin.png`.

**İyi olan.**
- Görünüm düğmesi bir tık ve etkisi hemen görülüyor. Satır başının altındaki ikinci satır
  (branş ya da derslik) satırın ne olduğunu adı okunmadan söylüyor.
- İmleç haçı satırı, sütunu, saat başlığını ve satır adını birlikte yakıyor. Babanın
  uzun bir haftada yerini kaybetmemesi için doğru araç.
- Kapalı saatin kırmızı çarpısı ve taraması uzaktan okunuyor.
- Panel sağdan kayıyor, ızgara arkada kalıyor, Esc kapatıyor.

**Kötü olan.**
- **KS1 · Rahat'ta saat başlığının saatleri birbirine yapışık.** 1920'de her sütun
  32 px, "09:00" 31 px tutuyor, yani iki saat arasında 1 px kalıyor ve başlık
  "09:0009:5010:4011:30" diye tek bir dizi gibi okunuyor. Ferah'ta aynı başlık rahat.
  Ölçüm: sütun genişliği ve metnin `Range` genişliği, görüntüyle yan yana.
- **KS2 · Satır başında paneli yalnız ad açıyor.** Satır başı hücresi 75×35 px, ama
  tıklanan düğme adın kendisi, 19×16 px. Hücrenin boş köşesine tıklamak hiçbir şey
  yapmıyor. Zor gören biri için hedef küçük ve sınırı görünmüyor.
- Sınıf görünümünde ızgara son satırdan sonra boş bir alan bırakıyor, havuz yine de
  ekranın altında. Bir şey kaybedilmiyor, yalnız yer harcanıyor.

**Kusur.**
- **DK1 · Sınıf ve derslik panelinde Ad kutusuna tıklayıp çıkmak adı değiştiriyor.**
  Şiddet: yanlış sonuç (kullanıcının girdiği ad sessizce değişiyor ve kâğıda geçer).
  Adımlar: örnek okul, Program, Sınıf görünümü, "320" satır başına tıkla, Ad kutusuna
  tıkla, Tab'a bas. Beklenen: ad "320" kalır. Olan: ad "320 sınıfı" olur, kutu şimdi
  "320 sınıfı sınıfı" gösterir ve her açıp çıkışta bir "sınıfı" daha eklenir. Derslikte
  aynı: Okul → Derslikler → `A bilgileri` → Ad kutusu, "A" "A dersliği" olur.
  Öğretmende olmuyor. Ctrl+Z geri alıyor. Sebep kaynakta görülüyor: kutunun
  `defaultValue`'su başlık için biçimlenmiş ad (`{ad} sınıfı`, `src/ui/Inspector.tsx`),
  ve `rename()` blur'da değişip değişmediğine bakmadan yazıyor. Görüntü:
  `scratch/denetim/program/sinif-adi-bozuldu-1920.png`.
  **Düzeldi (2026-09-27, 46011b2).**

**Şöyle olsa daha iyi.**
- **Ö1.** Saat başlığında saat Rahat'ta da Ferah'taki gibi arayla yazılsın, ya da Rahat
  yalnız ders numarasını göstersin ve saat imleç haçının aydınlattığı sütunda çıksın
  (denetçinin önerisi, ölçüm KS1).
- **Ö2.** Satır başının tamamı panelin düğmesi olsun (denetçinin önerisi, ölçüm KS2).

### P2 · Renk modları (2026-09-26)

**Ne ve nerede.** Program şeridi, `Renk` menüsü: Öğretmene, Sınıfa, Dersliğe ya da Branşa
göre.

**Nasıl denendi.** Örnek okul dizili, 1920, açık, %100. Menü açıldı, dört mod sırayla
seçildi. Görüntüler: `scratch/denetim/program/renk-menusu-1920.png` ve
`scratch/denetim/program/renk-*-1920.png`.

**İyi olan.** Menü açık seçimi bir onay işaretiyle gösteriyor, ve düğmenin kendi yazısı
açık modu söylüyor ("Öğretmene göre"). Dört modun dördü de kartları hemen boyuyor.

**Kötü olan.**
- **KS3 · Renklerin neyi gösterdiğini söyleyen bir lejant yok.** Dersliğe ya da branşa
  göre boyanınca hangi rengin hangi derslik olduğu yalnız kartın alt satırından
  okunuyor. TODO B4.11 düğmenin bulunmasını anlatıyor, lejantı değil.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö3.** Öğretmen dışındaki modlarda şeridin altında ya da havuzun
başında küçük bir lejant: renk noktası ve ad (denetçinin önerisi).

### P3 · Yoğunluk: Ferah, Rahat, Sığdır (2026-09-26)

**Ne ve nerede.** Program şeridi, `Yoğunluk`. Aynı ayar Ayarlar → Görünüm'de de var.

**Nasıl denendi.** Örnek okul dizili 1920'de üç yoğunluk, tam hafta 1536×816 DPR
1,25'te Rahat ve Sığdır. Görüntüler: `scratch/denetim/program/yogunluk-ferah-ornek-1920.png`,
`scratch/denetim/program/yogunluk-sığdır-ornek-1920.png`,
`scratch/denetim/program/tam-rahat-1536.png`, `scratch/denetim/program/tam-sigdir-1536.png`.

**İyi olan.**
- 1920'de Sığdır örnek okulun bütün haftasını, Pazar dahil, tek ekrana koyuyor ve
  kartlar okunuyor.
- Düğmelerin `title`'ı ne kazanılıp ne verildiğini söylüyor ("ders saatleri gizlenir").
- Ferah'ta saat başlığı ve kart en rahat okunan hâlinde.

**Kötü olan.**
- 1536 DPR 1,25'te tam haftada Sığdır'da tek saatlik kartların çoğu hâlâ "41…" ve
  "5…" diye kesik. Bu bilinen kusur (WORKLOG "Şu an", 1536'da 81 kart), denetim
  yenisini bulmadı. Denetçinin kendi sayacı burada 0 dedi ve yanıldı, ekran haklı
  (tuzak 140). Sayaç bir kez daha ekranla yan yana okunmadan kullanılmamalı.
- Sığdır'da köşedeki "ÖĞRETMEN" 11 px, uygulamanın en küçük yazısı. Sığdır'ın
  kart yazısının 9 px'e inmesi kullanıcının onayladığı bir karar.
- 1920'de Sığdır dikeyde sığmıyor: örnek okulun son iki öğretmeni (FK, CA) kaydırma
  istiyor. Belge "haftanın tamamı" diyor ve yatayı kastediyor, bu doğru, ama düğmenin
  `title`'ı "Haftanın tamamı ekrana sığar" dediği için dikeyin de sığacağı
  beklenebilir.

**Kusur.** Yok (bilinen kusur yeniden sayılmadı).

**Şöyle olsa daha iyi.** **Ö4.** Sığdır'ın `title`'ı "Haftanın bütün günleri yan yana sığar"
desin (denetçinin önerisi).

### P4 · Havuz (2026-09-26)

**Ne ve nerede.** Izgaranın altındaki çekmece: başlık ("N blok bekliyor"), aç kapa düğmesi,
kenarından sürüklenen boy (`role="separator"`, klavyede ↑ ↓ Home End), beş sıralama ve
branş süzgeci.

**Nasıl denendi.** Örnek okul, boş ızgara, 1920, açık, %100. Kenar fareyle 250 px yukarı
çekildi, sonra klavyeyle End, Home ve ↑ denendi, dört sıralama ve Fizik süzgeci
seçildi, çekmece kapatılıp açıldı. Görüntüler: `scratch/denetim/program/havuz-buyutuldu-1920.png`,
`scratch/denetim/program/havuz-suzgec-fizik-1920.png`, `scratch/denetim/program/havuz-kapali-1920.png`.

**İyi olan.**
- Kart hem yazıyla ("0/5") hem genişliğiyle kaç saat olduğunu söylüyor, ve satırın adı
  ile renk noktası grubun başında duruyor.
- Süzgeç seçilince başlık neyin saklandığını söylüyor: "24 blok bekliyor, 343 blok
  süzgeç dışında". Yanlış bir "hepsi yerleşti" okunamıyor.
- Kenar klavyeyle sürülebiliyor ve odakta kalın mavi bir çizgi oluyor.

**Kötü olan.**
- **KS4 · Havuzun en küçük boyu kartları ortadan kesiyor.** Home ile en küçük boya
  inince (`aria-valuenow` 6) kartların yalnız üst satırı görünüyor, ikinci satır
  kesik (`scratch/denetim/program/havuz-sira-branşa-1920.png`). En küçük boy bir
  kart sırasını tam göstermiyor.
- Kenarın ekran okuyucuya söylediği değer birimsiz bir sayı ("11", "22"), çünkü
  `aria-valuetext` yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö5.** En küçük boy bir kart sırası artı başlık olsun (denetçinin
önerisi, görüntü KS4).

### P5 · Sürükle bırak (2026-09-26)

**Ne ve nerede.** Havuzdan ya da ızgaradan bir kartı sol tuşla sürüklemek. Hedef satır
zayıf, imlecin altındaki blok güçlü boyanır, gerekçe `.reason-bar`'da yazılır, ızgara
kenara gelince kayar, Esc vazgeçer.

**Nasıl denendi.** Örnek okul, 1920, fare `mouse.down/move/up` ile adım adım. Önce
kapalı bir saatin, sonra açık bir saatin üstünde durulup görüntü alındı. Havuzdan
ızgaraya iki hızda geçildi: hızlı (15 adım) ve el hızında (40 adım, adım başına 16 ms),
ve ızgaranın `scrollTop`'u okundu. Görüntüler: `scratch/denetim/program/surukle-kirmizi-1920.png`,
`scratch/denetim/program/surukle-yesil-1920.png`, `scratch/denetim/program/tahliye-uzerinde-1920.png`.

**İyi olan.**
- Renk dili açık: hedef satırda yeşil, sarı ve kırmızı hücreler bir bakışta okunuyor,
  öteki satırlar soluyor.
- Kırmızının sebebi düz Türkçe: "MÇ Salı 3 saatinde müsait değil". Yeşilde "Buraya
  bırakılabilir."
- Bırakınca kart yerinde, havuzun sayacı iniyor.

**Kötü olan.**
- **KS5 · Havuzdan ızgaraya sürüklerken ızgara kendiliğinden kayıyor.** Kart ızgaranın
  alt kenarından geçerken kenar kaydırması tetikleniyor. Hızlı geçişte 14 px, el
  hızında 82 px, yani iki satırdan fazla. İmlecin altındaki satır nişan alınan satır
  olmaktan çıkıyor, ve ilk satır sabit başlığın altına yarı giriyor. Sol kenardan
  geçen kart ızgarayı yatayda da kaydırıyor (tahliye görüntüsünde Salı'nın ilk iki
  saati satır başının altında). Havuzdan başlayan her sürükleme bu kenardan geçmek
  zorunda.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö6.** Kenar kaydırması imleç kenar bölgesinde bir süre (örneğin
300 ms) durduktan sonra başlasın, ya da sürükleme havuzdan başladıysa imleç ızgaraya bir
kez girene kadar alt kenar kaydırmasın (denetçinin önerisi, ölçüm KS5). aSc'de kart
tepsisi de ızgaranın altında (ASC.md), aynı geçiş orada da var ve nasıl çözüldüğü
okunmadı.

### P6 · Takas (2026-09-26)

**Ne ve nerede.** Izgaradaki bir kartı başka bir kartın üstüne bırakmak. İki hamle de
yasalsa iki kart yer değiştirir, hücre sarı olur ve satır "A ile B yer değiştirecek" der
([DATA.md](DATA.md), "Bir kartı bırakırken").

**Nasıl denendi.** Örnek okul otomatik dizildikten sonra, öğretmen görünümü, 1920. Dört
öğretmen satırında ilk kart sürüklenip aynı satırın her kartının üstünde durup gerekçe
satırı okundu. Bir takas gerçekten yapıldı. Görüntüler: `scratch/denetim/program/takas-uzerinde-1920.png`,
`scratch/denetim/program/takas-yapildi-1920.png`.

**İyi olan.** Yasal takas sarı ve iki dersi adıyla söylüyor ("430 · KY ile 431 · KY yer
değiştirecek"), bırakınca bildirim aynı cümleyi geçmiş zamanla tekrarlıyor.

**Kötü olan.** MÇ'nin satırında on bir denemenin üçü "310 · MÇ ile 310 · MÇ yer
değiştirecek" dedi: aynı dersin iki bloğunun yer değiştirmesi ızgarada hiçbir şeyi
değiştirmiyor ama bir hamle olarak sunuluyor ve geri al yığınına giriyor.

**Kusur.**
- **DK2 · Olmayan bir takasın gerekçesi takas ortağını gösteriyor, asıl engeli değil.**
  Şiddet: metin. Adımlar: örnek okul, Otomatik diz, öğretmen görünümü, MÇ satırında
  310'u (Çarşamba 4) 431'in (Çarşamba 10) üstüne sürükle. Beklenen: takasın neden
  olmadığı, burada 431'in dersliği E'nin o saatte 430'la dolu olması. Olan: "MÇ
  Çarşamba 10 saatinde 431 sınıfında", yani kullanıcının zaten üstüne bıraktığı kart.
  Aynı satırda sekiz kırmızı hücrenin sekizi de bu biçimde. Durum `localStorage`'dan
  okunarak doğrulandı: ret doğru, cümle yanlış. Görüntü:
  `scratch/denetim/program/takas-uzerinde-1920.png`.
  **Düzeldi (2026-09-27, 5ec5fc5).**

**Şöyle olsa daha iyi.** **Ö7.** Aynı dersin iki bloğu arasındaki takas teklif edilmesin,
ve kart kartın üstüne bırakılamıyorsa cümle takasın hangi yarısının neden olmadığını
söylesin: "Takas olmaz: 431'in dersliği E Çarşamba 4'te dolu" (denetçinin önerisi).

### P7 · Tahliye (2026-09-26)

**Ne ve nerede.** Havuzdaki bir kartı sınıfın kendi başka dersinin üstüne bırakmak: o ders
havuza döner, hücre sarı.

**Nasıl denendi.** Örnek okul dizili, sınıf görünümü, 1920. Bir kart Delete ile havuza
gönderildi, havuzdaki iki saatlik ED kartı 310 satırında iki dersin üstüne sürüklendi.
Görüntüler: `scratch/denetim/program/tahliye-uzerinde-1920.png`,
`scratch/denetim/program/tahliye-sonra-1920.png`.

**İyi olan.** Sarı hücre ve cümle neyin kaybedileceğini adıyla sayıyor ("310 · GÇ, 310 ·
ZA dersleri havuza dönecek"), bildirim aynısını söylüyor, iki saatlik blok iki tek saati
doğru buluyor.

**Kötü olan.**
- Delete ile havuza gönderilen kart için bildirim yok. LAYOUT "olan biteni kısa bir
  bildirim satırı söyler" diyor, havuza kaldırmada söylemiyor.
- Bu denemede de ızgara sürüklerken yatayda ve dikeyde kaydı (KS5).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö8.** Havuza kaldırma da bir satırlık bildirimle söylensin: "310 ·
ED havuza döndü" (denetçinin önerisi).

### P8 · Sabitleme (2026-09-26)

**Ne ve nerede.** Kartın köşesindeki raptiye düğmesi, sağ tık menüsünde "Dersi buraya
sabitle" ve "Toplu sabitle", şeridin İşlemler menüsünde "Tüm programı sabitle".

**Nasıl denendi.** Örnek okul dizili, 1920. Raptiyeye tıklandı, sabitli kart
sürüklenmeye çalışıldı, Delete'e basıldı, satır başından "Satırı sabitle / kaldır" iki
kez seçildi. Görüntüler: `scratch/denetim/program/raptiye-410-yakin-x5.png`,
`scratch/denetim/program/raptiye-satir-1920.png`, `scratch/denetim/program/islemler-menu-1920.png`.

**İyi olan.** Sabitli kart sürüklenmiyor ve silinmiyor, kartın erişilebilir adı
"sabitlenmiş" diyor, toplu sabitleme bir bildirimle kaç saat olduğunu söylüyor.

**Kötü olan.**
- **KS6 · Sabitlik işareti ve raptiye düğmesi küçük.** Düğme 13×13 px, işaret yaklaşık
  10 px ve derslik harfinin yanında duruyor. Hedef kullanıcının gözüyle sabitli bir
  kartı sabitsizinden ayırmak zor, raptiye düğmesi de 24 px'lik taban hedefin altında.
- **KS7 · Sabitli karta yapılan hamle sessizce yutuluyor.** Sabitli kartı sürüklemek ya
  da Delete'e basmak hiçbir şey söylemiyor, gerekçe satırı bir önceki mesajda kalıyor.
- "Satırı sabitle / kaldır" iki işi tek etikette söylüyor, ve ne yapacağı satırın
  durumuna bağlı. Satırda bir kart sabitken seçilince hepsini sabitledi ve "23 saat
  sabitlendi" dedi, yeni sabitlenen 22 idi.

**Kusur.** Yok.

**Şöyle olsa daha iyi.**
- **Ö9.** Sabitli kart bir kenar ya da köşe işaretiyle de ayrılsın, raptiye düğmesi en az
  24 px olsun (denetçinin önerisi, PRINCIPLES "Kullanılabilirlik").
- **Ö10.** Sabitli karta hamle gelince gerekçe satırı "Bu ders sabitli, önce sabitlemeyi
  kaldırın" desin (denetçinin önerisi).
- **Ö11.** Menü satırın durumuna göre tek bir fiil göstersin ("Satırı sabitle" ya da
  "Satırın sabitlemesini kaldır"), aSc'nin şeridinde de "Kilitle" ve "Kilit Aç" ayrı iki
  düğme (ASC.md, kova 4 şerit envanteri).

### P9 · Sağ tık menüsü (2026-09-26)

**Ne ve nerede.** Kartta, satır başında, gün başlığında, saat başlığında ve havuz kartında
açılan menü ([LAYOUT.md](LAYOUT.md), "Sağ tık menüsü").

**Nasıl denendi.** Örnek okul dizili, 1920. Her yerde sağ tıklandı, alt menüler açıldı,
boş bir hücrede sağ tıklandı. Görüntüler: `scratch/denetim/program/menu-kart-1920.png`,
`scratch/denetim/program/menu-kart-toplu-1920.png`, `scratch/denetim/program/menu-satir-basi-1920.png`,
`scratch/denetim/program/menu-gun-1920.png`.

**İyi olan.** Menünün şekli LAYOUT'taki gibi. Her bağlam yalnız anlamlı kalemleri
gösteriyor: satır başında satır, gün başlığında gün, saat başlığında sütun. Boş hücrede
menü açılmıyor. Kalemlerin simgesi ve kelimesi var.

**Kötü olan.** Menü yazısı 13 px, uygulamanın geri kalanıyla aynı ama babanın gözü için
küçük tarafta. Boş hücrede sağ tık hiçbir şey yapmıyor ve bunu söylemiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### P10 · Izgarada klavye (2026-09-26)

**Ne ve nerede.** Odaklı kartta Enter ve Space menüyü açar, Delete ve Backspace havuza
gönderir, Tab bir sonraki odaklanabilire gider.

**Nasıl denendi.** Örnek okul dizili, 1920. Kart odaklandı, Enter, oklar, Esc, Space,
Tab, Tab, → ve Backspace denendi, her adımda `document.activeElement` okundu.
Görüntü: `scratch/denetim/program/kart-odak-yakin-x4.png`.

**İyi olan.** Enter ve Space menüyü açıyor ve odak menünün ilk kalemine geçiyor, oklar
kalemler arasında dolaşıyor, Esc odağı karta geri veriyor. Odak halkası kartta net
(açık zemin, sonra 2 px vurgu).

**Kötü olan.**
- **KS8 · Izgarada klavyeyle dolaşmak kart başına iki Tab.** Tab önce kartın raptiyesine,
  sonra bir sonraki karta gidiyor. Örnek okulda 367 kart var, oklar ızgarada hareket
  etmiyor. Fare olmadan belirli bir hücreye varmak pratikte mümkün değil.
- **KS9 · Delete ya da Backspace'ten sonra odak kayboluyor.** Kart havuza gidince odak
  `body`'ye düşüyor, bir sonraki Tab sayfanın başından başlıyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö12.** Izgara tek bir Tab durağı olsun ve içinde oklar hücreden
hücreye gitsin (ARIA grid deseni). Kaldırılan kartın yerine odak aynı hücrede ya da
satırın bir sonraki kartında kalsın (denetçinin önerisi).

### P11 · Geçici görünüm (2026-09-26)

**Ne ve nerede.** Sağ tık menüsünden ve İşlemler menüsünden satırı ya da günü soluklaştırmak
veya gizlemek, İşlemler'den tek tek ya da topluca geri yüklemek.

**Nasıl denendi.** Örnek okul dizili, 1920. MB satırı soluklaştırıldı, Çarşamba gizlendi,
İşlemler açıldı, Tümünü geri yükle seçildi. Görüntüler:
`scratch/denetim/program/gecici-gorunum-1920.png`, `scratch/denetim/program/gecici-gorunum-menu-1920.png`.

**İyi olan.** İşlemler menüsü neyin gizli ya da soluk olduğunu adıyla listeliyor
("Murat Bilge · soluk", "Çarşamba · gizli") ve sayıyor, geri yükleme bir tık.

**Kötü olan.** Izgaranın kendisi bir şeyin gizli olduğunu söylemiyor: gizlenen Çarşamba
yalnız başlıkta yok, bir işaret ya da şeritte bir sayaç bırakmıyor. Babanın bir gün
sonra "Çarşamba nereye gitti" diye sorması olası (öneri, doğrulanmadı).

**Kusur.**
- **DK3 · Izgara yatayda kaydırılınca sol üst köşe saat başlıklarının altında kalıyor.**
  Şiddet: görsel. Adımlar: dolu bir ızgarada yatay kaydır (40 px yeter). Beklenen:
  köşe hücresi ("ÖĞRETMEN") gövdedeki satır başları gibi yerinde ve üstte kalır. Olan:
  köşenin sağ yarısı kaydırılan saat başlıklarının altında, "ÖĞRE" okunuyor ve saat
  numaraları onun üstünde. Gövdenin satır başları doğru. Önizlemede ızgara kendiliğinden
  kaydırıldığında da görülüyor. Görüntüler: `scratch/denetim/program/kaydirma-40-sol-kenar.png`,
  `scratch/denetim/program/kaydirma-400-sol-kenar.png`.

**Şöyle olsa daha iyi.** **Ö13.** Bir şey gizliyken şeritte ya da ızgaranın köşesinde
"2 gizli" gibi bir çip dursun ve tıklanınca İşlemler'in listesini açsın (denetçinin
önerisi).

### P12 · Otomatik diz, Baştan diz, Durdur (2026-09-26)

**Ne ve nerede.** Program şeridi, `Diz` grubu.

**Nasıl denendi.** Örnek okul (dizilebilir) ve babanın adsız fikstürü (bu hâliyle
kurulamıyor), 1920, `performance` profili, kullanıcının tarayıcısı arka planda açıktı.
Görüntüler: `scratch/denetim/program/otomatik-diz-sonra-ornek-1920.png`,
`scratch/denetim/program/oneri-bitti-1920.png`.

**İyi olan.**
- Örnek okulda 367 blok 0,1 s'de yerleşiyor, gerekçe satırı sonucu ve geri alma yolunu
  söylüyor, çip "Sorun yok"a dönüyor.
- Fikstürde satır neyin neden yerleşmediğini söylüyor ("411A SAY · Ö3 Matematik: 2 saat
  yerleşemedi. Boş kalan saatler bu dersin 2 saatlik bloğuna uymuyor (ve 7 ders
  daha)").
- Düğme kaç blok beklediğini taşıyor ("Otomatik diz (367)").

**Kötü olan.** Kurulamayan haftada gerekçe satırı kırmızı ve ekran boyu uzun bir cümle.
"Ayrıntı: Kontrol sekmesi." bir bağlantı değil, düz metin.

**Kusur.**
- **DK4 · Geri almadan sonra gerekçe satırı olmayan bir başarıyı söylemeye devam ediyor.**
  Şiddet: metin. Adımlar: fikstürü yükle, Otomatik diz, öneri panelinde bir yola Olur
  de, "Programı yerleştir", Ctrl+Z. Beklenen: gerekçe satırı temizlenir ya da geri
  alındığını söyler. Olan: yeşil "Öneri uygulandı ve program yerleştirildi" kalıyor,
  aynı anda çip kırmızı "7 ders sığmıyor · 14 saat havuzda" ve havuzda 8 blok var.
  Sonradan yapılan "Programı boşalt" ve onun geri alınması da satırı değiştirmedi.
  Görüntü: `scratch/denetim/program/eski-mesaj-kaliyor-1920.png`.
  **Düzeldi (2026-09-27, 98e8a56).**

- **DK5 · Durdurulan arama "yol bulunamadı" diye bitmiş gibi sunuluyor.** Şiddet:
  yanlış sonuç (panel olmayan bir sonucu söylüyor). Adımlar: fikstürü yükle, Otomatik
  diz, panel "Nasıl kurulacağı aranıyor… 2 sn" derken şeritte `Durdur`. Beklenen:
  "Arama durduruldu" ve yeniden başlatma yolu. Olan: "Sınıfların saatlerine dokunmadan
  bir yol bulunamadı." Aynı fikstürde arama sürdürülünce altı yol buluyor. İki kez
  üretildi. Baba bu cümleyi okuyup haftanın sınıflara dokunmadan kurulamayacağına
  inanabilir. Görüntü: `scratch/denetim/program/durdur-sonra-tekrar-1920.png`.
  **Düzeldi (2026-09-27, 61cb429).**

Baştan diz de denendi: onay cümlesi dizilmiş saatlerin silineceğini sayıyor ve
sabitlenenlerin kalacağını söylüyor (`scratch/denetim/program/bastan-diz-onay-1920.png`).
Kayıtlı bir Olur cevabı varken Baştan diz'den hemen sonra panel "Olur dedikleriniz
yetiyor" dedi, yani cevap defteri yeni koşuya taşınıyor.

**Şöyle olsa daha iyi.**
- **Ö14.** "Ayrıntı: Kontrol sekmesi" tıklanınca Kontrol'ü açsın (denetçinin önerisi).
- **Ö20.** Durdurulan bir arama o ana kadar bulunanları göstersin ve "Aramayı sürdür"
  düğmesi bıraksın (denetçinin önerisi, DK5).

### P13 · Öneri paneli (2026-09-26)

**Ne ve nerede.** Kurulamayan bir haftada Otomatik diz'den sonra ızgaranın üstünde açılan
panel, yollar, `Izgarada göster`, `Uygula`, `Sorular`.

**Nasıl denendi.** Babanın adsız fikstürü, 1920, Chromium. Süre üç kez art arda ölçüldü,
her koşu yeni bir tarayıcı bağlamında, her koşudan önce profil okundu (`performance`).
Denetçinin başlattığı bir arka plan işi yoktu, kullanıcının kendi tarayıcısı açıktı.
Otomatik diz'e basıştan: panel 8,6, 9,1 ve 9,1 s'de açıldı, ilk yol 14,0, 16,0 ve 16,1 s'de
geldi, arama 45,4, 49,2 ve 50,3 s'de bitti. Exe'nin kendi ölçümü aynı fikstürde "ilk öneri
5 sn, arama 40 sn" (T4); iki sayının başlangıç noktası aynı değil (Chromium'unki
tıklamadan, exe'ninki aramanın başından).
Görüntüler: `scratch/denetim/program/oneri-panel-acildi-1920.png`,
`scratch/denetim/program/oneri-ilk-yol-1920.png`, `scratch/denetim/program/oneri-bitti-1920.png`.

**İyi olan.**
- Her yol babanın bir öğretmene söyleyeceği cümle: "Ö6 Cumartesi 1–2, 5–6 ve 11–12.
  saatlere de gelebilirse hafta kuruluyor."
- Arama sürerken hangi yolun arandığı satır satır yazıyor, bulunan yol yerine oturuyor.
- Panel sınıfların saatlerine dokunulmadığını baştan söylüyor.

**Kötü olan.**
- **KS10 · Bazı yollar tek bir cümlede yedi koşul.** Dördüncü yol yedi değişikliği
  virgülle tek cümlede sayıyor ve iki satırı dolduruyor. Okuyup öğretmenlere
  bölüştürmek zor.
- **KS11 · "Cumartesi 11 saat girebilirse" ile "Cumartesi 11. saate gelebilirse" yan
  yana.** Biri günlük sınırı (11 saat), öteki bir ders saatini (11.) anlatıyor ve aynı
  panelde, aynı sayıyla, bir nokta farkıyla duruyorlar.
- Durdurulmuş bir aramanın bulduğu ilk ve inceltilmemiş yol listede sıradan bir yol gibi
  kalıyor. Bir denemede üçüncü yol altmışa yakın öğretmen saati istiyordu ve sekiz
  satır sürüyordu, "(daha iyisi aranıyor)" işareti durdurunca kalkmıştı
  (`scratch/denetim/program/oneri-dev-cumle-1920.png`). DK5 ile aynı aile: durdurmak
  aramanın sonucunu değil yarısını gösteriyor.
- **KS12 · Panel ızgaranın yarısını alıyor.** 1920'de altı yolla panel 490 px, ızgarada
  dokuz öğretmen görünüyor. Sorular açılınca beş. LAYOUT panelin diyalog olmamasını
  "okuyan öneriyi ızgaraya bakarak okur" diye gerekçelendiriyor, ama ızgaranın büyük
  kısmı panelin altında.

**Kusur.** Yok.

**Şöyle olsa daha iyi.**
- **Ö15.** Birden çok koşullu bir yol öğretmen başına bir satır olarak yazılsın, cümle
  yerine liste (denetçinin önerisi, KS10).
- **Ö16.** Günlük sınırın cümlesi "Cumartesi günde 11 saate kadar girebilirse" olsun
  (denetçinin önerisi, KS11).
- **Ö17.** Panel yol listesini daraltabilsin ya da ızgaranın yanına (sağa) alınabilsin
  (denetçinin önerisi).

### P14 · Cevap defteri (2026-09-26)

**Ne ve nerede.** Bir yolun `Sorular` düğmesi: öğretmen öğretmen soru, `Olur` ve `Olmaz ▾`,
`Soruları kopyala`, `Soruları yazdır`.

**Nasıl denendi.** Fikstür, ilk yol. Sorular açıldı, Olmaz menüsü açıldı, Olur seçildi,
yeniden arama beklendi, "Programı yerleştir" denendi, Ctrl+Z. Görüntüler:
`scratch/denetim/program/cevap-defteri-1920.png`, `scratch/denetim/program/olmaz-menu-1920.png`,
`scratch/denetim/program/olur-arama-bitti-1920.png`, `scratch/denetim/program/uygulandi-1920.png`.

**İyi olan.**
- Soru öğretmene sorulacak cümlenin kendisi ("Cumartesi 1–2, 5–6 ve 11–12. saatlere
  gelebilir misiniz?").
- Olmaz menüsü gerçek cevapları sayıyor: yalnız bu saatler, o gün hiç, o gün en fazla
  1 ile 5 saat, bu öğretmene hiç dokunma.
- Olur'dan sonra yeniden arama 2,5 s sürdü ve panel "Olur dedikleriniz yetiyor: hafta
  kuruluyor" dedi. Cevap "Cevaplarınız:" satırında ✓ ile ve × ile geri alınabilir
  duruyor.
- "Programı yerleştir" 348 yerleşimle çipi "Sorun yok"a çevirdi. Ctrl+Z yerleşimi,
  müsaitliği ve cevapları birlikte geri getirdi.

**Kötü olan.**
- `Olur` ve `Olmaz` düğmelerinin erişilebilir adı soruyu taşıyor ama öğretmeni
  taşımıyor ("Olur: Cumartesi 1–2, … gelebilir misiniz?"). Birden çok öğretmenli bir
  yolda ekran okuyucu hangi öğretmenin sorusu olduğunu söylemiyor.
- Geri almadan sonra panel kapanıyor, yeniden görmek için Otomatik diz'e yeniden
  basmak gerekiyor.

`Soruları kopyala` panoya yolun cümlesini ve öğretmen başına soruyu koyuyor, ve "Sorular
panoya kopyalandı." diye bildiriyor. `Soruları yazdır` kendi kâğıdını basıyor: başlık
"Öğretmenlere sorulacaklar", yolun cümlesi, öğretmen başına bir satır ve Olur, Olmaz
kutucukları (`scratch/denetim/program/sorular-yazdir-1.png`, Chromium'un PDF'i).

**Kusur.** Yok (geri almadan sonra kalan mesaj DK4'te).

**Şöyle olsa daha iyi.** Yok.

### P15 · Önizleme (2026-09-26)

**Ne ve nerede.** `Izgarada göster`: ızgara yolun uygulanmış haftasını çizer, üstte
`Şu anki | Önerilen`, lejant, `Uygula`, `Önizlemeyi kapat`, Esc kapatır.

**Nasıl denendi.** Fikstür, ilk yol, 1920. Önizleme açıldı, bir kart sürüklenmeye
çalışıldı, Esc'ye basıldı. Görüntüler: `scratch/denetim/program/onizleme-1920.png`,
`scratch/denetim/program/cevap-defteri-1920.png`.

**İyi olan.** Açılan saatteki dersler kalın çerçeveli, yeri değişenler kesik çizgili,
değişmeyenler soluk. Görünüm ilk açılan saate (Cumartesi) kayıyor. Lejant iki sayıyı
veriyor ("6 öğretmen saati açılıyor", "155 ders yer değiştiriyor").

**Kötü olan.**
- **KS13 · Esc önizlemeyi kapatıyor ama ızgarayı önizlemenin kaydırdığı yerde
  bırakıyor.** Kapatınca ızgara Cumartesi'de kalıyor, kullanıcı haftanın başına kendisi
  dönüyor.
- Önizlemede sürükleme kapalı, ama bunu söylemiyor: fareyle bir kart çekilince yalnız
  satır başındaki yazı seçiliyor ("Ö1" mavi seçili kaldı).
- "155 ders yer değiştiriyor" en küçük değişikliği arayan bir yolun yanında ürkütücü
  bir sayı. LAYOUT bunu bilerek gösteriyor (kullanıcının kararı 2026-09-25).

**Kusur.** Yok (köşe hücresi DK3).

**Şöyle olsa daha iyi.** **Ö18.** Önizleme kapanınca ızgara açılmadan önceki kaydırma
yerine dönsün (denetçinin önerisi).

### P16 · Alternatif programlar (2026-09-26)

**Ne ve nerede.** Program şeridi, adı açık programın adı olan menü: programlar, Kopyasını
kaydet, Boş program oluştur, Yeniden adlandır, Programı sil.

**Nasıl denendi.** Fikstür, 1920. Kopyasını kaydet açıldı, ad boşaltılıp Enter, "Program
1" yazılıp Enter, "Cumartesisiz" yazılıp Enter. Görüntüler:
`scratch/denetim/program/alternatif-menu-1920.png`, `scratch/denetim/program/alternatif-menu-iki-1920.png`.

**İyi olan.** Diyalog varsayılan bir ad öneriyor ("Program 2"), aynı ad reddediliyor ve
sebebi söyleniyor, yeni program açılıyor ve şeritteki düğme adını alıyor.

**Kötü olan.**
- Boş adla Enter sessizce hiçbir şey yapmıyor, diyalog açık kalıyor ve bir şey
  söylemiyor.
- Kopyaya geçmek geri al geçmişini siliyor (belgede yazılı, DATA.md). Az önce yapılan
  bir hamle "Kopyasını kaydet"ten sonra geri alınamıyor ve bunu kimse söylemiyor.
- Üst çubuktaki plan seçici ("1. plan") ile şeritteki program seçici ("Cumartesisiz")
  iki ayrı kavram, ikisi de "plan" ve "program" kelimeleriyle yan yana duruyor. Hangisinin
  ne olduğu ekrandan anlaşılmıyor (öneri, doğrulanmadı).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö19.** Boş ad "Bir ad yazın" diye söylensin ve Kaydet düğmesi o
arada kapalı olsun (denetçinin önerisi).

### P17 · Programı boşalt (2026-09-26)

**Ne ve nerede.** İşlemler menüsünün son, kırmızı kalemi.

**Nasıl denendi.** Fikstür, 1920. Boşalt seçildi, onaylandı, Ctrl+Z. Görüntü:
`scratch/denetim/program/bosalt-onay-1920.png`.

**İyi olan.** Onay cümlesi neyin kaybedileceğini sayıyor ve neyin kalacağını söylüyor
("Dizilmiş 334 saatin tamamı havuza dönecek … dersler, öğretmenler ve müsaitlikler
olduğu gibi kalır. Ctrl+Z ile geri alınabilir."). Ctrl+Z hepsini geri getirdi.

**Kötü olan.** Boşalttıktan sonra bildirim yok, gerekçe satırı eski mesajda kalıyor
(DK4 ile aynı aile).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### P18 · Varlık paneli ve ders düzenleyici (2026-09-26)

**Ne ve nerede.** Satır başından, kartın menüsünden (`Öğretmeni düzenle`, `Sınıfı
düzenle`, `Dersi düzenle`) ve paletten açılan sağ panel.

**Nasıl denendi.** Örnek okul ve fikstür, 1920. Öğretmen, sınıf ve derslik paneli ile ders
düzenleyici açıldı, alanlar okundu, Ad kutusu denendi (DK1). Görüntüler:
`scratch/denetim/program/satir-basi-panel-1920.png`, `scratch/denetim/program/panel-ogretmen-1920.png`,
`scratch/denetim/program/ders-duzenle-1920.png`.

**İyi olan.** Panel varlığı ızgaradan ayrılmadan düzenletiyor, haftalık programını küçük
bir tabloda ve dört sayıyı (yük, açık saat, yerleşmiş, kapalı) kartlarla gösteriyor.
Öğretmenin her dersinin yanında "Başka hocaya aktar…" var. Ders düzenleyici sınıf,
öğretmen, haftalık saat, dağılım, günde en fazla ve aynı gün olmasın'ı tek yerde
topluyor.

**Kötü olan.** Panelin haftalık tablosu salt okunur, kapalı saati değiştirmek için
"Müsaitlik sekmesine gidin" diyor ve oraya bir bağlantı vermiyor.

**Kusur.** DK1 (P1'de).

**Şöyle olsa daha iyi.** **Ö21.** Paneldeki "Müsaitlik" kelimesi o varlığın müsaitliğini
açan bir bağlantı olsun (denetçinin önerisi).

### P19 · Program'ın boş ekranı (2026-09-26)

**Ne ve nerede.** Hiç ders yokken Program sekmesi.

**Nasıl denendi.** Boş plan, 1920. Görüntü: `scratch/denetim/program/bos-ekran-1920.png`.

**İyi olan.** Ekran nereden başlanacağını sırayla söylüyor (Okul, Müsaitlik, Dersler) ve
dersin bir kez girilince havuzda bekleyeceğini haber veriyor.

**Kötü olan.**
- Sekme adları kalın ama tıklanmıyor. Yönlendiren bir ekranın en kısa yolu o adın
  kendisi.
- Durum çipi boş planda yeşil ("Henüz ders girilmedi"). Yeşil ekranın geri kalanında
  "sorun yok" demek.

**Kusur.** Yok. LAYOUT.md'nin "boş ekranlar dersler için Okul sekmesini gösteriyor"
cümlesi bayattı: Program, Kontrol ve Çıktı'nın üçü de artık dersler için Dersler'i
gösteriyor. Cümle bu turda düzeltildi.

**Şöyle olsa daha iyi.** **Ö22.** Boş ekrandaki sekme adları düğme olsun (denetçinin
önerisi). **Ö23.** Boş planda çip nötr bir renkte dursun (denetçinin önerisi).

### O1 · Başlarken ve örnek veri (2026-09-26)

**Ne ve nerede.** Okul sekmesinde hiç öğretmen ve sınıf yokken üstte duran panel: `Örnek
veriyle doldur`, `Bir daha gösterme`.

**Nasıl denendi.** Boş plan, 1920, açık, %100. Görüntüler: `scratch/denetim/okul/bos-ilk-acilis-1920-acik-100.png`,
`scratch/denetim/okul/ornek-onay-1920.png`.

**İyi olan.** Panel sırayı tek cümlede söylüyor (derslikler, branşlar, öğretmenler,
sınıflar, sonra dersler). Örnek verinin sorusu ne yükleneceğini sayıyor ("25 öğretmen,
20 sınıf, 8 derslik ve 99 ders") ve sonra nasıl temizleneceğini söylüyor.

**Kötü olan.** İlk açılışta Ayarlar sekmesinde okunmamış yenilikler noktası yanıyor. Yeni
bir kullanıcı için okunmamış bir sürüm geçmişi yok, nokta ilk gün dikkati yanlış yere
çağırıyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### O2 · Derslikler (2026-09-26)

**Ne ve nerede.** Okul → Derslikler: ad kutusu, `Ekle`, tablo, `Sil`.

**Nasıl denendi.** Boş plan. "A" iki kez, sonra "B" eklendi, üç sınıfa A verildi, A
silinmeye çalışıldı. Görüntüler: `scratch/denetim/okul/derslik-eklendi-1920.png`,
`scratch/denetim/okul/derslik-sil-onay-1920.png`.

**İyi olan.** Enter ekliyor. Silme sorusu kaybı adıyla sayıyor: "A dersliği silinecek. 3
sınıfın dersliği boşalacak (410, 411, 510) ve derslik çakışması artık kontrol
edilmeyecek."

**Kötü olan.**
- **KS16 · Aynı adla ikinci bir derslik sessizce ekleniyor.** "A" iki kez eklendi,
  sınıfın derslik listesinde "A, A, B" diye iki ayırt edilemez seçenek oldu. Öğretmen adı
  da tekrar edebiliyor (iki "Ahmet Yılmaz"). Program adında aynı ad reddediliyor ("Bu
  program adı zaten kullanılıyor"), yani kural ekrandan ekrana değişiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö29.** Aynı adlı derslik ve sınıf reddedilsin, aynı adlı öğretmen
bir soruyla eklensin ("Bu adla bir öğretmen var, yine de eklensin mi?") (denetçinin
önerisi).

### O3 · Branşlar (2026-09-26)

**Ne ve nerede.** Okul → Branşlar: ad kutusu, tablo, sağda `Hazır branşlar` ve `Hepsini ekle`.

**Nasıl denendi.** Boş plan. Bir hazır branş tek tek, sonra hepsi eklendi. Kullanılan bir
branş silinmeye çalışıldı. Görüntüler: `scratch/denetim/okul/branslar-bos-1920.png`,
`scratch/denetim/okul/branslar-eklendi-1920.png`.

**İyi olan.** Hazır listede her branşın kısaltması yanında, `Hepsini ekle` sorusuz ve
anında. Kullanılan branş silinemiyor ve mesaj kimin kullandığını söylüyor.

**Kötü olan.** Mesaj öğretmeni kısaltmasıyla anıyor ("1 öğretmen bu branşta (AY)"). Aynı
kısaltmalı üç öğretmen varken (O4) hangisi olduğu okunmuyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Mesaj öğretmenin adını da yazsın (denetçinin önerisi).

### O4 · Öğretmenler (2026-09-26)

**Ne ve nerede.** Okul → Öğretmenler: Ad Soyad, Kısaltma, Branş, `+ İkinci branş`,
Cinsiyet, `Ekle`, tablo ve satır içi sınırlar.

**Nasıl denendi.** Boş plan. Branşsız Enter, sonra "Ahmet Yılmaz" (Matematik), "Ayşe
Yıldız" (Fizik) ve yine "Ahmet Yılmaz" (Kimya) eklendi. Görüntü:
`scratch/denetim/okul/ogretmen-enter-sonra-1920.png`.

**İyi olan.** Kısaltma boş bırakılınca addan üretiliyor. Aynı kısaltma birden çok
öğretmende olunca tablonun üstünde sarı bir kutu hangileri olduğunu yazıyor. Sağdaki
Özet her öğretmenin açık saatini ve yükünü "Uygun" çipiyle veriyor.

**Kötü olan.**
- **KS17 · Program kısaltmayı kendisi çakıştırıyor.** "Ahmet Yılmaz" ve "Ayşe Yıldız"
  ikisi de "AY" aldı, üçüncüsü de. Uyarıyı çıkaran çakışmayı programın kendi ürettiği
  kısaltma yaratıyor. Türkçe adlarda baş harflerin çakışması sık (öneri, doğrulanmadı).
- Branş seçilmeden Enter'a basmak hiçbir şey söylemiyor. `Ekle` kapalı, ama neden kapalı
  olduğu yazmıyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö30.** Üretilen kısaltma çakışıyorsa bir harf daha alsın ("AYı",
"AYl") ya da çakıştığını formda, eklemeden önce söylesin (denetçinin önerisi).

### O5 · Sınıflar (2026-09-26)

**Ne ve nerede.** Okul → Sınıflar: ad, derslik, `Ekle`, tablo, günde aynı dersten en fazla.

**Nasıl denendi.** Boş plan, üç sınıf eklendi. Görüntü: `scratch/denetim/okul/siniflar-1920.png`.

**İyi olan.** Ad ve derslik tek satırda, Enter ekliyor.

**Kötü olan.** Derslik listesinde aynı adlı iki derslik ayırt edilemiyor (KS16).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### O6 · Listelerde ara, sırala, süz (2026-09-26)

**Ne ve nerede.** Her listenin başında `Ara…`, `Sırala` ve branş, cinsiyet çipleri.

**Nasıl denendi.** Örnek okul, Öğretmenler. "sibel", "SIBEL", "SİBEL", "ilknur", "ILKNUR",
"celik" ve "çelik" arandı, Ada göre sıralandı, Matematik çipiyle süzüldü. Görüntüler:
`scratch/denetim/okul/ara-SIBEL-1920.png`, `scratch/denetim/okul/ogretmen-ada-gore-1920.png`,
`scratch/denetim/okul/ogretmen-suz-1920.png`.

**İyi olan.** Arama çok hoşgörülü: I, İ, ı ve i ile Türkçe harflerin şapkasız hâlleri aynı
sayılıyor, yedi yazımın yedisi de doğru kişiyi buldu. Ada göre sıra Türk alfabesinde
(Ahmet, Ali, Aylin, Ayşe…). Çipler kaç kişi olduğunu taşıyor.

**Kötü olan.** Sıra "Girildiği sıra" dışında bir şeyken tutamaklar kayboluyor ve elle
sıralama yapılamıyor. Bu doğru, ama ekran nedenini söylemiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### O7 · Elle sıralama (2026-09-26)

**Ne ve nerede.** Satır başındaki tutamak: fareyle sürüklenir, klavyede ↑ ↓ Home End.

**Nasıl denendi.** Örnek okul, Öğretmenler. İlk satırın tutamağı odaklanıp ↓'e basıldı,
sonra Ctrl+Z. Görüntü: `scratch/denetim/okul/ogretmen-yapistir-onizle-1920.png` (listenin
üstündeki cümle).

**İyi olan.** Tutamağın erişilebilir adı ne yapılacağını söylüyor ("1. sıra, taşımak için
yukarı ve aşağı ok"). Taşıma bir cümleyle bildiriliyor ("Mehmet Çelik 2. sıraya taşındı.").
Ctrl+Z geri alıyor.

**Kötü olan.** Geri alındıktan sonra da "Mehmet Çelik 2. sıraya taşındı." cümlesi listenin
üstünde duruyor, satır ise 1. sırada. DK4 ile aynı aile: bir hamlenin cümlesi hamle geri
alınınca silinmiyor.

**Kusur.** Yok (aile DK4'te).

**Şöyle olsa daha iyi.** Yok.

### O8 · Renk seçici (2026-09-26)

**Ne ve nerede.** Satır başındaki renk düğmesi, 36 rengin 6×6 durduğu yerel bir
`<dialog>`.

**Nasıl denendi.** Örnek okul, Öğretmenler, ilk satır. Açıldı, oklar ve Tab denendi, Esc.
Görüntü: `scratch/denetim/okul/renk-secici-1920.png`.

**İyi olan.** Kutucuklar 47 px, rahat bir hedef. Seçili renk çerçeveli. Alt yazı rengin ne
işe yaradığını söylüyor.

**Kötü olan.** Oklar kutucuklar arasında dolaşmıyor, 36 kutucuk tek tek Tab'la geçiliyor.
Kutucukların adı "Renk 1" ile "Renk 36", yani rengi söylemiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö31.** Izgara oklarla gezilsin ve kutucuklar "açık mor", "koyu
yeşil" gibi bir adla okunsun (denetçinin önerisi).

### O9 · Özet (2026-09-26)

**Ne ve nerede.** Okul'un sağ sütunu: her liste için yük tablosu ve branş sayıları.

**Nasıl denendi.** Boş plan ve örnek okul. Görüntü: `scratch/denetim/okul/ogretmen-yapistir-onizle-1920.png`.

**İyi olan.** Öğretmen yükü tablosu açık saati ve yükü yan yana veriyor, durumu bir çiple
("Uygun") söylüyor, ve sorunlu satırlar üstte (LAYOUT).

**Kötü olan.** Sağ sütun dar, adlar iki satıra kırılıyor ("Ahmet / Sarı"), tablo uzun.
`Öğretmen renklerini yeniden dağıt` düğmesi bu denemede görünmedi, hangi koşulda çıktığı
denenmedi.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### O10 · Excel'den yapıştır (Okul) (2026-09-26)

**Ne ve nerede.** Derslikler, Öğretmenler ve Sınıflar'ın `Excel'den yapıştır` kutusu, `Önizle`,
sonra "N satırı ekle". Branşlar'da yok.

**Nasıl denendi.** Örnek okul, Öğretmenler. Üç satır yapıştırıldı: branşı ikinci sütunda
yazım hatalı ("Matemtik"), branşı ikinci sütunda doğru, ve var olan bir öğretmenin adı.
Önizlendi, eklenmedi. Görüntü: `scratch/denetim/okul/ogretmen-yapistir-onizle-1920.png`.

**İyi olan.** Beklenen sütun sırası kutunun üstünde yazıyor ("Ad Soyad · Kısaltma · Branş
· Cinsiyet · İkinci branş"). Branşı boş kalan satırlar sarı bir kutuda adıyla sayılıyor.

**Kötü olan.**
- **KS18 · Önizleme alanların adını söylemiyor.** İkinci sütuna yazılan branş kısaltma
  okundu ve önizleme bunu "Hasan Hüseyin Kılıç (Matemtik) ·" diye gösterdi. Parantezin
  kısaltma, noktanın ardının branş olduğu bilinmiyorsa sütun kaymış bir yapıştırma
  fark edilmiyor. Sekiz harflik "Matemtik" kısaltma olarak kabul edildi.
- Var olan bir öğretmenin adı ("Mehmet Çelik") ikinci bir öğretmen olarak eklenecekler
  arasında, uyarısız.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö32.** Önizleme bir tablo olsun, sütun başlıklarıyla (Ad,
Kısaltma, Branş), ve listede zaten olan adlar işaretlensin (denetçinin önerisi).

### M1 · Müsaitlik: kim, açık olan, varlık listesi (2026-09-26)

**Ne ve nerede.** Müsaitlik şeridi `Kim` (Öğretmen, Sınıf, Derslik) ve `Açık olan`. Sağda
`Kimin saatleri` listesi, her satırda açık saat ve yük ("53/23").

**Nasıl denendi.** Örnek okul dizili, 1920, açık, %100. Görüntü: `scratch/denetim/musaitlik/boyandi-1920.png`.

**İyi olan.** Başlık kimin saatlerine bakıldığını tam adıyla söylüyor ("Mehmet Çelik (MÇ) ·
müsait olmayan saatler"), altında ne yapılacağı tek cümle ("gelemeyeceği saatlere
tıklayın"). Liste her öğretmenin açık saatini ve yükünü veriyor.

**Kötü olan.** Listedeki "53/23" iki sayının ne olduğunu söylemiyor, anlamı ancak
altındaki cümle seçili öğretmen için yazıyor ("53 saat açık, 23 saat ders yüklenmiş").

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Listenin başında bir kez "açık / yük" yazsın (denetçinin önerisi).

### M2 · Hücre tıklama ve boyayarak sürükleme (2026-09-26)

**Ne ve nerede.** Izgarada bir hücreye tıklamak onu kapatır ya da açar, basılı tutup
sürüklemek geçtiği hücreleri boyar. LAYOUT'ta sürükleme yazılı değil.

**Nasıl denendi.** Örnek okul dizili, MÇ. Çarşamba 1 tıklandı, Perşembe 1 ile 6 arası
sürüklendi, sonra tablonun içinde klavye odağı arandı. Görüntüler:
`scratch/denetim/musaitlik/boyandi-1920.png`.

**İyi olan.** Hücreler 117×50 px, bu uygulamanın en rahat hedefleri. Kapalı saat büyük
kırmızı bir çarpı ve tarama. Dizili bir dersin saatini kapatınca ders silinmiyor, sağda
sarı bir kutu kaç ders olduğunu söylüyor ve çip "2 ders kapalı saatte" oluyor.

**Kötü olan.**
- **KS19 · Müsaitlik klavyeyle girilemiyor.** Tablonun içinde odaklanabilir tek bir öğe
  yok: hücreler düz `<td>`, gün ve saat başlıkları yalnız `title` taşıyor. Tab tablonun
  üstünden sağdaki listeye atlıyor. Fare kullanamayan biri kimsenin müsaitliğini
  giremiyor. DESIGN'ın erişilebilirlik tabanı ve PRINCIPLES "Kullanılabilirlik" ile
  çelişiyor.
- Boyayarak sürükleme hiçbir yerde anlatılmıyor, altındaki cümle yalnız "tıklayın" diyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö33.** Hücreler bir ARIA ızgarası olsun: oklarla gezilsin, Space
kapatıp açsın, başlıklar düğme olsun. Cümle "tıklayın ya da sürükleyin" desin
(denetçinin önerisi).

### M3 · Başlıklar ve Tümünü aç, Tümünü kapat (2026-09-26)

**Ne ve nerede.** Saat başlığına tıklamak o saati bütün hafta, gün başlığına tıklamak o
günü bütünüyle değiştirir. Sağ rayda `Tümünü aç` ve `Tümünü kapat`. Üçü de LAYOUT'ta yok.

**Nasıl denendi.** Örnek okul dizili, MÇ. 9. saatin başlığı ve Cuma'nın başlığı tıklandı,
Tümünü kapat seçildi, Ctrl+Z. Saatler açıkken başlık yakından görüntülendi. Görüntüler:
`scratch/denetim/musaitlik/tumunu-kapat-1920.png`, `scratch/denetim/musaitlik/saatler-acik-baslik.png`,
`scratch/denetim/musaitlik/baslik-6-yakin-x3.png`.

**İyi olan.** Başlıklar bir tıkla bir sütunu ya da satırı çeviriyor. Tümünü kapat 23 dizili
dersi kapalı saatte bıraktı ve uyarı bunu sayıp dizilemeyeceğini söyledi ("23 saat
fazla, bu program dizilemez"). Ctrl+Z hepsini geri getirdi.

**Kötü olan.**
- Tümünü kapat 72 hücreyi ve 23 dersi sorusuz etkiliyor. Geri alınabiliyor, ama sağ
  rayda, listenin altında duran bir düğme için büyük bir etki.
- `Tümünü aç` ve `Tümünü kapat` varlık listesinin altında duruyor, etkiledikleri tablonun
  yanında değil. "Tümünü aç" listedeki herkesi açacakmış gibi de okunabilir.

**Kusur.**
- **DK6 · Öğle arasından sonraki saatin başlığı saatsiz ve kaymış.** Şiddet: görsel.
  Adımlar: örnek okul (öğle arası hafta içi 5., hafta sonu 6. dersten sonra),
  Müsaitlik, şeritte Saatler açık. Beklenen: 6. sütunun da başlangıç saati yazar,
  numarası ötekilerle aynı hizadadır. Olan: "6"nın altında saat yok ve numara
  ötekilerden yaklaşık 7 px aşağıda. Sebep DOM'da görünüyor: o sütunun saat kutusu
  boş, çünkü 6. dersin başlangıcı günden güne değişiyor. Program ızgarası ve kâğıt bu
  durumda saati günlere göre yazıyor (LAYOUT, Çıktı). Görüntüler:
  `scratch/denetim/musaitlik/saatler-acik-baslik.png`, `scratch/denetim/musaitlik/baslik-6-yakin-x3.png`.

**Şöyle olsa daha iyi.** **Ö34.** Tümünü kapat bir onayla sorsun ve iki düğme tablonun
başlığına taşınsın ("Bu haftanın tamamı: aç, kapat") (denetçinin önerisi).

### M4 · Kapasite uyarısı (2026-09-26)

**Ne ve nerede.** Sağ rayın altındaki cümle ve sarı kutu.

**Nasıl denendi.** M2 ve M3 ile birlikte.

**İyi olan.** Cümle hesabı açık yapıyor: "MÇ: 0 saat açık, 23 saat ders yüklenmiş. 23 saat
fazla, bu program dizilemez." Kapalı saatte kalan dersler için ne olduğunu ve nerede
görüleceğini söylüyor ("Hiçbiri silinmedi. Program sekmesinde kırmızı çerçeveyle,
Kontrol sekmesinde tek tek listeleniyor.").

**Kötü olan.** Uyarı sağ rayın en altında, uzun listenin altında. 1080 yüksekliğinde
görünüyor, daha kısa bir kutuda ya da %150'de listeyle birlikte kayabilir (denenmedi).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### M5 · Haftanın darlığı ve Saatler (2026-09-26)

**Ne ve nerede.** Şeridin sağında `Göster`: Haftanın darlığı (ısı tablosu) ve Saatler
(başlıktaki başlangıç saati).

**Nasıl denendi.** Örnek okul dizili. İsı tablosunun hücre renkleri okundu, Saatler açılıp
kapatıldı.

**İyi olan.** Isı tablosu her saatte kaç öğretmenin kapalı olduğunu sayıyla yazıyor, ve
açıklaması ne işe yaradığını söylüyor ("dizerken genellikle orada tıkanılır"). Saatler
kapanınca tablonun boyu değişmiyor.

**Kötü olan.** **KS20 · Isı tablosunun renk farkı zor görülüyor.** 6 kapalı öğretmenle 9
kapalı öğretmen arasındaki fark gri bir zeminin saydamlığında 0,27 ile 0,34, yani
açıklamanın dediği "koyu bir sütun" gözle zor seçiliyor. Sayılar okunuyor, renk
okunmuyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö35.** Isı tablosu en düşükten en yükseğe açıkça ayrılan bir
renk basamağı kullansın ve en dar üç saat ayrıca işaretlensin (denetçinin önerisi, ölçüm
KS20).

### K1 · Kontrol: hüküm ve Programın durumu (2026-09-26)

**Ne ve nerede.** Kontrol sekmesinin üstündeki hüküm kutusu ve dört satırlık "Programın
durumu", şeridin sağında `Durum` (engel ve uyarı sayısı).

**Nasıl denendi.** Örnek okul dizili, MÇ'nin dokuz dizili saati Müsaitlik'te kapatılmış,
1920. Görüntü: `scratch/denetim/kontrol/sorunlar-1920.png`.

**İyi olan.** "Programın durumu" dört sayıyla haftayı özetliyor (yerleşmiş saat,
tamamlanan ders, doluluk, boş sınıf saati).

**Kötü olan.** Kartlar ekranın sol yarısında, sağ yarı boş. Uzun listeler (K2) bu yüzden
küçük bir kutuda kayıyor.

**Kusur.**
- **DK7 · Hüküm kutusu ve şeridin Durum'u kapalı saatteki dersleri görmüyor.** Şiddet:
  yanlış sonuç (ekran bir sorunu hem gösteriyor hem yok sayıyor). Adımlar: örnek okulu
  diz, Müsaitlik'te MÇ'nin dizili saatlerinden birkaçını kapat, Kontrol. Beklenen:
  hüküm bir sorun olduğunu söyler, şerit bunu sayar. Olan: hüküm "Sorun görünmüyor.
  … Program dizilebilir.", şerit "0 engel, 0 uyarı" (ikisi yeşil), aynı anda şeritte
  "Sorunlar (9)", altta "Kapalı saatte ders (9)" ve üst çubukta kırmızı "9 ders kapalı
  saatte". Hükmün cümlesi kapasiteyi anlatıyor, ama başlığı "Sorun görünmüyor".
  Görüntü: `scratch/denetim/kontrol/sorunlar-1920.png`.
  **Düzeldi (2026-09-27, ed0e158).**

**Şöyle olsa daha iyi.** **Ö36.** Hüküm kutusu bütün sorunları saysın ve kapasiteyle
yerleşimi iki ayrı cümlede söylesin ("Kapasite yetiyor. 9 ders kapalı bir saatte
duruyor.") (denetçinin önerisi).

### K2 · Sorunlar, Danışman ve kapasite tabloları (2026-09-26)

**Ne ve nerede.** Şeridin `Göster` grubu: Sorunlar (N), Danışman (N), Öğretmenler, Sınıflar,
Derslikler.

**Nasıl denendi.** Aynı durum. Beş bölüm sırayla açıldı. Görüntüler:
`scratch/denetim/kontrol/danisman-1920.png`, `scratch/denetim/kontrol/ogretmenler-1920.png`,
`scratch/denetim/kontrol/siniflar-1920.png`, `scratch/denetim/kontrol/derslikler-1920.png`.

**İyi olan.** Her bölümün başında ne ölçtüğünü söyleyen bir cümle var ("Aynı dersliği
paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz
burasıdır."). Kapasite tabloları açık, yük ve durumu yan yana veriyor.

**Kötü olan.**
- **KS21 · Kapalı saatteki dersin satırı hangi ders olduğunu söylemiyor.** "MÇ Perşembe
  2 saatinde müsait değil" satırı sınıfı ve dersi yazmıyor ve ızgaradaki kartı açan bir
  bağlantı yok. Dokuz satırın dokuzu aynı biçimde.
- **KS22 · Danışman örnek okulda 43 not veriyor ve hepsi aynı cümle.** "412 · MB Kimya
  haftada 8 kez konacak ama yalnızca 6 gün var; en az bir günde iki kez görülecek."
  biçiminde. Liste sekiz satırlık bir kutuda kayıyor, ekranın sağ yarısı boş.
  Bir örnek okulun kendi verisinde 43 uyarı çıkması uyarının değerini düşürüyor.

**Kusur.** DK7 (K1'de).

**Şöyle olsa daha iyi.**
- **Ö37.** Kapalı saatteki ders satırı "MÇ · 310 Matematik, Perşembe 2. saat" desin ve
  tıklanınca Program'da o karta gitsin (denetçinin önerisi).
- **Ö38.** Aynı türden Danışman notları tek satırda toplansın ("11 ders haftada 6'dan çok
  kez: en az bir gün iki kez görülecek") ve açılınca liste çıksın (denetçinin önerisi).

### K3 · Kontrol'ün boş ekranı ve çiple tutarlılık (2026-09-26)

**Ne ve nerede.** Hiç ders yokken Kontrol, ve üst çubuktaki durum çipi.

**Nasıl denendi.** Boş plan ve yukarıdaki durum. Görüntü: `scratch/denetim/kontrol/bos-ekran-1920.png`.

**İyi olan.** Boş ekran nereden başlanacağını söylüyor ve sayfanın ne işe yaradığını
anlatıyor ("programın dizilip dizilemeyeceğini önceden söyler").

**Kötü olan.** Çip ile hüküm kutusu aynı durumda farklı şeyler söylüyor (DK7).

**Kusur.** DK7 (K1'de).

**Şöyle olsa daha iyi.** Yok.

### K4 · Kontrol'ün baskı seçeneği (2026-09-26)

**Ne ve nerede.** Yok. Kontrol'ün raporu basılamıyor, program yalnız Çıktı'dan ve cevap
defterinden basıyor.

**Nasıl denendi.** Kaynak ve ekran okundu, Kontrol'de yazdırma düğmesi yok.

**İyi olan.** Yok.

**Kötü olan.** Babanın bir sorunu bir öğretmenle konuşurken elinde tutabileceği bir kâğıt
yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö39.** Kontrol'ün sorunları ve Danışman notları bir kâğıda
basılabilsin, cevap defterinin kendi kâğıdı gibi (denetçinin önerisi, aSc'nin "Planlama
Öncesi/Sonrası Kontrol" penceresi, `docs/asc/ekran-envanteri.md`, basılıp basılmadığı
okunmadı).

### C1 · Çıktı: içerik, renk, sayfa seçimi (2026-09-26)

**Ne ve nerede.** Çıktı şeridi `İçerik` (Öğretmenler, Sınıflar, İkisi de) ve `Renkli bas`.
Sağda `Yazdır (N kâğıt)`, sınıf ve öğretmen onay listeleri, `Tümü` ve `Hiçbiri`.

**Nasıl denendi.** Örnek okul dizili, 1920. İçerik ve renk değiştirildi, Hiçbiri ve Tümü
seçildi. Görüntüler: `scratch/denetim/cikti/ilk-1920.png`, `scratch/denetim/cikti/hicbiri-1920.png`.

**İyi olan.**
- Önizleme kâğıdın kendisi ve kâğıt sayısı düğmede yazıyor ("Yazdır (20 kâğıt)").
  Hiçbiri seçilince düğme "Yazdır (0 kâğıt)" olup kapanıyor.
- Yazdırma penceresinde arka plan grafiklerinin açılması gerektiği düğmenin üstünde
  yazıyor.
- Başlık iki satır ve ortalı, sınıf sayfasında hücre dersi ve öğretmeni gösteriyor.

**Kötü olan.**
- Onay kutuları tarayıcının kendi kutusu, 13×13 px. Etiketler tıklanabiliyor, ama
  kutunun kendisi babanın gözü için küçük.
- Önizleme kaydırılınca şerit kendiliğinden çekiliyor (Ayarlar → Görünüm'deki ayar).
  Çıktı'da içerik ve renk şeritte olduğu için kâğıtlara bakarken seçeneği değiştirmek
  için başa dönmek gerekiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### C2 · Sayfa düzeni ve sayfada ne olsun (2026-09-26)

**Ne ve nerede.** `Bir kâğıda kaç program` (1, 2, 4), `Kâğıttaki yazı` (Küçük, Normal, Büyük),
`Sayfada ne olsun` (beş onay kutusu).

**Nasıl denendi.** Örnek okul dizili, sınıflar. 1, 2 ve 4 seçildi, her birinde düğmenin
kâğıt sayısı okundu. Görüntü: `scratch/denetim/cikti/dort-kagit-1920.png`.

**İyi olan.** Her seçim ne olacağını kâğıt sayısıyla söylüyor ("Bir A4'e bir program, duvara
asılan boy · 20 kâğıt"), seçenekler kısa açıklamalı ("Kurs adı · Başlığın altındaki satırda
okulun adı").

**Kötü olan.** "Ders saatleri · Sütun başlığında 08:30–09:10" açıklamasındaki örnek saat
okulun kendi saati değil (örnek okul 09:00'da başlıyor).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Açıklamadaki örnek saat okulun ilk dersinden türesin (denetçinin
önerisi).

### C3 · Kâğıdın kendisi (PDF) (2026-09-26)

**Ne ve nerede.** Tarayıcının yazdırması.

**Nasıl denendi.** Chromium'da `print` ortamı ve `page.pdf()` ile, sayfanın kendi boyutu
(`preferCSSPageSize`) ve arka plan grafikleri açık. Sınıflar 1, 2 ve 4 kâğıt başına,
öğretmenler renksiz. PDF'ler poppler ile resme çevrilip okundu. Görüntüler:
`scratch/denetim/cikti/siniflar-4-1.png`, `scratch/denetim/cikti/dort-yakin-1.png`,
`scratch/denetim/cikti/ogretmenler-renksiz-01.png`.

**İyi olan.**
- Kâğıt A4 yatay ve kâğıt sayısı düğmenin dediğiyle aynı: 20, 10, 5 sayfa, öğretmenler 25.
- Öğle arası günlere göre farklıyken 6. sütunun başlığı iki aralığı da yazıyor ("Sal–Cum
  13:30–14:10, Cmt–Pzr 13:10–13:50").
- Renksiz kâğıt okunaklı, iki saatlik blok birleşik bir hücre.

**Kötü olan.** Dört program kâğıt başına iken en küçük yazı kutusu 4,9 pt (yaklaşık
1,7 mm), yazıların yarısı 6,4 pt'nin altında. Duvara asılacak bir kâğıt için değil, bir
dosyaya konacak bir özet için uygun. Seçeneğin açıklaması bunu söylemiyor (ölçüm:
`pdftotext -bbox`).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** 4'ün açıklaması "küçük yazı, masada okunur" desin (denetçinin
önerisi, ölçüm).

### D1 · Dersler'in üç yöntemi (2026-09-26)

**Ne ve nerede.** Dersler şeridi, `Yöntem`: Öğretmenden, Sınıftan (varsayılan), Genel.
Sağda `Hangi sınıf` ya da `Hangi öğretmen` listesi, şeritte `Açık olan` ve `Toplam`.

**Nasıl denendi.** Örnek okul, 1920, açık, %100. Üç yöntem arasında geçildi.
Görüntüler: `scratch/denetim/dersler/sinifstan-1920.png`, `scratch/denetim/dersler/ogretmenden-1920.png`,
`scratch/denetim/dersler/genel-1920.png`.

**İyi olan.** Odaklı yöntemde form o ekseni sormuyor, sağdaki liste her sınıfın ders ve
saat toplamını gösteriyor ve seçileni vurguluyor. Şerit toplamı (99 ders, 433 saat) her
an söylüyor.

**Kötü olan.** Tablonun "Günde ↑" sütun başlığı ne anlattığını söylemiyor (günde en
fazla), ve boş hücrelerdeki soluk "2" okul genelinden gelen varsayılan, ama bu da
yazmıyor. Öğretmen sütunuyla saat sütunu arasında 1920'de yarım ekranlık boşluk var.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö24.** Sütun başlığı "Günde en fazla" olsun ve soluk değer
`title`'ında "okul geneli: 2" desin (denetçinin önerisi).

### D2 · Yeni ders formu ve Dağılım seçici (2026-09-26)

**Ne ve nerede.** `Yeni ders` paneli: branş süzgeci, öğretmen, haftalık saat, `Dağılım`,
`Ekle`.

**Nasıl denendi.** Örnek okul, Sınıftan, 310. KY seçildi, saat 5 ve 7 yazıldı, Dağılım
listesi açıldı, 2+2+2+1 seçilip eklendi. Tablodaki bir satırın saati 5'ten 3'e indirildi.
Görüntüler: `scratch/denetim/dersler/dagilim-acik-1920.png`, `scratch/denetim/dersler/dagilim-7-1920.png`,
`scratch/denetim/dersler/eklendi-1920.png`.

**İyi olan.**
- Dağılım listesi saatten türüyor, günlük sınırı çiğneyen seçenekleri kilit simgesi ve
  sebebiyle gösteriyor, seçilemiyorlar.
- Eklenince satır tabloya düşüyor, başlıktaki sayı ("310 dersleri · 7 ders · 36 saat")
  ve sağdaki liste güncelleniyor.

**Kötü olan.**
- **KS14 · Dağılım iki yazımı karıştırıyor.** Aynı listede "3+2+1+1" ile "1×3 + 4×1" ve
  "2×2 + 3×1" yan yana. Dört tek saat "1+1+1+1", beş tek saat "5×1", üç tek saat
  "1+1+1" yazılıyor. "2×2 + 3×1" bir toplama işlemi gibi okunuyor (7 eder) ve
  "iki tane ikili, üç tane tekli" demek olduğu çıkarılmalı.
- Kilidin sebebi "3 saat > günde 2" diye bir eşitsizlik. Doğru, ama bir cümle değil.
- Eklendikten sonra form öğretmeni boşaltıyor, saati bırakıyor. Aynı öğretmenden bir
  sınıfa ikinci ders girilirken öğretmen yeniden seçiliyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.**
- **Ö25.** Dağılım tek bir yazımla ve kelimeyle gösterilsin: "3 + 2 + 1 + 1" ya da
  "bir 3'lü, dört tek" (denetçinin önerisi). aSc'nin karşılığı "Lessons/week" ve
  yanındaki liste ([LAYOUT.md](LAYOUT.md), Dersler), yazımı okunmadı.
- **Ö26.** Kilidin sebebi cümle olsun: "Günde en fazla 2 saat, 3'lü blok sığmaz"
  (denetçinin önerisi).

### D3 · Dersleri yapıştır (2026-09-26)

**Ne ve nerede.** `Excel'den yapıştır`: kutu, `Önizle`, sonra "N satırı ekle".

**Nasıl denendi.** Örnek okul, 310. Dört satır yapıştırıldı: geçerli bir satır ama blok
sütununda "2+1", bilinmeyen öğretmenli bir satır, bilinmeyen sınıflı bir satır ve bir
saçma satır. Önizlendi, eklendi. Görüntüler: `scratch/denetim/dersler/yapistir-onizle-1920.png`,
`scratch/denetim/dersler/yapistir-eklendi-1920.png`.

**İyi olan.** Hiçbir şey doğrudan eklenmiyor, önce önizleme var. Saçma satır önizlemede
"4. satır: sınıf veya öğretmen boş, atlandı" diye söyleniyor. Eklenemeyenler sonunda adıyla
sayılıyor ("311 / Yok Böyle", "999 / MÇ") ve ne yapılacağı yazıyor.

**Kötü olan.**
- **KS15 · Önizleme bilinmeyen sınıfı ve öğretmeni yakalamıyor.** Önizleme "3 satır
  okundu. Aşağıdakiler eklenecek" ve "3 satırı ekle" dedi, eklenen 1 oldu, ötekiler
  ancak eklemeden sonra bir uyarıda söylendi. Önizlemenin işi tam da bunu önceden
  göstermek.
- "2+1" yazılan blok sütunu sessizce "1+1+1" okundu. Önizleme bunu gösteriyor ama
  uyarmıyor. Sütunun beklediği biçim ("Blok (1 · 2 · 3)") tek bir sayı.
- Aynı sınıfa aynı öğretmenden ikinci bir ders (310 · KY iki kez) uyarısız eklendi.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö27.** Önizleme her satırı "eklenecek", "eklenmeyecek (sebep)"
diye iki listeye ayırsın ve düğme yalnız eklenecekleri saysın (denetçinin önerisi).

### D4 · Ders düzenleyici: taşıma ve aktarma (2026-09-26)

**Ne ve nerede.** Izgarada kartın menüsünden `Dersi düzenle`. Sınıf ya da öğretmen
değişince soru sorulur.

**Nasıl denendi.** Örnek okul dizili, 1920. 310 · KY dersinin sınıfı 410 seçildi, soru
okundu, vazgeçildi. Görüntüler: `scratch/denetim/program/ders-duzenle-1920.png`,
`scratch/denetim/dersler/sinif-tasi-onay-1920.png`.

**İyi olan.** Soru neyin kaybedileceğini sayıyor ("3 blok havuza döner") ve geri alma
yolunu söylüyor.

**Kötü olan.** Sayı sıfır olsa da yazılıyor: "0 sabitleme kalkar". Olmayan bir kaybı
söylemek dikkati asıl sayıdan dağıtıyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Sıfır olan kayıp cümleden düşsün (denetçinin önerisi).

### D5 · Aynı gün olmasın (2026-09-26)

**Ne ve nerede.** Ders düzenleyicide `Aynı gün olmasın` satırı: çipler ve sınıf sınıf
gruplanmış bir liste.

**Nasıl denendi.** Örnek okul dizili. 310 · KY'ye 310 · İA eklendi, sonra Kontrol açıldı.
Görüntüler: `scratch/denetim/dersler/ayni-gun-eklendi-1920.png`,
`scratch/denetim/kontrol/ornek-iliski-sonrasi-1920.png`.

**İyi olan.** Eklenen ilişki bir çip olarak duruyor ve × ile geri alınıyor. İkisi zaten
aynı gündeyse hiçbir şey taşınmıyor, Kontrol onu hemen "Kural dışı" diye gösteriyor
(DATA.md'deki kural).

**Kötü olan.** Liste bütün okulun derslerini sınıf sınıf veriyor, ve aynı sınıfın aynı
öğretmenden iki dersi iki kez aynı adla ("KY Türkçe") görünüyor. Yüz dersli bir okulda
bu liste uzun ve içinde arama yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö28.** Listenin başında o sınıfın dersleri dursun ve liste
yazarak süzülebilsin (denetçinin önerisi).

### A1 · Zil ve günler (2026-09-26)

**Ne ve nerede.** Ayarlar → Zil ve günler: okul adı, ders günleri ve her günün öğle arası,
günlük ders sayısı, ilk dersin başlangıcı (iki açılır liste), ders, teneffüs ve öğle arası
süreleri, `Ders adları` (LAYOUT'ta yok), sağda zil saatleri önizlemesi.

**Nasıl denendi.** Örnek okul, otomatik dizili, 1920. Pazar'ın işareti kaldırıldı ve geri
kondu, Pazar günü sabitlenip yeniden kaldırıldı, günlük ders sayısı 12'den 10'a indirildi.
Her adımda yerleşim ve sabitleme sayısı `localStorage`'dan okundu, Ctrl+Z ve üst çubuktaki
Geri al düğmesi ayrı ayrı denendi. Görüntüler: `scratch/denetim/ayarlar/zil-1920.png`,
`scratch/denetim/ayarlar/pazar-kapat-1920.png`, `scratch/denetim/program/pazar-geri-bos-1920.png`,
`scratch/denetim/ayarlar/ders-sayisi-10-1920.png`.

**İyi olan.** Zil önizlemesi öğle arası farklı günleri ayrı sütunlarda hesaplıyor ve
bitiş saatini veriyor. Başlangıç saati iki açılır liste, bir saat kutusunun AM, PM
tuzağı yok. Şerit haftayı özetliyor ("6 gün · 12 ders"), altta "6 gün × 12 saat = 72
slot".

**Kötü olan.** Önizlemenin iki sütunu dar ve saat aralıkları iki satıra kırılıyor
("09:00– / 09:40").

**Kusur.**
- **DK8 · Bir günü kaldırmak ya da günlük ders sayısını düşürmek dizili ve sabitli
  dersleri sorusuz siliyor, ve Ctrl+Z o anda çalışmıyor.** Şiddet: veri kaybı
  (koşullu: yalnız Geri al düğmesiyle ve aynı oturumda geri geliyor). Adımlar: örnek
  okulu diz, Program'da Pazar'ın başlığından "Günü sabitle", Ayarlar → Zil ve günler,
  Pazar'ın işaretini kaldır, Ctrl+Z. Beklenen: PRINCIPLES "Veri kaybı olmaz"a göre
  dersler yerinde kalır ve işaretlenir, ya da en azından bir soru neyin kaybedileceğini
  sayar, ve Ctrl+Z geri alır. Olan: soru ve bildirim yok, 433 yerleşimden 368'i kalıyor,
  65 sabitlemenin 65'i de kalkıyor, Ctrl+Z hiçbir şey yapmıyor. Pazar yeniden
  işaretlenince dersler dönmüyor, havuzda 57 blok bekliyor. Üst çubuktaki Geri al
  düğmesi hepsini geri getiriyor. Günlük ders sayısını 12'den 10'a indirmek aynısını
  yapıyor: 33 saat, 6'sı sabitli. Ctrl+Z'nin çalışmama sebebi kaynakta görülüyor:
  `isTextInput()` (`src/platform/useStore.ts`) etiketi INPUT olan her şeyi, onay kutusu
  ve sayı kutusu dahil, yazı kutusu sayıyor ve odak değiştirilen kutuda kalıyor. DATA.md
  "Sabitlenmiş bir blok yalnız sabitleme kaldırılınca iner … Bilinen tek istisna, bir
  dersi başka bir öğretmene ya da sınıfa aktarmak" diyor, bu iki yol o listede yok.
  Program, Müsaitlik'te kapanan bir saatteki dersi yerinde tutup işaretliyor (M2), gün
  ve ders sayısında aynı ilkeyi uygulamıyor.
  **Düzeldi (2026-09-27, dced6e4).**
- **DK9 · "Ders adları" kutusuna günlük ders sayısından az ad yazmak günü kısaltıyor ve
  dersleri siliyor.** Şiddet: veri kaybı (koşullu, DK8 gibi). Adımlar: örnek okulu diz,
  Ayarlar → Zil ve günler, "Ders adları (virgülle; boş bırakılırsa 1, 2, 3…)" kutusuna
  "Etüt, 1, 2, 3" yaz, Tab. Beklenen: ya yalnız ilk dört dersin adı değişir, ya da ad
  sayısının ders sayısını değiştireceği sorulur. Olan: gün 4 derse iniyor, 433
  yerleşimden 245'i ve 65 sabitlemeden 36'sı sorusuz kalkıyor, çip "70 ders sığmıyor ·
  245 saat havuzda" diyor. Aynı anda "Günlük ders sayısı" kutusu hâlâ 12 gösteriyor. Bu
  denemede odak kutudan çıktığı için Ctrl+Z geri aldı. Kutunun etiketi ad sayısının ders
  sayısını belirlediğini söylemiyor. Görüntü: `scratch/denetim/ayarlar/ders-adlari-dort-1920.png`.
  **Düzeldi (2026-09-27, b4c6079).**

**Şöyle olsa daha iyi.**
- **Ö40.** Dersi dizili bir günü ya da saati kaldırmadan önce bir soru kaybı saysın ("Pazar
  günü dizili 65 saat, 65'i sabitli, havuza dönecek"), ya da dersler kapalı saatteki
  dersler gibi yerinde kalıp işaretlensin (PRINCIPLES "Veri kaybı olmaz").
- **Ö41.** Ctrl+Z yalnız metin yazılan kutularda (text, search, textarea) susturulsun, onay
  kutusunda ve açılır listede çalışsın (denetçinin önerisi, DK8).

### A5 · Hakkında (2026-09-26)

**Ne ve nerede.** Ayarlar → Hakkında: sürüm, "Nasıl açıldı" (LAYOUT'ta yok), öneri aramasının
bu bilgisayardaki süresi, adres, güncelleme, Yenilikler, "Veriler nerede", örnek okul,
Sıfırla.

**Nasıl denendi.** `file://`, site ve exe'de açıldı, Sıfırla'nın iki sorusu okunup
vazgeçildi. Görüntüler: `scratch/denetim/ayarlar/hakkinda-1920.png`,
`scratch/denetim/ayarlar/sifirla-1-1920.png`, `scratch/denetim/ayarlar/sifirla-2-1920.png`,
`scratch/denetim/teslim/exe-guncelleme.png`.

**İyi olan.**
- "Nasıl açıldı" üç yolda da doğru: "Dosya (çift tıklanan .html)", "Site", "Uygulama
  (.exe)". Exe'de öneri aramasının kendi ölçümü satırda duruyor.
- "Veriler nerede" gerçek anahtarları, ne olduklarını ve boyutlarını veriyor ve verinin bu
  tarayıcıya ait olduğunu tek cümlede söylüyor.
- Sıfırla iki kez soruyor, ikincisi "Son kez soruyorum" ve kaydetmeyi hatırlatıyor.

**Kötü olan.**
- Düğme "Her şeyi sil", ilk sorunun başlığı "Her şey silinecek", ama gövde yalnız açık
  planın boşalacağını söylüyor ("Bu plan bomboş kalacak"). Öteki planlar kalıyor. Başlık
  olduğundan büyük bir kayıp söylüyor.
- "Veriler nerede" tablosu dar, anahtar adları üç satıra kırılıyor ("ders- / programi- /
  -yedek-0").

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Düğme ve başlık "Bu planı boşalt" desin (denetçinin önerisi).

### A2 · Kurallar (2026-09-26)

**Ne ve nerede.** Ayarlar → Kurallar: altı okul geneli kural (saat ve Kapalı, Uyar, Engelle),
kendi sınırı olan öğretmenler ve sınıflar, sağda canlı ihlal listesi, şeritte seviye
sayıları.

**Nasıl denendi.** Örnek okul dizili. "Öğretmen günde en fazla" 8'den 3'e indirildi, sağ
liste okundu, geri alındı. Görüntüler: `scratch/denetim/ayarlar/kurallar-1920.png`,
`scratch/denetim/ayarlar/kurallar-3-1920.png`.

**İyi olan.** Her kuralın altında ne anlattığı bir cümle, yanında "Şu an" sütununda kaç
yerde çiğnendiği ("68 yer"), sağda ihlaller cümle cümle. Seviye düğmesinin anlamı listenin
başında ("Uyar yalnız sayar, Engelle dersi o hücreye hiç bıraktırmaz"). Yalnız uyarabilen
kurallarda Engelle seçilemiyor.

**Kötü olan.** Sağ ihlal listesi dar ve her cümle dört satıra kırılıyor. "Kendi sınırı
olan öğretmenler" tablosunun sütunları "Günde ↑" ve "Günde ↓", ne olduklarını söylemiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Sütun başlıkları "Günde en fazla", "Günde en az" olsun (denetçinin
önerisi).

### A4 · Planlar ve yedek (2026-09-26)

**Ne ve nerede.** Ayarlar → Planlar ve yedek: plan tablosu (ad, taslak, içerik, yerleşmiş
saat, `Bu plana geç`, `Sil`), `Boş plan`, `Bu planın kopyası`, `Taslak olarak kaydet`,
`Nereye kaydedilsin` (klasör, X1'de), `Bütün planlar tek dosyada`, sağda oturum yedekleri.

**Nasıl denendi.** Örnek okul dizili. Kopya alındı, taslak kaydedildi, taslak silindi,
paket indirildi (`scratch/denetim/veri/paket.json`). Görüntüler:
`scratch/denetim/ayarlar/planlar-1920.png`, `scratch/denetim/ayarlar/planlar-uc-1920.png`,
`scratch/denetim/ayarlar/plan-sil-onay-1920.png`.

**İyi olan.**
- Tablo her planın içeriğini ve yerleşmiş saatini sayıyor, açık plan işaretli.
- Plan silme sorusu kaybı sayıyor ve geri alınamayacağını söylüyor ("25 öğretmen, 20
  sınıf, 99 ders ve yerleşmiş 0 saat silinecek. Bu işlem geri alınamaz.").
- Paket bir tık, dosya adı tarihli.

**Kötü olan.**
- **KS23 · "Taslak olarak kaydet" kullanıcıyı boş ızgaralı bir plana geçiriyor.** Düğme
  okul verisini ızgarasız bir taslak olarak kaydediyor ve hemen ona geçiyor. Ekranda
  program kayboluyor, çip "433 saat havuzda" diyor, üst çubukta plan adı değişiyor. Adı
  "kaydet" olan bir düğmenin kullanıcıyı başka bir yere götürmesi beklenmiyor, ve
  "taslak"ın burada "ızgarasız okul" demek olduğu hiçbir yerde yazmıyor.
- Üst çubuktaki plan seçici uzun adları kesiyor ("1. plan kopyas").
- Plan seçicideki "(taslak)" eki çevrilmiyor (keşifte bulundu, `src/ui/App.tsx`).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö42.** Düğme "Bu okuldan boş bir taslak çıkar" gibi ne yaptığını
söylesin ve taslağa geçmeden yerinde kalsın, taslak listede görünsün (denetçinin önerisi,
KS23).

### E5 · Dosyaya kaydet (2026-09-26)

**Ne ve nerede.** Üst çubuktaki birincil düğme.

**Nasıl denendi.** Örnek okul dizili, indirme yakalandı (`scratch/denetim/veri/tek-plan.json`).

**İyi olan.** Dosya adı tarih ve saat taşıyor ("ders-programi-2026-09-27-0007.json"), bildirim
nereye bakılacağını söylüyor ("Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.").

**Kötü olan.** Yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E6 · Dosyadan aç (2026-09-26)

**Ne ve nerede.** Üst çubuk, tek bir plan dosyası açar, paketi reddeder.

**Nasıl denendi.** Örnek okul dizili. Sırayla açıldı: JSON olmayan dosya, boş dosya,
`schemaVersion: 99` taşıyan bir plan, `teachers` ve `lessons` alanları silinmiş bir plan,
paket, ve v1, v7, v12, v15 örnekleri. Görüntüler: `scratch/denetim/dosya/ac-*-1920.png`,
`scratch/denetim/dosya/eksik-yuklendi-1920.png`, `scratch/denetim/dosya/eski-*-program-1920.png`.

**İyi olan.**
- JSON olmayan ve boş dosya reddediliyor ("Bu dosya okunamadı").
- Paket reddediliyor ve doğru yol gösteriliyor ("Ayarlar → Planlar ve yedek bölümündeki
  "Tümünü dosyadan aç" düğmesini kullanın").
- Dört eski şemanın dördü de açıldı, güncel şemaya geçti, içerik korundu.
- Her yüklemeden önce açık planın yerine geçeceği ve geri al geçmişinin sıfırlanacağı
  soruluyor.

**Kötü olan.** Onay sorusu dosyada ne olduğunu söylemiyor (kaç öğretmen, kaç ders), yalnız
açık planın gideceğini söylüyor. Boş bir plana dosya açarken de aynı uyarı çıkıyor
("Vazgeçme ihtimaliniz varsa önce Dosyaya kaydet deyin").

**Kusur.**
- **DK10 · Daha yeni bir sürümün tek plan dosyası "okunamadı" diye reddediliyor.**
  Şiddet: metin. Adımlar: `schemaVersion` alanı 99 olan bir plan dosyasını Dosyadan aç
  ile aç. Beklenen: "Bu dosya daha yeni bir sürümle yazılmış. Programı güncelleyin."
  Olan: "Bu dosya okunamadı. Program tarafından indirilmiş bir .json yedek dosyası
  seçin." Dosya zaten programın indirdiği bir dosya. "Daha yeni sürüm" dalı kaynakta
  var (`src/ui/App.tsx`) ama yalnız paket dosyasının sürümüne bakıyor. Senaryo: exe
  kendini güncelledi, baba aynı yedeği başka bir makinedeki eski kopyada açıyor ve
  dosyanın bozuk olduğunu sanıyor. `e2e/temel.spec.ts` bu cümleyi bekliyor.
  **Düzeldi (2026-09-27, 36cf42f).**
- **DK11 · Öğretmenleri ve dersleri olmayan bir dosya geçerli sayılıp planı boşaltıyor.**
  Şiddet: veri kaybı (onaydan sonra). Adımlar: örnek okul dizili, `teachers` ve `lessons`
  alanları silinmiş bir plan dosyasını aç, "Yedeği yükle". Beklenen: dosya eksik diye
  reddedilir, ya da onay sorusu dosyanın 0 öğretmen ve 0 ders taşıdığını söyler. Olan:
  plan 0 öğretmen, 0 ders ve 0 yerleşimle yükleniyor, bildirim "Yedek yüklendi." diyor,
  geri al kapalı. Önceki plan yalnız bir dosyada ya da oturum yedeklerinde kaldıysa
  geri gelir. Kesilmiş ya da elle düzenlenmiş bir yedek bu yoldan girer.
  **Düzeldi (2026-09-27, 536528f).**

**Şöyle olsa daha iyi.** **Ö43.** Onay sorusu yüklenecek dosyayı açık planla yan yana
saysın ("Dosyada: 0 öğretmen, 20 sınıf, 0 ders. Şu an: 25, 20, 99.") (denetçinin
önerisi, DK11).

### X2 · Diller: İngilizce ve Almanca (2026-09-26)

**Ne ve nerede.** Ayarlar → Görünüm → Dil: Türkçe, English, Deutsch, Español, Français, her
biri kendi dilinde yazılı.

**Nasıl denendi.** Örnek okul dizili, 1920, açık, %100. İngilizce ve Almancaya geçildi, yedi
sekmenin her biri açılıp görüntülendi. Görünür metin düğümlerinde Türkçe harf ya da
Türkçe kelime arandı, veri (okul, öğretmen adları) ayıklandı. Düğmelerde yazı taşması
`Range` genişliğiyle ölçüldü. Görüntüler: `scratch/denetim/dil/en-*.png`, `scratch/denetim/dil/de-*.png`,
`scratch/denetim/dil/en-dersler-serit.png`.

**İyi olan.** Dil düğmesi anında geçiyor, yenileme istemiyor. İki dilde de yedi sekmede
taşan düğme yok. Gün adları, şerit başlıkları, menüler ve gerekçe satırı çevrilmiş.

**Kötü olan.**
- Almancada Dersler sekmesi de Okul'daki Branşlar listesi de "Fächer". Almanca okuyan
  biri iki ayrı şeyi aynı adla görüyor.

**Kusur.**
- **DK12 · Kimya'nın kısaltması dört dilde "kim?" sorusu olarak çevrilmiş.** Şiddet:
  metin (kâğıda da geçer). Adımlar: örnek okul, dil English, Program. Beklenen: MB ve
  GÇ'nin satır başında kimyanın kısaltması ("Che" ya da "Chm"). Olan: "Who". Almancada
  "Wer", İspanyolcada "Quién", Fransızcada "Qui" (`src/leaf/lang/*.ts`, `Kim` anahtarı).
  Sebep sözlüğün yapısında: Türkçe metin anahtar olduğu için Müsaitlik şeridindeki "Kim"
  (kim?) ile Kimya'nın kısaltması "Kim" tek anahtara düşüyor ve biri ötekinin çevirisini
  alıyor. Görüntü: `scratch/denetim/dil/en-4.png`.
  **Düzeldi (2026-09-27, a77b751).**
- **DK13 · Dersler şeridinin toplamı çevrilmiyor.** Şiddet: metin. Adımlar: dil English
  ya da Deutsch, Dersler. Beklenen: "99 lessons · 433 hours". Olan: "TOTAL 99 ders · 433
  saat", Almancada "SUMME 99 ders · 433 saat". TODO §8d'deki "`t()`'den geçmeyen JSX
  metinleri" şüphesinin (Ribbon.tsx) üretilmiş bir örneği. Görüntü:
  `scratch/denetim/dil/en-dersler-serit.png`.

**Şöyle olsa daha iyi.** **Ö44.** Aynı Türkçe metnin iki anlamı olduğunda sözlük bir bağlam
eki alsın (ör. "Kim|kısaltma"), ve bir test her dildeki branş kısaltmalarının branş
adlarıyla aynı sırada olduğunu ölçsün (denetçinin önerisi, DK12).

### A3 · Görünüm (2026-09-26)

**Ne ve nerede.** Ayarlar → Görünüm: tema (Açık, Koyu), yazı büyüklüğü (%80 ile %150 arası
beşer adım), ızgara ve arayüz için ayrı yoğunluk, şeridin kaydırınca gizlenmesi, hareket
(Tam, Az, Kapalı), dil, sağda örnek tablo.

**Nasıl denendi.** Örnek okul dizili, 1920. Ölçek %80 ve %150'ye alınıp yedi sekme
görüntülendi, tema Koyu yapıldı, dil değiştirildi (X2). Görüntü: `scratch/denetim/ayarlar/gorunum-1920.png`.

**İyi olan.** Her ayarın altında ne yaptığı ve neyi etkilemediği yazıyor ("Bu bilgisayara
aittir ve yazdırmayı etkilemez"). Yazı büyüklüğü sayılı düğmeler, sürgü değil. Tema
bilgisayarın tercihini bilerek izlemiyor ve bunu söylüyor.

**Kötü olan.** On beş ölçek düğmesi tek satırda ve birbirine çok benziyor (%95, %100, %105).
Çıktı'da şeridin kaydırınca gizlenmesi seçenekleri gizliyor (C1).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### X3 · Ölçek ve Windows %125'in kutusu (2026-09-26)

**Ne ve nerede.** Uygulamanın kendi ölçeği (%80, %100, %150) ve 1536×816 DPR 1,25 kutusu.

**Nasıl denendi.** Örnek okul dizili. Yedi sekme %80 ve %150'de 1920'de, %100'de 1536 DPR
1,25'te görüntülendi. Her sekmede en küçük yazı, 24 px'in altındaki tıklanabilirler ve
sayfanın yatay taşması ölçüldü, şeritte ekranın dışına düşen düğme sayıldı. Görüntüler:
`scratch/denetim/varyant/1920-acik-80-*.png`, `scratch/denetim/varyant/1920-acik-150-*.png`,
`scratch/denetim/varyant/1536-acik-100-*.png`.

**İyi olan.**
- Hiçbir sekmede, hiçbir ölçekte sayfa yatay taşmıyor, şeritte ekran dışına düşen düğme
  yok.
- %150'de en küçük yazı 18 px (Çıktı'nın kâğıt önizlemesi hariç), Okul ve Dersler rahat
  okunuyor.
- 1536 kutusunda şerit düğmeleri sığıyor.

**Kötü olan.**
- **KS24 · Durum çipi %150'de "S…" oluyor.** Çip daralınca cümlesi kesiliyor ve noktanın
  yanında tek bir harf kalıyor. LAYOUT çipin cümlesini bırakıp noktasını tutacağını
  söylüyor. "S…" ne bir cümle ne bir işaret (`scratch/denetim/varyant/1920-acik-150-program.png`).
- **KS25 · Küçük yazıda kelime araları kapanıyor.** 13 px'te boşluk 3 CSS px. DPR 1,25'te
  çip "Sorunyok", şerit "Program1" okunuyor. %80'de havuz başlığı "Hepsiyerleşti",
  "99dersin" (`scratch/denetim/ustcubuk/cip-1536-yakin.png`,
  `scratch/denetim/varyant/1920-acik-80-program.png`).
- %80'de 24 px'in altındaki tıklanabilir sayısı Program'da 381'e çıkıyor (raptiyeler,
  satır başları). %80 babanın gözü için bir seçenek değil, ama 1536'da kesik kartlar
  için önerilen çıkış o (WORKLOG).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö45.** Çip daralınca cümle yerine sayı kalsın ("● 9") ve cümle
`title`'da dursun (denetçinin önerisi, KS24).

### X4 · Koyu tema (2026-09-26)

**Ne ve nerede.** Üst çubuktaki tema düğmesi ve Ayarlar → Görünüm.

**Nasıl denendi.** Örnek okul dizili, 1920, %100. Yedi sekme görüntülendi. Görüntüler:
`scratch/denetim/varyant/1920-koyu-100-*.png`.

**İyi olan.** Izgara, kartlar, kapalı saat çarpısı ve gerekçe satırı koyu zeminde okunuyor.
Kartların renkleri ve kırmızı çarpı ayırt ediliyor.

**Kötü olan.** Yok (gözle, kontrast ölçülmedi).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E1 · Marka, sekmeler, Alt+1..7 (2026-09-26)

**Ne ve nerede.** Üst çubuğun solu: işaret ve yedi sekme, Alt+1'den Alt+7'ye.

**Nasıl denendi.** Örnek okul, 1920. Alt+1..7 sırayla basılıp açılan şeridin başlığı
okundu. Denetim boyunca her ekranda sekme yazısının boyu ölçüldü.

**İyi olan.** Yedi kısayolun yedisi de doğru sekmeyi açıyor. Her sekmenin bir rengi var ve
açık sekme dolu bir hap.

**Kötü olan.** Sekme yazısı 13 px, uygulamanın en sık bakılan yazılarından biri için küçük.
İlk açılışta Ayarlar'da okunmamış yenilikler noktası yanıyor (O1).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E3 · Plan seçici (2026-09-26)

**Ne ve nerede.** Üst çubukta okul adının yanında açılır liste.

**Nasıl denendi.** A4 ile birlikte, iki ve üç planla.

**İyi olan.** Tek plan varken de görünüyor ve açık planı söylüyor.

**Kötü olan.** Dar: "1. plan kopyası" "1. plan kopyas" diye kesiliyor. "(taslak)" eki
çevrilmiyor. Şeritteki program seçiciyle ("Program 1") yan yana iki ayrı "plan" ve
"program" kavramı (P16).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E4 · Geri al ve ileri al (2026-09-26)

**Ne ve nerede.** Üst çubukta iki simge düğme, Ctrl+Z, Ctrl+Y ve Ctrl+Shift+Z.

**Nasıl denendi.** Denetim boyunca. Müsaitlik'te 35 hücre değiştirilip Geri al düğmesine
kapanana kadar basıldı.

**İyi olan.** Hamlelerin çoğu tek adım ve geri alınıyor: takas, tahliye, otomatik dizme,
önerinin uygulanması (cevaplarla birlikte), boşaltma.

**Kötü olan.**
- **KS26 · Geçmiş 30 adımda sessizce bitiyor.** 35 değişiklikten 30'u geri alındı, düğme
  kapandı, ilk 5'i geri alınamadı ve bunu bir şey söylemedi. Müsaitlik'te her hücre bir
  adım, yani 30 tıklık bir boyama bir öğleden sonranın geçmişini siliyor. DK8'in tek
  kurtarma yolu da bu geçmiş.
- Ctrl+Z bir onay kutusu ya da sayı kutusu odaktayken çalışmıyor (DK8).
- Düğmeler yalnız simge, 33 px.

**Kusur.** DK8 (A1'de).

**Şöyle olsa daha iyi.** **Ö46.** Geçmiş en az bir oturum boyu tutulsun ya da tavan yüzlere
çıksın, sınıra gelince düğmenin `title`'ı "Daha eskisi geri alınamaz" desin (denetçinin
önerisi, aSc'nin şeridinde Geri ve Tekrarla var, sınırı okunmadı).

### E7 · Ara ve git, Ctrl+K (2026-09-26)

**Ne ve nerede.** Üst çubukta büyüteç, Ctrl+K. Git (yedi sekme), Yap (dosyaya kaydet, otomatik
diz, tema, şerit, animasyon, kısayollar), öğretmenler, sınıflar, derslikler.

**Nasıl denendi.** Örnek okul. Ctrl+K, "mehm" yazıp Enter, "otomatik" yazıldı. Görüntü:
`scratch/denetim/ustcubuk/palet-1920.png`.

**İyi olan.** Her komutun yanında kısayolu yazıyor. "mehm" tek sonuca iniyor ve Enter
öğretmenin panelini açıyor.

**Kötü olan.** Yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E8 · Klavye kısayolları ekranı (2026-09-26)

**Ne ve nerede.** `?` tuşu ya da üst çubuktaki klavye simgesi.

**Nasıl denendi.** Örnek okul, `?`. Görüntü: `scratch/denetim/ustcubuk/kisayollar-1920.png`.

**İyi olan.** Kısayollar yere göre gruplanmış (genel, ızgara, listeler, diyaloglar).

**Kötü olan.** Çalışan beş tuş listede yok: Ctrl+Shift+Z, kartta Space ve Backspace, havuz
kenarında ↑ ↓ Shift Home End, sürüklerken Esc. Liste elle yazılmış (keşif,
`src/ui/ShortcutsHelp.tsx`).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E9 · Araç şeridini aç kapa (2026-09-26)

**Ne ve nerede.** Üst çubukta yukarı ok simgesi.

**Nasıl denendi.** Program'da kapatılıp açıldı. Görüntü: `scratch/denetim/ustcubuk/serit-kapali-1920.png`.

**İyi olan.** Şerit tamamen gidiyor ve ızgaraya bir satır kalıyor, `title` bunu söylüyor.

**Kötü olan.** Yalnız simge.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E10 · Tema düğmesi (2026-09-26)

**Ne ve nerede.** Üst çubuğun en sağı, ay ya da güneş simgesi.

**Nasıl denendi.** Açık ve koyu arasında geçildi.

**İyi olan.** Anında geçiyor, erişilebilir adı hangi temaya geçileceğini söylüyor.

**Kötü olan.** Yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E11 · Uyarı çubukları (2026-09-26)

**Ne ve nerede.** Şeridin altında tam genişlikte çubuklar: otomatik kayıt çalışmıyor,
güncelleme (`Yenile`, `Sonra`), `Klasörü düzelt`. LAYOUT'ta ve CHANGELOG'da yok.

**Nasıl denendi.** Otomatik kayıt çubuğu için yeni bir tarayıcı bağlamında `setItem`
hata atacak şekilde değiştirildi ve örnek okul yüklendi. Güncelleme çubuğu T2'de,
klasör çubuğu X1'de. Görüntü: `scratch/denetim/ustcubuk/kayit-calismiyor-1920.png`.

**İyi olan.** Kırmızı, tam genişlikte ve ne yapılacağını söylüyor ("Çalışırken sık sık
Dosyaya kaydet düğmesine basın…"). Program çökmüyor, konsolda hata yok.

**Kötü olan.** Yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### E2 · Durum çipi (2026-09-26)

**Ne ve nerede.** Üst çubukta sekmelerin yanında, sorunu adıyla söyler ve Kontrol'e götürür.

**Nasıl denendi.** Denetim boyunca her ekranda okundu.

**İyi olan.** Sorunları sayıyla ve adıyla söylüyor ("9 ders kapalı saatte · 8 ders sığmıyor
· 65 saat havuzda"), rengi durumu taşıyor.

**Kötü olan.**
- Boş planda ve havuzda bekleyen dersler varken yeşil ("Henüz ders girilmedi", "433 saat
  havuzda"). Yeşil ekranın geri kalanında "sorun yok" demek.
- Kontrol'ün hüküm kutusuyla çelişebiliyor (DK7).
- %150'de "S…" (KS24), DPR 1,25'te "Sorunyok" (KS25).

**Kusur.** DK7 (K1'de).

**Şöyle olsa daha iyi.** Ö23 (P19'da).

### X5 · Fare olmadan bir tur (2026-09-26)

**Ne ve nerede.** Bütün program, yalnız klavyeyle.

**Nasıl denendi.** Boş plan, 1920. Sırayla: Alt+1, derslik ekle, Branşlar'da Hepsini ekle,
öğretmen ekle (branş okla seçildi), sınıf ekle, Alt+3 ile bir ders ekle, Alt+4, Ctrl+K ile
Otomatik diz, bir kartı Enter menüsünden havuza kaldır, Alt+6 ile Hiçbiri ve bir sınıf
seç. Her adımda odak okundu ve Tab sayıldı. Görüntüler: `scratch/denetim/klavye/*.png`.

**İyi olan.** Tur baştan sona yapılabildi. Alt+1..7 ve Ctrl+K klavyenin en güçlü iki
aracı: bir sekmeye ya da bir komuta tek hamlede gidiliyor. Odak halkası her yerde görünür
(kart, düğme, onay kutusu).

**Kötü olan.**
- **KS27 · Sekmeden içeriğe varmak uzun.** Sekme çubuğundan derslik kutusuna 23 Tab,
  derslik ekledikten sonra şeritteki Branşlar'a 24 Tab (sayfanın sonundan başa dolanarak),
  Program'da ilk karta 28 Tab. İçeriğe atlama bağlantısı yok, ve Enter'la bir şey
  eklendikten sonra odak kutuda kaldığı için şeride dönmek sayfayı dolaşmak demek.
- Müsaitlik klavyeyle hiç girilemiyor (KS19). Tur bu yüzden müsaitliksiz yapıldı.
- Izgarada odak kart başına iki durak (KS8), kart menüden ya da Delete ile kaldırılınca
  odak `body`'ye düşüyor (KS9).
- Dersler formunda "Haftalık saat" kutusunun erişilebilir adı yok, ekran okuyucu yalnız
  "düzenleme kutusu" der (TODO §8e'deki `label` bulgusunun bir örneği).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö47.** Her sekmenin başında "İçeriğe geç" bağlantısı ve şeritten
içeriğe, içerikten şeride dönen bir kısayol (ör. F6) olsun (denetçinin önerisi, ölçüm
KS27).

### X6 · Diyaloglar ve bildirimler (2026-09-26)

**Ne ve nerede.** Uygulamanın kendi soru ve uyarı pencereleri (`useDialogs`) ve sağ alttaki
bildirimler (`useToast`).

**Nasıl denendi.** Denetim boyunca otuza yakın diyalog ve bildirim okundu. Görüntüler:
`scratch/denetim/uzun/ogretmen-sil-onay-1920.png`, `scratch/denetim/ayarlar/plan-sil-onay-1920.png`,
`scratch/denetim/dersler/yapistir-eklendi-1920.png`.

**İyi olan.** Silme soruları neyin kaybedileceğini adıyla ve sayıyla söylüyor ("MÇ
(Şükrüye Gülçiçek Öztürkoğlu-Çağlayangil 1) silinecek. 4 dersi ve programa yerleşmiş 23
saati de gidecek."). Geri alınamaz olanlar kırmızı düğmeli ve bunu söylüyor. Bildirimler
kısa ve kapatılabilir.

**Kötü olan.**
- Kayıp soran pencerelerin olmadığı üç yol var: bir günü kaldırmak, günlük ders sayısını
  düşürmek ve ders adlarını kısaltmak (DK8, DK9).
- Gerekçe satırındaki mesajlar kendiliğinden gitmiyor ve başka sekmelerde, başka
  hamlelerden sonra da duruyor (DK4, O7).
- Bildirim sağ altta listenin son satırlarını örtüyor (Dersler'in sağ listesi, Okul).

**Kusur.** DK4 (P12'de).

**Şöyle olsa daha iyi.** Yok.

### X7 · Uzun adlar (2026-09-26)

**Ne ve nerede.** Kırk karakterin üstünde okul, öğretmen, sınıf ve derslik adları.

**Nasıl denendi.** `uzun-ad` veri seti, 1920. Program iki görünüm ve Sığdır, Okul, Çıktı ve
PDF. Görüntüler: `scratch/denetim/uzun/program-rahat-1920.png`, `scratch/denetim/uzun/program-sinif-1920.png`,
`scratch/denetim/uzun/program-sigdir-sinif-1920.png`, `scratch/denetim/uzun/okul-ogretmenler-1920.png`,
`scratch/denetim/uzun/cikti-01.png`.

**İyi olan.** Hiçbir yerde metin taşıp başka bir şeyin üstüne binmiyor. Sığdır sınıf adını
ilk kelimesiyle ("400") yazıyor, derslik "Büyük Çalış…" diye kısalıyor. Kâğıtta başlık
ve künye tek satır kalıyor.

**Kötü olan.** Rahat'ta sınıf görünümünde satır başı 258 px'e genişliyor ve ızgaradan dört
günden fazlasını görünmez yapıyor. Üst çubukta okul adı plan seçiciyi sağa itiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Satır başının genişliği bir tavanla sınırlansın ve tam ad
`title`'da dursun (denetçinin önerisi).

### X1 · Klasöre yedek (2026-09-26)

**Ne ve nerede.** Ayarlar → Planlar ve yedek → Nereye kaydedilsin: `Klasör seç…`, seçilen
klasöre bütün planlar ve günlük yedek. Klasöre yazılamayınca üstte `Klasörü düzelt`
çubuğu.

**Nasıl denendi.** Site yolunda (http, `vite preview`), klasör seçici `e2e/klasor.spec.ts`'in
kalıbıyla tarayıcının özel diskine (OPFS) yönlendirildi. Örnek okul yüklendi, klasör
seçildi, dosyalar okundu, sonra izin "prompt"a çekilip sayfa yenilendi. Gerçek bir
klasör seçici açılmadı. Görüntüler: `scratch/denetim/teslim/site-klasor-secildi-1920.png`,
`scratch/denetim/teslim/site-izin-yok-1920.png`.

**İyi olan.** İki dosya yazıldı ("ders-programi-tumu.json" ve günün yedeği), panel
klasörü, saati ve dosya adlarını söylüyor ve hangisinin ne olduğunu anlatıyor. İzin
kalkınca çubuk açık konuşuyor: "Belgelerim klasörüne yazılamıyor: tarayıcı izni sormadan
devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor." ve yanında `Klasörü düzelt`.

**Kötü olan.** Yok (seçicinin kendisi denenmedi).

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### T1 · Çift tıklanan dosya, `file://` (2026-09-26)

**Ne ve nerede.** `dist/index.html`, çift tıklanan tek dosya.

**Nasıl denendi.** Denetimin tarayıcı tarafının tamamı bu yolda yapıldı. Her bağlamda
konsol hataları ve `file:` dışı istekler kaydedildi.

**İyi olan.** Denetim boyunca konsolda hata yok, dışarıya tek istek yok. Hakkında "Nasıl
açıldı: Dosya (çift tıklanan .html)" diyor, kendini güncellemediğini ve en son sürümün
nerede olduğunu söylüyor.

**Kötü olan.** Yok.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** Yok.

### T2 · Site ve service worker (2026-09-26)

**Ne ve nerede.** `dist-site/` (GitHub Pages), çevrimdışı service worker, güncelleme
çubuğu (`Yenile`, `Sonra`), Hakkında'da `Güncellemeleri denetle`.

**Nasıl denendi.** `npm run build:site`, `vite preview` 4173'te. Açıldı, service worker'ın
durumu okundu, bağlam çevrimdışı yapılıp yenilendi, Hakkında'da denetle'ye basıldı.
Güncelleme çubuğu için ikinci bir sürüm yayınlanmadı. Görüntüler:
`scratch/denetim/teslim/site-hakkinda-1920.png`, `scratch/denetim/teslim/site-cevrimdisi-1920.png`,
`scratch/denetim/teslim/site-guncelleme-denetle-1920.png`.

**İyi olan.** Service worker "activated", çevrimdışı yenilemede program açılıyor, dışarıya
istek yok. Hakkında "Nasıl açıldı: Site" diyor ve güncellemenin nasıl geleceğini söylüyor
("Yeni sürüm çıkınca üstte bir satır belirir; Yenile demedikçe hiçbir şey değişmez.").

**Kötü olan.** **KS28 · "Güncellemeleri denetle" güncelken bir şey söylemiyor.** Basıldıktan
iki buçuk saniye sonra da ekranda bir cevap yok. Kullanıcı denetlemenin yapılıp
yapılmadığını bilmiyor.

**Kusur.** Yok.

**Şöyle olsa daha iyi.** **Ö48.** Denetim bir cümleyle bitsin: "Bu en son sürüm (v2.2.0)"
(denetçinin önerisi).

### T3 · Windows kurulum paketi (2026-09-26)

**Ne ve nerede.** `kurulum/Kur.cmd`, yerel sunucu, `Guncelle.cmd`.

**Nasıl denendi.** Denenmedi: bu makinede Windows yok, kullanıcı "denenmedi" diye
işaretlenmesini seçti. Betikler bu turda okunmadı.

### T4 · Exe (2026-09-26)

**Ne ve nerede.** Tauri exe: büyütülmüş pencere, Belgelerim\Ders Programı'na kendiliğinden
yazma, Hakkında'da güncelleme denetimi, yazdırma.

**Nasıl denendi.** Gerçek Linux ikilisi (`dist-exe/Mozaik`, f25e356'dan derlendi),
`scripts/exe-surucu.mjs` ile sahte bir evde (`scratch/exe-surucu/ev`), `performance`
profili. Pencere okundu, adsız fikstür sayfanın içinden yüklendi, Otomatik diz, öneri
araması beklendi, ilk yol uygulandı, Ctrl+Z, Hakkında'da "Güncellemeleri denetle" (ağa
çıktı, kullanıcının izniyle yalnız denetle). Sahte evdeki dosyalar sayıldı. Gerçek
`~/Documents/Ders Programı` önce ve sonra sha256 ile karşılaştırıldı, aynı. Yazdırma
penceresi WebDriver'la açılamadığı için denenmedi (tuzak 133). Görüntüler:
`scratch/denetim/teslim/exe-ilk.png`, `scratch/denetim/teslim/exe-oneri.png`,
`scratch/denetim/teslim/exe-geri-al.png`, `scratch/denetim/teslim/exe-guncelleme.png`.

**İyi olan.**
- Pencere ekranı dolduruyor (1920×1121, DPR 2).
- Öneri paneli Chromium'daki altı yolun aynısını aynı sırayla veriyor. Hakkında kendi
  ölçümünü söylüyor: "7 iş parçacığında · ilk öneri 5 sn · arama 40 sn". Sürücüyle kaba
  bir yoklamada arama yaklaşık 49 s'de bitti (her çağrı bir saniye kadar sürdüğü için
  kaba).
- Uygula "Sorun yok"a götürüyor, Ctrl+Z geri alıyor.
- Sahte evin Belgelerim\Ders Programı klasörüne iki dosya yazıldı, soru sorulmadan.
- Denetle cevap veriyor: "En son sürümü kullanıyorsunuz." Linux kopyasının kendini
  güncellemediğini Hakkında söylüyor.

**Kötü olan.** Sitedeki denetle düğmesi aynı durumda sessiz (KS28), exe'deki konuşuyor.

**Kusur.** DK4 exe'de de üretildi: Ctrl+Z'den sonra satır "Öneri uygulandı ve program
yerleştirildi" demeye devam ediyor, çip "7 ders sığmıyor · 14 saat havuzda".

**Şöyle olsa daha iyi.** Yok.

## Doğrulanmadı

Kaynaktan okunup üretilemeyen şüpheler.

- Chromium'un yazdırdığı PDF poppler ile resme çevrilince harf aralığı düzensiz görünüyor
  ("Haf talık"). Görüntüleyiciden mi, PDF'teki gömülü yazıdan mı geldiği ayrılmadı.
  Gerçek bir yazıcıda ya da başka bir PDF görüntüleyicide bakılmalı (TODO §8c'deki
  "gerçek kâğıt" maddesiyle aynı soru).
- 1536×816 DPR 1,25'te ekran görüntülerinde harf aralığı düzensiz ("Haf talık", "Giril
  diği"). Linux'taki başsız Chromium'un yazı çiziminden mi, gömülü yazının ipuçlarından
  mı geldiği ayrılmadı. Babanın WebView2'sinde (DirectWrite) görülmedi. Ölçülen tek şey
  boşluğun genişliği (KS25).
