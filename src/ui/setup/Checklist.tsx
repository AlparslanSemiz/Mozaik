// "Başlarken": the five tasks from an empty plan to a printed week, each
// ticked from the plan itself and each with a button that goes there.
//
// It replaced one sentence ("Sırayla: derslikler, branşlar, öğretmenler,
// sınıflar, sonra dersler") that disappeared the moment one teacher existed and
// never mentioned the school's name, its days or its bell — which live in the
// last tab and are the first thing a new term gets wrong. A list that ticks
// itself answers "what is left" without the reader having to remember what he
// did yesterday.
//
// Nothing here is a gate: every step is reachable from its tab at any time,
// the list only says where things stand. When every task is done, or when he
// closes it, it becomes one link that brings it back; folding keeps one line
// with the next task's button.

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, Circle, ListChecks, X } from 'lucide-react';
import { dayLabel } from '../../leaf/lang';
import type { State } from '../../leaf/model';
import { activePlacements } from '../../pure/grid';
import {
  CHECKLIST_REOPEN,
  readChecklist,
  writeChecklist,
  type ChecklistPref,
} from '../../platform/prefs';
import { GoButton, useT, type Place } from '../common';

interface Step {
  id: string;
  name: string;
  done: boolean;
  /** What stands there now, or what to do when nothing does. */
  detail: string;
  to: Place;
  /** The button's words: what is done there, never the bare tab name (pitfall 49). */
  action: string;
}

/** The five tasks, read from the plan. Exported for the unit test.
 *
 * Nine steps until 2026-11-16 (Sadeleşme, phase 1): the four lists and the
 * bell were five "steps" of one job, introducing the school, and nine cards
 * were nine things to read before the first click. A task is done when all of
 * it is; its button goes to the first part that is not. */
export function checklistSteps(d: State, printed: boolean, t: ReturnType<typeof useT>): Step[] {
  const days = d.settings.days;
  const first = days[0]?.name ?? '';
  const last = days[days.length - 1]?.name ?? '';
  const hours = d.settings.hours.length;
  const lessonHours = d.lessons.reduce((n, l) => n + l.weeklyHours, 0);
  const placed = Object.keys(activePlacements(d)).length;
  const closed = Object.keys(d.unavailable).length;
  const name = d.settings.schoolName.trim();
  const week = t('{ilk}–{son}, günde {saat} ders', {
    ilk: dayLabel(first),
    son: dayLabel(last),
    saat: hours,
  });

  // The school's first missing part, in the order the lists depend on each
  // other: a class names a room, a teacher picks a subject.
  const missing: Array<{ to: Place; action: string }> = [];
  if (name === '') {
    missing.push({
      to: { tab: 'settings', section: 'school' },
      action: t('Okul adını ve zili gir'),
    });
  }
  if (d.rooms.length === 0) {
    missing.push({ to: { tab: 'setup', step: 'rooms' }, action: t('Derslik ekle') });
  }
  if (d.settings.subjects.length === 0) {
    missing.push({ to: { tab: 'setup', step: 'subjects' }, action: t('Branş ekle') });
  }
  if (d.teachers.length === 0) {
    missing.push({ to: { tab: 'setup', step: 'teachers' }, action: t('Öğretmen ekle') });
  }
  if (d.classes.length === 0) {
    missing.push({ to: { tab: 'setup', step: 'classes' }, action: t('Sınıf ekle') });
  }
  const lists = t('{d} derslik · {b} branş · {o} öğretmen · {s} sınıf', {
    d: d.rooms.length,
    b: d.settings.subjects.length,
    o: d.teachers.length,
    s: d.classes.length,
  });
  const school = missing[0] ?? {
    to: { tab: 'settings', section: 'school' },
    action: t('Okul adını ve zili gir'),
  };

  return [
    {
      id: 'school',
      name: t('Okulu tanıt'),
      done: missing.length === 0,
      detail:
        name === ''
          ? t('Okul adı boş. Şu an: {hafta}. Doğru değilse değiştirin.', { hafta: week })
          : `${name} · ${week} · ${lists}`,
      to: school.to,
      action: school.action,
    },
    {
      id: 'lessons',
      name: t('Dersleri gir'),
      done: d.lessons.length > 0,
      detail: t('{ders} ders · {saat} saat', { ders: d.lessons.length, saat: lessonHours }),
      to: { tab: 'lessons' },
      action: t('Ders gir'),
    },
    {
      // Optional: a school where everyone can come every hour has nothing to
      // close. Placing the first lesson is taken as having passed it.
      id: 'availability',
      name: t('Gelemediği saatleri işaretle'),
      done: closed > 0 || placed > 0,
      detail:
        closed > 0
          ? t('{n} kapalı saat', { n: closed })
          : t('Herkes her saat gelebiliyorsa geçin.'),
      to: { tab: 'availability' },
      action: t('Kapalı saat işaretle'),
    },
    {
      id: 'solve',
      name: t('Programı yap'),
      done: placed > 0,
      detail: t('{yer} / {toplam} saat yerleşmiş', { yer: placed, toplam: lessonHours }),
      to: { tab: 'program' },
      action: t('Programı yap'),
    },
    {
      id: 'print',
      name: t('Yazdır'),
      done: printed,
      detail: printed
        ? t('Bu bilgisayarda bir kez yazdırıldı')
        : t('Sınıflara ve öğretmenlere birer sayfa'),
      to: { tab: 'print' },
      action: t('Çıktıya geç'),
    },
  ];
}

