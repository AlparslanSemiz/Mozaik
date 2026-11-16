// The person page: one teacher, class or room, everything about it in the
// order the work is done — who it is, the hours it cannot come, its lessons,
// its limits — and the two things done with it, Yazdır and Gönder. Opened
// through `useInspect()` (Inspector.tsx).
//
// Since 2026-11-16 (Sadeleşme, K5) this is THE place a teacher or a class is
// edited. The Okul lists are text and open this; the boxes that used to sit
// on every row (name, short name, subject, second subject, gender, e-mail,
// colour, the limits) are here and nowhere else in Okul. The father thinks in
// people ("Ayşe Hoca salı gelemiyor") and the program used to file a person
// under six screens.

import {
  type Gender,
  type Id,
  type State,
  cleanEmail,
  cleanPhone,
  looksLikeEmail,
  whatsappNumber,
  paletteColor,
} from '../../leaf/model';
import { placedBlocks } from '../../pure/constraints';
import {
  type InspectKind,
  deleteClass,
  deleteTeacher,
  deletionNotice,
  entityFacts,
  entityWeek,
  genderCell,
  hourLabels,
  lessonSubject,
  setTeacherLimit,
  setWholeWeek,
  shortDay,
  subjectKey,
  subjectLabel,
  subjectOption,
  subjectOptions,
  transferLesson,
  updateClass,
  updateLesson,
  updateRoom,
  updateTeacher,
} from '../../pure/entities';
import {
  AvailGrid,
  ColorPick,
  LimitBox,
  T,
  useDialogs,
  useKeepBefore,
  useReturnFocus,
  useGoTo,
  useT,
  useToast,
  useUndoIf,
} from '../common';
import { PrintOne, SavePdf, SendTeacher } from '../print';
import * as Dialog from '@radix-ui/react-dialog';
import { Printer, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { GENDERS, NewClass, NewTeacher } from './NewPerson';
import { KIND_ICON } from './steps';

export interface Target {
  kind: InspectKind;
  /** Empty: a new teacher or class, not yet made ("+ Yeni öğretmen"). */
  id: string;
}

const KIND_LABEL: Record<InspectKind, string> = {
  teacher: 'Öğretmen',
  class: 'Sınıf',
  room: 'Derslik',
};

export function Inspector({
  state,
  change,
  target,
  open,
  onClose,
  colored,
}: {
  state: State;
  change: (apply: (d: State) => State, label?: string) => void;
  target: Target | null;
  /** Turns the page into another one: a new teacher's, once it is made. */
  open: (kind: InspectKind, id: Id) => void;
  onClose: () => void;
  /** Çıktı's "Renkli bas", for the page's own Yazdır. */
  colored: boolean;
}) {
  const t = useT();
  const returnFocus = useReturnFocus(target !== null);
  const { confirm } = useDialogs();
  const toast = useToast();
  const goTo = useGoTo();
  const undoIf = useUndoIf();
  const keepBefore = useKeepBefore();
  const [printing, setPrinting] = useState(false);
  const donePrinting = useCallback(() => setPrinting(false), []);
  const emailBox = useRef<HTMLInputElement>(null);
  const phoneBox = useRef<HTMLInputElement>(null);
  // Where the keyboard goes after Sil: the next person's name in the list,
  // because the one that opened this page is gone with the person.
  const afterDelete = useRef<HTMLElement | null>(null);

  // The RECORD behind the page, when there is one to edit.
  const teacherOf =
    target?.kind === 'teacher' ? state.teachers.find((x) => x.id === target.id) : undefined;
  const classOf =
    target?.kind === 'class' ? state.classes.find((x) => x.id === target.id) : undefined;
  const roomOf = target?.kind === 'room' ? state.rooms.find((x) => x.id === target.id) : undefined;
  const subjects = subjectOptions(state);
  const limits = state.settings.limits;

  /** The name as stored. The heading is not it: "320 sınıfı" is drawn around
      the name, and when the box held the heading, leaving it wrote "320
      sınıfı" back as the name (DENETIM DK1). */
  const storedName = teacherOf?.name ?? classOf?.name ?? roomOf?.name ?? '';

  /** Trimmed, and an empty name is refused rather than written: a nameless
      row is unfindable everywhere else. Leaving the box unchanged writes
      nothing, so it leaves no undo step behind either. */
  function rename(raw: string) {
    const name = raw.trim();
    if (name === '' || name === storedName) return;
    if (teacherOf !== undefined) change((d) => updateTeacher(d, teacherOf.id, { name }));
    else if (classOf !== undefined) change((d) => updateClass(d, classOf.id, { name }));
    else if (roomOf !== undefined) change((d) => updateRoom(d, roomOf.id, name));
  }

  /**
   * Hands one lesson to another teacher. Confirmed before it happens, because
   * the blocks that clash on the new teacher's week go back to the tray and
   * the dropdown cannot say how many; counted after, because the number is
   * what the reader has to act on next.
   */
  async function hand(lessonId: string, other: string, teacherId: string) {
    const to = state.teachers.find((x) => x.id === teacherId);
    const lesson = state.lessons.find((x) => x.id === lessonId);
    if (to === undefined || lesson === undefined) return;
    const placed = placedBlocks(state, lesson).length;
    if (
      !(await confirm({
        title: t('{ne} dersi {kim} öğretmenine geçecek', { ne: other, kim: to.short }),
        body:
          placed === 0
            ? t('Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.')
            : t(
                'Programdaki {n} ders yeni öğretmenin müsait saatlerine göre yeniden denenecek; sığmayanlar havuza döner.',
                { n: placed },
              ),
        confirmLabel: t('Aktar'),
      }))
    ) {
      return;
    }
    // The count comes from a preview on the state the reader is looking at: a
    // variable written inside the reducer callback is still 0 here, because
    // React runs that callback late (pitfall 20).
    const { returned } = transferLesson(state, lessonId, teacherId);
    change((d) => transferLesson(d, lessonId, teacherId).state);
    toast(
      returned === 0
        ? t('{ne} dersi {kim} öğretmenine geçti.', { ne: other, kim: to.short })
        : t('{ne} dersi {kim} öğretmenine geçti. {n} ders havuza döndü.', {
            ne: other,
            kim: to.short,
            n: returned,
          }),
    );
  }

  /** No question since SD1: the deletion happens, its notice says what went
      with it and offers "Geri al", and the state before it is kept. */
  function remove(kind: 'teacher' | 'class', id: Id) {
    const del = kind === 'teacher' ? deleteTeacher : deleteClass;
    const said = deletionNotice(state, kind, id);
    const next = del(state, id);
    const row = document.querySelector(`tr[data-person-id="${id}"]`);
    const sibling = row?.nextElementSibling ?? row?.previousElementSibling;
    afterDelete.current =
      sibling?.querySelector<HTMLElement>('.person-open') ??
      document.querySelector<HTMLElement>('.add-row');
    keepBefore(state, said);
    change((d) => (d === state ? next : del(d, id)), said);
    toast(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
    onClose();
  }

  // Recomputed only while the page is open: `entityWeek` walks every
  // placement, and the grid behind this must not pay for a closed page.
  const view = useMemo(() => {
    if (target === null || target.id === '') return null;
    const facts = entityFacts(state, target.kind, target.id);
    return facts === null ? null : { facts };
  }, [state, target]);
  // The laid-out week is folded, and its table is drawn only once it is
  // unfolded: opening the page has a 100 ms budget at 4x on the father's week.
  // The week itself is cheap and always read, because a lesson left on an hour
  // closed afterwards must be visible (pitfall 16): then the fold opens by
  // itself and a line under the closed hours says so. `null`: not touched.
  const [weekOpen, setWeekOpen] = useState<boolean | null>(null);
  // A new page starts folded and not printing: the sheet stays mounted from
  // one person to the next, and so would these (review, 2026-11-16).
  const [shown, setShown] = useState(target);
  if (shown !== target) {
    setShown(target);
    setWeekOpen(null);
    setPrinting(false);
  }
  const week = useMemo(
    () => (target !== null && target.id !== '' ? entityWeek(state, target.kind, target.id) : null),
    [state, target],
  );
  const stranded = week?.reduce((n, row) => n + row.filter((c) => c.conflict).length, 0) ?? 0;
  const showWeek = weekOpen ?? stranded > 0;

  const hours = hourLabels(state.settings.hours.length, state.settings.hours.join(','));
  const lessons =
    target === null
      ? []
      : state.lessons.filter((x) =>
          target.kind === 'teacher' ? x.teacherId === target.id : x.classId === target.id,
        );

  /** One limit and where its number comes from: the person's own, or the
      school's (Ayarlar → Kurallar). The person's wins. */
  const limitRow = (
    label: string,
    value: number | null,
    school: number,
    title: string,
    set: (v: number | null) => void,
  ) => (
    <>
      <dt>{label}</dt>
      <dd className="form-row">
        <LimitBox value={value} fallback={school} title={title} onSet={set} />
        <span className="hint">
          {value === null
            ? t('Okul ayarı geçerli: {n}', { n: school > 0 ? school : t('yok') })
            : t('Kendi sayısı; okul ayarı: {n}', { n: school > 0 ? school : t('yok') })}
        </span>
      </dd>
    </>
  );

  function body(target: Target) {
    if (target.id === '') {
      return target.kind === 'teacher' ? (
        <NewTeacher state={state} change={change} added={(id) => open('teacher', id)} />
      ) : (
        <NewClass state={state} change={change} added={(id) => open('class', id)} />
      );
    }
    if (view === null) return null;
    const who = teacherOf?.short ?? storedName;
    return (
      <>
        {/* The counted facts, first: they are what the page was opened to
            read before it could be edited. */}
        <dl className="sheet-facts">
          {view.facts.rows.map((row) => (
            <div key={row.label} className={row.tight ? 'tight' : undefined}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        {/* WHO. `defaultValue` + `onBlur` + a `key`, not a controlled box: a
            re-render on every keystroke takes the focus with it (pitfall 3),
            and the key makes the box forget its draft when another person is
            opened in the same page, or Ctrl+Z changes the value under it. */}
        <h3 className="sheet-h">{t('Bilgiler')}</h3>
        {/* The short form is the grid's row head: a clash is said where it is
            made, not only on the list behind the page. */}
        {teacherOf !== undefined &&
          state.teachers.some((x) => x.id !== teacherOf.id && x.short === teacherOf.short) && (
            <div className="warn-box">
              <T k="**Aynı kısa ad birden çok öğretmende:** ızgarada iki satır ayırt edilemez." />
            </div>
          )}
        <dl className="sheet-edit">
          <dt>{t('Ad')}</dt>
          <dd>
            <input
              type="text"
              className="dlg-input"
              aria-label={t('Ad')}
              key={`n-${target.id}-${storedName}`}
              defaultValue={storedName}
              onBlur={(e) => rename(e.target.value)}
            />
          </dd>

          {teacherOf !== undefined && (
            <>
              <dt>{t('Kısa ad')}</dt>
              <dd>
                <input
                  type="text"
                  className="text-sm"
                  aria-label={t('Kısa ad')}
                  key={`s-${teacherOf.id}-${teacherOf.short}`}
                  defaultValue={teacherOf.short}
                  onBlur={(e) => {
                    const short = e.target.value.trim();
                    if (short === '' || short === teacherOf.short) return;
                    change((d) => updateTeacher(d, teacherOf.id, { short }));
                  }}
                />
              </dd>

              <dt>{t('Branş')}</dt>
              <dd>
                <select
                  aria-label={t('Branş')}
                  value={teacherOf.subject}
                  onChange={(e) =>
                    change((d) => updateTeacher(d, teacherOf.id, { subject: e.target.value }))
                  }
                >
                  {subjects.map((x) => (
                    <option key={x} value={x}>
                      {subjectOption(state.settings, x)}
                    </option>
                  ))}
                </select>
              </dd>

              {/* Blank first, and that is how it is emptied again: a second
                  branch that can be added but not removed is a one-way door.
                  Clearing it also clears the flag on that teacher's lessons
                  (`sanitize()`). */}
              <dt>{t('2. branş')}</dt>
              <dd>
                <select
                  aria-label={t('2. branş')}
                  value={teacherOf.subject2}
                  onChange={(e) =>
                    change((d) => updateTeacher(d, teacherOf.id, { subject2: e.target.value }))
                  }
                >
                  <option value="">{t('Yok')}</option>
                  {subjects
                    .filter((x) => subjectKey(x) !== subjectKey(teacherOf.subject))
                    .map((x) => (
                      <option key={x} value={x}>
                        {subjectOption(state.settings, x)}
                      </option>
                    ))}
                </select>
              </dd>

              {/* Kept as typed (trimmed, control characters dropped:
                  cleanEmail); a box that does not hold one address says so
                  here, where it is fixed, and Gönder does not offer to send. */}
              <dt>{t('E-posta')}</dt>
              <dd>
                <input
                  ref={emailBox}
                  key={`e-${teacherOf.id}-${teacherOf.email}`}
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  spellCheck={false}
                  className="dlg-input"
                  aria-label={t('E-posta')}
                  defaultValue={teacherOf.email}
                  aria-invalid={teacherOf.email !== '' && !looksLikeEmail(teacherOf.email)}
                  title={
                    teacherOf.email !== '' && !looksLikeEmail(teacherOf.email)
                      ? t('Tek bir e-posta adresi yazılır: ad@ornek.com')
                      : undefined
                  }
                  onBlur={(e) => {
                    const email = cleanEmail(e.target.value);
                    // Tabbing through is not an edit, and not an undo step.
                    if (email === teacherOf.email) return;
                    change((d) => updateTeacher(d, teacherOf.id, { email }));
                  }}
                />
              </dd>

              {/* For WhatsApp (v18). Kept as typed, only what a number is
                  written with (`cleanPhone`); one WhatsApp cannot read says
                  so here, where it is fixed. */}
              <dt>{t('Telefon')}</dt>
              <dd>
                <input
                  ref={phoneBox}
                  key={`p-${teacherOf.id}-${teacherOf.phone}`}
                  type="text"
                  inputMode="tel"
                  autoComplete="off"
                  className="dlg-input"
                  aria-label={t('Telefon')}
                  defaultValue={teacherOf.phone}
                  aria-invalid={teacherOf.phone !== '' && whatsappNumber(teacherOf.phone) === null}
                  onBlur={(e) => {
                    const phone = cleanPhone(e.target.value);
                    if (phone === teacherOf.phone) return;
                    change((d) => updateTeacher(d, teacherOf.id, { phone }));
                  }}
                />
              </dd>

              <dt>{t('Cinsiyet')}</dt>
              <dd>
                <select
                  aria-label={t('Cinsiyet')}
                  value={teacherOf.gender}
                  onChange={(e) =>
                    change((d) =>
                      updateTeacher(d, teacherOf.id, { gender: e.target.value as Gender }),
                    )
                  }
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {genderCell(g)}
                    </option>
                  ))}
                </select>
              </dd>
            </>
          )}

          {classOf !== undefined && (
            <>
              <dt>{t('Derslik')}</dt>
              <dd>
                <select
                  aria-label={t('Derslik')}
                  value={classOf.roomId ?? ''}
                  onChange={(e) =>
                    change((d) =>
                      updateClass(d, classOf.id, {
                        roomId: e.target.value === '' ? null : e.target.value,
                      }),
                    )
                  }
                >
                  <option value="">{t('Derslik yok')}</option>
                  {state.rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </dd>
            </>
          )}

          {(teacherOf ?? classOf) !== undefined && (
            <>
              <dt>{t('Renk')}</dt>
              <dd>
                <ColorPick
                  value={(teacherOf ?? classOf)!.color}
                  owner={who}
                  onChange={(color) =>
                    change((d) =>
                      teacherOf !== undefined
                        ? updateTeacher(d, teacherOf.id, { color })
                        : updateClass(d, classOf!.id, { color }),
                    )
                  }
                />
              </dd>
            </>
          )}
        </dl>

        {roomOf !== undefined && (
          <ul className="sheet-links">
            {view.facts.links.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {/* THE HOURS IT CANNOT COME, the Müsaitlik grid itself, with the bell
            times on: "Ayşe Hoca salı 10:10'da gelemiyor" is said in clock
            times, not lesson numbers. Its own heading names it per kind. */}
        <h3 className="sheet-h">
          {target.kind === 'teacher' ? t('Gelemediği saatler') : t('Kapalı saatler')}
        </h3>
        {/* Müsaitlik's own sentence, and its tooltip for dragging and the
            headers: one wording for one grid in two places. */}
        <p
          className="hint"
          title={t(
            'Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki saat numarasına tıklayınca haftanın o saati değişir.',
          )}
        >
          {target.kind === 'teacher'
            ? t('Öğretmenin müsait olmadığı saatlere tıklayın.')
            : target.kind === 'class'
              ? t('Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.')
              : t(
                  'Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.',
                )}
        </p>
        <AvailGrid
          key={target.id}
          state={state}
          change={change}
          entityId={target.id}
          teacher={target.kind === 'teacher'}
          clock
          label={
            target.kind === 'teacher'
              ? t('{kim} · müsait olmayan saatler', { kim: storedName })
              : t('{kim} · kapalı saatler', { kim: view.facts.name })
          }
        />
        {/* Müsaitlik's two whole-week buttons came here with its grid (K1,
            2026-11-16): somebody who comes one day a week is closed in two
            clicks, not seventy. */}
        <div className="form-row">
          <button className="btn" onClick={() => change((d) => setWholeWeek(d, target.id, false))}>
            {t('Bütün haftayı aç')}
          </button>
          <button className="btn" onClick={() => change((d) => setWholeWeek(d, target.id, true))}>
            {t('Bütün haftayı kapat')}
          </button>
        </div>
        {stranded > 0 && (
          <div className="warn-box">
            {t('Kapattığınız saatlerde {n} ders kaldı; silinmedi, haftalık programda kırmızı.', {
              n: stranded,
            })}
          </div>
        )}

        {/* "Öğretmenin bilgisine girip bir sınıfı başka bir hocaya aktarma
            olsun." A teacher's rows move the CLASS to another teacher, a
            class's rows move the TEACHER of one lesson. Not "Dersleri": that
            is a substring of the Dersler tab's name, and `getByRole(name:)`
            matches substrings (pitfalls 49 and 74). */}
        {target.kind !== 'room' && (
          <>
            <h3 className="sheet-h">
              {target.kind === 'teacher' ? t('Verdiği dersler') : t('Aldığı dersler')}
            </h3>
            {/* Where this person's lessons are ENTERED: the lesson form of
                its tab, open on this person (K1). Closing the page first,
                because the form is under it. */}
            <p>
              <button
                className="btn"
                onClick={() => {
                  onClose();
                  goTo({
                    tab: target.kind === 'teacher' ? 'teachers' : 'classes',
                    people: 'lessons',
                    focus: target.id,
                  });
                  // The name that opened this page is gone with the list, so
                  // the keyboard goes where the work now is: the form's first
                  // box. After the sheet's own close has run.
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLElement>(
                          'main .add-panel select:not(:disabled), main .add-panel input:not(:disabled)',
                        )
                        ?.focus(),
                    ),
                  );
                }}
              >
                {t('Ders gir')}
              </button>
            </p>
            {lessons.length > 0 && (
              <table className="sheet-lessons">
                <tbody>
                  {lessons.map((x) => {
                    const group = state.classes.find((c) => c.id === x.classId);
                    const teacher = state.teachers.find((p) => p.id === x.teacherId);
                    // The short form names the lesson in sentences and
                    // controls; the row reads the full name (Sadeleşme).
                    const other =
                      target.kind === 'teacher' ? (group?.name ?? '?') : (teacher?.short ?? '?');
                    return (
                      <tr key={x.id}>
                        <td>{target.kind === 'teacher' ? other : (teacher?.name ?? '?')}</td>
                        <td className="hint">{subjectLabel(lessonSubject(state, x))}</td>
                        <td className="num">
                          <input
                            type="number"
                            min={1}
                            max={40}
                            className="num"
                            key={`h-${x.id}-${x.weeklyHours}`}
                            // Two lessons of one teacher in one class are told
                            // apart by their subject (2026-11-16).
                            aria-label={t('{ne} · Haftalık saat', {
                              ne: lessons.some(
                                (y) =>
                                  y !== x &&
                                  (target.kind === 'teacher'
                                    ? y.classId === x.classId
                                    : y.teacherId === x.teacherId),
                              )
                                ? `${other} · ${subjectLabel(lessonSubject(state, x))}`
                                : other,
                            })}
                            defaultValue={x.weeklyHours}
                            onBlur={(e) => {
                              const weeklyHours = Math.max(1, Number(e.target.value) || 1);
                              if (weeklyHours === x.weeklyHours) return;
                              change((d) => updateLesson(d, x.id, { weeklyHours }));
                            }}
                          />{' '}
                          {t('saat')}
                        </td>
                        <td>
                          <TransferPick
                            state={state}
                            from={x.teacherId}
                            label={t('{ne} dersini başka öğretmene aktar', { ne: other })}
                            pick={(id) => void hand(x.id, other, id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* LIMITS, in the one place a person's limit is written (Sadeleşme,
            K5: it was in four). Empty is the school's number, and the line
            beside each box says which of the two is in force. */}
        {(teacherOf ?? classOf) !== undefined && (
          <>
            <h3 className="sheet-h">{t('Sınırları')}</h3>
            {/* One sentence for both kinds. A class's number has a third
                layer, the lesson's own box in Dersler; that box's own help
                says so where it is set. */}
            <p className="hint">
              {t('Boş kutu okul ayarını kullanır; yazılan sayı onun yerine geçer.')}
            </p>
            <dl className="sheet-edit">
              {teacherOf !== undefined ? (
                <>
                  {limitRow(
                    t('Art arda en fazla'),
                    teacherOf.limits.maxConsecutive,
                    limits.maxConsecutive,
                    t('{kim} art arda en fazla kaç saat', { kim: who }),
                    (v) => change((d) => setTeacherLimit(d, teacherOf.id, 'maxConsecutive', v)),
                  )}
                  {limitRow(
                    t('Günde en fazla'),
                    teacherOf.limits.maxPerDay,
                    limits.maxPerDay,
                    t('{kim} günde en fazla kaç saat', { kim: who }),
                    (v) => change((d) => setTeacherLimit(d, teacherOf.id, 'maxPerDay', v)),
                  )}
                  {limitRow(
                    t('Geldiği gün en az'),
                    teacherOf.limits.minPerDay,
                    limits.minPerDay,
                    t('{kim} geldiği gün en az kaç saat', { kim: who }),
                    (v) => change((d) => setTeacherLimit(d, teacherOf.id, 'minPerDay', v)),
                  )}
                </>
              ) : (
                limitRow(
                  t('Günde aynı dersten en fazla'),
                  classOf!.maxSameLessonPerDay,
                  limits.maxSameLessonPerDay,
                  t('{ad} bir günde aynı dersten en fazla kaç saat', { ad: who }),
                  (v) => change((d) => updateClass(d, classOf!.id, { maxSameLessonPerDay: v })),
                )
              )}
            </dl>
          </>
        )}

        {/* Its week as laid out, folded: the page is for changing the
            person, and the grid behind it already shows the week. Row = day,
            column = lesson, the way Müsaitlik and the printed sheet read. */}
        <details
          className="sheet-more"
          open={showWeek}
          onToggle={(e) => setWeekOpen(e.currentTarget.open)}
        >
          <summary>{t('Haftalık programı')}</summary>
          {week !== null && showWeek && (
            <div className="scroll-x">
              <table className="sheet-week">
                <thead>
                  <tr>
                    <th>
                      <span className="visually-hidden">{t('Gün')}</span>
                    </th>
                    {hours.map((label, h) => (
                      <th key={h}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {week.map((row, day) => (
                    <tr key={day}>
                      <th>{shortDay(state.settings.days[day]?.name ?? '')}</th>
                      {row.map((cell, hour) => (
                        <td
                          key={hour}
                          className={[
                            cell.color === null && cell.closed ? 'unavailable' : '',
                            cell.conflict ? 'conflict' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={
                            cell.color === null
                              ? undefined
                              : { background: paletteColor(cell.color) }
                          }
                          title={cell.top === '' ? undefined : `${cell.top} ${cell.bottom}`}
                        >
                          {cell.top !== '' && (
                            <>
                              <span className="sheet-cell-top">{cell.top}</span>
                              <span className="sheet-cell-bottom">{cell.bottom}</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </details>

        {target.kind !== 'room' && (
          <div className="form-row sheet-foot">
            <button
              className="btn danger"
              onClick={() => remove(target.kind === 'teacher' ? 'teacher' : 'class', target.id)}
            >
              <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
              {target.kind === 'teacher' ? t('Öğretmeni sil') : t('Sınıfı sil')}
            </button>
          </div>
        )}
      </>
    );
  }

  const fresh = target !== null && target.id === '';
  const missing = target !== null && !fresh && view === null;
  const printable = target !== null && !fresh && !missing && target.kind !== 'room';

  return (
    <Dialog.Root open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content
          className="sheet"
          aria-describedby={undefined}
          // Into the page, not onto its first button: that is Yazdır, and an
          // Enter meant for the list would print. A new page's name box takes
          // the focus itself (`autoFocus`).
          onOpenAutoFocus={(e) => {
            if (fresh) return;
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
          onCloseAutoFocus={(e) => {
            const next = afterDelete.current;
            afterDelete.current = null;
            if (next?.isConnected === true) {
              e.preventDefault();
              next.focus();
              return;
            }
            returnFocus(e);
          }}
        >
          {target === null ? null : (
            <>
              <div className="sheet-head">
                <span
                  className="sheet-mark"
                  style={
                    view === null || view.facts.color === null
                      ? undefined
                      : { background: paletteColor(view.facts.color) }
                  }
                  aria-hidden="true"
                >
                  {view === null || view.facts.color === null
                    ? KIND_ICON[target.kind]
                    : view.facts.short}
                </span>
                <div className="sheet-id">
                  <Dialog.Title className="sheet-title">
                    {fresh
                      ? target.kind === 'teacher'
                        ? t('Yeni öğretmen')
                        : t('Yeni sınıf')
                      : missing
                        ? t('Kayıt bulunamadı')
                        : view!.facts.name}
                  </Dialog.Title>
                  <span className="sheet-kind">{t(KIND_LABEL[target.kind])}</span>
                </div>
                {printable && (
                  <div className="sheet-actions">
                    <button className="btn" onClick={() => setPrinting(true)}>
                      <Printer size={16} strokeWidth={2} aria-hidden="true" />
                      {t('Yazdır')}
                    </button>
                    {teacherOf !== undefined && (
                      <SendTeacher
                        key={teacherOf.id}
                        state={state}
                        teacher={teacherOf}
                        colored={colored}
                        onMissing={(box) =>
                          (box === 'phone' ? phoneBox : emailBox).current?.focus()
                        }
                      />
                    )}
                    {target.kind === 'class' && (
                      <SavePdf key={target.id} state={state} id={target.id} colored={colored} />
                    )}
                  </div>
                )}
                <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
                  <X size={18} strokeWidth={2.2} />
                </Dialog.Close>
              </div>
              {body(target)}
              {printing && printable && (
                <PrintOne
                  state={state}
                  kind={target.kind === 'teacher' ? 'teacher' : 'class'}
                  id={target.id}
                  colored={colored}
                  done={donePrinting}
                />
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * "Başka öğretmene aktar…" on one lesson. Its options are drawn the first time
 * the pointer or the keyboard reaches it: eleven lessons times eighteen
 * teachers was a fifth of the page's opening time at 4x, for lists nobody had
 * looked at yet. Its width is fixed so that drawing them moves nothing.
 */
function TransferPick({
  state,
  from,
  label,
  pick,
}: {
  state: State;
  from: Id;
  label: string;
  pick: (teacherId: Id) => void;
}) {
  const t = useT();
  const [armed, setArmed] = useState(false);
  return (
    <select
      className="transfer-pick"
      value=""
      aria-label={label}
      onPointerEnter={() => setArmed(true)}
      onFocus={() => setArmed(true)}
      onChange={(e) => {
        if (e.target.value !== '') pick(e.target.value);
      }}
    >
      <option value="">{t('Başka öğretmene aktar…')}</option>
      {armed &&
        state.teachers
          .filter((p) => p.id !== from)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.short} · {p.name}
            </option>
          ))}
    </select>
  );
}
