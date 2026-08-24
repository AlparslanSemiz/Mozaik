import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Screenshots only. The main config ignores ekran.spec.ts on purpose.
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/ekran.spec.ts',
});
