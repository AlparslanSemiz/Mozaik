// The SEVEN section colours, searched instead of chosen.
//
//   node scripts/bolum-renk.mjs            -> the seven, both themes, measured
//   node scripts/bolum-renk.mjs --tur 40   -> more annealing rounds
//
// Why this file exists at all (pitfall 69): `--sec-setup` ... `--sec-settings`
// are twelve hex literals in styles.css, and until now the reasoning behind
// them lived in a CSS comment. A comment cannot be re-run. When the seventh tab
// arrived the wheel had to be swept again by hand, and the sweep only moved
// HUE — all seven sat in one lightness band (L* 27-44 light), which is why five
// of them read as one purple. Lightness was never searched because nothing was
// searching.
//
// What it searches: (hue, L*, C*) per section, both themes AT ONCE, maximising
// the smallest pairwise dE76 in whichever theme is worse. One hue per section,
// because a section's identity may not change when the lamp does.
//
// The constraints are the ones docs/STATUS.md already wrote down, not new ones:
//   * contrast 5.0-13.5 against its own ground (--chrome)
//   * --on-accent on the filled tab >= 4.5   (the label has to be readable)
//   * dE >= 36 from --ok / --warn / --bad    (never mistaken for a status)
//
// dE76 and not dE2000 on purpose: every number already in STATUS.md and in
// e2e/renk.spec.ts is dE76, and a floor that cannot be compared to the floor it
// replaces is not a measurement.

const TURN = Number(process.argv[process.argv.indexOf('--tur') + 1]) || 24;

/* ---------------------------------------------------------------- colour */

const srgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const linear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  const h = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** D65, the space getComputedStyle reports in and the one the suite parses. */
function rgbToLab([r, g, b]) {
  const R = linear(r / 255), G = linear(g / 255), B = linear(b / 255);
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const y = (0.2126729 * R + 0.7151522 * G + 0.0721750 * B) / 1.0;
  const z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToRgb([L, a, bb]) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - bb / 200;
  const inv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) * 27 / 24389);
  const x = inv(fx) * 0.95047, y = inv(fy), z = inv(fz) * 1.08883;
  const R = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const G = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const B = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  return [R, G, B].map((c) => srgb(c) * 255);
}

/** In gamut and round-trips: a colour that clips is a different colour. */
function lchToHex(L, C, h) {
  const rad = (h * Math.PI) / 180;
  const rgb = labToRgb([L, C * Math.cos(rad), C * Math.sin(rad)]);
  if (rgb.some((c) => c < -0.5 || c > 255.5)) return null;
  return rgbToHex(rgb.map((c) => Math.min(255, Math.max(0, c))));
}

const dE = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

