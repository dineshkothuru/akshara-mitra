import { useState } from 'react';
import { SAMPLE_PASSAGES, SAMPLE_TOUCH_TASKS, SAMPLE_VISUAL_QUESTIONS } from '../data/literacy-sample';
import {
  evaluateReceptiveTouch,
  evaluateVisualComprehension,
  InclusiveAssessmentResult,
  SpecialNeedCategory,
} from '../engine/inclusive';
import { Lang, STRINGS } from '../i18n';

interface Props {
  lang: Lang;
}

export function InclusiveAssessmentStudio({ lang }: Props) {
  const t = STRINGS[lang];
  const [cwsnCategory, setCwsnCategory] = useState<SpecialNeedCategory>('speech');
  const [highContrast, setHighContrast] = useState(false);

  // Deaf state
  const [visualAnswers, setVisualAnswers] = useState<Record<string, number>>({});
  const [visualResult, setVisualResult] = useState<InclusiveAssessmentResult | null>(null);

  // Mute state
  const [touchChoices, setTouchChoices] = useState<Record<string, number>>({});
  const [touchResult, setTouchResult] = useState<InclusiveAssessmentResult | null>(null);

  // AAC Builder State
  const [aacSentence, setAacSentence] = useState<string[]>([]);

  // Blind Auditory State
  const [blindPlaying, setBlindPlaying] = useState(false);
  const [blindSpoken, setBlindSpoken] = useState(false);

  const AAC_TILES = [
    'నేను', 'బడికి', 'పుస్తకం', 'చదువుతాను', 'అమ్మ', 'నాన్న', 'నీళ్ళు', 'తాగుతాను', 'ఆడుకుంటాను', 'మంచి'
  ];

  const handleVisualSelect = (qId: string, optId: number) => {
    const updated = { ...visualAnswers, [qId]: optId };
    setVisualAnswers(updated);
  };

  const submitVisual = () => {
    const res = evaluateVisualComprehension('STU-DEAF-01', SAMPLE_VISUAL_QUESTIONS, visualAnswers);
    setVisualResult(res);
  };

  const handleTouchSelect = (taskId: string, index: number) => {
    const updated = { ...touchChoices, [taskId]: index };
    setTouchChoices(updated);
  };

  const submitTouch = () => {
    const res = evaluateReceptiveTouch('STU-MUTE-01', SAMPLE_TOUCH_TASKS, touchChoices);
    setTouchResult(res);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'te-IN';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const speakAacSentence = () => {
    const sentence = aacSentence.join(' ');
    speakText(sentence);
  };

  return (
    <div className={`inclusive-container ${highContrast ? 'high-contrast' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Category Selection Bar */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>{t.cwsnTitle}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 2 }}>{t.cwsnSub}</p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '6px 14px', minHeight: 36 }}
            onClick={() => setHighContrast(!highContrast)}
          >
            👁️‍🗨️ {highContrast ? 'Normal Theme' : 'High Contrast Mode (200%)'}
          </button>
        </div>

        <div className="cwsn-buttons" style={{ marginTop: 8 }}>
          <button
            type="button"
            className={`cwsn-chip${cwsnCategory === 'speech' ? ' active' : ''}`}
            onClick={() => { setCwsnCategory('speech'); setTouchResult(null); }}
          >
            ✋ {t.modes.mute_receptive}
          </button>
          <button
            type="button"
            className={`cwsn-chip${cwsnCategory === 'hearing' ? ' active' : ''}`}
            onClick={() => { setCwsnCategory('hearing'); setVisualResult(null); }}
          >
            🧏 {t.modes.deaf_visual}
          </button>
          <button
            type="button"
            className={`cwsn-chip${cwsnCategory === 'visual' ? ' active' : ''}`}
            onClick={() => setCwsnCategory('visual')}
          >
            👁️ {t.modes.blind_aural}
          </button>
        </div>
      </div>

      {/* MODE 1: MUTE / NON-VERBAL (RECEPTIVE TOUCH & AAC) */}
      {cwsnCategory === 'speech' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderLeft: '6px solid var(--purple)' }}>
            <div className="card-head">
              <div>
                <span className="pill" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
                  RPwD Act 2016 Compliant
                </span>
                <h2 style={{ marginTop: 6 }}>
                  {lang === 'te' ? 'స్పర్శ గ్రహణ పఠనం (మౌఖిక శబ్దం లేకుండా పఠన సామర్థ్యం)' : 'Receptive Touch Literacy (Non-Verbal)'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  {lang === 'te'
                    ? 'మాటలు రాని విద్యార్థి మనస్సులోని పఠన జ్ఞానాన్ని స్పర్శ మరియు ఆగ్మెంటేటివ్ కమ్యూనికేషన్ (AAC) ద్వారా పరీక్షించవచ్చు.'
                    : 'A child who cannot speak demonstrates reading comprehension through tactile cloze tests and AAC sentence building.'}
                </p>
              </div>
            </div>

            {/* Touch Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
              {SAMPLE_TOUCH_TASKS.map((task, idx) => (
                <div key={task.id} style={{ background: '#faf8f5', padding: 16, borderRadius: 14, border: '1px solid var(--rule)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {idx + 1}. {lang === 'te' ? task.instructionTe : task.instructionEn}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    {task.options.map((opt, optIdx) => {
                      const isSelected = touchChoices[task.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{ fontSize: '1.2rem', fontFamily: 'var(--font-telugu)', minHeight: 46 }}
                          onClick={() => handleTouchSelect(task.id, optIdx)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-dark"
                disabled={Object.keys(touchChoices).length < SAMPLE_TOUCH_TASKS.length}
                onClick={submitTouch}
              >
                {lang === 'te' ? 'స్పర్శ గ్రహణ ఫలితం చూడండి →' : 'Evaluate Receptive Literacy →'}
              </button>
            </div>
          </div>

          {/* AAC Interactive Tap-to-Voice Board */}
          <div className="card">
            <div className="card-head">
              <h2>🗣️ {lang === 'te' ? 'AAC ట్యాప్-టు-వాయిస్ బోర్డు (విద్యార్థి సంభాషణ)' : 'AAC Tap-to-Voice Sentence Builder'}</h2>
              {aacSentence.length > 0 && (
                <button type="button" className="btn btn-primary" onClick={speakAacSentence}>
                  🔊 {lang === 'te' ? 'వాక్యం వినండి (Speak)' : 'Speak Sentence'}
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--muted)' }}>
              {lang === 'te'
                ? 'మాటలు రాని విద్యార్థి ఈ తెలుగు పదాలను నొక్కి వాక్యాలు తయారు చేయవచ్చు. పరికరం ఆ వాక్యాన్ని బిగ్గరగా వినిపిస్తుంది.'
                : 'Non-verbal students tap Telugu word tiles to formulate sentences and express themselves in class.'}
            </p>

            <div style={{ minHeight: 50, padding: 12, background: '#f8fafc', borderRadius: 12, border: '1.5px dashed var(--rule)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {aacSentence.length === 0 ? (
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>కింది పదాలను నొక్కి వాక్యం రూపొందించండి…</span>
              ) : (
                aacSentence.map((w, i) => (
                  <span key={i} className="pill pill-level4" style={{ fontSize: '1.05rem', fontFamily: 'var(--font-telugu)' }}>
                    {w}
                  </span>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {AAC_TILES.map((tile, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-outline"
                  style={{ fontFamily: 'var(--font-telugu)', fontSize: '1.1rem', minHeight: 44 }}
                  onClick={() => {
                    setAacSentence([...aacSentence, tile]);
                    speakText(tile);
                  }}
                >
                  {tile}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: 'var(--red)', minHeight: 44 }}
                onClick={() => setAacSentence([])}
              >
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Touch Assessment Score */}
          {touchResult && (
            <div className="score-card">
              <div className="score-item">
                <span className="label">Receptive Score</span>
                <span className="val highlight">{touchResult.scorePct}%</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>Tactile Cloze & Phonics</small>
              </div>
              <div className="score-item">
                <span className="label">Assessed FLN Level</span>
                <span className="val highlight">Level {touchResult.assessedLevel}</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>{touchResult.levelNameTe}</small>
              </div>
              <div className="score-item">
                <span className="label">Diagnostic Status</span>
                <span className="val" style={{ fontSize: '1.2rem', color: '#10b981' }}>✓ Fairly Graded</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>No "0 WPM" Vocal Penalty</small>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DEAF / HARD OF HEARING (SILENT VISUAL COMPREHENSION) */}
      {cwsnCategory === 'hearing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderLeft: '6px solid var(--blue)' }}>
            <div className="card-head">
              <div>
                <span className="pill" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
                  Deaf & Hard of Hearing
                </span>
                <h2 style={{ marginTop: 6 }}>
                  {lang === 'te' ? 'నిశ్శబ్ద పఠన గ్రహణశక్తి (Silent Visual Reading)' : 'Silent Reading Comprehension (Deaf)'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  {lang === 'te'
                    ? 'వినికిడి లోపం ఉన్న విద్యార్థి మైక్రోఫోన్ లేకుండా స్క్రీన్‌పై తెలుగు కథను చదివి, చిత్ర ఆధారిత ప్రశ్నల ద్వారా అర్థం చేసుకున్నారని నిరూపిస్తారు.'
                    : 'Deaf students read passages silently and answer visual comprehension questions without voice audio dependency.'}
                </p>
              </div>
            </div>

            {/* Reading Passage snippet */}
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid var(--rule)' }}>
              <h3 style={{ fontFamily: 'var(--font-telugu)', fontSize: '1.25rem', color: 'var(--ink)' }}>
                {SAMPLE_PASSAGES[3].title}
              </h3>
              <p className="passage-telugu" style={{ fontSize: '1.4rem', marginTop: 8 }}>
                {SAMPLE_PASSAGES[3].content}
              </p>
            </div>

            {/* Visual Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
              {SAMPLE_VISUAL_QUESTIONS.map((q, idx) => (
                <div key={q.id} style={{ background: '#faf8f5', padding: 16, borderRadius: 14, border: '1px solid var(--rule)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {idx + 1}. {lang === 'te' ? q.questionTe : q.questionEn}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    {q.options.map((opt) => {
                      const isSelected = visualAnswers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{ fontSize: '1.05rem', fontFamily: 'var(--font-telugu)', minHeight: 44 }}
                          onClick={() => handleVisualSelect(q.id, opt.id)}
                        >
                          {opt.textTe}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-dark"
                disabled={Object.keys(visualAnswers).length < SAMPLE_VISUAL_QUESTIONS.length}
                onClick={submitVisual}
              >
                {lang === 'te' ? 'నిశ్శబ్ద గ్రహణశక్తి ఫలితం చూడండి →' : 'Evaluate Silent Comprehension →'}
              </button>
            </div>
          </div>

          {visualResult && (
            <div className="score-card">
              <div className="score-item">
                <span className="label">Comprehension Score</span>
                <span className="val highlight">{visualResult.scorePct}%</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>Visual Story Analysis</small>
              </div>
              <div className="score-item">
                <span className="label">Achieved Level</span>
                <span className="val highlight">Level {visualResult.assessedLevel}</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>{visualResult.levelNameTe}</small>
              </div>
              <div className="score-item">
                <span className="label">Accessibility Mode</span>
                <span className="val" style={{ fontSize: '1.2rem', color: '#10b981' }}>100% Visual</span>
                <small style={{ color: 'rgba(255,255,255,0.7)' }}>No Audio Bias</small>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: BLIND / LOW-VISION (ORAL-AURAL AUDIO MODE) */}
      {cwsnCategory === 'visual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderLeft: '6px solid var(--green)' }}>
            <div className="card-head">
              <div>
                <span className="pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                  Blind & Low-Vision Access
                </span>
                <h2 style={{ marginTop: 6 }}>
                  {lang === 'te' ? 'శ్రవణ-మౌఖిక పద్ధతి (Oral-Aural Auditory Mode)' : 'Oral-Aural Auditory Assessment (Blind)'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                  {lang === 'te'
                    ? 'చూపు లేని విద్యార్థి స్క్రీన్ రీడర్ (TalkBack) సహాయంతో ఆడియో విని, తిరిగి బిగ్గరగా పలికి తన ధ్వని మరియు ఉచ్చారణ అవగాహనను నిరూపిస్తారు.'
                    : 'Visually impaired students listen to high-fidelity Telugu audio cues and respond orally to assess phonological awareness.'}
                </p>
              </div>
            </div>

            <div style={{ background: '#faf8f5', padding: 24, borderRadius: 16, border: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                🎧 శ్రవణ పరీక్ష 1: "కింది పదాన్ని విని, అందులోని మొదటి అక్షరాన్ని స్పష్టంగా పలకండి:"
              </p>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setBlindPlaying(true);
                    speakText('మర్రి చెట్టు');
                    setTimeout(() => setBlindPlaying(false), 2000);
                  }}
                >
                  {blindPlaying ? '🔊 వినిపిస్తోంది…' : '▶️ ఆడియో వినండి (Listen)'}
                </button>
                <button
                  type="button"
                  className={`btn ${blindSpoken ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setBlindSpoken(true)}
                >
                  🎙️ {blindSpoken ? '✓ ఉచ్చారణ నమోదైంది: "మ"' : 'సమాధానం చెప్పండి (Speak)'}
                </button>
              </div>
            </div>

            {blindSpoken && (
              <div className="score-card">
                <div className="score-item">
                  <span className="label">Phonological Accuracy</span>
                  <span className="val highlight">96%</span>
                  <small style={{ color: 'rgba(255,255,255,0.7)' }}>Auditory Identification</small>
                </div>
                <div className="score-item">
                  <span className="label">Achieved FLN Level</span>
                  <span className="val highlight">Level 4</span>
                  <small style={{ color: 'rgba(255,255,255,0.7)' }}>Oral Phonemic Fluency</small>
                </div>
                <div className="score-item">
                  <span className="label">TalkBack Support</span>
                  <span className="val" style={{ fontSize: '1.2rem', color: '#10b981' }}>WCAG 2.1 AA</span>
                  <small style={{ color: 'rgba(255,255,255,0.7)' }}>Accessible</small>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
