//! The .exe checking whether a newer one exists, and replacing itself with it.
//!
//! WHAT THIS IS NOT. It is not an updater in the sense the double-click principle forbids:
//! nothing here runs on its own. There is no timer, no check at startup, no
//! background thread. Every one of the three commands below runs because
//! somebody pressed a button in Ayarlar, and the three are separate buttons on
//! purpose: look, download, restart. My father can stop after any of them and
//! keep working on the version he has.
//!
//! WHY IT REACHES THE NETWORK AT ALL. The offline principle is about the running
//! program: the page fetches nothing, and that is checked mechanically on the
//! file:// build. An update path is the exception the installation script
//! already wrote down in kurulum/kur.ps1 -- the program does not connect, an
//! update does, because connecting is the whole job. With no internet the only
//! outcome is one sentence on screen; nothing else in the program changes.
//!
//! WHY THE PAGE SENDS ITS OWN VERSION. `check_update` takes `current` as an
//! argument rather than reading `CARGO_PKG_VERSION`. package.json is the one
//! source of the number (scripts/surum.mjs presses it into the bundle as
//! `__SURUM__`), and a second number compiled in here would be a second
//! answer to "which build is this" -- the exact drift `surum.test.ts` exists
//! to stop.

use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;

/// Everything this file is allowed to fetch lives under here.
///
/// The manifest arrives over TLS from GitHub, so the URL inside it is already
/// ours. Pinning the prefix anyway costs one comparison and closes the only
/// way a bad manifest could turn into a download from somewhere else.
///
/// THERE ARE TWO OF THEM, AND THAT IS THE FIX FOR A REAL BREAKAGE. The
/// repository was renamed `ders-programi` -> `Mozaik`, and this constant is
/// COMPILED INTO every copy already out there: the published v2.0.2 knows only
/// the old name, the manifest published after the rename carries the new one,
/// and `Beklenmeyen adres: ...` is what my father got when he pressed
/// "Güncellemeleri denetle". A copy cannot be taught a new prefix after the
/// fact -- so the list is what a copy built from HERE accepts, and the address
/// in the manifest stays on the OLD name (surum.yml says why), which GitHub
/// still 301s to the new one. Measured 2026-08-31:
/// `ders-programi/releases/latest/download/surum.json` -> 301 -> `Mozaik/...`
///
/// Both entries are the same GitHub account, so neither name can be taken by
/// anybody else. Adding a name here is cheap; removing one strands whatever
/// copy was built with it.
const RELEASE_KOKLERI: [&str; 2] = [
    "https://github.com/AlparslanSemiz/Mozaik/releases/",
    "https://github.com/AlparslanSemiz/ders-programi/releases/",
];

/// Where the newest build always announces itself. `latest/download/` needs no
/// version number, no token and no API quota; it is a redirect GitHub keeps
/// pointed at the newest release.
const MANIFEST_URL: &str =
    "https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/surum.json";

/// THE UPGRADE GATE'S TEST EXE ONLY: a local server in place of both of the
/// above, given at COMPILE time (`MOZAIK_TEST_GUNCELLEME_KOKU`, e.g.
/// `http://127.0.0.1:8765/`). `.github/workflows/guncelleme-windows.yml`
/// builds the old copy with it, so that copy finds, downloads, checks and
/// swaps in the new one through this very file, from a machine with no
/// release. The released exe is built without it, and `kontrat.test.ts`
/// asks surum.yml never to set it: with it, a copy would fetch from wherever
/// the variable said.
const TEST_KOKU: Option<&str> = option_env!("MOZAIK_TEST_GUNCELLEME_KOKU");

/// A test root is loopback and a directory, or the build fails: an empty
/// value would make `safe_url` accept any address, a missing `/` would glue
/// `surum.json` onto the port. So even a value that leaked into a build could
/// only ever fetch from this machine.
const fn yerel_kok_mu(b: &[u8]) -> bool {
    let on = b"http://127.0.0.1:";
    if b.len() <= on.len() || b[b.len() - 1] != b'/' {
        return false;
    }
    let mut i = 0;
    while i < on.len() {
        if b[i] != on[i] {
            return false;
        }
        i += 1;
    }
    b[on.len()].is_ascii_digit()
}

const _: () = match TEST_KOKU {
    Some(kok) => assert!(
        yerel_kok_mu(kok.as_bytes()),
        "MOZAIK_TEST_GUNCELLEME_KOKU http://127.0.0.1:<port>/ biçiminde olmalı"
    ),
    None => {}
};

/// The prefixes this build fetches from: the two releases, or the gate's
/// local server and nothing else.
fn kokler() -> Vec<&'static str> {
    match TEST_KOKU {
        Some(kok) => vec![kok],
        None => RELEASE_KOKLERI.to_vec(),
    }
}

fn manifest_url() -> String {
    match TEST_KOKU {
        Some(kok) => format!("{kok}surum.json"),
        None => MANIFEST_URL.to_string(),
    }
}

/// Suffixes hung on the running program's own file name. Appended rather than
/// swapped into the extension: `Mozaik.exe.yeni` cannot be double-clicked by
/// accident, `Mozaik.yeni.exe` can.
///
/// "The running program's OWN file name" is what makes the rename to Mozaik
/// harmless for copies already out there: a machine holding
/// `Mozaik.exe` downloads whatever the manifest points at and swaps it
/// into its own name. The file keeps the old name; the program inside it is
/// the new one.
const YENI: &str = "yeni";
const ESKI: &str = "eski";

/// Only the Windows build may replace itself.
///
/// The manifest names ONE download, `Mozaik.exe`, and `verify()` asks whether
/// the bytes are a Windows program -- which they are. A Linux build (made on
/// the development machine to drive the real window, never shipped) would pass
/// that check, rename the Windows program over its own ELF file and leave
/// nothing that starts. The check is on the platform, not on the file.
pub fn self_update_here() -> Result<(), String> {
    if cfg!(windows) {
        Ok(())
    } else {
        Err("Kendini güncelleme yalnız Windows'taki Mozaik.exe'de var.".to_string())
    }
}

/// Whether this copy can replace itself, for the About panel to say the right
/// thing: the Linux build would otherwise promise an update it then refuses.
#[tauri::command]
pub fn self_update_supported() -> bool {
    self_update_here().is_ok()
}

/// What the workflow publishes next to the three delivery files.
///
/// Turkish `boyut` beside English field names is deliberate and matches the
/// rest of the project: this is a file a person reads and edits, like the
/// backup file names, not an internal identifier.
#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
pub struct Manifest {
    pub version: String,
    pub date: String,
    pub exe: String,
    pub boyut: u64,
    /// The exe's SHA-256, lowercase hex (surum.yml, from the same file it
    /// publishes). Optional to READ, because every manifest published before
    /// 2026-10-24 lacks it and a copy must still be told it is up to date;
    /// required to DOWNLOAD (`karar`, `verify`).
    #[serde(default)]
    pub sha256: Option<String>,
    /// The installer (`Mozaik-Kurulum.exe`), from the release that started
    /// shipping one (DECISIONS 2026-11-15). Optional, and that is the bridge:
    /// copies built before it never heard of the field, serde skips it, and they
    /// go on swapping in the standalone `exe` above -- which is the new version
    /// and offers the installer the next time somebody presses the button.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum_boyut: Option<u64>,
    /// The installer's SHA-256, like `sha256` for the standalone one. All three
    /// installer fields or none: `karar` offers the installer only with all.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum_sha256: Option<String>,
    /// The minisign signatures of `exe` and of the installer (surum.yml signs
    /// both with the release key; `IMZA_ANAHTARI` below is its public half).
    /// A digest from the same release says the file arrived whole; only a
    /// signature says it is ours (security review, 2026-11-15).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub imza: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum_imza: Option<String>,
}

/// The answer the settings panel draws.
#[derive(serde::Serialize, Clone, Debug)]
pub struct Cevap {
    /// Whether the published version is newer than the one asking.
    pub yeni_var: bool,
    pub version: String,
    pub date: String,
    pub exe: String,
    pub boyut: u64,
    pub sha256: Option<String>,
    /// `exe` is the installer, not the standalone program. The page does not
    /// need to know -- `download_update` reads the same thing off the address --
    /// but the About panel may say it.
    pub kurulum: bool,
    /// The chosen file's minisign signature, handed back to `download_update`.
    pub imza: Option<String>,
    /// Not a new version: the SAME one, as the installer, offered to a
    /// standalone copy (`windows_karari` says why). `yeni_var` stays false.
    pub gecis: bool,
}

// --------------------------------------------------------------- pure parts
//
// Everything below this line is testable without a network and without Tauri,
// and `cargo test` is the only thing that can judge it: no browser can reach
// a rename.

/// Semver core, as NUMBERS.
///
/// The string compare this replaces gets "1.10.0" wrong -- it sorts before
/// "1.9.0" -- and that is not a hypothetical: this program is on 1.x and ships
/// a release per feedback round. A pre-release suffix is dropped ("0.0.0-dev",
/// what a build without `__SURUM__` reports) so a dev build still compares.
fn parse(v: &str) -> Option<Vec<u64>> {
    let core = v.split(['-', '+']).next()?;
    if core.is_empty() {
        return None;
    }
    core.split('.').map(|p| p.parse::<u64>().ok()).collect()
}

