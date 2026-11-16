**Nothing to download:** <https://mozaik.alparslansemiz.com/> —
no installer, works offline after the first visit, and fixes arrive there by
themselves.

The three files below are the **same** program, for anyone who wants a copy
that lives on the machine.

| Download | What to do with it |
|---|---|
| **Mozaik.html** | Double-click it. Opens in your browser. No installer, no internet |
| **Mozaik-Windows-kurulum.zip** | Unzip it, double-click `Kur.cmd`. You get a desktop shortcut |
| **Mozaik.exe** | Double-click it. Own window, and it backs itself up to Documents |

`SHA256SUMS.txt` is beside them, so a download can be checked:
`Get-FileHash Mozaik.exe`. `surum.json` is not a program — it is the one line
the `.exe` reads to ask whether a newer version exists.

**Windows will warn you.** These files are unsigned, so SmartScreen may say
*"unknown publisher"*: click **More info**, then **Run anyway**. The warning is
about the missing signature, not about what is in the file.

**Updating.** The site updates itself and tells you. In the Windows install,
`Guncelle.cmd` fetches the newest version. The `.exe` can update itself too —
**Ayarlar → Hakkında → Güncellemeleri denetle** — but never on its own: until
you press that button it connects nowhere. The `.html` does not update itself;
download the new one over the old one.

Which version you are on is written in **Ayarlar → Hakkında**.

Step-by-step install, update and removal:
**[docs/INSTALL.md](https://github.com/AlparslanSemiz/Mozaik/blob/main/docs/INSTALL.md)**

---

**Mac.** `Mozaik-mac-arm64.dmg` is for Apple silicon (M1 and later),
`Mozaik-mac-x86_64.dmg` for Intel; macOS 11 or later. The app is not signed
by an Apple developer account, so the first launch needs one extra click
(below). The two `.app.tar.gz` files are what the Mac app downloads when it
updates itself; you do not need them.

**Kurulum (özet).** İndirin, çift tıklayın. Windows *"bilinmeyen yayıncı"*
derse **Daha fazla bilgi** → **Yine de çalıştır**. Mac'te dmg'yi açıp
Mozaik'i **Uygulamalar**'a sürükleyin ve oradan açın; macOS *"doğrulanamadı"*
derse **Bitti**, sonra **Sistem Ayarları → Gizlilik ve Güvenlik → Yine de
Aç**. Bu yalnız ilk açılışta. Ayrıntılı Türkçe anlatım
zip'in içindeki `OKU.txt` dosyasında, ve programın kendisi Türkçe.
