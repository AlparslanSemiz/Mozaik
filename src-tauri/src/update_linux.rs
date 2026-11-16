//! The Linux AppImage replacing itself (DECISIONS 2026-11-16, Linux).
//!
//! The same three buttons as on Windows and the Mac (update.rs: look,
//! download, restart) and the same two locks on what is downloaded: the
//! SHA-256 the manifest names, and the release key's minisign signature whose
//! trusted comment binds the version and the file name (`imza_dogru`). An
//! AppImage is one file, like the standalone `Mozaik.exe`, so the steps are the
//! Windows ones with one difference: Linux replaces a file with ONE rename.
//!
//!   download  `Mozaik-linux-x86_64.AppImage`, checked, written whole beside
//!             the running one as `<AppImage>.yeni`, made executable.
//!   restart   `.yeni` is checked AGAIN against the digest (it sat on a disk
//!             this user can write), the running file is kept as `.eski` by a
//!             hard link, and `.yeni` is renamed over it: at no moment is there
//!             no Mozaik at its path. The running copy is not disturbed, because
//!             its runtime holds the old file open (the kernel keeps an open
//!             file's data until the last holder closes it). The new version is
//!             started and this one exits; if it cannot be spawned, `.eski` is
//!             renamed back.
//!   next start  the new version, once its page has drawn, deletes `.eski`
//!             (`update::sweep_old`).
//!
//! WHICH FILE. The program itself runs from a read-only mount of the AppImage
//! (`/tmp/.mount_…/usr/bin/Mozaik`); the file a person double-clicked is in
//! `APPIMAGE`, which the AppImage runtime sets. It is believed only when the
//! running program is inside `APPDIR`, the mount the same runtime made: a
//! variable inherited from some other AppImage (a terminal opened from one)
//! would otherwise point this copy at another program's file.
//!
//! WHERE IT REFUSES. The AppImage's folder has to be writable. A person who
//! keeps it in Downloads or in their home folder can; one under `/opt` cannot,
//! and is told to move it before anything is downloaded.
//!
//! Everything but reading the environment is plain path work, so it is
//! compiled and tested on every platform.

use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};

/// The published file's name. `surum.yml` publishes exactly this name, and
/// `imza_yorumu` binds the signature to it. One architecture: x86_64 is the
/// only Linux build (BUILD.md, "Linux").
pub const PAKET_ADI: &str = "Mozaik-linux-x86_64.AppImage";

/// The sentence for every case where the AppImage's folder cannot be written.
pub const TASIYIN: &str = "Mozaik kendini bu klasörde güncelleyemiyor.\n\
    Mozaik'in AppImage dosyasını ev klasörünüzde yazabildiğiniz bir yere \
    (örneğin Belgeler) taşıyın, programı oradan açın ve güncellemeyi yeniden deneyin.";

/// The AppImage file this copy runs from, given the two variables the AppImage
/// runtime sets and the running program's path. None when the program does
/// not run from an AppImage (`cargo run`, the development build, a test), or
/// when the variables were not set for THIS program (see the module comment).
pub fn appimage_yolu(
    appimage: Option<&OsStr>,
    appdir: Option<&OsStr>,
    exe: &Path,
) -> Option<PathBuf> {
    let dosya = PathBuf::from(appimage?);
    let kok = Path::new(appdir?);
    let uygun = dosya.is_absolute()
        && kok.is_absolute()
        && kok.parent().is_some()
        && exe.starts_with(kok)
        && !dosya.starts_with(kok);
    uygun.then_some(dosya)
}

/// The AppImage this process runs from, read once from its own environment.
/// Only an x86_64 Linux build has a published AppImage to update to.
pub fn bu_appimage() -> Option<PathBuf> {
    if !(cfg!(target_os = "linux") && cfg!(target_arch = "x86_64")) {
        return None;
    }
    static YOL: std::sync::OnceLock<Option<PathBuf>> = std::sync::OnceLock::new();
    YOL.get_or_init(|| {
        // Links resolved on both sides, as cpsat.rs `linux_yolu` does: a
        // `/tmp` that is a link must not make an AppImage look like none.
        let exe = fs::canonicalize(std::env::current_exe().ok()?).ok()?;
        let appdir = std::env::var_os("APPDIR").and_then(|a| fs::canonicalize(a).ok());
        let dosya = appimage_yolu(
            std::env::var_os("APPIMAGE").as_deref(),
            appdir.as_deref().map(|a| a.as_os_str()),
            &exe,
        )?;
        dosya.is_file().then_some(dosya)
    })
    .clone()
}

/// Can a file be made beside the AppImage? Asked by doing it: a folder owned by
/// another user, a read-only mount and a USB stick mounted read-only each say
/// so in their own way.
pub fn yazilabilir_mi(dosya: &Path) -> Result<(), String> {
    let klasor = dosya.parent().filter(|k| k.is_dir()).ok_or(TASIYIN)?;
    let deneme = klasor.join(format!(".mozaik-yazma-denemesi-{}", std::process::id()));
    let _ = fs::remove_file(&deneme);
    fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&deneme)
        .map_err(|_| TASIYIN.to_string())?;
    let _ = fs::remove_file(&deneme);
    Ok(())
}

