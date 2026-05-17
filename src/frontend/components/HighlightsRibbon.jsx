import { fmt, fmtInt } from '../utils/formatters.js';
import { computeDelta } from '../utils/comparison.js';
import { Delta } from './Delta.jsx';

/**
 * HighlightsRibbon — scannable summary band.
 *
 * Collects every card with `highlight: true` from all sections (in section
 * order) and renders them as a compact horizontal strip between the controls
 * row and the first section. Shows label · value + unit · delta pill only —
 * no sparkline, no narrative.
 */
export function HighlightsRibbon({ config, data, allData, kpiFields = {} }) {
  const cards = config?.sections?.flatMap(s => s.cards.filter(c => c.highlight)) ?? [];
  if (!cards.length || !data) return null;

  return (
    <div className="ribbon" role="region" aria-label="Highlights">
      {cards.map((card, i) => {
        const { field, label, unit, invert } = card;
        const raw = data[field];
        const fieldType = kpiFields[field]?.type;
        const displayValue = fieldType === 'percent' ? fmt(raw, 1) : fmtInt(raw);
        const delta = computeDelta(card, data, allData);

        return (
          <div key={card.id} className="ribbon__item">
            {i > 0 && <div className="ribbon__sep" aria-hidden="true" />}
            <span className="ribbon__label">{label}</span>
            <span className="ribbon__value tnum">
              {displayValue}
              {unit && <span className="ribbon__unit">{unit}</span>}
            </span>
            {delta != null && (
              <Delta value={delta} invert={!!invert} />
            )}
          </div>
        );
      })}
    </div>
  );
}
