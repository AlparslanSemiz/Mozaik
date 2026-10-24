//! The teacher's week, handed to the user's own mail program (TODO B3.4).
//!
//! WHAT THIS IS NOT: a mail client. Nothing is sent from here, there is no
//! account, no password and no network code. The page builds a `mailto:`
//! (`src/leaf/email.ts`), this hands it to the operating system exactly as a
//! click on a link would, and the user's own mail program opens it as a new
//! message from the user's own account. The user presses Send, or does not.
//!
//! WHY NOT THE WEBVIEW. WebView2 asks before it hands a link to another
//! program, and that question is one more thing for my father to answer; and
//! a page cannot tell whether a mail program exists at all. Here both answers
//! come from the shell: `AssocQueryStringW` says whether anything is
//! registered for `mailto`, `ShellExecuteW` opens it. Two calls into shell32
//! and shlwapi, which are Windows itself, so no crate is added for them.

/// What the page reads when no mail program is registered: it shows its one
/// short line for that, and nothing else.
pub const ISTEMCI_YOK: &str = "istemci-yok";

/// The longest `mailto:` handed over. Anything longer is the page's mistake
/// (it shortens the week to fit, `src/pure/paper/mail.ts`), and is refused
/// rather than cut somewhere in the shell.
pub const EN_UZUN: usize = 2000;

/// The characters a `mailto:` from `src/leaf/email.ts` is made of: what
/// `encodeURIComponent` leaves alone, its `%`, and the `:`, `@`, `?`, `&` and
/// `=` that hold the address, subject and body apart.
fn kodlanmis(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b"-_.!~*'()%:@?&=".contains(&b)
}

/// Only a `mailto:`, only those characters, and not too long. The check is
/// what keeps this command from being "open any file or program": a path, a
/// `file:` or an `https:` never reaches the shell, and neither does a `"` that
/// could close the quotes around `%1` in a mail program's command line.
pub fn adres_gecerli(adres: &str) -> bool {
    // ASCII first: only then is slicing at byte 7 a character boundary.
    adres.len() <= EN_UZUN
        && adres.len() > "mailto:".len()
        && adres.bytes().all(kodlanmis)
        && adres[..7].eq_ignore_ascii_case("mailto:")
}

/// Is this registered command Windows' "pick an app" question rather than a
/// mail program?
pub fn secici_mi(komut: &str) -> bool {
    komut.to_ascii_lowercase().contains("openwith.exe")
}

#[tauri::command]
pub async fn eposta_ac(adres: String) -> Result<(), String> {
    if !adres_gecerli(&adres) {
        return Err("gecersiz".into());
    }
    // On the blocking pool: the shell may take seconds (a DDE handler), and
    // xdg-open as long as it likes, and neither may hold an async worker. The
    // thread is the one COM is initialised on (`kabuk::ac`).
    tauri::async_runtime::spawn_blocking(move || kabuk::ac(&adres))
        .await
        .unwrap_or_else(|_| Err("acilamadi".into()))
}

#[cfg(windows)]
mod kabuk {
    use super::ISTEMCI_YOK;
    use std::ffi::{c_void, OsStr};
    use std::os::windows::ffi::OsStrExt;
    use std::ptr::{null, null_mut};

    #[link(name = "shell32")]
    extern "system" {
        fn ShellExecuteW(
            hwnd: *mut c_void,
            op: *const u16,
            file: *const u16,
            params: *const u16,
            dir: *const u16,
            show: i32,
        ) -> isize;
    }
    #[link(name = "shlwapi")]
    extern "system" {
        fn AssocQueryStringW(
            flags: u32,
            what: u32,
            assoc: *const u16,
            extra: *const u16,
            out: *mut u16,
            len: *mut u32,
        ) -> i32;
    }
    #[link(name = "ole32")]
    extern "system" {
        fn CoInitializeEx(reserved: *mut c_void, model: u32) -> i32;
        fn CoUninitialize();
    }

    const ASSOCF_IS_PROTOCOL: u32 = 0x1000;
    const ASSOCSTR_COMMAND: u32 = 1;
    const ASSOCSTR_DELEGATEEXECUTE: u32 = 18;
    const ASSOCSTR_PROGID: u32 = 20;
    const E_POINTER: i32 = 0x8000_4003_u32 as i32;
    const COINIT_APARTMENTTHREADED: u32 = 0x2;
    const COINIT_DISABLE_OLE1DDE: u32 = 0x4;
    const SE_ERR_NOASSOC: isize = 31;
    const SW_SHOWNORMAL: i32 = 1;

    fn genis(s: &str) -> Vec<u16> {
        OsStr::new(s).encode_wide().chain(Some(0)).collect()
    }

