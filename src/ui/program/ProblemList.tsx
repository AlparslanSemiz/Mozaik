// The problem list: the answer to "why can this timetable not be built?",
// opened by the status chip over whatever is on screen (Sadeleşme, K3,
// 2026-11-16). This is the thing aSc does not do and that hurts most at the
// school.
//
// It was the Kontrol TAB until then, and a tab is a destination: asking "am I
// still all right?" meant leaving the grid. Everything that tab had is here,
// and LAYOUT, "Sorun listesi" says where each part went: the verdict, the
// week's numbers, lessons on a closed hour, rule breaches and unplaceable
// lessons (each with Göster, and Sayfasını aç where a person's hours are the
// cause), the İpuçları, and the three load tables behind Daha fazla.

import { useEffect, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Lightbulb, TriangleAlert, X } from 'lucide-react';
import { CapacityRows } from '../lists';
import { buildIndex, closedConflicts } from '../../pure/constraints';
import {
  type Advice,
  type Cell,
  groupStranded,
  groupUnplaceable,
  type health,
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
import { MoreMenu, MoreRadio, NextStep, T, useReturnFocus, useT, useToast } from '../common';
import { useInspect } from './Inspector';
import { revealCell, revealPoolCard } from './reveal';

interface Props {
  state: State;
  status: ReturnType<typeof health>;
  /** Open, and on which lesson if a pool card's "Neden yerleşmedi?" asked. */
  open: { lesson: Id | null } | null;
  onClose: () => void;
  /** Where "Göster" goes, and which part of the list is on screen. */
  ui: Pick<ToolState, 'setTab' | 'setPoolFilter' | 'checkView' | 'setCheckView'>;
}

/** The three load tables. Behind Daha fazla: they are read about never. */
const LOADS: Array<{ id: CheckView; label: string }> = [
  { id: 'teachers', label: 'Öğretmen yükleri' },
  { id: 'classes', label: 'Sınıf yükleri' },
  { id: 'rooms', label: 'Derslik yükleri' },
];

/** "Göster" and "Sayfasını aç", side by side at the end of a row. */
function RowActions({
  show,
  open,
  openLabel,
}: {
  show?: (() => void) | undefined;
  open?: (() => void) | undefined;
  /** Says WHOSE page opens, so two buttons in one row are not both "aç". */
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
          {t('Sayfasını aç')}
        </button>
      )}
    </td>
  );
}

/**
 * The İpuçları, one row per kind (DENETIM KS22, Ö38). On the full course the
 * same sentence stood five times with only the lesson's name changing; now a
 * kind that repeats is one sentence with the names under it, and a kind that
 * occurs once keeps its own full sentence.
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
    '{n} öğretmenin açık günü bir dersinin istediğinden az; bir güne iki kez düşebilir:',
  lessonManyBlocks:
    '{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; Mozaik’in deneyebileceği tek şekil bu:',
};

/** One load table, the whole width of the list. */
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
      <CapacityRows rows={rows} label={title} empty={empty} problemsFirst colorOf={colorOf} />
    </div>
  );
}

