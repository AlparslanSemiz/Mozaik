// Global setup of the site suite: the page the server answers with has to be
// this checkout's dist-site/index.html, byte for byte, before any test runs.
// A port of our own and `reuseExistingServer: false` already keep a stranger's
// server out; this is the check that says so when they do not (sitePort.ts).
//
// Playwright starts the webServer before global setup, so the server is up.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FullConfig } from '@playwright/test';

export default async function siteIdentity(config: FullConfig): Promise<void> {
  const base = config.projects[0]?.use.baseURL;
  if (base === undefined) throw new Error('site süitinin baseURL’i yok');
  const local = readFileSync(resolve('dist-site/index.html'));
  const response = await fetch(new URL('index.html', base));
  const served = Buffer.from(await response.arrayBuffer());
  if (!response.ok || !served.equals(local)) {
    throw new Error(
      `${base} bu klasörün dist-site/index.html’ini sunmuyor ` +
        `(HTTP ${response.status}, sunulan ${served.length} bayt, yerel ${local.length} bayt). ` +
        'Başka bir klasörün sunucusu bu portta olabilir.',
    );
  }
}
