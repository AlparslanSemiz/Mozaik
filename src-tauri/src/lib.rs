//! The .exe shell — task 4g/4h.
//!
//! What this is NOT: a backend. The no-server principle is unchanged; there is no server,
//! no database, no account and no API here. There is one folder and four
//! calls that write, list, read back and remove the files in it.
//!
//! WHY IT EXISTS AT ALL. The tool already reaches my father three other ways
//! (a double-clicked dist/index.html, a GitHub Pages site, a local server on
//! his own machine), and the first of those is still the main delivery. What
//! none of them can do is write to a folder without being ASKED: the browser
//! route needs `showDirectoryPicker`, which needs a click, a permission and a
//! handle that a cleared browser profile forgets. In the exe, the answer to
//! "nereye kaydedilsin" is already known — Belgelerim/Ders Programı — and no
//! habit has to be taught (no-data-loss principle).
//!
//! WHERE THE RULES LIVE. Not here. The file names, the daily-backup name, the
//! "keep the last ten" prune and the flush order are all in `src/folder.ts`
//! and stay there — `src/desktop.ts` dresses these commands up as a
//! `FileSystemDirectoryHandle` so `saveInto()` runs UNCHANGED in the exe. A
//! rule that means one thing in the browser and another in the exe is the
//! thing this project spends most of its comments avoiding.

mod cpsat;
mod mail;
mod update;
mod update_mac;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tauri::{Emitter, Manager};

/// The folder under Belgelerim. Turkish on purpose: this is a name my father
/// reads in Explorer, so it falls under the same exception as the
/// localStorage keys and the downloaded backup's file name.
///
/// It did NOT move when the program was renamed to Mozaik, and that is a data
/// decision rather than an oversight: a folder somebody's timetables already
/// live in is data. The same string is `EXE_FOLDER` in `src/desktop.ts`.
const FOLDER: &str = "Ders Programı";

