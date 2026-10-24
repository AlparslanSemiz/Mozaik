// Ayarlar → Planlar ve yedek: the folder my father picks once, where every
// plan is written from then on.

import { type FolderRun, KEEP_DAILY, MAIN_NAME, storageKind } from '../../platform/storage';
import { T, useT } from '../common';

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
export function Folder({ folder }: { folder: FolderRun }) {
  const t = useT();
  const s = folder.status;

  return (
    <div className="panel">
      <h2>{t('Nereye kaydedilsin')}</h2>

      {s.kind === 'yok' ? (
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
              <button className="btn primary" onClick={() => void folder.choose()}>
                {s.kind === 'secilmedi' ? t('Klasör seç…') : t('Başka klasör seç…')}
              </button>
              {s.kind === 'izin-gerek' && (
                <button className="btn primary" onClick={() => void folder.allow()}>
                  {t('İzin ver')}
                </button>
              )}
              {s.kind !== 'secilmedi' && (
                <button className="btn" onClick={() => void folder.forget()}>
                  {t('Vazgeç')}
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
              s.kind === 'hata' || (s.kind === 'secilmedi' && storageKind() === 'site')
                ? 'hint bad'
                : 'hint'
            }
            role="status"
          >
            {s.kind === 'secilmedi' &&
              t('Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.')}
            {s.kind === 'izin-gerek' && (
              <T
                k="**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin."
                vars={{ klasor: s.name }}
              />
            )}
            {s.kind === 'bekliyor' && <T k="**{klasor}** · yazılıyor…" vars={{ klasor: s.name }} />}
            {s.kind === 'yazildi' && (
              <>
                <b>{s.name}</b> klasörüne yazıldı, saat{' '}
                {s.at.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                .{' '}
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
                <b>{s.name}</b>: {s.text} Klasörü yeniden seçin. O zamana kadar işiniz yalnız
                tarayıcıda duruyor.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
