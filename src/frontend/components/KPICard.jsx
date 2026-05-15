import { Sparkline } from './Sparkline.jsx';
import { Delta } from './Delta.jsx';
import { fmt, fmtInt } from '../utils/formatters.js';
import { computeDelta, comparisonLabel } from '../utils/comparison.js';

export function KPICard({ card, data, allData, kpiFields = {} }) {
  const { field, field2, label, tag, unit, unit2, spark, comparison, invert, progress, target_field, bar_mode, note_field, type } = card;

  const raw = data[field];
  const fieldType = kpiFields[field]?.type;
  const displayValue = fieldType === 'percent' ? fmt(raw, 1) : fmtInt(raw);

  const delta = computeDelta(card, data, allData);
  const compLabel = comparisonLabel(comparison);
  const targetValue = target_field ? data[target_field] : null;
  const sparkData = spark ? data?.sparks?.[spark] : null;

  if (type === 'pair') {
    const raw2 = data[field2];
    return (
      <div className="kpi">
        <div className="kpi__label">
          <span>{label}</span>
          {tag && <span className="kpi__label-tag">{tag}</span>}
        </div>
        <div className="kpi__value tnum">
          <span>{displayValue}</span>
          {unit && <span className="kpi__unit">{unit}</span>}
        </div>
        {delta != null && (
          <div className="kpi__sub">
            <Delta value={delta} invert={invert} />
            <span className="kpi__sub-sep" />
            <span>{compLabel}</span>
          </div>
        )}
        <div className="kpi__pair">
          <div className="kpi__pair-item">
            <span className="kpi__pair-label">Recurring deals</span>
            <span className="kpi__pair-value tnum">{fmtInt(raw)}</span>
          </div>
          <div className="kpi__pair-item">
            <span className="kpi__pair-label">Annual value</span>
            <span className="kpi__pair-value tnum">{fmtInt(raw2)}<small>{unit2}</small></span>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar fill/marker logic
  let fillPct = 0, markerPct = null;
  if (progress && targetValue != null && targetValue !== 0) {
    if (bar_mode === 'absolute') {
      fillPct = Math.min(100, raw ?? 0);
      markerPct = Math.min(100, targetValue);
    } else {
      fillPct = Math.min(100, ((raw ?? 0) / targetValue) * 100);
      markerPct = 100;
    }
  }
  const fillColor = progress && targetValue != null && raw != null
    ? (bar_mode === 'absolute' && raw < targetValue ? 'var(--warn)' : 'var(--accent)')
    : 'var(--accent)';

  const subText = [
    compLabel,
    note_field && data[note_field] != null ? `${fmt(data[note_field], 1)}% margin` : null,
    targetValue != null && !progress ? `Target ${fmt(targetValue, 0)}${unit ?? ''}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="kpi">
      <div className="kpi__label">
        <span>{label}</span>
        {tag && <span className="kpi__label-tag">{tag}</span>}
      </div>
      <div className="kpi__value tnum">
        <span>{displayValue}</span>
        {unit && <span className="kpi__unit">{unit}</span>}
      </div>

      {(delta != null || subText) && (
        <div className="kpi__sub">
          {delta != null && <Delta value={delta} invert={!!invert} />}
          {delta != null && subText && <span className="kpi__sub-sep" />}
          {subText && <span>{subText}</span>}
        </div>
      )}

      {progress && targetValue != null && (
        <div className="kpi__bar">
          <div className="kpi__bar-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
          {markerPct != null && <div className="kpi__bar-marker" style={{ left: `${markerPct}%` }} />}
        </div>
      )}

      {sparkData && (
        <div className="kpi__spark-wrap">
          <Sparkline data={sparkData} stroke="var(--accent)" />
        </div>
      )}
    </div>
  );
}
