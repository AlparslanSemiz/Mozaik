import type { ReactNode } from 'react';

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
  return (
    <section className="panel add-panel">
      <div className="panel-head add-panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="add-panel-description">
        <p className="hint" title={more}>{description}</p>
      </div>
      {notice !== undefined && <div className="add-panel-notice">{notice}</div>}
      <div className="add-panel-body">{children}</div>
    </section>
  );
}
