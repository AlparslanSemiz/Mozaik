<img src="site/icon.svg" alt="Mozaik" width="72">

# Mozaik

A single-file tool for laying out a school's weekly timetable. It replaces aSc
Timetables for one private course in Turkey — it does about half of what aSc
does, and aims to do that half better.

**No installer. No server. No internet required.** No account, no password, no
forced update, no sign-up. The interface is in Turkish, English, German,
Spanish and French.

> Built for one person: my father, who lays out the timetable for his course by
> hand every term. Every decision in it answers to that, which is also why the
> project's own documentation is written in Turkish.

---

## Download

Everything below is a finished file — nothing to build.

| File | What to do with it |
|---|---|
| **[Mozaik.html](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.html)** | Double-click it. Opens in your browser. This is the real delivery. |
| **[Mozaik-Windows-kurulum.zip](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-Windows-kurulum.zip)** | Unzip, double-click `Kur.cmd`. Adds a desktop shortcut and a local address. |
| **[Mozaik.exe](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe)** | Double-click it. Own window, and it backs itself up to Documents. |

Or use it without downloading anything:
**<https://alparslansemiz.github.io/Mozaik/>** — it works offline after
the first visit.

These links always point at the newest release; no version number and no login
needed. Two more files sit beside them: `surum.json`, the one line the `.exe`
reads to ask whether a newer version exists, and `SHA256SUMS.txt`, so a
download can be checked (`Get-FileHash Mozaik.exe`).

### Windows will warn you, and here is exactly what it says

The `.exe` and the installer are **unsigned** — a code-signing certificate
costs money and this project does not have one. So:

* SmartScreen may say *"Windows protected your PC"*. Click **More info**, then
  **Run anyway**.
* Some browsers and antivirus tools flag unsigned installers by heuristics.
  Nothing here obfuscates or packs itself; the whole installer is two `.cmd`
  files and two PowerShell scripts you can read in `kurulum/`.
* If a scanner flags it, a false-positive report helps everyone:
  [Microsoft](https://www.microsoft.com/en-us/wdsi/filesubmission) ·
  [Google Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_error/).

## The four delivery routes

All four carry **the same page** — the same `dist/index.html`. What differs is
what is around it.

1. **The file.** `dist/index.html`, double-clicked. One file: JavaScript, CSS
   and the font are embedded in it. It opens with no network at all. Its one
   limitation is that `file://` is not an *origin*, so its stored data is
   shared with every other local HTML page in that browser.
2. **The Windows install.** `Kur.cmd` copies the program under
   `%LOCALAPPDATA%`, makes a desktop shortcut, and serves it from
   `http://dersprogrami.localhost:7654` — a ~150-line file server, no admin
   rights, no `hosts` file edit. Chrome and Edge resolve `*.localhost`
   themselves. Nothing leaves the machine.
3. **The site.** GitHub Pages, a service worker, works with the plug pulled.
4. **The `.exe`.** Tauri, WebView2, one binary. It writes every plan into
   `Documents\Ders Programı` on its own, without being asked, and it can
   update itself — but only when you press the button.

## Where the data lives

In your browser's storage, on that computer. It is **not** in the cloud and
there is no account it is attached to. "Clear browsing data" deletes it.

The program says all of this in **Ayarlar → Hakkında → "Veriler nerede"**,
naming the real storage keys and their real sizes. Two things move your work
between machines: **Dosyaya kaydet** (one plan, a `.json` file) and
**Tümünü dosyaya kaydet** (every plan, one file). The `.exe` and the Windows
install also mirror everything into a folder you choose.

Each route has its **own** storage — a file, a local site and the `.exe` do not
see each other's data. Moving between them is the same two buttons.

## Development

```bash
npm install && npx playwright install chromium   # once, on a new machine

npm run dev          # dev server
npm run tipler       # tsc, twice: src and everything outside src
npm test             # Vitest — pure logic (773 tests)
npm run build        # dist/index.html, one file — THE delivery
npm run build:site   # dist-site/ — PWA: one file + manifest + sw.js + icons
npm run test:e2e     # Playwright over file:// (560 tests)
npm run test:site    # site · local server · folder, over http (22 tests)
npm run kontrol      # all of it: types + unit + build + e2e + site + solver
npm run ekran        # screenshots in both themes -> test-results/ekran/
npm run cozucu       # full-scale solver stress (part of `kontrol`)
npm run sunucu       # local server — http://dersprogrami.localhost:7654
npm run paket        # dist-kurulum/ — the one folder that ships to Windows
```

Three more commands are **not** part of `kontrol`, because they need
toolchains this repository does not carry:

```bash
npm run font         # rebuilds the embedded font   (Python + fontTools)
npm run exe          # builds the binary            (Rust)
npm run exe:test     # the Rust side's tests        (Rust)
```

The E2E suite opens **`dist/index.html` over `file://`**, not a dev server —
the actual file that gets double-clicked. Drag and drop, the sticky column,
print overflow and colour contrast only show up there.

**If you changed something visible, do not say "done" before running
`npm run test:e2e`.**

Architecture, data model, constraints and known pitfalls live in
[CLAUDE.md](CLAUDE.md) — in Turkish, along with [docs/](docs/). That is
deliberate: it is the project's memory, and it is written in the language the
decisions were made in.

## Repository layout

Folders are named after **layers**, not topics: what decides where a file goes
is not what it is about, but what it is allowed to sit underneath. Nine files
remain at the root of `src/` and every one of them earns it.

```
src/
  App.tsx Root.tsx main.tsx        the shell
  types.ts keys.ts palette.ts      leaves — these import nothing
  raw.d.ts styles.css              project-wide
  i18n.test.ts surum.test.ts       repo scanners, not module tests

  entities/     the school's entities        + barrel index.ts
  constraints/  is this drop legal            + barrel index.ts
  schedule/     the pure timetable brain: rules · bell · blocks ·
                subjects · names · feasibility · solver
  state/        read · migrate · reduce · persist one plan
  plans/        library · bundle · chosen folder
  view/         what this MACHINE prefers. None of it enters State
  dom/          raw DOM, React never sees it (drag · gridChrome ·
                poolSplit · rowDrag)
  lists/        search / sort / filter
  i18n/         index.ts + lang/{en,de,es,fr}.ts
  version/      which copy is this, and how it updates itself
  testing/      TEST-ONLY; the app never imports it, so Vite prunes it
  components/   React, and only React
  __tests__/    tests for the two modules that stay at the root

e2e/       nine folders by what a test looks at, plus helpers.ts · kapan.ts
scripts/   root = called by name elsewhere · ikon/ = the mark · asc/ = research
```

Two conventions worth knowing before moving anything:

- **A `useX.ts` lives next to its `x.ts`**, never in a `hooks/` folder. The
  hook and the module it drives are one subject with two faces — `drag.ts`,
  `toolState.ts` and `update.ts` have them fused into a single file already.
- **The barrels are folder `index.ts` files**, so `from './constraints'` and
  `from './entities'` resolve exactly as they always did. Roughly 120 call
  sites never had to change.

The full reasoning, with the measurements behind each choice, is in
[CLAUDE.md](CLAUDE.md).

## How it is built

Vite + React + TypeScript, collapsed by `vite-plugin-singlefile` into one
`dist/index.html` with the JS, CSS and font inside it. Not one byte is fetched
at runtime, and that claim is verified **mechanically** by `temel.spec.ts` and
`site.spec.ts` rather than asserted here.

## Licence

[MIT](LICENSE). The embedded IBM Plex Sans is under the SIL Open Font
License 1.1 — see [LICENSE](LICENSE) and `scripts/font-source/OFL.txt`.
