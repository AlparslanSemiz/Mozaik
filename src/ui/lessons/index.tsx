// The Dersler tab: one lesson = one class taking N weekly hours from one
// teacher.
//
// It was step FOUR of Kurulum until this round, and the reader said why that
// was wrong: "Ders ekleme tarafı çok daha pratik hale getirilmeli, neden?
// Çünkü hocaları onu bunu ayarlıyorsun ama DERS EN ÖNEMLİ KISIM." Rooms,
// teachers and classes are filled in once a term; this screen is the one that
// gets used, and as a step it could only be reached through a wizard.
//
// THE FORM DROPS AN AXIS. Entering eight lessons for one class meant choosing
// that class eight times — and the old form reset exactly the field worth
// keeping. Now the ribbon says which way round the entry runs, the right-hand
// column picks the one entity, and the form asks only for what changes from
// lesson to lesson.
//
// A block is not a separate entity: the whole shape of the week is `pairs`
// here, and `src/blocks.ts` turns that one number into "2+2+1". The dropdown
// beside the hours is the aSc "Lessons/week + Single" pair the reader asked
// for by name: pick the total first, then how it falls apart.

import { useEffect, useMemo, useState } from 'react';
import { type Id, type State } from '../../leaf/model';
import { applyList, EMPTY_QUERY, type ListQuery } from '../../pure/listview';
import type { LessonMode } from '../../platform/prefs';
import { useT } from '../common';
import { teacherSubjects } from '../../pure/entities';
import { Summary, ListTools, useRowOrder } from '../lists';
import { lessonListConfig } from '../../pure/lists';
import { LessonForm } from './LessonForm';
import { LessonRow } from './LessonRow';
import { LessonPicker } from './LessonPicker';

interface Props {
  state: State;
  change: (fn: (d: State) => State, label?: string) => void;
  mode: LessonMode;
  focus: Id;
  setFocus: (next: Id) => void;
}

