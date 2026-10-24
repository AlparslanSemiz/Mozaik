// Whether the first-run line has been seen.

import { INTRO_KEY, preference } from '../../leaf/preference';

// -------------------------------------------------- the first-run line
//
// Whether the reader has already been offered the sample school on the Kurulum
// screen. A machine fact, not a project fact: it belongs to this browser on this
// computer, exactly like the theme, and putting it in `State` would mean a
// backup carries somebody else's "I have seen this" — and would cost a schema
// migration for a hint.
//
// It is written when the reader ACTS (loads the sample, dismisses the line, or
// types in a first teacher or class), never on the first paint. Marking it as
// soon as the screen is drawn would make the line unreachable to anyone who
// reloaded before reading it, and it would also break every test that sets a
// preference and reloads before touching anything.

export const introPreference = preference<boolean>({
  key: INTRO_KEY,
  normalize: (raw) => raw === true || raw === 'gorundu',
  // A hint that cannot be remembered is shown again, and the harm is one line.
  fallback: () => false,
  encode: (seen) => (seen ? 'gorundu' : ''),
});

export const readIntroSeen = introPreference.read;

/** The only thing ever written: the line has been seen. */
export function markIntroSeen(): void {
  introPreference.write(true);
}
