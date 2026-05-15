export function Footer({ config, adminMode, onConfigChange }) {
  return (
    <footer className="foot">
      <div className="foot__legend">
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: 'var(--pos)' }} />Above plan</span>
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: 'var(--warn)' }} />Below target, on watch</span>
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: 'var(--neg)' }} />Material miss</span>
      </div>
      {adminMode ? (
        <input
          className="editable"
          style={{ textAlign: 'right', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}
          value={config.footer}
          onChange={e => onConfigChange({ footer: e.target.value })}
        />
      ) : (
        <div>{config.footer}</div>
      )}
    </footer>
  );
}
