# Plan · Elle düzeltme ve soru çözüm saatleri

Tarih: 2026-11-16. Durum: **plan, kod yok.** Kaynak: Alp'in aktardığı babanın iki alışkanlığı.
Bu dosya işin niçinini ve önerilen yolu tutar; uygulamaya geçerken maddeler [TODO.md](TODO.md)'ye
numaralı olarak taşınır, verilen kararlar [DECISIONS.md](DECISIONS.md)'ye yazılır.

## Babanın gerçek akışı

1. Veriyi girer, programı otomatik dizer.
2. Çıkan programda **elle** bir şeyleri değiştirir, ayarlar, düzeltir.
3. Ders programı oturduktan sonra öğretmenlere **soru çözüm saatleri** ekler.
4. Öğrenciler (sınıf programı) soru çözümü **görmez**; öğretmenler kendi programlarında
   soru çözümlü hâlini görür.

Bugün 2. adım çalışıyor ama kırılgan, 3. ve 4. adım Mozaik'te hiç yok (baba bunları ya Mozaik
dışında ya da kâğıt üstünde yapıyor olmalı; Alp'e sorulacak, aşağıda S1).

Hedef: **bu iki adım baba için Mozaik'teki en kolay iş olsun.** PRINCIPLES "daha az yazı, daha
az soru" burada da geçerli: yeni ekran yok, yeni sekme yok, var olan ızgaranın üstünde iş görülür.

---

## A · Elle düzeltme kolay ve güvenli olsun

### Bugün ne var

