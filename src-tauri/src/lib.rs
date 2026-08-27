//! The .exe shell — task 4g/4h.
//!
//! What this is NOT: a backend. Principle 2 is unchanged; there is no server,
//! no database, no account and no API here. There is one folder and three
//! calls that put files in it.
//!
//! WHY IT EXISTS AT ALL. The tool already reaches my father three other ways
//! (a double-clicked dist/index.html, a GitHub Pages site, a local server on
//! his own machine), and the first of those is still the main delivery. What
//! none of them can do is write to a folder without being ASKED: the browser
//! route needs `showDirectoryPicker`, which needs a click, a permission and a
//! handle that a cleared browser profile forgets. In the exe, the answer to
//! "nereye kaydedilsin" is already known — Belgelerim/Ders Programı — and no
//! habit has to be taught (principle 6).
//!
//! WHERE THE RULES LIVE. Not here. The file names, the daily-backup name, the
//! "keep the last ten" prune and the flush order are all in `src/folder.ts`
//! and stay there — `src/desktop.ts` dresses these three commands up as a
//! `FileSystemDirectoryHandle` so `saveInto()` runs UNCHANGED in the exe. A
//! rule that means one thing in the browser and another in the exe is the
//! thing this project spends most of its comments avoiding.

mod update;

use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

/// The folder under Belgelerim. Turkish on purpose: this is a name my father
/// reads in Explorer, so it falls under the same exception as the
/// localStorage keys and the downloaded backup's file name.
const FOLDER: &str = "Ders Programı";

/// Creates the folder on first use and hands back its path.
fn data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let docs = app
        .path()
        .document_dir()
        .map_err(|_| "Belgelerim klasörü bulunamadı.".to_string())?;
    let dir = docs.join(FOLDER);
    fs::create_dir_all(&dir).map_err(|e| format!("Klasör açılamadı: {e}"))?;
    Ok(dir)
}

/// A name is a NAME, never a path.
///
/// Everything that reaches these commands comes from `folder.ts`, which only
/// ever produces `ders-programi-*.json` — but "the caller is well behaved" is
/// not a security boundary, it is a hope. A `..` or a drive letter getting
/// through here would let a bug in the page write anywhere on the disk, and
/// the whole point of this file is that it can touch exactly one folder.
fn safe_name(name: &str) -> Result<(), String> {
    let bad = name.is_empty()
        || name.len() > 128
        || !name.ends_with(".json")
        || name.contains('/')
        || name.contains('\\')
        || name.contains(':')
        || name.contains("..");
    if bad {
        return Err(format!("Geçersiz dosya adı: {name}"));
    }
    Ok(())
}

/// Writes one file, atomically.
///
/// Through a temporary file and a rename, because the alternative is a
/// truncated JSON where the only copy of a term's work used to be. Principle
/// 6: a crash in the middle of a write must not be able to eat the file that
/// was already there.
///
/// Takes the DIRECTORY rather than the AppHandle, and that is the whole
/// reason this file is split in two. `document_dir()` under `cargo test` is
/// my own real Documents folder, so a test that went through the command
/// would write its fixtures into it — and a test that is afraid to run is not
/// a test. These three functions are everything this file DOES; the
/// `#[tauri::command]` wrappers below them only answer "which folder".
fn write_in(dir: &Path, name: &str, text: &str) -> Result<(), String> {
    safe_name(name)?;
    let tmp = dir.join(format!("{name}.tmp"));
    fs::write(&tmp, text.as_bytes()).map_err(|e| format!("Yazılamadı: {e}"))?;
    fs::rename(&tmp, dir.join(name)).map_err(|e| format!("Yerine konamadı: {e}"))?;
    Ok(())
}

/// Every file name in the folder, so `prunable()` can pick the old ones.
///
/// Names only, and names of everything — including my father's own files, if
/// he keeps any there. That is deliberate: `prunable()` filters by the
/// pattern this program writes, and it can only do that if it sees the whole
/// list. Filtering here would put the same rule in two places.
fn list_in(dir: &Path) -> Result<Vec<String>, String> {
    let mut names = Vec::new();
    for entry in fs::read_dir(dir).map_err(|e| format!("Klasör okunamadı: {e}"))? {
        let entry = entry.map_err(|e| format!("Klasör okunamadı: {e}"))?;
        if entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            names.push(entry.file_name().to_string_lossy().into_owned());
        }
    }
    Ok(names)
}

/// Deletes one daily backup. Missing is not an error: the caller is pruning.
fn remove_in(dir: &Path, name: &str) -> Result<(), String> {
    safe_name(name)?;
    match fs::remove_file(dir.join(name)) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(format!("Silinemedi: {e}")),
    }
}

#[tauri::command]
fn write_file(app: tauri::AppHandle, name: String, text: String) -> Result<(), String> {
    write_in(&data_dir(&app)?, &name, &text)
}

#[tauri::command]
fn list_files(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    list_in(&data_dir(&app)?)
}

