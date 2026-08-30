// The right-hand column of the setup screen.
//
// Every one of these numbers already existed — in the Kontrol tab, one whole
// screen away, and only AFTER everything had been typed in. The bottleneck that
// decides whether a week is possible at all (four classes in one room) was the
// thing this tool calls "the most overlooked" in its own code, and it was
// invisible while you were creating those four classes.
//
// Nothing is computed here: `buildCapacity` is the cheap half of the existing
// report (feasibility.ts), split out precisely so it can run beside a text box
// without paying for buildReport's 99 x 72 blocker() calls (pitfall 3).

import { useMemo } from 'react';
import { buildCapacity } from '../../feasibility';
import CapacityRows from '../CapacityRows';
import {
  DEFAULT_SUBJECT_SHORTS,
  addSubject,
  builtInShort,
  respreadColors,
  genderLabel,
  roomClasses,
  subjectKey,
  subjectOptions,
  subjectTeachers,
  subjectLabel,
} from '../../entities';
import type { StepId } from '../../toolState';

/**
 * The four Okul steps, plus the one screen outside Okul that reads this panel:
 * Dersler → Genel, whose rail would otherwise be empty and whose question is
 * exactly the one the fallback branch answers ("does each class's week fit").
 */
export type SummaryView = StepId | 'lessons';
import type { Gender } from '../../types';

/** The three values, in the order the teacher list offers them. */
const GENDERS: Gender[] = ['', 'k', 'e'];
import type { State } from '../../types';
import { T, useT } from '../T';

/**
 * Colour repair, offered where the colours are CHOSEN.
 *
 * This was a panel in Ayarlar → Veri, three tabs from the swatch it repairs.
 * A colour is an identity here, not decoration — the grid row, the pool card
 * and the printed sheet all read it.
 *
 * Drawn only when redistributing would actually CHANGE something, which is
 * exactly `respreadColors`'s own contract: it hands out 0..n-1 in list order,
 * so if that is already what the list wears there is nothing to offer. On a
 * healthy project this panel is not there at all, which is the point — the
 * right-hand column had two panels and one of them was furniture.
 */
function Colors({
  state,
  change,
  kind,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  kind: 'teacher' | 'class';
}) {
  const t = useT();
  const rows = kind === 'teacher' ? state.teachers : state.classes;
  if (!rows.some((x, i) => x.color !== i)) return null;

  const noun = kind === 'teacher' ? 'öğretmen' : 'sınıf';
  // Two different faults with one repair. A duplicate is a real problem — two
  // people wearing one identity — so it is a warning. A gap is only untidy.
  const clashes = rows.length - new Set(rows.map((x) => x.color)).size;
  return (
    <>
      <h3>{t('Renkler')}</h3>
      {clashes > 0 ? (
        <div className="warn-box">
          <T
            k="**{n} {ne} başkasıyla aynı renkte.** Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor."
            vars={{ n: clashes, ne: t(noun) }}
          />
        </div>
      ) : (
        <p className="hint">
          {t('Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.')}
        </p>
      )}
      <div className="form-row">
        <button className="btn" onClick={() => change((d) => respreadColors(d, kind))}>
          {kind === 'teacher'
            ? t('Öğretmen renklerini yeniden dağıt ({n})', { n: rows.length })
            : t('Sınıf renklerini yeniden dağıt ({n})', { n: rows.length })}
        </button>
      </div>
    </>
  );
}

