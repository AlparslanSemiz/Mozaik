// Feasibility check (v0.5). The answer to "why can this timetable not be built?"
// This is the thing aSc does not do and that hurts most at the school.

import { useMemo } from 'react';
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
            <th style={{ width: 110 }}>Durum</th>
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

  if (state.lessons.length === 0) {
    return (
      <div className="main">
        <div className="empty-screen">
          <strong>Kontrol edilecek bir şey yok.</strong>
          <b>Kurulum</b> sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra
          buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      {!report.hasProblem ? (
        <div className="panel">
          <div className="ok-box">
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
                <th style={{ width: 110 }}>Durum</th>
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
                <th style={{ width: 220 }}>Ders</th>
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
  );
}
