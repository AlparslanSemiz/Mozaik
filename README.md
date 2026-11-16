<div align="center">

<img src="site/icon.svg" alt="Mozaik" width="88">

# Mozaik

**A single-file tool for laying out a school's weekly timetable. Works offline, no account.**

[![Release](https://img.shields.io/github/v/release/AlparslanSemiz/Mozaik?style=flat&color=2b6cb0)](https://github.com/AlparslanSemiz/Mozaik/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-2b6cb0?style=flat)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-React-2b6cb0?style=flat)](docs/BUILD.md)

### [Try it in the browser](https://mozaik.alparslansemiz.com/)  |  [Download](#download)

</div>

## Why

My father lays out the weekly timetable for his private course in Turkey by hand every
term. Mozaik is built for that one job: enter teachers, classes and hours, let the
solver place the lessons, then fix the rest by dragging. It does about half of what aSc
Timetables does and aims to do that half better.

The interface is in Turkish, English, German, Spanish and French. The project's own
documentation under `docs/` is in Turkish on purpose, because the decisions were made
in that language.

## Features

- One HTML file: double-click it and it opens. JavaScript, CSS and the font are inside.
- Automatic timetable solver, plus drag and drop for manual fixes.
- No account, no server, no forced update. Plans are stored on your computer.
- Export one plan or all plans to a `.json` file; the `.exe` and the Windows install also
  mirror plans into a folder you choose.
- Delivered four ways from the same page: the file, a Windows install, a hosted site
  that works offline after the first visit, and a Tauri `.exe` (also Mac and Linux builds).

## Status

Version 2.2.0, built for one user. Windows is the main target; the Mac and Linux
builds are secondary. The `.exe` and the installer are unsigned, so Windows
SmartScreen will warn; [docs/INSTALL.md](docs/INSTALL.md) says exactly what to click.

## Download

These links always point at the newest release.

| File | What to do with it |
|---|---|
| **[Mozaik.html](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.html)** | Double-click it. Opens in your browser. This is the main delivery. |
| **[Mozaik-Windows-kurulum.zip](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-Windows-kurulum.zip)** | Unzip, double-click `Kur.cmd`. Adds a desktop shortcut and a local address. |
| **[Mozaik.exe](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe)** | Double-click it. Own window, and it backs itself up to Documents. |
| **[Mozaik-mac-arm64.dmg](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-mac-arm64.dmg)** | Mac with Apple silicon. Needs one extra click on first launch, see [INSTALL](docs/INSTALL.md#mac-the-first-launch-needs-one-extra-click). |
| **[Mozaik-mac-x86_64.dmg](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-mac-x86_64.dmg)** | Intel Mac. macOS 11 or later on both. |
| **[Mozaik-linux-x86_64.AppImage](https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-linux-x86_64.AppImage)** | Linux (Ubuntu 22.04+, Debian 12+, Fedora 36+). See [INSTALL](docs/INSTALL.md#linux-one-file-the-appimage). |

`SHA256SUMS.txt` sits next to the files so a download can be checked
(`Get-FileHash Mozaik.exe`). Step-by-step notes for Windows warnings, Linux, Mac, moving
plans between machines, and where the data lives are in [docs/INSTALL.md](docs/INSTALL.md).

## Tech stack

Vite, React and TypeScript, collapsed into one `dist/index.html` by
`vite-plugin-singlefile`. Radix UI for dialogs and menus, Vitest and Playwright for tests,
Tauri 2 for the desktop builds. Nothing is fetched at runtime; the end-to-end tests check
that mechanically.

## Run locally

```bash
npm install && npx playwright install chromium   # once, on a new machine

npm run dev          # dev server
npm run tipler       # type check (tsc, src and everything outside src)
npm test             # Vitest unit tests
npm run build        # dist/index.html, the single-file build
npm run test:e2e     # Playwright over file:// against dist/index.html
npm run kontrol      # everything: types, unit, build, e2e, site, solver
```

`npm run build:site`, `npm run sunucu`, `npm run paket`, `npm run exe` and the rest are
listed in [docs/BUILD.md](docs/BUILD.md). The e2e suite is heavy; run it one at a time.

## Project structure

```
src/         app source (React, solver, storage)
site/        icons, manifest and service worker for the hosted site
kurulum/     Windows installer scripts (.cmd and PowerShell)
src-tauri/   Tauri shell for the .exe, .app and AppImage
e2e/         Playwright tests
scripts/     build, release and tooling scripts
docs/        principles, architecture, data model, decisions (Turkish)
```

[CLAUDE.md](CLAUDE.md) is the index into `docs/`. Release history is in
[CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). The embedded IBM Plex Sans is under the SIL Open Font License 1.1; see
`scripts/font-source/OFL.txt`.
