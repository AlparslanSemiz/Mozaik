//! The .exe checking whether a newer one exists, and replacing itself with it.
//!
//! WHAT THIS IS NOT. It is not an updater in the sense principle 1 forbids:
//! nothing here runs on its own. There is no timer, no check at startup, no
//! background thread. Every one of the three commands below runs because
//! somebody pressed a button in Ayarlar, and the three are separate buttons on
//! purpose: look, download, restart. My father can stop after any of them and
//! keep working on the version he has.
//!
//! WHY IT REACHES THE NETWORK AT ALL. Principle 3 is about the running
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
const RELEASE_KOK: &str = "https://github.com/AlparslanSemiz/Mozaik/releases/";

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
    if !url.starts_with(RELEASE_KOK) {
        return Err(format!("Beklenmeyen adres: {url}"));
    }
    Ok(())
}

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
/// (principle 1: the delivery is one file, not a wizard). Both renames are
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
    // A leftover from an earlier update. Renaming onto an existing file fails
    // on Windows, so this has to go first.
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

    safe_url(&m.exe)?;
    Ok(Cevap {
        yeni_var: is_newer(&m.version, &current),
        version: m.version,
        date: m.date,
        exe: m.exe,
        boyut: m.boyut,
    })
}

/// Downloads next to the running program and stops there. Nothing is replaced
/// until `apply_update`, which is a second button.
#[tauri::command]
pub async fn download_update(url: String, boyut: u64) -> Result<u64, String> {
    safe_url(&url)?;
    let exe = std::env::current_exe().map_err(|e| format!("Program yolu bulunamadı: {e}"))?;

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
    let exe = std::env::current_exe().map_err(|e| format!("Program yolu bulunamadı: {e}"))?;
    swap(&exe)?;
    std::process::Command::new(&exe)
        .spawn()
        .map_err(|e| format!("Yeni sürüm başlatılamadı: {e}"))?;
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
    fn the_manifest_is_under_the_pinned_prefix() {
        // Two literals that must agree; this is the only thing that says so.
        assert!(MANIFEST_URL.starts_with(RELEASE_KOK));
    }

    #[test]
    fn only_our_own_releases_are_fetched() {
        assert!(safe_url(&format!("{RELEASE_KOK}latest/download/Mozaik.exe")).is_ok());
        // v2.0.0 renames the delivery file; the gate must not care.
        assert!(safe_url(&format!("{RELEASE_KOK}latest/download/Mozaik.exe")).is_ok());
        for bad in [
            "http://github.com/AlparslanSemiz/Mozaik/releases/latest/download/x.exe",
            "https://example.com/x.exe",
            "https://github.com/baskasi/depo/releases/latest/download/x.exe",
            "file:///etc/passwd",
            "",
        ] {
            assert!(safe_url(bad).is_err(), "kabul edildi: {bad}");
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
        // Windows refuses to rename onto an existing file, so the second
        // update in a row would fail without the remove.
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
