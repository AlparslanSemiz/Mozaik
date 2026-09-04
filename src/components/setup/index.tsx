// Setup: the three lists the school is built from.
//
// It used to be one 1132-line scroll: everything was on screen at once and
// nothing said in which order to fill it in. The strip below is NOT a locked
// wizard — every list is reachable at any time — it only shows where you are
// and, through the counters, where something is still missing. The ordinals
// that used to sit in front of the names came off on 2026-08-28 for exactly
// that reason: nobody walks these in order, so numbering them was counting
// something the reader never counts.
//
// Setup now holds ONLY the three lists that describe the school's people and
// rooms. Everything that is a setting — the school's name, its days, the bell,
// the rules, the subject list — moved to the Ayarlar tab, so this screen has
// exactly one kind of thing on it and every step can be counted.

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useToast } from '../overlay/Toasts';
import { useLoadSample } from '../overlay/useSample';
import { markIntroSeen, readIntroSeen } from '../../theme';

import Rooms from './Rooms';
import Teachers from './Teachers';
import Classes from './Classes';
import Subjects from './Subjects';
import Summary from './Summary';
import { drafts as draftsOf } from '../../library';
import type { PanelProps, PlanControls } from '../common/props';
import type { StepId } from '../../toolState';
import { STEPS } from '../common/steps';
import DraftStart from '../common/DraftStart';
import { T, useT } from '../T';

/**
 * The three lists' label, count and symbol live in `components/steps.tsx` — one
 * definition read by this shell and by the ribbon. Only the
 * RENDERING of a step is this file's business, so only that is here.
 */
const RENDER: Record<StepId, (p: PanelProps) => React.ReactElement> = {
  rooms: (p) => <Rooms {...p} />,
  subjects: (p) => <Subjects {...p} />,
  teachers: (p) => <Teachers {...p} />,
  classes: (p) => <Classes {...p} />,
};

interface Props extends PanelProps {
  plans: PlanControls;
  /**
   * Which of the four lists. Owned by App, and the tool strip above is the
   * only thing that CHANGES it — so no setter comes down here any more.
   */
  step: StepId;
}

export default function Setup({ state, change, plans, step }: Props) {
  const t = useT();
  const notify = useToast();
  const loadSample = useLoadSample();
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
  // A draft is last term's setup with the grid emptied. This screen is where an
  // empty project lands, so it is the only place where offering one is useful:
  // one click instead of retyping twenty classes.
  const templates = draftsOf(plans.library).filter((p) => p.id !== plans.planId);

  const index = Math.max(
    0,
    STEPS.findIndex((s) => s.id === step),
  );
  const current = STEPS[index] ?? STEPS[0]!;

  return (
    <>
      {/* The one screen an empty project lands on, so this is where "what do I
          do first" has to be answered. */}
      {state.teachers.length === 0 && state.classes.length === 0 && (
        <div className="panel">
          <h2>{t('Başlarken')}</h2>
          <p className="hint">
            <T k="Sırayla: **derslikler**, **branşlar**, **öğretmenler**, **sınıflar**, sonra **dersler**." />
          </p>
          {/* Once, on a first run, and then never here again — its home is
              Ayarlar → Veri. It used to be a permanent button on this screen
              with two paragraphs around it, which is a lot of room for
              something the reader needs exactly one afternoon. Seen is written
              when they ACT, not when the screen is drawn: a line nobody has
              read yet must survive a reload. */}
          {!introSeen && (
            <p className="hint intro-line">
              <Info size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              {t('Aracın ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.')}
              <button
                className="btn"
                onClick={async () => {
                  if (await loadSample(state, change)) setIntroSeen(true);
                }}
              >{t('Örnek veriyle doldur')}</button>
              <button
                className="btn quiet"
                title={t('Bu satır bir daha çıkmaz; örnek veri Ayarlar → Hakkında’da durmaya devam eder')}
                onClick={() => {
                  markIntroSeen();
                  setIntroSeen(true);
                }}
              >{t('Bir daha gösterme')}</button>
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
        </div>
      )}

      {/* The list on the left, and on the right what the list MEANS: the same
          capacity numbers Kontrol shows, but while you are typing rather than
          one screen and one decision later.

          ONE panel, not two. "Kurulum durumu" used to sit under this one and
          repeat the four counters that are already in the strip above, plus a
          door to a tab that is already in the tab bar — "çok fazla kaydırma
          olmuş, gereksiz". The two sentences of its that said something
          nothing else said moved into the Sınıflar branch of Özet. */}
      <div className="cols">
        <div>{RENDER[current.id]({ state, change })}</div>

        <aside>
          <Summary state={state} change={change} step={current.id} />
        </aside>
      </div>
    </>
  );
}
