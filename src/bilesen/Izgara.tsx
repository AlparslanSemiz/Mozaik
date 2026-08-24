// Ana izgara: satir = ogretmen (veya sinif), sutun = 7 gun x 12 saat.
//
// ~2100 hucre var. Her SATIR ayri memo'lanir: bir yerlestirme tum tabloyu degil
// 1-2 satiri yeniden cizer. Surukleme sirasinda hic re-render olmaz (bkz. suruk.ts).

import { memo } from 'react';
import type { Ayar, Id } from '../tip';

export interface IzgaraHucre {
  dersId: Id;
  ust: string; // sinif adi ("510") veya ogretmen kisaltmasi
  alt: string; // derslik harfi ("A") veya brans
  renk: number;
  /** Blok bir sonraki saatte devam ediyor mu — araya ayrac cizilmesin. */
  suruyor: boolean;
}

export interface IzgaraSatir {
  id: string;
  ad: string;
  ikincil: string;
  /** Uzunluk = gun x saat. Indeks = gun * saatSayisi + saat. */
  hucreler: Array<IzgaraHucre | null>;
  /** Ogretmenin gelemedigi saatler. Sinif gorunumunde hep false. */
  kapali: boolean[];
}

interface SatirProps {
  satir: IzgaraSatir;
  gunSayisi: number;
  saatSayisi: number;
  soluk: boolean;
  onHucreTikla: (satirId: string, gun: number, saat: number) => void;
}

const Satir = memo(function Satir({
  satir,
  gunSayisi,
  saatSayisi,
  soluk,
  onHucreTikla,
}: SatirProps) {
  const hucreler = [];
  for (let g = 0; g < gunSayisi; g++) {
    for (let s = 0; s < saatSayisi; s++) {
      const i = g * saatSayisi + s;
      const h = satir.hucreler[i] ?? null;
      const kapali = satir.kapali[i] === true;

      const sinif = [
        s === 0 ? 'gun-ilk' : '',
        h !== null && h.suruyor ? 'blok-suruyor' : '',
        h === null && kapali ? 'musait-degil' : '',
      ]
        .filter(Boolean)
        .join(' ');

      hucreler.push(
        <td
          key={i}
          data-satir={satir.id}
          data-gun={g}
          data-saat={s}
          className={sinif}
          title={h !== null ? `${h.ust} ${h.alt}` : undefined}
        >
          {h !== null ? (
            <button
              type="button"
              className="kart"
              style={{ background: `var(--renk-${h.renk})` }}
              onClick={() => onHucreTikla(satir.id, g, s)}
              title="Kaldırmak için tıklayın"
            >
              <span className="kart-ust">{h.ust}</span>
              {h.alt !== '' && <span className="kart-alt">{h.alt}</span>}
            </button>
          ) : kapali ? (
            '×'
          ) : null}
        </td>,
      );
    }
  }

  return (
    <tr className={soluk ? '' : 'hedef-satir'}>
      <th className="satir-basi" scope="row">
        {satir.ad}
        <span className="ikincil">{satir.ikincil}</span>
      </th>
      {hucreler}
    </tr>
  );
});

interface Props {
  ayar: Ayar;
  satirlar: IzgaraSatir[];
  basSutunBaslik: string;
  /** Surukleme varsa hedef satirin kimligi; digerleri soluklasir. */
  suruklenenSatirId: string | null;
  onHucreTikla: (satirId: string, gun: number, saat: number) => void;
}

function IzgaraIc({ ayar, satirlar, basSutunBaslik, suruklenenSatirId, onHucreTikla }: Props) {
  const saatSayisi = ayar.saatler.length;
  const gunSayisi = ayar.gunler.length;

  return (
    <div className="izgara-sarmal">
      <table className={`izgara${suruklenenSatirId !== null ? ' surukleniyor' : ''}`}>
        <thead>
          <tr>
            <th className="kose" rowSpan={2}>
              {basSutunBaslik}
            </th>
            {ayar.gunler.map((gun, g) => (
              <th key={g} colSpan={saatSayisi} className="gun-basi">
                {gun}
              </th>
            ))}
          </tr>
          <tr>
            {ayar.gunler.map((_, g) =>
              ayar.saatler.map((saat, s) => (
                <th key={`${g}-${s}`} className={s === 0 ? 'gun-ilk' : ''}>
                  {saat}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((satir) => (
            <Satir
              key={satir.id}
              satir={satir}
              gunSayisi={gunSayisi}
              saatSayisi={saatSayisi}
              soluk={suruklenenSatirId !== null && suruklenenSatirId !== satir.id}
              onHucreTikla={onHucreTikla}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(IzgaraIc);
