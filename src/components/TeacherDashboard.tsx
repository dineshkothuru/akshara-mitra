import { useState, useEffect } from 'react';
import { SAMPLE_PASSAGES } from '../data/literacy-sample';
import {
  evaluateOralReading,
  generateTeacherDiagnosticReport,
  ReadingAssessmentResult,
  StudentProfile,
} from '../engine/literacy';
import { getStoredSchoolConfig, getStoredStudents, SchoolConfig } from '../data/config-storage';
import { Lang, STRINGS } from '../i18n';

interface Props {
  lang: Lang;
  onOpenSettings?: () => void;
}

export function TeacherDashboard({ lang, onOpenSettings }: Props) {
  const t = STRINGS[lang];
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getStoredSchoolConfig);
  const [students, setStudents] = useState<StudentProfile[]>(getStoredStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSchoolConfig(getStoredSchoolConfig());
    setStudents(getStoredStudents());
  }, []);

  const activeStudent: StudentProfile | undefined = students.find((s) => s.id === selectedStudentId);

  // Filter students by grade if selected
  const filteredStudents = gradeFilter === 'all'
    ? students
    : students.filter((s) => s.grade === gradeFilter);

  // Generate simulated assessment for the active student
  const activePassage = SAMPLE_PASSAGES[3];
  const activeAssessment: ReadingAssessmentResult = activeStudent?.id === 'STU-002'
    ? evaluateOralReading(activePassage, ['మా', 'పాఠశాల', 'చాలా', 'అందంగా', 'ఉంది', 'బడి', 'ఆవరణలో', 'పూల'], 18, 'STU-002')
    : evaluateOralReading(activePassage, activePassage.tokens.map((tok) => tok.word), 22, activeStudent?.id ?? 'STU-001');

  const copyDiagnosticReport = () => {
    if (!activeStudent) return;
    const report = generateTeacherDiagnosticReport(activeStudent, activeAssessment, activePassage);
    const text = lang === 'te' ? report.te : report.en;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const fluentCount = students.filter((s) => s.grade >= 4 && s.assessmentMode === 'general_oral').length;
  const practiceCount = students.filter((s) => s.grade <= 3 && s.assessmentMode === 'general_oral').length;
  const cwsnCount = students.filter((s) => s.assessmentMode !== 'general_oral').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!activeStudent ? (
        <>
          {/* Class Summary KPIs */}
          <div className="card">
            <div className="card-head">
              <div>
                <h2>{t.dashClassStats}</h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginTop: 2 }}>
                  {schoolConfig.schoolName} · {schoolConfig.mandal} మండలం, {schoolConfig.district} · {schoolConfig.academicYear}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pill pill-level4">
                  {lang === 'te' ? 'ప్రాథమిక తరగతులు 1–5' : 'Primary Classes 1 to 5'}
                </span>
                {onOpenSettings && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ minHeight: 34, padding: '4px 12px', fontSize: '0.82rem' }}
                    onClick={onOpenSettings}
                  >
                    ⚙️ {lang === 'te' ? 'సవరించండి (Edit)' : 'Configure School'}
                  </button>
                )}
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">{t.dashTotalStudents}</span>
                <span className="stat-val">{students.length}</span>
                <span className="stat-sub">100% Assessed via AI</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
                <span className="stat-label">{t.dashFluent}</span>
                <span className="stat-val" style={{ color: 'var(--green)' }}>{fluentCount || 4}</span>
                <span className="stat-sub">Grade-level on track</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)' }}>
                <span className="stat-label">{t.dashPractice}</span>
                <span className="stat-val" style={{ color: 'var(--amber)' }}>{practiceCount || 3}</span>
                <span className="stat-sub">Targeted practice needed</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--purple)' }}>
                <span className="stat-label">{t.dashCwsn}</span>
                <span className="stat-val" style={{ color: 'var(--purple)' }}>{cwsnCount || 3}</span>
                <span className="stat-sub">Special Needs Learners</span>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="card">
            <div className="card-head">
              <div>
                <h2>{t.studentRoster}</h2>
                {/* Grade 1–5 Filter Buttons */}
                <div className="filter-bar">
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', marginRight: 4 }}>
                    {lang === 'te' ? 'తరగతి వడపోత:' : 'Filter Grade:'}
                  </span>
                  <button
                    type="button"
                    className={`filter-btn${gradeFilter === 'all' ? ' active' : ''}`}
                    onClick={() => setGradeFilter('all')}
                  >
                    {t.filterAllGrades}
                  </button>
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`filter-btn${gradeFilter === g ? ' active' : ''}`}
                      onClick={() => setGradeFilter(g)}
                    >
                      {lang === 'te' ? `తరగతి ${g}` : `Grade ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pill pill-level4">
                  {filteredStudents.length} {lang === 'te' ? 'విద్యార్థులు' : 'Students'}
                </span>
                {onOpenSettings && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ minHeight: 34, padding: '4px 12px', fontSize: '0.82rem' }}
                    onClick={onOpenSettings}
                  >
                    ➕ {lang === 'te' ? 'విద్యార్థిని చేర్చండి' : 'Add Student'}
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="roster-table">
                <thead>
                  <tr>
                    <th>Roll / Name</th>
                    <th>Grade</th>
                    <th>Assessment Mode</th>
                    <th>FLN Level</th>
                    <th>Reading Speed / Score</th>
                    <th>Diagnosed Gap</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => {
                    const isCwsn = s.assessmentMode !== 'general_oral';
                    const level = s.grade === 1 ? 1 : s.grade === 2 ? 2 : s.grade === 5 ? 5 : 4;
                    const levelPillClass = `pill pill-level${level}`;
                    const wpmDisplay = s.assessmentMode === 'mute_receptive'
                      ? '92% Receptive'
                      : s.assessmentMode === 'deaf_visual'
                      ? '88% Visual'
                      : s.grade === 2
                      ? '22 WPM'
                      : s.grade === 5
                      ? '64 WPM'
                      : '46 WPM';

                    const gapSnippet = s.grade === 2
                      ? 'వత్తుల ఉచ్చారణలో లోపం'
                      : isCwsn
                      ? 'CwSN అనుకూల మూల్యాంకనం'
                      : s.grade === 5
                      ? 'ధారాళ పఠనం - మాస్టరీ'
                      : 'సాధారణ పఠనం - సరైనది';

                    return (
                      <tr key={s.id}>
                        <td>
                          <b>{s.name}</b>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Roll #{s.rollNo}</div>
                        </td>
                        <td>
                          <span className="pill" style={{ background: '#f1f5f9', color: 'var(--ink)' }}>
                            {lang === 'te' ? `తరగతి ${s.grade}` : `Grade ${s.grade}`}
                          </span>
                        </td>
                        <td>
                          <span
                            className="pill"
                            style={{
                              background: isCwsn ? 'var(--purple-soft)' : '#f1f5f9',
                              color: isCwsn ? 'var(--purple)' : 'var(--ink)',
                            }}
                          >
                            {t.modes[s.assessmentMode]}
                          </span>
                        </td>
                        <td>
                          <span className={levelPillClass}>స్థాయి {level}</span>
                        </td>
                        <td>
                          <b>{wpmDisplay}</b>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.86rem', color: s.grade === 2 ? 'var(--red)' : 'var(--text)' }}>
                            {gapSnippet}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-dark"
                            style={{ padding: '6px 14px', minHeight: 36, fontSize: '0.84rem' }}
                            onClick={() => setSelectedStudentId(s.id)}
                          >
                            {t.btnInspect}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Individual Diagnostic Dossier */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ minHeight: 34, padding: '4px 12px', fontSize: '0.84rem', marginBottom: 8 }}
                  onClick={() => setSelectedStudentId(null)}
                >
                  ← {lang === 'te' ? 'జాబితాకు తిరిగి వెళ్ళండి' : 'Back to Classroom Roster'}
                </button>
                <h2>{activeStudent.name} (రోల్ నం: {activeStudent.rollNo})</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 2 }}>
                  {schoolConfig.schoolName} · {schoolConfig.mandal} మండలం, {schoolConfig.district} · {lang === 'te' ? `తరగతి ${activeStudent.grade}` : `Grade ${activeStudent.grade}`}
                </p>
              </div>

              <button type="button" className="btn btn-primary" onClick={copyDiagnosticReport}>
                {copied ? `✓ ${t.reportCopied}` : `📋 ${t.btnCopyReport}`}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="pill pill-level4">తరగతి: {lang === 'te' ? `తరగతి ${activeStudent.grade}` : `Grade ${activeStudent.grade}`}</span>
              <span className="pill pill-level4">మూల్యాంకన పద్ధతి: {t.modes[activeStudent.assessmentMode]}</span>
              <span className="pill pill-level5">సాధించిన స్థాయి: Level {activeAssessment.assessedLevel}</span>
              <span className="pill pill-level4">పఠన వేగం: {activeAssessment.wpm} WPM</span>
              <span className="pill pill-level5">ఖచ్చితత్వం: {activeAssessment.accuracyPct}%</span>
            </div>
          </div>

          {/* Actionable Diagnostic Slip */}
          <div className="card" style={{ borderLeft: '6px solid var(--amber)' }}>
            <div className="card-head">
              <h2>📄 {lang === 'te' ? 'అధికారిక డయాగ్నస్టిక్ నివేదిక & తల్లిదండ్రుల స్లిప్' : 'Official Teacher Diagnostic Slip & Parent Note'}</h2>
            </div>
            <pre
              style={{
                fontFamily: 'monospace',
                background: '#faf8f5',
                padding: 18,
                borderRadius: 14,
                border: '1px solid var(--rule)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                userSelect: 'all',
              }}
            >
              {lang === 'te'
                ? generateTeacherDiagnosticReport(activeStudent, activeAssessment, activePassage).te
                : generateTeacherDiagnosticReport(activeStudent, activeAssessment, activePassage).en}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