/// Is what came down the wire the AppImage we were promised? The size and the
/// digest as on Windows (`update::verify`), and the AppImage's own magic in
/// place of `MZ`: an ELF file (`\x7fELF`) carrying `AI\x02` at byte 8, the mark
/// of a type 2 AppImage. The cheap answer to a captive portal's HTML page.
pub fn verify(bytes: &[u8], boyut: u64, sha256: &str) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("İnen dosya boş.".into());
    }
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
    if !bytes.starts_with(b"\x7fELF") || bytes.get(8..11) != Some(b"AI\x02") {
        return Err("İnen dosya bir Mozaik AppImage'ı değil.".into());
    }
    if crate::update::ozet(bytes) != sha256.to_ascii_lowercase() {
        return Err("İndirme bozuk geldi. Tekrar deneyin.".into());
    }
    Ok(())
}

/// Lets the downloaded file run: `rwxr-xr-x`, what a downloaded AppImage needs
/// before it can be started at all.
pub fn calistirilabilir(yol: &Path) -> Result<(), String> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(yol, fs::Permissions::from_mode(0o755))
            .map_err(|e| format!("Yeni sürüm çalıştırılabilir yapılamadı: {e}"))?;
    }
    #[cfg(not(unix))]
    let _ = yol;
    Ok(())
}

/// Puts `.yeni` in the AppImage's place. The old file is kept as `.eski` first,
/// by a hard link (no copy, no space), or by a copy on a filesystem without
/// hard links (a FAT USB stick). Then ONE rename, which on Linux replaces the
/// file atomically.
pub fn degistir(dosya: &Path) -> Result<(), String> {
    let yeni = crate::update::yan(dosya, crate::update::YENI);
    let eski = crate::update::yan(dosya, crate::update::ESKI);
    // `is_file`, as in `update::swap`: a folder by that name must not be renamed in.
    if !yeni.is_file() {
        return Err("İndirilmiş bir sürüm bulunamadı.".into());
    }
    let _ = fs::remove_file(&eski);
    fs::hard_link(dosya, &eski)
        .or_else(|_| fs::copy(dosya, &eski).map(|_| ()))
        .map_err(|e| {
            format!("Güncelleme yapılamadı, Mozaik eski sürümüyle çalışmaya devam ediyor. ({e})")
        })?;
    fs::rename(&yeni, dosya).map_err(|e| {
        let _ = fs::remove_file(&eski);
        format!("Güncelleme yapılamadı, Mozaik eski sürümüyle çalışmaya devam ediyor. ({e})")
    })
}

