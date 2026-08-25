// Feasibility check (v0.5). The answer to "why can this timetable not be built?"
// This is the thing aSc does not do and that hurts most at the school.

import { useMemo } from 'react';
import { buildIndex, closedConflicts } from '../constraints';
import { buildReport } from '../feasibility';
import type { ReportRow } from '../feasibility';
import type { State } from '../types';

interface Props {
  state: State;
}

const BADGE: Record<ReportRow['level'], string> = {
  ok: 'Sorun yok',
  tight: 'Zor olacak',
  impossible: 'İmkânsız',
};

function Section({
  title,
  rows,
  description,
}: {
  title: string;
  rows: ReportRow[];
  description: string;
}) {
  if (rows.length === 0) return null;
  // Problems first: his eye should land on what needs attention.
  const sorted = [...rows].sort((a, b) => {
    const order = { impossible: 0, tight: 1, ok: 2 };
    return order[a.level] - order[b.level] || a.name.localeCompare(b.name, 'tr');
  });

  return (
    <div className="panel">
      <h2>{title}</h2>
      <p className="hint">{description}</p>
      <table className="list">
        <thead>
          <tr>
            <th className="w-col-lg">Durum</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>
                <span className={`badge ${r.level}`}>{BADGE[r.level]}</span>
              </td>
              <td>{r.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Check({ state }: Props) {
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
          <strong>Kontrol edilecek bir şey yok.</strong>
          <b>Kurulum</b> sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra
          buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.
        </div>
      </>
    );
  }

  return (
    <>
      {!report.hasProblem ? (
        <div className="panel">
          <div className={conflicts.length > 0 ? 'warn-box' : 'ok-box'}>
            <b>Sorun görünmüyor.</b> Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri
            yüklenen ders saatlerini karşılıyor. Program dizilebilir.
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="warn-box">
            <b>Dikkat edilmesi gereken noktalar var.</b> Aşağıdaki listelerde{' '}
            <span className="badge impossible">İmkânsız</span> yazan satırlar programın
            dizilmesini engeller — önce onları çözün.
          </div>
        </div>
      )}

      {/* An auto-flowing card grid, not two fixed columns: when nothing is
          wrong the problem panels are absent, and a fixed left column would
          then be empty while everything piled up on the right. It also fixes
          the older fault — a 110px badge next to a 1200px sentence is well
          past the length a line can still be read at. */}
      <div className="panel-grid">
        {/* Where the week stands. It is the question you come to this tab with
            and the one it never answered: everything else here is about what
            COULD go wrong, and this is what is actually done. */}
        <div className="panel">
          <h2>Programın durumu</h2>
          <table className="stat">
            <tbody>
              <tr>
                <td>Yerleşmiş saat</td>
                <td className="num">
                  {placed} / {totalWanted}
                </td>
              </tr>
              <tr>
                <td>Tamamlanan ders</td>
                <td className="num">
                  {doneLessons} / {state.lessons.length}
                </td>
              </tr>
              <tr>
                <td>Haftanın doluluğu</td>
                <td className="num">%{fillPercent}</td>
              </tr>
              <tr>
                <td>Boş kalan sınıf saati</td>
                <td className="num">{freeSlots}</td>
              </tr>
            </tbody>
          </table>
          {placed < totalWanted && (
            <p className="hint">
              Kalan <b>{totalWanted - placed}</b> saat havuzda bekliyor.{' '}
              <b>Program</b> sekmesindeki <b>Otomatik diz</b> ile yerleştirebilirsiniz.
            </p>
          )}
        </div>

        {conflicts.length > 0 && (
          <div className="panel">
            <h2>Kapalı saatte ders ({conflicts.length})</h2>
            <p className="hint">
              Bu dersler programa konduktan <b>sonra</b> o saatler kapatıldı. Hiçbiri
              silinmedi — <b>Program</b> sekmesinde kırmızı çerçeveyle işaretli. Ya saati
              yeniden açın, ya dersi başka saate taşıyın.
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-lg">Durum</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((c) => (
                  <tr key={`${c.classId}|${c.day}|${c.hour}`}>
                    <td>
                      <span className="badge impossible">Kapalı saat</span>
                    </td>
                    <td>{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {report.violations.length > 0 && (
          <div className="panel">
            <h2>Kural ihlalleri ({report.violations.length})</h2>
            <p className="hint">
              Dizilmiş program, <b>Ayarlar → Kurallar</b> bölümünde girdiğiniz sınırları
              aşıyor. “Uyar” olarak ayarlanmış kurallar yerleştirmeyi engellemez, sadece
              burada listelenir.
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-lg">Durum</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {report.violations.map((v) => (
                  <tr key={v.key}>
                    <td>
                      <span className={`badge ${v.level === 'block' ? 'impossible' : 'tight'}`}>
                        {v.level === 'block' ? 'Kural dışı' : 'Uyarı'}
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
          <div className="panel">
            <h2>Yerleşemeyen dersler ({report.unplaceable.length})</h2>
            <p className="hint">
              Bu derslerin yerleşmemiş saatleri var ama programda koyulabilecek tek bir boş
              hücre bile kalmamış.
            </p>
            <table className="list">
              <thead>
                <tr>
                  <th className="w-col-2xl">Ders</th>
                  <th>Sebep</th>
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

        <Section
          title="Öğretmenler"
          rows={report.teachers}
          description="Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz."
        />
        <Section
          title="Sınıflar"
          rows={report.classes}
          description="Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı."
        />
        <Section
          title="Derslikler"
          rows={report.rooms}
          description="Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır."
        />
      </div>
    </>
  );
}
