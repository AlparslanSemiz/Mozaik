// Where the site lives: the old address, the new one, and the one switch
// between them (DECISIONS 2026-11-16).
//
// The values are in `adres.json` beside this file and NOT here, because two
// things that are not TypeScript read them too: `vite.site.config.ts` (the
// site-only probe for the new address) and `site.yml` (the CNAME file Pages
// gets once the switch is on). One file, so the address cannot be spelled
// two ways.
//
// What the switch does and does not do. `yeniAdresAcik` moves the address
// this program SHOWS (`SITE_ADRESI`) and makes the deploy carry a CNAME. It
// does NOT gate the move of the plans: a copy at the old address cannot be
// updated once Pages redirects that address (its service worker's update
// check gets a redirect and fails), so the code that moves the plans has to
// be in every build from before the switch and has to find out by itself that
// the new address answers (`vite.site.config.ts`, `yeniAdresYoklamasi`).

import adres from './adres.json' with { type: 'json' };

/** The site as it has been since the rename (pitfall 106). */
export const ESKI_SITE: string = adres.eski;
/** The site's own subdomain: its own origin, so its own localStorage. */
export const YENI_SITE: string = adres.yeni;
export const ESKI_KOKEN: string = new URL(adres.eski).origin;
export const YENI_KOKEN: string = new URL(adres.yeni).origin;
/** The one value Alp flips once DNS and Pages are set (BUILD.md, "Alan adına geçiş"). */
export const YENI_ADRES_ACIK: boolean = adres.yeniAdresAcik;
