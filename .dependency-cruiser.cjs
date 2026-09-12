// The layer boundary, as a rule the build can read.
//
// ARCHITECTURE.md describes three layers and the import rules that follow
// from them, and until now that description was prose: a violation showed up
// only when somebody noticed it. Pitfall 77 in one line — a rule written as
// prose is a wish until a test measures it.
//
// Two things are measured here today, and both are about the runtime graph
// rather than the type graph. `tsPreCompilationDeps` is left off on purpose:
// `import type` disappears at build time, and one of this repository's three
// anti-cycle patterns IS `import type` (ARCHITECTURE.md, "Import döngüleri
// nasıl önleniyor"). So a cycle reported here is a cycle the browser would
// actually walk, and the day somebody turns an `import type` into a plain
// import, this file goes red while `tsc` stays green.
//
// The layer rules themselves arrive with the folders they name. Writing them
// before the move would be writing a rule that matches nothing.
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
      name: 'not-to-unresolvable',
      comment: 'Var olmayan bir modüle import. Taşıma turunun ilk yakalayacağı şey.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)node_modules/' },
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
    },
  },
};
