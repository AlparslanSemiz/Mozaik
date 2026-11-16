// Closed hours for a teacher, a class or a room. Shown as a grey hatched "x"
// in the main grid.
//
// Clicking 25 teachers x 72 cells one by one is unacceptable, hence: paint by
// dragging, click a day header for the whole day, click an hour header for that
// hour across the week, and toggle everything at once.
//
// The three kinds share ONE grid and one dictionary: ids are unique across
// teachers, classes and rooms, so only the entity list at the top changes.

import { useMemo } from 'react';
import type React from 'react';
import {
  openHours,
  dayLabel,
  setWholeWeek,
  shortDay,
  subjectShort,
  teacherSubjects,
  weeklyLoad,
} from '../../pure/entities';
import { paletteColor, type Id, type State } from '../../leaf/model';
import { KIND_ICON, useInspect } from '../program';
import { buildIndex, closedConflicts, closedKey } from '../../pure/constraints';
// The module-level `entitiesOf` cannot hold a hook, so it uses the pure
// translator — the same one `constraints.ts` writes its sentences with.
import { t } from '../../leaf/i18n';
import type { Kind, StepId } from '../../platform/prefs';
import { AvailGrid, GoButton, HelpHead, T } from '../common';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  /** Whose closed hours. Owned by App; the tool strip above CHANGES it. */
  kind: Kind;
  /** Which one of them is open. */
  chosen: Id;
  setChosen: (next: Id) => void;
  /** Is the week-pressure table drawn. Chosen from the strip, top right. */
  showHeat: boolean;
}

interface Entity {
  id: Id;
  label: string;
  short: string;
  /**
   * The name a HEADING can carry. `short` is what the sentences use, and for a
   * teacher that is the raw code — the panel above a whole week of somebody's
   * closed hours said "MÇ", which answers "whose" only if you already know.
   */
  full: string;
  /** Weekly lesson hours that must fit into the open cells. */
  load: number;
  /** Cells still open this week. */
  open: number;
  /** Palette index, or -1 for a room (rooms have no colour of their own). */
  color: number;
}

function entitiesOf(d: State, kind: Kind): Entity[] {
  if (kind === 'teacher') {
    return d.teachers.map((x) => ({
      id: x.id,
      // The subject SHORT, and both of them. Short because this line is read
      // while hunting for a name, not while reading about a subject, and the
      // full one pushed the name it is next to off the end of the box. Both
      // because a teacher who holds two was showing only the first here while
      // every other list showed the pair.
      label: `${x.short} · ${x.name} (${teacherSubjects(x)
        .map((name) => subjectShort(d.settings, name))
        .join(' · ')})`,
      short: x.short,
      // Name first, code in brackets: the heading already ends with an em dash
      // ("… — müsait olmayan saatler") and "MÇ — Mehmet Çelik — müsait…" put
      // three clauses on one rule. The code still shows, because the code is
      // what the grid row is labelled with.
      full: `${x.name} (${x.short})`,
      load: weeklyLoad(d, 'teacher', x.id),
      open: openHours(d, x.id),
      color: x.color,
    }));
  }
  if (kind === 'class') {
    return d.classes.map((c) => ({
      id: c.id,
      label: c.name,
      short: t('{ad} sınıfı', { ad: c.name }),
      full: t('{ad} sınıfı', { ad: c.name }),
      load: weeklyLoad(d, 'class', c.id),
      open: openHours(d, c.id),
      color: c.color,
    }));
  }
  return d.rooms.map((r) => ({
    id: r.id,
    label: r.name,
    short: t('{ad} dersliği', { ad: r.name }),
    full: t('{ad} dersliği', { ad: r.name }),
    load: weeklyLoad(d, 'room', r.id),
    open: openHours(d, r.id),
    color: -1,
  }));
}

/** "kaç ÖĞRETMEN kapalı" — the word changes with the kind being edited. */
const KIND_WORD: Record<Kind, string> = {
  teacher: 'öğretmen',
  class: 'sınıf',
  room: 'derslik',
};

const EMPTY_TEXT: Record<Kind, string> = {
  teacher: 'öğretmen',
  class: 'sınıf',
  room: 'derslik',
};

