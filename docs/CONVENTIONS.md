# Yazım kuralları

Kodun, commit'lerin, yorumların, arayüz metninin ve belgelerin nasıl yazıldığı, ve çeviri sözlüğünün nasıl işlediği.

## Kod İngilizce, arayüz Türkçe

Tanımlayıcılar, tipler ve dosya adları İngilizce: `teacher`, `classGroup`,
`unavailable`, `placements`, `constraints.ts`, `blocker()`,
`components/Availability.tsx`. İkisi karışınca bir dosyayı okuyan kişi neyin
kod neyin ekran olduğunu ayırt edemiyor.

Kullanıcıya görünen her metin doğru Türkçe karakterlerle Türkçe yazılır:
`"MÇ Salı 3. saatte 433 sınıfında"`. Bu metin JSX'te ve saf modüllerde Türkçe
cümlenin kendisi olarak durur ve çeviri sözlüğünden geçerek ekrana çıkar
(`t('Öğretmenler')` ya da `<T>`). Yani dosyayı açan kişi ekranda çıkacak cümleyi
okur, ve cümle Türkçe dışındaki dört dilde sözlükteki karşılığıyla çizilir.
Çevirinin nasıl işlediği aşağıda, "Çeviri" başlığında.

Depolanan JSON alan adları İngilizce. Bir alan adını değiştirmek yedek dosyalarını
bozar, bu yüzden şema değişince `schemaVersion` artırılır ve göç kodu yazılır
([DATA.md](DATA.md)).

Kullanıcı verisinin kimliği olan adlar ise Türkçe kalır: localStorage anahtarları
(`ders-programi`, `ders-programi-yedek-N` ve ötekiler), indirilen yedeğin dosya adı
(`ders-programi-YYYY-AA-GG-SSDD.json`) ve exe'nin Belgelerim altındaki klasörü.
Bunları İngilizceye çevirmek kayıtlı programı görünmez kılar, çünkü kimliği
değişen bir anahtar silinmiş veri demek. Tam liste DATA.md'de.

## Yorumlar

Yorumlar İngilizce, kısa, ve niçini anlatır. Neyi kod söyler. Bir yorum bir
kapsam ya da davranış iddia ediyorsa o iddia kodda da bulunur: yorumun "yalnız
ızgarada" dediği bir kuralın seçicisinde `table.grid` yoksa yorum bir dilektir
(tuzak 103). İlkelere yorumda numarayla değil adıyla atıf yapılır, çünkü ilkeler
numarasız.

## Commit mesajları

Mesaj yalnız neyin değiştiğini ve niçin değiştiğini anlatır. Co-author satırı,
"Generated with" satırı ya da herhangi bir araç imzası eklenmez. Mesajlar deponun
geçmişindeki gibi Türkçe yazılıyor.

## Hazır çözüm önce

Tekerlek yeniden icat edilmez, varsayılan cevap "kullan". Bir paket, kütüphane,
framework ya da araç işi görüyorsa o alınır. Elle yazmak istisnadır ve gerekçesi
yazılır. Bir şeyi elle yazmadan önce sırayla şu üç soru sorulur:

1. Bunu yapan olgun bir paket var mı?
2. Kullanılan framework'ün zaten bir cevabı var mı?
3. Platform (tarayıcı, işletim sistemi) bunu bedavaya yapıyor mu?

Üçü de hayırsa yazılır ve niçin hayır olduğu [DECISIONS.md](DECISIONS.md)'ye bir
satır olarak yazılır.

Paket almanın ölçütü tek: `dist/index.html`'e gömülebiliyor ve çalışma anında ağa
çıkmıyorsa serbest. Sabit bir boyut tavanı yok, eklendikten sonra boyut ve
açılış süresi ölçülüp [WORKLOG.md](WORKLOG.md)'ye yazılır ([BUILD.md](BUILD.md)).

Bu, elle yazılmış mevcut kodu toptan atmak demek değil. Bazılarının ölçülmüş bir
gerekçesi var ve o gerekçe DECISIONS'ta duruyor (örneğin `drag.ts`'in Pointer
Events ile yazılması, hareket kütüphanesinin alınmaması). Ama bir sonraki
ihtiyaçta varsayılan tercih hazır çözüm.

## Kod kalitesi

**Tek sorumluluk.** Bir modül bir soruyu cevaplar, bir fonksiyon bir iş yapar.
Dosyanın adı içindekini tarif edemiyorsa dosya bölünür. Fonksiyonun adında "ve"
varsa fonksiyon bölünür.

**Kapsülleme.** Veri ve o veri üstünde çalışan davranış bir arada tutulur,
çağıranın bilmesi gerekmeyen şey sızdırılmaz. Sınıf zorunlu değil, modül ve
closure da kapsülleme birimidir. Ölçüt şu: bir şeyi değiştirmek için kaç dosyaya
dokunmak gerekiyor.

