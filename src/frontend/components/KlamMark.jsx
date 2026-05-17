export function KlamMark() {
  return (
    <div className="klammark">
      {/* Two brackets + two dots — the umlaut in "Kläm" as a brand mark */}
      <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path d="M6 6 L6 28"  stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="square"/>
        <path d="M28 6 L28 28" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="square"/>
        <circle cx="13.5" cy="17" r="2.6" fill="var(--accent)"/>
        <circle cx="20.5" cy="17" r="2.6" fill="var(--accent)"/>
      </svg>
      <span className="klammark__name">
        Kläm <span className="klammark__sub">KPI</span>
      </span>
    </div>
  );
}
