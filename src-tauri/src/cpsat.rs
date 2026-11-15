//! OR-Tools CP-SAT for the suggestion search (DECISIONS 2026-11-15).
//!
//! The page builds the question (src/pure/relax/cpsat.ts) and sends it here as
//! bytes: a serialized `CpModelProto` and `SatParameters`. This file hands them
//! to the library's C API and hands back the serialized `CpSolverResponse`.
//! Rust never reads the model: no protobuf crate, no generated code, and a
//! model the page gets wrong is an answer the page's own checker
//! (`verifySuggestion`) refuses, never a wrong week.
//!
//! THE LIBRARY IS OPTIONAL. The installer puts `ortools.dll` and the DLLs it
//! needs next to the program (tauri.conf.json, `bundle.resources`), and the Mac
//! .app carries `libortools.9.dylib` and the dylibs it loads in
//! `Contents/Frameworks` (scripts/ortools-mac.sh); the standalone exe, the
//! Linux development build and a broken install have none.
//! `cpsat_var` says which, and the page falls back to its own search.
//!
//! The five functions are the ones `ortools/sat/c_api/cp_solver_c.h` declares
//! (v9.15), loaded by name so that a missing library is a sentence, not a
//! program that will not start.

use std::ffi::{c_int, c_void};
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

type Interruptible = unsafe extern "C" fn(
    env: *mut c_void,
    req: *const c_void,
    req_len: c_int,
    params: *const c_void,
    params_len: c_int,
    res: *mut *mut c_void,
    res_len: *mut c_int,
);
type NewEnv = unsafe extern "C" fn() -> *mut c_void;
type EnvFn = unsafe extern "C" fn(env: *mut c_void);

struct Cpsat {
    // Kept alive for as long as the function pointers below are used: the
    // library is never unloaded.
    _lib: libloading::Library,
    interruptible: Interruptible,
    new_env: NewEnv,
    destroy_env: EnvFn,
    stop: EnvFn,
}

/// The library's file name on each platform. Windows and the Mac are
/// delivered; Linux is how the Rust side is tested on a development machine.
const AD: &str = if cfg!(windows) {
    "ortools.dll"
} else if cfg!(target_os = "macos") {
    "libortools.9.dylib"
} else {
    "libortools.so.9"
};

/// Where the library is looked for: next to the program, where the installer
/// puts it; on the Mac in the bundle's `Contents/Frameworks`, beside
/// `Contents/MacOS` where the program is. `MOZAIK_ORTOOLS` names another file
/// in a debug build only (tests and development); a released program never
/// reads it, so an environment variable cannot make it load somebody else's
/// library (güvenlik denetimi 2026-11-16).
fn yol() -> Result<PathBuf, String> {
    #[cfg(debug_assertions)]
    if let Some(p) = std::env::var_os("MOZAIK_ORTOOLS") {
        return Ok(PathBuf::from(p));
    }
    let exe = std::env::current_exe().map_err(|_| "Program klasörü bulunamadı.")?;
    kutuphane_yolu(&exe, cfg!(windows))
}

/// The rule, apart from the process so it can be tested on any machine. On
/// Windows the library is loaded only from an INSTALLED copy's folder
/// (`uninstall.exe` beside it, update.rs `kurulu_mu`): a standalone
/// `Mozaik.exe` sits in Downloads or on the Desktop, where any file named
/// `ortools.dll` could have been dropped next to it (DLL planting), and only
/// the installer ships the real one.
pub(crate) fn kutuphane_yolu(exe: &Path, kurulum_sart: bool) -> Result<PathBuf, String> {
    let klasor = exe.parent().ok_or("Program klasörü bulunamadı.")?;
    if kurulum_sart && !crate::update::kurulu_mu(exe) {
        return Err("CP-SAT yalnız kurulumla gelir; bu kopya kurulu değil.".into());
    }
    Ok(kutuphane_yeri(klasor))
}

