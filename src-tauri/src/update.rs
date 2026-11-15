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
    /// The installer (`Mozaik-Kurulum.exe`), from the release that started
    /// shipping one (DECISIONS 2026-11-15). Optional, and that is the bridge:
    /// copies built before it never heard of the field, serde skips it, and they
    /// go on swapping in the standalone `exe` above -- which is the new version
    /// and offers the installer the next time somebody presses the button.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kurulum_boyut: Option<u64>,
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
    /// `exe` is the installer, not the standalone program. The page does not
    /// need to know -- `download_update` reads the same thing off the address --
    /// but the About panel may say it.
    pub kurulum: bool,
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
pub fn safe_url(url: &str) -> Result<(), String> {
    if !RELEASE_KOKLERI.iter().any(|kok| url.starts_with(kok)) {
        return Err(format!("Beklenmeyen adres: {url}"));
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
    let yeni_var = is_newer(&m.version, current);
    if yeni_var && safe_url(&m.exe).is_err() {
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
    let (exe, boyut, kurulum) = match (m.kurulum, m.kurulum_boyut) {
        (Some(url), Some(boyut)) if kurulum_mu(&url) && safe_url(&url).is_ok() => {
            (url, boyut, true)
        }
        _ => (m.exe, m.boyut, false),
    };
    Ok(Cevap {
        yeni_var,
        version: m.version,
        date: m.date,
        exe,
        boyut,
        kurulum,
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

/// The note a standalone copy leaves when it hands over to the installer: its
/// own path, so the installed program can remove it once it is gone. A file
/// rather than a command-line argument because the path may hold spaces and
/// the installer's `/ARGS` would have to quote them twice.
pub const ESKI_KOPYA_NOTU: &str = "eski-kopya.txt";

/// What the note may make the installed program delete: only a different
/// `.exe` than the one running, and only from an installed program, so that a
/// standalone copy can never be talked into removing itself or a sibling.
pub fn silinecek_eski(not: &str, simdiki: &Path) -> Option<PathBuf> {
    if !kurulu_mu(simdiki) {
        return None;
    }
    let yol = PathBuf::from(not.trim());
    let exe_mi = yol
        .extension()
        .map(|e| e.eq_ignore_ascii_case("exe"))
        .unwrap_or(false);
    if !exe_mi || !yol.is_absolute() || yol == simdiki {
        return None;
    }
    if let (Ok(a), Ok(b)) = (yol.canonicalize(), simdiki.canonicalize()) {
        if a == b {
            return None;
        }
    }
    Some(yol)
}

/// Removes the old standalone copy once the process that ran it has exited.
/// Retries, because that process is at most a few seconds from gone; gives up
/// quietly, because a leftover file is untidy and nothing worse.
pub fn eski_kopyayi_kaldir(eski: PathBuf, not: PathBuf) {
    std::thread::spawn(move || {
        for _ in 0..40 {
            if !eski.exists() || fs::remove_file(&eski).is_ok() {
                let _ = fs::remove_file(yan(&eski, ESKI));
                let _ = fs::remove_file(yan(&eski, YENI));
                let _ = fs::remove_file(&not);
                return;
            }
            std::thread::sleep(Duration::from_millis(500));
        }
    });
}

/// The installer downloaded in this session, waiting for "Şimdi yeniden başlat".
static INDIRILEN_KURULUM: std::sync::Mutex<Option<PathBuf>> = std::sync::Mutex::new(None);

/// Is what came down the wire a Windows program, and the one we were promised?
///
/// The size check is what makes a truncated download loud. Without it a
/// connection that dies halfway leaves a half file that renames over the
/// working program perfectly happily, and the next launch does nothing at all
/// -- with the old copy already moved aside.
pub fn verify(bytes: &[u8], boyut: u64) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("İnen dosya boş.".into());
    }
    if boyut != 0 && bytes.len() as u64 != boyut {
        return Err(format!(
            "İnen dosya eksik: {} bayt bekleniyordu, {} geldi.",
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
    Ok(())
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

    fs::rename(exe, eski).map_err(|e| format!("Eski sürüm kenara alınamadı: {e}"))?;
    match fs::rename(yeni, exe) {
        Ok(()) => Ok(()),
        Err(e) => {
            let _ = fs::rename(eski, exe);
            Err(format!("Yeni sürüm yerine konamadı: {e}"))
        }
    }
}

/// Drops the previous version, if one is lying next to us.
///
/// Called at startup rather than right after the swap, because right after the
/// swap the old file is still the process doing the asking.
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
        .get(MANIFEST_URL)
        .send()
        .await
        .map_err(|e| ag_hatasi(&e))?
        .error_for_status()
        .map_err(|e| format!("Sürüm listesi okunamadı: {e}"))?;

    let m: Manifest = yanit
        .json()
        .await
        .map_err(|_| "Sürüm listesi anlaşılamadı.".to_string())?;

    karar(m, &current)
}

/// Downloads next to the running program and stops there. Nothing is replaced
/// until `apply_update`, which is a second button.
#[tauri::command]
pub async fn download_update(url: String, boyut: u64) -> Result<u64, String> {
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

    verify(&bytes, boyut)?;
    if kurulum {
        // The temporary folder, not next to the program: an installed program
        // lives in a folder the installer owns, and the wizard is run once and
        // never kept.
        let hedef = std::env::temp_dir().join(KURULUM_ADI);
        fs::write(&hedef, &bytes).map_err(|e| format!("Kurulum diske yazılamadı: {e}"))?;
        *INDIRILEN_KURULUM
            .lock()
            .map_err(|_| "Kurulum kaydı okunamadı.")? = Some(hedef);
        return Ok(bytes.len() as u64);
    }
    fs::write(yan(&exe, YENI), &bytes).map_err(|e| {
        format!(
            "Yeni sürüm diske yazılamadı: {e}\n\
             Programı Belgelerim gibi yazılabilir bir klasöre taşıyıp tekrar deneyin."
        )
    })?;
    Ok(bytes.len() as u64)
}

#[tauri::command]
pub fn apply_update(app: tauri::AppHandle) -> Result<(), String> {
    self_update_here()?;
    let exe = std::env::current_exe().map_err(|e| format!("Program yolu bulunamadı: {e}"))?;
    let kurulum = INDIRILEN_KURULUM
        .lock()
        .map_err(|_| "Kurulum kaydı okunamadı.")?
        .clone()
        .filter(|p| p.is_file());
    if let Some(kurulum) = kurulum {
        return kurulumu_baslat(&app, &exe, &kurulum);
    }
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
/// `/S` silent (per-user, so no UAC prompt), `/R` start the program again when
/// it is done. `/UPDATE` only when this IS the installed program: it keeps the
/// shortcuts the first install made. The installer closes a copy that is still
/// running (Restart Manager), so exiting right after starting it is the order
/// Tauri's own updater uses.
fn kurulumu_baslat(app: &tauri::AppHandle, exe: &Path, kurulum: &Path) -> Result<(), String> {
    let kurulu = kurulu_mu(exe);
    if !kurulu {
        // A standalone copy: leave the note that lets the installed program
        // remove this file, so the machine is not left with two programs.
        use tauri::Manager;
        if let Ok(dir) = app.path().app_local_data_dir() {
            let _ = fs::create_dir_all(&dir);
            let _ = fs::write(dir.join(ESKI_KOPYA_NOTU), exe.to_string_lossy().as_bytes());
        }
    }
    let mut komut = std::process::Command::new(kurulum);
    komut.args(["/S", "/R"]);
    if kurulu {
        komut.arg("/UPDATE");
    }
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
        assert!(safe_url("https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe").is_ok());
    }

    // ------------------------------------------------------------ the answer

    fn manifest(version: &str, exe: &str) -> Manifest {
        Manifest {
            version: version.into(),
            date: "2026-08-31".into(),
            exe: exe.into(),
            boyut: 3_757_568,
            kurulum: None,
            kurulum_boyut: None,
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
        let c = karar(m, "2.2.0").unwrap();
        assert!(c.kurulum);
        assert_eq!(c.exe, KURULUM);
        assert_eq!(c.boyut, 31_000_000);
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

    #[test]
    fn a_standalone_copy_never_deletes_anything() {
        let tmp = Scratch::new("tek-silmez");
        let simdiki = tmp.exe();
        let eski = tmp.0.join("Ders-Programi.exe");
        fs::write(&eski, b"MZ").unwrap();
        assert_eq!(silinecek_eski(&eski.to_string_lossy(), &simdiki), None);
    }

    #[test]
    fn the_installed_copy_removes_only_another_exe() {
        let tmp = Scratch::new("kurulu-siler");
        let simdiki = tmp.exe();
        fs::write(tmp.0.join("uninstall.exe"), b"MZ").unwrap();
        let eski = tmp.0.join("eski yer").join("Ders Programi.exe");
        assert_eq!(
            silinecek_eski(&format!("{}\n", eski.to_string_lossy()), &simdiki),
            Some(eski)
        );
        // Itself, a relative path, or something that is not a program: no.
        assert_eq!(silinecek_eski(&simdiki.to_string_lossy(), &simdiki), None);
        assert_eq!(silinecek_eski("Ders-Programi.exe", &simdiki), None);
        let belge = tmp.0.join("plan.json");
        assert_eq!(silinecek_eski(&belge.to_string_lossy(), &simdiki), None);
    }

    #[test]
    fn an_up_to_date_copy_is_told_so_whatever_the_address_says() {
        // THE BUG, as my father met it: the repository was renamed, the
        // manifest started carrying the new name, and a copy that had nothing
        // to download answered "Beklenmeyen adres: https://..." instead of
        // "güncel". Nothing was being fetched -- there was nothing newer.
        let c = karar(manifest("2.0.2", "https://baska-yer.example/Mozaik.exe"), "2.0.2").unwrap();
        assert!(!c.yeni_var);
    }

    #[test]
    fn a_new_version_behind_an_unknown_address_says_where_to_go() {
        // Still an error -- this build cannot fetch that -- but one that can
        // be acted on: the version, and the page to download it from.
        let e = karar(manifest("9.0.0", "https://baska-yer.example/Mozaik.exe"), "2.0.2")
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
        assert!(verify(b"MZ\x90\x00", 4).is_ok());
        assert!(verify(b"", 0).is_err());
        // A captive portal's HTML page: the realistic failure.
        assert!(verify(b"<!doctype html>", 15).is_err());
        // Truncated: right shape, wrong length.
        assert!(verify(b"MZ", 4).is_err());
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
