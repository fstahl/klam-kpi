import { useState } from 'react';

// Fields that don't make sense as standalone cards
const EXCLUDE = new Set(['label', 'range']);
const isHelper = f => f.endsWith('_delta') || f.endsWith('_idx') || f.endsWith('_target') || f.endsWith('_pct') || f.endsWith('_ytd') || f.endsWith('_goal');

export function CardPicker({ kpiFields, usedFields, onAdd, onClose }) {
  const [selected, setSelected] = useState(null);

  const available = Object.entries(kpiFields)
    .filter(([f]) => !EXCLUDE.has(f) && !isHelper(f) && !usedFields.has(f))
    .map(([f, meta]) => ({ field: f, type: meta.type }));

  function handleAdd() {
    if (!selected) return;
    const meta = kpiFields[selected];
    onAdd({
      id: selected,
      field: selected,
      label: selected.replace(/_/g, ' '),
      unit: meta.type === 'percent' ? '%' : '',
      comparison: 'none',
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Add card</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-mute)', marginTop: 0, marginBottom: 16 }}>
          Pick a field from the KPI catalogue. You can configure label, comparison, and sparkline after adding.
        </p>

        {available.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-mute)' }}>All available fields are already on the dashboard.</p>
        ) : (
          <div className="card-picker__grid">
            {available.map(({ field, type }) => (
              <div
                key={field}
                className={`card-picker__item${selected === field ? ' card-picker__item--selected' : ''}`}
                onClick={() => setSelected(field)}
              >
                <div>{field.replace(/_/g, ' ')}</div>
                <div className="card-picker__field">{field} · {type}</div>
              </div>
            ))}
          </div>
        )}

        <div className="modal__actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--save" onClick={handleAdd} disabled={!selected}>Add card</button>
        </div>
      </div>
    </div>
  );
}