// AND NEITHER DID THE BUNDLE IDENTIFIER, for a harder reason than the folder.
//
// `tauri.conf.json` says `com.dersprogrami.arac` under a program called
// Mozaik, and that looks like something nobody finished renaming. It is the
// opposite: Tauri hands WebView2 `%LOCALAPPDATA%/<identifier>` as its profile,
// so that string is the PATH localStorage sits under — every plan, every
// preference, the whole backup chain. Measured on a machine that had run the
// exe: `%LOCALAPPDATA%/com.dersprogrami.arac/EBWebView/Default/Local Storage/
// leveldb` holds `ders-programi`, `ders-programi-planlar`,
// `ders-programi-yedek-0`, at the `http://tauri.localhost` origin.
//
// v2.0.0 renamed it to `me.mozaik.arac` beside `productName`, which means an
// exe built from that commit opens a brand new empty profile: the data is
// still on the disk, none of it is visible, and nothing on screen says why.
// `src/surum.test.ts` pins the string now, because a name that is really an
// address will look renameable again the next time somebody reads it.

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
///
/// THE BYTES REACH THE DISK BEFORE THE NAME DOES. A rename alone is atomic for
/// the NAME, not for the contents: NTFS journals the rename, not the data, so a
/// power cut after the rename and before the cache is written back can leave
/// `ders-programi-tumu.json` empty or full of zeros, which is exactly the crash
/// principle 6 is about (security review 2026-11-15, V2). So the temporary file
/// is `sync_all`ed first, and on Unix the folder too, so the rename itself
/// survives. Windows cannot open a folder as a plain file (it needs
/// `FILE_FLAG_BACKUP_SEMANTICS`), and NTFS journals the rename anyway.
fn write_in(dir: &Path, name: &str, text: &str) -> Result<(), String> {
    use std::io::Write;
    safe_name(name)?;
    let tmp = dir.join(format!("{name}.tmp"));
    let yaz = || -> std::io::Result<()> {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(text.as_bytes())?;
        f.sync_all()
    };
    if let Err(e) = yaz() {
        let _ = fs::remove_file(&tmp);
        return Err(format!("Yazılamadı: {e}"));
    }
    fs::rename(&tmp, dir.join(name)).map_err(|e| format!("Yerine konamadı: {e}"))?;
    #[cfg(unix)]
    if let Ok(klasor) = fs::File::open(dir) {
        let _ = klasor.sync_all();
    }
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

/// Reads one file back, or `None` when it is not there.
///
/// The page reads its own files before two decisions (`src/platform/storage/folder.ts`,
/// A2 of the 2026-10-24 audit): whether an empty bundle may go over a file,
/// and which daily backups hold work and count toward the ten that are kept.
/// The same name gate as writing: it can read exactly one folder.
fn read_in(dir: &Path, name: &str) -> Result<Option<String>, String> {
    safe_name(name)?;
    match fs::read_to_string(dir.join(name)) {
        Ok(text) => Ok(Some(text)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(format!("Okunamadı: {e}")),
    }
}

/// Is this exactly `YYYY-MM-DD`?
fn tarih_mi(b: &[u8]) -> bool {
    b.len() == 10
        && b.iter().enumerate().all(|(i, c)| match i {
            4 | 7 => *c == b'-',
            _ => c.is_ascii_digit(),
        })
}

/// Is this the name of a daily backup: `ders-programi-YYYY-MM-DD.json`?
///
/// The same shape as `DAILY` in `src/platform/storage/folder.ts`.
fn gunluk_yedek_mi(name: &str) -> bool {
    name.strip_prefix("ders-programi-")
        .and_then(|n| n.strip_suffix(".json"))
        .is_some_and(|t| tarih_mi(t.as_bytes()))
}

/// Is this a name the page's prune may delete: a daily backup, a rescue copy
/// (`ders-programi-kurtarma-YYYY-MM-DD[-HHMMSS].json`) or a before-deletion
/// file (`ders-programi-silmeden-once-YYYY-MM-DD.json`)? The same shapes as
/// `DAILY` and `SPARES` in folder.ts, and nothing looser.
fn yedek_mi(name: &str) -> bool {
    if gunluk_yedek_mi(name) {
        return true;
    }
    let Some(govde) = name.strip_suffix(".json") else {
        return false;
    };
    if let Some(t) = govde.strip_prefix("ders-programi-silmeden-once-") {
        return tarih_mi(t.as_bytes());
    }
    let Some(t) = govde.strip_prefix("ders-programi-kurtarma-") else {
        return false;
    };
    let b = t.as_bytes();
    tarih_mi(b)
        || (b.len() == 17
            && tarih_mi(&b[..10])
            && b[10] == b'-'
            && b[11..].iter().all(u8::is_ascii_digit))
}

/// Deletes one backup. Missing is not an error: the caller is pruning.
///
/// ONLY a dated backup this program writes (`yedek_mi`). The page decides WHICH ones go (`prunable()`), but
/// what may go at all is decided here too: a bug or a script in the page
/// could otherwise delete any `.json` in the folder, my father's own files
/// among them (security review 2026-11-15, G7). Listing still shows
/// everything; deleting does not reach everything.
fn remove_in(dir: &Path, name: &str) -> Result<(), String> {
    safe_name(name)?;
    if !yedek_mi(name) {
        return Err(format!("Yalnız tarihli yedek silinir: {name}"));
    }
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

#[tauri::command]
fn read_file(app: tauri::AppHandle, name: String) -> Result<Option<String>, String> {
    read_in(&data_dir(&app)?, &name)
}

/// The folder's path, for the "Veriler nerede" table — a person who is told
/// where their data is should be told the actual place.
#[tauri::command]
fn data_dir_path(app: tauri::AppHandle) -> Result<String, String> {
    Ok(data_dir(&app)?.to_string_lossy().into_owned())
}

// CLOSING THE WINDOW WAITS FOR THE PAGE (TB7). The page writes Belgeler two
// seconds after the last change, and the store 0.4 s after it; a window closed
// inside those seconds took the last edit with it, because a webview torn down
// does not finish an asynchronous write (measured on the Linux exe, 2026-10-24:
// 0 of 3 closes inside two seconds reached the folder, 2 of 2 after them did).
// So the close is held, the page is told (`KAPANIYOR`), and the page answers
// with `kapanabilir` once both are written. A page that never answers — hung,
// or still loading — does not keep the window: it closes after `KAPANIS_SURESI`.

/// The event the page listens for. The same string is in `src/platform/desktop.ts`.
const KAPANIYOR: &str = "kapaniyor";

/// How long a close waits for the page at most. A folder write is a few
/// milliseconds; this is for a page that is not going to answer.
const KAPANIS_SURESI: Duration = Duration::from_secs(5);

/// The page has written everything: the window may go.
#[tauri::command]
fn kapanabilir(window: tauri::Window) {
    // `destroy`, not `close`: close would ask again and be held again.
    let _ = window.destroy();
}

/// No "already asked" flag: a second click while the page writes tells it
/// again and starts a second timer, both harmless, and a flag that stuck would
/// be the one way to a window nobody can close.
fn kapanis_istendi(window: &tauri::Window, api: &tauri::CloseRequestApi) {
    api.prevent_close();
    let _ = window.emit(KAPANIYOR, ());
    let pencere = window.clone();
    std::thread::spawn(move || {
        std::thread::sleep(KAPANIS_SURESI);
        let _ = pencere.destroy();
    });
}

/// Once per process: a page reloaded later has nothing left to sweep.
static ESKI_SUPURME: std::sync::Once = std::sync::Once::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Linux only: draw without WebKitGTK's DMA-BUF renderer, unless the shell
/// already says otherwise.
///
/// On this development machine (Fedora 44, Intel GPU, Mesa 26.2 `iris`) the
/// page process aborted inside the GPU driver every time a pinned card was
/// drawn, and the window went blank (tuzak 130). Without that renderer WebKit
/// shares pixels through memory instead, and the same click draws. Windows is
/// untouched: the father's Mozaik.exe is WebView2, and this is not compiled in.
#[cfg(target_os = "linux")]
fn linux_renderer() {
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
}

/// The Mac's menu bar, in Turkish (DECISIONS 2026-11-15, Mac).
///
/// A Mac program without an Edit menu loses Cmd+C, Cmd+V, Cmd+X and Cmd+A in
/// every text box: on macOS those keys are menu items first, and a window
/// with no item for them never sees them. Tauri's own default menu has them,
/// in English; this is the same menu in the language the rest of the program
/// speaks. Cmd+Z and Shift+Cmd+Z reach the page first either way (WKWebView
/// offers a key to the page before the menu), so the timetable's own undo in
/// `useStore.ts` still answers them outside a text box.
///
/// QUIT IS OURS, NOT THE PREDEFINED ONE. The predefined item calls
/// `-[NSApp terminate:]`, which ends the process without a `CloseRequested`:
/// the page is never told (`KAPANIYOR`) and the last two seconds of work are
/// not written to Belgeler (TB7, the same loss the close button had). So
/// Cmd+Q closes the window the way its red button does, and the program ends
/// when that window has gone.
#[cfg(target_os = "macos")]
fn mac_menusu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem, Submenu};
    let hakkinda = AboutMetadata {
        name: Some("Mozaik".into()),
        version: Some(app.package_info().version.to_string()),
        ..Default::default()
    };
    let uygulama = Submenu::with_items(
        app,
        "Mozaik",
        true,
        &[
            &PredefinedMenuItem::about(app, Some("Mozaik Hakkında"), Some(hakkinda))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, Some("Mozaik'i Gizle"))?,
            &PredefinedMenuItem::hide_others(app, Some("Diğerlerini Gizle"))?,
            &PredefinedMenuItem::show_all(app, Some("Tümünü Göster"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, MENU_CIK, "Mozaik'ten Çık", true, Some("CmdOrCtrl+Q"))?,
        ],
    )?;
    let duzen = Submenu::with_items(
        app,
        "Düzen",
        true,
        &[
            &PredefinedMenuItem::undo(app, Some("Geri Al"))?,
            &PredefinedMenuItem::redo(app, Some("Yinele"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, Some("Kes"))?,
            &PredefinedMenuItem::copy(app, Some("Kopyala"))?,
            &PredefinedMenuItem::paste(app, Some("Yapıştır"))?,
            &PredefinedMenuItem::select_all(app, Some("Tümünü Seç"))?,
        ],
    )?;
    let pencere = Submenu::with_items(
        app,
        "Pencere",
        true,
        &[
            &PredefinedMenuItem::minimize(app, Some("Küçült"))?,
            &PredefinedMenuItem::maximize(app, Some("Büyüt"))?,
            &PredefinedMenuItem::fullscreen(app, Some("Tam Ekran"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::close_window(app, Some("Pencereyi Kapat"))?,
        ],
    )?;
    Menu::with_items(app, &[&uygulama, &duzen, &pencere])
}

/// The id of our own Quit item (`mac_menusu` says why it is not the predefined one).
#[cfg(target_os = "macos")]
const MENU_CIK: &str = "cik";

pub fn run() {
    // Before any webview exists, and while this is still the only thread.
    #[cfg(target_os = "linux")]
    linux_renderer();

    let args: Vec<String> = std::env::args().collect();

    // The installer's waiter (update.rs, `kurulumu_baslat`): no window, no
    // single instance; it runs the installer and ends.
    if let Some(bekleyici) = update::bekleyici_mi(&args) {
        update::bekle_ve_bitir(bekleyici);
    }

    // Started by `apply_update`: wait for the old version to be gone before
    // claiming the single instance below (`update::eskisi_gitsin` says why).
    if args.iter().any(|a| a == update::GUNCELLENDI) {
        update::eskisi_gitsin(std::io::stdin(), update::DEVIR_SURESI);
    }

    if let Ok(exe) = std::env::current_exe() {
        update::acilis(&args, &exe);
        // A standalone copy on a machine where Mozaik is installed opens the
        // installed program instead, before it claims the single instance:
        // the pin and the shortcut to the old file keep working (TRAPS 162).
        // Not after an installer that did not finish: then this copy is the
        // one that works.
        // Not a development build either: `tauri dev` on a machine where Mozaik
        // is installed must run the code being worked on.
        #[cfg(all(windows, not(debug_assertions)))]
        if !args.iter().any(|a| a == update::KURULUM_OLMADI) {
            if let Some(yerel) = std::env::var_os("LOCALAPPDATA") {
                let surum = env!("CARGO_PKG_VERSION");
                if let Some(kurulu) = update::kurulu_program(Path::new(&yerel), &exe, surum) {
                    let devir = std::process::Command::new(&kurulu)
                        .arg(update::GUNCELLENDI)
                        .stdin(std::process::Stdio::piped())
                        .spawn();
                    if let Ok(cocuk) = devir {
                        std::mem::forget(cocuk);
                        std::process::exit(0);
                    }
                }
            }
        }
    }

    let builder = tauri::Builder::default();
    #[cfg(target_os = "macos")]
    let builder = builder.menu(mac_menusu).on_menu_event(|app, olay| {
        if olay.id() == MENU_CIK {
            match app.get_webview_window("main") {
                // `close`, not `destroy`: through `kapanis_istendi`, like the red button.
                Some(pencere) => {
                    let _ = pencere.close();
                }
                None => app.exit(0),
            }
        }
    });

    builder
        // FIRST, before anything else is set up: one copy of the program at a
        // time (VK1). Two copies each held the plan in memory, and the one
        // closed last wrote its old copy over the other's work, in
        // localStorage and in both files under Belgeler (measured by the test
        // session, 2026-10-09). A second launch brings this window forward
        // and exits.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(pencere) = app.get_webview_window("main") {
                let _ = pencere.unminimize();
                let _ = pencere.show();
                let _ = pencere.set_focus();
            }
        }))
        // The installed program leaves its own path where a standalone copy
        // looks for it (update.rs, `KURULU_NOTU`), and clears the installer's
        // waiter out of the temporary folder. Right after an install the waiter
        // is still running and this fails; the next start, or the next
        // `kurulumu_baslat`, removes it.
        .setup(|app| {
            if let (Ok(dir), Ok(exe)) = (app.path().app_local_data_dir(), std::env::current_exe()) {
                if update::kurulu_mu(&exe) {
                    let _ = fs::create_dir_all(&dir);
                    let _ = fs::write(dir.join(update::KURULU_NOTU), update::kurulu_notu(&exe));
                }
            }
            let _ = fs::remove_file(std::env::temp_dir().join(update::BEKLEYICI_ADI));
            Ok(())
        })
        // The version this replaced, if we are the replacement, goes only once
        // THIS version has drawn its page. Not at the first line of `run`, as
        // it used to: a new version that cannot open its window (a WebView2
        // error, a missing DLL) then had already deleted the one copy that
        // still worked (security review 2026-11-15, V9). Kept, `.eski` is what
        // a person renames back by hand; the next swap clears it anyway.
        .on_page_load(|_webview, payload| {
            if payload.event() == tauri::webview::PageLoadEvent::Finished {
                ESKI_SUPURME.call_once(|| {
                    if let Ok(exe) = std::env::current_exe() {
                        update::sweep_old(&exe);
                    }
                });
            }
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                kapanis_istendi(window, api);
            }
        })
        .invoke_handler(tauri::generate_handler![
            kapanabilir,
            write_file,
            list_files,
            remove_file,
            read_file,
            data_dir_path,
            mail::eposta_ac,
            update::check_update,
            update::self_update_supported,
            update::download_update,
            update::apply_update,
            update::guncelleme_durumu,
            cpsat::cpsat_var,
            cpsat::cpsat_coz,
            cpsat::cpsat_durdur
        ])
        .run(tauri::generate_context!())
        .expect("Mozaik başlatılamadı");
}

