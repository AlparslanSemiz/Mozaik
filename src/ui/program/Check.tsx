// Feasibility check (v0.5). The answer to "why can this timetable not be built?"
// This is the thing aSc does not do and that hurts most at the school.

import { useMemo } from 'react';
import { CapacityRows } from '../lists';
import { buildIndex, closedConflicts } from '../../pure/constraints';
import {
  type Advice,
  type Cell,
  groupStranded,
  groupUnplaceable,
  lessonName,
  type ReportRow,
  sharedReport,
  type Target,
  violationCell,
} from '../../pure/feasibility';
import type { Id, State } from '../../leaf/model';
import { activePlacements } from '../../pure/grid';
import { pinnedRelationBreaches } from '../../pure/constraints';
import type { CheckView, ToolState } from '../../platform/prefs';
import { T, useT, useToast } from '../common';
import { revealCell, revealPoolCard } from './reveal';

interface Props {
  state: State;
  /** Which part of the report the strip has chosen. */
  view: CheckView;
  /**
   * Where "Göster" and "Müsaitlik'te aç" go. Three audits found the same
   * thing: Kontrol said what was wrong and gave nothing to click (2026-11-15).
   */
  ui: Pick<ToolState, 'setTab' | 'setKind' | 'setChosen' | 'setPoolFilter'>;
}

/** "Göster" and "Müsaitlik'te aç", side by side at the end of a row. */
function RowActions({
  show,
  open,
  openLabel,
}: {
  show?: (() => void) | undefined;
  open?: (() => void) | undefined;
  /** Says WHOSE row opens, so two buttons in one row are not both "aç". */
  openLabel?: string | undefined;
}) {
  const t = useT();
  return (
    <td className="row-actions">
      {show !== undefined && (
        <button type="button" className="btn" onClick={show}>
          {t('Göster')}
        </button>
      )}
      {open !== undefined && (
        <button type="button" className="btn" onClick={open} title={openLabel}>
          {t("Müsaitlik'te aç")}
        </button>
      )}
    </td>
  );
}

/**
 * The Danışman's notes, one row per kind (DENETIM KS22, Ö38). On the full
 * course the same sentence stood five times with only the lesson's name
 * changing; now a kind that repeats is one sentence with the names under it,
 * and a kind that occurs once keeps its own full sentence.
 */
function adviceRows(advice: Advice[]): Advice[][] {
  const byCode = new Map<Advice['code'], Advice[]>();
  for (const a of advice) {
    const group = byCode.get(a.code);
    if (group === undefined) byCode.set(a.code, [a]);
    else group.push(a);
  }
  return [...byCode.values()];
}

// Translation KEYS, translated where they are drawn: a `t()` here would run
// once at load and freeze the language. The four dictionaries carry them
// word for word, and i18n.test.ts's dead-key scan finds them in this file.
const GROUPED: Record<Advice['code'], string> = {
  lessonNeedsMoreDays:
    '{n} ders haftada günden çok kez konacak; en az bir günde iki kez görülecek:',
  teacherManyBlockedDays:
    '{n} öğretmenin müsait günü bir dersinin istediğinden az; bir güne iki kez düşebilir:',
  lessonManyBlocks:
    '{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu:',
};

/**
 * One capacity panel, drawn FULL WIDTH as the whole page.
 *
 * It used to be one of three stacked in a sticky right rail, reached by strip
 * buttons that called `scrollIntoView`. That rail is pinned to the top of the
 * scrollport and has its own `overflow-y`, so the page never moved and the
 * buttons did nothing — with no pressed state to say a choice had been made.
 * Now the strip chooses WHICH panel exists, so a click always changes the
 * screen and there is nothing left to scroll past.
 */
function Section({
  id,
  title,
  rows,
  description,
  empty,
  colorOf,
}: {
  /** A stable handle for tests and for a future deep link. */
  id: string;
  title: string;
  rows: ReportRow[];
  description: string;
  /** Said when there is nothing to list. A chosen view must never be blank. */
  empty: string;
  colorOf?: ((id: Id) => number | null) | undefined;
}) {
  return (
    <div className="panel" id={id}>
      <h2>{title}</h2>
      <p className="hint">{description}</p>
      <CapacityRows
        rows={rows}
        label={title}
        empty={empty}
        problemsFirst
        colorOf={colorOf}
        openLabel={id === 'kontrol-ogretmenler' ? 'Müsait' : 'Açık'}
      />
    </div>
  );
}

