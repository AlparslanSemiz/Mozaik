# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti

---

## ŞİMDİ SIRADA — doğrulama

Kod yazıldı ve testler geçiyor, ama üç şey **insan gözüyle** doğrulanmalı.
Bunlar bitmeden v0 "bitti" sayılmaz.

- [ ] **Sürükle-bırak gerçek tarayıcıda denensin.** `npm run dev` → Kurulum →
      "Örnek veriyle doldur" → Program sekmesi → alttaki bir kartı ızgaraya sürükle.
      Kontrol listesi:
  - [ ] Hayalet kart imleci takip ediyor mu, takılıyor mu
  - [ ] Geçerli hücreler yeşil, engelliler kırmızı oluyor mu
  - [ ] Engelli hücrede üst çubukta **somut sebep** yazıyor mu
  - [ ] Hedef satır dışındaki satırlar soluklaşıyor mu
  - [ ] 2'li blok sürüklerken iki hücre birden vurgulanıyor mu
  - [ ] Bırakınca ders yerleşiyor, Esc'e basınca iptal oluyor mu
- [ ] **Baskı önizlemesi görülsün.** Yazdır sekmesi → Yazdır → A4 dikey, sayfa
      başına bir sınıf, renkler basılıyor mu, tablo sayfaya sığıyor mu.
- [ ] **Babanın gerçek verisiyle bir haftalık program baştan sona dizilsin.**
      Örnek veri değil, gerçek veri. v0'ın çıkma şartı bu.
- [ ] **Otomatik kayıt `file://` altında çalışıyor mu?** `dist/index.html`'i çift
      tıklayıp aç → örnek veriyi yükle → sekmeyi kapat → tekrar aç. Veri duruyorsa
      tamam. Durmuyorsa üstte kırmızı uyarı çıkmalı (çıkmıyorsa **hata**).
      *Bütün kalıcılık tasarımı buna bağlı — ilk bakılacak şey bu.*
- [ ] Babanın bilgisayarında hız kontrolü (geliştirme makinesinde 0,18 ms).

## SIRADAKİ İŞ — kod dilini İngilizceye çevir

Arayüz Türkçe kalacak, kod İngilizce olacak (bkz. CLAUDE.md "Kod dili ve biçim").
Davranış değişmeyecek — saf yeniden adlandırma, sonrasında 65 test yine geçmeli.

- [ ] Tipler: `Durum`→`State`, `Ogretmen`→`Teacher`, `Sinif`→`ClassGroup`,
      `Derslik`→`Room`, `Ders`→`Lesson`, `yerlesim`→`placements`,
      `musaitDegil`→`unavailable`, `ayar`→`settings`
- [ ] Dosyalar: `kisit.ts`→`constraints.ts`, `fizibilite.ts`→`feasibility.ts`,
      `iceaktar.ts`→`import.ts`, `durum.ts`→`store.ts`, `suruk.ts`→`drag.ts`,
      `veri.ts`→`entities.ts`, `ornek.ts`→`sample.ts`, `bilesen/`→`components/`
- [ ] Yorumlar İngilizceye
- [ ] Kullanıcıya görünen metinler **Türkçe kalır**, hiçbiri değişmez
- [ ] `schemaVersion` 2'ye çıkar + eski (v1) yedekleri okuyan göç kodu yazılır,
      yoksa bu değişiklikten önce indirilen yedekler açılmaz

---

## 0. Belgeler ✅

- [x] `Claude.md` (yanlışlıkla konmuş boş Access veritabanı) silindi
- [x] `CLAUDE.md` — proje talimatları
- [x] `docs/STATUS.md`
- [x] `docs/TASKS.md`
- [x] `docs/PLAN.md` verilen kararlara göre güncellendi

## 1. İskele ✅

- [x] `package.json` — react + dev: vite, typescript, vitest, singlefile, jsdom
- [x] `vite.config.ts` — singlefile, `base: './'`, modulePreload polyfill kapalı
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- [x] `npm run dev` · `npm test` · `npm run build` · `npm run kontrol`
- [x] **Çıkma şartı:** `npm run build` tek dosya `dist/index.html` üretiyor (252 KB),
      içinde sıfır ağ çağrısı (`fetch`/`XHR`/`WebSocket`/dinamik `import` yok)

## 2. Çekirdek mantık ✅ — 26 test

- [x] `src/tip.ts` — `Durum`, `Ogretmen`, `Sinif`, `Derslik`, `Ders`
- [x] `src/kisit.ts` — `indeksle`, `engel`, `gecerliSaatler`, `blokBasi`,
      `yerlestir`, `kaldir`, `yerlesenSaat`, `temizle`
- [x] Beş sert kısıt, hepsi somut Türkçe mesaj veriyor
- [x] `src/kisit.test.ts` — bitişik blok ayrımı ve cascade silme dahil

## 3. Durum yönetimi ✅

