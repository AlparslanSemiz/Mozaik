// The layer boundary, as a rule the build can read.
//
// ARCHITECTURE.md describes three layers and the import rules that follow
// from them, and until now that description was prose: a violation showed up
// only when somebody noticed it. Pitfall 77 in one line — a rule written as
// prose is a wish until a test measures it.
//
// Three things are measured here today, all of them on the runtime graph
// rather than the type graph. `tsPreCompilationDeps` is left off on purpose:
// `import type` disappears at build time, and one of this repository's three
// anti-cycle patterns IS `import type` (ARCHITECTURE.md, "Import döngüleri
// nasıl önleniyor"). So a cycle reported here is a cycle the browser would
// actually walk, and the day somebody turns an `import type` into a plain
// import, this file goes red while `tsc` stays green.
//
// A rule that is NOT here, and the reason is a measurement rather than a
// choice: "leaf and pure never import React". It was written, and it reported
// `pure/entities.ts` → `react/jsx-runtime`. That dependency does not exist —
// the default parser reads the generic arrow function on entities.ts's line
// 852 (`const move = <T>(source) => …`) as JSX and invents the import. Proven
// with a two line file: `export const kimlik = <T>(x: T) => x` gets the same
// phantom dependency, `export function kimlik<T>` does not. Switching to the
// `tsc` parser removes the phantom but drags every `import type` back into the
// graph, which would turn the cycle gate above into a gate on the type graph
// and cost the thing it is actually for. So the rule came out. What it was
// trying to protect is still measured, just not here: the pure layer's tests
// run without a browser, and that is the assertion.
//
// The layer rules name the folders `src/leaf`, `src/pure`, `src/platform` and
// `src/ui`, and dependency flows one way only: down. They were written AFTER
// the move, with the folders in place, and they were green the day they were
// written — a gate that starts red stops being a gate.
//
// The package rules came the same way. A folder under a layer (`leaf/lang`,
// `ui/lists`, `ui/setup`) is a package, and from outside it you go in through
// its `index` only. The draft was run before the move and reported seven
// imports (Root's four dictionaries, names.ts's abbreviations, lessons
// reaching into setup's Paste and Summary); the rules went in after T1 and T2
// had taken all seven away. They are two because `paket-ici-alan` names the
// importer's own package with a capture group, and a file at a layer's root
// (or at src's root) has no package to capture.
//
// `no-orphans` was written, run and taken out again. It reported exactly one
// module, `components/props.ts`, and that module is not an orphan: it holds
// two interfaces and every one of its twelve importers takes them with
// `import type`, so it is invisible in a runtime graph BY DESIGN. A rule whose
// only output is a false positive gets removed rather than exempted, and
// unused files already have an owner here: knip.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Çalışma zamanında import döngüsü yok, ve bunu üç desen sağlıyor: ortak ihtiyacın ' +
        'bir yaprağa inmesi, yalnız tip alınması, ve library ile bundle\'ın State yerine ham ' +
        'string taşıması. Üçü de ARCHITECTURE.md\'de yazılı, hiçbiri ölçülmüyordu.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'katman-yaprak',
      comment:
        'Yaprak yalnız yaprak import eder. Bir yaprağın üstündeki bir modülü çağırması, ' +
        'altında duran her şeyi o modüle bağlar: `i18n.ts` → `preference.ts` tam bu yüzden ' +
        '`preference.ts`\'yi yaprak yaptı, taşımadan önce ölçüldü.',
      severity: 'error',
      from: { path: '^src/leaf/', pathNot: '\\.test\\.' },
      to: { path: '^src/(pure|platform|ui)/' },
    },
    {
      name: 'katman-saf',
      comment:
        'Saf mantık kendisinin ve yaprakların dışına çıkmaz. Depoyu, tarayıcıyı ya da bir ' +
        'bileşeni çağıran bir kural, sürüklerken başka otomatik dizerken başka anlama gelmeye ' +
        'başlar (ARCHITECTURE, "Saf mantık").',
      severity: 'error',
      from: { path: '^src/pure/', pathNot: '\\.test\\.' },
      to: { path: '^src/(platform|ui)/' },
    },
    {
      name: 'katman-tesisat',
      comment: 'Durum ve tesisat bir bileşeni import etmez: çizen taraf çağıran taraftır.',
      severity: 'error',
      from: { path: '^src/platform/', pathNot: '\\.test\\.' },
      to: { path: '^src/ui/' },
    },
    {
      name: 'paket-ici-alan',
      comment:
        'Bir paketin, yani bir katmanın altındaki klasörün (`leaf/lang`, `ui/lists`, ' +
        '`ui/setup`), içine başka bir paketten yalnız `index` üstünden girilir. Paketin kendi ' +
        'dosyaları birbirini serbestçe çağırır. Paketin dışa açtığı şey böylece tek bir ' +
        'dosyada okunur, içi o dosyaya dokunmadan değişebilir.',
      severity: 'error',
      from: { path: '^src/([^/]+/[^/]+)/', pathNot: '\\.test\\.' },
      to: { path: '^src/[^/]+/[^/]+/', pathNot: ['^src/$1/', '/index\\.tsx?$'] },
    },
    {
      name: 'paket-ici-kok',
      comment:
        'Bir katmanın kökündeki (`ui/Root.tsx`, `leaf/names.ts`) ya da `src/`\'nin kökündeki ' +
        'bir dosya da bir paketin içine yalnız `index` üstünden girer. `paket-ici-alan`\'dan ' +
        'ayrı, çünkü onun `from`\'u çağıranın paketini yakalıyor ve kökteki dosyanın paketi yok.',
      severity: 'error',
      from: { path: ['^src/[^/]+\\.tsx?$', '^src/[^/]+/[^/]+\\.tsx?$'], pathNot: '\\.test\\.' },
      to: { path: '^src/[^/]+/[^/]+/', pathNot: '/index\\.tsx?$' },
    },
    {
      name: 'dunya-ureteci-urunde-yok',
      comment:
        '`worlds.ts` yalnız testler için ve `src/` altında durmasının sebebi `tsconfig`. ' +
        'Uygulama onu import etmediği için Vite buduyor ve `dist/index.html`\'e girmiyor ' +
        '(ARCHITECTURE). Bir gün biri onu üründen çağırırsa demet büyür ve kimse görmez.',
      severity: 'error',
      from: { path: '^src/', pathNot: '\\.test\\.' },
      to: { path: '^src/worlds\\.ts$' },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'Var olmayan bir modüle import. Taşıma turunun ilk yakalayacağı şey.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
    },
  },
};
