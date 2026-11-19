/**
 * Akshara Mitra - Foundational Literacy & Telugu AI Reading Engine
 * Built for TISC 2026 Challenge 06 (School Education Department, Government of Telangana)
 *
 * Implements NIPUN Bharat & Telangana Tholimettulu FLN Reading Benchmarks:
 * Level 1: Aksharamulu (Letter identification)
 * Level 2: Sarala Padalu (Simple 2-3 letter words)
 * Level 3: Guninthalu & Vottulu (Complex words with signs and conjuncts)
 * Level 4: Vakyalu (Sentence fluency: 25-35 WPM)
 * Level 5: Katha / Passage (Grade-level paragraph fluency: 40+ WPM with comprehension)
 */

export type FLNLevel = 1 | 2 | 3 | 4 | 5;

export type ErrorType =
  | 'correct'
  | 'omission'       // Child skipped the word / letter
  | 'gunintham'      // Vowel sign error (e.g., reading గు as గూ)
  | 'vottu'          // Conjunct consonant error (e.g., reading పిల్లి as పిలి)
  | 'substitution'   // Replaced with another word
  | 'hesitation';    // Significant pause / stutter (> 2 seconds)

export interface WordToken {
  id: string;
  word: string;
  aksharaCount: number;
  hasGunintham: boolean;
  hasVottu: boolean;
  expectedPhoneme?: string;
}

export interface WordAssessment {
  token: WordToken;
  spoken?: string;
  status: ErrorType;
  confidence: number; // 0 to 1
  pauseDurationMs?: number;
}

export interface Passage {
  id: string;
  title: string;
  titleEn: string;
  grade: number; // 1 to 5
  language: 'te' | 'en';
  level: FLNLevel;
  content: string;
  tokens: WordToken[];
  expectedWpm: number;
}

export interface ReadingAssessmentResult {
  studentId: string;
  passageId: string;
  totalWords: number;
  correctWords: number;
  omittedWords: number;
  mispronouncedWords: number;
  hesitationsCount: number;
  durationSeconds: number;
  wpm: number;                 // Oral Reading Fluency (Words Per Minute)
  accuracyPct: number;         // 0 to 100%
  assessedLevel: FLNLevel;
  levelNameTe: string;
  levelNameEn: string;
  wordAssessments: WordAssessment[];
  diagnosedGaps: string[];
  remedialRecommendationsTe: string[];
  remedialRecommendationsEn: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  gender: 'F' | 'M';
  grade: number; // Class 1 to 5
  schoolName: string;
  mandal: string;
  district: string;
  assessmentMode: 'general_oral' | 'blind_aural' | 'deaf_visual' | 'mute_receptive';
}

/**
 * Tokenizes a Telugu or English reading passage into word tokens and analyzes phonetic complexity.
 */
export function tokenizePassage(id: string, title: string, titleEn: string, grade: number, language: 'te' | 'en', level: FLNLevel, content: string): Passage {
  const rawWords = content.trim().split(/\s+/);
  const tokens: WordToken[] = rawWords.map((w, idx) => {
    // Check Telugu diacritics
    // Guninthapu Gurthulu: ా, ి, ీ, ు, ూ, ృ, ౄ, ె, ే, ై, ొ, ో, ౌ, ం, ః
    const hasGunintham = /[\u0C3E-\u0C4C\u0C02\u0C03]/.test(w);
    // Virama / Halant used in Telugu vottulu: ్
    const hasVottu = /[\u0C4D]/.test(w);

    return {
      id: `w-${idx}`,
      word: w.replace(/[.,!?;:]/g, ''),
      aksharaCount: Math.max(1, w.length),
      hasGunintham,
      hasVottu,
    };
  });

  const expectedWpm = level === 1 ? 15 : level === 2 ? 25 : level === 3 ? 35 : level === 4 ? 45 : 60;

  return {
    id,
    title,
    titleEn,
    grade,
    language,
    level,
    content,
    tokens,
    expectedWpm,
  };
}

