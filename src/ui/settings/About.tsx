// Ayarlar → Hakkında: which build this is and how it is updated, the newest
// suggestion search's measurement, and the release notes.

import { surumEtiketi, tarihYazisi } from '../../leaf/app';
import { SURUM_NOTLARI, markChangelogSeen } from '../../platform/changelog';
import { desktopSelfUpdates } from '../../platform/exe';
import { searchLog } from '../../platform/search';
import { routeName, storageAddress } from '../../platform/storage';
import { SITE_ADRESI, type UpdateRun } from '../../platform/update';
import { T, type Translate, useT } from '../common';
import { useEffect, useState } from 'react';

/**
 * "Bu program" (2026-08-27).
 *
 * Two questions that had no answer anywhere in the app, and both of them are
 * the first thing anybody needs when a fix is reported: WHICH build is this,
 * and WHICH copy am I looking at. Without the first, "düzelttim, dener misin"
 * has nothing to check against. Without the second, two routes with separate
 * stores look identical on screen and the work silently splits in two.
 *
 * The update half only exists where it can: the site (and the local install)
 * are already served over http, so asking their own origin costs nothing new.
 * The double-clicked file and the .exe say where the newest one is and go
 * nowhere — the offline principle is checked with grep there, and a version check that
 * reached the network would be the first byte this program ever fetched.
 *
 * THE HEADING IS NOT "Bu program", and that is pitfall 49 again. `hasText`
 * and `getByRole(name:)` both match on SUBSTRING and case-insensitively, and
 * the panel one column over already said "Tarayıcının bu program için ayırdığı
 * yer" — so a locator aimed here landed there instead, and the test failed
 * with the wrong panel's contents printed at it. It also shares no words with
 * "Veriler nerede", "Nereye kaydedilsin" or "Bütün planlar tek dosyada": those
 * three are the locators four E2E specs hang on.
 */
/**
 * The newest suggestion search on this machine, in a line the father can
 * photograph (TODO B5.11): whether the workers opened, and how long it took.
 * The whole log goes into every bundle file (relaxLog.ts).
 */
function searchLine(t: Translate): string {
  const log = searchLog();
  const last = log[log.length - 1];
  if (last === undefined) return t('Bu bilgisayarda henüz aranmadı');
  const sure = Math.round(last.doneMs / 1000);
  const ilk = last.firstMs === null ? '—' : String(Math.round(last.firstMs / 1000));
  return last.workers > 0
    ? t('{n} iş parçacığında · ilk öneri {ilk} sn · arama {sure} sn', {
        n: last.workers,
        ilk,
        sure,
      })
    : t('Tek iş parçacığında (yavaş yol) · ilk öneri {ilk} sn · arama {sure} sn', { ilk, sure });
}

