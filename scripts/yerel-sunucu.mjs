// A local release server for the Windows update gates (scripts/guncelleme-220.mjs,
// scripts/kurulum-gecisi.mjs), on a thread of its own.
//
// WHY A THREAD. The gates press buttons through `uiaBas`, which is
// `execFileSync`: while it waits for a button, the main thread's event loop is
// blocked, and a server living on it answers nothing. The program under test
// asks for the manifest exactly then, and gave up after 20 s with "İnternet
// yanıt vermedi" (guncelleme-windows.yml, run 43773671020). A worker thread has
// its own event loop and keeps answering.
//
// The paths are fixed at start: `json` is served as JSON, `dosya` as the bytes
// of a file. A path may carry a second answer (`json2`) served once the main
// thread calls `ikinci()`. Every request is counted per path in shared memory,
// so the main thread can read the counts without its event loop.

import { readFileSync } from 'node:fs';
import { createServer as http } from 'node:http';
import { createServer as https } from 'node:https';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

/**
 * @param {{ port: number, host?: string, pfx?: string, parola?: string,
 *   yollar: Record<string, { json?: unknown, json2?: unknown, dosya?: string }> }} ayar
 */
export async function sunucuBaslat(ayar) {
  const adlar = Object.keys(ayar.yollar);
  // [0] second answers on, [1..] request count per path.
  const ortak = new Int32Array(new SharedArrayBuffer(4 * (adlar.length + 1)));
  const isci = new Worker(new URL(import.meta.url), { workerData: { ayar, adlar, ortak } });
  await new Promise((tamam, hata) => {
    isci.once('message', tamam);
    isci.once('error', hata);
  });
  return {
    /** How many times `yol` has been asked for. */
    sayi: (yol) => Atomics.load(ortak, adlar.indexOf(yol) + 1),
    ikinci: () => Atomics.store(ortak, 0, 1),
    kapat: () => isci.terminate(),
  };
}

if (!isMainThread) {
  const { ayar, adlar, ortak } = workerData;
  const baytlar = new Map(
    adlar.filter((y) => ayar.yollar[y].dosya).map((y) => [y, readFileSync(ayar.yollar[y].dosya)]),
  );
  const cevapla = (istek, cevap) => {
    const i = adlar.indexOf(istek.url);
    console.log(`istek: ${istek.method} ${istek.url}${i < 0 ? ' (404)' : ''}`);
    if (i < 0) {
      cevap.writeHead(404);
      cevap.end();
      return;
    }
    Atomics.add(ortak, i + 1, 1);
    const yol = ayar.yollar[istek.url];
    if (baytlar.has(istek.url)) {
      cevap.writeHead(200, { 'content-type': 'application/octet-stream' });
      cevap.end(baytlar.get(istek.url));
      return;
    }
    const json = Atomics.load(ortak, 0) === 1 && yol.json2 !== undefined ? yol.json2 : yol.json;
    cevap.writeHead(200, { 'content-type': 'application/json' });
    cevap.end(JSON.stringify(json));
  };
  const sunucu = ayar.pfx
    ? https({ pfx: readFileSync(ayar.pfx), passphrase: ayar.parola }, cevapla)
    : http(cevapla);
  sunucu.on('tlsClientError', (e) => console.log(`TLS: ${e.message}`));
  sunucu.listen(ayar.port, ayar.host ?? '127.0.0.1', () => parentPort.postMessage('hazir'));
}
