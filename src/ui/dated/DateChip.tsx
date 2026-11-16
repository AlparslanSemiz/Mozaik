// The Program strip's one door to the dated layer (v18): "Bugün kim yok?",
// or, once this week has changes, what they are: "Bu hafta: 18–22 Kasım, 3
// değişiklik". It opens today's page (`DayDialog`). A past week is not said:
// its changes stopped mattering when it ended.

import { CalendarX } from 'lucide-react';
import { useState } from 'react';
import { dayStamp } from '../../leaf/app';
import type { State } from '../../leaf/model';
import { weekChanges, weekLabel } from '../../pure/dated';
import { useT } from '../common';
import { DayDialog } from './DayDialog';
import { showWeek } from './shownWeek';

export function DateChip({
  state,
  change,
}: {
  state: State;
  change: (apply: (d: State) => State, label?: string) => void;
}) {
  const t = useT();
  const [date, setDate] = useState<string | null>(null);
  const today = dayStamp(new Date());
  const n = weekChanges(state, today);
  return (
    <>
      <button className={n > 0 ? 'btn dated-on' : 'btn'} onClick={() => setDate(today)}>
        <CalendarX size={16} strokeWidth={2} aria-hidden="true" />
        {n > 0
          ? t('Bu hafta: {gunler}, {n} değişiklik', { gunler: weekLabel(state, today), n })
          : t('Bugün kim yok?')}
      </button>
      <DayDialog
        state={state}
        change={change}
        date={date}
        setDate={setDate}
        onClose={() => setDate(null)}
        onShow={() => {
          showWeek(date);
          setDate(null);
        }}
      />
    </>
  );
}