export function Checklist({ state, children }: { state: State; children?: React.ReactNode }) {
  const t = useT();
  // Read once and then owned here: the only writers are the three buttons
  // below and Çıktı's Yazdır, which is on another tab, so this mounts fresh
  // after it.
  const [pref, setPref] = useState<ChecklistPref>(readChecklist);
  useEffect(() => {
    const reopen = () => setPref(readChecklist());
    window.addEventListener(CHECKLIST_REOPEN, reopen);
    return () => window.removeEventListener(CHECKLIST_REOPEN, reopen);
  }, []);
  const steps = checklistSteps(state, pref.printed, t);
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  // Done, or closed: ONE line with the way back (it had none, TODO SD7). Asked
  // for again ("acik"), the whole list shows even when every task is done.
  // The first-run offers (`children`) outlive the list: closing it is not
  // declining the sample school.
  if ((next === undefined && pref.show !== 'acik') || pref.show === 'kapali') {
    return (
      <>
        <div className="checklist-link">
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              const value = { ...pref, show: 'acik' as const };
              setPref(value);
              writeChecklist(value);
            }}
          >
            <ListChecks size={16} aria-hidden="true" focusable="false" />
            {t('Başlarken listesini göster')}
          </button>
        </div>
        {children === undefined || children === false ? null : (
          <div className="panel">{children}</div>
        )}
      </>
    );
  }
  const step = next ?? steps[steps.length - 1]!;

  // Nobody has chosen yet: open on an empty plan, one line once lessons exist.
  const folded = pref.show === 'dar' || (pref.show === 'auto' && state.lessons.length > 0);
  const save = (show: ChecklistPref['show']) => {
    const value = { ...pref, show };
    setPref(value);
    writeChecklist(value);
  };

  const close = (
    <button
      type="button"
      className="btn quiet"
      title={t('Liste tek satıra iner; ? menüsündeki Başlarken onu geri getirir.')}
      onClick={() => save('kapali')}
    >
      <X size={16} aria-hidden="true" focusable="false" />
      {t('Listeyi kapat')}
    </button>
  );

  return (
    <section className="panel checklist" aria-label={t('Başlarken')}>
      <div className="checklist-head">
        <h2>{t('Başlarken')}</h2>
        <span className="checklist-count">
          {t('{n} / {toplam} adım', { n: doneCount, toplam: steps.length })}
        </span>
        {folded && (
          <span className="checklist-next">
            {t('Sıradaki: {adim}', { adim: step.name })}
            <GoButton to={step.to}>{step.action}</GoButton>
          </span>
        )}
        <span className="checklist-acts">
          <button
            type="button"
            className="btn quiet"
            aria-expanded={!folded}
            onClick={() => save(folded ? 'acik' : 'dar')}
          >
            {folded ? (
              <ChevronDown size={16} aria-hidden="true" focusable="false" />
            ) : (
              <ChevronUp size={16} aria-hidden="true" focusable="false" />
            )}
            {folded ? t('Listeyi göster') : t('Listeyi daralt')}
          </button>
          {close}
        </span>
      </div>
      {!folded && (
        <ol className="checklist-steps">
          {steps.map((s) => (
            <li
              key={s.id}
              className={s.done ? 'done' : s === next ? 'next' : undefined}
              data-step={s.id}
            >
              <span
                className="checklist-mark"
                role="img"
                aria-label={s.done ? t('yapıldı') : t('yapılmadı')}
              >
                {s.done ? (
                  <CircleCheck size={20} aria-hidden="true" focusable="false" />
                ) : (
                  <Circle size={20} aria-hidden="true" focusable="false" />
                )}
              </span>
              <span className="checklist-text">
                <strong>{s.name}</strong>
                <span className="checklist-detail">{s.detail}</span>
              </span>
              <GoButton to={s.to}>{s.action}</GoButton>
            </li>
          ))}
        </ol>
      )}
      {children}
    </section>
  );
}
