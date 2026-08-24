// Yazdirma: SAYFA BASINA BIR VARLIK.
//
// 7 gun x 12 saat = 7 sutun x 12 satir, A4 dikeye tam oturur. 84 sutunlu ana
// tabloyu basmak imkansiz (sutun basina ~3 mm), denenmiyor.

import { useMemo, useState } from 'react';
import { indeksle, musaitKey, yerKey } from '../kisit';
import type { Durum } from '../tip';

interface Props {
  durum: Durum;
}

type Kapsam = 'siniflar' | 'ogretmenler' | 'ikisi';

export default function Yazdir({ durum }: Props) {
  const [kapsam, setKapsam] = useState<Kapsam>('siniflar');
  const [renkli, setRenkli] = useState(true);
  const ix = useMemo(() => indeksle(durum), [durum]);

  if (durum.dersler.length === 0) {
    return (
      <div className="govde">
        <div className="bos-ekran">
          <strong>Yazdırılacak program yok.</strong>
          Önce <b>Kurulum</b> sekmesinden dersleri girip <b>Program</b> sekmesinde
          dizin.
        </div>
      </div>
    );
  }

  const sinifSayfalari = kapsam !== 'ogretmenler';
  const ogretmenSayfalari = kapsam !== 'siniflar';

  return (
    <div className="govde">
      <div className="panel basma">
        <h2>Yazdır</h2>
        <p className="ipucu">
          Her sınıf ve her öğretmen ayrı sayfaya basılır (A4 dikey). Yazdırma
          penceresinde <b>kenar boşlukları: varsayılan</b> ve <b>arka plan grafikleri:
          açık</b> olsun, yoksa renkler çıkmaz.
        </p>
        <div className="satir-form">
          <label>
            Ne basılsın{' '}
            <select value={kapsam} onChange={(e) => setKapsam(e.target.value as Kapsam)}>
              <option value="siniflar">Sınıf programları ({durum.siniflar.length} sayfa)</option>
              <option value="ogretmenler">
                Öğretmen programları ({durum.ogretmenler.length} sayfa)
              </option>
              <option value="ikisi">
                İkisi de ({durum.siniflar.length + durum.ogretmenler.length} sayfa)
              </option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={renkli}
              onChange={(e) => setRenkli(e.target.checked)}
            />{' '}
            Renkli bas
          </label>
          <button className="dugme birincil" onClick={() => window.print()}>
            Yazdır
          </button>
        </div>
      </div>

      <div className="yazdir-alani">
        {sinifSayfalari &&
          durum.siniflar.map((sinif) => (
            <div className="yazdir-sayfa" key={sinif.id}>
              <h3>
                {sinif.ad} sınıfı haftalık ders programı
                {sinif.derslikId != null &&
                  ` — ${ix.derslikById.get(sinif.derslikId)?.ad ?? ''} dersliği`}
              </h3>
              <table className="yazdir">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Saat</th>
                    {durum.ayar.gunler.map((g, i) => (
                      <th key={i}>{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {durum.ayar.saatler.map((saat, s) => (
                    <tr key={s}>
                      <th>{saat}</th>
                      {durum.ayar.gunler.map((_, g) => {
                        const dersId = durum.yerlesim[yerKey(sinif.id, g, s)];
                        const ders = dersId === undefined ? undefined : ix.dersById.get(dersId);
                        const ogretmen =
                          ders === undefined ? undefined : ix.ogretmenById.get(ders.ogretmenId);
                        return (
                          <td
                            key={g}
                            style={
                              renkli && ogretmen !== undefined
                                ? { background: `var(--renk-${ogretmen.renk})` }
                                : undefined
                            }
                          >
                            {ogretmen !== undefined && (
                              <>
                                <span className="y-ust">{ogretmen.brans}</span>
                                <span className="y-alt">{ogretmen.kisaltma}</span>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {ogretmenSayfalari &&
          durum.ogretmenler.map((ogretmen) => (
            <div className="yazdir-sayfa" key={ogretmen.id}>
              <h3>
                {ogretmen.ad} ({ogretmen.kisaltma}) — {ogretmen.brans} — haftalık ders
                programı
              </h3>
              <table className="yazdir">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Saat</th>
                    {durum.ayar.gunler.map((g, i) => (
                      <th key={i}>{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {durum.ayar.saatler.map((saat, s) => (
                    <tr key={s}>
                      <th>{saat}</th>
                      {durum.ayar.gunler.map((_, g) => {
                        const dersId = ix.ogretmenDolu.get(musaitKey(ogretmen.id, g, s));
                        const ders = dersId === undefined ? undefined : ix.dersById.get(dersId);
                        const sinif =
                          ders === undefined ? undefined : ix.sinifById.get(ders.sinifId);
                        const kapali =
                          durum.musaitDegil[musaitKey(ogretmen.id, g, s)] !== undefined;
                        return (
                          <td
                            key={g}
                            style={
                              renkli && sinif !== undefined
                                ? { background: `var(--renk-${ogretmen.renk})` }
                                : kapali
                                  ? { background: '#e0e0e0' }
                                  : undefined
                            }
                          >
                            {sinif !== undefined ? (
                              <>
                                <span className="y-ust">{sinif.ad}</span>
                                <span className="y-alt">
                                  {sinif.derslikId != null
                                    ? (ix.derslikById.get(sinif.derslikId)?.ad ?? '')
                                    : ''}
                                </span>
                              </>
                            ) : kapali ? (
                              '×'
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
