export function AdminBar({ onSave, onDiscard, onAddSection, saving }) {
  return (
    <div className="admin-bar">
      <span className="admin-bar__label">Admin mode</span>
      <button className="btn" onClick={onAddSection}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" style={{ width: 14, height: 14 }}>
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
        Add section
      </button>
      <button className="btn btn--discard" onClick={onDiscard}>Discard</button>
      <button className="btn btn--save" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