/// Opens the library. On Windows with `LoadLibraryExW` and only two places to
/// look for what it imports: its own folder (the OR-Tools DLLs and the C++
/// runtime the installer put there) and System32. Never the current directory
/// or PATH. The flag needs an absolute path, which `current_exe` gives.
unsafe fn ac(yol: &Path) -> Result<libloading::Library, libloading::Error> {
    #[cfg(windows)]
    {
        use libloading::os::windows::{
            Library, LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR, LOAD_LIBRARY_SEARCH_SYSTEM32,
        };
        Library::load_with_flags(
            yol,
            LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR | LOAD_LIBRARY_SEARCH_SYSTEM32,
        )
        .map(Into::into)
    }
    #[cfg(not(windows))]
    {
        libloading::Library::new(yol)
    }
}

/// The library's path, given the folder the program runs from. The Mac's
/// dylibs find one another through their own `LC_RPATH @loader_path`, so the
/// first one only has to be opened by its full path.
fn kutuphane_yeri(program_klasoru: &std::path::Path) -> PathBuf {
    if cfg!(target_os = "macos") {
        program_klasoru.join("../Frameworks").join(AD)
    } else {
        program_klasoru.join(AD)
    }
}

fn yukle() -> Result<Cpsat, String> {
    let yol = yol()?;
    if !yol.is_file() {
        return Err(format!("CP-SAT kütüphanesi yok: {}", yol.display()));
    }
    // SAFETY: loading a library runs its initialisers. This one is the
    // OR-Tools release the installer ships, pinned by SHA-256 in surum.yml.
    unsafe {
        let lib = ac(&yol).map_err(|e| format!("CP-SAT kütüphanesi açılamadı: {e}"))?;
        let al = |ad: &[u8]| {
            lib.get::<*const c_void>(ad)
                .map(|s| *s)
                .map_err(|e| format!("CP-SAT işlevi yok ({}): {e}", String::from_utf8_lossy(ad)))
        };
        let interruptible: Interruptible = std::mem::transmute(al(b"SolveCpInterruptible\0")?);
        let new_env: NewEnv = std::mem::transmute(al(b"SolveCpNewEnv\0")?);
        let destroy_env: EnvFn = std::mem::transmute(al(b"SolveCpDestroyEnv\0")?);
        let stop: EnvFn = std::mem::transmute(al(b"SolveCpStopSearch\0")?);
        Ok(Cpsat {
            _lib: lib,
            interruptible,
            new_env,
            destroy_env,
            stop,
        })
    }
}

static CPSAT: OnceLock<Result<Cpsat, String>> = OnceLock::new();

fn cpsat() -> Result<&'static Cpsat, String> {
    CPSAT.get_or_init(yukle).as_ref().map_err(|e| e.clone())
}

/// The environment of the question being solved, for `cpsat_durdur`. A plain
/// address: the pointer itself is not `Send`, and it is only ever passed back
/// to the library that made it.
static CALISAN: Mutex<Option<usize>> = Mutex::new(None);

/// The program's priority, lowered while CP-SAT works (Windows only).
///
/// The search occupies every core it is given (`relaxPool.ts` gives it all of
/// them), and on a weak two-core machine the window would then wait behind it.
/// The library makes its own threads, so lowering the calling thread would not
/// reach them; the PROCESS's class does, and it is this process only: the
/// page itself is drawn by WebView2's own processes, which keep theirs. Put
/// back when the question ends, whatever way it ends.
struct DusukOncelik;

#[cfg(windows)]
mod oncelik {
    use std::ffi::c_void;
    pub const NORMAL: u32 = 0x0000_0020;
    pub const BELOW_NORMAL: u32 = 0x0000_4000;
    #[link(name = "kernel32")]
    extern "system" {
        pub fn GetCurrentProcess() -> *mut c_void;
        pub fn SetPriorityClass(process: *mut c_void, class: u32) -> i32;
    }
}

impl DusukOncelik {
    fn al() -> Self {
        // SAFETY: the pseudo-handle of this process; nothing else is touched.
        #[cfg(windows)]
        unsafe {
            oncelik::SetPriorityClass(oncelik::GetCurrentProcess(), oncelik::BELOW_NORMAL);
        }
        DusukOncelik
    }
}

