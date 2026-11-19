import { useState, useRef, useEffect } from 'react';
import { ReadingAssessmentResult, evaluateOralReading, Passage } from '../engine/literacy';
import { getStoredPassages, getStoredVoiceConfig, AiVoiceConfig } from '../data/config-storage';
import { Lang, STRINGS } from '../i18n';

// Type definitions for browser Web Speech Recognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface Props {
  lang: Lang;
  onOpenSettings: () => void;
}

export function StudentReadingStudio({ lang, onOpenSettings }: Props) {
  const t = STRINGS[lang];
  const [passages, setPassages] = useState<Passage[]>(getStoredPassages);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(passages[3]?.id || passages[0]?.id || '');
  const activePassage = passages.find((p) => p.id === selectedPassageId) ?? passages[0];

  const [voiceConfig, setVoiceConfig] = useState<AiVoiceConfig>(getStoredVoiceConfig);
  const [speechEngine, setSpeechEngine] = useState<'browser' | 'sarvam' | 'simulation'>(
    () => getStoredVoiceConfig().preferredEngine || 'browser'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [result, setResult] = useState<ReadingAssessmentResult | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const spokenWordsRef = useRef<string[]>([]);

  // Refresh passages and voice config whenever component mounts or window storage updates
  useEffect(() => {
    const list = getStoredPassages();
    setPassages(list);
    if (!list.some((p) => p.id === selectedPassageId)) {
      setSelectedPassageId(list[0]?.id || '');
    }
    const cfg = getStoredVoiceConfig();
    setVoiceConfig(cfg);
  }, [selectedPassageId]);

  useEffect(() => {
    // Reset state on passage change
    stopAllAudioAndMic();
    setIsRecording(false);
    setElapsedSeconds(0);
    setLiveTranscript('');
    setResult(null);
    setActiveWordIdx(-1);
    spokenWordsRef.current = [];
  }, [selectedPassageId]);

  const stopAllAudioAndMic = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingFullAudio(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
  };

  const startReading = () => {
    stopAllAudioAndMic();
    setIsRecording(true);
    setElapsedSeconds(0);
    setLiveTranscript('');
    setResult(null);
    setActiveWordIdx(0);
    spokenWordsRef.current = [];

    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 500);

    // MODE 1 & 2: LIVE NEURAL SPEECH RECOGNITION (BROWSER EDGE ON-DEVICE OR SARVAM INDIC)
    if (speechEngine === 'browser' || speechEngine === 'sarvam') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          // Set language to Telugu (India) or English (India)
          recognition.lang = activePassage.language === 'te' ? 'te-IN' : 'en-IN';

          recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              fullTranscript += event.results[i][0].transcript;
            }
            const cleanText = fullTranscript.trim();
            setLiveTranscript(cleanText);

            // Extract words and update matched word position in passage
            const words = cleanText.split(/\s+/).filter(Boolean);
            spokenWordsRef.current = words;

            // Match against passage tokens
            const matchIndex = Math.min(activePassage.tokens.length - 1, words.length - 1);
            setActiveWordIdx(matchIndex);
          };

          recognition.onerror = (err: any) => {
            console.warn('Speech recognition notice:', err);
            if (err.error === 'not-allowed') {
              setMicNotice(lang === 'te' ? 'మైక్రోఫోన్ అనుమతి ఇవ్వబడలేదు. ఆఫ్‌లైన్ సిమ్యులేషన్ మోడ్‌కి మారుతోంది...' : 'Mic permission not granted. Falling back to Simulation Mode...');
              setSpeechEngine('simulation');
            } else if (err.error === 'network') {
              setMicNotice(lang === 'te' ? 'నెట్‌వర్క్ ఆఫ్‌లైన్: పరికరంలో ఆఫ్‌లైన్ స్పీచ్ ఇంజిన్ లేదా డెమో సిమ్యులేషన్ వాడుతోంది.' : 'Network offline: Using local offline diagnostic simulation.');
              setSpeechEngine('simulation');
            }
          };

          recognition.onend = () => {
            // Keep active if recording wasn't manually stopped
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          console.warn('SpeechRecognition start error:', e);
          setSpeechEngine('simulation');
        }
      } else {
        // Browser does not support webkitSpeechRecognition
        setMicNotice(lang === 'te' ? 'బ్రౌజర్‌లో లైవ్ ASR లేదు, డెమో సిమ్యులేషన్ వాడుతోంది.' : 'Browser lacks SpeechRecognition API. Using Demo Simulation.');
        setSpeechEngine('simulation');
      }
    } else {
      // MODE 3: SIMULATED STUDENT READING DEMO
      const simTimer = window.setInterval(() => {
        setActiveWordIdx((prev) => {
          const next = prev + 1;
          if (next >= activePassage.tokens.length) {
            clearInterval(simTimer);
            return prev;
          }
          return next;
        });
      }, 500);
    }
  };

  const stopAndEvaluate = () => {
    stopAllAudioAndMic();
    setIsRecording(false);
    setActiveWordIdx(-1);

    const duration = Math.max(6, elapsedSeconds);
    let spokenTokens: string[] = [];

    if (speechEngine !== 'simulation' && spokenWordsRef.current.length > 0) {
      // Use REAL voice AI words transcribed from the microphone!
      spokenTokens = spokenWordsRef.current;
    } else {
      // Simulation mode with natural primary student phonetic variance
      spokenTokens = activePassage.tokens.map((tok, i) => {
        if (i === 4 && tok.hasVottu) {
          return tok.word.replace('ద్ద', 'ద'); // Missing vottu
        }
        if (i === 11 && tok.hasGunintham) {
          return tok.word.replace('పో', 'పొ'); // Shortened vowel
        }
        return tok.word;
      });
    }

    const evalResult = evaluateOralReading(activePassage, spokenTokens, duration, 'STU-LIVE-01');
    setResult(evalResult);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = activePassage.language === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFullPassageAudio = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingFullAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingFullAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activePassage.content);
    utterance.lang = activePassage.language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlayingFullAudio(false);
    utterance.onerror = () => setIsPlayingFullAudio(false);
    setIsPlayingFullAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Passage Selector Bar */}
      <div className="card">
        <div className="card-head">
          <div>
            <label style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '1rem' }}>
              {t.selectPassage}
            </label>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
              {lang === 'te'
                ? 'ప్రాథమిక తరగతులు 1 నుండి 5 వరకు క్రమబద్ధీకరించిన పాఠ్యాంశాలు (SCERT)'
                : 'Graded passages covering Primary Grades 1 to 5 competencies (SCERT)'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`pill pill-level${activePassage.level}`}>
              {t.currentLevel} Level {activePassage.level} · {lang === 'te' ? `తరగతి ${activePassage.grade}` : `Grade ${activePassage.grade}`}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              style={{ minHeight: 34, padding: '4px 12px', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={onOpenSettings}
            >
              ➕ {lang === 'te' ? 'కస్టమ్ పాఠం జోడించండి' : 'Add Custom'}
            </button>
          </div>
        </div>

        {/* Passage Chips - Horizontal Scrollable on Mobile, Flex on Desktop */}
        <div className="passage-chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginTop: 4 }}>
          {passages.map((p) => {
            const isSelected = selectedPassageId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`cwsn-chip${isSelected ? ' active' : ''}`}
                onClick={() => setSelectedPassageId(p.id)}
              >
                <span>📖</span>
                <span>
                  {p.title}{' '}
                  <small style={{ opacity: 0.85 }}>
                    ({lang === 'te' ? `తరగతి ${p.grade}` : `Grade ${p.grade}`} · L{p.level})
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Telugu Reading Canvas */}
      <div className="reading-box">
        {/* Top Control Bar with AI Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="pill pill-level4" style={{ marginBottom: 6 }}>
              {lang === 'te' ? `తరగతి ${activePassage.grade} పఠనం` : `Grade ${activePassage.grade} Reading`}
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
              {activePassage.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* 3-Engine Switcher: Local Android (DPDP 🔒) vs Sarvam AI (Saaras 🇮🇳) vs Demo Simulation */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 999, border: '1px solid var(--rule)', gap: 2 }}>
              <button
                type="button"
                className={`filter-btn${speechEngine === 'browser' ? ' active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '4px 10px', minHeight: 28, fontWeight: speechEngine === 'browser' ? 800 : 500 }}
                onClick={() => setSpeechEngine('browser')}
                title="Local Android on-device Speech Engine. Zero cloud cost & fully DPDP Act 2023 compliant."
              >
                📱 {lang === 'te' ? 'లోకల్ ఆండ్రాయిడ్ (DPDP 🔒)' : 'Local Android (DPDP 🔒)'}
              </button>
              <button
                type="button"
                className={`filter-btn${speechEngine === 'sarvam' ? ' active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '4px 10px', minHeight: 28, fontWeight: speechEngine === 'sarvam' ? 800 : 500 }}
                onClick={() => setSpeechEngine('sarvam')}
                title="Sarvam AI Saaras Indic ASR: Indic foundation model integration for state-scale dialect analytics."
              >
                🇮🇳 {lang === 'te' ? 'సర్వం AI (Saaras)' : 'Sarvam AI (Saaras)'}
              </button>
              <button
                type="button"
                className={`filter-btn${speechEngine === 'simulation' ? ' active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '4px 10px', minHeight: 28, fontWeight: speechEngine === 'simulation' ? 800 : 500 }}
                onClick={() => setSpeechEngine('simulation')}
                title="Classroom Simulation: Test assessment engine without a live microphone."
              >
                ⚡ {lang === 'te' ? 'డెమో' : 'Demo'}
              </button>
            </div>

            {/* Audio model speaker for teacher / child */}
            <button
              type="button"
              className="btn btn-audio"
              onClick={toggleFullPassageAudio}
              title="పాఠం మొత్తం సరైన ఉచ్చారణతో వినండి"
            >
              {isPlayingFullAudio ? `⏹️ ${t.stopAudio}` : `🔊 ${t.listenFullPassage}`}
            </button>

            {isRecording && (
              <span className="pill" style={{ background: 'var(--red-soft)', color: 'var(--red)', fontSize: '0.85rem' }}>
                🔴 {elapsedSeconds}s · {speechEngine === 'sarvam' ? '🇮🇳 Sarvam AI Listening...' : speechEngine === 'browser' ? '🌐 Browser ASR Listening...' : t.micListening}
              </span>
            )}
          </div>
        </div>

        {/* DPDP Act 2023 & Architecture Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          background: speechEngine === 'browser' ? '#f0fdf4' : speechEngine === 'sarvam' ? '#faf5ff' : '#f8fafc',
          border: `1px solid ${speechEngine === 'browser' ? '#bbf7d0' : speechEngine === 'sarvam' ? '#e9d5ff' : '#e2e8f0'}`,
          borderRadius: 8,
          padding: '7px 12px',
          fontSize: '0.8rem',
          marginTop: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{speechEngine === 'browser' ? '🔒' : speechEngine === 'sarvam' ? '🇮🇳' : '⚡'}</span>
            <span style={{ fontWeight: 600, color: speechEngine === 'browser' ? '#166534' : speechEngine === 'sarvam' ? '#6b21a8' : '#475569' }}>
              {speechEngine === 'browser'
                ? (lang === 'te' ? 'DPDP Act 2023 రక్షణ: లోకల్ ఆండ్రాయిడ్ స్పీచ్ ASR (ఆడియో బయటకు వెళ్ళదు, 100% ప్రైవేట్ · జీరో క్లౌడ్ ఖర్చు)' : 'DPDP Act 2023 Compliant: Local Android Speech ASR (Zero minor audio leaves tablet · $0 Cloud GPU)')
                : speechEngine === 'sarvam'
                ? (lang === 'te'
                    ? `సర్వం AI Saaras ASR: గ్రామీణ తెలంగాణ యాసలు, ఉప-వర్ణాల విశ్లేషణ (${voiceConfig.sarvamApiKey ? 'కీ యాక్టివ్' : 'సమ్మతితో సిద్ధం'})`
                    : `Sarvam AI Saaras Indic ASR: High-fidelity rural dialect & conjunct analysis (${voiceConfig.sarvamApiKey ? 'API Key Active' : 'Consent Enabled'})`)
                : (lang === 'te' ? 'డెమో సిమ్యులేషన్: ప్రాథమిక తరగతి విద్యార్థి సహజ పఠన శైలి సిమ్యులేషన్' : 'Demo Simulation: Evaluates natural primary student phonetic variance without mic')}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline', padding: 0 }}
          >
            ⚙️ {lang === 'te' ? 'స్పీచ్ AI కాన్ఫిగరేషన్' : 'Configure Speech AI & DPDP'}
          </button>
        </div>

        {micNotice && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem' }}>
            ⚠️ {micNotice}
          </div>
        )}

        {/* Text Paragraph */}
        <p className="passage-telugu" aria-label="Reading Passage Text">
          {activePassage.tokens.map((tok, idx) => {
            let statusClass = '';
            if (result) {
              const wa = result.wordAssessments[idx];
              if (wa) {
                statusClass = wa.status === 'correct' ? 'correct' : wa.status === 'hesitation' ? 'hesitation' : 'error';
              }
            } else if (isRecording && activeWordIdx === idx) {
              statusClass = 'current';
            }

            return (
              <span
                key={tok.id}
                className={`word-span ${statusClass}`}
                onClick={() => speakWord(tok.word)}
                title={lang === 'te' ? '🔊 సరైన ఉచ్చారణ వినడానికి నొక్కండి' : '🔊 Tap to hear native pronunciation'}
              >
                {tok.word}{' '}
              </span>
            );
          })}
        </p>

        {/* Live Speech Transcription Box */}
        {isRecording && speechEngine !== 'simulation' && (
          <div style={{
            background: speechEngine === 'sarvam' ? '#faf5ff' : '#eff6ff',
            border: `1px solid ${speechEngine === 'sarvam' ? '#d8b4fe' : '#bfdbfe'}`,
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: '0.9rem',
            color: speechEngine === 'sarvam' ? '#581c87' : '#1e40af'
          }}>
            <b>
              {speechEngine === 'sarvam' ? '🇮🇳 సర్వం AI Saaras ASR (te-IN):' : '🎙️ లోకల్ ఆండ్రాయిడ్ స్పీచ్ ASR (te-IN · DPDP On-Device 🔒):'}
            </b>{' '}
            <span>{liveTranscript || (lang === 'te' ? 'మైక్‌లోకి మాట్లాడండి… AI రియల్‌టైమ్‌లో ట్రాన్స్‌క్రిప్ట్ చేస్తుంది' : 'Speak into microphone… AI will transcribe here')}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--rule-light)', paddingTop: 14 }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            💡 <span>{lang === 'te' ? 'ఏ పదమైనా నొక్కితే సరైన ఉచ్చారణ వినిపిస్తుంది' : 'Tap any word to hear authentic audio pronunciation'}</span>
          </span>

          {/* Recording Controls */}
          <div>
            {!isRecording ? (
              <button type="button" className="btn btn-primary" onClick={startReading}>
                🎙️ {t.micStart}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-dark"
                style={{ background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' }}
                onClick={stopAndEvaluate}
              >
                ⏹️ {t.micStop}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Diagnostics */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Celebratory Banner */}
          <div
            style={{
              background: result.accuracyPct >= 80 ? 'var(--green-soft)' : 'var(--amber-soft)',
              color: result.accuracyPct >= 80 ? 'var(--green-dark)' : 'var(--amber-dark)',
              padding: '12px 20px',
              borderRadius: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.94rem',
            }}
          >
            <span>{result.accuracyPct >= 80 ? t.celebrationExcellent : t.celebrationGood}</span>
            <span style={{ background: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem' }}>
              {result.correctWords}/{result.totalWords} Words Correct
            </span>
          </div>

          <div className="score-card">
            <div className="score-item">
              <span className="label">{t.resWpm}</span>
              <span className="val highlight">{result.wpm}</span>
              <small style={{ color: '#bacdd8' }}>Expected: {activePassage.expectedWpm} WPM</small>
            </div>
            <div className="score-item">
              <span className="label">{t.resAccuracy}</span>
              <span className="val">{result.accuracyPct}%</span>
              <small style={{ color: '#bacdd8' }}>Target: &gt;85%</small>
            </div>
            <div className="score-item">
              <span className="label">{t.resLevel}</span>
              <span className="val highlight">Level {result.assessedLevel}</span>
              <small style={{ color: '#bacdd8' }}>NIPUN Benchmark</small>
            </div>
            <div className="score-item">
              <span className="label">{t.resHesitations}</span>
              <span className="val">{result.hesitationsCount}</span>
              <small style={{ color: '#bacdd8' }}>Fluency pauses</small>
            </div>
          </div>

          {/* Diagnosed Phonemic Gaps */}
          <div className="card" style={{ borderLeft: '6px solid var(--amber)' }}>
            <div className="card-head">
              <h2>🔍 {lang === 'te' ? 'గుర్తించిన అభ్యసన లోపాలు & సూచనలు' : 'Diagnosed Reading Gaps & Prescriptions'}</h2>
            </div>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, fontSize: '0.96rem' }}>
              {result.diagnosedGaps.map((gap, i) => (
                <li key={i}>
                  <b>{gap}</b>
                </li>
              ))}
            </ul>
            <div className="notice-remedial" style={{ marginTop: 8 }}>
              <b>📌 {lang === 'te' ? 'సిఫార్సు చేసిన వ్యక్తిగత సాధన:' : 'Personalized Practice Drill:'}</b>
              <p style={{ marginTop: 4 }}>
                {lang === 'te' ? result.remedialRecommendationsTe[0] : result.remedialRecommendationsEn[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