/**
 * Normalizes words for speech recognition comparison
 */
function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[.,!?;:\"\'\-]/g, '').trim();
}

/**
 * Levenshtein Distance for acoustic phonetic tolerance
 */
function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

/**
 * Evaluates student speech against the target reading passage.
 */
export function evaluateOralReading(
  passage: Passage,
  spokenWords: string[],
  durationSeconds: number,
  studentId: string,
): ReadingAssessmentResult {
  const normSpoken = spokenWords.map(normalizeWord).filter(Boolean);
  const wordAssessments: WordAssessment[] = [];

  let correctCount = 0;
  let omittedCount = 0;
  let mispronouncedCount = 0;
  let hesitationCount = 0;

  let spokenIdx = 0;

  for (let i = 0; i < passage.tokens.length; i++) {
    const token = passage.tokens[i];
    const targetNorm = normalizeWord(token.word);
    const spoken = normSpoken[spokenIdx];

    if (!spoken) {
      // Child did not reach this word (omission)
      wordAssessments.push({
        token,
        status: 'omission',
        confidence: 0,
      });
      omittedCount++;
      continue;
    }

    if (spoken === targetNorm) {
      wordAssessments.push({
        token,
        spoken,
        status: 'correct',
        confidence: 0.98,
      });
      correctCount++;
      spokenIdx++;
    } else {
      const dist = editDistance(targetNorm, spoken);
      // Close match (hesitation / minor pronunciation variance)
      if (dist <= 1 && targetNorm.length > 3) {
        wordAssessments.push({
          token,
          spoken,
          status: 'hesitation',
          confidence: 0.85,
        });
        correctCount++; // partial credit
        hesitationCount++;
        spokenIdx++;
      } else if (token.hasVottu && dist <= 2) {
        // Specifically classify as vottu omission
        wordAssessments.push({
          token,
          spoken,
          status: 'vottu',
          confidence: 0.6,
        });
        mispronouncedCount++;
        spokenIdx++;
      } else if (token.hasGunintham && dist <= 2) {
        // Gunintham vowel length error
        wordAssessments.push({
          token,
          spoken,
          status: 'gunintham',
          confidence: 0.6,
        });
        mispronouncedCount++;
        spokenIdx++;
      } else {
        // Substitution / wrong word
        wordAssessments.push({
          token,
          spoken,
          status: 'substitution',
          confidence: 0.4,
        });
        mispronouncedCount++;
        spokenIdx++;
      }
    }
  }

  const effectiveDuration = Math.max(1, durationSeconds);
  const wpm = Math.round((correctCount / effectiveDuration) * 60);
  const accuracyPct = Math.round((correctCount / Math.max(1, passage.tokens.length)) * 100);

  // Determine FLN Level achieved based on accuracy and WPM
  let assessedLevel: FLNLevel = 1;
  let levelNameTe = 'స్థాయి 1: అక్షరాలు (Aksharamulu)';
  let levelNameEn = 'Level 1: Letter Identification';

  if (accuracyPct >= 85 && wpm >= 45) {
    assessedLevel = 5;
    levelNameTe = 'స్థాయి 5: కథా పఠనం & గ్రహణశక్తి (Story Comprehension)';
    levelNameEn = 'Level 5: Fluent Paragraph Comprehension';
  } else if (accuracyPct >= 75 && wpm >= 30) {
    assessedLevel = 4;
    levelNameTe = 'స్థాయి 4: వాక్యాల పఠనం (Sentence Fluency)';
    levelNameEn = 'Level 4: Sentence Fluency';
  } else if (accuracyPct >= 65 && wpm >= 20) {
    assessedLevel = 3;
    levelNameTe = 'స్థాయి 3: గుణింతాలు & వత్తులు (Complex Words)';
    levelNameEn = 'Level 3: Compound & Conjunct Words';
  } else if (accuracyPct >= 50) {
    assessedLevel = 2;
    levelNameTe = 'స్థాయి 2: సరళ పదాలు (Simple Words)';
    levelNameEn = 'Level 2: Simple 2-3 Letter Words';
  }

  // Diagnose Specific Learning Gaps
  const diagnosedGaps: string[] = [];
  const remedialRecommendationsTe: string[] = [];
  const remedialRecommendationsEn: string[] = [];

  const vottuErrors = wordAssessments.filter((w) => w.status === 'vottu').length;
  const guninthamErrors = wordAssessments.filter((w) => w.status === 'gunintham').length;

  if (vottuErrors >= 2) {
    diagnosedGaps.push(`ద్విత్వాక్షర/సంయుక్తాక్షర వత్తుల ఉచ్చారణలో తడబాటు (${vottuErrors} పదాలు)`);
    remedialRecommendationsTe.push('వత్తుల సాధన: త్త, ప్ప, ల్ల మరియు స్త, ష్ట వంటి సంయుక్త అక్షరాల ఫ్లాష్ కార్డ్స్ సాధన చేయించాలి.');
    remedialRecommendationsEn.push('Conjunct Consonant Practice: Daily flashcard drills on geminates (ద్విత్వ) and clusters (సంయుక్త).');
  }

  if (guninthamErrors >= 2) {
    diagnosedGaps.push(`హ్రస్వ, దీర్ఘ గుణింతాల మధ్య తేడా గుర్తించడంలో లోపం (${guninthamErrors} పదాలు)`);
    remedialRecommendationsTe.push('గుణింతాల దీర్ఘాల సాధన: కొ-కో, కి-కీ వంటి అచ్చుల సాగదీత తేడాలను బిగ్గరగా చదివించాలి.');
    remedialRecommendationsEn.push('Vowel Diacritic Practice: Audio-guided repetition distinguishing short vs long vowel signs (గు vs గూ).');
  }

  if (wpm < passage.expectedWpm * 0.6) {
    diagnosedGaps.push(`పఠన వేగం తక్కువగా ఉంది (నిమిషానికి ${wpm} పదాలు, ఆశించినది: ${passage.expectedWpm})`);
    remedialRecommendationsTe.push('ధారాళంగా చదివే సాధన: చిన్న చిన్న వాక్యాలను రోజుకు 10 నిమిషాలు వేలితో చూపుతూ చదివించాలి.');
    remedialRecommendationsEn.push('Paced Guided Reading: 10 minutes daily finger-guided sentence reading to improve pace.');
  }

  if (diagnosedGaps.length === 0) {
    diagnosedGaps.push('తరగతి స్థాయికి తగిన పఠన ప్రావీణ్యత సాధించారు.');
    remedialRecommendationsTe.push('కథా పుస్తకాలు మరియు లైబ్రరీ పుస్తకాల పఠనాన్ని ప్రోత్సహించండి.');
    remedialRecommendationsEn.push('Encourage reading higher-level storybooks and library story cards.');
  }

  return {
    studentId,
    passageId: passage.id,
    totalWords: passage.tokens.length,
    correctWords: correctCount,
    omittedWords: omittedCount,
    mispronouncedWords: mispronouncedCount,
    hesitationsCount: hesitationCount,
    durationSeconds,
    wpm,
    accuracyPct,
    assessedLevel,
    levelNameTe,
    levelNameEn,
    wordAssessments,
    diagnosedGaps,
    remedialRecommendationsTe,
    remedialRecommendationsEn,
  };
}

