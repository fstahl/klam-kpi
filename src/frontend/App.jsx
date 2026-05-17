import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TopBar } from './components/TopBar.jsx';
import { PeriodTabs } from './components/PeriodTabs.jsx';
import { KPICard } from './components/KPICard.jsx';
import { Footer } from './components/Footer.jsx';
import { AdminSection } from './admin/AdminSection.jsx';
import { AdminBar } from './admin/AdminBar.jsx';
import { AboutModal } from './components/AboutModal.jsx';
import { LicenseModal } from './components/LicenseModal.jsx';
import { monthName } from './utils/formatters.js';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Toggle theme" aria-label="Toggle theme">
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" /></svg>
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </button>
  );
}

function SortableAdminSection({ section, sectionIndex, data, allData, kpiFields, sparkKeys, usedFields,
  onUpdateSection, onDeleteSection, sensors }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handleCardDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = section.cards.map(c => c.id);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    onUpdateSection({ ...section, cards: arrayMove(section.cards, oldIdx, newIdx) });
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardDragEnd}>
      <div ref={setNodeRef} style={style}>
        <AdminSection
          section={section}
          sectionIndex={sectionIndex}
          data={data}
          allData={allData}
          kpiFields={kpiFields}
          sparkKeys={sparkKeys}
          usedFields={usedFields}
          onUpdateSection={onUpdateSection}
          onDeleteSection={onDeleteSection}
          dragHandleProps={{ ...listeners, ...attributes }}
        />
      </div>
    </DndContext>
  );
}

