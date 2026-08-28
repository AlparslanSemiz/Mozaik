// Feasibility check (v0.5). The answer to "why can this timetable not be built?"
// This is the thing aSc does not do and that hurts most at the school.

import { useMemo } from 'react';
import { buildIndex, closedConflicts } from '../constraints';
import { buildReport } from '../feasibility';
import type { ReportRow } from '../feasibility';
import type { Id, State } from '../types';
import CapacityRows from './CapacityRows';
import { T, useT } from './T';

interface Props {
  state: State;
}

/**
 * One capacity panel. `id` is what the strip's jump buttons aim at — the strip
 * lives ABOVE `<main>` and cannot hold a ref into here, so the hop is plain
 * DOM, the pattern `gridChrome.ts` and `drag.ts` already use.
 */
function Section({
  id,
  title,
  rows,
  description,
  colorOf,
}: {
  id: string;
  title: string;
  rows: ReportRow[];
  description: string;
  colorOf?: ((id: Id) => number | null) | undefined;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="panel" id={id}>
      <h2>{title}</h2>
      <p className="hint">{description}</p>
      <CapacityRows rows={rows} empty="" problemsFirst colorOf={colorOf} />
    </div>
  );
}

export default function Check({ state }: Props) {
  const t = useT();
  const report = useMemo(() => buildReport(state), [state]);
  const conflicts = useMemo(() => closedConflicts(state, buildIndex(state)), [state]);

  // Where the week stands, from the same numbers the pool and the grid use.
  const placed = Object.keys(state.placements).length;
  const totalWanted = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
  const ix = useMemo(() => buildIndex(state), [state]);
  const doneLessons = state.lessons.filter(
    (l) => (ix.placedHours.get(l.id) ?? 0) >= l.weeklyHours,
  ).length;
  const capacity =
    state.classes.length * state.settings.days.length * state.settings.hours.length;
  const fillPercent = capacity === 0 ? 0 : Math.round((placed / capacity) * 100);
  const freeSlots = Math.max(0, capacity - placed);

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          <strong>{t('Kontrol edilecek bir şey yok.')}</strong>
          <T k="**Okul** sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler." />
        </div>
      </>
    );
  }

  return (
    <>
      {!report.hasProblem ? (
        <div className="panel">
          <div className={conflicts.length > 0 ? 'warn-box' : 'ok-box'}>
            <T k="**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir." />
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="warn-box">
            <T k="**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde" />{' '}
            <span className="badge impossible">{t('İmkânsız')}</span>{' '}
            <T k="yazan satırlar programın dizilmesini engeller. Önce onları çözün." />
          </div>
        </div>
      )}

      {/* TWO FIXED COLUMNS, not an auto-flowing grid.
          `.panel-grid` placed row-major, so every grid ROW was as tall as its
          tallest panel: "Yerleşemeyen dersler" sat at the top of a track sized
          by the 25-row teacher table beside it, with ~600px of dead air under
          it, and the page came to three screens. Now the left column is what
          is WRONG and the right is what the school can HOLD — and every table
          in both is bounded and scrolls in place, so the page does not grow
          with the school. */}
      <div className="cols">
        <div>
        {/* Where the week stands. It is the question you come to this tab with
            and the one it never answered: everything else here is about what
            COULD go wrong, and this is what is actually done. */}
        <div className="panel">
          <h2>{t('Programın durumu')}</h2>
          <table className="stat">
            <tbody>
              <tr>
                <td>{t('Yerleşmiş saat')}</td>
                <td className="num">
                  {placed} / {totalWanted}
                </td>
              </tr>
              <tr>
                <td>{t('Tamamlanan ders')}</td>
                <td className="num">
                  {doneLessons} / {state.lessons.length}
                </td>
              </tr>
              <tr>
                <td>{t('Haftanın doluluğu')}</td>
                <td className="num">%{fillPercent}</td>
              </tr>
              <tr>
                <td>{t('Boş kalan sınıf saati')}</td>
                <td className="num">{freeSlots}</td>
              </tr>
            </tbody>
          </table>
          {placed < totalWanted && (
            <p className="hint">
              <T
                k="Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile yerleştirebilirsiniz."
                vars={{ n: totalWanted - placed }}
              />
            </p>
          )}
        </div>

        {conflicts.length > 0 && (
          <div className="panel kontrol-sorun">
            <h2>{t('Kapalı saatte ders ({n})', { n: conflicts.length })}</h2>
            <p className="hint">
              <T k="Bu dersler programa konduktan **sonra** o saatler kapatıldı. Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle işaretli. Ya saati yeniden açın, ya dersi başka saate taşıyın." />
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-lg">{t('Durum')}</th>
                  <th>{t('Açıklama')}</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((c) => (
                  <tr key={`${c.classId}|${c.day}|${c.hour}`}>
                    <td>
                      <span className="badge impossible">{t('Kapalı saat')}</span>
                    </td>
                    <td>{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {report.violations.length > 0 && (
          <div className="panel kontrol-sorun">
            <h2>{t('Kural ihlalleri ({n})', { n: report.violations.length })}</h2>
            <p className="hint">
              <T k="Dizilmiş program, **Ayarlar → Kurallar** bölümünde girdiğiniz sınırları aşıyor. “Uyar” olarak ayarlanmış kurallar yerleştirmeyi engellemez, sadece burada listelenir." />
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-lg">{t('Durum')}</th>
                  <th>{t('Açıklama')}</th>
                </tr>
              </thead>
              <tbody>
                {report.violations.map((v) => (
                  <tr key={v.key}>
                    <td>
                      <span className={`badge ${v.level === 'block' ? 'impossible' : 'tight'}`}>
                        {v.level === 'block' ? t('Kural dışı') : t('Uyarı')}
                      </span>
                    </td>
                    <td>{v.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {report.unplaceable.length > 0 && (
          <div className="panel kontrol-sorun">
            <h2>Yerleşemeyen dersler ({report.unplaceable.length})</h2>
            <p className="hint">
              {t(
                'Bu derslerin yerleşmemiş saatleri var ama programda koyulabilecek tek bir boş hücre bile kalmamış.',
              )}
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-2xl">{t('Ders')}</th>
                  <th>{t('Sebep')}</th>
                </tr>
              </thead>
              <tbody>
                {report.unplaceable.map((u) => (
                  <tr key={u.lessonId}>
                    <td>{u.name}</td>
                    <td>{u.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        </div>

        {/* The colour is the same mark the grid row and the pool card carry —
            a name without it makes the reader look the person up again. Rooms
            have none, so that Section is given no lookup. The ids are what the
            strip's jump buttons aim at. */}
        <aside>
          <Section
            id="kontrol-ogretmenler"
            title={t('Öğretmenler')}
            rows={report.teachers}
            colorOf={(id) => state.teachers.find((x) => x.id === id)?.color ?? null}
            description={t('Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz.')}
          />
          <Section
            id="kontrol-siniflar"
            title={t('Sınıflar')}
            rows={report.classes}
            colorOf={(id) => state.classes.find((c) => c.id === id)?.color ?? null}
            description={t('Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.')}
          />
          <Section
            id="kontrol-derslikler"
            title={t('Derslikler')}
            rows={report.rooms}
            description={t(
              'Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.',
            )}
          />
        </aside>
      </div>
    </>
  );
}