/**
 * Generates an official Teacher Diagnostic Slip & Parent Progress Note in Telugu & English.
 */
export function generateTeacherDiagnosticReport(
  student: StudentProfile,
  res: ReadingAssessmentResult,
  passage: Passage,
): { te: string; en: string } {
  const te = [
    `తెలంగాణ పాఠశాల విద్యాశాఖ · తొలిమెట్టు (FLN) పఠన ప్రగతి పత్రం`,
    `పాఠశాల: ${student.schoolName} · మండలం: ${student.mandal} · జిల్లా: ${student.district}`,
    `------------------------------------------------------------`,
    `విద్యార్థి పేరు: ${student.name} (రోల్ నం: ${student.rollNo})`,
    `తరగతి: ${student.grade}వ తరగతి · మూల్యాంకనం: ${passage.title}`,
    `పద్ధతి: ${
      student.assessmentMode === 'blind_aural'
        ? 'శ్రవణ-మౌఖిక పద్ధతి (అంధ/దృష్టి లోపం)'
        : student.assessmentMode === 'deaf_visual'
        ? 'నిశ్శబ్ద గ్రహణ పద్ధతి (వినికిడి లోపం)'
        : student.assessmentMode === 'mute_receptive'
        ? 'స్పర్శ గ్రహణ పద్ధతి (మూగ/స్పీచ్ లోపం)'
        : 'సాధారణ మౌఖిక పఠన AI'
    }`,
    ``,
    `పఠన ప్రావీణ్యత ఫలితాలు:`,
    `• సాధించిన స్థాయి: ${res.levelNameTe}`,
    `• పఠన వేగం (WPM): నిమిషానికి ${res.wpm} పదాలు (లక్ష్యం: ${passage.expectedWpm})`,
    `• ఖచ్చితత్వం: ${res.accuracyPct}% (${res.totalWords} పదాలలో ${res.correctWords} సరైనవి)`,
    `• తడబాట్లు / ఆపినవి: ${res.hesitationsCount} సార్లు`,
    ``,
    `గుర్తించిన అభ్యసన లోపాలు (Gaps):`,
    ...res.diagnosedGaps.map((g) => `• ${g}`),
    ``,
    `ఉపాధ్యాయుల బోధనా ప్రణాళిక & తల్లిదండ్రుల సూచనలు:`,
    ...res.remedialRecommendationsTe.map((r) => `• ${r}`),
    ``,
    `ఈ నివేదిక NIPUN భారత్ తొలిమెట్టు సూచికల ఆధారంగా ఆటోమేటిక్‌గా రూపొందించబడింది.`,
  ].join('\n');

  const en = [
    `GOVERNMENT OF TELANGANA · DEPARTMENT OF SCHOOL EDUCATION`,
    `THOLIMETTULU (FLN) FOUNDATIONAL LITERACY PROGRESS REPORT`,
    `School: ${student.schoolName} · Mandal: ${student.mandal} · District: ${student.district}`,
    `------------------------------------------------------------`,
    `Student Name: ${student.name} (Roll No: ${student.rollNo})`,
    `Class: Grade ${student.grade} · Passage Evaluated: ${passage.titleEn}`,
    `Assessment Modality: ${
      student.assessmentMode === 'blind_aural'
        ? 'Oral-Aural Auditory Mode (Visually Impaired)'
        : student.assessmentMode === 'deaf_visual'
        ? 'Silent Visual Comprehension (Hearing Impaired)'
        : student.assessmentMode === 'mute_receptive'
        ? 'Receptive Touch Literacy (Speech Impaired / Non-Verbal)'
        : 'Standard Oral Voice AI'
    }`,
    ``,
    `Assessment Metrics:`,
    `• FLN Literacy Level: ${res.levelNameEn} (${res.assessedLevel}/5)`,
    `• Oral Reading Fluency (WPM): ${res.wpm} WPM (Grade Benchmark: ${passage.expectedWpm} WPM)`,
    `• Pronunciation Accuracy: ${res.accuracyPct}% (${res.correctWords}/${res.totalWords} words correct)`,
    `• Hesitations / Stutters: ${res.hesitationsCount}`,
    ``,
    `Identified Phonemic Learning Gaps:`,
    ...res.diagnosedGaps.map((g) => `• ${g}`),
    ``,
    `Actionable Teacher Remediation Plan:`,
    ...res.remedialRecommendationsEn.map((r) => `• ${r}`),
    ``,
    `Generated dynamically following NIPUN Bharat Foundational Literacy & Numeracy guidelines.`,
  ].join('\n');

  return { te, en };
}
