**Nothing to download:** <https://alparslansemiz.github.io/ders-programi/> —
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
**[README](../../blob/main/README.md)**

---

**Kurulum (özet).** İndirin, çift tıklayın. Windows *"bilinmeyen yayıncı"*
derse **Daha fazla bilgi** → **Yine de çalıştır**. Ayrıntılı Türkçe anlatım
zip'in içindeki `OKU.txt` dosyasında, ve programın kendisi Türkçe.
