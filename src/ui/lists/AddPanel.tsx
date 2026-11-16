import type { ReactNode } from 'react';
import { Help } from '../common';

interface Props {
  title: ReactNode;
  /** One sentence. What the screen is for, in the width of the rail. */
  description: ReactNode;
  /** The rest of it, on hover. The description rail is one line high and the
      reader asked for short ("infoları olabildiğince anlaşılır kısa ve öz
      yap"); what does not fit a sentence is detail, and detail belongs where
      it is looked for rather than where it is read past every time. */
  more?: string;
  action?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
}

/** The one geometry used by every "Yeni …" area. */
export default function AddPanel({ title, description, more, action, notice, children }: Props) {
  // The description and its detail are behind the heading's "?" since
  // Sadeleşme phase 1 (2026-11-16): five list screens each opened with a
  // sentence read past every time, and the detail was a hover nobody found.
  return (
    <section className="panel add-panel">
      <div className="panel-head add-panel-head">
        <h2>{title}</h2>
        <Help topic={typeof title === 'string' ? title : ''}>
          <p>{description}</p>
          {more !== undefined && <p>{more}</p>}
        </Help>
        {action}
      </div>
      {notice !== undefined && <div className="add-panel-notice">{notice}</div>}
      <div className="add-panel-body">{children}</div>
    </section>
  );
}
