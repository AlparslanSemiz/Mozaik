//! The Mac copy replacing itself (DECISIONS 2026-11-15, Mac).
//!
//! The same three buttons as on Windows (update.rs: look, download, restart)
//! and the same two locks on what is downloaded: the SHA-256 the manifest
//! names, and the release key's minisign signature whose trusted comment binds
//! the version and the file name (`imza_dogru`). Only the last step differs,
//! because a Mac program is not a file but a folder, `Mozaik.app`:
//!
//!   download  `Mozaik-mac-<mimari>.app.tar.gz`, checked, written whole into
//!             a hidden folder beside the bundle (`.Mozaik.app.yeni`). Nothing
//!             is unpacked yet.
//!   restart   the archive is checked AGAIN against the digest (it sat on a
//!             disk this user can write), unpacked by the system's `tar` into
//!             the same hidden folder, looked over, and exchanged with the
//!             running bundle in ONE atomic step (`renamex_np`, RENAME_SWAP).
//!             The new version is started and this one exits.
//!   next start  the new version, once its page has drawn, deletes the hidden
//!             folder, which by then holds the old bundle (`sweep`).
//!
//! WHY BESIDE THE BUNDLE, NOT IN /tmp. A rename only stays atomic inside one
//! volume, and /Applications and the temporary folder can be two.
//!
//! WHERE IT REFUSES. The bundle's own folder has to be writable. It is not
//! when the program runs from the mounted .dmg, or from App Translocation:
//! macOS runs a quarantined app that was never moved out of Downloads from a
//! random read-only path. In both cases the answer is the same sentence --
//! move Mozaik into Applications -- and it is said before anything is
//! downloaded.
//!
//! Everything but the exchange itself and `tar` is plain path work, so it is
//! compiled and tested on every platform; `cargo test` on the Windows runner
//! judges it too.

use std::fs;
use std::path::{Path, PathBuf};

/// Which Mac a build is for. The two are separate downloads, not one
/// universal bundle: OR-Tools publishes one archive per architecture and its
/// 99 dylibs would have to be glued together with `lipo` one by one, for an
/// archive twice the size on every Mac (BUILD.md, "Mac").
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Mimari {
    Arm64,
    X86_64,
}

impl Mimari {
    /// The architecture this copy was compiled for.
    pub fn bu() -> Mimari {
        if cfg!(target_arch = "aarch64") {
            Mimari::Arm64
        } else {
            Mimari::X86_64
        }
    }

    /// The published archive's file name. `surum.yml` publishes exactly these
    /// names, and `imza_yorumu` binds the signature to them.
    pub fn paket_adi(self) -> &'static str {
        match self {
            Mimari::Arm64 => "Mozaik-mac-arm64.app.tar.gz",
            Mimari::X86_64 => "Mozaik-mac-x86_64.app.tar.gz",
        }
    }
}

/// The name of the bundle INSIDE every archive: `tar -C .../macos -czf ...
/// Mozaik.app` in surum.yml. The bundle on the disk may have been renamed by
/// its owner; the one in the archive never is.
pub const ARSIVDEKI_AD: &str = "Mozaik.app";

/// The sentence for every case where the bundle's folder cannot be written.
pub const TASIYIN: &str = "Mozaik kendini bu konumda güncelleyemiyor.\n\
    Mozaik'i Uygulamalar klasörüne taşıyın: Finder'da Mozaik'i Uygulamalar'a \
    sürükleyin, programı oradan açın ve güncellemeyi yeniden deneyin.";

/// The `.app` folder the running program belongs to:
/// `X.app/Contents/MacOS/<program>` -> `X.app`. None when the program does not
/// run from a bundle (`cargo run`, a test binary): there is nothing to replace.
pub fn uygulama_paketi(exe: &Path) -> Option<PathBuf> {
    let macos = exe.parent()?;
    let contents = macos.parent()?;
    let paket = contents.parent()?;
    let uygun = macos.file_name()? == "MacOS"
        && contents.file_name()? == "Contents"
        && paket.extension()? == "app";
    uygun.then(|| paket.to_path_buf())
}

/// Is this a path macOS chose, read-only, for a quarantined app nobody moved?
pub fn tasinmis_mi(paket: &Path) -> bool {
    paket.to_string_lossy().contains("/AppTranslocation/")
}

