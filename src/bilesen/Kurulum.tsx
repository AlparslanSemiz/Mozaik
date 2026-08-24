// Kurulum: gun/saat duzeni, derslikler, ogretmenler, siniflar, dersler.
//
// Metin kutulari defaultValue + onBlur ile calisir. onChange ile her tus
// vurusunda ust duzeyde state guncellersek odak kayar (docs/PLAN.md tuzak 3).

import { useState } from 'react';
import type { Sonuc } from '../iceaktar';
import {
  dersAyristir,
  derslikAyristir,
  ogretmenAyristir,
  sinifAyristir,
} from '../iceaktar';
import { ornekDurum } from '../ornek';
import type { Durum } from '../tip';
import { RENK_SAYISI } from '../tip';
import {
  VARSAYILAN_GUNLER,
  ayarGuncelle,
  dersEkle,
  dersGuncelle,
  dersSil,
  derslikEkle,
  derslikGuncelle,
  derslikSil,
  ogretmenEkle,
  ogretmenGuncelle,
  ogretmenSil,
  saatAdlari,
  sinifEkle,
  sinifGuncelle,
  sinifSil,
} from '../veri';

interface Props {
  durum: Durum;
  degistir: (uygula: (d: Durum) => Durum) => void;
}

/** Excel'den yapistirma kutusu: onizle, sonra ekle. Asla dogrudan eklemez. */
function Yapistir<T>({
  baslik,
  ornek,
  ayristir,
  satirMetni,
  onEkle,
}: {
  baslik: string;
  ornek: string;
  ayristir: (metin: string) => Sonuc<T>;
  satirMetni: (x: T) => string;
  onEkle: (satirlar: T[]) => void;
}) {
  const [acik, setAcik] = useState(false);
  const [metin, setMetin] = useState('');
  const [sonuc, setSonuc] = useState<Sonuc<T> | null>(null);

  if (!acik) {
    return (
      <button className="dugme" onClick={() => setAcik(true)}>
        Excel'den yapıştır
      </button>
    );
  }

  return (
    <div className="panel" style={{ background: 'var(--zemin)' }}>
      <h3 style={{ marginTop: 0 }}>{baslik}</h3>
      <p className="ipucu">
        Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra:{' '}
        <b>{ornek}</b>
      </p>
      <textarea
        rows={6}
        value={metin}
        onChange={(e) => {
          setMetin(e.target.value);
          setSonuc(null);
        }}
        placeholder="Buraya yapıştırın..."
      />
      <div className="satir-form" style={{ marginTop: 8 }}>
        <button className="dugme" onClick={() => setSonuc(ayristir(metin))}>
          Önizle
        </button>
        <button
          className="dugme"
          onClick={() => {
            setAcik(false);
            setMetin('');
            setSonuc(null);
          }}
        >
          Vazgeç
        </button>
      </div>

      {sonuc !== null && (
        <>
          {sonuc.hata.length > 0 && (
            <div className="uyari-kutu">
              {sonuc.hata.map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          )}
          {sonuc.kabul.length === 0 ? (
            <div className="hata-kutu">Okunabilir satır bulunamadı.</div>
          ) : (
            <>
              <div className="iyi-kutu">
                <b>{sonuc.kabul.length} satır okundu.</b> Aşağıdakiler eklenecek:
              </div>
              <ul style={{ maxHeight: 160, overflow: 'auto', fontSize: 13 }}>
                {sonuc.kabul.map((x, i) => (
                  <li key={i}>{satirMetni(x)}</li>
                ))}
              </ul>
              <button
                className="dugme birincil"
                onClick={() => {
                  onEkle(sonuc.kabul);
                  setAcik(false);
                  setMetin('');
                  setSonuc(null);
                }}
              >
                {sonuc.kabul.length} satırı ekle
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function Kurulum({ durum, degistir }: Props) {
  const [yeniDerslik, setYeniDerslik] = useState('');
  const [yeniOgretmen, setYeniOgretmen] = useState({ ad: '', kisaltma: '', brans: '' });
  const [yeniSinif, setYeniSinif] = useState({ ad: '', derslikId: '' });
  const [yeniDers, setYeniDers] = useState({ sinifId: '', ogretmenId: '', saat: '4', blok: '1' });

  const gunSayisi = durum.ayar.gunler.length;
  const saatSayisi = durum.ayar.saatler.length;

  function duzenGuncelle(gun: number, saat: number, adlar?: string) {
    const gunler = VARSAYILAN_GUNLER.slice(0, Math.min(7, Math.max(1, gun)));
    const temelSaat = Math.min(16, Math.max(1, saat));
    const saatler =
      adlar !== undefined && adlar.trim() !== ''
        ? adlar
            .split(',')
            .map((x) => x.trim())
            .filter((x) => x !== '')
        : saatAdlari(temelSaat);
    degistir((d) => ayarGuncelle(d, gunler, saatler));
  }

  const bosProje = durum.ogretmenler.length === 0 && durum.siniflar.length === 0;

  return (
    <div className="govde">
      {bosProje && (
        <div className="panel">
          <h2>Başlarken</h2>
          <p className="ipucu">
            Aşağıdaki bölümleri sırayla doldurun: önce <b>derslikler</b>, sonra{' '}
            <b>öğretmenler</b> ve <b>sınıflar</b>, en son her sınıfın <b>dersleri</b>.
            Elinizde Excel listesi varsa her bölümdeki “Excel'den yapıştır” düğmesini
            kullanın — tek tek girmekten çok daha hızlı.
          </p>
          <button
            className="dugme"
            onClick={() => {
              if (window.confirm('Aracı denemek için örnek bir okul verisi yüklenecek. Devam edilsin mi?')) {
                degistir(() => ornekDurum());
              }
            }}
          >
            Örnek veriyle doldur (25 öğretmen, 20 sınıf)
          </button>
          <p className="ipucu">
            Ne yaptığını görmek için. Kendi verinizi girmeden önce üstteki{' '}
            <b>Sıfırla</b> ile temizleyin.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------ gun / saat */}
      <div className="panel">
        <h2>Gün ve saat düzeni</h2>
        <p className="ipucu">
          Şu an <b>{gunSayisi} gün × {saatSayisi} saat</b> ({gunSayisi * saatSayisi} slot).
          Sayıyı azaltırsanız dışarıda kalan yerleşmiş dersler silinir.
        </p>
        <div className="satir-form">
          <label>
            Gün sayısı{' '}
            <input
              type="number"
              min={1}
              max={7}
              defaultValue={gunSayisi}
              style={{ width: 70 }}
              onBlur={(e) => duzenGuncelle(Number(e.target.value), saatSayisi)}
            />
          </label>
          <label>
            Günlük saat{' '}
            <input
              type="number"
              min={1}
              max={16}
              defaultValue={saatSayisi}
              style={{ width: 70 }}
              onBlur={(e) => duzenGuncelle(gunSayisi, Number(e.target.value))}
            />
          </label>
          <label style={{ flex: 1, minWidth: 260 }}>
            Saat adları (virgülle, boş bırakılırsa 1, 2, 3…){' '}
            <input
              type="text"
              style={{ width: '100%' }}
              defaultValue={durum.ayar.saatler.join(', ')}
              onBlur={(e) => duzenGuncelle(gunSayisi, saatSayisi, e.target.value)}
              placeholder="09:00-09:45, 09:55-10:40, ..."
            />
          </label>
        </div>
        <p className="ipucu">Günler: {durum.ayar.gunler.join(' · ')}</p>
      </div>

      {/* -------------------------------------------------------- derslik */}
      <div className="panel">
        <h2>Derslikler ({durum.derslikler.length})</h2>
        <p className="ipucu">
          Her sınıfın sabit odası. İki sınıf aynı dersliği paylaşıyorsa aynı saate
          konamazlar. Dersliği olmayan sınıflar için bu kontrol yapılmaz.
        </p>
        <div className="satir-form">
          <input
            type="text"
            value={yeniDerslik}
            placeholder="Derslik adı, örn. A"
            onChange={(e) => setYeniDerslik(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && yeniDerslik.trim() !== '') {
                degistir((d) => derslikEkle(d, yeniDerslik));
                setYeniDerslik('');
              }
            }}
          />
          <button
            className="dugme"
            disabled={yeniDerslik.trim() === ''}
            onClick={() => {
              degistir((d) => derslikEkle(d, yeniDerslik));
              setYeniDerslik('');
            }}
          >
            Ekle
          </button>
          <Yapistir
            baslik="Derslikleri yapıştır"
            ornek="Derslik adı (her satırda bir tane)"
            ayristir={derslikAyristir}
            satirMetni={(x) => x.ad}
            onEkle={(satirlar) =>
              degistir((d) => satirlar.reduce((acc, x) => derslikEkle(acc, x.ad), d))
            }
          />
        </div>

        {durum.derslikler.length > 0 && (
          <table className="liste">
            <thead>
              <tr>
                <th>Ad</th>
                <th style={{ width: 120 }}>Sınıf sayısı</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {durum.derslikler.map((k) => (
                <tr key={k.id}>
                  <td>
                    <input
                      type="text"
                      defaultValue={k.ad}
                      onBlur={(e) => degistir((d) => derslikGuncelle(d, k.id, e.target.value))}
                    />
                  </td>
                  <td>{durum.siniflar.filter((s) => s.derslikId === k.id).length}</td>
                  <td>
                    <button
                      className="dugme tehlike"
                      onClick={() => degistir((d) => derslikSil(d, k.id))}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------------------------------------------------- ogretmen */}
      <div className="panel">
        <h2>Öğretmenler ({durum.ogretmenler.length})</h2>
        <p className="ipucu">
          Her öğretmenin tek branşı vardır. Kısaltma ızgarada satır başlığı olarak
          görünür, kısa tutun (örn. MÇ). Renk otomatik atanır.
        </p>
        <div className="satir-form">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={yeniOgretmen.ad}
            onChange={(e) => setYeniOgretmen({ ...yeniOgretmen, ad: e.target.value })}
          />
          <input
            type="text"
            placeholder="Kısaltma"
            style={{ width: 90 }}
            value={yeniOgretmen.kisaltma}
            onChange={(e) => setYeniOgretmen({ ...yeniOgretmen, kisaltma: e.target.value })}
          />
          <input
            type="text"
            placeholder="Branş"
            value={yeniOgretmen.brans}
            onChange={(e) => setYeniOgretmen({ ...yeniOgretmen, brans: e.target.value })}
          />
          <button
            className="dugme"
            disabled={yeniOgretmen.ad.trim() === ''}
            onClick={() => {
              degistir((d) => ogretmenEkle(d, yeniOgretmen));
              setYeniOgretmen({ ad: '', kisaltma: '', brans: '' });
            }}
          >
            Ekle
          </button>
          <Yapistir
            baslik="Öğretmenleri yapıştır"
            ornek="Ad Soyad · Kısaltma · Branş"
            ayristir={ogretmenAyristir}
            satirMetni={(x) => `${x.ad} (${x.kisaltma}) — ${x.brans}`}
            onEkle={(satirlar) =>
              degistir((d) => satirlar.reduce((acc, x) => ogretmenEkle(acc, x), d))
            }
          />
        </div>

        {durum.ogretmenler.length > 0 && (
          <table className="liste">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Renk</th>
                <th>Ad</th>
                <th style={{ width: 110 }}>Kısaltma</th>
                <th>Branş</th>
                <th style={{ width: 90 }}>Ders saati</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {durum.ogretmenler.map((o) => (
                <tr key={o.id}>
                  <td>
                    <select
                      value={o.renk}
                      onChange={(e) =>
                        degistir((d) => ogretmenGuncelle(d, o.id, { renk: Number(e.target.value) }))
                      }
                      style={{ background: `var(--renk-${o.renk})`, width: 44 }}
                      title="Renk"
                    >
                      {Array.from({ length: RENK_SAYISI }, (_, i) => (
                        <option key={i} value={i}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={o.ad}
                      onBlur={(e) =>
                        degistir((d) => ogretmenGuncelle(d, o.id, { ad: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: 90 }}
                      defaultValue={o.kisaltma}
                      onBlur={(e) =>
                        degistir((d) =>
                          ogretmenGuncelle(d, o.id, { kisaltma: e.target.value.trim() }),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={o.brans}
                      onBlur={(e) =>
                        degistir((d) => ogretmenGuncelle(d, o.id, { brans: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    {durum.dersler
                      .filter((x) => x.ogretmenId === o.id)
                      .reduce((t, x) => t + x.haftalikSaat, 0)}
                  </td>
                  <td>
                    <button
                      className="dugme tehlike"
                      onClick={() => {
                        const n = durum.dersler.filter((x) => x.ogretmenId === o.id).length;
                        if (
                          n > 0 &&
                          !window.confirm(
                            `${o.ad} silinince ${n} dersi ve programdaki yerleşimleri de silinecek. Devam edilsin mi?`,
                          )
                        ) {
                          return;
                        }
                        degistir((d) => ogretmenSil(d, o.id));
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------------------------------------------------- sinif */}
      <div className="panel">
        <h2>Sınıflar ({durum.siniflar.length})</h2>
        <div className="satir-form">
          <input
            type="text"
            placeholder="Sınıf adı, örn. 510"
            value={yeniSinif.ad}
            onChange={(e) => setYeniSinif({ ...yeniSinif, ad: e.target.value })}
          />
          <select
            value={yeniSinif.derslikId}
            onChange={(e) => setYeniSinif({ ...yeniSinif, derslikId: e.target.value })}
          >
            <option value="">Derslik yok</option>
            {durum.derslikler.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
          <button
            className="dugme"
            disabled={yeniSinif.ad.trim() === ''}
            onClick={() => {
              degistir((d) => sinifEkle(d, yeniSinif.ad, yeniSinif.derslikId || null));
              setYeniSinif({ ad: '', derslikId: yeniSinif.derslikId });
            }}
          >
            Ekle
          </button>
          <Yapistir
            baslik="Sınıfları yapıştır"
            ornek="Sınıf adı · Derslik adı"
            ayristir={sinifAyristir}
            satirMetni={(x) => `${x.ad}${x.derslikAd ? ` → ${x.derslikAd} dersliği` : ''}`}
            onEkle={(satirlar) =>
              degistir((d) =>
                satirlar.reduce((acc, x) => {
                  const derslik = acc.derslikler.find(
                    (k) => k.ad.toLocaleLowerCase('tr') === x.derslikAd.toLocaleLowerCase('tr'),
                  );
                  // Derslik adi tanınmadıysa sessizce olusturulur; yoksa sinif
                  // derslikssiz kalir ve cakisma kontrolu yapilamaz.
                  if (x.derslikAd !== '' && derslik === undefined) {
                    const eklenmis = derslikEkle(acc, x.derslikAd);
                    const yeni = eklenmis.derslikler[eklenmis.derslikler.length - 1];
                    return sinifEkle(eklenmis, x.ad, yeni?.id ?? null);
                  }
                  return sinifEkle(acc, x.ad, derslik?.id ?? null);
                }, d),
              )
            }
          />
        </div>

        {durum.siniflar.length > 0 && (
          <table className="liste">
            <thead>
              <tr>
                <th>Ad</th>
                <th style={{ width: 160 }}>Derslik</th>
                <th style={{ width: 90 }}>Ders saati</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {durum.siniflar.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="text"
                      defaultValue={s.ad}
                      onBlur={(e) =>
                        degistir((d) => sinifGuncelle(d, s.id, { ad: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={s.derslikId ?? ''}
                      onChange={(e) =>
                        degistir((d) =>
                          sinifGuncelle(d, s.id, { derslikId: e.target.value || null }),
                        )
                      }
                    >
                      <option value="">Derslik yok</option>
                      {durum.derslikler.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.ad}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {durum.dersler
                      .filter((x) => x.sinifId === s.id)
                      .reduce((t, x) => t + x.haftalikSaat, 0)}
                    {' / '}
                    {gunSayisi * saatSayisi}
                  </td>
                  <td>
                    <button
                      className="dugme tehlike"
                      onClick={() => {
                        const n = durum.dersler.filter((x) => x.sinifId === s.id).length;
                        if (
                          n > 0 &&
                          !window.confirm(
                            `${s.ad} sınıfı silinince ${n} dersi ve programdaki yerleşimleri de silinecek. Devam edilsin mi?`,
                          )
                        ) {
                          return;
                        }
                        degistir((d) => sinifSil(d, s.id));
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ----------------------------------------------------------- ders */}
      <div className="panel">
        <h2>Dersler ({durum.dersler.length})</h2>
        <p className="ipucu">
          Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. <b>Blok</b>,
          o dersin arka arkaya kaç saat işleneceğidir (1, 2 veya 3).
        </p>

        {(durum.siniflar.length === 0 || durum.ogretmenler.length === 0) && (
          <div className="uyari-kutu">
            Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.
          </div>
        )}

        <div className="satir-form">
          <select
            value={yeniDers.sinifId}
            onChange={(e) => setYeniDers({ ...yeniDers, sinifId: e.target.value })}
          >
            <option value="">Sınıf seçin</option>
            {durum.siniflar.map((s) => (
              <option key={s.id} value={s.id}>
                {s.ad}
              </option>
            ))}
          </select>
          <select
            value={yeniDers.ogretmenId}
            onChange={(e) => setYeniDers({ ...yeniDers, ogretmenId: e.target.value })}
          >
            <option value="">Öğretmen seçin</option>
            {durum.ogretmenler.map((o) => (
              <option key={o.id} value={o.id}>
                {o.kisaltma} — {o.brans}
              </option>
            ))}
          </select>
          <label>
            Haftalık saat{' '}
            <input
              type="number"
              min={1}
              max={40}
              style={{ width: 70 }}
              value={yeniDers.saat}
              onChange={(e) => setYeniDers({ ...yeniDers, saat: e.target.value })}
            />
          </label>
          <label>
            Blok{' '}
            <select
              value={yeniDers.blok}
              onChange={(e) => setYeniDers({ ...yeniDers, blok: e.target.value })}
            >
              <option value="1">1 saat</option>
              <option value="2">2 saat</option>
              <option value="3">3 saat</option>
            </select>
          </label>
          <button
            className="dugme"
            disabled={yeniDers.sinifId === '' || yeniDers.ogretmenId === ''}
            onClick={() => {
              degistir((d) =>
                dersEkle(d, {
                  sinifId: yeniDers.sinifId,
                  ogretmenId: yeniDers.ogretmenId,
                  haftalikSaat: Number(yeniDers.saat) || 1,
                  blok: Number(yeniDers.blok) || 1,
                }),
              );
              setYeniDers({ ...yeniDers, sinifId: '' });
            }}
          >
            Ekle
          </button>
          <Yapistir
            baslik="Dersleri yapıştır"
            ornek="Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok"
            ayristir={dersAyristir}
            satirMetni={(x) =>
              `${x.sinifAd} — ${x.ogretmen}: ${x.haftalikSaat} saat, ${x.blok}'li blok`
            }
            onEkle={(satirlar) =>
              degistir((d) => {
                let sonuc = d;
                const bulunamadi: string[] = [];
                for (const x of satirlar) {
                  const sinif = sonuc.siniflar.find(
                    (s) => s.ad.toLocaleLowerCase('tr') === x.sinifAd.toLocaleLowerCase('tr'),
                  );
                  const ogretmen = sonuc.ogretmenler.find(
                    (o) =>
                      o.kisaltma.toLocaleLowerCase('tr') === x.ogretmen.toLocaleLowerCase('tr') ||
                      o.ad.toLocaleLowerCase('tr') === x.ogretmen.toLocaleLowerCase('tr'),
                  );
                  if (sinif === undefined || ogretmen === undefined) {
                    bulunamadi.push(`${x.sinifAd} / ${x.ogretmen}`);
                    continue;
                  }
                  sonuc = dersEkle(sonuc, {
                    sinifId: sinif.id,
                    ogretmenId: ogretmen.id,
                    haftalikSaat: x.haftalikSaat,
                    blok: x.blok,
                  });
                }
                if (bulunamadi.length > 0) {
                  window.alert(
                    `Şu satırlar eklenemedi çünkü sınıf veya öğretmen bulunamadı:\n\n${bulunamadi.join('\n')}\n\nÖnce onları ekleyip tekrar deneyin.`,
                  );
                }
                return sonuc;
              })
            }
          />
        </div>

        {durum.dersler.length > 0 && (
          <table className="liste">
            <thead>
              <tr>
                <th>Sınıf</th>
                <th>Öğretmen</th>
                <th style={{ width: 110 }}>Haftalık saat</th>
                <th style={{ width: 110 }}>Blok</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {durum.dersler.map((x) => {
                const sinif = durum.siniflar.find((s) => s.id === x.sinifId);
                const ogretmen = durum.ogretmenler.find((o) => o.id === x.ogretmenId);
                return (
                  <tr key={x.id}>
                    <td>{sinif?.ad ?? '?'}</td>
                    <td>
                      <span
                        className="renk-benek"
                        style={{ background: `var(--renk-${ogretmen?.renk ?? 0})` }}
                      />{' '}
                      {ogretmen?.kisaltma ?? '?'} — {ogretmen?.brans ?? ''}
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        style={{ width: 70 }}
                        defaultValue={x.haftalikSaat}
                        onBlur={(e) =>
                          degistir((d) =>
                            dersGuncelle(d, x.id, {
                              haftalikSaat: Math.max(1, Number(e.target.value) || 1),
                            }),
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={x.blok}
                        onChange={(e) =>
                          degistir((d) => dersGuncelle(d, x.id, { blok: Number(e.target.value) }))
                        }
                        title="Blok değiştirilirse bu dersin programdaki yerleşimleri kalkar"
                      >
                        <option value={1}>1 saat</option>
                        <option value={2}>2 saat</option>
                        <option value={3}>3 saat</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="dugme tehlike"
                        onClick={() => degistir((d) => dersSil(d, x.id))}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
