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

Henüz kayıt yok.