/// Is `aday` a newer version than `simdiki`?
///
/// Anything that does not parse answers NO. Refusing beats guessing here: a
/// wrong yes offers my father a download that is not an upgrade, and he has no
/// way to tell.
pub fn is_newer(aday: &str, simdiki: &str) -> bool {
    let (Some(a), Some(b)) = (parse(aday), parse(simdiki)) else {
        return false;
    };
    // Missing fields are zeros, so "1.3" and "1.3.0" are the same version.
    for i in 0..a.len().max(b.len()) {
        let x = a.get(i).copied().unwrap_or(0);
        let y = b.get(i).copied().unwrap_or(0);
        if x != y {
            return x > y;
        }
    }
    false
}

/// Nothing is fetched from outside our own releases.
///
/// The prefix is checked on the address as the HTTP client will send it, not
/// as written: `.../releases/../../other/repo/...` and its `%2e%2e` spelling
/// start with our prefix and resolve to somebody else's files (security
/// review, 2026-11-15). Parsing normalises the dot segments first.
pub fn safe_url(url: &str) -> Result<(), String> {
    let hata = || format!("Beklenmeyen adres: {url}");
    // Normalised first: `.../releases/../../other/repo/...` and its `%2e%2e`
    // spelling start with our prefix and resolve to somebody else's files
    // (security review, 2026-11-15).
    let parsed = reqwest::Url::parse(url).map_err(|_| hata())?;
    let normal = parsed.as_str();
    if !kokler().iter().any(|kok| normal.starts_with(kok)) {
        return Err(hata());
    }
    // The published copy: GitHub over TLS and nothing else. The test copy's
    // root (TEST_KOKU) is a loopback server and is checked by the prefix alone.
    if TEST_KOKU.is_none()
        && (parsed.scheme() != "https"
            || parsed.host_str() != Some("github.com")
            || parsed.port().is_some()
            || !parsed.username().is_empty()
            || parsed.password().is_some())
    {
        return Err(hata());
    }
    Ok(())
}

/// Where a person can always get the new version by hand.
///
/// Derived from the pinned prefix rather than written out again: the address
/// is on screen in three places already and a fourth copy is a fourth chance
/// to be wrong.
fn releases_sayfasi() -> String {
    format!("{}latest", RELEASE_KOKLERI[0])
}

/// The answer, decided from a manifest that has already arrived.
///
/// Split out from `check_update` so `cargo test` can judge it -- no network,
/// no Tauri -- because the rule below is the one that turned a repository
/// rename into an error on a copy that had nothing to download:
///
/// THE ADDRESS IS ONLY A QUESTION WHEN THERE IS SOMETHING TO FETCH. An up to
/// date copy is told it is up to date, whatever the manifest points at; the
/// gate that actually protects the download is the first line of
/// `download_update`, and it stays there. And when there IS a new version
/// behind an address this build does not recognise, the sentence says so and
/// says where to go -- a copy too old to update itself can still be replaced
/// by hand, and `Beklenmeyen adres: https://...` never told anybody that.
pub fn karar(m: Manifest, current: &str) -> Result<Cevap, String> {
    windows_karari(m, current, tek_basina())
}

/// Is this the standalone Windows exe, not the installed program? Only it is
/// offered the move to the installer.
fn tek_basina() -> bool {
    cfg!(windows)
        && std::env::current_exe()
            .map(|exe| !kurulu_mu(&exe))
            .unwrap_or(false)
}

/// `karar` for a copy that is (`tek_basina`) or is not the standalone exe.
///
/// THE MOVE TO THE INSTALLER IS OFFERED AT THE SAME VERSION (2026-11-16). The
/// published 2.2.0 reads only `exe` and `boyut`, so it swaps in the standalone
/// program of the release that ships the installer, and that copy then finds
/// itself up to date: by version number alone the installer, and CP-SAT with
/// it, would never reach my father. So a standalone copy is offered the
/// installer of its own version (`gecis`), signed and checked exactly like an
/// update. An installed copy at the same version is up to date as before.
pub fn windows_karari(m: Manifest, current: &str, tek_basina: bool) -> Result<Cevap, String> {
    let yeni_var = is_newer(&m.version, current);
    // A download this copy cannot check is not offered either: no address of
    // ours, or no digest to hold the file against.
    if yeni_var && (safe_url(&m.exe).is_err() || m.sha256.is_none()) {
        return Err(format!(
            "Yeni sürüm ({}) yayımlandı, ama bu kopya onu kendi indiremiyor.\n\
             Şu adresten indirip eskisinin üzerine koyabilirsiniz:\n{}",
            m.version,
            releases_sayfasi()
        ));
    }
    // The installer when the release has one this copy may fetch, otherwise the
    // standalone program exactly as before. A manifest whose installer address
    // is not ours is not an error: the standalone one still updates the copy.
    let kurulum = match (m.kurulum, m.kurulum_boyut, m.kurulum_sha256) {
        (Some(url), Some(boyut), Some(ozet)) if kurulum_mu(&url) && safe_url(&url).is_ok() => {
            Some((url, boyut, ozet, m.kurulum_imza))
        }
        _ => None,
    };
    // The same version, never an older one; and only an installer this copy
    // would install (signed, unless this is the test copy).
    let gecis = !yeni_var
        && tek_basina
        && !is_newer(current, &m.version)
        && parse(&m.version).is_some()
        && parse(current).is_some()
        && kurulum
            .as_ref()
            .is_some_and(|k| k.3.is_some() || TEST_KOKU.is_some());
    let (exe, boyut, sha256, kurulum, imza) = match kurulum {
        Some((url, boyut, ozet, imza)) => (url, boyut, Some(ozet), true, imza),
        None => (m.exe, m.boyut, m.sha256, false, m.imza),
    };
    // A published copy installs nothing it cannot check the signature of. The
    // test copy (TEST_KOKU) is fed by a local server and has no release key.
    if yeni_var && imza.is_none() && TEST_KOKU.is_none() {
        return Err(format!(
            "Yeni sürüm ({}) yayımlandı, ama imzası yok; bu kopya onu kendi kurmuyor.\n\
             Şu adresten indirip eskisinin üzerine koyabilirsiniz:\n{}",
            m.version,
            releases_sayfasi()
        ));
    }
    Ok(Cevap {
        yeni_var,
        version: m.version,
        date: m.date,
        exe,
        boyut,
        sha256,
        kurulum,
        imza,
        gecis,
    })
}

// ------------------------------------------------------------- the installer
//
// From 2026-11-15 a release carries an installer beside the standalone exe
// (DECISIONS: the CP-SAT libraries are files next to the program, and a
// wizard puts files in place the way Windows expects). The data does NOT move:
// WebView2 keeps it under %LOCALAPPDATA%\<identifier>, which is the same for
// both (DATA.md, "Değişmeyen kimlikler"), and the uninstaller's "delete app
// data" box is switched off in nsis/kancalar.nsh.

/// The installer's published file name. `surum.yml` publishes it under exactly
/// this name, and the address is how `download_update` tells the two apart.
pub const KURULUM_ADI: &str = "Mozaik-Kurulum.exe";

/// Is this address the installer rather than the standalone program?
pub fn kurulum_mu(url: &str) -> bool {
    url.rsplit('/').next() == Some(KURULUM_ADI)
}

/// Was this program put here by the installer? The installer writes its
/// uninstaller into the same folder, and nothing else does.
pub fn kurulu_mu(exe: &Path) -> bool {
    exe.parent()
        .map(|d| d.join("uninstall.exe").is_file())
        .unwrap_or(false)
}

// ------------------------------------------------- the standalone copy after

/// The note the INSTALLED program leaves at every start: its own path, and
/// its version on the second line (`kurulu_notu`). A standalone copy that
/// finds it starts the installed program instead of itself (`kurulu_hedef`),
/// so the old file -- on the desktop, pinned to the taskbar, behind a shortcut
/// he made by hand -- keeps opening Mozaik. Until 2026-11-16 the installed
/// program DELETED that file, and every pin and shortcut to it would have
/// broken (TRAPS 160).
pub const KURULU_NOTU: &str = "kurulu-yol.txt";

/// The note's text for the installed program at `exe`. The version is the
/// crate's, which `npm run yayinla` writes from package.json with the rest.
pub fn kurulu_notu(exe: &Path) -> String {
    format!("{}\n{}", exe.to_string_lossy(), env!("CARGO_PKG_VERSION"))
}

/// Where WebView2 keeps the profile, and the note beside it:
/// `%LOCALAPPDATA%\<identifier>`. Spelled out here because the standalone copy
/// reads it before Tauri is up (`lib.rs`, `run`); a test holds it to
/// tauri.conf.json.
#[cfg_attr(any(not(windows), debug_assertions), allow(dead_code))]
pub const KIMLIK: &str = "com.dersprogrami.arac";

/// The installed program a standalone copy hands over to, or `None`: only an
/// installed program (its uninstaller beside it), only a different `.exe`, and
/// only from a standalone copy, so an installed program never forwards and a
/// copy never starts itself.
#[cfg_attr(any(not(windows), debug_assertions), allow(dead_code))]
pub fn kurulu_hedef(aday: &str, simdiki: &Path) -> Option<PathBuf> {
    if kurulu_mu(simdiki) {
        return None;
    }
    let yol = PathBuf::from(aday.trim());
    let exe_mi = yol
        .extension()
        .map(|e| e.eq_ignore_ascii_case("exe"))
        .unwrap_or(false);
    if !exe_mi || !yol.is_absolute() || !yol.is_file() || !kurulu_mu(&yol) || yol == simdiki {
        return None;
    }
    if let (Ok(a), Ok(b)) = (yol.canonicalize(), simdiki.canonicalize()) {
        if a == b {
            return None;
        }
    }
    Some(yol)
}