/// Can a folder be made beside the bundle? Asked by doing it, because the
/// read-only cases (a mounted .dmg, App Translocation, a folder owned by
/// another user) are many and each has its own way of saying so.
pub fn yazilabilir_mi(paket: &Path) -> Result<(), String> {
    if tasinmis_mi(paket) {
        return Err(TASIYIN.into());
    }
    let ust = paket.parent().ok_or(TASIYIN)?;
    // Both the folder the bundle sits in (the hidden folder goes there) and the
    // bundle itself (a rename of a folder needs write access to it): a copy
    // another account installed passes the first and fails the second.
    for yer in [ust, paket] {
        if !yer.is_dir() {
            continue;
        }
        let deneme = yer.join(format!(".mozaik-yazma-denemesi-{}", std::process::id()));
        let _ = fs::remove_dir(&deneme);
        fs::create_dir(&deneme).map_err(|_| TASIYIN.to_string())?;
        let _ = fs::remove_dir(&deneme);
    }
    if !ust.is_dir() {
        return Err(TASIYIN.into());
    }
    Ok(())
}

/// The hidden folder beside the bundle: `/Applications/.Mozaik.app.yeni`.
/// Hidden, so Finder does not show a second Mozaik while it is there.
pub fn hazirlik(paket: &Path) -> PathBuf {
    let ad = paket
        .file_name()
        .map(|a| a.to_string_lossy().into_owned())
        .unwrap_or_default();
    paket.with_file_name(format!(".{ad}.yeni"))
}

/// Where the downloaded archive waits for "Şimdi yeniden başlat".
pub fn indirilen(paket: &Path) -> PathBuf {
    hazirlik(paket).join("paket.tar.gz")
}

/// Where it is unpacked; after the exchange this is where the OLD bundle is.
fn acilan(paket: &Path) -> PathBuf {
    hazirlik(paket).join("acilan")
}

/// Is what came down the wire the archive we were promised? The size and the
/// digest as on Windows (`update::verify`), and gzip's two magic bytes in
/// place of `MZ`: the cheap answer to a captive portal's HTML page.
pub fn verify(bytes: &[u8], boyut: u64, sha256: &str) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("İnen dosya boş.".into());
    }
    if boyut == 0 {
        return Err("Beklenen boyut bilinmiyor: indirme durduruldu.".into());
    }
    if bytes.len() as u64 != boyut {
        return Err(format!(
            "İnen dosya eksik: {} bayt bekleniyordu, {} geldi.",
            boyut,
            bytes.len()
        ));
    }
    if !bytes.starts_with(&[0x1f, 0x8b]) {
        return Err("İnen dosya bir Mozaik paketi değil.".into());
    }
    if crate::update::ozet(bytes) != sha256.to_ascii_lowercase() {
        return Err("İnen dosya yayımlanan dosya değil: özeti tutmuyor.".into());
    }
    Ok(())
}

/// Unpacks the checked archive into a fresh `acilan` and hands back the new
/// bundle in it. The system's `tar` rather than a crate: it keeps the bundle's
/// symlinks, modes and extended attributes the way `tar` in surum.yml wrote
/// them, and it is two crates (flate2, tar) this program does not have to
/// carry. The archive is signed by us, so what is in it is ours; it is still
/// looked over, because a bundle that is not there or not whole must not be
/// swapped in.
pub fn ac(paket: &Path, exe_adi: &std::ffi::OsStr) -> Result<PathBuf, String> {
    let hedef = acilan(paket);
    let _ = fs::remove_dir_all(&hedef);
    fs::create_dir_all(&hedef).map_err(|e| format!("Güncelleme klasörü açılamadı: {e}"))?;
    // The system's own on the Mac, as `/usr/bin/open` in mail.rs: no PATH chooses it.
    let tar = if cfg!(target_os = "macos") {
        "/usr/bin/tar"
    } else {
        "tar"
    };
    let durum = std::process::Command::new(tar)
        .arg("-xzf")
        .arg(indirilen(paket))
        .arg("-C")
        .arg(&hedef)
        .status()
        .map_err(|e| format!("Paket açılamadı: {e}"))?;
    if !durum.success() {
        return Err(format!("Paket açılamadı: tar {durum}"));
    }
    let adlar: Vec<_> = fs::read_dir(&hedef)
        .map_err(|e| format!("Paket okunamadı: {e}"))?
        .filter_map(|g| g.ok().map(|g| g.file_name()))
        .collect();
    let yeni = hedef.join(ARSIVDEKI_AD);
    let tam = adlar.len() == 1
        && adlar[0] == ARSIVDEKI_AD
        && yeni.join("Contents/Info.plist").is_file()
        && yeni.join("Contents/MacOS").join(exe_adi).is_file();
    if !tam {
        return Err("İnen paket eksik: içinde çalışacak bir Mozaik yok.".into());
    }
    icerde_mi(&yeni)?;
    Ok(yeni)
}

