// index.html'in gömülü favicon'unu site/icon-small.svg'den yeniden üretir.
//
// The mark lives in two places — the .svg and a data: URI inside index.html —
// and e2e/temel.spec.ts checks they draw the same rectangles. This script is
// the other half of that arrangement: when the .svg changes, run this rather
// than editing the URI by hand.
//
// The SMALL variant is the source, not site/icon.svg: a tab icon is always
// rendered at 16-32 px, and the detailed mark was measured and looked at at
// that size — its six columns merge into a smear.
//
//   node scripts/favicon.mjs
import { readFileSync, writeFileSync } from 'node:fs';

let s = readFileSync('site/icon-small.svg', 'utf8');
s = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<title>[\s\S]*?<\/title>/g, '');
s = s.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
s = s.replace(/ (role|aria-label)="[^"]*"/g, '').replace(/#ffffff/g, '#fff');

const uri =
  'data:image/svg+xml,' +
  s.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23').replace(/ /g, '%20');

// The comment is deliberately three lines: an HTML comment is the one kind of
// comment this project SHIPS — JS and CSS are minified, this is not — and the
// reasoning belongs in CLAUDE.md, not in my father's copy of the file.
const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ders Programı</title>
    <!-- Gömülü işaret (B3b). Kaynağı site/icon-small.svg — bir sekme
         simgesi HER ZAMAN küçüktür ve ayrıntılı işaret 16 px'te
         okunmuyor (ölçüldü). Ayrışmasını e2e/temel.spec.ts yakalar.
         data: URI, çünkü bu dosya kendi dışından hiçbir şey istemez
         (ilke 3, tuzak 32). -->
    <link rel="icon" href="${uri}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
writeFileSync('index.html', html);
console.log('index.html:', html.length, 'bayt · data URI:', uri.length, 'bayt');
