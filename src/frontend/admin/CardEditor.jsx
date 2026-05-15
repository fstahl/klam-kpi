import { useState } from 'react';

const COMPARISON_OPTIONS = [
  { value: 'none',       label: 'None' },
  { value: 'target',     label: 'vs Target' },
  { value: 'prev_month', label: 'vs Previous month' },
  { value: 'prev_year',  label: 'vs Same month last year' },
  { value: 'lastq',      label: 'vs Last quarter' },
];

const BAR_MODES = [
  { value: 'ratio',    label: 'Ratio (value ÷ target)' },
  { value: 'absolute', label: 'Absolute (value as %)' },
];

export function CardEditor({ card, sparkKeys, kpiFields, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...card });
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));

  const availableFields = Object.keys(kpiFields).filter(f =>
    !['label', 'range'].includes(f) && !f.endsWith('_delta') && !f.endsWith('_idx')
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Edit card</h3>

        <div className="modal__field">
          <label className="modal__label">Field</label>
          <select className="modal__select" value={draft.field} onChange={e => set({ field: e.target.value })}>
            {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="modal__row">
          <div className="modal__field">
            <label className="modal__label">Label</label>
            <input className="modal__input" value={draft.label} onChange={e => set({ label: e.target.value })} />
          </div>
          <div className="modal__field">
            <label className="modal__label">Unit</label>
            <input className="modal__input" placeholder="kSEK, %, …" value={draft.unit ?? ''} onChange={e => set({ unit: e.target.value })} />
          </div>
        </div>

        <div className="modal__field">
          <label className="modal__label">Tag (optional badge)</label>
          <input className="modal__input" placeholder="e.g. Consulting" value={draft.tag ?? ''} onChange={e => set({ tag: e.target.value || undefined })} />
        </div>

        <div className="modal__field">
          <label className="modal__label">Comparison</label>
          <select className="modal__select" value={draft.comparison ?? 'none'} onChange={e => set({ comparison: e.target.value })}>
            {COMPARISON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="modal__field">
          <label className="modal__label">Sparkline data series</label>
          <select className="modal__select" value={draft.spark ?? ''} onChange={e => set({ spark: e.target.value || undefined })}>
            <option value="">None</option>
            {sparkKeys.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="modal__field">
          <label className="modal__label">Target field (for progress bar)</label>
          <select className="modal__select" value={draft.target_field ?? ''} onChange={e => set({ target_field: e.target.value || undefined })}>
            <option value="">None</option>
            {Object.keys(kpiFields).filter(f => f.endsWith('_target')).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {draft.target_field && (
          <div className="modal__field">
            <label className="modal__label">Progress bar mode</label>
            <select className="modal__select" value={draft.bar_mode ?? 'ratio'} onChange={e => set({ bar_mode: e.target.value })}>
              {BAR_MODES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <label className="modal__check-label" style={{ marginBottom: 8 }}>
          <input type="checkbox" checked={!!draft.invert} onChange={e => set({ invert: e.target.checked })} />
          Invert delta colour (lower is better, e.g. costs)
        </label>

        <div className="modal__actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--save" onClick={() => onSave(draft)}>Save card</button>
        </div>
      </div>
    </div>
  );
}