**Temiz ve okunabilir.** Erken çıkış, sığ iç içelik, anlamlı adlar. Ölü kod yok,
kopyala yapıştır yok: bir şey üçüncü kez yazılıyorsa ortak bir yere çıkarılır.
Yorumlar niçini anlatır, neyi kod söyler.

**Optimizasyon ölçülerek yapılır.** Ölçmeden hızlandırılmaz, hızlandırdıktan
sonra toplam yeniden ölçülür. Aynı sayıyı ölçen bir iyileştirme, düzeltme
kılığında bir yorumdur ve geri alınır (tuzak 21 ve 105).

Katmanlar arası sınırlar (iş mantığı bileşende durmaz, saf modül DOM bilmez)
[ARCHITECTURE.md](ARCHITECTURE.md)'de.

## Arayüz metni

### Uzun çizgi

Ekranda uzun çizgi (`—`) kullanılmıyor (2026-08-27, kullanıcı isteği). Yerine dört
kural geçiyor: düzyazıda ayrı bir cümle, etiket ile değer arasında iki nokta, eşit
ağırlıkta iki şey arasında orta nokta (`·`), ve boş bir tablo hücresinde kısa çizgi
(`–`). Aralık çizgisi (`Sal–Cum 13:30`) başka bir karakter ve yerinde kalıyor.

`e2e/metin.spec.ts` her sekmede ve her Ayarlar bölümünde
`document.body.innerText`'i okuyup sayar. Kaynağa değil ekrana baktığı için
İngilizce kod yorumları bu kuralın dışında.

### İpucu satırı tek cümle

Bir `.hint` tek cümledir, yaklaşık 90 karakter (2026-08-30, kullanıcı isteği:
*"çok fazla info var ve çok uzunlar her yerde"*). Uzayan gerekçe öğenin
`title`'ına iner, yani okunup geçilen bir yere değil arandığı yere.
`AddPanel`'in `more` prop'u bunun için var. `e2e/metin.spec.ts` tavanı 140
karakterde tutar. Uzunluğu veriden gelen satırlar (`.data-hint`) bu tavanın
dışında, çünkü onları uzatan şey okulun kendisi.

### Kontrol adları

Bir düğmenin, bölümün ya da panelin adı bir sekmenin adıyla başlamıyor ve onu
içermiyor, çünkü Playwright'ın ad sorguları alt dize eşliyor ve büyük küçük harf
ayırmıyor (tuzak 49 ve 74). Ayarlar'ın bölümleri bu yüzden `Zil ve günler` ve
`Hakkında` adını taşıyor, `Okul ve zil` ya da `Program hakkında` değil. Metni
değişen bir kontrol kendi `aria-label`'ını taşır, çünkü `title` da bir ada
dönüşür.

Boş ekranların ve onay sorularının ne söylediği [LAYOUT.md](LAYOUT.md)'de.

## Çeviri

Arayüz beş dil konuşur: `tr`, `en`, `de`, `es`, `fr`. İlk açılışta
`navigator.language`'ın ilk parçası bu beşinden biriyse o seçilir, değilse
İngilizce. Kullanıcının seçimi `ders-programi-dil`'de durur.

**Anahtar Türkçe cümlenin kendisidir.** `t('Öğretmenler')` yazılır,
`t('setup.teachers')` değil. Üç şeyi koruyor: JSX Türkçe okunur kalır, yüzlerce
isim uydurulmaz, ve hiçbir isim temsil ettiği cümleden sapamaz.

**Dört sözlük var:** `src/leaf/lang/en.ts`, `de.ts`, `es.ts`, `fr.ts`. Türkçenin
sözlüğü yok, çünkü her girdisi `'X': 'X'` olurdu, yani yüzlerce kez kaynak dili
sessizce bozma şansı. Eksik bir çeviri doğru Türkçeye düşer: bitmemiş bir
sözlüğün arıza biçimi "bu satır hâlâ Türkçe"dir, ekranda `setup.teachers.title` gibi bir anahtar adı değil.

**Aktif dili `i18n.ts` tutar** ve çıplak bir `t()` verir, çünkü `constraints.ts`
gibi saf modüller de ekrana cümle yazıyor ve `useT()` çağıramıyor. Aktif dili
yalnız `applyDil()` yazar, ilk boyamadan önce ve her dil değişiminde.

**Bir cümle bölünmez.** `<T>` vurgulu parçaları (`**…**`) cümleyi üç anahtara
bölmeden çizer, çünkü diller arasında değişen şey kelime sırası.