/// The installed program this standalone copy (version `surum`) should start,
/// from the note. `yerel` is `%LOCALAPPDATA%`. Only when the installed one is
/// at least as new: a newer exe downloaded by hand -- what the error sentences
/// above tell a person to do -- must run, not open the older installed copy.
/// A note without a version (none was ever written so) forwards nowhere.
#[cfg_attr(any(not(windows), debug_assertions), allow(dead_code))]
pub fn kurulu_program(yerel: &Path, simdiki: &Path, surum: &str) -> Option<PathBuf> {
    let not = fs::read_to_string(yerel.join(KIMLIK).join(KURULU_NOTU)).ok()?;
    let mut satirlar = not.lines();
    let yol = satirlar.next()?;
    let kurulu_surum = satirlar.next()?.trim();
    if parse(kurulu_surum).is_none() || is_newer(surum, kurulu_surum) {
        return None;
    }
    kurulu_hedef(yol, simdiki)
}

// ---------------------------------------------------- waiting on the installer

/// The flag the waiter is started with: `--kurulum-bekle <kurulum> <eski exe> <özet> [--kurulu]`.
pub const KURULUM_BEKLE: &str = "--kurulum-bekle";
/// The flag the old copy is started again with when the installer did not finish.
pub const KURULUM_OLMADI: &str = "--kurulum-olmadi";
/// The waiter's file, in the temporary folder: a copy of this program under a
/// name the installer does not close. Tauri's installer closes every running
/// `Mozaik.exe` before it copies, and the waiter has to outlive that.
pub const BEKLEYICI_ADI: &str = "Mozaik-kurulum-bekleyici.exe";

/// What the waiter was told.
#[derive(Debug, PartialEq, Eq)]
pub struct Bekleyici {
    pub kurulum: PathBuf,
    pub eski: PathBuf,
    /// The installer's SHA-256, checked again right before it runs.
    pub ozet: String,
    pub kurulu: bool,
}

/// Reads the waiter's arguments, or `None` when this is not the waiter.
pub fn bekleyici_mi(args: &[String]) -> Option<Bekleyici> {
    let i = args.iter().position(|a| a == KURULUM_BEKLE)?;
    let kurulum = PathBuf::from(args.get(i + 1)?);
    let eski = PathBuf::from(args.get(i + 2)?);
    let ozet = args.get(i + 3)?.clone();
    Some(Bekleyici {
        kurulum,
        eski,
        ozet,
        kurulu: args.iter().any(|a| a == "--kurulu"),
    })
}

/// The installer's arguments. `/P` passive: a progress bar and no questions,
/// and unlike `/S` a failure is a message box rather than a program that just
/// vanished (Tauri's installer aborts SILENTLY under `/S` when it cannot close
/// the running copy). `/R` starts the program when it is done. `/UPDATE` only
/// when this IS the installed program: it keeps the shortcuts the first
/// install made; a first install makes the Start menu and desktop shortcuts.
pub fn kurulum_argumanlari(kurulu: bool) -> Vec<&'static str> {
    let mut a = vec!["/P", "/R"];
    if kurulu {
        a.push("/UPDATE");
    }
    a
}

/// The installer's exit code when it did not finish, for the sentence on
/// screen (`guncelleme_durumu`).
static KURULUM_KODU: std::sync::Mutex<Option<i32>> = std::sync::Mutex::new(None);
/// This start follows an update: `--guncellendi`, or a `.eski` beside the exe
/// (the published 2.2.0 starts its replacement with no flag at all).
static GUNCELLENDI_MI: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Called once at the top of `run`: what this start is. Before the page loads,
/// because the `.eski` it looks for is swept once the page has drawn.
pub fn acilis(args: &[String], exe: &Path) {
    if let Some(i) = args.iter().position(|a| a == KURULUM_OLMADI) {
        let kod = args.get(i + 1).and_then(|k| k.parse().ok()).unwrap_or(-1);
        if let Ok(mut slot) = KURULUM_KODU.lock() {
            *slot = Some(kod);
        }
    }
    let guncellendi = args.iter().any(|a| a == GUNCELLENDI) || yan(exe, ESKI).is_file();
    GUNCELLENDI_MI.store(guncellendi, std::sync::atomic::Ordering::Relaxed);
}

/// What the waiter does with an installer file: `None` to run it, or the code
/// the old copy is started again with. The file sat in the shared temporary
/// folder for as long as the old copy took to exit, so it is the checked file
/// again or nothing runs (review 2026-11-16).
pub fn kurulum_dogru_mu(kurulum: &Path, ozet_beklenen: &str) -> Option<i32> {
    match fs::read(kurulum) {
        Ok(bytes) if ozet(&bytes) == ozet_beklenen.to_ascii_lowercase() => None,
        Ok(_) => Some(-3),
        Err(_) => Some(-4),
    }
}

/// The waiter's whole life: wait for the old copy to go, run the installer,
/// and if it did not finish start the old copy again with the reason. Never
/// returns. No window, no Tauri: a process that only waits.
pub fn bekle_ve_bitir(b: Bekleyici) -> ! {
    eskisi_gitsin(std::io::stdin(), DEVIR_SURESI);
    let kod = match kurulum_dogru_mu(&b.kurulum, &b.ozet) {
        Some(kod) => kod,
        None => match std::process::Command::new(&b.kurulum)
            .args(kurulum_argumanlari(b.kurulu))
            .status()
        {
            Ok(s) if s.success() => std::process::exit(0),
            Ok(s) => s.code().unwrap_or(-1),
            Err(_) => -2,
        },
    };
    let _ = std::process::Command::new(&b.eski)
        .args([KURULUM_OLMADI, &kod.to_string()])
        .spawn();
    std::process::exit(0)
}

/// What the page asks at startup, without the network: whether to suggest the
/// installer (a standalone copy that has just been updated), and whether an
/// installer run from here did not finish (its exit code).
#[derive(serde::Serialize, Clone, Debug)]
pub struct Durum {
    pub kurulum_oner: bool,
    pub kurulum_olmadi: Option<i32>,
}

#[tauri::command]
pub fn guncelleme_durumu() -> Durum {
    let kurulum_olmadi = KURULUM_KODU.lock().ok().and_then(|k| *k);
    Durum {
        kurulum_oner: tek_basina()
            && kurulum_olmadi.is_none()
            && GUNCELLENDI_MI.load(std::sync::atomic::Ordering::Relaxed),
        kurulum_olmadi,
    }
}

/// The installer downloaded in this session, waiting for "Şimdi yeniden başlat".
/// With the digest it was checked against: `apply_update` checks it again.
#[allow(clippy::type_complexity)]
static INDIRILEN_KURULUM: std::sync::Mutex<Option<(PathBuf, String)>> = std::sync::Mutex::new(None);

/// Is what came down the wire a Windows program, and the one we were promised?
///
/// The size check is what makes a truncated download loud. Without it a
/// connection that dies halfway leaves a half file that renames over the
/// working program perfectly happily, and the next launch does nothing at all
/// -- with the old copy already moved aside. The digest is the manifest's
/// own word for exactly which file: the size and `MZ` say a whole Windows
/// program arrived, the digest says it is the one published.
pub fn verify(bytes: &[u8], boyut: u64, sha256: &str) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("İnen dosya boş.".into());
    }
    // A size of 0 is refused, not read as "unknown". `boyut` comes from the
    // page (`download_update`'s argument), and the old `boyut != 0` exception
    // let it switch this check off (security review 2026-11-15, G4). No path
    // needs that exception: every manifest ever published carries the real
    // size (`stat` in surum.yml, a required field since the first one), and
    // `verify` has no other caller.
    if boyut == 0 {
        return Err("Beklenen boyut bilinmiyor: indirme durduruldu.".into());
    }
    if bytes.len() as u64 != boyut {
        return Err(format!(
            "İndirme yarıda kesildi. Tekrar deneyin. ({} / {})",
            boyut,
            bytes.len()
        ));
    }
    // Every Windows executable starts with these two bytes. It is the cheapest
    // possible answer to "did a proxy or a captive portal hand us an HTML
    // error page instead", which is the realistic failure, not a hostile one.
    if !bytes.starts_with(b"MZ") {
        return Err("İnen dosya bir Windows programı değil.".into());
    }
    if ozet(bytes) != sha256.to_ascii_lowercase() {
        return Err("İndirme bozuk geldi. Tekrar deneyin.".into());
    }
    Ok(())
}

/// The public half of the release key (minisign, ed25519). The secret half is
/// the repository secret MOZAIK_IMZA_ANAHTARI and lives nowhere else but its
/// owner's machine. A copy can only ever trust the key it was built with:
/// changing it strands every copy out there, so it is never changed lightly.
const IMZA_ANAHTARI: &str = "RWRS2NVsciPlIF8hWDq+YKRut30HIVv3UTP1++4tS/Mcp0vhVLe3rKsl";

/// What the release signs into each file's trusted comment: the version and
/// the file. A signature alone says a file is ours; this says WHICH, so an
/// older signed release cannot be served as the new one and the installer
/// cannot be swapped for the standalone exe (commit security review,
/// 2026-11-15). surum.yml writes the same string with `minisign -t`.
pub fn imza_yorumu(surum: &str, dosya: &str) -> String {
    format!("mozaik {surum} {dosya}")
}

