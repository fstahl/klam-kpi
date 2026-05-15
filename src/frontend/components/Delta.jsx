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
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor">
          {good
            ? <path d="M3 7.5L6 4.5L9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            : <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      )}
      {sign}{Math.abs(v).toFixed(1)}{suffix}
    </span>
  );
}
