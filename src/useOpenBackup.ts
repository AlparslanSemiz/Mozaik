// Opening a backup file the reader picked.
//
// Three different files can land here and each deserves its own sentence — and
// a BUNDLE is refused rather than opened: it holds every plan, so opening one
// would mean replacing the whole library, and the top bar stays the place where
// no click can lose an afternoon (pitfall 30).

import type React from 'react';
import { useCallback } from 'react';
import { BUNDLE_VERSION, bundleVersionOf } from './bundle';
import { parseState } from './parseState';
import type { State } from './types';

interface AlertRequest {
  title: string;
  tone?: 'warn';
  body: string;
}

interface ConfirmRequest {
  title: string;
  body: string;
  confirmLabel: string;
  danger: boolean;
}

export interface OpenBackupDeps {
  alert: (request: AlertRequest) => Promise<unknown>;
  confirm: (request: ConfirmRequest) => Promise<boolean>;
  loadState: (state: State) => void;
  notify: (message: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/** The `onChange` of the hidden file input in the top bar. */
export function useOpenBackup({ alert, confirm, loadState, notify, t }: OpenBackupDeps) {
  return useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // so the same file can be picked again
      if (file === undefined) return;

      // Read ONCE. The failure path used to call `file.text()` a second time
      // and parse the whole thing again, which made a wrong file the slowest
      // case rather than the fastest. (Both parses are cheap — MEASURED at
      // 0.65 ms for a full 426-placement week — so this is about the shape of
      // the code, not about speed. The thing that actually costs a reader time
      // on this path is the confirmation dialog, and that one is deliberate.)
      const text = await file.text();
      const loaded = parseState(text);
      if (loaded === null) {
        await alert(refusal(text, t));
        return;
      }

      const replace = await confirm({
        title: t('Şu anki programın yerine geçecek'),
        body: t(
          'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.',
        ),
        confirmLabel: t('Yedeği yükle'),
        danger: true,
      });
      if (!replace) return;

      loadState(loaded);
      notify(t('Yedek yüklendi.'));
    },
    [alert, confirm, loadState, notify, t],
  );
}

/** Which of the three "no" sentences this file earns. */
function refusal(text: string, t: OpenBackupDeps['t']): AlertRequest {
  const version = bundleVersionOf(text);

  if (version === BUNDLE_VERSION) {
    return {
      title: t('Bu dosya bütün planları içeriyor'),
      tone: 'warn',
      body: t(
        'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.',
      ),
    };
  }
  if (version !== null) {
    return {
      title: t('Bu dosya daha yeni bir sürümle yazılmış'),
      tone: 'warn',
      body: t('Programı güncelleyin, sonra tekrar deneyin.'),
    };
  }
  return {
    title: t('Bu dosya okunamadı'),
    tone: 'warn',
    body: t('Program tarafından indirilmiş bir .json yedek dosyası seçin.'),
  };
}
