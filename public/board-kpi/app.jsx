/* global React, ReactDOM, KPI_DATA, Sparkline, Delta, fmt, fmtInt */
const { useState, useEffect } = React;

// ============================================================
// Period tabs
// ============================================================
function PeriodTabs({ value, onChange }) {
  const tabs = [
    { id: "MTD",   label: "Month" },
    { id: "QTD",   label: "Last 3 months" },
    { id: "LASTQ", label: "Last Quarter" },
    { id: "YTD",   label: "Year to Date" },
  ];
  return (
    <div className="period-tabs" role="tablist" aria-label="Reporting period">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`period-tab ${value === t.id ? "period-tab--active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Card primitives
// ============================================================
function KPICard({ label, tag, children }) {
  return (
    <div className="kpi">
      <div className="kpi__label">
        <span>{label}</span>
        {tag && <span className="kpi__label-tag">{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function HeroValue({ value, unit, style }) {
  return (
    <div className="kpi__value tnum" style={style}>
      <span>{value}</span>
      {unit && <span className="kpi__unit">{unit}</span>}
    </div>
  );
}

// ============================================================
// Theme toggle (moon shown in light → click to go dark, sun shown in dark → click to go light)
// ============================================================
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}

// ============================================================
// Top bar
// ============================================================
function TopBar({ theme }) {
  const logoSrc = theme === "light"
    ? "assets/logo-primary-colour.png"
    : "assets/logo-primary-white.png";
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <img src={logoSrc} alt="POWER&D" className="topbar__logo" />
        <div className="topbar__crumb">
          <span className="topbar__crumb--sep" />
          <span className="topbar__title">Board KPI Report</span>
        </div>
      </div>
      <div className="topbar__meta">
        <strong>Monthly Board Update</strong>
        <span>Reported {dateStr} · Source: ERP, CRM, HRIS</span>
      </div>
    </header>
  );
}

// ============================================================
// Section wrapper
// ============================================================
function Section({ num, name, hint, children }) {
  return (
    <section className="section">
      <div className="section__head">
        <div className="section__title">
          <span className="section__num">{num}</span>
          <span className="section__name">{name}</span>
        </div>
        {hint && <span className="section__hint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

// ============================================================
// Commercial section
// ============================================================
function CommercialSection({ d }) {
  return (
    <Section num="01 / Commercial" name="New business & financial performance" hint="Currency: kSEK">
      <div className="kpi-grid kpi-grid--3">
        <KPICard label="New business won" tag="Controlled Motion">
          <HeroValue value={fmtInt(d.cm_count)} unit="deals" />
          <div className="kpi__sub">
            <Delta value={d.cm_delta} />
            <span className="kpi__sub-sep" />
            <span>vs target</span>
          </div>
          <div className="kpi__pair">
            <div className="kpi__pair-item">
              <span className="kpi__pair-label">Recurring deals</span>
              <span className="kpi__pair-value tnum">{fmtInt(d.cm_count)}</span>
            </div>
            <div className="kpi__pair-item">
              <span className="kpi__pair-label">Annual value</span>
              <span className="kpi__pair-value tnum">{fmtInt(d.cm_value)}<small>kSEK</small></span>
            </div>
          </div>
        </KPICard>

        <KPICard label="New business won" tag="Power Electronics">
          <HeroValue value={fmtInt(d.pe_count)} unit="deals" />
          <div className="kpi__sub">
            <Delta value={d.pe_delta} />
            <span className="kpi__sub-sep" />
            <span>vs target</span>
          </div>
          <div className="kpi__pair">
            <div className="kpi__pair-item">
              <span className="kpi__pair-label">Recurring deals</span>
              <span className="kpi__pair-value tnum">{fmtInt(d.pe_count)}</span>
            </div>
            <div className="kpi__pair-item">
              <span className="kpi__pair-label">Annual value</span>
              <span className="kpi__pair-value tnum">{fmtInt(d.pe_value)}<small>kSEK</small></span>
            </div>
          </div>
        </KPICard>

        <KPICard label="Profit / Working Capital" tag="R/RK">
          <HeroValue value={fmt(d.pwc, 1)} unit="%" />
          <div className="kpi__sub">
            <Delta value={d.pwc_delta} suffix="pp" />
            <span className="kpi__sub-sep" />
            <span>Target {fmt(d.pwc_target, 0)}%</span>
          </div>
          <div className="kpi__bar" aria-label={`P/WC progress to target ${fmt(d.pwc_target, 0)}%`}>
            <div className="kpi__bar-fill" style={{ width: `${Math.min(100, (d.pwc / d.pwc_target) * 100)}%` }} />
            <div className="kpi__bar-marker" style={{ left: `100%` }} />
          </div>
          <div className="kpi__target">
            <strong className="tnum">{fmt(d.pwc, 1)}%</strong> of target {fmt(d.pwc_target, 0)}%
          </div>
        </KPICard>
      </div>

      <div className="kpi-grid kpi-grid--3">
        <KPICard label="Revenue" tag={d.label}>
          <HeroValue value={fmtInt(d.revenue)} unit="kSEK" />
          <div className="kpi__sub">
            <Delta value={d.revenue_delta} />
            <span className="kpi__sub-sep" />
            <span>vs target</span>
          </div>
          <div className="kpi__spark-wrap">
            <Sparkline data={d.sparks.rev} stroke="var(--accent)" />
          </div>
        </KPICard>

        <KPICard label="EBITa" tag={d.label}>
          <HeroValue value={fmtInt(d.ebita)} unit="kSEK" />
          <div className="kpi__sub">
            <Delta value={d.ebita_delta} />
            <span className="kpi__sub-sep" />
            <span>vs target · {fmt(d.ebita_pct, 1)}% margin</span>
          </div>
          <div className="kpi__spark-wrap">
            <Sparkline data={d.sparks.ebita_pct} stroke="var(--accent)" />
          </div>
        </KPICard>

        <KPICard label="REX (EBITa)" tag={d.label}>
          <HeroValue value={fmt(d.rex, 1)} unit="%" style={{ marginTop: 0 }} />
          <div className="kpi__sub">
            <span>Result Expansion</span>
          </div>
        </KPICard>
      </div>
    </Section>
  );
}

// ============================================================
// Efficiency section
// ============================================================
function EfficiencySection({ d }) {
  return (
    <Section num="02 / Efficiency" name="Operating efficiency & cost discipline" hint="Index: 100 = on plan">
      <div className="kpi-grid kpi-grid--3">
        <KPICard label="Billing rate" tag="Consulting">
          <HeroValue value={fmt(d.billing, 0)} unit="%" />
          <div className="kpi__sub">
            <Delta value={d.billing_delta} suffix="pp" />
            <span className="kpi__sub-sep" />
            <span>Target {d.billing_target}%</span>
          </div>
          <div className="kpi__bar" aria-label={`Billing rate against target ${d.billing_target}%`}>
            <div
              className="kpi__bar-fill"
              style={{
                width: `${Math.min(100, d.billing)}%`,
                background: d.billing < d.billing_target ? "var(--warn)" : "var(--accent)"
              }}
            />
            <div className="kpi__bar-marker" style={{ left: `${d.billing_target}%` }} />
          </div>
          <div className="kpi__spark-wrap">
            <Sparkline data={d.sparks.bill} stroke="var(--accent)" />
          </div>
        </KPICard>

        <KPICard label="GP per employee" tag={d.label}>
          <HeroValue value={fmtInt(d.gp_emp)} unit="kSEK" />
          <div className="kpi__sub">
            <Delta value={d.gp_emp_delta} />
            <span className="kpi__sub-sep" />
            <span>vs target{d.gp_emp_idx != null ? ` · index ${fmt(d.gp_emp_idx, 1)}` : ""}</span>
          </div>
          <div className="kpi__spark-wrap">
            <Sparkline data={d.sparks.gp} stroke="var(--accent)" />
          </div>
        </KPICard>

        <KPICard label="Administration cost" tag={d.label}>
          <HeroValue value={fmtInt(d.admin)} unit="kSEK" />
          <div className="kpi__sub">
            <Delta value={d.admin_delta} invert={true} />
            <span className="kpi__sub-sep" />
            <span>vs target{d.admin_idx != null ? ` · index ${fmt(d.admin_idx, 1)}` : ""}</span>
          </div>
          <div className="kpi__spark-wrap">
            <Sparkline data={d.sparks.adm} stroke="var(--accent)" />
          </div>
        </KPICard>
      </div>
    </Section>
  );
}

// ============================================================
// People section
// ============================================================
function PeopleSection({ d }) {
  const annualGoal = d.converted_goal;
  const ytdPct = Math.round((d.converted_ytd / annualGoal) * 100);
  const monthNames = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  const calMonth = monthNames[d.label.slice(0, 3)] || 1;
  const fyMonth = calMonth >= 4 ? calMonth - 3 : calMonth + 9;
  const linearPacePct = (fyMonth / 12) * 100;
  const linearTarget = Math.round((fyMonth / 12) * annualGoal);

  return (
    <Section num="03 / People" name="Talent conversion" hint="Consultants → Employees">
      <div className="kpi-grid kpi-grid--1">
        <KPICard label="Consultants converted" tag={d.label}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginTop: "auto", flexWrap: "wrap" }}>
            <HeroValue value={fmtInt(d.converted)} unit={d.converted === 1 ? "person" : "people"} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", textAlign: "right" }}>
              <span className="kpi__pair-label">Year to date</span>
              <span className="kpi__pair-value tnum" style={{ fontSize: 36 }}>{fmtInt(d.converted_ytd)}</span>
            </div>
          </div>
          <div className="kpi__sub" style={{ marginTop: 4 }}>
            <span>Annual goal {annualGoal} conversions</span>
            <span className="kpi__sub-sep" />
            <span className="tnum">{ytdPct}% to plan</span>
          </div>
          <div className="kpi__bar" aria-label="Conversions vs annual goal">
            <div className="kpi__bar-fill" style={{ width: `${Math.min(100, (d.converted_ytd / annualGoal) * 100)}%` }} />
            <div className="kpi__bar-marker" style={{ left: `${linearPacePct}%` }} />
          </div>
          <div className="kpi__target">
            Linear pace through {d.label.split(" ")[0]} would imply <strong className="tnum">~{linearTarget}</strong> conversions
          </div>
        </KPICard>
      </div>
    </Section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  return (
    <footer className="foot">
      <div className="foot__legend">
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: "var(--pos)" }} />Above plan</span>
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: "var(--warn)" }} />Below target, on watch</span>
        <span className="foot__legend-item"><span className="foot__dot" style={{ background: "var(--neg)" }} />Material miss</span>
      </div>
      <div>POWER&amp;D · Confidential · Board materials</div>
    </footer>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  const [period, setPeriod] = useState("MTD");
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("kpi-theme") || "light"; } catch { return "light"; }
  });
  const d = KPI_DATA[period];

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try { localStorage.setItem("kpi-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const handlePrint = () => window.print();

  return (
    <div className="app">
      <div className="page">
        <TopBar theme={theme} />

        <div className="page-title">
          <h1>{({ Jan:"January", Feb:"February", Mar:"March", Apr:"April", May:"May", Jun:"June", Jul:"July", Aug:"August", Sep:"September", Oct:"October", Nov:"November", Dec:"December" })[KPI_DATA["MTD"].label.slice(0,3)] || KPI_DATA["MTD"].label.split(" ")[0]}<br/>at a glance.</h1>
          <p className="page-title__sub">
            Nine board KPIs across commercial growth, operating efficiency, and people.
            Use the period selector to switch between month, quarter, and year to date.
          </p>
        </div>

        <div className="controls">
          <PeriodTabs value={period} onChange={setPeriod} />
          <div className="toolbar">
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-mute)", letterSpacing: "0.04em", marginRight: 8 }}>
              <span className="tnum" style={{ color: "var(--fg)", fontWeight: 600 }}>{d.range}</span>
            </span>
            <button className="btn" onClick={handlePrint} title="Export to PDF (Cmd/Ctrl+P)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export PDF
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        <CommercialSection d={d} />
        <EfficiencySection d={d} />
        <PeopleSection d={d} />

        <Footer />
      </div>
    </div>
  );
}

window.__kpiDataReady.then(() => {
  if (!window.KPI_DATA) return; // error already shown
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
});