function lum([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => linear(c / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(a, b) {
  const x = lum(hexToRgb(a)), y = lum(hexToRgb(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ------------------------------------------------------------ the themes */

const THEMES = {
  acik: {
    ground: '#f3f6fb',          // --chrome
    ink: '#ffffff',             // --on-accent on the filled tab
    functional: ['#177431', '#8a6100', '#b0201c'],
    L: [26, 48],
  },
  koyu: {
    ground: '#0c1015',
    ink: '#070d25',
    functional: ['#74e79f', '#f3cf6d', '#ff9089'],
    L: [55, 75],
  },
};

const CONTRAST = [5.0, 13.5];
const INK_MIN = 4.5;
const FUNCTIONAL_MIN = 36;

/**
 * dE alone does NOT keep a section colour from reading as a status, and the
 * first run of this script proved it: at dE 36 from `--bad` it happily handed
 * Program a bright red (#ff291e) in the dark theme. Lab distance counts
 * lightness, so a red far enough away in L* is still a RED, and "kırmızı =
 * engel" is the loudest contract this program has.
 *
 * So the warm-and-green arc is excluded by HUE, which is what the 2026-08-26
 * sweep had concluded in prose. Measured Lab hue angles of the functional six:
 *
 *   --bad  36 (açık) · 28 (koyu)      --warn 80 · 89      --ok 145 · 152
 *
 * With a 25 degree margin either side the closed arc is 3..177, and what is
 * left for the sections is 177..363. The old seven only used 224..359 of it,
 * so the turquoise end below Program was free the whole time.
 */
const HUE_OPEN = [177, 363];

/** No pastel in the dark theme: a washed-out tab is not an identity. */
const DARK_C_MIN = 28;

/**
 * A HUE GAP, and it is a hard constraint rather than part of the score.
 *
 * The second run of this script scored dE 40.2 and handed back Kontrol at hue
 * 325 and Yazdır at 328 — the same magenta, one of them darker. dE76 counts
 * lightness, so "same colour, dimmer" earns a high number while the eye reads
 * one colour. The complaint that started this round was literally "renkler çok
 * benzer", and hue is what that sentence is about.
 *
 * Seven colours in the 186 degree open arc allow 31 degrees between neighbours
 * at perfect spacing; 24 leaves the annealer room to trade a little spacing for
 * a lot of dE. Lightness is still free — it just cannot be the ONLY difference.
 */
const HUE_GAP = 26;

/**
 * ONE of the seven is deliberately quiet, and it does not spend hue.
 *
 * Ayarlar has been near-neutral since it had a colour at all (C* 13 today), and
 * that is a decision, not an accident: a settings tab that shouts gets clicked
 * by mistake. But a near-neutral colour has no hue to speak of, so making it
 * claim 26 degrees of a 186 degree arc robs the six that DO carry an identity.
 *
 * It is also where today's worst pair comes from — Program's low-chroma
 * turquoise against Ayarlar's slate, dE 20.5. The fix is not to shout: it is to
 * let the six be properly saturated so the quiet one is quiet BY CONTRAST.
 */
const QUIET = 6;              // the last slot
const QUIET_C_MAX = 20;

/**
 * The quiet one is quiet in LIGHTNESS too, and the first run that had a quiet
 * slot at all got this wrong: it came back with #bfb6ba in the dark theme, a
 * pale grey BRIGHTER than five of the six identities beside it. A tab that is
 * the lightest thing on the strip is not quiet, whatever its chroma says.
 */
const QUIET_L = { acik: [26, 40], koyu: [56, 68] };

/**
 * Every legal colour, indexed by hue then lightness, most saturated first.
 * Chroma is not annealed: at a fixed (h, L) more chroma is always further from
 * its neighbours, so the search only has to know where the legal ceiling is.
 */
function legalGrid(theme) {
  const t = THEMES[theme];
  const bad = t.functional.map((h) => rgbToLab(hexToRgb(h)));
  const grid = new Map();
  for (let hh = HUE_OPEN[0]; hh < HUE_OPEN[1]; hh += 1) {
    const h = hh % 360;
    const byL = new Map();
    for (let L = t.L[0]; L <= t.L[1]; L += 1) {
      let best = null;
      let hush = null;
      for (let C = 130; C >= 4; C -= 1) {
        const hex = lchToHex(L, C, h);
        if (hex === null) continue;
        const k = contrast(hex, t.ground);
        if (k < CONTRAST[0] || k > CONTRAST[1]) continue;
        if (contrast(hex, t.ink) < INK_MIN) continue;
        const lab = rgbToLab(hexToRgb(hex));
        if (bad.some((f) => dE(lab, f) < FUNCTIONAL_MIN)) continue;
        const cand = { hex, lab, L, C, h, k };
        // The loud six want the most chroma this (h, L) can legally hold — and
        // that ceiling is the GAMUT, not a number of ours: measured, sRGB holds
        // no more than C* 33 anywhere between hue 177 and 255 at these
        // lightnesses, which is why Program's turquoise has always been the
        // palest of the seven. A chroma floor written into this search made the
        // whole teal end of the arc illegal and the run came back empty.
        if (best === null && (theme !== 'koyu' || C >= DARK_C_MIN)) best = cand;
        if (C <= QUIET_C_MAX && L >= QUIET_L[theme][0] && L <= QUIET_L[theme][1]) hush = cand;
      }
      if (best !== null || hush !== null) byL.set(L, { loud: best, quiet: hush });
    }
    if (byL.size > 0) grid.set(h, byL);
  }
  return grid;
}

const GRID = { acik: legalGrid('acik'), koyu: legalGrid('koyu') };

/* --------------------------------------------------------------- search */

const N = 7;
const NAMES = ['setup', 'availability', 'lessons', 'program', 'check', 'print', 'settings'];
const TR = ['Okul', 'Müsaitlik', 'Dersler', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar'];

/** A hue is usable only if BOTH themes have something legal at it. */
const HUES = [...GRID.acik.keys()].filter((h) => GRID.koyu.has(h));

function pick(theme, h, L, quiet) {
  const byL = GRID[theme].get(h);
  if (byL === undefined) return null;
  const voice = (v) => (quiet ? v.quiet : v.loud);
  if (byL.has(L) && voice(byL.get(L)) !== null) return voice(byL.get(L));
  // Nearest legal lightness at this hue — the annealer walks L freely and a
  // dead step should cost separation, not crash the run.
  let best = null, gap = Infinity;
  for (const [k, v] of byL) {
    if (voice(v) === null) continue;
    if (Math.abs(k - L) < gap) { gap = Math.abs(k - L); best = voice(v); }
  }
  return best;
}

function floorOf(slots, theme) {
  const labs = slots.map((s, i) =>
    pick(theme, s.h, theme === 'acik' ? s.Ll : s.Ld, i === QUIET)?.lab);
  let worst = Infinity;
  for (let i = 0; i < labs.length; i += 1) {
    for (let j = i + 1; j < labs.length; j += 1) {
      if (labs[i] === undefined || labs[j] === undefined) return 0;
      worst = Math.min(worst, dE(labs[i], labs[j]));
    }
  }
  return worst;
}

const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

/**
 * How far the set is from the hue rule, in degrees, summed.
 *
 * A PENALTY and not a gate, and that distinction cost a run: written as a gate
 * the score was 0 for every random start, so `s >= curScore` accepted every
 * move and the annealer walked at random for 60 000 steps without ever finding
 * a legal set. A hard constraint with no gradient is not a constraint, it is a
 * wall in the dark.
 */
function hueDebt(slots) {
  let debt = 0;
  for (let i = 0; i < slots.length; i += 1) {
    if (i === QUIET) continue;
    for (let j = i + 1; j < slots.length; j += 1) {
      if (j === QUIET) continue;
      debt += Math.max(0, HUE_GAP - hueGap(slots[i].h, slots[j].h));
    }
  }
  return debt;
}

/** The score is the WORSE theme: a set that only works with the lamp on is not a set. */
const score = (slots) =>
  Math.min(floorOf(slots, 'acik'), floorOf(slots, 'koyu')) - 3 * hueDebt(slots);

/**
 * Six hues spread evenly over the open arc plus one free one for the quiet
 * slot. Starting legal and letting the annealer trade from there beats starting
 * at random: the arc is 186 degrees and seven random draws are almost never
 * 26 apart, so a random start spends its whole budget paying off hue debt.
 */
function randomSlots(rnd) {
  const span = HUE_OPEN[1] - HUE_OPEN[0];
  const turn = rnd() * span;
  return Array.from({ length: N }, (_, i) => {
    const h =
      i === QUIET
        ? HUES[Math.floor(rnd() * HUES.length)]
        : Math.round(HUE_OPEN[0] + ((turn + (i * span) / (N - 1)) % span)) % 360;
    const at = GRID.acik.get(h) ?? GRID.acik.get(HUES[0]);
    const dk = GRID.koyu.get(h) ?? GRID.koyu.get(HUES[0]);
    const la = [...at.keys()];
    const lk = [...dk.keys()];
    return { h, Ll: la[Math.floor(rnd() * la.length)], Ld: lk[Math.floor(rnd() * lk.length)] };
  });
}

/** Seeded, so the recipe gives the same answer twice. */
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let champion = null;
for (let run = 0; run < TURN; run += 1) {
  const rnd = mulberry(1337 + run);
  let cur = randomSlots(rnd);
  let curScore = score(cur);
  for (let step = 0; step < 60000; step += 1) {
    const temp = 6 * (1 - step / 60000);
    const next = cur.map((s) => ({ ...s }));
    const i = Math.floor(rnd() * N);
    const what = rnd();
    if (what < 0.5) {
      next[i].h = (next[i].h + Math.round((rnd() - 0.5) * 40) + 360) % 360;
      if (!GRID.acik.has(next[i].h) || !GRID.koyu.has(next[i].h)) continue;
    } else if (what < 0.75) {
      next[i].Ll += Math.round((rnd() - 0.5) * 12);
    } else {
      next[i].Ld += Math.round((rnd() - 0.5) * 12);
    }
    const s = score(next);
    if (s >= curScore || rnd() < Math.exp((s - curScore) / Math.max(temp, 0.001))) {
      cur = next; curScore = s;
    }
    if (champion === null || curScore > champion.score) {
      champion = { slots: cur.map((x) => ({ ...x })), score: curScore };
    }
  }
}

/* --------------------------------------------------------------- report */

// Program keeps the turquoise end and Ayarlar the quiet end: the reader asked
// for turquoise by name, and a settings tab that shouts is a settings tab that
// gets clicked by mistake. So the seven are ASSIGNED, not left in search order.
const dress = (s, i) => ({
  ...s,
  acik: pick('acik', s.h, s.Ll, i === QUIET),
  koyu: pick('koyu', s.h, s.Ld, i === QUIET),
});
const quiet = dress(champion.slots[QUIET], QUIET);
const rest = champion.slots
  .filter((_, i) => i !== QUIET)
  .map((s) => dress(s, 0))
  .sort((a, b) => a.h - b.h);

// The turquoise goes to Program: the reader asked for it by name, and it is
// already the colour that tab has worn for two versions.
const toTeal = (x) => hueGap(x.h, 224);
const teal = rest.reduce((a, b) => (toTeal(a) <= toTeal(b) ? a : b));
const others = rest.filter((x) => x !== teal);

/**
 * WHICH colour goes to WHICH tab, and it is not cosmetic.
 *
 * The search maximises the worst pair anywhere in the set; the eye compares
 * NEIGHBOURS. Six identity colours laid down in hue order put the two closest
 * of them side by side on the strip, which is the arrangement that looks worst
 * for a set that measures well. So the five free ones are permuted (120 ways,
 * Program pinned to the turquoise and Ayarlar last because it is last) and the
 * arrangement whose weakest ADJACENT pair is strongest wins.
 */
function permutations(xs) {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) =>
    permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest]));
}

// Kontrol may not wear the reddest of the six, and that is meaning rather than
// distance: it is the tab that counts engel and uyarı, and a crimson strip over
// a list of blockers says the whole screen is one. The search cannot see this —
// dE 36 from --bad is true and beside the point.
const badHue = 32;            // --bad, measured: 36 açık / 28 koyu
const reddest = others.reduce((a, b) => (hueGap(a.h, badHue) <= hueGap(b.h, badHue) ? a : b));

let order = null, bestNeighbour = -1;
for (const perm of permutations(others)) {
  const line = [perm[0], perm[1], perm[2], teal, perm[3], perm[4], quiet];
  if (line[4] === reddest) continue;
  let worst = Infinity;
  for (let i = 0; i + 1 < N; i += 1) {
    worst = Math.min(
      worst,
      dE(line[i].acik.lab, line[i + 1].acik.lab),
      dE(line[i].koyu.lab, line[i + 1].koyu.lab),
    );
  }
  if (worst > bestNeighbour) { bestNeighbour = worst; order = line; }
}

const floors = { acik: floorOf(champion.slots, 'acik'), koyu: floorOf(champion.slots, 'koyu') };
let minGap = 360;
for (let i = 0; i < N; i += 1) {
  if (i === QUIET) continue;
  for (let j = i + 1; j < N; j += 1) {
    if (j === QUIET) continue;
    minGap = Math.min(minGap, hueGap(champion.slots[i].h, champion.slots[j].h));
  }
}
console.log(
  `\nölçülen taban (en kötü ikili dE76, kötü olan tema): ${Math.min(floors.acik, floors.koyu).toFixed(1)}` +
  `   ·   altı kimlik renginin en dar hue aralığı: ${minGap}°\n`,
);
console.log('bölüm        hue   AÇIK   L*  C*  kontrast   KOYU    L*  C*  kontrast');
order.forEach((s, i) => {
  console.log(
    `${TR[i].padEnd(11)} ${String(s.h).padStart(3)}   ${s.acik.hex}  ${String(s.acik.L).padStart(2)} ` +
    `${String(s.acik.C).padStart(3)}  ${s.acik.k.toFixed(1).padStart(5)}    ` +
    `${s.koyu.hex}  ${String(s.koyu.L).padStart(2)} ${String(s.koyu.C).padStart(3)}  ${s.koyu.k.toFixed(1).padStart(5)}`,
  );
});

for (const theme of ['acik', 'koyu']) {
  const labs = order.map((s) => s[theme].lab);
  let worst = Infinity, pair = '';
  for (let i = 0; i < N; i += 1) for (let j = i + 1; j < N; j += 1) {
    const d = dE(labs[i], labs[j]);
    if (d < worst) { worst = d; pair = `${TR[i]}↔${TR[j]}`; }
  }
  const fn = THEMES[theme].functional.map((h) => rgbToLab(hexToRgb(h)));
  const nearest = Math.min(...labs.flatMap((l) => fn.map((f) => dE(l, f))));
  console.log(
    `\n${theme}: en yakın çift ${pair} dE ${worst.toFixed(1)} · işlevsel üçlüye en yakın dE ${nearest.toFixed(1)}`,
  );
}
console.log(`\nşeritte yan yana duran en yakın iki sekme: dE ${bestNeighbour.toFixed(1)}`);

console.log('\n--- styles.css ---');
console.log('/* açık */');
order.forEach((s, i) => console.log(`  --sec-${NAMES[i]}: ${s.acik.hex};`));
console.log('/* koyu */');
order.forEach((s, i) => console.log(`  --sec-${NAMES[i]}: ${s.koyu.hex};`));
