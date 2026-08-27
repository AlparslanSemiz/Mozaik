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

import { useRef, useState } from 'react';
import { useDialogs } from '../Dialogs';
import type React from 'react';
import { BUNDLE_VERSION, bundleVersionOf, parseBundle } from '../../bundle';
import { emptyState, respreadColors } from '../../entities';
import { KEEP_DAILY, MAIN_NAME } from '../../folder';
import { routeName, storageAddress, storageKind, storageReport } from '../../library';
import { downloadBundle, listBackups } from '../../store';
import type { State } from '../../types';
import type { PlanControls } from '../props';
import type { FolderRun } from '../../useFolder';
import type { UpdateRun } from '../../update';
import { SITE_ADRESI } from '../../update';
import { surumEtiketi } from '../../version';
import Plans from './Plans';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  loadState: (next: State) => void;
  plans: PlanControls;
  folder: FolderRun;
  update: UpdateRun;
}

/**
 * localStorage is charged in UTF-16 code units, so a character costs two
 * bytes against the browser's ~5 MB — not the UTF-8 length a file would have.
 */
function size(chars: number): string {
  if (chars === 0) return '—';
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
  const s = folder.status;

  return (
    <div className="panel">
      <h2>Nereye kaydedilsin</h2>

      {s.kind === 'yok' ? (
        <>
          <p className="hint">
            Bu, programın <b>her değişikliği kendiliğinden bir klasöre yazması</b>
            demek — yedek indirmeyi hiç düşünmeden. Ama{' '}
            <b>kullandığınız tarayıcı bunu desteklemiyor.</b> Chrome ve Edge
            destekliyor; Firefox ve Safari desteklemiyor.
          </p>
          {/* The one-habit sentence is NOT repeated here: it already sits in
              "Veriler nerede" two panels down, and saying it twice on one
              screen makes both copies read like boilerplate (and made a test
              ambiguous — pitfall 49). */}
          <p className="hint">
            O zamana kadar üst çubuktaki <b>Dosyaya kaydet</b> tek çare.
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
              <>
                Program <b>bütün planları</b> kendiliğinden Belgelerim'e yazıyor ve
                her gün için ayrı bir yedek bırakıyor (son {KEEP_DAILY} gün).
                Seçecek bir şey yok — üst çubuktaki <b>Dosyaya kaydet</b> yalnız
                bu bilgisayarın dışına bir kopya çıkarmak için.
              </>
            ) : (
              <>
                Bir klasör seçin; program <b>bütün planları</b> oraya yazar ve her
                gün için ayrı bir yedek bırakır (son {KEEP_DAILY} gün). Üst
                çubuktaki <b>Dosyaya kaydet</b> yerine geçmez, onu <b>gereksiz</b>{' '}
                kılar.
              </>
            )}
          </p>

          {!folder.fixed && (
            <div className="form-row">
              <button className="btn primary" onClick={() => void folder.choose()}>
                {s.kind === 'secilmedi' ? 'Klasör seç…' : 'Başka klasör seç…'}
              </button>
              {s.kind === 'izin-gerek' && (
                <button className="btn primary" onClick={() => void folder.allow()}>
                  İzin ver
                </button>
              )}
              {s.kind !== 'secilmedi' && (
                <button className="btn" onClick={() => void folder.forget()}>
                  Vazgeç
                </button>
              )}
            </div>
          )}

          {/* THE ROUND TRIP, named. The folder is not only a backup — it is
              how work moves to the next machine and into the next version,
              and until this sentence existed nothing anywhere said which of
              the files in there was the one to open, or with which button.
              Both halves are already built; what was missing was saying so. */}
          {s.kind !== 'secilmedi' && (
            <p className="hint">
              O klasördeki <code>{MAIN_NAME}</code> dosyası{' '}
              <b>bütün planlarınızın tamamıdır</b>. Yeni bir bilgisayarda, yeni bir
              tarayıcıda ya da programın yeni bir sürümünde işinizi geri getirmenin
              yolu tek: aşağıdaki <b>Tümünü dosyadan aç</b> ile o dosyayı seçmek.
              Yanındaki tarihli dosyalar aynı şeyin gün gün duran hâlleri.
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
              s.kind === 'hata' || (s.kind === 'secilmedi' && storageKind() === 'site')
                ? 'hint bad'
                : 'hint'
            }
            role="status"
          >
            {s.kind === 'secilmedi' && 'Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.'}
            {s.kind === 'izin-gerek' && (
              <>
                <b>{s.name}</b> klasörü seçilmiş, ama tarayıcı izni her açılışta
                yeniden soruyor. <b>İzin ver</b> deyin.
              </>
            )}
            {s.kind === 'bekliyor' && <>
              <b>{s.name}</b> — yazılıyor…
            </>}
            {s.kind === 'yazildi' && (
              <>
                <b>{s.name}</b> klasörüne yazıldı, saat{' '}
                {s.at.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}.{' '}
                {s.files.map((name, i) => (
                  <span key={name}>
                    {i > 0 && ' · '}
                    <code>{name}</code>
                  </span>
                ))}
              </>
            )}
            {s.kind === 'hata' && (
              <>
                <b>{s.name}</b>: {s.text} Klasörü yeniden seçin — o zamana kadar
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
  const adres = storageAddress();

  return (
    <div className="panel">
      <h2>Sürüm ve güncelleme</h2>
      <table className="stat">
        <tbody>
          <tr>
            <td>Sürüm</td>
            <td>
              <b>{surumEtiketi()}</b>
            </td>
          </tr>
          <tr>
            <td>Nasıl açıldı</td>
            <td>{routeName()}</td>
          </tr>
          {adres !== '' && (
            <tr>
              <td>Adres</td>
              <td>
                <code>{adres}</code>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {update.supported ? (
        <>
          <p className="hint">
            Yeni bir sürüm yayınlandığında program bunu <b>kendisi görür</b> ve üstte
            bir satırla söyler. Hiçbir şey zorla değişmez — <b>Yenile</b> demeden eski
            sürümle çalışmaya devam edersiniz.
          </p>
          <div className="form-row">
            <button className="btn" onClick={update.check}>
              Güncellemeleri denetle
            </button>
          </div>
          {update.ready && (
            <p className="hint" role="status">
              <b>Yeni sürüm hazır.</b> Üstteki <b>Yenile</b> düğmesine basın.
            </p>
          )}
        </>
      ) : (
        <p className="hint">
          <b>Bu kopya kendini güncellemez</b> ve hiçbir yere bağlanmaz. Yenisi
          çıktığında en son sürüm her zaman şuradadır:{' '}
          {/* A link under file://, plain text in the .exe. Not a fetch either
              way — but the exe's window has nowhere to put a second page, and
              a link that navigates the app away from itself would look like
              the program crashing. There it is text to read, or to type. */}
          {storageKind() === 'exe' ? (
            <code>{SITE_ADRESI}</code>
          ) : (
            <a href={SITE_ADRESI} target="_blank" rel="noreferrer">
              <code>{SITE_ADRESI}</code>
            </a>
          )}
        </p>
      )}
    </div>
  );
}

export default function Data({ state, change, loadState, plans, folder, update }: Props) {
  const { confirm } = useDialogs();
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
        title: 'Her şey silinecek',
        body: 'Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak.',
        confirmLabel: 'Devam et',
        danger: true,
      }))
    ) {
      return;
    }
    if (
      !(await confirm({
        title: 'Son kez soruyorum',
        body: 'Bu işlem geri alınamaz. Vazgeçme ihtimaliniz varsa önce üst çubuktan "Dosyaya kaydet" deyin.',
        confirmLabel: 'Sil',
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
          ? `${written} plan dosyaya yazıldı; ${planCount - written} planın verisi bulunamadı.`
          : `${written} plan tek dosyaya yazıldı.`,
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
            ? 'Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.'
            : 'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst ' +
              'çubuktaki "Dosyadan aç" ile açabilirsiniz.',
      });
      return;
    }

    const incoming = bundle.library.plans.length;
    if (
      !(await confirm({
        title: 'Bu bilgisayardaki bütün planların yerine geçecek',
        body: `Buradaki ${planCount} plan silinip dosyadaki ${incoming} plan açılacak. Bu işlem geri alınamaz.`,
        confirmLabel: 'Hepsini değiştir',
        danger: true,
      }))
    ) {
      return;
    }

    const { ok, failed } = plans.replaceLibrary(bundle);
    if (ok === 0) {
      setNote({ bad: true, text: 'Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.' });
      return;
    }
    setNote({
      bad: failed > 0,
      text:
        failed > 0
          ? `${ok} plan açıldı, ${failed} plan yazılamadı — depolama dolmuş olabilir. ` +
            'Dosyayı saklayın.'
          : `${ok} plan açıldı.`,
    });
  }

  return (
    <div className="cols">
      <div>
        <Plans state={state} plans={plans} />

        <Folder folder={folder} />

        <div className="panel">
          <h2>Bütün planlar tek dosyada</h2>
          <p className="hint">
            Üst çubuktaki <b>Dosyaya kaydet</b> yalnızca <b>açık olan planı</b> yazar.
            Buradaki dosya <b>bütün planları</b> içerir: her planın derslikleri,
            öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı, taslak işareti ve
            hangisinin açık olduğu. <b>İçermediği</b> şeyler: tema ve kenar çubuğu
            tercihi ile aşağıdaki oturum yedekleri — onlar bu bilgisayara aittir,
            programa değil.
          </p>
          <div className="form-row">
            <button className="btn primary" onClick={saveAll}>
              Tümünü dosyaya kaydet ({planCount} plan)
            </button>
            <button
              className="btn"
              onClick={() => bundleInput.current?.click()}
              title="Bu bilgisayardaki bütün planların yerine dosyadakiler geçer"
            >
              Tümünü dosyadan aç
            </button>
            <input
              ref={bundleInput}
              type="file"
              accept=".json,application/json"
              aria-label="Bütün planları içeren dosya"
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

        <div className="panel">
          <h2>Veri</h2>

          <h3>Renkler</h3>
          <p className="hint">
            Her öğretmene ve her sınıfa kendi rengi verilir. Çok silme yaptıysanız
            renkler arada delik bırakabilir; aşağıdaki düğmeler hepsini baştan sıraya
            dizer. Program bozulmaz, yalnızca renkler değişir.
          </p>
          <div className="form-row">
            <button className="btn" onClick={() => change((d) => respreadColors(d, 'teacher'))}>
              Öğretmen renklerini yeniden dağıt ({state.teachers.length})
            </button>
            <button className="btn" onClick={() => change((d) => respreadColors(d, 'class'))}>
              Sınıf renklerini yeniden dağıt ({state.classes.length})
            </button>
          </div>

          <h3>Sıfırla</h3>
          <p className="hint">
            <b>Açık olan planın</b> öğretmenleri, sınıfları, derslikleri, dersleri ve
            dizilmiş programı silinir; diğer planlara dokunulmaz.{' '}
            <b>Geri alınamaz.</b> Önce <b>Dosyaya kaydet</b> deyin.
          </p>
          <div className="form-row">
            <button className="btn danger" onClick={reset} title="Her şeyi siler">
              Her şeyi sil
            </button>
          </div>
        </div>
      </div>

      <aside>
        <Build update={update} />

        <div className="panel">
          <h2>Veriler nerede</h2>
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
              <>
                Aşağıdaki depo bu programın kendi deposu, ve <b>tek kopya
                değil</b>: her değişiklikten sonra bütün planlar Belgelerim'deki{' '}
                <b>Ders Programı</b> klasörüne de yazılıyor. Bu bilgisayarı
                değiştiriyorsanız taşınacak şey o klasör.
              </>
            ) : (
              <>
                {storageKind() === 'file'
                  ? 'Bu dosyayı açtığınız tarayıcının bu bilgisayardaki deposunda duruyor.'
                  : 'Tarayıcının bu site için bu bilgisayarda ayırdığı depoda duruyor.'}{' '}
                Başka bir tarayıcı ve başka bir bilgisayar bunu <b>görmez</b>;
                tarayıcıda “tarama verilerini temizle” dediğinizde <b>silinir</b>.
                Taşınan ve gerçekten güvende olan tek şey{' '}
                <b>dosyaya kaydettiğinizdir</b>.
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
              Bu depo <code>{storageAddress()}</code> adresine ait ve yalnız ona:
              çift tıklanan dosyanın, yerel kurulumun ve <code>.exe</code>'nin
              depoları <b>ayrıdır</b>, biri ötekinin verisini <b>görmez</b>.
              Birinden ötekine taşımanın yolu şu ikisi:{' '}
              <b>Tümünü dosyaya kaydet</b> → öbür kopyada <b>Tümünü dosyadan aç</b>.
            </p>
          )}
          {/* The one habit, spelled out. It used to be a sentence across the
              top bar on every screen; it belongs next to the report that says
              where the data actually lives, and the bar it left had six
              destinations to hold instead. */}
          <p className="hint">
            Program bu bilgisayarda <b>kendiliğinden</b> saklanıyor — kaydet
            düğmesine basmayı unutsanız da işiniz durur. Üst çubuktaki{' '}
            <b>Dosyaya kaydet</b> bunun yerine geçmez, <b>yanına</b> gelir:
            taşımak ve yedeklemek için. Öğrenilecek tek alışkanlık bu —{' '}
            <i>değişiklik yaptın, yedek indir.</i>
          </p>
          <table className="stat">
            <thead>
              <tr>
                <th>Anahtar</th>
                <th>Ne</th>
                <th className="num">Yer</th>
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
            Toplam <b>{size(report.totalChars)}</b>. Tarayıcının bu program için ayırdığı
            yer yaklaşık <b>5 MB</b>; her plan kendi yerini kaplar.
          </p>
          {/* A row would be a lie in the "Yer" column: the table counts
              localStorage characters, and a directory handle is not text —
              it is the one thing only structured clone can carry, which is
              why it lives in IndexedDB. Left out entirely it would be the
              one key this report does not name. */}
          <p className="hint">
            Yukarıdakiler tarayıcının <b>localStorage</b>'ında. Bir tane daha var
            ve o listede değil, çünkü metin değil: seçtiğiniz klasörün tutamağı{' '}
            <b>IndexedDB</b>'de, <code>ders-programi-klasor</code> adıyla durur.
            Programınız orada <b>değildir</b> — orada duran şey yalnız hangi
            klasöre yazılacağıdır.
          </p>
        </div>

        <div className="panel">
          <h2>Bu bilgisayardaki otomatik yedekler</h2>
          <p className="hint">
            Program her değişiklikte kendiliğinden saklanıyor; ayrıca son üç oturumun
            durumu ayrı tutuluyor. Bunlar <b>bu bilgisayara</b> ve programı açtığınızda{' '}
            <b>hangi plan açıksa ona</b> aittir — taşımak ve gerçekten güvende olmak için
            üst çubuktaki <b>Dosyaya kaydet</b>'i kullanın.
          </p>
          {backups.length === 0 ? (
            <p className="hint">Henüz otomatik yedek yok — bu ilk oturum.</p>
          ) : (
            <table className="stat">
              <thead>
                <tr>
                  <th>Oturum</th>
                  <th className="num">Öğretmen</th>
                  <th className="num">Sınıf</th>
                  <th className="num">Ders</th>
                  <th className="num">Yerleşmiş saat</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(({ index, state: b }) => (
                  <tr key={index}>
                    <td>{index === 0 ? 'bir önceki' : `${index + 1} oturum önce`}</td>
                    <td className="num">{b.teachers.length}</td>
                    <td className="num">{b.classes.length}</td>
                    <td className="num">{b.lessons.length}</td>
                    <td className="num">{Object.keys(b.placements).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </aside>
    </div>
  );
}
