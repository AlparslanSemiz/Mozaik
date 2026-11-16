// Settings section: the data itself.
//
// "Sıfırla" lives HERE and not in the top bar any more. In the top bar it sat
// one careless click away from "Dosyadan aç" and it deletes everything; it is
// also the rarest button in the app. Saving and opening a file STAY up there,
// because that is the one habit my father has to keep (docs/TRAPS.md pitfall 7).
//
// Two things were added in v1.0 (task 4d). The first is the BUNDLE: the top
// bar's file holds one plan, so since the library arrived a three-plan setup
// could not be carried anywhere in one piece. The second is the panel that
// says, with real key names and real sizes, WHERE the work actually sits —
// "it is saved in the browser" does not tell anyone that clearing browsing
// data destroys it.

import type { State } from '../../leaf/model';
import { EXE_FOLDER } from '../../platform/exe';
import {
  type FolderRun,
  downloadBundle,
  listBackups,
  storageAddress,
  storageKind,
  storageReport,
} from '../../platform/storage';
import type { UpdateRun } from '../../platform/update';
import { emptyState } from '../../pure/entities';
import { activePlacements } from '../../pure/grid';
import {
  type BundleNote,
  GoButton,
  HelpHead,
  type PlanControls,
  T,
  useDialogs,
  useOpenBundle,
  useT,
  useToast,
  useKeepBefore,
  useUndoIf,
} from '../common';
import { useLoadSample } from '../plans';
import { useRef, useState } from 'react';
import { Build, Changelog, TechRows } from './About';
import { Folder } from './Folder';
import Plans from './Plans';

interface Props {
  state: State;
  change: (apply: (d: State) => State, label?: string) => void;
  /** Puts `next` in this plan's place as an undoable step (useStore). */
  replaceState: (next: State, label?: string) => State | null;
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
   * two doors. The panels that need none of those handlers (the folder, the
   * build line, the release notes) are their own files beside it since
   * 2026-10-24: `Folder.tsx` and `About.tsx`.
   */
  part: 'plans' | 'about';
}

/**
 * localStorage is charged in UTF-16 code units, so a character costs two
 * bytes against the browser's ~5 MB — not the UTF-8 length a file would have.
 */
function size(chars: number): string {
  if (chars === 0) return '–';
  const bytes = chars * 2;
  return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
}

