import type { ReactNode } from 'react';

/**
 * One labelled control. The label wraps the input, so clicking the text focuses
 * the box and screen readers (and the E2E tests) find it by name — without an
 * id/htmlFor pair to keep in sync.
 */
export default function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
