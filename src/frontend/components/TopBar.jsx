import { KlamMark } from './KlamMark.jsx';

export function TopBar({ config, theme, adminMode, onConfigChange }) {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <KlamMark />
        <div className="topbar__crumb">
          <span className="topbar__crumb--sep" />
          {adminMode ? (
            <input
              className="topbar__title editable"
              value={config.header.title}
              onChange={e => onConfigChange({ header: { ...config.header, title: e.target.value } })}
            />
          ) : (
            <span className="topbar__title">{config.header.title}</span>
          )}
        </div>
      </div>

      <div className="topbar__meta">
        {adminMode ? (
          <>
            <input
              className="editable"
              style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 2, textAlign: 'right' }}
              value={config.header.meta}
              onChange={e => onConfigChange({ header: { ...config.header, meta: e.target.value } })}
            />
            <input
              className="editable"
              style={{ fontSize: 13, textAlign: 'right' }}
              value={config.header.source}
              onChange={e => onConfigChange({ header: { ...config.header, source: e.target.value } })}
            />
          </>
        ) : (
          <>
            <strong>{config.header.meta}</strong>
            <span>Reported {dateStr} · Source: {config.header.source}</span>
          </>
        )}
      </div>
    </header>
  );
}
