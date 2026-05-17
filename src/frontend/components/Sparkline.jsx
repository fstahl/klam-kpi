// The dot is rendered as an absolutely-positioned HTML element rather than
// an SVG circle, because preserveAspectRatio="none" would squash any SVG
// circle into an ellipse when the card is wider than it is tall.
export function Sparkline({ data, height = 36, stroke = 'currentColor', fill = 'var(--spark-fill)' }) {
  if (!data || data.length < 2) return null;
  const pad = 6, w = 300, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * stepX, pad + (h - pad * 2) * (1 - (v - min) / range)]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points.at(-1)[0].toFixed(1)},${h - pad} L${points[0][0].toFixed(1)},${h - pad} Z`;

  // Express last point position as percentages so the dot tracks the line end
  // regardless of the rendered card width.
  const [ex, ey] = points[points.length - 1];
  const dotLeft = `${((ex / w) * 100).toFixed(2)}%`;
  const dotTop  = `${((ey / h) * 100).toFixed(2)}%`;

  return (
    <div className="kpi__spark" style={{ height }}>
      <svg style={{ width: '100%', height: '100%', display: 'block' }}
           viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={area} fill={fill} stroke="none" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        className="kpi__spark-dot"
        style={{
          left: dotLeft,
          top: dotTop,
          background: stroke,
          // Ring: surface colour gap, then the stroke colour again
          boxShadow: `0 0 0 2px var(--bg-elev), 0 0 0 3.5px ${stroke}`,
        }}
      />
    </div>
  );
}
