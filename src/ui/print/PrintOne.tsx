// The person page's Yazdır (Sadeleşme, K5): ONE teacher's or one class's
// sheet, straight to the printer, without going through Çıktı.
//
// Two clicks from the list: the row opens the page, Yazdır opens the
// browser's print window. Çıktı's own tick lists are not touched — a single
// sheet printed from a person is not a decision about the next printout, the
// same reason `Excluded` lives outside `State`.
//
// The sheet is drawn into its own box under <body>, and while it is there the
// root carries `print-one`: on paper that hides everything else
// (styles.css, "print-one"). The pattern is the question sheet's
// (`Suggestions.tsx`, `print-questions`): drawn, printed, taken down again.

import { printStamp } from '../../leaf/app';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { State } from '../../leaf/model';
import { blockSpans, buildIndex } from '../../pure/constraints';
import { classSheet, sheetHead, teacherSheet } from '../../pure/paper';
import { markPrinted, readPrintOptions } from '../../platform/prefs';
import { useT } from '../common';
import Sheet from './Sheet';

export function PrintOne({
  state,
  kind,
  id,
  colored,
  done,
}: {
  state: State;
  kind: 'teacher' | 'class';
  id: string;
  colored: boolean;
  /** Called once the print window has closed. */
  done: () => void;
}) {
  const t = useT();
  // Read once: the printout is one moment, and Çıktı writes every change of
  // these through to the same store (`writePrintOptions`).
  const options = useMemo(readPrintOptions, []);
  const sheet = useMemo(() => {
    const ix = buildIndex(state);
    const spans = blockSpans(state);
    if (kind === 'teacher') {
      const teacher = ix.teacherById.get(id);
      return teacher === undefined ? null : teacherSheet(state, ix, spans, teacher, options);
    }
    const group = ix.classById.get(id);
    return group === undefined ? null : classSheet(state, ix, spans, group, options, t);
  }, [state, kind, id, options, t]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('print-one');
    // The one Başlarken step the plan cannot show (Checklist.tsx).
    markPrinted();
    window.addEventListener('afterprint', done, { once: true });
    const frame = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', done);
      root.classList.remove('print-one');
    };
  }, [done]);

  if (sheet === null) return null;
  return createPortal(
    <div className="print-one-box" aria-hidden="true">
      <div className="print-area" data-per={1} data-size={options.size}>
        <div className="print-sheet">
          <Sheet
            sheet={sheet}
            head={sheetHead(state, options)}
            colored={colored}
            stamped={options.stamp ? printStamp(new Date()) : null}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