/// Is `imza` a signature of `bytes` by the release key, made for `beklenen`
/// (`imza_yorumu`)? The test copy, which has no release key behind it,
/// accepts a missing signature (see `karar`).
pub fn imza_dogru(bytes: &[u8], imza: Option<&str>, beklenen: &str) -> Result<(), String> {
    let Some(imza) = imza else {
        return if TEST_KOKU.is_some() {
            Ok(())
        } else {
            Err("İnen dosyanın imzası yok.".into())
        };
    };
    let anahtar = minisign_verify::PublicKey::from_base64(IMZA_ANAHTARI)
        .map_err(|_| "İmza anahtarı okunamadı.".to_string())?;
    let imza = minisign_verify::Signature::decode(imza)
        .map_err(|_| "İnen dosyanın imzası okunamadı.".to_string())?;
    anahtar
        .verify(bytes, &imza, false)
        .map_err(|_| "İnen dosya bizim imzamızı taşımıyor.".to_string())?;
    // The trusted comment is covered by the signature, so it cannot be edited.
    if imza.trusted_comment() != beklenen {
        return Err("İnen dosya bu sürüm için imzalanmamış.".into());
    }
    Ok(())
}

/// The version `check_update` last offered: what a download must be signed for.
static ONERILEN: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

/// SHA-256 of `bytes`, lowercase hex, as `sha256sum` writes it.
fn ozet(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    Sha256::digest(bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/// Writes a downloaded program whole or not at all: `<yol>.tmp`, `sync_all`,
/// rename. `fs::write` straight to `.yeni` left half a program behind when the
/// disk filled up, and `swap` only asks whether the file is there (security
/// review 2026-11-15, V10). A failed write removes its temporary.
fn diske_yaz(yol: &Path, bytes: &[u8]) -> std::io::Result<()> {
    use std::io::Write;
    let tmp = yan(yol, "tmp");
    let yaz = || -> std::io::Result<()> {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(bytes)?;
        f.sync_all()?;
        fs::rename(&tmp, yol)
    };
    yaz().inspect_err(|_| {
        let _ = fs::remove_file(&tmp);
    })
}

/// `<program>.exe` -> `<program>.exe.<ek>`
fn yan(exe: &Path, ek: &str) -> PathBuf {
    let mut ad = exe.as_os_str().to_os_string();
    ad.push(".");
    ad.push(ek);
    PathBuf::from(ad)
}

/// Puts the downloaded program in the running program's place.
///
/// A running .exe on Windows cannot be deleted, but it CAN be renamed -- that
/// is the whole trick, and it is why this works without an installer
/// (double-click principle: the delivery is one file, not a wizard). Both renames are
/// inside one directory, so each is a single atomic operation.
///
/// The rollback on the second rename is the point of the function. Failing
/// after step one would leave the machine with no program at that path at all,
/// and the person looking at it would have no idea where it went.
pub fn swap(exe: &Path) -> Result<(), String> {
    let yeni = yan(exe, YENI);
    // `is_file`, not `exists`: a DIRECTORY with this name would pass `exists`
    // and then rename cleanly into the program's place, leaving a folder where
    // the .exe used to be and nothing to double-click.
    if !yeni.is_file() {
        return Err("İndirilmiş bir sürüm bulunamadı.".into());
    }
    swap_files(exe, &yeni, &yan(exe, ESKI))
}

/// How a failed swap starts: the old copy is still the one that runs.
const YAPILAMADI: &str = "Güncelleme yapılamadı, Mozaik eski sürümüyle çalışmaya devam ediyor.";

/// The two renames, split out from the guard above so the rollback can be
/// tested. Handing it a `yeni` that is not there is not a hypothetical: on
/// Windows an antivirus can quarantine a freshly downloaded .exe in the
/// moment between the check and the rename, and that is precisely the case
/// where the program must still be where it was.
fn swap_files(exe: &Path, yeni: &Path, eski: &Path) -> Result<(), String> {
    // A leftover from an earlier update. Rust's rename replaces an existing
    // file on current Windows, but not one that is still held open, and an
    // old copy that has not quit yet holds its own file: so this goes first.
    let _ = fs::remove_file(eski);

    // A plain sentence first, and the system's own words in brackets: the
    // reader acts on the first half, whoever helps him reads the second.
    fs::rename(exe, eski).map_err(|e| {
        format!("{YAPILAMADI} Mozaik'i kapatıp yeniden açın ve tekrar deneyin. ({e})")
    })?;
    match fs::rename(yeni, exe) {
        Ok(()) => Ok(()),
        Err(e) => {
            let _ = fs::rename(eski, exe);
            Err(format!(
                "{YAPILAMADI} Bilgisayarı yeniden başlatıp tekrar deneyin. ({e})"
            ))
        }
    }
}

/// Drops the previous version, if one is lying next to us.
///
/// Called once the new version's page has loaded (`lib.rs`, `on_page_load`),
/// not right after the swap -- right after the swap the old file is still the
/// process doing the asking -- and not at the first line of startup either: a
/// version that never gets a window must leave the old one to go back to.
pub fn sweep_old(exe: &Path) {
    let _ = fs::remove_file(yan(exe, ESKI));
}

// --------------------------------------------------------- the hand-over

/// The flag `apply_update` starts the new version with.
pub const GUNCELLENDI: &str = "--guncellendi";

/// How long the new version waits for the old one to go. The old one calls
/// `app.exit(0)` right after starting it, so this is a ceiling, not a delay.
pub const DEVIR_SURESI: Duration = Duration::from_secs(20);

/// Waits until `boru` reaches its end or `sure` runs out, whichever is first.
///
/// WHY. Mozaik runs one copy at a time (tauri-plugin-single-instance, VK1), and
/// `apply_update` starts the new version BEFORE the old one has exited. Left to
/// itself the new process would find the old one still running, hand it the
/// focus and quit, and then the old one would quit too: an update that ends
/// with the program closed. So the old process starts the new one with a pipe
/// on its standard input and never writes to it. The pipe ends when the old
/// process does, whatever way it ends, and only then does the new one claim
/// the single instance. Standard library only: no process ids, no OS calls.
pub fn eskisi_gitsin<R: std::io::Read + Send + 'static>(mut boru: R, sure: Duration) -> bool {
    let (tamam, bekle) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let mut cop = Vec::new();
        let _ = boru.read_to_end(&mut cop);
        let _ = tamam.send(());
    });
    bekle.recv_timeout(sure).is_ok()
}

// ------------------------------------------------------------------ the wire

fn istemci(saniye: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent("Mozaik")
        .timeout(Duration::from_secs(saniye))
        .build()
        .map_err(|e| format!("Ağ hazırlanamadı: {e}"))
}

/// One sentence my father can act on, not a stack of English words.
fn ag_hatasi(e: &reqwest::Error) -> String {
    if e.is_timeout() {
        "İnternet yanıt vermedi. Program çalışmaya devam ediyor, sonra tekrar deneyebilirsiniz."
            .into()
    } else if e.is_connect() || e.is_request() {
        "İnternete bağlanılamadı. Program çalışmaya devam ediyor, sonra tekrar deneyebilirsiniz."
            .into()
    } else {
        format!("Güncelleme sunucusuna ulaşılamadı: {e}")
    }
}

// -------------------------------------------------------------- the commands

#[tauri::command]
pub async fn check_update(current: String) -> Result<Cevap, String> {
    let yanit = istemci(20)?
        .get(manifest_url())
        .send()
        .await
        .map_err(|e| ag_hatasi(&e))?
        .error_for_status()
        .map_err(|e| format!("Sürüm listesi okunamadı: {e}"))?;

    let m: Manifest = yanit
        .json()
        .await
        .map_err(|_| "Sürüm listesi anlaşılamadı.".to_string())?;

    let cevap = karar(m, &current)?;
    if let Ok(mut slot) = ONERILEN.lock() {
        *slot = (cevap.yeni_var || cevap.gecis).then(|| cevap.version.clone());
    }
    Ok(cevap)
}

/// Downloads next to the running program and stops there. Nothing is replaced
/// until `apply_update`, which is a second button.
#[tauri::command]
pub async fn download_update(
    url: String,
    boyut: u64,
    sha256: String,
    imza: Option<String>,
) -> Result<u64, String> {
    self_update_here()?;
    safe_url(&url)?;
    let exe = std::env::current_exe().map_err(|e| format!("Program yolu bulunamadı: {e}"))?;
    let kurulum = kurulum_mu(&url);

    let bytes = istemci(300)?
        .get(&url)
        .send()
        .await
        .map_err(|e| ag_hatasi(&e))?
        .error_for_status()
        .map_err(|e| format!("Yeni sürüm indirilemedi: {e}"))?
        .bytes()
        .await
        .map_err(|e| ag_hatasi(&e))?;

    verify(&bytes, boyut, &sha256)?;
    let surum = ONERILEN
        .lock()
        .map_err(|_| "Sürüm kaydı okunamadı.")?
        .clone()
        .ok_or("Önce güncellemeleri denetleyin.")?;
    let dosya = url.rsplit('/').next().unwrap_or_default();
    imza_dogru(&bytes, imza.as_deref(), &imza_yorumu(&surum, dosya))?;
    if kurulum {
        // The temporary folder, not next to the program: an installed program
        // lives in a folder the installer owns, and the wizard is run once and
        // never kept. Its digest goes with it: `apply_update` checks the file
        // again right before running it, since the folder is not ours alone.
        let hedef = std::env::temp_dir().join(KURULUM_ADI);
        diske_yaz(&hedef, &bytes).map_err(|e| format!("Kurulum diske yazılamadı: {e}"))?;
        *INDIRILEN_KURULUM
            .lock()
            .map_err(|_| "Kurulum kaydı okunamadı.")? = Some((hedef, sha256.to_ascii_lowercase()));
        return Ok(bytes.len() as u64);
    }
    diske_yaz(&yan(&exe, YENI), &bytes).map_err(|e| {
        format!(
            "Yeni sürüm diske yazılamadı: {e}\n\
             Programı Belgelerim gibi yazılabilir bir klasöre taşıyıp tekrar deneyin."
        )
    })?;
    *INDIRILEN_EXE
        .lock()
        .map_err(|_| "İndirme kaydı okunamadı.")? = Some(sha256.to_ascii_lowercase());
    Ok(bytes.len() as u64)
}

