export function Delta({ value, suffix = '%', invert = false }) {
  if (value == null || !Number.isFinite(Number(value))) {
    return <span className="kpi__delta kpi__delta--flat tnum">—</span>;
  }
  const v = Number(value);
  const isFlat = Math.abs(v) < 0.05;
  const good = invert ? v < 0 : v > 0;
  const cls = isFlat ? 'kpi__delta--flat' : (good ? 'kpi__delta--pos' : 'kpi__delta--neg');
  const sign = v > 0 ? '+' : (v < 0 ? '−' : '');
  return (
    <span className={`kpi__delta ${cls} tnum`}>
      {!isFlat && (
        // Filled arrow — up or down. Path is a chunky upward arrow; rotated 180° for down.
        <svg viewBox="0 0 11 11" fill="currentColor" style={{ transform: good ? 'none' : 'rotate(180deg)' }}>
          <path d="M5.5 2 L9 6.5 L6.5 6.5 L6.5 9.5 L4.5 9.5 L4.5 6.5 L2 6.5 Z" />
        </svg>
      )}
      {sign}{Math.abs(v).toFixed(1)}{suffix}
    </span>
  );
}