    /// One string of the `mailto:` association: Some(text) when Windows has
    /// one (a value too long for the buffer still counts, as ""), None when not.
    fn soru(what: u32) -> Option<String> {
        let mut buf = [0u16; 1024];
        let mut n = buf.len() as u32;
        let hr = unsafe {
            AssocQueryStringW(
                ASSOCF_IS_PROTOCOL,
                what,
                genis("mailto").as_ptr(),
                null(),
                buf.as_mut_ptr(),
                &mut n,
            )
        };
        if hr == E_POINTER {
            return Some(String::new());
        }
        if hr != 0 {
            return None;
        }
        let son = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
        Some(String::from_utf16_lossy(&buf[..son]))
    }

    /// Is a mail program the default for `mailto:`? Two ways of saying no
    /// (measured on a Windows runner, 2026-10-24): nothing at all
    /// (ERROR_NO_ASSOCIATION), or Windows' own "how do you want to open this"
    /// picker, `OpenWith.exe`, which is what a machine with no default mail
    /// program answers -- and then `ShellExecuteW` reports success while all
    /// it opened is that question. A packaged app (the new Outlook, Mail) may
    /// have no command line at all, only a COM handler or a ProgID, so either
    /// of those also counts as yes (not measured: the runner has neither).
    fn istemci_var() -> bool {
        match soru(ASSOCSTR_COMMAND) {
            Some(komut) if super::secici_mi(&komut) => false,
            Some(_) => true,
            None => soru(ASSOCSTR_DELEGATEEXECUTE).is_some() || soru(ASSOCSTR_PROGID).is_some(),
        }
    }

    pub fn ac(adres: &str) -> Result<(), String> {
        if !istemci_var() {
            return Err(ISTEMCI_YOK.into());
        }
        let co = unsafe {
            CoInitializeEx(null_mut(), COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE)
        };
        let r = unsafe {
            ShellExecuteW(
                null_mut(),
                genis("open").as_ptr(),
                genis(adres).as_ptr(),
                null(),
                null(),
                SW_SHOWNORMAL,
            )
        };
        if co >= 0 {
            unsafe { CoUninitialize() };
        }
        match r {
            r if r > 32 => Ok(()),
            SE_ERR_NOASSOC => Err(ISTEMCI_YOK.into()),
            r => Err(format!("acilamadi: {r}")),
        }
    }
}

/// The Linux copy, for development only: `xdg-open`, whose exit code 3 is
/// "no program for this".
#[cfg(not(windows))]
mod kabuk {
    use super::ISTEMCI_YOK;
    use std::process::Command;

    pub fn ac(adres: &str) -> Result<(), String> {
        match Command::new("xdg-open").arg(adres).status() {
            Ok(s) if s.success() => Ok(()),
            Ok(s) if s.code() == Some(3) => Err(ISTEMCI_YOK.into()),
            Ok(s) => Err(format!("acilamadi: {s}")),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Err(ISTEMCI_YOK.into()),
            Err(e) => Err(format!("acilamadi: {e}")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn yalniz_mailto_ve_kodlanmis_metin_gecer() {
        assert!(adres_gecerli("mailto:a@example.com?subject=S&body=Sal%C4%B1%0D%0A"));
        assert!(adres_gecerli("MAILTO:a@example.com"));
        for kotu in [
            "",
            "mailto:",
            "https://example.com",
            "file:///C:/Windows/System32/calc.exe",
            "C:\\Windows\\System32\\calc.exe",
            "mailto:a@example.com?body=iki kelime",
            "mailto:a@example.com?body=Salı",
            "mailto:a@example.com\r\nb",
            "ğğğğmailto:a@example.com",
            // Printable ASCII that encodeURIComponent never produces, and that
            // could close the quotes around "%1" in a handler's command line.
            "mailto:a@example.com?body=x\"%20-p%20evil",
            "mailto:a@example.com?body=<x>",
            "mailto:a@example.com?body=a\\b",
        ] {
            assert!(!adres_gecerli(kotu), "{kotu}");
        }
    }

    #[test]
    fn openwith_istemci_sayilmiyor() {
        // What AssocQueryStringW answered on the runner with no mail program.
        assert!(secici_mi(r#"C:\Windows\system32\OpenWith.exe "%1""#));
        assert!(!secici_mi(r#""C:\Program Files\Mozilla Thunderbird\thunderbird.exe" -osint -compose "%1""#));
    }

    #[test]
    fn sinirdan_uzun_adres_reddediliyor() {
        let tam = format!("mailto:a@example.com?body={}", "x".repeat(EN_UZUN - 26));
        assert_eq!(tam.len(), EN_UZUN);
        assert!(adres_gecerli(&tam));
        assert!(!adres_gecerli(&(tam + "x")));
    }
}