impl Drop for DusukOncelik {
    fn drop(&mut self) {
        // SAFETY: as above.
        #[cfg(windows)]
        unsafe {
            oncelik::SetPriorityClass(oncelik::GetCurrentProcess(), oncelik::NORMAL);
        }
    }
}

/// One question, solved to the end (or to its time limit, or to "Durdur").
pub fn coz(model: &[u8], params: &[u8]) -> Result<Vec<u8>, String> {
    let c = cpsat()?;
    let _oncelik = DusukOncelik::al();
    let model_len = c_int::try_from(model.len()).map_err(|_| "CP-SAT modeli çok büyük.")?;
    let params_len = c_int::try_from(params.len()).map_err(|_| "CP-SAT ayarları çok büyük.")?;
    let mut res: *mut c_void = std::ptr::null_mut();
    let mut res_len: c_int = 0;
    // SAFETY: the buffers outlive the call; the library writes `res`, which it
    // allocated with malloc and which is freed below with the same C runtime
    // (UCRT on Windows, the system libc elsewhere).
    unsafe {
        let env = (c.new_env)();
        if let Ok(mut slot) = CALISAN.lock() {
            *slot = Some(env as usize);
        }
        (c.interruptible)(
            env,
            model.as_ptr().cast(),
            model_len,
            params.as_ptr().cast(),
            params_len,
            &mut res,
            &mut res_len,
        );
        if let Ok(mut slot) = CALISAN.lock() {
            *slot = None;
        }
        (c.destroy_env)(env);
        if res.is_null() || res_len < 0 {
            return Err("CP-SAT bir cevap vermedi.".into());
        }
        let out = std::slice::from_raw_parts(res.cast::<u8>(), res_len as usize).to_vec();
        libc_free(res);
        Ok(out)
    }
}

extern "C" {
    #[link_name = "free"]
    fn libc_free(p: *mut c_void);
}

/// Asks the running question to stop; its best week so far still comes back.
pub fn durdur() {
    let Ok(c) = cpsat() else { return };
    if let Ok(slot) = CALISAN.lock() {
        if let Some(env) = *slot {
            // SAFETY: `env` is live: it is cleared before it is destroyed, under the same lock.
            unsafe { (c.stop)(env as *mut c_void) };
        }
    }
}

/// The page's body: params length (u32, little-endian), params, model.
pub fn ayir(body: &[u8]) -> Result<(&[u8], &[u8]), String> {
    let uzunluk: [u8; 4] = body
        .get(..4)
        .and_then(|b| b.try_into().ok())
        .ok_or("CP-SAT isteği eksik.")?;
    let n = u32::from_le_bytes(uzunluk) as usize;
    let params = body.get(4..4 + n).ok_or("CP-SAT isteği eksik.")?;
    Ok((params, &body[4 + n..]))
}

// -------------------------------------------------------------- the commands

/// Whether this copy can answer with CP-SAT at all.
///
/// Async, on the blocking pool: the first call LOADS the library, and on the
/// Mac that is 99 dylibs (53 MB) that macOS checks before it maps them. A
/// synchronous command runs on the main thread, where that wait would freeze
/// the window.
#[tauri::command]
pub async fn cpsat_var() -> bool {
    tauri::async_runtime::spawn_blocking(|| cpsat().is_ok())
        .await
        .unwrap_or(false)
}

/// One question. Raw bytes both ways: the model is hundreds of kilobytes and
/// JSON would carry it as an array of numbers.
#[tauri::command]
pub async fn cpsat_coz(request: tauri::ipc::Request<'_>) -> Result<tauri::ipc::Response, String> {
    let tauri::ipc::InvokeBody::Raw(body) = request.body() else {
        return Err("CP-SAT isteği bayt olarak gelmeli.".into());
    };
    let body = body.clone();
    let cevap = tauri::async_runtime::spawn_blocking(move || {
        let (params, model) = ayir(&body)?;
        coz(model, params)
    })
    .await
    .map_err(|e| format!("CP-SAT durdu: {e}"))??;
    Ok(tauri::ipc::Response::new(cevap))
}

