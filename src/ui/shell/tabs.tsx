// The five tasks the top bar and the command palette lead to, with their
// drawings.

import type React from 'react';
import type { Tab } from '../../platform/prefs';
import { classIcon, teacherIcon } from '../program';

/**
 * The five tasks, along the TOP — on the same row as the document identity
 * and the file buttons (Sadeleşme, K1, 2026-11-16). There were seven places
 * before them; where each one's contents went is LAYOUT, "Sekmeler".
 *
 * They spent two versions in a left rail, on the argument that a horizontal
 * band costs the timetable a row. That argument was written against a 768px
 * screen and it was measured wrong for this one: the rail cost 92px of WIDTH on
 * every tab, and the tabs that are not Program have no width to spare.
 *
 * Icons are inline SVG (no library, works offline) and drawn on currentColor so
 * they are right in both themes. They differ in SILHOUETTE, not in detail: at
 * 22px a difference of details is invisible (learned in v0.8). Öğretmenler and
 * Sınıflar wear the two kinds' own drawings (`steps.tsx`): the tab and every
 * list, sheet and strip that names those people show one symbol for them.
 */
export const TABS: Array<{ id: Tab; label: string; icon: React.ReactElement }> = [
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
  { id: 'teachers', label: 'Öğretmenler', icon: teacherIcon },
  { id: 'classes', label: 'Sınıflar', icon: classIcon },
  {
    id: 'print',
    label: 'Yazdır ve gönder',
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
    id: 'school',
    label: 'Okul bilgileri',
    // A clipboard: what is filled in once at the start of a term.
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
];
