// A subset of the main E2E suite in Brave: `npm run test:brave` (TP12, B10).
//
// Brave is a Chromium, so the question is not the engine but what Brave adds
// on top of it (Shields, its own storage rules) to the double-clicked file:
// does file:// open, does the store survive a reload, is the font the
// embedded one, and does the page fetch nothing. Measured once by hand
// (2026-10-09: no page error, no network request); this keeps asking.
//
// LOCAL ONLY, and run by hand. GitHub's runners have no Brave, and installing
// one there is a third-party binary from the network whose version cannot be
// pinned. A clean profile, so a user's own Shields settings are not measured.
//
// No Brave, no run: it stops with a sentence rather than skipping, because a
// suite that did not run is not a green one (TESTPLAN).
import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const brave = process.env.BRAVE_YOLU ?? '/usr/bin/brave-browser';
if (!existsSync(brave)) {
  throw new Error(`Brave bulunamadı: ${brave}. Yolunu BRAVE_YOLU ile verin.`);
}

export default defineConfig({
  ...base,
  // Opening, the store, offline and the font (temel), plans surviving a reload
  // (planlar), and the accessibility scan (erisim).
  testMatch: ['**/temel.spec.ts', '**/planlar.spec.ts', '**/erisim.spec.ts'],
  projects: [
    {
      name: 'brave',
      use: { browserName: 'chromium', launchOptions: { executablePath: brave } },
    },
  ],
});