- [x] `src/durum.ts` — `useReducer`, geri al/ileri al (30 adım), **Ctrl+Z / Ctrl+Y**
- [x] Metin kutusundayken Ctrl+Z kapılmıyor (tarayıcı geri alsın)
- [x] localStorage otomatik kayıt (400 ms gecikmeli) + sekme kapanışında anında yazma
- [x] Açılışta yedek zinciri kaydırma (son 3 oturum)
- [x] Yedek indir (.json, adında tarih) / Yedek yükle / Sıfırla
- [x] Bozuk JSON'da çökmeme (test edildi)
- [x] `src/ornek.ts` — gerçek ölçekte örnek veri, deterministik

## 4. Kurulum sekmesi ✅ — 17 test

- [x] Gün/saat düzeni (sayı + isteğe bağlı saat adları)
- [x] Derslik · Öğretmen · Sınıf · Ders listeleri, ekle/düzenle/sil
- [x] `src/iceaktar.ts` — Excel yapıştırma ayrıştırıcısı, **önizlemeli**
- [x] Sekme / noktalı virgül / virgül ayracı, başlık satırı atlama, kısaltma üretme
- [x] Metin kutuları `defaultValue` + `onBlur`
- [x] Silme cascade + kaç şeyin silineceğini söyleyen onay kutusu

## 5. Müsaitlik sekmesi ✅

- [x] Öğretmen seç → 7 × 12 ızgara, tıkla → `×`
- [x] Sürükleyerek toplu boyama (tek geri-al adımı olarak uygulanıyor)
- [x] Gün başlığı → tüm gün · saat başlığı → haftanın o saati
- [x] Tümünü aç / tümünü kapat
- [x] Yük > müsaitlik ise anında uyarı

## 6. Program ızgarası ✅

- [x] Satır = öğretmen, sütun = 7 gün × 12 saat, tek geniş tablo
- [x] Sabit (sticky) satır başlığı ve gün/saat başlıkları
- [x] Hücrede sınıf adı + derslik harfi; müsait olmayan saatler gri taralı `×`
- [x] Blok gösterimi, `rowspan` yok
- [x] Yerleşmiş karta tıkla → blok tamamen kalkar
- [x] Kart havuzu, öğretmen renginde, `yerleşen/toplam` sayaçlı
- [x] Satırlar `React.memo`

## 7. Yazdırma ✅ *(göz kontrolü bekliyor)*

- [x] Sayfa başına bir sınıf / bir öğretmen, 7 sütun × 12 satır
- [x] Ne basılacağı seçimi, renkli/renksiz
- [x] `@page A4 portrait`, `page-break-after`, `print-color-adjust: exact`

## 8. Sürükle-bırak ✅ *(tarayıcı doğrulaması bekliyor)*

- [x] `src/suruk.ts` — Pointer Events
- [x] Geçerli hücreler sürükleme başında **bir kez** hesaplanıyor (0,18 ms)
- [x] `pointermove` sırasında React state güncellenmiyor
- [x] Hedef `elementFromPoint`, vurgu `classList` ile
- [x] Blok kadar hücre birden vurgulanıyor
- [x] Üst çubukta somut sebep · Esc ile iptal · `pointercancel` temizliği

## 9. Görünüm değiştirme ✅

- [x] Tek düğmeyle satır = öğretmen ⇄ satır = sınıf
- [x] Sürükleme her iki görünümde de doğru satırı hedefliyor

## 10. Kontrol sekmesi (v0.5) ✅ — 8 test

- [x] `src/fizibilite.ts` + testleri
- [x] Öğretmen: müsait saat vs yüklenen saat, kaç saat fazla
- [x] Sınıf: toplam ders saati vs toplam slot
- [x] Derslik: paylaşan sınıfların toplam saati (en çok gözden kaçan darboğaz)
- [x] Sıkışıklık uyarısı (yük > kapasite × 0,85)
- [x] Yerleşemeyenler, en sık sebebiyle
- [x] Sorun yoksa net "Sorun görünmüyor" mesajı

## 11. Genel ✅

- [x] Boş ekranlar yönlendirici ("Kurulum sekmesinden ... ekleyin")
- [x] Arayüz duman testi — beş sekme de hata vermeden çiziliyor (`App.test.tsx`)
- [x] Saat sayısı azalınca taşanlar temizleniyor, sayaçlar tutuyor (test)
- [x] Ctrl+Z tutarlı (test)
- [x] Türkçe karakterli isim değişince yerleşim bozulmuyor (anahtarlar id)

---

## Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz.

- **v0.6 Kural ayarları** — sınıf boşluğu, öğretmen boşluğu, günlük aynı ders
  sınırı; her biri Kapalı / Uyar / Engelle
- **v1 Otomatik doldurma** — MRV + forward checking backtracking, Web Worker,
  500 ms sonra pes et, tıkandığı dersi söyle
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
