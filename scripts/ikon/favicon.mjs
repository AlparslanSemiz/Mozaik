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
//   node scripts/ikon/favicon.mjs
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
//
// THE SOURCE-TEMPLATE WARNING IS PART OF THIS TEMPLATE, and it was not: it had
// been written into index.html by hand, so running this script deleted it
// without a word — the recipe and its output had drifted apart (pitfall 69's
// shape). `temel.spec.ts` 77 measures that warning, so it would have come back
// red; but a script that silently removes what a test is about to ask for is a
// trap of its own.
const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mozaik</title>
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
    <!--
      KAYNAK ŞABLONU UYARISI. Bu dosya programın kendisi değil: Vite'ın
      şablonu. Çift tıklanınca yukarıdaki modül \`file://\` altında CORS'a
      takılır ve geriye BOMBOŞ BEYAZ bir sayfa kalır — hata yok, ipucu yok,
      "açılmıyor" diye okunan tam olarak bu.

      Derlenmiş dosyada bu betik hiçbir şey YAPAMAZ ve bu bir umut değil,
      bir ölçüm: vite-plugin-singlefile \`src\`'yi kaldırıp kodu gömüyor,
      yani \`script[type="module"][src]\` orada null döner. İkisi de
      e2e/temel.spec.ts'te ölçülüyor (bölüm 77).
    -->
    <script>
      if (location.protocol === 'file:' && document.querySelector('script[type="module"][src]')) {
        document.getElementById('root').innerHTML =
          '<div style="max-width:42rem;margin:10vh auto;padding:0 1.5rem;color:#1a1c22;font:16px/1.6 system-ui,Segoe UI,sans-serif">' +
          '<h1 style="font-size:1.7rem;line-height:1.25;margin:0 0 1rem">Bu dosya programın kendisi değil</h1>' +
          '<p style="margin:0 0 1rem">Çift tıkladığınız dosya programın <b>kaynak şablonu</b>; tek başına açılmaz. Programın tamamı tek bir dosyada duruyor:</p>' +
          '<p style="margin:0 0 1.5rem;padding:.75rem 1rem;background:#eef1f7;border-radius:.5rem;font-family:ui-monospace,Consolas,monospace"><b>dist/index.html</b></p>' +
          '<p style="margin:0 0 1rem">O dosya yoksa ya da eskiyse, bu klasörde bir kez:<br><code style="font-family:ui-monospace,Consolas,monospace">npm run build</code></p>' +
          '<hr style="border:0;border-top:1px solid #ccd2e0;margin:1.5rem 0">' +
          '<p style="margin:0">Kurulum (<code style="font-family:ui-monospace,Consolas,monospace">Kur.cmd</code>) için: <code style="font-family:ui-monospace,Consolas,monospace">npm run paket</code> çalıştırın, sonra <b>dist-kurulum/Kur.cmd</b>. Depodaki <b>kurulum/Kur.cmd</b> yalnızca kaynaktır, kurmaz.</p>' +
          '</div>';
      }
    </script>
    </body>
</html>
`;
writeFileSync('index.html', html);
console.log('index.html:', html.length, 'bayt · data URI:', uri.length, 'bayt');
