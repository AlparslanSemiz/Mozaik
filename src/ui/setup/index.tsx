// The four lists the school is built from, and Başlarken.
//
// It used to be one 1132-line scroll, then a tab of its own (Okul) with a
// strip of four steps. Since 2026-11-16 (Sadeleşme, K1) the four lists are
// in the tasks they serve: Öğretmenler and Sınıflar are tabs of their own,
// Derslikler and Branşlar are sections of Okul bilgileri beside the school's
// name and bell. Each list still has its Özet on the right.

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useToast, type PanelProps, type PlanControls, T, useT } from '../common';
import { useLoadSample, DraftStart } from '../plans';
import { markIntroSeen, readIntroSeen, type StepId } from '../../platform/prefs';

import Rooms from './Rooms';
import Teachers from './Teachers';
import Classes from './Classes';
import Subjects from './Subjects';
import { Checklist } from './Checklist';
import { Summary } from '../lists';
import { drafts as draftsOf, isSampleSchool } from '../../pure/io';

const RENDER: Record<StepId, (p: PanelProps) => React.ReactElement> = {
  rooms: (p) => <Rooms {...p} />,
  subjects: (p) => <Subjects {...p} />,
  teachers: (p) => <Teachers {...p} />,
  classes: (p) => <Classes {...p} />,
};

/** One list on the left, and on the right what the list MEANS. */
export default function Setup({ state, change, step }: PanelProps & { step: StepId }) {
  return (
    <div className="cols">
      <div>{RENDER[step]({ state, change })}</div>
      <aside>
        <Summary state={state} change={change} step={step} />
      </aside>
    </div>
  );
}

/**
 * Başlarken and the first-run offers, above Okul bilgileri's school data: an
 * empty project lands there, so this is where "what do I do first" has to be
 * answered — and since 2026-11-15 also "what is left": the list ticks itself
 * from the plan (Checklist.tsx).
 */
export function Start({
  state,
  change,
  plans,
  onOwn,
}: PanelProps & { plans: PlanControls; onOwn: () => void }) {
  const t = useT();
  const notify = useToast();
  const loadSample = useLoadSample(plans);
  // Read once on mount: `markIntroSeen()` writes to localStorage, and a
  // component cannot re-render on that. The local flag is what makes the line
  // go away in the same breath as the click.
  const [introSeen, setIntroSeen] = useState(readIntroSeen);

  // Somebody who has typed in a room, a teacher or a class has answered the
  // offer by not taking it. Writing it here rather than only on the two buttons
  // means the line cannot come back later — emptying the project again to start
  // over is not a request to be introduced to the program a second time.
  useEffect(() => {
    if (!introSeen && state.teachers.length + state.classes.length + state.rooms.length > 0) {
      markIntroSeen();
      setIntroSeen(true);
    }
  }, [introSeen, state.teachers.length, state.classes.length, state.rooms.length]);
  // A draft is last term's setup with the grid emptied. An empty project
  // lands here, so it is the only place where offering one is useful: one
  // click instead of retyping twenty classes.
  const templates = draftsOf(plans.library).filter((p) => p.id !== plans.planId);
  const empty = state.teachers.length === 0 && state.classes.length === 0;

  return (
    <Checklist state={state}>
      {/* The sample school is open: the way to one's own is one line, and
          the sample stays as a plan (App.tsx, startOwnSchool). */}
      {isSampleSchool(state) && (
        <p className="hint sample-line">
          <Info size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
          {t('Bu örnek okul.')}
          <button
            className="btn"
            onClick={() => {
              onOwn();
              // The button goes with the sample line: the keyboard stays on
              // the page, at the heading the new plan starts from.
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLElement>('.checklist h2, .checklist button, .checklist a')
                  ?.focus(),
              );
            }}
          >
            {t('Kendi okulumla başla')}
          </button>
        </p>
      )}
      {empty && (
        <>
          {/* Once, on a first run, and then never here again — its home is
              Okul bilgileri → Hakkında. Seen is written when they ACT, not
              when the screen is drawn: a line nobody has read yet must
              survive a reload. */}
          {!introSeen && (
            <p className="hint intro-line">
              <Info size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              {t("Mozaik'in ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.")}
              <button
                className="btn"
                onClick={async () => {
                  if (await loadSample(state, change)) setIntroSeen(true);
                }}
              >
                {t('Örnek okulu yükle')}
              </button>
              <button
                className="btn quiet"
                onClick={() => {
                  markIntroSeen();
                  setIntroSeen(true);
                }}
              >
                {t('Bir daha gösterme')}
              </button>
            </p>
          )}

          {templates.length > 0 && (
            <>
              <h3>{t('Taslaktan başla')}</h3>
              <p className="hint">
                <T k="Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez." />
              </p>
              <DraftStart
                plans={plans}
                label={(name) => t('{ad} ile başla', { ad: name })}
                notify={notify}
              />
            </>
          )}
        </>
      )}
    </Checklist>
  );
}