export function Build({ update }: { update: UpdateRun }) {
  const t = useT();
  const adres = storageAddress();

  return (
    <div className="panel">
      <h2>{t('Sürüm ve güncelleme')}</h2>
      <table className="stat">
        <tbody>
          <tr>
            <td>{t('Sürüm')}</td>
            <td>
              <b>{surumEtiketi()}</b>
            </td>
          </tr>
          <tr>
            <td>{t('Nasıl açıldı')}</td>
            <td>{routeName()}</td>
          </tr>
          <tr>
            <td>{t('Öneri araması')}</td>
            <td>{searchLine(t)}</td>
          </tr>
          {adres !== '' && (
            <tr>
              <td>{t('Adres')}</td>
              <td>
                <code>{adres}</code>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {update.kind === 'sw' && <SiteUpdate update={update} />}
      {update.kind === 'exe' && <ExeUpdate update={update} />}
      {update.kind === 'yok' && (
        <p className="hint">
          <T k="**Bu kopya kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:" />{' '}
          <a href={SITE_ADRESI} target="_blank" rel="noreferrer">
            <code>{SITE_ADRESI}</code>
          </a>
        </p>
      )}
    </div>
  );
}

/**
 * "Yenilikler" (2026-08-31, TODO §2 B2.9).
 *
 * A SIBLING of `Build`, not a section inside it: `Build`'s own heading
 * ('Sürüm ve güncelleme') is scoped by four E2E specs and its doc comment
 * above already spells out pitfall 49/74 — folding new content into that
 * function risks a new heading landing inside `buildPanel()`'s locator, or
 * colliding with one three pixels over. A panel of its own keeps both clean.
 *
 * The current release is open; older ones sit in a closed `<details>` —
 * "arşiv de olabilir" was the reader's own line, and the newest entry is
 * what somebody actually came here to read, not a list they scroll past.
 *
 * Marks itself seen on mount, not on click: opening Hakkında and reading
 * this far down the panel already answers "what changed", and gating the
 * dot behind a second click would leave it lit under an unread tab.
 */
export function Changelog({ onSeen }: { onSeen: () => void }) {
  const t = useT();
  const [entry, ...older] = SURUM_NOTLARI;

  useEffect(() => {
    if (entry !== undefined) markChangelogSeen(entry.version);
    onSeen();
    // Only at mount: `onSeen` is a stable setter from App, and re-running
    // this on every render would fight a dot that a DIFFERENT tab just lit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (entry === undefined) return null;

  return (
    <div className="panel">
      <h2>{t('Yenilikler')}</h2>
      <p className="hint">
        <b>{surumEtiketi({ version: entry.version, date: entry.date, commit: '' })}</b>
      </p>
      <ul>
        {entry.items.map((line) => (
          <li key={line}>{t(line)}</li>
        ))}
      </ul>

      {older.length > 0 && (
        <details>
          <summary>{t('Eski sürümler')}</summary>
          {older.map((old) => (
            <div key={old.version}>
              <p className="hint">
                <b>
                  v{old.version} · {tarihYazisi(old.date)}
                </b>
              </p>
              <ul>
                {old.items.map((line) => (
                  <li key={line}>{t(line)}</li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

/** The site and the local install: a service worker does the work. */
function SiteUpdate({ update }: { update: UpdateRun }) {
  const t = useT();
  return (
    <>
      <p className="hint">
        <T k="Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez." />
      </p>
      <div className="form-row">
        <button className="btn" onClick={update.check}>
          {t('Güncellemeleri denetle')}
        </button>
      </div>
      {update.ready && (
        <p className="hint" role="status">
          <T k="**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın." />
        </p>
      )}
    </>
  );
}

/**
 * The .exe: three buttons, and each one is a separate decision.
 *
 * Look, download, restart. Splitting them is not caution for its own sake, it
 * is the double-click principle: nothing about this program may change without being asked
 * for, and "asked for" has to mean the thing that actually happened. A single
 * button that fetched four megabytes and closed the window would be an update
 * wizard with one step.
 *
 * WITH NO INTERNET nothing here goes wrong. `Denetle` comes back with one
 * sentence, the program keeps running, and the rest of the panel is untouched.
 * That is the whole offline story: the network is only ever entered from this
 * button.
 */
function ExeUpdate({ update }: { update: UpdateRun }) {
  const t = useT();
  const d = update.durum;
  const mesgul = d.ad === 'bakiliyor' || d.ad === 'indiriliyor';
  // Asked of the program itself: the Linux build says no, and promising it
  // here would end in a refusal after the download button (tuzak 126).
  const [kendini, setKendini] = useState(true);
  useEffect(() => {
    let canli = true;
    void desktopSelfUpdates().then((evet) => {
      if (canli) setKendini(evet);
    });
    return () => {
      canli = false;
    };
  }, []);

  return (
    <>
      <p className="hint">
        {kendini ? (
          <T k="Bu kopya kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz." />
        ) : (
          <T k="Bu kopya geliştirme ve test için; kendini güncellemez. Denetlemek yalnız yeni sürümün olup olmadığını söyler." />
        )}
      </p>

      <div className="form-row">
        <button className="btn" onClick={update.check} disabled={mesgul}>
          {t('Güncellemeleri denetle')}
        </button>
        {d.ad === 'var' && kendini && (
          <button className="btn primary" onClick={update.indir}>
            {t('Yeni sürümü indir')}
          </button>
        )}
        {d.ad === 'hazir' && (
          <button className="btn primary" onClick={update.uygula}>
            {t('Şimdi yeniden başlat')}
          </button>
        )}
      </div>

      {/* One line, always in the same place, so the answer is where the eye
          already is. `role="status"` because it changes without being read
          again (design contract 2). */}
      {d.ad !== 'bos' && (
        <p className={`hint${d.ad === 'hata' ? ' bad' : ''}`} role="status">
          {d.ad === 'bakiliyor' && t('Bakılıyor…')}
          {d.ad === 'guncel' && <b>{t('En son sürümü kullanıyorsunuz.')}</b>}
          {d.ad === 'var' && (
            <T
              k="**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz."
              vars={{
                surum: d.surum,
                tarih: d.tarih === '' ? '' : ` (${d.tarih})`,
                mb: Math.round(d.boyut / 1024 / 1024),
              }}
            />
          )}
          {d.ad === 'indiriliyor' && t('Yeni sürüm iniyor…')}
          {d.ad === 'hazir' && (
            <T
              k="**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Programınız kayıtlı, hiçbir şey kaybolmaz."
              vars={{ surum: d.surum }}
            />
          )}
          {d.ad === 'hata' && d.mesaj}
        </p>
      )}
    </>
  );
}
