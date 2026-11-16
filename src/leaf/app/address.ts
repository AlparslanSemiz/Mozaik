// Where the site lives: the old address, the new one, and the one switch
// between them (DECISIONS 2026-11-16).
//
// The values are in `adres.json` beside this file and NOT here, because two
// things that are not TypeScript read them too: `vite.site.config.ts` (the
// site-only probe for the new address) and `site.yml` (the CNAME of the new
// address's own repository). One file, so the address cannot be spelled two
// ways.
//
// What the switch does and does not do. `yeniAdresAcik` moves the address
// this program SHOWS (`SITE_ADRESI`), nothing else. The new address is its
// own Pages site (AlparslanSemiz/mozaik-site) and the old one keeps serving
// the app, so the copy at the old origin, the only page that can read the
// plans kept there, stays reachable (BUILD.md, "Alan adına geçiş"). The move
// is not gated by the switch either: it finds out by itself that the new
// address answers (`vite.site.config.ts`, `yeniAdresYoklamasi`).

import adres from './adres.json' with { type: 'json' };

/** The site as it has been since the rename (pitfall 106). */
export const ESKI_SITE: string = adres.eski;
/** The site's own subdomain: its own origin, so its own localStorage. */
export const YENI_SITE: string = adres.yeni;
export const ESKI_KOKEN: string = new URL(adres.eski).origin;
export const YENI_KOKEN: string = new URL(adres.yeni).origin;
/** The one value Alp flips once DNS and Pages are set (BUILD.md, "Alan adına geçiş"). */
export const YENI_ADRES_ACIK: boolean = adres.yeniAdresAcik;