/// The digest of the standalone exe downloaded in THIS session, for the swap.
static INDIRILEN_EXE: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

/// Is the `.yeni` file next to the program the one downloaded and checked in
/// this session? Between the download and "Şimdi yeniden başlat" the file sat
/// on disk where anything of this user could write (security review, B7.39);
/// and a `.yeni` left by an earlier session was never checked by this one.
pub fn yeni_dogru(yeni: &Path, beklenen: Option<&str>) -> Result<(), String> {
    let beklenen = beklenen.ok_or("Önce yeni sürümü indirin.")?;
    let bytes = fs::read(yeni).map_err(|e| format!("İndirilen sürüm okunamadı: {e}"))?;
    if ozet(&bytes) != beklenen {
        return Err("İndirilen sürüm bozulmuş. Tekrar indirin.".into());
    }
    Ok(())
}

#[tauri::command]
pub fn apply_update(app: tauri::AppHandle) -> Result<(), String> {
    self_update_here()?;
    let exe = std::env::current_exe().map_err(|e| format!("Program yolu bulunamadı: {e}"))?;
    let kurulum = INDIRILEN_KURULUM
        .lock()
        .map_err(|_| "Kurulum kaydı okunamadı.")?
        .clone()
        .filter(|(p, _)| p.is_file());
    if let Some((kurulum, beklenen)) = kurulum {
        // The temporary folder is shared with every other program of this
        // user: the file run is the file that was checked, or nothing runs.
        let bytes = fs::read(&kurulum).map_err(|e| format!("Kurulum okunamadı: {e}"))?;
        if ozet(&bytes) != beklenen {
            return Err("İndirilen kurulum bozulmuş. Tekrar indirin.".into());
        }
        return kurulumu_baslat(&app, &exe, &kurulum, &beklenen);
    }
    let beklenen = INDIRILEN_EXE
        .lock()
        .map_err(|_| "İndirme kaydı okunamadı.")?
        .clone();
    yeni_dogru(&yan(&exe, YENI), beklenen.as_deref())?;
    swap(&exe)?;
    // The pipe is the hand-over (`eskisi_gitsin` says why). Its writing end
    // stays open in this process until the process ends.
    let yeni = std::process::Command::new(&exe)
        .arg(GUNCELLENDI)
        .stdin(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Yeni sürüm başlatılamadı: {e}"))?;
    std::mem::forget(yeni);
    app.exit(0);
    Ok(())
}

/// Hands over to the downloaded installer and exits.
///
/// Through a waiter (`bekle_ve_bitir`): a copy of this program in the
/// temporary folder that runs the installer, waits for it, and starts this
/// copy again with a plain sentence if it did not finish. Until 2026-11-16 the
/// program started the installer with `/S` and exited, and every way Tauri's
/// installer can stop (the running copy would not close, WebView2's setup
/// failed, the disk, an antivirus) would have ended with no window and nothing
/// on screen (TRAPS 161). The standalone copy is never deleted: once the
/// installed program has started it forwards to it (`kurulu_hedef`).
fn kurulumu_baslat(
    app: &tauri::AppHandle,
    exe: &Path,
    kurulum: &Path,
    ozet: &str,
) -> Result<(), String> {
    let kurulu = kurulu_mu(exe);
    let bekleyici = std::env::temp_dir().join(BEKLEYICI_ADI);
    let _ = fs::remove_file(&bekleyici);
    let mut komut = match fs::copy(exe, &bekleyici) {
        Ok(_) => {
            let mut k = std::process::Command::new(&bekleyici);
            k.arg(KURULUM_BEKLE).arg(kurulum).arg(exe).arg(ozet);
            if kurulu {
                k.arg("--kurulu");
            }
            // The waiter waits for this process to end (`eskisi_gitsin`).
            k.stdin(std::process::Stdio::piped());
            k
        }
        // No waiter: the installer alone, passive, so a failure still says so.
        Err(_) => {
            let mut k = std::process::Command::new(kurulum);
            k.args(kurulum_argumanlari(kurulu));
            k
        }
    };
    let calisan = komut
        .spawn()
        .map_err(|e| format!("Kurulum başlatılamadı: {e}"))?;
    std::mem::forget(calisan);
    app.exit(0);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    struct Scratch(PathBuf);

    impl Scratch {
        fn new(tag: &str) -> Self {
            let dir = std::env::temp_dir().join(format!("Mozaik-update-{tag}"));
            let _ = fs::remove_dir_all(&dir);
            fs::create_dir_all(&dir).unwrap();
            Scratch(dir)
        }
        fn exe(&self) -> PathBuf {
            self.0.join("Mozaik.exe")
        }
    }

    impl Drop for Scratch {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    // ----------------------------------------------------------- hand-over

    #[test]
    fn devir_eskisi_gidince_bitiyor() {
        // A pipe whose writer goes away after 200 ms: the old version exiting.
        let (oku, yaz) = std::io::pipe().unwrap();
        let baslangic = std::time::Instant::now();
        std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(200));
            drop(yaz);
        });
        assert!(eskisi_gitsin(oku, Duration::from_secs(5)));
        let gecen = baslangic.elapsed();
        assert!(gecen >= Duration::from_millis(150), "beklemedi: {gecen:?}");
        assert!(gecen < Duration::from_secs(3), "fazla bekledi: {gecen:?}");
    }

    #[test]
    fn devir_eskisi_gitmezse_sure_dolunca_bitiyor() {
        let (oku, yaz) = std::io::pipe().unwrap();
        assert!(!eskisi_gitsin(oku, Duration::from_millis(300)));
        drop(yaz);
    }

    // ------------------------------------------------------------- comparing

    #[test]
    fn newer_is_newer_and_older_is_not() {
        assert!(is_newer("1.3.0", "1.2.0"));
        assert!(is_newer("2.0.0", "1.9.9"));
        assert!(!is_newer("1.2.0", "1.2.0"));
        assert!(!is_newer("1.2.0", "1.3.0"));
    }

    #[test]
    fn ten_is_greater_than_nine() {
        // The bug a string comparison would have, and the reason this
        // function exists at all.
        assert!(is_newer("1.10.0", "1.9.0"));
        assert!(!is_newer("1.9.0", "1.10.0"));
        assert!(is_newer("1.2.10", "1.2.9"));
    }

    #[test]
    fn missing_fields_are_zeros() {
        assert!(!is_newer("1.3", "1.3.0"));
        assert!(is_newer("1.3.1", "1.3"));
    }

    #[test]
    fn a_dev_build_still_compares() {
        // What a page built without `__SURUM__` reports.
        assert!(is_newer("1.3.0", "0.0.0-dev"));
    }

    #[test]
    fn nonsense_answers_no() {
        // Refusing beats guessing: a wrong yes offers a download that is not
        // an upgrade, and nothing on screen would say so.
        assert!(!is_newer("sürüm-yok", "1.2.0"));
        assert!(!is_newer("1.2.0", "bilinmiyor"));
        assert!(!is_newer("", "1.2.0"));
    }

    // ----------------------------------------------------------------- gates

    /// A sample signed with the release key on 2026-11-15 (`minisign -S`); the
    /// signature is public, the key that made it is not in this repository.
    const ORNEK: &[u8] = b"MZ Mozaik imza deneme";
    const ORNEK_IMZA: &str = "untrusted comment: signature from minisign secret key
