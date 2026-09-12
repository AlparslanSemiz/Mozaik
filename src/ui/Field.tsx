import type { ReactNode } from 'react';

/**
 * One labelled control. The label wraps the input, so clicking the text focuses
 * the box and screen readers (and the E2E tests) find it by name — without an
 * id/htmlFor pair to keep in sync.
 *
 * `wide` stacks the label above a full-width control. It exists because three
 * call sites were writing `<label className="field field-wide">` by hand and
 * bypassing this component to get it.
 */
export default function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? 'field field-wide' : 'field'}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
