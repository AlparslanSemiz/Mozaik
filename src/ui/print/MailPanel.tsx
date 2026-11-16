// Çıktı's "send each teacher their week" (TODO B3.4): one button per teacher,
// and the user's own mail program does the rest. The person page's Gönder
// (Sadeleşme, K5) is the same button for one teacher, so both are here.
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

import { type ReactNode, useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import { paletteColor, type State, type Teacher, looksLikeEmail } from '../../leaf/model';
import { desktopMail, isDesktop, type EpostaSonucu } from '../../platform/exe';
import { blockSpans, buildIndex, type Index } from '../../pure/constraints';
import { teacherMail } from '../../pure/paper';
import { useT } from '../common';

interface Props {
  state: State;
  ix: Index;
  spans: Map<string, number>;
}

/** Why a teacher has no button, in the fewest words that say where to fix it. */
type Why = 'adres yok' | 'adres hatalı' | 'programı boş' | 'e-postaya sığmıyor';

type Translate = ReturnType<typeof useT>;

/** One teacher's message, or why there is none. */
function mailFor(
  state: State,
  ix: Index,
  spans: Map<string, number>,
  teacher: Teacher,
  t: Translate,
): { why: Why | null; url: string } {
  if (teacher.email === '') return { why: 'adres yok', url: '' };
  if (!looksLikeEmail(teacher.email)) return { why: 'adres hatalı', url: '' };
  const mail = teacherMail(state, ix, spans, teacher, t);
  if (mail === 'empty') return { why: 'programı boş', url: '' };
  if (mail === 'tooLong') return { why: 'e-postaya sığmıyor', url: '' };
  return { why: null, url: mail.url };
}

type Said = EpostaSonucu | 'tarayici' | null;

/** What happened after a press. */
function MailSaid({ said }: { said: Said }) {
  const t = useT();
  if (said === 'istemci-yok') {
    return (
      <div className="warn-box" role="status">
        {t('Bu bilgisayarda seçili bir e-posta uygulaması yok.')}
      </div>
    );
  }
  if (said === 'tarayici') {
    return (
      <p className="hint" role="status">
        {t('E-posta uygulaması açılmadıysa bu bilgisayarda seçili bir e-posta uygulaması yok.')}
      </p>
    );
  }
  if (said === 'olmadi') {
    return (
      <div className="warn-box" role="status">
        {t('E-posta uygulaması açılamadı.')}
      </div>
    );
  }
  return null;
}

/** A `mailto:` link in a browser, the shell's own call in the exe. */
function MailButton({
  url,
  name,
  children,
  setSaid,
}: {
  url: string;
  /** Omitted on the person page: there the visible "Gönder" is the name (WCAG 2.5.3). */
  name?: string;
  children: ReactNode;
  setSaid: (next: Said) => void;
}) {
  return isDesktop() ? (
    <button
      className="btn"
      aria-label={name}
      onClick={() => {
        setSaid(null);
        void desktopMail(url).then(setSaid);
      }}
    >
      <Mail size={16} strokeWidth={2} aria-hidden="true" />
      {children}
    </button>
  ) : (
    <a className="btn" href={url} aria-label={name} onClick={() => setSaid('tarayici')}>
      <Mail size={16} strokeWidth={2} aria-hidden="true" />
      {children}
    </a>
  );
}

/**
 * The person page's Gönder: the same message as the Çıktı row, or, when
 * there is none, the one sentence that says how to get one. Pressed without
 * an address it also puts the keyboard in the address box (`onMissing`).
 *
 * TODO(aşama 4): WhatsApp ile ve PDF olarak gönder; bugün yalnız e-posta.
 */
export function SendTeacher({
  state,
  teacher,
  onMissing,
}: {
  state: State;
  teacher: Teacher;
  onMissing: () => void;
}) {
  const t = useT();
  const [said, setSaid] = useState<Said>(null);
  const [asked, setAsked] = useState(false);
  const { why, url } = useMemo(
    () => mailFor(state, buildIndex(state), blockSpans(state), teacher, t),
    [state, teacher, t],
  );
  return (
    <>
      {why === null ? (
        <MailButton url={url} setSaid={setSaid}>
          {t('Gönder')}
        </MailButton>
      ) : (
        <button
          className="btn"
          onClick={() => {
            setAsked(true);
            if (why === 'adres yok' || why === 'adres hatalı') onMissing();
          }}
        >
          <Mail size={16} strokeWidth={2} aria-hidden="true" />
          {t('Gönder')}
        </button>
      )}
      {asked && why !== null && (
        <p className="hint sheet-said" role="status">
          {why === 'adres yok'
            ? t('Göndermek için Bilgiler’de e-posta adresini yazın.')
            : why === 'adres hatalı'
              ? t('Tek bir e-posta adresi yazılır: ad@ornek.com')
              : // Çıktı's own words for the other two, so the two places
                // agree and the dictionaries carry one sentence less each.
                t(why)}
        </p>
      )}
      <MailSaid said={said} />
    </>
  );
}

export default function MailPanel({ state, ix, spans }: Props) {
  const t = useT();
  const [said, setSaid] = useState<Said>(null);

  const rows = useMemo(
    () => state.teachers.map((teacher) => ({ teacher, ...mailFor(state, ix, spans, teacher, t) })),
    [state, ix, spans, t],
  );

  return (
    <div className="panel no-print mail-panel">
      <h2>{t('E-postayla gönder')}</h2>
      <p className="hint">
        {t(
          'Öğretmenin programı e-posta uygulamanızda yeni bir ileti olarak açılır. Gönder’e siz basarsınız.',
        )}
      </p>
      {/* Above the list: the row pressed may be the first of twenty-five. */}
      <MailSaid said={said} />
      <ul className="mail-list">
        {rows.map(({ teacher, why, url }) => (
          <li key={teacher.id} className="mail-row">
            <span className="row-dot" style={{ background: paletteColor(teacher.color) }} />
            {/* The full name since 2026-11-16 (Sadeleşme): "MÇ" says who only
                to somebody who already knows. */}
            <span className="mail-who" title={teacher.short}>
              {teacher.name}
            </span>
            {/* Where it goes, before it goes: the line read before pressing. */}
            {why === null && (
              <span className="mail-to" title={teacher.email}>
                {teacher.email}
              </span>
            )}
            {why !== null ? (
              <span className="muted-inline">{t(why)}</span>
            ) : (
              <MailButton
                url={url}
                name={t('{kim} için e-postayı aç', { kim: teacher.short })}
                setSaid={setSaid}
              >
                {t('E-postada aç')}
              </MailButton>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
