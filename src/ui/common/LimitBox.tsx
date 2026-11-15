import { useT } from './T';

/**
 * One limit box. Empty means "fall back to the wider number", and that number
 * is shown as the placeholder so nobody has to remember what it was.
 *
 * `fallback` is whatever the NEXT layer out actually says: the school's number
 * for a teacher's or a class's box, and the CLASS's for a lesson's — a
 * placeholder that names a number the empty box would not use is a lie.
 */
export default function LimitBox({
  value,
  fallback,
  onSet,
  title,
  label,
}: {
  value: number | null;
  fallback: number;
  onSet: (next: number | null) => void;
  title: string;
  /** The box's name for a screen reader; the title when not given. A title
   *  alone names it for the mouse only (axe `label-title-only`). */
  label?: string;
}) {
  const t = useT();
  return (
    <input
      type="number"
      min={0}
      max={16}
      className="num"
      title={title}
      aria-label={label ?? title}
      placeholder={fallback > 0 ? String(fallback) : t('yok')}
      defaultValue={value ?? ''}
      onBlur={(e) => {
        const text = e.target.value.trim();
        const next = text === '' ? null : Math.max(0, Number(text) || 0);
        onSet(next === null || next > 0 ? next : null);
      }}
    />
  );
}
