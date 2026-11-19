import { useState, useEffect } from 'react';
import { getStoredSchoolConfig, resetPassagesToDefault, resetStudentsToDefault, SchoolConfig } from '../data/config-storage';
import { Lang, STRINGS } from '../i18n';

interface Props {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'studio' | 'inclusive' | 'dashboard';
  onSelectTab: (tab: 'studio' | 'inclusive' | 'dashboard') => void;
  onOpenSettings: (initialTab?: 'school' | 'passages' | 'students') => void;
  onResetAll: () => void;
}

export function AppMenuDrawer({
  lang,
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onResetAll,
}: Props) {
  const t = STRINGS[lang];
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getStoredSchoolConfig);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSchoolConfig(getStoredSchoolConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    resetPassagesToDefault();
    resetStudentsToDefault();
    onResetAll();
    setResetNotice(lang === 'te' ? '✓ డిఫాల్ట్ సెట్టింగ్స్ రీసెట్ అయ్యాయి!' : '✓ Reset to defaults!');
    setTimeout(() => {
      setResetNotice(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="bar-logo" style={{ width: 38, height: 38, fontSize: '1.2rem', borderRadius: 12 }}>
              📖
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>
                {t.brand}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                {t.dept}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close Menu">
            ✕
          </button>
        </div>

        {resetNotice && (
          <div style={{ background: 'var(--green-soft)', color: 'var(--green-dark)', padding: '10px 14px', borderRadius: 12, fontWeight: 700, fontSize: '0.84rem' }}>
            {resetNotice}
          </div>
        )}

        {/* Current Active School Card */}
        <div className="drawer-school-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🏫</span>
            <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>{schoolConfig.schoolName}</b>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
            📍 {schoolConfig.mandal} మండలం, {schoolConfig.district} · {schoolConfig.academicYear}
          </p>
          <div style={{ marginTop: 8 }}>
            <span className="pill pill-level4" style={{ fontSize: '0.76rem' }}>
              {t.gradesCoverage}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="drawer-section">
          <span className="drawer-section-title">
            {lang === 'te' ? 'విభాగాలు (Navigation)' : 'Navigation'}
          </span>
          <div className="drawer-links">
            <button
              type="button"
              className={`drawer-link${activeTab === 'studio' ? ' active' : ''}`}
              onClick={() => {
                onSelectTab('studio');
                onClose();
              }}
            >
              <span className="drawer-link-icon">🎙️</span>
              <div className="drawer-link-text">
                <b>{t.tabStudio}</b>
                <small>{lang === 'te' ? 'లైవ్ వాయిస్ AI పఠన పరీక్ష' : 'Live Voice AI Reading Studio'}</small>
              </div>
            </button>

            <button
              type="button"
              className={`drawer-link${activeTab === 'inclusive' ? ' active' : ''}`}
              onClick={() => {
                onSelectTab('inclusive');
                onClose();
              }}
            >
              <span className="drawer-link-icon">♿</span>
              <div className="drawer-link-text">
                <b>{t.tabInclusive}</b>
                <small>{lang === 'te' ? 'అంధ, వినికిడి & మూగ విద్యార్థులకు' : 'Blind, Deaf & Mute Modalities'}</small>
              </div>
            </button>

            <button
              type="button"
              className={`drawer-link${activeTab === 'dashboard' ? ' active' : ''}`}
              onClick={() => {
                onSelectTab('dashboard');
                onClose();
              }}
            >
              <span className="drawer-link-icon">📊</span>
              <div className="drawer-link-text">
                <b>{t.tabDashboard}</b>
                <small>{lang === 'te' ? 'తరగతి 1–5 ప్రగతి & తల్లిదండ్రుల స్లిప్' : 'Class 1–5 Roster & Parent Slips'}</small>
              </div>
            </button>
          </div>
        </div>

        {/* Customization & Settings Section */}
        <div className="drawer-section">
          <span className="drawer-section-title">
            {lang === 'te' ? 'అనుకూలీకరణ & సెట్టింగ్స్' : 'Configuration & Tools'}
          </span>
          <div className="drawer-links">
            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                onClose();
                onOpenSettings('school');
              }}
            >
              <span className="drawer-link-icon">🏫</span>
              <div className="drawer-link-text">
                <b>{lang === 'te' ? 'పాఠశాల వివరాలు మార్చండి' : 'Edit School Information'}</b>
                <small>{lang === 'te' ? 'పేరు, మండలం, జిల్లాను సెట్ చేయండి' : 'Change School, Mandal, District'}</small>
              </div>
            </button>

            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                onClose();
                onOpenSettings('passages');
              }}
            >
              <span className="drawer-link-icon">➕</span>
              <div className="drawer-link-text">
                <b>{lang === 'te' ? 'కొత్త పఠన పాఠం చేర్చండి' : 'Add Custom Passage'}</b>
                <small>{lang === 'te' ? 'తరగతి 1–5 స్వంత తెలుగు వాక్యాలు' : 'Input any Telugu or English text'}</small>
              </div>
            </button>

            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                onClose();
                onOpenSettings('students');
              }}
            >
              <span className="drawer-link-icon">🎒</span>
              <div className="drawer-link-text">
                <b>{lang === 'te' ? 'విద్యార్థుల జాబితా నిర్వహణ' : 'Manage Student Roster'}</b>
                <small>{lang === 'te' ? 'విద్యార్థి వివరాలు & CwSN పద్ధతి' : 'Add/edit students & grades'}</small>
              </div>
            </button>

            <button
              type="button"
              className="drawer-link text-danger"
              onClick={handleReset}
            >
              <span className="drawer-link-icon">🔄</span>
              <div className="drawer-link-text">
                <b>{lang === 'te' ? 'డిఫాల్ట్ సెట్టింగ్స్‌కి రీసెట్' : 'Reset to SCERT Defaults'}</b>
                <small>{lang === 'te' ? 'అన్ని పాఠాలు & వివరాలు పునరుద్ధరించు' : 'Restore original demo state'}</small>
              </div>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
            <b>TISC 2026 · Challenge 06</b><br />
            Every Child Reads: Telugu AI Assessment<br />
            <span style={{ color: 'var(--amber-dark)', fontWeight: 700 }}>Gamada</span> · gamada.app
          </p>
        </div>
      </div>
    </div>
  );
}
