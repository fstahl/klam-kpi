export function AboutModal({ version, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="About Kläm KPI">

        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="about__header">
          <span className="about__wordmark">Kläm KPI</span>
          {version && <span className="about__version">v{version}</span>}
        </div>

        <p className="about__copy">
          On-premise KPI dashboard for small companies. Fill your spreadsheet, open the app, present.
        </p>

        <div className="about__rule" />

        <dl className="about__meta">
          <div className="about__meta-row">
            <dt>Author</dt>
            <dd>Fredrik Ståhl</dd>
          </div>
          <div className="about__meta-row">
            <dt>Copyright</dt>
            <dd>© 2026 Fredrik Ståhl</dd>
          </div>
          <div className="about__meta-row">
            <dt>License</dt>
            <dd>Proprietary — internal use within the Addtech AB group only</dd>
          </div>
        </dl>

        <p className="about__disclaimer">
          Provided "as is", without warranty. The author accepts no liability for
          the accuracy of any figures displayed or decisions made on their basis.
        </p>

      </div>
    </div>
  );
}
