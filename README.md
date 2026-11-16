<img src="site/icon.svg" alt="Mozaik" width="72">

# Mozaik

A single-file tool for laying out a school's weekly timetable. It replaces aSc
Timetables for one private course in Turkey. It does about half of what aSc
does, and aims to do that half better.

**No installer. No server. No internet required.** No account, no password, no
forced update, no sign-up. The interface is in Turkish, English, German,
Spanish and French.

> Built for one person: my father, who lays out the timetable for his course by
> hand every term. Every decision in it answers to that, which is also why the
> project's own documentation is written in Turkish.

---

## Download

Everything below is a finished file. Nothing to build.

| File | What to do with it |
|---|---|
| **[Mozaik.html](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.html)** | Double-click it. Opens in your browser. This is the real delivery. |
| **[Mozaik-Windows-kurulum.zip](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-Windows-kurulum.zip)** | Unzip, double-click `Kur.cmd`. Adds a desktop shortcut and a local address. |
| **[Mozaik.exe](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe)** | Double-click it. Own window, and it backs itself up to Documents. |
| **[Mozaik-mac-arm64.dmg](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-mac-arm64.dmg)** | Mac with Apple silicon (M1 and later). Drag Mozaik into Applications. Read [the first launch](#mac-the-first-launch-needs-one-extra-click) first. |
| **[Mozaik-mac-x86_64.dmg](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-mac-x86_64.dmg)** | The same, for an Intel Mac. macOS 11 or later on both. |
| **[Mozaik-linux-x86_64.AppImage](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-linux-x86_64.AppImage)** | Linux (Ubuntu 22.04 and later, Debian 12, Fedora). One file, updates itself. Read [Linux](#linux-one-file-the-appimage) first. |

Or use it without downloading anything:
**<https://alparslansemiz.github.io/Mozaik/>** works offline after
the first visit.

These links always point at the newest release; no version number and no login
needed. Two more files sit beside them: `surum.json`, the one line the `.exe`
reads to ask whether a newer version exists, and `SHA256SUMS.txt`, so a
download can be checked (`Get-FileHash Mozaik.exe`).

### Windows will warn you, and here is exactly what it says

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

### Linux: one file, the AppImage

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

### Mac: the first launch needs one extra click

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
4. **The `.exe`.** Tauri, WebView2, one binary. It writes every plan into
   `Documents\Ders Programı` on its own, without being asked, and it can
   update itself, but only when you press the button.

### Linux, from a checkout

For a machine that builds Mozaik itself (the development machine); everyone
else takes [the AppImage](#linux-one-file-the-appimage). Not a fifth route:
the same `dist/index.html`, opened in Google Chrome's app
mode with a Chrome profile of its own (`~/.local/share/mozaik/profil`), so
clearing Chrome's history does not touch the plans. Only Chrome: if it is not
installed the launcher says so and stops, because any other browser would
open an empty store.

```sh
~/GitHub/Mozaikler/Mozaik/scripts/linux-kur.sh   # install, and again for every update
```

It builds from `~/GitHub/Mozaikler/Mozaik` and refuses unless that checkout is on `main`
and clean. Mozaik then appears among the applications.

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

## Development

```bash
npm install && npx playwright install chromium   # once, on a new machine

npm run dev          # dev server
npm run tipler       # tsc, twice: src and everything outside src
npm test             # Vitest: pure logic (719 tests)
npm run build        # dist/index.html, one file, THE delivery
npm run build:site   # dist-site/: PWA, one file + manifest + sw.js + icons
npm run test:e2e     # Playwright over file:// (512 tests)
npm run test:site    # site · local server · folder, over http (22 tests)
npm run kontrol      # all of it: types + unit + build + e2e + site + solver
npm run ekran        # screenshots in both themes -> test-results/ekran/
npm run cozucu       # full-scale solver stress (part of `kontrol`)
npm run sunucu       # local server at http://dersprogrami.localhost:7654
npm run paket        # dist-kurulum/: the one folder that ships to Windows
```

Three more commands are **not** part of `kontrol`, because they need
toolchains this repository does not carry:

```bash
npm run font         # rebuilds the embedded font   (Python + fontTools)
npm run exe          # builds the binary            (Rust)
npm run exe:test     # the Rust side's tests        (Rust)
```

The E2E suite opens **`dist/index.html` over `file://`**, not a dev server:
the actual file that gets double-clicked. Drag and drop, the sticky column,
print overflow and colour contrast only show up there.

**If you changed something visible, do not say "done" before running
`npm run test:e2e`.**

Principles, architecture, data model, constraints, known pitfalls and the
decision log live in [docs/](docs/), with [CLAUDE.md](CLAUDE.md) as the index.
They are written in Turkish, and that is deliberate: they are the project's
memory, kept in the language the decisions were made in. The release history is
in [CHANGELOG.md](CHANGELOG.md).

## How it is built

Vite + React + TypeScript, collapsed by `vite-plugin-singlefile` into one
`dist/index.html` with the JS, CSS and font inside it. Not one byte is fetched
at runtime, and that claim is verified **mechanically** by `temel.spec.ts` and
`site.spec.ts` rather than asserted here.

## Licence

[MIT](LICENSE). The embedded IBM Plex Sans is under the SIL Open Font
License 1.1. See [LICENSE](LICENSE) and `scripts/font-source/OFL.txt`.
