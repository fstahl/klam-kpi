/* global React */

// ============================================================
// Sparkline — clean line + soft area fill
// ============================================================
function Sparkline({ data, height = 36, stroke = "currentColor", fill = "var(--spark-fill)" }) {
  const pad = 2;
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(2)},${h - pad} L${points[0][0].toFixed(2)},${h - pad} Z`;
  return (
    <svg className="kpi__spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={fill} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ============================================================
// Delta pill
// ============================================================
function Delta({ value, suffix = "%", invert = false }) {
  if (value == null || !Number.isFinite(Number(value))) {
    return <span className="kpi__delta kpi__delta--flat tnum">—</span>;
  }
  const v = Number(value);
  const isFlat = Math.abs(v) < 0.05;
  const good = invert ? v < 0 : v > 0;
  const cls = isFlat ? "kpi__delta--flat" : (good ? "kpi__delta--pos" : "kpi__delta--neg");
  const sign = v > 0 ? "+" : (v < 0 ? "−" : "");
  const display = Math.abs(v).toFixed(1);
  return (
    <span className={`kpi__delta ${cls} tnum`}>
      {!isFlat && (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor">
          {good
            ? <path d="M3 7.5L6 4.5L9 7.5" strokeLinecap="round" strokeLinejoin="round"/>
            : <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>}
        </svg>
      )}
      {sign}{display}{suffix}
    </span>
  );
}

// ============================================================
// Number formatters — Swedish thousands convention (narrow NBSP)
// ============================================================
function fmt(n, decimals = 1) {
  if (n == null) return "—";
  return new Intl.NumberFormat("sv-SE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function fmtInt(n) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));
}

window.Sparkline = Sparkline;
window.Delta = Delta;
window.fmt = fmt;
window.fmtInt = fmtInt;
