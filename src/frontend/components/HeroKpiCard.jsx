import { Sparkline } from './Sparkline.jsx';
import { fmt, fmtInt } from '../utils/formatters.js';
import { computeDelta } from '../utils/comparison.js';

export function HeroKpiCard({ card, data, allData, kpiFields = {} }) {
  const { field, label, unit, spark, invert, narrative } = card;

  const raw = data[field];
  const fieldType = kpiFields[field]?.type;
  const displayValue = fieldType === 'percent' ? fmt(raw, 1) : fmtInt(raw);

  const delta = computeDelta(card, data, allData);
  const sparkData = spark ? data?.sparks?.[spark] : null;

  const isUp = delta != null && (invert ? delta < 0 : delta > 0);
  const deltaStr = delta != null
    ? `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta).toFixed(1)}%`
    : null;

  return (
    <div className="hero-kpi">

      {/* Left — label, number, delta, narrative */}
      <div className="hero-kpi__left">
        <div className="hero-kpi__label">{label}</div>

        <div className="hero-kpi__value tnum">
          {displayValue}
          {unit && <span className="hero-kpi__unit">{unit}</span>}
        </div>

        {deltaStr && (
          <div className="hero-kpi__delta-row">
            <span className="hero-kpi__pill tnum">
              <svg viewBox="0 0 11 11" fill="currentColor" aria-hidden="true"
                   style={{ width: 11, height: 11, flexShrink: 0, transform: isUp ? 'none' : 'rotate(180deg)' }}>
                <path d="M5.5 2 L9 6.5 L6.5 6.5 L6.5 9.5 L4.5 9.5 L4.5 6.5 L2 6.5 Z"/>
              </svg>
              {deltaStr}
            </span>
            <span className="hero-kpi__delta-sep" aria-hidden="true">·</span>
            <span className="hero-kpi__delta-label">vs target</span>
          </div>
        )}

        {narrative && <p className="hero-kpi__narrative">{narrative}</p>}
      </div>

      {/* Right — large sparkline */}
      {sparkData && (
        <div className="hero-kpi__right">
          <Sparkline
            data={sparkData}
            height={160}
            stroke="var(--accent-ink)"
            fill="var(--on-accent-fill)"
            surface="var(--accent)"
          />
        </div>
      )}
    </div>
  );
}