export default function Data({
  state,
  change,
  replaceState,
  plans,
  folder,
  update,
  onChangelogSeen,
  part,
}: Props) {
  const t = useT();
  const { confirm } = useDialogs();
  const notify = useToast();
  const undoIf = useUndoIf();
  const keepBefore = useKeepBefore();
  const loadSample = useLoadSample();
  const openBundle = useOpenBundle(plans);
  const backups = listBackups();
  const bundleInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<BundleNote | null>(null);

  const report = storageReport(plans.library);
  const planCount = plans.library.plans.length;

  async function reset() {
    // ONE question, because this is the widest click in the program. The
    // second one ("Son kez soruyorum") went on 2026-11-15 with the reason for
    // it: the reset is an ordinary step of the history now, and its notice
    // offers "Geri al" like every other deletion (TODO SD1).
    if (
      !(await confirm({
        title: t('Her şey silinecek'),
        body: t(
          'Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak. Hemen ardından "Geri al" ile geri gelir.',
        ),
        confirmLabel: t('Her şeyi sil'),
        danger: true,
      }))
    ) {
      return;
    }
    const said = t('Bu plandaki her şey silindi.');
    keepBefore(state, said);
    const next = replaceState(emptyState(), said);
    if (next === null) notify(said, 'info');
    else notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
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
    e.target.value = ''; // so the same file can be picked again
    if (file === undefined) return;
    const { note: said } = await openBundle(await file.text());
    if (said !== null) setNote(said);
  }

  // "BÜTÜN PLANLAR TEK DOSYADA" — written out here so both doors can hold it.
  // It reads the library and writes a bundle, which is `Plans`' own noun, and
  // it is drawn in the plans section.
  const bundlePanel = (
    <div className="panel">
      <HelpHead topic="Bütün planlar tek dosyada">
        <p>
          <T k="Üst çubuktaki **Kaydet** açık planı yazar; buradaki dosya **bütün planları**." />
        </p>
      </HelpHead>
      <div className="form-row">
        <button className="btn" onClick={saveAll}>
          {t('Bütün planları dosyaya kaydet ({n} plan)', { n: planCount })}
        </button>
        <button
          className="btn"
          onClick={() => bundleInput.current?.click()}
          title={t('Bu bilgisayardaki bütün planların yerine dosyadakiler geçer')}
        >
          {t('Bütün planları dosyadan aç')}
        </button>
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
        <p className={note.bad ? 'hint bad' : 'hint'} role="status">
          {note.text}{' '}
          {note.update === true && (
            <GoButton to={{ tab: 'school', section: 'about' }}>
              {t('Güncellemeleri denetle')}
            </GoButton>
          )}
        </p>
      )}
    </div>
  );

  // THE PLAN LIBRARY AND THE FILE THAT HOLDS ALL OF IT — one question, one
  // screen. The bundle sits under the library rather than under the folder
  // because it is the same noun: every plan, in one place.
  const planDataPanel = (
    <div className="panel">
      <HelpHead topic="Bu planın verisi">
        <p>
          <T k="Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**" />
        </p>
      </HelpHead>

      {/* The sample school's home. It used to live only on the Kurulum
            screen, where it could only ever be reached by an EMPTY project —
            so anyone who wanted to look at it again after starting their own
            work had no way back to it. Kurulum still offers it once, on a
            first run; this is where it stays. */}
      <h3>{t('Örnek okul verisi')}</h3>
      <div className="form-row">
        <button
          className="btn"
          title={t('Bu planın yerine hazır örnek okulu koyar')}
          onClick={() => void loadSample(state, change)}
        >
          {t('Örnek okulu yükle')}
        </button>
      </div>
    </div>
  );

  // Not beside "Örnek okulu yükle": the widest click in the program had the
  // most harmless one for a neighbour (walkthrough, 2026-11-16). Its own
  // panel, at the foot of the side column, and still behind its question.
  const resetPanel = (
    <div className="panel danger">
      <h3>{t('Sıfırla')}</h3>
      <p className="hint">
        <T k="**Açık olan plan** tamamen silinir; hemen ardından **Geri al** ile geri gelir." />
      </p>
      <button className="btn danger" onClick={reset}>
        {t('Her şeyi sil')}
      </button>
    </div>
  );

  // "TEKNİK BİLGİLER", collapsed (Sadeleşme, phase 1, 2026-11-16): storage
  // keys, sizes and the search's threads are a developer's reading, and they
  // were the longest panel on a screen he opens to see the version. Still
  // here, one click away, for the day somebody has to ask "where is it".
  // A Tab stop of its own once open: in the side rail this panel scrolls
  // inside itself, and the part below the fold was out of the keyboard's
  // reach (axe `scrollable-region-focusable`).
  const wherePanel = (
    <details className="panel tech-details">
      <summary>{t('Teknik bilgiler')}</summary>
      <div className="focus-scroll" tabIndex={0} role="group" aria-labelledby="veriler-nerede">
        <TechRows />
        <h2 id="veriler-nerede">{t('Veriler nerede')}</h2>
        {/* The exe changes what is TRUE here, not just the wording. On the
            three browser routes the storage below is the only copy until
            somebody saves a file, and "tarama verilerini temizle" can take
            it. In the exe the same storage exists, but a copy of everything
            is already on disk in Belgelerim after every change — so the
            sentence that ends "taşınan tek şey dosyaya kaydettiğinizdir"
            would be a lie there, and it is the one sentence on this screen
            that a person acts on. */}
        <p className="hint">
          {storageKind() === 'exe' ? (
            <T
              k="Bütün planlar Belgelerim'deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o."
              vars={{ klasor: EXE_FOLDER }}
            />
          ) : (
            <>
              {storageKind() === 'file'
                ? t('Bu tarayıcının bu bilgisayardaki deposunda duruyor.')
                : t('Tarayıcının bu site için ayırdığı depoda duruyor.')}{' '}
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
        {storageKind() !== 'exe' && (
          <p className="hint">
            <T
              k="Bu depo yalnız {adres} adresine ait; başka adreste açılan Mozaik'in deposu **ayrıdır**."
              vars={{ adres: storageAddress() }}
            />
          </p>
        )}
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
            k="Toplam **{yer}**; tarayıcının Mozaik'e ayırdığı yer yaklaşık **5 MB**."
            vars={{ yer: size(report.totalChars) }}
          />
        </p>
      </div>
    </details>
  );

  const backupsPanel = (
    <div className="panel">
      <HelpHead topic="Bu bilgisayardaki otomatik yedekler">
        <p>
          <T k="Son üç açılıştaki durum otomatik yedek olarak ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir." />
        </p>
      </HelpHead>
      {backups.length === 0 ? (
        <p className="hint">
          {t('Henüz otomatik yedek yok; ilki Mozaik bir daha açılınca alınır.')}
        </p>
      ) : (
        <table className="stat">
          <thead>
            <tr>
              <th>{t('Otomatik yedek')}</th>
              <th className="num">{t('Öğretmen')}</th>
              <th className="num">{t('Sınıf')}</th>
              <th className="num">{t('Ders')}</th>
              <th className="num">{t('Yerleşmiş saat')}</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.index}>
                <td>
                  {b.index === 0
                    ? t('bir önceki açılış')
                    : t('{n} açılış önce', { n: b.index + 1 })}
                </td>
                {/* One this copy cannot read is still a backup, and after A1
                    it was the real plan: it is named, not left out. */}
                {'state' in b ? (
                  <>
                    <td className="num">{b.state.teachers.length}</td>
                    <td className="num">{b.state.classes.length}</td>
                    <td className="num">{b.state.lessons.length}</td>
                    <td className="num">{Object.keys(activePlacements(b.state)).length}</td>
                  </>
                ) : (
                  <td colSpan={4}>
                    {b.problem === 'yeni'
                      ? t('daha yeni bir sürümle yazılmış, bu sürüm açamıyor')
                      : t('okunamadı')}
                  </td>
                )}
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
  if (part === 'plans') {
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
      <aside>
        {wherePanel}
        {resetPanel}
      </aside>
    </div>
  );
}
