/**
 * One limit box. Empty means "use the school-wide default", and the default is
 * shown as the placeholder so nobody has to remember what it was.
 */
export default function LimitBox({
  value,
  fallback,
  onSet,
  title,
}: {
  value: number | null;
  fallback: number;
  onSet: (next: number | null) => void;
  title: string;
}) {
  return (
    <input
      type="number"
      min={0}
      max={16}
      className="num"
      title={title}
      placeholder={fallback > 0 ? String(fallback) : '—'}
      defaultValue={value ?? ''}
      onBlur={(e) => {
        const text = e.target.value.trim();
        const next = text === '' ? null : Math.max(0, Number(text) || 0);
        onSet(next === null || next > 0 ? next : null);
      }}
    />
  );
}
