// The buttons under an empty screen: the step that is missing, and the
// school's name and bell, which live in the last tab and were never mentioned
// by any empty screen.

import type { State } from '../../leaf/model';
import { GoButton, type Place } from './GoTo';
import { useT } from './T';

/** The first list a timetable cannot do without, or null when all are there. */
export function missingStep(d: State): { to: Place; label: string } | null {
  if (d.teachers.length === 0)
    return { to: { tab: 'setup', step: 'teachers' }, label: 'Öğretmen ekle' };
  if (d.classes.length === 0) return { to: { tab: 'setup', step: 'classes' }, label: 'Sınıf ekle' };
  if (d.lessons.length === 0) return { to: { tab: 'lessons' }, label: 'Ders gir' };
  return null;
}

export function NextStep({ state }: { state: State }) {
  const t = useT();
  const missing = missingStep(state);
  return (
    <span className="empty-go">
      {missing !== null && (
        <GoButton to={missing.to} primary>
          {t(missing.label)}
        </GoButton>
      )}
      {state.settings.schoolName.trim() === '' && (
        <GoButton to={{ tab: 'settings', section: 'school' }}>
          {t('Okul adını ve zili gir')}
        </GoButton>
      )}
    </span>
  );
}