/// The way back when the new version cannot be spawned: `.eski` over it again.
/// A new version that spawns and then dies is not caught here; `.eski` stays
/// beside it until a new version draws its page, for a person to rename back.
pub fn geri_al(dosya: &Path) {
    let _ = fs::rename(crate::update::yan(dosya, crate::update::ESKI), dosya);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::update::{yan, ESKI, YENI};

    struct Scratch(PathBuf);
    impl Scratch {
        fn new(tag: &str) -> Self {
            let dir =
                std::env::temp_dir().join(format!("Mozaik-linux-{tag}-{}", std::process::id()));
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

    fn os(s: &str) -> Option<&OsStr> {
        Some(OsStr::new(s))
    }

    #[test]
    fn the_appimage_is_believed_only_for_the_program_inside_its_mount() {
        let exe = Path::new("/tmp/.mount_MozaikAb12/usr/bin/Mozaik");
        assert_eq!(
            appimage_yolu(
                os("/home/a/Belgeler/Mozaik.AppImage"),
                os("/tmp/.mount_MozaikAb12"),
                exe
            ),
            Some(PathBuf::from("/home/a/Belgeler/Mozaik.AppImage"))
        );
        // `--appimage-extract-and-run` unpacks to another folder; same rule.
        assert!(appimage_yolu(
            os("/home/a/Mozaik.AppImage"),
            os("/tmp/appimage_extracted_9f"),
            Path::new("/tmp/appimage_extracted_9f/usr/bin/Mozaik")
        )
        .is_some());
        // Variables inherited from another AppImage: this program is not in that mount.
        assert_eq!(
            appimage_yolu(os("/home/a/Baska.AppImage"), os("/tmp/.mount_BaskaZz"), exe),
            None
        );
        // No runtime at all: the development build, `cargo run`, a .deb.
        assert_eq!(appimage_yolu(None, None, exe), None);
        assert_eq!(
            appimage_yolu(os("/home/a/Mozaik.AppImage"), None, exe),
            None
        );
        // Relative paths, a root mount, a file inside its own mount: not believed.
        assert_eq!(
            appimage_yolu(os("Mozaik.AppImage"), os("/tmp/.mount_MozaikAb12"), exe),
            None
        );
        assert_eq!(
            appimage_yolu(os("/home/a/Mozaik.AppImage"), os("/"), exe),
            None
        );
        assert_eq!(
            appimage_yolu(
                os("/tmp/.mount_MozaikAb12/x.AppImage"),
                os("/tmp/.mount_MozaikAb12"),
                exe
            ),
            None
        );
    }

    #[test]
    fn a_folder_this_user_cannot_write_is_told_to_move() {
        assert!(yazilabilir_mi(Path::new("/olmayan/klasor/Mozaik.AppImage")).is_err());
        let s = Scratch::new("yazilir");
        assert!(yazilabilir_mi(&s.0.join("Mozaik.AppImage")).is_ok());
        // And the probe leaves nothing behind.
        assert_eq!(fs::read_dir(&s.0).unwrap().count(), 0);
    }

    #[cfg(unix)]
    #[test]
    fn a_read_only_folder_is_refused_before_anything_is_downloaded() {
        use std::os::unix::fs::PermissionsExt;
        let s = Scratch::new("salt-okunur");
        let dosya = s.0.join("Mozaik.AppImage");
        fs::write(&dosya, "eski").unwrap();
        fs::set_permissions(&s.0, fs::Permissions::from_mode(0o555)).unwrap();
        let sonuc = yazilabilir_mi(&dosya);
        // root writes anywhere (a container's test run); the rule is for users.
        let root = fs::write(s.0.join("root-mu"), "x").is_ok();
        fs::set_permissions(&s.0, fs::Permissions::from_mode(0o755)).unwrap();
        if root {
            return;
        }
        let e = sonuc.unwrap_err();
        assert!(e.contains("ev klasörünüzde"), "{e}");
    }

    /// The first twelve bytes of a type 2 AppImage: ELF, then `AI\x02` at byte 8.
    fn appimage(ek: &[u8]) -> Vec<u8> {
        let mut b = b"\x7fELF\x02\x01\x01\x00AI\x02\x00".to_vec();
        b.extend_from_slice(ek);
        b
    }

    #[test]
    fn a_download_has_to_be_an_appimage_of_the_promised_size_and_digest() {
        let ok = appimage(b"govde");
        let ozet = crate::update::ozet(&ok);
        let n = ok.len() as u64;
        assert!(verify(&ok, n, &ozet).is_ok());
        assert!(verify(&ok, n, &ozet.to_uppercase()).is_ok());
        assert!(verify(&ok, 0, &ozet).is_err());
        assert!(verify(&ok, n + 1, &ozet).is_err());
        assert!(verify(&appimage(b"govdE"), n, &ozet).is_err());
        // A plain ELF program that is not an AppImage, an HTML page, a Windows exe.
        let elf = b"\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00".to_vec();
        assert!(verify(&elf, 12, &crate::update::ozet(&elf)).is_err());
        let html = b"<!doctype html>";
        assert!(verify(html, 15, &crate::update::ozet(html)).is_err());
        assert!(verify(b"MZ\x90\x00", 4, &crate::update::ozet(b"MZ\x90\x00")).is_err());
        assert!(verify(&[], 0, &crate::update::ozet(&[])).is_err());
    }

    #[test]
    fn the_new_version_takes_the_files_place_and_the_old_one_is_kept() {
        let s = Scratch::new("degistir");
        let dosya = s.0.join("Mozaik.AppImage");
        fs::write(&dosya, "eski").unwrap();
        fs::write(yan(&dosya, YENI), "yeni").unwrap();
        calistirilabilir(&yan(&dosya, YENI)).unwrap();
        degistir(&dosya).unwrap();
        assert_eq!(fs::read_to_string(&dosya).unwrap(), "yeni");
        assert_eq!(fs::read_to_string(yan(&dosya, ESKI)).unwrap(), "eski");
        assert!(!yan(&dosya, YENI).exists());
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mod_ = fs::metadata(&dosya).unwrap().permissions().mode();
            assert_eq!(mod_ & 0o777, 0o755);
        }
        // The new one could not be started: the old one goes back in its place.
        geri_al(&dosya);
        assert_eq!(fs::read_to_string(&dosya).unwrap(), "eski");
        assert!(!yan(&dosya, ESKI).exists());
    }

    #[test]
    fn with_nothing_downloaded_nothing_changes() {
        let s = Scratch::new("bos");
        let dosya = s.0.join("Mozaik.AppImage");
        fs::write(&dosya, "eski").unwrap();
        assert!(degistir(&dosya).is_err());
        // A folder by the name is not a download either.
        fs::create_dir(yan(&dosya, YENI)).unwrap();
        assert!(degistir(&dosya).is_err());
        assert_eq!(fs::read_to_string(&dosya).unwrap(), "eski");
        assert!(!yan(&dosya, ESKI).exists());
    }

    #[test]
    fn the_published_name_is_the_x86_64_appimage() {
        assert_eq!(PAKET_ADI, "Mozaik-linux-x86_64.AppImage");
        // Off x86_64 Linux there is no AppImage to update from.
        if !(cfg!(target_os = "linux") && cfg!(target_arch = "x86_64")) {
            assert_eq!(bu_appimage(), None);
        }
    }
}