#[cfg(all(test, target_os = "linux"))]
mod linux_tests {
    use super::linux_renderer;

    // One test, not two: both touch the process environment, and tests run on
    // threads of one process.
    #[test]
    fn linux_renderer_sets_the_variable_and_respects_the_shell() {
        std::env::remove_var("WEBKIT_DISABLE_DMABUF_RENDERER");
        linux_renderer();
        assert_eq!(
            std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").as_deref(),
            Ok("1")
        );

        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "0");
        linux_renderer();
        assert_eq!(
            std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").as_deref(),
            Ok("0")
        );
        std::env::remove_var("WEBKIT_DISABLE_DMABUF_RENDERER");
    }
}

#[cfg(test)]
mod tests {
    use super::{gunluk_yedek_mi, list_in, read_in, remove_in, safe_name, write_in, yedek_mi};
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
        assert!(read_in(&s.0, "../kacti.json").is_err());
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
        assert_eq!(
            names,
            ["ders-programi-2026-08-27.json", "ders-programi-tumu.json"]
        );

        remove_in(&s.0, "ders-programi-2026-08-27.json").unwrap();
        assert_eq!(list_in(&s.0).unwrap(), ["ders-programi-tumu.json"]);

        // Pruning something already gone is the normal case, not an error.
        remove_in(&s.0, "ders-programi-2026-08-27.json").unwrap();
    }

    #[test]
    fn reads_back_and_answers_none_for_a_missing_file() {
        let s = Scratch::new("read");
        write_in(&s.0, "ders-programi-tumu.json", "{\"bundleVersion\":1}").unwrap();
        assert_eq!(
            read_in(&s.0, "ders-programi-tumu.json").unwrap().as_deref(),
            Some("{\"bundleVersion\":1}")
        );
        // Not there is an answer, not an error: the page then may write.
        assert_eq!(
            read_in(&s.0, "ders-programi-2026-08-27.json").unwrap(),
            None
        );
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
    fn a_temporary_left_by_a_crash_is_written_over_and_does_not_stay() {
        // A power cut between the write and the rename leaves `name.json.tmp`
        // behind, possibly empty. The next save must not append to it or trip
        // on it: the file read back is the new text, and no `.tmp` stays.
        let s = Scratch::new("crash-tmp");
        fs::write(
            s.0.join("ders-programi-tumu.json.tmp"),
            "yarim kalmis cok daha uzun bir metin",
        )
        .unwrap();
        write_in(&s.0, "ders-programi-tumu.json", "{\"bundleVersion\":1}").unwrap();

        assert_eq!(list_in(&s.0).unwrap(), ["ders-programi-tumu.json"]);
        assert_eq!(
            read_in(&s.0, "ders-programi-tumu.json").unwrap().as_deref(),
            Some("{\"bundleVersion\":1}")
        );
    }

    #[test]
    fn a_failed_write_leaves_the_old_file_and_no_temporary() {
        // The temporary cannot be created (a folder holds its name): the save
        // fails loudly and the file that was there is untouched.
        let s = Scratch::new("fail-tmp");
        write_in(&s.0, "ders-programi-tumu.json", "eski").unwrap();
        fs::create_dir(s.0.join("ders-programi-tumu.json.tmp")).unwrap();
        assert!(write_in(&s.0, "ders-programi-tumu.json", "yeni").is_err());
        assert_eq!(
            fs::read_to_string(s.0.join("ders-programi-tumu.json")).unwrap(),
            "eski"
        );
    }

    #[test]
    fn only_a_dated_backup_can_be_removed() {
        // The live bundle, the top bar's hourly backup and my father's own
        // `.json` all pass `safe_name`; none of them may be deleted through
        // `remove_file`.
        let s = Scratch::new("remove-gate");
        for ad in [
            "ders-programi-tumu.json",
            "ders-programi-2026-08-26-1430.json",
            "ders-programi-kurtarma-2026-11-15-1010.json",
            "ders-programi-kurtarma-notlar.json",
            "ders-programi-silmeden-once-2026-11-15-101010.json",
            "vergi-beyani.json",
        ] {
            fs::write(s.0.join(ad), "x").unwrap();
            assert!(remove_in(&s.0, ad).is_err(), "silinebildi: {ad}");
            assert!(s.0.join(ad).exists(), "silindi: {ad}");
        }
        assert!(gunluk_yedek_mi("ders-programi-2026-08-27.json"));
        for kotu in [
            "ders-programi-2026-8-27.json",
            "ders-programi-2026-08-27.json.tmp",
            "ders-programi-2026_08_27.json",
            "ders-programi-20260-8-27.json",
            "xders-programi-2026-08-27.json",
        ] {
            assert!(!gunluk_yedek_mi(kotu), "kabul edildi: {kotu}");
            assert!(!yedek_mi(kotu), "kabul edildi: {kotu}");
        }
        // The rescue and before-deletion files the prune keeps ten of.
        for ad in [
            "ders-programi-2026-08-27.json",
            "ders-programi-kurtarma-2026-11-15.json",
            "ders-programi-kurtarma-2026-11-15-101010.json",
            "ders-programi-silmeden-once-2026-11-15.json",
        ] {
            fs::write(s.0.join(ad), "x").unwrap();
            remove_in(&s.0, ad).unwrap();
            assert!(!s.0.join(ad).exists(), "silinmedi: {ad}");
        }
        for kotu in [
            "ders-programi-kurtarma-2026-11-15-10101.json",
            "ders-programi-kurtarma-2026-11-15-1010101.json",
            "ders-programi-kurtarma-2026-11-15-10101x.json",
            "ders-programi-kurtarma-2026-11-15.json.tmp",
            "ders-programi-silmeden-once-2026-11-15.jsonx",
            "xders-programi-kurtarma-2026-11-15.json",
        ] {
            assert!(!yedek_mi(kotu), "kabul edildi: {kotu}");
        }
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