export default function ProblemList({ state, status, open, onClose, ui }: Props) {
  const t = useT();
  const returnFocus = useReturnFocus(open !== null);
  // An action that takes the reader somewhere puts the focus there itself.
  const leaving = useRef(false);
  return (
    <Dialog.Root open={open !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content
          className="sheet problem-list"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            // Into the list, or onto the lesson a pool card asked about (its
            // row is drawn by now; the Report marks it).
            const box = e.currentTarget as HTMLElement | null;
            const chip =
              open?.lesson == null
                ? null
                : box?.querySelector<HTMLElement>(`[data-lesson="${CSS.escape(open.lesson)}"]`);
            (chip ?? box)?.focus();
          }}
          onCloseAutoFocus={(e) => {
            if (leaving.current) {
              leaving.current = false;
              e.preventDefault();
              return;
            }
            returnFocus(e);
          }}
        >
          <div className="sheet-head">
            <div className="sheet-id">
              <Dialog.Title className="sheet-title">{t('Programın durumu')}</Dialog.Title>
            </div>
            <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
              <X size={18} strokeWidth={2.2} />
            </Dialog.Close>
          </div>
          {/* Which part of the list, the way the strips say it: a segment
              for the two everyday parts, the load tables behind Daha fazla. */}
          <div className="form-row sheet-views" role="group" aria-label={t('Göster')}>
            <button
              className="btn"
              aria-pressed={ui.checkView === 'problems'}
              onClick={() => ui.setCheckView('problems')}
            >
              <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" />
              {t('Sorunlar ({n})', { n: status.problems })}
            </button>
            <button
              className="btn"
              aria-pressed={ui.checkView === 'advisor'}
              onClick={() => ui.setCheckView('advisor')}
            >
              <Lightbulb size={16} strokeWidth={2} aria-hidden="true" />
              {status.problems === 0 ? t('İpuçları') : t('İpuçları ({n})', { n: status.advice })}
            </button>
            <MoreMenu>
              <MoreRadio
                value={LOADS.some((l) => l.id === ui.checkView) ? ui.checkView : ''}
                onChange={(id) => ui.setCheckView(id as CheckView)}
                options={LOADS.map((l) => ({ id: l.id, label: t(l.label) }))}
              />
            </MoreMenu>
          </div>
          {open !== null && (
            <Report
              state={state}
              view={ui.checkView}
              lesson={open.lesson}
              leave={(go) => {
                leaving.current = true;
                onClose();
                go();
              }}
              ui={ui}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Report({
  state,
  view,
  lesson,
  leave,
  ui,
}: {
  state: State;
  view: CheckView;
  lesson: Id | null;
  /** Closes the list, then goes. */
  leave: (go: () => void) => void;
  ui: Props['ui'];
}) {
  const t = useT();
  const notify = useToast();
  const inspect = useInspect();
  // One index for the whole list, and the report the health chip already built
  // for this plan (`sharedReport`).
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

  // A pool card asked "why": its lesson's button in the list takes the focus
  // and the mark, next to the reason and the way out. A lesson that is merely
  // not laid out yet has no row of its own; the week's line above says what
  // to press.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lesson === null) return;
    const chip = body.current?.querySelector<HTMLElement>(`[data-lesson="${CSS.escape(lesson)}"]`);
    if (chip === null || chip === undefined) return;
    chip.scrollIntoView({ block: 'center' });
    chip.setAttribute('data-reveal', '');
  }, [lesson]);

  // Program stays alive in an Activity, so the card exists and only has to
  // become visible (reveal.ts).
  const show = (cell: Cell) =>
    leave(() => {
      ui.setTab('program');
      revealCell([cell.classId, cell.teacherId], cell.day, cell.hour, (found) => {
        if (!found) notify(t('Ders ızgarada görünmüyor; satırı gizli olabilir.'));
      });
    });
  const showInPool = (lessonId: Id) =>
    leave(() => {
      // A pool narrowed to one subject would hide the very card asked for.
      ui.setPoolFilter('');
      ui.setTab('program');
      revealPoolCard(lessonId, (found) => {
        if (!found) notify(t('Ders havuzda görünmüyor; havuz kapalı olabilir.'));
      });
    });
  // The hours live on the person's page since K5; a room has one too.
  const openPage = (who: Target) => leave(() => inspect(who.kind, who.id));
  const whoName = (who: Target): string =>
    who.kind === 'teacher'
      ? (ix.teacherById.get(who.id)?.name ?? '?')
      : who.kind === 'class'
        ? t('{ad} sınıfı', { ad: ix.classById.get(who.id)?.name ?? '?' })
        : t('{ad} dersliği', { ad: ix.roomById.get(who.id)?.name ?? '?' });

  if (state.lessons.length === 0) {
    return (
      <div className="empty-screen">
        <strong>{t('Kontrol edilecek bir şey yok.')}</strong>
        <NextStep state={state} />
      </div>
    );
  }

  return (
    <div className="check-page" ref={body}>
      {!report.hasProblem ? (
        <div className="panel">
          <div className="ok-box">
            {/* "Program dizilebilir" read wrong once it HAD been: a laid-out
                week was told it could be laid out (Sadeleşme, 2026-11-16). */}
            {totalWanted > 0 && placed >= totalWanted ? (
              <T k="**Program tamam.** Bütün dersler yerleşti ve kurallara uyuyor." />
            ) : report.tight ? (
              <T k="**Sorun görünmüyor.** Bazı öğretmenlerin açık saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir." />
            ) : (
              <T k="**Sorun görünmüyor.** Öğretmen, sınıf ve derslik açık saatleri yüklenen ders saatlerini karşılıyor. Program dizilebilir." />
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
                  k="**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** onu ızgarada bulur."
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

      {/* Where the week stands: what is actually done, beside everything
          else here that is about what COULD go wrong. */}
      <div className="panel">
        <table className="stat">
          <tbody>
            <tr>
              <td>{t('Yerleşmiş saat')}</td>
              <td className="num">
                {placed} / {totalWanted}
              </td>
            </tr>
          </tbody>
        </table>
        {placed < totalWanted && (
          <p className="hint">
            <T
              k="Kalan **{n}** saat bekliyor. **Program** sekmesindeki **Kalanı diz** düğmesine basın."
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
                <T k="Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Dersi açık bir saate sürükleyin ya da saati kişinin sayfasında açın." />
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
                          open={who === undefined ? undefined : () => openPage(who)}
                          openLabel={who === undefined ? undefined : whoName(who)}
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
              <h2>{t('Kural aşımları ({n})', { n: report.violations.length })}</h2>
              {/* Two sources, two sentences: the limits live in Okul bilgileri
                  → Kurallar, a relation on the lesson's own sheet (B5.3). */}
              {report.violations.some((v) => v.rule !== 'notSameDay') && (
                <p className="hint">
                  <T k="Program, **Okul bilgileri → Kurallar**'da girdiğiniz sınırları aşıyor." />
                </p>
              )}
              {report.violations.some((v) => v.rule === 'notSameDay') && (
                <p className="hint">
                  <T k="Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir." />
                </p>
              )}
              {/* TODO RK2: with both of them pinned, Kalanı diz has no
                  suggestion to offer until one moves; said here as well as
                  in the panel, in one sentence. */}
              {pinnedBreaks > 0 && (
                <p className="hint">
                  <T k="İkisi de **sabitlenmişse** **Kalanı diz** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın." />
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
                            {v.level === 'block' ? t('Kesin') : t('Tercih')}
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
                <T k="Bu derslere konacak hücre kalmamış. Dersin adı onu havuzda gösterir; yer açmak için kişinin sayfasında saat açın ya da bir dersi taşıyın." />
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
                              data-lesson={u.lessonId}
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
                        open={g.fix === null ? undefined : () => openPage(g.fix!)}
                        openLabel={g.fix === null ? undefined : whoName(g.fix)}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* aSc's "Danışman" (Advisor): data that will not BLOCK a build but is
          worth a second look, apart from the problems on purpose. */}
      {view === 'advisor' && (
        <div className="panel">
          <h2>{t('İpuçları ({n})', { n: report.advice.length })}</h2>
          <p className="hint">
            {t('Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.')}
          </p>
          {report.advice.length === 0 ? (
            <p className="hint">{t('İpucu yok.')}</p>
          ) : (
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
                          <span className="hint inline">{group.map((a) => a.who).join(', ')}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          description={t('Öğretmenin açık saat sayısı, ona yüklenen ders saatinden az olamaz.')}
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
