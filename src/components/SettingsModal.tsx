import { useState, useEffect } from 'react';
import { FLNLevel, Passage, StudentProfile, tokenizePassage } from '../engine/literacy';
import {
  SchoolConfig,
  getStoredSchoolConfig,
  saveSchoolConfig,
  getStoredPassages,
  savePassages,
  resetPassagesToDefault,
  getStoredStudents,
  saveStudents,
  resetStudentsToDefault,
  AiVoiceConfig,
  getStoredVoiceConfig,
  saveVoiceConfig,
} from '../data/config-storage';
import { Lang, STRINGS } from '../i18n';

interface Props {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
  initialTab?: 'school' | 'passages' | 'students' | 'ai_engine';
}

export function SettingsModal({ lang, isOpen, onClose, onConfigChange, initialTab = 'school' }: Props) {
  const t = STRINGS[lang];
  const [activeTab, setActiveTab] = useState<'school' | 'passages' | 'students' | 'ai_engine'>(initialTab);

  // Sync activeTab when initialTab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSchoolConfig(getStoredSchoolConfig());
      setPassages(getStoredPassages());
      setStudents(getStoredStudents());
      setVoiceConfig(getStoredVoiceConfig());
    }
  }, [isOpen, initialTab]);

  // School Config state
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getStoredSchoolConfig);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Voice AI & DPDP Config state
  const [voiceConfig, setVoiceConfig] = useState<AiVoiceConfig>(getStoredVoiceConfig);

  // Passages state
  const [passages, setPassages] = useState<Passage[]>(getStoredPassages);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newGrade, setNewGrade] = useState<number>(3);
  const [newLevel, setNewLevel] = useState<FLNLevel>(3);
  const [newLang, setNewLang] = useState<'te' | 'en'>('te');

  // Students state
  const [students, setStudents] = useState<StudentProfile[]>(getStoredStudents);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<number>(3);
  const [newStudentMode, setNewStudentMode] = useState<StudentProfile['assessmentMode']>('general_oral');

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolConfig(schoolConfig);
    onConfigChange();
    showNotice(lang === 'te' ? '✓ పాఠశాల సమాచారం భద్రపరచబడింది!' : '✓ School info saved successfully!');
  };

  const handleSaveVoiceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveVoiceConfig(voiceConfig);
    onConfigChange();
    showNotice(lang === 'te' ? '✓ స్పీచ్ AI & DPDP కాన్ఫిగరేషన్ భద్రపరచబడింది!' : '✓ Speech AI & DPDP config saved!');
  };

  const handleAddPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const id = `custom-p-${Date.now()}`;
    const newP = tokenizePassage(id, newTitle.trim(), newTitle.trim(), newGrade, newLang, newLevel, newContent.trim());
    const updated = [newP, ...passages];
    setPassages(updated);
    savePassages(updated);
    onConfigChange();
    setNewTitle('');
    setNewContent('');
    showNotice(lang === 'te' ? '✓ కొత్త పాఠ్యాంశం జోడించబడింది!' : '✓ Custom passage added successfully!');
  };

  const handleDeletePassage = (id: string) => {
    const updated = passages.filter((p) => p.id !== id);
    setPassages(updated);
    savePassages(updated);
    onConfigChange();
  };

  const handleResetPassages = () => {
    const defaults = resetPassagesToDefault();
    setPassages(defaults);
    onConfigChange();
    showNotice(lang === 'te' ? '✓ పాఠ్యాంశాలు పునరుద్ధరించబడ్డాయి!' : '✓ Passages reset to defaults!');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;

    const newS: StudentProfile = {
      id: `stu-${Date.now()}`,
      name: newStudentName.trim(),
      rollNo: newStudentRoll.trim(),
      gender: 'M',
      grade: newStudentGrade,
      schoolName: schoolConfig.schoolName,
      mandal: schoolConfig.mandal,
      district: schoolConfig.district,
      assessmentMode: newStudentMode,
    };
    const updated = [...students, newS];
    setStudents(updated);
    saveStudents(updated);
    onConfigChange();
    setNewStudentName('');
    setNewStudentRoll('');
    showNotice(lang === 'te' ? '✓ కొత్త విద్యార్థి చేర్చబడ్డారు!' : '✓ New student added successfully!');
  };

  const handleResetStudents = () => {
    const defaults = resetStudentsToDefault();
    setStudents(defaults);
    onConfigChange();
    showNotice(lang === 'te' ? '✓ విద్యార్థుల జాబితా రీసెట్ అయింది!' : '✓ Student roster reset to defaults!');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
                {lang === 'te' ? 'అనుకూలీకరణ & సెట్టింగ్స్ (Custom Configuration)' : 'Configuration & Customizer'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                {lang === 'te'
                  ? 'పాఠశాల పేరు, పాఠ్యాంశాలు మరియు విద్యార్థుల సమాచారాన్ని మార్చండి.'
                  : 'Customize school name, add your own passages, or manage student rosters.'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {savedNotice && (
          <div style={{ background: 'var(--green-soft)', color: 'var(--green-dark)', padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem' }}>
            {savedNotice}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--rule)', paddingBottom: 6, overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'school' ? 'btn-dark' : 'btn-outline'}`}
            style={{ minHeight: 38, padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('school')}
          >
            🏫 {lang === 'te' ? 'పాఠశాల' : 'School'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'passages' ? 'btn-dark' : 'btn-outline'}`}
            style={{ minHeight: 38, padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('passages')}
          >
            📖 {lang === 'te' ? 'కస్టమ్ పాఠాలు' : 'Passages'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'students' ? 'btn-dark' : 'btn-outline'}`}
            style={{ minHeight: 38, padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('students')}
          >
            🎒 {lang === 'te' ? 'విద్యార్థులు' : 'Roster'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'ai_engine' ? 'btn-dark' : 'btn-outline'}`}
            style={{ minHeight: 38, padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('ai_engine')}
          >
            🤖 {lang === 'te' ? 'స్పీచ్ AI & DPDP' : 'Speech AI & DPDP'}
          </button>
        </div>

        {/* TAB 1: School Info */}
        {activeTab === 'school' && (
          <form onSubmit={handleSaveSchool} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                {lang === 'te' ? 'పాఠశాల పేరు (School Name):' : 'School Name:'}
              </label>
              <input
                type="text"
                className="input-field"
                value={schoolConfig.schoolName}
                onChange={(e) => setSchoolConfig({ ...schoolConfig, schoolName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {lang === 'te' ? 'మండలం (Mandal):' : 'Mandal:'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={schoolConfig.mandal}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, mandal: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {lang === 'te' ? 'జిల్లా (District):' : 'District:'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={schoolConfig.district}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, district: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="submit" className="btn btn-primary">
                💾 {lang === 'te' ? 'సేవ్ చేయండి' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Custom Passages */}
        {activeTab === 'passages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Add New Passage Form */}
            <form onSubmit={handleAddPassage} style={{ background: '#fbf9f5', border: '1px solid var(--rule)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>
                ➕ {lang === 'te' ? 'కొత్త పఠన పాఠ్యాంశాన్ని చేర్చండి' : 'Add New Reading Passage'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder={lang === 'te' ? 'పాఠం శీర్షిక (Title)' : 'Passage Title'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <select
                  className="input-field"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value as 'te' | 'en')}
                >
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="en">English</option>
                </select>
                <select
                  className="input-field"
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>{lang === 'te' ? `తరగతి ${g}` : `Grade ${g}`}</option>
                  ))}
                </select>
                <select
                  className="input-field"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value) as FLNLevel)}
                >
                  {[1, 2, 3, 4, 5].map((l) => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>

              <textarea
                className="input-field"
                rows={3}
                placeholder={lang === 'te' ? 'ఇక్కడ మీ తెలుగు వాక్యాలు లేదా పేరాను టైప్ చేయండి / పేస్ట్ చేయండి...' : 'Type or paste your Telugu or English reading passage here...'}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                style={{ fontFamily: 'var(--font-telugu)', fontSize: '1.05rem', lineHeight: 1.6 }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 40, padding: '6px 18px' }}>
                  ➕ {lang === 'te' ? 'పాఠాన్ని జోడించండి' : 'Add Passage'}
                </button>
              </div>
            </form>

            {/* Existing Passages List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.9rem' }}>
                {lang === 'te' ? `ప్రస్తుత పాఠాలు (${passages.length}):` : `Active Passages (${passages.length}):`}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ minHeight: 32, padding: '4px 12px', fontSize: '0.8rem' }}
                onClick={handleResetPassages}
              >
                🔄 {lang === 'te' ? 'డిఫాల్ట్ SCERT రీసెట్' : 'Reset to SCERT Defaults'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {passages.map((p) => {
                const isCustom = p.id.startsWith('custom-');
                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--rule)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <b>{p.title}</b>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 8 }}>
                        ({p.language.toUpperCase()} · {lang === 'te' ? `తరగతి ${p.grade}` : `Grade ${p.grade}`} · L{p.level} · {p.tokens.length} words)
                      </span>
                    </div>
                    {isCustom && (
                      <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }}
                        onClick={() => handleDeletePassage(p.id)}
                        title="Delete custom passage"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Students Management */}
        {activeTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Add Student Form */}
            <form onSubmit={handleAddStudent} style={{ background: '#fbf9f5', border: '1px solid var(--rule)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>
                ➕ {lang === 'te' ? 'కొత్త విద్యార్థిని చేర్చండి' : 'Add New Student Profile'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 10 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder={lang === 'te' ? 'విద్యార్థి పేరు (Student Name)' : 'Student Name'}
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Roll No"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  required
                />
                <select
                  className="input-field"
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>{lang === 'te' ? `తరగతి ${g}` : `Grade ${g}`}</option>
                  ))}
                </select>
                <select
                  className="input-field"
                  value={newStudentMode}
                  onChange={(e) => setNewStudentMode(e.target.value as StudentProfile['assessmentMode'])}
                >
                  <option value="general_oral">సాధారణ మౌఖిక (Oral Mic)</option>
                  <option value="blind_aural">అంధ / దృష్టి లోపం (Aural)</option>
                  <option value="deaf_visual">వినికిడి లోపం (Silent Visual)</option>
                  <option value="mute_receptive">మూగ / స్పీచ్ లోపం (Touch & AAC)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 40, padding: '6px 18px' }}>
                  ➕ {lang === 'te' ? 'విద్యార్థిని చేర్చండి' : 'Add Student'}
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.9rem' }}>
                {lang === 'te' ? `నమోదైన విద్యార్థులు (${students.length}):` : `Enrolled Students (${students.length}):`}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ minHeight: 32, padding: '4px 12px', fontSize: '0.8rem' }}
                onClick={handleResetStudents}
              >
                🔄 {lang === 'te' ? 'డిఫాల్ట్ జాబితా రీసెట్' : 'Reset Student Roster'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {students.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--rule)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <b>{s.name}</b> <small style={{ color: 'var(--muted)' }}>(Roll #{s.rollNo} · {lang === 'te' ? `తరగతి ${s.grade}` : `Grade ${s.grade}`})</small>
                  </div>
                  <span className="pill" style={{ background: '#f1f5f9', color: 'var(--ink)' }}>
                    {t.modes[s.assessmentMode]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Speech AI Engine & DPDP Act 2023 Compliance */}
        {activeTab === 'ai_engine' && (
          <form onSubmit={handleSaveVoiceConfig} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {lang === 'te' ? 'DPDP చట్టం 2023 & స్పీచ్ AI ఇంజిన్ వ్యూహం' : 'DPDP Act 2023 & Speech AI Engine Strategy'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                    {lang === 'te'
                      ? 'చిన్నారుల వాయిస్ బయోమెట్రిక్ ప్రైవసీని కాపాడుతూ గ్రామీణ తెలుగు మాండలికాలకు సరైన ఇంజిన్‌ను ఎంచుకోండి.'
                      : 'Balance student voice biometric privacy with rural Telugu dialect precision.'}
                  </p>
                </div>
              </div>

              {/* Radio Engine Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#ffffff', padding: 12, borderRadius: 12, border: voiceConfig.preferredEngine === 'sarvam' ? '2px solid var(--amber-dark)' : '1px solid var(--rule)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="engine"
                    checked={voiceConfig.preferredEngine === 'sarvam'}
                    onChange={() => setVoiceConfig({ ...voiceConfig, preferredEngine: 'sarvam' })}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
                        🇮🇳 {lang === 'te' ? 'సర్వం AI Saaras (ప్రైమరీ ఇండిక్ ASR)' : 'Sarvam AI Saaras (Primary Indic ASR)'}
                      </strong>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>
                        {lang === 'te' ? 'ఫ్లాగ్‌షిప్ · గ్రామీణ తెలుగు యాసల నైపుణ్యం' : 'Flagship · Rural Telugu Precision'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                      {lang === 'te'
                        ? 'భారతీయ భాషల ఫౌండేషన్ మోడల్. తెలంగాణ గ్రామీణ యాసలు, వొత్తుల లోపాలు మరియు గుణింతాలను ఖచ్చితంగా గుర్తిస్తుంది.'
                        : 'SOTA Indic foundation model purpose-trained for Indian languages. Delivers unmatched sub-word vottu precision on rural Telangana dialects.'}
                    </p>
                  </div>
                </label>

                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#ffffff', padding: 12, borderRadius: 12, border: voiceConfig.preferredEngine === 'browser' ? '2px solid var(--green-dark)' : '1px solid var(--rule)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="engine"
                    checked={voiceConfig.preferredEngine === 'browser'}
                    onChange={() => setVoiceConfig({ ...voiceConfig, preferredEngine: 'browser' })}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>
                        📱 {lang === 'te' ? 'లోకల్ ఆండ్రాయిడ్ స్పీచ్ ఇంజిన్ (ఆఫ్‌లైన్ బ్యాకప్)' : 'Local Android Speech Engine (Offline Fallback)'}
                      </strong>
                      <span style={{ background: 'var(--green-soft)', color: 'var(--green-dark)', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>
                        {lang === 'te' ? '100% ఆఫ్‌లైన్ · DPDP రక్షణ' : '100% Offline · DPDP Compliant'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                      {lang === 'te'
                        ? 'ఇంటర్నెట్ లేనప్పుడు ఆటోమేటిక్‌గా ఆన్ అవుతుంది. ఆడియో టాబ్లెట్ దాటి వెళ్ళదు, 100% ప్రైవేట్, జీరో క్లౌడ్ సర్వర్ ఖర్చు.'
                        : 'Auto-engages whenever network is unavailable. Audio strictly stays on the school tablet. 100% offline, $0 marginal cloud cost.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Sarvam AI Key Configuration */}
            {voiceConfig.preferredEngine === 'sarvam' && (
              <div style={{ background: '#fffdf7', border: '1px solid #fde68a', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {lang === 'te' ? 'సర్వం AI సబ్‌స్క్రిప్షన్ కీ (Sarvam API Key):' : 'Sarvam AI Subscription Key:'}
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="sarvam_api_key_xxxxxxxxxxxxxxxx"
                  value={voiceConfig.sarvamApiKey}
                  onChange={(e) => setVoiceConfig({ ...voiceConfig, sarvamApiKey: e.target.value })}
                />
                <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0 }}>
                  💡 {lang === 'te' ? 'ఖాళీగా ఉంచితే, సాఫ్ట్‌వేర్ అంతర్నిర్మిత సర్వం Saaras మాండలిక రూల్స్ మోడ్‌ను వాడుతుంది.' : 'If left blank, system uses built-in Sarvam Saaras dialect normalization rules.'}
                </p>
              </div>
            )}

            {/* DPDP Act 2023 Consent Checkbox */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 14 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={voiceConfig.dpdpConsentEnabled}
                  onChange={(e) => setVoiceConfig({ ...voiceConfig, dpdpConsentEnabled: e.target.checked })}
                  style={{ marginTop: 3, transform: 'scale(1.2)' }}
                />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#1e3a8a' }}>
                    {lang === 'te'
                      ? 'DPDP చట్టం 2023 ప్రకారం తల్లిదండ్రుల సమ్మతి ధృవీకరించబడింది'
                      : 'Parental Consent Verified under DPDP Act 2023'}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: 3, lineHeight: 1.4 }}>
                    {lang === 'te'
                      ? 'డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ చట్టం ప్రకారం మైనర్ పిల్లల వాయిస్ డేటా రక్షణకు పాఠశాల ప్రధానోపాధ్యాయులు తల్లిదండ్రుల సమ్మతి పత్రం సేకరించినట్లు నిర్ధారిస్తుంది.'
                      : 'Certifies that school holds verified parental consent for audio diagnostic evaluation as required for minors under Indian DPDP Act 2023.'}
                  </p>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button type="submit" className="btn btn-primary" style={{ minHeight: 42, padding: '8px 24px' }}>
                💾 {lang === 'te' ? 'స్పీచ్ AI కాన్ఫిగరేషన్ భద్రపరచండి' : 'Save Voice Configuration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
