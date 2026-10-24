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
import { BUNDLE_VERSION, bundleVersionOf, parseBundle } from '../../pure/io';
import { type PlanControls, T, useDialogs, useT } from '../common';
import { useLoadSample } from '../plans';
import { useRef, useState } from 'react';
import { Build, Changelog } from './About';
import { Folder } from './Folder';
import Plans from './Plans';

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
    e.target.value = ''; // so the same file can be picked again
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
        title={t(
          'İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve oturum yedekleri girmez.',
        )}
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
        >
          {t('Tümünü dosyadan aç')}
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
        >
          {t('Örnek okulu yükle')}
        </button>
      </div>

      <h3>{t('Sıfırla')}</h3>
      <p className="hint">
        <T k="**Açık olan plan** tamamen silinir ve **geri alınamaz**; önce **Dosyaya kaydet** deyin." />
      </p>
      <div className="form-row">
        <button className="btn danger" onClick={reset} title={t('Her şeyi siler')}>
          {t('Her şeyi sil')}
        </button>
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
                <td>{index === 0 ? t('bir önceki') : t('{n} oturum önce', { n: index + 1 })}</td>
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
      <aside>{wherePanel}</aside>
    </div>
  );
}
