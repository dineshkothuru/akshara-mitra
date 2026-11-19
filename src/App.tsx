import { useState, useEffect } from 'react';
import { Lang, STRINGS } from './i18n';
import { StudentReadingStudio } from './components/StudentReadingStudio';
import { InclusiveAssessmentStudio } from './components/InclusiveAssessmentStudio';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SettingsModal } from './components/SettingsModal';
import { AppMenuDrawer } from './components/AppMenuDrawer';

export function App() {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('akshara-mitra:lang') as Lang) || 'te'
  );
  const [tab, setTab] = useState<'studio' | 'inclusive' | 'dashboard'>('studio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'school' | 'passages' | 'students'>('school');
  const [refreshKey, setRefreshKey] = useState(0);

  const t = STRINGS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${t.brand} · ${t.tagline}`;
    localStorage.setItem('akshara-mitra:lang', lang);
  }, [lang, t]);

  const handleConfigChange = () => {
    setRefreshKey((k) => k + 1);
  };

  const openSettingsTab = (targetTab: 'school' | 'passages' | 'students' = 'school') => {
    setSettingsInitialTab(targetTab);
    setIsSettingsOpen(true);
  };

  return (
    <div className="shell">
      {/* Sleek Top Header Bar */}
      <header className="bar">
        <div className="bar-brand">
          <div className="bar-logo">📖</div>
          <div className="bar-title">
            <div className="bar-title-row">
              <h1>{t.brand}</h1>
              <span className="desktop-only bar-badge">{t.gradesCoverage}</span>
            </div>
            <small className="desktop-only">{t.dept}</small>
          </div>
        </div>

        <div className="bar-actions">
          {/* Compact Language Toggle Pill */}
          <div className="lang-toggle" role="group" aria-label="Language Switcher">
            <button
              type="button"
              className={`lang-pill${lang === 'te' ? ' active' : ''}`}
              onClick={() => setLang('te')}
              aria-label="Telugu"
            >
              {lang === 'te' ? 'తెలుగు' : 'TE'}
            </button>
            <button
              type="button"
              className={`lang-pill${lang === 'en' ? ' active' : ''}`}
              onClick={() => setLang('en')}
              aria-label="English"
            >
              EN
            </button>
          </div>

          {/* Sleek Menu Button (Dark glass style) */}
          <button
            type="button"
            className="bar-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Application Menu"
            title="Menu & Settings"
          >
            <span className="bar-menu-icon">☰</span>
            <span className="desktop-only">{lang === 'te' ? 'మెనూ' : 'Menu'}</span>
          </button>
        </div>
      </header>

      {/* Desktop Top Navigation Tabs */}
      <nav className="nav-tabs desktop-only" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-tab${tab === 'studio' ? ' active' : ''}`}
          onClick={() => setTab('studio')}
        >
          🎙️ {t.tabStudio}
        </button>
        <button
          type="button"
          className={`nav-tab${tab === 'inclusive' ? ' active' : ''}`}
          onClick={() => setTab('inclusive')}
        >
          ♿ {t.tabInclusive}
        </button>
        <button
          type="button"
          className={`nav-tab${tab === 'dashboard' ? ' active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          📊 {t.tabDashboard}
        </button>
      </nav>

      {/* Main Content View */}
      <main key={refreshKey}>
        {/* Quick Start 3-Step Instruction Banner */}
        <div className="step-banner">
          <div className="step-banner-top">
            <span className="step-banner-title">
              💡 {lang === 'te' ? 'త్వరిత గైడ్ / వినియోగ విధానం' : 'How to Use Akshara Mitra'}
            </span>
            <span className="step-banner-sub">
              {t.sampleNote}
            </span>
          </div>
          <div className="step-items">
            <div className="step-item">
              <span className="step-num">1</span> {t.step1}
            </div>
            <div className="step-item">
              <span className="step-num">2</span> {t.step2}
            </div>
            <div className="step-item">
              <span className="step-num">3</span> {t.step3}
            </div>
          </div>
        </div>

        {tab === 'studio' && (
          <StudentReadingStudio lang={lang} onOpenSettings={() => openSettingsTab('passages')} />
        )}
        {tab === 'inclusive' && <InclusiveAssessmentStudio lang={lang} />}
        {tab === 'dashboard' && (
          <TeacherDashboard lang={lang} onOpenSettings={() => openSettingsTab('school')} />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Duolingo / Native App style) */}
      <nav className="mobile-bottom-nav mobile-only" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mob-nav-btn${tab === 'studio' ? ' active' : ''}`}
          onClick={() => setTab('studio')}
        >
          <span className="mob-nav-icon">🎙️</span>
          <span className="mob-nav-label">{lang === 'te' ? 'పఠనం' : 'Studio'}</span>
        </button>
        <button
          type="button"
          className={`mob-nav-btn${tab === 'inclusive' ? ' active' : ''}`}
          onClick={() => setTab('inclusive')}
        >
          <span className="mob-nav-icon">♿</span>
          <span className="mob-nav-label">CwSN</span>
        </button>
        <button
          type="button"
          className={`mob-nav-btn${tab === 'dashboard' ? ' active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <span className="mob-nav-icon">📊</span>
          <span className="mob-nav-label">{lang === 'te' ? 'టీచర్ డెస్క్' : 'Teacher'}</span>
        </button>
        <button
          type="button"
          className="mob-nav-btn"
          onClick={() => setIsMenuOpen(true)}
        >
          <span className="mob-nav-icon">☰</span>
          <span className="mob-nav-label">{lang === 'te' ? 'మెనూ' : 'Menu'}</span>
        </button>
      </nav>

      {/* Slide-Out Side Drawer Menu */}
      <AppMenuDrawer
        lang={lang}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={tab}
        onSelectTab={(selectedTab) => setTab(selectedTab)}
        onOpenSettings={(targetTab) => openSettingsTab(targetTab)}
        onResetAll={handleConfigChange}
      />

      {/* Configuration & Settings Modal */}
      <SettingsModal
        lang={lang}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChange={handleConfigChange}
        initialTab={settingsInitialTab}
      />
    </div>
  );
}
