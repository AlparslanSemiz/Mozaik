// Settings section: the data itself.
//
// "Sıfırla" lives HERE and not in the top bar any more. In the top bar it sat
// one careless click away from "Dosyadan aç" and it deletes everything; it is
// also the rarest button in the app. Saving and opening a file STAY up there,
// because that is the one habit my father has to keep (docs/PLAN.md pitfall 7).
//
// Two things were added in v1.0 (task 4d). The first is the BUNDLE: the top
// bar's file holds one plan, so since the library arrived a three-plan setup
// could not be carried anywhere in one piece. The second is the panel that
// says, with real key names and real sizes, WHERE the work actually sits —
// "it is saved in the browser" does not tell anyone that clearing browsing
// data destroys it.

import { useEffect, useRef, useState } from "react";
import { useDialogs } from "../overlay/Dialogs";
import { useLoadSample } from "../overlay/useSample";
import type React from "react";
import { BUNDLE_VERSION, bundleVersionOf, parseBundle } from "../../bundle";
import { emptyState } from "../../entities";
import { KEEP_DAILY, MAIN_NAME } from "../../folder";
import {
  routeName,
  storageAddress,
  storageKind,
  storageReport,
} from "../../library";
import { downloadBundle } from "../../backupFile";
import { listBackups } from "../../state/planStorage";
import type { State } from "../../types";
import { activePlacements } from "../../state/programs";
import type { PlanControls } from "../common/props";
import type { FolderRun } from "../../useFolder";
import type { UpdateRun } from "../../update";
import { SITE_ADRESI } from "../../update";
import { EXE_FOLDER } from "../../desktop";
import { surumEtiketi, tarihYazisi } from "../../version";
import { markChangelogSeen, SURUM_NOTLARI } from "../../changelog";
import Plans from "./Plans";
import { T, useT } from '../T';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  loadState: (next: State) => void;
  plans: PlanControls;
  folder: FolderRun;
  update: UpdateRun;
  /** Clears the Ayarlar tab's unseen-changelog dot. Owned by App: the tab is
      up there, and the dot has to go dark the moment this panel is opened,
      not only on the next full re-render. */
  onChangelogSeen: () => void;
  /**
   * WHICH HALF. Ayarlar's "Veri" was seven panels and about nine hundred
   * lines — the plan library, a bundle file, a folder, a reset, a version, a
   * key table and a backup list — which is four different questions wearing
   * one name. It is two sections now, and they share this file rather than
   * splitting it, because the bundle is written by the same machinery that
   * reads the library: `saveAll`/`openAll` belong beside `Plans`, and
   * `storageReport` belongs beside the folder. One file, one set of handlers,
   * two doors.
   */
  part: "plans" | "about";
}

/**
 * localStorage is charged in UTF-16 code units, so a character costs two
 * bytes against the browser's ~5 MB — not the UTF-8 length a file would have.
 */
