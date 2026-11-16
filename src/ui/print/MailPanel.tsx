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
import { useT } from '../common';
import { openWhatsapp, savePdf, whatsappLink } from './send';

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

type Said = EpostaSonucu | 'tarayici' | null;

/** The name of the PDF just saved. */
type Saved = string | null;

/** What happened after a press. */
function MailSaid({ said, saved }: { said: Said; saved: Saved }) {
  const t = useT();
  return (
    <>
      {saved !== null && (
        <p className="hint sheet-said" role="status">
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
  save: () => void;
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
  save,
  missing,
}: {
  url: string | null;
  name?: string;
  save: () => void;
  missing: () => void;
}) {
  return (
    <button
      className="btn"
      aria-label={name}
      onClick={() => {
        if (url === null) return missing();
        save();
        openWhatsapp(url);
      }}
    >
      <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
      WhatsApp
    </button>
  );
}

/** The person page's PDF kaydet, for a class: the same file a teacher is sent. */
export function SavePdf({ state, id, colored }: { state: State; id: string; colored: boolean }) {
  const t = useT();
  const [saved, setSaved] = useState<Saved>(null);
  return (
    <>
      <button className="btn" onClick={() => setSaved(savePdf(state, 'class', id, colored, t))}>
        <FileDown size={16} strokeWidth={2} aria-hidden="true" />
        {t('PDF kaydet')}
      </button>
      <MailSaid said={null} saved={saved} />
    </>
  );
}

/**
 * The person page's Gönder and WhatsApp: the same message as the Çıktı row,
 * or, when there is none, the one sentence that says how to get one. Pressed
 * without an address or a number it also puts the keyboard in that box
 * (`onMissing`).
 */
export function SendTeacher({
  state,
  teacher,
  colored,
  onMissing,
}: {
  state: State;
  teacher: Teacher;
  colored: boolean;
  onMissing: (box: 'email' | 'phone') => void;
}) {
  const t = useT();
  const [said, setSaid] = useState<Said>(null);
  const [saved, setSaved] = useState<Saved>(null);
  const [asked, setAsked] = useState<Why | 'telefon' | null>(null);
  const { why, url } = useMemo(
    () => mailFor(state, buildIndex(state), blockSpans(state), teacher, t),
    [state, teacher, t],
  );
  const save = () => {
    setAsked(null);
    setSaved(savePdf(state, 'teacher', teacher.id, colored, t));
  };
  return (
    <>
      {why === null ? (
        <MailButton url={url} setSaid={setSaid} save={save}>
          {t('Gönder')}
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
          {t('Gönder')}
        </button>
      )}
      <WhatsappButton
        url={whatsappLink(teacher, t)}
        save={save}
        missing={() => {
          setSaved(null);
          setAsked('telefon');
          onMissing('phone');
        }}
      />
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
    </>
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
  const save = (id: string) => () => setSaved(savePdf(state, 'teacher', id, colored, t));

  return (
    <div className="panel no-print mail-panel">
      <h2>{t('E-postayla gönder')}</h2>
      <p className="hint">
        {t(
          'Öğretmenin programı e-posta uygulamanızda yeni bir ileti olarak açılır. Gönder’e siz basarsınız.',
        )}
      </p>
      {/* Above the list: the row pressed may be the first of twenty-five. */}
      <MailSaid said={said} saved={saved} />
      <ul className="mail-list">
        {rows.map(({ teacher, why, url, wa }) => (
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
                save={save(teacher.id)}
              >
                {t('E-postada aç')}
              </MailButton>
            )}
            {/* Only with a number: the place to type one is the person page. */}
            {wa !== null && (
              <WhatsappButton
                url={wa}
                name={`${teacher.short} · WhatsApp`}
                save={save(teacher.id)}
                missing={() => undefined}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
