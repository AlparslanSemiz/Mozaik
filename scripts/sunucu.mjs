// The local server (task B1).
//
// WHY THIS EXISTS — the measured version, which is not the one I started with.
//
// I began by writing that file:// is not a secure context and therefore
// cannot have the File System Access API. Measured in Chromium, that is
// FALSE: file:// reports isSecureContext true and showDirectoryPicker is
// defined. What file:// actually lacks is a real ORIGIN, and the three
// consequences were measured one by one:
//
//   navigator.serviceWorker.register  ->  TypeError (protocol)
//   navigator.storage.getDirectory    ->  SecurityError
//   location.origin                   ->  "file://", shared by every local
//                                          .html file on the machine
//
// So this server buys a real origin: an offline-capable page (the service
// worker), storage that belongs to this app instead of to every file on the
// disk, and a permission Chrome can keep for one site. Not "the only place
// the folder can work" — the better place for it.
//
// http://dersprogrami.localhost:7654: Chrome resolves *.localhost itself, so
// there is no hosts file to edit and no administrator to ask, and it treats
// the name as trustworthy.
//
// It serves ONE folder, read-only, and it is still principle 2: no backend, no
// database, no account, no session, no API. A static file handler in ~120
// lines with zero dependencies. Its Windows twin is kurulum/sunucu.ps1 — that
// one is what actually runs on my father's machine, because it needs no Node.
//
//   npm run sunucu            # dist-site/
//   node scripts/sunucu.mjs --kok baska/klasor --port 7655

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const PORT = Number(argOf('--port') ?? 7654);
const ROOT = resolve(argOf('--kok') ?? 'dist-site');
const HOST_NAME = 'dersprogrami.localhost';

// Written out rather than taken from a package: a static server that guesses
// content types with a dependency is a dependency for nothing. woff2 is here
// because the font is embedded in the HTML — if this list ever has to grow,
// something else got embedded less well than it should have been.
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function argOf(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

/**
 * Turns a request path into a file inside ROOT, or null.
 *
 * Two refusals, and both of them are the point of the function rather than
 * decoration: anything that climbs out of ROOT after normalisation, and any
 * directory. There is no directory listing here — this server hands over the
 * six files the app is made of and nothing else.
 */
function fileFor(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null; // malformed %-escape
  }
  if (decoded.endsWith('/')) decoded += 'index.html';

  const full = normalize(join(ROOT, decoded));
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;

  try {
    return statSync(full).isFile() ? full : null;
  } catch {
    return null;
  }
}

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' }).end();
    return;
  }

  // Unknown paths fall back to the app itself, so a bookmark that is one
  // level deep still opens something. A "not found" page would be a second
  // page, and this program has one.
  //
  // ...but ONLY for navigations. A request that names a file gets a 404
  // instead, because handing HTML back with a `.js` content type is a lie the
  // browser acts on: on a deep path the page asks for `sw.js` next to itself,
  // the fallback answered with index.html, and Chromium refused it with "The
  // script has an unsupported MIME type ('text/html')". Found by the error
  // trap (e2e/kapan.ts) on a test that had been green for a version.
  const istenen = fileFor(req.url ?? '/');
  const dosyaAdi = /\.[a-z0-9]{1,8}$/i.test((req.url ?? '/').split('?')[0]);
  const file = istenen ?? (dosyaAdi ? null : fileFor('/index.html'));
  if (file === null) {
    res.writeHead(404, { 'content-type': TYPES['.txt'] }).end('Bulunamadı\n');
    return;
  }

  const size = statSync(file).size;
  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    // The service worker keeps its own copy and is the thing that makes the
    // page work offline; letting the browser hold a second, staler copy just
    // means Guncelle.cmd does not appear to have done anything.
    'cache-control': 'no-cache',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}

/**
 * BOTH loopbacks, and this is measured rather than defensive.
 *
 * On this machine `dersprogrami.localhost` resolves to ::1; Chrome maps every
 * *.localhost name to 127.0.0.1 AND ::1 and races them. A server bound to one
 * of the two is found on some machines and — silently, with a browser error
 * page and nothing in any log — not on others.
 */
function listen() {
  const started = [];
  for (const host of ['127.0.0.1', '::1']) {
    const server = createServer(handle);
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} kullanımda. Program zaten açık olabilir.`);
        process.exit(1);
      }
      // A machine with IPv6 switched off cannot bind ::1, and that is fine as
      // long as the other one came up.
      if (host === '::1') return;
      throw err;
    });
    server.listen(PORT, host, () => started.push(host));
  }
  setTimeout(() => {
    if (started.length === 0) {
      console.error('Hiçbir adrese bağlanılamadı.');
      process.exit(1);
    }
    console.log(`Mozaik çalışıyor:  http://${HOST_NAME}:${PORT}`);
    console.log(`Klasör: ${ROOT}`);
    console.log('Kapatmak için bu pencereyi kapatın (Ctrl+C).');
  }, 50);
}

try {
  if (!statSync(ROOT).isDirectory()) throw new Error('klasör değil');
} catch {
  console.error(`Klasör yok: ${ROOT}\nÖnce: npm run build:site`);
  process.exit(1);
}
listen();
