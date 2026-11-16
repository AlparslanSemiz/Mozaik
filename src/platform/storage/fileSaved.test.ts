// @vitest-environment jsdom

// When the last plan file left, what the reminder waits for, and the request
// that the browser keep the site's storage.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  forgetFileRecord,
  markChanged,
  markFileSaved,
  readFileRecord,
  reminderDue,
  REMIND_AFTER,
} from './fileSaved';
import { askToKeep, resetAskToKeep } from './persist';
import { FILE_SAVED_KEY } from '../../leaf/preference';

const GUN = 24 * 60 * 60 * 1000;

beforeEach(() => {
  localStorage.clear();
  forgetFileRecord();
});

describe('son plan dosyası', () => {
  it('kayıt yokken: dosya yok, değişiklik yok, hatırlatma yok', () => {
    expect(readFileRecord()).toEqual({ saved: null, changedSince: null });
    expect(reminderDue(readFileRecord())).toBe(false);
  });

  it('YALNIZ dosyadan sonraki İLK değişiklik akılda kalıyor', () => {
    markFileSaved(1_000);
    markChanged(2_000);
    markChanged(3_000);
    expect(readFileRecord()).toEqual({ saved: 1_000, changedSince: 2_000 });
    expect(JSON.parse(localStorage.getItem(FILE_SAVED_KEY)!)).toEqual({
      dosya: 1_000,
      degisiklik: 2_000,
    });
  });

  it('yeni bir dosya değişikliği siliyor', () => {
    markChanged(2_000);
    markFileSaved(5_000);
    expect(readFileRecord()).toEqual({ saved: 5_000, changedSince: null });
  });

  it('hatırlatma bir hafta dolunca, bir gün önce değil', () => {
    const r = { saved: null, changedSince: 10 * GUN };
    expect(REMIND_AFTER).toBe(7 * GUN);
    expect(reminderDue(r, 10 * GUN + 6 * GUN)).toBe(false);
    expect(reminderDue(r, 10 * GUN + 7 * GUN)).toBe(true);
  });

  it('bozuk kayıt dosyasız ve değişikliksiz sayılıyor', () => {
    for (const raw of ['{', 'null', '[]', '{"dosya":"dün","degisiklik":-5}']) {
      localStorage.setItem(FILE_SAVED_KEY, raw);
      expect(readFileRecord(), raw).toEqual({ saved: null, changedSince: null });
    }
  });
});

describe('persist()', () => {
  it('sitede bir kez soruyor, zaten kalıcıysa sormuyor', async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    const persisted = vi.fn(() => Promise.resolve(false));
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persist, persisted },
    });
    resetAskToKeep();
    askToKeep();
    askToKeep();
    await Promise.resolve();
    await Promise.resolve();
    expect(persisted).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);

    persisted.mockImplementation(() => Promise.resolve(true));
    resetAskToKeep();
    askToKeep();
    await Promise.resolve();
    await Promise.resolve();
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('API yoksa sessizce hiçbir şey yapmıyor', () => {
    Object.defineProperty(navigator, 'storage', { configurable: true, value: undefined });
    resetAskToKeep();
    expect(() => askToKeep()).not.toThrow();
  });
});
