// The strips above the open tab that say something is wrong with saving, or
// that a new build is waiting. Each one says it where it failed, in words, and
// the ones that can be acted on carry their button.

import { surumEtiketi, tarihYazisi, YENI_SITE } from '../../leaf/app';
import type { SectionId, Tab } from '../../platform/prefs';
import type { FolderRun, SaveTrouble, useStore } from '../../platform/storage';
import type { useUpdate } from '../../platform/update';
import { useState } from 'react';

import { T, useT } from '../common';
import type { MoveOut } from './useMove';

/** The file reminder, decided in App (it knows the route and the folder). */
export interface FileReminder {
  /** Up: unsaved changes older than a week, and no folder writing a copy. */
  due: boolean;
  /** The last plan file's date, YYYY-MM-DD, or null when there never was one. */
  savedDay: string | null;
  save: () => void;
  hide: () => void;
}

interface Props {
  canSave: boolean;
  saveTrouble: SaveTrouble;
  unreadable: ReturnType<typeof useStore>['unreadable'];
  setAside: ReturnType<typeof useStore>['setAside'];
  update: ReturnType<typeof useUpdate>;
  updateHidden: boolean;
  setUpdateHidden: (hidden: boolean) => void;
  folder: FolderRun;
  /** The folder's fuller copy, after an empty start ('bulundu'). */
  openFolderCopy: () => void;
  /** The shrink strip's "keep the small one", behind a question (App). */
  acceptShrink: () => void;
  /** The open plan before the last deletion of an earlier session (SD1). */
  lastDelete: ReturnType<typeof useStore>['lastDelete'];
  restoreLastDelete: () => void;
  closeLastDelete: () => void;
  goTab: (tab: Tab) => void;
  ui: { setSection: (section: SectionId) => void };
  move: MoveOut;
  reminder: FileReminder;
}

