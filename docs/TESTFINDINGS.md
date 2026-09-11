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

### 2026-09-11 · npx playwright test e2e/planlar.spec.ts · 98 "açık plan sayfa yenilenince korunuyor" ve 292 "taslak işareti kaldırılabiliyor"
Bulgu: Kod refactorunun `safely()` adımında dört işçili koşuda iki test düştü. 98'de plan seçilip sayfa yenileniyor ve seçici beklenen kimlik yerine "1" okuyor. 292'de seçicinin ikinci seçeneği hiç bulunmuyor. İkisi de bugünkü E2E tabanında geçmişti. Tek işçide ve üçer tekrarla hem o adımın derlemesinde hem değişiklikten önceki HEAD'in (`586eae6`) derlemesinde 6/6 geçti. O adımda `store.ts` ile `library.ts`'teki birebir aynı iki `safely()` tek bir yaprağa taşınmıştı, gövde değişmedi.
Tür: test kusuru, kararsız, sebebi ölçülmedi (dil.spec.ts ve öteki dört testin aynı deseni: depoya yazıp yeniledikten sonra okumak)
Ne yapıldı: TODO §8d'deki kararsız testler maddesine eklendi sayılır. Refactor bu testleri kırdı diye okunmadı.
Kalıcı kural: yok

### 2026-09-11 · npx playwright test e2e/dil.spec.ts · 70 ve 83, "beş dilin beşi de sekmeleri KENDİ dilinde çiziyor"
Bulgu: Kod refactorunun kapsülleme adımında dört işçili koşuda iki test düştü, ikisi de `chooseLang()`'ın 34. satırında: dil depoya yazılıp sayfa yenileniyor ve `<html lang>` "en" yerine "tr" okunuyor. 83 bugünkü E2E tabanında düşmemişti, 70 düşmüştü. Aynı `dist` üzerinde `--workers=1 --repeat-each=2` ile 20/20 geçti. O adımda sözlüklerin yalnız kullanılmayan `export default` satırı silindi, `dist/index.html` boyutu değişmedi ve sözlükler bundle'da duruyor.
Tür: test kusuru, kararsız, sebebi ölçülmedi (aşağıdaki kaydın aynı deseni, bir test daha)
Ne yapıldı: aşağıdaki kayıtla aynı TODO §8d maddesine eklendi sayılır. Refactor bu testleri kırdı diye okunmadı, çünkü tek işçide yeşil.
Kalıcı kural: yok

### 2026-09-11 · npm run test:e2e · e2e/surum.spec.ts 107, "Ayarlar → Hakkında güncel sürümün maddelerini gösteriyor, eskiler kapalı arşivde"
Bulgu: `panel.locator('details')` için 0 bekleniyor, 1 geliyor. Dört işçili tam koşuda düştü, `--workers=1 --repeat-each=2` ile iki kez daha düştü, yani kalıcı. Test `b0b83ed`'de (2026-08-31) "temiz bir profilde tek bir sürüm notu var" varsayımıyla yazıldı. `0df5c9d` (2026-09-01) `src/changelog.ts`'e 2.1.1 notunu ekleyince 2.1.0 kapalı arşive düştü. 2026-09-01'deki `npm run kontrol` koşusunun düşenler listesinde yok, o koşunun bu commit'ten önce mi sonra mı alındığı kayıtta yazılı değil. 2026-09-11'in `c58eda4`'ü `changelog.ts`'te yalnız bir yorum satırını değiştirdi.
Tür: test kusuru (bugünkü sayıyı adlandıran bir test, tuzak 97'nin deseni)
Ne yapıldı: TODO §8d maddesi. Kod refactor turunun tabanında bilinen kırmızı olarak duruyor.
Kalıcı kural: yok

### 2026-09-11 · npm run test:e2e · dil.spec.ts 70, izgara.spec.ts 360, kurulum.spec.ts 851, renk.spec.ts 39
Bulgu: Dördü de dört işçili tam koşuda düştü ve `--workers=1 --repeat-each=2` ile ikişer kez geçti. Ortak adımları bir değeri depoya yazıp `reopen()` ile yenilemek ve ardından okumak: `lang` "en" yerine "tr", `data-theme` "dark" yerine "light", Program'daki Havuz düğmesi ve Öğretmenler'in ilk satırı hiç bulunamadı. 2026-08-31'de de her koşuda başka dört test düşüp tek işçide geçmişti. Sebep ölçülmedi. WORKLOG "yük altında kararsız" teşhisinin iki kez sonradan bir yardımcının sessiz dönüşü çıktığını yazıyor (tuzak 92), bu yüzden burada bir teşhis yazılmıyor.
Tür: test kusuru, kararsız, sebebi ölçülmedi
Ne yapıldı: TODO §8d maddesi. Refactor turunda bu testlerden biri kırmızıya dönerse önce tek işçiyle yeniden koşulur, ve refactorun kırıp kırmadığı ancak o zaman söylenir.
Kalıcı kural: yok
