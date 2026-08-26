# DESIGN.md — envanter (yeniden yazılacak)

> **2026-08-26: bu dosya boşaltıldı.** Eski hâli bir **sözleşmeydi**: hangi
> token merdiveni var, hangi basamak yasak, yeni bir primitif eklemeden önce
> nerede tartışılır. Kullanıcı kararıyla tasarım kısıtları kaldırıldı, o yüzden
> sözleşme kısmı silindi.
>
> Yeni arayüz yazıldıktan sonra bu dosya **envanter** olarak yeniden
> doldurulacak: hangi sınıf var, ne yapıyor, hangi ekranda. Amacı yalnız
> *var olanı yeniden icat etmemek* olacak — bir şeyi yasaklamayacak.
>
> Ara dönemde tek doğru kaynak [../src/styles.css](../src/styles.css).

## Yürürlükteki tek kurallar

Bunlar tasarım değil; [../CLAUDE.md](../CLAUDE.md) → **"Tasarım — serbest"**
bölümünde gerekçeleriyle duruyor:

1. **İşlevsel renk kanalı** — yeşil bırakılabilir · sarı uyarı · kırmızı engel ·
   gri taralı kapalı. `src/palette.test.ts` + `e2e/renk.spec.ts` ölçer.
2. **Erişilebilirlik** — AA kontrast, görünür odak, `aria-live`, renk tek başına
   durum taşımaz, ekranda 12 px alt sınır. Hedef kullanıcı zor görüyor.
3. **Kâğıt fiziksel** — A4 yatay, `@page { margin: 0 }`, sayfa 205 mm sabit,
   `--ui-scale` kâğıda geçmez.
4. **İlke 1–3** — çift tıkla çalışır, sunucu yok, çalışma anında ağa çıkmaz.

## Depolanan makine tercihleri

Hiçbiri `State`'e girmez, hiçbiri `schemaVersion`'ı ilgilendirmez.

| Anahtar | Ne |
|---|---|
| `ders-programi-tema` | açık / koyu |
| `ders-programi-olcek` | `--ui-scale` |
| `ders-programi-yogunluk` | ızgara yoğunluğu |
| `ders-programi-havuz` · `-havuz-boy` | havuz çekmecesi açık mı, boyu (rem) |
| `ders-programi-serit` | araç şeridi açık mı |
| `ders-programi-kenar` | (tarihsel) kenar çubuğu tercihi |
