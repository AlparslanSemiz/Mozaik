// The seven sections the top bar and the command palette lead to, with their
// drawings.

import type React from 'react';
import type { Tab } from '../../platform/prefs';
import { lessonIcon } from '../program';

/**
 * The seven sections, along the TOP — on the same row as the document identity
 * and the file buttons.
 *
 * They spent two versions in a left rail, on the argument that a horizontal
 * band costs the timetable a row. That argument was written against a 768px
 * screen and it was measured wrong for this one: the rail cost 92px of WIDTH on
 * every tab, and the tabs that are not Program have no width to spare — that is
 * why the right-hand side of every screen sat empty.
 *
 * The band costs a row only if it is a band of its own. It is not: identity,
 * sections, history and file share one 44px row, and the tab's own tools get a
 * second one. Measured, the whole head is SHORTER than the rail layout's was
 * (139px -> 114px), because the rail's top bar was 59px of mostly air.
 *
 * Icons are inline SVG (no library, works offline) and drawn on currentColor so
 * they are right in both themes. They differ in SILHOUETTE, not in detail: at
 * 22px a difference of details is invisible (learned in v0.8).
 */
export const TABS: Array<{ id: Tab; label: string; icon: React.ReactElement }> = [
  {
    id: 'setup',
    label: 'Okul',
    // A clipboard: the four lists you fill in at the start of a term.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v14A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 17.5 4H16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect x="8.5" y="2.5" width="7" height="3.4" rx="1" fill="currentColor" />
        <path d="M8 10h8M8 13.5h8M8 17h5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'availability',
    label: 'Müsaitlik',
    // A calendar with a cross in it: the hours somebody cannot come.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 3v3.5M17 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M9.5 13l5 5M14.5 13l-5 5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'Dersler',
    // The open book, and the ONE copy of it: `steps.tsx` owns the drawing
    // because the three kinds beside it are owned there too, and a symbol that
    // means the same thing in two rooms has to be one drawing (pitfall 56's
    // family — two answers to "what does this look like" is two answers).
    icon: lessonIcon,
  },
  {
    id: 'program',
    label: 'Program',
    // The grid itself, with one cell filled: a lesson sitting in its slot.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9.5" width="6" height="5.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'check',
    label: 'Kontrol',
    // A magnifier over a tick: the tab that says WHY it cannot be built.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="10.5" cy="10.5" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M7.4 10.6l2.4 2.6 4.3-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15.6 15.6L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'print',
    label: 'Çıktı',
    // A printer with paper coming out.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M7 3.5h10v4H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M4 8.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-2M6 16H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="6.5"
          y="13"
          width="11"
          height="7.5"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="17.6" cy="11" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  // Last, the way a settings menu sits at the end of a toolbar: it is opened
  // when the school changes, not while a timetable is being laid out.
  {
    id: 'settings',
    label: 'Ayarlar',
    // Three sliders. A cog reads as a blob at 22px; sliders keep a silhouette.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M3 7h18M3 12h18M3 17h18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8" cy="7" r="2.6" fill="var(--paper)" stroke="currentColor" strokeWidth="1.8" />
        <circle
          cx="16"
          cy="12"
          r="2.6"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="10.5"
          cy="17"
          r="2.6"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
];