#[tauri::command]
pub fn cpsat_durdur() {
    durdur();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_library_is_looked_for_where_the_bundle_puts_it() {
        let yer = kutuphane_yeri(std::path::Path::new(
            "/Applications/Mozaik.app/Contents/MacOS",
        ));
        if cfg!(target_os = "macos") {
            assert_eq!(
                yer,
                PathBuf::from(
                    "/Applications/Mozaik.app/Contents/MacOS/../Frameworks/libortools.9.dylib"
                )
            );
        } else {
            assert_eq!(
                yer,
                PathBuf::from("/Applications/Mozaik.app/Contents/MacOS").join(AD)
            );
        }
    }

    #[test]
    fn the_body_splits_into_params_and_model() {
        let mut body = 3u32.to_le_bytes().to_vec();
        body.extend_from_slice(&[1, 2, 3, 9, 9]);
        assert_eq!(ayir(&body).unwrap(), (&[1u8, 2, 3][..], &[9u8, 9][..]));
        assert!(ayir(&[1, 0]).is_err());
        assert!(ayir(&[5, 0, 0, 0, 1]).is_err());
    }

    struct Gecici(PathBuf);
    impl Drop for Gecici {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }
    fn gecici(ad: &str) -> Gecici {
        let d = std::env::temp_dir().join(format!("mozaik-cpsat-{ad}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        Gecici(d)
    }

    #[test]
    fn a_standalone_windows_copy_does_not_load_a_library_beside_it() {
        let tmp = gecici("tek");
        let exe = tmp.0.join("Mozaik.exe");
        std::fs::write(&exe, b"MZ").unwrap();
        std::fs::write(tmp.0.join(AD), b"MZ").unwrap();
        assert!(kutuphane_yolu(&exe, true).is_err());
        // Off Windows (the development machines) the folder rule alone.
        assert_eq!(kutuphane_yolu(&exe, false).unwrap(), kutuphane_yeri(&tmp.0));
    }

    #[test]
    fn an_installed_copy_loads_the_library_from_its_own_folder_only() {
        let tmp = gecici("kurulu");
        let exe = tmp.0.join("Mozaik.exe");
        std::fs::write(&exe, b"MZ").unwrap();
        std::fs::write(tmp.0.join("uninstall.exe"), b"MZ").unwrap();
        assert_eq!(kutuphane_yolu(&exe, true).unwrap(), kutuphane_yeri(&tmp.0));
    }

    /// A release build must not read the variable: the line before the read is
    /// the `debug_assertions` gate.
    #[test]
    fn the_environment_variable_is_read_in_debug_builds_only() {
        let kaynak = include_str!("cpsat.rs");
        let arama = ["std::env::var_os(", "\"MOZAIK_ORTOOLS\")"].concat();
        let i = kaynak.find(&arama).unwrap();
        let onceki = kaynak[..i].lines().rev().nth(1).unwrap_or("");
        assert_eq!(onceki.trim(), "#[cfg(debug_assertions)]");
    }

    /// Runs only where `MOZAIK_ORTOOLS` points at a library: one boolean,
    /// "x or x", minimise x... except x must hold, so the optimum is 1.
    #[test]
    fn the_library_answers_a_tiny_model() {
        if std::env::var_os("MOZAIK_ORTOOLS").is_none() {
            return;
        }
        // variables { domain: [0, 1] }, constraints { bool_or { literals: [0] } },
        // objective { vars: [0], coeffs: [1] }
        let model: Vec<u8> = vec![
            0x12, 0x04, 0x12, 0x02, 0x00, 0x01, // variables
            0x1a, 0x05, 0x1a, 0x03, 0x0a, 0x01, 0x00, // constraints: bool_or [0]
            0x22, 0x06, 0x0a, 0x01, 0x00, 0x22, 0x01, 0x01, // objective
        ];
        let cevap = coz(&model, &[]).unwrap();
        // status (field 1) OPTIMAL = 4
        assert_eq!(&cevap[..2], &[0x08, 0x04]);
        assert!(cpsat().is_ok());
    }
}