RURS2NVsciPlIBWWdJ4OrNHuMdvRm2kbBkf4k1CpAJH7qRWo8Y2zPi4+Ll2H8OfST9QwPnzKR1RJ5X54iu4kXE4UNuU9iX1yvgQ=
trusted comment: mozaik 9.9.9 ornek.bin
SkhGCgu4XXN4+XWwhhyVbN4Oz8MrbGuNKXxnBt1dWnw5a56bmN0YR4qwJ3zQIt+tsa+Yo8voYTh2Uydma/rxBQ==
";

    #[test]
    fn only_our_signature_on_these_bytes_passes() {
        let dogru = imza_yorumu("9.9.9", "ornek.bin");
        assert!(imza_dogru(ORNEK, Some(ORNEK_IMZA), &dogru).is_ok());
        assert!(imza_dogru(b"MZ Mozaik imza denemf", Some(ORNEK_IMZA), &dogru).is_err());
        assert!(imza_dogru(ORNEK, Some("untrusted comment: x\nRWQ=\n"), &dogru).is_err());
        assert!(imza_dogru(ORNEK, None, &dogru).is_err());
    }

    #[test]
    fn a_signature_for_another_version_or_file_does_not_pass() {
        // An older signed release served as the new one, and one file passed
        // off as the other: both signed by us, neither for this download.
        assert!(imza_dogru(ORNEK, Some(ORNEK_IMZA), &imza_yorumu("9.9.8", "ornek.bin")).is_err());
        assert!(imza_dogru(ORNEK, Some(ORNEK_IMZA), &imza_yorumu("9.9.9", "Mozaik.exe")).is_err());
    }

    #[test]
    fn a_new_version_without_a_signature_is_not_offered() {
        let mut m = manifest("9.0.0", TEK);
        m.imza = None;
        assert!(karar(m, "2.2.0").is_err());
    }

    #[test]
    fn only_the_checked_download_is_swapped_in() {
        let tmp = Scratch::new("yeni-dogru");
        let yeni = yan(&tmp.exe(), YENI);
        fs::write(&yeni, b"MZ yeni surum").unwrap();
        let dogru = ozet(b"MZ yeni surum");
        assert!(yeni_dogru(&yeni, Some(&dogru)).is_ok());
        // Changed on disk after the download, or never downloaded this session.
        fs::write(&yeni, b"MZ baska bir sey").unwrap();
        assert!(yeni_dogru(&yeni, Some(&dogru)).is_err());
        assert!(yeni_dogru(&yeni, None).is_err());
        fs::remove_file(&yeni).unwrap();
        assert!(yeni_dogru(&yeni, Some(&dogru)).is_err());
    }

    #[test]
    fn dot_segments_cannot_leave_our_releases() {
        for kotu in [
            "https://github.com/AlparslanSemiz/Mozaik/releases/../../baska/depo/releases/x.exe",
            "https://github.com/AlparslanSemiz/Mozaik/releases/%2e%2e/%2E%2E/baska/depo/x.exe",
            "https://github.com/AlparslanSemiz/Mozaik/releases/./../../../baska/x.exe",
            "http://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe",
            "https://github.com:8443/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe",
            "https://kim@github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe",
            "kot\u{0}u",
        ] {
            assert!(safe_url(kotu).is_err(), "{kotu}");
        }
        assert!(safe_url(
            "https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik-Kurulum.exe"
        )
        .is_ok());
    }

    #[test]
    fn the_manifest_is_under_a_pinned_prefix() {
        // Two literals that must agree; this is the only thing that says so.
        assert!(RELEASE_KOKLERI.iter().any(|k| MANIFEST_URL.starts_with(k)));
        // And the address offered to a person by hand is one of ours too.
        assert!(safe_url(&releases_sayfasi()).is_ok());
    }

    #[test]
    fn only_our_own_releases_are_fetched() {
        for kok in RELEASE_KOKLERI {
            // v2.0.0 renames the delivery file; the gate must not care.
            assert!(safe_url(&format!("{kok}latest/download/Mozaik.exe")).is_ok());
            assert!(safe_url(&format!("{kok}latest/download/Ders-Programi.exe")).is_ok());
        }
        for bad in [
            "http://github.com/AlparslanSemiz/Mozaik/releases/latest/download/x.exe",
            "https://example.com/x.exe",
            "https://github.com/baskasi/depo/releases/latest/download/x.exe",
            "https://github.com/AlparslanSemiz/baska-depo/releases/latest/download/x.exe",
            "file:///etc/passwd",
            "",
        ] {
            assert!(safe_url(bad).is_err(), "kabul edildi: {bad}");
        }
    }

    #[test]
    fn the_old_repository_name_is_still_one_of_ours() {
        // The whole point of the list. This exact string is compiled into the
        // published v2.0.2, and the manifest keeps pointing at it (surum.yml)
        // so that copy can still fetch; a build from here has to accept it too
        // or the next release strands the previous one all over again.
        assert!(safe_url(
            "https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe"
        )
        .is_ok());
    }

    // ------------------------------------------------------------ the answer

    fn manifest(version: &str, exe: &str) -> Manifest {
        Manifest {
            version: version.into(),
            date: "2026-08-31".into(),
            exe: exe.into(),
            boyut: 3_757_568,
            sha256: Some(ozet(b"MZ")),
            kurulum: None,
            kurulum_boyut: None,
            kurulum_sha256: None,
            imza: Some(String::new()),
            kurulum_imza: None,
        }
    }

    // ---------------------------------------------------------- the installer

    const KURULUM: &str =
        "https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik-Kurulum.exe";
    const TEK: &str =
        "https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe";

    #[test]
    fn a_release_with_an_installer_offers_the_installer() {
        let mut m = manifest("9.0.0", TEK);
        m.kurulum = Some(KURULUM.into());
        m.kurulum_boyut = Some(31_000_000);
        m.kurulum_sha256 = Some("ab".repeat(32));
        m.kurulum_imza = Some("imza".into());
        let c = karar(m, "2.2.0").unwrap();
        assert!(c.kurulum);
        assert_eq!(c.imza.as_deref(), Some("imza"));
        assert_eq!(c.exe, KURULUM);
        assert_eq!(c.boyut, 31_000_000);
        assert_eq!(c.sha256.as_deref(), Some("ab".repeat(32).as_str()));
    }

    #[test]
    fn an_installer_without_its_digest_is_not_offered() {
        let mut m = manifest("9.0.0", TEK);
        m.kurulum = Some(KURULUM.into());
        m.kurulum_boyut = Some(31_000_000);
        let c = karar(m, "2.2.0").unwrap();
        assert!(!c.kurulum);
        assert_eq!(c.exe, TEK);
    }

    #[test]
    fn a_release_without_one_is_the_old_standalone_swap() {
        let c = karar(manifest("9.0.0", TEK), "2.2.0").unwrap();
        assert!(!c.kurulum);
        assert_eq!(c.exe, TEK);
    }

    #[test]
    fn an_installer_somewhere_else_falls_back_to_the_standalone_one() {
        let mut m = manifest("9.0.0", TEK);
        m.kurulum = Some("https://baska-yer.example/Mozaik-Kurulum.exe".into());
        m.kurulum_boyut = Some(1);
        m.kurulum_sha256 = Some("ab".repeat(32));
        let c = karar(m, "2.2.0").unwrap();
        assert!(!c.kurulum);
        assert_eq!(c.exe, TEK);
    }

    #[test]
    fn an_old_copy_reads_the_new_manifest() {
        // What 2.2.0 out in the field will parse: its struct has no installer
        // fields, and serde must ignore them rather than refuse the manifest.
        #[derive(serde::Deserialize)]
        #[allow(dead_code)]
        struct Eski {
            version: String,
            date: String,
            exe: String,
            boyut: u64,
        }
        let json = format!(
            r#"{{"version":"9.0.0","date":"2026-11-15","exe":"{TEK}","boyut":5,"kurulum":"{KURULUM}","kurulum_boyut":7}}"#
        );
        let eski: Eski = serde_json::from_str(&json).unwrap();
        assert_eq!(eski.exe, TEK);
    }

    #[test]
    fn only_the_installer_address_is_the_installer() {
        assert!(kurulum_mu(KURULUM));
        assert!(!kurulum_mu(TEK));
        assert!(!kurulum_mu("https://x/Mozaik-Kurulum.exe.html"));
    }

    // ------------------------------------------------ the move to the installer

    /// The manifest the release that ships the installer publishes: the same
    /// version as the copy 2.2.0 swaps in, both programs, both signatures.
    fn kurulumlu(version: &str) -> Manifest {
        let mut m = manifest(version, TEK);
        m.kurulum = Some(KURULUM.into());
        m.kurulum_boyut = Some(16_000_000);
        m.kurulum_sha256 = Some("ab".repeat(32));
        m.kurulum_imza = Some("imza".into());
        m
    }

    #[test]
    fn a_standalone_copy_at_the_same_version_is_offered_the_installer() {
        // THE BRIDGE, as it really runs: 2.2.0 swapped in the standalone exe
        // of this release, which then asks with this release's own number.
        let c = windows_karari(kurulumlu("2.3.0"), "2.3.0", true).unwrap();
        assert!(c.gecis);
        assert!(!c.yeni_var);
        assert!(c.kurulum);
        assert_eq!(c.exe, KURULUM);
        assert_eq!(c.imza.as_deref(), Some("imza"));
    }

    #[test]
    fn an_installed_copy_at_the_same_version_is_up_to_date() {
        let c = windows_karari(kurulumlu("2.3.0"), "2.3.0", false).unwrap();
        assert!(!c.gecis);
        assert!(!c.yeni_var);
    }

    #[test]
    fn a_newer_version_is_an_update_not_a_move_either_way() {
        for tek in [true, false] {
            let c = windows_karari(kurulumlu("2.4.0"), "2.3.0", tek).unwrap();
            assert!(c.yeni_var);
            assert!(!c.gecis);
            assert!(c.kurulum);
        }
    }

    #[test]
    fn no_move_without_a_whole_signed_installer_or_to_an_older_version() {
        // A release without the installer: up to date, as before.
        let c = windows_karari(manifest("2.3.0", TEK), "2.3.0", true).unwrap();
        assert!(!c.gecis && !c.yeni_var);
        // Unsigned: nothing this copy would install, so nothing is offered.
        let mut m = kurulumlu("2.3.0");
        m.kurulum_imza = None;
        assert!(!windows_karari(m, "2.3.0", true).unwrap().gecis);
        // Not ours.
        let mut m = kurulumlu("2.3.0");
        m.kurulum = Some("https://baska-yer.example/Mozaik-Kurulum.exe".into());
        assert!(!windows_karari(m, "2.3.0", true).unwrap().gecis);
        // A manifest older than this copy (a development build) moves nowhere.
        assert!(
            !windows_karari(kurulumlu("2.2.0"), "2.3.0", true)
                .unwrap()
                .gecis
        );
        // Numbers that do not parse are never "the same version".
        assert!(!windows_karari(kurulumlu("x"), "x", true).unwrap().gecis);
    }

    #[test]
    fn karar_is_windows_karari_for_this_copy() {
        // `cargo test` is not an installed program; on Windows it is a
        // standalone exe, anywhere else it is no Windows copy at all.
        let c = karar(kurulumlu("2.3.0"), "2.3.0").unwrap();
        assert_eq!(c.gecis, cfg!(windows));
    }

    #[test]
    fn the_published_220_reads_this_manifest_and_swaps_in_the_standalone_exe() {
        // v2.2.0's own `Manifest` and `karar`, copied from
        // `git show v2.2.0:src-tauri/src/update.rs` (only `safe_url`'s prefix
        // test and `is_newer` are shared with today's file, and both are
        // unchanged). It cannot be run against the network -- its manifest
        // address is compiled in -- so the CI step that drives the real 2.2.0
        // (guncelleme-windows.yml) and this test are the two halves.
        #[derive(serde::Deserialize)]
        #[allow(dead_code)]
        struct Manifest220 {
            version: String,
            date: String,
            exe: String,
            boyut: u64,
        }
        fn karar220(m: Manifest220, current: &str) -> Result<(bool, String, u64), String> {
            let yeni_var = is_newer(&m.version, current);
            if yeni_var && !RELEASE_KOKLERI.iter().any(|k| m.exe.starts_with(k)) {
                return Err("indiremiyor".into());
            }
            Ok((yeni_var, m.exe, m.boyut))
        }
        let json = serde_json::to_string(&kurulumlu("2.3.0")).unwrap();
        let m: Manifest220 = serde_json::from_str(&json).unwrap();
        let (yeni, exe, boyut) = karar220(m, "2.2.0").unwrap();
        assert!(yeni);
        assert_eq!(exe, TEK);
        assert_eq!(boyut, 3_757_568);
    }

    // ------------------------------------------ the standalone copy forwards

    #[test]
    fn a_standalone_copy_forwards_only_to_an_installed_program() {
        let tmp = Scratch::new("ilet");
        let simdiki = tmp.0.join("Masaustu").join("Ders-Programi.exe");
        fs::create_dir_all(simdiki.parent().unwrap()).unwrap();
        fs::write(&simdiki, b"MZ").unwrap();
        let kurulu = tmp.0.join("Programs").join("Mozaik").join("Mozaik.exe");
        fs::create_dir_all(kurulu.parent().unwrap()).unwrap();
        fs::write(&kurulu, b"MZ").unwrap();
        // No uninstaller beside it: not installed, not a target.
        assert_eq!(kurulu_hedef(&kurulu.to_string_lossy(), &simdiki), None);
        fs::write(kurulu.parent().unwrap().join("uninstall.exe"), b"MZ").unwrap();
        assert_eq!(
            kurulu_hedef(&format!("{}\n", kurulu.to_string_lossy()), &simdiki),
            Some(kurulu.clone())
        );
        // Relative, missing, not a program, empty: no.
        assert_eq!(kurulu_hedef("Mozaik.exe", &simdiki), None);
        let yok = tmp.0.join("Programs").join("Mozaik").join("Yok.exe");
        assert_eq!(kurulu_hedef(&yok.to_string_lossy(), &simdiki), None);
        let belge = kurulu.parent().unwrap().join("plan.json");
        fs::write(&belge, b"{}").unwrap();
        assert_eq!(kurulu_hedef(&belge.to_string_lossy(), &simdiki), None);
        assert_eq!(kurulu_hedef("  \n", &simdiki), None);
        // The installed program itself never forwards, not even to itself.
        assert_eq!(kurulu_hedef(&kurulu.to_string_lossy(), &kurulu), None);
    }

    #[test]
    fn the_note_forwards_only_to_an_installed_program_at_least_as_new() {
        let tmp = Scratch::new("ilet-not");
        let yerel = tmp.0.clone();
        let simdiki = tmp.0.join("Ders-Programi.exe");
        fs::write(&simdiki, b"MZ").unwrap();
        assert_eq!(kurulu_program(&yerel, &simdiki, "2.3.0"), None);

        let kurulu = yerel.join("Programs").join("Mozaik").join("Mozaik.exe");
        fs::create_dir_all(kurulu.parent().unwrap()).unwrap();
        fs::write(&kurulu, b"MZ").unwrap();
        fs::write(kurulu.parent().unwrap().join("uninstall.exe"), b"MZ").unwrap();
        fs::create_dir_all(yerel.join(KIMLIK)).unwrap();
        let not = yerel.join(KIMLIK).join(KURULU_NOTU);

        // The note as the installed program writes it.
        let metin = kurulu_notu(&kurulu);
        assert!(metin.ends_with(env!("CARGO_PKG_VERSION")));
        fs::write(&not, format!("{}\n2.3.0\n", kurulu.to_string_lossy())).unwrap();
        assert_eq!(
            kurulu_program(&yerel, &simdiki, "2.3.0"),
            Some(kurulu.clone())
        );
        assert_eq!(
            kurulu_program(&yerel, &simdiki, "2.2.0"),
            Some(kurulu.clone())
        );
        // A newer exe downloaded by hand runs itself.
        assert_eq!(kurulu_program(&yerel, &simdiki, "2.4.0"), None);
        // No version, or one that does not parse: nowhere.
        fs::write(&not, kurulu.to_string_lossy().as_bytes()).unwrap();
        assert_eq!(kurulu_program(&yerel, &simdiki, "2.3.0"), None);
        fs::write(&not, format!("{}\nx", kurulu.to_string_lossy())).unwrap();
        assert_eq!(kurulu_program(&yerel, &simdiki, "2.3.0"), None);
    }

    #[test]
    fn the_waiter_runs_only_the_installer_that_was_checked() {
        let tmp = Scratch::new("bekleyici-ozet");
        let kur = tmp.0.join("Mozaik-Kurulum.exe");
        fs::write(&kur, b"MZ kurulum").unwrap();
        let dogru = ozet(b"MZ kurulum");
        assert_eq!(kurulum_dogru_mu(&kur, &dogru), None);
        assert_eq!(kurulum_dogru_mu(&kur, &dogru.to_uppercase()), None);
        fs::write(&kur, b"MZ baska").unwrap();
        assert_eq!(kurulum_dogru_mu(&kur, &dogru), Some(-3));
        fs::remove_file(&kur).unwrap();
        assert_eq!(kurulum_dogru_mu(&kur, &dogru), Some(-4));
    }

    #[test]
    fn a_folder_named_uninstall_exe_does_not_make_a_copy_installed() {
        let tmp = Scratch::new("sahte-kurulu");
        let simdiki = tmp.exe();
        fs::create_dir(tmp.0.join("uninstall.exe")).unwrap();
        assert!(!kurulu_mu(&simdiki));
    }

    #[test]
    fn the_identifier_is_tauri_confs() {
        // The profile, the data and the note all live under this name.
        let conf: serde_json::Value =
            serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        assert_eq!(conf["identifier"], KIMLIK);
    }

    // ------------------------------------------------------------- the waiter

    #[test]
    fn the_waiter_reads_its_arguments_and_nothing_else_is_a_waiter() {
        let args = |v: &[&str]| v.iter().map(|s| s.to_string()).collect::<Vec<_>>();
        assert_eq!(
            bekleyici_mi(&args(&[
                "x.exe",
                KURULUM_BEKLE,
                r"C:\T\Mozaik-Kurulum.exe",
                r"C:\D P\Ders-Programi.exe",
                "ab"
            ])),
            Some(Bekleyici {
                kurulum: PathBuf::from(r"C:\T\Mozaik-Kurulum.exe"),
                eski: PathBuf::from(r"C:\D P\Ders-Programi.exe"),
                ozet: "ab".into(),
                kurulu: false,
            })
        );
        assert!(
            bekleyici_mi(&args(&["x.exe", KURULUM_BEKLE, "a", "b", "c", "--kurulu"]))
                .unwrap()
                .kurulu
        );
        assert_eq!(
            bekleyici_mi(&args(&["x.exe", KURULUM_BEKLE, "a", "b"])),
            None
        );
        assert_eq!(bekleyici_mi(&args(&["x.exe", GUNCELLENDI])), None);
    }

    #[test]
    fn the_installer_runs_passive_never_silent() {
        // `/S` aborts without a word when the running copy will not close.
        assert_eq!(kurulum_argumanlari(false), ["/P", "/R"]);
        assert_eq!(kurulum_argumanlari(true), ["/P", "/R", "/UPDATE"]);
    }

    #[test]
    fn a_start_after_an_update_and_a_failed_install_are_both_seen() {
        let tmp = Scratch::new("acilis");
        let exe = tmp.exe();
        fs::write(&exe, b"MZ").unwrap();
        let args = |v: &[&str]| v.iter().map(|s| s.to_string()).collect::<Vec<_>>();
        acilis(&args(&["x"]), &exe);
        assert!(!GUNCELLENDI_MI.load(std::sync::atomic::Ordering::Relaxed));
        // What 2.2.0 leaves: the old program beside the new one, no flag.
        fs::write(yan(&exe, ESKI), b"MZ").unwrap();
        acilis(&args(&["x"]), &exe);
        assert!(GUNCELLENDI_MI.load(std::sync::atomic::Ordering::Relaxed));
        acilis(&args(&["x", KURULUM_OLMADI, "2"]), &exe);
        assert_eq!(guncelleme_durumu().kurulum_olmadi, Some(2));
        assert!(!guncelleme_durumu().kurulum_oner);
    }

    #[test]
    fn a_new_version_without_a_digest_is_not_offered_for_download() {
        let mut m = manifest(
            "9.0.0",
            &format!("{}latest/download/Mozaik.exe", RELEASE_KOKLERI[0]),
        );
        m.sha256 = None;
        let e = karar(m, "2.0.2").unwrap_err();
        assert!(e.contains(&releases_sayfasi()), "adres yazmıyor: {e}");
    }

    #[test]
    fn a_manifest_from_before_the_digest_still_reads_and_says_up_to_date() {
        // Every surum.json published up to 2.2.0 has four fields.
        let m: Manifest = serde_json::from_str(
            r#"{"version":"2.2.0","date":"2026-09-26","exe":"https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe","boyut":5}"#,
        )
        .unwrap();
        assert!(m.sha256.is_none());
        assert!(!karar(m, "2.2.0").unwrap().yeni_var);
    }

    #[test]
    fn a_test_root_is_only_ever_loopback_and_a_directory() {
        assert!(yerel_kok_mu(b"http://127.0.0.1:8765/"));
        for kotu in [
            "",
            "/",
            "http://127.0.0.1:8765",
            "http://127.0.0.1:/x",
            "http://127.0.0.1:/",
            "https://github.com/",
            "http://127.0.0.1.example.com:80/",
            "http://localhost:8765/",
        ] {
            assert!(!yerel_kok_mu(kotu.as_bytes()), "kabul edildi: {kotu}");
        }
    }

    #[test]
    fn a_build_without_the_test_root_fetches_only_from_our_releases() {
        // `cargo test` runs without MOZAIK_TEST_GUNCELLEME_KOKU, as surum.yml
        // builds the released exe; a loopback server is then not ours.
        assert!(TEST_KOKU.is_none());
        assert_eq!(kokler(), RELEASE_KOKLERI.to_vec());
        assert_eq!(manifest_url(), MANIFEST_URL);
        assert!(safe_url("http://127.0.0.1:8765/Mozaik.exe").is_err());
    }

    #[test]
    fn an_up_to_date_copy_is_told_so_whatever_the_address_says() {
        // THE BUG, as my father met it: the repository was renamed, the
        // manifest started carrying the new name, and a copy that had nothing
        // to download answered "Beklenmeyen adres: https://..." instead of
        // "güncel". Nothing was being fetched -- there was nothing newer.
        let c = karar(
            manifest("2.0.2", "https://baska-yer.example/Mozaik.exe"),
            "2.0.2",
        )
        .unwrap();
        assert!(!c.yeni_var);
    }

    #[test]
    fn a_new_version_behind_an_unknown_address_says_where_to_go() {
        // Still an error -- this build cannot fetch that -- but one that can
        // be acted on: the version, and the page to download it from.
        let e = karar(
            manifest("9.0.0", "https://baska-yer.example/Mozaik.exe"),
            "2.0.2",
        )
        .unwrap_err();
        assert!(e.contains("9.0.0"), "sürüm yazmıyor: {e}");
        assert!(e.contains(&releases_sayfasi()), "adres yazmıyor: {e}");
    }

    #[test]
    fn a_new_version_at_either_of_our_names_is_offered() {
        for kok in RELEASE_KOKLERI {
            let c = karar(
                manifest("9.0.0", &format!("{kok}latest/download/Mozaik.exe")),
                "2.0.2",
            )
            .unwrap();
            assert!(c.yeni_var, "önerilmedi: {kok}");
            assert_eq!(c.version, "9.0.0");
        }
    }

    #[test]
    fn a_download_has_to_be_a_windows_program_of_the_promised_size() {
        let ok = b"MZ\x90\x00";
        assert!(verify(ok, 4, &ozet(ok)).is_ok());
        assert!(verify(b"", 0, &ozet(b"")).is_err());
        // A captive portal's HTML page: the realistic failure.
        assert!(verify(b"<!doctype html>", 15, &ozet(b"<!doctype html>")).is_err());
        // Truncated: right shape, wrong length.
        assert!(verify(b"MZ", 4, &ozet(b"MZ")).is_err());
    }

    #[test]
    fn a_size_of_zero_does_not_switch_the_size_check_off() {
        // The page sends `boyut`; 0 used to mean "do not check", so any length
        // passed. Now a download with no promised size is refused.
        let ok = b"MZ\x90\x00";
        assert!(verify(ok, 0, &ozet(ok)).is_err());
        assert!(verify(b"MZ", 0, &ozet(b"MZ")).is_err());
    }

    #[test]
    fn a_download_has_to_be_the_published_file() {
        let ok = b"MZ\x90\x00";
        // Same size, same shape, another file.
        assert!(verify(b"MZ\x90\x01", 4, &ozet(ok)).is_err());
        // The digest is compared as sha256sum writes it, in either case.
        assert!(verify(ok, 4, &ozet(ok).to_uppercase()).is_ok());
        // Known value: SHA-256 of "abc".
        assert_eq!(
            ozet(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn only_the_windows_build_replaces_itself() {
        assert_eq!(self_update_here().is_ok(), cfg!(windows));
    }

    // ------------------------------------------------------------- the swap

    #[test]
    fn the_new_version_takes_the_old_ones_place() {
        let s = Scratch::new("swap");
        let exe = s.exe();
        fs::write(&exe, "eski program").unwrap();
        fs::write(yan(&exe, YENI), "yeni program").unwrap();

        swap(&exe).unwrap();

        assert_eq!(fs::read_to_string(&exe).unwrap(), "yeni program");
        assert_eq!(fs::read_to_string(yan(&exe, ESKI)).unwrap(), "eski program");
        assert!(!yan(&exe, YENI).exists());
    }

    #[test]
    fn a_swap_with_nothing_downloaded_changes_nothing() {
        let s = Scratch::new("nothing");
        let exe = s.exe();
        fs::write(&exe, "eski program").unwrap();

        assert!(swap(&exe).is_err());
        assert_eq!(fs::read_to_string(&exe).unwrap(), "eski program");
        assert!(!yan(&exe, ESKI).exists());
    }

    #[test]
    fn a_failed_second_rename_puts_the_program_back() {
        // Straight at `swap_files`, because the guard in `swap` exists to stop
        // this from being reachable. What is measured is the rollback: after a
        // second rename that fails, the program is still where it was. Without
        // it the machine would be left with no program at this path at all,
        // and nothing on screen would say where it went.
        let s = Scratch::new("rollback");
        let exe = s.exe();
        fs::write(&exe, "eski program").unwrap();
        let yok = yan(&exe, YENI); // never written: quarantined, or a bad path

        assert!(swap_files(&exe, &yok, &yan(&exe, ESKI)).is_err());
        assert_eq!(fs::read_to_string(&exe).unwrap(), "eski program");
        assert!(!yan(&exe, ESKI).exists());
    }

    #[test]
    fn a_folder_is_not_a_downloaded_program() {
        // `exists()` would say yes here and the rename would succeed, leaving
        // a directory where the .exe was.
        let s = Scratch::new("folder");
        let exe = s.exe();
        fs::write(&exe, "eski program").unwrap();
        fs::create_dir(yan(&exe, YENI)).unwrap();

        assert!(swap(&exe).is_err());
        assert_eq!(fs::read_to_string(&exe).unwrap(), "eski program");
    }

    #[test]
    fn a_leftover_from_last_time_does_not_block_the_swap() {
        // A leftover `.eski` must not stop the second update in a row; on
        // Windows it can still be held open by the copy that has not quit.
        let s = Scratch::new("leftover");
        let exe = s.exe();
        fs::write(&exe, "eski program").unwrap();
        fs::write(yan(&exe, ESKI), "daha da eski").unwrap();
        fs::write(yan(&exe, YENI), "yeni program").unwrap();

        swap(&exe).unwrap();
        assert_eq!(fs::read_to_string(&exe).unwrap(), "yeni program");
    }

    #[test]
    fn the_old_version_goes_only_after_the_new_page_has_loaded() {
        // Read from lib.rs, not run: a page load needs a webview. The sweep
        // must sit inside the page-load hook and nowhere before it, or a new
        // version that cannot open its window deletes the copy that still
        // works (V9). Measured red: the call moved back to the top of `run`.
        let lib = include_str!("lib.rs");
        let kod = &lib[..lib.find("#[cfg(all(test").unwrap()];
        let cagri: Vec<_> = kod
            .match_indices("update::sweep_old(")
            .map(|(i, _)| i)
            .collect();
        assert_eq!(cagri.len(), 1, "sweep_old tek yerden çağrılmalı");
        let kanca = kod.find(".on_page_load(").expect("on_page_load yok");
        let sonraki = kod[kanca..].find(".on_window_event(").unwrap() + kanca;
        assert!(
            kanca < cagri[0] && cagri[0] < sonraki,
            "sweep_old sayfa yüklenince değil"
        );
        assert!(kod[kanca..sonraki].contains("PageLoadEvent::Finished"));
    }

    #[test]
    fn a_download_is_written_whole_or_not_at_all() {
        let s = Scratch::new("diske-yaz");
        let yeni = yan(&s.exe(), YENI);
        diske_yaz(&yeni, b"MZ yeni").unwrap();
        assert_eq!(fs::read(&yeni).unwrap(), b"MZ yeni");
        assert!(!yan(&yeni, "tmp").exists());

        // The rename cannot happen (a folder holds the name): no `.yeni` file
        // appears, and the temporary does not stay either.
        let s2 = Scratch::new("diske-yaz-dusen");
        let yeni2 = yan(&s2.exe(), YENI);
        fs::create_dir(&yeni2).unwrap();
        fs::write(yeni2.join("dolu"), b"x").unwrap();
        assert!(diske_yaz(&yeni2, b"MZ").is_err());
        assert!(!yeni2.is_file());
        assert!(!yan(&yeni2, "tmp").exists());
    }

    #[test]
    fn startup_sweeps_the_previous_version_away() {
        let s = Scratch::new("sweep");
        let exe = s.exe();
        fs::write(&exe, "program").unwrap();
        fs::write(yan(&exe, ESKI), "eski").unwrap();

        sweep_old(&exe);
        assert!(!yan(&exe, ESKI).exists());
        // ...and sweeping when there is nothing to sweep is the normal case.
        sweep_old(&exe);
        assert!(exe.exists());
    }
}
