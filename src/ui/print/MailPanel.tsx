// Çıktı's "send each teacher their week" (TODO B3.4): per teacher, the user's
// own mail program and WhatsApp. The person page's Gönder and WhatsApp
// (Sadeleşme, K5) are the same buttons for one teacher, and its PDF kaydet
// the same file for a class, so all of them are here.
//
// NOTHING IS SENT FROM HERE. Each press first saves the timetable as a PDF in
// İndirilenler (`send.ts`), then opens a new message in the mail program this
// machine already has, or the teacher's chat in WhatsApp; the user attaches
// the file, reads it and presses Send. A `mailto:` cannot carry a file and
// neither can a wa.me link, so the line under the buttons names the file and
// says where to attach it.
//
// In the exe the shell is asked (src-tauri/src/mail.rs), which can also say
// that no mail program is chosen at all. In a browser it is a plain `mailto:`
// link, and a page cannot ask: the browser may first show its own "open the
// mail program?" question, or Windows its app picker, and neither is visible
// from here. So after a click one line says what it means if nothing opened,
// and the page does not guess (a timer did, and was wrong both ways, review
// 2026-10-24).

import { type ReactNode, useMemo, useState } from 'react';
import { FileDown, Mail, MessageCircle } from 'lucide-react';
import { paletteColor, type State, type Teacher, looksLikeEmail } from '../../leaf/model';
import { desktopMail, isDesktop, type EpostaSonucu } from '../../platform/exe';
import { blockSpans, buildIndex, type Index } from '../../pure/constraints';
import { teacherMail } from '../../pure/paper';
import { useAnnounce, useT } from '../common';
import { sendPdf, sheetFile, whatsappLink } from './send';