#[tauri::command]
fn remove_file(app: tauri::AppHandle, name: String) -> Result<(), String> {
    remove_in(&data_dir(&app)?, &name)
}

/// The folder's path, for the "Veriler nerede" table — a person who is told
/// where their data is should be told the actual place.
#[tauri::command]
fn data_dir_path(app: tauri::AppHandle) -> Result<String, String> {
    Ok(data_dir(&app)?.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // The version this replaced, if we are the replacement. Here rather than
    // right after the swap, because right after the swap that file is still
    // the process doing the asking.
    if let Ok(exe) = std::env::current_exe() {
        update::sweep_old(&exe);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            write_file,
            list_files,
            remove_file,
            data_dir_path,
            update::check_update,
            update::download_update,
            update::apply_update
        ])
        .run(tauri::generate_context!())
        .expect("Ders Programı başlatılamadı");
}

#[cfg(test)]
mod tests {
    use super::{list_in, remove_in, safe_name, write_in};
    use std::fs;
    use std::path::PathBuf;

    /// A scratch directory under the OS temp dir, cleaned up on drop.
    ///
    /// No `tempfile` crate: it would be a dependency for eleven lines, and
    /// this project counts dependencies out loud.
    struct Scratch(PathBuf);

    impl Scratch {
        fn new(tag: &str) -> Self {
            let dir = std::env::temp_dir().join(format!("ders-programi-test-{tag}"));
            let _ = fs::remove_dir_all(&dir);
            fs::create_dir_all(&dir).unwrap();
            Scratch(dir)
        }
    }

    impl Drop for Scratch {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    // ------------------------------------------------------------- the gate

    #[test]
    fn accepts_what_folder_ts_writes() {
        assert!(safe_name("ders-programi-tumu.json").is_ok());
        assert!(safe_name("ders-programi-2026-08-27.json").is_ok());
    }

    #[test]
    fn refuses_anything_that_is_a_path() {
        for bad in [
            "",
            "not-json.txt",
            "../gizli.json",
            "alt/klasor.json",
            "alt\\klasor.json",
            "C:notes.json",
        ] {
            assert!(safe_name(bad).is_err(), "kabul edildi: {bad}");
        }
    }

    #[test]
    fn the_gate_is_on_the_functions_too() {
        // The check belongs to the writing, not to the wrapper: a future
        // caller that skips `write_file` must not skip the gate with it.
        let s = Scratch::new("gate");
        assert!(write_in(&s.0, "../kacti.json", "x").is_err());
        assert!(remove_in(&s.0, "../kacti.json").is_err());
        assert!(!s.0.parent().unwrap().join("kacti.json").exists());
    }

    // ------------------------------------------------------------ the disk

    #[test]
    fn writes_and_lists_and_removes() {
        let s = Scratch::new("round");
        write_in(&s.0, "ders-programi-tumu.json", "{\"bundleVersion\":1}").unwrap();
        write_in(&s.0, "ders-programi-2026-08-27.json", "{}").unwrap();

        let mut names = list_in(&s.0).unwrap();
        names.sort();
        assert_eq!(names, ["ders-programi-2026-08-27.json", "ders-programi-tumu.json"]);

        remove_in(&s.0, "ders-programi-2026-08-27.json").unwrap();
        assert_eq!(list_in(&s.0).unwrap(), ["ders-programi-tumu.json"]);

        // Pruning something already gone is the normal case, not an error.
        remove_in(&s.0, "ders-programi-2026-08-27.json").unwrap();
    }

    #[test]
    fn overwriting_leaves_no_half_file_and_no_litter() {
        // The atomic write goes through `name.json.tmp`. If that temporary
        // ever survived, `list_in` would hand it to `prunable()`, which does
        // not match it — so it would accumulate in my father's Documents
        // forever, one per save.
        let s = Scratch::new("atomic");
        write_in(&s.0, "ders-programi-tumu.json", "eski").unwrap();
        write_in(&s.0, "ders-programi-tumu.json", "yeni").unwrap();

        assert_eq!(list_in(&s.0).unwrap(), ["ders-programi-tumu.json"]);
        assert_eq!(
            fs::read_to_string(s.0.join("ders-programi-tumu.json")).unwrap(),
            "yeni"
        );
    }

    #[test]
    fn listing_shows_files_this_program_did_not_write() {
        // `prunable()` in folder.ts is safe precisely because it filters by
        // the name pattern, and it can only do that if it is shown
        // everything. A listing that quietly filtered here would move that
        // rule into a second place — and the second place would be the one
        // deleting my father's own files.
        let s = Scratch::new("foreign");
        fs::write(s.0.join("vergi-beyani.json"), "benim").unwrap();
        fs::create_dir(s.0.join("bir-klasor")).unwrap();
        write_in(&s.0, "ders-programi-tumu.json", "{}").unwrap();

        let mut names = list_in(&s.0).unwrap();
        names.sort();
        assert_eq!(names, ["ders-programi-tumu.json", "vergi-beyani.json"]);
    }
}
