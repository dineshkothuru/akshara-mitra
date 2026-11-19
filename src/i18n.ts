export type Lang = 'te' | 'en';

const te = {
  brand: 'అక్షర మిత్ర',
  brandEn: 'Akshara Mitra',
  tagline: 'తెలంగాణ పాఠశాలల్లో తొలిమెట్టు (FLN) పఠన ప్రావీణ్యతా మూల్యాంకనం',
  dept: 'తెలంగాణ పాఠశాల విద్యాశాఖ · TISC చాలెంజ్ 06',
  gradesCoverage: 'ప్రాథమిక తరగతులు 1–5 (Grades 1–5 FLN & CwSN)',
  langSwitch: 'English',

  tabStudio: 'విద్యార్థి పఠన శాల (Reading Studio)',
  tabInclusive: 'సమ్మిళిత విద్య CwSN (RPwD Act)',
  tabDashboard: 'ఉపాధ్యాయుల డ్యాష్‌బోర్డ్ (Teacher Desk)',

  sampleNote: 'తెలంగాణ రాష్ట్ర ఎస్.సి.ఇ.ఆర్.టి (SCERT) తొలిమెట్టు FLN పాఠ్యప్రణాళిక ఆధారంగా రూపొందించిన లైవ్ డెమో.',

  // Quick steps
  step1: '1. తరగతి 1–5 పాఠ్యాంశాన్ని ఎంచుకోండి',
  step2: '2. మైక్ ఆన్ చేసి చదవండి (లేదా పదాన్ని నొక్కి వినండి)',
  step3: '3. తక్షణ పఠన వేగం (WPM) & వ్యక్తిగత సాధన పొందండి',

  selectPassage: 'పఠన పాఠ్యాంశాన్ని ఎంచుకోండి (Grades 1–5):',
  selectStudent: 'విద్యార్థిని ఎంచుకోండి:',
  currentLevel: 'FLN స్థాయి:',
  listenFullPassage: 'పాఠం మొత్తం వినండి',
  stopAudio: 'ఆపండి',

  micStart: 'మైక్రోఫోన్ ప్రారంభించండి (చదవండి)',
  micStop: 'చదవడం ముగించండి',
  micListening: 'శ్రద్ధగా వింటున్నాను… స్పష్టంగా చదవండి',

  resTitle: 'పఠన విశ్లేషణ ఫలితాలు',
  resWpm: 'పఠన వేగం (WPM)',
  resAccuracy: 'ఖచ్చితత్వం (Accuracy)',
  resLevel: 'తొలిమెట్టు స్థాయి',
  resHesitations: 'విరామాలు / తడబాట్లు',
  celebrationExcellent: '🌟 అద్భుతమైన పఠనం! ధారాళంగా చదివారు.',
  celebrationGood: '👍 మంచి ప్రయత్నం! మరికొంత సాధనతో పరిపూర్ణత.',

  wordStatus: {
    correct: 'సరైన ఉచ్చారణ',
    hesitation: 'తడబాటు / ఆలస్యం',
    vottu: 'వత్తు లోపం',
    gunintham: 'గుణింతం దీర్ఘం లోపం',
    omission: 'వదిలేసిన పదం',
    substitution: 'తప్పుగా పలికిన పదం',
  } as Record<string, string>,

  cwsnTitle: 'ప్రత్యేక అవసరాలు గల పిల్లల మూల్యాంకనం (CwSN Assessment)',
  cwsnSub: 'అంధ, వినికిడి మరియు మూగ విద్యార్థులకు సమాన పఠన అవకాశాలు (RPwD Act 2016 నిబంధనలు).',

  modes: {
    general_oral: 'సాధారణ మౌఖిక పఠనం',
    blind_aural: 'అంధ/దృష్టి లోపం (శ్రవణ-మౌఖిక)',
    deaf_visual: 'వినికిడి లోపం (నిశ్శబ్ద దృశ్య గ్రహణం)',
    mute_receptive: 'మూగ/స్పీచ్ లోపం (స్పర్శ గ్రహణం & AAC)',
  } as Record<string, string>,

  dashClassStats: 'తరగతి 1–5 సమగ్ర FLN పఠన ప్రగతి అవలోకనం',
  dashTotalStudents: 'మొత్తం విద్యార్థులు (Grades 1–5)',
  dashFluent: 'ధారాళంగా చదివేవారు (స్థాయి 4-5)',
  dashPractice: 'సాధన అవసరమైనవారు (స్థాయి 2-3)',
  dashSupport: 'ప్రత్యేక శ్రద్ధ కావలసినవారు (స్థాయి 1)',
  dashCwsn: 'సమ్మిళిత విద్యా విద్యార్థులు (CwSN)',

  studentRoster: 'విద్యార్థుల సమగ్ర పఠన ప్రగతి పట్టిక (Grades 1–5 Roster)',
  filterAllGrades: 'అన్ని తరగతులు (All Grades 1–5)',
  filterGrade: 'తరగతి',
  btnInspect: 'వివరాలు →',
  btnCopyReport: 'డయాగ్నస్టిక్ రిపోర్ట్ కాపీ చేయండి',
  reportCopied: 'నివేదిక కాపీ అయింది!',
};