export default function Notices({
  canSave,
  saveTrouble,
  unreadable,
  setAside,
  update,
  updateHidden,
  setUpdateHidden,
  folder,
  openFolderCopy,
  acceptShrink,
  lastDelete,
  restoreLastDelete,
  closeLastDelete,
  goTab,
  ui,
  move,
  reminder,
}: Props) {
  const t = useT();
  const ms = move.state;
  const moving = ms?.ad === 'bekliyor' || ms?.ad === 'soruldu';
  // The button goes only while the window is still being opened. Once the
  // plans are sent the new window may be reloaded or left alone, and its
  // answer then never comes; the reader must be able to start again.
  const opening = ms?.ad === 'bekliyor';
  const moved = ms?.ad === 'bitti' && ms.durum === 'acildi';
  // Another strip that asks for something is up: the file reminder waits.
  const quiet = move.live || (update.ready && !updateHidden) || saveTrouble !== null || !canSave;
  const [kurulumGizli, setKurulumGizli] = useState(false);
  const guncellemeyeBak = () => {
    goTab('school');
    ui.setSection('about');
  };
  return (
    <>
      {/* THE SITE MOVED (DECISIONS 2026-11-16). Only at the old address and
      only once the new one answers (move.ts). The plans stay here too: the
      button copies, it does not move anything out from under anybody. */}
      {move.live && (
        <div className="update-bar" role="status">
          <span>
            {move.toFile ? (
              <T k="**Planlar bir plan dosyasına yazıldı** (İndirilenler). Yeni adreste **Tümünü dosyadan aç** ile açın." />
            ) : moved ? (
              <T k="**Planlar yeni adrese taşındı.** Bundan sonra orayı kullanın:" />
            ) : moving ? (
              <T k="Yeni adres açıldı. Oradaki soruyu cevaplayın." />
            ) : (
              <>
                <T k="**Mozaik yeni adresine taşındı.** Planlarınız burada da kalır." />
                {(ms?.ad === 'kapandi' || (ms?.ad === 'bitti' && ms.durum === 'vazgecildi')) &&
                  ` ${t('Hiçbir plan taşınmadı.')}`}
              </>
            )}{' '}
            <a href={YENI_SITE} target="_blank" rel="noreferrer">
              {YENI_SITE}
            </a>
          </span>
          {!opening && !moved && (
            <span className="update-acts">
              <button className="btn primary" onClick={move.start}>
                {t('Planları taşı')}
              </button>
            </span>
          )}
        </div>
      )}

      {!canSave && (
        <div className="save-warning">
          ⚠{' '}
          <T k="**Bu bilgisayarda otomatik kayıt çalışmıyor.** Mozaik kapanınca yaptığınız her şey kaybolur. Çalışırken ve bilgisayarı kapatmadan önce sık sık **Kaydet** düğmesine basın." />
        </div>
      )}

      {/* A SAVE THAT FAILED IS SAID WHERE IT FAILED (VK2). The probe above
      runs once at startup with one byte, and the storage can fill up
      later; the autosave's own answer is what this reads. */}
      {saveTrouble === 'dolu' && (
        <div className="save-warning" role="alert">
          ⚠{' '}
          <T k="**Son değişiklik bu bilgisayara kaydedilemedi:** depolama alanı dolu. İşinizi kaybetmemek için **Kaydet** düğmesine basın." />
        </div>
      )}

      {/* ANOTHER WINDOW CHANGED THIS DATA (VK1). This window has stopped
      writing, so whatever is done here from now on is not kept; the
      other window's work is. Reloading reads that work. */}
      {saveTrouble === 'baska' && (
        <div className="save-warning" role="alert">
          ⚠{' '}
          <T k="**Mozaik başka bir pencerede de açık ve plan orada değiştirildi.** Bu penceredeki son değişiklikler kaydedilmedi. **Yenile**'ye basın." />{' '}
          <button className="btn" onClick={() => window.location.reload()}>
            {t('Yenile')}
          </button>
        </div>
      )}

      {/* THE PLAN READ EMPTY AT STARTUP, AND ITS KEY IS FULL. Under file://
      a reloaded page has once started from an empty storage (TRAPS 108);
      this window has written nothing over the saved plan, and a reload
      reads it. */}
      {saveTrouble === 'okunamadi' && (
        <div className="save-warning" role="alert">
          ⚠{' '}
          <T k="**Kayıtlı plan açılışta okunamadı.** Üzerine yazılmadı. **Yenile**'ye basın; plan yine gelmezse kaydettiğiniz plan dosyasını **Dosyadan aç** ile açın." />{' '}
          <button className="btn" onClick={() => window.location.reload()}>
            {t('Yenile')}
          </button>
        </div>
      )}

      {/* THE SAVED PLAN IS THERE AND THIS COPY CANNOT READ IT (A1): a newer
      copy's plan, or one cut short. The screen holds an empty stand-in
      that is never saved over it; opening a file in its place, or
      deleting the plan, is what lifts that (libraryStore.ts). No reload
      button: a reload reads the same text. */}
      {/* A PLAN WHOSE TEXT CANNOT BE READ WAS SET ASIDE AT STARTUP (TB1):
      another plan opened instead, and this one stays frozen in its key and
      in Ayarlar → Planlar ve yedek. One line, for the whole session, because
      a toast would be gone before a reader who has trouble seeing found it. */}
      {setAside.length > 0 && (
        <div className="save-warning" role="status">
          ⚠ {t('Okunamayan plan açılmadı: {adlar}.', { adlar: setAside.join(', ') })}
        </div>
      )}

      {unreadable !== null && (
        <div className="save-warning" role="alert">
          ⚠{' '}
          {unreadable === 'yeni' ? (
            <>
              <T k="**Kayıtlı plan daha yeni bir sürümle yazılmış.** Bu sürüm onu açamıyor ve üzerine yazmıyor; burada yapılanlar kaydedilmez. Mozaik'i güncelleyin." />{' '}
              <button
                className="btn"
                onClick={() => {
                  goTab('school');
                  ui.setSection('about');
                }}
              >
                {t('Güncellemeye bak')}
              </button>
            </>
          ) : (
            <T k="**Kayıtlı plan okunamadı.** Üzerine yazılmadı; burada yapılanlar kaydedilmez. Plan dosyanızı **Dosyadan aç** ile açabilirsiniz." />
          )}
        </div>
      )}

      {/* THE START READ NOTHING, AND THE FOLDER HOLDS A PLAN (the audit of
      2026-11-16). A wiped WebView2 profile opens Mozaik empty while
      Belgelerim\Ders Programı holds the school; nothing goes to the folder
      until one of the two buttons is pressed (useFolder's `bulundu`). */}
      {folder.status.kind === 'bulundu' && (
        <div className="save-warning" role="status">
          ⚠{' '}
          <T
            k="**Plan bu bilgisayarda boş açıldı, ama {klasor} klasöründe daha dolu bir plan dosyası var:** {dosya}, {ogretmen} öğretmen ve {ders} ders. Siz seçene kadar klasöre hiçbir şey yazılmıyor."
            vars={{
              klasor: folder.status.name,
              dosya: folder.status.copy.name,
              ogretmen: folder.status.copy.work.teachers,
              ders: folder.status.copy.work.lessons,
            }}
          />{' '}
          <button className="btn primary" onClick={openFolderCopy}>
            {t("Belgelerim'deki son kaydı aç")}
          </button>{' '}
          <button className="btn" onClick={folder.release}>
            {t('Boş başla')}
          </button>
        </div>
      )}

      {/* THE PLAN SHRANK SHARPLY: the live file in the folder was kept and
      the new state went to the day's rescue file (folder.ts, `shrinks`). */}
      {folder.shrunk !== null && (
        <div className="save-warning" role="status">
          ⚠{' '}
          <T
            k="**Plan çok küçüldü:** {ogretmen} öğretmen ve {ders} ders kaldı, klasördeki son plan dosyasında {eskiOgretmen} öğretmen ve {eskiDers} ders var. O dosya korundu, yeni hâli **{dosya}** adıyla ayrıca yazıldı."
            vars={{
              ogretmen: folder.shrunk.now.teachers,
              ders: folder.shrunk.now.lessons,
              eskiOgretmen: folder.shrunk.before.teachers,
              eskiDers: folder.shrunk.before.lessons,
              dosya: folder.shrunk.file,
            }}
          />{' '}
          <button className="btn primary" onClick={openFolderCopy}>
            {t("Belgelerim'deki son kaydı aç")}
          </button>{' '}
          <button className="btn" onClick={acceptShrink}>
            {t('Yeni hâlini asıl dosya yap')}
          </button>
        </div>
      )}

      {/* THE LAST DELETION OF AN EARLIER SESSION, ONCE (TODO SD1). Its undo
      lived in memory; the state before it waited in one slot. */}
      {lastDelete !== null && (
        <div className="save-warning" role="status">
          {t('{ne} Son silmeyi geri almak için:', { ne: lastDelete.label })}{' '}
          <button className="btn primary" onClick={restoreLastDelete}>
            {t('Geri getir')}
          </button>{' '}
          <button className="btn" onClick={closeLastDelete}>
            {t('Kapat')}
          </button>
        </div>
      )}

      {/* A NEW BUILD IS RUNNING THE SERVICE WORKER, this page is still the
      old one. Announced rather than applied: the double-click principle's promise is
      that nothing updates itself out from under him, and a timetable
      half-dragged is exactly the moment a silent reload would land.

      It is a strip and not a toast because it carries an ACTION, and
      toasts in this program deliberately do not (see Toasts.tsx). */}
      {update.ready && !updateHidden && (
        <div className="update-bar" role="status">
          <span>
            <T
              k="**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz."
              vars={{ surum: surumEtiketi() }}
            />
          </span>
          <span className="update-acts">
            <button className="btn primary" onClick={update.reload}>
              {t('Yenile')}
            </button>
            <button className="btn" onClick={() => setUpdateHidden(true)}>
              {t('Sonra')}
            </button>
          </span>
        </div>
      )}

      {/* THE STANDALONE EXE HAS JUST BEEN UPDATED, and the installer is what
      brings CP-SAT (update.rs, `guncelleme_durumu`). Said once, at this start,
      with no network: the button is the click that asks (TRAPS 161). */}
      {update.kurulum.oner && !kurulumGizli && update.kurulum.olmadi === null && (
        <div className="update-bar" role="status">
          <span>
            <T k="**Mozaik'i bu bilgisayara kurun.** Öneri araması (CP-SAT) ancak kurulumla gelir ve çok daha hızlıdır. Planlarınız yerinde kalır." />
          </span>
          <span className="update-acts">
            <button
              className="btn primary"
              onClick={() => {
                // Said once: from here Hakkında carries it.
                setKurulumGizli(true);
                guncellemeyeBak();
                update.check();
              }}
            >
              {t('Kuruluma bak')}
            </button>
            <button className="btn" onClick={() => setKurulumGizli(true)}>
              {t('Sonra')}
            </button>
          </span>
        </div>
      )}

      {/* THE INSTALLER DID NOT FINISH, and its waiter opened this copy again
      (update.rs, `bekle_ve_bitir`). Before 2026-11-16 the program just
      vanished here (TRAPS 163). */}
      {update.kurulum.olmadi !== null && (
        <div className="save-warning" role="alert">
          ⚠{' '}
          <T
            k="**Kurulum tamamlanamadı** (kod {kod}). Mozaik eski hâliyle açıldı, planlarınız yerinde. Bilgisayarı yeniden başlatıp Okul bilgileri → Hakkında'dan tekrar deneyebilirsiniz."
            vars={{ kod: update.kurulum.olmadi }}
          />{' '}
          <button className="btn" onClick={guncellemeyeBak}>
            {t('Güncellemeye bak')}
          </button>
        </div>
      )}

      {/* CHANGES NO PLAN FILE HOLDS, FOR A WEEK (web audit, 2026-11-16). On a
      browser with no folder to write to, the browser's own storage is the
      only copy, and Safari clears it after seven days without a visit. Once,
      gently: "Sonra" puts it away for the session, and a file clears it.
      It waits while another strip asks for an action (a new build, the move,
      a save that failed): one request at a time, and those come first. */}
      {reminder.due && !quiet && (
        <div className="update-bar" role="status">
          <span>
            {reminder.savedDay === null ? (
              <T k="**Bu planın bir plan dosyası yok.** Yaptıklarınız yalnız bu tarayıcıda duruyor." />
            ) : (
              <T
                k="**Son plan dosyası {tarih} tarihli.** Ondan sonra yaptıklarınız yalnız bu tarayıcıda duruyor."
                vars={{ tarih: tarihYazisi(reminder.savedDay) }}
              />
            )}
          </span>
          <span className="update-acts">
            <button className="btn primary" onClick={reminder.save}>
              {t('Kaydet')}
            </button>
            <button className="btn" onClick={reminder.hide}>
              {t('Sonra')}
            </button>
          </span>
        </div>
      )}

      {/* A SAVE THAT STOPPED WORKING HAS TO BE VISIBLE (pitfall 7). These
      two states mean my father once picked a folder and it is no longer
      being written to — the folder moved, the disk filled, or the
      browser dropped the permission on reload. Silence here is a term's
      work quietly stopping to be backed up.

      'secilmedi' is deliberately NOT here: never having picked a folder
      is not a fault, it is the starting state, and a strip that is up on
      every screen from the first minute is a strip nobody reads. It is
      said instead in Ayarlar → Veri, in red, on the routes where the
      offer is a good one. */}
      {(folder.status.kind === 'izin-gerek' || folder.status.kind === 'hata') && (
        <div className="save-warning">
          ⚠{' '}
          {folder.status.kind === 'izin-gerek' ? (
            <>
              <T
                k="**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor."
                vars={{ klasor: folder.status.name }}
              />
            </>
          ) : (
            <>
              <T
                k="**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor."
                vars={{
                  klasor: folder.status.name,
                  sebep: folder.status.text,
                }}
              />
            </>
          )}{' '}
          {/* NOT "Ayarlar → Veri" (pitfall 49). getByRole name matching is
          substring AND case-insensitive, so that label answered to the
          Ayarlar TAB's own query and broke the folder suite's helper —
          a button three pixels from a tab must not wear its name, in
          any case. This one says what it does instead. */}
          <button
            className="btn"
            onClick={() => {
              goTab('school');
              ui.setSection('plans');
            }}
          >
            {t('Klasörü düzelt')}
          </button>
        </div>
      )}
    </>
  );
}