/// Does every entry of the unpacked bundle stay inside it (güvenlik denetimi
/// 2026-11-16)? The archive is signed, so this is the second lock, not the
/// first: a symlink is accepted only when it is relative, resolves, and lands
/// inside the bundle; anything that is neither a file, a folder nor such a
/// link (a FIFO, a device) is refused. `/usr/bin/tar` already refuses `..` and
/// absolute names on the way in; this looks at what came out, before the swap
/// puts it where the program runs.
pub fn icerde_mi(kok: &Path) -> Result<(), String> {
    let hata = |e: std::io::Error| format!("Paket okunamadı: {e}");
    let gercek_kok = fs::canonicalize(kok).map_err(hata)?;
    let mut sira = vec![kok.to_path_buf()];
    while let Some(klasor) = sira.pop() {
        for girdi in fs::read_dir(&klasor).map_err(hata)? {
            let yol = girdi.map_err(hata)?.path();
            let tur = fs::symlink_metadata(&yol).map_err(hata)?.file_type();
            if tur.is_symlink() {
                let hedef = fs::read_link(&yol).map_err(hata)?;
                let icerde = !hedef.is_absolute()
                    && fs::canonicalize(&yol).is_ok_and(|g| g.starts_with(&gercek_kok));
                if !icerde {
                    return Err(format!(
                        "İnen paket dışarıyı gösteren bir bağ taşıyor: {}",
                        yol.display()
                    ));
                }
            } else if tur.is_dir() {
                sira.push(yol);
            } else if !tur.is_file() {
                return Err(format!(
                    "İnen pakette beklenmeyen bir dosya: {}",
                    yol.display()
                ));
            }
        }
    }
    Ok(())
}

/// Exchanges two folders' places. On the Mac one call does it atomically: at
/// no moment is there no Mozaik at the bundle's path. Elsewhere (the tests on
/// Windows and Linux, or a Mac volume that refuses the exchange) two renames
/// with the rollback `update::swap_files` has.
pub fn takas(paket: &Path, yeni: &Path) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    if renamex_swap(yeni, paket).is_ok() {
        return Ok(());
    }
    let ara = yeni.with_file_name(".takas-eski");
    let _ = fs::remove_dir_all(&ara);
    fs::rename(paket, &ara).map_err(|e| format!("Eski sürüm kenara alınamadı: {e}"))?;
    if let Err(e) = fs::rename(yeni, paket) {
        let _ = fs::rename(&ara, paket);
        return Err(format!("Yeni sürüm yerine konamadı: {e}"));
    }
    // Where the atomic exchange would have left the old bundle.
    fs::rename(&ara, yeni).map_err(|e| format!("Eski sürüm taşınamadı: {e}"))
}

#[cfg(target_os = "macos")]
fn renamex_swap(a: &Path, b: &Path) -> std::io::Result<()> {
    use std::ffi::{c_char, c_int, c_uint, CString};
    use std::os::unix::ffi::OsStrExt;
    extern "C" {
        fn renamex_np(from: *const c_char, to: *const c_char, flags: c_uint) -> c_int;
    }
    const RENAME_SWAP: c_uint = 0x0000_0002;
    let a = CString::new(a.as_os_str().as_bytes())?;
    let b = CString::new(b.as_os_str().as_bytes())?;
    // SAFETY: two NUL-terminated paths that live across the call.
    if unsafe { renamex_np(a.as_ptr(), b.as_ptr(), RENAME_SWAP) } == 0 {
        Ok(())
    } else {
        Err(std::io::Error::last_os_error())
    }
}