**Çoğul sözlüğün değerindedir:** `{n:tekil|çoğul}`, ve kategoriyi
`Intl.PluralRules` seçer (Fransızca 0'ı tekil sayar, İspanyolca saymaz). Sayı
çevrilen anahtarın içine alınır (`'{n} derslik'`), yuvaya çevrilmiş bir kelime
konmaz, yoksa çoğullanamaz (tuzak 90).

**State'e giren metin çevrilmez.** Gün ve branş adları depoda Türkçe kalır ve
ekranda `names.ts` üstünden çevrilir. Böylece bir yedek dosyası her makinede aynı
şeyi anlatır ve `remapDays()` günleri hâlâ isimden eşler (tuzak 11). Bir değerin
hem "ekranda ne yazıyor" hem "depoya ne yazılıyor" işi varsa iki ayrı değere
bölünür (tuzak 91).

**Türkçe metni düzenlemek çevirisini öksüz bırakır.** `i18n.test.ts` dört sözlükte
birden ölü anahtarı, yuva kümesini, dengeli `**`'yı, çoğulun iki biçimini ve uzun
çizgiyi yakalar. Ölü anahtar taraması yorumlara da baktığı için bir arayüz metnini
yeniden adlandıran `lang/*.ts`'i elle düzeltir (tuzak 87).

**Süitin kalanı çevrilmemiş metni göremez.** E2E süiti `e2e/kapan.ts`'te Türkçeye
sabitli, ve Türkçede `t()`'den geçmiş bir cümle ile geçmemiş bir cümle aynı
görünür. Onu gören şey başka bir dilde açılmış sayfanın taranması ve ekran
görüntülerine bakmak (tuzak 89). Sözlüklerin ölçülen boyut maliyeti WORKLOG'da.

## Vitrin İngilizce

Depoya dışarıdan bakan her şey İngilizce (2026-08-30, kullanıcı kararı):
`README.md`, `LICENSE`, `.github/surum-notu.md`, iş akışlarının adları, işleri,
girdileri ve adımları (Actions arayüzünde görünüyorlar), `package.json` ve
`Cargo.toml`'un `description`'ları, kökteki `CHANGELOG.md`, ve Codex'in giriş
dosyası `AGENTS.md`.

`CLAUDE.md`, `docs/`, `.claude/` ve `.mcp.json` Türkçe kalır: projenin hafızası
bunlar ve kararların alındığı dilde duruyorlar. README bunun sebebini de
yazıyor.

İki istisna bilerek var. `surum-notu.md`'nin sonunda üç satır Türkçe kurulum
özeti duruyor, çünkü o metin her Release sayfasının gövdesi, yani babanın
indirirken gördüğü sayfa. `kurulum/OKU.txt` baştan sona Türkçe.

## Programın adı

Program Mozaik. Beş dilde de aynı kelime (Mozaik · Mosaic · Mosaik · Mosaico ·
Mosaïque) ve ekrandaki şeyi tarif ediyor. Tek kaynağı `src/leaf/version.ts`'teki
`APP_NAME`, çünkü ad dört yerden ekrana çıkıyor: pencere başlığı, belge başlığı,
okul adı girilmemişken `<h1>` ve manifest. Veriyi taşıyan adlar eski adla kaldı,
listesi [DATA.md](DATA.md)'de.

## Belgeler

`CLAUDE.md` ve `docs/` altındaki belgeler aynı üslupla yazılır.

- **Türkçe, düzyazı.** Madde işareti yalnız gerçekten liste olan yerde kullanılır.
- **Çizgi yok.** Uzun çizgi ve kısa tire kullanılmıyor (kullanıcı isteği, 2026-09-11), cümleler virgül ya da noktayla bağlanır veya yeniden kurulur. Bir kuralın konusu olan karakter kod içinde gösterilir.
- **Noktalı virgülden kaçınılır.**
- **Büyük harfli vurgu seyrek.** Bir kelimeyi büyük harfle yazmak bir paragrafta bir kez bir şey söyler, her satırda hiçbir şey.
- **Her `docs/` dosyası başlığının hemen altında tek cümlelik bir "bu dosya neyi anlatır" satırı taşır**, ve CLAUDE.md'deki yönlendirme satırı aynı cümledir.
- **Mutlak ifade yerine gerekçe.** Bir duruş "bu asla yapılmaz" diye değil "bu şu an yapılmıyor, çünkü şunu koruyor" diye yazılır. Kodun ya da platformun mekanik bir gerçeği ve tarihsel bir alıntı olduğu gibi kalır.
- **Kaynağı belli olmayan gerekçe işaretlenir.** Eski kayıtta yazılı olan (kayıtlı), sonradan önerilen (öneri, doğrulanmadı).
- **Sayılar kaynaktan doğrulanır, belgeden kopyalanmaz.** Tarihli ölçümler WORKLOG'un girdilerinde durur, kural belgelerinde değil.
- **Tarihli kayıtlar geriye dönük düzeltilmez.** WORKLOG girdileri, DECISIONS ve TODO'nun arşivi o günü anlatır. Bir ad sonradan değiştiyse eski ad kalır ve yanına parantez içinde bugünkü ad eklenir.