export default function Check({ state, view, ui }: Props) {
  const t = useT();
  const notify = useToast();
  // One index for the whole tab, and the report the health chip already built
  // for this plan (`sharedReport`): opening Kontrol built both again.
  const ix = useMemo(() => buildIndex(state), [state]);
  const report = useMemo(() => sharedReport(state, ix), [state, ix]);
  const conflicts = useMemo(() => closedConflicts(state, ix), [state, ix]);
  // What blocks besides a lesson on a closed hour: those rows carry İmkânsız.
  const otherProblem =
    report.unplaceable.length > 0 ||
    report.violations.length > 0 ||
    [...report.teachers, ...report.classes, ...report.rooms].some((x) => x.level === 'impossible');

  // Where the week stands, from the same numbers the pool and the grid use.
  const placed = Object.keys(activePlacements(state)).length;
  const totalWanted = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
  const pinnedBreaks = useMemo(() => pinnedRelationBreaches(state, ix).length, [state, ix]);
  // One row per LESSON, not per hour: a two-hour block on a closed hour was
  // two identical rows under a heading that said "2 ders".
  const stranded = useMemo(() => groupStranded(state, ix, conflicts), [state, ix, conflicts]);
  const strandedHours = conflicts.length;
  const stuck = useMemo(() => groupUnplaceable(report.unplaceable), [report]);
  // Once per change, not per render: each lookup walks the week's placements.
  const violationCells = useMemo(
    () => new Map(report.violations.map((v) => [v.key, violationCell(state, ix, v)])),
    [report, state, ix],
  );

  // The tab switch first, then the reveal: Program is kept alive in an
  // Activity, so the kart exists and only has to become visible (reveal.ts).
  const show = (cell: Cell) => {
    ui.setTab('program');
    revealCell([cell.classId, cell.teacherId], cell.day, cell.hour, (found) => {
      if (!found) notify(t('Kart ızgarada görünmüyor; satırı gizli olabilir.'));
    });
  };
  const showInPool = (lessonId: Id) => {
    // A pool narrowed to one subject would hide the very card asked for.
    ui.setPoolFilter('');
    ui.setTab('program');
    revealPoolCard(lessonId, (found) => {
      if (!found) notify(t('Kart havuzda görünmüyor; havuz kapalı olabilir.'));
    });
  };
  const openAvailability = (who: Target) => {
    ui.setKind(who.kind);
    ui.setChosen(who.id);
    ui.setTab('availability');
  };
  const whoName = (who: Target): string =>
    who.kind === 'teacher'
      ? (ix.teacherById.get(who.id)?.short ?? '?')
      : who.kind === 'class'
        ? t('{ad} sınıfı', { ad: ix.classById.get(who.id)?.name ?? '?' })
        : t('{ad} dersliği', { ad: ix.roomById.get(who.id)?.name ?? '?' });
  const openLabel = (who: Target) => t("{kim} için Müsaitlik'i açar", { kim: whoName(who) });
  const doneLessons = state.lessons.filter(
    (l) => (ix.placedHours.get(l.id) ?? 0) >= l.weeklyHours,
  ).length;
  const capacity = state.classes.length * state.settings.days.length * state.settings.hours.length;
  const fillPercent = capacity === 0 ? 0 : Math.round((placed / capacity) * 100);
  const freeSlots = Math.max(0, capacity - placed);

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          {/* The screen's heading, for a reader who moves by headings. */}
          <h2 className="visually-hidden">{t('Kontrol')}</h2>
          <strong>{t('Kontrol edilecek bir şey yok.')}</strong>
          <T k="Öğretmenleri ve sınıfları **Okul**, dersleri **Dersler** sekmesinden girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler." />
        </div>
      </>
    );
  }

  return (
    // A READING WIDTH, and it is not decoration. Dropping the two-column layout
    // gave every table the whole 1900 px, so "Yerleşmiş saat" and "433 / 433"
    // ended up at opposite ends of the monitor with a metre of nothing between
    // them — and the number wrapped. A report is read, not scanned; 68rem is
    // about as wide as a four-column table can be and still be one object.
    <div className="check-page">
      {!report.hasProblem ? (
        <div className="panel">
          <div className="ok-box">
            {report.tight ? (
              <T k="**Sorun görünmüyor.** Bazı öğretmenlerin müsait saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir." />
            ) : (
              <T k="**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir." />
            )}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="warn-box">
            {/* A lesson on a closed hour is its own sentence: nothing is
                İmkânsız about it, it was placed and then its hour was taken
                away, and it is moved rather than solved (DENETIM DK7). */}
            {stranded.length > 0 && (
              <div>
                <T
                  k="**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** kartı bulur."
                  vars={{ ders: stranded.length, saat: strandedHours }}
                />
              </div>
            )}
            {otherProblem && (
              <div>
                <T k="**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde" />{' '}
                <span className="badge impossible">{t('İmkânsız')}</span>{' '}
                <T k="yazan satırlar programın dizilmesini engeller. Önce onları çözün." />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONE VIEW AT A TIME, chosen by the strip.
          It used to be two fixed columns with the three capacity panels in a
          sticky right rail, and the strip's four buttons called
          `scrollIntoView` at them. The rail is pinned to the top of the
          scrollport and scrolls inside itself, so three of those four buttons
          could not move anything; the fourth had ~9 % of a screen to travel.
          Nothing was pressed, nothing moved, and nothing said so.

          Choosing which panel EXISTS makes the click and the screen the same
          event — and it takes the page from something you scroll to something
          you read. */}
      {/* Where the week stands. It is the question you come to this tab with
          and the one it never answered: everything else here is about what
          COULD go wrong, and this is what is actually done. */}
      <div className="panel">
        <h2>{t('Programın durumu')}</h2>
        <table className="stat">
          <tbody>
            <tr>
              <td>{t('Yerleşmiş saat')}</td>
              <td className="num">
                {placed} / {totalWanted}
              </td>
            </tr>
            <tr>
              <td>{t('Tamamlanan ders')}</td>
              <td className="num">
                {doneLessons} / {state.lessons.length}
              </td>
            </tr>
            <tr>
              <td>{t('Haftanın doluluğu')}</td>
              <td className="num">%{fillPercent}</td>
            </tr>
            <tr>
              <td>{t('Boş kalan sınıf saati')}</td>
              <td className="num">{freeSlots}</td>
            </tr>
          </tbody>
        </table>
        {placed < totalWanted && (
          <p className="hint">
            <T
              k="Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile dizebilirsiniz."
              vars={{ n: totalWanted - placed }}
            />
          </p>
        )}
      </div>

      {view === 'problems' && (
        <>
          {stranded.length > 0 && (
            <div className="panel kontrol-sorun" id="kontrol-kapali">
              <h2>{t('Kapalı saatte ders ({n})', { n: stranded.length })}</h2>
              <p className="hint">
                <T k="Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Kartı açık bir saate sürükleyin ya da saati Müsaitlik'te açın." />
              </p>
              <table className="list">
                <thead>
                  <tr>
                    <th className="w-col-2xl">{t('Ders')}</th>
                    <th>{t('Sebep')}</th>
                    <th className="row-actions" />
                  </tr>
                </thead>
                <tbody>
                  {stranded.map((s) => {
                    const first = s.cells[0]!;
                    const who = s.closedBy[0];
                    return (
                      <tr key={s.lessonId}>
                        <td>
                          {lessonName(ix, s.lessonId)}{' '}
                          <span className="hint inline">
                            · {t('{n} saat', { n: s.cells.length })}
                          </span>
                        </td>
                        <td>{s.reason}</td>
                        <RowActions
                          show={() => show(first)}
                          open={who === undefined ? undefined : () => openAvailability(who)}
                          openLabel={who === undefined ? undefined : openLabel(who)}
                        />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {report.violations.length > 0 && (
            <div className="panel kontrol-sorun">
              <h2>{t('Kural ihlalleri ({n})', { n: report.violations.length })}</h2>
              {/* Two sources, two sentences: the limits live in Ayarlar →
                  Kurallar, a relation on the lesson's own sheet (B5.3). */}
              {report.violations.some((v) => v.rule !== 'notSameDay') && (
                <p className="hint">
                  <T k="Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor." />
                </p>
              )}
              {report.violations.some((v) => v.rule === 'notSameDay') && (
                <p className="hint">
                  <T k="Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir." />
                </p>
              )}
              {/* TODO RK2: with both of them pinned, Otomatik diz has no
                  suggestion to offer until one moves; said here as well as
                  in the panel, in one sentence. */}
              {pinnedBreaks > 0 && (
                <p className="hint">
                  <T k="İkisi de **sabitlenmişse** **Otomatik diz** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın." />
                </p>
              )}
              <table className="list">
                <thead>
                  <tr>
                    <th className="w-col-lg">{t('Durum')}</th>
                    <th>{t('Açıklama')}</th>
                    <th className="row-actions" />
                  </tr>
                </thead>
                <tbody>
                  {report.violations.map((v) => {
                    const cell = violationCells.get(v.key) ?? null;
                    return (
                      <tr key={v.key}>
                        <td>
                          <span className={`badge ${v.level === 'block' ? 'impossible' : 'tight'}`}>
                            {v.level === 'block' ? t('Engel') : t('Uyarı')}
                          </span>
                        </td>
                        <td>{v.message}</td>
                        <RowActions show={cell === null ? undefined : () => show(cell)} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* One row per CAUSE, the lessons under it as buttons (TODO SD4):
              twelve rows of one template, "Örnek sebep: … kapalı", said
              nothing the first row had not. */}
          {stuck.length > 0 && (
            <div className="panel kontrol-sorun" id="kontrol-yerlesemeyen">
              <h2>{t('Yerleşemeyen dersler ({n})', { n: report.unplaceable.length })}</h2>
              <p className="hint">
                <T k="Bu derslere konacak hücre kalmamış. Ders adı kartı havuzda gösterir; yer açmak için Müsaitlik'te saat açın ya da bir kartı taşıyın." />
              </p>
              <table className="list">
                <thead>
                  <tr>
                    <th>{t('Sebep ve dersler')}</th>
                    <th className="row-actions" />
                  </tr>
                </thead>
                <tbody>
                  {stuck.map((g) => (
                    <tr key={g.message}>
                      <td>
                        <div>{g.message}</div>
                        <div className="lesson-chips">
                          {g.lessons.map((u) => (
                            <button
                              key={u.lessonId}
                              type="button"
                              className="chip lesson-chip"
                              onClick={() => showInPool(u.lessonId)}
                            >
                              {u.name}
                              <span className="chip-count">
                                · {t('{n} saat', { n: u.missing })}
                              </span>
                            </button>
                          ))}
                        </div>
                      </td>
                      <RowActions
                        open={g.fix === null ? undefined : () => openAvailability(g.fix!)}
                        openLabel={g.fix === null ? undefined : openLabel(g.fix)}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!report.hasProblem && stranded.length === 0 && (
            <div className="panel">
              <p className="hint">
                {t('Kapalı saatte ders, kural ihlali ya da yerleşemeyen ders yok.')}
              </p>
            </div>
          )}
        </>
      )}

      {/* aSc's "Danışman" (Advisor): data that will not BLOCK a build but is
          worth a second look. Kept apart from the `problems` view above on
          purpose — aSc's own strip carries "Doğrulama" and "Danışman" as two
          separate buttons, and the "Sorun görünmüyor" box only answers the
          first question. */}
      {view === 'advisor' && (
        <div className="panel">
          <h2>{t('Danışman notları ({n})', { n: report.advice.length })}</h2>
          <p className="hint">
            {t('Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.')}
          </p>
          {report.advice.length === 0 ? (
            <p className="hint">{t('Danışmanın söyleyecek bir şeyi yok.')}</p>
          ) : (
            // Bounded and scrolled in place — the pattern CapacityRows already
            // uses (`.stat-scroll`): a list that grows with the school must not
            // push the rest of the page down with it.
            <div className="stat-scroll">
              <table className="list">
                <thead>
                  <tr>
                    <th className="w-col-lg">{t('Durum')}</th>
                    <th>{t('Açıklama')}</th>
                  </tr>
                </thead>
                <tbody>
                  {adviceRows(report.advice).map((group) => (
                    <tr key={group[0]!.key}>
                      <td>
                        <span className="badge tight">{t('Not')}</span>
                      </td>
                      <td>
                        {group.length === 1 ? (
                          group[0]!.message
                        ) : (
                          <>
                            {t(GROUPED[group[0]!.code], { n: group.length })}{' '}
                            <span className="hint inline">
                              {group.map((a) => a.who).join(', ')}
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* The colour is the same mark the grid row and the pool card carry — a
          name without it makes the reader look the person up again. Rooms have
          none, so that Section is given no lookup. */}
      {view === 'teachers' && (
        <Section
          id="kontrol-ogretmenler"
          title={t('Öğretmenler')}
          rows={report.teachers}
          empty={t('Henüz öğretmen yok.')}
          colorOf={(id) => state.teachers.find((x) => x.id === id)?.color ?? null}
          description={t('Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz.')}
        />
      )}
      {view === 'classes' && (
        <Section
          id="kontrol-siniflar"
          title={t('Sınıflar')}
          rows={report.classes}
          empty={t('Henüz sınıf yok.')}
          colorOf={(id) => state.classes.find((c) => c.id === id)?.color ?? null}
          description={t(
            'Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.',
          )}
        />
      )}
      {view === 'rooms' && (
        <Section
          id="kontrol-derslikler"
          title={t('Derslikler')}
          rows={report.rooms}
          empty={t('Henüz derslik yok.')}
          description={t(
            'Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.',
          )}
        />
      )}
    </div>
  );
}
