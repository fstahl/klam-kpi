export function TopBar({ config, theme, adminMode, onConfigChange }) {
  const logoSrc = theme === 'dark' ? config.branding.logoDark : config.branding.logoLight;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: ev.target.result, filename: file.name }),
      });
      if (res.ok) {
        const { path } = await res.json();
        const key = theme === 'dark' ? 'logoDark' : 'logoLight';
        onConfigChange({ branding: { ...config.branding, [key]: path } });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <header className="topbar">
      <div className="topbar__brand">
        {adminMode ? (
          <label className="topbar__logo-wrap" title="Click to replace logo">
            <img src={logoSrc} alt="Logo" className="topbar__logo" />
            <div className="topbar__logo-overlay">Replace</div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </label>
        ) : (
          <img src={logoSrc} alt="Logo" className="topbar__logo" />
        )}
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
