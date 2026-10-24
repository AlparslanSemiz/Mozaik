// Çıktı's "send each teacher their week" (TODO B3.4): one button per teacher,
// and the user's own mail program does the rest.
//
// NOTHING IS SENT FROM HERE. The button opens a new message in the mail
// program this machine already has, from the account already in it, with the
// teacher's address and week filled in; the user reads it and presses Send.
// In the exe the shell is asked (src-tauri/src/mail.rs), which can also say
// that no mail program is chosen at all. In a browser it is a plain `mailto:`
// link, and a page cannot ask: the browser may first show its own "open the
// mail program?" question, or Windows its app picker, and neither is visible
// from here. So after a click one line says what it means if nothing opened,
// and the page does not guess (a timer did, and was wrong both ways, review
// 2026-10-24).

import { useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import { looksLikeEmail } from '../../leaf/email';
import { paletteColor } from '../../leaf/palette';
import type { State } from '../../leaf/types';
import { desktopMail, isDesktop, type EpostaSonucu } from '../../platform/desktop';
import type { Index } from '../../pure/constraints';
import { teacherMail } from '../../pure/paper';
import { useT } from '../T';

interface Props {
  state: State;
  ix: Index;
  spans: Map<string, number>;
}

/** Why a teacher has no button, in the fewest words that say where to fix it. */
type Why = 'adres yok' | 'adres hatalı' | 'programı boş' | 'e-postaya sığmıyor';

export default function MailPanel({ state, ix, spans }: Props) {
  const t = useT();
  const exe = isDesktop();
  const [said, setSaid] = useState<EpostaSonucu | 'tarayici' | null>(null);

  const rows = useMemo(
    () =>
      state.teachers.map((teacher) => {
        let why: Why | null = null;
        let url = '';
        if (teacher.email === '') why = 'adres yok';
        else if (!looksLikeEmail(teacher.email)) why = 'adres hatalı';
        else {
          const mail = teacherMail(state, ix, spans, teacher, t);
          if (mail === 'empty') why = 'programı boş';
          else if (mail === 'tooLong') why = 'e-postaya sığmıyor';
          else url = mail.url;
        }
        return { teacher, why, url };
      }),
    [state, ix, spans, t],
  );

  async function openInExe(url: string) {
    setSaid(null);
    setSaid(await desktopMail(url));
  }

  return (
    <div className="panel no-print mail-panel">
      <h2>{t('E-postayla gönder')}</h2>
      <p className="hint">
        {t(
          'Öğretmenin haftası e-posta programınızda yeni bir ileti olarak açılır. Gönder’e siz basarsınız.',
        )}
      </p>
      <ul className="mail-list">
        {rows.map(({ teacher, why, url }) => (
          <li key={teacher.id} className="mail-row">
            <span className="row-dot" style={{ background: paletteColor(teacher.color) }} />
            <span className="mail-who" title={teacher.name}>
              {teacher.short}
            </span>
            {why !== null ? (
              <span className="muted-inline">{t(why)}</span>
            ) : exe ? (
              <button
                className="btn"
                aria-label={t('{kim} için e-postayı aç', { kim: teacher.short })}
                onClick={() => void openInExe(url)}
              >
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
                {t('E-postada aç')}
              </button>
            ) : (
              <a
                className="btn"
                href={url}
                aria-label={t('{kim} için e-postayı aç', { kim: teacher.short })}
                onClick={() => setSaid('tarayici')}
              >
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
                {t('E-postada aç')}
              </a>
            )}
          </li>
        ))}
      </ul>
      {said === 'istemci-yok' && (
        <div className="warn-box" role="status">
          {t('Bu bilgisayarda seçili bir e-posta programı yok.')}
        </div>
      )}
      {said === 'tarayici' && (
        <p className="hint" role="status">
          {t('E-posta programı açılmadıysa bu bilgisayarda seçili bir e-posta programı yok.')}
        </p>
      )}
      {said === 'olmadi' && (
        <div className="warn-box" role="status">
          {t('E-posta programı açılamadı.')}
        </div>
      )}
    </div>
  );
}