const en: typeof te = {
  brand: 'Akshara Mitra',
  brandEn: 'Akshara Mitra',
  tagline: 'Foundational Literacy & Telugu AI Reading Assessment',
  dept: 'Telangana School Education Department · TISC Challenge 06',
  gradesCoverage: 'Primary Grades 1–5 (FLN & CwSN Mandate)',
  langSwitch: 'తెలుగు',

  tabStudio: 'Student Reading Studio',
  tabInclusive: 'Inclusive Ed CwSN (RPwD Act)',
  tabDashboard: 'Teacher Diagnostic Desk',

  sampleNote: 'Live demonstration mapped to Telangana SCERT Tholimettulu FLN benchmarks and NIPUN Bharat curriculum.',

  // Quick steps
  step1: '1. Select a graded passage (Grades 1 to 5)',
  step2: '2. Tap Mic to read aloud (or tap any word to hear pronunciation)',
  step3: '3. Receive instant WPM fluency, accuracy & targeted remedial drills',

  selectPassage: 'Select Reading Passage (Grades 1–5):',
  selectStudent: 'Select Student Profile:',
  currentLevel: 'FLN Benchmark Level:',
  listenFullPassage: 'Listen to Full Passage',
  stopAudio: 'Stop Audio',

  micStart: 'Start Reading (Voice Mic)',
  micStop: 'Stop & Evaluate Fluency',
  micListening: 'Listening carefully… read aloud clearly',

  resTitle: 'Diagnostic Reading Assessment',
  resWpm: 'Oral Fluency (WPM)',
  resAccuracy: 'Accuracy Rate',
  resLevel: 'Achieved FLN Level',
  resHesitations: 'Hesitations / Pauses',
  celebrationExcellent: '🌟 Excellent reading fluency! Benchmark achieved.',
  celebrationGood: '👍 Good effort! Targeted practice recommended.',

  wordStatus: {
    correct: 'Correct Pronunciation',
    hesitation: 'Hesitation / Slight Pause',
    vottu: 'Conjunct Consonant Gap (వత్తు)',
    gunintham: 'Vowel Sign Error (గుణింతం)',
    omission: 'Skipped Word',
    substitution: 'Substituted Word',
  } as Record<string, string>,

  cwsnTitle: 'Children with Special Needs (CwSN Inclusive Studio)',
  cwsnSub: 'Certified, equitable evaluation for Blind, Deaf, and Non-Verbal learners under RPwD Act 2016.',

  modes: {
    general_oral: 'General Oral Reading',
    blind_aural: 'Blind / Low-Vision (Oral-Aural)',
    deaf_visual: 'Deaf / Hard-of-Hearing (Silent Visual)',
    mute_receptive: 'Mute / Non-Verbal (Receptive Touch & AAC)',
  } as Record<string, string>,

  dashClassStats: 'Classroom Grades 1–5 FLN Progress Overview',
  dashTotalStudents: 'Total Assessed (Grades 1–5)',
  dashFluent: 'Fluent Readers (Levels 4–5)',
  dashPractice: 'Needs Practice (Levels 2–3)',
  dashSupport: 'High Support Needed (Level 1)',
  dashCwsn: 'Special Needs Learners (CwSN)',

  studentRoster: 'Student FLN Reading Roster (Grades 1–5)',
  filterAllGrades: 'All Grades (1–5)',
  filterGrade: 'Grade',
  btnInspect: 'Inspect Dossier →',
  btnCopyReport: 'Copy Diagnostic Dossier',
  reportCopied: 'Report Copied to Clipboard!',
};

export const STRINGS = { te, en };