interface Props {
  state: State;
  ix: Index;
  spans: Map<string, number>;
  /** Whether the saved PDF is in colour, as the printed sheet would be. */
  colored: boolean;
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

type Said = EpostaSonucu | 'tarayici' | 'wa-olmadi' | null;

/** The name of the PDF just saved. */
type Saved = string | null;

/** Where a press sends the saved PDF: nothing more, or that teacher's chat. */
type Save = (to?: { whatsapp: string }) => void;

/**
 * The press itself: one sheet's PDF into İndirilenler, then the chat, and
 * the two lines that say so (`MailSaid`).
 */
function saver(
  state: State,
  kind: 'teacher' | 'class',
  colored: boolean,
  t: Translate,
  setSaved: (name: Saved) => void,
  setSaid: (said: Said) => void,
  announce: (text: string) => void,
) {
  return (id: string): Save =>
    (to) => {
      const file = sheetFile(state, kind, id, colored, t);
      if (file === null) return;
      setSaved(file.name);
      // Every press is heard, the same file twice included: the visible line
      // is not a live region (it would not repeat).
      announce(t('{ad} İndirilenler klasörüne kaydedildi.', { ad: file.name }));
      void sendPdf(file, to).then((opened) => {
        if (!opened) setSaid('wa-olmadi');
      });
    };
}

/** What happened after a press. */
function MailSaid({ said, saved }: { said: Said; saved: Saved }) {
  const t = useT();
  return (
    <>
      {saved !== null && (
        <p className="hint sheet-said">
          {t('{ad} İndirilenler klasörüne kaydedildi. İletiye ya da sohbete ataşla ekleyin.', {
            ad: saved,
          })}
        </p>
      )}
      {said === 'istemci-yok' ? (
        <div className="warn-box" role="status">
          {t('Bu bilgisayarda seçili bir e-posta uygulaması yok.')}
        </div>
      ) : said === 'tarayici' ? (
        <p className="hint" role="status">
          {t('E-posta uygulaması açılmadıysa bu bilgisayarda seçili bir e-posta uygulaması yok.')}
        </p>
      ) : said === 'wa-olmadi' ? (
        <div className="warn-box" role="status">
          {t('WhatsApp açılamadı.')}
        </div>
      ) : said === 'olmadi' ? (
        <div className="warn-box" role="status">
          {t('E-posta uygulaması açılamadı.')}
        </div>
      ) : null}
    </>
  );
}

/** A `mailto:` link in a browser, the shell's own call in the exe; the PDF is saved first. */
function MailButton({
  url,
  name,
  children,
  setSaid,
  save,
}: {
  url: string;
  /** Omitted on the person page: there the visible "Gönder" is the name (WCAG 2.5.3). */
  name?: string;
  children: ReactNode;
  setSaid: (next: Said) => void;
  save: Save;
}) {
  return isDesktop() ? (
    <button
      className="btn"
      aria-label={name}
      onClick={() => {
        setSaid(null);
        save();
        void desktopMail(url).then(setSaid);
      }}
    >
      <Mail size={16} strokeWidth={2} aria-hidden="true" />
      {children}
    </button>
  ) : (
    <a
      className="btn"
      href={url}
      aria-label={name}
      onClick={() => {
        save();
        setSaid('tarayici');
      }}
    >
      <Mail size={16} strokeWidth={2} aria-hidden="true" />
      {children}
    </a>
  );
}

/** The teacher's chat, after the PDF is saved; without a number, `missing` says why. */
function WhatsappButton({
  url,
  name,
  label,
  save,
  missing,
}: {
  url: string | null;
  name?: string;
  /** The visible words: the person page says what pressing does. */
  label: string;
  save: Save;
  missing: () => void;
}) {
  return (
    <button
      className="btn"
      aria-label={name}
      onClick={() => {
        if (url === null) missing();
        else save({ whatsapp: url });
      }}
    >
      <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * The person page's button row and what it says back. The buttons are DIRECT
 * children of `.sheet-actions`, in the order of the work: what the page's owner
 * puts first (`lead`: Yazdır, Bugün yok…), then PDF kaydet, and for a teacher
 * E-postayla gönder and WhatsApp'la gönder, with no wrapper between. What the
 * presses answer follows the buttons.
 *
 * Pressed without an address or a number, the two sending buttons also put the
 * keyboard in that box (`onMissing`).
 */
export function SheetActions({
  state,
  kind,
  id,
  teacher,
  colored,
  lead,
  note,
  onMissing,
}: {
  state: State;
  kind: 'teacher' | 'class';
  id: string;
  /** Present for a teacher: the sending buttons. */
  teacher?: Teacher | undefined;
  colored: boolean;
  lead: ReactNode;
  /** A line that belongs under the row, before the answers. */
  note?: ReactNode;
  onMissing: (box: 'email' | 'phone') => void;
}) {
  const t = useT();
  const announce = useAnnounce();
  const [said, setSaid] = useState<Said>(null);
  const [saved, setSaved] = useState<Saved>(null);
  const [asked, setAsked] = useState<Why | 'telefon' | null>(null);
  const { why, url } = useMemo(
    () =>
      teacher === undefined
        ? { why: null, url: '' }
        : mailFor(state, buildIndex(state), blockSpans(state), teacher, t),
    [state, teacher, t],
  );
  const send = saver(state, kind, colored, t, setSaved, setSaid, announce)(id);
  const save: Save = (to) => {
    setAsked(null);
    setSaid(null);
    send(to);
  };
  return (
    <div className="sheet-actions">
      {lead}
      <button className="btn" onClick={() => save()}>
        <FileDown size={16} strokeWidth={2} aria-hidden="true" />
        {t('PDF kaydet')}
      </button>
      {teacher !== undefined &&
        (why === null ? (
          <MailButton url={url} setSaid={setSaid} save={save}>
            {t('E-postayla gönder')}
          </MailButton>
        ) : (
          <button
            className="btn"
            onClick={() => {
              setSaved(null);
              setAsked(why);
              if (why === 'adres yok' || why === 'adres hatalı') onMissing('email');
            }}
          >
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
            {t('E-postayla gönder')}
          </button>
        ))}
      {teacher !== undefined && (
        <WhatsappButton
          url={whatsappLink(teacher, t)}
          label={t('WhatsApp’la gönder')}
          save={save}
          missing={() => {
            setSaved(null);
            setAsked('telefon');
            onMissing('phone');
          }}
        />
      )}
      {note}
      {asked !== null && (
        <p className="hint sheet-said" role="status">
          {asked === 'telefon'
            ? t('Göndermek için Bilgiler’de telefon numarasını yazın.')
            : asked === 'adres yok'
              ? t('Göndermek için Bilgiler’de e-posta adresini yazın.')
              : asked === 'adres hatalı'
                ? t('Tek bir e-posta adresi yazılır: ad@ornek.com')
                : // Çıktı's own words for the other two, so the two places
                  // agree and the dictionaries carry one sentence less each.
                  t(asked)}
        </p>
      )}
      <MailSaid said={said} saved={saved} />
    </div>
  );
}

export default function MailPanel({ state, ix, spans, colored }: Props) {
  const t = useT();
  const [said, setSaid] = useState<Said>(null);
  const [saved, setSaved] = useState<Saved>(null);

  const rows = useMemo(
    () =>
      state.teachers.map((teacher) => ({
        teacher,
        wa: whatsappLink(teacher, t),
        ...mailFor(state, ix, spans, teacher, t),
      })),
    [state, ix, spans, t],
  );
  const announce = useAnnounce();
  const save = saver(state, 'teacher', colored, t, setSaved, setSaid, announce);
  // Twenty-five rows saying "adres yok" were the loudest thing in the panel:
  // those with neither address nor number are one sentence under the list.
  const noAddress = rows.filter((r) => r.why === 'adres yok');
  const listed = rows.filter((r) => r.why !== 'adres yok' || r.wa !== null);

  return (
    <div className="panel no-print mail-panel">
      <h2>{t('Gönder')}</h2>
      <p className="hint">{t('Program e-posta uygulamanızda açılır; siz gönderirsiniz.')}</p>
      {/* Above the list: the row pressed may be the first of twenty-five. */}
      <MailSaid said={said} saved={saved} />
      <ul className="mail-list">
        {listed.map(({ teacher, why, url, wa }) => (
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
            {why === 'adres yok' ? null : why !== null ? (
              <span className="muted-inline">{t(why)}</span>
            ) : (
              <MailButton
                url={url}
                name={t('{kim} için e-postayı aç', { kim: teacher.short })}
                setSaid={setSaid}
                save={save(teacher.id)}
              >
                {t('E-postayla gönder')}
              </MailButton>
            )}
            {/* Only with a number: the place to type one is the person page. */}
            {wa !== null && (
              <WhatsappButton
                url={wa}
                name={`${teacher.short} · WhatsApp`}
                label={t('WhatsApp’la gönder')}
                save={save(teacher.id)}
                missing={() => undefined}
              />
            )}
          </li>
        ))}
      </ul>
      {noAddress.length > 0 && (
        <p className="hint">{t('{n} öğretmenin e-posta adresi yok.', { n: noAddress.length })}</p>
      )}
    </div>
  );
}
