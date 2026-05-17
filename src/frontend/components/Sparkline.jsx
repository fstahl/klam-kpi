// viewBox width 300 keeps circles near-round at typical card widths (~300px).
// vectorEffect="non-scaling-stroke" keeps stroke at 1.4px regardless of scale.
export function Sparkline({ data, height = 36, stroke = 'currentColor', fill = 'var(--spark-fill)' }) {
  if (!data || data.length < 2) return null;
  const pad = 6, w = 300, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * stepX, pad + (h - pad * 2) * (1 - (v - min) / range)]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points.at(-1)[0].toFixed(1)},${h - pad} L${points[0][0].toFixed(1)},${h - pad} Z`;
  const [ex, ey] = points[points.length - 1];
  return (
    <svg className="kpi__spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" overflow="visible">
      <path d={area} fill={fill} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {/* End dot — outer ring filled with surface colour, inner dot filled with stroke colour */}
      <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="4" fill="var(--bg-elev)" stroke={stroke} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="2" fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