export default function App({ kpiData, config: initialConfig, kpiFields }) {
  const [period, setPeriod] = useState('MTD');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('kpi-theme') || 'light'; } catch { return 'light'; }
  });
  const [adminMode, setAdminMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aboutVersion, setAboutVersion] = useState(null);
  const [showLicense, setShowLicense] = useState(false);

  // Listen for Electron menu items
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanupAbout   = window.electronAPI.onShowAbout(({ version }) => setAboutVersion(version ?? null));
    const cleanupLicense = window.electronAPI.onShowLicense(() => setShowLicense(true));
    return () => { cleanupAbout(); cleanupLicense(); };
  }, []);

  const [liveConfig, setLiveConfig] = useState(initialConfig);
  const activeConfig = adminMode ? draft : liveConfig;

  useEffect(() => { setLiveConfig(initialConfig); }, [initialConfig]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try { localStorage.setItem('kpi-theme', theme); } catch {}
  }, [theme]);

  const data = kpiData[period];
  const sparkKeys = data?.sparks ? Object.keys(data.sparks) : [];
  const usedFields = new Set(activeConfig?.sections?.flatMap(s => s.cards.map(c => c.field)) ?? []);

  function enterAdmin() {
    setDraft(JSON.parse(JSON.stringify(liveConfig)));
    setAdminMode(true);
  }
  function discardAdmin() { setDraft(null); setAdminMode(false); }

  async function saveAdmin() {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('Save failed');
      setLiveConfig(draft);
      setAdminMode(false);
      setDraft(null);
    } catch (e) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function patchDraft(patch) {
    setDraft(d => ({ ...d, ...patch }));
  }

  function updateSection(index, updatedSection) {
    setDraft(d => {
      const sections = [...d.sections];
      sections[index] = updatedSection;
      return { ...d, sections };
    });
  }

  function deleteSection(index) {
    if (!confirm('Delete this section and all its cards?')) return;
    setDraft(d => ({ ...d, sections: d.sections.filter((_, i) => i !== index) }));
  }

  function addSection() {
    const newSection = {
      id: `section_${Date.now()}`,
      label: 'New Section',
      hint: '',
      cols: 3,
      cards: [],
    };
    setDraft(d => ({ ...d, sections: [...d.sections, newSection] }));
  }

  // DnD for sections
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleSectionDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft(d => {
      const ids = d.sections.map(s => s.id);
      const oldIdx = ids.indexOf(active.id);
      const newIdx = ids.indexOf(over.id);
      return { ...d, sections: arrayMove(d.sections, oldIdx, newIdx) };
    });
  }

  const tagline = activeConfig?.intro?.tagline?.replace('{month}', monthName(kpiData['MTD']?.label)) ?? '';

  return (
    <div className={`app${adminMode ? ' app--admin' : ''}`}>
      <div className="page" style={adminMode ? { paddingBottom: 100 } : {}}>
        <TopBar
          config={activeConfig}
          theme={theme}
          adminMode={adminMode}
          onConfigChange={adminMode ? patchDraft : () => {}}
        />

        <div className="page-title">
          {adminMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="editable"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(56px,7vw,104px)', lineHeight: 0.95, letterSpacing: '-0.035em', color: 'var(--fg)' }}
                value={activeConfig.intro.tagline}
                onChange={e => patchDraft({ intro: { ...activeConfig.intro, tagline: e.target.value } })}
              />
              <input
                className="editable"
                style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-mute)', maxWidth: 420 }}
                value={activeConfig.intro.description}
                onChange={e => patchDraft({ intro: { ...activeConfig.intro, description: e.target.value } })}
              />
            </div>
          ) : (
            <>
              <h1>{tagline}</h1>
              <p className="page-title__sub">{activeConfig?.intro?.description}</p>
            </>
          )}
        </div>

        <div className="controls">
          <PeriodTabs value={period} onChange={setPeriod} />
          <div className="toolbar">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.04em', marginRight: 8 }}>
              <span className="tnum" style={{ color: 'var(--fg)', fontWeight: 600 }}>{data?.range}</span>
            </span>
            {!adminMode && (
              <button className="btn" onClick={() => window.print()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Export PDF
              </button>
            )}
            <button
              className={`btn btn--icon${adminMode ? ' btn--active' : ''}`}
              onClick={adminMode ? discardAdmin : enterAdmin}
              title={adminMode ? 'Exit admin mode' : 'Enter admin mode'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {adminMode
                  ? <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" strokeLinecap="round" strokeLinejoin="round" />
                  : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" /></>}
              </svg>
            </button>
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
          </div>
        </div>

        {/* VIEW MODE */}
        {!adminMode && activeConfig?.sections?.map((section, si) => (
          <section key={section.id} className="section">
            <div className="section__head">
              <div className="section__title">
                <span className="section__num">{String(si + 1).padStart(2, '0')}</span>
                <div className="section__title-text">
                  <span className="section__name">{section.label}</span>
                  {section.hint && <span className="section__hint">{section.hint}</span>}
                </div>
              </div>
            </div>
            <div className="section__rule"><div className="section__rule-stub" /></div>
            <div className={`kpi-grid kpi-grid--${section.cols ?? 3}`}>
              {section.cards.map(card => (
                <KPICard key={card.id} card={card} data={data} allData={kpiData} kpiFields={kpiFields} />
              ))}
            </div>
          </section>
        ))}

        {/* ADMIN MODE */}
        {adminMode && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={draft.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {draft.sections.map((section, si) => (
                <SortableAdminSection
                  key={section.id}
                  section={section}
                  sectionIndex={si}
                  data={data}
                  allData={kpiData}
                  kpiFields={kpiFields}
                  sparkKeys={sparkKeys}
                  usedFields={usedFields}
                  sensors={sensors}
                  onUpdateSection={s => updateSection(si, s)}
                  onDeleteSection={() => deleteSection(si)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        <Footer config={activeConfig} adminMode={adminMode} onConfigChange={patchDraft} />
      </div>

      {adminMode && (
        <AdminBar onSave={saveAdmin} onDiscard={discardAdmin} onAddSection={addSection} saving={saving} />
      )}

      {aboutVersion !== null && (
        <AboutModal version={aboutVersion} onClose={() => setAboutVersion(null)} />
      )}

      {showLicense && (
        <LicenseModal onClose={() => setShowLicense(false)} />
      )}
    </div>
  );
}
