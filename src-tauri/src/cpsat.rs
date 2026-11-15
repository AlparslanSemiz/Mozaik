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
//! needs next to the program (tauri.conf.json, `bundle.resources`); the
//! standalone exe, the Linux development build and a broken install have none.
//! `cpsat_var` says which, and the page falls back to its own search.
//!
//! The five functions are the ones `ortools/sat/c_api/cp_solver_c.h` declares
//! (v9.15), loaded by name so that a missing library is a sentence, not a
//! program that will not start.

use std::ffi::{c_int, c_void};
use std::path::PathBuf;
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

/// The library's file name on each platform. Windows is the one delivered;
/// the other two are how the Rust side is tested on a development machine.
const AD: &str = if cfg!(windows) {
    "ortools.dll"
} else if cfg!(target_os = "macos") {
    "libortools.9.dylib"
} else {
    "libortools.so.9"
};

/// Where the library is looked for: next to the program, where the installer
/// puts it, or where `MOZAIK_ORTOOLS` says (tests and development only).
fn yol() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("MOZAIK_ORTOOLS") {
        return Some(PathBuf::from(p));
    }
    std::env::current_exe().ok()?.parent().map(|d| d.join(AD))
}

fn yukle() -> Result<Cpsat, String> {
    let yol = yol().ok_or("Program klasörü bulunamadı.")?;
    if !yol.is_file() {
        return Err(format!("CP-SAT kütüphanesi yok: {}", yol.display()));
    }
    // SAFETY: loading a library runs its initialisers. This one is the
    // OR-Tools release the installer ships, pinned by SHA-256 in surum.yml.
    unsafe {
        let lib = libloading::Library::new(&yol)
            .map_err(|e| format!("CP-SAT kütüphanesi açılamadı: {e}"))?;
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

/// One question, solved to the end (or to its time limit, or to "Durdur").
pub fn coz(model: &[u8], params: &[u8]) -> Result<Vec<u8>, String> {
    let c = cpsat()?;
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
#[tauri::command]
pub fn cpsat_var() -> bool {
    cpsat().is_ok()
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
    fn the_body_splits_into_params_and_model() {
        let mut body = 3u32.to_le_bytes().to_vec();
        body.extend_from_slice(&[1, 2, 3, 9, 9]);
        assert_eq!(ayir(&body).unwrap(), (&[1u8, 2, 3][..], &[9u8, 9][..]));
        assert!(ayir(&[1, 0]).is_err());
        assert!(ayir(&[5, 0, 0, 0, 1]).is_err());
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
        assert!(cpsat_var());
    }
}
