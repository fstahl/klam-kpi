const TABS = [
  { id: 'MTD',   label: 'Month' },
  { id: 'QTD',   label: 'Last 3 months' },
  { id: 'LASTQ', label: 'Last Quarter' },
  { id: 'YTD',   label: 'Year to Date' },
];

export function PeriodTabs({ value, onChange }) {
  return (
    <div className="period-tabs" role="tablist" aria-label="Reporting period">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`period-tab${value === t.id ? ' period-tab--active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
