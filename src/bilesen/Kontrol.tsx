// Yapilabilirlik kontrolu (v0.5). "Program neden dizilmiyor?" sorusunun cevabi.
// aSc'nin yapmadigi ve kursta en cok aciyan sey burasi.

import { useMemo } from 'react';
import { raporla } from '../fizibilite';
import type { Satir } from '../fizibilite';
import type { Durum } from '../tip';

interface Props {
  durum: Durum;
}

const ROZET: Record<Satir['seviye'], string> = {
  iyi: 'Sorun yok',
  sikisik: 'Zor olacak',
  imkansiz: 'İmkânsız',
};

function Bolum({ baslik, satirlar, aciklama }: { baslik: string; satirlar: Satir[]; aciklama: string }) {
  if (satirlar.length === 0) return null;
  // Once sorunlular: babamin gozu once neye bakmasi gerektigini bilsin.
  const sirali = [...satirlar].sort((a, b) => {
    const sira = { imkansiz: 0, sikisik: 1, iyi: 2 };
    return sira[a.seviye] - sira[b.seviye] || a.ad.localeCompare(b.ad, 'tr');
  });

  return (
    <div className="panel">
      <h2>{baslik}</h2>
      <p className="ipucu">{aciklama}</p>
      <table className="liste">
        <thead>
          <tr>
            <th style={{ width: 110 }}>Durum</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {sirali.map((s) => (
            <tr key={s.id}>
              <td>
                <span className={`rozet ${s.seviye}`}>{ROZET[s.seviye]}</span>
              </td>
              <td>{s.mesaj}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Kontrol({ durum }: Props) {
  const rapor = useMemo(() => raporla(durum), [durum]);

  if (durum.dersler.length === 0) {
    return (
      <div className="govde">
        <div className="bos-ekran">
          <strong>Kontrol edilecek bir şey yok.</strong>
          <b>Kurulum</b> sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra
          buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.
        </div>
      </div>
    );
  }

  return (
    <div className="govde">
      {!rapor.sorunVar ? (
        <div className="panel">
          <div className="iyi-kutu">
            <b>Sorun görünmüyor.</b> Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri
            yüklenen ders saatlerini karşılıyor. Program dizilebilir.
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="uyari-kutu">
            <b>Dikkat edilmesi gereken noktalar var.</b> Aşağıdaki listelerde{' '}
            <span className="rozet imkansiz">İmkânsız</span> yazan satırlar programın
            dizilmesini engeller — önce onları çözün.
          </div>
        </div>
      )}

      {rapor.yerlesemeyenler.length > 0 && (
        <div className="panel">
          <h2>Yerleşemeyen dersler ({rapor.yerlesemeyenler.length})</h2>
          <p className="ipucu">
            Bu derslerin yerleşmemiş saatleri var ama programda koyulabilecek tek bir boş
            hücre bile kalmamış.
          </p>
          <table className="liste">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Ders</th>
                <th>Sebep</th>
              </tr>
            </thead>
            <tbody>
              {rapor.yerlesemeyenler.map((y) => (
                <tr key={y.dersId}>
                  <td>{y.ad}</td>
                  <td>{y.mesaj}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Bolum
        baslik="Öğretmenler"
        satirlar={rapor.ogretmenler}
        aciklama="Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz."
      />
      <Bolum
        baslik="Sınıflar"
        satirlar={rapor.siniflar}
        aciklama="Sınıfa yüklenen toplam ders saati, haftadaki toplam slot sayısını aşamaz."
      />
      <Bolum
        baslik="Derslikler"
        satirlar={rapor.derslikler}
        aciklama="Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır."
      />
    </div>
  );
}
