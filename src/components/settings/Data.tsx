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
import type React from 'react';
import { BUNDLE_VERSION, bundleVersionOf, parseBundle } from '../../bundle';
import { emptyState, respreadColors } from '../../entities';
import { storageKind, storageReport } from '../../library';
import { downloadBundle, listBackups } from '../../store';
import type { State } from '../../types';
import type { PlanControls } from '../props';
import Plans from './Plans';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  loadState: (next: State) => void;
  plans: PlanControls;
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

export default function Data({ state, change, loadState, plans }: Props) {
  const backups = listBackups();
  const bundleInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<{ bad: boolean; text: string } | null>(null);

  const report = storageReport(plans.library);
  const planCount = plans.library.plans.length;

  function reset() {
    if (
      !window.confirm(
        'Her şey silinecek: öğretmenler, sınıflar, dersler ve program. Emin misiniz?',
      )
    ) {
      return;
    }
    if (!window.confirm('Son kez soruyorum — bu işlem geri alınamaz. Silinsin mi?')) return;
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
      !window.confirm(
        `Bu bilgisayardaki ${planCount} plan silinip dosyadaki ${incoming} plan ` +
          'açılacak. Bu işlem geri alınamaz.',
      )
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
        <div className="panel">
          <h2>Veriler nerede</h2>
          <p className="hint">
            {storageKind() === 'file'
              ? 'Bu dosyayı açtığınız tarayıcının bu bilgisayardaki deposunda duruyor.'
              : 'Tarayıcının bu site için bu bilgisayarda ayırdığı depoda duruyor.'}{' '}
            Başka bir tarayıcı ve başka bir bilgisayar bunu <b>görmez</b>; tarayıcıda
            “tarama verilerini temizle” dediğinizde <b>silinir</b>. Taşınan ve gerçekten
            güvende olan tek şey <b>dosyaya kaydettiğinizdir</b>.
          </p>
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