function size(chars: number): string {
  if (chars === 0) return "–";
  const bytes = chars * 2;
  return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * "Nereye kaydedilsin" (task B4).
 *
 * The panel above this one asks my father to remember something; this one
 * asks him once and then never again. It is first for that reason.
 *
 * When the API is not there it says WHY instead of hiding: a feature that
 * silently is not there is a feature nobody trusts anywhere.
 *
 * MEASURED, and it corrected me: Chromium DOES expose showDirectoryPicker
 * under file://, and file:// IS a secure context there. So this branch is
 * about the BROWSER (Firefox, Safari), not about how the app was opened —
 * an earlier version of this text said the opposite and was wrong.
 */
function Folder({ folder }: { folder: FolderRun }) {
  const t = useT();
  const s = folder.status;

  return (
    <div className="panel">
      <h2>{t('Nereye kaydedilsin')}</h2>

      {s.kind === "yok" ? (
        <>
          <p className="hint">
            <T k="**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor." />
          </p>
          {/* The one-habit sentence is NOT repeated here: it already sits in
              "Veriler nerede" two panels down, and saying it twice on one
              screen makes both copies read like boilerplate (and made a test
              ambiguous — pitfall 49). */}
          <p className="hint">
            <T k="O zamana kadar üst çubuktaki **Dosyaya kaydet** tek çare." />
          </p>
        </>
      ) : (
        <>
          {/* Two sentences for two routes, because the difference is real and
              it is the ONE thing the exe adds. In a browser this is an offer
              that costs a click and a permission; in the exe it has already
              happened, and a "Klasör seç…" button there would be three
              controls that cannot mean anything. */}
          <p className="hint">
            {folder.fixed ? (
              <T
                k="**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur."
                vars={{ gun: KEEP_DAILY }}
              />
            ) : (
              <T
                k="Bir klasör seçin; **bütün planlar** oraya yazılır ve son {gun} günün yedeği durur."
                vars={{ gun: KEEP_DAILY }}
              />
            )}
          </p>

          {!folder.fixed && (
            <div className="form-row">
              <button
                className="btn primary"
                onClick={() => void folder.choose()}
              >
                {s.kind === "secilmedi" ? t('Klasör seç…') : t('Başka klasör seç…')}
              </button>
              {s.kind === "izin-gerek" && (
                <button
                  className="btn primary"
                  onClick={() => void folder.allow()}
                >{t('İzin ver')}</button>
              )}
              {s.kind !== "secilmedi" && (
                <button className="btn" onClick={() => void folder.forget()}>{t('Vazgeç')}</button>
              )}
            </div>
          )}

          {/* THE ROUND TRIP, named. The folder is not only a backup — it is
              how work moves to the next machine and into the next version,
              and until this sentence existed nothing anywhere said which of
              the files in there was the one to open, or with which button.
              Both halves are already built; what was missing was saying so. */}
          {s.kind !== "secilmedi" && (
            <p className="hint">
              <T
                k="{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri."
                vars={{ dosya: MAIN_NAME }}
              />
            </p>
          )}

          {/* One line, and it is the only place this feature can be seen
              working. `role="status"` because it changes without anyone
              looking at it — pitfall 7 says a save that stopped working has
              to be visible, not quiet.

              'secilmedi' reads RED on the routes where the offer actually
              works well (an origin the browser can keep the permission for).
              It is not an error, but it is the one state in which a term's
              work has exactly one copy and a cleared browser takes it. */}
          <p
            className={
              s.kind === "hata" ||
              (s.kind === "secilmedi" && storageKind() === "site")
                ? "hint bad"
                : "hint"
            }
            role="status"
          >
            {s.kind === "secilmedi" &&
              t('Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.')}
            {s.kind === "izin-gerek" && (
              <T
                k="**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin."
                vars={{ klasor: s.name }}
              />
            )}
            {s.kind === "bekliyor" && (
              <T k="**{klasor}** · yazılıyor…" vars={{ klasor: s.name }} />
            )}
            {s.kind === "yazildi" && (
              <>
                <b>{s.name}</b> klasörüne yazıldı, saat{" "}
                {s.at.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .{" "}
                {s.files.map((name, i) => (
                  <span key={name}>
                    {i > 0 && " · "}
                    <code>{name}</code>
                  </span>
                ))}
              </>
            )}
            {s.kind === "hata" && (
              <>
                <b>{s.name}</b>: {s.text} Klasörü yeniden seçin. O zamana kadar
                işiniz yalnız tarayıcıda duruyor.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}

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
 * nowhere — principle 3 is checked with grep there, and a version check that
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
function Build({ update }: { update: UpdateRun }) {
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
          {adres !== "" && (
            <tr>
              <td>{t('Adres')}</td>
              <td>
                <code>{adres}</code>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {update.kind === "sw" && <SiteUpdate update={update} />}
      {update.kind === "exe" && <ExeUpdate update={update} />}
      {update.kind === "yok" && (
        <p className="hint">
          <T k="**Bu kopya kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:" />{" "}
          <a href={SITE_ADRESI} target="_blank" rel="noreferrer">
            <code>{SITE_ADRESI}</code>
          </a>
        </p>
      )}
    </div>
  );
}

/**
 * "Yenilikler" (2026-08-31, TASKS §2 B2.9).
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
function Changelog({ onSeen }: { onSeen: () => void }) {
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
                <b>v{old.version} · {tarihYazisi(old.date)}</b>
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
        <button className="btn" onClick={update.check}>{t('Güncellemeleri denetle')}</button>
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
 * is principle 1: nothing about this program may change without being asked
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
  const mesgul = d.ad === "bakiliyor" || d.ad === "indiriliyor";

  return (
    <>
      <p className="hint">
        <T k="Bu kopya kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz." />
      </p>

      <div className="form-row">
        <button className="btn" onClick={update.check} disabled={mesgul}>
          {t(
            'Güncellemeleri denetle',
          )}
        </button>
        {d.ad === "var" && (
          <button className="btn primary" onClick={update.indir}>{t('Yeni sürümü indir')}</button>
        )}
        {d.ad === "hazir" && (
          <button className="btn primary" onClick={update.uygula}>{t('Şimdi yeniden başlat')}</button>
        )}
      </div>

      {/* One line, always in the same place, so the answer is where the eye
          already is. `role="status"` because it changes without being read
          again (design contract 2). */}
      {d.ad !== "bos" && (
        <p className={`hint${d.ad === "hata" ? " bad" : ""}`} role="status">
          {d.ad === "bakiliyor" && t('Bakılıyor…')}
          {d.ad === "guncel" && <b>{t('En son sürümü kullanıyorsunuz.')}</b>}
          {d.ad === "var" && (
            <T
              k="**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz."
              vars={{
                surum: d.surum,
                tarih: d.tarih === "" ? "" : ` (${d.tarih})`,
                mb: Math.round(d.boyut / 1024 / 1024),
              }}
            />
          )}
          {d.ad === "indiriliyor" && t('Yeni sürüm iniyor…')}
          {d.ad === "hazir" && (
            <T
              k="**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Programınız kayıtlı, hiçbir şey kaybolmaz."
              vars={{ surum: d.surum }}
            />
          )}
          {d.ad === "hata" && d.mesaj}
        </p>
      )}
    </>
  );
}

export default function Data({
  state,
  change,
  loadState,
  plans,
  folder,
  update,
  onChangelogSeen,
  part,
}: Props) {
  const t = useT();
  const { confirm } = useDialogs();
  const loadSample = useLoadSample();
  const backups = listBackups();
  const bundleInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<{ bad: boolean; text: string } | null>(null);

  const report = storageReport(plans.library);
  const planCount = plans.library.plans.length;

  async function reset() {
    // It asks TWICE, and the second question is the point: this is the one
    // button in the program that cannot be undone.
    if (
      !(await confirm({
        title: t('Her şey silinecek'),
        body: t('Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak.'),
        confirmLabel: t('Devam et'),
        danger: true,
      }))
    ) {
      return;
    }
    if (
      !(await confirm({
        title: t('Son kez soruyorum'),
        body: t(
          'Bu işlem geri alınamaz. Vazgeçme ihtimaliniz varsa önce üst çubuktan "Dosyaya kaydet" deyin.',
        ),
        confirmLabel: t('Sil'),
        danger: true,
      }))
    ) {
      return;
    }
    loadState(emptyState());
  }

  function saveAll() {
    const written = downloadBundle(plans.library, plans.planId, state);
    setNote({
      bad: written < planCount,
      text:
        written < planCount
          ? t('{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.', {
              yazilan: written,
              eksik: planCount - written,
            })
          : t('{yazilan} plan tek dosyaya yazıldı.', { yazilan: written }),
    });
  }

  async function openAll(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so the same file can be picked again
    if (file === undefined) return;

    const text = await file.text();
    const bundle = parseBundle(text);
    if (bundle === null) {
      const version = bundleVersionOf(text);
      setNote({
        bad: true,
        text:
          version !== null && version !== BUNDLE_VERSION
            ? t('Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.')
            : t(
                'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki "Dosyadan aç" ile açabilirsiniz.',
              ),
      });
      return;
    }

    const incoming = bundle.library.plans.length;
    if (
      !(await confirm({
        title: t('Bu bilgisayardaki bütün planların yerine geçecek'),
        body: t(
          'Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.',
          { buradaki: planCount, gelen: incoming },
        ),
        confirmLabel: t('Hepsini değiştir'),
        danger: true,
      }))
    ) {
      return;
    }

    const { ok, failed } = plans.replaceLibrary(bundle);
    if (ok === 0) {
      setNote({
        bad: true,
        text: t('Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.'),
      });
      return;
    }
    setNote({
      bad: failed > 0,
      text:
        failed > 0
          ? t(
              '{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.',
              { acilan: ok, yazilamayan: failed },
            )
          : t('{acilan} plan açıldı.', { acilan: ok }),
    });
  }

  // "BÜTÜN PLANLAR TEK DOSYADA" — written out here so both doors can hold it.
  // It reads the library and writes a bundle, which is `Plans`' own noun, and
  // it is drawn in the plans section.
  const bundlePanel = (
    <div className="panel">
      <h2>{t('Bütün planlar tek dosyada')}</h2>
      <p
        className="hint"
        title={t('İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve oturum yedekleri girmez.')}
      >
        <T k="Üst çubuktaki **Dosyaya kaydet** açık planı yazar; buradaki dosya **bütün planları**." />
      </p>
      <div className="form-row">
        <button className="btn primary" onClick={saveAll}>
          {t('Tümünü dosyaya kaydet ({n} plan)', { n: planCount })}
        </button>
        <button
          className="btn"
          onClick={() => bundleInput.current?.click()}
          title={t('Bu bilgisayardaki bütün planların yerine dosyadakiler geçer')}
        >{t('Tümünü dosyadan aç')}</button>
        <input
          ref={bundleInput}
          type="file"
          accept=".json,application/json"
          aria-label={t('Bütün planları içeren dosya')}
          className="hidden"
          onChange={openAll}
        />
      </div>
      {note !== null && (
        <p className={note.bad ? "hint bad" : "hint"} role="status">
          {note.text}
        </p>
      )}
    </div>
  );

  // THE PLAN LIBRARY AND THE FILE THAT HOLDS ALL OF IT — one question, one
  // screen. The bundle sits under the library rather than under the folder
  // because it is the same noun: every plan, in one place.
  const planDataPanel = (
      <div className="panel">
        <h2>{t('Bu planın verisi')}</h2>
  
        {/* The sample school's home. It used to live only on the Kurulum
            screen, where it could only ever be reached by an EMPTY project —
            so anyone who wanted to look at it again after starting their own
            work had no way back to it. Kurulum still offers it once, on a
            first run; this is where it stays. */}
        <h3>{t('Örnek okul verisi')}</h3>
        <p className="hint">
          <T k="Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**" />
        </p>
        <div className="form-row">
          <button
            className="btn"
            title={t('Bu planın yerine hazır örnek okulu koyar')}
            onClick={() => void loadSample(state, change)}
          >{t('Örnek okulu yükle')}</button>
        </div>
  
        <h3>{t('Sıfırla')}</h3>
        <p className="hint">
          <T k="**Açık olan plan** tamamen silinir ve **geri alınamaz**; önce **Dosyaya kaydet** deyin." />
        </p>
        <div className="form-row">
          <button
            className="btn danger"
            onClick={reset}
            title={t('Her şeyi siler')}
          >{t('Her şeyi sil')}</button>
        </div>
      </div>
  );

  const wherePanel = (
      <div className="panel">
        <h2>{t('Veriler nerede')}</h2>
        {/* The exe changes what is TRUE here, not just the wording. On the
            three browser routes the storage below is the only copy until
            somebody saves a file, and "tarama verilerini temizle" can take
            it. In the exe the same storage exists, but a copy of everything
            is already on disk in Belgelerim after every change — so the
            sentence that ends "taşınan tek şey dosyaya kaydettiğinizdir"
            would be a lie there, and it is the one sentence on this screen
            that a person acts on. */}
        <p className="hint">
          {storageKind() === "exe" ? (
            <T
              k="Bütün planlar Belgelerim'deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o."
              vars={{ klasor: EXE_FOLDER }}
            />
          ) : (
            <>
              {storageKind() === "file"
                ? t('Bu tarayıcının bu bilgisayardaki deposunda duruyor.')
                : t('Tarayıcının bu site için ayırdığı depoda duruyor.')}{" "}
              <T k="Başka bir tarayıcı bunu **görmez**, “tarama verilerini temizle” onu **siler**." />
            </>
          )}
        </p>
        {/* WHICH store. "The browser's store for this site" leaves out the
            one word somebody would need to act on it, and there are three
            stores on this machine that look identical on screen: the
            double-clicked file, the local install and the site. Anybody
            running two routes has two programs and no way to tell — until
            half a term is in the wrong one. The way ACROSS is named here
            because it is the same two buttons in both directions. */}
        {storageKind() !== "exe" && (
          <p className="hint">
            <T
              k="Bu depo yalnız {adres} adresine ait; öteki kopyaların depoları **ayrıdır**."
              vars={{ adres: storageAddress() }}
            />
          </p>
        )}
        {/* The one habit, spelled out. It used to be a sentence across the
            top bar on every screen; it belongs next to the report that says
            where the data actually lives, and the bar it left had six
            destinations to hold instead. */}
        <p className="hint">
          <T k="Program **kendiliğinden** saklıyor; **Dosyaya kaydet** onun yanına gelir, yerine değil." />
        </p>
        <table className="stat">
          <thead>
            <tr>
              <th>{t('Anahtar')}</th>
              <th>{t('Ne')}</th>
              <th className="num">{t('Yer')}</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <code>{row.key}</code>
                </td>
                <td>{row.what}</td>
                <td className="num">{size(row.chars)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">
          <T
            k="Toplam **{yer}**; tarayıcının bu programa ayırdığı yer yaklaşık **5 MB**."
            vars={{ yer: size(report.totalChars) }}
          />
        </p>
        {/* A row would be a lie in the "Yer" column: the table counts
            localStorage characters, and a directory handle is not text —
            it is the one thing only structured clone can carry, which is
            why it lives in IndexedDB. Left out entirely it would be the
            one key this report does not name. */}
        <p className="hint">
          <T k="Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de." />
        </p>
      </div>
  );

  const backupsPanel = (
      <div className="panel">
        <h2>{t('Bu bilgisayardaki otomatik yedekler')}</h2>
        <p className="hint">
          <T k="Son üç oturumun durumu ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir." />
        </p>
        {backups.length === 0 ? (
          <p className="hint">{t('Henüz otomatik yedek yok, bu ilk oturum.')}</p>
        ) : (
          <table className="stat">
            <thead>
              <tr>
                <th>{t('Oturum')}</th>
                <th className="num">{t('Öğretmen')}</th>
                <th className="num">{t('Sınıf')}</th>
                <th className="num">{t('Ders')}</th>
                <th className="num">{t('Yerleşmiş saat')}</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(({ index, state: b }) => (
                <tr key={index}>
                  <td>
                    {index === 0
                      ? t('bir önceki')
                      : t('{n} oturum önce', { n: index + 1 })}
                  </td>
                  <td className="num">{b.teachers.length}</td>
                  <td className="num">{b.classes.length}</td>
                  <td className="num">{b.lessons.length}</td>
                  <td className="num">{Object.keys(activePlacements(b)).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
  );

  // PLANLAR VE YEDEK: everything that answers "where does my work live and
  // how do I get it out". The library, the folder it is mirrored into, the
  // one-file bundle and the automatic session chain — one section, because
  // they are one question and the reader who has it asks all four.
  if (part === "plans") {
    return (
      <div className="cols">
        <div>
          <Plans state={state} plans={plans} />
          <Folder folder={folder} />
          {bundlePanel}
        </div>
        <aside>{backupsPanel}</aside>
      </div>
    );
  }

  // HAKKINDA: which copy this is, how it updates, and the two operations that
  // replace or empty the open plan. Named for the program rather than for the
  // data because that is what the reader comes here to ask — and "Program
  // hakkında" would have answered to `name: 'Program'`, three pixels from
  // the tab (pitfall 49).
  return (
    <div className="cols">
      <div>
        <Build update={update} />
        <Changelog onSeen={onChangelogSeen} />
        {planDataPanel}
      </div>
      <aside>{wherePanel}</aside>
    </div>
  );
}
