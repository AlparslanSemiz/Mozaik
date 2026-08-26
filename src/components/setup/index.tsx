// Setup, in numbered steps.
//
// It used to be one 1132-line scroll: everything was on screen at once and
// nothing said in which order to fill it in. The strip below is NOT a locked
// wizard — every step is reachable at any time — it only shows where you are
// and, through the counters, where something is still missing.
//
// Setup now holds ONLY the four lists that describe the school's people and
// rooms. Everything that is a setting — the school's name, its days, the bell,
// the rules, the subject list — moved to the Ayarlar tab, so this screen has
// exactly one kind of thing on it and every step can be counted.

import { sampleState } from '../../sample';
import { useDialogs } from '../Dialogs';
import { useToast } from '../Toasts';

import Rooms from './Rooms';
import Teachers from './Teachers';
import Classes from './Classes';
import Lessons from './Lessons';
import Summary from './Summary';
import Progress from './Progress';
import { drafts as draftsOf } from '../../library';
import { loadPlan } from '../../store';
import type { PanelProps, PlanControls } from '../props';
import type { StepId } from '../../toolState';
import { STEPS } from '../steps';

/**
 * The four lists' label, count and symbol live in `components/steps.tsx` — one
 * definition read by this shell, by the ribbon and by Progress. Only the
 * RENDERING of a step is this file's business, so only that is here.
 */
const RENDER: Record<StepId, (p: PanelProps) => React.ReactElement> = {
  rooms: (p) => <Rooms {...p} />,
  teachers: (p) => <Teachers {...p} />,
  classes: (p) => <Classes {...p} />,
  lessons: (p) => <Lessons {...p} />,
};

interface Props extends PanelProps {
  plans: PlanControls;
  /** Which of the four lists. Owned by App: the tool strip above shows it. */
  step: StepId;
  setStep: (next: StepId) => void;
}

export default function Setup({ state, change, plans, step, setStep }: Props) {
  const { confirm, alert } = useDialogs();
  const notify = useToast();
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
          <h2>Başlarken</h2>
          <p className="hint">
            Yukarıdaki adımları sırayla doldurun: önce <b>derslikler</b>, sonra{' '}
            <b>öğretmenler</b> ve <b>sınıflar</b>, en son her sınıfın <b>dersleri</b>.
            Elinizde Excel listesi varsa her adımdaki “Excel'den yapıştır” düğmesini
            kullanın — tek tek girmekten çok daha hızlı. Okulun günleri, zil saatleri
            ve kuralları <b>Ayarlar</b> sekmesinde.
          </p>
          <button
            className="btn"
            onClick={async () => {
              if (
                await confirm({
                  title: 'Örnek okul verisi yüklenecek',
                  body: '25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Aracın ne yaptığını görmek için — kendi verinizi girmeden önce Ayarlar → Veri → "Her şeyi sil" ile temizleyin.',
                  confirmLabel: 'Yükle',
                })
              ) {
                change(() => sampleState());
                notify('Örnek veri yüklendi.');
              }
            }}
          >
            Örnek veriyle doldur (25 öğretmen, 20 sınıf)
          </button>
          <p className="hint">
            Ne yaptığını görmek için. Kendi verinizi girmeden önce{' '}
            <b>Ayarlar → Veri → Her şeyi sil</b> ile temizleyin.
          </p>

          {templates.length > 0 && (
            <>
              <h3>Taslaktan başla</h3>
              <p className="hint">
                Daha önce <b>taslak</b> olarak işaretlediğiniz planların kurulumu hazır
                duruyor. Seçtiğinizden <b>yeni bir plan</b> açılır: derslikler,
                öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir.
                Taslağın kendisi değişmez.
              </p>
              <div className="form-row">
                {templates.map((d) => (
                  <button
                    key={d.id}
                    className="btn"
                    onClick={async () => {
                      const seed = loadPlan(d.id);
                      if (seed === null) {
                        await alert({
                          title: 'Bu taslağın verisi bulunamadı',
                          tone: 'warn',
                          body: 'Plan listesinde duruyor ama kendi anahtarı boş. Ayarlar → Veri → "Veriler nerede" tablosu hangi anahtarın kaç bayt tuttuğunu gösterir.',
                        });
                        return;
                      }
                      plans.createPlan(`${d.name} kopyası`, { ...seed, placements: {} });
                      notify(`"${d.name}" taslağından yeni bir plan açıldı.`);
                    }}
                  >
                    {d.name} ile başla
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* The list on the left, and on the right what the list MEANS: the same
          capacity numbers Kontrol shows, but while you are typing rather than
          one screen and one decision later.

          Progress ("Kurulum durumu") sits UNDER the summary in the right
          column, not under the list. It used to be on the left, on the grounds
          that "what do I do after this one" is a question about the work — but
          that put every panel on this screen in one column and left the right
          one ending halfway down. Both panels on the right answer the same kind
          of question: not what you are typing, but where it has got you.

          The "Sonraki adım" button that used to stand between them is gone.
          Moving between steps already had two homes — the four buttons in the
          ribbon and the rows of the Progress table — and a third one that could
          only ever go forwards was the weakest of them. */}
      <div className="cols wide-left">
        <div>{RENDER[current.id]({ state, change })}</div>

        <aside>
          <Summary state={state} step={current.id} />
          <Progress state={state} step={step} setStep={setStep} />
        </aside>
      </div>
    </>
  );
}