/** Where the empty screen's button goes, and what it says it does there. */
const EMPTY_STEP: Record<Kind, { step: StepId; label: string }> = {
  teacher: { step: 'teachers', label: 'Öğretmen ekle' },
  class: { step: 'classes', label: 'Sınıf ekle' },
  room: { step: 'rooms', label: 'Derslik ekle' },
};

const HINT: Record<Kind, string> = {
  teacher: 'Öğretmenin müsait olmadığı saatlere tıklayın.',
  class: 'Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.',
  room: 'Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.',
};

export default function Availability({ state, change, kind, chosen, setChosen, showHeat }: Props) {
  const inspect = useInspect();
  const list = entitiesOf(state, kind);
  const selected = list.find((x) => x.id === chosen) ?? list[0];

  // Every hook sits above the empty-list return: a list that fills up while
  // the tab stays open (Ctrl+Z, "Dosyadan aç") must not change the hook count.
  const conflicts = useMemo(() => closedConflicts(state, buildIndex(state)), [state]);

  if (selected === undefined) {
    return (
      <>
        <div className="panel">
          <h2>{t('Müsait olmayan saatler')}</h2>
          <div className="empty-screen">
            <strong>{t('Önce {ne} ekleyin.', { ne: t(EMPTY_TEXT[kind]) })}</strong>
            <T
              k="Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor."
              vars={{ ne: t(EMPTY_TEXT[kind]) }}
            />
            <span className="empty-go">
              <GoButton to={{ tab: 'setup', step: EMPTY_STEP[kind].step }} primary>
                {t(EMPTY_STEP[kind].label)}
              </GoButton>
            </span>
          </div>
        </div>
      </>
    );
  }

  // `selected` widens again inside the hoisted functions below; pin the id here.
  const entityId = selected.id;

  const open = selected.open;

  const mine = conflicts.filter((c) => c.teacherId === entityId || c.classId === entityId).length;

  return (
    <div className="cols">
      <div>
        <div className="panel">
          {/* The person page is the primary place for this since 2026-11-16
              (Sadeleşme, K5); this screen stays until phase 3 and says where
              the rest of the person is. */}
          <div className="panel-head">
            <h2>{t('{kim} · müsait olmayan saatler', { kim: selected.full })}</h2>
            <button className="btn" onClick={() => inspect(kind, entityId)}>
              {t('Sayfasını aç')}
            </button>
          </div>

          {/* One line. The long version — drag to paint, click a day name for
              the whole day, click an hour number for the whole week — is on the
              table's own tooltip now: it is a thing you discover by touching
              the thing, not by reading a paragraph above it. */}
          <p
            className="hint"
            title={t(
              'Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki saat numarasına tıklayınca haftanın o saati değişir.',
            )}
          >
            {t(HINT[kind])}
          </p>

          <AvailGrid
            key={entityId}
            state={state}
            change={change}
            entityId={entityId}
            teacher={kind === 'teacher'}
            label={t('{kim} · müsait olmayan saatler', { kim: selected.full })}
          />
        </div>

        {/* Under the grid, the week READ ACROSS everyone: which hours the whole
            school has closed. It is the thing this screen creates and could not
            see — twenty-five teachers all off on Tuesday afternoon is the
            reason the solver gets stuck, and it was only visible by clicking
            through twenty-five people one at a time.

            It can be put away from the strip, top right: two full week tables
            is a lot of screen, and somebody who is only editing one person's
            hours does not need the school-wide reading under it. */}
        {showHeat && (
          <div className="panel">
            <HelpHead topic="Haftanın darlığı">
              <p>
                <T
                  k="Koyu bir sütun, o saatte **kaç {ne} kapalı** olduğunu söyler: dizerken genellikle orada tıkanılır."
                  vars={{ ne: t(KIND_WORD[kind]) }}
                />
              </p>
            </HelpHead>
            <div className="scroll-x">
              <table className="availability heat">
                <thead>
                  <tr>
                    <th className="corner-head" />
                    {state.settings.hours.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.settings.days.map((day, g) => (
                    <tr key={g}>
                      <th scope="row">{shortDay(day.name)}</th>
                      {state.settings.hours.map((_, sIdx) => {
                        const n = list.filter(
                          (x) => state.unavailable[closedKey(x.id, g, sIdx)] !== undefined,
                        ).length;
                        return (
                          <td
                            key={sIdx}
                            className={n === 0 ? '' : 'closed'}
                            // The GROUND carries the count, not the ink: an
                            // opacity on the cell takes the number down with the
                            // background and makes the darkest hour the hardest
                            // to read — exactly backwards.
                            style={
                              n === 0
                                ? undefined
                                : ({
                                    '--heat': (0.2 + (0.8 * n) / Math.max(1, list.length)).toFixed(
                                      2,
                                    ),
                                  } as React.CSSProperties)
                            }
                            title={t('{gun} {ders}. saat: {kapali} / {toplam} kapalı', {
                              gun: dayLabel(day.name),
                              ders: sIdx + 1,
                              kapali: n,
                              toplam: list.length,
                            })}
                          >
                            {n === 0 ? '' : n}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Everything that used to be crammed ABOVE the grid. The list is the
          point: choosing among 25 teachers was a <select> showing one row at a
          time, and the number that decides whether a week is even possible —
          open hours against loaded hours — only appeared once you had picked
          somebody. Here every row carries it. */}
      <aside>
        <div className="panel">
          <HelpHead topic="Kimin saatleri">
            <p>{t('Sağdaki sayılar: açık saat / ders saati.')}</p>
          </HelpHead>

          {/* Plain buttons with `aria-current`, the way the tabs and the setup
              steps already mark "you are here". A listbox role would be more
              precise on paper and less predictable in practice. */}
          <div className="entity-list" role="group" aria-label={t('Müsaitlik listesi')}>
            {list.map((x) => (
              <button
                key={x.id}
                type="button"
                className="entity"
                data-id={x.id}
                aria-current={x.id === entityId}
                onClick={() => setChosen(x.id)}
              >
                {/* The kind's own symbol, and for a room it is the only mark
                    there is: rooms carry no colour, so their rows used to start
                    with nothing at all while teachers and classes started with
                    a dot. */}
                <span className="entity-icon" aria-hidden="true">
                  {KIND_ICON[kind]}
                </span>
                {x.color >= 0 && (
                  <span className="row-dot" style={{ background: paletteColor(x.color) }} />
                )}
                <span className="entity-name">{x.label}</span>
                <span
                  className="entity-count"
                  title={t('{acik} açık saat, {yuk} saat ders', { acik: x.open, yuk: x.load })}
                >
                  <span aria-hidden="true">
                    {x.open}/{x.load}
                    {x.open < x.load && ' ⚠'}
                  </span>
                  {/* "48/0" read aloud is two numbers and a slash. */}
                  <span className="sr-only">
                    {kind === 'teacher'
                      ? t('{acik} saat müsait, {yuk} saat ders yüklenmiş', {
                          acik: x.open,
                          yuk: x.load,
                        })
                      : t('{acik} saat açık, {yuk} saat ders yüklenmiş', {
                          acik: x.open,
                          yuk: x.load,
                        })}
                    {x.open < x.load &&
                      `, ${t('{n} saat fazla, bu program dizilemez.', { n: x.load - x.open })}`}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="form-row spaced">
            <button className="btn" onClick={() => change((d) => setWholeWeek(d, entityId, false))}>
              {t('Bütün haftayı aç')}
            </button>
            <button className="btn" onClick={() => change((d) => setWholeWeek(d, entityId, true))}>
              {t('Bütün haftayı kapat')}
            </button>
          </div>

          <p className={open < selected.load ? 'error-box' : 'hint'}>
            {kind === 'teacher' ? (
              <T
                k="**{kim}**: {acik} saat müsait, {yuk} saat ders yüklenmiş."
                vars={{ kim: selected.short, acik: open, yuk: selected.load }}
              />
            ) : (
              <T
                k="**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş."
                vars={{ kim: selected.short, acik: open, yuk: selected.load }}
              />
            )}
            {open < selected.load &&
              ` ${t('{n} saat fazla, bu program dizilemez.', { n: selected.load - open })}`}
          </p>

          {/* Closing an hour never removes what is already on it (no-data-loss principle),
              so the only honest thing to do is say that it happened. */}
          {conflicts.length > 0 && (
            <div className="warn-box">
              <T
                k="**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor."
                vars={{
                  n: conflicts.length,
                  kimde:
                    mine > 0
                      ? t(', {n} tanesi {kim} üzerinde', { n: mine, kim: selected.short })
                      : '',
                }}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
