// "?": the sentences a screen used to say all the time, said when asked
// (Sadeleşme K1–K8, phase 1, 2026-11-16).
//
// A screen keeps at most two help sentences on view; the rest moved behind
// this button. One component everywhere, so the "?" looks the same and opens
// the same way on every panel, and phase 3's new tabs reuse it unchanged.
//
// A Radix Popover: a real <button> with `aria-expanded`, Esc and a click
// outside close it, and focus goes back to the "?" when it closes. The
// popover's content is mounted only while open, so a sentence behind it costs
// nothing on screen and nothing in the accessibility tree until it is asked
// for.

import type React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useT } from './T';

export function Help({
  topic,
  children,
}: {
  /** What the sentences are about: names the button ("Açıklama: Kurallar"). */
  topic: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="help-btn"
          aria-label={t('Açıklama: {konu}', { konu: t(topic) })}
          title={t('Açıklama')}
        >
          ?
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="help-pop"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
        >
          <div className="help-body">{children}</div>
          <Popover.Arrow className="split-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * A panel's heading with its "?" beside it: `<h2>` stays the panel's first
 * heading (its accessible name is the topic alone, not "Tema ?"), and the
 * button sits right after the word, where the eye already is.
 */
export function HelpHead({ topic, children }: { topic: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="panel-head with-help">
      <h2>{t(topic)}</h2>
      <Help topic={topic}>{children}</Help>
    </div>
  );
}