export default function Lessons({ state, change, mode, focus, setFocus }: Props) {
  const t = useT();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  // Whose lessons this screen is filling in. '' means "the first one", the same
  // convention Müsaitlik's `chosen` uses — an id that is remembered across a
  // tab switch must not go stale when the list it points into changes.
  const picking = mode === 'teacher' ? state.teachers : state.classes;
  const focused = picking.find((x) => x.id === focus) ?? picking[0];

  // WHAT the open teacher teaches, for the heading. `teacherSubjects` is the
  // one place that answers this (src/subjects.ts): it trims, drops the empty
  // second slot and folds a name written twice into one, so "Türkçe / Türkçe"
  // is not a thing the heading can say.
  const focusedSubjects =
    mode === 'teacher' && focused !== undefined && 'subject' in focused
      ? teacherSubjects(focused).join(' · ')
      : '';

  // The ribbon already fixes one axis in the focused modes. If that same axis
  // remains in the facet row it offers a single chip that cannot narrow
  // anything. Drop its old value too, otherwise `isFiltering()` would keep the
  // list locked even though the filter that caused it is no longer visible.
  useEffect(() => {
    const hiddenFacet = mode === 'teacher' ? 'ogretmen' : mode === 'class' ? 'sinif' : null;
    if (hiddenFacet === null) return;
    setQuery((current) => {
      if (!(hiddenFacet in current.facets)) return current;
      const facets = { ...current.facets };
      delete facets[hiddenFacet];
      return { ...current, facets };
    });
  }, [mode]);

  // Ninety-nine rows, and every one of them is a pair. Searching has to see
  // both halves of the pair and the teacher's SHORT form, because the short
  // form is what the grid says and therefore what gets remembered.
  const listCfg = useMemo(() => lessonListConfig(state, mode, t), [state, mode, t]);

  // The rows this screen is ABOUT, narrowed before the search box ever sees
  // them. Not through `query.facets`: the ribbon and the chip row would then be
  // two writers of one value, and clearing the chip would leave the strip
  // saying something the list no longer does.
  const scope =
    mode === 'all' || focused === undefined
      ? state.lessons
      : state.lessons.filter((x) =>
          mode === 'teacher' ? x.teacherId === focused.id : x.classId === focused.id,
        );
  const shown = applyList(scope, query, listCfg);
  const order = useRowOrder({
    kind: 'lessons',
    // Hand-sorting means dragging row 3 to row 1 OF THE ARRAY, and in a focused
    // mode the rows on screen are a subset — index 3 there is not index 3 in
    // `state.lessons`. `ListTools` already explains the lock it puts up.
    count: mode === 'all' ? state.lessons.length : 0,
    items: state.lessons,
    query,
    change,
  });

  const modeNoun = mode === 'teacher' ? 'öğretmen' : 'sınıf';

  // The heading carries the branch when the box does not ("Başlıkta branşı da
  // yazsın") — and it carries BOTH when the box is there, because then the
  // heading is naming the teacher rather than the lesson being typed.
  // Rows AND hours, like the picker beside it: "kaç ders girdim" and "haftası
  // doldu mu" are different questions and the second is the one that bites.
  // The hours come from `weeklyLoad`, the same function the picker rows and
  // the strip's Toplam read — one number, one source.
  const scopeHours = scope.reduce((n, l) => n + l.weeklyHours, 0);
  const counted = t('{ders} ders · {saat} saat', {
    ders: scope.length,
    saat: scopeHours,
  });
  const heading =
    mode === 'all' || focused === undefined
      ? t('Dersler · {sayilar}', { sayilar: counted })
      : mode === 'teacher' && focusedSubjects !== ''
        ? t('{kim} · {brans} dersleri · {sayilar}', {
            kim: focused.name,
            brans: focusedSubjects,
            sayilar: counted,
          })
        : t('{kim} dersleri · {sayilar}', {
            kim: focused.name,
            sayilar: counted,
          });

  const panel = (
    <>
      <LessonForm state={state} change={change} mode={mode} focused={focused} modeNoun={modeNoun} />

      <div className="panel step-panel">
        <h2>{heading}</h2>

        {scope.length > 0 && (
          <ListTools
            items={scope}
            query={query}
            setQuery={setQuery}
            config={listCfg}
            shown={shown.length}
            noun="ders"
            countKey="{n} ders"
            notice={order.notice}
          />
        )}

        {scope.length > 0 && shown.length === 0 && (
          <p className="hint">{t('Bu aramaya uyan ders yok.')}</p>
        )}

        {scope.length === 0 && state.lessons.length > 0 && mode !== 'all' && (
          <p className="hint">
            Bu {modeNoun} için henüz ders girilmemiş. Yukarıdaki satırdan ekleyin.
          </p>
        )}

        {/* Eleven columns do not fit a 100 %-wide table at --ui-scale
            1.5: the browser answers by crushing whichever column can
            still shrink, and at 150 % that was the NAME — 232 px down
            to 26 px, measured. Wide content scrolls in its own box
            rather than squeezing the reader's own words out. */}
        {shown.length > 0 && (
          <div className="table-scroll">
            <table className="list">
              <thead>
                <tr>
                  {order.head}
                  <th>{t('Sınıf')}</th>
                  <th>{t('Öğretmen')}</th>
                  <th className="w-col-lg">{t('Haftalık saat')}</th>
                  <th className="w-col-lg">{t('Dağılım')}</th>
                  <th className="w-col-md" title={t('Bu ders bir günde en fazla kaç saat')}>
                    {t('Günde ↑')}
                  </th>
                  <th className="w-col-md" />
                </tr>
              </thead>
              <tbody ref={order.bodyRef}>
                {shown.map((x, i) => {
                  const group = state.classes.find((c) => c.id === x.classId);
                  const teacher = state.teachers.find((t) => t.id === x.teacherId);
                  const rowName = `${group?.name ?? '?'} · ${teacher?.short ?? '?'}`;
                  return (
                    <LessonRow
                      key={x.id}
                      state={state}
                      change={change}
                      lesson={x}
                      rowName={rowName}
                      grip={order.grip(i, rowName)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  // The general list has nothing to pick, so it gets the whole width — a
  // two-column grid with an empty right column is 20rem of nothing. It stays
  // INSIDE `.cols` either way: that wrapper is the shape every list screen has
  // (`.cols > div > .panel`), and dropping it in one mode would have made this
  // the only list in the program its own helpers could not find.
  //
  // And the RAIL is there either way too. It used to appear with the focused
  // modes and vanish in Genel, so the list's right edge jumped several hundred
  // pixels on a button whose whole job was to change which lessons were
  // listed. Genel gets the summary the setup steps get — the one panel that
  // says whether each class's week is actually full.
  return (
    <div className="cols">
      <div>{panel}</div>

      {/* The picker, and the same list Müsaitlik puts in this column: choosing
          among twenty classes should not be a <select> showing one row at a
          time, and the number that says whether this one is done — lessons
          entered, hours loaded — belongs on the row itself. */}
      <aside>
        {mode === 'all' ? (
          <Summary state={state} change={change} step="lessons" />
        ) : (
          <LessonPicker
            state={state}
            mode={mode}
            picking={picking}
            focused={focused}
            setFocus={setFocus}
            modeNoun={modeNoun}
          />
        )}
      </aside>
    </div>
  );
}
