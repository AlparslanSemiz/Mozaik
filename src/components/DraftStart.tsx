// "Taslaktan başla" — ONE component, two doors.
//
// It stood twice: in Kurulum's empty screen and in Ayarlar's plan library.
// Same `loadPlan` + `createPlan`, same guard, and the SAME sentence word for
// word in the failure alert — which is the tell. Two copies of an error
// message are two copies of a decision about what to say when something is
// missing, and the day one of them is improved the other becomes the older,
// wronger answer that somebody happens to hit.
//
// What genuinely differed was the label on the button and whether a toast went
// out, so those are the props. Everything else is here.

import { useDialogs } from './Dialogs';
import { useT } from './T';
import { loadPlan } from '../store';
import type { PlanControls } from './props';

interface Props {
  plans: PlanControls;
  /** What the button says: Kurulum invites, Ayarlar states. */
  label: (name: string) => string;
  /** Kurulum says so out loud; Ayarlar's list redraws under the reader's eyes. */
  notify?: (message: string) => void;
}

export default function DraftStart({ plans, label, notify }: Props) {
  const { alert } = useDialogs();
  const t = useT();
  const drafts = plans.library.plans.filter((p) => p.draft);
  if (drafts.length === 0) return null;

  return (
    <div className="form-row">
      {drafts.map((d) => (
        <button
          key={d.id}
          className="btn"
          onClick={async () => {
            const seed = loadPlan(d.id);
            if (seed === null) {
              await alert({
                title: t('Bu taslağın verisi bulunamadı'),
                tone: 'warn',
                body: t(
                  'Plan listesinde duruyor ama kendi anahtarı boş. Ayarlar → Hakkında → "Veriler nerede" tablosu hangi anahtarın kaç bayt tuttuğunu gösterir.',
                ),
              });
              return;
            }
            // The setup is copied and the GRID is not: a draft is a school
            // without a timetable, which is the whole reason to keep one.
            plans.createPlan(t('{ad} kopyası', { ad: d.name }), { ...seed, placements: {} });
            notify?.(t('"{ad}" taslağından yeni bir plan açıldı.', { ad: d.name }));
          }}
        >
          {label(d.name)}
        </button>
      ))}
    </div>
  );
}
