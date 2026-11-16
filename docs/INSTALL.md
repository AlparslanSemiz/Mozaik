# Install and platform notes

Details moved out of the README. The download links are in the [README](../README.md#download).

## The four delivery routes

All four carry **the same page**, the same `dist/index.html`. What differs is
what is around it.

1. **The file.** `dist/index.html`, double-clicked. One file: JavaScript, CSS
   and the font are embedded in it. It opens with no network at all. Its one
   limitation is that `file://` is not an *origin*, so its stored data is
   shared with every other local HTML page in that browser.
2. **The Windows install.** `Kur.cmd` copies the program under
   `%LOCALAPPDATA%`, makes a desktop shortcut, and serves it from
   `http://dersprogrami.localhost:7654`, a ~150-line file server, no admin
   rights, no `hosts` file edit. Chrome and Edge resolve `*.localhost`
   themselves. Nothing leaves the machine.
3. **The site.** GitHub Pages, a service worker, works with the plug pulled.
   At the live address only, it also loads Cloudflare Web Analytics: a
   cookieless visit count (page address, referrer, browser, country, load
   times), nothing from the timetable. If it cannot load, nothing changes.
4. **The `.exe`.** Tauri, WebView2, one binary. It writes every plan into
   `Documents\Ders Programı` on its own, without being asked, and it can
   update itself, but only when you press the button.


## Windows will warn you, and here is exactly what it says

The `.exe` and the installer are **unsigned**: a code-signing certificate
costs money and this project does not have one. So:

* SmartScreen may say *"Windows protected your PC"*. Click **More info**, then
  **Run anyway**.
* Some browsers and antivirus tools flag unsigned installers by heuristics.
  Nothing here obfuscates or packs itself; the whole installer is two `.cmd`
  files and two PowerShell scripts you can read in `kurulum/`.
* If a scanner flags it, a false-positive report helps everyone:
  [Microsoft](https://www.microsoft.com/en-us/wdsi/filesubmission) ·
  [Google Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_error/).

## Linux: one file, the AppImage

One file for every distribution, with its own copy of the web engine. It
needs glibc 2.35 or later (Ubuntu 22.04+, Debian 12+, Fedora 36+) and an
x86_64 machine. Updates are checked against this project's signature, as on
Windows and the Mac. In Turkish, step by step:

1. `Mozaik-linux-x86_64.AppImage`'ı indirin ve ev klasörünüzde kalacağı bir
   yere koyun, örneğin **Belgeler** ya da **Uygulamalar** diye bir klasör.
   Mozaik kendini o dosyanın yanına indirerek günceller: yazamadığınız bir
   klasörde (örneğin `/opt`) kendini güncelleyemez.
2. Dosyaya sağ tıklayın → **Özellikler** → **İzinler** → **Programı
   çalıştırmaya izin ver** (ya da uçbirimde
   `chmod +x Mozaik-linux-x86_64.AppImage`). Sonra çift tıklayın.
3. Açılmıyorsa sistemde FUSE eksiktir. Ubuntu 24.04'te
   `sudo apt install libfuse2t64`, Ubuntu 22.04 ve Debian'da
   `sudo apt install libfuse2`, Fedora'da `sudo dnf install fuse-libs`.
4. Planlar Belgeler klasörünüzdeki **Ders Programı**'na yazılır. Güncelleme
   Windows'taki gibi: **Ayarlar → Hakkında → Güncellemeleri denetle**.

## Mac: the first launch needs one extra click

The Mac app is signed only "ad hoc", not by an Apple developer account, so
macOS refuses the first launch and has to be told once that you trust it.
Updates are still checked against this project's own signature before they
are installed. In Turkish, step by step:

1. **Hangi dosya?** Apple menüsü → **Bu Mac Hakkında**. "Çip" satırında
   *Apple M…* yazıyorsa `Mozaik-mac-arm64.dmg`, "İşlemci" satırında *Intel*
   yazıyorsa `Mozaik-mac-x86_64.dmg`.
2. İndirilen `.dmg`'ye çift tıklayın, açılan pencerede **Mozaik**'i
   **Uygulamalar** klasörüne sürükleyin. Sonra dmg'yi çıkarın. Mozaik'i
   Uygulamalar'a taşımadan açarsanız kendini güncelleyemez.
3. **Uygulamalar**'dan Mozaik'e çift tıklayın. macOS *"Mozaik açılmadı"* ya
   da *"Apple, Mozaik'in kötü amaçlı yazılım içermediğini doğrulayamadı"*
   der. **Bitti**'ye basın (Çöp Sepeti'ne Taşı'ya değil).
4. Apple menüsü → **Sistem Ayarları** → **Gizlilik ve Güvenlik**. Aşağıda,
   Güvenlik başlığının altında *"Mozaik, tanınmış bir geliştiriciden
   olmadığı için engellendi"* satırı var: **Yine de Aç**'a basın, parolanızı
   ya da Touch ID'nizi verin, çıkan soruda yine **Yine de Aç** deyin.
   (macOS 11–14'te Mozaik'e sağ tıklayıp **Aç** demek de olur.)
5. Bu yalnız bir kez. İlk kayıtta Mozaik Belgeler klasörüne yazmak için izin
   ister (*"Ders Programı" klasörü*): **İzin Ver**.

Plans are written to `~/Documents/Ders Programı`, like the Windows program
writes to `Documents\Ders Programı`. Updating works as on Windows:
**Ayarlar → Hakkında → Güncellemeleri denetle**.

## Linux, from a checkout

For a machine that builds Mozaik itself (the development machine); everyone
else takes [the AppImage](#linux-one-file-the-appimage). Not a fifth route:
the same `dist/index.html`, opened in Google Chrome's app
mode with a Chrome profile of its own (`~/.local/share/mozaik/profil`), so
clearing Chrome's history does not touch the plans. Only Chrome: if it is not
installed the launcher says so and stops, because any other browser would
open an empty store.

```sh
~/dev/Mozaik/scripts/linux-kur.sh   # install, and again for every update
```

It builds from the checkout it sits in (`~/dev/Mozaik` here) and refuses unless that
checkout is on `main`, clean and not a worktree. Mozaik then appears among the applications.

**Coming from the site in Chrome?** The new copy starts empty; the plans move
with one file:

1. In the old window (the site), **Ayarlar → Planlar ve yedek → Tümünü
   dosyaya kaydet (n plan)**. Note n.
2. In the new Mozaik, **Ayarlar → Planlar ve yedek → Tümünü dosyadan aç**,
   pick that file, **Hepsini değiştir**. It should say *"n plan açıldı."*
3. Pick the folder again (same section, **Klasör seç…**) and set theme, scale
   and density by hand. Machine preferences are not in the file.
4. Keep the old copy for a week as a spare; removing it is your call.

## Where the data lives

In your browser's storage, on that computer. It is **not** in the cloud and
there is no account it is attached to. "Clear browsing data" deletes it.

The program says all of this in **Ayarlar → Hakkında → "Veriler nerede"**,
naming the real storage keys and their real sizes. Two things move your work
between machines: **Dosyaya kaydet** (one plan, a `.json` file) and
**Tümünü dosyaya kaydet** (every plan, one file). The `.exe` and the Windows
install also mirror everything into a folder you choose.

Each route has its **own** storage: a file, a local site and the `.exe` do not
see each other's data. Moving between them is the same two buttons.
