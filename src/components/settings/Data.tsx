// Settings section: the data itself.
//
// "Sıfırla" lives HERE and not in the top bar any more. In the top bar it sat
// one careless click away from "Dosyadan aç" and it deletes everything; it is
// also the rarest button in the app. Saving and opening a file STAY up there,
// because that is the one habit my father has to keep (docs/PLAN.md pitfall 7).

import { emptyState, respreadColors } from '../../entities';
import { listBackups } from '../../store';
import type { State } from '../../types';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  loadState: (next: State) => void;
}

export default function Data({ state, change, loadState }: Props) {
  const backups = listBackups();

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

  return (
    <div className="cols">
      <div>
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
            Öğretmenler, sınıflar, derslikler, dersler ve dizilmiş programın tamamı
            silinir. <b>Geri alınamaz.</b> Önce <b>Dosyaya kaydet</b> deyin.
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
          <h2>Bu bilgisayardaki otomatik yedekler</h2>
          <p className="hint">
            Program her değişiklikte kendiliğinden saklanıyor; ayrıca son üç oturumun
            durumu ayrı tutuluyor. Bunlar <b>bu bilgisayara</b> aittir — taşımak ve
            gerçekten güvende olmak için üst çubuktaki <b>Dosyaya kaydet</b>'i kullanın.
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