/// Removes the hidden folder: after an update it holds the old bundle, and a
/// download nobody applied is not trusted by the next session anyway.
pub fn sweep(paket: &Path) {
    let _ = fs::remove_dir_all(hazirlik(paket));
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Scratch(PathBuf);
    impl Scratch {
        fn new(tag: &str) -> Self {
            let dir = std::env::temp_dir().join(format!("Mozaik-mac-{tag}"));
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

    /// A bundle in the shape `tauri build` makes, with `icerik` as its program.
    fn paket_yap(yer: &Path, icerik: &str) {
        fs::create_dir_all(yer.join("Contents/MacOS")).unwrap();
        fs::write(yer.join("Contents/Info.plist"), "<plist/>").unwrap();
        fs::write(yer.join("Contents/MacOS/mozaik"), icerik).unwrap();
    }

    #[test]
    fn a_plain_bundle_stays_inside() {
        let tmp = Scratch::new("icerde-duz");
        let app = tmp.0.join("Mozaik.app");
        paket_yap(&app, "yeni");
        assert!(icerde_mi(&app).is_ok());
    }

    #[cfg(unix)]
    #[test]
    fn a_link_inside_the_bundle_is_fine_one_leaving_it_is_not() {
        use std::os::unix::fs::symlink;
        let tmp = Scratch::new("icerde-bag");
        let app = tmp.0.join("Mozaik.app");
        paket_yap(&app, "yeni");
        symlink("MacOS/mozaik", app.join("Contents/kisayol")).unwrap();
        assert!(icerde_mi(&app).is_ok());

        let disari = [
            ("mutlak", PathBuf::from("/etc/hosts")),
            ("yukari", PathBuf::from("../../../disarida")),
            ("kirik", PathBuf::from("yok-boyle-bir-sey")),
        ];
        fs::write(tmp.0.join("disarida"), "x").unwrap();
        for (ad, hedef) in disari {
            let bag = app.join("Contents/MacOS").join(ad);
            symlink(&hedef, &bag).unwrap();
            assert!(icerde_mi(&app).is_err(), "{ad}");
            fs::remove_file(&bag).unwrap();
        }
        assert!(icerde_mi(&app).is_ok());
    }

    #[cfg(unix)]
    #[test]
    fn a_fifo_in_the_bundle_is_refused() {
        let tmp = Scratch::new("icerde-fifo");
        let app = tmp.0.join("Mozaik.app");
        paket_yap(&app, "yeni");
        let fifo = app.join("Contents/boru");
        let durum = std::process::Command::new("mkfifo")
            .arg(&fifo)
            .status()
            .unwrap();
        assert!(durum.success());
        assert!(icerde_mi(&app).is_err());
    }

    #[test]
    fn the_bundle_is_three_folders_up_and_only_an_app() {
        assert_eq!(
            uygulama_paketi(Path::new("/Applications/Mozaik.app/Contents/MacOS/mozaik")),
            Some(PathBuf::from("/Applications/Mozaik.app"))
        );
        assert_eq!(
            uygulama_paketi(Path::new(
                "/Users/a/Uygulamalar/Mozaik 2.app/Contents/MacOS/mozaik"
            )),
            Some(PathBuf::from("/Users/a/Uygulamalar/Mozaik 2.app"))
        );
        for degil in [
            "/Users/a/Mozaik/src-tauri/target/release/ders-programi",
            "/Applications/Mozaik/Contents/MacOS/mozaik",
            "/Applications/Mozaik.app/Contents/Resources/mozaik",
            "mozaik",
        ] {
            assert_eq!(uygulama_paketi(Path::new(degil)), None, "{degil}");
        }
    }

    #[test]
    fn a_translocated_or_read_only_copy_is_told_to_move() {
        let yol = Path::new("/private/var/folders/xy/T/AppTranslocation/1234-ABCD/d/Mozaik.app");
        assert!(tasinmis_mi(yol));
        let e = yazilabilir_mi(yol).unwrap_err();
        assert!(e.contains("Uygulamalar klasörüne taşıyın"), "{e}");
        // A folder that is not there cannot be written beside either.
        assert!(yazilabilir_mi(Path::new("/olmayan/klasor/Mozaik.app")).is_err());
        let s = Scratch::new("yazilir");
        assert!(yazilabilir_mi(&s.0.join("Mozaik.app")).is_ok());
        // And the probe leaves nothing behind.
        assert_eq!(fs::read_dir(&s.0).unwrap().count(), 0);
    }

    #[cfg(unix)]
    #[test]
    fn a_bundle_this_user_cannot_write_is_told_to_move_too() {
        // Another account installed it: its folder is writable, the bundle is not.
        use std::os::unix::fs::PermissionsExt;
        let s = Scratch::new("salt-okunur");
        let paket = s.0.join("Mozaik.app");
        paket_yap(&paket, "eski");
        assert!(yazilabilir_mi(&paket).is_ok());
        assert_eq!(fs::read_dir(&paket).unwrap().count(), 1);
        fs::set_permissions(&paket, fs::Permissions::from_mode(0o555)).unwrap();
        let sonuc = yazilabilir_mi(&paket);
        fs::set_permissions(&paket, fs::Permissions::from_mode(0o755)).unwrap();
        assert!(sonuc.is_err());
    }

    #[test]
    fn the_staging_folder_is_hidden_beside_the_bundle() {
        let p = Path::new("/Applications/Mozaik.app");
        assert_eq!(hazirlik(p), PathBuf::from("/Applications/.Mozaik.app.yeni"));
        assert_eq!(
            indirilen(p),
            PathBuf::from("/Applications/.Mozaik.app.yeni/paket.tar.gz")
        );
    }

    #[test]
    fn each_mac_downloads_its_own_archive() {
        assert_eq!(Mimari::Arm64.paket_adi(), "Mozaik-mac-arm64.app.tar.gz");
        assert_eq!(Mimari::X86_64.paket_adi(), "Mozaik-mac-x86_64.app.tar.gz");
        assert_eq!(Mimari::bu() == Mimari::Arm64, cfg!(target_arch = "aarch64"));
    }

    #[test]
    fn a_download_has_to_be_a_gzip_of_the_promised_size_and_digest() {
        let ok = [0x1f, 0x8b, 8, 0];
        let ozet = crate::update::ozet(&ok);
        assert!(verify(&ok, 4, &ozet).is_ok());
        assert!(verify(&ok, 4, &ozet.to_uppercase()).is_ok());
        assert!(verify(&ok, 0, &ozet).is_err());
        assert!(verify(&ok, 5, &ozet).is_err());
        assert!(verify(&[0x1f, 0x8b, 8, 1], 4, &ozet).is_err());
        let html = b"<!doctype html>";
        assert!(verify(html, 15, &crate::update::ozet(html)).is_err());
        assert!(verify(b"MZ\x90\x00", 4, &crate::update::ozet(b"MZ\x90\x00")).is_err());
        assert!(verify(&[], 0, &crate::update::ozet(&[])).is_err());
    }

    #[test]
    fn the_exchange_puts_the_new_bundle_in_and_keeps_the_old_one_aside() {
        let s = Scratch::new("takas");
        let paket = s.0.join("Mozaik.app");
        let yeni = s.0.join("hazirlik").join("Mozaik.app");
        paket_yap(&paket, "eski");
        paket_yap(&yeni, "yeni");
        takas(&paket, &yeni).unwrap();
        assert_eq!(
            fs::read_to_string(paket.join("Contents/MacOS/mozaik")).unwrap(),
            "yeni"
        );
        assert_eq!(
            fs::read_to_string(yeni.join("Contents/MacOS/mozaik")).unwrap(),
            "eski"
        );
    }

    #[test]
    fn a_failed_exchange_leaves_the_program_where_it_was() {
        let s = Scratch::new("takas-dusen");
        let paket = s.0.join("Mozaik.app");
        paket_yap(&paket, "eski");
        fs::create_dir_all(s.0.join("hazirlik")).unwrap();
        let yok = s.0.join("hazirlik").join("Mozaik.app");
        assert!(takas(&paket, &yok).is_err());
        assert_eq!(
            fs::read_to_string(paket.join("Contents/MacOS/mozaik")).unwrap(),
            "eski"
        );
    }

    /// `tar` exists on every runner this is tested on (Windows 10+ ships bsdtar).
    fn arsiv_yap(kaynak_klasor: &Path, icindeki: &str, hedef: &Path) {
        let ok = std::process::Command::new("tar")
            .arg("-czf")
            .arg(hedef)
            .arg("-C")
            .arg(kaynak_klasor)
            .arg(icindeki)
            .status()
            .unwrap()
            .success();
        assert!(ok);
    }

    #[test]
    fn the_archive_unpacks_into_a_whole_bundle_or_is_refused() {
        let s = Scratch::new("ac");
        let kaynak = s.0.join("kaynak");
        paket_yap(&kaynak.join(ARSIVDEKI_AD), "yeni");
        let paket = s.0.join("Uygulamalar").join("Mozaik.app");
        paket_yap(&paket, "eski");
        fs::create_dir_all(hazirlik(&paket)).unwrap();
        arsiv_yap(&kaynak, ARSIVDEKI_AD, &indirilen(&paket));
        let yeni = ac(&paket, std::ffi::OsStr::new("mozaik")).unwrap();
        assert_eq!(
            fs::read_to_string(yeni.join("Contents/MacOS/mozaik")).unwrap(),
            "yeni"
        );

        // An archive whose bundle has no program by this name, or another top folder.
        assert!(ac(&paket, std::ffi::OsStr::new("baska-ad")).is_err());
        let kotu = s.0.join("kotu");
        paket_yap(&kotu.join("Baska.app"), "x");
        arsiv_yap(&kotu, "Baska.app", &indirilen(&paket));
        assert!(ac(&paket, std::ffi::OsStr::new("mozaik")).is_err());

        sweep(&paket);
        assert!(!hazirlik(&paket).exists());
        assert!(paket.join("Contents/MacOS/mozaik").is_file());
    }
}