- Sürükle bırak, takas, havuza düşürme, tek geri al adımı (`drop.ts`, `applyDrop`).
- Kart üstünde sabitleme ve "Tüm programı sabitle" (K7'den sonra kalanlar).
- `Yeniden yap` sabitlenenleri yerinde bırakır.

### Sorun

Babanın elle yaptığı düzeltme, sabitlemeyi ayrıca hatırlamazsa, bir sonraki `Yeniden yap` ya da
`Baştan diz`de kaybolabilir. Baba "ben bunu düzeltmiştim" der ve güveni gider. Ayrıca bir
taşıma reddedildiğinde (öğretmen o saatte başka sınıfta) ne yapacağını kendisi bulmak zorunda.

### Önerilen

- **A1 · Elle konan ders kendiliğinden sabitlenir.** Sürükleyip bırakılan ya da takasla yer
  değiştiren her blok bırakıldığı yerde sabitli olur. Kartta sabitleme işareti görünür, tek
  tıkla kalkar. Ayrı bir "elle" bayrağı yerine var olan `pinned` kullanılır: şema değişmez, tek
  kilit kavramı kalır. (Karar S2: kendiliğinden mi, yoksa bıraktıktan sonra küçük bir
  "Sabitle?" bildirimi mi. Öneri: kendiliğinden, bildirimde "Geri al" ile.)
- **A2 · "Kalanı diz" her zaman elle yapılanı korur.** `Yeniden yap` / `Baştan diz` ayrımı
  babaya tek bir söz olarak görünür: "Benim yaptıklarıma dokunmadan kalanı diz". Bunun dışında
  her şeyi silen yol yalnız Dosya ▾ altında, geri alınabilir (SD1 çizgisinde).
- **A3 · Reddedilen taşımada tek adımlık çözüm önerisi.** "Ali Bey o saatte 9A'da" cümlesinin
  yanında, varsa, **"9A'daki dersini şuraya kaydırıp buraya koy"** gibi tek tıklık bir yol.
  Öneri araması zaten var (iki çekirdekte); burada yalnız tek blokluk, iki hamlelik zincir
  aranır, bulunamazsa bir şey gösterilmez. Hamle tek geri al adımı.
- **A4 · Ne değişti görünür.** Program başlığında küçük bir sayı: "12 elle değişiklik".
  Tıklanınca o hücreler bir an vurgulanır. Ayrı ekran yok. (İsteğe bağlı, A1–A3'ten sonra.)
- **A5 · Babanın tekrar eden düzeltmeleri kurala dönsün.** Babanın bir oturumu izlenir
  (WORKLOG "Alp'te bekleyenler" 4) ve en sık yaptığı 3–5 düzeltme yazılır. Her hafta aynı
  düzeltmeyi yapıyorsa (ör. "Ahmet Bey cuma son saat girmesin") bu bir Müsaitlik ya da kural
  eksikliği: düzeltme yerine çözücü bunu baştan doğru yapar. Bu madde ölçüm, kod değil.

K7'ye dokunulmaz: toplu sabitleme ve geçici görünüm geri gelmez.

---

## B · Soru çözüm saatleri

### Ne

Ders programı oturduktan sonra bir öğretmenin boş saatine konan, **ders sayılmayan** bir saat.
Öğretmenin programında ve öğretmene giden kâğıtta görünür, sınıf (öğrenci) programında görünmez.

### Veri (öneri, şema v20)

Ders değil, ayrı bir katman. Sebep: `Lesson`'un haftalık saati, blokları, günlük sınırı var ve
çözücü onu yerleştirir; soru çözümünü çözücü yerleştirmez, baba elle koyar.

```
ProgramVariant {
  …
  study: Record<`${teacherId}|${day}|${hour}`, { classId: string | null }>
}
```

- Program alternatifine (variant) ait, yerleşim ve sabitleme gibi: ayrı bir seçenek denenince
  soru çözümleri de onunla gider.
- `classId` isteğe bağlı: soru çözümü belli bir sınıfa mı, yoksa açık mı (S3).
- Gün ya da saat silinince taşan anahtarlar `placements` gibi silinir (tuzak 5), önce sayılıp
  sorulur.
- Göç: v19 → v20 boş sözlük. DATA.md şema tablosuna satır.

### Kurallar

- **B1 · Soru çözümü öğretmeni meşgul eder.** O saate öğretmenin dersi sürüklenemez; ret
  cümlesi "Ali Bey o saatte soru çözümünde" der. Çözücü (`Kalanı diz`) soru çözüm saatini
  öğretmenin kapalı saati gibi okur, böylece sonradan yeniden dizmek soru çözümünü ezmez.
- **B2 · Sınıfı meşgul etmez** (S3'e bağlı). Öğrenci programında o saat boş görünür.
- **B3 · Günlük/haftalık ders sınırına sayılmaz** (S4: baba sayılmasını isterse ayrı bir sınır).
- **B4 · Var olan bir derse soru çözümü konamaz**, öğretmen o saatte zaten derste.

### Ekleme kolay olmalı

- **B5 · Öğretmen görünümünde boş hücreye tık → "Soru çözüm ekle".** Tek tık, soru yok.
  Hücre başka renk ve "SÇ" yazısıyla görünür. Aynı yerde tekrar tık → kaldır (geri alınabilir).
- **B6 · Toplu ekleme tek hareket:** sağ tıkta "Bu saati her gün soru çözüm yap" ve
  "Bu öğretmenin boş saatlerini göster" (yalnız boşları vurgular, baba tıklayarak seçer).
  Toplu sabitlemenin kalkma sebebi (K7) burada geçerli değil, çünkü bu bir kilit değil bir ekleme;
  yine de babayla denenmeden ikinci madde yazılmaz.
- **B7 · Sınıf görünümünde soru çözümü yoktur;** ızgara sınıf gösterirken bu katmanı çizmez.
  Öğretmen görünümünde varsayılan açık.

### Çıktılar

- **B8 · Öğretmen kâğıdı ve "Öğretmene gönder" (PDF, WhatsApp, e-posta)** soru çözümünü içerir,
  ayrı biçimde ("Soru çözüm", gerekirse sınıf adı).
- **B9 · Sınıf kâğıdı, okul geneli sınıf çizelgesi ve öğrenciye giden her şey içermez.**
  Bunu bir testle sabitle: sınıf çıktısının HTML'inde "Soru çözüm" geçmez.
- **B10 · Okul geneli öğretmen çizelgesi** içerir (müdür/baba görür). Eyotek'e giden biçim S5.

### İkame ile ilişkisi (sonra)

Gelmeyen öğretmenin soru çözümü "Bugün kim yok?" listesinde ayrı satır olarak görünür, ikame
istemez (boş geçebilir). İlk sürümde yalnız görünür, atama yok.

---

## Açık sorular (Alp'e / babaya)

- **S1** Baba soru çözüm saatlerini bugün nerede tutuyor (Excel, kâğıt, Roboders)? Örnek bir
  öğretmen kâğıdı fotoğrafı `docs/Örnek Fotolar/`'a gelirse biçim ondan alınır.
- **S2** Elle taşınan ders kendiliğinden sabitlensin mi? (Öneri: evet.)
- **S3** Soru çözümü belli bir sınıfa mı ait, yoksa öğretmenin açık saati mi? Sınıfa aitse o
  sınıfın öğrencileri de mi görmesin? (İstek "öğrenciler görmez" diyor; öneri: sınıf alanı
  isteğe bağlı, öğrenciye hiçbir durumda çıkmaz.)
- **S4** Soru çözümü öğretmenin günlük/haftalık ders sayısına girer mi, ücret hesabı var mı?
- **S5** Eyotek'e giden öğretmen programında soru çözümü olmalı mı?

## Sıra

1. S1–S3 cevabı (Alp babaya sorar).
2. **A1 + A2** (küçük, şema yok, güveni hemen artırır).
3. **B veri + B1 + B4 + B5 + B7 + B9** (çekirdek: ekle, kaldır, öğrenciye çıkmaz).
4. **B8 + B10** (çıktılar), sonra **B6**.
5. **A3**, sonra **A4**; **A5** babayı izleme oturumuyla birlikte.

Her adım kendi dalında, PR ve squash merge ile; e2e testi babanın akışını (diz → elle düzelt →
kalanı diz → düzeltme yerinde) ve öğrenciye sızmamayı (B9) kapsar.