export default function Summary({
  state,
  change,
  step,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  step: SummaryView;
}) {
  const t = useT();
  const capacity = useMemo(() => buildCapacity(state), [state]);

  if (step === 'subjects') {
    // The built-in table the short forms come from. Anything already on the
    // school's list is not on offer; what is left is one click away instead of
    // being retyped — and typed-in names are exactly how "Matemtik" was born.
    const options = subjectOptions(state);
    const ready = Object.keys(DEFAULT_SUBJECT_SHORTS).filter(
      (name) => !options.some((x) => subjectKey(x) === subjectKey(name)),
    );
    const unused = options.filter((x) => subjectTeachers(state, x).length === 0);
    return (
      <div className="panel">
        <h2>{t('Özet')}</h2>
        <h3>{t('Hazır branşlar ({n})', { n: ready.length })}</h3>
        <p className="hint">
          <T k="Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın." />
        </p>
        {ready.length === 0 ? (
          <div className="ok-box">{t('Gömülü tablodaki branşların hepsi listenizde.')}</div>
        ) : (
          <>
            <div className="form-row">
              <button
                className="btn"
                title={t('Gömülü tablodaki bütün branşları listeye ekler')}
                onClick={() =>
                  change((d) => ready.reduce((acc, name) => addSubject(acc, name), d))
                }
              >{t('Hepsini ekle')}</button>
            </div>
            <div className="stat-scroll">
              <table className="stat">
                <tbody>
                  {ready.map((name) => (
                    <tr key={name}>
                      <td>{subjectLabel(name)}</td>
                      <td className="num">{builtInShort(name)}</td>
                      <td>
                        {/* Not "Ekle": the add form on the LEFT of this screen
                            has a button by that name, and `getByRole(name:)`
                            would then be ambiguous across the two (pitfall 49). */}
                        <button
                          className="btn"
                          title={t('{ad} branşını listeye ekler', { ad: subjectLabel(name) })}
                          onClick={() => change((d) => addSubject(d, name))}
                        >{t('Listeye ekle')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {/* `data-hint` below: what makes that hint long is DATA, not prose —
            it names every unused subject, so its length is the school's and
            not a paragraph nobody trimmed. The ceiling in metin.spec.ts skips
            these, and marking them is what keeps the ceiling honest. The
            comment is OUTSIDE the condition: between `{cond && (` and the
            element it is an object literal, not a comment (pitfall 62). */}
        {unused.length > 0 && (
          <p className="hint data-hint">
            {t('Hiçbir öğretmende kullanılmayan {n} branş var: {hangileri}. Silinebilirler.', {
              n: unused.length,
              hangileri: unused.map(subjectLabel).join(', '),
            })}
          </p>
        )}
      </div>
    );
  }

  if (step === 'rooms') {
    const homeless = state.classes.filter((c) => c.roomId == null);
    return (
      <div className="panel">
        <h2>{t('Özet')}</h2>
        {/* WHAT IS WRONG COMES FIRST. These boxes used to be written after the
            capacity table and after the list under it, i.e. below the fold on
            the one screen whose job is to say something is missing. Nothing is
            drawn at all when there is nothing wrong — the panel has no
            "problems" heading to leave behind. */}
        {homeless.length > 0 && (
          <div className="warn-box">
            <b>{homeless.length} sınıfın dersliği yok</b> ({homeless.map((c) => c.name).join(', ')}
            ). Derslik çakışması onlar için hiç kontrol edilmez.
          </div>
        )}
        <h3>{t('Derslik yükü')}</h3>
        <p className="hint">
          <T k="Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı." />
        </p>
        <CapacityRows rows={capacity.rooms} empty={t('Henüz derslik yok.')} problemsFirst />
        {state.rooms.length > 0 && (
          <>
            <h3>{t('Hangi sınıflar')}</h3>
            <ul className="plain-list">
              {state.rooms.map((r) => {
                const inside = roomClasses(state, r.id);
                return (
                  <li key={r.id}>
                    <b>{r.name}</b>:{' '}
                    {inside.length === 0
                      ? t('sınıf yok')
                      : t('{n} sınıf: {hangileri}', {
                          n: inside.length,
                          hangileri: inside.map((c) => c.name).join(', '),
                        })}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (step === 'teachers') {
    // In the school's own order (Ayarlar > Branşlar), then whatever a teacher
    // carries that the list does not — `subjectOptions` already answers exactly
    // that. It used to be `usedSubjects`, i.e. the order the teachers happened
    // to be typed in, which is an order nobody chose and nobody can change.
    const subjects = subjectOptions(state).filter((name) => subjectTeachers(state, name).length > 0);
    // Counted, not estimated — and the blank is counted too, because the
    // number worth seeing is how many rows are still to be filled in.
    const byGender = GENDERS.map((g) => ({
      label: genderLabel(g),
      count: state.teachers.filter((x) => x.gender === g).length,
    })).filter((x) => x.count > 0);
    return (
      <div className="panel">
        <h2>{t('Özet')}</h2>
        <h3>{t('Öğretmen yükü')}</h3>
        <p className="hint">
          <T k="Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz." />
        </p>
        {/* Above the table, not below it: under twenty-five rows this line is
            a screen away from the heading it belongs to. */}
        {byGender.length > 1 && (
          <p className="hint">
            {byGender.map((x, i) => (
              <span key={x.label}>
                {i > 0 && ' · '}
                <b>{x.label}</b> {x.count}
              </span>
            ))}
          </p>
        )}
        <CapacityRows rows={capacity.teachers} empty={t('Henüz öğretmen yok.')} problemsFirst />
        {subjects.length > 0 && (
          <>
            <h3>{t('Branşlar ({n})', { n: subjects.length })}</h3>
            <ul className="plain-list">
              {subjects.map((name) => (
                <li key={name}>
                  <T
                    k="**{ad}**: {n} öğretmen"
                    vars={{ ad: subjectLabel(name), n: subjectTeachers(state, name).length }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
        <Colors state={state} change={change} kind="teacher" />
      </div>
    );
  }

  if (step === 'classes') {
    const noLesson = state.classes.filter((c) => !state.lessons.some((x) => x.classId === c.id));
    const slots = state.settings.days.length * state.settings.hours.length;
    const weekly = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
    return (
      <div className="panel">
        <h2>{t('Özet')}</h2>
        {/* Above the table, like the room step's: the only warning that a class
            was created and then forgotten should not be under twenty rows. */}
        {noLesson.length > 0 && (
          <div className="warn-box">
            <T
              k="**{n} sınıfın hiç dersi yok** ({hangileri})."
              vars={{ n: noLesson.length, hangileri: noLesson.map((c) => c.name).join(', ') }}
            />
          </div>
        )}
        <h3>{t('Sınıf yükü')}</h3>
        <p className="hint">
          <T k="Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı." />
        </p>
        <CapacityRows rows={capacity.classes} empty={t('Henüz sınıf yok.')} problemsFirst />
        {/* The one number that decides whether any of this can be laid out at
            all. It outlived the "Kurulum durumu" panel it used to sit in. */}
        {state.classes.length > 0 && (
          <p className="hint">
            <T
              k="Sınıf başına **{yer}** saat var ({gun} gün × {ders} ders); girilen yük **{yuk}** saat."
              vars={{
                yer: slots,
                gun: state.settings.days.length,
                ders: state.settings.hours.length,
                yuk: weekly,
              }}
            />
          </p>
        )}
        <Colors state={state} change={change} kind="class" />
      </div>
    );
  }

  const noLesson = state.classes.filter(
    (c) => !state.lessons.some((x) => x.classId === c.id),
  );
  const idleTeachers = state.teachers.filter(
    (x) => !state.lessons.some((l) => l.teacherId === x.id),
  );
  return (
    <div className="panel">
      <h2>{t('Özet')}</h2>
      {noLesson.length > 0 && (
        <div className="warn-box">
          <T
            k="**{n} sınıfın hiç dersi yok** ({hangileri})."
            vars={{ n: noLesson.length, hangileri: noLesson.map((c) => c.name).join(', ') }}
          />
        </div>
      )}
      <h3>{t('Ders yükü')}</h3>
      <p className="hint">
        <T k="**Yük**, **Açık**'ı geçerse o sınıfın haftası tutmaz." />
      </p>
      <CapacityRows rows={capacity.classes} empty={t('Henüz sınıf yok.')} problemsFirst />
      {idleTeachers.length > 0 && (
        <p className="hint data-hint">
          {t('Hiç dersi olmayan öğretmen: {kimler}.', {
            kimler: idleTeachers.map((x) => x.short).join(', '),
          })}
        </p>
      )}
    </div>
  );
}
