// Ogretmenin gelemeyecegi saatler. Izgarada gri tarali "x" olarak gorunur.
//
// 25 ogretmen x 84 hucreyi tek tek tiklatmak kabul edilemez, o yuzden:
// surukleyerek boyama, gun basligina tiklayinca tum gun, saat basligina
// tiklayinca haftanin o saati, ve tumunu ac/kapat.

import { useRef, useState } from 'react';
import { musaitKey } from '../kisit';
import type { Durum } from '../tip';
import { musaitlikAyarla, musaitlikHepsi } from '../veri';

interface Props {
  durum: Durum;
  degistir: (uygula: (d: Durum) => Durum) => void;
}

export default function Musaitlik({ durum, degistir }: Props) {
  const [seciliId, setSeciliId] = useState(durum.ogretmenler[0]?.id ?? '');
  // Surukleme bitene kadar degisiklik uygulanmaz: 40 hucre boyamak
  // 40 ayri geri-al adimi olusturmasin.
  const [gecici, setGecici] = useState<Set<string> | null>(null);
  const boyamaModu = useRef(false);

  const secili = durum.ogretmenler.find((o) => o.id === seciliId) ?? durum.ogretmenler[0];

  if (secili === undefined) {
    return (
      <div className="govde">
        <div className="bos-ekran">
          <strong>Önce öğretmen ekleyin.</strong>
          Müsaitlik girebilmek için <b>Kurulum</b> sekmesinden en az bir öğretmen
          eklemeniz gerekiyor.
        </div>
      </div>
    );
  }

  // Hoisted fonksiyonlar icinde daralttigimiz `secili` yeniden genisliyor;
  // kimligi burada sabitliyoruz.
  const ogretmenId = secili.id;

  const kapaliMi = (g: number, s: number): boolean =>
    durum.musaitDegil[musaitKey(ogretmenId, g, s)] !== undefined;

  const gosterilenKapali = (g: number, s: number): boolean => {
    if (gecici !== null && gecici.has(`${g}|${s}`)) return boyamaModu.current;
    return kapaliMi(g, s);
  };

  function boyamaBaslat(g: number, s: number) {
    boyamaModu.current = !kapaliMi(g, s); // ilk hucrenin tersine cevir, digerlerine uygula
    setGecici(new Set([`${g}|${s}`]));
  }

  function boyamaSurdur(g: number, s: number) {
    setGecici((onceki) => {
      if (onceki === null) return null;
      if (onceki.has(`${g}|${s}`)) return onceki;
      const yeni = new Set(onceki);
      yeni.add(`${g}|${s}`);
      return yeni;
    });
  }

  function boyamaBitir() {
    const kume = gecici;
    setGecici(null);
    if (kume === null || kume.size === 0) return;

    const hucreler = [...kume].map((k) => {
      const [g, s] = k.split('|');
      return { gun: Number(g), saat: Number(s) };
    });
    degistir((d) => musaitlikAyarla(d, ogretmenId, hucreler, boyamaModu.current));
  }

  function sutunDegistir(gun: number) {
    const hepsiKapali = durum.ayar.saatler.every((_, s) => kapaliMi(gun, s));
    const hucreler = durum.ayar.saatler.map((_, s) => ({ gun, saat: s }));
    degistir((d) => musaitlikAyarla(d, ogretmenId, hucreler, !hepsiKapali));
  }

  function satirDegistir(saat: number) {
    const hepsiKapali = durum.ayar.gunler.every((_, g) => kapaliMi(g, saat));
    const hucreler = durum.ayar.gunler.map((_, g) => ({ gun: g, saat }));
    degistir((d) => musaitlikAyarla(d, ogretmenId, hucreler, !hepsiKapali));
  }

  const kapaliSayi = durum.ayar.gunler.reduce(
    (t, _, g) => t + durum.ayar.saatler.filter((__, s) => kapaliMi(g, s)).length,
    0,
  );
  const toplam = durum.ayar.gunler.length * durum.ayar.saatler.length;
  const yuk = durum.dersler
    .filter((x) => x.ogretmenId === secili.id)
    .reduce((t, x) => t + x.haftalikSaat, 0);

  return (
    <div className="govde">
      <div className="panel">
        <h2>Müsait olmayan saatler</h2>
        <p className="ipucu">
          Öğretmenin <b>gelemeyeceği</b> saatlere tıklayın. Basılı tutup sürükleyerek
          birden çok hücre işaretleyebilirsiniz. Gün adına tıklayınca o günün tamamı,
          saat numarasına tıklayınca haftanın o saati değişir.
        </p>

        <div className="satir-form">
          <label>
            Öğretmen{' '}
            <select value={secili.id} onChange={(e) => setSeciliId(e.target.value)}>
              {durum.ogretmenler.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.kisaltma} — {o.ad} ({o.brans})
                </option>
              ))}
            </select>
          </label>
          <button
            className="dugme"
            onClick={() => degistir((d) => musaitlikHepsi(d, ogretmenId, false))}
          >
            Tümünü müsait yap
          </button>
          <button
            className="dugme"
            onClick={() => degistir((d) => musaitlikHepsi(d, ogretmenId, true))}
          >
            Tümünü kapat
          </button>
        </div>

        <p className={toplam - kapaliSayi < yuk ? 'hata-kutu' : 'ipucu'}>
          <b>{secili.kisaltma}</b>: {toplam - kapaliSayi} saat müsait, {yuk} saat ders
          yüklenmiş.
          {toplam - kapaliSayi < yuk && ` ${yuk - (toplam - kapaliSayi)} saat fazla — bu program dizilemez.`}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table
            className="musaitlik"
            onPointerUp={boyamaBitir}
            onPointerLeave={boyamaBitir}
          >
            <thead>
              <tr>
                <th style={{ width: 60 }} />
                {durum.ayar.gunler.map((gun, g) => (
                  <th key={g} onClick={() => sutunDegistir(g)} title="Bütün günü değiştir">
                    {gun.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {durum.ayar.saatler.map((saat, s) => (
                <tr key={s}>
                  <th onClick={() => satirDegistir(s)} title="Haftanın bu saatini değiştir">
                    {saat}
                  </th>
                  {durum.ayar.gunler.map((_, g) => (
                    <td
                      key={g}
                      className={gosterilenKapali(g, s) ? 'kapali' : ''}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        boyamaBaslat(g, s);
                      }}
                      onPointerEnter={() => {
                        if (gecici !== null) boyamaSurdur(g, s);
                      }}
                    >
                      {gosterilenKapali(g, s) ? '×' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
